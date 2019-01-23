<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
require_once 'logbook/vendor/dibi/dibi.min.php';
dibi::connect(array(
    'driver' => 'mysql',
    'host' => '***',
    'username' => '***',
    'password' => '**',
    'database' => '***',
    'charset' => 'utf8',
));
if (isset($_POST['secret']) && $_POST['secret'] === '***') {
    $filename = $_FILES['file_contents']['name'];
    $tmpfile = $_FILES['file_contents']['tmp_name'];
    move_uploaded_file($tmpfile, '/***/' . $filename);
    dibi::query('UPDATE seq_docs SET id = LAST_INSERT_ID(id+1)');
    $id = dibi::insertId();
    $data = [
        'docID' => $id,
        'time%sql' => 'NOW()',
        'title' => $filename,
        'dirID' => 202,
        'oldname' => $filename,
        'filename' => $filename,
        'shiftid' => dibi::fetchSingle('SELECT MAX(shiftid) FROM tb_shift')
    ];
    dibi::query('INSERT INTO tb_docs', $data);
}
?>