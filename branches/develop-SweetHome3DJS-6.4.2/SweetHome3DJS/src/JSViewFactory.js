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

JSViewFactory["__class"] = "JSViewFactory";
JSViewFactory["__interfaces"] = ["com.eteks.sweethome3d.viewcontroller.ViewFactory"];

JSViewFactory.dummyDialogView = {
  displayView: function(parent) { }
};

/**
 * @param {Controller} controller
 * @param {UserPreferences} preferences
 * @param {string} title title of the dialog
 * @param {string} message message to be displayed
 * @param {string} cancelButtonMessage
 * @param {string} keepUnchangedButtonMessage
 * @param {string} okButtonMessage
 * @param {function()} imageResizeRequested called when user selected "resize image" option
 * @param {function()} originalImageRequested called when user selected "keep image unchanged" option
 */
function JSPromptImageResizeDialog(controller, preferences,
                title, message, cancelButtonMessage, keepUnchangedButtonMessage, okButtonMessage, 
                imageResizeRequested, originalImageRequested) {
  this.controller = controller;
  this.preferences = preferences;
  this.cancelButtonMessage = JSComponent.substituteWithLocale(this.preferences, cancelButtonMessage);
  this.keepUnchangedButtonMessage = JSComponent.substituteWithLocale(this.preferences, keepUnchangedButtonMessage);
  this.okButtonMessage = JSComponent.substituteWithLocale(this.preferences, okButtonMessage);

  JSDialog.call(this, preferences,
      JSComponent.substituteWithLocale(this.preferences, title),
      "<div>" +
      JSComponent.substituteWithLocale(this.preferences, message) +
      "</div>",
      {
        applier: function(dialog) {
          if (dialog.resizeRequested) {
            imageResizeRequested();
          } else {
            originalImageRequested();
          }
        }
      });
}
JSPromptImageResizeDialog.prototype = Object.create(JSDialog.prototype);
JSPromptImageResizeDialog.prototype.constructor = JSPromptImageResizeDialog;

/**
 * Append dialog buttons to given panel
 * @param {HTMLElement} buttonsPanel Dialog buttons panel
 * @protected
 */
JSPromptImageResizeDialog.prototype.appendButtons = function(buttonsPanel) {
  buttonsPanel.innerHTML = JSComponent.substituteWithLocale(this.preferences,
      "<button class='dialog-ok-button'>" + this.okButtonMessage + "</button>"
      + "<button class='keep-image-unchanged-button dialog-ok-button'>" + this.keepUnchangedButtonMessage + "</button>"
      + "<button class='dialog-cancel-button'>" + this.cancelButtonMessage + "</button>");

  var dialog = this;
  var cancelButton = this.findElement(".dialog-cancel-button");
  this.registerEventListener(cancelButton, "click", function(ev) {
      dialog.cancel();
    });
  var okButtons = this.findElements(".dialog-ok-button");
  this.registerEventListener(okButtons, "click", function(ev) {
      dialog.resizeRequested = !ev.target.classList.contains("keep-image-unchanged-button");
      dialog.validate();
    });
};

JSViewFactory.prototype.createFurnitureCatalogView = function(catalog, preferences, furnitureCatalogController) {
  return new FurnitureCatalogListPanel("furniture-catalog", catalog, preferences, furnitureCatalogController);
}

/**
 * @param {Home} home
 * @param {UserPreferences} preferences
 * @param {FurnitureController} controller
 * @return {FurnitureListPanel | undefined} undefined if DOM element #furniture-view is not found (feature is disabled)
 */
JSViewFactory.prototype.createFurnitureView = function(home, preferences, controller) {
  if (document.getElementById("furniture-view") != null) {
    return new FurnitureTablePanel("furniture-view", home, preferences, controller);
  } else {
    return undefined;
  }
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
  return new JSWizardDialog(controller, preferences, 
      controller.getTitle() || "@{WizardPane.wizard.title}", 
      {
        size: "medium",
      });
}

JSViewFactory.prototype.createBackgroundImageWizardStepsView = function(backgroundImage, preferences, controller) {
  var LARGE_IMAGE_PIXEL_COUNT_THRESHOLD = 10000000;
  var LARGE_IMAGE_MAX_PIXEL_COUNT = 8000000;
  var CANVAS_TOUCHABLE_AREA_RADIUS = 10;

  var imageErrorListener = function(error) {
    console.warn("Error loading image: " + error);
    alert(ResourceAction.getLocalizedLabelText(preferences, "BackgroundImageWizardStepsPanel",
        "imageChoiceError"));
  }

  function JSBackgroundImageWizardStepsView() {
    JSComponent.call(this, preferences,
        '<div choiceStep>' +
        '  <div description>@{BackgroundImageWizardStepsPanel.imageChangeLabel.text}</div>' +
        '  <div class="buttons">' +
        '    <button selectImage></button>' +
        '    <input type="file" accept="image/*" style="display: none" /> ' +
        '  </div>' +
        '  <div preview>' +
        '    <img />' +
        '  </div>' +
        '</div>' +
        '<div scaleStep>' +
        '  <div>@{BackgroundImageWizardStepsPanel.scaleLabel.text}</div>' +
        '  <br />' +
        '  <div>' +
        '    <span data-name="scale-distance-label"></span>' +
        '    <span data-name="scale-distance-input"></span>' +
        '  </div>' +
        '  <br />' +
        '  <div class="preview-panel">' +
        '    <div preview>' +
        '      <canvas />' +
        '    </div>' +
        '    <div class="preview-controls">' +
        '      <div previewZoomIn></div>' +
        '      <br />' +
        '      <div previewZoomOut></div>' +
        '    </div>' +
        '  </div>' +
        '</div>' +
        '<div originStep>' +
        '  <div>@{BackgroundImageWizardStepsPanel.originLabel.text}</div>' +
        '  <br />' +
        '  <div>' +
          '    <span data-name="x-origin-label"></span>' +
          '    <span data-name="x-origin-input"></span>' +
          '    <span data-name="y-origin-label"></span>' +
          '    <span data-name="y-origin-input"></span>' +
        '  </div>' +
        '  <br />' +
        '  <div class="preview-panel">' +
        '    <div preview>' +
          '      <canvas />' +
        '    </div>' +
        '    <div class="preview-controls">' +
        '      <div previewZoomIn></div>' +
        '      <br />' +
        '      <div previewZoomOut></div>' +
        '    </div>' +
        '  </div>' +
        '</div>');

    this.controller = controller;
    this.getHTMLElement().classList.add("background-image-wizard");

    this.initImageChoiceStep();
    this.initScaleStep();
    this.initOriginStep();

    var component = this;
    controller.addPropertyChangeListener("STEP", function(ev) {
        component.updateStep();
      });
    controller.addPropertyChangeListener("IMAGE", function(ev) {
        component.updateImagePreviews();
      });

    this.updateImage(backgroundImage);
  }
  JSBackgroundImageWizardStepsView.prototype = Object.create(JSComponent.prototype);
  JSBackgroundImageWizardStepsView.prototype.constructor = JSBackgroundImageWizardStepsView;

  /**
   * @private
   */
  JSBackgroundImageWizardStepsView.prototype.initImageChoiceStep = function () {
    var component = this;
    component.imageChoiceStep = {
        panel: component.findElement("[choiceStep]"),
        description: component.findElement("[choiceStep] [description]"),
        selectButton: component.findElement("[choiceStep] [selectImage]"),
        imageChooser: component.findElement("[choiceStep] input[type='file']"),
        preview: component.findElement("[choiceStep] [preview] img"),
      };
    component.registerEventListener(component.imageChoiceStep.selectButton, "click", function(ev) {
        component.imageChoiceStep.imageChooser.click();
      });
    component.registerEventListener(component.imageChoiceStep.imageChooser, "input", function(ev) {
        var file = this.files[0];
        if (!file) {
          component.updateController(null);
        }
  
        var reader = new FileReader();
        reader.addEventListener("load", function(ev) {
            var image = new Image();
            image.addEventListener("load", function(ev) {
                component.updateController(image);
              });
            image.addEventListener("error", imageErrorListener);
            image.src = ev.target.result;
          });
        reader.addEventListener("error", imageErrorListener);
        reader.readAsDataURL(file);
      });
  }

  /**
   * @private
   */
  JSBackgroundImageWizardStepsView.prototype.initScaleStep = function () {
    var component = this;
    var unitName = preferences.getLengthUnit().getName();
    var maximumLength = preferences.getLengthUnit().getMaximumLength();

    component.scaleStep = {
        panel: component.findElement("[scaleStep]"),
        preview: component.findElement("[scaleStep] [preview] canvas"),
        previewZoomIn: component.findElement("[scaleStep] [previewZoomIn]"),
        previewZoomOut: component.findElement("[scaleStep] [previewZoomOut]"),
        scaleDistanceLabel: component.getElement("scale-distance-label"),
        scaleDistanceInput: new JSSpinner(preferences, component.getElement("scale-distance-input"), 
            {
              format: preferences.getLengthUnit().getFormat(),
              minimum: preferences.getLengthUnit().getMinimumLength(),
              maximum: maximumLength,
              stepSize: preferences.getLengthUnit().getStepSize()
            }),
      };

    component.scaleStep.scaleDistanceLabel.textContent = this.getLocalizedLabelText(
        "BackgroundImageWizardStepsPanel", "scaleDistanceLabel.text", unitName);
    component.registerEventListener(component.scaleStep.scaleDistanceInput, "input", function(ev) {
        controller.setScaleDistance(component.scaleStep.scaleDistanceInput.getValue() != null 
            ? parseFloat(component.scaleStep.scaleDistanceInput.getValue())
            : null);
      });
    var setScaleDistanceFromController = function() {
        var scaleDistance = controller.getScaleDistance();
        component.scaleStep.scaleDistanceInput.setNullable(scaleDistance === null);
        component.scaleStep.scaleDistanceInput.setValue(scaleDistance);
      };
    setScaleDistanceFromController();
    controller.addPropertyChangeListener("SCALE_DISTANCE", setScaleDistanceFromController);

    var zoomInButtonAction = new ResourceAction(preferences, "BackgroundImageWizardStepsPanel", "ZOOM_IN", true);
    var zoomOutButtonAction = new ResourceAction(preferences, "BackgroundImageWizardStepsPanel", "ZOOM_OUT", true);
    component.scaleStep.previewZoomIn.style.backgroundImage = "url('lib/" + zoomInButtonAction.getValue(AbstractAction.SMALL_ICON) + "')";
    component.registerEventListener(component.scaleStep.previewZoomIn, "click", function(ev) {
        component.scaleStep.preview.width *= 2;
        component.repaintScaleCanvas();
      });
    component.scaleStep.previewZoomOut.style.backgroundImage = "url('lib/" + zoomOutButtonAction.getValue(AbstractAction.SMALL_ICON) + "')";
    component.registerEventListener(component.scaleStep.previewZoomOut, "click", function(ev) {
        component.scaleStep.preview.width /= 2;
        component.repaintScaleCanvas();
      });
    controller.addPropertyChangeListener("SCALE_DISTANCE_POINTS", function() {
        component.repaintScaleCanvas();
      });

    component.repaintScaleCanvas();

    var canvas = this.scaleStep.preview;
    canvas.style.touchAction = "none";

    var mouseUp = function(ev) {
        if (canvas.dragging) {
          canvas.dragging = false;
          canvas.scaleDistanceStartReached = canvas.scaleDistanceEndReached = false;
        }
      };

    var mouseMove = function(ev) {
      ev.stopImmediatePropagation();

      var canvasRect = canvas.getBoundingClientRect();
      var pointerCoordinatesObject = ev.touches && ev.touches.length > 0 ? ev.touches[0] : ev;
      var x = pointerCoordinatesObject.clientX - canvasRect.x;
      var y = pointerCoordinatesObject.clientY - canvasRect.y;

      if (canvas.dragging) {
        var actualX = (component.selectedImage.width / canvas.width) * x;
        var actualY = (component.selectedImage.height / canvas.height) * y;
        var scaleDistancePoints = controller.getScaleDistancePoints();
        if (canvas.scaleDistanceStartReached) {
          scaleDistancePoints[0][0] = actualX;
          scaleDistancePoints[0][1] = actualY;
        } else {
          scaleDistancePoints[1][0] = actualX;
          scaleDistancePoints[1][1] = actualY;
        }
        controller.setScaleDistancePoints(
          scaleDistancePoints[0][0], scaleDistancePoints[0][1],
          scaleDistancePoints[1][0], scaleDistancePoints[1][1]
        );
        component.repaintScaleCanvas();
        return;
      }

      if (y < canvas.scaleDistanceStart.y + CANVAS_TOUCHABLE_AREA_RADIUS
          && y > canvas.scaleDistanceStart.y - CANVAS_TOUCHABLE_AREA_RADIUS
          && x < canvas.scaleDistanceStart.x + CANVAS_TOUCHABLE_AREA_RADIUS
          && x > canvas.scaleDistanceStart.x - CANVAS_TOUCHABLE_AREA_RADIUS) {

        canvas.scaleDistanceStartReached = true;
        canvas.style.cursor = "crosshair";
      } else if (y < canvas.scaleDistanceEnd.y + CANVAS_TOUCHABLE_AREA_RADIUS
          && y > canvas.scaleDistanceEnd.y - CANVAS_TOUCHABLE_AREA_RADIUS
          && x < canvas.scaleDistanceEnd.x + CANVAS_TOUCHABLE_AREA_RADIUS
          && x > canvas.scaleDistanceEnd.x - CANVAS_TOUCHABLE_AREA_RADIUS) {

        canvas.scaleDistanceEndReached = true;
        canvas.style.cursor = "crosshair";
      } else {

        canvas.scaleDistanceStartReached = canvas.scaleDistanceEndReached = false;
        canvas.style.cursor = "default";
      }
    };

    var mouseDown = function(ev) {
      ev.stopImmediatePropagation();
      mouseMove(ev);

      if (canvas.scaleDistanceStartReached || canvas.scaleDistanceEndReached) {
        canvas.dragging = true;
      }
    };

    this.registerEventListener(canvas, "mousedown", mouseDown, true);
    this.registerEventListener(canvas, "touchstart", mouseDown, true);
    this.registerEventListener(canvas, "mousemove", mouseMove, true);
    this.registerEventListener(canvas, "touchmove", mouseMove, true);
    this.registerEventListener(canvas, "mouseup", mouseUp, true);
    this.registerEventListener(canvas, "touchend", mouseUp, true);
  }

  /**
   * @private
   */
  JSBackgroundImageWizardStepsView.prototype.repaintScaleCanvas = function () {
    var canvas = this.scaleStep.preview;
    var canvasContext = canvas.getContext("2d");

    var image = this.selectedImage;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    if (image) {
      canvas.height = (image.height / image.width) * canvas.width;

      canvasContext.drawImage(image, 0, 0, canvas.width, canvas.height);

      var xFactor = canvas.width / image.width;
      var yFactor = canvas.height / image.height;

      var scaleDistancePoints = controller.getScaleDistancePoints();
      canvas.scaleDistanceStart = { x: xFactor * scaleDistancePoints [0][0], y: yFactor * scaleDistancePoints [0][1] };
      canvas.scaleDistanceEnd = { x: xFactor * scaleDistancePoints [1][0], y: yFactor * scaleDistancePoints [1][1] };

      canvasContext.strokeStyle = "blue";
      canvasContext.lineWidth = 3;
      canvasContext.lineCap = "square";
      canvasContext.lineJoin = "miter";
      canvasContext.moveTo(canvas.scaleDistanceStart.x, canvas.scaleDistanceStart.y);
      canvasContext.lineTo(canvas.scaleDistanceEnd.x, canvas.scaleDistanceEnd.y);
      canvasContext.closePath();
      canvasContext.stroke();

      canvasContext.fillStyle = "blue";
      canvasContext.arc(canvas.scaleDistanceStart.x, canvas.scaleDistanceStart.y, 5, 0, 2 * Math.PI);
      canvasContext.closePath();
      canvasContext.fill();

      canvasContext.arc(canvas.scaleDistanceEnd.x, canvas.scaleDistanceEnd.y, 5, 0, 2 * Math.PI);
      canvasContext.closePath();
      canvasContext.fill();
    }
  }

  /**
   * @private
   */
  JSBackgroundImageWizardStepsView.prototype.initOriginStep = function () {
    var component = this;
    var unitName = preferences.getLengthUnit().getName();
    var maximumLength = preferences.getLengthUnit().getMaximumLength();

    component.originStep = {
      panel: component.findElement("[originStep]"),
      preview: component.findElement("[originStep] [preview] canvas"),
      previewZoomIn: component.findElement("[originStep] [previewZoomIn]"),
      previewZoomOut: component.findElement("[originStep] [previewZoomOut]"),
      xOriginLabel: component.getElement("x-origin-label"),
      xOriginInput: new JSSpinner(preferences, component.getElement("x-origin-input"), 
          {
            format: preferences.getLengthUnit().getFormat(),
            value: controller.getXOrigin(),
            minimum: -maximumLength,
            maximum: maximumLength,
            stepSize: preferences.getLengthUnit().getStepSize()
          }),
      yOriginLabel: component.getElement("y-origin-label"),
      yOriginInput: new JSSpinner(preferences, component.getElement("y-origin-input"), 
          {
            format: preferences.getLengthUnit().getFormat(),
            value: controller.getYOrigin(),
            minimum: -maximumLength,
            maximum: maximumLength,
            stepSize: preferences.getLengthUnit().getStepSize()
          }),
    };

    component.originStep.xOriginLabel.textContent = this.getLocalizedLabelText(
        "BackgroundImageWizardStepsPanel", "xOriginLabel.text", unitName);
    component.originStep.yOriginLabel.textContent = this.getLocalizedLabelText(
        "BackgroundImageWizardStepsPanel", "yOriginLabel.text", unitName);
    component.registerEventListener([component.originStep.xOriginInput, component.originStep.yOriginInput], "input", function(ev) {
        controller.setOrigin(component.originStep.xOriginInput.getValue(), component.originStep.yOriginInput.getValue());
      });
    controller.addPropertyChangeListener("X_ORIGIN", function() {
      component.originStep.xOriginInput.setValue(controller.getXOrigin());
      component.repaintOriginCanvas();
    });
    controller.addPropertyChangeListener("Y_ORIGIN", function() {
      component.originStep.yOriginInput.setValue(controller.getYOrigin());
      component.repaintOriginCanvas();
    });

    var canvas = component.originStep.preview;

    var zoomInButtonAction = new ResourceAction(preferences, "BackgroundImageWizardStepsPanel", "ZOOM_IN", true);
    var zoomOutButtonAction = new ResourceAction(preferences, "BackgroundImageWizardStepsPanel", "ZOOM_OUT", true);
    component.originStep.previewZoomIn.style.backgroundImage = "url('lib/" + zoomInButtonAction.getValue(AbstractAction.SMALL_ICON) + "')";
    component.registerEventListener(component.originStep.previewZoomIn, "click", function(ev) {
      component.originStep.preview.width *= 2;
      component.repaintOriginCanvas();
    });
    component.originStep.previewZoomOut.style.backgroundImage = "url('lib/" + zoomOutButtonAction.getValue(AbstractAction.SMALL_ICON) + "')";
    component.registerEventListener(component.originStep.previewZoomOut, "click", function(ev) {
      component.originStep.preview.width /= 2;
      component.repaintOriginCanvas();
    });

    var mouseUp = function(ev) {
      component.isMovingOrigin = false;
      canvas.style.cursor = "default";
    };

    var mouseMove = function(ev) {
      ev.stopImmediatePropagation();
      if (component.isMovingOrigin) {
        var canvasRect = canvas.getBoundingClientRect();
        var pointerCoordinatesObject = ev.touches && ev.touches.length > 0 ? ev.touches[0] : ev;
        var x = pointerCoordinatesObject.clientX - canvasRect.left;
        var y = pointerCoordinatesObject.clientY - canvasRect.top;
        var actualX = (component.selectedImage.width / canvas.width) * x;
        var actualY = (component.selectedImage.height / canvas.height) * y;
        controller.setOrigin(actualX, actualY);
        component.repaintOriginCanvas();
      }
    };

    var mouseDown = function(ev) {
      component.isMovingOrigin = true;
      canvas.style.cursor = "crosshair";
      mouseMove(ev);
    };

    this.registerEventListener(canvas, "mousedown", mouseDown, true);
    this.registerEventListener(canvas, "touchstart", mouseDown, true);
    this.registerEventListener(canvas, "mousemove", mouseMove, true);
    this.registerEventListener(canvas, "touchmove", mouseMove, true);
    this.registerEventListener(canvas, "mouseup", mouseUp, true);
    this.registerEventListener(canvas, "touchend", mouseUp, true);
  }

  /**
   * @private
   */
  JSBackgroundImageWizardStepsView.prototype.repaintOriginCanvas = function () {
    var canvas = this.originStep.preview;
    var canvasContext = canvas.getContext("2d");
    var image = this.selectedImage;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    if (image) {
      canvas.height = (image.height / image.width) * canvas.width;
      canvasContext.drawImage(image, 0, 0, canvas.width, canvas.height);

      var xFactor = canvas.width / image.width;
      var yFactor = canvas.height / image.height;
      var originInCanvas = { x: xFactor * controller.getXOrigin(), y: yFactor * controller.getYOrigin() };

      canvasContext.fillStyle = "blue";
      canvasContext.arc(originInCanvas.x, originInCanvas.y, 5, 0, 2 * Math.PI);
      canvasContext.closePath();
      canvasContext.fill();
    }
  }

  /**
   * @param {"newImage"|"changeImage"} mode
   * @private
   */
  JSBackgroundImageWizardStepsView.prototype.setImageChoicePanelLabels = function (mode) {
    if (mode == "changeImage") {
      this.imageChoiceStep.description.innerHTML = this.getLocalizedLabelText(
          "BackgroundImageWizardStepsPanel", "imageChangeLabel.text");
      this.imageChoiceStep.selectButton.innerHTML = this.getLocalizedLabelText(
          "BackgroundImageWizardStepsPanel", "imageChangeButton.text");
    } else {
      this.imageChoiceStep.description.innerHTML = this.getLocalizedLabelText(
          "BackgroundImageWizardStepsPanel", "imageChoiceLabel.text");
      this.imageChoiceStep.selectButton.innerHTML = this.getLocalizedLabelText(
          "BackgroundImageWizardStepsPanel", "imageChoiceButton.text");
    }
  }

  /**
   * @param {BackgroundImage} backgroundImage
   * @private
   */
  JSBackgroundImageWizardStepsView.prototype.updateImage = function (backgroundImage) {
    if (backgroundImage == null) {
      this.setImageChoicePanelLabels("newImage");
      this.updateImagePreviews();
    } else {
      this.setImageChoicePanelLabels("changeImage");

      // In Java's version: BackgroundImageWizardStepsPanel, image is updated in EDT (using invokeLater) when wizard view is initialized
      // here, if we setImage right away, wizard won't be initialized yet, and next state enabled value won't be refreshed properly
      // with this setTimeout, we ensure this code runs in next event loop
      setTimeout(function() {
          controller.setImage(backgroundImage.getImage());
          controller.setScaleDistance(backgroundImage.getScaleDistance());
          controller.setScaleDistancePoints(backgroundImage.getScaleDistanceXStart(),
              backgroundImage.getScaleDistanceYStart(), backgroundImage.getScaleDistanceXEnd(),
              backgroundImage.getScaleDistanceYEnd());
          controller.setOrigin(backgroundImage.getXOrigin(), backgroundImage.getYOrigin());
        }, 100);
    }
  }

  /**
   * @param {HTMLImageElement?} image
   * @private
   */
  JSBackgroundImageWizardStepsView.prototype.updateController = function(image) {
    var view = this;
    var controller = this.controller;

    if (image != null) {
      var imageType = ImageTools.doesImageHaveAlpha(image) ? "image/png" : "image/jpeg";
      this.promptImageResize(image, imageType, function(image) {
        BlobURLContent.fromImage(image, imageType, function (content) {
            controller.setImage(content);
            view.setImageChoicePanelLabels("changeImage");
            var referenceBackgroundImage = controller.getReferenceBackgroundImage();
            if (referenceBackgroundImage != null
                && referenceBackgroundImage.getScaleDistanceXStart() < image.width
                && referenceBackgroundImage.getScaleDistanceXEnd() < image.width
                && referenceBackgroundImage.getScaleDistanceYStart() < image.height
                && referenceBackgroundImage.getScaleDistanceYEnd() < image.height) {
              // Initialize distance and origin with values of the reference image
              controller.setScaleDistance(referenceBackgroundImage.getScaleDistance());
              controller.setScaleDistancePoints(referenceBackgroundImage.getScaleDistanceXStart(),
                  referenceBackgroundImage.getScaleDistanceYStart(),
                  referenceBackgroundImage.getScaleDistanceXEnd(),
                  referenceBackgroundImage.getScaleDistanceYEnd());
              controller.setOrigin(referenceBackgroundImage.getXOrigin(), referenceBackgroundImage.getYOrigin());
            } else {
              // Initialize distance and origin with default values
              controller.setScaleDistance(null);
              var scaleDistanceXStart = image.width * 0.1;
              var scaleDistanceYStart = image.height / 2;
              var scaleDistanceXEnd = image.width * 0.9;
              controller.setScaleDistancePoints(scaleDistanceXStart, scaleDistanceYStart,
                  scaleDistanceXEnd, scaleDistanceYStart);
              controller.setOrigin(0, 0);
            }
          });
      });
    } else {
      controller.setImage(null);
      imageErrorListener("Image is null");
    }
  }

  /**
   * @param {HTMLImageElement} image
   * @param {string} imageType can be "image/png" or "image/jpeg" depending on image alpha channel requirements
   * @param {function(HTMLImageElement)} imageReady function called after resize with resized image (or with original image if resize was not necessary or declined by user)
   * @private
   */
  JSBackgroundImageWizardStepsView.prototype.promptImageResize = function (image, imageType, imageReady) {
    if (image.width * image.height < LARGE_IMAGE_PIXEL_COUNT_THRESHOLD) {
      imageReady(image);
      return;
    }

    var stepsView = this;
    var factor = Math.sqrt(LARGE_IMAGE_MAX_PIXEL_COUNT / (image.width * image.height));
    var reducedWidth = Math.round(image.width * factor);
    var reducedHeight = Math.round(image.height * factor);
    var promptDialog = new JSPromptImageResizeDialog(controller, preferences,
        "@{BackgroundImageWizardStepsPanel.reduceImageSize.title}",
        stepsView.getLocalizedLabelText(
            "BackgroundImageWizardStepsPanel", "reduceImageSize.message", [image.width, image.height, reducedWidth, reducedHeight]),
        "@{BackgroundImageWizardStepsPanel.reduceImageSize.cancel}",
        "@{BackgroundImageWizardStepsPanel.reduceImageSize.keepUnchanged}",
        "@{BackgroundImageWizardStepsPanel.reduceImageSize.reduceSize}",
        function() { // Resized image
          ImageTools.resize(image, reducedWidth, reducedHeight, imageReady, imageType);
        },
        function() { // Original image 
          imageReady(image); 
        });
    promptDialog.displayView();
  }

  /**
   * @private
   */
  JSBackgroundImageWizardStepsView.prototype.updateImagePreviews = function() {
    var component = this;
    var image = this.controller.getImage();

    delete this.imageChoiceStep.preview.src;
    delete this.scaleStep.preview.src;
    delete this.originStep.preview.src;
    if (image == null) {
      return;
    }

    TextureManager.getInstance().loadTexture(image, {
      textureUpdated: function(image) {
        component.imageChoiceStep.preview.src = image.src;

        component.selectedImage = image;
        if (image.width > 400) {
          component.scaleStep.preview.width = 400;
          component.originStep.preview.width = 400;
        }

        component.repaintScaleCanvas();
        component.repaintOriginCanvas();
      },
      textureError:  function(error) {
        imageErrorListener(error);
      }
    });
  };

  /**
   * Changes displayed view based on current step.
   */
  JSBackgroundImageWizardStepsView.prototype.updateStep = function() {
    var step = this.controller.getStep();
    switch (step) {
      case BackgroundImageWizardController.Step.CHOICE:
        this.imageChoiceStep.panel.style.display = "block";
        this.scaleStep.panel.style.display = "none";
        this.originStep.panel.style.display = "none";
        break;
      case BackgroundImageWizardController.Step.SCALE:
        this.imageChoiceStep.panel.style.display = "none";
        this.scaleStep.panel.style.display = "block";
        this.originStep.panel.style.display = "none";
        break;
      case BackgroundImageWizardController.Step.ORIGIN:
        this.imageChoiceStep.panel.style.display = "none";
        this.scaleStep.panel.style.display = "none";
        this.originStep.panel.style.display = "block";
        break;
    }
  };

  return new JSBackgroundImageWizardStepsView();
}

