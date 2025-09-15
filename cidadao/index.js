$(document).ready(function () {
    $(document).ajaxStart(function () {
        $.blockUI({baseZ: 2000});
    }).ajaxStop(function () {
        $.unblockUI();
    });

    $('[data-js-return]').click(function (e) {
        $('#resultados').hide();
        $('#parametros_init').removeClass().addClass('col-lg-3 col-md-4 col-lg-push-9 col-md-push-8');
        $('#parametros').slideUp(function () {
            $('#parametros_init').switchClass('col-lg-3 col-md-4 col-lg-push-9 col-md-push-8',
                'col-lg-6 col-lg-offset-3 col-md-8 col-md-offset-2', 250, function () {
                    $('#form').slideDown();
                    $('[data-js-return]').addClass('hide');
                });
        });
    });

    $('#limpar').click(function (e) {
        e.preventDefault();
        $('form#form')[0].reset();
        $('form#form [type=hidden]').not('#tpBuscaResponsavel').val('');
        $('input[name="filtro"]').trigger('change');
    });

    $('#cadastrar-novo').click(function (e) {
        var $modal = $('#modal-novo-registro');
        $modal.modal({backdrop: 'static'});
    });

    $('#consultar').on('click', function (e) {
        e.preventDefault();
        consultar(1);
    });

    /** metodos cidadao */
    $('#confirmarSalvar').click(function (e) {
        toastr.clear();

        if (!validateInsertForm()) {
            return;
        }

        const token = localStorage.getItem("token");

        var data = {
            _class: 'cidadaos',
            _method: 'inserir'
        };

        $.extend(data, serializeObject($('form#cadastrar')));

        $.ajax({
            url: window.initialState.urlHome + 'api/v1/action.php',
            dataType: 'json',
            cache: false,
            data: data,
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + token
            },
            success: function (data) {
                if (data.status == 'ok') {
                    toastr.success('Registro inserido com sucesso.');
                    $('#modal-novo-registro').modal('hide');
                    $('#consultar').trigger('click');
                } else {
                    toastr.error(
                        data.message ||
                        'Falha no processamento da requisição. ' +
                        'Entre em contato com o suporte.'
                    );
                    $("#confirmarSalvar").prop('disabled', false);
                }
            }
        }).done(function (data) {
        }).error(function () {
            toastr.error(
                'Falha no processamento da requisição. ' +
                'Entre em contato com o suporte.'
            );
        });
    });

    $('#corfirmarAtualizar').click(function (e) {
        toastr.clear();

        const token = localStorage.getItem("token");

        var data = {
            _class: 'cidadaos',
            _method: 'editar'
        };

        $.extend(data, serializeObject($('form#editar')));

        $.ajax({
            url: window.initialState.urlHome + 'api/v1/action.php',
            dataType: 'json',
            cache: false,
            data: data,
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + token
            },
            success: function (data) {
                if (data.status == 'ok') {
                    toastr.success('Registro atualizado com sucesso.');
                    $('#modal-editar-registro').modal('hide');
                    $('#consultar').trigger('click');
                } else {
                    toastr.error(
                        data.message ||
                        'Falha no processamento da requisição. ' +
                        'Entre em contato com o suporte.'
                    );
                    $("#confirmarAtualizar").prop('disabled', false);
                }
            }
        }).done(function (data) {
        }).error(function () {
            toastr.error(
                'Falha no processamento da requisição. ' +
                'Entre em contato com o suporte.'
            );
        });
    });

    $('#btn-remove-cidadao').on('click', function(e) {
        const id_cidadao = $(this).data('id_cidadao');
        const token = localStorage.getItem('token');
        $('<div></div>').dialog({
            modal: true,
            title: 'Confirmar Exclusão',
            resizable: false,
            width: 400,
            dialogClass: 'no-close',
            appendTo: '#modal-editar-registro', // Garante que o diálogo seja anexado ao modal
            buttons: [
                {
                    text: 'Cancelar',
                    class: 'btn btn-default',
                    click: function() {
                        $(this).dialog('close');
                    }
                },
                {
                    text: 'Excluir',
                    class: 'btn btn-danger',
                    click: function() {
                        const dialog = $(this);
                        const data = {
                            _class: 'cidadaos',
                            _method: 'excluir',
                            id_cidadao
                        }
                        $.ajax({
                            url: window.initialState.urlHome + 'api/v1/action.php',
                            dataType: 'json',
                            cache: false,
                            data: data,
                            method: 'POST',
                            headers: {
                                Authorization: 'Bearer ' + token
                            },
                            success: function (data) {
                                if (data.status == 'ok') {
                                    toastr.success('Registro removido com sucesso.');
                                     // Recarregar a lista de cidadãos
                                    $('#consultar').trigger('click');
                                    dialog.dialog('close');
                                    $('#modal-editar-registro').modal('hide');
                                } else {
                                    toastr.error(
                                        data.message ||
                                        'Falha no processamento da requisição. ' +
                                        'Entre em contato com o suporte.'
                                    );
                                    $("#confirmarAtualizacao").prop('disabled', false);
                                }
                            }
                        }).done(function (data) {
                        }).error(function () {
                            toastr.error(
                                'Falha no processamento da requisição. ' +
                                'Entre em contato com o suporte.'
                            );
                        });
                    }
                }
            ],
            open: function() {
                $(this).html('<p>Tem certeza que deseja excluir este registro?</p>');
            },
            close: function() {
                $(this).remove(); // Remove o elemento do DOM após fechar
            }
        });
    });

    // actions enderecos
    $('#btn-new-address').click(function (e) {
        e.preventDefault();
        toastr.clear();

        const token = localStorage.getItem("token");

        var data = {
            _class: 'enderecos',
            _method: 'inserir'
        };

        $.extend(data, serializeObject($('form#novo-endereco')));

        $.ajax({
            url: window.initialState.urlHome + 'api/v1/action.php',
            dataType: 'json',
            cache: false,
            data: data,
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + token
            },
            success: function (data) {
                if (data.status == 'ok') {
                    toastr.success('Endereço cadastrado com sucesso.');
                    $('#modal-enderecos').modal('hide');
                    $('#consultar').trigger('click');
                } else {
                    toastr.error(
                        data.message ||
                        'Falha no processamento da requisição. ' +
                        'Entre em contato com o suporte.'
                    );
                    $("#btn-new-address").prop('disabled', false);
                }
            }
        }).done(function (data) {
        }).error(function () {
            toastr.error(
                'Falha no processamento da requisição. ' +
                'Entre em contato com o suporte.'
            );
        });
    });

    handleDrowpdownSelection();
    handleInputMask();
    handleSelect2();
});

