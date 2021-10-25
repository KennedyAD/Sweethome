/*
 * textureSelection.js
 *
 * Sweet Home 3D, Copyright (c) 2021 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
 * The texture selector dialog class.
 * @param {UserPreferences} preferences the current user preferences
 * @param {TextureChoiceController} controller texture choice controller
 * @param {{selectedTexture, applier: function(JSDialog)}} [options]
 *   > selectedTexture: selected texture
 *   > applier: when dialog closes, takes dialog as parameter
 * @extends JSDialog
 * @constructor
 * @private
 */
function JSTextureSelectorDialog(preferences, controller, options) {
  this.controller = controller;
  this.selectedTextureModel = {
      catalogTexture: null,
      xOffset: 0,
      yOffset: 0, 
      angleInRadians: 0, 
      scale: 1
    };

  /**
   * @param {CatalogTexture} catalogTexture 
   * @return {HTMLElement}
   * @private
   */
  function createTextureListItem(catalogTexture) {
    var textureCategory = catalogTexture.getCategory();
    var catalogTextureItem = document.createElement("div");
    catalogTextureItem.classList.add("item");
    catalogTextureItem.innerHTML = '<img src="' + catalogTexture.getImage().getURL() + '" />' 
        + textureCategory.getName() + " - " + catalogTexture.getName();
    catalogTextureItem._catalogTexture = catalogTexture;
    return catalogTextureItem;
  }

  var html = 
    '<div class="columns-2">' + 
    '  <div class="column1">' + 
    '    <div class="texture-search"><input type="text" /></div>' + 
    '    <div class="texture-catalog-list"></div>' + 
    '  </div>' + 
    '  <div class="column2">' + 
    '    <div class="selected-texture-preview">' + 
    '      <div></div>' + 
    '    </div>' + 
    '    <div class="selected-texture-config label-input-grid">' +
    '      <div>@{TextureChoiceComponent.xOffsetLabel.text}</div>' + 
    '      <div><span data-name="selected-texture-offset-x" /></div>' +
    '      <div>@{TextureChoiceComponent.yOffsetLabel.text}</div>' + 
    '      <div><span data-name="selected-texture-offset-y" /></div>' +
    '      <div>@{TextureChoiceComponent.angleLabel.text}</div>' + 
    '      <div><span data-name="selected-texture-angle" /></div>' +
    '      <div>@{TextureChoiceComponent.scaleLabel.text}</div>' + 
    '      <div><span data-name="selected-texture-scale" /></div>' +
    '    </div>' + 
    '    <hr />' +
    '    <div class="imported-textures-panel">' +
    '      <div><button import>@{TextureChoiceComponent.importTextureButton.text}</button></div>' +  
    '      <div><button disabled modify>@{TextureChoiceComponent.modifyTextureButton.text}</button></div>' +
    '      <div><button disabled delete>@{TextureChoiceComponent.deleteTextureButton.text}</button></div>' +  
    '    </div>' +  
    '  </div>' + 
    '</div>' +
    '<div class="recent-textures"></div>';

  JSDialog.call(this, preferences, controller.getDialogTitle(), html, 
      {
        applier: function(dialog) {
          // Force refresh model from inputs, even if "change" event was not raised 
          this.updateTextureTransform();
    
          var selectedTexture = dialog.getSelectedTexture();
          controller.setTexture(selectedTexture);
    
          if (selectedTexture != null) {
            controller.addRecentTexture(selectedTexture);
          }
        },
        disposer: function(dialog) {
          preferences.getTexturesCatalog().removeTexturesListener(dialog.texturesCatalogListener);
        }
      });

  this.getHTMLElement().classList.add("texture-selector-dialog");
  
  this.recentTexturesPanel = this.getHTMLElement().querySelector(".recent-textures");
  
  this.catalogList = this.getHTMLElement().querySelector(".texture-catalog-list");
  this.selectedTexturePreview = this.getHTMLElement().querySelector(".selected-texture-preview > div");

  this.xOffsetInput = new JSSpinner(preferences, this.getElement("selected-texture-offset-x"), 
      {
        value: 0,
        minimum: 0,
        maximum: 100,
        stepSize: 5
      });
  this.yOffsetInput = new JSSpinner(preferences, this.getElement("selected-texture-offset-y"), 
      {
        value: 0,
        minimum: 0,
        maximum: 100,
        stepSize: 5
      });
  this.angleInput = new JSSpinner(preferences, this.getElement("selected-texture-angle"), 
      {
        format: new IntegerFormat(),
        value: 0,
        minimum: 0,
        maximum: 360,
        stepSize: 15
      });
  this.scaleInput = new JSSpinner(preferences, this.getElement("selected-texture-scale"), 
      { 
        value: 100,
        minimum: 1,
        maximum: 10000,
        stepSize: 5
      });
  var dialog = this;
  this.registerEventListener([this.xOffsetInput, this.yOffsetInput, this.angleInput, this.scaleInput], "input", 
      function(ev) {
        dialog.updateTextureTransform();
      });

  var textureCategories = preferences.getTexturesCatalog().getCategories();
  for (var i = 0; i < textureCategories.length; i++) {
    var textureCategory = textureCategories[i];
    for (var j = 0; j < textureCategory.getTextures().length; j++) {
      var catalogTexture = textureCategory.getTextures()[j];
      dialog.catalogList.appendChild(createTextureListItem(catalogTexture));
    }
  }
  this.texturesCatalogItems = this.catalogList.childNodes;

  var mouseClicked = function(ev) {
      dialog.selectCatalogTexture(dialog.getCatalogTextureFromItem(this));
    };
  this.registerEventListener(this.texturesCatalogItems, "click", mouseClicked);

  this.initCatalogTextureSearch(preferences);
  this.initRecentTextures();
  this.registerPropertyChangeListener(preferences, "RECENT_TEXTURES", function(ev) {
      dialog.initRecentTextures();
    });

  this.initImportTexturesPanel();

  this.texturesCatalogListener = function(ev) {
      var catalogTexture = ev.getItem && ev.getItem();
      switch (ev.getType()) {
        case CollectionEvent.Type.ADD:
          dialog.searchInput.value = "";
          var listItem = createTextureListItem(catalogTexture);
          dialog.catalogList.appendChild(listItem);
          dialog.registerEventListener(listItem, "click", mouseClicked);
          dialog.selectCatalogTexture(catalogTexture);
          break;
        case CollectionEvent.Type.DELETE:
          var catalogTextureItem = dialog.getCatalogTextureItem(catalogTexture);
          dialog.catalogList.removeChild(catalogTextureItem);
          var firstItem = dialog.catalogList.querySelector(".item");
          if (firstItem) {
            dialog.selectCatalogTexture(dialog.getCatalogTextureFromItem(firstItem));
          }
          break;
      }
    };
  preferences.getTexturesCatalog().addTexturesListener(this.texturesCatalogListener);
}
JSTextureSelectorDialog.prototype = Object.create(JSDialog.prototype);
JSTextureSelectorDialog.prototype.constructor = JSTextureSelectorDialog;