JSViewFactory.prototype.createImportedFurnitureWizardStepsView = function(piece, modelName, importHomePiece, preferences, importedFurnitureWizardController) {
  return null;
}

/**
 * @param {CatalogTexture} texture 
 * @param {string} textureName 
 * @param {UserPreferences} preferences 
 * @param {ImportedTextureWizardController} controller 
 * @return {JSComponent}
 */
JSViewFactory.prototype.createImportedTextureWizardStepsView = function(texture, textureName, preferences, controller) {
  var LARGE_IMAGE_PIXEL_COUNT_THRESHOLD = 640 * 640;
  var IMAGE_PREFERRED_MAX_SIZE = 512;
  var LARGE_IMAGE_MAX_PIXEL_COUNT = IMAGE_PREFERRED_MAX_SIZE * IMAGE_PREFERRED_MAX_SIZE;

  var imageErrorListener = function(error) {
    console.warn("Error loading image: " + error);
    alert(ResourceAction.getLocalizedLabelText(preferences, "ImportedTextureWizardStepsPanel",
        "imageChoiceErrorLabel.text"));
  }

  function ImportedTextureWizardStepsView() {
    JSComponent.call(this, preferences,
        '<div imageStep>' + 
        '  <div description>@{ImportedTextureWizardStepsPanel.imageChangeLabel.text}</div>' +
        '  <div class="buttons">' +
        '    <button changeImage>@{ImportedTextureWizardStepsPanel.imageChangeButton.text}</button>' +
        '    <button onclick="window.open(\'http://www.sweethome3d.com/fr/importTextures.jsp\', \'_blank\')">@{ImportedTextureWizardStepsPanel.findImagesButton.text}</button>' +
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
        '    <div>@{ImportedTextureWizardStepsPanel.nameLabel.text}</div> ' +
        '    <div>' +
        '      <input type="text" name="name" />' +
        '    </div> ' +
        '    <div>@{ImportedTextureWizardStepsPanel.categoryLabel.text}</div> ' +
        '    <div>' +
        '      <select name="category"></select>' +
        '    </div> ' +
        '    <div>@{ImportedTextureWizardStepsPanel.creatorLabel.text}</div> ' +
        '    <div>' +
        '      <input type="text" name="creator" />' +
        '    </div>' +
        '    <div data-name="width-label" class="label-cell"></div>' +
        '    <div> ' +
        '      <span data-name="width-input"></span>' +
        '    </div>' +
        '    <div data-name="height-label" class="label-cell"></div>' +
        '    <div>' +
        '      <span data-name="height-input"></span>' +
        '    </div>' +
        '  </div>' +
        '</div>');

    this.controller = controller;
    this.userCategory = new TexturesCategory(
        ResourceAction.getLocalizedLabelText(preferences, "ImportedTextureWizardStepsPanel", "userCategory"));
    this.getHTMLElement().classList.add("imported-texture-wizard");
    
    this.initComponents();

    var component = this;
    controller.addPropertyChangeListener("STEP", function(ev) {
        component.updateStep();
      });
  }
  ImportedTextureWizardStepsView.prototype = Object.create(JSComponent.prototype);
  ImportedTextureWizardStepsView.prototype.constructor = ImportedTextureWizardStepsView;

  /**
   * @private
   */
  ImportedTextureWizardStepsView.prototype.initComponents = function () {
    this.imageStepPanel = this.findElement("[imageStep]");
    this.imageStepDescription = this.findElement("[imageStep] [description]");
    this.changeImageButton = this.findElement("button[changeImage]");
    this.imageChooserInput = this.findElement("input[type='file']");
    this.previewPanel = this.findElement("[preview]");
  
    if (texture == null) {
      this.imageStepDescription.innerHTML = this.getLocalizedLabelText("ImportedTextureWizardStepsPanel", "imageChoiceLabel.text");
      this.changeImageButton.innerHTML = this.getLocalizedLabelText("ImportedTextureWizardStepsPanel", "imageChoiceButton.text");
    } else {
      this.imageStepDescription.innerHTML = this.getLocalizedLabelText("ImportedTextureWizardStepsPanel", "imageChangeLabel.text");
      this.changeImageButton.innerHTML = this.getLocalizedLabelText("ImportedTextureWizardStepsPanel", "imageChangeButton.text");
    }
  
    this.attributesStepPanel = this.findElement("[attributesStep]");
    this.attributesStepPanelDescription = this.findElement("[attributesStep] [description]");
    
    this.attributesPreviewPanel = this.findElement("[attributesStep] [preview]");
    
    this.nameInput = this.findElement("input[name='name']");
    this.categorySelect = this.findElement("select[name='category']");
    this.creatorInput = this.findElement("input[name='creator']");
  
    var unitName = preferences.getLengthUnit().getName();
    var minimumLength = preferences.getLengthUnit().getMinimumLength();
    var maximumLength = preferences.getLengthUnit().getMaximumLength();
    this.widthLabel = this.getElement("width-label"),
    this.widthLabel.textContent = this.getLocalizedLabelText(
        "ImportedTextureWizardStepsPanel", "widthLabel.text", unitName);
    this.widthInput = new JSSpinner(preferences, this.getElement("width-input"), 
        {
          format: preferences.getLengthUnit().getFormat(),
          minimum: minimumLength,
          maximum: maximumLength,
          stepSize: preferences.getLengthUnit().getStepSize()
        });
    this.heightLabel = this.getElement("height-label"),
    this.heightLabel.textContent = this.getLocalizedLabelText(
        "ImportedTextureWizardStepsPanel", "heightLabel.text", unitName);
    this.heightInput = new JSSpinner(preferences, this.getElement("height-input"), 
        {
          format: preferences.getLengthUnit().getFormat(),
          minimum: minimumLength,
          maximum: maximumLength,
          stepSize: preferences.getLengthUnit().getStepSize()
        });
    
    var component = this;
    this.registerEventListener(this.changeImageButton, "click", function(ev) {
        component.imageChooserInput.click();
      });  
    this.registerEventListener(this.imageChooserInput, "input", function(ev) {
        var file = component.imageChooserInput.files[0];
        if (!file) {
          component.updateController(null);
        }
        
        var reader = new FileReader();
        reader.addEventListener("load", function(ev) {
            var image = new Image();
            image.addEventListener("load", function(ev) {
                component.updateController(image, file.name);
              });
            image.addEventListener("error", imageErrorListener);
            image.src = ev.target.result;  
          });
        reader.addEventListener("error", imageErrorListener);
        reader.readAsDataURL(file);
      });
  
    controller.addPropertyChangeListener("IMAGE", function(ev) {
        component.updateImagePreviews();
      });
    controller.addPropertyChangeListener("WIDTH", function(ev) {
        component.updateImagePreviews();
      });
    controller.addPropertyChangeListener("HEIGHT", function(ev) {
        component.updateImagePreviews();
      });
  
    var categories = preferences.getTexturesCatalog().getCategories();
    if (this.findUserCategory(categories) == null) {
      categories = categories.concat([this.userCategory]);
    }
    for (var i = 0; i < categories.length; i++) {
      var option = document.createElement("option");
      option.value = categories[i].getName();
      option.textContent = categories[i].getName();
      option._category = categories[i];
      this.categorySelect.appendChild(option);
    }
  
    this.attributesStepPanelDescription.innerHTML = this.getLocalizedLabelText(
        "ImportedTextureWizardStepsPanel", "attributesLabel.text").replace("<html>", "");
    controller.addPropertyChangeListener("NAME", function() {
        if (component.nameInput.value.trim() != controller.getName()) {
          component.nameInput.value = controller.getName();
        }
      });
    this.registerEventListener(this.nameInput, "input", function(ev) {
        controller.setName(component.nameInput.value.trim());
      });
  
    controller.addPropertyChangeListener("CATEGORY", function(ev) {
        var category = controller.getCategory();
        if (category != null) {
          component.categorySelect.value = category.getName();
        }
      });
    this.registerEventListener(this.categorySelect, "change", function(ev) {
        var category = component.categorySelect.item(component.categorySelect.selectedIndex)._category;
        controller.setCategory(category);
      });
  
    controller.addPropertyChangeListener("CREATOR", function(ev) {
        if (component.creatorInput.value.trim() != controller.getCreator()) {
          component.creatorInput.value = controller.getCreator();
        }
      });
    this.registerEventListener(component.creatorInput, "input", function(ev) {
        controller.setCreator(component.creatorInput.value.trim());
      });
  
    controller.addPropertyChangeListener("WIDTH", function(ev) {
        component.widthInput.setValue(controller.getWidth());
      });
    this.registerEventListener(this.widthInput, "input", function(ev) {
        controller.setWidth(parseFloat(component.widthInput.value));
      });
  
    controller.addPropertyChangeListener("HEIGHT", function(ev) {
        component.heightInput.setValue(controller.getHeight());
      });
    this.registerEventListener(this.heightInput, "input", function(ev) {
        controller.setHeight(parseFloat(component.heightInput.value));
      });
  
    if (texture != null) {
      TextureManager.getInstance().loadTexture(texture.getImage(), 
          {
            textureUpdated: function(image) {
              component.updateController(image, texture);
            },
            textureError: function(error) {
              imageErrorListener(error);
            }
          });
    }
  }

  /**
   * @param {HTMLImageElement?} image 
   * @param {string|CatalogTexture} fileName
   * @private
   */
  ImportedTextureWizardStepsView.prototype.updateController = function(image, fileName) {
    var component = this;
    var controller = this.controller;
    if (image != null) {
      var textureName = "Texture";
      var catalogTexture = undefined;
      if (fileName instanceof CatalogTexture) {
        catalogTexture = fileName;
      } else { 
        // String
        if (fileName.lastIndexOf('.') > 0) {
          var parts = fileName.split(/\/|\\|\./);
          if (parts.length > 1) {
            textureName = parts [parts.length - 2];
          }
        }
      }
      var imageType = ImageTools.doesImageHaveAlpha(image) ? "image/png" : "image/jpeg";
      this.promptImageResize(image, imageType, function(image) {
          BlobURLContent.fromImage(image, imageType, function (content) {
              controller.setImage(content);
              if (catalogTexture !== undefined) {
                controller.setName(catalogTexture.getName());
                controller.setCategory(catalogTexture.getCategory());
                controller.setCreator(catalogTexture.getCreator());
                controller.setWidth(catalogTexture.getWidth());
                controller.setHeight(catalogTexture.getHeight());
              } else {
                controller.setName(textureName);
                var categories = component.preferences.getTexturesCatalog().getCategories();
                var userCategory = component.findUserCategory(categories) || component.userCategory;
                controller.setCategory(userCategory);
                controller.setCreator(null);
                var defaultWidth = 20;
                var lengthUnit = component.preferences.getLengthUnit();
                if (lengthUnit == LengthUnit.INCH || lengthUnit == LengthUnit.INCH_DECIMALS) {
                  defaultWidth = LengthUnit.inchToCentimeter(8);
                }
                controller.setWidth(defaultWidth);
                controller.setHeight(defaultWidth / image.width * image.height);
              }
            });
        });
    } else {
      controller.setImage(null);
      imageErrorListener("Image is null");
    }
  }

  /**
   * Returns user category if it exists among existing the given <code>categories</code>.
   * @param {TexturesCategory[]} categories 
   * @return {TexturesCategory | null} found user category, or null if not found
   */
  ImportedTextureWizardStepsView.prototype.findUserCategory = function(categories) {
    var categories = preferences.getTexturesCatalog().getCategories();
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].equals(this.userCategory)) {
        return categories[i];
      }
    }
    return null;
  }

  /**
   * @param {HTMLImageElement} image 
   * @param {string} imageType can be "image/png" or "image/jpeg" depending on image alpha channel requirements
   * @param {function(HTMLImageElement)} imageReady function called after resize with resized image (or with original image if resize was not necessary or declined by user)
   * @private
   */
  ImportedTextureWizardStepsView.prototype.promptImageResize = function (image, imageType, imageReady) {
    if (image.width * image.height < LARGE_IMAGE_PIXEL_COUNT_THRESHOLD) {
      imageReady(image);
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
    var promptDialog = new JSPromptImageResizeDialog(controller, preferences,
        "@{ImportedTextureWizardStepsPanel.reduceImageSize.title}",
        this.getLocalizedLabelText(
            "ImportedTextureWizardStepsPanel", "reduceImageSize.message", [image.width, image.height, reducedWidth, reducedHeight]),
        "@{ImportedTextureWizardStepsPanel.reduceImageSize.cancel}",
        "@{ImportedTextureWizardStepsPanel.reduceImageSize.keepUnchanged}",
        "@{ImportedTextureWizardStepsPanel.reduceImageSize.reduceSize}",
        function() { // Resized image
          ImageTools.resize(image, reducedWidth, reducedHeight, imageReady, imageType);
        },
        function() { // Original image 
          imageReady(image); 
        });
    promptDialog.displayView();
  }

  /**
   * @private
   */
  ImportedTextureWizardStepsView.prototype.updateImagePreviews = function() {
    this.previewPanel.innerHTML = "";
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
    
    this.attributesPreviewPanel.innerHTML = "";
    var previewImage = document.createElement("div");
    previewImage.style.backgroundImage = "url('" + image.src + "')";
    previewImage.style.backgroundRepeat = "repeat";

    var widthFactor = this.controller.getWidth() / 250;
    var heightFactor = this.controller.getHeight() / 250;
    previewImage.style.backgroundSize = "calc(100% * " + widthFactor + ") calc(100% * " + heightFactor + ")";  
    previewImage.classList.add("image");
    this.attributesPreviewPanel.appendChild(previewImage);
  }

  /**
   * Changes displayed view based on current step.
   */
  ImportedTextureWizardStepsView.prototype.updateStep = function() {
    var step = this.controller.getStep();
    switch (step) {
      case ImportedTextureWizardController.Step.IMAGE:
        this.imageStepPanel.style.display = "block";
        this.attributesStepPanel.style.display = "none";
        break;
      case ImportedTextureWizardController.Step.ATTRIBUTES:
        this.imageStepPanel.style.display = "none";
        this.attributesStepPanel.style.display = "block";
        break;
    }
  }

  return new ImportedTextureWizardStepsView();
}

/**
 * @param {UserPreferences} preferences 
 * @param {UserPreferencesController} controller 
 */
