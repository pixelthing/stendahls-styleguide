vhnApp.controller('ParticipantListController', ['$scope', '$http', function ($scope, $http) {

    $scope.result = [];
    $scope.isLoading = false;

    $scope.eventId = $('html').data('event-id');;

    if ($scope.eventId) {
        getUsersInList();
    }

    $scope.sortOptions = [
        { text: 'Osorterad', value: '' },
        { text: 'Namn', value: 'fullName' },
        { text: 'Företag', value: 'company' },
        { text: 'Arbetsroll', value: 'roles' }
    ];
    $scope.updateSortVariable = function (index) {
        $scope.sortVariable = $scope.sortOptions[index];
    }

    $scope.companyFilterOptions = [
        { text: 'Alla Företag', value: undefined }
    ];
    $scope.updateCompanyFilter = function (index) {
        $scope.companyFilter = $scope.companyFilterOptions[index];
    }

    $scope.professionFilterOptions = [
        { text: 'Alla Befattningar', value: undefined }
    ];
    $scope.updateProfessionFilter = function (index) {
        $scope.professionFilter = $scope.professionFilterOptions[index];
    }

    $scope.resetFilters = function () {
        $scope.sortVariable = $scope.sortOptions[0];
        $scope.companyFilter = $scope.companyFilterOptions[0];
        $scope.professionFilter = $scope.professionFilterOptions[0];
    };
    $scope.resetFilters();

    $scope.$watch('result', function () {
        $scope.listName = $scope.result.name;
        buildCompanyFilter($scope.result.data);
        buildProfessionFilter($scope.result.data);
        $scope.setMailTo($scope.result.data);
    }, true);

    $scope.setMailTo = function (data) {
        var mail = '';
        if (data != undefined) {
            for (var i = 0; i < data.length; i++) {
                mail += data[i].mail + ',';
            }
            $scope.mailTo = mail;
        }
    }
    function getUsersInList() {
        $scope.isLoading = true;
        $http({
            method: 'GET',
            url: '/api/event/getparticipants/' + $scope.eventId
        }).success(function (data) {
            $scope.isLoading = false;
            $scope.result = data;
        }).error(function (e) {
            $scope.isLoading = false;
            $scope.result = e;
            ga('send', 'exception', {
                'exDescription': e.message,
                'exFatal': false,
                'appName': 'vhnApp.ParticipantListController.getUsersInList'
            });
        });
    }

    function buildCompanyFilter(contacts) {
        if (contacts) {
            var companyArray = [];

            for (var i = 0; i < contacts.length; i++) {
                companyArray.push(contacts[i].company);
            }

            companyArray = companyArray.filter(onlyUnique);

            $scope.companyFilterOptions = [
                { text: 'Alla Företag', value: undefined }
            ];

            for (var j = 0; j < companyArray.length; j++) {
                if (companyArray[j]) {
                    $scope.companyFilterOptions.push({ text: companyArray[j], value: companyArray[j] });
                }
            }
        }
    }

    function buildProfessionFilter(contacts) {
        if (contacts) {
            var professionArray = [];

            for (var i = 0; i < contacts.length; i++) {
                professionArray.push(contacts[i].profession);
            }

            professionArray = professionArray.filter(onlyUnique);

            $scope.professionFilterOptions = [
                { text: 'Alla Befattningar', value: undefined }
            ];

            for (var j = 0; j < professionArray.length; j++) {
                if (professionArray[j]) {
                    $scope.professionFilterOptions.push({ text: professionArray[j], value: professionArray[j] });
                }
            }
        }
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
}]);