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
