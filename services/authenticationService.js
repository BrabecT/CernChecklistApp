angular.module('checklistApp')
    .service('authentication', authentication);

function authentication($http, $q) {
    function isAdmin() {
        var data = {'data': 'getAuthorization'};
        var deferred = $q.defer();
        $http.post("php/authorization.php", data).then(function (response) {
            var isAdmin = null;
            if (response.data == 'admin') {
                isAdmin = true;
            }else {
                isAdmin = false
            }
            deferred.resolve(isAdmin);
        }, function (response) {
            console.log(response);
        });
        return deferred.promise;
    }

    function getFullName() {
        var data = {'data': 'getFullName'};
        var deferred = $q.defer();
        $http.post("php/authorization.php", data).then(function (response) {
            deferred.resolve(response.data);
        }, function (response) {
            console.log(response);
        });
        return deferred.promise;
    }
    return {
            isAdmin: isAdmin,
            getFullName: getFullName
    }
}