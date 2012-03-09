/**
 * Class list to emulate DOMTokenList returned by classList for elements.
 * @constructor
 * @param {Element} [element=null] DOM element.
 * @returns {DOMTokenList|sDOMTokenList} The native browser DOMTokenList or
 *   sDOMTokenList.
 */
var sDOMTokenList = function (element) {
  if (!element) {
    return this;
  }

  /**
   * Whether or not this is using a native host object. Only needed for
   *   subclasses.
   * @type boolean
   * @private
   */
  this._isNative = false;

  if (element.classList) {
    this._isNative = true;
    return element.classList;
  }

  /**
   * The element being managed.
   * @type Element
   * @private
   */
  this._DOMElement = element;

  /**
   * Array of class names.
   * @type Array
   * @private
   */
  this._classes = element.className.split(/\s+/);

  /**
   * Number of classes.
   * @type number
   */
  this.length = this._classes.length;

  // Clean up
  /**
   * @type Array
   * @private
   */
  var fixed = [];
  for (var i = 0; i < this.length; i++) {
    if (!this._classes[i]) {
      continue;
    }
    fixed.push(fUTF8.trim(this._classes[i]));
  }
  this._classes = fixed;

  return this;
};
/**
 * Returns an item in the list by its index.
 * @param {number} idx Index.
 * @returns {string|undefined} Item requested or undefined if the number is
 *   greater than or equal to length.
 */
sDOMTokenList.prototype.item = function (idx) {
  if (idx >= this.length) {
    return undefined;
  }
  return this._classes[idx];
};
/**
 * Check if a token exists.
 * @param {string} token Token to check for.
 * @returns {boolean} True or false.
 */
sDOMTokenList.prototype.contains = function (token) {
  for (var i = 0; i < this.length; i++) {
    if (this._classes[i] === token) {
      return true;
    }
  }
  return false;
};
