/*
 * dialog.js
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

// Requires UserPreferences.js

/**
 * The root class for component views.
 *
 * @param {UserPreferences} preferences the current user preferences
 * @param {string} templateSelector a CSS selector to find the view template 
 * in the page (if null or undefined, then the component creates an empty div 
 * for the root node)
 * @param {{initializer: function, getter: function, setter: function}} [behavior]
 * - initializer: an optional initialization function
 * - getter: an optional function that returns the value of the component 
 *   (typically for inputs)
 * - setter: an optional function that sets the value of the component 
 *   (typically for inputs)
 * @constructor
 * @author Renaud Pawlak
 */
function JSComponentView(preferences, templateSelector, behavior) {
  this.preferences = preferences;
  var html = '';
  if (templateSelector != null) {
    var html = document.querySelector(templateSelector).innerHTML;
    if (html == null) {
      throw new Error('Cannot find HTML DOM for dialog: ' + templateSelector);
    }
  }
  this.rootNode = document.createElement('div');
  this.rootNode.innerHTML = this.buildHtmlFromTemplate(html);
  if (behavior != null) {
    this.initializer = behavior.initializer;
    this.getter = behavior.getter;
    this.setter = behavior.setter;
  }
  this.initialize();
}
JSComponentView.prototype = Object.create(JSComponentView.prototype);
JSComponentView.prototype.constructor = JSComponentView;

/**
 * Substitutes all the place holders in the html with localized labels.
 */
JSComponentView.substituteWithLocale = function(preferences, html) {
  return html.replace(/\$\{([a-zA-Z0-9_.]+)\}/g, function(fullMatch, str) {
    var replacement = ResourceAction.getLocalizedLabelText(preferences, str.substring(0, str.indexOf('.')), str.substring(str.indexOf('.') + 1));
    return replacement || all;
  });
}

JSComponentView.prototype.buildHtmlFromTemplate = function(templateHtml) {
  return JSComponentView.substituteWithLocale(this.preferences, templateHtml);
}

/**
 * Gets the root node of this component.
 */
JSComponentView.prototype.getRootNode = function() {
  return this.rootNode;
}

/**
 * Gets the named element that corresponds to the given name within this component.
 * A named element shall define the 'name' attribute (for instance an input), or 
 * a 'data-name' attribute if the name attribue is not supported.
 */
JSComponentView.prototype.getElement = function(name) {
  var element = this.rootNode.querySelector('[name="' + name + '"]');
  if (element == null) {
    element = this.rootNode.querySelector('[data-name="' + name + '"]');
  }
  return element;
}

/**
 * Called when initializing the component. Override to perform custom initializations.
 */
JSComponentView.prototype.initialize = function() {
  if (this.initializer != null) {
    this.initializer(this);
  }
}

/**
 * Gets the value of this component if available.
 */
JSComponentView.prototype.get = function() {
  if (this.getter != null) {
    return this.getter(this);
  }
}

/**
 * Sets the value of this component if applicable.
 */
JSComponentView.prototype.set = function(value) {
  if (this.setter != null) {
    this.setter(this, value);
  }
}

/**
 * A class to create dialogs.
 *
 * @param preferences      the current user preferences
 * @param templateSelector a CSS selector to find the view template in the page 
 *                         (if null or undefined, then the dialog creates an 
 *                         empty div for the root node)
 * @param {{initializer: function, applier: function}} [behavior]
 * - initializer: an optional initialization function
 * - applier: an optional dialog application function
 * @constructor
 * @author Renaud Pawlak
 */
function JSDialogView(preferences, templateSelector, behavior) {
  JSComponentView.call(this, preferences, templateSelector, behavior);
  this.rootNode.classList.add('dialog-container');
  this.rootNode.style.display = 'none';
  document.body.append(this.rootNode);
  var dialog = this;
  this.getCloseButton().addEventListener('click', function() {
    dialog.cancel();
  });
  this.getCancelButton().addEventListener('click', function() {
    dialog.cancel();
  });
  this.getOKButton().addEventListener('click', function() {
    dialog.validate();
  });
  if (behavior != null) {
    this.applier = behavior.applier;
  }
}
JSDialogView.prototype = Object.create(JSComponentView.prototype);
JSDialogView.prototype.constructor = JSDialogView;

JSDialogView.prototype.buildHtmlFromTemplate = function(templateHtml) {
  return '<div class="dialog-content"><span class="dialog-close-button">&times;</span>'
    + JSComponentView.prototype.buildHtmlFromTemplate.call(this, templateHtml)
    + '<p><hr><button class="dialog-ok-button">OK</button><button class="dialog-cancel-button">CANCEL</button></p>'
    + '</div>';
}

/**
 * Gets the input that corresponds to the given name within this dialog.
 */
JSDialogView.prototype.getInput = function(name) {
  return this.rootNode.querySelector('[name="' + name + '"]');
}

/**
 * Gets the OK button of this dialog.
 */
JSDialogView.prototype.getOKButton = function() {
  return this.rootNode.querySelector('.dialog-ok-button');
}

/**
 * Gets the cancel button of this dialog.
 */
JSDialogView.prototype.getCancelButton = function() {
  return this.rootNode.querySelector('.dialog-cancel-button');
}

/**
 * Gets the close button of this dialog.
 */
JSDialogView.prototype.getCloseButton = function() {
  return this.rootNode.querySelector('.dialog-close-button');
}

/**
 * Called when initializing the dialog. Override to perform custom initializations.
 */
JSDialogView.prototype.initialize = function() {
  if (this.initializer != null) {
    this.initializer(this);
  }
}

/**
 * Called when the user presses the OK button. 
 * Override to implement custom behavior when the dialog is validated by the user.
 */
JSDialogView.prototype.validate = function() {
  if (this.applier != null) {
    this.applier(this);
  }
  this.close();
}

/**
 * Called when the user closes the dialog with no validation.
 */
JSDialogView.prototype.cancel = function() {
  this.close();
}

/**
 * Closes the dialog and discard the associated DOM.
 */
JSDialogView.prototype.close = function() {
  this.rootNode.style.display = 'none';
  document.body.removeChild(this.rootNode);
}

/**
 * Default implementation of the DialogView.displayView function.
 */
JSDialogView.prototype.displayView = function(parentView) {
  this.rootNode.style.display = 'block';
}


/**
 * A component to select a color.
 * @constructor
 */
function JSColorSelector(preferences, targetNode) {
  JSComponentView.call(this, preferences, null, {
    initializer: function(component) {
      component.getRootNode().innerHTML = '<input type="color" name="color">';
    },
    getter: function(component) {
      return ColorTools.hexadecimalStringToInteger(component.getElement('color').value);
    },
    setter: function(component, color) {
      component.getElement('color').value = color != null && color != 0
        ? ColorTools.integerToHexadecimalString(color)
        : "#010101"; // Color different from black required on some browsers
    }
  });
  if (targetNode != null) {
    targetNode.appendChild(this.getRootNode());
  }
}

JSColorSelector.prototype = Object.create(JSComponentView.prototype);
JSColorSelector.prototype.constructor = JSColorSelector;

