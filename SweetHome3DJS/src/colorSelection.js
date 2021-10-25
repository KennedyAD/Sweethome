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
 * @private
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
  var colors = [
    // RAL colors from http://www.ralcolor.com/
    "#BEBD7F", "#C2B078", "#C6A664", "#E5BE01", "#CDA434", "#A98307", "#E4A010", "#DC9D00", "#8A6642", "#C7B446", "#EAE6CA", "#E1CC4F", "#E6D690", "#EDFF21", "#F5D033", "#F8F32B", "#9E9764", "#999950", "#F3DA0B", "#FAD201", "#AEA04B", "#FFFF00", "#9D9101", "#F4A900", "#D6AE01", "#F3A505", "#EFA94A", "#6A5D4D", "#705335", "#F39F18", "#ED760E", "#C93C20", "#CB2821", "#FF7514", "#F44611", "#FF2301", "#FFA420", "#F75E25", "#F54021", "#D84B20", "#EC7C26", "#E55137", "#C35831", "#AF2B1E", "#A52019", "#A2231D", "#9B111E", "#75151E", "#5E2129", "#412227", "#642424", "#781F19", "#C1876B", "#A12312", "#D36E70", "#EA899A", "#B32821", "#E63244", "#D53032", "#CC0605", "#D95030", "#F80000", "#FE0000", "#CB3234", "#B32428", "#721422", "#B44C43", "#6D3F5B", "#922B3E", "#DE4C8A", "#641C34", "#6C4675", "#A03472", "#4A192C", "#924E7D", "#A18594", "#CF3476", "#8673A1", "#6C6874", "#354D73", "#1F3438", "#20214F", "#1D1E33", "#18171C", "#1E2460", "#3E5F8A", "#26252D", "#025669", "#0E294B", "#231A24", "#3B83BD", "#1E213D", "#606E8C", "#2271B3", "#063971", "#3F888F", "#1B5583", "#1D334A", "#256D7B", "#252850", "#49678D", "#5D9B9B", "#2A6478", "#102C54", "#316650", "#287233", "#2D572C", "#424632", "#1F3A3D", "#2F4538", "#3E3B32", "#343B29", "#39352A", "#31372B", "#35682D", "#587246", "#343E40", "#6C7156", "#47402E", "#3B3C36", "#1E5945", "#4C9141", "#57A639", "#BDECB6", "#2E3A23", "#89AC76", "#25221B", "#308446", "#3D642D", "#015D52", "#84C3BE", "#2C5545", "#20603D", "#317F43", "#497E76", "#7FB5B5", "#1C542D", "#193737", "#008F39", "#00BB2D", "#78858B", "#8A9597", "#7E7B52", "#6C7059", "#969992", "#646B63", "#6D6552", "#6A5F31", "#4D5645", "#4C514A", "#434B4D", "#4E5754", "#464531", "#434750", "#293133", "#23282B", "#332F2C", "#686C5E", "#474A51", "#2F353B", "#8B8C7A", "#474B4E", "#B8B799", "#7D8471", "#8F8B66", "#D7D7D7", "#7F7679", "#7D7F7D", "#B5B8B1", "#6C6960", "#9DA1AA", "#8D948D", "#4E5452", "#CAC4B0", "#909090", "#82898F", "#D0D0D0", "#898176", "#826C34", "#955F20", "#6C3B2A", "#734222", "#8E402A", "#59351F", "#6F4F28", "#5B3A29", "#592321", "#382C1E", "#633A34", "#4C2F27", "#45322E", "#403A3A", "#212121", "#A65E2E", "#79553D", "#755C48", "#4E3B31", "#763C28", "#FDF4E3", "#E7EBDA", "#F4F4F4", "#282828", "#0A0A0A", "#A5A5A5", "#8F8F8F", "#FFFFFF", "#1C1C1C", "#F6F6F6", "#1E1E1E", "#D7D7D7", "#9C9C9C", "#828282"
    ];
  
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
  this.customColorEditorInput.value = ColorTools.integerToHexadecimalString(this.color).substring(1);
  this.customColorEditorOverview.style.backgroundColor = this.customColorEditorInput.value;
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


/**
 * Color selector dialog class.
 * @param preferences      the current user preferences
 * @param {{color: number, applier: function(JSDialog)}} [options]
 * > color: selected color as ARGB int
 * > title: title of the dialog
 * > applier: apply color change, color as a ARGB int
 * @constructor
 * @private
 */
function JSColorSelectorDialog(preferences, options) {
  var html = 
      '<div>' + 
      '  <div data-name="color-selector"></div>' + 
      '</div>';
  JSDialog.call(this, preferences, options.title, html, 
      {
        applier: options.applier
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
 * Returns the title of color dialog displayed when this button is pressed.
 */
JSColorSelectorButton.prototype.getColorDialogTitle = function() {
  return this.colorDialogTitle;
}

/**
 * Sets the title of color dialog displayed when this button is pressed.
 * @param {string} colorDialogTitle
 */
JSColorSelectorButton.prototype.setColorDialogTitle = function(colorDialogTitle) {
  this.colorDialogTitle = colorDialogTitle;
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
        title: this.colorDialogTitle,
        applier: function() {
          button.setColor(dialog.getSelectedColor());
          if (typeof button.options.colorChanged == "function") {
            button.options.colorChanged(dialog.getSelectedColor());
          }
        }
      });
  dialog.displayView();
}
