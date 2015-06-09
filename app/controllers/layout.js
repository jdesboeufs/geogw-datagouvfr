angular.module('mainApp').controller('mainCtrl', function ($scope, statistics) {
	$scope.statistics = statistics;
	$scope.organizations = _.filter(statistics.organizations, 'featured');
});
