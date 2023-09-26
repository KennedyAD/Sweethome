/*
 * DirectHomeRecorder.js
 *
 * Sweet Home 3D, Copyright (c) 2023 Emmanuel PUYBARET / eTeks <info@eteks.com>
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

// Requires jszip.min.js
//          URLContent.js
//          big.js

/**
 * Creates a home recorder able to save homes and its resources directly on server, 
 * in local storage or in indexedDB.
 * @constructor
 * @param {{readHomeURL: string,
 *          writeHomeURL: string,
 *          writeResourceURL: string,
 *          readResourceURL: string,
 *          listHomesURL: string,
 *          deleteHomeURL: string,
 *          compressionLevel: number,
 *          writeHomeWithWorker: boolean
 *         }} [configuration] the recorder configuration
 * @author Emmanuel Puybaret
 */
function DirectHomeRecorder(configuration) {
  HomeRecorder.call(this, configuration);
}
DirectHomeRecorder.prototype = Object.create(HomeRecorder.prototype);
DirectHomeRecorder.prototype.constructor = DirectHomeRecorder;

/**
 * Reads a home with this recorder.
 * @param {string} homeName the home name on the server 
 *                          or the URL of the home if <code>readHomeURL</code> service is missing 
 * @param {{homeLoaded: function, homeError: function, progression: function}} observer  callbacks used to follow the reading of the home 
 */
DirectHomeRecorder.prototype.readHome = function(homeName, observer) {
  if (this.configuration.readHomeURL !== undefined) {
    // Replace % sequence by %% except %s before formating readHomeURL with home name 
    var readHomeUrl = CoreTools.format(this.configuration.readHomeURL.replace(/(%[^s])/g, "%$1"), encodeURIComponent(homeName));
    var querySeparator = readHomeUrl.indexOf('?') != -1 ? '&' : '?';
    readHomeUrl += querySeparator + "editionId=" + HomeObject.createId("home");
    homeName = readHomeUrl;
  }
  HomeRecorder.prototype.readHome.call(this, homeName, observer);
}

/**
 * Writes a home instance using <code>writeHomeURL</code> and <code>writeResourceURL</code> URLs in configuration.
 * @param {Home}   home saved home
 * @param {string} homeName the home name on the server 
 * @param {{homeSaved: function, homeError: function}} [observer]  The callbacks used to follow the writing operation of the home
 * @return {abort: function} a function that will abort writing operation if needed 
 */
