<?php
require_once 'dbconnect.php';
$input = file_get_contents('php://input');
$data = json_decode($input, TRUE);
$sections = $data['sections'];
$formDescr = $data['formDescr'];
$version_id = $formDescr['id'];

updateVersion($formDescr);

foreach ($sections as $section) {
    if (isset($section['id'])) {
        $section_id = $section['id'];
        updateSections($section, $section_id);
    } else {
        $section_id = saveSections($section, $version_id);
    }

    foreach ($section['inputs'] as $input) {
        if (isset($input['id'])) {
            $input_id = $input['id'];
            updateInput($input, $input_id);
        } else {
            saveInput($input, $section_id);
        }
    }
}

function updateVersion($formDescr)
{
    $version_values = ['formName' => $formDescr['formName']];

    if (isset($formDescr['formDescr'])) {
        $version_values['formText'] = $formDescr['formDescr'];
    }

    if (isset($formDescr['dateFrom'])) {
        $version_values['availableFrom'] = $formDescr['dateFrom'];
    } else {
        $version_values['availableFrom'] = date("Y-m-d");
    }

    if (isset($formDescr['dateTo'])) {
        $version_values['availableTo'] = $formDescr['dateTo'];
    }

    closeAvailability($version_values['availableFrom']);
    dibi::query('UPDATE [version] SET', $version_values, 'WHERE [id]=%i', $formDescr['id']);
}

;

function updateSections($section, $section_id)
{
    $values = array();
    $values['label'] = "";

    if (isset($section['label'])) {
        $values['label'] = $section['label'];
    }

    dibi::query('UPDATE[section] SET', $values, 'WHERE [id]=%i', $section_id);
}

function updateInput($input, $input_id)
{
    $values = array();
    if (isset($input['section'])) {
        $values['section'] = $input['section'];
    }
    if (isset($input['inputLabel'])) {
        $values['inputLabel'] = $input['inputLabel'];
    }
    if (isset($input['inputType'])) {
        $values['inputType'] = $input['inputType'];
    }
    if (isset($input['inputText'])) {
        $values['inputText'] = $input['inputText'];
    }
    if (isset($input['minValue'])) {
        $values['min_Value'] = $input['minValue'];
    }
    if (isset($input['maxValue'])) {
        $values['max_Value'] = $input['maxValue'];
    }
    dibi::query('UPDATE [input] SET', $values, 'WHERE [id]=%i', $input_id);
}

function saveSections($section, $version_id)
{
    $values = array();
    $values['label'] = "";

    if (isset($section['label'])) {
        $values['label'] = $section['label'];
    }

    dibi::query('INSERT INTO [section]', $values);
    $section_id = dibi::insertId();

    $section_version_values = [
        'section_id' => $section_id,
        'version_id' => $version_id,
        'order' => $section['index']
    ];

    dibi::query('INSERT INTO [version_section]', $section_version_values);
    return $section_id;
}

function saveInput($input, $section_id)
{
    $values = array();
    if (isset($input['section'])) {
        $values['section'] = $input['section'];
    }
    if (isset($input['inputLabel'])) {
        $values['inputLabel'] = $input['inputLabel'];
    }
    if (isset($input['inputType'])) {
        $values['inputType'] = $input['inputType'];
    }
    if (isset($input['inputText'])) {
        $values['inputText'] = $input['inputText'];
    }
    if (isset($input['minValue'])) {
        $values['min_Value'] = $input['minValue'];
    }
    if (isset($input['maxValue'])) {
        $values['max_Value'] = $input['maxValue'];
    }
    dibi::query('INSERT INTO [input]', $values);
    $input_id = dibi::insertId();

    $input_version_values = [
        'input_id' => $input_id,
        'section_id' => $section_id,
        'order' => $input['position']
    ];

    dibi::query('INSERT INTO [version_input]', $input_version_values);

}

function closeAvailability($newDateFrom)
{
    $oldVersions_tmp = dibi::query("SELECT [availableFrom],[availableTo],[id] FROM [version] WHERE [availableTo]>%t", strtotime($newDateFrom), "OR [availableTo]=%i", 0);
    $oldVersions = $oldVersions_tmp->fetchAll();
    $insert = [
        'availableTo' => $newDateFrom
    ];
    foreach ($oldVersions as $version) {
        if (strtotime($version['availableFrom']) > strtotime($newDateFrom)) {
            $insert['availableFrom'] = $newDateFrom;
        }
        dibi::query("UPDATE [version] SET", $insert, "WHERE [id]=%i", $version['id']);
    }
}