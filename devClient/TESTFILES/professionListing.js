vhnApp.controller('ProfessionListingController', ['$scope', '$http', 'searchService', 'sessionCacheService', function ($scope, $http, searchService, sessionCacheService) {

    $scope.result = [];
    $scope.professionContainers = [];       // for layout purposes, splitting professionsinto categories
    $scope.searchProfessions = [];          // array of unique profession ids that we're currently searching for (used to create searchphrase/lookup current state). WATCHED for changes to state.
    $scope.professionsCommonSearch = [];    // array of id : name objects used to look up the common name of professions being searched on
    $scope.professionsCommonLookUp = {};    // object of id : name for *all* professions, used as a look-up reference for matching common names to ids
    $scope.professionsLoading = false;      // are we retrieving professions
    $scope.professionsVisible = searchService.getState('professionsVisible');  // professions menu on/off
    $scope.paramsObject = searchService.getParamsObject();
    $scope.stateObject = searchService.getStateObject();

    var getProfessions = function (callback) {
        $scope.professionsLoading = true;

        // retrieve info from off or online
        sessionCacheService.jsonCache({
            'storageKey': 'vhnSecondaryProfessions',
            'ajaxUrl': '/api/secondaryprofessions/allcontainers'
        }).then(
            // resolve
            function (response) {
                //console.log('resolve!')
                $scope.professionsLoading = false;
                parseResult(response.data.data);
                if (callback) {
                    callback.call(this);
                }
            }, function (error) {
                //console.log('reject!')
                $scope.professionsLoading = false;
                $scope.professionsVisible = false;
            }
        );
    };

    $scope.professionsInit = function() {
        getProfessions(function () {
            var searchServiceType = searchService.getParams('type').value;
            var searchServiceSearchPhrase = searchService.getParams('searchPhrase');
            if (searchServiceType === 'Profession' && searchServiceSearchPhrase != undefined && searchServiceSearchPhrase.length) {
                $scope.searchProfessions = searchServiceSearchPhrase.replace('NaN', '').trim().split(" ").map(Number);
            }
        });
    };

    var parseResult = function (data) {
        $scope.result = data;
        if (!data) {
            return;
        }
        var containers = [];
        var containerProfessions = [];
        var storedContainer;
        var storedContainerName = "";

        for (var i = 0, len = data.length; i < len; i++)
        {
            $scope.professionsCommonLookUp[data[i].pageId] = data[i].commonName;
            var profession = data[i];
            if (i == 0 || storedContainer.name != profession.containerName) {
                // if first item else if loop finds new container name, store container
                storedContainer = {
                    name: profession.containerName,
                    professions: []
                };
                containers.push(storedContainer);
            }
          
            // add looped profession to current container
            storedContainer.professions.push(profession);
        }
        $scope.professionContainers = containers;
    };

    // OPENING PROFESSIONS MENU

    $scope.toggleVisible = function () {
        if ($scope.professionsVisible) {
            searchService.setState('professionsVisible', false );
        } else {
            if (!$scope.result.length) {
                getProfessions();
            }
            searchService.setState('professionsVisible', true );
        }
    }

    // MONITOR THE SEARCH STATE FOR CHANGES IN MENU VISIBILITY

    $scope.$watch('stateObject.professionsVisible', function (newVal, oldVal) {
        $scope.professionsVisible = newVal;
    })

    // CLICK EVENTS IN profession menu

    $scope.toggleProfessionSearch = function (id) {
        var ProfPosition = $scope.searchProfessions.indexOf(id);
        if (ProfPosition >= 0) {
            $scope.searchProfessions.splice(ProfPosition, 1);
        } else {
            $scope.searchProfessions.push(id);
        }
    }

    $scope.$watch('searchProfessions.length', function () {
        updateTempSearchPhrase();
    });

    function updateTempSearchPhrase() {
        var searchPhrase = searchService.getParams('searchPhrase');
        var searchPhraseArray = [];
        // create an array of the searchPhrase terms
        if (searchPhrase != undefined && searchPhrase.length) {
            searchPhrase = searchPhrase.replace('NaN', '').trim();
            searchPhraseArray = searchPhrase.split(' ').map(Number);
        }
        // remove any professions from the existing searchPhrase
        if (searchPhraseArray.length) {
            searchPhraseArray = searchPhraseArray.filter(function (a) { $scope.searchProfessions.indexOf(a) < 0; });
        }
        // add professions
        if ($scope.searchProfessions.length) {
            searchPhraseArray = searchPhraseArray.concat($scope.searchProfessions);
        }

        // remove NaN items from array
        searchPhraseArray = searchPhraseArray.filter(function(index) {
            return !isNaN(index);
        });

        // unique it
        searchPhraseArray = $.unique(searchPhraseArray);
        // find the commonNames of the ids
        $scope.professionsCommonSearch = [];
        for (var i = 0; i < searchPhraseArray.length; i++) {
            $scope.professionsCommonSearch.push({
                'id' : searchPhraseArray[i],
                'name': $scope.professionsCommonLookUp[searchPhraseArray[i]]
            });
        }
        $scope.professionsCommonSearch = $scope.professionsCommonSearch.slice().reverse();   // reversed so that when you add an item, it appears at the front of the queue, so you always see it appear, even when others are out of canvas.
        // run the search
        searchPhrase = $.unique(searchPhraseArray).join(' ');
        searchService.setParams('searchPhrase', searchPhrase);
        if (searchPhrase.length) {
            searchService.setLocation();
        } else {
            searchService.clearSearch();
        }
    }

}]);