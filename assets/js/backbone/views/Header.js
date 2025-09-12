'use strict';

/**
 * User: Ivan Caldeira Sanches <ivans@compnet.com.br>
 * Date: 09/01/2018 10:43
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'backbone', 'handlebars'], factory);
  } else if (typeof exports === 'object') {
    module.exports.Header = factory(require('underscore'), require('jquery'), require('backbone'), require('handlebars'));
  } else {
    window.Header = factory(_, jQuery, Backbone, Handlebars);
  }
}(function (_, $, Backbone, Handlebars) {
  var template = [
    '<div class="row">',
    '    <div class="col-xs-8">',
    '        <h2 class="sg-header__title">{{title}}</h2>',
    '    </div>',
      '    <div class="col-xs-4 text-right">',

      '<a href="#" class="btn btn-default pull-right" style="margin-top: 20px;" data-js-button-click>',
      '            <i class="fa {{buttonIcon}} fa-fw" aria-hidden="true"></i>',
        '            {{buttonText}}',
        '        </a>',
      '        <a href="#" class="btn btn-default pull-right hide" id="btnVoltar" style="margin-top: 20px; margin-right: 5px;" data-js-button-2-click>',
      '            <i class="fa {{button2Icon}} fa-fw" aria-hidden="true"></i>',
      '            {{button2Text}}',
      '        </a>',
      '    </div>',
    '</div>'
  ].join('');

  return Backbone.View.extend({
    tagName: 'div',
    className: 'container-fluid sg-header',

    template: Handlebars.compile(template),

    initialize: function (options) {
      var that = this;

      that.options = options || {};

      that.render();

      return that;
    },

    render: function () {
      var that = this;

      that.$el.html(that.template(that.options.data));
      that.$('[data-js-button-click]').click(that.options.buttonOnClick || function (e) { e.preventDefault() });
      that.$('[data-js-button-2-click]').click(that.options.button2OnClick || function  (e) { e.preventDefault()})

      return this;
    }
  });
}));