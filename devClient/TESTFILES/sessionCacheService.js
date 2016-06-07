vhnApp.factory('sessionCacheService', ['$http', '$q', '$timeout', '$cookieStore', function ($http, $q, $timeout, $cookieStore) {

    return {
        jsonCache: function (configObj) {

            /* CONFIG */

            var config = {};

            config.storageKey = null;     // the sessionStorage key name (including arguments if it's a search query) to fetch offline data from

            config.ajaxUrl = null;     // the ajax url (including arguments) to fetch online data from eg "/api/catNames"
            config.ajaxType = 'GET';    // the ajax request type eg "GET" or "POST". Defaults to "GET"
            config.ajaxQuery = null;     // the ajax query object to use to retrieve data eg "{'catType':'persian'}"
            config.ajaxCheck = false;    // if local data is found, do you want to then check if the online data has changed in the meantime?
            config.ajaxDelay = 3000;     // if checking online data after retrieving offline data, this is the delay (in ms) before we look online

            config.comparisonField = null;     // when comparing on/offline data to see if un update is needed (by data field - eg datetime), what's the key of the field to compare? (optional, when used it overrides comparing by string length)
            config.comparisonPath = null;     // when comparing on/offline data to see if un update is needed (by data length), what's the path to an array of data to compare (eg "data.rows" to target response.data.rows)? (default is compare the string length of the whole json response)
            config.comparisonMax = null;     // when comparing on/offline data to see if un update is needed (by data length), how many array nodes do you compare? (default is all of them)

            var sessionCookieName = 'vhnDevDisableSessionStorage';  // used by the developerService, Add "?sessioncacheoff" to url to turn session cache off, add "?sessioncacheon" to url to turn back on

            // adjust config to requirements
            for (arg in configObj) {
                config[arg] = configObj[arg];
            }

            /* TEST FOR LOCALSTORAGE (using the modernizr test) */
            var mod = 'modernizr';
            var localstorageEnabled = false;
            try {
                sessionStorage.setItem(mod, mod);
                sessionStorage.removeItem(mod);
                localstorageEnabled = true;
                // continue
            } catch (e) {
                // nope.
            }

            /* METHODS */

            // get the response from offline storage (in the form of a promise)
            var getDataLocal = function () {
                //console.log('JSONCACHE: ' + storageKey + ': started looking for local')
                var defer = $q.defer();
                // has the developer turned session storage off
                if ($cookieStore.get(sessionCookieName)) {
                    console.log('sessionStorage disabled by dev');
                    defer.reject({ "data": 'sessionStorage disabled by dev - ajax in ' + config.ajaxUrl });
                    return defer.promise;
                }
                // localstorage available?
                if (!localstorageEnabled) {
                    defer.reject({ "data": "error - localstorage not available" });
                    return defer.promise;
                }
                var response = sessionStorage.getItem(config.storageKey);
                // nothing stored
                if (!response || response === 'undefined') {
                    sessionStorage.removeItem(config.storageKey)
                    //console.log('JSONCACHE: ' + storageKey + ': no local data found');
                    defer.reject({ "data": "error - nothing stored" });
                    // something stored
                } else {
                    // create object from text
                    response = JSON.parse(response);
                    // object not valid
                    if (typeof response != 'object') {
                        sessionStorage.removeItem(config.storageKey)
                        //console.log('JSONCACHE: ' + storageKey + ': local data not valid');
                        defer.reject({ "data": "error - local response unusable" });
                        // valid response
                    } else {
                        //console.log('JSONCACHE: ' + storageKey + ': got local data');
                        defer.resolve(response);
                    }
                }

                return defer.promise;
            }

            // get the response from online service (in the form of a promise)
            var getDataAjax = function () {
                return $http({
                    method: config.ajaxType,
                    url: config.ajaxUrl,
                    params: config.ajaxQuery
                })
                    .then(
                        // valid response
                        function (response) {
                            if (typeof response === 'object') {
                                return response;
                            } else {
                                // invalid response
                                return $q.reject(response);
                            }
                        },
                        // invalid response
                        function (response) {
                            return $q.reject(response);
                        }
                    );
            }

            // return TRUE is the offline and online responses are different (default is to copare by JSON string length, but options are available)
            var diffResponse = function (onlineResponse, offlineResponse) {

                //console.log('JSONCACHE: ' + storageKey + ': online: ' + angular.toJson(onlineResponse).length + ' offline: ' + angular.toJson(offlineResponse).length);
                //console.log('ONLINE-----------------------')
                //console.log(angular.toJson(onlineResponse));
                //console.log('OFFLINE-----------------------')
                //console.log(angular.toJson(offlineResponse));
                //console.log('-----------------------')

                // if we're comparing off/online data by a specific field
                if (config.comparisonField && config.comparisonField.length) {
                    if (onlineResponse[config.comparisonField] !== offlineResponse[config.comparisonField]) {
                        return true;
                    }
                    return false;
                    // if we're comparing off/online data by string length
                } else {
                    var onlineResponseStr = null;
                    var offlineResponseStr = null;
                    var onlineResponseSub = onlineResponse;
                    var offlineResponseSub = offlineResponse;
                    // if we're suppliying a path to the data we want to compare (eg compare response.data.rows), else give the whole object
                    if (config.comparisonPath && config.comparisonPath.length) {
                        var pathArray = config.comparisonPath.split('.');
                        for (var i = 0; i < pathArray.length; i++) {
                            onlineResponseSub = onlineResponseSub[pathArray[i]];
                            offlineResponseSub = offlineResponseSub[pathArray[i]];
                        }
                    }
                    // if we only want to compare the first X items in an array
                    if (config.comparisonMax != null && config.comparisonMax > 0) {
                        onlineResponseStr = angular.toJson(onlineResponseSub.slice(0, config.comparisonMax));
                        offlineResponseStr = angular.toJson(offlineResponseSub.slice(0, config.comparisonMax));
                        // if we want to compare the whole string so far
                    } else {
                        onlineResponseStr = angular.toJson(onlineResponseSub);
                        offlineResponseStr = angular.toJson(offlineResponseSub);
                    }
                    // FINALLY, the string length test
                    if (onlineResponseStr.length !== offlineResponseStr.length) {
                        return true;
                    }
                    return false;
                }

            }

            // save the online data for offline
            var saveData = function (response) {
                sessionStorage.setItem(config.storageKey, angular.toJson(response));
            }


            /* PROMISE */

            // start promise
            var defer = $q.defer();

            // first, look for the offline data
            getDataLocal()
                .then(
                    // offline data found!
                    function (offlineResponse) {
                        // if we don't want a back-up online check
                        if (!config.ajaxCheck) {
                            // delivery response (but continuing the promise)
                            defer.resolve(offlineResponse);
                        // if we *do* want a back-up online check
                        } else {
                            // delivery response (but continuing the promise)
                            defer.notify(offlineResponse);
                            // look online after a deferred amount of time (or silently fail)
                            $timeout(function () {
                                getDataAjax()
                                    .then(
                                        // got the online data, compare it to the offline
                                        function (onlineResponse) {
                                            // if the online data is different
                                            if (diffResponse(onlineResponse, offlineResponse)) {
                                                // save the online data to offline
                                                saveData(onlineResponse);
                                                // delivery response
                                                defer.resolve(onlineResponse);
                                            } else {
                                                defer.resolve();
                                            };
                                            //console.log('check!')
                                        },
                                        // erk - no way out - we have an error
                                        function (error) {
                                            defer.resolve();
                                        }
                                    );
                            }, config.ajaxDelay);
                        }
                    },
                    // offline data NOT found.
                    function (error) {
                        // look for the online data
                        getDataAjax()
                            .then(
                                // got the online data
                                function (response) {
                                    // save the online data to offline
                                    if (localstorageEnabled && !$.cookie(sessionCookieName)) {
                                        saveData(response);
                                    }
                                    // delivery response
                                    defer.resolve(response);
                                },
                                // erk - no way out - we have an error
                                function (error) {
                                    defer.reject({ "error": "sorry - we couldn't retrieve data from " + config.ajaxUrl });
                                }
                            );
                    }
                );

            return defer.promise;
        }
    };

}]);