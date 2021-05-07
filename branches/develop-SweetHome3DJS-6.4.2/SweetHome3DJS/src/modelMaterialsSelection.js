
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
    '  <div class="column1" data-name="preview-panel">' +
    '    <span>${ModelMaterialsComponent.previewLabel.text}</span><br/>' +
    '    <canvas id="model-preview-canvas"></canvas>' +
    '  </div>' + 
    '  <div class="column2" data-name="edit-panel">' +
    '    <div>' +
    '      <span>${ModelMaterialsComponent.materialsLabel.text}</span><br/>' +
    '      <div data-name="materials-list">' +
    '      </div>' +
    '    </div>' +
    '    <div class="color-texture-shininess-panel">' +
    '      <span>${ModelMaterialsComponent.colorAndTextureLabel.text}</span><br/>' +
    '      <div class="label-input-grid">' +
    '        <label class="whole-line"><input type="radio" name="color-and-texture-checkbox" value="DEFAULT">${ModelMaterialsComponent.defaultColorAndTextureRadioButton.text}</label>' +
    '        <label class="whole-line"><input type="radio" name="color-and-texture-checkbox" value="INVISIBLE">${ModelMaterialsComponent.invisibleRadioButton.text}</label>' +
    '        <label><input type="radio" name="color-and-texture-checkbox" value="COLOR">${ModelMaterialsComponent.colorRadioButton.text}</label>' +
    '        <span data-name="color-selector-button"></span>' +
    '        <label><input type="radio" name="color-and-texture-checkbox" value="TEXTURE">${ModelMaterialsComponent.textureRadioButton.text}</label>' +
    '        <span data-name="texture-selector-button"></span>' +
    '      </div>' +
    '      <br />' +
    '      <span>${ModelMaterialsComponent.shininessLabel.text}</span><br/>' +
    '      <input type="range" name="shininess-slider" min="0" max="128" list="model-materials-shininess-list" /> ' +
    '      <datalist id="model-materials-shininess-list"></datalist> ' +
    '      <div class="slider-labels"><div>${ModelMaterialsComponent.mattLabel.text}</div><div>${ModelMaterialsComponent.shinyLabel.text}</div></div>' +
    '    </div>' +
    '  </div>' +
    '</div>';

  JSDialogView.call(this, viewFactory, preferences, '${HomeFurnitureController.modelMaterialsTitle}', html, {
    initializer: function(dialog) {
      dialog.getRootNode().classList.add('model-materials-selector-dialog');

      dialog.initMaterialsList();
      dialog.initPreviewPanel();
      dialog.initColorAndTexturePanel();
      dialog.initShininessPanel();

      if (dialog.materialsList.size() > 0) {
        dialog.materialsList.selectAtIndex(0);
      } else {
        // Add a listener that will select first row as soon as the list contains some data
        var selectFirstMaterialOnContentAvailable = function() {
          if (dialog.materialsList.size() > 0) {
            dialog.materialsList.selectAtIndex(0);
            dialog.materialsList.removeContentsListener(selectFirstMaterialOnContentAvailable);
          }
        };
        dialog.materialsList.addContentsListener(selectFirstMaterialOnContentAvailable);
      }

      dialog.enableComponents();

      dialog.selectedMaterialBlinker = {
        /**
         * @private
         */
        active: false,

        /**
         * 0 or 1 depending on blink phase
         * @var {0|1}
         * @private
         */
        blinkState: 0,

        start: function() {
          var blinker = this;
          var materialsList = dialog.materialsList;
          blinker.blinkState = 0;
          blinker.active = 1;

          var toggleBlinkingState = function() {
            if (materialsList.size() > 1) {

              var materials = materialsList.getMaterials();
              if (materials == null) {
                materials = CoreTools.newArray(materialsList.size(),null);
              } else {
                materials = Array.from(materials);
              }

              if (blinker.blinkState > 0) {
                var selectedIndices = materialsList.getSelectedIndices();

                for (var i = 0; i < selectedIndices.length; i++) {
                  var index = selectedIndices[i];

                  var defaultMaterial = materialsList.getDefaultMaterialAtIndex(index);
                  var selectedMaterial = materials [index] != null
                      ? materials [index]
                      : defaultMaterial;
                  var blinkColor = 0xFF2244FF;
                  if (selectedMaterial.getTexture() == null) {
                    var selectedColor = selectedMaterial.getColor();
                    if (selectedColor == null) {
                      selectedColor = defaultMaterial.getColor();
                    }
                    var red   = (selectedColor >> 16) & 0xFF;
                    var green = (selectedColor >> 8) & 0xFF;
                    var blue  = selectedColor & 0xFF;
                    if (Math.max(red, Math.max(green, blue)) > 0x77) {
                      // Display a darker color for a bright color
                      blinkColor = 0xFF000000 | ((0x00FFFFFF & selectedColor) / 2);
                    } else if ((red + green + blue) / 3 > 0x0F) {
                      // Display a brighter color for a dark color
                      blinkColor = 0xFF000000 | (Math.max(2 * (0x00FFFFFF & selectedColor), 0x00FFFFFF));
                    }
                  }
                  materials [index] = new HomeMaterial(
                      selectedMaterial.getName(), blinkColor, null, selectedMaterial.getShininess()
                  );
                  dialog.previewComponent.setModelMaterials(materials);
                }
              } else {
                dialog.previewComponent.setModelMaterials(materials);
              }
            }

            if (blinker.active) {
              blinker.blinkState = (++blinker.blinkState) % 2;
              setTimeout(toggleBlinkingState, blinker.blinkState == 0 ? 100 : 1000);
            }
          };
          setTimeout(toggleBlinkingState, 100);
        },

        stop: function() {
          this.active = false;
        }
      };

      dialog.selectedMaterialBlinker.start();
    },
    applier: function(dialog) {

      dialog.selectedMaterialBlinker.stop();

      controller.setMaterials(dialog.materialsList.getMaterials());

      applier(dialog);
    },
    disposer: function(dialog) {
      dialog.colorAndTexturePanel.colorSelector.dispose();
      dialog.colorAndTexturePanel.textureSelector.dispose();
    }
  });
}

