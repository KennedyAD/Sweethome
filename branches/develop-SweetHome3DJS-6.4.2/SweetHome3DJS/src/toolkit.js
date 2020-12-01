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

/*****************************************/
/* JSComponentView                       */
/*****************************************/
 
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
 * Returns true if element is or is child of candidateParent, false otherwise.
 * 
 * @param {HTMLElement} element 
 * @param {HTMLElement} candidateParent 
 * @return {boolean}
 */
JSComponentView.isElementContained = function(element, candidateParent) {
  if (element == null || candidateParent == null) {
    return false;
  }

  var currentParent = element;
  do {
    if (currentParent == candidateParent) {
      return true;
    }
  } while (currentParent = currentParent.parentElement);

  return false;
};

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
 * Attaches the given component to a child DOM element, becoming a child component.
 * 
 * @param {string} name the component's name, which matches child DOM element name (as defined in {@link JSComponentView#getElement})
 * @param {JSComponentView} component child component instance
 */
JSComponentView.prototype.attachChildComponent = function(name, component) {
  this.getElement(name).appendChild(component.getRootNode());
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
  if (elements instanceof NodeList) {
    elements = Array.from(elements); 
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

/*****************************************/
/* JSDialogView                          */
/*****************************************/

/**
 * A class to create dialogs.
 *
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
  this.rootNode._dialogInstance = this;

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

/**
 * close currently displayed topmost dialog if any
 * @static
 */
JSDialogView.closeTopMostDialogIfAny = function() {
  var visibleDialogElements = document.querySelectorAll('.dialog-container.visible');
  if (visibleDialogElements.length > 0) {
    /** @type JSDialogView */
    var topMostDialog = undefined;
    for (var i = 0; i < visibleDialogElements.length; i++) {
      var visibleDialog = visibleDialogElements[i]._dialogInstance;
      if (topMostDialog == null || topMostDialog.displayIndex <= visibleDialog.displayIndex) {
        topMostDialog = visibleDialog;
      }
    }

    topMostDialog.close();
  }
}

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
  this.rootNode.classList.remove('visible');
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
  var dialog = this;

  this.getRootNode().style.display = 'block';
  
  // force browser to refresh before adding visible class to allow transition on width and height
  setTimeout(function() {
    dialog.rootNode.classList.add('visible');
    dialog.displayIndex = JSDialogView.shownDialogsCounter++;
  }, 100);
}
JSDialogView.shownDialogsCounter = 0;

/*****************************************/
/* JSContextMenu                         */
/*****************************************/

/**
 * A class to create a context menu.
 *
 * @param {JSViewFactory} viewFactory the view factory
 * @param {UserPreferences} preferences the current user preferences
 * @param {HTMLElement|HTMLElement[]} sourceElements context menu will show when right click on this element. Cannot be null for now
 * for the root node)
 * @param {{build: function(JSContextMenu.Builder, HTMLElement)}} behavior
 * > build: called with a builder, and optionnally with source element (which was right clicked, to show this menu)
 * 
 * @constructor
 * 
 * @author Louis Grignon
 * @author Renaud Pawlak
 */
function JSContextMenu(preferences, sourceElements, behavior) {
  if (sourceElements == null || sourceElements.length === 0) {
    throw new Error('cannot register a context menu on an empty list of elements');
  }
  this.sourceElements = sourceElements;
  if (!Array.isArray(sourceElements)) {
    this.sourceElements = [sourceElements];
  }

  this.build = behavior.build;

  JSComponentView.call(this, undefined, preferences, '', behavior);
  this.getRootNode().classList.add('context-menu');

  document.body.append(this.getRootNode());

  var contextMenu = this;
  this.registerEventListener(sourceElements, 'contextmenu', function(event) {
    event.preventDefault();

    if (JSContextMenu.current != null) {
      JSContextMenu.current.close();
    }

    contextMenu.showForSourceElement(this, event);
  });

  if (!JSContextMenu.globalCloserRegistered) {
    document.addEventListener('click', function(event) {
      if (JSContextMenu.current != null 
        && !JSComponentView.isElementContained(event.target, JSContextMenu.current.getRootNode())) {
        // clicked outside menu
        JSContextMenu.closeCurrentIfAny();
      }
    });
    JSContextMenu.globalCloserRegistered = true;
  }
}
JSContextMenu.prototype = Object.create(JSComponentView.prototype);
JSContextMenu.prototype.constructor = JSContextMenu;

/**
 * close currently displayed context menu if any
 * @static
 */
JSContextMenu.closeCurrentIfAny = function() {
  if (JSContextMenu.current != null) {
    console.debug('closing context menu');
    JSContextMenu.current.close();
  }
}

/**
 * @param {HTMLElement} sourceElement
 * @param {Event} event
 * 
 * @private
 */
JSContextMenu.prototype.showForSourceElement = function(sourceElement, event) {
  this.listenerUnregisterCallbacks = [];

  var builder = new JSContextMenu.Builder();
  this.build(builder, sourceElement);
  
  var items = builder.items;
  // Remove last element if it is a separator 
  if (items.length > 0 && items[items.length - 1] == CONTEXT_MENU_SEPARATOR_ITEM) {
    items.pop();
  }
  var menuElement = this.createMenuElement(items);
  
  this.getRootNode().appendChild(menuElement);

  this.getRootNode().style.left = event.clientX + 'px';
  this.getRootNode().style.top = event.clientY + 'px';
  this.getRootNode().classList.add('visible');

  JSContextMenu.current = this;
};

/**
 * @param {{}[]} items same type as JSContextMenu.Builder.items
 * @return {HTMLElement} menu root html element (`<ul>`)
 * @private
 */
JSContextMenu.prototype.createMenuElement = function(items) {

  var menuElement = document.createElement('ul');
  menuElement.classList.add('items');

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    
    var itemElement = document.createElement('li');
    if (item == CONTEXT_MENU_SEPARATOR_ITEM) {
      itemElement.classList.add('separator');
    } else {
      this.initMenuItemElement(itemElement, item);
    }

    menuElement.appendChild(itemElement)
  }
  return menuElement;
};

