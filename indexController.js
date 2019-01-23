angular.module('checklistApp', [
    'ui.router',
    'ngMaterial',
    'ui.bootstrap',
    'ui.bootstrap.tpls',
    'angularMoment',
    'angular-ladda'
])


    .config(function($urlRouterProvider, $stateProvider,$mdDateLocaleProvider) {

        $mdDateLocaleProvider.formatDate = function(date) {
            return date ? moment(date).format('YYYY-MM-DD') : '';
        };

        var onlyLoggedIn = function ($location,$q, authentication, $state) {
            var deferred = $q.defer();
            authentication.isAdmin().then(function (response) {
                if(response){
                    deferred.resolve(response);
                } else {
                    $state.go('user');
                    deferred.reject("");
                }
            }), function (response) {
                console.log(response);
            };
            return deferred.promise;
        };

        $urlRouterProvider.otherwise('/user');

        $stateProvider

            .state('admin', {
                url: '/admin',
                templateUrl: 'modules/admin/admin.partial.html',
                controller: 'adminController',
                resolve:{
                    loggedIn:onlyLoggedIn
                }
            })

            .state('admin.formCreate', {
                templateUrl: 'modules/admin/admin.partial.formCreate.html',
                parent: 'admin'
            })

            .state('admin.versions', {
                templateUrl: 'modules/admin/admin.partial.formLoad.html',
                parent: 'admin'
            })

            .state('user', {
                url: '/user',
                templateUrl: 'modules/user/user.partial.html',
                controller: 'userController'
            });

    })

    .controller('indexDefaultController', ['$scope', '$mdSidenav', '$timeout', '$location', 'authentication',
        function ($scope, $mdSidenav, $timeout, $location, authentication) {
            $scope.toggleLeft = buildDelayedToggler('left');
            authentication.isAdmin().then(function (response) {
               $scope.adminVar = response;
            });

            function debounce(func, wait) {
                var timer;

                return function debounced() {
                    var context = $scope,
                        args = Array.prototype.slice.call(arguments);
                    $timeout.cancel(timer);
                    timer = $timeout(function () {
                        timer = undefined;
                        func.apply(context, args);
                    }, wait || 10);
                };
            }

            function buildDelayedToggler(navID) {
                return debounce(function () {
                    // Component lookup should always be available since we are not using `ng-if`
                    $mdSidenav(navID).toggle()
                }, 200);
            }

            $scope.isActive = function(route) {
                route = '/' + route;
                return route === $location.path();
            };

            $scope.navItems = [
                {label: "user", icon: "fa fa-lg fa-user nav-icon", name: "user", active: false},
                {label: "admin", icon: "fa fa-lg fa-user-secret nav-icon", name: "admin", active: false}
            ]


        }])

    .filter('dateToISO', function () {
        return function (input) {
            if(angular.isDefined(input)) {
                var t = input.split(/[- :]/);
                var date = new Date(t[0], t[1] - 1, t[2], t[3], t[4], t[5]);
                return date;
            }
        }
    })

    .run(function($window, $rootScope, authentication) {
        authentication.getFullName().then(function (response) {
            $rootScope.fullName = response;
        });
        $rootScope.online = navigator.onLine;
        $window.addEventListener("offline", function () {
            $rootScope.$apply(function() {
                $rootScope.online = false;
            });
        }, false);
        $window.addEventListener("online", function () {
            $rootScope.$apply(function() {
                $rootScope.online = true;
            });
        }, false);
    });

