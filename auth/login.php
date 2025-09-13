<?php
require_once(__DIR__ . '/../config.php');
require_once(_DIR_HOME_ . 'http/Response.php');
require_once(_DIR_HOME_ . 'auth/JWTAuth.php');

try {
    if (empty($_REQUEST['login']) || empty($_REQUEST['senha'])) {
        Response::withJson([
            'message' => 'credenciais invalidas' 
        ], 400);
    }

    $token = JWTAuth::authenticate($_REQUEST);
    if(empty($token)) {
        Response::withJson([
            'message' => 'Credenciais invalidas',
        ], 403); 
    }

    Response::withJson([
        'token' => $token,
        'user' => $_REQUEST['login']
    ], 200);
    
} catch (\Exception $e) {
    return Response::withJson([
        'error' => $e->getMessage()
    ], $e->getCode());
}