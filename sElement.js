/**
 * For element management in a simlar manner to jQuery. Note that many methods
 *   use new 'HTML5' interfaces. This only manages ONE element.
 * @constructor
 * @param {Element} element Element node reference.
 * @returns {sElement} Element object.
 */
var sElement = function (element) {
  if (!element) {
    element = sDoc.newElement('div'); // just to stop things from failing
  }

  /**
   * @type Element
   * @private
   */
  this._DOMElement = element;
  /**
   * The tagName attribute of the managed DOM element. Always lower-case.
   * @type string
   */
  this.tagName = element.tagName ? element.tagName.toLowerCase() : '';
  /**
   * The children property or an array of the child nodes.
   * @type HTMLCollection|sHTMLCollection
   */
  this.children = sHTMLCollection.getCorrectObject(this._DOMElement, 'children', this._DOMElement.childNodes);
  /**
   * List of classes for management of the element.
   * @type DOMTokenList|sDOMSettableTokenList
   */
  this.classList = new sDOMSettableTokenList(this._DOMElement);
  /**
   * @type DOMStringMap|sDOMStringMap
   */
  this.dataset = (function (el) {
    if (el.dataset) {
      return el.dataset;
    }

    var attr = el.attributes;
    var data = {}, name, value;

    for (var i = 0; i < attr.length; i++) {
      if (attr[i].name.substr(0, 5) === 'data-') {
        name = fGrammar.camelize(attr[i].name.substr(5), false, '-');
        value = attr[i].value;
        data[name] = value;
      }
    }

    return new sDOMStringMap(data);
  })(this._DOMElement);

  return this;
};
/**
 * Regular expression for matching spaces.
 * @type RegExp
 */
sElement.spaceRegExp = /\s+/;
/**
 * Add a class to the managed element. This uses the element.classList
 *   interface if it is available (Chrome, Firefox, etc).
 * @param {string} className Class name to add.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.addClass = function (className) {
  this.classList.add(className);
  return this;
};
/**
 * Remove a class from the managed element.
 * @param {string} className Class name to remove.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.removeClass = function (className) {
  this.classList.remove(className);
  return this;
};
/**
 * Sets a data-* attribute.
 * @param {string} name Name of the attribute, without the data- prefix.
 * @param {string|number|boolean} value Value for the attribute.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.setData = function (name, value) {
  this._DOMElement.setAttribute('data-' + name, value);
  return this;
};
/**
 * Get a data attribute by key name.
 * @param {string} name Name of the attribute, without the data- prefix.
 * @returns {string} The data value.
 */
sElement.prototype.getData = function (name) {
  return this._DOMElement.getAttribute('data-' + name);
};
/**
 * Removes a data-* attribute.
 * @param {string} name Name of the attribute, without the data- prefix.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.removeData = function (name) {
  this._DOMElement.removeAttribute('data-' + name);
  return this;
};
/**
 * Gets the DOM element.
 * @returns {Element} The DOM element.
 */
sElement.prototype.get = function () {
  return this._DOMElement;
};
/**
 * Current event ID number.
 * @type number
 * @private
 */
sElement._eventId = 0;
/**
 * Events with IDs to prevent circular references and allow proper detaching
 *   in IE.
 * @type Object
 * @private
 */
