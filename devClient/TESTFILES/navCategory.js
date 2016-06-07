vhnApp.controller('NavCategoryController', ['$scope', '$timeout', '$location', 'searchService', function ($scope, $timeout, $location, searchService) {

    var rootItemId = 0;

    $scope.items = [];

    $scope.row1 = [];
    $scope.row2 = [];
    $scope.row3 = [];
    $scope.row4 = [];
    $scope.row5 = [];
    $scope.row6 = [];

    $scope.stateObjectValue = searchService.getStateObject();
    $scope.paramsObjectValue = searchService.getParamsObject();
    var paramDefaults = searchService.parameterDefaults;

    $scope.navMode = searchService.getState('navMode');

    $scope.$watch('paramsObjectValue', function (newVal, oldVal) {
        if (newVal.category != oldVal.category && (newVal.category === null || newVal.category === 0)) {
            clearMenus();
        }
    }, true);

    var init = function () {
        getCategoryNav();
        checkLocation();
    }

    var getCategoryLevel = function (id) {
        var menuItems = [];

        for (var i = 0; i < $scope.items.length; i++) {
            if ($scope.items[i].parentId == id)
                menuItems.push($scope.items[i]);
        }
        return menuItems;
    }

    var getCategoryNav = function () {
        $scope.items = searchService.getState('categoryList');
        $scope.row1 = getCategoryLevel(rootItemId);
    }

    // recreate the nav from the url
    var checkLocation = function () {

        var path = $location.path();
        var searchPathStarts = path.indexOf('search/');
        var searchPath = path.substr(searchPathStarts);
        if (searchPathStarts >= 0) {

            var searchPathArray = searchPath.split('/');
            var searchPhrase = searchPathArray[1];
            var type = searchPathArray[2];
            var category = searchPathArray[3];
            var date = searchPathArray[4];
            var tag = searchPathArray[5];

            // if only the category is set, but nothing else, we've probably returned to a page that had the category nav open
            if ((!searchPhrase || searchPhrase === 'null')
                && category + '' !== paramDefaults.category + ''
                && date === paramDefaults.date
                && tag + '' === paramDefaults.tag + '') {
                searchService.setState('navMode', 'menu');
            }

            var level = getCategoryLevel(category);

            // re-set-up the category nav

            function findParent(id) {
                for (var i = 0; i < $scope.items.length; i++) {
                    if ($scope.items[i].id + '' === id + '') {
                        $scope.items[i].selected = true;
                        return $scope.items[i].parentId;
                    }
                }
            }

            parentId = category;
            lvl = [parseInt(category)];
            while (parentId > 0) {
                parentId = findParent(parentId);
                if (parentId !== 0) {
                    lvl.push(parentId);
                }
            }
            lvl.reverse();

            for (var i = 0; i < lvl.length; i++) {
                $scope["row" + (i + 1)].collapsed = true;
                $scope["row" + (i + 2)] = getCategoryLevel(lvl[i]);
            }

        }
    }

    $scope.clicker = function (rowNumber) {
        var searchPhrase = false;
        var slug = this.item;
        // this slug is already selected
        if (slug.selected === true) {

            // build
            clearMenus(rowNumber + 1);
            $scope["row" + rowNumber].collapsed = false;
            slug.selected = false;

            // set new search phrase
            if (rowNumber === 1) {
                searchPhrase = null;
            } else {
                var scopeRow = $scope["row" + (rowNumber - 1)];
                for (var j = 0; j < scopeRow.length; j++) {
                    if (scopeRow[j]['selected']) {
                        searchPhrase = scopeRow[j].id;
                        break;
                    }
                }
            }

        // select this slug
        } else {
            // build
            for (var a = rowNumber; a <= 6; a++) {
                var scopeRow = $scope["row" + a];
                for (var j = 0; j < scopeRow.length; j++) {
                    delete scopeRow[j]['selected'];
                }
            }
            clearMenus(rowNumber + 1);
            $scope["row" + rowNumber].collapsed = true;
            slug.selected = true;
            $scope["row" + (rowNumber + 1)] = getCategoryLevel(slug.id);

            // set new search phrase
            searchPhrase = slug.id;
            if (isLeafNode(slug.id)) {
                $scope.stateObjectValue.menuSelectedLeaf = slug.id;
            } else {
                $scope.stateObjectValue.menuSelectedLeaf = null;
            }
        }
        $timeout(function () {
            searchService.setParams('category', (searchPhrase || 0) );
            searchService.setLocation('category');
            ga('send', 'event', 'search', 'category click ' + (searchService.getCategoryById(searchPhrase) ? searchService.getCategoryById(searchPhrase).name : 'level 0') + ' [depth ' + rowNumber + ']');
        }, 1000);
    };

    function isLeafNode(itemId) {
        for (var i = 0; i < $scope.items.length; i++) {
            if ($scope.items[i].parentId == itemId) {
                return false;
            }
        }
        return true;
    }

    function updateSearch() {
        var idString = '';

        for (var a = 1; a <= 6; a++) {
            var scopeRow = $scope["row" + a];
            for (var j = 0; j < scopeRow.length; j++) {
                if (scopeRow[j].selected) {
                    idString += scopeRow[j].id + ',';
                }
            }
        }
    }

    function clearMenus(rowNumber) { //
        if (typeof rowNumber == 'undefined') {
            rowNumber = 1;
        }
        if (rowNumber == 1) {
            $scope.row1.collapsed = false;
            //searchService.setState('searchIsActive', false);
        }
        for (var i = rowNumber ; i <= 6; i++) {
            var thisRow = $scope["row" + i];
            for (var j = 0; j < $scope["row" + i].length; j++) {
                delete $scope["row" + i][j]['selected'];
            }
            if (i >= rowNumber && i > 1) {
                $scope["row" + i] = [];
            }
        }
    }

    init();
}]);