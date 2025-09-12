var graficos = {
    graficoVitimasSexo: null,
    graficoVitimasFaixaEtaria: null,
    graficoVitimasAnual: null,
    graficoVitimasMensal: null,
    graficoVeiculosTipoCrime: null,
    graficoVeiculosAnual: null,
    graficoVeiculosMensal: null,
    graficoOcorrenciasTipoCrime: null,
    graficoOcorrenciasAnual: null,
    graficoOcorrenciasMensal: null,
    graficoCVLITipoCrime: null,
    graficoCVLIAnual: null,
    graficoCVLIMensal: null,
    graficoDrogasPeso: null,
    graficoDrogasAnual: null,
    graficoDrogasMensal: null,
    graficoArmasEspecie: null,
    graficoArmasAnual: null,
    graficoArmasMensal: null,
    graficoEnvolvidosSexo: null,
    graficoEnvolvidosFaixaEtaria: null,
    graficoEnvolvidosAnual: null,
    graficoEnvolvidosMensal: null
}
var defaultBlockUIMessage = '<h1>Por favor aguarde, carregando informações...</h1>';
$.blockUI.defaults.message = defaultBlockUIMessage;
var idGraficos = {
    vitimas: {
        sexo: '#graficoVitimas-sexo',
        faixaEtaria: '#graficoVitimas-faixaEtaria',
        anual: '#graficoVitimas-anual',
        mensal: '#graficoVitimas-mensal'
    },
    veiculos: {
        tipoCrime: '#graficoVeiculos-tipoCrime',
        anual: '#graficoVeiculos-anual',
        mensal: '#graficoVeiculos-mensal'
    },
    ocorrencias: {
        tipoCrime: '#graficoOcorrencias-tipoCrime',
        anual: '#graficoOcorrencias-anual',
        mensal: '#graficoOcorrencias-mensal'
    },
    CVLI: {
        tipoCrime: '#graficoCVLI-tipoCrime',
        anual: '#graficoCVLI-anual',
        mensal: '#graficoCVLI-mensal'
    },
    drogas: {
        peso: '#graficoDrogas-peso',
        anual: '#graficoDrogas-anual',
        mensal: '#graficoDrogas-mensal'
    },
    armas: {
        especie: '#graficoArmas-especie',
        anual: '#graficoArmas-anual',
        mensal: '#graficoArmas-mensal'
    },
    envolvidos: {
        sexo: '#graficoEnvolvidos-sexo',
        faixaEtaria: '#graficoEnvolvidos-faixaEtaria',
        anual: '#graficoEnvolvidos-anual',
        mensal: '#graficoEnvolvidos-mensal'
    },
};

