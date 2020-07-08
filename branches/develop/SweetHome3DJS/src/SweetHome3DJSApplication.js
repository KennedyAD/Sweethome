/*
 * SweetHome3DJSApplication.js
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

// Requires SweetHome3D.js
// Requires HomeRecorder.js
// Requires UserPreferences.js
// Requires FurnitureCatalogListPanel.js
// Requires PlanComponent.js
// Requires HomeComponent3D.js
// Requires HomePane.js

var PROTOCOL_VERSION = 1.0;

/**
 * A home recorder that is able to save the application homes incrementally by sending undoable edits 
 * to the SH3D server.
 * @param {SweetHome3DJSApplication} application
 * @param {{readHomeURL: string,
 *          writeHomeEditsURL: string,
 *          closeHomeURL: string,
 *          pingURL: string,
 *          autoWriteDelay: number,
 *          writeListener: {onWriteTransactionStarted: Function, 
 *                          onWriteTransactionCommitted: Function, 
 *                          onWriteTransactionRollbacked: Function, 
 *                          onGoingOnline: Function, 
 *                          onGoingOffline: Function}
 *         }} [configuration] the recorder configuration
 * @constructor
 * @author Renaud Pawlak
 * @author Emmanuel Puybaret
 */
function IncrementalHomeRecorder(application, configuration) {
  HomeRecorder.call(this);
  this.application = application;
  this.undoableEditSupports = {};
  this.editCounters = {};
  this.configuration = configuration;
  this.online = true;
  this.pingDelay = 10000;
  console.info("Created incremental home recorder", this, this.getAutoWriteDelay());
  if (this.configuration !== undefined && this.configuration.pingURL !== undefined) {
    var recorder = this;
    setTimeout(function() { recorder.checkServer(); }, this.pingDelay);
  }
}
IncrementalHomeRecorder.prototype = Object.create(HomeRecorder.prototype);
IncrementalHomeRecorder.prototype.constructor = IncrementalHomeRecorder;

/**
 * Configures this incremental recorder's behavior.
 * 
 * @param {Object} configuration an object containing configuration fields
 */
IncrementalHomeRecorder.prototype.configure = function(configuration) {
  this.configuration = configuration;
}

/** @private */
IncrementalHomeRecorder.prototype.checkServer = function(configuration) {
  var recorder = this;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', this.configuration['pingURL'], true);
  xhr.addEventListener('load', function (e) {
    if (xhr.readyState === 4 && xhr.status === 200) {
      if (!recorder.online) {
        if (recorder.configuration && recorder.configuration.writeListener && recorder.configuration.writeListener.onGoingOnline) {
          recorder.configuration.writeListener.onGoingOnline(recorder);
        }
      }
      recorder.online = true;
      setTimeout(function() { recorder.checkServer(); }, recorder.pingDelay);
    } else {
      if (recorder.online) {
        if (recorder.configuration && recorder.configuration.writeListener && recorder.configuration.writeListener.onGoingOffline) {
          recorder.configuration.writeListener.onGoingOffline(recorder);
        }
      }
      recorder.online = false;
      setTimeout(function() { recorder.checkServer(); }, recorder.pingDelay);
    }
  });
  xhr.addEventListener('error', function (e) {
    if (recorder.online) {
      if (recorder.configuration && recorder.configuration.writeListener && recorder.configuration.writeListener.onGoingOffline) {
        recorder.configuration.writeListener.onGoingOffline(recorder);
      }
    }
    recorder.online = false;
    setTimeout(function() { recorder.checkServer(); }, recorder.pingDelay);
  });
  xhr.send();
}

/**
 * Reads a home with this recorder.
 * @param {string} homeName the home name on the server 
 *                          or the URL of the home if <code>readHomeURL</code> service is missing 
 * @param {Object} observer an object to be notified with loading statuses 
 */
