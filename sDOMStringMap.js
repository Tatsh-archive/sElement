/**
 * @constructor
 * @param {Object} items Map of data. Should be keys to strings. All strings
 *   should be in camelCase notation.
 * @returns {sDOMStringMap} The mapped object.
 */
var sDOMStringMap = function (items) {
  for (var key in items) {
    if (items.hasOwnProperty(key)) {
      this[key] = items[key];
    }
  }
  return this;
};
