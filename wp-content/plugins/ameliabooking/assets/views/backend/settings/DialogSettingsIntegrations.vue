<template>

  <!-- Dialog Settings Integrations -->
  <div>

    <!-- Dialog -->
    <div class="am-dialog-scrollable">

      <!-- Dialog Header -->
      <div class="am-dialog-header">
        <el-row>
          <el-col :span="20">
            <h2>
              {{ $root.labels.integrations_settings }}
            </h2>
          </el-col>
          <el-col :span="4" class="align-right">
            <el-button @click="closeDialog" class="am-dialog-close" size="small" icon="el-icon-close"></el-button>
          </el-col>
        </el-row>
      </div>
      <!-- /Dialog Header -->

      <!-- Form -->
      <el-form label-position="top" @submit.prevent="onSubmit">

        <!-- Tabs -->
        <el-tabs v-model="activeTab">

          <!-- Google Calendar -->
          <el-tab-pane :label="$root.labels.google_calendar" name="googleCalendar">
            <BlockLite/>
            <google-calendar :googleCalendar="googleCalendarSettings"/>
          </el-tab-pane>
          <!-- /Google Calendar -->

          <!-- Outlook Calendar -->
          <el-tab-pane
              :label="$root.labels.outlook_calendar"
              name="outlookCalendar"
          >
            <BlockLite/>
            <outlook-calendar :outlookCalendar="outlookCalendarSettings"/>
          </el-tab-pane>
          <!-- /Outlook Calendar -->

          <!-- Zoom -->
          <el-tab-pane :label="$root.labels.zoom" name="zoom">
            <BlockLite/>
            <zoom :zoom="zoomSettings"></zoom>
          </el-tab-pane>
          <!-- /Zoom -->

          <!-- Web Hooks -->
          <el-tab-pane :label="$root.labels.web_hooks" name="webHooks">
            <BlockLite/>
            <web-hooks :webHooks="webHooksSettings"></web-hooks>
          </el-tab-pane>
          <!-- /Web Hooks -->

        </el-tabs>
        <!-- /Tabs -->

      </el-form>
      <!-- /Form -->

    </div>
    <!-- /Dialog -->

    <!-- Dialog Footer -->
    <div class="am-dialog-footer">
      <div class="am-dialog-footer-actions">
        <el-row>
          <el-col :sm="24" class="align-right">
            <el-button type="" @click="closeDialog" class="">{{ $root.labels.cancel }}</el-button>
            <el-button type="primary" @click="onSubmit" class="am-dialog-create" :disabled="$root.isLite">{{ $root.labels.save }}</el-button>
          </el-col>
        </el-row>
      </div>
    </div>
    <!-- /Dialog Footer -->

  </div>
  <!-- /Dialog Settings Integrations -->

</template>

<script>
  import GoogleCalendar from './Integrations/IntegrationsGoogleCalendar.vue'
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import OutlookCalendar from './Integrations/IntegrationsOutlookCalendar.vue'
  import WebHooks from './Integrations/IntegrationsWebHooks.vue'
  import Zoom from './Integrations/IntegrationsZoom.vue'

  export default {
    components: {
      GoogleCalendar,
      OutlookCalendar,
      Zoom,
      WebHooks
    },

    props: {
      googleCalendar: {
        type: Object
      },
      outlookCalendar: {
        type: Object
      },
      zoom: {
        type: Object
      },
      webHooks: {
        type: Array
      }
    },

    mixins: [
      imageMixin
    ],

    data () {
      return {
        googleCalendarSettings: Object.assign({}, this.googleCalendar),
        outlookCalendarSettings: Object.assign({}, this.outlookCalendar),
        zoomSettings: Object.assign({}, this.zoom),
        webHooksSettings: this.webHooks.map((webHook) => webHook),
        activeTab: 'googleCalendar'
      }
    },

    mounted () {
      this.inlineSVG()
    },

    methods: {
      closeDialog () {
        this.$emit('closeDialogSettingsIntegrations')
      },

      onSubmit: function () {
        this.$emit('closeDialogSettingsIntegrations')
      }
    }
  }
</script>
