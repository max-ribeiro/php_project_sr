<?php
session_start();
require_once(__DIR__ . '/../../config.php');
require_once(_DIR_HOME_ . 'db.php');
require_once(_DIR_HOME_ . 'api/v1/RestApi.php');

// Set JSON content type for all responses
header('Content-Type: application/json; charset=utf-8');

// Function to output JSON and exit
function outputJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// Function to handle exceptions as JSON
function catchException($e) {
    $error = [
        'error' => true,
        'message' => $e->getMessage(),
        'code' => $e->getCode() ?: 500
    ];
    outputJson($error, 500);
}

try {
    $class = $_REQUEST['_class'] ?? null;
    $className = $_REQUEST['_className'] ?? '';
    $method = $_REQUEST['_method'] ?? null;
    $devMode = isset($_REQUEST['_dev_mode']);

    if (empty($class) || empty($method)) {
        throw new InvalidArgumentException('Os parâmetros "_class" e "_method" são obrigatórios');
    }

    // https://stackoverflow.com/a/2792045/8037810
    function dashesToCamelCase($string, $capitalizeFirstCharacter = false) {
        $str = str_replace('-', '', ucwords($string, '-'));
        if (!$capitalizeFirstCharacter) {
            $str = lcfirst($str);
        }
        return $str;
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

    $refMethod = $ref->getMethod($method);
    $result = $refMethod->invoke($instance);

    if ($ref->hasMethod('__after')) {
        $refMethod = $ref->getMethod('__after');
        $refMethod->invoke($instance, $method);
    }

    // Output response (assuming httpResponse collects data)
    if ($ref->hasMethod('httpResponse')) {
        $refMethod = $ref->getMethod('httpResponse');
        $response = $refMethod->invoke($instance, true, $devMode);
        outputJson($response);
    } else {
        outputJson(['data' => $result]);
    }

} catch (InvalidArgumentException $e) {
    catchException($e);
} catch (RestApiException $e) {
    catchException($e);
} catch (Exception $e) {
    catchException($e);
}