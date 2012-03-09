/*jshint expr:true */

/**
 * This file is standalone and does not require any part of sutra-js.
 *   The part needed (sCSS) is already included.
 */

if (window['jQuery']) {
  (function ($) {
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
    sCSS.hasTransforms = Modernizr['csstransforms'] || Modernizr['csstransforms3d'];
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
      if (Modernizr['csstransforms3d']) {
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
     * @name $.fn
     * @namespace Alias for jQuery.prototype.
     * @see jQuery#prototype
     */
    //$.fn = function () {};
    /**
     * @namespace Support attributes based on the browser/environment.
     * @name $.support
     */
    //$.support = {};
    /**
     * Translates the element using CSS transforms.
     * @param {number} x Translation in x-direction.
     * @param {number} [y=0] Translation in y-direction.
     * @param {number} [z=0] Translation in z-direction. Ignored if the browser
     *   does not support it.
     * @param {string} [unit="px"]
     * @returns {jQuery} jQuery object to allow method chaining.
     */
    $.fn.cssTranslate = function (x, y, z, unit) {
      sCSS.translate(this.get(0), x, y, z, unit);
      return this;
    };
    /**
     * Translates the element in the x-direction using CSS transform.
     *   Maintains other axis transforms.
     * @param {number} x Translation in x-direction.
     * @returns {jQuery} jQuery object to allow method chaining.
     */
    $.fn.cssTranslateX = function (x, unit) {
      sCSS.translateX(this.get(0), x, unit);
      return this;
    };
    /**
     * Translates the element in the y-direction using CSS transform.
     *   Maintains other axis transforms.
     * @param {number} y Translation in y-direction.
     * @returns {jQuery} jQuery object to allow method chaining.
     */
    $.fn.cssTranslateY = function (y, unit) {
      sCSS.translateY(this.get(0), y, unit);
      return this;
    };
    /**
     * Translates the element in the z-direction using CSS transform.
     *   Maintains other axis transforms.
     * @param {number} z Translation in z-direction.
     * @returns {jQuery} jQuery object to allow method chaining.
     */
    $.fn.cssTranslateZ = function (z, unit) {
      sCSS.translateY(this.get(0), z, unit);
      return this;
    };
    /**
     * Gets the current translation value in a particular direction.
     * @param {string} dir Direction. One of 'x', 'y', 'z'. 'z' is ignored
     *   if the browser does not support 3D transformations.
     * @param {boolean} [noPx=false] Set to true if not using pixels. If left
     *   as false, getComputedStyle will be used if possible. Note that WebKit
     *   always returns pixels within its computed matrix().
     * @returns {number} Current translation value.
     */
    $.fn.cssCurrentTranslationOnAxis = function (dir, noPx) {
      return sCSS.currentTranslationOnAxis(this.get(0), dir, noPx);
    };
    /**
     * If the browser supports 2D or 3D CSS transforms.
     * @type {boolean}
     */
    $.support.cssTransforms = sCSS.hasTransforms;

    // Fix for bug in Firefox
    if ($.support.cssTransforms && window.getComputedStyle) {
      // Figure out if the bug exists
      var $div = $('<div/>').css({
        'opacity': 0,
        'width': 10,
        'height': 10
      });
      var el = $div.get(0);

      sCSS.translate(el, 10, 10);
      var style = window.getComputedStyle(el, null);

      // These should be equal and they are in Chrome and even IE 10
      if ($div.offset().left != sCSS.currentTranslationOnAxis(el, 'x')) {
        var originalOffset = $.fn.offset;

        /**
         * Conditionally overrides the original <code>jQuery.offset()</code>
         *   method. Fixes a bug in some browsers where top and left values
         *   might not be reported back with translation values included.
         * @returns {Object} Object with left and top keys, both integer
         *   and are number of pixels.
         */
        $.fn.offset = function () {
          if (arguments.length) {
            return originalOffset.apply(this, arguments);
          }

          // Regular
          var obj = originalOffset.apply(this, arguments);
          var el = this.get(0);
          obj['left'] += parseInt(sCSS.currentTranslationOnAxis(el, 'x'), 10);
          obj['top'] += parseInt(sCSS.currentTranslationOnAxis(el, 'y'), 10);

          return obj;
        };
      }

      $div.remove();
    }
  })(window['jQuery']);
}
