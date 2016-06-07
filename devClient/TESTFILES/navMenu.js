vhnApp.controller('NavMenuController', ['$scope', 'searchService', function ($scope, searchService) {

    $scope.stateObjectValue = searchService.getStateObject();
    $scope.pageIds = '0';
    if ($('.pageToolsRoot').length && String($('.pageToolsRoot').data('kategori-ids')).length) {
        $scope.pageIds = $('.pageToolsRoot').data('kategori-ids');
    }
    $scope.creationIds = $scope.pageIds;
    $scope.changeMode = function () {
        if ($scope.stateObjectValue.navMode == 'menu') {
            searchService.setState('navMode', 'search' );
            searchService.clearAll();
            ga('send', 'event', 'search', 'category close');
        } else {
            searchService.setState('navMode', 'menu' );
            ga('send', 'event', 'search', 'category open');
        }
    };

    $scope.paramsObjectValue = searchService.getParamsObject();

    $scope.$watch('paramsObjectValue', function (newVal, oldVal) {
        $scope.searchPhrase = newVal.searchPhrase;

        if ($scope.searchPhrase != null && $scope.searchPhrase != "" && parseInt($scope.searchPhrase) > 0) {
            $scope.creationIds = $scope.searchPhrase;
        } else {
            $scope.creationIds = $scope.pageIds;
        }
    }, true);

}]);