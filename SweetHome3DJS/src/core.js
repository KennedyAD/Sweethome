/*
 * core.js
 *
 * Copyright (c) 2015-2023 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
 * Creates an ParseException instance.
 * Adapted from java.text.ParseException
 * @constructor
 */
function ParseException(message, errorOffset) {
  this.message = message;
  this.errorOffset = errorOffset;
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
 * Creates an instance of a string buffer in which characters can be added.
 * Adapted from java.io.StringWriter
 * @constructor
 */
function StringWriter() {
  this.buffer = ""
}

/**
 * Appends the given string to the buffer.
 * @param {string} string
 */
StringWriter.prototype.write = function(string) {
  return this.buffer += string;
}

/**
 * Returns the string stored in buffer.
 * @return {string} string
 */
StringWriter.prototype.toString = function(string) {
  return this.buffer;
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
 * Returns the object parsed from the given string and updates optional parse position.
 * @param {string} string
 * @param {ParsePosition} [parsePosition] 
 * @return the parsed object or if the string can't be parsed, <code>null</code> when position is given
 *              or throws a ParseException if position isn't given
 */
Format.prototype.parseObject = function(string, position) {
  var exactParsing = position === undefined;
  if (position === undefined) {
    position = new ParsePosition(0);
  }
  var value = this.parse(string, position);
  if (exactParsing && position.getIndex() !== string.length) {
    throw new ParseException(string, position.getIndex());
  }
  return value;
}

/**
 * Returns the date or number parsed from the given string and updates optional parse position.
 * @param {string} string a date or number with English notation
 * @param {ParsePosition} [parsePosition] 
 * @return the parsed date or number or if the string can't be parsed, <code>null</code> when position is given
 *              or throws a ParseException if position isn't given
 */
Format.prototype.parse = function(string, position) {
  var s = position === undefined
      ? string
      : string.substring(position.getIndex());
  var value = Date.parse(s);
  if (isNaN(value)) {
    var value = parseInt(s);
    if (isNaN(value)) {
      var value = parseFloat(s);
      if (isNaN(value)) {
        if (position === undefined) {
          throw new ParseException(s, 0);
        } else {
          return null;
        }
      }
    }
  } 
  if (position !== undefined) {
    position.setIndex(string.length);
  }
  return value;
}

Format.prototype.clone = function() {
  var clone = Object.create(this);
  for (var attribute in this) {
    if (this.hasOwnProperty(attribute)) {
      clone [attribute] = this [attribute];
    } 
  }
  return clone;
}

/**
 * Parse position used to track current parsing position.
 * Adapted from java.text.ParsePosition.
 * @constructor
 * @ignore
 */
function ParsePosition(index) {
  this.index = index;
  this.errorIndex = -1;
}

ParsePosition.prototype.getIndex = function() {
  return this.index;
}

ParsePosition.prototype.setIndex = function(index) {
  this.index = index;
}

ParsePosition.prototype.getErrorIndex = function() {
  return this.errorIndex;
}

ParsePosition.prototype.setErrorIndex = function(errorIndex) {
  this.errorIndex = errorIndex;
}


/**
 * A format for numbers.
 * Inspired by java.text.NumberFormat
 * @param {string} [pattern] partial support of pattern defined at https://docs.oracle.com/javase/7/docs/api/java/text/DecimalFormat.html
 * @constructor
 * @extends Format
 * @private
 * @ignore
 * @author Louis Grignon
 * @author Emmanuel Puybaret
 */
function NumberFormat() {
  Format.call(this);

  this.groupingUsed = false;
  this.minimumFractionDigits = 0;
  this.maximumFractionDigits = 2;

}
NumberFormat.prototype = Object.create(Format.prototype);
NumberFormat.prototype.constructor = NumberFormat;

NumberFormat.prototype.setGroupingUsed = function(groupingUsed) {
  this.groupingUsed = groupingUsed;
}

NumberFormat.prototype.isGroupingUsed = function() {
  return this.groupingUsed;
}

NumberFormat.prototype.setPositivePrefix = function(positivePrefix) {
  this.positivePrefix = positivePrefix;
}

NumberFormat.prototype.getPositivePrefix = function() {
  return this.positivePrefix;
}

NumberFormat.prototype.setNegativePrefix = function(negativePrefix) {
  this.negativePrefix = negativePrefix;
}

NumberFormat.prototype.getNegativePrefix = function() {
  return this.negativePrefix;
}

NumberFormat.prototype.setMinimumFractionDigits = function(minimumFractionDigits) {
  this.minimumFractionDigits = minimumFractionDigits;
}

NumberFormat.prototype.getMinimumFractionDigits = function() {
  return this.minimumFractionDigits;
}

NumberFormat.prototype.setMaximumFractionDigits = function(maximumFractionDigits) {
  this.maximumFractionDigits = maximumFractionDigits;
}

NumberFormat.prototype.getMaximumFractionDigits = function() {
  return this.maximumFractionDigits;
}

/**
 * @return {NumberFormat} 
 */
NumberFormat.getNumberInstance = function() {
  return new DecimalFormat("#.##");
}

/**
 * @return {NumberFormat} 
 */
NumberFormat.getIntegerInstance = function() {
  return new IntegerFormat();
}

/**
 * @return {NumberFormat} 
 */
NumberFormat.getCurrencyInstance = function() {
  return new CurrencyFormat();
}

/**
 * A format for decimal numbers.
 * Inspired by java.text.DecimalFormat
 * @param {string} [pattern] partial support of pattern defined at https://docs.oracle.com/javase/7/docs/api/java/text/DecimalFormat.html
 * @constructor
 * @extends NumberFormat
 * @ignore
 * @author Louis Grignon
 * @author Emmanuel Puybaret
 */
function DecimalFormat(pattern) {
  NumberFormat.call(this);
  this.checkLocaleChange();
  
  var minimumFractionDigits = 0;
  var maximumFractionDigits = 2;
  if (pattern !== undefined && pattern.trim() != "") {
    var patternParts = pattern.split(";");

    var fractionDigitsMatch = patternParts[0].match(/[.]([0]+)([#]*)/);
    if (fractionDigitsMatch == null) {
      minimumFractionDigits = 0;
      fractionDigitsMatch = patternParts[0].match(/[.]([#]*)/);
      if (fractionDigitsMatch == null) {
        maximumFractionDigits = 0;
      } else if (fractionDigitsMatch.length > 1) {
        maximumFractionDigits = fractionDigitsMatch[1].length;
      }
    } else if (fractionDigitsMatch.length > 1) {
      minimumFractionDigits = fractionDigitsMatch[1].length;
      if (fractionDigitsMatch.length > 2 && fractionDigitsMatch[2].length > 0) {
        maximumFractionDigits = minimumFractionDigits + fractionDigitsMatch[2].length;
      }
    }

    if (patternParts.length > 1) {
      var part = patternParts[0].trim();
      this.positivePrefix = part.substring(0, Math.min(part.indexOf('#'), part.indexOf('0')));
      part = patternParts[1].trim();
      this.negativePrefix = part.substring(0, Math.min(part.indexOf('#'), part.indexOf('0')));
    } else {
      var part = patternParts[0].trim();
      this.positivePrefix = this.negativePrefix = part.substring(0, Math.min(part.indexOf('#'), part.indexOf('0')));
    }
  }
  
  if (maximumFractionDigits < minimumFractionDigits) {
    maximumFractionDigits = minimumFractionDigits;
  }
  
  this.setMinimumFractionDigits(minimumFractionDigits);
  this.setMaximumFractionDigits(maximumFractionDigits);
}
DecimalFormat.prototype = Object.create(NumberFormat.prototype);
DecimalFormat.prototype.constructor = DecimalFormat;

/**
 * @param {number} number
 * @return {string}
 */
DecimalFormat.prototype.format = function(number) {
  if (number == null) {
    return '';
  }
  this.checkLocaleChange();

  var formattedNumber = toLocaleStringUniversal(number, this.groupingSeparator, this.isGroupingUsed(), this.decimalSeparator, {
      minimumFractionDigits: this.getMinimumFractionDigits(),
      maximumFractionDigits: this.getMaximumFractionDigits(),
      positivePrefix: this.positivePrefix,
      negativePrefix: this.negativePrefix,
    }); 
  return formattedNumber;
}

/**
 * @return {number}
 */
DecimalFormat.prototype.parse = function(text, parsePosition) {
  this.checkLocaleChange();
  var number = parseLocalizedNumber(text, parsePosition, {
      decimalSeparator: this.decimalSeparator,
      positivePrefix: this.positivePrefix,
      negativePrefix: this.negativePrefix
    });
  if (number === null) {
    return null;
  } else {
    return number;
  }
}

/**
 * @private
 */
DecimalFormat.prototype.checkLocaleChange = function() {
  // Instantiate format if locale changed
  if (Locale.getDefault() != this.formatLocale) {
    this.formatLocale = Locale.getDefault();
    this.decimalSeparator = this.formatLocale.match(/(bg|cs|de|el|es|fi|fr|hu|in|it|nl|pl|pt|ru|sl|sr|sv|uk|vi)(_\w\w)?/) 
        ? ","
        : this.formatLocale.match(/(ar)(_\w\w)?/)
            ? "٫"
            : ".";
    this.groupingSeparator = this.formatLocale.match(/(bg|cs|fi|fr|hu|pl|ru|sv|uk)(_\w\w)?/) 
        ? "\u00a0"
        : this.formatLocale.match(/(de|el|es|in|it|nl|pt|sl|sr|vi)(_\w\w)?/)
            ? "."
            : this.formatLocale.match(/(ar)(_\w\w)?/)
                ? "٬"
                : ",";
  }
}

/**
 * Returns <code>toLocaleString</code> fixed for environments where <code>options</code> 
 * are not supported (mainly Safari 8/9).
 * @param {number} number
 * @param {string} groupingSeparator
 * @param {boolean} groupingUsed
 * @param {string} decimalSeparator
 * @param {Object} options
 * @ignore
 */
function toLocaleStringUniversal(number, groupingSeparator, groupingUsed, decimalSeparator, options) {
  if (options.minimumFractionDigits === 0) {
    delete options.minimumFractionDigits;
  }

  var formattedNumber = number.toLocaleString("en", options);
  var decimalSeparatorIndex = formattedNumber.indexOf('.');
  if (decimalSeparatorIndex === -1) {
    decimalSeparatorIndex = formattedNumber.length;
  }
  
  if (options.maximumFractionDigits === 0) {
    if (decimalSeparatorIndex < formattedNumber.length) {
      // Remove last decimals
      formattedNumber = Math.round(number).toString();
      decimalSeparatorIndex = formattedNumber.length;
    }
  } else if (options.maximumFractionDigits < formattedNumber.length - decimalSeparatorIndex - 1) {
    // Limit decimals to the required maximum using an integer with the right number of digits
    formattedNumber = Math.round(number * Math.pow(10, options.maximumFractionDigits)).toString();
    if (Math.abs(number) < 1) {
      formattedNumber = number > 0 
          ? '0.' + formattedNumber 
          : '-0.' + formattedNumber.substring(1);
    } else {
      formattedNumber = formattedNumber.substring(0, decimalSeparatorIndex) + '.' + formattedNumber.substring(decimalSeparatorIndex);
    }
  }
  
  // Add a decimal separator if needed followed by the required number of zeros
  if (options.minimumFractionDigits > 0) {
    if (decimalSeparatorIndex === formattedNumber.length) {
      formattedNumber += '.';
    }
    while (options.minimumFractionDigits > formattedNumber.length - decimalSeparatorIndex - 1) {
      formattedNumber += '0';
    }
  }
  
  if (decimalSeparatorIndex > 3) {
    if (formattedNumber.indexOf(',') === -1) {
      if (groupingUsed) {
        // Add missing grouping separator
        for (var groupingSeparatorIndex = decimalSeparatorIndex - 3; groupingSeparatorIndex > (number > 0 ? 0 : 1); groupingSeparatorIndex -= 3) {
          formattedNumber = formattedNumber.substring(0, groupingSeparatorIndex) + ',' + formattedNumber.substring(groupingSeparatorIndex); 
          decimalSeparatorIndex++;
        }
      }
    } else if (!groupingUsed) {
      // Remove grouping separator
      formattedNumber = formattedNumber.replace(/\,/g, "");
    } 
  }

  formattedNumber = formattedNumber.replace(".", "#");
  if (groupingUsed) {
    formattedNumber = formattedNumber.replace(/\,/g, groupingSeparator);
  }
  formattedNumber = formattedNumber.replace("#", decimalSeparator);
  if (options.negativePrefix && options.negativePrefix.length > 0) {
    formattedNumber = formattedNumber.replace("-", options.negativePrefix);
  }
  if (number > 0 && options.positivePrefix && options.positivePrefix.length > 0) {
    formattedNumber = options.positivePrefix + formattedNumber;
  }
  return formattedNumber;
}

/**
 * Returns the number parsed from the given string and updates parse position.
 * @param {string} string
 * @param {ParsePosition} parsePosition
 * @param { { decimalSeparator?: string, positivePrefix?: string, negativePrefix?: string } } options
 *  - decimalSeparator: if omitted the string only integer is parsed
 *  - positivePrefix: optionally specify a prefix before positive numbers which should be ignored for parsing (default: '')
 *  - negativePrefix: optionally specify a prefix before negative numbers which should be ignored for parsing (default: '')
 * @return {number} the parsed number or <code>null</code> if the string can't be parsed
 * @ignore
 */
function parseLocalizedNumber(string, parsePosition, options) {
  var integer = options.decimalSeparator === undefined;
  var decimalSeparator = options.decimalSeparator;
  var positivePrefix = options.positivePrefix ? options.positivePrefix : "";
  var negativePrefix = options.negativePrefix ? options.negativePrefix : "";

  string = string.substring(parsePosition.getIndex(), string.length);

  if (positivePrefix.length > 0 && string.indexOf(positivePrefix) === 0) {
    string = string.substring(positivePrefix.length);
  } else if (negativePrefix.length > 0 && string.indexOf(negativePrefix) === 0) {
    string = string.replace(negativePrefix, "-");
  }

  var numberRegExp = integer 
      ? /\d+/g
      : new RegExp("^\\-?" 
            + "((\\d+\\" + decimalSeparator + "?\\d*)" 
            + "|(\\" + decimalSeparator + "\\d+))", "g"); // Same as /^\-?((\d+\.?\d*)|(\.\d+))/g
  if (numberRegExp.test(string) 
      && numberRegExp.lastIndex > 0) {      
    string = string.substring(0, numberRegExp.lastIndex);
    var number = integer
        ? parseInt(string)
        : parseFloat(string.replace(decimalSeparator, "."));
    parsePosition.setIndex(parsePosition.getIndex() + numberRegExp.lastIndex);
    return number;
  } else {
    return null;
  } 
}

/**
 * A format for integer numbers.
 * @constructor
 * @extends NumberFormat
 * @author Louis Grignon
 * @author Emmanuel Puybaret
 * @ignore
 */
function IntegerFormat() {
  NumberFormat.call(this);
}
IntegerFormat.prototype = Object.create(NumberFormat.prototype);
IntegerFormat.prototype.constructor = IntegerFormat;

/**
 * @param {number} number
 * @return {string}
 */
IntegerFormat.prototype.format = function(number) {
  if (number == null) {
    return '';
  }
  return toLocaleStringUniversal(number, "", false, "", {maximumFractionDigits: 0}); 
}
  
/**
 * @return {number}
 */
IntegerFormat.prototype.parse = function(text, parsePosition) {
  return parseLocalizedNumber(text, parsePosition, {}); // No decimal separator to parse integer
}


/**
 * A format for prices.
 * @constructor
 * @extends DecimalFormat
 * @author Emmanuel Puybaret
 * @ignore
 */
function CurrencyFormat() {
  DecimalFormat.call(this);
  this.currency = "USD";
  this.setGroupingUsed(true);
}
CurrencyFormat.prototype = Object.create(DecimalFormat.prototype);
CurrencyFormat.prototype.constructor = CurrencyFormat;

/**
 * @param {number} number
 * @return {string}
 */
CurrencyFormat.prototype.format = function(number) {
  try {
    var priceFormat = new Intl.NumberFormat(Locale.getDefault().replace('_', '-'), { 
        style: "currency", 
        currency: this.currency});
    return priceFormat.format(number);
  } catch(ex) {
    var fractionDigits = this.currency.match(/(JPY|VND)/) ? 0 : 2;
    this.setMinimumFractionDigits(fractionDigits);
    this.setMaximumFractionDigits(fractionDigits);
    var price = DecimalFormat.prototype.format.call(this, number);
    
    var formatLocale = Locale.getDefault();
    if (formatLocale === null || formatLocale.indexOf("en") == 0) {
      price = this.currency + price;
    } else {
      price += " " + this.currency;
    }
    return price;
  }  
}
  
/**
 * @param {string} currency
 */
CurrencyFormat.prototype.setCurrency = function(currency) {
  this.currency = currency;
}

/**
 * @return {string}
 */
CurrencyFormat.prototype.getCurrency = function() {
  return this.currency;
}


/**
 * Locale class.
 * @class
 * @ignore
 */
var Locale = {}

/**
 * Returns the default locale.
 * @return {string} an ISO 639 language code, possibly followed by a underscore and an ISO 3166 country code
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
  if (self.crypto && typeof(self.crypto.randomUUID) === "function") {
	return crypto.randomUUID();
  } else {
    // From https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
  }
}


/**
 * @ignore
 */
Math.toDegrees = function (x) {
  return x * 180 / Math.PI;
}

/**
 * @ignore
 */
Math.toRadians = function (x) {
  return x * Math.PI / 180;
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
 * @return {string} a string describing the key stroke event
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
