/*
 * JSViewFactory.js
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

// Requires SweetHome3D.js
// Requires UserPreferences.js
// Requires FurnitureCatalogListPanel.js
// Requires PlanComponent.js
// Requires HomeComponent3D.js
// Requires HomePane.js

/**
 * A view default factory that is use to create all the views in the application.
 * @constructor
 * @author Emmanuel Puybaret
 * @author Renaud Pawlak
 */
function JSViewFactory(application) {
  this.application = application;
}
JSViewFactory.prototype = Object.create(JSViewFactory.prototype);
JSViewFactory.prototype.constructor = JSViewFactory;

JSViewFactory['__class'] = "JSViewFactory";
JSViewFactory['__interfaces'] = ["com.eteks.sweethome3d.viewcontroller.ViewFactory"];

JSViewFactory.dummyDialogView = {
  displayView: function(parent) { }
};

JSViewFactory.prototype.createFurnitureCatalogView = function(catalog, preferences, furnitureCatalogController) {
  return new FurnitureCatalogListPanel("furniture-catalog", catalog, preferences, furnitureCatalogController);
}

JSViewFactory.prototype.createFurnitureView = function(home, preferences, furnitureController) {
  return null;
}

JSViewFactory.prototype.createPlanView = function(home, preferences, planController) {
  return new PlanComponent("home-plan", home, preferences, planController);
}

JSViewFactory.prototype.createView3D = function(home, preferences, homeController3D) {
  return new HomeComponent3D("home-3D-view", home, preferences, null, homeController3D);
}

JSViewFactory.prototype.createHomeView = function(home, preferences, homeController) {
  return new HomePane("home-pane", home, preferences, homeController);
}

/**
 * Returns a new view that displays a wizard.
 * @param {UserPreferences} preferences the current user preferences
 * @param {WizardController} controller wizard's controller
 */
JSViewFactory.prototype.createWizardView = function(preferences, controller) {
  return new JSWizardDialog(this, controller, preferences, 
    controller.getTitle() || '${WizardPane.wizard.title}', 
    {
      initializer: function(dialog) {
        controller.addPropertyChangeListener('TITLE', function(event) {
          dialog.setTitle(controller.getTitle());
        });
      },
      applier: function(dialog) {
      },
      disposer: function(dialog) {
      },
    }
  );
}

JSViewFactory.prototype.createBackgroundImageWizardStepsView = function(backgroundImage, preferences, backgroundImageWizardController) {
  return null;
}

JSViewFactory.prototype.createImportedFurnitureWizardStepsView = function(piece, modelName, importHomePiece, preferences, importedFurnitureWizardController) {
  return null;
}

/**
 * 
 * @param {CatalogTexture} texture 
 * @param {string} textureName 
 * @param {UserPreferences} preferences 
 * @param {ImportedTextureWizardController} controller 
 * 
 * @return {JSComponentView & { updateStep: function() }}
 */
