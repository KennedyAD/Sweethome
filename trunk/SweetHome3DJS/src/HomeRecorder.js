/*
 * HomeRecorder.js
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
//          SweetHome3D.js          

/**
 * Creates a home recorder able to read homes from URLs.
 * @constructor
 * @param {{compressionLevel: number,
 *          includeAllContent: boolean,
 *          writeDataType: string,
 *          writeHomeWithWorker: boolean 
 *         }} [configuration] the recorder configuration
 * @author Emmanuel Puybaret
 */
function HomeRecorder(configuration) {
  this.configuration = configuration !== undefined ? configuration : {};
}

HomeRecorder.READING_HOME = "Reading home";
HomeRecorder.PARSING_HOME = "Parsing home";

/**
 * Reads a home instance from its <code>url</code>.
 * @param {string} url  URL of the read home
 * @param {{homeLoaded: function, homeError: function, progression: function}} observer  The callbacks used to follow the reading of the home 
          (only <code>homeLoaded</code> is mandatory)
 */
HomeRecorder.prototype.readHome = function(url, observer) {
  if (observer.progression !== undefined) {
    observer.progression(HomeRecorder.READING_HOME, url, 0);
  }
  // XML entry where home data is stored is Home.xml, except if url starts with jar: to specify another entry name 
  var homeEntryName = "Home.xml";
  if (url.indexOf("jar:") === 0) {
    var entrySeparatorIndex = url.indexOf("!/");
    homeEntryName = url.substring(entrySeparatorIndex + 2);
    url = url.substring(4, entrySeparatorIndex);
  }
  var recorder = this;
  ZIPTools.getZIP(url,
      {
        zipReady : function(zip) {
          try {
            var homeXmlEntry = zip.file(homeEntryName);
            if (homeXmlEntry !== null) {
              recorder.parseHomeXMLEntry(homeXmlEntry, zip, url, observer);
            } else {
              this.zipError("No " + homeEntryName + " entry in " + url);
            }
          } catch (ex) {
            this.zipError(ex);
          }
        },
        zipError : function(error) {
          if (observer.homeError !== undefined) {
            observer.homeError(error);
          }
        },
        progression : function(part, info, percentage) {
          if (observer.progression !== undefined) {
            observer.progression(HomeRecorder.READING_HOME, url, percentage);
          }
        }
      });
}

/**
 * Parses the content of the given entry to create the home object it contains. 
 * @private
 */
