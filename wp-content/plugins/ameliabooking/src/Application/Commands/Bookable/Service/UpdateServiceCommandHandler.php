<?php
/**
 * @copyright © TMS-Plugins. All rights reserved.
 * @licence   See LICENCE.md for license details.
 */

namespace AmeliaBooking\Application\Commands\Bookable\Service;

use AmeliaBooking\Application\Commands\CommandHandler;
use AmeliaBooking\Application\Commands\CommandResult;
use AmeliaBooking\Application\Common\Exceptions\AccessDeniedException;
use AmeliaBooking\Application\Services\Bookable\BookableApplicationService;
use AmeliaBooking\Application\Services\Gallery\GalleryApplicationService;
use AmeliaBooking\Domain\Common\Exceptions\InvalidArgumentException;
use AmeliaBooking\Domain\Entity\Bookable\Service\Service;
use AmeliaBooking\Domain\Entity\Entities;
use AmeliaBooking\Domain\Factory\Bookable\Service\ServiceFactory;
use AmeliaBooking\Infrastructure\Common\Exceptions\QueryExecutionException;
use AmeliaBooking\Infrastructure\Repository\Bookable\Service\ProviderServiceRepository;
use AmeliaBooking\Infrastructure\Repository\Bookable\Service\ServiceRepository;
use Interop\Container\Exception\ContainerException;
use Slim\Exception\ContainerValueNotFoundException;

/**
 * Class UpdateServiceCommandHandler
 *
 * @package AmeliaBooking\Application\Commands\Bookable\Service
 */
class UpdateServiceCommandHandler extends CommandHandler
{
    /** @var array */
    public $mandatoryFields = [
        'categoryId',
        'duration',
        'maxCapacity',
        'minCapacity',
        'name',
        'price',
        'applyGlobally',
        'providers'
    ];

    /**
     * @param UpdateServiceCommand $command
     *
     * @return CommandResult
     * @throws ContainerValueNotFoundException
     * @throws InvalidArgumentException
     * @throws QueryExecutionException
     * @throws AccessDeniedException
     * @throws ContainerException
     */
    public function handle(UpdateServiceCommand $command)
    {
        if (!$this->getContainer()->getPermissionsService()->currentUserCanWrite(Entities::SERVICES)) {
            throw new AccessDeniedException('You are not allowed to update service.');
        }

        $result = new CommandResult();

        $this->checkMandatoryFields($command);

        /** @var Service $service */
        $service = ServiceFactory::create($command->getFields());

        if (!($service instanceof Service)) {
            $result->setResult(CommandResult::RESULT_ERROR);
            $result->setMessage('Unable to update service.');

            return $result;
        }

        /** @var ServiceRepository $serviceRepository */
        $serviceRepository = $this->container->get('domain.bookable.service.repository');
        /** @var ProviderServiceRepository $providerServiceRepository */
        $providerServiceRepository = $this->container->get('domain.bookable.service.providerService.repository');

        /** @var BookableApplicationService $bookableService */
        $bookableService = $this->container->get('application.bookable.service');
        /** @var GalleryApplicationService $galleryService */
        $galleryService = $this->container->get('application.gallery.service');

        $serviceRepository->beginTransaction();

        if ($command->getField('applyGlobally') &&
            !$providerServiceRepository->updateServiceForAllProviders($service, $command->getArg('id'))) {
            $serviceRepository->rollback();

            $result->setResult(CommandResult::RESULT_ERROR);
            $result->setMessage('Unable to update service.');

            return $result;
        }

        if (!$serviceRepository->update($command->getArg('id'), $service)) {
            $serviceRepository->rollback();

            $result->setResult(CommandResult::RESULT_ERROR);
            $result->setMessage('Unable to update service.');

            return $result;
        }

        $bookableService->manageProvidersForServiceUpdate($service, $command->getField('providers'));

        $bookableService->manageExtrasForServiceUpdate($service);

        $bookableService->managePackagesForServiceUpdate($service);

        $galleryService->manageGalleryForEntityUpdate($service->getGallery(), $command->getArg('id'), Entities::SERVICE);

        $serviceRepository->commit();

        $result->setResult(CommandResult::RESULT_SUCCESS);
        $result->setMessage('Successfully updated service.');
        $result->setData(
            [
                Entities::SERVICE => $service->toArray(),
            ]
        );

        return $result;
    }
}
