angular.module('mainApp').controller('OrganizationCatalog', function ($scope, $http, $routeParams, $location) {
    $scope.currentOrganization = { _id: $routeParams.organizationId };

    $http.get('/api/organizations/' + $scope.currentOrganization._id).success(function (data) {
        _.assign($scope.currentOrganization, data);
    });

    $http.get('/api/catalogs').success(function (data) {
        $scope.catalogs = data;
    });

    function organizationBaseUrl() {
        return '/api/organizations/' + $scope.currentOrganization._id;
    }

    $scope.selectedCatalog = function () {
        return _.find($scope.catalogs, { _id: $scope.currentOrganization.sourceCatalog });
    };

    $scope.selectCatalog = function (catalog) {
        function onSuccess(data) {
            _.assign($scope.currentOrganization, data);
            $location.path('/org/' + $scope.currentOrganization._id);
        }

        if ($scope.currentOrganization.sourceCatalog) {
            $http.put(organizationBaseUrl(), { sourceCatalog: catalog._id }).success(onSuccess);
        } else {
            $http.post('/api/organizations', {
                _id: $scope.currentOrganization._id,
                sourceCatalog: catalog._id
            }).success(onSuccess);
        }
    };

});
