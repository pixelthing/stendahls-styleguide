/* _utilities/not-jq.js */

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