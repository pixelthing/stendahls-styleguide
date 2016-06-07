vhnApp.controller('SearchResultController', ['$scope', '$http', '$timeout', 'searchService', 'editListService', '$location', '$q', function ($scope, $http, $timeout, searchService, editListService, $location, $q) {

    $scope.searchResult = undefined;
    $scope.take = 24;
    $scope.isLoading = false;
    $scope.isSuspended = false;
    $scope.filtersViewable = false;
    $scope.errorMsg = "";

    $scope.editListSettings = editListService.settings;

    $scope.searchPhrase = searchService.getParams('searchPhrase');
    $scope.navMode = searchService.getState('navMode');
    $scope.type = searchService.getParams('type');
    $scope.paramsObject = searchService.getParamsObject();


    $scope.$watch('paramsObject', function (newVal, oldVal) {
        $scope.navMode = newVal.navMode;
        $scope.searchPhrase = newVal.searchPhrase;
        $scope.type = newVal.type;
        $scope.category = parseInt(newVal.category);
        $scope.date = newVal.date;
        $scope.tag = newVal.tag;
    }, true);

    var paramDefaults = searchService.parameterDefaults;

    getItems();

    $scope.revealFilters = function () {
        if ($scope.filtersViewable === true) {
            $scope.filtersViewable = false;
        } else {
            $scope.filtersViewable = true;
        }
    }

    //$scope.companyFilterOptions = [
    //    { text: 'Alla', value: undefined, 'default' : true }
    //];
    //
    //$scope.companyFilter = $scope.companyFilterOptions[0];
    //
    //$scope.updateCompanyFilter = function (index) {
    //    $scope.companyFilter = $scope.companyFilterOptions[index];
    //}

    function getItems() {
        var searchPhrase = $scope.paramsObject.searchPhrase;

        var type = $scope.paramsObject.type;
        var category = $scope.paramsObject.category;
        var date = $scope.paramsObject.date;
        var tag = $scope.paramsObject.tag;

        var path = $location.path();
        var searchPathStarts = path.indexOf('search/');
        var searchPath = path.substr(searchPathStarts);
        if (searchPathStarts >= 0) {

            var searchPathArray = searchPath.split('/');
            // searchphrase
            if (searchPathArray[1] != paramDefaults.searchPhrase && searchPathArray[1] != "null" && searchPathArray[1] != "all" && searchPathArray[1] != undefined) {
                searchPhrase = searchPathArray[1];
                searchService.setParams('searchPhrase', searchPhrase );
            }
            // type
            if (searchPathArray[2] != paramDefaults.type.value && searchPathArray[2] != "null" && searchPathArray[2] != "all" && searchPathArray[2] != undefined) {
                type = searchPathArray[2];
                if (type === 'undefined') {
                    type = 'Content';
                }
            }
            // category
            if (searchPathArray[3] != paramDefaults.category && searchPathArray[3] != "null" && searchPathArray[3] != "all" && searchPathArray[3] != undefined) {
                category = searchPathArray[3];
            }
            // date
            if (searchPathArray[4] != paramDefaults.date && searchPathArray[4] != "null" && searchPathArray[4] != "all" && searchPathArray[4] != undefined) {
                date = searchPathArray[4];
            }
            // tag
            if (searchPathArray[5] != paramDefaults.tag && searchPathArray[5] != "null" && searchPathArray[5] != "all" && searchPathArray[5] != undefined) {
                tag = searchPathArray[5];
            }

            searchService.setManyParams({
                'searchPhrase': searchPhrase,
                'type': type,
                'category': category,
                'date': date,
                'tag': tag
            });


            searchService.setState('resultsLoaded', true); // tell other controllers the one-time page load is complete and the parameters set
        }

        // searchphrase call
        var queryObject = {};
        var queryType = null;
        if (searchPhrase != "" && searchPhrase != undefined) {
            queryType = 'searchPhrase';
            searchPhrase = searchPhrase.replace(",", " ");
            queryObject = {
                q: searchPhrase, // hacky. multiple befattningar types are comma delimited to allow easy add/removal of items, but commas don't mean anything to the search engine and return no results. So at the last possible moment, we strip the commas to return results whilst maintaining state. 
                type: type,
                category: category,
                date: date,
                tag: tag,
                take: $scope.take,
                skip: 0
        };
        // if q i string empty, search for categories. Different api call.
        } else {
            queryType = 'category';
            queryObject = {
                type: type,
                category: category,
                date: date,
                tag: tag,
                take: $scope.take,
                skip: 0
            };
        }
        //  console.log(queryObject["q"] + " " + queryObject["category"] + " " + queryObject["tag"]);
        // Check 
        if (queryObject["q"] == undefined && (queryObject["category"] == 0 || queryObject["category"] == undefined) && (queryObject["tag"] == 0 || queryObject["tag"] == undefined)) {
            //console.log('something was missing in the query')
        } else {

            $scope.isLoading = true;
            searchService.setState('resultsLoading', true );
            searchService.setState('searchIsActive', true );

            $http({
                method: 'GET',
                url: '/api/search/',
                params: queryObject
            }).success(function (data) {
                $scope.isLoading = false;
                $scope.searchResult = data;
                searchService.setState('resultsLoading', false );
                //if (data.filters.type == 'Contact') {
                //    buildCompanyFilter(data.data);
                //}
                var logMsg = 'search retrieved ' + data.filters.type;
                if (queryType == 'category') {
                    logMsg = 'category retrieved ' + (searchService.getCategoryById(searchPhrase) ? searchService.getCategoryById(searchPhrase).name : 'level 0');
                }
                if (data.data) {
                    ga('send', 'event', 'search', logMsg, 'search results', data.data.length);
                }
                else
                {
                    ga('send', 'event', 'search', logMsg);
                }
            }).error(function (e) {
                $scope.isLoading = false;
                searchService.setState('resultsLoading', false);
                $scope.errorMsg = "Vi hittade ett problem med att hämta resultaten. Om problemet kvarstår, kontakta support.";
                ga('send', 'exception', {
                    'exDescription': e.message,
                    'exFatal': false,
                    'appName': 'vhnApp.SearchResultController.getItems'
                });
            });
        }
    }

    $scope.searchTag = function (tag) {
        $scope.clearSearch();
        searchService.setParams('tag', tag);
        searchService.setLocation();
      
    }

    $scope.getMoreItems = function () {

        var query = getQuery();

        $scope.isLoading = true;
        var queryObject = {
            type: $scope.paramsObject.type,
            category: $scope.paramsObject.category,
            date: $scope.paramsObject.date,
            tag: $scope.paramsObject.tag,
            take: $scope.take,
            skip: $scope.searchResult.data.length
        };
        if (query) {
            queryObject.q = query;
        }
        $http({
            method: 'GET',
            url: '/api/search/',
            params: queryObject
        }).success(function (data) {
            $scope.isLoading = false;
            //searchService.setParams('tag', tag);
            appendData(data);
            //if (data.filters.type == 'Contact' || data.filters.type == 'Profession') {
            //    buildCompanyFilter(data.data);
            //}
            if (data.data) {
                ga('send', 'event', 'search', 'search retrieved ' + data.filters.type + ' (more)', 'search results', data.data.length);
            }
            else {
                ga('send', 'event', 'search', 'search retrieved ' + data.filters.type + ' (more)');
            }
        }).error(function (e) {
            $scope.isLoading = false;
            ga('send', 'exception', {
                'exDescription': e.message,
                'exFatal': false,
                'appName': 'vhnApp.SearchResultController.getMoreItems'
            });
        });
    };

    function appendData(data) {
        for (var i = 0; i < data.data.length; i++) {
            $scope.searchResult.data.push(data.data[i]);
        }
    }

    $scope.clearSearch = function() {
        searchService.clearAll();
        searchService.setState('navMode', 'search');
        $timeout(function () {
            $(document).trigger('scroll'); // forces lazyload to paint any missing images
        }, 400);
    };

    $scope.clearFilters = function () {
        searchService.clearFilters();
        searchService.setLocation();
    };

    $scope.addAllCompaniesContacts = function(take) {
        if (take > 0) {
            var contactIds = [];
            var queryObject = {
                q: getQuery(),
                type: 'Contact',
                category: $scope.paramsObject.category,
                date: $scope.paramsObject.date,
                tag: $scope.paramsObject.tag,
                take: take,
                skip: 0,
                cache: false
            };

            $scope.isLoading = true;
            $scope.isSuspended = true;

            $http({
                method: 'GET',
                url: '/api/search/',
                params: queryObject
            }).success(function (data) {
                for (var i = 0; i < data.data.length; i++) {
                    contactIds.push(data.data[i].pageId);
                    $scope.isLoading = true;
                }
                editListService.addUsersToList(contactIds);

                $scope.isLoading = false;
                $scope.isSuspended = false;
            }).error(function (e) {
                $scope.isLoading = false;
                $scope.isSuspended = false;
                ga('send', 'exception', {
                    'exDescription': e.message,
                    'exFatal': false,
                    'appName': 'vhnApp.SearchResultController.addAllCompaniesContacts'
                });
            });
        }


    }

    $scope.addAllContacts = function (take) {

        if (take > 0) {
            var contactIds = [];
            var queryObject = {
                q: getQuery(),
                type: $scope.paramsObject.type,
                category: $scope.paramsObject.category,
                date: $scope.paramsObject.date,
                tag: $scope.paramsObject.tag,
                take: take,
                skip: 0,
                cache: false
            };

            $scope.isLoading = true;
            $scope.isSuspended = true;

            $http({
                method: 'GET',
                url: '/api/search/',
                params: queryObject
            }).success(function(data) {
                for (var i = 0; i < data.data.length; i++) {
                    contactIds.push(data.data[i].pageId);
                    $scope.isLoading = true;
                }
                editListService.addUsersToList(contactIds);

                $scope.isLoading = false;
                $scope.isSuspended = false;
            }).error(function(e) {
                $scope.isLoading = false;
                $scope.isSuspended = false;
                ga('send', 'exception', {
                    'exDescription': e.message,
                    'exFatal': false,
                    'appName': 'vhnApp.SearchResultController.addAllContacts'
                });
            });
        }

    };

    function getQuery() {
        var query = $scope.paramsObject.searchPhrase;

        //// In those cases where user uses browser back button or session is lost.
        var path = $location.path();
        var pathArray = path.split('/');
        if (query == null) {
            if (pathArray[2] != "null") {
                query = pathArray[2];
            }
        }

        return query;
    }

    //function buildCompanyFilter(contacts) {
    //    if (contacts) {
    //        var array = [];
    //        var companyArray = [];
    //
    //        for (var i = 0; i < contacts.length; i++) {
    //            companyArray.push(contacts[i].company);
    //        }
    //
    //        companyArray = companyArray.filter(onlyUnique);
    //
    //        for (var j = 0; j < companyArray.length; j++) {
    //            if (companyArray[j]) {
    //                array.push({ text: companyArray[j], value: companyArray[j] });
    //            }
    //        }
    //
    //        var old = $scope.companyFilterOptions.splice(0, 1);
    //
    //        if (old.length > 0) {
    //            array = array.sort(sortByName);
    //            array.unshift(old[0]);
    //            $scope.companyFilterOptions = array;
    //        } else {
    //            $scope.companyFilterOptions = array;
    //        }
    //
    //    }
    //}

    

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    function sortByName(a, b) {
        var aName = a.text.toLowerCase();
        var bName = b.text.toLowerCase();
        return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
    }

}]);