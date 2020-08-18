/*
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

/**
 * Creates an action with properties retrieved from a resource bundle
 * in which key starts with <code>actionPrefix</code>.
 * @param {UserPreferences} preferences   user preferences used to retrieve localized description of the action
 * @param {Object} resourceClass the class used as a context to retrieve localized properties of the action
 * @param {string} actionPrefix  prefix used in resource bundle to search action properties
 * @param {boolean} enabled <code>true</code> if the action should be enabled at creation
 * @param {Object} controller the controller object holding the method to invoke 
 * @param {string} controllerMethod the controller method to invoke
 * @param {Object[]} parameters action parameters
 * @constructor
 * @extends AbstractAction
 * @ignore
 * @author Emmanuel Puybaret
 */
function ResourceAction(preferences, resourceClass, actionPrefix, enabled, controller, controllerMethod, parameters) {
  AbstractAction.call(this);
  if (enabled === undefined) {
    parameters = controllerMethod;
    controllerMethod = controller;
    controller = enabled;
    enabled = false;      
  }
  this.putValue(ResourceAction.RESOURCE_CLASS, resourceClass);
  this.putValue(ResourceAction.RESOURCE_PREFIX, actionPrefix);
  this.putValue(ResourceAction.VISIBLE, true);
  this.readActionProperties(preferences, resourceClass, actionPrefix);
  this.setEnabled(enabled);
  this.controller = controller;
  this.controllerMethod = controllerMethod;
  this.parameters = parameters;
  var resourceAction = this;
  preferences.addPropertyChangeListener("LANGUAGE", {
    propertyChange : function(ev) {
      if (resourceAction == null) {
        (ev.getSource()).removePropertyChangeListener("LANGUAGE", this);
      } else {
        resourceAction.readActionProperties(ev.getSource(), 
            resourceAction.getValue(ResourceAction.RESOURCE_CLASS), resourceAction.getValue(ResourceAction.RESOURCE_PREFIX));
      }
    }
  });
  return this;
}
ResourceAction.prototype = Object.create(AbstractAction.prototype);
ResourceAction.prototype.constructor = ResourceAction;

/**
 * Other property keys for Sweet Home 3D.
 */
ResourceAction.RESOURCE_CLASS = "ResourceClass";
ResourceAction.RESOURCE_PREFIX = "ResourcePrefix";
ResourceAction.VISIBLE = "Visible";
ResourceAction.POPUP = "Popup";
ResourceAction.TOGGLE_BUTTON_GROUP = "ToggleButtonGroup";
ResourceAction.TOOL_BAR_ICON = "ToolBarIcon";

/**
 * Reads from the properties of this action.
 * @param {UserPreferences} preferences
 * @param {Object} resourceClass
 * @param {string} actionPrefix
 * @private
 */
ResourceAction.prototype.readActionProperties = function(preferences, resourceClass, actionPrefix) {
  var propertyPrefix = actionPrefix + ".";
  this.putValue(AbstractAction.NAME, this.getOptionalString(preferences, resourceClass, propertyPrefix + AbstractAction.NAME, true));
  this.putValue(AbstractAction.DEFAULT, this.getValue(AbstractAction.NAME));
  this.putValue(ResourceAction.POPUP, this.getOptionalString(preferences, resourceClass, propertyPrefix + ResourceAction.POPUP, true));
  this.putValue(AbstractAction.SHORT_DESCRIPTION, this.getOptionalString(preferences, resourceClass, propertyPrefix + AbstractAction.SHORT_DESCRIPTION, false));
  this.putValue(AbstractAction.LONG_DESCRIPTION, this.getOptionalString(preferences, resourceClass, propertyPrefix + AbstractAction.LONG_DESCRIPTION, false));
  var smallIcon = this.getOptionalString(preferences, resourceClass, propertyPrefix + AbstractAction.SMALL_ICON, false);
  if (smallIcon != null) {
    this.putValue(AbstractAction.SMALL_ICON, smallIcon);
  }
  var toolBarIcon = this.getOptionalString(preferences, resourceClass, propertyPrefix + ResourceAction.TOOL_BAR_ICON, false);
  if (toolBarIcon != null) {
    this.putValue(ResourceAction.TOOL_BAR_ICON, toolBarIcon);
  }
  var propertyKey = propertyPrefix + AbstractAction.ACCELERATOR_KEY;
  var acceleratorKey = this.getOptionalString(preferences, resourceClass, propertyKey + "." + OperatingSystem.getName(), false);
  if (acceleratorKey == null) {
    acceleratorKey = this.getOptionalString(preferences, resourceClass, propertyKey, false);
  }
  if (acceleratorKey != null) {
    this.putValue(AbstractAction.ACCELERATOR_KEY, acceleratorKey);
  }
  var mnemonicKey = this.getOptionalString(preferences, resourceClass, propertyPrefix + AbstractAction.MNEMONIC_KEY, false);
  if (mnemonicKey != null) {
    this.putValue(AbstractAction.MNEMONIC_KEY, mnemonicKey);
  }
}

/**
 * Returns the value of <code>propertyKey</code> in <code>preferences</code>,
 * or <code>null</code> if the property doesn't exist.
 * @param {UserPreferences} preferences
 * @param {Object} resourceClass
 * @param {string} propertyKey
 * @param {boolean} label
 * @return {string}
 * @private
 */
ResourceAction.prototype.getOptionalString = function(preferences, resourceClass, propertyKey, label) {
  try {
    var localizedText = label 
        ? ResourceAction.getLocalizedLabelText(preferences, resourceClass, propertyKey) 
        : preferences.getLocalizedString(resourceClass, propertyKey);
    if (localizedText != null && localizedText.length > 0) {
      return localizedText;
    } else {
      return null;
    }
  } catch (ex) {
    return null;
  }
}

/**
 * Returns a localized text for menus items and labels depending on the system.
 * @param {UserPreferences} preferences
 * @param {Object} resourceClass
 * @param {string} propertyKey
 * @param {Array} label
 * @return {string}
 * @private
 */
ResourceAction.getLocalizedLabelText = function(preferences, resourceClass, resourceKey, resourceParameters) {
  var localizedString = preferences.getLocalizedString(resourceClass, resourceKey, resourceParameters);
  var language = Locale.getDefault();
  if (OperatingSystem.isMacOSX()
      && (language.indexOf("zh") == 0 // CHINESE
          || language.indexOf("ja") == 0 // JAPANESE
          || language.indexOf("ko") == 0 // KOREAN
          || language.indexOf("uk") == 0)) { // Ukrainian
    var openingBracketIndex = localizedString.indexOf('(');
    if (openingBracketIndex !== -1) {
      var closingBracketIndex = localizedString.indexOf(')');
      if (openingBracketIndex === closingBracketIndex - 2) {
        var c = localizedString.charAt(openingBracketIndex + 1);
        if (c >= 'A' && c <= 'Z') {
          localizedString = localizedString.substring(0, openingBracketIndex)
              + localizedString.substring(closingBracketIndex + 1);
        }
      }
    }
  }
  return localizedString;
}

/**
 * Calls the method on the controller given in constructor.
 * Unsupported operation. Subclasses should override this method if they want
 * to associate a real action to this class.
 * @param {java.awt.event.ActionEvent} ev
 */
ResourceAction.prototype.actionPerformed = function(ev) {
  if (this.controller != null && this.controllerMethod != null) {
    return this.controller[this.controllerMethod].apply(this.controller, this.parameters);
  } else {
    AbstractAction.prototype.actionPerformed.call(this, ev);
  }
}


/**
 * Creates home view associated with its controller.
 * @param {Home} home
 * @param {UserPreferences} preferences
 * @param {HomeController} controller
 * @constructor
 * @author Emmanuel Puybaret
 * @author Renaud Pawlak
 */
function HomePane(containerId, home, preferences, controller) {
  if (containerId != null) {
    this.container = document.getElementById(containerId);
  }
  if (!this.container) {
    this.container = document.body;
  }
  this.home = home;
  this.preferences = preferences;
  this.controller = controller;
  this.clipboardEmpty = true;
  this.actionMap = {};
  this.inputMap = {};
  this.createActions(home, preferences, controller);
  this.initActions(preferences);
  this.addHomeListener(home);
  this.addLevelVisibilityListener(home);
  this.addUserPreferencesListener(preferences);
  this.addPlanControllerListener(controller.getPlanController());
  this.createToolBar(home, preferences);
  
  // Additional implementation for Sweet Home 3D JS
  
  // Keyboard accelerators management
  var homePane = this;
  document.addEventListener("keydown", function(ev) {
      var keyStroke = KeyStroke.getKeyStrokeForEvent(ev);
      if (keyStroke !== undefined) {
        // Search action matching shortcut and call its actionPerformed method
        for (var actionType in homePane.actionMap) {
          var action = homePane.actionMap [actionType];
          if (action.isEnabled()
              && action.getValue(AbstractAction.ACCELERATOR_KEY) == keyStroke) {
            // TODO Allow only action with a button at screen ?
            action.actionPerformed();
            ev.stopPropagation();
            return;
          }
        }
        // Search other actions in input map
        var actionKey = homePane.inputMap [keyStroke];
        if (actionKey !== undefined) {
          var action = homePane.actionMap [actionKey];
          if (action !== undefined) {
            action.actionPerformed(ev);
          }
          ev.stopPropagation();
        }
      }
    }, true);

  var planComponent = controller.getPlanController().getView(); 
 
  // TODO Manage focus once furniture view will exist
  setTimeout(function() {
      controller.focusedViewChanged(planComponent);
    });

  // Restore viewport position if it exists
  var viewportX = home.getNumericProperty(HomePane.PLAN_VIEWPORT_X_VISUAL_PROPERTY);
  var viewportY = home.getNumericProperty(HomePane.PLAN_VIEWPORT_Y_VISUAL_PROPERTY);
  if (viewportX != null && viewportY != null) {
    planComponent.scrollPane.scrollLeft = viewportX | 0;
    planComponent.scrollPane.scrollTop = viewportY | 0;
  }

  planComponent.scrollPane.addEventListener("scroll", function(ev) {
      controller.setHomeProperty(HomePane.PLAN_VIEWPORT_X_VISUAL_PROPERTY, planComponent.scrollPane.scrollLeft.toString());
      controller.setHomeProperty(HomePane.PLAN_VIEWPORT_Y_VISUAL_PROPERTY, planComponent.scrollPane.scrollTop.toString());
    });

  // Create level selector
  var levelSelector = document.createElement("select");
  levelSelector.id = "level-selector";
  levelSelector.style.display = "inline";
  levelSelector.style.position = "absolute";
  planComponent.getHTMLElement().appendChild(levelSelector);

  var updateLevels = function() {
      levelSelector.innerHTML = "";
      if (home.getLevels().length < 2) {
        levelSelector.style.display = "none";
      } else {
        for (var i = 0; i < home.getLevels().length; i++) {
          var option = document.createElement("option");
          option.value = i;
          option.innerHTML = home.getLevels()[i].getName();
          if (home.getLevels()[i] === home.getSelectedLevel()) {
            option.selected = "selected";
          }
          levelSelector.appendChild(option);
        }
        levelSelector.style.display = "inline";
      }
    };
  updateLevels();
  levelSelector.addEventListener('change', function(ev) {
      home.setSelectedLevel(home.getLevels()[parseInt(ev.target.value)]);
      updateLevels();
    });
  home.addPropertyChangeListener(Home.SELECTED_LEVEL, function() {
      updateLevels();
    });
  home.addLevelsListener(function() {
      updateLevels();
    }); 
}

