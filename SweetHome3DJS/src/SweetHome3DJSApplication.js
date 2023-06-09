/*
 * SweetHome3DJSApplication.js
 *
 * Sweet Home 3D, Copyright (c) 2022 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
// Requires HomePane.js
// Requires JSViewFactory.js


/**
 * Creates a home controller handling savings for local files.
 * @param {Home} [home] the home controlled by this controller
 * @param {HomeApplication} [application] 
 * @param {ViewFactory} [viewFactory]
 * @constructor
 * @author Emmanuel Puybaret
 * @ignore
 */
function LocalFileHomeController(home, application, viewFactory) {
  HomeController.call(this, home, application, viewFactory);  
}
LocalFileHomeController.prototype = Object.create(HomeController.prototype);
LocalFileHomeController.prototype.constructor = LocalFileHomeController;

/**
 * Creates a new home after closing the current home.
 */
LocalFileHomeController.prototype.newHome = function() {
  var controller = this;
  var newHomeTask = function() {
      controller.close();
      controller.application.addHome(controller.application.createHome());
    };

  if (this.home.isModified()) {
    this.getView().confirmSave(this.home.getName(), function(save) {
        if (save) {
          controller.save(newHomeTask);
        } else {
          newHomeTask();
        } 
      });
  } else {
    newHomeTask();
  }
}

/**
 * Opens a home chosen by the user.
 */
LocalFileHomeController.prototype.open = function() {
  var controller = this;
  var openHome = function(homeName) {
	  var fileInput = document.createElement('input');
	  fileInput.setAttribute("style", "display: none");
	  fileInput.setAttribute("type", "file");
	  document.body.appendChild(fileInput);  
	  fileInput.addEventListener("input", function(ev) {
	      document.body.removeChild(fileInput);
	      if (this.files[0]) {
	        var homeName = this.files[0].name.substring(this.files[0].name.indexOf("/") + 1);
	        controller.application.getHomeRecorder().readHome(URL.createObjectURL(this.files[0]), {
	            homeLoaded: function(home) {
	              home.setName(homeName);
	              controller.close();
	              controller.application.addHome(home);
	            },
	            homeError: function(error) {
	              var message = controller.application.getUserPreferences().
	                  getLocalizedString("HomeController", "openError", homeName) + "\n" + error;
	              console.error(error);
	              alert(message);
	            }
	          });
	      }
	    }); 
	  fileInput.click();
	};

  if (this.home.isModified()) {
    this.getView().confirmSave(this.home.getName(), function(save) {
        if (save) {
          controller.save(openHome);
        } else {
          openHome();
        } 
      });
  } else {
    openHome();
  }
}

/**
 * Saves the home managed by this controller. If home name doesn't exist,
 * this method will act as {@link #saveAs() saveAs} method.
 * @param {function} [postSaveTask]
 */
LocalFileHomeController.prototype.save = function(postSaveTask) {
  if (this.home.getName() == null) {
    this.saveAs(postSaveTask);
  } else {
    var preferences = this.application.getUserPreferences();
    var savingTaskDialog = new JSDialog(preferences, 
        preferences.getLocalizedString("ThreadedTaskPanel", "threadedTask.title"), 
        preferences.getLocalizedString("HomeController", "saveMessage"), 
        { size: "small" });
    savingTaskDialog.findElement(".dialog-cancel-button").style = "display: none";
    savingTaskDialog.displayView();
    
    var controller = this;
    setTimeout(function() {
        var homeName = controller.home.getName().replace(".sh3d", ".sh3x");
        controller.application.getHomeRecorder().writeHome(controller.home, homeName, {
            homeSaved: function(home, blob) {
              savingTaskDialog.close(); 
              if (navigator.msSaveOrOpenBlob !== undefined) {
                navigator.msSaveOrOpenBlob(blob, homeName);
              } else {
                var downloadLink = document.createElement('a');
                downloadLink.setAttribute("style", "display: none");
                downloadLink.setAttribute("href", URL.createObjectURL(blob));
                downloadLink.setAttribute("download", homeName);
                document.body.appendChild(downloadLink);
                downloadLink.click();
                setTimeout(function() {
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(downloadLink.getAttribute("href"));
                  }, 500);
              }
              home.setModified(false);
              if (postSaveTask !== undefined) {
	            postSaveTask();
              }
            },
            homeError: function(status, error) {
              savingTaskDialog.close(); 
              console.log(error);
              new JSDialog(preferences, 
                  preferences.getLocalizedString("HomePane", "error.title"),
                  preferences.getLocalizedString("HomeController", "saveError", [homeName, error]),  
                 { size: "small" }).displayView(); 
            }
          });
      }, 200);
  }
}

