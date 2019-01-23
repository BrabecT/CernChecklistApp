<?php
session_start();
$input = file_get_contents('php://input');
$case = json_decode($input, TRUE);
if ($case['data'] == 'getAuthorization') {
    $egroups = explode(';', $_SERVER['***']);
    if (in_array('***', $egroups)) {
        $_SESSION['user_role'] = 'admin';
    } else {
        $_SESSION['user_role'] = 'user';
    }
    echo($_SESSION['user_role']);

} else if ($case['data'] == 'getFullName'){
    if(isset($_SERVER['**'])) {
        $_SESSION['fullName'] = $_SERVER['**'];
    } else {
        $_SESSION['fullName'] = '';
    }
    echo($_SESSION['fullName']);
}