HomePane["__class"] = "HomePane";
HomePane["__interfaces"] = ["com.eteks.sweethome3d.viewcontroller.HomeView", "com.eteks.sweethome3d.viewcontroller.View"];


HomePane.MAIN_PANE_DIVIDER_LOCATION_VISUAL_PROPERTY = "com.eteks.sweethome3d.SweetHome3D.MainPaneDividerLocation";
HomePane.CATALOG_PANE_DIVIDER_LOCATION_VISUAL_PROPERTY = "com.eteks.sweethome3d.SweetHome3D.CatalogPaneDividerLocation";
HomePane.PLAN_PANE_DIVIDER_LOCATION_VISUAL_PROPERTY = "com.eteks.sweethome3d.SweetHome3D.PlanPaneDividerLocation";
HomePane.PLAN_VIEWPORT_X_VISUAL_PROPERTY = "com.eteks.sweethome3d.SweetHome3D.PlanViewportX";
HomePane.PLAN_VIEWPORT_Y_VISUAL_PROPERTY = "com.eteks.sweethome3d.SweetHome3D.PlanViewportY";
HomePane.FURNITURE_VIEWPORT_Y_VISUAL_PROPERTY = "com.eteks.sweethome3d.SweetHome3D.FurnitureViewportY";
HomePane.DETACHED_VIEW_VISUAL_PROPERTY = ".detachedView";
HomePane.DETACHED_VIEW_DIVIDER_LOCATION_VISUAL_PROPERTY = ".detachedViewDividerLocation";
HomePane.DETACHED_VIEW_X_VISUAL_PROPERTY = ".detachedViewX";
HomePane.DETACHED_VIEW_Y_VISUAL_PROPERTY = ".detachedViewY";
HomePane.DETACHED_VIEW_WIDTH_VISUAL_PROPERTY = ".detachedViewWidth";
HomePane.DETACHED_VIEW_HEIGHT_VISUAL_PROPERTY = ".detachedViewHeight";

/**
 * @private
 */
HomePane.MenuActionType = {};
HomePane.MenuActionType[HomePane.MenuActionType["FILE_MENU"] = 0] = "FILE_MENU";
HomePane.MenuActionType[HomePane.MenuActionType["EDIT_MENU"] = 1] = "EDIT_MENU";
HomePane.MenuActionType[HomePane.MenuActionType["FURNITURE_MENU"] = 2] = "FURNITURE_MENU";
HomePane.MenuActionType[HomePane.MenuActionType["PLAN_MENU"] = 3] = "PLAN_MENU";
HomePane.MenuActionType[HomePane.MenuActionType["VIEW_3D_MENU"] = 4] = "VIEW_3D_MENU";
HomePane.MenuActionType[HomePane.MenuActionType["HELP_MENU"] = 5] = "HELP_MENU";
HomePane.MenuActionType[HomePane.MenuActionType["OPEN_RECENT_HOME_MENU"] = 6] = "OPEN_RECENT_HOME_MENU";
HomePane.MenuActionType[HomePane.MenuActionType["ALIGN_OR_DISTRIBUTE_MENU"] = 7] = "ALIGN_OR_DISTRIBUTE_MENU";
HomePane.MenuActionType[HomePane.MenuActionType["SORT_HOME_FURNITURE_MENU"] = 8] = "SORT_HOME_FURNITURE_MENU";
HomePane.MenuActionType[HomePane.MenuActionType["DISPLAY_HOME_FURNITURE_PROPERTY_MENU"] = 9] = "DISPLAY_HOME_FURNITURE_PROPERTY_MENU";
HomePane.MenuActionType[HomePane.MenuActionType["MODIFY_TEXT_STYLE"] = 10] = "MODIFY_TEXT_STYLE";
HomePane.MenuActionType[HomePane.MenuActionType["GO_TO_POINT_OF_VIEW"] = 11] = "GO_TO_POINT_OF_VIEW";
HomePane.MenuActionType[HomePane.MenuActionType["SELECT_OBJECT_MENU"] = 12] = "SELECT_OBJECT_MENU";
HomePane.MenuActionType[HomePane.MenuActionType["TOGGLE_SELECTION_MENU"] = 13] = "TOGGLE_SELECTION_MENU";

/**
 * Returns the HTML element used to view this component at screen.
 */
HomePane.prototype.getHTMLElement = function() {
  return this.container;
}

/**
 * Returns the actions map registered with this component.
 */
HomePane.prototype.getActionMap = function() {
  return this.actionMap;
}

/**
 * Convenient shortcut method to access an action.
 * @param {string|HomeView.ActionType} actionType
 * @private
 */
HomePane.prototype.getAction = function(actionType) {
  if (typeof actionType === 'string') {
    return this.actionMap[actionType];
  } else {
    return this.actionMap[HomeView.ActionType[actionType]];
  }
}

/**
 * Create the actions map of this component.
 * @param {Home} home
 * @param {UserPreferences} preferences
 * @param {HomeController} controller
 * @private
 */
