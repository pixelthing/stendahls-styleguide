vhnApp.controller('EventListAttendeesController',
    ['$scope', '$http', '$location', '$element',
    function ($scope, $http, $location, $element) {

        $scope.pEventListAttendeesAdd = function (item, eventId) {
            
            if (window.confirm("Är du säker på att du vill bjuda in den här användaren till denna händelse?")) {

                for (var i = 0; i < $scope.lookupTable.length; i++) {
                    if ($scope.lookupTable[i].name + ' [' + $scope.lookupTable[i].cdsid + ']' === item) {

                        var userId = $scope.lookupTable[i].id;

                        // turn on the spinner
                        $element.find('.js-eventAttendeeListAddSearch').hide();
                        $element.addClass('eventAttendeeListAddUiSpin').html('<div class="cSpinner cSpinnerWhite"><div class="cSpinnerInner"></div><div class="cSpinnerLabel">var god vänta</div></div>')

                        //console.log('/api/event/addparticipant/' + eventId + '/' + userId)

                        return $http.get('/api/event/addparticipant/' + eventId + '/' + userId)
                            .then(function (response) {
                                window.location.href = '/event/list?eventId=' + eventId + "&userId=" + userId;
                                return;
                            }
                        );

                    }
                }

            } else {

                // clear the search field
                $scope.cFormSelectContactInputName = null;

            }

        }

    }]);