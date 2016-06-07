vhnApp.controller('NotificationController', ['$scope', '$http', '$rootScope', function ($scope, $http, $rootScope) {

    $scope.messages = [];
    $scope.notificationResult = undefined;

    init();

    function init() {

        getNotifications();

        setInterval(getMessages, 60000);

        $('body').on('click', '.js-cNotificationClose', function () {
            if (!$scope.messages.length) {
                return;
            }
            var messageId = $scope.messages[0].id;
            if (!messageId) {
                $scope.messages.shift();
                return;
            }
            $http({
                method: 'GET',
                url: '/api/notification/read/' + messageId
            }).success(function (data) {
                $scope.notificationResult = data;
                $scope.messages.shift();
            }).error(function (e) {
                ga('send', 'exception', {
                    'exDescription': e.message,
                    'exFatal': false,
                    'appName': 'vhnApp.NotificationController.init'
                });
            });
        });
    }

    function getMessages() {

        if (!$scope.notificationResult.data) {
            return;
        }

        $.each($scope.notificationResult.data, function (index, value) {
            $scope.messages.push({
                message: this.message,
                url: this.url,
                id: this.id
            });
        });
        
    }

    function getNotifications() {
        $scope.isLoading = true;
        $http({
            method: 'GET',
            url: '/api/notification/get'
        }).success(function (data) {
            $scope.isLoading = false;
            $scope.notificationResult = data;
            if (data != '' && data.length != 0) {
                getMessages();
            }
        }).error(function (e) {
            $scope.isLoading = false;
            ga('send', 'exception', {
                'exDescription': e.message,
                'exFatal': false,
                'appName': 'vhnApp.NotificationController.getNotifications'
            });
        });
    }

    // listen for **anything** sending a NotifyNow({message: 'blah blah',url: 'http://sssss'}) to the contentController (which is broadcast and picked up here)
    // often used for immediate UI messaging (eg, you have sucessfully deleted this user)
    $rootScope.$on('notification', function (ev,messagePacket) {
        $scope.messages.unshift(messagePacket);
    });

}]);