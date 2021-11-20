/*
 * CoreTools.js
 *
 * Sweet Home 3D, Copyright (c) 2020 Emmanuel PUYBARET / eTeks <info@eteks.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */

/**
 * Tools for application.
 * @class
 * @ignore
 * @author Renaud Pawlak
 * @author Emmanuel Puybaret
 */
var CoreTools = {};

CoreTools.unavailableResources = [];

/**
 * Loads a JSON resource from a url (synchronous).
 * @param url {string}  the url of the JSON resource to be loaded
 * @return an object that corresponds to the loaded JSON
 */
CoreTools.loadJSON = function(url) {
  if (url.indexOf('/') !== 0 && url.indexOf('://') < 0) {
    // Relative URLs based on scripts folder
    url = ZIPTools.getScriptFolder() + url;
  }
  
  if (CoreTools.unavailableResources.indexOf(url) < 0) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      // It is not allowed to change response type for a synchronous XHR
      // xhr.responseType = 'json';
      xhr.send();
      return JSON.parse(xhr.responseText);
    } catch (ex) {
      CoreTools.unavailableResources.push(url);
    }
  }
  return undefined;
}

/**
 * Formats a string with the given <code>args</code>.
 * @param {string} formatString a string containing optional place holders (%s, %d)
 * @param {Object[]|...Object} args an array of arguments to be applied to formatString
 * @return the formatted string
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

    placeHolders.lastIndex = 0;
    while ((matchResult = placeHolders.exec(formatString)) !== null) {
      result += formatString.slice(currentIndex, placeHolders.lastIndex - matchResult[0].length);

      var indexResult;
      if (matchResult[0] == "%%") {
        result += '%';
      } else if ((indexResult = /%(\d+)\$s/g.exec(matchResult[0])) !== null) {
        var valueIndex = parseInt(indexResult[1]) - 1;
        result += values[valueIndex];
      } else if ((indexResult = /%(\d+)\$d/g.exec(matchResult[0])) !== null) {
        var valueIndex = parseInt(indexResult[1]) - 1;
        result += values[valueIndex];
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
 * Returns the given <code>string</code> without accents. For example, <code>éèâ</code> 
 * returns <code>eea</code>.
 * @param {string} a string containing accents
 * @return the string with all the accentuated characters substituted with the corresponding 
 *          un-accentuated characters  
 */
CoreTools.removeAccents = function(string) {
  return string != null
      ? (typeof string.normalize == "function" // Not available under IE 11 and Safari 8/9
            ? string.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            : string.replace(/[áàâä]/g, "a").replace(/[éèêë]/g, "e").replace(/[íìîï]/g, "i").replace(/[óòôö]/g, "o").replace(/[úùûü]/g, "u"))
      : string;
}

/**
 * Returns resource bundles loaded from a given base URL and a given language.
 * @param baseURL the base URL of the localized resource to be loaded
 * @param language the language to be loaded (Java conventions)
 * @param {boolean} [noCache] force refresh content
 * @return an array of bundle objects, starting with the most specific localization to the default
 */
CoreTools.loadResourceBundles = function(baseURL, language, noCache) {
  var queryString = noCache ? "?requestId=" + UUID.randomUUID() : "";

  var resourceBundles = [];
  if (language) {
    resourceBundles.push(CoreTools.loadJSON(baseURL + "_" + language + ".json" + queryString));
    if (language.indexOf("_") > 0) {
      resourceBundles.push(CoreTools.loadJSON(baseURL + "_" + language.split("_")[0] + ".json" + queryString));
    }
  }

  resourceBundles.push(CoreTools.loadJSON(baseURL + ".json" + queryString));
  return resourceBundles;  
}

/**
 * Returns the string associated with the given key from an array of resource bundles, starting with the first bundle. 
 * @param resourceBundles {Object[]} an array of bundle objects to look up the key into.
 * @param key {string} the key to lookup
 * @param parameters {...*} parameters for the formatting of the key
 * @return the value associated with the key (in the first bundle object that contains it)
 */
CoreTools.getStringFromKey = function(resourceBundles, key, parameters) {
  for (var i = 0; i < resourceBundles.length; i++) {
    if (resourceBundles[i] != null && resourceBundles[i][key] !== undefined) {
      return CoreTools.format.apply(null, [resourceBundles[i][key]].concat(Array.prototype.slice.call(arguments, 2)));
    }
  }
  throw new IllegalArgumentException("Can't find resource bundle for " + key);
}

/**
 * Returns all the keys from an array of resource bundles. 
 * @param resourceBundles {Object[]} an array of bundle objects to look up the keys into.
 * @return the list of keys found in the bundle
 */
CoreTools.getKeys = function(resourceBundles) {
  var keys = {};
  for (var i = 0; i < resourceBundles.length; i++) {
    if (resourceBundles[i] != null) {
      CoreTools.merge(keys,  resourceBundles[i]);
    }
  }
  return Object.getOwnPropertyNames(keys);
}

