'use strict';

(function (factory, jQuery) {
  if (typeof define === 'function' && define.amd) {
    define('jquery.ui.sigo.buscarCidadao', ['jquery', 'jquery.ui', 'bootstrap'], factory);
  } else if (typeof exports === 'object') {
    module.exports.jqueryUISigoBuscarCidadao = factory(require('jquery'), require('jquery.ui'), require('bootstrap'));
  } else {
    window.docsigner = factory(jQuery);
  }
}(function ($) {
  var BuscarCidadao = function ($element, options) {
    this.$element = $element;
    this.options = options;
    this.state = {};
  };

  function createItem(value, text) {
    var $li = $('<li></li>');
    $('<a href="#"></a>').data('value', value).html(text).appendTo($li);

    return $li;
  }

  BuscarCidadao.prototype.render = function () {
    var $el = this.$element;
    var options = this.options;
    var state = this.state;

    var $wrapper = $('<div></div>').addClass('input-group');

    $el.addClass('form-control').wrap($wrapper);

    var $inputGroupBtn = $('<div></div>').addClass('input-group-btn').insertBefore($el);
    var $dropdownToggle = $('<button></button>')
      .attr({
        'type': 'button',
        'data-toggle': 'dropdown',
        'aria-haspopup': 'true',
        'aria-expanded': 'false'
      })
      .addClass('btn btn-default dropdown-toggle')
      .html('<span class="dropdown-toggle-text">Nome</span>&nbsp;<span class="caret"></span>')
      .appendTo($inputGroupBtn);
    var $dropdownMenu = $('<ul></ul>').addClass('dropdown-menu').appendTo($inputGroupBtn);

    createItem('nm_cidadao', 'Nome').appendTo($dropdownMenu);
    createItem('cpf', 'CPF').appendTo($dropdownMenu);
    createItem('id_rg', 'RG').appendTo($dropdownMenu);
    createItem('nr_rgi', 'RGI').appendTo($dropdownMenu);
    createItem('nm_mae', 'Nome da mãe').appendTo($dropdownMenu);
    createItem('nm_pai', 'Nome do pai').appendTo($dropdownMenu);

    $('<div class="input-group-addon"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></div>').insertBefore($el);

    var $dropdownToggleText = $dropdownToggle.find('.dropdown-toggle-text');

    var $inputHiddenType = $('<input />')
      .attr({
        'type': 'hidden',
        'name': $el.attr('name') ? $el.attr('name') + '-type' : 'buscar-cidadao-type'
      })
      .insertBefore($el);

    state = {type: 'nm_cidadao', value: ''};
    $inputHiddenType.val(state.type);

    $dropdownMenu.find('li a').click(function (e) {
      e.preventDefault();

      var $this = $(this);

      if (state.type !== $this.data('value')) {
        $dropdownToggleText.html($this.html());
        state.type = $this.data('value');
        $inputHiddenType.val(state.type);
        $el.trigger('buscarCidadao:change:type', state.type);
        $el.trigger('buscarCidadao:change', state);
      }
    });

    $el.keyup(function () {
      var $this = $(this);

      if (state.value !== $this.val()) {
        state.value = $this.val();
        $el.trigger('buscarCidadao:change:value', state.value);
        $el.trigger('buscarCidadao:change', state);
      }
    });

    if (options.autocomplete) {
      // TODO - implementar autocomplete
    }

    this.$wrapper = $wrapper;
    this.$inputGroupBtn = $inputGroupBtn;
    this.$dropdownToggle = $dropdownToggle;
    this.$dropdownMenu = $dropdownMenu;
  };

  BuscarCidadao.prototype.getWrapper = function () { return this.$wrapper; };
  BuscarCidadao.prototype.getInputGroupBtn = function () { return this.$inputGroupBtn; };
  BuscarCidadao.prototype.getDropdownToggle = function () { return this.$dropdownToggle; };
  BuscarCidadao.prototype.getDropdownMenu = function () { return this.$dropdownMenu; };

  BuscarCidadao.prototype.getState = function () { return this.state; };

  $.fn.sigoBuscarCidadao = function (options) {

    options = options || {};

    var args = Array.prototype.slice.call(arguments, 1);
    var res = this;

    this.each(function (index, element) {
      var $element = $(element);
      var buscarCidadao = $element.data('sigoBuscarCidadao');
      var singleRes = null;

      if (typeof options === 'string') {
        // Chamada de método

        if (buscarCidadao[options] && typeof buscarCidadao[options] === 'function') {

          singleRes = buscarCidadao[options].apply(buscarCidadao, args);
          if (!index) {
            // Retorna apenas a primeira chamada
            res = singleRes;
          }
        }
      } else if (!buscarCidadao) {
        // Instanciar o header apenas uma vez

        options = $.extend({}, $.fn.sigoBuscarCidadao.defaults, options);

        buscarCidadao = new BuscarCidadao($element, options);
        $element.data('sigoBuscarCidadao', buscarCidadao);
        buscarCidadao.render();
      }
    });

    return res;
  };

  $.fn.sigoBuscarCidadao.defaults = {
    label: 'Buscar cidadão',
    required: false
  };
}, window.jQuery));
