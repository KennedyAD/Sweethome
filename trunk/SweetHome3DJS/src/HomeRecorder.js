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
  // An observer which will replace home contents by permanent content or content in recovery if it exists
  var contentObserver = {
      homeLoaded: function(home) {
        var homeContents = [];
        recorder.searchContents(home, [], homeContents, function(content) {
            return content instanceof HomeURLContent;
          });
        // Compute digest for home contents
        if (homeContents.length > 0) {
          var contentDigestManager = ContentDigestManager.getInstance();
          for (var i = 0; i < homeContents.length; i++) {
            contentDigestManager.getContentDigest(homeContents [i], {
                digestReady: function(content, digest) {
                  homeContents.splice(content, 1);
                  if (homeContents.length === 0) {
                    recorder.searchContents(home, [], homeContents, 
                        function(content) {
                          return content instanceof HomeURLContent;
                        }, 
                        function(content) {
                          var permanentContent = contentDigestManager.getPermanentContentDigest(content);
                          return permanentContent != null ? permanentContent : content;
                        });
                    observer.homeLoaded(home);                    
                  }
                },
                digestError: function(status, error) {
                  if (observer.homeError !== undefined) {
                    observer.homeError(error);
                  }
                }    
              });
          }
        } else {
          observer.homeLoaded(home);
        }     
      }, 
      homeError: function(error){
        if (observer.homeError !== undefined) {
          observer.homeError(error);
        }
      }, 
      progression: function(part, info, percentage) {
        if (observer.progression !== undefined) {
            observer.progression(percentage);
        }
      }
    };
  ZIPTools.getZIP(url,
      {
        zipReady : function(zip) {
          try {
            var homeXmlEntry = zip.file(homeEntryName);
            if (homeXmlEntry !== null) {
              recorder.parseHomeXMLEntry(homeXmlEntry, zip, url, typeof ContentDigestManager === "undefined" 
                  ? observer : contentObserver);
            } else {
              this.zipError(new Error("No " + homeEntryName + " entry in " + url));
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

/**
 * Writes asynchronously the given <code>home</code> to a new blob 
 * (or the data matching the array type set in <code>writeDataType</code> configuration attribute, 
 * i.e base64, array, uint8array or arraybuffer).
 * If <code>writeHomeWithWorker</code> configuration attribute is set to <code>true</code>, the data
 * will be generated in a separated worker kept alive between calls to this method.
 * @param {Home}   home saved home
 * @param {string} homeName the home name on the server 
 * @param {{homeSaved: function, homeError: function}} observer  The callbacks used to follow the export operation of the home.
 *           homeSaved will receive in its second parameter the data containing the saved home with the resources it needs. 
 * @return {abort: function} a function that will abort writing operation if needed 
 */
HomeRecorder.prototype.writeHome = function(home, homeName, observer) {
  var includeAllContent = this.configuration.includeAllContent !== undefined ? this.configuration.includeAllContent : true;
  var dataType = this.configuration.writeDataType !== undefined ? this.configuration.writeDataType : "blob";
  var contents = [];
  this.searchContents(home, [], contents);

  var abortedOperation = false;
  var abortableOperation = null;
  if (contents.length > 0) {
    var recorder = this;
    var contentsCopy = contents.slice(0);
    var savedContents = [];
    var savedContentNames = {};
    var savedContentIndex = 0;
    var contentDigestManager = ContentDigestManager.getInstance();
    for (var i = contentsCopy.length - 1; i >= 0; i--) {
      var content = contentsCopy[i];
      if (content instanceof LocalURLContent
          || (content.isJAREntry() && URLContent.fromURL(content.getJAREntryURL()) instanceof LocalURLContent)
          || content instanceof HomeURLContent
          || content instanceof SimpleURLContent
          || includeAllContent) {
        contentDigestManager.getContentDigest(content, {
            digestReady: function(content, digest) {
              // Check if duplicated content can be avoided
              var duplicatedContentFound = false;
              if (digest !== undefined) {
                for (var j = 0; j < savedContents.length; j++) {
                  var savedContent = savedContents [j];
                  if (content.getURL() !== savedContent.getURL()
                      && contentDigestManager.equals(content, savedContent)) {
                    savedContentNames [content.getURL()] = savedContentNames [savedContent.getURL()];
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
                savedContents.push(content);
              }
          
              contentsCopy.splice(contentsCopy.indexOf(content), 1);
              if (contentsCopy.length === 0
                  && !abortedOperation) {
                abortableOperation = recorder.writeHomeToZip(home, homeName, contents, savedContentNames, dataType, observer);
              }
            },
            digestError: function(status, error) {
              if (observer.homeError !== undefined) {
                observer.homeError(status, error);
              }
            }    
          });
      } else {
        contents.splice(i, 1);
        contentsCopy.splice(contentsCopy.indexOf(content), 1);
        if (contentsCopy.length === 0
            && !abortedOperation) {
          abortableOperation = recorder.writeHomeToZip(home, homeName, contents, savedContentNames, dataType, observer);
        }
      }
    }
  } else {
    abortableOperation = this.writeHomeToZip(home, homeName, contents, {}, dataType, observer);
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
 * @param {string} dataType base64, array, uint8array, arraybuffer or blob
 * @param {{homeSaved: function, homeError: function}} observer  The callbacks used to follow the export operation of the home.
 *           homeSaved will receive in its second parameter the data containing the saved home with the resources it needs.
 * @return {abort: function} a function that will abort writing operation if needed 
 * @ignored
 */
HomeRecorder.prototype.writeHomeToZip = function(home, homeName, homeContents, savedContentNames, dataType, observer) {
  var homeClone = home.clone();
  homeClone.setName(homeName);
  
  var writer = new StringWriter(); 
  var exporter = this.getHomeXMLExporter();
  exporter.setSavedContentNames(savedContentNames);
  exporter.writeElement(new XMLWriter(writer), homeClone);
  var homeXmlEntry = writer.toString();
  
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
         + "      ev.data.homeXmlEntry, ev.data.homeContents, ev.data.homeContentTypes, ev.data.savedContentNames, ev.data.dataType, {"
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
	      if (ev.data.error === "indexedDB unavailable") {
		    console.warn("Can't use worker to save home");
		    recorder.writeHomeToZipWithoutWorker(home, homeXmlEntry, homeContents, savedContentNames, dataType, observer);
	      } else {
            if (observer.homeError !== undefined) {
              observer.homeError(ev.data.status, ev.data.error);
            }
	      }
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
        homeXmlEntry: homeXmlEntry, 
        homeContents: homeContents, 
        homeContentTypes: homeContentTypes,
        savedContentNames: savedContentNames,
        dataType: dataType
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
    this.writeHomeToZipWithoutWorker(home, homeXmlEntry, homeContents, savedContentNames, dataType, observer);
  }
}

/**
 * Writes home to ZIP data without using a worker. 
 * @param {string} homeXmlEntry entry of saved home
 * @param {[URLContent|{}]} homeContents
 * @param {{string, string}} savedContentNames
 * @param {string} dataType base64, array, uint8array, arraybuffer or blob
 * @param {{homeSaved: function, homeError: function}} observer   
 * @return {abort: function} a function that will abort writing operation 
 * @private
 */
HomeRecorder.prototype.writeHomeToZipWithoutWorker = function(home, homeXmlEntry, homeContents, savedContentNames, dataType, observer) {
  this.generateHomeZip(homeXmlEntry, homeContents, null, savedContentNames, dataType, {
      homeSaved: function(homeXmlEntry, data) {
        observer.homeSaved(home, data);
      },
      homeError: function(status, error) {
        if (observer.homeError !== undefined) {
          observer.homeError(status, error);
        }
      }
    });
  
  return {
      abort: function() {
      }
    };
}

/**
 * Generates home ZIP data. 
 * @param {string} homeXmlEntry entry of saved home
 * @param {[URLContent|{}]} homeContents
 * @param {[string]} homeContentTypes
 * @param {{string, string}} savedContentNames
 * @param {string} dataType base64, array, uint8array, arraybuffer or blob
 * @param {{homeSaved: function, homeError: function}} observer   
 * @private
 */
HomeRecorder.prototype.generateHomeZip = function(homeXmlEntry, homeContents, homeContentTypes, 
                                                  savedContentNames, dataType, observer) {
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
    var contentObserver = {
        contentSaved: function(content) {
           homeContentsCopy.splice(homeContentsCopy.indexOf(content), 1);
           if (homeContentsCopy.length === 0) {
             observer.homeSaved(homeXmlEntry, recorder.generateZip(zipOut, dataType));
            }
          }, 
          contentError: function(status, error) {
            observer.homeError(status, error);
          }
        };
    for (var i = homeContentsCopy.length - 1; i >= 0; i--) {
      var content = homeContentsCopy[i];
      var contentEntryName = savedContentNames [content.getURL()];
      if (contentEntryName !== undefined) {
        var slashIndex = contentEntryName.indexOf('/');
        if (slashIndex > 0) {
          contentEntryName = contentEntryName.substring(0, slashIndex);
        }
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
      } else {
        contentObserver.contentSaved(content);
      }
    }
  } else {
    observer.homeSaved(homeXmlEntry, this.generateZip(zipOut, dataType));
  }
}

/**
 * Returns the zipped data in the given paramater.
 * @param {JSZip} zip the zip instance containing data
 * @param {string} dataType base64, array, uint8array, arraybuffer or blob
 * @returns the data zipped according to the configuration of this recorder. 
 * @private
 */
HomeRecorder.prototype.generateZip = function(zip, dataType) {
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
                  var entries = zip.file(new RegExp("^" + entryDirectory + ".*")).reverse();
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
                contentObserver.contentError(error, error.message);
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
              contentObserver.contentError(error, error.message);
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
                contentObserver.contentError(error, error.message);
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
 * @param {function} [replaceContent] a function returning the content if its parameter is not an interesting content  
 * @ignore 
 */
HomeRecorder.prototype.searchContents = function(object, homeObjects, contents, 
                                                 acceptContent, replaceContent) {
  if (Array.isArray(object)) {
    for (var i = 0; i < object.length; i++) {
      var replacingContent = this.searchContents(object[i], homeObjects, contents, acceptContent, replaceContent);
      if (replacingContent !== null) {
        object [i] = replacingContent;
      }
    }
  } else if (object instanceof URLContent
             && (acceptContent === undefined || acceptContent(object))) {
    var i = 0;
    for ( ; i < contents.length; i++) {
      if (contents [i].getURL() == object.getURL()) {
        break;
      }
    }
    if (i === contents.length) {
      contents.push(object);
    }
    if (replaceContent !== undefined) {
      return replaceContent(object);
    } else {
      return null;
    }
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
      var propertyName = propertyNames [j];
      if (propertyName == "object3D"
          || object.constructor 
              && object.constructor.__transients 
              && object.constructor.__transients.indexOf(propertyName) != -1) {
        continue;
      }
      var propertyValue = object [propertyName];
      var replacingContent = this.searchContents(propertyValue, homeObjects, contents, acceptContent, replaceContent);
      if (replacingContent !== null) {
        object [propertyName] = replacingContent;
      }
    }
  }
  return null;
}
