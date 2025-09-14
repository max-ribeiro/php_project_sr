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
    handleDrowpdownSelection();
    handleInputMask();
});

function consultar(pagina) {
    var data = {
        _class: 'cidadaos',
        _method: 'consultar',
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
                                const totalPaginas = Math.ceil(data.total/15 - 1);
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

        var $btnEditar = $('<button type="button" />');
        $btnEditar.addClass('btn btn-warning btn-xs cidadao-edit-btn');
        $btnEditar.html('<i class="fa fa-edit fa-fw"></i>');
        $btnEditar.data($item);
        $btnEditar.click(function () {
            // TO DO
        });

        $tr.append($td.clone().html($item.nome));
        $tr.append($td.clone().html($item.cpf));
        $tr.append($td.clone().html($item.telefone));
        $tr.append($td.clone().html($item.nome_status));
        $tr.append($td.clone().append([$btnEditar]));

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