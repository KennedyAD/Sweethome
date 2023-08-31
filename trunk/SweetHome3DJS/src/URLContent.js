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

URLContent.urlContents = {};

/**
 * Returns an instance of <code>URLContent</code> matching the given <code>url</code>.
 * @param {string} url
 * @return {URLContent}
 */
URLContent.fromURL = function(url) {
  var urlContent = URLContent.urlContents [url];
  if (urlContent == null) {
    if (url.indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) === 0) {
      urlContent = new LocalStorageURLContent(url);
    } else if (url.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) === 0) {
      urlContent = new IndexedDBURLContent(url);
    } else {
      urlContent = new URLContent(url);
    }
    // Keep content in cache
    URLContent.urlContents [url] = urlContent;
  }
  return urlContent;
}

/**
 * Returns the URL of this content.
 * @return {string}
 */
URLContent.prototype.getURL = function() {
  if (typeof document !== "undefined") {
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
  } 
  
  return this.url;
}

/**
 * Retrieves asynchronously an URL of this content usable for JavaScript functions with URL paramater.
 * @param  {{urlReady: function, urlError: function}} observer optional observer 
      which <code>urlReady</code> function will be called asynchronously once URL is available. 
 */
URLContent.prototype.getStreamURL = function(observer) {
  observer.urlReady(this.getURL());
}

/**
 * Returns <code>true</code> if this content URL is available to be read. 
 */
