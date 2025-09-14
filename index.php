<?php
session_start();
header('Content-Type: text/html; charset=utf-8');

require_once(__DIR__ . '/config.php');
require_once('./db.php');
require_once(_DIR_HOME_ . 'functions.php');
require_once(_DIR_HOME_ . 'classes/ConnectionInfo.php');
require_once(_DIR_HOME_ . 'api/v1/DatabaseConnector.php');

$db = DatabaseConnector::getInstance();

$initialState = [
    'urlHome' => _URL_HOME_
];

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>LOGIN</title>
    <meta name="description" content="LOGIN">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <?= tagStyle(_URL_HOME_ . 'assets/vendor/bootstrap/css/bootstrap.min.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/vendor/fontawesome-6.1.1/css/all.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/vendor/toastr/toastr.min.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/vendor/select2/dist/css/select2.min.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/vendor/select2-bootstrap-theme/dist/select2-bootstrap.min.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css') ?>
    <?= tagStyle(_URL_HOME_ . 'assets/css/multiselect/multiselect.css') ?>
    <?= tagStyle(_URL_HOME_ . 'css/complemento-bootstrap.css') ?>
    <?= tagStyle(_URL_HOME_ . 'css/index.css') ?>

</head>
<body>

<div class="container">
    <div id="loginbox" style="margin-top:50px;" class="mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
        <div class="panel panel-info">
            <div class="panel-heading">
                <div class="panel-title">Login</div>
            </div>

            <div style="padding-top:30px" class="panel-body">
                <div style="display:none" id="login-alert" class="alert alert-danger col-sm-12"></div>

                <form id="loginform" class="form-horizontal" role="form" action="/auth/web/login.php" method="POST">
                    <div style="margin-bottom: 25px" class="input-group">
                        <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
                        <input id="login-username" type="text" class="form-control" name="login"
                               placeholder="LOGIN" required>
                    </div>

                    <div style="margin-bottom: 25px" class="input-group">
                        <span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>
                        <input id="login-password" type="password" class="form-control" name="senha"
                               placeholder="SENHA" required>
                    </div>

                    <div style="margin-top:10px" class="form-group">
                        <div class="col-sm-12 controls">
                            <button type="submit" id="btn-login" href="#" class="btn btn-success">Acessar</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <?php 
            if (isset($_SESSION['error'])) {
                echo '<div class="alert alert-danger">' . $_SESSION['error'] . '</div>';
                unset($_SESSION['error']); // limpa para não reaparecer no refresh
            }
        ?>
    </div>
</div>


<script>window.initialState = <?= json_encode($initialState) ?>;</script>
<?= tagScript(_URL_HOME_ . 'assets/vendor/jquery/jquery.min.js') ?>
<?= tagScript(_URL_HOME_ . 'assets/vendor/toastr/toastr.min.js') ?>
<?= tagScript(_URL_HOME_ . 'assets/vendor/moment/moment.min.js') ?>
<?= tagScript(_URL_HOME_ . 'assets/vendor/moment/locale/pt-br.js') ?>
<?= tagScript(_URL_HOME_ . 'assets/vendor/bootstrap/js/bootstrap.min.js') ?>
<?= tagScript(_URL_HOME_ . 'assets/vendor/jquery.blockUI/jquery.blockUI.min.js') ?>
<?= tagScript(_URL_HOME_ . 'assets/vendor/select2/dist/js/select2.min.js') ?>
<?= tagScript(_URL_HOME_ . 'assets/vendor/select2/dist/js/i18n/pt-BR.js') ?>
<?= tagScript(_URL_HOME_ . 'assets/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js') ?>
<?= tagScript(_URL_HOME_ . 'assets/vendor/chartjs/v2-9-4/Chart.min.js') ?>
<?= tagScript(_URL_HOME_ . 'assets/js/multiselect/multiselect.js') ?>
<?= tagScript(_URL_HOME_ . 'js/index.js') ?>

</body>
</html>