angular.module('checklistApp')
    .controller('adminController', ['$scope', 'dialogService', 'getFormDataService', '$state', '$filter', '$timeout',
    function ($scope, dialogService, getFormDataService, $state, $filter) {
        $scope.date = new Date();
        /* Section index is used when accessing exact section */
        $scope.sectionIndex = 0;
        /* Sub page navigation */
        $scope.currentNavItem = 'navItemCreate';
        $state.go('admin.formCreate');
        $scope.alertMessageShow = false;
        $scope.laddaSave = false;
        $scope.laddaUpdate = false;
        $scope.laddaDelete = false;

        $scope.pokus = "<?php echo $_SESSION['fullname'];?>";

        /*Add label to section*/
        $scope.addSectionLabel = function (index) {
            dialogService.addSectionLabel($scope.sections, index);
        };

        /* Object sections contains entire form, first section is pre-created */
        $scope.sections = [

        ];

        /* Function for adding new section to form, function reindex is called */
        $scope.addSection = function () {
            $scope.sectionIndex++;
            $scope.sections.push({index: $scope.sectionIndex, inputs: [], selected: false});
            $scope.reindex();

        };

        /* Function for adding new input into exact section (sectionIndex), function reindex is called first, object option is cleared at the end */
        $scope.addInput = function (sectionIndex) {
            $scope.reindex();
            $scope.sections[sectionIndex].inputs.push({
                inputType: "",
                inputText: "",
                inputLabel: "",
                minValue: undefined,
                maxValue: undefined,
                selected: false
            });
            $scope.editInput(undefined, sectionIndex, ($scope.sections[sectionIndex].inputs.length - 1));
        };

        function clear() {
            angular.forEach($scope.sections, function (section) {
                var newInputs = [];
                angular.forEach(section.inputs, function (input) {
                    if(input.inputType!=="" && input.inputType!==undefined){
                        newInputs.push(input);
                    }
                });
                section.inputs = newInputs;
            });
        }

        $scope.editInput = function (ev, sectionIndex, inputIndex) {
            $scope.reindex();
            dialogService.editInput(ev, sectionIndex, inputIndex, $scope.sections)
        };

        /* This function assigns new indexes to sections in order to all indexes were related 0,1,2,3 ...  */
        $scope.reindex = function () {
            var newIndex = 0;
            angular.forEach($scope.sections, function (section) {
                section.index = newIndex;
                newIndex++;
            });
        };

        $scope.removeInput = function (sectionIndex, inputIndex) {
            $scope.sections[sectionIndex].inputs.splice(inputIndex, 1);
        };

        $scope.saveAdminFormToDb = function () {
            $scope.alertMessageShow = false;
            $scope.laddaSave = true;
            clear();
            angular.forEach($scope.sections, function (section) {
                angular.forEach(section.inputs, function (input, index) {
                    input["position"] =  index;
                    input["section"] =  section.index;
                });
            });
            dialogService.saveForm($scope.sections)
            .then(function (response) {
                    $scope.alertMessage = response[0];
                    $scope.alertMessageShow = true;
                    $scope.laddaSave = false;
                    if(response[1] != null) {
                        $scope.sections = [];
                        $scope.formInfo = null;
                    }
                }), function (response) {
                   console.log(response);
            };
        };

        $scope.deleteSection = function (index) {
            $scope.sections.splice(index, 1);
            $scope.reindex();
        };

        $scope.loadForm = function (formId) {
            $scope.alertMessageShow = false;
            getFormDataService.getForm(formId).then(function (response) {
                $state.go('admin.formCreate');
                $scope.sections = response['sections'];
                $scope.formInfo = response['formInfo'];
                $scope.reindex();
                $scope.currentNavItem = 'navItemCreate';
            });
        };

        $scope.updateForm = function () {
            $scope.alertMessageShow = false;
            clear();
            $scope.laddaUpdate = true;
            angular.forEach($scope.sections, function (section) {
                angular.forEach(section.inputs, function (input, index) {
                    input["position"] =  index;
                    input["section"] =  section.index;
                });
            });
            dialogService.updateForm($scope.sections, $scope.formInfo)
                .then(function (response) {
                    $scope.alertMessage = response[0];
                    $scope.alertMessageShow = true;
                    $scope.laddaUpdate = false;
                    if(response[1] != null){
                        $scope.formInfo.id = response[1];
                        getFormDataService.getForm($scope.formInfo.id).then(function (response) {
                            console.log("here");
                            $scope.sections = response['sections'];
                            $scope.formInfo = response['formInfo'];
                            $scope.reindex();
                            $scope.currentNavItem = 'navItemCreate';
                        });
                    }
                }), function (response) {
                   console.log(response);
            };
        };

        $scope.deleteForm = function (form_id) {
            $scope.alertMessageShow = false;
            $scope.laddaDelete = true;
            dialogService.deleteForm(form_id)
                .then(function (response) {
                    $scope.alertMessage = response[0];
                    $scope.alertMessageShow = true;
                    $scope.laddaDelete = false;
                    if(response[1] == "OK") {
                        $scope.sections = [];
                        $scope.formInfo = null;
                    }
                }), function (response) {
                   console.log(response);
            };
        };


        $scope.loadVersions = function () {
            $scope.alertMessageShow = false;
            getFormDataService.getAllVersions().then(function (response) {
                $scope.forms = response;
                $scope.form = {};
                $scope.orderedForms = $filter('orderBy')($scope.forms, '-stamp.date');
                $scope.maxSize = 5;
                $scope.currentPage = 1;
                $scope.numPerPage = 10;
                $scope.totalItems = $scope.forms.length;
                $scope.numPages = Math.ceil($scope.forms.length / $scope.numPerPage);

                $scope.setPage = function (pageNo) {
                    $scope.currentPage = pageNo;
                };

                $scope.$watch('currentPage + form.search', function () {
                    $scope.filteredForms = $filter('filter')($scope.orderedForms, $scope.form.search);
                    var begin = (($scope.currentPage - 1) * $scope.numPerPage)
                        , end = begin + $scope.numPerPage;
                    $scope.viewForms = $scope.filteredForms.slice(begin, end);

                    $scope.totalItems = $scope.filteredForms.length;
                    $scope.numPages = Math.ceil($scope.filteredForms.length / $scope.numPerPage);
                });
            }, function (response) {

            });
        };
    }




]);


