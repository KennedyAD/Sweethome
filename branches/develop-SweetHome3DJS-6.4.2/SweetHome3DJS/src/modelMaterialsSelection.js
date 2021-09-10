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
 * Component giving access to materials editor. When the user clicks
 * on this button a dialog appears to let him choose materials.
 * @param {UserPreferences} preferences user preferences
 * @param {ModelMaterialsController} controller modelMaterials choice controller
 * @param {HTMLElement} targetNode target node on which attach this component 
 * @constructor
 * @author Emmanuel Puybaret
 * @author Louis Grignon
 */
function JSModelMaterialsSelectorButton(preferences, controller, targetNode) {
  this.controller = controller;

  JSComponent.call(this, preferences, document.createElement("span"), true);
  if (targetNode != null) {
    targetNode.appendChild(this.getHTMLElement());
  }

  this.getHTMLElement().innerHTML = '<button class="model-materials-button">' + this.getLocalizedLabelText('ModelMaterialsComponent', "modifyButton.text") + '</button>';
  this.button = this.getHTMLElement().querySelector(".model-materials-button");
  this.button.disabled = true;

  var component = this;
  this.registerEventListener(this.button, "click", function(ev) { 
      component.openModelMaterialsSelectorDialog(); 
    });
}
JSModelMaterialsSelectorButton.prototype = Object.create(JSComponent.prototype);
JSModelMaterialsSelectorButton.prototype.constructor = JSModelMaterialsSelectorButton;

/**
 * Enables or disables this component.
 * @param {boolean} enabled  
 */
JSModelMaterialsSelectorButton.prototype.setEnabled = function(enabled) {
  this.button.disabled = !enabled;
}

/**
 * @private
 */
JSModelMaterialsSelectorButton.prototype.openModelMaterialsSelectorDialog = function() {
  if (this.currentDialog != null && this.currentDialog.isDisplayed()) {
    return;
  }

  this.currentDialog = new JSModelMaterialsSelectorDialog(this.preferences, this.controller);
  this.currentDialog.displayView();
}

JSModelMaterialsSelectorButton.prototype.dispose = function() {
  JSComponent.prototype.dispose.call(this);
}

/**
 * The modelMaterials selector dialog class.
 * @param {UserPreferences} preferences the current user preferences
 * @param {ModelMaterialsController} controller modelMaterials choice controller
 * @param {{applier: function(JSDialog)}} [options]
 * > applier: when dialog closes, takes dialog as parameter
 * @extends JSDialog
 * @constructor
 * @private
 */