function consultar(pagina) {
    const status = $('#cidadao-status-select').val();

    var data = {
        _class: 'cidadaos',
        _method: 'consultar',
        status,
        getEndereco: true,
        pageNumber: pagina
    };

    $.extend(data, serializeObject($('form#form')));

    insereParametrosBusca();
    const token = localStorage.getItem("token");

    $.ajax({
        url: window.initialState.urlHome + 'api/v1/action.php',
        dataType: 'json',
        cache: false,
        data: data,
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token
        },
        success: function (data) {
            if (data.items.length > 0) {
                $('[data-js-return]').removeClass('hide');
                $('#form').slideUp();
                $('#parametros_init').switchClass('col-lg-6 col-lg-offset-3 col-md-8 col-md-offset-2',
                    'col-lg-3 col-md-4 col-lg-push-9 col-md-push-8', 250, function () {
                        $('#parametros_init').removeClass().addClass('col-lg-3');
                        $('#resultados').slideDown();
                        $('#parametros').slideDown();
                        $('#resultados').slideDown(function () {
                            $('#resultados .carregando').slideUp();
                            processarResultados(data.items);

                            if (data.hasOwnProperty('total')  && data.total > 0) {
                                const totalPaginas = Math.ceil(data.total/15);
                                habilitarPaginacaoRegistros(totalPaginas, data.pagina);
                            }
                        })
                    });
            } else {
                if (!$('#form').is(':visible')) {
                    $('[data-js-return]').click();
                } else {
                    toastr.error('Nenhum registro encontrado.');
                }
            }
        }
    }).done(function (data) {
    }).error(function () {
        toastr.error(
            'Falha no processamento da requisição. ' +
            'Entre em contato com o suporte.'
        );
    });
}

