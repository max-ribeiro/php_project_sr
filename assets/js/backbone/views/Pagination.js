'use strict';

/**
 * User: Ivan Caldeira Sanches <ivans@compnet.com.br>
 * Date: 18/01/2018 14:22
 */

define(
  [
    'toastr',
    'jquery',
    'backbone',
    'handlebars'
  ],
  function (toastr, $, Backbone, Handlebars) {
    var template =
      '{{#if showPagination}}' +
      '  <ul class="pagination">' +
      '    {{#if showArrows}}' +
      '      {{#if hasPrevious}}' +
      '        <li>' +
      '          <a data-js-first href="#" aria-label="Primeiro">' +
      '            <span aria-hidden="true">&larr;</span>' +
      '          </a>' +
      '        </li>' +
      '        <li>' +
      '          <a data-js-previous-page href="#" aria-label="Paginação anterior">' +
      '            <span aria-hidden="true">&laquo;</span>' +
      '          </a>' +
      '        </li>' +
      '      {{/if}}' +
      '    {{/if}}' +
      '    {{#each pages}}' +
      '      <li{{#if current}} class="active"{{/if}}><a data-js-page="{{page}}" href="#">{{page}}</a></li>' +
      '    {{/each}}' +
      '    {{#if showArrows}}' +
      '      {{#if hasNext}}' +
      '        <li>' +
      '          <a data-js-next-page href="#" aria-label="Paginação posterior">' +
      '            <span aria-hidden="true">&raquo;</span>' +
      '          </a>' +
      '        </li>' +
      '        <li>' +
      '          <a data-js-last href="#" aria-label="Último">' +
      '            <span aria-hidden="true">&rarr;</span>' +
      '          </a>' +
      '        </li>' +
      '      {{/if}}' +
      '    {{/if}}' +
      '  </ul>' +
      '  {{#if showKeyPress}}' +
      '    <div>' +
      '      <div style="display: table; margin: 15px auto;">' +
      '        <input' +
      '          data-js-go-to-page' +
      '          style="display: table-cell; width: 64px;"' +
      '          class="form-control text-center"' +
      '          type="text"' +
      '          value="{{currentPage}}"' +
      '        >' +
      '        <span style="display: table-cell; font-size: 1.5em; vertical-align: middle;">' +
      '          &nbsp;/&nbsp;{{lastPage}}' +
      '        </span>' +
      '      </div>' +
      '    </div>' +
      '  {{/if}}' +
      '{{/if}}' +
      '{{#if showTotal}}' +
      '  <div>' +
      '    Total: <strong style="font-size: 1.3em">{{total}}</strong><br>' +
      '    São listadas no máximo {{amount}} itens por página' +
      '  </div>' +
      '{{/if}}'
    ;

    return Backbone.View.extend({
      tagName: 'nav',
      className: 'text-center',
      attributes: {
        'aria-label': 'Page navigation'
      },

      template: Handlebars.compile(template),

      events: {
        'click [data-js-page]': 'goTo',
        'click [data-js-first]': 'goFirst',
        'click [data-js-previous-page]': 'goPreviousPage',
        'click [data-js-next-page]': 'goNextPage',
        'click [data-js-last]': 'goLast',
        'keydown [data-js-go-to-page]': 'goToPage'
      },

      state: {},

      initialize: function (options) {
        var that = this;

        this.options = options || {};

        that.state.showPagination = typeof options.showPagination !== 'undefined' ? options.showPagination : true;
        that.state.showTotal = typeof options.showTotal !== 'undefined' ? options.showTotal : true;
        that.state.showKeyPress = typeof options.showKeyPress !== 'undefined' ? options.showKeyPress : true;
        that.state.showArrows = typeof options.showArrows !== 'undefined' ? options.showArrows : true;

        that.listenTo(that.collection, 'sync', that._handleSync);

        that.$el.hide();

        return that;
      },

      goTo: function (e) {
        var that = this;

        e.preventDefault();

        that.trigger('change:page', $(e.currentTarget).data('jsPage'));
      },

      goFirst: function (e) {
        var that = this;

        e.preventDefault();

        that.trigger('change:page', 1);
      },

      goPreviousPage: function (e) {
        var that = this;

        e.preventDefault();

        var page = (that.state.currentPage - 5);
        if (page < 1) {
          page = 1;
        }

        that.trigger('change:page', page);
      },

      goNextPage: function (e) {
        var that = this;

        e.preventDefault();

        var page = (that.state.currentPage + 5);
        if (page > that.state.lastPage) {
          page = that.state.lastPage;
        }

        that.trigger('change:page', page);
      },

      goLast: function (e) {
        var that = this;

        e.preventDefault();

        that.trigger('change:page', this.state.lastPage);
      },

      goToPage: function (e) {
        var that = this;

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
          if (e.keyCode === 13) {
            var page = e.currentTarget.value;
            if (page < 1 || page > this.state.lastPage) {
              toastr.warning('Digite um número entre 1 e ' + this.state.lastPage + '.');
              e.preventDefault();

              return;
            }

            that.trigger('change:page', page);
          }

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

      _handleSync: function (collection, response) {
        var that = this;

        if (response.total - 0 === 0) {
          that.$el.hide();
          return that;
        }

        var lastPage = Math.ceil(response.total / response.amount);

        var start = 1;
        var end = lastPage + 1;
        if (lastPage > 5) {
          if (response.page < 3) {
            start = 1;
            end = 6;
          } else if (response.page > lastPage - 2) {
            start = lastPage - 5;
            end = lastPage + 1;
          } else {
            start = response.page - 2;
            end = response.page - 0 + 3;
          }
        }

        var pages = _.range(start, end);
        _.forEach(pages, function (page, index) {
          pages[index] = {
            page: page,
            current: (page === response.page - 0)
          }
        });

        that.state.total = response.total - 0 || 0;
        that.state.amount = response.amount - 0 || 0;
        that.state.hasPrevious = response.hasPrevious;
        that.state.hasNext = response.hasNext;
        that.state.pages = pages;
        that.state.currentPage = response.page - 0 || 1;
        that.state.lastPage = lastPage || 0;

        if (that.state.total <= response.amount) {
          that.state.showPagination = false;
        } else {
          that.state.showPagination = typeof that.options.showPagination !== 'undefined' ? that.options.showPagination : true;
        }

        if (that.state.lastPage <= 5) {
          that.state.showKeyPress = false;
          that.state.showArrows = false;
        } else {
          that.state.showKeyPress = typeof that.options.showKeyPress !== 'undefined' ? that.options.showKeyPress : true;
          that.state.showArrows = typeof that.options.showArrows !== 'undefined' ? that.options.showArrows : true;
        }

        that.render();
        that.$el.show();

        return that;
      },

      render: function () {
        var that = this;

        that.$el.html(that.template(that.state));

        return that;
      }
    });
  }
);