<template>
  <div id="am-recurring-setup" class="am-recurring-setup am-mobile-collapsed am-select-date am-select-service-date-transition">
    <p v-if="isFrontend" class="am-recurring-setup-title">{{ $root.labels.recurring_active }}</p>

    <el-form
      :model="recurring"
      ref="recurring"
      label-position="top"
    >
      <div>
        <el-row :gutter="24">
          <el-col :sm="12">
            <el-form-item :label="$root.labels.recurring_repeat">
              <el-select
                v-model="initialRecurringData.cycle"
                :disabled="service.recurringCycle !== 'all'"
                @change="setRecurringValues('count')"
                :class="service.recurringCycle !== 'all' ? 'am-recurring-setup-all-cycle' : ''"
              >
                <el-option
                  v-for="(option, index) in cycles"
                  :key="index"
                  :value="option.value"
                  :label="option.label"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :sm="12">
            <el-form-item :label="$root.labels.recurring_every">
              <el-select
                v-model="initialRecurringData.cycleInterval"
                @change="setRecurringValues('count')"
              >
                <el-option
                  v-for="(option, index) in initialRecurringData.repeatIntervalLabels"
                  :key="index"
                  :value="option.value"
                  :label="option.label"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24" v-if="initialRecurringData.cycle === 'weekly'" class="am-recurring-setup-weekly">
          <el-col :sm="24">
            <el-form-item :label="$root.labels.recurring_on">
              <el-checkbox-group
                v-model="initialRecurringData.weekDaysSelected"
                @change="setRecurringValues('date')"
                :border="true"
                size="small"
              >
                <el-checkbox-button
                  v-for="(weekDay, index) in weekDays"
                  :label="index"
                  :key="index"
                  :disabled="!weekDay.enabled"
                >
                  {{weekDay.label}}
                </el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24" v-if="initialRecurringData.cycle === 'monthly'">
          <el-col :sm="24">
            <el-form-item :label="$root.labels.recurring_on">
              <el-select
                v-model="initialRecurringData.monthDateRule"
                @change="setRecurringValues('date')"
              >
                <el-option
                  v-for="(option, index) in monthlyWeekDayRepeat"
                  :key="index"
                  :value="option.value"
                  :label="option.label + (index !== 0 ? (' ' + initialRecurringData.selectedMonthlyWeekDayString) : '')"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24" :style="{'opacity': initialRecurringData.cycle !== null ? 1 : 0.2, 'pointer-events': initialRecurringData.cycle !== null ? 'all' : 'none'}">
          <el-col :sm="12" class="v-calendar-column">
            <el-form-item :label="$root.labels.recurring_until">
              <v-date-picker
                v-model="initialRecurringData.maxDate"
                @input="setRecurringValues('date')"
                :is-double-paned="false"
                mode='single'
                popover-visibility="focus"
                popover-direction="bottom"
                popover-align="center"
                :tint-color='$root.settings.customization.primaryColor'
                input-class='el-input__inner'
                :show-day-popover=false
                :input-props='{class: "el-input__inner"}'
                :is-expanded=false
                :is-required=true
                :formats="vCalendarFormats"
                :available-dates="{start: minFrom, end: maxUntil}"
                :disabled="initialRecurringData.cycle === null"
              >
              </v-date-picker>
            </el-form-item>
          </el-col>

          <el-col :sm="12" class="am-recurring-setup-times">
            <el-form-item :label="$root.labels.recurring_times">
              <el-input-number
                v-model="initialRecurringData.maxCount"
                :min="1"
                @change="setRecurringValues('count')"
                :disabled="initialRecurringData.cycle === 0"
              >
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="am-recurring-setup-description" v-if="isFrontend && selectedRecurringInterval">
          <span>{{ recurringData.recurringString }}</span>
          <br>
          <span>{{ $root.labels.recurring_from_text + ' ' + getFromDateFormatted() + ' ' + $root.labels.at + ' ' + getFromTimeFormatted() }}</span>
        </div>

        <!-- Back & Continue Buttons -->
        <div class="am-button-wrapper" v-if="isFrontend">
          <!-- Back Button -->
          <transition name="fade">
            <el-button @click="cancelRecurringSetup()">
              {{ $root.labels.back }}
            </el-button>
          </transition>

          <!-- Continue Button -->
          <transition name="fade">
            <el-button class="am-recurring-continue" @click="confirmRecurringSetup" :disabled="!initialRecurringData.maxDate || recurringData.dates.length === 0">
              {{ $root.labels.continue }}
            </el-button>
          </transition>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
  import recurringMixin from '../../js/common/mixins/recurringMixin'
  import dateMixin from '../../js/common/mixins/dateMixin'
  import helperMixin from '../../js/backend/mixins/helperMixin'
  import moment from 'moment'

  export default {

    mixins: [dateMixin, recurringMixin, helperMixin],

    props: {
      containerId: null,
      initialRecurringData: null,
      recurringData: null,
      availableDates: null,
      disabledWeekdays: null,
      calendarTimeSlots: null,
      service: null,
      isFrontend: true,
      calendarPosition: 'bottom'
    },

    data () {
      return {
        monthlyWeekDayRepeat: [
          {
            label: this.$root.labels.date_specific,
            value: 0
          },
          {
            label: this.$root.labels.recurring_date_first,
            value: 1
          },
          {
            label: this.$root.labels.recurring_date_second,
            value: 2
          },
          {
            label: this.$root.labels.recurring_date_third,
            value: 3
          },
          {
            label: this.$root.labels.recurring_date_fourth,
            value: 4
          },
          {
            label: this.$root.labels.recurring_date_last,
            value: 5
          }
        ],
        cycles: [
          {
            label: this.$root.labels.recurring_type_daily,
            value: 'daily'
          },
          {
            label: this.$root.labels.recurring_type_weekly,
            value: 'weekly'
          },
          {
            label: this.$root.labels.recurring_type_monthly,
            value: 'monthly'
          }
        ],
        weekDays: [],
        recurring: {
          maxDate: null
        }
      }
    },

    created () {
      this.weekDays = []

      for (let i = 0; i < 7; i++) {
        this.weekDays.push({
          label: moment().isoWeekday(i + 1).format('dd'),
          enabled: true
        })
      }
    },

    mounted () {
      this.scrollView('am-recurring-setup', 'start')
      this.recurring.maxDate = this.initialRecurringData.calendarDates[this.initialRecurringData.calendarDates.length - 1]

      if (this.initialRecurringData.weekDaysSelected.length === 0) {
        this.initialRecurringData.weekDaysSelected.push(this.initialRecurringData.selectedWeekDayIndex)
      }

      if (!this.isFrontend) {
        this.recurringData.setupCallback = this.setRecurringValues
      }

      this.setRecurringValues('count')
    },

    methods: {
      setRecurringValues: function () {},

      getFromDateFormatted () {
        return this.getFrontedFormattedDate(
          moment(this.recurringData.startDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD')
        )
      },

      getFromTimeFormatted () {
        return this.getFrontedFormattedTime(
          moment(this.recurringData.startDate, 'YYYY-MM-DD HH:mm:ss').format('HH:mm')
        )
      },

      confirmRecurringSetup: function () {},

      cancelRecurringSetup: function () {}
    },

    computed: {
      maxUntil () {
        return moment(this.initialRecurringData.calendarDates[this.initialRecurringData.calendarDates.length - 1]).toDate()
      },

      minFrom () {
        return moment(this.recurringData.startDate, 'YYYY-MM-DD').add(1, 'days').toDate()
      },

      selectedRecurringInterval () {
        return this.initialRecurringData.repeatIntervalLabels.find(item => item.value === this.initialRecurringData.cycleInterval)
      }
    }
  }
</script>
