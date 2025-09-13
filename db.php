<?php
require_once(__DIR__ . '/config.php');
require_once(_DIR_HOME_ . 'classes/ConnectionInfo.php');

$dadosConexao = ConnectionInfo::get()['default'];
$cn = sqlsrv_connect($dadosConexao['server'], $dadosConexao['connectionParams']);

if (!$cn) {
    echo '<hr /><p style="text-align:center">';
    echo 'Falha na conexão ao banco de dados!';
    echo print_r(sqlsrv_errors(), true);
    echo '</p><hr />';
    sqlsrv_close($cn);
} else {
    ConnectionInfo::setConnection($cn);
}
