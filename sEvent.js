/**
 * Emulates the event object.
 * @see https://developer.mozilla.org/en/DOM/DOM_event_reference
 * @constructor
 * @param {Event|Object} eventObj Native browser event or object that is
 *   similar (this includes IE's window.event).
 * @returns {sEvent} The event object.
 */
var sEvent = function (eventObj) {
  /**
   * If the event is an IE event.
   * @type boolean
   * @private
   */
  this._isIE = window.event && window.event.srcElement !== undefined ? true : false;
  /**
   * The native browser event object.
   * @type (Event|Object)
   */
  this.originalEvent = eventObj;
  /**
   * A boolean indicating whether the event bubbles up through the DOM or not.
   * @type boolean
   */
  this.bubbles = (function () {
    if (eventObj.bubbles) {
      return eventObj.bubbles;
    }
    if (eventObj.cancelBubble) {
      return eventObj.cancelBubble;
    }
    return false;
  })();
  /**
   * A reference to the currently registered target for the event.
   * @type Element|window|document
   */
  this.currentTarget = eventObj.currentTarget || eventObj.srcElement;
  /**
   * Indicates whether or not <code>event.preventDefault()</code> has been
   *   called on the event.
   * @type boolean
   */
  this.defaultPrevented = false;
  /**
   * Indicates which phase of the event flow is being processed.
   * @type number
   * @see https://developer.mozilla.org/en/DOM/event.eventPhase
   */
  this.eventPhase = 1; // TODO implement somehow
  /**
   * A reference to the target to which the event was originally dispatched.
   * @type Element|window|document
   */
  this.target = eventObj.target || eventObj.srcElement;
  /**
   * The time that the event was created.
   * @type number
   */
  this.timeStamp = (new Date()).getTime();
  /**
   * The name of the event.
   * @type string
   */
  this.type = eventObj.type.toLowerCase();
  /**
   * A boolean indicating whether the event is cancelable.
   * @type boolean
   */
  this.cancelable = eventObj.cancelable !== undefined ? eventObj.cancelable : (function (type) {
    switch (type) {
      // TODO add the rest
      case 'click':
      case 'submit':
        return true;
    }

    return false;
  })(this.type);
  /**
   * Indicates whether or not the event was initiated by the browser.
   * @type boolean
   */
  this.isTrusted = false;

  return this;
};
/**
 * Cancels the event (if it is cancelable).
 */
sEvent.prototype.preventDefault = function () {
  this.defaultPrevented = true;

  if (this._isIE) {
    this.originalEvent.returnValue = false;
    return;
  }

  if (this.originalEvent.preventDefault) {
    this.originalEvent.preventDefault();
  }
};
/**
 * Prevents other listeners of the same event to be called. Note that in IE
 *   prior to version 9, this does the same thing as stopPropagation().
 */
sEvent.prototype.stopImmediatePropagation = function () {
  if (this._isIE) {
    this.originalEvent.cancelBubble = true;
  }

  if (this.originalEvent.stopImmediatePropagation) {
    this.originalEvent.stopImmediatePropagation();
  }
};
/**
 * Prevents further propagation of the current event. Note that in IE prior to
 *   version 9, this does the same thing as stopImmediatePropagation().
 */
sEvent.prototype.stopPropagation = function () {
  if (this._isIE) {
    this.stopImmediatePropagation();
  }

  if (this.originalEvent.stopPropagation) {
    this.originalEvent.stopPropagation();
  }
};
/**
 * Initialise an event. Does nothing in IE versions prior to 9.
 * @param {string} type Type of event.
 * @param {boolean} bubbles A boolean indicating whether the event bubbles up
 *   through the DOM or not.
 * @param {boolean} cancelable A boolean indicating whether the event can be
 *   canceled.
 */
sEvent.prototype.initEvent = function (type, bubbles, cancelable) {
  if (this._isIE) {
    return;
  }

  if (this.originalEvent.initEvent) {
    this.originalEvent.initEvent(type, bubbles, cancelable);
  }
};
