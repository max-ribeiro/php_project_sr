<?php
session_start();
header('Content-Type: text/html; charset=utf-8');

require_once(__DIR__ . '/../config.php');
require_once(_DIR_HOME_ . 'db.php');
require_once(_DIR_HOME_ . 'functions.php');
require_once(_DIR_HOME_ . 'handlers/sessionCheck.php');
require_once(_DIR_HOME_ . 'classes/ConnectionInfo.php');
require_once(_DIR_HOME_ . 'api/v1/DatabaseConnector.php');

$rowsPerPage = 15;

$initialState = [
    'urlHome' => _URL_HOME_
];

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>CIDADÃO</title>
    <meta name="description" content="CIDADÃO">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <?= tagStyle(_URL_HOME_ . 'assets/vendor/bootstrap/css/bootstrap.min.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/vendor/font-awesome/css/font-awesome.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/vendor/toastr/toastr.min.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/vendor/select2/dist/css/select2.min.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/vendor/select2-bootstrap-theme/dist/select2-bootstrap.min.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/vendor/jquery-ui/jquery-ui.min.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/vendor/jquery-ui/jquery-ui.theme.min.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/vendor/jquery-ui/jquery-ui.structure.min.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/css/multiselect/multiselect.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/styles/bootstrap.sigo.css') ?>
    <?= tagStyle(_URL_HOME_ . 'css/complemento-bootstrap.css') ?>
    <?= tagStyle(_URL_HOME_ . 'css/index.css') ?>

</head>
<body>

<div id="header" class="container-fluid sg-header">
    <div class="pull-right" style="padding-top: 20px;">
        <button type="button" class="btn btn-default hide" data-js-return="">
            <i class="fa fa-chevron-left fa-fw"></i> Voltar
        </button>
        <button type="button" class="btn btn-primary" id="cadastrar-novo">
            <i class="fa fa-plus fa-fw"></i> Novo Registro
        </button>
    </div>
    <h2 class="sg-header__title">Cidadãos</h2>
</div>

<div class="container-fluid sg-content">

    <div id="resultados" class="col-lg-9" style="display: none;">
        <div class="panel panel-info carregando">
            <div class="panel-body bg-info text-center">
                <h2><i class="fa fa-spinner fa-pulse fa-fw"></i> Carregando informações</h2>
            </div>
        </div>
        <div class="itens">
            <div class="panel panel-default sg-panel">
                <div class="panel-heading">
                    <h3 class="panel-title">Resultados da Busca</h3>
                </div>
                <div data-content="">
                    <table class="table table-striped table-hover" id="registros">
                        <thead>
                        <tr>
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>Telefone</th>
                            <th>Status</th>
                            <th class="acoes"></th>
                        </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div id="parametros_init" class="col-lg-6 col-lg-offset-3 col-md-8 col-md-offset-2">
        <div class="panel panel-default sg-panel--info">
            <div class="panel-heading"><h3 class="panel-title">Busca de Registros</h3></div>
            <div class="panel-body">
                <form id="form" class="row">

                    <div class="col-md-12">
                        <div class="form-group">
                            <label>Cidadão:</label>
                            <div class="input-group">
                                <div class="input-group-btn">
                                    <button type="button" class="btn btn-default dropdown-toggle"
                                            data-toggle="dropdown"
                                            aria-haspopup="true" aria-expanded="false">
                                        <span>Nome</span> <span class="caret"></span>
                                    </button>
                                    <ul data-js-change--type="" data-js-tp="tpBusca"
                                        data-js-campo="cidadao" class="dropdown-menu">
                                        <li><a href="#" data-value="nome">Nome</a></li>
                                        <li><a href="#" data-value="cpf">CPF</a></li>
                                        <li><a href="#" data-value="telefone">Telefone</a></li>
                                    </ul>
                                </div>
                                <span class="input-group-addon"><i class="fa fa-search"></i></span>
                                <input type="text" id="cidadao" name="cidadao" class="form-control">
                                <input type="hidden" id="tpBusca" name="tpBusca" value="nome">
                            </div>
                        </div>
                    </div>

                    <div class="col-md-12 text-right">
                        <button type="button" class="btn btn-default" id="limpar">
                            <i class="fa fa-trash" aria-hidden="true"></i>
                            Limpar
                        </button>
                        <button type="button" class="btn btn-primary" id="consultar">
                            <i class="fa fa-search" aria-hidden="true"></i>
                            Consultar
                        </button>
                    </div>
                </form>
            </div>

            <div id="parametros" class="row" style="display: none;">
                <div class="col-lg-12">
                    <dl class="dl-horizontal">
                    </dl>
                    <hr>
                </div>
                <div id="paginacaoResultado" class="col-lg-12 text-center"></div>
                <div id="paginacaoDetalhes" class="col-lg-12 text-center mb-2" style="font-size: 10px;">
                    *São listados no máximo <?= $rowsPerPage ?> registros por página
                </div>
            </div>

        </div>
    </div>