$(document).ready(function () {

    $(document).ajaxStart(function () {
        $.blockUI({baseZ: 2000});
    }).ajaxStop(function () {
        $.unblockUI();
    });

    $('form#Vitimas select, form#Veiculos select, form#Ocorrencias select, form#CVLI select, form#Drogas select, form#Armas select, form#Envolvidos select')
        .not('[name="tipo_crime"]').multiselect({
        placeholder: 'Todos',
        search: true
    }).on('change', function (e) {
        e.preventDefault();
        consultar($(this));
    });
    $('[name="tipo_crime"]').on('change', function (e) {
        e.preventDefault();
        consultar($(this));
    });

    $('.limparSelecao').click(function () {
        var totalSelecionados = $(this).closest('.panel').find('option[selected]').length;
        if (totalSelecionados) {
            $(this).closest('.panel').find('option[selected]').prop('selected', false);
            $(this).closest('.panel').find('li:not(.optgroup).selected input[type="checkbox"]').prop('checked', false);
            $(this).closest('.panel').find('li:not(.optgroup).selected').removeClass('selected');
            $(this).closest('.panel').find('.ms-options-wrap').find('> button:first-child').text('Todos');
            $(this).closest('.panel').find('select').trigger('change');
        }
    });

    // Verifica se o gráfico da aba a ser ativada já foi ativado
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href");
        var $form = $(target).find('form');
        var formId = $form.attr('id');
        var emptyCanvas = $(target).find('canvas:not(.chartjs-render-monitor)').length;

        switch (formId) {
            case 'Vitimas':
                if (emptyCanvas == 0) {
                    return;
                }
                getDataApi($form, gerarGraficosVitimas);
                break;
            case 'Veiculos':
                if (emptyCanvas == 0) {
                    return;
                }
                getDataApi($form, gerarGraficosVeiculos);
                break;
            case 'Ocorrencias':
                if (emptyCanvas == 0) {
                    return;
                }
                getDataApi($form, gerarGraficosOcorrencias);
                break;
            case 'CVLI':
                if (emptyCanvas == 0) {
                    return;
                }
                getDataApi($form, gerarGraficosCVLI);
                break;
            case 'Drogas':
                if (emptyCanvas == 0) {
                    return;
                }
                getDataApi($form, gerarGraficosDrogas);
                break;
            case 'Armas':
                if (emptyCanvas == 0) {
                    return;
                }
                getDataApi($form, gerarGraficosArmas);
                break;
            case 'Envolvidos':
                if (emptyCanvas == 0) {
                    return;
                }
                getDataApi($form, gerarGraficosEnvolvidos);
                break;
        }
    });

    // Prepara os filtros de regiões e municípios
    var data = {
        _class: 'estatisticas',
        _method: 'searchRegioesEMunicipios'
    };

    $.ajax({
        url: window.initialState.urlHome + 'api/v1/action.php',
        dataType: 'json',
        cache: false,
        data: data,
        method: 'POST',
        success: function (data) {
            /**
             * Atualiza os registros de região e município
             */
            if (data.regioes) {
                var $campoRegioes = $('[name="regiao"]');
                $campoRegioes.empty();
                $(data.regioes).each(function (i, e) {
                    var $option = $('<option>').text(e.nm_regiao_municipio).val(e.id_regiao_municipio);
                    $campoRegioes.append($option);
                });
                $campoRegioes.multiselect('reload');
            }
            if (data.municipios) {
                var $campoMunicipios = $('[name="municipio"]');
                $campoMunicipios.empty();
                $(data.municipios).each(function (i, e) {
                    var $option = $('<option>').text(e.nm_municipio).val(e.id_municipio);
                    $campoMunicipios.append($option);
                });
                $campoMunicipios.multiselect('reload');
            }

            getDataApi($('form#CVLI'), gerarGraficosCVLI);
        }
    }).error(function () {
        toastr.error(
            'Falha no processamento da requisição. ' +
            'Entre em contato com o suporte.'
        );
    });

    $(document).on("click", ".legenda li", function (e) {
        e.preventDefault();
        var data = $(this).data();

        var index = data.index;
        var ci = graficos[data.chart];
        var meta = ci.getDatasetMeta(0);

        var exibir = !meta.data[index].hidden;
        meta.data[index].hidden = exibir;

        if (!exibir) {
            $(this).find('span').not('.box').removeClass('riscado');
        } else {
            $(this).find('span').not('.box').addClass('riscado');
        }

        ci.update();
    });

    $(document).on('click', '.exportar', function (e) {
        e.preventDefault();

        exportarTotalizadores($(this));
    });

    $(document).on('click', '#exportarDados', function (e) {
        e.preventDefault();

        exportarDados();
    });
});

function consultar(campo) {
    var $form = campo.closest('form');
    var formId = $form.attr('id');

    var executarConsulta = function (formId) {
        if (formId == 'Vitimas') {
            getDataApi($form, gerarGraficosVitimas);
        } else if (formId == 'Veiculos') {
            getDataApi($form, gerarGraficosVeiculos);
        } else if (formId == 'Ocorrencias') {
            getDataApi($form, gerarGraficosOcorrencias);
        } else if (formId == 'CVLI') {
            getDataApi($form, gerarGraficosCVLI);
        } else if (formId == 'Drogas') {
            getDataApi($form, gerarGraficosDrogas);
        } else if (formId == 'Armas') {
            getDataApi($form, gerarGraficosArmas);
        } else if (formId == 'Envolvidos') {
            getDataApi($form, gerarGraficosEnvolvidos);
        }
    };

    // Região e município deve consultar os registros antes de consultar os dados
    if ($.inArray(campo.attr('name'), ['regiao','municipio']) >= 0) {
        var data = {
            _class: 'estatisticas',
            _method: 'searchRegioesEMunicipios'
        };
        var tipoBusca = campo.attr('name');

        if (tipoBusca == 'regiao') {
            data['regiao'] = campo.val();
        } else if (tipoBusca == 'municipio') {
            data['municipio'] = campo.val();
        }

        $.ajax({
            url: window.initialState.urlHome + 'api/v1/action.php',
            dataType: 'json',
            cache: false,
            data: data,
            method: 'POST',
            success: function (data) {
                /**
                 * Atualiza os registros de região e município
                 */
                if (data.regioes) {
                    var $campoRegioes = $form.find('[name="regiao"]');
                    var regioesSelecionadas = getAllSelected($campoRegioes);
                    $campoRegioes.empty();
                    $(data.regioes).each(function (i, e) {
                        var $option = $('<option>').text(e.nm_regiao_municipio).val(e.id_regiao_municipio);
                        if ($.inArray(e.id_regiao_municipio, regioesSelecionadas) > -1) {
                            $option.attr('selected', true);
                        }
                        $campoRegioes.append($option);
                    });
                    $campoRegioes.multiselect('reload');
                }
                if (data.municipios) {
                    var $campoMunicipios = $form.find('[name="municipio"]');
                    var municipiosSelecionados = getAllSelected($campoMunicipios);
                    $campoMunicipios.empty();
                    $(data.municipios).each(function (i, e) {
                        var $option = $('<option>').text(e.nm_municipio).val(e.id_municipio);
                        if ($.inArray(e.id_municipio, municipiosSelecionados) > -1) {
                            $option.attr('selected', true);
                        }
                        $campoMunicipios.append($option);
                    });
                    $campoMunicipios.multiselect('reload');
                }

                executarConsulta(formId);
            }
        }).error(function () {
            toastr.error(
                'Falha no processamento da requisição. ' +
                'Entre em contato com o suporte.'
            );
        });
    } else {
        executarConsulta(formId);
    }
}

