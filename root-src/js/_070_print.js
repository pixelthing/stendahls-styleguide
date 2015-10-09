/* STYLEGUIDE UI PRINTING */

var stylePrintMenu = function () {
    return new Promise(function (resolve, reject) {
        document.querySelector('.js-style-nav-title').innerHTML = 'Styleguide';
        for (var i = 0; i < styleJson.length; i++) {
            var blockJson = styleJson[i];
            var blockLink = document.createElement("a");
            blockLink.classList.add('style-nav-link','js-style-nav-link');
            blockLink.href = '#sg' + blockJson.key;
            blockLink.innerHTML = '<h3 class="style-nav-link-section">' + blockJson.section + '</h3> ' + blockJson.title;
            document.querySelector('.js-style-nav-menu').appendChild(blockLink);
        }
        resolve();
    })
}

var stylePrintHtml = function (key)
{
    var contentArea = document.querySelector('.js-style-body');
    var block = styleJsonBlockGet(key);
    var blockString = marked(block.content);
    var blockWrapper = document.createElement("article");
    blockWrapper.classList.add('style-block');
    blockWrapper.innerHTML = blockString;
    contentArea.innerHTML = '';
    contentArea.appendChild(blockWrapper);
    var iFrames = contentArea.querySelectorAll('.js-style-iframe');
    console.log(iFrames.length)
    iFrames.forEach(function (iFrame) {
        setTimeout(function () {
            resizeIframe(iFrame);
        },500)
    })
}