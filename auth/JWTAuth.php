<?php

require_once(__DIR__ . '/../config.php');
require_once(_DIR_HOME_ . 'db.php');
require_once(_DIR_HOME_ . 'api/v1/DatabaseConnector.php');
require_once(_DIR_HOME_ . 'functions.php');

use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTAuth {
    protected $db = null;

    public static function authenticate($data) {
        $connection = ConnectionInfo::getConnection();
        $db = DatabaseConnector::getInstance();

        $login = filter_var($data['login']);
        $password = md5(filter_var($data['senha']));

        $sql = "SELECT id_usuario FROM usuarios
                    WHERE username = ? AND senha_hash = ? ;
        ";

        $sql = sqlBindParams($sql, compact('login', 'password'));

        $result = $db->query($sql)->fetchArray();
        if(empty($result)) {
            return '';
        }
    
        return self::generateToken($data); 
    }
    /**
     * Gera o token JWT
     *
     * @return string
     * @todo adicionar um refresh token para gerar novo token apóes expiração do token do cliente
     */
    public static function generateToken($data) {
        $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));

        $key = _JTW_SECRET_;
        $payload = [
            'iss' => $data['login'],
            'iat' => $now->getTimestamp(),
            'exp' => $now->modify('+2 hour')->getTimestamp()
        ];

        /**
         * IMPORTANT:
         * You must specify supported algorithms for your application. See
         * https://tools.ietf.org/html/draft-ietf-jose-json-web-algorithms-40
         * for a list of spec-compliant algorithms.
         */
        $jwt = JWT::encode($payload, $key, 'HS256');

        return $jwt;
    }

    public static function validate($jwt) {
        $key = _JTW_SECRET_;

        try {
            $decoded = JWT::decode($jwt, new Key($key, 'HS256'));
            return [
                'valid' => true,
                'payload' => $decoded
            ];
        } catch (ExpiredException $e) {
            return [
                'valid' => false,
                'error' => 'Token expirado',
                'code' => 401 
            ];
        } catch (\Exception $e) {
            return [
                'valid' => false,
                'error' => 'Token inválido',
                'code' => 500 
            ];
        }
    }
}