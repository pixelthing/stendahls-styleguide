vhnApp.controller('FormInputValidateController', ['$scope', '$http', function ($scope, $http) {

/* STYLE 2.12 FormInputValidate UI
 
> A form input component that checks via ajax if the content is valid

### DEMO

The init method feeds the url to call, the initial value and if the value was tested and valid.

        <div class="cFormInputValidate"
                ng-controller="FormInputValidateController"
                ng-init="cFormInputValidateInit('/api/DirectoryEditor/IsCdsidValid','L-LOWEN',true)"
                ng-class="{cFormInputValidateSuccess : (cFormInputValidateMode==='success'),cFormInputValidateFail : (cFormInputValidateMode==='fail' )}">
            <div class="cSpinner cFormInputValidateSpinner" ng-if="cFormInputValidateLoading">
                <div class="cSpinnerInner"></div>
            </div>
            <input class="cFormInput cFormInputValidateInput"
                    type="text"
                    name="cdsid"
                    value="L-LOWEN"
                    autocomplete="off"
                    ng-model="cFormInputValidateValue"
                    ng-change="cFormInputValidateTest()" />
            <span class="cError" ng-if="cFormInputValidateMode==='fail'">CDSID finns redan</span>
        </div>
   
*/


    $scope.cFormInputValidateLoading = false;
    $scope.cFormInputValidateMode = 'empty';

    $scope.cFormInputValidateTest = function () {
        $scope.cFormInputValidateParentVal('');
        // if no value entered
        if (!$scope.cFormInputValidateValue || !$scope.cFormInputValidateValue.length ) {
            $scope.cFormInputValidateMode = 'empty';
            return;
        }
        // if the value entered is the same as the initial value (and the initial value was tested and ok)
        if ($scope.cFormInputValidateValue === $scope.cFormInputValidateinitial && $scope.cFormInputValidateInitialOk) {
            $scope.cFormInputValidateMode = 'success';
            $scope.cFormInputValidateParentVal($scope.cFormInputValidateValue);
            return;
        }
        $scope.cFormInputValidateLoading = true;
        return $http.get(
            $scope.cFormInputValidateUrl + '?cdsid=' + $scope.cFormInputValidateValue
        ).then(
            function (response) {
                //console.log(response)
                $scope.cFormInputValidateMode = 'success';
                $scope.cFormInputValidateLoading = false;
                $scope.cFormInputValidateParentVal($scope.cFormInputValidateValue);
            },
            function (error) {
                //console.log(error)
                $scope.cFormInputValidateMode = 'fail';
                $scope.cFormInputValidateLoading = false;
            }
        );
    }

    // if we ned to pass a value to a parent controller, set the key to pass
    $scope.cFormInputValidateParentKey = function (parentKey) {
        $scope.cFormInputValidateParentKey = parentKey;
    }

    // if we ned to pass a value to a parent controller, pass the value
    $scope.cFormInputValidateParentVal = function (value) {
        // pass a variable back up the scope chain if needed
        if (typeof $scope.$parent != 'undefined' && $scope.cFormInputValidateParentKey) {
            if (!$scope.$parent.formInput) {
                $scope.$parent.formInput = [];
            }
            $scope.$parent.formInput[$scope.cFormInputValidateParentKey] = value;
        }
    }

    $scope.cFormInputValidateInit = function (urlTest, initialValue, initialValueOk) {
        $scope.cFormInputValidateUrl = urlTest;                 // url of test
        $scope.cFormInputValidateinitial = initialValue;        // hold the initail value for later
        $scope.cFormInputValidateInitialOk = initialValueOk;    // is the initial value tested and ok? true/false
        $scope.cFormInputValidateValue = initialValue;          // initial value, eg "L-LOWEN"
        $scope.cFormInputValidateTest();
    }

}]);