JSViewFactory.prototype.createImportedTextureWizardStepsView = function(texture, textureName, preferences, controller) {
  var viewFactory = this;

  var LARGE_IMAGE_PIXEL_COUNT_THRESHOLD = 640 * 640;
  var IMAGE_PREFERRED_MAX_SIZE = 512;
  var LARGE_IMAGE_MAX_PIXEL_COUNT = IMAGE_PREFERRED_MAX_SIZE * IMAGE_PREFERRED_MAX_SIZE;

  function onImageLoadingError(error) {
    console.warn('error loading image: ' + error);
    alert(ResourceAction.getLocalizedLabelText(
      dialog.preferences,
      'ImportedTextureWizardStepsPanel', 
      'imageChoiceErrorLabel.text'));
  }

  function doesCanvasHaveAlpha(context, canvas) {
    var data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    var hasAlphaPixels = false;
    for (var i = 3, n = data.length; i < n; i+=4) {
        if (data[i] < 255) {
            hasAlphaPixels = true;
            break;
        }
    }
    return hasAlphaPixels;
  }

  var stepsView = new JSComponentView(
    this,
    preferences, 
    '<div imageStep>' + 
    '  <div>${ImportedTextureWizardStepsPanel.imageChangeLabel.text}</div>' +
    '  <div class="buttons">' +
    '    <button changeImage>${ImportedTextureWizardStepsPanel.imageChangeButton.text}</button>' +
    '    <button onclick="window.open(\'http://www.sweethome3d.com/fr/importTextures.jsp\', \'_blank\')">${ImportedTextureWizardStepsPanel.findImagesButton.text}</button>' +
    '    <input type="file" accept="image/*" style="display: none" /> ' +
    '  </div>' +
    '  <div preview>' +
    '  </div>' +
    '</div>' +
    '<div attributesStep>' +
    '  <div description></div>' +
    '  <div form> ' +
    '    <div preview> ' +
    '      <img /> ' +
    '    </div> ' +
    '    <div>${ImportedTextureWizardStepsPanel.nameLabel.text}</div> ' +
    '    <div>' +
    '      <input type="text" name="name" />' +
    '    </div> ' +
    '    <div>${ImportedTextureWizardStepsPanel.categoryLabel.text}</div> ' +
    '    <div>' +
    '      <select name="category"></select>' +
    '    </div> ' +
    '    <div>${ImportedTextureWizardStepsPanel.creatorLabel.text}</div> ' +
    '    <div>' +
    '      <input type="text" name="creator" />' +
    '    </div> ' +
    '    <div widthLabel></div> ' +
    '    <div>' +
    '      <input type="number" name="width" min="0.5" max="100000" step="0.5" />' +
    '    </div> ' +
    '    <div heightLabel></div> ' +
    '    <div>' +
    '      <input type="number" name="height" min="0.5" max="100000" step="0.5" />' +
    '    </div> ' +

    '  </div>' +
    '</div>', 
    {
      initializer: function(component) {
        component.controller = controller;
        component.rootNode.classList.add('imported-texture-wizard');

        component.imageStepPanel = component.findElement('[imageStep]');
        component.changeImageButton = component.findElement('button[changeImage]');
        component.imageChooserInput = component.findElement('input[type="file"]');
        component.previewPanel = component.findElement('[preview]');

        component.attributesStepPanel = component.findElement('[attributesStep]');
        component.attributesStepPanelDescription = component.findElement('[attributesStep] [description]');
        
        component.attributesPreviewPanel = component.findElement('[attributesStep] [preview]');
        
        component.nameInput = component.findElement('input[name="name"]');
        component.categorySelect = component.findElement('select[name="category"]');
        component.creatorInput = component.findElement('input[name="creator"]');
        
        component.findElement('[widthLabel]').textContent = component.getLocalizedLabelText(
          'ImportedTextureWizardStepsPanel', 'widthLabel.text', component.preferences.getLengthUnit().getName()
        );
        component.widthInput = component.findElement('input[name="width"]');
        component.findElement('[heightLabel]').textContent = component.getLocalizedLabelText(
          'ImportedTextureWizardStepsPanel', 'heightLabel.text', component.preferences.getLengthUnit().getName()
        );
        component.heightInput = component.findElement('input[name="height"]');
        
        component.registerEventListener(component.changeImageButton, 'click', function() {
          component.imageChooserInput.click();
        });
        
        component.registerEventListener(component.imageChooserInput, 'input', function() {
          var file = component.imageChooserInput.files[0];
          if (!file) {
            component.onImageSelected(null);
          }
          
          var reader = new FileReader();
          reader.onload = function(event) {
            var image = new Image();
            image.onload = function () {
              component.onImageSelected(image);
            };
            image.onerror = onImageLoadingError;
            image.src = event.target.result;  
          };
          reader.onerror = onImageLoadingError;
          reader.readAsDataURL(file);
        });

        controller.addPropertyChangeListener('STEP', function(event) {
          component.updateStep();
        });
        controller.addPropertyChangeListener('IMAGE', function(event) {
          component.updateImagePreviews();
        });
        controller.addPropertyChangeListener('WIDTH', function(event) {
          component.updateImagePreviews();
        });
        controller.addPropertyChangeListener('HEIGHT', function(event) {
          component.updateImagePreviews();
        });

        var categories = this.preferences.getTexturesCatalog().getCategories();
        for (var i = 0; i < categories.length; i++) {
          var option = document.createElement('option');
          option.value = categories[i].getName();
          option.textContent = categories[i].getName();
          option._category = categories[i];
          component.categorySelect.appendChild(option);
        }

        component.attributesStepPanelDescription.innerHTML = component.getLocalizedLabelText(
          'ImportedTextureWizardStepsPanel',
          'attributesLabel.text')
          .replace('<html>', '');
        controller.addPropertyChangeListener('NAME', function() {
          if (component.nameInput.value.trim() != controller.getName()) {
            component.nameInput.value = controller.getName();
          }
        });
        component.registerEventListener(
          component.nameInput, 'change', function() {
            controller.setName(component.nameInput.value.trim());
          }
        );

        controller.addPropertyChangeListener('CATEGORY', function() {
          var category = controller.getCategory();
          if (category != null) {
            component.categorySelect.value = category.getName();
          }
        });
        component.registerEventListener(
          component.categorySelect, 'change', function(event) {
            var category = component.categorySelect.item(component.categorySelect.selectedIndex)._category;
            controller.setCategory(category);
          }
        );

        controller.addPropertyChangeListener('CREATOR', function() {
          if (component.creatorInput.value.trim() != controller.getCreator()) {
            component.creatorInput.value = controller.getCreator();
          }
        });
        component.registerEventListener(
          component.creatorInput, 'change', function(event) {
            controller.setCreator(component.creatorInput.value.trim());
          }
        );

        controller.addPropertyChangeListener('WIDTH', function() {
          component.widthInput.value = controller.getWidth();
        });
        component.registerEventListener(
          component.widthInput, 'change', function(event) {
            controller.setWidth(parseFloat(component.widthInput.value));
          }
        );

        controller.addPropertyChangeListener('HEIGHT', function() {
          component.heightInput.value = controller.getHeight();
        });
        component.registerEventListener(
          component.heightInput, 'change', function(event) {
            controller.setHeight(parseFloat(component.heightInput.value));
          }
        );
      }
    });

  /**
   * @param {HTMLImageElement?} image 
   * @private
   */
  stepsView.onImageSelected = function (image) {
    console.info('image selected', image);
    if (image != null) {

      this.promptImageResize(image, function(image) {
        this.controller.setImage(image);
        this.controller.setName('My texture name');
        var userCategory = new TexturesCategory(this.getLocalizedLabelText('ImportedTextureWizardStepsPanel', 'userCategory'));
        var categories = this.preferences.getTexturesCatalog().getCategories();
        for (var i = 0; i < categories.length; i++) {
          if (categories[i].equals(userCategory)) {
            userCategory = categories[i];
            break;
          }
        }
        this.controller.setCategory(userCategory);
        this.controller.setCreator(null);
        var defaultWidth = 20;
        var lengthUnit = this.preferences.getLengthUnit();
        if (lengthUnit == LengthUnit.INCH || lengthUnit == LengthUnit.INCH_DECIMALS) {
          defaultWidth = LengthUnit.inchToCentimeter(8);
        }
        this.controller.setWidth(defaultWidth);
        this.controller.setHeight(defaultWidth / image.width * image.height);
      });

    } else {
      this.controller.setImage(null);
      onImageLoadingError('image is null');
    }
  }

  /**
   * @param {string} message message to be displayed
   * @param {function()} onResizeOptionSelected called when user selected "resize image" option
   * @param {function()} onKeepSizeOptionSelected called when user selected "keep image unchanged" option
   */
  function JSPromptImageResizeDialog(message, onResizeOptionSelected, onKeepSizeOptionSelected) {
    this.controller = controller;
    
    JSDialogView.call(
      this, 
      viewFactory, 
      preferences, 
      '${ImportedTextureWizardStepsPanel.reduceImageSize.title}', 
      '<div>' +
      message +
      '</div>',
      {
        initializer: function(dialog) {},
        applier: function(dialog) {
          if (dialog.resizeRequested) {
            onResizeOptionSelected();
          } else {
            onKeepSizeOptionSelected();
          }
        },
      });
  }
  JSPromptImageResizeDialog.prototype = Object.create(JSDialogView.prototype);
  JSPromptImageResizeDialog.prototype.constructor = JSPromptImageResizeDialog;
  
  /**
   * Append dialog buttons to given panel
   * @param {HTMLElement} buttonsPanel Dialog buttons panel
   * @protected
   */
  JSPromptImageResizeDialog.prototype.appendButtons = function(buttonsPanel) {
    
    buttonsPanel.innerHTML = JSComponentView.substituteWithLocale(this.preferences, 
      '<button class="dialog-cancel-button">${ImportedTextureWizardStepsPanel.reduceImageSize.cancel}</button>' + 
      '<button class="keep-image-unchanged-button dialog-ok-button">${ImportedTextureWizardStepsPanel.reduceImageSize.keepUnchanged}</button>' + 
      '<button class="dialog-ok-button">${ImportedTextureWizardStepsPanel.reduceImageSize.reduceSize}</button>'
    );

    var dialog = this;

    var cancelButton = this.findElement('.dialog-cancel-button');
    this.registerEventListener(cancelButton, 'click', function() {
      dialog.cancel();
    });
    var okButtons = this.findElements('.dialog-ok-button');
    this.registerEventListener(okButtons, 'click', function(event) {
      dialog.resizeRequested = !event.target.classList.contains('keep-image-unchanged-button');
      dialog.validate();
    });
  };

  /**
   * @param {HTMLImageElement} image 
   * @param {function(HTMLImageElement)} callback function called after resize with resized image (or with original image if resize was not necessary or declined by user)
   * @private
   */
  stepsView.promptImageResize = function (image, callback) {
    if (image.width * image.height < LARGE_IMAGE_PIXEL_COUNT_THRESHOLD) {
      callback.call(this, image);
      return;
    }

    var factor;
    var ratio = image.width / image.height;
    if (ratio < 0.5 || ratio > 2) {
      factor = Math.sqrt(LARGE_IMAGE_MAX_PIXEL_COUNT / (image.width * image.height));
    } else if (ratio < 1) {
      factor = IMAGE_PREFERRED_MAX_SIZE / image.height;
    } else {
      factor = IMAGE_PREFERRED_MAX_SIZE / image.width;
    }

    var reducedWidth = Math.round(image.width * factor);
    var reducedHeight = Math.round(image.height * factor);
    var promptDialog = new JSPromptImageResizeDialog(
      stepsView.getLocalizedLabelText(
        'ImportedTextureWizardStepsPanel', 'reduceImageSize.message', [image.width, image.height, reducedWidth, reducedHeight]
      ),
      function onResizeRequested() {
        var canvas = document.createElement('canvas');
        canvas.width = reducedWidth;
        canvas.height = reducedHeight;
        var canvasContext = canvas.getContext('2d');
        canvasContext.drawImage(image, 0, 0, reducedWidth, reducedHeight);
        console.log(canvasContext.getImageData(1, 1, 1, 1).data[3], canvasContext.getImageData(1, 1, 1, 1).data[2]);
        console.log(canvasContext.getImageData(0, 0, 1, 1).data[3], canvasContext.getImageData(0, 0, 1, 1).data[2]);

        var resizedImage = new Image();
        resizedImage.onload = function() {
          callback.call(stepsView, resizedImage);
        }
        resizedImage.src = canvas.toDataURL(doesCanvasHaveAlpha(canvasContext, canvas) ? "image/png" : "image/jpeg");
      },
      function onKeepUnchangedRequested() { callback.call(stepsView, image) }
    );
    promptDialog.displayView();
  }

  /**
   * @private
   */
  stepsView.updateImagePreviews = function() {
    this.previewPanel.innerHTML = '';
    if (this.controller.getImage() == null) {
      return;
    }

    var image = this.controller.getImage().cloneNode(true);
    delete image.width;
    delete image.height;
    this.previewPanel.appendChild(image);
    
    this.attributesPreviewPanel.innerHTML = '';
    var previewImage = document.createElement('div');
    previewImage.style.backgroundImage = "url('" + image.src + "')";
    previewImage.style.backgroundRepeat = 'repeat';

    var widthFactor = this.controller.getWidth() / 250;
    var heightFactor = this.controller.getHeight() / 250;
    previewImage.style.backgroundSize = 'calc(100% * ' + widthFactor + ') calc(100% * ' + heightFactor + ')';  
    previewImage.classList.add('image');
    this.attributesPreviewPanel.appendChild(previewImage);
  };

  /**
   * change displayed view based on current step
   */
  stepsView.updateStep = function() {
    var step = this.controller.getStep();
    console.info("update step to " + step);
    switch (step) {
      case ImportedTextureWizardController.Step.IMAGE:
        this.imageStepPanel.style.display = 'block';
        this.attributesStepPanel.style.display = 'none';
        break;
      case ImportedTextureWizardController.Step.ATTRIBUTES:
        this.imageStepPanel.style.display = 'none';
        this.attributesStepPanel.style.display = 'block';
        break;
    }
  };

  return stepsView;
}

