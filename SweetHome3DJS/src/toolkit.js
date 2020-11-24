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
 * @param {JSViewFactory} viewFactory the view factory
 * @param {UserPreferences} preferences the current user preferences
 * @param {string|HTMLElement} template template element (view HTML will be this element's innerHTML) or HTML string (if null or undefined, then the component creates an empty div 
 * for the root node)
 * @param {{initializer: function(JSComponentView), getter: function, setter: function, disposer: function(JSDialogView)}} [behavior]
 * - initializer: an optional initialization function
 * - getter: an optional function that returns the value of the component 
 *   (typically for inputs)
 * - setter: an optional function that sets the value of the component 
 *   (typically for inputs)
 * - disposer: an optional function to release associated resources, listeners, ...
 * @constructor
 * @author Renaud Pawlak
 */
function JSComponentView(viewFactory, preferences, template, behavior) {
  if (!(viewFactory instanceof JSViewFactory)) {
    throw new Error('view factory is missing - viewFactory=' + viewFactory);
  }

  this.viewFactory = viewFactory;

  this.preferences = preferences;
  var html = '';
  if (template != null) {
    html = typeof template == 'string' ? template : template.innerHTML;
  }
  this.rootNode = document.createElement('div');
  this.rootNode.innerHTML = this.buildHtmlFromTemplate(html);
  if (behavior != null) {
    this.initializer = behavior.initializer;
    this.disposer = behavior.disposer;
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
 * Returns the root node of this component.
 */
JSComponentView.prototype.getRootNode = function() {
  return this.rootNode;
}

/**
 * Returns the view factory.
 */
JSComponentView.prototype.getViewFactory = function() {
  return this.viewFactory;
}

/**
 * Registers given listener on given elements(s) and removes them when this component is disposed
 * @param {(HTMLElement[]|HTMLElement)} elements
 * @param {string} eventName
 * @param {function} listener
 */
JSComponentView.prototype.registerEventListener = function(elements, eventName, listener) {
  if (elements == null) {
    return;
  }
  if (!Array.isArray(elements)) {
    elements = [elements];
  }
  if (this.listeners == null) {
    this.listeners = [];
  }
  for (var j = 0; j < elements.length; j++) {
    var element = elements[j];
    element.addEventListener(eventName, listener, true);
  }
  this.listeners.push({ 
    listener: listener, 
    eventName: eventName, 
    elements: elements 
  });
}

/**
 * Releases all listeners registered with {@link JSComponentView#registerEventListener}
 * @private
 */
JSComponentView.prototype.unregisterEventListeners = function() {
  if (Array.isArray(this.listeners)) {
    for (var i = 0; i < this.listeners.length; i++) {
      var registeredEntry = this.listeners[i];
      for (var j = 0; j < registeredEntry.elements.length; j++) {
        var element = registeredEntry.elements[j];
        element.removeEventListener(registeredEntry.eventName, registeredEntry.listener);
      }
    }
  }
}

/**
 * Returns the named element that corresponds to the given name within this component.
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
 * Returns the element that matches the given query selector within this component.
 */
JSComponentView.prototype.findElement = function(query) {
  return this.rootNode.querySelector(query);
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
 * Called when disposing the component, in order to release any resource or listener associated with it. Override to perform custom clean
 * Don't forget to call super method: JSComponentView.prototype.dispose()
 */
JSComponentView.prototype.dispose = function() {
  this.unregisterEventListeners();
  if (typeof this.disposer == 'function') {
    this.disposer(this);
  }
};

/**
 * Returns the value of this component if available.
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
 * @param {JSViewFactory} viewFactory the view factory
 * @param preferences      the current user preferences
 * @param {string} title the dialog's title (may contain HTML)
 * @param {string|HTMLElement} template template element (view HTML will be this element's innerHTML) or HTML string (if null or undefined, then the component creates an empty div 
 * for the root node)
 * @param {{initializer: function(JSDialogView), applier: function(JSDialogView), disposer: function(JSDialogView)}} [behavior]
 * - initializer: an optional initialization function
 * - applier: an optional dialog application function
 * - disposer: an optional dialog function to release associated resources, listeners, ...
 * @constructor
 * @author Renaud Pawlak
 */
function JSDialogView(viewFactory, preferences, title, template, behavior) {
  if (title != null) {
    this.title = JSComponentView.substituteWithLocale(preferences, title || '');
  }
  if (behavior != null) {
    this.applier = behavior.applier;
  }

  JSComponentView.call(this, viewFactory, preferences, template, behavior);
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

}
JSDialogView.prototype = Object.create(JSComponentView.prototype);
JSDialogView.prototype.constructor = JSDialogView;

JSDialogView.prototype.buildHtmlFromTemplate = function(templateHtml) {
  return JSComponentView.substituteWithLocale(this.preferences, '<div class="dialog-content">' +
         (this.title ? '<div class="dialog-title">' + this.title : '') + 
         '    <span class="dialog-close-button">&times;</span>' +
         (this.title ? '  </div>' : '') +
         '  <div class="dialog-body">' +
         JSComponentView.prototype.buildHtmlFromTemplate.call(this, templateHtml) +
         '  </div>' +
         '  <div class="dialog-buttons">' +
         (this.applier 
         ? '      <button class="dialog-ok-button">${OptionPane.okButton.textAndMnemonic}</button><button class="dialog-cancel-button">${OptionPane.cancelButton.textAndMnemonic}</button>' 
         : '      <button class="dialog-cancel-button">${InternalFrameTitlePane.closeButtonAccessibleName}</button>') + 
         '  </div>' +
         '</div>');
}

/**
 * Returns the input that corresponds to the given name within this dialog.
 */
JSDialogView.prototype.getInput = function(name) {
  return this.rootNode.querySelector('[name="' + name + '"]');
}

/**
 * Returns the OK button of this dialog.
 */
JSDialogView.prototype.getOKButton = function() {
  return this.rootNode.querySelector('.dialog-ok-button');
}

/**
 * Returns the cancel button of this dialog.
 */
JSDialogView.prototype.getCancelButton = function() {
  return this.rootNode.querySelector('.dialog-cancel-button');
}

/**
 * Returns the close button of this dialog.
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
  this.dispose();
  document.body.removeChild(this.rootNode);
}

/**
 * Called when disposing the component, in order to release any resource or listener associated with it. Override to perform custom clean - don't forget to call super.dispose().
 */
JSDialogView.prototype.dispose = function() {
  JSComponentView.prototype.dispose.call(this);
};

/**
 * Default implementation of the DialogView.displayView function.
 */
JSDialogView.prototype.displayView = function(parentView) {
  this.rootNode.style.display = 'block';
}