angular.module('mainApp').controller('OrganizationCatalog', function ($scope, $http, $location, $state) {

    $http.get('/api/geogw/services/by-protocol/csw').success(function (data) {
        $scope.catalogs = data;
    });

    function organizationBaseUrl() {
        return '/dgv/api/organizations/' + $scope.currentOrganization._id;
    }

    $scope.selectedCatalog = function () {
        return _.find($scope.catalogs, { _id: $scope.currentOrganization.sourceCatalogs[0] });
    };

    $scope.selectCatalog = function (catalog) {
        function onSuccess(data) {
            _.assign($scope.currentOrganization, data);
            $state.go('root.account.organization.index', { organizationId: $scope.currentOrganization._id });
        }

        $http.put(organizationBaseUrl(), { sourceCatalogs: [catalog._id] }).success(onSuccess);
    };

});
