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
 * @author Emmanuel Puybaret
 */
function ResourceAction(preferences, resourceClass, actionPrefix, enabled, controller, controllerMethod, parameters) {
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
ResourceAction["__interfaces"] = ["java.util.EventListener", "java.lang.Cloneable", "java.awt.event.ActionListener", "javax.swing.Action"];

/**
 * Useful constants that can be used as the storage-retrieval key
 * when setting or getting one of this object's properties (text
 * or icon).
 */
/**
 * Not currently used.
 */
ResourceAction.DEFAULT = "Default";
/**
 * The key used for storing the <code>String</code> name
 * for the action, used for a menu or button.
 */
ResourceAction.NAME = "Name";
/**
 * The key used for storing a short <code>String</code>
 * description for the action, used for tooltip text.
 */
ResourceAction.SHORT_DESCRIPTION = "ShortDescription";
/**
 * The key used for storing a longer <code>String</code>
 * description for the action, could be used for context-sensitive help.
 */
ResourceAction.LONG_DESCRIPTION = "LongDescription";
/**
 * The key used for storing a small <code>Icon</code>, such
 * as <code>ImageIcon</code>.  This is typically used with
 * menus such as <code>JMenuItem</code>.
 * <p>
 * If the same <code>Action</code> is used with menus and buttons you'll
 * typically specify both a <code>SMALL_ICON</code> and a
 * <code>LARGE_ICON_KEY</code>.  The menu will use the
 * <code>SMALL_ICON</code> and the button will use the
 * <code>LARGE_ICON_KEY</code>.
 */
ResourceAction.SMALL_ICON = "SmallIcon";

/**
 * The key used to determine the command <code>String</code> for the
 * <code>ActionEvent</code> that will be created when an
 * <code>Action</code> is going to be notified as the result of
 * residing in a <code>Keymap</code> associated with a
 * <code>JComponent</code>.
 */
ResourceAction.ACTION_COMMAND_KEY = "ActionCommandKey";

/**
 * The key used for storing a <code>KeyStroke</code> to be used as the
 * accelerator for the action.
 */
ResourceAction.ACCELERATOR_KEY = "AcceleratorKey";

/**
 * The key used for storing an <code>Integer</code> that corresponds to
 * one of the <code>KeyEvent</code> key codes.  The value is
 * commonly used to specify a mnemonic.  For example:
 * <code>myAction.putValue(Action.MNEMONIC_KEY, KeyEvent.VK_A)</code>
 * sets the mnemonic of <code>myAction</code> to 'a', while
 * <code>myAction.putValue(Action.MNEMONIC_KEY, KeyEvent.getExtendedKeyCodeForChar('\u0444'))</code>
 * sets the mnemonic of <code>myAction</code> to Cyrillic letter "Ef".
 */
ResourceAction.MNEMONIC_KEY = "MnemonicKey";

/**
 * The key used for storing a <code>Boolean</code> that corresponds
 * to the selected state.  This is typically used only for components
 * that have a meaningful selection state.  For example,
 * <code>JRadioButton</code> and <code>JCheckBox</code> make use of
 * this but instances of <code>JMenu</code> don't.
 * <p>
 * This property differs from the others in that it is both read
 * by the component and set by the component.  For example,
 * if an <code>Action</code> is attached to a <code>JCheckBox</code>
 * the selected state of the <code>JCheckBox</code> will be set from
 * that of the <code>Action</code>.  If the user clicks on the
 * <code>JCheckBox</code> the selected state of the <code>JCheckBox</code>
 * <b>and</b> the <code>Action</code> will <b>both</b> be updated.
 */
ResourceAction.SELECTED_KEY = "SwingSelectedKey";

/**
 * The key used for storing an <code>Integer</code> that corresponds
 * to the index in the text (identified by the <code>NAME</code>
 * property) that the decoration for a mnemonic should be rendered at.  If
 * the value of this property is greater than or equal to the length of
 * the text, it will treated as -1.
 */
ResourceAction.DISPLAYED_MNEMONIC_INDEX_KEY = "SwingDisplayedMnemonicIndexKey";

/**
 * The key used for storing an <code>Icon</code>.  This is typically
 * used by buttons, such as <code>JButton</code> and
 * <code>JToggleButton</code>.
 * <p>
 * If the same <code>Action</code> is used with menus and buttons you'll
 * typically specify both a <code>SMALL_ICON</code> and a
 * <code>LARGE_ICON_KEY</code>.  The menu will use the
 * <code>SMALL_ICON</code> and the button the <code>LARGE_ICON_KEY</code>.
 */
ResourceAction.LARGE_ICON_KEY = "SwingLargeIconKey";

ResourceAction.RESOURCE_CLASS = "ResourceClass";
ResourceAction.RESOURCE_PREFIX = "ResourcePrefix";
ResourceAction.VISIBLE = "Visible";
ResourceAction.POPUP = "Popup";
ResourceAction.TOGGLE_BUTTON_GROUP = "ToggleButtonGroup";
ResourceAction.TOOL_BAR_ICON = "ToolBarIcon";

/**
 * Sets whether the Action is enabled.
 * @param {boolean} newValue true to enable the action, false to disable it
 */
ResourceAction.prototype.setEnabled = function(enabled) {
  if (this.enabled != enabled) {
    this.enabled = enabled;
    if (this.changeSupport != null) {
      this.firePropertyChange("enabled", !enabled, enabled);
    }
  }
}

/**
 * Returns true if the action is enabled.
 *
 * @return {boolean} true if the action is enabled, false otherwise
 */
ResourceAction.prototype.isEnabled = function() {
  return this.enabled;
}

/**
 * Gets the <code>Object</code> associated with the specified key.
 *
 * @param {string} key a string containing the specified <code>key</code>
 * @return {Object} the binding <code>Object</code> stored with this key; if there
 *          are no keys, it will return <code>null</code>
 */
ResourceAction.prototype.getValue = function(key) {
  if (key == "enabled") {
    return this.enabled;
  }
  if (this.arrayTable == null) {
    return null;
  }
  return this.arrayTable[key];
}

/**
 * Sets the <code>Value</code> associated with the specified key.
 *
 * @param {string} key  the <code>String</code> that identifies the stored object
 * @param {Object} newValue the <code>Object</code> to store using this key
 */
ResourceAction.prototype.putValue = function(key, newValue) {
  var oldValue = null;
  if (key == "enabled") {
    // Treat putValue("enabled") the same way as a call to setEnabled.
    // If we don't do this it means the two may get out of sync, and a
    // bogus property change notification would be sent.
    //
    // To avoid dependencies between putValue & setEnabled this
    // directly changes enabled. If we instead called setEnabled
    // to change enabled, it would be possible for stack
    // overflow in the case where a developer implemented setEnabled
    // in terms of putValue.
    if (newValue == null || !(newValue instanceof Boolean)) {
      newValue = false;
    }
    oldValue = enabled;
    this.enabled = newValue;
  } else {
    if (this.arrayTable == null) {
      this.arrayTable = {};
    }
    if (this.arrayTable[key] != null)
      oldValue = this.arrayTable[key];
    // Remove the entry for key if newValue is null
    // else put in the newValue for key.
    if (newValue == null) {
      delete this.arrayTable.key;
    } else {
      this.arrayTable[key] = newValue;
    }
  }
  if (this.changeSupport != null) {
    this.firePropertyChange(key, oldValue, newValue);
  }
}

/**
 * @protected
 */
ResourceAction.prototype.firePropertyChange = function(propertyName, oldValue, newValue) {
  if (this.changeSupport == null 
      || (oldValue != null && newValue != null && oldValue == newValue)) {
    return;
  }
  this.changeSupport.firePropertyChange(propertyName, oldValue, newValue);
}  

/**
 * Returns an array of <code>Object</code> which are keys for
 * which values have been set for this <code>AbstractAction</code>,
 * or <code>null</code> if no keys have values set.
 * @return an array of key objects, or <code>null</code> if no
 *                  keys have values set
 */
ResourceAction.prototype.getKeys = function() {
  if (this.arrayTable == null) {
    return null;
  }
  return this.arrayTable.getOwnPropertyNames();
}

/**
 * Adds a <code>PropertyChangeListener</code> to the listener list.
 * The listener is registered for all properties.
 * <p>
 * A <code>PropertyChangeEvent</code> will get fired in response to setting
 * a bound property, e.g. <code>setFont</code>, <code>setBackground</code>,
 * or <code>setForeground</code>.
 * Note that if the current component is inheriting its foreground,
 * background, or font from its container, then no event will be
 * fired in response to a change in the inherited property.
 *
 * @param {PropertyChangeListener} listener The <code>PropertyChangeListener</code> to be added
 */
ResourceAction.prototype.addPropertyChangeListener = function(listener) {
  if (this.changeSupport == null) {
    this.changeSupport = new PropertyChangeSupport(this);
  }
  this.changeSupport.addPropertyChangeListener(listener);
}

/**
 * Removes a <code>PropertyChangeListener</code> from the listener list.
 * This removes a <code>PropertyChangeListener</code> that was registered
 * for all properties.
 *
 * @param {PropertyChangeListener} listener  the <code>PropertyChangeListener</code> to be removed
 */
ResourceAction.prototype.removePropertyChangeListener = function(listener) {
  if (this.changeSupport == null) {
    return;
  }
  this.changeSupport.removePropertyChangeListener(listener);
}


/**
 * Returns an array of all the <code>PropertyChangeListener</code>s added
 * to this AbstractAction with addPropertyChangeListener().
 *
 * @return {PropertyChangeListener[]} all of the <code>PropertyChangeListener</code>s added or an empty
 *         array if no listeners have been added
 */
ResourceAction.prototype.getPropertyChangeListeners = function() {
  if (this.changeSupport == null) {
    return new PropertyChangeListener[0];
  }
  return this.changeSupport.getPropertyChangeListeners();
}


/**
 * Reads from the properties of this action.
 * @param {UserPreferences} preferences
 * @param {Object} resourceClass
 * @param {string} actionPrefix
 * @private
 */
ResourceAction.prototype.readActionProperties = function(preferences, resourceClass, actionPrefix) {
  var propertyPrefix = actionPrefix + ".";
  this.putValue(ResourceAction.NAME, this.getOptionalString(preferences, resourceClass, propertyPrefix + ResourceAction.NAME, true));
  this.putValue(ResourceAction.DEFAULT, this.getValue(ResourceAction.NAME));
  this.putValue(ResourceAction.POPUP, this.getOptionalString(preferences, resourceClass, propertyPrefix + ResourceAction.POPUP, true));
  this.putValue(ResourceAction.SHORT_DESCRIPTION, this.getOptionalString(preferences, resourceClass, propertyPrefix + ResourceAction.SHORT_DESCRIPTION, false));
  this.putValue(ResourceAction.LONG_DESCRIPTION, this.getOptionalString(preferences, resourceClass, propertyPrefix + ResourceAction.LONG_DESCRIPTION, false));
  var smallIcon = this.getOptionalString(preferences, resourceClass, propertyPrefix + ResourceAction.SMALL_ICON, false);
  if (smallIcon != null) {
    // this.putValue(ResourceAction.SMALL_ICON, SwingTools.getScaledImageIcon(/* getResource */ smallIcon));
    this.putValue(ResourceAction.SMALL_ICON, smallIcon);
  }
  var toolBarIcon = this.getOptionalString(preferences, resourceClass, propertyPrefix + ResourceAction.TOOL_BAR_ICON, false);
  if (toolBarIcon != null) {
    //this.putValue(ResourceAction.TOOL_BAR_ICON, SwingTools.getScaledImageIcon(/* getResource */ toolBarIcon));
    this.putValue(ResourceAction.TOOL_BAR_ICON, toolBarIcon);
  }
  var propertyKey = propertyPrefix + ResourceAction.ACCELERATOR_KEY;
  var acceleratorKey = this.getOptionalString(preferences, resourceClass, propertyKey + "." + OperatingSystem.getName(), false);
  if (acceleratorKey == null) {
    acceleratorKey = this.getOptionalString(preferences, resourceClass, propertyKey, false);
  }
  if (acceleratorKey != null) {
    this.putValue(ResourceAction.ACCELERATOR_KEY, acceleratorKey/*javax.swing.KeyStroke.getKeyStroke(acceleratorKey)*/);
  }
  var mnemonicKey = this.getOptionalString(preferences, resourceClass, propertyPrefix + ResourceAction.MNEMONIC_KEY, false);
  if (mnemonicKey != null) {
    this.putValue(ResourceAction.MNEMONIC_KEY, mnemonicKey/*javax.swing.KeyStroke.getKeyStroke(mnemonicKey).getKeyCode()*/);
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
 * Unsupported operation. Subclasses should override this method if they want
 * to associate a real action to this class.
 * @param {java.awt.event.ActionEvent} ev
 */
ResourceAction.prototype.actionPerformed = function(ev) {
  if (this.controller != null && this.controllerMethod != null) {
    return this.controller[this.controllerMethod].apply(this.controller, this.parameters);
  } else {
    throw new UnsupportedOperationException();
  }
}


/**
 * Creates home view associated with its controller.
 * @param {Home} home
 * @param {UserPreferences} preferences
 * @param {HomeController} controller
 * @class
 * @extends javax.swing.JRootPane
 * @author Emmanuel Puybaret
 */
var HomePane = (function() {

  function HomePane(containerId, home, preferences, controller) {
    // _this.specialKeysListener = new HomePane.HomePane$0(_this);
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
    this.createActions(home, preferences, controller);
    // _this.createMenuActions(preferences, controller);
    // _this.createPluginActions((controller != null && controller instanceof com.eteks.sweethome3d.plugin.HomePluginController) ? (controller).getPlugins() : null);
    this.initActions(preferences);
    // _this.createTransferHandlers(home, controller);
    this.addHomeListener(home);
    this.addLevelVisibilityListener(home);
    this.addUserPreferencesListener(preferences);
    this.addPlanControllerListener(controller.getPlanController());
    // _this.addFocusListener();
    // _this.updateFocusTraversalPolicy();
    // this.addClipboardListener();
    // var homeMenuBar = _this.createMenuBar(home, preferences, controller);
    // _this.setJMenuBar(homeMenuBar);
    // var contentPane = _this.getContentPane();
    this.createToolBar(home, preferences);
    // contentPane.add(_this.createMainPane(home, preferences, controller));
    // if (com.eteks.sweethome3d.tools.OperatingSystem.isMacOSXLeopardOrSuperior()) {
    //     contentPane.add(new javax.swing.JLabel(), java.awt.BorderLayout.WEST);
    //     contentPane.add(new javax.swing.JLabel(), java.awt.BorderLayout.EAST);
    // }
    // _this.disableMenuItemsDuringDragAndDrop(controller.getPlanController().getView(), homeMenuBar);
    // _this.applyComponentOrientation(java.awt.ComponentOrientation.getOrientation(/* getDefault */ (window.navigator['userLanguage'] || window.navigator.language)));
    
    // Keyboard accelerators management
    var homePane = this;
    document.addEventListener("keydown", function(ev) {
        var keyStroke = KeyStroke.getKeyStrokeForEvent(ev);
        if (keyStroke !== undefined) {
          // Search action matching shortcut and call its actionPerformed method
          for (var actionType in homePane.actionMap) {
            var action = homePane.actionMap [actionType];
            if (action.isEnabled()
                && action.getValue(ResourceAction.ACCELERATOR_KEY) == keyStroke) {
              // TODO Allow only action with a button at screen ?
              action.actionPerformed();
              ev.stopPropagation();
            }
          }
        }
      }, true);
    
    // TODO Manage focus once furniture view will exist
    setTimeout(function() {
        controller.focusedViewChanged(controller.getPlanController().getView());
      });

    // Create level selector
    this.levelSelector = document.createElement("select");
    this.levelSelector.id = "level-selector";
    this.levelSelector.style.display = "inline";
    this.levelSelector.style.position = "absolute";
    controller.getPlanController().getView().container.appendChild(this.levelSelector);
    this.updateLevels();
    this.levelSelector.addEventListener('change', function(ev) {
      home.setSelectedLevel(home.getLevels()[parseInt(ev.target.value)]);
      homePane.updateLevels();
    });

    home.addPropertyChangeListener(Home.SELECTED_LEVEL, function() {
      homePane.updateLevels();
    });
    home.addLevelsListener(function() {
      homePane.updateLevels();
    }); 

    return this;
  }

  /*
   * @private
   */
  HomePane.prototype.updateLevels = function() {
    this.levelSelector.innerHTML = "";
    if (this.home.getLevels().length < 2) {
      this.levelSelector.style.display = "none";
    } else {
      for (var i = 0; i < this.home.getLevels().length; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.innerHTML = this.home.getLevels()[i].getName();
        if (this.home.getLevels()[i] === this.home.getSelectedLevel()) {
          option.selected = "selected";
        }
        this.levelSelector.appendChild(option);
      }
      this.levelSelector.style.display = "inline";
    }
  }

  /**
   * Returns the HTML element used to view this component at screen.
   */
  HomePane.prototype.getHTMLElement = function() {
    return this.container;
  }
  
  HomePane.prototype.getActionMap = function() {
    return this.actionMap;
  }

  /**
   * Convenient shortcut method to access an action.
   * @param {string|HomeView.ActionType} actionType
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
  };
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
  };
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
      action.putValue(ResourceAction.SELECTED_KEY, selected);
      action.addPropertyChangeListener(function(ev) {
          if (ev.getPropertyName() == ResourceAction.SELECTED_KEY) {
            if (ev.getNewValue()) {
              var group = ev.getSource().getValue(ResourceAction.TOGGLE_BUTTON_GROUP);
              for (var i = 0; i < group.length; i++) {
                if (action !== group [i] 
                    && group [i].getValue(ResourceAction.SELECTED_KEY)) {
                  group [i].putValue(ResourceAction.SELECTED_KEY, false);
                }
              }
            } else {
              ev.getSource().putValue(ResourceAction.SELECTED_KEY, false);
            }
          }
        })
    }
    return action;
  };

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
  };

  /**
   * Toogles the toolbar for this plan view, if accessible in the HTML page (id = home-pane-toolbar).
   */
  PlanComponent.prototype.toggleToolBar = function() {
    if (this.toolBar == null) {
      return;
    }
    if (this.toolBar.classList.contains("show")) {
      this.hideToolBar();
    } else {
      this.showToolBar();
    }
  };

  /**
   * Shows the toolbar for this plan view, if accessible in the HTML page (id = home-pane-toolbar).
   */
  PlanComponent.prototype.showToolBar = function() {
    if (this.toolBar == null) {
      return;
    }
    this.toolBar.style.width = (this.canvas.getBoundingClientRect().width) + "px";
    this.toolBar.style.left = (this.canvas.getBoundingClientRect().left) + "px";
    this.toolBar.style.top = (this.canvas.getBoundingClientRect().top) + "px";
    if (!this.toolBar.classList.contains("show")) {
      this.toolBar.classList.remove("hide");
      this.toolBar.classList.add("show");
    }
    if (this.toolBarHideTimeout) {
      clearTimeout(this.toolBarHideTimeout);
      this.toolBarHideTimeout = undefined;
    }
  };

  /**
   * Hides the toolbar after the given timeout.
   */
  PlanComponent.prototype.setToolBarTimeout = function(timeout) {
    if (this.toolBar == null) {
      return;
    }
    if (this.toolBarHideTimeout) {
      clearTimeout(this.toolBarHideTimeout);
      this.toolBarHideTimeout = undefined;
    }
    if (!this.toolBar.classList.contains("show")) {
      return;
    }
    var planComponent = this;
    planComponent.toolBarHideTimeout = setTimeout(function() {
      planComponent.hideToolBar();
    }, timeout);
  }

  /**
   * Hides the toolbar.
   */
  PlanComponent.prototype.hideToolBar = function() {
    if (this.toolBar == null) {
      return;
    }
    if (this.toolBarHideTimeout) {
      clearTimeout(this.toolBarHideTimeout);
      this.toolBarHideTimeout = undefined;
    }
    if (!this.toolBar.classList.contains("hide") && this.toolBar.classList.contains("show")) {
      this.toolBar.classList.remove("show");
      this.toolBar.classList.add("hide");
    }
  };

  /**
   * Create the actions map used to create menus of this component.
   * @param {UserPreferences} preferences
   * @param {HomeController} controller
   * @private
   */
  HomePane.prototype.createMenuActions = function(preferences, controller) {
    this.menuActionMap = new javax.swing.ActionMap();
    this.createMenuAction(preferences, HomePane.MenuActionType.FILE_MENU);
    this.createMenuAction(preferences, HomePane.MenuActionType.EDIT_MENU);
    this.createMenuAction(preferences, HomePane.MenuActionType.FURNITURE_MENU);
    this.createMenuAction(preferences, HomePane.MenuActionType.PLAN_MENU);
    this.createMenuAction(preferences, HomePane.MenuActionType.VIEW_3D_MENU);
    this.createMenuAction(preferences, HomePane.MenuActionType.HELP_MENU);
    this.createMenuAction(preferences, HomePane.MenuActionType.OPEN_RECENT_HOME_MENU);
    this.createMenuAction(preferences, HomePane.MenuActionType.SORT_HOME_FURNITURE_MENU);
    this.createMenuAction(preferences, HomePane.MenuActionType.ALIGN_OR_DISTRIBUTE_MENU);
    this.createMenuAction(preferences, HomePane.MenuActionType.DISPLAY_HOME_FURNITURE_PROPERTY_MENU);
    this.createMenuAction(preferences, HomePane.MenuActionType.MODIFY_TEXT_STYLE);
    this.createMenuAction(preferences, HomePane.MenuActionType.GO_TO_POINT_OF_VIEW);
    this.createMenuAction(preferences, HomePane.MenuActionType.SELECT_OBJECT_MENU);
    this.createMenuAction(preferences, HomePane.MenuActionType.TOGGLE_SELECTION_MENU);
  };
  /**
   * Creates a <code>ResourceAction</code> object stored in menu action map.
   * @param {UserPreferences} preferences
   * @param {HomePane.MenuActionType} action
   * @private
   */
  HomePane.prototype.createMenuAction = function(preferences, action) {
    this.menuActionMap.put(action, new ResourceAction(preferences, HomePane, /* Enum.name */ HomePane.MenuActionType[action], true));
  };
  /**
   * Creates the Swing actions matching each actions available in <code>plugins</code>.
   * @param {com.eteks.sweethome3d.plugin.Plugin[]} plugins
   * @private
   */
  HomePane.prototype.createPluginActions = function(plugins) {
    this.pluginActions = ([]);
    if (plugins != null) {
      for (var index123 = 0; index123 < plugins.length; index123++) {
        var plugin = plugins[index123];
        {
          {
            var array125 = plugin.getActions();
            for (var index124 = 0; index124 < array125.length; index124++) {
              var pluginAction = array125[index124];
              {
                /* add */ (this.pluginActions.push(new HomePane.ActionAdapter(this, pluginAction)) > 0);
              }
            }
          }
        }
      }
    }
  };
  /**
   * Creates components transfer handlers.
   * @param {Home} home
   * @param {HomeController} controller
   * @private
   */
  HomePane.prototype.createTransferHandlers = function(home, controller) {
    this.catalogTransferHandler = new FurnitureCatalogTransferHandler(controller.getContentManager(), controller.getFurnitureCatalogController(), controller.getFurnitureController());
    this.furnitureTransferHandler = new FurnitureTransferHandler(home, controller.getContentManager(), controller);
    this.planTransferHandler = new PlanTransferHandler(home, controller.getContentManager(), controller);
  };
  /**
   * Adds a property change listener to <code>home</code> to update
   * View from top and View from observer toggle models according to used camera.
   * @param {Home} home
   * @private
   */
  HomePane.prototype.addHomeListener = function(home) {
    var homePane = this;
    home.addPropertyChangeListener("CAMERA", {
      propertyChange : function(ev) {
        homePane.setToggleButtonModelSelected(HomeView.ActionType.VIEW_FROM_TOP, home.getCamera() == home.getTopCamera());
        homePane.setToggleButtonModelSelected(HomeView.ActionType.VIEW_FROM_OBSERVER, home.getCamera() == home.getObserverCamera());
      }
    });
  };
  /**
   * Changes the selection of the toggle model matching the given action.
   * @param {HomeView.ActionType} actionType
   * @param {boolean} selected
   * @private
   */
  HomePane.prototype.setToggleButtonModelSelected = function(actionType, selected) {
    this.getAction(actionType).putValue(ResourceAction.SELECTED_KEY, selected);
  };
  /**
   * Adds listener to <code>home</code> to update
   * Display all levels and Display selected level toggle models
   * according their visibility.
   * @param {Home} home
   * @private
   */
  HomePane.prototype.addLevelVisibilityListener = function(home) {
    home.getEnvironment().addPropertyChangeListener("ALL_LEVELS_VISIBLE", {
      propertyChange : function(ev) {
        var allLevelsVisible = home.getEnvironment().isAllLevelsVisible();
        setToggleButtonModelSelected(HomeView.ActionType.DISPLAY_ALL_LEVELS, allLevelsVisible);
        setToggleButtonModelSelected(HomeView.ActionType.DISPLAY_SELECTED_LEVEL, !allLevelsVisible);
      }
    });
  };
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
  };
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
    // TODO: support VAT in UserPreferences
    // this.getAction(HomeView.ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX_PERCENTAGE).putValue(ResourceAction.VISIBLE, preferences.isValueAddedTaxEnabled());
    // this.getAction(HomeView.ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX).putValue(ResourceAction.VISIBLE, preferences.isValueAddedTaxEnabled());
    // this.getAction(HomeView.ActionType.DISPLAY_HOME_FURNITURE_PRICE_VALUE_ADDED_TAX_INCLUDED).putValue(ResourceAction.VISIBLE, preferences.isValueAddedTaxEnabled());
    // this.getAction(HomeView.ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX_PERCENTAGE).putValue(ResourceAction.VISIBLE, preferences.isValueAddedTaxEnabled());
    // this.getAction(HomeView.ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX).putValue(ResourceAction.VISIBLE, preferences.isValueAddedTaxEnabled());
    // this.getAction(HomeView.ActionType.SORT_HOME_FURNITURE_BY_PRICE_VALUE_ADDED_TAX_INCLUDED).putValue(ResourceAction.VISIBLE, preferences.isValueAddedTaxEnabled());
  };
  /**
   * Adds a property change listener to <code>planController</code> to update
   * Select and Create walls toggle models according to current mode.
   * @param {PlanController} planController
   * @private
   */
  HomePane.prototype.addPlanControllerListener = function(planController) {
    var homePane = this;
    planController.addPropertyChangeListener("MODE", {
      propertyChange : function(ev) {
        var mode = planController.getMode();
        homePane.setToggleButtonModelSelected(HomeView.ActionType.SELECT, mode == PlanController.Mode.SELECTION);
        homePane.setToggleButtonModelSelected(HomeView.ActionType.PAN, mode == PlanController.Mode.PANNING);
        homePane.setToggleButtonModelSelected(HomeView.ActionType.CREATE_WALLS, mode == PlanController.Mode.WALL_CREATION);
        homePane.setToggleButtonModelSelected(HomeView.ActionType.CREATE_ROOMS, mode == PlanController.Mode.ROOM_CREATION);
        homePane.setToggleButtonModelSelected(HomeView.ActionType.CREATE_POLYLINES, mode == PlanController.Mode.POLYLINE_CREATION);
        homePane.setToggleButtonModelSelected(HomeView.ActionType.CREATE_DIMENSION_LINES, mode == PlanController.Mode.DIMENSION_LINE_CREATION);
        homePane.setToggleButtonModelSelected(HomeView.ActionType.CREATE_LABELS, mode == PlanController.Mode.LABEL_CREATION);
      }
    });
  };
  /**
   * Adds a focus change listener to report to controller focus changes.
   * @private
   */
  HomePane.prototype.addFocusListener = function() {
    java.awt.KeyboardFocusManager.getCurrentKeyboardFocusManager().addPropertyChangeListener("currentFocusCycleRoot", new HomePane.FocusCycleRootChangeListener(this));
  };
  /**
   * Sets a focus traversal policy that ignores invisible split pane components.
   * @private
   */
  HomePane.prototype.updateFocusTraversalPolicy = function() {
    this.setFocusTraversalPolicy(new HomePane.HomePane$6(this));
    this.setFocusTraversalPolicyProvider(true);
  };
  /**
   * Returns <code>true</code> if the top or the bottom component of the <code>splitPane</code>
   * is a parent of the given child component and is too small enough to show it.
   * @param {javax.swing.JSplitPane} splitPane
   * @param {java.awt.Component} childComponent
   * @return {boolean}
   * @private
   */
  HomePane.prototype.isChildComponentInvisible = function(splitPane, childComponent) {
    return (javax.swing.SwingUtilities.isDescendingFrom(childComponent, splitPane.getTopComponent()) && (splitPane.getTopComponent().getWidth() === 0 || splitPane.getTopComponent().getHeight() === 0)) || (javax.swing.SwingUtilities.isDescendingFrom(childComponent, splitPane.getBottomComponent()) && (splitPane.getBottomComponent().getWidth() === 0 || splitPane.getBottomComponent().getHeight() === 0));
  };
  /**
   * Returns the menu bar displayed in this pane.
   * @param {Home} home
   * @param {UserPreferences} preferences
   * @param {HomeController} controller
   * @return {javax.swing.JMenuBar}
   * @private
   */
  HomePane.prototype.createMenuBar = function(home, preferences, controller) {
    var fileMenu = new javax.swing.JMenu(this.menuActionMap.get(HomePane.MenuActionType.FILE_MENU));
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.NEW_HOME, fileMenu);
    if ( /* size */preferences.getHomeExamples().length > 0) {
      this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.NEW_HOME_FROM_EXAMPLE, fileMenu);
    }
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.OPEN, fileMenu);
    var openRecentHomeAction = this.menuActionMap.get(HomePane.MenuActionType.OPEN_RECENT_HOME_MENU);
    if (openRecentHomeAction.getValue(ResourceAction.NAME) != null) {
      var openRecentHomeMenu = new javax.swing.JMenu(openRecentHomeAction);
      this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.DELETE_RECENT_HOMES, openRecentHomeMenu);
      openRecentHomeMenu.addMenuListener(new HomePane.HomePane$7(this, openRecentHomeMenu, controller));
      fileMenu.add(openRecentHomeMenu);
    }
    fileMenu.addSeparator();
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.CLOSE, fileMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.SAVE, fileMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.SAVE_AS, fileMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.SAVE_AND_COMPRESS, fileMenu);
    fileMenu.addSeparator();
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.PAGE_SETUP, fileMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.PRINT_PREVIEW, fileMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.PRINT, fileMenu);
    if (!com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX()) {
      this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.PRINT_TO_PDF, fileMenu);
    }
    if (!com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() || !javaemul.internal.BooleanHelper.getBoolean("apple.laf.useScreenMenuBar")) {
      fileMenu.addSeparator();
      this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.PREFERENCES, fileMenu);
    }
    var editMenu = new javax.swing.JMenu(this.menuActionMap.get(HomePane.MenuActionType.EDIT_MENU));
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.UNDO, editMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.REDO, editMenu);
    editMenu.addSeparator();
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.CUT, editMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.COPY, editMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.PASTE, editMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.PASTE_TO_GROUP, editMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.PASTE_STYLE, editMenu);
    editMenu.addSeparator();
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.DELETE, editMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.SELECT_ALL, editMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.SELECT_ALL_AT_ALL_LEVELS, editMenu);
    var furnitureMenu = new javax.swing.JMenu(this.menuActionMap.get(HomePane.MenuActionType.FURNITURE_MENU));
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ADD_HOME_FURNITURE, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ADD_FURNITURE_TO_GROUP, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.MODIFY_FURNITURE, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.GROUP_FURNITURE, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.UNGROUP_FURNITURE, furnitureMenu);
    furnitureMenu.addSeparator();
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_TOP, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_BOTTOM, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_LEFT, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_RIGHT, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_FRONT_SIDE, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_BACK_SIDE, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_LEFT_SIDE, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_RIGHT_SIDE, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_SIDE_BY_SIDE, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.DISTRIBUTE_FURNITURE_HORIZONTALLY, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.DISTRIBUTE_FURNITURE_VERTICALLY, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.RESET_FURNITURE_ELEVATION, furnitureMenu);
    furnitureMenu.addSeparator();
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.IMPORT_FURNITURE, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.IMPORT_FURNITURE_LIBRARY, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.IMPORT_TEXTURE, furnitureMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.IMPORT_TEXTURES_LIBRARY, furnitureMenu);
    furnitureMenu.addSeparator();
    furnitureMenu.add(this.createFurnitureSortMenu(home, preferences));
    furnitureMenu.add(this.createFurnitureDisplayPropertyMenu(home, preferences));
    furnitureMenu.addSeparator();
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.EXPORT_TO_CSV, furnitureMenu);
    var planMenu = new javax.swing.JMenu(this.menuActionMap.get(HomePane.MenuActionType.PLAN_MENU));
    this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.SELECT, true, planMenu);
    this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.PAN, true, planMenu);
    this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.CREATE_WALLS, true, planMenu);
    this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.CREATE_ROOMS, true, planMenu);
    this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.CREATE_POLYLINES, true, planMenu);
    this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.CREATE_DIMENSION_LINES, true, planMenu);
    this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.CREATE_LABELS, true, planMenu);
    planMenu.addSeparator();
    var lockUnlockBasePlanMenuItem = this.createLockUnlockBasePlanMenuItem(home, false);
    if (lockUnlockBasePlanMenuItem != null) {
      planMenu.add(lockUnlockBasePlanMenuItem);
    }
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.FLIP_HORIZONTALLY, planMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.FLIP_VERTICALLY, planMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.MODIFY_COMPASS, planMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.MODIFY_WALL, planMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.JOIN_WALLS, planMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.REVERSE_WALL_DIRECTION, planMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.SPLIT_WALL, planMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.MODIFY_ROOM, planMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.MODIFY_POLYLINE, planMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.MODIFY_LABEL, planMenu);
    planMenu.add(this.createTextStyleMenu(home, preferences, false));
    planMenu.addSeparator();
    var importModifyBackgroundImageMenuItem = this.createImportModifyBackgroundImageMenuItem(home, false);
    if (importModifyBackgroundImageMenuItem != null) {
      planMenu.add(importModifyBackgroundImageMenuItem);
    }
    var hideShowBackgroundImageMenuItem = this.createHideShowBackgroundImageMenuItem(home, false);
    if (hideShowBackgroundImageMenuItem != null) {
      planMenu.add(hideShowBackgroundImageMenuItem);
    }
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.DELETE_BACKGROUND_IMAGE, planMenu);
    planMenu.addSeparator();
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ADD_LEVEL, planMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ADD_LEVEL_AT_SAME_ELEVATION, planMenu);
    var makeLevelUnviewableViewableMenuItem = this.createMakeLevelUnviewableViewableMenuItem(home, false);
    if (makeLevelUnviewableViewableMenuItem != null) {
      planMenu.add(makeLevelUnviewableViewableMenuItem);
    }
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.MAKE_LEVEL_ONLY_VIEWABLE_ONE, planMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.MAKE_ALL_LEVELS_VIEWABLE, planMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.MODIFY_LEVEL, planMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.DELETE_LEVEL, planMenu);
    planMenu.addSeparator();
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ZOOM_IN, planMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ZOOM_OUT, planMenu);
    planMenu.addSeparator();
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.EXPORT_TO_SVG, planMenu);
    var preview3DMenu = new javax.swing.JMenu(this.menuActionMap.get(HomePane.MenuActionType.VIEW_3D_MENU));
    this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.VIEW_FROM_TOP, true, preview3DMenu);
    this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.VIEW_FROM_OBSERVER, true, preview3DMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.MODIFY_OBSERVER, preview3DMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.STORE_POINT_OF_VIEW, preview3DMenu);
    var goToPointOfViewMenu = this.createGoToPointOfViewMenu(home, preferences, controller);
    if (goToPointOfViewMenu != null) {
      preview3DMenu.add(goToPointOfViewMenu);
    }
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.DELETE_POINTS_OF_VIEW, preview3DMenu);
    preview3DMenu.addSeparator();
    var attachDetach3DViewMenuItem = this.createAttachDetach3DViewMenuItem(controller, false);
    if (attachDetach3DViewMenuItem != null) {
      preview3DMenu.add(attachDetach3DViewMenuItem);
    }
    this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.DISPLAY_ALL_LEVELS, true, preview3DMenu);
    this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.DISPLAY_SELECTED_LEVEL, true, preview3DMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.MODIFY_3D_ATTRIBUTES, preview3DMenu);
    preview3DMenu.addSeparator();
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.CREATE_PHOTO, preview3DMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.CREATE_PHOTOS_AT_POINTS_OF_VIEW, preview3DMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.CREATE_VIDEO, preview3DMenu);
    preview3DMenu.addSeparator();
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.EXPORT_TO_OBJ, preview3DMenu);
    var helpMenu = new javax.swing.JMenu(this.menuActionMap.get(HomePane.MenuActionType.HELP_MENU));
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.HELP, helpMenu);
    if (!com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() || !javaemul.internal.BooleanHelper.getBoolean("apple.laf.useScreenMenuBar")) {
      this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.ABOUT, helpMenu);
    }
    var menuBar = new javax.swing.JMenuBar();
    menuBar.add(fileMenu);
    menuBar.add(editMenu);
    menuBar.add(furnitureMenu);
    if (controller.getPlanController().getView() != null) {
      menuBar.add(planMenu);
    }
    if (controller.getHomeController3D().getView() != null) {
      menuBar.add(preview3DMenu);
    }
    menuBar.add(helpMenu);
    for (var index126 = 0; index126 < this.pluginActions.length; index126++) {
      var pluginAction = this.pluginActions[index126];
      {
        var pluginMenu = pluginAction.getValue(/* name */ "MENU");
        if (pluginMenu != null) {
          var pluginActionAdded = false;
          for (var i = 0; i < menuBar.getMenuCount(); i++) {
            {
              var menu = menuBar.getMenu(i);
              if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
                return o1.equals(o2);
              }
              else {
                return o1 === o2;
              } })(menu.getText(), pluginMenu)) {
                menu.addSeparator();
                menu.add(new ResourceAction.MenuItemAction(pluginAction));
                pluginActionAdded = true;
                break;
              }
            }
            ;
          }
          if (!pluginActionAdded) {
            var menu = new javax.swing.JMenu(pluginMenu);
            menu.add(new ResourceAction.MenuItemAction(pluginAction));
            menuBar.add(menu, menuBar.getMenuCount() - 1);
          }
        }
      }
    }
    if (!com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() || !javaemul.internal.BooleanHelper.getBoolean("apple.laf.useScreenMenuBar")) {
      fileMenu.addSeparator();
      this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.EXIT, fileMenu);
    }
    this.removeUselessSeparatorsAndEmptyMenus(menuBar);
    return menuBar;
  };
  HomePane.prototype.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu = function(actionType, menu) {
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(actionType, false, menu);
  };
  HomePane.prototype.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu = function(actionType, popup, menu) {
    var action = this.getAction(actionType);
    if (action != null && action.getValue(ResourceAction.NAME) != null) {
      menu.add(popup ? new ResourceAction.PopupMenuItemAction(action) : new ResourceAction.MenuItemAction(action));
    }
  };
  /**
   * Adds the given action to <code>menu</code>.
   * @param {HomeView.ActionType} actionType
   * @param {boolean} popup
   * @param {javax.swing.JMenu} menu
   * @private
   */
  HomePane.prototype.addActionToMenu = function(actionType, popup, menu) {
    if (((typeof actionType === 'number') || actionType === null) && ((typeof popup === 'boolean') || popup === null) && ((menu != null && menu instanceof javax.swing.JMenu) || menu === null)) {
      return this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(actionType, popup, menu);
    }
    else if (((typeof actionType === 'number') || actionType === null) && ((popup != null && popup instanceof javax.swing.JMenu) || popup === null) && menu === undefined) {
      return this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(actionType, popup);
    }
    else
      throw new Error('invalid overload');
  };
  HomePane.prototype.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu = function(actionType, radioButton, menu) {
    this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$boolean$javax_swing_JMenu(actionType, false, radioButton, menu);
  };
  HomePane.prototype.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$boolean$javax_swing_JMenu = function(actionType, popup, radioButton, menu) {
    var action = this.getAction(actionType);
    if (action != null && action.getValue(ResourceAction.NAME) != null) {
      menu.add(this.createToggleMenuItem(action, popup, radioButton));
    }
  };
  /**
   * Adds to <code>menu</code> the menu item matching the given <code>actionType</code>.
   * @param {HomeView.ActionType} actionType
   * @param {boolean} popup
   * @param {boolean} radioButton
   * @param {javax.swing.JMenu} menu
   * @private
   */
  HomePane.prototype.addToggleActionToMenu = function(actionType, popup, radioButton, menu) {
    if (((typeof actionType === 'number') || actionType === null) && ((typeof popup === 'boolean') || popup === null) && ((typeof radioButton === 'boolean') || radioButton === null) && ((menu != null && menu instanceof javax.swing.JMenu) || menu === null)) {
      return this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$boolean$javax_swing_JMenu(actionType, popup, radioButton, menu);
    }
    else if (((typeof actionType === 'number') || actionType === null) && ((typeof popup === 'boolean') || popup === null) && ((radioButton != null && radioButton instanceof javax.swing.JMenu) || radioButton === null) && menu === undefined) {
      return this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(actionType, popup, radioButton);
    }
    else
      throw new Error('invalid overload');
  };
  /**
   * Creates a menu item for a toggle action.
   * @param {Object} action
   * @param {boolean} popup
   * @param {boolean} radioButton
   * @return {javax.swing.JMenuItem}
   * @private
   */
  HomePane.prototype.createToggleMenuItem = function(action, popup, radioButton) {
    var menuItem;
    if (radioButton) {
      menuItem = new javax.swing.JRadioButtonMenuItem();
    }
    else {
      menuItem = new javax.swing.JCheckBoxMenuItem();
    }
    menuItem.setModel(action.getValue(ResourceAction.TOGGLE_BUTTON_GROUP));
    menuItem.setAction(popup ? new ResourceAction.PopupMenuItemAction(action) : new ResourceAction.MenuItemAction(action));
    return menuItem;
  };
  /**
   * Adds the given action to <code>menu</code>.
   * @param {HomeView.ActionType} actionType
   * @param {javax.swing.JPopupMenu} menu
   * @return {javax.swing.JMenuItem}
   * @private
   */
  HomePane.prototype.addActionToPopupMenu = function(actionType, menu) {
    var action = this.getAction(actionType);
    if (action != null && action.getValue(ResourceAction.NAME) != null) {
      menu.add(new ResourceAction.PopupMenuItemAction(action));
      return menu.getComponent(menu.getComponentCount() - 1);
    }
    return null;
  };
  /**
   * Adds to <code>menu</code> the menu item matching the given <code>actionType</code>
   * and returns <code>true</code> if it was added.
   * @param {HomeView.ActionType} actionType
   * @param {boolean} radioButton
   * @param {javax.swing.JPopupMenu} menu
   * @private
   */
  HomePane.prototype.addToggleActionToPopupMenu = function(actionType, radioButton, menu) {
    var action = this.getAction(actionType);
    if (action != null && action.getValue(ResourceAction.NAME) != null) {
      menu.add(this.createToggleMenuItem(action, true, radioButton));
    }
  };
  /**
   * Removes the useless separators and empty menus among children of component.
   * @param {javax.swing.JComponent} component
   * @private
   */
  HomePane.prototype.removeUselessSeparatorsAndEmptyMenus = function(component) {
    for (var i = component.getComponentCount() - 1; i >= 0; i--) {
      {
        var child = component.getComponent(i);
        if ((child != null && child instanceof javax.swing.JSeparator) && (i === component.getComponentCount() - 1 || i > 0 && (component.getComponent(i - 1) != null && component.getComponent(i - 1) instanceof javax.swing.JSeparator))) {
          component.remove(i);
        }
        else if (child != null && child instanceof javax.swing.JMenu) {
          this.removeUselessSeparatorsAndEmptyMenus(child.getPopupMenu());
        }
        if ((child != null && child instanceof javax.swing.JMenu) && (child.getMenuComponentCount() === 0 || child.getMenuComponentCount() === 1 && (child.getMenuComponent(0) != null && child.getMenuComponent(0) instanceof javax.swing.JSeparator))) {
          component.remove(i);
        }
      }
      ;
    }
    if (component.getComponentCount() > 0 && (component.getComponent(0) != null && component.getComponent(0) instanceof javax.swing.JSeparator)) {
      component.remove(0);
    }
  };
  /**
   * Returns align or distribute menu.
   * @param {Home} home
   * @param {UserPreferences} preferences
   * @param {boolean} popup
   * @return {javax.swing.JMenu}
   * @private
   */
  HomePane.prototype.createAlignOrDistributeMenu = function(home, preferences, popup) {
    var alignOrDistributeMenu = new javax.swing.JMenu(this.menuActionMap.get(HomePane.MenuActionType.ALIGN_OR_DISTRIBUTE_MENU));
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_TOP, popup, alignOrDistributeMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_BOTTOM, popup, alignOrDistributeMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_LEFT, popup, alignOrDistributeMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_RIGHT, popup, alignOrDistributeMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_FRONT_SIDE, popup, alignOrDistributeMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_BACK_SIDE, popup, alignOrDistributeMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_LEFT_SIDE, popup, alignOrDistributeMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_ON_RIGHT_SIDE, popup, alignOrDistributeMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.ALIGN_FURNITURE_SIDE_BY_SIDE, popup, alignOrDistributeMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.DISTRIBUTE_FURNITURE_HORIZONTALLY, popup, alignOrDistributeMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.DISTRIBUTE_FURNITURE_VERTICALLY, popup, alignOrDistributeMenu);
    return alignOrDistributeMenu;
  };
  /**
   * Returns furniture sort menu.
   * @param {Home} home
   * @param {UserPreferences} preferences
   * @return {javax.swing.JMenu}
   * @private
   */
  HomePane.prototype.createFurnitureSortMenu = function(home, preferences) {
    var sortMenu = new javax.swing.JMenu(this.menuActionMap.get(HomePane.MenuActionType.SORT_HOME_FURNITURE_MENU));
    var sortActions = ({});
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_CATALOG_ID, sortActions, "CATALOG_ID");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_NAME, sortActions, "NAME");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_CREATOR, sortActions, "CREATOR");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_WIDTH, sortActions, "WIDTH");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_DEPTH, sortActions, "DEPTH");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_HEIGHT, sortActions, "HEIGHT");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_X, sortActions, "X");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_Y, sortActions, "Y");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_ELEVATION, sortActions, "ELEVATION");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_ANGLE, sortActions, "ANGLE");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_LEVEL, sortActions, "LEVEL");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_MODEL_SIZE, sortActions, "MODEL_SIZE");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_COLOR, sortActions, "COLOR");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_TEXTURE, sortActions, "TEXTURE");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_MOVABILITY, sortActions, "MOVABLE");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_TYPE, sortActions, "DOOR_OR_WINDOW");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_VISIBILITY, sortActions, "VISIBLE");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_PRICE, sortActions, "PRICE");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX_PERCENTAGE, sortActions, "VALUE_ADDED_TAX_PERCENTAGE");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX, sortActions, "VALUE_ADDED_TAX");
    this.addActionToMap(HomeView.ActionType.SORT_HOME_FURNITURE_BY_PRICE_VALUE_ADDED_TAX_INCLUDED, sortActions, "PRICE_VALUE_ADDED_TAX_INCLUDED");
    var sortButtonGroup = new javax.swing.ButtonGroup();
    {
      var array128 = /* entrySet */ (function(m) { if (m.entries == null)
        m.entries = []; return m.entries; })(sortActions);
      for (var index127 = 0; index127 < array128.length; index127++) {
        var entry = array128[index127];
        {
          var furnitureProperty = entry.getKey();
          var sortAction = entry.getValue();
          var sortMenuItem = new javax.swing.JRadioButtonMenuItem();
          sortMenuItem.setModel(new HomePane.HomePane$8(this, furnitureProperty, home));
          sortMenuItem.setVisible(/* equals */ (function(o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
          }
          else {
            return o1 === o2;
          } })(true, sortAction.getValue(ResourceAction.VISIBLE)));
          var menuItemAction = new ResourceAction.MenuItemAction(sortAction);
          sortAction.addPropertyChangeListener(new HomePane.HomePane$9(this, sortMenuItem, furnitureProperty, home, menuItemAction));
          sortMenuItem.setAction(menuItemAction);
          sortMenu.add(sortMenuItem);
          sortButtonGroup.add(sortMenuItem);
        }
      }
    }
    var sortOrderAction = this.getAction(HomeView.ActionType.SORT_HOME_FURNITURE_BY_DESCENDING_ORDER);
    if (sortOrderAction.getValue(ResourceAction.NAME) != null) {
      sortMenu.addSeparator();
      var sortOrderCheckBoxMenuItem = new javax.swing.JCheckBoxMenuItem();
      sortOrderCheckBoxMenuItem.setModel(new HomePane.HomePane$10(this, home));
      sortOrderCheckBoxMenuItem.setAction(new ResourceAction.MenuItemAction(sortOrderAction));
      sortMenu.add(sortOrderCheckBoxMenuItem);
    }
    return sortMenu;
  };
  /**
   * Adds to <code>actions</code> the action matching <code>actionType</code>.
   * @param {HomeView.ActionType} actionType
   * @param {Object} actions
   * @param {string} key
   * @private
   */
  HomePane.prototype.addActionToMap = function(actionType, actions, key) {
    var action = this.getAction(actionType);
    if (action != null && action.getValue(ResourceAction.NAME) != null) {
      /* put */ (function(m, k, v) { if (m.entries == null)
        m.entries = []; for (var i = 0; i < m.entries.length; i++)
          if (m.entries[i].key == null && k == null || m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
            m.entries[i].value = v;
            return;
          } m.entries.push({ key: k, value: v, getKey: function() { return this.key; }, getValue: function() { return this.value; } }); })(actions, key, action);
    }
  };
  /**
   * Returns furniture display property menu.
   * @param {Home} home
   * @param {UserPreferences} preferences
   * @return {javax.swing.JMenu}
   * @private
   */
  HomePane.prototype.createFurnitureDisplayPropertyMenu = function(home, preferences) {
    var displayPropertyMenu = new javax.swing.JMenu(this.menuActionMap.get(HomePane.MenuActionType.DISPLAY_HOME_FURNITURE_PROPERTY_MENU));
    var displayPropertyActions = ({});
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_CATALOG_ID, displayPropertyActions, "CATALOG_ID");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_NAME, displayPropertyActions, "NAME");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_CREATOR, displayPropertyActions, "CREATOR");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_WIDTH, displayPropertyActions, "WIDTH");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_DEPTH, displayPropertyActions, "DEPTH");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_HEIGHT, displayPropertyActions, "HEIGHT");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_X, displayPropertyActions, "X");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_Y, displayPropertyActions, "Y");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_ELEVATION, displayPropertyActions, "ELEVATION");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_ANGLE, displayPropertyActions, "ANGLE");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_LEVEL, displayPropertyActions, "LEVEL");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_MODEL_SIZE, displayPropertyActions, "MODEL_SIZE");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_COLOR, displayPropertyActions, "COLOR");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_TEXTURE, displayPropertyActions, "TEXTURE");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_MOVABLE, displayPropertyActions, "MOVABLE");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_DOOR_OR_WINDOW, displayPropertyActions, "DOOR_OR_WINDOW");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_VISIBLE, displayPropertyActions, "VISIBLE");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_PRICE, displayPropertyActions, "PRICE");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX_PERCENTAGE, displayPropertyActions, "VALUE_ADDED_TAX_PERCENTAGE");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX, displayPropertyActions, "VALUE_ADDED_TAX");
    this.addActionToMap(HomeView.ActionType.DISPLAY_HOME_FURNITURE_PRICE_VALUE_ADDED_TAX_INCLUDED, displayPropertyActions, "PRICE_VALUE_ADDED_TAX_INCLUDED");
    {
      var array130 = /* entrySet */ (function(m) { if (m.entries == null)
        m.entries = []; return m.entries; })(displayPropertyActions);
      for (var index129 = 0; index129 < array130.length; index129++) {
        var entry = array130[index129];
        {
          var furnitureProperty = entry.getKey();
          var displayPropertyAction = entry.getValue();
          var displayPropertyMenuItem = new javax.swing.JCheckBoxMenuItem();
          displayPropertyMenuItem.setModel(new HomePane.HomePane$11(this, home, furnitureProperty));
          displayPropertyMenuItem.setVisible(/* equals */ (function(o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
          }
          else {
            return o1 === o2;
          } })(true, displayPropertyAction.getValue(ResourceAction.VISIBLE)));
          displayPropertyMenuItem.setAction(displayPropertyAction);
          displayPropertyAction.addPropertyChangeListener(new HomePane.HomePane$12(this, displayPropertyMenuItem, home, furnitureProperty, displayPropertyAction));
          displayPropertyMenu.add(displayPropertyMenuItem);
        }
      }
    }
    return displayPropertyMenu;
  };
  /**
   * Returns Lock / Unlock base plan menu item.
   * @param {Home} home
   * @param {boolean} popup
   * @return {javax.swing.JMenuItem}
   * @private
   */
  HomePane.prototype.createLockUnlockBasePlanMenuItem = function(home, popup) {
    var actionMap = this.getActionMap();
    var unlockBasePlanAction = actionMap.get(HomeView.ActionType.UNLOCK_BASE_PLAN);
    var lockBasePlanAction = actionMap.get(HomeView.ActionType.LOCK_BASE_PLAN);
    if (unlockBasePlanAction != null && unlockBasePlanAction.getValue(ResourceAction.NAME) != null && lockBasePlanAction.getValue(ResourceAction.NAME) != null) {
      var lockUnlockBasePlanMenuItem = new javax.swing.JMenuItem(this.createLockUnlockBasePlanAction(home, popup));
      home.addPropertyChangeListener("BASE_PLAN_LOCKED", new HomePane.HomePane$13(this, lockUnlockBasePlanMenuItem, home, popup));
      return lockUnlockBasePlanMenuItem;
    }
    else {
      return null;
    }
  };
  /**
   * Returns the action active on Lock / Unlock base plan menu item.
   * @param {Home} home
   * @param {boolean} popup
   * @return {Object}
   * @private
   */
  HomePane.prototype.createLockUnlockBasePlanAction = function(home, popup) {
    var actionType = home.isBasePlanLocked() ? HomeView.ActionType.UNLOCK_BASE_PLAN : HomeView.ActionType.LOCK_BASE_PLAN;
    var action = this.getAction(actionType);
    return popup ? new ResourceAction.PopupMenuItemAction(action) : new ResourceAction.MenuItemAction(action);
  };
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
        && unlockBasePlanAction.getValue(ResourceAction.NAME) != null 
        && lockBasePlanAction.getValue(ResourceAction.NAME) != null) {
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
        && disableMagnetismAction.getValue(ResourceAction.NAME) !== null
        && enableMagnetismAction.getValue(ResourceAction.NAME) !== null) {
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
   */
  var MagnetismChangeListener = (function() {
    function MagnetismChangeListener(homePane, enableDisableMagnetismButton) {
      this.enableDisableMagnetismButton = enableDisableMagnetismButton;
      this.homePane = homePane;
    }

    MagnetismChangeListener.prototype.propertyChange = function(ev) {
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
    return MagnetismChangeListener;
  }());
  HomePane.MagnetismChangeListener = MagnetismChangeListener;

  /**
   * Returns text style menu.
   * @param {Home} home
   * @param {UserPreferences} preferences
   * @param {boolean} popup
   * @return {javax.swing.JMenu}
   * @private
   */
  HomePane.prototype.createTextStyleMenu = function(home, preferences, popup) {
    var modifyTextStyleMenu = new javax.swing.JMenu(this.menuActionMap.get(HomePane.MenuActionType.MODIFY_TEXT_STYLE));
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.INCREASE_TEXT_SIZE, popup, modifyTextStyleMenu);
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$javax_swing_JMenu(HomeView.ActionType.DECREASE_TEXT_SIZE, popup, modifyTextStyleMenu);
    modifyTextStyleMenu.addSeparator();
    this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$boolean$javax_swing_JMenu(HomeView.ActionType.TOGGLE_BOLD_STYLE, popup, false, modifyTextStyleMenu);
    this.addToggleActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$boolean$boolean$javax_swing_JMenu(HomeView.ActionType.TOGGLE_ITALIC_STYLE, popup, false, modifyTextStyleMenu);
    return modifyTextStyleMenu;
  };
  
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
            action.putValue(ResourceAction.SELECTED_KEY, selectionBoldStyle != null && selectionBoldStyle);
          },
        isItemTextBold: function(itemClass, textStyle) {
          if (textStyle == null) {
            textStyle = preferences.getDefaultTextStyle(itemClass);
          }
          return textStyle.isBold();
        }
      });
    return action;
  };
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
            action.putValue(ResourceAction.SELECTED_KEY, selectionItalicStyle != null && selectionItalicStyle);
          },
          isItemTextItalic: function(itemClass, textStyle) {
          if (textStyle == null) {
            textStyle = preferences.getDefaultTextStyle(itemClass);
          }
          return textStyle.isItalic();
        }
      });
    return action;
  };
  /**
   * Returns Import / Modify background image menu item.
   * @param {Home} home
   * @param {boolean} popup
   * @return {javax.swing.JMenuItem}
   * @private
   */
  HomePane.prototype.createImportModifyBackgroundImageMenuItem = function(home, popup) {
    var actionMap = this.getActionMap();
    var importBackgroundImageAction = actionMap.get(HomeView.ActionType.IMPORT_BACKGROUND_IMAGE);
    var modifyBackgroundImageAction = actionMap.get(HomeView.ActionType.MODIFY_BACKGROUND_IMAGE);
    if (importBackgroundImageAction != null && importBackgroundImageAction.getValue(ResourceAction.NAME) != null && modifyBackgroundImageAction.getValue(ResourceAction.NAME) != null) {
      var importModifyBackgroundImageMenuItem = new javax.swing.JMenuItem(this.createImportModifyBackgroundImageAction(home, popup));
      this.addBackgroundImageChangeListener(home, new HomePane.HomePane$17(this, importModifyBackgroundImageMenuItem, home, popup));
      return importModifyBackgroundImageMenuItem;
    }
    else {
      return null;
    }
  };
  /**
   * Adds to home and levels the given listener to follow background image changes.
   * @param {Home} home
   * @param {PropertyChangeListener} listener
   * @private
   */
  HomePane.prototype.addBackgroundImageChangeListener = function(home, listener) {
    home.addPropertyChangeListener("BACKGROUND_IMAGE", listener);
    home.addPropertyChangeListener("SELECTED_LEVEL", listener);
    var levelChangeListener = new HomePane.HomePane$18(this, listener);
    {
      var array132 = this.home.getLevels();
      for (var index131 = 0; index131 < array132.length; index131++) {
        var level = array132[index131];
        {
          level.addPropertyChangeListener(levelChangeListener);
        }
      }
    }
    this.home.addLevelsListener(function(ev) {
      switch ((ev.getType())) {
      case CollectionEvent.Type.ADD:
        ev.getItem().addPropertyChangeListener(levelChangeListener);
        break;
      case CollectionEvent.Type.DELETE:
        ev.getItem().removePropertyChangeListener(levelChangeListener);
        break;
      }
    });
  };
  /**
   * Returns the action active on Import / Modify menu item.
   * @param {Home} home
   * @param {boolean} popup
   * @return {Object}
   * @private
   */
  HomePane.prototype.createImportModifyBackgroundImageAction = function(home, popup) {
    var backgroundImage = home.getSelectedLevel() != null ? home.getSelectedLevel().getBackgroundImage() : home.getBackgroundImage();
    var backgroundImageActionType = backgroundImage == null ? HomeView.ActionType.IMPORT_BACKGROUND_IMAGE : HomeView.ActionType.MODIFY_BACKGROUND_IMAGE;
    var backgroundImageAction = this.getAction(backgroundImageActionType);
    return popup ? new ResourceAction.PopupMenuItemAction(backgroundImageAction) : new ResourceAction.MenuItemAction(backgroundImageAction);
  };
  /**
   * Returns Hide / Show background image menu item.
   * @param {Home} home
   * @param {boolean} popup
   * @return {javax.swing.JMenuItem}
   * @private
   */
  HomePane.prototype.createHideShowBackgroundImageMenuItem = function(home, popup) {
    var actionMap = this.getActionMap();
    var hideBackgroundImageAction = actionMap.get(HomeView.ActionType.HIDE_BACKGROUND_IMAGE);
    var showBackgroundImageAction = actionMap.get(HomeView.ActionType.SHOW_BACKGROUND_IMAGE);
    if (hideBackgroundImageAction != null && hideBackgroundImageAction.getValue(ResourceAction.NAME) != null && showBackgroundImageAction.getValue(ResourceAction.NAME) != null) {
      var hideShowBackgroundImageMenuItem = new javax.swing.JMenuItem(this.createHideShowBackgroundImageAction(home, popup));
      this.addBackgroundImageChangeListener(home, new HomePane.HomePane$19(this, hideShowBackgroundImageMenuItem, home, popup));
      return hideShowBackgroundImageMenuItem;
    }
    else {
      return null;
    }
  };
  /**
   * Returns the action active on Hide / Show menu item.
   * @param {Home} home
   * @param {boolean} popup
   * @return {Object}
   * @private
   */
  HomePane.prototype.createHideShowBackgroundImageAction = function(home, popup) {
    var backgroundImage = home.getSelectedLevel() != null ? home.getSelectedLevel().getBackgroundImage() : home.getBackgroundImage();
    var backgroundImageActionType = backgroundImage == null || backgroundImage.isVisible() ? HomeView.ActionType.HIDE_BACKGROUND_IMAGE : HomeView.ActionType.SHOW_BACKGROUND_IMAGE;
    var backgroundImageAction = this.getAction(backgroundImageActionType);
    return popup ? new ResourceAction.PopupMenuItemAction(backgroundImageAction) : new ResourceAction.MenuItemAction(backgroundImageAction);
  };
  /**
   * Returns Make level unviewable / viewable menu item.
   * @param {Home} home
   * @param {boolean} popup
   * @return {javax.swing.JMenuItem}
   * @private
   */
  HomePane.prototype.createMakeLevelUnviewableViewableMenuItem = function(home, popup) {
    var actionMap = this.getActionMap();
    var makeLevelUnviewableAction = actionMap.get(HomeView.ActionType.MAKE_LEVEL_UNVIEWABLE);
    var makeLevelViewableAction = actionMap.get(HomeView.ActionType.MAKE_LEVEL_VIEWABLE);
    if (makeLevelUnviewableAction != null && makeLevelUnviewableAction.getValue(ResourceAction.NAME) != null && makeLevelViewableAction.getValue(ResourceAction.NAME) != null) {
      var makeLevelUnviewableViewableMenuItem = new javax.swing.JMenuItem(this.createMakeLevelUnviewableViewableAction(home, popup));
      var viewabilityChangeListener = new HomePane.HomePane$20(this, makeLevelUnviewableViewableMenuItem, home, popup);
      var selectedLevel = home.getSelectedLevel();
      if (selectedLevel != null) {
        selectedLevel.addPropertyChangeListener(viewabilityChangeListener);
      }
      home.addPropertyChangeListener("SELECTED_LEVEL", new HomePane.HomePane$21(this, makeLevelUnviewableViewableMenuItem, home, popup, viewabilityChangeListener));
      return makeLevelUnviewableViewableMenuItem;
    }
    else {
      return null;
    }
  };
  /**
   * Returns the action active on Make level unviewable / viewable  menu item.
   * @param {Home} home
   * @param {boolean} popup
   * @return {Object}
   * @private
   */
  HomePane.prototype.createMakeLevelUnviewableViewableAction = function(home, popup) {
    var selectedLevel = home.getSelectedLevel();
    var levelViewabilityActionType = selectedLevel == null || selectedLevel.isViewable() ? HomeView.ActionType.MAKE_LEVEL_UNVIEWABLE : HomeView.ActionType.MAKE_LEVEL_VIEWABLE;
    var levelViewabilityAction = this.getAction(levelViewabilityActionType);
    return popup ? new ResourceAction.PopupMenuItemAction(levelViewabilityAction) : new ResourceAction.MenuItemAction(levelViewabilityAction);
  };
  /**
   * Returns Go to point of view menu.
   * @param {Home} home
   * @param {UserPreferences} preferences
   * @param {HomeController} controller
   * @return {javax.swing.JMenu}
   * @private
   */
  HomePane.prototype.createGoToPointOfViewMenu = function(home, preferences, controller) {
    var goToPointOfViewAction = this.menuActionMap.get(HomePane.MenuActionType.GO_TO_POINT_OF_VIEW);
    if (goToPointOfViewAction.getValue(ResourceAction.NAME) != null) {
      var goToPointOfViewMenu = new javax.swing.JMenu(goToPointOfViewAction);
      this.updateGoToPointOfViewMenu(goToPointOfViewMenu, home, controller);
      home.addPropertyChangeListener("STORED_CAMERAS", new HomePane.HomePane$22(this, goToPointOfViewMenu, home, controller));
      return goToPointOfViewMenu;
    }
    else {
      return null;
    }
  };
  /**
   * Updates Go to point of view menu items from the cameras stored in home.
   * @param {javax.swing.JMenu} goToPointOfViewMenu
   * @param {Home} home
   * @param {HomeController} controller
   * @private
   */
  HomePane.prototype.updateGoToPointOfViewMenu = function(goToPointOfViewMenu, home, controller) {
    var storedCameras = home.getStoredCameras();
    goToPointOfViewMenu.removeAll();
    if ( /* isEmpty */(storedCameras.length == 0)) {
      goToPointOfViewMenu.setEnabled(false);
      goToPointOfViewMenu.add(new ResourceAction(this.preferences, HomePane, "NoStoredPointOfView", false));
    }
    else {
      goToPointOfViewMenu.setEnabled(true);
      for (var index133 = 0; index133 < storedCameras.length; index133++) {
        var camera = storedCameras[index133];
        {
          goToPointOfViewMenu.add(new HomePane.HomePane$23(this, camera.getName(), controller, camera));
        }
      }
    }
  };
  /**
   * Returns Attach / Detach menu item for the 3D view.
   * @param {HomeController} controller
   * @param {boolean} popup
   * @return {javax.swing.JMenuItem}
   * @private
   */
  HomePane.prototype.createAttachDetach3DViewMenuItem = function(controller, popup) {
    var actionMap = this.getActionMap();
    var display3DViewInSeparateWindowAction = actionMap.get(HomeView.ActionType.DETACH_3D_VIEW);
    var display3DViewInMainWindowAction = actionMap.get(HomeView.ActionType.ATTACH_3D_VIEW);
    if (display3DViewInSeparateWindowAction != null && display3DViewInSeparateWindowAction.getValue(ResourceAction.NAME) != null && display3DViewInMainWindowAction.getValue(ResourceAction.NAME) != null) {
      var attachDetach3DViewMenuItem = new javax.swing.JMenuItem(this.createAttachDetach3DViewAction(controller, popup));
      var view3D = controller.getHomeController3D().getView();
      view3D.addAncestorListener(new HomePane.HomePane$24(this, attachDetach3DViewMenuItem, controller, popup));
      return attachDetach3DViewMenuItem;
    }
    else {
      return null;
    }
  };
  /**
   * Returns the action Attach / Detach menu item.
   * @param {HomeController} controller
   * @param {boolean} popup
   * @return {Object}
   * @private
   */
  HomePane.prototype.createAttachDetach3DViewAction = function(controller, popup) {
    var view3DRootPane = javax.swing.SwingUtilities.getRootPane(controller.getHomeController3D().getView());
    var display3DViewActionType = view3DRootPane === this ? HomeView.ActionType.DETACH_3D_VIEW : HomeView.ActionType.ATTACH_3D_VIEW;
    var attachmentAction = this.getAction(display3DViewActionType);
    return popup ? new ResourceAction.PopupMenuItemAction(attachmentAction) : new ResourceAction.MenuItemAction(attachmentAction);
  };
  /**
   * Updates <code>openRecentHomeMenu</code> from current recent homes in preferences.
   * @param {javax.swing.JMenu} openRecentHomeMenu
   * @param {HomeController} controller
   */
  HomePane.prototype.updateOpenRecentHomeMenu = function(openRecentHomeMenu, controller) {
    openRecentHomeMenu.removeAll();
    {
      var array135 = controller.getRecentHomes();
      for (var index134 = 0; index134 < array135.length; index134++) {
        var homeName = array135[index134];
        {
          openRecentHomeMenu.add(new HomePane.HomePane$25(this, controller.getContentManager().getPresentationName(homeName, ContentManager.ContentType.SWEET_HOME_3D), controller, homeName));
        }
      }
    }
    if (openRecentHomeMenu.getMenuComponentCount() > 0) {
      openRecentHomeMenu.addSeparator();
    }
    this.addActionToMenu$com_eteks_sweethome3d_viewcontroller_HomeView_ActionType$javax_swing_JMenu(HomeView.ActionType.DELETE_RECENT_HOMES, openRecentHomeMenu);
  };
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

  /** @private */
  HomePane.prototype.startToolBarButtonGroup = function(toolBar) {
    var buttonGroup = document.createElement("span");
    toolBar.appendChild(buttonGroup);
    buttonGroup.classList.add("toolbar-button-group");
  }

  /** @private */
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
    if (action.getValue(ResourceAction.NAME) != null) {
      var button = this.createToolBarButton(action, additionalClass);
      if (action.getValue(ResourceAction.SELECTED_KEY)) {
        button.classList.add("selected");
      }
      action.addPropertyChangeListener(function(ev) {
          if (ev.getPropertyName() == ResourceAction.SELECTED_KEY) {
            if (ev.getNewValue()) {
              button.classList.add("selected");
            } else {
              button.classList.remove("selected");
            }
          }
        });
      button.addEventListener("click", function() {
          var group = action.getValue(ResourceAction.TOGGLE_BUTTON_GROUP);
          action.putValue(ResourceAction.SELECTED_KEY, group ? true : !action.getValue(ResourceAction.SELECTED_KEY));
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
    if (action.getValue(ResourceAction.NAME) != null) {
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
          icon = newAction.getValue(ResourceAction.SMALL_ICON);
        }
        button.style.backgroundImage = "url('" + ZIPTools.getScriptFolder() + "/"+ icon + "')";
        button.style.backgroundPosition = "center";
        button.style.backgroundRepeat = "no-repeat";
        var shortDescription = newAction.getValue(ResourceAction.SHORT_DESCRIPTION);
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
            } else if (ev.getPropertyName() == ResourceAction.SHORT_DESCRIPTION) {
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
  };
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
  };
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
        name = action.getValue(ResourceAction.DEFAULT);
      }
      action.putValue(ResourceAction.NAME, name);
      action.putValue(ResourceAction.SHORT_DESCRIPTION, name);
    }
  };
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
      //   var viewports = SwingTools.findChildren(catalogView, javax.swing.JViewport);
      //   var catalogComponent = void 0;
      //   if ( /* size */viewports.length > 0) {
      //       catalogComponent = viewports[0].getView();
      //   }
      //   else {
      //       catalogComponent = catalogView;
      //   }
        if (this.furnitureCatalogDragAndDropListener == null) {
          this.furnitureCatalogDragAndDropListener = this.createFurnitureCatalogMouseListener();
        }
        
        var pieceContainers = this.controller.getFurnitureCatalogController().getView().getHTMLElement().querySelectorAll(".furniture");
        if (OperatingSystem.isInternetExplorerOrLegacyEdge()
            && window.PointerEvent) {
          // Multi touch support for IE and Edge
          for (i = 0; i < pieceContainers.length; i++) {
            pieceContainers[i].addEventListener("pointerdown", this.furnitureCatalogDragAndDropListener.pointerPressed);
          }
          this.controller.getFurnitureCatalogController().getView().getHTMLElement().addEventListener(
              "mousedown", this.furnitureCatalogDragAndDropListener.mousePressed);
          // Add pointermove and pointerup event listeners to window to capture pointer events out of the canvas 
          window.addEventListener("pointermove", this.furnitureCatalogDragAndDropListener.windowPointerMoved);
          window.addEventListener("pointerup", this.furnitureCatalogDragAndDropListener.windowPointerReleased);
        } else {
          for (i = 0; i < pieceContainers.length; i++) {
            pieceContainers[i].addEventListener("touchstart", this.furnitureCatalogDragAndDropListener.mousePressed);
          }
          window.addEventListener("touchmove", this.furnitureCatalogDragAndDropListener.mouseDragged);
          window.addEventListener("touchend", this.furnitureCatalogDragAndDropListener.windowMouseReleased);
          this.controller.getFurnitureCatalogController().getView().getHTMLElement().addEventListener(
              "mousedown", this.furnitureCatalogDragAndDropListener.mousePressed);
          window.addEventListener("mousemove", this.furnitureCatalogDragAndDropListener.mouseDragged);
          window.addEventListener("mouseup", this.furnitureCatalogDragAndDropListener.windowMouseReleased);
        }
      }
    } else {
      if (catalogView != null) {
        var pieceContainers = this.controller.getFurnitureCatalogController().getView().getHTMLElement().querySelectorAll(".furniture");
        if (OperatingSystem.isInternetExplorerOrLegacyEdge()
            && window.PointerEvent) {
          for (i = 0; i < pieceContainers.length; i++) {
            pieceContainers[i].removeEventListener("pointerdown", this.furnitureCatalogDragAndDropListener.pointerPressed);
          }
          this.controller.getFurnitureCatalogController().getView().getHTMLElement().removeEventListener(
              "mousedown", this.furnitureCatalogDragAndDropListener.mousePressed);
          // Add pointermove and pointerup event listeners to window to capture pointer events out of the canvas 
          window.removeEventListener("pointermove", this.furnitureCatalogDragAndDropListener.windowPointerMoved);
          window.removeEventListener("pointerup", this.furnitureCatalogDragAndDropListener.windowPointerReleased);
        } else {
          for (i = 0; i < pieceContainers.length; i++) {
            pieceContainers[i].removeEventListener("touchstart", this.furnitureCatalogDragAndDropListener.mousePressed);
          }
          window.removeEventListener("touchmove", this.furnitureCatalogDragAndDropListener.mouseDragged);
          window.removeEventListener("touchend", this.furnitureCatalogDragAndDropListener.windowMouseReleased);
          this.controller.getFurnitureCatalogController().getView().getHTMLElement().removeEventListener(
              "mousedown", this.furnitureCatalogDragAndDropListener.mousePressed);
          window.removeEventListener("mousemove", this.furnitureCatalogDragAndDropListener.mouseDragged);
          window.removeEventListener("mouseup", this.furnitureCatalogDragAndDropListener.windowMouseReleased);
        }
      }
    }
    this.transferHandlerEnabled = enabled;
  };
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

        // {
        //   getActionMap().put("EscapeDragFromFurnitureCatalog", new AbstractAction() {
        //       public void actionPerformed(ActionEvent ev) {
        //         if (!escaped) {
        //           if (previousView != null) {
        //             if (previousView == controller.getPlanController().getView()) {
        //               controller.getPlanController().stopDraggedItems();
        //             }
        //             if (previousCursor != null) {
        //               JComponent component = (JComponent)previousView;
        //               component.setCursor(previousCursor);
        //               if (component.getParent() instanceof JViewport) {
        //                 component.getParent().setCursor(previousCursor);
        //               }
        //             }
        //           }
        //           escaped = true;
        //         }
        //       }
        //     });
        // }
        mousePressed: function(ev) {
          if (!ev.target.classList.contains("selected")) {
            return;
          }
          if (ev.button === 0 || ev.targetTouches) {
            ev.preventDefault();
            ev.stopPropagation();
            var selectedFurniture = homePane.controller.getFurnitureCatalogController().getSelectedFurniture();
            if (selectedFurniture.length > 0) {
              mouseListener.selectedPiece = selectedFurniture[0];
              mouseListener.previousCursor = null;
              mouseListener.previousView = null;
              mouseListener.escaped = false;
              // InputMap inputMap = getInputMap(WHEN_IN_FOCUSED_WINDOW);
              // inputMap.put(KeyStroke.getKeyStroke("ESCAPE"), "EscapeDragFromFurnitureCatalog");
              // setInputMap(WHEN_IN_FOCUSED_WINDOW, inputMap);
            }
            mouseListener.actionStartedInFurnitureCatalog = true;
          }
        },
        mouseDragged: function(ev) {
          if (!ev.target.classList.contains("selected")) {
            return;
          }
          if (mouseListener.actionStartedInFurnitureCatalog
              && ((ev.buttons & 1) == 1 || ev.targetTouches)
              && mouseListener.selectedPiece != null) {
            ev.preventDefault();
            ev.stopPropagation();

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
                    // } else {
                    //   view = homePane.controller.getFurnitureController().getView();
                    //   pointInView = mouseListener.getPointInFurnitureView(ev);
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
        },
        pointerPressed : function(ev) {
          if (ev.pointerType != "mouse") {
            // Multi touch support for IE and Edge
            mouseListener.copyPointerToTargetTouches(ev);
          }
          mouseListener.mousePressed(ev);
        },
        windowPointerMoved : function(ev) {
          if (ev.pointerType != "mouse") {
            // Multi touch support for IE and Edge
            mouseListener.copyPointerToTargetTouches(ev);
          }
          mouseListener.mouseDragged(ev);
        },
        windowPointerReleased : function(ev) {
          if (ev.pointerType != "mouse") {
            delete mouseListener.pointerTouches [ev.pointerId];
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
    return mouseListener;
  };
  /**
   * Returns the main pane with catalog tree, furniture table and plan pane.
   * @param {Home} home
   * @param {UserPreferences} preferences
   * @param {HomeController} controller
   * @return {javax.swing.JComponent}
   * @private
   */
  HomePane.prototype.createMainPane = function(home, preferences, controller) {
    var catalogFurniturePane = this.createCatalogFurniturePane(home, preferences, controller);
    var planView3DPane = this.createPlanView3DPane(home, preferences, controller);
    if (catalogFurniturePane == null) {
      return planView3DPane;
    }
    else if (planView3DPane == null) {
      return catalogFurniturePane;
    }
    else {
      var leftToRightOrientation = java.awt.ComponentOrientation.getOrientation(/* getDefault */ (window.navigator['userLanguage'] || window.navigator.language)).isLeftToRight();
      var mainPane = new javax.swing.JSplitPane(javax.swing.JSplitPane.HORIZONTAL_SPLIT, leftToRightOrientation ? catalogFurniturePane : planView3DPane, leftToRightOrientation ? planView3DPane : catalogFurniturePane);
      mainPane.setDividerLocation((((leftToRightOrientation ? 360 : 670) * SwingTools.getResolutionScale()) | 0));
      this.configureSplitPane(mainPane, home, HomePane.MAIN_PANE_DIVIDER_LOCATION_VISUAL_PROPERTY, leftToRightOrientation ? 0.3 : 0.7, true, controller);
      mainPane.addPropertyChangeListener("componentOrientation", new HomePane.HomePane$29(this, mainPane, catalogFurniturePane, planView3DPane));
      return mainPane;
    }
  };
  /**
   * Configures <code>splitPane</code> divider location.
   * If <code>dividerLocationProperty</code> visual property exists in <code>home</code>,
   * its value will be used, otherwise the given resize weight will be used.
   * @param {javax.swing.JSplitPane} splitPane
   * @param {Home} home
   * @param {string} dividerLocationProperty
   * @param {number} defaultResizeWeight
   * @param {boolean} showBorder
   * @param {HomeController} controller
   * @private
   */
  HomePane.prototype.configureSplitPane = function(splitPane, home, dividerLocationProperty, defaultResizeWeight, showBorder, controller) {
    splitPane.setContinuousLayout(true);
    splitPane.setOneTouchExpandable(true);
    splitPane.setResizeWeight(defaultResizeWeight);
    if (!showBorder) {
      splitPane.setBorder(null);
    }
    var resizeWeightUpdater = new HomePane.HomePane$30(this, splitPane, defaultResizeWeight);
    splitPane.addPropertyChangeListener(javax.swing.JSplitPane.DIVIDER_LOCATION_PROPERTY, resizeWeightUpdater);
    var dividerLocation = home.getNumericProperty(dividerLocationProperty);
    if (dividerLocation != null) {
      splitPane.setDividerLocation(/* intValue */ (dividerLocation | 0));
      splitPane.addAncestorListener(new HomePane.HomePane$31(this, resizeWeightUpdater, splitPane));
    }
    splitPane.addPropertyChangeListener(javax.swing.JSplitPane.DIVIDER_LOCATION_PROPERTY, new HomePane.HomePane$32(this, splitPane, controller, dividerLocationProperty));
  };
  /**
   * Returns the catalog tree and furniture table pane.
   * @param {Home} home
   * @param {UserPreferences} preferences
   * @param {HomeController} controller
   * @return {javax.swing.JComponent}
   * @private
   */
  HomePane.prototype.createCatalogFurniturePane = function(home, preferences, controller) {
    var catalogView = controller.getFurnitureCatalogController().getView();
    if (catalogView != null) {
      var catalogViewPopup = new javax.swing.JPopupMenu();
      this.addActionToPopupMenu(HomeView.ActionType.COPY, catalogViewPopup);
      catalogViewPopup.addSeparator();
      this.addActionToPopupMenu(HomeView.ActionType.DELETE, catalogViewPopup);
      catalogViewPopup.addSeparator();
      this.addActionToPopupMenu(HomeView.ActionType.ADD_HOME_FURNITURE, catalogViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.ADD_FURNITURE_TO_GROUP, catalogViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.MODIFY_FURNITURE, catalogViewPopup);
      catalogViewPopup.addSeparator();
      this.addActionToPopupMenu(HomeView.ActionType.IMPORT_FURNITURE, catalogViewPopup);
      SwingTools.hideDisabledMenuItems(catalogViewPopup);
      catalogView.setComponentPopupMenu(catalogViewPopup);
      preferences.addPropertyChangeListener("FURNITURE_CATALOG_VIEWED_IN_TREE", new HomePane.FurnitureCatalogViewChangeListener(this, catalogView));
      if (catalogView != null && (catalogView["__interfaces"] != null && catalogView["__interfaces"].indexOf("javax.swing.Scrollable") >= 0 || catalogView.constructor != null && catalogView.constructor["__interfaces"] != null && catalogView.constructor["__interfaces"].indexOf("javax.swing.Scrollable") >= 0)) {
        catalogView = SwingTools.createScrollPane(catalogView);
      }
    }
    var furnitureView = controller.getFurnitureController().getView();
    if (furnitureView != null) {
      var furnitureViewPopup = new javax.swing.JPopupMenu();
      this.addActionToPopupMenu(HomeView.ActionType.UNDO, furnitureViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.REDO, furnitureViewPopup);
      furnitureViewPopup.addSeparator();
      this.addActionToPopupMenu(HomeView.ActionType.CUT, furnitureViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.COPY, furnitureViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.PASTE, furnitureViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.PASTE_TO_GROUP, furnitureViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.PASTE_STYLE, furnitureViewPopup);
      furnitureViewPopup.addSeparator();
      this.addActionToPopupMenu(HomeView.ActionType.DELETE, furnitureViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.SELECT_ALL, furnitureViewPopup);
      furnitureViewPopup.addSeparator();
      this.addActionToPopupMenu(HomeView.ActionType.MODIFY_FURNITURE, furnitureViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.GROUP_FURNITURE, furnitureViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.UNGROUP_FURNITURE, furnitureViewPopup);
      furnitureViewPopup.add(this.createAlignOrDistributeMenu(home, preferences, true));
      this.addActionToPopupMenu(HomeView.ActionType.RESET_FURNITURE_ELEVATION, furnitureViewPopup);
      furnitureViewPopup.addSeparator();
      furnitureViewPopup.add(this.createFurnitureSortMenu(home, preferences));
      furnitureViewPopup.add(this.createFurnitureDisplayPropertyMenu(home, preferences));
      furnitureViewPopup.addSeparator();
      this.addActionToPopupMenu(HomeView.ActionType.EXPORT_TO_CSV, furnitureViewPopup);
      SwingTools.hideDisabledMenuItems(furnitureViewPopup);
      furnitureView.setComponentPopupMenu(furnitureViewPopup);
      if (furnitureView != null && (furnitureView["__interfaces"] != null && furnitureView["__interfaces"].indexOf("javax.swing.Scrollable") >= 0 || furnitureView.constructor != null && furnitureView.constructor["__interfaces"] != null && furnitureView.constructor["__interfaces"].indexOf("javax.swing.Scrollable") >= 0)) {
        var focusManager = java.awt.KeyboardFocusManager.getCurrentKeyboardFocusManager();
        furnitureView.setFocusTraversalKeys(java.awt.KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS, focusManager.getDefaultFocusTraversalKeys(java.awt.KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS));
        furnitureView.setFocusTraversalKeys(java.awt.KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS, focusManager.getDefaultFocusTraversalKeys(java.awt.KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS));
        var furnitureScrollPane = SwingTools.createScrollPane(furnitureView);
        var viewport = furnitureScrollPane.getViewport();
        viewport.addMouseListener(new HomePane.HomePane$33(this, viewport));
        var viewportY = home.getNumericProperty(HomePane.FURNITURE_VIEWPORT_Y_VISUAL_PROPERTY);
        if (viewportY != null) {
          viewport.setViewPosition(new java.awt.Point(0, /* intValue */ (viewportY | 0)));
        }
        viewport.addChangeListener(new HomePane.HomePane$34(this, controller, viewport));
        furnitureView.getParent().setComponentPopupMenu(furnitureViewPopup);
        if (com.eteks.sweethome3d.tools.OperatingSystem.isMacOSXHighSierraOrSuperior() && !com.eteks.sweethome3d.tools.OperatingSystem.isJavaVersionGreaterOrEqual("1.7")) {
          furnitureScrollPane.getVerticalScrollBar().addAdjustmentListener(new HomePane.HomePane$35(this, viewport));
        }
        furnitureView = furnitureScrollPane;
      }
    }
    if (catalogView == null) {
      return furnitureView;
    }
    else if (furnitureView == null) {
      return catalogView;
    }
    else {
      var catalogFurniturePane = new javax.swing.JSplitPane(javax.swing.JSplitPane.VERTICAL_SPLIT, catalogView, furnitureView);
      catalogFurniturePane.setBorder(null);
      catalogFurniturePane.setMinimumSize(new java.awt.Dimension());
      this.configureSplitPane(catalogFurniturePane, home, HomePane.CATALOG_PANE_DIVIDER_LOCATION_VISUAL_PROPERTY, 0.5, false, controller);
      return catalogFurniturePane;
    }
  };
  /**
   * Returns the plan view and 3D view pane.
   * @param {Home} home
   * @param {UserPreferences} preferences
   * @param {HomeController} controller
   * @return {javax.swing.JComponent}
   * @private
   */
  HomePane.prototype.createPlanView3DPane = function(home, preferences, controller) {
    var _this = this;
    var planView = controller.getPlanController().getView();
    if (planView != null) {
      var planViewPopup = new javax.swing.JPopupMenu();
      this.addActionToPopupMenu(HomeView.ActionType.UNDO, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.REDO, planViewPopup);
      planViewPopup.addSeparator();
      this.addActionToPopupMenu(HomeView.ActionType.CUT, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.COPY, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.PASTE, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.PASTE_STYLE, planViewPopup);
      planViewPopup.addSeparator();
      this.addActionToPopupMenu(HomeView.ActionType.DELETE, planViewPopup);
      var selectObjectAction = this.menuActionMap.get(HomePane.MenuActionType.SELECT_OBJECT_MENU);
      var selectObjectMenu_1;
      if (selectObjectAction.getValue(ResourceAction.NAME) != null) {
        selectObjectMenu_1 = new javax.swing.JMenu(selectObjectAction);
        planViewPopup.add(selectObjectMenu_1);
        var toggleObjectSelectionAction = this.menuActionMap.get(HomePane.MenuActionType.TOGGLE_SELECTION_MENU);
        if (toggleObjectSelectionAction.getValue(ResourceAction.NAME) != null) {
          var shiftKeyListener = function(ev) {
            selectObjectMenu_1.setAction(_this.menuActionMap.get(ev.isShiftDown() ? HomePane.MenuActionType.TOGGLE_SELECTION_MENU : HomePane.MenuActionType.SELECT_OBJECT_MENU));
            return false;
          };
          this.addAncestorListener(new HomePane.HomePane$36(this, shiftKeyListener));
        }
      }
      else {
        selectObjectMenu_1 = null;
      }
      this.addActionToPopupMenu(HomeView.ActionType.SELECT_ALL, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.SELECT_ALL_AT_ALL_LEVELS, planViewPopup);
      planViewPopup.addSeparator();
      this.addToggleActionToPopupMenu(HomeView.ActionType.SELECT, true, planViewPopup);
      this.addToggleActionToPopupMenu(HomeView.ActionType.PAN, true, planViewPopup);
      this.addToggleActionToPopupMenu(HomeView.ActionType.CREATE_WALLS, true, planViewPopup);
      this.addToggleActionToPopupMenu(HomeView.ActionType.CREATE_ROOMS, true, planViewPopup);
      this.addToggleActionToPopupMenu(HomeView.ActionType.CREATE_POLYLINES, true, planViewPopup);
      this.addToggleActionToPopupMenu(HomeView.ActionType.CREATE_DIMENSION_LINES, true, planViewPopup);
      this.addToggleActionToPopupMenu(HomeView.ActionType.CREATE_LABELS, true, planViewPopup);
      planViewPopup.addSeparator();
      var lockUnlockBasePlanMenuItem = this.createLockUnlockBasePlanMenuItem(home, true);
      if (lockUnlockBasePlanMenuItem != null) {
        planViewPopup.add(lockUnlockBasePlanMenuItem);
      }
      this.addActionToPopupMenu(HomeView.ActionType.FLIP_HORIZONTALLY, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.FLIP_VERTICALLY, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.MODIFY_FURNITURE, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.GROUP_FURNITURE, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.UNGROUP_FURNITURE, planViewPopup);
      planViewPopup.add(this.createAlignOrDistributeMenu(home, preferences, true));
      this.addActionToPopupMenu(HomeView.ActionType.RESET_FURNITURE_ELEVATION, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.MODIFY_COMPASS, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.MODIFY_WALL, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.JOIN_WALLS, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.REVERSE_WALL_DIRECTION, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.SPLIT_WALL, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.MODIFY_ROOM, planViewPopup);
      var addRoomPointMenuItem = this.addActionToPopupMenu(HomeView.ActionType.ADD_ROOM_POINT, planViewPopup);
      var deleteRoomPointMenuItem = this.addActionToPopupMenu(HomeView.ActionType.DELETE_ROOM_POINT, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.MODIFY_POLYLINE, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.MODIFY_LABEL, planViewPopup);
      planViewPopup.add(this.createTextStyleMenu(home, preferences, true));
      planViewPopup.addSeparator();
      var importModifyBackgroundImageMenuItem = this.createImportModifyBackgroundImageMenuItem(home, true);
      if (importModifyBackgroundImageMenuItem != null) {
        planViewPopup.add(importModifyBackgroundImageMenuItem);
      }
      var hideShowBackgroundImageMenuItem = this.createHideShowBackgroundImageMenuItem(home, true);
      if (hideShowBackgroundImageMenuItem != null) {
        planViewPopup.add(hideShowBackgroundImageMenuItem);
      }
      this.addActionToPopupMenu(HomeView.ActionType.DELETE_BACKGROUND_IMAGE, planViewPopup);
      planViewPopup.addSeparator();
      this.addActionToPopupMenu(HomeView.ActionType.ADD_LEVEL, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.ADD_LEVEL_AT_SAME_ELEVATION, planViewPopup);
      var makeLevelUnviewableViewableMenuItem = this.createMakeLevelUnviewableViewableMenuItem(home, true);
      if (makeLevelUnviewableViewableMenuItem != null) {
        planViewPopup.add(makeLevelUnviewableViewableMenuItem);
      }
      this.addActionToPopupMenu(HomeView.ActionType.MAKE_LEVEL_ONLY_VIEWABLE_ONE, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.MAKE_ALL_LEVELS_VIEWABLE, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.MODIFY_LEVEL, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.DELETE_LEVEL, planViewPopup);
      planViewPopup.addSeparator();
      this.addActionToPopupMenu(HomeView.ActionType.ZOOM_OUT, planViewPopup);
      this.addActionToPopupMenu(HomeView.ActionType.ZOOM_IN, planViewPopup);
      planViewPopup.addSeparator();
      this.addActionToPopupMenu(HomeView.ActionType.EXPORT_TO_SVG, planViewPopup);
      SwingTools.hideDisabledMenuItems(planViewPopup);
      if (selectObjectMenu_1 != null) {
        this.addSelectObjectMenuItems(selectObjectMenu_1, controller.getPlanController(), preferences);
      }
      if (addRoomPointMenuItem != null || deleteRoomPointMenuItem != null) {
        this.updateRoomActions(addRoomPointMenuItem, deleteRoomPointMenuItem, controller.getPlanController(), preferences);
      }
      planView.setComponentPopupMenu(planViewPopup);
      var planScrollPane = void 0;
      if (planView != null && (planView["__interfaces"] != null && planView["__interfaces"].indexOf("javax.swing.Scrollable") >= 0 || planView.constructor != null && planView.constructor["__interfaces"] != null && planView.constructor["__interfaces"].indexOf("javax.swing.Scrollable") >= 0)) {
        planView = planScrollPane = SwingTools.createScrollPane(planView);
      }
      else {
        var scrollPanes = SwingTools.findChildren(planView, javax.swing.JScrollPane);
        if ( /* size */scrollPanes.length === 1) {
          planScrollPane = /* get */ scrollPanes[0];
        }
        else {
          planScrollPane = null;
        }
      }
      if (planScrollPane != null) {
        this.setPlanRulersVisible(planScrollPane, controller, preferences.isRulersVisible());
        if (planScrollPane.getCorner(javax.swing.ScrollPaneConstants.UPPER_LEADING_CORNER) == null) {
          var lockUnlockBasePlanButton = this.createLockUnlockBasePlanButton(home);
          if (lockUnlockBasePlanButton != null) {
            planScrollPane.setCorner(javax.swing.ScrollPaneConstants.UPPER_LEADING_CORNER, lockUnlockBasePlanButton);
            planScrollPane.addPropertyChangeListener("componentOrientation", new HomePane.HomePane$37(this, lockUnlockBasePlanButton, planScrollPane));
          }
        }
        preferences.addPropertyChangeListener("RULERS_VISIBLE", new HomePane.RulersVisibilityChangeListener(this, planScrollPane, controller));
        var viewport = planScrollPane.getViewport();
        var viewportX = home.getNumericProperty(HomePane.PLAN_VIEWPORT_X_VISUAL_PROPERTY);
        var viewportY = home.getNumericProperty(HomePane.PLAN_VIEWPORT_Y_VISUAL_PROPERTY);
        if (viewportX != null && viewportY != null) {
          viewport.setViewPosition(new java.awt.Point(/* intValue */ (viewportX | 0), /* intValue */ (viewportY | 0)));
        }
        viewport.addChangeListener(new HomePane.HomePane$38(this, viewport, controller));
      }
    }
    var view3D = controller.getHomeController3D().getView();
    if (view3D != null) {
      view3D.setPreferredSize(planView != null ? planView.getPreferredSize() : new java.awt.Dimension(400, 400));
      view3D.setMinimumSize(new java.awt.Dimension());
      var view3DPopup = new javax.swing.JPopupMenu();
      var selectObjectMenuItem_1 = this.addActionToPopupMenu(HomeView.ActionType.SELECT_OBJECT, view3DPopup);
      if (selectObjectMenuItem_1 != null) {
        var toggleSelectionAction = this.getAction(HomeView.ActionType.TOGGLE_SELECTION);
        if (toggleSelectionAction.getValue(ResourceAction.NAME) != null) {
          var shiftKeyListener = function(ev) {
            selectObjectMenuItem_1.setAction(_this.getAction(ev.isShiftDown() ? HomeView.ActionType.TOGGLE_SELECTION : HomeView.ActionType.SELECT_OBJECT));
            return false;
          };
          this.addAncestorListener(new HomePane.HomePane$39(this, shiftKeyListener));
        }
      }
      view3DPopup.addSeparator();
      this.addToggleActionToPopupMenu(HomeView.ActionType.VIEW_FROM_TOP, true, view3DPopup);
      this.addToggleActionToPopupMenu(HomeView.ActionType.VIEW_FROM_OBSERVER, true, view3DPopup);
      this.addActionToPopupMenu(HomeView.ActionType.MODIFY_OBSERVER, view3DPopup);
      this.addActionToPopupMenu(HomeView.ActionType.STORE_POINT_OF_VIEW, view3DPopup);
      var goToPointOfViewMenu = this.createGoToPointOfViewMenu(home, preferences, controller);
      if (goToPointOfViewMenu != null) {
        view3DPopup.add(goToPointOfViewMenu);
      }
      this.addActionToPopupMenu(HomeView.ActionType.DELETE_POINTS_OF_VIEW, view3DPopup);
      view3DPopup.addSeparator();
      var attachDetach3DViewMenuItem = this.createAttachDetach3DViewMenuItem(controller, true);
      if (attachDetach3DViewMenuItem != null) {
        view3DPopup.add(attachDetach3DViewMenuItem);
      }
      this.addToggleActionToPopupMenu(HomeView.ActionType.DISPLAY_ALL_LEVELS, true, view3DPopup);
      this.addToggleActionToPopupMenu(HomeView.ActionType.DISPLAY_SELECTED_LEVEL, true, view3DPopup);
      this.addActionToPopupMenu(HomeView.ActionType.MODIFY_3D_ATTRIBUTES, view3DPopup);
      view3DPopup.addSeparator();
      this.addActionToPopupMenu(HomeView.ActionType.CREATE_PHOTO, view3DPopup);
      this.addActionToPopupMenu(HomeView.ActionType.CREATE_PHOTOS_AT_POINTS_OF_VIEW, view3DPopup);
      this.addActionToPopupMenu(HomeView.ActionType.CREATE_VIDEO, view3DPopup);
      view3DPopup.addSeparator();
      this.addActionToPopupMenu(HomeView.ActionType.EXPORT_TO_OBJ, view3DPopup);
      SwingTools.hideDisabledMenuItems(view3DPopup);
      if (selectObjectMenuItem_1 != null) {
        this.updatePickingActions(selectObjectMenuItem_1, controller.getHomeController3D(), controller.getPlanController(), preferences);
      }
      view3D.setComponentPopupMenu(view3DPopup);
      if (view3D != null && (view3D["__interfaces"] != null && view3D["__interfaces"].indexOf("javax.swing.Scrollable") >= 0 || view3D.constructor != null && view3D.constructor["__interfaces"] != null && view3D.constructor["__interfaces"].indexOf("javax.swing.Scrollable") >= 0)) {
        view3D = SwingTools.createScrollPane(view3D);
      }
      var planView3DPane_1;
      var detachedView3D = javaemul.internal.BooleanHelper.parseBoolean(home.getProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view3D.constructor) + HomePane.DETACHED_VIEW_VISUAL_PROPERTY));
      if (planView != null) {
        var planView3DSplitPane = new javax.swing.JSplitPane(javax.swing.JSplitPane.VERTICAL_SPLIT, planView, view3D);
        planView3DSplitPane.setMinimumSize(new java.awt.Dimension());
        this.configureSplitPane(planView3DSplitPane, home, HomePane.PLAN_PANE_DIVIDER_LOCATION_VISUAL_PROPERTY, 0.5, false, controller);
        var dividerLocation = home.getNumericProperty(HomePane.PLAN_PANE_DIVIDER_LOCATION_VISUAL_PROPERTY);
        if (com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() && !com.eteks.sweethome3d.tools.OperatingSystem.isJavaVersionGreaterOrEqual("1.7") && !detachedView3D && dividerLocation != null && /* intValue */ (dividerLocation | 0) > 2 && !javaemul.internal.BooleanHelper.getBoolean("com.eteks.sweethome3d.j3d.useOffScreen3DView")) {
          planView3DSplitPane.addAncestorListener(new HomePane.HomePane$40(this, planView3DSplitPane, dividerLocation));
        }
        planView3DPane_1 = planView3DSplitPane;
      }
      else {
        planView3DPane_1 = view3D;
      }
      if (detachedView3D) {
        var dialogX_1 = this.home.getNumericProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view3D.constructor) + HomePane.DETACHED_VIEW_X_VISUAL_PROPERTY);
        var dialogY_1 = this.home.getNumericProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view3D.constructor) + HomePane.DETACHED_VIEW_Y_VISUAL_PROPERTY);
        var dialogWidth_1 = home.getNumericProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view3D.constructor) + HomePane.DETACHED_VIEW_WIDTH_VISUAL_PROPERTY);
        var dialogHeight_1 = home.getNumericProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view3D.constructor) + HomePane.DETACHED_VIEW_HEIGHT_VISUAL_PROPERTY);
        if (dialogX_1 != null && dialogY_1 != null && dialogWidth_1 != null && dialogHeight_1 != null) {
          java.awt.EventQueue.invokeLater(function() {
            var view3D = controller.getHomeController3D().getView();
            if (_this.getAction(HomeView.ActionType.DETACH_3D_VIEW).isEnabled() && SwingTools.isRectangleVisibleAtScreen(new java.awt.Rectangle(/* intValue */ (dialogX_1 | 0), /* intValue */ (dialogY_1 | 0), /* intValue */ (dialogWidth_1 | 0), /* intValue */ (dialogHeight_1 | 0)))) {
              _this.detachView$com_eteks_sweethome3d_viewcontroller_View$int$int$int$int(view3D, /* intValue */ (dialogX_1 | 0), /* intValue */ (dialogY_1 | 0), /* intValue */ (dialogWidth_1 | 0), /* intValue */ (dialogHeight_1 | 0));
            }
            else if (planView3DPane_1 != null && planView3DPane_1 instanceof javax.swing.JSplitPane) {
              var splitPane = planView3DPane_1;
              var dividerLocation = home.getNumericProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view3D.constructor) + HomePane.DETACHED_VIEW_DIVIDER_LOCATION_VISUAL_PROPERTY);
              if (dividerLocation != null && /* floatValue */ dividerLocation !== -1.0) {
                splitPane.setDividerLocation(/* floatValue */ dividerLocation);
              }
              controller.setHomeProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view3D.constructor) + HomePane.DETACHED_VIEW_VISUAL_PROPERTY, /* valueOf */ new String(false).toString());
            }
          });
          return planView3DPane_1;
        }
        controller.setHomeProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view3D.constructor) + HomePane.DETACHED_VIEW_X_VISUAL_PROPERTY, null);
      }
      return planView3DPane_1;
    }
    else {
      return planView;
    }
  };
  /**
   * Adds to the menu a listener that updates the actions that allow to
   * add or delete points in the selected room.
   * @param {javax.swing.JMenuItem} addRoomPointMenuItem
   * @param {javax.swing.JMenuItem} deleteRoomPointMenuItem
   * @param {PlanController} planController
   * @param {UserPreferences} preferences
   * @private
   */
  HomePane.prototype.updateRoomActions = function(addRoomPointMenuItem, deleteRoomPointMenuItem, planController, preferences) {
    var popupMenu = (addRoomPointMenuItem != null ? addRoomPointMenuItem : deleteRoomPointMenuItem).getParent();
    popupMenu.addPopupMenuListener(new HomePane.HomePane$41(this, planController.getView(), addRoomPointMenuItem, preferences, planController, deleteRoomPointMenuItem));
  };
  /**
   * Adds to the menu a popup listener that will update the menu items able to select
   * the selectable items in plan at the location where the menu will be triggered.
   * @param {javax.swing.JMenu} selectObjectMenu
   * @param {PlanController} planController
   * @param {UserPreferences} preferences
   * @private
   */
  HomePane.prototype.addSelectObjectMenuItems = function(selectObjectMenu, planController, preferences) {
    selectObjectMenu.getParent().addPopupMenuListener(new HomePane.HomePane$42(this, planController.getView(), planController, preferences, selectObjectMenu));
  };
  /**
   * Adds to the menu a listener that updates the actions that allow to
   * pick and select an object.
   * @param {javax.swing.JMenuItem} selectObjectMenuItem
   * @param {HomeController3D} homeController3D
   * @param {PlanController} planController
   * @param {UserPreferences} preferences
   * @private
   */
  HomePane.prototype.updatePickingActions = function(selectObjectMenuItem, homeController3D, planController, preferences) {
    var popupMenu = selectObjectMenuItem.getParent();
    popupMenu.addPopupMenuListener(new HomePane.HomePane$43(this, homeController3D.getView(), selectObjectMenuItem, planController, homeController3D));
  };
  /**
   * Sets the rulers visible in plan view.
   * @param {javax.swing.JScrollPane} planScrollPane
   * @param {HomeController} controller
   * @param {boolean} visible
   * @private
   */
  HomePane.prototype.setPlanRulersVisible = function(planScrollPane, controller, visible) {
    if (visible) {
      planScrollPane.setColumnHeaderView(controller.getPlanController().getHorizontalRulerView());
      planScrollPane.setRowHeaderView(controller.getPlanController().getVerticalRulerView());
    }
    else {
      planScrollPane.setColumnHeaderView(null);
      planScrollPane.setRowHeaderView(null);
    }
  };
  /**
   * Adds to <code>view</code> a mouse listener that disables all menu items of
   * <code>menuBar</code> during a drag and drop operation in <code>view</code>.
   * @param {Object} view
   * @param {javax.swing.JMenuBar} menuBar
   * @private
   */
  HomePane.prototype.disableMenuItemsDuringDragAndDrop = function(view, menuBar) {
    var listener = new HomePane.MouseAndFocusListener(this);
    if (view != null) {
      view.addMouseListener(listener);
      view.addFocusListener(listener);
    }
  };
  HomePane.prototype.detachView$com_eteks_sweethome3d_viewcontroller_View = function(view) {
    var component = view;
    var parent = component.getParent();
    if (parent != null && parent instanceof javax.swing.JViewport) {
      component = parent.getParent();
      parent = component.getParent();
    }
    var dividerLocation;
    if (parent != null && parent instanceof javax.swing.JSplitPane) {
      var splitPane = parent;
      if (splitPane.getOrientation() === javax.swing.JSplitPane.VERTICAL_SPLIT) {
        dividerLocation = splitPane.getDividerLocation() / (splitPane.getHeight() - splitPane.getDividerSize());
      }
      else {
        dividerLocation = splitPane.getDividerLocation() / (splitPane.getWidth() - splitPane.getDividerSize());
      }
    }
    else {
      dividerLocation = -1;
    }
    var dialogX = this.home.getNumericProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view.constructor) + HomePane.DETACHED_VIEW_X_VISUAL_PROPERTY);
    var dialogY = this.home.getNumericProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view.constructor) + HomePane.DETACHED_VIEW_Y_VISUAL_PROPERTY);
    var dialogWidth = this.home.getNumericProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view.constructor) + HomePane.DETACHED_VIEW_WIDTH_VISUAL_PROPERTY);
    var dialogHeight = this.home.getNumericProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view.constructor) + HomePane.DETACHED_VIEW_HEIGHT_VISUAL_PROPERTY);
    if (dialogX != null && dialogY != null && dialogWidth != null && dialogHeight != null) {
      this.detachView$com_eteks_sweethome3d_viewcontroller_View$int$int$int$int(view, /* intValue */ (dialogX | 0), /* intValue */ (dialogY | 0), /* intValue */ (dialogWidth | 0), /* intValue */ (dialogHeight | 0));
    }
    else {
      var componentLocation = new java.awt.Point();
      var componentSize = component.getSize();
      javax.swing.SwingUtilities.convertPointToScreen(componentLocation, component);
      var insets = new javax.swing.JDialog().getInsets();
      this.detachView$com_eteks_sweethome3d_viewcontroller_View$int$int$int$int(view, componentLocation.x - insets.left, componentLocation.y - insets.top, componentSize.width + insets.left + insets.right, componentSize.height + insets.top + insets.bottom);
    }
    this.controller.setHomeProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view.constructor) + HomePane.DETACHED_VIEW_DIVIDER_LOCATION_VISUAL_PROPERTY, /* valueOf */ new String(dividerLocation).toString());
  };
  HomePane.prototype.detachView$com_eteks_sweethome3d_viewcontroller_View$int$int$int$int = function(view, x, y, width, height) {
    var component = view;
    var parent = component.getParent();
    if (parent != null && parent instanceof javax.swing.JViewport) {
      component = parent.getParent();
      parent = component.getParent();
    }
    var dummyPanel = new javax.swing.JPanel();
    dummyPanel.setMaximumSize(new java.awt.Dimension());
    dummyPanel.setMinimumSize(new java.awt.Dimension());
    dummyPanel.setName(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view.constructor));
    dummyPanel.setBorder(component.getBorder());
    if (parent != null && parent instanceof javax.swing.JSplitPane) {
      var splitPane = parent;
      splitPane.setDividerSize(0);
      var dividerLocation = void 0;
      if (splitPane.getLeftComponent() === component) {
        splitPane.setLeftComponent(dummyPanel);
        dividerLocation = 0.0;
      }
      else {
        splitPane.setRightComponent(dummyPanel);
        dividerLocation = 1.0;
      }
      splitPane.setDividerLocation(dividerLocation);
      dummyPanel.addComponentListener(new HomePane.HomePane$44(this, dummyPanel, splitPane, dividerLocation));
    }
    else {
      var componentIndex = parent.getComponentZOrder(component);
      parent.remove(componentIndex);
      parent.add(dummyPanel, componentIndex);
    }
    var window = javax.swing.SwingUtilities.getWindowAncestor(this);
    if (!(window != null && window instanceof java.awt.Frame)) {
      window = javax.swing.JOptionPane.getRootFrame();
    }
    var defaultFrame = window;
    var separateWindow;
    if (com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() && com.eteks.sweethome3d.tools.OperatingSystem.isJavaVersionGreaterOrEqual("1.7") && java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().getScreenDevices().length > 1) {
      var separateFrame = new javax.swing.JFrame(defaultFrame.getTitle(), defaultFrame.getGraphicsConfiguration());
      separateFrame.setDefaultCloseOperation(javax.swing.WindowConstants.DO_NOTHING_ON_CLOSE);
      if (defaultFrame != null && defaultFrame instanceof javax.swing.JFrame) {
        separateFrame.setJMenuBar(this.createMenuBar(this.home, this.preferences, this.controller));
      }
      try {
        /* invoke */ /* getMethod */ (function(c, p) { if (c.prototype.hasOwnProperty(p) && typeof c.prototype[p] == 'function')
          return { owner: c, name: p, fn: c.prototype[p] };
          else
            return null; })(javax.swing.JFrame, "setIconImages").fn.apply(separateFrame, [/* invoke */ /* getMethod */ (function(c, p) { if (c.prototype.hasOwnProperty(p) && typeof c.prototype[p] == 'function')
              return { owner: c, name: p, fn: c.prototype[p] };
              else
                return null; })(javax.swing.JFrame, "getIconImages").fn.apply(defaultFrame)]);
      }
      catch (ex) {
        console.error(ex.message, ex);
      }
      separateWindow = separateFrame;
    }
    else {
      var separateDialog = new javax.swing.JDialog(defaultFrame, defaultFrame.getTitle(), false);
      separateDialog.setResizable(true);
      separateDialog.setDefaultCloseOperation(javax.swing.WindowConstants.DO_NOTHING_ON_CLOSE);
      var actionMap = this.getActionMap();
      separateDialog.getRootPane().setActionMap(actionMap);
      var inputMap = separateDialog.getRootPane().getInputMap(javax.swing.JComponent.WHEN_IN_FOCUSED_WINDOW);
      {
        var array138 = actionMap.allKeys();
        for (var index137 = 0; index137 < array138.length; index137++) {
          var key = array138[index137];
          {
            var action = actionMap.get(key);
            var accelerator = action.getValue(ResourceAction.ACCELERATOR_KEY);
            if (key !== HomeView.ActionType.CLOSE && key !== HomeView.ActionType.DETACH_3D_VIEW && (key !== HomeView.ActionType.EXIT || !com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX()) && accelerator != null) {
              inputMap.put(accelerator, key);
            }
          }
        }
      }
      separateWindow = separateDialog;
    }
    defaultFrame.addPropertyChangeListener("title", new HomePane.HomePane$45(this, separateWindow));
    var separateRootPane = separateWindow.getRootPane();
    if (defaultFrame != null && (defaultFrame["__interfaces"] != null && defaultFrame["__interfaces"].indexOf("javax.swing.RootPaneContainer") >= 0 || defaultFrame.constructor != null && defaultFrame.constructor["__interfaces"] != null && defaultFrame.constructor["__interfaces"].indexOf("javax.swing.RootPaneContainer") >= 0)) {
      if (com.eteks.sweethome3d.tools.OperatingSystem.isMacOSXLeopardOrSuperior()) {
        defaultFrame.getRootPane().addPropertyChangeListener("Window.documentModified", new HomePane.HomePane$46(this, separateRootPane));
      }
      else if (com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX()) {
        defaultFrame.getRootPane().addPropertyChangeListener("windowModified", new HomePane.HomePane$47(this, separateRootPane));
      }
    }
    separateRootPane.setContentPane(component);
    separateWindow.addWindowListener(new HomePane.HomePane$48(this, view));
    separateWindow.addComponentListener(new HomePane.HomePane$49(this, view, separateWindow));
    separateWindow.setBounds(x, y, width, height);
    separateWindow.setLocationByPlatform(!SwingTools.isRectangleVisibleAtScreen(separateWindow.getBounds()));
    separateWindow.setVisible(true);
    this.controller.setHomeProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view.constructor) + HomePane.DETACHED_VIEW_VISUAL_PROPERTY, true.toString());
  };
  /**
   * Detaches a <code>view</code> at the given location and size.
   * @param {Object} view
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @private
   */
  HomePane.prototype.detachView = function(view, x, y, width, height) {
    if (((view != null && (view["__interfaces"] != null && view["__interfaces"].indexOf("com.eteks.sweethome3d.viewcontroller.View") >= 0 || view.constructor != null && view.constructor["__interfaces"] != null && view.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.viewcontroller.View") >= 0)) || view === null) && ((typeof x === 'number') || x === null) && ((typeof y === 'number') || y === null) && ((typeof width === 'number') || width === null) && ((typeof height === 'number') || height === null)) {
      return this.detachView$com_eteks_sweethome3d_viewcontroller_View$int$int$int$int(view, x, y, width, height);
    }
    else if (((view != null && (view["__interfaces"] != null && view["__interfaces"].indexOf("com.eteks.sweethome3d.viewcontroller.View") >= 0 || view.constructor != null && view.constructor["__interfaces"] != null && view.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.viewcontroller.View") >= 0)) || view === null) && x === undefined && y === undefined && width === undefined && height === undefined) {
      return this.detachView$com_eteks_sweethome3d_viewcontroller_View(view);
    }
    else
      throw new Error('invalid overload');
  };
  /**
   * Attaches the given <code>view</code> to home view.
   * @param {Object} view
   */
  HomePane.prototype.attachView = function(view) {
    this.controller.setHomeProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view.constructor) + HomePane.DETACHED_VIEW_VISUAL_PROPERTY, /* valueOf */ new String(false).toString());
    var dummyComponent = this.findChild(this, /* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view.constructor));
    if (dummyComponent != null) {
      var component = view;
      var window_1 = javax.swing.SwingUtilities.getWindowAncestor(component);
      window_1.getRootPane().setActionMap(null);
      window_1.dispose();
      component.setBorder(dummyComponent.getBorder());
      var parent_1 = dummyComponent.getParent();
      if (parent_1 != null && parent_1 instanceof javax.swing.JSplitPane) {
        var splitPane = parent_1;
        splitPane.setDividerSize(javax.swing.UIManager.getInt("SplitPane.dividerSize"));
        var dividerLocation = this.home.getNumericProperty(/* getName */ (function(c) { return c["__class"] ? c["__class"] : c["name"]; })(view.constructor) + HomePane.DETACHED_VIEW_DIVIDER_LOCATION_VISUAL_PROPERTY);
        if (dividerLocation != null) {
          splitPane.setDividerLocation(/* floatValue */ dividerLocation);
        }
        if (splitPane.getLeftComponent() === dummyComponent) {
          splitPane.setLeftComponent(component);
        }
        else {
          splitPane.setRightComponent(component);
        }
      }
      else {
        var componentIndex = parent_1.getComponentZOrder(dummyComponent);
        parent_1.remove(componentIndex);
        parent_1.add(component, componentIndex);
      }
    }
  };
  /**
   * Returns among <code>parent</code> children the first child with the given name.
   * @param {java.awt.Container} parent
   * @param {string} childName
   * @return {java.awt.Component}
   * @private
   */
  HomePane.prototype.findChild = function(parent, childName) {
    for (var i = 0; i < parent.getComponentCount(); i++) {
      {
        var child = parent.getComponent(i);
        if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
          return o1.equals(o2);
        }
        else {
          return o1 === o2;
        } })(childName, child.getName())) {
          return child;
        }
        else if (child != null && child instanceof java.awt.Container) {
          child = this.findChild(child, childName);
          if (child != null) {
            return child;
          }
        }
      }
      ;
    }
    return null;
  };
  /**
   * Displays a content chooser open dialog to choose the name of a home.
   * @return {string}
   */
  HomePane.prototype.showOpenDialog = function() {
  };
  /**
   * Displays a dialog to let the user choose a home example.
   * @return {string}
   */
  HomePane.prototype.showNewHomeFromExampleDialog = function() {
  };
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
   */
  HomePane.prototype.confirmOpenDamagedHome = function(homeName, damagedHome, invalidContent) {
    var message = this.preferences.getLocalizedString(HomePane, "openDamagedHome.message", homeName, Math.max(1, /* size */ invalidContent.length));
    var title = this.preferences.getLocalizedString(HomePane, "openDamagedHome.title");
    var removeDamagedItems = this.preferences.getLocalizedString(HomePane, "openDamagedHome.removeDamagedItems");
    var replaceDamagedItems = this.preferences.getLocalizedString(HomePane, "openDamagedHome.replaceDamagedItems");
    var doNotOpenHome = this.preferences.getLocalizedString(HomePane, "openDamagedHome.doNotOpenHome");
    switch ((SwingTools.showOptionDialog(this, message, title, javax.swing.JOptionPane.YES_NO_CANCEL_OPTION, javax.swing.JOptionPane.WARNING_MESSAGE, [removeDamagedItems, replaceDamagedItems, doNotOpenHome], doNotOpenHome))) {
    case javax.swing.JOptionPane.YES_OPTION:
      return HomeView.OpenDamagedHomeAnswer.REMOVE_DAMAGED_ITEMS;
    case javax.swing.JOptionPane.NO_OPTION:
      return HomeView.OpenDamagedHomeAnswer.REPLACE_DAMAGED_ITEMS;
    default:
      return HomeView.OpenDamagedHomeAnswer.DO_NOT_OPEN_HOME;
    }
  };
  /**
   * Displays a content chooser open dialog to choose a language library.
   * @return {string}
   */
  HomePane.prototype.showImportLanguageLibraryDialog = function() {
  };
  /**
   * Displays a dialog that lets user choose whether he wants to overwrite
   * an existing language library or not.
   * @param {string} languageLibraryName
   * @return {boolean}
   */
  HomePane.prototype.confirmReplaceLanguageLibrary = function(languageLibraryName) {
    var message = this.preferences.getLocalizedString(HomePane, "confirmReplaceLanguageLibrary.message", this.controller.getContentManager().getPresentationName(languageLibraryName, ContentManager.ContentType.LANGUAGE_LIBRARY));
    var title = this.preferences.getLocalizedString(HomePane, "confirmReplaceLanguageLibrary.title");
    var replace = this.preferences.getLocalizedString(HomePane, "confirmReplaceLanguageLibrary.replace");
    var doNotReplace = this.preferences.getLocalizedString(HomePane, "confirmReplaceLanguageLibrary.doNotReplace");
    return SwingTools.showOptionDialog(this, message, title, javax.swing.JOptionPane.OK_CANCEL_OPTION, javax.swing.JOptionPane.QUESTION_MESSAGE, [replace, doNotReplace], doNotReplace) === javax.swing.JOptionPane.OK_OPTION;
  };
  /**
   * Displays a content chooser open dialog to choose a furniture library.
   * @return {string}
   */
  HomePane.prototype.showImportFurnitureLibraryDialog = function() {
  };
  /**
   * Displays a dialog that lets user choose whether he wants to overwrite
   * an existing furniture library or not.
   * @param {string} furnitureLibraryName
   * @return {boolean}
   */
  HomePane.prototype.confirmReplaceFurnitureLibrary = function(furnitureLibraryName) {
    var message = this.preferences.getLocalizedString(HomePane, "confirmReplaceFurnitureLibrary.message", this.controller.getContentManager().getPresentationName(furnitureLibraryName, ContentManager.ContentType.FURNITURE_LIBRARY));
    var title = this.preferences.getLocalizedString(HomePane, "confirmReplaceFurnitureLibrary.title");
    var replace = this.preferences.getLocalizedString(HomePane, "confirmReplaceFurnitureLibrary.replace");
    var doNotReplace = this.preferences.getLocalizedString(HomePane, "confirmReplaceFurnitureLibrary.doNotReplace");
    return SwingTools.showOptionDialog(this, message, title, javax.swing.JOptionPane.OK_CANCEL_OPTION, javax.swing.JOptionPane.QUESTION_MESSAGE, [replace, doNotReplace], doNotReplace) === javax.swing.JOptionPane.OK_OPTION;
  };
  /**
   * Displays a content chooser open dialog to choose a textures library.
   * @return {string}
   */
  HomePane.prototype.showImportTexturesLibraryDialog = function() {
  };
  /**
   * Displays a dialog that lets user choose whether he wants to overwrite
   * an existing textures library or not.
   * @param {string} texturesLibraryName
   * @return {boolean}
   */
  HomePane.prototype.confirmReplaceTexturesLibrary = function(texturesLibraryName) {
    var message = this.preferences.getLocalizedString(HomePane, "confirmReplaceTexturesLibrary.message", this.controller.getContentManager().getPresentationName(texturesLibraryName, ContentManager.ContentType.TEXTURES_LIBRARY));
    var title = this.preferences.getLocalizedString(HomePane, "confirmReplaceTexturesLibrary.title");
    var replace = this.preferences.getLocalizedString(HomePane, "confirmReplaceTexturesLibrary.replace");
    var doNotReplace = this.preferences.getLocalizedString(HomePane, "confirmReplaceTexturesLibrary.doNotReplace");
    return SwingTools.showOptionDialog(this, message, title, javax.swing.JOptionPane.OK_CANCEL_OPTION, javax.swing.JOptionPane.QUESTION_MESSAGE, [replace, doNotReplace], doNotReplace) === javax.swing.JOptionPane.OK_OPTION;
  };
  /**
   * Displays a dialog that lets user choose whether he wants to overwrite
   * an existing plug-in or not.
   * @param {string} pluginName
   * @return {boolean}
   */
  HomePane.prototype.confirmReplacePlugin = function(pluginName) {
    var message = this.preferences.getLocalizedString(HomePane, "confirmReplacePlugin.message", this.controller.getContentManager().getPresentationName(pluginName, ContentManager.ContentType.PLUGIN));
    var title = this.preferences.getLocalizedString(HomePane, "confirmReplacePlugin.title");
    var replace = this.preferences.getLocalizedString(HomePane, "confirmReplacePlugin.replace");
    var doNotReplace = this.preferences.getLocalizedString(HomePane, "confirmReplacePlugin.doNotReplace");
    return SwingTools.showOptionDialog(this, message, title, javax.swing.JOptionPane.OK_CANCEL_OPTION, javax.swing.JOptionPane.QUESTION_MESSAGE, [replace, doNotReplace], doNotReplace) === javax.swing.JOptionPane.OK_OPTION;
  };
  /**
   * Displays a content chooser save dialog to choose the name of a home.
   * @param {string} homeName
   * @return {string}
   */
  HomePane.prototype.showSaveDialog = function(homeName) {
    return this.controller.getContentManager().showSaveDialog(this, this.preferences.getLocalizedString(HomePane, "saveHomeDialog.title"), ContentManager.ContentType.SWEET_HOME_3D, homeName);
  };
  /**
   * Displays <code>message</code> in an error message box.
   * @param {string} message
   */
  HomePane.prototype.showError = function(message) {
    var title = this.preferences.getLocalizedString(HomePane, "error.title");
    javax.swing.JOptionPane.showMessageDialog(this, message, title, javax.swing.JOptionPane.ERROR_MESSAGE);
  };
  /**
   * Displays <code>message</code> in a message box.
   * @param {string} message
   */
  HomePane.prototype.showMessage = function(message) {
    var title = this.preferences.getLocalizedString(HomePane, "message.title");
    javax.swing.JOptionPane.showMessageDialog(this, message, title, javax.swing.JOptionPane.INFORMATION_MESSAGE);
  };
  /**
   * Displays the tip matching <code>actionTipKey</code> and
   * returns <code>true</code> if the user chose not to display again the tip.
   * @param {string} actionTipKey
   * @return {boolean}
   */
  HomePane.prototype.showActionTipMessage = function(actionTipKey) {
    var title = this.preferences.getLocalizedString(HomePane, actionTipKey + ".tipTitle");
    var message = this.preferences.getLocalizedString(HomePane, actionTipKey + ".tipMessage");
    if (message.length > 0) {
      var tipPanel = new javax.swing.JPanel(new java.awt.GridBagLayout());
      var messageLabel = new javax.swing.JLabel(message);
      tipPanel.add(messageLabel, new java.awt.GridBagConstraints(0, 0, 1, 1, 0, 0, java.awt.GridBagConstraints.NORTH, java.awt.GridBagConstraints.NONE, new java.awt.Insets(0, 0, 10, 0), 0, 0));
      var doNotDisplayTipCheckBox = new javax.swing.JCheckBox(SwingTools.getLocalizedLabelText(this.preferences, HomePane, "doNotDisplayTipCheckBox.text"));
      if (!com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX()) {
        doNotDisplayTipCheckBox.setMnemonic(javax.swing.KeyStroke.getKeyStroke(this.preferences.getLocalizedString(HomePane, "doNotDisplayTipCheckBox.mnemonic")).getKeyCode());
      }
      tipPanel.add(doNotDisplayTipCheckBox, new java.awt.GridBagConstraints(0, 1, 1, 1, 0, 1, java.awt.GridBagConstraints.CENTER, java.awt.GridBagConstraints.NONE, new java.awt.Insets(0, 0, ((5 * SwingTools.getResolutionScale()) | 0), 0), 0, 0));
      SwingTools.showMessageDialog(this, tipPanel, title, javax.swing.JOptionPane.INFORMATION_MESSAGE, doNotDisplayTipCheckBox);
      return doNotDisplayTipCheckBox.isSelected();
    }
    else {
      return true;
    }
  };
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
   */
  HomePane.prototype.confirmSave = function(homeName) {
    var message;
    if (homeName != null) {
      message = this.preferences.getLocalizedString(HomePane, "confirmSave.message", "\"" + this.controller.getContentManager().getPresentationName(homeName, ContentManager.ContentType.SWEET_HOME_3D) + "\"");
    }
    else {
      message = this.preferences.getLocalizedString(HomePane, "confirmSave.message", "");
    }
    var title = this.preferences.getLocalizedString(HomePane, "confirmSave.title");
    var save = this.preferences.getLocalizedString(HomePane, "confirmSave.save");
    var doNotSave = this.preferences.getLocalizedString(HomePane, "confirmSave.doNotSave");
    var cancel = this.preferences.getLocalizedString(HomePane, "confirmSave.cancel");
    switch ((SwingTools.showOptionDialog(this, message, title, javax.swing.JOptionPane.YES_NO_CANCEL_OPTION, javax.swing.JOptionPane.QUESTION_MESSAGE, [save, doNotSave, cancel], save))) {
    case javax.swing.JOptionPane.YES_OPTION:
      return HomeView.SaveAnswer.SAVE;
    case javax.swing.JOptionPane.NO_OPTION:
      return HomeView.SaveAnswer.DO_NOT_SAVE;
    default:
      return HomeView.SaveAnswer.CANCEL;
    }
  };
  /**
   * Displays a dialog that let user choose whether he wants to save
   * a home that was created with a newer version of Sweet Home 3D.
   * @return {boolean} <code>true</code> if user confirmed to save.
   * @param {string} homeName
   */
  HomePane.prototype.confirmSaveNewerHome = function(homeName) {
    var message = this.preferences.getLocalizedString(HomePane, "confirmSaveNewerHome.message", this.controller.getContentManager().getPresentationName(homeName, ContentManager.ContentType.SWEET_HOME_3D));
    var title = this.preferences.getLocalizedString(HomePane, "confirmSaveNewerHome.title");
    var save = this.preferences.getLocalizedString(HomePane, "confirmSaveNewerHome.save");
    var doNotSave = this.preferences.getLocalizedString(HomePane, "confirmSaveNewerHome.doNotSave");
    return SwingTools.showOptionDialog(this, message, title, javax.swing.JOptionPane.YES_NO_OPTION, javax.swing.JOptionPane.QUESTION_MESSAGE, [save, doNotSave], doNotSave) === javax.swing.JOptionPane.YES_OPTION;
  };
  /**
   * Displays a dialog that let user choose whether he wants to exit
   * application or not.
   * @return {boolean} <code>true</code> if user confirmed to exit.
   */
  HomePane.prototype.confirmExit = function() {
    var message = this.preferences.getLocalizedString(HomePane, "confirmExit.message");
    var title = this.preferences.getLocalizedString(HomePane, "confirmExit.title");
    var quit = this.preferences.getLocalizedString(HomePane, "confirmExit.quit");
    var doNotQuit = this.preferences.getLocalizedString(HomePane, "confirmExit.doNotQuit");
    return SwingTools.showOptionDialog(this, message, title, javax.swing.JOptionPane.YES_NO_OPTION, javax.swing.JOptionPane.QUESTION_MESSAGE, [quit, doNotQuit], doNotQuit) === javax.swing.JOptionPane.YES_OPTION;
  };
  /**
   * Displays an about dialog.
   */
  HomePane.prototype.showAboutDialog = function() {
  };
  /**
   * Returns the message displayed in the about dialog.
   * @return {string}
   * @private
   */
  HomePane.prototype.getAboutMessage = function() {
    var messageFormat = this.preferences.getLocalizedString(HomePane, "about.message");
    var aboutVersion = this.controller.getVersion();
    var javaVersion = java.lang.System.getProperty("java.version");
    var dataModel = java.lang.System.getProperty("sun.arch.data.model");
    if (dataModel != null) {
      try {
        javaVersion += " - " + /* parseInt */ parseInt(dataModel) + "bit";
      }
      catch (ex) {
      }
      ;
    }
    var runtime = java.lang.Runtime.getRuntime();
    var usedMemoryGigaByte = Math.max(0.1, (runtime.totalMemory() - runtime.freeMemory()) / 1.07374182E9);
    var maxMemoryGigaByte = Math.max(0.1, (runtime.maxMemory()) / 1.07374182E9);
    var format = new java.text.DecimalFormat("#.#");
    javaVersion += " - " + format.format(usedMemoryGigaByte) + " / " + format.format(maxMemoryGigaByte) + " " + ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
      return o1.equals(o2);
    }
    else {
      return o1 === o2;
    } })(string.FRENCH.getLanguage(), /* getDefault */ (window.navigator['userLanguage'] || window.navigator.language).getLanguage()) ? "Go" : "GB");
    var java3dVersion = "<i>not available</i>";
    try {
      if (!javaemul.internal.BooleanHelper.getBoolean("com.eteks.sweethome3d.no3D")) {
        java3dVersion = (function(m, k) { if (m.entries == null)
          m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key == null && k == null || m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
              return m.entries[i].value;
            } return null; })(javax.media.j3d.VirtualUniverse.getProperties(), "j3d.version");
        if (java3dVersion != null) {
          java3dVersion = java3dVersion.split("\\s")[0];
        }
      }
    }
    catch (ex) {
    }
    ;
    return CoreTools.format(messageFormat, aboutVersion, javaVersion, java3dVersion);
  };
  /**
   * Returns a component able to display message with active links.
   * @param {string} message
   * @return {javax.swing.text.JTextComponent}
   * @private
   */
  HomePane.prototype.createEditorPane = function(message) {
    var messagePane = new javax.swing.JEditorPane("text/html", message);
    messagePane.setEditable(false);
    if (SwingTools.getResolutionScale() !== 1) {
      messagePane.putClientProperty(javax.swing.JEditorPane.HONOR_DISPLAY_PROPERTIES, true);
    }
    messagePane.addHyperlinkListener(new HomePane.HomePane$50(this));
    return messagePane;
  };
  /**
   * Displays the given <code>libraries</code> in a dialog.
   * @param {*[]} libraries
   * @private
   */
  HomePane.prototype.showLibrariesDialog = function(libraries) {
    var title = this.preferences.getLocalizedString(HomePane, "libraries.title");
    var librariesLabels = ({});
    /* put */ (librariesLabels[UserPreferences.FURNITURE_LIBRARY_TYPE] = this.preferences.getLocalizedString(HomePane, "libraries.furnitureLibraries"));
    /* put */ (librariesLabels[UserPreferences.TEXTURES_LIBRARY_TYPE] = this.preferences.getLocalizedString(HomePane, "libraries.texturesLibraries"));
    /* put */ (librariesLabels[UserPreferences.LANGUAGE_LIBRARY_TYPE] = this.preferences.getLocalizedString(HomePane, "libraries.languageLibraries"));
    /* put */ (librariesLabels[com.eteks.sweethome3d.plugin.PluginManager.PLUGIN_LIBRARY_TYPE] = this.preferences.getLocalizedString(HomePane, "libraries.plugins"));
    var messagePanel = new javax.swing.JPanel(new java.awt.GridBagLayout());
    var row = 0;
    {
      var array140 = /* entrySet */ (function(o) { var s = []; for (var e in o)
        s.push({ k: e, v: o[e], getKey: function() { return this.k; }, getValue: function() { return this.v; } }); return s; })(librariesLabels);
      for (var index139 = 0; index139 < array140.length; index139++) {
        var librariesEntry = array140[index139];
        {
          var typeLibraries = ([]);
          for (var index141 = 0; index141 < libraries.length; index141++) {
            var library = libraries[index141];
            {
              if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
                return o1.equals(o2);
              }
              else {
                return o1 === o2;
              } })(librariesEntry.getKey(), library.getType())) {
                /* add */ (typeLibraries.push(library) > 0);
              }
            }
          }
          if (!(typeLibraries.length == 0)) {
            messagePanel.add(new javax.swing.JLabel(librariesEntry.getValue()), new java.awt.GridBagConstraints(0, row++, 1, 1, 0, 0, java.awt.GridBagConstraints.LINE_START, java.awt.GridBagConstraints.NONE, new java.awt.Insets(row === 0 ? 0 : 5, 2, 2, 0), 0, 0));
            var librariesTable = this.createLibrariesTable(typeLibraries);
            var librariesScrollPane = SwingTools.createScrollPane(librariesTable);
            librariesScrollPane.setPreferredSize(new java.awt.Dimension(Math.round(500 * SwingTools.getResolutionScale()), librariesTable.getTableHeader().getPreferredSize().height + librariesTable.getRowHeight() * 5 + 3));
            messagePanel.add(librariesScrollPane, new java.awt.GridBagConstraints(0, row++, 1, 1, 1, 1, java.awt.GridBagConstraints.CENTER, java.awt.GridBagConstraints.BOTH, new java.awt.Insets(0, 0, 0, 0), 0, 0));
          }
        }
      }
    }
    javax.swing.JOptionPane.showMessageDialog(this, messagePanel, title, javax.swing.JOptionPane.PLAIN_MESSAGE);
  };
  /**
   * Returns a table describing each library of the given collection.
   * @param {*[]} libraries
   * @return {javax.swing.JTable}
   * @private
   */
  HomePane.prototype.createLibrariesTable = function(libraries) {
    var librariesTableModel = new HomePane.HomePane$51(this, libraries);
    var librariesTable = new HomePane.HomePane$52(this, librariesTableModel, libraries);
    var resolutionScale = SwingTools.getResolutionScale();
    if (resolutionScale !== 1) {
      librariesTable.setRowHeight(Math.round(librariesTable.getRowHeight() * resolutionScale));
    }
    librariesTable.setAutoResizeMode(javax.swing.JTable.AUTO_RESIZE_OFF);
    var columnModel = librariesTable.getColumnModel();
    var columnMinWidths = [15, 20, 7, 50, 20];
    var defaultFont = new javax.swing.table.DefaultTableCellRenderer().getFont();
    var charWidth;
    if (defaultFont != null) {
      charWidth = this.getFontMetrics(defaultFont).getWidths()[('A').charCodeAt(0)];
    }
    else {
      charWidth = 10;
    }
    for (var i = 0; i < columnMinWidths.length; i++) {
      {
        columnModel.getColumn(i).setPreferredWidth(columnMinWidths[i] * charWidth);
      }
      ;
    }
    var desktopOpenSupport = false;
    if (com.eteks.sweethome3d.tools.OperatingSystem.isJavaVersionGreaterOrEqual("1.6")) {
      try {
        var desktopClass = eval("java.awt.Desktop");
        var desktopInstance = (function(c, p) { if (c.prototype.hasOwnProperty(p) && typeof c.prototype[p] == 'function')
          return { owner: c, name: p, fn: c.prototype[p] };
          else
            return null; })(desktopClass, "getDesktop").fn.apply(null);
        var desktopActionClass = eval("java.awt.Desktop$Action");
        var isSupportedMethod = (function(c, p) { if (c.prototype.hasOwnProperty(p) && typeof c.prototype[p] == 'function')
          return { owner: c, name: p, fn: c.prototype[p] };
          else
            return null; })(desktopClass, "isSupported");
        desktopOpenSupport = isSupportedMethod.fn.apply(desktopInstance, [/* invoke */ /* getMethod */ (function(c, p) { if (c.prototype.hasOwnProperty(p) && typeof c.prototype[p] == 'function')
          return { owner: c, name: p, fn: c.prototype[p] };
          else
            return null; })(desktopActionClass, "valueOf").fn.apply(null, ["OPEN"])]);
      }
      catch (ex) {
      }
      ;
    }
    var canOpenFolder = desktopOpenSupport || com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() || com.eteks.sweethome3d.tools.OperatingSystem.isLinux();
    columnModel.getColumn(0).setCellRenderer(new HomePane.HomePane$53(this, canOpenFolder));
    if (canOpenFolder) {
      librariesTable.addMouseListener(new HomePane.HomePane$54(this, librariesTable, libraries));
    }
    return librariesTable;
  };
  /**
   * Opens the folder containing the given library in a system window if possible.
   * @param {string} libraryLocation
   */
  HomePane.prototype.showLibraryFolderInSystem = function(libraryLocation) {
    var folder = new java.io.File(libraryLocation).getParentFile();
    var desktopInstance = null;
    var openMethod = null;
    if (com.eteks.sweethome3d.tools.OperatingSystem.isJavaVersionGreaterOrEqual("1.6")) {
      try {
        var desktopClass = eval("java.awt.Desktop");
        desktopInstance = /* invoke */ /* getMethod */ (function(c, p) { if (c.prototype.hasOwnProperty(p) && typeof c.prototype[p] == 'function')
          return { owner: c, name: p, fn: c.prototype[p] };
          else
            return null; })(desktopClass, "getDesktop").fn.apply(null);
        var desktopActionClass = eval("java.awt.Desktop$Action");
        var isSupportedMethod = (function(c, p) { if (c.prototype.hasOwnProperty(p) && typeof c.prototype[p] == 'function')
          return { owner: c, name: p, fn: c.prototype[p] };
          else
            return null; })(desktopClass, "isSupported");
        if (isSupportedMethod.fn.apply(desktopInstance, [/* invoke */ /* getMethod */ (function(c, p) { if (c.prototype.hasOwnProperty(p) && typeof c.prototype[p] == 'function')
          return { owner: c, name: p, fn: c.prototype[p] };
          else
            return null; })(desktopActionClass, "valueOf").fn.apply(null, ["OPEN"])])) {
          openMethod = /* getMethod */ (function(c, p) { if (c.prototype.hasOwnProperty(p) && typeof c.prototype[p] == 'function')
            return { owner: c, name: p, fn: c.prototype[p] };
            else
              return null; })(desktopClass, "open");
        }
      }
      catch (ex) {
      }
      ;
    }
    try {
      if (openMethod != null) {
        /* invoke */ openMethod.fn.apply(desktopInstance, [folder]);
      }
      else if (com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX()) {
        java.lang.Runtime.getRuntime().exec(["open", folder.getAbsolutePath()]);
      }
      else {
        java.lang.Runtime.getRuntime().exec(["xdg-open", folder.getAbsolutePath()]);
      }
    }
    catch (ex2) {
      console.error(ex2.message, ex2);
    }
    ;
  };
  /**
   * Displays the given message and returns <code>false</code> if the user
   * doesn't want to be informed of the shown updates anymore.
   * @param {string} updatesMessage the message to display
   * @param {boolean} showOnlyMessage if <code>false</code> a check box proposing not to display
   * again shown updates will be shown.
   * @return {boolean}
   */
  HomePane.prototype.showUpdatesMessage = function(updatesMessage, showOnlyMessage) {
    if (!showOnlyMessage) {
      {
        var array143 = java.awt.Frame.getFrames();
        for (var index142 = 0; index142 < array143.length; index142++) {
          var frame = array143[index142];
          {
            if (frame !== javax.swing.SwingUtilities.getWindowAncestor(this)) {
              {
                var array145 = frame.getOwnedWindows();
                for (var index144 = 0; index144 < array145.length; index144++) {
                  var window_2 = array145[index144];
                  {
                    if (window_2.isShowing() && (window_2 != null && window_2 instanceof java.awt.Dialog)) {
                      return true;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    var updatesPanel = new javax.swing.JPanel(new java.awt.GridBagLayout());
    var messageScrollPane = new javax.swing.JScrollPane(this.createEditorPane(updatesMessage));
    messageScrollPane.setPreferredSize(new java.awt.Dimension(500, 400));
    messageScrollPane.addAncestorListener(new HomePane.HomePane$55(this, messageScrollPane));
    updatesPanel.add(messageScrollPane, new java.awt.GridBagConstraints(0, 0, 1, 1, 1, 1, java.awt.GridBagConstraints.CENTER, java.awt.GridBagConstraints.BOTH, new java.awt.Insets(0, 0, ((5 * SwingTools.getResolutionScale()) | 0), 0), 0, 0));
    var doNotDisplayShownUpdatesCheckBox = new javax.swing.JCheckBox(SwingTools.getLocalizedLabelText(this.preferences, HomePane, "doNotDisplayShownUpdatesCheckBox.text"));
    if (!com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX()) {
      doNotDisplayShownUpdatesCheckBox.setMnemonic(javax.swing.KeyStroke.getKeyStroke(this.preferences.getLocalizedString(HomePane, "doNotDisplayShownUpdatesCheckBox.mnemonic")).getKeyCode());
    }
    if (!showOnlyMessage) {
      updatesPanel.add(doNotDisplayShownUpdatesCheckBox, new java.awt.GridBagConstraints(0, 1, 1, 1, 1, 1, java.awt.GridBagConstraints.CENTER, java.awt.GridBagConstraints.NONE, new java.awt.Insets(0, 0, 0, 0), 0, 0));
    }
    SwingTools.showMessageDialog(this, updatesPanel, this.preferences.getLocalizedString(HomePane, "showUpdatesMessage.title"), javax.swing.JOptionPane.PLAIN_MESSAGE, doNotDisplayShownUpdatesCheckBox);
    return !doNotDisplayShownUpdatesCheckBox.isSelected();
  };
  /**
   * Shows a print dialog to print the home displayed by this pane.
   * @return {() => any} a print task to execute or <code>null</code> if the user canceled print.
   * The <code>call</code> method of the returned task may throw a
   * {@link RecorderException} exception if print failed
   * or an {@link InterruptedRecorderException}
   * exception if it was interrupted.
   */
  HomePane.prototype.showPrintDialog = function() {
  };
  /**
   * Shows a content chooser save dialog to print a home in a PDF file.
   * @param {string} homeName
   * @return {string}
   */
  HomePane.prototype.showPrintToPDFDialog = function(homeName) {
    return this.controller.getContentManager().showSaveDialog(this, this.preferences.getLocalizedString(HomePane, "printToPDFDialog.title"), ContentManager.ContentType.PDF, homeName);
  };
  /**
   * Prints a home to a given PDF file. This method may be overridden
   * to write to another kind of output stream.
   * Caution !!! This method may be called from an other thread than EDT.
   * @param {string} pdfFile
   */
  HomePane.prototype.printToPDF = function(pdfFile) {
    var outputStream = null;
    var printInterrupted = false;
    try {
      outputStream = new java.io.FileOutputStream(pdfFile);
      new HomePDFPrinter(this.home, this.preferences, this.controller, this.getFont()).write(outputStream);
    }
    catch (__e) {
      if (__e != null && (__e["__classes"] && __e["__classes"].indexOf("java.io.InterruptedIOException") >= 0)) {
        var ex = __e;
        printInterrupted = true;
        throw new InterruptedRecorderException("Print interrupted");
      }
      if (__e != null && (__e["__classes"] && __e["__classes"].indexOf("java.io.IOException") >= 0)) {
        var ex = __e;
        throw new RecorderException("Couldn\'t export to PDF", ex);
      }
    }
    finally {
      try {
        if (outputStream != null) {
          outputStream.close();
        }
        if (printInterrupted) {
          new java.io.File(pdfFile)["delete"]();
        }
      }
      catch (ex) {
        throw new RecorderException("Couldn\'t export to PDF", ex);
      }
      ;
    }
    ;
  };
  /**
   * Shows a content chooser save dialog to export furniture list in a CSV file.
   * @param {string} homeName
   * @return {string}
   */
  HomePane.prototype.showExportToCSVDialog = function(homeName) {
    return this.controller.getContentManager().showSaveDialog(this, this.preferences.getLocalizedString(HomePane, "exportToCSVDialog.title"), ContentManager.ContentType.CSV, homeName);
  };
  /**
   * Exports furniture list to a given CSV file.
   * Caution !!! This method may be called from an other thread than EDT.
   * @param {string} csvFile
   */
  HomePane.prototype.exportToCSV = function(csvFile) {
    var view = this.controller.getFurnitureController().getView();
    var furnitureView;
    if ((view != null && (view["__interfaces"] != null && view["__interfaces"].indexOf("com.eteks.sweethome3d.viewcontroller.ExportableView") >= 0 || view.constructor != null && view.constructor["__interfaces"] != null && view.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.viewcontroller.ExportableView") >= 0)) && (view).isFormatTypeSupported(ExportableView.FormatType.CSV)) {
      furnitureView = view;
    }
    else {
      furnitureView = new FurnitureTable(this.home, this.preferences);
    }
    var out = null;
    var exportInterrupted = false;
    try {
      out = new java.io.BufferedOutputStream(new java.io.FileOutputStream(csvFile));
      null /*erased method furnitureView.exportData*/;
    }
    catch (__e) {
      if (__e != null && (__e["__classes"] && __e["__classes"].indexOf("java.io.InterruptedIOException") >= 0)) {
        var ex = __e;
        exportInterrupted = true;
        throw new InterruptedRecorderException("Export to " + csvFile + " interrupted");
      }
      if (__e != null && (__e["__classes"] && __e["__classes"].indexOf("java.io.IOException") >= 0)) {
        var ex = __e;
        throw new RecorderException("Couldn\'t export to CSV in " + csvFile, ex);
      }
    }
    finally {
      if (out != null) {
        try {
          out.close();
          if (exportInterrupted) {
            new java.io.File(csvFile)["delete"]();
          }
        }
        catch (ex) {
          throw new RecorderException("Couldn\'t export to CSV in " + csvFile, ex);
        }
        ;
      }
      ;
    }
    ;
  };
  /**
   * Shows a content chooser save dialog to export a home plan in a SVG file.
   * @param {string} homeName
   * @return {string}
   */
  HomePane.prototype.showExportToSVGDialog = function(homeName) {
    return this.controller.getContentManager().showSaveDialog(this, this.preferences.getLocalizedString(HomePane, "exportToSVGDialog.title"), ContentManager.ContentType.SVG, homeName);
  };
  /**
   * Exports the plan objects to a given SVG file.
   * Caution !!! This method may be called from an other thread than EDT.
   * @param {string} svgFile
   */
  HomePane.prototype.exportToSVG = function(svgFile) {
    var view = this.controller.getPlanController().getView();
    var planView;
    if ((view != null && (view["__interfaces"] != null && view["__interfaces"].indexOf("com.eteks.sweethome3d.viewcontroller.ExportableView") >= 0 || view.constructor != null && view.constructor["__interfaces"] != null && view.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.viewcontroller.ExportableView") >= 0)) && (view).isFormatTypeSupported(ExportableView.FormatType.SVG)) {
      planView = view;
    }
    else {
      planView = new PlanComponent(this.cloneHomeInEventDispatchThread(this.home), this.preferences, null);
    }
    var outputStream = null;
    var exportInterrupted = false;
    try {
      outputStream = new java.io.BufferedOutputStream(new java.io.FileOutputStream(svgFile));
      null /*erased method planView.exportData*/;
    }
    catch (__e) {
      if (__e != null && (__e["__classes"] && __e["__classes"].indexOf("java.io.InterruptedIOException") >= 0)) {
        var ex = __e;
        exportInterrupted = true;
        throw new InterruptedRecorderException("Export to " + svgFile + " interrupted");
      }
      if (__e != null && (__e["__classes"] && __e["__classes"].indexOf("java.io.IOException") >= 0)) {
        var ex = __e;
        throw new RecorderException("Couldn\'t export to SVG in " + svgFile, ex);
      }
    }
    finally {
      if (outputStream != null) {
        try {
          outputStream.close();
          if (exportInterrupted) {
            new java.io.File(svgFile)["delete"]();
          }
        }
        catch (ex) {
          throw new RecorderException("Couldn\'t export to SVG in " + svgFile, ex);
        }
        ;
      }
      ;
    }
    ;
  };
  /**
   * Shows a content chooser save dialog to export a 3D home in a OBJ file.
   * @param {string} homeName
   * @return {string}
   */
  HomePane.prototype.showExportToOBJDialog = function(homeName) {
    homeName = this.controller.getContentManager().showSaveDialog(this, this.preferences.getLocalizedString(HomePane, "exportToOBJDialog.title"), ContentManager.ContentType.OBJ, homeName);
    this.exportAllToOBJ = true;
    var selectedItems = this.home.getSelectedItems();
    if (homeName != null && !(selectedItems.length == 0) && ( /* size */selectedItems.length > 1 || !( /* get */selectedItems[0] != null && /* get */ selectedItems[0] instanceof Camera))) {
      var message = this.preferences.getLocalizedString(HomePane, "confirmExportAllToOBJ.message");
      var title = this.preferences.getLocalizedString(HomePane, "confirmExportAllToOBJ.title");
      var exportAll = this.preferences.getLocalizedString(HomePane, "confirmExportAllToOBJ.exportAll");
      var exportSelection = this.preferences.getLocalizedString(HomePane, "confirmExportAllToOBJ.exportSelection");
      var cancel = this.preferences.getLocalizedString(HomePane, "confirmExportAllToOBJ.cancel");
      var response = SwingTools.showOptionDialog(this, message, title, javax.swing.JOptionPane.YES_NO_CANCEL_OPTION, javax.swing.JOptionPane.QUESTION_MESSAGE, [exportAll, exportSelection, cancel], exportAll);
      if (response === javax.swing.JOptionPane.NO_OPTION) {
        this.exportAllToOBJ = false;
      }
      else if (response !== javax.swing.JOptionPane.YES_OPTION) {
        return null;
      }
    }
    return homeName;
  };
  HomePane.prototype.exportToOBJ$java_lang_String = function(objFile) {
    this.exportToOBJ$java_lang_String$com_eteks_sweethome3d_viewcontroller_Object3DFactory(objFile, new Object3DBranchFactory());
  };
  HomePane.prototype.exportToOBJ$java_lang_String$com_eteks_sweethome3d_viewcontroller_Object3DFactory = function(objFile, object3dFactory) {
    var header = this.preferences != null ? this.preferences.getLocalizedString(HomePane, "exportToOBJ.header", new Date()) : "";
    HomePane.OBJExporter.exportHomeToFile(this.cloneHomeInEventDispatchThread(this.home), objFile, header, this.exportAllToOBJ, object3dFactory);
  };
  /**
   * Exports to an OBJ file the objects of the 3D view created with the given factory.
   * Caution !!! This method may be called from an other thread than EDT.
   * @param {string} objFile
   * @param {Object} object3dFactory
   */
  HomePane.prototype.exportToOBJ = function(objFile, object3dFactory) {
    if (((typeof objFile === 'string') || objFile === null) && ((object3dFactory != null && (object3dFactory["__interfaces"] != null && object3dFactory["__interfaces"].indexOf("com.eteks.sweethome3d.viewcontroller.Object3DFactory") >= 0 || object3dFactory.constructor != null && object3dFactory.constructor["__interfaces"] != null && object3dFactory.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.viewcontroller.Object3DFactory") >= 0)) || object3dFactory === null)) {
      return this.exportToOBJ$java_lang_String$com_eteks_sweethome3d_viewcontroller_Object3DFactory(objFile, object3dFactory);
    }
    else if (((typeof objFile === 'string') || objFile === null) && object3dFactory === undefined) {
      return this.exportToOBJ$java_lang_String(objFile);
    }
    else
      throw new Error('invalid overload');
  };
  /**
   * Returns a clone of the given <code>home</code> safely cloned in the EDT.
   * @param {Home} home
   * @return {Home}
   * @private
   */
  HomePane.prototype.cloneHomeInEventDispatchThread = function(home) {
    if (java.awt.EventQueue.isDispatchThread()) {
      return /* clone */ /* clone */ (function(o) { if (o.clone != undefined) {
        return o.clone();
      }
      else {
        var clone = Object.create(o);
        for (var p in o) {
          if (o.hasOwnProperty(p))
            clone[p] = o[p];
        }
        return clone;
      } })(home);
    }
    else {
      try {
        var clonedHome_1 = (new java.util.concurrent.atomic.AtomicReference());
        java.awt.EventQueue.invokeAndWait(function() {
          clonedHome_1.set(/* clone */ /* clone */ (function(o) { if (o.clone != undefined) {
            return o.clone();
          }
          else {
            var clone = Object.create(o);
            for (var p in o) {
              if (o.hasOwnProperty(p))
                clone[p] = o[p];
            }
            return clone;
          } })(home));
        });
        return clonedHome_1.get();
      }
      catch (__e) {
        if (__e != null && (__e["__classes"] && __e["__classes"].indexOf("java.lang.InterruptedException") >= 0)) {
          var ex = __e;
          throw new InterruptedRecorderException(ex.message);
        }
        if (__e != null && (__e["__classes"] && __e["__classes"].indexOf("java.lang.reflect.InvocationTargetException") >= 0)) {
          var ex = __e;
          throw new RecorderException("Couldn\'t clone home", null);
        }
      }
      ;
    }
  };
  /**
   * Displays a dialog that let user choose whether he wants to delete
   * the selected furniture from catalog or not.
   * @return {boolean} <code>true</code> if user confirmed to delete.
   */
  HomePane.prototype.confirmDeleteCatalogSelection = function() {
    var message = this.preferences.getLocalizedString(HomePane, "confirmDeleteCatalogSelection.message");
    var title = this.preferences.getLocalizedString(HomePane, "confirmDeleteCatalogSelection.title");
    var __delete = this.preferences.getLocalizedString(HomePane, "confirmDeleteCatalogSelection.delete");
    var cancel = this.preferences.getLocalizedString(HomePane, "confirmDeleteCatalogSelection.cancel");
    return SwingTools.showOptionDialog(this, message, title, javax.swing.JOptionPane.OK_CANCEL_OPTION, javax.swing.JOptionPane.QUESTION_MESSAGE, [__delete, cancel], cancel) === javax.swing.JOptionPane.OK_OPTION;
  };
  /**
   * Displays a dialog that lets the user choose a name for the current camera.
   * @return {string} the chosen name or <code>null</code> if the user canceled.
   * @param {string} cameraName
   */
  HomePane.prototype.showStoreCameraDialog = function(cameraName) {
    var message = this.preferences.getLocalizedString(HomePane, "showStoreCameraDialog.message");
    var title = this.preferences.getLocalizedString(HomePane, "showStoreCameraDialog.title");
    var storedCameras = this.home.getStoredCameras();
    var cameraNameChooser;
    var cameraNameTextComponent;
    if ( /* isEmpty */(storedCameras.length == 0)) {
      cameraNameChooser = cameraNameTextComponent = new javax.swing.JTextField(cameraName, 20);
    }
    else {
      var storedCameraNames = (function(s) { var a = []; while (s-- > 0)
        a.push(null); return a; })(/* size */ storedCameras.length);
      for (var i = 0; i < storedCameraNames.length; i++) {
        {
          storedCameraNames[i] = /* get */ storedCameras[i].getName();
        }
        ;
      }
      var cameraNameComboBox = (new javax.swing.JComboBox(storedCameraNames));
      cameraNameComboBox.setEditable(true);
      cameraNameComboBox.getEditor().setItem(cameraName);
      var editorComponent = cameraNameComboBox.getEditor().getEditorComponent();
      if (editorComponent != null && editorComponent instanceof javax.swing.text.JTextComponent) {
        cameraNameTextComponent = editorComponent;
        cameraNameChooser = cameraNameComboBox;
      }
      else {
        cameraNameChooser = cameraNameTextComponent = new javax.swing.JTextField(cameraName, 20);
      }
    }
    if (!com.eteks.sweethome3d.tools.OperatingSystem.isMacOSXLeopardOrSuperior()) {
      SwingTools.addAutoSelectionOnFocusGain(cameraNameTextComponent);
    }
    var cameraNamePanel = new javax.swing.JPanel(new java.awt.BorderLayout(2, 2));
    cameraNamePanel.add(new javax.swing.JLabel(message), java.awt.BorderLayout.NORTH);
    cameraNamePanel.add(cameraNameChooser, java.awt.BorderLayout.SOUTH);
    if (SwingTools.showConfirmDialog(this, cameraNamePanel, title, cameraNameTextComponent) === javax.swing.JOptionPane.OK_OPTION) {
      cameraName = cameraNameTextComponent.getText().trim();
      if (cameraName.length > 0) {
        return cameraName;
      }
    }
    return null;
  };
  /**
   * Displays a dialog showing the list of cameras stored in home
   * and returns the ones selected by the user to be deleted.
   * @return {Camera[]}
   */
  HomePane.prototype.showDeletedCamerasDialog = function() {
  };
  /**
   * Adds a listener to clipboard to follow the changes of its content.
   * @private
   */
  HomePane.prototype.addClipboardListener = function() {
    if (!com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() || com.eteks.sweethome3d.tools.OperatingSystem.isJavaVersionGreaterOrEqual("1.8.0_60")) {
      try {
        var flavorListener = new HomePane.HomePane$56(this);
        flavorListener.flavorsChanged(null);
        this.addAncestorListener(new HomePane.HomePane$57(this, flavorListener));
      }
      catch (ex) {
      }
      ;
    }
  };
  /**
   * Returns <code>true</code> if clipboard doesn't contain data that
   * components are able to handle.
   * @return {boolean}
   */
  HomePane.prototype.isClipboardEmpty = function() {
    // if (com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() && !com.eteks.sweethome3d.tools.OperatingSystem.isJavaVersionGreaterOrEqual("1.8.0_60")) {
    //     try {
    //         this.checkClipboardContainsHomeItemsOrFiles();
    //     }
    //     catch (ex) {
    //     }
    //     ;
    // }
    return this.clipboardEmpty;
  };
  HomePane.prototype.checkClipboardContainsHomeItemsOrFiles = function() {
    var clipboard = this.getToolkit().getSystemClipboard();
    this.clipboardEmpty = !(clipboard.isDataFlavorAvailable(HomeTransferableList.HOME_FLAVOR) || clipboard.isDataFlavorAvailable(java.awt.datatransfer.DataFlavor.javaFileListFlavor));
  };
  /**
   * Returns the list of selectable items that are currently in clipboard
   * or <code>null</code> if clipboard doesn't contain any selectable item.
   * @return {*[]}
   */
  HomePane.prototype.getClipboardItems = function() {
    return this.clipboard;
  };
  /**
   * Execute <code>runnable</code> asynchronously in the thread
   * that manages toolkit events.
   * @param {() => void} runnable
   */
  HomePane.prototype.invokeLater = function(runnable) {
    setTimeout(runnable);
  };
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
  HomePane.DEFAULT_SMALL_ICON_HEIGHT = 16; //Math.round(16 * SwingTools.getResolutionScale()); // not useful in Web
  return HomePane;
}());
HomePane["__class"] = "com.eteks.sweethome3d.swing.HomePane";
HomePane["__interfaces"] = ["com.eteks.sweethome3d.viewcontroller.HomeView", "com.eteks.sweethome3d.viewcontroller.View", "javax.swing.TransferHandler.HasGetTransferHandler", "java.awt.MenuContainer", "javax.accessibility.Accessible", "java.awt.image.ImageObserver", "java.io.Serializable"];
(function(HomePane) {
  var MenuActionType;
  (function(MenuActionType) {
    MenuActionType[MenuActionType["FILE_MENU"] = 0] = "FILE_MENU";
    MenuActionType[MenuActionType["EDIT_MENU"] = 1] = "EDIT_MENU";
    MenuActionType[MenuActionType["FURNITURE_MENU"] = 2] = "FURNITURE_MENU";
    MenuActionType[MenuActionType["PLAN_MENU"] = 3] = "PLAN_MENU";
    MenuActionType[MenuActionType["VIEW_3D_MENU"] = 4] = "VIEW_3D_MENU";
    MenuActionType[MenuActionType["HELP_MENU"] = 5] = "HELP_MENU";
    MenuActionType[MenuActionType["OPEN_RECENT_HOME_MENU"] = 6] = "OPEN_RECENT_HOME_MENU";
    MenuActionType[MenuActionType["ALIGN_OR_DISTRIBUTE_MENU"] = 7] = "ALIGN_OR_DISTRIBUTE_MENU";
    MenuActionType[MenuActionType["SORT_HOME_FURNITURE_MENU"] = 8] = "SORT_HOME_FURNITURE_MENU";
    MenuActionType[MenuActionType["DISPLAY_HOME_FURNITURE_PROPERTY_MENU"] = 9] = "DISPLAY_HOME_FURNITURE_PROPERTY_MENU";
    MenuActionType[MenuActionType["MODIFY_TEXT_STYLE"] = 10] = "MODIFY_TEXT_STYLE";
    MenuActionType[MenuActionType["GO_TO_POINT_OF_VIEW"] = 11] = "GO_TO_POINT_OF_VIEW";
    MenuActionType[MenuActionType["SELECT_OBJECT_MENU"] = 12] = "SELECT_OBJECT_MENU";
    MenuActionType[MenuActionType["TOGGLE_SELECTION_MENU"] = 13] = "TOGGLE_SELECTION_MENU";
  })(MenuActionType = HomePane.MenuActionType || (HomePane.MenuActionType = {}));
  /**
   * Preferences property listener bound to this component with a weak reference to avoid
   * strong link between preferences and this component.
   * @param {HomePane} homePane
   * @class
   */
  var UserPreferencesChangeListener = /** @class */ (function() {
    function UserPreferencesChangeListener(homePane) {
      if (this.homePane === undefined)
        this.homePane = null;
      this.homePane = (homePane);
    }
    UserPreferencesChangeListener.prototype.propertyChange = function(ev) {
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
          actionMap.get(HomeView.ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX_PERCENTAGE).putValue(ResourceAction.VISIBLE, /* equals */ (function(o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
          }
          else {
            return o1 === o2;
          } })(true, ev.getNewValue()));
          actionMap.get(HomeView.ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX).putValue(ResourceAction.VISIBLE, /* equals */ (function(o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
          }
          else {
            return o1 === o2;
          } })(true, ev.getNewValue()));
          actionMap.get(HomeView.ActionType.DISPLAY_HOME_FURNITURE_PRICE_VALUE_ADDED_TAX_INCLUDED).putValue(ResourceAction.VISIBLE, /* equals */ (function(o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
          }
          else {
            return o1 === o2;
          } })(true, ev.getNewValue()));
          actionMap.get(HomeView.ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX_PERCENTAGE).putValue(ResourceAction.VISIBLE, /* equals */ (function(o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
          }
          else {
            return o1 === o2;
          } })(true, ev.getNewValue()));
          actionMap.get(HomeView.ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX).putValue(ResourceAction.VISIBLE, /* equals */ (function(o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
          }
          else {
            return o1 === o2;
          } })(true, ev.getNewValue()));
          actionMap.get(HomeView.ActionType.SORT_HOME_FURNITURE_BY_PRICE_VALUE_ADDED_TAX_INCLUDED).putValue(ResourceAction.VISIBLE, /* equals */ (function(o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
          }
          else {
            return o1 === o2;
          } })(true, ev.getNewValue()));
          break;
        }
      }
    };
    return UserPreferencesChangeListener;
  }());
  HomePane.UserPreferencesChangeListener = UserPreferencesChangeListener;
  UserPreferencesChangeListener["__class"] = "com.eteks.sweethome3d.swing.HomePane.UserPreferencesChangeListener";
  UserPreferencesChangeListener["__interfaces"] = ["java.util.EventListener", "java.beans.PropertyChangeListener"];
  /**
   * Property listener bound to this component with a weak reference to avoid
   * strong link between KeyboardFocusManager and this component.
   * @param {HomePane} homePane
   * @class
   */
  var FocusCycleRootChangeListener = /** @class */ (function() {
    function FocusCycleRootChangeListener(homePane) {
      if (this.homePane === undefined)
        this.homePane = null;
      if (this.focusChangeListener === undefined)
        this.focusChangeListener = null;
      this.homePane = (homePane);
    }
    FocusCycleRootChangeListener.prototype.propertyChange = function(ev) {
      var homePane = this.homePane;
      if (homePane == null) {
        java.awt.KeyboardFocusManager.getCurrentKeyboardFocusManager().removePropertyChangeListener("currentFocusCycleRoot", this);
      }
      else {
        if (javax.swing.SwingUtilities.isDescendingFrom(homePane, ev.getOldValue())) {
          java.awt.KeyboardFocusManager.getCurrentKeyboardFocusManager().removePropertyChangeListener("focusOwner", this.focusChangeListener);
          this.focusChangeListener = null;
        }
        else if (javax.swing.SwingUtilities.isDescendingFrom(homePane, ev.getNewValue())) {
          this.focusChangeListener = new HomePane.FocusOwnerChangeListener(homePane);
          java.awt.KeyboardFocusManager.getCurrentKeyboardFocusManager().addPropertyChangeListener("focusOwner", this.focusChangeListener);
        }
      }
    };
    return FocusCycleRootChangeListener;
  }());
  HomePane.FocusCycleRootChangeListener = FocusCycleRootChangeListener;
  FocusCycleRootChangeListener["__class"] = "com.eteks.sweethome3d.swing.HomePane.FocusCycleRootChangeListener";
  FocusCycleRootChangeListener["__interfaces"] = ["java.util.EventListener", "java.beans.PropertyChangeListener"];
  /**
   * Property listener bound to this component with a weak reference to avoid
   * strong link between KeyboardFocusManager and this component.
   * @class
   */
  var FocusOwnerChangeListener = /** @class */ (function() {
    function FocusOwnerChangeListener(homePane) {
      if (this.homePane === undefined)
        this.homePane = null;
      this.homePane = (homePane);
    }
    FocusOwnerChangeListener.prototype.propertyChange = function(ev) {
      var homePane = this.homePane;
      if (homePane == null) {
        java.awt.KeyboardFocusManager.getCurrentKeyboardFocusManager().removePropertyChangeListener("focusOwner", this);
      }
      else {
        if (homePane.lastFocusedComponent != null) {
          var lostFocusedComponent = homePane.lastFocusedComponent;
          if (javax.swing.SwingUtilities.isDescendingFrom(lostFocusedComponent, javax.swing.SwingUtilities.getWindowAncestor(homePane))) {
            lostFocusedComponent.removeKeyListener(homePane.specialKeysListener);
            if (homePane.previousPlanControllerMode != null && (lostFocusedComponent === homePane.controller.getPlanController().getView() || ev.getNewValue() == null)) {
              homePane.controller.getPlanController().setMode(homePane.previousPlanControllerMode);
              homePane.previousPlanControllerMode = null;
            }
          }
        }
        if (ev.getNewValue() != null) {
          var gainedFocusedComponent = ev.getNewValue();
          if (javax.swing.SwingUtilities.isDescendingFrom(gainedFocusedComponent, javax.swing.SwingUtilities.getWindowAncestor(homePane)) && (gainedFocusedComponent != null && gainedFocusedComponent instanceof javax.swing.JComponent)) {
            var focusableViews = [homePane.controller.getFurnitureCatalogController().getView(), homePane.controller.getFurnitureController().getView(), homePane.controller.getPlanController().getView(), homePane.controller.getHomeController3D().getView()];
            for (var index146 = 0; index146 < focusableViews.length; index146++) {
              var view = focusableViews[index146];
              {
                if (view != null && javax.swing.SwingUtilities.isDescendingFrom(gainedFocusedComponent, view)) {
                  homePane.controller.focusedViewChanged(view);
                  gainedFocusedComponent.addKeyListener(homePane.specialKeysListener);
                  homePane.lastFocusedComponent = gainedFocusedComponent;
                  break;
                }
              }
            }
          }
        }
      }
    };
    return FocusOwnerChangeListener;
  }());
  HomePane.FocusOwnerChangeListener = FocusOwnerChangeListener;
  FocusOwnerChangeListener["__class"] = "com.eteks.sweethome3d.swing.HomePane.FocusOwnerChangeListener";
  FocusOwnerChangeListener["__interfaces"] = ["java.util.EventListener", "java.beans.PropertyChangeListener"];
  /**
   * Preferences property listener bound to this component with a weak reference to avoid
   * strong link between preferences and this component.
   * @param {HomePane} homePane
   * @param {javax.swing.JComponent} furnitureCatalogView
   * @class
   */
  var FurnitureCatalogViewChangeListener = /** @class */ (function() {
    function FurnitureCatalogViewChangeListener(homePane, furnitureCatalogView) {
      if (this.homePane === undefined)
        this.homePane = null;
      if (this.furnitureCatalogView === undefined)
        this.furnitureCatalogView = null;
      this.homePane = (homePane);
      this.furnitureCatalogView = (furnitureCatalogView);
    }
    FurnitureCatalogViewChangeListener.prototype.propertyChange = function(ev) {
      var homePane = this.homePane;
      if (homePane == null) {
        (ev.getSource()).removePropertyChangeListener("FURNITURE_CATALOG_VIEWED_IN_TREE", this);
      }
      else {
        var oldFurnitureCatalogView = this.furnitureCatalogView;
        if (oldFurnitureCatalogView != null) {
          var transferHandlerEnabled = homePane.transferHandlerEnabled;
          homePane.setTransferEnabled(false);
          var newFurnitureCatalogView = homePane.controller.getFurnitureCatalogController().getView();
          newFurnitureCatalogView.setComponentPopupMenu(oldFurnitureCatalogView.getComponentPopupMenu());
          homePane.setTransferEnabled(transferHandlerEnabled);
          var splitPaneTopComponent = newFurnitureCatalogView;
          if (newFurnitureCatalogView != null && (newFurnitureCatalogView["__interfaces"] != null && newFurnitureCatalogView["__interfaces"].indexOf("javax.swing.Scrollable") >= 0 || newFurnitureCatalogView.constructor != null && newFurnitureCatalogView.constructor["__interfaces"] != null && newFurnitureCatalogView.constructor["__interfaces"].indexOf("javax.swing.Scrollable") >= 0)) {
            splitPaneTopComponent = SwingTools.createScrollPane(newFurnitureCatalogView);
          }
          else {
            splitPaneTopComponent = newFurnitureCatalogView;
          }
          javax.swing.SwingUtilities.getAncestorOfClass(javax.swing.JSplitPane, oldFurnitureCatalogView).setTopComponent(splitPaneTopComponent);
          newFurnitureCatalogView.applyComponentOrientation(java.awt.ComponentOrientation.getOrientation(/* getDefault */ (window.navigator['userLanguage'] || window.navigator.language)));
          this.furnitureCatalogView = (newFurnitureCatalogView);
        }
      }
    };
    return FurnitureCatalogViewChangeListener;
  }());
  HomePane.FurnitureCatalogViewChangeListener = FurnitureCatalogViewChangeListener;
  FurnitureCatalogViewChangeListener["__class"] = "com.eteks.sweethome3d.swing.HomePane.FurnitureCatalogViewChangeListener";
  FurnitureCatalogViewChangeListener["__interfaces"] = ["java.util.EventListener", "java.beans.PropertyChangeListener"];
  /**
   * Preferences property listener bound to this component with a weak reference to avoid
   * strong link between preferences and this component.
   * @param {HomePane} homePane
   * @param {javax.swing.JScrollPane} planScrollPane
   * @param {HomeController} controller
   * @class
   */
  var RulersVisibilityChangeListener = /** @class */ (function() {
    function RulersVisibilityChangeListener(homePane, planScrollPane, controller) {
      if (this.homePane === undefined)
        this.homePane = null;
      if (this.planScrollPane === undefined)
        this.planScrollPane = null;
      if (this.controller === undefined)
        this.controller = null;
      this.homePane = (homePane);
      this.planScrollPane = (planScrollPane);
      this.controller = (controller);
    }
    RulersVisibilityChangeListener.prototype.propertyChange = function(ev) {
      var homePane = this.homePane;
      var planScrollPane = this.planScrollPane;
      var controller = this.controller;
      if (homePane == null || planScrollPane == null || controller == null) {
        (ev.getSource()).removePropertyChangeListener("RULERS_VISIBLE", this);
      }
      else {
        homePane.setPlanRulersVisible(planScrollPane, controller, ev.getNewValue());
      }
    };
    return RulersVisibilityChangeListener;
  }());
  HomePane.RulersVisibilityChangeListener = RulersVisibilityChangeListener;
  RulersVisibilityChangeListener["__class"] = "com.eteks.sweethome3d.swing.HomePane.RulersVisibilityChangeListener";
  RulersVisibilityChangeListener["__interfaces"] = ["java.util.EventListener", "java.beans.PropertyChangeListener"];
  /**
   * Export to OBJ in a separate class to be able to run HomePane without Java 3D classes.
   * @class
   */
  var OBJExporter = /** @class */ (function() {
    function OBJExporter() {
    }
    OBJExporter.exportHomeToFile = function(home, objFile, header, exportAllToOBJ, object3dFactory) {
      var writer = null;
      var exportInterrupted = false;
      try {
        writer = (function() { var __o = new OBJWriter(objFile, header, -1); __o.__delegate = new OBJWriter(objFile, header, -1); return __o; })();
        var exportedItems = (exportAllToOBJ ? home.getSelectableViewableItems() : home.getSelectedItems().slice(0));
        var furnitureInGroups = ([]);
        for (var it = (function(a) { var i = 0; return { next: function() { return i < a.length ? a[i++] : null; }, hasNext: function() { return i < a.length; } }; })(exportedItems); it.hasNext();) {
          {
            var selectable = it.next();
            if (selectable != null && selectable instanceof HomeFurnitureGroup) {
              it.remove();
              {
                var array148 = (selectable).getAllFurniture();
                for (var index147 = 0; index147 < array148.length; index147++) {
                  var piece = array148[index147];
                  {
                    if (!(piece != null && piece instanceof HomeFurnitureGroup)) {
                      /* add */ (furnitureInGroups.push(piece) > 0);
                    }
                  }
                }
              }
            }
          }
          ;
        }
        /* addAll */ (function(l1, l2) { return l1.push.apply(l1, l2); })(exportedItems, furnitureInGroups);
        var emptySelection = [];
        home.setSelectedItems(emptySelection);
        if (exportAllToOBJ) {
          var homeBounds = OBJExporter.getExportedHomeBounds(home);
          if (homeBounds != null) {
            var groundNode = new Ground3D(home, homeBounds.getX(), homeBounds.getY(), homeBounds.getWidth(), homeBounds.getHeight(), true);
            writer.writeNode(groundNode, "ground");
          }
        }
        else if (home.isAllLevelsSelection()) {
          {
            var array150 = home.getLevels();
            for (var index149 = 0; index149 < array150.length; index149++) {
              var level = array150[index149];
              {
                if (level.isViewable()) {
                  level.setVisible(true);
                }
              }
            }
          }
        }
        var i = 0;
        for (var index151 = 0; index151 < exportedItems.length; index151++) {
          var item = exportedItems[index151];
          {
            var node = object3dFactory.createObject3D(home, item, true);
            if (node != null) {
              if (item != null && item instanceof HomePieceOfFurniture) {
                writer.writeNode(node);
              }
              else {
                writer.writeNode(node, /* getSimpleName */ (function(c) { return c["__class"] ? c["__class"].substring(c["__class"].lastIndexOf('.') + 1) : c["name"].substring(c["name"].lastIndexOf('.') + 1); })(item.constructor).toLowerCase() + "_" + ++i);
              }
            }
          }
        }
      }
      catch (__e) {
        if (__e != null && (__e["__classes"] && __e["__classes"].indexOf("java.io.InterruptedIOException") >= 0)) {
          var ex = __e;
          exportInterrupted = true;
          throw new InterruptedRecorderException("Export to " + objFile + " interrupted");
        }
        if (__e != null && (__e["__classes"] && __e["__classes"].indexOf("java.io.IOException") >= 0)) {
          var ex = __e;
          throw new RecorderException("Couldn\'t export to OBJ in " + objFile, ex);
        }
      }
      finally {
        if (writer != null) {
          try {
            writer.close();
            if (exportInterrupted) {
              new java.io.File(objFile)["delete"]();
            }
          }
          catch (ex) {
            throw new RecorderException("Couldn\'t export to OBJ in " + objFile, ex);
          }
          ;
        }
        ;
      }
      ;
    };
    /**
     * Returns <code>home</code> bounds.
     * @param {Home} home
     * @return {java.awt.geom.Rectangle2D}
     * @private
     */
    OBJExporter.getExportedHomeBounds = function(home) {
      var homeBounds = OBJExporter.updateObjectsBounds(null, home.getWalls());
      {
        var array153 = OBJExporter.getVisibleFurniture(home.getFurniture());
        for (var index152 = 0; index152 < array153.length; index152++) {
          var piece = array153[index152];
          {
            {
              var array155 = piece.getPoints();
              for (var index154 = 0; index154 < array155.length; index154++) {
                var point = array155[index154];
                {
                  if (homeBounds == null) {
                    homeBounds = new java.awt.geom.Rectangle2D.Float(point[0], point[1], 0, 0);
                  }
                  else {
                    homeBounds.add(point[0], point[1]);
                  }
                }
              }
            }
          }
        }
      }
      return OBJExporter.updateObjectsBounds(homeBounds, home.getRooms());
    };
    /**
     * Returns all the visible pieces in the given <code>furniture</code>.
     * @param {HomePieceOfFurniture[]} furniture
     * @return {HomePieceOfFurniture[]}
     * @private
     */
    OBJExporter.getVisibleFurniture = function(furniture) {
      var visibleFurniture = ([]);
      for (var index156 = 0; index156 < furniture.length; index156++) {
        var piece = furniture[index156];
        {
          if (piece.isVisible() && (piece.getLevel() == null || piece.getLevel().isViewable())) {
            if (piece != null && piece instanceof HomeFurnitureGroup) {
              /* addAll */ (function(l1, l2) { return l1.push.apply(l1, l2); })(visibleFurniture, OBJExporter.getVisibleFurniture((piece).getFurniture()));
            }
            else {
              /* add */ (visibleFurniture.push(piece) > 0);
            }
          }
        }
      }
      return visibleFurniture;
    };
    /**
     * Updates <code>objectBounds</code> to include the bounds of <code>items</code>.
     * @param {java.awt.geom.Rectangle2D} objectBounds
     * @param {Bound[]} items
     * @return {java.awt.geom.Rectangle2D}
     * @private
     */
    OBJExporter.updateObjectsBounds = function(objectBounds, items) {
      for (var index157 = 0; index157 < items.length; index157++) {
        var item = items[index157];
        {
          if (!(item != null && (item["__interfaces"] != null && item["__interfaces"].indexOf("com.eteks.sweethome3d.model.Elevatable") >= 0 || item.constructor != null && item.constructor["__interfaces"] != null && item.constructor["__interfaces"].indexOf("com.eteks.sweethome3d.model.Elevatable") >= 0)) || (item).getLevel() == null || (item).getLevel().isViewableAndVisible()) {
            {
              var array159 = item.getPoints();
              for (var index158 = 0; index158 < array159.length; index158++) {
                var point = array159[index158];
                {
                  if (objectBounds == null) {
                    objectBounds = new java.awt.geom.Rectangle2D.Float(point[0], point[1], 0, 0);
                  }
                  else {
                    objectBounds.add(point[0], point[1]);
                  }
                }
              }
            }
          }
        }
      }
      return objectBounds;
    };
    return OBJExporter;
  }());
  HomePane.OBJExporter = OBJExporter;
  OBJExporter["__class"] = "com.eteks.sweethome3d.swing.HomePane.OBJExporter";
  /**
   * A Swing action adapter to a plug-in action.
   * @class
   */
  var ActionAdapter = /** @class */ (function() {
    function ActionAdapter(__parent, pluginAction) {
      this.__parent = __parent;
      if (this.pluginAction === undefined)
        this.pluginAction = null;
      if (this.propertyChangeSupport === undefined)
        this.propertyChangeSupport = null;
      this.pluginAction = pluginAction;
      this.propertyChangeSupport = new javax.swing.event.SwingPropertyChangeSupport(this);
      this.pluginAction.addPropertyChangeListener(new ActionAdapter.ActionAdapter$0(this));
    }
    ActionAdapter.prototype.actionPerformed = function(ev) {
      this.pluginAction.execute();
    };
    ActionAdapter.prototype.addPropertyChangeListener = function(listener) {
      this.propertyChangeSupport.addPropertyChangeListener(listener);
    };
    ActionAdapter.prototype.removePropertyChangeListener = function(listener) {
      this.propertyChangeSupport.removePropertyChangeListener(listener);
    };
    ActionAdapter.prototype.getValue = function(key) {
      if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
        return o1.equals(o2);
      }
      else {
        return o1 === o2;
      } })(ResourceAction.NAME, key)) {
        return this.pluginAction.getPropertyValue("NAME");
      }
      else if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
        return o1.equals(o2);
      }
      else {
        return o1 === o2;
      } })(ResourceAction.SHORT_DESCRIPTION, key)) {
        return this.pluginAction.getPropertyValue("SHORT_DESCRIPTION");
      }
      else if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
        return o1.equals(o2);
      }
      else {
        return o1 === o2;
      } })(ResourceAction.SMALL_ICON, key)) {
        var smallIcon = this.pluginAction.getPropertyValue("SMALL_ICON");
        return smallIcon != null ? IconManager.getInstance().getIcon(smallIcon, HomePane.DEFAULT_SMALL_ICON_HEIGHT, this.__parent) : null;
      }
      else if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
        return o1.equals(o2);
      }
      else {
        return o1 === o2;
      } })(ResourceAction.MNEMONIC_KEY, key)) {
        var mnemonic = this.pluginAction.getPropertyValue("MNEMONIC");
        return (function(c) { return c.charCodeAt == null ? c : c.charCodeAt(0); })(mnemonic) != null ? new Number(mnemonic.charCodeAt(0)).valueOf() : null;
      }
      else if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
        return o1.equals(o2);
      }
      else {
        return o1 === o2;
      } })(/* name */ "TOOL_BAR", key)) {
        return this.pluginAction.getPropertyValue("TOOL_BAR");
      }
      else if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
        return o1.equals(o2);
      }
      else {
        return o1 === o2;
      } })(/* name */ "MENU", key)) {
        return this.pluginAction.getPropertyValue("MENU");
      }
      else {
        return null;
      }
    };
    ActionAdapter.prototype.putValue = function(key, value) {
      if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
        return o1.equals(o2);
      }
      else {
        return o1 === o2;
      } })(ResourceAction.NAME, key)) {
        this.pluginAction.putPropertyValue("NAME", value);
      }
      else if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
        return o1.equals(o2);
      }
      else {
        return o1 === o2;
      } })(ResourceAction.SHORT_DESCRIPTION, key)) {
        this.pluginAction.putPropertyValue("SHORT_DESCRIPTION", value);
      }
      else if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
        return o1.equals(o2);
      }
      else {
        return o1 === o2;
      } })(ResourceAction.SMALL_ICON, key)) {
      }
      else if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
        return o1.equals(o2);
      }
      else {
        return o1 === o2;
      } })(ResourceAction.MNEMONIC_KEY, key)) {
        this.pluginAction.putPropertyValue("MNEMONIC", new String(String.fromCharCode(/* intValue */ (value | 0))));
      }
      else if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
        return o1.equals(o2);
      }
      else {
        return o1 === o2;
      } })(/* name */ "TOOL_BAR", key)) {
        this.pluginAction.putPropertyValue("TOOL_BAR", value);
      }
      else if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
        return o1.equals(o2);
      }
      else {
        return o1 === o2;
      } })(/* name */ "MENU", key)) {
        this.pluginAction.putPropertyValue("MENU", value);
      }
    };
    ActionAdapter.prototype.isEnabled = function() {
      return this.pluginAction.isEnabled();
    };
    ActionAdapter.prototype.setEnabled = function(enabled) {
      this.pluginAction.setEnabled(enabled);
    };
    return ActionAdapter;
  }());
  HomePane.ActionAdapter = ActionAdapter;
  ActionAdapter["__class"] = "com.eteks.sweethome3d.swing.HomePane.ActionAdapter";
  ActionAdapter["__interfaces"] = ["java.util.EventListener", "java.awt.event.ActionListener", "javax.swing.Action"];
  (function(ActionAdapter) {
    var ActionAdapter$0 = /** @class */ (function() {
      function ActionAdapter$0(__parent) {
        this.__parent = __parent;
      }
      ActionAdapter$0.prototype.propertyChange = function(ev) {
        var propertyName = ev.getPropertyName();
        var oldValue = ev.getOldValue();
        var newValue = ev.getNewValue();
        if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
          return o1.equals(o2);
        }
        else {
          return o1 === o2;
        } })(/* name */ "ENABLED", propertyName)) {
          this.__parent.propertyChangeSupport.firePropertyChange(new PropertyChangeEvent(ev.getSource(), "enabled", oldValue, newValue));
        }
        else {
          if (newValue != null) {
            if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
              return o1.equals(o2);
            }
            else {
              return o1 === o2;
            } })(/* name */ "NAME", propertyName)) {
              this.__parent.propertyChangeSupport.firePropertyChange(new PropertyChangeEvent(ev.getSource(), ResourceAction.NAME, oldValue, newValue));
            }
            else if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
              return o1.equals(o2);
            }
            else {
              return o1 === o2;
            } })(/* name */ "SHORT_DESCRIPTION", propertyName)) {
              this.__parent.propertyChangeSupport.firePropertyChange(new PropertyChangeEvent(ev.getSource(), ResourceAction.SHORT_DESCRIPTION, oldValue, newValue));
            }
            else if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
              return o1.equals(o2);
            }
            else {
              return o1 === o2;
            } })(/* name */ "MNEMONIC", propertyName)) {
              this.__parent.propertyChangeSupport.firePropertyChange(new PropertyChangeEvent(ev.getSource(), ResourceAction.MNEMONIC_KEY, oldValue != null ? new Number(oldValue.charCodeAt(0)).valueOf() : null, newValue));
            }
            else if ( /* equals */(function(o1, o2) { if (o1 && o1.equals) {
              return o1.equals(o2);
            }
            else {
              return o1 === o2;
            } })(/* name */ "SMALL_ICON", propertyName)) {
              this.__parent.propertyChangeSupport.firePropertyChange(new PropertyChangeEvent(ev.getSource(), ResourceAction.SMALL_ICON, oldValue != null ? IconManager.getInstance().getIcon(oldValue, HomePane.DEFAULT_SMALL_ICON_HEIGHT, this.__parent.__parent) : null, newValue));
            }
            else {
              this.__parent.propertyChangeSupport.firePropertyChange(new PropertyChangeEvent(ev.getSource(), propertyName, oldValue, newValue));
            }
          }
        }
      };
      return ActionAdapter$0;
    }());
    ActionAdapter.ActionAdapter$0 = ActionAdapter$0;
    ActionAdapter$0["__interfaces"] = ["java.util.EventListener", "java.beans.PropertyChangeListener"];
  })(ActionAdapter = HomePane.ActionAdapter || (HomePane.ActionAdapter = {}));
  /**
   * A popup listener that stores the location of the mouse.
   * @param {javax.swing.JComponent} component
   * @class
   */
  var PopupMenuListenerWithMouseLocation = /** @class */ (function() {
    function PopupMenuListenerWithMouseLocation(component) {
      if (this.mouseLocation === undefined)
        this.mouseLocation = null;
      if (this.lastMouseMoveLocation === undefined)
        this.lastMouseMoveLocation = null;
      component.addMouseMotionListener(new PopupMenuListenerWithMouseLocation.PopupMenuListenerWithMouseLocation$0(this));
      component.addMouseListener(new PopupMenuListenerWithMouseLocation.PopupMenuListenerWithMouseLocation$1(this));
    }
    PopupMenuListenerWithMouseLocation.prototype.getMouseLocation = function() {
      return this.mouseLocation;
    };
    PopupMenuListenerWithMouseLocation.prototype.popupMenuWillBecomeVisible = function(ev) {
      this.mouseLocation = this.lastMouseMoveLocation;
    };
    return PopupMenuListenerWithMouseLocation;
  }());
  HomePane.PopupMenuListenerWithMouseLocation = PopupMenuListenerWithMouseLocation;
  PopupMenuListenerWithMouseLocation["__class"] = "com.eteks.sweethome3d.swing.HomePane.PopupMenuListenerWithMouseLocation";
  PopupMenuListenerWithMouseLocation["__interfaces"] = ["java.util.EventListener", "javax.swing.event.PopupMenuListener"];
  (function(PopupMenuListenerWithMouseLocation) {
    var PopupMenuListenerWithMouseLocation$0 = /** @class */ (function() {
      function PopupMenuListenerWithMouseLocation$0(__parent) {
        this.__parent = __parent;
      }
      /**
       *
       * @param {java.awt.event.MouseEvent} ev
       */
      PopupMenuListenerWithMouseLocation$0.prototype.mouseMoved = function(ev) {
        this.__parent.lastMouseMoveLocation = ev.getPoint();
      };
      return PopupMenuListenerWithMouseLocation$0;
    }());
    PopupMenuListenerWithMouseLocation.PopupMenuListenerWithMouseLocation$0 = PopupMenuListenerWithMouseLocation$0;
    PopupMenuListenerWithMouseLocation$0["__interfaces"] = ["java.util.EventListener", "java.awt.event.MouseMotionListener"];
    var PopupMenuListenerWithMouseLocation$1 = /** @class */ (function() {
      function PopupMenuListenerWithMouseLocation$1(__parent) {
        this.__parent = __parent;
      }
      /**
       *
       * @param {java.awt.event.MouseEvent} ev
       */
      PopupMenuListenerWithMouseLocation$1.prototype.mouseExited = function(ev) {
        this.__parent.lastMouseMoveLocation = null;
      };
      /**
       *
       * @param {java.awt.event.MouseEvent} ev
       */
      PopupMenuListenerWithMouseLocation$1.prototype.mouseEntered = function(ev) {
        this.__parent.lastMouseMoveLocation = ev.getPoint();
      };
      return PopupMenuListenerWithMouseLocation$1;
    }());
    PopupMenuListenerWithMouseLocation.PopupMenuListenerWithMouseLocation$1 = PopupMenuListenerWithMouseLocation$1;
    PopupMenuListenerWithMouseLocation$1["__interfaces"] = ["java.util.EventListener", "java.awt.event.MouseMotionListener", "java.awt.event.MouseWheelListener", "java.awt.event.MouseListener"];
  })(PopupMenuListenerWithMouseLocation = HomePane.PopupMenuListenerWithMouseLocation || (HomePane.PopupMenuListenerWithMouseLocation = {}));
  var MouseAndFocusListener = /** @class */ (function() {
    function MouseAndFocusListener(__parent) {
      this.__parent = __parent;
    }
    /**
     *
     * @param {java.awt.event.MouseEvent} ev
     */
    MouseAndFocusListener.prototype.mousePressed = function(ev) {
      if (javax.swing.SwingUtilities.isLeftMouseButton(ev)) {
        this.setMenusEnabled(menuBar, false);
      }
    };
    /**
     *
     * @param {java.awt.event.MouseEvent} ev
     */
    MouseAndFocusListener.prototype.mouseReleased = function(ev) {
      if (javax.swing.SwingUtilities.isLeftMouseButton(ev)) {
        this.setMenusEnabled(menuBar, true);
      }
    };
    MouseAndFocusListener.prototype.focusGained = function(ev) {
      this.setMenusEnabled(menuBar, true);
    };
    MouseAndFocusListener.prototype.focusLost = function(ev) {
      this.setMenusEnabled(menuBar, true);
    };
    /**
     * Enables or disables the menu items of the given menu bar.
     * @param {javax.swing.JMenuBar} menuBar
     * @param {boolean} enabled
     * @private
     */
    MouseAndFocusListener.prototype.setMenusEnabled = function(menuBar, enabled) {
      var _this = this;
      java.awt.EventQueue.invokeLater(function() {
        for (var i = 0, n = menuBar.getMenuCount(); i < n; i++) {
          {
            _this.setMenuItemsEnabled(menuBar.getMenu(i), enabled);
          }
          ;
        }
      });
    };
    /**
     * Enables or disables the menu items of the given <code>menu</code>.
     * @param {javax.swing.JMenu} menu
     * @param {boolean} enabled
     * @private
     */
    MouseAndFocusListener.prototype.setMenuItemsEnabled = function(menu, enabled) {
      for (var i = 0, n = menu.getItemCount(); i < n; i++) {
        {
          var item = menu.getItem(i);
          if (item != null && item instanceof javax.swing.JMenu) {
            this.setMenuItemsEnabled(item, enabled);
          }
          else if (item != null) {
            item.setEnabled(enabled ? item.getAction().isEnabled() : false);
          }
        }
        ;
      }
    };
    return MouseAndFocusListener;
  }());
  HomePane.MouseAndFocusListener = MouseAndFocusListener;
  MouseAndFocusListener["__class"] = "MouseAndFocusListener";
  MouseAndFocusListener["__interfaces"] = ["java.util.EventListener", "java.awt.event.FocusListener", "java.awt.event.MouseMotionListener", "java.awt.event.MouseWheelListener", "java.awt.event.MouseListener"];
})(HomePane || (HomePane = {}));
var __Function = Function;
