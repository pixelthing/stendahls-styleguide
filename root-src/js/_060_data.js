/* JSON DATA STORAGE/MANIPULATION */

var styleJsonBuild = function (markdownArray, meta) {
    if (!Date.now) {
        Date.now = function () { return new Date().getTime(); }
    }
    if (!markdownArray.length) {
        return;
    }
    var blockJson = {
        'order': getStringOrder(meta.section),
        'key': (meta.fileUrl + title).hashCode(),
        'section': meta.section,
        'title': meta.title,
        'content': markdownArray.join('\n'),
        'date': Date.now(),
        'fileType': meta.fileType,
        'fileName': meta.fileName,
        'fileUrl': meta.fileUrl
    };
    return blockJson;
}

var styleJsonStore = function (blockJson) {
    styleJson.push(blockJson);
    var localStorageKey = 'sg' + blockJson.order + ': ' + blockJson.title;
    localStorage.setItem(localStorageKey, JSON.stringify(blockJson));
    styleProgressLog(blockJson.fileType + ' file ' + blockJson.fileName + '#' + blockJson.section + ' - ' + ' stored');
}

var styleJsonSort = function () {
    function compare(a, b) {
        if (a.order < b.order)
            return -1;
        if (a.order > b.order)
            return 1;
        return 0;
    }
    styleJson.sort(compare);
}

var styleJsonBlockGet = function (key) {
    for (var i = 0; i < styleJson.length; i++) {
        if (styleJson[i].key + '' === key + '') {
            return styleJson[i];
        }
    }
}