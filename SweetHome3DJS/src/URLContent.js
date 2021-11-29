/*
 * URLContent.js
 *
 * Sweet Home 3D, Copyright (c) 2015 Emmanuel PUYBARET / eTeks <info@eteks.com>
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA02111-1307USA
 */

/**
 * Content wrapper for strings used as URLs.
 * @param {string} url  the URL from which this content will be read
 * @constructor
 * @author Emmanuel Puybaret
 */
function URLContent(url) {
  this.url = url;
}

URLContent["__class"] = "com.eteks.sweethome3d.tools.URLContent";
URLContent["__interfaces"] = ["com.eteks.sweethome3d.model.Content"];

/**
 * Returns the URL of this content.
 * @return {string}
 */
URLContent.prototype.getURL = function() {
  var httpsSchemeIndex = this.url.indexOf("https://");
  var httpSchemeIndex = this.url.indexOf("http://");
  if (httpsSchemeIndex !== -1
      || httpSchemeIndex !== -1) {
    var scripts = document.getElementsByTagName("script");
    if (scripts && scripts.length > 0) {
      var scriptUrl = document.getElementsByTagName("script") [0].src;
      var scriptColonSlashIndex = scriptUrl.indexOf("://");
      var scriptScheme = scriptUrl.substring(0, scriptColonSlashIndex);
      var scheme = httpsSchemeIndex !== -1  ? "https"  : "http";
      // If scheme is different from script one, replace scheme and port with script ones to avoid CORS issues
      if (scriptScheme != scheme) {
        var scriptServer = scriptUrl.substring(scriptColonSlashIndex + "://".length, scriptUrl.indexOf("/", scriptColonSlashIndex + "://".length));
        var scriptPort = "";
        var colonIndex = scriptServer.indexOf(":");
        if (colonIndex > 0) {
          scriptPort = scriptServer.substring(colonIndex);
          scriptServer = scriptServer.substring(0, colonIndex);
        }
        var schemeIndex = httpsSchemeIndex !== -1  ? httpsSchemeIndex  : httpSchemeIndex;
        var colonSlashIndex = this.url.indexOf("://", schemeIndex);
        var fileIndex = this.url.indexOf("/", colonSlashIndex + "://".length);
        var server = this.url.substring(colonSlashIndex + "://".length, fileIndex);
        if (server.indexOf(":") > 0) {
          server = server.substring(0, server.indexOf(":"));
        }
        if (scriptServer == server) {
          return this.url.substring(0, schemeIndex) + scriptScheme + "://" + scriptServer + scriptPort + this.url.substring(fileIndex); 
        }
      }
    }
  } 
  
  return this.url;
}

/**
 * Returns <code>true</code> if the URL stored by this content 
 * references an entry in a JAR.
 * @return {boolean}
 */
URLContent.prototype.isJAREntry = function() {
  return this.url.indexOf("jar:") === 0 && this.url.indexOf("!/") !== -1; 
}

/**
 * Returns the URL base of a JAR entry.
 * @return {string}
 */
URLContent.prototype.getJAREntryURL = function() {
  if (!this.isJAREntry()) {
    throw new IllegalStateException("Content isn't a JAR entry");
  }
  // Use URL returned by getURL() rather that this.url to get adjusted URL
  var url = this.getURL(); 
  return url.substring("jar:".length, url.indexOf("!/"));
}

/**
 * Returns the name of a JAR entry. 
 * If the JAR entry in the URL given at creation time was encoded in application/x-www-form-urlencoded format,
 * this method will return it unchanged and not decoded.
 * @return {string}
 * @throws IllegalStateException if the URL of this content 
 *                    doesn't reference an entry in a JAR URL.
 */
URLContent.prototype.getJAREntryName = function() {
  if (!this.isJAREntry()) {
    throw new IllegalStateException("Content isn't a JAR entry");
  }
  return this.url.substring(this.url.indexOf("!/") + 2);
}

/**
 * Returns <code>true</code> if the object in parameter is an URL content
 * that references the same URL as this object.
 * @return {boolean}
 */
URLContent.prototype.equals = function(obj) {
  if (obj === this) {
    return true;
  } else if (obj instanceof URLContent) {
    var urlContent = obj;
    return urlContent.url == this.url;
  } else {
    return false;
  }
}

/**
 * Returns a hash code for this object.
 * @return {Number}
 */
