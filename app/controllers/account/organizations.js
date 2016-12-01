angular.module('mainApp').controller('AccountOrganizations', function ($scope, $http) {
	$scope.organizations = $scope.me.organizations.map(function (organization) {
        organization.status = 'not-set';
        $http.get('/dgv/api/organizations/' + organization.id).success(function (data) {
            _.assign(organization, data);
        });
        return organization;
   });
});
