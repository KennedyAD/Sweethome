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
 * @param {string} [propertyName] the name of an optional property to listen
 * @return [Array]
 */
PropertyChangeSupport.prototype.getPropertyChangeListeners = function(propertyName) {
  var listeners = [];
  for (var i = this.listeners.length - 1; i >= 0; i--) {
    if (this.listeners[i].propertyName == propertyName
        && this.listeners[i].listener === listener) {
      listeners.push(this.listeners[i]);
    }
  }
  return listeners;
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
 *
 * @constructor
 */
function Format() {
} 

Format.prototype.format = function(object) {
  return "" + object;
}

var Locale = {}

/**
 * Gets the default locale.
 */
Locale.getDefault = function() {
  if (window && window.defaultLocaleLanguage) {
    return window.defaultLocaleLanguage;
  } else if (navigator && navigator.language && navigator.language.indexOf('-') >= 0) {
    var locale = navigator.language.split('-');
    return locale[0] + "_" + locale[1].toUpperCase();
  } else {
    return null;
  }
}

/**
 * Sets the default locale.
 */
Locale.setDefault = function(language) {
  if (window) {
    window.defaultLocaleLanguage = language;
  }
}

// =================================================================
// Additional core utilities
// =================================================================

var CoreTools = {};

/**
 * Loads a JSON resource from a url (synchronous).
 * @param url {string}  the url of the JSON resource to be loaded
 * @returns an object that corresponds to the loaded JSON
 */
CoreTools.loadJSON =  function(url) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    // it is not allowed to change response type for a synchronous XHR
    // xhr.responseType = 'json';
    xhr.send();
    return JSON.parse(xhr.responseText);
  } catch(e) {
    return undefined;
  }
}

/**
 * Formats a string with the given args.
 * @param {string} formatString a string containing optional place holders (%s, %d)
 * @param {*[]|...*} args an array of arguments to be applied to formatString
 * @returns the formatted string
 */
CoreTools.format = function(formatString, args) {
  if (args === undefined || args.length === 0) {
    return formatString;
  } else {
    var placeHolders = /%%|%s|%d|%\d+\$s|%\d+\$d/g;
    var matchResult;
    var result = "";
    var currentIndex = 0;
    var values = Array.isArray(args) ? args : Array.prototype.slice.call(arguments, 1);
    var currentValueIndex = 0;
    while ((matchResult = placeHolders.exec(formatString)) !== null) {
      // TODO: support explicit position in place holders (%x$s)
      result += formatString.slice(currentIndex, placeHolders.lastIndex - matchResult[0].length);
      if (matchResult[0] == "%%") {
        result += '%';
      } else if (currentValueIndex < values.length) {
        result += values[currentValueIndex];
        currentValueIndex++;
      }
      currentIndex = placeHolders.lastIndex;
    }
    result += formatString.slice(currentIndex);
    return result;
  }
}

/**
 * Loads resource bundles for a given base URL and a given language.
 *
 * @param baseURL the base URL of the localized resource to be loaded
 * @param language the language to be loaded (Java conventions)
 * @returns an array of bundle objects, starting with the most specific localization to the default
 */
CoreTools.loadResourceBundles = function(baseURL, language) {
  var resourceBundles = [];
  if (language) {
    resourceBundles.push(CoreTools.loadJSON(baseURL + "_" + language + ".json"));
    if (language.indexOf("_") > 0) {
      resourceBundles.push(CoreTools.loadJSON(baseURL + "_" + language.split("_")[0] + ".json"));
    }
  }
  resourceBundles.push(CoreTools.loadJSON(baseURL + ".json"));
  return resourceBundles;  
}

/**
 * Gets a string from an array of resource bundles, starting with the first bundle. 
 * It returns the value associated with the given key, in the first bundle where it is found. 
 *
 * @param resourceBundles {Object[]} an array of bundle objects to look up the key into.
 * @param key {string} the key to lookup
 * @param parameters {...*} parameters for the formatting of the key
 * @returns the value associated with the key (in the first bundle object that contains it)
 */
CoreTools.getStringFromKey = function(resourceBundles, key, parameters) {
  for (var i = 0; i < resourceBundles.length; i++) {
    if (resourceBundles[i] != null && resourceBundles[i][key]) {
      return CoreTools.format.apply(null, [resourceBundles[i][key]].concat(Array.prototype.slice.call(arguments, 2)));
    }
  }
  throw new IllegalArgumentException("Can't find resource bundle for " + key);
}

/**
 * Gets all the keys from an array of resource bundles. 
 *
 * @param resourceBundles {Object[]} an array of bundle objects to look up the keys into.
 * @returns the list of keys found in the bundle
 */
CoreTools.getKeys = function(resourceBundles) {
  var keys = {};
  for (var i = 0; i < resourceBundles.length; i++) {
    if(resourceBundles[i] != null) {
      CoreTools.merge(keys,  resourceBundles[i]);
    }
  }
  return Object.getOwnPropertyNames(keys);
}

