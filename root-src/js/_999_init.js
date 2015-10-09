/* INIT */

var init = function () {
    styleProgressOpen();

    // get the source url
    styleSourceGet().then(function (response) {
        styleProgressLog('page url retrieved', 'yes');

        // parse the source url
        return styleSourceParse(response);

    }).catch(function (error) {
        styleProgressLog('page url could not be retrieved, returned status ' + error, 'error');

    }).then(function (htmlString) {
        styleProgressLog('found ' + nodeListStylesheets.length + ' stylesheet' + (nodeListStylesheets.length != 1 ? 's' : ''));
        styleProgressLog('found ' + nodeListScripts.length + ' javascript' + (nodeListScripts.length != 1 ? 's' : ''));

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
        styleProgressClose();

    });

    codeToggle();
    navClick();

}();