/**
 * Returns the object stored in a map object from a key. Note that this implementation is slow if the key object is not a string.
 * @param map {Object} the object holding the map
 * @param key {string|*} the key to associate the value to (can be an object or a string)
 * @return {*} the value associated to the key (null if not found)
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
 * Removes an object from a map object and returns it. When the given key is a string, the map object directly holds the 
 * key-value. When the given key is not a string, the map object will contain a list of entries (should be optimized).
 * @param map {Object} the object holding the map
 * @param key {string|*} the key to associate the value to (can be an object or a string)
 * @return the removed value or <code>null</code> if not found
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
 * @return {Array} the values (no specific order)
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

/**
 * Returns a map containing all the source object properties merged into the destination object.
 * It has to be used in replacement of Object.assign that is not supported in IE.
 * @param {Object} destination
 * @param {Object} source
 * @return {Object} the destination object
 */
CoreTools.merge = function(destination, source) {
  for (var key in source) {
    destination[key] = source[key];
  }
}

/**
 * Returns the intersection between two arrays.
 * @param {any[]} array1
 * @param {any[]} array2
 * @return {any[]} an array container elements being both in array1 and array2
 */
CoreTools.intersection = function(array1, array2) {
  return array1.filter(function(n) {
      return array2.indexOf(n) !== -1;
    });  
}

/**
 * Provides a list of available font names (asynchronously, see callback parameter).
 * Internally uses a fixed list of standard Windows and macOS default fonts, and if FontFaceSet API is available, filter this list
 * @param {function(string[])} onFontsListAvailable called back when list is available
 */