function exportarTotalizadores(campo) {
    var formId = campo.data('form');
    var $form = $('#' + formId);
    var $titulo = campo.closest('.panel-heading').clone();
    $titulo.find('div').remove();
    $titulo = $titulo.text().trim();

    var data = {
        titulo: $titulo,
        tipoDado: campo.attr('id').split('-').pop()
    };

    getDataApiExportarTotalizadores($form, data, function (data) {
        window.open(window.initialState.urlHome + 'exportar.php?arquivo=' + data.filename);
    });
}

function exportarDados() {
    var $form = $('form:visible');
    var $titulo = $('.tab-pane.active select[name="tipo_crime"] :selected').text().trim();

    var data = {
        endpoint: $form.attr('id').toLowerCase(),
        titulo: $titulo
    };

    getDataApiExportarDados($form, data, function (data) {
        window.open(window.initialState.urlHome + 'exportar.php?arquivo=' + data.filename);
    });

    $.blockUI.defaults.message = defaultBlockUIMessage;
}

function getDataApi($form, callback) {
    var data = {
        _class: 'estatisticas',
        _method: 'searchEstatisticas' + capitalizeFirstLetter($form.attr('id'))
    };

    $form.find('select').each(function () {
        if ($(this).find(':selected').length == 0) {
            var index = $(this).attr('name');
            data[index] = [];
            $(this).find('option').each(function () {
                data[index].push($(this).val());
            });
        } else {
            data[$(this).attr('name')] = $(this).val();
        }
    });

    switch ($form.attr('id')) {
        case 'Vitimas':
            resetarGraficosVitimas();
            break;
        case 'Veiculos':
            resetarGraficosVeiculos();
            break;
        case 'Ocorrencias':
            resetarGraficosOcorrencias();
            break;
        case 'Ocorrencias':
            resetarGraficosCVLI();
            break;
        case 'Drogas':
            resetarGraficosDrogas();
            break;
        case 'Armas':
            resetarGraficosArmas();
            break;
        case 'Envolvidos':
            resetarGraficosEnvolvidos();
            break;
    }

    $.ajax({
        url: window.initialState.urlHome + 'api/v1/action.php',
        dataType: 'json',
        cache: false,
        data: data,
        method: 'POST',
        success: function (data) {
            if (data.total > 0) {
                callback(data.items);
            } else {
                toastr.error('Dados não encontrados com os filtros informados.');
                $form.closest('.tab-pane').find('canvas').each(function () {
                    $(this).css('width', '100%');
                    $(this).css('height', '350px');
                    var canvas = $(this)[0];
                    canvas.width = $(this).width();
                    canvas.height = 350;

                    var x = canvas.width / 2;
                    var ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#000';
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Dados não encontrados', x, 165);
                    ctx.fillText('com os filtros informados', x, 185);
                });
            }
        }
    }).error(function () {
        toastr.error(
            'Falha no processamento da requisição. ' +
            'Entre em contato com o suporte.'
        );
    });
}

function getDataApiExportarTotalizadores($form, data, callback) {
    data = $.extend({
        _class: 'estatisticas',
        _method: 'searchEstatisticas' + capitalizeFirstLetter($form.attr('id')),
        exportar: true
    }, data);

    var parametros = {};

    $form.find('select').each(function () {
        if ($(this).find(':selected').length == 0) {
            var index = $(this).attr('name');
            data[index] = [];
            $(this).find('option').each(function () {
                data[index].push($(this).val());
            });
        } else {
            data[$(this).attr('name')] = $(this).val();
        }

        if ($(this).closest('.panel').is(':visible')) {
            var nome = $(this).closest('.panel').find('.panel-heading').text().trim()
            parametros[nome] = [];
            if (
                $(this).find('option:selected').length == 0
                || $(this).find('option:selected').length == $(this).find('option').length
            ) {
                parametros[nome].push('Todos');
            } else {
                $(this).find('option:selected').each(function () {
                    parametros[nome].push($(this).text().trim());
                });
            }
        }
    });

    data.parametros = parametros;

    $.ajax({
        url: window.initialState.urlHome + 'api/v1/action.php',
        dataType: 'json',
        cache: false,
        data: data,
        method: 'POST',
        success: function (data) {
            if (data.total > 0) {
                callback(data);
            } else {
                toastr.error('Dados não encontrados com os filtros informados.');
            }
        }
    }).error(function () {
        toastr.error(
            'Falha no processamento da requisição. ' +
            'Entre em contato com o suporte.'
        );
    });
}

