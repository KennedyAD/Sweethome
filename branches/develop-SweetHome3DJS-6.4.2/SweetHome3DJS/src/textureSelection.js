
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