/**
 * @param {UserPreferences} preferences 
 * @param {UserPreferencesController} controller 
 */
JSViewFactory.prototype.createUserPreferencesView = function(preferences, controller) {
  var viewFactory = this;

  /**
   * @param {string} value option's value
   * @param {string} text option's display text
   * @param {boolean} [selected] true if selected, default false
   * @return {HTMLOptionElement}
   * @private
   */
  function createOptionElement(value, text, selected) {
    var option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    if (selected !== undefined) {
      option.selected = selected;
    }
    return option;
  }

  /**
   * @param {HTMLElement} element 
   * @return {boolean} true if element is displayed (not hidden by css rule)
   * @private
   */
  function isElementVisible(element) {
    return window.getComputedStyle(element).display !== "none";
  }

  /**
   * Hides a preference row from any of its input element
   * @param {HTMLElement} preferenceInput 
   */
  function disablePreferenceRow(preferenceInput) {
    preferenceInput.parentElement.style.display = 'none';

    // searches root input cell
    var currentElement = preferenceInput;
    while (currentElement.parentElement != null && !currentElement.parentElement.classList.contains('user-preferences-dialog')) {
      currentElement = currentElement.parentElement;
    }

    // hides input cell and its sibling label cell
    currentElement.style.display = 'none';
    currentElement.previousElementSibling.style.display = 'none';
  }

  return new JSDialogView(viewFactory, preferences, 
    '${UserPreferencesPanel.preferences.title}', 
    document.getElementById("user-preferences-dialog-template"), {
      initializer: function(dialog) {

        /** LANGUAGE */
        dialog.languageSelect = dialog.getElement('language-select');
        var languageEnabled = controller.isPropertyEditable('LANGUAGE');
        if (languageEnabled) {
          var supportedLanguages = preferences.getSupportedLanguages();
          for (var i = 0; i < supportedLanguages.length; i++) {
            var languageCode = supportedLanguages[i].replace('_', '-');
            var languageDisplayName = languageCode;
            try {
              languageDisplayName = new Intl.DisplayNames([languageCode, 'en'], { type: 'language' }).of(languageCode);
            } catch (e) {
              console.warn('cannot find ' + languageCode + ' display name - ' + e); 
            }

            var selected = languageCode == controller.getLanguage();
            var languageOption = createOptionElement(languageCode, CoreTools.capitalize(languageDisplayName), selected);
            dialog.languageSelect.append(languageOption);
          }
        } else {
          disablePreferenceRow(dialog.languageSelect);
        }

        /** UNIT */
        dialog.unitSelect = dialog.getElement('unit-select');
        var unitEnabled = controller.isPropertyEditable('UNIT');
        if (unitEnabled) {
          dialog.unitSelect.append(
            createOptionElement(
              'MILLIMETER', 
              preferences.getLocalizedString('UserPreferencesPanel', "unitComboBox.millimeter.text"),
              controller.getUnit() == LengthUnit.MILLIMETER
            )
          );
          dialog.unitSelect.append(
            createOptionElement(
              'CENTIMETER', 
              preferences.getLocalizedString('UserPreferencesPanel', "unitComboBox.centimeter.text"),
              controller.getUnit() == LengthUnit.CENTIMETER
            )
          );
          dialog.unitSelect.append(
            createOptionElement(
              'METER', 
              preferences.getLocalizedString('UserPreferencesPanel', "unitComboBox.meter.text"),
              controller.getUnit() == LengthUnit.METER
            )
          );
          dialog.unitSelect.append(
            createOptionElement(
              'INCH', 
              preferences.getLocalizedString('UserPreferencesPanel', "unitComboBox.inch.text"),
              controller.getUnit() == LengthUnit.INCH
            )
          );
          dialog.unitSelect.append(
            createOptionElement(
              'INCH_DECIMALS', 
              preferences.getLocalizedString('UserPreferencesPanel', "unitComboBox.inchDecimals.text"),
              controller.getUnit() == LengthUnit.INCH_DECIMALS
            )
          );
        } else {
          disablePreferenceRow(dialog.unitSelect);
        }

        /** CURRENCY */
        dialog.currencySelect = dialog.getElement('currency-select');
        var currencyEnabled = controller.isPropertyEditable('CURRENCY');
        // TODO LOUIS how to retrieve currencies to match java ones
        disablePreferenceRow(dialog.currencySelect);
        
        /** FURNITURE CATALOG VIEW */
        dialog.furnitureCatalogViewTreeRadio = dialog.findElement('[name="furniture-catalog-view-radio"][value="tree"]');
        var furnitureCatalogViewEnabled = controller.isPropertyEditable('FURNITURE_CATALOG_VIEWED_IN_TREE');
        if (furnitureCatalogViewEnabled) {
          var selectedFurnitureCatalogView = controller.isFurnitureCatalogViewedInTree() ? 'tree' : 'list';
          dialog.findElement('[name="furniture-catalog-view-radio"][value="' + selectedFurnitureCatalogView + '"]').checked = true;
        } else {
          disablePreferenceRow(dialog.furnitureCatalogViewTreeRadio);
        }

        /** NAVIGATION PANEL VISIBLE */
        var navigationPanelEnabled = controller.isPropertyEditable('NAVIGATION_PANEL_VISIBLE');
        dialog.navigationPanelCheckbox = dialog.getElement('navigation-panel-checkbox');
        if (navigationPanelEnabled) {
          dialog.navigationPanelCheckbox.checked = controller.isNavigationPanelVisible();
        } else {
          disablePreferenceRow(dialog.navigationPanelCheckbox);
        }
        
        /** AERIAL VIEW CENTERED ON SELECTION */
        var aerialViewCenteredOnSelectionEnabled = controller.isPropertyEditable('AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED');
        dialog.aerialViewCenteredOnSelectionCheckbox = dialog.getElement('aerial-view-centered-on-selection-checkbox');
        if (aerialViewCenteredOnSelectionEnabled) {
          dialog.aerialViewCenteredOnSelectionCheckbox.checked = controller.isAerialViewCenteredOnSelectionEnabled();
        } else {
          disablePreferenceRow(dialog.aerialViewCenteredOnSelectionCheckbox);
        }
        
        /** OBSERVER CAMERA SELECTED AT CHANGE */
        var observerCameraSelectedAtChangeEnabled = controller.isPropertyEditable('OBSERVER_CAMERA_SELECTED_AT_CHANGE');
        dialog.observerCameraSelectedAtChangeCheckbox = dialog.getElement('observer-camera-selected-at-change-checkbox');
        if (observerCameraSelectedAtChangeEnabled) {
          dialog.observerCameraSelectedAtChangeCheckbox.checked = controller.isObserverCameraSelectedAtChange();
        } else {
          disablePreferenceRow(dialog.observerCameraSelectedAtChangeCheckbox);
        }
        
        /** MAGNETISM */
        var magnetismEnabled = controller.isPropertyEditable('MAGNETISM_ENABLED');
        dialog.magnetismCheckbox = dialog.getElement('magnetism-checkbox');
        if (magnetismEnabled) {
          dialog.magnetismCheckbox.checked = controller.isMagnetismEnabled();
        } else {
          disablePreferenceRow(dialog.magnetismCheckbox);
        }
        
        /** RULERS */
        var rulersEnabled = controller.isPropertyEditable('RULERS_VISIBLE');
        dialog.rulersCheckbox = dialog.getElement('rulers-checkbox');
        if (rulersEnabled) {
          dialog.rulersCheckbox.checked = controller.isRulersVisible();
        } else {
          disablePreferenceRow(dialog.rulersCheckbox);
        }
        
        /** GRID */
        var gridEnabled = controller.isPropertyEditable('GRID_VISIBLE');
        dialog.gridCheckbox = dialog.getElement('grid-checkbox');
        if (gridEnabled) {
          dialog.gridCheckbox.checked = controller.isGridVisible();
        } else {
          disablePreferenceRow(dialog.gridCheckbox);
        }

        /** FURNITURE ICON */
        dialog.iconTopViewRadio = dialog.findElement('[name="furniture-icon-radio"][value="topView"]');
        dialog.iconSizeSelect = dialog.getElement('icon-size-select');
        var furnitureIconEnabled = controller.isPropertyEditable('FURNITURE_VIEWED_FROM_TOP');
        if (furnitureIconEnabled) {
          var selectedIconMode = controller.isFurnitureViewedFromTop() ? 'topView' : 'catalog';
          dialog.findElement('[name="furniture-icon-radio"][value="' + selectedIconMode + '"]').checked = true;

          var iconSizes = [128, 256, 512 ,1024];
          for (var i = 0; i < iconSizes.length; i++) {
            var size = iconSizes[i];
            dialog.iconSizeSelect.append(
              createOptionElement(
                size, 
                size + '×' + size,
                controller.getFurnitureModelIconSize() == size
              )
            );
          }

          /**
           * Called when furniture icon mode is selected, in order to enable icon size if necessary
           * @private
           */
          function onIconModeSelected(dialog) {
            dialog.iconSizeSelect.disabled = !dialog.iconTopViewRadio.checked;
          }

          onIconModeSelected(dialog);

          dialog.registerEventListener(dialog.findElements('[name="furniture-icon-radio"]'), 'change', function() {
            onIconModeSelected(dialog);
          });
        } else {
          disablePreferenceRow(dialog.iconTopViewRadio);
        }

        /** ROOM RENDERING */
        dialog.roomRenderingFloorColorOrTextureRadio = dialog.findElement('[name="room-rendering-radio"][value="floorColorOrTexture"]');
        var roomRenderingEnabled = controller.isPropertyEditable('ROOM_FLOOR_COLORED_OR_TEXTURED');
        if (roomRenderingEnabled) {
          var roomRenderingValue = controller.isRoomFloorColoredOrTextured() ? 'floorColorOrTexture' : 'monochrome';
          dialog.findElement('[name="room-rendering-radio"][value="' + roomRenderingValue + '"]').checked = true;
        } else {
          disablePreferenceRow(dialog.roomRenderingFloorColorOrTextureRadio);
        }

        /** NEW WALL THICKNESS */
        var newWallThicknessEnabled = controller.isPropertyEditable('NEW_WALL_THICKNESS');
        dialog.newWallThicknessInput = dialog.getElement('new-wall-thickness-input');
        if (newWallThicknessEnabled) {
          dialog.newWallThicknessInput.value = controller.getNewWallThickness();
        } else {
          disablePreferenceRow(dialog.newWallThicknessInput);
        }

        /** NEW WALL HEIGHT */
        var newWallHeightEnabled = controller.isPropertyEditable('NEW_WALL_HEIGHT');
        dialog.newWallHeightInput = dialog.getElement('new-wall-height-input');
        if (newWallHeightEnabled) {
          dialog.newWallHeightInput.value = controller.getNewWallHeight();
        } else {
          disablePreferenceRow(dialog.newWallHeightInput);
        }

        /** NEW FLOOR THICKNESS */
        var newFloorThicknessEnabled = controller.isPropertyEditable('NEW_FLOOR_THICKNESS');
        dialog.newFloorThicknessInput = dialog.getElement('new-floor-thickness-input');
        if (newFloorThicknessEnabled) {
          dialog.newFloorThicknessInput.value = controller.getNewFloorThickness();
        } else {
          disablePreferenceRow(dialog.newFloorThicknessInput);
        }

      },
      applier: function(dialog) {
        if (isElementVisible(dialog.languageSelect)) {
          var selectedLanguageOption = dialog.languageSelect.selectedOptions[0];
          controller.setLanguage(selectedLanguageOption == null ? null : selectedLanguageOption.value);
        }
        if (isElementVisible(dialog.unitSelect)) {
          var selectedUnitOption = dialog.unitSelect.selectedOptions[0];
          controller.setUnit(selectedUnitOption == null ? null : LengthUnit[selectedUnitOption.value]);
        }
        if (isElementVisible(dialog.currencySelect)) {
          var selectedCurrencyOption = dialog.currencySelect.selectedOptions[0];
          controller.setCurrency(selectedCurrencyOption == null ? null : selectedCurrencyOption.value);
        }
        if (isElementVisible(dialog.furnitureCatalogViewTreeRadio)) {
          controller.setFurnitureCatalogViewedInTree(dialog.furnitureCatalogViewTreeRadio.checked);
        }
        if (isElementVisible(dialog.navigationPanelCheckbox)) {
          controller.setNavigationPanelVisible(dialog.navigationPanelCheckbox.checked);
        }
        if (isElementVisible(dialog.aerialViewCenteredOnSelectionCheckbox)) {
          controller.setAerialViewCenteredOnSelectionEnabled(dialog.aerialViewCenteredOnSelectionCheckbox.checked);
        }
        if (isElementVisible(dialog.observerCameraSelectedAtChangeCheckbox)) {
          controller.setObserverCameraSelectedAtChange(dialog.observerCameraSelectedAtChangeCheckbox.checked);
        }
        if (isElementVisible(dialog.magnetismCheckbox)) {
          controller.setMagnetismEnabled(dialog.magnetismCheckbox.checked);
        }
        if (isElementVisible(dialog.rulersCheckbox)) {
          controller.setRulersVisible(dialog.rulersCheckbox.checked);
        }
        if (isElementVisible(dialog.gridCheckbox)) {
          controller.setGridVisible(dialog.gridCheckbox.checked);
        }
        if (isElementVisible(dialog.iconTopViewRadio)) {
          controller.setFurnitureViewedFromTop(dialog.iconTopViewRadio.checked);
        }
        if (isElementVisible(dialog.iconSizeSelect) && !dialog.iconSizeSelect.disabled) {
          controller.setFurnitureModelIconSize(parseInt(dialog.iconSizeSelect.value));
        }
        if (isElementVisible(dialog.roomRenderingFloorColorOrTextureRadio)) {
          controller.setRoomFloorColoredOrTextured(dialog.roomRenderingFloorColorOrTextureRadio.checked);
        }
        if (isElementVisible(dialog.newWallThicknessInput)) {
          controller.setNewWallThickness(parseFloat(dialog.newWallThicknessInput.value));
        }
        if (isElementVisible(dialog.newWallHeightInput)) {
          controller.setNewWallHeight(parseFloat(dialog.newWallHeightInput.value));
        }
        if (isElementVisible(dialog.newFloorThicknessInput)) {
          controller.setNewFloorThickness(parseFloat(dialog.newFloorThicknessInput.value));
        }
        controller.modifyUserPreferences();
      },
      disposer: function(dialog) {
      }
    }
  );
}

