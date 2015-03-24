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
        .otherwise({
            redirectTo: '/'
        });
});
