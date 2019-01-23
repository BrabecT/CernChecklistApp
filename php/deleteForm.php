<?php
require_once 'dbconnect.php';
$version_id = file_get_contents('php://input');

deleteVersion($version_id);

function deleteVersion($version_id){
    $sections_tmp = dibi::query("SELECT [section_id] FROM [version_section] WHERE [version_id]=%i", $version_id);
    $sections = $sections_tmp->fetchAll();

    $sections_id = array();
    foreach ($sections as $section){
        array_push($sections_id, $section['section_id']);
    }
    $sections_id = implode(',', $sections_id);

    if (!empty($sections_id)) {
        $inputs_tmp = dibi::query("SELECT [input_id] FROM [version_input]  WHERE [section_id] IN ($sections_id)");
        $inputs = $inputs_tmp->fetchAll();
        $inputs_id = array();
        foreach ($inputs as $input){
            array_push($inputs_id, $input['input_id']);
        }
        $inputs_id = implode(',', $inputs_id);
    }

    if($version_id!= null) {
        dibi::query("DELETE FROM [version_section] WHERE [version_id]=%i", $version_id);
    }
    if(!empty($sections_id)) {
        dibi::query("DELETE FROM [version_input] WHERE [section_id] IN ($sections_id)");
        dibi::query("DELETE FROM [section] WHERE [id] IN ($sections_id)");
    }
    if($version_id!= null) {
        dibi::query("DELETE FROM [version] WHERE [id]=%i", $version_id);
    }
    if(!empty($inputs_id)) {
        dibi::query("DELETE FROM [input] WHERE [id] IN ($inputs_id)");
    }
}