(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Vue.component('date-picker', DatePicker["default"]);
Vue.component('wpcfto_dates', {
  props: ['fields', 'field_label', 'field_name', 'field_id', 'field_value'],
  data: function data() {
    return {
      value: [],
      saveValue: []
    };
  },
  mounted: function mounted() {
    if (typeof this.field_value !== 'undefined') {
      if (typeof this.field_value[0] !== 'undefined') {
        this.saveValue.push(this.field_value[0]);
        this.value.push(new Date(parseInt(this.field_value[0])));
      }

      if (typeof this.field_value[1] !== 'undefined') {
        this.saveValue.push(this.field_value[1]);
        this.value.push(new Date(parseInt(this.field_value[1])));
      }
    }
  },
  template: "\n        <div class=\"wpcfto_generic_field wpcfto_generic_field_flex_input wpcfto_generic_field__date\">\n\n            <wpcfto_fields_aside_before :fields=\"fields\" :field_label=\"field_label\"></wpcfto_fields_aside_before>\n\n            <div class=\"wpcfto-field-content\">\n            \n                <div class=\"wpcfto_datepicker\">\n                    <date-picker v-model=\"value\" range lang=\"en\" @change=\"dateChanged(value)\"></date-picker>\n                </div>\n    \n                <input type=\"hidden\" v-bind:name=\"field_name\" v-model=\"saveValue\" />\n                <input type=\"hidden\" v-bind:name=\"field_name + '_start'\" v-model=\"saveValue[0]\" />\n                <input type=\"hidden\" v-bind:name=\"field_name + '_end'\" v-model=\"saveValue[1]\" />\n                \n            </div>\n\n            <wpcfto_fields_aside_after :fields=\"fields\"></wpcfto_fields_aside_after>\n            \n        </div>\n    ",
  methods: {
    dateChanged: function dateChanged(newDate) {
      console.log(newDate);
      var customDate = [];
      customDate.push(new Date(newDate[0]).getTime());
      customDate.push(new Date(newDate[1]).getTime());
      console.log(customDate);
      this.$emit('wpcfto-get-value', customDate);
      this.$set(this, 'saveValue', customDate);
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZha2VfY2JhNjNkZmMuanMiXSwibmFtZXMiOlsiVnVlIiwiY29tcG9uZW50IiwiRGF0ZVBpY2tlciIsInByb3BzIiwiZGF0YSIsInZhbHVlIiwic2F2ZVZhbHVlIiwibW91bnRlZCIsImZpZWxkX3ZhbHVlIiwicHVzaCIsIkRhdGUiLCJwYXJzZUludCIsInRlbXBsYXRlIiwibWV0aG9kcyIsImRhdGVDaGFuZ2VkIiwibmV3RGF0ZSIsImNvbnNvbGUiLCJsb2ciLCJjdXN0b21EYXRlIiwiZ2V0VGltZSIsIiRlbWl0IiwiJHNldCJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUFBLEdBQUcsQ0FBQ0MsU0FBSixDQUFjLGFBQWQsRUFBNkJDLFVBQVUsQ0FBQyxTQUFELENBQXZDO0FBQ0FGLEdBQUcsQ0FBQ0MsU0FBSixDQUFjLGNBQWQsRUFBOEI7QUFDNUJFLEVBQUFBLEtBQUssRUFBRSxDQUFDLFFBQUQsRUFBVyxhQUFYLEVBQTBCLFlBQTFCLEVBQXdDLFVBQXhDLEVBQW9ELGFBQXBELENBRHFCO0FBRTVCQyxFQUFBQSxJQUFJLEVBQUUsU0FBU0EsSUFBVCxHQUFnQjtBQUNwQixXQUFPO0FBQ0xDLE1BQUFBLEtBQUssRUFBRSxFQURGO0FBRUxDLE1BQUFBLFNBQVMsRUFBRTtBQUZOLEtBQVA7QUFJRCxHQVAyQjtBQVE1QkMsRUFBQUEsT0FBTyxFQUFFLFNBQVNBLE9BQVQsR0FBbUI7QUFDMUIsUUFBSSxPQUFPLEtBQUtDLFdBQVosS0FBNEIsV0FBaEMsRUFBNkM7QUFDM0MsVUFBSSxPQUFPLEtBQUtBLFdBQUwsQ0FBaUIsQ0FBakIsQ0FBUCxLQUErQixXQUFuQyxFQUFnRDtBQUM5QyxhQUFLRixTQUFMLENBQWVHLElBQWYsQ0FBb0IsS0FBS0QsV0FBTCxDQUFpQixDQUFqQixDQUFwQjtBQUNBLGFBQUtILEtBQUwsQ0FBV0ksSUFBWCxDQUFnQixJQUFJQyxJQUFKLENBQVNDLFFBQVEsQ0FBQyxLQUFLSCxXQUFMLENBQWlCLENBQWpCLENBQUQsQ0FBakIsQ0FBaEI7QUFDRDs7QUFFRCxVQUFJLE9BQU8sS0FBS0EsV0FBTCxDQUFpQixDQUFqQixDQUFQLEtBQStCLFdBQW5DLEVBQWdEO0FBQzlDLGFBQUtGLFNBQUwsQ0FBZUcsSUFBZixDQUFvQixLQUFLRCxXQUFMLENBQWlCLENBQWpCLENBQXBCO0FBQ0EsYUFBS0gsS0FBTCxDQUFXSSxJQUFYLENBQWdCLElBQUlDLElBQUosQ0FBU0MsUUFBUSxDQUFDLEtBQUtILFdBQUwsQ0FBaUIsQ0FBakIsQ0FBRCxDQUFqQixDQUFoQjtBQUNEO0FBQ0Y7QUFDRixHQXBCMkI7QUFxQjVCSSxFQUFBQSxRQUFRLEVBQUUsNjdCQXJCa0I7QUFzQjVCQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsV0FBVyxFQUFFLFNBQVNBLFdBQVQsQ0FBcUJDLE9BQXJCLEVBQThCO0FBQ3pDQyxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWUYsT0FBWjtBQUNBLFVBQUlHLFVBQVUsR0FBRyxFQUFqQjtBQUNBQSxNQUFBQSxVQUFVLENBQUNULElBQVgsQ0FBZ0IsSUFBSUMsSUFBSixDQUFTSyxPQUFPLENBQUMsQ0FBRCxDQUFoQixFQUFxQkksT0FBckIsRUFBaEI7QUFDQUQsTUFBQUEsVUFBVSxDQUFDVCxJQUFYLENBQWdCLElBQUlDLElBQUosQ0FBU0ssT0FBTyxDQUFDLENBQUQsQ0FBaEIsRUFBcUJJLE9BQXJCLEVBQWhCO0FBQ0FILE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxVQUFaO0FBQ0EsV0FBS0UsS0FBTCxDQUFXLGtCQUFYLEVBQStCRixVQUEvQjtBQUNBLFdBQUtHLElBQUwsQ0FBVSxJQUFWLEVBQWdCLFdBQWhCLEVBQTZCSCxVQUE3QjtBQUNEO0FBVE07QUF0Qm1CLENBQTlCIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cblZ1ZS5jb21wb25lbnQoJ2RhdGUtcGlja2VyJywgRGF0ZVBpY2tlcltcImRlZmF1bHRcIl0pO1xuVnVlLmNvbXBvbmVudCgnd3BjZnRvX2RhdGVzJywge1xuICBwcm9wczogWydmaWVsZHMnLCAnZmllbGRfbGFiZWwnLCAnZmllbGRfbmFtZScsICdmaWVsZF9pZCcsICdmaWVsZF92YWx1ZSddLFxuICBkYXRhOiBmdW5jdGlvbiBkYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZTogW10sXG4gICAgICBzYXZlVmFsdWU6IFtdXG4gICAgfTtcbiAgfSxcbiAgbW91bnRlZDogZnVuY3Rpb24gbW91bnRlZCgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuZmllbGRfdmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMuZmllbGRfdmFsdWVbMF0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuc2F2ZVZhbHVlLnB1c2godGhpcy5maWVsZF92YWx1ZVswXSk7XG4gICAgICAgIHRoaXMudmFsdWUucHVzaChuZXcgRGF0ZShwYXJzZUludCh0aGlzLmZpZWxkX3ZhbHVlWzBdKSkpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHRoaXMuZmllbGRfdmFsdWVbMV0gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuc2F2ZVZhbHVlLnB1c2godGhpcy5maWVsZF92YWx1ZVsxXSk7XG4gICAgICAgIHRoaXMudmFsdWUucHVzaChuZXcgRGF0ZShwYXJzZUludCh0aGlzLmZpZWxkX3ZhbHVlWzFdKSkpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgdGVtcGxhdGU6IFwiXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ3cGNmdG9fZ2VuZXJpY19maWVsZCB3cGNmdG9fZ2VuZXJpY19maWVsZF9mbGV4X2lucHV0IHdwY2Z0b19nZW5lcmljX2ZpZWxkX19kYXRlXFxcIj5cXG5cXG4gICAgICAgICAgICA8d3BjZnRvX2ZpZWxkc19hc2lkZV9iZWZvcmUgOmZpZWxkcz1cXFwiZmllbGRzXFxcIiA6ZmllbGRfbGFiZWw9XFxcImZpZWxkX2xhYmVsXFxcIj48L3dwY2Z0b19maWVsZHNfYXNpZGVfYmVmb3JlPlxcblxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIndwY2Z0by1maWVsZC1jb250ZW50XFxcIj5cXG4gICAgICAgICAgICBcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwid3BjZnRvX2RhdGVwaWNrZXJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPGRhdGUtcGlja2VyIHYtbW9kZWw9XFxcInZhbHVlXFxcIiByYW5nZSBsYW5nPVxcXCJlblxcXCIgQGNoYW5nZT1cXFwiZGF0ZUNoYW5nZWQodmFsdWUpXFxcIj48L2RhdGUtcGlja2VyPlxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgXFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIHYtYmluZDpuYW1lPVxcXCJmaWVsZF9uYW1lXFxcIiB2LW1vZGVsPVxcXCJzYXZlVmFsdWVcXFwiIC8+XFxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVxcXCJoaWRkZW5cXFwiIHYtYmluZDpuYW1lPVxcXCJmaWVsZF9uYW1lICsgJ19zdGFydCdcXFwiIHYtbW9kZWw9XFxcInNhdmVWYWx1ZVswXVxcXCIgLz5cXG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCIgdi1iaW5kOm5hbWU9XFxcImZpZWxkX25hbWUgKyAnX2VuZCdcXFwiIHYtbW9kZWw9XFxcInNhdmVWYWx1ZVsxXVxcXCIgLz5cXG4gICAgICAgICAgICAgICAgXFxuICAgICAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICAgICAgPHdwY2Z0b19maWVsZHNfYXNpZGVfYWZ0ZXIgOmZpZWxkcz1cXFwiZmllbGRzXFxcIj48L3dwY2Z0b19maWVsZHNfYXNpZGVfYWZ0ZXI+XFxuICAgICAgICAgICAgXFxuICAgICAgICA8L2Rpdj5cXG4gICAgXCIsXG4gIG1ldGhvZHM6IHtcbiAgICBkYXRlQ2hhbmdlZDogZnVuY3Rpb24gZGF0ZUNoYW5nZWQobmV3RGF0ZSkge1xuICAgICAgY29uc29sZS5sb2cobmV3RGF0ZSk7XG4gICAgICB2YXIgY3VzdG9tRGF0ZSA9IFtdO1xuICAgICAgY3VzdG9tRGF0ZS5wdXNoKG5ldyBEYXRlKG5ld0RhdGVbMF0pLmdldFRpbWUoKSk7XG4gICAgICBjdXN0b21EYXRlLnB1c2gobmV3IERhdGUobmV3RGF0ZVsxXSkuZ2V0VGltZSgpKTtcbiAgICAgIGNvbnNvbGUubG9nKGN1c3RvbURhdGUpO1xuICAgICAgdGhpcy4kZW1pdCgnd3BjZnRvLWdldC12YWx1ZScsIGN1c3RvbURhdGUpO1xuICAgICAgdGhpcy4kc2V0KHRoaXMsICdzYXZlVmFsdWUnLCBjdXN0b21EYXRlKTtcbiAgICB9XG4gIH1cbn0pOyJdfQ==
},{}]},{},[1])