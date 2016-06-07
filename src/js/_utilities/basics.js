/* _utilities/basics.js */

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

// fetch, with XMLHttpRequest fallback. Both wrapped in a promise
function fetchish(url) {
  return new Promise(function (resolve, reject) {

    // fetch
    if(self.fetch) {
      
      fetch(url).then(function(response) {
        if(response.ok) {
          resolve(response.text());
        } else {
          reject(Error('network response not ok'));
        }
      })
      .catch(function(error) {
        reject(Error(error.message));
      });

    // non-fetch
    } else {
      
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
    }
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

function relToAbsPath (url) {
    var a = document.createElement('a');
    a.href = url;
    return a.pathname;
}

function getPathToRoot () {
  var fullPath = location.pathname;
  var fullPathArray = fullPath.split('/');
  fullPathArray.splice((fullPathArray.length - 2),1);
  return fullPathArray.join('/');
}