URLContent.prototype.isStreamURLReady = function() {
  return true;
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
    return obj.url == this.url;
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
 * Content read from local data. 
 * Abstract base class for blobs, files, local storage and indexedDB content.
 * @constructor
 * @author Emmanuel Puybaret
 */
function LocalURLContent(url) {
  URLContent.call(this, url);
  this.savedContent = null;
}
LocalURLContent.prototype = Object.create(URLContent.prototype);
LocalURLContent.prototype.constructor = LocalURLContent;

/**
 * Returns the content saved on server.
 * @return {URLContent} content on server or <code>null</code> if not saved on server yet 
 */
LocalURLContent.prototype.getSavedContent = function() {
  return this.savedContent;
}

/**
 * Sets the content saved on server.
 * @param {URLContent} savedContent content on server 
 */
LocalURLContent.prototype.setSavedContent = function(savedContent) {
  this.savedContent = savedContent;
}

/**
 * Retrieves asynchronously an URL of this content usable for JavaScript functions with URL paramater.
 * @param  {{urlReady: function, urlError: function}} observer optional observer 
      which <code>urlReady</code> function will be called asynchronously once URL is available. 
 */
LocalURLContent.prototype.getStreamURL = function(observer) {
  throw new UnsupportedOperationException("LocalURLContent abstract class");
}

/**
 * Returns the blob stored by this content, possibly asynchronously if <code>observer</code> parameter is given.
 * @param  {{blobReady: function, blobError: function}} [observer] optional observer 
      which blobReady function will be called asynchronously once blob is available. 
 * @return {Blob} blob content 
 */
LocalURLContent.prototype.getBlob = function(observer) {
  throw new UnsupportedOperationException("LocalURLContent abstract class");
}

/**
 * Writes the blob bound to this content with the request matching <code>writeBlobUrl</code>.
 * @param {string} writeBlobUrl the URL used to save the blob 
             (containing possibly %s which will be replaced by <code>blobName</code>)
 * @param {string|[string]} blobName the name or path used to save the blob, 
             or an array of values used to format <code>writeBlobUrl</code> including blob name
 * @param {blobSaved: function(LocalURLContent, blobName)
           blobError: function} observer called when content is saved or if writing fails
 * @return {abort: function} an object containing <code>abort</code> method to abort the write operation
 */
LocalURLContent.prototype.writeBlob = function(writeBlobUrl, blobName, observer) { 
  var content = this;
  var abortableOperations = [];
  this.getBlob({
      blobReady: function(blob) {
        var formatArguments;        
        if (Array.isArray(blobName)) {
          var firstArg = blobName[0];
          formatArguments = new Array(blobName.length);
          for (var i = 0; i < blobName.length; i++) {
            formatArguments [i] = encodeURIComponent(blobName [i]);
             }
             blobName = firstArg;
        } else {
          formatArguments = encodeURIComponent(blobName);
        }
        var url = CoreTools.format(writeBlobUrl.replace(/(%[^s^\d])/g, "%$1"), formatArguments);
        if (url.indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) === 0) {
          var path = url.substring(url.indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) + LocalStorageURLContent.LOCAL_STORAGE_PREFIX.length);
          var storageKey = decodeURIComponent(path.indexOf('?') > 0 ? path.substring(0, path.indexOf('?')) : path);
          return LocalURLContent.convertBlobToBase64(blob, function(data) {
              try {
                localStorage.setItem(storageKey, data);
                observer.blobSaved(content, blobName);
              } catch (ex) {
                if (observer.blobError !== undefined) {
                  observer.blobError(ex, ex.message);
                }
              }
            });
        } else if (url.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) === 0) {
          // Parse URL of the form indexeddb://database/objectstore?keyPathField=name&contentField=content&dateField=date&name=key
          var databaseNameIndex = url.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) + IndexedDBURLContent.INDEXED_DB_PREFIX.length;
          var slashIndex = url.indexOf('/', databaseNameIndex);
          var questionMarkIndex = url.indexOf('?', slashIndex + 1);
          var databaseName = url.substring(databaseNameIndex, slashIndex);
          var objectStore = url.substring(slashIndex + 1, questionMarkIndex);
          var fields = url.substring(questionMarkIndex + 1).split('&');
          var key = null;
          var keyPathField = null;
          var contentField = null;
          var dateField = null;
          for (var i = 0; i < fields.length; i++) {
            var equalIndex = fields [i].indexOf('=');
            var parameter = fields [i].substring(0, equalIndex);
            var value = fields [i].substring(equalIndex + 1);
            switch (parameter) {
              case "keyPathField": 
                keyPathField = value; 
                break;
              case "contentField": 
                contentField = value; 
                break;
              case "dateField": 
                dateField = value; 
                break;
            }
          }
          // Parse a second time fields to retrieve parameters value (key and other other ones)
          var otherFields = {};
          for (var i = 0; i < fields.length; i++) {
            var equalIndex = fields [i].indexOf('=');
            var parameter = fields [i].substring(0, equalIndex);
            var value = fields [i].substring(equalIndex + 1);
            if (keyPathField === parameter) {
              key = decodeURIComponent(value);
            } else if (parameter.indexOf("Field", parameter.length - "Field".length) === -1) {
              otherFields [parameter] = decodeURIComponent(value);
            }
          }
          
          var databaseUpgradeNeeded = function(ev) { 
              var database = ev.target.result;
              if (!database.objectStoreNames.contains(objectStore)) {
                database.createObjectStore(objectStore, {keyPath: keyPathField});
              } 
            };
          var databaseError = function(ev) { 
              if (observer.blobError !== undefined) {
                observer.blobError(ev.target.errorCode, "Can't connect to database " + databaseName);
              }
            };
          var databaseSuccess = function(ev) {
              var database = ev.target.result; 
              try {
                if (!database.objectStoreNames.contains(objectStore)) {
                  // Reopen the database to create missing object store  
                  database.close(); 
                  var requestUpgrade = indexedDB.open(databaseName, database.version + 1);
                  requestUpgrade.addEventListener("upgradeneeded", databaseUpgradeNeeded);
                  requestUpgrade.addEventListener("error", databaseError);
                  requestUpgrade.addEventListener("success", databaseSuccess);
                } else {
                  var transaction = database.transaction(objectStore, 'readwrite');
                  var store = transaction.objectStore(objectStore);
                  var storedResource = {};
                  storedResource [keyPathField] = key;
                  storedResource [contentField] = blob;
                  if (dateField != null) {
                    storedResource [dateField] = Date.now();
                  }
                  for (var i in otherFields) {
                    storedResource [i] = otherFields [i];
                  }
                  var query = store.put(storedResource);
                  query.addEventListener("error", function(ev) { 
                      if (observer.blobError !== undefined) {
                        observer.blobError(ev.target.errorCode, "Can't store item in " + objectStore);
                      }
                    }); 
                  query.addEventListener("success", function(ev) {
                      observer.blobSaved(content, blobName);
                    }); 
                  transaction.addEventListener("complete", function(ev) { 
                      database.close(); 
                    }); 
                  abortableOperations.push(transaction);
                }
              } catch (ex) {
                if (observer.blobError !== undefined) {
                  observer.blobError(ex, ex.message);
                }
              }
            };
            
          if (indexedDB != null) {
            var request = indexedDB.open(databaseName);
            request.addEventListener("upgradeneeded", databaseUpgradeNeeded);
            request.addEventListener("error", databaseError);
            request.addEventListener("success", databaseSuccess);
          } else {
            observer.blobError(new Error("indexedDB"), "indexedDB unavailable");
          }
        } else {
          var request = new XMLHttpRequest();
          request.open("POST", url, true);
          request.addEventListener('load', function (ev) {
              if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                  observer.blobSaved(content, blobName);
                } else if (observer.blobError !== undefined) {
                  observer.blobError(request.status, request.responseText);
                }
              }
            });
          var errorListener = function(ev) {
              if (observer.blobError !== undefined) {
                observer.blobError(0, "Can't post " + url);
              }
            };
          request.addEventListener("error", errorListener);
          request.addEventListener("timeout", errorListener);
          request.send(blob);
          abortableOperations.push(request);
        }
      },
      blobError: function(status, error) {
         if (observer.blobError !== undefined) {
          observer.blobError(status, error);
        }
      }
    });
    
  return {
      abort: function() {
        for (var i = 0; i < abortableOperations.length; i++) {
          abortableOperations [i].abort();
        }
      }
    };
}

