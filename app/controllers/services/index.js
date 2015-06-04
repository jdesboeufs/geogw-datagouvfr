angular.module('mainApp').controller('Services', function($scope, $http, $stateParams) {
    $scope.protocol = $stateParams.serviceProtocol;

    $scope.canBeSynced = function(service) {
        return service.syncEnabled && !service.sync.pending && !service.sync.processing;
    };
    $scope.isNew = function (service) {
        return !service.sync.status || service.sync.status === 'new';
    };
    $scope.syncService = function(service) {
        service.sync.pending = true;
        $http.post('/api/geogw/services/' + service._id + '/sync');
    };
    $scope.fetchServices = function(protocol) {
        $http.get('/api/geogw/services/by-protocol/' + protocol).success(function(services) {
            $scope.services = services;
        });
    };
    $scope.fetchServices($scope.protocol);
});
