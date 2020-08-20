/*
 * core.js
 *
 * Copyright (c) 2015-2018 Emmanuel PUYBARET / eTeks <info@eteks.com>
 * 
 * Copyright (c) 1997, 2013, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied OpenJDK 8 source code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

// Various classes of OpenJDK 8 translated to Javascript

/**
 * Creates an IllegalArgumentException instance.
 * Adapted from java.lang.IllegalArgumentException
 * @constructor
 */
function IllegalArgumentException(message) {
  this.message = message;
}


/**
 * Creates an NullPointerException instance.
 * Adapted from java.lang.NullPointerException
 * @constructor
 */
function NullPointerException(message) {
  this.message = message;
}


/**
 * Creates an IllegalStateException instance.
 * Adapted from java.lang.IllegalStateException
 * @constructor
 */
function IllegalStateException(message) {
  this.message = message;
}


/**
 * Creates an UnsupportedOperationException instance.
 * Adapted from java.lang.UnsupportedOperationException
 * @constructor
 */
function UnsupportedOperationException(message) {
  this.message = message;
}


/**
 * Creates an InternalError instance.
 * Adapted from java.lang.InternalError
 * @constructor
 * @ignore
 */
function InternalError(message) {
  this.message = message;
}


/**
 * Creates an NoSuchElementException instance.
 * Adapted from java.util.NoSuchElementException
 * @constructor
 */
function NoSuchElementException(message) {
  this.message = message;
}


/**
 * System class.
 * @class
 * @ignore
 */
var System = {}

System.arraycopy = function(srcPts, srcOff, dstPts, dstOff, size) {
  if (srcPts !== dstPts
    || dstOff >= srcOff + size) {
    while (--size >= 0) {
      dstPts[dstOff++] = srcPts[srcOff++];
    }
  } else {
    // In case copied items overlap  
    var tmp = srcPts.slice(srcOff, srcOff + size);
    for (var i = 0; i < size; i++) {
      dstPts[dstOff++] = tmp[i];
    }
  }
}


/**
 * Creates an EventObject instance.
 * Adapted from java.util.EventObject
 * @constructor
 */
function EventObject(source) {
  this.source = source;
}

/**
 * Returns the source of this event.
 * @return {Object}
 */
EventObject.prototype.getSource = function() {
  return this.source;
}


/**
 * Creates a PropertyChangeEvent instance.
 * Adapted from java.beans.PropertyChangeEvent
 * @constructor
 */
function PropertyChangeEvent(source, propertyName, oldValue, newValue) {
  EventObject.call(this, source);
  this.propertyName = propertyName;
  this.newValue = newValue;
  this.oldValue = oldValue;
}
PropertyChangeEvent.prototype = Object.create(EventObject.prototype);
PropertyChangeEvent.prototype.constructor = PropertyChangeEvent;

/**
 * Returns the name of the modified property.
 * @return {string}
 */
PropertyChangeEvent.prototype.getPropertyName = function() {
  return this.propertyName;
}

/**
 * Returns the new value of the property.
 */
PropertyChangeEvent.prototype.getNewValue = function() {
  return this.newValue;
}

/**
 * Returns the old value of the property.
 */
PropertyChangeEvent.prototype.getOldValue = function() {
  return this.oldValue;
}


/**
 * Creates a PropertyChangeSupport instance.
 * Adapted from java.beans.PropertyChangeSupport
 * @constructor
 */
function PropertyChangeSupport(source) {
  this.source = source;
  this.listeners = [];
}

/**
 * Adds the <code>listener</code> in parameter to the list of listeners that may be notified.
 * @param {string} [propertyName] the name of an optional property to listen
 * @param listener  a callback that will be called with a {@link PropertyChangeEvent} instance
 */
PropertyChangeSupport.prototype.addPropertyChangeListener = function(propertyName, listener) {
  if (listener === undefined) {
    // One parameter
    listener = propertyName;
    propertyName = null;
  }
  if (listener) {
    if (propertyName) {
      this.listeners.push({ "listener": listener, "propertyName": propertyName });
    } else {
      this.listeners.push({ "listener": listener });
    }
  }
}

