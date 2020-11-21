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
  var viewFactory = this;
  // TODO LOUIS create a dedicated dialog impl
  return new JSDialogView(viewFactory, preferences, 
    '${HomeFurniturePanel.homeFurniture.title}', 
    document.getElementById("home-furniture-dialog-template"), {
      initializer: function(dialog) {
        // TODO get through viewFactory
        dialog.colorSelector = new JSColorSelectorButton(viewFactory, preferences, dialog.getElement('color-selector-button'), {
          onColorSelected: function(color) {
            dialog.radioButtons[HomeFurnitureController.FurniturePaint.COLORED].checked = true;
            homeFurnitureController.setPaint(HomeFurnitureController.FurniturePaint.COLORED);
            homeFurnitureController.setColor(color);
          }
        });
        dialog.colorSelector.set(homeFurnitureController.getColor());
        
        // TODO get through viewFactory
        dialog.textureSelector = new JSTextureSelectorButton(viewFactory, preferences, homeFurnitureController.getTextureController(), dialog.getElement('texture-selector-button'));
        
        var selectedPaint = homeFurnitureController.getPaint();
  
        dialog.radioButtons = {};
        dialog.radioButtons[HomeFurnitureController.FurniturePaint.DEFAULT] = dialog.getRootNode().querySelector('[name="color-and-texture-choice"][value="default"]');
        dialog.radioButtons[HomeFurnitureController.FurniturePaint.COLORED] = dialog.getRootNode().querySelector('[name="color-and-texture-choice"][value="color"]');
        dialog.radioButtons[HomeFurnitureController.FurniturePaint.TEXTURED] = dialog.getRootNode().querySelector('[name="color-and-texture-choice"][value="texture"]');
        
        var radioButtonsArray = [];
        for (var paint in dialog.radioButtons) {
          paint = parseInt(paint); // converts from string to FurniturePaint
          var radioButton = dialog.radioButtons[paint];
          radioButton.dataset['paint'] = paint;
          radioButtonsArray.push(radioButton);
          if (paint == selectedPaint || paint == HomeFurnitureController.FurniturePaint.DEFAULT && !dialog.radioButtons[selectedPaint]) {
            radioButton.checked = true;
          } else {
            radioButton.checked = false;
          }
        }
  
        dialog.registerEventListener(
          radioButtonsArray, 
          'change', 
          function(event) { 
            var selectedPaint = parseInt(event.target.dataset['paint']);
            homeFurnitureController.setPaint(selectedPaint);
          });
      },
      applier: function(dialog) {
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
  return {
    displayView: function(parent) {
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

      JSViewFactory.displayColorPicker(leftSide ? wallController.getLeftSideColor() : wallController.getRightSideColor(),
        function(selectedColor) {
          if (leftSide) {
            wallController.setLeftSidePaint(WallController.WallPaint.COLORED);
            wallController.setLeftSideColor(selectedColor);
          } else {
            wallController.setRightSidePaint(WallController.WallPaint.COLORED);
            wallController.setRightSideColor(selectedColor);
          }
          wallController.modifyWalls();
        });
    }
  };
}

JSViewFactory.prototype.createRoomView = function(preferences, roomController) {
  return {
    displayView: function(parent) {
      JSViewFactory.displayColorPicker(roomController.getFloorColor(),
        function(selectedColor) {
          roomController.setFloorPaint(RoomController.RoomPaint.COLORED);
          roomController.setFloorColor(selectedColor);
          roomController.modifyRooms();
        });
    }
  };
}

JSViewFactory.prototype.createPolylineView = function(preferences, polylineController) {
  return {
    displayView: function(parent) {
      JSViewFactory.displayColorPicker(polylineController.getColor(),
        function(selectedColor) {
          polylineController.setColor(selectedColor);
          polylineController.modifyPolylines();
        });
    }
  };
}

JSViewFactory.prototype.createLabelView = function(modification, preferences, labelController) {
  return {
    displayView: function(parentView) {
      var text = prompt(ResourceAction.getLocalizedLabelText(preferences, "LabelPanel", "textLabel.text"),
        modification ? labelController.getText() : "Text")
      if (text != null) {
        labelController.setText(text);
        if (modification) {
          labelController.modifyLabels();
        } else {
          labelController.createLabel();
        }
      }
    }
  };
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

JSViewFactory.prototype.createTextureChoiceView = function(preferences, textureChoiceController) {
  return new JSTextureSelectorDialog(this, preferences, textureChoiceController);
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