/**
 * @param {Blob} blob
 * @param {function} observer
 * @return {abort: function} an object containing <code>abort</code> method to abort the conversion
 * @private
 */
LocalURLContent.convertBlobToBase64 = function(blob, observer) {
  var reader = new FileReader();
  // Use onload rather that addEventListener for Cordova support
  reader.onload = function() {
      observer(reader.result);
    };
  reader.readAsDataURL(blob);
  return reader;
}

/**
 * Content read from the URL of a <code>Blob</code> instance.
 * Note that this class may also handle a <code>File</code> instance which is a sub type of <code>Blob</code>.
 * @constructor
 * @param {Blob} blob 
 * @author Louis Grignon
 * @author Emmanuel Puybaret
 */
function BlobURLContent(blob) {
  LocalURLContent.call(this, URL.createObjectURL(blob));
  this.blob = blob;
}
BlobURLContent.prototype = Object.create(LocalURLContent.prototype);
BlobURLContent.prototype.constructor = BlobURLContent;

BlobURLContent["__class"] = "com.eteks.sweethome3d.tools.BlobURLContent";
BlobURLContent["__interfaces"] = ["com.eteks.sweethome3d.model.Content"];

BlobURLContent.BLOB_PREFIX = "blob:";

/**
 * Returns an instance of <code>BlobURLContent</code> for the given <code>blob</code>.
 * @param {Blob} blob
 * @return {BlobURLContent}
 */
BlobURLContent.fromBlob = function(blob) { 
  // Check blob content is in cache
  for (var i in URLContent.urlContents) {
    if (URLContent.urlContents [i] instanceof BlobURLContent
        && URLContent.urlContents [i].blob === blob) {
      return URLContent.urlContents [i];
    }
  }
  var content = new BlobURLContent(blob);
  URLContent.urlContents [content.getURL()] = content;
  return content;
}

/**
 * Generates a BlobURLContent instance from an image.
 * @param {HTMLImageElement} image the image to be used as content source
 * @param {string} imageType resulting image blob mime type
 * @param {function(BlobURLContent)} observer callback called when content is ready, with content instance as only parameter
 */
BlobURLContent.fromImage = function(image, imageType, observer) {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0, image.width, image.height);
  if (canvas.msToBlob) {
    observer(BlobURLContent.fromBlob(canvas.msToBlob()));
  } else {
    canvas.toBlob(function (blob) {
        observer(BlobURLContent.fromBlob(blob));
      }, imageType, 0.7);
  }
}

