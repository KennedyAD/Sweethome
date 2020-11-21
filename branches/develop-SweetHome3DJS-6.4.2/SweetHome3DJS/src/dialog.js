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

// ********************************
// COLOR
// ********************************

/**
 * A component to select a color.
 * 
 * @param {JSViewFactory} viewFactory the view factory
 * @param {UserPreferences} preferences user preferences
 * @param {HTMLElement} targetNode target node on which attach this component 
 * 
 * @constructor
 */
function JSColorSelector(viewFactory, preferences, targetNode) {
  var html = 
    '<div class="picker"></div>' +
    '<hr />' +
    '<div class="custom-color-editor">' +
    '  <input type="text" value="000000" />' +
    '  <div class="overview"></div>' +
    '  <button>➕</button>' +
    '</div>' +
    '<div class="custom-colors"></div>';

  JSComponentView.call(this, viewFactory, preferences, html, {
    initializer: function(component) {
      component.getRootNode().classList.add('color-selector');
      component.pickerElement = component.getRootNode().querySelector('.picker');
      component.customColorsContainerElement = component.getRootNode().querySelector('.custom-colors');
      component.customColorEditorInput = component.getRootNode().querySelector('.custom-color-editor input');
      component.customColorEditorOverview = component.getRootNode().querySelector('.custom-color-editor .overview');
      component.customColorEditorAddButton = component.getRootNode().querySelector('.custom-color-editor button');

      component.createPickerColorTiles();
      component.initCustomColorEditor();
    },
    getter: function(component) {
      return component.selectedColor;
    },
    setter: function(component, color) {
      if (color == null) {
        return;
      }
      var matchingTile = component.getRootNode().querySelector('[data-color="' + color + '"]');
      if (matchingTile == null) {
        component.addAndSelectCustomColorTile(ColorTools.integerToHexadecimalString(color));
      } else {
        component.onColorTileClicked(matchingTile);
      }
    }
  });
  if (targetNode != null) {
    targetNode.appendChild(this.getRootNode());
  }
}

/** string[] recently created custom colors, hexadecimal format */
JSColorSelector.customColors = [];
JSColorSelector.prototype = Object.create(JSComponentView.prototype);
JSColorSelector.prototype.constructor = JSColorSelector;

/**
 * @private
 */
JSColorSelector.prototype.createPickerColorTiles = function() {
  var colors = ['#000000','#434343','#666666','#999999','#b7b7b7','#cccccc','#d9d9d9','#efefef','#f3f3f3','#ffffff','#980000','#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#0000ff','#9900ff','#ff00ff','#e6b8af','#f4cccc','#fce5cd','#fff2cc','#d9ead3','#d0e0e3','#c9daf8','#cfe2f3','#d9d2e9','#ead1dc','#dd7e6b','#ea9999','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#a4c2f4','#9fc5e8','#b4a7d6','#d5a6bd','#cc4125','#e06666','#f6b26b','#ffd966','#93c47d','#76a5af','#6d9eeb','#6fa8dc','#8e7cc3','#c27ba0','#a61c00','#cc0000','#e69138','#f1c232','#6aa84f','#45818e','#3c78d8','#3d85c6','#674ea7','#a64d79','#85200c','#990000','#b45f06','#bf9000','#38761d','#134f5c','#1155cc','#0b5394','#351c75','#741b47','#5b0f00','#660000','#783f04','#7f6000','#274e13','#0c343d','#1c4587','#073763','#20124d','#4c1130'];
  
  this.colorTileElements = [];
  for (var i = 0; i < colors.length; i++) {
    var colorHex = colors[i];
    var tileElement = this.createColorTile(colorHex);
    this.pickerElement.appendChild(tileElement);
  }
  for (var i = 0; i < JSColorSelector.customColors.length; i++) {
    var colorHex = JSColorSelector.customColors[i];
    var tileElement = this.createColorTile(colorHex);
    this.customColorsContainerElement.appendChild(tileElement);
  }
  
  var colorSelector = this;
  this.registerEventListener(
    this.colorTileElements, 
    'click',
    function() { colorSelector.onColorTileClicked(this); });
};

