/*
 * colorSelection.js
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

// Requires toolkit.js

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
  for (var i = 0; i < this.preferences.getRecentColors().length; i++) {
    var colorHex = ColorTools.integerToHexadecimalString(this.preferences.getRecentColors()[i]);
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
    var event = document.createEvent( 'Event' );
    event.initEvent(changeColorEvent, false, false);
    colorSelector.customColorEditorInput.dispatchEvent(event);
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
 * Returns color as ARGB number from tile element
 * @param {HTMLElement} tileElement
 * @return color as ARGB number
 * @private
 */
JSColorSelector.prototype.getTileColor = function(tileElement) {
  return 0xFF000000 | parseInt(tileElement.dataset['color']);
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

  var colorNumber = 0xFF000000 | ColorTools.hexadecimalStringToInteger(colorHex);
  if (this.preferences.getRecentColors().indexOf(colorNumber) === -1) {
    var recentColors = [colorNumber].concat(this.preferences.getRecentColors());
    this.preferences.setRecentColors(recentColors);
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
 * > selectedColor: selected color as ARGB int
 * > applier: apply color change, color as a ARGB int
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
      dialog.getRootNode().classList.add('small');

      dialog.colorSelector = new JSColorSelector(viewFactory, preferences, dialog.getElement('color-selector'));
      if (options.selectedColor != null) { 
        dialog.colorSelector.set(options.selectedColor);
      }
      dialog.registerEventListener(
        dialog.colorSelector.colorTileElements, 
        'dblclick',
        function() { dialog.validate(); });
    },
    applier: applier
  });
}

JSColorSelectorDialog.prototype = Object.create(JSDialogView.prototype);
JSColorSelectorDialog.prototype.constructor = JSColorSelectorDialog;

/**
 * Returns the currently selected color.
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
 * > onColorSelected: called with selected color, as ARGB int, when a color is selected
 * @constructor
 */
function JSColorSelectorButton(viewFactory, preferences, targetNode, options) {
  this.options = options || {};

  JSComponentView.call(this, viewFactory, preferences, document.createElement('span'), {
    useElementAsRootNode: true,
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
 * Enables or disables this component
 * @param {boolean} [enabled] defaults to true 
 */
JSColorSelectorButton.prototype.enable = function(enabled) {
  if (typeof enabled == 'undefined') {
    enabled = true;
  }
  this.button.disabled = !enabled;
};

JSColorSelectorButton.prototype.openColorSelectorDialog = function() {
  var colorSelectorButton = this;
  
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
