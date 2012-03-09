/*jshint sub:true */
/**
 * To emulate the document object.
 * @constructor
 * @returns {sDocument} sDocument object.
 */
var sDocument = function () {};
/**
 * Adds an event.
 * @param {string} eventName Event name.
 * @param {function()} func Callback.
 * @param {boolean} [useCapture=false] Indicates whether or not the user wishes
 *   to initiate capture.
 * @returns {sDocument} The sDocument object to allow method chaining.
 */
sDocument.prototype.addEventListener = function (eventName, func, useCapture) {
  if (useCapture === undefined) {
    useCapture = false;
  }

  var ieEventName = 'on' + eventName;

  if (sBrowser.isIEVersion('lt 9') && eventName === 'DOMContentLoaded') {
    ieEventName = 'onload';
  }

  if (document.addEventListener) {
    document.addEventListener(eventName, func, useCapture);
  }
  else if (window.attachEvent) {
    // TODO This needs to be handled sEvent internally with an ID number so it can be detached
    window.attachEvent(ieEventName, function () {
      func.call(document, new sEvent(window.event));
    });
  }

  return this;
};
/**
 * Convenience method for addEventListener().
 * @param {string} eventName Event name.
 * @param {function()} cb Callback.
 * @param {boolean} [useCapture=false] Indicates whether or not the user wishes
 *   to initiate capture.
 * @returns {sDocument} The object to allow method chaining.
 */
sDocument.prototype.addEvent = function (eventName, cb, useCapture) {
  return this.addEventListener(eventName, cb, useCapture);
};
/**
 * Convenience method for addEventListener() to be similar to jQuery.
 * @param {string} eventName Event name.
 * @param {function()} cb Callback.
 * @param {boolean} [useCapture=false] Indicates whether or not the user wishes
 *   to initiate capture.
 * @returns {sDocument} The object to allow method chaining.
 */
sDocument.prototype.bind = function (eventName, cb, useCapture) {
  return this.addEventListener(eventName, cb, useCapture);
};
/**
 * Gets an element by its ID, however this is shortened named.
 * @param {string} id ID attribute value.
 * @returns {Element|null} Element or null.
 */
sDocument.prototype.byId = function (id) {
  return document.getElementById(id);
};
/**
 * Gets elements by class name.
 * @param {string} className Class name.
 * @returns {NodeList|Array} Element node list.
 */
sDocument.prototype.byClassName = function (className) {
  return sDependencies.getElementsByClassName(className);
};
/**
 * Create a new element.
 * @param {string} elementType Element type.
 * @returns {Element} Element.
 */
sDocument.prototype.newElement = function (elementType) {
  return document.createElement(elementType);
};
/**
 * Query selector. Uses native querySelectorAll() if available and has a
 *   fallback for old browsers.<br>
 * Note that often :visited and :link pseudo selectors will be ignored. This is
 *   often for privacy reasons.<br>
 * For any browser, this only supports what that browser supports. If the
 *   browser lacks CSS 3 selectors, then this will return an empty NodeList
 *   or Array.
 * @returns {NodeList|Array} Iterable set of elements.
 */
sDocument.prototype.querySelectorAll = function (selector) {
  var doc = document;

  if (doc.querySelectorAll) {
    return doc.querySelectorAll(selector);
  }

  // IE 7 mainly
  // Based on code by Chad Scira (unobfuscated here)
  // https://gist.github.com/868532/778c45c40186a862642f72dd5b532abbe18a3625
  // (function(d){d=document,a=d.styleSheets[0]||d.createStyleSheet();d.querySelectorAll=function(e){a.addRule(e,'f:b');for(var l=d.all,b=0,c=[],f=l.length;b<f;b++)l[b].currentStyle.f&&c.push(l[b]);a.removeRule(0);return c}})()

  var styleSheet = doc.styleSheets[0] || doc.createStyleSheet();
  var all = doc.all, elements = [];

  return (function (s) {
    styleSheet.addRule(s, 'f:b');

    if (!all[0].currentStyle) { // If the browser lacks currentStyle
      return [];
    }

    for (var i = 0; i < all.length; i++) {

      if (all[i].currentStyle['f']) {
        elements.push(all[i]);
      }
    }

    styleSheet.removeRule(0);

    return elements;
  })(selector);
};
/**
 * Query selector. Uses native querySelector() if available and has a
 *   fallback for older browsers.<br>
 * Note that in :visited and :link pseudo selectors will be ignored. This is
 *   often for privacy.
 * @returns {Element|null} DOM element or null.
 */
sDocument.prototype.querySelector = function (selector) {
  var doc = document;

  if (doc.querySelector) {
    return doc.querySelector(selector);
  }

  var element = this.querySelectorAll(selector)[0];

  if (element === undefined) {
    return null;
  }

  return element;
};
/**
 * The global sDocument reference. Generally, should be the only instance of
 *   sDocument.
 * @type sDocument
 */
var sDoc = new sDocument();
