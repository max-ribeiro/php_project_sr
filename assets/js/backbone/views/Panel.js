'use strict';

/**
 * User: Ivan Caldeira Sanches <ivans@compnet.com.br>
 * Date: 10/01/2018 16:07
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'backbone', '../utils/getNodeElement'], factory);
  } else if (typeof exports === 'object') {
    module.exports.Panel = factory(require('underscore'), require('jquery'), require('backbone'), require('../utils/getNodeElement'));
  } else {
    window.Panel = factory(_, jQuery || $, Backbone, getNodeElement);
  }
}(function (_, $, Backbone, getNodeElement) {
  return Backbone.View.extend({
    tagName: 'div',
    className: 'panel panel-default',

    initialize: function (options) {
      var that = this;

      that.options = options || {};
      that.children = that.options.children || [];

      if (that.options.addClassName) {
        that.$el.addClass(that.options.addClassName);
      }

      that.render();

      return that;
    },

    render: function () {
      var that = this;

      _.forEach(that.children, that.renderChild.bind(that));

      return that;
    },

    renderChild: function (child) {
      var that = this;

      if (!_.isPlainObject(child)) {
        if (!_.isArray(child)) {
          getNodeElement(child).appendTo(that.$el);
        } else {
          _.forEach(child, function (element) {
            getNodeElement(element).appendTo(that.$el);
          })
        }

        return that;
      }

      var title = getNodeElement(child.title);
      var body = getNodeElement(child.body);

      if (title) {
        var $title = $('<div class="panel-heading"><h3 class="panel-title"></h3></div>');
        $title.find('.panel-title').html(title);
        $title.appendTo(that.$el);
      }

      $('<div class="panel-body"></div>').html(body).appendTo(that.$el);

      return that;
    }
  });
}));
