<?php
session_start();

/**
 * Define variaveis relacionadas aos paths do sistema
 */
if (!defined('_URL_HOME_')) {
    define('_DIR_HOME_', __DIR__ . '/');
    if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === "off") {
        define('_URL_HOME_', 'http://' . $_SERVER['HTTP_HOST'] . '/');
    } else {
        define('_URL_HOME_', 'https://' . $_SERVER['HTTP_HOST'] . '/');
    }

    define('_DIR_CLASSES_', _DIR_HOME_ . 'classes/');
}