IncrementalHomeRecorder.prototype.readHome = function(homeName, observer) {
  console.info("read home ", this.configuration);
  if (this.configuration !== undefined
      && this.configuration.readHomeURL !== undefined) {
    // Replace % sequence by %% except %s before formating readHomeURL with home name 
    var readHomeUrl = CoreTools.format(this.configuration.readHomeURL.replace(/(%[^s])/g, "%$1"), encodeURIComponent(homeName));
    homeName = readHomeUrl;
  }
  console.info("read home "+homeName);
  HomeRecorder.prototype.readHome.call(this, homeName, observer);
}

/**
 * @private
 */
IncrementalHomeRecorder.prototype.checkPoint = function(home) {
  var recorder = this;
  if (!recorder.existingHomeObjects) {
    recorder.existingHomeObjects = {};
  }
  recorder.existingHomeObjects[home.id] = {};
  home.getHomeObjects().forEach(function(homeObject) {
      recorder.existingHomeObjects[home.id][homeObject.id] = homeObject.id;
    });
}

/**
 * Adds a home to be incrementally saved by this recorder.
 */
IncrementalHomeRecorder.prototype.addHome = function(home) {
  if (this.configuration !== undefined
      && this.configuration.writeHomeEditsURL !== undefined) {
    var recorder = this;
    home.id = HomeObject.createId("home");
    
    // TODO Remove logs
    console.info("addHome", home.id, this.application.getHomeController(home));

    this.checkPoint(home);

    console.info("collected ids: ", home, this.existingHomeObjects);
    console.info(Object.getOwnPropertyNames(home));

    var homeController = this.application.getHomeController(home);
    this.undoableEditSupports[home.id] = homeController.getUndoableEditSupport();
    var listener = {
        undoableEditHappened: function(undoableEditEvent) {
          recorder.storeEdit(home, undoableEditEvent.getEdit());
          recorder.scheduleWrite(home);
        },
        source: recorder // Additional field to track the listener  
      };
    this.undoableEditSupports[home.id].addUndoableEditListener(listener);
    // Caution: direct access to undoManager field of HomeController
    var undoManager = homeController.undoManager;
    var coreUndo = undoManager.undo;
    var coreRedo = undoManager.redo;
    undoManager.undo = function() {
        var edit = undoManager.editToBeUndone();
        coreUndo.call(undoManager);
        recorder.storeEdit(home, edit, true);
        recorder.scheduleWrite(home);
      };
    undoManager.redo = function() {
        var edit = undoManager.editToBeRedone();
        coreRedo.call(undoManager);
        recorder.storeEdit(home, edit);
        recorder.scheduleWrite(home);
      };

    console.info("Watching objects without regular undoable edits scope");
    // Save initial state of objects that are not tracked in regular undoable edits 
    home._observerCamera = home.getObserverCamera().clone();
    home._topCamera = home.getTopCamera().clone();
    home._compass = home.getCompass().clone();

    var untrackedStateChangeTracker = function(ev) {
      if (!home.hasUntrackedStateChange) {
        home.hasUntrackedStateChange = true;
      }
    }
    home.getObserverCamera().addPropertyChangeListener(untrackedStateChangeTracker);
    home.getTopCamera().addPropertyChangeListener(untrackedStateChangeTracker);
    home.getCompass().addPropertyChangeListener(untrackedStateChangeTracker);

    // Schedule first write if needed
    if (recorder.getAutoWriteDelay() > 0) {
      recorder.scheduleWrite(home);
    }
  }
}

/** 
 * Returns -1 if not autosaving, 0 if autosaving after each edit, or the actual delay in ms.
 * @private
 */
IncrementalHomeRecorder.prototype.getAutoWriteDelay = function(home) {
  if (this.configuration === undefined || this.configuration.autoWriteDelay === undefined) {
    return -1;
  } else {
    return this.configuration.autoWriteDelay;
  }
}

/**
 * Removes a home previously added with #addHome(home).
 */