function habilitarPaginacaoRegistros(totalPaginas, pagina) {
    $('#paginacaoDetalhes').hide();
    if (totalPaginas > 1) {
        $('#paginacaoDetalhes').show();
    }

    $('#paginacaoResultado').bootpag({
        total: totalPaginas,
        page: pagina,
        href: '#{{number}}',
        maxVisible: 5,
        leaps: true,
        firstLastUse: true,
        prev: '<',
        next: '>',
        first: '<<',
        last: '>>',
        wrapClass: 'pagination',
        activeClass: 'active',
        disabledClass: 'disabled',
        nextClass: 'next',
        prevClass: 'prev',
        lastClass: 'last',
        firstClass: 'first'
    }).off().on('page', function (event, pageNumber) {
        consultar(pageNumber);
    });
}

function processarResultados(data) {
    $('#resultados .itens').show();
    $('#resultados .itens tbody').html('');
    for (var i in data) {

        var $item = data[i];

        var $tr = $('<tr />');
        var $td = $('<td />');

        const buttonsDiv = $('<div style="display:flex; gap:8px" class="buttons-div"></div>');
        var $btnEditar = $('<button type="button" />');
        $btnEditar.addClass('btn btn-warning btn-xs cidadao-edit-btn');
        $btnEditar.html('<i class="fa fa-edit fa-fw"></i>');
        $btnEditar.data('item', $item); // armazena no botão

        $btnEditar.click(function () {
            var $modal = $('#modal-editar-registro');
            $modal.modal({backdrop: 'static'});

            // recupera os dados específicos desse botão
            var item = $(this).data('item');

            const {id_cidadao, cpf, nome, telefone, status} = item;
            $modal.find('#id_cidadao').val(id_cidadao);
            $modal.find('#nome').val(nome);
            $modal.find('#cpf').val(cpf);
            $modal.find('#telefone').val(telefone);
            $modal.find('#btn-remove-cidadao').data('id_cidadao', id_cidadao);
        });

        const $btnAddress = $('<button type="button" />');
        $btnAddress.addClass('btn btn-primary btn-xs address-edit-btn');
        $btnAddress.html('<i class="fa fa-home fa-fw"></i>');
        $btnAddress.data('item', $item); // armazena no botão

        $btnAddress.click(function () {
        const item = $(this).data('item');
        const $modal = $('#modal-enderecos');
        $modal.find('#enderecos-title').html(`Endereços de ${item.nome}`);
        $modal.find('#id_cidadao').val(item.id_cidadao);

        $modal.modal({backdrop: 'static'});
        getAddresses(item.id_cidadao)
            .done(data => {
                const $listaEnderecos = $('#lista-enderecos');
                // Remover qualquer conteúdo pré-existente exceto o legend
                $listaEnderecos.find('.col-md-4').remove();

                // Iterar sobre os itens e criar cards dinamicamente
                $.each(data.items, function(index, endereco) {
                    const $col = $('<div>').addClass('col-md-4');
                    const $panel = $('<div>').addClass('panel panel-default')
                        .toggleClass('panel-success', endereco.principal === "1");
                    const $panelBody = $('<div>').addClass('panel-body')
                        .css({
                            'display': 'flex',
                            'flex-direction': 'column',
                            'justify-content': 'center',
                            'height': '150px'
                        })
                        .append($('<p>').text(`${endereco.logradouro}, ${endereco.numero}`))
                        .append($('<p>').text(`${endereco.cidade} - ${endereco.uf}`))
                        .append(endereco.principal === "1" ? '<i class="fa fa-star"></i>' : '');
                    const $panelFooter = $('<div>').addClass('panel-footer');

                    $deleteAddressBtn = $('<button>').addClass('btn btn-danger btn-sm excluir-endereco')
                        .data('id_endereco', endereco.id_endereco)
                        .append('<i class="fa fa-trash"></i> Excluir');

                    $deleteAddressBtn.click(function() {
                        removeAddress(endereco.id_endereco);
                    });

                    $panelFooter.append($deleteAddressBtn);

                    $panel.append($panelBody).append($panelFooter);
                    $col.append($panel);
                    $listaEnderecos.append($col);
                });
            })
            .fail(err => {
                console.error(err);
            });
    });

        buttonsDiv.append([$btnEditar, $btnAddress]);

        $tr.append($td.clone().html($item.nome));
        $tr.append($td.clone().html($item.cpf));
        $tr.append($td.clone().html($item.telefone));
        $tr.append($td.clone().html($item.nome_status));
        $tr.append($td.clone().append([buttonsDiv]));

        $('#resultados .itens tbody').append($tr);
    }
}

