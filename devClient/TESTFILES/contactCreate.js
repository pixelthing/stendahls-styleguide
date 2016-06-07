vhnApp.controller('ContactCreateController', ['$scope', '$http', '$timeout', '$window', function ($scope, $http, $timeout, $window) {

    $scope.contactCreateWaiting = false;        // spinner is visible during call to API end-point
    $scope.contactCreateIsOpen = false;         // modal is open
    $scope.cFormSelectContactInputId = '';
    $scope.cFormInputValidateValue = '';
    $scope.cFormDisabled = true;
    $scope.cdsidInputFeedback = '';
    $scope.goToContactcardLink = '';
    //var contactCreateParentId = '';

    // init
    //$scope.contactCreateInit = function (redirectUrl, parentId) {
    //    $scope.contactCreateRedirect = redirectUrl;
    //    contactCreateParentId = parentId;
    //}

    $scope.contactCreateInit = function (redirectUrl) {
        $scope.contactCreateRedirect = redirectUrl;
    }

    // open dialog
    $scope.contactCreateOpen = function () {
        $scope.contactCreateIsOpen = true;
    }

    // delete - close dialog
    $scope.contactCreateClose = function () {
        $scope.contactCreateIsOpen = false;
    }

    function clearCurrentFields() {
        $scope.contactCreateInputFirstname = '';
        $scope.contactCreateInputSurname = '';
        $scope.contactCreateInputEmail = '';
        $scope.contactCreateInputTel = '';
        $scope.contactCreateInputMobile = '';
        $scope.cdsidInputFeedback = '';
        $scope.goToContactcardLink = '';
    }

    $scope.validateCdsid = function (cdsid) {
        if (cdsid.length < 4) {
            return false;
        }

        $http({
            method: 'GET',
            url: '/api/directoryeditor/LookupCdsid',
            params: { cdsid: cdsid }
        }).success(function(response) {

            if (response.status == 0) {
                // not valid

                clearCurrentFields();
                $scope.cdsidInputFeedback = 'Felaktigt CDS-ID.';
                $scope.cFormDisabled = true;
            } else if (response.status == 1) {
                // CDSID exists in Kontakter utan tillhörighet, Copy data.

                clearCurrentFields();

                $scope.contactCreateInputFirstname = response.data.firstName;
                $scope.contactCreateInputSurname = response.data.surname;
                $scope.contactCreateInputEmail = response.data.email;
                $scope.contactCreateInputTel = response.data.telephoneNumber;
                $scope.contactCreateInputMobile = response.data.mobileNumber;
                // inject the närmaste chef into the typeahead component 
                $scope.$broadcast('updateContactDefault', { 'selectedId': response.data.managerId, 'selectedName': response.data.managerName });

                $scope.cdsidInputFeedback = 'Kontakten finns redan men saknar tillhörighet. Var god komplettera.';
                $scope.cFormDisabled = false;
            } else if (response.status == 2) {
                // CDSID exists already. Create link to contact card

                clearCurrentFields();

                $scope.cFormDisabled = true;
                $scope.cdsidInputFeedback = 'Kontakten finns redan.';
                $scope.goToContactcardLink = response.data;
            } else if (response.status == 3) {

                clearCurrentFields();
                $scope.cFormDisabled = false;
            }
        });
    }

    // submit
    $scope.contactCreateSubmit = function () {

        // test for all required fields
        $scope.contactCreateSubmitted = true;
        $scope.contactCreateError1 = false;
        if (
            !$scope.contactCreateInputCdsid
            || !$scope.contactCreateInputCdsid.length
            || !$scope.contactCreateInputFirstname
            || !$scope.contactCreateInputFirstname.length
            || !$scope.contactCreateInputSurname
            || !$scope.contactCreateInputSurname.length
            || !$scope.contactCreateInputEmail
            || !$scope.contactCreateInputEmail.length
            || !$scope.contactCreateInputTel
            || !$scope.contactCreateInputTel.length
            || !$scope.contactCreateInputCo
            || !$scope.contactCreateInputCo > 0
            || !$scope.formInput['contactCreateInputManager']
            || !$scope.formInput['contactCreateInputManager'].length
            //|| !$scope.formInput['contactCreateInputCdsid']
            //|| !$scope.formInput['contactCreateInputCdsid'].length
        ) {
            $scope.contactCreateError1 = true;
            return;
        }

        // spinner on
        $scope.contactCreateWaiting = true;

        // put together a post
        var postOj = {
            //'cdsid'                 : $scope.formInput['contactCreateInputCdsid'], // passed back up scope chain from controller
            'cdsid'                 : $scope.contactCreateInputCdsid,
            //'parentId'              : contactCreateParentId,
            'companyId'             : $scope.contactCreateInputCo,
            'firstName'             : $scope.contactCreateInputFirstname,
            'surName'               : $scope.contactCreateInputSurname,
            'email'                 : $scope.contactCreateInputEmail,
            'phone'                 : $scope.contactCreateInputTel,
            'mobile'                : $scope.contactCreateInputMobile,
            'managerId'             : $scope.formInput['contactCreateInputManager'], // passed back up scope chain from controller
            'volvoid'               : $scope.contactCreateInputVid,
            'secondaryProfessions'  : $scope.formInput['contactCreateInputProfessions'], // passed back up scope chain from controller
        }

        // ajax response
        $http({
            method: 'post',
            url: '/api/DirectoryEditor/CreateNewContact',
            data: angular.toJson(postOj),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(function (response) {

            // if a page redirect is specified:
            if ($scope.contactCreateRedirect) {
                if (typeof $scope.contactCreateRedirect === 'string') {
                    $window.location = $scope.contactCreateRedirect;
                } else {
                    $window.location.reload(true);
                }
                return;
            }

            //
            // BELOW NOT CURRENTLY USED, PAGE REFRESHES INSTEAD
            //

            // set up message
            var notificationMessage = $scope.contactCreateInputFirstname + " " + $scope.contactCreateInputSurname + " skarpade!";
            // cleanup form/model
            $scope.contactCreateClose();
            $scope.contactCreateWaiting = false;
            $scope.contactCreateError1 = false;
            // delete the items from the UI
            $timeout(function () {
                // stuff happens here if we don't redirect
            }, 1000);
            // add notification (send to contentController, which send to notifications)
            $scope.notifyNow(notificationMessage);

        }, function (response) {
            $scope.notifyNow('LEDSEN - ERROR RADERING');
            $scope.contactCreateClose();
            $scope.contactCreateWaiting = false;
            $scope.contactCreateError1 = false;
        });

    }

}]); 