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

    function Endereco(where, params) {
        if (!where ||
            (toString.call(where) != "[object HTMLElement]" && toString.call(where[0]) != "[object HTMLElement]")
        ) return;
        var self = this;
        self.element = $(where).html(getTemplate(params, params.template));
        self.cep = self.element.find('[data="cep"]');
        //var componentMunicipio = ;
        self.ufMunicipio = self.element.find('app-municipio').municipio();
        self.uf = self.ufMunicipio.uf;
        self.municipio = self.ufMunicipio.municipio;
        self.bairro = new Bairro(self);
        self.logradouro = new Logradouro(self);
        self.numero = self.element.find('[data="numero"]');

        //set names
        self.cep.attr('name', params.namecep);
        self.uf.attr('name', params.nameuf);
        self.municipio.element.attr('name', params.namemunicipio);
        self.bairro.element.attr('name', params.namebairro);
        self.logradouro.element.attr('name', params.namelogradouro);
        self.numero.attr('name', params.namenumero);

        self.modal;
        self.rowsPage = 10;

        self.cep.mask('99999-999');

        //add events
        self.cep.on('keydown', function (event) {
            if (event.keyCode == 13 || event.which == 13) {
                self.getCEP(event.target.value);
                stopevent(event);
            }
        });
        self.cep.next().find('button').click(function () {
            self.getCEP();
        });
        self.municipio.element.on('change', function (event) {
            self.bairro.element.prop("disabled", !event.target.value);
            self.bairro.val('', '');
        });
        self.bairro.element.on('change', function (event) {
            self.logradouro.element.prop("disabled", !event.target.value);
            self.logradouro.val('', '');
        });

        //set values
        if (params.valuecep) {
            self.cep.val(params.valuecep);
        }
        if (params.valueuf) {
            self.uf.val(params.valueuf).trigger('change');
        }
        if (params.valuemunicipioid && params.valuemunicipio) {
            self.municipio.val(params.valuemunicipioid, params.valuemunicipio);
        }
        if (params.valuebairroid && params.valuebairro) {
            self.bairro.val(params.valuebairroid, params.valuebairro);
        }
        if (params.valuelogradouroid && params.valuelogradouro) {
            self.logradouro.val(params.valuelogradouroid, params.valuelogradouro);
        }
        if (params.valuenumero) {
            self.numero.val(params.valuenumero).trigger('change');
        }
    }


    Endereco.prototype.getCEP = function (cep, page) {
        var self = this;
        cep = cep ? cep : self.cep.val();
        $.blockUI({message: null});
        $.ajax({
            url: window.initialState.url_home + 'api/v2/action.php',
            dataType: "json",
            cache: false,
            data: {
                _class: 'enderecos',
                _method: 'searchByCep',
                pageNumber: page ? page : 1,
                rowsPage: self.rowsPage,
                cep: cep
            },
            method: 'POST',
            complete: function () {
                $.unblockUI();
            },
            success: function (data) {
                $.unblockUI();
                if (data && data.items.length == 1) {
                    self.setInputs({
                        cep: data.items[0].cep,
                        uf: data.items[0].uf,
                        idmunicipio: data.items[0].id_municipio,
                        nomemunicipio: data.items[0].nome_municipio,
                        idbairro: data.items[0].id_bairro,
                        nomebairro: data.items[0].nome_bairro,
                        idlogradouro: data.items[0].id_logradouro,
                        nomelogradouro: data.items[0].nome_logradouro
                    });
                } else if (data && data.items.length) {
                    self.listCEPs(data);
                } else {
                    toastr.error('Nenhum registro encontrado');
                }
            }
        });
    }

    Endereco.prototype.setInputs = function (data) {
        if (!data) return;
        var self = this;
        if (data.cep) {
            self.cep.val(data.cep);
        }
        if (data.cep) {
            self.uf.val(data.uf).trigger('change');
        }
        if (data.cep) {
            self.municipio.val(data.idmunicipio, data.nomemunicipio);
        }
        if (data.cep) {
            self.bairro.val(data.idbairro, data.nomebairro);
        }
        if (data.cep) {
            self.logradouro.val(data.idlogradouro, data.nomelogradouro);
        }
    }

    Endereco.prototype.listCEPs = function (data) {
        var self = this;
        var template = $(getTemplate(data, 'modal'));
        var totalPages = Math.ceil(data.total / self.rowsPage);
        var newModal = false;
        if (self.modal) {
            $(self.modal.element).find('[content]').html(template);
        } else {
            newModal = true;
            self.modal = $.modal(template, {
                title: '<i class="fa fa-search"></i> Resultado de CEP',
                btnClose: null,
                footerContent: totalPages > 1 ? '<div class="paginator text-center"></div>' : null
            });
            self.modal.on('close', function () {
                self.modal = null;
            });
        }
        template.find('tr').click(function (event) {
            self.setInputs({
                cep: $(event.currentTarget).attr('data-cep'),
                uf: $(event.currentTarget).attr('data-uf'),
                idmunicipio: $(event.currentTarget).attr('data-idmunicipio'),
                nomemunicipio: $(event.currentTarget).attr('data-nomemunicipio'),
                idbairro: $(event.currentTarget).attr('data-idbairro'),
                nomebairro: $(event.currentTarget).attr('data-nomebairro'),
                idlogradouro: $(event.currentTarget).attr('data-idlogradouro'),
                nomelogradouro: $(event.currentTarget).attr('data-nomelogradouro')
            });
            self.modal.close();
        });
        if (newModal && totalPages > 1) {
            $(self.modal.element).find('.paginator').bootpag({
                total: totalPages,
                page: data.page ? parseInt(data.page) : 1,
                maxVisible: 5,
            }).off().on("page", function (event, pageNumber) {
                self.getCEP(null, pageNumber);
            });
        }
    }


    function Bairro(parent) {
        var self = this;

        self.parent = parent;

        self.element = function () {
            return self.parent.element.find('[data="bairro"]');
        }();

        self.render = function () {
            addSelect2(self.element, {
                placeholder: 'Bairro',
                returnData: function (params) {
                    return {
                        _class: 'enderecos',
                        _method: 'searchByBairro',
                        pageNumber: params.page || 1,
                        rowsPage: 10,
                        idMunicipio: self.parent.municipio.val(),
                        nomeBairro: params.term,
                    };
                }
            });
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

    function Logradouro(parent) {
        var self = this;

        self.parent = parent;

        self.element = function () {
            return self.parent.element.find('[data="logradouro"]');
        }();

        self.render = function () {
            addSelect2(self.element, {
                placeholder: 'Logradouro',
                returnData: function (params) {
                    return {
                        _class: 'enderecos',
                        _method: 'searchByLogradouro',
                        pageNumber: params.page || 1,
                        rowsPage: 10,
                        idMunicipio: self.parent.municipio.val(),
                        idBairro: self.parent.bairro.val(),
                        nomeLogradouro: params.term,
                    };
                }
            });
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

    function addSelect2(where, params) {
        return where.select2({
            placeholder: params.placeholder,
            allowClear: true,
            minimumInputLength: 3,
            ajax: {
                url: window.initialState.url_home + 'api/v2/action.php',
                delay: 500,
                dataType: 'json',
                type: 'post',
                data: params.returnData,
                processResults: function (result, params) {

                    // parse the results into the format expected by Select2
                    // since we are using custom formatting functions we do not need to
                    // alter the remote JSON data, except to indicate that infinite
                    // scrolling can be used
                    var data = $.map(result.items, function (obj) {
                        obj.id = obj.id || obj.id_bairro || obj.id_logradouro;
                        obj.text = obj.text || obj.nome_bairro || obj.nome_logradouro;
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

    function stopevent(event) {
        event = event ? event : window.event;
        if (event.preventDefault) {
            event.preventDefault();
        }
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
        return false;
    }

    function getTemplate(data, version) {
        version = version ? version : 'template';
        if (!window.templateEndereco) {
            window.templateEndereco = {};
        }
        if (!window.templateEndereco[version]) {
            $.ajax({
                url: window.initialState.url_home + 'assets/js/jquery.endereco/' + version + '.html',
                async: false,
                success: function (html) {
                    window.templateEndereco[version] = html;
                },
            });
        }
        var template = Handlebars.compile(window.templateEndereco[version]);
        template = $(template(data));
        return template;
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
        namecep: 'cep',
        nameuf: 'uf',
        namemunicipio: 'municipio',
        namebairro: 'bairro',
        namelogradouro: 'logradouro',
        namenumero: 'numero'
    };

    function init() {
        $.fn.select2.defaults.set('theme', 'bootstrap');

        $('app-endereco').each(function () {
            var data = $.extend({}, paramsDefault, getAttrs(this));
            if (data.autostart != 'false') {
                try {
                    return new Endereco(this, data);
                } catch (e) {
                }
            }
        });
    }

    $(document).ready(init);

    $.fn.endereco = function (params) {
        params = params ? params : {};
        var data = $.extend({}, paramsDefault, getAttrs(this[0]), params);
        try {
            return new Endereco(this, data);
        } catch (e) {
        }
    };

}, jQuery, Handlebars));