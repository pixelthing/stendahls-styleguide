/* 020-parse/parse-controller.js */
/* JS/CSS FILE PROCESSING */

// controller for looping through the css/js files to parse them
var styleFiles = function () {

    return new Promise(function (resolve, reject) {

        // combine links to all linked files in one array
        for (var i = 0; i < nodeListStylesheets.length ; i++) {
            fileArray.push({
                'type': 'stylesheet',
                'url': nodeListStylesheets[i].getAttribute("href"),
            });
        }
        for (var i = 0; i < nodeListScripts.length ; i++) {
            fileArray.push({
                'type': 'javascript',
                'url': nodeListScripts[i].getAttribute("src"),
            });
        }

        guideLog('about to process ' + fileArray.length + ' file' + (fileArray.length != 1 ? 's' : ''));

        resolve(fileArray);

    });

}