CoreTools.loadAvailableFontNames = function(onFontsListAvailable) {
  if (document.fonts) {
    var windowsFonts = ["Arial", "Arial Black", "Bahnschrift", "Calibri", "Cambria", "Cambria Math", "Candara", "Comic Sans MS", "Consolas", "Constantia", "Corbel", "Courier New", "Ebrima", "Franklin Gothic Medium", "Gabriola", "Gadugi", "Georgia", "HoloLens MDL2 Assets", "Impact", "Ink Free", "Javanese Text", "Leelawadee UI", "Lucida Console", "Lucida Sans Unicode", "Malgun Gothic", "Marlett", "Microsoft Himalaya", "Microsoft JhengHei", "Microsoft New Tai Lue", "Microsoft PhagsPa", "Microsoft Sans Serif", "Microsoft Tai Le", "Microsoft YaHei", "Microsoft Yi Baiti", "MingLiU-ExtB", "Mongolian Baiti", "MS Gothic", "MV Boli", "Myanmar Text", "Nirmala UI", "Palatino Linotype", "Segoe MDL2 Assets", "Segoe Print", "Segoe Script", "Segoe UI", "Segoe UI Historic", "Segoe UI Emoji", "Segoe UI Symbol", "SimSun", "Sitka", "Sylfaen", "Symbol", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana", "Webdings", "Wingdings", "Yu Gothic"];
    var macosFonts = ["American Typewriter", "Andale Mono", "Arial", "Arial Black", "Arial Narrow", "Arial Rounded MT Bold", "Arial Unicode MS", "Avenir", "Avenir Next", "Avenir Next Condensed", "Baskerville", "Big Caslon", "Bodoni 72", "Bodoni 72 Oldstyle", "Bodoni 72 Smallcaps", "Bradley Hand", "Brush Script MT", "Chalkboard", "Chalkboard SE", "Chalkduster", "Charter", "Cochin", "Comic Sans MS", "Copperplate", "Courier", "Courier New", "Didot", "DIN Alternate", "DIN Condensed", "Futura", "Geneva", "Georgia", "Gill Sans", "Helvetica", "Helvetica Neue", "Herculanum", "Hoefler Text", "Impact", "Lucida Grande", "Luminari", "Marker Felt", "Menlo", "Microsoft Sans Serif", "Monaco", "Noteworthy", "Optima", "Palatino", "Papyrus", "Phosphate", "Rockwell", "Savoye LET", "SignPainter", "Skia", "Snell Roundhand", "Tahoma", "Times", "Times New Roman", "Trattatello", "Trebuchet MS", "Verdana", "Zapfino"];
    document.fonts.ready.then(function() {
        var availableFonts = [];
        var allTestedFonts = windowsFonts.concat(macosFonts);
        for (var i = 0; i < allTestedFonts.length; i++) {
          var fontName = allTestedFonts[i];
          if (availableFonts.indexOf(fontName) < 0 && document.fonts.check('12px "' + fontName + '"')) {
            availableFonts.push(fontName);
          }
        }
        onFontsListAvailable(availableFonts.sort());
      });
  } else {
    var defaultFonts = ["Arial", "Verdana", "Helvetica", "Tahoma", "Trebuchet MS", "Times New Roman", "Georgia", "Garamond", "Courier New", "Brush Script MT"];
    onFontsListAvailable(defaultFonts.sort());
  }
}


/**
 * Utilities for colors.
 * @class
 * @ignore
 * @author Renaud Pawlak
 */
var ColorTools = {};

/**
 * Converts a color given as an int to a CSS string representation. For instance, 0 will be converted to #000000.
 * Note that the alpha content is ignored.
 * @param {number} color
 * @return {string} a CSS string
 */
ColorTools.integerToHexadecimalString = function(color) {
  return "#" + ("00000" + (color & 0xFFFFFF).toString(16).toUpperCase()).slice(-6);
}

/**
 * Returns an hexadecimal color string from a computed style (no alpha).
 * @param {string} a style containing a color as rgb(...) or rgba(...)
 * @return {string} the color as a string or an empty string if the given style was not parseable
 */
ColorTools.styleToHexadecimalString = function(style) {
  var prefix = "rgb(";
  var index = style.indexOf(prefix);
  if (index < 0) {
    prefix = "rgba(";
    index = style.indexOf(prefix);
  }
  if (index >= 0) {
    var array = style.slice(prefix.length, style.indexOf(")")).split(",");
    return ColorTools.integerToHexadecimalString((parseInt(array[0]) << 16) + (parseInt(array[1]) << 8) + parseInt(array[2]));
  }
  return "";
}

/**
 * Returns a color from a computed style (no alpha).
 * @param {string} style a style containing a color as rgb(...) or rgba(...)
 * @return {number} the color as an integer or -1 if the given style was not parseable
 */
ColorTools.styleToInteger = function(style) {
  var prefix = "rgb(";
  var index = style.indexOf(prefix);
  if (index < 0) {
    prefix = "rgba(";
    index = style.indexOf(prefix);
  }
  if (index >= 0) {
    var array = style.slice(prefix.length, style.indexOf(")")).split(",");
    return (parseInt(array[0]) << 16) + (parseInt(array[1]) << 8) + parseInt(array[2]);
  }
  return -1;
}

ColorTools.isTransparent = function(style) {
  var prefix = "rgba(";
  var index = style.indexOf(prefix);
  if (index >= 0) {
    var array = style.slice(prefix.length, style.indexOf(")")).split(",");
    return parseFloat(array[3]) === 0;
  }
  return false;
}

/**
 * Returns a color from a color string (no alpha).
 * @param {string} colorString color string under the format #RRGGBB
 * @return {number} the color as an integer or -1 if the given string was not parseable
 */
ColorTools.hexadecimalStringToInteger = function(colorString) {
  if (colorString.indexOf("#") === 0 && (colorString.length === 7 || colorString.length === 9)) {
    colorString = colorString.slice(1);
    return (parseInt(colorString.slice(0, 2), 16) << 16) + (parseInt(colorString.slice(2, 4), 16) << 8) + parseInt(colorString.slice(4, 6), 16);
  }
  return -1;
}

/**
 * Returns an rgba style color from an hexadecimal color string (no alpha).
 * @param {string} colorString color string under the format #RRGGBB
 * @param {number} the alpha component (between 0 and 1)
 * @return {string} the color as an rgba description
 */
ColorTools.toRGBAStyle = function(colorString, alpha) {
  var c = ColorTools.hexadecimalStringToInteger(colorString);
  return "rgba(" + ((c & 0xFF0000) >> 16) + "," + ((c & 0xFF00) >> 8) + "," + (c & 0xFF) + "," + alpha + ")";
}


/**
 * Utilities for images.
 * @class
 * @ignore
 * @author Louis Grignon
 */
var ImageTools = {};

/**
 * @param {HTMLImageElement} image
 * @return {boolean} true if image has alpha channel
 */
ImageTools.isImageWithAlpha = function(image) {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0, image.width, image.height);
  return ImageTools.isCanvasWithAlpha(canvas, context);
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} [context] given canvas context. If not provided, canvas.getContext("2d") will be used
 * @return {boolean} true if image has alpha channel
 * @private
 */
ImageTools.isCanvasWithAlpha = function(canvas, context) {
  context = context ? context : canvas.getContext("2d");
  var data = context.getImageData(0, 0, canvas.width, canvas.height).data;
  var hasAlphaPixels = false;
  for (var i = 3, n = data.length; i < n; i += 4) {
    if (data[i] < 255) {
      hasAlphaPixels = true;
      break;
    }
  }
  return hasAlphaPixels;
}

/**
 * @param {HTMLImageElement} image
 * @param {number} targetWidth
 * @param {number} targetHeight
 * @param {function(HTMLImageElement)} onsuccess called when resize succeeded, with resized image as a parameter
 * @param {string} [imageType] target image mime type, defaults to image/png
 */
ImageTools.resize = function(image, targetWidth, targetHeight, onsuccess, imageType) {
  var canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  var canvasContext = canvas.getContext('2d');
  canvasContext.drawImage(image, 0, 0, targetWidth, targetHeight);

  var resizedImage = new Image();
  resizedImage.addEventListener("load", function () {
      onsuccess(resizedImage);
    });
  resizedImage.src = canvas.toDataURL(imageType ? imageType : 'image/png');
}
