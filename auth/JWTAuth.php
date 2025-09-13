<?php

require_once(__DIR__ . '/../config.php');
require_once(_DIR_HOME_ . 'db.php');
require_once(_DIR_HOME_ . 'api/v1/DatabaseConnector.php');
require_once(_DIR_HOME_ . 'functions.php');

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
     */
    public static function generateToken($data) {
        $now = new DateTimeImmutable('now', new DateTimeZone('UTC'));

        $key = _JTW_SECRET_;
        $payload = [
            'iss' => $data['login'],
            'iat' => $now->getTimestamp(),
            'exp' => $now->modify('+1 hour')->getTimestamp()
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

        $decoded = JWT::decode($jwt, new Key($key, 'HS256'));
        print_r($decoded);

        // Pass a stdClass in as the third parameter to get the decoded header values
        $headers = new stdClass();
        $decoded = JWT::decode($jwt, new Key($key, 'HS256'), $headers);
        print_r($headers);

        /*
        NOTE: This will now be an object instead of an associative array. To get
        an associative array, you will need to cast it as such:
        */

        $decoded_array = (array) $decoded;

        /**
         * You can add a leeway to account for when there is a clock skew times between
         * the signing and verifying servers. It is recommended that this leeway should
         * not be bigger than a few minutes.
         *
         * Source: http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#nbfDef
         */
        JWT::$leeway = 60; // $leeway in seconds
        $decoded = JWT::decode($jwt, new Key($key, 'HS256'));
    }
}