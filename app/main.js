var mainApp = angular.module('mainApp', ['ui.router']);

moment.locale('fr');

mainApp.filter('duration', function () {
    return function (value) {
        if (!value) return '';
        return moment.duration(value).humanize();
    };
});

mainApp.filter('timeago', function () {
    return function (value) {
        if (!value) return '';
        return moment(value).fromNow();
    };
});

mainApp.filter('prune', function () {
    return function (value, max) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        return s.prune(value, max);
    };
});

mainApp.config(function($stateProvider, $locationProvider, $urlRouterProvider) {
    $locationProvider.html5Mode({ enabled: true, requireBase: false });
    
    $urlRouterProvider
        .when('/services', '/services/by-protocol/csw')
        .otherwise('/');

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
            controller: 'mainCtrl',
            resolve: {
                statistics: function ($http) {
                    return $http.get('/api/datasets/statistics').then(function (result) {
                        return result.data;
                    });
                }
            }
        })
        .state('root.account', {
            url: 'account',
            abstract: true,
            template: '<ui-view></ui-view>',
            controller: _.noop
        })
        .state('root.account.organizations', {
            url: '/organizations',
            templateUrl: '/partials/account/organizations.html',
            controller: 'AccountOrganizations'
        })
        .state('root.account.organization', {
            url: '/organization/:organizationId',
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
        .state('root.account.organization.index', {
            url: '',
            templateUrl: '/partials/account/organization/index.html',
            controller: 'OrganizationIndex'
        })
        .state('root.account.organization.catalog', {
            url: '/catalog-selection',
            templateUrl: '/partials/account/organization/catalog.html',
            controller: 'OrganizationCatalog'
        })
        .state('root.account.organization.producers', {
            url: '/producers',
            templateUrl: '/partials/account/organization/producers.html',
            controller: 'OrganizationProducers',
            resolve: {
                associatedProducers: function ($http) {
                    return $http.get('/api/producers').then(function (result) {
                        return result.data;
                    });
                }
            }
        })
        .state('root.account.organization.datasets', {
            url: '/datasets',
            templateUrl: '/partials/account/organization/datasets.html',
            controller: 'OrganizationDatasets'
        })
        .state('root.services', {
            url: 'services/by-protocol/:serviceProtocol',
            templateUrl: '/partials/services/index.html',
            controller: 'Services'
        })
        .state('root.service', {
            url: 'services/:serviceId',
            abstract: true,
            template: '<ui-view></ui-view>',
            controller: function ($scope, service) {
                $scope.currentService = service;
            },
            resolve: {
                service: function ($stateParams, $http) {
                    return $http.get('/api/geogw/services/' + $stateParams.serviceId).then(function (result) {
                        return result.data;
                    });
                }
            }
        })
        .state('root.service.records', {
            url: '/records?keyword&organization&type&representationType&opendata&availability&distributionFormat&q&offset',
            templateUrl: '/partials/records/list.html',
            controller: 'ServiceRecords',
            reloadOnSearch: false,
            params: {
                keyword: { array: true },
                organization: { array: true },
                distributionFormat: { array: true }
            }
        })
        .state('root.service.record', {
            url: '/records/:recordId',
            templateUrl: '/partials/records/show.html',
            controller: 'Record',
            resolve: {
                record: function ($stateParams, $http) {
                    return $http.get('/api/geogw/services/' + $stateParams.serviceId + '/datasets/' + $stateParams.recordId).then(function (result) {
                        return result.data;
                    });
                }
            }
        });
});

mainApp.controller('navbar', function ($scope, $http) {
    $http.get('/api/me').success(function (data) {
        $scope.me = data;
    });
});
