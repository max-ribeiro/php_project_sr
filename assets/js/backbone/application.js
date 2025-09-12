'use strict';

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define('app', ['underscore', 'backbone'], factory);
  } else if (typeof exports === 'object') {
    module.exports.app = factory(require('underscore'), require('backbone'));
  } else {
    window.app = factory(Backbone);
  }
}(function (_, Backbone) {
  var app = {};

  app.initialState = window.initialState || {};

  var urlHome = app.initialState.urlHome || app.initialState._URL_HOME_ || '';
  if (urlHome) {
    app._URL_HOME_ = app.urlHome = urlHome.replace(/\/$/, '');
  }

  app.vent = _.extend({}, Backbone.Events);

  return app;
}));
