<?php
require_once(__DIR__ . '/../../config.php');
require_once(_DIR_HOME_ . 'http/Response.php');
require_once(_DIR_HOME_ . 'auth/JWTAuth.php');

try {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        Response::withJson([
            'message' => 'JSON inválido'
        ], 400);
    }

    if (empty($input['login']) || empty($input['senha'])) {
        Response::withJson([
            'message' => 'Credenciais inválidas'
        ], 400);
    }

    $token = JWTAuth::authenticate($input);
    if (empty($token)) {
        Response::withJson([
            'message' => 'Credenciais inválidas'
        ], 403);
    }

    Response::withJson([
        'token' => $token,
        'user' => $input['login']
    ], 200);

} catch (\Exception $e) {
    Response::withJson([
        'error' => $e->getMessage()
    ], $e->getCode() ?: 500);
}