IncrementalHomeRecorder.prototype.removeHome = function(home) {
  if (this.configuration !== undefined) {
    if (this.configuration['closeHomeURL'] !== undefined) {
      var closeHomeURL = CoreTools.format(this.configuration.closeHomeURL.replace(/(%[^s])/g, "%$1"), encodeURIComponent(home.name));
      if (navigator.sendBeacon) {
        navigator.sendBeacon(closeHomeURL);
      } else {
        try {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', closeHomeURL, true); // Asynchronous call required during unload
          xhr.send();
        } catch (ex) {
          console.error(ex); 
        }
      }
    }
    if (this.configuration['writeHomeEditsURL'] !== undefined) {
      var undoableEditListeners = this.undoableEditSupports[home.id].getUndoableEditListeners();
      for (var i = 0; i < undoableEditListeners.length; i++) {
        if (undoableEditListeners [i].source === this) {
          this.undoableEditSupports[home.id].removeUndoableEditListener(undoableEditListeners[i]);
          break;
        }
      }
      delete this.undoableEditSupports[home.id];
      delete this.existingHomeObjects[home.id];
    }
  }
}

/** 
 * Sends to the server all the currently waiting edits for the given home.  
 */
IncrementalHomeRecorder.prototype.sendUndoableEdits = function(home) {
  try {
    // Check if something to be sent to avoid useless transactions.
    if (!this.hasEdits(home)) {
      return;
    }
    if (home.hasUntrackedStateChange) {
      this.addUntrackedStateChange(home);
    }
    var recorder = this;
    var transaction = this.beginWriteTransaction(home);
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.configuration['writeHomeEditsURL'], true);
    xhr.addEventListener('load', function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var result = JSON.parse(xhr.responseText);
          if (result && result.result === transaction.edits.length) {
            recorder.commitWriteTransaction(home, transaction);
          } else {
            // Should never happen (what to do then?)
            console.error(xhr.responseText);
            recorder.commitWriteTransaction(home, transaction);
          }
        } else {
          // Should never happen (what to do then?)
          console.error(xhr.statusText);
          // TODO: we commit to move forward with the edits but we might loose them
          recorder.commitWriteTransaction(home, transaction);
        }
      }
    });
    xhr.addEventListener('error', function (e) {
      // There was an error connecting with the server: rollback and retry
      // TODO: define a retry delay?
      recorder.rollbackWriteTransaction();
      recorder.scheduleWrite(home, 10000);
    });
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send('home=' + encodeURIComponent(home.name) + '&' +
             'txId=' + transaction.txId + '&' +
             'version=' + PROTOCOL_VERSION + '&' +
             'edits=' + encodeURIComponent(JSON.stringify(transaction.edits)));
  } catch (ex) {
    console.error(ex);
  }  
}

/** 
 * @private 
 */
IncrementalHomeRecorder.prototype.hasEdits = function(home) {
  return (this.queue !== undefined && this.queue.length > 0) || home.hasUntrackedStateChange;
}

/** 
 * @private 
 */
IncrementalHomeRecorder.prototype.addUntrackedStateChange = function(home) {
  if (home.hasUntrackedStateChange) {
    home.hasUntrackedStateChange = false;
    // store current state
    home._observerCamera = home.getObserverCamera().clone();
    home._topCamera = home.getTopCamera().clone();
    home._compass = home.getCompass().clone();
    var untrackedStateChangeUndoableEdit = { _type: 'com.eteks.sweethome3d.io.UntrackedStateChangeUndoableEdit' };
    untrackedStateChangeUndoableEdit.topCamera = home.getTopCamera().duplicate();
    untrackedStateChangeUndoableEdit.observerCamera = home.getObserverCamera().duplicate();
    this.storeEdit(home, untrackedStateChangeUndoableEdit);
  }
}

/** 
 * @private 
 */
