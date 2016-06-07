// pass in the url to a page and return a promise with an array of html/css/js files.
var guideList = function (url) {

  guideLog('*** BUILD FILE LIST ***','yes');
  
  // scoped storage
  var sourceDoc = {};
  
  return new Promise(function (resolve, reject) {
    fetchish(url).then(function(response) {
      
      // parse the response
      var sourceDocParsed = guideListSourceParse(response);
      // get stylesheet and script tags
      sourceDoc.stylesheetTags = sourceDocParsed.querySelectorAll('link[href$=".css"');
      sourceDoc.scriptTags = sourceDocParsed.querySelectorAll('script[src]');
      
      guideLog('found ' + sourceDoc.stylesheetTags.length + ' stylesheet' + (sourceDoc.stylesheetTags.length != 1 ? 's' : ''));
      guideLog('found ' + sourceDoc.scriptTags.length + ' javascript' + (sourceDoc.scriptTags.length != 1 ? 's' : ''));
      
      // extract stylesheet links
      sourceDoc.stylesheets = [];
      for (var tag of sourceDoc.stylesheetTags) {
        var link = (config.root + tag.getAttribute('href')).replace('//','/');
        if (guideListCheckBlacklist(link)) {
          sourceDoc.stylesheets.push(link);
          guideLog('stylesheet added to parsing: ' + link,'yes');
        }
      }
      // extract script links
      sourceDoc.scripts = [];
      for (var tag of sourceDoc.scriptTags) {
        var link = (config.root + tag.getAttribute('src')).replace('//','/');
        if (guideListCheckBlacklist(link)) {
          sourceDoc.scripts.push(link);
          guideLog('script added to parsing: ' + link,'yes');
        }
      }
      
      // merge arrays
      var output = [relToAbsPath(url)];
      guideLog('HTML added to parsing: ' + output[0],'yes');
      output = output.concat(sourceDoc.stylesheets,sourceDoc.scripts);
      
      // return array of links
      resolve(output);
      
    }).catch(function(error) {
      
      console.error(error)
      
    });
  });
}

// parse text/html into a queryable DOM object
var guideListSourceParse = function(htmlString) {
  var parser = new DOMParser();
  return parser.parseFromString(htmlString, "text/html");
}

var guideListCheckBlacklist = function(url) {
  for (var regex of config.filesBlacklist) {
    var myRegEx = new RegExp(regex);
    var check = myRegEx.exec(url);
    if (check) {
      guideLog('file removed due to blacklist: ' + url,'no');
      return false;
    }
  }
  return true;
}