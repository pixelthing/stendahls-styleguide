vhnApp.service('languageService', function () {

    var stringList = {
        updated: 'Uppdaterad'
    };

    //var languageCode = $('html').attr('lang');

    //$http({
    //    method: 'GET',
    //    url: '/api/language/',
    //    params: { lang: languageCode ? languageCode : 'sv' }
    //}).success(function (data) {
    //    stringList = data;
    //}).error(function (e) {
    //    console.log(e.message);
    //
    //       ga('send', 'exception', {
    //           'exDescription': e.message,
    //           'exFatal': false,
    //           'appName': 'vhnApp.languageService'
    //           });
    //});

    return {
        getString: function (stringValue) {
            try {
                return stringList[stringValue];
            } catch (e) {
                return 'Language not set';
            }
        }
    };
});