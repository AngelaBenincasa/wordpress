(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Vue.component('v-select', VueSelect.VueSelect);
Vue.component('wpcfto_autocomplete', {
  props: ['fields', 'field_label', 'field_name', 'field_id', 'field_value'],
  data: function data() {
    return {
      ids: [],
      items: [],
      search: '',
      options: [],
      loading: true,
      itemHovered: null,
      value: ''
    };
  },
  template: "\n        <div class=\"wpcfto_generic_field wpcfto_generic_field_autocomplete\">\n\n            <wpcfto_fields_aside_before :fields=\"fields\" :field_label=\"field_label\"></wpcfto_fields_aside_before>\n\n            <div class=\"wpcfto-field-content\">\n\n                <div class=\"wpcfto-autocomplete-search\" v-bind:class=\"{'loading': loading}\">\n\n                    <div class=\"v-select-search\">\n\n                        <i class=\"fa fa-plus-circle\"></i>\n\n                        <v-select label=\"title\"\n                                  v-model=\"search\"\n                                  @input=\"setSelected($event)\"\n                                  :options=\"options\"\n                                  @search=\"onSearch($event)\">\n                        </v-select>\n\n                    </div>\n\n                    <ul class=\"wpcfto-autocomplete\">\n                        <li v-for=\"(item, index) in items\" v-if=\"typeof item !== 'string'\" :class=\"{ 'hovered' : itemHovered == index }\">\n                            <div class=\"item-wrapper\">\n                                <img v-bind:src=\"item.image\" v-if=\"item.image\" class=\"item-image\">\n                                <div class=\"item-data\">\n                                    <span v-html=\"item.title\" class=\"item-title\"></span>\n                                    <span v-html=\"item.excerpt\" class=\"item-excerpt\"></span>\n                                </div>\n                            </div>\n                            <i class=\"fa fa-trash-alt\" @click=\"removeItem(index)\" @mouseover=\"itemHovered = index\" @mouseleave=\"itemHovered = null\"></i>\n                        </li>\n                    </ul>\n\n                    <input type=\"hidden\"\n                           v-bind:name=\"field_name\"\n                           v-model=\"value\"/>\n\n                </div>\n            \n            </div>\n\n            <wpcfto_fields_aside_after :fields=\"fields\"></wpcfto_fields_aside_after>\n\n        </div>\n    ",
  created: function created() {
    if (this.field_value) {
      this.getPosts(stm_wpcfto_ajaxurl + '?action=wpcfto_search_posts&nonce=' + stm_wpcfto_nonces['wpcfto_search_posts'] + '&posts_per_page=-1&orderby=post__in&ids=' + this.field_value + '&post_types=' + this.fields.post_type.join(','), 'items');
    } else {
      this.isLoading(false);
    }
  },
  methods: {
    isLoading: function isLoading(_isLoading) {
      this.loading = _isLoading;
    },
    setSelected: function setSelected(value) {
      this.items.push(value);
      /*Reset options*/

      this.$set(this, 'options', []);
      this.$set(this, 'search', '');
    },
    onSearch: function onSearch(search) {
      var _this = this;

      var exclude = _this.ids.join(',');

      var post_types = _this.fields['post_type'].join(',');

      _this.getPosts(stm_wpcfto_ajaxurl + '?action=wpcfto_search_posts&nonce=' + stm_wpcfto_nonces['wpcfto_search_posts'] + '&exclude_ids=' + exclude + '&s=' + search + '&post_types=' + post_types, 'options');
    },
    getPosts: function getPosts(url, variable) {
      var vm = this;
      vm.isLoading(true);
      /*Adding field ID to filters then*/

      url += '&name=' + vm.field_name;
      this.$http.get(url).then(function (response) {
        vm[variable] = response.body;
        vm.isLoading(false);
      });
    },
    updateIds: function updateIds() {
      var vm = this;
      vm.ids = [];
      this.items.forEach(function (value, key) {
        vm.ids.push(value.id);
      });
      vm.$set(this, 'value', vm.ids);
      vm.$emit('wpcfto-get-value', vm.ids);
    },
    callFunction: function callFunction(functionName, item, model) {
      functionName(item, model);
    },
    containsObject: function containsObject(obj, list) {
      var i;

      for (i = 0; i < list.length; i++) {
        if (list[i]['id'] === obj['id']) {
          return true;
        }
      }

      return false;
    },
    removeItem: function removeItem(index) {
      this.items.splice(index, 1);
    }
  },
  watch: {
    items: function items() {
      this.updateIds();
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZha2VfN2Q2YjIxMzEuanMiXSwibmFtZXMiOlsiVnVlIiwiY29tcG9uZW50IiwiVnVlU2VsZWN0IiwicHJvcHMiLCJkYXRhIiwiaWRzIiwiaXRlbXMiLCJzZWFyY2giLCJvcHRpb25zIiwibG9hZGluZyIsIml0ZW1Ib3ZlcmVkIiwidmFsdWUiLCJ0ZW1wbGF0ZSIsImNyZWF0ZWQiLCJmaWVsZF92YWx1ZSIsImdldFBvc3RzIiwic3RtX3dwY2Z0b19hamF4dXJsIiwic3RtX3dwY2Z0b19ub25jZXMiLCJmaWVsZHMiLCJwb3N0X3R5cGUiLCJqb2luIiwiaXNMb2FkaW5nIiwibWV0aG9kcyIsIl9pc0xvYWRpbmciLCJzZXRTZWxlY3RlZCIsInB1c2giLCIkc2V0Iiwib25TZWFyY2giLCJfdGhpcyIsImV4Y2x1ZGUiLCJwb3N0X3R5cGVzIiwidXJsIiwidmFyaWFibGUiLCJ2bSIsImZpZWxkX25hbWUiLCIkaHR0cCIsImdldCIsInRoZW4iLCJyZXNwb25zZSIsImJvZHkiLCJ1cGRhdGVJZHMiLCJmb3JFYWNoIiwia2V5IiwiaWQiLCIkZW1pdCIsImNhbGxGdW5jdGlvbiIsImZ1bmN0aW9uTmFtZSIsIml0ZW0iLCJtb2RlbCIsImNvbnRhaW5zT2JqZWN0Iiwib2JqIiwibGlzdCIsImkiLCJsZW5ndGgiLCJyZW1vdmVJdGVtIiwiaW5kZXgiLCJzcGxpY2UiLCJ3YXRjaCJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUFBLEdBQUcsQ0FBQ0MsU0FBSixDQUFjLFVBQWQsRUFBMEJDLFNBQVMsQ0FBQ0EsU0FBcEM7QUFDQUYsR0FBRyxDQUFDQyxTQUFKLENBQWMscUJBQWQsRUFBcUM7QUFDbkNFLEVBQUFBLEtBQUssRUFBRSxDQUFDLFFBQUQsRUFBVyxhQUFYLEVBQTBCLFlBQTFCLEVBQXdDLFVBQXhDLEVBQW9ELGFBQXBELENBRDRCO0FBRW5DQyxFQUFBQSxJQUFJLEVBQUUsU0FBU0EsSUFBVCxHQUFnQjtBQUNwQixXQUFPO0FBQ0xDLE1BQUFBLEdBQUcsRUFBRSxFQURB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dXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG5WdWUuY29tcG9uZW50KCd2LXNlbGVjdCcsIFZ1ZVNlbGVjdC5WdWVTZWxlY3QpO1xuVnVlLmNvbXBvbmVudCgnd3BjZnRvX2F1dG9jb21wbGV0ZScsIHtcbiAgcHJvcHM6IFsnZmllbGRzJywgJ2ZpZWxkX2xhYmVsJywgJ2ZpZWxkX25hbWUnLCAnZmllbGRfaWQnLCAnZmllbGRfdmFsdWUnXSxcbiAgZGF0YTogZnVuY3Rpb24gZGF0YSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWRzOiBbXSxcbiAgICAgIGl0ZW1zOiBbXSxcbiAgICAgIHNlYXJjaDogJycsXG4gICAgICBvcHRpb25zOiBbXSxcbiAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICBpdGVtSG92ZXJlZDogbnVsbCxcbiAgICAgIHZhbHVlOiAnJ1xuICAgIH07XG4gIH0sXG4gIHRlbXBsYXRlOiBcIlxcbiAgICAgICAgPGRpdiBjbGFzcz1cXFwid3BjZnRvX2dlbmVyaWNfZmllbGQgd3BjZnRvX2dlbmVyaWNfZmllbGRfYXV0b2NvbXBsZXRlXFxcIj5cXG5cXG4gICAgICAgICAgICA8d3BjZnRvX2ZpZWxkc19hc2lkZV9iZWZvcmUgOmZpZWxkcz1cXFwiZmllbGRzXFxcIiA6ZmllbGRfbGFiZWw9XFxcImZpZWxkX2xhYmVsXFxcIj48L3dwY2Z0b19maWVsZHNfYXNpZGVfYmVmb3JlPlxcblxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XFxcIndwY2Z0by1maWVsZC1jb250ZW50XFxcIj5cXG5cXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwid3BjZnRvLWF1dG9jb21wbGV0ZS1zZWFyY2hcXFwiIHYtYmluZDpjbGFzcz1cXFwieydsb2FkaW5nJzogbG9hZGluZ31cXFwiPlxcblxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwidi1zZWxlY3Qtc2VhcmNoXFxcIj5cXG5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8aSBjbGFzcz1cXFwiZmEgZmEtcGx1cy1jaXJjbGVcXFwiPjwvaT5cXG5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8di1zZWxlY3QgbGFiZWw9XFxcInRpdGxlXFxcIlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2LW1vZGVsPVxcXCJzZWFyY2hcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBpbnB1dD1cXFwic2V0U2VsZWN0ZWQoJGV2ZW50KVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOm9wdGlvbnM9XFxcIm9wdGlvbnNcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEBzZWFyY2g9XFxcIm9uU2VhcmNoKCRldmVudClcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdi1zZWxlY3Q+XFxuXFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgICAgICAgICAgICAgIDx1bCBjbGFzcz1cXFwid3BjZnRvLWF1dG9jb21wbGV0ZVxcXCI+XFxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpIHYtZm9yPVxcXCIoaXRlbSwgaW5kZXgpIGluIGl0ZW1zXFxcIiB2LWlmPVxcXCJ0eXBlb2YgaXRlbSAhPT0gJ3N0cmluZydcXFwiIDpjbGFzcz1cXFwieyAnaG92ZXJlZCcgOiBpdGVtSG92ZXJlZCA9PSBpbmRleCB9XFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiaXRlbS13cmFwcGVyXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgdi1iaW5kOnNyYz1cXFwiaXRlbS5pbWFnZVxcXCIgdi1pZj1cXFwiaXRlbS5pbWFnZVxcXCIgY2xhc3M9XFxcIml0ZW0taW1hZ2VcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cXFwiaXRlbS1kYXRhXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiB2LWh0bWw9XFxcIml0ZW0udGl0bGVcXFwiIGNsYXNzPVxcXCJpdGVtLXRpdGxlXFxcIj48L3NwYW4+XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gdi1odG1sPVxcXCJpdGVtLmV4Y2VycHRcXFwiIGNsYXNzPVxcXCJpdGVtLWV4Y2VycHRcXFwiPjwvc3Bhbj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XFxcImZhIGZhLXRyYXNoLWFsdFxcXCIgQGNsaWNrPVxcXCJyZW1vdmVJdGVtKGluZGV4KVxcXCIgQG1vdXNlb3Zlcj1cXFwiaXRlbUhvdmVyZWQgPSBpbmRleFxcXCIgQG1vdXNlbGVhdmU9XFxcIml0ZW1Ib3ZlcmVkID0gbnVsbFxcXCI+PC9pPlxcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XFxuICAgICAgICAgICAgICAgICAgICA8L3VsPlxcblxcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XFxcImhpZGRlblxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2LWJpbmQ6bmFtZT1cXFwiZmllbGRfbmFtZVxcXCJcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2LW1vZGVsPVxcXCJ2YWx1ZVxcXCIvPlxcblxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICBcXG4gICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgICAgICA8d3BjZnRvX2ZpZWxkc19hc2lkZV9hZnRlciA6ZmllbGRzPVxcXCJmaWVsZHNcXFwiPjwvd3BjZnRvX2ZpZWxkc19hc2lkZV9hZnRlcj5cXG5cXG4gICAgICAgIDwvZGl2PlxcbiAgICBcIixcbiAgY3JlYXRlZDogZnVuY3Rpb24gY3JlYXRlZCgpIHtcbiAgICBpZiAodGhpcy5maWVsZF92YWx1ZSkge1xuICAgICAgdGhpcy5nZXRQb3N0cyhzdG1fd3BjZnRvX2FqYXh1cmwgKyAnP2FjdGlvbj13cGNmdG9fc2VhcmNoX3Bvc3RzJm5vbmNlPScgKyBzdG1fd3BjZnRvX25vbmNlc1snd3BjZnRvX3NlYXJjaF9wb3N0cyddICsgJyZwb3N0c19wZXJfcGFnZT0tMSZvcmRlcmJ5PXBvc3RfX2luJmlkcz0nICsgdGhpcy5maWVsZF92YWx1ZSArICcmcG9zdF90eXBlcz0nICsgdGhpcy5maWVsZHMucG9zdF90eXBlLmpvaW4oJywnKSwgJ2l0ZW1zJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaXNMb2FkaW5nKGZhbHNlKTtcbiAgICB9XG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICBpc0xvYWRpbmc6IGZ1bmN0aW9uIGlzTG9hZGluZyhfaXNMb2FkaW5nKSB7XG4gICAgICB0aGlzLmxvYWRpbmcgPSBfaXNMb2FkaW5nO1xuICAgIH0sXG4gICAgc2V0U2VsZWN0ZWQ6IGZ1bmN0aW9uIHNldFNlbGVjdGVkKHZhbHVlKSB7XG4gICAgICB0aGlzLml0ZW1zLnB1c2godmFsdWUpO1xuICAgICAgLypSZXNldCBvcHRpb25zKi9cblxuICAgICAgdGhpcy4kc2V0KHRoaXMsICdvcHRpb25zJywgW10pO1xuICAgICAgdGhpcy4kc2V0KHRoaXMsICdzZWFyY2gnLCAnJyk7XG4gICAgfSxcbiAgICBvblNlYXJjaDogZnVuY3Rpb24gb25TZWFyY2goc2VhcmNoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgZXhjbHVkZSA9IF90aGlzLmlkcy5qb2luKCcsJyk7XG5cbiAgICAgIHZhciBwb3N0X3R5cGVzID0gX3RoaXMuZmllbGRzWydwb3N0X3R5cGUnXS5qb2luKCcsJyk7XG5cbiAgICAgIF90aGlzLmdldFBvc3RzKHN0bV93cGNmdG9fYWpheHVybCArICc/YWN0aW9uPXdwY2Z0b19zZWFyY2hfcG9zdHMmbm9uY2U9JyArIHN0bV93cGNmdG9fbm9uY2VzWyd3cGNmdG9fc2VhcmNoX3Bvc3RzJ10gKyAnJmV4Y2x1ZGVfaWRzPScgKyBleGNsdWRlICsgJyZzPScgKyBzZWFyY2ggKyAnJnBvc3RfdHlwZXM9JyArIHBvc3RfdHlwZXMsICdvcHRpb25zJyk7XG4gICAgfSxcbiAgICBnZXRQb3N0czogZnVuY3Rpb24gZ2V0UG9zdHModXJsLCB2YXJpYWJsZSkge1xuICAgICAgdmFyIHZtID0gdGhpcztcbiAgICAgIHZtLmlzTG9hZGluZyh0cnVlKTtcbiAgICAgIC8qQWRkaW5nIGZpZWxkIElEIHRvIGZpbHRlcnMgdGhlbiovXG5cbiAgICAgIHVybCArPSAnJm5hbWU9JyArIHZtLmZpZWxkX25hbWU7XG4gICAgICB0aGlzLiRodHRwLmdldCh1cmwpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIHZtW3ZhcmlhYmxlXSA9IHJlc3BvbnNlLmJvZHk7XG4gICAgICAgIHZtLmlzTG9hZGluZyhmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHVwZGF0ZUlkczogZnVuY3Rpb24gdXBkYXRlSWRzKCkge1xuICAgICAgdmFyIHZtID0gdGhpcztcbiAgICAgIHZtLmlkcyA9IFtdO1xuICAgICAgdGhpcy5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgIHZtLmlkcy5wdXNoKHZhbHVlLmlkKTtcbiAgICAgIH0pO1xuICAgICAgdm0uJHNldCh0aGlzLCAndmFsdWUnLCB2bS5pZHMpO1xuICAgICAgdm0uJGVtaXQoJ3dwY2Z0by1nZXQtdmFsdWUnLCB2bS5pZHMpO1xuICAgIH0sXG4gICAgY2FsbEZ1bmN0aW9uOiBmdW5jdGlvbiBjYWxsRnVuY3Rpb24oZnVuY3Rpb25OYW1lLCBpdGVtLCBtb2RlbCkge1xuICAgICAgZnVuY3Rpb25OYW1lKGl0ZW0sIG1vZGVsKTtcbiAgICB9LFxuICAgIGNvbnRhaW5zT2JqZWN0OiBmdW5jdGlvbiBjb250YWluc09iamVjdChvYmosIGxpc3QpIHtcbiAgICAgIHZhciBpO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAobGlzdFtpXVsnaWQnXSA9PT0gb2JqWydpZCddKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgcmVtb3ZlSXRlbTogZnVuY3Rpb24gcmVtb3ZlSXRlbShpbmRleCkge1xuICAgICAgdGhpcy5pdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfSxcbiAgd2F0Y2g6IHtcbiAgICBpdGVtczogZnVuY3Rpb24gaXRlbXMoKSB7XG4gICAgICB0aGlzLnVwZGF0ZUlkcygpO1xuICAgIH1cbiAgfVxufSk7Il19
},{}]},{},[1])