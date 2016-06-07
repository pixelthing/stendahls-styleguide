vhnApp.controller('FormListRolesController', ['$scope', '$http', '$element', 'sessionCacheService', function ($scope, $http, $element, sessionCacheService) {


/* STYLE 2.11 FormListRoles UI

>  A variation on the formList component, specifically for the user update form

### Basics

This differs from formlist mainly because instead of updating by ajax with add/delete calls, it just modifies an array of ids of currently selected options, which is stringified and put into a hidden field, to be updated on form submit.

### Demo

        <div class="cFormList" ng-controller="FormListRolesController" ng-init="cFormListInit(@Model.SecondProfessionsWithId)">
            <!-- Current items in list (that can be removed) -->
            <div class="cFormListItem cFormListItemActive" ng-repeat="item in cFormListCurrentOptions track by item.id" ng-click="cFormListDelete('{{item.id}}')">
                <i class="icon iconSubtract"></i>
                {{item.name}}
            </div>
            <!-- UI to allow adding of new items -->
            <div class="cFormListAdd" ng-if="cFormListRemainingOptions.length">
                <i class="icon iconAdd"></i>
                <select ng-model="cFormListAddValue" ng-change="cFormListAdd(cFormListAddValue)" class="js-cFormListAddValue">
                    <option value="">Select a option to add</option>
                    <option ng-repeat="item in cFormListRemainingOptions | orderBy:'name' track by item.id" ng-value="item.id" ng-bind="item.name" ng-disabled="item.disabled"></option>
                    <option disabled ng-if="cFormRolesLoading">var god vänta</option>
                </select>
            </div>
            <input type="hidden" name="secondaryProfessions" value="" ng-model="cFormListOuput" class="js-secondaryProfressions" ng-update-hidden />
            <input type="hidden" name="secondaryProfessionsChanged" value="" ng-model="cFormListChanged" class="js-secondaryProfressionsChanged" ng-update-hidden />
        </div>

*/

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

    var originalOptions = false;

    Array.prototype.remove = function (from, to) {
        var rest = this.slice((to || from) + 1 || this.length);
        this.length = from < 0 ? this.length + from : from;
        return this.push.apply(this, rest);
    };

    $scope.cFormRolesLoading = false;

    $scope.cFormListInit = function (currentOptions) {

        // The current list of roles assigned
        $scope.cFormListCurrentOptions = currentOptions || [];
        originalOptions = angular.toJson($scope.cFormListCurrentOptions);

        // make an array of assigned role pageIds to use to cross check the options list
        var checkArray = [];
        if (currentOptions) {
            for (var i = 0; i < currentOptions.length; i++) {
                checkArray.push(currentOptions[i].id);
            }
        }

        // Pull the list of potential options from online (or local storage)
        $scope.cFormRolesLoading = true;
        sessionCacheService.jsonCache({
            'storageKey': 'vhnSecondaryProfessions',
            'ajaxUrl': '/api/secondaryprofessions/allcontainers'
        }).then(
            // resolve
            function (response) {
                //console.log('resolve!')
                var data = response.data.data;
                var dataSize = data.length;
                var output = [];
                var row = null;
                for (var i = 0; i < dataSize; i++) {
                    row = {
                        'id': data[i].pageId,
                        'name': data[i].commonName,
                        'workflow': data[i].workflowTemplateReferenceId
                    }
                    // disable all assigned roles from those that can be picked
                    if (checkArray.indexOf(data[i].pageId) >= 0) {
                        row.disabled = true;
                    }
                    output.push(row);
                }
                $scope.cFormListRemainingOptions = output;
                $scope.cFormRolesLoading = false;
            }, function (error) {
                $scope.cFormRolesLoading = false;
            }
        );

        cFormListOuputCalc();

        $scope.$watch('cFormListCurrentOptions', function () {
            cFormListOuputCalc();
            cFormListChangeCalc();
        }, true);
    }

    var processArray = function (array, action, id, value, disabledNotDeleted) {
        // array is the array to be processed - eg either $scope.cFormListCurrentOptions or $scope.cFormListRemainingOptions
        // action can be "name" (return the name), "delete" (remove from this array) or "add" (add to this array, using the extra "name" param)
        // id is the id to look for
        // value is only used if the action is "add"

        //console.log(action + ' : ' + id + ' : ' + value + ' : ' + disabledNotDeleted);

        if (action === 'add' && !disabledNotDeleted) {
            array.push({ 'id': parseInt(id), 'name': value });
            return array;
        }
        var size = array.length;
        for (var i = 0; i < size ; i++) {
            if (array[i].id + '' === id + '') { // torn both values to a string to make sure they can be compared
                if (action === 'add' && disabledNotDeleted) {
                    if (array[i].disabled) {
                        array[i].disabled = false;
                    }
                    return array;
                } else if (action === 'delete') {
                    if (disabledNotDeleted) {
                        array[i].disabled = true;
                    } else {
                        array.remove(i);
                    }
                    return array;
                } else {
                    return array[i].name;
                }
            }
        }
        return array;
    }

    $scope.cFormListAdd = function (id) {
        if (!id || !id.length) {
            return;
        }
        // add row to the current list
        var value = processArray($scope.cFormListRemainingOptions, 'name', id);
        $scope.cFormListCurrentOptions = processArray($scope.cFormListCurrentOptions, 'add', id, value);
        // remove from the options array
        $scope.cFormListRemainingOptions = processArray($scope.cFormListRemainingOptions, 'delete', id, false, true);
        // reset the add menu
        $element[0].querySelector('.js-cFormListAddValue').querySelector('option').selected = true;
        // pass back up scope chain
        $scope.cFormListParentVal($scope.cFormListCurrentOptions);
    }

    $scope.cFormListDelete = function (id) {
        if (!id) {
            return;
        }
        // add row to the options list
        var value = processArray($scope.cFormListRemainingOptions, 'name', id);
        $scope.cFormListRemainingOptions = processArray($scope.cFormListRemainingOptions, 'add', id, value, true);
        // remove from the current list
        $scope.cFormListCurrentOptions = processArray($scope.cFormListCurrentOptions, 'delete', id);
        // pass back up scope chain
        $scope.cFormListParentVal($scope.cFormListCurrentOptions);
    }

    var cFormListOuputCalc = function () {

        var size = $scope.cFormListCurrentOptions.length;
        var output = [];
        for (var i = 0; i < size ; i++) {
            output.push({'id' : $scope.cFormListCurrentOptions[i].id});
        }
        $scope.cFormListOuput = angular.toJson(output);
    }

    var cFormListChangeCalc = function () {
        $scope.cFormListChanged = (angular.toJson(sortArray(JSON.parse(originalOptions))) !== angular.toJson(sortArray($scope.cFormListCurrentOptions)) ? 'true' : '');
    }

    // if we ned to pass a value to a parent controller, set the key to pass
    $scope.cFormListParentKey = function (parentKey) {
        $scope.cFormListParentKey = parentKey;
    }

    // if we ned to pass a value to a parent controller, pass the value
    $scope.cFormListParentVal = function (value) {
        // pass a variable back up the scope chain if needed
        if (typeof $scope.$parent != 'undefined' && $scope.cFormListParentKey) {
            if (!$scope.$parent.formInput) {
                $scope.$parent.formInput = [];
            }
            $scope.$parent.formInput[$scope.cFormListParentKey] = value;
        }
    }

}]);