IncrementalHomeRecorder.prototype.scheduleWrite = function(home, delay) {
  var recorder = this;
  if (delay === undefined) {
    delay = recorder.getAutoWriteDelay();
  }
  if (delay >= 0) {
    if (home.scheduledWrite !== undefined) {
      clearTimeout(home.scheduledWrite);
      home.scheduledWrite = undefined;
    }
    home.scheduledWrite = setTimeout(function() {
      home.scheduledWrite = undefined;
      if (recorder.online && recorder.hasEdits(home)) {
        recorder.sendUndoableEdits(home);
      }
      if (recorder.getAutoWriteDelay() > 0) {
        recorder.scheduleWrite(home);
      }
    }, delay);
  }
  // < 0 means manual write (nothing scheduled)
}

/** 
 * @private 
 */
IncrementalHomeRecorder.prototype.storeEdit = function(home, edit, undoAction) {
  if (this.editCounters[home.id] === undefined) {
    this.editCounters[home.id] = 0;
  } else {
    this.editCounters[home.id] = this.editCounters[home.id] + 1;
  }
  var key = home.id + "/" + this.editCounters[home.id];
  var newObjects = {};
  var newObjectList = [];
  //console.info("substitution of edit", edit);
  var processedEdit = this.substituteIdentifiableObjects(
                                home,
                                edit,
                                newObjects,
                                newObjectList,
                                ["object3D", "hasBeenDone", "alive", "presentationNameKey", "__parent"], 
                                [UserPreferences, PlanController, Home],
                                [Boolean, String, Number]);
  if (newObjectList.length > 0) {
    processedEdit._newObjects = newObjectList;
  }
  if (undoAction) {
    processedEdit._action = "undo";
  }
  //console.info(key, processedEdit, JSON.stringify(processedEdit));
  // TODO: use local storage
  //localStorage.setItem(key, toJSON(o));
  if (!this.queue) {
    this.queue = [];
  }
  this.queue.push(processedEdit);
  
  // Update objects state 
  this.checkPoint(home);
}

/** 
 * @private 
 */
IncrementalHomeRecorder.prototype.beginWriteTransaction = function(home) {
  if (home.ongoingTx !== undefined) {
    home.rejectedTx = true;
    throw new Error("cannot start transaction");
  }
  // TODO: use local storage
  home.ongoingTx = { 'txId': CoreTools.randomUUID(), 'edits': this.queue.slice(0) };
  if (this.configuration !== undefined && this.configuration.writeListener && this.configuration.writeListener.onWriteTransactionStarted) {
    this.configuration.writeListener.onWriteTransactionStarted(home.ongoingTx);
  }
  return home.ongoingTx;
}

/** 
 * @private 
 */
IncrementalHomeRecorder.prototype.commitWriteTransaction = function(home, transaction) {
  // TODO: use local storage
  for (var i = 0; i < transaction.edits.length; i++) {
    if (this.queue[0] === transaction.edits[i]) {
      this.queue.shift();
    } else {
      // This is really really bad and should never happen.
      throw new Error("Unexpected error while saving.");
    }
  }
  if (this.configuration !== undefined && this.configuration.writeListener && this.configuration.writeListener.onWriteTransactionCommitted) {
    this.configuration.writeListener.onWriteTransactionCommitted(transaction);
  }
  home.ongoingTx = undefined;
  if (home.rejectedTx) {
    // There was a rejected transaction during this ongoing transaction, 
    // it means that there is something to be saved and we force the write
    home.rejectedTx = undefined;
    this.scheduleWrite(home, 0);
  }
}

/** 
 * @private 
 */
IncrementalHomeRecorder.prototype.rollbackWriteTransaction = function(home, transaction) {
  if (this.configuration !== undefined && this.configuration.writeListener && this.configuration.writeListener.onWriteTransactionRollbacked) {
    this.configuration.writeListener.onWriteTransactionRollbacked(transaction);
  }
  home.ongoingTx = undefined;
  home.rejectedTx = undefined;
}

