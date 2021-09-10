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
 * A component used to select a color.
 * @param {UserPreferences} preferences user preferences
 * @param {HTMLElement} targetNode target node on which attach this component 
 * @constructor
 * @author Louis Grignon
 */
function JSColorSelector(preferences, targetNode) {
  var html = 
      '<div class="picker"></div>' +
      '<hr />' +
      '<div class="custom-color-editor">' +
      '  <input type="text" value="000000" />' +
      '  <div class="preview"></div>' +
      '  <button>➕</button>' +
      '</div>' +
      '<div class="custom-colors"></div>';

  JSComponent.call(this, preferences, html);
  if (targetNode != null) {
    targetNode.appendChild(this.getHTMLElement());
  }

  this.getHTMLElement().classList.add("color-selector");
  this.pickerElement = this.getHTMLElement().querySelector(".picker");
  this.customColorsContainerElement = this.getHTMLElement().querySelector(".custom-colors");
  this.customColorEditorInput = this.getHTMLElement().querySelector(".custom-color-editor input");
  this.customColorEditorOverview = this.getHTMLElement().querySelector(".custom-color-editor .preview");
  this.customColorEditorAddButton = this.getHTMLElement().querySelector(".custom-color-editor button");

  this.createPickerColorTiles();
  this.initCustomColorEditor();
}
JSColorSelector.prototype = Object.create(JSComponent.prototype);
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
  this.registerEventListener(this.colorTileElements, "click", function(ev) { 
      colorSelector.selectColorTile(this); 
    });
}

JSColorSelector.prototype.initCustomColorEditor = function() {
  var colorSelector = this;
  var changeColorEvent = "keyup";
  this.registerEventListener(this.customColorEditorInput, changeColorEvent, function(ev) {
      var colorHex = '#' + colorSelector.customColorEditorInput.value;
      if (colorHex.match(/#[0-9a-fA-F]{3,6}/)) {
        colorSelector.customColorEditorOverview.style.backgroundColor = colorHex;
        colorSelector.customColorEditorAddButton.disabled = false;
      } else {
        colorSelector.customColorEditorAddButton.disabled = true;
      }
    });
  this.registerEventListener(this.customColorEditorAddButton, "click", function(ev) {
        var colorHex = '#' + colorSelector.customColorEditorInput.value;
        colorSelector.addAndSelectCustomColorTile(colorHex);
        colorSelector.customColorEditorInput.value = "FFFFFF";
        var event = document.createEvent("Event");
        event.initEvent(changeColorEvent, false, false);
        colorSelector.customColorEditorInput.dispatchEvent(event);
    });
}
  
/**
 * Returns the color displayed by this button.
 * @return {number} the RGB code of the color of this button or <code>null</code>.
 */
JSColorSelector.prototype.getColor = function() {
  return this.color;
}

/**
 * Sets the color displayed by this button.
 * @param {number} color RGB code of the color or <code>null</code>.
 */
JSColorSelector.prototype.setColor = function(color) {
  this.color = color;
  if (color != null) {
    var matchingTile = this.getHTMLElement().querySelector("[data-color='" + color + "']");
    if (matchingTile == null) {
      this.addAndSelectCustomColorTile(ColorTools.integerToHexadecimalString(color));
    } else {
      this.selectColorTile(matchingTile);
    }
  }
}

/**
 * @param {HTMLElement} tileElement
 * @private
 */
JSColorSelector.prototype.selectColorTile = function(tileElement) {
  for (var i = 0; i < this.colorTileElements.length; i++) {
    var currentTileElement = this.colorTileElements[i];
    if (currentTileElement == tileElement) {
      currentTileElement.classList.add("selected");
    } else {
      currentTileElement.classList.remove("selected");
    }
  }
  this.color = this.getTileColor(tileElement);
}

/**
 * Returns color as ARGB number from tile element
 * @param {HTMLElement} tileElement
 * @return color as ARGB number
 * @private
 */
JSColorSelector.prototype.getTileColor = function(tileElement) {
  return 0xFF000000 | parseInt(tileElement.dataset["color"]);
}

/**
 * Creates a color tile element from hexadecimal color
 * @param {string} colorHex hexadecimal color
 * @return {HTMLElement} tile element
 * @private
 */
JSColorSelector.prototype.createColorTile = function(colorHex) {
  var tileElement = document.createElement("div");
  tileElement.dataset["color"] = ColorTools.hexadecimalStringToInteger(colorHex);
  tileElement.style.backgroundColor = colorHex;
  this.colorTileElements.push(tileElement);
  return tileElement;
}

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

  this.registerEventListener(tileElement, "click", function(ev) { 
      colorSelector.selectColorTile(this); 
    });
  this.selectColorTile(tileElement);

  return tileElement;
}