JSModelMaterialsSelectorDialog.prototype = Object.create(JSDialogView.prototype);
JSModelMaterialsSelectorDialog.prototype.constructor = JSModelMaterialsSelectorDialog;

/**
 * @private
 */
JSModelMaterialsSelectorDialog.prototype.initMaterialsList = function() {
  var dialog = this;
  var controller = this.controller;
  var materialsListElement = this.getElement('materials-list');

  var defaultMaterials = [];
  var materials = controller.getMaterials() == null ? null : Array.from(controller.getMaterials());
  ModelManager.getInstance().loadModel(controller.getModel(), true, {
    modelUpdated : function(modelRoot) {
      defaultMaterials = ModelManager.getInstance().getMaterials(modelRoot, controller.getModelCreator());
      if (materials != null) {
        // Keep only materials that are defined in default materials set
        // (the list can be different if the model loader interprets differently a 3D model file
        // or if materials come from a paste style action)
        var updatedMaterials = CoreTools.newArray(defaultMaterials.length,null);
        var foundInDefaultMaterials = false;
        for (var i = 0; i < defaultMaterials.length; i++) {
          var materialName = defaultMaterials [i].getName();
          for (var j = 0; j < materials.length; j++) {
            if (materials [j] != null && materials [j].getName() == materialName) {
              updatedMaterials [i] = materials [j];
              foundInDefaultMaterials = true;
              break;
            }
          }
        }
        if (foundInDefaultMaterials) {
          materials = updatedMaterials;
        } else {
          materials = null;
        }
      }
    }
  });

  var materialsList = this.materialsList = {
    /**
     * @var {HTMLDivElement}
     * @private
     */
    element: materialsListElement,

    /**
     * @private
     */
    materials: materials,

    /**
     * @private
     */
    defaultMaterials: defaultMaterials,

    /**
     * @private
     */
    contentsListeners: [],

    /**
     * @private
     */
    selectionListeners: [],

    /**
     * @return {number}
     */
    size: function() {
      if (this.defaultMaterials != null) {
        return this.defaultMaterials.length;
      } else {
        return 0;
      }
    },

    /**
     * @return {HomeMaterial[]}
     */
    getMaterials: function() {
      return this.materials;
    },

    /**
     * @param {number} index
     * @return {HomeMaterial}
     */
    getDefaultMaterialAtIndex: function(index) {
      return this.defaultMaterials[index];
    },

    /**
     * @param {number} index
     * @return {HomeMaterial}
     */
    getMaterialAtIndex: function(index) {
      var material;
      if (this.materials != null
          && this.materials [index] != null
          && this.materials [index].getName() != null
          && this.materials [index].getName() == this.defaultMaterials [index].getName()) {
        material = this.materials [index];
      } else {
        material = new HomeMaterial(this.defaultMaterials [index].getName(), null, null, null);
      }
      return material;
    },

    /**
     * @param {HomeMaterial} material
     * @param {number} index
     */
    setMaterialAt: function(material, index) {
      if (material.getColor() == null
          && material.getTexture() == null
          && material.getShininess() == null) {
        if (this.materials != null) {
          this.materials [index] = null;
          var containsOnlyNull = true;
          for (var i = 0; i < this.materials.length; i++) {
            if (this.materials[i] != null) {
              containsOnlyNull = false;
              break;
            }
          }
          if (containsOnlyNull) {
            this.materials = null;
          }
        }
      } else {
        if (this.materials == null || this.materials.length != this.defaultMaterials.length) {
          this.materials = CoreTools.newArray(this.defaultMaterials.length,null);
        }
        this.materials [index] = material;
      }

     this.onContentModified();
    },

    /**
     * @private
     */
    onContentModified: function() {
      for (var i = 0; i < this.contentsListeners.length; i++) {
        this.contentsListeners[i]();
      }

      this.repaint();
    },

    /**
     * @param {HomeMaterial} material
     * @param {HomeMaterial} defaultMaterial
     * @param {boolean} [selected] default false
     * @private
     */
    createListItem: function(material, defaultMaterial, selected) {
      var materialTexture = material.getTexture();
      var materialColor = material.getColor();
      if (materialTexture == null && materialColor == null) {
        materialTexture = defaultMaterial.getTexture();
        if (materialTexture == null) {
          materialColor = defaultMaterial.getColor();
        }
      }

      var itemBackground = document.createElement('div');
      itemBackground.classList.add('icon');
      if (materialTexture != null && materialTexture.getImage() != null) {
        // Display material texture image with an icon
        TextureManager.getInstance().loadTexture(materialTexture.getImage(), {
          textureUpdated: function(image) {
            itemBackground.style.backgroundImage = "url('" + image.src + "')";
          },
          textureError:  function(error) {
            console.error("image cannot be loaded", error);
          }
        });


      } else if (materialColor != null
          && (materialColor & 0xFF000000) != 0) {

        itemBackground.style.backgroundColor = ColorTools.integerToHexadecimalString(materialColor);
      } else {
        // empty icon
      }

      var item = document.createElement('div');
      item.textContent = material.getName();
      if (selected) {
        item.classList.add('selected');
      }

      item.appendChild(itemBackground);

      return item;
    },
    /**
     * @private
     */
    repaint: function() {
      var materialsList = this;
      var defaultMaterials = this.defaultMaterials;
      var materials = this.materials;
      var selectedIndices = this.getSelectedIndices();

      materialsList.element.innerHTML = '';
      if (defaultMaterials != null) {

        // generate content
        materialsList.element.innerHTML = '';
        for (var i = 0; i < defaultMaterials.length; i++) {
          var material = materialsList.getMaterialAtIndex(i);
          var defaultMaterial = materialsList.getDefaultMaterialAtIndex(i);
          var selected = selectedIndices.indexOf(i) > -1;
          materialsList.element.appendChild(this.createListItem(material, defaultMaterial, selected));
        }

        // register listeners
        var selectItem = function(item) {
          item.classList.add('selected');

          // fire selection change event
          for (var i = 0; i < materialsList.selectionListeners.length; i++) {
            materialsList.selectionListeners[i]();
          }
        };

        // 1) single click
        var onItemSelected = function(event) {
          var item = this;

          var multiSelection = OperatingSystem.isMacOSX() ? event.metaKey : event.ctrlKey;
          if (!multiSelection && item.classList.contains('selected')) {
          }

          if (!multiSelection) {
            for (var i = 0; i < materialsList.element.children.length; i++) {
              var otherItem = materialsList.element.children[i];
              if (otherItem != item) {
                otherItem.classList.remove('selected');
              }
            }
          }
          selectItem(item);
        };
        dialog.registerEventListener(materialsList.element.children, 'click', onItemSelected);

        // 2) double click
        dialog.registerEventListener(materialsList.element.children, 'dblclick', function(event) {
          var colorSelector = dialog.colorAndTexturePanel.colorSelector;
          var textureSelector = dialog.colorAndTexturePanel.textureSelector;
          var item = this;
          selectItem(item);

          if (colorSelector.get() != null) {
            colorSelector.openColorSelectorDialog();
          } else if (controller.getTextureController().getTexture() != null
              && textureSelector != null) {
            textureSelector.openTextureSelectorDialog();
          }
        });
      }
    },

    /**
     * Triggered whenever this list's content changes (materials count or data). This is not about selection,
     * please also see addSelectionListener
     * @param {function()} listener
     */
    addContentsListener: function(listener) {
      this.contentsListeners.push(listener);
    },

    /**
     * @param {function()} listener
     */
    removeContentsListener: function(listener) {
      this.contentsListeners.splice(this.contentsListeners.index(listener), 1);
    },

    /**
     * add listener on selection event (when one or more material are selected, or deselected)
     * @param {function()} listener
     */
    addSelectionListener: function(listener) {
      this.selectionListeners.push(listener);
    },

    /**
     * @param {number} index
     */
    selectAtIndex: function(index) {
      this.element.children[0].click();
    },

    /**
     * @return {boolean}
     */
    isAnyMaterialSelected: function() {
      return this.element.querySelector('.selected') != null;
    },

    /**
     * @return {number[]}
     */
    getSelectedIndices: function() {
      var selectedIndices = [];
      var items = this.element.children;
      for (var i = 0; i < items.length; i++) {
        if (items[i].classList.contains("selected")) {
          selectedIndices.push(i);
        }
      }
      return selectedIndices;
    },
  };

  dialog.materialsList.repaint();

  // LIST selection change handler
  dialog.materialsList.addSelectionListener(function() {
    var selectedIndices = dialog.materialsList.getSelectedIndices();
    if (selectedIndices.length > 0) {

      var material = dialog.materialsList.getMaterialAtIndex(selectedIndices[0]);
      var texture = material.getTexture();
      var color = material.getColor();
      var shininess = material.getShininess();
      var defaultMaterial = dialog.materialsList.getDefaultMaterialAtIndex(selectedIndices[0]);
      var colorAndTexturePanel = dialog.colorAndTexturePanel;
      if (color == null && texture == null) {
        colorAndTexturePanel.defaultRadio.checked = true;
        // Display default color or texture in buttons
        texture = defaultMaterial.getTexture();
        if (texture != null) {
          colorAndTexturePanel.colorSelector.set(null);
          controller.getTextureController().setTexture(texture);
        } else {
          color = defaultMaterial.getColor();
          if (color != null) {
            controller.getTextureController().setTexture(null);
            colorAndTexturePanel.colorSelector.set(color);
          }
        }
      } else if (texture != null) {
        colorAndTexturePanel.textureRadio.checked = true;
        colorAndTexturePanel.colorSelector.set(null);
        controller.getTextureController().setTexture(texture);
      } else if ((color & 0xFF000000) == 0) {
        colorAndTexturePanel.invisibleRadio.checked = true;
        // Display default color or texture in buttons
        texture = defaultMaterial.getTexture();
        if (texture != null) {
          colorAndTexturePanel.colorSelector.set(null);
          controller.getTextureController().setTexture(texture);
        } else {
          color = defaultMaterial.getColor();
          if (color != null) {
            controller.getTextureController().setTexture(null);
            colorAndTexturePanel.colorSelector.set(color);
          }
        }
      } else {
        colorAndTexturePanel.colorRadio.checked = true;
        controller.getTextureController().setTexture(null);
        colorAndTexturePanel.colorSelector.set(color);
      }

      if (shininess != null) {
        dialog.shininessSlider.value = shininess * 128;
      } else {
        dialog.shininessSlider.value = defaultMaterial.getShininess() * 128;
      }

    }
    dialog.enableComponents();
  });

};

