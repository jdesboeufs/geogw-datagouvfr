mainApp.controller('mainCtrl', function ($scope, $http) {

    $http.get('/api/me').success(function (data) {
        $scope.me = data;
        if ($scope.me.organizations.length === 1) {
            $scope.selectTargetOrganization($scope.me.organizations[0]);
        }
    });

    $http.get('/api/catalogs').success(function (data) {
        $scope.catalogs = data;
    });

    $scope.selectTargetOrganization = function (organization) {
        if (organization) $scope.targetOrganization = organization.id;
        else $scope.targetOrganization = null;
    };

});
