angular.module('mainApp').controller('OrganizationProducers', function ($scope, $http, associatedProducers) {
    associatedProducers = _.indexBy(associatedProducers, '_id');

    $scope.producers = [];
    $scope.groupedProducers = {};

    function updateProducerGroups() {
        $scope.groupedProducers = _.groupBy($scope.producers, function (producer) {
            if (!producer.associatedTo) return 'available';
            if (producer.associatedTo === $scope.currentOrganization._id) return 'organization';
            return 'restricted';
        });
    }

    $http.get('/api/geogw/services/' + $scope.currentOrganization.sourceCatalog + '/records?resultParts=facets&opendata=yes&availability=yes&facets[keyword]=0').success(function (result) {
        var indexedProducers = {};
        (result.facets.organization || []).forEach(function (facet) {
            var producer = associatedProducers[facet.value] || { _id: facet.value };
            producer.count = facet.count;
            indexedProducers[producer._id] = producer;
        });
        $scope.currentOrganization.producers.forEach(function (producer) {
            if (producer._id in indexedProducers) return;
            indexedProducers[producer._id] = { _id: producer._id, associatedTo: $scope.currentOrganization };
        });
        $scope.producers = _.values(indexedProducers);
        updateProducerGroups();
    });

    function organizationBaseUrl() {
        return '/dgv/api/organizations/' + $scope.currentOrganization._id;
    }

    $scope.associateProducer = function (producer) {
        $http.post(organizationBaseUrl() + '/producers', { _id: producer._id })
            .success(function () {
                producer.associatedTo = $scope.currentOrganization;
                $scope.currentOrganization.producers.push({ _id: producer._id });
                updateProducerGroups();
            });
    };

    $scope.dissociateProducer = function (producer) {
        $http.delete(organizationBaseUrl() + '/producers/' + encodeURIComponent(producer._id))
            .success(function () {
                producer.associatedTo = null;
                _.remove($scope.currentOrganization.producers, function (p) {
                    return p._id === producer._id;
                });
                updateProducerGroups();
            });
    };

    $scope.producerIsSelected = function (producer) {
        return producer.associatedTo && (producer.associatedTo._id === $scope.currentOrganization._id);
    };

    $scope.weHaveAProblem = function () {
        return $scope.producers.length === 0 && !$scope.groupedProducers.organization;
    };

});