JSViewFactory.prototype.createUserPreferencesView = function(preferences, controller) {
  /**
   * @param {HTMLElement} element 
   * @return {boolean} true if element is displayed (not hidden by css rule)
   * @private
   */
  function isElementVisible(element) {
    if (element instanceof JSComponent) {
      element = element.getHTMLElement();
    }
    return window.getComputedStyle(element).display !== "none";
  }

  /**
   * Hides a preference row from any of its input element.
   * @param {HTMLElement} preferenceInput 
   */
  function disablePreferenceRow(preferenceInput) {
    preferenceInput.parentElement.style.display = "none";

    // Search root input cell
    var currentElement = preferenceInput;
    while (currentElement.parentElement != null && !currentElement.parentElement.classList.contains("user-preferences-dialog")) {
      currentElement = currentElement.parentElement;
    }

    // Hide input cell and its sibling label cell
    currentElement.style.display = "none";
    currentElement.previousElementSibling.style.display = "none";
  }

  var dialog = new JSDialog(preferences, 
      "@{UserPreferencesPanel.preferences.title}", 
      document.getElementById("user-preferences-dialog-template"), 
      {
        applier: function(dialog) {
          if (isElementVisible(dialog.languageSelect)) {
            var selectedLanguageOption = dialog.languageSelect.options[dialog.languageSelect.selectedIndex];
            controller.setLanguage(selectedLanguageOption != null ? selectedLanguageOption.value : null);
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
            controller.setNewWallThickness(parseFloat(dialog.newWallThicknessInput.getValue()));
          }
          if (isElementVisible(dialog.newWallHeightInput)) {
            controller.setNewWallHeight(parseFloat(dialog.newWallHeightInput.getValue()));
          }
          if (isElementVisible(dialog.newFloorThicknessInput)) {
            controller.setNewFloorThickness(parseFloat(dialog.newFloorThicknessInput.getValue()));
          }
          controller.modifyUserPreferences();
        }
      });
  

  // LANGUAGE
  dialog.languageSelect = dialog.getElement("language-select");
  var languageEnabled = controller.isPropertyEditable("LANGUAGE");
  if (languageEnabled) {
    var supportedLanguages = preferences.getSupportedLanguages();
    for (var i = 0; i < supportedLanguages.length; i++) {
      var languageCode = supportedLanguages[i].replace('_', '-');
      var languageDisplayName = languageCode;
      try {
        languageDisplayName = new Intl.DisplayNames([languageCode, "en"], { type: "language" }).of(languageCode);
        if (languageDisplayName == languageCode) {
          throw "No support for Intl.DisplayNames";
        }
        languageDisplayName = languageDisplayName.charAt(0).toUpperCase() + languageDisplayName.slice(1);
      } catch (ex) {
        languageDisplayName = {"bg": "Български",
                               "cs": "Čeština",
                               "de": "Deutsch",
                               "el": "Ελληνικά",
                               "en": "English",
                               "es": "Español",
                               "fr": "Français",
                               "it": "Italiano",
                               "ja": "日本語",
                               "hu": "Magyar",
                               "nl": "Nederlands",
                               "pl": "Polski",
                               "pt": "Português",
                               "ru": "Русский",
                               "sv": "Svenska",
                               "vi": "Tiếng Việt",
                               "zh-CN": "中文（中国）",
                               "zh-TW": "中文（台灣）"} [languageCode];
        if (languageDisplayName === undefined) {
          languageDisplayName = languageCode;
          console.log("Unknown display name for " + languageCode);
        }
      }

      var selected = languageCode == controller.getLanguage();
      var languageOption = JSComponent.createOptionElement(languageCode, languageDisplayName, selected);
      dialog.languageSelect.appendChild(languageOption);
    }
  } else {
    disablePreferenceRow(dialog.languageSelect);
  }

  // UNIT
  dialog.unitSelect = dialog.getElement("unit-select");
  var unitEnabled = controller.isPropertyEditable("UNIT");
  if (unitEnabled) {
    dialog.unitSelect.appendChild(
        JSComponent.createOptionElement("MILLIMETER", 
            preferences.getLocalizedString("UserPreferencesPanel", "unitComboBox.millimeter.text"),
            controller.getUnit() == LengthUnit.MILLIMETER));
    dialog.unitSelect.appendChild(
        JSComponent.createOptionElement("CENTIMETER", 
            preferences.getLocalizedString("UserPreferencesPanel", "unitComboBox.centimeter.text"),
            controller.getUnit() == LengthUnit.CENTIMETER));
    dialog.unitSelect.appendChild(
        JSComponent.createOptionElement("METER", 
            preferences.getLocalizedString("UserPreferencesPanel", "unitComboBox.meter.text"),
            controller.getUnit() == LengthUnit.METER));
    dialog.unitSelect.appendChild(
        JSComponent.createOptionElement("INCH", 
            preferences.getLocalizedString("UserPreferencesPanel", "unitComboBox.inch.text"),
            controller.getUnit() == LengthUnit.INCH));
    dialog.unitSelect.appendChild(
        JSComponent.createOptionElement("INCH_DECIMALS", 
            preferences.getLocalizedString("UserPreferencesPanel", "unitComboBox.inchDecimals.text"),
            controller.getUnit() == LengthUnit.INCH_DECIMALS));

    dialog.registerEventListener(dialog.unitSelect, "change", function(ev) {
        var selectedUnitOption = dialog.unitSelect.options[dialog.unitSelect.selectedIndex];
        controller.setUnit(selectedUnitOption != null ? LengthUnit[selectedUnitOption.value] : null);
      });
  } else {
    disablePreferenceRow(dialog.unitSelect);
  }

  // CURRENCY
  dialog.currencySelect = dialog.getElement("currency-select");
  dialog.valueAddedTaxCheckBox = dialog.getElement("value-added-tax-checkbox");
  var currencyEnabled = controller.isPropertyEditable("CURRENCY");
  var vatEnabled = controller.isPropertyEditable("VALUE_ADDED_TAX_ENABLED");
  var noCurrencyLabel = dialog.getLocalizedLabelText("UserPreferencesPanel", "currencyComboBox.noCurrency.text");
  if (currencyEnabled) {
    dialog.currencySelect.appendChild(JSComponent.createOptionElement("", noCurrencyLabel, !controller.getCurrency()));
    var currencies = Object.keys(UserPreferences.CURRENCIES);
    for (var i = 0; i < currencies.length; i++) {
      var currency = currencies[i];
      var currencyLabel = UserPreferences.CURRENCIES[currency];
      dialog.currencySelect.appendChild(JSComponent.createOptionElement(
          currency, currencyLabel, currency == controller.getCurrency()));
    }

    dialog.registerEventListener(dialog.currencySelect, "change", function(ev) {
        var selectedIndex = dialog.currencySelect.selectedIndex;
        var selectedCurrency = dialog.currencySelect.options[selectedIndex].value;
        controller.setCurrency(selectedCurrency ? selectedCurrency : null);
      });
    controller.addPropertyChangeListener("CURRENCY", function() {
        var option = dialog.currencySelect.querySelector("[value='" + (controller.getCurrency() ? controller.getCurrency() : "") + "']");
        option.selected = true;
        dialog.valueAddedTaxCheckBox.disabled = controller.getCurrency() == null;
      });

    // VALUE_ADDED_TAX_ENABLED
    dialog.valueAddedTaxCheckBox.parentElement.style.display = vatEnabled ? "initial" : "none";
    dialog.valueAddedTaxCheckBox.disabled = controller.getCurrency() == null;
    dialog.valueAddedTaxCheckBox.checked = controller.isValueAddedTaxEnabled();
    dialog.registerEventListener(dialog.valueAddedTaxCheckBox, "change", function(ev) {
        controller.setValueAddedTaxEnabled(dialog.valueAddedTaxCheckBox.checked);
      });
    controller.addPropertyChangeListener("VALUE_ADDED_TAX_ENABLED", function(ev) {
        dialog.valueAddedTaxCheckBox.disabled = controller.getCurrency() == null;
        dialog.valueAddedTaxCheckBox.checked = controller.isValueAddedTaxEnabled();
      });
  } else {
    disablePreferenceRow(dialog.currencySelect);
  }

  // FURNITURE_CATALOG_VIEWED_IN_TREE
  dialog.furnitureCatalogViewTreeRadio = dialog.findElement("[name='furniture-catalog-view-radio'][value='tree']");
  var furnitureCatalogViewEnabled = controller.isPropertyEditable("FURNITURE_CATALOG_VIEWED_IN_TREE");
  if (furnitureCatalogViewEnabled && false) {
    var selectedFurnitureCatalogView = controller.isFurnitureCatalogViewedInTree() ? "tree" : "list";
    dialog.findElement("[name='furniture-catalog-view-radio'][value='" + selectedFurnitureCatalogView + "']").checked = true;
  } else {
    disablePreferenceRow(dialog.furnitureCatalogViewTreeRadio);
  }

  // NAVIGATION_PANEL_VISIBLE 
  var navigationPanelEnabled = controller.isPropertyEditable("NAVIGATION_PANEL_VISIBLE");
  dialog.navigationPanelCheckbox = dialog.getElement("navigation-panel-checkbox");
  if (navigationPanelEnabled) {
    dialog.navigationPanelCheckbox.checked = controller.isNavigationPanelVisible();
  } else {
    disablePreferenceRow(dialog.navigationPanelCheckbox);
  }
  
  // AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED
  var aerialViewCenteredOnSelectionEnabled = controller.isPropertyEditable("AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED");
  dialog.aerialViewCenteredOnSelectionCheckbox = dialog.getElement("aerial-view-centered-on-selection-checkbox");
  if (aerialViewCenteredOnSelectionEnabled) {
    dialog.aerialViewCenteredOnSelectionCheckbox.checked = controller.isAerialViewCenteredOnSelectionEnabled();
  } else {
    disablePreferenceRow(dialog.aerialViewCenteredOnSelectionCheckbox);
  }
  
  // OBSERVER_CAMERA_SELECTED_AT_CHANGE
  var observerCameraSelectedAtChangeEnabled = controller.isPropertyEditable("OBSERVER_CAMERA_SELECTED_AT_CHANGE");
  dialog.observerCameraSelectedAtChangeCheckbox = dialog.getElement("observer-camera-selected-at-change-checkbox");
  if (observerCameraSelectedAtChangeEnabled) {
    dialog.observerCameraSelectedAtChangeCheckbox.checked = controller.isObserverCameraSelectedAtChange();
  } else {
    disablePreferenceRow(dialog.observerCameraSelectedAtChangeCheckbox);
  }
  
  // MAGNETISM
  var magnetismEnabled = controller.isPropertyEditable("MAGNETISM_ENABLED");
  dialog.magnetismCheckbox = dialog.getElement("magnetism-checkbox");
  if (magnetismEnabled) {
    dialog.magnetismCheckbox.checked = controller.isMagnetismEnabled();
  } else {
    disablePreferenceRow(dialog.magnetismCheckbox);
  }
  
  // RULERS
  var rulersEnabled = controller.isPropertyEditable("RULERS_VISIBLE");
  dialog.rulersCheckbox = dialog.getElement("rulers-checkbox");
  if (rulersEnabled && false) {
    dialog.rulersCheckbox.checked = controller.isRulersVisible();
  } else {
    disablePreferenceRow(dialog.rulersCheckbox);
  }
  
  // GRID
  var gridEnabled = controller.isPropertyEditable("GRID_VISIBLE");
  dialog.gridCheckbox = dialog.getElement("grid-checkbox");
  if (gridEnabled) {
    dialog.gridCheckbox.checked = controller.isGridVisible();
  } else {
    disablePreferenceRow(dialog.gridCheckbox);
  }

  // DEFAULT_FONT_NAME
  var defaultFontNameEnabled = controller.isPropertyEditable("DEFAULT_FONT_NAME");
  dialog.defaultFontNameSelect = dialog.getElement("default-font-name-select");
  if (defaultFontNameEnabled) {
    var DEFAULT_SYSTEM_FONT_NAME = "DEFAULT_SYSTEM_FONT_NAME";
    var setDefaultFontFromController = function() {
      var selectedValue = controller.getDefaultFontName() == null ? DEFAULT_SYSTEM_FONT_NAME : controller.getDefaultFontName();
      var selectedOption = dialog.defaultFontNameSelect.querySelector("[value='" + selectedValue + "']")
      if (selectedOption) {
        selectedOption.selected = true;
      }
    };

    CoreTools.loadAvailableFontNames(function(fonts) {
      fonts = [DEFAULT_SYSTEM_FONT_NAME].concat(fonts);
      for (var i = 0; i < fonts.length; i++) {
        var font = fonts[i];
        var label = i == 0 ? dialog.getLocalizedLabelText("FontNameComboBox", "systemFontName") : font;
        dialog.defaultFontNameSelect.appendChild(JSComponent.createOptionElement(font, label));
      }
      setDefaultFontFromController();
    });

    controller.addPropertyChangeListener("DEFAULT_FONT_NAME", setDefaultFontFromController);

    dialog.registerEventListener(dialog.defaultFontNameSelect, "change", function(ev) {
        var selectedValue = dialog.defaultFontNameSelect.querySelector("option:checked").value;
        controller.setDefaultFontName(selectedValue == DEFAULT_SYSTEM_FONT_NAME ? null : selectedValue);
      });
  } else {
    disablePreferenceRow(dialog.defaultFontNameSelect);
  }

  // FURNITURE ICON 
  dialog.iconTopViewRadio = dialog.findElement("[name='furniture-icon-radio'][value='topView']");
  dialog.iconSizeSelect = dialog.getElement("icon-size-select");
  var furnitureIconEnabled = controller.isPropertyEditable("FURNITURE_VIEWED_FROM_TOP");
  if (furnitureIconEnabled) {
    var selectedIconMode = controller.isFurnitureViewedFromTop() ? "topView" : "catalog";
    dialog.findElement("[name='furniture-icon-radio'][value='" + selectedIconMode + "']").checked = true;

    var iconSizes = [128, 256, 512 ,1024];
    for (var i = 0; i < iconSizes.length; i++) {
      var size = iconSizes[i];
      dialog.iconSizeSelect.appendChild(
          JSComponent.createOptionElement(size, size + '×' + size,
              controller.getFurnitureModelIconSize() == size));
    }

    /**
     * Called when furniture icon mode is selected, in order to enable icon size if necessary
     * @private
     */
    function iconModeSelected(dialog) {
      dialog.iconSizeSelect.disabled = !dialog.iconTopViewRadio.checked;
    }

    iconModeSelected(dialog);
    dialog.registerEventListener(dialog.findElements("[name='furniture-icon-radio']"), "change", function(ev) {
        iconModeSelected(dialog);
      });
  } else {
    disablePreferenceRow(dialog.iconTopViewRadio);
  }

  // ROOM_FLOOR_COLORED_OR_TEXTURED
  dialog.roomRenderingFloorColorOrTextureRadio = dialog.findElement("[name='room-rendering-radio'][value='floorColorOrTexture']");
  var roomRenderingEnabled = controller.isPropertyEditable("ROOM_FLOOR_COLORED_OR_TEXTURED");
  if (roomRenderingEnabled) {
    var roomRenderingValue = controller.isRoomFloorColoredOrTextured() ? "floorColorOrTexture" : "monochrome";
    dialog.findElement("[name='room-rendering-radio'][value='" + roomRenderingValue + "']").checked = true;
  } else {
    disablePreferenceRow(dialog.roomRenderingFloorColorOrTextureRadio);
  }

  // NEW_WALL_PATTERN
  var newWallPatternEnabled = controller.isPropertyEditable("NEW_WALL_PATTERN");
  var newWallPatternSelect = dialog.getElement("new-wall-pattern-select");
  if (newWallPatternEnabled) {
    var patternsTexturesByURL = {};
    var patterns = preferences.getPatternsCatalog().getPatterns();
    for (var i = 0; i < patterns.length; i++) {
      var url = patterns[i].getImage().getURL();
      patternsTexturesByURL[url] = patterns[i];
    }
    dialog.patternComboBox = new JSComboBox(preferences, dialog.getElement("new-wall-pattern-select"), 
        {
          availableValues: Object.keys(patternsTexturesByURL),
          renderCell: function(patternURL, patternItemElement) {
            patternItemElement.style.backgroundImage = "url('" + patternURL + "')";
          },
          selectionChanged: function(newValue) {
            controller.setNewWallPattern(patternsTexturesByURL[newValue]);
          }
        });

    var selectedUrl = (controller.getNewWallPattern() != null 
          ? controller.getNewWallPattern() 
          : controller.getWallPattern()).getImage().getURL();
    dialog.patternComboBox.setSelectedItem(selectedUrl);
    controller.addPropertyChangeListener("NEW_WALL_PATTERN", function() {
        var selectedUrl = controller.getNewWallPattern().getImage().getURL();
        dialog.patternComboBox.setSelectedItem(selectedUrl);
      });
  } else {
    disablePreferenceRow(dialog.newWallPatternSelect);
  }

  // NEW_WALL_THICKNESS
  var newWallThicknessEnabled = controller.isPropertyEditable("NEW_WALL_THICKNESS");
  dialog.newWallThicknessInput = new JSSpinner(preferences, dialog.getElement("new-wall-thickness-input"), 
      {
        value: 1,  
        minimum: 0, 
        maximum: 100000
      });
  if (newWallThicknessEnabled) {
    dialog.newWallThicknessInput.setValue(controller.getNewWallThickness());
  } else {
    disablePreferenceRow(dialog.newWallThicknessInput);
  }

  // NEW_WALL_HEIGHT
  var newWallHeightEnabled = controller.isPropertyEditable("NEW_WALL_HEIGHT");
  dialog.newWallHeightInput = new JSSpinner(preferences, dialog.getElement("new-wall-height-input"), 
      {
        value: 1,  
        minimum: 0, 
        maximum: 100000
      });
  if (newWallHeightEnabled) {
    dialog.newWallHeightInput.setValue(controller.getNewWallHeight());
  } else {
    disablePreferenceRow(dialog.newWallHeightInput);
  }

  // NEW_FLOOR_THICKNESS
  var newFloorThicknessEnabled = controller.isPropertyEditable("NEW_FLOOR_THICKNESS");
  dialog.newFloorThicknessInput = new JSSpinner(preferences, dialog.getElement("new-floor-thickness-input"), 
      {
        value: 1,  
        minimum: 0, 
        maximum: 100000
      });
  if (newFloorThicknessEnabled) {
    dialog.newFloorThicknessInput.setValue(controller.getNewFloorThickness());
  } else {
    disablePreferenceRow(dialog.newFloorThicknessInput);
  }

  var updateSpinnerStepsAndLength = function(spinner, centimeterStepSize, inchStepSize) {
      if (controller.getUnit() == LengthUnit.INCH || controller.getUnit() == LengthUnit.INCH_DECIMALS) {
        spinner.setStepSize(LengthUnit.inchToCentimeter(inchStepSize));
      } else {
        spinner.setStepSize(centimeterStepSize);
      }
      spinner.setFormat(controller.getUnit().getFormat());
    };

  var updateStepsAndLength = function() {
      updateSpinnerStepsAndLength(dialog.newWallThicknessInput, 0.5, 0.125);
      updateSpinnerStepsAndLength(dialog.newWallHeightInput, 10, 2);
      updateSpinnerStepsAndLength(dialog.newFloorThicknessInput, 0.5, 0.125);
    };

  updateStepsAndLength();
  controller.addPropertyChangeListener("UNIT", function(ev) {
      updateStepsAndLength();
    });
  return dialog;
}

JSViewFactory.prototype.createLevelView = function(preferences, controller) {
  var dialog = new JSDialog(preferences,
      "@{LevelPanel.level.title}",
      document.getElementById("level-dialog-template"), 
      {
        size: "small",
        applier: function() {
          controller.modifyLevels();
        }
      });

  var unitName = preferences.getLengthUnit().getName();

  // Viewable check box bound to VIEWABLE controller property
  var viewableCheckbox = dialog.getElement("viewable-checkbox");
  var viewableCheckboxDisplay = controller.isPropertyEditable("VIEWABLE") ? "initial" : "none";
  viewableCheckbox.parentElement.style.display = viewableCheckboxDisplay;
  viewableCheckbox.checked = controller.getViewable();
  dialog.registerEventListener(viewableCheckbox, "change", function(ev) {
      controller.setViewable(viewableCheckbox.checked);
    });
  controller.addPropertyChangeListener("VIEWABLE", function(ev) {
      viewableCheckbox.checked = controller.getViewable();
    });

  // Name text field bound to NAME controller property
  var nameInput = dialog.getElement("name-input");
  var nameDisplay = controller.isPropertyEditable("NAME") ? "initial" : "none";
  nameInput.parentElement.style.display = nameDisplay;
  nameInput.parentElement.previousElementSibling.style.display = nameDisplay;
  nameInput.value = controller.getName() != null ? controller.getName() : "";
  dialog.registerEventListener(nameInput, "input", function(ev) {
      var name = nameInput.value;
      if (name.trim().length == 0) {
        controller.setName(null);
      } else {
        controller.setName(name);
      }
    });
  controller.addPropertyChangeListener("NAME", function(ev) {
      nameInput.value = controller.getName() != null ? controller.getName() : "";
    });

  // Elevation spinner bound to ELEVATION controller property
  var minimumLength = preferences.getLengthUnit().getMinimumLength();
  var maximumLength = preferences.getLengthUnit().getMaximumLength();
  var setFloorThicknessEnabled = function() {
      var selectedLevelIndex = controller.getSelectedLevelIndex();
      if (selectedLevelIndex != null) {
        var levels = controller.getLevels();
        dialog.floorThicknessInput.setEnabled(levels[selectedLevelIndex].getElevation() != levels[0].getElevation());
      }
    };
  var setElevationIndexButtonsEnabled = function() {
      var selectedLevelIndex = controller.getSelectedLevelIndex();
      if (selectedLevelIndex != null) {
        var levels = controller.getLevels();
        dialog.increaseElevationButton.disabled = !(selectedLevelIndex < levels.length - 1
            && levels [selectedLevelIndex].getElevation() == levels [selectedLevelIndex + 1].getElevation());
        dialog.decreaseElevationButton.disabled = !(selectedLevelIndex > 0
            && levels [selectedLevelIndex].getElevation() == levels [selectedLevelIndex - 1].getElevation());
      } else {
        dialog.increaseElevationButton.setEnabled(false);
        dialog.decreaseElevationButton.setEnabled(false);
      }
    };

  var elevationDisplay = controller.isPropertyEditable("ELEVATION") ? "initial" : "none";
  dialog.getElement("elevation-label").textContent = dialog.getLocalizedLabelText("LevelPanel", "elevationLabel.text", unitName);
  var elevationInput = new JSSpinner(preferences, dialog.getElement("elevation-input"), 
      {
        nullable: controller.getElevation() == null,
        format: preferences.getLengthUnit().getFormat(),
        value: controller.getElevation(),
        minimum: -1000,
        maximum: preferences.getLengthUnit().getMaximumElevation(),
        stepSize: preferences.getLengthUnit().getStepSize()
      });
  elevationInput.parentElement.style.display = elevationDisplay;
  elevationInput.parentElement.previousElementSibling.style.display = elevationDisplay;
  dialog.registerEventListener(elevationInput, "input", function(ev) {
      controller.setElevation(elevationInput.getValue());
      setFloorThicknessEnabled();
      setElevationIndexButtonsEnabled();
    });
  controller.addPropertyChangeListener("ELEVATION", function(ev) {
      elevationInput.setValue(ev.getNewValue());
    });

  var floorThicknessDisplay = controller.isPropertyEditable("FLOOR_THICKNESS") ? "initial" : "none";
  dialog.getElement("floor-thickness-label").textContent = dialog.getLocalizedLabelText("LevelPanel", "floorThicknessLabel.text", unitName);
  var floorThicknessInput = new JSSpinner(preferences, dialog.getElement("floor-thickness-input"), 
      {
        nullable: controller.getFloorThickness() == null,
        format: preferences.getLengthUnit().getFormat(),
        value: controller.getFloorThickness(),
        minimum: minimumLength,
        maximum: maximumLength / 10,
        stepSize: preferences.getLengthUnit().getStepSize(),
      });
  floorThicknessInput.parentElement.style.display = floorThicknessDisplay;
  floorThicknessInput.parentElement.previousElementSibling.style.display = floorThicknessDisplay;
  dialog.registerEventListener(floorThicknessInput, "input", function(ev) {
      controller.setFloorThickness(floorThicknessInput.getValue());
    });
  controller.addPropertyChangeListener("FLOOR_THICKNESS", function(ev) {
      floorThicknessInput.setValue(getNewValue());
    });
  dialog.floorThicknessInput = floorThicknessInput;
  setFloorThicknessEnabled(controller);

  var heightDisplay = controller.isPropertyEditable("HEIGHT") ? "initial" : "none";
  dialog.getElement("height-label").textContent = dialog.getLocalizedLabelText("LevelPanel", "heightLabel.text", unitName);
  var heightInput = new JSSpinner(preferences, dialog.getElement("height-input"), 
      {
        nullable: controller.getHeight() == null,
        format: preferences.getLengthUnit().getFormat(),
        value: controller.getHeight(),
        minimum: minimumLength,
        maximum: maximumLength,
        stepSize: preferences.getLengthUnit().getStepSize()
      });
  heightInput.parentElement.style.display = heightDisplay;
  heightInput.parentElement.previousElementSibling.style.display = heightDisplay;
  dialog.registerEventListener(heightInput, "input", function(ev) {
      controller.setHeight(heightInput.getValue());
    });
  controller.addPropertyChangeListener("HEIGHT", function(ev) {
      heightInput.setValue(ev.getNewValue());
    });

  var elevationButtonsDisplay = controller.isPropertyEditable("ELEVATION_INDEX") ? "initial" : "none";
  var increaseElevationButtonAction = new ResourceAction(preferences, "LevelPanel", "INCREASE_ELEVATION_INDEX", true);
  var decreaseElevationButtonAction = new ResourceAction(preferences, "LevelPanel", "DECREASE_ELEVATION_INDEX", true);
  dialog.increaseElevationButton = dialog.getElement("increase-elevation-index-button");
  dialog.increaseElevationButton.style.backgroundImage = "url('lib/" + increaseElevationButtonAction.getValue(AbstractAction.SMALL_ICON) + "')";
  dialog.increaseElevationButton.style.display = elevationButtonsDisplay;
  dialog.registerEventListener(dialog.increaseElevationButton, "click", function(ev) {
      controller.setElevationIndex(controller.getElevationIndex() + 1);
      setElevationIndexButtonsEnabled();
    });

  dialog.decreaseElevationButton = dialog.getElement("decrease-elevation-index-button");
  dialog.decreaseElevationButton.style.backgroundImage = "url('lib/" + decreaseElevationButtonAction.getValue(AbstractAction.SMALL_ICON) + "')";
  dialog.decreaseElevationButton.style.display = elevationButtonsDisplay;
  dialog.registerEventListener(dialog.decreaseElevationButton, "click", function(ev) {
      controller.setElevationIndex(controller.getElevationIndex() - 1);
      setElevationIndexButtonsEnabled();
    });

  setElevationIndexButtonsEnabled();

  var levelsTableBody = dialog.getElement("levels-table").querySelector("tbody");

  var updateSelectedLevel = function() {
    var selectedLevelIndex = controller.getSelectedLevelIndex();

    var selectedLevelRow = levelsTableBody.querySelector(".selected");
    if (selectedLevelRow != null) {
      selectedLevelRow.classList.remove("selected");
    }

    if (selectedLevelIndex != null) {
      // Levels are listed in the table in reverse order
      var rowIndex = levelsTableBody.childElementCount - selectedLevelIndex - 1;
      levelsTableBody.children[rowIndex].classList.add("selected");
    }
  };

  var generateTableBody = function() {
      var levels = controller.getLevels();
      var bodyHtml = "";
  
      var lengthFormat = preferences.getLengthUnit().getFormat();
      for (var i = levels.length - 1; i >= 0; i--) {
        var level = levels[i];
        var disabledAttribute = level.isViewable() ? "" : "disabled";
        bodyHtml += '<tr ' + disabledAttribute + '>' +
            '  <td>' + level.getName() + '</td>' +
            '  <td>' + lengthFormat.format(level.getElevation()) + '</td>' +
            '  <td>' + (level.getElevation() == levels [0].getElevation() ? '' : lengthFormat.format(level.getFloorThickness())) + '</td>' +
            '  <td>' + lengthFormat.format(level.getHeight()) + '</td>' +
            '</tr>';
      }
  
      levelsTableBody.innerHTML = bodyHtml;
      updateSelectedLevel();
    };

  generateTableBody();

  controller.addPropertyChangeListener("SELECT_LEVEL_INDEX", updateSelectedLevel);
  controller.addPropertyChangeListener("LEVELS", generateTableBody);
  return dialog;
}

