vhnApp.controller('WorkflowsController', ['$scope', '$http', function($scope, $http) {
    $scope.result = [];
    $scope.isLoading = false;
    $scope.take = 16;


    $scope.showErrorDialog = function(message) {
        alert(message);
    }

}]);