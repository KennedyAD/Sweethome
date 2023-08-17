/*
 * ResourceAction.js
 *
 * Sweet Home 3D, Copyright (c) 2020-2022 Emmanuel PUYBARET / eTeks <info@eteks.com>
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

// Requires graphics2d.js
// Requires UserPreferences.js
// Requires URLContent.js

/**
 * Creates an action with properties retrieved from a resource bundle
 * in which key starts with <code>actionPrefix</code>.
 * @param {UserPreferences} preferences   user preferences used to retrieve localized description of the action
 * @param {Object} resourceClass the class used as a context to retrieve localized properties of the action
 * @param {string} actionPrefix  prefix used in resource bundle to search action properties
 * @param {boolean} [enabled] <code>true</code> if the action should be enabled at creation
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
  };
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
 * @param {string} resourceKey
 * @param {Array} resourceParameters
 * @return {string}
 * @private
 */
ResourceAction.getLocalizedLabelText = function(preferences, resourceClass, resourceKey, resourceParameters) {
  var localizedString = preferences.getLocalizedString(resourceClass, resourceKey, resourceParameters);
  var language = Locale.getDefault();
  if (/* OperatingSystem.isMacOSX() 
      && */ (language.indexOf("zh") == 0 // CHINESE
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
 * Returns the URL of the given key for a key matching a URL like an icon.
 * @param {string} propertyKey
 */
ResourceAction.prototype.getURL = function(propertyKey) {
  var url = this.getValue(propertyKey);
  if (url != null && url.indexOf("://") === -1) {
    url = ZIPTools.getScriptFolder() + url;
  }
  return url;
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
