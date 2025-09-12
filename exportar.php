<?php
require_once(__DIR__ . '/config.php');
require_once('./db.php');
require_once(_DIR_HOME_ . 'functions.php');
require_once(_DIR_HOME_ . 'classes/ConnectionInfo.php');
require_once(_DIR_HOME_ . 'api/v1/DatabaseConnector.php');

$filename = $_REQUEST['arquivo'] . '.xls';
$download = filter_var($_REQUEST['download'], FILTER_VALIDATE_BOOLEAN);

$filePath = sys_get_temp_dir() . '\\' . $filename;

if (!is_file($filePath)) {
    die(utf8_decode("Arquivo não encontrado."));
}

header('Content-Description: File Transfer');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header("Content-Type:   application/vnd.ms-excel; charset=utf-8");
header("Content-type:   application/x-msexcel; charset=utf-8");
header('Content-Transfer-Encoding: binary');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Pragma: public');
header('Expires: 0');
echo file_get_contents($filePath);
die();