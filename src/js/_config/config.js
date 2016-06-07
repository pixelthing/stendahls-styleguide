/* _config/config.js */

var config = {
  url: '../TESTFILE.html',
  root: getPathToRoot(),
  filesBlacklist: ['jquery','angular','analytics.js','modernizr.js','bootstrap.js','placeholders.js']
}
console.warn('config:')
console.warn(config)

var url = '../Startsida _ VHN 2.0.html';
var nodeListStylesheets = null;
var nodeListScripts = null;
var fileArray = [];
var slugOpen = '/* STYLE';
var slugClose = '*/';
var styleJson = [];
var iFrameTemplate = '<html><head><base href="' + location.protocol + '//' + location.host + '"></head><body></body></html>';
var parser = new DOMParser();
var iFrameDom = parser.parseFromString(iFrameTemplate, "text/html");