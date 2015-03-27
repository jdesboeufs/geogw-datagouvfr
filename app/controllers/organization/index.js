angular.module('mainApp').controller('OrganizationIndex', function ($scope, $http, $routeParams, $timeout) {
    $scope.currentOrganization = { _id: $routeParams.organizationId };

    $http.get('/api/organizations/' + $scope.currentOrganization._id).success(function (data) {
        _.assign($scope.currentOrganization, data);
    });

    $http.get('/api/catalogs').success(function (data) {
        $scope.catalogs = data;
    });

    $scope.datasetMetrics = {};

    $scope.selectedCatalog = function () {
        return _.find($scope.catalogs, { _id: $scope.currentOrganization.sourceCatalog });
    };

    $scope.producers = [];
    $scope.selectedProducers = {};

    function organizationBaseUrl() {
        return '/api/organizations/' + $scope.currentOrganization._id;
    }

    $scope.refreshMetrics = function () {
        $http.get(organizationBaseUrl() + '/datasets').success(function (data) {
            var metrics = _(data)
                .groupBy(function (dataset) {
                    if (!dataset.publication || !dataset.publication._id) return 'not-published';
                    if (dataset.publication.organization._id !== $scope.currentOrganization._id) return 'published-by-other';
                    return dataset.publication.status === 'public' ? 'published-public' : 'published-private';
                })
                .mapValues(function (list) {
                    return list.length;
                })
                .value();

            metrics.total = data.length;
            $scope.datasetMetrics = metrics;
        });
    };

    $scope.refreshMetrics();

    $scope.syncable = function () {
        return ($scope.datasetMetrics.total > 0) || ($scope.currentOrganization.producers.length > 0 && $scope.currentOrganization.sourceCatalog);
    };

    $scope.synchronize = function () {
        $scope.syncing = true;
        $http.post(organizationBaseUrl() + '/synchronize', {}).success(function () {
            $timeout(function () {
                $scope.syncing = false;
                $scope.refreshMetrics();
            }, 3000);
        });
    };

});
