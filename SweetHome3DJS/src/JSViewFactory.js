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

  /**
   * @param {HTMLImageElement} image 
   * @return {boolean} true if image needs alpha channel
   */
  function doesImageHaveAlpha(image) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, image.width, image.height);
    return doesCanvasHaveAlpha(context, canvas);
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

  var USER_CATEGORY = new TexturesCategory(
    ResourceAction.getLocalizedLabelText(preferences, 'ImportedTextureWizardStepsPanel', 'userCategory')
  );
  /**
   * @param {TexturesCategory[]} categories 
   * @return {TexturesCategory | null} found user category, or null if not found
   * @see USER_CATEGORY
   */
  function findUserCategory(categories) {
    var categories = preferences.getTexturesCatalog().getCategories();
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].equals(USER_CATEGORY)) {
        return categories[i];
      }
    }
    return null;
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
        if (findUserCategory(categories) == null) {
          categories = categories.concat([USER_CATEGORY]);
        }
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
    var view = this;
    var controller = this.controller;

    console.info('image selected', image);
    if (image != null) {

      var imageType = doesImageHaveAlpha(image) ? "image/png" : "image/jpeg";

      this.promptImageResize(image, imageType, function(image) {
        BlobURLContent.fromImage(image, imageType, function (content) {

          controller.setImage(content);
          controller.setName('My texture name');
          var categories = view.preferences.getTexturesCatalog().getCategories();
          var userCategory = findUserCategory(categories) || USER_CATEGORY;
          controller.setCategory(userCategory);
          controller.setCreator(null);
          var defaultWidth = 20;
          var lengthUnit = view.preferences.getLengthUnit();
          if (lengthUnit == LengthUnit.INCH || lengthUnit == LengthUnit.INCH_DECIMALS) {
            defaultWidth = LengthUnit.inchToCentimeter(8);
          }
          controller.setWidth(defaultWidth);
          controller.setHeight(defaultWidth / image.width * image.height);
        });

      });

    } else {
      controller.setImage(null);
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
   * @param {string} imageType can be "image/png" or "image/jpeg" depending on image alpha channel requirements
   * @param {function(HTMLImageElement)} callback function called after resize with resized image (or with original image if resize was not necessary or declined by user)
   * 
   * @private
   */
  stepsView.promptImageResize = function (image, imageType, callback) {
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

        var resizedImage = new Image();
        resizedImage.onload = function() {
          callback.call(stepsView, resizedImage);
        }
        resizedImage.src = canvas.toDataURL(imageType);
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

    var image;
    if (this.controller.getImage() instanceof HTMLImageElement) {
      image = this.controller.getImage().cloneNode(true);
      delete image.width;
      delete image.height;
    } else {
      image = new Image();
      image.src = this.controller.getImage().getURL();
    }
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
    if (element instanceof JSComponentView) {
      element = element.getRootNode();
    }
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

          dialog.registerEventListener(dialog.unitSelect, 'input', function() {
            var selectedUnitOption = dialog.unitSelect.options[dialog.unitSelect.selectedIndex];
            controller.setUnit(selectedUnitOption == null ? null : LengthUnit[selectedUnitOption.value]);
          });
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
        dialog.newWallThicknessInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('new-wall-thickness-input'), {
          value: 1,  min: 0, max: 100000
        });
        if (newWallThicknessEnabled) {
          dialog.newWallThicknessInput.value = controller.getNewWallThickness();
        } else {
          disablePreferenceRow(dialog.newWallThicknessInput);
        }

        /** NEW WALL HEIGHT */
        var newWallHeightEnabled = controller.isPropertyEditable('NEW_WALL_HEIGHT');
        dialog.newWallHeightInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('new-wall-height-input'), {
          value: 1,  min: 0, max: 100000
        });
        if (newWallHeightEnabled) {
          dialog.newWallHeightInput.value = controller.getNewWallHeight();
        } else {
          disablePreferenceRow(dialog.newWallHeightInput);
        }

        /** NEW FLOOR THICKNESS */
        var newFloorThicknessEnabled = controller.isPropertyEditable('NEW_FLOOR_THICKNESS');
        dialog.newFloorThicknessInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('new-floor-thickness-input'), {
          value: 1,  min: 0, max: 100000
        });
        if (newFloorThicknessEnabled) {
          dialog.newFloorThicknessInput.value = controller.getNewFloorThickness();
        } else {
          disablePreferenceRow(dialog.newFloorThicknessInput);
        }

        var updateSpinnerStepsAndLength = function(spinner, centimeterStepSize, inchStepSize) {
          if (controller.getUnit() == LengthUnit.INCH || controller.getUnit() == LengthUnit.INCH_DECIMALS) {
            spinner.step = LengthUnit.inchToCentimeter(inchStepSize);
          } else {
            spinner.step = centimeterStepSize;
          }
          spinner.format = controller.getUnit().getFormat();
        }

        var updateStepsAndLength = function() {
          updateSpinnerStepsAndLength(dialog.newWallThicknessInput, 0.5, 0.125);
          updateSpinnerStepsAndLength(dialog.newWallHeightInput, 10, 2);
          updateSpinnerStepsAndLength(dialog.newFloorThicknessInput, 0.5, 0.125);
        };

        updateStepsAndLength();
        controller.addPropertyChangeListener('UNIT', function(event) {
          updateStepsAndLength();
        });
      },
      applier: function(dialog) {
        if (isElementVisible(dialog.languageSelect)) {
          var selectedLanguageOption = dialog.languageSelect.options[dialog.languageSelect.selectedIndex];
          controller.setLanguage(selectedLanguageOption == null ? null : selectedLanguageOption.value);
        }
        if (isElementVisible(dialog.currencySelect)) {
          var selectedCurrencyOption = dialog.currencySelect.options[dialog.currencySelect.selectedIndex];
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
  
  function JSHomeFurnitureDialog() {
    this.controller = homeFurnitureController;
    
    JSDialogView.call(
      this, 
      viewFactory, 
      preferences, 
      '${HomeFurniturePanel.homeFurniture.title}', 
      document.getElementById("home-furniture-dialog-template"),
      {
        initializer: function(dialog) {

          
          dialog.initNameAndPricePanel();
          dialog.initLocationPanel();
          dialog.initPaintPanel();
          dialog.initOrientationPanel();
          dialog.initSizePanel();
          dialog.initShininessPanel();

          if (dialog.controller.isPropertyEditable('VISIBLE')) {
            // Create visible check box bound to VISIBLE controller property
            var visibleCheckBox = this.getElement('visible-checkbox');
            visibleCheckBox.checked = dialog.controller.getVisible();
            this.controller.addPropertyChangeListener('VISIBLE', function(event) {
              visibleCheckBox.checked = event.getNewValue();
            });

            this.registerEventListener(
              visibleCheckBox,
              'input',
              function() {
                dialog.controller.setVisible(visibleCheckBox.checked);
              }
            );
          }

          // must be done at last, needs multiple components to be initialized
          if (dialog.controller.isPropertyEditable('PAINT')) {
            dialog.updatePaintRadioButtons();
          }
        },
        applier: function() {
          homeFurnitureController.modifyFurniture();
        },
        disposer: function(dialog) {
          dialog.paintPanel.colorSelector.dispose();
          dialog.paintPanel .textureSelector.dispose();
        }
      });
  }
  JSHomeFurnitureDialog.prototype = Object.create(JSDialogView.prototype);
  JSHomeFurnitureDialog.prototype.constructor = JSHomeFurnitureDialog;

  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.initNameAndPricePanel = function() {
    var nameLabel = this.getElement('name-label');
    var nameInput = this.getElement('name-input');
    var nameVisibleCheckbox = this.getElement('name-visible-checkbox');
    var priceLabel = this.getElement('price-label');
    var priceInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('price-input'), {
      value: 0, min: 0, max: 1000000000
    });
    var valueAddedTaxPercentageInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('value-added-tax-percentage-input'), {
      value: 0, min: 0, max: 100, step: 0.5
    });

    // 1) adjust visibility
    var nameDisplay = this.controller.isPropertyEditable('NAME') ? 'initial' : 'none';
    var nameVisibleDisplay = this.controller.isPropertyEditable('NAME_VISIBLE') ? 'initial' : 'none';
    var priceDisplay = this.controller.isPropertyEditable('PRICE') ? 'initial' : 'none';
    var vatDisplay = this.controller.isPropertyEditable('VALUE_ADDED_TAX_PERCENTAGE') ? 'initial' : 'none';

    nameLabel.style.display = nameDisplay;
    nameInput.style.display = nameDisplay;
    
    nameVisibleCheckbox.parentElement.style.display = nameVisibleDisplay;
    
    priceLabel.style.display = priceDisplay;
    priceInput.style.display = priceDisplay;

    valueAddedTaxPercentageInput.getRootNode().previousElementSibling.style.display = vatDisplay;
    valueAddedTaxPercentageInput.style.display = vatDisplay;

    // 2) set values
    nameInput.value = this.controller.getName();
    nameVisibleCheckbox.checked = this.controller.getNameVisible();
    priceInput.value = this.controller.getPrice();
    if (this.controller.getValueAddedTaxPercentage()) {
      valueAddedTaxPercentageInput.value = this.controller.getValueAddedTaxPercentage() * 100;
    }

    // 3) add property listeners
    var controller = this.controller;
    this.controller.addPropertyChangeListener('NAME', function(event) {
      nameInput.value = controller.getName();
    });
    this.controller.addPropertyChangeListener('NAME_VISIBLE', function(event) {
      nameVisibleCheckbox.checked = controller.getNameVisible();
    });
    this.controller.addPropertyChangeListener('PRICE', function(event) {
      priceInput.value = controller.getPrice();
    });
    this.controller.addPropertyChangeListener('VALUE_ADDED_TAX_PERCENTAGE', function(event) {
      if (controller.getValueAddedTaxPercentage()) {
        valueAddedTaxPercentageInput.value = controller.getValueAddedTaxPercentage() * 100;
      } else {
        valueAddedTaxPercentageInput.value = null;
      }
    });

    // 4) add change listeners
    this.registerEventListener(
      [nameInput, nameVisibleCheckbox, priceInput, valueAddedTaxPercentageInput],
      'input',
      function() {
        controller.setName(nameInput.value);
        controller.setNameVisible(nameVisibleCheckbox.checked);
        controller.setPrice(priceInput.value != null && priceInput.value != '' ? new Big(parseFloat(priceInput.value)) : null);
        controller.setValueAddedTaxPercentage(
          valueAddedTaxPercentageInput.value != null && valueAddedTaxPercentageInput.value != null ? parseFloat(valueAddedTaxPercentageInput.value) / 100 : null
        );
      }
    );
  }

  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.initLocationPanel = function() {
    var xLabel = this.getElement('x-label');
    var xInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('x-input'), {
      nullable: this.controller.getX() == null,
      format: this.preferences.getLengthUnit().getFormat(),
      step: this.getLengthInputStepSize(),
    });

    var yLabel = this.getElement('y-label');
    var yInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('y-input'), {
      nullable: this.controller.getY() == null,
      format: this.preferences.getLengthUnit().getFormat(),
      step: this.getLengthInputStepSize(),
    });
    var elevationLabel = this.getElement('elevation-label');
    var elevationInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('elevation-input'), {
      nullable: this.controller.getElevation() == null,
      format: this.preferences.getLengthUnit().getFormat(),
      step: this.getLengthInputStepSize(),
    });

    var mirroredModelCheckbox = this.getElement('mirrored-model-checkbox');
    var basePlanItemCheckbox = this.getElement('base-plan-item-checkbox');

    // 1) adjust visibility
    var xDisplay = this.controller.isPropertyEditable('X') ? 'initial' : 'none';
    var yDisplay = this.controller.isPropertyEditable('Y') ? 'initial' : 'none';
    var elevationDisplay = this.controller.isPropertyEditable('ELEVATION') ? 'initial' : 'none';
    var modelMirroredDisplay = this.controller.isPropertyEditable('MODEL_MIRRORED') ? 'initial' : 'none';
    var basePlanItemDisplay = this.controller.isPropertyEditable('BASE_PLAN_ITEM') ? 'initial' : 'none';

    xLabel.style.display = xDisplay;
    xInput.getRootNode().parentElement.style.display = xDisplay;
    yLabel.style.display = yDisplay;
    yInput.getRootNode().parentElement.style.display = yDisplay;
    elevationLabel.style.display =  elevationDisplay;
    elevationInput.getRootNode().parentElement.style.display = elevationDisplay;
    
    mirroredModelCheckbox.parentElement.style.display = modelMirroredDisplay;
    basePlanItemCheckbox.parentElement.style.display = basePlanItemDisplay;

    // 2) set values
    xInput.value = this.controller.getX();
    yInput.value = this.controller.getY();
    elevationInput.value = this.controller.getElevation();
    mirroredModelCheckbox.checked = this.controller.getModelMirrored();
    basePlanItemCheckbox.checked = this.controller.getBasePlanItem();

    // 3) set labels
    var unitName = this.preferences.getLengthUnit().getName();
    xLabel.textContent = this.getLocalizedLabelText('HomeFurniturePanel', 'xLabel.text', unitName);
    yLabel.textContent = this.getLocalizedLabelText('HomeFurniturePanel', 'yLabel.text', unitName);
    elevationLabel.textContent = this.getLocalizedLabelText('HomeFurniturePanel', 'elevationLabel.text', unitName);
    
    // 4) set custom attributes
    var maximumLength = this.preferences.getLengthUnit().getMaximumLength();
    var maximumElevation = this.preferences.getLengthUnit().getMaximumElevation();
    xInput.min = yInput.min = -maximumLength;
    xInput.max = yInput.max = maximumLength;
    elevationInput.min = 0;
    elevationInput.max = maximumElevation;

    // 5) add property listeners
    var controller = this.controller;
    this.controller.addPropertyChangeListener('X', function(event) {
      xInput.value = controller.getX();
    });
    this.controller.addPropertyChangeListener('Y', function(event) {
      yInput.value = controller.getY();
    });
    this.controller.addPropertyChangeListener('ELEVATION', function(event) {
      elevationInput.value = controller.getElevation();
    });
    this.controller.addPropertyChangeListener('MODEL_MIRRORED', function(event) {
      mirroredModelCheckbox.checked = controller.getModelMirrored();
    });
    this.controller.addPropertyChangeListener('BASE_PLAN_ITEM', function(event) {
      basePlanItemCheckbox.checked = controller.getBasePlanItem();
    });

    // 6) add change listeners
    this.registerEventListener(
      [xInput, yInput, elevationInput, mirroredModelCheckbox, basePlanItemCheckbox],
      'input',
      function() {
        controller.setX(xInput.value != null && xInput.value != '' ? parseFloat(xInput.value) : null);
        controller.setY(yInput.value != null && yInput.value != '' ? parseFloat(yInput.value) : null);
        controller.setElevation(elevationInput.value != null && elevationInput.value != '' ? parseFloat(elevationInput.value) : null);
        controller.setModelMirrored(mirroredModelCheckbox.checked);
        controller.setBasePlanItem(basePlanItemCheckbox.checked);
      }
    );
  }

  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.initOrientationPanel = function() {
    var controller = this.controller;

    var angleLabel = this.getElement('angle-label');
    
    var angleDecimalFormat = new DecimalFormat();
    angleDecimalFormat.maximumFractionDigits = 1;

    var angleInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('angle-input'), {
      nullable: this.controller.getAngle() == null,
      format: angleDecimalFormat,
      min: 0,
      max: 360,
    });

    var horizontalRotationRadioRoll = this.findElement('[name="horizontal-rotation-radio"][value="ROLL"]');
    var horizontalRotationRadioPitch = this.findElement('[name="horizontal-rotation-radio"][value="PITCH"]');
    var rollInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('roll-input'), {
      nullable: this.controller.getRoll() == null,
      format: angleDecimalFormat,
      min: 0,
      max: 360,
    });
    var pitchInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('pitch-input'), {
      nullable: this.controller.getPitch() == null,
      format: angleDecimalFormat,
      min: 0,
      max: 360,
    });

    var verticalRotationLabel = this.getElement("vertical-rotation-label");
    var horizontalRotationLabel = this.getElement("horizontal-rotation-label");
    var furnitureOrientationImage = this.getElement("furniture-orientation-image");

    // 1) adjust visibility
    var angleDisplay = this.controller.isPropertyEditable('ANGLE_IN_DEGREES') || this.controller.isPropertyEditable('ANGLE') ? 'initial' : 'none';
    var rollDisplay = this.controller.isPropertyEditable('ROLL') ? 'initial' : 'none';
    var pitchDisplay = this.controller.isPropertyEditable('PITCH') ? 'initial' : 'none';

    var rollAndPitchDisplayed = this.controller.isPropertyEditable('ROLL') && this.controller.isPropertyEditable('PITCH');
    var verticalRotationLabelDisplay = rollAndPitchDisplayed ? 'initial' : 'none';
    var horizontalRotationLabelDisplay = verticalRotationLabelDisplay;
    var furnitureOrientationImageDisplay = this.controller.isTexturable() && rollAndPitchDisplayed ? 'initial' : 'none';

    angleLabel.style.display = angleDisplay;
    angleInput.getRootNode().parentElement.style.display = angleDisplay;

    horizontalRotationRadioRoll.parentElement.style.display = rollDisplay; 
    rollInput.getRootNode().parentElement.style.display = rollDisplay; 
    
    horizontalRotationRadioPitch.parentElement.style.display = pitchDisplay; 
    pitchInput.getRootNode().parentElement.style.display = pitchDisplay; 

    horizontalRotationLabel.style.display = horizontalRotationLabelDisplay;    
    verticalRotationLabel.style.display = verticalRotationLabelDisplay;
    furnitureOrientationImage.style.display = furnitureOrientationImageDisplay;

    // 2) set values
    if (this.controller.getAngle() != null) {
      angleInput.value = Math.round(/* toDegrees */ (function (x) { return x * 180 / Math.PI; })(this.controller.getAngle()));
    } else {
      angleInput.value = null;
    }
    if (this.controller.getRoll() != null) {
      rollInput.value = Math.round(/* toDegrees */ (function (x) { return x * 180 / Math.PI; })(this.controller.getRoll()));
    } else {
      rollInput.value = null;
    }
    if (this.controller.getPitch() != null) {
      pitchInput.value = Math.round(/* toDegrees */ (function (x) { return x * 180 / Math.PI; })(this.controller.getPitch()));
    } else {
      pitchInput.value = null;
    }

    function updateHorizontalAxisRadioButtons() {
      horizontalRotationRadioRoll.checked = controller.getHorizontalAxis() == HomeFurnitureController.FurnitureHorizontalAxis.ROLL;
      horizontalRotationRadioPitch.checked = controller.getHorizontalAxis() == HomeFurnitureController.FurnitureHorizontalAxis.PITCH;
    }
    updateHorizontalAxisRadioButtons();

    // 3) add property listeners
    this.controller.addPropertyChangeListener('ANGLE', function(event) {
      if (controller.getAngle() != null) {
        angleInput.value = Math.round(/* toDegrees */ (function (x) { return x * 180 / Math.PI; })(controller.getAngle()));
      } else {
        angleInput.value = null;
      }
    });
    this.controller.addPropertyChangeListener('ROLL', function(event) {
      if (controller.getRoll() != null) {
        rollInput.value = Math.round(/* toDegrees */ (function (x) { return x * 180 / Math.PI; })(controller.getRoll()));
      } else {
        rollInput.value = null;
      }
    });
    this.controller.addPropertyChangeListener('PITCH', function(event) {
      if (controller.getPitch() != null) {
        pitchInput.value = Math.round(/* toDegrees */ (function (x) { return x * 180 / Math.PI; })(controller.getPitch()));
      } else {
        pitchInput.value = null;
      }
    });
    this.controller.addPropertyChangeListener('HORIZONTAL_AXIS', function(event) {
      updateHorizontalAxisRadioButtons();
    });

    // 4) add change listeners
    this.registerEventListener(angleInput, 'input', function() {
      if (angleInput.value == null || angleInput.value == '') {
        controller.setAngle(null);
      } else {
        controller.setAngle(/* toRadians */ (function (x) { return x * Math.PI / 180; })(angleInput.value));
      }
    });
    this.registerEventListener(rollInput, 'input', function() {
      if (rollInput.value == null || rollInput.value == '') {
        controller.setRoll(null);
      } else {
        controller.setRoll(/* toRadians */ (function (x) { return x * Math.PI / 180; })(rollInput.value));
        controller.setHorizontalAxis(HomeFurnitureController.FurnitureHorizontalAxis.ROLL);
      }
    });
    this.registerEventListener(pitchInput, 'input', function() {
      if (pitchInput.value == null || pitchInput.value == '') {
        // we force 0 here because null seems to create a bug in save (furniture entirely disappears)
        controller.setPitch(null);
      } else {
        controller.setPitch(/* toRadians */ (function (x) { return x * Math.PI / 180; })(pitchInput.value));
        controller.setHorizontalAxis(HomeFurnitureController.FurnitureHorizontalAxis.PITCH);
      }
    });
    this.registerEventListener([horizontalRotationRadioRoll, horizontalRotationRadioPitch], 'input', function() {
      if (horizontalRotationRadioRoll.checked) {
        controller.setHorizontalAxis(HomeFurnitureController.FurnitureHorizontalAxis.ROLL);
      } else {
        controller.setHorizontalAxis(HomeFurnitureController.FurnitureHorizontalAxis.PITCH);
      }
    });
  }

  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.initPaintPanel = function() {
    var dialog = this;
    var controller = this.controller;
    var preferences = this.preferences;

    var colorSelector = viewFactory.createColorSelector(preferences, {
      onColorSelected: function(color) {
        colorAndTextureRadioButtons[FurniturePaint.COLORED].checked = true;
        controller.setPaint(FurniturePaint.COLORED);
        controller.setColor(color);
      }
    });
    dialog.attachChildComponent('color-selector-button', colorSelector)
    colorSelector.set(controller.getColor());

    var textureSelector = controller.getTextureController().getView();
    textureSelector.onTextureSelected = function(texture) {
      colorAndTextureRadioButtons[FurniturePaint.TEXTURED].checked = true;
      controller.setPaint(FurniturePaint.TEXTURED);
      controller.getTextureController().setTexture(texture);
    };
    dialog.attachChildComponent('texture-selector-button', textureSelector);
    textureSelector.set(controller.getTextureController().getTexture());
    
    var selectedPaint = controller.getPaint();

    var colorAndTextureRadioButtons = [];
    colorAndTextureRadioButtons[FurniturePaint.DEFAULT] = dialog.findElement('[name="paint-checkbox"][value="default"]');
    colorAndTextureRadioButtons[FurniturePaint.COLORED] = dialog.findElement('[name="paint-checkbox"][value="color"]');
    colorAndTextureRadioButtons[FurniturePaint.TEXTURED] = dialog.findElement('[name="paint-checkbox"][value="texture"]');
    colorAndTextureRadioButtons[FurniturePaint.MODEL_MATERIALS] = dialog.findElement('[name="paint-checkbox"][value="MODEL_MATERIALS"]');
    
    for (var paint = 0; paint < colorAndTextureRadioButtons.length; paint++) {
      var radioButton = colorAndTextureRadioButtons[paint];
      radioButton.checked = paint == selectedPaint || (paint == FurniturePaint.DEFAULT && !colorAndTextureRadioButtons[selectedPaint]);
    }

    dialog.paintPanel = {
      colorAndTextureRadioButtons: colorAndTextureRadioButtons,
      colorSelector: colorSelector,
      textureSelector: textureSelector,
    }

    var panelDisplay = controller.isPropertyEditable('PAINT') ? undefined : 'none';
    this.getElement('paint-panel').style.display = panelDisplay;
    this.getElement('paint-panel').previousElementSibling.style.display = panelDisplay;

    controller.addPropertyChangeListener('PAINT', function() {
      dialog.updatePaintRadioButtons();
    });

    dialog.registerEventListener(
      colorAndTextureRadioButtons, 
      'change', 
      function(event) { 
        var paint = colorAndTextureRadioButtons.indexOf(event.target);
        controller.setPaint(paint);
      });
  }

  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.updatePaintRadioButtons = function() {
    var controller = this.controller;
    if (controller.getPaint() == null) {
      for (var i = 0; i < dialog.colorAndTextureRadioButtons.length; i++) {
        this.paintPanel.colorAndTextureRadioButtons[i].checked = false;
      }
    } else {
      var selectedRadio = this.paintPanel.colorAndTextureRadioButtons[controller.getPaint()];
      if (selectedRadio) {
        selectedRadio.checked = true;
      }
      this.updateShininessRadioButtons(controller);
    }
  };
  
  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.initSizePanel = function() {
    var dialog = this;
    var controller = this.controller;
  
    var widthLabel = this.getElement('width-label');
    var widthInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('width-input'), {
      nullable: controller.getWidth() == null,
      format: this.preferences.getLengthUnit().getFormat(),
      step: this.getLengthInputStepSize(),
    });

    var depthLabel = this.getElement('depth-label');
    var depthInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('depth-input'), {
      nullable: controller.getDepth() == null,
      format: this.preferences.getLengthUnit().getFormat(),
      step: this.getLengthInputStepSize(),
    });

    var heightLabel = this.getElement('height-label');
    var heightInput = this.getElement('height-input');
    var heightInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('height-input'), {
      nullable: controller.getHeight() == null,
      format: this.preferences.getLengthUnit().getFormat(),
      step: this.getLengthInputStepSize(),
    });
    var keepProportionsCheckbox = this.getElement('keep-proportions-checkbox');

    // 1) adjust visibility
    var widthDisplay = this.controller.isPropertyEditable('WIDTH') ? 'initial' : 'none';
    var depthDisplay = this.controller.isPropertyEditable('DEPTH') ? 'initial' : 'none';
    var heightDisplay = this.controller.isPropertyEditable('HEIGHT') ? 'initial' : 'none';
    var keepProportionsDisplay = this.controller.isPropertyEditable('PROPORTIONAL') ? 'initial' : 'none';

    widthLabel.style.display = widthDisplay;
    widthInput.parentElement.style.display = widthDisplay;
    depthLabel.style.display = depthDisplay;
    depthInput.parentElement.style.display = depthDisplay;
    heightLabel.style.display = heightDisplay;
    heightInput.parentElement.style.display = heightDisplay;
    keepProportionsCheckbox.parentElement.style.display = keepProportionsDisplay;
    
    // 2) set values
    widthInput.value = this.controller.getWidth();
    depthInput.value = this.controller.getDepth();
    heightInput.value = this.controller.getHeight();
    keepProportionsCheckbox.checked = this.controller.isProportional();

    // 3) set labels
    var unitName = this.preferences.getLengthUnit().getName();
    widthLabel.textContent = this.getLocalizedLabelText('HomeFurniturePanel', 'widthLabel.text', unitName);
    depthLabel.textContent = this.getLocalizedLabelText('HomeFurniturePanel', 'depthLabel.text', unitName);
    heightLabel.textContent = this.getLocalizedLabelText('HomeFurniturePanel', 'heightLabel.text', unitName);

    // 4) set custom attributes
    var minimumLength = this.preferences.getLengthUnit().getMinimumLength();
    var maximumLength = this.preferences.getLengthUnit().getMaximumLength();
    widthInput.min = depthInput.min = heightInput.min = minimumLength;
    widthInput.max = depthInput.max = heightInput.max = maximumLength;

    // 5) add property listeners
    var controller = this.controller;
    this.controller.addPropertyChangeListener('WIDTH', function(event) {
      widthInput.value = controller.getWidth();
    });
    this.controller.addPropertyChangeListener('DEPTH', function(event) {
      depthInput.value = controller.getDepth();
    });
    this.controller.addPropertyChangeListener('HEIGHT', function(event) {
      heightInput.value = controller.getHeight();
    });
    this.controller.addPropertyChangeListener('PROPORTIONAL', function(event) {
      keepProportionsCheckbox.checked = controller.isProportional();
    });

    // 6) add change listeners
    this.registerEventListener(
      [widthInput, depthInput, heightInput, keepProportionsCheckbox],
      'input',
      function() {
        controller.setWidth(widthInput.value != null && widthInput.value != '' ? parseFloat(widthInput.value) : null);
        controller.setDepth(depthInput.value != null && depthInput.value != '' ? parseFloat(depthInput.value) : null);
        controller.setHeight(heightInput.value != null && heightInput.value != '' ? parseFloat(heightInput.value) : null);
        controller.setProportional(keepProportionsCheckbox.checked);
      }
    );

    // 7) assign panel's components
    this.sizePanel = {
      widthLabel: widthLabel,
      widthInput: widthInput,
      depthLabel: depthLabel,
      depthInput: depthInput,
      heightLabel: heightLabel,
      heightInput: heightInput,
      keepProportionsCheckbox: keepProportionsCheckbox,
    };

    // 8) handle components activation
    dialog.updateSizeComponents();
    // Add a listener that enables / disables size fields depending on furniture
    // resizable and deformable
    dialog.controller.addPropertyChangeListener('RESIZABLE', function() {
      dalog.updateSizeComponents();
    });
    dialog.controller.addPropertyChangeListener('DEFORMABLE', function() {
      dalog.updateSizeComponents();
    });
  };

  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.updateSizeComponents = function() {
    var editableSize = this.controller.isResizable();
    this.sizePanel.widthLabel.disabled = !editableSize;
    this.sizePanel.widthInput.disabled = !editableSize;
    this.sizePanel.depthLabel.disabled = !editableSize;
    this.sizePanel.depthInput.disabled = !editableSize;
    this.sizePanel.heightLabel.disabled = !editableSize;
    this.sizePanel.heightInput.disabled = !editableSize;
    this.sizePanel.keepProportionsCheckbox.disabled = !editableSize || !this.controller.isDeformable();
  };

  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.initShininessPanel = function() {
    var controller = this.controller;
    var dialog = this;

    var defaultShininessRadioButton = this.findElement('[name="shininess-radio"][value="DEFAULT"]');
    var mattRadioButton = this.findElement('[name="shininess-radio"][value="MATT"]');
    var shinyRadioButton = this.findElement('[name="shininess-radio"][value="SHINY"]');
    this.shininessPanel = {
      defaultShininessRadioButton: defaultShininessRadioButton,
      mattRadioButton: mattRadioButton,
      shinyRadioButton: shinyRadioButton,
    };

    var radiosDisplay = controller.isPropertyEditable('SHININESS') ? 'initial' : 'none';

    defaultShininessRadioButton.parentElement.style.display = radiosDisplay;
    mattRadioButton.parentElement.style.display = radiosDisplay;
    shinyRadioButton.parentElement.style.display = radiosDisplay;

    if (controller.isPropertyEditable('SHININESS')) {
      // Create radio buttons bound to SHININESS controller properties
      this.registerEventListener(
        [defaultShininessRadioButton, mattRadioButton, shinyRadioButton],
        'input',
        function() {
          var selectedRadio = dialog.findElement('[name="shininess-radio"]:checked');
          controller.setShininess(HomeFurnitureController.FurnitureShininess[selectedRadio.value]);
        }
      );
      controller.addPropertyChangeListener('SHININESS', function() {
        dialog.updateShininessRadioButtons(controller);
      });
      
      this.updateShininessRadioButtons(controller);
    }
  }

  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.updateShininessRadioButtons = function() {
    var controller = this.controller;

    if (controller.isPropertyEditable('SHININESS')) {
      if (controller.getShininess() == HomeFurnitureController.FurnitureShininess.DEFAULT) {
        this.shininessPanel.defaultShininessRadioButton.checked = true;
      } else if (controller.getShininess() == HomeFurnitureController.FurnitureShininess.MATT) {
        this.shininessPanel.mattRadioButton.checked = true;
      } else if (controller.getShininess() == HomeFurnitureController.FurnitureShininess.SHINY) {
        this.shininessPanel.shinyRadioButton.checked = true;
      } else { // null
        this.shininessPanel.defaultShininessRadioButton.checked = false;
        this.shininessPanel.mattRadioButton.checked = false;
        this.shininessPanel.shinyRadioButton.checked = false;
      }
      var shininessEnabled = controller.getPaint() != HomeFurnitureController.FurniturePaint.MODEL_MATERIALS;
      this.shininessPanel.defaultShininessRadioButton.disabled = !shininessEnabled;
      this.shininessPanel.mattRadioButton.disabled = !shininessEnabled;
      this.shininessPanel.shinyRadioButton.disabled = !shininessEnabled;
      if (!shininessEnabled) {
        this.shininessPanel.defaultShininessRadioButton.checked = false;
        this.shininessPanel.mattRadioButton.checked = false;
        this.shininessPanel.shinyRadioButton.checked = false;
      }
    }
  };

  return new JSHomeFurnitureDialog();
}