HomePane.prototype.createActions = function(home, preferences, controller) {
  var ActionType = HomeView.ActionType;
  this.createAction(ActionType.NEW_HOME, preferences, controller, "newHome");
  this.createAction(ActionType.NEW_HOME_FROM_EXAMPLE, preferences, controller, "newHomeFromExample");
  this.createAction(ActionType.OPEN, preferences, controller, "open");
  this.createAction(ActionType.DELETE_RECENT_HOMES, preferences, controller, "deleteRecentHomes");
  this.createAction(ActionType.CLOSE, preferences, controller, "close");
  this.createAction(ActionType.SAVE, preferences, controller, "save");
  this.createAction(ActionType.SAVE_AS, preferences, controller, "saveAs");
  this.createAction(ActionType.SAVE_AND_COMPRESS, preferences, controller, "saveAndCompress");
  this.createAction(ActionType.PAGE_SETUP, preferences, controller, "setupPage");
  this.createAction(ActionType.PRINT_PREVIEW, preferences, controller, "previewPrint");
  this.createAction(ActionType.PRINT, preferences, controller, "print");
  this.createAction(ActionType.PRINT_TO_PDF, preferences, controller, "printToPDF");
  this.createAction(ActionType.PREFERENCES, preferences, controller, "editPreferences");
  this.createAction(ActionType.EXIT, preferences, controller, "exit");

  this.createAction(ActionType.UNDO, preferences, controller, "undo");
  this.createAction(ActionType.REDO, preferences, controller, "redo");
  this.createClipboardAction(ActionType.CUT, preferences, null, true);
  this.createClipboardAction(ActionType.COPY, preferences, null, true);
  this.createClipboardAction(ActionType.PASTE, preferences, null, false);
  this.createAction(ActionType.PASTE_TO_GROUP, preferences, controller, "pasteToGroup");
  this.createAction(ActionType.PASTE_STYLE, preferences, controller, "pasteStyle");
  this.createAction(ActionType.DELETE, preferences, controller, "delete");
  this.createAction(ActionType.SELECT_ALL, preferences, controller, "selectAll");

  this.createAction(ActionType.ADD_HOME_FURNITURE, preferences, controller, "addHomeFurniture");
  this.createAction(ActionType.ADD_FURNITURE_TO_GROUP, preferences, controller, "addFurnitureToGroup");
  var furnitureController = controller.getFurnitureController();
  this.createAction(ActionType.DELETE_HOME_FURNITURE, preferences, furnitureController, "deleteSelection");
  this.createAction(ActionType.MODIFY_FURNITURE, preferences, controller, "modifySelectedFurniture");
  this.createAction(ActionType.GROUP_FURNITURE, preferences, furnitureController, "groupSelectedFurniture");
  this.createAction(ActionType.UNGROUP_FURNITURE, preferences, furnitureController, "ungroupSelectedFurniture");
  this.createAction(ActionType.ALIGN_FURNITURE_ON_TOP, preferences, furnitureController, "alignSelectedFurnitureOnTop");
  this.createAction(ActionType.ALIGN_FURNITURE_ON_BOTTOM, preferences, furnitureController, "alignSelectedFurnitureOnBottom");
  this.createAction(ActionType.ALIGN_FURNITURE_ON_LEFT, preferences, furnitureController, "alignSelectedFurnitureOnLeft");
  this.createAction(ActionType.ALIGN_FURNITURE_ON_RIGHT, preferences, furnitureController, "alignSelectedFurnitureOnRight");
  this.createAction(ActionType.ALIGN_FURNITURE_ON_FRONT_SIDE, preferences, furnitureController, "alignSelectedFurnitureOnFrontSide");
  this.createAction(ActionType.ALIGN_FURNITURE_ON_BACK_SIDE, preferences, furnitureController, "alignSelectedFurnitureOnBackSide");
  this.createAction(ActionType.ALIGN_FURNITURE_ON_LEFT_SIDE, preferences, furnitureController, "alignSelectedFurnitureOnLeftSide");
  this.createAction(ActionType.ALIGN_FURNITURE_ON_RIGHT_SIDE, preferences, furnitureController, "alignSelectedFurnitureOnRightSide");
  this.createAction(ActionType.ALIGN_FURNITURE_SIDE_BY_SIDE, preferences, furnitureController, "alignSelectedFurnitureSideBySide");
  this.createAction(ActionType.DISTRIBUTE_FURNITURE_HORIZONTALLY, preferences, furnitureController, "distributeSelectedFurnitureHorizontally");
  this.createAction(ActionType.DISTRIBUTE_FURNITURE_VERTICALLY, preferences, furnitureController, "distributeSelectedFurnitureVertically");
  this.createAction(ActionType.RESET_FURNITURE_ELEVATION, preferences, furnitureController, "resetFurnitureElevation");
  var homeController3D = controller.getHomeController3D();
  if (homeController3D.getView() != null) {
    this.createAction(ActionType.IMPORT_FURNITURE, preferences, controller, "importFurniture");
  }
  this.createAction(ActionType.IMPORT_FURNITURE_LIBRARY, preferences, controller, "importFurnitureLibrary");
  this.createAction(ActionType.IMPORT_TEXTURE, preferences, controller, "importTexture");
  this.createAction(ActionType.IMPORT_TEXTURES_LIBRARY, preferences, controller, "importTexturesLibrary");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_CATALOG_ID, preferences,
      furnitureController, "toggleFurnitureSort", "CATALOG_ID");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_NAME, preferences,
      furnitureController, "toggleFurnitureSort", "NAME");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_CREATOR, preferences,
      furnitureController, "toggleFurnitureSort", "CREATOR");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_WIDTH, preferences,
      furnitureController, "toggleFurnitureSort", "WIDTH");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_DEPTH, preferences,
      furnitureController, "toggleFurnitureSort", "DEPTH");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_HEIGHT, preferences,
      furnitureController, "toggleFurnitureSort", "HEIGHT");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_X, preferences,
      furnitureController, "toggleFurnitureSort", "X");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_Y, preferences,
      furnitureController, "toggleFurnitureSort", "Y");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_ELEVATION, preferences,
      furnitureController, "toggleFurnitureSort", "ELEVATION");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_ANGLE, preferences,
      furnitureController, "toggleFurnitureSort", "ANGLE");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_LEVEL, preferences,
      furnitureController, "toggleFurnitureSort", "LEVEL");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_MODEL_SIZE, preferences,
      furnitureController, "toggleFurnitureSort", "MODEL_SIZE");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_COLOR, preferences,
      furnitureController, "toggleFurnitureSort", "COLOR");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_TEXTURE, preferences,
      furnitureController, "toggleFurnitureSort", "TEXTURE");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_MOVABILITY, preferences,
      furnitureController, "toggleFurnitureSort", "MOVABLE");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_TYPE, preferences,
      furnitureController, "toggleFurnitureSort", "DOOR_OR_WINDOW");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_VISIBILITY, preferences,
      furnitureController, "toggleFurnitureSort", "VISIBLE");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_PRICE, preferences,
      furnitureController, "toggleFurnitureSort", "PRICE");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX_PERCENTAGE, preferences,
      furnitureController, "toggleFurnitureSort", "VALUE_ADDED_TAX_PERCENTAGE");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX, preferences,
      furnitureController, "toggleFurnitureSort", "VALUE_ADDED_TAX");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_PRICE_VALUE_ADDED_TAX_INCLUDED, preferences,
      furnitureController, "toggleFurnitureSort", "PRICE_VALUE_ADDED_TAX_INCLUDED");
  this.createAction(ActionType.SORT_HOME_FURNITURE_BY_DESCENDING_ORDER, preferences,
      furnitureController, "toggleFurnitureSortOrder");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_CATALOG_ID, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "CATALOG_ID");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_NAME, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "NAME");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_CREATOR, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "CREATOR");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_WIDTH, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "WIDTH");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_DEPTH, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "DEPTH");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_HEIGHT, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "HEIGHT");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_X, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "X");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_Y, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "Y");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_ELEVATION, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "ELEVATION");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_ANGLE, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "ANGLE");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_LEVEL, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "LEVEL");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_MODEL_SIZE, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "MODEL_SIZE");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_COLOR, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "COLOR");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_TEXTURE, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "TEXTURE");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_MOVABLE, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "MOVABLE");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_DOOR_OR_WINDOW, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "DOOR_OR_WINDOW");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_VISIBLE, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "VISIBLE");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_PRICE, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "PRICE");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX_PERCENTAGE, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "VALUE_ADDED_TAX_PERCENTAGE");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "VALUE_ADDED_TAX");
  this.createAction(ActionType.DISPLAY_HOME_FURNITURE_PRICE_VALUE_ADDED_TAX_INCLUDED, preferences,
      furnitureController, "toggleFurnitureVisibleProperty", "PRICE_VALUE_ADDED_TAX_INCLUDED");
  this.createAction(ActionType.EXPORT_TO_CSV, preferences, controller, "exportToCSV");

  var planController = controller.getPlanController();
  if (planController.getView() != null) {
    this.createAction(ActionType.SELECT_ALL_AT_ALL_LEVELS, preferences, planController, "selectAllAtAllLevels");
    var modeGroup = [];
    this.createToggleAction(ActionType.SELECT, planController.getMode() == PlanController.Mode.SELECTION, modeGroup,
        preferences, controller, "setMode", PlanController.Mode.SELECTION);
    this.createToggleAction(ActionType.PAN, planController.getMode() == PlanController.Mode.PANNING, modeGroup,
        preferences, controller, "setMode", PlanController.Mode.PANNING);
    this.createToggleAction(ActionType.CREATE_WALLS, planController.getMode() == PlanController.Mode.WALL_CREATION, modeGroup,
        preferences, controller, "setMode", PlanController.Mode.WALL_CREATION);
    this.createToggleAction(ActionType.CREATE_ROOMS, planController.getMode() == PlanController.Mode.ROOM_CREATION, modeGroup,
        preferences, controller, "setMode", PlanController.Mode.ROOM_CREATION);
    this.createToggleAction(ActionType.CREATE_POLYLINES, planController.getMode() == PlanController.Mode.POLYLINE_CREATION, modeGroup,
        preferences, controller, "setMode", PlanController.Mode.POLYLINE_CREATION);
    this.createToggleAction(ActionType.CREATE_DIMENSION_LINES, planController.getMode() == PlanController.Mode.DIMENSION_LINE_CREATION, modeGroup,
        preferences, controller, "setMode", PlanController.Mode.DIMENSION_LINE_CREATION);
    this.createToggleAction(ActionType.CREATE_LABELS, planController.getMode() == PlanController.Mode.LABEL_CREATION, modeGroup,
        preferences, controller, "setMode", PlanController.Mode.LABEL_CREATION);
    this.createAction(ActionType.DELETE_SELECTION, preferences, planController, "deleteSelection");
    this.createAction(ActionType.LOCK_BASE_PLAN, preferences, planController, "lockBasePlan");
    this.createAction(ActionType.UNLOCK_BASE_PLAN, preferences, planController, "unlockBasePlan");
    this.createAction(ActionType.ENABLE_MAGNETISM, preferences, controller, "enableMagnetism");
    this.createAction(ActionType.DISABLE_MAGNETISM, preferences, controller, "disableMagnetism");
    this.createAction(ActionType.FLIP_HORIZONTALLY, preferences, planController, "flipHorizontally");
    this.createAction(ActionType.FLIP_VERTICALLY, preferences, planController, "flipVertically");
    this.createAction(ActionType.MODIFY_COMPASS, preferences, planController, "modifyCompass");
    this.createAction(ActionType.MODIFY_WALL, preferences, planController, "modifySelectedWalls");
    this.createAction(ActionType.MODIFY_ROOM, preferences, planController, "modifySelectedRooms");
    this.createAction(ActionType.JOIN_WALLS, preferences, planController, "joinSelectedWalls");
    this.createAction(ActionType.REVERSE_WALL_DIRECTION, preferences, planController, "reverseSelectedWallsDirection");
    this.createAction(ActionType.SPLIT_WALL, preferences, planController, "splitSelectedWall");
    // ADD_ROOM_POINT and DELETE_ROOM_POINT actions are actually defined later in updateRoomActions
    this.createAction(ActionType.ADD_ROOM_POINT, preferences);
    this.createAction(ActionType.DELETE_ROOM_POINT, preferences);
    this.createAction(ActionType.MODIFY_POLYLINE, preferences, planController, "modifySelectedPolylines");
    this.createAction(ActionType.MODIFY_LABEL, preferences, planController, "modifySelectedLabels");
    this.createAction(ActionType.INCREASE_TEXT_SIZE, preferences, planController, "increaseTextSize");
    this.createAction(ActionType.DECREASE_TEXT_SIZE, preferences, planController, "decreaseTextSize");
    // Use special toggle models for bold and italic check box menu items and tool bar buttons
    // that are selected texts in home selected items are all bold or italic
    var toggleBoldAction = this.createBoldStyleAction(ActionType.TOGGLE_BOLD_STYLE, home, preferences, planController, "toggleBoldStyle");
    var toggleItalicAction = this.createItalicStyleToggleModel(ActionType.TOGGLE_ITALIC_STYLE, home, preferences, planController, "toggleItalicStyle");
    this.createAction(ActionType.IMPORT_BACKGROUND_IMAGE, preferences, controller, "importBackgroundImage");
    this.createAction(ActionType.MODIFY_BACKGROUND_IMAGE, preferences, controller, "modifyBackgroundImage");
    this.createAction(ActionType.HIDE_BACKGROUND_IMAGE, preferences, controller, "hideBackgroundImage");
    this.createAction(ActionType.SHOW_BACKGROUND_IMAGE, preferences, controller, "showBackgroundImage");
    this.createAction(ActionType.DELETE_BACKGROUND_IMAGE, preferences, controller, "deleteBackgroundImage");
    this.createAction(ActionType.ADD_LEVEL, preferences, planController, "addLevel");
    this.createAction(ActionType.ADD_LEVEL_AT_SAME_ELEVATION, preferences, planController, "addLevelAtSameElevation");
    this.createAction(ActionType.MAKE_LEVEL_VIEWABLE, preferences, planController, "toggleSelectedLevelViewability");
    this.createAction(ActionType.MAKE_LEVEL_UNVIEWABLE, preferences, planController, "toggleSelectedLevelViewability");
    this.createAction(ActionType.MAKE_LEVEL_ONLY_VIEWABLE_ONE, preferences, planController, "setSelectedLevelOnlyViewable");
    this.createAction(ActionType.MAKE_ALL_LEVELS_VIEWABLE, preferences, planController, "setAllLevelsViewable");
    this.createAction(ActionType.MODIFY_LEVEL, preferences, planController, "modifySelectedLevel");
    this.createAction(ActionType.DELETE_LEVEL, preferences, planController, "deleteSelectedLevel");
    this.createAction(ActionType.ZOOM_IN, preferences, controller, "zoomIn");
    this.createAction(ActionType.ZOOM_OUT, preferences, controller, "zoomOut");
    this.createAction(ActionType.EXPORT_TO_SVG, preferences, controller, "exportToSVG");
  }

  if (homeController3D.getView() != null) {
    // SELECT_OBJECT and TOGGLE_SELECTION actions are actually defined later in updatePickingActions
    this.createAction(ActionType.SELECT_OBJECT, preferences);
    this.createAction(ActionType.TOGGLE_SELECTION, preferences);
    var viewGroup = [];
    this.createToggleAction(ActionType.VIEW_FROM_TOP, home.getCamera() == home.getTopCamera(), viewGroup,
        preferences, homeController3D, "viewFromTop");
    this.createToggleAction(ActionType.VIEW_FROM_OBSERVER, home.getCamera() == home.getObserverCamera(), viewGroup,
        preferences, homeController3D, "viewFromObserver");
    this.createAction(ActionType.MODIFY_OBSERVER, preferences, planController, "modifyObserverCamera");
    this.createAction(ActionType.STORE_POINT_OF_VIEW, preferences, controller, "storeCamera");
    this.createAction(ActionType.DELETE_POINTS_OF_VIEW, preferences, controller, "deleteCameras");
    this.createAction(ActionType.DETACH_3D_VIEW, preferences, controller, "detachView", controller.getHomeController3D().getView());
    this.createAction(ActionType.ATTACH_3D_VIEW, preferences, controller, "attachView", controller.getHomeController3D().getView());

    var allLevelsVisible = home.getEnvironment().isAllLevelsVisible();
    var displayLevelGroup = [];
    this.createToggleAction(ActionType.DISPLAY_ALL_LEVELS, allLevelsVisible, displayLevelGroup, preferences,
        homeController3D, "displayAllLevels");
    this.createToggleAction(ActionType.DISPLAY_SELECTED_LEVEL, !allLevelsVisible, displayLevelGroup, preferences,
        homeController3D, "displaySelectedLevel");
    this.createAction(ActionType.MODIFY_3D_ATTRIBUTES, preferences, homeController3D, "modifyAttributes");
    this.createAction(ActionType.CREATE_PHOTO, preferences, controller, "createPhoto");
    this.createAction(ActionType.CREATE_PHOTOS_AT_POINTS_OF_VIEW, preferences, controller, "createPhotos");
    this.createAction(ActionType.CREATE_VIDEO, preferences, controller, "createVideo");
    this.createAction(ActionType.EXPORT_TO_OBJ, preferences, controller, "exportToOBJ");
  }

  this.createAction(ActionType.HELP, preferences, controller, "help");
  this.createAction(ActionType.ABOUT, preferences, controller, "about");
}
  
