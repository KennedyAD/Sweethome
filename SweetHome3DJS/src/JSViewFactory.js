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
    
        dialog.textureSelector = viewFactory.createTextureSelector(preferences, homeFurnitureController.getTextureController(), {
          onTextureSelected: function(texture) {
            dialog.radioButtons[FurniturePaint.TEXTURED].checked = true;
            homeFurnitureController.setPaint(FurniturePaint.TEXTURED);
            homeFurnitureController.getTextureController().setTexture(texture);
          }
        });
        dialog.attachChildComponent('texture-selector-button', dialog.textureSelector);
        dialog.textureSelector.set(homeFurnitureController.getTextureController().getTexture())
        
        var selectedPaint = homeFurnitureController.getPaint();
  
        dialog.radioButtons = [];
        dialog.radioButtons[FurniturePaint.DEFAULT] = dialog.findElement('[name="color-and-texture-choice"][value="default"]');
        dialog.radioButtons[FurniturePaint.COLORED] = dialog.findElement('[name="color-and-texture-choice"][value="color"]');
        dialog.radioButtons[FurniturePaint.TEXTURED] = dialog.findElement('[name="color-and-texture-choice"][value="texture"]');
        
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

/**********************************/
/** JS ONLY COMPONENTS           **/
/**********************************/

/**
 * Create a color selection component
 * @param {UserPreferences} preferences current user's preferences 
 * @param {{ onColorSelected: function(number) }} [options]
 * > onColorSelected: called with selected color, as RGB int, when a color is selected
 * 
 * @return {JSComponentView} 
 */
JSViewFactory.prototype.createColorSelector = function(preferences, options) {
  return new JSColorSelectorButton(this, preferences, null, options);
}

/**
 * Create a texture selection component

 * @param {UserPreferences} preferences current user's preferences 
 * @param {TextureChoiceController} textureChoiceController texture choice controller
 * @param {{ onTextureSelected: function(HomeTexture) }} [options]
 * > onTextureSelected: called with selected texture, when selection changed
 * 
 * @return {JSComponentView} 
 */
JSViewFactory.prototype.createTextureSelector = function(preferences, textureChoiceController, options) {
  return new JSTextureSelectorButton(this, preferences, textureChoiceController, null, options);
}