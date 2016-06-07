vhnApp.controller('ContactGroupsController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

    $scope.emailListObj = {};
    $scope.emailListModal = function (listId, listName) {
        $scope.emailListObj.emails = [];
        $http({
            method: 'GET',
            url: '/api/mail/' + listId + '/sentemails/1/99/'
        }).
        success(function (data) {

            for (var i = 0; i < data.data.length; i++) {
                var dateObj = new Date(data.data[i].createDate);
                var dateHuman = dateObj.getFullYear() + '-' + ( dateObj.getMonth() + 1 ) + '-' + dateObj.getDate() + ' ' + (dateObj.getUTCHours() < 10 ? '0' : '') + dateObj.getHours() + ':' + (dateObj.getMinutes() < 10 ? '0' : '') + dateObj.getMinutes();
                data.data[i]['createDateHuman'] = dateHuman;
                data.data[i]['expand'] = false;
                console.log(data.data[i].createDate + ' - ' + dateHuman);
            }
            $scope.emailListObj.name = listName;
            $scope.emailListObj.emails = data.data;
            $timeout(function () {
                $('#emailList').modal("show");
            });

        }).
        error(function (data, status, headers, config) {
            
            $scope.emailListObj.emails = [];
            alert('Det har inte skickats någon e-post till denna listan');

        });;
    }

    
    $scope.emailListDetail = function (index) {
        $scope.emailListObj.emails[index]['expand'] = !$scope.emailListObj.emails[index]['expand'];
    }

}]);