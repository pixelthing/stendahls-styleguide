vhnApp.controller('AddUserToListController', ['$scope', '$http', function ($scope, $http) {

    $scope.listIsActive = false;

    $scope.toggleList = function() {
        if ($scope.listIsActive) {
            $scope.listIsActive = false;
        } else {
            $scope.listIsActive = true;
        }
    }

    $scope.change = function(userId, pageId) {
    }

}]);