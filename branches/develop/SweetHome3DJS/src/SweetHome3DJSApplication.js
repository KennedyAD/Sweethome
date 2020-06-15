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

/**
 * A home recorder that is able to save the application homes incrementally by sending undoable edits 
 * to the SH3D server.
 * @param {SweetHome3DJSApplication} application
 * @param {string} baseUrl the server's base URL
 */
function IncrementalHomeRecorder(application, baseUrl) {
  HomeRecorder.call(this);
  this.application = application;
  this.undoableEditListeners = {};
  this.editCounters = {};
  this.baseUrl = baseUrl;
}
IncrementalHomeRecorder.prototype = Object.create(HomeRecorder.prototype);
IncrementalHomeRecorder.prototype.constructor = IncrementalHomeRecorder;

/**
 * Reads a home with this recorder.
 * @param {string} homeName the home name on the server
 * @param {Object} observer an object to be notified with loading statuses 
 */
IncrementalHomeRecorder.prototype.readHome = function(homeName, observer) {
  var homeLoaded = observer.homeLoaded;
  var recorder = this;
  var url = this.baseUrl + "/readHome.jsp?home=" + homeName;
  observer.homeLoaded = function(home) {
    // TODO: have a UUID
    home.id = url;
    console.info("home loaded", home, home.id, home.getHomeObjects());
    recorder.existingHomeObjects = {};
    home.getHomeObjects().forEach(function(homeObject) {
      recorder.existingHomeObjects[homeObject.id] = homeObject.id;
    });
    console.info("collected ids: ", home, recorder.existingHomeObjects);
    console.info(Object.getOwnPropertyNames(home));
    homeLoaded(home);
    home.name = homeName;
  }
  HomeRecorder.prototype.readHome.call(this, url, observer);
}

/**
 * Adds a home to be incrementally saved by this recorder.
 */
IncrementalHomeRecorder.prototype.addHome = function(home) {
  console.info("addHome", home.id, this.application.getHomeController(home));
  var recorder = this;
  var listener = {
    undoableEditHappened: function(undoableEditEvent) {
      recorder.onUndoableEdit(home, undoableEditEvent);
    }
  };
  this.undoableEditListeners[home.id] = listener;
  this.application.getHomeController(home).getUndoableEditSupport().addUndoableEditListener(listener);
}

/**
 * Removes a home previously added with #addHome(home).
 */
IncrementalHomeRecorder.prototype.removeHome = function(home) {
  this.application.getHomeController(home).getUndoableEditSupport().removeUndoableEditListener(this.undoableEditListeners[home.id]);
}

/** @private */
IncrementalHomeRecorder.prototype.onUndoableEdit = function(home, undoableEditEvent) {
  this.storeEdit(home, undoableEditEvent.getEdit());
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.baseUrl + "/writeHomeEdits.jsp", false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send('home=' + encodeURIComponent(home.name) + '&' +
             'edits=' + encodeURIComponent(JSON.stringify(this.getStoredEdits())));
    console.info("RESULT = " + xhr.responseText);
    this.commitEdits();
    //return JSON.parse(xhr.responseText);
  } catch (ex) {
    console.error(ex);
  }  
}

/** @private */
IncrementalHomeRecorder.prototype.storeEdit = function(home, edit) {
  if (this.editCounters[home.id] === undefined) {
    this.editCounters[home.id] = 0;
  } else {
    this.editCounters[home.id] = this.editCounters[home.id] + 1;
  }
  var key = home.id + "/" + this.editCounters[home.id];
  var newObjects = {};
  var processedEdit = this.substituteIdentifiableObjects(
                                edit,
                                newObjects,
                                ["object3D"], 
                                [UserPreferences, HomeFurnitureGroup.LocationAndSizeChangeListener, PropertyChangeSupport],
                                [Boolean, String, Number]);
  console.info(key, processedEdit, JSON.stringify(processedEdit), newObjects);
  processedEdit._newObjects = newObjects;
  // TODO: use local storage
  //localStorage.setItem(key, toJSON(o));
  if (!this.queue) {
    this.queue = [];
  }
  this.queue.push(processedEdit);
  
  // Add possible new objects to existing ones 
  CoreTools.merge(this.existingHomeObjects, newObjects);
}

/** @private */
IncrementalHomeRecorder.prototype.getStoredEdits = function() {
  // TODO: use local storage
  return this.queue;
}

/** @private */
IncrementalHomeRecorder.prototype.commitEdits = function() {
  // TODO: use local storage
  this.queue = [];
}

