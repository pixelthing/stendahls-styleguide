vhnApp.service('developerService', ['$location', '$cookieStore', function ($location,$cookieStore) {

    var init = function () {
        toggleSessionCacheCookie();
    }

    // toggles the developer option to disable sessionStorage of JSON calls, templates, etc.
    var toggleSessionCacheCookie = function () {

        var sessionCookieName = 'vhnDevDisableSessionStorage';

        var fullUrl = $location.absUrl();
        if (fullUrl.indexOf('sessioncacheoff') >= 0) {
            console.log('sessionStorage has been disabled for the duration of this session. Go to "vhn/?sessioncacheon" to url to turn back on.');
            sessionStorage.clear();
            $cookieStore.put(sessionCookieName, 1);
        } else if (fullUrl.indexOf('sessioncacheon') >= 0) {
            console.log('sessionStorage has been re-enabled. Go to "vhn/?sessioncacheoff" to url to disable again.');
            $cookieStore.remove(sessionCookieName);
        }
    }

    return {
        init: init
    }

}]);