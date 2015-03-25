angular.module('mainApp').controller('OrganizationProducers', function ($scope, $http, $routeParams) {
    $scope.currentOrganization = { _id: $routeParams.organizationId };
    $scope.producers = [];
    $scope.selectedProducers = {};

    $http.get('/api/organizations/' + $scope.currentOrganization._id).success(function (data) {
        _.assign($scope.currentOrganization, data);
        $scope.selectedProducers = _.indexBy($scope.currentOrganization.producers, '_id');

        $http.get('/api/catalogs/' + $scope.currentOrganization.sourceCatalog + '/producers').success(function (data) {
            console.log(data);
            $scope.producers = data;
        });
    });

    $http.get('/api/catalogs').success(function (data) {
        $scope.catalogs = data;
    });



    function organizationBaseUrl() {
        return '/api/organizations/' + $scope.currentOrganization._id;
    }

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

    $scope.selectedProducersCount = function () {
        return _.size($scope.selectedProducers);
    };

    $scope.weHaveAProblem = function () {
        return $scope.producers.length === 0 && $scope.selectedProducersCount() === 0;
    };

});
