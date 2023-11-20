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

  if (this.home.isModified() || this.home.isRecovered()) {
    this.getView().confirmSave(this.application.configuration === undefined || this.home.getName() !== this.application.configuration.defaultHomeName ? this.home.getName() : null, 
        function(save) {
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
      var preferences = this.application.getUserPreferences();
      var openingTaskDialog = new JSDialog(preferences, 
          preferences.getLocalizedString("ThreadedTaskPanel", "threadedTask.title"), 
          preferences.getLocalizedString("HomeController", "openMessage"), { size: "small" });
      openingTaskDialog.findElement(".dialog-cancel-button").style = "display: none";

      var fileInput = document.createElement("input");
      fileInput.setAttribute("style", "display: none");
      fileInput.setAttribute("type", "file");
      document.body.appendChild(fileInput);  
      fileInput.addEventListener("change", function(ev) {
          document.body.removeChild(fileInput);
          if (this.files[0]) {
            openingTaskDialog.displayView();
            var file = this.files[0];
            setTimeout(function() {
                var homeName = file.name.substring(file.name.indexOf("/") + 1);
                controller.application.getHomeRecorder().readHome(URL.createObjectURL(file), {
                    homeLoaded: function(home) {
                      // Do not set home name because file name may have been altered automatically by browser when saved
                      controller.close();
                      openingTaskDialog.close(); 
                      controller.application.addHome(home);
                    },
                    homeError: function(error) {
                      openingTaskDialog.close(); 
                      var message = preferences.
                          getLocalizedString("HomeController", "openError", homeName) + "\n" + error;
                      console.log(error);
                      alert(message);
                    }
                  });
              }, 100);
          }
        }); 
      fileInput.click();
    };

  if (this.home.isModified() || this.home.isRecovered()) {
    this.getView().confirmSave(this.application.configuration === undefined || this.home.getName() !== this.application.configuration.defaultHomeName ? this.home.getName() : null, 
        function(save) {
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
  if (this.home.getName() == null
      || (this.application.configuration !== undefined && this.home.getName() === this.application.configuration.defaultHomeName)) {
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
    if (this.application.getHomeRecorder().configuration && this.application.getHomeRecorder().configuration.writeHomeWithWorker) {
      savingTaskDialog.findElement(".dialog-cancel-button").innerHTML = 
          ResourceAction.getLocalizedLabelText(preferences, "ThreadedTaskPanel", "cancelButton.text");
    } else {
     savingTaskDialog.findElement(".dialog-cancel-button").style = "display: none";
    }
    savingTaskDialog.displayView();
    
    var controller = this;
    var homeExtension = application.getUserPreferences().getLocalizedString("FileContentManager", "homeExtension");   // .sh3d
    var homeExtension2 = application.getUserPreferences().getLocalizedString("FileContentManager", "homeExtension2"); // .sh3x
    var homeName = controller.home.getName().replace(homeExtension, homeExtension2);
    setTimeout(function() {
        savingTaskDialog.writingOperation = controller.application.getHomeRecorder().writeHome(controller.home, homeName, {
            homeSaved: function(home, blob) {
              delete savingTaskDialog.writingOperation;
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
              home.setRecovered(false);
              if (postSaveTask !== undefined) {
                postSaveTask();
              }
            },
            homeError: function(status, error) {
              savingTaskDialog.close(); 
              console.log(status + " " + error);
              new JSDialog(preferences, 
                  preferences.getLocalizedString("HomePane", "error.title"),
                  preferences.getLocalizedString("HomeController", "saveError", homeName, status + "<br>" + error),  
                 { size: "small" }).displayView(); 
            }
          });
      }, 200); // Add a little delay to ensure savingTaskDialog is displayed immediately and when no worker started
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
  if (homeName != null && homeName.length > 0) {
    var homeExtension2 = application.getUserPreferences().getLocalizedString("FileContentManager", "homeExtension2"); // .sh3x
    this.home.setName(homeName + (homeName.indexOf('.') < 0 ? homeExtension2 : ""));
    this.save(postSaveTask);    
  }
}

/**
 * Removes home from application homes list.
 */
LocalFileHomeController.prototype.close = function() {
  this.home.setRecovered(false);
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

  if (this.home.isModified() || this.home.isRecovered()) {
    this.getView().confirmSave(this.application.configuration === undefined || this.home.getName() !== this.application.configuration.defaultHomeName ? this.home.getName() : null, 
        function(save) {
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
      if (homeName != null && homeName.length > 0) {
        controller.application.getHomeRecorder().readHome(homeName, 
          {
            homeLoaded: function(home) {
              home.setName(homeName);
              controller.close();
              controller.application.addHome(home);
            },
            homeError: function(error) {
              var message = preferences.getLocalizedString("HomeController", "openError", homeName) + "\n" + error;
              console.log(error);
              alert(message);
            },
            progression: function(part, info, percentage) {
            }
          });
      }
    };
  var selectHome = function() {
      var request = controller.application.getHomeRecorder().getAvailableHomes({
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
                  size: "small", 
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
                      deleteButton.disabled = ev.target.innerHTML == controller.home.getName();
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
                  controller.confirmDeleteHome(item.innerText, function() {
                      controller.application.getHomeRecorder().deleteHome(item.innerText, {
                          homeDeleted: function() {
                            item.remove();
                            okButton.disabled = true;
                            deleteButton.disabled = true;
                          },
                          homeError: function(status, error) {
                            var message = preferences.getLocalizedString("AppletContentManager", "confirmDeleteHome.errorMessage", item.innerText);
                            console.log(message + " : " + error); 
                            alert(message);
                          }
                        });
                    });
                });
              fileDialog.displayView();
            }
          }, 
          homesError: function(status, error) {
            var message = preferences.getLocalizedString("AppletContentManager", "showOpenDialog.availableHomesError");
            console.log(message + " : " + error); 
            alert(message);
          }
        });
        
      if (request == null) {
        var message = preferences.getLocalizedString("AppletContentManager", "showOpenDialog.message");
        readTask(prompt(message));
      }
    };  
  
  if (this.home.isModified() || this.home.isRecovered()) {
    this.getView().confirmSave(this.application.configuration === undefined || this.home.getName() !== this.application.configuration.defaultHomeName ? this.home.getName() : null, 
        function(save) {
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
  if (this.home.getName() == null
      || (this.application.configuration !== undefined && this.home.getName() === this.application.configuration.defaultHomeName)) {
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
          home.setRecovered(false);
          if (postSaveTask !== undefined) {
            postSaveTask();
          }
        }, 
        homeError: function(status, error) { 
          savingTaskDialog.close();
          new JSDialog(preferences, 
              preferences.getLocalizedString("HomePane", "error.title"),
              preferences.getLocalizedString("HomeController", "saveError", [controller.home.getName(), error]),  
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
  var homeName = prompt(message, this.home.getName() != null 
      && (this.application.configuration === undefined 
          || this.home.getName() !== this.application.configuration.defaultHomeName) 
      ? this.home.getName() 
      : undefined);
 
  if (homeName != null && homeName.length > 0) {
    var controller = this;
    var request = controller.application.getHomeRecorder().getAvailableHomes({
        availableHomes: function(homeNames) {
          var homeExists = false;
          for (var i = 0; i < homeNames.length; i++) {
            if (homeName == homeNames [i]) {
              homeExists = true;
            }
          }
          if (!homeExists) {
            controller.home.setName(homeName);
            controller.save(postSaveTask);    
          } else {
            var message = preferences.getLocalizedString("FileContentManager", "confirmOverwrite.message", homeName).replace(/\<br\>/g, " ");
            var confirmOverwriteDialog = new JSDialog(preferences, 
                preferences.getLocalizedString("FileContentManager", "confirmOverwrite.title"), 
                message + "</font>", 
                { 
                  size: "small", 
                  applier: function() {
                    controller.home.setName(homeName);
                    controller.save(postSaveTask);
                  }
                });
            confirmOverwriteDialog.findElement(".dialog-ok-button").innerHTML = 
                preferences.getLocalizedString("FileContentManager", "confirmOverwrite.overwrite");
            var cancelButton = confirmOverwriteDialog.findElement(".dialog-cancel-button");
            cancelButton.innerHTML = preferences.getLocalizedString("FileContentManager", "confirmOverwrite.cancel");
            confirmOverwriteDialog.displayView();
          }
        }, 
        homesError: function(status, error) {
          var message = preferences.getLocalizedString("AppletContentManager", "showSaveDialog.checkHomeError");
          console.log(message + " : " + error); 
          alert(message);
        }
      });
        
    if (request == null) {
      this.home.setName(homeName);
      this.save(postSaveTask);    
    };  
  }
}

/**
 * Removes home from application homes list.
 */
DirectRecordingHomeController.prototype.close = function() {
  this.home.setRecovered(false);
  this.application.deleteHome(this.home);  
  this.getView().dispose();
}

/**
 * Displays a dialog that lets user choose whether he wants to delete
 * a home or not, then calls <code>confirm</code>.
 * @param {function} confirm 
 * @private
 */
DirectRecordingHomeController.prototype.confirmDeleteHome = function(homeName, confirm) {
  var preferences = this.application.getUserPreferences();
  var message = preferences.getLocalizedString("AppletContentManager", "confirmDeleteHome.message", homeName).replace(/\<br\>/g, " ");
  var confirmDeletionDialog = new JSDialog(preferences, 
      preferences.getLocalizedString("AppletContentManager", "confirmDeleteHome.title"), 
      message + "</font>", 
      { 
        size: "small", 
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
 *          defaultUserLanguage: string,
 *          writeCacheResourceURL: string,
 *          readCacheResourceURL: string,
 *          listCacheResourcesURL: string,
 *          listHomesURL: string,
 *          deleteHomeURL: string,
 *          autoRecovery: boolean,
 *          autoRecoveryDatabase: string,
 *          autoRecoveryObjectstore: string,
 *          silentAutoRecovery: boolean,
 *          compressionLevel: number,
 *          includeAllContent: boolean,
 *          writeDataType: string,
 *          writeHomeWithWorker: boolean, 
 *          defaultHomeName: string,
 *          writingObserver: {writeStarted: Function, 
 *                            writeSucceeded: Function, 
 *                            writeFailed: Function, 
 *                            connectionFound: Function, 
 *                            connectionLost: Function}}  [configuration] 
 *              the URLs of resources and services required on server
 *              (if undefined, will use local files for testing).
 *              If writePreferencesResourceURL / readPreferencesResourceURL is missing,
 *              writeResourceURL / readResourceURL will be used.
 *              If writeHomeEditsURL and readHomeURL are missing, application recorder will be 
 *              an instance of <code>HomeRecorder</code>.
 *              If writeHomeEditsURL is missing, application recorder will be 
 *              an instance of <code>DirectHomeRecorder</code>.
 *              Auto recovery not available for incremental recorder.
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
    
  if (this.configuration !== undefined
      && this.configuration.autoRecovery 
      && this.configuration.writeHomeEditsURL === undefined) {
    setTimeout(function() {
        // Launch auto recovery manager
        application.autoRecoveryManager = new AutoRecoveryManager(application);
      });
  }  
}
SweetHome3DJSApplication.prototype = Object.create(HomeApplication.prototype);
SweetHome3DJSApplication.prototype.constructor = SweetHome3DJSApplication;

SweetHome3DJSApplication.prototype.getVersion = function() {
  return "7.2a";
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
  }
  return this.preferences;
}

SweetHome3DJSApplication.prototype.createHome = function() {
  var home = HomeApplication.prototype.createHome.call(this);
  if (this.configuration !== undefined && this.configuration.defaultHomeName !== undefined) {
    home.setName(this.configuration.defaultHomeName);
  }
  return home;
}

/**
 * Returns the view factory which will create the views associated to their controllers. 
 * @return {Object}
 */
SweetHome3DJSApplication.prototype.getViewFactory = function() {
  if (this.viewFactory == null) {
    this.viewFactory = new JSViewFactory(this);
  }
  return this.viewFactory;
}

/**
 * Create the <code>HomeController</code> which controls the given <code>home</code>.
 * @param {Home} home
 */
SweetHome3DJSApplication.prototype.createHomeController = function(home) {
  return this.configuration === undefined || this.configuration.readHomeURL === undefined
      ? new LocalFileHomeController(home, this, this.getViewFactory())
      : (this.configuration.writeHomeEditsURL !== undefined
          ? new HomeController(home, this, this.getViewFactory())
          : new DirectRecordingHomeController(home, this, this.getViewFactory()));
}

/**
 * Returns the <code>HomeController</code> associated to the given <code>home</code>.
 * @return {HomeController}
 */
SweetHome3DJSApplication.prototype.getHomeController = function(home) {
  return this.homeControllers[this.getHomes().indexOf(home)];
}

/**
 * Manager able to automatically save open homes in recovery database with a timer.
 * The delay between two automatic save operations is specified by 
 * {@link UserPreferences#getAutoSaveDelayForRecovery() auto save delay for recovery}
 * property.
 * @constructor
 * @param {SweetHome3DJSApplication} application
 * @ignored
 * @author Emmanuel Puybaret
 */
function AutoRecoveryManager(application) {
  this.application = application;
  var autoRecoveryDatabase = "SweetHome3DJS";
  var autoRecoveryObjectstore = "Recovery";
  if (application.configuration.autoRecoveryDatabase !== undefined) {
    autoRecoveryDatabase = application.configuration.autoRecoveryDatabase;
  }
  if (application.configuration.autoRecoveryObjectstore !== undefined) {
    autoRecoveryObjectstore = application.configuration.autoRecoveryObjectstore;
  }
  
  var manager = this;
  this.autoRecoveryDatabaseUrlBase = "indexeddb://" + autoRecoveryDatabase + "/" + autoRecoveryObjectstore;
  // Auto recovery recorder stores data in autoRecoveryObjectstore object store of IndexedDB
  function AutoRecoveryRecorder() {
     HomeRecorder.call(this, {
        readHomeURL: manager.autoRecoveryDatabaseUrlBase + "/content?name=%s.recovered", 
        writeHomeURL: manager.autoRecoveryDatabaseUrlBase + "?keyPathField=name&contentField=content&dateField=date&name=%s.recovered", 
        readResourceURL: manager.autoRecoveryDatabaseUrlBase + "/content?name=%s",
        writeResourceURL: manager.autoRecoveryDatabaseUrlBase + "?keyPathField=name&contentField=content&dateField=date&name=%s", 
        listHomesURL: manager.autoRecoveryDatabaseUrlBase + "?name=(.*).recovered",
        deleteHomeURL: manager.autoRecoveryDatabaseUrlBase + "?name=%s.recovered",
        writeHomeWithWorker: true
      });
  }
  AutoRecoveryRecorder.prototype = Object.create(DirectHomeRecorder.prototype);
  AutoRecoveryRecorder.prototype.constructor = DirectHomeRecorder;

  // Reuse XML handler of application recorder
  AutoRecoveryRecorder.prototype.getHomeXMLHandler = function() {
    return application.getHomeRecorder().getHomeXMLHandler();
  }
  
  // Reuse XML exporter of application recorder
  AutoRecoveryRecorder.prototype.getHomeXMLExporter = function() {
    return application.getHomeRecorder().getHomeXMLExporter();
  }

  this.autoSaveRecorder = new AutoRecoveryRecorder();
  this.recoveredHomeNames = [];
  var homeExtension1 = application.getUserPreferences().getLocalizedString("FileContentManager", "homeExtension");
  var homeExtension2 = application.getUserPreferences().getLocalizedString("FileContentManager", "homeExtension2");
  var homeModificationListener = function(ev) {
      var home = ev.getSource(); 
      if (!home.isModified()) {
        home.removePropertyChangeListener("MODIFIED", homeModificationListener);
        // Delete auto saved in 1s in case user was traversing quickly the undo/redo pile
        setTimeout(function() {
            if (!home.isModified()) {
              manager.deleteRecoveredHome(home.getName());
            }
            home.addPropertyChangeListener("MODIFIED", homeModificationListener);
          }, 1000);
      }
    }; 
  var homeNameModificationListener = function(ev) {
      manager.recoveredHomeNames.splice(manager.recoveredHomeNames.indexOf(ev.getOldValue()), 1);
      if (!ev.getSource().isRecovered()) {
        manager.deleteRecoveredHome(ev.getOldValue());
      }
      manager.recoveredHomeNames.push(ev.getNewValue());
    }; 
  var homesListener = function(ev) {
      var home = ev.getItem();
      if (ev.getType() == CollectionEvent.Type.ADD) {
        manager.autoSaveRecorder.getAvailableHomes({
            availableHomes: function(homeNames) {
              if (home.getName() != null) {
                manager.recoveredHomeNames.push(home.getName());
              }
              var recoveredHome = false;
              for (var i = 0; i < homeNames.length; i++) {
                if (home.getName() != null 
                    && this.homeNamesEqual(home.getName(), homeNames [i])) {
                  if (application.configuration.silentAutoRecovery
                      || confirm(application.getUserPreferences().getLocalizedString("SweetHome3DJSApplication", "confirmRecoverHome"))) {
                    recoveredHome = true;
                    manager.autoSaveRecorder.readHome(homeNames [i], {
                        homeLoaded: function(replacingHome) {
                          application.removeHomesListener(homesListener);
                          application.getHomeController(home).close();
                          var homeName = replacingHome.getName();
                          replacingHome.setRecovered(true);
                          replacingHome.addPropertyChangeListener("RECOVERED", function(ev) {
                              if (!replacingHome.isRecovered()) {
                                manager.recoveredHomeNames.splice(manager.recoveredHomeNames.indexOf(replacingHome.getName()), 1);
                                manager.deleteRecoveredHome(homeName);
                                replacingHome.addPropertyChangeListener("MODIFIED", homeModificationListener);
                              }
                            });
                          replacingHome.addPropertyChangeListener("NAME", homeNameModificationListener);
                          application.addHome(replacingHome);
                          application.addHomesListener(homesListener);
                        },
                        homeError: function(error) {
                          var message = application.getUserPreferences().
                              getLocalizedString("HomeController", "openError", home.getName()) + "\n" + error; 
                          console.log(message);
                          alert(message);
                        },
                      });
                  } else {
                    manager.recoveredHomeNames.splice(manager.recoveredHomeNames.indexOf(home.getName()), 1);
                    manager.deleteRecoveredHome(homeNames [i]);
                  }
                  break;
                }
              }
              
              if (!recoveredHome) {
                home.addPropertyChangeListener("MODIFIED", homeModificationListener);
                home.addPropertyChangeListener("NAME", homeNameModificationListener);
                if (home.isModified()) {
                  manager.saveRecoveredHomes();
                  manager.restartTimer();
                }
              }
            },
            homesError: function(status, error) {
              console.log("Couldn't retrieve homes from database : " + status + " " + error); 
            },
            homeNamesEqual: function(name1, name2) {
              // If both names ends by a home extension
              var name1Extension1Index = name1.indexOf(homeExtension1, name1.length - homeExtension1.length);
              var name1Extension2Index = name1.indexOf(homeExtension2, name1.length - homeExtension2.length);
              var name2Extension1Index = name2.indexOf(homeExtension1, name2.length - homeExtension1.length);
              var name2Extension2Index = name2.indexOf(homeExtension2, name2.length - homeExtension2.length);
              if ((name1Extension1Index > 0 || name1Extension2Index > 0)
                  && (name2Extension1Index > 0 || name2Extension2Index > 0)) {
                var name1WithoutExtension = name1Extension1Index > 0 
                    ? name1.substring(0, name1Extension1Index)
                    : name1.substring(0, name1Extension2Index);
                var name2WithoutExtension = name2Extension1Index > 0 
                    ? name2.substring(0, name2Extension1Index)
                    : name2.substring(0, name2Extension2Index);
                return name1WithoutExtension === name2WithoutExtension;
              } else {
                return name1 === name2;
              }
            }
          });
      } else if (ev.getType() == CollectionEvent.Type.DELETE
                 && home.getName() != null) {
        if (manager.recoveredHomeNames.indexOf(home.getName()) >= 0) {
          manager.recoveredHomeNames.splice(manager.recoveredHomeNames.indexOf(home.getName()), 1);
          manager.deleteRecoveredHome(home.getName());
        }
        home.removePropertyChangeListener("MODIFIED", homeModificationListener);
      }
    };
  application.addHomesListener(homesListener);
    
  this.lastAutoSaveTime = Date.now();
  application.getUserPreferences().addPropertyChangeListener("AUTO_SAVE_DELAY_FOR_RECOVERY", function(ev) {
      manager.restartTimer();
    });
  this.restartTimer();
}

/**
 * Saves now modified document in auto recovery.
 * @ignored
 */
AutoRecoveryManager.prototype.saveRecoveredHomes = function() {
  var homes = this.application.getHomes();
  for (var i = 0; i < homes.length; i++) {
    var home = homes [i];
    if (home.getName() != null) {
      if (home.isModified()) {
        this.autoSaveRecorder.writeHome(home, home.getName(), {
            homeSaved: function(home) {
            },
            homeError: function(status, error) {
              console.log("Couldn't save home for recovery : " + status + " " + error); 
            }
          });
      } else if (this.recoveredHomeNames.indexOf(home.getName()) < 0) {
        this.deleteRecoveredHome(home.getName());
      }
    }
  }
  this.lastAutoSaveTime = Math.max(this.lastAutoSaveTime, Date.now());
}

/**
 * Restarts the timer that regularly saves application homes.
 * @ignored
 */
AutoRecoveryManager.prototype.restartTimer = function() {
  var manager = this;
  this.stopTimer();
  var autoSaveDelayForRecovery = application.getUserPreferences().getAutoSaveDelayForRecovery();
  if (autoSaveDelayForRecovery > 0) {
    var autoSaveTask = function() {
        if (Date.now() - manager.lastAutoSaveTime > 5000) {
          manager.saveRecoveredHomes();
        }
      };
    this.timerIntervalId = setInterval(autoSaveTask, autoSaveDelayForRecovery);
  }
}

/**
 * Restarts the timer that regularly saves application homes.
 * @ignored
 */
AutoRecoveryManager.prototype.stopTimer = function() {
  if (this.timerIntervalId) {
    window.clearInterval(this.timerIntervalId);
    delete this.timerIntervalId;
  }
}

/**
 * Deletes the given home form auto recovery database.
 * @private
 */
AutoRecoveryManager.prototype.deleteRecoveredHome = function(homeName) {
  var manager = this;
  this.autoSaveRecorder.deleteHome(homeName, { 
      homeDeleted: function() {
        if (manager.recoveredHomeNames.length == 0) {
          // Remove all data if no homes are left in Recovery database
          // except if an opened home was previously recovered (saving it again will make its data necessary)
          manager.autoSaveRecorder.getAvailableHomes({
              availableHomes: function(homeNames) {
                if (homeNames.length === 0) {
                  var dummyRecorder = new DirectHomeRecorder({
                      listHomesURL: manager.autoRecoveryDatabaseUrlBase + "?name=.*",
                      deleteHomeURL: manager.autoRecoveryDatabaseUrlBase + "?name=%s"
                    });
                  dummyRecorder.getAvailableHomes({ 
                      availableHomes: function(dataNames) {
                        for (var i = 0; i < dataNames.length; i++) {
                          dummyRecorder.deleteHome(dataNames [i], { homeDeleted: function() {} });
                        }
                      }
                    });
                }  
              }
            });
        }
      }
    });      
}
