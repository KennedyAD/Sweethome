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
 * A class to create dialogs.
 * @constructor
 * @author Renaud Pawlak
 */
function JSDialogView(preferences, htmlProvider, initializer, applier) {
  var dialog = this;
  this.preferences = preferences;
  if (typeof htmlProvider === 'string') {
    // css selector in the current page
    this.html = document.querySelector(htmlProvider).innerHTML;
  }
  if (this.html == null) {
    throw new Error('Cannot find HTML DOM for dialog: ' + htmlProvider);
  }
  this.substituteWithLocale();
  this.rootNode = document.createElement('div');
  this.rootNode.classList.add('dialog-container');
  var html = '<div class="dialog-content"><span class="dialog-close-button">&times;</span>' 
    + this.html 
    + '<p><hr><button class="dialog-ok-button">OK</button><button class="dialog-cancel-button">CANCEL</button></p>'
    + '</div>';
  this.rootNode.innerHTML = html;
  this.rootNode.style.display = 'none';
  document.body.append(this.rootNode);
  if (initializer != null) {
    initializer(this);
  }
  this.getCloseButton().addEventListener('click', function() {
    dialog.cancel();
  });
  this.getCancelButton().addEventListener('click', function() {
    dialog.cancel();
  });
  this.getOKButton().addEventListener('click', function() {
    dialog.validate();
  });
  this.applier = applier;
}
JSDialogView.prototype = Object.create(JSDialogView.prototype);
JSDialogView.prototype.constructor = JSDialogView;

JSDialogView['__class'] = "JSDialogView";
JSDialogView['__interfaces'] = ["com.eteks.sweethome3d.viewcontroller.DialogView"];

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
 * Called when the user presses the OK button.
 */
JSDialogView.prototype.validate = function() {
  if (this.applier != null) {
    this.applier(this);
  }
  this.rootNode.style.display = 'none';
}

/**
 * Called when the user closes the dialog with no validation.
 */
JSDialogView.prototype.cancel = function() {
  this.rootNode.style.display = 'none';
}

/**
 * Substitutes all the place holders in the view with localized labels.
 * @private 
 */
JSDialogView.prototype.substituteWithLocale = function() {
  var dialog = this;
  this.html = this.html.replace(/\$\{([a-zA-Z0-9_.]+)\}/g, function(fullMatch, str) {
    var replacement = ResourceAction.getLocalizedLabelText(dialog.preferences, str.substring(0, str.indexOf('.')), str.substring(str.indexOf('.')+1));
    return replacement || all;
  });    
}

/**
 * Default implementation of the DialogView.displayView function.
 */
JSDialogView.prototype.displayView = function(parentView) {
  this.rootNode.style.display = 'block';
}