/**
 * Returns the currently selected texture.
 * @return {HomeTexture} currently selected texture
 */
JSTextureSelectorDialog.prototype.getSelectedTexture = function() {
  return new HomeTexture(
      this.selectedTextureModel.catalogTexture,
      this.selectedTextureModel.xOffset,
      this.selectedTextureModel.yOffset,
      this.selectedTextureModel.angleInRadians,
      this.selectedTextureModel.scale,
      true);
}

/**
 * Applies given texture values to this dialog.
 * @param {HomeTexture} texture 
 */
JSTextureSelectorDialog.prototype.setSelectedTexture = function(texture) {
  if (texture != null) {
    this.selectedTextureModel.xOffset = texture.getXOffset();
    this.selectedTextureModel.yOffset = texture.getYOffset();
    this.selectedTextureModel.angleInRadians = texture.getAngle();
    this.selectedTextureModel.scale = texture.getScale();
    
    this.xOffsetInput.setValue(this.selectedTextureModel.xOffset * 100);
    this.yOffsetInput.setValue(this.selectedTextureModel.yOffset * 100);
    this.angleInput.setValue(Math.toDegrees(this.selectedTextureModel.angleInRadians));
    this.scaleInput.setValue(this.selectedTextureModel.scale * 100);
  
    // Resolve texture from URL
    var textureUrl = texture.getImage().getURL();
    var textureCategories = this.preferences.getTexturesCatalog().getCategories();
    var catalogTexture = null;
    for (var i = 0; i < textureCategories.length && catalogTexture === null; i++) {
      var categoryTextures = textureCategories[i].getTextures();
      for (var j = 0; j < categoryTextures.length; j++) {
        if (textureUrl == categoryTextures[j].getImage().getURL()) {
          catalogTexture = categoryTextures[j];
          break;
        }
      }
    }
    if (catalogTexture !== null) {
      this.selectCatalogTexture(catalogTexture);
    } else {
      this.selectedTextureModel.catalogTexture = texture;
      var component = this;
      TextureManager.getInstance().loadTexture(texture.getImage(), 
          {
            textureUpdated: function(image) {
              var backgroundImage = "none";
              if (texture != null) {
                backgroundImage = "url('" + image.src + "')";
              }
              component.selectedTexturePreview.style.backgroundImage = backgroundImage;
            },
          });
    }
  } else {
    this.selectedTexturePreview.style.backgroundImage = "none";
  }
  
  this.updateTextureTransform();
}

