vhnApp.controller('FormListController', ['$scope', '$http', function ($scope, $http) {

/* STYLE 2.10 FormList UI
    
> A form component for adding and deleting items to a list via ajax

### Basics

Think of a virtual list of potential options. Now split it into two - one the currently selected options, the other the remaining options not yet taken.
This UI lets you manipulate those two lists, adding and deleting potential options to your list in a logical way with waiting states and multiple ways to populate and carry out ajax calls.

The two lists are arrays of objects with simple key/value pairs, eg ```[{'id'=>'aaa','name'=>'London'},{'id'=>'111','name'=>'Gothenburg'}]```. Note that even numbers should be represented as strings by wrapping in quote.
The data can be passed in directly via the component init(), but it's probably more sensible to wrap the component in another controller specific to the use case, generate the lists and pass them in through the same scoped variables, eg ```$scope.cFormListCurrentOptions``` and ```$scope.cFormListRemainingOptions```

### Demo

        <div class="cFormList" ng-controller="FormListController" ng-init="cFormListInit('/api/user/add/','/api/user/delete/','id',{'user':9999},false,[{'id':'333','name':'Option 3'},{'id':'444','name':'Option 4'}],[{'id':'111','name':'Option 1'},{'id':'222','name':'Option 2'}])">
            <!-- Current items in list (that can be removed) -->
            <div class="cFormListItem cFormListItemActive" ng-repeat="item in cFormListCurrentOptions track by item.id" ng-click="cFormListDelete('{{item.id}}')">
                <i class="icon iconSubtract"></i>
                {{item.name}}
            </div>
            <!-- UI to allow adding of new items -->
            <div class="cFormListAdd" ng-if="cFormListRemainingOptions.length">
                <i class="icon iconAdd"></i>
                <select ng-model="cFormListAddValue" ng-change="cFormListAdd(cFormListAddValue)">
                    <option value="">Select a option to add</option>
                    <option ng-repeat="item in cFormListRemainingOptions track by item.id" ng-value="item.id" ng-bind="item.name"></option>
                </select>
            </div>
            <!-- Waiting spinner that appears when sending ajax calls -->
            <div class="cFormListWait">
                <div class="cSpinner">
                    <div class="cSpinnerInner"></div>
                </div>
            </div>
        </div>

### Calls back to the server
__USING PARAMETER BASED AJAX CALLS__

    ng-init="cFormListInit('/api/user/add/','/api/user/delete/','id',{'user':9999})"

...if you delete a role of id:666, the ajax URL will look like:

    '/api/user/delete/'

...with a parameter object of:

    { 'user':9999, 'id':666 }

    
__USING URL BASED AJAX CALLS__

    ng-init="cFormListInit('/api/user/9999/add/##id##','/api/user/9999/delete/##id##','##id##')"

...if you delete a role of id:666, the ajax URL will look like:

    '/api/user/9999/delete/666'

...with a parameter object of:

    {}

where the key of ```##id##``` is replaced by the value you want to send.
    
*/

    Array.prototype.remove = function (from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };

    $scope.cFormListLoading = false;

    $scope.cFormListInit = function (urlAdd, urlDelete, id, paramsObjAdd, paramsObjDelete, currentOptions, remainingOptions) {
        $scope.cFormListInitUrlAdd = urlAdd;
        $scope.cFormListInitUrlDelete = urlDelete;
        $scope.cFormListId = id;                                                // the key to change - ie, the DB table field name to change. if you're using parameter style call, that's it. If you're using a URL style call, wrap it in ##, eg ##role_id## and then use it in the ajax call url as the replacement text (eg /api/delete/##role_id##/)
        $scope.cFormListAddParams = paramsObjAdd || {};                         // parameters are used if the API call isn't just a straight URL call
        $scope.cFormListDeleteParams = paramsObjDelete || paramsObjAdd || {};   // delete parameters are very optional, if not specified, it defaults to the first set of parameters given, or returns an empty object if those are also empty

        // if the two lists aren't passed in by a container controller, they can be set-up in the init
        if (!$scope.cFormListCurrentOptions) {
            $scope.cFormListCurrentOptions = sortArray(currentOptions) || [];
        }
        if (!$scope.cFormListRemainingOptions) {
            $scope.cFormListRemainingOptions = sortArray(remainingOptions) || [];
        }
    }

    var sortArray = function (array) {
        function compare(a, b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        }
        return array.sort(compare);
    }

    var processArray = function (array, action, id, value) {
        // array is the array to be processed - eg either $scope.cFormListCurrentOptions or $scope.cFormListRemainingOptions
        // action can be "name" (return the name), "delete" (remove from this array) or "add" (add to this array, using the extra "name" param)
        // id is the key to look for
        // value is only used if the action is "add"
        if (action === 'add') {
            array.push({ 'id': id, 'name': value });
            return sortArray(array);
        }
        var size = array.length;
        for (var i = 0; i < size ; i++) {
            if (array[i].id === id) {
                if (action === 'delete') {
                    array.remove(i);
                    return sortArray(array);
                } else {
                    return array[i].name;
                }
            }
        }
    }

    $scope.cFormListAdd = function (id) {
        if (!id || !id.length) {
            return;
        }
        if (confirm('Do you want to add this item to the list immediately?')) {
            $scope.cFormListLoading = true;
            return $http.get(buildUrl('add', id), {
                params: buildParams('add', id)
            }).then(
                function (response) {
                    $scope.cFormListLoading = false;
                    // add row to the current list
                    var value = processArray($scope.cFormListRemainingOptions, 'name', id);
                    $scope.cFormListCurrentOptions = processArray($scope.cFormListCurrentOptions, 'add', id, value);
                    // remove from the options array
                    $scope.cFormListRemainingOptions = processArray($scope.cFormListRemainingOptions, 'delete', id);
                    // reset the add menu
                    $scope.cFormListAddValue = '';
                },
                function (error) {
                    $scope.cFormListLoading = false;
                    alert('Sorry - unable to update this time. Please try again');
                    // reset the add menu
                    $scope.cFormListAddValue = '';
                    console.log(error);
                }
            );

        }
    }

    $scope.cFormListDelete = function (id) {
        if (!id) {
            return;
        }
        if (confirm('Do you want to remove this item from the list immediately?')) {
            $scope.cFormListLoading = true;
            return $http.get(buildUrl('delete', id), {
                params: buildParams('delete', id)
            }).then(
                function (response) {
                    $scope.cFormListLoading = false;
                    // add row to the options list
                    var value = processArray($scope.cFormListCurrentOptions, 'name', id);
                    $scope.cFormListRemainingOptions = processArray($scope.cFormListRemainingOptions, 'add', id, value);
                    // remove from the current list
                    $scope.cFormListCurrentOptions = processArray($scope.cFormListCurrentOptions, 'delete', id);
                    // reset the add menu
                    $scope.cFormListAddValue = '';
                },
                function (error) {
                    $scope.cFormListLoading = false;
                    alert('Sorry - unable to update this time. Please try again');
                    // reset the add menu
                    $scope.cFormListAddValue = '';
                    console.log(error);
                }
            );

        }
    }

    var buildUrl = function (type, value) {
        var outputUrl = 'xxxx';
        if (type === 'add') {
            outputUrl = $scope.cFormListInitUrlAdd;
        } else {
            outputUrl = $scope.cFormListInitUrlDelete;
        }
        // if the call is with url params
        if ($scope.cFormListId.indexOf('##') >= 0) {
            var regex = new RegExp($scope.cFormListId, "g");
            outputUrl = outputUrl.replace(regex, value);
        }
        return outputUrl;
    }

    var buildParams = function (type, value) {
        var outputObj = {};
        // if the call is *NOT* with url params
        if ($scope.cFormListId.indexOf('##') >= 0) {
            return {};
            // if the call is with post parameters
        } else if (type === 'add') {
            outputObj = $scope.cFormListAddParams;
        } else {
            outputObj = $scope.cFormListDeleteParams;
        }
        outputObj[$scope.cFormListId] = value;

        return outputObj;
    }

}]);