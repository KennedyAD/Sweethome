
/*
 * modelMaterialsSelection.js
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
 * The modelMaterials selector dialog class.
 *
 * @param {JSViewFactory} viewFactory the view factory
 * @param {UserPreferences} preferences the current user preferences
 * @param {ModelMaterialsController} controller modelMaterials choice controller
 * @param {{applier: function(JSDialogView)}} [options]
 * > applier: when dialog closes, takes dialog as parameter
 * 
 * @extends JSDialogView
 * @constructor
 */
function JSModelMaterialsSelectorDialog(viewFactory, preferences, controller, options) {
  this.controller = controller;

  var applier = function() {};
  if (typeof options == 'object' && typeof options.applier == 'function') {
    applier = options.applier;
  }

  var html = 
    '<div class="columns-2">' + 
    '  <div class="column1">' + 
    '    <span>${ModelMaterialsComponent.materialsLabel.text}</span><br/>' +
    '    <div data-name="model-preview"></div>' +
    '  </div>' + 
    '  <div class="column2 edit-panel">' +
    '    <ul class="materials-list">' +
    '    </ul>' +
    '    <div class="color-texture-shininess-panel">' +
    '      <span>${ModelMaterialsComponent.colorAndTextureLabel.text}</span><br/>' +
    '      <div>${ModelMaterialsComponent.xOffsetLabel.text}</div>' +
    '      <div><input type="number" name="selected-modelMaterials-offset-x" step="5" min="0" max="100" value="0" /></div>' +
    '      <div>${ModelMaterialsComponent.yOffsetLabel.text}</div>' +
    '      <div><input type="number" name="selected-modelMaterials-offset-y" step="5" min="0" max="100" value="0" /></div>' +
    '      <div>${ModelMaterialsComponent.angleLabel.text}</div>' +
    '      <div><input type="number" name="selected-modelMaterials-angle" step="15" min="0" max="360" value="0" /></div>' +
    '      <div>${ModelMaterialsComponent.scaleLabel.text}</div>' +
    '      <div><input type="number" name="selected-modelMaterials-scale" step="5" min="5" max="10000" value="100" /></div>' +
    '    </div>'
    '  </div>' + 
    '</div>';

  JSDialogView.call(this, viewFactory, preferences, '${HomeFurnitureController.modelMaterialsTitle}', html, {
    initializer: function(dialog) {
      dialog.getRootNode().classList.add('modelMaterials-selector-dialog');

      dialog.initMaterialsList();

      dialog.enableComponents();
    },
    applier: function(dialog) {

      // TODO LOUIS
      // selectedMaterialBlinker.stop();
      // this.controller.setMaterials(((MaterialsListModel)this.materialsList.getModel()).getMaterials());

      applier(dialog);
    },
    disposer: function(dialog) {
    }
  });
}

JSModelMaterialsSelectorDialog.prototype = Object.create(JSDialogView.prototype);
JSModelMaterialsSelectorDialog.prototype.constructor = JSModelMaterialsSelectorDialog;

JSModelMaterialsSelectorDialog.prototype.initMaterialsList = function() {
  // TODO LOUIS
  // on list selection changed
  // dialog.enableComponents();
};

/**
 * @private
 */
JSModelMaterialsSelectorDialog.prototype.enableComponents = function() {
  // TODO LOUIS
  var selectionEmpty = this.materialsList.isSelectionEmpty();
  defaultColorAndTextureRadioButton.disabled = selectionEmpty;
  invisibleRadioButton.disabled = selectionEmpty;
  textureRadioButton.disabled = selectionEmpty;
  textureComponent.enable(!selectionEmpty);
  colorRadioButton.disabled = selectionEmpty;
  colorButton.enable(!selectionEmpty);
  // TODO LOUIS
  //shininessSlider.setEnabled(!selectionEmpty);
}

/**
 * A component to select a modelMaterials through a dialog, after clicking a button.
 * 
 * @param {JSViewFactory} viewFactory the view factory
 * @param {UserPreferences} preferences user preferences
 * @param {ModelMaterialsController} controller modelMaterials choice controller
 * @param {HTMLElement} targetNode target node on which attach this component 
 * @param {{ onModelMaterialsSelected: function() }} [options]
 * > onModelMaterialsSelected: called with selected modelMaterials, when selection changed
 * @constructor
 */
function JSModelMaterialsSelectorButton(viewFactory, preferences, controller, targetNode, options) {
  this.controller = controller;

  /** @field @type function(HomeModelMaterials) */
  this.onModelMaterialsSelected = undefined;
  if (typeof options == 'object' && typeof options.onModelMaterialsSelected == 'function') {
    this.onModelMaterialsSelected = options.onModelMaterialsSelected;
  }

  JSComponentView.call(this, viewFactory, preferences, document.createElement('span'), {
    useElementAsRootNode: true,
    initializer: function(component) {

      component.getRootNode().innerHTML = '<button class="modelMaterials-button">' + component.getLocalizedLabelText('ModelMaterialsComponent', "modifyButton.text") + '</button>';
      component.button = component.getRootNode().querySelector('.modelMaterials-button');
      component.button.disabled = true;

      component.registerEventListener(
        component.button, 
        'click',
        function() { component.openModelMaterialsSelectorDialog(); });
    },
    getter: function(component) {
      // TODO LOUIS
      return component.selectedModelMaterials;
    },
    setter: function(component, modelMaterials) {
      // TODO LOUIS
      component.selectedModelMaterials = modelMaterials;
    }
  });
  if (targetNode != null) {
    targetNode.appendChild(this.getRootNode());
  }
}

JSModelMaterialsSelectorButton.prototype = Object.create(JSComponentView.prototype);
JSModelMaterialsSelectorButton.prototype.constructor = JSModelMaterialsSelectorButton;

/**
 * Enables or disables this component
 * @param {boolean} [enabled] defaults to true 
 */
JSModelMaterialsSelectorButton.prototype.enable = function(enabled) {
  if (typeof enabled == 'undefined') {
    enabled = true;
  }
  this.button.disabled = !enabled;
};

/**
 * @private
 */
JSModelMaterialsSelectorButton.prototype.openModelMaterialsSelectorDialog = function() {
  if (this.currentDialog != null && this.currentDialog.isDisplayed()) {
    return;
  }

  this.currentDialog = new JSModelMaterialsSelectorDialog(this.viewFactory, this.preferences, this.controller);
  if (this.get() != null) {
    // TODO LOUIS
    this.currentDialog.setModelMaterials(this.get());
  }

  // TODO LOUIS
  // this.controller.getTextureController().addPropertyChangeListener(
  //     TextureChoiceController.Property.TEXTURE, this.textureChangeListener);
  this.currentDialog.displayView();
};

JSModelMaterialsSelectorButton.prototype.dispose = function() {
  JSComponentView.prototype.dispose.call(this);
};