// read the source file(s) and find all the links CSS/JS
var styleSourceParse = function (htmlString) {

    return new Promise(function (resolve, reject) {

        var parser = new DOMParser();
        var tempDocument = parser.parseFromString(htmlString, "text/html");

        documentHtml = tempDocument.querySelector('html');
        documentBody = tempDocument.querySelector('body');
        nodeListStylesheets = tempDocument.querySelectorAll('link[href$=".css"');
        nodeListScripts = tempDocument.querySelectorAll('script[src]');

        resolve();
    });
}