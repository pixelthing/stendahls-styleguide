vhnApp.directive('lazy', ['$timeout', function ($timeout) {
  return {
    restrict: 'C',
    link: function (scope, element, attrs) {
      $timeout(function () {
        $(element).lazyload({
            load: function () {
                $(element).addClass('lazyLoaded');
            }
        });
      }, 0);
    }
  }
}]);