/**
 * Initializes a menu item element for the given item descriptor (model).
 * 
 * @param {HTMLElement} menuItemElement 
 * @param {{}[]} item an item from JSContextMenu.Builder.items
 * 
 * @private
 */
JSContextMenu.prototype.initMenuItemElement = function(itemElement, item) {
  var contextMenu = this;

  if (item.selected !== undefined) {
    // Toggle action case
    var toggle = document.createElement('input');
    toggle.type = 'radio';
    if (item.selected) {
      toggle.checked = 'checked';
    }
    itemElement.appendChild(toggle);
  }

  var itemIconElement = document.createElement('img');
  if (item.iconPath != null && item.selected === undefined) {
    // Icons are not shown for toggle actions 
    itemIconElement.src = item.iconPath;
    itemIconElement.classList.add('visible');
  }
  
  var itemLabelElement = document.createElement('span');
  itemLabelElement.textContent = JSComponentView.substituteWithLocale(this.preferences, item.label);

  itemElement.classList.add('item');
  itemElement.dataset['uid'] = item.uid;
  itemElement.appendChild(itemIconElement);
  itemElement.appendChild(itemLabelElement);
  if (Array.isArray(item.subItems)) {
    itemElement.classList.add('sub-menu');
    itemElement.appendChild(this.createMenuElement(item.subItems));
  }

  if (typeof item.onItemSelected == 'function') {

    var listener = function() {
      console.debug('context menu item selected - closing context menu', item);
      item.onItemSelected();
      contextMenu.close();
    };
    itemElement.addEventListener('click', listener);
    this.listenerUnregisterCallbacks.push(function() {
      itemElement.removeEventListener('click', listener);
    });
  }
};

/**
 * Closes the context menu.
 */
JSContextMenu.prototype.close = function() {
  this.getRootNode().classList.remove('visible');
  JSContextMenu.current = null;

  for (var i = 0; i < this.listenerUnregisterCallbacks.length; i++) {
    this.listenerUnregisterCallbacks[i]();
  }
  
  this.listenerUnregisterCallbacks = null;
  this.getRootNode().innerHTML = '';
};

/**
 * Builds items of a context menu which is about to be shown. 
 */
JSContextMenu.Builder = function() {
  /** @type {{ uid?: string, label?: string, iconPath?: string, onItemSelected?: function(), subItems?: {}[] }[] } } */
  this.items = [];
}

JSContextMenu.Builder.prototype = Object.create(JSContextMenu.Builder.prototype);
JSContextMenu.Builder.prototype.constructor = JSContextMenu.Builder;

/**
 * Adds an item to this menu using either a ResourceAction, or icon (optional), label & callback.
 * 1) builder.addItem(pane.getAction(MyPane.ActionType.MY_ACTION))
 * 2) builder.addItem('resources/icons/tango/media-skip-forward.png', 'myitem', function() { console.log('my item clicked') })
 * 3) builder.addItem('myitem', function() { console.log('my item clicked') })
 * 
 * @param {ResourceAction|string} actionOrIconPathOrLabel
 * @param {string|function()} [onItemSelectedCallbackOrLabel]
 * @param {function()} [onItemSelectedCallback]
 * 
 * @return {JSContextMenu.Builder}
 * 
 */
