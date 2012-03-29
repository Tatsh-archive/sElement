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
   * @type (HTMLCollection|sHTMLCollection)
   */
  this.children = sHTMLCollection.getCorrectObject(this._DOMElement, 'children', this._DOMElement.childNodes);
  /**
   * List of classes for management of the element.
   * @type (DOMTokenList|sDOMSettableTokenList)
   */
  this.classList = new sDOMSettableTokenList(this._DOMElement);
  /**
   * @type (DOMStringMap|sDOMStringMap)
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
 * @param {EventListener|function((Event|sEvent)):(boolean|undefined)} cb
 *   Callback.
 * @param {boolean} [useCapture=false] Indicates whether or not the user wishes
 *   to initiate capture.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.addEventListener = function (eventName, cb, useCapture) {
  useCapture === undefined && (useCapture = false);

  if (this._DOMElement.addEventListener) {
    this._DOMElement.addEventListener(eventName, cb, !!useCapture);
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
 * @param {EventListener|function((Event|sEvent)):(boolean|undefined)} cb
 *   Callback.
 * @param {boolean} [useCapture=false] Indicates whether or not the user wishes
 *   to initiate capture.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.removeEventListener = function (eventName, cb, useCapture) {
  if (this._DOMElement.removeEventListener) {
    this._DOMElement.removeEventListener(eventName, cb, !!useCapture);
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

  return this;
};
/**
 * Convenience method for addEventListener().
 * @param {string} eventName Event name.
 * @param {EventListener|function((Event|sEvent)):(boolean|undefined)} cb
 *   Callback.
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
 * @param {EventListener|function((Event|sEvent)):(boolean|undefined)} cb
 *   Callback.
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
 * @param {EventListener|function((Event|sEvent)):(boolean|undefined)} cb
 *   Callback.
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
  this.removeChildren();
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

  // TODO Remove all events attached

  this._DOMElement.parentNode.removeChild(this._DOMElement);
  return this;
};
/**
 * Get sub-elements by class name. WebKit browsers return a NodeList, and
 *   others may return an HTMLCollection object. Browsers that lack support
 *   for <code>getElementsByClassName()</code> will return an array. Based on
 *   work by Robert Nyman.
 * @param {string} className Class name to search for.
 * @returns {NodeList|HTMLCollection|Array} Elements.
 * @see http://code.google.com/p/getelementsbyclassname/
 */
