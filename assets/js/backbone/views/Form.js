'use strict';

/**
 * User: Ivan Caldeira Sanches <ivans@compnet.com.br>
 * Date: 10/01/2018 15:16
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'moment', 'toastr', 'jquery', 'backbone', 'handlebars', 'bootstrap.datetimepicker'], factory);
  } else if (typeof exports === 'object') {
    module.exports.Form = factory(require('underscore'), require('moment'), require('toastr'), require('jquery'), require('backbone'), require('handlebars'), require('bootstrap.datetimepicker'));
  } else {
    window.Form = factory(_, moment, toastr, jQuery || $, Backbone, Handlebars);
  }
}(function (_, moment, toastr, $, Backbone, Handlebars) {
  var templateBtnDropdownMenu = [
    '<div class="input-group-btn">',
    '    <button',
    '        type="button"',
    '        class="btn btn-default dropdown-toggle"',
    '        data-toggle="dropdown"',
    '        aria-haspopup="true"',
    '        aria-expanded="false"',
    '    >',
    '        <span class="input-group-btn--text">{{selected.text}}</span> <span class="caret"></span>',
    '    </button>',
    '    <ul class="dropdown-menu">',
    '        {{#each btnDropdownMenu}}',
    '            <li><a href="#" data-value="{{value}}" {{#if event}}data-event="{{event}}"{{/if}} {{#if selected}}data-selected{{/if}}>{{text}}</a></li>',
    '        {{/each}}',
    '    </ul>',
    '</div>',
    '<input type="hidden" name="{{selected.name}}" value="{{selected.value}}">'
  ].join('');

  var templateInputGroupAddon = [
      '<span class="input-group-addon">',
      '   <div class="{{addonClass}}"></div>',
      '</span>',
  ].join('');


  return Backbone.View.extend({
    tagName: 'form',

    events: {
      'keypress [data-js-only-letter]': 'onlyLetter',
      'keypress [data-js-only-integer]': 'onlyInteger',
      'keypress [data-js-only-number]': 'onlyNumber',
      'submit': 'handleSubmit'
    },

    onlyLetter: function (e) {
      if (
        // Allow: backspace, delete, tab, escape and enter
        $.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1
        // Allow: Ctrl/cmd+A
        || (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true))
        // Allow: Ctrl/cmd+C
        || (e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true))
        // Allow: Ctrl/cmd+X
        || (e.keyCode === 88 && (e.ctrlKey === true || e.metaKey === true))
        // Allow: home, end, left, right
        || (e.keyCode >= 35 && e.keyCode <= 39)
      ) {
        return;
      }

      // Ensure that it is a letter and stop the keypress
      if (!(e.keyCode >= 65 && e.keyCode <= 120)) {
        e.preventDefault();
      }
    },

    onlyInteger: function (e) {
      if (
        // Allow: backspace, delete, tab, escape and enter
        $.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) !== -1
        // Allow: Ctrl/cmd+A
        || (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true))
        // Allow: Ctrl/cmd+C
        || (e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true))
        // Allow: Ctrl/cmd+X
        || (e.keyCode === 88 && (e.ctrlKey === true || e.metaKey === true))
        // Allow: home, end, left, right
        || (e.keyCode >= 35 && e.keyCode <= 39)
      ) {
        return;
      }

      // Ensure that it is a number and stop the keypress
      if (
        (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))
        && (e.keyCode < 96 || e.keyCode > 105)
      ) {
        e.preventDefault();
      }
    },

    onlyNumber: function (e) {
      if (
        // Allow: backspace, delete, tab, escape, enter and .
        $.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1
        // Allow: Ctrl/cmd+A
        || (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true))
        // Allow: Ctrl/cmd+C
        || (e.keyCode === 67 && (e.ctrlKey === true || e.metaKey === true))
        // Allow: Ctrl/cmd+X
        || (e.keyCode === 88 && (e.ctrlKey === true || e.metaKey === true))
        // Allow: home, end, left, right
        || (e.keyCode >= 35 && e.keyCode <= 39)
      ) {
        return;
      }

      // Ensure that it is a number and stop the keypress
      if (
        (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))
        && (e.keyCode < 96 || e.keyCode > 105)
      ) {
        e.preventDefault();
      }
    },

    handleSubmit: function () {
    },

    afterRender: function () {},

    constructor: function (options) {
      var that = this;

      if (options.addEvents) {
        that.events = _.assign({}, that.events, options.addEvents);
      }

      that.handleSubmit = options.onSubmit || options.handleSubmit || that.handleSubmit;
      that.handleSubmit = that.handleSubmit.bind(that);

      that.afterRender = options.afterRender || that.afterRender;
      that.afterRender = that.afterRender.bind(that);

      return Backbone.View.prototype.constructor.apply(this, arguments);
    },

    initialize: function (options) {
      var that = this;

      that.options = options || {};
      that.data = that.options.data || {};
      that.template = Handlebars.compile(that.options.template || '');
      that.templateBtnDropdownMenu = Handlebars.compile(templateBtnDropdownMenu);
      that.templateInputGroupAddon = Handlebars.compile(templateInputGroupAddon);

      that.defaultInitialDate = moment(window.initialState.today || null).subtract(1, 'year').add(1, 'day');
      that.defaultFinalDate = moment(window.initialState.today || null);

      that.render();

      return that;
    },

    render: function () {
      var that = this;

      that.$el.html(that.template(that.data));

      that.datetimepicker = [];
      that.$('[data-js-datetimepicker-periodo]').each(function (index) {
        var $this = $(this);

        var $periodoInicial = $this.find('[data-js-datetimepicker-periodo-inicial]');
        var $periodoFinal = $this.find('[data-js-datetimepicker-periodo-final]');

        that.datetimepicker[index] = {
          name: $this.data('jsDatetimepickerPeriodo') || '',
          inicial: $periodoInicial,
          final: $periodoFinal
        };

        $periodoInicial.datetimepicker({ format: 'DD/MM/YYYY', maxDate: that.defaultFinalDate });
        $periodoFinal.datetimepicker({ format: 'DD/MM/YYYY', minDate: that.defaultInitialDate, maxDate: that.defaultFinalDate });

        $periodoInicial.data('DateTimePicker').date(that.defaultInitialDate);

        $periodoInicial.on('dp.change', function (e) {
          if (!e.date) {
            $periodoFinal.data('DateTimePicker').minDate(false);
            return;
          }

          var initialDate = moment.isMoment(e.date) ? e.date : moment(e.date);

          $periodoFinal.data('DateTimePicker').minDate(initialDate);

          var finalDate = $periodoFinal.data('DateTimePicker').date();

          if (!finalDate) {
            return;
          }

          if (finalDate.subtract(1, 'year').add(1, 'day').isAfter(initialDate)) {
            // Período maior que um ano
            $periodoFinal.data('DateTimePicker').date(initialDate.add(1, 'year').subtract(1, 'day'));
            toastr.warning('Período maior que um ano, a data final foi ajustada automaticamente.');
          }
        });

        $periodoFinal.on('dp.change', function (e) {
          if (!e.date) {
            $periodoInicial.data('DateTimePicker').maxDate($periodoFinal.data('DateTimePicker').maxDate());
            return;
          }

          var finalDate = moment.isMoment(e.date) ? e.date : moment(e.date);

          $periodoInicial.data('DateTimePicker').maxDate(finalDate);

          var initialDate = $periodoInicial.data('DateTimePicker').date();

          if (!initialDate) {
            return;
          }

          if (initialDate.add(1, 'year').subtract(1, 'day').isBefore(finalDate)) {
            // Período maior que um ano
            $periodoInicial.data('DateTimePicker').date(finalDate.subtract(1, 'year').add(1, 'day'));
            toastr.warning('Período maior que um ano, a data inicial foi ajustada automaticamente.');
          }
        });
      });

      that.$('[data-form-input-group-btn]').each(function () {
        var $el = $(this);
        var $parent = $el.parent();

        var data = eval('(' + $el.data('formInputGroupBtn') + ')');

        if (!$parent.hasClass('input-group')) {
          // Cria wrapper
          $el.appendTo($('<div class="input-group">'));
        }

        data.selected = _.find(data.btnDropdownMenu || [], { selected: true });
        data.selected.name = $el.attr('name') + '--type';

        _.map(data.btnDropdownMenu, function (item) {
          if (item.event && that.options[item.event]) {
            that[item.event] = that.options[item.event].bind(that);
          }
        });

        var $inputGroupBtn;
        var $inputType;
        var dataAddon;
        if(typeof that.$('[data-form-input-addon]') != "undefined"){
            dataAddon = eval('(' + $el.data('formInputAddon') + ')');
        }
        if (data.btnPossition === 'after') {
          $el.after(that.templateBtnDropdownMenu(data));
          $inputGroupBtn = $el.next();
          $inputType = $inputGroupBtn.next();
          if(typeof dataAddon != 'undefined'){
              $el.before(that.templateInputGroupAddon(dataAddon));
          }

        } else {
          $el.before(that.templateBtnDropdownMenu(data));
          $inputType = $el.prev();
          $inputGroupBtn = $inputType.prev();
          if(typeof dataAddon != 'undefined'){
                $inputType.before(that.templateInputGroupAddon(dataAddon));
          }

        }

        var $button = $inputGroupBtn.find('button');
        var $dropdownMenu = $inputGroupBtn.find('.dropdown-menu');

        $dropdownMenu.find('a').click(function (e) {
          e.preventDefault();

          var $link = $(this);

          if ($link.is('[data-selected]')) {
            return;
          }

          $dropdownMenu.find('a[data-selected]').removeAttr('data-selected');
          $link.attr('data-selected', '');
          $inputType.val($link.data('value')).change();
          $button.find('.input-group-btn--text').text($link.text());

          var event = $link.data('event');
          event && that[event] && that[event].apply(that, [e]);
        });
      });

      that.afterRender && that.afterRender();

      return that;
    }
  });
}));