/**
 * Retrieves asynchronously an URL of this content usable for JavaScript functions with URL paramater.
 * @param  {{urlReady: function, urlError: function}} observer optional observer 
      which <code>urlReady</code> function will be called asynchronously once URL is available. 
 */
BlobURLContent.prototype.getStreamURL = function(observer) {
  observer.urlReady(this.getURL());
}

/**
 * Returns the blob stored by this content, possibly asynchronously if <code>observer</code> parameter is given.
 * @param  {{blobReady: function, blobError: function}} [observer] optional observer 
      which blobReady function will be called asynchronously once blob is available. 
 * @return {Blob} blob content 
 */
BlobURLContent.prototype.getBlob = function(observer) {
  if (observer !== undefined) {
    observer.blobReady(this.blob);
  }
  return this.blob;
}


/**
 * Content read from local storage stored in a blob encoded in Base 64.
 * @constructor
 * @param {string} url an URL of the form <code>localstorage://key</code> 
       where <code>key</code> is the key of the blob to read from local storage
 * @ignore
 * @author Emmanuel Puybaret
 */
function LocalStorageURLContent(url) {
  LocalURLContent.call(this, url);
  this.blob = null;
  this.blobUrl = null;
}
LocalStorageURLContent.prototype = Object.create(LocalURLContent.prototype);
LocalStorageURLContent.prototype.constructor = LocalStorageURLContent;

LocalStorageURLContent["__class"] = "com.eteks.sweethome3d.tools.LocalStorageURLContent";
LocalStorageURLContent["__interfaces"] = ["com.eteks.sweethome3d.model.Content"];

LocalStorageURLContent.LOCAL_STORAGE_PREFIX = "localstorage://";

/**
 * Retrieves asynchronously an URL of this content usable for JavaScript functions with URL paramater.
 * @param  {{urlReady: function, urlError: function}} observer optional observer 
      which <code>urlReady</code> function will be called asynchronously once URL is available. 
 */
LocalStorageURLContent.prototype.getStreamURL = function(observer) {
  if (this.blobUrl == null) {
    var urlContent = this;
    this.getBlob({
        blobReady: function(blob) {
          observer.urlReady(urlContent.blobUrl);
        },
        blobError: function(status, error) {
          if (observer.urlError !== undefined) {
            observer.urlError(status, error);
          }
        }
      });
  } else {
    observer.urlReady(this.blobUrl);
  }
}

/**
 * Returns the blob stored by this content.
 * @param  {{blobReady: function, blobError: function}} [observer] optional observer 
      which blobReady function will be called asynchronously once blob is available. 
 * @return {Blob} blob content 
 */
LocalStorageURLContent.prototype.getBlob = function(observer) {
  if (this.blob == null) {
    var url = this.getURL();
    if (url.indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) === 0) {
      var path = url.substring(url.indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) + LocalStorageURLContent.LOCAL_STORAGE_PREFIX.length);
      var key = decodeURIComponent(path.indexOf('?') > 0 ? path.substring(0, path.indexOf('?')) : path);
      var data = localStorage.getItem(key);
      if (data != null) {
        var contentType = data.substring("data:".length, data.indexOf(';'));
        var chars = atob(data.substring(data.indexOf(',') + 1));
        var numbers = new Array(chars.length);
        for (var i = 0; i < numbers.length; i++) {
          numbers[i] = chars.charCodeAt(i);
        }
        var byteArray = new Uint8Array(numbers);
        this.blob = new Blob([byteArray], {type: contentType});
        this.blobUrl = URL.createObjectURL(this.blob);
      } else {
        if (observer.urlError !== undefined) {
          observer.urlError(1, "No key '" + key + "' in localStorage");
        }
      }
    } else {
      if (observer.urlError !== undefined) {
        observer.urlError(1, url + " not a local storage url");
      }
    }
  }
  if (observer !== undefined
      && observer.blobReady !== undefined
      && this.blob != null) {
    observer.blobReady(this.blob);
  }
  return this.blob;
}