/**
 * Returns a new <code>ControllerAction</code> object that calls on <code>controller</code> a given
 * <code>method</code> with its <code>parameters</code>. This action is added to the action map of this component.
 * @param {HomeView.ActionType} actionType
 * @param {UserPreferences} preferences
 * @param {Object} controller
 * @param {string} method
 * @param {Object...} parameters
 * @return {Object}
 * @private
 */
HomePane.prototype.createAction = function(actionType, preferences, controller, method) {
  var parameters = [];
  for (var i = 4; i < arguments.length; i++) {
    parameters[i - 4] = arguments[i];
  }
  try {
    var action = new ResourceAction(preferences, HomePane, HomeView.ActionType[actionType], false, controller, method, parameters);
    this.getActionMap()[HomeView.ActionType[actionType]] = action;
    return action;
  } catch (ex) {
    console.error(ex);
  }
}

/**
 * Returns a new <code>ControllerAction</code> object associated with other actions if the same <code>group</code>.
 * @param {HomeView.ActionType} actionType
 * @param {boolean} selected
 * @param {string} group
 * @param {UserPreferences} preferences
 * @param {Object} controller
 * @param {string} method
 * @param {Object...} parameters
 * @return {Object}
 * @private
 */
HomePane.prototype.createToggleAction = function(actionType, selected, group, preferences, controller, method) {
  var parameters = [];
  for (var i = 6; i < arguments.length; i++) {
    parameters[i - 6] = arguments[i];
  }
  var action = this.createAction.apply(this, [actionType, preferences, controller, method].concat(parameters));
  if (group != null) {
    group.push(action);
    action.putValue(ResourceAction.TOGGLE_BUTTON_GROUP, group);
    action.putValue(AbstractAction.SELECTED_KEY, selected);
    action.addPropertyChangeListener(function(ev) {
        if (ev.getPropertyName() == AbstractAction.SELECTED_KEY) {
          if (ev.getNewValue()) {
            var group = ev.getSource().getValue(ResourceAction.TOGGLE_BUTTON_GROUP);
            for (var i = 0; i < group.length; i++) {
              if (action !== group [i] 
                  && group [i].getValue(AbstractAction.SELECTED_KEY)) {
                group [i].putValue(AbstractAction.SELECTED_KEY, false);
              }
            }
          } else {
            ev.getSource().putValue(AbstractAction.SELECTED_KEY, false);
          }
        }
      })
  }
  return action;
}

/**
 * Creates a <code>ReourceAction</code> object that calls
 * <code>actionPerfomed</code> method on a given
 * existing <code>clipboardAction</code> with a source equal to focused component.
 * @param {HomeView.ActionType} actionType
 * @param {UserPreferences} preferences
 * @param {Object} clipboardAction
 * @param {boolean} copyAction
 * @private
 */
HomePane.prototype.createClipboardAction = function(actionType, preferences, clipboardAction, copyAction) {
  var action = this.createAction(actionType, preferences);
  var homePane = this;
  action.actionPerformed = function(ev) {
    if (copyAction) {
      homePane.clipboard = Home.duplicate(homePane.home.getSelectedItems());
      homePane.clipboardEmpty = false;
      homePane.controller.enablePasteAction();
    }
    switch (actionType) {
    case HomeView.ActionType.CUT:
      homePane.controller.cut(homePane.home.getSelectedItems());
      break;
    case HomeView.ActionType.COPY:
      break;
    case HomeView.ActionType.PASTE:
      homePane.controller.paste(Home.duplicate(homePane.clipboard));
      break;
    }
    return action;
  }
}

/**
 * Adds a property change listener to <code>home</code> to update
 * View from top and View from observer toggle models according to used camera.
 * @param {Home} home
 * @private
 */
HomePane.prototype.addHomeListener = function(home) {
  var homePane = this;
  home.addPropertyChangeListener("CAMERA", function(ev) {
      homePane.setToggleButtonModelSelected(HomeView.ActionType.VIEW_FROM_TOP, home.getCamera() == home.getTopCamera());
      homePane.setToggleButtonModelSelected(HomeView.ActionType.VIEW_FROM_OBSERVER, home.getCamera() == home.getObserverCamera());
    });
}

/**
 * Changes the selection of the toggle model matching the given action.
 * @param {HomeView.ActionType} actionType
 * @param {boolean} selected
 * @private
 */
HomePane.prototype.setToggleButtonModelSelected = function(actionType, selected) {
  this.getAction(actionType).putValue(AbstractAction.SELECTED_KEY, selected);
}

/**
 * Adds listener to <code>home</code> to update
 * Display all levels and Display selected level toggle models
 * according their visibility.
 * @param {Home} home
 * @private
 */
HomePane.prototype.addLevelVisibilityListener = function(home) {
  home.getEnvironment().addPropertyChangeListener("ALL_LEVELS_VISIBLE", function(ev) {
      var allLevelsVisible = home.getEnvironment().isAllLevelsVisible();
      setToggleButtonModelSelected(HomeView.ActionType.DISPLAY_ALL_LEVELS, allLevelsVisible);
      setToggleButtonModelSelected(HomeView.ActionType.DISPLAY_SELECTED_LEVEL, !allLevelsVisible);
    });
}

/**
 * Adds a property change listener to <code>preferences</code> to update
 * actions when some preferences change.
 * @param {UserPreferences} preferences
 * @private
 */
HomePane.prototype.addUserPreferencesListener = function(preferences) {
  var listener = new HomePane.UserPreferencesChangeListener(this);
  preferences.addPropertyChangeListener("LANGUAGE", listener);
  preferences.addPropertyChangeListener("CURRENCY", listener);
  preferences.addPropertyChangeListener("VALUE_ADDED_TAX_ENABLED", listener);
}

/**
 * Preferences property listener bound to this component with a weak reference to avoid
 * strong link between preferences and this component.
 * @param {HomePane} homePane
 * @constructor
 * @ignore
 */
HomePane.UserPreferencesChangeListener = function(homePane) {
  if (this.homePane === undefined)
    this.homePane = null;
  this.homePane = (homePane);
}

HomePane.UserPreferencesChangeListener.prototype.propertyChange = function(ev) {
  var homePane = this.homePane;
  var preferences = ev.getSource();
  var property = ev.getPropertyName();
  if (homePane == null) {
    preferences.removePropertyChangeListener(property, this);
  }
  else {
    var actionMap = homePane.getActionMap();
    switch ((property)) {
    case "LANGUAGE":
      SwingTools.updateSwingResourceLanguage(ev.getSource());
      break;
    case "CURRENCY":
      actionMap.get(HomeView.ActionType.DISPLAY_HOME_FURNITURE_PRICE).putValue(ResourceAction.VISIBLE, ev.getNewValue() != null);
      actionMap.get(HomeView.ActionType.SORT_HOME_FURNITURE_BY_PRICE).putValue(ResourceAction.VISIBLE, ev.getNewValue() != null);
      break;
    case "VALUE_ADDED_TAX_ENABLED":
      actionMap.get(ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX_PERCENTAGE).putValue(ResourceAction.VISIBLE, ev.getNewValue() == true);
      actionMap.get(ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX).putValue(ResourceAction.VISIBLE, ev.getNewValue() == true);
      actionMap.get(ActionType.DISPLAY_HOME_FURNITURE_PRICE_VALUE_ADDED_TAX_INCLUDED).putValue(ResourceAction.VISIBLE, ev.getNewValue() == true);
      actionMap.get(ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX_PERCENTAGE).putValue(ResourceAction.VISIBLE, ev.getNewValue() == true);
      actionMap.get(ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX).putValue(ResourceAction.VISIBLE, ev.getNewValue() == true);
      actionMap.get(ActionType.SORT_HOME_FURNITURE_BY_PRICE_VALUE_ADDED_TAX_INCLUDED).putValue(ResourceAction.VISIBLE, ev.getNewValue() == true);
      break;
    }
  }
}

/**
 * Sets whether some actions should be visible or not.
 * @param {UserPreferences} preferences
 * @private
 */
