<template>
  <div id="am-confirm-booking" :class="dialogClass" class="am-confirmation-booking">

    <!-- Confirm Booking Form -->
    <div v-show="fetched">

      <!-- Header Error-->
      <div class="am-payment-error">
        <el-alert
          :id="'am-payment-error-' + $root.shortcodeData.counter"
          :title="headerErrorMessage !== '' ? headerErrorMessage : $root.labels.payment_error"
          type="warning"
          v-show="headerErrorShow"
          show-icon
        >
        </el-alert>
      </div>
      <!-- /Header Error-->

      <!-- Confirm Dialog Header -->
      <div class="am-confirmation-booking-header" v-show="fetched" v-if="bookableType === 'appointment'">
        <img :src="pictureLoad(bookable, false)" @error="imageLoadError(bookable, false)" :alt="bookable.name"/>
        <h2>{{ bookable.name }}</h2>
      </div>
      <!-- /Confirm Dialog Header -->

      <!-- Confirm Dialog Package -->
      <div class="am-confirmation-booking-package-wrapper" v-if="bookableType === 'package' && hasHeader">

        <!-- Package Header -->
        <div class="am-package-header">

          <!-- Package Header Image Data container -->
          <div class="am-package-header-image-data-wrapper">
            <!-- Package Image -->
            <div class="am-package-image">
              <img :src="pictureLoad(bookable, false)" @error="imageLoadError(bookable, false)"/>
              <span :style="{'background-color': bookable.color}">
                <img :src="$root.getUrl + 'public/img/am-package-catalog.svg'">
              </span>
            </div>
            <!-- /Package Image -->

            <!-- Package Data -->
            <div class="am-package-data">

              <!-- Package Name -->
              <div class="am-package-title">
                <h2>{{ bookable.name }}</h2>
              </div>
              <!-- /Package Name -->
            </div>
            <!-- /Package Data -->
          </div>
          <!-- /Package Header Image Data container -->

          <!-- Package Price Container -->
          <div class="am-package-price" v-if="bookable.price">
            <!-- Package Price -->
            <div class="am-package-price__wrapper" :class="{'am-service-price__wrapper-discount': bookable.discount && !bookable.calculatedPrice}">
              {{ getFormattedPrice(bookable.price, !$root.settings.payments.hideCurrencySymbolFrontend) }}
            </div>
            <!-- /Package Price -->

            <!-- Package Discount -->
            <div v-if="bookable.discount && !bookable.calculatedPrice" class="am-package-price__discount">
              <img class="am-package-price__discount-image" :src="$root.getUrl + 'public/img/am-package-catalog.svg'">
              <div class="am-package-price__discount-text">
                {{ $root.labels.package_discount_text + ' ' + bookable.discount + '%' }}
              </div>
            </div>
            <!-- /Package Discount -->
          </div>
          <!-- /Package Price Container -->

        </div>
        <!-- /Package Header -->
      </div>
      <!-- /Confirm Dialog Package -->

      <!-- Confirm Dialog Body -->
      <el-form
        :model="appointment.bookings[0]"
        ref="booking"
        :rules="rules"
        label-position="top"
        @submit.prevent="onSubmit"
        class="am-confirm-booking-form"
      >
        <el-row class="am-confirm-booking-data" :gutter="24">
          <!-- Booking Data -->
          <el-col :sm="24">
            <div class="am-confirmation-booking-details" v-if="bookableType === 'appointment'">

              <!-- Employee -->
              <div>
                <p>{{ capitalizeFirstLetter($root.labels.employee) }}:</p>
                <p class="am-semi-strong">
                  <img
                    class="am-employee-photo"
                    :src="pictureLoad(provider, true)"
                    @error="imageLoadError(provider, true)"
                    alt="provider.firstName + ' ' + provider.lastName"
                  />
                  {{ provider.firstName + ' ' + provider.lastName }}
                </p>
              </div>
              <!-- /Employee -->

              <!-- Date -->
              <div>
                <p>{{ $root.labels.date_colon }}</p>
                <p class="am-semi-strong">
                  {{ getAppointmentDate() }}
                </p>
              </div>
              <!-- /Date -->

              <!-- Time -->
              <div>
                <p>{{ $root.labels.time_colon }}</p>
                <p class="am-semi-strong">
                  {{ getAppointmentTime() }}
                </p>
              </div>
              <!-- /Time -->

              <!-- Location -->
              <div>
                <p v-if="location !== null">{{ $root.labels.location_colon }}</p>
                <p class="am-semi-strong">{{ location ? location.name : '' }}</p>
              </div>
              <!-- /Location -->

            </div>
          </el-col>
          <!-- /Booking Data -->

          <el-col :sm="24">
            <div class="am-confirmation-booking-details recurring-string"
                 v-if="recurringData.length">

              <div>
                <p>{{ $root.labels.recurring_active }}</p>
                <p class="am-semi-strong">{{ recurringString }}</p>
              </div>

            </div>
          </el-col>

          <!-- Customer First Name -->
          <el-col :sm="columnsLg" ref="customer.firstName">
            <el-form-item :label="$root.labels.first_name_colon" prop="customer.firstName">
              <el-input
                v-model="appointment.bookings[0].customer.firstName"
                @keyup.native="validateFieldsForPayPal"
                @input="clearValidation()"
                :disabled="!!appointment.bookings[0].customer.firstName && !!appointment.bookings[0].customer.id"
                autocomplete="new-password"
              >
              </el-input>
            </el-form-item>
          </el-col>
          <!-- /Customer First Name -->

          <!-- Customer Last Name -->
          <el-col :sm="columnsLg" ref="customer.lastName">
            <el-form-item :label="$root.labels.last_name_colon" prop="customer.lastName">
              <el-input
                v-model="appointment.bookings[0].customer.lastName"
                @keyup.native="validateFieldsForPayPal"
                @input="clearValidation()"
                :disabled="!!appointment.bookings[0].customer.lastName && !!appointment.bookings[0].customer.id"
                autocomplete="new-password"
              >
              </el-input>
            </el-form-item>
          </el-col>
          <!-- /Customer Last Name -->

          <!-- Customer Email -->
          <el-col :sm="columnsLg" ref="customer.email">
            <el-form-item :label="$root.labels.email_colon" prop="customer.email" :error="errors.email">
              <el-input
                v-model="appointment.bookings[0].customer.email"
                @keyup.native="validateFieldsForPayPal"
                @input="clearValidation()"
                :disabled="!!appointment.bookings[0].customer.email && !!appointment.bookings[0].customer.id"
                :placeholder="$root.labels.email_placeholder"
                autocomplete="new-password"
              >
              </el-input>
            </el-form-item>
          </el-col>
          <!-- /Customer Email -->

          <!-- User Phone -->
          <el-col :sm="columnsLg" ref="customer.phone">
            <el-form-item :label="$root.labels.phone_colon" prop="customer.phone" :error="errors.phone">
              <phone-input
                :savedPhone="appointment.bookings[0].customer.phone"
                :disabled="!!appointment.bookings[0].customer.id && phonePopulated === true"
                :countryPhoneIso="appointment.bookings[0].customer.countryPhoneIso"
                @keyup.native="validateFieldsForPayPal"
                v-on:phoneFormatted="phoneFormatted"
              >
              </phone-input>
            </el-form-item>
          </el-col>
          <!-- /User Phone -->

          <!-- Custom Fields -->
          <div class="am-custom-fields">
            <el-row :gutter="24">
              <el-col
                v-for="(customField, key) in customFields"
                v-if="isBookableCustomFieldVisible(customField)"
                :key="customField.id"
                :sm="columnsLg"
                :ref="'customFields.' + customField.id + '.value'"
              >
                <el-form-item
                  :label="customField.type !== 'content' && customField.label ? customField.label : ':'"
                  :prop="customField.required === true && customField.type !== 'content' && customField.type !== 'file' ? 'customFields.' + customField.id + '.value' : (customField.required === true && customField.type !== 'file' ? 'inputFile' : null)"
                  :error="errors.files && customField.type === 'file' && customField.required ? errors.files['files' + customField.id] : null"
                  :class="getCustomFieldClass(customField)"
                >

                  <!-- Text Field -->
                  <el-input
                    v-if="customField.type === 'text'"
                    placeholder=""
                    v-model="appointment.bookings[0].customFields[customField.id].value"
                    @input="clearValidation()"
                  >
                  </el-input>
                  <!-- /Text Field -->

                  <!-- Text Area -->
                  <el-input
                    v-else-if="customField.type === 'text-area'"
                    class="am-front-texarea"
                    placeholder=""
                    v-model="appointment.bookings[0].customFields[customField.id].value"
                    type="textarea"
                    :rows="3"
                    @input="clearValidation()"
                  >
                  </el-input>
                  <!-- /Text Area -->

                  <!-- Text Content -->
                  <div v-else-if="customField.type === 'content'" class="am-text-content">
                    <i class="el-icon-info"></i>
                    <p style='display: inline;' v-html="customField.label"></p>
                  </div>
                  <!-- /Text Content -->

                  <!-- Selectbox -->
                  <el-select
                    v-else-if="customField.type === 'select'"
                    placeholder=""
                    v-model="appointment.bookings[0].customFields[customField.id].value"
                    clearable
                    @change="clearValidation()"
                  >
                    <el-option
                      v-for="(option, index) in getCustomFieldOptions(customField.options)"
                      :key="index"
                      :value="option"
                      :label="option"
                      :style="{'color': appointment.bookings[0].customFields[customField.id].value === option ? bookable.color : ''}"
                    >
                    </el-option>
                  </el-select>
                  <!-- /Selectbox -->

                  <!-- Checkbox -->
                  <el-checkbox-group
                    v-else-if="customField.type === 'checkbox'"
                    v-model="appointment.bookings[0].customFields[customField.id].value"
                    @change="selectedCustomFieldValue"
                  >
                    <el-checkbox
                      v-for="(option, index) in getCustomFieldOptions(customField.options)"
                      :key="index"
                      :label="option"
                    >
                    </el-checkbox>
                  </el-checkbox-group>
                  <!-- /Checkbox -->

                  <!-- Radio Buttons -->
                  <el-radio-group
                    v-else-if="customField.type === 'radio'"
                    v-model="appointment.bookings[0].customFields[customField.id].value"
                    @change="selectedCustomFieldValue"
                  >
                    <el-radio
                      v-for="(option, index) in getCustomFieldOptions(customField.options)"
                      :key="index"
                      :label="option"
                      ref="customFieldsRadioButtons"
                    >
                    </el-radio>
                  </el-radio-group>
                  <!-- /Radio Buttons -->

                  <!-- Upload Files -->
                  <div v-if="customField.type === 'file'">
                    <el-upload
                      :auto-upload="false"
                      action=""
                      drag
                      ref="customFieldsFiles"
                      :accept="$root.fileUploadExtensions.join(',')"
                      :on-change="onSelectFiles"
                      multiple
                    >
                      <i class="el-icon-upload"></i><span>{{$root.labels.file_upload}}</span>
                    </el-upload>
                  </div>
                  <!-- /Upload Files -->

                  <!-- Date picker -->
                  <div v-if="customField.type === 'datepicker'">
                    <v-date-picker
                      v-model="appointment.bookings[0].customFields[customField.id].value"
                      class='am-calendar-picker'
                      @input="clearValidation()"
                      mode='single'
                      popover-visibility="focus"
                      popover-direction="top"
                      :popover-align="screenWidth < 768 ? 'center' : 'left'"
                      :tint-color='"#1A84EE"'
                      :show-day-popover=false
                      :input-props='{class: "el-input__inner"}'
                      input-class="el-input__inner"
                      :is-expanded=false
                      :is-required=true
                      :disabled=false
                      :formats="vCalendarFormats"
                    ></v-date-picker>
                  </div>
                  <!-- /Date picker -->

                </el-form-item>
              </el-col>

              <!-- Recaptcha -->
              <el-col
                :sm="columnsLg"
                :class="$root.settings.general.googleRecaptcha.invisible ? '' : 'am-confirm-booking-recaptcha'"
                v-if="$root.settings.general.googleRecaptcha.enabled"
              >
                <el-form-item :error="errors.recaptcha">
                  <div id="recaptcha">
                    <vue-recaptcha
                      ref="recaptcha"
                      :size="$root.settings.general.googleRecaptcha.invisible ? 'invisible' : null"
                      @verify="onRecaptchaVerify"
                      @expired="onRecaptchaExpired"
                      :loadRecaptchaScript="true"
                      class="am-confirm-booking-recaptcha-block"
                      :sitekey="$root.settings.general.googleRecaptcha.siteKey">
                    </vue-recaptcha>
                  </div>
                </el-form-item>
              </el-col>
              <!-- /Recaptcha -->
            </el-row>
          </div>
          <!-- /Custom Fields -->

        </el-row>

        <!-- Payment Method & Stripe Card -->
        <el-row :gutter="24" class="am-confirm-booking-payment">

          <!-- Payment Method -->
          <el-col :sm="columnsLg" v-show="paymentOptions.length > 1">
            <transition name="fade">
              <el-form-item
                  :label="$root.labels.payment_method_colon"
                  v-if="getTotalPrice() > 0 && !this.$root.settings.payments.wc.enabled"
              >
                <el-select
                    v-model="appointment.payment.gateway"
                    placeholder=""
                    :disabled="paymentOptions.length === 1"
                    @change="clearValidation()"
                >
                  <el-option
                      v-for="item in paymentOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      :style="{'color': appointment.payment.gateway === item.value ? bookable.color : ''}"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </transition>
          </el-col>
          <!-- /Payment Method -->

          <!-- Stripe Card -->
          <el-col :sm="columnsLg">
            <transition name="fade">
              <el-form-item
                  :label="$root.labels.credit_or_debit_card_colon"
                  v-show="appointment.payment.gateway === 'stripe' && getTotalPrice() > 0"
                  :error="errors.stripe"
              >
                <div :id="'card-element-' + this.$root.shortcodeData.counter"></div>
              </el-form-item>
            </transition>
          </el-col>
          <!-- /Stripe Card -->

        </el-row>
        <!-- /Payment Method & Stripe Card -->

        <!-- Appointment Data -->
        <el-row>
          <el-col :sm="24">

            <!-- Payment Data -->
            <div class="am-confirmation-booking-cost" v-if="!packageData">

              <!-- Number Of Persons -->
              <el-row :gutter="24" v-if="bookable.maxCapacity > 1">
                <el-col :span="12">
                  <p>{{ $root.labels.total_number_of_persons }}</p>
                </el-col>
                <el-col :span="12">
                  <p class="am-semi-strong am-align-right">
                    {{ appointment.bookings[0].persons }}
                  </p>
                </el-col>
              </el-row>
              <!-- /Number Of Persons -->

              <!-- Appointment Price -->
              <el-row :gutter="24" v-for="(item, index) in instantPaymentBasePriceData" :key="index">
                <el-col :span="6">
                  <p :style="{'visibility': index === 0 ? 'visible' : 'hidden'}">{{ $root.labels.base_price_colon }}</p>
                </el-col>
                <el-col :span="18">
                  <p class="am-semi-strong am-align-right">
                    {{ getBookingBasePriceCalculationString(item.count, item.price) }}
                  </p>
                </el-col>
              </el-row>
              <!-- /Appointment Price -->

              <!-- Extras Price -->
              <el-row
                  class="am-confirmation-extras-cost" :gutter="24"
                  v-if="appointment.bookings[0].extras.length > 0 && getTotalPrice() > 0"
              >
                <el-collapse accordion v-if="selectedExtras.length > 0">
                  <el-collapse-item name="1">
                    <template slot="title">
                      <div class="am-extras-title">{{ $root.labels.extras_costs_colon }}</div>
                      <div
                        class="am-extras-total-cost am-semi-strong"
                        :style="bookableType === 'event' && !useGlobalCustomization ? getBookableColor(false) : {}"
                      >
                        {{ getFormattedPrice(getExtrasPrice(instantPaymentBookingsCount), !$root.settings.payments.hideCurrencySymbolFrontend) }}
                      </div>
                    </template>
                    <div v-for="extra in selectedExtras">
                      <div class="am-extras-details">{{ extra.name }}</div>
                      <div class="am-extras-cost">{{ getSelectedExtraDetails(extra) }}</div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
                <div v-else>
                  <el-col :span="12">
                    <p>{{ $root.labels.extras_costs_colon }}</p>
                  </el-col>
                  <el-col :span="12">
                    <p class="am-semi-strong am-align-right">
                      {{ getFormattedPrice(getExtrasPrice(instantPaymentBookingsCount), !$root.settings.payments.hideCurrencySymbolFrontend) }}
                    </p>
                  </el-col>
                </div>
              </el-row>
              <!-- /Extras Price -->

              <!-- Subtotal Price -->
              <el-row :gutter="24" v-if="appointment.bookings[0].extras.length > 0 && bookable.price">
                <el-col :span="10">
                  <p>{{ $root.labels.subtotal_colon }}</p>
                </el-col>
                <el-col :span="14">
                  <p class="am-semi-strong am-align-right">
                    {{ getFormattedPrice(getSubtotalPrice(), !$root.settings.payments.hideCurrencySymbolFrontend) }}
                  </p>
                </el-col>
              </el-row>
              <!-- /Subtotal Price -->

              <!-- Discount Price -->
              <el-row :gutter="24" v-if="$root.settings.payments.coupons && bookable.price > 0">
                <el-col :span="8">
                  <p>{{ $root.labels.discount_amount_colon }}</p>
                </el-col>
                <el-col :span="16">
                  <p class="am-semi-strong am-align-right">
                    {{ getFormattedPrice(getDiscountData('instant'), !$root.settings.payments.hideCurrencySymbolFrontend) }}
                  </p>
                </el-col>
              </el-row>
              <!-- /Discount Price -->

              <!-- Coupon -->
              <el-row
                  :gutter="0" class="am-add-coupon am-flex-row-middle-align"
                  v-if="$root.settings.payments.coupons && bookable.price > 0"
              >

                <!-- Coupon Label -->
                <el-col v-if="bookableType === 'appointment'" :sm="10" :xs="10">
                  <img :src="$root.getUrl+'public/img/coupon.svg'" class="svg" alt="add-coupon">
                  <span>{{ $root.labels.add_coupon }}</span>
                </el-col>
                <el-col v-else :sm="10" :xs="10">
                  <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    <desc>Created with Sketch.</desc>
                    <defs></defs>
                    <g id="Icons" stroke="none" stroke-width="1" :style="{'fill':bookable.color}" fill-rule="evenodd">
                      <g id="Group" :fill="bookable.color">
                        <path :style="{'fill':bookable.color}"
                              d="M7.152,12.7704615 C6.29353846,11.5809231 6.26092308,10.8652308 6.23446154,10.2904615 C6.22953846,10.1852308 6.22584615,10.0978462 6.21661538,10.0055385 C6.17415385,9.54953846 5.84676923,8.64738462 5.22769231,7.74461538 C4.37538462,6.49907692 3.79384615,4.63569231 4.95876923,3.48307692 C5.232,3.21230769 5.58523077,3.06953846 5.97907692,3.06953846 C6.952,3.06953846 7.98892308,4.02892308 8.61538462,4.85846154 L8.61538462,3.55261538 L8.61538462,1.23261538 C8.61538462,0.552615385 8.06276923,0 7.38461538,0 L5.53661538,0 C5.36861538,0 5.232,0.134769231 5.22892308,0.302769231 C5.22092308,0.804923077 4.80738462,1.21353846 4.30769231,1.21353846 C3.80738462,1.21353846 3.39446154,0.804923077 3.38646154,0.302769231 C3.38338462,0.134769231 3.24676923,0 3.07876923,0 L1.23076923,0 C0.552,0 0,0.552615385 0,1.23261538 L0,12.3058462 C0,12.9858462 0.552,13.5384615 1.23076923,13.5384615 L3.07692308,13.5384615 C3.24676923,13.5384615 3.38461538,13.4006154 3.38461538,13.2307692 C3.38461538,12.7206154 3.79876923,12.3058462 4.30769231,12.3058462 C4.81661538,12.3058462 5.23076923,12.7206154 5.23076923,13.2307692 C5.23076923,13.4006154 5.36861538,13.5384615 5.53846154,13.5384615 L7.38461538,13.5384615 C7.52430769,13.5384615 7.65907692,13.5101538 7.78707692,13.4646154 C7.56738462,13.2683077 7.352,13.048 7.152,12.7704615"
                              id="Fill-1450"></path>
                        <path :style="{'fill':bookable.color}"
                              d="M15.9536615,11.8383385 C15.9487385,11.8303385 15.4373538,10.9934154 15.0724308,9.83095385 C14.9881231,9.55956923 14.8816615,9.17741538 14.7604308,8.73987692 C14.1825846,6.66295385 13.6588923,4.89741538 13.0865846,4.32141538 C12.9450462,4.17987692 12.5161231,3.74787692 9.58812308,3.26295385 C9.50135385,3.2488 9.40843077,3.27341538 9.33950769,3.33187692 C9.27058462,3.39033846 9.23058462,3.47587692 9.23058462,3.56633846 L9.23058462,6.03956923 C9.23058462,6.16449231 9.30627692,6.27710769 9.42258462,6.32449231 L10.3192,6.68941538 C10.3782769,6.90172308 10.4908923,7.28572308 10.6016615,7.56572308 C10.5487385,7.65310769 10.5050462,7.75341538 10.4570462,7.86233846 C10.3764308,8.04695385 10.2878154,8.25064615 10.1518154,8.40018462 C9.55489231,8.01741538 8.95181538,6.91895385 8.56781538,5.96264615 C8.26504615,5.20756923 6.93273846,3.69926154 5.97889231,3.69926154 C5.74996923,3.69926154 5.54750769,3.78110769 5.3912,3.93495385 C4.49643077,4.81926154 5.01766154,6.35649231 5.73581538,7.40449231 C6.3272,8.26849231 6.7672,9.29187692 6.82996923,9.95218462 C6.83981538,10.0611077 6.84473846,10.1644923 6.84966154,10.2666462 C6.87489231,10.8100308 6.90073846,11.3724923 7.65089231,12.4112615 C8.04289231,12.9534154 8.50135385,13.2721846 8.98627692,13.6100308 C9.67858462,14.0912615 10.3942769,14.5897231 11.1179692,15.8457231 C11.1727385,15.9411077 11.2742769,16.0001846 11.3844308,16.0001846 C15.0004308,16.0001846 15.9819692,12.1115692 15.9912,12.0721846 C16.0108923,11.9921846 15.9967385,11.9084923 15.9536615,11.8383385"
                              id="Fill-1452"></path>
                      </g>
                    </g>
                  </svg>
                  <span :style="{'color': bookable.color}">{{ $root.labels.add_coupon }}</span>
                </el-col>
                <!-- /Coupon Label -->

                <!-- Coupon Input -->
                <el-col :sm="14" :xs="14">
                  <el-form
                    :model="appointment.bookings[0].customer"
                    ref="coupon"
                    :rules="rules"
                    label-position="top"
                    @submit.prevent="onSubmit"
                    status-icon
                  >
                    <el-form-item prop="couponCode" :error="errors.coupon"
                                  :style="bookableType === 'event' && !useGlobalCustomization ? getBookableColor(false) : {}">
                      <el-input
                        v-model="coupon.code"
                        @input="clearValidation()"
                        type="text"
                        size="small"
                        class="am-add-coupon-field"
                        :style="bookableType === 'event' && !useGlobalCustomization ? getBookableColor(false) : {}"
                      >

                        <!-- Coupon Button -->
                        <el-button
                          class="am-add-coupon-button"
                          slot="append"
                          size="mini"
                          icon="el-icon-check" @click="checkCoupon"
                          :disabled="coupon.code === ''"
                          :style="bookableType === 'event' && !useGlobalCustomization ? getBookableColor(true) : {}"
                        >
                        </el-button>
                        <!-- /Coupon Button -->

                      </el-input>
                    </el-form-item>
                  </el-form>
                </el-col>
                <!-- /Coupon Input -->

              </el-row>
              <!-- /Coupon -->

              <!-- Coupons Used Message -->
              <el-row class="am-coupon-limit" v-show="$root.settings.payments.coupons && recurringData.length && couponLimit < recurringData.length + 1 && (coupon.discount || coupon.deduction)">
                <el-col :sm="2" :xs="4">
                  <div style="display: inline-block;">
                    <img :src="$root.getUrl+'public/img/coupon-limit.svg'" class="svg" alt="coupon-limit">
                  </div>
                </el-col>

                <el-col :sm="22" :xs="20">
                  <div class="am-coupon-limit-text">
                    <strong>{{ $root.labels.coupons_used }}</strong>
                    <p>{{ $root.labels.coupons_used_description }} {{ couponLimit }}</p>
                  </div>
                </el-col>
              </el-row>
              <!-- /Coupons Used Message -->

              <!-- Total Price -->
              <el-row class="am-confirmation-total" :gutter="24" v-if="bookable.price > 0"
                      :style="{'color': bookable.color, 'background-color': bookableType === 'event' && !useGlobalCustomization ? '#E8E8E8' : ''}">
                <el-col :span="12">
                  <p>
                    {{ $root.labels.total_cost_colon }}
                  </p>
                </el-col>
                <el-col :span="12">
                  <p class="am-semi-strong am-align-right" :style="{'color': bookable.color}">
                    {{ getFormattedPrice(getTotalPrice(), !$root.settings.payments.hideCurrencySymbolFrontend) }}
                  </p>
                </el-col>
              </el-row>
              <!-- /Total Price -->

              <!-- Recurring Price -->
              <el-row
                  class="am-confirmation-extras-cost" :gutter="24"
                  v-if="recurringData.length && postponedPaymentBasePriceData.length > 0"
              >
                <el-collapse accordion>
                  <el-collapse-item name="1">
                    <template slot="title">
                      <div class="am-extras-title">{{ $root.labels.recurring_costs_colon }}</div>
                      <div class="am-extras-total-cost am-semi-strong">
                        {{ getFormattedPrice(getPostponedPaymentTotalPrice(), !$root.settings.payments.hideCurrencySymbolFrontend) }}
                      </div>
                    </template>
                    <div v-for="(item, key) in postponedPaymentBasePriceData" :key="key">
                      <div class="am-extras-details" :style="{'visibility': key === 0 ? 'visible' : 'hidden'}">
                        {{ $root.labels.base_price_colon }}
                      </div>
                      <div class="am-extras-cost">{{ getBookingBasePriceCalculationString(item.count, item.price) }}
                      </div>
                    </div>
                    <div v-if="selectedExtras.length > 0">
                      <div class="am-extras-details"> {{ $root.labels.extras_costs_colon }}</div>
                      <div class="am-extras-cost">{{ getPostponedPaymentExtrasPriceDetails() }}</div>
                    </div>
                    <div v-if="getDiscountData('postponed')">
                      <div class="am-extras-details"> {{ $root.labels.discount_amount_colon }}</div>
                      <div class="am-extras-cost">
                        {{ getFormattedPrice(getDiscountData('postponed'), !$root.settings.payments.hideCurrencySymbolFrontend) }}
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </el-row>
              <!-- /Recurring Price -->

            </div>
            <div class="am-confirmation-booking-cost" v-else>
              <el-row class="am-confirmation-total" :gutter="24" v-if="bookable.price > 0">
                <el-col :span="12">
                  <p>
                    {{ $root.labels.total_cost_colon }}
                  </p>
                </el-col>
                <el-col :span="12">
                  <p class="am-semi-strong am-align-right">
                    {{ getFormattedPrice(bookable.price, !$root.settings.payments.hideCurrencySymbolFrontend) }}
                  </p>
                </el-col>
              </el-row>
            </div>
            <!-- /Payment Data -->

          </el-col>
        </el-row>
        <!-- /Appointment Data -->

      </el-form>
      <!-- /Confirm Dialog Body -->

      <!-- Confirm Dialog Footer -->
      <div class="dialog-footer payment-dialog-footer" slot="footer">
        <div class="el-button el-button--default"
          @mouseover="setBookableCancelStyle(true)"
          @mouseleave="setBookableCancelStyle(false)"
          :style="bookableType === 'event' ? bookableCancelStyle : ''"
          v-if="hasCancel"
          @click="cancelBooking()"
        >
          <span :style="bookableType === 'event' ? bookableCancelSpanStyle : ''">{{ $root.labels.cancel }}</span>
        </div>

        <div class="paypal-button el-button el-button--primary"
          @mouseover="setBookableConfirmStyle(true)"
          @mouseleave="setBookableConfirmStyle(false)"
          :style="bookableType === 'event' ? bookableConfirmStyle : ''"
          v-show="$root.settings.payments.payPal.enabled && appointment.payment.gateway === 'payPal' && getTotalPrice() > 0"
        >
          <div id="am-paypal-button-container"></div>
          <span>{{ $root.labels.confirm }}</span>
        </div>

        <div class="el-button el-button--primary"
           @mouseover="setBookableConfirmStyle(true)"
           @mouseleave="setBookableConfirmStyle(false)"
           :style="bookableType === 'event' ? bookableConfirmStyle : ''"
           v-show="showConfirmBookingButton"
           @click="confirmBooking()"
        >
          <span>{{ $root.labels.confirm }}</span>
        </div>
      </div>
      <!-- /Confirm Dialog Footer -->

    </div>
    <!-- /Confirm Booking Form -->

    <!-- Spinner & Waiting For Payment -->
    <div id="am-spinner" class="am-booking-fetched" v-show="!fetched">
      <h4 v-if="appointment.payment.gateway === 'payPal'">{{ $root.labels.waiting_for_payment }}</h4>
      <h4 v-else>{{ $root.labels.please_wait }}</h4>
      <div class="am-svg-wrapper">

        <!-- Oval Spinner -->
        <span v-if="bookableType === 'event' && !useGlobalCustomization">
          <svg width="160" height="160" class="am-spin" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg"
               stroke="#7F8FA4">
            <g fill="none" fill-rule="evenodd">
              <g transform="translate(1 1)" stroke-width="2">
                <path d="M36 18c0-9.94-8.06-18-18-18" :style="{'stroke':bookable.color}" :stroke="bookable.color">
                  <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 18 18"
                      to="360 18 18"
                      dur="1s"
                      repeatCount="indefinite"/>
                </path>
              </g>
            </g>
          </svg>

          <!-- HourGlass -->
          <svg width="12px" height="16px" class="am-hourglass" viewBox="0 0 12 16" version="1.1"
               xmlns="http://www.w3.org/2000/svg">
            <g id="Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"
               transform="translate(-2.000000, 0.000000)">
              <g id="sat" transform="translate(2.000000, 0.000000)" :style="{'fill': bookable.color}">
                <path :style="{'fill': bookable.color, 'stroke': 'none'}"
                      d="M8.37968,4.8 L3.32848,4.8 C3.22074667,4.8 3.12368,4.86506667 3.08208,4.9648 C3.04101333,5.06453333 3.06394667,5.1792 3.14021333,5.25546667 L5.67834667,7.79093333 C5.72794667,7.84106667 5.79621333,7.86933333 5.86661333,7.86933333 C5.95941333,7.8672 6.00634667,7.84106667 6.05594667,7.7904 L8.56901333,5.2544 C8.64474667,5.1776 8.66714667,5.06346667 8.62554667,4.96426667 C8.58448,4.86453333 8.48741333,4.8 8.37968,4.8"
                      id="Fill-694"></path>
                <path :style="{'fill': bookable.color, 'stroke': 'none'}"
                      d="M6.82293333,7.62293333 C6.6144,7.83146667 6.6144,8.16853333 6.82293333,8.37706667 L9.04,10.5941333 C9.74506667,11.2992 10.1333333,12.2368 10.1333333,13.2341333 L10.1333333,14.4 L9.2,14.4 L6.08,10.24 C5.9792,10.1056 5.75413333,10.1056 5.65333333,10.24 L2.53333333,14.4 L1.6,14.4 L1.6,13.2341333 C1.6,12.2368 1.98826667,11.2992 2.69333333,10.5941333 L4.9104,8.37706667 C5.11893333,8.16853333 5.11893333,7.83146667 4.9104,7.62293333 L2.69333333,5.40586667 C1.98826667,4.7008 1.6,3.7632 1.6,2.7664 L1.6,1.6 L10.1333333,1.6 L10.1333333,2.7664 C10.1333333,3.7632 9.74506667,4.7008 9.04,5.40586667 L6.82293333,7.62293333 Z M11.2,2.7664 L11.2,1.45173333 C11.5173333,1.26666667 11.7333333,0.9264 11.7333333,0.533333333 L11.7333333,0.266666667 C11.7333333,0.119466667 11.6138667,0 11.4666667,0 L0.266666667,0 C0.119466667,0 0,0.119466667 0,0.266666667 L0,0.533333333 C0,0.9264 0.216,1.26666667 0.533333333,1.45173333 L0.533333333,2.7664 C0.533333333,4.048 1.03253333,5.25386667 1.9392,6.16 L3.7792,8 L1.9392,9.84 C1.03253333,10.7461333 0.533333333,11.952 0.533333333,13.2341333 L0.533333333,14.5482667 C0.216,14.7333333 0,15.0736 0,15.4666667 L0,15.7333333 C0,15.8805333 0.119466667,16 0.266666667,16 L11.4666667,16 C11.6138667,16 11.7333333,15.8805333 11.7333333,15.7333333 L11.7333333,15.4666667 C11.7333333,15.0736 11.5173333,14.7333333 11.2,14.5482667 L11.2,13.2341333 C11.2,11.952 10.7008,10.7461333 9.79413333,9.84 L7.95413333,8 L9.79413333,6.16 C10.7008,5.25386667 11.2,4.048 11.2,2.7664 L11.2,2.7664 Z"
                      id="Fill-696"></path>
              </g>
            </g>
          </svg>
        </span>

        <span v-else>
          <img class="svg am-spin" :src="$root.getUrl+'public/img/oval-spinner.svg'"/>
          <img class="svg am-hourglass" :src="$root.getUrl+'public/img/hourglass.svg'"/>
        </span>
      </div>
    </div>
    <!-- /Spinner & Waiting For Payment -->

  </div>
