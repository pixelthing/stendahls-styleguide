vhnApp.service('tagService', ['$http', '$timeout', 'searchService', function ($http, $timeout, searchService) {
    return {
        searchTag: function (tag) {
            searchService.clearAll();
            searchService.setParams('tag', tag );
            searchService.setLocation();
        }
        
    }

}]);