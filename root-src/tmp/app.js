var url = '/Startsida _ VHN 2.0.html';
var nodeListStylesheets = null;
var nodeListScripts = null;
var fileArray = [];
var slugOpen = '/* STYLE';
var slugClose = '*/';
var styleJson = [];
var iFrameTemplate = '<html><head><base href="' + location.protocol + '//' + location.host + '"></head><body></body></html>';
var parser = new DOMParser();
var iFrameDom = parser.parseFromString(iFrameTemplate, "text/html");
var logCount = 0;
/* UTILITIES */

// get a filesname from a path, eg "/Static/js/module/bob.js" returns "bob.js"
var getFileName = function (fullPath) {
    return fullPath.replace(/^.*[\\\/]/, '');
}

// zerofills a number
var paddy = function (n, p) {           // http://stackoverflow.com/questions/1267283/how-can-i-create-a-zerofilled-value-using-javascript
    var pad_char = '0';
    var pad = new Array(1 + p).join(pad_char);
    return (pad + n).slice(-pad.length);
}

// takes a section number and returns a sortable string. eg "2.2.12" becomes "002.002.012". Only three levels, no more!
var getStringOrder = function (section) {
    var string = section.trim();
    var array = string.split('.');
    var output = [];
    for (var i = 0; i < 3; i++) {
        if (array[i] != undefined) {
            output.push(paddy(array[i],3));
        } else {
            output.push('000');
        }
    }
    return output.join('.');
}

// generate hash
String.prototype.hashCode = function () {
    var hash = 0, i, chr, len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        hash = Math.abs(((hash << 5) - hash) + chr);
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

// ajax request, wrapped in a JS promise
function ajax(url) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.onload = function () {
            if (req.status == 200) {
                resolve(req.response);
            }
            else {
                reject(Error(req.statusText));
            }
        };
        req.onerror = function () {
            reject(Error("Network Error"));
        };
        req.send();
    });
}

// delegate event handling
(function (document, EventTarget) {

    /* Check various vendor-prefixed versions of Element.matches */
    function matches(selector, currentNode) {
        var vendors = ["webkit", "ms", "moz"],
            count = vendors.length, vendor, i;

        for (i = 0; i < count; i++) {
            vendor = vendors[i];
            if ((vendor + "MatchesSelector") in currentNode) {
                return currentNode[vendor + "MatchesSelector"](selector);
            }
        }
    }

    /* Traverse DOM from event target up to parent, searching for selector */
    function passedThrough(event, selector, stopAt) {
        var currentNode = event.target;

        while (true) {
            if (matches(selector, currentNode)) {
                return currentNode;
            }
            else if (currentNode != stopAt && currentNode != document.body) {
                currentNode = currentNode.parentNode;
            }
            else {
                return false;
            }
        }
    }

    /* Extend the EventTarget prototype to add a proxyEventListener() event */
    EventTarget.prototype.delegateEventListener = function (eName, toFind, fn) {
        this.addEventListener(eName, function (event) {
            var found = passedThrough(event, toFind, event.currentTarget);

            if (found) {
                // Execute the callback with the context set to the found element
                // jQuery goes way further, it even has it's own event object
                fn.call(found, event);
            }
        });
    };

}(window.document, window.EventTarget || window.Element));

// resize an iframe
function resizeIframe(obj) {
    console.log(obj.style.height)
    obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
}

// attach array methods to nodelists
// https://developer.mozilla.org/en/docs/Web/API/NodeList
var arrayMethods = Object.getOwnPropertyNames( Array.prototype );
arrayMethods.forEach( attachArrayMethodsToNodeList );
function attachArrayMethodsToNodeList(methodName)
{
    if(methodName !== "length") {
        NodeList.prototype[methodName] = Array.prototype[methodName];
    }
};
/* PROGRESS REPORTING */