JSColorSelector.prototype.dispose = function() {
  JSComponent.prototype.dispose.call(this);
}

/**
 * Color selector dialog class.
 * @param preferences      the current user preferences
 * @param {{color: number, applier: function(JSDialog)}} [options]
 * > color: selected color as ARGB int
 * > applier: apply color change, color as a ARGB int
 * @constructor
 */
function JSColorSelectorDialog(preferences, options) {
  var applier;
  if (typeof options == "object" && typeof options.applier == "function") {
    applier = options.applier;
  } else {
    applier = function() {};
  }

  var html = 
    '<div>' + 
    '  <div data-name="color-selector"></div>' + 
    '</div>'
  JSDialog.call(this, preferences, "@{HomeFurniturePanel.colorDialog.title}", html, 
      {
        applier: applier
      });

  this.getHTMLElement().classList.add("color-selector-dialog");
  this.getHTMLElement().classList.add("small");

  this.colorSelector = new JSColorSelector(preferences, this.getElement("color-selector"));
  if (options.color != null) { 
    this.colorSelector.setColor(options.color);
  }
  var dialog = this;
  this.registerEventListener(this.colorSelector.colorTileElements, "dblclick", function(ev) { 
      dialog.validate(); 
    });
}
JSColorSelectorDialog.prototype = Object.create(JSDialog.prototype);
JSColorSelectorDialog.prototype.constructor = JSColorSelectorDialog;

/**
 * Returns the currently selected color.
 * @return currently selected color
 */
JSColorSelectorDialog.prototype.getSelectedColor = function() {
  return this.colorSelector.getColor();
};

JSColorSelectorDialog.prototype.dispose = function() {
  this.colorSelector.dispose();
  JSDialog.prototype.dispose.call(this);
}

/**
 * A component to select a color through a dialog, after clicking a button.
 * @param {UserPreferences} preferences
 * @param {HTMLElement} [targetNode]
 * @param {{ colorChanged: function(number) }} [options]
 * > colorChanged: called with selected color, as ARGB int, when a color is selected
 * @constructor
 */
function JSColorSelectorButton(preferences, targetNode, options) {
  this.options = options || {};

  JSComponent.call(this, preferences, document.createElement("span"), true);
  if (targetNode != null) {
    targetNode.appendChild(this.getHTMLElement());
  }

  this.getHTMLElement().innerHTML = '<button class="color-button"><div class="color-preview" /></button>';
  this.button = this.getHTMLElement().querySelector(".color-button");
  
  var component = this;
  this.registerEventListener(this.button, "click", function(ev) { 
      component.openColorSelectorDialog();
    });
  
  this.colorOverview = this.getHTMLElement().querySelector(".color-preview");
}
JSColorSelectorButton.prototype = Object.create(JSComponent.prototype);
JSColorSelectorButton.prototype.constructor = JSColorSelectorButton;

/**
 * Returns the color displayed by this button.
 * @return {number} the RGB code of the color of this button or <code>null</code>.
 */
JSColorSelectorButton.prototype.getColor = function() {
  return this.color;
}

/**
 * Sets the color displayed by this button.
 * @param {number} color RGB code of the color or <code>null</code>.
 */
JSColorSelectorButton.prototype.setColor = function(color) {
  this.color = color;
  this.colorOverview.style.backgroundColor = ColorTools.integerToHexadecimalString(color);
}

/**
 * Enables or disables this component.
 * @param {boolean} enabled  
 */
JSColorSelectorButton.prototype.setEnabled = function(enabled) {
  this.button.disabled = !enabled;
}

JSColorSelectorButton.prototype.openColorSelectorDialog = function() {
  var button = this;
  var dialog = new JSColorSelectorDialog(this.preferences, 
      { 
        color: this.color,
        applier: function() {
          button.setColor(dialog.getSelectedColor());
          if (typeof button.options.colorChanged == "function") {
            button.options.colorChanged(dialog.getSelectedColor());
          }
        }
      });
  dialog.displayView();
}

JSColorSelectorButton.prototype.dispose = function() {
  JSComponent.prototype.dispose.call(this);
}