DirectHomeRecorder.prototype.writeHome = function(home, homeName, observer) {
  var localContents = [];
  // Keep only local contents which have to be saved
  this.searchContents(home, [], localContents, function(content) {
      return content instanceof LocalURLContent
          || (content.isJAREntry() && URLContent.fromURL(content.getJAREntryURL()) instanceof LocalURLContent);
    });
  
  var abortableOperations = [];
  var recorder = this;
  var contentsObserver = {
      contentsSaved: function(savedContentNames) {
        // Search contents included in home
        var homeContents = []
        recorder.searchContents(home, [], homeContents, function(content) {
            return content instanceof HomeURLContent
                || content instanceof SimpleURLContent;
          });

        var savedContentIndex = 0; 
        for (var i = 0; i < homeContents.length; i++) {
          var content = homeContents[i];
          if (content instanceof HomeURLContent) {
            var entry = content.getJAREntryName();
            if (entry.indexOf('/') < 0) {
              savedContentNames [content.getURL()] = (++savedContentIndex).toString();
            } else {
              savedContentNames [content.getURL()] = (++savedContentIndex) + entry.substring(entry.indexOf('/'));
            }
          } else if (content instanceof SimpleURLContent
                     && content.isJAREntry()
                     && URLContent.fromURL(content.getJAREntryURL()) instanceof LocalURLContent) {
            savedContentNames [content.getURL()] = (++savedContentIndex).toString();
          }
        }

        abortableOperations.push(recorder.writeHomeToZip(home, homeName, homeContents, savedContentNames, "blob", {
            homeSaved: function(home, data) {
              var content = new BlobURLContent(data);
              var revokeOperation = {
                  abort: function() {
                    // Don't keep blob URL in document
                    URL.revokeObjectURL(content.getURL());
                  }
                };
              abortableOperations.push(
                 content.writeBlob(recorder.configuration.writeHomeURL, homeName, 
                   {
                     blobSaved: function(content, name) {
                       revokeOperation.abort();
                       if (observer != null 
                           && observer.homeSaved != null) {
                         observer.homeSaved(home);
                       }
                     },
                     blobError: function(status, error) {
                       revokeOperation.abort();
                       if (observer != null 
                           && observer.homeError != null) {
                         observer.homeError(status, error);
                       }
                     }
                   }));
              abortableOperations.push(revokeOperation);
            },
            homeError: function(status, error) {
              if (observer != null 
                  && observer.homeError != null) {
                observer.homeError(status, error);
              }
            }
          }));    
      },
      contentsError: function(status, error) {
        if (observer != null 
            && observer.homeError != null) {
          observer.homeError(status, error);
        };
      }
    };
  
  if (this.configuration.writeResourceURL !== undefined
      && this.configuration.readResourceURL !== undefined) {
    abortableOperations.push(this.saveContents(localContents, contentsObserver));
  } else {
    contentsObserver.contentsSaved({});
  }
  return {
      abort: function() {
        for (var i = 0; i < abortableOperations.length; i++) {
          abortableOperations [i].abort();
        }
      }
    };
}

/**
 * Saves blob contents which are not saved.
 * @param {Array}  localContents array of possibly unsaved contents
 * @param {contentsSaved: function, contentsError: function} contentsObserver 
             called when contents are saved or if writing fails
 * @return {abort: function} an object containing <code>abort</code> method to abort the write operations  
 * @private 
 */
