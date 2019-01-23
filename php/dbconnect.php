<?php
require_once "../vendor/autoload.php";
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    dibi::connect(array(
        'driver' => 'mysql',
        'host' => '***',
        'port' => 000,
        'username' => '***',
        'password' => '***',
        'database' => '***',
        'charset' => 'utf8',
    ));
} catch (DibiException $e) {
    echo $e->getMessage();
}

// /data/www/html/runLogbook/binfiles/docfiles

