angular.module('mainApp').controller('OrganizationIndex', function ($scope, $http, $timeout) {

    $http.get('/api/geogw/services/by-protocol/csw').success(function (data) {
        $scope.catalogs = data;
    });

    $scope.datasetMetrics = {};

    $scope.selectedCatalog = function () {
        return _.find($scope.catalogs, { _id: $scope.currentOrganization.sourceCatalog });
    };

    $scope.producers = [];
    $scope.selectedProducers = {};

    function organizationBaseUrl() {
        return '/dgv/api/organizations/' + $scope.currentOrganization._id;
    }

    $scope.refreshMetrics = function () {
        $http.get(organizationBaseUrl() + '/datasets/metrics').success(function (data) {
            $scope.datasetMetrics = data;
        });
    };

    $scope.refreshMetrics();

    $scope.ready = function () {
        return $scope.currentOrganization.sourceCatalog && $scope.currentOrganization.producers.length > 0
    };

});
