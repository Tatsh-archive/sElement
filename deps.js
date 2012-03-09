/*jshint expr:true */
/**
 * Dependencies.
 * @private
 * @constructor
 */
var sDependencies = function () {};
/**
 * Replacement for getElementsByClassName for non-compliant browsers.
 * Based on work by Robert Nyman.
 * @param {string} className Class name.
 * @param {Element} [elm] Element to search within. If not specified, the
 *   document object will be used.
 * @returns {Element[]|NodeList|HTMLCollection} Array of elements.
 * @see http://code.google.com/p/getelementsbyclassname/
 */
sDependencies.getElementsByClassName = function (className, elm) {
  elm === undefined && (elm = document);
  var ret, doc = document, classesToCheck, classes = className.split(' '), j;
  var elements;

  if (elm.getElementsByClassName) {
    ret = elm.getElementsByClassName(className);
  }
  else if (doc.evaluate) {
    // do XPath query and return array
    var xhtmlNamespace = 'http://www.w3.org/1999/xhtml';
    var namespaceResolver = doc.documentElement.namespaceURI === xhtmlNamespace ? xhtmlNamespace : null;
    var node;

    ret = [];
    classesToCheck = '';

    for (j = 0; j < classes.length; j++) {
      classesToCheck += '[contains(concat(" ", @class, " "), " ' + classes[j] + ' ")]';
    }

    try {
      elements = doc.evaluate('.//*' + classesToCheck, elm, namespaceResolver, 0, null);
    }
    catch (e) {
      elements = doc.evaluate('.//*' + classesToCheck, elm, null, 0, null);
    }

    while ((node = elements.iterateNext())) {
      ret.push(node);
    }
  }
  else {
    var match, k;

    ret = [];
    elements = elm.all ? elm.all : elm.getElementsByTagName('*');
    classesToCheck = [];

    for (j = 0; j < classes.length; j++) {
      classesToCheck.push(new RegExp('(\\s+)?' + classes[j] + '(\\s+)?'));
    }

    for (j = 0; j < elements.length; j++) {
      match = false;
      for (k = 0; k < classesToCheck.length; k++) {
        if (classesToCheck[k].test(elements[j].className)) {
          match = true;
          break;
        }
      }
      if (match) {
        ret.push(elements[j]);
      }
    }
  }

  return ret;
};