JSViewFactory.prototype.createWallView = function(preferences, wallController) {

  var viewFactory = this;

  return new JSDialogView(viewFactory, preferences, 
    '${WallPanel.wall.title}', 
    document.getElementById("wall-dialog-template"), {
      small: true,
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

JSViewFactory.prototype.createRoomView = function(preferences, controller) {

  var viewFactory = this;

  function initFloorPanel(dialog) {

    // visible
    var floorVisibleDisplay = controller.isPropertyEditable('FLOOR_VISIBLE') ? 'initial' : 'none';
    dialog.floorVisibleCheckBox = dialog.getElement('floor-visible-checkbox');
    dialog.floorVisibleCheckBox.checked = controller.getFloorVisible();
    dialog.floorVisibleCheckBox.parentElement.style.display = floorVisibleDisplay;
    dialog.registerEventListener(dialog.floorVisibleCheckBox, 'input', function() {
      controller.setFloorVisible(dialog.floorVisibleCheckBox.checked);
    });
    controller.addPropertyChangeListener('FLOOR_VISIBLE', function(event) {
      dialog.floorVisibleCheckBox.checked = controller.getFloorVisible();
    });

    // paint
    var floorColorCheckbox = dialog.findElement('[name="floor-color-and-texture-choice"][value="COLORED"]');
    dialog.floorColorSelector = viewFactory.createColorSelector(preferences, {
      onColorSelected: function(selectedColor) {
        floorColorCheckbox.checked = true;
        controller.setFloorPaint(RoomController.RoomPaint.COLORED);
        controller.setFloorColor(selectedColor);
      }
    });
    dialog.attachChildComponent('floor-color-selector-button', dialog.floorColorSelector)
    dialog.floorColorSelector.set(controller.getFloorColor());

    var floorTextureCheckbox = dialog.findElement('[name="floor-color-and-texture-choice"][value="TEXTURED"]');
    dialog.floorTextureSelector = controller.getFloorTextureController().getView();
    dialog.floorTextureSelector.onTextureSelected = function(texture) {
      floorTextureCheckbox.checked = true;
      controller.setFloorPaint(RoomController.RoomPaint.TEXTURED);
      controller.getFloorTextureController().setTexture(texture);
    };
    dialog.attachChildComponent('floor-texture-selector-button', dialog.floorTextureSelector);
    dialog.floorTextureSelector.set(controller.getFloorTextureController().getTexture());

    dialog.registerEventListener([floorColorCheckbox, floorTextureCheckbox], 'input', function() {
      var selectedPaint = RoomController.RoomPaint[this.value];
      controller.setFloorPaint(selectedPaint);
      controller.setFloorColor(200);
    });

    function setPaintFromController() {
      floorColorCheckbox.checked = controller.getFloorPaint() == RoomController.RoomPaint.COLORED;
      floorTextureCheckbox.checked = controller.getFloorPaint() == RoomController.RoomPaint.TEXTURED;
    }
    setPaintFromController();
    controller.addPropertyChangeListener('FLOOR_PAINT', setPaintFromController);

    var floorPaintDisplay = controller.isPropertyEditable('FLOOR_PAINT') ? 'initial' : 'none';
    floorColorCheckbox.parentElement.parentElement.style.display = floorPaintDisplay;
    floorTextureCheckbox.parentElement.parentElement.style.display = floorPaintDisplay;
    dialog.getElement('floor-color-selector-button').style.display = floorPaintDisplay;
    dialog.getElement('floor-texture-selector-button').style.display = floorPaintDisplay;

    // Shininess
    var shininessRadioButtons = dialog.findElements('[name="floor-shininess-choice"]');
    dialog.registerEventListener(shininessRadioButtons, 'input', function() {
      controller.setFloorShininess(parseFloat(this.value));
    });

    function setShininessFromController() {
      for (var i = 0; i < shininessRadioButtons.length; i++) {
        shininessRadioButtons[i].checked = controller.getFloorShininess() == parseFloat(shininessRadioButtons[i].value);
      }
    }
    setShininessFromController();
    controller.addPropertyChangeListener('FLOOR_SHININESS', setPaintFromController);

    var floorShininessDisplay = controller.isPropertyEditable('FLOOR_SHININESS') ? 'initial' : 'none';
    shininessRadioButtons[0].parentElement.parentElement = floorShininessDisplay;
  }

  function initCeilingPanel(dialog) {
    dialog.ceilingVisibleCheckBox = dialog.getElement('ceiling-visible-checkbox');
    dialog.ceilingVisibleCheckBox.checked = controller.getCeilingVisible();
    
    dialog.ceilingColorSelector = viewFactory.createColorSelector(preferences, {
        onColorSelected: function(selectedColor) {
          dialog.findElement('[name="ceiling-color-and-texture-choice"][value="COLORED"]').checked = true;
          controller.setCeilingPaint(RoomController.RoomPaint.COLORED);
          controller.setCeilingColor(selectedColor);
        }
    });
    dialog.attachChildComponent('ceiling-color-selector-button', dialog.ceilingColorSelector)
    dialog.ceilingColorSelector.set(controller.getCeilingColor());
    
    dialog.ceilingTextureSelector = controller.getCeilingTextureController().getView();
    dialog.ceilingTextureSelector.onTextureSelected = function(texture) {
        dialog.findElement('[name="ceiling-color-and-texture-choice"][value="TEXTURED"]').checked = true;
        controller.setCeilingPaint(RoomController.RoomPaint.TEXTURED);
        controller.getCeilingTextureController().setTexture(texture);
    };
    dialog.attachChildComponent('ceiling-texture-selector-button', dialog.ceilingTextureSelector);
    dialog.ceilingTextureSelector.set(controller.getCeilingTextureController().getTexture());
    
    dialog.findElement('[name="ceiling-color-and-texture-choice"][value="COLORED"]').checked 
        = controller.getCeilingPaint() == RoomController.RoomPaint.COLORED;
    dialog.findElement('[name="ceiling-color-and-texture-choice"][value="TEXTURED"]').checked 
        = controller.getCeilingPaint() == RoomController.RoomPaint.TEXTURED;
    
    var selectedCeilingShininessRadio = dialog.findElement('[name="ceiling-shininess-choice"][value="' + controller.getCeilingShininess() + '"]');
    if (selectedCeilingShininessRadio != null) {
        selectedCeilingShininessRadio.checked = true;
    }
  }

  return new JSDialogView(viewFactory, preferences, 
    '${RoomPanel.room.title}', 
    document.getElementById("room-dialog-template"), {
      initializer: function(dialog) {
        var behavior = this;

        var nameDisplay = controller.isPropertyEditable('NAME') ? 'initial' : 'none';
        dialog.nameInput = dialog.getElement('name-input');
        dialog.nameInput.value = controller.getName();
        dialog.nameInput.parentElement.style.display = nameDisplay;
        dialog.registerEventListener(dialog.nameInput, 'input', function() {
          controller.setName(dialog.nameInput.trim());
        });
        controller.addPropertyChangeListener('NAME', function(event) {
          dialog.nameInput.value = controller.getName();
        });

        var areaVisiblePanelDisplay = controller.isPropertyEditable('AREA_VISIBLE') ? 'initial' : 'none';
        dialog.areaVisibleCheckbox = dialog.getElement('area-visible-checkbox');
        dialog.areaVisibleCheckbox.checked = controller.getAreaVisible();
        dialog.areaVisibleCheckbox.parentElement.style.display = areaVisiblePanelDisplay;
        dialog.registerEventListener(dialog.areaVisibleCheckbox, 'input', function() {
          controller.setAreaVisible(dialog.areaVisibleCheckbox.checked);
        });
        controller.addPropertyChangeListener('AREA_VISIBLE', function(event) {
          dialog.areaVisibleCheckbox.checked = controller.getAreaVisible();
        });

        initFloorPanel(dialog);
        initCeilingPanel(dialog);
      },
      applier: function(dialog) {

        controller.setCeilingVisible(dialog.ceilingVisibleCheckBox.checked);

        var selectedCeilingShininessRadio = dialog.findElement('[name="ceiling-shininess-choice"]:checked');
        if (selectedCeilingShininessRadio != null) {
          controller.setCeilingShininess(parseFloat(selectedCeilingShininessRadio.value));
        }
        
        controller.modifyRooms();
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
 * @param {PolylineController} controller 
 */
JSViewFactory.prototype.createPolylineView = function(preferences, controller) {
  var viewFactory = this;

  return new JSDialogView(viewFactory, preferences, 
    '${PolylinePanel.polyline.title}', 
    document.getElementById("polyline-dialog-template"), {
      small: true,
      initializer: function(dialog) {

        dialog.colorSelector = viewFactory.createColorSelector(preferences, {
          onColorSelected: function(selectedColor) {
            controller.setColor(selectedColor);
          }
        });
        dialog.attachChildComponent('color-selector-button', dialog.colorSelector)
        dialog.colorSelector.set(controller.getColor());

        dialog.thicknessLabelElement = dialog.getElement('thickness-label');
        dialog.thicknessLabelElement.textContent = dialog.getLocalizedLabelText(
          'PolylinePanel', 'thicknessLabel.text', dialog.preferences.getLengthUnit().getName()
        );
        
        dialog.thicknessInput = new JSSpinner(viewFactory, preferences, dialog.getElement('thickness-input'), { 
          format: preferences.getLengthUnit().getFormat(),
          value: controller.getThickness(),
          step: dialog.getLengthInputStepSize(),
          nullable: controller.getThickness() == null,
          min: preferences.getLengthUnit().getMinimumLength(),
          max: 50,
        });

        dialog.dashOffsetInput = new JSSpinner(viewFactory, preferences, dialog.getElement('dash-offset-input'), { 
          value: controller.getDashOffset() == null ? null : controller.getDashOffset() * 100,
          step: 5,
          nullable: controller.getDashOffset() == null,
          min: 0,
          max: 100,
        });

        dialog.visibleIn3DCheckbox = dialog.getElement('visible-in-3D-checkbox');        
        dialog.visibleIn3DCheckbox.checked = controller.isElevationEnabled() && controller.getElevation() != null;
      },
      applier: function(dialog) {
        controller.setThickness(dialog.thicknessInput.value);
        if (dialog.visibleIn3DCheckbox.checked) {
          controller.setElevation(0);
        } else {
          controller.setElevation(null);
        }

        controller.setDashOffset(dialog.dashOffsetInput.value != null
              ? dialog.dashOffsetInput.value / 100
              : null);
        
        controller.modifyPolylines();
      },
      disposer: function(dialog) {
        dialog.colorSelector.dispose();
      }
    }
  );
}

JSViewFactory.prototype.createLabelView = function(modification, preferences, controller) {

  var viewFactory = this;

  return new JSDialogView(viewFactory, preferences, 
    '${LabelPanel.labelModification.title}', 
    document.getElementById("label-dialog-template"), {
      initializer: function(dialog) {

        dialog.nameInput = dialog.getElement('text');
        dialog.nameInput.value = modification ? controller.getText() : "Text";
        
        dialog.alignmentRadios = dialog.getRootNode().querySelectorAll('[name="label-alignment-radio"]');
        if (controller.getAlignment() != null) {
          var selectedAlignmentRadio = dialog.findElement('[name="label-alignment-radio"][value="' + TextStyle.Alignment[controller.getAlignment()] + '"]');
          if (selectedAlignmentRadio != null) {
            selectedAlignmentRadio.checked = true;
          }
        }
        
        dialog.textSizeLabel = dialog.getElement('text-size-label');
        dialog.textSizeLabel.textContent = dialog.getLocalizedLabelText(
          'LabelPanel', 'fontSizeLabel.text', dialog.preferences.getLengthUnit().getName()
        );
        
        dialog.textSizeInput = new JSSpinner(viewFactory, preferences, dialog.getElement('text-size-input'), { 
          format: preferences.getLengthUnit().getFormat(),
          value: controller.getFontSize(),
          step: dialog.getLengthInputStepSize(),
          nullable: controller.getFontSize() == null,
          min: 5,
          max: 999,
        });
        
        dialog.colorSelector = viewFactory.createColorSelector(preferences);
        dialog.attachChildComponent('color-selector-button', dialog.colorSelector)
        dialog.colorSelector.set(controller.getColor());
        
        var pitchEnabled = controller.isPitchEnabled() && controller.getPitch() != null;
        dialog.visibleIn3DCheckbox = dialog.getElement('visible-in-3D-checkbox');        
        dialog.visibleIn3DCheckbox.checked = pitchEnabled;
        
        dialog.pitchRadios = dialog.getRootNode().querySelectorAll('[name="label-pitch-radio"]');
        if (pitchEnabled) {
          var selectedPitch = controller.getPitch();
          if (selectedPitch != 0) {
            selectedPitch = 90;
          }
          var selectedPitchRadio = dialog.findElement('[name="label-pitch-radio"][value="' + selectedPitch + '"]');
          selectedPitchRadio.checked = true;
        }

        dialog.elevationLabel = dialog.getElement('elevation-label');
        dialog.elevationLabel.textContent = dialog.getLocalizedLabelText(
          'LabelPanel', 'elevationLabel.text', dialog.preferences.getLengthUnit().getName()
        );

        dialog.elevationInput = new JSSpinner(viewFactory, preferences, dialog.getElement('elevation-input'), { 
          format: preferences.getLengthUnit().getFormat(),
          value: controller.getElevation(),
          step: dialog.getLengthInputStepSize(),
          nullable: controller.getElevation() == null,
          min: 0,
          max: preferences.getLengthUnit().getMaximumElevation(),
        });
      },
      applier: function(dialog) {
        controller.setText(dialog.nameInput.value);

        for (var i = 0; i < dialog.alignmentRadios.length; i++) {
          if (dialog.alignmentRadios[i].checked) {
            controller.setAlignment(TextStyle.Alignment[dialog.alignmentRadios[i].value]);
          }
        }

        controller.setFontSize(dialog.textSizeInput.value);

        controller.setColor(dialog.colorSelector.get());

        if (dialog.visibleIn3DCheckbox.checked) {
          var pitch = 0;
          var pitch90Selected = dialog.findElement('[name="label-pitch-radio"][value="90"]:checked') != null;
          if (pitch90Selected) {
            pitch = Math.PI / 2;
          }
          controller.setPitch(pitch);
        } else {
          controller.setPitch(null);
        }

        controller.setElevation(dialog.elevationInput.value);

        if (modification) {
          controller.modifyLabels();
        } else {
          controller.createLabel();
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