JSViewFactory.prototype.createLevelView = function(preferences, levelController) {
  return dummyDialogView;
}

/**
 * 
 * @param {UserPreferences} preferences 
 * @param {HomeFurnitureController} homeFurnitureController 
 */
JSViewFactory.prototype.createHomeFurnitureView = function(preferences, homeFurnitureController) {
  var FurniturePaint = HomeFurnitureController.FurniturePaint;
  var viewFactory = this;
  
  return new JSDialogView(viewFactory, preferences, 
    '${HomeFurniturePanel.homeFurniture.title}', 
    document.getElementById("home-furniture-dialog-template"), {
      initializer: function(dialog) {
        dialog.colorSelector = viewFactory.createColorSelector(preferences, {
          onColorSelected: function(color) {
            dialog.radioButtons[FurniturePaint.COLORED].checked = true;
            homeFurnitureController.setPaint(FurniturePaint.COLORED);
            homeFurnitureController.setColor(color);
          }
        });
        dialog.attachChildComponent('color-selector-button', dialog.colorSelector)
        dialog.colorSelector.set(homeFurnitureController.getColor());
    
        dialog.textureSelector = homeFurnitureController.getTextureController().getView();
        dialog.textureSelector.onTextureSelected = function(texture) {
          dialog.radioButtons[FurniturePaint.TEXTURED].checked = true;
          homeFurnitureController.setPaint(FurniturePaint.TEXTURED);
          homeFurnitureController.getTextureController().setTexture(texture);
        };
        dialog.attachChildComponent('texture-selector-button', dialog.textureSelector);
        dialog.textureSelector.set(homeFurnitureController.getTextureController().getTexture());
        
        var selectedPaint = homeFurnitureController.getPaint();
  
        dialog.radioButtons = [];
        dialog.radioButtons[FurniturePaint.DEFAULT] = dialog.findElement('[name="furniture-color-and-texture-choice"][value="default"]');
        dialog.radioButtons[FurniturePaint.COLORED] = dialog.findElement('[name="furniture-color-and-texture-choice"][value="color"]');
        dialog.radioButtons[FurniturePaint.TEXTURED] = dialog.findElement('[name="furniture-color-and-texture-choice"][value="texture"]');
        
        for (var paint = 0; paint < dialog.radioButtons.length; paint++) {
          var radioButton = dialog.radioButtons[paint];
          radioButton.checked = paint == selectedPaint 
            || (paint == FurniturePaint.DEFAULT && !dialog.radioButtons[selectedPaint]);
        }
  
        dialog.registerEventListener(
          dialog.radioButtons, 
          'change', 
          function(event) { 
            var paint = dialog.radioButtons.indexOf(event.target);
            homeFurnitureController.setPaint(paint);
          });
      },
      applier: function() {
        homeFurnitureController.modifyFurniture();
      },
      disposer: function(dialog) {
        dialog.colorSelector.dispose();
        dialog.textureSelector.dispose();
      }
    }
  );
}

