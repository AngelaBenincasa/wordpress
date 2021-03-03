(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

var timeout = undefined;
var icons = wpcfto_icons_set;
Vue.component('wpcfto_icon_picker', {
  props: ['fields', 'field_label', 'field_name', 'field_id', 'field_value', 'field_data'],
  data: function data() {
    return {
      value: {
        icon: '',
        color: '#000',
        size: 15
      },
      focusOn: false,
      icons: icons,
      hoverPanel: false,
      search: "",
      beforeSelect: "",
      selected: "",
      inited: false
    };
  },
  template: "\n        <div class=\"wpcfto_generic_field wpcfto_generic_field_iconpicker\">\n\n            <wpcfto_fields_aside_before :fields=\"fields\" :field_label=\"field_label\"></wpcfto_fields_aside_before>\n            \n            <div class=\"wpcfto-field-content\">\n                <div class=\"wpcfto_generic_field__inner\">\n    \n                    <div class=\"wpcfto_generic_field\">\n                        <label>Icon picker</label>\n                        <input ref=\"picker\"\n                        v-model=\"search\"\n                        @blur=\"blur\"\n                        @focus=\"focus\"\n                        type=\"email\"\n                        class=\"form-control\"\n                        placeholder=\"Search an icon\">\n                    </div>\n    \n                    <wpcfto_color @wpcfto-get-value=\"value['color'] = $event\"\n                        :fields=\"{position: 'bottom'}\"\n                        v-if=\"inited\"\n                        :field_label=\"'Icon color'\"\n                        :field_value=\"value['color']\">\n    \n                    </wpcfto_color>\n    \n                    <wpcfto_range_slider :fields=\"fields\"\n                        v-if=\"inited\"\n                        :field_label=\"'Icon size'\"\n                        :field_name=\"field_name\"\n                        :field_description=\"'Icon size set in pixels'\"\n                        :field_id=\"field_id\"\n                        :field_value=\"value['size']\"\n                        :field_data=\"{min:1,max:200}\"\n                        :field_input_addon=\"{label:'px'}\"\n                        @wpcfto-get-value=\"value['size'] = $event\">\n                    </wpcfto_range_slider>\n    \n                </div>\n    \n                <transition name=\"icon-preview-fade\">\n                    <div v-if=\"focusOn\" class=\"preview-container\">\n                        <div @click=\"select(undefined)\" @mouseover=\"hoverPanel = true\" @mouseout=\"hoverPanel = false\" :class=\"['previewer', 'rounded', {'custom-shadow-sm': !hoverPanel}, {'custom-shadow': hoverPanel} ]\">\n                            <div v-for=\"(i, index) in iconsFiltered\" :key=\"index\" class=\"icon-preview\">\n                                <div @click.prevent.stop=\"select(i)\" :class=\"['icon-wrapper','rounded','shadow-sm', {selected: i.title == selected}]\" >\n                                    <i :class=\"i.title\" />\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </transition>\n            \n                 <div class=\"icon-preview-wrap\">\n                    <label>Preview</label>\n                    <div class=\"icon-preview-inner\">\n                        <i class=\"wpcfto_generic_field__iconpicker__icon\"\n                        v-bind:class=\"value.icon\"\n                        v-bind:style=\"{ color: value.color, 'font-size' : value.size + 'px'}\"\n                        v-if=\"value.icon && value.icon !== ''\"></i>  \n                        <span v-else>--</span>  \n                    </div>        \n                 </div>\n             </div>\n\n        </div>\n  ",
  mounted: function mounted() {
    if (typeof this.field_value === 'string' && WpcftoIsJsonString(this.field_value)) {
      this.value = JSON.parse(this.field_value);
    } else if (_typeof(this.field_value) === 'object') {
      this.value = this.field_value;
    }

    if (!this.value.icon) {
      this.value = {
        icon: '',
        color: '#000',
        size: 15
      };
    }

    this.selected = this.value.icon;
    this.inited = true;
  },
  methods: {
    blur: function blur() {
      var _this = this;

      timeout = setTimeout(function () {
        _this.focusOn = false;
        _this.value.icon = '';
      }, 100);
    },
    focus: function focus() {
      this.focusOn = true;
    },
    select: function select(icon) {
      clearTimeout(timeout);

      if (icon) {
        if (this.search != this.selected) this.beforeSelect = this.search;
        this.selected = icon.title;
        this.search = icon.title;
      }

      this.focusOn = false;
      this.value.icon = this.selected;
    }
  },
  computed: {
    iconsFiltered: function iconsFiltered() {
      var search = this.search == this.selected ? this.beforeSelect : this.search;
      return this.icons.filter(function (i) {
        return i.title.indexOf(search) !== -1 || i.searchTerms.some(function (t) {
          return t.indexOf(search) !== -1;
        });
      });
    }
  },
  watch: {
    value: {
      deep: true,
      handler: function handler(value) {
        this.$emit('wpcfto-get-value', value);
      }
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZha2VfYjYxMGNmZS5qcyJdLCJuYW1lcyI6WyJfdHlwZW9mIiwib2JqIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJjb25zdHJ1Y3RvciIsInByb3RvdHlwZSIsInRpbWVvdXQiLCJ1bmRlZmluZWQiLCJpY29ucyIsIndwY2Z0b19pY29uc19zZXQiLCJWdWUiLCJjb21wb25lbnQiLCJwcm9wcyIsImRhdGEiLCJ2YWx1ZSIsImljb24iLCJjb2xvciIsInNpemUiLCJmb2N1c09uIiwiaG92ZXJQYW5lbCIsInNlYXJjaCIsImJlZm9yZVNlbGVjdCIsInNlbGVjdGVkIiwiaW5pdGVkIiwidGVtcGxhdGUiLCJtb3VudGVkIiwiZmllbGRfdmFsdWUiLCJXcGNmdG9Jc0pzb25TdHJpbmciLCJKU09OIiwicGFyc2UiLCJtZXRob2RzIiwiYmx1ciIsIl90aGlzIiwic2V0VGltZW91dCIsImZvY3VzIiwic2VsZWN0IiwiY2xlYXJUaW1lb3V0IiwidGl0bGUiLCJjb21wdXRlZCIsImljb25zRmlsdGVyZWQiLCJmaWx0ZXIiLCJpIiwiaW5kZXhPZiIsInNlYXJjaFRlcm1zIiwic29tZSIsInQiLCJ3YXRjaCIsImRlZXAiLCJoYW5kbGVyIiwiJGVtaXQiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBLFNBQVNBLE9BQVQsQ0FBaUJDLEdBQWpCLEVBQXNCO0FBQUU7O0FBQTJCLE1BQUksT0FBT0MsTUFBUCxLQUFrQixVQUFsQixJQUFnQyxPQUFPQSxNQUFNLENBQUNDLFFBQWQsS0FBMkIsUUFBL0QsRUFBeUU7QUFBRUgsSUFBQUEsT0FBTyxHQUFHLFNBQVNBLE9BQVQsQ0FBaUJDLEdBQWpCLEVBQXNCO0FBQUUsYUFBTyxPQUFPQSxHQUFkO0FBQW9CLEtBQXREO0FBQXlELEdBQXBJLE1BQTBJO0FBQUVELElBQUFBLE9BQU8sR0FBRyxTQUFTQSxPQUFULENBQWlCQyxHQUFqQixFQUFzQjtBQUFFLGFBQU9BLEdBQUcsSUFBSSxPQUFPQyxNQUFQLEtBQWtCLFVBQXpCLElBQXVDRCxHQUFH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QyxhQUFLRSxRQUFMLEdBQWdCUCxJQUFJLENBQUNzQixLQUFyQjtBQUNBLGFBQUtqQixNQUFMLEdBQWNMLElBQUksQ0FBQ3NCLEtBQW5CO0FBQ0Q7O0FBRUQsV0FBS25CLE9BQUwsR0FBZSxLQUFmO0FBQ0EsV0FBS0osS0FBTCxDQUFXQyxJQUFYLEdBQWtCLEtBQUtPLFFBQXZCO0FBQ0Q7QUF2Qk0sR0FyQ3lCO0FBOERsQ2dCLEVBQUFBLFFBQVEsRUFBRTtBQUNSQyxJQUFBQSxhQUFhLEVBQUUsU0FBU0EsYUFBVCxHQUF5QjtBQUN0QyxVQUFJbkIsTUFBTSxHQUFHLEtBQUtBLE1BQUwsSUFBZSxLQUFLRSxRQUFwQixHQUErQixLQUFLRCxZQUFwQyxHQUFtRCxLQUFLRCxNQUFyRTtBQUNBLGFBQU8sS0FBS1osS0FBTCxDQUFXZ0MsTUFBWCxDQUFrQixVQUFVQyxDQUFWLEVBQWE7QUFDcEMsZUFBT0EsQ0FBQyxDQUFDSixLQUFGLENBQVFLLE9BQVIsQ0FBZ0J0QixNQUFoQixNQUE0QixDQUFDLENBQTdCLElBQWtDcUIsQ0FBQyxDQUFDRSxXQUFGLENBQWNDLElBQWQsQ0FBbUIsVUFBVUMsQ0FBVixFQUFhO0FBQ3ZFLGlCQUFPQSxDQUFDLENBQUNILE9BQUYsQ0FBVXRCLE1BQVYsTUFBc0IsQ0FBQyxDQUE5QjtBQUNELFNBRndDLENBQXpDO0FBR0QsT0FKTSxDQUFQO0FBS0Q7QUFSTyxHQTlEd0I7QUF3RWxDMEIsRUFBQUEsS0FBSyxFQUFFO0FBQ0xoQyxJQUFBQSxLQUFLLEVBQUU7QUFDTGlDLE1BQUFBLElBQUksRUFBRSxJQUREO0FBRUxDLE1BQUFBLE9BQU8sRUFBRSxTQUFTQSxPQUFULENBQWlCbEMsS0FBakIsRUFBd0I7QUFDL0IsYUFBS21DLEtBQUwsQ0FBVyxrQkFBWCxFQUErQm5DLEtBQS9CO0FBQ0Q7QUFKSTtBQURGO0FBeEUyQixDQUFwQyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikgeyBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH07IH0gZWxzZSB7IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTsgfSByZXR1cm4gX3R5cGVvZihvYmopOyB9XG5cbnZhciB0aW1lb3V0ID0gdW5kZWZpbmVkO1xudmFyIGljb25zID0gd3BjZnRvX2ljb25zX3NldDtcblZ1ZS5jb21wb25lbnQoJ3dwY2Z0b19pY29uX3BpY2tlcicsIHtcbiAgcHJvcHM6IFsnZmllbGRzJywgJ2ZpZWxkX2xhYmVsJywgJ2ZpZWxkX25hbWUnLCAnZmllbGRfaWQnLCAnZmllbGRfdmFsdWUnLCAnZmllbGRfZGF0YSddLFxuICBkYXRhOiBmdW5jdGlvbiBkYXRhKCkge1xuICAgIHJldHVybiB7XG4gICAgICB2YWx1ZToge1xuICAgICAgICBpY29uOiAnJyxcbiAgICAgICAgY29sb3I6ICcjMDAwJyxcbiAgICAgICAgc2l6ZTogMTVcbiAgICAgIH0sXG4gICAgICBmb2N1c09uOiBmYWxzZSxcbiAgICAgIGljb25zOiBpY29ucyxcbiAgICAgIGhvdmVyUGFuZWw6IGZhbHNlLFxuICAgICAgc2VhcmNoOiBcIlwiLFxuICAgICAgYmVmb3JlU2VsZWN0OiBcIlwiLFxuICAgICAgc2VsZWN0ZWQ6IFwiXCIsXG4gICAgICBpbml0ZWQ6IGZhbHNlXG4gICAgfTtcbiAgfSxcbiAgdGVtcGxhdGU6IFwiXFxuICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ3cGNmdG9fZ2VuZXJpY19maWVsZCB3cGNmdG9fZ2VuZXJpY19maWVsZF9pY29ucGlja2VyXFxcIj5cXG5cXG4gICAgICAgICAgICA8d3BjZnRvX2ZpZWxkc19hc2lkZV9iZWZvcmUgOmZpZWxkcz1cXFwiZmllbGRzXFxcIiA6ZmllbGRfbGFiZWw9XFxcImZpZWxkX2xhYmVsXFxcIj48L3dwY2Z0b19maWVsZHNfYXNpZGVfYmVmb3JlPlxcbiAgICAgICAgICAgIFxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIndwY2Z0by1maWVsZC1jb250ZW50XFxcIj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwid3BjZnRvX2dlbmVyaWNfZmllbGRfX2lubmVyXFxcIj5cXG4gICAgXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJ3cGNmdG9fZ2VuZXJpY19maWVsZFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsPkljb24gcGlja2VyPC9sYWJlbD5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgcmVmPVxcXCJwaWNrZXJcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgdi1tb2RlbD1cXFwic2VhcmNoXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgIEBibHVyPVxcXCJibHVyXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgIEBmb2N1cz1cXFwiZm9jdXNcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cXFwiZW1haWxcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XFxcImZvcm0tY29udHJvbFxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cXFwiU2VhcmNoIGFuIGljb25cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgIFxcbiAgICAgICAgICAgICAgICAgICAgPHdwY2Z0b19jb2xvciBAd3BjZnRvLWdldC12YWx1ZT1cXFwidmFsdWVbJ2NvbG9yJ10gPSAkZXZlbnRcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgOmZpZWxkcz1cXFwie3Bvc2l0aW9uOiAnYm90dG9tJ31cXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgdi1pZj1cXFwiaW5pdGVkXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDpmaWVsZF9sYWJlbD1cXFwiJ0ljb24gY29sb3InXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDpmaWVsZF92YWx1ZT1cXFwidmFsdWVbJ2NvbG9yJ11cXFwiPlxcbiAgICBcXG4gICAgICAgICAgICAgICAgICAgIDwvd3BjZnRvX2NvbG9yPlxcbiAgICBcXG4gICAgICAgICAgICAgICAgICAgIDx3cGNmdG9fcmFuZ2Vfc2xpZGVyIDpmaWVsZHM9XFxcImZpZWxkc1xcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICB2LWlmPVxcXCJpbml0ZWRcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgOmZpZWxkX2xhYmVsPVxcXCInSWNvbiBzaXplJ1xcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICA6ZmllbGRfbmFtZT1cXFwiZmllbGRfbmFtZVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICA6ZmllbGRfZGVzY3JpcHRpb249XFxcIidJY29uIHNpemUgc2V0IGluIHBpeGVscydcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgOmZpZWxkX2lkPVxcXCJmaWVsZF9pZFxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICA6ZmllbGRfdmFsdWU9XFxcInZhbHVlWydzaXplJ11cXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgOmZpZWxkX2RhdGE9XFxcInttaW46MSxtYXg6MjAwfVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICA6ZmllbGRfaW5wdXRfYWRkb249XFxcIntsYWJlbDoncHgnfVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICBAd3BjZnRvLWdldC12YWx1ZT1cXFwidmFsdWVbJ3NpemUnXSA9ICRldmVudFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8L3dwY2Z0b19yYW5nZV9zbGlkZXI+XFxuICAgIFxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgXFxuICAgICAgICAgICAgICAgIDx0cmFuc2l0aW9uIG5hbWU9XFxcImljb24tcHJldmlldy1mYWRlXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgdi1pZj1cXFwiZm9jdXNPblxcXCIgY2xhc3M9XFxcInByZXZpZXctY29udGFpbmVyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IEBjbGljaz1cXFwic2VsZWN0KHVuZGVmaW5lZClcXFwiIEBtb3VzZW92ZXI9XFxcImhvdmVyUGFuZWwgPSB0cnVlXFxcIiBAbW91c2VvdXQ9XFxcImhvdmVyUGFuZWwgPSBmYWxzZVxcXCIgOmNsYXNzPVxcXCJbJ3ByZXZpZXdlcicsICdyb3VuZGVkJywgeydjdXN0b20tc2hhZG93LXNtJzogIWhvdmVyUGFuZWx9LCB7J2N1c3RvbS1zaGFkb3cnOiBob3ZlclBhbmVsfSBdXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiB2LWZvcj1cXFwiKGksIGluZGV4KSBpbiBpY29uc0ZpbHRlcmVkXFxcIiA6a2V5PVxcXCJpbmRleFxcXCIgY2xhc3M9XFxcImljb24tcHJldmlld1xcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IEBjbGljay5wcmV2ZW50LnN0b3A9XFxcInNlbGVjdChpKVxcXCIgOmNsYXNzPVxcXCJbJ2ljb24td3JhcHBlcicsJ3JvdW5kZWQnLCdzaGFkb3ctc20nLCB7c2VsZWN0ZWQ6IGkudGl0bGUgPT0gc2VsZWN0ZWR9XVxcXCIgPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIDpjbGFzcz1cXFwiaS50aXRsZVxcXCIgLz5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICA8L3RyYW5zaXRpb24+XFxuICAgICAgICAgICAgXFxuICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJpY29uLXByZXZpZXctd3JhcFxcXCI+XFxuICAgICAgICAgICAgICAgICAgICA8bGFiZWw+UHJldmlldzwvbGFiZWw+XFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVxcXCJpY29uLXByZXZpZXctaW5uZXJcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVxcXCJ3cGNmdG9fZ2VuZXJpY19maWVsZF9faWNvbnBpY2tlcl9faWNvblxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICB2LWJpbmQ6Y2xhc3M9XFxcInZhbHVlLmljb25cXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgdi1iaW5kOnN0eWxlPVxcXCJ7IGNvbG9yOiB2YWx1ZS5jb2xvciwgJ2ZvbnQtc2l6ZScgOiB2YWx1ZS5zaXplICsgJ3B4J31cXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgdi1pZj1cXFwidmFsdWUuaWNvbiAmJiB2YWx1ZS5pY29uICE9PSAnJ1xcXCI+PC9pPiAgXFxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gdi1lbHNlPi0tPC9zcGFuPiAgXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4gICAgICAgIFxcbiAgICAgICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgPC9kaXY+XFxuICBcIixcbiAgbW91bnRlZDogZnVuY3Rpb24gbW91bnRlZCgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuZmllbGRfdmFsdWUgPT09ICdzdHJpbmcnICYmIFdwY2Z0b0lzSnNvblN0cmluZyh0aGlzLmZpZWxkX3ZhbHVlKSkge1xuICAgICAgdGhpcy52YWx1ZSA9IEpTT04ucGFyc2UodGhpcy5maWVsZF92YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChfdHlwZW9mKHRoaXMuZmllbGRfdmFsdWUpID09PSAnb2JqZWN0Jykge1xuICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuZmllbGRfdmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnZhbHVlLmljb24pIHtcbiAgICAgIHRoaXMudmFsdWUgPSB7XG4gICAgICAgIGljb246ICcnLFxuICAgICAgICBjb2xvcjogJyMwMDAnLFxuICAgICAgICBzaXplOiAxNVxuICAgICAgfTtcbiAgICB9XG5cbiAgICB0aGlzLnNlbGVjdGVkID0gdGhpcy52YWx1ZS5pY29uO1xuICAgIHRoaXMuaW5pdGVkID0gdHJ1ZTtcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIGJsdXI6IGZ1bmN0aW9uIGJsdXIoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIF90aGlzLmZvY3VzT24gPSBmYWxzZTtcbiAgICAgICAgX3RoaXMudmFsdWUuaWNvbiA9ICcnO1xuICAgICAgfSwgMTAwKTtcbiAgICB9LFxuICAgIGZvY3VzOiBmdW5jdGlvbiBmb2N1cygpIHtcbiAgICAgIHRoaXMuZm9jdXNPbiA9IHRydWU7XG4gICAgfSxcbiAgICBzZWxlY3Q6IGZ1bmN0aW9uIHNlbGVjdChpY29uKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG5cbiAgICAgIGlmIChpY29uKSB7XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaCAhPSB0aGlzLnNlbGVjdGVkKSB0aGlzLmJlZm9yZVNlbGVjdCA9IHRoaXMuc2VhcmNoO1xuICAgICAgICB0aGlzLnNlbGVjdGVkID0gaWNvbi50aXRsZTtcbiAgICAgICAgdGhpcy5zZWFyY2ggPSBpY29uLnRpdGxlO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmZvY3VzT24gPSBmYWxzZTtcbiAgICAgIHRoaXMudmFsdWUuaWNvbiA9IHRoaXMuc2VsZWN0ZWQ7XG4gICAgfVxuICB9LFxuICBjb21wdXRlZDoge1xuICAgIGljb25zRmlsdGVyZWQ6IGZ1bmN0aW9uIGljb25zRmlsdGVyZWQoKSB7XG4gICAgICB2YXIgc2VhcmNoID0gdGhpcy5zZWFyY2ggPT0gdGhpcy5zZWxlY3RlZCA/IHRoaXMuYmVmb3JlU2VsZWN0IDogdGhpcy5zZWFyY2g7XG4gICAgICByZXR1cm4gdGhpcy5pY29ucy5maWx0ZXIoZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgcmV0dXJuIGkudGl0bGUuaW5kZXhPZihzZWFyY2gpICE9PSAtMSB8fCBpLnNlYXJjaFRlcm1zLnNvbWUoZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICByZXR1cm4gdC5pbmRleE9mKHNlYXJjaCkgIT09IC0xO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgd2F0Y2g6IHtcbiAgICB2YWx1ZToge1xuICAgICAgZGVlcDogdHJ1ZSxcbiAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uIGhhbmRsZXIodmFsdWUpIHtcbiAgICAgICAgdGhpcy4kZW1pdCgnd3BjZnRvLWdldC12YWx1ZScsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pOyJdfQ==
},{}]},{},[1])