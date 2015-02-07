mainApp.controller('organizationCtrl', function ($scope, $http) {


    $scope.suggestCatalogs = function (str) {
        if (!$scope.catalogs || $scope.catalogs.length === 0 || !str) return;
        var sentence = _.deburr(str.toLowerCase());

        $scope.suggestedCatalogs = _($scope.catalogs).chain()
            .map(function (catalog) {
                return {
                    id: catalog.id,
                    name: catalog.name,
                    score: catalog.normalizedName.score(sentence)
                };
            })
            .filter(function (catalog) {
                return catalog.score > 0.4;
            })
            .take(10)
            .value();
    };

    $scope.selectCatalog = function (catalog) {
        $scope.selectedCatalog = catalog;
        $scope.suggestCatalogsStr = catalog.name;
        $scope.suggestedCatalogs = null;
        $scope.selectedOrganizations = {};
        loadOrganizations();
    };

    function loadOrganizations() {
        $http.get('/api/catalogs/' + $scope.selectedCatalog.id + '/facets/organization').success(function (data) {
            $scope.organizationsInCatalog = data;
        });
    }

    $scope.cleanSelectedCatalog = function () {
        $scope.selectedCatalog = null;
    };

    $scope.toggleOrganization = function (organization) {
        if ($scope.selectedOrganizations[organization.value]) {
            $scope.selectedOrganizations[organization.value] = null;
        } else {
            $scope.selectedOrganizations[organization.value] = organization;
        }
    };

    $scope.organizationIsSelected = function (organization) {
        return $scope.selectedOrganizations[organization.value];
    };

    $scope.selectedOrganizationsCount = function () {
        return _.filter($scope.selectedOrganizations, function (org) { return org; }).length;
    };

    $scope.toggleOrganizationsLock = function () {
        $scope.organizationsLocked = !$scope.organizationsLocked;
    };

    $scope.editingOrganizations = function () {
        return !$scope.organizationsLocked && $scope.organizationsInCatalog.length > 0;
    };

});
