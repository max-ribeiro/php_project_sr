'use strict';

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['lodash', 'jquery', 'bootstrap'], factory);
  } else if (typeof exports === 'object') {
    // Node, CommonJS-like
    module.exports = factory(require('lodash'), require('jquery'), require('bootstrap'));
  } else {
    // Browser globals (root is window)
    root.returnExports = factory(root._, root.jQuery);
  }
})(this, function (_, $) {
  var id = 'input-search-modal--' + _.random(100000, 999999);

  var URL_HOME = (window.urlHome || window.initialState.urlHome || '').replace(/\/$/, '');

  var $modal = $('<div id="' + id + '" class="modal fade" tabindex="-1" role="dialog">').appendTo('body');
  var $modalDialog = $('<div class="modal-dialog modal-lg" role="document">').appendTo($modal);
  var $modalContent = $('<div class="modal-content">').appendTo($modalDialog);
  var $modalHeader = $('<div class="modal-header">').appendTo($modalContent);
  var $modalHeaderClose = $('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>').appendTo($modalHeader);
  var $modalHeaderTitle = $('<h4 class="modal-title">').appendTo($modalHeader);
  var $modalBodyLoading = $('<div class="modal-body"><h3 class="text-center text-muted" style="margin: 0"><i class="fa fa-spinner fa-spin fa-fw"></i> Carregado...</h3></div>').appendTo($modalContent);
  var $modalBodyTable = $('<table class="table table-striped table-hover">');
  var $modalBodyWithoutItems = $('<div class="modal-body"><h3 class="text-center text-info" style="margin: 0">Nenhum item encontrado</h3></div>');
  var $modalBodyError = $('<div class="modal-body"><h3 class="text-center text-danger" style="margin: 0">Erro inesperado, tente novamente em alguns instantes</h3></div>');
  var $modalFooter = $('<div class="modal-footer" style="text-align: center">').appendTo($modalContent);
  var $modalFooterClose = $('<button type="button" class="btn btn-default pull-right" data-dismiss="modal">Fechar</button>').appendTo($modalFooter);
  var $modalFooterPagination = $('<nav aria-label="Paginação">').appendTo($modalFooter);
  var $modalFooterPaginationList = $('<ul class="pagination" style="margin: 0; padding: 0">').appendTo($modalFooterPagination);

  var $currentBody = $modalBodyLoading;

  function changeBody($nextBody) {
    $currentBody.replaceWith($nextBody);
    $currentBody = $nextBody;
  }

  function render(error, headers, attributesNames, data, selectionType, onSelected, onPaginate) {
    if (error) {
      changeBody($modalBodyError);

      $modalFooterPagination.hide();
      $modalFooterPaginationList.empty();
      return;
    }

    if (data.total === 0) {
      changeBody($modalBodyWithoutItems);

      $modalFooterPagination.hide();
      $modalFooterPaginationList.empty();
      return;
    }

    $modalBodyTable
      .empty()
      .html(resultsTemplate(headers, attributesNames, data, selectionType, onSelected));

    $modalFooterPaginationList
      .empty()
      .html(paginationTemplate(data, onPaginate));

    $modalFooterPagination.show();

    changeBody($modalBodyTable);
  }

  function resultsTemplate(headers, attributesNames, data, selectionType, onSelected) {
    var $thead = $('<thead>');
    var $tr = $('<tr>').appendTo($thead);

    _.each(headers, function (h) {
      $('<th>' + h + '</th>').appendTo($tr);
    });

    if (selectionType === 'button') {
      $('<th class="text-center" style="width: 51px">Ação</th>').appendTo($tr);
    }

    var $tbody = $('<tbody>');
    _.each(data.items, function (i) {
      var $tr = $('<tr>').appendTo($tbody);
      _.each(attributesNames, function (k) {
        var value = '';
        if (typeof k === 'function') {
          value = k(i);
        } else {
          value = i[k];
        }
        $('<td>' + value + '</td>').appendTo($tr);
      });

      if (selectionType === 'button') {
        $(
          '<td class="text-center" style="vertical-align: middle; width: 51px">' +
          '<button type="button" class="btn btn-default btn-xs">' +
          '<i class="fa fa-check fa-fw" aria-hidden="true"></i>' +
          '</button>' +
          '</td>'
        )
          .data('item', i)
          .click(function () {
            onSelected.bind(this)();
          })
          .appendTo($tr);
      } else {
        $tr
          .data('item', i)
          .css({ cursor: 'pointer' })
          .click(function () {
            onSelected.bind(this)();
          });
      }
    });

    return [$thead, $tbody];
  }

  function paginationTemplate(data, onPaginate) {
    var page = data.page;
    var amount = data.amount;
    var total = data.total;

    var pages = [];
    var start = 0;
    var end = 0;

    var totalPages = Math.ceil(total / amount);

    var hasPrevious = false;
    if (page > 1) {
      hasPrevious = true;
    }

    var hasNext = false;
    if (totalPages > 1 && page < totalPages) {
      hasNext = true;
    }

    if (totalPages < 5) {
      start = 1;
      end = totalPages;
    } else {
      if (page < 4) {
        start = 1;
        end = 5;
      } else if (page > totalPages - 3) {
        start = totalPages - 5;
        end = totalPages;
      } else {
        start = page - 2;
        end = page + 2;
      }
    }

    for (var i = start; i <= end; i++) {
      pages.push({ page: i, current: i === page });
    }

    var $items = [];

    if (hasPrevious) {
      $items.push(
        $('<li>')
          .append(
            $('<a href="#" aria-label="Anterior"><span aria-hidden="true">&laquo;</span></a>')
              .click(function (e) {
                e.preventDefault();
                onPaginate(page - 1);
              })
          )
      );
    }

    _.each(pages, function (page) {
      if (page.current) {
        $items.push($('<li class="active"><a href="#">' + page.page + '<span class="sr-only">(atual)</span></a></li>'));
      } else {
        $items.push(
          $('<li>')
            .append(
              $('<a href="#">' + page.page + '</a>')
                .click(function (e) {
                  e.preventDefault();
                  onPaginate(page.page);
                })
            )
        );
      }
    });

    if (hasNext) {
      $items.push(
        $('<li>')
          .append(
            $('<a href="#" aria-label="Próximo"><span aria-hidden="true">&raquo;</span></a>')
              .click(function (e) {
                e.preventDefault();
                onPaginate(page + 1);
              })
          )
      );
    }

    return $items;
  }

  $modal.modal({ show: false });
  $modal.on('hidden.bs.modal', function () {
    $currentBody.replaceWith($modalBodyLoading);
    $currentBody = $modalBodyLoading;

    $modalBodyTable.empty();
    $modalFooterPagination.hide();
    $modalFooterPaginationList.empty();
  });

  $.fn.inputSearchModal = function (options) {
    var $this = this;
    var settings = $.extend(true, {}, $.fn.inputSearchModal.defaults, options);

    var selected = false;

    var superOnSelected = settings.onSelected;
    settings.onSelected = function () {
      selected = true;

      superOnSelected.bind(this)();
      $modal.modal('hide');
    };

    var fetch = function (data) {
      data = data || {};

      var ajaxData = settings.ajax.data || {};

      if (typeof ajaxData === 'function') {
        ajaxData = ajaxData();
      }

      data = $.extend({}, ajaxData, data);
      var ajaxOptions = $.extend({}, settings.ajax, { data: data });

      $.ajax(ajaxOptions)
        .done(function (data) {
          $this.trigger('success', data);
        })
        .fail(function () {
          $this.trigger('error');
        });
    };

    $this.on('success', function (event, data) {
      render(
        null,
        settings.headers,
        settings.attributesNames,
        data,
        settings.selectionType,
        settings.onSelected,
        function (page) {
          fetch({ page: page });
        }
      );
    });

    $this.on('error', function () {
      render(true);
    });

    $this.keypress(function (e) {
      if (e.keyCode !== 13) {
        return true;
      }

      e.preventDefault();

      $modalHeaderTitle.html(settings.title);
      $modal.modal('show');

      fetch();
    });

    $this.keyup(function (e) {
      if (selected === true) {
        e.preventDefault();

        selected = false;
        settings.onDeselected();

        return false;
      }
    });

    return $this;
  };

  $.fn.inputSearchModal.defaults = {
    title: 'Resultados',
    headers: [],
    attributesNames: [],
    selectionType: 'button', // button or row
    onSelected: function () {},
    onDeselected: function () {},
    ajax: {
      url: URL_HOME + '/api/v2/action.php',
      method: 'POST',
      data: {}
    }
  };
});
