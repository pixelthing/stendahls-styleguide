vhnApp.controller('FormSelectContactController', ['$scope', '$http', function ($scope, $http) {

/* STYLE 2.12 FormSelectContact UI
    
> An angular typeahead control specifically for selecting users in forms

### Basics

This is a wrapper for the angular/bootstrap typeahead control http://angular-ui.github.io/bootstrap/, specifically to be used to search for and select a single user, to be used in a form or in an ajax call. It has lots of config to allow you to call different API end points, style up the control and control the action on select.

Here are two patterens to copy and alter:

### The stateful form

This is used in the wizard and min-profil to select "närmaste chef". You start typing the name of your boss, see a list of names appear as you type (retrieved by ajax), select one from the list which fills in the user into a hidden field. The närmaste chef is then updated when the whole form is submitted.

        <div class="cFormSelectContact" ng-controller="FormSelectContactController" ng-init="cFormSelectContactInit({ 
                'url':  '/api/contact/QueryGroupContacts',
                'urlParams' : { 'level': 2, 'skip': 0, 'take': 1000 }, 
                'urlIdKey': 'contactid',
                'urlIdVal': '@UserHelper.CurrentUserContactCard.ContentLink.ID',
                'urlQueryKey': 'query',
                'selectedName': '@contactManagerName',
                'selectedId': '@contactManagerID'
            })">
            <div class="cSpinner cFormSelectContactSpinner" ng-show="cFormSelectContactSpinner">
                <div class="cSpinnerInner"></div>
            </div>
            <input type="text"
                   name="null1"
                   value="@contactManagerName"
                   class="cFormInput cFormSelectContactInput"
                   autocomplete="off"
                   ng-model="cFormSelectContactInputName"
                   ng-change="cFormSelectContactClear()"
                   typeahead="name for name in cFormSelectContactList($viewValue)"
                   typeahead-loading="cFormSelectContactSpinner"
                   typeahead-on-select="cFormSelectContactSelect($item)" />
            <input name="manager"
                   type="hidden"
                   value="@contactManagerID"
                   class="cFormSelectContactOutput"
                   ng-model="cFormSelectContactInputId"
                   ng-update-hidden />
        </div>

The controller has a wrapper ```.cFormSelectContact```, a visible search box ```.cFormSelectContactInput```, a hidden field for the selected user ```.cFormSelectContactOutput```, and a spinner ```.cFormSelectContactSpinner``` which appears while the control is looking up the names from the server.

In this case you can see the page has c# code that pre-loads the control with the existing boss name ````@contactManagerName``` and id ```@contactManagerID```. The control init does most of the work, it sets up the API url to use when searching, the paramaters to send it, the identity of the current user (which may effect authentication or the subset of names that come back) and the name of the key to query with (eg as you start typing "Jörg...", it will send ```name=Jörg``` as a parameter). Check out the code for a full list of options.

As you type, the àjax responses will start to come in the form of arrays such as ```[{'id':123456,'cdsid':'B-BENGT','name':'Bengt Bengtsson'},{...}]```, which are formatted into a dropdown. Clicking an item in that list triggers the line ```typeahead-on-select="cFormSelectContactSelect($item)"```, which performs a look-up on that row, and sets the cdsid and id of that user in the scope. The hidden field has a model that then inherits the user ID.

Notes:
- the hidden field uses the custom directive ```ng-update-hidden``` as models are generally not updated in hidden fields.
- the search box has ```autocomplete="off"``` to stop browser specific functions overlaying our drop down options with it's own history options.
- the search field has a null form name because it's not used by the server side, it's just a control that fills in the hidden field, which is used server side.

### The ajax select

This is an alternative where clicking on a name in the list triggers a callback. It's used in the events list, to add a user to an event.


        
        <div class="cFormSelectContact" ng-controller="FormSelectContactController" ng-init="cFormSelectContactInit({
                'url':  '/api/contact/addContactToEvent/',
                'urlParams' : { 'eventid': item.pageId },
                'urlQueryKey': 'name'
            })">
            <div ng-controller="EventListAttendeesController">
        
                <div class="cSpinner cFormSelectContactSpinner" ng-show="cFormSelectContactSpinner">
                    <div class="cSpinnerInner"></div>
                </div>
                <input type="text"
                       name="null1"
                       value=""
                       class="cFormInput cFormSelectContactInput js-eventAttendeeListAddSearch"
                       autocomplete="off"
                       ng-model="cFormSelectContactInputName"
                       typeahead="name for name in cFormSelectContactList($viewValue)"
                       typeahead-loading="cFormSelectContactSpinner"
                       typeahead-on-select="pEventListAttendeesAdd($item,item.pageId)" />
        
            </div>
        </div>

This form differs in several ways:
- __It has an extra controller wrapper inside it__, ```EventListAttendeesController``` specific to this control. This is only used to run a custom callback when you select a name from the list ```pEventListAttendeesAdd($item,item.pageId)```. It inherits all of the scope of the ```FormSelectContactController```.
- This form never prefills a user name/id
- This form has no use for the hidden field in the previous form.

*/

    /* CONFIG */

    var config = {};

    config.url = '/api/contact/QueryGroupContacts';     // The url to send ajax request to
    config.urlParams = {};                              // The existing parameters object to send to the url, eg {'query':'bob','level':2,'skip':0,'take':1000}. This doesn't include the id/cdsid of the user we're adding
    config.urlIdKey = null;                             // The current user ID key to use to send to the url (eg pageId or cdsid) - optional - if the ajax request doesn't require sending the identity of the current user, no problem.
    config.urlIdVal = null;                             // The current user ID to use to send to the url (eg 12131 or C-LEIFFS) - optional - if the ajax request doesn't required sending the identity of the current user, no problem.
    config.urlQueryKey = 'query';                       // The key to send to the url with the query that's typed in (eg "name", so that if you type in "craig", the ajax url has a param of "name=craig")
    config.selectedName = null;                         // The name of the currently selected Contact (at control init). eg, when the page loads, the visible field already says "Jörgen Niemi".
    config.selectedId = null;                           // The id/CDSID of the currently selected Contact (at control init). eg, when the page loads, the hidden field already says "123456".

    $scope.lookupTable = [];                            // the raw data from the server, used as a lookup table (it'll look something like [{'id':123456,'cdsid':'B-BENGT','name':'Bengt Bengtsson'},{...}])
    $scope.config = null;                               // config used only if it's required outside the function scope of this controller. Otherwise just user config.xxxxx

    $scope.cFormSelectContactInit = function (configObj) {

        // adjust config to requirements
        for (arg in configObj) {
            config[arg] = configObj[arg];
        }

        // set-up 
        $scope.cFormSelectContactInputName = config.selectedName;
        $scope.cFormSelectContactInputId = config.selectedId;
        if (config.urlIdKey && config.urlIdVal) {
            config.urlParams[config.urlIdKey] = config.urlIdVal;
        }
        $scope.config = config;

        $scope.$on('updateContactDefault', function (e, args) {
            $scope.cFormSelectContactInputId = args.selectedId;
            $scope.cFormSelectContactInputName = args.selectedName;
        });
    }

    $scope.cFormSelectFormParentKey = function (parentKey) {
        $scope.cFormSelectContactParentKey = parentKey;
    }

    $scope.filterContacts = function (response) {
        if (!response || !response.data || typeof response.data != 'object' || typeof response.data.filter != 'function') {
            return;
        }
        var filtredData = response.data.filter(function (item) {
            if (item.cdsid !== null) {
                return item;
            }
        });
        return filtredData;
    }

    $scope.renderContact = function (contacts) {
        if (!contacts) {
            return;
        }
        return contacts.map(function (item) {
            return item.name + ' [' + item.cdsid + ']';
        });
    }

    $scope.cFormSelectContactList = function (val) {
        config.urlParams[config.urlQueryKey] = val;
        return $http.get(config.url, {
            params: config.urlParams
        }).then(function (response) {
            $scope.lookupTable = response.data;
            var filtredContacts = $scope.filterContacts(response);
            return $scope.renderContact(filtredContacts);
        });
    }

    $scope.cFormSelectContactSelect = function (item) {
        for (var i = 0; i < $scope.lookupTable.length; i++) {
            if ($scope.lookupTable[i].name + ' [' + $scope.lookupTable[i].cdsid + ']' === item) {
                $scope.cFormSelectContactInputCdsid = $scope.lookupTable[i].cdsid;
                $scope.cFormSelectContactInputId = $scope.lookupTable[i].id;
                // pass a variable back up the scope chain if needed
                if (typeof $scope.$parent != 'undefined' && $scope.cFormSelectContactParentKey) {
                    if (!$scope.$parent.formInput) {
                        $scope.$parent.formInput = [];
                    }
                    $scope.$parent.formInput[$scope.cFormSelectContactParentKey] = $scope.cFormSelectContactInputId;
                }
                break;
            }
        }
    }

    $scope.cFormSelectContactClear = function () {
        $scope.cFormSelectContactInputId = '';
    }

}]);