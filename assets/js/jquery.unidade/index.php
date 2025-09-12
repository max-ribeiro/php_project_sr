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
    <title>jQuery Unidade</title>
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
    <script type="text/javascript" src="../../vendor/select2/dist/js/select2.min.js"></script>
    <script type="text/javascript" src="../jquery.modal/jquery.modal.js"></script>
    <script type="text/javascript" src="jquery.unidade.js"></script>
    <script type="text/javascript">
        window.initialState ? window.initialState : window.initialState = {url_home: '<?= _URL_HOME_ ?>'};
    </script>
</head>
<body>
<div class="container-fluid sg-header">
    <h2>Unidade</h2>
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
&lt;script src=&quot;assets/vendor/select2/dist/js/select2.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/js/jquery.unidade/jquery.unidade.js&quot;&gt;&lt;/script&gt;
&lt;script&gt;
    window.initialState ? window.initialState : window.initialState = {url_home:'&lt;?= _URL_HOME_ ?&gt;'};
&lt;/script&gt;
    </pre>


    <h4>Exemplo:</h4>
    <pre>
&lt;app-unidade name="id_unidade"&gt;&lt;/app-unidade&gt;
    </pre>
    <app-unidade name="id_unidade"></app-unidade>


    <h4>Exemplo:</h4>
    <pre>
&lt;app-unidade name="id_unidade"&gt;&lt;/app-unidade&gt;
&lt;script&gt;
$(document).ready(function () {
    var unidade = $('app-unidade[name="unidade2"]').unidade();
    unidade.val(1118,'FS');//set
    unidade.val();//get
    unidade.element;//objeto jquery do select
});
&lt;/script&gt;
    </pre>
    <app-unidade name="unidade2" autostart="false"></app-unidade>
    <script>
        var unidade;
        $(document).ready(function () {
            unidade = $('app-unidade[name="unidade2"]').unidade();
        });
    </script>

    <h4>Exemplo:</h4>
    <pre>
&lt;app-unidade name="presidio"&gt;&lt;/app-unidade&gt;
&lt;script&gt;
$(document).ready(function () {
    var presidio = $('app-unidade[name="presidio"]').unidade({
        ajaxdata: {
            in: {
                forcaId: '3, 6'
            }
        }
    });
});
&lt;/script&gt;
    </pre>
    <app-unidade name="presidio" autostart="false" value="140"></app-unidade>
    <script>
        var presidio;
        $(document).ready(function () {
            presidio = $('app-unidade[name="presidio"]').unidade({
                allownotfound: true,
                ajaxdata: {
                    in: {
                        forcaId: '3, 6'
                    }
                }
            });
        });
    </script>

    <br>
    <br>

</div>

</body>
</html>