</div>

<!-- modal de criação de registro -->
<div class="modal fade" id="modal-novo-registro">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <button class="close" type="button" data-dismiss="modal">
                    <span>+</span>
                </button>
                <h4 class="modal-title">Cadastrar Cidadão</h4>
            </div>
            <div class="modal-body">
                <form id="cadastrar" class="row">
                    <div class="col-md-12">
                        <legend><h5>Dados Pessoais</h5></legend>
                    </div>
                    <input type="hidden" id="id_cidadao" name="id_cidadao" value="">
                    
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="nome">Nome:</label>
                            <input class="form-control required" type="text" id="nome" name="nome">
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="cpf">CPF:</label>
                            <input class="form-control required" type="text" id="cpf" name="cpf">
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="telefone">Telefone:</label>
                            <input class="form-control required" type="text" id="telefone" name="telefone">
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <div class="text-right">
                    <button type="button" class="btn btn-default" data-dismiss="modal">
                        Cancelar
                    </button>
                    <button type="button" class="btn btn-success" id="confirmarSalvar">
                        <i class="fa fa-check"></i> <span>Salvar</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- modal de edição de registro -->
<div class="modal fade" id="modal-editar-registro">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header clearfix">
                <h4 class="modal-title pull-left">Editar Cidadão</h4>
                <button type="button" class="btn btn-danger btn-xs pull-right cidadao-edit-btn" id="btn-remove-cidadao" title="deletar registro">
                    <i class="fa fa-trash fa-fw"></i>
                </button>
            </div>

            <div class="modal-body">
                <form id="editar" class="row">
                    <div class="col-md-12">
                        <legend><h5>Dados Pessoais</h5></legend>
                    </div>
                    <input type="hidden" id="id_cidadao" name="id_cidadao" value="">
                    
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="nome">Nome:</label>
                            <input class="form-control required" type="text" id="nome" name="nome">
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="cpf">CPF:</label>
                            <input class="form-control required" type="text" id="cpf" name="cpf" disabled>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="form-group">
                            <label for="telefone">Telefone:</label>
                            <input class="form-control required" type="text" id="telefone" name="telefone">
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <div class="text-right">
                    <button type="button" class="btn btn-default" data-dismiss="modal">
                        Cancelar
                    </button>
                    <button type="button" class="btn btn-success" id="corfirmarAtualizar">
                        <i class="fa fa-check"></i> <span>Salvar</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- modal endereços -->