JSViewFactory.prototype.createWallView = function(preferences, wallController) {

  var viewFactory = this;

  return new JSDialogView(viewFactory, preferences, 
    '${WallPanel.wall.title}', 
    document.getElementById("wall-dialog-template"), {
      initializer: function(dialog) {

        // Find which wall side is the closest to the pointer location
        var home = wallController.home;
        var planController = application.getHomeController(home).getPlanController();
        var x = planController.getXLastMousePress();
        var y = planController.getYLastMousePress();
        var wall = home.getSelectedItems()[0];
        var points = wall.getPoints();
        var leftMinDistance = Number.MAX_VALUE;
        for (var i = points.length / 2 - 1; i > 0; i--) {
          leftMinDistance = Math.min(leftMinDistance,
            java.awt.geom.Line2D.ptLineDistSq(points[i][0], points[i][1], points[i - 1][0], points[i - 1][1], x, y))
        }
        var rightMinDistance = Number.MAX_VALUE;
        for (var i = points.length / 2; i < points.length - 1; i++) {
          rightMinDistance = Math.min(rightMinDistance,
            java.awt.geom.Line2D.ptLineDistSq(points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], x, y))
        }
        var leftSide = leftMinDistance < rightMinDistance;

        dialog.findElement(leftSide ? ".column1" : ".column2").classList.add("selected");

        var selectedLeftSidePaint = dialog.findElement('[name="left-side-color-and-texture-choice"][value="'
          + WallController.WallPaint[wallController.getLeftSidePaint()]
          + '"]');
        if (selectedLeftSidePaint != null) {
          selectedLeftSidePaint.checked = true;
        }
        var selectedRightSidePaint = dialog.findElement('[name="right-side-color-and-texture-choice"][value="'
          + WallController.WallPaint[wallController.getRightSidePaint()]
          + '"]');
        if (selectedRightSidePaint != null) {
          selectedRightSidePaint.checked = true;
        }

        // Colors
        dialog.leftSideColorSelector = viewFactory.createColorSelector(preferences, {
          onColorSelected: function(selectedColor) {
            dialog.findElement('[name="left-side-color-and-texture-choice"][value="COLORED"]').checked = true;
            wallController.setLeftSidePaint(WallController.WallPaint.COLORED);
            wallController.setLeftSideColor(selectedColor);
          }
        });
        dialog.rightSideColorSelector = viewFactory.createColorSelector(preferences, {
          onColorSelected: function(selectedColor) {
            dialog.findElement('[name="right-side-color-and-texture-choice"][value="COLORED"]').checked = true;
            wallController.setRightSidePaint(WallController.WallPaint.COLORED);
            wallController.setRightSideColor(selectedColor);
          }
        });
        dialog.attachChildComponent('left-side-color-selector-button', dialog.leftSideColorSelector);
        dialog.attachChildComponent('right-side-color-selector-button', dialog.rightSideColorSelector);
        dialog.leftSideColorSelector.set(wallController.getLeftSideColor());
        dialog.rightSideColorSelector.set(wallController.getRightSideColor());

        // Textures
        dialog.leftSideTextureSelector = wallController.getLeftSideTextureController().getView();
        dialog.leftSideTextureSelector.onTextureSelected = function(texture) {
          dialog.findElement('[name="left-side-color-and-texture-choice"][value="TEXTURED"]').checked = true;
          wallController.setLeftSidePaint(WallController.WallPaint.TEXTURED);
          wallController.getLeftSideTextureController().setTexture(texture);
        };
        dialog.attachChildComponent('left-side-texture-selector-button', dialog.leftSideTextureSelector);
        dialog.leftSideTextureSelector.set(wallController.getLeftSideTextureController().getTexture());
        
        dialog.rightSideTextureSelector = wallController.getRightSideTextureController().getView();
        dialog.rightSideTextureSelector.onTextureSelected = function(texture) {
          dialog.findElement('[name="right-side-color-and-texture-choice"][value="TEXTURED"]').checked = true;
          wallController.setRightSidePaint(WallController.WallPaint.TEXTURED);
          wallController.getRightSideTextureController().setTexture(texture);
        };
        dialog.attachChildComponent('right-side-texture-selector-button', dialog.rightSideTextureSelector);
        dialog.rightSideTextureSelector.set(wallController.getRightSideTextureController().getTexture());
        
        dialog.getElement('wall-orientation-label').innerHTML = dialog.getLocalizedLabelText(
          'WallPanel', 
          'wallOrientationLabel.text',
          'lib/wallOrientation.png'
        );
      },
      applier: function(dialog) {
        wallController.modifyWalls();
      },
      disposer: function(dialog) {
        dialog.leftSideColorSelector.dispose();
        dialog.rightSideColorSelector.dispose();
        dialog.leftSideTextureSelector.dispose();
        dialog.rightSideTextureSelector.dispose();
      }
    }
  );
}