/**
 * 
 * @param {UserPreferences} preferences 
 * @param {HomeFurnitureController} controller
 */
JSViewFactory.prototype.createHomeFurnitureView = function(preferences, controller) {
  function JSHomeFurnitureDialog() {
    this.controller = controller;
    
    JSDialog.call(this, preferences, 
      "@{HomeFurniturePanel.homeFurniture.title}", 
      document.getElementById("home-furniture-dialog-template"),
      {
        applier: function() {
          controller.modifyFurniture();
        },
        disposer: function(dialog) {
          dialog.paintPanel.colorSelector.dispose();
          dialog.paintPanel.textureSelector.dispose();
        }
      });

    this.initNameAndPricePanel();
    this.initLocationPanel();
    this.initPaintPanel();
    this.initOrientationPanel();
    this.initSizePanel();
    this.initShininessPanel();

    var dialog = this;
    if (this.controller.isPropertyEditable("VISIBLE")) {
      // Create visible check box bound to VISIBLE controller property
      var visibleCheckBox = this.getElement("visible-checkbox");
      visibleCheckBox.checked = this.controller.getVisible();
      this.controller.addPropertyChangeListener("VISIBLE", function(ev) {
          visibleCheckBox.checked = ev.getNewValue();
        });

      this.registerEventListener(visibleCheckBox, "change", function(ev) {
            dialog.controller.setVisible(visibleCheckBox.checked);
          });
    }

    // must be done at last, needs multiple components to be initialized
    if (this.controller.isPropertyEditable("PAINT")) {
      this.updatePaintRadioButtons();
    }
  }
  JSHomeFurnitureDialog.prototype = Object.create(JSDialog.prototype);
  JSHomeFurnitureDialog.prototype.constructor = JSHomeFurnitureDialog;

  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.initNameAndPricePanel = function() {
    var title = this.getElement("name-and-price-title");
    title.textContent = this.getLocalizedLabelText(
        "HomeFurniturePanel", controller.isPropertyEditable("PRICE") ? "nameAndPricePanel.title" : "namePanel.title");

    var nameLabel = this.getElement("name-label");
    var nameInput = this.getElement("name-input");
    var nameVisibleCheckbox = this.getElement("name-visible-checkbox");
    var priceLabel = this.getElement("price-label");
    var priceInput = new JSSpinner(this.preferences, this.getElement("price-input"), 
        {
          nullable: this.controller.getPrice() == null,
          value: 0, 
          minimum: 0, 
          maximum: 1000000000
        });
    var valueAddedTaxPercentageInput = new JSSpinner(this.preferences, this.getElement("value-added-tax-percentage-input"), 
        { 
          nullable: this.controller.getValueAddedTaxPercentage() == null,
          value: 0, 
          minimum: 0, 
          maximum: 100, 
          stepSize: 0.5
        });

    // 1) Adjust visibility
    var nameDisplay = this.controller.isPropertyEditable("NAME") ? "initial" : "none";
    var nameVisibleDisplay = this.controller.isPropertyEditable("NAME_VISIBLE") ? "initial" : "none";
    var priceDisplay = this.controller.isPropertyEditable("PRICE") ? "inline-block" : "none";
    var vatDisplay = this.controller.isPropertyEditable("VALUE_ADDED_TAX_PERCENTAGE") ? "inline-block" : "none";

    nameLabel.style.display = nameDisplay;
    nameInput.style.display = nameDisplay;
    
    nameVisibleCheckbox.parentElement.style.display = nameVisibleDisplay;
    
    priceLabel.style.display = priceDisplay;
    priceInput.style.display = priceDisplay;

    valueAddedTaxPercentageInput.getHTMLElement().previousElementSibling.style.display = vatDisplay;
    valueAddedTaxPercentageInput.style.display = vatDisplay;

    // 2) Set values
    nameInput.value = controller.getName() != null ? controller.getName() : "";
    nameVisibleCheckbox.checked = this.controller.getNameVisible();
    priceInput.setValue(this.controller.getPrice());
    if (this.controller.getValueAddedTaxPercentage()) {
      valueAddedTaxPercentageInput.setValue(this.controller.getValueAddedTaxPercentage() * 100);
    }

    // 3) Add property listeners
    this.controller.addPropertyChangeListener("NAME", function(ev) {
        nameInput.value = controller.getName() != null ? controller.getName() : "";
      });
    this.controller.addPropertyChangeListener("NAME_VISIBLE", function(ev) {
        nameVisibleCheckbox.checked = controller.getNameVisible();
      });
    this.controller.addPropertyChangeListener("PRICE", function(ev) {
        priceInput.setValue(controller.getPrice());
      });
    this.controller.addPropertyChangeListener("VALUE_ADDED_TAX_PERCENTAGE", function(ev) {
        if (controller.getValueAddedTaxPercentage()) {
          valueAddedTaxPercentageInput.setValue(controller.getValueAddedTaxPercentage() * 100);
        } else {
          valueAddedTaxPercentageInput.setValue(null);
        }
      });

    // 4) Add change listeners
    this.registerEventListener(nameInput, "input", function(ev) {
        var name = nameInput.value;
        if (name.trim().length == 0) {
          controller.setName(null);
        } else {
          controller.setName(name);
        }
      });
    this.registerEventListener(nameVisibleCheckbox, "change", function(ev) {
        controller.setNameVisible(nameVisibleCheckbox.checked);
      });
    this.registerEventListener(priceInput, "input", function(ev) {
        controller.setPrice(priceInput.getValue() != null  
            ? new Big(priceInput.getValue()) 
            : null);
      });
    this.registerEventListener(valueAddedTaxPercentageInput, "input", function(ev) {
        var vat = valueAddedTaxPercentageInput.getValue();
        controller.setValueAddedTaxPercentage(vat != null 
            ? new Big(vat / 100) 
            : null);
      });
  }

  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.initLocationPanel = function() {
    var xLabel = this.getElement("x-label");
    var xInput = new JSSpinner(this.preferences, this.getElement("x-input"), 
        {
          nullable: this.controller.getX() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          stepSize: this.preferences.getLengthUnit().getStepSize()
        });
    var yLabel = this.getElement("y-label");
    var yInput = new JSSpinner(this.preferences, this.getElement("y-input"), 
        {
          nullable: this.controller.getY() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          stepSize: this.preferences.getLengthUnit().getStepSize()
        });
    var elevationLabel = this.getElement("elevation-label");
    var elevationInput = new JSSpinner(this.preferences, this.getElement("elevation-input"), 
        {
          nullable: this.controller.getElevation() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          stepSize: this.preferences.getLengthUnit().getStepSize()
        });

    var mirroredModelCheckbox = this.getElement("mirrored-model-checkbox");
    var basePlanItemCheckbox = this.getElement("base-plan-item-checkbox");

    // 1) Adjust visibility
    var xDisplay = this.controller.isPropertyEditable("X") ? "initial" : "none";
    var yDisplay = this.controller.isPropertyEditable("Y") ? "initial" : "none";
    var elevationDisplay = this.controller.isPropertyEditable("ELEVATION") ? "initial" : "none";
    var modelMirroredDisplay = this.controller.isPropertyEditable("MODEL_MIRRORED") ? "initial" : "none";
    var basePlanItemDisplay = this.controller.isPropertyEditable("BASE_PLAN_ITEM") ? "initial" : "none";

    xLabel.style.display = xDisplay;
    xInput.getHTMLElement().parentElement.style.display = xDisplay;
    yLabel.style.display = yDisplay;
    yInput.getHTMLElement().parentElement.style.display = yDisplay;
    elevationLabel.style.display =  elevationDisplay;
    elevationInput.getHTMLElement().parentElement.style.display = elevationDisplay;
    
    mirroredModelCheckbox.parentElement.style.display = modelMirroredDisplay;
    basePlanItemCheckbox.parentElement.style.display = basePlanItemDisplay;

    // 2) Set values
    xInput.setValue(this.controller.getX());
    yInput.setValue(this.controller.getY());
    elevationInput.setValue(this.controller.getElevation());
    mirroredModelCheckbox.checked = this.controller.getModelMirrored();
    basePlanItemCheckbox.checked = this.controller.getBasePlanItem();

    // 3) Set labels
    var unitName = this.preferences.getLengthUnit().getName();
    xLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "xLabel.text", unitName);
    yLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "yLabel.text", unitName);
    elevationLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "elevationLabel.text", unitName);
    
    // 4) Set custom attributes
    var maximumLength = this.preferences.getLengthUnit().getMaximumLength();
    var maximumElevation = this.preferences.getLengthUnit().getMaximumElevation();
    xInput.setMinimum(-maximumLength);
    yInput.setMinimum(-maximumLength);
    xInput.setMaximum(maximumLength);
    yInput.setMaximum(maximumLength); 
    elevationInput.setMinimum(0);
    elevationInput.setMaximum(maximumElevation);

    // 5) add property listeners
    var controller = this.controller;
    this.controller.addPropertyChangeListener("X", function(ev) {
        xInput.setValue(controller.getX());
      });
    this.controller.addPropertyChangeListener("Y", function(ev) {
        yInput.setValue(controller.getY());
      });
    this.controller.addPropertyChangeListener("ELEVATION", function(ev) {
        elevationInput.setValue(controller.getElevation());
      });
    this.controller.addPropertyChangeListener("MODEL_MIRRORED", function(ev) {
        mirroredModelCheckbox.checked = controller.getModelMirrored();
      });
    this.controller.addPropertyChangeListener("BASE_PLAN_ITEM", function(ev) {
        basePlanItemCheckbox.checked = controller.getBasePlanItem();
      });

    // 6) Add change listeners
    this.registerEventListener(xInput, "input", function(ev) {
          controller.setX(xInput.getValue());
        });
    this.registerEventListener(yInput, "input", function(ev) {
        controller.setY(yInput.getValue());
      });
    this.registerEventListener(elevationInput, "input", function(ev) {
        controller.setElevation(elevationInput.getValue());
      });
    this.registerEventListener(mirroredModelCheckbox, "change", function(ev) {
        controller.setModelMirrored(mirroredModelCheckbox.checked);
      });
    this.registerEventListener(basePlanItemCheckbox, "change", function(ev) {
        controller.setBasePlanItem(basePlanItemCheckbox.checked);
      });

    this.locationPanel = {
      element: this.findElement('.location-panel'),
      elevationInput: elevationInput
    };
  }

  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.initOrientationPanel = function() {
    var controller = this.controller;

    var angleLabel = this.getElement("angle-label");
    var angleDecimalFormat = new DecimalFormat("0.#");
    var angleInput = new JSSpinner(this.preferences, this.getElement("angle-input"), 
        {
          nullable: this.controller.getAngle() == null,
          format: angleDecimalFormat,
          minimum: 0,
          maximum: 360
        });
    var horizontalRotationRadioRoll = this.findElement("[name='horizontal-rotation-radio'][value='ROLL']");
    var horizontalRotationRadioPitch = this.findElement("[name='horizontal-rotation-radio'][value='PITCH']");
    var rollInput = new JSSpinner(this.preferences, this.getElement("roll-input"), 
        {
          nullable: this.controller.getRoll() == null,
          format: angleDecimalFormat,
          minimum: 0,
          maximum: 360
        });
    var pitchInput = new JSSpinner(this.preferences, this.getElement("pitch-input"), 
        {
          nullable: this.controller.getPitch() == null,
          format: angleDecimalFormat,
          minimum: 0,
          maximum: 360
        });

    var verticalRotationLabel = this.getElement("vertical-rotation-label");
    var horizontalRotationLabel = this.getElement("horizontal-rotation-label");
    var furnitureOrientationImage = this.getElement("furniture-orientation-image");

    // 1) Adjust visibility
    var angleDisplay = this.controller.isPropertyEditable("ANGLE_IN_DEGREES") || this.controller.isPropertyEditable("ANGLE") ? "initial" : "none";
    var rollDisplay = this.controller.isPropertyEditable("ROLL") ? "initial" : "none";
    var pitchDisplay = this.controller.isPropertyEditable("PITCH") ? "initial" : "none";

    var rollAndPitchDisplayed = this.controller.isPropertyEditable("ROLL") && this.controller.isPropertyEditable("PITCH");
    var verticalRotationLabelDisplay = rollAndPitchDisplayed ? "initial" : "none";
    var horizontalRotationLabelDisplay = verticalRotationLabelDisplay;
    var furnitureOrientationImageDisplay = this.controller.isTexturable() && rollAndPitchDisplayed ? "initial" : "none";

    angleLabel.style.display = angleDisplay;
    angleInput.getHTMLElement().parentElement.style.display = angleDisplay;

    horizontalRotationRadioRoll.parentElement.style.display = rollDisplay; 
    rollInput.getHTMLElement().parentElement.style.display = rollDisplay; 
    
    horizontalRotationRadioPitch.parentElement.style.display = pitchDisplay; 
    pitchInput.getHTMLElement().parentElement.style.display = pitchDisplay; 

    horizontalRotationLabel.style.display = horizontalRotationLabelDisplay;    
    verticalRotationLabel.style.display = verticalRotationLabelDisplay;
    furnitureOrientationImage.style.display = furnitureOrientationImageDisplay;

    // 2) Set values
    if (this.controller.getAngle() != null) {
      angleInput.setValue(Math.toDegrees(this.controller.getAngle()));
    } else {
      angleInput.setValue(null);
    }
    if (this.controller.getRoll() != null) {
      rollInput.setValue(Math.toDegrees(this.controller.getRoll()));
    } else {
      rollInput.setValue(null);
    }
    if (this.controller.getPitch() != null) {
      pitchInput.setValue(Math.toDegrees(this.controller.getPitch()));
    } else {
      pitchInput.setValue(null);
    }

    var updateHorizontalAxisRadioButtons = function() {
        horizontalRotationRadioRoll.checked = controller.getHorizontalAxis() == HomeFurnitureController.FurnitureHorizontalAxis.ROLL;
        horizontalRotationRadioPitch.checked = controller.getHorizontalAxis() == HomeFurnitureController.FurnitureHorizontalAxis.PITCH;
      };
    updateHorizontalAxisRadioButtons();

    // 3) Add property listeners
    this.controller.addPropertyChangeListener("ANGLE", function(ev) {
        if (controller.getAngle() != null) {
          angleInput.setValue(Math.toDegrees(controller.getAngle()));
        } else {
          angleInput.setValue(null);
        }
      });
    this.controller.addPropertyChangeListener("ROLL", function(ev) {
        if (controller.getRoll() != null) {
          rollInput.setValue(Math.toDegrees(controller.getRoll()));
        } else {
          rollInput.setValue(null);
        }
      });
    this.controller.addPropertyChangeListener("PITCH", function(ev) {
        if (controller.getPitch() != null) {
          pitchInput.setValue(Math.toDegrees(controller.getPitch()));
        } else {
          pitchInput.setValue(null);
        }
      });
    this.controller.addPropertyChangeListener("HORIZONTAL_AXIS", function(ev) {
        updateHorizontalAxisRadioButtons();
      });

    // 4) Add change listeners
    this.registerEventListener(angleInput, "input", function(ev) {
        if (angleInput.getValue() == null) {
          controller.setAngle(null);
        } else {
          controller.setAngle(Math.toRadians(angleInput.getValue()));
        }
      });
    this.registerEventListener(rollInput, "input", function(ev) {
        if (rollInput.getValue() == null) {
          controller.setRoll(null);
        } else {
          controller.setRoll(Math.toRadians(rollInput.getValue()));
          controller.setHorizontalAxis(HomeFurnitureController.FurnitureHorizontalAxis.ROLL);
        }
      });
    this.registerEventListener(pitchInput, "input", function(ev) {
        if (pitchInput.getValue() == null) {
          controller.setPitch(null);
        } else {
          controller.setPitch(Math.toRadians(pitchInput.getValue()));
          controller.setHorizontalAxis(HomeFurnitureController.FurnitureHorizontalAxis.PITCH);
        }
      });
    this.registerEventListener([horizontalRotationRadioRoll, horizontalRotationRadioPitch], "change", function(ev) {
        if (horizontalRotationRadioRoll.checked) {
          controller.setHorizontalAxis(HomeFurnitureController.FurnitureHorizontalAxis.ROLL);
        } else {
          controller.setHorizontalAxis(HomeFurnitureController.FurnitureHorizontalAxis.PITCH);
        }
      });

    if (!rollAndPitchDisplayed) {
      this.findElement('.orientation-column').style.display = 'none';
      this.locationPanel.elevationInput.parentElement.insertAdjacentElement('afterend', angleLabel);
      angleLabel.insertAdjacentElement('afterend', angleInput.parentElement);
    }
  }

  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.initPaintPanel = function() {
    var dialog = this;
    var controller = this.controller;
    var preferences = this.preferences;

    var colorSelector = new JSColorSelectorButton(preferences, null,
        {
          colorChanged: function(color) {
              colorAndTextureRadioButtons[HomeFurnitureController.FurniturePaint.COLORED].checked = true;
              controller.setPaint(HomeFurnitureController.FurniturePaint.COLORED);
              controller.setColor(color);
            }
        });
    dialog.attachChildComponent("color-selector-button", colorSelector);
    colorSelector.setColor(controller.getColor());

    var textureSelector = controller.getTextureController().getView();
    textureSelector.textureChanged = function(texture) {
        colorAndTextureRadioButtons[HomeFurnitureController.FurniturePaint.TEXTURED].checked = true;
        controller.setPaint(HomeFurnitureController.FurniturePaint.TEXTURED);
        controller.getTextureController().setTexture(texture);
      };
    dialog.attachChildComponent("texture-selector-button", textureSelector);

    var selectedPaint = controller.getPaint();

    var colorAndTextureRadioButtons = [];
    colorAndTextureRadioButtons[HomeFurnitureController.FurniturePaint.DEFAULT] = dialog.findElement("[name='paint-checkbox'][value='default']");
    colorAndTextureRadioButtons[HomeFurnitureController.FurniturePaint.COLORED] = dialog.findElement("[name='paint-checkbox'][value='color']");
    colorAndTextureRadioButtons[HomeFurnitureController.FurniturePaint.TEXTURED] = dialog.findElement("[name='paint-checkbox'][value='texture']");
    colorAndTextureRadioButtons[HomeFurnitureController.FurniturePaint.MODEL_MATERIALS] = dialog.findElement("[name='paint-checkbox'][value='MODEL_MATERIALS']");

    for (var paint = 0; paint < colorAndTextureRadioButtons.length; paint++) {
      var radioButton = colorAndTextureRadioButtons[paint];
      radioButton.checked = paint == selectedPaint 
          || (paint == HomeFurnitureController.FurniturePaint.DEFAULT && !colorAndTextureRadioButtons[selectedPaint]);
    }

    // material
    var materialSelector = controller.getModelMaterialsController().getView();
    dialog.attachChildComponent("material-selector-button", materialSelector);

    var uniqueModel = controller.getModelMaterialsController().getModel() != null;
    colorAndTextureRadioButtons[HomeFurnitureController.FurniturePaint.MODEL_MATERIALS].disabled = !uniqueModel;
    materialSelector.setEnabled(uniqueModel);

    dialog.paintPanel = {
        colorAndTextureRadioButtons: colorAndTextureRadioButtons,
        colorSelector: colorSelector,
        textureSelector: textureSelector};

    var panelDisplay = controller.isPropertyEditable("PAINT") ? undefined : "none";
    this.getElement("paint-panel").style.display = panelDisplay;
    this.getElement("paint-panel").previousElementSibling.style.display = panelDisplay;

    controller.addPropertyChangeListener("PAINT", function(ev) {
        dialog.updatePaintRadioButtons();
      });

    dialog.registerEventListener(colorAndTextureRadioButtons, "change", function(ev) { 
        var paint = colorAndTextureRadioButtons.indexOf(ev.target);
        controller.setPaint(paint);
      });
  }

  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.updatePaintRadioButtons = function() {
    var dialog = this;
    var controller = this.controller;
    var colorAndTextureRadioButtons = dialog.paintPanel.colorAndTextureRadioButtons;
    if (controller.getPaint() == null) {
      for (var i = 0; i < colorAndTextureRadioButtons.length; i++) {
        colorAndTextureRadioButtons[i].checked = false;
      }
    } else {
      var selectedRadio = colorAndTextureRadioButtons[controller.getPaint()];
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
  
    var widthLabel = this.getElement("width-label");
    var widthInput = new JSSpinner(this.preferences, this.getElement("width-input"), 
        {
          nullable: controller.getWidth() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          stepSize: this.preferences.getLengthUnit().getStepSize()
        });
    var depthLabel = this.getElement("depth-label");
    var depthInput = new JSSpinner(this.preferences, this.getElement("depth-input"), 
        {
          nullable: controller.getDepth() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          stepSize: this.preferences.getLengthUnit().getStepSize()
        });
    var heightLabel = this.getElement("height-label");
    var heightInput = this.getElement("height-input");
    var heightInput = new JSSpinner(this.preferences, this.getElement("height-input"), 
        {
          nullable: controller.getHeight() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          stepSize: this.preferences.getLengthUnit().getStepSize()
        });
    var keepProportionsCheckbox = this.getElement("keep-proportions-checkbox");

    // 1) Adjust visibility
    var widthDisplay = this.controller.isPropertyEditable("WIDTH") ? "initial" : "none";
    var depthDisplay = this.controller.isPropertyEditable("DEPTH") ? "initial" : "none";
    var heightDisplay = this.controller.isPropertyEditable("HEIGHT") ? "initial" : "none";
    var keepProportionsDisplay = this.controller.isPropertyEditable("PROPORTIONAL") ? "initial" : "none";

    widthLabel.style.display = widthDisplay;
    widthInput.parentElement.style.display = widthDisplay;
    depthLabel.style.display = depthDisplay;
    depthInput.parentElement.style.display = depthDisplay;
    heightLabel.style.display = heightDisplay;
    heightInput.parentElement.style.display = heightDisplay;
    keepProportionsCheckbox.parentElement.style.display = keepProportionsDisplay;
    
    // 2) Set values
    widthInput.setValue(this.controller.getWidth());
    depthInput.setValue(this.controller.getDepth());
    heightInput.setValue(this.controller.getHeight());
    keepProportionsCheckbox.checked = this.controller.isProportional();

    // 3) Set labels
    var unitName = this.preferences.getLengthUnit().getName();
    widthLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "widthLabel.text", unitName);
    depthLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "depthLabel.text", unitName);
    heightLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "heightLabel.text", unitName);

    // 4) Set custom attributes
    var minimumLength = this.preferences.getLengthUnit().getMinimumLength();
    var maximumLength = this.preferences.getLengthUnit().getMaximumLength();
    widthInput.setMinimum(minimumLength);
    widthInput.setMaximum(maximumLength); 
    depthInput.setMinimum(minimumLength); 
    depthInput.setMaximum(maximumLength); 
    heightInput.setMinimum(minimumLength);
    heightInput.setMaximum(maximumLength);

    // 5) Add property listeners
    var controller = this.controller;
    this.controller.addPropertyChangeListener("WIDTH", function(ev) {
        widthInput.setValue(controller.getWidth());
      });
    this.controller.addPropertyChangeListener("DEPTH", function(ev) {
        depthInput.setValue(controller.getDepth());
      });
    this.controller.addPropertyChangeListener("HEIGHT", function(ev) {
        heightInput.setValue(controller.getHeight());
      });
    this.controller.addPropertyChangeListener("PROPORTIONAL", function(ev) {
        keepProportionsCheckbox.checked = controller.isProportional();
      });

    // 6) Add change listeners
    this.registerEventListener(widthInput, "input", function(ev) {
          controller.setWidth(widthInput.getValue());
        });
    this.registerEventListener(depthInput, "input", function(ev) {
          controller.setDepth(depthInput.getValue());
        });
    this.registerEventListener(heightInput, "input", function(ev) {
          controller.setHeight(heightInput.getValue());
        });
    this.registerEventListener(keepProportionsCheckbox, "change", function(ev) {
          controller.setProportional(keepProportionsCheckbox.checked);
        });

    // 7) Assign panel's components
    this.sizePanel = {
        widthLabel: widthLabel,
        widthInput: widthInput,
        depthLabel: depthLabel,
        depthInput: depthInput,
        heightLabel: heightLabel,
        heightInput: heightInput,
        keepProportionsCheckbox: keepProportionsCheckbox
      };

    // 8) Handle components activation
    dialog.updateSizeComponents();
    // Add a listener that enables / disables size fields depending on furniture
    // resizable and deformable
    dialog.controller.addPropertyChangeListener("RESIZABLE", function(ev) {
        dalog.updateSizeComponents();
      });
    dialog.controller.addPropertyChangeListener("DEFORMABLE", function(ev) {
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

    var defaultShininessRadioButton = this.findElement("[name='shininess-radio'][value='DEFAULT']");
    var mattRadioButton = this.findElement("[name='shininess-radio'][value='MATT']");
    var shinyRadioButton = this.findElement("[name='shininess-radio'][value='SHINY']");
    this.shininessPanel = {
        defaultShininessRadioButton: defaultShininessRadioButton,
        mattRadioButton: mattRadioButton,
        shinyRadioButton: shinyRadioButton};

    var radiosDisplay = controller.isPropertyEditable("SHININESS") ? "initial" : "none";

    defaultShininessRadioButton.parentElement.style.display = radiosDisplay;
    mattRadioButton.parentElement.style.display = radiosDisplay;
    shinyRadioButton.parentElement.style.display = radiosDisplay;

    if (controller.isPropertyEditable("SHININESS")) {
      // Create radio buttons bound to SHININESS controller properties
      this.registerEventListener([defaultShininessRadioButton, mattRadioButton, shinyRadioButton], "change",
          function(ev) {
            var selectedRadio = dialog.findElement("[name='shininess-radio']:checked");
            controller.setShininess(HomeFurnitureController.FurnitureShininess[selectedRadio.value]);
          });
      controller.addPropertyChangeListener("SHININESS", function(ev) {
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

    if (controller.isPropertyEditable("SHININESS")) {
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
  var initStartAndEndPointsPanel = function(dialog) {
    var maximumLength = preferences.getLengthUnit().getMaximumLength();

    var xStartLabel = dialog.getElement("x-start-label");
    var yStartLabel = dialog.getElement("y-start-label");
    var xStartInput = new JSSpinner(preferences, dialog.getElement("x-start-input"), 
        {
          nullable: controller.getXStart() == null,
          format: preferences.getLengthUnit().getFormat(),
          value: controller.getXStart(),
          minimum: -maximumLength,
          maximum: maximumLength,
          stepSize: preferences.getLengthUnit().getStepSize()
        });
    var yStartInput = new JSSpinner(preferences, dialog.getElement("y-start-input"), 
        {
          nullable: controller.getYStart() == null,
          format: preferences.getLengthUnit().getFormat(),
          value: controller.getYStart(),
          minimum: -maximumLength,
          maximum: maximumLength,
          stepSize: preferences.getLengthUnit().getStepSize()
        });
    var xEndLabel = dialog.getElement("x-end-label");
    var yEndLabel = dialog.getElement("y-end-label");
    var distanceToEndPointLabel = dialog.getElement("distance-to-end-point-label");
    var xEndInput = new JSSpinner(preferences, dialog.getElement("x-end-input"), 
        {
          nullable: controller.getXEnd() == null,
          format: preferences.getLengthUnit().getFormat(),
          value: controller.getXEnd(),
          minimum: -maximumLength,
          maximum: maximumLength,
          stepSize: preferences.getLengthUnit().getStepSize()
        });
    var yEndInput = new JSSpinner(preferences, dialog.getElement("y-end-input"), 
        {
          nullable: controller.getYEnd() == null,
          format: preferences.getLengthUnit().getFormat(),
          value: controller.getYEnd(),
          minimum: -maximumLength,
          maximum: maximumLength,
          stepSize: preferences.getLengthUnit().getStepSize()
        });
    var distanceToEndPointInput = new JSSpinner(preferences, dialog.getElement("distance-to-end-point-input"), 
        {
          nullable: controller.getDistanceToEndPoint() == null,
          format: preferences.getLengthUnit().getFormat(),
          value: controller.getDistanceToEndPoint(),
          minimum: preferences.getLengthUnit().getMinimumLength(),
          maximum: 2 * maximumLength * Math.sqrt(2),
          stepSize: preferences.getLengthUnit().getStepSize()
        });

    var unitName = preferences.getLengthUnit().getName();
    xStartLabel.textContent = dialog.getLocalizedLabelText("WallPanel", "xLabel.text", unitName)
    xEndLabel.textContent = dialog.getLocalizedLabelText("WallPanel", "xLabel.text", unitName)
    yStartLabel.textContent = dialog.getLocalizedLabelText("WallPanel", "yLabel.text", unitName)
    yEndLabel.textContent = dialog.getLocalizedLabelText("WallPanel", "yLabel.text", unitName)
    distanceToEndPointLabel.textContent = dialog.getLocalizedLabelText("WallPanel", "distanceToEndPointLabel.text", unitName)

    controller.addPropertyChangeListener("X_START", function(ev) {
        xStartInput.setValue(ev.getNewValue());
      });
    controller.addPropertyChangeListener("Y_START", function(ev) {
        yStartInput.setValue(ev.getNewValue());
      });
    controller.addPropertyChangeListener("X_END", function(ev) {
        xEndInput.setValue(ev.getNewValue());
      });
    controller.addPropertyChangeListener("Y_END", function(ev) {
        yEndInput.setValue(ev.getNewValue());
      });
    controller.addPropertyChangeListener("DISTANCE_TO_END_POINT", function(ev) {
        distanceToEndPointInput.setValue(ev.getNewValue());
      });

    dialog.registerEventListener(xStartInput, "input", function(ev) {
        controller.setXStart(xStartInput.getValue());
      });
    dialog.registerEventListener(yStartInput, "input", function(ev) {
        controller.setYStart(yStartInput.getValue());
      });
    dialog.registerEventListener(xEndInput, "input", function(ev) {
        controller.setXEnd(xEndInput.getValue());
      });
    dialog.registerEventListener(yEndInput, "input", function(ev) {
        controller.setYEnd(yEndInput.getValue());
      });
    dialog.registerEventListener(distanceToEndPointInput, "input", function(ev) {
        controller.setDistanceToEndPoint(distanceToEndPointInput.getValue());
        console.log("distance")
      });
  }

  var editBaseboard = function(dialogTitle, controller) {
      var view = controller.getView();
      var dialog = new JSDialog(preferences, dialogTitle,
          "<div data-name='content'></div>", 
          {
            size: "small",
            applier: function() {
              // Do not remove - applier must be defined so OK button shows
            }
          });
      dialog.attachChildComponent("content", view);
  
      var visible = controller.getVisible();
      var color = controller.getColor();
      var texture = controller.getTextureController().getTexture();
      var paint = controller.getPaint();
      var thickness = controller.getThickness();
      var height = controller.getHeight();
  
      dialog.cancel = function() {
          controller.setVisible(visible);
          controller.setColor(color);
          controller.getTextureController().setTexture(texture);
          controller.setPaint(paint);
          controller.setThickness(thickness);
          controller.setHeight(height);
          dialog.close();
        };
      dialog.displayView();
    };

  var initLeftAndRightSidesPanels = function(dialog) {
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

    var leftSidePaintRadioColor = dialog.findElement("[name='left-side-color-and-texture-choice'][value='COLORED']");
    var leftSidePaintRadioTexture = dialog.findElement("[name='left-side-color-and-texture-choice'][value='TEXTURED']");
    var rightSidePaintRadioColor = dialog.findElement("[name='right-side-color-and-texture-choice'][value='COLORED']");
    var rightSidePaintRadioTexture = dialog.findElement("[name='right-side-color-and-texture-choice'][value='TEXTURED']");

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
    controller.addPropertyChangeListener("LEFT_SIDE_PAINT", function() {
      updateLeftSidePaint();
    });
    controller.addPropertyChangeListener("RIGHT_SIDE_PAINT", function() {
      updateRightSidePaint();
    });

    // Colors
    dialog.leftSideColorSelector = new JSColorSelectorButton(preferences, null, 
        {
          colorChanged: function(selectedColor) {
              dialog.findElement("[name='left-side-color-and-texture-choice'][value='COLORED']").checked = true;
              controller.setLeftSidePaint(WallController.WallPaint.COLORED);
              controller.setLeftSideColor(selectedColor);
            }
        });
    dialog.rightSideColorSelector = new JSColorSelectorButton(preferences, null, 
        {
          colorChanged: function(selectedColor) {
            dialog.findElement("[name='right-side-color-and-texture-choice'][value='COLORED']").checked = true;
            controller.setRightSidePaint(WallController.WallPaint.COLORED);
            controller.setRightSideColor(selectedColor);
          }
        });
    dialog.leftSideColorSelector = new JSColorSelectorButton(preferences, null,
        {
          colorChanged: function(selectedColor) {
            dialog.findElement("[name='left-side-color-and-texture-choice'][value='COLORED']").checked = true;
            controller.setLeftSidePaint(WallController.WallPaint.COLORED);
            controller.setLeftSideColor(selectedColor);
          }
        });
    dialog.attachChildComponent("left-side-color-selector-button", dialog.leftSideColorSelector);
    dialog.attachChildComponent("right-side-color-selector-button", dialog.rightSideColorSelector);

    dialog.leftSideColorSelector.setColor(controller.getLeftSideColor());
    dialog.rightSideColorSelector.setColor(controller.getRightSideColor());
    controller.addPropertyChangeListener("LEFT_SIDE_COLOR", function() {
      dialog.leftSideColorSelector.setColor(controller.getLeftSideColor());
    });
    controller.addPropertyChangeListener("RIGHT_SIDE_COLOR", function() {
      dialog.rightSideColorSelector.setColor(controller.getRightSideColor());
    });

    // Textures
    dialog.leftSideTextureSelector = controller.getLeftSideTextureController().getView();
    dialog.leftSideTextureSelector.textureChanged = function(texture) {
        dialog.findElement("[name='left-side-color-and-texture-choice'][value='TEXTURED']").checked = true;
        controller.setLeftSidePaint(WallController.WallPaint.TEXTURED);
        controller.getLeftSideTextureController().setTexture(texture);
      };
    dialog.attachChildComponent('left-side-texture-selector-button', dialog.leftSideTextureSelector);

    dialog.rightSideTextureSelector = controller.getRightSideTextureController().getView();
    dialog.rightSideTextureSelector.textureChanged = function(texture) {
        dialog.findElement("[name='right-side-color-and-texture-choice'][value='TEXTURED']").checked = true;
        controller.setRightSidePaint(WallController.WallPaint.TEXTURED);
        controller.getRightSideTextureController().setTexture(texture);
      };
    dialog.attachChildComponent("right-side-texture-selector-button", dialog.rightSideTextureSelector);

    // shininess
    var leftSideShininessRadioMatt = dialog.findElement("[name='left-side-shininess-choice'][value='0']");
    var leftSideShininessRadioShiny = dialog.findElement("[name='left-side-shininess-choice'][value='0.25']");
    var rightSideShininessRadioMatt = dialog.findElement("[name='right-side-shininess-choice'][value='0']");
    var rightSideShininessRadioShiny = dialog.findElement("[name='right-side-shininess-choice'][value='0.25']");

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
    controller.addPropertyChangeListener("LEFT_SIDE_SHININESS", function(ev) {
        updateLeftSideShininess();
      });
    controller.addPropertyChangeListener("RIGHT_SIDE_SHININESS", function(ev) {
        updateRightSideShininess();
      });
    dialog.registerEventListener([leftSideShininessRadioMatt, leftSideShininessRadioShiny], "change", 
        function(ev) {
          controller.setLeftSideShininess(parseFloat(this.value));
        });
    dialog.registerEventListener([rightSideShininessRadioMatt, rightSideShininessRadioShiny], "change", 
        function(ev) {
          controller.setRightSideShininess(parseFloat(this.value));
        });

    // Baseboards
    var leftSideBaseboardButton = dialog.getElement("left-side-modify-baseboard-button");
    var rightSideBaseboardButton = dialog.getElement("right-side-modify-baseboard-button");
    var leftSideBaseboardButtonAction = new ResourceAction(preferences, "WallPanel", "MODIFY_LEFT_SIDE_BASEBOARD", true);
    var rightSideBaseboardButtonAction = new ResourceAction(preferences, "WallPanel", "MODIFY_RIGHT_SIDE_BASEBOARD", true);
    leftSideBaseboardButton.textContent = leftSideBaseboardButtonAction.getValue(AbstractAction.NAME);
    rightSideBaseboardButton.textContent = rightSideBaseboardButtonAction.getValue(AbstractAction.NAME);

    dialog.registerEventListener(leftSideBaseboardButton, "click", function(ev) {
        editBaseboard(dialog.getLocalizedLabelText("WallPanel", "leftSideBaseboardDialog.title"), 
            controller.getLeftSideBaseboardController());
      });
    dialog.registerEventListener(rightSideBaseboardButton, "click", function(ev) {
        editBaseboard(dialog.getLocalizedLabelText("WallPanel", "rightSideBaseboardDialog.title"), 
            controller.getRightSideBaseboardController());
      });
  };

  var initTopPanel = function(dialog) {
      var patternsTexturesByURL = {};
      var patterns = preferences.getPatternsCatalog().getPatterns();
      for (var i = 0; i < patterns.length; i++) {
        var url = patterns[i].getImage().getURL();
        patternsTexturesByURL[url] = patterns[i];
      }
      var patternComboBox = new JSComboBox(this.preferences, dialog.getElement("pattern-select"), 
          {
            nullable: controller.getPattern() != null,
            availableValues: Object.keys(patternsTexturesByURL),
            renderCell: function(patternURL, patternItemElement) {
              patternItemElement.style.backgroundImage = "url('" + patternURL + "')";
            },
            selectionChanged: function(newValue) {
              controller.setPattern(patternsTexturesByURL[newValue]);
            }
          });
  
      var setPatternFromController = function() {
          var pattern = controller.getPattern();
          patternComboBox.setSelectedItem(controller.getPattern() != null
              ? pattern.getImage().getURL()
              : null);
        };
      setPatternFromController();
      controller.addPropertyChangeListener("PATTERN", function(ev) {
          setPatternFromController();
        });
  
      var topPaintRadioDefault = dialog.findElement("[name='top-color-choice'][value='DEFAULT']");
      var topPaintRadioColor = dialog.findElement("[name='top-color-choice'][value='COLORED']");
      var topPaintRadioButtons = [topPaintRadioColor, topPaintRadioDefault];
      var setTopPaintFromController = function() {
          topPaintRadioDefault.checked = controller.getTopPaint() == WallController.WallPaint.DEFAULT;
          topPaintRadioColor.checked = controller.getTopPaint() == WallController.WallPaint.COLORED;
        };
  
      dialog.registerEventListener(topPaintRadioButtons, "click", function(ev) {
          controller.setTopPaint(WallController.WallPaint[this.value]);
        });
      setTopPaintFromController();
      controller.addPropertyChangeListener("TOP_PAINT", function(ev) {
          setTopPaintFromController();
        });
  
      dialog.topColorSelector = new JSColorSelectorButton(preferences, null,
          {
            colorChanged: function(selectedColor) {
              topPaintRadioColor.checked = true;
              controller.setTopPaint(WallController.WallPaint.COLORED);
              controller.setTopColor(selectedColor);
            }
          });
      dialog.attachChildComponent("top-color-selector-button", dialog.topColorSelector);
      dialog.topColorSelector.setColor(controller.getTopColor());
      controller.addPropertyChangeListener("TOP_COLOR", function() {
          dialog.topColorSelector.setColor(controller.getTopColor());
        });
    };

  var initHeightPanel = function(dialog) {
      var unitName = preferences.getLengthUnit().getName();
      dialog.getElement("rectangular-wall-height-label").textContent = dialog.getLocalizedLabelText("WallPanel", "rectangularWallHeightLabel.text", unitName);
  
      var wallShapeRadioRectangular = dialog.findElement("[name='wall-shape-choice'][value='RECTANGULAR_WALL']");
      var wallShapeRadioSloping = dialog.findElement("[name='wall-shape-choice'][value='SLOPING_WALL']");
  
      dialog.registerEventListener([wallShapeRadioRectangular, wallShapeRadioSloping], "change", function(ev) {
          controller.setShape(WallController.WallShape[this.value]);
        });
      var setWallShapeFromController = function() {
          wallShapeRadioRectangular.checked = controller.getShape() == WallController.WallShape.RECTANGULAR_WALL;
          wallShapeRadioSloping.checked = controller.getShape() == WallController.WallShape.SLOPING_WALL;
        };
      setWallShapeFromController();
      controller.addPropertyChangeListener("SHAPE", function(ev) {
          setWallShapeFromController();
        });
  
      var minimumLength = preferences.getLengthUnit().getMinimumLength();
      var maximumLength = preferences.getLengthUnit().getMaximumLength();
      var rectangularWallHeightInput = new JSSpinner(preferences, dialog.getElement("rectangular-wall-height-input"), 
          {
            nullable: controller.getRectangularWallHeight() == null,
            format: preferences.getLengthUnit().getFormat(),
            value: controller.getRectangularWallHeight(),
            minimum: minimumLength,
            maximum: maximumLength,
            stepSize: preferences.getLengthUnit().getStepSize()
          });
      controller.addPropertyChangeListener("RECTANGULAR_WALL_HEIGHT", function(ev) {
          rectangularWallHeightInput.setValue(ev.getNewValue());
        });
      dialog.registerEventListener(rectangularWallHeightInput, "input", function(ev) {
          controller.setRectangularWallHeight(rectangularWallHeightInput.getValue());
        });
  
      var minimumHeight = controller.getSlopingWallHeightAtStart() != null && controller.getSlopingWallHeightAtEnd() != null
          ? 0
          : minimumLength;
      var slopingWallHeightAtStartInput = new JSSpinner(preferences, dialog.getElement("sloping-wall-height-at-start-input"), 
          {
            nullable: controller.getSlopingWallHeightAtStart() == null,
            format: preferences.getLengthUnit().getFormat(),
            value: controller.getSlopingWallHeightAtStart(),
            minimum: minimumHeight,
            maximum: maximumLength,
            stepSize: preferences.getLengthUnit().getStepSize()
          });
      controller.addPropertyChangeListener("SLOPING_WALL_HEIGHT_AT_START", function(ev) {
          slopingWallHeightAtStartInput.setValue(ev.getNewValue());
        });
      dialog.registerEventListener(slopingWallHeightAtStartInput, "input", function(ev) {
          controller.setSlopingWallHeightAtStart(slopingWallHeightAtStartInput.getValue());
          if (minimumHeight == 0
              && controller.getSlopingWallHeightAtStart() == 0
              && controller.getSlopingWallHeightAtEnd() == 0) {
            // Ensure wall height is never 0
            controller.setSlopingWallHeightAtEnd(minimumLength);
          }
        });
  
      var slopingWallHeightAtEndInput = new JSSpinner(preferences, dialog.getElement("sloping-wall-height-at-end-input"), 
          {
            nullable: controller.getSlopingWallHeightAtEnd() == null,
            format: preferences.getLengthUnit().getFormat(),
            value: controller.getSlopingWallHeightAtEnd(),
            min: minimumHeight,
            maximum: maximumLength,
            stepSize: preferences.getLengthUnit().getStepSize()
          });
      controller.addPropertyChangeListener("SLOPING_WALL_HEIGHT_AT_END", function(ev) {
          slopingWallHeightAtEndInput.setValue(ev.getNewValue());
        });
      dialog.registerEventListener(slopingWallHeightAtEndInput, "input", function(ev) {
          controller.setSlopingWallHeightAtEnd(slopingWallHeightAtEndInput.getValue());
          if (minimumHeight == 0
              && controller.getSlopingWallHeightAtStart() == 0
              && controller.getSlopingWallHeightAtEnd() == 0) {
            // Ensure wall height is never 0
            controller.setSlopingWallHeightAtStart(minimumLength);
          }
        });
  
      dialog.getElement("thickness-label").textContent = dialog.getLocalizedLabelText("WallPanel", "thicknessLabel.text", unitName);
      var thicknessInput = new JSSpinner(preferences, dialog.getElement("thickness-input"), 
          {
            nullable: controller.getThickness() == null,
            format: preferences.getLengthUnit().getFormat(),
            value: controller.getThickness(),
            minimum: minimumLength,
            maximum: maximumLength / 10,
            stepSize: preferences.getLengthUnit().getStepSize()
          });
      controller.addPropertyChangeListener("THICKNESS", function(ev) {
          thicknessInput.setValue(ev.getNewValue());
        });
      dialog.registerEventListener(thicknessInput, "input", function(ev) {
          controller.setThickness(thicknessInput.getValue());
        });
  
      dialog.getElement("arc-extent-label").textContent = dialog.getLocalizedLabelText("WallPanel", "arcExtentLabel.text", unitName);
      var angleDecimalFormat = new DecimalFormat("0.#");
      var arcExtentInput = new JSSpinner(this.preferences, dialog.getElement("arc-extent-input"), 
          {
            nullable: controller.getArcExtentInDegrees() == null,
            format: angleDecimalFormat,
            value: 0,
            minimum: -270,
            maximum: 270,
            stepSize: 5
          });
      var setArcExtentFromController = function() {
          arcExtentInput.setValue(controller.getArcExtentInDegrees());
        };
      setArcExtentFromController();
      controller.addPropertyChangeListener("ARC_EXTENT_IN_DEGREES", function(ev) {
          setArcExtentFromController();
        });
  
      dialog.registerEventListener(arcExtentInput, "input", function(ev) {
          controller.setArcExtentInDegrees(arcExtentInput.getValue());
        });
    };

  var dialog = new JSDialog(preferences,
      "@{WallPanel.wall.title}", 
      document.getElementById("wall-dialog-template"), 
      {
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
        size: "medium"
      });
  
  initStartAndEndPointsPanel(dialog);
  initLeftAndRightSidesPanels(dialog);
  initTopPanel(dialog);
  initHeightPanel(dialog);

  dialog.getElement("wall-orientation-label").innerHTML = dialog.getLocalizedLabelText(
      "WallPanel", "wallOrientationLabel.text", "lib/wallOrientation.png");

  var setVisible = function(element, visible, parent) {
      if (element != null) {
        if (parent) {
          element = element.parentElement;
        }
        element.style.display = visible ? "block" : "none";
        element.previousElementSibling.style.display = visible ? "block" : "none";
        if (parent) {
          element.nextElementSibling.style.display = visible ? "block" : "none";
        }
      }
    };

  var editablePointsListener = function() {
      setVisible(dialog.getElement("x-start-input"), controller.isEditablePoints(), true);
      setVisible(dialog.getElement("x-end-input"), controller.isEditablePoints(), true);
      setVisible(dialog.getElement("distance-to-end-point-input"), controller.isEditablePoints());
      setVisible(dialog.getElement("arc-extent-input"), controller.isEditablePoints());
    };
  controller.addPropertyChangeListener("EDITABLE_POINTS", editablePointsListener);
  editablePointsListener(controller.isEditablePoints());
  
  return dialog;
}

/**
 * @param {UserPreferences} preferences
 * @param {RoomController} controller
 * @returns {JSDialog}
 */
JSViewFactory.prototype.createRoomView = function(preferences, controller) {
  var initFloorPanel = function(dialog) {
      // FLOOR_VISIBLE
      var floorVisibleDisplay = controller.isPropertyEditable("FLOOR_VISIBLE") ? "initial" : "none";
      dialog.floorVisibleCheckBox = dialog.getElement("floor-visible-checkbox");
      dialog.floorVisibleCheckBox.checked = controller.getFloorVisible();
      dialog.floorVisibleCheckBox.parentElement.style.display = floorVisibleDisplay;
      dialog.registerEventListener(dialog.floorVisibleCheckBox, "change", function(ev) {
          controller.setFloorVisible(dialog.floorVisibleCheckBox.checked);
        });
      controller.addPropertyChangeListener("FLOOR_VISIBLE", function(ev) {
          dialog.floorVisibleCheckBox.checked = controller.getFloorVisible(ev);
        });
  
      // FLOOR_PAINT
      var floorColorCheckbox = dialog.findElement("[name='floor-color-and-texture-choice'][value='COLORED']");
      dialog.floorColorSelector = new JSColorSelectorButton(preferences, null,
          {
            colorChanged: function(selectedColor) {
              floorColorCheckbox.checked = true;
              controller.setFloorPaint(RoomController.RoomPaint.COLORED);
              controller.setFloorColor(selectedColor);
            }
          });
      dialog.attachChildComponent("floor-color-selector-button", dialog.floorColorSelector)
      dialog.floorColorSelector.setColor(controller.getFloorColor());
  
      var floorTextureCheckbox = dialog.findElement("[name='floor-color-and-texture-choice'][value='TEXTURED']");
      dialog.floorTextureSelector = controller.getFloorTextureController().getView();
      dialog.floorTextureSelector.textureChanged = function(texture) {
          floorTextureCheckbox.checked = true;
          controller.setFloorPaint(RoomController.RoomPaint.TEXTURED);
          controller.getFloorTextureController().setTexture(texture);
        };
      dialog.attachChildComponent("floor-texture-selector-button", dialog.floorTextureSelector);
  
      dialog.registerEventListener([floorColorCheckbox, floorTextureCheckbox], "change", function(ev) {
          controller.setFloorPaint(RoomController.RoomPaint[this.value]);
        });
  
      var setPaintFromController = function() {
          floorColorCheckbox.checked = controller.getFloorPaint() == RoomController.RoomPaint.COLORED;
          floorTextureCheckbox.checked = controller.getFloorPaint() == RoomController.RoomPaint.TEXTURED;
        };
      setPaintFromController();
      controller.addPropertyChangeListener("FLOOR_PAINT", setPaintFromController);
  
      var floorPaintDisplay = controller.isPropertyEditable("FLOOR_PAINT") ? "initial" : "none";
      floorColorCheckbox.parentElement.parentElement.style.display = floorPaintDisplay;
      floorTextureCheckbox.parentElement.parentElement.style.display = floorPaintDisplay;
      dialog.getElement("floor-color-selector-button").style.display = floorPaintDisplay;
      dialog.getElement("floor-texture-selector-button").style.display = floorPaintDisplay;
  
      // FLOOR_SHININESS
      var shininessRadioButtons = dialog.findElements("[name='floor-shininess-choice']");
      dialog.registerEventListener(shininessRadioButtons, "change", function() {
        controller.setFloorShininess(parseFloat(this.value));
      });
  
      var setShininessFromController = function() {
          for (var i = 0; i < shininessRadioButtons.length; i++) {
            shininessRadioButtons[i].checked = controller.getFloorShininess() == parseFloat(shininessRadioButtons[i].value);
          }
        };
      setShininessFromController();
      controller.addPropertyChangeListener("FLOOR_SHININESS", setShininessFromController);
  
      var floorShininessDisplay = controller.isPropertyEditable("FLOOR_SHININESS") ? "initial" : "none";
      shininessRadioButtons[0].parentElement.parentElement = floorShininessDisplay;
    };

  var initCeilingPanel = function(dialog) {
      // CEILING_VISIBLE
      var ceilingVisibleDisplay = controller.isPropertyEditable("CEILING_VISIBLE") ? "initial" : "none";
      dialog.ceilingVisibleCheckBox = dialog.getElement("ceiling-visible-checkbox");
      dialog.ceilingVisibleCheckBox.checked = controller.getCeilingVisible();
      dialog.ceilingVisibleCheckBox.parentElement.style.display = ceilingVisibleDisplay;
      dialog.registerEventListener(dialog.ceilingVisibleCheckBox, "change", function(ev) {
          controller.setCeilingVisible(dialog.ceilingVisibleCheckBox.checked);
        });
      controller.addPropertyChangeListener("CEILING_VISIBLE", function(ev) {
          dialog.ceilingVisibleCheckBox.checked = controller.getCeilingVisible();
        });
  
      // CEILING_PAINT
      var ceilingColorCheckbox = dialog.findElement("[name='ceiling-color-and-texture-choice'][value='COLORED']");
      dialog.ceilingColorSelector = new JSColorSelectorButton(preferences, null,
          {
            colorChanged: function(selectedColor) {
              ceilingColorCheckbox.checked = true;
              controller.setCeilingPaint(RoomController.RoomPaint.COLORED);
              controller.setCeilingColor(selectedColor);
            }
          });
      dialog.attachChildComponent("ceiling-color-selector-button", dialog.ceilingColorSelector)
      dialog.ceilingColorSelector.setColor(controller.getCeilingColor());
  
      var ceilingTextureCheckbox = dialog.findElement("[name='ceiling-color-and-texture-choice'][value='TEXTURED']");
      dialog.ceilingTextureSelector = controller.getCeilingTextureController().getView();
      dialog.ceilingTextureSelector.textureChanged = function(texture) {
        ceilingTextureCheckbox.checked = true;
        controller.setCeilingPaint(RoomController.RoomPaint.TEXTURED);
        controller.getCeilingTextureController().setTexture(texture);
      };
      dialog.attachChildComponent("ceiling-texture-selector-button", dialog.ceilingTextureSelector);
  
      dialog.registerEventListener([ceilingColorCheckbox, ceilingTextureCheckbox], "change", function(ev) {
          controller.setCeilingPaint(RoomController.RoomPaint[this.value]);
        });
  
      var setPaintFromController = function() {
          ceilingColorCheckbox.checked = controller.getCeilingPaint() == RoomController.RoomPaint.COLORED;
          ceilingTextureCheckbox.checked = controller.getCeilingPaint() == RoomController.RoomPaint.TEXTURED;
        };
      setPaintFromController();
      controller.addPropertyChangeListener("CEILING_PAINT", setPaintFromController);
  
      var ceilingPaintDisplay = controller.isPropertyEditable("CEILING_PAINT") ? "initial" : "none";
      ceilingColorCheckbox.parentElement.parentElement.style.display = ceilingPaintDisplay;
      ceilingTextureCheckbox.parentElement.parentElement.style.display = ceilingPaintDisplay;
      dialog.getElement("ceiling-color-selector-button").style.display = ceilingPaintDisplay;
      dialog.getElement("ceiling-texture-selector-button").style.display = ceilingPaintDisplay;
  
      // CEILING_SHININESS
      var shininessRadioButtons = dialog.findElements("[name='ceiling-shininess-choice']");
      dialog.registerEventListener(shininessRadioButtons, "change", function() {
          controller.setCeilingShininess(parseFloat(this.value));
        });
  
      var setShininessFromController = function() {
        for (var i = 0; i < shininessRadioButtons.length; i++) {
          shininessRadioButtons[i].checked = controller.getCeilingShininess() == parseFloat(shininessRadioButtons[i].value);
        }
      }
      setShininessFromController();
      controller.addPropertyChangeListener("CEILING_SHININESS", setShininessFromController);
  
      var ceilingShininessDisplay = controller.isPropertyEditable("CEILING_SHININESS") ? "initial" : "none";
      shininessRadioButtons[0].parentElement.parentElement = ceilingShininessDisplay;
    };

  var selectSplitSurroundingWallsAtFirstChange = function(dialog) {
      if (dialog.firstWallChange
          && dialog.splitSurroundingWallsCheckBox != null
          && !dialog.splitSurroundingWallsCheckBox.disabled) {
        dialog.splitSurroundingWallsCheckBox.checked = true;
        dialog.firstWallChange = false;
      }
    };

   var initWallSidesPanel = function (dialog) {
      // SPLIT_SURROUNDING_WALLS
      function onSplitSurroundingWallsPropertyChanged() {
        dialog.splitSurroundingWallsCheckBox.disabled = !controller.isSplitSurroundingWallsNeeded();
        dialog.splitSurroundingWallsCheckBox.checked = controller.isSplitSurroundingWalls();
      }
  
      var splitSurroundingWallsDisplay = controller.isPropertyEditable("SPLIT_SURROUNDING_WALLS") ? "initial" : "none";
      dialog.splitSurroundingWallsCheckBox = dialog.getElement("split-surrounding-walls-checkbox");
      dialog.splitSurroundingWallsCheckBox.parentElement.style.display = splitSurroundingWallsDisplay;
      dialog.registerEventListener(dialog.splitSurroundingWallsCheckBox, "change", function(ev) {
          controller.setSplitSurroundingWalls(dialog.splitSurroundingWallsCheckBox.checked);
        });
      onSplitSurroundingWallsPropertyChanged();
      controller.addPropertyChangeListener("SPLIT_SURROUNDING_WALLS", function(ev) {
          onSplitSurroundingWallsPropertyChanged();
        });
  
      // WALL_SIDES_PAINT
      var wallSidesColorCheckbox = dialog.findElement("[name='wall-sides-color-and-texture-choice'][value='COLORED']");
      dialog.wallSidesColorSelector = new JSColorSelectorButton(preferences, null,
          {
            colorChanged: function(selectedColor) {
              wallSidesColorCheckbox.checked = true;
              controller.setWallSidesPaint(RoomController.RoomPaint.COLORED);
              controller.setWallSidesColor(selectedColor);
            }
          });
      dialog.attachChildComponent("wall-sides-color-selector-button", dialog.wallSidesColorSelector)
      dialog.wallSidesColorSelector.setColor(controller.getWallSidesColor());
  
      var wallSidesTextureCheckbox = dialog.findElement("[name='wall-sides-color-and-texture-choice'][value='TEXTURED']");
      dialog.wallSidesTextureSelector = controller.getWallSidesTextureController().getView();
      dialog.wallSidesTextureSelector.textureChanged = function(texture) {
          wallSidesTextureCheckbox.checked = true;
          controller.setWallSidesPaint(RoomController.RoomPaint.TEXTURED);
          controller.getWallSidesTextureController().setTexture(texture);
        };
      dialog.attachChildComponent("wall-sides-texture-selector-button", dialog.wallSidesTextureSelector);
  
      dialog.registerEventListener([wallSidesColorCheckbox, wallSidesTextureCheckbox], "change", function(ev) {
          controller.setWallSidesPaint(RoomController.RoomPaint[this.value]);
        });
  
      var setPaintFromController = function() {
          wallSidesColorCheckbox.checked = controller.getWallSidesPaint() == RoomController.RoomPaint.COLORED;
          wallSidesTextureCheckbox.checked = controller.getWallSidesPaint() == RoomController.RoomPaint.TEXTURED;
        };
      setPaintFromController();
      controller.addPropertyChangeListener("WALL_SIDES_PAINT", setPaintFromController);
  
      var wallSidesPaintDisplay = controller.isPropertyEditable("WALL_SIDES_PAINT") ? "initial" : "none";
      wallSidesColorCheckbox.parentElement.parentElement.style.display = wallSidesPaintDisplay;
      wallSidesTextureCheckbox.parentElement.parentElement.style.display = wallSidesPaintDisplay;
      dialog.getElement("wall-sides-color-selector-button").style.display = wallSidesPaintDisplay;
      dialog.getElement("wall-sides-texture-selector-button").style.display = wallSidesPaintDisplay;
  
      // WALL_SIDES_SHININESS
      var shininessRadioButtons = dialog.findElements("[name='wall-sides-shininess-choice']");
      dialog.registerEventListener(shininessRadioButtons, "change", function(ev) {
          controller.setWallSidesShininess(parseFloat(this.value));
        });
  
      var setShininessFromController = function() {
        for (var i = 0; i < shininessRadioButtons.length; i++) {
          shininessRadioButtons[i].checked = controller.getWallSidesShininess() == parseFloat(shininessRadioButtons[i].value);
        }
      }
      setShininessFromController();
      controller.addPropertyChangeListener("WALL_SIDES_SHININESS", setShininessFromController);
  
      var wallSidesShininessDisplay = controller.isPropertyEditable("WALL_SIDES_SHININESS") ? "initial" : "none";
      shininessRadioButtons[0].parentElement.parentElement.style.display = wallSidesShininessDisplay;
  
      if (wallSidesPaintDisplay == "none" && wallSidesShininessDisplay == "none") {
        dialog.getElement("wall-sides-panel").parentElement.style.display = "none";
      }
    };

  var initWallSidesBaseboardPanel = function(dialog) {
      if (!controller.isPropertyEditable("WALL_SIDES_BASEBOARD")) {
        dialog.getElement("wall-sides-baseboard-panel").parentElement.style.display = "none";
        return;
      }
  
      var baseboardComponentView = controller.getWallSidesBaseboardController().getView();
      dialog.attachChildComponent("wall-sides-baseboard-panel", baseboardComponentView);
      controller.getWallSidesBaseboardController().addPropertyChangeListener("VISIBLE", function() {
          selectSplitSurroundingWallsAtFirstChange(dialog);
      });
    };

  var dialog = new JSDialog(preferences, 
      "@{RoomPanel.room.title}", 
      document.getElementById("room-dialog-template"), 
      {
        applier: function(dialog) {
          controller.modifyRooms();
        },
        disposer: function(dialog) {
          dialog.floorColorSelector.dispose();
          dialog.floorTextureSelector.dispose();
          dialog.ceilingColorSelector.dispose();
          dialog.ceilingTextureSelector.dispose();
        },
      });
  
  var nameDisplay = controller.isPropertyEditable("NAME") ? "initial" : "none";
  dialog.nameInput = dialog.getElement("name-input");
  dialog.nameInput.value = controller.getName() != null ? controller.getName() : "";
  dialog.nameInput.parentElement.style.display = nameDisplay;
  dialog.registerEventListener(dialog.nameInput, "input", function(ev) {
      controller.setName(dialog.nameInput.value.trim());
    });
  controller.addPropertyChangeListener("NAME", function(ev) {
      dialog.nameInput.value = controller.getName() != null ? controller.getName() : "";
    });

  var areaVisiblePanelDisplay = controller.isPropertyEditable("AREA_VISIBLE") ? "initial" : "none";
  dialog.areaVisibleCheckbox = dialog.getElement("area-visible-checkbox");
  dialog.areaVisibleCheckbox.checked = controller.getAreaVisible();
  dialog.areaVisibleCheckbox.parentElement.style.display = areaVisiblePanelDisplay;
  dialog.registerEventListener(dialog.areaVisibleCheckbox, "change", function(ev) {
      controller.setAreaVisible(dialog.areaVisibleCheckbox.checked);
    });
  controller.addPropertyChangeListener("AREA_VISIBLE", function(ev) {
      dialog.areaVisibleCheckbox.checked = controller.getAreaVisible();
    });

  initFloorPanel(dialog);
  initCeilingPanel(dialog);
  initWallSidesPanel(dialog);
  initWallSidesBaseboardPanel(dialog);

  dialog.firstWallChange = true;
  return dialog;
}

/**
 * Creates a polyline editor dialog
 * @param {UserPreferences} preferences 
 * @param {PolylineController} controller 
 */
JSViewFactory.prototype.createPolylineView = function(preferences, controller) {
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
  
      var svgBase =
          '<svg style="top: calc(50% - 5px); position: relative;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 100">' +
          '  <defs>' +
          '    <marker id="startMarker%1$s" markerWidth="8" markerHeight="7" refX="1" refY="3.5" orient="auto">' +
          '       %2$s' +
          '    </marker>' +
          '    <marker id="endMarker%1$s" markerWidth="8" markerHeight="7" refX="7" refY="3.5" orient="auto">' +
          '      %3$s' +
          '    </marker>' +
          '  </defs>' +
          '  <line x1="30" y1="50" x2="320" y2="50" stroke="#000" stroke-width="8" marker-start="url(#startMarker%1$s)" marker-end="url(#endMarker%1$s)" />' +
          '</svg>';
  
      var svgLeftArrow = '<polygon points="0 3.5, 8 0, 8 7" />';
      var svgRightArrow = '<polygon points="0 0, 9 3.5, 0 7" />';
      var svgLeftArrowOpen = '<polyline fill="none" stroke="black" stroke-width="1" points="8 0, 0 3.5, 8 7" />';
      var svgRightArrowOpen = '<polyline fill="none" stroke="black" stroke-width="1" points="0 1, 8 3.5, 0 6" />';
      var svgDisc = ' <circle cx="3.5" cy="3.5" r="3.5"/>';
  
      var comboBox = new JSComboBox(this.preferences, dialog.getElement("arrows-style-select"), 
          {
            nullable: controller.getCapStyle() == null,
            availableValues: arrowsStylesCombinations,
            renderCell: function(arrowStyle, itemElement) {
              itemElement.style.border = "none";
              itemElement.style.maxWidth = "6em";
              itemElement.style.margin = "auto";
      
              if (arrowStyle != null) {
                var leftShape = "";
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
                var rightShape = "";
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
              }
            },
            selectionChanged: function(newValue) {
              controller.setStartArrowStyle(newValue.startStyle);
              controller.setEndArrowStyle(newValue.endStyle);
            }
          });
  
      var arrowStyleChangeListener = function() {
          var startArrowStyle = controller.getStartArrowStyle();
          var endArrowStyle = controller.getEndArrowStyle();
          comboBox.setEnabled(controller.isArrowsStyleEditable());
          comboBox.setSelectedItem(
              { 
                startStyle: startArrowStyle, 
                endStyle: endArrowStyle 
              });
        };
      arrowStyleChangeListener();
      controller.addPropertyChangeListener("START_ARROW_STYLE", arrowStyleChangeListener);
      controller.addPropertyChangeListener("END_ARROW_STYLE", arrowStyleChangeListener);
    };

  var initJoinStyleComboBox = function(dialog) {
      var joinStyles = [];
      var joinStyleEnumValues = Object.keys(Polyline.JoinStyle);
      for (var i = 0; i < joinStyleEnumValues.length; i++) {
        var joinStyle = parseInt(joinStyleEnumValues[i]);
        if (!isNaN(joinStyle)) {
          joinStyles.push(joinStyle);
        }
      }
  
      var comboBox = new JSComboBox(this.preferences, dialog.getElement("join-style-select"), 
          {
            nullable: controller.getJoinStyle() == null,
            availableValues: joinStyles,
            renderCell: function(joinStyle, itemElement) {
              itemElement.style.border = "none";
              itemElement.style.textAlign = "center";
      
              var canvasJoinStyle = "miter";
              switch (joinStyle) {
                case Polyline.JoinStyle.BEVEL:
                  canvasJoinStyle = "bevel";
                  break;
                case Polyline.JoinStyle.CURVED:
                case Polyline.JoinStyle.ROUND:
                  canvasJoinStyle = "round";
                  break;
              }
              var canvas = document.createElement("canvas");
              canvas.width = 100;
              canvas.height = 40;
              canvas.style.height = "1em";
              canvas.style.maxWidth = "100%";
              if (joinStyle != null) {
                var canvasContext = canvas.getContext("2d");
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
              }
      
              itemElement.appendChild(canvas);
            },
            selectionChanged: function(newValue) {
              controller.setJoinStyle(newValue);
            }
          });
  
      var joinStyleChangeListener = function() {
          comboBox.setEnabled(controller.isJoinStyleEditable());
          comboBox.setSelectedItem(controller.getJoinStyle());
        };
      joinStyleChangeListener();
      controller.addPropertyChangeListener("JOIN_STYLE", joinStyleChangeListener);
    };

  var initDashStyleComboBox = function(dialog) {
      var dashStyles = [];
      var dashStyleEnumValues = Object.keys(Polyline.DashStyle);
      for (var i = 0; i < dashStyleEnumValues.length; i++) {
        var dashStyle = parseInt(dashStyleEnumValues[i]);
        if (!isNaN(dashStyle) 
            && (dashStyle != Polyline.DashStyle.CUSTOMIZED || controller.getDashStyle() == Polyline.DashStyle.CUSTOMIZED)) {
          dashStyles.push(dashStyle);
        }
      }
  
      var comboBox = new JSComboBox(this.preferences, dialog.getElement("dash-style-select"), 
          {
            nullable: controller.getDashStyle() == null,
            availableValues: dashStyles,
            renderCell: function(dashStyle, itemElement) {
              itemElement.style.border = "none";
              itemElement.style.textAlign = "center";
              itemElement.style.maxHeight = "2em";
              itemElement.style.minWidth = "4em";
      
              var canvas = document.createElement("canvas");
              canvas.width = 500;
              canvas.height = 100;
              canvas.style.width = "5em";
              canvas.style.maxWidth = "100%";
              canvas.style.height = "1em";
              var dashPattern = dashStyle != null && dashStyle != Polyline.DashStyle.CUSTOMIZED 
                  ? Polyline.DashStyle._$wrappers[dashStyle].getDashPattern() 
                  : controller.getDashPattern();
              if (dashPattern != null) {
                var canvasContext = canvas.getContext("2d");
                canvasContext.imageSmoothingEnabled= false;
                canvasContext.lineWidth = 10;
                canvasContext.beginPath();
                canvasContext.moveTo(0, canvas.height / 2);
                
                dashPattern = dashPattern.slice(0);
                // Apply 10 factor to enhance rendering
                for (var i = 0; i < dashPattern.length; i++) {
                  dashPattern[i] = 10 * dashPattern[i];
                }
                
                var dashOffset = controller.getDashOffset() != null ? controller.getDashOffset() : 0;
                canvasContext.setLineDash(dashPattern);
                canvasContext.lineDashOffset = dashOffset * canvas.width;
                canvasContext.lineTo(canvas.width, canvas.height / 2);
                canvasContext.stroke();
              }
      
              itemElement.appendChild(canvas);
            },
            selectionChanged: function(newValue) {
              controller.setDashStyle(newValue);
            }
          });
  
      var dashOffsetInput = new JSSpinner(preferences, dialog.getElement("dash-offset-input"), 
          {
            nullable: controller.getDashOffset() == null,
            value: controller.getDashOffset() == null ? null : controller.getDashOffset() * 100,
            minimum: 0,
            maximum: 100,
            stepSize: 5
          });
      dialog.registerEventListener(dashOffsetInput, "input", function(ev) {
          controller.setDashOffset(dashOffsetInput.getValue() != null
              ? dashOffsetInput.getValue() / 100
              : null);
        });
      controller.addPropertyChangeListener("DASH_OFFSET", function() {
          dashOffsetInput.setValue(controller.getDashOffset() == null ? null : controller.getDashOffset() * 100);
          comboBox.updateUI();
        });
  
      var dashStyleChangeListener = function() {
          dashOffsetInput.setEnabled(controller.getDashStyle() != Polyline.DashStyle.SOLID);
          comboBox.setSelectedItem(controller.getDashStyle());
        };
      dashStyleChangeListener();
      controller.addPropertyChangeListener("DASH_STYLE", dashStyleChangeListener);
    };

  var dialog = new JSDialog(preferences, 
      "@{PolylinePanel.polyline.title}", 
      document.getElementById("polyline-dialog-template"), 
      {
        size: "small",
        applier: function(dialog) {
          controller.modifyPolylines();
        },
        disposer: function(dialog) {
          dialog.colorSelector.dispose();
        }
      });

  dialog.colorSelector = new JSColorSelectorButton(preferences, null,
      {
        colorChanged: function(selectedColor) {
          controller.setColor(selectedColor);
        }
      });
  dialog.attachChildComponent("color-selector-button", dialog.colorSelector)
  dialog.colorSelector.setColor(controller.getColor());

  dialog.thicknessLabelElement = dialog.getElement("thickness-label");
  dialog.thicknessLabelElement.textContent = dialog.getLocalizedLabelText(
      "PolylinePanel", "thicknessLabel.text", dialog.preferences.getLengthUnit().getName());
  
  dialog.thicknessInput = new JSSpinner(preferences, dialog.getElement("thickness-input"), 
      {
        nullable: controller.getThickness() == null,
        format: preferences.getLengthUnit().getFormat(),
        value: controller.getThickness(),
        min: preferences.getLengthUnit().getMinimumLength(),
        maximum: 50,
        stepSize: preferences.getLengthUnit().getStepSize()
      });
  controller.addPropertyChangeListener("THICKNESS", function(ev) {
      dialog.thicknessInput.setValue(controller.getThickness());
    });
  dialog.registerEventListener(dialog.thicknessInput, "input", function(ev) {
      controller.setThickness(dialog.thicknessInput.getValue());
    });

  initArrowsStyleComboBox(dialog);
  initJoinStyleComboBox(dialog);
  initDashStyleComboBox(dialog);

  dialog.visibleIn3DCheckbox = dialog.getElement("visible-in-3D-checkbox");        
  dialog.visibleIn3DCheckbox.checked = controller.isElevationEnabled() && controller.getElevation() != null;
  dialog.registerEventListener(dialog.visibleIn3DCheckbox, "change", function(ev) {
      if (dialog.visibleIn3DCheckbox.checked) {
        controller.setElevation(0);
      } else {
        controller.setElevation(null);
      }
    });
  return dialog;
}

JSViewFactory.prototype.createLabelView = function(modification, preferences, controller) {
  var dialog = new JSDialog(preferences, 
      "@{LabelPanel.labelModification.title}", 
      document.getElementById("label-dialog-template"), 
      {
        applier: function(dialog) {
          if (modification) {
            controller.modifyLabels();
          } else {
            controller.createLabel();
          }
        },
        disposer: function(dialog) {
          dialog.colorButton.dispose();
        },
        size: "small"
      });

  // Text field bound to NAME controller property
  dialog.textInput = dialog.getElement("text");
  dialog.textInput.value = controller.getText() != null ? controller.getText() : "";
  dialog.registerEventListener(dialog.textInput, "input", function(ev) {
      controller.setText(dialog.textInput.value);
    });
  controller.addPropertyChangeListener("TEXT", function(ev) {
      dialog.textInput.value = controller.getText() != null ? controller.getText() : "";
    });
  
  // Radio buttons bound to controller ALIGNMENT property
  dialog.alignmentRadioButtons = dialog.getHTMLElement().querySelectorAll("[name='label-alignment-radio']");
  dialog.registerEventListener(dialog.alignmentRadioButtons, "change", function(ev) {
      for (var i = 0; i < dialog.alignmentRadioButtons.length; i++) {
        if (dialog.alignmentRadioButtons[i].checked) {
          controller.setAlignment(TextStyle.Alignment[dialog.alignmentRadioButtons[i].value]);
        }
      }
    });
  var alignmentChangeListener = function() {
      var selectedAlignmentRadio = dialog.findElement("[name='label-alignment-radio'][value='" + TextStyle.Alignment[controller.getAlignment()] + "']");
      if (selectedAlignmentRadio != null) {
        selectedAlignmentRadio.checked = true;
      }
    };
  controller.addPropertyChangeListener("ALIGNMENT", alignmentChangeListener);
  alignmentChangeListener();

  // Font select bound to controller FONT_NAME property
  dialog.fontSelect = dialog.getElement("font-select");
  var DEFAULT_SYSTEM_FONT_NAME = "DEFAULT_SYSTEM_FONT_NAME";
  dialog.registerEventListener(dialog.fontSelect, "change", function(ev) {
      var selectedValue = dialog.fontSelect.querySelector("option:checked").value;
      controller.setFontName(selectedValue == DEFAULT_SYSTEM_FONT_NAME ? null : selectedValue);
    });
  var fontNameChangeListener = function() {
      if (controller.isFontNameSet()) {
        var selectedValue = controller.getFontName() == null 
            ? DEFAULT_SYSTEM_FONT_NAME 
            : controller.getFontName();
        var selectedOption = dialog.fontSelect.querySelector("[value='" + selectedValue + "']");
        if (selectedOption) {
          selectedOption.selected = true;
        }
      } else {
        dialog.fontSelect.selectedIndex = undefined;
      }
    };
  controller.addPropertyChangeListener("FONT_NAME", fontNameChangeListener);
  CoreTools.loadAvailableFontNames(function(fonts) {
      fonts = [DEFAULT_SYSTEM_FONT_NAME].concat(fonts);
      for (var i = 0; i < fonts.length; i++) {
        var font = fonts[i];
        var label = i == 0 ? dialog.getLocalizedLabelText("FontNameComboBox", "systemFontName") : font;
        dialog.fontSelect.appendChild(JSComponent.createOptionElement(font, label));
      }
      fontNameChangeListener();
    });

  // Font size label and spinner bound to FONT_SIZE controller property
  dialog.fontSizeLabel = dialog.getElement("font-size-label");
  dialog.fontSizeLabel.textContent = dialog.getLocalizedLabelText(
      "LabelPanel", "fontSizeLabel.text", dialog.preferences.getLengthUnit().getName());
  dialog.fontSizeInput = new JSSpinner(preferences, dialog.getElement("font-size-input"), 
      {
        format: preferences.getLengthUnit().getFormat(),
        value: controller.getFontSize(),
        minimum: 5,
        maximum: 999,
        stepSize: preferences.getLengthUnit().getStepSize()
      });
  var fontSizeChangeListener = function() {
      var fontSize = controller.getFontSize();
      dialog.fontSizeInput.setNullable(fontSize == null);
      dialog.fontSizeInput.setValue(fontSize);
    };
  fontSizeChangeListener();
  controller.addPropertyChangeListener("FONT_SIZE", fontSizeChangeListener);
  dialog.registerEventListener(dialog.fontSizeInput, "input", function(ev) {
      controller.setFontSize(dialog.fontSizeInput.getValue());
    });
    
  // Color button bound to controller COLOR controller property
  dialog.colorButton = new JSColorSelectorButton(preferences, null,  
      {
        colorChanged: function(selectedColor) {
          controller.setColor(dialog.colorButton.getColor());
        }
      });
  dialog.attachChildComponent("color-selector-button", dialog.colorButton);
  dialog.colorButton.setColor(controller.getColor());
  controller.addPropertyChangeListener("COLOR", function() {
      dialog.colorButton.setColor(controller.getColor());
    });

  // Pitch components bound to PITCH controller property
  var update3DViewComponents = function() {
      var visibleIn3D = controller.isPitchEnabled() === true;
      dialog.pitch0DegreeRadioButton.disabled = !visibleIn3D;
      dialog.pitch90DegreeRadioButton.disabled = !visibleIn3D;
      dialog.elevationInput.setEnabled(visibleIn3D);
      if (controller.getPitch() !== null) {
        if (controller.getPitch() === 0) {
          dialog.pitch0DegreeRadioButton.checked = true;
        } else if (controller.getPitch() === Math.PI / 2) {
          dialog.pitch90DegreeRadioButton.checked = true;
        }
      }
    };
  controller.addPropertyChangeListener("PITCH", update3DViewComponents);
    
  dialog.visibleIn3DCheckbox = dialog.getElement("visible-in-3D-checkbox");
  dialog.visibleIn3DCheckbox.checked = 
      controller.isPitchEnabled() !== null && controller.getPitch() !== null;
  dialog.registerEventListener(dialog.visibleIn3DCheckbox, "change", function(ev) {
      if (!dialog.visibleIn3DCheckbox.checked) {
        controller.setPitch(null);
      } else if (dialog.pitch90DegreeRadioButton.checked) {
        controller.setPitch(Math.PI / 2);
      } else {
        controller.setPitch(0);
      }
      update3DViewComponents();
    });

  dialog.pitch0DegreeRadioButton = dialog.findElement("[name='label-pitch-radio'][value='0']");
  dialog.pitch90DegreeRadioButton = dialog.findElement("[name='label-pitch-radio'][value='90']");
  var pitchRadioButtonsChangeListener = function() {
      if (dialog.pitch0DegreeRadioButton.checked) {
        controller.setPitch(0);
      } else if (dialog.pitch90DegreeRadioButton.checked) {
        controller.setPitch(Math.PI / 2);
      }
    };
  dialog.registerEventListener([dialog.pitch0DegreeRadioButton, dialog.pitch90DegreeRadioButton], "change",
      pitchRadioButtonsChangeListener);
  
  //  Elevation label and spinner bound to ELEVATION controller property
  dialog.elevationLabel = dialog.getElement("elevation-label");
  dialog.elevationLabel.textContent = dialog.getLocalizedLabelText(
      "LabelPanel", "elevationLabel.text", dialog.preferences.getLengthUnit().getName());
  dialog.elevationInput = new JSSpinner(preferences, dialog.getElement("elevation-input"), 
      {
        nullable: controller.getElevation() == null,
        format: preferences.getLengthUnit().getFormat(),
        value: controller.getElevation(),
        minimum: 0,
        maximum: preferences.getLengthUnit().getMaximumElevation(),
        stepSize: preferences.getLengthUnit().getStepSize()
      });
  var elevationChangeListener = function(ev) {
      dialog.elevationInput.setNullable(ev.getNewValue() === null);
      dialog.elevationInput.setValue(ev.getNewValue());
    };
  controller.addPropertyChangeListener("ELEVATION", elevationChangeListener);
  dialog.registerEventListener(dialog.elevationInput, "input", function(ev) {
      controller.setElevation(dialog.elevationInput.getValue());
    });

  update3DViewComponents();
  
  return dialog;
}

/**
 * @param {UserPreferences} preferences
 * @param {CompassController} controller
 * @return {JSCompassDialogView}
 */
JSViewFactory.prototype.createCompassView = function(preferences, controller) {
  function JSCompassDialogView() {
    this.controller = controller;

    JSDialog.call(this, preferences,
        "@{CompassPanel.compass.title}",
        document.getElementById("compass-dialog-template"),
        {
          size: "medium",
          applier: function(dialog) {
            dialog.controller.modifyCompass();
          }
        });
    
    this.initRosePanel();
    this.initGeographicLocationPanel();
  }
  JSCompassDialogView.prototype = Object.create(JSDialog.prototype);
  JSCompassDialogView.prototype.constructor = JSCompassDialogView;

  /**
   * @private
   */
  JSCompassDialogView.prototype.initRosePanel = function() {
      var preferences = this.preferences;
      var controller = this.controller;
  
      var maximumLength = preferences.getLengthUnit().getMaximumLength();
  
      var xLabel = this.getElement("x-label");
      var xInput = new JSSpinner(this.preferences, this.getElement("x-input"), 
          {
            format: preferences.getLengthUnit().getFormat(),
            minimum: -maximumLength,
            maximum: maximumLength,
            stepSize: preferences.getLengthUnit().getStepSize()
          });
      var yLabel = this.getElement("y-label");
      var yInput = new JSSpinner(this.preferences, this.getElement("y-input"), 
          {
            format: preferences.getLengthUnit().getFormat(),
            minimum: -maximumLength,
            maximum: maximumLength,
            stepSize: preferences.getLengthUnit().getStepSize()
          });
      var diameterLabel = this.getElement("diameter-label");
      var diameterInput = new JSSpinner(this.preferences, this.getElement("diameter-input"), 
          {
            format: preferences.getLengthUnit().getFormat(),
            minimum: preferences.getLengthUnit().getMinimumLength(),
            maximum: preferences.getLengthUnit().getMaximumLength() / 10,
            stepSize: preferences.getLengthUnit().getStepSize()
          });
  
      // Set values
      xInput.setValue(controller.getX());
      yInput.setValue(controller.getY());
      diameterInput.setValue(controller.getDiameter());
  
      // Set labels
      var unitName = this.preferences.getLengthUnit().getName();
      xLabel.textContent = this.getLocalizedLabelText("CompassPanel", "xLabel.text", unitName);
      yLabel.textContent = this.getLocalizedLabelText("CompassPanel", "yLabel.text", unitName);
      diameterLabel.textContent = this.getLocalizedLabelText("CompassPanel", "diameterLabel.text", unitName);
  
      // Add property listeners
      var controller = this.controller;
      this.controller.addPropertyChangeListener("X", function (ev) {
          xInput.setValue(controller.getX());
        });
      this.controller.addPropertyChangeListener("Y", function (ev) {
          yInput.setValue(controller.getY());
        });
      this.controller.addPropertyChangeListener("DIAMETER", function (ev) {
          diameterInput.setValue(controller.getDiameter());
        });
  
      // Add change listeners
      this.registerEventListener(xInput, "input", function (ev) {
          controller.setX(xInput.getValue());
        });
      this.registerEventListener(yInput, "input", function (ev) {
          controller.setY(yInput.getValue());
        });
      this.registerEventListener(diameterInput, "input", function (ev) {
          controller.setDiameter(diameterInput.getValue() != null);
        });
  
      var visibleCheckBox = this.getElement("visible-checkbox");
      visibleCheckBox.checked = controller.isVisible();
      this.registerEventListener(visibleCheckBox, "change", function(ev) {
          controller.setVisible(visibleCheckBox.checked);
        });
      controller.addPropertyChangeListener("VISIBLE", function(ev) {
          visibleCheckBox.checked = controller.isVisible();
        });
    };

  /**
   * @private
   */
  JSCompassDialogView.prototype.initGeographicLocationPanel = function() {
      var preferences = this.preferences;
      var controller = this.controller;
  
      var latitudeInput = new JSSpinner(this.preferences, this.getElement("latitude-input"), 
          {
            format: new DecimalFormat("N ##0.000;S ##0.000"),
            minimum: -90,
            maximum: 90,
            stepSize: 5
          });
      var longitudeInput = new JSSpinner(this.preferences, this.getElement("longitude-input"), 
          {
            format: new DecimalFormat("E ##0.000;W ##0.000"),
            minimum: -180,
            maximum: 180,
            stepSize: 5
          });
      var northDirectionInput = new JSSpinner(this.preferences, this.getElement("north-direction-input"), 
          {
            format: new IntegerFormat(),
            minimum: 0,
            maximum: 360,
            stepSize: 5
          });
      northDirectionInput.getHTMLElement().style.width = "3em";
      northDirectionInput.style.verticalAlign = "super";
  
      // Set values
      latitudeInput.setValue(controller.getLatitudeInDegrees());
      longitudeInput.setValue(controller.getLongitudeInDegrees());
      northDirectionInput.setValue(controller.getNorthDirectionInDegrees());
  
      // Add property listeners
      controller.addPropertyChangeListener("LATITUDE_IN_DEGREES", function(ev) {
          latitudeInput.setValue(controller.getLatitudeInDegrees());
        });
      controller.addPropertyChangeListener("LONGITUDE_IN_DEGREES", function(ev) {
          longitudeInput.setValue(controller.getLongitudeInDegrees());
        });
      controller.addPropertyChangeListener("NORTH_DIRECTION_IN_DEGREES", function(ev) {
          northDirectionInput.setValue(controller.getNorthDirectionInDegrees());
        });
  
      // Add change listeners
      this.registerEventListener(latitudeInput, "input", function(ev) {
          controller.setLatitudeInDegrees(latitudeInput.getValue());
        });
      this.registerEventListener(longitudeInput, "input", function(ev) {
          controller.setLongitudeInDegrees(longitudeInput.getValue());
        });
      this.registerEventListener(northDirectionInput, "input", function(ev) {
          controller.setNorthDirectionInDegrees(northDirectionInput.getValue());
          updatePreview();
        });
  
      var compassPreviewCanvas = this.getElement("compass-preview");
      compassPreviewCanvas.width = 140;
      compassPreviewCanvas.height = 140;
      compassPreviewCanvas.style.verticalAlign = "middle";
  
      compassPreviewCanvas.style.width = "35px";
  
      var compassPreviewCanvasContext = compassPreviewCanvas.getContext("2d");
      var canvasGraphics = new Graphics2D(compassPreviewCanvas);
  
      var updatePreview = function () {
          canvasGraphics.clear();
          var previousTransform = canvasGraphics.getTransform();
          canvasGraphics.translate(70, 70);
          canvasGraphics.scale(100, 100);
    
          canvasGraphics.setColor("#000000");
          canvasGraphics.fill(PlanComponent.COMPASS);
          canvasGraphics.setTransform(previousTransform);
    
          if (controller.getNorthDirectionInDegrees() == 0 || controller.getNorthDirectionInDegrees() == null) {
            compassPreviewCanvas.style.transform = "";
          } else {
            compassPreviewCanvas.style.transform = "rotate(" + controller.getNorthDirectionInDegrees() + "deg)";
          }
        };
      updatePreview();
    };

  return new JSCompassDialogView();
}

JSViewFactory.prototype.createObserverCameraView = function(preferences, controller) {
  function JSObserverCameraDialogView() {
    this.controller = controller;

    JSDialog.call(this, preferences,
        "@{ObserverCameraPanel.observerCamera.title}",
        document.getElementById("observer-camera-dialog-template"),
        {
          applier: function(dialog) {
            dialog.controller.modifyObserverCamera();
          }
        });

    this.initLocationPanel();
    this.initAnglesPanel();

    var adjustObserverCameraElevationCheckBox = this.getElement("adjust-observer-camera-elevation-checkbox");
    adjustObserverCameraElevationCheckBox.checked = controller.isElevationAdjusted();
    var adjustObserverCameraElevationCheckBoxDisplay = controller.isObserverCameraElevationAdjustedEditable() ? "initial" : "none";
    adjustObserverCameraElevationCheckBox.parentElement.style.display = adjustObserverCameraElevationCheckBoxDisplay;
    this.registerEventListener(adjustObserverCameraElevationCheckBox, "change", function(ev) {
        controller.setElevationAdjusted(adjustObserverCameraElevationCheckBox.checked);
      });
    controller.addPropertyChangeListener("OBSERVER_CAMERA_ELEVATION_ADJUSTED", function(ev) {
        adjustObserverCameraElevationCheckBox.checked = controller.isElevationAdjusted();
      });
  }
  JSObserverCameraDialogView.prototype = Object.create(JSDialog.prototype);
  JSObserverCameraDialogView.prototype.constructor = JSObserverCameraDialogView;

  /**
   * @private
   */
  JSObserverCameraDialogView.prototype.initLocationPanel = function() {
    var maximumLength = 5E5;
    var xLabel = this.getElement("x-label");
    var xInput = new JSSpinner(this.preferences, this.getElement("x-input"), 
        {
          nullable: this.controller.getX() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          minimum: -maximumLength,
          maximum: maximumLength,
          stepSize: this.preferences.getLengthUnit().getStepSize()
        });
    var yLabel = this.getElement("y-label");
    var yInput = new JSSpinner(this.preferences, this.getElement("y-input"), 
        {
          nullable: this.controller.getY() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          minimum: -maximumLength,
          maximum: maximumLength,
          stepSize: this.preferences.getLengthUnit().getStepSize()
        });
    var elevationLabel = this.getElement("elevation-label");
    var elevationInput = new JSSpinner(this.preferences, this.getElement("elevation-input"), 
        {
          nullable: this.controller.getElevation() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          minimum: this.controller.getMinimumElevation(),
          maximum: this.preferences.getLengthUnit().getMaximumElevation(),
          stepSize: this.preferences.getLengthUnit().getStepSize()
        });

    // Set values
    xInput.setValue(this.controller.getX());
    yInput.setValue(this.controller.getY());
    elevationInput.setValue(this.controller.getElevation());

    // Set labels
    var unitName = this.preferences.getLengthUnit().getName();
    xLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "xLabel.text", unitName);
    yLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "yLabel.text", unitName);
    elevationLabel.textContent = this.getLocalizedLabelText("ObserverCameraPanel", "elevationLabel.text", unitName);

    // Add property listeners
    var controller = this.controller;
    this.controller.addPropertyChangeListener("X", function (ev) {
        xInput.setValue(controller.getX());
      });
    this.controller.addPropertyChangeListener("Y", function (ev) {
        yInput.setValue(controller.getY());
      });
    this.controller.addPropertyChangeListener("ELEVATION", function (ev) {
        elevationInput.setValue(controller.getElevation());
      });

    // Add change listeners
    this.registerEventListener(xInput, "input", function (ev) {
        controller.setX(xInput.getValue());
      });
    this.registerEventListener(yInput, "input", function (ev) {
        controller.setY(yInput.getValue());
      });
    this.registerEventListener(elevationInput, "input", function (ev) {
        controller.setElevation(elevationInput.getValue());
      });
  };

  /**
   * @private
   */
  JSObserverCameraDialogView.prototype.initAnglesPanel = function() {
    var angleDecimalFormat = new DecimalFormat("0.#");
    var yawInput = new JSSpinner(this.preferences, this.getElement("yaw-input"), 
        {
          format: angleDecimalFormat,
          value: Math.toDegrees(this.controller.getYaw()),
          minimum: -10000,
          maximum: 10000,
          stepSize: 5
        });
    var pitchInput = new JSSpinner(this.preferences, this.getElement("pitch-input"), 
        {
          format: angleDecimalFormat,
          value: Math.toDegrees(this.controller.getPitch()),
          minimum: -90,
          maximum: 90,
          stepSize: 5
        });
    var fieldOfViewInput = new JSSpinner(this.preferences, this.getElement("field-of-view-input"), 
        {
          nullable: this.controller.getFieldOfView() == null,
          format: angleDecimalFormat,
          value: Math.toDegrees(this.controller.getFieldOfView()),
          minimum: 2,
          maximum: 120,
          stepSize: 1
        });

    // add property listeners
    var controller = this.controller;
    this.controller.addPropertyChangeListener("YAW", function (ev) {
      yawInput.setValue(Math.toDegrees(this.controller.getYaw()));
    });
    this.controller.addPropertyChangeListener("PITCH", function (ev) {
      pitchInput.setValue(Math.toDegrees(this.controller.getPitch()));
    });
    this.controller.addPropertyChangeListener("FIELD_OF_VIEW", function (ev) {
      fieldOfViewInput.setValue(Math.toDegrees(this.controller.getFieldOfView()));
    });

    // add change listeners
    this.registerEventListener(yawInput, "input", function (ev) {
        controller.setYaw(yawInput.getValue() != null ? Math.toRadians(yawInput.getValue()) : null);
      });
    this.registerEventListener(pitchInput, "input", function (ev) {
        controller.setPitch(pitchInput.getValue() != null ? Math.toRadians(pitchInput.getValue()) : null);
      });
    this.registerEventListener(fieldOfViewInput, "input", function (ev) {
        controller.setFieldOfView(fieldOfViewInput.getValue() != null ? Math.toRadians(fieldOfViewInput.getValue()) : null);
      });
  };

  return new JSObserverCameraDialogView();
}

JSViewFactory.prototype.createHome3DAttributesView = function(preferences, controller) {
  function JSHome3DAttributesDialogView() {
    this.controller = controller;

    JSDialog.call(this, preferences,
        "@{Home3DAttributesPanel.home3DAttributes.title}",
        document.getElementById("home-3Dattributes-dialog-template"),
        {
          size: "small",
          applier: function(dialog) {
            dialog.controller.modify3DAttributes();
          },
          disposer: function(dialog) {
            dialog.groundPanel.colorSelector.dispose();
            dialog.groundPanel.textureSelector.dispose();
            dialog.skyPanel.colorSelector.dispose();
            dialog.skyPanel.textureSelector.dispose();
          }
        });
    

    this.initGroundPanel();
    this.initSkyPanel();
    this.initRenderingPanel();
  }
  JSHome3DAttributesDialogView.prototype = Object.create(JSDialog.prototype);
  JSHome3DAttributesDialogView.prototype.constructor = JSHome3DAttributesDialogView;

  /**
   * @private
   */
  JSHome3DAttributesDialogView.prototype.initGroundPanel = function() {
    var controller = this.controller;
    var dialog = this;

    var paintRadioColor = dialog.findElement("[name='ground-color-and-texture-choice'][value='COLORED']");
    var colorSelector = new JSColorSelectorButton(preferences, null, 
        {
          colorChanged: function(selectedColor) {
            paintRadioColor.checked = true;
            controller.setGroundPaint(Home3DAttributesController.EnvironmentPaint.COLORED);
            controller.setGroundColor(selectedColor);
          }
        });
    dialog.attachChildComponent("ground-color-selector-button", colorSelector)
    colorSelector.setColor(controller.getGroundColor());

    var paintRadioTexture = dialog.findElement("[name='ground-color-and-texture-choice'][value='TEXTURED']");
    var textureSelector = controller.getGroundTextureController().getView();
    textureSelector.textureChanged = function(texture) {
        paintRadioTexture.checked = true;
        controller.setGroundPaint(Home3DAttributesController.EnvironmentPaint.TEXTURED);
        controller.getGroundTextureController().setTexture(texture);
      };
    dialog.attachChildComponent("ground-texture-selector-button", textureSelector);

    var radioButtons = [paintRadioColor, paintRadioTexture];
    dialog.registerEventListener(radioButtons, "change", function(ev) {
        if (ev.target.checked) {
          controller.setGroundPaint(Home3DAttributesController.EnvironmentPaint[ev.target.value]);
        }
      });

    var setPaintFromController = function() {
        paintRadioColor.checked = controller.getGroundPaint() == Home3DAttributesController.EnvironmentPaint.COLORED;
        paintRadioTexture.checked = controller.getGroundPaint() == Home3DAttributesController.EnvironmentPaint.TEXTURED;
      };
    setPaintFromController();
    controller.addPropertyChangeListener("GROUND_PAINT", setPaintFromController);
    controller.addPropertyChangeListener("GROUND_COLOR", function(ev) {
        colorSelector.setColor(controller.getGroundColor());
      });

    var backgroundImageVisibleOnGround3DCheckBox = this.getElement("background-image-visible-on-ground-3D-checkbox");
    backgroundImageVisibleOnGround3DCheckBox.checked = controller.isBackgroundImageVisibleOnGround3D();
    this.registerEventListener(backgroundImageVisibleOnGround3DCheckBox, "change", function(ev) {
        controller.setBackgroundImageVisibleOnGround3D(backgroundImageVisibleOnGround3DCheckBox.checked);
      });
    controller.addPropertyChangeListener("BACKGROUND_IMAGE_VISIBLE_ON_GROUND_3D", function(ev) {
        backgroundImageVisibleOnGround3DCheckBox.checked = controller.isBackgroundImageVisibleOnGround3D();
      });

    this.groundPanel = {
        colorSelector: colorSelector,
        textureSelector: textureSelector,
      };
  };

  /**
   * @private
   */
  JSHome3DAttributesDialogView.prototype.initSkyPanel = function() {
    var controller = this.controller;
    var dialog = this;

    var paintRadioColor = dialog.findElement("[name='sky-color-and-texture-choice'][value='COLORED']");
    var colorSelector = new JSColorSelectorButton(preferences, null, 
        {
          colorChanged: function(selectedColor) {
            paintRadioColor.checked = true;
            controller.setSkyPaint(Home3DAttributesController.EnvironmentPaint.COLORED);
            controller.setSkyColor(selectedColor);
          }
        });
    dialog.attachChildComponent("sky-color-selector-button", colorSelector)
    colorSelector.setColor(controller.getSkyColor());

    var paintRadioTexture = dialog.findElement("[name='sky-color-and-texture-choice'][value='TEXTURED']");
    var textureSelector = controller.getSkyTextureController().getView();
    textureSelector.textureChanged = function(texture) {
        paintRadioTexture.checked = true;
        controller.setSkyPaint(Home3DAttributesController.EnvironmentPaint.TEXTURED);
        controller.getSkyTextureController().setTexture(texture);
      };
    dialog.attachChildComponent("sky-texture-selector-button", textureSelector);

    var radioButtons = [paintRadioColor, paintRadioTexture];
    dialog.registerEventListener(radioButtons, "change", function(ev) {
        if (ev.target.checked) {
          controller.setSkyPaint(Home3DAttributesController.EnvironmentPaint[ev.target.value]);
        }
      });

    function setPaintFromController() {
        paintRadioColor.checked = controller.getSkyPaint() == Home3DAttributesController.EnvironmentPaint.COLORED;
        paintRadioTexture.checked = controller.getSkyPaint() == Home3DAttributesController.EnvironmentPaint.TEXTURED;
      };
    setPaintFromController();
    controller.addPropertyChangeListener("SKY_PAINT", setPaintFromController);
    controller.addPropertyChangeListener("SKY_COLOR", function() {
      colorSelector.setColor(controller.getSkyColor());
    });

    this.skyPanel = {
      colorSelector: colorSelector,
      textureSelector: textureSelector,
    }
  };

  /**
   * @private
   */
  JSHome3DAttributesDialogView.prototype.initRenderingPanel = function() {
    var controller = this.controller;

    var brightnessSlider = this.getElement("brightness-slider");
    var brightnessList = this.findElement("#home-3Dattributes-brightness-list");

    var wallsTransparencySlider = this.getElement("walls-transparency-slider");
    var wallsTransparencyList = this.findElement("#home-3Dattributes-walls-transparency-list");

    for (var i = 0; i <= 255; i+= 17) {
      var option = document.createElement("option");
      option.value = i;
      brightnessList.appendChild(option);
      wallsTransparencyList.appendChild(option.cloneNode());
    }

    brightnessSlider.value = controller.getLightColor() & 0xFF;
    wallsTransparencySlider.value = controller.getWallsAlpha() * 255;

    this.registerEventListener(brightnessSlider, "input", function(ev) {
        var brightness = ev.target.value;
        controller.setLightColor((brightness << 16) | (brightness << 8) | brightness);
      });
    this.registerEventListener(wallsTransparencySlider, "input", function(ev) {
        controller.setWallsAlpha(this.value / 255);
      });

    controller.addPropertyChangeListener("LIGHT_COLOR", function(ev) {
        brightnessSlider.value = controller.getLightColor() & 0xFF;
      });
    controller.addPropertyChangeListener("WALLS_ALPHA", function(ev) {
        wallsTransparencySlider.value = controller.getWallsAlpha() * 255;
      });
  };

  return new JSHome3DAttributesDialogView();
}

/**
 * Creates a texture selection component
 * @param {UserPreferences} preferences current user's preferences 
 * @param {TextureChoiceController} textureChoiceController texture choice controller
 * @param {{ textureChanged: function(HomeTexture) }} [options]
 *   > textureChanged: called with selected texture, when selection changed
 * @return {JSComponent} 
 */
JSViewFactory.prototype.createTextureChoiceView = function(preferences, textureChoiceController, options) {
  return new JSTextureSelectorButton(preferences, textureChoiceController, null, options);
}

JSViewFactory.prototype.createBaseboardChoiceView = function(preferences, controller) {
  var view = new JSComponent(preferences,
      '  <div class="whole-line">' +
      '    <label>' +
      '      <input name="baseboard-visible-checkbox" type="checkbox"/>' +
      '      @{BaseboardChoiceComponent.visibleCheckBox.text}' +
      '    </label>' +
      '  </div>' +
      '' +
      '  <div class="whole-line">' +
      '    <label>' +
      '      <input type="radio" name="baseboard-color-and-texture-choice" value="sameColorAsWall"/>' +
      '      @{BaseboardChoiceComponent.sameColorAsWallRadioButton.text}' +
      '    </label>' +
      '  </div>' +
      '  <div>' +
      '    <label>' +
      '      <input type="radio" name="baseboard-color-and-texture-choice" value="COLORED">' +
      '        @{BaseboardChoiceComponent.colorRadioButton.text}' +
      '    </label>' +
      '  </div>' +
      '  <div data-name="baseboard-color-selector-button"></div>' +
      '' +
      '  <div>' +
      '    <label>' +
      '      <input type="radio" name="baseboard-color-and-texture-choice" value="TEXTURED">' +
      '        @{BaseboardChoiceComponent.textureRadioButton.text}' +
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
        disposer: function(view) {
          view.colorSelector.dispose();
          view.textureSelector.dispose();
        }
      });

  view.getHTMLElement().dataset["name"] = "baseboard-panel";
  view.getHTMLElement().classList.add("label-input-grid");

  // VISIBLE
  view.visibleCheckBox = view.getElement("baseboard-visible-checkbox");
  view.visibleCheckBox.checked = controller.getVisible();
  view.registerEventListener(view.visibleCheckBox, "change", function(ev) {
      controller.setVisible(view.visibleCheckBox.checked);
    });

  var visibleChanged = function() {
      var visible = controller.getVisible();
      view.visibleCheckBox.checked = visible;
      var componentsEnabled = visible !== false;
      for (var i = 0; i < view.colorAndTextureRadioButtons.length; i++) {
        view.colorAndTextureRadioButtons[i].disabled = !componentsEnabled;
      }
      view.colorSelector.setEnabled(componentsEnabled);
      view.textureSelector.setEnabled(componentsEnabled);
      view.heightInput.setEnabled(componentsEnabled);
      view.thicknessInput.setEnabled(componentsEnabled);
    };
  controller.addPropertyChangeListener("VISIBLE", function(ev) {
      visibleChanged();
    });

  // PAINT
  var paintRadioSameAsWall = view.findElement("[name='baseboard-color-and-texture-choice'][value='sameColorAsWall']");

  var paintRadioColor = view.findElement("[name='baseboard-color-and-texture-choice'][value='COLORED']");
  view.colorSelector = new JSColorSelectorButton(preferences, null,
      {
        colorChanged: function(selectedColor) {
          paintRadioColor.checked = true;
          controller.setPaint(BaseboardChoiceController.BaseboardPaint.COLORED);
          controller.setColor(selectedColor);
        }
      });
  view.attachChildComponent("baseboard-color-selector-button", view.colorSelector)
  view.colorSelector.setColor(controller.getColor());

  var paintRadioTexture = view.findElement("[name='baseboard-color-and-texture-choice'][value='TEXTURED']");
  view.textureSelector = controller.getTextureController().getView();
  view.textureSelector.textureChanged = function(texture) {
      paintRadioTexture.checked = true;
      controller.setPaint(BaseboardChoiceController.BaseboardPaint.TEXTURED);
      controller.getTextureController().setTexture(texture);
    };
  view.attachChildComponent("baseboard-texture-selector-button", view.textureSelector);

  view.colorAndTextureRadioButtons = [paintRadioSameAsWall, paintRadioColor, paintRadioTexture];
  view.registerEventListener(view.colorAndTextureRadioButtons, "change", function(ev) {
      if (ev.target.checked) {
        var selectedPaint = ev.target.value == "sameColorAsWall"
            ? BaseboardChoiceController.BaseboardPaint.DEFAULT
            : BaseboardChoiceController.BaseboardPaint[ev.target.value];
        controller.setPaint(selectedPaint);
      }
    });

  var setPaintFromController = function() {
      paintRadioSameAsWall.checked = controller.getPaint() == BaseboardChoiceController.BaseboardPaint.DEFAULT;
      paintRadioColor.checked = controller.getPaint() == BaseboardChoiceController.BaseboardPaint.COLORED;
      paintRadioTexture.checked = controller.getPaint() == BaseboardChoiceController.BaseboardPaint.TEXTURED;
    };
  setPaintFromController();
  controller.addPropertyChangeListener("PAINT", setPaintFromController);

  // Height & thickness
  var unitName = preferences.getLengthUnit().getName();
  view.getElement("height-label").textContent = view.getLocalizedLabelText("BaseboardChoiceComponent", "heightLabel.text", unitName);
  view.getElement("thickness-label").textContent = view.getLocalizedLabelText("BaseboardChoiceComponent", "thicknessLabel.text", unitName);

  var minimumLength = preferences.getLengthUnit().getMinimumLength();
  view.heightInput = new JSSpinner(preferences, view.getElement("height-input"), 
      {
        nullable: controller.getHeight() == null,
        format: preferences.getLengthUnit().getFormat(),
        value: controller.getHeight() != null && controller.getMaxHeight() != null
            ? Math.min(controller.getHeight(), controller.getMaxHeight())
            : controller.getHeight(),
        minimum: minimumLength,
        maximum: controller.getMaxHeight() == null
            ? preferences.getLengthUnit().getMaximumLength() / 10
            : controller.getMaxHeight(),
        stepSize: preferences.getLengthUnit().getStepSize()
      });
  view.thicknessInput = new JSSpinner(preferences, view.getElement("thickness-input"), 
      {
        nullable: controller.getThickness() == null,
        format: preferences.getLengthUnit().getFormat(),
        value: controller.getThickness(),
        minimum: minimumLength,
        maximum: 2,
        stepSize: preferences.getLengthUnit().getStepSize()
      });

  controller.addPropertyChangeListener("HEIGHT", function(ev) {
      view.heightInput.setValue(ev.getNewValue());
    });
  controller.addPropertyChangeListener("MAX_HEIGHT", function(ev) {
      if (ev.getOldValue() == null
          || controller.getMaxHeight() != null
          && view.heightInput.max < controller.getMaxHeight()) {
        // Change max only if larger value to avoid taking into account intermediate max values
        // that may be fired by auto commit spinners while entering a value
        view.heightInput.max = controller.getMaxHeight();
      }
    });
  controller.addPropertyChangeListener("THICKNESS", function(ev) {
      view.thicknessInput.setValue(ev.getNewValue());
    });

  view.registerEventListener(view.heightInput, "input", function(ev) {
      controller.setHeight(view.heightInput.getValue());
    });
  view.registerEventListener(view.thicknessInput, "input", function(ev) {
      controller.setThickness(view.thicknessInput.getValue());
    });

  visibleChanged();
  return view;
}

JSViewFactory.prototype.createModelMaterialsView = function(preferences, controller) {
  return new JSModelMaterialsSelectorButton(preferences, controller, null);
}

JSViewFactory.prototype.createPageSetupView = function(preferences, pageSetupController) {
  return this.dummyDialogView;
}

JSViewFactory.prototype.createPrintPreviewView = function(home, preferences, homeController, printPreviewController) {
  return this.dummyDialogView;
}

JSViewFactory.prototype.createPhotoView = function(home, preferences, photoController) {
  return this.dummyDialogView;
}

JSViewFactory.prototype.createPhotosView = function(home, preferences, photosController) {
  return this.dummyDialogView;
}

JSViewFactory.prototype.createVideoView = function(home, preferences, videoController) {
  return this.dummyDialogView;
}
