/*
 * ModelLoader.js
 *
 * Sweet Home 3D, Copyright (c) 2017 Emmanuel PUYBARET / eTeks <info@eteks.com>
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

// Requires core.js
//          jszip.min.js
//          scene3d.js
//          URLContent.js

/**
 * Creates an instance of a model loader.
 * @param {string} modelExtension
 * @constructor
 * @author Emmanuel Puybaret
 */
function ModelLoader(modelExtension) {
  this.modelExtension = modelExtension;
  this.parserBusy = false;
  this.waitingParsedEntries = [];
}

// Constants used to follow model loading progression (moved from Node3D)
ModelLoader.READING_MODEL = Node3D.READING_MODEL;
ModelLoader.PARSING_MODEL = Node3D.PARSING_MODEL;
ModelLoader.BUILDING_MODEL = Node3D.BUILDING_MODEL;
ModelLoader.BINDING_MODEL = Node3D.BINDING_MODEL;

/**
 * Loads the 3D model from the given URL. This method is reentrant when run asynchronously.
 * @param {string} url The URL of a zip file containing an entry with the extension given in constructor 
 *            that will be loaded or an URL noted as jar:url!/modelEntry where modelEntry will be loaded.
 * @param {boolean} [synchronous] optional parameter equal to false by default
 * @param {{modelLoaded, modelError, progression}} loadingModelObserver 
 *            the observer containing <code>modelLoaded(model)</code>, <code>modelError(error)</code>, 
 *            <code>progression(part, info, percentage)</code> methods that will be called at various phases,  
 *            with <code>model<code> being an instance of <code>Node3D</code>, 
 *            <code>error</code>, <code>part</code>, <code>info</code> strings 
 *            and <code>percentage</code> a number.
 */
ModelLoader.prototype.load = function(url, synchronous, loadingModelObserver) {
  if (loadingModelObserver === undefined) {
    loadingModelObserver = synchronous;
    synchronous = false;
  }
  var modelEntryName = null;
  if (url.indexOf("jar:") === 0) {
    var entrySeparatorIndex = url.indexOf("!/");
    modelEntryName = url.substring(entrySeparatorIndex + 2);
    url = url.substring(4, entrySeparatorIndex);
  }
  
  loadingModelObserver.progression(ModelLoader.READING_MODEL, url, 0);
  var loader = this;
  var zipObserver = {
      zipReady : function(zip) {
        try {
          if (modelEntryName === null) {
            // Search an entry ending with the given extension
            var entries = zip.file(/.*/);
            for (var i = 0; i < entries.length; i++) {
              if (entries [i].name.toLowerCase().match(new RegExp("\." + loader.modelExtension.toLowerCase() + "$"))) {
                loader.parseModelEntry(entries [i], zip, url, synchronous, loadingModelObserver);
                return;
              } 
            }
            if (entries.length > 0) {
              // If not found, try with the first entry
              modelEntryName = entries [0].name;
            } else {
              if (loadingModelObserver.modelError !== undefined) {
                loadingModelObserver.modelError("Empty file");
              }
              return;
            }
          }
          loader.parseModelEntry(zip.file(decodeURIComponent(modelEntryName)), zip, url, synchronous, loadingModelObserver);
        } catch (ex) {
          zipObserver.zipError(ex);
        }
      },
      zipError : function(error) {
        if (loadingModelObserver.modelError !== undefined) {
          loadingModelObserver.modelError(error);
        }
      },
      progression : function(part, info, percentage) {
        if (loadingModelObserver.progression !== undefined) {
          loadingModelObserver.progression(ModelLoader.READING_MODEL, info, percentage);
        }
      }
    };
  ZIPTools.getZIP(url, synchronous, zipObserver);
}

/**
 * Clears the list of 3D models waiting to be parsed by this loader. 
 */
ModelLoader.prototype.clear = function() {
  this.waitingParsedEntries = [];
}

/**
 * Parses the content of the given entry to create the scene it contains. 
 * @private
 */
ModelLoader.prototype.parseModelEntry = function(modelEntry, zip, zipUrl, synchronous, loadingModelObserver) {
  if (synchronous) { 
    var modelContent = this.getModelContent(modelEntry);
    loadingModelObserver.progression(ModelLoader.READING_MODEL, modelEntry.name, 1);
    var modelContext = {};
    this.parseDependencies(modelContent, modelEntry.name, zip, modelContext);
    var scene = this.parseEntryScene(modelContent, modelEntry.name, zip, modelContext, null, loadingModelObserver.progression);
    this.loadTextureImages(scene, {}, zip, zipUrl, true);
    loadingModelObserver.modelLoaded(scene);
  } else {
    var parsedEntry = {modelEntry : modelEntry, 
                       zip : zip, 
                       zipUrl : zipUrl, 
                       loadingModelObserver : loadingModelObserver};
    this.waitingParsedEntries.push(parsedEntry);
    this.parseNextWaitingEntry();
  }
}  