JSViewFactory.prototype.createRoomView = function(preferences, roomController) {

  var viewFactory = this;

  function initFloorPanel(dialog) {
    dialog.floorVisibleCheckBox = dialog.getElement('floor-visible-checkbox');
    dialog.floorVisibleCheckBox.checked = roomController.getFloorVisible();

    dialog.floorColorSelector = viewFactory.createColorSelector(preferences, {
      onColorSelected: function(selectedColor) {
        dialog.findElement('[name="floor-color-and-texture-choice"][value="COLORED"]').checked = true;
        roomController.setFloorPaint(RoomController.RoomPaint.COLORED);
        roomController.setFloorColor(selectedColor);
      }
    });
    dialog.attachChildComponent('floor-color-selector-button', dialog.floorColorSelector)
    dialog.floorColorSelector.set(roomController.getFloorColor());

    dialog.floorTextureSelector = roomController.getFloorTextureController().getView();
    dialog.floorTextureSelector.onTextureSelected = function(texture) {
      dialog.findElement('[name="floor-color-and-texture-choice"][value="TEXTURED"]').checked = true;
      roomController.setFloorPaint(RoomController.RoomPaint.TEXTURED);
      roomController.getFloorTextureController().setTexture(texture);
    };
    dialog.attachChildComponent('floor-texture-selector-button', dialog.floorTextureSelector);
    dialog.floorTextureSelector.set(roomController.getFloorTextureController().getTexture());
    
    dialog.findElement('[name="floor-color-and-texture-choice"][value="COLORED"]').checked 
      = roomController.getFloorPaint() == RoomController.RoomPaint.COLORED;
    dialog.findElement('[name="floor-color-and-texture-choice"][value="TEXTURED"]').checked 
      = roomController.getFloorPaint() == RoomController.RoomPaint.TEXTURED;

    var selectedFloorShininessRadio = dialog.findElement('[name="floor-shininess-choice"][value="' + roomController.getFloorShininess() + '"]');
    if (selectedFloorShininessRadio != null) {
      selectedFloorShininessRadio.checked = true;
    }
  }

  function initCeilingPanel(dialog) {
    dialog.ceilingVisibleCheckBox = dialog.getElement('ceiling-visible-checkbox');
    dialog.ceilingVisibleCheckBox.checked = roomController.getCeilingVisible();
    
    dialog.ceilingColorSelector = viewFactory.createColorSelector(preferences, {
        onColorSelected: function(selectedColor) {
          dialog.findElement('[name="ceiling-color-and-texture-choice"][value="COLORED"]').checked = true;
          roomController.setCeilingPaint(RoomController.RoomPaint.COLORED);
          roomController.setCeilingColor(selectedColor);
        }
    });
    dialog.attachChildComponent('ceiling-color-selector-button', dialog.ceilingColorSelector)
    dialog.ceilingColorSelector.set(roomController.getCeilingColor());
    
    dialog.ceilingTextureSelector = roomController.getCeilingTextureController().getView();
    dialog.ceilingTextureSelector.onTextureSelected = function(texture) {
        dialog.findElement('[name="ceiling-color-and-texture-choice"][value="TEXTURED"]').checked = true;
        roomController.setCeilingPaint(RoomController.RoomPaint.TEXTURED);
        roomController.getCeilingTextureController().setTexture(texture);
    };
    dialog.attachChildComponent('ceiling-texture-selector-button', dialog.ceilingTextureSelector);
    dialog.ceilingTextureSelector.set(roomController.getCeilingTextureController().getTexture());
    
    dialog.findElement('[name="ceiling-color-and-texture-choice"][value="COLORED"]').checked 
        = roomController.getCeilingPaint() == RoomController.RoomPaint.COLORED;
    dialog.findElement('[name="ceiling-color-and-texture-choice"][value="TEXTURED"]').checked 
        = roomController.getCeilingPaint() == RoomController.RoomPaint.TEXTURED;
    
    var selectedCeilingShininessRadio = dialog.findElement('[name="ceiling-shininess-choice"][value="' + roomController.getCeilingShininess() + '"]');
    if (selectedCeilingShininessRadio != null) {
        selectedCeilingShininessRadio.checked = true;
    }
  }

  return new JSDialogView(viewFactory, preferences, 
    '${RoomPanel.room.title}', 
    document.getElementById("room-dialog-template"), {
      initializer: function(dialog) {
        var behavior = this;

        dialog.nameInput = dialog.getElement('name-input');
        dialog.nameInput.value = roomController.getName();
        
        dialog.areaVisibleCheckbox = dialog.getElement('area-visible-checkbox');
        dialog.areaVisibleCheckbox.checked = roomController.getAreaVisible();

        initFloorPanel(dialog);
        initCeilingPanel(dialog);
      },
      applier: function(dialog) {
        roomController.setName(dialog.nameInput.value);
        roomController.setAreaVisible(dialog.areaVisibleCheckbox.checked);

        roomController.setFloorVisible(dialog.floorVisibleCheckBox.checked);
    
        var selectedFloorShininessRadio = dialog.findElement('[name="floor-shininess-choice"]:checked');
        if (selectedFloorShininessRadio != null) {
          roomController.setFloorShininess(parseFloat(selectedFloorShininessRadio.value));
        }

        roomController.setCeilingVisible(dialog.ceilingVisibleCheckBox.checked);

        var selectedCeilingShininessRadio = dialog.findElement('[name="ceiling-shininess-choice"]:checked');
        if (selectedCeilingShininessRadio != null) {
          roomController.setCeilingShininess(parseFloat(selectedCeilingShininessRadio.value));
        }
        
        roomController.modifyRooms();
      },
      disposer: function(dialog) {
        dialog.floorColorSelector.dispose();
        dialog.floorTextureSelector.dispose();
        dialog.ceilingColorSelector.dispose();
        dialog.ceilingTextureSelector.dispose();
      },
    }
  );
}

