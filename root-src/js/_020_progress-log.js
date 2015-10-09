/* PROGRESS REPORTING */

var styleProgressLog = function (msg,status) {
    var el = document.createElement("li");
    if (status==='yes') {
        el.classList.add('style-status-yes');
    } else if (status === 'no') {
        el.classList.add('style-status-no');
    } else if (status === 'error') {
        el.classList.add('style-status-error');
    }
    var elInner = document.createTextNode(paddy(logCount,4) + ': ' + msg);
    el.appendChild(elInner);
    document.querySelector('.js-style-progress-list').appendChild(el);
    logCount++;
}

var styleProgressOpen = function () {
    document.querySelector('.js-style-progress').classList.add('style-progress-active');
}

var styleProgressClose = function () {
    setTimeout(function () {
        document.querySelector('.js-style-progress').classList.remove('style-progress-active');
        document.querySelector('.js-style-progress .fa-spin').classList.remove('fa-spin');
    }, 2000);
}

styleProgressLog('start')
styleProgressLog('page url to retrieve is ' + url);