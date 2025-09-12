'use strict';

define('handlebars.helper.switch', ['handlebars'], function (Handlebars) {
  Handlebars.__switch_stack__ = [];

  Handlebars.registerHelper("switch", function (value, options) {
    Handlebars.__switch_stack__.push({
      switch_match: false,
      switch_value: value
    });
    var html = options.fn(this);
    Handlebars.__switch_stack__.pop();
    return html;
  });

  Handlebars.registerHelper("case", function (value, options) {
    var args = Array.prototype.slice.call(arguments);
    var options = args.pop();
    var caseValues = args;
    var stack = Handlebars.__switch_stack__[Handlebars.__switch_stack__.length - 1];

    if (stack.switch_match || caseValues.indexOf(stack.switch_value) === -1) {
      return '';
    } else {
      stack.switch_match = true;
      return options.fn(this);
    }
  });

  Handlebars.registerHelper("switch-default", function (options) {
    var stack = Handlebars.__switch_stack__[Handlebars.__switch_stack__.length - 1];
    if (!stack.switch_match) {
      return options.fn(this);
    }
  });
});