/**
 * @private
 */
JSModelMaterialsSelectorDialog.prototype.initPreviewPanel = function() {
  var controller = this.controller;
  var dialog = this;

  var previewPanel = this.getElement('preview-panel');
  var previewCanvas = this.findElement('#model-preview-canvas');
  var previewComponent = dialog.previewComponent = new ModelPreviewComponent(previewCanvas, true);
  ModelManager.getInstance().loadModel(controller.getModel(), false, {
    modelUpdated : function(modelRoot) {
      var materialsList = dialog.materialsList;
      previewComponent.setModel(
          controller.getModel(), controller.isBackFaceShown(), controller.getModelRotation(),
          controller.getModelWidth(), controller.getModelDepth(), controller.getModelHeight()
      );
      previewComponent.setModelMaterials(materialsList.getMaterials());
      previewComponent.setModelTranformations(controller.getModelTransformations());
      materialsList.addContentsListener(function() {
        previewComponent.setModelMaterials(materialsList.getMaterials());
      });
    },
    modelError: function() {
      previewPanel.style.visibility = 'hidden';
    }
  });
};


/**
 * @private
 */
JSModelMaterialsSelectorDialog.prototype.initColorAndTexturePanel = function() {
  var dialog = this;
  var viewFactory = this.viewFactory;
  var controller = this.controller;
  var preferences = this.preferences;

  var defaultRadio = this.findElement('[name="color-and-texture-checkbox"][value="DEFAULT"]');
  var invisibleRadio = this.findElement('[name="color-and-texture-checkbox"][value="INVISIBLE"]');
  var colorRadio = this.findElement('[name="color-and-texture-checkbox"][value="COLOR"]');
  var textureRadio = this.findElement('[name="color-and-texture-checkbox"][value="TEXTURE"]');

  var colorSelector = viewFactory.createColorSelector(preferences, {
    onColorSelected: function(selectedColor) {
      if (selectedColor != null) {
        colorRadio.checked = true;
        colorRadio.dispatchEvent(new Event('input'))
      }
    }
  });
  this.attachChildComponent('color-selector-button', colorSelector)

  var textureSelector = controller.getTextureController().getView();
  textureSelector.onTextureSelected = function(texture) {
    if (texture != null) {
      textureRadio.checked = true;
    }
  };
  this.attachChildComponent('texture-selector-button', textureSelector);
  controller.getTextureController().addPropertyChangeListener('TEXTURE', function(event) {
    if (event.getNewValue() != null) {
      if (!textureRadio.checked) {
        textureRadio.checked = true;
      }
      textureRadio.dispatchEvent(new Event('input'))
    }
  });

  /**
   * @param {function(HomeMaterial, index): HomeMaterial} modifyMaterialCallback
   */
  var modifySelectedMaterials = function(modifyMaterialCallback) {
    var selectedIndices = dialog.materialsList.getSelectedIndices();
    for (var i = 0; i < selectedIndices.length; i++) {
      var index = selectedIndices[i];
      var material = dialog.materialsList.getMaterialAtIndex(index);

      dialog.materialsList.setMaterialAt(
          modifyMaterialCallback(material, index),
          index);
    }
  };

  this.registerEventListener(defaultRadio, 'input', function() {
    if (!this.disabled && this.checked) {
      modifySelectedMaterials(function(material) {
        return new HomeMaterial(material.getName(), null, null, material.getShininess());
      });
    }
  });
  this.registerEventListener(invisibleRadio, 'input', function() {
    if (!this.disabled && this.checked) {
      modifySelectedMaterials(function(material) {
        return new HomeMaterial(material.getName(), 0, null, material.getShininess());
      });
    }
  });
  this.registerEventListener(colorRadio, 'input', function() {
    if (!this.disabled && this.checked) {
      modifySelectedMaterials(function(material, index) {
        var defaultMaterial = dialog.materialsList.getDefaultMaterialAtIndex(index);
        var color = defaultMaterial.getColor() != colorSelector.get() || defaultMaterial.getTexture() != null
            ? colorSelector.get()
            : null;
        return new HomeMaterial(material.getName(), color, null, material.getShininess());
      });
    }
  });
  this.registerEventListener(textureRadio, 'input', function() {
    if (!this.disabled && this.checked) {
      modifySelectedMaterials(function(material, index) {
        var defaultTexture = dialog.materialsList.getDefaultMaterialAtIndex(index).getTexture();
        var texture = defaultTexture != controller.getTextureController().getTexture()
            ? controller.getTextureController().getTexture()
            : null;
        return new HomeMaterial(material.getName(), null, texture, material.getShininess());
      });
    }
  });

  this.colorAndTexturePanel = {
    defaultRadio: defaultRadio,
    invisibleRadio: invisibleRadio,
    colorRadio: colorRadio,
    colorSelector: colorSelector,
    textureRadio: textureRadio,
    textureSelector: textureSelector,
  };
};