URLContent.prototype.hashCode = function() {
  return this.url.split("").reduce(function(a, b) {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
}


/**
 * An URL content read from a home stream.
 * @param {string} url  the URL from which this content will be read
 * @constructor
 * @ignore
 * @author Emmanuel Puybaret
 */
function HomeURLContent(url) {
  URLContent.call(this, url);
}
HomeURLContent.prototype = Object.create(URLContent.prototype);
HomeURLContent.prototype.constructor = HomeURLContent;

HomeURLContent["__class"] = "com.eteks.sweethome3d.io.HomeURLContent";
HomeURLContent["__interfaces"] = ["com.eteks.sweethome3d.model.Content"];


/**
 * Content read from a URL with no dependency on other content when this URL is a JAR entry.
 * @constructor
 * @ignore
 * @author Emmanuel Puybaret
 */
function SimpleURLContent(url) {
  URLContent.call(this, url);
}
SimpleURLContent.prototype = Object.create(URLContent.prototype);
SimpleURLContent.prototype.constructor = SimpleURLContent;

SimpleURLContent["__class"] = "com.eteks.sweethome3d.tools.SimpleURLContent";
SimpleURLContent["__interfaces"] = ["com.eteks.sweethome3d.model.Content"];


/**
 * Content read from the URL of a Blob or File instance.
 * @constructor
 * @param {Blob|File} blob
 * @author Louis Grignon
 * @author Emmanuel Puybaret
 */
function BlobURLContent(blob) {
  var url = URL.createObjectURL(blob);
  URLContent.call(this, url);
  this.blob = blob;
  this.savedContent = null;
}
BlobURLContent.prototype = Object.create(URLContent.prototype);
BlobURLContent.prototype.constructor = BlobURLContent;

BlobURLContent["__class"] = "com.eteks.sweethome3d.tools.BlobURLContent";
BlobURLContent["__interfaces"] = ["com.eteks.sweethome3d.model.Content"];

/**
 * @return {Blob|File} blob content 
 */
BlobURLContent.prototype.getBlob = function() {
  return this.blob;
}

/**
 * Returns the content saved on server.
 * @return {URLContent} content on server or <code>null</code> if not saved on server yet 
 */
BlobURLContent.prototype.getSavedContent = function() {
  return this.savedContent;
}

/**
 * Sets the content saved on server.
 * @param {URLContent} savedContent content on server 
 */
BlobURLContent.prototype.setSavedContent = function(savedContent) {
  this.savedContent = savedContent;
}

/**
 * Generates a BlobURLContent instance from an image.
 * @param {HTMLImageElement} image the image to be used as content source
 * @param {string} imageType resulting image blob mime type
 * @param {function(BlobURLContent)} oncontentready callback called when content is ready, with content instance as only parameter
 */
BlobURLContent.fromImage = function(image, imageType, oncontentready) {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0, image.width, image.height);
  if (canvas.msToBlob) {
    oncontentready(new BlobURLContent(canvas.msToBlob()));
  } else {
    canvas.toBlob(function (blob) {
        oncontentready(new BlobURLContent(blob));
      }, imageType, 0.7);
  }
}


/**
 * Utilities about the system environment.
 * @class
 * @ignore
 * @author Emmanuel Puybaret
 */
var OperatingSystem = {}

/**
 * Returns <code>true</code> if the operating system is Linux.
 */
OperatingSystem.isLinux = function() {
  if (navigator && navigator.platform) {
    return navigator.platform.indexOf("Linux") !== -1;
  } else {
    return false;
  }
}

/**
 * Returns <code>true</code> if the operating system is Windows.
 */
OperatingSystem.isWindows = function() {
  if (navigator && navigator.platform) {
    return navigator.platform.indexOf("Windows") !== -1 || navigator.platform.indexOf("Win") !== -1;
  } else {
    return false;
  }
}

/**
 * Returns <code>true</code> if the operating system is Mac OS X.
 */
OperatingSystem.isMacOSX = function() {
  if (navigator && navigator.platform) {
    return navigator.platform.indexOf("Mac") !== -1;
  } else {
    return false;
  }
}

/**
 * Returns the operating system name used to filter some information.
 */
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
 * Returns <code>true</code> if the current browser is Internet Explorer or Edge (note based on Chromium).
 */
OperatingSystem.isInternetExplorerOrLegacyEdge = function() {
  // IE and Edge test from https://stackoverflow.com/questions/31757852/how-can-i-detect-internet-explorer-ie-and-microsoft-edge-using-javascript
  return (document.documentMode || /Edge/.test(navigator.userAgent));
}

/**
 * Returns <code>true</code> if the current browser is Internet Explorer.
 */
OperatingSystem.isInternetExplorer = function() {
  // IE test from https://stackoverflow.com/questions/31757852/how-can-i-detect-internet-explorer-ie-and-microsoft-edge-using-javascript
  return document.documentMode;
}


/**
 * ZIP reading utilities.
 * @class
 * @author Emmanuel Puybaret
 */
var ZIPTools = {};

ZIPTools.READING = "Reading";

ZIPTools.openedZips = {};
ZIPTools.runningRequests = [];

/**
 * Reads the ZIP data in the given URL.
 * @param {string} url the URL of a zip file containing an OBJ entry that will be loaded
 *            or an URL noted as jar:url!/objEntry where objEntry will be loaded.
 * @param {boolean} [synchronous] optional parameter equal to false by default
 * @param {{zipReady, zipError, progression}} zipObserver An observer containing zipReady(zip), 
 *            zipError(error), progression(part, info, percentage) methods that
 *            will called at various phases.
 */
ZIPTools.getZIP = function(url, synchronous, zipObserver) {
  if (zipObserver === undefined) {
    zipObserver = synchronous;
    synchronous = false;
  }
  if (url in ZIPTools.openedZips) {
    zipObserver.zipReady(ZIPTools.openedZips [url]); 
  } else {
    try {
      var request = new XMLHttpRequest();
      request.open('GET', url, !synchronous);
      request.responseType = "arraybuffer";
      request.withCredentials = true;
      request.overrideMimeType("application/octet-stream");
      request.addEventListener("readystatechange", 
          function(ev) {
            if (request.readyState === XMLHttpRequest.DONE) {
              if ((request.status === 200 || request.status === 0)
                  && request.response != null) {
                try {
                  ZIPTools.runningRequests.splice(ZIPTools.runningRequests.indexOf(request), 1);
                  var zip = new JSZip(request.response);
                  ZIPTools.openedZips [url] = zip;
                  zipObserver.zipReady(ZIPTools.openedZips [url]); 
                } catch (ex) {
                  zipObserver.zipError(ex);
                }
              } else {
                // Report error for requests that weren't aborted
                var index = ZIPTools.runningRequests.indexOf(request);              
                if (index >= 0) {
                  ZIPTools.runningRequests.splice(index, 1);                
                  zipObserver.zipError(new Error(request.status + " while requesting " + url)); 
                }
              }
            }
          });
      request.addEventListener("progress", 
          function(ev) {
            if (ev.lengthComputable
                && zipObserver.progression !== undefined) {
              zipObserver.progression(ZIPTools.READING, url, ev.loaded / ev.total);
            }
          });
      request.send();
      ZIPTools.runningRequests.push(request);
    } catch (ex) {
      zipObserver.zipError(ex);
    }
  }
}


/**
 * Clears cache and aborts running requests.
 */
ZIPTools.clear = function() {
  ZIPTools.openedZips = {};
  // Abort running requests
  while (ZIPTools.runningRequests.length > 0) {
    var request = ZIPTools.runningRequests [ZIPTools.runningRequests.length - 1];
    ZIPTools.runningRequests.splice(ZIPTools.runningRequests.length - 1, 1);
    request.abort();
  }
}

/**
 * Removes from cache the content matching the given <code>url</code>. 
 */
ZIPTools.disposeZIP = function(url) {
  delete ZIPTools.openedZips [url];
}

/**
 * Returns true if the given image data describes a JPEG file.
 * @package
 * @ignore
 */
ZIPTools.isJPEGImage = function(imageData) {
  return imageData.charAt(0).charCodeAt(0) === 0xFF 
      && imageData.charAt(1).charCodeAt(0) === 0xD8 
      && imageData.charAt(2).charCodeAt(0) === 0xFF;
}

/**
 * Returns true if the given image data describes a transparent PNG file.
 * @package
 * @ignore
 */
ZIPTools.isPNGImage = function(imageData) {
  return imageData.charAt(0).charCodeAt(0) === 0x89 
      && imageData.charAt(1).charCodeAt(0) === 0x50 
      && imageData.charAt(2).charCodeAt(0) === 0x4E 
      && imageData.charAt(3).charCodeAt(0) === 0x47 
      && imageData.charAt(4).charCodeAt(0) === 0x0D 
      && imageData.charAt(5).charCodeAt(0) === 0x0A 
      && imageData.charAt(6).charCodeAt(0) === 0x1A 
      && imageData.charAt(7).charCodeAt(0) === 0x0A;
}

/**
 * Returns true if the given image data describes a transparent PNG file.
 * @package
 * @ignore
 */
ZIPTools.isTransparentImage = function(imageData) {
  return ZIPTools.isPNGImage(imageData)
      && (imageData.charAt(25).charCodeAt(0) === 4
          || imageData.charAt(25).charCodeAt(0) === 6
          || (imageData.indexOf("PLTE") !== -1 && imageData.indexOf("tRNS") !== -1));
}

/**
 * Returns the folder where a given Javascript .js file was read from.
 * @param {string} [script] the URL of a script used in the program  
 * @package
 * @ignore
 */
ZIPTools.getScriptFolder = function(script) {
  if (script === undefined) {
    // Consider this script is always here because ZIPTools itself requires it
    script = "jszip.min.js"; 
  }
  var baseUrl = "http://www.sweethome3d.com/libjs/"; 
  // Search the base URL of this script
  var scripts = document.getElementsByTagName("script");      
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src.indexOf(script) !== -1) {
      baseUrl = scripts[i].src.substring(0, scripts[i].src.lastIndexOf("/") + 1);
      break;
    }
  }
  return baseUrl;
}
