/*jshint expr:true, sub:true */

/**
 * Static class for manipulation of element CSS properties.
 * @constructor
 */
var sCSS = function () {};
/**
 * Transform properties to change for an element, including all supported
 *   vendor prefixes.
 * @const
 * @type Array
 */
sCSS.transformProperties = [
  'MozTransform',
  'msTransform',
  'OTransform',
  'webkitTransform',
  'transform'
];
/**
 * CSS units for use in a regular expression.
 * @const
 * @type string
 * @private
 */
sCSS._cssUnitRegExpPart = '(%|px|em|in|ex|cm|mm|pt|pc)';
/**
 * Regular expression for matching 2D matrix strings.<br>
 * Example string: <code>matrix(1, 0, 0, 1, 10, 0)</code><br>
 *
 * Index 14 is the X-direction.<br>
 * Index 19 is the Y-direction.<br>
 *
 * @type RegExp
 */
sCSS.matrixRegExp = (function () {
  var regex = 'matrix\\(';

  for (var i = 0; i < 4; i++) {
    regex += '(\\s+)?\\d+(\\.d+)?(\\s+)?,';
  }

  regex += '(\\s+)?(\\d+(\\.\\d+)?)(\\s+)?' + sCSS._cssUnitRegExpPart + '?(\\s+)?,';
  regex += '(\\s+)?(\\d+(\\.\\d+)?)(\\s+)?' + sCSS._cssUnitRegExpPart + '?(\\s+)?\\)';

  return new RegExp(regex, 'i');
})();
/**
 * Regular expression for matching 3D matrix strings.<br>
 * Example string: <code>matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 20, 30, 1)</code><br>
 *
 * Index 38 is the X direction.<br>
 * Index 42 is the Y direction.<br>
 * Index 46 is the Z direction.<br>
 *
 * @type RegExp
 */
sCSS.matrix3dRegExp = (function () {
  var regex  = 'matrix3d\\(', i;
  for (i = 0; i < 12; i++) {
    regex += '(\\s+)?\\d+(\\.d+)?(\\s+)?,';
  }
  for (i = 0; i < 3; i++) {
    // Firefox returns a matrix() with units while Chrome does not
    regex += '(\\s+)?(\\d+(\\.\\d+)?)' + sCSS._cssUnitRegExpPart + '?,';
  }
  regex += '(\\s+)?\\d+(\\.d+)?(\\s+)?\\)';

  return new RegExp(regex, 'i');
})();
/**
 * Regular expression for matching translate() and translate3d() CSS strings.
 * @const
 * @type RegExp
 */
sCSS.translateRegExp = /translate(3d)?(\s+)?\((\s+)?((\d+)(\.\d+)?)(\s+)?(%|px|em|in|ex|cm|mm|pt|pc)?(\s+)?,(\s+)?((\d+)(\.\d+)?)(\s+)?(%|px|em|in|ex|cm|mm|pt|pc)?(\s+)?(,(\s+)?((\d+)(\.\d+)?)(\s+)?(%|px|em|in|ex|cm|mm|pt|pc)?)?\)/i;
/**
 * If the browser supports CSS transforms. For use before calling methods
 *   like sCSS.translate().
 * @type boolean
 * @see sCSS#translate
 */
sCSS.hasTransforms = (function () {
  var el = document.createElement('div');
  var style = el.style;
  for (var i = 0; i < sCSS.transformProperties.length; i++) {
    if (sCSS.transformProperties[i] in style) {
      return true;
    }
  }
  return false;
})();
/**
 * Adds all transform properties for the translate() or translate3d() CSS
 *   function, handling 2D and 3D internally.
 * @param {Element} element DOM element.
 * @param {number} x Translation in X direction.
 * @param {number} [y=0] Translation in Y direction, optional.
 * @param {number} [z=0] Translation in Z direction, optional.
 * @param {string} [unit='px'] Unit to use.
 * @returns {Element} HTML element that may have been translated.
 */
sCSS.translate = function (element, x, y, z, unit) {
  if (!sCSS.hasTransforms) {
    return element;
  }

  unit === undefined && (unit = 'px');
  y === undefined && (y = 0);
  z === undefined && (z = 0);

  var func = 'translate(';
  var has3d = false;
  var output = '';
  if (window['Modernizr'] && window['Modernizr']['csstransforms3d']) {
    func = 'translate3d(';
    has3d = true;
  }

  for (var i = 0; i < sCSS.transformProperties.length; i++) {
    output  = func + x + unit + ',';
    output += y + unit;
    if (has3d) {
      output += ',' + z + unit + ')';
    }
    else {
      output += ')';
    }
    element.style[sCSS.transformProperties[i]] = output;
  }

  return element;
};
/**
 * Get the current translation on an axis.
 * @param {Element} element DOM element.
 * @param {string} dir Direction. One of: 'x', 'y', 'z'.
 * @param {boolean} [noPx=false] Set to true to force not using
 *   getComputedStyle().
 * @returns {number} Number of units. This value differs between browsers.
 * <ul>
 *   <li>WebKit-based browsers will return the value in pixels if the
 *     getComputedStyle() function differs. So if you are not using pixels, set
 *     <strong>noPx</strong> to <em>true</em>.</li>
 *   <li>Firefox will return the value in its original units.</li>
 * </ul>
 */