function serializeObject($form) {
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function (n, i) {
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}

function insereParametrosBusca() {
    var $elParams = $('#parametros dl');
    $elParams.html('');

    $('#form .form-group').each(function () {
        var label = $(this).find('label').first().text();
        var text = '';
        var isCheckboxOrRadio = $(this).find('.checkbox, .radio').length > 0;
        var isPeriodo = $(this).find('[data-js-datetimepicker-period]').length > 0;
        var isBusca = $(this).find('[data-js-change--type]').length > 0;

        if (label == 'Filtrar por') {
            return true;
        } else if ($(this).find('input').first().attr('name') == 'bo1') {
            text = $(this).find('input').first().val();
            if ($(this).find('input').last().val() != '') {
                if (text != '') {
                    text += ' a ';
                }
                text += $(this).find('input').last().val();
            }
        } else if (isPeriodo) {
            text = $(this).find('input').first().val();
            if ($(this).find('input').last().val() != '') {
                text += ' a ' + $(this).find('input').last().val();
            }
        } else if (isCheckboxOrRadio) {
            var selecionados = [];
            $(this).find('.checkbox :checked, .radio :checked').each(function (index, element) {
                selecionados.push($(this).parent().text());
            });
            text = selecionados.join(', ');
        } else if (isBusca) {
            text = $(this).find('input[type="text"]').first().val();
        } else if ($(this).find(':input').first().is('select')) {
            text = $(this).find(':input option:selected').text();
        } else {
            text = $(this).find(':input').first().val();
            if (label == 'Unidade:') {
                text = $(this).find(':input').last().val();
            }
        }
        if (text == '') {
            return true;
        }
        var dt = $('<dt>' + label + '</dt>');
        var dd = $('<dd>' + text + '</dd>');
        $elParams.append(dt).append(dd);
    });
}

/**
 * trata da mudança de valor do select que filtra cidadão
 */
function handleDrowpdownSelection() {
    $(document).on('click', '.dropdown-menu li a', function (e) {
    e.preventDefault();

    var value = $(this).data('value');
    var text = $(this).text();

    $(this).closest('.input-group-btn')
            .find('button span:first')
            .text(text);

        $('#tpBusca').val(value);
    });
}
function handleInputMask() {
    $('#telefone').mask('(00) 00000-0000');
    $('#cpf').mask('000.000.000-00', {reverse: true});
}

function validateInsertForm() {
    const obrigatorios = ['nome', 'cpf', 'telefone'];
    let valid = true;
    let mensagens = [];

    obrigatorios.forEach(function(field) {
        var valor = $('form#cadastrar [name="' + field + '"]').val().trim();
        if (!valor) {
            valid = false;
            mensagens.push('O campo "' + field + '" é obrigatório.');
        }
    });
    
    if (!valid) {
        toastr.error(mensagens.join('<br>'));
        return false;
    }
    return true;
}

function getAddresses(id_cidadao) {
    var data = {
        _class: 'enderecos',
        _method: 'consultar',
        id_cidadao
    };

    const token = localStorage.getItem("token");

    return $.ajax({
        url: window.initialState.urlHome + 'api/v1/action.php',
        dataType: 'json',
        cache: false,
        data: data,
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token
        }
    });
}
function handleSelect2() {
    $('#cidadao-status-select').select2();
}

function removeAddress(id_endereco) {
    const data = {
        _class: 'enderecos',
        _method: 'excluir',
        id_endereco
    }
    $.ajax({
        url: window.initialState.urlHome + 'api/v1/action.php',
        dataType: 'json',
        cache: false,
        data: data,
        method: 'POST',
        headers: {
            Authorization: 'Bearer ' + token
        },
        success: function (data) {
            if (data.status == 'ok') {
                toastr.success('Registro removido com sucesso.');
                    // Recarregar a lista de cidadãos
                $('#consultar').trigger('click');
                $('#modal-enderecos').modal('hide');
            } else {
                toastr.error(
                    data.message ||
                    'Falha no processamento da requisição. ' +
                    'Entre em contato com o suporte.'
                );
            }
        }
    }).done(function (data) {
    }).error(function () {
        toastr.error(
            'Falha no processamento da requisição. ' +
            'Entre em contato com o suporte.'
        );
    });
}