HomeRecorder.prototype.parseHomeXMLEntry = function(homeXmlEntry, zip, zipUrl, observer) {
  var xmlContent = homeXmlEntry.asText();
  if (observer.progression !== undefined) {
    observer.progression(HomeRecorder.READING_HOME, homeXmlEntry.name, 1);
  
    observer.progression(HomeRecorder.PARSING_HOME, homeXmlEntry.name, 0);
  }
  
  var handler = this.getHomeXMLHandler();
  // The handler needs the zip URL for creating the right content URL (see HomeXMLHandler#parseContent)
  handler.homeUrl = zipUrl;
  var saxParser = new SAXParser(handler, handler, handler, handler, handler);
  try {
    // Replace ' by " because SAXParser converts &apos; entities to ' in attributes value too early
    xmlContent = xmlContent.replace(/\'/g, '"');
    saxParser.parseString(xmlContent);
    observer.homeLoaded(handler.getHome());
  } catch (ex) {
    if (observer.homeError !== undefined) {
      observer.homeError(ex);
    }
  }
  
  if (observer.progression !== undefined) {
    observer.progression(HomeRecorder.PARSING_HOME, homeXmlEntry.name, 1);
  }
}

/**
 * Returns a SAX XML handler able to interpret the information contained in the 
 * <code>Home.xml</code> entry.
 * @return {HomeXMLHandler}
 * @protected 
 */
HomeRecorder.prototype.getHomeXMLHandler = function() {
  return new HomeXMLHandler();
}

HomeRecorder.contentDigestsCache = {};

/**
 * Writes asynchronously the given <code>home</code> to a new blob 
 * (or the data matching the array type set in <code>writeDataType</code> configuration attribute, 
 * i.e base64, array, uint8array or arraybuffer).
 * If <code>writeHomeWithWorker</code> configuration attribute is set to <code>true</code>, the data
 * will be generated in a separated worker kept alive between calls to this method.
 * @param {Home}   home saved home
 * @param {string} homeName the home name on the server 
 * @param {{homeSaved: function, homeError: function}} [observer]  The callbacks used to follow the export operation of the home.
 *           homeSaved will receive in its second parameter the data containing the saved home with the resources it needs. 
 * @return {abort: function} a function that will abort writing operation if needed 
 */
HomeRecorder.prototype.writeHome = function(home, homeName, observer) {
  var includeAllContent = this.configuration.includeAllContent !== undefined ? this.configuration.includeAllContent : true;
  var contents = [];
  this.searchContents(home, [], contents);

  var abortedOperation = false;
  var abortableOperation = null;
  if (contents.length > 0) {
    var recorder = this;
    var contentsCopy = contents.slice(0);
    var savedContentNames = {};
    var savedContentIndex = 0;
    for (var i = contentsCopy.length - 1; i >= 0; i--) {
      var content = contentsCopy[i];
      if (content instanceof LocalURLContent
          || content instanceof HomeURLContent
          || content instanceof SimpleURLContent
          || includeAllContent) {
        this.getContentDigest(content, {
            digestReady: function(content, digest) {
              // Check if duplicated content can be avoided
              var duplicatedContentFound = false;
              if (digest !== undefined) {
                for (var url in savedContentNames) {
                  if (content.getURL() !== url
                      && digest === HomeRecorder.contentDigestsCache [url]) {
                    savedContentNames [content.getURL()] = savedContentNames [url];
                    contents.splice(contents.indexOf(content), 1);
                    duplicatedContentFound = true;
                    break;
                  }
                }
              }
      
              if (!duplicatedContentFound) {    
                var subEntryName = "";
                if (content.isJAREntry()) {
                  var entryName = content.getJAREntryName();
                  if (content instanceof HomeURLContent) {
                    var slashIndex = entryName.indexOf('/');
                    // If content comes from a directory of a home file
                    if (slashIndex > 0) {
                      // Retrieve entry name in zipped stream without the directory
                      subEntryName = entryName.substring(slashIndex);
                    }
                  } else if (!(content instanceof SimpleURLContent)) {
                    // Retrieve entry name in zipped stream
                    subEntryName = "/" + entryName;
                  }
                }
              
                // Build a relative URL that points to content object
                var homeContentPath = savedContentIndex++ + subEntryName;
                savedContentNames [content.getURL()] = homeContentPath;
              }
          
              contentsCopy.splice(contentsCopy.indexOf(content), 1);
              if (contentsCopy.length === 0
                  && !abortedOperation) {
                abortableOperation = recorder.writeHomeToZip(home, homeName, contents, savedContentNames, observer);
              }
            },
            digestError: function(status, error) {
              observer.homeError(status, error);
            }    
          });
      } else {
        contents.splice(i, 1);
        contentsCopy.splice(contentsCopy.indexOf(content), 1);
        if (contentsCopy.length === 0
            && !abortedOperation) {
          abortableOperation = recorder.writeHomeToZip(home, homeName, contents, savedContentNames, observer);
        }
      }
    }
  } else {
    abortableOperation = this.writeHomeToZip(home, homeName, contents, {}, observer);
  }

  return {
      abort: function() {
	    abortedOperation = true; 
        if (abortableOperation != null) {
          abortableOperation.abort();
        }
      }
    };
}

/**
 * Writes home to ZIP data. 
 * @param {Home}   home saved home
 * @param {string} homeName the home name on the server 
 * @param {[URLContent]} homeContents
 * @param {{string, string}} savedContentNames
 * @param {{homeSaved: function, homeError: function}} [observer]  The callbacks used to follow the export operation of the home.
 *           homeSaved will receive in its second parameter the data containing the saved home with the resources it needs. 
 * @private
 */
HomeRecorder.prototype.writeHomeToZip = function(home, homeName, homeContents, savedContentNames, observer) {
  var homeClone = home.clone();
  homeClone.setName(homeName);
  
  var writer = new StringWriter(); 
  var exporter = this.getHomeXMLExporter();
  exporter.setSavedContentNames(savedContentNames);
  exporter.writeElement(new XMLWriter(writer), homeClone);

  if ((!OperatingSystem.isInternetExplorer() || homeContents.length == 0)
      && this.configuration.writeHomeWithWorker) {
    // Generate ZIP file in a separate worker
    if (this.writeHomeWorker == null) {
      var blob = new Blob(["importScripts('" + ZIPTools.getScriptFolder() + "jszip.min.js');"
         + "importScripts('" + (document.getElementById('recorder-worker') != null
              ? document.getElementById('recorder-worker').src
              : ZIPTools.getScriptFolder("URLContent.js") + "URLContent.js', '" + ZIPTools.getScriptFolder("HomeRecorder.js") + "HomeRecorder.js") 
         + "');"
         + "onmessage = function(ev) {" 
         + "  new HomeRecorder(ev.data.recorderConfiguration).generateHomeZip("
         + "      ev.data.homeXmlEntry, ev.data.homeContents, ev.data.homeContentTypes, ev.data.savedContentNames, {"
         + "         homeSaved: function(homeXmlEntry, data) {"
         + "            postMessage(data);"
         + "         },"
         + "         homeError: function(status, error) {"
         + "            postMessage({status: status, error: error});"
         + "         }"
         + "    });"
         + "}"], 
         { type: 'text/plain' });
      this.writeHomeWorker = new Worker(URL.createObjectURL(blob));
    }
    var recorder = this;
    var workerListener = function(ev) {
	    recorder.writeHomeWorker.removeEventListener("message", workerListener);
	    if (ev.data.error) {
          observer.homeError(ev.data.status, ev.data.error);
	    } else {
          observer.homeSaved(home, ev.data);
	    }
      };
    this.writeHomeWorker.addEventListener("message", workerListener);
  
    var homeContentTypes = new Array(homeContents.length);
    for (var i = 0; i < homeContents.length; i++) {
      var constructor = Object.getPrototypeOf(homeContents [i]).constructor;
      if (constructor !== undefined && constructor.name !== undefined) {
	    homeContentTypes [i] = constructor.name;
	  } else { // IE 11
	    homeContentTypes [i] = homeContents [i].constructor.toString().match(/function (\w*)/)[1];
	  }
    }    
    this.writeHomeWorker.postMessage({
        recorderConfiguration: this.configuration,
        homeXmlEntry: writer.toString(), 
        homeContents: homeContents, 
        homeContentTypes: homeContentTypes,
        savedContentNames: savedContentNames,
      });
    
    return {
        abort: function() {
	      if (recorder.writeHomeWorker != null) {
            recorder.writeHomeWorker.terminate();
          }
          recorder.writeHomeWorker = null;
        }
      };
  } else {
    this.generateHomeZip(writer.toString(), homeContents, null, savedContentNames, {
        homeSaved: function(homeXmlEntry, data) {
          observer.homeSaved(home, data);
        },
        homeError: function(status, error) {
          observer.homeError(status, error);
        }
      });

    return {
        abort: function() {
        }
      };
  }
}

/**
 * Generates home ZIP data. 
 * @param {Home}   home saved home
 * @param {string} homeName the home name on the server 
 * @param {[URLContent|{}]} homeContents
 * @param {[string]} homeContentTypes
 * @param {{string, string}} savedContentNames
 * @param {{homeSaved: function, homeError: function}} [observer]   
 * @private
 */
HomeRecorder.prototype.generateHomeZip = function(homeXmlEntry, homeContents, homeContentTypes, savedContentNames, observer) {
  var zipOut = new JSZip();
  zipOut.file('Home.xml', homeXmlEntry);
  
  if (homeContents.length > 0) {
    if (homeContentTypes !== null) {
      // Recreate content objects from their type
      for (var i = 0; i < homeContents.length; i++) {
        var savedContentName = savedContentNames [homeContents[i].url];
        switch (homeContentTypes [i]) {
          case "SimpleURLContent":
            homeContents[i] = new SimpleURLContent(homeContents[i].url);
            break;
          case "HomeURLContent":
            homeContents[i] = new HomeURLContent(homeContents[i].url);
            break;
          case "BlobURLContent":
            homeContents[i] = new BlobURLContent(homeContents[i].blob);
            break;
          default:
            homeContents[i] = URLContent.fromURL(homeContents[i].url);
            if (homeContents[i] instanceof LocalStorageURLContent) {
	          observer.homeError(0, "Data from localstorage not supported in workers");
	          return;
            }
            break;
        }
        // Update saved content name from possibly changed URL
        savedContentNames [homeContents[i].getURL()] = savedContentName;
      }
    }
        
    var recorder = this;
    var homeContentsCopy = homeContents.slice(0).reverse();
    for (var i = homeContentsCopy.length - 1; i >= 0; i--) {
      var content = homeContentsCopy[i];
      var contentEntryName = savedContentNames [content.getURL()];
      if (contentEntryName !== undefined) {
        var slashIndex = contentEntryName.indexOf('/');
        if (slashIndex > 0) {
          contentEntryName = contentEntryName.substring(0, slashIndex);
        }
        var contentObserver = {
            contentSaved: function(content) {
              homeContentsCopy.splice(homeContentsCopy.indexOf(content), 1);
              if (homeContentsCopy.length === 0) {
                observer.homeSaved(homeXmlEntry, recorder.generateZip(zipOut));
              }
            }, 
            contentError: function(status, error) {
              observer.homeError(status, error);
            }
          };
        if (!(content instanceof SimpleURLContent)
            && content.isJAREntry()) {
          if (content instanceof HomeURLContent) {
            this.writeHomeZipEntries(zipOut, contentEntryName, content, contentObserver);
          } else {
            this.writeZipEntries(zipOut, contentEntryName, content, contentObserver);
          }
        } else {
          this.writeZipEntry(zipOut, contentEntryName, content, contentObserver);
        }
      }
    }
  } else {
    observer.homeSaved(homeXmlEntry, this.generateZip(zipOut));
  }
}

/**
 * Returns the zipped data in the given paramater.
 * @param {JSZip} [zip] the zip instance containing data
 * @returns the data zipped according to the configuration of this recorder. 
 * @private
 */
HomeRecorder.prototype.generateZip = function(zip) {
  // Supported types: base64, array, uint8array, arraybuffer, blob
  var dataType = this.configuration.writeDataType !== undefined ? this.configuration.writeDataType : "blob";
  var compression = this.configuration.compressionLevel !== undefined && this.configuration.compressionLevel === 0 ? "STORE" : "DEFLATE";
  var compressionLevel = this.configuration.compressionLevel !== undefined ? this.configuration.compressionLevel : 1;
  return zip.generate({
      type:dataType, 
      compression: compression, 
      compressionOptions: {level : compressionLevel}});
}

/**
 * Writes in <code>zipOut</code> stream one or more entries matching the content
 * <code>urlContent</code> coming from a home file.
 * @param {JSZip} zipOut
 * @param {string} entryNameOrDirectory
 * @param {URLContent} urlContent
 * @param {contentSaved: function, contentError: function} contentObserver 
             called when content is saved or if writing fails
 * @private 
 */
HomeRecorder.prototype.writeHomeZipEntries = function(zipOut, entryNameOrDirectory, urlContent, contentObserver) {
  var entryName = urlContent.getJAREntryName();
  var slashIndex = entryName.indexOf('/');
  // If content comes from a directory of a home file
  if (slashIndex > 0) {
    var zipUrl = urlContent.getJAREntryURL();
    var entryDirectory = entryName.substring(0, slashIndex + 1);
    var recorder = this;
    URLContent.fromURL(urlContent.getJAREntryURL()).getStreamURL({
        urlReady: function(url) {
          ZIPTools.getZIP(url, false, 
            {
              zipReady : function(zip) {
                try {
                  var entries = zip.file(new RegExp(entryDirectory + ".*")).reverse();
                  for (var i = entries.length - 1; i >= 0 ; i--) {
                    var zipEntry = entries [i];
                    var siblingContent = new URLContent("jar:" + zipUrl + "!/" 
                        + encodeURIComponent(zipEntry.name).replace("+", "%20"));
                    recorder.writeZipEntry(zipOut, entryNameOrDirectory + zipEntry.name.substring(slashIndex), siblingContent, 
                        {
                          zipEntry: zipEntry, 
                          contentSaved: function(content) {
                            entries.splice(entries.indexOf(this.zipEntry), 1);
                            if (entries.length === 0) {
                              contentObserver.contentSaved(urlContent);
                            }
                          }, 
                          contentError: function(status, error) {
                            contentObserver.contentError(status, error);
                          }
                        });
                  }            
                } catch (ex) {
                  this.zipError(ex);
                }
              },
              zipError : function(error) {
                contentObserver.contentError(0, error.message);
            }
          });
        },
        urlError: function(status, error) {
          contentObserver.contentError(status, error);
        }    
      });
  } else {
    this.writeZipEntry(zipOut, entryNameOrDirectory, urlContent, contentObserver);
  }
}

/**
 * Writes in <code>zipOut</code> stream all the sibling files of the zipped
 * <code>urlContent</code>.
 * @param {JSZip} zipOut
 * @param {string} directory
 * @param {URLContent} urlContent
 * @param {contentSaved: function, contentError: function} contentObserver 
             called when content is saved or if writing fails
 * @private 
 */
HomeRecorder.prototype.writeZipEntries = function(zipOut, directory, urlContent, contentObserver) {
  var recorder = this;
  URLContent.fromURL(urlContent.getJAREntryURL()).getStreamURL({
      urlReady: function(url) {
        ZIPTools.getZIP(url, false,
          {
            zipReady : function(zip) {
              try {
                var entries = zip.file(/.*/).reverse();
                for (var i = entries.length - 1; i >= 0 ; i--) {
                  var zipEntry = entries [i];
                  var siblingContent = new URLContent("jar:" + urlContent.getJAREntryURL() + "!/" 
                      + encodeURIComponent(zipEntry.name).replace("+", "%20"));
                  recorder.writeZipEntry(zipOut, directory + "/" + zipEntry.name, siblingContent, 
                     { 
                        zipEntry: zipEntry,  
                        contentSaved: function(content) {
                          entries.splice(entries.indexOf(this.zipEntry), 1);
                          if (entries.length === 0) {
                            contentObserver.contentSaved(urlContent);
                          }
                        }, 
                        contentError: function(status, error) {
                          contentObserver.contentError(status, error);
                        }
                     });
                }            
              } catch (ex) {
                this.zipError(ex);
              }
            },
            zipError : function(error) {
              contentObserver.contentError(0, error.message);
          }
        });
      },
      urlError: function(status, error) {
        contentObserver.contentError(status, error);
      }    
    });
}

/**
 * Writes in <code>zipOut</code> stream a new entry named <code>entryName</code> that
 * contains a given <code>content</code>.
 * @param {JSZip} zipOut
 * @param {string} entryName
 * @param {URLContent} content
 * @param {contentSaved: function, contentError: function} contentObserver 
             called when contents is saved or if writing fails
 * @private 
 */
HomeRecorder.prototype.writeZipEntry = function(zipOut, entryName, content, contentObserver) {
  content.getStreamURL({
      urlReady: function(url) {
        if (url.indexOf("jar:") === 0) {
          var entrySeparatorIndex = url.indexOf("!/");
          var contentEntryName = decodeURIComponent(url.substring(entrySeparatorIndex + 2));
          var jarUrl = url.substring(4, entrySeparatorIndex);
          ZIPTools.getZIP(jarUrl, false,
            {
              zipReady : function(zip) {
                try {
                  var contentEntry = zip.file(contentEntryName);
                  zipOut.file(entryName, contentEntry.asBinary(), {binary: true});
                  contentObserver.contentSaved(content);
                } catch (ex) {
                  this.zipError(ex);
                }
              },
              zipError : function(error) {
                contentObserver.contentError(0, error.message);
            }
          });
        } else {
          var request = new XMLHttpRequest();
          request.open("GET", url, true);
          request.responseType = "arraybuffer";
          request.addEventListener("load", function() {
              zipOut.file(entryName, request.response);
              contentObserver.contentSaved(content);
            });
          request.send();
        }
      },
      urlError: function(status, error) {
        contentObserver.contentError(status, error);
      }    
    });
}

/**
 * Returns a XML exporter able to generate a XML content.
 * @return {HomeXMLExporter}
 * @protected 
 */
HomeRecorder.prototype.getHomeXMLExporter = function() {
  return new HomeXMLExporter();
}

/**
 * Searchs all the contents referenced by the given <code>object</code>.
 * @param {Object} object the object root
 * @param {Array}  homeObjects array used to track already seeked objects
 * @param {Array}  contents array filed with unsaved content
 * @param {function} [acceptContent] a function returning <code>false</code> if its parameter is not an interesting content  
 * @private 
 */
HomeRecorder.prototype.searchContents = function(object, homeObjects, contents, acceptContent) {
  if (Array.isArray(object)) {
    for (var i = 0; i < object.length; i++) {
      this.searchContents(object[i], homeObjects, contents, acceptContent);
    }
  } else if (object instanceof URLContent
             && (acceptContent === undefined || acceptContent(object))) {
    for (var i = 0; i < contents.length; i++) {
      if (contents [i].getURL() == object.getURL()) {
        return;
      }
    }
    contents.push(object);
  } else if (object != null 
             && typeof object !== 'number'
             && typeof object !== 'string'
             && typeof object !== 'boolean'
             && typeof object !== 'function'
             && !(object instanceof URLContent)
             && homeObjects.indexOf(object) < 0) {
    homeObjects.push(object);
    var propertyNames = Object.getOwnPropertyNames(object);
    for (var j = 0; j < propertyNames.length; j++) {
      var propertyName = propertyNames[j];
      if (propertyName == "object3D"
          || object.constructor 
              && object.constructor.__transients 
              && object.constructor.__transients.indexOf(propertyName) != -1) {
        continue;
      }
      var propertyValue = object[propertyName];
      this.searchContents(propertyValue, homeObjects, contents, acceptContent);
    }
  }
}

/**
 * Returns asynchronously the SHA-1 digest of the given content.
 * @param {URLContent} content
 * @param {digestReady: function, digestError: function} digestObserver
 * @ignored
 */
HomeRecorder.prototype.getContentDigest = function(content, digestObserver) {
  var abortableOperations = {};
  var contentDigest = HomeRecorder.contentDigestsCache [content.getURL()];
  if (contentDigest === undefined) {
    var recorder = this;
    if (content.isJAREntry()) {
      ZIPTools.getZIP(content.getJAREntryURL(), false, {
          zipReady : function(zip) {
            try {
              var entryName = content.getJAREntryName();
              var slashIndex = content instanceof HomeURLContent
                  ? entryName.indexOf('/')
                  : -1;
              var entryDirectory = entryName.substring(0, slashIndex + 1);
              var contentData = new Uint8Array(0);
              var entries = slashIndex > 0 || !(content instanceof HomeURLContent) 
                  ? zip.file(new RegExp(entryDirectory + ".*")).sort(function(entry1, entry2) { return entry1.name < entry2.name }) // Reverse order
                  : [zip.file(entryName)];
              
              for (var i = entries.length - 1; i >= 0 ; i--) {
                var zipEntry = entries [i];
                if (zipEntry.name !== entryDirectory
                    && recorder.isSignificant(zipEntry.name)) {
                  // Append entry data to contentData
                  var binaryString = zipEntry.asBinary();
                  var data = new Uint8Array(contentData.length + binaryString.length);
                  data.set(contentData);
                  for (var j = 0; j < binaryString.length; j++) {
                    data [contentData.length + j] = binaryString.charCodeAt(j);
                  }
                  contentData = data;
                }
              }   
              
              recorder.computeContentDigest(contentData, function(digest) {
                  HomeRecorder.contentDigestsCache [content.getURL()] = digest;
                  digestObserver.digestReady(content, digest);
                });              
            } catch (ex) {
              this.zipError(ex);
            }
        },
        zipError : function(error) {
          digestObserver.digestError(0, error.message);
        }
      });
    } else {
      content.getStreamURL({
          urlReady: function(url) {
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";
            request.addEventListener("load", function() {
                recorder.computeContentDigest(request.response, function(digest) {
                    HomeRecorder.contentDigestsCache [content.getURL()] = digest;
                    digestObserver.digestReady(content, digest);
                  });
              });
            request.send();
          },
          urlError: function(status, error) {
            digestObserver.digestError(status, error);
          }    
        });
    }
  } else {
    digestObserver.digestReady(content, contentDigest);
  }
}

/**
 * Computes the digest of the given data and calls <code>observer</code> when digest is ready. 
 * @param {Uint8Array} contentData
 * @param {function} observer callback which will receive in parameter the SHA-1 digest of contentData in Base64
 * @private
 */
HomeRecorder.prototype.computeContentDigest = function(contentData, observer) {
  var crypto = window.msCrypto !== undefined ? window.msCrypto : window.crypto;
  var digest;
  try {
    digest = crypto.subtle.digest("SHA-1", contentData);
  } catch (ex) {
    // Use SHA-256 instead even if secured hash is not needed here
    digest = crypto.subtle.digest("SHA-256", contentData);
  }
  if (digest.then !== undefined) { 
    digest.then(function(hash) {
        observer(btoa(String.fromCharCode.apply(null, new Uint8Array(hash))));
      });
  } else { 
    // IE 11 digest.result is available without promise support but only after a call to setTimeout 
    setTimeout(function() {
        observer(btoa(String.fromCharCode.apply(null, new Uint8Array(digest.result))));      
      });
  }
}

/**
 * Returns <code>true</code> if entry name is significant to distinguish
 * the data of a content from an other one. 
 * @param {string} entryName
 * @return {boolean} 
 * @private
 */
HomeRecorder.prototype.isSignificant = function(entryName) {
  // Ignore LICENSE.TXT files
  var entryNameUpperCase = entryName.toUpperCase();
  return entryNameUpperCase !== "LICENSE.TXT"
        && entryNameUpperCase.indexOf("/LICENSE.TXT", entryNameUpperCase.length - "/LICENSE.TXT".length) === -1;
}
