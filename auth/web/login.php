<?php
session_start();

require_once(__DIR__ . '/../../config.php');
require_once(_DIR_HOME_ . 'http/Response.php');
require_once(_DIR_HOME_ . 'auth/JWTAuth.php');

$maxTentativas = 3;       // limite de tentativas
$tempoBloqueio = 300;     // tempo de bloqueio em segundos (5 min)

try {
    // Inicializa controle de tentativas
    if (!isset($_SESSION['tentativas'])) {
        $_SESSION['tentativas'] = 0;
        $_SESSION['primeiraTentativa'] = time();
    }

    // Verifica bloqueio
    if ($_SESSION['tentativas'] >= $maxTentativas) {
        $tempoPassado = time() - $_SESSION['primeiraTentativa'];

        if ($tempoPassado < $tempoBloqueio) {
            // Ainda dentro do bloqueio → não deixa logar
            $_SESSION['error'] = 'Você excedeu o limite de tentativas. Tente novamente em '. ($tempoBloqueio - $tempoPassado) . ' segundos.';
            header('Location:' . _URL_HOME_);
            exit;
        } else {
            // Já passou o tempo de bloqueio reset
            $_SESSION['tentativas'] = 0;
            $_SESSION['primeiraTentativa'] = time();
        }
    }

    // Validação login/senha
    if (empty($_REQUEST['login']) || empty($_REQUEST['senha'])) {
        $_SESSION['tentativas']++;
        $_SESSION['error'] = 'Nome de usuário ou senha incorretos. Tentativa '. $_SESSION['tentativas'] . ' de ' . $maxTentativas;
        header('Location:' . _URL_HOME_);
        exit;
    }

    $token = JWTAuth::authenticate($_REQUEST);
    if (empty($token)) {
        $_SESSION['tentativas']++;
        $_SESSION['error'] = 'Nome de usuário ou senha incorretos. Tentativa '. $_SESSION['tentativas'] . ' de ' . $maxTentativas;
        header('Location:' . _URL_HOME_);
        exit;
    }

    // Se passou no login → reseta tentativas
    $_SESSION['user'] = $_REQUEST['login'];
    $_SESSION['tentativas'] = 0;
    $_SESSION['primeiraTentativa'] = time();
    $_SESSION['token'] = $token;

    header('Location:' . _URL_HOME_ . 'cidadao/index.php');
    exit;

} catch (\Exception $e) {
    $_SESSION['error'] = 'Erro ao efetuar login. Tente novamente mais tarde.';
    header('Location:' . _URL_HOME_);
    exit;
}
