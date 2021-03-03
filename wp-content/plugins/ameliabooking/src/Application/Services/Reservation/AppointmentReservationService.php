<?php

namespace AmeliaBooking\Application\Services\Reservation;

use AmeliaBooking\Application\Services\Bookable\BookableApplicationService;
use AmeliaBooking\Application\Services\Bookable\PackageApplicationService;
use AmeliaBooking\Application\Services\Booking\AppointmentApplicationService;
use AmeliaBooking\Application\Services\TimeSlot\TimeSlotService;
use AmeliaBooking\Domain\Collection\Collection;
use AmeliaBooking\Domain\Common\Exceptions\BookingCancellationException;
use AmeliaBooking\Domain\Common\Exceptions\BookingUnavailableException;
use AmeliaBooking\Domain\Common\Exceptions\CustomerBookedException;
use AmeliaBooking\Domain\Common\Exceptions\InvalidArgumentException;
use AmeliaBooking\Domain\Common\Exceptions\PackageBookingUnavailableException;
use AmeliaBooking\Domain\Entity\Bookable\AbstractBookable;
use AmeliaBooking\Domain\Entity\Bookable\Service\Extra;
use AmeliaBooking\Domain\Entity\Bookable\Service\Service;
use AmeliaBooking\Domain\Entity\Booking\Appointment\Appointment;
use AmeliaBooking\Domain\Entity\Booking\Appointment\CustomerBooking;
use AmeliaBooking\Domain\Entity\Booking\Appointment\CustomerBookingExtra;
use AmeliaBooking\Domain\Entity\Booking\Reservation;
use AmeliaBooking\Domain\Entity\Entities;
use AmeliaBooking\Domain\Entity\User\AbstractUser;
use AmeliaBooking\Domain\Factory\Booking\Appointment\AppointmentFactory;
use AmeliaBooking\Domain\Factory\Booking\Appointment\CustomerBookingFactory;
use AmeliaBooking\Domain\Services\Booking\AppointmentDomainService;
use AmeliaBooking\Domain\Services\DateTime\DateTimeService;
use AmeliaBooking\Domain\Services\Settings\SettingsService;
use AmeliaBooking\Domain\ValueObjects\BooleanValueObject;
use AmeliaBooking\Domain\ValueObjects\Number\Integer\Id;
use AmeliaBooking\Domain\ValueObjects\String\BookingStatus;
use AmeliaBooking\Domain\ValueObjects\String\PaymentType;
use AmeliaBooking\Domain\ValueObjects\String\Status;
use AmeliaBooking\Infrastructure\Common\Exceptions\NotFoundException;
use AmeliaBooking\Infrastructure\Common\Exceptions\QueryExecutionException;
use AmeliaBooking\Infrastructure\Repository\Booking\Appointment\AppointmentRepository;
use AmeliaBooking\Infrastructure\Repository\Booking\Appointment\CustomerBookingRepository;

/**
 * Class AppointmentReservationService
 *
 * @package AmeliaBooking\Application\Services\Reservation
 */
class AppointmentReservationService extends AbstractReservationService
{
    /**
     * @return string
     */
    public function getType()
    {
        return Entities::APPOINTMENT;
    }

    /**
     * @param array $appointmentData
     * @param bool  $inspectTimeSlot
     * @param bool  $save
     *
     * @return Reservation
     *
     * @throws \Slim\Exception\ContainerValueNotFoundException
     * @throws InvalidArgumentException
     * @throws QueryExecutionException
     * @throws \Exception
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function book($appointmentData, $inspectTimeSlot, $save)
    {

        /** @var Reservation $reservation */
        $reservation = new Reservation();

        $this->bookSingle($reservation, $appointmentData, $inspectTimeSlot, $save);

        /** @var Service $bookable */
        $bookable = $reservation->getBookable();

        /** @var Collection $recurringReservations */
        $recurringReservations = new Collection();