</template>

<script>
  import moment from 'moment'
  import imageMixin from '../../../js/common/mixins/imageMixin'
  import PhoneInput from '../../parts/PhoneInput.vue'
  import dateMixin from '../../../js/common/mixins/dateMixin'
  import priceMixin from '../../../js/common/mixins/priceMixin'
  import VueRecaptcha from 'vue-recaptcha'
  import helperMixin from '../../../js/backend/mixins/helperMixin'
  import customFieldMixin from '../../../js/common/mixins/customFieldMixin'
  import windowMixin from '../../../js/backend/mixins/windowMixin'

  export default {
    mixins: [imageMixin, dateMixin, priceMixin, helperMixin, customFieldMixin, windowMixin],

    props: {
      containerId: null,
      recurringString: '',
      useGlobalCustomization: false,
      bookableType: null,
      bookable: {
        default: () => {},
        type: Object
      },
      recurringData: {
        default: () => []
      },
      packageData: null,
      hasCancel: true,
      hasHeader: true,
      appointment: {
        default: () => {},
        type: Object
      },
      provider: {
        default: () => {},
        type: Object
      },
      location: {
        default: () => {},
        type: Object
      },
      service: {
        default: () => {},
        type: Object
      },
      dialogClass: {
        default: '',
        type: String
      },
      customFields: {
        default: () => []
      }
    },

    data () {
      let validateCoupon = (rule, bookings, callback) => {
        let field = document.getElementsByClassName('am-add-coupon-field')[0].getElementsByClassName('el-input__suffix')[0]

        if (this.coupon.code) {
          this.$http.post(`${this.$root.getAjaxUrl}/coupons/validate`, {
            'code': this.coupon.code,
            'id': this.bookable.id,
            'type': this.bookableType,
            'user': this.appointment.bookings[0]['customer'],
            'count': this.recurringData.length ? this.recurringData.length + 1 : 1
          }).then(response => {
            this.coupon = response.data.data.coupon
            this.couponLimit = response.data.data.limit
            if (typeof field !== 'undefined') {
              field.style.visibility = 'visible'
            }
            callback()
          }).catch(e => {
            this.coupon.discount = 0
            this.coupon.deduction = 0

            if (e.response.data.data.couponUnknown === true) {
              callback(new Error(this.$root.labels.coupon_unknown))
            } else if (e.response.data.data.couponInvalid === true) {
              callback(new Error(this.$root.labels.coupon_invalid))
            } else {
              callback()
            }

            if (typeof field !== 'undefined') {
              field.style.visibility = 'hidden'
            }
          })
        } else {
          if (typeof field !== 'undefined') {
            field.style.visibility = 'hidden'
          }
          callback()
        }
      }

      let validatePhone = (rule, input, callback) => {
        if (input && input !== '' && !input.startsWith('+')) {
          callback(new Error(this.$root.labels.enter_valid_phone_warning))
        } else {
          callback()
        }
      }

      return {
        validRecaptcha: false,
        recaptchaResponse: false,
        customFieldsFiles: [],
        stripePayment: {
          stripe: null,
          cardElement: null
        },
        hoverConfirm: false,
        hoverCancel: false,
        columnsLg: 12,
        couponLimit: 0,
        coupon: {
          code: '',
          discount: 0,
          deduction: 0
        },
        clearValidate: true,
        errors: {
          email: '',
          coupon: '',
          stripe: '',
          recaptcha: '',
          files: {}
        },
        fetched: true,
        headerErrorMessage: '',
        headerErrorShow: false,
        payPalActions: null,
        phonePopulated: false,
        rules: {
          'customer.firstName': [
            {required: true, message: this.$root.labels.enter_first_name_warning, trigger: 'submit'}
          ],
          'customer.lastName': [
            {required: true, message: this.$root.labels.enter_last_name_warning, trigger: 'submit'}
          ],
          'customer.email': [
            {
              required: this.$root.settings.general.requiredEmailField,
              message: this.$root.labels.enter_email_warning,
              trigger: 'submit'
            },
            {type: 'email', message: this.$root.labels.enter_valid_email_warning, trigger: 'submit'}
          ],
          'customer.phone': [
            {
              required: this.$root.settings.general.requiredPhoneNumberField,
              message: this.$root.labels.enter_phone_warning,
              trigger: 'submit'
            },
            {validator: validatePhone, trigger: 'submit'}
          ],
          couponCode: [
            {validator: validateCoupon, trigger: 'submit'}
          ]
        }
      }
    },

    created () {
      this.inlineSVG()
      this.phonePopulated = this.appointment.bookings[0].customer.phone !== ''
      window.addEventListener('resize', this.handleResize)
    },

    mounted () {
      if (this.bookableType === 'event' && !this.useGlobalCustomization) {
        this.changeElementsColor('.el-upload-dragger', false, true, false)
        this.changeElementsColor('.el-upload-dragger span', true, true, false)
        this.changeElementsColor('.el-icon-upload', true, true, false)
        this.changeElementsColor('.el-input-group__append', false, false, true)
        this.changeElementsColor('.am-add-coupon-button', false, true, false)
        this.changeSelectedColor('.el-radio', 'is-checked', '.el-radio__label', true, false)
        this.changeSelectedColor('.el-radio', 'is-checked', '.el-radio__inner', false, true)
        this.changeSelectedColor('.el-checkbox', 'is-checked', '.el-checkbox__label', true, false)
        this.changeSelectedColor('.el-checkbox', 'is-checked', '.el-checkbox__inner', false, true)
      }

      this.setBookableConfirmStyle(false)
      this.setBookableCancelStyle(false)

      this.inlineSVG()

      // Get Default Payment Option
      let paymentOption = this.paymentOptions.find(option => option.value === this.$root.settings.payments.defaultPaymentMethod)
      this.appointment.payment.gateway = paymentOption ? paymentOption.value : this.paymentOptions[0].value

      if (this.bookableType === 'appointment') {
        this.saveStats()
      }

      this.addCustomFieldsValidationRules()
      if (this.$root.settings.payments.payPal.enabled) {
        this.payPalInit()
      }

      // Customization hook
      if ('beforeConfirmBookingLoaded' in window) {
        window.beforeConfirmBookingLoaded(this.appointment, this.bookable, this.provider, this.location)
      }

      let $this = this

      if (this.$root.settings.payments.stripe.enabled) {
        this.stripeInit()
      }

      if (this.bookableType === 'event' && !('ameliaBooking' in window && 'disableScrollView' in window.ameliaBooking && window.ameliaBooking.disableScrollView === true)) {
        setTimeout(() => {
          $this.scrollView('am-confirm-booking', 'start')
        }, 1200)
      }
    },

    updated () {
      if (this.clearValidate === true) {
        this.clearValidation()
        this.clearValidate = false
      }
      this.handleResize()
    },

    methods: {
      getPackagePrice (pack) {
        return pack.calculatedPrice ? pack.price : pack.price - pack.price / 100 * pack.discount
      },

      isBookableCustomFieldVisible (customField) {
        switch (this.bookableType) {
          case ('appointment'):
            return this.isCustomFieldVisible(customField, 'appointment', this.bookable.id)
          case ('package'):
            let customFieldVisible = false

            for (let i = 0; i < this.packageData.data.length; i++) {
              if (this.isCustomFieldVisible(customField, 'appointment', this.packageData.data[i].serviceId)) {
                customFieldVisible = true

                break
              }
            }

            return customFieldVisible
          case ('event'):
            return this.isCustomFieldVisible(customField, 'event', this.bookable.id)
        }
      },

      getCustomFieldClass: function () {},

      onRecaptchaExpired: function () {},

      onRecaptchaVerify: function () {},

      selectedCustomFieldValue: function () {},

      getBookableColor (colorBackground) {
        return colorBackground ? {
          'color': '#ffffff',
          'background-color': this.bookable.color,
          'border-color': '#ffffff'
        } : {
          'color': this.bookable.color,
          'background-color': '',
          'border-color': ''
        }
      },

      changeElementsColor (selector, isColor, isBorderColor, isBackgroundColor) {
        let elements = document.querySelectorAll(selector)

        for (let i = 0; i < elements.length; i++) {
          if (isColor) {
            elements[i].style.color = this.bookable.color
          }

          if (isBorderColor) {
            elements[i].style.borderColor = this.bookable.color
          }

          if (isBackgroundColor) {
            elements[i].style.backgroundColor = this.bookable.color
          }
        }
      },

      changeSelectedColor (selector, filterClass, childSelector, isColor, isBackgroundColor) {
        let elements = document.querySelectorAll(selector)

        for (let i = 0; i < elements.length; i++) {
          let color = elements[i].classList.contains(filterClass) ? this.bookable.color : 'inherit'

          let elementChildren = elements[i].querySelectorAll(childSelector)

          if (elementChildren.length) {
            if (isColor) {
              elementChildren[0].style.color = color
            }

            if (isBackgroundColor) {
              elementChildren[0].style.backgroundColor = color
            }
          }
        }
      },

      stripeInit: function () {},

      setBookableConfirmStyle (isHover) {
        if (!this.useGlobalCustomization && this.bookableType === 'event') {
          this.hoverConfirm = isHover
        }
      },

      setBookableCancelStyle (isHover) {
        if (!this.useGlobalCustomization && this.bookableType === 'event') {
          this.hoverCancel = isHover
        }
      },

      saveStats () {
        this.$http.post(`${this.$root.getAjaxUrl}/stats`, {
          'locationId': this.location !== null ? this.location.id : null,
          'providerId': this.provider.id,
          'serviceId': this.bookable.id
        })
      },

      handleServerResponse: function () {},

      cancelBooking () {
        this.$emit('cancelBooking')
      },

      onSelectFiles: function () {},

      validateUploadedFiles: function () {
        return true
      },

      isDefaultOnSitePayment () {
        return this.getTotalPrice() === 0 &&
          (
            this.appointment.payment.gateway === 'payPal' ||
            this.appointment.payment.gateway === 'stripe' ||
            (this.appointment.payment.gateway === 'wc' && 'ameliaBooking' in window && 'wc' in window.ameliaBooking && 'bookIfPriceIsZero' in window.ameliaBooking.wc && window.ameliaBooking.wc.bookIfPriceIsZero === true) ||
            (this.appointment.payment.gateway === 'wc' && this.$root.settings.payments.wc.onSiteIfFree)
          )
      },

      confirmBooking () {
        if (!this.fetched) {
          return
        }

        let $this = this

        this.headerErrorShow = false
        this.errors.email = ''
        this.errors.coupon = ''
        this.clearValidation()

        let paymentGateway = this.isDefaultOnSitePayment() ? 'onSite' : this.appointment.payment.gateway

        // Validate Form
        this.$refs.booking.validate((valid, validOptions) => {
          if (this.validateUploadedFiles() && valid && this.errors.stripe === '' && this.errors.coupon === '' && (paymentGateway !== 'onSite' || this.isRequiredAndValidRecaptcha())) {
            // Customization hook
            if ('afterConfirmBooking' in window) {
              window.afterConfirmBooking(this.appointment, this.bookable, this.provider, this.location)
            }

            this.fetched = false
            this.inlineSVG()

            this.appointment.payment.gateway = paymentGateway

            switch (this.appointment.payment.gateway) {
              case 'stripe':
                $this.stripePayment.stripe.createPaymentMethod('card', $this.stripePayment.cardElement, {}).then(function (result) {
                  if (result.error) {
                    $this.headerErrorShow = true
                    $this.headerErrorMessage = $this.$root.labels.payment_error
                    $this.fetched = true
                  } else {
                    let requestData = $this.getRequestData(false, {
                      'paymentMethodId': result.paymentMethod.id
                    })

                    $this.$http.post(`${$this.$root.getAjaxUrl}/bookings`, requestData.data, requestData.options
                    ).then(response => {
                      if (response.data.data) {
                        $this.handleServerResponse(response.data.data)
                      }
                    }).catch(e => {
                      $this.handleSaveBookingErrors(e.response.data)
                    })
                  }
                })
                break
              case 'onSite':
                if (this.$root.settings.general.googleRecaptcha.enabled &&
                  this.$root.settings.general.googleRecaptcha.invisible
                ) {
                  this.$refs.recaptcha.execute()
                } else {
                  this.saveBooking(this.getRequestData(false))
                }
                break
              case 'wc':
                this.addToWooCommerceCart()
                break
            }
            this.scrollView('am-spinner', 'start')
          } else {
            this.fetched = true

            if (validOptions['customer.firstName']) {
              this.$refs['customer.firstName'].$el.scrollIntoView()
              return false
            }

            if (validOptions['customer.lastName']) {
              this.$refs['customer.lastName'].$el.scrollIntoView()
              return false
            }

            if (validOptions['customer.email']) {
              this.$refs['customer.email'].$el.scrollIntoView()
              return false
            }

            if (validOptions['customer.phone']) {
              this.$refs['customer.phone'].$el.scrollIntoView()
              return false
            }

            let initialErrorArray = []
            let fileErrorArray = []
            this.customFields.forEach((item) => {
              if (item.type === 'file' && item.required === true && this.$refs['customFields.' + item.id + '.value'][0].$el.getElementsByTagName('input')[0].files.length === 0) {
                let fileErrorItem = {}
                fileErrorItem.position = item.position - 1
                fileErrorItem.name = 'customFields.' + item.id + '.value'
                fileErrorArray.push(fileErrorItem)
              }
              initialErrorArray.push('customFields.' + item.id + '.value')
            })

            let initialErrorExtendedArray = []
            Object.keys(validOptions).forEach(item => {
              let index = initialErrorArray.indexOf(item)
              let errorItem = {}
              errorItem.position = index
              errorItem.name = item

              initialErrorExtendedArray.push(errorItem)
            })

            let errorArray = initialErrorExtendedArray.concat(fileErrorArray).sort((a, b) => {
              const positionA = a.position
              const positionB = b.position

              let comparison = 0
              if (positionA > positionB) {
                comparison = 1
              } else if (positionA < positionB) {
                comparison = -1
              }

              return comparison
            })

            if (errorArray.length !== 0) {
              this.$refs[errorArray[0].name][0].$el.scrollIntoView()
            }

            return false
          }
        })
      },

      buildFormData (formData, data, parentKey) {
        let $this = this

        if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
          Object.keys(data).forEach(key => {
            $this.buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key)
          })
        } else {
          formData.append(parentKey, data !== null ? data : '')
        }
      },

      saveBooking (requestData) {
        this.$http.post(`${this.$root.getAjaxUrl}/bookings`, requestData.data, requestData.options).then(response => {
          if (response.data.data) {
            this.$emit('confirmedBooking', Object.assign(response.data.data, {
              color: this.bookable.color,
              type: this.bookableType,
              packageId: this.bookableType === 'package' ? this.bookable.id : null
            }))
          } else {
            this.fetched = true
          }
        }).catch(e => {
          this.handleSaveBookingErrors(e.response.data)
        })
      },

      addToWooCommerceCart: function () {},

      getAppointmentDate () {
        return this.getFrontedFormattedDate(
          moment(this.bookable.bookingStart, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD')
        )
      },

      getAppointmentTime () {
        return this.getFrontedFormattedTime(this.bookable.bookingStart.split(' ')[1])
      },

      getExtrasPrice: function () {
        return 0
      },

      getSubtotalPrice () {
        let price = this.basePriceMultipleValue * this.bookable.price

        this.recurringData.forEach((item, index) => {
          if (index < this.instantPaymentBookingsCount - 1) {
            price += this.basePriceMultipleValue * item.price
          }
        })

        return price + this.getExtrasPrice(this.instantPaymentBookingsCount)
      },

      getDiscountData: function () {
        return 0
      },

      getTotalPrice () {
        let totalPrice = (this.getSubtotalPrice() - this.getDiscountData('instant')).toFixed(2)
        return totalPrice > 0 ? totalPrice : 0
      },

      getSelectedExtraDetails: function () {},

      getExtraPriceMultipleValue: function () {},

      getBasePrice (bookingsCount, bookingBasePrice) {
        return bookingsCount * this.basePriceMultipleValue * bookingBasePrice
      },

      getBookingBasePriceCalculationString (bookingsCount, bookingBasePrice) {
        let result = ''

        if (bookingsCount > 1 || (this.recurringData !== null && this.recurringData.length)) {
          result += bookingsCount + ' ' + (bookingsCount > 1 ? this.$root.labels.appointments.toLowerCase() : this.$root.labels.appointment.toLowerCase()) + ' x '
        }

        if (this.basePriceMultipleValue > 1) {
          result += this.basePriceMultipleValue + ' ' + this.$root.labels.persons + ' x '
        }

        let totalPriceFormatted = this.getFormattedPrice(
          this.getBasePrice(bookingsCount, bookingBasePrice),
          !this.$root.settings.payments.hideCurrencySymbolFrontend
        )

        if (result) {
          let bookingBasePriceFormatted = this.getFormattedPrice(
            bookingBasePrice,
            !this.$root.settings.payments.hideCurrencySymbolFrontend
          )

          result += bookingBasePriceFormatted + ' = ' + totalPriceFormatted
        }

        return result !== '' ? result : totalPriceFormatted
      },

      getBookingBasePriceData (type) {
        let result = []

        let paymentData = this.paymentPeriodData[type]

        for (let entityId in paymentData) {
          if (paymentData[entityId].price) {
            result.push({
              count: paymentData[entityId].count,
              price: paymentData[entityId].price
            })
          }
        }

        return result
      },

      getPostponedPaymentExtrasPriceDetails: function () {},

      getPostponedPaymentTotalPrice: function () {},

      checkCoupon: function () {},

      getExtras: function () {
        return []
      },

      trimValue (value) {
        return typeof value === 'string' ? value.replace(/^\s+|\s+$/g, '') : value
      },

      getRequestData (mandatoryJson, paymentData) {
        let customFieldFilesIndexes = {}

        let filesIndex = 0

        for (let i = 0; i < this.customFields.length; i++) {
          if (this.customFields[i].type === 'file') {
            customFieldFilesIndexes[this.customFields[i].id] = filesIndex
            filesIndex++
          }
        }

        this.appointment.payment.amount = this.getFormattedAmount()

        let bookings = JSON.parse(JSON.stringify(this.appointment.bookings))
        bookings[0].extras = this.getExtras()

        let customFields = {}

        for (let key in bookings[0].customFields) {
          if (!bookings[0].customFields.hasOwnProperty(key)) {
            continue
          }

          let customField = this.customFields.find(field => parseInt(field.id) === parseInt(key))

          if (this.isBookableCustomFieldVisible(customField)) {
            let uploadedFilesIndex = key in customFieldFilesIndexes && customFieldFilesIndexes[key] in this.$refs.customFieldsFiles ? customFieldFilesIndexes[key] : null

            if (uploadedFilesIndex !== null) {
              let uploadCustomField = {
                label: bookings[0].customFields[key].label,
                value: []
              }

              for (let i = 0; i < this.$refs.customFieldsFiles[uploadedFilesIndex].uploadFiles.length; i++) {
                uploadCustomField.value.push({
                  name: this.$refs.customFieldsFiles[uploadedFilesIndex].uploadFiles[i].name
                })
              }

              customFields[key] = (uploadCustomField)
            } else {
              customFields[key] = (bookings[0].customFields[key])
            }

            customFields[key].type = customField.type

            if (customFields[key].type === 'datepicker') {
              customFields[key].value = customFields[key].value ? this.getStringFromDate(new Date(customFields[key].value)) : null
            }
          }
        }

        bookings[0].customer.email = bookings[0].customer.email ? this.trimValue(bookings[0].customer.email) : bookings[0].customer.email
        bookings[0].customer.phone = bookings[0].customer.phone ? this.trimValue(bookings[0].customer.phone) : bookings[0].customer.phone

        bookings[0].customFields = customFields

        let bookingDateTime = this.bookable.bookingStart
        let recurringData = typeof this.recurringData !== 'undefined' && this.recurringData !== null ? JSON.parse(JSON.stringify(this.recurringData)) : []
        let packageData = typeof this.packageData !== 'undefined' && this.packageData !== null ? JSON.parse(JSON.stringify(this.packageData)) : {id: null, data: []}

        bookings[0].utcOffset = null

        if (this.$root.settings.general.showClientTimeZone) {
          bookingDateTime = moment(bookingDateTime, 'YYYY-MM-DD HH:mm').utc().format('YYYY-MM-DD HH:mm')

          recurringData.forEach((item) => {
            item.bookingStart = moment(item.bookingStart, 'YYYY-MM-DD HH:mm').utc().format('YYYY-MM-DD HH:mm')
            item.utcOffset = this.getClientUtcOffset(item.bookingStart)
          })

          packageData.data.forEach((item) => {
            item.bookingStart = moment(item.bookingStart, 'YYYY-MM-DD HH:mm').utc().format('YYYY-MM-DD HH:mm')
            item.utcOffset = this.getClientUtcOffset(item.bookingStart)
          })

          bookings[0].utcOffset = this.getClientUtcOffset(bookingDateTime)
        }

        packageData.data.forEach((item) => {
          item.notifyParticipants = this.appointment.notifyParticipants ? 1 : 0
        })

        let jsonData = {
          'type': this.bookableType,
          'bookings': bookings,
          'payment': Object.assign(this.appointment.payment, {data: paymentData}),
          'recaptcha': this.recaptchaResponse,
          'couponCode': this.coupon.code
        }

        switch (this.bookableType) {
          case ('appointment'):
            jsonData = Object.assign(jsonData, {
              'bookingStart': bookingDateTime,
              'notifyParticipants': this.appointment.notifyParticipants ? 1 : 0,
              'locationId': this.location !== null ? this.location.id : null,
              'providerId': this.provider ? this.provider.id : null,
              'serviceId': this.bookable.id,
              'recurring': recurringData,
              'package': []
            })

            break

          case ('package'):
            jsonData = Object.assign(jsonData, {
              'package': packageData.data,
              'packageId': packageData.id,
              'packageRules': packageData.rules,
              'utcOffset': this.getClientUtcOffset(null)
            })

            break

          case ('event'):
            jsonData = Object.assign(jsonData, {
              'eventId': this.bookable.id
            })
        }

        let bookingData = null
        let requestOptions = null

        let hasUploadedFiles = false

        if (this.$refs.customFieldsFiles) {
          for (let i = 0; i < this.$refs.customFieldsFiles.length; i++) {
            if (this.$refs.customFieldsFiles[i].uploadFiles.length > 0) {
              hasUploadedFiles = true
              break
            }
          }
        }

        if (hasUploadedFiles && !mandatoryJson) {
          bookingData = new FormData()

          this.buildFormData(bookingData, jsonData)

          for (let key in customFieldFilesIndexes) {
            let index = customFieldFilesIndexes[key]

            if (!customFieldFilesIndexes.hasOwnProperty(key) || !(index in this.$refs.customFieldsFiles)) {
              continue
            }

            for (let i = 0; i < this.$refs.customFieldsFiles[index].uploadFiles.length; i++) {
              bookingData.append('files[' + key + '][' + i + ']', this.$refs.customFieldsFiles[index].uploadFiles[i].raw)
            }
          }

          requestOptions = {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        } else {
          bookingData = jsonData

          requestOptions = {}
        }

        return {
          data: bookingData,
          options: requestOptions
        }
      },

      getFormattedAmount () {
        return this.getTotalPrice().toString()
      },

      handleSaveBookingErrors (response) {
        if ('data' in response) {
          if ('onSitePayment' in response.data && response.data.onSitePayment) {
            this.appointment.payment.gateway = 'onSite'
            this.saveBooking(this.getRequestData(false))
          } else {
            if ('afterFailedBooking' in window) {
              window.afterFailedBooking(response.data)
            }
          }

          if ('customerAlreadyBooked' in response.data && response.data.customerAlreadyBooked === true) {
            this.headerErrorShow = true
            this.headerErrorMessage = this.$root.labels.customer_already_booked
          }
          if ('timeSlotUnavailable' in response.data && response.data.timeSlotUnavailable === true) {
            this.headerErrorShow = true

            switch (this.bookableType) {
              case 'appointment':
              case 'package':
                this.headerErrorMessage = this.$root.labels.time_slot_unavailable
                break
              case 'event':
                this.headerErrorMessage = this.$root.labels.maximum_capacity_reached
                break
            }
          } else if ('emailError' in response.data && response.data.emailError === true) {
            this.errors.email = this.$root.labels.email_exist_error
          } else if ('couponUnknown' in response.data && response.data.couponUnknown === true) {
            this.errors.coupon = this.$root.labels.coupon_unknown
          } else if ('couponInvalid' in response.data && response.data.couponInvalid === true) {
            this.errors.coupon = this.$root.labels.coupon_invalid
          } else if ('couponMissing' in response.data && response.data.couponMissing === true) {
            this.errors.coupon = this.$root.labels.coupon_missing
          } else if ('paymentSuccessful' in response.data && response.data.paymentSuccessful === false) {
            this.headerErrorShow = true
            this.headerErrorMessage = this.$root.labels.payment_error
          } else if ('bookingAlreadyInWcCart' in response.data && response.data.bookingAlreadyInWcCart === true) {
            this.headerErrorShow = true
            this.headerErrorMessage = this.$root.labels.booking_already_in_wc_cart
          } else if ('wcError' in response.data && response.data.wcError === true) {
            this.headerErrorShow = true
            this.headerErrorMessage = this.$root.labels.wc_error
          } else if ('recaptchaError' in response.data && response.data.recaptchaError === true) {
            this.errors.recaptcha = this.$root.labels.recaptcha_invalid_error
          }
        }

        this.fetched = true
      },

      isRequiredAndValidRecaptcha: function () {
        return true
      },

      validateFieldsForPayPal: function () {},

      payPalInit: function () {},

      parseError: function (error) {
        let errorString = error.toString()
        let response = JSON.parse(JSON.stringify(JSON.parse(errorString.substring(errorString.indexOf('{'), errorString.lastIndexOf('}') + 1))))

        if (typeof response === 'object' && response.hasOwnProperty('data')) {
          this.handleSaveBookingErrors(response)
        } else {
          this.headerErrorShow = true
          this.headerErrorMessage = this.$root.labels.payment_error
        }

        this.fetched = true
        this.inlineSVG()
      },

      getStripePublishableKey: function () {},

      clearValidation () {
        this.validateFieldsForPayPal()

        if (typeof this.$refs.booking !== 'undefined') {
          this.$refs.booking.clearValidate()
        }

        if (typeof this.$refs.coupon !== 'undefined') {
          this.$refs.coupon.clearValidate()
        }

        let $this = this

        Object.keys(this.errors.files).forEach(function (key) {
          $this.errors.files[key] = ''
        })

        this.errors.recaptcha = ''

        if (this.errors.files) {
          let firstName = this.appointment.bookings[0].customer.firstName
          this.appointment.bookings[0].customer.firstName = firstName + '_'
          this.appointment.bookings[0].customer.firstName = firstName
        }
      },

      phoneFormatted (phone, countryPhoneIso) {
        this.appointment.bookings[0].customer.phone = phone
        this.appointment.bookings[0].customer.countryPhoneIso = countryPhoneIso
        this.clearValidation()
      },

      handleResize () {
        let amContainer = document.getElementById(this.containerId)
        let amContainerWidth = amContainer.offsetWidth
        if (amContainerWidth < 670) {
          this.columnsLg = 24
        }
      },

      addCustomFieldsValidationRules: function () {},

      validateCustomFieldInput: function () {}
    },

    computed: {
      instantPaymentBasePriceData () {
        return this.getBookingBasePriceData('instant')
      },

      postponedPaymentBasePriceData () {
        return this.getBookingBasePriceData('postponed')
      },

      basePriceMultipleValue () {
        return this.bookable.aggregatedPrice ? this.appointment.bookings[0].persons : 1
      },

      instantPaymentBookingsCount () {
        if (this.recurringData.length === 0) {
          return 1
        }

        return (this.recurringData.length < this.service.recurringPayment ? this.recurringData.length : this.service.recurringPayment) + 1
      },

      paymentPeriodData () {
        let instantPaymentData = {}
        let postponedPaymentData = {}

        switch (this.bookableType) {
          case ('appointment'):
            instantPaymentData[this.bookable.price] = {
              count: 1,
              price: this.bookable.price
            }

            this.recurringData.forEach((value, index) => {
              if (this.instantPaymentBookingsCount - 1 > index) {
                if (!(value.price in instantPaymentData)) {
                  instantPaymentData[value.price] = {
                    count: 1,
                    price: value.price
                  }
                } else {
                  instantPaymentData[value.price].count++
                }
              } else {
                if (!(value.price in postponedPaymentData)) {
                  postponedPaymentData[value.price] = {
                    count: 1,
                    price: value.price
                  }
                } else {
                  postponedPaymentData[value.price].count++
                }
              }
            })

            break

          case ('package'):
            instantPaymentData[this.bookable.price] = {
              count: 1,
              price: this.bookable.price
            }

            break

          case ('event'):
            instantPaymentData[this.bookable.price] = {
              count: 1,
              price: this.bookable.price
            }

            break
        }

        return {
          instant: instantPaymentData,
          postponed: postponedPaymentData
        }
      },

      bookableConfirmStyle () {
        return this.hoverConfirm ? {
          color: this.bookable.color,
          borderColor: this.bookable.color,
          backgroundColor: this.bookable.color,
          opacity: 0.8
        } : {
          color: '#ffffff',
          backgroundColor: this.bookable.color,
          borderColor: this.bookable.color,
          opacity: 1
        }
      },

      bookableCancelStyle () {
        return this.hoverCancel ? {
          color: this.bookable.color,
          borderColor: this.bookable.color,
          backgroundColor: '',
          opacity: 0.7
        } : {
          color: '',
          backgroundColor: '#ffffff',
          borderColor: '',
          opacity: 1
        }
      },

      bookableCancelSpanStyle () {
        return this.hoverCancel ? {
          color: this.bookable.color,
          borderColor: '',
          backgroundColor: '',
          opacity: 0.9
        } : {
          color: '',
          backgroundColor: '',
          borderColor: '',
          opacity: 1
        }
      },

      selectedExtras: function () {
        return []
      },

      paymentOptions: function () {
        return [{
          value: 'onSite',
          label: this.$root.labels.on_site
        }]
      },

      showConfirmBookingButton () {
        return this.appointment.payment.gateway === 'onSite' ||
          this.appointment.payment.gateway === 'wc' ||
          this.appointment.payment.gateway === 'stripe' ||
          (this.appointment.payment.gateway === 'payPal' && this.getTotalPrice() === 0)
      }
    },

    components: {
      moment,
      VueRecaptcha,
      PhoneInput
    }
  }
</script>
