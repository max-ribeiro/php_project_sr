'use strict';

define('handlebars.helper.default', ['handlebars'], function (Handlebars) {
  Handlebars.registerHelper('default', function (context, options) {
    if (context) {
      return context;
    }

    return new Handlebars.SafeString('<span class="sigo-utils-added-by-system">(Não informado)</span>');
  });
});
