// get list of files to process
guideList(config.url).then(function (fileArray) {
  
  guideLog('*** LOOP THRU FILES ***','yes');
  
  // an array of promises for each file and wait on them all
  return Promise.all(
    fileArray.map(function(file) {
      return new Promise(function (resolve, reject) {
        
        // pull this file
        guidePull(file).then(function (text) {
            
          return text;
        
        // pull this file FAILED
        }).catch(function(error) {
          
          reject(error);
          
        // parse this file
        }).then(function(text) {
          
          parsedBlocks = guideParse(text)
        
        // parse this file FAILED
        }).catch(function(error) {
          
          reject(error);
        
        // store this fail 
        }).then(function() {
          
          resolve(true);
          
        // store this file FAILED
        }).catch(function(error) {
          
          reject(error);
          
        })
        
      });
    })
  );
  
// get list FAILED 
}).catch(function(error) {
  
  guideLog('file list could not be retrieved, returned status ' + error, 'error');

// publish stuff  
}).then(function () {
  
  console.log('PUBLISH STUFF')
  
});



/*

// get the source url
guideSourceGet(config.url).then(function (response) {
  
  guideList = guideListGet();

    guideLog('page url retrieved', 'yes');

    // parse the source url
    return styleSourceParse(response);

}).catch(function (error) {

    guideLog('page url could not be retrieved, returned status ' + error, 'error');

}).then(function (htmlString) {

    guideLog('found ' + nodeListStylesheets.length + ' stylesheet' + (nodeListStylesheets.length != 1 ? 's' : ''));
    guideLog('found ' + nodeListScripts.length + ' javascript' + (nodeListScripts.length != 1 ? 's' : ''));

    // replicate features and links of the source url
    return styleSourceReplicate();

}).then(function () {

    // loops through CSS/JS files linked in the srource url and process them
    return styleFiles()

}).then(function () {

    // Take an array of promises for each file and wait on them all
    return Promise.all(
      fileArray.map(styleFile)
    );

}).then(function () {

    // sorts the sections sensibly
    styleJsonSort();
    // Print the navigation menu
    return stylePrintMenu();

}).then(function () {

    // all done!
    guideProgressClose();

});

codeToggle();
navClick();
*/