/**
 * Content read from IndexedDB stored in a blob.
 * @constructor
 * @param {string} url an URL of the form <code>indexeddb://database/objectstore/field?keyPathField=key</code> 
       where <code>database</code> is the database name, <code>objectstore</code> the object store where 
       the blob is stored in the given <code>field</code> and <code>key</code> the key value  
       of <code>keyPathField</code> used to select the blob. If the database doesn't exist, it will be 
       created with a keyPath equal to <code>keyPathField</code>.
 * @ignore
 * @author Emmanuel Puybaret
 */
function IndexedDBURLContent(url) {
  LocalURLContent.call(this, url);
  this.blob = null;
  this.blobUrl = null;
}
IndexedDBURLContent.prototype = Object.create(LocalURLContent.prototype);
IndexedDBURLContent.prototype.constructor = IndexedDBURLContent;

IndexedDBURLContent["__class"] = "com.eteks.sweethome3d.tools.IndexedDBURLContent";
IndexedDBURLContent["__interfaces"] = ["com.eteks.sweethome3d.model.Content"];

IndexedDBURLContent.INDEXED_DB_PREFIX = "indexeddb://";

/**
 * Retrieves asynchronously an URL of this content usable for JavaScript functions with URL paramater.
 * @param  {{urlReady: function, urlError: function}} observer optional observer 
      which <code>urlReady</code> function will be called asynchronously once URL is available. 
 */
IndexedDBURLContent.prototype.getStreamURL = function(observer) {
  if (this.blobUrl == null) {
    var urlContent = this;
    this.getBlob({
        blobReady: function(blob) {
          observer.urlReady(urlContent.blobUrl);
        },
        blobError: function(status, error) {
          if (observer.urlError !== undefined) {
            observer.urlError(status, error);
          }
        }
      });
  } else {
    observer.urlReady(this.blobUrl);
  }
}

/**
 * Returns the blob stored by this content, reading it asynchronously.
 * @param  {{blobReady: function, blobError: function}} [observer] optional observer 
      which blobReady function will be called asynchronously if blob is not available yet. 
 * @return {Blob} blob content or <code>null</code> if blob wasn't read yet
 */
