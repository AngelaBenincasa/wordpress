export default {

  data: () => ({
    loadingCustomers: false,
    searchCustomersTimer: null,
    searchedCustomers: [],
    dialogCustomer: false
  }),

  methods: {
    getInitCustomerObject () {
      return {
        id: 0,
        firstName: '',
        lastName: '',
        externalId: '',
        phone: '',
        countryPhoneIso: null,
        email: '',
        gender: '',
        birthday: null,
        note: '',
        status: 'visible',
        type: 'customer',
        countPendingAppointments: 0
      }
    },

    searchCustomers (query, callback) {
      clearTimeout(this.searchCustomersTimer)

      if (!this.loadingCustomers) {
        this.loadingCustomers = true

        this.searchCustomersTimer = setTimeout(() => {
            this.$http.get(`${this.$root.getAjaxUrl}/users/customers`, {
              params: {search: query, page: 1, limit: this.$root.settings.general.customersFilterLimit, skipCount: 1}
            })
              .then(response => {
                this.searchedCustomers = response.data.data.users

                this.loadingCustomers = false

                callback()
              })
              .catch(e => {
                this.loadingCustomers = false
              })
          },
          500
        )
      }
    }
  }
}