/**
 * Removes the <code>listener</code> in parameter to the list of listeners that may be notified.
 * @param listener the listener to remove. If it doesn't exist, it's simply ignored.
 */
PropertyChangeSupport.prototype.removePropertyChangeListener = function(propertyName, listener) {
  if (listener === undefined) {
    // One parameter
    listener = propertyName;
    propertyName = undefined;
  }
  if (listener) {
    for (var i = this.listeners.length - 1; i >= 0; i--) {
      if (this.listeners[i].propertyName == propertyName
          && this.listeners[i].listener === listener) {
        this.listeners.splice(i, 1);
      }
    }
  }
}

/**
 * Returns an array of all the listeners that were added to the
 * PropertyChangeSupport object with addPropertyChangeListener().
 * @param {string} [propertyName] the name of an optional listened property
 * @return [Array]
 */
PropertyChangeSupport.prototype.getPropertyChangeListeners = function(propertyName) {
  if (propertyName === undefined) {
    return this.listeners.slice(0);
  } else {
    var listeners = [];
    for (var i = this.listeners.length - 1; i >= 0; i--) {
      if (this.listeners[i].propertyName == propertyName) {
        listeners.push(this.listeners[i]);
      }
    }
    return listeners;
  }
}

/**
 * Fires a property change event.
 * @param propertyName {string} the name of the modified property
 * @param oldValue old value
 * @param newValue new value
 */
PropertyChangeSupport.prototype.firePropertyChange = function(propertyName, oldValue, newValue) {
  if (oldValue != newValue) {
    var ev = new PropertyChangeEvent(this.source, propertyName, oldValue, newValue);
    for (var i = 0; i < this.listeners.length; i++) {
      if (!("propertyName" in this.listeners[i])
          || this.listeners[i].propertyName == propertyName) {
        if (typeof (this.listeners[i].listener) === "function") {
          this.listeners[i].listener(ev);
        } else {
          this.listeners[i].listener.propertyChange(ev);
        }
      }
    }
  }
}

/**
 * Format is a base class for formatting locale-sensitive
 * information such as dates, messages, and numbers.
 * Adapted from java.text.Format.
 * @constructor
 * @ignore
 */
function Format() {
} 

Format.prototype.format = function(object) {
  return "" + object;
}

/**
 * Locale class.
 * @class
 * @ignore
 */
var Locale = {}

/**
 * Returns the default locale.
 * @returns {string} an ISO 639 language code, possibly followed by a underscore and an ISO 3166 country code
 */
Locale.getDefault = function() {
  if (window && window.defaultLocaleLanguageAndCountry) {
    return window.defaultLocaleLanguageAndCountry;
  } else if (navigator && navigator.language && navigator.language.indexOf('-') >= 0) {
    var locale = navigator.language.split('-');
    return locale[0] + "_" + locale[1].toUpperCase();
  } else if (navigator && navigator.language && navigator.language.length == 2) {
    return navigator.language;
  } else {
    return null;
  }
}

/**
 * Sets the default locale.
 * @param {string} language an ISO 639 language code, possibly followed by a underscore and an ISO 3166 country code
 */
Locale.setDefault = function(language) {
  if (window) {
    window.defaultLocaleLanguageAndCountry = language;
  }
}

/**
 * UUID class.
 * @class
 * @ignore
 */
var UUID = {}

/**
 * Returns a randomly generated Universally Unique IDentifier (v4).
 */
UUID.randomUUID = function() {
  // From https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  
}


/**
 * KeyStroke class.
 * @class
 * @ignore
 */
var KeyStroke = {}

/**
 * Returns a string describing the key event in parameter. 
 * @param {KeyboardEvent} ev
 * @param {string} [keyEventType] "keyup", "keydown" or "keypress"
 * @returns {string} a string describing the key stroke event
 */
