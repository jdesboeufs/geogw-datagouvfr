angular.module('mainApp').controller('OrganizationDatasets', function ($scope, $http, $routeParams) {
    $scope.currentOrganization = { _id: $routeParams.organizationId };

    $http.get('/api/organizations/' + $scope.currentOrganization._id).success(function (data) {
        _.assign($scope.currentOrganization, data);
    });

    function organizationBaseUrl() {
        return '/api/organizations/' + $scope.currentOrganization._id;
    }

    $http.get(organizationBaseUrl() + '/datasets').success(function (data) {
        $scope.datasets = data;
    });

    $scope.publicationStatus = function (dataset) {
        if (!dataset.publication || !dataset.publication._id) return 'not-published';
        if (dataset.publication.organization !== $scope.currentOrganization._id) return 'published-by-other';
        return dataset.publication.status === 'public' ? 'published-public' : 'published-private';
    };

    $scope.datasetCanBePublished = function (dataset) {
        var publicationStatus = $scope.publicationStatus(dataset);
        return publicationStatus === 'not-published';
    };

    $scope.isPublished = function (dataset) {
        var publicationStatus = $scope.publicationStatus(dataset);
        return publicationStatus.indexOf('published-p') === 0;
    };

    $scope.datasetToggleStatus = function (dataset) {
        $scope.publishDataset(dataset, dataset.publication.status === 'public' ? 'private' : 'public');
    };

    $scope.publishDataset = function (dataset, status) {
        $http.put('/api/datasets/' + dataset._id + '/publication', {
            organization: $scope.currentOrganization._id,
            status: status,
            sourceCatalog: $scope.currentOrganization.sourceCatalog
        }).success(function (data) {
            dataset.publication = data;
        });
    };

    $scope.unpublishDataset = function (dataset) {
        $http.delete('/api/datasets/' + dataset._id + '/publication').success(function () {
            dataset.publication = {};
        });
    };

});