/**
 * Creates a polyline editor dialog
 * @param {UserPreferences} preferences 
 * @param {PolylineController} polylineController 
 */
JSViewFactory.prototype.createPolylineView = function(preferences, polylineController) {
  var viewFactory = this;

  return new JSDialogView(viewFactory, preferences, 
    '${PolylinePanel.polyline.title}', 
    document.getElementById("polyline-dialog-template"), {
      initializer: function(dialog) {

        dialog.colorSelector = viewFactory.createColorSelector(preferences, {
          onColorSelected: function(selectedColor) {
            polylineController.setColor(selectedColor);
          }
        });
        dialog.attachChildComponent('color-selector-button', dialog.colorSelector)
        dialog.colorSelector.set(polylineController.getColor());

        dialog.thicknessLabelElement = dialog.getElement('thickness-label');
        dialog.thicknessLabelElement.textContent = dialog.getLocalizedLabelText(
          'PolylinePanel', 'thicknessLabel.text', dialog.preferences.getLengthUnit().getName()
        );
        
        dialog.thicknessInput = dialog.getElement('thickness-input');
        dialog.thicknessInput.value = polylineController.getThickness();

        dialog.dashOffsetInput = dialog.getElement('dash-offset-input');
        dialog.dashOffsetInput.value = polylineController.getDashOffset();

        dialog.visibleIn3DCheckbox = dialog.getElement('visible-in-3D-checkbox');        
        dialog.visibleIn3DCheckbox.checked = polylineController.isElevationEnabled() && polylineController.getElevation() != null;
      },
      applier: function(dialog) {
        if (dialog.thicknessInput.value.trim() != '') {
          polylineController.setThickness(parseFloat(dialog.thicknessInput.value));
        }
        if (dialog.visibleIn3DCheckbox.checked) {
          polylineController.setElevation(0);
        } else {
          polylineController.setElevation(null);
        }

        if (dialog.dashOffsetInput.value.trim() != '') {
          polylineController.setDashOffset(parseFloat(dialog.dashOffsetInput.value));
        }
        
        polylineController.modifyPolylines();
      },
      disposer: function(dialog) {
        dialog.colorSelector.dispose();
      }
    }
  );
}

