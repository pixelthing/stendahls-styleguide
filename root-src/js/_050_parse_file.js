

// controller for parsing one stylesheet or javascript file
var styleFile = function (fileObj) {

    return new Promise(function (resolve, reject) {

        var lineCount = 0;
        var fileType = fileObj.type;
        var fileUrl = fileObj.url;
        var fileName = getFileName(fileUrl);

        // ajax in the requested CSS/JS file to parse
        var styleFileDownload = function () {

            ajax(fileUrl).then(function (response) {
                styleProgressLog(fileType + ' file ' + fileName + ' - downloaded');
                styleFilePreProcess(response);
            }, function (error) {
                styleProgressLog(fileType + ' file ' + fileName + ' - could not be downloaded. path: ' + fileUrl, 'error');
                return;
            });
        }

        var styleFilePreProcess = function (cssFile) {
            var cssLines = cssFile.split('\n');
            lineCount = cssLines.length;
            styleProgressLog(fileType + ' file ' + fileName + ' - ' + lineCount + ' lines');
            styleFileProcess(cssLines);
            resolve();
        }

        // processing for one js/css file, looking for blocks and code blocks
        var styleFileProcess = function (cssArray) {

            var readState = false;
            var codeState = false;
            var meta = false;
            var section = false;
            var title = false;
            var blocksCounter = 0;
            var blockLineArray = [];
            var blockCodeArray = [];

            /* CONTENT BLOCK PROCESSING */

            function styleBlockLineProcess(lineString) {
                // code block finish
                if (codeState === true && lineString.indexOf('        ') === -1) {
                    codeState = false;

                    var buffer = '';
                    blockCodeArray.forEach(function (el) {
                        buffer += el;
                    })

                    iFrameDom.querySelector('body').innerHTML = buffer;

                    var iFrameString = iFrameDom.documentElement.innerHTML;
                    var iFrameStringSrc = 'data:text/html;charset=utf-8,' + encodeURI('<!DOCTYPE html><html class="inStyleGuide">' + iFrameString + '</html>');


                    blockLineArray.push('<iframe src="' + iFrameStringSrc + '" class="style-iframe js-style-iframe">');
                    
                    blockLineArray.push('    ');
                    blockLineArray.push('<br />');
                    blockLineArray.push('<button class="style-toggle js-style-toggle"><span class="style-toggle--closed-text">Show code</span><span class="style-toggle--open-text">Hide code</span></button>');
                    blockLineArray.push('    ');
                    blockLineArray = blockLineArray.concat(blockCodeArray);
                    blockLineArray.push('    ');
                    blockLineArray.push('--------------');
                    blockCodeArray = [];
                    // code block start
                } else if (lineString.indexOf('        ') >= 0) {
                    if (codeState !== true) {
                        blockLineArray.push('--------------');
                        blockLineArray.push('        ');
                        blockLineArray.push('<br />');
                    }
                    //blockLineArray.push(lineString.substring(8));
                    blockCodeArray.push(lineString.substring(4));
                    codeState = true;
                    // non-code block
                } else {
                    blockLineArray.push(lineString);
                }
                return blockLineArray;
            }

            for (var i = 0; i < lineCount ; i++) {
                var line = cssArray[i];
                // BLOCK FINISH
                if (readState === true && line.indexOf(slugClose) >= 0) {
                    readState = false

                    var blockJson = styleJsonBuild(blockLineArray, meta);
                    styleJsonStore(blockJson)
                    blocksCounter++;
                    blockLineArray = [];
                    // BLOCK START
                } else if (line.indexOf(slugOpen) >= 0) {
                    meta = styleMetaGet(line, fileType, fileName, fileUrl);
                    blockLineArray = styleMetaPrint(blockLineArray, meta);
                    readState = true;
                    continue;
                }
                // line is ok to process as part of a block
                if (readState === true) {
                    blockLineArray = styleBlockLineProcess(line)
                }
            }
            if (blocksCounter) {
                styleProgressLog(fileType + ' file ' + fileName + ' - ' + ' CONTENT FOUND (' + blocksCounter + ' block' + (blocksCounter !== 1 ? 's' : '') + ')', 'yes');
                return;
            } else {
                styleProgressLog(fileType + ' file ' + fileName + ' - ' + ' NO CONTENT', 'no');
                return;
            }
        }

        // now download the file before processing it
        styleFileDownload();

    });

}

var styleMetaGet = function (line, fileType, fileName, fileUrl) {
    var regex = /\/\*\sSTYLE\s([0-9\.]*)\s([A-Za-z\s]*)/i;
    var found = line.match(regex);
    return {
        'section': found[1],
        'title': found[2],
        'fileType': fileType,
        'fileName': fileName,
        'fileUrl': fileUrl
    }
}

var styleMetaPrint = function (lines, meta) {
    section = meta.section;
    title = meta.title;
    lines.push('[' + section + '](#section' + section + ')' + ' ' + title);
    lines.push('-----------------------');
    lines.push('');
    return lines;
}