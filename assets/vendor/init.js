/**
 * jQuery Plugins
 */
(function($) {
    if (typeof $ !== 'function') {
        return;
    }

    /**
     * Bootstrap
     * https://getbootstrap.com/docs/3.4/javascript/
     */
    $('[data-toggle=tooltip]').tooltip();

    /**
     * Select2
     * https://select2.org/configuration/options-api
     */
    if (typeof $.fn.select2 === 'function') {
        $.fn.select2.defaults.set('theme', 'bootstrap');
        $.fn.select2.defaults.set('minimumResultsForSearch', 4);
        $.fn.select2.defaults.set('placeholder', 'Selecione');

        $('select').select2();
    }

    /**
     * Datetimepicker for Bootstrap 3
     * https://github.com/Eonasdan/bootstrap-datetimepicker/
     */
    if (typeof $.fn.datetimepicker === 'function') {
        $('[data-toggle=datepicker]').each(function() {
            $(this).datetimepicker({
                locale         : 'pt-br',
                format         : 'DD/MM/YYYY',
                showTodayButton: true,
                showClose      : true,
                showClear      : true,
                useCurrent     : false
            });

            $(this).attr('autocomplete', 'off');
        });
    }

    /**
     * Helpers for method
     */
    $.extend({
        isEmpty     : function(value) {
            value = $.trim(value);

            if (!isNaN(value)) {
                return Number(value) === 0;
            }

            return value.length === 0;
        },
        alertSuccess: function(message) {
            if (typeof toastr === 'object') {
                toastr.clear();
                toastr.success(message, 'Sucesso!');
            } else {
                alert('Sucesso!\n' + message);
            }
        },
        alertError  : function(message) {
            if ($.isEmpty(message)) {
                message = 'Entre em contato com o suporte SIGO.';
            }

            if (typeof toastr === 'object') {
                toastr.clear();
                toastr.error(message, 'Atenção!');
            } else {
                alert('Atenção!\n' + message);
            }
        }
    });

    /**
     * Helpers for element
     */
    $.fn.extend({
        isEmpty    : function() {
            if ($(this).length === 0) {
                return true;
            }
            return $.isEmpty($(this).val());
        },
        toastrError: function(message, title) {
            toastr.clear();
            toastr.error(message, title || 'Atenção!');
            return $(this).focus();
        }
    });
})(jQuery);

/**
 * toastr
 * https://github.com/CodeSeven/toastr
 */
(function() {
    if (typeof toastr !== 'object') {
        return;
    }

    toastr.options = {
        progressBar      : true,
        closeButton      : true,
        preventDuplicates: true,
        timeOut          : 30000,
        extendedTimeOut  : 0
    };
})();