function getDataApiExportarDados($form, data, callback) {
    data = $.extend({
        _class: 'estatisticas',
        _method: 'exportarDados'
    }, data);

    $form.find('select').each(function () {
        if ($(this).find(':selected').length == 0) {
            var index = $(this).attr('name');
            data[index] = [];
            $(this).find('option').each(function () {
                data[index].push($(this).val());
            });
        } else {
            data[$(this).attr('name')] = $(this).val();
        }
    });

    if (data.ano) {
        data.ano = data.ano.join(',');
    }
    if (data.regiao) {
        data.regiao = data.regiao.join(',');
    }
    if (data.municipio) {
        data.municipio = data.municipio.join(',');
    }

    var $progressBar = $('<div>');
    $progressBar.append(
        $('<div>').addClass('progress').css('margin', '20px').append(
            $('<div>').addClass('progress-bar progress-bar-success progress-bar-striped active').attr({
                role: 'progressbar',
                'aria-valuenow': 1,
                'aria-valuemin': 1,
                'aria-valuemax': 100
            }).css('width', '1%')
        )
    );
    if (data.progresso) {
        $progressBar.find('.progress-bar-success').attr('aria-valuenow', data.progresso).css('width', data.progresso + '%')
    }

    $.blockUI.defaults.message = '<h1>Por favor aguarde, carregando informações...</h1>';
    $.blockUI.defaults.message += $progressBar.html();

    if (data.progresso) {
        $('.progress-bar-success').attr('aria-valuenow', data.progresso).css('width', data.progresso + '%')
    }

    $.ajax({
        url: window.initialState.urlHome + 'api/v1/action.php',
        dataType: 'json',
        cache: false,
        data: data,
        method: 'POST',
        success: function (response) {
            if (!response || !response.status || response.status != 'ok') {
                toastr.error(response.message || 'Falha ao processar sua requisição.');
                $.blockUI.defaults.message = defaultBlockUIMessage;
            } else {
                if (response.continuar) {
                    data.pagina = response.pagina + 1;
                    data.filename = response.filename;
                    data.progresso = (100 * response.pagina) / response.totalPaginas;
                    getDataApiExportarDados($form, data, callback);
                } else {
                    $('.progress-bar-success').attr('aria-valuenow', 100).css('width', 100 + '%')
                    callback(response);
                    $.blockUI.defaults.message = defaultBlockUIMessage;
                }
            }
        }
    }).error(function () {
        toastr.error(
            'Falha no processamento da requisição. ' +
            'Entre em contato com o suporte.'
        );
        $.blockUI.defaults.message = defaultBlockUIMessage;
    });
}

var resetarGraficosVitimas = function () {
    // Sexo
    if (graficos.graficoVitimasSexo != null) {
        graficos.graficoVitimasSexo.destroy();
    }
    // Faixa etária
    if (graficos.graficoVitimasFaixaEtaria != null) {
        graficos.graficoVitimasFaixaEtaria.destroy();
    }
    // Anual
    if (graficos.graficoVitimasAnual != null) {
        graficos.graficoVitimasAnual.destroy();
    }
    // Mês a Mês
    if (graficos.graficoVitimasMensal != null) {
        graficos.graficoVitimasMensal.destroy();
    }
}

var resetarGraficosVeiculos = function () {
    // Tipo de Crime
    if (graficos.graficoVeiculosTipoCrime != null) {
        graficos.graficoVeiculosTipoCrime.destroy();
    }
    // Anual
    if (graficos.graficoVeiculosAnual != null) {
        graficos.graficoVeiculosAnual.destroy();
    }
    // Mês a Mês
    if (graficos.graficoVeiculosMensal != null) {
        graficos.graficoVeiculosMensal.destroy();
    }
}

var resetarGraficosOcorrencias = function () {
    // Tipo de Crime
    if (graficos.graficoOcorrenciasTipoCrime != null) {
        graficos.graficoOcorrenciasTipoCrime.destroy();
    }
    // Anual
    if (graficos.graficoOcorrenciasAnual != null) {
        graficos.graficoOcorrenciasAnual.destroy();
    }
    // Mês a Mês
    if (graficos.graficoOcorrenciasMensal != null) {
        graficos.graficoOcorrenciasMensal.destroy();
    }
}

var resetarGraficosCVLI = function () {
    // Tipo de Crime
    if (graficos.graficoCVLITipoCrime != null) {
        graficos.graficoCVLITipoCrime.destroy();
    }
    // Anual
    if (graficos.graficoCVLIAnual != null) {
        graficos.graficoCVLIAnual.destroy();
    }
    // Mês a Mês
    if (graficos.graficoCVLIMensal != null) {
        graficos.graficoCVLIMensal.destroy();
    }
}

var resetarGraficosDrogas = function () {
    // Peso
    if (graficos.graficoDrogasPeso != null) {
        graficos.graficoDrogasPeso.destroy();
    }
    // Anual
    if (graficos.graficoDrogasAnual != null) {
        graficos.graficoDrogasAnual.destroy();
    }
    // Mês a Mês
    if (graficos.graficoDrogasMensal != null) {
        graficos.graficoDrogasMensal.destroy();
    }
}

