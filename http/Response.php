<?php

class Response {
    /**
     * Retorna resposta no formato JSON
    */
    static function withJson($data = [], $statusCode = 200): string {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
        }
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        exit;
    }    
}