/** @private */
IncrementalHomeRecorder.prototype.substituteIdentifiableObjects = function(origin, newObjects, skippedPropertyNames, skippedTypes, preservedTypes) {
  if (Array.isArray(origin)) {
    var destination = origin.slice(0);
    for (var i = 0; i < origin.length; i++) {
      destination[i] = this.substituteIdentifiableObjects(origin[i], newObjects, skippedPropertyNames, skippedTypes, preservedTypes);
    }
    return destination;
  } else if (origin == null || origin !== Object(origin) 
            || preservedTypes.some(function(preservedType) { return origin instanceof preservedType; })) {
    return origin;
  } else if (origin.id !== undefined && (this.existingHomeObjects[origin.id] !== undefined // Already in home
                                        || newObjects[origin.id] !== undefined  // Already in new objects
                                        || origin instanceof Home)) { // Home always exists
    return origin.id;
  } else {
    var destination = {};
    if (origin.id !== undefined) {
      // New object case
      newObjects[origin.id] = destination;
    }
    if (origin.constructor && origin.constructor.__class) {
      destination._type = origin.constructor.__class;
    }
    var propertyNames = Object.getOwnPropertyNames(origin);
    for (var j = 0; j < propertyNames.length; j++) {
      var propertyName = propertyNames[j];
      // Hack: controllers are not serialized but a dummy field is necessary for deserialization
      if (propertyName === 'controller') {
        destination[propertyName] = true;
        continue;
      }
      if (Object.getOwnPropertyDescriptor(origin, propertyName)['_transient'] === true) {
        continue;
      }
      if (skippedPropertyNames.indexOf(propertyName) === -1) {
        var propertyValue = origin[propertyName];
        if (typeof propertyValue !== 'function' 
            && !skippedTypes.some(function(skippedType) { return propertyValue instanceof skippedType; })) {
          destination[propertyName] = this.substituteIdentifiableObjects(propertyValue, newObjects, skippedPropertyNames, skippedTypes, preservedTypes);
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
 * Define HomeApplication implementation.
 * @param {string} serverBaseUrl the server's base URL (if undefined, will use local files for testing)
 */
function SweetHome3DJSApplication(serverBaseUrl) {
  HomeApplication.call(this);
  this.homeControllers = {};
  this.serverBaseUrl = serverBaseUrl;
  var application = this;
  if (serverBaseUrl) {
    this.addHomesListener(function(ev) {
        if (ev.getType() == CollectionEvent.Type.ADD) {
          var homeController = this.application.createHomeController(ev.getItem());
          application.homeControllers[ev.getItem().id] = homeController; 
          application.getHomeRecorder().addHome(ev.getItem());
          homeController.getView();
        } else if (ev.getType() == CollectionEvent.Type.DELETE) {
          application.getHomeRecorder().deleteHome(ev.getItem());
        }
      });
  } else {
    this.addHomesListener(function(ev) {
        if (ev.getType() == CollectionEvent.Type.ADD) {
          this.application.createHomeController(ev.getItem()).getView();
        }
      });
  }
}
SweetHome3DJSApplication.prototype = Object.create(HomeApplication.prototype);
SweetHome3DJSApplication.prototype.constructor = SweetHome3DJSApplication;

SweetHome3DJSApplication.prototype.getVersion = function() {
  return "6.4 Beta";
}

SweetHome3DJSApplication.prototype.getHomeController = function(home) {
  return this.homeControllers[home.id];
}

SweetHome3DJSApplication.prototype.getHomeRecorder = function() {
  if (!this.homeRecorder) {
    if (this.serverBaseUrl) {
      this.homeRecorder = new IncrementalHomeRecorder(this, this.serverBaseUrl);
    } else {
      this.homeRecorder = new HomeRecorder();
    }
  }
  return this.homeRecorder;
}

SweetHome3DJSApplication.prototype.getUserPreferences = function() {
  if (this.preferences == null) {
    this.preferences = new DefaultUserPreferences();
    this.preferences.setFurnitureViewedFromTop(true);
  }
  return this.preferences;
}

SweetHome3DJSApplication.prototype.getViewFactory = function() {
  if (this.viewFactory == null) {
    var dummyDialogView = {
        displayView: function(parent) { }
      }; 
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
          return dummyDialogView;
        },
        createWallView: function(preferences,  wallController) {
          return dummyDialogView;
        },
        createRoomView: function(preferences, roomController) {
          return dummyDialogView;
        },
        createPolylineView: function(preferences, polylineController) {
          return dummyDialogView;
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
        },
      };
    this.viewFactory.__interfaces = ["com.eteks.sweethome3d.viewcontroller.ViewFactory"];
  }
  return this.viewFactory;
}

SweetHome3DJSApplication.prototype.createHomeController = function(home) {
  return new HomeController(home, this.getUserPreferences(), this.getViewFactory());
  // TODO Should be: return new HomeController(home, this, this.getViewFactory());
}
