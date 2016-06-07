vhnApp.controller('ListViewController', ['$scope', '$cookieStore', function ($scope, $cookieStore) {

    // SWAPPING VIEWS

    var listViewCookieName = 'defaultListView';
    $scope.listView = '';

    $scope.listViewInit = function (cookieName,defaultView) {
        if (cookieName.length) {
            listViewCookieName = cookieName;
            $scope.listView = $cookieStore.get(listViewCookieName) || "";
        }
        if (!$scope.listView.length && defaultView) {
            $scope.listView = defaultView;
        }
    }

    $scope.swapView = function (newView) {
        $scope.listView = newView;
        var expireTime = new Date();
        expireTime.setDate(expireTime.getDate() + 30);
        $cookieStore.put(listViewCookieName, newView, { 'expires': expireTime });
    }

    //SORTING

    $scope.sortOptions = null;
    $scope.sortVariable = null;

    $scope.listViewSortInit = function (sortOptions) {
        if (sortOptions.length) {
            $scope.sortOptions = sortOptions;
            $scope.sortVariable = $scope.sortOptions[0];
        }
    }

    $scope.updateSortVariable = function (index) {
        $scope.sortVariable = $scope.sortOptions[index];
    }

}]);