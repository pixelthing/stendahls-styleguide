vhnApp.directive('repeatDone', function() {
    return function(scope, element, attrs) {
        if (scope.$last) { // all are rendered
            console.log('repeatDone')
            console.timeEnd('rec3')
            scope.$eval(attrs.repeatDone);
        }
    }
})