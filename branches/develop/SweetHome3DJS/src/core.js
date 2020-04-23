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
  return ""+object;
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

/**
 * Loads a JSON resource from a url (synchronous).
 * @param url {string}  the url of the JSON resource to be loaded
 * @returns an object that corresponds to the loaded JSON
 */
function loadJSON(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.responseType = 'json';
  xhr.send();
  return xhr.response;
}

/**
 * Formats a string with the given args.
 * @param {string} formatString a string containing optional place holders (%s, %d)
 * @param {*[]|...*} args an array of arguments to be applied to formatString
 * @returns the formatted string
 */
function format(formatString, args) {
  if(args === undefined || args.length === 0) {
    return formatString;
  } else {
    var placeHolders = /%s|%d|%\d+\$s|%\d+\$d/g;
    var matchResult;
    var result = "";
    var currentIndex = 0;
    var values = Array.isArray(args) ? args : Array.prototype.slice.call(arguments, 1);
    var currentValueIndex = 0;
    while (currentValueIndex < values.length && (matchResult = placeHolders.exec(formatString)) !== null) {
      // TODO: support explicit position in place holders (%x$s)
      result += formatString.slice(currentIndex, placeHolders.lastIndex - matchResult[0].length);
      result += values[currentValueIndex];
      currentValueIndex++;
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
function loadResourceBundles(baseURL, language) {
  var resourceBundles = [];
  if (language) {
    resourceBundles.push(loadJSON(baseURL + "_" + language + ".json"));
    if (language.indexOf("_") > 0) {
      resourceBundles.push(loadJSON(baseURL + "_" + language.split("_")[0] + ".json"));
    }
  }
  resourceBundles.push(loadJSON(baseURL + ".json"));
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
function getStringFromKey(resourceBundles, key, parameters) {
  for (var i = 0; i < resourceBundles.length; i++) {
    if (resourceBundles[i] != null && resourceBundles[i][key]) {
      return format.apply(null, [resourceBundles[i][key]].concat(Array.prototype.slice.call(arguments, 2)));
    }
  }
  throw new IllegalArgumentException("Can't find resource bundle for " + key);
}

/**
 * Gets an object stored in a map object from a key. Note that this implementation is slow if the key object is not a string.
 * @param map {*} the object holding the map
 * @param key {string|*} the key to associate the value to (can be an object or a string)
 * @returns {*} the value associated to the key (null if not found)
 */
function getFromMap(map, key) {
  if(typeof key === 'string') {
    return map[key] === undefined ? null : map[key];
  } else {
    if (map.entries == null) {
      map.entries = []; 
    }
    for (var i = 0; i < map.entries.length; i++) {
      if (map.entries[i].key.equals != null && map.entries[i].key.equals(key) || map.entries[i].key === key) {
        return map.entries[i].value;
      }
    }
    return null;
  }  
}

/**
 * Puts an object in a map object. When the given key is a string, the map object directly holds the 
 * key-value. When the given key is not a string, the map object will contain a list of entries (should be optimized).
 * @param map {*} the object holding the map
 * @param key {string|*} the key to associate the value to (can be an object or a string)
 * @param value {*} the value to be put
 */
function putToMap(map, key, value) {
  if(typeof key === 'string') {
    map[key] = value;
  } else {
    if (map.entries == null) {
      map.entries = [];
    }
    for (var i = 0; i < map.entries.length; i++) {
      if (map.entries[i].key.equals != null && map.entries[i].key.equals(key) || map.entries[i].key === key) {
        map.entries[i].value = value;
        return;
      }
    }
    map.entries.push({ key: key, 
                     value: value,
                     getKey: function () { return this.key; }, 
                     getValue: function () { return this.value; } 
                   });
  }
}