/**
 * Saves the home managed by this controller with a different name.
 * @param {function} [postSaveTask]
 */
LocalFileHomeController.prototype.saveAs = function(postSaveTask) {
  var preferences = this.application.getUserPreferences();
  var message = preferences.getLocalizedString("AppletContentManager", "showSaveDialog.message");
  var homeName = prompt(message);
  if (homeName != null) {
    this.home.setName(homeName + (homeName.indexOf('.') < 0 ? ".sh3x" : ""));
    this.save(postSaveTask);    
  }
}

/**
 * Removes home from application homes list.
 */
LocalFileHomeController.prototype.close = function() {
  this.application.deleteHome(this.home);  
  this.getView().dispose();
}


/**
 * Creates a home controller handling savings from user interface.
 * @param {Home} [home] the home controlled by this controller
 * @param {HomeApplication} [application] 
 * @param {ViewFactory} [viewFactory]
 * @constructor
 * @author Emmanuel Puybaret
 * @ignore
 */
function DirectRecordingHomeController(home, application, viewFactory) {
  HomeController.call(this, home, application, viewFactory);  
}
DirectRecordingHomeController.prototype = Object.create(HomeController.prototype);
DirectRecordingHomeController.prototype.constructor = DirectRecordingHomeController;

/**
 * Creates a new home after saving and closing the current home.
 */
DirectRecordingHomeController.prototype.newHome = function() {
  var controller = this;
  var newHomeTask = function() {
      controller.close();
      controller.application.addHome(controller.application.createHome());
    };

  if (this.home.isModified()) {
    this.getView().confirmSave(this.home.getName(), function(save) {
        if (save) {
          controller.save(newHomeTask);
        } else {
          newHomeTask();
        } 
      });
  } else {
    newHomeTask();
  }
}

/**
 * Opens a home after saving and deleting the current home.
 */
DirectRecordingHomeController.prototype.open = function() {
  var controller = this;
  var preferences = controller.application.getUserPreferences();
  var readTask = function(homeName) {
      if (homeName != null) {
          controller.application.getHomeRecorder().readHome(homeName, 
          {
            homeLoaded: function(home) {
              home.setName(homeName);
              controller.close();
              controller.application.addHome(home);
            },
            homeError: function(error) {
              var message = preferences.getLocalizedString("HomeController", "openError", homeName) + "\n" + error;
              console.error(error);
              alert(message);
            },
            progression: function(part, info, percentage) {
            }
          });
      }
    };
  var selectHome = function() {
      var request = this.application.getHomeRecorder().getAvailableHomes({
          availableHomes: function(homes) {
            if (homes.length == 0) {
              var message = preferences.getLocalizedString("AppletContentManager", "showOpenDialog.noAvailableHomes");
              alert(message);
            } else {
              var html = 
                '  <div class="column1">' + 
                '    <div>@{AppletContentManager.showOpenDialog.message}</div>' + 
                '    <div class="home-list"></div>' + 
                '  </div>';
              var fileDialog = new JSDialog(preferences, "@{FileContentManager.openDialog.title}", html, 
                {
                  applier: function(dialog) {
                    var selectedItem = fileDialog.findElement(".selected");
                    if (selectedItem != null) {
                      readTask(selectedItem.innerText);
                    }
                  },
                });
              fileDialog.getHTMLElement().classList.add("open-dialog");
              var okButton = fileDialog.findElement(".dialog-ok-button");
              okButton.innerHTML = preferences.getLocalizedString("AppletContentManager", "showOpenDialog.open");
              okButton.disabled = true;
              var cancelButton = fileDialog.findElement(".dialog-cancel-button");
              cancelButton.innerHTML = preferences.getLocalizedString("AppletContentManager", "showOpenDialog.cancel");
              var deleteButton = document.createElement("button");
              deleteButton.innerHTML = preferences.getLocalizedString("AppletContentManager", "showOpenDialog.delete");
              deleteButton.disabled = true;
              cancelButton.parentElement.insertBefore(deleteButton, cancelButton);
              var homeList = fileDialog.findElement(".home-list");
                  
              for (var i = 0; i < homes.length; i++) {
                var item = document.createElement("div");
                item.classList.add("item"); 
                item.innerHTML = homes [i];
                homeList.appendChild(item);
              }
              
              var items = homeList.childNodes;
              fileDialog.registerEventListener(items, "click", function(ev) {
                  for (var i = 0; i < items.length; i++) {
                    if (ev.target == items [i]) {
                      items [i].classList.add("selected");
                      okButton.disabled = false;
                      deleteButton.disabled = false;
                    } else {
                      items [i].classList.remove("selected");
                    }
                  }
                });
              fileDialog.registerEventListener(items, "dblclick", function() {
                  fileDialog.validate();
                });
              fileDialog.registerEventListener(deleteButton, "click", function(ev) {
                  var item = fileDialog.findElement(".selected");
                  controller.confirmDelete(item.innerText, function() {
                      controller.application.getHomeRecorder().deleteHome(item.innerText, {
                          homeDeleted: function() {
                            item.remove();
                            okButton.disabled = true;
                            deleteButton.disabled = true;
                          }
                        });
                    });
                });
              fileDialog.displayView();
            }
          }, 
          homesError: function() {
          }
        });
        
      if (request == null) {
        var message = preferences.getLocalizedString("AppletContentManager", "showOpenDialog.message");
        readTask(prompt(message));
      }
    };  
  
  if (this.home.isModified()) {
    this.getView().confirmSave(this.home.getName(), function(save) {
        if (save) {
          controller.save(selectHome);
        } else {
          selectHome();
        } 
      });
  } else {
    selectHome();
  }
}

