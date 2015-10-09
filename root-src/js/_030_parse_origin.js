
/* SOURCE PAGE PROCESSING */

// ajax in the requested URL(s) to look for files to parse
var styleSourceGet = function () {
    return new Promise(function (resolve, reject) {
        ajax(url).then(function (response) {
            resolve(response)
        }, function (error) {
            reject(error);
        });
    });
}

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

// Copy the js/css files (and html/body attributes - eg, ng-controller) from the source to the styleguide
var styleSourceReplicate = function () {

    return new Promise(function (resolve, reject) {

        // add the HTML tag attributes to this page
        var htmlAttr = documentHtml.attributes;
        var htmlTag = iFrameDom.querySelector('html');
        for (var i = 0; i < htmlAttr.length ; i++) {
            htmlTag.setAttribute(htmlAttr[i].name, htmlAttr[i].value);
        }
        if (htmlAttr.length) {
            styleProgressLog('added <HTML> attributes to iframe template', 'yes');
        }
        // add the BODY tag attributes to this page
        var bodyAttr = documentBody.attributes;
        var bodyTag = iFrameDom.querySelector('body');
        for (var i = 0; i < bodyAttr.length ; i++) {
            bodyTag.setAttribute(bodyAttr[i].name, bodyAttr[i].value);
        }
        if (bodyAttr.length) {
            styleProgressLog('added <BODY> attributes to iframe template', 'yes');
        }

        // add stylesheets to this page
        var localStyle = document.querySelector('.js-local-style')
        for (var i = 0; i < nodeListStylesheets.length ; i++) {
            var newNode = iFrameDom.importNode(nodeListStylesheets[i], true);
            iFrameDom.head.appendChild(newNode);
            //iFrameDom.getElementsByTagName("head")[0].insertBefore(newNode, localStyle);
        }
        styleProgressLog('added stylesheets to iframe template', 'yes');

        // add javascripts to this page
        
        for (var i = 0;i<nodeListScripts.length;i++) {
            var s = document.createElement("script");
            s.type = "text/javascript";
            s.src = location.protocol + '//' + location.host + nodeListScripts[i].getAttribute('src');
            s.async = false;
            iFrameDom.head.appendChild(s);
        }
        styleProgressLog('added javascripts to iframe template', 'yes');

        resolve();

    });
}