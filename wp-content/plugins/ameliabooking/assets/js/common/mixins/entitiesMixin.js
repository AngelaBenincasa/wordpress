export default {

  data: () => ({}),

  methods: {
    getLocationById (id) {
      return this.options.entities.locations.find(location => location.id === id) || null
    },

    getCustomerById (id) {
      return this.options.entities.customers.find(customer => customer.id === id) || null
    },

    getProviderById (id) {
      return this.options.entities.employees.find(employee => employee.id === id) || null
    },

    getServiceById (id) {
      return this.options.entities.services.find(service => service.id === id) || null
    },

    getPackageById (id) {
      return this.options.entities.packages.find(pack => pack.id === id) || null
    },

    getServiceProviders (serviceId, fetchUnavailable) {
      return typeof fetchUnavailable === 'undefined' || !fetchUnavailable
        ? this.options.entities.employees.filter(employee =>
          employee.serviceList.filter(service => this.isEmployeeService(employee.id, service.id)).map(service => service.id).indexOf(serviceId) !== -1
        )
        : this.options.entities.employees.filter(employee =>
          employee.serviceList.map(service => service.id).indexOf(serviceId) !== -1
        )
    },

    getServiceLocations (serviceId, fetchUnavailable) {
      let locationsIds = []

      this.options.entities.employees
        .filter(employee => employee.serviceList.map(service => service.id).indexOf(serviceId) !== -1)
        .forEach((employee) => {
          locationsIds = this.getProviderLocations(employee.id, fetchUnavailable).map(location => location.id).concat(locationsIds)
        })

      return this.options.entities.locations.filter(location => locationsIds.indexOf(location.id) !== -1)
    },

    getProviderLocations (employeeId, fetchUnavailable) {
      let employee = this.getProviderById(employeeId)

      let locationsIds = [employee.locationId]

      if (employeeId in this.options.entitiesRelations) {
        for (let serviceId in this.options.entitiesRelations[employeeId]) {
          if (!this.options.entitiesRelations[employeeId].hasOwnProperty(serviceId)) {
            continue
          }

          locationsIds = locationsIds.concat(this.options.entitiesRelations[employeeId][serviceId])
        }
      }

      locationsIds = locationsIds.filter((v, i, a) => a.indexOf(v) === i)

      let providerLocations = (typeof fetchUnavailable === 'undefined' || !fetchUnavailable)
        ? this.options.entities.locations.filter(location => this.isEmployeeLocation(employeeId, location.id))
        : this.options.entities.locations

      return providerLocations.filter(location => locationsIds.indexOf(location.id) !== -1)
    },

    getLocationProviders (locationId, fetchUnavailable) {
      let employeesIds = []

      this.options.entities.employees.forEach((employee) => {
        let providerLocations = (typeof fetchUnavailable === 'undefined' || !fetchUnavailable)
          ? this.getProviderLocations(employee.id)
          : this.getProviderLocations(employee.id).filter(location => this.isEmployeeLocation(employee.id, location.id))

        if (providerLocations.map(location => location.id).indexOf(locationId) !== -1) {
          employeesIds.push(employee.id)
        }
      })

      employeesIds = employeesIds.filter((v, i, a) => a.indexOf(v) === i)

      return this.options.entities.employees.filter(employee => employeesIds.indexOf(employee.id) !== -1)
    },

    getServicesFromCategories (categories) {
      let services = []

      categories.map(category => category.serviceList).forEach(function (serviceList) {
        services = services.concat(serviceList)
      })

      return services
    },

    getCategoryServices (categoryId) {
      return this.options.entities.categories.find(category => category.id === categoryId).serviceList
    },

    getCustomerInfo (booking) {
      return 'info' in booking && booking.info ? JSON.parse(booking.info) : this.getCustomerById(booking.customerId)
    },

    isEmployeeServiceLocation (employeeId, serviceId, locationId) {
      return employeeId in this.options.entitiesRelations && serviceId in this.options.entitiesRelations[employeeId] && this.options.entitiesRelations[employeeId][serviceId].indexOf(locationId) !== -1
    },

    isEmployeeService (employeeId, serviceId) {
      return employeeId in this.options.entitiesRelations && serviceId in this.options.entitiesRelations[employeeId]
    },

    isEmployeeLocation (employeeId, locationId) {
      let employeeHasLocation = false

      if (employeeId in this.options.entitiesRelations) {
        for (let serviceId in this.options.entitiesRelations[employeeId]) {
          if (!this.options.entitiesRelations[employeeId].hasOwnProperty(serviceId)) {
            continue
          }

          if (this.options.entitiesRelations[employeeId][serviceId].indexOf(locationId) !== -1) {
            employeeHasLocation = true
          }
        }
      }

      return employeeHasLocation
    },

    getAvailableEntitiesIds (entities, entitiesIds) {
      let availableServiceIds = []
      let availableEmployeeIds = []
      let availableLocationIds = []

      let categoryServicesIds = entitiesIds.categoryId !== null ? entities.categories.find(category => category.id === entitiesIds.categoryId).serviceList.map(service => service.id) : []

      // selected category
      // selected service & employee
      // selected service & employee & location
      if (
        (entitiesIds.categoryId !== null && categoryServicesIds.length === 0) ||
        (entitiesIds.serviceId !== null && entitiesIds.employeeId !== null && !this.isEmployeeService(entitiesIds.employeeId, entitiesIds.serviceId)) ||
        (entitiesIds.serviceId !== null && entitiesIds.employeeId !== null && entitiesIds.locationId !== null && !this.isEmployeeServiceLocation(entitiesIds.employeeId, entitiesIds.serviceId, entitiesIds.locationId))
      ) {
        return {
          services: [],
          locations: [],
          employees: [],
          categories: []
        }
      }

      for (let providerKey in this.options.entitiesRelations) {
        if (!this.options.entitiesRelations.hasOwnProperty(providerKey)) {
          continue
        }

        let providerId = parseInt(providerKey)

        // selected employee
        // selected location (check if employee has at least one available service for location)
        // selected service (check if employee is available for service)
        // selected category (check if employee is available for at least one category service)
        // selected category && location (check if employee is available for at least one category service on location)
        // selected service && location (check if employee is available for service on location)
        if (
          (entitiesIds.employeeId !== null && entitiesIds.employeeId !== providerId) ||
          (entitiesIds.locationId !== null && !this.isEmployeeLocation(providerId, entitiesIds.locationId)) ||
          (entitiesIds.serviceId !== null && !this.isEmployeeService(providerId, entitiesIds.serviceId)) ||
          (entitiesIds.categoryId !== null && categoryServicesIds.filter(serviceId => this.isEmployeeService(providerId, serviceId)).length === 0) ||
          (entitiesIds.categoryId !== null && entitiesIds.locationId !== null && categoryServicesIds.filter(serviceId => this.isEmployeeServiceLocation(providerId, serviceId, entitiesIds.locationId)).length === 0) ||
          (entitiesIds.serviceId !== null && entitiesIds.locationId !== null && !this.isEmployeeServiceLocation(providerId, entitiesIds.serviceId, entitiesIds.locationId))
        ) {
          continue
        }

        if (availableEmployeeIds.indexOf(providerId) === -1) {
          availableEmployeeIds.push(providerId)
        }

        for (let serviceKey in this.options.entitiesRelations[providerId]) {
          if (!this.options.entitiesRelations[providerId].hasOwnProperty(serviceKey)) {
            continue
          }

          let serviceId = parseInt(serviceKey)

          // selected service
          // selected category (check if service belongs to category)
          // selected location (check if employee is available for service on location)
          if (
            (entitiesIds.serviceId !== null && entitiesIds.serviceId !== serviceId) ||
            (entitiesIds.categoryId !== null && categoryServicesIds.indexOf(serviceId) === -1) ||
            (entitiesIds.locationId !== null && !this.isEmployeeServiceLocation(providerId, serviceId, entitiesIds.locationId))
          ) {
            continue
          }

          if (availableServiceIds.indexOf(serviceId) === -1) {
            availableServiceIds.push(serviceId)
          }

          if (this.options.entitiesRelations[providerId][serviceId].length) {
            this.options.entitiesRelations[providerId][serviceId].forEach(function (locationId) {
              // selected location
              if ((entitiesIds.locationId !== null && entitiesIds.locationId !== locationId)) {
                return
              }

              if (availableLocationIds.indexOf(locationId) === -1) {
                availableLocationIds.push(locationId)
              }
            })
          }
        }
      }

      return {
        services: availableServiceIds,
        locations: availableLocationIds,
        employees: availableEmployeeIds,
        categories: entities.categories.filter(category => (category.serviceList.map(service => service.id)).filter(serviceId => availableServiceIds.indexOf(serviceId) !== -1).length > 0).map(category => category.id)
      }
    },

    filterEntities (entities, entitiesIds) {
      let availableEntitiesIds = this.getAvailableEntitiesIds(entities, entitiesIds)

      this.options.entities.employees = entities.employees.filter(employee =>
        availableEntitiesIds.employees.indexOf(employee.id) !== -1 &&
        employee.serviceList.filter(employeeService =>
          availableEntitiesIds.services.indexOf(employeeService.id) !== -1
        ).length > 0
      )

      this.options.entities.categories = entities.categories

      this.options.entities.services = this.getServicesFromCategories(this.options.entities.categories).filter(service =>
        service.show &&
        availableEntitiesIds.services.indexOf(service.id) !== -1
      )

      this.options.entities.services.forEach(function (service) {
        service.extras.forEach(function (extra) {
          extra.extraId = extra.id
        })
      })

      this.options.entities.locations = entities.locations.filter(location => availableEntitiesIds.locations.indexOf(location.id) !== -1)

      this.options.entities.customFields = entities.customFields

      if ('packages' in entities && ('show' in entitiesIds ? entitiesIds.show !== 'services' : true)) {
        let availablePackages = entities.packages.filter(pack => pack.status === 'visible').filter(
            pack => pack.bookable.filter(
                bookable => this.options.entities.services.map(service => service.id).indexOf(bookable.service.id) !== -1
            ).length > 0
        )

        let availableLocationsIds = this.options.entities.locations.map(location => location.id)
        let availableEmployeesIds = this.options.entities.employees.map(employee => employee.id)

        let unavailablePackagesIds = []

        availablePackages.forEach((pack) => {
          let hasSlots = false

          pack.bookable.forEach((bookable) => {
            if (bookable.minimumScheduled === 0 && bookable.maximumScheduled > 0 ||
                bookable.minimumScheduled > 0 && bookable.maximumScheduled === 0 ||
                bookable.minimumScheduled > 0 && bookable.maximumScheduled > 0
            ) {
              hasSlots = true
            }

            let hasPredefinedEmployees = bookable.providers.length

            if (entities.locations.length && !this.options.entities.locations.length) {
              unavailablePackagesIds.push(pack.id)

              return
            }

            let hasPredefinedLocations = bookable.locations.length

            if (hasPredefinedEmployees) {
              bookable.providers = bookable.providers.filter(
                  provider => availableEmployeesIds.indexOf(provider.id) !== -1 &&
                  hasPredefinedLocations
                      ? bookable.locations.filter(location => this.isEmployeeServiceLocation(provider.id, bookable.service.id, location.id)).length
                      : (this.options.entities.locations.length ? this.options.entities.locations.filter(location => this.isEmployeeServiceLocation(provider.id, bookable.service.id, location.id)).length : true)
              )

              if (!bookable.providers.length) {
                unavailablePackagesIds.push(pack.id)

                return
              }
            }

            if (hasPredefinedLocations) {
              bookable.locations = bookable.locations.filter(
                  location => availableLocationsIds.indexOf(location.id) !== -1 &&
                      (
                          hasPredefinedEmployees
                              ? bookable.providers.filter(provider => this.isEmployeeServiceLocation(provider.id, bookable.service.id, location.id)).length
                              : this.options.entities.employees.filter(provider => this.isEmployeeServiceLocation(provider.id, bookable.service.id, location.id)).length
                      )
              )

              if (!bookable.locations.length) {
                unavailablePackagesIds.push(pack.id)
              }
            }
          })

          pack.hasSlots = hasSlots
        })

        this.options.entities.packages = availablePackages.filter(pack => unavailablePackagesIds.indexOf(pack.id) === -1)

        if ('show' in entitiesIds && entitiesIds.show === 'packages') {
          let availableCategoriesIds = []

          this.options.entities.packages.forEach((pack) => {
            pack.bookable.forEach((bookable) => {
              availableCategoriesIds.push(bookable.service.categoryId)
            })
          })

          this.options.entities.categories = this.options.entities.categories.filter(category => availableCategoriesIds.indexOf(category.id) !== -1)
        }
      }
    },

    getShortCodeEntityIds () {
      return this.$root.shortcodeData.booking ? {
        categoryId: 'category' in this.$root.shortcodeData.booking ? this.$root.shortcodeData.booking.category : null,
        serviceId: 'service' in this.$root.shortcodeData.booking ? this.$root.shortcodeData.booking.service : null,
        employeeId: 'employee' in this.$root.shortcodeData.booking ? this.$root.shortcodeData.booking.employee : null,
        locationId: 'location' in this.$root.shortcodeData.booking ? this.$root.shortcodeData.booking.location : null,
        show: 'show' in this.$root.shortcodeData.booking ? this.$root.shortcodeData.booking.show : null
      } : {
        categoryId: null,
        serviceId: null,
        employeeId: null,
        locationId: null,
        show: null
      }
    },

    fetchEntities (callback, options) {
      let config = {
        params: {
          types: options.types
        }
      }

      if (options.page) {
        config.params.page = options.page
      } else if ('isFrontEnd' in options && options.isFrontEnd) {
        config.params.page = 'booking'
      }

      if (this.$store !== undefined && this.$store.state.cabinet !== undefined && this.$store.state.cabinet.cabinetType === 'provider') {
        config = Object.assign(config, this.getAuthorizationHeaderObject())
        Object.assign(config.params, {source: 'cabinet-' + this.$store.state.cabinet.cabinetType})
      }

      this.$http.get(`${this.$root.getAjaxUrl}/entities`, config).then(response => {
        this.options.isFrontEnd = options.isFrontEnd

        this.options.entitiesRelations = response.data.data.entitiesRelations

        if (this.options.isFrontEnd) {
          if ('packages' in response.data.data && response.data.data.packages.length) {
            this.responseEntities.employees = response.data.data.employees
            this.responseEntities.categories = response.data.data.categories
            this.responseEntities.locations = response.data.data.locations
            this.responseEntities.customFields = response.data.data.customFields
            this.responseEntities.services = this.getServicesFromCategories(this.responseEntities.categories)
            this.responseEntities.packages = response.data.data.packages
          }

          this.filterEntities(response.data.data, this.getShortCodeEntityIds())
        } else {
          this.options.entities.employees = response.data.data.employees
          this.options.entities.categories = response.data.data.categories
          this.options.entities.locations = response.data.data.locations
          this.options.entities.customers = response.data.data.customers
          this.options.entities.services = this.getServicesFromCategories(this.options.entities.categories)
          this.options.entities.packages = response.data.data.packages

          this.options.entities.services.forEach(function (service) {
            service.extras.forEach(function (extra) {
              extra.extraId = extra.id
            })
          })

          this.options.availableEntitiesIds = this.getAvailableEntitiesIds(response.data.data, {
            categoryId: null,
            serviceId: null,
            employeeId: null,
            locationId: null
          })
        }

        this.options.entities.tags = 'tags' in response.data.data ? response.data.data.tags : []

        this.options.entities.customFields = response.data.data.customFields

        let success = true

        callback(success)
      }).catch(e => {
        console.log(e)

        let success = false

        callback(success)
      })
    },

    getFilteredEntities (filteredEntitiesIds, type, parameter) {
      let savedEntityId = this.appointment && this.appointment.id && this.appointment[parameter] ? this.appointment[parameter] : null

      this.options.entities[type].forEach(function (entity) {
        entity.disabled = filteredEntitiesIds.indexOf(entity.id) === -1
      })

      return this.options.entities[type].filter(entity =>
        this.options.availableEntitiesIds[type].indexOf(entity.id) !== -1 ||
        (savedEntityId !== null ? savedEntityId === entity.id : false)
      )
    }
  },

  computed: {
    visibleLocations () {
      return this.options.entities.locations.filter(location => location.status === 'visible')
    },

    visibleEmployees () {
      return this.options.entities.employees.filter(employee => employee.status === 'visible')
    },

    visibleCustomers () {
      return this.options.entities.customers.filter(customer => customer.status === 'visible')
    },

    visibleServices () {
      return this.options.entities.services.filter(service => service.status === 'visible')
    },

    employeesFiltered () {
      let employees = this.visibleEmployees.filter(employee =>
        employee.serviceList.filter(
          service =>
            service.status === 'visible' &&
            (!this.appointment.serviceId ? true : (this.isEmployeeService(employee.id, service.id) && service.id === this.appointment.serviceId)) &&
            (!this.appointment.locationId ? true : (this.isEmployeeServiceLocation(employee.id, service.id, this.appointment.locationId))) &&
            (!this.appointment.categoryId ? true : (employee.serviceList.filter(service => service.status === 'visible' && service.categoryId === this.appointment.categoryId).length > 0))
        ).length > 0
      )

      return this.options.isFrontEnd ? employees : this.getFilteredEntities(employees.map(employee => employee.id), 'employees', 'providerId')
    },

    servicesFiltered () {
      let selectedEmployeeServicesIds = []

      if (this.appointment.providerId) {
        let selectedEmployee = this.employeesFiltered.find(employee => employee.id === this.appointment.providerId)

        selectedEmployeeServicesIds = typeof selectedEmployee !== 'undefined' ? selectedEmployee.serviceList
          .filter(employeeService => employeeService.status === 'visible')
          .map(employeeService => employeeService.id) : []
      }

      let services = this.visibleServices.filter(service =>
        (!this.appointment.providerId ? true : selectedEmployeeServicesIds.indexOf(service.id) !== -1) &&
        (!this.appointment.locationId ? true : this.employeesFiltered.filter(employee => this.isEmployeeServiceLocation(employee.id, service.id, this.appointment.locationId)).length > 0) &&
        (!this.appointment.categoryId ? true : service.categoryId === this.appointment.categoryId)
      )

      return this.options.isFrontEnd ? services : this.getFilteredEntities(services.map(service => service.id), 'services', 'serviceId')
    },

    locationsFiltered () {
      let selectedEmployeeServices = []

      if (this.appointment.providerId) {
        let selectedEmployee = this.employeesFiltered.find(employee => employee.id === this.appointment.providerId)

        selectedEmployeeServices = typeof selectedEmployee !== 'undefined' ? selectedEmployee.serviceList.filter(employeeService => employeeService.status === 'visible') : []
      }

      let selectedCategory = null

      if (this.appointment.categoryId) {
        selectedCategory = this.categoriesFiltered.find(category => category.id === this.appointment.categoryId)
      }

      let locations = this.visibleLocations.filter(location =>
        (!this.appointment.providerId ? true : selectedEmployeeServices.filter(employeeService => this.isEmployeeServiceLocation(this.appointment.providerId, employeeService.id, location.id)).length > 0) &&
        (!this.appointment.serviceId ? true : this.employeesFiltered.filter(employee => this.isEmployeeServiceLocation(employee.id, this.appointment.serviceId, location.id)).length > 0) &&
        (!this.appointment.categoryId ? true : (typeof selectedCategory !== 'undefined' ? this.employeesFiltered.filter(employee => employee.serviceList.filter(employeeService => employeeService.status === 'visible' && employeeService.categoryId === selectedCategory.id && this.isEmployeeServiceLocation(employee.id, employeeService.id, location.id)).length > 0).length > 0 : false))
      )

      return this.options.isFrontEnd ? locations : this.getFilteredEntities(locations.map(location => location.id), 'locations', 'locationId')
    },

    categoriesFiltered () {
      let selectedEmployee = null

      if (this.appointment.providerId) {
        selectedEmployee = this.employeesFiltered.find(employee => employee.id === this.appointment.providerId)
      }

      let selectedService = null

      if (this.appointment.serviceId) {
        selectedService = this.servicesFiltered.find(service => service.id === this.appointment.serviceId)
      }

      let categories = this.options.entities.categories.filter(category =>
        (!this.appointment.serviceId ? true : typeof selectedService !== 'undefined' ? selectedService.categoryId === category.id : false) &&
        (!this.appointment.locationId ? true : category.serviceList.filter(categoryService => categoryService.status === 'visible' && this.employeesFiltered.filter(employee => this.isEmployeeServiceLocation(employee.id, categoryService.id, this.appointment.locationId)).length > 0).length > 0) &&
        (!this.appointment.providerId ? true : (typeof selectedEmployee !== 'undefined' ? selectedEmployee.serviceList.filter(employeeService => employeeService.status === 'visible' && this.isEmployeeService(this.appointment.providerId, employeeService.id)).map(employeeService => employeeService.categoryId).indexOf(category.id) !== -1 : false))
      )

      return this.options.isFrontEnd ? categories : this.getFilteredEntities(categories.map(category => category.id), 'categories', 'categoryId')
    }
  }

}
