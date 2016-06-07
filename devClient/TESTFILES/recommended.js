vhnApp.controller('RecommendedSliderController', ['$scope', '$http', '$timeout', '$q', 'searchService', 'sessionCacheService', function ($scope, $http, $timeout, $q, searchService, sessionCacheService) {

    var localStorageKey = 'vhnHomeRecommended';
    var ajaxUrl = '/api/search/recommended';
    $scope.category = undefined;
    $scope.items = [];
    $scope.isLoading = false;

    $scope.init = function () {

        $scope.isLoading = true;

        // apply the data to the model
        var applyData = function (response) {
            // if the offline data has been sent, and the online data doesn't differ greatly, the promise will resolve with an empty response
            if (!response) {
                return;
            }
            $scope.items = [];
            $timeout(function () {
                $scope.items = response.data.data.slice(0, 24);
            }, 0);
            $timeout(function () {
                $scope.isLoading = false;
                $scope.reCalc();
            }, 300);
            $timeout(function () {
                $(document).trigger('scroll'); // forces lazyload to paint any missing images
            }, 1000);
        }

        // retrieve info from off or online
        sessionCacheService.jsonCache({
                'storageKey'    : localStorageKey,
                'ajaxUrl'       : ajaxUrl,
                'ajaxCheck'     : true,
                'comparisonPath': 'data.data',
                'comparisonMax' : 4,
            })
            .then(
                // resolve
                function (response) {
                    //console.log('resolve!')
                    applyData(response);
                // reject
                }, function (error) {
                    //console.log('reject!')
                    console.log(error.error)
                // update
                }, function (update) {
                    //console.log('update!')
                    applyData(update);
                }
            );
    }

    $scope.seeAll = function () {
        searchService.clearAll();
        searchService.setLocation('recommended');
    };
}]);