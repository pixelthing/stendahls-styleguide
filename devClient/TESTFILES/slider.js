vhnApp.controller('SliderController', ['$scope', '$element', '$timeout', function ($scope, $element, $timeout) {

    $scope.currentPosition = 1;

    $scope.gridList = false;
    $scope.gridListWidth = false;
    $scope.gridListItems = false;
    $scope.gridItemsSize = false;
    $scope.gridItemWidth = false;
    $scope.maxViewable = 1;
    $scope.sliderError = false;

    var gridItemPadding = 30;

    function wiggle() {
        $scope.sliderError = true;
        $timeout(function () {
            $scope.sliderError = false;
        }, 550);
    }

    $scope.init = function (ajax, position) {
        if (ajax != true) {
            $scope.reCalc();
        }
        $scope.currentPosition = position || 1;
    };
    $scope.next = function (category) {
        if ($scope.isAtEndOfSlide()) {
            if ($scope.loadItemsEnabled) {
                $scope.getMoreItems();
                $scope.slide('forward', category);
            } else {
                wiggle();
            }
        } else {
            $scope.slide('forward', category);
        }
    };
    $scope.prev = function () {
        $scope.slide('back');
    };
    $scope.slide = function (fwdBack,category) {
        $scope.reCalc();
        var nextId = false;
        if (fwdBack == 'back') {
            nextId = $scope.currentPosition - $scope.maxViewable;
        } else {
            nextId = $scope.currentPosition + $scope.maxViewable;
        }
        if (nextId < 1) {
            nextId = 1;
            wiggle();
        }
        if (nextId > $scope.gridItemsSize - $scope.maxViewable) {
            nextId = $scope.gridItemsSize - $scope.maxViewable + 1;
        }
        if (nextId != $scope.currentPosition) {
            $element.find('.sliderItemFirst').removeClass('sliderItemFirst');
            $scope.currentPosition = nextId;
        }
        if (category) {
            ga('send', 'event', 'home', category + ' view more', 'homepage tiles viewed', $scope.maxViewable);
        }
        $timeout(function () {
            $(document).trigger('scroll'); // forces lazyload to paint any missing images
        }, 400);
    };
    $scope.isAtEndOfSlide = function (debug) {
        if (debug) {
            console.log($scope.gridItemsSize + ' < ' + $scope.maxViewable);
        }
        if ($scope.gridItemsSize < $scope.maxViewable) {
            return true;
        } else if ($scope.gridItemsSize - $scope.currentPosition < $scope.maxViewable) {
            return true;
        }
        return false;
    };
    $scope.reCalc = function () {
        $scope.gridList = $element.find('.gridList');
        $scope.gridListWidth = $scope.gridList.width();
        $scope.gridListItems = $scope.gridList.find('.gridListItem,.gridListItemFull').not('.gridListItemLoading');
        if (typeof $scope.items != 'undefined' && $scope.items.length > 0) {
            $scope.gridItemsSize = $scope.items.length;
        } else if (typeof $scope.gridListItems != 'undefined') {
            $scope.gridItemsSize = $scope.gridListItems.length;
        } else {
            $scope.gridItemsSize = 0;
        }
        $scope.gridItemWidth = $scope.gridListItems.first().width();
        $scope.gridItemOuterWidth = $scope.gridItemWidth + (gridItemPadding / 2);
        $scope.maxViewable = Math.round($scope.gridListWidth / $scope.gridItemOuterWidth);
    }

    $scope.swipe = function (direction) {
        if (Modernizr.touch) {
            if (direction == 'left') {
                $scope.next();
            } else {
                $scope.prev();
            }
        }
    };
}]);