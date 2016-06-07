vhnApp.service('searchService', ['$location', '$cookieStore', function ($location, $cookieStore) {

    var categoryNavArray = [];

    function getCategoryNav() {

        /* TEST FOR LOCALSTORAGE (using the modernizr test) */
        var mod = 'modernizr';
        var sessionCookieName = 'vhnDevDisableSessionStorage';  // used by the developerService, Add "?sessioncacheoff" to url to turn session cache off, add "?sessioncacheon" to url to turn back on
        var localstorageEnabled = false;
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            localstorageEnabled = true;
            // continue
        } catch (e) {
            // nope.
        }

        // already sorted
        if (categoryNavArray.length) {
            return categoryNavArray;
        // else if it's in session storage
        } else if (localstorageEnabled && sessionStorage.getItem('vhnNavigation') !== null && !$cookieStore.get(sessionCookieName)) {
            categoryNavArray = JSON.parse(sessionStorage.getItem('vhnNavigation'));
        // else pull from online
        } else {
            $.ajax({
                url: '/api/navigation/get/',
                async: false,
                success: function (data) {
                    categoryNavArray = data;
                    if (localstorageEnabled && !$cookieStore.get(sessionCookieName)) {
                        sessionStorage.setItem('vhnNavigation', angular.toJson(data));
                    }
                    if ($cookieStore.get(sessionCookieName)) {
                        console.log('sessionStorage disabled by dev: nav JSON');
                    }
                },
                error: function (xhr, statusText, err) {
                    //ga('send', 'exception', {
                    //    'exDescription': err,
                    //    'exFatal': false,
                    //    'appName': 'vhnApp.searchService.navigation'
                    //});
                }
            })

        };

        return categoryNavArray;
    }
    
    function getCategoryNavLookup (data) {
        var result = {};
        if (data.length) {
            for (var i = 0; i < data.length; i++) {
                result[data[i].id] = data[i];
            }
        }
        return result;
    }

    function getCategoryForFilters(objArray) {
        var data = getCategoryNav();
        if (objArray === 'object') {
            var result = {};
            result[0] = { text: 'Alla Kategorier', value: 0, 'default': true };
            for (var j = 0; j < data.length; j++) {
                if (data[j].parentId == 0) {
                    result[data[j].id] = {
                        text: data[j].name,
                        value: data[j].id,
                        parent: data[j].parentId
                    };
                }
            }
        
        } else {
            var result = [];
            result.push({ text: 'Alla Kategorier', value: 0, 'default': true });
            for (var j = 0; j < data.length; j++) {
                if (data[j].parentId == 0) {
                    result.push({
                        text: data[j].name,
                        value: data[j].id,
                        parent: data[j].parentId
                    });
                }
            }

        }
        return result;
    }

    var typeOptions = {
        'all': { text: 'Alla typer', value: 'all', icon: 'iconChevronDown', label: 'Sök på kategori, område, personer eller taggar' },
        'Contact': { text: 'Kontakter', value: 'Contact', icon: 'iconUser', label: 'Sök efter namn, befattning, epost, cdsid, ort eller företagsnamn' },
        'Company': { text: 'Företag', value: 'Company', icon: 'iconOffice', label: 'Sök efter företag, ort eller telefonnummer' },
        'Profession': { text: 'Befattningar', value: 'Profession', icon: 'iconGroup', label: 'Sök efter befattningar' },
        'Content': { text: 'Innehåll', value: 'Content', icon: 'iconDocument', label: 'Sök efter dokument, artiklar, event, notiser och applikationer' },
        'ArticlePage': { text: 'Sidor', value: 'ArticlePage', icon: 'iconBookOpen', label: 'Sök efter artiklar' },
        'DocumentPage': { text: 'Dokument', value: 'DocumentPage', icon: 'iconDocument', label: 'Sök efter dokument' },
        'NotePage': { text: 'Notis', value: 'NotePage', icon: 'iconSpeech', label: 'Sök efter notiser' },
        'EventPage': { text: 'Event', value: 'EventPage', icon: 'iconCalendar', label: 'Sök efter event' },
        'ApplicationPage': { text: 'Applikation', value: 'ApplicationPage', icon: 'iconWrench', label: 'Sök efter applikationer' }
        }
    var categoryOptions = getCategoryForFilters('object');
    var categoryMenu = getCategoryForFilters('array');
    var dateOptions = {
            'all' : { text: 'Någonsin', value: 'all' },
            'day': { text: 'Idag', value: 'day' },
            'week': { text: 'Senaste veckan', value: 'week' },
            'month': { text: 'Senaste månaden', value: 'month' },
            'year': { text: 'Senaste året', value: 'year' }
        };
    var dateMenu = [
            dateOptions.all,
            dateOptions.day,
            dateOptions.week,
            dateOptions.month,
            dateOptions.year,
        ];
    if ($('html').hasClass('js-pageSearchTypeContactEdit')) {
        typeMenu = [
            typeOptions.Contact,
            typeOptions.Company,
            typeOptions.Profession
        ];
    } else if ($('html').hasClass('js-pageSearchTypeContact')) {
        typeMenu = [
            typeOptions.Contact,
            typeOptions.Company,
            typeOptions.Profession,
            { class: 'ddSeparator' },
            typeOptions.Content
        ];
    } else if ($('html').hasClass('js-pageSearchTypeCompany')) {
        typeMenu = [
            typeOptions.Company,
            typeOptions.Contact,
            typeOptions.Profession,
            { class: 'ddSeparator' },
            typeOptions.Content
        ];
    } else if ($('html').hasClass('js-pageSearchTypeEvent')) {
        typeMenu = [
            typeOptions.EventPage,
            { class: 'ddSeparator' },
            typeOptions.Content,
            typeOptions.Company,
            typeOptions.ApplicationPage
        ];
    } else {
        typeMenu = [
            typeOptions.Content,
            typeOptions.Contact,
            typeOptions.Company
        ];
    }

    var parameters = {
        searchPhrase: null,
        type: typeMenu[0].value,
        category: 0,
        date: dateMenu[0].value,
        tag: 0 ,
        menuItems: null
    };
    var parameterDefaults = clone(parameters); // the default values before they're changed
    var state = {
        navMode: 'search',

        resultsLoading: false,
        resultsLoaded: false,

        searchIsActive: false,
        menuSelectedLeaf: null ,

        categoryList: categoryNavArray,
        categoryLookUp: getCategoryNavLookup(categoryNavArray),
        professionsVisible: null ,
        cancelPromise: null
    }

    // Workaround for angular query issue.
    // Source: http://stackoverflow.com/questions/18538620/special-characters-in-routeparams-executing-controller-twice-in-angularjs
    function encodeUriQuery(val) {
        return encodeURIComponent(val).
            replace(/%40/gi, '@').
            replace(/%3A/gi, ':').
            replace(/%24/g, '$').
            replace(/%2C/gi, ',').
            replace(/%26/gi, '&').
            replace(/%3D/gi, '=').
            replace(/%2B/gi, '+');
    }

    return {
        getParamsObject: function () {
            return parameters;
        },
        getStateObject: function () {
            return state;
        },
        getState: function (key) {
            return state[key];
        },
        getParams: function (key) {
            return parameters[key];
        },
        setParams: function (key, value) {

            if (key === "searchPhrase" && value === "null") {
                value === null;
            }

            if (value === 'undefined') {
                value = parameterDefaults[key];
            }

            if (parameters[key] != value) {
                parameters[key] = value;
            }
        },
        setManyParams: function (object) {
            $.extend(parameters, object);
        },
        setLocation: function (type) {

            if (type === 'recommended') {
                var hash = 'search/recommended/';
                $location.path(hash);
                this.setState('searchIsActive', true);

            } else if (type === 'category') {

                var hash = 'search/null/Content/' +
                    parameters['category'] + '/' +
                    parameterDefaults['date'] + '/' +
                    parameterDefaults['tag'] + '/';

                $location.path(hash);
                this.setState('searchIsActive', true);

            } else if (parameters['searchPhrase']
                || parameters['type'] 
                || parameters['category'] 
                || parameters['tag']) {

                var hash = 'search/' +
                    (parameters['searchPhrase'] ? parameters['searchPhrase'] : 'null') + '/' +
                    parameters['type'] + '/' +
                    parameters['category'] + '/' +
                    parameters['date'] + '/' +
                    parameters['tag'] + '/';

                $location.path(hash);
                this.setState('searchIsActive', true );
            }
        },
        setState: function (key, value) {
            if (state[key] != value) {
                state[key] = value;
            }

        },
        clearFilters: function () {
            this.setManyParams({
                type: parameterDefaults.type,
                category: parameterDefaults.category,
                date: parameterDefaults.date,
                tag: parameterDefaults.tag,
                menuItems: parameterDefaults.menuItems
            });
        },
        clearSearch: function () {
            this.setState('searchIsActive', false );
        },
        clearAll: function () {
            this.clearSearch();
            this.setManyParams(parameterDefaults);
            $location.path('');
            this.setState('professionsVisible', false );
         //   this.setState('menuSelectedLeaf', null );
        },
        getCategoryById: function (id) {
            var categoryLookUp = this.getState('categoryLookUp');
            if (categoryLookUp && categoryLookUp.length && categoryLookUp != null) {
                return categoryLookUp[id];
            }
            return false;
        },
        parameterDefaults: parameterDefaults,
        typeOptions: typeOptions,
        typeMenu: typeMenu,
        categoryOptions: categoryOptions,
        categoryMenu: categoryMenu,
        dateOptions: dateOptions,
        dateMenu: dateMenu,
        menuItems: function() {
            return getCategoryNav();

        }
    };
}]);