IndexedDBURLContent.prototype.getBlob = function(observer) {
  if (observer !== undefined) {
    if (this.blob != null) {
      observer.blobReady(this.blob);
    } else {
      var url = this.getURL();
      if (url.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) >= 0) {
         // Parse URL of the form indexeddb://database/objectstore/field?keyPathField=key
        var databaseNameIndex = url.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) + IndexedDBURLContent.INDEXED_DB_PREFIX.length;
        var firstPathSlashIndex = url.indexOf('/', databaseNameIndex);
        var secondPathSlashIndex = url.indexOf('/', firstPathSlashIndex + 1);
        var questionMarkIndex = url.indexOf('?', secondPathSlashIndex + 1);
        var equalIndex = url.indexOf('=', questionMarkIndex + 1);
        var ampersandIndex = url.indexOf('&', equalIndex + 1);
        var databaseName = url.substring(databaseNameIndex, firstPathSlashIndex);
        var objectStore = url.substring(firstPathSlashIndex + 1, secondPathSlashIndex);
        var contentField = url.substring(secondPathSlashIndex + 1, questionMarkIndex);
        var keyPathField = url.substring(questionMarkIndex + 1, equalIndex);
        var key = decodeURIComponent(url.substring(equalIndex + 1, ampersandIndex > 0 ? ampersandIndex : url.length));
        var urlContent = this;
        
        var databaseUpgradeNeeded = function(ev) { 
            var database = ev.target.result;
            if (!database.objectStoreNames.contains(objectStore)) {
              database.createObjectStore(objectStore, {keyPath: keyPathField});
            } 
          };
        var databaseError = function(ev) { 
            if (observer.blobError !== undefined) {
              observer.blobError(ev.target.errorCode, "Can't connect to database " + databaseName);
            }
          };
        var databaseSuccess = function(ev) {
            var database = ev.target.result;
            try {
              if (!database.objectStoreNames.contains(objectStore)) {
                // Reopen the database to create missing object store  
                database.close(); 
                var requestUpgrade = indexedDB.open(databaseName, database.version + 1);
                requestUpgrade.addEventListener("upgradeneeded", databaseUpgradeNeeded);
                requestUpgrade.addEventListener("error", databaseError);
                requestUpgrade.addEventListener("success", databaseSuccess);
              } else {
                var transaction = database.transaction(objectStore, 'readonly'); 
                var store = transaction.objectStore(objectStore); 
                var query = store.get(key); 
                query.addEventListener("error", function(ev) { 
                    if (observer.blobError !== undefined) {
                      observer.blobError(ev.target.errorCode, "Can't query in " + objectStore);
                    }
                  }); 
                query.addEventListener("success", function(ev) {
                    if (ev.target.result !== undefined) {
                      urlContent.blob = ev.target.result [contentField];
                      // Store other properties in blob properties
                      for (var i in ev.target.result) {
                        var propertyName = ev.target.result [i];
                        if (propertyName !== keyPathField
                            && propertyName != contentField
                            && urlContent.blob [propertyName] === undefined) {
                          urlContent.blob [propertyName] = ev.target.result [propertyName]; 
                        }
                      }
                      urlContent.blobUrl = URL.createObjectURL(urlContent.blob);
                      if (observer.blobReady !== undefined) {
                        observer.blobReady(urlContent.blob);
                      }
                    } else if (observer.blobError !== undefined) {
                      observer.blobError(-1, "Blob with key " + key + " not found");
                    }
                  }); 
                transaction.addEventListener("complete", function(ev) { 
                    database.close(); 
                  }); 
              }
            } catch (ex) {
              if (observer.blobError !== undefined) {
                observer.blobError(ex, ex.message);
              }
            }
          };
     
        if (indexedDB != null) {     
          var request = indexedDB.open(databaseName);
          request.addEventListener("upgradeneeded", databaseUpgradeNeeded);
          request.addEventListener("error", databaseError);
          request.addEventListener("success", databaseSuccess);
        } else {
          observer.blobError(new Error("indexedDB"), "indexedDB unavailable");
        }
      } else if (observer.urlError !== undefined) {
        observer.urlError(1, url + " not an indexedDB url");
      }
    }
  }
  return this.blob;
}

/**
 * Returns <code>true</code> if this content URL is available. 
 */
