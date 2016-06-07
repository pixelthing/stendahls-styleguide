vhnApp.controller('ContactListController', ['$scope', '$http', '$timeout', '$window', function ($scope, $http, $timeout, $window) {

    $scope.contactListReady = true;                 // tells any partials with the user edit interface that it can only be visible and active if the controller is loaded within it's scope.
    $scope.contactListSelected = {};                // object containing the id and name of users currently selected
    $scope.contactListSelectedNumber = 0;           // number of users selected using multi-select
    $scope.contactListSelectedArray = [];
    $scope.contactListMulti = false;                // used to determine if we have the ability to to multi-select editing. Turns on the checkbox next to a user. Enabled by running contactListEnableMulti() at ng-init.

    $scope.contactListDeleteError1 = false;
    $scope.contactListDeleteError2 = false;
    $scope.contactListDeleteWaiting = false;        // spinner is visible during call to API end-point
    $scope.contactListDeleteIsOpen = false;         // modal is open
    $scope.contactListDelected = {};                // object of those users that have been deleted (used to show changes in the UI before the page is updated and fresh data is used)
    $scope.contactListDeleteCleaningUp = false;
    $scope.contactListDeletetRedirect = false;      // where to redirect to after a successful deletion. Can be a URL (redirect to that page), or false (don't redirect, eg when editing a list and updating the UI instead). You can't/shouldn't refresh the current page, it'll mo longer exist.

    $scope.contactListDisconnectError1 = false;
    $scope.contactListDisconnectWaiting = false;    // spinner is visible during call to API end-point
    $scope.contactListDisconnectIsOpen = false;     // modal is open
    $scope.contactListDisconnected = {};            // object of those users that have been disconnected (used to show changes in the UI before the page is updated and fresh data is used)
    $scope.contactListReconnected = {};             // object of those users that have been reconnected (used to show changes in the UI before the page is updated and fresh data is used)
    $scope.contactListDisconnectRedirect = false;   // where to redirect to after a successful disconnect. Can be "true" (refresh current page), a URL (redirect to that page), or false (don't redirect, eg when editing a list and updating the UI instead)
    $scope.contactListDisconnectReconnect = false;  // if we're asking to reconnect instead of disconnect

    // select/deselect one user as part of a multi-select
    $scope.contactListToggle = function (id, name) {
        // check for existence
        var exitsingIndex = ($scope.contactListSelected[id] ? true : false);
        // delete
        if (!exitsingIndex) {
            $scope.contactListSelected[id] = { 'id': id, 'name': name };
        // add
        } else {
            delete $scope.contactListSelected[id];
        }
    }

    // update the form field when multi-select is used
    $scope.$watch('contactListSelected', function (newVal, oldVal) {
        var keys = Object.keys(newVal);
        $scope.contactListSelectedNumber = keys.length;
        if (keys.length) {
            $scope.contactListSelectedArray = keys;
        } 
    }, true);

    // unselect all
    $scope.contactListCancel = function () {
        $scope.contactListSelected = {};
        return;
    }

    $scope.contactListEnableMulti = function () {
        $scope.contactListMulti = true;
    }

    /////////////////////
    // DELETE CONTACTS //
    /////////////////////

    // delete - open dialog
    $scope.contactListDeleteOpen = function (id,name,url) {
        if (id && name) {
            $scope.contactListSelected = {};
            $scope.contactListSelected[id] = { 'id': id, 'name': name };
        }
        $scope.contactListDeleteIsOpen = true;
        $scope.contactListDeleteRedirect = false;
        if (url) {
            $scope.contactListDeleteRedirect = url;
        }
    }

    // delete - close dialog
    $scope.contactListDeleteClose = function () {
        $scope.contactListDeleteWaiting = false;
        $scope.contactListDeleteError1 = false;
        $scope.contactListDeleteError2 = false;
        $scope.contactListDeleteIsOpen = false;
    }

    // validation that a reason is given
    $scope.contactListDeleteReasonCheck = function () {
        if (!($scope.contactListDeleteReason && $scope.contactListDeleteReason.length) || typeof $scope.contactListDeleteReason === 'undefined') {
            $scope.contactListDeleteError2 = true;
            return true;
        } else {
            $scope.contactListDeleteError2 = false;
            return false;
        }
    }

    // delete the selected
    $scope.contactListDelete = function () {

        // we need people!
        if ($scope.contactListSelectedNumber < 1) {
            $scope.contactListDeleteError1 = true;
            return;
        }

        // we need a reason!
        if ($scope.contactListDeleteReasonCheck()) {
            return;
        }

        // start spinner
        $scope.contactListDeleteWaiting = true;

        // ajax response
        $http({
            method: 'post',
            url: '/api/DirectoryEditor/MarkContactsAsDeleted',
            data: angular.toJson({ contacts: $scope.contactListSelectedArray, reason: $scope.contactListDeleteReason }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(function (response) {
        
            // if a page redirect is specified:
            if ($scope.contactListDeleteRedirect) {
                if (typeof $scope.contactListDeleteRedirect === 'string') {
                    $window.location = $scope.contactListDeleteRedirect;
                    return;
                }
            }
            // set up message
            var notificationMessage = $scope.contactListSelectedNumber + " användare har raderats!";
            if ($scope.contactListSelectedNumber === 1) {
                for (var key in $scope.contactListSelected) {
                    var contactName = $scope.contactListSelected[key].name;
                }
                notificationMessage = contactName + " har strukits!";
            }
            // cleanup form/model
            $scope.contactListDeleteClose();
            $scope.contactListDeleteWaiting = false;
            $scope.contactListDeleteError1 = false;
            $scope.contactListDeleteError2 = false;
            // set the "cleanup mode" which carrys out the fade-out animation
            $scope.contactListDeleteCleaningUp = true;
            // delete the items from the UI
            $timeout(function () {
                extend($scope.contactListDelected, $scope.contactListSelected);
                $scope.contactListSelected = {};
                $scope.contactListDeleteCleaningUp = false;
            }, 1000);
            // add notification (send to contentController, which send to notifications)
            $scope.notifyNow(notificationMessage);
        }, function(response) {
            $scope.notifyNow('LEDSEN - ERROR RADERING');
            $scope.contactListDeleteClose();
            $scope.contactListDeleteWaiting = false;
            $scope.contactListDeleteError1 = false;
            $scope.contactListDeleteError2 = false;
        });


    }

    // clean up list after deletion
    $scope.contactListDeleteCleanUp = function () {
        
        $scope.contactListCleaningUpMode = true;

    }

    /////////////////////////////////////
    // DISCONNECT CONTACTS FROM TACDIS //
    /////////////////////////////////////

    // Disconnect - open dialog
    $scope.contactListDisconnectOpen = function (id, name, url, reconnect) {
        if (id && name) {
            $scope.contactListSelected = {};
            $scope.contactListSelected[id] = { 'id': id, 'name': name };
        }
        $scope.contactListDisconnectIsOpen = true;
        $scope.contactListDisconnectRedirect = false;
        if (url) {
            $scope.contactListDisconnectRedirect = url;
        }
        $scope.contactListDisconnectReconnect = false;
        if (reconnect) {
            $scope.contactListDisconnectReconnect = true;
        }
    }

    // Disconnect - close dialog
    $scope.contactListDisconnectClose = function () {
        $scope.contactListDisconnectWaiting = false;
        $scope.contactListDisconnectError1 = false;
        $scope.contactListDisconnectIsOpen = false;
    }

    // Disconnect the selected
    $scope.contactListDisconnect = function () {

        // we need people!
        if ($scope.contactListSelectedNumber < 1) {
            $scope.contactListDisconnectError1 = true;
            return;
        }

        // start spinner
        $scope.contactListDisconnectWaiting = true;

        // ajax response
        $http({
            method: 'post',
            url: '/api/DirectoryEditor/HandleConnectionToTacdis',
            data: angular.toJson({ contacts: $scope.contactListSelectedArray, disconnect: ($scope.contactListDisconnectReconnect ? false : true ) }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(function (response) {

            // if a page redirect is specified:
            if ($scope.contactListDisconnectRedirect) {
                if (typeof $scope.contactListDisconnectRedirect === 'string') {
                    $window.location = $scope.contactListDisconnectRedirect;
                } else {
                    $window.location.reload(true);
                }
                return;
            }

            // set up message
            var notificationMessagePart = " har kopplats bort från TACDIS!";
            if ($scope.contactListDisconnectReconnect) {
                notificationMessagePart = " har kopplats till TACDIS!";
            }
            var notificationMessage = $scope.contactListSelectedNumber + " användare" + notificationMessagePart;
            if ($scope.contactListSelectedNumber === 1) {
                for (var key in $scope.contactListSelected) {
                    var contactName = $scope.contactListSelected[key].name;
                    break;
                }
                notificationMessage = contactName + notificationMessagePart;
            }
            // cleanup form/model
            $scope.contactListDisconnectClose();
            $scope.contactListDisconnectWaiting = false;
            $scope.contactListDisconnectError1 = false;
            // toggle list of people being connected/disconnected
            for (var key in $scope.contactListSelected) {
                // Mark any contacts as reconnected in the UI
                if ($scope.contactListDisconnectReconnect) {
                    extend($scope.contactListReconnected, $scope.contactListSelected);
                    if ($scope.contactListDisconnected[key]) {
                        delete $scope.contactListDisconnected[key];
                    }
                // Mark any contacts as disconnected in the UI
                } else {
                    extend($scope.contactListDisconnected, $scope.contactListSelected);
                    if ($scope.contactListReconnected[key]) {
                        delete $scope.contactListReconnected[key];
                    }
                }
            }
            $scope.contactListSelected = {};
            // add notification (send to contentController, which send to notifications)
            $scope.notifyNow(notificationMessage);
        }, function (response) {
            $scope.notifyNow('LEDSEN - ERROR DISCONNECTING FROM TACDIS');
            $scope.contactListDisconnectClose();
            $scope.contactListDisconnectWaiting = false;
            $scope.contactListDisconnectError1 = false;
        });


    }

}]);