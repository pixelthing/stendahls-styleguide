vhnApp.controller('SearchController', ['$scope', '$http', '$routeParams', '$timeout', 'searchService', function ($scope, $http, $routeParams, $timeout, searchService) {
  
    $scope.paramsObject = searchService.getParamsObject();
    $scope.stateObject = searchService.getStateObject();
    $scope.searchType = searchService.getParams('type').value;
    $scope.searchLookup = searchService.typeOptions;
    $scope.searchTypeObj = searchService.typeOptions[$scope.searchType];

    $scope.searchInputfocus = false;
    
    $scope.$watch('stateObject', function (newVal, oldVal) {
        // because the controllers will run in order of page structure, the search input controller runs 
        // before the search result controller uses the URL to run a search. So this watches for the resultsLoaded
        // state to be set, changes the search phrase if necessary
        var urlSearchPhrase = searchService.getParams('searchPhrase');
        if (newVal.resultsLoaded != oldVal.resultsLoaded && newVal.resultsLoaded === true && urlSearchPhrase != null && urlSearchPhrase != searchService.parameterDefaults['searchphrase']) {
            $scope.tempSearchPhrase = urlSearchPhrase;
        }
    }, true);
    $scope.$watch('paramsObject', function (newVal, oldVal) {
        if (newVal.searchPhrase != oldVal.searchPhrase) {
            $scope.tempSearchPhrase = newVal.searchPhrase;
            $scope.searchInputfocus = false;
            if ($scope.tempSearchPhrase && $scope.tempSearchPhrase.length) {
                $scope.searchInputfocus = true;
            }
        }
        // if we're changing from profession to another type, clear the search field of useless profession ids
        if (newVal.type.value != oldVal.type.value && oldVal.type.value == "Profession") {
            searchService.clearAll();
        }
        $scope.searchType = newVal.type.value;
        $scope.searchTypeObj = searchService.typeOptions[newVal.type.value];
    }, true);
    
    $scope.searchInputSubmit = function () {
        if (!$scope.tempSearchPhrase || !$scope.tempSearchPhrase.length) {
            alert('Please enter a search phrase or keyword');
            searchService.clearAll();
        } else {
            // clear existing date/category/tag
            searchService.setManyParams({
                'searchPhrase': $scope.tempSearchPhrase,
                'category': 0,
                'date' : 'all',
                'tag': 0
                });
            searchService.setLocation();
            ga('send', 'event', 'search', 'search submitted ' + $scope.searchType, $scope.tempSearchPhrase.toLowerCase().replace('\'',''));
            $timeout(function () {
                $('.js-searchFormInputFocusTarget').focus();
            });
        }
    };

    $scope.keyup = function () {
        if (!$scope.tempSearchPhrase || !$scope.tempSearchPhrase.length) {
            searchService.clearSearch();
        } else {
            searchService.setParams('searchPhrase', $scope.tempSearchPhrase );
        }
    };

    $scope.searchInputLabelOn = function (force) {
        $scope.searchInputfocus = false;
        if (force || ( $scope.tempSearchPhrase && $scope.tempSearchPhrase.length ) ) {
            $scope.searchInputfocus = true;
        }
    }
    $scope.searchInputLabelOff = function () {
        $scope.searchInputfocus = true;
        if (!$scope.tempSearchPhrase || !$scope.tempSearchPhrase.length ) {
            $scope.searchInputfocus = false;
        }
    }

}]);