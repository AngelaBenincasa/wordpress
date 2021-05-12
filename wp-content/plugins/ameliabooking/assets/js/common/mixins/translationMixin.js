export default {

  data: () => ({}),

  methods: {
    getNameTranslated (entity) {
      if (entity.translations && JSON.parse(entity.translations)['name']) {
        let nameTranslations = JSON.parse(entity.translations)['name']
        let name = nameTranslations[window.localeLanguage[0]]

        if (name && name !== '') {
          return name
        }
      }
      return entity.name
    },

    getCfLabelTranslated (entity) {
      if (entity.translations) {
        let nameTranslations = JSON.parse(entity.translations)['name']
        let name = nameTranslations[window.localeLanguage[0]]

        if (name && name !== '') {
          return name
        }
      }
      return entity.label
    },

    getCfOptionTranslated (entity) {
      if (entity.translations) {
        let nameTranslations = JSON.parse(entity.translations)
        let name = nameTranslations[window.localeLanguage[0]]

        if (name && name !== '') {
          return name
        }
      }
      return entity.label
    },

    getDescriptionTranslated (entity) {
      if (entity.translations && JSON.parse(entity.translations)['description']) {
        let descriptionTranslations = JSON.parse(entity.translations)['description']

        if (descriptionTranslations[window.localeLanguage[0]]) {
          return descriptionTranslations[window.localeLanguage[0]]
        }
      }
      return entity.description
    },

    translateEntities (entities) {
      if (entities.services && entities.services.length) {
        entities.services.forEach(service => {
          service.name = this.getNameTranslated(service)
          service.description = this.getDescriptionTranslated(service)
          service.extras.forEach(extra => {
            extra.name = this.getNameTranslated(extra)
            extra.description = this.getDescriptionTranslated(extra)
          })
        })
      }

      if (entities.packages && entities.packages.length) {
        entities.packages.forEach(pack => {
          pack.name = this.getNameTranslated(pack)
          pack.description = this.getDescriptionTranslated(pack)
          pack.bookable.forEach(bookable => {
            bookable.service.name = this.getNameTranslated(bookable.service)
            bookable.service.description = this.getDescriptionTranslated(bookable.service)
            bookable.service.extras.forEach(extra => {
              extra.name = this.getNameTranslated(extra)
              extra.description = this.getDescriptionTranslated(extra)
            })
          })
        })
      }

      if (entities.categories && entities.categories.length) {
        entities.categories.forEach(category => {
          category.name = this.getNameTranslated(category)

          category.serviceList.forEach(service => {
            service.name = this.getNameTranslated(service)
            service.description = this.getDescriptionTranslated(service)
            service.extras.forEach(extra => {
              extra.name = this.getNameTranslated(extra)
              extra.description = this.getDescriptionTranslated(extra)
            })
          })
        })
      }

      if (entities.events && entities.events.length) {
        entities.events.forEach(event => {
          event.name = this.getNameTranslated(event)
          event.description = this.getDescriptionTranslated(event)
          event.extras.forEach(extra => {
            extra.name = this.getNameTranslated(extra)
            extra.description = this.getDescriptionTranslated(extra)
          })
        })
      }

      if (entities.customFields && entities.customFields.length) {
        entities.customFields.forEach(customField => {
          customField.label = this.getCfLabelTranslated(customField)
          customField.options.forEach(option => {
            option.label = this.getCfOptionTranslated(option)
          })
        })
      }

      if (entities.employees && entities.employees.length) {
        entities.employees.forEach(employee => {
          employee.serviceList.forEach(service => {
            service.name = this.getNameTranslated(service)
            service.description = this.getDescriptionTranslated(service)
            service.extras.forEach(extra => {
              extra.name = this.getNameTranslated(extra)
              extra.description = this.getDescriptionTranslated(extra)
            })
          })
        })
      }
    }
  },

  computed: {
  }
}
