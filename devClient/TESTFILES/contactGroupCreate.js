vhnApp.controller('ContactGroupCreateController', ['$scope', '$http', '$compile', function ($scope, $http, $compile) {

    $scope.listName = '';
    $scope.active = false;
    $scope.isLoading = false;
    $scope.message = '';

    $scope.createList = function () {
        $scope.message = '';

        if ($scope.listName) {
            $scope.isLoading = true;

            $http({
                method: 'GET',
                url: 'create',
                params: { listName: $scope.listName }
            }).success(function (data) {
                $scope.isLoading = false;

                if (data.StatusCode) {
                    if (data.StatusCode == 409) {
                        $scope.message = 'Det angivna listnamnet finns redan. Var god välj ett nytt namn.';
                    } else {
                        $scope.message = data.StatusCode + ': ' + data.Message;
                    }
                } else {
                    $scope.listName = '';
                    $scope.active = false;
                    appendData(data);
                }

            }).error(function (e) {
                $scope.isLoading = false;
                $scope.message = e.StatusCode + ': ' + e.Message;
            });
        } else {
            $scope.message = 'Var god ange ett namn för listan.';
        }
    }

    $scope.toggleActive = function () {
        $scope.active = !$scope.active;
        if (!$scope.active) {
            $scope.message = '';
            $scope.listName = '';
        } else {
            setTimeout(function () { $('#newListName').focus(); }, 0);
        }
    }

    function appendData(data) {

        var $newTile = $compile(data)($scope);
        var newTileId = $newTile.data('listid');
        $("#customLists > div:first-child").after($newTile);
        $('[data-listId="' + newTileId + '"]').css({
            'max-width': 0,
            opacity: 0
        }).animate({
            'max-width': 500,
            opacity: 1
        }, 500);

    }

}]);