/**
 * Saves the home managed by this controller. If home name doesn't exist,
 * this method will act as {@link #saveAs() saveAs} method.
 * @param {function} [postSaveTask]
 */
DirectRecordingHomeController.prototype.save = function(postSaveTask) {
  if (this.home.getName() == null) {
    this.saveAs(postSaveTask);
  } else {
    var preferences = this.application.getUserPreferences();
    var savingTaskDialog = new JSDialog(preferences, 
        preferences.getLocalizedString("ThreadedTaskPanel", "threadedTask.title"), 
        preferences.getLocalizedString("HomeController", "saveMessage"), 
        { 
          size: "small", 
          disposer: function(dialog) { 
            if (dialog.writingOperation !== undefined) { 
              dialog.writingOperation.abort(); 
            } 
          } 
        });
    savingTaskDialog.findElement(".dialog-cancel-button").innerHTML = 
        ResourceAction.getLocalizedLabelText(preferences, "ThreadedTaskPanel", "cancelButton.text");
    savingTaskDialog.displayView();
    var controller = this;
    savingTaskDialog.writingOperation = this.application.getHomeRecorder().writeHome(this.home, this.home.getName(), { 
        homeSaved: function(home) { 
          delete savingTaskDialog.writingOperation;
          savingTaskDialog.close(); 
          home.setModified(false);
          if (postSaveTask !== undefined) {
            postSaveTask();
          }
        }, 
        homeError: function(error, text) { 
          savingTaskDialog.close();
          new JSDialog(preferences, 
              preferences.getLocalizedString("HomePane", "error.title"),
              preferences.getLocalizedString("HomeController", "saveError", [controller.home.getName(), text]),  
             { size: "small" }).displayView(); 
        } 
      }); 
  }
}

/**
 * Saves the home managed by this controller with a different name.
 * @param {function} [postSaveTask]
 */
DirectRecordingHomeController.prototype.saveAs = function(postSaveTask) {
  var preferences = this.application.getUserPreferences();
  var message = preferences.getLocalizedString("AppletContentManager", "showSaveDialog.message");
  var homeName = prompt(message);
  if (homeName != null) {
    this.home.setName(homeName);
    this.save(postSaveTask);    
  }
}

/**
 * Removes home from application homes list.
 */
DirectRecordingHomeController.prototype.close = function() {
  this.application.deleteHome(this.home);  
  this.getView().dispose();
}

/**
 * Displays a dialog that lets user choose whether he wants to delete
 * a home or not, then calls <code>confirm</code>.
 * @param {function} confirm 
 * @private
 */
DirectRecordingHomeController.prototype.confirmDelete = function(homeName, confirm) {
  var preferences = this.application.getUserPreferences();
  var message = preferences.getLocalizedString("AppletContentManager", "confirmDeleteHome.message", homeName);
  var confirmDeletionDialog = new JSDialog(preferences, 
      preferences.getLocalizedString("AppletContentManager", "confirmDeleteHome.title"), 
      message + "</font>", 
      { 
        applier: function() {
          confirm();
        }
      });
  confirmDeletionDialog.findElement(".dialog-ok-button").innerHTML = 
      preferences.getLocalizedString("AppletContentManager", "confirmDeleteHome.delete");
  var cancelButton = confirmDeletionDialog.findElement(".dialog-cancel-button");
  cancelButton.innerHTML = preferences.getLocalizedString("AppletContentManager", "confirmDeleteHome.cancel");
  confirmDeletionDialog.displayView();
}


