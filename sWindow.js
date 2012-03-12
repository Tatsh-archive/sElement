/**
 * @namespace Object to represent the window and attach events in a standard
 *   way.
 * @name sWindow
 */
var sWindow = window;

if (!sWindow.addEventListener) {
  /**
   * Add an event listener to the window object. This is only used in browsers
   *   without support for addEventListener natively.
   * @param {string} type Type of event.
   * @param {(EventListener|function((sEvent|Event|null)):(boolean|undefined)|null)} func Callback.
   * @param {boolean|undefined|null} [useCapture] Not used.
   */
  sWindow.addEventListener = function (type, func, useCapture) {
    if (sWindow.attachEvent) {
      sWindow.attachEvent('on' + type, function () {
        var event = new sEvent(sWindow.event);
        var ret = func.call(sWindow, event);
        if (!ret) {
          event.preventDefault();
        }
        return ret;
      });
    }
  };
}
/**
 * Used in getHeight/width calculation.
 * @private
 * @type Element
 */
var _doc = (function (doc) {
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
sWindow.getHeight = function () {
  var height = 460;

  _doc.offsetHeight && (height = _doc.offsetHeight);
  window.innerHeight && (height = window.innerHeight);

  return height;
};
/**
 * Gets the width of the window.
 * @returns {number} Width of the window.
 */
sWindow.getWidth = function () {
  var width = 630;
  var doc = document.body;

  _doc.offsetWidth && (width = _doc.offsetWidth);
  window.innerWidth && (width = window.innerWidth);

  return width;
};
// Convenience aliases
/**
 * Global sWindow reference.
 * @type {Window}
 */
var sWin = sWindow;
sWin.bind = sWin.addEventListener;
sWin.addEvent = sWin.addEventListener;