var resetarGraficosArmas = function () {
    // Tipo de Crime
    if (graficos.graficoArmasEspecie != null) {
        graficos.graficoArmasEspecie.destroy();
    }
    // Anual
    if (graficos.graficoArmasAnual != null) {
        graficos.graficoArmasAnual.destroy();
    }
    // Mês a Mês
    if (graficos.graficoArmasMensal != null) {
        graficos.graficoArmasMensal.destroy();
    }
}

var resetarGraficosEnvolvidos = function () {
    // Sexo
    if (graficos.graficoEnvolvidosSexo != null) {
        graficos.graficoEnvolvidosSexo.destroy();
    }
    // Faixa etária
    if (graficos.graficoEnvolvidosFaixaEtaria != null) {
        graficos.graficoEnvolvidosFaixaEtaria.destroy();
    }
    // Anual
    if (graficos.graficoEnvolvidosAnual != null) {
        graficos.graficoEnvolvidosAnual.destroy();
    }
    // Mês a Mês
    if (graficos.graficoEnvolvidosMensal != null) {
        graficos.graficoEnvolvidosMensal.destroy();
    }
}

var gerarGraficosVitimas = function (dados) {
    // Reseta os gráficos
    resetarGraficosVitimas();

    // Sexo
    var dadosSexo = dados.sexo;
    graficos.graficoVitimasSexo = new Chart($(idGraficos.vitimas.sexo), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: dadosSexo['dados'],
                backgroundColor: dadosSexo['colors'],
                borderColor: dadosSexo['colors']
            }],
            labels: dadosSexo['defaultLabels']
        },
        options: {
            maintainAspectRatio: false
        }
    });

    // Faixa etária
    var dadosFaixaEtaria = dados.faixaEtaria;
    graficos.graficoVitimasFaixaEtaria = new Chart($(idGraficos.vitimas.faixaEtaria), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: dadosFaixaEtaria['dados'],
                backgroundColor: dadosFaixaEtaria['colors'],
                borderColor: dadosFaixaEtaria['colors']
            }],
            labels: dadosFaixaEtaria['labels']
        },
        options: {
            maintainAspectRatio: false
        }
    });

    // Anual
    var dadosAnual = dados.anual;
    var minValue = Math.min.apply(Math, dadosAnual['dados']) - 10;
    var maxValue = Math.max.apply(Math, dadosAnual['dados']) + 10;
    if (minValue < 0) {
        minValue = 0;
    }
    graficos.graficoVitimasAnual = new Chart($(idGraficos.vitimas.anual), {
        type: 'bar',
        data: {
            datasets: [{
                data: dadosAnual['dados'],
                backgroundColor: dadosAnual['colors'],
                borderColor: dadosAnual['colors']
            }],
            labels: dadosAnual['labels']
        },
        options: {
            legend: {
                display: false
            },
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: minValue,
                        suggestedMax: maxValue
                    }
                }]
            },
            showDataPoints: true,
        }
    });

    // Mês a Mês
    var dadosMensal = dados.mensal;
    graficos.graficoVitimasMensal = new Chart($(idGraficos.vitimas.mensal), {
        type: 'line',
        data: {
            labels: dadosMensal.labels,
            datasets: dadosMensal.datasets
        },
        options: {
            maintainAspectRatio: false,
            showDataPoints: true,
        }
    });

    // gera o quantitativo por tipo de crime
    gerarQuantitativoOcorrencias(dados, 'vitimas');
}

var gerarGraficosVeiculos = function (dados) {
    // Reseta os gráficos
    resetarGraficosVeiculos();

    // Tipo de Crime
    var dadosCrime = dados.tipoCrime;
    graficos.graficoVeiculosTipoCrime = new Chart($(idGraficos.veiculos.tipoCrime), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: dadosCrime['dados'],
                backgroundColor: dadosCrime['colors'],
                borderColor: dadosCrime['colors']
            }],
            labels: dadosCrime['defaultLabels']
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: 'right',
                align: 'start'
            }
        }
    });

    // Anual
    var dadosAnual = dados.anual;
    var minValue = Math.min.apply(Math, dadosAnual['dados']) - 10;
    var maxValue = Math.max.apply(Math, dadosAnual['dados']) + 10;
    if (minValue < 0) {
        minValue = 0;
    }
    graficos.graficoVeiculosAnual = new Chart($(idGraficos.veiculos.anual), {
        type: 'bar',
        data: {
            datasets: [{
                data: dadosAnual['dados'],
                backgroundColor: dadosAnual['colors'],
                borderColor: dadosAnual['colors']
            }],
            labels: dadosAnual['labels']
        },
        options: {
            legend: {
                display: false
            },
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: minValue,
                        suggestedMax: maxValue
                    }
                }]
            },
            showDataPoints: true,
        }
    });

    // Mês a Mês
    var dadosMensal = dados.mensal;
    graficos.graficoVeiculosMensal = new Chart($(idGraficos.veiculos.mensal), {
        type: 'line',
        data: {
            labels: dadosMensal.labels,
            datasets: dadosMensal.datasets
        },
        options: {
            maintainAspectRatio: false,
            showDataPoints: true,
        }
    });

    // gera o quantitativo por tipo de crime
    gerarQuantitativoOcorrencias(dados, 'veiculos');
}

