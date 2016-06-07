vhnApp.controller('SimbaTotalsController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

    $scope.items = [];
    $scope.isLoading = false;
    $scope.rawData = false;
    $scope.visible = false;
    $scope.prepSlider = false;

    $scope.toggleVisible = function () {
        $scope.visible = !$scope.visible;
        if ($scope.visible) {
            $scope.init();
            $timeout(function () {
                $scope.prepSlider = true;
            }, 500);
        } else {
            $scope.prepSlider = false;
        }
    }

    $scope.init = function () {
        $scope.isLoading = true;

        var d = new Date();
        var cacheBuster = d.getMonth()+""+d.getDay()+""+d.getHours()+Math.floor(d.getMinutes()/10);

        $http({
            method: 'GET',
            url: '/api/simbainfo/get/?cacheBuster='+cacheBuster,
        }).success(function (data) {
            $scope.rawData = data;
            $scope.processData();
            $timeout(function () {
                $scope.isLoading = false;
                $scope.reCalc();
            }, 300);
        }).error(function (e) {
            $scope.isLoading = false;
            ga('send', 'exception', {
                'exDescription': e.message,
                'exFatal': false,
                'appName': 'vhnApp.SimbaTotalsController.init'
            });
        });
    };

    $scope.processData = function () {

        var workingArray = [];
        var max = 0;
        function diffData(sold, target) {
            if (sold < 1 && target < 1) {
                return '';
            } else if (target < 1) {
                return '&infin;%';
            } else if (sold < 1) {
                return '!';
            } else if (sold === target) {
                return '=';
            } else {
                return Math.round(((target - sold) / target) * -100) + '%';
            }
        }

        // root data
        var salesThisWeek = $scope.rawData.dealerSalesInfo[0];
        var salesLastWeek = $scope.rawData.dealerSalesInfo[1];
        $scope.week = salesThisWeek.week;
        $scope.year = salesThisWeek.year;
        $scope.currentWeek = salesThisWeek.currentWeek;
        $scope.currentYear = salesThisWeek.currentYear;

        // SALES: year cumulative
        // New directives from Volvo 2015-03-02: We should show last week here instead of total.
        // Stil need to calculate thisWeek-lastWeek to get this weeks sales.
        if (salesLastWeek === undefined) {
            var salesThisYearJson = {
                'status': 'error',
                'timescale': 'year',
                'type': 'sales',
                'title': 'Bilförsäljning ÅF',
                'subtitle': 'årstotal',
                'pageType': 'SimbaTotals',
            };
            workingArray.push(salesThisYearJson);
        } else {
            var totalMax = Math.max(salesLastWeek.totalSold, salesLastWeek.totalSoldLastYear, salesLastWeek.totalTarget);
            var salesThisYearJson = {
                'status': 'ok',
                'timescale': 'year',
                'type': 'sales',
                'title': 'Bilförsäljning ÅF',
                'subtitle': salesLastWeek.year + ' t o m vecka ' + salesLastWeek.week,
                'sold': salesLastWeek.totalSold,
                'soldPercent': Math.round((salesLastWeek.totalSold / totalMax) * 100),
                'soldLastYear': salesLastWeek.totalSoldLastYear,
                'soldLastYearPercent': Math.round((salesLastWeek.totalSoldLastYear / totalMax) * 100),
                'target': salesLastWeek.totalTarget,
                'targetPercent': Math.round((salesLastWeek.totalTarget / totalMax) * 100),
                'targetLastYear': salesLastWeek.totalTargetLastYear,
                'profit': ((salesLastWeek.totalSold >= salesLastWeek.totalTarget) && salesLastWeek.totalSold > 0 ? true : false),
                'diff': diffData(salesLastWeek.totalSold, salesLastWeek.totalTarget),
                'pageType': 'SimbaTotals',
                'week': salesLastWeek.week,
                'year': salesLastWeek.year,
                'lastYear': (salesLastWeek.year - 1)
            };
            workingArray.push(salesThisYearJson);
        }

        // SALES: current/previous week
        // if data is bad
        if (salesLastWeek === undefined) {
            var salesThisWeekJson = {
                'status': 'error',
                'timescale': 'week',
                'type': 'sales',
                'title': 'Bilförsäljning ÅF',
                'subtitle': 'totalt vecka',
                'pageType': 'SimbaSales',
            };
            workingArray.push(salesThisWeekJson);
        // current week is the start of the year
        } else if (salesThisWeek.year != salesLastWeek.year) {
            var salesThisWeekJson = jQuery.extend({}, salesThisYearJson);
            salesThisWeekJson['subtitle'] = salesThisYearJson.year + ' vecka ' + salesThisYearJson.week;
            workingArray.push(salesThisWeekJson);
        } else {
            var weekSold = salesThisWeek.totalSold - salesLastWeek.totalSold;
            var weekSoldLastYear = salesThisWeek.totalSoldLastYear - salesLastWeek.totalSoldLastYear;
            var weekTarget = salesThisWeek.totalTarget - salesLastWeek.totalTarget;
            var totalMax = Math.max(weekSold, weekSoldLastYear, weekTarget);
            var salesThisWeekJson = {
                'status': 'ok',
                'timescale': 'week',
                'type': 'sales',
                'title': 'Bilförsäljning ÅF',
                'subtitle': salesThisWeek.year + ' vecka ' + salesThisWeek.week,
                'sold': weekSold,
                'soldPercent': Math.round((weekSold / totalMax) * 100),
                'soldLastYear': weekSoldLastYear,
                'soldLastYearPercent': Math.round((weekSoldLastYear / totalMax) * 100),
                'target': weekTarget,
                'targetPercent': Math.round((weekTarget / totalMax) * 100),
                'profit': ((weekSold >= weekTarget) && weekSold > 0 ? true : false),
                'diff': diffData(weekSold, weekTarget),
                'pageType': 'SimbaSales',
                'week': salesThisWeek.week,
                'year': salesThisWeek.year,
                'lastYear': (salesThisWeek.year - 1)
            };
            workingArray.push(salesThisWeekJson);
        }

        // MARKET RADAR - SALES
        // This is a new, not yet fully implemented, feature ordered by Volvo 2015-03-02
        var radarSales = $scope.rawData.marketRadarSalesInfo[0];
        if (radarSales === undefined) {
            var radarSalesJson = {
                'status': 'error',
                'timescale': 'month',
                'type': 'radarSales',
                'title': 'Nybilsradar',
                'pageType': 'SimbaWait',
            };
            workingArray.push(radarSalesJson);
        } else {
            var radarSalesJson = {
                'status': 'ok',
                'timescale': 'month',
                'type': 'radarSales',
                'title': 'Nybilsradar',
                'subtitle': radarSales.year + ' t o m ' + radarSales.day + '/' + radarSales.month,
                'target': radarSales.target + '%',
                'targetPercent': radarSales.target,
                'month1': radarSales.month1 + '%',
                'month1Percent': radarSales.month1,
                'month3': radarSales.month3 + '%',
                'month3Percent': radarSales.month3,
                'month12': radarSales.month12 + '%',
                'month12Percent': radarSales.month12,
                'pageType': 'SimbaRadar',
                'day': radarSales.day,
                'month': radarSales.month,
                'year': radarSales.year
            };
            workingArray.push(radarSalesJson);
        }


        // SERVICING: year cumulative
        var servicingThisWeek = $scope.rawData.serviceMarketSalesInfo[0];
        if (servicingThisWeek === undefined) {
            var servicingThisYearJson = {
                'status': 'error',
                'timescale': 'year',
                'type': 'servicing',
                'title': 'Servicemarknad',
                'subtitle': 'årstotal',
                'pageType': 'SimbaTotals',
            };
            workingArray.push(servicingThisYearJson);
        } else {
            var ply = Math.round(servicingThisWeek.targetPercent / ((servicingThisWeek.differenceFromPreviousYear / 100) + 1)); // percentageLastYearBasedOnThisYearsTarget
            var totalMax = Math.max(servicingThisWeek.targetPercent, ply, 100);
            var servicingThisYearJson = {
                'status': 'ok',
                'timescale': 'year',
                'type': 'servicing',
                'title': 'Servicemarknad',
                'subtitle': servicingThisWeek.year + ' t o m vecka ' + servicingThisWeek.week,
                'sold': servicingThisWeek.targetPercent + '%',
                'soldPercent': Math.round((servicingThisWeek.targetPercent / totalMax) * 100),
                'soldLastYear': ply + '%',
                'soldLastYearPercent': Math.round((ply / totalMax) * 100),
                'target': '100%',
                'targetPercent': Math.round((100 / totalMax) * 100),
                'profit': ((servicingThisWeek.targetPercent >= 100) && servicingThisWeek.targetPercent > 0 ? true : false),
                'diff': diffData(servicingThisWeek.targetPercent, 100),
                'pageType': 'SimbaTotals',
                'week': servicingThisWeek.week,
                'year': servicingThisWeek.year,
                'lastYear': (servicingThisWeek.year - 1)
            };
            workingArray.push(servicingThisYearJson);
        }


        // MARKET RADAR - WORKSHOP
        var radarWorkshop = $scope.rawData.marketRadarWorkshopInfo[0];
        if (radarWorkshop === undefined) {
            var radarWorkshopJson = {
                'status': 'error',
                'timescale': 'month',
                'type': 'radarWorkshop',
                'title': 'Verkstadsradar',
                'pageType': 'SimbaRadar',
            };
            workingArray.push(radarWorkshopJson);
        } else {
            var radarWorkshopJson = {
                'status': 'ok',
                'timescale': 'month',
                'type': 'radarWorkshop',
                'title': 'Verkstadsradar',
                'subtitle': radarWorkshop.year + ' t o m månad ' + radarWorkshop.month,
                'target': radarWorkshop.target + '%',
                'targetPercent': radarWorkshop.target,
                'month1': radarWorkshop.month1 + '%',
                'month1Percent': radarWorkshop.month1,
                'month3': radarWorkshop.month3 + '%',
                'month3Percent': radarWorkshop.month3,
                'month12': radarWorkshop.month12 + '%',
                'month12Percent': radarWorkshop.month12,
                'pageType': 'SimbaRadar',
                'month': radarWorkshop.month,
                'year': radarWorkshop.year
            };
            workingArray.push(radarWorkshopJson);
        }

        // MARKET RADAR - DAMAGE
        var radarDamage = $scope.rawData.marketRadarDamageInfo[0];
        if (radarDamage === undefined) {
            var radarDamageJson = {
                'status': 'error',
                'timescale': 'month',
                'type': 'radarDamage',
                'title': 'Skaderadar',
                'pageType': 'SimbaRadar',
            };
            workingArray.push(radarDamageJson);
        } else {
            var radarDamageJson = {
                'status': 'ok',
                'timescale': 'month',
                'type': 'radarDamage',
                'title': 'Skaderadar',
                'subtitle': radarDamage.year + ' t o m månad ' + radarDamage.month,
                'target': radarDamage.target + '%',
                'targetPercent': radarDamage.target,
                'month1': radarDamage.month1 + '%',
                'month1Percent': radarDamage.month1,
                'month3': radarDamage.month3 + '%',
                'month3Percent': radarDamage.month3,
                'month12': radarDamage.month12 + '%',
                'month12Percent': radarDamage.month12,
                'pageType': 'SimbaRadar',
                'month': radarDamage.month,
                'year': radarDamage.year
            };
            workingArray.push(radarDamageJson);
        }

        //console.log($scope.rawData);
        //console.log(workingArray);
        // load up the data structure
        $scope.items = workingArray;

    };
}]);

$(document).on('mouseleave', '.js-listItemSimbaChartBar', function () {
    var type = $(this).data('type');
    var parent = $(this).closest('.listItemSimba');
    parent.find('.js-listItemSimbaTableRow' + type).removeClass('listItemSimbaTableHover');
});
$(document).on('mouseenter', '.js-listItemSimbaChartBar', function () {
    var type = $(this).data('type');
    var parent = $(this).closest('.js-listItemSimba');
    parent.find('.js-listItemSimbaTableRow' + type).addClass('listItemSimbaTableHover');
});
$('.js-simbaDashboardButton').click(function () {
    $('.js-simbaDashboard').toggleClass('simbaDashboardOpen');
});
