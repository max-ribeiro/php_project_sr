'use strict';

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define('parseQueryString', [], factory);
  } else if (typeof exports === 'object') {
    module.exports.parseQueryString = factory();
  } else {
    window.parseQueryString = factory();
  }
}(function () {
  return function (queryString) {
    if (!queryString) {
      return {};
    }

    var params = {};
    var queries;
    var temp;
    var i;
    var l;

    // Split into key/value pairs
    queries = queryString.split("&");

    // Convert the array of strings into an object
    for (i = 0, l = queries.length; i < l; i++) {
      temp = queries[i].split('=');
      params[temp[0]] = decodeURIComponent(temp[1]);
    }

    return params;
  };
}));