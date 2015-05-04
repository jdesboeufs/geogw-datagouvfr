angular.module('mainApp').controller('mainCtrl', function ($scope, $http) {

    if ($scope.loggedIn) {
        $scope.organizations = $scope.me.organizations.map(function (organization) {
            organization.status = 'not-set';
            $http.get('/api/organizations/' + organization._id).success(function (data) {
                _.assign(organization, data);
            });
            return organization;
        });
    }

});
