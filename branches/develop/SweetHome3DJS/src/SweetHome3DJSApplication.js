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
 * @param {{readHomeURL: string,
 *          writeHomeEditsURL: string,
 *          closeHomeURL: string} [serviceUrls] the URLs of services required on server
 * @constructor
 * @author Renaud Pawlak
 * @author Emmanuel Puybaret
 */
function IncrementalHomeRecorder(application, serviceUrls) {
  HomeRecorder.call(this);
  this.application = application;
  this.undoableEditListeners = {};
  this.editCounters = {};
  this.serviceUrls = serviceUrls;
  this.configuration = {};
}
IncrementalHomeRecorder.prototype = Object.create(HomeRecorder.prototype);
IncrementalHomeRecorder.prototype.constructor = IncrementalHomeRecorder;

/**
 * Configures this incremental recorder's behavior.
 * 
 * @param {Object} configuration an object containing configuration fields (manual)
 */
IncrementalHomeRecorder.prototype.configure = function(configuration) {
  this.configuration = configuration;
}

/**
 * Reads a home with this recorder.
 * @param {string} homeName the home name on the server 
 *                          or the URL of the home if <code>readHomeURL</code> service is missing 
 * @param {Object} observer an object to be notified with loading statuses 
 */
IncrementalHomeRecorder.prototype.readHome = function(homeName, observer) {
  if (this.serviceUrls !== undefined
      && this.serviceUrls.readHomeURL !== undefined) {
    // Replace % sequence by %% except %s before formating readHomeURL with home name 
    var readHomeUrl = CoreTools.format(this.serviceUrls.readHomeURL.replace(/(%[^s])/g, "%$1"), encodeURIComponent(homeName));
    homeName = readHomeUrl;
  }
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
  recorder.existingHomeObjects[home.id] = {}
  home.getHomeObjects().forEach(function(homeObject) {
    recorder.existingHomeObjects[home.id][homeObject.id] = homeObject.id;
  });
}

/**
 * Adds a home to be incrementally saved by this recorder.
 */
IncrementalHomeRecorder.prototype.addHome = function(home) {
  if (this.serviceUrls !== undefined
      && this.serviceUrls.writeHomeEditsURL !== undefined) {
    var recorder = this;
    // TODO: have a UUID
    home.id = HomeObject.createId("home");
    
    // TODO Remove logs
    console.info("addHome", home.id, this.application.getHomeController(home));

    this.checkPoint(home);

    console.info("collected ids: ", home, this.existingHomeObjects);
    console.info(Object.getOwnPropertyNames(home));

    var listener = {
        undoableEditHappened: function(undoableEditEvent) {
          recorder.storeEdit(home, undoableEditEvent.getEdit());
          recorder.sendUndoableEdits(home);
        }
      };
    this.undoableEditListeners[home.id] = listener;
    this.application.getHomeController(home).getUndoableEditSupport().addUndoableEditListener(listener);
    var undoManager = this.application.getHomeController(home).undoManager;
    var coreUndo = undoManager.undo;
    var coreRedo = undoManager.redo;
    this.application.getHomeController(home).undoManager.undo = function() {
        var edit = undoManager.editToBeUndone();
        console.info("UNDO", edit);
        coreUndo.call(undoManager);
        recorder.storeEdit(home, edit, true);
        if (!recorder.configuration.manual) {
          recorder.sendUndoableEdits(home);
        }
      };
    this.application.getHomeController(home).undoManager.redo = function() {
        var edit = undoManager.editToBeRedone();
        console.info("REDO", edit);
        coreRedo.call(undoManager);
        recorder.storeEdit(home, edit);
        if (!recorder.configuration.manual) {
          recorder.sendUndoableEdits(home);
        }
      };
  }
}

/**
 * Removes a home previously added with #addHome(home).
 */
IncrementalHomeRecorder.prototype.removeHome = function(home) {
  if (this.serviceUrls !== undefined) {
    if (this.serviceUrls['closeHomeURL'] !== undefined) {
      try {
        var xhr = new XMLHttpRequest();
        var closeHomeURL = CoreTools.format(this.serviceUrls.closeHomeURL.replace(/(%[^s])/g, "%$1"), encodeURIComponent(home.name));
        xhr.open('GET', closeHomeURL, true); // Asynchronous call required during beforeunload
        xhr.send();
      } catch (ex) {
        console.error(ex);
      }  
    }
    if (this.serviceUrls['writeHomeEditsURL'] !== undefined) {
      // TODO Find another way to get home controller because home isn't in application homes already
      this.application.getHomeController(home).getUndoableEditSupport().removeUndoableEditListener(this.undoableEditListeners[home.id]);
      delete existingHomeObjects[home.id];
    }
  }
}

/** 
 * Sends to the server all the currently waiting edits for the given home.  
 */
IncrementalHomeRecorder.prototype.sendUndoableEdits = function(home) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.serviceUrls['writeHomeEditsURL'], false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send('home=' + encodeURIComponent(home.name) + '&' +
             'edits=' + encodeURIComponent(JSON.stringify(this.getStoredEdits())));
    // TODO Remove log
    console.info("RESULT = " + xhr.responseText);
    this.commitEdits();
    //return JSON.parse(xhr.responseText);
  } catch (ex) {
    console.error(ex);
  }  
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
  console.info("substitution of edit", edit);
  var processedEdit = this.substituteIdentifiableObjects(
                                home,
                                edit,
                                newObjects,
                                ["object3D", "hasBeenDone", "alive", "presentationNameKey", "__parent"], 
                                [UserPreferences, PlanController, Home],
                                [Boolean, String, Number]);
  if (Object.getOwnPropertyNames(newObjects).length > 0) {
    processedEdit._newObjects = newObjects;
  }
  if (undoAction) {
    processedEdit._action = "undo";
  }
  console.info(key, processedEdit, JSON.stringify(processedEdit));
  // TODO: use local storage
  //localStorage.setItem(key, toJSON(o));
  if (!this.queue) {
    this.queue = [];
  }
  this.queue.push(processedEdit);
  
  // Update objects state 
  this.checkPoint(home);
  // CoreTools.merge(this.existingHomeObjects[home.id], newObjects);
}

/** 
 * @private 
 */
IncrementalHomeRecorder.prototype.getStoredEdits = function(home) {
  // TODO: use local storage
  return this.queue;
}

/** 
 * @private 
 */
IncrementalHomeRecorder.prototype.commitEdits = function(home) {
  // TODO: use local storage
  this.queue = [];
}

/** 
 * @private 
 */
IncrementalHomeRecorder.prototype.substituteIdentifiableObjects = function(home, origin, newObjects, skippedPropertyNames, skippedTypes, preservedTypes) {
  if (Array.isArray(origin)) {
    var destination = origin.slice(0);
    for (var i = 0; i < origin.length; i++) {
      destination[i] = this.substituteIdentifiableObjects(home, origin[i], newObjects, skippedPropertyNames, skippedTypes, preservedTypes);
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
          // console.info("prop", propertyName);
          if (propertyName.indexOf("Controller") > -1 || propertyName.indexOf("__parent") > -1) {
            console.info("prop", propertyName, origin.constructor, destination._type);
          }
          destination[propertyName] = this.substituteIdentifiableObjects(home, propertyValue, newObjects, skippedPropertyNames, skippedTypes, preservedTypes);
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
        application.getHomeRecorder().removeHome(ev.getItem());
        application.homeControllers.splice(ev.getIndex(), 1); 
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