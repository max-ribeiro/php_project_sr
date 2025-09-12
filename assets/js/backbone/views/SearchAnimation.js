'use strict';

/**
 * User: Ivan Caldeira Sanches <ivans@compnet.com.br>
 * Date: 10/01/2018 10:56
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'backbone', '../utils/getNodeElement', 'jquery.ui', 'bootstrap'], factory);
  } else if (typeof exports === 'object') {
    module.exports.SearchAnimation = factory(
      require('underscore'),
      require('jquery'),
      require('backbone'),
      require('../utils/getNodeElement'),
      require('jquery.ui'),
      require('bootstrap')
    );
  } else {
    window.SearchAnimationView = factory(_, jQuery || $, Backbone, getNodeElement);
  }
}(function (_, $, Backbone, getNodeElement) {
  var addAffix = function () {
    var that = this;

    if (that.state.windowWidth < 1200) {
      return that;
    }

    that.$children[0].one('affixed.bs.affix', function () {
      that.$children[1].removeClass('col-lg-pull-4');
    });

    that.$children[0].affix({ offset: -1 });

    return that;
  };

  var removeAffix = function () {
    var that = this;

    if (that.state.windowWidth < 1200) {
      return that;
    }

    $(window).off('.affix');
    that.$children[0]
      .removeClass('affix affix-top affix-bottom')
      .removeData('bs.affix');

    that.$children[1].addClass('col-lg-pull-4');

    return that;
  };

  var layout1Column = function () {
    var that = this;

    that.state.currentState = '1-column';

    that.trigger('animation:start');
    that.trigger('animation:1:start');
    that.trigger('animation:1:slideUp:start');
    that.$children[1].slideUp(function () {
      that.trigger('animation:1:slideUp:end');
      that.trigger('animation:1:switchClass:start');

      removeAffix.bind(that)();

      that.$children[0].switchClass('col-lg-4 col-lg-push-8', 'col-lg-8 col-lg-offset-2', function () {
        that.trigger('animation:1:switchClass:end');
        that.trigger('animation:1:end');
        that.trigger('animation:end');
      })
    });

    return that;
  };

  var layout2Column = function () {
    var that = this;

    that.state.currentState = '2-column';

    that.trigger('animation:start');
    that.trigger('animation:2:start');
    that.trigger('animation:2:switchClass:start');
    that.$children[0].switchClass('col-lg-8 col-lg-offset-2', 'col-lg-4 col-lg-push-8', function () {
      that.trigger('animation:2:switchClass:end');
      that.trigger('animation:2:slideDown:start');


      addAffix.bind(that)();

      that.$children[1].slideDown(function () {
        that.trigger('animation:2:slideDown:end');
        that.trigger('animation:2:end');
        that.trigger('animation:end');
      })
    });

    return that;
  };

  return Backbone.View.extend({
    tagName: 'div',
    className: 'row',

    initialize: function (options) {
      var that = this;

      that.options = options || {};

      that.state = {
        currentState: that.options.initialState || '1-column',
        children: that.options.children || [],
        windowWidth: $(window).outerWidth()
      };
      that.render();

      return that;
    },

    render: function () {
      var that = this;

      if (that.state.currentState === '1-column') {
        that.$children = [
          $('<div class="col-lg-8 col-lg-offset-2">').appendTo(that.$el),
          $('<div class="col-lg-8 col-lg-pull-4">').hide().appendTo(that.$el)
        ];
      } else {
        that.state.currentState = '2-column';

        that.$children = [
          $('<div class="col-lg-4 col-lg-push-8">').appendTo(that.$el),
          $('<div class="col-lg-8 col-lg-pull-4">').appendTo(that.$el)
        ];

        addAffix.bind(that)();
      }

      for (var i = 0; i < 2; i++) {
        that.state.children[i].$el.appendTo(getNodeElement(that.$children[i]));
      }

      return that;
    },

    goTo: function (state) {
      var that = this;

      if (state === that.state.currentState) {
        return that;
      }

      if (state === '1-column') {
        return layout1Column.bind(that)();
      }

      if (state === '2-column') {
        return layout2Column.bind(that)();
      }

      return that;
    },

    toggle: function () {
      var that = this;

      return that.goTo((that.state.currentState === '1-column') ? '2-column' : '1-column');
    }
  });
}));