vhnApp.controller('ContactGroupController', ['$scope', '$http', function ($scope, $http) {

    $scope.result = [];
    $scope.isLoading = false;
    $scope.take = 16;

    $scope.listId = $('html').data('list-id');
    $scope.creator = $('html').data('list-creator');

    $scope.listIsActive = true;
    $scope.listIsLoading = false;
    $scope.filtersViewable = false;

    $scope.listName = '';
    $scope.listCount = '';

    if ($scope.listId) {
        getUsersInList();
    }

    $scope.revealFilters = function () {
        if ($scope.filtersViewable === true) {
            $scope.filtersViewable = false;
        } else {
            $scope.filtersViewable = true;
        }
    }

    $scope.sortOptions = [
        { text: 'Osorterad', value: '' },
        { text: 'Namn', value: 'fullName' },
        { text: 'Företag', value: 'company' },
        { text: 'Arbetsroll', value: 'roles' }
    ];
    $scope.sortVariable = $scope.sortOptions[0];

    $scope.updateSortVariable = function(index) {
        $scope.sortVariable = $scope.sortOptions[index];
    }

    $scope.companyFilterOptions = [
        { text: 'Alla', value: undefined }
    ];

    $scope.companyFilter = $scope.companyFilterOptions[0];

    $scope.updateCompanyFilter = function (index) {
        $scope.companyFilter = $scope.companyFilterOptions[index];
    }

    function getUsersInList() {
        $scope.isLoading = true;
        $scope.listName = 'var god vänta...';
        var queryObject = {
            //q: $scope.paramsObject.searchPhrase,
            //type: $scope.paramsObject.type,
            contactlistid: $scope.listId,
            creator: $scope.creator,
            take: $scope.take,
            skip: 0
        };
        $http({
            method: 'GET',
            url: '/api/contactlist/get/',
            params: queryObject
        }).success(function (data) {
            $scope.isLoading = false;
            $scope.result = data;
            $scope.listCount = data.data.totalCount;
            $scope.listName = data.data.title;
        }).error(function (e) {
            $scope.isLoading = false;
        });
    }

    $scope.getMoreItems = function () {
        $scope.isLoading = true;
        var queryObject = {
            contactlistid: $scope.listId,
            creator: $scope.creator,
            take: $scope.take,
            skip: $scope.result.data.contacts.length
        };
        $http({
            method: 'GET',
            url: '/api/contactlist/get/',
            params: queryObject
        }).success(function (data) {
            $scope.isLoading = false;
            appendData(data.data);
        }).error(function (e) {
            $scope.isLoading = false;
        });
    };

    function appendData(data) {
        for (var i = 0; i < data.contacts.length; i++) {
            $scope.result.data.contacts.push(data.contacts[i]);
        }
    }
}]);