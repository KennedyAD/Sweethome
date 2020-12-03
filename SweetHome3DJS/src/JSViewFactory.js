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

// Creates a dummy color input to propose a minimal color change as editing view 
JSViewFactory.displayColorPicker = function(defaultColor, changeListener) {
  if (!OperatingSystem.isInternetExplorerOrLegacyEdge()) {
    var div = document.createElement("div");
    colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.style.width = "1px";
    colorInput.style.height = "1px";
    div.appendChild(colorInput);
    document.getElementById("home-plan").appendChild(div);

    var listener = function() {
      colorInput.removeEventListener("change", listener);
      changeListener(ColorTools.hexadecimalStringToInteger(colorInput.value));
      document.getElementById("home-plan").removeChild(div);
    };
    colorInput.value = defaultColor != null && defaultColor != 0
      ? ColorTools.integerToHexadecimalString(defaultColor)
      : "#010101"; // Color different from black required on some browsers
    colorInput.addEventListener("change", listener);
    setTimeout(function() {
      colorInput.click();
    }, 100);
  }
}

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

JSViewFactory.prototype.createWizardView = function(preferences, wizardController) {
  return dummyDialogView;
}

JSViewFactory.prototype.createBackgroundImageWizardStepsView = function(backgroundImage, preferences, backgroundImageWizardController) {
  return null;
}

JSViewFactory.prototype.createImportedFurnitureWizardStepsView = function(piece, modelName, importHomePiece, preferences, importedFurnitureWizardController) {
  return null;
}

JSViewFactory.prototype.createImportedTextureWizardStepsView = function(texture, textureName, preferences, importedTextureWizardController) {
  return null;
}

JSViewFactory.prototype.createUserPreferencesView = function(preferences, userPreferencesController) {
  return dummyDialogView;
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
  
  // TODO LOUIS create a dedicated dialog impl
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

        dialog.colorLabel = dialog.getElement('color-selector-label');
        dialog.colorLabel.textContent = ResourceAction.getLocalizedLabelText(
          dialog.preferences, 
          'WallPanel', 
          leftSide ? 'leftSideColorRadioButton.text' : 'rightSideColorRadioButton.text',
          dialog.preferences.getLengthUnit().getName()
        );

        dialog.colorSelector = viewFactory.createColorSelector(preferences, {
          onColorSelected: function(selectedColor) {
            if (leftSide) {
              wallController.setLeftSidePaint(WallController.WallPaint.COLORED);
              wallController.setLeftSideColor(selectedColor);
            } else {
              wallController.setRightSidePaint(WallController.WallPaint.COLORED);
              wallController.setRightSideColor(selectedColor);
            }
          }
        });
        dialog.attachChildComponent('color-selector-button', dialog.colorSelector)
        dialog.colorSelector.set(leftSide ? wallController.getLeftSideColor() : wallController.getRightSideColor());
        
        dialog.getElement('wall-orientation-label').innerHTML = ResourceAction.getLocalizedLabelText(
          dialog.preferences, 
          'WallPanel', 
          'wallOrientationLabel.text',
          'lib/wallOrientation.png'
        );
      },
      applier: function(dialog) {
        
        wallController.modifyWalls();
      },
      disposer: function(dialog) {
        dialog.colorSelector.dispose();
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
        dialog.thicknessLabelElement.textContent = ResourceAction.getLocalizedLabelText(
          dialog.preferences, 'PolylinePanel', 'thicknessLabel.text', dialog.preferences.getLengthUnit().getName()
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
        dialog.textSizeLabel.textContent = ResourceAction.getLocalizedLabelText(
          dialog.preferences, 'LabelPanel', 'fontSizeLabel.text', dialog.preferences.getLengthUnit().getName()
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
        dialog.elevationLabel.textContent = ResourceAction.getLocalizedLabelText(
          dialog.preferences, 'LabelPanel', 'elevationLabel.text', dialog.preferences.getLengthUnit().getName()
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
