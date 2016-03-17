angular.module('mainApp').controller('OrganizationDatasets', function ($scope, $http) {
    var baseUrl = '/api/organizations/' + $scope.currentOrganization._id;

    function fetchNotPublishedYet() {
        $http.get(baseUrl + '/datasets/not-published-yet').success(function (data) {
            data.forEach(dataset => dataset.status = 'not-published');
            $scope.notPublished = data;
        });
    }

    function fetchPublished() {
        $http.get(baseUrl + '/datasets/published').success(function (data) {
            data.forEach(dataset => dataset.status = 'published');
            $scope.published = data;
        });
    }

    function fetchPublishedByOthers() {
        $http.get(baseUrl + '/datasets/published-by-others').success(function (data) {
            data.forEach(dataset => dataset.status = 'published-by-others');
            $scope.publishedByOthers = data;
        });
    }

    function refresh() {
        fetchPublished();
        fetchPublishedByOthers();
        fetchNotPublishedYet();
    }

    refresh();

    $scope.publishDataset = function (dataset) {
        if (dataset.syncing) return;
        if (dataset.status !== 'not-published') return;

        dataset.syncing = true;
        $http.put('/api/datasets/' + dataset._id + '/publication', {
            organization: $scope.currentOrganization._id,
            status: 'public',
            sourceCatalog: $scope.currentOrganization.sourceCatalog
        }).success(function (data) {
            dataset.syncing = false;
            dataset.status = 'published';
        }).error(function () {
            dataset.syncing = false;
        });
    };

    $scope.unpublishDataset = function (dataset) {
        if (dataset.status !== 'published') return;

        $http.delete('/api/datasets/' + dataset._id + '/publication').success(function () {
            dataset.status = 'not-published';
        });
    };

});
