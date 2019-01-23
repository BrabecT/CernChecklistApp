angular.module('checklistApp')
    .service('getFormDataService', getFormDataService);

function getFormDataService($http, $q) {
    function getLastForm() {
        var d = $q.defer();
        var phpData = {type: 0};
        $http.post("php/getForm.php", phpData).then(function (response) {
            var sections = [];
            if(angular.isDefined(response.data['sections'])) {
                angular.forEach(response.data['sections'], function (section) {
                    sections.push({inputs: [], label: section.label});
                })
            }
            if(angular.isDefined(response.data['inputs'])) {
                angular.forEach(response.data['inputs'], function (input) {
                    sections[input.section].inputs[input.order] =
                    {
                        id: input.id, inputType: input.inputType, inputLabel: input.inputLabel, inputText: input.inputText,
                        minValue: input.min_Value, maxValue: input.max_Value, inputSection: input.section, inputSectionOrder: input.order
                    };
                });
            }
            d.resolve(sections);
        }, function (response) {
            console.log("Last form was not loaded: ");
            console.log(response);
        });
        return d.promise;
    }

    function getForm(formId) {
        var d = $q.defer();
        var phpData = {type: 1, formId: formId};
        $http.post("php/getForm.php", phpData).then(function (response) {
            var sections = [], data=[];
            if(angular.isDefined(response.data['sections'])) {
                angular.forEach(response.data['sections'], function (section) {
                    sections.push({inputs: [], label: section.label, id: section.id});
                });
            }
            if(angular.isDefined(response.data['inputs'])) {
                angular.forEach(response.data['inputs'], function (input) {
                    sections[input.section].inputs[input.order] =
                    {
                        id: input.id, inputType: input.inputType, inputLabel: input.inputLabel, inputText: input.inputText,
                        minValue: input.min_Value, maxValue: input.max_Value
                    };
                });
            }
            if(angular.isDefined(response.data['formInfo'])) {
                data['formInfo'] = response.data['formInfo'];
            }
            data['sections'] = sections;
            d.resolve(data);
        }, function (response) {
            console.log("Form with id: " + formId + " was not loaded: ");
            console.log(response);
        });
        return d.promise;
    }

    function getAllVersions() {
        var d = $q.defer();
        var phpData = {type: 2};
        $http.post("php/getForm.php", phpData).then(function (response) {
            d.resolve(response.data);

        }, function (response) {
            console.log("Form versions were not loaded: ");
            console.log(response);

        });
        return d.promise;
    }

    return {
        getForm: getForm,
        getLastForm: getLastForm,
        getAllVersions: getAllVersions
    }
}