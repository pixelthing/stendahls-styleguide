vhnApp.controller('EventListController',
    ['$scope', '$http', '$timeout', '$location', '$filter',
    function ($scope, $http, $timeout, $location, $filter) {

    // get a node index from it's id
    $scope.itemFromEvent = function (id, returnIndex) {
        for (var i = 0; i < $scope.events.length; i++) {
            if ($scope.events[i]['pageId'] === id) {
                if (returnIndex) {
                    return i;
                } else {
                    return $scope.events[i];
                }
                break;
            }
        }
    }

    // ATTENDEES

    $scope.selectedEvent = {};
    $scope.selectEvent = function (item) {
        $scope.selectedEvent = item;
    };

    var scrolltoAttendee = function (openingEventId) {
        if (!openingEventId.length) {
            return;
        }
        if ($location.absUrl().indexOf('?eventId=' + openingEventId) > 0 && $location.absUrl().indexOf('userId') > 0) {
            var hashStart = $location.absUrl().indexOf('?') + 1;
            var hashEnd = $location.absUrl().indexOf('#');
            if (hashEnd < 0) {
                hashEnd = $location.absUrl().length;
            }
            var hash = $location.absUrl().substring(hashStart, hashEnd).replace(/=/g, '').replace(/&/g, '').replace(/\//g, '');
            $timeout(function () {
                $('html, body').animate({
                    scrollTop: $('#' + hash).offset().top
                }, 500);
            })
        }
    }

    $scope.getAttendees = function (eventId, persontype) {

        var thisEvent = $scope.itemFromEvent(eventId);

        // collapse
        if (thisEvent.expand === true) {

            thisEvent.expand = false;

        // open: we already have data
        } else if (thisEvent.attendees && thisEvent.attendees.length) {

            // use existing data
            thisEvent.expand = true;

            // then re-look-up
            $.ajax({
                type: 'GET',
                url: '/api/event/getparticipantsforeventlist/' + eventId + '/' + persontype,
                success: function (response) {
                    // is the new data the same as the current?

                    var dataCurrent = thisEvent.attendees;
                    var dataNew = attendeesListBuild(response.data);
                    for (var i = 0; i < dataCurrent.length; i++) {
                        delete dataCurrent[i]['$$hashKey'];
                    }

                    //dataNew[0]['name'] = 'craig morey';
                    //console.log(JSON.stringify(dataCurrent).length + ':' + JSON.stringify(dataNew).length)
                    //console.log(JSON.stringify(dataCurrent))
                    //console.log(JSON.stringify(dataNew))

                    if (angular.toJson(dataCurrent) !== angular.toJson(dataNew)) {
                        // notify the user
                        if (window.confirm("Deltagare har uppdaterats - klicka på OK för att uppdatera listan.")) {
                            thisEvent.attendees = {};
                            thisEvent.isLoading = true;
                            $timeout(function () {
                                thisEvent.attendees = dataNew;
                                thisEvent.isLoading = false;
                            },500);
                        }
                    }
                }
            });

        // open: we don't have data
        } else {
            thisEvent.expand = true;
            thisEvent.isLoading = true;
            
            $.ajax({
                type: 'GET',
                url: '/api/event/getparticipantsforeventlist/' + eventId + '/' + persontype,
                success: function (response) {
                    $timeout(function () {
                        thisEvent.attendees = attendeesListBuild(response.data);
                        thisEvent.isLoading = false;
                        scrolltoAttendee(eventId);
                    });
                }
            });
        }

    };

    // manipulate the list of attendees
    var attendeesListBuild = function (attendees) {

        var attendeesLength = attendees.length;
        for (var i = 0; i < attendeesLength; i++) {

            // BUILD A SEARCH FIELD ONCE (not everytime you type a letter to search)

            // concat all the stuff we want to search
            var searchField = attendees[i].name + ' ' +
                                attendees[i].company + ' ' +
                                attendees[i].profession + ' ' +
                                attendees[i].extendedEventState.state + ' ' +
                                attendees[i].extendedEventState.invitedByInitials + ' ' +
                                attendees[i].extendedEventState.invitedByName + ' ' +
                                attendees[i].optionsText;
            // professions
            if (attendees[i].professionList) {
                var professionArray = attendees[i].professionList;
                for (var k = 0; k < professionArray.length ; k++) {
                    if (professionArray[k].text.length) {
                        searchField += ' ' + professionArray[k].text;
                    }
                }
            }
            // options
            if (attendees[i].options) {
                var optionsArray = attendees[i].options;
                for (var k = 0; k < optionsArray.length ; k++) {
                    if (optionsArray[k].selectedOption.length || optionsArray[k].comments.length) {
                        searchField += ' ' + optionsArray[k].selectedOption + ' ' + optionsArray[k].comments;
                    }
                }
            }
            attendees[i].searchField = searchField.toLowerCase();
        }

        return attendees;

    }

    // GET EVENTS

 //   getEvents();


    $scope.init = function (id) {
        $scope.isLoading = true;
        $http({
            method: 'GET',
            url: '/api/event/get/'
        }).success(function (data) {
            $scope.isLoading = false;
            $scope.events = data.data;
            $scope.eventsFiltered = $filter('EventsFilter')($scope.events, $scope.filterVariable.value, $scope.sortVariable.value)

            if (id != null) {
                var index = 0;
                var personType = 0;
                for (var i = 0; i < $scope.events.length; i++) {
                    if ($scope.events[i].pageId == id) {
                       
                        personType = $scope.events[i].personTypeId;
                        index = i;
                        break;
                    }
                }

                $scope.getAttendees(id, personType, index);
            }

        }).error(function (e) {
            $scope.isLoading = false;
            ga('send', 'exception', {
                'exDescription': e.message,
                'exFatal': false,
                'appName': 'vhnApp.EventListController.getEvents'
            });
        });
    }

    // FILTERS REVEAL

    $scope.filtersViewable = false;

    $scope.revealFilters = function () {
        if ($scope.filtersViewable === true) {
            $scope.filtersViewable = false;
        } else {
            $scope.filtersViewable = true;
        }
    }

    // BUILD FILTERS

    $scope.$watch('result', function () {
        buildFilter($scope.events);
    }, true);

    function buildFilter(events) {
        if (events) {
            var eventArray = [];

            // do the status first, because the passed events will 99% come out first, and we can make "All events not passed" option one
            for (var i = 0; i < events.length; i++) {
                if (!titleAlreadyInArray(eventArray, events[i].status)) {
                    if (events[i].status === 'Passerad') {
                        eventArray.push({ 'title': 'Inte passerad', 'value': '!Passerad' });
                    }
                    eventArray.push({ 'title': events[i].status, 'value': events[i].status });
                }
            }

            // all events that are generated by the user
            for (var i = 0; i < events.length; i++) {
                if (events[i].mine && !titleAlreadyInArray(eventArray, events[i].mine)) {
                    eventArray.push({ 'title': events[i].mine, 'value': events[i].mine });
                }
            }

            // if "not passed" is the first option, make that option[0]
            if (eventArray[0].value === '!Passerad') {
                $scope.filterOptions = [];
                eventArray.push({ 'title': 'Alla', 'value': undefined });
            // otherwise make "All" option[0]
            } else {
                $scope.filterOptions = [
                    { text: 'Alla', value: undefined }
                ];
            }

            // generate filter list
            for (var j = 0; j < eventArray.length; j++) {
                if (eventArray[j]) {
                    $scope.filterOptions.push({ text: eventArray[j].title, value: eventArray[j].value });
                }
            }
            // reset the default selected option
            $scope.filterVariable = $scope.filterOptions[0];

        }
    }

    function titleAlreadyInArray(array, title) {
        for (var i = 0 ; i < array.length ; i++) {
            if (array[i].title === title) {
                return true;
            }
        }
        return false;
    }

    // SORTING

    $scope.sortOptions = [
        { text: 'Startdatum', value: 'dateStart' },
        { text: 'Slutdatum', value: 'dateFinish' },
        { text: 'Namn', value: 'title' },
        { text: 'Status', value: 'status' },
        { text: 'Senast modifierad', value: 'modifiedDate' }
    ];

    $scope.sortVariable = $scope.sortOptions[0];

    $scope.updateSortVariable = function (index) {
        $scope.sortVariable = $scope.sortOptions[index];
        $scope.eventsFiltered = $filter('EventsFilter')($scope.events, $scope.filterVariable.value, $scope.sortVariable.value)
    }

    // FILTER EVENTS

    $scope.filterOptions = [
        { text: 'Alla', value: '' }
    ];

    $scope.filterVariable = $scope.filterOptions[0];

    $scope.updateFilterVariable = function (index) {
        $scope.filterVariable = $scope.filterOptions[index];
        $scope.eventsFiltered = $filter('EventsFilter')($scope.events, $scope.filterVariable.value, $scope.sortVariable.value)
    }

    $scope.resetFilters = function () {
        $scope.sortVariable = $scope.sortOptions[0];
        $scope.filterVariable = $scope.filterOptions[0];
    };
    $scope.resetFilters();

    // move users between events

    $scope.attendeeMoveForm = {};
    $scope.attendeeMoveModal = function (eventId, userId, userName) {
        $http({
            method: 'GET',
            url: '/api/event/getavailiableeventsforparticipant/' + eventId + '/' + userId
        }).success(function (data) {
            
            $scope.attendeeMoveForm.name = userName;
            $scope.attendeeMoveForm.events = data;
          
            $timeout(function () {
                $(moveParticipantsWrapper).modal("show");
            });

        });
    }
    $scope.attendeeMoveClick = function (url) {
        if (window.confirm("Är du säker på att du vill flytta den här användaren till denna event?")) {
            self.location = url;
        } else {
            $timeout(function () {
                $scope.attendeeMoveForm.name = null;
                $scope.attendeeMoveForm.events = {};
                $(moveParticipantsWrapper).modal("hide");
            });
        }
    }

}]).filter('EventsFilter', ['$filter', function ($filter) {

    return function (events, eventsFilter, eventsSort) {

        // FILTER
        var filtered = [];
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            if (eventsFilter) {
                if (event.status === eventsFilter) {
                    filtered.push(event);
                }
            } else {
                filtered.push(event);
            }
        }
        // SORT
        var ordered = $filter('orderBy')(filtered, eventsSort);

        // DETACH SLAVE EVENTS FROM MASTER EVENTS
        var lookUpArray = [];
        var masterEvents = [];
        var slaveEvents = {};
        for (var i = 0; i < ordered.length; i++) {
            var event = ordered[i];
            var masterId = event.masterEventId;
            // is this a potential master event?
            if (event.masterEventId < 1) {
                // add master to to an array to use to look up slaves
                lookUpArray.push(event.pageId);
                // add event to master array
                masterEvents.push(event);
            // if this is a slave event
            } else {
                // add event to slave array, associated with a master key
                if (!slaveEvents[masterId]) {
                    slaveEvents[masterId] = [];
                }
                slaveEvents[masterId].push(event);
            }

        }

        // RE-ATTACH SLAVE EVENTS TO MASTER EVENTS
        var output = [];
        for (var i = 0; i < masterEvents.length; i++) {
            var event = masterEvents[i];
            var masterId = event.pageId;
            // add the master event
            output.push(event);
            // if any slave events have this as a master, insert them
            if (slaveEvents[masterId]) {
                output.splice.apply(output, [i+1, 0].concat(slaveEvents[masterId]));
            }
        }

        return output;
    };

}]);