/**
 * @param {CatalogTexture} catalogTexture the selected catalog texture.
 * @private
 */
JSTextureSelectorDialog.prototype.selectCatalogTexture = function(catalogTexture) {
  var catalogTextureItem = this.getCatalogTextureItem(catalogTexture);
  this.selectedTextureModel.catalogTexture = catalogTexture;
  for (var i = 0; i < this.texturesCatalogItems.length; i++) {
    this.texturesCatalogItems[i].classList.remove("selected");
  }
  catalogTextureItem.classList.add("selected");
  this.selectedTexturePreview.style.backgroundImage = "url('" + catalogTextureItem.querySelector("img").src + "')";

  var modifyTextureEnabled = catalogTexture != null && catalogTexture.isModifiable();
  this.modifyTextureButton.disabled = !modifyTextureEnabled;
  this.deleteTextureButton.disabled = !modifyTextureEnabled;
}

/**
 * @private
 */
JSTextureSelectorDialog.prototype.updateTextureTransform = function() {
  this.selectedTextureModel.xOffset = this.xOffsetInput.getValue() / 100;
  this.selectedTextureModel.yOffset = this.yOffsetInput.getValue() / 100;
  this.selectedTextureModel.angleInRadians = Math.toRadians(this.angleInput.getValue());
  this.selectedTextureModel.scale = this.scaleInput.getValue() / 100;
  this.selectedTexturePreview.style.transform = 
      "translate(" + this.xOffsetInput.getValue() + "%, " + this.yOffsetInput.getValue() + "%) " +
      "rotate(" + this.angleInput.getValue() + "deg) " +
      "scale(" + this.selectedTextureModel.scale + ", " + this.selectedTextureModel.scale + ") ";
}

/**
 * @param {CatalogTexture} catalogTexture 
 * @return {HTMLElement | null} null if no item found for given texture
 * @private
 */
JSTextureSelectorDialog.prototype.getCatalogTextureItem = function(catalogTexture) {
  if (catalogTexture != null) {
    var requestedImageUrl = catalogTexture.getImage().getURL();
    for (var i = 0; i < this.texturesCatalogItems.length; i++) {
      var item = this.texturesCatalogItems[i];
      var itemImageUrl = this.getCatalogTextureFromItem(item).getImage().getURL();
      if (requestedImageUrl == itemImageUrl) {
        return item;
      }
    }
  }
  return null;
}

/**
 * @param {HTMLElement} item 
 * @return {CatalogTexture} matching texture
 * @private
 */
JSTextureSelectorDialog.prototype.getCatalogTextureFromItem = function(item) {
  return item._catalogTexture;
}

/**
 * @param {UserPreferences} preferences 
 * @private
 */
JSTextureSelectorDialog.prototype.initCatalogTextureSearch = function(preferences) {
  var dialog = this;
  dialog.searchInput = this.getHTMLElement().querySelector(".texture-search input");
  dialog.searchInput.placeholder = preferences.getLocalizedString("TextureChoiceComponent", "searchLabel.text").replace(":", "");
  dialog.registerEventListener(dialog.searchInput, "keyup", CoreTools.debounce(function() {
      var searchTerm = dialog.searchInput.value.trim().toLowerCase();
      for (var i = 0; i < dialog.texturesCatalogItems.length; i++) {
        var item = dialog.texturesCatalogItems[i];
        var isVisible = searchTerm.length <= 0 || item.textContent.toLowerCase().indexOf(searchTerm) > -1;
        if (isVisible) {
          item.classList.remove("hidden");
        } else {
          item.classList.add("hidden");
        }
      }
    }, 200));
}

/**
 * @private
 */
JSTextureSelectorDialog.prototype.initRecentTextures = function() {
  this.recentTexturesPanel.innerHTML = "";

  var recentTextures = this.preferences.getRecentTextures();
  for (var i = 0; i < recentTextures.length; i++) {
    var recentTexture = recentTextures[i];
    var recentTextureElement = document.createElement("div");
    recentTextureElement.style.backgroundImage = "url('" + recentTexture.getImage().getURL() + "')";
    recentTextureElement.classList.add("texture-preview");
    recentTextureElement._catalogTexture = recentTexture;
    this.recentTexturesPanel.appendChild(recentTextureElement);
  }

  var dialog = this;
  this.registerEventListener(this.recentTexturesPanel.childNodes, "click", function(ev) {
      dialog.selectCatalogTexture(dialog.getCatalogTextureFromItem(this));
    });
}

