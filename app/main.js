var mainApp = angular.module('mainApp', ['ngRoute']);

mainApp.config(function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({ enabled: true, requireBase: false });
    $routeProvider
        .when('/', {
            templateUrl: '/partials/home.html',
            controller: 'mainCtrl'
        })
        .when('/org/:organizationId', {
            templateUrl: '/partials/organization/index.html',
            controller: 'OrganizationIndex'
        })
        .when('/org/:organizationId/datasets', {
            templateUrl: '/partials/organization/datasets.html',
            controller: 'OrganizationDatasets'
        })
        .otherwise({
            redirectTo: '/'
        });
});