HomePane.prototype.initActions = function(preferences) {
  this.getAction(HomeView.ActionType.DISPLAY_HOME_FURNITURE_CATALOG_ID).putValue(ResourceAction.VISIBLE, false);
  this.getAction(HomeView.ActionType.SORT_HOME_FURNITURE_BY_CATALOG_ID).putValue(ResourceAction.VISIBLE, false);
  this.getAction(HomeView.ActionType.DISPLAY_HOME_FURNITURE_PRICE).putValue(ResourceAction.VISIBLE, preferences.getCurrency() != null);
  this.getAction(HomeView.ActionType.SORT_HOME_FURNITURE_BY_PRICE).putValue(ResourceAction.VISIBLE, preferences.getCurrency() != null);
  this.getAction(HomeView.ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX_PERCENTAGE).putValue(ResourceAction.VISIBLE, preferences.isValueAddedTaxEnabled());
  this.getAction(HomeView.ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX).putValue(ResourceAction.VISIBLE, preferences.isValueAddedTaxEnabled());
  this.getAction(HomeView.ActionType.DISPLAY_HOME_FURNITURE_PRICE_VALUE_ADDED_TAX_INCLUDED).putValue(ResourceAction.VISIBLE, preferences.isValueAddedTaxEnabled());
  this.getAction(HomeView.ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX_PERCENTAGE).putValue(ResourceAction.VISIBLE, preferences.isValueAddedTaxEnabled());
  this.getAction(HomeView.ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX).putValue(ResourceAction.VISIBLE, preferences.isValueAddedTaxEnabled());
  this.getAction(HomeView.ActionType.SORT_HOME_FURNITURE_BY_PRICE_VALUE_ADDED_TAX_INCLUDED).putValue(ResourceAction.VISIBLE, preferences.isValueAddedTaxEnabled());
}

/**
 * Adds a property change listener to <code>planController</code> to update
 * Select and Create walls toggle models according to current mode.
 * @param {PlanController} planController
 * @private
 */
HomePane.prototype.addPlanControllerListener = function(planController) {
  var homePane = this;
  planController.addPropertyChangeListener("MODE", function(ev) {
      var mode = planController.getMode();
      homePane.setToggleButtonModelSelected(HomeView.ActionType.SELECT, mode == PlanController.Mode.SELECTION);
      homePane.setToggleButtonModelSelected(HomeView.ActionType.PAN, mode == PlanController.Mode.PANNING);
      homePane.setToggleButtonModelSelected(HomeView.ActionType.CREATE_WALLS, mode == PlanController.Mode.WALL_CREATION);
      homePane.setToggleButtonModelSelected(HomeView.ActionType.CREATE_ROOMS, mode == PlanController.Mode.ROOM_CREATION);
      homePane.setToggleButtonModelSelected(HomeView.ActionType.CREATE_POLYLINES, mode == PlanController.Mode.POLYLINE_CREATION);
      homePane.setToggleButtonModelSelected(HomeView.ActionType.CREATE_DIMENSION_LINES, mode == PlanController.Mode.DIMENSION_LINE_CREATION);
      homePane.setToggleButtonModelSelected(HomeView.ActionType.CREATE_LABELS, mode == PlanController.Mode.LABEL_CREATION);
    });
}
  
/**
 * Returns Lock / Unlock base plan button.
 * @param {Home} home
 * @param {string} additionalClass additional CSS class
 * @return {HTMLButton}
 * @private
 */
HomePane.prototype.createLockUnlockBasePlanButton = function(home, additionalClass) {
  var unlockBasePlanAction = this.getAction(HomeView.ActionType.UNLOCK_BASE_PLAN);
  var lockBasePlanAction = this.getAction(HomeView.ActionType.LOCK_BASE_PLAN);
  if (unlockBasePlanAction != null 
      && unlockBasePlanAction.getValue(AbstractAction.NAME) != null 
      && lockBasePlanAction.getValue(AbstractAction.NAME) != null) {
    var lockUnlockBasePlanButton = this.createToolBarButton(
        home.isBasePlanLocked() ? unlockBasePlanAction : lockBasePlanAction, additionalClass);
    home.addPropertyChangeListener("BASE_PLAN_LOCKED", function() {
        lockUnlockBasePlanButton.setAction(home.isBasePlanLocked()
            ? unlockBasePlanAction
            : lockBasePlanAction);
      });
    return lockUnlockBasePlanButton;
  }
  else {
    return null;
  }
}

/**
 * Returns Enable / Disable magnetism button.
 * @param {UserPreferences} preferences
 * @param {string} additionalClass additional CSS class
 * @return {HTMLButton}
 * @private
 */
HomePane.prototype.createEnableDisableMagnetismButton = function(preferences, additionalClass) {
  var disableMagnetismAction = this.getAction(HomeView.ActionType.DISABLE_MAGNETISM);
  var enableMagnetismAction = this.getAction(HomeView.ActionType.ENABLE_MAGNETISM);
  if (disableMagnetismAction !== null
      && disableMagnetismAction.getValue(AbstractAction.NAME) !== null
      && enableMagnetismAction.getValue(AbstractAction.NAME) !== null) {
    var enableDisableMagnetismButton = this.createToolBarButton(
        preferences.isMagnetismEnabled() ? disableMagnetismAction : enableMagnetismAction, additionalClass);
    preferences.addPropertyChangeListener("MAGNETISM_ENABLED",
        new HomePane.MagnetismChangeListener(this, enableDisableMagnetismButton));
    return enableDisableMagnetismButton;
  } else {
    return null;
  }
}

/**
 * Preferences property listener bound to this component with a weak reference to avoid
 * strong link between preferences and this component.
 * @constructor
 * @private
 */
HomePane.MagnetismChangeListener = function MagnetismChangeListener(homePane, enableDisableMagnetismButton) {
  this.enableDisableMagnetismButton = enableDisableMagnetismButton;
  this.homePane = homePane;
}

/**
 * @ignore
 */
HomePane.MagnetismChangeListener.prototype.propertyChange = function(ev) {
  var homePane = this.homePane;
  var preferences = ev.getSource();
  var property = ev.getPropertyName();
  if (homePane == null) {
    preferences.removePropertyChangeListener(property, this);
  } else {
    this.enableDisableMagnetismButton.setAction(
        preferences.isMagnetismEnabled()
            ? homePane.getAction(HomeView.ActionType.DISABLE_MAGNETISM)
            : homePane.getAction(HomeView.ActionType.ENABLE_MAGNETISM));
  }
}

/**
 * Creates an action that is selected when all the text of the
 * selected items in <code>home</code> use bold style.
 * @param {HomeView.ActionType} actionType
 * @param {Home} home
 * @param {UserPreferences} preferences
 * @param {Object} controller
 * @param {string} method
 * @return {ResourceAction}
 * @private
 */
HomePane.prototype.createBoldStyleAction = function(actionType, home, preferences, controller, method) {
  var action = this.createAction(actionType, preferences, controller, method);
  home.addSelectionListener({
        selectionChanged: function(ev) {
          // Find if selected items are all bold or not
          var selectionBoldStyle = null;
          var selectedItems = home.getSelectedItems();
          for (var i = 0; i < selectedItems.length; i++) {
            item = selectedItems [i];
            var bold;
            if (item instanceof Label) {
              bold = this.isItemTextBold("Label", item.getStyle());
            } else if (item instanceof HomePieceOfFurniture
                && item.isVisible()) {
              bold = this.isItemTextBold("HomePieceOfFurniture", item.getNameStyle());
            } else if (item instanceof Room) {
              bold = this.isItemTextBold("Room", item.getNameStyle());
              if (bold != this.isItemTextBold("Room", item.getAreaStyle())) {
                bold = null;
              }
            } else if (item instanceof DimensionLine) {
              bold = this.isItemTextBold("DimensionLine", item.getLengthStyle());
            } else {
              continue;
            }
            if (selectionBoldStyle == null) {
              selectionBoldStyle = bold;
            } else if (bold == null || selectionBoldStyle != bold) {
              selectionBoldStyle = null;
              break;
            }
          }
          action.putValue(AbstractAction.SELECTED_KEY, selectionBoldStyle != null && selectionBoldStyle);
        },
      isItemTextBold: function(itemClass, textStyle) {
        if (textStyle == null) {
          textStyle = preferences.getDefaultTextStyle(itemClass);
        }
        return textStyle.isBold();
      }
    });
  return action;
}

/**
 * Creates an action that is selected when all the text of the
 * selected items in <code>home</code> use italic style.
 * @param {HomeView.ActionType} actionType
 * @param {Home} home
 * @param {UserPreferences} preferences
 * @param {Object} controller
 * @param {string} method
 * @return {ResourceAction}
 * @private
 */
HomePane.prototype.createItalicStyleToggleModel = function(actionType, home, preferences, controller, method) {
  var action = this.createAction(actionType, preferences, controller, method);
  home.addSelectionListener({
        selectionChanged: function(ev) {
          // Find if selected items are all italic or not
          var selectionItalicStyle = null;
          var selectedItems = home.getSelectedItems();
          for (var i = 0; i < selectedItems.length; i++) {
            item = selectedItems [i];
            var italic;
            if (item instanceof Label) {
              italic = this.isItemTextItalic("Label", item.getStyle());
            } else if (item instanceof HomePieceOfFurniture
                && item.isVisible()) {
              italic = this.isItemTextItalic("HomePieceOfFurniture", item.getNameStyle());
            } else if (item instanceof Room) {
              italic = this.isItemTextItalic("Room", item.getNameStyle());
              if (italic != this.isItemTextItalic("Room", item.getAreaStyle())) {
                italic = null;
              }
            } else if (item instanceof DimensionLine) {
              italic = this.isItemTextItalic("DimensionLine", item.getLengthStyle());
            } else {
              continue;
            }
            if (selectionItalicStyle == null) {
              selectionItalicStyle = italic;
            } else if (italic == null || selectionItalicStyle != italic) {
              selectionItalicStyle = null;
              break;
            }
          }
          action.putValue(AbstractAction.SELECTED_KEY, selectionItalicStyle != null && selectionItalicStyle);
        },
        isItemTextItalic: function(itemClass, textStyle) {
        if (textStyle == null) {
          textStyle = preferences.getDefaultTextStyle(itemClass);
        }
        return textStyle.isItalic();
      }
    });
  return action;
}

/**
 * Returns the tool bar displayed in this pane.
 * @param {Home} home
 * @param {UserPreferences preferences}
 * @return {Object}
 * @private
 */
