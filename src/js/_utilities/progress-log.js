/* _utilities/progress-log.js */
/* LOG PATTERN LIBRARY PROGRESS */

var logCount = 0;
var logMarkup = document.createElement("ul");

var guideLog = function (msg,status) {
    var logMsg = paddy(logCount,4) + ': ' + msg;
    var logMarkupEl = document.createElement("li");
    if (status==='yes') {
        logMarkupEl.classList.add('style-status-yes');
        if (typeof console === 'object')
          console.log(logMsg);
    } else if (status === 'no') {
        logMarkupEl.classList.add('style-status-no');
        if (typeof console === 'object')
          console.warn(logMsg);
    } else if (status === 'error') {
        logMarkupEl.classList.add('style-status-error');
        if (typeof console === 'object')
          console.error(logMsg);
    }
    var logMarkupElText = document.createTextNode(logMsg);
    logMarkupEl.appendChild(logMarkupElText);
    logMarkup.appendChild(logMarkupEl);
    logCount++;
}

/*
var guideProgressOpen = function () {
    document.querySelector('.js-style-progress').classList.add('style-progress-active');
}

var guideProgressClose = function () {
    setTimeout(function () {
        document.querySelector('.js-style-progress').classList.remove('style-progress-active');
        document.querySelector('.js-style-progress .fa-spin').classList.remove('fa-spin');
    }, 2000);
}
*/

guideLog('start')
guideLog('page url to retrieve is ' + url);