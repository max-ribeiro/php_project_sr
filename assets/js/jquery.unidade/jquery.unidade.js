'use strict';

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define('jquery.unidade', ['jquery', 'handlebars'], factory);
    } else if (typeof exports === 'object') {
        module.exports['jquery.unidade'] = factory(require('jquery'));
    } else {
        factory(window.jQuery, window.Handlebars);
    }

}(function ($, Handlebars) {

    function getUrlHome() {
        if (typeof define === 'function' && define.amd) {
            return '/';
        }
        if (window.initialState && window.initialState.url_home) {
            return window.initialState.url_home;
        }
        if (window.request && window.request.url_home) {
            return window.request.url_home;
        }
        if (window.url_home) {
            return window.url_home;
        }
    }

    function getTemplate(data) {
        if (!window.templateUnidade) {
            $.ajax({
                url: getUrlHome() + 'assets/js/jquery.unidade/template.html',
                async: false,
                success: function (html) {
                    window.templateUnidade = html;
                },
            });
        }
        var template = Handlebars.compile(window.templateUnidade);
        template = $(template(data));
        return template;
    }

    function getNameById(id, obj) {
        $.ajax({
            url: getUrlHome() + 'api/v2/action.php',
            dataType: 'json',
            type: 'post',
            data: {
                _class: 'unidades',
                _method: 'searchBy',
                idCoord: id
            },
            success: function (data) {
                if (data.items[0]) {
                    obj.val(data.items[0].id_coord, data.items[0].sigla_coord);
                }
            },
        });
    }

    function addSelect2(where, _params) {
        var rowsPage = 10;
        return where.select2({
            placeholder: _params.placeholder,
            allowClear: true,
            tags: _params.allownotfound,
            minimumInputLength: 2,
            ajax: {
                url: getUrlHome() + 'api/v2/action.php',
                delay: 500,
                dataType: 'json',
                type: 'post',
                data: function (params) {
                    var obj = {
                        _class: 'unidades',
                        _method: 'searchBy',
                        uf: 'MS',
                        pageNumber: params.page || 1,
                        rowsPage: rowsPage,
                        siglaCoordOrNomeCoord: params.term,
                        coord_inativas: _params.coord_inativas || null
                    };

                    $.extend(obj, _params.ajaxdata);

                    return obj;
                },
                processResults: function (result, params) {

                    // parse the results into the format expected by Select2
                    // since we are using custom formatting functions we do not need to
                    // alter the remote JSON data, except to indicate that infinite
                    // scrolling can be used
                    var data = $.map(result.items, function (obj) {
                        obj.id = obj.id || obj.id_coord;
                        obj.text = obj.text || obj.sigla_coord; //+ '<small>' + obj.nome_coord + '</small>';
                        return obj;
                    });

                    params.page = params.page || 1;
                    result.total = result.total || 0;

                    return {
                        results: data,
                        pagination: {
                            more: (params.page * rowsPage) < result.total
                        }
                    }
                }
            },
            escapeMarkup: function (markup) {
                return markup;
            },
            templateResult: function (repo) {
                if (repo.loading) {
                    return repo.text;
                }

                var markup = '';
                if (repo.sigla_coord || repo.nome_coord) {
                    markup += '<div>';
                    markup += '<div>';
                    markup += repo.sigla_coord;
                    markup += '</div>';
                    markup += '<small class="text-muted">' + repo.nome_coord + '</small>';
                    markup += '</div>';
                } else {
                    markup += repo.text + ' <i style="font-size: 80%;">(não encontrado)</i>';
                }

                return markup;
            },
            templateSelection: function (repo) {
                return repo.sigla_coord || repo.text;
            }
        });

    }

    function Unidade(where, params) {

        var self = this;
        self.parent = $(where);
        self.parent.html(getTemplate(params));
        self.element = self.parent.find('[data="unidade"]');

        self.render = function () {
            addSelect2(self.element, params);
        }

        self.val = function (id, name) {
            if (id == undefined) {
                return self.element.val();
            } else if (id) {
                if (name === undefined) {
                    getNameById(id, self);
                } else {
                    self.element.html('<option value="' + id + '" selected>' + name + '</option>');
                }
                self.element.val(id).trigger('change');
            } else {
                //clear
                self.element.html('');
                self.element.val('').trigger('change');
            }
        }

        self.render();
        if (params.value) self.val(params.value);
        if (params.valuetext) self.element.html('<option selected>' + params.valuetext + '</option>');
    }


    function getAttrs(element) {
        var data = {};
        if (element) {
            for (var i in element.attributes) {
                if (element.attributes[i] && element.attributes[i].name && element.attributes[i].value) {
                    data[element.attributes[i].name] = element.attributes[i].value;
                }
            }
        }
        return data;
    }

    var paramsDefault = {
        name: 'unidade',
        value: null,
        placeholder: 'Unidade',
        allownotfound: false
    };

    function init() {
        $.fn.select2.defaults.set('theme', 'bootstrap');

        $('app-unidade').each(function () {
            var data = $.extend({}, paramsDefault, getAttrs(this));
            if (data.autostart != 'false') {
                new Unidade(this, data);
            }
        });
    }

    $(document).ready(init);
    $.unidadeInit = init;

    $.fn.unidade = function (params) {
        var result = new Array();
        params = params ? params : {};
        this.each(function () {
            var data = $.extend({}, paramsDefault, getAttrs(this), params);
            result.push(new Unidade(this, data));
        });
        return result.length > 1 ? result : result[0];
    };


}));