vhnApp.controller('DropdownController', ['$scope', '$http', '$rootScope', '$timeout', 'searchService', function ($scope, $http, $rootScope, $timeout, searchService) {
    
    $scope.target = null;
    $scope.options = null;
    $scope.dropdownActive = false;
    $scope.paramsObjectValue = searchService.getParamsObject();

    $scope.stateObjectValue = searchService.getStateObject();
    $scope.searchOptions = {};
    $scope.searchLookup = {};

    var paramDefaults = searchService.parameterDefaults;
   
    $scope.init = function (target) {
        $scope.target = target;
        $scope.options = searchService[target + 'Menu'];
        $scope.searchLookup = searchService[target + 'Options'];
        // if we're given a category id, find the associated name
        if (target == 'category' && $scope.stateObjectValue.navMode == 'menu') {
            $scope.categoryObject = searchService.getCategoryById($scope.paramsObjectValue.category);
        }
        // if the inital value is not the default, 
        if ($scope.paramsObjectValue[target].value != paramDefaults[target].value) {
            for (var i = 0; i < $scope.options.length; i++) {
                if ($scope.options[i].value == $scope.paramsObjectValue[target].value) {
                    $scope.paramsObjectValue[target].text = $scope.options[i].text;
                }
            }
        }

    };

    $rootScope.$on('backgroundClick', function () {
        $scope.dropdownActive = false;
    });

    $scope.dropdownToggle = function () {
        if ($scope.dropdownActive === false) {
            //$rootScope.$broadcast('backgroundClick');
            $timeout(function () {
                $scope.dropdownActive = true;
                if (typeof $scope.searchInputLabelOn == 'function') {
                    $scope.searchInputLabelOn();
                }
            }, 0);
        } else {
            $scope.dropdownActive = false;
            if (typeof $scope.searchInputLabelOff == 'function') {
                $scope.searchInputLabelOff();
            }
        }
    };

    $scope.dropdownToggleTab = function (tabSelector) {
        $('.vhnTabButtonActive').removeClass('vhnTabButtonActive');
        $('.cTabContentActive').removeClass('cTabContentActive');
        $(tabSelector).addClass('cTabContentActive');
    }

    $scope.toggleParticipants = function () {
            $(".gridParticipants").attr("display", "table-row");
    }

    $scope.setParams = function ($index) {
        // if we're setting a searchservice option, start a search
        if (typeof $scope.options != 'undefined') {

            $scope.paramsObjectValue[$scope.target] = $scope.options[$index].value;

            // if we're setting the drop in the searchbar
            searchService.setParams($scope.target, $scope.options[$index].value);
            if (typeof $scope.searchInputSubmit == 'function') {
                if ($scope.tempSearchPhrase && $scope.tempSearchPhrase.length) {
                    $scope.searchInputSubmit();
                }
            } else {
                searchService.setLocation();
            }

            // if the option is befattningar, open the befattningar menu
            if ($scope.target === 'type' && $scope.options[$index].value === 'Profession' && typeof $scope.toggleVisible === 'function') {
                $scope.toggleVisible();
            }
        }
    };

    //$scope.safeApply = function (fn) {
    //    if (!this.$root) {
    //        this.$apply(fn);
    //        return;
    //    }
    //    var phase = this.$root.$$phase;
    //    if (phase == '$apply' || phase == '$digest') {
    //        if (fn && (typeof (fn) === 'function')) {
    //            fn();
    //        }
    //    } else {
    //        this.$apply(fn);
    //    }
    //};

    if ($('.pageToolsRoot').length) {
        $scope.kategoriIds = $('.pageToolsRoot').data('kategori-ids');
    } else {
        $scope.kategoriIds = "0";
    }


}]);