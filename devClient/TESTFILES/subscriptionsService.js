vhnApp.service('subscriptionsService', ['$http', function ($http) {

    var isReady = 0;

    var getUserSubscribeableCategories = function () {
        return $http({
            method: 'GET',
            url: '/api/contact/getsubscribeablecategories'
        }).success(function (response) {
            isReady += 0.5;
            UserSubscribeableCategories = response;
            return response;
        }).error(function (e) {
            isReady += 0.5;
            return e;
        });
    }

    var getUserSubscribedCategories = function () {
        return $http({
            method: 'GET',
            url: '/api/contact/getcategorysubscriptionsforuser'
        }).success(function (response) {
            isReady += 0.5;
            UserSubscribeableCategories = response;
            return response;
        }).error(function (e) {
            isReady += 0.5;
            return e;
        });
    }

    var updateSubscription = function (categoryId, Active) {
        isReady -= 0.5;
        return $http({
            method: 'POST',
            url: '/api/contact/updatesubscriptions/',
            data: angular.toJson([{ "pageId": categoryId, "active": Active }],true),
            headers: { 'Content-Type': 'application/json' }
        }).success(function (response) {
            isReady += 0.5;
            return true;
        }).error(function (e) {
            isReady += 0.5;
            return false;
        });
    }

    return {
        isReady: isReady,
        updateSubscription: updateSubscription,
        getUserSubscribeableCategories: getUserSubscribeableCategories,
        getUserSubscribedCategories: getUserSubscribedCategories
    }
}]);