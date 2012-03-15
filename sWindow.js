/**
 * Front-end to window object properties such as height.
 * @constructor
 */
var sWindow = function () {};
/**
  * Add an event listener to the window object. This is only used in browsers
  *   without support for addEventListener natively.
  * @param {string} type Type of event.
  * @param {(EventListener|function((sEvent|Event|null)):(boolean|undefined)|null)} func Callback.
  * @param {boolean|undefined|null} [useCapture] Not used.
  * @returns {sWindow} The object to allow method chaining.
  */
sWindow.prototype.addEventListener = function (type, func, useCapture) {
  if (window.addEventListener) {
    window.addEventListener(type, func, useCapture);
  }
  else if (window.attachEvent) {
    window.attachEvent('on' + type, function () {
      var event = new sEvent(sWindow.event);
      var ret = func.call(sWindow, event);
      if (!ret) {
        event.preventDefault();
      }
      return ret;
    });
  }
};
/**
 * Used in getHeight/width calculation.
 * @private
 * @type Element
 */
sWindow._doc = (function (doc) {
  var ret = document.body;
  if (doc.compatMode === 'CSS1Compat' && doc.documentElement) {
    ret = doc.documentElement;
  }
  return ret;
})(document);
/**
 * Gets the height of the window.
 * @returns {number} Height of the window.
 */
sWindow.prototype.getHeight = function () {
  var height = 460;

  sWindow._doc.offsetHeight && (height = sWindow._doc.offsetHeight);
  window.innerHeight && (height = window.innerHeight);

  return height;
};
/**
 * Gets the width of the window.
 * @returns {number} Width of the window.
 */
sWindow.prototype.getWidth = function () {
  var width = 630;
  var doc = document.body;

  sWindow._doc.offsetWidth && (width = sWindow._doc.offsetWidth);
  window.innerWidth && (width = window.innerWidth);

  return width;
};
/**
 * Alias to addEventListener for window.
 * @param {string} type Type of event.
 * @param {(EventListener|function((sEvent|Event|null)):(boolean|undefined)|null)} func Callback.
 * @param {boolean|undefined|null} [useCapture] Not used.
 * @returns {sWindow} The object to allow method chaining.
 */
sWindow.prototype.bind = function (type, func, useCapture) {
  return this.addEventListener(type, func, useCapture);
};
/**
 * Alias to addEventListener for window.
 * @param {string} type Type of event.
 * @param {(EventListener|function((sEvent|Event|null)):(boolean|undefined)|null)} func Callback.
 * @param {boolean|undefined|null} [useCapture] Not used.
 * @returns {sWindow} The object to allow method chaining.
 */
sWindow.prototype.addEvent = function (type, func, useCapture) {
  return this.addEventListener(type, func, useCapture);
};
/**
 * Global sWindow reference.
 * @type sWindow
 */
var sWin = new sWindow();