/** 
 * @private 
 */
IncrementalHomeRecorder.prototype.substituteIdentifiableObjects = function(home, origin, newObjects, newObjectList, skippedPropertyNames, skippedTypes, preservedTypes) {
  if (Array.isArray(origin)) {
    var destination = origin.slice(0);
    for (var i = 0; i < origin.length; i++) {
      destination[i] = this.substituteIdentifiableObjects(home, origin[i], newObjects, newObjectList, skippedPropertyNames, skippedTypes, preservedTypes);
    }
    return destination;
  } else if (origin instanceof Big) {
    return {value: origin.toString(), 
            _type: "java.math.BigDecimal"};
  } else if (origin == null || origin !== Object(origin) 
            || preservedTypes.some(function(preservedType) { return origin instanceof preservedType; })) {
    return origin;
  } else if (origin.id !== undefined && (this.existingHomeObjects[home.id][origin.id] !== undefined // Already in home
                                        || newObjects[origin.id] !== undefined  // Already in new objects
                                        || origin instanceof Home)) { // Home always exists
    return origin.id;
  } else {
    var destination = {};
    if (origin.id !== undefined) {
      // New object case
      newObjects[origin.id] = destination;
      newObjectList.push(destination);
    }
    if (origin.constructor && origin.constructor.__class) {
      destination._type = origin.constructor.__class;
    }
    var propertyNames = Object.getOwnPropertyNames(origin);
    for (var j = 0; j < propertyNames.length; j++) {
      var propertyName = propertyNames[j];
      if (origin.constructor && origin.constructor.__transients && origin.constructor.__transients.indexOf(propertyName) != -1) {
        continue;
      }
      if (skippedPropertyNames.indexOf(propertyName) === -1) {
        var propertyValue = origin[propertyName];
        if (typeof propertyValue !== 'function' 
            && !skippedTypes.some(function(skippedType) { return propertyValue instanceof skippedType; })) {
          destination[propertyName] = this.substituteIdentifiableObjects(home, propertyValue, newObjects, newObjectList, skippedPropertyNames, skippedTypes, preservedTypes);
        }
      }
    }
    if (origin.id !== undefined) {
      return origin.id;
    } else {
      return destination;
    }
  }
}


/**
 * Defines <code>HomeApplication</code> implementation for JavaScript.
 * @param {{furnitureCatalogURLs: [string]
 *          furnitureResourcesURLBase: string
 *          texturesCatalogURLs: [string]
 *          texturesResourcesURLBase: string,
 *          readHomeURL: string,
 *          writeHomeEditsURL: string,
 *          closeHomeURL: string}} [params] the URLs of resources and services required on server 
 *                                                  (if undefined, will use local files for testing)
 * @constructor
 * @author Emmanuel Puybaret
 * @author Renaud Pawlak
 */
function SweetHome3DJSApplication(params) {
  HomeApplication.call(this);
  this.homeControllers = [];
  this.params = params;
  var application = this;
  this.addHomesListener(function(ev) {
      if (ev.getType() == CollectionEvent.Type.ADD) {
        var homeController = this.application.createHomeController(ev.getItem());
        application.homeControllers.push(homeController); 
        application.getHomeRecorder().addHome(ev.getItem());
        homeController.getView();
      } else if (ev.getType() == CollectionEvent.Type.DELETE) {
        application.homeControllers.splice(ev.getIndex(), 1); 
        application.getHomeRecorder().removeHome(ev.getItem());
      }
    });
}
SweetHome3DJSApplication.prototype = Object.create(HomeApplication.prototype);
SweetHome3DJSApplication.prototype.constructor = SweetHome3DJSApplication;

SweetHome3DJSApplication.prototype.getVersion = function() {
  return "6.4 Beta";
}

SweetHome3DJSApplication.prototype.getHomeController = function(home) {
  return this.homeControllers[this.getHomes().indexOf(home)];
}