var gerarGraficosOcorrencias = function (dados) {
    // Reseta os gráficos
    resetarGraficosOcorrencias();

    // Tipo de Crime
    var dadosTipoCrime = dados.tipoCrime;
    graficos.graficoOcorrenciasTipoCrime = new Chart($(idGraficos.ocorrencias.tipoCrime), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: dadosTipoCrime['dados'],
                backgroundColor: dadosTipoCrime['colors'],
                borderColor: dadosTipoCrime['colors']
            }],
            labels: dadosTipoCrime['defaultLabels']
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: 'right',
                align: 'start'
            }
        }
    });

    // Anual
    var dadosAnual = dados.anual;
    var minValue = Math.min.apply(Math, dadosAnual['dados']) - 10;
    var maxValue = Math.max.apply(Math, dadosAnual['dados']) + 10;
    if (minValue < 0) {
        minValue = 0;
    }
    graficos.graficoOcorrenciasAnual = new Chart($(idGraficos.ocorrencias.anual), {
        type: 'bar',
        data: {
            datasets: [{
                data: dadosAnual['dados'],
                backgroundColor: dadosAnual['colors'],
                borderColor: dadosAnual['colors']
            }],
            labels: dadosAnual['labels']
        },
        options: {
            legend: {
                display: false
            },
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: minValue,
                        suggestedMax: maxValue
                    }
                }]
            },
            showDataPoints: true,
        }
    });

    // Mês a Mês
    var dadosMensal = dados.mensal;
    graficos.graficoOcorrenciasMensal = new Chart($(idGraficos.ocorrencias.mensal), {
        type: 'line',
        data: {
            labels: dadosMensal.labels,
            datasets: dadosMensal.datasets
        },
        options: {
            maintainAspectRatio: false,
            showDataPoints: true,
        }
    });

    // gera o quantitativo por tipo de crime
    gerarQuantitativoOcorrencias(dados, 'ocorrencias');
}

var gerarGraficosCVLI = function (dados) {
    // Reseta os gráficos
    resetarGraficosCVLI();

    // Tipo de Crime
    var dadosTipoCrime = dados.tipoCrime;
    graficos.graficoCVLITipoCrime = new Chart($(idGraficos.CVLI.tipoCrime), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: dadosTipoCrime['dados'],
                backgroundColor: dadosTipoCrime['colors'],
                borderColor: dadosTipoCrime['colors']
            }],
            labels: dadosTipoCrime['defaultLabels']
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            legendCallback: function(chart) {
                var text = [];
                text.push('<ul>');
                for (var i=0; i<chart.data.datasets[0].data.length; i++) {
                    text.push('<li data-index="' + i + '" data-chart="graficoCVLITipoCrime">');
                    text.push('<span class="box" style="background-color:' + chart.data.datasets[0].backgroundColor[i] + '">&nbsp;</span>');
                    if (chart.data.labels[i]) {
                        text.push('<span>' + chart.data.labels[i] + '</span>');
                    }
                    text.push('</li>');
                }
                text.push('</ul>');
                return text.join("");
            }
        }
    });
    $('#legendaCVLI-tipoCrime').html(graficos.graficoCVLITipoCrime.generateLegend());

    // Anual
    var dadosAnual = dados.anual;
    var minValue = Math.min.apply(Math, dadosAnual['dados']) - 10;
    var maxValue = Math.max.apply(Math, dadosAnual['dados']) + 10;
    if (minValue < 0) {
        minValue = 0;
    }
    graficos.graficoCVLIAnual = new Chart($(idGraficos.CVLI.anual), {
        type: 'bar',
        data: {
            datasets: [{
                data: dadosAnual['dados'],
                backgroundColor: dadosAnual['colors'],
                borderColor: dadosAnual['colors']
            }],
            labels: dadosAnual['labels']
        },
        options: {
            legend: {
                display: false
            },
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: minValue,
                        suggestedMax: maxValue
                    }
                }]
            },
            showDataPoints: true,
        }
    });

    // Mês a Mês
    var dadosMensal = dados.mensal;
    graficos.graficoCVLIMensal = new Chart($(idGraficos.CVLI.mensal), {
        type: 'line',
        data: {
            labels: dadosMensal.labels,
            datasets: dadosMensal.datasets
        },
        options: {
            maintainAspectRatio: false,
            showDataPoints: true,
        }
    });

    // gera o quantitativo por tipo de crime
    gerarQuantitativoOcorrencias(dados, 'CVLI');
}

