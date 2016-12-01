angular.module('mainApp').controller('OrganizationDatasets', function ($scope, $http) {
    var baseUrl = '/dgv/api/organizations/' + $scope.currentOrganization._id;

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

    function publishDataset(dataset, cb) {
        function ok() {
            if (cb) cb();
        }

        if (dataset.syncing) return ok();
        if (dataset.status !== 'not-published') return ok();

        dataset.syncing = true;
        $http.put('/dgv/api/datasets/' + dataset._id + '/publication', {
            organization: $scope.currentOrganization._id
        }).success(function (data) {
            dataset.syncing = false;
            dataset.status = 'published';
            ok()
        }).error(function () {
            dataset.syncing = false;
            console.log('Error while publishing dataset ' + dataset._id);
            ok()
        });
    }

    $scope.publishDataset = publishDataset;

    $scope.unpublishDataset = function (dataset) {
        if (dataset.status !== 'published') return;

        $http.delete('/dgv/api/datasets/' + dataset._id + '/publication').success(function () {
            dataset.status = 'not-published';
        });
    };

    $scope.publishAll = function () {
        $scope.publishingAll = true;
        async.eachLimit($scope.notPublished, 5, publishDataset, function () {
            $scope.publishingAll = false;
        });
    }

});
