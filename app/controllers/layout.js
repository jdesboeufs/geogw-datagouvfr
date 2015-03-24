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

    $http.get('/api/catalogs').success(function (data) {
        $scope.catalogs = data;
    });

    $scope.selectCurrentOrganization = function (organization) {
        if (organization) {
            $scope.currentOrganization = organization;
        } else {
            $scope.currentOrganization = null;
        }
    };

    $scope.organizationStatusLabel = function (organization) {
        var mapping = {
            'not-set': 'Pas encore configurée',
            'disabled': 'Configurée - Inactive',
            'enabled_private': 'Active - publication en mode privé',
            'enabled_public': 'Active'
        };

        return organization.status in mapping ? mapping[organization.status] : 'Erreur';
    };

});
