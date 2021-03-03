<template>
  <div>
    <div class="am-dialog-scrollable">
      <!-- Dialog Header -->
      <div class="am-dialog-header">
        <el-row>
          <el-col :span="14">
            <h2>{{ $root.labels.configure_placeholder }}</h2>
          </el-col>
          <el-col :span="10" class="align-right">
            <el-button @click="closeDialog" class="am-dialog-close" size="small" icon="el-icon-close"></el-button>
          </el-col>
        </el-row>
      </div>

      <div v-if="entity === 'package'">
        <p><strong>{{ $root.labels.package_placeholder_label }}</strong> %package_appointments_details%</p>
      </div>

      <div v-if="entity === 'appointment'">
        <p><strong>{{ $root.labels.ph_recurring_appointments_details }}</strong> %recurring_appointments_details%</p>
      </div>

      <div>
        <!-- Quill Editor -->
        <quill-editor
          v-model="appointmentsSettings[name]"
          v-if="type === 'email'"
          :options="editorOptions"
          @change="parseQuillEditorContent"
        >
        </quill-editor>
        <!-- /Quill Editor -->

        <!-- Textarea -->
        <el-input
          v-if="type === 'sms'"
          v-model="appointmentsSettings[name + 'Sms']"
          type="textarea"
          :rows="7"
          placeholder=""
        >
        </el-input>
        <!-- /Textarea -->
      </div>

      <inline-placeholders
        :placeholdersNames="placeholdersNames"
        :excludedPlaceholders="excludedPlaceholders"
        :categories="categories"
        :customFields="customFields"
        :userTypeTab="userTypeTab"
      >
      </inline-placeholders>

      <!-- Dialog Footer -->
      <div class="am-dialog-footer">
        <div class="am-dialog-footer-actions">
          <el-row>
            <el-col :sm="24" class="align-right">
              <el-button type="" @click="closeDialog" class="">{{ $root.labels.cancel }}</el-button>
              <el-button type="primary" @click="saveSettings" class="am-dialog-create" :loading="loadingButton">
                {{ $root.labels.save }}
              </el-button>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import placeholdersMixin from '../../../../js/backend/mixins/placeholdersMixin'
  import notifyMixin from '../../../../js/backend/mixins/notifyMixin'
  import quillMixin from '../../../../js/backend/mixins/quillMixin'
  import priceMixin from '../../../../js/common/mixins/priceMixin'
  import InlinePlaceholders from './InlinePlaceholders.vue'
  import { quillEditor } from 'vue-quill-editor'

  export default {
    mixins: [placeholdersMixin, quillMixin, priceMixin, notifyMixin],

    props: {
      excludedPlaceholders: {
        default: () => []
      },
      placeholdersNames: {
        default: () => []
      },
      categories: {
        default: () => []
      },
      coupons: {
        default: () => []
      },
      entity: {
        default: 'appointment',
        type: String
      },
      type: {
        default: 'email',
        type: String
      },
      customFields: {
        default: []
      },
      appointmentsSettings: null,
      userTypeTab: null,
      name: null
    },

    data () {
      return {
        loadingButton: false
      }
    },

    mounted () {
      this.removePlaceholder('appointmentPlaceholders', '%recurring_appointments_details%')
      this.removePlaceholder('appointmentPlaceholders', '%package_appointments_details%')
    },

    methods: {
      saveSettings () {
        this.loadingButton = true

        this.$http.post(`${this.$root.getAjaxUrl}/settings`, {appointments: this.appointmentsSettings})
          .then(response => {
            this.loadingButton = false

            this.$root.settings.appointments = response.data.data.settings.appointments

            this.$emit('closeDialogCombinedPlaceholder', response.data.data.settings.appointments)

            this.notify(this.$root.labels.success, this.$root.labels.settings_saved, 'success')
          })
          .catch(e => {
            this.loadingButton = false

            this.notify(this.$root.labels.error, e.message, 'error')
          })
      },
      closeDialog () {
        this.$emit('closeDialogCombinedPlaceholder')
      }
    },

    computed: {
    },

    components: {
      quillEditor,
      InlinePlaceholders
    }
  }
</script>