/**
 * Gets an object stored in a map object from a key. Note that this implementation is slow if the key object is not a string.
 * @param map {Object} the object holding the map
 * @param key {string|*} the key to associate the value to (can be an object or a string)
 * @returns {*} the value associated to the key (null if not found)
 */
CoreTools.getFromMap = function(map, key) {
  if (typeof key === 'string') {
    return map[key] === undefined ? null : map[key];
  } else {
    if (map.entries == null) {
      map.entries = []; 
    }
    var keyHashCode = typeof key.hashCode === 'function' ? key.hashCode() : undefined;
    for (var i = 0; i < map.entries.length; i++) {
      if ((keyHashCode === undefined || map.entries[i].keyHashCode === keyHashCode)
            && map.entries[i].key.equals !== undefined 
            && map.entries[i].key.equals(key) 
          || map.entries[i].key === key) {
        return map.entries[i].value;
      }
    }
    return null;
  }  
}

/**
 * Puts an object in a map object. When the given key is a string, the map object directly holds the 
 * key-value. When the given key is not a string, the map object will contain a list of entries (should be optimized).
 * @param map {Object} the object holding the map
 * @param key {string|*} the key to associate the value to (can be an object or a string)
 * @param value {*} the value to be put
 */
CoreTools.putToMap = function(map, key, value) {
  if (typeof key === 'string') {
    map[key] = value;
  } else {
    if (map.entries == null) {
      map.entries = [];
    }
    var keyHashCode = typeof key.hashCode === 'function' ? key.hashCode() : undefined;
    for (var i = 0; i < map.entries.length; i++) {
      if ((keyHashCode === undefined || map.entries[i].keyHashCode === keyHashCode)
            && map.entries[i].key.equals !== undefined 
            && map.entries[i].key.equals(key) 
          || map.entries[i].key === key) {
        map.entries[i].value = value;
        return;
      }
    }
    var entry = {key: key, 
                 value: value,
                 getKey: function () { return this.key; }, 
                 getValue: function () { return this.value; } 
                };
    if (typeof key.hashCode === 'function') {
      entry.keyHashCode = key.hashCode(); 
    }
    map.entries.push(entry);
  }
}

/**
 * Removes an object from a map object. When the given key is a string, the map object directly holds the 
 * key-value. When the given key is not a string, the map object will contain a list of entries (should be optimized).
 * @param map {Object} the object holding the map
 * @param key {string|*} the key to associate the value to (can be an object or a string)
 * @returns the removed value or <code>null</code> if not found
 */
CoreTools.removeFromMap = function(map, key) {
  if (typeof key === 'string') {
    var value = map[key];
    if (value !== undefined) {
      delete map[key];
    }
    return value !== undefined ? value : null;
  } else {
    var keyHashCode = typeof key.hashCode === 'function' ? key.hashCode() : undefined;
    for (var i = 0; i < map.entries.length; i++) {
      if ((keyHashCode === undefined || map.entries[i].keyHashCode === keyHashCode)
            && map.entries[i].key.equals !== undefined 
            && map.entries[i].key.equals(key) 
          || map.entries[i].key === key) {
        var value = map.entries[i].value; // TODO Why prototype is lost?
        map.entries.splice(i, 1);
        return value;
      }
    }
    return null;
  }
}

/**
 * Returns all the values put in a map object, as an array.
 * @param map {Object} the map containing the values
 * @returns {Array} the values (no specific order)
 */
CoreTools.valuesFromMap = function(map) {
  var values = [];
  if (map.entries === undefined) {
    Object.getOwnPropertyNames(map).forEach(function(property) {
        values.push(map[property]); 
      });
  } else {
    map.entries.forEach(function(entry) { 
        values.push(entry.value); 
      });
  }
  return values;
}

/**
 * Sorts an array with a comparator object or function. The comparator object must provide a <code>compare(Object, Object)</code> 
 * function, otherwise it is expected to be a comparison function.
 * @param array {Array} an array to be sorted (in-place sort)
 * @param comparator {Object|function} an object providing a <code>compare(Object, Object)</code>, or simply a function
 */
CoreTools.sortArray = function(array, comparator) { 
  if (comparator.compare) {
    array.sort(function(e1, e2) {
      return comparator.compare(e1,e2);
    });
  } else {
   array.sort(comparator);  
  }
}


var OperatingSystem = {}

OperatingSystem.isLinux = function() {
  if (navigator && navigator.platform) {
    return navigator.platform.indexOf("Linux") !== -1;
  } else {
    return false;
  }
}

OperatingSystem.isWindows = function() {
  if (navigator && navigator.platform) {
    return navigator.platform.indexOf("Windows") !== -1 || navigator.platform.indexOf("Win") !== -1;
  } else {
    return false;
  }
}

OperatingSystem.isMacOSX = function() {
  if (navigator && navigator.platform) {
    return navigator.platform.indexOf("Mac") !== -1;
  } else {
    return false;
  }
}

OperatingSystem.getName = function() {
  if (OperatingSystem.isMacOSX()) {
    return "Mac OS X";
  } else if (OperatingSystem.isLinux()) {
    return "Linux";
  } else if (OperatingSystem.isWindows()) {
    return "Windows";
  } else {
    return "Other";
  }
}

