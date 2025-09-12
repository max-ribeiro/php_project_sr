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
    <title>jQuery Info Cidadao</title>
    <link rel="stylesheet" href="../../../vendor/font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" href="../../../vendor/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="../../../styles/bootstrap.sigo.css">
    <link rel="stylesheet" href="../jquery.infoCidadao.css">
</head>
<body>
    <div class="container-fluid">
        <div class="row">
            <div id="informacoes-do-cidadao" class="col-lg-4 col-lg-offset-4"></div>
        </div>
    </div>

    <h2>Modo de utilização</h2>
    <pre>
&lt;!-- Styles&nbsp;--&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;../../../vendor/font-awesome/css/font-awesome.min.css&quot;&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;../../../vendor/bootstrap/css/bootstrap.min.css&quot;&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;../../../styles/bootstrap.sigo.css&quot;&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;../jquery.infoCidadao.css&quot;&gt;

&lt;!-- JS&nbsp;--&gt;
&lt;script src=&quot;../../../vendor/jquery/jquery.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;../../../vendor/bootstrap/js/bootstrap.min.js&quot;&gt;&lt;/script&gt;
&lt;script src=&quot;../jquery.infoCidadao.js&quot;&gt;&lt;/script&gt;
&lt;script&gt;
  $(document).ready(function () {
    $(&#39;#informacoes-do-cidadao&#39;).infoCidadao({
      urlHome: &#39;&lt;?= _URL_HOME_ ?&gt;&#39;,
      id: 209059
    });
  });
&lt;/script&gt;
    </pre>

    <h2>Parâmetros defaults</h2>
    <pre>
$(&#39;#informacoes-do-cidadao&#39;).infoCidadao({
  id: null,
  title: 'Dados do cidadão',
  urlHome: '',
  defaultFoto: '',
  ajax: { // Configurações da requisição ajax, igual ao método $.ajax()
    method: 'POST',
    url: '/api/v2/action.php',
    dataType: 'json',
    data: {
      _class: 'pessoa-fisica',
      _method: 'searchById'
    },
    success: function () {
    },
    error: function () {
    }
  },
  data: {} // Usado para quando o usuário já tem os dados do cidadão e não precisa fazer requisição para o server
});
    </pre>


    <script src="../../../vendor/jquery/jquery.min.js"></script>
    <script src="../../../vendor/bootstrap/js/bootstrap.min.js"></script>
    <script src="../jquery.infoCidadao.js"></script>
    <script>
      $(document).ready(function () {
        $('#informacoes-do-cidadao').infoCidadao({
          urlHome: '<?= _URL_HOME_ ?>',
          id: 209059
        });
      });
    </script>
</body>
</html>