var styleProgressLog = function (msg,status) {
    var el = document.createElement("li");
    if (status==='yes') {
        el.classList.add('style-status-yes');
    } else if (status === 'no') {
        el.classList.add('style-status-no');
    } else if (status === 'error') {
        el.classList.add('style-status-error');
    }
    var elInner = document.createTextNode(paddy(logCount,4) + ': ' + msg);
    el.appendChild(elInner);
    document.querySelector('.js-style-progress-list').appendChild(el);
    logCount++;
}

var styleProgressOpen = function () {
    document.querySelector('.js-style-progress').classList.add('style-progress-active');
}

var styleProgressClose = function () {
    setTimeout(function () {
        document.querySelector('.js-style-progress').classList.remove('style-progress-active');
        document.querySelector('.js-style-progress .fa-spin').classList.remove('fa-spin');
    }, 2000);
}

styleProgressLog('start')
styleProgressLog('page url to retrieve is ' + url);

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

        styleProgressLog('about to process ' + fileArray.length + ' file' + (fileArray.length != 1 ? 's' : ''));

        resolve(fileArray);

    });

}


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
/* STYLEGUIDE UI EVENTS */

var codeToggle = function () {
    document.querySelector('.js-style-body').delegateEventListener('click', '.js-style-toggle', function (ev) {
        ev.stopPropagation();
        this.classList.toggle('style-toggle--open');
    });
}

var navClick = function () {
    document.querySelector('.js-style-nav-menu').delegateEventListener('click', '.js-style-nav-link', function (ev) {
        ev.stopPropagation();
        this.classList.toggle('style-toggle--open');
        var parser = document.createElement('a');
        parser.href = this.href;
        var key = parser.hash.replace('#sg', '');
        stylePrintHtml(key)
    });
}
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