DirectHomeRecorder.prototype.saveContents = function(localContents, contentsObserver) {
  var abortableOperations = {};
  var savedContents = {};
  var savedContentNames = {};
  var autoRecoveryObjectstore = "/Recovery";
  if (this.configuration.autoRecoveryObjectstore !== undefined) {
    autoRecoveryObjectstore = "/" + this.configuration.autoRecoveryObjectstore;
  }
  var recorder = this;
  localContents = localContents.slice(0);
  for (var i = localContents.length - 1; i >= 0; i--) {
    var localContent = localContents [i];
    var localUrlContent = localContent.isJAREntry() 
        ? URLContent.fromURL(localContent.getJAREntryURL())
        : localContent;
    if (  (!(localUrlContent instanceof LocalStorageURLContent)
             || this.configuration.writeResourceURL.indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) < 0)
          && (!(localUrlContent instanceof IndexedDBURLContent)
              || this.configuration.writeResourceURL.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) < 0)
        || (localUrlContent instanceof IndexedDBURLContent
            && (this.configuration.writeResourceURL.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) < 0
                || this.configuration.writeResourceURL.indexOf(autoRecoveryObjectstore) < 0)
            && localUrlContent.getURL().indexOf(autoRecoveryObjectstore) > 0)) {
      if (localUrlContent.getSavedContent() == null
          || localUrlContent.getSavedContent().getURL().indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) === 0
              && this.configuration.writeResourceURL.indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) < 0
          || localUrlContent.getSavedContent().getURL().indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) === 0
              && (this.configuration.writeResourceURL.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) < 0
                  || this.configuration.writeResourceURL.indexOf(autoRecoveryObjectstore) < 0
                     && localUrlContent.getSavedContent().getURL().indexOf(autoRecoveryObjectstore) > 0)) {
        var savedContent = savedContents [localUrlContent.getURL()];
        if (savedContent != null) {
          localUrlContent.setSavedContent(savedContent);
          localContents.splice(i, 1);  
        } else {
          localUrlContent.setSavedContent(null); // Prefer to store resource on server if in local storage or indexedDB
          localUrlContent.getBlob({
              localContent: localContent,
              blobReady: function(blob) {
                var extension = "dat";
                if (blob.type == "image/png") {
                  extension = "png";
                } else if (blob.type == "image/jpeg") {
                  extension = "jpg";
                }
                var contentFileName = UUID.randomUUID() + '.' + extension;
                var observer = {
                    handledContent: this.localContent,
                    blobSaved: function(content, contentFileName) {
                      if (content.getSavedContent() == null
                          || content.getSavedContent().getURL().indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) === 0
                             && (recorder.configuration.writeResourceURL.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) < 0
                                 || recorder.configuration.writeResourceURL.indexOf(autoRecoveryObjectstore) < 0
                                    && content.getSavedContent().getURL().indexOf(autoRecoveryObjectstore) > 0)) {
                        var savedContent = URLContent.fromURL(
                            CoreTools.format(recorder.configuration.readResourceURL.replace(/(%[^s])/g, "%$1"), encodeURIComponent(contentFileName)));
                        content.setSavedContent(savedContent);
                        savedContents [content.getURL()] = savedContent;
                      }
                      savedContentNames [this.handledContent.getURL()] = this.handledContent.isJAREntry() 
                          ? "jar:" + content.getSavedContent().getURL() + "!/" + this.handledContent.getJAREntryName()
                          : content.getSavedContent().getURL(); 
                      delete abortableOperations [contentFileName];
                      localContents.splice(localContents.lastIndexOf(this.handledContent), 1);  
                      if (localContents.length === 0) {
                        contentsObserver.contentsSaved(savedContentNames);
                      }
                    },
                    blobError: function(status, error) {
                      contentsObserver.contentsError(status, error);
                    }
                  };
                
                abortableOperations [contentFileName] = localUrlContent.writeBlob(recorder.configuration.writeResourceURL, contentFileName, observer);
              },
              blobError: function(status, error) {
                contentsObserver.contentsError(status, error);
              }
            });
        }
      } else {
        savedContentNames [localContent.getURL()] = localContent.isJAREntry() 
            ? "jar:" + localUrlContent.getSavedContent().getURL() + "!/" + localContent.getJAREntryName()
            : localUrlContent.getSavedContent().getURL();
        localContents.splice(i, 1);  
      }
    } else {
      localContents.splice(i, 1);  
    }
  }
  
  if (localContents.length === 0) {
    contentsObserver.contentsSaved(savedContentNames);
  }
  return {
      abort: function() {
        for (var i in abortableOperations) {
          abortableOperations [i].abort();
        }
      }
    };
}

/**
 * Requests the available homes on server.
 * @param {availableHomes: function, homesError: function} observer
 * @return {abort: function} a function that will abort request 
 *                           or <code>null</code> if no request was performed  
 */
