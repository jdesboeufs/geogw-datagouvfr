angular.module('mainApp').controller('Record', function($scope, $http, $stateParams, record) {
    $scope.dataset = record;

    $scope.datasetTypes = {
        series: 'Série de données',
        dataset: 'Jeu de données'
    };

    $scope.contactTypes = {
        resourceProvider: 'Fournisseur',
        custodian: 'Gestionnaire',
        owner: 'Propriétaire',
        user: 'Utilisateur',
        distributor: 'Distributeur',
        originator: 'Commanditaire',
        pointOfContact: 'Point de contact',
        principalInvestigator: 'Maître d\'oeuvre',
        processor: 'Intégrateur',
        publisher: 'Éditeur',
        autor: 'Auteur',
        author: 'Auteur'
    };

    $http.get('/api/geogw/datasets/by-identifier/' + $scope.dataset.identifier).success(function(otherDatasets) {
        $scope.sameIdentifierDatasets = _.reject(otherDatasets, { _id: $scope.dataset._id });
        if ($scope.sameIdentifierDatasets.length === 0) return;
        var mostRecent = _.max($scope.sameIdentifierDatasets, function(d) { return moment(d.metadata._updated); });
        if (mostRecent.metadata._updated > $scope.dataset.metadata._updated) $scope.moreRecent = mostRecent;
    });

    $scope.downloadLink = function (dist, format, projection) {
        var baseUrl = '/api/geogw';
        if (dist.type === 'file-package') {
            baseUrl += '/file-packages/' + dist.hashedLocation + '/' + dist.layer;
        }
        if (dist.type === 'wfs-featureType') {
            baseUrl += '/services/' + dist.service + '/feature-types/' + dist.typeName;
        }
        return baseUrl + '/download?format=' + format + '&projection=' + projection;
    };

    $scope.encodeURIComponent = encodeURIComponent;
});