/**
 * @private
 */
JSTextureSelectorDialog.prototype.initImportTexturesPanel = function() {
  this.importTextureButton = this.findElement(".imported-textures-panel [import]");
  this.modifyTextureButton = this.findElement(".imported-textures-panel [modify]");
  this.deleteTextureButton = this.findElement(".imported-textures-panel [delete]");
  
  var dialog = this;
  var controller = this.controller;
  this.registerEventListener(this.importTextureButton, "click", function(ev) { 
      controller.importTexture();
    });
  this.registerEventListener(this.modifyTextureButton, "click", function(ev) { 
      controller.modifyTexture(dialog.selectedTextureModel.catalogTexture); 
    });
  this.registerEventListener(this.deleteTextureButton, "click", function(ev) { 
      controller.deleteTexture(dialog.selectedTextureModel.catalogTexture);
    });
}

/**
 * @return {boolean}
 */
JSTextureSelectorDialog.prototype.confirmDeleteSelectedCatalogTexture = function() {
  // Remove html tags from message because confirm does not support it
  var messageText = this.getLocalizedLabelText("TextureChoiceComponent", "confirmDeleteSelectedCatalogTexture.message").
      replaceAll(/\<[^\>]*\>/g, " ").replaceAll(/[ ]+/g, " ").replace(/^\s*/, "");
  return confirm(messageText);
}

/**
 * A component to select a texture through a dialog, after clicking a button.
 * @param {UserPreferences} preferences user preferences
 * @param {TextureChoiceController} controller texture choice controller
 * @param {HTMLElement} targetNode target node on which attach this component 
 * @param {{ textureChanged: function(HomeTexture) }} [options]
 * > textureChanged: called with selected texture, when selection changed
 * @constructor
 */
function JSTextureSelectorButton(preferences, controller, targetNode, options) {
  this.controller = controller;

  /** @field @type function(HomeTexture) */
  this.textureChanged = undefined;
  if (typeof options == "object" && typeof options.textureChanged == "function") {
    this.textureChanged = options.textureChanged;
  }

  JSComponent.call(this, preferences, document.createElement("span"), true);
  if (targetNode != null) {
    targetNode.appendChild(this.getHTMLElement());
  }

  this.getHTMLElement().innerHTML = '<button class="texture-button"><div class="texture-preview" /></button>';
  this.button = this.getHTMLElement().querySelector(".texture-button");

  var component = this;
  this.registerEventListener(this.button, "click", function(ev) { 
      component.openTextureSelectorDialog(); 
    });
  
  this.preview = this.getHTMLElement().querySelector(".texture-preview");
  
  var textureChangeListener = function() {
      component.updateTexture(controller.getTexture());
      if (typeof component.textureChanged == "function") {
        component.textureChanged(controller.getTexture());
      }
    };
  this.registerPropertyChangeListener(controller, "TEXTURE", textureChangeListener);
  this.updateTexture(controller.getTexture());
}
JSTextureSelectorButton.prototype = Object.create(JSComponent.prototype);
JSTextureSelectorButton.prototype.constructor = JSTextureSelectorButton;

/**
 * Updates the texture image displayed by this button.
 * @param {Texture} texture
 * @private 
 */
JSTextureSelectorButton.prototype.updateTexture = function(texture) {
  if (texture == null) {
    this.preview.style.backgroundImage = "none";
  } else {
    var component = this;
    TextureManager.getInstance().loadTexture(texture.getImage(), 
        {
          textureUpdated: function(image) {
            var backgroundImage = "none";
            if (texture != null) {
              backgroundImage = "url('" + image.src + "')";
            }
            component.preview.style.backgroundImage = backgroundImage;
          },
          textureError:  function(error) {
            console.error("Image cannot be loaded", error);
          }
        });
  }
}

/**
 * Enables or disables this component.
 * @param {boolean} enabled  
 */
JSTextureSelectorButton.prototype.setEnabled = function(enabled) {
  this.button.disabled = !enabled;
}

JSTextureSelectorButton.prototype.openTextureSelectorDialog = function() {
  if (this.currentDialog != null && this.currentDialog.isDisplayed()) {
    return;
  }

  this.currentDialog = new JSTextureSelectorDialog(this.preferences, this.controller);
  if (this.controller.getTexture() != null) {
    this.currentDialog.setSelectedTexture(this.controller.getTexture());
  }
  this.currentDialog.displayView();
}

JSTextureSelectorButton.prototype.confirmDeleteSelectedCatalogTexture = function() {
  if (this.currentDialog != null && this.currentDialog.isDisplayed()) {
    return this.currentDialog.confirmDeleteSelectedCatalogTexture();
  }
}