JSContextMenu.Builder.prototype.addItem = function(actionOrIconPathOrLabel, onItemSelectedCallbackOrLabel, onItemSelectedCallback) {
  var label = null;
  var iconPath = null;
  var onItemSelected = null;
  // Defined only for a toggle action
  var selected = undefined;
  
  if (actionOrIconPathOrLabel instanceof ResourceAction) {
    var action = actionOrIconPathOrLabel;

    // do no show item if action is disabled    
    if (!action.isEnabled()) {
      return this;
    }
    
    label = action.getValue(ResourceAction.POPUP) || action.getValue(AbstractAction.NAME);

    var libIconPath = action.getValue(AbstractAction.SMALL_ICON);
    if (libIconPath != null) {
      iconPath = 'lib/' + libIconPath;
    }

    if (action.getValue(ResourceAction.TOGGLE_BUTTON_GROUP)) {
      selected = action.getValue(AbstractAction.SELECTED_KEY);
    }

    onItemSelected = function() {
      action.actionPerformed();
    };
  } else if (typeof onItemSelectedCallback == 'function') {
    iconPath = actionOrIconPathOrLabel;
    label = onItemSelectedCallbackOrLabel;
    onItemSelected = onItemSelectedCallback;
  } else {
    label = actionOrIconPathOrLabel;
    onItemSelected = onItemSelectedCallbackOrLabel;
  }

  this.items.push({
    uid: UUID.randomUUID(),
    label: label,
    iconPath: iconPath,
    onItemSelected: onItemSelected,
    selected: selected
  });

  return this;
}

/**
 * Adds a sub menu to this menu, with an optional icon.
 * 1) `builder.addSubMenu('resources/icons/tango/media-skip-forward.png', 'myitem', function(builder) { builder.addItem(...) })`
 * 2) `builder.addSubMenu('myitem', function(builder) { builder.addItem(...) })`
 * 
 * @param {ResourceAction|string} actionOrIconPathOrLabel
 * @param {string|function()} labelOrbuildSubMenuCallback
 * @param {function(JSContextMenu.Builder)} [buildSubMenuCallback]
 * 
 * @return {JSContextMenu.Builder}
 * 
 */
JSContextMenu.Builder.prototype.addSubMenu = function(actionOrIconPathOrLabel, labelOrbuildSubMenuCallback, buildSubMenuCallback) {
  var label = null;
  var iconPath = null;
  
  if (actionOrIconPathOrLabel instanceof ResourceAction) {
    var action = actionOrIconPathOrLabel;

    // do no show item if action is disabled    
    if (!action.isEnabled()) {
      return this;
    }
    
    label = action.getValue(ResourceAction.POPUP) || action.getValue(AbstractAction.NAME);

    var libIconPath = action.getValue(AbstractAction.SMALL_ICON);
    if (libIconPath != null) {
      iconPath = 'lib/' + libIconPath;
    }
    buildSubMenuCallback = labelOrbuildSubMenuCallback;    
  } else if (typeof buildSubMenuCallback == 'function') {
    label = labelOrbuildSubMenuCallback;
    iconPath = actionOrIconPathOrLabel;
  } else {
    label = actionOrIconPathOrLabel;
    buildSubMenuCallback = labelOrbuildSubMenuCallback;    
  }

  var subMenuBuilder = new JSContextMenu.Builder();
  buildSubMenuCallback(subMenuBuilder);
  var subItems = subMenuBuilder.items;
  if (subItems.length > 0) {
    this.items.push({
      uid: UUID.randomUUID(),
      label: label,
      iconPath: iconPath,
      subItems: subItems
    });
  }

  return this;
}

var CONTEXT_MENU_SEPARATOR_ITEM = {};

/**
 * Adds a separator after previous items.
 * Does nothing if there are no items yet or if the latest added item is already a separator.
 *
 * @return {JSContextMenu.Builder}
 */
JSContextMenu.Builder.prototype.addSeparator = function() {
  if (this.items.length > 0 && this.items[this.items.length - 1] != CONTEXT_MENU_SEPARATOR_ITEM) {
    this.items.push(CONTEXT_MENU_SEPARATOR_ITEM);
  }
  return this;
}

document.addEventListener('keyup', function(event) {
  if (event.key == 'Escape' || event.keyCode == 27) {
    JSDialogView.closeTopMostDialogIfAny();
    JSContextMenu.closeCurrentIfAny();
  }
});