KeyStroke.getKeyStrokeForEvent = function(ev, keyEventType) {
  if (KeyStroke.KEY_CODE_TEXTS === undefined) {
    KeyStroke.KEY_CODE_TEXTS = new Array(223);
    KeyStroke.KEY_CODE_TEXTS [8]  = "BACK_SPACE";
    KeyStroke.KEY_CODE_TEXTS [9]  = "TAB";
    KeyStroke.KEY_CODE_TEXTS [13] = "ENTER";
    KeyStroke.KEY_CODE_TEXTS [16] = "SHIFT";
    KeyStroke.KEY_CODE_TEXTS [17] = "CONTROL";
    KeyStroke.KEY_CODE_TEXTS [18] = "ALT";
    KeyStroke.KEY_CODE_TEXTS [19] = "PAUSE";
    KeyStroke.KEY_CODE_TEXTS [20] = "CAPS_LOCK";
    KeyStroke.KEY_CODE_TEXTS [27] = "ESCAPE";
    KeyStroke.KEY_CODE_TEXTS [33] = "PAGE_UP";
    KeyStroke.KEY_CODE_TEXTS [34] = "PAGE_DOWN";
    KeyStroke.KEY_CODE_TEXTS [35] = "END";
    KeyStroke.KEY_CODE_TEXTS [36] = "HOME";
    KeyStroke.KEY_CODE_TEXTS [37] = "LEFT";
    KeyStroke.KEY_CODE_TEXTS [38] = "UP";
    KeyStroke.KEY_CODE_TEXTS [39] = "RIGHT";
    KeyStroke.KEY_CODE_TEXTS [40] = "DOWN";
    KeyStroke.KEY_CODE_TEXTS [45] = "INSERT";
    KeyStroke.KEY_CODE_TEXTS [46] = "DELETE";
    KeyStroke.KEY_CODE_TEXTS [48] = "0";
    KeyStroke.KEY_CODE_TEXTS [49] = "1";
    KeyStroke.KEY_CODE_TEXTS [50] = "2";
    KeyStroke.KEY_CODE_TEXTS [51] = "3";
    KeyStroke.KEY_CODE_TEXTS [52] = "4";
    KeyStroke.KEY_CODE_TEXTS [53] = "5";
    KeyStroke.KEY_CODE_TEXTS [54] = "6";
    KeyStroke.KEY_CODE_TEXTS [55] = "7";
    KeyStroke.KEY_CODE_TEXTS [56] = "8";
    KeyStroke.KEY_CODE_TEXTS [57] = "9";
    KeyStroke.KEY_CODE_TEXTS [65] = "A";
    KeyStroke.KEY_CODE_TEXTS [66] = "B";
    KeyStroke.KEY_CODE_TEXTS [67] = "C";
    KeyStroke.KEY_CODE_TEXTS [68] = "D";
    KeyStroke.KEY_CODE_TEXTS [69] = "E";
    KeyStroke.KEY_CODE_TEXTS [70] = "F";
    KeyStroke.KEY_CODE_TEXTS [71] = "G";
    KeyStroke.KEY_CODE_TEXTS [72] = "H";
    KeyStroke.KEY_CODE_TEXTS [73] = "I";
    KeyStroke.KEY_CODE_TEXTS [74] = "J";
    KeyStroke.KEY_CODE_TEXTS [75] = "K";
    KeyStroke.KEY_CODE_TEXTS [76] = "L";
    KeyStroke.KEY_CODE_TEXTS [77] = "M";
    KeyStroke.KEY_CODE_TEXTS [78] = "N";
    KeyStroke.KEY_CODE_TEXTS [79] = "O";
    KeyStroke.KEY_CODE_TEXTS [80] = "P";
    KeyStroke.KEY_CODE_TEXTS [81] = "Q";
    KeyStroke.KEY_CODE_TEXTS [82] = "R";
    KeyStroke.KEY_CODE_TEXTS [83] = "S";
    KeyStroke.KEY_CODE_TEXTS [84] = "T";
    KeyStroke.KEY_CODE_TEXTS [85] = "U";
    KeyStroke.KEY_CODE_TEXTS [86] = "V";
    KeyStroke.KEY_CODE_TEXTS [87] = "W";
    KeyStroke.KEY_CODE_TEXTS [88] = "X";
    KeyStroke.KEY_CODE_TEXTS [89] = "Y";
    KeyStroke.KEY_CODE_TEXTS [90] = "Z";
    KeyStroke.KEY_CODE_TEXTS [91] = "META";
    KeyStroke.KEY_CODE_TEXTS [92] = "META";
    KeyStroke.KEY_CODE_TEXTS [96] = "NUMPAD0";
    KeyStroke.KEY_CODE_TEXTS [97] = "NUMPAD1";
    KeyStroke.KEY_CODE_TEXTS [98] = "NUMPAD2";
    KeyStroke.KEY_CODE_TEXTS [99] = "NUMPAD3";
    KeyStroke.KEY_CODE_TEXTS [100] = "NUMPAD4";
    KeyStroke.KEY_CODE_TEXTS [101] = "NUMPAD5";
    KeyStroke.KEY_CODE_TEXTS [102] = "NUMPAD6";
    KeyStroke.KEY_CODE_TEXTS [103] = "NUMPAD7";
    KeyStroke.KEY_CODE_TEXTS [104] = "NUMPAD8";
    KeyStroke.KEY_CODE_TEXTS [105] = "NUMPAD9";
    KeyStroke.KEY_CODE_TEXTS [106] = "MULTIPLY";
    KeyStroke.KEY_CODE_TEXTS [107] = "ADD";
    KeyStroke.KEY_CODE_TEXTS [109] = "VK_SUBTRACT";
    KeyStroke.KEY_CODE_TEXTS [110] = "VK_DECIMAL";
    KeyStroke.KEY_CODE_TEXTS [111] = "VK_DIVIDE";
    KeyStroke.KEY_CODE_TEXTS [112] = "F1";
    KeyStroke.KEY_CODE_TEXTS [113] = "F2";
    KeyStroke.KEY_CODE_TEXTS [114] = "F3";
    KeyStroke.KEY_CODE_TEXTS [115] = "F4";
    KeyStroke.KEY_CODE_TEXTS [116] = "F5";
    KeyStroke.KEY_CODE_TEXTS [117] = "F6";
    KeyStroke.KEY_CODE_TEXTS [118] = "F7";
    KeyStroke.KEY_CODE_TEXTS [119] = "F8";
    KeyStroke.KEY_CODE_TEXTS [120] = "F9";
    KeyStroke.KEY_CODE_TEXTS [121] = "F10";
    KeyStroke.KEY_CODE_TEXTS [122] = "F11";
    KeyStroke.KEY_CODE_TEXTS [123] = "F12";
    KeyStroke.KEY_CODE_TEXTS [144] = "VK_NUM_LOCK";
    KeyStroke.KEY_CODE_TEXTS [145] = "VK_SCROLL_LOCK";
    KeyStroke.KEY_CODE_TEXTS [186] = "VK_SEMICOLON";
    KeyStroke.KEY_CODE_TEXTS [187] = "VK_EQUALS";
    KeyStroke.KEY_CODE_TEXTS [188] = "VK_COMMA";
    KeyStroke.KEY_CODE_TEXTS [190] = "VK_PERIOD";
    KeyStroke.KEY_CODE_TEXTS [191] = "VK_SLASH";
    KeyStroke.KEY_CODE_TEXTS [219] = "VK_OPEN_BRACKET";
    KeyStroke.KEY_CODE_TEXTS [220] = "VK_BACK_SLASH";
    KeyStroke.KEY_CODE_TEXTS [221] = "VK_CLOSE_BRACKET";
    KeyStroke.KEY_CODE_TEXTS [222] = "VK_QUOTE";
  }
  
  var keyStroke = ""; 
  var keyName = KeyStroke.KEY_CODE_TEXTS [ev.keyCode];
  if (keyName) {
    if (ev.ctrlKey) {
      keyStroke += "control ";
    }
    if (ev.altKey) {
      keyStroke += "alt ";
    }
    if (ev.metaKey) {
      keyStroke += "meta ";
    }
    if (ev.shiftKey) {
      keyStroke += "shift ";
    }
    var nameWithoutVK = keyName.indexOf('VK_') === 0
        ? keyName.substring(3)
        : keyName;
    if (keyEventType !== undefined) {
      keyStroke += (keyEventType == "keyup" ? "released " : "pressed "); 
    }
    keyStroke += nameWithoutVK;
  } 
  return keyStroke;
}
