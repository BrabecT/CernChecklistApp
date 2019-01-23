<?php
require_once '../vendor/mpdf/mpdf/mpdf.php';
$input = file_get_contents('php://input');
$data = json_decode($input, TRUE);
$sections = $data['sections'];
$inputData = $data['data'];
$formInfo = $data['formInfo'];

$date = date("Y");
$mpdf = new mPDF();
$mpdf->shrink_tables_to_fit = 1;
$stylesheet = file_get_contents('../css/renderPdf.css');

$mpdf->WriteHTML($stylesheet, 1);

// Write some HTML code:
$html_header =
    "
    <div class='center'>
        <h1>COMPASS Checklist $date</h1> 
        <h4>To be performed once per shift approximately four hours after the shift start.</h4>
       <div style='text-align: center; width: 100%;' class='row'>
            <div style='width: 45%; float:left;'>
                <h3>Date: " . $formInfo['date'] . "</h3>
            </div>
            <div style='width: 45%; float: right'>
                <h3>Shift type: " . $formInfo['shiftType'] . "</h3>
            </div>
        </div>
        <div style='width: 100%;'>
           <h3> Performed by: " . $formInfo['shiftleader'] . "</h3>
        </div>
    </div>
    ";

$mpdf->WriteHTML($html_header, 2);
$mpdf->WriteHTML("
    <table class='table-bordered'>
            <thead>
                <tr>
                    <th><h3>Form</h3></th>
                </tr>
            </thead>
            <tbody>         
    ", 2);
if($sections != null || $sections != '') {
    foreach ($sections as $section) {
        $html_row_start = "<tr><td>";
        $mpdf->WriteHTML($html_row_start, 2);

        if ($section['label'] != "") {
            $html_section_label = "<span class='section-label'>" . $section['label'] . "</span><br />";
            $mpdf->WriteHTML($html_section_label, 2);
        }
        $mpdf->WriteHTML("<table class='table-inner-bordered'>", 2);

        foreach ($section['inputs'] as $input) {
            $inputId = $input['id'];
            if ($input['inputType'] == 'plainText') {
                $mpdf->WriteHTML("<tr><td style='width: 120mm' colspan='2'>", 2);
            } else {
                $mpdf->WriteHTML("<tr><td style='width: 120mm'>", 2);
            }
            $html_input = "";
            $input_value_error = false;
            $html_input_label = "<b>" . $input['inputLabel'] . "</b>: ";

            $html_input_text = $input['inputText'] . "<br />";
            $html_input .= $html_input_label . $html_input_text;
            if (isset($input['minValue'])) {
                $html_input_minValue = "Minimal value: " . $input['minValue'] . "&nbsp;&nbsp;&nbsp;&nbsp;";
                $html_input .= $html_input_minValue;
                if ($inputData[$inputId] < $input['minValue']) {
                    $input_value_error = true;
                }
            }
            if (isset($input['maxValue'])) {
                $html_input_maxValue = " Maximal value: " . $input['maxValue'] . "<br />";
                $html_input .= $html_input_maxValue;
                if ($inputData[$inputId] > $input['maxValue']) {
                    $input_value_error = true;
                }
            }

            $mpdf->WriteHTML($html_input . "</td>", 2);


            $html_input_value = '';
            switch ($input['inputType']) {
                case 'text':
                    if (isset($inputData[$inputId])) {
                        $html_input_value = "<td class='right-col-text'>" . $inputData[$inputId] . "</td>";
                    } else {
                        $html_input_value = "<td class='right-col-text-error'>No Text</td>";
                    }
                    break;
                case 'plainText':
                    break;
                case 'checkbox':
                    if ($inputData[$inputId] == 1) {
                        $html_input_value = "<td class='right-col-checkbox'><input type='checkbox' class='checkbox' checked='checked' disabled='disabled'></td>";
                    } else {
                        $html_input_value = "<td class='right-col-checkbox'><input type='checkbox' class='checkbox' disabled='disabled'></td>";
                    }
                    break;
                case 'number':
                    if (isset($inputData[$inputId])) {
                        if ($input_value_error) {
                            $html_input_value = "<td class='right-col-number-error'>" . $inputData[$inputId] . "</td>";
                        } else {
                            $html_input_value = "<td class='right-col-number'>" . $inputData[$inputId] . "</td>";
                        }
                    } else {
                        $html_input_value = "<td class='right-col-number-error'>No value</td>";
                    }
                    break;
                default:
                    $html_input_value = "<td class='right-col-number'>No input data</td>";
                    break;
            }
            $mpdf->WriteHTML($html_input_value, 2);
            $mpdf->WriteHTML("</tr>", 2);
        }

        $mpdf->WriteHTML("</table>", 2);
        $html_row_end = "</td></tr>";
        $mpdf->WriteHTML($html_row_end, 2);
    }
}

$mpdf->WriteHTML("</tbody></table>", 2);
$checkboxInfo = "<div class='checkbox-info'>Checked: <input type='checkbox' class='checkbox' checked='checked' disabled='disabled'>
&nbsp;&nbsp;&nbsp;&nbsp;Unchecked: <input type='checkbox' class='checkbox' disabled='disabled'></div>";
//$mpdf->WriteHTML($checkboxInfo,2);
// Output a PDF file directly to the browser
$dir = dirname(__DIR__) . '/output/';
$name = 'Checklist-' . $formInfo['date'] . '_' . $formInfo['shiftType'] . '_' . date('U') . '.pdf';
try {
    $mpdf->Output($dir . $name);
    // send file to logbook
    $post = array(
        'secret' => '***',
        'file_contents' => '@' . $dir . $name
    );
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, '***');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
    $result = curl_exec($ch);
    curl_close($ch);
    echo json_encode(array('status' => 'OK', 'file' => $name, 'message' => 'PDF was rendered'));
} catch (MpdfException $e) {
    echo json_encode(array('status' => 'ERROR', 'message' => $e->getMessage()));
}