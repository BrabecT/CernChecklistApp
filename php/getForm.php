<?php
require_once 'dbconnect.php';
$input = file_get_contents('php://input');
$data = json_decode($input, TRUE);
$type = $data['type'];

switch ($type){
    case 0: // nacteni posledniho formulare
        loadLastForm();
        break;
    case 1: // nacteni formulare podle verze
        loadForm($data['formId']);
        break;
    case 2: // nacteni vsech verzi
        loadAllVersions();
        break;
}

function loadLastForm()
{
    $today = date("Y-m-d H:00:00");
    $version_id_tmp = dibi::query("SELECT [id] FROM [version] WHERE ([availableFrom]<=%t", $today, "AND [availableTo]>%t", $today, ") OR ([availableFrom]<=%t", $today, "AND [availableTo]=%i", 0, ")");
    $version_id = $version_id_tmp->fetch();

    $sections_tmp = dibi::query("SELECT [order],[label],[instructions],[section_id] FROM [version_section] JOIN [section] ON [id]=[section_id] WHERE [version_id]=%i", $version_id);
    $sections = $sections_tmp->fetchAll();
    $result = array('form_id' => $version_id['id'], 'sections' => $sections);

    $section_ids = array();
    foreach ($sections as $section) {
        array_push($section_ids, $section['section_id']);
    }
    if (!empty($section_ids)) {
        $section_ids = implode(',', $section_ids);
        $inputs_tmp = dibi::query("SELECT [order],[section],[id], [inputType],[inputText],[inputLabel],[min_Value],[max_Value] FROM [version_input] JOIN [input] ON [id]=[input_id] WHERE [section_id] IN ($section_ids)");
        $inputs = $inputs_tmp->fetchAll();
        $result['inputs'] = $inputs;
    }
    echo json_encode($result);
}

function loadAllVersions() {
    $result = dibi::query("SELECT * FROM [version]");
    $data = $result->fetchAll();
    echo json_encode($data);
}

function loadForm($version_id) {
    $formInfo_tmp = dibi::query("SELECT [id],[formName],[formText],[availableFrom],[availableTo] FROM [version] WHERE [id]=%i", $version_id);
    $formInfo = $formInfo_tmp->fetch();


    $sections_tmp = dibi::query("SELECT [id],[order],[label],[instructions],[section_id] FROM [version_section] JOIN [section] ON [id]=[section_id] WHERE [version_id]=%i", $version_id);
    $sections = $sections_tmp->fetchAll();


    $section_ids = array();
    foreach ($sections as $section) {
        array_push($section_ids, $section['section_id']);
    }

    $inputs = array();
    if (!empty($section_ids)) {
        $section_ids = implode(',', $section_ids);


        $inputs_tmp = dibi::query("SELECT [id],[order],[section], [inputType],[inputText],[inputLabel],[min_Value],[max_Value] FROM [version_input] JOIN [input] ON [id]=[input_id] WHERE [section_id] IN ($section_ids)");
        $inputs = $inputs_tmp->fetchAll();
    }
    $result = array('sections' => $sections, 'inputs' => $inputs, 'formInfo' => $formInfo);

    echo json_encode($result);
}