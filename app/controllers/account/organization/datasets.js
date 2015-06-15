angular.module('mainApp').controller('OrganizationDatasets', function ($scope, $http) {
    function organizationBaseUrl() {
        return '/api/organizations/' + $scope.currentOrganization._id;
    }

    function refresh() {
        $http.get(organizationBaseUrl() + '/datasets').success(function (data) {
            $scope.datasets = data;
            $scope.updateDatasetGroups();
        });
    }

    refresh();

    $scope.updateDatasetGroups = function () {
        $scope.groupedDatasets = _.groupBy($scope.datasets, function (dataset) {
            return $scope.publicationStatus(dataset);
        });
    };

    $scope.publicationStatus = function (dataset) {
        if (!dataset.publication || !dataset.publication._id) return 'not-published';
        if (dataset.publication.organization._id !== $scope.currentOrganization._id) return 'published-by-other';
        return dataset.publication.status === 'public' ? 'published-public' : 'published-private';
    };

    $scope.isPublished = function (dataset) {
        var publicationStatus = $scope.publicationStatus(dataset);
        return publicationStatus.indexOf('published-p') === 0;
    };

    $scope.datasetToggleStatus = function (dataset) {
        $scope.publishDataset(dataset, dataset.publication.status === 'public' ? 'private' : 'public');
    };

    $scope.publishDataset = function (dataset, status) {
        if (dataset.syncing) return;

        dataset.syncing = true;
        $http.put('/api/datasets/' + dataset._id + '/publication', {
            organization: $scope.currentOrganization._id,
            status: status,
            sourceCatalog: $scope.currentOrganization.sourceCatalog
        }).success(function (data) {
            dataset.syncing = false;
            dataset.publication = data;
            dataset.publication.organization = $scope.currentOrganization; // Dataset operations doesn't populate organization
            $scope.updateDatasetGroups();
        }).error(function () {
            dataset.syncing = false;
        });
    };

    $scope.unpublishDataset = function (dataset) {
        $http.delete('/api/datasets/' + dataset._id + '/publication').success(function () {
            dataset.publication = {};
            $scope.updateDatasetGroups();
        });
    };

    $scope.unpublishAll = function () {
        $http.delete(organizationBaseUrl() + '/datasets/publication').success(function () {
            refresh();
        });
    };

    $scope.publishAll = function () {
        $http.post(organizationBaseUrl() + '/datasets/publish-all').success(function () {
            refresh();
        });
    };

    $scope.syncAll = function () {
        $http.post(organizationBaseUrl() + '/datasets/synchronize-all').success(function () {
            refresh();
        });
    };

});
