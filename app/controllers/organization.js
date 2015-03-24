angular.module('mainApp').controller('organizationCtrl', function ($scope, $http) {
    $scope.producers = [];
    $scope.selectedProducers = {};

    function organizationBaseUrl() {
        return '/api/organizations/' + $scope.currentOrganization._id;
    }

    $scope.initSourceCatalog = function (sourceCatalog) {
        if (!sourceCatalog) return;

        $scope.disableSourceCatalogSelection();
        $scope.disableProducersSelection();

        if ($scope.selectedProducersCount() === 0) $scope.enableProducersSelection();

        $scope.selectedProducers = _.indexBy($scope.currentOrganization.producers, '_id');

        $http.get('/api/catalogs/' + sourceCatalog + '/producers').success(function (data) {
            $scope.producers = data;
        });

        $http.get(organizationBaseUrl() + '/datasets').success(function (data) {
            $scope.datasets = data;
        });
    };

    $scope.sourceCatalogSelectionActive = function () {
        return !$scope.selectedCatalog() || $scope.sourceCatalogSelection;
    };

    $scope.enableSourceCatalogSelection = function () {
        $scope.sourceCatalogSelection = true;
    };

    $scope.disableSourceCatalogSelection = function () {
        $scope.sourceCatalogSelection = false;
    };

    $scope.$watch('currentOrganization.sourceCatalog', $scope.initSourceCatalog);

    $scope.selectedCatalog = function () {
        return _.find($scope.catalogs, { _id: $scope.currentOrganization.sourceCatalog });
    };

    $scope.selectCatalog = function (catalog) {
        function onSuccess(data) {
            _.assign($scope.currentOrganization, data);
            $scope.disableSourceCatalogSelection();
            $scope.initSourceCatalog();
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

    $scope.associateProducer = function (producer) {
        $http.post(organizationBaseUrl() + '/producers', { _id: producer.value })
            .success(function () {
                $scope.selectedProducers[producer.value] = true;
                if ($scope.availableProducers().length === 0) {
                    $scope.producersSelection = false;
                }
            });
    };

    $scope.dissociateProducer = function (producerId) {
        $http.delete(organizationBaseUrl() + '/producers/' + encodeURIComponent(producerId))
            .success(function () {
                delete $scope.selectedProducers[producerId];
            });
    };

    $scope.producerIsSelected = function (producer) {
        return producer.value in $scope.selectedProducers;
    };

    $scope.availableProducers = function () {
        return _.filter($scope.producers, function (producer) {
            return !$scope.producerIsSelected(producer);
        });
    };

    // $scope.producerCount = function (producer) {
    //     var facet = _.find($scope.producers, { value: producer._id });
    //     if (facet) return facet.count;
    //     return 0;
    // };

    $scope.selectedProducersCount = function () {
        return _.size($scope.selectedProducers);
    };

    $scope.producersSelectionActive = function () {
        return $scope.producersSelection;
    };

    $scope.enableProducersSelection = function () {
        $scope.producersSelection = true;
    };

    $scope.disableProducersSelection = function () {
        $scope.producersSelection = false;
    };

    $scope.synchronize = function () {
        $http.post(organizationBaseUrl() + '/synchronize', {}).success(function () {

        });
    };

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