sElement.prototype.getElementsByClassName = function (className) {
  // TODO To be fully compliant with incompatible browsers, should return a NodeList-like object
  var elm = this._DOMElement;
  var ret, doc = document, classesToCheck, classes = className.split(' '), j;
  var elements;

  if (elm.getElementsByClassName) {
    ret = elm.getElementsByClassName(className);
  }
  else if (doc.evaluate) {
    // do XPath query and return array
    var xhtmlNamespace = 'http://www.w3.org/1999/xhtml';
    var namespaceResolver = doc.documentElement.namespaceURI === xhtmlNamespace ? xhtmlNamespace : null;
    var node;

    ret = [];
    classesToCheck = '';

    for (j = 0; j < classes.length; j++) {
      classesToCheck += '[contains(concat(" ", @class, " "), " ' + classes[j] + ' ")]';
    }

    try {
      elements = doc.evaluate('.//*' + classesToCheck, elm, namespaceResolver, 0, null);
    }
    catch (e) {
      elements = doc.evaluate('.//*' + classesToCheck, elm, null, 0, null);
    }

    while ((node = elements.iterateNext())) {
      ret.push(node);
    }
  }
  else {
    var match, k;

    ret = [];
    elements = elm.all ? elm.all : elm.getElementsByTagName('*');
    classesToCheck = [];

    for (j = 0; j < classes.length; j++) {
      classesToCheck.push(new RegExp('(\\s+)?' + classes[j] + '(\\s+)?'));
    }

    for (j = 0; j < elements.length; j++) {
      match = false;
      for (k = 0; k < classesToCheck.length; k++) {
        if (classesToCheck[k].test(elements[j].className)) {
          match = true;
          break;
        }
      }
      if (match) {
        ret.push(elements[j]);
      }
    }
  }

  return ret;
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
 * Get the DOM element's text.
 * @returns {string} The text.
 */
sElement.prototype.getText = function () {
  var elements = this._DOMElement.childNodes;
  var element;
  var ret = '', i;

  (function getText(nodes) {
    for (i = 0; i <  nodes.length; i++) {
      element = nodes[i];

      // TODO Fix
//       if (element.hasChildNodes()) {
//         ret += getText(element.childNodes);
//         continue;
//       }

      if (element.nodeType === 3 || element.nodeType === 4) {
        ret += element.nodeValue;
      }
    }
  })(elements);

  return ret;
};
/**
 * Get the element height with borders included, but not including margin.
 * @returns {number} The height. The unit should be as originally specified
 *   in the CSS.
 */
sElement.prototype.getHeight = function () {
  return this._DOMElement.offsetHeight;
};
/**
 * Make a multiple line ellipsis.
 * @param {boolean} multipleLines Multiple lines.
 * @param {number} maxHeight Height in pixels.
 * @return {sElement} The object to allow method chaining.
 */
sElement.prototype.makeEllipsis = function (multipleLines, maxHeight) {
  if (multipleLines === undefined) {
    this._DOMElement.style.overflow = 'hidden';
    this._DOMElement.style.whiteSpace = 'nowrap';
    this._DOMElement.style.textOverflow = 'ellipsis';
    return this;
  }

  if (!maxHeight || isNaN(parseInt(maxHeight, 10))) {
    return this;
  }

  var text;
  var currentHeight = this.getHeight();
  var cut = 4;

  if (!currentHeight || isNaN(currentHeight)) {
    return this;
  }

  while (currentHeight > maxHeight) {
    text = this.getText();
    this.setText(text.substr(0, text.length - cut) + ' ...');
    currentHeight = this.getHeight();
    cut += 4;

    if (Math.abs(currentHeight - maxHeight) < 10) {
      break;
    }
  }

  return this;
};
/**
 * Checks if the element is visible in the window. Tests CSS properties
 *   'display', 'opacity', 'visibility', 'filter' for alpha(opacity=0).
 * @returns {boolean} If the element is visible.
 */
sElement.prototype.isVisible = function () {
  // TODO Return false if an ancestor element is scrollable (overflow:auto,scroll) and this element is out of the view

  var el = this._DOMElement;
  var isVisible = true;
  var test = function (el) {
    if (el.offsetWidth === 0 || el.offsetHeight === 0) {
      return false;
    }
    if (el.style.display.toLowerCase() === 'none' || el.style.visibility.toLowerCase() === 'hidden') {
      return false;
    }
    else if (window.getComputedStyle) {
      var computed = window.getComputedStyle(el, null);
      if (computed.display.toLowerCase() === 'none') {
        return false;
      }
      else if (computed.visibility.toLowerCase() === 'hidden') {
        return false;
      }
      else if (parseInt(computed.opacity, 10) === 0) {
        return false;
      }
    }
    else if (el.currentStyle.display.toLowerCase() === 'none' || el.currentStyle.visibility.toLowerCase() === 'hidden') {
      return false;
    }
    else if (el.style.opacity && parseInt(el.style.opacity, 10) === 0) {
      return false;
    }
    else if (el.style.filter) {
      if (el.style.filter.match(/opacity(\s+)?=(\s+)?0/i)) {
        return false;
      }
    }
    else if (el.offsetTop < 0 || el.offsetLeft < 0) {
      return false;
    }

    return true;
  };

  if (!el.parentNode || !test(el)) {
    return false;
  }
  else if (el.parentNode) {
    el = el.parentNode;

    while (isVisible) {
      if (!el || (el.tagName && el.tagName.toLowerCase() === 'body')) {
        break;
      }

      isVisible = test(el);
      el = el.parentNode;
    }
  }

  return isVisible;
};
/**
 * Remove all child elements from this element.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.removeChildren = function () {
  while (this._DOMElement.firstChild) {
    this._DOMElement.removeChild(this._DOMElement.firstChild);
  }
  return this;
};
/**
 * Prepend an element to this element.
 * @param {sElement} sel The sElement representing the element to prepend.
 * @returns {sElement} The object to allow method chaining.
 */
sElement.prototype.prepend = function (sel) {
  var el = sel.get();

  if (!el) {
    return this;
  }

  this._DOMElement.insertBefore(el, this.children[0]);

  return this;
};
/**
 * Convenience function to get a new <code>sElement</code> object.
 * @param {Element} element Element node reference.
 * @returns {sElement} Element object.
 */
var q = function (element) {
  return new sElement(element);
};
