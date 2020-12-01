
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
 * The texture selector dialog class.
 *
 * @param {JSViewFactory} viewFactory the view factory
 * @param {UserPreferences} preferences the current user preferences
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
    scale: 1
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
    '</div>' +
    '<div class="recent-textures"></div>';

  JSDialogView.call(this, viewFactory, preferences, '${HomeFurnitureController.textureTitle}', html, {
    initializer: function(dialog) {
      dialog.getRootNode().classList.add('texture-selector-dialog');
      
      dialog.recentTexturesPanel = dialog.getRootNode().querySelector('.recent-textures');
      
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
        dialog.onCatalogTextureSelected(this.dataset['catalogId']);
      });

      this.initCatalogTextureSearch();
      this.initRecentTextures();      
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
    }
  });
}

JSTextureSelectorDialog.prototype = Object.create(JSDialogView.prototype);
JSTextureSelectorDialog.prototype.constructor = JSTextureSelectorDialog;

/**
 * Returns the currently selected texture.
 *
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
 * Applies given texture values to this dialog.
 *
 * @param {HomeTexture} texture 
 */
JSTextureSelectorDialog.prototype.setTexture = function(texture) {
  this.selectedTextureModel.catalogTexture = JSTextureSelectorDialog.getCatalogTextureById(texture.getCatalogId(), this.preferences);
  this.selectedTextureModel.xOffset = texture.getXOffset();
  this.selectedTextureModel.yOffset = texture.getYOffset();
  this.selectedTextureModel.angleInRadians = texture.getAngle();
  this.selectedTextureModel.scale = texture.getScale();

  var catalogTextureId = this.selectedTextureModel.catalogTexture.getId();
  this.onCatalogTextureSelected(catalogTextureId);
  this.xOffsetInput.value = this.selectedTextureModel.xOffset * 100;
  this.yOffsetInput.value = this.selectedTextureModel.yOffset * 100;
  this.angleInput.value = Math.round(/* toDegrees */ (function (x) { return x * 180 / Math.PI; })(this.selectedTextureModel.angleInRadians));
  this.scaleInput.value = this.selectedTextureModel.scale * 100;
  this.onTextureTransformConfigurationChanged();
};

/**
 * Returns the catalog texture by id.
 *
 * @param {string} id catalog texture id in catalog
 * @param {UserPreferences} preferences the current user preferences
 * 
 * @return {CatalogTexture} matching texture in catalog or null if not found (or if id is null)
 * 
 * @static
 */
JSTextureSelectorDialog.getCatalogTextureById = function(id, preferences) {
  if (id == null) {
    return null;
  }

  var textureCategories = preferences.getTexturesCatalog().getCategories();
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
 * @param {number} catalogId the selected catalog texture id
 * 
 * @private
 */
JSTextureSelectorDialog.prototype.onCatalogTextureSelected = function(catalogId) {
  var catalogTextureItem = this.getCatalogTextureItemById(catalogId);
  
  var catalogTexture = JSTextureSelectorDialog.getCatalogTextureById(catalogId, this.preferences);
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
 * @return {HTMLElement}
 * 
 * @private
 */
JSTextureSelectorDialog.prototype.getCatalogTextureItemById = function(id) {
  return this.catalogList.querySelector('.item[data-catalog-id="' + id + '"]');
}

/**
 * @private
 */
JSTextureSelectorDialog.prototype.initCatalogTextureSearch = function() {
  var dialog = this;
  var searchInput = this.getRootNode().querySelector('.texture-search input');
  dialog.registerEventListener(searchInput, 'keyup', CoreTools.debounce(function() {
    var searchTerm = searchInput.value.trim().toLowerCase();
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
  
  var recentTextures = this.preferences.getRecentTextures();
  for (var i = 0; i < recentTextures.length; i++) {
    var recentTexture = recentTextures[i];
    var catalogId = null;
    if (typeof recentTexture.getId == 'function') {
      catalogId = recentTexture.getId();
    } else if (typeof recentTexture.getCatalogId == 'function') {
      catalogId = recentTexture.getCatalogId();
    }

    var catalogTexture = JSTextureSelectorDialog.getCatalogTextureById(catalogId, this.preferences);
    if (catalogTexture == null) {
      console.warn('unsupported recent texture', recentTexture);
      continue;
    }

    var recentTextureElement = document.createElement('div');
    recentTextureElement.style.backgroundImage = "url('" + catalogTexture.image.url + "')";
    recentTextureElement.classList.add('texture-overview');
    recentTextureElement.dataset['catalogId'] = catalogId;
    this.recentTexturesPanel.appendChild(recentTextureElement);
  }

  var dialog = this;
  this.registerEventListener(Array.from(this.recentTexturesPanel.childNodes), 'click', function() {
    dialog.onCatalogTextureSelected(this.dataset['catalogId']);
  });
}


/**
 * A component to select a texture through a dialog, after clicking a button.
 * 
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

      var backgroundImage = 'none';
      if (texture != null) {
        var catalogTexture = JSTextureSelectorDialog.getCatalogTextureById(texture.getCatalogId(), preferences);
        if (catalogTexture != null) {
          backgroundImage = "url('" + catalogTexture.image.url + "')";
        }
      }
      component.overview.style.backgroundImage = backgroundImage;
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
};

/**
 * @private
 */
JSTextureSelectorButton.prototype.openTextureSelectorDialog = function() {
  this.currentDialog = new JSTextureSelectorDialog(this.viewFactory, this.preferences, this.textureChoiceController);
  if (this.get() != null) {
    this.currentDialog.setTexture(this.get());
  }
  this.currentDialog.displayView();
};


JSTextureSelectorButton.prototype.dispose = function() {
  this.textureChoiceController.removePropertyChangeListener(this.textureChangeListener);
  JSComponentView.prototype.dispose.call(this);
};