var vhnApp = angular.module('VhnApp', ['ngRoute', 'ngTouch', 'ngCookies', 'ngMessages', 'ngSanitize', 'ui.bootstrap']);

vhnApp.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/search/:searchPhrase/:type/:category/:date/:tag', {
                templateUrl: '/Static/js/components/searchResult/searchResult.html',
                controller: 'SearchResultController'
            }).
            when('/search/recommended', {
                templateUrl: '/Static/js/components/searchResult/searchResult.html',
                controller: 'SearchResultController'
            }).
            otherwise({
                redirectTo: ''
            });
    }
]);
vhnApp.run(['developerService', function (developerService) {
    developerService.init();
}]);