;(function() {

/**
 * Block-Level Grammar
 */

var block = {
  newline: /^\n+/,
  code: /^( {4}[^\n]+\n*)+/,
  fences: noop,
  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
  nptable: noop,
  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
  table: noop,
  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
  text: /^[^\n]+/
};

block.bullet = /(?:[*+-]|\d+\.)/;
block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
block.item = replace(block.item, 'gm')
  (/bull/g, block.bullet)
  ();

block.list = replace(block.list)
  (/bull/g, block.bullet)
  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
  ('def', '\\n+(?=' + block.def.source + ')')
  ();

block.blockquote = replace(block.blockquote)
  ('def', block.def)
  ();

block._tag = '(?!(?:'
  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
  ('comment', /<!--[\s\S]*?-->/)
  ('closed', /<(tag)[\s\S]+?<\/\1>/)
  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
  (/tag/g, block._tag)
  ();

block.paragraph = replace(block.paragraph)
  ('hr', block.hr)
  ('heading', block.heading)
  ('lheading', block.lheading)
  ('blockquote', block.blockquote)
  ('tag', '<' + block._tag)
  ('def', block.def)
  ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
  paragraph: /^/,
  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
  ('(?!', '(?!'
    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
    + block.list.source.replace('\\1', '\\3') + '|')
  ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */

function Lexer(options) {
  this.tokens = [];
  this.tokens.links = {};
  this.options = options || marked.defaults;
  this.rules = block.normal;

  if (this.options.gfm) {
    if (this.options.tables) {
      this.rules = block.tables;
    } else {
      this.rules = block.gfm;
    }
  }
}

/**
 * Expose Block Rules
 */

Lexer.rules = block;

/**
 * Static Lex Method
 */

Lexer.lex = function(src, options) {
  var lexer = new Lexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */

Lexer.prototype.lex = function(src) {
  src = src
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/\u00a0/g, ' ')
    .replace(/\u2424/g, '\n');

  return this.token(src, true);
};

/**
 * Lexing
 */

Lexer.prototype.token = function(src, top, bq) {
  var src = src.replace(/^ +$/gm, '')
    , next
    , loose
    , cap
    , bull
    , b
    , item
    , space
    , i
    , l;

  while (src) {
    // newline
    if (cap = this.rules.newline.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[0].length > 1) {
        this.tokens.push({
          type: 'space'
        });
      }
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      cap = cap[0].replace(/^ {4}/gm, '');
      this.tokens.push({
        type: 'code',
        text: !this.options.pedantic
          ? cap.replace(/\n+$/, '')
          : cap
      });
      continue;
    }

    // fences (gfm)
    if (cap = this.rules.fences.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'code',
        lang: cap[2],
        text: cap[3] || ''
      });
      continue;
    }

    // heading
    if (cap = this.rules.heading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[1].length,
        text: cap[2]
      });
      continue;
    }

    // table no leading pipe (gfm)
    if (top && (cap = this.rules.nptable.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i].split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // lheading
    if (cap = this.rules.lheading.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'heading',
        depth: cap[2] === '=' ? 1 : 2,
        text: cap[1]
      });
      continue;
    }

    // hr
    if (cap = this.rules.hr.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'hr'
      });
      continue;
    }

    // blockquote
    if (cap = this.rules.blockquote.exec(src)) {
      src = src.substring(cap[0].length);

      this.tokens.push({
        type: 'blockquote_start'
      });

      cap = cap[0].replace(/^ *> ?/gm, '');

      // Pass `top` to keep the current
      // "toplevel" state. This is exactly
      // how markdown.pl works.
      this.token(cap, top, true);

      this.tokens.push({
        type: 'blockquote_end'
      });

      continue;
    }

    // list
    if (cap = this.rules.list.exec(src)) {
      src = src.substring(cap[0].length);
      bull = cap[2];

      this.tokens.push({
        type: 'list_start',
        ordered: bull.length > 1
      });

      // Get each top-level item.
      cap = cap[0].match(this.rules.item);

      next = false;
      l = cap.length;
      i = 0;

      for (; i < l; i++) {
        item = cap[i];

        // Remove the list item's bullet
        // so it is seen as the next token.
        space = item.length;
        item = item.replace(/^ *([*+-]|\d+\.) +/, '');

        // Outdent whatever the
        // list item contains. Hacky.
        if (~item.indexOf('\n ')) {
          space -= item.length;
          item = !this.options.pedantic
            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
            : item.replace(/^ {1,4}/gm, '');
        }

        // Determine whether the next list item belongs here.
        // Backpedal if it does not belong in this list.
        if (this.options.smartLists && i !== l - 1) {
          b = block.bullet.exec(cap[i + 1])[0];
          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
            src = cap.slice(i + 1).join('\n') + src;
            i = l - 1;
          }
        }

        // Determine whether item is loose or not.
        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
        // for discount behavior.
        loose = next || /\n\n(?!\s*$)/.test(item);
        if (i !== l - 1) {
          next = item.charAt(item.length - 1) === '\n';
          if (!loose) loose = next;
        }

        this.tokens.push({
          type: loose
            ? 'loose_item_start'
            : 'list_item_start'
        });

        // Recurse.
        this.token(item, false, bq);

        this.tokens.push({
          type: 'list_item_end'
        });
      }

      this.tokens.push({
        type: 'list_end'
      });

      continue;
    }

    // html
    if (cap = this.rules.html.exec(src)) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: this.options.sanitize
          ? 'paragraph'
          : 'html',
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      });
      continue;
    }

    // def
    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.links[cap[1].toLowerCase()] = {
        href: cap[2],
        title: cap[3]
      };
      continue;
    }

    // table (gfm)
    if (top && (cap = this.rules.table.exec(src))) {
      src = src.substring(cap[0].length);

      item = {
        type: 'table',
        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
      };

      for (i = 0; i < item.align.length; i++) {
        if (/^ *-+: *$/.test(item.align[i])) {
          item.align[i] = 'right';
        } else if (/^ *:-+: *$/.test(item.align[i])) {
          item.align[i] = 'center';
        } else if (/^ *:-+ *$/.test(item.align[i])) {
          item.align[i] = 'left';
        } else {
          item.align[i] = null;
        }
      }

      for (i = 0; i < item.cells.length; i++) {
        item.cells[i] = item.cells[i]
          .replace(/^ *\| *| *\| *$/g, '')
          .split(/ *\| */);
      }

      this.tokens.push(item);

      continue;
    }

    // top-level paragraph
    if (top && (cap = this.rules.paragraph.exec(src))) {
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'paragraph',
        text: cap[1].charAt(cap[1].length - 1) === '\n'
          ? cap[1].slice(0, -1)
          : cap[1]
      });
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      // Top-level should never reach here.
      src = src.substring(cap[0].length);
      this.tokens.push({
        type: 'text',
        text: cap[0]
      });
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return this.tokens;
};