        if (!empty($appointmentData['recurring'])) {
            foreach ($appointmentData['recurring'] as $index => $recurringData) {
                $recurringAppointmentData = array_merge(
                    $appointmentData,
                    [
                        'providerId'   => $recurringData['providerId'],
                        'locationId'   => $recurringData['locationId'],
                        'bookingStart' => $recurringData['bookingStart'],
                        'parentId'     => $reservation->getReservation()->getId() ?
                            $reservation->getReservation()->getId()->getValue() : null,
                        'recurring'    => [],
                        'package'      => []
                    ]
                );

                if (!empty($recurringAppointmentData['bookings'][0]['utcOffset'])) {
                    $recurringAppointmentData['bookings'][0]['utcOffset'] = $recurringData['utcOffset'];
                }

                if (empty($recurringData['useCoupon'])) {
                    $recurringAppointmentData['couponCode'] = null;
                    $recurringAppointmentData['bookings'][0]['coupon'] = null;
                    $recurringAppointmentData['bookings'][0]['couponId'] = null;
                }

                if ($index >= $bookable->getRecurringPayment()->getValue()) {
                    $recurringAppointmentData['payment']['gateway'] = PaymentType::ON_SITE;
                }

                try {
                    /** @var Reservation $recurringReservation */
                    $recurringReservation = new Reservation();

                    $this->bookSingle($recurringReservation, $recurringAppointmentData, $inspectTimeSlot, $save);
                } catch (\Exception $e) {
                    if ($save) {
                        /** @var Reservation $recurringReservation */
                        foreach ($recurringReservations->getItems() as $recurringReservation) {
                            $this->deleteReservation($recurringReservation);
                        }

                        $this->deleteReservation($reservation);
                    }

                    throw $e;
                }

                $recurringReservations->addItem($recurringReservation);
            }
        }

        $reservation->setRecurring($recurringReservations);
        $reservation->setPackageCustomerServices(new Collection());
        $reservation->setPackageReservations(new Collection());

