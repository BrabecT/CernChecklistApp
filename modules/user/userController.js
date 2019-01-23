angular.module('checklistApp')
    .controller('userController', ['$scope', 'getFormDataService', 'dialogService', '$timeout',
        function ($scope, getFormDataService, dialogService, $timeout) {
            $scope.data = {};
            $scope.currentNavItem = 'navItemLoad';
            $scope.noFormAlert = false;
            $scope.alertMessageShow = false;

            $scope.clickBtn = function() {
                $scope.laddaLoading = true; // start loading
                $timeout(function() {
                    $scope.laddaLoading = false; // stop loading
                }, 1000);
            };

            getFormDataService.getLastForm().then(function (response) {
                if(Object.keys(response).length !== 0){
                    $scope.sections = response;
                    $scope.noFormAlert = false;
                 }
                 else{
                    $scope.noFormAlert = true;
                }
            });

            $scope.printPdf = function (sections, data) {
                $scope.laddaLoading = true;
                $scope.alertMessageShow = false;
                dialogService.printPdfServ(sections, data)
                    .then(function (response) {
                        $scope.alertMessage = response.data.message;
                        $scope.alertMessageShow = true;
                        $scope.laddaLoading = false;
                        $timeout(function() {
                            $scope.alertMessageShow = false;
                        }, 10000);
                        if (response.data.status === 'OK') {
                            $scope.pdfLink = 'output/' + response.data.file;
                        }
                    }), function (response) {
                    console.log(response);
                        $scope.laddaLoading = false;
                        $scope.alertMessage = response;
                        $scope.alertMessageShow = true;
                        $timeout(function() {
                            $scope.alertMessageShow = false;
                        }, 10000);
                };
            };

            $scope.autoStorageFunction = function () {
                localStorage.setItem('offlineForm', JSON.stringify($scope.sections));
                localStorage.setItem('offlineData', JSON.stringify($scope.data));
                console.log("Offline save SUCCESS");
            };
            
            $scope.checkboxChecked = function (id) {
                return !(id == undefined || id == false);
            };

            $scope.getDataOffline = function () {
                var form = localStorage.getItem('offlineForm');
                var data = localStorage.getItem('offlineData');
                if (form) {
                    $scope.sections = JSON.parse(form);
                    console.log("Form offline load SUCCESS");
                    if (data) {
                        $scope.data = JSON.parse(data);
                        console.log("Data offline load SUCCESS");
                    } else {
                        $scope.alertMessage = "No data to load";
                        $scope.alertMessageShow = true;
                        $timeout(function() {
                            $scope.alertMessageShow = false;
                        }, 10000);
                    }
                } else {
                    $scope.alertMessage = "No form to load";
                    $scope.alertMessageShow = true;
                    $timeout(function() {
                        $scope.alertMessageShow = false;
                    }, 10000);
                }
            };

            $scope.numberError = function (input) {
                if(input.minValue != undefined && input.maxValue != undefined){
                   return ($scope.data[input.id] < input.minValue || $scope.data[input.id] > input.maxValue);
                }
                if(input.minValue != undefined && input.maxValue == undefined){
                    return ($scope.data[input.id] < input.minValue);
                }
                if(input.minValue == undefined && input.maxValue != undefined){
                    return ($scope.data[input.id] > input.maxValue);
                }
                if(input.minValue == undefined && input.maxValue == undefined){
                    return false;
                }
            }
        }]);