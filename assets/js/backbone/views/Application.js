'use strict';

/**
 * User: Ivan Caldeira Sanches <ivans@compnet.com.br>
 * Date: 08/01/2018 15:48
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'backbone', './Header'], factory);
  } else if (typeof exports === 'object') {
    module.exports.Application = factory(require('underscore'), require('jquery'), require('backbone'), require('./Header'));
  } else {
    window.Application = factory(_, $, Backbone, HeaderView);
  }
}(function (_, $, Backbone, HeaderView) {
  return Backbone.View.extend({
    initialize: function (options) {
      var that = this;

      that.options = options || {};
      that.render();

      return that;
    },

    render: function () {
      var that = this;

      that.$el.html('');
      that.options.header.$el.appendTo(that.$el);
      that.$content = $('<div class="container-fluid sg-content">').appendTo(that.$el);
      that.options.content.$el.appendTo(that.$content);

      return that;
    }
  });
}));