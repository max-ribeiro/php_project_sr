<?php
session_start();
require_once(__DIR__ . '/../../config.php');
require_once(_DIR_HOME_ . 'db.php');
require_once(_DIR_HOME_ . 'api/v1/RestApi.php');

header('Content-Type: text/html; charset=utf-8');

$class = $_REQUEST['_class'];
$className = $_REQUEST['_className'];
$method = $_REQUEST['_method'];
$devMode = isset($_REQUEST['_dev_mode']);

if (empty($class) || empty($method)) {
    throw new InvalidArgumentException('Os parâmetros "_class" e "_method" são obrigatórios');
}

// https://stackoverflow.com/a/2792045/8037810
function dashesToCamelCase($string, $capitalizeFirstCharacter = false)
{
    $str = str_replace('-', '', ucwords($string, '-'));
    if (!$capitalizeFirstCharacter) {
        $str = lcfirst($str);
    }

    return $str;
}

function catchException($e)
{
    http_response_code(500);
    echo $e->getMessage();
}

if ($className == '') {
    $className = dashesToCamelCase($class, true) . 'RestApi';
} else {
    $className .= 'RestApi';
}

$method = dashesToCamelCase($method);

if (class_exists($className) === false) {
    require_once(_DIR_HOME_ . 'api/v1/' . $class . '/' . $className . '.php');
}

$ref = new ReflectionClass($className);
$refMethod = $ref->getMethod('createFromRequest');
$instance = $refMethod->invoke(null);

if ($ref->hasMethod($method) === false) {
    throw new InvalidArgumentException(sprintf(
        'O método "%s" não existe na classe "%s"',
        $method,
        $className
    ));
}

if ($ref->hasMethod('__security') === true) {
    $refMethod = $ref->getMethod('__security');
    $refMethod->invoke($instance);
}

if ($ref->hasMethod('__before') === true) {
    $refMethod = $ref->getMethod('__before');
    $refMethod->invoke($instance, $method);
}

try {
    $refMethod = $ref->getMethod($method);
    $refMethod->invoke($instance);

    if ($ref->hasMethod('__after') === true) {
        $refMethod = $ref->getMethod('__after');
        $refMethod->invoke($instance, $method);
    }

    $refMethod = $ref->getMethod('httpResponse');
    $refMethod->invoke($instance, true, $devMode);
} catch (InvalidArgumentException $e) {
    catchException($e);
} catch (RestApiException $e) {
    catchException($e);
}