JSColorSelector.prototype.initCustomColorEditor = function() {
  var colorSelector = this;
  var changeColorEvent = 'keyup';
  this.registerEventListener(this.customColorEditorInput, changeColorEvent, function() {
    var colorHex = '#' + colorSelector.customColorEditorInput.value;
    if (colorHex.match(/#[0-9a-fA-F]{3,6}/)) {
      colorSelector.customColorEditorOverview.style.backgroundColor = colorHex;
      colorSelector.customColorEditorAddButton.disabled = false;
    } else {
      colorSelector.customColorEditorAddButton.disabled = true;
    }
  });
  this.registerEventListener(this.customColorEditorAddButton, 'click', function() {
    var colorHex = '#' + colorSelector.customColorEditorInput.value;
    colorSelector.addAndSelectCustomColorTile(colorHex);

    colorSelector.customColorEditorInput.value = 'FFFFFF';
    colorSelector.customColorEditorInput.dispatchEvent(new Event(changeColorEvent));
  });
};
  
/**
 * @param {HTMLElement} tileElement
 * @private
 */
JSColorSelector.prototype.onColorTileClicked = function(tileElement) {
  for (var i = 0; i < this.colorTileElements.length; i++) {
    var currentTileElement = this.colorTileElements[i];
    if (currentTileElement == tileElement) {
      currentTileElement.classList.add('selected');
    } else {
      currentTileElement.classList.remove('selected');
    }
  }
  this.selectedColor = this.getTileColor(tileElement);
};

/**
 * Returns color as RGB number from tile element
 * @param {HTMLElement} tileElement
 * @return color as RGB number
 * @private
 */
JSColorSelector.prototype.getTileColor = function(tileElement) {
  return parseInt(tileElement.dataset['color']);
};

/**
 * Creates a color tile element from hexadecimal color
 * @param {string} colorHex hexadecimal color
 * @return {HTMLElement} tile element
 * @private
 */
JSColorSelector.prototype.createColorTile = function(colorHex) {
  var tileElement = document.createElement('div');
  tileElement.dataset['color'] = ColorTools.hexadecimalStringToInteger(colorHex);
  tileElement.style.backgroundColor = colorHex;
  this.colorTileElements.push(tileElement);
  return tileElement;
};

/**
 * Creates, add and select a new custom color tile for given hexadecimal color
 * @param {string} colorHex hexadecimal color
 * @return {HTMLElement} tile element
 * @private
 */
JSColorSelector.prototype.addAndSelectCustomColorTile = function(colorHex) {
  var colorSelector = this;

  var tileElement = this.createColorTile(colorHex);
  this.customColorsContainerElement.appendChild(tileElement);

  if (JSColorSelector.customColors.indexOf(colorHex) === -1) {
    JSColorSelector.customColors.push(colorHex);
  }

  this.registerEventListener(tileElement, 'click', function() { 
    colorSelector.onColorTileClicked(this); 
  });
  this.onColorTileClicked(tileElement);

  return tileElement;
};

JSColorSelector.prototype.dispose = function() {
  JSComponentView.prototype.dispose.call(this);
};

/**
 * The color selector dialog class.
 *
 * @param {JSViewFactory} viewFactory the view factory
 * @param preferences      the current user preferences
 * @param {{selectedColor: number, applier: function(JSDialogView)}} [options]
 * > selectedColor: selected color as RGB int
 * > applier: apply color change, color as a RGB int
 * @constructor
 */
function JSColorSelectorDialog(viewFactory, preferences, options) {
  var applier = function() {};
  if (typeof options == 'object' && typeof options.applier == 'function') {
    applier = options.applier;
  }

  var html = 
    '<div>' + 
    '  <div data-name="color-selector"></div>' + 
    '</div>'
  JSDialogView.call(this, viewFactory, preferences, '${HomeFurniturePanel.colorDialog.title}', html, {
    initializer: function(dialog) {
      dialog.getRootNode().classList.add('color-selector-dialog');

      // TODO get through viewFactory
      dialog.colorSelector = new JSColorSelector(viewFactory, preferences, dialog.getElement('color-selector'));
      if (options.selectedColor != null) { 
        dialog.colorSelector.set(options.selectedColor);
      }
    },
    applier: applier
  });
}

JSColorSelectorDialog.prototype = Object.create(JSDialogView.prototype);
JSColorSelectorDialog.prototype.constructor = JSColorSelectorDialog;

/**
 * @return currently selected color
 */
JSColorSelectorDialog.prototype.getSelectedColor = function() {
  return this.colorSelector.get();
};

JSColorSelectorDialog.prototype.dispose = function() {
  this.colorSelector.dispose();

  JSDialogView.prototype.dispose.call(this);
};

/**
 * A component to select a color through a dialog, after clicking a button.
 * 
 * @param {JSViewFactory} viewFactory the view factory
 * @param {UserPreferences} preferences
 * @param {HTMLElement} [targetNode]
 * @param {{ onColorSelected: function(number) }} [options]
 * > onColorSelected: called with selected color, as RGB int, when a color is selected
 * @constructor
 */
function JSColorSelectorButton(viewFactory, preferences, targetNode, options) {
  this.options = options || {};

  JSComponentView.call(this, viewFactory, preferences, null, {
    initializer: function(component) {
      component.getRootNode().innerHTML = '<button class="color-button"><div class="color-overview" /></button>';
      component.button = component.getRootNode().querySelector('.color-button');
      
      component.registerEventListener(
        component.button,
        'click',
        function() { component.openColorSelectorDialog(); });
      
      component.colorOverview = component.getRootNode().querySelector('.color-overview');
    },
    getter: function(component) {
      return component.selectedColor;
    },
    setter: function(component, color) {
      component.selectedColor = color;
      component.colorOverview.style.backgroundColor = ColorTools.integerToHexadecimalString(color);
    }
  });
  if (targetNode != null) {
    targetNode.appendChild(this.getRootNode());
  }
}

JSColorSelectorButton.prototype = Object.create(JSComponentView.prototype);
JSColorSelectorButton.prototype.constructor = JSColorSelectorButton;

/**
 * Enable or disable this component
 * @param {boolean} [enabled] defaults to true 
 */
JSColorSelectorButton.prototype.enable = function(enabled) {
  if (typeof enabled == 'undefined') {
    enabled = true;
  }
  this.button.disabled = !enabled;
};

/**
 * @private
 */
JSColorSelectorButton.prototype.openColorSelectorDialog = function() {
  var colorSelectorButton = this;
  // TODO get through viewFactory
  var dialog = new JSColorSelectorDialog(this.viewFactory, this.preferences, { 
    selectedColor: this.selectedColor,
    applier: function() {
      colorSelectorButton.set(dialog.getSelectedColor());
      if (typeof colorSelectorButton.options.onColorSelected == 'function') {
        colorSelectorButton.options.onColorSelected(dialog.getSelectedColor());
      }
    }
  });
  dialog.displayView();
};

JSColorSelectorButton.prototype.dispose = function() {
  JSComponentView.prototype.dispose.call(this);
};

// ********************************
// TEXTURE 
// ********************************

/**
 * The texture selector dialog class.
 *
 * @param {JSViewFactory} viewFactory the view factory
 * @param preferences      the current user preferences
 * @param {TextureChoiceController} textureChoiceController texture choice controller
 * @param {{selectedTexture, applier: function(JSDialogView)}} [options]
 * > selectedTexture: selected texture
 * > applier: when dialog closes, takes dialog as parameter
 * @constructor
 */
function JSTextureSelectorDialog(viewFactory, preferences, textureChoiceController, options) {
  this.textureChoiceController = textureChoiceController;
  this.selectedTextureModel = {
    catalogTexture: null,
    xOffset: 0,
    yOffset: 0, 
    angleInRadians: 0, 
    scale: 100
  }

  var applier = function() {};
  if (typeof options == 'object' && typeof options.applier == 'function') {
    applier = options.applier;
  }

  var html = 
    '<div class="columns-2">' + 
    '  <div class="column1">' + 
    '    <div class="texture-search"><input type="text" /></div>' + 
    '    <div class="texture-catalog-list"></div>' + 
    '  </div>' + 
    '  <div class="column2">' + 
    '    <div class="selected-texture-overview">' + 
    '      <div></div>' + 
    '    </div>' + 
    '    <div class="selected-texture-config">' + 
    '      <div>${TextureChoiceComponent.xOffsetLabel.text}</div>' + 
    '      <div><input type="number" name="selected-texture-offset-x" step="5" min="0" max="100" value="0" /></div>' + 
    '      <div>${TextureChoiceComponent.yOffsetLabel.text}</div>' + 
    '      <div><input type="number" name="selected-texture-offset-y" step="5" min="0" max="100" value="0" /></div>' + 
    '      <div>${TextureChoiceComponent.angleLabel.text}</div>' + 
    '      <div><input type="number" name="selected-texture-angle" step="15" min="0" max="360" value="0" /></div>' + 
    '      <div>${TextureChoiceComponent.scaleLabel.text}</div>' + 
    '      <div><input type="number" name="selected-texture-scale" step="5" min="5" max="10000" value="100" /></div>' + 
    '    </div>' + 
    '  </div>' + 
    '</div>';

  JSDialogView.call(this, viewFactory, preferences, '${HomeFurnitureController.textureTitle}', html, {
    initializer: function(dialog) {
      dialog.getRootNode().classList.add('texture-selector-dialog');
      
      dialog.catalogList = dialog.getRootNode().querySelector('.texture-catalog-list');
      dialog.selectedTextureOverview = dialog.getRootNode().querySelector('.selected-texture-overview > div');
      dialog.xOffsetInput = dialog.getElement('selected-texture-offset-x');
      dialog.yOffsetInput = dialog.getElement('selected-texture-offset-y');
      dialog.angleInput = dialog.getElement('selected-texture-angle');
      dialog.scaleInput = dialog.getElement('selected-texture-scale');
      dialog.registerEventListener([dialog.xOffsetInput, dialog.yOffsetInput, dialog.angleInput, dialog.scaleInput], 'change', function() {
        dialog.onTextureTransformConfigurationChanged();
      });

      var textureCategories = preferences.getTexturesCatalog().getCategories();
      for (var i = 0; i < textureCategories.length; i++) {
        var textureCategory = textureCategories[i];
        for (var j = 0; j < textureCategory.getTextures().length; j++) {
          var catalogTexture = textureCategory.getTextures()[j];
          var catalogTextureItem = document.createElement('div');
          catalogTextureItem.classList.add('item');
          catalogTextureItem.innerHTML = '<img src="' + catalogTexture.image.url + '" />' + textureCategory.name + ' - ' + catalogTexture.name;
          catalogTextureItem.dataset['catalogId'] = catalogTexture.getId();
          dialog.catalogList.appendChild(catalogTextureItem);
        }
      }
      dialog.texturesCatalogItems = Array.from(dialog.catalogList.childNodes);

      dialog.registerEventListener(dialog.texturesCatalogItems, 'click', function() {
        dialog.onCatalogTextureSelected(this);
      });

      this.initCatalogTextureSearch();

      var selectedTexture = textureChoiceController.getTexture();
      if (selectedTexture != null) {
        dialog.setTexture(selectedTexture);
      }
    },
    applier: function(dialog) {
      textureChoiceController.setTexture(dialog.getTexture());

      applier(dialog);
    }
  });
}

JSTextureSelectorDialog.prototype = Object.create(JSDialogView.prototype);
JSTextureSelectorDialog.prototype.constructor = JSTextureSelectorDialog;

/**
 * @return {HomeTexture} currently selected texture
 */
JSTextureSelectorDialog.prototype.getTexture = function() {
  return new HomeTexture(
    this.selectedTextureModel.catalogTexture,
    this.selectedTextureModel.xOffset,
    this.selectedTextureModel.yOffset,
    this.selectedTextureModel.angleInRadians,
    this.selectedTextureModel.scale,
    true
  );
};

/**
 * Applies given texture values to this dialog
 * @param {HomeTexture} texture 
 */
JSTextureSelectorDialog.prototype.setTexture = function(texture) {
  this.selectedTextureModel.catalogTexture = this.getCatalogTextureById(texture.getCatalogId());
  this.selectedTextureModel.xOffset = texture.getXOffset();
  this.selectedTextureModel.yOffset = texture.getYOffset();
  this.selectedTextureModel.angleInRadians = texture.getAngle();
  this.selectedTextureModel.scale = texture.getScale();

  var catalogTextureId = this.selectedTextureModel.catalogTexture.getId();
  var catalogTextureItem = this.getCatalogTextureItemById(catalogTextureId);
  this.onCatalogTextureSelected(catalogTextureItem);
  this.xOffsetInput.value = this.selectedTextureModel.xOffset;
  this.yOffsetInput.value = this.selectedTextureModel.yOffset;
  this.angleInput.value = this.selectedTextureModel.angleInRadians;
  this.scaleInput.value = this.selectedTextureModel.scale;
  this.onTextureTransformConfigurationChanged();
};

/**
 * @param {HTMLElement} catalogTextureItem the selected catalog texture item
 * 
 * @private
 */
JSTextureSelectorDialog.prototype.onCatalogTextureSelected = function(catalogTextureItem) {
  var catalogId = catalogTextureItem.dataset['catalogId'];
  var catalogTexture = this.getCatalogTextureById(catalogId);
  console.info("catalog texture selected", catalogTexture);
  
  this.selectedTextureModel.catalogTexture = catalogTexture;

  for (var i = 0; i < this.texturesCatalogItems.length; i++) {
    this.texturesCatalogItems[i].classList.remove('selected');
  }
  catalogTextureItem.classList.add('selected');
  this.selectedTextureOverview.style.backgroundImage = "url('" + catalogTextureItem.querySelector('img').src + "')";
}

/**
 * @private
 */
JSTextureSelectorDialog.prototype.onTextureTransformConfigurationChanged = function() {
  console.info("texture transform config changed");

  this.selectedTextureModel.xOffset = this.xOffsetInput.value / 100;
  this.selectedTextureModel.yOffset = this.yOffsetInput.value / 100;
  this.selectedTextureModel.angleInRadians = /* toRadians */ (function (x) { return x * Math.PI / 180; })(this.angleInput.value);
  this.selectedTextureModel.scale = this.scaleInput.value / 100;

  var cssTransform = 
    'translate(' + this.xOffsetInput.value + '%, ' + this.yOffsetInput.value + '%) ' +
    'rotate(' + this.angleInput.value + 'deg) ' +
    'scale(' + this.selectedTextureModel.scale + ', ' + this.selectedTextureModel.scale + ') ';

  this.selectedTextureOverview.style.transform = cssTransform;
}

/**
 * @param {string} id catalog texture id in catalog
 * 
 * @return {CatalogTexture}
 * 
 */
JSTextureSelectorDialog.prototype.getCatalogTextureById = function(id) {
  var textureCategories = this.preferences.getTexturesCatalog().getCategories();
  for (var i = 0; i < textureCategories.length; i++) {
    var textureCategory = textureCategories[i];
    for (var j = 0; j < textureCategory.getTextures().length; j++) {
      var catalogTexture = textureCategory.getTextures()[j];
      if (catalogTexture.getId() == id) {
        return catalogTexture;
      }
    }
  }

  return null;
}

/**
 * @param {string} id catalog texture id in catalog
 * 
 * @return {HTMLElement}
 * 
 * @private
 */
JSTextureSelectorDialog.prototype.getCatalogTextureItemById = function(id) {
  this.catalogList.querySelector('.item[data-catalog-id="' + id + '"]');
}

/**
 * @private
 */
JSTextureSelectorDialog.prototype.initCatalogTextureSearch = function() {
  var dialog = this;
  var searchInput = this.getRootNode().querySelector('.texture-search input');
  dialog.registerEventListener(searchInput, 'keyup', CoreTools.debounce(function() {
    var visibleItems = dialog.texturesCatalogItems;
    var searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm.length > 0) {
      visibleItems = dialog.texturesCatalogItems.filter(item => item.textContent.toLowerCase().indexOf(searchTerm) > -1);
    }
    for (var i = 0; i < dialog.texturesCatalogItems.length; i++) {
      var item = dialog.texturesCatalogItems[i];
      if (visibleItems.indexOf(item) > -1) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    }
    
  }, 200));
}

