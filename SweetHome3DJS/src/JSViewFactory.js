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

    var updateHorizontalAxisRadioButtons = function() {
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

JSViewFactory.prototype.createWallView = function(preferences, controller) {

  var viewFactory = this;

  function initStartAndEndPointsPanel(dialog) {
    var maximumLength = preferences.getLengthUnit().getMaximumLength();

    var xStartLabel = dialog.getElement('x-start-label');
    var yStartLabel = dialog.getElement('y-start-label');
    var xStartInput = new JSSpinner(viewFactory, preferences, dialog.getElement('x-start-input'), {
      format: preferences.getLengthUnit().getFormat(),
      value: controller.getXStart(),
      step: dialog.getLengthInputStepSize(),
      nullable: controller.getXStart() == null,
      min: -maximumLength,
      max: maximumLength,
    });
    var yStartInput = new JSSpinner(viewFactory, preferences, dialog.getElement('y-start-input'), {
      format: preferences.getLengthUnit().getFormat(),
      value: controller.getYStart(),
      step: dialog.getLengthInputStepSize(),
      nullable: controller.getYStart() == null,
      min: -maximumLength,
      max: maximumLength,
    });
    var xEndLabel = dialog.getElement('x-end-label');
    var yEndLabel = dialog.getElement('y-end-label');
    var distanceToEndPointLabel = dialog.getElement('distance-to-end-point-label');
    var xEndInput = new JSSpinner(viewFactory, preferences, dialog.getElement('x-end-input'), {
      format: preferences.getLengthUnit().getFormat(),
      value: controller.getXEnd(),
      step: dialog.getLengthInputStepSize(),
      nullable: controller.getXEnd() == null,
      min: -maximumLength,
      max: maximumLength,
    });
    var yEndInput = new JSSpinner(viewFactory, preferences, dialog.getElement('y-end-input'), {
      format: preferences.getLengthUnit().getFormat(),
      value: controller.getYEnd(),
      step: dialog.getLengthInputStepSize(),
      nullable: controller.getYEnd() == null,
      min: -maximumLength,
      max: maximumLength,
    });
    var distanceToEndPointInput = new JSSpinner(viewFactory, preferences, dialog.getElement('distance-to-end-point-input'), {
      format: preferences.getLengthUnit().getFormat(),
      value: controller.getDistanceToEndPoint(),
      step: dialog.getLengthInputStepSize(),
      nullable: controller.getDistanceToEndPoint() == null,
      min: preferences.getLengthUnit().getMinimumLength(),
      max: 2 * maximumLength * Math.sqrt(2),
    });

    var unitName = preferences.getLengthUnit().getName();
    xStartLabel.textContent = dialog.getLocalizedLabelText('WallPanel', 'xLabel.text', unitName)
    xEndLabel.textContent = dialog.getLocalizedLabelText('WallPanel', 'xLabel.text', unitName)
    yStartLabel.textContent = dialog.getLocalizedLabelText('WallPanel', 'yLabel.text', unitName)
    yEndLabel.textContent = dialog.getLocalizedLabelText('WallPanel', 'yLabel.text', unitName)
    distanceToEndPointLabel.textContent = dialog.getLocalizedLabelText('WallPanel', 'distanceToEndPointLabel.text', unitName)

    controller.addPropertyChangeListener('X_START', function(event) {
      xStartInput.value = event.getNewValue();
    });
    controller.addPropertyChangeListener('Y_START', function(event) {
      yStartInput.value = event.getNewValue();
    });
    controller.addPropertyChangeListener('X_END', function(event) {
      xEndInput.value = event.getNewValue();
    });
    controller.addPropertyChangeListener('Y_END', function(event) {
      yEndInput.value = event.getNewValue();
    });
    controller.addPropertyChangeListener('DISTANCE_TO_END_POINT', function(event) {
      distanceToEndPointInput.value = event.getNewValue();
    });

    dialog.registerEventListener(xStartInput, 'input', function() {
      controller.setXStart(xStartInput.value);
    });
    dialog.registerEventListener(yStartInput, 'input', function() {
      controller.setYStart(yStartInput.value);
    });
    dialog.registerEventListener(xEndInput, 'input', function() {
      controller.setXEnd(xEndInput.value);
    });
    dialog.registerEventListener(yEndInput, 'input', function() {
      controller.setYEnd(yEndInput.value);
    });
    dialog.registerEventListener(distanceToEndPointInput, 'input', function() {
      controller.setDistanceToEndPoint(distanceToEndPointInput.value);
    });
  }

  function initLeftAndRightSidesPanels(dialog) {

    // Find which wall side is the closest to the pointer location
    var home = controller.home;
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

    var leftSidePaintRadioColor = dialog.findElement('[name="left-side-color-and-texture-choice"][value="COLORED"]');
    var leftSidePaintRadioTexture = dialog.findElement('[name="left-side-color-and-texture-choice"][value="TEXTURED"]');
    var rightSidePaintRadioColor = dialog.findElement('[name="right-side-color-and-texture-choice"][value="COLORED"]');
    var rightSidePaintRadioTexture = dialog.findElement('[name="right-side-color-and-texture-choice"][value="TEXTURED"]');

    var updateLeftSidePaint = function() {
      leftSidePaintRadioColor.checked = controller.getLeftSidePaint() == WallController.WallPaint.COLORED;
      leftSidePaintRadioTexture.checked = controller.getLeftSidePaint() == WallController.WallPaint.TEXTURED;
    }
    var updateRightSidePaint = function() {
      rightSidePaintRadioColor.checked = controller.getRightSidePaint() == WallController.WallPaint.COLORED;
      rightSidePaintRadioTexture.checked = controller.getRightSidePaint() == WallController.WallPaint.TEXTURED;
    }

    updateLeftSidePaint();
    updateRightSidePaint();
    controller.addPropertyChangeListener('LEFT_SIDE_PAINT', function() {
      updateLeftSidePaint();
    });
    controller.addPropertyChangeListener('RIGHT_SIDE_PAINT', function() {
      updateRightSidePaint();
    });

    // Colors
    dialog.leftSideColorSelector = viewFactory.createColorSelector(preferences, {
      onColorSelected: function(selectedColor) {
        dialog.findElement('[name="left-side-color-and-texture-choice"][value="COLORED"]').checked = true;
        controller.setLeftSidePaint(WallController.WallPaint.COLORED);
        controller.setLeftSideColor(selectedColor);
      }
    });
    dialog.rightSideColorSelector = viewFactory.createColorSelector(preferences, {
      onColorSelected: function(selectedColor) {
        dialog.findElement('[name="right-side-color-and-texture-choice"][value="COLORED"]').checked = true;
        controller.setRightSidePaint(WallController.WallPaint.COLORED);
        controller.setRightSideColor(selectedColor);
      }
    });
    dialog.leftSideColorSelector = viewFactory.createColorSelector(preferences, {
      onColorSelected: function(selectedColor) {
        dialog.findElement('[name="left-side-color-and-texture-choice"][value="COLORED"]').checked = true;
        controller.setLeftSidePaint(WallController.WallPaint.COLORED);
        controller.setLeftSideColor(selectedColor);
      }
    });
    dialog.attachChildComponent('left-side-color-selector-button', dialog.leftSideColorSelector);
    dialog.attachChildComponent('right-side-color-selector-button', dialog.rightSideColorSelector);

    dialog.leftSideColorSelector.set(controller.getLeftSideColor());
    dialog.rightSideColorSelector.set(controller.getRightSideColor());
    controller.addPropertyChangeListener('LEFT_SIDE_COLOR', function() {
      dialog.leftSideColorSelector.set(controller.getLeftSideColor());
    });
    controller.addPropertyChangeListener('RIGHT_SIDE_COLOR', function() {
      dialog.rightSideColorSelector.set(controller.getRightSideColor());
    });

    // Textures
    dialog.leftSideTextureSelector = controller.getLeftSideTextureController().getView();
    dialog.leftSideTextureSelector.onTextureSelected = function(texture) {
      dialog.findElement('[name="left-side-color-and-texture-choice"][value="TEXTURED"]').checked = true;
      controller.setLeftSidePaint(WallController.WallPaint.TEXTURED);
      controller.getLeftSideTextureController().setTexture(texture);
    };
    dialog.attachChildComponent('left-side-texture-selector-button', dialog.leftSideTextureSelector);
    dialog.leftSideTextureSelector.set(controller.getLeftSideTextureController().getTexture());

    dialog.rightSideTextureSelector = controller.getRightSideTextureController().getView();
    dialog.rightSideTextureSelector.onTextureSelected = function(texture) {
      dialog.findElement('[name="right-side-color-and-texture-choice"][value="TEXTURED"]').checked = true;
      controller.setRightSidePaint(WallController.WallPaint.TEXTURED);
      controller.getRightSideTextureController().setTexture(texture);
    };
    dialog.attachChildComponent('right-side-texture-selector-button', dialog.rightSideTextureSelector);
    dialog.rightSideTextureSelector.set(controller.getRightSideTextureController().getTexture());

    // shininess
    var leftSideShininessRadioMatt = dialog.findElement('[name="left-side-shininess-choice"][value="0"]');
    var leftSideShininessRadioShiny = dialog.findElement('[name="left-side-shininess-choice"][value="0.25"]');
    var rightSideShininessRadioMatt = dialog.findElement('[name="right-side-shininess-choice"][value="0"]');
    var rightSideShininessRadioShiny = dialog.findElement('[name="right-side-shininess-choice"][value="0.25"]');

    var updateLeftSideShininess = function() {
      leftSideShininessRadioMatt.checked = controller.getLeftSideShininess() == 0;
      leftSideShininessRadioShiny.checked = controller.getLeftSideShininess() == 0.25;
    }
    var updateRightSideShininess = function() {
      rightSideShininessRadioMatt.checked = controller.getRightSideShininess() == 0;
      rightSideShininessRadioShiny.checked = controller.getRightSideShininess() == 0.25
    }

    updateLeftSideShininess();
    updateRightSideShininess();
    controller.addPropertyChangeListener('LEFT_SIDE_SHININESS', function() {
      updateLeftSideShininess();
    });
    controller.addPropertyChangeListener('RIGHT_SIDE_SHININESS', function() {
      updateRightSideShininess();
    });
    dialog.registerEventListener([leftSideShininessRadioMatt, leftSideShininessRadioShiny], 'input', function() {
      controller.setLeftSideShininess(parseFloat(this.value));
    });
    dialog.registerEventListener([rightSideShininessRadioMatt, rightSideShininessRadioShiny], 'input', function() {
      controller.setRightSideShininess(parseFloat(this.value));
    });

    // baseboards
    var leftSideBaseboardButton = dialog.getElement('left-side-modify-baseboard-button');
    var rightSideBaseboardButton = dialog.getElement('right-side-modify-baseboard-button');
    var leftSideBaseboardButtonAction = new ResourceAction(preferences, 'WallPanel', "MODIFY_LEFT_SIDE_BASEBOARD", true);
    var rightSideBaseboardButtonAction = new ResourceAction(preferences, 'WallPanel', "MODIFY_RIGHT_SIDE_BASEBOARD", true);
    leftSideBaseboardButton.textContent = leftSideBaseboardButtonAction.getValue(AbstractAction.NAME);
    rightSideBaseboardButton.textContent = rightSideBaseboardButtonAction.getValue(AbstractAction.NAME);
  }

  var initTopPanel = function(dialog) {

    var patternsTexturesByURL = {};
    var patterns = preferences.getPatternsCatalog().getPatterns();
    for (var i = 0; i < patterns.length; i++) {
      var url = patterns[i].getImage().getURL();
      patternsTexturesByURL[url] = patterns[i];
    }
    var patternComboBox = new JSComboBox(this.viewFactory, this.preferences, dialog.getElement('pattern-select'), {
      nullable: false,
      availableValues: Object.keys(patternsTexturesByURL),
      render: function(patternURL, patternItemElement) {
        patternItemElement.style.backgroundImage = "url('" + patternURL + "')";
      },
      onSelectionChanged: function(newValue) {
        controller.setPattern(patternsTexturesByURL[newValue]);
      }
    });

    var setPatternFromController = function() {
      var url = controller.getPattern().getImage().getURL();
      patternComboBox.set(url);
    }
    setPatternFromController();
    controller.addPropertyChangeListener('PATTERN', function() {
      setPatternFromController();
    });

    var topPaintRadioDefault = dialog.findElement('[name="top-color-choice"][value="DEFAULT"]');
    var topPaintRadioColor = dialog.findElement('[name="top-color-choice"][value="COLORED"]');
    var topPaintRadioButtons = [topPaintRadioColor, topPaintRadioDefault];
    var setTopPaintFromController = function() {
      topPaintRadioDefault.checked = controller.getTopPaint() == WallController.WallPaint.DEFAULT;
      topPaintRadioColor.checked = controller.getTopPaint() == WallController.WallPaint.COLORED;
    }

    dialog.registerEventListener(topPaintRadioButtons, 'click', function() {
      controller.setTopPaint(WallController.WallPaint[this.value]);
    });
    setTopPaintFromController();
    controller.addPropertyChangeListener('TOP_PAINT', function() {
      setTopPaintFromController();
    });

    dialog.topColorSelector = viewFactory.createColorSelector(preferences, {
      onColorSelected: function(selectedColor) {
        topPaintRadioColor.checked = true;
        controller.setTopPaint(WallController.WallPaint.COLORED);
        controller.setTopColor(selectedColor);
      }
    });
    dialog.attachChildComponent('top-color-selector-button', dialog.topColorSelector);
    dialog.topColorSelector.set(controller.getTopColor());
    controller.addPropertyChangeListener('TOP_COLOR', function() {
      dialog.topColorSelector.set(controller.getTopColor());
    });
  }

  var initHeightPanel = function(dialog) {
    var unitName = preferences.getLengthUnit().getName();
    dialog.getElement('rectangular-wall-height-label').textContent = dialog.getLocalizedLabelText('WallPanel', 'rectangularWallHeightLabel.text', unitName);

    var wallShapeRadioRectangular = dialog.findElement('[name="wall-shape-choice"][value="RECTANGULAR_WALL"]');
    var wallShapeRadioSloping = dialog.findElement('[name="wall-shape-choice"][value="SLOPING_WALL"]');

    dialog.registerEventListener([wallShapeRadioRectangular, wallShapeRadioSloping], 'input', function() {
      controller.setShape(WallController.WallShape[this.value]);
    });
    var setWallShapeFromController = function() {
      wallShapeRadioRectangular.checked = controller.getShape() == WallController.WallShape.RECTANGULAR_WALL;
      wallShapeRadioSloping.checked = controller.getShape() == WallController.WallShape.SLOPING_WALL;
    }
    setWallShapeFromController();
    controller.addPropertyChangeListener('SHAPE', function() {
      setWallShapeFromController();
    });

    var minimumLength = preferences.getLengthUnit().getMinimumLength();
    var maximumLength = preferences.getLengthUnit().getMaximumLength();
    var rectangularWallHeightInput = new JSSpinner(viewFactory, preferences, dialog.getElement('rectangular-wall-height-input'), {
      format: preferences.getLengthUnit().getFormat(),
      value: controller.getRectangularWallHeight(),
      step: dialog.getLengthInputStepSize(),
      nullable: controller.getRectangularWallHeight() == null,
      min: minimumLength,
      max: maximumLength,
    });
    controller.addPropertyChangeListener('RECTANGULAR_WALL_HEIGHT', function(event) {
      rectangularWallHeightInput.value = event.getNewValue();
    });
    dialog.registerEventListener(rectangularWallHeightInput, 'input', function() {
        controller.setRectangularWallHeight(rectangularWallHeightInput.value);
    });

    var minimumHeight = controller.getSlopingWallHeightAtStart() != null && controller.getSlopingWallHeightAtEnd() != null
        ? 0
        : minimumLength;
    var slopingWallHeightAtStartInput = new JSSpinner(viewFactory, preferences, dialog.getElement('sloping-wall-height-at-start-input'), {
      format: preferences.getLengthUnit().getFormat(),
      value: controller.getSlopingWallHeightAtStart(),
      step: dialog.getLengthInputStepSize(),
      nullable: controller.getSlopingWallHeightAtStart() == null,
      min: minimumHeight,
      max: maximumLength,
    });
    controller.addPropertyChangeListener('SLOPING_WALL_HEIGHT_AT_START', function(event) {
      slopingWallHeightAtStartInput.value = event.getNewValue();
    });
    dialog.registerEventListener(slopingWallHeightAtStartInput, 'input', function() {
      controller.setSlopingWallHeightAtStart(slopingWallHeightAtStartInput.value);
      if (minimumHeight == 0
          && controller.getSlopingWallHeightAtStart() == 0
          && controller.getSlopingWallHeightAtEnd() == 0) {
        // Ensure wall height is never 0
        controller.setSlopingWallHeightAtEnd(minimumLength);
      }
    });

    var slopingWallHeightAtEndInput = new JSSpinner(viewFactory, preferences, dialog.getElement('sloping-wall-height-at-end-input'), {
      format: preferences.getLengthUnit().getFormat(),
      value: controller.getSlopingWallHeightAtEnd(),
      step: dialog.getLengthInputStepSize(),
      nullable: controller.getSlopingWallHeightAtEnd() == null,
      min: minimumHeight,
      max: maximumLength,
    });
    controller.addPropertyChangeListener('SLOPING_WALL_HEIGHT_AT_END', function(event) {
      slopingWallHeightAtEndInput.value = event.getNewValue();
    });
    dialog.registerEventListener(slopingWallHeightAtEndInput, 'input', function() {
      controller.setSlopingWallHeightAtEnd(slopingWallHeightAtEndInput.value);
      if (minimumHeight == 0
          && controller.getSlopingWallHeightAtStart() == 0
          && controller.getSlopingWallHeightAtEnd() == 0) {
        // Ensure wall height is never 0
        controller.setSlopingWallHeightAtStart(minimumLength);
      }
    });

    dialog.getElement('thickness-label').textContent = dialog.getLocalizedLabelText('WallPanel', 'thicknessLabel.text', unitName);
    var thicknessInput = new JSSpinner(viewFactory, preferences, dialog.getElement('thickness-input'), {
      format: preferences.getLengthUnit().getFormat(),
      value: controller.getThickness(),
      step: dialog.getLengthInputStepSize(),
      nullable: controller.getThickness() == null,
      min: minimumLength,
      max: maximumLength / 10,
    });
    controller.addPropertyChangeListener('THICKNESS', function(event) {
      thicknessInput.value = event.getNewValue();
    });
    dialog.registerEventListener(thicknessInput, 'input', function() {
      controller.setThickness(thicknessInput.value);
    });

    dialog.getElement('arc-extent-label').textContent = dialog.getLocalizedLabelText('WallPanel', 'arcExtentLabel.text', unitName);
    var angleDecimalFormat = new DecimalFormat();
    angleDecimalFormat.maximumFractionDigits = 1;
    var arcExtentInput = new JSSpinner(this.viewFactory, this.preferences, dialog.getElement('arc-extent-input'), {
      nullable: controller.getArcExtentInDegrees() == null,
      format: angleDecimalFormat,
      value: 0,
      min: -270,
      max: 270,
      step: 5
    });
    var setArcExtentFromController = function() {
      arcExtentInput.value = controller.getArcExtentInDegrees();
    };
    setArcExtentFromController();
    controller.addPropertyChangeListener('ARC_EXTENT_IN_DEGREES', function(event) {
      setArcExtentFromController();
    });

    dialog.registerEventListener(arcExtentInput, 'input', function() {
      controller.setArcExtentInDegrees(arcExtentInput.value != null ? arcExtentInput.value : null);
    });
  }

  return new JSDialogView(viewFactory, preferences,
    '${WallPanel.wall.title}', 
    document.getElementById("wall-dialog-template"), {
      initializer: function(dialog) {

        initStartAndEndPointsPanel(dialog);
        initLeftAndRightSidesPanels(dialog);
        initTopPanel(dialog);
        initHeightPanel(dialog);

        dialog.getElement('wall-orientation-label').innerHTML = dialog.getLocalizedLabelText(
          'WallPanel', 
          'wallOrientationLabel.text',
          'lib/wallOrientation.png'
        );
      },
      applier: function(dialog) {
        controller.modifyWalls();
      },
      disposer: function(dialog) {
        dialog.leftSideColorSelector.dispose();
        dialog.rightSideColorSelector.dispose();
        dialog.leftSideTextureSelector.dispose();
        dialog.rightSideTextureSelector.dispose();
        dialog.topColorSelector.dispose();
      },
      size: 'medium'
    }
  );
}

/**
 * @param {UserPreferences} preferences
 * @param {RoomController} controller
 * @returns {JSDialogView}
 */
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

    // visible
    var ceilingVisibleDisplay = controller.isPropertyEditable('CEILING_VISIBLE') ? 'initial' : 'none';
    dialog.ceilingVisibleCheckBox = dialog.getElement('ceiling-visible-checkbox');
    dialog.ceilingVisibleCheckBox.checked = controller.getCeilingVisible();
    dialog.ceilingVisibleCheckBox.parentElement.style.display = ceilingVisibleDisplay;
    dialog.registerEventListener(dialog.ceilingVisibleCheckBox, 'input', function() {
      controller.setCeilingVisible(dialog.ceilingVisibleCheckBox.checked);
    });
    controller.addPropertyChangeListener('CEILING_VISIBLE', function(event) {
      dialog.ceilingVisibleCheckBox.checked = controller.getCeilingVisible();
    });

    // paint
    var ceilingColorCheckbox = dialog.findElement('[name="ceiling-color-and-texture-choice"][value="COLORED"]');
    dialog.ceilingColorSelector = viewFactory.createColorSelector(preferences, {
      onColorSelected: function(selectedColor) {
        ceilingColorCheckbox.checked = true;
        controller.setCeilingPaint(RoomController.RoomPaint.COLORED);
        controller.setCeilingColor(selectedColor);
      }
    });
    dialog.attachChildComponent('ceiling-color-selector-button', dialog.ceilingColorSelector)
    dialog.ceilingColorSelector.set(controller.getCeilingColor());

    var ceilingTextureCheckbox = dialog.findElement('[name="ceiling-color-and-texture-choice"][value="TEXTURED"]');
    dialog.ceilingTextureSelector = controller.getCeilingTextureController().getView();
    dialog.ceilingTextureSelector.onTextureSelected = function(texture) {
      ceilingTextureCheckbox.checked = true;
      controller.setCeilingPaint(RoomController.RoomPaint.TEXTURED);
      controller.getCeilingTextureController().setTexture(texture);
    };
    dialog.attachChildComponent('ceiling-texture-selector-button', dialog.ceilingTextureSelector);
    dialog.ceilingTextureSelector.set(controller.getCeilingTextureController().getTexture());

    dialog.registerEventListener([ceilingColorCheckbox, ceilingTextureCheckbox], 'input', function() {
      var selectedPaint = RoomController.RoomPaint[this.value];
      controller.setCeilingPaint(selectedPaint);
    });

    function setPaintFromController() {
      ceilingColorCheckbox.checked = controller.getCeilingPaint() == RoomController.RoomPaint.COLORED;
      ceilingTextureCheckbox.checked = controller.getCeilingPaint() == RoomController.RoomPaint.TEXTURED;
    }
    setPaintFromController();
    controller.addPropertyChangeListener('FLOOR_PAINT', setPaintFromController);

    var ceilingPaintDisplay = controller.isPropertyEditable('CEILING_PAINT') ? 'initial' : 'none';
    ceilingColorCheckbox.parentElement.parentElement.style.display = ceilingPaintDisplay;
    ceilingTextureCheckbox.parentElement.parentElement.style.display = ceilingPaintDisplay;
    dialog.getElement('ceiling-color-selector-button').style.display = ceilingPaintDisplay;
    dialog.getElement('ceiling-texture-selector-button').style.display = ceilingPaintDisplay;

    // Shininess
    var shininessRadioButtons = dialog.findElements('[name="ceiling-shininess-choice"]');
    dialog.registerEventListener(shininessRadioButtons, 'input', function() {
      controller.setCeilingShininess(parseFloat(this.value));
    });

    function setShininessFromController() {
      for (var i = 0; i < shininessRadioButtons.length; i++) {
        shininessRadioButtons[i].checked = controller.getCeilingShininess() == parseFloat(shininessRadioButtons[i].value);
      }
    }
    setShininessFromController();
    controller.addPropertyChangeListener('FLOOR_SHININESS', setPaintFromController);

    var ceilingShininessDisplay = controller.isPropertyEditable('CEILING_SHININESS') ? 'initial' : 'none';
    shininessRadioButtons[0].parentElement.parentElement = ceilingShininessDisplay;
  }

  function selectSplitSurroundingWallsAtFirstChange(dialog) {
    if (dialog.firstWallChange
        && dialog.splitSurroundingWallsCheckBox != null
        && !dialog.splitSurroundingWallsCheckBox.disabled) {
      dialog.splitSurroundingWallsCheckBox.checked = true;
      dialog.firstWallChange = false;
    }
  }

  function initWallSidesPanel(dialog) {

    // split surrounding walls
    function onSplitSurroundingWallsPropertyChanged() {
      dialog.splitSurroundingWallsCheckBox.disabled = !controller.isSplitSurroundingWallsNeeded();
      dialog.splitSurroundingWallsCheckBox.checked = controller.isSplitSurroundingWalls();
    }

    var splitSurroundingWallsDisplay = controller.isPropertyEditable('SPLIT_SURROUNDING_WALLS') ? 'initial' : 'none';
    dialog.splitSurroundingWallsCheckBox = dialog.getElement('split-surrounding-walls-checkbox');
    dialog.splitSurroundingWallsCheckBox.parentElement.style.display = splitSurroundingWallsDisplay;
    dialog.registerEventListener(dialog.splitSurroundingWallsCheckBox, 'input', function() {
      controller.setSplitSurroundingWalls(dialog.splitSurroundingWallsCheckBox.checked);
    });
    onSplitSurroundingWallsPropertyChanged();
    controller.addPropertyChangeListener('SPLIT_SURROUNDING_WALLS', function(event) {
      onSplitSurroundingWallsPropertyChanged();
    });

    // paint
    var wallSidesColorCheckbox = dialog.findElement('[name="wall-sides-color-and-texture-choice"][value="COLORED"]');
    dialog.wallSidesColorSelector = viewFactory.createColorSelector(preferences, {
      onColorSelected: function(selectedColor) {
        wallSidesColorCheckbox.checked = true;
        controller.setWallSidesPaint(RoomController.RoomPaint.COLORED);
        controller.setWallSidesColor(selectedColor);
      }
    });
    dialog.attachChildComponent('wall-sides-color-selector-button', dialog.wallSidesColorSelector)
    dialog.wallSidesColorSelector.set(controller.getWallSidesColor());

    var wallSidesTextureCheckbox = dialog.findElement('[name="wall-sides-color-and-texture-choice"][value="TEXTURED"]');
    dialog.wallSidesTextureSelector = controller.getWallSidesTextureController().getView();
    dialog.wallSidesTextureSelector.onTextureSelected = function(texture) {
      wallSidesTextureCheckbox.checked = true;
      controller.setWallSidesPaint(RoomController.RoomPaint.TEXTURED);
      controller.getWallSidesTextureController().setTexture(texture);
    };
    dialog.attachChildComponent('wall-sides-texture-selector-button', dialog.wallSidesTextureSelector);
    dialog.wallSidesTextureSelector.set(controller.getWallSidesTextureController().getTexture());

    dialog.registerEventListener([wallSidesColorCheckbox, wallSidesTextureCheckbox], 'input', function() {
      var selectedPaint = RoomController.RoomPaint[this.value];
      controller.setWallSidesPaint(selectedPaint);
    });

    function setPaintFromController() {
      wallSidesColorCheckbox.checked = controller.getWallSidesPaint() == RoomController.RoomPaint.COLORED;
      wallSidesTextureCheckbox.checked = controller.getWallSidesPaint() == RoomController.RoomPaint.TEXTURED;
    }
    setPaintFromController();
    controller.addPropertyChangeListener('FLOOR_PAINT', setPaintFromController);

    var wallSidesPaintDisplay = controller.isPropertyEditable('WALL_SIDES_PAINT') ? 'initial' : 'none';
    wallSidesColorCheckbox.parentElement.parentElement.style.display = wallSidesPaintDisplay;
    wallSidesTextureCheckbox.parentElement.parentElement.style.display = wallSidesPaintDisplay;
    dialog.getElement('wall-sides-color-selector-button').style.display = wallSidesPaintDisplay;
    dialog.getElement('wall-sides-texture-selector-button').style.display = wallSidesPaintDisplay;

    // Shininess
    var shininessRadioButtons = dialog.findElements('[name="wall-sides-shininess-choice"]');
    dialog.registerEventListener(shininessRadioButtons, 'input', function() {
      controller.setWallSidesShininess(parseFloat(this.value));
    });

    function setShininessFromController() {
      for (var i = 0; i < shininessRadioButtons.length; i++) {
        shininessRadioButtons[i].checked = controller.getWallSidesShininess() == parseFloat(shininessRadioButtons[i].value);
      }
    }
    setShininessFromController();
    controller.addPropertyChangeListener('FLOOR_SHININESS', setPaintFromController);

    var wallSidesShininessDisplay = controller.isPropertyEditable('WALL_SIDES_SHININESS') ? 'initial' : 'none';
    shininessRadioButtons[0].parentElement.parentElement.style.display = wallSidesShininessDisplay;

    if (wallSidesPaintDisplay == 'none' && wallSidesShininessDisplay == 'none') {
      dialog.getElement('wall-sides-panel').parentElement.style.display = 'none';
    }
  }

  function initWallSidesBaseboardPanel(dialog) {
    if (!controller.isPropertyEditable('WALL_SIDES_BASEBOARD')) {
      dialog.getElement('wall-sides-baseboard-panel').parentElement.style.display = 'none';
      return;
    }

    var baseboardComponentView = controller.getWallSidesBaseboardController().getView();
    dialog.attachChildComponent('wall-sides-baseboard-panel', baseboardComponentView);
    controller.getWallSidesBaseboardController().addPropertyChangeListener('VISIBLE', function() {
        selectSplitSurroundingWallsAtFirstChange(dialog);
    });
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
        initWallSidesPanel(dialog);
        initWallSidesBaseboardPanel(dialog);

        dialog.firstWallChange = true;
      },
      applier: function(dialog) {
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

  var initArrowsStyleComboBox = function(dialog) {

    var arrowsStyles = [];
    var arrowsStyleEnumValues = Object.keys(Polyline.ArrowStyle);
    for (var i = 0; i < arrowsStyleEnumValues.length; i++) {
      var arrowStyle = parseInt(arrowsStyleEnumValues[i]);
      if (!isNaN(arrowStyle)) {
        arrowsStyles.push(arrowStyle);
      }
    }

    /** @var {{ startStyle: number, endStyle: number }[]} */
    var arrowsStylesCombinations = [];
    for (var i = 0; i < arrowsStyles.length; i++) {
      for (var j = 0; j < arrowsStyles.length; j++) {
        arrowsStylesCombinations.push({ startStyle: arrowsStyles[i], endStyle: arrowsStyles[j] });
      }
    }

    var svgBase = `
    <svg style="top: calc(50% - 5px); position: relative;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 100">
      <defs>
        <marker id="startMarker%1$s" markerWidth="8" markerHeight="7" refX="1" refY="3.5" orient="auto">
           %2$s
        </marker>
        <marker id="endMarker%1$s" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto">
          %3$s
        </marker>
      </defs>
      <line x1="30" y1="50" x2="320" y2="50" stroke="#000" stroke-width="8" marker-start="url(#startMarker%1$s)" marker-end="url(#endMarker%1$s)" />
    </svg>`;

    var svgLeftArrow = '<polygon points="0 3.5, 8 0, 8 7" />';
    var svgRightArrow = '<polygon points="0 0, 9 3.5, 0 7" />';
    var svgLeftArrowOpen = '<polyline fill="none" stroke="black" stroke-width="1" points="8 0, 0 3.5, 8 7" />';
    var svgRightArrowOpen = '<polyline fill="none" stroke="black" stroke-width="1" points="0 1, 8 3.5, 0 6" />';
    var svgDisc = ' <circle cx="3.5" cy="3.5" r="3.5"/>';

    var comboBox = new JSComboBox(this.viewFactory, this.preferences, dialog.getElement('arrows-style-select'), {
      nullable: false,
      availableValues: arrowsStylesCombinations,
      render: function(arrowStyle, itemElement) {
        itemElement.style.border = 'none';
        itemElement.style.maxWidth = '6em';
        itemElement.style.margin = 'auto';

        var leftShape = '';
        switch (arrowStyle.startStyle) {
          case Polyline.ArrowStyle.DELTA:
            leftShape = svgLeftArrow;
            break;
          case Polyline.ArrowStyle.OPEN:
            leftShape = svgLeftArrowOpen;
            break;
          case Polyline.ArrowStyle.DISC:
            leftShape = svgDisc;
            break;
        }
        var rightShape = '';
        switch (arrowStyle.endStyle) {
          case Polyline.ArrowStyle.DELTA:
            rightShape = svgRightArrow;
            break;
          case Polyline.ArrowStyle.OPEN:
            rightShape = svgRightArrowOpen;
            break;
          case Polyline.ArrowStyle.DISC:
            rightShape = svgDisc;
            break;
        }

        var uid = UUID.randomUUID();
        itemElement.innerHTML = CoreTools.format(svgBase, [uid, leftShape, rightShape]);
      },
      onSelectionChanged: function(newValue) {
        controller.setStartArrowStyle(newValue.startStyle);
        controller.setEndArrowStyle(newValue.endStyle);
      }
    });

    var setFromController = function() {
      var startArrowStyle = controller.getStartArrowStyle();
      var endArrowStyle = controller.getEndArrowStyle();

      comboBox.enable(controller.isArrowsStyleEditable());
      comboBox.set({ startStyle: startArrowStyle, endStyle: endArrowStyle });
    };
    setFromController();
    controller.addPropertyChangeListener('START_ARROW_STYLE', setFromController);
    controller.addPropertyChangeListener('END_ARROW_STYLE', setFromController);
  }


  var initJoinStyleComboBox = function(dialog) {

    var joinStyles = [];
    var joinStyleEnumValues = Object.keys(Polyline.JoinStyle);
    for (var i = 0; i < joinStyleEnumValues.length; i++) {
      var joinStyle = parseInt(joinStyleEnumValues[i]);
      if (!isNaN(joinStyle)) {
        joinStyles.push(joinStyle);
      }
    }

    var comboBox = new JSComboBox(this.viewFactory, this.preferences, dialog.getElement('join-style-select'), {
      nullable: false,
      availableValues: joinStyles,
      render: function(joinStyle, itemElement) {
        itemElement.style.border = 'none';
        itemElement.style.textAlign = 'center';

        var canvasJoinStyle = 'miter';
        switch (joinStyle) {
          case Polyline.JoinStyle.BEVEL:
            canvasJoinStyle = 'bevel';
            break;
          case Polyline.JoinStyle.CURVED:
          case Polyline.JoinStyle.ROUND:
            canvasJoinStyle = 'round';
            break;
        }
        var canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 40;
        canvas.style.height = "100%";
        canvas.style.maxWidth = "100%";
        var canvasContext = canvas.getContext('2d');

        canvasContext.lineJoin = canvasJoinStyle;
        canvasContext.lineCap = "butt";
        canvasContext.lineWidth = 6;
        if (joinStyle == Polyline.JoinStyle.CURVED) {
          canvasContext.beginPath();
          canvasContext.ellipse(50, 30, 40, 10, 0, Math.PI, 0);
          canvasContext.stroke();
        } else {
          canvasContext.beginPath();
          canvasContext.moveTo(10, 10);
          canvasContext.lineTo(80, 10);
          canvasContext.lineTo(50, 35);
          canvasContext.stroke();
        }

        itemElement.appendChild(canvas);
      },
      onSelectionChanged: function(newValue) {
        controller.setJoinStyle(newValue);
      }
    });

    var setFromController = function() {
      comboBox.enable(controller.isJoinStyleEditable());
      comboBox.set(controller.getJoinStyle());
    };
    setFromController();
    controller.addPropertyChangeListener('JOIN_STYLE', setFromController);
  }

  var initDashStyleComboBox = function(dialog) {
    var dashStyles = [];
    var dashStyleEnumValues = Object.keys(Polyline.DashStyle);
    for (var i = 0; i < dashStyleEnumValues.length; i++) {
      var dashStyle = parseInt(dashStyleEnumValues[i]);
      if (!isNaN(dashStyle) && (dashStyle != Polyline.DashStyle.CUSTOMIZED || controller.getDashStyle() == Polyline.DashStyle.CUSTOMIZED)) {
        dashStyles.push(dashStyle);
      }
    }

    var comboBox = new JSComboBox(this.viewFactory, this.preferences, dialog.getElement('dash-style-select'), {
      nullable: false,
      availableValues: dashStyles,
      render: function(dashStyle, itemElement) {
        itemElement.style.border = 'none';
        itemElement.style.textAlign = 'center';
        itemElement.style.maxHeight = '2em';
        itemElement.style.minWidth = '4em';

        var factor = 10;

        var canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 100;
        canvas.style.width = "5em";
        canvas.style.maxWidth = "100%";
        canvas.style.height = "1em";
        var canvasContext = canvas.getContext('2d');
        canvasContext.imageSmoothingEnabled= false;

        canvasContext.lineWidth = 10;
        canvasContext.beginPath();
        canvasContext.moveTo(0, canvas.height / 2);
        var dashPattern = dashStyle != Polyline.DashStyle.CUSTOMIZED ? Polyline.DashStyle._$wrappers[dashStyle].getDashPattern() : controller.getDashPattern();

        dashPattern = dashPattern.map(x => x*factor)

        var dashOffset = controller.getDashOffset() != null ? controller.getDashOffset() : 0;
        canvasContext.setLineDash(dashPattern);
        canvasContext.lineDashOffset = dashOffset * canvas.width;
        canvasContext.lineTo(canvas.width, canvas.height / 2);
        canvasContext.stroke();

        itemElement.appendChild(canvas);
      },
      onSelectionChanged: function(newValue) {
        controller.setDashStyle(newValue);
      }
    });

    var dashOffsetInput = new JSSpinner(viewFactory, preferences, dialog.getElement('dash-offset-input'), {
      value: controller.getDashOffset() == null ? null : controller.getDashOffset() * 100,
      step: 5,
      nullable: controller.getDashOffset() == null,
      min: 0,
      max: 100,
    });
    dialog.registerEventListener(dashOffsetInput, 'input', function() {
      controller.setDashOffset(dashOffsetInput.value != null
          ? dashOffsetInput.value / 100
          : null);
    })
    controller.addPropertyChangeListener('DASH_OFFSET', function() {
      dashOffsetInput.value = controller.getDashOffset() == null ? null : controller.getDashOffset() * 100;
      comboBox.refreshUI();
    });

    var setDashStyleFromController = function() {
      dashOffsetInput.enable(controller.getDashStyle() != Polyline.DashStyle.SOLID);
      comboBox.set(controller.getDashStyle());
    };
    setDashStyleFromController();
    controller.addPropertyChangeListener('DASH_STYLE', setDashStyleFromController);
  }

  return new JSDialogView(viewFactory, preferences, 
    '${PolylinePanel.polyline.title}', 
    document.getElementById("polyline-dialog-template"), {
      size: 'small',
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

        initArrowsStyleComboBox(dialog);
        initJoinStyleComboBox(dialog);
        initDashStyleComboBox(dialog);

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

JSViewFactory.prototype.createBaseboardChoiceView = function(preferences, controller) {
  var viewFactory = this;

  var view = new JSComponentView(
      this,
      preferences,
      '  <div class="whole-line">' +
      '    <label>' +
      '      <input name="baseboard-visible-checkbox" type="checkbox"/>' +
      '      ${BaseboardChoiceComponent.visibleCheckBox.text}' +
      '    </label>' +
      '  </div>' +
      '' +
      '  <div class="whole-line">' +
      '    <label>' +
      '      <input type="radio" name="baseboard-color-and-texture-choice" value="sameColorAsWall"/>' +
      '      ${BaseboardChoiceComponent.sameColorAsWallRadioButton.text}' +
      '    </label>' +
      '  </div>' +
      '  <div>' +
      '    <label>' +
      '      <input type="radio" name="baseboard-color-and-texture-choice" value="COLORED">' +
      '        ${BaseboardChoiceComponent.colorRadioButton.text}' +
      '    </label>' +
      '  </div>' +
      '  <div data-name="baseboard-color-selector-button"></div>' +
      '' +
      '  <div>' +
      '    <label>' +
      '      <input type="radio" name="baseboard-color-and-texture-choice" value="TEXTURED">' +
      '        ${BaseboardChoiceComponent.textureRadioButton.text}' +
      '    </label>' +
      '  </div>' +
      '  <div data-name="baseboard-texture-selector-button"></div>' +
      '' +
      '  <div class="whole-line">' +
      '    <hr/>' +
      '  </div>' +
      '' +
      '  <div data-name="height-label" class="label-cell"></div>' +
      '  <div><span data-name="height-input"></span></div>' +
      '  <div data-name="thickness-label" class="label-cell"></div>' +
      '  <div><span data-name="thickness-input"></span></div>',
  {
    initializer: function(view) {
      view.getRootNode().dataset['name'] = 'baseboard-panel';

      // visible
      view.visibleCheckBox = view.getElement('baseboard-visible-checkbox');
      view.visibleCheckBox.checked = controller.getVisible();
      view.registerEventListener(view.visibleCheckBox, 'input', function() {
        controller.setVisible(view.visibleCheckBox.checked);
      });

      function onVisibleChanged() {
        var visible = controller.getVisible();
        view.visibleCheckBox.checked = visible;
        var componentsEnabled = visible !== false;
        for (var i = 0; i < view.colorAndTextureRadioButtons.length; i++) {
          view.colorAndTextureRadioButtons[i].disabled = !componentsEnabled;
        }
        view.colorSelector.enable(componentsEnabled);
        view.textureSelector.enable(componentsEnabled);
        view.heightInput.enable(componentsEnabled);
        view.thicknessInput.enable(componentsEnabled);
      }
      controller.addPropertyChangeListener('VISIBLE', function(event) {
        onVisibleChanged();
      });

      // paint
      var paintRadioSameAsWall = view.findElement('[name="baseboard-color-and-texture-choice"][value="sameColorAsWall"]');

      var paintRadioColor = view.findElement('[name="baseboard-color-and-texture-choice"][value="COLORED"]');
      view.colorSelector = viewFactory.createColorSelector(preferences, {
        onColorSelected: function(selectedColor) {
          paintRadioColor.checked = true;
          controller.setPaint(BaseboardChoiceController.BaseboardPaint.COLORED);
          controller.setColor(selectedColor);
        }
      });
      view.attachChildComponent('baseboard-color-selector-button', view.colorSelector)
      view.colorSelector.set(controller.getColor());

      var paintRadioTexture = view.findElement('[name="baseboard-color-and-texture-choice"][value="TEXTURED"]');
      view.textureSelector = controller.getTextureController().getView();
      view.textureSelector.onTextureSelected = function(texture) {
        paintRadioTexture.checked = true;
        controller.setPaint(BaseboardChoiceController.BaseboardPaint.TEXTURED);
        controller.getTextureController().setTexture(texture);
      };
      view.attachChildComponent('baseboard-texture-selector-button', view.textureSelector);
      view.textureSelector.set(controller.getTextureController().getTexture());

      view.colorAndTextureRadioButtons = [paintRadioSameAsWall, paintRadioColor, paintRadioTexture];
      view.registerEventListener(view.colorAndTextureRadioButtons, 'input', function() {
        if (this.checked) {
          var selectedPaint = this.value == 'sameColorAsWall'
              ? BaseboardChoiceController.BaseboardPaint.DEFAULT
              : BaseboardChoiceController.BaseboardPaint[this.value];
          controller.setPaint(selectedPaint);
        }
      });

      function setPaintFromController() {
        paintRadioSameAsWall.checked = controller.getPaint() == BaseboardChoiceController.BaseboardPaint.DEFAULT;
        paintRadioColor.checked = controller.getPaint() == BaseboardChoiceController.BaseboardPaint.COLORED;
        paintRadioTexture.checked = controller.getPaint() == BaseboardChoiceController.BaseboardPaint.TEXTURED;
      }
      setPaintFromController();
      controller.addPropertyChangeListener('PAINT', setPaintFromController);

      // height & thickness
      var unitName = preferences.getLengthUnit().getName();
      view.getElement('height-label').textContent = this.getLocalizedLabelText('BaseboardChoiceComponent', 'heightLabel.text', unitName);
      view.getElement('thickness-label').textContent = this.getLocalizedLabelText('BaseboardChoiceComponent', 'thicknessLabel.text', unitName);

      var minimumLength = preferences.getLengthUnit().getMinimumLength();
      view.heightInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('height-input'), {
        nullable: controller.getHeight() == null,
        format: preferences.getLengthUnit().getFormat(),
        step: view.getLengthInputStepSize(),
        min: minimumLength,
        max: controller.getMaxHeight() == null
            ? preferences.getLengthUnit().getMaximumLength() / 10
            : controller.getMaxHeight(),
        value: controller.getHeight() != null && controller.getMaxHeight() != null
            ? Math.min(controller.getHeight(), controller.getMaxHeight())
            : controller.getHeight()
      });
      view.thicknessInput = new JSSpinner(this.viewFactory, this.preferences, this.getElement('thickness-input'), {
        nullable: controller.getThickness() == null,
        format: preferences.getLengthUnit().getFormat(),
        step: view.getLengthInputStepSize(),
        min: minimumLength,
        max: 2,
        value: controller.getThickness()
      });

      controller.addPropertyChangeListener('HEIGHT', function(event) {
        view.heightInput.value = event.getNewValue();
      });
      controller.addPropertyChangeListener('MAX_HEIGHT', function(event) {
        if (event.getOldValue() == null
            || controller.getMaxHeight() != null
            && view.heightInput.max < controller.getMaxHeight()) {
          // Change max only if larger value to avoid taking into account intermediate max values
          // that may be fired by auto commit spinners while entering a value
          view.heightInput.max = controller.getMaxHeight();
        }
      });
      controller.addPropertyChangeListener('THICKNESS', function(event) {
        view.thicknessInput.value = event.getNewValue();
      });

      view.registerEventListener(view.heightInput, 'input', function() {
        controller.setHeight(view.heightInput.value);
      });
      view.registerEventListener(view.thicknessInput, 'input', function() {
        controller.setThickness(view.thicknessInput.value);
      });


      onVisibleChanged();
    },
    disposer: function(view) {
      view.colorSelector.dispose();
      view.textureSelector.dispose();
    }
  });

  return view;
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
 * @param {{onColorSelected: function(number)}} [options]
 * > onColorSelected: called with selected color, as RGB int, when a color is selected
 * 
 * @return {JSComponentView} 
 */
JSViewFactory.prototype.createColorSelector = function(preferences, options) {
  return new JSColorSelectorButton(this, preferences, null, options);
}
