<?php
require_once 'dbconnect.php';
$input = file_get_contents('php://input');
$data = json_decode($input, TRUE);
$sections = $data['sections'];
$formInfo = $data['formDescr'];

$version_id = saveVersion($formInfo);
foreach ($sections as $section) {

    $section_id = saveSections($section, $version_id);
    foreach ($section['inputs'] as $input) {
        saveInput($input, $section_id);
    }
}


function saveVersion($formDescr)
{
    $version_values = array('formName' => $formDescr['formName']);

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

    closeAvailability($version_values['availableFrom'], $version_values['availableTo']);
    dibi::query('INSERT INTO [version]', $version_values);
    $version_id = dibi::insertId();
    return $version_id;
}

;

function saveSections($section, $version_id)
{
    $values['label'] = "";

    if (isset($section['label'])) {
        $values['label'] = $section['label'];
    }

    dibi::query('INSERT INTO [section]', $values);
    $section_id = dibi::insertId();

    $section_version_values = array(
        'section_id' => $section_id,
        'version_id' => $version_id,
        'order' => $section['index']
    );

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

    $input_version_values = array(
        'input_id' => $input_id,
        'section_id' => $section_id,
        'order' => $input['position']
    );

    dibi::query('INSERT INTO [version_input]', $input_version_values);

}


function closeAvailability($newDateFrom, $newDateTo)
{
    $oldVersions_tmp = dibi::query("SELECT [availableFrom],[availableTo],[id] FROM [version] WHERE ([availableTo]>%t", strtotime($newDateFrom), "AND [availableFrom]<%t)", strtotime($newDateTo), "OR ([availableTo]=%i", 0, "AND [availableFrom]<%t)", strtotime($newDateTo));
    $oldVersions = $oldVersions_tmp->fetchAll();

    foreach ($oldVersions as $version) {
        $insert = array();
        if (strtotime($version['availableFrom']) >= strtotime($newDateFrom) and strtotime($version['availableTo']) >= strtotime($newDateTo)) {
            $insert = array(
                'availableFrom' => $newDateTo
            );
        } elseif (strtotime($version['availableFrom']) >= strtotime($newDateFrom) and strtotime($version['availableTo']) < strtotime($newDateTo)) {
            $insert = array('availableTo' => $newDateFrom);
            $insert['availableFrom'] = $newDateFrom;
        } elseif (strtotime($version['availableFrom']) < strtotime($newDateFrom)) {
            $insert['availableTo'] = $newDateFrom;
        }
        dibi::query("UPDATE [version] SET", $insert, "WHERE [id]=%i", $version['id']);
    }
}

echo $version_id;