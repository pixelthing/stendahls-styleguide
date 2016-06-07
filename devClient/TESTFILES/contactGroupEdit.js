vhnApp.controller('ContactGroupEditController', ['$scope', '$http', '$routeParams', 'searchService', 'editListService', function ($scope, $http, $routeParams, searchService, editListService) {

    $scope.stateObjectValue = searchService.getStateObject();
    $scope.result = editListService.result;

    $scope.listIsActive = true;
    $scope.listIsLoading = false;

    $scope.listName = '';
    $scope.listCountCount = '';

    $scope.sortOptions = [
        { text: 'Osorterad', value: '' },
        { text: 'Namn', value: 'fullName' },
        { text: 'Företag', value: 'company' },
        { text: 'Arbetsroll', value: 'roles' }
    ];
    $scope.updateSortVariable = function(index) {
        $scope.sortVariable = $scope.sortOptions[index];
    }

    $scope.companyFilterOptions = [
        { text: 'Alla Företag', value: undefined }
    ];
    $scope.updateCompanyFilter = function (index) {
        $scope.companyFilter = $scope.companyFilterOptions[index];
    }

    $scope.professionFilterOptions = [
        { text: 'Alla Befattningar', value: undefined }
    ];
    $scope.updateProfessionFilter = function (index) {
        $scope.professionFilter = $scope.professionFilterOptions[index];
    }

    $scope.resetFilters = function () {
        $scope.sortVariable = $scope.sortOptions[0];
        $scope.companyFilter = $scope.companyFilterOptions[0];
        $scope.professionFilter = $scope.professionFilterOptions[0];
    };
    $scope.resetFilters();

    $scope.$watch('stateObjectValue', function (newVal, oldVal) {
        if (newVal.searchIsActive) {
            $scope.listIsActive = false;
        } else {
            $scope.listIsActive = true;
        }
        $scope.listIsLoading = newVal.isLoading.data;
    }, true);

    $scope.$watch('result', function (newVal, oldVal) {
        if ($scope.listIsLoading) {
            $scope.listName = 'var god vänta...';
        } else {
            $scope.listName = newVal.data.title;
            $scope.listCountCount = newVal.data.contacts.length;
        }
        buildCompanyFilter(newVal.data.contacts);
        buildProfessionFilter(newVal.data.contacts);
    }, true);

    $scope.submit = function () {
        editListService.updateListName($scope.result.data.title);
    }

    $scope.removeFilteredContacts = function () {
        var contactIds = [];
        for (var i = 0; i < $scope.filteredContacts.length; i++) {
            var contactId = $scope.filteredContacts[i].pageId;
            contactIds.push(contactId);
        }
        
        editListService.removeUsersFromList(contactIds, $scope.resetFilters);
    };

    $scope.updateListName = function () {
        editListService.updateListName($scope.listName);
    }

    $scope.resetListName = function () {
        $scope.listName = editListService.result.data.title;
    }

    $scope.clearSearch = function () {
        searchService.clearAll();
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    function buildCompanyFilter(contacts) {
        if (contacts) {
            var companyArray = [];

            for (var i = 0; i < contacts.length; i++) {
                if (contacts[i].company != null) {
                    companyArray.push(contacts[i].company);
                }
            }

            companyArray = companyArray.filter(onlyUnique);

            $scope.companyFilterOptions = [
                { text: 'Alla Företag', value: undefined }
            ];

            for (var j = 0; j < companyArray.length; j++) {
                if (companyArray[j]) {
                    $scope.companyFilterOptions.push({ text: companyArray[j], value: companyArray[j] });
                }
            }
        }
    }

    function buildProfessionFilter(contacts) {
        if (contacts) {
            var professionArray = [];

            for (var i = 0; i < contacts.length; i++) {
                professionArray.push(contacts[i].profession);
            }

            professionArray = professionArray.filter(onlyUnique);

            $scope.professionFilterOptions = [
                { text: 'Alla Befattningar', value: undefined }
            ];

            for (var j = 0; j < professionArray.length; j++) {
                if (professionArray[j]) {
                    $scope.professionFilterOptions.push({ text: professionArray[j], value: professionArray[j] });
                }
            }
        }
    }

}]);