        return $reservation;
    }

    /**
     * @param array $reservations
     * @return array
     *
     * @throws InvalidArgumentException
     * @throws QueryExecutionException
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function getUnavailableSlotsInfo($reservations)
    {
        $result = [];

        /** @var TimeSlotService $timeSlotService */
        $timeSlotService = $this->container->get('application.timeSlot.service');

        foreach ($reservations as $index => $data) {
            $nextBookingStart = DateTimeService::getCustomDateTimeObject($data['bookingStart']);

            if (!$timeSlotService->isSlotFree(
                (int)$data['serviceId'],
                $nextBookingStart,
                (int)$data['providerId'],
                [],
                null,
                1,
                true
            )) {
                $result[] = [
                    'serviceId'    => (int)$data['serviceId'],
                    'bookingStart' => $nextBookingStart->format('Y-m-d H:i:s'),
                ];
            }
        }

        return $result;
    }

    /**
     * @param Reservation $reservation
     * @param array       $appointmentData
     * @param bool        $inspectTimeSlot
     * @param bool        $save
     *
     * @return void
     *
     * @throws \AmeliaBooking\Infrastructure\Common\Exceptions\NotFoundException
     * @throws \AmeliaBooking\Domain\Common\Exceptions\BookingUnavailableException
     * @throws \AmeliaBooking\Domain\Common\Exceptions\CustomerBookedException
     * @throws \Slim\Exception\ContainerValueNotFoundException
     * @throws InvalidArgumentException
     * @throws QueryExecutionException
     * @throws \Exception
     * @throws \Interop\Container\Exception\ContainerException
     */
    public function bookSingle($reservation, $appointmentData, $inspectTimeSlot, $save)
    {
        /** @var AppointmentApplicationService $appointmentAS */
        $appointmentAS = $this->container->get('application.booking.appointment.service');
        /** @var AppointmentDomainService $appointmentDS */
        $appointmentDS = $this->container->get('domain.booking.appointment.service');
        /** @var AppointmentRepository $appointmentRepo */
        $appointmentRepo = $this->container->get('domain.booking.appointment.repository');
        /** @var BookableApplicationService $bookableAS */
        $bookableAS = $this->container->get('application.bookable.service');
        /** @var SettingsService $settingsDS */
        $settingsDS = $this->container->get('domain.settings.service');

        $appointmentStatusChanged = false;

        /** @var Service $service */
        $service = $bookableAS->getAppointmentService($appointmentData['serviceId'], $appointmentData['providerId']);

        if ($service->getStatus()->getValue() === Status::HIDDEN) {
            throw new BookingUnavailableException('');
        }

        /** @var Collection $existingAppointments */
        $existingAppointments = $appointmentRepo->getFiltered([
            'dates'     => [$appointmentData['bookingStart'], $appointmentData['bookingStart']],
            'services'  => [$appointmentData['serviceId']],
            'providers' => [$appointmentData['providerId']]
        ]);

        $bookingStatus = $settingsDS
            ->getEntitySettings($service->getSettings())
            ->getGeneralSettings()
            ->getDefaultAppointmentStatus();

        $appointmentData['bookings'][0]['status'] = $bookingStatus;

        /** @var Appointment $existingAppointment */
        $existingAppointment = $existingAppointments->length() ?
            $existingAppointments->getItem($existingAppointments->keys()[0]) : null;

        if ($existingAppointment) {
            /** @var Appointment $appointment */
            $appointment = AppointmentFactory::create($existingAppointment->toArray());

            if (!empty($appointmentData['locationId'])) {
                $appointment->setLocationId(new Id($appointmentData['locationId']));
            }

            /** @var CustomerBooking $booking */
            $booking = CustomerBookingFactory::create($appointmentData['bookings'][0]);
            $booking->setAppointmentId($appointment->getId());
            $booking->setPrice($appointment->getService()->getPrice());

            /** @var CustomerBookingExtra $bookingExtra */
            foreach ($booking->getExtras()->getItems() as $bookingExtra) {
                /** @var Extra $selectedExtra */
                $selectedExtra = $service->getExtras()->getItem($bookingExtra->getExtraId()->getValue());

                $bookingExtra->setPrice($selectedExtra->getPrice());
            }
        } else {
            /** @var Appointment $appointment */
            $appointment = $appointmentAS->build($appointmentData, $service);

            /** @var CustomerBooking $booking */
            $booking = $appointment->getBookings()->getItem($appointment->getBookings()->keys()[0]);
        }

        if ($inspectTimeSlot) {
            /** @var TimeSlotService $timeSlotService */
            $timeSlotService = $this->container->get('application.timeSlot.service');

            // if not new appointment, check if customer has already made booking
            if ($appointment->getId() !== null) {
                foreach ($appointment->getBookings()->keys() as $bookingKey) {
                    /** @var CustomerBooking $customerBooking */
                    $customerBooking = $appointment->getBookings()->getItem($bookingKey);

                    if ($customerBooking->getStatus()->getValue() !== BookingStatus::CANCELED &&
                        $booking->getCustomerId()->getValue() === $customerBooking->getCustomerId()->getValue()) {
                        throw new CustomerBookedException('');
                    }
                }
            }

            $selectedExtras = [];

            foreach ($booking->getExtras()->keys() as $extraKey) {
                $selectedExtras[] = [
                    'id'       => $booking->getExtras()->getItem($extraKey)->getExtraId()->getValue(),
                    'quantity' => $booking->getExtras()->getItem($extraKey)->getQuantity()->getValue(),
                ];
            }

            if (!$timeSlotService->isSlotFree(
                $appointment->getServiceId()->getValue(),
                $appointment->getBookingStart()->getValue(),
                $appointment->getProviderId()->getValue(),
                $selectedExtras,
                null,
                $booking->getPersons()->getValue(),
                true
            )) {
                throw new BookingUnavailableException('');
            }

            if ($booking->getPackageCustomerService() && $booking->getPackageCustomerService()->getId()) {
                /** @var PackageApplicationService $packageApplicationService */
                $packageApplicationService = $this->container->get('application.bookable.package');

                if (!$packageApplicationService->isBookingAvailableForPurchasedPackage($booking)) {
                    throw new PackageBookingUnavailableException('');
                }
            }
        }

        if ($save) {
            if ($existingAppointment) {
                $appointment->getBookings()->addItem($booking);
                $bookingsCount = $appointmentDS->getBookingsStatusesCount($appointment);
                $appointmentStatus = $appointmentDS->getAppointmentStatusWhenEditAppointment($service, $bookingsCount);
                $appointment->setStatus(new BookingStatus($appointmentStatus));
                $appointmentStatusChanged = $appointmentAS->isAppointmentStatusChanged(
                    $appointment,
                    $existingAppointment
                );

                try {
                    $appointmentAS->update($existingAppointment, $appointment, $service, $appointmentData['payment']);
                } catch (QueryExecutionException $e) {
                    throw $e;
                }
            } else {
                try {
                    $appointmentAS->add($appointment, $service, !empty($appointmentData['payment']) ? $appointmentData['payment'] : null);
                } catch (QueryExecutionException $e) {
                    throw $e;
                }
            }
        }

        $reservation->setCustomer($booking->getCustomer());
        $reservation->setBookable($service);
        $reservation->setBooking($booking);
        $reservation->setReservation($appointment);
        $reservation->setIsStatusChanged(new BooleanValueObject($appointmentStatusChanged));
    }

    /**
     * @param CustomerBooking $booking
     * @param string          $requestedStatus
     *
     * @return array
     *
     * @throws \Slim\Exception\ContainerException
     * @throws \InvalidArgumentException
     * @throws \Slim\Exception\ContainerValueNotFoundException
     * @throws InvalidArgumentException
     * @throws NotFoundException
     * @throws QueryExecutionException
     * @throws \Interop\Container\Exception\ContainerException
     * @throws \AmeliaBooking\Infrastructure\Common\Exceptions\NotFoundException
     * @throws BookingCancellationException
     */
    public function updateStatus($booking, $requestedStatus)
    {
        /** @var CustomerBookingRepository $bookingRepository */
        $bookingRepository = $this->container->get('domain.booking.customerBooking.repository');
        /** @var AppointmentRepository $appointmentRepository */
        $appointmentRepository = $this->container->get('domain.booking.appointment.repository');
        /** @var AppointmentDomainService $appointmentDS */
        $appointmentDS = $this->container->get('domain.booking.appointment.service');
        /** @var BookableApplicationService $bookableAS */
        $bookableAS = $this->container->get('application.bookable.service');
        /** @var SettingsService $settingsDS */
        $settingsDS = $this->container->get('domain.settings.service');

        /** @var Appointment $appointment */
        $appointment = $appointmentRepository->getById($booking->getAppointmentId()->getValue());

        /** @var Service $service */
        $service = $bookableAS->getAppointmentService(
            $appointment->getServiceId()->getValue(),
            $appointment->getProviderId()->getValue()
        );

        if ($requestedStatus === BookingStatus::CANCELED) {
            $minimumCancelTime = $settingsDS
                ->getEntitySettings($service->getSettings())
                ->getGeneralSettings()
                ->getMinimumTimeRequirementPriorToCanceling();

            $this->inspectMinimumCancellationTime($appointment->getBookingStart()->getValue(), $minimumCancelTime);
        }

        $appointment->getBookings()->getItem($booking->getId()->getValue())->setStatus(
            new BookingStatus($requestedStatus)
        );

        $booking->setStatus(new BookingStatus($requestedStatus));

        $bookingsCount = $appointmentDS->getBookingsStatusesCount($appointment);

        $appointmentStatus = $appointmentDS->getAppointmentStatusWhenChangingBookingStatus(
            $service,
            $bookingsCount,
            $appointment->getStatus()->getValue()
        );

        $appointmentRepository->beginTransaction();

        try {
            $bookingRepository->updateStatusById($booking->getId()->getValue(), $requestedStatus);
            $appointmentRepository->updateStatusById($booking->getAppointmentId()->getValue(), $appointmentStatus);
        } catch (QueryExecutionException $e) {
            $appointmentRepository->rollback();
            throw $e;
        }

        $appStatusChanged = false;

        if ($appointment->getStatus()->getValue() !== $appointmentStatus) {
            $appointment->setStatus(new BookingStatus($appointmentStatus));
            $appStatusChanged = true;
        }

        $appointmentRepository->commit();

        return [
            Entities::APPOINTMENT      => $appointment->toArray(),
            'appointmentStatusChanged' => $appStatusChanged,
            Entities::BOOKING          => $booking->toArray()
        ];
    }

    /**
     * @param Appointment      $reservation
     * @param CustomerBooking  $booking
     * @param Service          $bookable
     *
     * @return array
     * @throws InvalidArgumentException
     */
    public function getBookingPeriods($reservation, $booking, $bookable)
    {
        $duration = $bookable->getDuration()->getValue();

        /** @var CustomerBookingExtra $bookingExtra */
        foreach ($booking->getExtras()->getItems() as $bookingExtra) {
            /** @var Extra $extra */
            $extra = $bookable->getExtras()->getItem($bookingExtra->getExtraId()->getValue());

            $duration += ($extra->getDuration() ? $extra->getDuration()->getValue() : 0);
        }

        return [
            [
                'start' => DateTimeService::getCustomDateTimeInUtc(
                    $reservation->getBookingStart()->getValue()->format('Y-m-d H:i:s')
                ),
                'end'   => DateTimeService::getCustomDateTimeInUtc(
                    DateTimeService::getCustomDateTimeObject(
                        $reservation->getBookingStart()->getValue()->format('Y-m-d H:i:s')
                    )->modify("+{$duration} seconds")->format('Y-m-d H:i:s')
                )
            ]
        ];
    }

    /**
     * @param array $data
     *
     * @return AbstractBookable
     *
     * @throws \AmeliaBooking\Domain\Common\Exceptions\InvalidArgumentException
     * @throws \Slim\Exception\ContainerValueNotFoundException
     * @throws QueryExecutionException
     * @throws NotFoundException
     */
    public function getBookableEntity($data)
    {
        /** @var BookableApplicationService $bookableAS */
        $bookableAS = $this->container->get('application.bookable.service');

        return $bookableAS->getAppointmentService($data['serviceId'], $data['providerId']);
    }

    /**
     * @param Service $bookable
     *
     * @return boolean
     */
    public function isAggregatedPrice($bookable)
    {
        return $bookable->getAggregatedPrice()->getValue();
    }

    /**
     * @param BooleanValueObject $bookableAggregatedPrice
     * @param BooleanValueObject $extraAggregatedPrice
     *
     * @return boolean
     */
    public function isExtraAggregatedPrice($extraAggregatedPrice, $bookableAggregatedPrice)
    {
        return $extraAggregatedPrice === null ?
            $bookableAggregatedPrice->getValue() : $extraAggregatedPrice->getValue();
    }

    /**
     * @param Reservation $reservation
     * @param string      $paymentGateway
     * @param array       $requestData
     *
     * @return array
     *
     * @throws InvalidArgumentException
     */
    public function getWooCommerceData($reservation, $paymentGateway, $requestData)
    {
        /** @var Appointment $appointment */
        $appointment = $reservation->getReservation();

        /** @var Service $service */
        $service = $reservation->getBookable();

        /** @var AbstractUser $customer */
        $customer = $reservation->getCustomer();

        /** @var CustomerBooking $booking */
        $booking = $reservation->getBooking();

        $recurringAppointmentsData = [];

        if ($reservation->getRecurring()) {
            /** @var Reservation $recurringReservation */
            foreach ($reservation->getRecurring()->getItems() as $key => $recurringReservation) {
                $recurringAppointmentData = [
                    'providerId'         => $recurringReservation->getReservation()->getProviderId()->getValue(),
                    'locationId'         => $recurringReservation->getReservation()->getLocationId() ?
                        $recurringReservation->getReservation()->getLocationId()->getValue() : null,
                    'bookingStart'       =>
                        $recurringReservation->getReservation()->getBookingStart()->getValue()->format('Y-m-d H:i:s'),
                    'bookingEnd'         =>
                        $recurringReservation->getReservation()->getBookingEnd()->getValue()->format('Y-m-d H:i:s'),
                    'notifyParticipants' => $recurringReservation->getReservation()->isNotifyParticipants(),
                    'status'             => $recurringReservation->getReservation()->getStatus()->getValue(),
                ];

                $recurringAppointmentData['couponId'] = !$recurringReservation->getBooking()->getCoupon() ? null :
                    $recurringReservation->getBooking()->getCoupon()->getId()->getValue();

                $recurringAppointmentData['couponCode'] = !$recurringReservation->getBooking()->getCoupon() ? null :
                    $recurringReservation->getBooking()->getCoupon()->getCode()->getValue();

                $recurringAppointmentData['useCoupon'] = $recurringReservation->getBooking()->getCoupon() !== null;

                $recurringAppointmentsData[] = $recurringAppointmentData;
            }
        }

        $info = [
            'type'               => Entities::APPOINTMENT,
            'serviceId'          => $service->getId()->getValue(),
            'providerId'         => $appointment->getProviderId()->getValue(),
            'locationId'         => $appointment->getLocationId() ? $appointment->getLocationId()->getValue() : null,
            'name'               => $service->getName()->getValue(),
            'couponId'           => $booking->getCoupon() ? $booking->getCoupon()->getId()->getValue() : '',
            'couponCode'         => $booking->getCoupon() ? $booking->getCoupon()->getCode()->getValue() : '',
            'bookingStart'       => $appointment->getBookingStart()->getValue()->format('Y-m-d H:i'),
            'bookingEnd'         => $appointment->getBookingEnd()->getValue()->format('Y-m-d H:i'),
            'status'             => $appointment->getStatus()->getValue(),
            'dateTimeValues'     => [
                [
                    'start' => $appointment->getBookingStart()->getValue()->format('Y-m-d H:i'),
                    'end'   => $appointment->getBookingEnd()->getValue()->format('Y-m-d H:i'),
                ]
            ],
            'notifyParticipants' => $appointment->isNotifyParticipants(),
            'bookings'           => [
                [
                    'customerId'   => $customer->getId() ? $customer->getId()->getValue() : null,
                    'customer'     => [
                        'email'      => $customer->getEmail()->getValue(),
                        'externalId' => $customer->getExternalId() ? $customer->getExternalId()->getValue() : null,
                        'firstName'  => $customer->getFirstName()->getValue(),
                        'id'         => $customer->getId() ? $customer->getId()->getValue() : null,
                        'lastName'   => $customer->getLastName()->getValue(),
                        'phone'      => $customer->getPhone()->getValue()
                    ],
                    'persons'      => $booking->getPersons()->getValue(),
                    'extras'       => [],
                    'status'       => $booking->getStatus()->getValue(),
                    'utcOffset'    => $booking->getUtcOffset() ? $booking->getUtcOffset()->getValue() : null,
                    'customFields' => $booking->getCustomFields() ?
                        json_decode($booking->getCustomFields()->getValue(), true) : null
                ]
            ],
            'payment'            => [
                'gateway' => $paymentGateway
            ],
            'recurring'          => $recurringAppointmentsData,
            'package'            => [],
        ];

        foreach ($booking->getExtras()->keys() as $extraKey) {
            /** @var CustomerBookingExtra $bookingExtra */
            $bookingExtra = $booking->getExtras()->getItem($extraKey);

            $info['bookings'][0]['extras'][] = [
                'extraId'  => $bookingExtra->getExtraId()->getValue(),
                'quantity' => $bookingExtra->getQuantity()->getValue()
            ];
        }

        return $info;
    }

    /**
     * @param int $id
     *
     * @return Appointment
     *
     * @throws \Slim\Exception\ContainerValueNotFoundException
     * @throws QueryExecutionException
     * @throws InvalidArgumentException
     */
    public function getReservationByBookingId($id)
    {
        /** @var AppointmentRepository $appointmentRepository */
        $appointmentRepository = $this->container->get('domain.booking.appointment.repository');

        /** @var Appointment $appointment */
        return $appointmentRepository->getByBookingId($id);
    }

    /**
     * @param Appointment $reservation
     * @param Service     $bookable
     * @param \DateTime   $dateTime
     *
     * @return boolean
     *
     */
    public function isBookable($reservation, $bookable, $dateTime)
    {
        return true;
    }

    /**
     * @param Reservation  $reservation
     *
     * @return float
     *
     * @throws InvalidArgumentException
     */
    public function getReservationPaymentAmount($reservation)
    {
        /** @var Service $bookable */
        $bookable = $reservation->getBookable();

        $paymentAmount = $this->getPaymentAmount($reservation->getBooking(), $bookable);

        /** @var Reservation $recurringReservation */
        foreach ($reservation->getRecurring()->getItems() as $index => $recurringReservation) {
            /** @var Service $recurringBookable */
            $recurringBookable = $recurringReservation->getBookable();

            if ($index < $recurringBookable->getRecurringPayment()->getValue()) {
                $paymentAmount += $this->getPaymentAmount($recurringReservation->getBooking(), $recurringBookable);
            }
        }

        return $paymentAmount;
    }
}
