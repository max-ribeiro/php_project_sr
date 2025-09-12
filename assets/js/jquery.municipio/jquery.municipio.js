'use strict';

(function (factory, jQuery, Handlebars) {

    if (typeof define === 'function' && define.amd) {
        define('jquery.modal', ['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports['jquery.modal'] = factory(require('jquery'));
    } else {
        factory(jQuery, Handlebars);
    }

}(function ($, Handlebars) {

    var cacheUF;

    function getUF() {
        if (cacheUF) return cacheUF;
        $.ajax({
            url: window.initialState.url_home + 'api/v2/action.php',
            data: {
                _class: 'estados',
                _method: 'searchBy'
            },
            dataType: 'json',
            async: false,
            success: function (data) {
                cacheUF = data.items;
            },
        });
        return cacheUF;
    }

    function getTemplate(data) {
        if (!window.templateMunicipio) {
            $.ajax({
                url: window.initialState.url_home + 'assets/js/jquery.municipio/template.html',
                async: false,
                success: function (html) {
                    window.templateMunicipio = html;
                },
            });
        }
        var template = Handlebars.compile(window.templateMunicipio);
        template = $(template(data));
        return template;
    }

    function addSelect2(where, uf) {
        return where.select2({
            placeholder: $('<div>').html('Munic&iacute;pio').html(),
            allowClear: true,
            minimumInputLength: 3,
            ajax: {
                url: window.initialState.url_home + 'api/v2/action.php',
                delay: 500,
                dataType: 'json',
                type: 'post',
                data: function (params) {
                    return {
                        _class: 'municipio',
                        _method: 'searchByNomeMunicipio',
                        pageNumber: params.page || 1,
                        rowsPage: 10,
                        uf: uf,
                        nomeMunicipio: params.term,
                    };
                },
                processResults: function (result, params) {
                    // parse the results into the format expected by Select2
                    // since we are using custom formatting functions we do not need to
                    // alter the remote JSON data, except to indicate that infinite
                    // scrolling can be used
                    var data = $.map(result.items, function (obj) {
                        obj.id = obj.id || obj.id_municipio;
                        obj.text = obj.text || obj.nome_municipio + (uf ? '' : ' - ' + obj.sigla_estado);
                        return obj;
                    });

                    params.page = params.page || 1;
                    result.total = result.total || 0;

                    return {
                        results: data,
                        pagination: {
                            more: (params.page * 10) < result.total
                        }
                    }
                }
            }
        });
    }

    function Municipio(parent, uf) {
        var self = this;

        self.parent = parent;

        self.element = function () {
            return self.parent.find('[data="municipio"]');
        }();

        self.render = function () {
            addSelect2(self.element, uf);
        }

        self.val = function (id, name) {
            if (id == undefined) {
                return self.element.val();
            } else if (id) {
                self.element.html('<option value="' + id + '" selected>' + name + '</option>');
                self.element.val(id).trigger('change');
            } else {
                //clear
                self.element.html('');
                self.element.val('').trigger('change');
            }
        }

        self.render();
    }

    function UFMunicipio(where, params) {
        if (params.showuf) params.listUF = getUF();
        var self = this;
        self.element = $(where).html(getTemplate(params));
        self.element.css('display', params.display ? params.display : 'block');
        self.municipio = new Municipio(self.element, params.valueuf);
        if (params.valuemunicipioid && params.valuemunicipio) {
            self.municipio.val(params.valuemunicipioid, params.valuemunicipio);
        }

        if (params.showuf) {
            self.uf = self.element.find('[data="uf"]');
            self.uf.on('change', function (event) {
                $(event.target).prev().find('.tipo_pesquisa').html($(event.target).find('option:selected').text());
                self.municipio.element.prop("disabled", !event.target.value);
                self.municipio.val('', '');
                self.municipio = new Municipio(self.element, self.uf.val());
            });
            if (params.valueuf) {
                self.uf.val(params.valueuf).trigger('change');
            }
        }
    }


    function getAttrs(element) {
        var data = {};
        for (var i in element.attributes) {
            if (element.attributes[i] && element.attributes[i].name && element.attributes[i].value) {
                data[element.attributes[i].name] = element.attributes[i].value;
            }
        }
        return data;
    }

    var paramsDefault = {
        nameuf: 'uf',
        namemunicipio: 'municipio',
        valueuf: null,
        valuemunicipioid: null,
        valuemunicipio: null,
    };

    function init() {
        $.fn.select2.defaults.set('theme', 'bootstrap');

        $('app-municipio').each(function () {
            var data = $.extend({}, paramsDefault, getAttrs(this));
            if (data.autostart != 'false') {
                new UFMunicipio(this, data);
            }
        });
    }

    $(document).ready(init);

    $.fn.municipio = function (params) {
        params = params ? params : {};
        var data = $.extend({}, paramsDefault, getAttrs(this[0]), params);
        return new UFMunicipio(this, data);
    };


}, jQuery, Handlebars));