IndexedDBURLContent.prototype.isStreamURLReady = function() {
  return this.blobUrl != null;
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
    var urlContent = URLContent.fromURL(url);
    if (synchronous 
        && !urlContent.isStreamURLReady()) {
      throw new IllegalStateException("Can't run synchronously with unavailable URL");
    }    
    urlContent.getStreamURL({
        urlReady: function(streamUrl) {
          try {
            var request = new XMLHttpRequest();
            request.open('GET', streamUrl, !synchronous);
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
        },
      urlError: function(status, error) {
        if (zipObserver.zipError !== undefined) {
          zipObserver.zipError(error);
        }
      }    
    });
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
 * Returns true if the given image data describes a GIF file.
 * @param {string|Uint8Array} imageData
 * @package
 * @ignore
 */
ZIPTools.isGIFImage = function(imageData) {
  if (imageData.length <= 6) {
    return false;
  } else if (typeof imageData === "string") { 
    return imageData.charAt(0).charCodeAt(0) === 0x47  
        && imageData.charAt(1).charCodeAt(0) === 0x49
        && imageData.charAt(2).charCodeAt(0) === 0x46
        && imageData.charAt(3).charCodeAt(0) === 0x38 
        && (imageData.charAt(4).charCodeAt(0) === 0x37 || imageData.charAt(4).charCodeAt(0) === 0x39)
        && imageData.charAt(5).charCodeAt(0) === 0x61;
  } else {
    return imageData [0] === 0x47  
        && imageData [1] === 0x49
        && imageData [2] === 0x46
        && imageData [3] === 0x38 
        && (imageData [4] === 0x37 || imageData [4] === 0x39)
        && imageData [5] === 0x61;
  }
}

/**
 * Returns true if the given image data describes a BMP file.
 * @param {string|Uint8Array} imageData
 * @package
 * @ignore
 */
ZIPTools.isBMPImage = function(imageData) {
  if (imageData.length <= 2) {
    return false;
  } else if (typeof imageData === "string") {
    return imageData.charAt(0).charCodeAt(0) === 0x42  
        && imageData.charAt(1).charCodeAt(0) === 0x4D;
  } else {
    return imageData [0] === 0x42  
        && imageData [1] === 0x4D;
  }
}

/**
 * Returns true if the given image data describes a JPEG file.
 * @param {string|Uint8Array} imageData
 * @package
 * @ignore
 */
ZIPTools.isJPEGImage = function(imageData) {
  if (imageData.length <= 3) {
    return false;
  } else if (typeof imageData === "string") {
    return imageData.charAt(0).charCodeAt(0) === 0xFF 
      && (imageData.charAt(1).charCodeAt(0) === 0xD8 || imageData.charAt(1).charCodeAt(0) === 0x4F) 
      && imageData.charAt(2).charCodeAt(0) === 0xFF;
  } else {
    return imageData [0] === 0xFF 
      && (imageData [1] === 0xD8 || imageData [1] === 0x4F) 
      && imageData [2] === 0xFF;
  }
}

/**
 * Returns true if the given image data describes a PNG file.
 * @param {string|Uint8Array} imageData
 * @package
 * @ignore
 */
ZIPTools.isPNGImage = function(imageData) {
  if (imageData.length <= 8) {
    return false;
  } else if (typeof imageData === "string") {
    return imageData.charAt(0).charCodeAt(0) === 0x89 
      && imageData.charAt(1).charCodeAt(0) === 0x50 
      && imageData.charAt(2).charCodeAt(0) === 0x4E 
      && imageData.charAt(3).charCodeAt(0) === 0x47 
      && imageData.charAt(4).charCodeAt(0) === 0x0D 
      && imageData.charAt(5).charCodeAt(0) === 0x0A 
      && imageData.charAt(6).charCodeAt(0) === 0x1A 
      && imageData.charAt(7).charCodeAt(0) === 0x0A;
  } else {
    return imageData [0] === 0x89 
      && imageData [1] === 0x50 
      && imageData [2] === 0x4E 
      && imageData [3] === 0x47 
      && imageData [4] === 0x0D 
      && imageData [5] === 0x0A 
      && imageData [6] === 0x1A 
      && imageData [7] === 0x0A;
   }
}

/**
 * Returns true if the given image data describes a transparent PNG file.
 * @param {string} imageData
 * @package
 * @ignore
 */
ZIPTools.isTransparentImage = function(imageData) {
  return ZIPTools.isPNGImage(imageData)
      && imageData.length > 26
      && (imageData.charAt(25).charCodeAt(0) === 4
          || imageData.charAt(25).charCodeAt(0) === 6
          || (imageData.indexOf("PLTE") !== -1 && imageData.indexOf("tRNS") !== -1));
}

/**
 * Returns the folder where a given Javascript .js file was read from.
 * @param {string|RegExp} [script] the URL of a script used in the program  
 * @package
 * @ignore
 */
ZIPTools.getScriptFolder = function(script) {
  if (script === undefined) {
    // Consider this script is always here because ZIPTools itself requires it
    script = "jszip.min.js"; 
  }
  // Search the base URL of this script
  if (typeof document !== "undefined") {
    var scripts = document.getElementsByTagName("script");      
    for (var i = 0; i < scripts.length; i++) {
      if (script instanceof RegExp && scripts[i].src.match(script)
          || typeof script === "string" && scripts[i].src.indexOf(script) !== -1) {
        return scripts[i].src.substring(0, scripts[i].src.lastIndexOf("/") + 1);
      }
    }
    
    if (scripts.length > 0) {
      return scripts[0].src.substring(0, scripts[0].src.lastIndexOf("/") + 1);
    } 
  }
  return "https://www.sweethome3d.com/libjs/";
}