/**
 * Inline-Level Grammar
 */

var inline = {
  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
  url: noop,
  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
  link: /^!?\[(inside)\]\(href\)/,
  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
  br: /^ {2,}\n(?!\s*$)/,
  del: noop,
  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
  ('inside', inline._inside)
  ('href', inline._href)
  ();

inline.reflink = replace(inline.reflink)
  ('inside', inline._inside)
  ();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: replace(inline.escape)('])', '~|])')(),
  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
  del: /^~~(?=\S)([\s\S]*?\S)~~/,
  text: replace(inline.text)
    (']|', '~]|')
    ('|', '|https?://|')
    ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: replace(inline.br)('{2,}', '*')(),
  text: replace(inline.gfm.text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

function InlineLexer(links, options) {
  this.options = options || marked.defaults;
  this.links = links;
  this.rules = inline.normal;
  this.renderer = this.options.renderer || new Renderer;
  this.renderer.options = this.options;

  if (!this.links) {
    throw new
      Error('Tokens array requires a `links` property.');
  }

  if (this.options.gfm) {
    if (this.options.breaks) {
      this.rules = inline.breaks;
    } else {
      this.rules = inline.gfm;
    }
  } else if (this.options.pedantic) {
    this.rules = inline.pedantic;
  }
}

/**
 * Expose Inline Rules
 */

InlineLexer.rules = inline;

/**
 * Static Lexing/Compiling Method
 */

InlineLexer.output = function(src, links, options) {
  var inline = new InlineLexer(links, options);
  return inline.output(src);
};

/**
 * Lexing/Compiling
 */

InlineLexer.prototype.output = function(src) {
  var out = ''
    , link
    , text
    , href
    , cap;

  while (src) {
    // escape
    if (cap = this.rules.escape.exec(src)) {
      src = src.substring(cap[0].length);
      out += cap[1];
      continue;
    }

    // autolink
    if (cap = this.rules.autolink.exec(src)) {
      src = src.substring(cap[0].length);
      if (cap[2] === '@') {
        text = cap[1].charAt(6) === ':'
          ? this.mangle(cap[1].substring(7))
          : this.mangle(cap[1]);
        href = this.mangle('mailto:') + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }
      out += this.renderer.link(href, null, text);
      continue;
    }

    // url (gfm)
    if (!this.inLink && (cap = this.rules.url.exec(src))) {
      src = src.substring(cap[0].length);
      text = escape(cap[1]);
      href = text;
      out += this.renderer.link(href, null, text);
      continue;
    }

    // tag
    if (cap = this.rules.tag.exec(src)) {
      if (!this.inLink && /^<a /i.test(cap[0])) {
        this.inLink = true;
      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
        this.inLink = false;
      }
      src = src.substring(cap[0].length);
      out += this.options.sanitize
        ? this.options.sanitizer
          ? this.options.sanitizer(cap[0])
          : escape(cap[0])
        : cap[0]
      continue;
    }

    // link
    if (cap = this.rules.link.exec(src)) {
      src = src.substring(cap[0].length);
      this.inLink = true;
      out += this.outputLink(cap, {
        href: cap[2],
        title: cap[3]
      });
      this.inLink = false;
      continue;
    }

    // reflink, nolink
    if ((cap = this.rules.reflink.exec(src))
        || (cap = this.rules.nolink.exec(src))) {
      src = src.substring(cap[0].length);
      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = this.links[link.toLowerCase()];
      if (!link || !link.href) {
        out += cap[0].charAt(0);
        src = cap[0].substring(1) + src;
        continue;
      }
      this.inLink = true;
      out += this.outputLink(cap, link);
      this.inLink = false;
      continue;
    }

    // strong
    if (cap = this.rules.strong.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.strong(this.output(cap[2] || cap[1]));
      continue;
    }

    // em
    if (cap = this.rules.em.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.em(this.output(cap[2] || cap[1]));
      continue;
    }

    // code
    if (cap = this.rules.code.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.codespan(escape(cap[2], true));
      continue;
    }

    // br
    if (cap = this.rules.br.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.br();
      continue;
    }

    // del (gfm)
    if (cap = this.rules.del.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.del(this.output(cap[1]));
      continue;
    }

    // text
    if (cap = this.rules.text.exec(src)) {
      src = src.substring(cap[0].length);
      out += this.renderer.text(escape(this.smartypants(cap[0])));
      continue;
    }

    if (src) {
      throw new
        Error('Infinite loop on byte: ' + src.charCodeAt(0));
    }
  }

  return out;
};

/**
 * Compile Link
 */

InlineLexer.prototype.outputLink = function(cap, link) {
  var href = escape(link.href)
    , title = link.title ? escape(link.title) : null;

  return cap[0].charAt(0) !== '!'
    ? this.renderer.link(href, title, this.output(cap[1]))
    : this.renderer.image(href, title, escape(cap[1]));
};

/**
 * Smartypants Transformations
 */

InlineLexer.prototype.smartypants = function(text) {
  if (!this.options.smartypants) return text;
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
};

/**
 * Mangle Links
 */

InlineLexer.prototype.mangle = function(text) {
  if (!this.options.mangle) return text;
  var out = ''
    , l = text.length
    , i = 0
    , ch;

  for (; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
};

/**
 * Renderer
 */

function Renderer(options) {
  this.options = options || {};
}

Renderer.prototype.code = function(code, lang, escaped) {
  if (this.options.highlight) {
    var out = this.options.highlight(code, lang);
    if (out != null && out !== code) {
      escaped = true;
      code = out;
    }
  }

  if (!lang) {
    return '<pre><code>'
      + (escaped ? code : escape(code, true))
      + '\n</code></pre>';
  }

  return '<pre><code class="'
    + this.options.langPrefix
    + escape(lang, true)
    + '">'
    + (escaped ? code : escape(code, true))
    + '\n</code></pre>\n';
};

Renderer.prototype.blockquote = function(quote) {
  return '<blockquote>\n' + quote + '</blockquote>\n';
};

Renderer.prototype.html = function(html) {
  return html;
};

Renderer.prototype.heading = function(text, level, raw) {
  return '<h'
    + level
    + ' id="'
    + this.options.headerPrefix
    + raw.toLowerCase().replace(/[^\w]+/g, '-')
    + '">'
    + text
    + '</h'
    + level
    + '>\n';
};

Renderer.prototype.hr = function() {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
};

Renderer.prototype.list = function(body, ordered) {
  var type = ordered ? 'ol' : 'ul';
  return '<' + type + '>\n' + body + '</' + type + '>\n';
};

Renderer.prototype.listitem = function(text) {
  return '<li>' + text + '</li>\n';
};

Renderer.prototype.paragraph = function(text) {
  return '<p>' + text + '</p>\n';
};

Renderer.prototype.table = function(header, body) {
  return '<table>\n'
    + '<thead>\n'
    + header
    + '</thead>\n'
    + '<tbody>\n'
    + body
    + '</tbody>\n'
    + '</table>\n';
};

Renderer.prototype.tablerow = function(content) {
  return '<tr>\n' + content + '</tr>\n';
};

Renderer.prototype.tablecell = function(content, flags) {
  var type = flags.header ? 'th' : 'td';
  var tag = flags.align
    ? '<' + type + ' style="text-align:' + flags.align + '">'
    : '<' + type + '>';
  return tag + content + '</' + type + '>\n';
};

// span level renderer
Renderer.prototype.strong = function(text) {
  return '<strong>' + text + '</strong>';
};

Renderer.prototype.em = function(text) {
  return '<em>' + text + '</em>';
};

Renderer.prototype.codespan = function(text) {
  return '<code>' + text + '</code>';
};

Renderer.prototype.br = function() {
  return this.options.xhtml ? '<br/>' : '<br>';
};

Renderer.prototype.del = function(text) {
  return '<del>' + text + '</del>';
};

Renderer.prototype.link = function(href, title, text) {
  if (this.options.sanitize) {
    try {
      var prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase();
    } catch (e) {
      return '';
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
      return '';
    }
  }
  var out = '<a href="' + href + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += '>' + text + '</a>';
  return out;
};

Renderer.prototype.image = function(href, title, text) {
  var out = '<img src="' + href + '" alt="' + text + '"';
  if (title) {
    out += ' title="' + title + '"';
  }
  out += this.options.xhtml ? '/>' : '>';
  return out;
};

Renderer.prototype.text = function(text) {
  return text;
};

/**
 * Parsing & Compiling
 */

function Parser(options) {
  this.tokens = [];
  this.token = null;
  this.options = options || marked.defaults;
  this.options.renderer = this.options.renderer || new Renderer;
  this.renderer = this.options.renderer;
  this.renderer.options = this.options;
}

/**
 * Static Parse Method
 */

Parser.parse = function(src, options, renderer) {
  var parser = new Parser(options, renderer);
  return parser.parse(src);
};

/**
 * Parse Loop
 */

Parser.prototype.parse = function(src) {
  this.inline = new InlineLexer(src.links, this.options, this.renderer);
  this.tokens = src.reverse();

  var out = '';
  while (this.next()) {
    out += this.tok();
  }

  return out;
};

/**
 * Next Token
 */

Parser.prototype.next = function() {
  return this.token = this.tokens.pop();
};

/**
 * Preview Next Token
 */

Parser.prototype.peek = function() {
  return this.tokens[this.tokens.length - 1] || 0;
};

/**
 * Parse Text Tokens
 */

Parser.prototype.parseText = function() {
  var body = this.token.text;

  while (this.peek().type === 'text') {
    body += '\n' + this.next().text;
  }

  return this.inline.output(body);
};

/**
 * Parse Current Token
 */

Parser.prototype.tok = function() {
  switch (this.token.type) {
    case 'space': {
      return '';
    }
    case 'hr': {
      return this.renderer.hr();
    }
    case 'heading': {
      return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.depth,
        this.token.text);
    }
    case 'code': {
      return this.renderer.code(this.token.text,
        this.token.lang,
        this.token.escaped);
    }
    case 'table': {
      var header = ''
        , body = ''
        , i
        , row
        , cell
        , flags
        , j;

      // header
      cell = '';
      for (i = 0; i < this.token.header.length; i++) {
        flags = { header: true, align: this.token.align[i] };
        cell += this.renderer.tablecell(
          this.inline.output(this.token.header[i]),
          { header: true, align: this.token.align[i] }
        );
      }
      header += this.renderer.tablerow(cell);

      for (i = 0; i < this.token.cells.length; i++) {
        row = this.token.cells[i];

        cell = '';
        for (j = 0; j < row.length; j++) {
          cell += this.renderer.tablecell(
            this.inline.output(row[j]),
            { header: false, align: this.token.align[j] }
          );
        }

        body += this.renderer.tablerow(cell);
      }
      return this.renderer.table(header, body);
    }
    case 'blockquote_start': {
      var body = '';

      while (this.next().type !== 'blockquote_end') {
        body += this.tok();
      }

      return this.renderer.blockquote(body);
    }
    case 'list_start': {
      var body = ''
        , ordered = this.token.ordered;

      while (this.next().type !== 'list_end') {
        body += this.tok();
      }

      return this.renderer.list(body, ordered);
    }
    case 'list_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.token.type === 'text'
          ? this.parseText()
          : this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'loose_item_start': {
      var body = '';

      while (this.next().type !== 'list_item_end') {
        body += this.tok();
      }

      return this.renderer.listitem(body);
    }
    case 'html': {
      var html = !this.token.pre && !this.options.pedantic
        ? this.inline.output(this.token.text)
        : this.token.text;
      return this.renderer.html(html);
    }
    case 'paragraph': {
      return this.renderer.paragraph(this.inline.output(this.token.text));
    }
    case 'text': {
      return this.renderer.paragraph(this.parseText());
    }
  }
};

/**
 * Helpers
 */

function escape(html, encode) {
  return html
    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescape(html) {
  return html.replace(/&([#\w]+);/g, function(_, n) {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

function replace(regex, opt) {
  regex = regex.source;
  opt = opt || '';
  return function self(name, val) {
    if (!name) return new RegExp(regex, opt);
    val = val.source || val;
    val = val.replace(/(^|[^\[])\^/g, '$1');
    regex = regex.replace(name, val);
    return self;
  };
}

function noop() {}
noop.exec = noop;

function merge(obj) {
  var i = 1
    , target
    , key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}


/**
 * Marked
 */

function marked(src, opt, callback) {
  if (callback || typeof opt === 'function') {
    if (!callback) {
      callback = opt;
      opt = null;
    }

    opt = merge({}, marked.defaults, opt || {});

    var highlight = opt.highlight
      , tokens
      , pending
      , i = 0;

    try {
      tokens = Lexer.lex(src, opt)
    } catch (e) {
      return callback(e);
    }

    pending = tokens.length;

    var done = function(err) {
      if (err) {
        opt.highlight = highlight;
        return callback(err);
      }

      var out;

      try {
        out = Parser.parse(tokens, opt);
      } catch (e) {
        err = e;
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!pending) return done();

    for (; i < tokens.length; i++) {
      (function(token) {
        if (token.type !== 'code') {
          return --pending || done();
        }
        return highlight(token.text, token.lang, function(err, code) {
          if (err) return done(err);
          if (code == null || code === token.text) {
            return --pending || done();
          }
          token.text = code;
          token.escaped = true;
          --pending || done();
        });
      })(tokens[i]);
    }

    return;
  }
  try {
    if (opt) opt = merge({}, marked.defaults, opt);
    return Parser.parse(Lexer.lex(src, opt), opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/chjj/marked.';
    if ((opt || marked.defaults).silent) {
      return '<p>An error occured:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  return marked;
};

marked.defaults = {
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  sanitizer: null,
  mangle: true,
  smartLists: false,
  silent: false,
  highlight: null,
  langPrefix: 'lang-',
  smartypants: false,
  headerPrefix: '',
  renderer: new Renderer,
  xhtml: false
};

/**
 * Expose
 */

marked.Parser = Parser;
marked.parser = Parser.parse;

marked.Renderer = Renderer;

marked.Lexer = Lexer;
marked.lexer = Lexer.lex;

marked.InlineLexer = InlineLexer;
marked.inlineLexer = InlineLexer.output;

marked.parse = marked;

if (typeof module !== 'undefined' && typeof exports === 'object') {
  module.exports = marked;
} else if (typeof define === 'function' && define.amd) {
  define(function() { return marked; });
} else {
  this.marked = marked;
}

}).call(function() {
  return this || (typeof window !== 'undefined' ? window : global);
}());
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