DirectHomeRecorder.prototype.getAvailableHomes = function(observer) {
  if (this.configuration.listHomesURL !== undefined) {
    var url = this.configuration.listHomesURL;
    if (url.indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) === 0) {
      // Parse URL of the form localstorage:regExpWithCapturingGroup
      var path = url.substring(url.indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) + LocalStorageURLContent.LOCAL_STORAGE_PREFIX.length);
      var regExp = new RegExp(path.indexOf('?') > 0 ? path.substring(0, path.indexOf('?')) : path);
      var propertyNames = Object.getOwnPropertyNames(localStorage);
      var homes = [];
      for (var i = 0; i < propertyNames.length; i++) {
        var tags = propertyNames [i].match(regExp);
        if (tags) {
          homes.push(tags.length > 1 ? tags [1] : tags [0]);
        }
      }
      observer.availableHomes(homes);
      return {abort: function() {  } };
    } else if (url.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) === 0) {
      // Parse URL of the form indexeddb://database/objectstore?keyPathField=regExpWithCapturingGroup
      var databaseNameIndex = url.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) + IndexedDBURLContent.INDEXED_DB_PREFIX.length;
      var firstPathSlashIndex = url.indexOf('/', databaseNameIndex);
      var questionMarkIndex = url.indexOf('?', firstPathSlashIndex + 1);
      var equalIndex = url.indexOf('=', questionMarkIndex + 1);
      var ampersandIndex = url.indexOf('&', equalIndex + 1);
      var databaseName = url.substring(databaseNameIndex, firstPathSlashIndex);
      var objectStore = url.substring(firstPathSlashIndex + 1, questionMarkIndex);
      var keyPathField = url.substring(questionMarkIndex + 1, equalIndex);
      var regExp = new RegExp(url.substring(equalIndex + 1, ampersandIndex > 0 ? ampersandIndex : url.length));

      var databaseUpgradeNeeded = function(ev) { 
          var database = ev.target.result; 
          if (!database.objectStoreNames.contains(objectStore)) {
            database.createObjectStore(objectStore, {keyPath: keyPathField});
          } 
        };
      var databaseError = function(ev) { 
          if (observer.homesError !== undefined) {
            observer.homesError(ev.target.errorCode, "Can't connect to database " + databaseName);
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
              var query;
              if (IDBObjectStore.prototype.getAllKeys !== undefined) {
                query = store.getAllKeys(); 
                query.addEventListener("success", function(ev) {
                    var homes = [];
                    for (var i = 0; i < ev.target.result.length; i++) {
                      var tags = ev.target.result [i].match(regExp);
                      if (tags) {
                        homes.push(tags.length > 1 ? tags [1] : tags [0]);
                      }
                    }
                    observer.availableHomes(homes);
                  });
              } else {
                query = store.openCursor();
                var homes = [];
                query.addEventListener("success", function(ev) {
                    var cursor = ev.target.result;
                    if (cursor != null) {
                      var tags = cursor.primaryKey.match(regExp);
                      if (tags) {
                        homes.push(tags.length > 1 ? tags [1] : tags [0]);
                      }
                      cursor ["continue"]();
                    } else {
                      observer.availableHomes(homes);
                    }                    
                  });
              }  
              query.addEventListener("error", function(ev) { 
                  if (observer.homesError !== undefined) {
                    observer.homesError(ev.target.errorCode, "Can't query in " + objectStore);
                  }
                }); 
              transaction.addEventListener("complete", function(ev) { 
                  database.close(); 
                });
            } 
          } catch (ex) {
            if (observer.homesError !== undefined) {
              observer.homesError(ex, ex.message);
            }
          }
        };
        
      if (indexedDB != null) {
        var request = indexedDB.open(databaseName);
        request.addEventListener("upgradeneeded", databaseUpgradeNeeded);
        request.addEventListener("error", databaseError);
        request.addEventListener("success", databaseSuccess);
      } else if (observer.homesError !== undefined) {
        observer.homesError(new Error("indexedDB"), "indexedDB unavailable");
      }
      return {abort: function() {  } };
    } else {
      var request = new XMLHttpRequest();
      var querySeparator = url.indexOf('?') != -1 ? '&' : '?';
      request.open("GET", url + querySeparator + "requestId=" + UUID.randomUUID(), true); 
      request.addEventListener("load", function(ev) {
          if (request.readyState === XMLHttpRequest.DONE
              && request.status === 200) {
            observer.availableHomes(JSON.parse(request.responseText));
          } else if (observer.homesError !== undefined) {
            observer.homesError(request.status, request.responseText);
          }
        });
      if (observer.homesError !== undefined) {
        var errorListener = function(ev) {
            observer.homesError(0, ev);
          };
        request.addEventListener("error", errorListener);
        request.addEventListener("timeout", errorListener);
      }
      request.send();
      return request;
    }
  } else {
    return null;
  }
}

/**
 * Deletes on server a home from its name.
 * @param {string} homeName
 * @param {homeDeleted: function, homeError: function} observer
 * @return {abort: function} a function that will abort deletion 
 *                           or <code>null</code> if no deletion was performed  
 */
