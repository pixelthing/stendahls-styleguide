vhnApp.directive('vhnTile', ['$compile', '$http', '$templateCache', '$interval', 'languageService', 'editListService', 'tagService', 'sessionCacheService', function ($compile, $http, $templateCache, $interval, languageService, editListService, tagService, sessionCacheService) {

    if (typeof gettingTemplate === 'undefined') {
        var gettingTemplate = {};
    }

    var getTemplatePath = function (contentType) {
        var templatePath = '/Static/js/components/_shared/';
        var templateMap = {
            ArticlePage: 'tileArticleTemplate.html',
            StandardPage: 'tileArticleTemplate.html',
            DocumentPage: 'tileDocumentTemplate.html',
            NotePage: 'tileNotificationTemplate.html',
            RssNotePage: 'tileRssNotificationTemplate.html',
            EventPage: 'tileEventTemplate.html',
            Contact: 'tileContactTemplate.html',
            CompanyContainerPage: 'tileCompanyTemplate.html',
            ApplicationPage: 'tileApplicationTemplate.html',
            NotesDocumentPage: 'tileDocumentTemplate.html',
            Department: 'tileDepartmentTemplate.html',
            DealerPage: 'tileBranchTemplate.html',
            PartnerPage: 'tilePartnerTemplate.html',
            CorporationPage: 'tileBranchTemplate.html',
            SimbaSales: 'tileSimbaSalesTemplate.html',
            SimbaTotals: 'tileSimbaTotalsTemplate.html',
            SimbaRadar: 'tileSimbaRadarTemplate.html',
            SimbaWait: 'tileSimbaWaitTemplate.html',
            EventParticipant: 'tileEventParticipantTemplate.html',
        };

        var templateFile = templateMap[contentType];
        var templateUrl = templatePath + (templateFile != undefined ? templateFile : 'tileNoLayout.html');

        return templateUrl;

    };
    var linker = function (scope, element, attrs) {
        scope.editListService = editListService;
        scope.langService = languageService;
        scope.index = attrs.index;
        scope.category = attrs.category;
        scope.mode = attrs.mode;
        scope.tagService = tagService;
        if (!scope.intervalPromise) {
            scope.intervalPromise = null;
        }
        
        var templateUrl = getTemplatePath(scope.post.pageType);

        // if we already have the template in $templateCache
        var cachedHtml = $templateCache.get(templateUrl);
        if (cachedHtml) {

            // process template
            element.html(cachedHtml);
            element.replaceWith($compile(element.html())(scope));

            // cancel the interval promise
            if (scope.intervalPromise) {
                $interval.cancel(scope.intervalPromise);
                scope.intervalPromise = undefined;
            }

        // if this template is currently being pulled from online/local, it's part of an asynchronous operation so there's nothing stopping other tiles also trying to pull the same template, leading to lots of unneccesary identical http calls...
        } else if (gettingTemplate[templateUrl] && scope.intervalPromise) {
    
            // waiting for interval to complete

        // ...intead, we log which templates are currently being pulled, and use an interval to keep trying to build the template from template cache, instead of re-requesting the template from local/online
        } else if (gettingTemplate[templateUrl] && !scope.intervalPromise) {

            scope.intervalPromise = $interval(function () {
                linker(scope, element, attrs);
            }, 10);

        // else pull from local storage or online, then put into $templateCache
        } else {

            gettingTemplate[templateUrl] = true;

            // retrieve template from off or online
            sessionCacheService.jsonCache({
                'storageKey': 'vhnTemplate' + templateUrl,
                'ajaxUrl': templateUrl
                // build template
            }).then(
                // resolve
                function (response) {

                    // process template
                    element.html(response.data);
                    element.replaceWith($compile(element.html())(scope));

                    // store in $templateCache, so further tiles (on this page load) don't have to pull from online/localstorage
                    $templateCache.put(templateUrl, response.data);
                    // remove this template from the stack telling linker() that it's currently being pulled async.
                    delete gettingTemplate[templateUrl];
                }
            );

        }
    };
    return {
        restrict: 'E',
        scope: {
            index: '@',
            category: '@',
            post: '=',
            mode: '='
        },
        link: linker
    };
}]);

$(document).on('click', '.js-listItemClick', function (e) {
    var tileRoot = $(this).closest('article');
    var paramIndex = tileRoot.data('index');
    var paramCategory = tileRoot.data('category');
    ga('send', 'event', 'home', paramCategory + ' click', 'position', paramIndex);
});
