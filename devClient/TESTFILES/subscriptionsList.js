vhnApp.controller('SubscriptionsListController', ['$scope', 'subscriptionsService', function ($scope, subscriptionsService) {


    $scope.catsAvailable = {};
    $scope.catsListAvailable = [];
    $scope.catsListSubscribed = [];
    $scope.catsListLoading = [];

    var getCatsAvailable = function () {
        subscriptionsService.getUserSubscribeableCategories().then(function (response) {
            $scope.catsAvailable = response.data;
            for (var i = 0; i < $scope.catsAvailable.length ; i++) {
                $scope.catsListAvailable.push($scope.catsAvailable[i].id);
            }
        }, function () {
            $scope.catsAvailable = false;
            $scope.catsListAvailable = [];
        });
    }();

    var getcatsListSubscribed = function () {
        subscriptionsService.getUserSubscribedCategories().then(function (response) {
            var subscribedRaw = response.data;
            for (var i = 0; i < subscribedRaw.length ; i++) {
                if (subscribedRaw[i].active === true) {
                    $scope.catsListSubscribed.push(subscribedRaw[i].subscribesToId);
                }
            }
            subscribedRaw = null;
        }, function () {
            $scope.catsListSubscribed = false;
        });
    }();

    $scope.subscribe = function (categoryId) {
        $scope.catsListLoading.push(categoryId);
        var categoryArray = [categoryId];
        subscriptionsService.updateSubscription(categoryId, true).then(function () {
            $scope.catsListSubscribed.push(categoryId);
            $scope.catsListLoading.splice($scope.catsListLoading.indexOf(categoryId), 1);
        })
    }

    $scope.unsubscribe = function (categoryId) {
        $scope.catsListLoading.push(categoryId);
        subscriptionsService.updateSubscription(categoryId, false).then(function () {
            $scope.catsListSubscribed.splice($scope.catsListSubscribed.indexOf(categoryId), 1);
            $scope.catsListLoading.splice($scope.catsListLoading.indexOf(categoryId), 1);
        })
    }


}]);