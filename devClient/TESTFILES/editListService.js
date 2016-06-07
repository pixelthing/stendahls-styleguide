vhnApp.service('editListService', ['$http', '$timeout', 'searchService', function ($http, $timeout, searchService) {
    var settings = {
        isEditMode: false,
        listId: null,
        creator: null
    },
    result = { data: { contacts: [] } },
    isLoadingHash = {};
    

    if ($('html').hasClass('js-pageContactEdit') && $('html').data('list-id')) {
        settings.isEditMode = true;
        settings.listId = $('html').data('list-id');
        settings.creator = $('html').data('list-creator');
        getUsersInList();
    }

    return {
        addUsersToList: function (contactIds) {

            var array = String(contactIds).replace(' ', '').split(',');
            for (var i = 0; i < array.length; i++) {
                isLoadingHash['\'' + array[i] + '\''] = true;
            }
  
            searchService.setState('resultsLoading', { data: true });
            $http({
                method: 'POST',
                url: '/api/contactlist/addcontactstolist',
                data: JSON.stringify({ ListId: settings.listId, ContactIds: contactIds })
            }).success(function (response) {
                // Load new contracts to list, empty it first
                result.data.contacts = [];
                for (var i = 0; i < response.data.length; i++) {
                    result.data.contacts.push(response.data[i]);
                    delete isLoadingHash['\'' + response.data[i].pageId + '\''];
                }
                searchService.setState('resultsLoading', { data: false });
            }).error(function (e) {
                searchService.setState('resultsLoading', { data: false });
                this.toggleIds(contactIds, false);
                isLoadingHash = {};
                ga('send', 'exception', {
                    'exDescription': e.message,
                    'exFatal': false,
                    'appName': 'vhnApp.editListService.addUsersToList'
                });
            });
        },
        removeUsersFromList: function (contactIds, callback) {
            searchService.setState('resultsLoading', { data: true });
            $http({
                method: 'GET',
                url: '/api/contactlist/removecontactsfromlist/' + settings.listId,
                params: { contactIds: contactIds }
            }).success(function (response) {
                
                for (var i = 0; i < response.removedIds.length; i++) {
                    (function () {
                        for (var j = 0; j < result.data.contacts.length; j++) {
                            if (result.data.contacts[j].pageId === response.removedIds[i]) {
                                var article = $('#tileContact' + response.removedIds[i]);
                                // if this list of contacts is in "mina listor" view
                                if (article.closest('.contactList').length) {
                                    article.parent().animate({
                                        opacity: 0,
                                        width: 0,
                                        padding: 0
                                    }, 500);
                                    $timeout(function () {
                                        result.data.contacts.splice(j, 1);
                                    }, 500);
                                    return;
                                // if this list is in the "search results" view
                                } else {
                                    result.data.contacts.splice(j, 1);
                                }
                            }
                        }
                    })();
                }

                if (callback && typeof (callback) === "function") {
                    callback();
                }
                searchService.setState('resultsLoading', { data: false });

            }).error(function (e) {
                searchService.setState('resultsLoading', { data: false });
                ga('send', 'exception', {
                    'exDescription': e.message,
                    'exFatal': false,
                    'appName': 'vhnApp.editListService.removeUsersFromList'
                });
            });
        },
        deleteList: function () {
            console.log('Delete list ' + settings.listId);
        },
        updateListName: function (listName) {
            searchService.setState('resultsLoading', { data: true });
            $http({
                method: 'GET',
                url: '/api/contactlist/editlistname/' + settings.listId + '/' + listName
            }).success(function (response) {
                result.data.title = listName;
                searchService.setState('resultsLoading', { data: false });
            }).error(function (e) {
                searchService.setState('resultsLoading', { data: false });
                ga('send', 'exception', {
                    'exDescription': e.message,
                    'exFatal': false,
                    'appName': 'vhnApp.editListService.updateListName'
                });
            });
        },
        contactExistsInList: function(contactId) {
            for (var i = 0; i < result.data.contacts.length; i++) {
                if (result.data.contacts[i].pageId == contactId) {
                    return true;
                }
            }
            return false;
        },
        setState: function(key, value) {
            if (state[key] != value) {
                state[key] = value;
            }
        },
        getState: function(key) {
            return state[key];
        },
        getStateObject: function () {
            return state;
        },
        result: result,
        settings: settings,
        isLoadingHash: isLoadingHash
        
    };

    function getUsersInList() {
        searchService.setState('resultsLoading', { data: true });
        var queryObject = {
            //q: $scope.paramsObject.searchPhrase,
            //type: $scope.paramsObject.type,
            contactlistid: settings.listId,
            creator: settings.creator,
            take: 1000,
            skip: 0
        };
        $http({
            method: 'GET',
            url: '/api/contactlist/get/',
            params: queryObject
        }).success(function (response) {
            result.data = response.data;
            searchService.setState('resultsLoading', { data: false });
        }).error(function (e) {
            searchService.setState('resultsLoading', { data: false });
            ga('send', 'exception', {
                'exDescription': e.message,
                'exFatal': false,
                'appName': 'vhnApp.editListService.getUsersInList'
            });
        });
    }
}]);