/**
 * <code>HomeApplication</code> implementation for JavaScript.
 * @param {{furnitureCatalogURLs: string[],
 *          furnitureResourcesURLBase: string,
 *          texturesCatalogURLs: string[],
 *          texturesResourcesURLBase: string,
 *          readHomeURL: string,
 *          writeHomeEditsURL|writeHomeURL: string,
 *          closeHomeURL: string,
 *          writeResourceURL: string,
 *          readResourceURL: string,
 *          writePreferencesURL: string,
 *          readPreferencesURL: string,
 *          writePreferencesResourceURL: string,
 *          readPreferencesResourceURL: string,
 *          pingURL: string,
 *          autoWriteDelay: number,
 *          trackedHomeProperties: string[],
 *          autoWriteTrackedStateChange: boolean,
 *          userLanguage: string,
 *          writingObserver: {writeStarted: Function, 
 *                            writeSucceeded: Function, 
 *                            writeFailed: Function, 
 *                            connectionFound: Function, 
 *                            connectionLost: Function}}  [configuration] 
 *              the URLs of resources and services required on server
 *              (if undefined, will use local files for testing).
 *              If writePreferencesResourceURL / readPreferencesResourceURL is missing,
 *              writeResourceURL / readResourceURL will be used.
 * @constructor
 * @author Emmanuel Puybaret
 * @author Renaud Pawlak
 */
function SweetHome3DJSApplication(configuration) {
  HomeApplication.call(this);
  this.homeControllers = [];
  this.configuration = configuration;
  var application = this;
  this.addHomesListener(function(ev) {
      if (ev.getType() == CollectionEvent.Type.ADD) {
        var homeController = application.createHomeController(ev.getItem());
        application.homeControllers.push(homeController); 
        if (application.getHomeRecorder() instanceof IncrementalHomeRecorder) {
          application.getHomeRecorder().addHome(ev.getItem(), homeController);
        }
        homeController.getView();
      } else if (ev.getType() == CollectionEvent.Type.DELETE) {
        application.homeControllers.splice(ev.getIndex(), 1); 
        if (application.getHomeRecorder() instanceof IncrementalHomeRecorder) {
          application.getHomeRecorder().removeHome(ev.getItem());
        }
      }
    });
}
SweetHome3DJSApplication.prototype = Object.create(HomeApplication.prototype);
SweetHome3DJSApplication.prototype.constructor = SweetHome3DJSApplication;

SweetHome3DJSApplication.prototype.getVersion = function() {
  return "7.1";
}

SweetHome3DJSApplication.prototype.getHomeController = function(home) {
  return this.homeControllers[this.getHomes().indexOf(home)];
}

SweetHome3DJSApplication.prototype.getHomeRecorder = function() {
  if (!this.homeRecorder) {
    this.homeRecorder = this.configuration === undefined || this.configuration.readHomeURL === undefined
      ? new HomeRecorder(this.configuration)
      : (this.configuration.writeHomeEditsURL !== undefined
          ? new IncrementalHomeRecorder(this, this.configuration)
          : new DirectHomeRecorder(this.configuration));
  }
  return this.homeRecorder;
}

SweetHome3DJSApplication.prototype.getUserPreferences = function() {
  if (this.preferences == null) {
    if (this.configuration === undefined) {
      this.preferences = new DefaultUserPreferences();
    } else {
      this.preferences = new RecordedUserPreferences(this.configuration);
    }
    this.preferences.setFurnitureViewedFromTop(true);
  }
  return this.preferences;
}

SweetHome3DJSApplication.prototype.getViewFactory = function() {
  if (this.viewFactory == null) {
    this.viewFactory = new JSViewFactory(this);
  }
  return this.viewFactory;
}

SweetHome3DJSApplication.prototype.createHomeController = function(home) {
  return this.configuration === undefined || this.configuration.readHomeURL === undefined
      ? new LocalFileHomeController(home, this, this.getViewFactory())
      : (this.configuration.writeHomeEditsURL !== undefined
          ? new HomeController(home, this, this.getViewFactory())
          : new DirectRecordingHomeController(home, this, this.getViewFactory()));
}
