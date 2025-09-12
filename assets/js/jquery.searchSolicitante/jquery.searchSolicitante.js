'use strict';

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'toastr'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'), require('toastr'));
    } else {
        root.returnExports = factory(root.jQuery, root.toastr);
    }
})(this, function ($, toastr) {
        //Options
        //  buttonHeaderClose (bool) -  Habilita e Desabilita o botão de fechar no topo do modal;
        //  idCampo   ($.attr('id')) -  Recebe o id do campo onde será gravado o resultado do solicitante;
        //  callback  (function())   -  Recebe a function que será para continuar o fluxo da tela.
        $.fn.solicitante = function (options) {
            var $this = this;
            var idCampo = options.idCampo;
            var $inputSolicitante = $('#' + idCampo);
            var callback = ($.isFunction(options.callback) ? options.callback : function () {
            });

            var $modalDialog = $('<div class="modal-dialog modal-lg" role="document">');
            var $modalContent = $('<div class="modal-content">').appendTo($modalDialog);
            var $modalHeader = $('<div class="modal-header">').appendTo($modalContent);

            if (options.buttonHeaderClose == true) {
                var $modalHeaderClose = $('<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>').appendTo($modalHeader);
            }

            var $modalHeaderTitle = $('<h4 class="modal-title text-left">Informe o Solicitante</h4>').appendTo($modalHeader);

            var $modalBody = $('<div class="modal-body">').appendTo($modalContent);
            var $modalBodyAviso = $('<div class="alert alert-danger"><p>Digite a <strong>MATRÍCULA</strong> de quem esta solicitando a consulta ou deixe vazio.</p></div>').appendTo($modalBody);
            var $modalBodySearch = $('<div class="input-group col-xs-12">').appendTo($modalBody);
            var $modalBodySearchSpan = $('<span class="input-group-addon"><div class="fa fa-search"></div></span>').appendTo($modalBodySearch);
            var $modalBodySearchInput = $('<input type="text" class="form-control" name="txt_nome_solicitante" id="txt_nome_Solicitante" maxlength="7"/>').appendTo($modalBodySearch);
            var $modalBodyResultado = $('<div>').appendTo($modalBody);

            $modalBodyResultado.css('margin-top', '15px');
            $modalBodyResultado.hide();

            var $modalFooter = $('<div class="modal-footer text-right">').appendTo($modalContent);
            var $modalFooterClose = $('<button type="button" class="btn btn-danger">Cancelar</button>').appendTo($modalFooter);
            var $modalFooterLimpar = $('<button type="button" class="btn btn-default">Limpar</button>').appendTo($modalFooter);
            var $modalFooterBuscar = $('<button type="button" class="btn btn-primary">Próximo</button>').appendTo($modalFooter);

            $this.append($modalDialog);

            $modalBodySearchInput.on('keypress', function (e) {
                if (e.which == 13) {
                    searchSolicitante(e.target.value);
                }
            });

            $modalFooterClose.on('click', function (e) {
                $modalBodySearchInput.val('');
                $inputSolicitante.val('');
                $modalBodyResultado.hide();
                $this.modal('hide');
            });

            $modalFooterLimpar.on('click', function (e) {
                $modalBodySearchInput.val('');
                $inputSolicitante.val('');
                $modalBodyResultado.hide();
            });

            $modalFooterBuscar.on('click', function (e) {
                if ($modalBodySearchInput.val().toUpperCase() != $inputSolicitante.val().toUpperCase()) {
                    searchSolicitante($modalBodySearchInput.val());
                } else {
                    if ($modalBodySearchInput.val() == "") {
                        $inputSolicitante.val(window.initialState.user.matricula);
                    }

                    callback.call();
                    $this.modal('hide');
                }

            });

            function searchSolicitante(value) {

                startButtonLoading($modalFooterBuscar);

                if (value == '') {
                    toastr.error("Informe a matrícula do solicitante.");
                    stopButtonLoading($modalFooterBuscar);
                    return false;
                }

                $.when(
                    $.ajax({
                        url: '/api/v2/action.php',
                        dataType: "json",
                        cache: false,
                        data: {
                            _class: 'servidores',
                            _method: 'validaMatricula',
                            matricula: value
                        },
                        success: function (data) {
                            if (!data || !data.status || data.status != 'ok') {
                                toastr.error(
                                    data.message ||
                                    'Falha no processamento da requisição. ' +
                                    'Entre em contato com o suporte SIGO.'
                                );
                                return;
                            }

                            $inputSolicitante.val($modalBodySearchInput.val());
                            callback.call();
                            $this.modal('hide');
                        },
                        error: function (e) {
                            toastr.error("Erro ao consultar o banco de dados!");
                        }
                    })
                ).then(function () {
                    stopButtonLoading($modalFooterBuscar);
                });
                
            }

            function startButtonLoading(seletorElemento) {
                $(seletorElemento).html(
                    '<i style="margin-right: 8px" class="fa fa-refresh fa-spin"></i>' + $(seletorElemento).html()
                ).prop("disabled", true);
            }

            function stopButtonLoading(seletorElemento) {
                $(seletorElemento)
                    .prop("disabled", false)
                    .find('i').remove();
            }

            return this;
        };
    }
);