HomePane.prototype.createToolBar = function(home, preferences) {
  var toolBar = document.getElementById("home-pane-toolbar"); 
  this.addToggleActionToToolBar(HomeView.ActionType.VIEW_FROM_TOP, toolBar); 
  this.addToggleActionToToolBar(HomeView.ActionType.VIEW_FROM_OBSERVER, toolBar);
  this.addSeparator(toolBar); 

  this.addActionToToolBar(HomeView.ActionType.UNDO, toolBar); 
  this.addActionToToolBar(HomeView.ActionType.REDO, toolBar); 
  this.addSeparator(toolBar); 
  
  this.addActionToToolBar(HomeView.ActionType.DELETE_SELECTION, toolBar); 
  this.addActionToToolBar(HomeView.ActionType.CUT, toolBar, "toolbar-optional"); 
  this.addActionToToolBar(HomeView.ActionType.COPY, toolBar); 
  this.addActionToToolBar(HomeView.ActionType.PASTE, toolBar); 
  this.addSeparator(toolBar);
  
  this.addActionToToolBar(HomeView.ActionType.ADD_HOME_FURNITURE, toolBar, "toolbar-optional"); 
  this.addSeparator(toolBar);
  
  this.addToggleActionToToolBar(HomeView.ActionType.SELECT, toolBar); 
  this.addToggleActionToToolBar(HomeView.ActionType.PAN, toolBar, "toolbar-optional"); 
  this.addToggleActionToToolBar(HomeView.ActionType.CREATE_WALLS, toolBar); 
  this.addToggleActionToToolBar(HomeView.ActionType.CREATE_ROOMS, toolBar); 
  this.addToggleActionToToolBar(HomeView.ActionType.CREATE_POLYLINES, toolBar); 
  this.addToggleActionToToolBar(HomeView.ActionType.CREATE_DIMENSION_LINES, toolBar); 
  this.addToggleActionToToolBar(HomeView.ActionType.CREATE_LABELS, toolBar); 
  this.addSeparator(toolBar);
  
  var enableDisableMagnetismButton = this.createEnableDisableMagnetismButton(preferences);
  if (enableDisableMagnetismButton !== null) {
    this.addButtonToToolBar(toolBar, enableDisableMagnetismButton);
  }
  var lockUnlockBasePlanButton = this.createLockUnlockBasePlanButton(home)
  if (lockUnlockBasePlanButton !== null) {
    this.addButtonToToolBar(toolBar, lockUnlockBasePlanButton);
  }
  this.addActionToToolBar(HomeView.ActionType.FLIP_HORIZONTALLY, toolBar);
  this.addActionToToolBar(HomeView.ActionType.FLIP_VERTICALLY, toolBar);
  this.addSeparator(toolBar);
  
  this.addActionToToolBar(HomeView.ActionType.INCREASE_TEXT_SIZE, toolBar);
  this.addActionToToolBar(HomeView.ActionType.DECREASE_TEXT_SIZE, toolBar);
  this.addToggleActionToToolBar(HomeView.ActionType.TOGGLE_BOLD_STYLE, toolBar);
  this.addToggleActionToToolBar(HomeView.ActionType.TOGGLE_ITALIC_STYLE, toolBar);
  this.addSeparator(toolBar);

  
  this.addActionToToolBar(HomeView.ActionType.ADD_LEVEL, toolBar);
  this.addActionToToolBar(HomeView.ActionType.ADD_LEVEL_AT_SAME_ELEVATION, toolBar);
  this.addActionToToolBar(HomeView.ActionType.DELETE_LEVEL, toolBar);
  this.addSeparator(toolBar);

  this.addActionToToolBar(HomeView.ActionType.ZOOM_IN, toolBar, "toolbar-optional");
  this.addActionToToolBar(HomeView.ActionType.ZOOM_OUT, toolBar, "toolbar-optional");
  
  return toolBar;
}

/** 
 * @private 
 */
HomePane.prototype.startToolBarButtonGroup = function(toolBar) {
  var buttonGroup = document.createElement("span");
  toolBar.appendChild(buttonGroup);
  buttonGroup.classList.add("toolbar-button-group");
}

/** 
 * @private 
 */
HomePane.prototype.addButtonToToolBar = function(toolBar, button) {
  if (toolBar.children.length === 0) {
    this.startToolBarButtonGroup(toolBar);
  }
  toolBar.children[toolBar.children.length - 1].appendChild(button);        
}

/**
 * Adds to tool bar the button matching the given <code>actionType</code>
 * and returns <code>true</code> if it was added.
 * @param {HomeView.ActionType} actionType
 * @param {javax.swing.JToolBar} toolBar
 * @private
 */
HomePane.prototype.addToggleActionToToolBar = function(actionType, toolBar, additionalClass) {
  var action = this.getAction(actionType);
  if (action.getValue(AbstractAction.NAME) != null) {
    var button = this.createToolBarButton(action, additionalClass);
    if (action.getValue(AbstractAction.SELECTED_KEY)) {
      button.classList.add("selected");
    }
    action.addPropertyChangeListener(function(ev) {
        if (ev.getPropertyName() == AbstractAction.SELECTED_KEY) {
          if (ev.getNewValue()) {
            button.classList.add("selected");
          } else {
            button.classList.remove("selected");
          }
        }
      });
    button.addEventListener("click", function() {
        var group = action.getValue(ResourceAction.TOGGLE_BUTTON_GROUP);
        action.putValue(AbstractAction.SELECTED_KEY, group ? true : !action.getValue(AbstractAction.SELECTED_KEY));
      });
    this.addButtonToToolBar(toolBar, button);
  }
}

/**
 * Adds to tool bar the button matching the given <code>actionType</code>.
 * @param {HomeView.ActionType} actionType
 * @param {Object} toolBar
 * @param {string} otherClass additional CSS class
 * @private
 */
HomePane.prototype.addActionToToolBar = function(actionType, toolBar, additionalClass) {
  var action = this.getAction(actionType);
  if (action.getValue(AbstractAction.NAME) != null) {
    this.addButtonToToolBar(toolBar, this.createToolBarButton(action, additionalClass));
  }
  return null;
}

/**
 * Returns a button configured from the given <code>action</code>.
 * @param {HomeView.ResourceAction} action
 * @param {string} additionalClass additional CSS class
 * @returns {HTMLButton} 
 * @private
 */
HomePane.prototype.createToolBarButton = function(action, additionalClass) {
  var button = document.createElement("button");
  button.disabled = !action.isEnabled();
  // Modify action with a setAction method which is also invoked elsewhere 
  button.setAction = function(newAction) {
      button.action = newAction;
      var icon = newAction.getValue(ResourceAction.TOOL_BAR_ICON);
      if (!icon) {
        icon = newAction.getValue(AbstractAction.SMALL_ICON);
      }
      button.style.backgroundImage = "url('" + ZIPTools.getScriptFolder() + "/"+ icon + "')";
      button.style.backgroundPosition = "center";
      button.style.backgroundRepeat = "no-repeat";
      var shortDescription = newAction.getValue(AbstractAction.SHORT_DESCRIPTION);
      if (shortDescription) {
        button.title = shortDescription;
      }
    };
  button.setAction(action);
  button.classList.add("toolbar-button");
  if (action.getValue(ResourceAction.TOGGLE_BUTTON_GROUP)) {
    button.classList.add("toggle");
  }
  button.action = action;
  button.addEventListener("click", function() {
      this.action.actionPerformed();
    });
  var listener = {
        propertyChange: function(ev) {
          if (ev.getPropertyName() == "enabled") {
            button.disabled = !ev.getNewValue();
          } else if (ev.getPropertyName() == AbstractAction.SHORT_DESCRIPTION) {
            button.title = ev.getNewValue();
          }
        }
    };
  action.addPropertyChangeListener(listener);
  if (additionalClass) {
    button.classList.add(additionalClass);
  }
  return button;
}

/**
 * @private
 */
HomePane.prototype.addSeparator = function(toolBar) {
  this.startToolBarButtonGroup(toolBar);
}
  
/**
 * Enables or disables the action matching <code>actionType</code>.
 * @param {HomeView.ActionType} actionType
 * @param {boolean} enabled
 */
HomePane.prototype.setEnabled = function(actionType, enabled) {
  var action = this.getAction(actionType);
  if (action != null) {
    action.setEnabled(enabled);
  }
}

/**
 * Sets the <code>NAME</code> and <code>SHORT_DESCRIPTION</code> properties value
 * of undo and redo actions. If a parameter is null,
 * the properties will be reset to their initial values.
 * @param {string} undoText
 * @param {string} redoText
 */
HomePane.prototype.setUndoRedoName = function(undoText, redoText) {
  this.setNameAndShortDescription(HomeView.ActionType.UNDO, undoText);
  this.setNameAndShortDescription(HomeView.ActionType.REDO, redoText);
}

/**
 * Sets the <code>NAME</code> and <code>SHORT_DESCRIPTION</code> properties value
 * matching <code>actionType</code>. If <code>name</code> is null,
 * the properties will be reset to their initial values.
 * @param {HomeView.ActionType} actionType
 * @param {string} name
 * @private
 */
HomePane.prototype.setNameAndShortDescription = function(actionType, name) {
  var action = this.getAction(actionType);
  if (action != null) {
    if (name == null) {
      name = action.getValue(AbstractAction.DEFAULT);
    }
    action.putValue(AbstractAction.NAME, name);
    action.putValue(AbstractAction.SHORT_DESCRIPTION, name);
  }
}

/**
 * Enables or disables transfer between components.
 * @param {boolean} enabled
 */