/**
 * Parses asynchronously the waiting entries.
 * @private
 */
ModelLoader.prototype.parseNextWaitingEntry = function() {
  if (!this.parserBusy) {
    // Parse model files one at a time to avoid keeping in memory unzipped content not yet used
    for (var key in this.waitingParsedEntries) {
      if (this.waitingParsedEntries.hasOwnProperty(key)) {
        var parsedEntry = this.waitingParsedEntries [key];
        var modelEntryName = parsedEntry.modelEntry.name;
        // Get model content to parse
        var modelContent = this.getModelContent(parsedEntry.modelEntry);
        parsedEntry.loadingModelObserver.progression(ModelLoader.READING_MODEL, modelEntryName, 1);
        var modelContext = {};
        this.parseDependencies(modelContent, modelEntryName, parsedEntry.zip, modelContext);
        var loader = this;
        // Post future work (avoid worker because the amount of data to transfer back and forth slows the program) 
        setTimeout(
            function() {
              loader.parseEntryScene(modelContent, modelEntryName, parsedEntry.zip, modelContext,
                  function(scene) {
                      loader.loadTextureImages(scene, {}, parsedEntry.zip, parsedEntry.zipUrl, true);
                      parsedEntry.loadingModelObserver.modelLoaded(scene);
                      loader.parserBusy = false;
                      loader.parseNextWaitingEntry();
                    },
                  parsedEntry.loadingModelObserver.progression);
            }, 0);
        
        this.parserBusy = true;
        // Remove parsed entry from waiting list
        delete this.waitingParsedEntries [key];
        break;
      }
    }
  }
}

/**
 * Loads the textures images used by appearances of the scene.
 * @private
 */
ModelLoader.prototype.loadTextureImages = function(node, images, zip, zipUrl, synchronous) {
  if (node instanceof Group3D) {
    for (var i = 0; i < node.children.length; i++) {
      this.loadTextureImages(node.children [i], images, zip, zipUrl, synchronous);
    }
  } else if (node instanceof Link3D) {
    this.loadTextureImages(node.getSharedGroup(), images, zip, zipUrl, synchronous);
  } else if (node instanceof Shape3D) {
    var appearance = node.getAppearance();
    if (appearance) {
      var imageEntryName = appearance.imageEntryName;
      if (imageEntryName !== undefined) {
        delete appearance [imageEntryName];
        if (imageEntryName in images) {
          appearance.setTextureImage(images [imageEntryName]);
        } else { 
          var image = new Image();
          image.crossOrigin = "anonymous";
          appearance.setTextureImage(image);
          image.url = "jar:" + zipUrl + "!/" + imageEntryName;
          // Store loaded image to avoid duplicates
          images [imageEntryName] = image;
          
          var loader = function() {
            var imageEntry = zip.file(decodeURIComponent(imageEntryName));
            if (imageEntry !== null) {
              var imageData = imageEntry.asBinary();
              var base64Image = btoa(imageData);
              var extension = imageEntryName.substring(imageEntryName.lastIndexOf('.') + 1).toLowerCase();
              var mimeType = ZIPTools.isJPEGImage(imageData)
                  ? "image/jpeg" 
                  : (ZIPTools.isPNGImage(imageData) 
                      ? "image/png"
                      : ("image/" + extension));
              // Detect quickly if a PNG image use transparency
              image.transparent = ZIPTools.isTransparentImage(imageData);
              image.src = "data:" + mimeType + ";base64," + base64Image;
            } else {
              appearance.setTextureImage(null);
            }
          };
          if (synchronous) {
            loader();
          } else {
            setTimeout(loader, 0);
          }
        }
      }
    }
  }
}

/**
 * Returns the content of the model stored in the given entry.
 * @protected
 */
ModelLoader.prototype.getModelContent = function(modelEntry) {
  return modelEntry.asBinary();
}

/**
 * Parses the dependencies of the model content if any and returns the materials it describes.
 * @protected
 */
ModelLoader.prototype.parseDependencies = function(modelContent, modelEntryName, zip, modelContext) {
}

/**
 * Parses the given model content and calls onmodelloaded asynchronously or 
 * returns the scene it describes if onmodelloaded is null.
 * @protected
 */
ModelLoader.prototype.parseEntryScene = function(modelContent, modelEntryName, zip, modelContext, onmodelloaded, onprogression) {
}
