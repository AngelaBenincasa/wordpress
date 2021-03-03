<?php

namespace AmeliaBooking\Application\Commands\Booking\Appointment;

use AmeliaBooking\Application\Commands\CommandHandler;
use AmeliaBooking\Application\Commands\CommandResult;
use AmeliaBooking\Application\Common\Exceptions\AccessDeniedException;
use AmeliaBooking\Application\Services\Bookable\PackageApplicationService;
use AmeliaBooking\Application\Services\Booking\AppointmentApplicationService;
use AmeliaBooking\Application\Services\Booking\BookingApplicationService;
use AmeliaBooking\Application\Services\User\UserApplicationService;
use AmeliaBooking\Domain\Collection\Collection;
use AmeliaBooking\Domain\Common\Exceptions\AuthorizationException;
use AmeliaBooking\Domain\Common\Exceptions\InvalidArgumentException;
use AmeliaBooking\Domain\Entity\Bookable\Service\Service;
use AmeliaBooking\Domain\Entity\Booking\Appointment\Appointment;
use AmeliaBooking\Domain\Entity\Booking\Appointment\CustomerBooking;
use AmeliaBooking\Domain\Entity\Entities;
use AmeliaBooking\Domain\Entity\User\AbstractUser;
use AmeliaBooking\Domain\Services\DateTime\DateTimeService;
use AmeliaBooking\Domain\Services\Settings\SettingsService;
use AmeliaBooking\Domain\ValueObjects\String\BookingStatus;
use AmeliaBooking\Infrastructure\Common\Exceptions\QueryExecutionException;
use AmeliaBooking\Infrastructure\Repository\Bookable\Service\ServiceRepository;
use AmeliaBooking\Infrastructure\Repository\Booking\Appointment\AppointmentRepository;
use Interop\Container\Exception\ContainerException;

/**
 * Class GetAppointmentsCommandHandler
 *
 * @package AmeliaBooking\Application\Commands\Booking\Appointment
 */