var gerarGraficosDrogas = function (dados) {
    // Reseta os gráficos
    resetarGraficosDrogas();

    // Peso
    var dadosPeso = dados.peso;
    graficos.graficoDrogasPeso = new Chart($(idGraficos.drogas.peso), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: dadosPeso['dados'],
                backgroundColor: dadosPeso['colors'],
                borderColor: dadosPeso['colors']
            }],
            labels: dadosPeso['defaultLabels']
        },
        options: {
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.labels[tooltipItem.index] || '';

                        if (label) {
                            label += ': ';
                        }

                        var valorFormatado = (data.datasets[0].data[tooltipItem.index]).toLocaleString(
                            undefined,
                            { minimumFractionDigits: 2 }
                        );

                        label += valorFormatado;

                        return label;
                    }
                }
            },
            legend: {
                position: 'right',
                align: 'start'
            }
        }
    });

    // Anual
    var dadosAnual = dados.anual;
    var minValue = Math.min.apply(Math, dadosAnual['dados']) - 10;
    var maxValue = Math.max.apply(Math, dadosAnual['dados']) + 10;
    if (minValue < 0) {
        minValue = 0;
    }
    graficos.graficoDrogasAnual = new Chart($(idGraficos.drogas.anual), {
        type: 'bar',
        data: {
            datasets: [{
                data: dadosAnual['dados'],
                backgroundColor: dadosAnual['colors'],
                borderColor: dadosAnual['colors']
            }],
            labels: dadosAnual['labels']
        },
        options: {
            legend: {
                display: false
            },
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: minValue,
                        suggestedMax: maxValue
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.labels[tooltipItem.index] || '';

                        if (label) {
                            label += ': ';
                        }

                        var valorFormatado = (data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]).toLocaleString(
                            undefined,
                            { minimumFractionDigits: 2 }
                        );

                        label += valorFormatado;

                        return label;
                    }
                }
            },
            showDataPoints: true,
        }
    });

    // Mês a Mês
    var dadosMensal = dados.mensal;
    graficos.graficoDrogasMensal = new Chart($(idGraficos.drogas.mensal), {
        type: 'line',
        data: {
            labels: dadosMensal.labels,
            datasets: dadosMensal.datasets
        },
        options: {
            maintainAspectRatio: false,
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.labels[tooltipItem.index] || '';

                        if (label) {
                            label += ': ';
                        }

                        var valorFormatado = (data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]).toLocaleString(
                            undefined,
                            { minimumFractionDigits: 2 }
                        );

                        label += valorFormatado;

                        return label;
                    }
                }
            },
            showDataPoints: true,
        }
    });

    // gera o quantitativo por tipo de crime
    gerarQuantitativoOcorrencias(dados, 'drogas');
}

var gerarGraficosArmas = function (dados) {
    // Reseta os gráficos
    resetarGraficosArmas();

    // Tipo de Crime
    var dadosEspecie = dados.especie;
    graficos.graficoArmasEspecie = new Chart($(idGraficos.armas.especie), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: dadosEspecie['dados'],
                backgroundColor: dadosEspecie['colors'],
                borderColor: dadosEspecie['colors']
            }],
            labels: dadosEspecie['defaultLabels']
        },
        options: {
            maintainAspectRatio: false,
            legend: {
                position: 'right',
                align: 'start'
            }
        }
    });

    // Anual
    var dadosAnual = dados.anual;
    var minValue = Math.min.apply(Math, dadosAnual['dados']) - 10;
    var maxValue = Math.max.apply(Math, dadosAnual['dados']) + 10;
    if (minValue < 0) {
        minValue = 0;
    }
    graficos.graficoArmasAnual = new Chart($(idGraficos.armas.anual), {
        type: 'bar',
        data: {
            datasets: [{
                data: dadosAnual['dados'],
                backgroundColor: dadosAnual['colors'],
                borderColor: dadosAnual['colors']
            }],
            labels: dadosAnual['labels']
        },
        options: {
            legend: {
                display: false
            },
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: minValue,
                        suggestedMax: maxValue
                    }
                }]
            },
            showDataPoints: true,
        }
    });

    // Mês a Mês
    var dadosMensal = dados.mensal;
    graficos.graficoArmasMensal = new Chart($(idGraficos.armas.mensal), {
        type: 'line',
        data: {
            labels: dadosMensal.labels,
            datasets: dadosMensal.datasets
        },
        options: {
            maintainAspectRatio: false,
            showDataPoints: true,
        }
    });

    // gera o quantitativo por tipo de crime
    gerarQuantitativoOcorrencias(dados, 'armas');
}

