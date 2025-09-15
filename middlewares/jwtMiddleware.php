<?php

require_once(__DIR__ . '/../config.php');
require_once(_DIR_HOME_ . 'auth/JWTAuth.php');
require_once(_DIR_HOME_ . 'http/Response.php');

$headers = getallheaders();

if (!isset($headers['Authorization'])) {
    Response::withJson([
        'message' => 'Token não enviado na requisição'
    ], 400);
}

$authHeader = trim($headers['Authorization']);
if (strpos($authHeader, 'Bearer ') !== 0) {
    Response::withJson([
        'message' => 'Authorization com formato invalido'
    ], 400);
}

$jwt = trim(substr($authHeader, 7));
$validationMessage = JWTAuth::validate($jwt);

if(empty($validationMessage['valid'])) {
    if($validationMessage['code']) {
        session_destroy();
    }
    Response::withJson([
        'message' => $validationMessage['error']
    ],  $validationMessage['code']);
}