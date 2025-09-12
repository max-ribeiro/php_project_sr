'use strict';

/**
 * User: Ivan Caldeira Sanches <ivans@compnet.com.br>
 * Date: 11/01/2018 09:43
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'backbone'], factory);
  } else if (typeof exports === 'object') {
    module.exports.getNodeElement = factory(require('jquery'), require('backbone'));
  } else {
    window.getNodeElement = factory(jQuery || $, Backbone);
  }
}(function ($, Backbone) {
  return function (view) {
    return (view instanceof Backbone.View)
      ? view.$el
      : view;
  }
}));
