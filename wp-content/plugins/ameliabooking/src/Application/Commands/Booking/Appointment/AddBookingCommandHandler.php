<?php

namespace AmeliaBooking\Application\Commands\Booking\Appointment;

use AmeliaBooking\Application\Commands\CommandHandler;
use AmeliaBooking\Application\Commands\CommandResult;
use AmeliaBooking\Application\Services\Booking\BookingApplicationService;
use AmeliaBooking\Application\Services\User\UserApplicationService;
use AmeliaBooking\Domain\Common\Exceptions\AuthorizationException;
use AmeliaBooking\Domain\Common\Exceptions\InvalidArgumentException;
use AmeliaBooking\Domain\Entity\Booking\Validator;
use AmeliaBooking\Domain\Entity\Entities;
use AmeliaBooking\Domain\Entity\User\AbstractUser;
use AmeliaBooking\Domain\Services\Reservation\ReservationServiceInterface;
use AmeliaBooking\Infrastructure\Common\Exceptions\QueryExecutionException;
use Exception;
use Interop\Container\Exception\ContainerException;
use Slim\Exception\ContainerValueNotFoundException;

/**
 * Class AddBookingCommandHandler
 *
 * @package AmeliaBooking\Application\Commands\Booking\Appointment
 */
class AddBookingCommandHandler extends CommandHandler
{
    /**
     * @var array
     */
    public $mandatoryFields = [
        'bookings',
    ];

    /**
     * @param AddBookingCommand $command
     *
     * @return CommandResult
     * @throws ContainerValueNotFoundException
     * @throws InvalidArgumentException
     * @throws QueryExecutionException
     * @throws ContainerException
     * @throws Exception
     */
    public function handle(AddBookingCommand $command)
    {
        $this->checkMandatoryFields($command);

        /** @var ReservationServiceInterface $reservationService */
        $reservationService = $this->container->get('application.reservation.service')->get(
            $command->getField('type') ?: Entities::APPOINTMENT
        );

        $validator = new Validator();

        $validator->setCouponValidation(true);
        $validator->setCustomFieldsValidation(true);
        $validator->setTimeSlotValidation(true);

        /** @var BookingApplicationService $bookingAS */
        $bookingAS = $this->container->get('application.booking.booking.service');

        $appointmentData = $bookingAS->getAppointmentData($command->getFields());

        /** @var UserApplicationService $userAS */
        $userAS = $this->container->get('application.user.service');

        if (!empty($appointmentData['bookings'][0]['packageCustomerService']['id']) && $command->getToken()) {
            try {
                /** @var AbstractUser $user */
                $user = $userAS->authorization(
                    $command->getToken(),
                    'customer'
                );
            } catch (AuthorizationException $e) {
                $result = new CommandResult();

                $result->setResult(CommandResult::RESULT_ERROR);
                $result->setData(
                    [
                        'reauthorize' => true
                    ]
                );

                return $result;
            }

            if ($user->getId()->getValue() !== (int)$appointmentData['bookings'][0]['customer']['id']) {
                $result = new CommandResult();

                $result->setResult(CommandResult::RESULT_ERROR);

                return $result;
            }

            $appointmentData['payment'] = null;
        } else {
            unset($appointmentData['bookings'][0]['packageCustomerService']['id']);
        }

        return $reservationService->process($appointmentData, $validator, true);
    }
}