/**
 * Returns <code>true</code> if the current browser is Edge or Internet Explorer.
 */
OperatingSystem.isEdgeOrInternetExplorer = function() {
  // IE and Edge test from https://stackoverflow.com/questions/31757852/how-can-i-detect-internet-explorer-ie-and-microsoft-edge-using-javascript
  return (document.documentMode || /Edg/.test(navigator.userAgent));
}

/**
 * Returns <code>true</code> if the current browser is Internet Explorer.
 */
OperatingSystem.isInternetExplorer = function() {
  // IE test from https://stackoverflow.com/questions/31757852/how-can-i-detect-internet-explorer-ie-and-microsoft-edge-using-javascript
  return document.documentMode;
}

/**
 * This utility function merges all the source object properties into the destination object.
 * It has to be used in replacement of Object.assign that is now supported in IE.
 * @param {Object} destination
 * @param {Object} source
 * @returns {Object} the destination object
 */
CoreTools.merge = function(destination, source) {
  for (var key in source) {
    destination[key] = source[key];
  }
}

/**
 * This utility function returns the intersection between two arrays.
 * @param {any[]} array1
 * @param {any[]} array2
 * @returns {any[]} an array container elements being both in array1 and array2
 */
CoreTools.intersection = function(array1, array2) {
  return array1.filter(function(n) {
    return array2.indexOf(n) !== -1;
  });  
}

/**
 * Returns a string describing the key event in parameter. 
 * @param {KeyboardEvent} ev
 * @param {string} [keyEventType] "keyup", "keydown" or "keypress"
 * @returns
 */
function convertKeyboardEventToKeyStroke(ev, keyEventType) {
  if (convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS === undefined) {
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS = new Array(223);
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [8]  = "BACK_SPACE";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [9]  = "TAB";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [13] = "ENTER";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [16] = "SHIFT";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [17] = "CONTROL";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [18] = "ALT";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [19] = "PAUSE";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [20] = "CAPS_LOCK";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [27] = "ESCAPE";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [33] = "PAGE_UP";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [34] = "PAGE_DOWN";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [35] = "END";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [36] = "HOME";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [37] = "LEFT";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [38] = "UP";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [39] = "RIGHT";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [40] = "DOWN";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [45] = "INSERT";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [46] = "DELETE";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [48] = "0";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [49] = "1";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [50] = "2";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [51] = "3";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [52] = "4";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [53] = "5";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [54] = "6";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [55] = "7";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [56] = "8";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [57] = "9";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [65] = "A";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [66] = "B";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [67] = "C";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [68] = "D";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [69] = "E";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [70] = "F";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [71] = "G";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [72] = "H";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [73] = "I";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [74] = "J";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [75] = "K";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [76] = "L";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [77] = "M";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [78] = "N";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [79] = "O";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [80] = "P";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [81] = "Q";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [82] = "R";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [83] = "S";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [84] = "T";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [85] = "U";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [86] = "V";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [87] = "W";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [88] = "X";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [89] = "Y";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [90] = "Z";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [91] = "META";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [92] = "META";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [96] = "NUMPAD0";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [97] = "NUMPAD1";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [98] = "NUMPAD2";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [99] = "NUMPAD3";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [100] = "NUMPAD4";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [101] = "NUMPAD5";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [102] = "NUMPAD6";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [103] = "NUMPAD7";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [104] = "NUMPAD8";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [105] = "NUMPAD9";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [106] = "MULTIPLY";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [107] = "ADD";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [109] = "VK_SUBTRACT";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [110] = "VK_DECIMAL";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [111] = "VK_DIVIDE";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [112] = "F1";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [113] = "F2";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [114] = "F3";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [115] = "F4";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [116] = "F5";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [117] = "F6";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [118] = "F7";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [119] = "F8";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [120] = "F9";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [121] = "F10";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [122] = "F11";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [123] = "F12";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [144] = "VK_NUM_LOCK";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [145] = "VK_SCROLL_LOCK";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [186] = "VK_SEMICOLON";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [187] = "VK_EQUALS";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [188] = "VK_COMMA";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [190] = "VK_PERIOD";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [191] = "VK_SLASH";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [219] = "VK_OPEN_BRACKET";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [220] = "VK_BACK_SLASH";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [221] = "VK_CLOSE_BRACKET";
    convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [222] = "VK_QUOTE";
  }
  
  var keyStroke = ""; 
  var keyName = convertKeyboardEventToKeyStroke.KEY_CODE_TEXTS [ev.keyCode];
  if (keyName) {
    if (ev.ctrlKey || keyName.indexOf("control ") != -1) {
      keyStroke += "control ";
    }
    if (ev.altKey || keyName.indexOf("alt ") != -1) {
      keyStroke += "alt ";
    }
    if (ev.metaKey || keyName.indexOf("meta ") != -1) {
      keyStroke += "meta ";
    }
    if (ev.shiftKey || keyName.indexOf("shift ") != -1) {
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