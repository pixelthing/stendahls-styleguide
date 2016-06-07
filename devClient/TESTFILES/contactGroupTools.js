vhnApp.controller('ContactGroupToolsController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
    $scope.isLoading = false;
    $scope.removeDialog = false;
    $scope.optionsDialog = false;
    $scope.message = '';

    $scope.deleteList = function (idString) {
        $scope.isLoading = true;

        $http({
            method: 'GET',
            url: '/api/contactlist/deletecontactlist/' + idString
        }).success(function (data) {
            var $list = $('#customLists').find('[data-listId="' + data.id + '"]');

            if (data.StatusCode) {
                $scope.message = data.StatusCode + ': ' + data.Message;
            } else {
                $list.find('.tileHiddenInit').addClass('tileHidden');
                $list.animate({
                    opacity: 0,
                    width: 0,
                    padding: 0
                }, 500);
                $timeout(function () {
                    $list.remove();
                }, 500);
            }
        }).error(function (e) {
            $scope.isLoading = false;
            $scope.message = e.statusCode + ': ' + e.message;
            ga('send', 'exception', {
                'exDescription': e.statusCode + ': ' + e.message,
                'exFatal': false,
                'appName': 'vhnApp.ContactGroupToolsController.deleteList'
            });
        });
    }

    $scope.toggleRemoveDialog = function() {
        $scope.removeDialog = !$scope.removeDialog;

        if ($scope.optionsDialog) {
            $scope.toggleOptionsDialog();
        }

        if (!$scope.removeDialog) {
            $scope.message = '';
        }
    }

    $scope.toggleOptionsDialog = function () {
        $scope.optionsDialog = !$scope.optionsDialog;

        if ($scope.removeDialog) {
            $scope.toggleRemoveDialog();
        }

        if (!$scope.optionsDialog) {
            $scope.message = '';
        }
    }
}]);