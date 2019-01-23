angular.module('checklistApp')
    .service('dialogService', dialogService);

dialogService.$inject = ['$mdDialog', '$http', '$filter', '$q'];

function dialogService($mdDialog, $http, $filter, $q) {
    function addSectionLabel(sections, sectionIndex) {
        $mdDialog.show({
            locals: {
                labelFill: sections[sectionIndex].label
            },
            controller: sectionDialogController,
            templateUrl: 'template/sectionLabel.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false
        })
            .then(function (data) {
                if (angular.isDefined(data)) {
                    if (angular.isDefined(data.newSectionLabel)) {
                        sections[sectionIndex].label = data.newSectionLabel;
                    }
                }
            }, function (response) {

            });
    }

    function editInput(ev, sectionIndex, inputIndex, sections) {
        var selectOptions = [
            {type: 'text', value: 'text'},
            {type: 'number', value: 'number'},
            {type: 'checkbox', value: 'checkbox'},
            {type: 'plainText', value: 'plain text'}];
        $mdDialog.show({
            locals: {
                selectOptions: selectOptions,
                inputTypeFill: sections[sectionIndex].inputs[inputIndex].inputType,
                inputTextFill: sections[sectionIndex].inputs[inputIndex].inputText,
                inputLabelFill: sections[sectionIndex].inputs[inputIndex].inputLabel,
                inputMinValueFill: sections[sectionIndex].inputs[inputIndex].minValue,
                inputMaxValueFill: sections[sectionIndex].inputs[inputIndex].maxValue
            },
            controller: inputDialogController,
            templateUrl: 'template/newInput.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false
        })
            .then(function (data) {
                if (angular.isDefined(data)) {
                    if (angular.isDefined(data.newInputType)) {
                        sections[sectionIndex].inputs[inputIndex].inputType = data.newInputType
                    }
                    if (angular.isDefined(data.newInputText)) {
                        sections[sectionIndex].inputs[inputIndex].inputText = data.newInputText;
                    }
                    if (angular.isDefined(data.newInputLabel)) {
                        sections[sectionIndex].inputs[inputIndex].inputLabel = data.newInputLabel;
                    }
                    if (angular.isDefined(data.newMinValue)) {
                        if (data.newMinValue == "" || data.newMinValue == null) {
                            sections[sectionIndex].inputs[inputIndex].minValue = undefined;
                        } else {
                            sections[sectionIndex].inputs[inputIndex].minValue = data.newMinValue;
                        }
                    }
                    if (angular.isDefined(data.newMaxValue)) {
                        if (data.newMaxValue == "" || data.newMaxValue == null) {
                            sections[sectionIndex].inputs[inputIndex].maxValue = undefined;
                        } else {
                            sections[sectionIndex].inputs[inputIndex].maxValue = data.newMaxValue;
                        }
                    }
                }
            }, function (response) {

            });
    }

    function saveForm(data) {
        var deferred = $q.defer();
        $mdDialog.show({
            locals: {},
            controller: confirmDialogController,
            templateUrl: 'template/confirmForm.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false
        })
            .then(function (formDescrData) {
                formDescrData.dateTo = $filter('date')(formDescrData.dateTo, 'yyyy-M-d');
                formDescrData.dateFrom = $filter('date')(formDescrData.dateFrom, 'yyyy-M-d');
                formDescrData.timeTo = $filter('date')(formDescrData.timeTo, 'H:00:00');
                formDescrData.timeFrom = $filter('date')(formDescrData.timeFrom, 'H:00:00');
                formDescrData.dateTo = formDescrData.dateTo + " " + formDescrData.timeTo;
                formDescrData.dateFrom = formDescrData.dateFrom + " " + formDescrData.timeFrom;

                var finalData = {'sections': data, 'formDescr': formDescrData};
                $http.post("php/saveForm.php", finalData)
                    .then(function (response) {
                        deferred.resolve(["Form saved.", "OK"]);
                    }, function (response) {
                        deferred.resolve(["Form not saved.", null]);
                        console.log(response);
                    });
            }, function () {
                deferred.resolve(["Form saving canceled.", null]);
            });
        return deferred.promise;
    }

    function updateForm(sections, formInfo) {
        var deferred = $q.defer();
        if (angular.isDefined(formInfo)) {
            if (angular.isDefined(formInfo.availableFrom)) {
                var a = formInfo.availableFrom.date.split(" ");
                formInfo['dateFrom'] = new Date(a[0]);
                formInfo['timeFrom'] = new Date(new Date().toDateString() + ' ' + a[1]);
            }
            if (formInfo.availableTo !== null) {
                var a = formInfo.availableTo.date.split(" ");
                formInfo['dateTo'] = new Date(a[0]);
                formInfo['timeTo'] = new Date(new Date().toDateString() + ' ' + a[1]);
            }
            formInfo['formDescr'] = formInfo['formText'];
        }
        $mdDialog.show({
            locals: {
                formFill: formInfo
            },
            controller: updateDialogController,
            templateUrl: 'template/confirmForm.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false
        })
            .then(function (formDescrData) {
                formDescrData.dateTo = $filter('date')(formDescrData.dateTo, 'yyyy-M-d');
                formDescrData.dateFrom = $filter('date')(formDescrData.dateFrom, 'yyyy-M-d');
                formDescrData.timeTo = $filter('date')(formDescrData.timeTo, 'H:00:00');
                formDescrData.timeFrom = $filter('date')(formDescrData.timeFrom, 'H:00:00');
                formDescrData.dateTo = formDescrData.dateTo + " " + formDescrData.timeTo;
                formDescrData.dateFrom = formDescrData.dateFrom + " " + formDescrData.timeFrom;

                var finalData = {'sections': sections, 'formDescr': formDescrData};
                var version_id = formDescrData['id'];
                $http.post("php/deleteForm.php", version_id)
                    .then(function () {
                        $http.post("php/saveForm.php", finalData)
                            .then(function (response) {
                                deferred.resolve(["Form updated.", response.data]);
                            }, function (response) {
                                deferred.resolve(["Form not updated.", null]);
                                console.log(response);
                            });
                    }, function (response) {
                        deferred.resolve(["Form not updated.", null]);
                        console.log(response);
                    });
            }, function () {
                deferred.resolve(["Form updating canceled.", null]);
            });
        return deferred.promise;
    }

    function deleteForm(form_Id) {
        var deferred = $q.defer();
        $mdDialog.show({
            locals: {},
            controller: deleteDialogController,
            templateUrl: 'template/deleteForm.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false
        })
            .then(function (confirm) {
                if (confirm) {
                    $http.post("php/deleteForm.php", form_Id)
                        .then(function () {
                            deferred.resolve(["Form deleted.", "OK"]);
                        }, function (response) {
                            deferred.resolve(["Form not deleted.", null]);
                            console.log(response);
                        })
                }
            }, function () {
                deferred.resolve(["Form deleting canceled.", null]);
            });
        return deferred.promise;
    }

    function printPdfServ(sections, data) {
        var deferred = $q.defer();
        $mdDialog.show({
            locals: {

                },
            controller: printPdfServController,
            templateUrl: 'template/printPdf.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: false
        })
            .then(function (response) {
                response.date = moment(response.date).format('YYYY-MM-DD');
                $http.post('php/renderPdf.php', {sections: sections, data: data, formInfo: response})
                    .then(function (output) {
                        localStorage.removeItem('offlineForm');
                        localStorage.removeItem('offlineData');
                        deferred.resolve(output);
                    }), function () {
                    deferred.resolve({data:{status: 'ERROR', message:'Pdf was not rendered.'}});
                };
            }, function () {
                deferred.resolve({data:{status: 'ERROR', message:'Printing form canceled.'}});
            });
        return deferred.promise;
    }

    function printPdfServController($scope, $mdDialog, $rootScope) {
        var date = new Date();
        var time_block = Math.floor(date.getHours() / 8);
        var shiftType = '';
        switch (time_block){
            case 0:
                shiftType = 'night';
                break;
            case 1:
                shiftType = 'day';
                break;
            case 2:
                shiftType = 'evening';
                break;
        }
        $scope.data = {
            shiftType: shiftType,
            date: date,
            shiftleader: $rootScope.fullName
        };
        $scope.shifts = [
            {type: 'night', label: 'Night'},
            {type: 'day', label: 'Day'},
            {type: 'evening', label: 'Evening'}
        ];
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.save = function (data) {
            $mdDialog.hide(data);
        };
    }

    function inputDialogController($scope, $mdDialog, selectOptions, inputTypeFill, inputTextFill, inputLabelFill, inputMinValueFill, inputMaxValueFill) {
        $scope.selectOptions = selectOptions;
        $scope.inputTypeFill = inputTypeFill;
        $scope.inputTextFill = inputTextFill;
        $scope.inputLabelFill = inputLabelFill;
        $scope.inputMinValueFill = inputMinValueFill;
        $scope.inputMaxValueFill = inputMaxValueFill;
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.save = function (data) {
            $mdDialog.hide(data);
        };
    }

    function sectionDialogController($scope, $mdDialog, labelFill) {
        $scope.labelFill = labelFill;

        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.save = function (data) {
            $mdDialog.hide(data);
        };
    }

    function confirmDialogController($scope, $mdDialog, $window) {
        $scope.showAvailability = true;
        $scope.form = {};
        $scope.form.dateFrom = new Date();
        $scope.form.timeFrom = new Date('00');
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.save = function (data) {
            $mdDialog.hide(data);
        };
    }

    function updateDialogController($scope, $mdDialog, formFill) {
        $scope.showAvailability = true;
        $scope.form = formFill;
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.save = function (data) {
            $mdDialog.hide(data);
        };
    }

    function deleteDialogController($scope, $mdDialog) {
        $scope.confirm = false;
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.save = function (data) {
            $mdDialog.hide(data);
        };
    }

    return {
        addSectionLabel: addSectionLabel,
        editInput: editInput,
        saveForm: saveForm,
        printPdfServ: printPdfServ,
        updateForm: updateForm,
        deleteForm: deleteForm
    }
}