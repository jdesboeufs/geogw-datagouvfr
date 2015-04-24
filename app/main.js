var mainApp = angular.module('mainApp', ['ui.router']);

mainApp.config(function($stateProvider, $locationProvider, $urlRouterProvider) {
    $locationProvider.html5Mode({ enabled: true, requireBase: false });
    
    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('root', {
            url: '/',
            abstract: true,
            template: '<ui-view></ui-view>',
            controller: function ($scope, user) {
                if (user) {
                    $scope.me = user;
                    $scope.loggedIn = true;
                } else {
                    $scope.loggedIn = false;
                }
            },
            resolve: {
                user: function ($http) {
                    return $http.get('/api/me').then(function (result) {
                        return result.data;
                    }, function () {
                        return false;
                    });
                }
            }
        })
        .state('root.home', {
            url: '',
            templateUrl: '/partials/home.html',
            controller: 'mainCtrl'
        })
        .state('root.organization', {
            url: 'org/:organizationId',
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
        .state('root.organization.index', {
            url: '',
            templateUrl: '/partials/organization/index.html',
            controller: 'OrganizationIndex'
        })
        .state('root.organization.catalog', {
            url: '/catalog-selection',
            templateUrl: '/partials/organization/catalog.html',
            controller: 'OrganizationCatalog'
        })
        .state('root.organization.producers', {
            url: '/producers',
            templateUrl: '/partials/organization/producers.html',
            controller: 'OrganizationProducers',
            resolve: {
                associatedProducers: function ($http) {
                    return $http.get('/api/producers').then(function (result) {
                        return result.data;
                    });
                }
            }
        })
        .state('root.organization.datasets', {
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