DirectHomeRecorder.prototype.deleteHome = function(homeName, observer) {
  if (this.configuration.deleteHomeURL !== undefined) {
    var url = CoreTools.format(this.configuration.deleteHomeURL.replace(/(%[^s])/g, "%$1"), encodeURIComponent(homeName));
    if (url.indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) === 0) {
      // Parse URL of the form localstorage:key
      var path = url.substring(url.indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) + LocalStorageURLContent.LOCAL_STORAGE_PREFIX.length);
      var storageKey = decodeURIComponent(path.indexOf('?') > 0 ? path.substring(0, path.indexOf('?')) : path);
      localStorage.removeItem(storageKey);
      observer.homeDeleted(homeName);
      return {abort: function() {  } };
    } else if (url.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) === 0) {
      // Parse URL of the form indexeddb://database/objectstore?keyPathField=key
      var databaseNameIndex = url.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) + IndexedDBURLContent.INDEXED_DB_PREFIX.length;
      var firstPathSlashIndex = url.indexOf('/', databaseNameIndex);
      var questionMarkIndex = url.indexOf('?', firstPathSlashIndex + 1);
      var equalIndex = url.indexOf('=', questionMarkIndex + 1);
      var ampersandIndex = url.indexOf('&', equalIndex + 1);
      var databaseName = url.substring(databaseNameIndex, firstPathSlashIndex);
      var objectStore = url.substring(firstPathSlashIndex + 1, questionMarkIndex);
      var keyPathField = url.substring(questionMarkIndex + 1, equalIndex);
      var key = decodeURIComponent(url.substring(equalIndex + 1, ampersandIndex > 0 ? ampersandIndex : url.length));
      
      var databaseUpgradeNeeded = function(ev) { 
          var database = ev.target.result; 
          if (!database.objectStoreNames.contains(objectStore)) {
            database.createObjectStore(objectStore, {keyPath: keyPathField});
          } 
        };
      var databaseError = function(ev) { 
          if (observer.homeError !== undefined) {
            observer.homeError(ev.target.errorCode, "Can't connect to database " + databaseName);
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
              var query = store["delete"](key); 
              query.addEventListener("error", function(ev) { 
                  if (observer.homeError !== undefined) {
                    observer.homeError(ev.target.errorCode, "Can't delete in " + objectStore);
                  }
                }); 
              query.addEventListener("success", function(ev) {
                  observer.homeDeleted(homeName);
                }); 
              transaction.addEventListener("complete", function(ev) { 
                  database.close(); 
                });
            } 
          } catch (ex) {
            if (observer.homeError !== undefined) {
              observer.homeError(ex, ex.message);
            }
          }
        };
        
      if (indexedDB != null) {
        var request = indexedDB.open(databaseName);
        request.addEventListener("upgradeneeded", databaseUpgradeNeeded);
        request.addEventListener("error", databaseError);
        request.addEventListener("success", databaseSuccess);
      } else if (observer.homeError !== undefined) {
        observer.homeError(new Error("indexedDB"), "indexedDB unavailable");
      }
      return {abort: function() {  } };
    } else {
      // Replace % sequence by %% except %s before formating readHomeURL with home name 
      if (url.indexOf("?") > 0) {
        url += "&requestId=" + UUID.randomUUID();
      }
      var request = new XMLHttpRequest();
      request.open("GET", url, true); 
      request.addEventListener("load", function(ev) {
          if (request.readyState === XMLHttpRequest.DONE
              && request.status === 200) {
            observer.homeDeleted(homeName);
          } else if (observer.homeError !== undefined) {
            observer.homeError(request.status, request.responseText);
          }
        });
      if (observer.homeError !== undefined) {
        var errorListener = function(ev) {
            observer.homeError(0, ev);
          };
        request.addEventListener("error", errorListener);
        request.addEventListener("timeout", errorListener);
      }
      request.send();
      return request;
    }
  } else {
    return null;
  }
}