sCSS.currentTranslationOnAxis = function (element, dir, noPx) {
  if (!sCSS.hasTransforms) {
    return 0;
  }

  var ret = 0, i;
  var is3D = false;
  var offsets = { // 2d offsets from regex
    x: 4,
    y: 11,
    z: 99
  };

  dir = dir.toLowerCase();
  noPx === undefined && (noPx = false);

  if (window.getComputedStyle && !noPx) {
    var style = window.getComputedStyle(element, null), transform, regex, x, y, z, matches;
    for (i = 0; i < sCSS.transformProperties.length; i++) {
      if (sCSS.transformProperties[i] in style) {
        transform = style[sCSS.transformProperties[i]];
        break;
      }
    }

    if (transform) {
      x = y = z = 0;

      if (transform.substr(0, 8).toLowerCase() === 'matrix3d') {
        matches = transform.match(sCSS.matrix3dRegExp);
        if (matches) {
          x = matches[38] ? parseFloat(matches[38]) : 0;
          y = matches[42] ? parseFloat(matches[42]) : 0;
          z = matches[46] ? parseFloat(matches[46]) : 0;
        }
      }
      else {
        z = 0;
        matches = transform.match(sCSS.matrixRegExp);
        if (matches) {
          x = matches[14] ? parseFloat(matches[14]) : 0;
          y = matches[20] ? parseFloat(matches[20]) : 0;
        }
      }

      switch (dir) {
        case 'x':
          return x;

        case 'y':
          return y;

        case 'z':
          return z;
      }
    }
  }

  for (i = 0; i < sCSS.transformProperties.length; i++) {
    ret = element.style[sCSS.transformProperties[i]];
    if (ret) {
      ret = ret.match(sCSS.translateRegExp);
      if (ret) {
        is3D = ret[1] && ret[1].toLowerCase() === '3d';
        break;
      }
    }
  }

  if (!ret) {
    return 0;
  }

  if (is3D) {
    offsets.z = 15;
  }

  switch (dir) {
    case 'x':
      ret = ret[offsets.x] ? ret[offsets.x] : 0;
      break;

    case 'y':
      ret = ret[offsets.y] ? ret[offsets.y] : 0;
      break;

    case 'z':
      ret = ret[offsets.z] ? ret[offsets.z] : 0;
      break;
  }

  return parseFloat(ret);
};
/**
 * Convenience method for translating on the X-axis.
 * @param {Element} element DOM element.
 * @param {number} x Translation in X direction.
 * @param {string} [unit="px"] Unit to use. By default, "px" is used.
 * @returns {Element} HTML element that may have been translated.
 */
sCSS.translateX = function (element, x, unit) {
  if (!sCSS.hasTransforms) {
    return element;
  }

  var y = sCSS.currentTranslationOnAxis(element, 'y');
  var z = sCSS.currentTranslationOnAxis(element, 'z');
  return sCSS.translate(element, x, y, z, unit);
};
/**
 * Convenience method for translating on the Y-axis.
 * @param {Element} element DOM element.
 * @param {number} y Translation in Y direction.
 * @param {string} [unit="px"] Unit to use. By default, "px" is used.
 * @returns {Element} HTML element that may have been translated.
 */
sCSS.translateY = function (element, y, unit) {
  if (!sCSS.hasTransforms) {
    return element;
  }

  var x = sCSS.currentTranslationOnAxis(element, 'x');
  var z = sCSS.currentTranslationOnAxis(element, 'z');
  return sCSS.translate(element, x, y, z, unit);
};
/**
 * Convenience method for translating on the Z-axis.
 * @param {Element} element DOM element.
 * @param {number} z Translation in Z direction.
 * @param {string} [unit="px"] Unit to use. By default, "px" is used.
 * @returns {Element} HTML element that may have been translated.
 */
sCSS.translateZ = function (element, z, unit) {
  if (!sCSS.hasTransforms) {
    return element;
  }

  var x = sCSS.currentTranslationOnAxis(element, 'x');
  var y = sCSS.currentTranslationOnAxis(element, 'y');
  return sCSS.translate(element, x, y, z, unit);
};
/**
 * If the browser supports the :focus pseudo-selector.
 * @type boolean
 */
sCSS.supportsFocus = (function () {
  var doc = document;
  var anchor = doc.createElement('a');
  var id = 't' + (new Date()).getTime();
  var ret = true;

  anchor.setAttribute('id', id);
  anchor.setAttribute('href', '#');
  anchor.style.top = '-1000px';
  anchor.style.position = 'absolute';
  doc.body.appendChild(anchor);

  if (window.getComputedStyle) {
    var head = document.getElementsByTagName('head')[0];
    var styleSheetText = '<style>#' + id + '{font-size:10px}';
    styleSheetText += '#' + id + ':focus{font-size:1px}';
    styleSheetText += '</style>';
    head.innerHTML += styleSheetText;

    anchor.focus();

    ret = window.getComputedStyle(anchor, null).fontSize === '1px';

    var style = head.getElementsByTagName('style');
    style = style[style.length - 1];
    head.removeChild(style);
  }
  else if (doc.createStyleSheet && anchor.currentStyle) { // IE
    var styleSheet = doc.styleSheets[0] ||doc.createStyleSheet();
    styleSheet.addRule('#' + id, 'font-size:10px');
    styleSheet.addRule('#' + id + ':focus', 'font-size:1px !important');

    anchor.focus();

    ret = anchor.currentStyle.fontSize === '1px';

    styleSheet.removeRule(styleSheet.rules.length - 2);
    styleSheet.removeRule(styleSheet.rules.length - 1);
  }

  doc.body.removeChild(anchor);

  return ret;
})();
