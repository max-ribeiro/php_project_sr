<?php
require_once(__DIR__ . '/../config.php');
require_once(_DIR_HOME_ . 'http/Response.php');

try {
    if(empty($_REQUEST)) {
        Response::withJson([
            'data' => $_REQUEST['data']
        ], 400);
    }

    $login = !empty($_REQUEST['login']) ? filter_var($_REQUEST['login']) : '';
    $passWord = !empty($_REQUEST['senha']) ? filter_var($_REQUEST['senha']) : '';

    Response::withJson([
        'message' => 'logado',
        'data' => $_REQUEST
    ], 200);
    
} catch (\Exception $e) {
    return Response::withJson([
        'error' => $e->getMessage()
    ], $e->getCode());
}