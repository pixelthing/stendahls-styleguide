vhnApp.controller('CreateContentController', ['$scope', 'searchService', function ($scope, searchService) {

    $scope.stateObjectValue = searchService.getStateObject();
    $scope.dbCategoryIds = '';
    $scope.menuCategoryLeafId = null;
    $scope.searchIsActive = $scope.stateObjectValue.searchIsActive;

    $scope.creationIds = $scope.pageIds;

    $scope.init = function (categoryIds) {
        $scope.dbCategoryIds = categoryIds;
        $scope.creationIds = $scope.dbCategoryIds;
    };

    $scope.$watch('stateObjectValue', function (newVal, oldVal) {

        if (newVal.menuSelectedLeaf != oldVal.menuSelectedLeaf) {

            if (newVal.menuSelectedLeaf == null && $scope.dbCategoryIds.length > 0) {
                $scope.creationIds = $scope.dbCategoryIds;
            } else {

                if (newVal.menuSelectedLeaf != null) {
                    $scope.creationIds = newVal.menuSelectedLeaf;
                } else {
                    $scope.creationIds = 0;
                }
            }
        }
        $scope.searchIsActive = newVal.searchIsActive;
    }, true);

}]);