var gerarGraficosEnvolvidos = function (dados) {
    // Reseta os gráficos
    resetarGraficosEnvolvidos();

    // Sexo
    var dadosSexo = dados.sexo;
    graficos.graficoEnvolvidosSexo = new Chart($(idGraficos.envolvidos.sexo), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: dadosSexo['dados'],
                backgroundColor: dadosSexo['colors'],
                borderColor: dadosSexo['colors']
            }],
            labels: dadosSexo['defaultLabels']
        },
        options: {
            maintainAspectRatio: false
        }
    });

    // Faixa etária
    var dadosFaixaEtaria = dados.faixaEtaria;
    graficos.graficoEnvolvidosFaixaEtaria = new Chart($(idGraficos.envolvidos.faixaEtaria), {
        type: 'doughnut',
        data: {
            datasets: [{
                data: dadosFaixaEtaria['dados'],
                backgroundColor: dadosFaixaEtaria['colors'],
                borderColor: dadosFaixaEtaria['colors']
            }],
            labels: dadosFaixaEtaria['labels']
        },
        options: {
            maintainAspectRatio: false
        }
    });

    // Anual
    var dadosAnual = dados.anual;
    var minValue = Math.min.apply(Math, dadosAnual['dados']) - 10;
    var maxValue = Math.max.apply(Math, dadosAnual['dados']) + 10;
    if (minValue < 0) {
        minValue = 0;
    }
    graficos.graficoEnvolvidosAnual = new Chart($(idGraficos.envolvidos.anual), {
        type: 'bar',
        data: {
            datasets: [{
                data: dadosAnual['dados'],
                backgroundColor: dadosAnual['colors'],
                borderColor: dadosAnual['colors']
            }],
            labels: dadosAnual['labels']
        },
        options: {
            legend: {
                display: false
            },
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: minValue,
                        suggestedMax: maxValue
                    }
                }]
            },
            showDataPoints: true,
        }
    });

    // Mês a Mês
    var dadosMensal = dados.mensal;
    graficos.graficoEnvolvidosMensal = new Chart($(idGraficos.envolvidos.mensal), {
        type: 'line',
        data: {
            labels: dadosMensal.labels,
            datasets: dadosMensal.datasets
        },
        options: {
            maintainAspectRatio: false,
            showDataPoints: true,
        }
    });

    // gera o quantitativo por tipo de crime
    gerarQuantitativoOcorrencias(dados, 'envolvidos');
}

var gerarQuantitativoOcorrencias = function (dados, tipo) {
    if (dados.totalOcorrencias) {
        var $panel = $('#total-ocorrencias-' + tipo);
        $panel.show();
        var $tbody = $panel.find('tbody');
        $tbody.empty();
        var totalGeral = 0;

        for (var i in dados.totalOcorrencias) {
            var $item = dados.totalOcorrencias[i];
            totalGeral += parseInt($item.total);

            var $tr = $('<tr />');
            var $td = $('<td />');

            $tr.append($td.clone().text($item.ITEM));
            $tr.append($td.clone().text($item.total).addClass('text-right'));

            $tbody.append($tr);
        }

        var $tr = $('<tr />');
        var $td = $('<td />');

        $tr.append($td.clone().html('<strong>TOTAL</strong>'));
        $tr.append($td.clone().html('<strong>' + totalGeral + '</strong>').addClass('text-right'));

        $tbody.append($tr);
    }
}

function randomColor() {
    var c = [
        'rgba(66, 179, 213, 1)',
        'rgba(176, 224, 230, 1)',
        'rgba(216, 191, 216, 1)',
        'rgba(230, 230, 250, 1)',
        'rgba(210, 180, 140, 1)',
        'rgba(189, 83, 107, 1)',
        'rgba(0, 206, 209, 1)',
        'rgba(173, 216, 230, 1)',
        'rgba(100, 149, 237, 1)',
        'rgba(105, 89, 205, 1)'
    ];

    return c[Math.floor(Math.random() * c.length)];
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getAllSelected($select) {
    var result = [];
    $select.find(':selected').each(function () {
        result.push($(this).val());
    });
    return result;
}

Chart.plugins.register({
    beforeDraw: function(chartInstance) {
        if (chartInstance.config.options.showDataPoints) {
            var helpers = Chart.helpers;
            var ctx = chartInstance.chart.ctx;
            var fontColor = helpers.getValueOrDefault(chartInstance.config.options.showDataPoints.fontColor, chartInstance.config.options.defaultFontColor);
            var idGrafico = chartInstance.canvas.id;

            // render the value of the chart above the bar
            ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, 'normal', Chart.defaults.global.defaultFontFamily);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = fontColor;

            chartInstance.data.datasets.forEach(function (dataset) {
                for (var i = 0; i < dataset.data.length; i++) {
                    var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;
                    var yPos = model.y - 5;
                    var label = dataset.data[i];

                    // Formata o peso para os gráficos anual e mensal de drogas
                    if ($.inArray(idGrafico, ['graficoDrogas-anual', 'graficoDrogas-mensal']) > -1) {
                        label = (label).toLocaleString(
                            undefined,
                            { minimumFractionDigits: 2 }
                        );
                    }

                    ctx.fillText(label, model.x, yPos);
                }
            });
        }
    }
});

function getTextWidth(text, font) {
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
}

function getCssStyle(element, prop) {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
}
