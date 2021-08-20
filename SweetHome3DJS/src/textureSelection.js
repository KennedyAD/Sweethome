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
 * @param {JSViewFactory} viewFactory the view factory
 * @param {UserPreferences} preferences the current user preferences
 * @param {TextureChoiceController} textureChoiceController texture choice controller
 * @param {{selectedTexture, applier: function(JSDialogView)}} [options]
 *   > selectedTexture: selected texture
 *   > applier: when dialog closes, takes dialog as parameter
 * @extends JSDialogView
 * @constructor
 */
function JSTextureSelectorDialog(viewFactory, preferences, textureChoiceController, options) {
  this.textureChoiceController = textureChoiceController;
  this.selectedTextureModel = {
    catalogTexture: null,
    xOffset: 0,
    yOffset: 0, 
    angleInRadians: 0, 
    scale: 1
  }

  /**
   * @param {CatalogTexture} catalogTexture 
   * @return {HTMLElement}
   */
  function createTextureListItem(catalogTexture) {
    var textureCategory = catalogTexture.getCategory();
    var catalogTextureItem = document.createElement('div');
    catalogTextureItem.classList.add('item');
    catalogTextureItem.innerHTML = '<img src="' + catalogTexture.getImage().getURL() + '" />' 
      + textureCategory.getName() + ' - ' + catalogTexture.getName();
    catalogTextureItem[JSTextureSelectorDialog.ITEM_TEXTURE_PROPERTY] = catalogTexture;
    return catalogTextureItem;
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
    '    <div class="selected-texture-config label-input-grid">' +
    '      <div>${TextureChoiceComponent.xOffsetLabel.text}</div>' + 
    '      <div><span data-name="selected-texture-offset-x" /></div>' +
    '      <div>${TextureChoiceComponent.yOffsetLabel.text}</div>' + 
    '      <div><span data-name="selected-texture-offset-y" /></div>' +
    '      <div>${TextureChoiceComponent.angleLabel.text}</div>' + 
    '      <div><span data-name="selected-texture-angle" /></div>' +
    '      <div>${TextureChoiceComponent.scaleLabel.text}</div>' + 
    '      <div><span data-name="selected-texture-scale" /></div>' +
    '    </div>' + 
    '    <hr />' +
    '    <div class="imported-textures-panel">' +
    '      <div><button import>${TextureChoiceComponent.importTextureButton.text}</button></div>' +  
    '      <div><button disabled modify>${TextureChoiceComponent.modifyTextureButton.text}</button></div>' +
    '      <div><button disabled delete>${TextureChoiceComponent.deleteTextureButton.text}</button></div>' +  
    '    </div>' +  
    '  </div>' + 
    '</div>' +
    '<div class="recent-textures"></div>';

  JSDialogView.call(this, viewFactory, preferences, '${HomeFurnitureController.textureTitle}', html, {
    initializer: function(dialog) {
      dialog.getRootNode().classList.add('texture-selector-dialog');
      
      dialog.recentTexturesPanel = dialog.getRootNode().querySelector('.recent-textures');
      
      dialog.catalogList = dialog.getRootNode().querySelector('.texture-catalog-list');
      dialog.selectedTextureOverview = dialog.getRootNode().querySelector('.selected-texture-overview > div');

      dialog.xOffsetInput = new JSSpinner(viewFactory, preferences, dialog.getElement('selected-texture-offset-x'), {
        value: 0,
        min: 0,
        max: 100,
        step: 5
      });
      dialog.yOffsetInput = new JSSpinner(viewFactory, preferences, dialog.getElement('selected-texture-offset-y'), {
        value: 0,
        min: 0,
        max: 100,
        step: 5
      });
      dialog.angleInput = new JSSpinner(viewFactory, preferences, dialog.getElement('selected-texture-angle'), {
        format: new IntegerFormat(),
        value: 0,
        min: 0,
        max: 360,
        step: 15,
      })
      dialog.scaleInput = new JSSpinner(viewFactory, preferences, dialog.getElement('selected-texture-scale'), {
        value: 100,
        min: 1,
        max: 10000,
        step: 5
      });

      dialog.registerEventListener([dialog.xOffsetInput, dialog.yOffsetInput, dialog.angleInput, dialog.scaleInput], 'change', function() {
        dialog.onTextureTransformConfigurationChanged();
      });

      var textureCategories = preferences.getTexturesCatalog().getCategories();
      for (var i = 0; i < textureCategories.length; i++) {
        var textureCategory = textureCategories[i];
        for (var j = 0; j < textureCategory.getTextures().length; j++) {
          var catalogTexture = textureCategory.getTextures()[j];
          dialog.catalogList.appendChild(createTextureListItem(catalogTexture));
        }
      }
      dialog.texturesCatalogItems = dialog.catalogList.childNodes;

      dialog.registerEventListener(dialog.texturesCatalogItems, 'click', function() {
        dialog.onCatalogTextureSelected(dialog.getCatalogTextureFromItem(this));
      });

      dialog.initCatalogTextureSearch();
      dialog.initRecentTextures();
      preferences.addPropertyChangeListener('RECENT_TEXTURES', function() {
        dialog.initRecentTextures();
      });

      dialog.initImportTexturesPanel();

      dialog.texturesCatalogListener = function(ev) {
        console.debug('on texture catalog changed');
        var catalogTexture = ev.getItem && ev.getItem();
        switch (ev.getType()) {
          case CollectionEvent.Type.ADD:
            dialog.searchInput.value = '';
            dialog.catalogList.appendChild(createTextureListItem(catalogTexture));
            dialog.onCatalogTextureSelected(catalogTexture);
            break;
          case CollectionEvent.Type.DELETE:
            var catalogTextureItem = dialog.getCatalogTextureItem(catalogTexture);
            dialog.catalogList.removeChild(catalogTextureItem);
            var firstItem = dialog.catalogList.querySelector('.item');
            if (firstItem) {
              dialog.onCatalogTextureSelected(dialog.getCatalogTextureFromItem(firstItem));
            }
            break;
        }
      };
      preferences.getTexturesCatalog().addTexturesListener(this.texturesCatalogListener);
    },
    applier: function(dialog) {
      // force refresh model from inputs, even if 'change' event was not raised 
      this.onTextureTransformConfigurationChanged();

      var selectedTexture = dialog.getTexture();
      textureChoiceController.setTexture(selectedTexture);

      if (selectedTexture != null) {
        var recentTextures = [selectedTexture].concat(dialog.preferences.getRecentTextures());
        dialog.preferences.setRecentTextures(recentTextures);
      }

      applier(dialog);
    },
    disposer: function(dialog) {
      preferences.getTexturesCatalog().removeTexturesListener(dialog.texturesCatalogListener);
    }
  });
}

JSTextureSelectorDialog.prototype = Object.create(JSDialogView.prototype);
JSTextureSelectorDialog.prototype.constructor = JSTextureSelectorDialog;

/**
 * @private
 */
JSTextureSelectorDialog.ITEM_TEXTURE_PROPERTY = '_catalogTexture';

/**
 * Returns the currently selected texture.
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
}

/**
 * Applies given texture values to this dialog.
 * @param {HomeTexture} texture 
 */
JSTextureSelectorDialog.prototype.setTexture = function(texture) {
  if (!texture || !texture.getImage() || !texture.getImage().getURL()) {
    return;
  }

  // resolve texture from url
  var textureUrl = texture.getImage().getURL();
  var textureCategories = this.preferences.getTexturesCatalog().getCategories();
  resolveTextureLoop:
  for (var i = 0; i < textureCategories.length; i++) {
    var textureCategory = textureCategories[i];
    for (var j = 0; j < textureCategory.getTextures().length; j++) {
      var catalogTexture = textureCategory.getTextures()[j];
      if (catalogTexture.getImage().getURL() == textureUrl
          || textureUrl.endsWith(catalogTexture.getImage().getURL())) {
        this.selectedTextureModel.catalogTexture = catalogTexture;
        break resolveTextureLoop;
      }
    }
  }
  if (this.selectedTextureModel.catalogTexture == null) {
    return;
  }

  this.selectedTextureModel.xOffset = texture.getXOffset();
  this.selectedTextureModel.yOffset = texture.getYOffset();
  this.selectedTextureModel.angleInRadians = texture.getAngle();
  this.selectedTextureModel.scale = texture.getScale();

  this.onCatalogTextureSelected(this.selectedTextureModel.catalogTexture);
  this.xOffsetInput.value = this.selectedTextureModel.xOffset * 100;
  this.yOffsetInput.value = this.selectedTextureModel.yOffset * 100;
  this.angleInput.value = Math.toDegrees(this.selectedTextureModel.angleInRadians);
  this.scaleInput.value = this.selectedTextureModel.scale * 100;
  this.onTextureTransformConfigurationChanged();
}

/**
 * @param {CatalogTexture} catalogTexture the selected catalog texture.
 * @private
 */
JSTextureSelectorDialog.prototype.onCatalogTextureSelected = function(catalogTexture) {
  var catalogTextureItem = this.getCatalogTextureItem(catalogTexture);
  
  console.info("catalog texture selected", catalogTexture);
  
  this.selectedTextureModel.catalogTexture = catalogTexture;

  for (var i = 0; i < this.texturesCatalogItems.length; i++) {
    this.texturesCatalogItems[i].classList.remove('selected');
  }
  catalogTextureItem.classList.add('selected');
  this.selectedTextureOverview.style.backgroundImage = "url('" + catalogTextureItem.querySelector('img').src + "')";

  var modifyTextureEnabled = catalogTexture != null;
  this.modifyTextureButton.disabled = !modifyTextureEnabled;
  this.deleteTextureButton.disabled = !modifyTextureEnabled;
}

/**
 * @private
 */
JSTextureSelectorDialog.prototype.onTextureTransformConfigurationChanged = function() {
  console.info("texture transform config changed");

  this.selectedTextureModel.xOffset = this.xOffsetInput.value / 100;
  this.selectedTextureModel.yOffset = this.yOffsetInput.value / 100;
  this.selectedTextureModel.angleInRadians = Math.toRadians(this.angleInput.value);
  this.selectedTextureModel.scale = this.scaleInput.value / 100;

  var cssTransform = 
    'translate(' + this.xOffsetInput.value + '%, ' + this.yOffsetInput.value + '%) ' +
    'rotate(' + this.angleInput.value + 'deg) ' +
    'scale(' + this.selectedTextureModel.scale + ', ' + this.selectedTextureModel.scale + ') ';

  this.selectedTextureOverview.style.transform = cssTransform;
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
 * @return {CatalogTexture} corresponding texture
 * @private
 */
JSTextureSelectorDialog.prototype.getCatalogTextureFromItem = function(item) {
  return item[JSTextureSelectorDialog.ITEM_TEXTURE_PROPERTY];
}

/**
 * @private
 */
JSTextureSelectorDialog.prototype.initCatalogTextureSearch = function() {
  var dialog = this;
  dialog.searchInput = this.getRootNode().querySelector('.texture-search input');
  dialog.registerEventListener(dialog.searchInput, 'keyup', CoreTools.debounce(function() {
    var searchTerm = dialog.searchInput.value.trim().toLowerCase();
    for (var i = 0; i < dialog.texturesCatalogItems.length; i++) {
      var item = dialog.texturesCatalogItems[i];
      var isVisible = searchTerm.length <= 0 || item.textContent.toLowerCase().indexOf(searchTerm) > -1;
      if (isVisible) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    }
    
  }, 200));
}

/**
 * @private
 */
JSTextureSelectorDialog.prototype.initRecentTextures = function() {
  var dialog = this; 

  this.recentTexturesPanel.innerHTML = '';

  var recentTextures = this.preferences.getRecentTextures();
  for (var i = 0; i < recentTextures.length; i++) {
    var recentTexture = recentTextures[i];
    
    var recentTextureElement = document.createElement('div');
    recentTextureElement.style.backgroundImage = "url('" + recentTexture.getImage().getURL() + "')";
    recentTextureElement.classList.add('texture-overview');
    recentTextureElement[JSTextureSelectorDialog.ITEM_TEXTURE_PROPERTY] = recentTexture;
    this.recentTexturesPanel.appendChild(recentTextureElement);
  }

  var dialog = this;
  this.registerEventListener(Array.from(this.recentTexturesPanel.childNodes), 'click', function() {
    dialog.onCatalogTextureSelected(dialog.getCatalogTextureFromItem(this));
  });
}

/**
 * @private
 */
JSTextureSelectorDialog.prototype.initImportTexturesPanel = function() {
  this.importTextureButton = this.findElement('.imported-textures-panel [import]');
  this.modifyTextureButton = this.findElement('.imported-textures-panel [modify]');
  this.deleteTextureButton = this.findElement('.imported-textures-panel [delete]');
  
  var dialog = this;
  var controller = this.textureChoiceController;
  this.registerEventListener(this.importTextureButton, 'click', function() { controller.importTexture() });
  this.registerEventListener(this.modifyTextureButton, 'click', function() { controller.modifyTexture(dialog.selectedTextureModel.catalogTexture) });
  this.registerEventListener(this.deleteTextureButton, 'click', function() { controller.deleteTexture(dialog.selectedTextureModel.catalogTexture) });
}

/**
 * @return {boolean}
 */
JSTextureSelectorDialog.prototype.confirmDeleteSelectedCatalogTexture = function() {
  // remove html tags from message because confirm does not support it
  var messageText = this.getLocalizedLabelText('TextureChoiceComponent', 'confirmDeleteSelectedCatalogTexture.message').replaceAll(/\<[^\>]*\>/g, ' ').replaceAll(/[ ]+/g, ' ');
  return confirm(messageText);
}

/**
 * A component to select a texture through a dialog, after clicking a button.
 * @param {JSViewFactory} viewFactory the view factory
 * @param {UserPreferences} preferences user preferences
 * @param {TextureChoiceController} textureChoiceController texture choice controller
 * @param {HTMLElement} targetNode target node on which attach this component 
 * @param {{ onTextureSelected: function(HomeTexture) }} [options]
 * > onTextureSelected: called with selected texture, when selection changed
 * @constructor
 */
function JSTextureSelectorButton(viewFactory, preferences, textureChoiceController, targetNode, options) {
  this.textureChoiceController = textureChoiceController;

  /** @field @type function(HomeTexture) */
  this.onTextureSelected = undefined;
  if (typeof options == 'object' && typeof options.onTextureSelected == 'function') {
    this.onTextureSelected = options.onTextureSelected;
  }

  JSComponentView.call(this, viewFactory, preferences, document.createElement('span'), {
    useElementAsRootNode: true,
    initializer: function(component) {
      component.getRootNode().innerHTML = '<button class="texture-button"><div class="texture-overview" /></button>';
      component.button = component.getRootNode().querySelector('.texture-button');

      component.registerEventListener(
        component.button, 
        'click',
        function() { component.openTextureSelectorDialog(); });
      
      component.overview = component.getRootNode().querySelector('.texture-overview');
      
      component.textureChangeListener = function() {
        component.set(textureChoiceController.getTexture());
        if (typeof component.onTextureSelected == 'function') {
          component.onTextureSelected(component.get());
        }
      };
      textureChoiceController.addPropertyChangeListener('TEXTURE', component.textureChangeListener);
    },
    getter: function(component) {
      return component.selectedTexture;
    },
    setter: function(component, texture) {
      component.selectedTexture = texture;

      if (texture == null) {
        component.overview.style.backgroundImage = 'none';
      } else {
        TextureManager.getInstance().loadTexture(texture.getImage(), {
          textureUpdated: function(image) {
            var backgroundImage = 'none';
            if (texture != null) {
              backgroundImage = "url('" + image.src + "')";
            }
            component.overview.style.backgroundImage = backgroundImage;
          },
          textureError:  function(error) {
            console.error("image cannot be loaded", error);
          }
        });
      }
    }
  });
  if (targetNode != null) {
    targetNode.appendChild(this.getRootNode());
  }
}

JSTextureSelectorButton.prototype = Object.create(JSComponentView.prototype);
JSTextureSelectorButton.prototype.constructor = JSTextureSelectorButton;

/**
 * Enables or disables this component
 * @param {boolean} [enabled] defaults to true 
 */
JSTextureSelectorButton.prototype.enable = function(enabled) {
  if (typeof enabled == 'undefined') {
    enabled = true;
  }
  this.button.disabled = !enabled;
}

JSTextureSelectorButton.prototype.openTextureSelectorDialog = function() {
  if (this.currentDialog != null && this.currentDialog.isDisplayed()) {
    return;
  }

  this.currentDialog = new JSTextureSelectorDialog(this.viewFactory, this.preferences, this.textureChoiceController);
  if (this.get() != null) {
    this.currentDialog.setTexture(this.get());
  }
  this.currentDialog.displayView();
};

JSTextureSelectorButton.prototype.confirmDeleteSelectedCatalogTexture = function() {
  if (this.currentDialog != null && this.currentDialog.isDisplayed()) {
    return this.currentDialog.confirmDeleteSelectedCatalogTexture();
  }
}

JSTextureSelectorButton.prototype.dispose = function() {
  this.textureChoiceController.removePropertyChangeListener(this.textureChangeListener);
  JSComponentView.prototype.dispose.call(this);
}