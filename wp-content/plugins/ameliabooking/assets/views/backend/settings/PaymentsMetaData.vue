<template>
  <div>
    <div v-show="data.stripe.enabled">
      <el-row :gutter="24" class="zero-margin-bottom">
        <el-col :span="11">
          <el-form-item :label="$root.labels.name + ':'">
          </el-form-item>
        </el-col>
        <el-col :span="11">
          <label class="el-form-item__label">
          {{$root.labels.value + ': '}}
          <el-tooltip placement="top">
            <div slot="content">{{ $root.labels.metadata_value_tooltip }}</div>
            <i class="el-icon-question am-tooltip-icon"></i>
          </el-tooltip>
          </label>
        </el-col>
      </el-row>
      <el-row :gutter="24" type="flex" v-for="(pair, index) in stripeMetaData" :key="index" class="small-margin-bottom am-payments-meta-data">
        <el-col :span="10">
            <el-input type="text" :name="pair.name" v-model="stripeMetaData[index].key"/>
        </el-col>
        <el-col :span="10">
            <el-input type="text" v-model="stripeMetaData[index].value"/>
        </el-col>
        <el-col :span="4">
          <span @click="deletePair(index)">
            <img class="svg" width="16px" :src="$root.getUrl+'public/img/delete.svg'">
          </span>
        </el-col>
      </el-row>
      <el-row :gutter="24">
        <el-col>
          <el-button type="primary" v-on:click="addPair()">{{$root.labels.add_metaData}}</el-button>
        </el-col>
      </el-row>
    </div>
    <el-form-item :label="$root.labels.description_wc + ':'" v-show="data.wc.enabled">
      <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 6}"
          v-model="description_wc"
      >
      </el-input>
    </el-form-item>
    <el-form-item :label="$root.labels.description_paypal + ':'" v-show="data.payPal.enabled">
      <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 6}"
          v-model="description_paypal"
      >
      </el-input>
    </el-form-item>
    <el-form-item :label="$root.labels.description_stripe + ':'" v-show="data.stripe.enabled">
      <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 6}"
          v-model="description_stripe"
      >
      </el-input>
    </el-form-item>
    <el-form-item>
      <inline-placeholders
        :placeholdersNames="getInlinePlaceholdersNames()"
        :excludedPlaceholders="{
          appointmentPlaceholders: [
            '%zoom_host_url%',
            '%zoom_join_url%',
            '%appointment_cancel_url%',
            '%reservation_name%',
            '%reservation_description%'
          ],
          eventPlaceholders: [
            '%event_cancel_url%',
            '%zoom_join_url_date%',
            '%zoom_join_url_date_time%',
            '%zoom_host_url_date%',
            '%zoom_host_url_date_time%',
            '%reservation_name%',
            '%reservation_description%'
          ]
        }"
        :customFields="customFields"
        :categories="categories"
        :coupons="coupons"
        userTypeTab="provider"
      >
      </inline-placeholders>
    </el-form-item>
  </div>
</template>

<script>
import InlinePlaceholders from '../notifications/common/InlinePlaceholders'

export default {
  name: 'PaymentsMetaData',
  props: {
    customFields: {
      default: () => []
    },
    categories: {
      default: () => []
    },
    coupons: {
      default: () => []
    },
    data: Object,
    tab: String
  },
  data () {
    return {
      stripeMetaData: null
    }
  },
  mounted () {
    this.stripeMetaData = Object.entries(this.metaData).map(([key, value]) => ({ key, value }))
    this.stripeMetaData.push({key: '', value: ''})
  },
  computed: {
    description_wc: {
      get () {
        switch (this.tab) {
          case ('appointments'):
            return this.data.wc.checkoutData.appointment

          case ('events'):
            return this.data.wc.checkoutData.event

          case ('packages'):
            return this.data.wc.checkoutData.package
        }
      },
      set (newDescription) {
        switch (this.tab) {
          case ('appointments'):
            this.data.wc.checkoutData.appointment = newDescription
            break

          case ('events'):
            this.data.wc.checkoutData.event = newDescription
            break

          case ('packages'):
            this.data.wc.checkoutData.package = newDescription
            break
        }
      }
    },
    description_paypal: {
      get () {
        switch (this.tab) {
          case ('appointments'):
            return this.data.payPal.description.appointment

          case ('events'):
            return this.data.payPal.description.event

          case ('packages'):
            return this.data.payPal.description.package
        }
      },
      set (newDescription) {
        switch (this.tab) {
          case ('appointments'):
            this.data.payPal.description.appointment = newDescription
            break

          case ('events'):
            this.data.payPal.description.event = newDescription
            break

          case ('packages'):
            this.data.payPal.description.package = newDescription
            break
        }
      }
    },
    description_stripe: {
      get () {
        switch (this.tab) {
          case ('appointments'):
            return this.data.stripe.description.appointment

          case ('events'):
            return this.data.stripe.description.event

          case ('packages'):
            return this.data.stripe.description.package
        }
      },
      set (newDescription) {
        switch (this.tab) {
          case ('appointments'):
            this.data.stripe.description.appointment = newDescription
            break

          case ('events'):
            this.data.stripe.description.event = newDescription
            break

          case ('packages'):
            this.data.stripe.description.package = newDescription
            break
        }
      }
    },
    metaData: {
      get () {
        switch (this.tab) {
          case ('appointments'):
            return this.data.stripe.metaData.appointment != null ? this.data.stripe.metaData.appointment : {}

          case ('events'):
            return this.data.stripe.metaData.event != null ? this.data.stripe.metaData.event : {}

          case ('packages'):
            return this.data.stripe.metaData.package != null ? this.data.stripe.metaData.package : {}
        }
      }
    }
  },
  methods: {
    getInlinePlaceholdersNames () {
      let common = [
        'customerPlaceholders',
        'companyPlaceholders'
      ]

      switch (this.tab) {
        case ('packages'):
          return common.concat(
            [
              'packagePlaceholders'
            ]
          )

        case ('events'):
          return common.concat(
            [
              'eventPlaceholders',
              'customFieldsPlaceholders',
              'employeePlaceholders',
              'locationPlaceholders',
              'couponsPlaceholders'
            ]
          )

        case ('appointments'):
          return common.concat(
            [
              'appointmentPlaceholders',
              'customFieldsPlaceholders',
              'employeePlaceholders',
              'categoryPlaceholders',
              'locationPlaceholders',
              'couponsPlaceholders',
              'extrasPlaceholders'
            ]
          )
      }

      return common
    },
    addPair () {
      this.stripeMetaData.push({key: '', value: ''})
    },
    deletePair (index) {
      this.stripeMetaData.splice(index, 1)
    }
  },
  components: {InlinePlaceholders}
}
</script>
