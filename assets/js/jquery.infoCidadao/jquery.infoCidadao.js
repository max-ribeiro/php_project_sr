'use strict';

(function (factory, jQuery) {

    if (typeof define === 'function' && define.amd) {
        define('jquery.infoCidadao', ['jquery', 'bootstrap'], factory);
    } else if (typeof exports === 'object') {
        module.exports['jquery.infoCidadao'] = factory(require('jquery'), require('bootstrap'));
    } else {
        factory(jQuery);
    }

}(function ($) {
    var counter = 0;

    function _defaults(data) {
        if (!data) {
            return $('<span class="sg-auto--nao-informado">(Não informado)</span>');
        }
        if ($.isArray(data)) {
            data = data.join(', ');
        }

        return data;
    }

    var mapIcons = {
        'desconhecido': '/img/icoDesconhecido01.jpg',
        'obito': '/img/icocruz_transp.gif',
        'temDigital': '/img/newColor/digitalColhida.jpg',
        'temGiroflex': '/img/giroflexPequeno.gif',
        'temAlerta': '/img/icoAlerta.gif'
    };

    function render(settings, data, $panel, $heading, $body) {
        if (data.editar) {
            $('<button>')
                .addClass('btn btn-xs btn-default sg-cidadao--button__editar pull-right')
                .attr('type', 'button')
                .html('<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>')
                .click(function () {

                    // window.open(
                    // settings.urlHome + '/dadosPessoais.php?' +
                    // 'controle=1&newUser=0&daOnde=movimenta_preso&idCid=' +
                    //   (settings.id || settings.data.id)
                    // ,
                    // 'dP',
                    // 'width=780, height=520'
                    // );

                    // window.open(
                    //     settings.urlHome + '/cidadao/cidadao.php?' +
                    //     'idCidadao=' +
                    //     (settings.id || settings.data.id)
                    //     ,
                    //     'dP',
                    //     'width=780, height=520'
                    // );

                    //show de modal que abre tela para editar dados pessoais
                    $("#sg-cidadao--frame").contents().find("body").html('Carregando');
                    $("#sg-cidadao--modal h4").html('<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> EDITAR CIDADÃO');
                    $('#sg-cidadao--modal .modal-dialog,#sg-cidadao--modal .modal-lg').attr('style', 'width:95%;height:95%;');
                    // $("#sg-cidadao--frame").attr('src', settings.urlHome + '/dados_pessoais/dados_pessoais.php?fechaBotoes=ocultar&esconderCabecalho=true&id_cidadao=' + (settings.id || settings.data.id));
                    $("#sg-cidadao--frame").attr('src', settings.urlHome + '/cidadao/index.php?idCidadao=' + (settings.id || settings.data.id));
                    $("#sg-cidadao--modal").modal('show');
                    $('#sg-cidadao--modal .modal-content').attr('style', 'height: 95%;');
                    $('#sg-cidadao--frame').attr('height', '95%');
                })
                .appendTo($heading);
        }

        var $title = $('<div>').addClass('panel-title').appendTo($heading);
        $title.html(settings.title);

        $.each(mapIcons, function (index, icon) {
            if (data[index] && data[index] !== '0' && data[index] !== '') {
                $('<img>')
                    .attr('src', settings.urlHome + icon)
                    .appendTo($title)
            }
        });

        $('<button>')
            .addClass('btn btn-xs btn-info')
            .attr('type', 'button')
            .html('info')
            .click(function () {
                $("#sg-cidadao--modal h4").html('Detalhamento de Indivíduo');
                $('#sg-cidadao--modal .modal-dialog,#sg-cidadao--modal .modal-lg').attr('style', 'width:95%; height:95%;');
                $("#sg-cidadao--frame").contents().find("body").html('Carregando');
                $('#sg-cidadao--modal .modal-content').attr('style', 'height: 95%;');
                $("#sg-cidadao--frame").attr('src', settings.urlHome + '/consultaDeIndividuos/index.php?modal=1#vizualizar/' + (settings.id || settings.data.id));
                $("#sg-cidadao--modal").modal('show');
            })
            .appendTo($title);

        if (data.regime) {
            $('<h5>')
                .addClass('sg-cidadao--situacao text-center text-danger')
                .html(data.regime)
                .appendTo($body);
        }

        var $divImage = $('<div>').addClass('sg-cidadao--imagem').appendTo($body);
        if (data.sexo) {
            $('<span>').addClass('sg-cidadao--sexo').appendTo($divImage);
            var $sexo = $('<i>').addClass('fa fa-fw').attr('aria-hidden', 'true').appendTo($divImage);
            if (data.sexoTipoId == 1) {
                $sexo
                    .addClass('fa-mars')
                    .attr('title', 'Sexo masculino');
            } else {
                if (data.sexoTipoId == 2) {
                    $sexo
                        .addClass('fa-venus')
                        .attr('title', 'Sexo feminino');
                }
            }
        }

        if (!data.fotos || data.fotos === null || data.fotos === '' || data.fotos.length === 0) {
            $('<img>')
                .attr('src', settings.urlHome + settings.defaultFoto)
                .appendTo($divImage)
        } else {
            var carouselId = 'sg-cidadao--carousel__' + ++counter;

            var $divCarousel = $('<div>').addClass('carousel slide').attr('id', carouselId).appendTo($divImage);
            var $divCarouselInner = $('<div>').addClass('carousel-inner').attr('role', 'listbox').appendTo($divCarousel)
                .hover(function () {
                    $(this).css('cursor', 'pointer')
                })
                .click(function () {
                    //Inclui modal para visualizar fotos expandidas
                    $("#sg-cidadao--modal h4").html('<i class="fa fa-camera fa-fw"></i>GALERIA DE FOTOS');
                    $('#sg-cidadao--modal .modal-dialog,#sg-cidadao--modal .modal-lg').attr('style', 'width:900px;height:590px;');
                    $("#sg-cidadao--frame").attr('src', settings.urlHome + '/galeria/galeriaBootstrap.php?idCidadao=' + (settings.id || settings.data.id));
                    $("#sg-cidadao--modal").modal('show');
                    $('#sg-cidadao--modal .modal-content').attr('style', 'height: 660px;');
                    $('#sg-cidadao--frame').attr('height', '590px');
                });

            $.each(data.fotos, function (index, foto) {
                $('<div>')
                    .addClass('item' + ((index === 0) ? ' active' : ''))
                    .html($('<img>').attr('src', foto))
                    .appendTo($divCarouselInner);
                $('.carousel-inner').attr({width: "165px", height: "165px"});
                $('.carousel-inner .item img').css({width: "165px", height: "165px", "object-fit": "cover"});
            });

            $('<a>')
                .addClass('left carousel-control')
                .attr({
                    'href': '#' + carouselId,
                    'role': 'button',
                    'data-slide': 'prev'
                })
                .html([
                    $('<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>'),
                    $('<span class="sr-only">Anterior</span>')
                ])
                .appendTo($divCarousel);

            $('<a>')
                .addClass('right carousel-control')
                .attr({
                    'href': '#' + carouselId,
                    'role': 'button',
                    'data-slide': 'next'
                })
                .html([
                    $('<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>'),
                    $('<span class="sr-only">Próximo</span>')
                ])
                .appendTo($divCarousel);

            $divCarousel.carousel();
        }

        var $templateDL = $('<dl>').addClass('sg-cidadao--informacoes');
        var $templateDT = $('<dt>');
        var $templateDD = $('<dd>');

        window.nomeCidadaoAuditoria = data.nome;
        window.cpfCidadaoAuditoria  = data.cpf;

        $templateDL
            .clone()
            .append($templateDT.clone().html('Nome'))
            .append($templateDD.clone().html(_defaults(data.nome)))
            .append($templateDT.clone().html('Alcunhas'))
            .append($templateDD.clone().html(_defaults(data.alcunhas)))
            .append($templateDT.clone().html('Nome mãe'))
            .append($templateDD.clone().html(_defaults(data.nomeMae)))
            .append($templateDT.clone().html('Nome pai'))
            .append($templateDD.clone().html(_defaults(data.nomePai)))
            .appendTo($body);

        var cpfView = data.cpf;

        if (typeof data.cpfFormatado !== 'undefined' && data.cpfFormatado != '') {
            cpfView = data.cpfFormatado;
        }

        $('<div>')
            .addClass('row')
            .html([
                $templateDL
                    .clone()
                    .addClass('col-sm-4')
                    .append($templateDT.clone().html('RG'))
                    .append($templateDD.clone().html(_defaults(data.rg))),
                (data.pJuridico == "0" ?
                        $templateDL
                            .clone()
                            .addClass('col-sm-4')
                            .append($templateDT.clone().html('CPF'))
                            .append($templateDD.clone().html(_defaults(cpfView)))
                        :
                        $templateDL
                            .clone()
                            .addClass('col-sm-4')
                            .append($templateDT.clone().html('CNPJ'))
                            .append($templateDD.clone().html(_defaults(data.cnpj)))
                ),
                $templateDL
                    .clone()
                    .addClass('col-sm-4')
                    .append($templateDT.clone().html('RGI'))
                    .append($templateDD.clone().html(_defaults(data.rgi)))
            ])
            .appendTo($body);

        $('<div>')
            .addClass('row')
            .html([
                $templateDL
                    .clone()
                    .addClass('col-sm-4')
                    .append($templateDT.clone().html('Data de nascimento'))
                    .append($templateDD.clone().html(_defaults(data.dataDeNascimento))),
                $templateDL
                    .clone()
                    .addClass('col-sm-8')
                    .append($templateDT.clone().html('Naturalidade'))
                    .append($templateDD.clone().html(
                        _defaults((data.naturalDeNome) ? data.naturalDeNome + ' - ' + data.naturalDeUF : null)
                    ))
            ])
            .appendTo($body);

        $('<div>')
            .addClass('modal fade')
            .attr('id', 'sg-cidadao--modal')
            .append(
                $('<div>')
                    .addClass('modal-dialog modal-lg')
                    .append(
                        $('<div>')
                            .addClass('modal-content')
                            .append(
                                $('<div>')
                                    .addClass('modal-header')
                                    .append(
                                        $('<button>')
                                            .addClass('close')
                                            .attr('type', 'button')
                                            .attr('data-dismiss', 'modal')
                                            .html(
                                                $('<span>')
                                                    .attr('aria-hidden', 'true')
                                                    .html('&times;')
                                            )
                                    )
                                    .append(
                                        $('<h4>')
                                            .addClass('modal-title')
                                            .html('Dados do cidadão')
                                    )
                            )
                            .append(
                                $('<div>')
                                    .addClass('modal-body')
                                    .attr('style', 'height: 95%;padding:0;')
                                    .append(
                                        $('<iframe>')
                                            .attr('id', 'sg-cidadao--frame')
                                            .attr('name', 'sg-cidadao--frame')
                                            .attr('width', '100%')
                                            .attr('height', '95%')
                                            .attr('style', 'border-width:0px;')
                                    )
                            )
                    )
            )
            .appendTo($body.parents('body')[0]);
    }

    $.fn.infoCidadao = function (options) {
        var id;
        var matr_solicitante;

        if (typeof options === 'object') {
            id = options.id || options.cidadaoId || options.idCidadao;
            matr_solicitante = options.matr_solicitante || null;
        } else {
            id = options;
            options = {};
        }

        if (!id && typeof options.data !== 'object' && !options.data.id) {
            throw new Error('O parâmetro "id" é obrigatório');
        }

        var $this = this;

        var deferred = $.Deferred();
        deferred.promise($this);

        var settings = $.extend(true, {}, $.fn.infoCidadao.defaults, options);
        settings.id = id;

        var urlHome = settings.urlHome.replace(/\/$/, '');
        settings.urlHome = urlHome;

        var $panel = $('<div>').addClass('panel panel-default sg-panel--info').appendTo($this);
        var $heading = $('<div>').addClass('panel-heading').appendTo($panel);
        var $body = $('<div>').addClass('panel-body sg-cidadao').appendTo($panel);

        $this.addClass('sg-cidadao').html($panel);

        if (typeof settings.data === 'object' && settings.data.id) {
            render(settings, settings.data, $panel, $heading, $body);

            deferred.resolve(settings.data);

            return this;
        }

        if (settings.ajax.url.indexOf('http') !== 0) {
            settings.ajax.url = urlHome + settings.ajax.url;
        }

        var defaultSuccess = settings.ajax.success;
        settings.ajax.success = function (data, textStatus, jqXHR) {
            render(settings, data, $panel, $heading, $body);

            var ret = defaultSuccess.call(this, data, textStatus, jqXHR);

            if (ret && ret.then && typeof ret.then === 'function') {
                ret
                    .then(function () {
                        deferred.resolve.apply(null, arguments);
                    })
                    .fail(function () {
                        deferred.reject.apply(null, arguments);
                    });
            } else {
                deferred.resolve(data, textStatus, jqXHR);
            }
        };

        var defaultError = settings.ajax.error;
        settings.ajax.error = function (jqXHR, textStatus, errorThrown) {
            var ret = defaultError.call(this, jqXHR, textStatus, errorThrown);

            $this.html('');

            if (ret && ret.then && typeof ret.then === 'function') {
                ret
                    .then(function () {
                        deferred.resolve.apply(null, arguments);
                    })
                    .fail(function () {
                        deferred.reject.apply(null, arguments);
                    });
            } else {
                deferred.reject(jqXHR, textStatus, errorThrown);
            }
        };

        settings.ajax.data.id = id;
        settings.ajax.data.matr_solicitante = matr_solicitante;
        $.ajax(settings.ajax);

        return this;
    };

    $.fn.infoCidadao.defaults = {
        id: null,
        title: 'Dados do cidadão',
        urlHome: '',
        defaultFoto: '/img/fotoFrente02.jpg',
        ajax: {
            method: 'POST',
            url: '/api/v2/action.php',
            dataType: 'json',
            data: {
                _class: 'cidadaos',
                _method: 'searchById',
            },
            success: function () {
            },
            error: function () {
            }
        },
        data: {}
    };
}, window.jQuery));