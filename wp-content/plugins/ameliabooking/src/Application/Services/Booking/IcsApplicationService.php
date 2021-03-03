<?php

namespace AmeliaBooking\Application\Services\Booking;

use AmeliaBooking\Domain\Entity\Bookable\Service\Service;
use AmeliaBooking\Domain\Entity\Booking\Appointment\Appointment;
use AmeliaBooking\Domain\Entity\Booking\Appointment\CustomerBooking;
use AmeliaBooking\Domain\Entity\Entities;
use AmeliaBooking\Domain\Services\Reservation\ReservationServiceInterface;
use AmeliaBooking\Infrastructure\Common\Exceptions\QueryExecutionException;
use Eluceo\iCal\Component\Calendar;
use Eluceo\iCal\Component\Event;
use AmeliaBooking\Infrastructure\Common\Container;
use Exception;
use Interop\Container\Exception\ContainerException;
use AmeliaBooking\Domain\Common\Exceptions\InvalidArgumentException;

/**
 * Class IcsApplicationService
 *
 * @package AmeliaBooking\Application\Services\Booking
 */
class IcsApplicationService
{
    private $container;

    /**
     * IcsApplicationService constructor.
     *
     * @param Container $container
     */
    public function __construct(Container $container)
    {
        $this->container = $container;
    }

    /**
     * @param string $type
     * @param int    $id
     * @param array  $recurring
     * @param bool   $separateCalendars
     *
     * @return array
     * @throws InvalidArgumentException
     * @throws QueryExecutionException
     * @throws ContainerException
     * @throws Exception
     */
    public function getIcsData($type, $id, $recurring, $separateCalendars)
    {
        $type = $type ?: Entities::APPOINTMENT;

        /** @var ReservationServiceInterface $reservationService */
        $reservationService = $this->container->get('application.reservation.service')->get($type);

        /** @var Appointment|Event $reservation */
        $reservation = $reservationService->getReservationByBookingId((int)$id);

        /** @var CustomerBooking $booking */
        $booking = $reservation->getBookings()->getItem((int)$id);

        /** @var Service|Event $reservation */
        $bookable = null;

        switch ($type) {
            case Entities::APPOINTMENT:
                /** @var Service $bookable */
                $bookable = $reservationService->getBookableEntity(
                    [
                        'serviceId' => $reservation->getServiceId()->getValue(),
                        'providerId' => $reservation->getProviderId()->getValue()
                    ]
                );

                break;

            case Entities::EVENT:
                /** @var Event $bookable */
                $bookable = $reservationService->getBookableEntity(
                    [
                        'eventId' => $reservation->getId()->getValue()
                    ]
                );

                break;
        }

        $periodsData = [
            [
                'name'    => $bookable->getName()->getValue(),
                'periods' => $reservationService->getBookingPeriods($reservation, $booking, $bookable)
            ]
        ];

        $recurring = $recurring ?: [];

        foreach ($recurring as $recurringId) {
            /** @var Appointment $recurringReservation */
            $recurringReservation = $reservationService->getReservationByBookingId((int)$recurringId);

            /** @var CustomerBooking $recurringBooking */
            $recurringBooking = $recurringReservation->getBookings()->getItem(
                (int)$recurringId
            );

            /** @var Service $bookableRecurring */
            $bookableRecurring = $reservationService->getBookableEntity(
                [
                    'serviceId' => $recurringReservation->getServiceId()->getValue(),
                    'providerId' => $recurringReservation->getProviderId()->getValue()
                ]
            );

            $periodsData[] = [
                'name'    => $bookableRecurring->getName()->getValue(),
                'periods' => $reservationService->getBookingPeriods(
                    $recurringReservation,
                    $recurringBooking,
                    $bookableRecurring
                )
            ];
        }

        $vCalendars = $separateCalendars ? [] : [new Calendar(AMELIA_URL)];

        foreach ($periodsData as $periodData) {
            foreach ($periodData['periods'] as $period) {
                $vEvent = new Event();

                $vEvent
                    ->setDtStart(new \DateTime($period['start'], new \DateTimeZone('UTC')))
                    ->setDtEnd(new \DateTime($period['end'], new \DateTimeZone('UTC')))
                    ->setSummary($periodData['name']);

                if ($separateCalendars) {
                    $vCalendar = new Calendar(AMELIA_URL);

                    $vCalendar->addComponent($vEvent);

                    $vCalendars[] = $vCalendar;
                } else {
                    $vCalendars[0]->addComponent($vEvent);
                }
            }
        }

        $result = [];

        foreach ($vCalendars as $index => $vCalendar) {
            $result[] = [
                'name'    => sizeof($vCalendars) === 1 ? 'cal.ics' : 'cal' . ($index + 1) . '.ics',
                'type'    => 'text/calendar; charset=utf-8',
                'content' => $vCalendar->render()
            ];
        }

        return $result;
    }
}
