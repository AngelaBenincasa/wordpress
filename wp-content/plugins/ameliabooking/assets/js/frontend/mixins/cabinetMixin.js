export default {
  data () {
    return {
      statusesCabinet: [
        {
          value: 'approved',
          label: this.$root.labels.approved
        }, {
          value: 'pending',
          label: this.$root.labels.pending
        },
        {
          value: 'canceled',
          label: this.$root.labels.canceled
        },
        {
          value: 'rejected',
          label: this.$root.labels.rejected
        }
      ]
    }
  },

  methods: {
    isPanelActive (panel) {
      if (!this.$root.shortcodeData.cabinet || (!this.$root.shortcodeData.cabinet.appointments && !this.$root.shortcodeData.cabinet.events)) {
        return true
      }

      if (panel === 'appointments' && this.$root.shortcodeData.cabinet && this.$root.shortcodeData.cabinet.appointments) {
        return true
      }

      return panel === 'events' && this.$root.shortcodeData.cabinet && this.$root.shortcodeData.cabinet.events
    },

    changeRange (value) {
      this.$store.commit('cabinet/setParams', {dates: value})
      this.setDatePickerSelectedDaysCount(this.$store.state.cabinet.params.dates.start, this.$store.state.cabinet.params.dates.end)
      this.$emit('refreshReservations')
    },

    isBookingCancelable (reservation, booking_index = 0) {
      return reservation.cancelable === false || reservation.bookings[booking_index].status === 'canceled' || reservation.bookings[booking_index].status === 'rejected'
    },

    disableAuthorizationHeader () {
      return 'ameliaBooking' in window && 'cabinet' in window['ameliaBooking'] && 'disableAuthorizationHeader' in window['ameliaBooking']['cabinet'] && window['ameliaBooking']['cabinet']['disableAuthorizationHeader']
    },

    getAuthorizationHeaderObject () {
      return this.$store.state.cabinet.ameliaToken && !this.disableAuthorizationHeader() ? {headers: {Authorization: 'Bearer ' + this.$store.state.cabinet.ameliaToken}} : {}
    }
  }
}
