vhnApp.controller('ProfileController', ['$scope', '$http', function($scope, $http) {
    $scope.result = [];
    $scope.isLoading = false;
    $scope.take = 16;

    $scope.workflowResult = [];
    $scope.availableWorkflows = [];
    $scope.approvedWorkflows = [];
    $scope.rejectedWorkflows = [];

    getMyWorkflows();

    function getMyWorkflows() {
        $scope.isLoading = true;
        $http({
            method: 'GET',
            url: '/api/workflows/myworkflows'
        }).success(function (data) {
            $scope.isLoading = false;
            $scope.workflowResult = data;
        }).error(function (e) {
            $scope.isLoading = false;
            ga('send', 'exception', {
                'exDescription': e.message,
                'exFatal': false,
                'appName': 'vhnApp.ProfileController.getMyWorkflows'
            });
        });
    }

    $scope.getApprovedWorkflows = function () {

        $scope.isLoading = true;
        $http({
            method: 'GET',
            url: '/api/workflows/approvedworkflows'
        }).success(function (data) {
            $scope.isLoading = false;
            $scope.approvedWorkflows = data;
        }).error(function (e) {
            $scope.isLoading = false;
            ga('send', 'exception', {
                'exDescription': e.message,
                'exFatal': false,
                'appName': 'vhnApp.ProfileController.getApprovedWorkflows'
            });
        });
    }

    $scope.getRejectedWorkflows = function () {

        $scope.isLoading = true;
        $http({
            method: 'GET',
            url: '/api/workflows/rejectedworkflows'
        }).success(function (data) {
            $scope.isLoading = false;
            $scope.rejectedWorkflows = data;
        }).error(function (e) {
            $scope.isLoading = false;
            ga('send', 'exception', {
                'exDescription': e.message,
                'exFatal': false,
                'appName': 'vhnApp.ProfileController.getRejectedWorkflows'
            });
        });
    }

    $scope.getWorkflowContainer = function(availableWorkflowsTitle) {
        
        $scope.isLoading = true;
        $http({
            method: 'GET',
            url: '/api/workflows/secondaryprofessioncontainers'
        }).success(function (data) {
            $scope.isLoading = false;
            $scope.availableWorkflows = data;
            $scope.availableWorkflowsTitle = availableWorkflowsTitle;
        }).error(function (e) {
            $scope.isLoading = false;
            ga('send', 'exception', {
                'exDescription': e.message,
                'exFatal': false,
                'appName': 'vhnApp.ProfileController.getWorkflowContainer'
            });
        });
    }

    $scope.getWorkflowContainerFor = function (rootId, availableWorkflowsTitle) {

        $scope.isLoading = true;
        var queryObject = {
            rootReference: rootId,
            take: $scope.take,
            skip: 0
        };
        $http({
            method: 'GET',
            url: '/api/workflows/settingcontainers',
            params: queryObject
        }).success(function (data) {
            $scope.isLoading = false;
            $scope.availableWorkflows = data;
            $scope.availableWorkflowsTitle = availableWorkflowsTitle;
        }).error(function (e) {
            $scope.isLoading = false;
            ga('send', 'exception', {
                'exDescription': e.message,
                'exFatal': false,
                'appName': 'vhnApp.ProfileController.getWorkflowContainerFor'
            });
        });
    }

    $scope.initPopUp = function () {
        $scope.showApplyOnBehalfOf = false;
    }

    $scope.workflowApplySubmit = function (form) {
        if (form.$valid === false) {
            return false;
        }
    }

    var indexedContainers = [];

    $scope.getWorkflowsToFilter = function () {
        indexedContainers = [];
        return $scope.workflowResult.data;
    }

    $scope.getAvailableWorkflowsToFilter = function () {
        indexedContainers = [];
        return $scope.availableWorkflows.data;
    }

    $scope.getApprovedWorkflowsToFilter = function () {
        indexedContainers = [];
        return $scope.approvedWorkflows.data;
    }

    $scope.getRejectedWorkflowsToFilter = function () {
        indexedContainers = [];
        return $scope.rejectedWorkflows.data;
    }

    $scope.filterContainers = function (workflow) {
        var isContainerNew = indexedContainers.indexOf(workflow.containerName) == -1;
        if (isContainerNew) {
            indexedContainers.push(workflow.containerName);
        }
        return isContainerNew;
    }

    $scope.setTitle = function(titleName) {
        $scope.selectedContainerName = titleName;
    }

    $scope.showErrorDialog = function(message) {
        alert(message);
    }

    $scope.checkTextHeight = function (el) {
        //console.log(el)

    }

    var ITResponsibleLookup = {};
    var ITResponsibleUserId = null
    $scope.ITResponsibleCDSID = null;
    $scope.initITResponsible = function (userId,cdsid) {
        if (cdsid == 'EXISTINGCDSID') {
            cdsid = null;
        }
        ITResponsibleUserId = userId;
        $scope.ITResponsibleCDSID = cdsid;
    }
    $scope.getITResponsible = function (val) {
        return $http.get('/api/contact/QueryGroupContacts', {
            params: {
                query: val,
                contactid: ITResponsibleUserId,
                level: 2,
                skip: 0,
                take: 1000
            }
        }).then(function (response) {
            ITResponsibleLookup = response.data;
            var filtredContacts = $scope.filterContacts(response);
            return $scope.renderContact(filtredContacts);
        });
    };

    $scope.filterContacts = function (response) {
        var filtredData= response.data.filter(function (item) {
            if (item.cdsid !== null) {
                return item;
            }
        });

        return filtredData;
    }

    $scope.renderContact = function(contacts) {
        return contacts.map(function (item) {
            return item.name + ' [' + item.cdsid + ']';
        });
    }
    $scope.clearITResponsible = function () {
        $scope.ITResponsibleCDSID = null;
    }
    $scope.chooseITResponsible = function (item) {
        for (var i = 0; i < ITResponsibleLookup.length; i++) {
            if (ITResponsibleLookup[i].name + ' [' + ITResponsibleLookup[i].cdsid + ']' === item) {
                $scope.ITResponsibleCDSID = ITResponsibleLookup[i].cdsid;
                break;
            }
        }
    }

    var SalesManagerLookup = {};
    var SalesManagerUserId = null;
    $scope.SalesManagerCDSID = null;

    $scope.initSalesManager = function (userId, cdsid) {
        if (cdsid == 'EXISTINGCDSID') {
            cdsid = null;
        }
        SalesManagerUserId = userId;
        $scope.SalesManagerCDSID = cdsid;
    }

    $scope.getSalesManager = function(val) {
        return $http.get('/api/contact/QueryGroupContacts', {
            params: {
                query: val,
                contactid: SalesManagerUserId,
                level: 2,
                skip: 0,
                take: 1000
            }
        }).then(function(response) {
            SalesManagerLookup = response.data;
            var filtredContacts = $scope.filterContacts(response); 
            return $scope.renderContact(filtredContacts);
        });
    }
    $scope.clearSalesManager = function () {
        $scope.SalesManagerCDSID = null;
    }
    $scope.chooseSalesManager = function(item) {
        for (var i = 0; i < SalesManagerLookup.length; i++) {
            if (SalesManagerLookup[i].name + ' [' + SalesManagerLookup[i].cdsid + ']' === item) {
                $scope.SalesManagerCDSID = SalesManagerLookup[i].cdsid;
                break;
            }
        }
    }


    var ApplicantUserLookup = {};
    var ApplicantUserId = null;
    $scope.ApplicantUserCDSID = null;

    $scope.initApplicantUser = function (userId, cdsid) {
        if (cdsid == 'EXISTINGCDSID') {
            cdsid = null;
        }
        ApplicantUserId = userId;
        $scope.ApplicantUserCDSID = cdsid;
    }

    $scope.getApplicantUser = function (val) {
        return $http.get('/api/contact/QueryEditableContacts', {
            params: {
                query: val,
                contactid: ApplicantUserId,
                level: 2,
                skip: 0,
                take: 1000
            }
        }).then(function (response) {
            ApplicantUserLookup = response.data;
            var filtredContacts = $scope.filterContacts(response);
            return $scope.renderContact(filtredContacts);
        });
    }
    $scope.clearApplicantUser = function () {
        $scope.ApplicantUserCDSID = null;
    }
    $scope.chooseApplicantUser = function (item) {
        for (var i = 0; i < ApplicantUserLookup.length; i++) {
            if (ApplicantUserLookup[i].name + ' [' + ApplicantUserLookup[i].cdsid + ']' === item) {
                $scope.ApplicantUserCDSID = ApplicantUserLookup[i].cdsid;
                break;
            }
        }
    }

    $scope.showApplyOnBehalfOf = false;

    $scope.toggleApplyOnBehalfOfForm = function() {
        $scope.showApplyOnBehalfOf = !$scope.showApplyOnBehalfOf;
    }

}]).directive('ngUpdateHidden', function () {
    return function (scope, el, attr) {
        var model = attr['ngModel'];
        scope.$watch(model, function (nv) {
            el.val(nv);
        });

    };
});