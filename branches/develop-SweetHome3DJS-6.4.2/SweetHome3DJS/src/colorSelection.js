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
    // RAL colors
    '#CCC58F','#D1BC8A','#D2B773','#F7BA0B','#E2B007','#C89F04','#E1A100','#E79C00','#AF8A54','#D9C022','#E9E5CE','#DFCEA1','#EADEBD','#EAF044','#F4B752','#F3E03B','#A4957D','#9A9464','#EEC900','#F0CA00','#B89C50','#F5FF00','#A38C15','#FFAB00','#DDB20F','#FAAB21','#EDAB56','#A29985','#927549','#EEA205','#DD7907','#BE4E20','#C63927','#FA842B','#E75B12','#FF2300','#FFA421','#F3752C','#E15501','#D4652F','#EC7C25','#DB6A50','#954527','#AB2524','#A02128','#A1232B','#8D1D2C','#701F29','#5E2028','#402225','#703731','#7E292C','#CB8D73','#9C322E','#D47479','#E1A6AD','#AC4034','#D3545F','#D14152','#C1121C','#D56D56','#F70000','#FF0000','#B42041','#E72512','#AC323B','#711521','#B24C43','#8A5A83','#933D50','#D15B8F','#691639','#83639D','#992572','#4A203B','#904684','#A38995','#C63678','#8773A1','#6B6880','#384C70','#1F4764','#2B2C7C','#2A3756','#1D1F2A','#154889','#41678D','#313C48','#2E5978','#13447C','#232C3F','#3481B8','#232D53','#6C7C98','#2874B2','#0E518D','#21888F','#1A5784','#0B4151','#07737A','#2F2A5A','#4D668E','#6A93B0','#296478','#102C54','#327662','#28713E','#276235','#4B573E','#0E4243','#0F4336','#40433B','#283424','#35382E','#26392F','#3E753B','#68825B','#31403D','#797C5A','#444337','#3D403A','#026A52','#468641','#48A43F','#B7D9B1','#354733','#86A47C','#3E3C32','#008754','#53753C','#005D52','#81C0BB','#2D5546','#007243','#0F8558','#478A84','#7FB0B2','#1B542C','#005D4C','#25E712','#00F700','#7E8B92','#8F999F','#817F68','#7A7B6D','#9EA0A1','#6B716F','#756F61','#746643','#5B6259','#575D57','#555D61','#596163','#555548','#51565C','#373F43','#2E3234','#4B4D46','#818479','#474A50','#374447','#939388','#5D6970','#B9B9A8','#818979','#939176','#CBD0CC','#9A9697','#7C7F7E','#B4B8B0','#6B695F','#9DA3A6','#8F9695','#4E5451','#BDBDB2','#91969A','#82898E','#CFD0CF','#888175','#887142','#9C6B30','#7B5141','#80542F','#8F4E35','#6F4A2F','#6F4F28','#5A3A29','#673831','#49392D','#633A34','#4C2F26','#44322D','#3F3A3A','#211F20','#A65E2F','#79553C','#755C49','#4E3B31','#763C28','#FDF4E3','#E7EBDA','#F4F4F4','#282828','#0A0A0A','#A5A5A5','#8F8F8F','#FFFFFF','#1C1C1C','#F6F6F6','#1E1E1E','#D7D7D7','#9C9C9C','#828282'
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
  this.customColorEditorInput.value = ColorTools.integerToHexadecimalString(this.color);
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

JSColorSelector.prototype.dispose = function() {
  JSComponent.prototype.dispose.call(this);
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

JSColorSelectorButton.prototype.dispose = function() {
  JSComponent.prototype.dispose.call(this);
}
