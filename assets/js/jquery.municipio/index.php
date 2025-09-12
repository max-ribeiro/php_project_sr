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
    <title>jQuery Município</title>
    <link rel="stylesheet" href="../../vendor/font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" href="../../vendor/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="../../vendor/select2/dist/css/select2.min.css"/>
    <link rel="stylesheet" href="../../vendor/select2-bootstrap-theme/dist/select2-bootstrap.min.css"/>
    <link rel="stylesheet" href="../../styles/bootstrap.sigo.css">

    <script type="text/javascript" src="../../vendor/jquery/jquery.min.js"></script>
    <script type="text/javascript" src="../../vendor/handlebars/handlebars.min.js"></script>
    <script type="text/javascript" src="../../vendor/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="../../vendor/select2/dist/js/select2.min.js"></script>
    <script type="text/javascript" src="../jquery.modal/jquery.modal.js"></script>
    <script type="text/javascript" src="jquery.municipio.js"></script>
    <script type="text/javascript">
        window.initialState ? window.initialState : window.initialState = {url_home: '<?= _URL_HOME_ ?>'};
    </script>
</head>
<body>
<div class="container-fluid sg-header">
    <h2>Munic&iacute;pio</h2>
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
&lt;link rel=&quot;stylesheet&quot; href=&quot;assets/styles/bootstrap.sigo.css&quot;&gt;

&lt;!-- JS&nbsp;--&gt;
&lt;script src=&quot;assets/vendor/jquery/jquery.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/vendor/handlebars/handlebars.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/vendor/bootstrap/js/bootstrap.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/vendor/select2/dist/js/select2.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/js/jquery.municipio/jquery.municipio.js&quot;&gt;&lt;/script&gt;
&lt;script&gt;
    window.initialState ? window.initialState : window.initialState = {url_home:'&lt;?= _URL_HOME_ ?&gt;'};
&lt;/script&gt;
    </pre>

    <h4>Exemplo:</h4>
    <pre>
&lt;app-municipio namemunicipio="if_municipio"&gt;&lt;/app-municipio&gt;
    </pre>
    <app-municipio namemunicipio="if_municipio"></app-municipio>

    <h4>Exemplo com UF:</h4>
    <pre>
&lt;app-municipio namemunicipio="id_municipio" valueuf="MS"&gt;&lt;/app-municipio&gt;
    </pre>
    <app-municipio namemunicipio="id_municipio" valueuf="MS"></app-municipio>


    <h4>Exemplo com Show UF:</h4>
    <pre>
&lt;app-municipio namemunicipio="municipio1" nameuf="uf1" showuf=&quot;true&quot;&gt;&lt;/app-municipio&gt;
&lt;app-municipio namemunicipio="municipio1" nameuf="uf1" valueuf=&quot;MS&quot; showuf=&quot;true&quot;&gt;&lt;/app-municipio&gt;
    </pre>
    <app-municipio namemunicipio="municipio1" nameuf="uf1" showuf="true"></app-municipio>
    <app-municipio namemunicipio="municipio2" nameuf="uf2" valueuf="MS" showuf="true"></app-municipio>


    <h4>Exemplo dentro de Modal:</h4>
    <pre>
&lt;style&gt;.select2-dropdown{ z-index: 2001; }&lt;/style&gt;
var modal = $.modal('&lt;app-municipio namemunicipio="municipio_modal"&gt;&lt;/app-municipio&gt;');
$(modal.element).find('app-municipio').municipio();
    </pre>
    <button class="btn btn-primary" id="exemploModal">
        Click para abrir o modal
    </button>
    <style>.select2-dropdown {
            z-index: 2001;
        }</style>
    <script type="text/javascript">
        $('#exemploModal').click(function () {
            var modal = $.modal('<app-municipio namemunicipio="municipio_modal"></app-municipio>');
            $(modal.element).find('app-municipio').municipio();
        });
    </script>

</div>
</body>
</html>