JSTextureSelectorDialog.prototype.dispose = function() {
  JSDialogView.prototype.dispose.call(this);
};

/**
 * A component to select a texture through a dialog, after clicking a button.
 * 
 * @param {JSViewFactory} viewFactory the view factory
 * @param {UserPreferences} preferences user preferences
 * @param {TextureChoiceController} textureChoiceController texture choice controller
 * @param {HTMLElement} targetNode target node on which attach this component 
 * @constructor
 */
function JSTextureSelectorButton(viewFactory, preferences, textureChoiceController, targetNode) {
  this.textureChoiceController = textureChoiceController;

  JSComponentView.call(this, viewFactory, preferences, null, {
    initializer: function(component) {
      component.getRootNode().innerHTML = '<button class="texture-button"><div class="texture-overview" /></button>';
      component.button = component.getRootNode().querySelector('.texture-button');

      component.registerEventListener(
        component.button, 
        'click',
        function() { component.openTextureSelectorDialog(); });
      
      component.overview = component.getRootNode().querySelector('.texture-overview');
      
      component.textureChangeListener = function() {
        var selectedTexture = textureChoiceController.getTexture();
        console.info("texture selected: ", selectedTexture);
        var catalogTexture = component.getCurrentDialog().getCatalogTextureById(selectedTexture.getCatalogId());
        component.overview.style.backgroundImage = "url('" + catalogTexture.image.url + "')";
      };
      textureChoiceController.addPropertyChangeListener('TEXTURE', component.textureChangeListener);
    },
    getter: function(component) {
      return component.selectedTexture;
    },
    setter: function(component, texture) {
      component.selectedTexture = texture;
    }
  });
  if (targetNode != null) {
    targetNode.appendChild(this.getRootNode());
  }
}

JSTextureSelectorButton.prototype = Object.create(JSComponentView.prototype);
JSTextureSelectorButton.prototype.constructor = JSTextureSelectorButton;

/**
 * Enable or disable this component
 * @param {boolean} [enabled] defaults to true 
 */
JSTextureSelectorButton.prototype.enable = function(enabled) {
  if (typeof enabled == 'undefined') {
    enabled = true;
  }
  this.button.disabled = !enabled;
};

/**
 * Return currently opened dialog, if any
 * @return {JSTextureSelectorDialog}
 * @private
 */
JSTextureSelectorButton.prototype.getCurrentDialog = function() {
  return this.currentDialog;
};

/**
 * @private
 */
JSTextureSelectorButton.prototype.openTextureSelectorDialog = function() {
  this.currentDialog = this.viewFactory.createTextureChoiceView(this.preferences, this.textureChoiceController);
  this.currentDialog.displayView();
};


JSTextureSelectorButton.prototype.dispose = function() {
  this.textureChoiceController.removePropertyChangeListener(this.textureChangeListener);
  JSComponentView.prototype.dispose.call(this);
};