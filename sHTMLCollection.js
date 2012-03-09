/**
 * HTMLCollection emulation object.
 * @constructor
 * @param {Element} element DOM element.
 * @param {Array} items Array of elements to be managed.
 */
var sHTMLCollection = function (element, items) {
  /**
   * @type Array
   * @private
   */
  this._items = items;
  /**
   * Number of elements.
   * @type number
   */
  this.length = items.length;
  /**
   * @type Element
   * @private
   */
  this._element = element;
};
/**
 * Gets the correct object depending on the environment.
 * @param {Element} element DOM element.
 * @param {string} member Member to check for.
 * @param {Array|NodeList} fallback Array or iterable object that contains
 *   elements to manage.
 * @returns {sHTMLCollection|HTMLCollection} The native browser object or the
 *   sHTMLCollection emulation class.
 */
sHTMLCollection.getCorrectObject = function (element, member, fallback) {
  var find = [
    'item',
    'namedItem',
    'length'
  ];
  var items = [];
  var hasSupport = true;
  var i = 0;

  if (element[member]) {
    for (i = 0; i < find.length; i++) {
      if (!element[member][find[i]]) {
        hasSupport = false;
      }
    }
  }
  else {
    hasSupport = false;
  }

  if (hasSupport) {
    return element[member];
  }
  else {
    for (i = 0; i < fallback.length; i++) {
      items.push(fallback[i]);
    }
  }

  return new sHTMLCollection(element, items);
};
/**
 * Returns the specific node at the given zero-based <code>index</code> into
 *   the list.
 * @param {number} index Index.
 * @returns {Element|null} Null if the index is out of range, element
 *   otherwise.
 */
sHTMLCollection.prototype.item = function (index) {
  if (!this._items[index]) {
    return null;
  }
  return this._items[index];
};
/**
 * Returns the specific node whose ID or, as a fallback, name matches the
 *   string specified by <code>name</code>. Matching by name is only done as a
 *   last resort, only in HTML, and only if the referenced element supports the
 *   <code>name</code> attribute.
 * @param {string} name ID or name to find.
 * @returns {Element|null} Element if it is found, null if no such node exists.
 */
sHTMLCollection.prototype.namedItem = function (name) {
  var i;

  for (i = 0; i < this.length; i++) {
    if (this._items[i].getAttribute('id') === name) {
      return this._items[i];
    }
  }

  for (i = 0; i < this.length; i++) {
    if (this._items[i].getAttribute('name') === name) {
      return this._items[i];
    }
  }

  return null;
};
