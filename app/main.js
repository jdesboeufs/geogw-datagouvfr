var mainApp = angular.module('mainApp', ['ui.router']);

mainApp.config(function($stateProvider, $locationProvider, $urlRouterProvider) {
    $locationProvider.html5Mode({ enabled: true, requireBase: false });
    
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: '/partials/home.html',
            controller: 'mainCtrl'
        })
        .state('organization', {
            url: '/org/:organizationId',
            abstract: true,
            template: '<ui-view></ui-view>',
            controller: function ($scope, organization) {
                $scope.currentOrganization = organization;
            },
            resolve: {
                organization: function ($stateParams, $http) {
                    return $http.get('/api/organizations/' + $stateParams.organizationId).then(function (result) {
                        return result.data;
                    }, function () {
                        return { _id: $stateParams.organizationId, producers: [] };
                    });
                }
            }
        })
        .state('organization.index', {
            url: '',
            templateUrl: '/partials/organization/index.html',
            controller: 'OrganizationIndex'
        })
        .state('organization.catalog', {
            url: '/catalog-selection',
            templateUrl: '/partials/organization/catalog.html',
            controller: 'OrganizationCatalog'
        })
        .state('organization.producers', {
            url: '/producers',
            templateUrl: '/partials/organization/producers.html',
            controller: 'OrganizationProducers'  
        })
        .state('organization.datasets', {
            url: '/datasets',
            templateUrl: '/partials/organization/datasets.html',
            controller: 'OrganizationDatasets'
        });
});

mainApp.controller('navbar', function ($scope, $http) {
    $http.get('/api/me').success(function (data) {
        $scope.me = data;
    });
});
