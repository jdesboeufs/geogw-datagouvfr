angular.module('mainApp').controller('mainCtrl', function ($scope, $http) {

    $http.get('/api/me').success(function (data) {
        $scope.me = data;

        $scope.organizations = data.organizations.map(function (organization) {
            organization.status = 'not-set';
            $http.get('/api/organizations/' + organization._id).success(function (data) {
                _.assign(organization, data);
            });
            return organization;
        });

        if ($scope.organizations.length === 1) {
            $scope.selectCurrentOrganization($scope.organizations[0]);
        }
    });

});