HomePane.prototype.setTransferEnabled = function(enabled) {
  var catalogView = this.controller.getFurnitureCatalogController().getView();
  var furnitureView = this.controller.getFurnitureController().getView();
  var planView = this.controller.getPlanController().getView();
  if (enabled) {
    if (catalogView != null) {
      if (this.furnitureCatalogDragAndDropListener == null) {
        this.furnitureCatalogDragAndDropListener = this.createFurnitureCatalogMouseListener();
      }
      
      var pieceContainers = catalogView.getHTMLElement().querySelectorAll(".furniture");
      if (OperatingSystem.isInternetExplorerOrLegacyEdge()
          && window.PointerEvent) {
        // Multi touch support for IE and Edge
        for (i = 0; i < pieceContainers.length; i++) {
          pieceContainers[i].addEventListener("pointerdown", this.furnitureCatalogDragAndDropListener.pointerPressed);
        }
        catalogView.getHTMLElement().addEventListener("mousedown", this.furnitureCatalogDragAndDropListener.mousePressed);
        // Add pointermove and pointerup event listeners to window to capture pointer events out of the canvas 
        window.addEventListener("pointermove", this.furnitureCatalogDragAndDropListener.windowPointerMoved);
        window.addEventListener("pointerup", this.furnitureCatalogDragAndDropListener.windowPointerReleased);
      } else {
        for (i = 0; i < pieceContainers.length; i++) {
          pieceContainers[i].addEventListener("touchstart", this.furnitureCatalogDragAndDropListener.mousePressed);
        }
        window.addEventListener("touchmove", this.furnitureCatalogDragAndDropListener.mouseDragged);
        window.addEventListener("touchend", this.furnitureCatalogDragAndDropListener.windowMouseReleased);
        catalogView.getHTMLElement().addEventListener("mousedown", this.furnitureCatalogDragAndDropListener.mousePressed);
        window.addEventListener("mousemove", this.furnitureCatalogDragAndDropListener.mouseDragged);
        window.addEventListener("mouseup", this.furnitureCatalogDragAndDropListener.windowMouseReleased);
      }
    }
  } else {
    if (catalogView != null) {
      var pieceContainers = catalogView.getHTMLElement().querySelectorAll(".furniture");
      if (OperatingSystem.isInternetExplorerOrLegacyEdge()
          && window.PointerEvent) {
        for (i = 0; i < pieceContainers.length; i++) {
          pieceContainers[i].removeEventListener("pointerdown", this.furnitureCatalogDragAndDropListener.pointerPressed);            
        }
        catalogView.getHTMLElement().removeEventListener("mousedown", this.furnitureCatalogDragAndDropListener.mousePressed);
        // Add pointermove and pointerup event listeners to window to capture pointer events out of the canvas 
        window.removeEventListener("pointermove", this.furnitureCatalogDragAndDropListener.windowPointerMoved);
        window.removeEventListener("pointerup", this.furnitureCatalogDragAndDropListener.windowPointerReleased);
      } else {
        for (i = 0; i < pieceContainers.length; i++) {
          pieceContainers[i].removeEventListener("touchstart", this.furnitureCatalogDragAndDropListener.mousePressed);
        }
        window.removeEventListener("touchmove", this.furnitureCatalogDragAndDropListener.mouseDragged);
        window.removeEventListener("touchend", this.furnitureCatalogDragAndDropListener.windowMouseReleased);
        catalogView.getHTMLElement().removeEventListener("mousedown", this.furnitureCatalogDragAndDropListener.mousePressed);
        window.removeEventListener("mousemove", this.furnitureCatalogDragAndDropListener.mouseDragged);
        window.removeEventListener("mouseup", this.furnitureCatalogDragAndDropListener.windowMouseReleased);
      }
    }
  }
  this.transferHandlerEnabled = enabled;
}

/**
 * Returns a mouse listener for catalog that acts as catalog view, furniture view and plan transfer handlers
 * for drag and drop operations.
 * @return {javax.swing.event.MouseInputAdapter}
 * @private
 */
HomePane.prototype.createFurnitureCatalogMouseListener = function() {
  var homePane = this;
  var mouseListener = {
      selectedPiece: null,
      previousCursor: null,
      previousView: null,
      escaped: false,
      draggedImage: null,
      pointerTouches: {},
      actionStartedInFurnitureCatalog: false,

      mousePressed: function(ev) {
        if (ev.button === 0 || ev.targetTouches) {
          if (!ev.target.classList.contains("selected")) {
           return;
          }
          ev.preventDefault();
          ev.stopPropagation();
          var selectedFurniture = homePane.controller.getFurnitureCatalogController().getSelectedFurniture();
          if (selectedFurniture.length > 0) {
            mouseListener.selectedPiece = selectedFurniture[0];
            mouseListener.previousCursor = null;
            mouseListener.previousView = null;
            mouseListener.escaped = false;
            
            homePane.inputMap ["ESCAPE"] = "EscapeDragFromFurnitureCatalog";
          }
          mouseListener.actionStartedInFurnitureCatalog = true;
        }
      },
      mouseDragged: function(ev) {
        if (mouseListener.actionStartedInFurnitureCatalog
            && ((ev.buttons & 1) == 1 || ev.targetTouches)
            && mouseListener.selectedPiece != null) {
          ev.preventDefault();
          ev.stopPropagation();

          if (!mouseListener.escaped) {
            if (mouseListener.draggedImage == null) {
              var img = document.createElement("img");
              var originalIcon = homePane.controller.getFurnitureCatalogController().getView().getHTMLElement().querySelector(".furniture.selected .furniture-icon");
              img.src = originalIcon.src;
              var style = window.getComputedStyle(originalIcon);
              img.style.width = style.width;
              img.style.height = style.height;
              img.style.position = "absolute";
              img.style.opacity = 0.6;
              img.style.zIndex = 4;
              mouseListener.draggedImage = img;
              document.body.appendChild(img);
            }
            mouseListener.draggedImage.style.left = mouseListener.getCoordinates(ev).clientX + "px";
            mouseListener.draggedImage.style.top = mouseListener.getCoordinates(ev).clientY + "px";
          }
          
          var selectedLevel = homePane.home.getSelectedLevel();
          if (selectedLevel == null || selectedLevel.isViewable()) {
            var transferredFurniture = [homePane.controller.getFurnitureController().createHomePieceOfFurniture(mouseListener.selectedPiece)];
            var view;
            var pointInView = mouseListener.getPointInPlanView(ev, transferredFurniture);
            if (pointInView != null) {
              view = homePane.controller.getPlanController().getView();
            } else {
              view = homePane.controller.getFurnitureController().getView();
              pointInView = mouseListener.getPointInFurnitureView(ev);
            }

            if (mouseListener.previousView != view) {
              if (mouseListener.previousView != null) {
                if (mouseListener.previousView == homePane.controller.getPlanController().getView()
                    && !mouseListener.escaped) {
                  homePane.controller.getPlanController().stopDraggedItems();
                }
                var component = mouseListener.previousView;
                if (view && typeof view.setCursor === 'function') {
                  view.setCursor(mouseListener.previousCursor);
                }
                mouseListener.previousCursor = null;
                mouseListener.previousView = null;
              }
              if (view != null) {
                var component = view;
                mouseListener.previousCursor = "default";
                mouseListener.previousView = view;
                if (!mouseListener.escaped) {
                  if (typeof view.setCursor === "function") {
                    view.setCursor("copy");
                  }
                  if (view === homePane.controller.getPlanController().getView()) {
                    homePane.controller.getPlanController().startDraggedItems(transferredFurniture, pointInView [0], pointInView [1]);
                  }
                }
              }
            } else if (pointInView != null) {
              homePane.controller.getPlanController().moveMouse(pointInView [0], pointInView [1]);
            }
          }
        }
      },
      getPointInPlanView: function(ev, transferredFurniture) {
        var planView = homePane.controller.getPlanController().getView();
        if (planView != null) {
          var rect = planView.getHTMLElement().getBoundingClientRect();
          var coords = mouseListener.getCoordinates(ev);
          if (coords.clientX >= rect.left 
              && coords.clientX < rect.left + rect.width
              && coords.clientY >= rect.top 
              && coords.clientY < rect.top + rect.height) {
            return [planView.convertXPixelToModel(coords.clientX - rect.left), planView.convertYPixelToModel(coords.clientY - rect.top)];
          }
        }
        return null;
      },
      getCoordinates: function(ev) {
        if (ev.targetTouches) {
          if (ev.targetTouches.length === 1) {
            return { clientX: ev.targetTouches[0].clientX, clientY: ev.targetTouches[0].clientY };
          } else if (ev.targetTouches.length === 0 && ev.changedTouches.length === 1) {
            return { clientX: ev.changedTouches[0].clientX, clientY: ev.changedTouches[0].clientY };
          }
        }
        return ev;
      },
      getPointInFurnitureView: function(ev) {
        var furnitureView = homePane.controller.getFurnitureController().getView();
        if (furnitureView != null) {
          var rect = furnitureView.getHTMLElement().getBoundingClientRect();
          var coords = mouseListener.getCoordinates(ev);
          if (coords.clientX >= rect.left && coords.clientX < rect.left + rect.width
              && coords.clientY >= rect.top && coords.clientY < rect.top + rect.height) {
            return [0, 0];
          }
        }
        return null;
      },
      windowMouseReleased: function(ev) {
        if (mouseListener.actionStartedInFurnitureCatalog) {
          if (mouseListener.draggedImage != null) {
            document.body.removeChild(mouseListener.draggedImage);
            mouseListener.draggedImage = null;
          }
          if ((ev.button === 0 || ev.targetTouches) && mouseListener.selectedPiece != null) {
            ev.preventDefault();
            if (!mouseListener.escaped) {
              var selectedLevel = homePane.home.getSelectedLevel();
              if (selectedLevel == null || selectedLevel.isViewable()) {
                var transferredFurniture = [homePane.controller.getFurnitureController().createHomePieceOfFurniture(mouseListener.selectedPiece)];
                var view;
                var pointInView = mouseListener.getPointInPlanView(ev, transferredFurniture);
                if (pointInView != null) {
                  homePane.controller.getPlanController().stopDraggedItems();
                  view = homePane.controller.getPlanController().getView();
                }
                if (pointInView != null) {
                  homePane.controller.drop(transferredFurniture, view, pointInView [0], pointInView [1]);
                  var view = mouseListener.previousView;
                  if (view && typeof view.setCursor === "function") {
                    view.setCursor(this.previousCursor);
                  }
                }
              }
            }
          }
        }
        mouseListener.selectedPiece = null;
        mouseListener.actionStartedInFurnitureCatalog = false;
        delete homePane.inputMap ["ESCAPE"];
      },
      pointerPressed : function(ev) {
        if (ev.pointerType != "mouse") {
          // Multi touch support for IE and Edge
          mouseListener.copyPointerToTargetTouches(ev);
          return; // Don't support drag and drop from catalog on touch screens under IE/Edge
        }
        mouseListener.mousePressed(ev);
      },
      windowPointerMoved : function(ev) {
        if (ev.pointerType != "mouse") {
          // Multi touch support for IE and Edge
          mouseListener.copyPointerToTargetTouches(ev);
          return; // Don't support drag and drop from catalog on touch screens under IE/Edge
        }
        mouseListener.mouseDragged(ev);
      },
      windowPointerReleased : function(ev) {
        if (ev.pointerType != "mouse") {
          delete mouseListener.pointerTouches [ev.pointerId];
          return; // Don't support drag and drop from catalog on touch screens under IE/Edge
        }
        mouseListener.windowMouseReleased(ev);
      },
      copyPointerToTargetTouches : function(ev) {
        // Copy the IE and Edge pointer location to ev.targetTouches
        mouseListener.pointerTouches [ev.pointerId] = {clientX : ev.clientX, clientY : ev.clientY};
        ev.targetTouches = [];
        for (var attribute in mouseListener.pointerTouches) {
          if (mouseListener.pointerTouches.hasOwnProperty(attribute)) {
            ev.targetTouches.push(mouseListener.pointerTouches [attribute]);
          }
        }
      }
    };
  
  var escapeAction = new AbstractAction();
  escapeAction.actionPerformed = function() {
     if (!mouseListener.escaped) {
       if (mouseListener.previousView != null) {
         if (mouseListener.previousView === homePane.controller.getPlanController().getView()) {
           homePane.controller.getPlanController().stopDraggedItems();
         }
         if (mouseListener.previousCursor != null && typeof mouseListener.previousView.setCursor === "function") {
           mouseListener.previousView.setCursor(mouseListener.previousCursor);
         }
       }
       mouseListener.escaped = true;
       if (mouseListener.draggedImage != null) {
         document.body.removeChild(mouseListener.draggedImage);
         mouseListener.draggedImage = null;
       }
     }
   };
 this.getActionMap() ["EscapeDragFromFurnitureCatalog"] = escapeAction;

  return mouseListener;
}

