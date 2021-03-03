<?php
/**
 * @copyright © TMS-Plugins. All rights reserved.
 * @licence   See LICENCE.md for license details.
 */

namespace AmeliaBooking\Application\Commands\Bookable\Service;

use AmeliaBooking\Application\Commands\CommandHandler;
use AmeliaBooking\Application\Commands\CommandResult;
use AmeliaBooking\Domain\Common\Exceptions\InvalidArgumentException;
use AmeliaBooking\Domain\Entity\Bookable\Service\Service;
use AmeliaBooking\Domain\Entity\Entities;
use AmeliaBooking\Domain\Services\DateTime\DateTimeService;
use AmeliaBooking\Infrastructure\Common\Exceptions\QueryExecutionException;
use AmeliaBooking\Infrastructure\Repository\Bookable\Service\ServiceRepository;
use AmeliaBooking\Infrastructure\Repository\Booking\Appointment\AppointmentRepository;
use Slim\Exception\ContainerValueNotFoundException;

/**
 * Class GetServiceCommandHandler
 *
 * @package AmeliaBooking\Application\Commands\Bookable\Service
 */
class GetServiceCommandHandler extends CommandHandler
{
    /**
     * @param GetServiceCommand $command
     *
     * @return CommandResult
     * @throws ContainerValueNotFoundException
     * @throws QueryExecutionException
     * @throws InvalidArgumentException
     */
    public function handle(GetServiceCommand $command)
    {
        $result = new CommandResult();

        /** @var ServiceRepository $serviceRepository */
        $serviceRepository = $this->container->get('domain.bookable.service.repository');

        /** @var AppointmentRepository $appointmentRepository */
        $appointmentRepository = $this->container->get('domain.booking.appointment.repository');

        /** @var Service $service */
        $service = $serviceRepository->getByCriteria(
            ['services' => [$command->getArg('id')]]
        )->getItem($command->getArg('id'));

        if ($service->getSettings() && json_decode($service->getSettings()->getValue(), true) === null) {
            $service->setSettings(null);
        }

        $futureAppointmentsProvidersIds = $appointmentRepository->getFutureAppointmentsProvidersIds(
            [$service->getId()->getValue()],
            DateTimeService::getNowDateTime(),
            null
        );

        $result->setResult(CommandResult::RESULT_SUCCESS);
        $result->setMessage('Successfully retrieved service.');
        $result->setData(
            [
                Entities::SERVICE                => $service->toArray(),
                'futureAppointmentsProvidersIds' => $futureAppointmentsProvidersIds,
            ]
        );

        return $result;
    }
}