sElement._events = {};
/**
 * Adds an event listener.
 * @param {string} eventName Event name.
 * @param {function()} cb Callback.
 * @param {boolean} [useCapture=false] Indicates whether or not the user wishes
 *   to initiate capture.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.addEventListener = function (eventName, cb, useCapture) {
  useCapture === undefined && (useCapture = false);

  if (this._DOMElement.addEventListener) {
    this._DOMElement.addEventListener(eventName, cb, useCapture);
  }
  else if (this._DOMElement.attachEvent) {
    // To be able to unbind later the handler created here must be saved
    var element = this._DOMElement;

    var eventHandler = function () {
      var event = new sEvent(window.event); // special event to simulate real event in IE
      var ret = cb.call(element, event);

      if (ret) {
        ret = true;
      }
      else {
        ret = false;
        event.preventDefault();
      }

      return ret;
    };

    this._DOMElement.attachEvent('on' + eventName, eventHandler);

    // TODO Should be handled by sEvent
    var ids = this.getData('event-ids');
    if (!ids) {
      ids = [];
      this.setData('event-ids', '');
    }
    else {
      ids = ids.split(',');
    }
    ids.push(sElement._eventId);
    this.setData('event-ids', ids.join(','));
    sElement._events[sElement._eventId] = [eventHandler, cb];
    sElement._eventId++;
  }

  return this;
};
/**
 * Removes an event listener.
 * @param {string} eventName Event name.
 * @param {function()} cb Callback.
 * @param {boolean} [useCapture=false] Indicates whether or not the user wishes
 *   to initiate capture.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.removeEventListener = function (eventName, cb, useCapture) {
  if (this._DOMElement.removeEventListener) {
    this._DOMElement.removeEventListener(eventName, cb, useCapture);
  }
  else if (this._DOMElement.detachEvent) {
    var ids = this.getData('event-ids');
    if (!ids) {
      ids = [];
      this.setData('event-ids', '');
    }
    else {
      ids = ids.split(',');
    }

    var newIds = [];
    var found = false;

    for (var i = 0; i < ids.length; i++) {
      if (sElement._events[ids[i]] && cb === sElement._events[ids[i]][1]) {
        found = true;
        this._DOMElement.detachEvent('on' + eventName, sElement._events[ids[i]][0]);
        continue;
      }
      newIds.push(ids[i]);
    }

    this.setData('event-ids', newIds.join(','));
  }
};
/**
 * Convenience method for addEventListener().
 * @param {string} eventName Event name.
 * @param {function()} cb Callback.
 * @param {boolean} [useCapture=false] Indicates whether or not the user wishes
 *   to initiate capture.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.addEvent = function (eventName, cb, useCapture) {
  return this.addEventListener(eventName, cb, useCapture);
};
/**
 * Convenience method for addEventListener() to be similar to jQuery.
 * @param {string} eventName Event name.
 * @param {function()} cb Callback.
 * @param {boolean} [useCapture=false] Indicates whether or not the user wishes
 *   to initiate capture.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.bind = function (eventName, cb, useCapture) {
  return this.addEventListener(eventName, cb, useCapture);
};
/**
 * Convenience method for removeEventListener() to be similar to jQuery.
 * @param {string} eventName Event name.
 * @param {function()} cb Callback.
 * @param {boolean} [useCapture=false] Indicates whether or not the user wishes
 *   to initiate capture.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.unbind = function (eventName, cb, useCapture) {
  return this.removeEventListener(eventName, cb, useCapture);
};
/**
 * Performs a CSS translation.
 * @param {number} x Translation in x direction.
 * @param {number} [y=0] Translation in y direction.
 * @param {number} [z=0] Translation in z direction.
 * @param {string} [unit='px'] Unit.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.performCSSTranslation = function (x, y, z, unit) {
  sCSS.translate(this._DOMElement, x, y, z, unit);
  return this;
};
/**
 * Set the text within the element. Removes any other text.
 * @param {string} text Text without HTML.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.setText = function (text) {
  this._DOMElement.innerHTML = '';
  var node = document.createTextNode(text);
  this._DOMElement.appendChild(node);
  return this;
};
/**
 * Append an sElement's element to another element.
 * @param {...sElement} element Element to append. Accepts multiple sElement
 *   arguments.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.append = function (element) {
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i].get) {
      this._DOMElement.appendChild(arguments[i].get());
    }
  }

  return this;
};
/**
 * Remove the element from the DOM.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.remove = function () {
  if (!this._DOMElement.parentNode) {
    return this;
  }

  this._DOMElement.parentNode.removeChild(this._DOMElement);
  return this;
};
/**
 * Get sub-elements by class name. WebKit browsers return a NodeList, and
 *   others may return an HTMLCollection object. Browsers that lack support
 *   for <code>getElementsByClassName()</code> will return an array.
 * @param {string} className Class name to search for.
 * @returns {NodeList|HTMLCollection|Array} Elements.
 */
sElement.prototype.getElementsByClassName = function (className) {
  // TODO To be fully compliant with incompatible browsers, should return a NodeList-like object
  return sDependencies.getElementsByClassName(className, this._DOMElement);
};
/**
 * Set attributes to the element.
 * @param {Object} attributes Attributes in key value format.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.setAttributes = function (attributes) {
  for (var key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      this._DOMElement.setAttribute(key, attributes[key]);
    }
  }
  return this;
};
/**
 * Convenience function to get a new sElement object.
 * @param {Element} element Element node reference.
 * @returns {sElement} Element object.
 */
var q = function (element) {
  return new sElement(element);
};