function JSModelMaterialsSelectorDialog(preferences, controller, options) {
  this.controller = controller;

  var applier = function() {};
  if (typeof options == "object" && typeof options.applier == "function") {
    applier = options.applier;
  }

  var html = 
    '<div class="columns-2">' +
    '  <div class="column1" data-name="preview-panel">' +
    '    <span>@{ModelMaterialsComponent.previewLabel.text}</span><br/>' +
    '    <canvas id="model-preview-canvas"></canvas>' +
    '  </div>' + 
    '  <div class="column2" data-name="edit-panel">' +
    '    <div>' +
    '      <span>@{ModelMaterialsComponent.materialsLabel.text}</span><br/>' +
    '      <div data-name="materials-list">' +
    '      </div>' +
    '    </div>' +
    '    <div class="color-texture-shininess-panel">' +
    '      <span>@{ModelMaterialsComponent.colorAndTextureLabel.text}</span><br/>' +
    '      <div class="label-input-grid">' +
    '        <label class="whole-line"><input type="radio" name="color-and-texture-checkbox" value="DEFAULT">@{ModelMaterialsComponent.defaultColorAndTextureRadioButton.text}</label>' +
    '        <label class="whole-line"><input type="radio" name="color-and-texture-checkbox" value="INVISIBLE">@{ModelMaterialsComponent.invisibleRadioButton.text}</label>' +
    '        <label><input type="radio" name="color-and-texture-checkbox" value="COLOR">@{ModelMaterialsComponent.colorRadioButton.text}</label>' +
    '        <span data-name="color-selector-button"></span>' +
    '        <label><input type="radio" name="color-and-texture-checkbox" value="TEXTURE">@{ModelMaterialsComponent.textureRadioButton.text}</label>' +
    '        <span data-name="texture-selector-button"></span>' +
    '      </div>' +
    '      <br />' +
    '      <span>@{ModelMaterialsComponent.shininessLabel.text}</span><br/>' +
    '      <input type="range" name="shininess-slider" min="0" max="128" list="model-materials-shininess-list" /> ' +
    '      <datalist id="model-materials-shininess-list"></datalist> ' +
    '      <div class="slider-labels"><div>@{ModelMaterialsComponent.mattLabel.text}</div><div>@{ModelMaterialsComponent.shinyLabel.text}</div></div>' +
    '    </div>' +
    '  </div>' +
    '</div>';

  JSDialog.call(this, preferences, "@{HomeFurnitureController.modelMaterialsTitle}", html, 
      {
        applier: function(dialog) {
          controller.setMaterials(dialog.materialsList.getMaterials());
          applier(dialog);
        },
        disposer: function(dialog) {
          dialog.selectedMaterialBlinker.stop();
          dialog.colorAndTexturePanel.colorSelector.dispose();
          dialog.colorAndTexturePanel.textureSelector.dispose();
        }
      });

  this.getHTMLElement().classList.add("model-materials-selector-dialog");
  
  this.initMaterialsList();
  this.initPreviewPanel();
  this.initColorAndTexturePanel();
  this.initShininessPanel();

  var dialog = this;
  if (this.materialsList.size() > 0) {
    this.materialsList.selectAtIndex(0);
  } else {
    // Add a listener that will select first row as soon as the list contains some data
    var selectFirstMaterialOnContentAvailable = function() {
        if (dialog.materialsList.size() > 0) {
          dialog.materialsList.selectAtIndex(0);
          dialog.materialsList.removeContentsListener(selectFirstMaterialOnContentAvailable);
        }
      };
    this.materialsList.addContentsListener(selectFirstMaterialOnContentAvailable);
  }

  this.enableComponents();

  var selectedMaterialBlinker = {
      delay: 500,
      animationTask: null,
      start: function() {
        var materialsList = dialog.materialsList;
        var toggleBlinkingState = function() {
            if (materialsList.size() > 1) {
              var materials = materialsList.getMaterials();
              if (selectedMaterialBlinker.delay !== 100) {
                selectedMaterialBlinker.delay = 100;
                if (materials == null) {
                  materials = dialog.newArray(materialsList.size());
                } else {
                  materials = materials.slice(0);
                }
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
                    selectedColor &= 0x00FFFFFF;
                    var red   = (selectedColor >> 16) & 0xFF;
                    var green = (selectedColor >> 8) & 0xFF;
                    var blue  = selectedColor & 0xFF;
                    if (Math.max(red, Math.max(green, blue)) > 0x77) {
                      // Display a darker color for a bright color
                      blinkColor = 0xFF000000 | (red / 2 << 16) | (green / 2 << 8) |  (blue / 2);
                    } else if ((red + green + blue) / 3 > 0x0F) {
                      // Display a brighter color for a dark color
                      blinkColor = 0xFF000000 
                          | (Math.min(red * 2, 0xFF) << 16) 
                          | (Math.min(green * 2, 0xFF) << 8) 
                          | Math.min(blue * 2, 0xFF);
                    }
                  }
                  materials [index] = new HomeMaterial(
                      selectedMaterial.getName(), blinkColor, null, selectedMaterial.getShininess());
                }
              } else {
                selectedMaterialBlinker.delay = 1000;
              }
              dialog.previewComponent.setModelMaterials(materials);
            }
  
            selectedMaterialBlinker.animationTask = setTimeout(toggleBlinkingState, 
                selectedMaterialBlinker.delay);
          };
          
        selectedMaterialBlinker.animationTask = setTimeout(toggleBlinkingState, selectedMaterialBlinker.delay);
      },
      stop: function() {
        clearTimeout(selectedMaterialBlinker.animationTask);
      },
      restart: function() {
        selectedMaterialBlinker.stop();
        selectedMaterialBlinker.delay = 101;
        selectedMaterialBlinker.start();
      }
    };

  selectedMaterialBlinker.start();
  this.materialsList.addSelectionListener(function(ev) {
      selectedMaterialBlinker.restart();
    });
  this.selectedMaterialBlinker = selectedMaterialBlinker; 
}
JSModelMaterialsSelectorDialog.prototype = Object.create(JSDialog.prototype);
JSModelMaterialsSelectorDialog.prototype.constructor = JSModelMaterialsSelectorDialog;