<div class="modal fade" id="modal-enderecos">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header clearfix">
                <h4 class="modal-title pull-left" id="enderecos-title">Endereços</h4>
            </div>

            <div class="modal-body">
                <!-- Formulário de Novo Endereço -->
                <form id="novo-endereco" class="form">
                    <input type="hidden" id="id_cidadao" name="id_cidadao" value="">
                    <div class="form-group">
                        <legend class="col-md-12 control-legend"><h5>Novo Endereço</h5></label>
                    </div>
                    <div class="form-group">
                        <label class="col-md-2 control-label" for="logradouro">Logradouro:</label>
                        <div class="col-md-4">
                            <input class="form-control required" type="text" id="logradouro" name="logradouro">
                        </div>
                        <label class="col-md-2 control-label" for="numero">Número:</label>
                        <div class="col-md-4">
                            <input class="form-control required" type="text" id="numero" name="numero">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-md-2 control-label" for="bairro">Bairro:</label>
                        <div class="col-md-4">
                            <input class="form-control required" type="text" id="bairro" name="bairro">
                        </div>
                        <label class="col-md-2 control-label" for="cidade">Cidade:</label>
                        <div class="col-md-4">
                            <input class="form-control required" type="text" id="cidade" name="cidade">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-md-2 control-label" for="uf">UF:</label>
                        <div class="col-md-2">
                            <input class="form-control required" type="text" id="uf" name="uf" maxlength="2">
                        </div>
                        <label class="col-md-2 control-label" for="cep">CEP:</label>
                        <div class="col-md-2">
                            <input class="form-control required" type="text" id="cep" name="cep">
                        </div>
                        <label class="col-md-2 control-label" for="principal">Principal:</label>
                        <div class="col-md-2">
                            <input type="checkbox" id="principal" name="principal" value="1">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="col-md-12">
                            <button type="submit" class="btn btn-success pull-right">
                                <i class="fa fa-plus"></i> Salvar Endereço
                            </button>
                        </div>
                    </div>
                </form>

                <!-- Lista de Endereços com Cards Hardcoded -->
                <div class="row" id="lista-enderecos" style="margin-top: 20px;">
                    <div class="col-md-12">
                        <legend class="col-md-12 control-legend"><h5>Endereços cadastrados</h5></label>
                    </div>
                    <div class="col-md-4">
                        <div class="panel panel-default panel-success" style="height: 150px;">
                            <div class="panel-body" style="display: flex; flex-direction: column; justify-content: center;">
                                <p>Rua Tal, 123</p>
                                <p>São Paulo - SP</p>
                                <i class="fa fa-star"></i>
                            </div>
                            <div class="panel-footer">
                                <button class="btn btn-warning btn-sm marcar-principal" data-id="1">
                                    <i class="fa fa-star"></i> Desmarcar Principal
                                </button>
                                <button class="btn btn-danger btn-sm excluir-endereco" data-id="1">
                                    <i class="fa fa-trash"></i> Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="panel panel-default" style="height: 150px;">
                            <div class="panel-body" style="display: flex; flex-direction: column; justify-content: center;">
                                <p>Rua Tal, 456</p>
                                <p>São Paulo - SP</p>
                            </div>
                            <div class="panel-footer">
                                <button class="btn btn-warning btn-sm marcar-principal" data-id="2">
                                    <i class="fa fa-star"></i> Marcar Principal
                                </button>
                                <button class="btn btn-danger btn-sm excluir-endereco" data-id="2">
                                    <i class="fa fa-trash"></i> Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="panel panel-default" style="height: 150px;">
                            <div class="panel-body" style="display: flex; flex-direction: column; justify-content: center;">
                                <p>Rua Tal, 789</p>
                                <p>São Paulo - SP</p>
                            </div>
                            <div class="panel-footer">
                                <button class="btn btn-warning btn-sm marcar-principal" data-id="3">
                                    <i class="fa fa-star"></i> Marcar Principal
                                </button>
                                <button class="btn btn-danger btn-sm excluir-endereco" data-id="3">
                                    <i class="fa fa-trash"></i> Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <div class="text-right">
                    <button type="button" class="btn btn-default" data-dismiss="modal">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>


<script>
    const token = "<?= $_SESSION['token'] ?>";
    if(token) {
        localStorage.setItem("token", token);
    }
</script>
<script>window.initialState = <?= json_encode($initialState) ?>;</script>
<script src="<?= _URL_HOME_ ?>assets/vendor/jquery/jquery.min.js"></script>
<script src="<?= _URL_HOME_ ?>assets/vendor/jquery-ui/jquery-ui.min.js"></script>
<script src="<?= _URL_HOME_ ?>assets/vendor/jquery-mask/dist/jquery.mask.min.js"></script>
<script src="<?= _URL_HOME_ ?>assets/vendor/moment/moment.min.js"></script>
<script src="<?= _URL_HOME_ ?>assets/vendor/moment/locale/pt-br.js"></script>
<script src="<?= _URL_HOME_ ?>assets/vendor/bootstrap/js/bootstrap.min.js"></script>
<script src="<?= _URL_HOME_ ?>assets/vendor/select2/dist/js/select2.min.js"></script>
<script src="<?= _URL_HOME_ ?>assets/vendor/select2/dist/js/i18n/pt-BR.js"></script>
<script src="<?= _URL_HOME_ ?>assets/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js"></script>
<script src="<?= _URL_HOME_ ?>assets/js/jquery.datetimepicker.period/jquery.datetimepicker.period.js"></script>
<script src="<?= _URL_HOME_ ?>assets/js/jquery.mask/jquery.mask.min.js"></script>
<script src="<?= _URL_HOME_ ?>assets/vendor/toastr/toastr.min.js"></script>
<script src="<?= _URL_HOME_ ?>assets/vendor/bootpag/jquery.bootpag.min.js"></script>
<?= tagScript(_URL_HOME_ . 'assets/vendor/jquery.blockUI/jquery.blockUI.min.js') ?>
<?= tagScript(_URL_HOME_ . 'assets/vendor/handlebars/handlebars.min.js') ?>
<?= tagScript(_URL_HOME_ . 'cidadao/index.js') ?>
</body>
</html>