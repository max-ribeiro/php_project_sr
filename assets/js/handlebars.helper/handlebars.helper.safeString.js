'use strict';

define('handlebars.helper.safeString', ['handlebars'], function (Handlebars) {
  Handlebars.registerHelper('safeString', function (context, options) {
    return new Handlebars.SafeString(context);
  });
});
