import moment from 'moment'

export default {

  mixins: [],

  data () {
    return {
      selectedPackageId: null,
      packageSlotsFetched: 0,
      packageServiceSelected: 0,
      selectedPackage: null,
      activePackage: false,
      packageListShown: false,
      packageCreated: false,
      disableFetchPackageSlots: false
    }
  },

  methods: {
    getPackagePrice (pack) {
      return pack.calculatedPrice ? pack.price : pack.price - pack.price / 100 * pack.discount
    },

    packageSlotsFetchedCallback () {
      this.packageSlotsFetched++

      if (this.passedPackage) {
        this.fetched = true
      }
    },

    getAvailablePackages () {
      return this.options.entities.packages.filter(
        pack => pack.bookable.filter(bookable => bookable.service.id === this.appointment.serviceId).length > 0
      )
    },

    initPackage (selectedPackage) {
      this.selectedPackage = selectedPackage

      this.selectedPackage.bookable.forEach(function (bookable) {
        bookable.bookings = []

        bookable.bookings.push({
          cleared: false,
          date: null,
          time: null,
          providerId: null,
          locationId: null,
          slots: []
        })

        bookable.calendarData = {
          slotsIndexStarted: 0,
          clonedSlotsData: null,
          slotsData: null,
          disabledWeekdays: null,
          availableDates: null,
          availableTimeSlots: [],
          selectedWeekIndex: 0
        }
      })
    },

    selectPackage (selectedPackage) {
      let amContainer = document.getElementById(this.id)

      this.activePicker = false
      amContainer.classList.remove('am-active-picker')

      this.activeRecurringDates = false
      this.activeRecurringSetup = false
      this.activeRecurring = false
      this.calendarVisible = false

      this.initPackage(selectedPackage)

      this.activePackage = true
    },

    closePackage () {
      this.selectedPackage = null
      this.activePackage = false
      this.packageCreated = false

      if (this.selectedPackageId === null) {
        this.updateSettings(this.getServiceById(this.appointment.serviceId).settings)
      }

      let amContainer = document.getElementById(this.id)

      if (!this.fetchedSlots) {
        amContainer.classList.remove('am-active-picker')
      }

      setTimeout(() => {
        this.times = document.getElementById(this.calendarId)
      }, 200)
    },

    getPackageAppointmentsData () {
      let bookings = []

      let rules = []

      if (this.selectedPackage) {
        this.selectedPackage.bookable.forEach((bookable) => {
          bookable.bookings.forEach((booking) => {
            if (booking.date && booking.time) {
              bookings.push({
                bookingStart: moment(booking.date).format('YYYY-MM-DD') + ' ' + booking.time,
                serviceId: bookable.service.id,
                providerId: booking.providerId,
                locationId: booking.locationId
              })
            }
          })

          rules.push({
            serviceId: bookable.service.id,
            providerId: bookable.providerId ? bookable.providerId : null,
            locationId: bookable.locationId ? bookable.locationId : null,
          })
        })
      }

      return {
        id: this.selectedPackage ? this.selectedPackage.id : null,
        data: bookings,
        rules: rules
      }
    },

    packageListShow () {
      this.loading = false
      this.activePackage = false
      this.packageListShown = true

      let amContainer = document.getElementById(this.id)

      amContainer.classList.toggle('am-active-package-list', true)
      amContainer.classList.toggle('am-active-picker', false)
    },

    packageSlotsSelectedCallback () {
      this.appointment.bookings[0].extras = []

      this.updateSettings(this.getPackageById(this.selectedPackage.id).settings)

      let amContainer = document.getElementById(this.id)

      this.loading = false
      this.packageCreated = false
      this.packageListShown = false
      this.activeConfirm = true
      this.packageCreated = true

      amContainer.classList.remove('am-active-package-list')

      amContainer.classList.toggle('am-active-confirm', this.activeConfirm)
    },

    bookingPackageDataCompiler (dataArray) {
      let bookingData = []
      dataArray.forEach((booking) => {
        if (booking.date && booking.time) {
          bookingData.push({
            date: booking.date,
            time: booking.time,
            provider: this.getProviderById(booking.providerId),
            location: booking.locationId ? this.getLocationById(booking.locationId) : null
          })
        }
      })

      return bookingData
    },

    getBookablePackageData () {
      let bookings = []

      let hasLocation = this.options.entities.locations.length > 0

      this.selectedPackage.bookable.forEach((bookable) => {
        let serviceAppointment = this.bookingPackageDataCompiler(bookable.bookings)

        let spanLengths = hasLocation ? {
          appointment: 1,
          date: 7,
          time: 4,
          employee: 6,
          location: 6
        } : {
          appointment: 1,
          date: 9,
          time: 6,
          employee: 8,
          location: 0
        }

        bookings.push({
          serviceName: bookable.service.name,
          serviceQuantity: bookable.quantity,
          serviceAppointment: serviceAppointment,
          serviceDuration: bookable.service.duration,
          spanLengths: spanLengths,
          hasLocations: hasLocation,
          singleEmployee: null,
          singleLocation: null
        })
      })

      return {
        name: this.selectedPackage.name,
        color: this.selectedPackage.color,
        discount: this.selectedPackage.discount,
        description: this.selectedPackage.description,
        price: this.getPackagePrice(this.selectedPackage),
        pictureThumbPath: this.selectedPackage.pictureThumbPath,
        durationCount: this.selectedPackage.durationCount,
        durationType: this.selectedPackage.durationType,
        endDate: this.selectedPackage.endDate,
        bookings: bookings
      }
    }
  }

}
