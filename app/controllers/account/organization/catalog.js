angular.module('mainApp').controller('OrganizationCatalog', function ($scope, $http, $location, $state) {

    $http.get('/api/geogw/services/by-protocol/csw').success(function (data) {
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
            $state.go('root.account.organization.index', { organizationId: $scope.currentOrganization._id });
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