class GetAppointmentsCommandHandler extends CommandHandler
{
    /**
     * @param GetAppointmentsCommand $command
     *
     * @return CommandResult
     *
     * @throws InvalidArgumentException
     * @throws QueryExecutionException
     * @throws AccessDeniedException
     * @throws ContainerException
     */
    public function handle(GetAppointmentsCommand $command)
    {
        $result = new CommandResult();

        /** @var AppointmentRepository $appointmentRepository */
        $appointmentRepository = $this->container->get('domain.booking.appointment.repository');

        /** @var ServiceRepository $serviceRepository */
        $serviceRepository = $this->container->get('domain.bookable.service.repository');

        /** @var PackageApplicationService $packageAS */
        $packageAS = $this->container->get('application.bookable.package');

        /** @var SettingsService $settingsDS */
        $settingsDS = $this->container->get('domain.settings.service');

        /** @var UserApplicationService $userAS */
        $userAS = $this->container->get('application.user.service');

        /** @var BookingApplicationService $bookingAS */
        $bookingAS = $this->container->get('application.booking.booking.service');

        /** @var AppointmentApplicationService $appointmentAS */
        $appointmentAS = $this->container->get('application.booking.appointment.service');

        $params = $command->getField('params');

        $isCabinetPage = $command->getPage() === 'cabinet';

        $isCabinetPackageRequest = $isCabinetPage && isset($params['activePackages']);

        try {
            /** @var AbstractUser $user */
            $user = $userAS->authorization($isCabinetPage ? $command->getToken() : null, $command->getCabinetType());
        } catch (AuthorizationException $e) {
            $result->setResult(CommandResult::RESULT_ERROR);
            $result->setData(
                [
                    'reauthorize' => true
                ]
            );

            return $result;
        }

        $readOthers = $this->container->getPermissionsService()->currentUserCanReadOthers(Entities::APPOINTMENTS);

        if (!empty($params['dates'])) {
            !empty($params['dates'][0]) ? $params['dates'][0] .= ' 00:00:00' : null;
            !empty($params['dates'][1]) ? $params['dates'][1] .= ' 23:59:59' : null;
        }

        $availablePackageBookings = [];

        $periodsAppointmentsCount = $appointmentRepository->getPeriodAppointmentsCount($params);

        $periodsAppointmentsApprovedCount = $appointmentRepository->getPeriodAppointmentsCount(
            array_merge($params, ['status' => BookingStatus::APPROVED])
        );

        $periodsAppointmentsPendingCount = $appointmentRepository->getPeriodAppointmentsCount(
            array_merge($params, ['status' => BookingStatus::PENDING])
        );

        $upcomingAppointmentsLimit = $settingsDS->getSetting('general', 'appointmentsPerPage');

        /** @var Collection $periodAppointments */
        $periodAppointments = $appointmentRepository->getPeriodAppointments($params, $upcomingAppointmentsLimit);

        $appointmentsIds = [];

        /** @var Appointment $appointment */
        foreach ($periodAppointments->getItems() as $appointment) {
            $appointmentsIds[] = $appointment->getId()->getValue();
        }

        /** @var Collection $appointments */
        $appointments = new Collection();

        if (!$isCabinetPackageRequest) {
            $appointments = $appointmentRepository->getFiltered(
                array_merge(
                    $params,
                    [
                        'ids'           => $appointmentsIds,
                        'skipServices'  => isset($params['skipServices']) ? $params['skipServices'] : false,
                        'skipProviders' => isset($params['skipProviders']) ? $params['skipProviders'] : false,
                    ]
                )
            );
        } else {
            $availablePackageBookings = $packageAS->getPackageAvailability(
                $appointments,
                [
                    'customerId' => $user->getId()->getValue(),
                ]
            );
        }

        if (!empty($params['search']) && $appointments->length()) {
            $appointmentAS->filterAppointmentsBySearchString($appointments, $params['search']);
        }

        /** @var Collection $services */
        $services = $serviceRepository->getAllIndexedById();

        if (!$isCabinetPage) {
            $packageAS->setPackageBookingsForAppointments($appointments);
        }

        $occupiedTimes = [];

        $currentDateTime = DateTimeService::getNowDateTimeObject();

        $groupedAppointments = [];

        /** @var Appointment $appointment */
        foreach ($appointments->getItems() as $appointment) {
            /** @var Service $service */
            $service = $services->getItem($appointment->getServiceId()->getValue());

            $bookingsCount = 0;

            /** @var CustomerBooking $booking */
            foreach ($appointment->getBookings()->getItems() as $booking) {
                // fix for wrongly saved JSON
                if ($booking->getCustomFields() &&
                    json_decode($booking->getCustomFields()->getValue(), true) === null
                ) {
                    $booking->setCustomFields(null);
                }

                if ($bookingAS->isBookingApprovedOrPending($booking->getStatus()->getValue())) {
                    $bookingsCount++;
                }
            }

            $providerId = $appointment->getProviderId()->getValue();

            // skip appointments/bookings for other customers if user is customer, and remember that time/date values
            if ($userAS->isCustomer($user)) {
                /** @var CustomerBooking $booking */
                foreach ($appointment->getBookings()->getItems() as $bookingKey => $booking) {
                    if (!$user->getId() || $booking->getCustomerId()->getValue() !== $user->getId()->getValue()) {
                        $appointment->getBookings()->deleteItem($bookingKey);
                    }
                }

                if ($appointment->getBookings()->length() === 0) {
                    $serviceTimeBefore = $service->getTimeBefore() ?
                        $service->getTimeBefore()->getValue() : 0;

                    $serviceTimeAfter = $service->getTimeAfter() ?
                        $service->getTimeAfter()->getValue() : 0;

                    $occupiedTimeStart = DateTimeService::getCustomDateTimeObject(
                        $appointment->getBookingStart()->getValue()->format('Y-m-d H:i:s')
                    )->modify('-' . $serviceTimeBefore . ' second')->format('H:i:s');

                    $occupiedTimeEnd = DateTimeService::getCustomDateTimeObject(
                        $appointment->getBookingEnd()->getValue()->format('Y-m-d H:i:s')
                    )->modify('+' . $serviceTimeAfter . ' second')->format('H:i:s');

                    $occupiedTimes[$appointment->getBookingStart()->getValue()->format('Y-m-d')][] =
                        [
                            'employeeId' => $providerId,
                            'startTime'  => $occupiedTimeStart,
                            'endTime'    => $occupiedTimeEnd,
                        ];

                    continue;
                }
            }

            // skip appointments for other providers if user is provider
            if ((!$readOthers || $isCabinetPage) &&
                $user->getType() === Entities::PROVIDER &&
                $user->getId()->getValue() !== $providerId
            ) {
                continue;
            }

            $minimumCancelTimeInSeconds = $settingsDS
                ->getEntitySettings($service->getSettings())
                ->getGeneralSettings()
                ->getMinimumTimeRequirementPriorToCanceling();

            $minimumCancelTime = DateTimeService::getCustomDateTimeObject(
                $appointment->getBookingStart()->getValue()->format('Y-m-d H:i:s')
            )->modify("-{$minimumCancelTimeInSeconds} seconds");

            $date = $appointment->getBookingStart()->getValue()->format('Y-m-d');

            $cancelable = $currentDateTime <= $minimumCancelTime;

            if ($isCabinetPage &&
                $settingsDS->getSetting('general', 'showClientTimeZone') &&
                $userAS->isCustomer($user)
            ) {
                    $appointment->getBookingStart()->getValue()->setTimezone(new \DateTimeZone('UTC'));
                    $appointment->getBookingEnd()->getValue()->setTimezone(new \DateTimeZone('UTC'));
            }

            $groupedAppointments[$date]['date'] = $date;

            $groupedAppointments[$date]['appointments'][] = array_merge(
                $appointment->toArray(),
                [
                    'cancelable'    => $cancelable,
                    'past'          => $currentDateTime >= $appointment->getBookingStart()->getValue()
                ]
            );
        }

        $result->setResult(CommandResult::RESULT_SUCCESS);
        $result->setMessage('Successfully retrieved appointments');
        $result->setData(
            [
                Entities::APPOINTMENTS     => $groupedAppointments,
                'availablePackageBookings' => $availablePackageBookings,
                'occupied'                 => $occupiedTimes,
                'total'                    => $periodsAppointmentsCount,
                'totalApproved'            => $periodsAppointmentsApprovedCount,
                'totalPending'             => $periodsAppointmentsPendingCount,
            ]
        );

        return $result;
    }
}