SweetHome3DJSApplication.prototype.getHomeRecorder = function() {
  if (!this.homeRecorder) {
    this.homeRecorder = new IncrementalHomeRecorder(this, this.params);
  }
  return this.homeRecorder;
}

SweetHome3DJSApplication.prototype.getUserPreferences = function() {
  if (this.preferences == null) {
    this.preferences = this.params !== undefined 
      ? new DefaultUserPreferences(
            this.params.furnitureCatalogURLs, this.params.furnitureResourcesURLBase, 
            this.params.texturesCatalogURLs, this.params.texturesResourcesURLBase)
      : new DefaultUserPreferences();
    this.preferences.setFurnitureViewedFromTop(true);
  }
  return this.preferences;
}

SweetHome3DJSApplication.prototype.getViewFactory = function() {
  if (this.viewFactory == null) {
    var dummyDialogView = {
        displayView: function(parent) { }
      }; 
    
    var colorInput = null;
    if (!OperatingSystem.isEdgeOrInternetExplorer()) {
      // Create a dummy color input to propose a minimal color change as editing view 
      var div = document.createElement("div");
      colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.style.width = "1px";
      colorInput.style.height = "1px";
      div.appendChild(colorInput);
      document.getElementById("home-plan").appendChild(div);
    }
    var displayColorPicker = function(defaultColor, changeListener) {
        if (colorInput != null) {
          var listener = function() {
              colorInput.removeEventListener("change", listener); 
              changeListener(ColorTools.hexadecimalStringToInteger(colorInput.value));
            };
          colorInput.value = defaultColor != null && defaultColor != 0
             ? ColorTools.integerToHexadecimalString(defaultColor)
             : "#010101"; // Color different from black required on some browsers
          colorInput.addEventListener("change", listener);
          colorInput.click();
        }
      };
    
    var application = this;
    this.viewFactory = {
        createFurnitureCatalogView: function(catalog, preferences, furnitureCatalogController) {
          return new FurnitureCatalogListPanel("furniture-catalog", catalog, preferences, furnitureCatalogController);
        },
        createFurnitureView: function(home, preferences, furnitureController) {
          return null;
        },
        createPlanView: function(home, preferences, planController) {
          return new PlanComponent("home-plan", home, preferences, planController);
        }, 
        createView3D: function(home, preferences, homeController3D) {
          return new HomeComponent3D("home-3D-view", home, preferences, null, homeController3D);
        },
        createHomeView: function(home, preferences, homeController) {
          return new HomePane("home-pane", home, preferences, homeController);
        }, 
        createWizardView: function(preferences, wizardController) {
          return dummyDialogView;
        },
        createBackgroundImageWizardStepsView: function(backgroundImage, preferences, backgroundImageWizardController) {
          return null;
        },
        createImportedFurnitureWizardStepsView: function(piece, modelName, importHomePiece, preferences, importedFurnitureWizardController) {
          return null;
        },
        createImportedTextureWizardStepsView: function(texture, textureName, preferences, importedTextureWizardController) {
          return null;
        },
        createUserPreferencesView: function(preferences, userPreferencesController) {
          return dummyDialogView;
        },
        createLevelView: function(preferences, levelController) {
          return dummyDialogView;
        },
        createHomeFurnitureView: function(preferences,  homeFurnitureController) {
          return {
              displayView: function(parent) {
                displayColorPicker(homeFurnitureController.getColor(),
                    function(selectedColor) {
                      homeFurnitureController.setPaint(RoomController.RoomPaint.COLORED);
                      homeFurnitureController.setColor(selectedColor);
                      homeFurnitureController.modifyFurniture();
                    });
              }
            };
        },
        createWallView: function(preferences,  wallController) {
          return {
              displayView: function(parent) {
                // Find which wall side is the closest to the pointer location
                var home = wallController.home;
                var planController = application.getHomeController(home).getPlanController();
                var x = planController.getXLastMousePress(); 
                var y = planController.getYLastMousePress();
                var wall = home.getSelectedItems() [0];
                var points = wall.getPoints();
                var leftMinDistance = Number.MAX_VALUE;
                for (var i = points.length / 2 - 1; i > 0; i--) {
                  leftMinDistance = Math.min(leftMinDistance,
                      java.awt.geom.Line2D.ptLineDistSq(points[i][0], points[i][1], points[i - 1][0], points[i - 1][1], x, y))
                }
                var rightMinDistance = Number.MAX_VALUE;
                for (var i = points.length / 2; i < points.length - 1; i++) {
                  rightMinDistance = Math.min(rightMinDistance,
                      java.awt.geom.Line2D.ptLineDistSq(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], x, y))
                }
                var leftSide = leftMinDistance < rightMinDistance;

                displayColorPicker(leftSide ? wallController.getLeftSideColor() : wallController.getRightSideColor(),
                    function(selectedColor) {
                      if (leftSide) {
                        wallController.setLeftSidePaint(WallController.WallPaint.COLORED);
                        wallController.setLeftSideColor(selectedColor);
                      } else {
                        wallController.setRightSidePaint(WallController.WallPaint.COLORED);
                        wallController.setRightSideColor(selectedColor);
                      }
                      wallController.modifyWalls();
                    });
              }
            };
        },
        createRoomView: function(preferences, roomController) {
          return {
              displayView: function(parent) {
                displayColorPicker(roomController.getFloorColor(),
                    function(selectedColor) {
                      roomController.setFloorPaint(RoomController.RoomPaint.COLORED);
                      roomController.setFloorColor(selectedColor);
                      roomController.modifyRooms();
                    });
              }
            };
        },
        createPolylineView: function(preferences, polylineController) {
          return {
              displayView: function(parent) {
                displayColorPicker(polylineController.getColor(),
                    function(selectedColor) {
                      polylineController.setColor(selectedColor);
                      polylineController.modifyPolylines();
                    });
              }
            };
        },
        createLabelView: function(modification, preferences, labelController) {
          return {
              displayView: function(parentView) {
                var text = prompt(ResourceAction.getLocalizedLabelText(preferences, "LabelPanel", "textLabel.text"), 
                    modification ? labelController.getText() :  "Text")
                if (text != null) {
                  labelController.setText(text);
                  if (modification) {
                    labelController.modifyLabels();
                  } else {
                    labelController.createLabel(); 
                  }
                }
              }
            };
        },
        createCompassView: function(preferences, compassController) {
          return dummyDialogView;
        },
        createObserverCameraView: function(preferences, home3DAttributesController) {
          return dummyDialogView;
        },
        createHome3DAttributesView: function(preferences, home3DAttributesController) {
          return dummyDialogView;
        },
        createTextureChoiceView: function(preferences, textureChoiceController) {
          return null;
        },
        createBaseboardChoiceView: function(preferences, baseboardChoiceController) {
          return null;
        },
        createModelMaterialsView: function(preferences, modelMaterialsController) {
          return null;
        },
        createPageSetupView: function(preferences, pageSetupController) {
          return dummyDialogView;
        },
        createPrintPreviewView: function(home, preferences, homeController, printPreviewController) {
          return dummyDialogView;
        },
        createPhotoView: function(home, preferences, photoController) {
          return dummyDialogView;
        },
        createPhotosView: function(home, preferences, photosController) {
          return dummyDialogView;
        },
        createVideoView: function(home, preferences, videoController) {
          return dummyDialogView;
        }
      };
    
    this.viewFactory.__interfaces = ["com.eteks.sweethome3d.viewcontroller.ViewFactory"];
  }
  return this.viewFactory;
}

SweetHome3DJSApplication.prototype.createHomeController = function(home) {
  return new HomeController(home, this.getUserPreferences(), this.getViewFactory());
  // TODO Should be: return new HomeController(home, this, this.getViewFactory());
}