/**
 * @private
 */
JSModelMaterialsSelectorDialog.prototype.initShininessPanel = function() {
  var dialog = this;
  this.shininessSlider = this.getElement('shininess-slider');

  var shininessList = this.findElement('#model-materials-shininess-list');
  for (var i = 0; i <= 128; i+= 16) {
    var option = document.createElement('option');
    option.value = i;
    shininessList.appendChild(option);
  }

  this.registerEventListener(this.shininessSlider, 'input', function() {
    var shininess = this.value;
    var selectedIndices = dialog.materialsList.getSelectedIndices();
    for (var i = 0; i < selectedIndices.length; i++) {
      var index = selectedIndices[i];
      var material = dialog.materialsList.getMaterialAtIndex(index);

      dialog.materialsList.setMaterialAt(
          new HomeMaterial(material.getName(), material.getColor(), material.getTexture(), shininess / 128),
          index);
    }
  });
};

/**
 * @private
 */
JSModelMaterialsSelectorDialog.prototype.enableComponents = function() {
  var selectionEmpty = !this.materialsList.isAnyMaterialSelected();
  this.colorAndTexturePanel.defaultRadio.disabled = selectionEmpty;
  this.colorAndTexturePanel.invisibleRadio.disabled = selectionEmpty;
  this.colorAndTexturePanel.textureRadio.disabled = selectionEmpty;
  this.colorAndTexturePanel.textureSelector.enable(!selectionEmpty);
  this.colorAndTexturePanel.colorRadio.disabled = selectionEmpty;
  this.colorAndTexturePanel.colorSelector.enable(!selectionEmpty);

  this.shininessSlider.disabled = selectionEmpty;
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

      component.getRootNode().innerHTML = '<button class="model-materials-button">' + component.getLocalizedLabelText('ModelMaterialsComponent', "modifyButton.text") + '</button>';
      component.button = component.getRootNode().querySelector('.model-materials-button');
      component.button.disabled = true;

      component.registerEventListener(
        component.button, 
        'click',
        function() { component.openModelMaterialsSelectorDialog(); });
    },
    getter: function(component) {
      throw new Error('not supported for materials');
    },
    setter: function(component, modelMaterials) {
      throw new Error('not supported for materials');
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
  this.currentDialog.displayView();
};

JSModelMaterialsSelectorButton.prototype.dispose = function() {
  JSComponentView.prototype.dispose.call(this);
};