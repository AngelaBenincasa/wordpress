import moment from 'moment'

export default {

  data () {
    return {}
  },

  methods: {

    getAppointmentDuration (service, extras) {
      return service.duration + extras.filter(extra => extra.selected).map(extra => extra.duration * extra.quantity).reduce((a, b) => a + b, 0)
    },

    getCurrentUser () {
      this.$http.get(`${this.$root.getAjaxUrl}/users/current`)
        .then(response => {
          this.currentUser = response.data.data.user

          if (this.currentUser) {
            this.appointment.bookings[0].customerId = this.currentUser.id
            this.appointment.bookings[0].customer.id = this.currentUser.id
            this.appointment.bookings[0].customer.externalId = this.currentUser.externalId
            this.appointment.bookings[0].customer.email = this.currentUser.email
            this.appointment.bookings[0].customer.firstName = this.currentUser.firstName
            this.appointment.bookings[0].customer.lastName = this.currentUser.lastName
            this.appointment.bookings[0].customer.phone = this.currentUser.phone || ''
            this.appointment.bookings[0].customer.countryPhoneIso = this.currentUser.countryPhoneIso
          }
        })
        .catch(e => {
          console.log('getCurrentUser fail')
        })
    },

    getFormattedTimeSlot (slot, duration) {
      return this.getFrontedFormattedTime(slot) + ' - ' + moment(slot, 'HH:mm:ss').add(duration, 'seconds').format(this.momentTimeFormat)
    },

    handleCapacity (dayMinimumCapacity, enabledGroup) {
      let $this = this
      let groupEnabled = false
      let maxCapacity = 0
      let minCapacity = 0
      let serviceMinCapacity = 0

      if ($this.appointment.serviceId) {
        if ($this.appointment.providerId) {
          let employee = this.options.entities.employees.find(employee => employee.id === $this.appointment.providerId)
          let service = employee.serviceList.find(service => service.id === $this.appointment.serviceId)

          serviceMinCapacity = service.minCapacity

          groupEnabled = service.maxCapacity > 1 && (service.bringingAnyone || !this.$root.settings.appointments.allowBookingIfNotMin)
          maxCapacity = service.maxCapacity
          minCapacity = this.$root.settings.appointments.allowBookingIfNotMin ? 1 : service.minCapacity
        } else {
          this.options.entities.employees.forEach(function (employee) {
            employee.serviceList.forEach(function (service) {
              if (service.id === $this.appointment.serviceId) {
                serviceMinCapacity = service.minCapacity

                if (service.maxCapacity > 1 && (service.bringingAnyone || !$this.$root.settings.appointments.allowBookingIfNotMin)) {
                  groupEnabled = true
                }

                if (service.maxCapacity < maxCapacity || maxCapacity === 0) {
                  maxCapacity = service.maxCapacity
                }

                if (minCapacity < service.minCapacity) {
                  minCapacity = $this.$root.settings.appointments.allowBookingIfNotMin ? 1 : service.minCapacity
                }
              }
            })
          })
        }
      }

      if (!dayMinimumCapacity && this.$root.settings.appointments.openedBookingAfterMin) {
        minCapacity = serviceMinCapacity
      }

      this.group.options = []

      for (let i = minCapacity - 1; i < maxCapacity; i++) {
        if (i !== 0) {
          let persons = 'ameliaBooking' in window && 'form' in window.ameliaBooking && window.ameliaBooking.form.allPersons ? i + 1 : i

          this.group.options.push({
            label: persons === 1 ? persons + ' ' + this.$root.labels.person_upper : persons + ' ' + this.$root.labels.persons_upper,
            value: i + 1
          })
        }
      }

      if (maxCapacity !== 0 && this.appointment.bookings[0].persons > maxCapacity) {
        this.appointment.bookings[0].persons = maxCapacity
      }

      if (this.group.enabled || (groupEnabled && !this.$root.settings.appointments.allowBookingIfNotMin && minCapacity > 1)) {
        this.group.enabled = groupEnabled
      }

      if (groupEnabled && !this.$root.settings.appointments.allowBookingIfNotMin && minCapacity > 1) {
        this.appointment.bookings[0].persons = minCapacity
      }

      this.group.allowed = groupEnabled && (this.$root.settings.appointments.allowBookingIfNotMin || minCapacity === 1)

      if (!enabledGroup && this.$root.settings.appointments.allowBookingIfNotMin && this.$root.settings.appointments.openedBookingAfterMin && serviceMinCapacity > 1) {
        this.group.enabled = true
        this.appointment.bookings[0].persons = serviceMinCapacity
      }
    },

    getAppointmentAddToCalendarData (responseData, appointment) {
      let bookingId = 0

      let dates = []

      let bookings = []
      let bookingsIds = []

      switch (responseData.type) {
        case ('appointment'):
          responseData.recurring.forEach(function (recurringData) {
            bookings.push(
              {
                type: 'appointment',
                id: recurringData.booking.id,
                appointmentStatusChanged: recurringData.appointmentStatusChanged
              }
            )

            bookingsIds.push(recurringData.booking.id)
          })

          responseData.utcTime.forEach(function (date) {
            dates.push(
              {
                start: moment.utc(date.start.replace(/ /g, 'T')).toDate(),
                end: moment.utc(date.end.replace(/ /g, 'T')).toDate()
              }
            )
          })

          responseData.recurring.forEach(function (recurringData) {
            recurringData.utcTime.forEach(function (date) {
              dates.push(
                {
                  start: moment.utc(date.start.replace(/ /g, 'T')).toDate(),
                  end: moment.utc(date.end.replace(/ /g, 'T')).toDate()
                }
              )
            })
          })

          bookingId = responseData.booking.id

          break

        case ('package'):
          responseData.package.forEach(function (packData, index) {
            if (index > 0) {
              bookings.push(
                {
                  type: 'appointment',
                  id: packData.booking.id,
                  appointmentStatusChanged: packData.appointmentStatusChanged
                }
              )

              bookingsIds.push(packData.booking.id)

              responseData.package.forEach(function (packData) {
                packData.utcTime.forEach(function (date) {
                  dates.push(
                    {
                      start: moment.utc(date.start.replace(/ /g, 'T')).toDate(),
                      end: moment.utc(date.end.replace(/ /g, 'T')).toDate()
                    }
                  )
                })
              })
            } else {
              bookingId = packData.booking.id

              packData.utcTime.forEach(function (date) {
                dates.push(
                  {
                    start: moment.utc(date.start.replace(/ /g, 'T')).toDate(),
                    end: moment.utc(date.end.replace(/ /g, 'T')).toDate()
                  }
                )
              })
            }
          })

          break
      }

      this.$http.post(`${this.$root.getAjaxUrl}/bookings/success/` + bookingId + '&nocache=' + (new Date().getTime()), {
        type: responseData.type,
        appointmentStatusChanged: responseData.appointmentStatusChanged,
        recurring: bookings,
        packageId: responseData.packageId ? responseData.packageId : null,
        customer: responseData.customer
      }).then(response => {
      }).catch(e => {
      })

      let addToCalendarData = {}

      switch (responseData.type) {
        case ('appointment'):
          let service = this.getServiceById(appointment.serviceId)
          let location = this.getLocationById(appointment.locationId)

          addToCalendarData = {
            title: service.name,
            dates: dates,
            address: location !== null ? location.address : '',
            description: service.description,
            id: responseData.booking.id,
            status: responseData.appointment.bookings[0].status,
            active: this.$root.settings.general.addToCalendar,
            color: responseData.color,
            type: responseData.type,
            bookable: service,
            booking: responseData.booking,
            recurringIds: bookingsIds
          }

          break

        case ('package'):
          addToCalendarData = {
            title: responseData[responseData.type].name,
            dates: [],
            address: '',
            description: responseData[responseData.type].description,
            id: bookingId,
            status: 'approved',
            active: this.$root.settings.general.addToCalendar && dates.length > 0,
            color: responseData.color,
            type: 'appointment',
            bookable: responseData[responseData.type],
            booking: responseData.booking,
            recurringIds: bookingsIds
          }

          break
      }

      return addToCalendarData
    }

  }

}
