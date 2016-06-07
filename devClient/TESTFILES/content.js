vhnApp.controller('ContentController', ['$scope', '$rootScope', 'searchService', function ($scope, $rootScope, searchService) {

    $scope.stateObjectValue = searchService.getStateObject();
    $scope.pageIsActive = true;
    $scope.searchIsActive = $scope.stateObjectValue.searchIsActive;

    $scope.$watch('stateObjectValue', function (newVal, oldVal) {
        $scope.searchIsActive = newVal.searchIsActive;
    }, true);

    $scope.backgroundClick = function () {
        $rootScope.$broadcast('backgroundClick');
    }

    $scope.clearSearch = function () {
        searchService.clearAll();
    };

    // used for immediate UI messaging (eg, "you have sucessfully deleted this user"). Passed to NotificationController.
    $scope.notifyNow = function (message, url) {
        var messagePacket = {
            message: message,
            url: url
        };
        $rootScope.$broadcast('notification', messagePacket);
    }

}]);