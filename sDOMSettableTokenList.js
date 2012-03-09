/**
 * Class list to emulate DOMSettableTokenList returned by classList for
 *   elements.
 * @augments sDOMTokenList
 * @constructor
 * @see http://www.whatwg.org/specs/web-apps/current-work/#domtokenlist
 * @param {Element} element DOM element.
 * @returns {sDOMSettableTokenList|DOMTokenList} The native browser
 *   DOMTokenList or sDOMSettableTokenList.
 */
var sDOMSettableTokenList = function (element) {
  this.parent.constructor.call(this, element);
  if (this._isNative) {
    return element.classList;
  }
  /**
   * Regenerates the className attribute.
   * @private
   */
  this._regenerateString = function () {
    this._DOMElement.className = this._classes.join(' ');
  };

  return this;
};
/**
 * @type sDOMTokenList
 * @private
 */
sDOMSettableTokenList.prototype = new sDOMTokenList();
/**
 * Access to the parent class.
 * @private
 * @type sDOMTokenList
 */
sDOMSettableTokenList.prototype.parent = sDOMTokenList.prototype;
/**
 * Constructor.
 * @private
 * @type function(new:sDOMSettableTokenList,(Element|null))
 */
sDOMSettableTokenList.prototype.constructor = sDOMSettableTokenList;
/**
 * Add a token to the current string.
 * @param {string} token Token to add.
 */
sDOMSettableTokenList.prototype.add = function (token) {
  this._classes.push(token);
  this.length = this._classes.length;
  this._regenerateString();
};
/**
 * Removes a token from the current string.
 * @param {string} token Token to remove.
 */
sDOMSettableTokenList.prototype.remove = function (token) {
  var original = this._classes;
  this._classes = [];

  for (var i = 0; i < original.length; i++) {
    if (original[i] !== token) {
      this._classes.push(original[i]);
    }
  }

  this._regenerateString();
  this.length = this._classes.length;
};
/**
 * Toggle a token from the current string.
 * @param {string} token Token to toggle.
 * @returns {boolean} If the token exists, returns false. If the token does
 *   not exist and it is added, returns true.
 */
sDOMSettableTokenList.prototype.toggle = function (token) {
  if (this.contains(token)) {
    this.remove(token);
    return false;
  }

  this.add(token);
  return true;
};