/**
 * Detaches the given <code>view</code> from home view.
 * @param {Object} view
 * @ignore
 */
HomePane.prototype.detachView = function(view) {
}

/**
 * Attaches the given <code>view</code> to home view.
 * @param {Object} view
 * @ignore
 */
HomePane.prototype.attachView = function(view) {
}

/**
 * Displays a content chooser open dialog to choose the name of a home.
 * @return {string}
 * @ignore
 */
HomePane.prototype.showOpenDialog = function() {
}

/**
 * Displays a dialog to let the user choose a home example.
 * @return {string}
 * @ignore
 */
HomePane.prototype.showNewHomeFromExampleDialog = function() {
}
  
/**
 * Displays a dialog that lets user choose what he wants to do with a damaged home he tries to open it.
 * @return {HomeView.OpenDamagedHomeAnswer} {@link com.eteks.sweethome3d.viewcontroller.HomeView.OpenDamagedHomeAnswer#REMOVE_DAMAGED_ITEMS}
 * if the user chose to remove damaged items,
 * {@link com.eteks.sweethome3d.viewcontroller.HomeView.OpenDamagedHomeAnswer#REPLACE_DAMAGED_ITEMS}
 * if he doesn't want to replace damaged items by red images and red boxes,
 * or {@link com.eteks.sweethome3d.viewcontroller.HomeView.OpenDamagedHomeAnswer#DO_NOT_OPEN_HOME}
 * if he doesn't want to open damaged home.
 * @param {string} homeName
 * @param {Home} damagedHome
 * @param {*[]} invalidContent
 * @ignore
 */
HomePane.prototype.confirmOpenDamagedHome = function(homeName, damagedHome, invalidContent) {
  return true;
}

/**
 * Displays a content chooser open dialog to choose a language library.
 * @return {string}
 * @ignore
 */
HomePane.prototype.showImportLanguageLibraryDialog = function() {
}

/**
 * Displays a dialog that lets user choose whether he wants to overwrite
 * an existing language library or not.
 * @param {string} languageLibraryName
 * @return {boolean}
 * @ignore
 */
HomePane.prototype.confirmReplaceLanguageLibrary = function(languageLibraryName) {
  return true;
}

/**
 * Displays a content chooser open dialog to choose a furniture library.
 * @return {string}
 * @ignore
 */
HomePane.prototype.showImportFurnitureLibraryDialog = function() {
}

/**
 * Displays a dialog that lets user choose whether he wants to overwrite
 * an existing furniture library or not.
 * @param {string} furnitureLibraryName
 * @return {boolean}
 * @ignore
 */
HomePane.prototype.confirmReplaceFurnitureLibrary = function(furnitureLibraryName) {
  return true;
}

/**
 * Displays a content chooser open dialog to choose a textures library.
 * @return {string}
 * @ignore
 */
HomePane.prototype.showImportTexturesLibraryDialog = function() {
}

/**
 * Displays a dialog that lets user choose whether he wants to overwrite
 * an existing textures library or not.
 * @param {string} texturesLibraryName
 * @return {boolean}
 * @ignore
 */
HomePane.prototype.confirmReplaceTexturesLibrary = function(texturesLibraryName) {
  return true;
}

/**
 * Displays a dialog that lets user choose whether he wants to overwrite
 * an existing plug-in or not.
 * @param {string} pluginName
 * @return {boolean}
 * @ignore
 */
HomePane.prototype.confirmReplacePlugin = function(pluginName) {
  return true;
}

/**
 * Displays a content chooser save dialog to choose the name of a home.
 * @param {string} homeName
 * @return {string}
 * @ignore
 */
HomePane.prototype.showSaveDialog = function(homeName) {
  return null;
}

/**
 * Displays <code>message</code> in an error message box.
 * @param {string} message
 * @ignore
 */
HomePane.prototype.showError = function(message) {
  alert(message);
}

/**
 * Displays <code>message</code> in a message box.
 * @param {string} message
 * @ignore
 */
HomePane.prototype.showMessage = function(message) {
  alert(message);
}

/**
 * Displays the tip matching <code>actionTipKey</code> and
 * returns <code>true</code> if the user chose not to display again the tip.
 * @param {string} actionTipKey
 * @return {boolean}
 * @ignore
 */
HomePane.prototype.showActionTipMessage = function(actionTipKey) {
  return false;
}

/**
 * Displays a dialog that lets user choose whether he wants to save
 * the current home or not.
 * @return {HomeView.SaveAnswer} {@link com.eteks.sweethome3d.viewcontroller.HomeView.SaveAnswer#SAVE}
 * if the user chose to save home,
 * {@link com.eteks.sweethome3d.viewcontroller.HomeView.SaveAnswer#DO_NOT_SAVE}
 * if he doesn't want to save home,
 * or {@link com.eteks.sweethome3d.viewcontroller.HomeView.SaveAnswer#CANCEL}
 * if he doesn't want to continue current operation.
 * @param {string} homeName
 * @ignore
 */
HomePane.prototype.confirmSave = function(homeName) {
  return HomeView.SaveAnswer.CANCEL;
}

/**
 * Displays a dialog that let user choose whether he wants to save
 * a home that was created with a newer version of Sweet Home 3D.
 * @return {boolean} <code>true</code> if user confirmed to save.
 * @param {string} homeName
 * @ignore
 */
HomePane.prototype.confirmSaveNewerHome = function(homeName) {
  return false;
}
  
/**
 * Displays a dialog that let user choose whether he wants to exit
 * application or not.
 * @return {boolean} <code>true</code> if user confirmed to exit.
 * @ignore
 */
HomePane.prototype.confirmExit = function() {
  return true;
}

/**
 * Displays an about dialog.
 * @ignore
 */
HomePane.prototype.showAboutDialog = function() {
}

/**
 * Displays the given message and returns <code>false</code> if the user
 * doesn't want to be informed of the shown updates anymore.
 * @param {string} updatesMessage the message to display
 * @param {boolean} showOnlyMessage if <code>false</code> a check box proposing not to display
 * again shown updates will be shown.
 * @return {boolean}
 * @ignore
 */
HomePane.prototype.showUpdatesMessage = function(updatesMessage, showOnlyMessage) {
  return false;
}

/**
 * Shows a print dialog to print the home displayed by this pane.
 * @return {() => any} a print task to execute or <code>null</code> if the user canceled print.
 * The <code>call</code> method of the returned task may throw a
 * {@link RecorderException} exception if print failed
 * or an {@link InterruptedRecorderException}
 * exception if it was interrupted.
 * @ignore
 */
HomePane.prototype.showPrintDialog = function() {
  return null;
}

/**
 * Shows a content chooser save dialog to print a home in a PDF file.
 * @param {string} homeName
 * @return {string}
 * @ignore
 */
HomePane.prototype.showPrintToPDFDialog = function(homeName) {
  return null;
}

/**
 * Prints a home to a given PDF file. This method may be overridden
 * to write to another kind of output stream.
 * @param {string} pdfFile
 * @ignore
 */
HomePane.prototype.printToPDF = function(pdfFile) {
}

/**
 * Shows a content chooser save dialog to export furniture list in a CSV file.
 * @param {string} homeName
 * @return {string}
 * @ignore
 */
HomePane.prototype.showExportToCSVDialog = function(homeName) {
  return null;
}

/**
 * Exports furniture list to a given CSV file.
 * @param {string} csvFile
 * @ignore
 */
HomePane.prototype.exportToCSV = function(csvFile) {
}

/**
 * Shows a content chooser save dialog to export a home plan in a SVG file.
 * @param {string} homeName
 * @return {string}
 * @ignore
 */
HomePane.prototype.showExportToSVGDialog = function(homeName) {
  return null;
}

/**
 * Exports the plan objects to a given SVG file.
 * @param {string} svgFile
 * @ignore
 */
HomePane.prototype.exportToSVG = function(svgFile) {
}

/**
 * Shows a content chooser save dialog to export a 3D home in a OBJ file.
 * @param {string} homeName
 * @return {string}
 * @ignore
 */
HomePane.prototype.showExportToOBJDialog = function(homeName) {
   return null;
}

/**
 * Exports to an OBJ file the objects of the 3D view created with the given factory.
 * @param {string} objFile
 * @param {Object} object3dFactory
 * @ignore
 */
HomePane.prototype.exportToOBJ = function(objFile, object3dFactory) {
}


/**
 * Displays a dialog that let user choose whether he wants to delete
 * the selected furniture from catalog or not.
 * @return {boolean} <code>true</code> if user confirmed to delete.
 * @ignore
 */
HomePane.prototype.confirmDeleteCatalogSelection = function() {
  return true;
}

/**
 * Displays a dialog that lets the user choose a name for the current camera.
 * @return {string} the chosen name or <code>null</code> if the user canceled.
 * @param {string} cameraName
 * @ignore
 */
HomePane.prototype.showStoreCameraDialog = function(cameraName) {
  return null;
}

/**
 * Displays a dialog showing the list of cameras stored in home
 * and returns the ones selected by the user to be deleted.
 * @return {Camera[]}
 * @ignore
 */
HomePane.prototype.showDeletedCamerasDialog = function() {
  return [];
}

/**
 * Returns <code>true</code> if clipboard doesn't contain data that
 * components are able to handle.
 * @return {boolean}
 */
HomePane.prototype.isClipboardEmpty = function() {
  return this.clipboardEmpty;
}

/**
 * Returns the list of selectable items that are currently in clipboard
 * or <code>null</code> if clipboard doesn't contain any selectable item.
 * @return {*[]}
 */
HomePane.prototype.getClipboardItems = function() {
  return this.clipboard;
}
/**
 * Execute <code>runnable</code> asynchronously in the thread
 * that manages toolkit events.
 * @param {function} runnable
 * @ignore
 */
HomePane.prototype.invokeLater = function(runnable) {
  setTimeout(runnable);
}