JSViewFactory.prototype.createLabelView = function(modification, preferences, labelController) {

  var viewFactory = this;

  return new JSDialogView(viewFactory, preferences, 
    '${LabelPanel.labelModification.title}', 
    document.getElementById("label-dialog-template"), {
      initializer: function(dialog) {

        dialog.nameInput = dialog.getElement('text');
        dialog.nameInput.value = modification ? labelController.getText() : "Text";
        
        dialog.alignmentRadios = dialog.getRootNode().querySelectorAll('[name="label-alignment-radio"]');
        if (labelController.getAlignment() != null) {
          var selectedAlignmentRadio = dialog.findElement('[name="label-alignment-radio"][value="' + TextStyle.Alignment[labelController.getAlignment()] + '"]');
          if (selectedAlignmentRadio != null) {
            selectedAlignmentRadio.checked = true;
          }
        }
        
        dialog.textSizeLabel = dialog.getElement('text-size-label');
        dialog.textSizeLabel.textContent = dialog.getLocalizedLabelText(
          'LabelPanel', 'fontSizeLabel.text', dialog.preferences.getLengthUnit().getName()
        );
        dialog.textSizeInput = dialog.getElement('text-size');
        dialog.textSizeInput.value = labelController.getFontSize();
        
        dialog.colorSelector = viewFactory.createColorSelector(preferences);
        dialog.attachChildComponent('color-selector-button', dialog.colorSelector)
        dialog.colorSelector.set(labelController.getColor());
        
        var pitchEnabled = labelController.isPitchEnabled() && labelController.getPitch() != null;
        dialog.visibleIn3DCheckbox = dialog.getElement('visible-in-3D-checkbox');        
        dialog.visibleIn3DCheckbox.checked = pitchEnabled;
        
        dialog.pitchRadios = dialog.getRootNode().querySelectorAll('[name="label-pitch-radio"]');
        if (pitchEnabled) {
          var selectedPitchRadio = dialog.findElement('[name="label-pitch-radio"][value="' + labelController.getPitch() + '"]');
          if (selectedPitchRadio != null) {
            selectedPitchRadio.checked = true;
          }
        }

        dialog.elevationLabel = dialog.getElement('elevation-label');
        dialog.elevationLabel.textContent = dialog.getLocalizedLabelText(
          'LabelPanel', 'elevationLabel.text', dialog.preferences.getLengthUnit().getName()
        );
        dialog.elevationInput = dialog.getElement('elevation-input');
        dialog.elevationInput.value = labelController.getElevation();
      },
      applier: function(dialog) {
        labelController.setText(dialog.nameInput.value);

        for (var i = 0; i < dialog.alignmentRadios.length; i++) {
          if (dialog.alignmentRadios[i].checked) {
            labelController.setAlignment(TextStyle.Alignment[dialog.alignmentRadios[i].value]);
          }
        }

        if (dialog.textSizeInput.value.trim() != '') {
          labelController.setFontSize(parseFloat(dialog.textSizeInput.value));
        }

        labelController.setColor(dialog.colorSelector.get());

        if (dialog.visibleIn3DCheckbox.checked) {
          for (var i = 0; i < dialog.pitchRadios.length; i++) {
            if (dialog.pitchRadios[i].checked) {
              labelController.setPitch(parseFloat(dialog.pitchRadios[i].value) || 0);
            }
          }
        } else {
          labelController.setPitch(null);
        }

        if (dialog.elevationInput.value.trim() != '') {
          labelController.setElevation(parseFloat(dialog.elevationInput.value));
        }

        if (modification) {
          labelController.modifyLabels();
        } else {
          labelController.createLabel();
        }
      },
      disposer: function(dialog) {
        dialog.colorSelector.dispose();
      }
    }
  );
}

JSViewFactory.prototype.createCompassView = function(preferences, compassController) {
  return dummyDialogView;
}

JSViewFactory.prototype.createObserverCameraView = function(preferences, home3DAttributesController) {
  return dummyDialogView;
}

JSViewFactory.prototype.createHome3DAttributesView = function(preferences, home3DAttributesController) {
  return dummyDialogView;
}

/**
 * Creates a texture selection component

 * @param {UserPreferences} preferences current user's preferences 
 * @param {TextureChoiceController} textureChoiceController texture choice controller
 * @param {{ onTextureSelected: function(HomeTexture) }} [options]
 * > onTextureSelected: called with selected texture, when selection changed
 * 
 * @return {JSComponentView} 
 */
JSViewFactory.prototype.createTextureChoiceView = function(preferences, textureChoiceController, options) {
  return new JSTextureSelectorButton(this, preferences, textureChoiceController, null, options);
}

JSViewFactory.prototype.createBaseboardChoiceView = function(preferences, baseboardChoiceController) {
  return null;
}

JSViewFactory.prototype.createModelMaterialsView = function(preferences, modelMaterialsController) {
  return null;
}

JSViewFactory.prototype.createPageSetupView = function(preferences, pageSetupController) {
  return dummyDialogView;
}

JSViewFactory.prototype.createPrintPreviewView = function(home, preferences, homeController, printPreviewController) {
  return dummyDialogView;
}

JSViewFactory.prototype.createPhotoView = function(home, preferences, photoController) {
  return dummyDialogView;
}

JSViewFactory.prototype.createPhotosView = function(home, preferences, photosController) {
  return dummyDialogView;
}

JSViewFactory.prototype.createVideoView = function(home, preferences, videoController) {
  return dummyDialogView;
}

/**********************************/
/** JS ONLY COMPONENTS           **/
/**********************************/

/**
 * Creates a color selection component
 * @param {UserPreferences} preferences current user's preferences 
 * @param {{ onColorSelected: function(number) }} [options]
 * > onColorSelected: called with selected color, as RGB int, when a color is selected
 * 
 * @return {JSComponentView} 
 */
JSViewFactory.prototype.createColorSelector = function(preferences, options) {
  return new JSColorSelectorButton(this, preferences, null, options);
}
