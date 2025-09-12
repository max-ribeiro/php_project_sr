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
    <title>jQuery Modal</title>
    <link rel="stylesheet" href="../../vendor/font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" href="../../vendor/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="../../styles/bootstrap.sigo.css">

    <script type="text/javascript" src="../../vendor/jquery/jquery.min.js"></script>
    <script type="text/javascript" src="../../vendor/handlebars/handlebars.min.js"></script>
    <script type="text/javascript" src="../../vendor/bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="jquery.modal.js"></script>
    <script type="text/javascript">
        window.initialState ? window.initialState : window.initialState = {url_home: '<?= _URL_HOME_ ?>'};
    </script>
</head>
<body>
<div class="container-fluid sg-header">
    <h2>Modal</h2>
</div>
<div class="col-xs-12">
    <div class="sg-content"></div>
    <h3>Includes</h3>
    <pre>
&lt;!-- Styles&nbsp;--&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;assets/vendor/font-awesome/css/font-awesome.min.css&quot;&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;assets/vendor/bootstrap/css/bootstrap.min.css&quot;&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;assets/styles/bootstrap.sigo.css&quot;&gt;

&lt;!-- JS&nbsp;--&gt;
&lt;script src=&quot;assets/vendor/jquery/jquery.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/vendor/handlebars/handlebars.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/vendor/bootstrap/js/bootstrap.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;assets/js/jquery.modal/jquery.modal.js&quot;&gt;&lt;/script&gt;
&lt;script&gt;
    window.initialState ? window.initialState : window.initialState = {url_home:'&lt;?= _URL_HOME_ ?&gt;'};
&lt;/script&gt;
    </pre>

    <!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
    <h3>Conteudo texto</h3>
    <pre>
$.modal('Exemplo 1');
    </pre>
    <h4>Exemplo:</h4>
    <button class="btn btn-primary" id="exemplo1">
        Click para abrir o modal
    </button>
    <script type="text/javascript">
        $('#exemplo1').click(function () {
            $.modal('Exemplo 1');
        });
    </script>
    <!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
    <h3>Callback close</h3>
    <pre>
$.modal('Exemplo 2').on('close', function (event) {
    console.log('callback close', event);
});
    </pre>
    <h4>Exemplo:</h4>
    <button class="btn btn-primary" id="exemplo2">
        Click para abrir o modal
    </button>
    <script type="text/javascript">
        $('#exemplo2').click(function () {
            $.modal('Exemplo 2').on('close', function (event) {
                console.log('callback close', event);
            });
        });
    </script>
    <!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
    <h3>Callback close e go</h3>
    <pre>
$.modal('Exemplo 3',{
    title: 'Exemplo 3',
    btnClose: 'cancelar',
    btnAction: 'enviar',
}).on('close go', function (event) {
    console.log(event.type);
    if (event.type == 'go') {
        $.modal('modal do modal')
    }
});
    </pre>
    <h4>Exemplo:</h4>
    <button class="btn btn-primary" id="exemplo3">
        Click para abrir o modal
    </button>
    <script type="text/javascript">
        $('#exemplo3').click(function () {
            $.modal('Exemplo 3', {
                title: 'Exemplo 3',
                btnClose: 'cancelar',
                btnAction: 'enviar',
            }).on('close go', function (event) {
                console.log(event.type);
                if (event.type == 'go') {
                    $.modal('modal do modal')
                }
            });
        });
    </script>
    <!-- ////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->
    <h3>Iframe</h3>
    <pre>
$.modal('http://getbootstrap.com/docs/', {
    title: 'Iframe',
    btnClose: 'fechar',
    fullsize: true
});
    </pre>
    <h4>Exemplo:</h4>
    <button class="btn btn-primary" id="exemplo4">
        Click para abrir o modal
    </button>
    <script type="text/javascript">
        $('#exemplo4').click(function () {
            $.modal('http://getbootstrap.com/docs/', {
                title: 'Iframe',
                btnClose: 'fechar',
                fullsize: true
            });
        });
    </script>

    <h3>Iframe com space</h3>
    <pre>
$.modal('http://getbootstrap.com/docs/', {
    title: 'Iframe',
    btnClose: 'fechar',
    fullsize: true,
    space: 50
});
    </pre>
    <h4>Exemplo:</h4>
    <button class="btn btn-primary" id="exemplo5">
        Click para abrir o modal
    </button>
    <script type="text/javascript">
        $('#exemplo5').click(function () {
            $.modal('http://getbootstrap.com/docs/', {
                title: 'Iframe com space',
                btnClose: 'fechar',
                fullsize: true,
                space: 50
            });
        });
    </script>


    <h3>Gallery</h3>
    <pre>
$.modal([
    {image: '../../../login/img/bgslide1.jpg'},
    {image: '../../../login/img/bgslide2.jpg'},
    {image: '../../../login/img/bgslide3.jpg'},
    {image: '../../../login/img/bgslide4.jpg'},
    {image: '../../../login/img/bgslide5.jpg'},
    {image: '../../../login/img/bgslide6.jpg'},
    {
        image: '../../../login/img/bgslide7.jpg',
        legenda: 'pode ter legenda',
    }
], {
    title: '<i class=&quot;fa fa-camera fa-fw&quot;></i> Galeria de Imagens',
    btnClose: false,
    fullsizeWidth: true,
    isGallery: true,
    space: 50
});
    </pre>
    <h4>Exemplo:</h4>
    <button class="btn btn-primary" id="exemplo6">
        Click para abrir o modal
    </button>
    <script type="text/javascript">
        $('#exemplo6').click(function () {
            $.modal([
                {image: '../../../login/img/bgslide1.jpg'},
                {image: '../../../login/img/bgslide2.jpg'},
                {image: '../../../login/img/bgslide3.jpg'},
                {image: '../../../login/img/bgslide4.jpg'},
                {image: '../../../login/img/bgslide5.jpg'},
                {image: '../../../login/img/bgslide6.jpg'},
                {
                    image: '../../../login/img/bgslide7.jpg',
                    legenda: 'pode ter legenda',
                    active: true
                }
            ], {
                title: '<i class="fa fa-camera fa-fw"></i> Galeria de Imagens',
                btnClose: false,
                fullsizeWidth: true,
                isGallery: true,
                space: 50
            });
        });
    </script>

</div>

</body>
</html>