/**
 * Returns an array of the given size initialized with <code>null</code>.
 * @param {number} size
 * @return {Array}
 * @private
 */
JSModelMaterialsSelectorDialog.prototype.newArray = function(size) {
  var array = new Array(size);
  for (var i = 0; i < array.length; i++) {
    array [i] = null;
  }
  return array;
}

/**
 * @private
 */
JSModelMaterialsSelectorDialog.prototype.initMaterialsList = function() {
  var dialog = this;
  var controller = this.controller;
  var materialsListElement = this.getElement("materials-list");

  var defaultMaterials = [];
  var materials = controller.getMaterials();
  if (materials != null) {
    materials = materials.slice(0);
  }
  ModelManager.getInstance().loadModel(controller.getModel(), true, 
      {
        modelUpdated : function(modelRoot) {
          defaultMaterials = ModelManager.getInstance().getMaterials(modelRoot, controller.getModelCreator());
          if (materials != null) {
            // Keep only materials that are defined in default materials set
            // (the list can be different if the model loader interprets differently a 3D model file
            // or if materials come from a paste style action)
            var updatedMaterials = dialog.newArray(defaultMaterials.length);
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

  var materialsList = 
  this.materialsList = {
      element: materialsListElement,
      materials: materials,
      defaultMaterials: defaultMaterials,
      contentsListeners: [],
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
          if (this.materials == null 
              || this.materials.length != this.defaultMaterials.length) {
            this.materials = dialog.newArray(this.defaultMaterials.length);
          }
          this.materials [index] = material;
        }
  
       this.contentModified();
      },
      contentModified: function() {
        for (var i = 0; i < this.contentsListeners.length; i++) {
          this.contentsListeners[i]();
        }
  
        this.repaint();
      },
      /**
       * @param {HomeMaterial} material
       * @param {HomeMaterial} defaultMaterial
       * @param {boolean} [selected] default false
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
  
        var itemBackground = document.createElement("div");
        itemBackground.classList.add("icon");
        if (materialTexture != null && materialTexture.getImage() != null) {
          // Display material texture image with an icon
          TextureManager.getInstance().loadTexture(materialTexture.getImage(), 
              {
                textureUpdated: function(image) {
                  itemBackground.style.backgroundImage = "url('" + image.src + "')";
                },
                textureError:  function(error) {
                  console.error("Image cannot be loaded", error);
                }
              });
  
  
        } else if (materialColor != null
            && (materialColor & 0xFF000000) != 0) {
  
          itemBackground.style.backgroundColor = ColorTools.integerToHexadecimalString(materialColor);
        } else {
          // Empty icon
        }
  
        var item = document.createElement("div");
        item.textContent = material.getName();
        if (selected) {
          item.classList.add("selected");
        }
  
        item.appendChild(itemBackground);
  
        return item;
      },
      repaint: function() {
        var materialsList = this;
        var defaultMaterials = this.defaultMaterials;
        var materials = this.materials;
        var selectedIndices = this.getSelectedIndices();
  
        materialsList.element.innerHTML = "";
        if (defaultMaterials != null) {
          // Generate content
          materialsList.element.innerHTML = "";
          for (var i = 0; i < defaultMaterials.length; i++) {
            var material = materialsList.getMaterialAtIndex(i);
            var defaultMaterial = materialsList.getDefaultMaterialAtIndex(i);
            var selected = selectedIndices.indexOf(i) > -1;
            materialsList.element.appendChild(this.createListItem(material, defaultMaterial, selected));
          }
  
          // Register listeners
          var selectItem = function(item) {
              item.classList.add("selected");
              // Fire selection change event
              for (var i = 0; i < materialsList.selectionListeners.length; i++) {
                materialsList.selectionListeners[i]();
              }
            };
  
          // 1) Single click
          var selectItemOnClick = function(ev) {
              var item = this;
              var multiSelection = OperatingSystem.isMacOSX() ? ev.metaKey : ev.ctrlKey;
              if (!multiSelection && item.classList.contains("selected")) {
              }
              if (!multiSelection) {
                for (var i = 0; i < materialsList.element.children.length; i++) {
                  var otherItem = materialsList.element.children[i];
                  if (otherItem != item) {
                    otherItem.classList.remove("selected");
                  }
                }
              }
              selectItem(item);
            };
          dialog.registerEventListener(materialsList.element.children, "click", selectItemOnClick);
  
          // 2) Double click
          dialog.registerEventListener(materialsList.element.children, "dblclick", function(ev) {
              var colorSelector = dialog.colorAndTexturePanel.colorSelector;
              var textureSelector = dialog.colorAndTexturePanel.textureSelector;
              var item = this;
              selectItem(item);
    
              if (colorSelector.getColor() != null) {
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
        return this.element.querySelector(".selected") != null;
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
          colorAndTexturePanel.colorSelector.setColor(null);
          controller.getTextureController().setTexture(texture);
        } else {
          color = defaultMaterial.getColor();
          if (color != null) {
            controller.getTextureController().setTexture(null);
            colorAndTexturePanel.colorSelector.setColor(color);
          }
        }
      } else if (texture != null) {
        colorAndTexturePanel.textureRadio.checked = true;
        colorAndTexturePanel.colorSelector.setColor(null);
        controller.getTextureController().setTexture(texture);
      } else if ((color & 0xFF000000) == 0) {
        colorAndTexturePanel.invisibleRadio.checked = true;
        // Display default color or texture in buttons
        texture = defaultMaterial.getTexture();
        if (texture != null) {
          colorAndTexturePanel.colorSelector.setColor(null);
          controller.getTextureController().setTexture(texture);
        } else {
          color = defaultMaterial.getColor();
          if (color != null) {
            controller.getTextureController().setTexture(null);
            colorAndTexturePanel.colorSelector.setColor(color);
          }
        }
      } else {
        colorAndTexturePanel.colorRadio.checked = true;
        controller.getTextureController().setTexture(null);
        colorAndTexturePanel.colorSelector.setColor(color);
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

  var previewPanel = this.getElement("preview-panel");
  var previewCanvas = this.findElement("#model-preview-canvas");
  var previewComponent = dialog.previewComponent = new ModelPreviewComponent(previewCanvas, true);
  ModelManager.getInstance().loadModel(controller.getModel(), false, 
      {
        modelUpdated : function(modelRoot) {
          var materialsList = dialog.materialsList;
          previewComponent.setModel(
              controller.getModel(), controller.isBackFaceShown(), controller.getModelRotation(),
              controller.getModelWidth(), controller.getModelDepth(), controller.getModelHeight());
          previewComponent.setModelMaterials(materialsList.getMaterials());
          previewComponent.setModelTranformations(controller.getModelTransformations());
          materialsList.addContentsListener(function() {
              previewComponent.setModelMaterials(materialsList.getMaterials());
            });
        },
        modelError: function() {
          previewPanel.style.visibility = "hidden";
        }
      });
}


/**
 * @private
 */
JSModelMaterialsSelectorDialog.prototype.initColorAndTexturePanel = function() {
  var dialog = this;
  var controller = this.controller;
  var preferences = this.preferences;

  var defaultRadio = this.findElement("[name='color-and-texture-checkbox'][value='DEFAULT']");
  var invisibleRadio = this.findElement("[name='color-and-texture-checkbox'][value='INVISIBLE']");
  var colorRadio = this.findElement("[name='color-and-texture-checkbox'][value='COLOR']");
  var textureRadio = this.findElement("[name='color-and-texture-checkbox'][value='TEXTURE']");

  /**
   * @param {function(HomeMaterial, index): HomeMaterial} materialCreator
   */
  var modifySelectedMaterials = function(materialCreator) {
      var selectedIndices = dialog.materialsList.getSelectedIndices();
      for (var i = 0; i < selectedIndices.length; i++) {
        var index = selectedIndices[i];
        var material = dialog.materialsList.getMaterialAtIndex(index);
        dialog.materialsList.setMaterialAt(
            materialCreator(material, index),
            index);
      }
    };
  
  // Listen to click events on radio buttons rather than change events 
  // to avoid firing events when checked state is set internaly 
  this.registerEventListener(defaultRadio, "click", function(ev) {
      if (!this.disabled && this.checked) {
        modifySelectedMaterials(function(material) {
            return new HomeMaterial(material.getName(), null, null, material.getShininess());
          });
      }
    });
  
  this.registerEventListener(invisibleRadio, "click", function(ev) {
      if (!this.disabled && this.checked) {
        modifySelectedMaterials(function(material) {
            return new HomeMaterial(material.getName(), 0, null, material.getShininess());
          });
      }
    });

  var colorChoiceChangeListener = function() {
      if (!colorRadio.disabled && colorRadio.checked) {
        modifySelectedMaterials(function(material, index) {
            var defaultMaterial = dialog.materialsList.getDefaultMaterialAtIndex(index);
            var color = defaultMaterial.getColor() != colorSelector.getColor() || defaultMaterial.getTexture() != null
                ? colorSelector.getColor()
                : null;
            return new HomeMaterial(material.getName(), color, null, material.getShininess());
          });
      }
    };
  var colorSelector = new JSColorSelectorButton(preferences, null, 
      {
        colorChanged: function(selectedColor) {
          if (selectedColor != null) {
            colorRadio.checked = true;
            colorChoiceChangeListener();
          }
        }
      });
  this.registerEventListener(colorRadio, "click", function(ev) {
      if (colorRadio.checked) {
        colorChoiceChangeListener();
      }
    });
  this.attachChildComponent("color-selector-button", colorSelector);

  var textureChoiceChangeListener = function() {
      if (!textureRadio.disabled && textureRadio.checked) {
        modifySelectedMaterials(function(material, index) {
            var defaultTexture = dialog.materialsList.getDefaultMaterialAtIndex(index).getTexture();
            var texture = defaultTexture != controller.getTextureController().getTexture()
                ? controller.getTextureController().getTexture()
                : null;
            return new HomeMaterial(material.getName(), null, texture, material.getShininess());
          });
      }
    };
  var textureSelector = controller.getTextureController().getView();
  textureSelector.textureChanged = function(texture) {
      if (texture != null) {
        textureRadio.checked = true;
        textureChoiceChangeListener();
      }
    };
  this.registerEventListener(textureRadio, "click", function(ev) {
      if (textureRadio.checked) {
        textureChoiceChangeListener();
      }
    });
  controller.getTextureController().addPropertyChangeListener("TEXTURE", function(ev) {
      if (ev.getNewValue() != null) {
        if (!textureRadio.checked) {
          textureRadio.checked = true;
        }
        textureChoiceChangeListener();
      }
    });
  this.attachChildComponent("texture-selector-button", textureSelector);

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
  this.shininessSlider = this.getElement("shininess-slider");

  var shininessList = this.findElement("#model-materials-shininess-list");
  for (var i = 0; i <= 128; i+= 16) {
    var option = document.createElement("option");
    option.value = i;
    shininessList.appendChild(option);
  }

  this.registerEventListener(this.shininessSlider, "input", function(ev) {
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
  this.colorAndTexturePanel.textureSelector.setEnabled(!selectionEmpty);
  this.colorAndTexturePanel.colorRadio.disabled = selectionEmpty;
  this.colorAndTexturePanel.colorSelector.setEnabled(!selectionEmpty);

  this.shininessSlider.disabled = selectionEmpty;
}

