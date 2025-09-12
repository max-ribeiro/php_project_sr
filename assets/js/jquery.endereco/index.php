<?php
session_start();
require_once("config.php");
require_once(_DIR_HOME_ . "connect.php");
require_once(_DIR_HOME_ . "vasa.php");
require_once(_DIR_CLASSES_ . "gEstado.inc.php");
require_once(_DIR_CLASSES_ . 'UserSession.inc.php');

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge">
    <title>jQuery Endere&ccedil;o</title>
    <link rel="stylesheet" href="../../vendor/font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" href="../../vendor/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="../../vendor/select2/dist/css/select2.min.css"/>
    <link rel="stylesheet" href="../../vendor/select2-bootstrap-theme/dist/select2-bootstrap.min.css"/>
    <link rel="stylesheet" href="../../vendor/toastr/toastr.min.css"/>
    <link rel="stylesheet" href="../../styles/bootstrap.sigo.css">

    <script type="text/javascript" src="../../vendor/jquery/jquery.min.js"></script>
    <script type="text/javascript" src="../../vendor/handlebars/handlebars.min.js"></script>
    <script type="text/javascript" src="../../vendor/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="../../vendor/jquery-mask/dist/jquery.mask.min.js"></script>
    <script type="text/javascript" src="../../vendor/toastr/toastr.min.js"></script>
    <script type="text/javascript" src="../../vendor/bootpag/jquery.bootpag.min.js"></script>
    <script type="text/javascript" src="../../vendor/select2/dist/js/select2.min.js"></script>
    <script type="text/javascript" src="../../vendor/jquery.blockUI/jquery.blockUI.min.js"></script>
    <script type="text/javascript" src="../jquery.modal/jquery.modal.js"></script>
    <script type="text/javascript" src="../jquery.municipio/jquery.municipio.js"></script>
    <script type="text/javascript" src="jquery.endereco.js"></script>
    <script type="text/javascript">
        window.initialState ? window.initialState : window.initialState = {url_home: '<?= _URL_HOME_ ?>'};
    </script>
</head>
<body>
<div class="container-fluid sg-header">
    <h2>Endere&ccedil;o</h2>
</div>
<div class="col-xs-12">
    <div class="sg-content"></div>
    <h3>Includes</h3>
    <pre>
&lt;!-- Styles&nbsp;--&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;assets/vendor/font-awesome/css/font-awesome.min.css&quot;&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;assets/vendor/bootstrap/css/bootstrap.min.css&quot;&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;assets/vendor/select2/dist/css/select2.min.css&quot;&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;assets/vendor/select2-bootstrap-theme/dist/select2-bootstrap.min.css&quot;&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;assets/vendor/toastr/toastr.min.css&quot;&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;assets/styles/bootstrap.sigo.css&quot;&gt;

&lt;!-- JS&nbsp;--&gt;
&lt;script src=&quot;assets/vendor/jquery/jquery.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/vendor/handlebars/handlebars.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/vendor/bootstrap/js/bootstrap.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/vendor/jquery-mask/dist/jquery.mask.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/vendor/toastr/toastr.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/vendor/bootpag/jquery.bootpag.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/vendor/select2/dist/js/select2.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/vendor/jquery.blockUI/jquery.blockUI.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/js/jquery.modal/jquery.modal.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/js/jquery.municipio/jquery.municipio.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/js/jquery.endereco/jquery.endereco.js&quot;&gt;&lt;/script&gt;
&lt;script&gt;
    window.initialState ? window.initialState : window.initialState = {url_home:'&lt;?= _URL_HOME_ ?&gt;'};
&lt;/script&gt;
    </pre>



    <h4>Exemplo:</h4>
    <pre>
&lt;app-endereco namemunicipio="id_cidade"&gt;&lt;/app-endereco&gt;
    </pre>
    <form class="row" name="exemplo1">
        <app-endereco namemunicipio="id_cidade"></app-endereco>
        <div class="col-sm-12 text-right">
            <button id="showExemplo1" type="button" class="btn btn-primary">Show form values</button>
        </div>
        <script>
            $('#showExemplo1').click(function () {
                $('form[name="exemplo1"]').submit();
            });
            $('form[name="exemplo1"]').submit(function (event) {
                console.log($(this).serializeArray());
                var text = JSON.stringify($(this).serializeArray());
                text = text.replace(/[,{}\[\]]/g, function (match) {
                    if (/[}\]]/.test(match)) return '\n' + match;
                    return match + '\n';
                });
                $.modal('<pre>' + text + '</pre>');
                event.preventDefault();
            });
        </script>
    </form>

    <h4>Exemplo capturando o retorno:</h4>
    <pre>
&lt;app-endereco id="exemplo" autostart="false"&gt;&lt;/app-endereco&gt;
&lt;script&gt;
    $(document).ready(function () {
        var endereco = $('#exemplo').endereco({
            namemunicipio: 'id_municipio',
            namebairro: 'id_bairro',
            namelogradouro: 'id_logradouro'
        });
        endereco.numero.on('change',function () {
           console.log('O campo numero foi alterado');
        });
        //campos do select2 chama com .element
        endereco.bairro.element.on('change',function () {
            console.log('O campo bairro foi alterado');
        });
    });
&lt;/script&gt;
    </pre>
    <form class="row" name="exemplo2">
        <app-endereco id="exemplo2" autostart="false"></app-endereco>
        <div class="col-sm-12 text-right">
            <button id="showExemplo2" type="button" class="btn btn-primary">Show form values</button>
        </div>
        <script>
            var endereco;
            $(document).ready(function () {
                endereco = $('#exemplo2').endereco({
                    namemunicipio: 'id_municipio',
                    namebairro: 'id_bairro',
                    namelogradouro: 'id_logradouro'
                });
                endereco.numero.on('change',function () {
                   console.log('O campo numero foi alterado');
                });
                //campos do select2 chama com .element
                endereco.bairro.element.on('change',function () {
                    console.log('O campo bairro foi alterado');
                });
            });
            $('#showExemplo2').click(function () {
                $('form[name="exemplo2"]').submit();
            });
            $('form[name="exemplo2"]').submit(function (event) {
                console.log($(this).serializeArray());
                var text = JSON.stringify($(this).serializeArray());
                text = text.replace(/[,{}\[\]]/g, function (match) {
                    if (/[}\]]/.test(match)) return '\n' + match;
                    return match + '\n';
                });
                $.modal('<pre>' + text + '</pre>');
                event.preventDefault();
            });
        </script>
    </form>


    <h4>Exemplo values:</h4>
    <pre>
&lt;app-endereco
    valuecep="79009790"
    valueuf="MS"
    valuemunicipioid="4141"
    valuemunicipio="Campo Grande"
    valuebairroid="6312"
    valuebairro="Vila Planalto"
    valuelogradouroid="206299"
    valuelogradouro="Tamandare"
    valuenumero="10"
    &gt;&lt;/app-endereco&gt;
    </pre>
    <app-endereco
        valuecep="79009790"
        valueuf="MS"
        valuemunicipioid="4141"
        valuemunicipio="Campo Grande"
        valuebairroid="6312"
        valuebairro="Vila Planalto"
        valuelogradouroid="206299"
        valuelogradouro="Tamandare"
        valuenumero="10"
    ></app-endereco>


    <div style="clear: both;"></div>


    <h4>Exemplo template:</h4>
    <pre>
&lt;app-endereco template="labelleft"&gt;&lt;/app-endereco&gt;
    </pre>
    <app-endereco template="labelleft"></app-endereco>




</div>

</body>
</html>
