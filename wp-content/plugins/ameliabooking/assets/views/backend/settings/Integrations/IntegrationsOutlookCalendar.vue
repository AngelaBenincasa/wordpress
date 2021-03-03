<template>

  <!-- Integration Outlook Calendar -->
  <el-form :model="settings" ref="settings" label-position="top" @submit.prevent="onSubmit" :class="{'am-lite-container-disabled': $root.isLite}">

    <!-- SSL Alert -->
    <el-alert
        v-if="showSSLAlert"
        type="warning"
        show-icon
        title=""
        :description="$root.labels.outlook_ssl_warning"
        :closable="false"
    />
    <!-- /SSL Alert -->

    <!-- Client ID -->
    <el-form-item :label="$root.labels.outlook_client_id + ':'">
      <el-row :gutter="24">
        <el-col :span="21">
          <el-input v-model.trim="settings.clientID" auto-complete="off"></el-input>
        </el-col>
        <el-col :span="3">
          <el-tooltip class="am-google-calendar-tooltip" effect="dark" placement="top">
            <div slot="content" v-html="$root.labels.outlook_credentials_obtain"></div>
            <el-button
                class="am-google-calendar-button am-button-icon"
                type="primary"
                @click="redirectToDocumentation()"
            >
              <img class="svg" :src="$root.getUrl + 'public/img/question.svg'"/>
            </el-button>
          </el-tooltip>
        </el-col>
      </el-row>
    </el-form-item>
    <!-- /Client ID -->

    <!-- Client Secret -->
    <el-form-item :label="$root.labels.outlook_client_secret + ':'">
      <el-row :gutter="24">
        <el-col :span="21">
          <el-input v-model.trim="settings.clientSecret" auto-complete="off"></el-input>
        </el-col>
        <el-col :span="3">
          <el-tooltip class="am-google-calendar-tooltip" effect="dark" placement="top">
            <div slot="content" v-html="$root.labels.outlook_credentials_obtain"></div>
            <el-button
                class="am-google-calendar-button am-button-icon"
                type="primary"
                @click="redirectToDocumentation()"
            >
              <img class="svg" :src="$root.getUrl + 'public/img/question.svg'"/>
            </el-button>
          </el-tooltip>
        </el-col>
      </el-row>
    </el-form-item>
    <!-- /Client Secret -->

    <!-- Redirect URI -->
    <el-form-item label="placeholder">
      <label slot="label">
        {{ $root.labels.outlook_redirect_uri }}:
        <el-tooltip placement="top">
          <div slot="content" v-html="$root.labels.outlook_redirect_uri_tooltip"></div>
          <i class="el-icon-question am-tooltip-icon"></i>
        </el-tooltip>
      </label>
      <el-input v-model="settings.redirectURI" auto-complete="off" readonly="readonly"></el-input>
    </el-form-item>
    <!-- /Redirect URI -->

    <!-- Event Title -->
    <el-form-item label="placeholder">
      <label slot="label">
        {{ $root.labels.event_title }}:
        <el-tooltip placement="top">
          <div slot="content" v-html="$root.labels.event_title_tooltip_outlook"></div>
          <i class="el-icon-question am-tooltip-icon"></i>
        </el-tooltip>
      </label>
      <el-input v-model="settings.eventTitle" auto-complete="off"></el-input>
    </el-form-item>
    <!-- /Event Title -->

    <!-- Event Description -->
    <el-form-item label="placeholder">
      <label slot="label">
        {{ $root.labels.event_description }}:
        <el-tooltip placement="top">
          <div slot="content" v-html="$root.labels.event_description_tooltip_outlook"></div>
          <i class="el-icon-question am-tooltip-icon"></i>
        </el-tooltip>
      </label>
      <el-input v-model="settings.eventDescription" type="textarea" auto-complete="off"></el-input>
    </el-form-item>
    <!-- /Event Description -->

    <!-- Inline Placeholders -->
    <el-form-item>
      <inline-placeholders
        :placeholdersNames="[
          'appointmentPlaceholders',
          'eventPlaceholders',
          'categoryPlaceholders',
          'companyPlaceholders',
          'customerPlaceholders',
          'employeePlaceholders'
        ]"
        :excludedPlaceholders="{
          appointmentPlaceholders: [
            '%zoom_host_url%',
            '%zoom_join_url%',
            '%appointment_cancel_url%'
          ],
          eventPlaceholders: [
            '%event_cancel_url%',
            '%zoom_join_url_date%',
            '%zoom_join_url_date_time%',
            '%zoom_host_url_date%',
            '%zoom_host_url_date_time%'
          ]
        }"
        userTypeTab="provider"
      >
      </inline-placeholders>
    </el-form-item>
    <!-- /Inline Placeholders -->

    <!-- Insert Pending Appointments -->
    <div class="am-setting-box am-switch-box">
      <el-row type="flex" align="middle" :gutter="24">
        <el-col :span="20">
          {{ $root.labels.insert_pending_appointments }}
          <el-tooltip placement="top">
            <div slot="content" v-html="$root.labels.insert_pending_appointments_tooltip"></div>
            <i class="el-icon-question am-tooltip-icon"></i>
          </el-tooltip>
        </el-col>
        <el-col :span="4" class="align-right">
          <el-switch
              v-model="settings.insertPendingAppointments"
              active-text=""
              inactive-text=""
          >
          </el-switch>
        </el-col>
      </el-row>
    </div>
    <!-- /Insert Pending Appointments -->

    <!-- Add Event's Attendees -->
    <div class="am-setting-box am-switch-box">
      <el-row type="flex" align="middle" :gutter="24">
        <el-col :span="20">
          {{ $root.labels.customers_as_attendees }}
          <el-tooltip placement="top">
            <div slot="content" v-html="$root.labels.customers_as_attendees_tooltip"></div>
            <i class="el-icon-question am-tooltip-icon"></i>
          </el-tooltip>
        </el-col>
        <el-col :span="4" class="align-right">
          <el-switch
              v-model="settings.addAttendees"
              active-text=""
              inactive-text=""
              @change="onChangeAddAttendees()"
          >
          </el-switch>
        </el-col>
      </el-row>
    </div>
    <!-- /Add Event's Attendees -->

    <!-- Remove Outlook Calendar Busy Slots -->
    <div class="am-setting-box am-switch-box">
      <el-row type="flex" align="middle" :gutter="24">
        <el-col :span="20">
          {{ $root.labels.remove_outlook_busy_slots }}
          <el-tooltip placement="top">
            <div slot="content" v-html="$root.labels.remove_outlook_busy_slots_tooltip"></div>
            <i class="el-icon-question am-tooltip-icon"></i>
          </el-tooltip>
        </el-col>
        <el-col :span="4" class="align-right">
          <el-switch
              v-model="settings.removeOutlookCalendarBusySlots"
              active-text=""
              inactive-text=""
          >
          </el-switch>
        </el-col>
      </el-row>
    </div>
    <!-- /Remove Outlook Calendar Busy Slots -->

    <!-- Include Buffer time in Outlook events -->
    <div class="am-setting-box am-switch-box">
      <el-row type="flex" align="middle" :gutter="24">
        <el-col :span="20">
          {{ $root.labels.include_buffer_time_outlook }}
          <el-tooltip placement="top">
            <div slot="content" v-html="$root.labels.include_buffer_time_outlook_tooltip"></div>
            <i class="el-icon-question am-tooltip-icon"></i>
          </el-tooltip>
        </el-col>
        <el-col :span="4" class="align-right">
          <el-switch
              v-model="settings.includeBufferTimeOutlookCalendar"
              active-text=""
              inactive-text=""
          >
          </el-switch>
        </el-col>
      </el-row>
    </div>
    <!-- /Include Buffer time in Outlook events -->

    <!-- Maximum Number Of Events Returned -->
    <el-form-item label="placeholder">
      <label slot="label">
        {{ $root.labels.number_of_events_returned }}:
        <el-tooltip placement="top">
          <div slot="content" v-html="$root.labels.number_of_events_returned_tooltip"></div>
          <i class="el-icon-question am-tooltip-icon"></i>
        </el-tooltip>
      </label>
      <el-select
          v-model="settings.maximumNumberOfEventsReturned"
          :disabled="!settings.removeOutlookCalendarBusySlots"
      >
        <el-option
            v-for="item in options.maximumNumberOfEventsReturned"
            :key="item"
            :label="item"
            :value="item">
        </el-option>
      </el-select>
    </el-form-item>
    <!-- /Maximum Number Of Events Returned -->

  </el-form>
  <!-- /Integration Outlook Calendar -->

</template>

<script>
  import imageMixin from '../../../../js/common/mixins/imageMixin'
  import InlinePlaceholders from '../../notifications/common/InlinePlaceholders'

  export default {
    props: {
      outlookCalendar: {
        type: Object
      }
    },

    mixins: [
      imageMixin
    ],

    data () {
      return {
        options: {
          maximumNumberOfEventsReturned: [50, 100, 200, 500, 999]
        },
        settings: this.outlookCalendar
      }
    },

    computed: {
      showSSLAlert () {
        return location.protocol !== 'https:'
      }
    },

    methods: {
      onChangeAddAttendees () {
        if (this.settings.addAttendees === false) {
          this.settings.sendEventInvitationEmail = false
        }
      },

      redirectToDocumentation () {
        window.open('https://wpamelia.com/configuring-outlook-calendar/', '_blank')
      }
    },
    components: {InlinePlaceholders}
  }
</script>
