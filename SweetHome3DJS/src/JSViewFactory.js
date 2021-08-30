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
 * @param {function()} onResizeOptionSelected called when user selected "resize image" option
 * @param {function()} onKeepSizeOptionSelected called when user selected "keep image unchanged" option
 */
function JSPromptImageResizeDialog(controller, preferences,
    title, message, cancelButtonMessage, keepUnchangedButtonMessage, okButtonMessage, 
    onResizeOptionSelected, onKeepSizeOptionSelected) {
  this.controller = controller;
  this.preferences = preferences;

  JSDialogView.call(this, preferences,
    JSComponentView.substituteWithLocale(this.preferences, title),
    "<div>" +
    JSComponentView.substituteWithLocale(this.preferences, message) +
    "</div>",
    {
      initializer: function(dialog) {
        dialog.cancelButtonMessage = JSComponentView.substituteWithLocale(this.preferences, cancelButtonMessage);
        dialog.keepUnchangedButtonMessage = JSComponentView.substituteWithLocale(this.preferences, keepUnchangedButtonMessage);
        dialog.okButtonMessage = JSComponentView.substituteWithLocale(this.preferences, okButtonMessage);
      },
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
      '<button class="dialog-cancel-button">' + this.cancelButtonMessage + '</button>' +
      '<button class="keep-image-unchanged-button dialog-ok-button">' + this.keepUnchangedButtonMessage + '</button>' +
      '<button class="dialog-ok-button">' + this.okButtonMessage + '</button>');

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
        initializer: function(dialog) {
          controller.addPropertyChangeListener("TITLE", function(ev) {
            dialog.setTitle(controller.getTitle());
          });
        },
        applier: function(dialog) {
        },
        disposer: function(dialog) {
        },
      });
}

JSViewFactory.prototype.createBackgroundImageWizardStepsView = function(backgroundImage, preferences, controller) {
  var LARGE_IMAGE_PIXEL_COUNT_THRESHOLD = 10000000;
  var LARGE_IMAGE_MAX_PIXEL_COUNT = 8000000;
  var CANVAS_TOUCHABLE_AREA_RADIUS = 10;

  function imageErrorListener(error) {
    console.warn("Error loading image: " + error);
    alert(ResourceAction.getLocalizedLabelText(preferences, "BackgroundImageWizardStepsPanel",
        "imageChoiceError"));
  }

  function JSBackgroundImageWizardStepsView() {
    JSComponentView.call(
      this,
      preferences,
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
      '</div>',
      {
        initializer: function (wizard) {
          /**
           * @type {JSBackgroundImageWizardStepsView}
           */
          var component = wizard;

          component.controller = controller;
          component.rootNode.classList.add("background-image-wizard");

          component.initImageChoiceStep();
          component.initScaleStep();
          component.initOriginStep();

          controller.addPropertyChangeListener("STEP", function(ev) {
            component.updateStep();
          });
          controller.addPropertyChangeListener("IMAGE", function(ev) {
            component.updateImagePreviews();
          });

          component.updateImage(backgroundImage);
        }
      });
  }
  JSBackgroundImageWizardStepsView.prototype = Object.create(JSComponentView.prototype);
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
    component.registerEventListener(component.imageChoiceStep.selectButton, "click", function() {
      component.imageChoiceStep.imageChooser.click();
    });
    component.registerEventListener(component.imageChoiceStep.imageChooser, "input", function() {
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
      scaleDistanceInput: new JSSpinner(preferences, component.getElement("scale-distance-input"), {
        format: preferences.getLengthUnit().getFormat(),
        step: component.getLengthInputStepSize(),
        min: preferences.getLengthUnit().getMinimumLength(),
        max: maximumLength,
      }),
    };

    component.scaleStep.scaleDistanceLabel.textContent = this.getLocalizedLabelText(
        "BackgroundImageWizardStepsPanel", "scaleDistanceLabel.text", unitName
    );
    component.registerEventListener(component.scaleStep.scaleDistanceInput, "input", function() {
      controller.setScaleDistance(component.scaleStep.scaleDistanceInput.value == null ? null : parseFloat(component.scaleStep.scaleDistanceInput.value));
    });
    var setScaleDistanceFromController = function() {
      var scaleDistance = controller.getScaleDistance();
      component.scaleStep.scaleDistanceInput.value = scaleDistance;
    };
    setScaleDistanceFromController();
    controller.addPropertyChangeListener("SCALE_DISTANCE", setScaleDistanceFromController);

    var zoomInButtonAction = new ResourceAction(preferences, "BackgroundImageWizardStepsPanel", "ZOOM_IN", true);
    var zoomOutButtonAction = new ResourceAction(preferences, "BackgroundImageWizardStepsPanel", "ZOOM_OUT", true);
    component.scaleStep.previewZoomIn.style.backgroundImage = "url('lib/" + zoomInButtonAction.getValue(AbstractAction.SMALL_ICON) + "')";
    component.registerEventListener(component.scaleStep.previewZoomIn, "click", function() {
      component.scaleStep.preview.width *= 2;
      component.repaintScaleCanvas();
    });
    component.scaleStep.previewZoomOut.style.backgroundImage = "url('lib/" + zoomOutButtonAction.getValue(AbstractAction.SMALL_ICON) + "')";
    component.registerEventListener(component.scaleStep.previewZoomOut, "click", function() {
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
    /**
     * @type {HTMLCanvasElement}
     */
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
      xOriginInput: new JSSpinner(preferences, component.getElement("x-origin-input"), {
        format: preferences.getLengthUnit().getFormat(),
        step: component.getLengthInputStepSize(),
        min: -maximumLength,
        max: maximumLength,
        value: controller.getXOrigin()
      }),
      yOriginLabel: component.getElement("y-origin-label"),
      yOriginInput: new JSSpinner(preferences, component.getElement("y-origin-input"), {
        format: preferences.getLengthUnit().getFormat(),
        step: component.getLengthInputStepSize(),
        min: -maximumLength,
        max: maximumLength,
        value: controller.getYOrigin()
      }),
    };

    component.originStep.xOriginLabel.textContent = this.getLocalizedLabelText(
        "BackgroundImageWizardStepsPanel", "xOriginLabel.text", unitName
    );
    component.originStep.yOriginLabel.textContent = this.getLocalizedLabelText(
        "BackgroundImageWizardStepsPanel", "yOriginLabel.text", unitName
    );
    component.registerEventListener([component.originStep.xOriginInput, component.originStep.yOriginInput], "input", function() {
      controller.setOrigin(component.originStep.xOriginInput.value, component.originStep.yOriginInput.value);
    });
    controller.addPropertyChangeListener("X_ORIGIN", function() {
      component.originStep.xOriginInput.value = controller.getXOrigin();
      component.repaintOriginCanvas();
    });
    controller.addPropertyChangeListener("Y_ORIGIN", function() {
      component.originStep.yOriginInput.value = controller.getYOrigin();
      component.repaintOriginCanvas();
    });

    var canvas = component.originStep.preview;

    var zoomInButtonAction = new ResourceAction(preferences, "BackgroundImageWizardStepsPanel", "ZOOM_IN", true);
    var zoomOutButtonAction = new ResourceAction(preferences, "BackgroundImageWizardStepsPanel", "ZOOM_OUT", true);
    component.originStep.previewZoomIn.style.backgroundImage = "url('lib/" + zoomInButtonAction.getValue(AbstractAction.SMALL_ICON) + "')";
    component.registerEventListener(component.originStep.previewZoomIn, "click", function() {
      component.originStep.preview.width *= 2;
      component.repaintOriginCanvas();
    });
    component.originStep.previewZoomOut.style.backgroundImage = "url('lib/" + zoomOutButtonAction.getValue(AbstractAction.SMALL_ICON) + "')";
    component.registerEventListener(component.originStep.previewZoomOut, "click", function() {
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
    /**
     * @type {HTMLCanvasElement}
     */
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
          "BackgroundImageWizardStepsPanel", "imageChangeLabel.text"
      );
      this.imageChoiceStep.selectButton.innerHTML = this.getLocalizedLabelText(
          "BackgroundImageWizardStepsPanel", "imageChangeButton.text"
      );
    } else {
      this.imageChoiceStep.description.innerHTML = this.getLocalizedLabelText(
          "BackgroundImageWizardStepsPanel", "imageChoiceLabel.text"
      );
      this.imageChoiceStep.selectButton.innerHTML = this.getLocalizedLabelText(
          "BackgroundImageWizardStepsPanel", "imageChoiceButton.text"
      );
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

      // HACK: in Java's version: BackgroundImageWizardStepsPanel, image is updated in EDT (using invokeLater) when wizard view is initialized
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
   * @param {function(HTMLImageElement)} callback function called after resize with resized image (or with original image if resize was not necessary or declined by user)
   *
   * @private
   */
  JSBackgroundImageWizardStepsView.prototype.promptImageResize = function (image, imageType, callback) {
    if (image.width * image.height < LARGE_IMAGE_PIXEL_COUNT_THRESHOLD) {
      callback.call(null, image);
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
        function onResizeRequested() {
          ImageTools.resize(image, reducedWidth, reducedHeight, callback, imageType);
        },
        function onKeepUnchangedRequested() { callback.call(null, image) }
    );
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
   * change displayed view based on current step
   */
  JSBackgroundImageWizardStepsView.prototype.updateStep = function() {
    var step = this.controller.getStep();
    console.info("update step to " + step);
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
 * @return {JSComponentView & { updateStep: function() }}
 */
JSViewFactory.prototype.createImportedTextureWizardStepsView = function(texture, textureName, preferences, controller) {
  var LARGE_IMAGE_PIXEL_COUNT_THRESHOLD = 640 * 640;
  var IMAGE_PREFERRED_MAX_SIZE = 512;
  var LARGE_IMAGE_MAX_PIXEL_COUNT = IMAGE_PREFERRED_MAX_SIZE * IMAGE_PREFERRED_MAX_SIZE;

  function imageErrorListener(error) {
    console.warn("Error loading image: " + error);
    alert(ResourceAction.getLocalizedLabelText(preferences, "ImportedTextureWizardStepsPanel",
      "imageChoiceErrorLabel.text"));
  }

  var USER_CATEGORY = new TexturesCategory(
    ResourceAction.getLocalizedLabelText(preferences, "ImportedTextureWizardStepsPanel", "userCategory")
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

  var stepsView = new JSComponentView(preferences, 
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
          component.rootNode.classList.add("imported-texture-wizard");
  
          component.imageStepPanel = component.findElement("[imageStep]");
          component.imageStepDescription = component.findElement("[imageStep] [description]");
          component.changeImageButton = component.findElement("button[changeImage]");
          component.imageChooserInput = component.findElement("input[type='file']");
          component.previewPanel = component.findElement("[preview]");
  
          if (texture == null) {
            component.imageStepDescription.innerHTML = component.getLocalizedLabelText("ImportedTextureWizardStepsPanel", "imageChoiceLabel.text");
            component.changeImageButton.innerHTML = component.getLocalizedLabelText("ImportedTextureWizardStepsPanel", "imageChoiceButton.text");
          } else {
            component.imageStepDescription.innerHTML = component.getLocalizedLabelText("ImportedTextureWizardStepsPanel", "imageChangeLabel.text");
            component.changeImageButton.innerHTML = component.getLocalizedLabelText("ImportedTextureWizardStepsPanel", "imageChangeButton.text");
          }
  
          component.attributesStepPanel = component.findElement("[attributesStep]");
          component.attributesStepPanelDescription = component.findElement("[attributesStep] [description]");
          
          component.attributesPreviewPanel = component.findElement("[attributesStep] [preview]");
          
          component.nameInput = component.findElement("input[name='name']");
          component.categorySelect = component.findElement("select[name='category']");
          component.creatorInput = component.findElement("input[name='creator']");
          
          component.findElement("[widthLabel]").textContent = component.getLocalizedLabelText(
            "ImportedTextureWizardStepsPanel", "widthLabel.text", component.preferences.getLengthUnit().getName()
          );
          component.widthInput = component.findElement("input[name='width']");
          component.findElement("[heightLabel]").textContent = component.getLocalizedLabelText(
            "ImportedTextureWizardStepsPanel", "heightLabel.text", component.preferences.getLengthUnit().getName()
          );
          component.heightInput = component.findElement("input[name='height']");
          
          component.registerEventListener(component.changeImageButton, "click", function() {
              component.imageChooserInput.click();
            });
          
          component.registerEventListener(component.imageChooserInput, "input", function() {
              var file = component.imageChooserInput.files[0];
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
  
          controller.addPropertyChangeListener("STEP", function(ev) {
              component.updateStep();
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
  
          var categories = this.preferences.getTexturesCatalog().getCategories();
          if (findUserCategory(categories) == null) {
            categories = categories.concat([USER_CATEGORY]);
          }
          for (var i = 0; i < categories.length; i++) {
            var option = document.createElement("option");
            option.value = categories[i].getName();
            option.textContent = categories[i].getName();
            option._category = categories[i];
            component.categorySelect.appendChild(option);
          }
  
          component.attributesStepPanelDescription.innerHTML = component.getLocalizedLabelText(
              "ImportedTextureWizardStepsPanel", "attributesLabel.text")
              .replace("<html>", "");
          controller.addPropertyChangeListener("NAME", function() {
            if (component.nameInput.value.trim() != controller.getName()) {
              component.nameInput.value = controller.getName();
            }
          });
          component.registerEventListener(
            component.nameInput, "change", function() {
              controller.setName(component.nameInput.value.trim());
            }
          );
  
          controller.addPropertyChangeListener("CATEGORY", function() {
            var category = controller.getCategory();
            if (category != null) {
              component.categorySelect.value = category.getName();
            }
          });
          component.registerEventListener(
            component.categorySelect, "change", function(ev) {
              var category = component.categorySelect.item(component.categorySelect.selectedIndex)._category;
              controller.setCategory(category);
            }
          );
  
          controller.addPropertyChangeListener("CREATOR", function() {
            if (component.creatorInput.value.trim() != controller.getCreator()) {
              component.creatorInput.value = controller.getCreator();
            }
          });
          component.registerEventListener(
            component.creatorInput, "change", function(ev) {
              controller.setCreator(component.creatorInput.value.trim());
            }
          );
  
          controller.addPropertyChangeListener("WIDTH", function() {
            component.widthInput.value = controller.getWidth();
          });
          component.registerEventListener(
            component.widthInput, "change", function(ev) {
              controller.setWidth(parseFloat(component.widthInput.value));
            }
          );
  
          controller.addPropertyChangeListener("HEIGHT", function() {
            component.heightInput.value = controller.getHeight();
          });
          component.registerEventListener(
            component.heightInput, "change", function(ev) {
              controller.setHeight(parseFloat(component.heightInput.value));
            }
          );
  
          if (texture != null) {
            TextureManager.getInstance().loadTexture(texture.getImage(), {
              textureUpdated: function(image) {
                component.updateController(image);
              },
              textureError:  function(error) {
                imageErrorListener(error);
              }
            });
          }
        }
      });

  /**
   * @param {HTMLImageElement?} image 
   * @private
   */
  stepsView.updateController = function(image) {
    var view = this;
    var controller = this.controller;

    if (image != null) {

      var imageType = ImageTools.doesImageHaveAlpha(image) ? "image/png" : "image/jpeg";

      this.promptImageResize(image, imageType, function(image) {
        BlobURLContent.fromImage(image, imageType, function (content) {

          controller.setImage(content);
          controller.setName("My texture name");
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
      imageErrorListener("Image is null");
    }
  }

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
    var promptDialog = new JSPromptImageResizeDialog(controller, preferences,
      "@{ImportedTextureWizardStepsPanel.reduceImageSize.title}",
      stepsView.getLocalizedLabelText(
        "ImportedTextureWizardStepsPanel", "reduceImageSize.message", [image.width, image.height, reducedWidth, reducedHeight]),
      "@{ImportedTextureWizardStepsPanel.reduceImageSize.cancel}",
      "@{ImportedTextureWizardStepsPanel.reduceImageSize.keepUnchanged}",
      "@{ImportedTextureWizardStepsPanel.reduceImageSize.reduceSize}",
      function onResizeRequested() {
        ImageTools.resize(image, reducedWidth, reducedHeight, callback, imageType);
      },
      function onKeepUnchangedRequested() { callback.call(stepsView, image) }
    );
    promptDialog.displayView();
  }

  /**
   * @private
   */
  stepsView.updateImagePreviews = function() {
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
  };

  /**
   * change displayed view based on current step
   */
  stepsView.updateStep = function() {
    var step = this.controller.getStep();
    console.info("update step to " + step);
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
  };

  return stepsView;
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

  return new JSDialogView(preferences, 
      "@{UserPreferencesPanel.preferences.title}", 
      document.getElementById("user-preferences-dialog-template"), 
      {
        initializer: function(dialog) {
          /** LANGUAGE */
          dialog.languageSelect = dialog.getElement("language-select");
          var languageEnabled = controller.isPropertyEditable("LANGUAGE");
          if (languageEnabled) {
            var supportedLanguages = preferences.getSupportedLanguages();
            for (var i = 0; i < supportedLanguages.length; i++) {
              var languageCode = supportedLanguages[i].replace('_', '-');
              var languageDisplayName = languageCode;
              try {
                languageDisplayName = new Intl.DisplayNames([languageCode, "en"], { type: "language" }).of(languageCode);
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
              var languageOption = JSComponentView.createOptionElement(languageCode, languageDisplayName, selected);
              dialog.languageSelect.appendChild(languageOption);
            }
          } else {
            disablePreferenceRow(dialog.languageSelect);
          }
  
          /** UNIT */
          dialog.unitSelect = dialog.getElement("unit-select");
          var unitEnabled = controller.isPropertyEditable("UNIT");
          if (unitEnabled) {
            dialog.unitSelect.appendChild(
                JSComponentView.createOptionElement("MILLIMETER", 
                    preferences.getLocalizedString("UserPreferencesPanel", "unitComboBox.millimeter.text"),
                    controller.getUnit() == LengthUnit.MILLIMETER));
            dialog.unitSelect.appendChild(
                JSComponentView.createOptionElement("CENTIMETER", 
                    preferences.getLocalizedString("UserPreferencesPanel", "unitComboBox.centimeter.text"),
                    controller.getUnit() == LengthUnit.CENTIMETER));
            dialog.unitSelect.appendChild(
                JSComponentView.createOptionElement("METER", 
                    preferences.getLocalizedString("UserPreferencesPanel", "unitComboBox.meter.text"),
                    controller.getUnit() == LengthUnit.METER));
            dialog.unitSelect.appendChild(
                JSComponentView.createOptionElement("INCH", 
                    preferences.getLocalizedString("UserPreferencesPanel", "unitComboBox.inch.text"),
                    controller.getUnit() == LengthUnit.INCH));
            dialog.unitSelect.appendChild(
                JSComponentView.createOptionElement("INCH_DECIMALS", 
                    preferences.getLocalizedString("UserPreferencesPanel", "unitComboBox.inchDecimals.text"),
                    controller.getUnit() == LengthUnit.INCH_DECIMALS));
  
            dialog.registerEventListener(dialog.unitSelect, "change", function() {
              var selectedUnitOption = dialog.unitSelect.options[dialog.unitSelect.selectedIndex];
              controller.setUnit(selectedUnitOption == null ? null : LengthUnit[selectedUnitOption.value]);
            });
          } else {
            disablePreferenceRow(dialog.unitSelect);
          }
  
          /** CURRENCY */
          dialog.currencySelect = dialog.getElement("currency-select");
          dialog.valueAddedTaxCheckBox = dialog.getElement("value-added-tax-checkbox");
          var currencyEnabled = controller.isPropertyEditable("CURRENCY");
          var vatEnabled = controller.isPropertyEditable("VALUE_ADDED_TAX_ENABLED");
          var noCurrencyLabel = this.getLocalizedLabelText("UserPreferencesPanel", "currencyComboBox.noCurrency.text");
          if (currencyEnabled) {
            dialog.currencySelect.appendChild(JSComponentView.createOptionElement("", noCurrencyLabel, !controller.getCurrency()));
            var currencies = Object.keys(UserPreferences.CURRENCIES);
            for (var i = 0; i < currencies.length; i++) {
              var currency = currencies[i];
              var currencyLabel = UserPreferences.CURRENCIES[currency];
              dialog.currencySelect.appendChild(JSComponentView.createOptionElement(
                  currency, currencyLabel, currency == controller.getCurrency()));
            }
  
            this.registerEventListener(dialog.currencySelect, "change", function() {
              var selectedIndex = dialog.currencySelect.selectedIndex;
              var selectedCurrency = dialog.currencySelect.options[selectedIndex].value;
              controller.setCurrency(selectedCurrency ? selectedCurrency : null);
            });
            controller.addPropertyChangeListener("CURRENCY", function() {
              var option = dialog.currencySelect.querySelector("[value='" + (controller.getCurrency() ? controller.getCurrency() : "") + "']");
              option.selected = true;
              dialog.valueAddedTaxCheckBox.disabled = controller.getCurrency() == null;
            });
  
            /** Value Added Tax */
            dialog.valueAddedTaxCheckBox.parentElement.style.display = vatEnabled ? "initial" : "none";
            dialog.valueAddedTaxCheckBox.disabled = controller.getCurrency() == null;
            dialog.valueAddedTaxCheckBox.checked = controller.isValueAddedTaxEnabled();
            this.registerEventListener(dialog.valueAddedTaxCheckBox, "change", function() {
              controller.setValueAddedTaxEnabled(dialog.valueAddedTaxCheckBox.checked);
            });
            controller.addPropertyChangeListener("VALUE_ADDED_TAX_ENABLED", function() {
              dialog.valueAddedTaxCheckBox.disabled = controller.getCurrency() == null;
              dialog.valueAddedTaxCheckBox.checked = controller.isValueAddedTaxEnabled();
            });
          } else {
            disablePreferenceRow(dialog.currencySelect);
          }
  
          /** FURNITURE CATALOG VIEW */
          dialog.furnitureCatalogViewTreeRadio = dialog.findElement("[name='furniture-catalog-view-radio'][value='tree']");
          var furnitureCatalogViewEnabled = controller.isPropertyEditable("FURNITURE_CATALOG_VIEWED_IN_TREE");
          if (furnitureCatalogViewEnabled && false) {
            var selectedFurnitureCatalogView = controller.isFurnitureCatalogViewedInTree() ? "tree" : "list";
            dialog.findElement("[name='furniture-catalog-view-radio'][value='" + selectedFurnitureCatalogView + "']").checked = true;
          } else {
            disablePreferenceRow(dialog.furnitureCatalogViewTreeRadio);
          }
  
          /** NAVIGATION PANEL VISIBLE */
          var navigationPanelEnabled = controller.isPropertyEditable("NAVIGATION_PANEL_VISIBLE");
          dialog.navigationPanelCheckbox = dialog.getElement("navigation-panel-checkbox");
          if (navigationPanelEnabled) {
            dialog.navigationPanelCheckbox.checked = controller.isNavigationPanelVisible();
          } else {
            disablePreferenceRow(dialog.navigationPanelCheckbox);
          }
          
          /** AERIAL VIEW CENTERED ON SELECTION */
          var aerialViewCenteredOnSelectionEnabled = controller.isPropertyEditable("AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED");
          dialog.aerialViewCenteredOnSelectionCheckbox = dialog.getElement("aerial-view-centered-on-selection-checkbox");
          if (aerialViewCenteredOnSelectionEnabled) {
            dialog.aerialViewCenteredOnSelectionCheckbox.checked = controller.isAerialViewCenteredOnSelectionEnabled();
          } else {
            disablePreferenceRow(dialog.aerialViewCenteredOnSelectionCheckbox);
          }
          
          /** OBSERVER CAMERA SELECTED AT CHANGE */
          var observerCameraSelectedAtChangeEnabled = controller.isPropertyEditable("OBSERVER_CAMERA_SELECTED_AT_CHANGE");
          dialog.observerCameraSelectedAtChangeCheckbox = dialog.getElement("observer-camera-selected-at-change-checkbox");
          if (observerCameraSelectedAtChangeEnabled) {
            dialog.observerCameraSelectedAtChangeCheckbox.checked = controller.isObserverCameraSelectedAtChange();
          } else {
            disablePreferenceRow(dialog.observerCameraSelectedAtChangeCheckbox);
          }
          
          /** MAGNETISM */
          var magnetismEnabled = controller.isPropertyEditable("MAGNETISM_ENABLED");
          dialog.magnetismCheckbox = dialog.getElement("magnetism-checkbox");
          if (magnetismEnabled) {
            dialog.magnetismCheckbox.checked = controller.isMagnetismEnabled();
          } else {
            disablePreferenceRow(dialog.magnetismCheckbox);
          }
          
          /** RULERS */
          var rulersEnabled = controller.isPropertyEditable("RULERS_VISIBLE");
          dialog.rulersCheckbox = dialog.getElement("rulers-checkbox");
          if (rulersEnabled && false) {
            dialog.rulersCheckbox.checked = controller.isRulersVisible();
          } else {
            disablePreferenceRow(dialog.rulersCheckbox);
          }
          
          /** GRID */
          var gridEnabled = controller.isPropertyEditable("GRID_VISIBLE");
          dialog.gridCheckbox = dialog.getElement("grid-checkbox");
          if (gridEnabled) {
            dialog.gridCheckbox.checked = controller.isGridVisible();
          } else {
            disablePreferenceRow(dialog.gridCheckbox);
          }
  
          /** DEFAULT FONT NAME */
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
                dialog.defaultFontNameSelect.appendChild(JSComponentView.createOptionElement(font, label));
              }
              setDefaultFontFromController();
            });
  
            controller.addPropertyChangeListener("DEFAULT_FONT_NAME", setDefaultFontFromController);
  
            dialog.registerEventListener(dialog.defaultFontNameSelect, "change", function() {
                var selectedValue = dialog.defaultFontNameSelect.querySelector("option:checked").value;
                controller.setDefaultFontName(selectedValue == DEFAULT_SYSTEM_FONT_NAME ? null : selectedValue);
              });
          } else {
            disablePreferenceRow(dialog.defaultFontNameSelect);
          }
  
          /** FURNITURE ICON */
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
                  JSComponentView.createOptionElement(size, size + '×' + size,
                      controller.getFurnitureModelIconSize() == size));
            }
  
            /**
             * Called when furniture icon mode is selected, in order to enable icon size if necessary
             * @private
             */
            function onIconModeSelected(dialog) {
              dialog.iconSizeSelect.disabled = !dialog.iconTopViewRadio.checked;
            }
  
            onIconModeSelected(dialog);
  
            dialog.registerEventListener(dialog.findElements("[name='furniture-icon-radio']"), "change", function() {
              onIconModeSelected(dialog);
            });
          } else {
            disablePreferenceRow(dialog.iconTopViewRadio);
          }
  
          /** ROOM RENDERING */
          dialog.roomRenderingFloorColorOrTextureRadio = dialog.findElement("[name='room-rendering-radio'][value='floorColorOrTexture']");
          var roomRenderingEnabled = controller.isPropertyEditable("ROOM_FLOOR_COLORED_OR_TEXTURED");
          if (roomRenderingEnabled) {
            var roomRenderingValue = controller.isRoomFloorColoredOrTextured() ? "floorColorOrTexture" : "monochrome";
            dialog.findElement("[name='room-rendering-radio'][value='" + roomRenderingValue + "']").checked = true;
          } else {
            disablePreferenceRow(dialog.roomRenderingFloorColorOrTextureRadio);
          }
  
          /** NEW WALL PATTERN */
          var newWallPatternEnabled = controller.isPropertyEditable("NEW_WALL_PATTERN");
          var newWallPatternSelect = dialog.getElement("new-wall-pattern-select");
          if (newWallPatternEnabled) {
            var patternsTexturesByURL = {};
            var patterns = preferences.getPatternsCatalog().getPatterns();
            for (var i = 0; i < patterns.length; i++) {
              var url = patterns[i].getImage().getURL();
              patternsTexturesByURL[url] = patterns[i];
            }
            dialog.patternComboBox = new JSComboBox(preferences, dialog.getElement("new-wall-pattern-select"), {
              availableValues: Object.keys(patternsTexturesByURL),
              render: function(patternURL, patternItemElement) {
                patternItemElement.style.backgroundImage = "url('" + patternURL + "')";
              },
              selectionChanged: function(newValue) {
                controller.setNewWallPattern(patternsTexturesByURL[newValue]);
              }
            });
  
            var selectedUrl = (controller.getNewWallPattern() != null 
                  ? controller.getNewWallPattern() 
                  : controller.getWallPattern()).getImage().getURL();
            dialog.patternComboBox.set(selectedUrl);
            controller.addPropertyChangeListener("NEW_WALL_PATTERN", function() {
                var selectedUrl = controller.getNewWallPattern().getImage().getURL();
                dialog.patternComboBox.set(selectedUrl);
              });
          } else {
            disablePreferenceRow(dialog.newWallPatternSelect);
          }
  
          /** NEW WALL THICKNESS */
          var newWallThicknessEnabled = controller.isPropertyEditable("NEW_WALL_THICKNESS");
          dialog.newWallThicknessInput = new JSSpinner(this.preferences, this.getElement("new-wall-thickness-input"), 
              {
                value: 1,  
                min: 0, 
                max: 100000
              });
          if (newWallThicknessEnabled) {
            dialog.newWallThicknessInput.value = controller.getNewWallThickness();
          } else {
            disablePreferenceRow(dialog.newWallThicknessInput);
          }
  
          /** NEW WALL HEIGHT */
          var newWallHeightEnabled = controller.isPropertyEditable("NEW_WALL_HEIGHT");
          dialog.newWallHeightInput = new JSSpinner(this.preferences, this.getElement("new-wall-height-input"), 
              {
                value: 1,  
                min: 0, 
                max: 100000
              });
          if (newWallHeightEnabled) {
            dialog.newWallHeightInput.value = controller.getNewWallHeight();
          } else {
            disablePreferenceRow(dialog.newWallHeightInput);
          }
  
          /** NEW FLOOR THICKNESS */
          var newFloorThicknessEnabled = controller.isPropertyEditable("NEW_FLOOR_THICKNESS");
          dialog.newFloorThicknessInput = new JSSpinner(this.preferences, this.getElement("new-floor-thickness-input"), 
              {
                value: 1,  
                min: 0, 
                max: 100000
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
          controller.addPropertyChangeListener("UNIT", function(ev) {
            updateStepsAndLength();
          });
        },
        applier: function(dialog) {
          if (isElementVisible(dialog.languageSelect)) {
            var selectedLanguageOption = dialog.languageSelect.options[dialog.languageSelect.selectedIndex];
            controller.setLanguage(selectedLanguageOption == null ? null : selectedLanguageOption.value);
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
      });
}

JSViewFactory.prototype.createLevelView = function(preferences, controller) {
  return new JSDialogView(preferences,
      "@{LevelPanel.level.title}",
      document.getElementById("level-dialog-template"), 
      {
        size: "small",
        initializer: function (dialog) {
          var unitName = this.preferences.getLengthUnit().getName();

          var visibleCheckbox = dialog.getElement("visible-checkbox");
          var visibleCheckboxDisplay = controller.isPropertyEditable("VIEWABLE") ? "initial" : "none";
          visibleCheckbox.parentElement.style.display = visibleCheckboxDisplay;
          visibleCheckbox.checked = controller.getViewable();
          dialog.registerEventListener(visibleCheckbox, "change", function() {
            controller.setViewable(visibleCheckbox.checked);
          });
          controller.addPropertyChangeListener("VIEWABLE", function() {
            visibleCheckbox.checked = controller.getViewable();
          });

          var nameInput = dialog.getElement("name-input");
          var nameDisplay = controller.isPropertyEditable("NAME") ? "initial" : "none";
          nameInput.parentElement.style.display = nameDisplay;
          nameInput.parentElement.previousElementSibling.style.display = nameDisplay;
          nameInput.value = controller.getName();
          dialog.registerEventListener(nameInput, "input", function() {
            var name = nameInput.value;
            if (name == null || name.trim().length == 0) {
              controller.setName(null);
            } else {
              controller.setName(name);
            }
          });
          controller.addPropertyChangeListener("NAME", function() {
            nameInput.value = controller.getName();
          });

          var minimumLength = preferences.getLengthUnit().getMinimumLength();
          var maximumLength = preferences.getLengthUnit().getMaximumLength();

          var setFloorThicknessEnabled = function() {
            var selectedLevelIndex = controller.getSelectedLevelIndex();
            if (selectedLevelIndex != null) {
              var levels = controller.getLevels();
              dialog.floorThicknessInput.enable(levels[selectedLevelIndex].getElevation() != levels[0].getElevation());
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
                min: -1000,
                max: preferences.getLengthUnit().getMaximumElevation(),
                step: dialog.getLengthInputStepSize()
              });
          elevationInput.parentElement.style.display = elevationDisplay;
          elevationInput.parentElement.previousElementSibling.style.display = elevationDisplay;
          dialog.registerEventListener(elevationInput, "input", function() {
              controller.setElevation(elevationInput.value);
              setFloorThicknessEnabled();
              setElevationIndexButtonsEnabled();
            });
          controller.addPropertyChangeListener("ELEVATION", function(ev) {
              elevationInput.value = ev.getNewValue();
            });

          var floorThicknessDisplay = controller.isPropertyEditable("FLOOR_THICKNESS") ? "initial" : "none";
          dialog.getElement("floor-thickness-label").textContent = dialog.getLocalizedLabelText("LevelPanel", "floorThicknessLabel.text", unitName);
          var floorThicknessInput = new JSSpinner(preferences, dialog.getElement("floor-thickness-input"), 
              {
                nullable: controller.getFloorThickness() == null,
                format: preferences.getLengthUnit().getFormat(),
                value: controller.getFloorThickness(),
                min: minimumLength,
                max: maximumLength / 10,
                step: dialog.getLengthInputStepSize(),
              });
          floorThicknessInput.parentElement.style.display = floorThicknessDisplay;
          floorThicknessInput.parentElement.previousElementSibling.style.display = floorThicknessDisplay;
          dialog.registerEventListener(floorThicknessInput, "input", function() {
            controller.setFloorThickness(floorThicknessInput.value);
          });
          controller.addPropertyChangeListener("FLOOR_THICKNESS", function(ev) {
            floorThicknessInput.value = ev.getNewValue();
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
                min: minimumLength,
                max: maximumLength,
                step: dialog.getLengthInputStepSize()
              });
          heightInput.parentElement.style.display = heightDisplay;
          heightInput.parentElement.previousElementSibling.style.display = heightDisplay;
          dialog.registerEventListener(heightInput, "input", function() {
              controller.setHeight(heightInput.value);
            });
          controller.addPropertyChangeListener("HEIGHT", function(ev) {
              heightInput.value = ev.getNewValue();
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

          var refreshSelectedLevel = function() {
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
            for (var i = 0; i < levels.length; i++) {
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

            refreshSelectedLevel();
          };

          generateTableBody();

          controller.addPropertyChangeListener("SELECT_LEVEL_INDEX", refreshSelectedLevel);
          controller.addPropertyChangeListener("LEVELS", generateTableBody);
        }
      });
}

/**
 * 
 * @param {UserPreferences} preferences 
 * @param {HomeFurnitureController} controller
 */
JSViewFactory.prototype.createHomeFurnitureView = function(preferences, controller) {
  function JSHomeFurnitureDialog() {
    this.controller = controller;
    
    JSDialogView.call(this, preferences, 
      "@{HomeFurniturePanel.homeFurniture.title}", 
      document.getElementById("home-furniture-dialog-template"),
      {
        initializer: function(dialog) {
          dialog.initNameAndPricePanel();
          dialog.initLocationPanel();
          dialog.initPaintPanel();
          dialog.initOrientationPanel();
          dialog.initSizePanel();
          dialog.initShininessPanel();

          if (dialog.controller.isPropertyEditable("VISIBLE")) {
            // Create visible check box bound to VISIBLE controller property
            var visibleCheckBox = this.getElement("visible-checkbox");
            visibleCheckBox.checked = dialog.controller.getVisible();
            this.controller.addPropertyChangeListener("VISIBLE", function(ev) {
                visibleCheckBox.checked = ev.getNewValue();
              });

            this.registerEventListener(visibleCheckBox, "change",
                function(ev) {
                  dialog.controller.setVisible(visibleCheckBox.checked);
                });
          }

          // must be done at last, needs multiple components to be initialized
          if (dialog.controller.isPropertyEditable("PAINT")) {
            dialog.updatePaintRadioButtons();
          }
        },
        applier: function() {
          controller.modifyFurniture();
        },
        disposer: function(dialog) {
          dialog.paintPanel.colorSelector.dispose();
          dialog.paintPanel.textureSelector.dispose();
        }
      });
  }
  JSHomeFurnitureDialog.prototype = Object.create(JSDialogView.prototype);
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
          value: 0, 
          min: 0, 
          max: 1000000000
        });
    var valueAddedTaxPercentageInput = new JSSpinner(this.preferences, this.getElement("value-added-tax-percentage-input"), 
        { 
          value: 0, 
          min: 0, 
          max: 100, 
          step: 0.5
        });

    // 1) adjust visibility
    var nameDisplay = this.controller.isPropertyEditable("NAME") ? "initial" : "none";
    var nameVisibleDisplay = this.controller.isPropertyEditable("NAME_VISIBLE") ? "initial" : "none";
    var priceDisplay = this.controller.isPropertyEditable("PRICE") ? "inline-block" : "none";
    var vatDisplay = this.controller.isPropertyEditable("VALUE_ADDED_TAX_PERCENTAGE") ? "inline-block" : "none";

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
    this.controller.addPropertyChangeListener("NAME", function(ev) {
      nameInput.value = controller.getName();
    });
    this.controller.addPropertyChangeListener("NAME_VISIBLE", function(ev) {
      nameVisibleCheckbox.checked = controller.getNameVisible();
    });
    this.controller.addPropertyChangeListener("PRICE", function(ev) {
      priceInput.value = controller.getPrice();
    });
    this.controller.addPropertyChangeListener("VALUE_ADDED_TAX_PERCENTAGE", function(ev) {
      if (controller.getValueAddedTaxPercentage()) {
        valueAddedTaxPercentageInput.value = controller.getValueAddedTaxPercentage() * 100;
      } else {
        valueAddedTaxPercentageInput.value = null;
      }
    });

    // 4) add change listeners
    this.registerEventListener([nameInput, nameVisibleCheckbox, priceInput, valueAddedTaxPercentageInput], "change",
        function(ev) {
          controller.setName(nameInput.value);
          controller.setNameVisible(nameVisibleCheckbox.checked);
          controller.setPrice(priceInput.value != null && priceInput.value != "" 
              ? new Big(parseFloat(priceInput.value)) 
              : null);
  
          var vat = valueAddedTaxPercentageInput.value;
          controller.setValueAddedTaxPercentage(vat != null 
              ? new Big(parseFloat(vat) / 100) 
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
          step: this.getLengthInputStepSize()
        });
    var yLabel = this.getElement("y-label");
    var yInput = new JSSpinner(this.preferences, this.getElement("y-input"), 
        {
          nullable: this.controller.getY() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          step: this.getLengthInputStepSize()
        });
    var elevationLabel = this.getElement("elevation-label");
    var elevationInput = new JSSpinner(this.preferences, this.getElement("elevation-input"), 
        {
          nullable: this.controller.getElevation() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          step: this.getLengthInputStepSize()
        });

    var mirroredModelCheckbox = this.getElement("mirrored-model-checkbox");
    var basePlanItemCheckbox = this.getElement("base-plan-item-checkbox");

    // 1) adjust visibility
    var xDisplay = this.controller.isPropertyEditable("X") ? "initial" : "none";
    var yDisplay = this.controller.isPropertyEditable("Y") ? "initial" : "none";
    var elevationDisplay = this.controller.isPropertyEditable("ELEVATION") ? "initial" : "none";
    var modelMirroredDisplay = this.controller.isPropertyEditable("MODEL_MIRRORED") ? "initial" : "none";
    var basePlanItemDisplay = this.controller.isPropertyEditable("BASE_PLAN_ITEM") ? "initial" : "none";

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
    xLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "xLabel.text", unitName);
    yLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "yLabel.text", unitName);
    elevationLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "elevationLabel.text", unitName);
    
    // 4) set custom attributes
    var maximumLength = this.preferences.getLengthUnit().getMaximumLength();
    var maximumElevation = this.preferences.getLengthUnit().getMaximumElevation();
    xInput.min = yInput.min = -maximumLength;
    xInput.max = yInput.max = maximumLength;
    elevationInput.min = 0;
    elevationInput.max = maximumElevation;

    // 5) add property listeners
    var controller = this.controller;
    this.controller.addPropertyChangeListener("X", function(ev) {
        xInput.value = controller.getX();
      });
    this.controller.addPropertyChangeListener("Y", function(ev) {
        yInput.value = controller.getY();
      });
    this.controller.addPropertyChangeListener("ELEVATION", function(ev) {
        elevationInput.value = controller.getElevation();
      });
    this.controller.addPropertyChangeListener("MODEL_MIRRORED", function(ev) {
        mirroredModelCheckbox.checked = controller.getModelMirrored();
      });
    this.controller.addPropertyChangeListener("BASE_PLAN_ITEM", function(ev) {
        basePlanItemCheckbox.checked = controller.getBasePlanItem();
      });

    // 6) add change listeners
    this.registerEventListener([xInput, yInput, elevationInput, mirroredModelCheckbox, basePlanItemCheckbox], "change",
        function(ev) {
          controller.setX(xInput.value != null && xInput.value != "" ? parseFloat(xInput.value) : null);
          controller.setY(yInput.value != null && yInput.value != "" ? parseFloat(yInput.value) : null);
          controller.setElevation(elevationInput.value != null && elevationInput.value != "" ? parseFloat(elevationInput.value) : null);
          controller.setModelMirrored(mirroredModelCheckbox.checked);
          controller.setBasePlanItem(basePlanItemCheckbox.checked);
        });
  }

  /**
   * @private
   */
  JSHomeFurnitureDialog.prototype.initOrientationPanel = function() {
    var controller = this.controller;

    var angleLabel = this.getElement("angle-label");
    var angleDecimalFormat = new DecimalFormat();
    angleDecimalFormat.maximumFractionDigits = 1;

    var angleInput = new JSSpinner(this.preferences, this.getElement("angle-input"), 
        {
          nullable: this.controller.getAngle() == null,
          format: angleDecimalFormat,
          min: 0,
          max: 360
        });
    var horizontalRotationRadioRoll = this.findElement("[name='horizontal-rotation-radio'][value='ROLL']");
    var horizontalRotationRadioPitch = this.findElement("[name='horizontal-rotation-radio'][value='PITCH']");
    var rollInput = new JSSpinner(this.preferences, this.getElement("roll-input"), 
        {
          nullable: this.controller.getRoll() == null,
          format: angleDecimalFormat,
          min: 0,
          max: 360
        });
    var pitchInput = new JSSpinner(this.preferences, this.getElement("pitch-input"), 
        {
          nullable: this.controller.getPitch() == null,
          format: angleDecimalFormat,
          min: 0,
          max: 360
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
    angleInput.getRootNode().parentElement.style.display = angleDisplay;

    horizontalRotationRadioRoll.parentElement.style.display = rollDisplay; 
    rollInput.getRootNode().parentElement.style.display = rollDisplay; 
    
    horizontalRotationRadioPitch.parentElement.style.display = pitchDisplay; 
    pitchInput.getRootNode().parentElement.style.display = pitchDisplay; 

    horizontalRotationLabel.style.display = horizontalRotationLabelDisplay;    
    verticalRotationLabel.style.display = verticalRotationLabelDisplay;
    furnitureOrientationImage.style.display = furnitureOrientationImageDisplay;

    // 2) Set values
    if (this.controller.getAngle() != null) {
      angleInput.value = Math.toDegrees(this.controller.getAngle());
    } else {
      angleInput.value = null;
    }
    if (this.controller.getRoll() != null) {
      rollInput.value = Math.toDegrees(this.controller.getRoll());
    } else {
      rollInput.value = null;
    }
    if (this.controller.getPitch() != null) {
      pitchInput.value = Math.toDegrees(this.controller.getPitch());
    } else {
      pitchInput.value = null;
    }

    var updateHorizontalAxisRadioButtons = function() {
      horizontalRotationRadioRoll.checked = controller.getHorizontalAxis() == HomeFurnitureController.FurnitureHorizontalAxis.ROLL;
      horizontalRotationRadioPitch.checked = controller.getHorizontalAxis() == HomeFurnitureController.FurnitureHorizontalAxis.PITCH;
    }
    updateHorizontalAxisRadioButtons();

    // 3) Add property listeners
    this.controller.addPropertyChangeListener("ANGLE", function(ev) {
        if (controller.getAngle() != null) {
          angleInput.value = Math.toDegrees(controller.getAngle());
        } else {
          angleInput.value = null;
        }
      });
    this.controller.addPropertyChangeListener("ROLL", function(ev) {
        if (controller.getRoll() != null) {
          rollInput.value = Math.toDegrees(controller.getRoll());
        } else {
          rollInput.value = null;
        }
      });
    this.controller.addPropertyChangeListener("PITCH", function(ev) {
        if (controller.getPitch() != null) {
          pitchInput.value = Math.toDegrees(controller.getPitch());
        } else {
          pitchInput.value = null;
        }
      });
    this.controller.addPropertyChangeListener("HORIZONTAL_AXIS", function(ev) {
        updateHorizontalAxisRadioButtons();
      });

    // 4) Add change listeners
    this.registerEventListener(angleInput, "input", function() {
        if (angleInput.value == null || angleInput.value == "") {
          controller.setAngle(null);
        } else {
          controller.setAngle(Math.toRadians(angleInput.value));
        }
      });
    this.registerEventListener(rollInput, "input", function() {
        if (rollInput.value == null || rollInput.value == "") {
          controller.setRoll(null);
        } else {
          controller.setRoll(Math.toRadians(rollInput.value));
          controller.setHorizontalAxis(HomeFurnitureController.FurnitureHorizontalAxis.ROLL);
        }
      });
    this.registerEventListener(pitchInput, "input", function() {
        if (pitchInput.value == null || pitchInput.value == "") {
          // Force 0 here because null seems to create a bug in save (furniture entirely disappears)
          controller.setPitch(null);
        } else {
          controller.setPitch(Math.toRadians(pitchInput.value));
          controller.setHorizontalAxis(HomeFurnitureController.FurnitureHorizontalAxis.PITCH);
        }
      });
    this.registerEventListener([horizontalRotationRadioRoll, horizontalRotationRadioPitch], "change", function() {
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

    var colorSelector = new JSColorSelectorButton(preferences, null,
        {
          colorSelected: function(color) {
              colorAndTextureRadioButtons[HomeFurnitureController.FurniturePaint.COLORED].checked = true;
              controller.setPaint(HomeFurnitureController.FurniturePaint.COLORED);
              controller.setColor(color);
            }
        });
    dialog.attachChildComponent("color-selector-button", colorSelector)
    colorSelector.set(controller.getColor());

    var textureSelector = controller.getTextureController().getView();
    textureSelector.onTextureSelected = function(texture) {
      colorAndTextureRadioButtons[HomeFurnitureController.FurniturePaint.TEXTURED].checked = true;
      controller.setPaint(HomeFurnitureController.FurniturePaint.TEXTURED);
      controller.getTextureController().setTexture(texture);
    };
    dialog.attachChildComponent("texture-selector-button", textureSelector);
    textureSelector.set(controller.getTextureController().getTexture());

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
    materialSelector.enable(uniqueModel);

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

    dialog.registerEventListener(colorAndTextureRadioButtons, "change", 
        function(ev) { 
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
          step: this.getLengthInputStepSize()
        });
    var depthLabel = this.getElement("depth-label");
    var depthInput = new JSSpinner(this.preferences, this.getElement("depth-input"), 
        {
          nullable: controller.getDepth() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          step: this.getLengthInputStepSize()
        });
    var heightLabel = this.getElement("height-label");
    var heightInput = this.getElement("height-input");
    var heightInput = new JSSpinner(this.preferences, this.getElement("height-input"), 
        {
          nullable: controller.getHeight() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          step: this.getLengthInputStepSize()
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
    widthInput.value = this.controller.getWidth();
    depthInput.value = this.controller.getDepth();
    heightInput.value = this.controller.getHeight();
    keepProportionsCheckbox.checked = this.controller.isProportional();

    // 3) Set labels
    var unitName = this.preferences.getLengthUnit().getName();
    widthLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "widthLabel.text", unitName);
    depthLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "depthLabel.text", unitName);
    heightLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "heightLabel.text", unitName);

    // 4) Set custom attributes
    var minimumLength = this.preferences.getLengthUnit().getMinimumLength();
    var maximumLength = this.preferences.getLengthUnit().getMaximumLength();
    widthInput.min = depthInput.min = heightInput.min = minimumLength;
    widthInput.max = depthInput.max = heightInput.max = maximumLength;

    // 5) Add property listeners
    var controller = this.controller;
    this.controller.addPropertyChangeListener("WIDTH", function(ev) {
        widthInput.value = controller.getWidth();
      });
    this.controller.addPropertyChangeListener("DEPTH", function(ev) {
        depthInput.value = controller.getDepth();
      });
    this.controller.addPropertyChangeListener("HEIGHT", function(ev) {
        heightInput.value = controller.getHeight();
      });
    this.controller.addPropertyChangeListener("PROPORTIONAL", function(ev) {
        keepProportionsCheckbox.checked = controller.isProportional();
      });

    // 6) Add change listeners
    this.registerEventListener([widthInput, depthInput, heightInput, keepProportionsCheckbox], "change",
        function(ev) {
          controller.setWidth(widthInput.value != null && widthInput.value != "" ? parseFloat(widthInput.value) : null);
          controller.setDepth(depthInput.value != null && depthInput.value != "" ? parseFloat(depthInput.value) : null);
          controller.setHeight(heightInput.value != null && heightInput.value != "" ? parseFloat(heightInput.value) : null);
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
        keepProportionsCheckbox: keepProportionsCheckbox};

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
      controller.addPropertyChangeListener("SHININESS", 
          function(ev) {
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
          min: -maximumLength,
          max: maximumLength,
          step: dialog.getLengthInputStepSize()
        });
    var yStartInput = new JSSpinner(preferences, dialog.getElement("y-start-input"), 
        {
          nullable: controller.getYStart() == null,
          format: preferences.getLengthUnit().getFormat(),
          value: controller.getYStart(),
          min: -maximumLength,
          max: maximumLength,
          step: dialog.getLengthInputStepSize()
        });
    var xEndLabel = dialog.getElement("x-end-label");
    var yEndLabel = dialog.getElement("y-end-label");
    var distanceToEndPointLabel = dialog.getElement("distance-to-end-point-label");
    var xEndInput = new JSSpinner(preferences, dialog.getElement("x-end-input"), 
        {
          nullable: controller.getXEnd() == null,
          format: preferences.getLengthUnit().getFormat(),
          value: controller.getXEnd(),
          min: -maximumLength,
          max: maximumLength,
          step: dialog.getLengthInputStepSize()
        });
    var yEndInput = new JSSpinner(preferences, dialog.getElement("y-end-input"), 
        {
          nullable: controller.getYEnd() == null,
          format: preferences.getLengthUnit().getFormat(),
          value: controller.getYEnd(),
          min: -maximumLength,
          max: maximumLength,
          step: dialog.getLengthInputStepSize()
        });
    var distanceToEndPointInput = new JSSpinner(preferences, dialog.getElement("distance-to-end-point-input"), 
        {
          nullable: controller.getDistanceToEndPoint() == null,
          format: preferences.getLengthUnit().getFormat(),
          value: controller.getDistanceToEndPoint(),
          min: preferences.getLengthUnit().getMinimumLength(),
          max: 2 * maximumLength * Math.sqrt(2),
          step: dialog.getLengthInputStepSize()
        });

    var unitName = preferences.getLengthUnit().getName();
    xStartLabel.textContent = dialog.getLocalizedLabelText("WallPanel", "xLabel.text", unitName)
    xEndLabel.textContent = dialog.getLocalizedLabelText("WallPanel", "xLabel.text", unitName)
    yStartLabel.textContent = dialog.getLocalizedLabelText("WallPanel", "yLabel.text", unitName)
    yEndLabel.textContent = dialog.getLocalizedLabelText("WallPanel", "yLabel.text", unitName)
    distanceToEndPointLabel.textContent = dialog.getLocalizedLabelText("WallPanel", "distanceToEndPointLabel.text", unitName)

    controller.addPropertyChangeListener("X_START", function(ev) {
        xStartInput.value = ev.getNewValue();
      });
    controller.addPropertyChangeListener("Y_START", function(ev) {
        yStartInput.value = ev.getNewValue();
      });
    controller.addPropertyChangeListener("X_END", function(ev) {
        xEndInput.value = ev.getNewValue();
      });
    controller.addPropertyChangeListener("Y_END", function(ev) {
        yEndInput.value = ev.getNewValue();
      });
    controller.addPropertyChangeListener("DISTANCE_TO_END_POINT", function(ev) {
        distanceToEndPointInput.value = ev.getNewValue();
      });

    dialog.registerEventListener(xStartInput, "input", function() {
        controller.setXStart(xStartInput.value);
      });
    dialog.registerEventListener(yStartInput, "input", function() {
        controller.setYStart(yStartInput.value);
      });
    dialog.registerEventListener(xEndInput, "input", function() {
        controller.setXEnd(xEndInput.value);
      });
    dialog.registerEventListener(yEndInput, "input", function() {
        controller.setYEnd(yEndInput.value);
      });
    dialog.registerEventListener(distanceToEndPointInput, "input", function() {
        controller.setDistanceToEndPoint(distanceToEndPointInput.value);
      });
  }

  var editBaseboard = function(controller, dialogTitle) {
      var view = controller.getView();
  
      var dialog = new JSDialogView(preferences, dialogTitle,
          "<div data-name='content'></div>", 
          {
            size: "small",
            initializer: function (dialog) {
              dialog.attachChildComponent("content", view);
            },
            applier: function() {
              // Do not remove - applier must be defined so OK button shows
            }
          });
  
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
          colorSelected: function(selectedColor) {
              dialog.findElement("[name='left-side-color-and-texture-choice'][value='COLORED']").checked = true;
              controller.setLeftSidePaint(WallController.WallPaint.COLORED);
              controller.setLeftSideColor(selectedColor);
            }
        });
    dialog.rightSideColorSelector = new JSColorSelectorButton(preferences, null, 
        {
          colorSelected: function(selectedColor) {
            dialog.findElement("[name='right-side-color-and-texture-choice'][value='COLORED']").checked = true;
            controller.setRightSidePaint(WallController.WallPaint.COLORED);
            controller.setRightSideColor(selectedColor);
          }
        });
    dialog.leftSideColorSelector = new JSColorSelectorButton(preferences, null,
        {
          colorSelected: function(selectedColor) {
            dialog.findElement("[name='left-side-color-and-texture-choice'][value='COLORED']").checked = true;
            controller.setLeftSidePaint(WallController.WallPaint.COLORED);
            controller.setLeftSideColor(selectedColor);
          }
        });
    dialog.attachChildComponent("left-side-color-selector-button", dialog.leftSideColorSelector);
    dialog.attachChildComponent("right-side-color-selector-button", dialog.rightSideColorSelector);

    dialog.leftSideColorSelector.set(controller.getLeftSideColor());
    dialog.rightSideColorSelector.set(controller.getRightSideColor());
    controller.addPropertyChangeListener("LEFT_SIDE_COLOR", function() {
      dialog.leftSideColorSelector.set(controller.getLeftSideColor());
    });
    controller.addPropertyChangeListener("RIGHT_SIDE_COLOR", function() {
      dialog.rightSideColorSelector.set(controller.getRightSideColor());
    });

    // Textures
    dialog.leftSideTextureSelector = controller.getLeftSideTextureController().getView();
    dialog.leftSideTextureSelector.onTextureSelected = function(texture) {
      dialog.findElement("[name='left-side-color-and-texture-choice'][value='TEXTURED']").checked = true;
      controller.setLeftSidePaint(WallController.WallPaint.TEXTURED);
      controller.getLeftSideTextureController().setTexture(texture);
    };
    dialog.attachChildComponent('left-side-texture-selector-button', dialog.leftSideTextureSelector);
    dialog.leftSideTextureSelector.set(controller.getLeftSideTextureController().getTexture());

    dialog.rightSideTextureSelector = controller.getRightSideTextureController().getView();
    dialog.rightSideTextureSelector.onTextureSelected = function(texture) {
      dialog.findElement("[name='right-side-color-and-texture-choice'][value='TEXTURED']").checked = true;
      controller.setRightSidePaint(WallController.WallPaint.TEXTURED);
      controller.getRightSideTextureController().setTexture(texture);
    };
    dialog.attachChildComponent("right-side-texture-selector-button", dialog.rightSideTextureSelector);
    dialog.rightSideTextureSelector.set(controller.getRightSideTextureController().getTexture());

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

    // baseboards
    var leftSideBaseboardButton = dialog.getElement("left-side-modify-baseboard-button");
    var rightSideBaseboardButton = dialog.getElement("right-side-modify-baseboard-button");
    var leftSideBaseboardButtonAction = new ResourceAction(preferences, "WallPanel", "MODIFY_LEFT_SIDE_BASEBOARD", true);
    var rightSideBaseboardButtonAction = new ResourceAction(preferences, "WallPanel", "MODIFY_RIGHT_SIDE_BASEBOARD", true);
    leftSideBaseboardButton.textContent = leftSideBaseboardButtonAction.getValue(AbstractAction.NAME);
    rightSideBaseboardButton.textContent = rightSideBaseboardButtonAction.getValue(AbstractAction.NAME);

    dialog.registerEventListener([leftSideBaseboardButton, rightSideBaseboardButton], "click", 
        function(ev) {
          var dialogTitle;
          var baseboardController;
          if (this == leftSideBaseboardButton) {
            baseboardController = controller.getLeftSideBaseboardController();
            dialogTitle = dialog.getLocalizedLabelText("WallPanel", "leftSideBaseboardDialog.title");
          } else {
            baseboardController = controller.getRightSideBaseboardController();
            dialogTitle = dialog.getLocalizedLabelText("WallPanel", "rightSideBaseboardDialog.title");
          }
          editBaseboard(baseboardController, dialogTitle);
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
            render: function(patternURL, patternItemElement) {
              patternItemElement.style.backgroundImage = "url('" + patternURL + "')";
            },
            selectionChanged: function(newValue) {
              controller.setPattern(patternsTexturesByURL[newValue]);
            }
          });
  
      var setPatternFromController = function() {
          var url = controller.getPattern().getImage().getURL();
          patternComboBox.set(url);
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
            colorSelected: function(selectedColor) {
              topPaintRadioColor.checked = true;
              controller.setTopPaint(WallController.WallPaint.COLORED);
              controller.setTopColor(selectedColor);
            }
          });
      dialog.attachChildComponent("top-color-selector-button", dialog.topColorSelector);
      dialog.topColorSelector.set(controller.getTopColor());
      controller.addPropertyChangeListener("TOP_COLOR", function() {
          dialog.topColorSelector.set(controller.getTopColor());
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
            step: dialog.getLengthInputStepSize(),
            min: minimumLength,
            max: maximumLength
          });
      controller.addPropertyChangeListener("RECTANGULAR_WALL_HEIGHT", function(ev) {
          rectangularWallHeightInput.value = ev.getNewValue();
        });
      dialog.registerEventListener(rectangularWallHeightInput, "input", function(ev) {
          controller.setRectangularWallHeight(rectangularWallHeightInput.value);
        });
  
      var minimumHeight = controller.getSlopingWallHeightAtStart() != null && controller.getSlopingWallHeightAtEnd() != null
          ? 0
          : minimumLength;
      var slopingWallHeightAtStartInput = new JSSpinner(preferences, dialog.getElement("sloping-wall-height-at-start-input"), 
          {
            nullable: controller.getSlopingWallHeightAtStart() == null,
            format: preferences.getLengthUnit().getFormat(),
            value: controller.getSlopingWallHeightAtStart(),
            step: dialog.getLengthInputStepSize(),
            min: minimumHeight,
            max: maximumLength
          });
      controller.addPropertyChangeListener("SLOPING_WALL_HEIGHT_AT_START", function(ev) {
          slopingWallHeightAtStartInput.value = ev.getNewValue();
        });
      dialog.registerEventListener(slopingWallHeightAtStartInput, "input", function(ev) {
        controller.setSlopingWallHeightAtStart(slopingWallHeightAtStartInput.value);
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
            step: dialog.getLengthInputStepSize(),
            min: minimumHeight,
            max: maximumLength
          });
      controller.addPropertyChangeListener("SLOPING_WALL_HEIGHT_AT_END", function(ev) {
          slopingWallHeightAtEndInput.value = ev.getNewValue();
        });
      dialog.registerEventListener(slopingWallHeightAtEndInput, "input", function(ev) {
          controller.setSlopingWallHeightAtEnd(slopingWallHeightAtEndInput.value);
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
            step: dialog.getLengthInputStepSize(),
            min: minimumLength,
            max: maximumLength / 10
          });
      controller.addPropertyChangeListener("THICKNESS", function(ev) {
          thicknessInput.value = ev.getNewValue();
        });
      dialog.registerEventListener(thicknessInput, "input", function(ev) {
          controller.setThickness(thicknessInput.value);
        });
  
      dialog.getElement("arc-extent-label").textContent = dialog.getLocalizedLabelText("WallPanel", "arcExtentLabel.text", unitName);
      var angleDecimalFormat = new DecimalFormat();
      angleDecimalFormat.maximumFractionDigits = 1;
      var arcExtentInput = new JSSpinner(this.preferences, dialog.getElement("arc-extent-input"), 
          {
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
      controller.addPropertyChangeListener("ARC_EXTENT_IN_DEGREES", function(ev) {
          setArcExtentFromController();
        });
  
      dialog.registerEventListener(arcExtentInput, "input", function(ev) {
          controller.setArcExtentInDegrees(arcExtentInput.value != null ? arcExtentInput.value : null);
        });
    };

  return new JSDialogView(preferences,
      "@{WallPanel.wall.title}", 
      document.getElementById("wall-dialog-template"), 
      {
        initializer: function(dialog) {
          initStartAndEndPointsPanel(dialog);
          initLeftAndRightSidesPanels(dialog);
          initTopPanel(dialog);
          initHeightPanel(dialog);
  
          dialog.getElement("wall-orientation-label").innerHTML = dialog.getLocalizedLabelText(
            "WallPanel", "wallOrientationLabel.text", "lib/wallOrientation.png");
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
        size: "medium"
      });
}

/**
 * @param {UserPreferences} preferences
 * @param {RoomController} controller
 * @returns {JSDialogView}
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
            colorSelected: function(selectedColor) {
              floorColorCheckbox.checked = true;
              controller.setFloorPaint(RoomController.RoomPaint.COLORED);
              controller.setFloorColor(selectedColor);
            }
          });
      dialog.attachChildComponent("floor-color-selector-button", dialog.floorColorSelector)
      dialog.floorColorSelector.set(controller.getFloorColor());
  
      var floorTextureCheckbox = dialog.findElement("[name='floor-color-and-texture-choice'][value='TEXTURED']");
      dialog.floorTextureSelector = controller.getFloorTextureController().getView();
      dialog.floorTextureSelector.onTextureSelected = function(texture) {
          floorTextureCheckbox.checked = true;
          controller.setFloorPaint(RoomController.RoomPaint.TEXTURED);
          controller.getFloorTextureController().setTexture(texture);
        };
      dialog.attachChildComponent("floor-texture-selector-button", dialog.floorTextureSelector);
      dialog.floorTextureSelector.set(controller.getFloorTextureController().getTexture());
  
      dialog.registerEventListener([floorColorCheckbox, floorTextureCheckbox], "change", function(ev) {
          var selectedPaint = RoomController.RoomPaint[this.value];
          controller.setFloorPaint(selectedPaint);
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
            colorSelected: function(selectedColor) {
              ceilingColorCheckbox.checked = true;
              controller.setCeilingPaint(RoomController.RoomPaint.COLORED);
              controller.setCeilingColor(selectedColor);
            }
          });
      dialog.attachChildComponent("ceiling-color-selector-button", dialog.ceilingColorSelector)
      dialog.ceilingColorSelector.set(controller.getCeilingColor());
  
      var ceilingTextureCheckbox = dialog.findElement("[name='ceiling-color-and-texture-choice'][value='TEXTURED']");
      dialog.ceilingTextureSelector = controller.getCeilingTextureController().getView();
      dialog.ceilingTextureSelector.onTextureSelected = function(texture) {
        ceilingTextureCheckbox.checked = true;
        controller.setCeilingPaint(RoomController.RoomPaint.TEXTURED);
        controller.getCeilingTextureController().setTexture(texture);
      };
      dialog.attachChildComponent("ceiling-texture-selector-button", dialog.ceilingTextureSelector);
      dialog.ceilingTextureSelector.set(controller.getCeilingTextureController().getTexture());
  
      dialog.registerEventListener([ceilingColorCheckbox, ceilingTextureCheckbox], "change", function(ev) {
          var selectedPaint = RoomController.RoomPaint[this.value];
          controller.setCeilingPaint(selectedPaint);
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
            colorSelected: function(selectedColor) {
              wallSidesColorCheckbox.checked = true;
              controller.setWallSidesPaint(RoomController.RoomPaint.COLORED);
              controller.setWallSidesColor(selectedColor);
            }
          });
      dialog.attachChildComponent("wall-sides-color-selector-button", dialog.wallSidesColorSelector)
      dialog.wallSidesColorSelector.set(controller.getWallSidesColor());
  
      var wallSidesTextureCheckbox = dialog.findElement("[name='wall-sides-color-and-texture-choice'][value='TEXTURED']");
      dialog.wallSidesTextureSelector = controller.getWallSidesTextureController().getView();
      dialog.wallSidesTextureSelector.onTextureSelected = function(texture) {
          wallSidesTextureCheckbox.checked = true;
          controller.setWallSidesPaint(RoomController.RoomPaint.TEXTURED);
          controller.getWallSidesTextureController().setTexture(texture);
        };
      dialog.attachChildComponent("wall-sides-texture-selector-button", dialog.wallSidesTextureSelector);
      dialog.wallSidesTextureSelector.set(controller.getWallSidesTextureController().getTexture());
  
      dialog.registerEventListener([wallSidesColorCheckbox, wallSidesTextureCheckbox], "change", function(ev) {
          var selectedPaint = RoomController.RoomPaint[this.value];
          controller.setWallSidesPaint(selectedPaint);
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

  return new JSDialogView(preferences, 
      "@{RoomPanel.room.title}", 
      document.getElementById("room-dialog-template"), 
      {
        initializer: function(dialog) {
          var behavior = this;
  
          var nameDisplay = controller.isPropertyEditable("NAME") ? "initial" : "none";
          dialog.nameInput = dialog.getElement("name-input");
          dialog.nameInput.value = controller.getName();
          dialog.nameInput.parentElement.style.display = nameDisplay;
          dialog.registerEventListener(dialog.nameInput, "input", function() {
            controller.setName(dialog.nameInput.trim());
          });
          controller.addPropertyChangeListener("NAME", function(ev) {
            dialog.nameInput.value = controller.getName();
          });
  
          var areaVisiblePanelDisplay = controller.isPropertyEditable("AREA_VISIBLE") ? "initial" : "none";
          dialog.areaVisibleCheckbox = dialog.getElement("area-visible-checkbox");
          dialog.areaVisibleCheckbox.checked = controller.getAreaVisible();
          dialog.areaVisibleCheckbox.parentElement.style.display = areaVisiblePanelDisplay;
          dialog.registerEventListener(dialog.areaVisibleCheckbox, "change", function() {
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
      });
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
  
      var comboBox = new JSComboBox(this.preferences, dialog.getElement("arrows-style-select"), {
        nullable: false,
        availableValues: arrowsStylesCombinations,
        render: function(arrowStyle, itemElement) {
          itemElement.style.border = "none";
          itemElement.style.maxWidth = "6em";
          itemElement.style.margin = "auto";
  
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
        },
        selectionChanged: function(newValue) {
          controller.setStartArrowStyle(newValue.startStyle);
          controller.setEndArrowStyle(newValue.endStyle);
        }
      });
  
      var setStyleFromController = function() {
        var startArrowStyle = controller.getStartArrowStyle();
        var endArrowStyle = controller.getEndArrowStyle();
  
        comboBox.enable(controller.isArrowsStyleEditable());
        comboBox.set({ startStyle: startArrowStyle, endStyle: endArrowStyle });
      };
      setStyleFromController();
      controller.addPropertyChangeListener("START_ARROW_STYLE", setStyleFromController);
      controller.addPropertyChangeListener("END_ARROW_STYLE", setStyleFromController);
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
  
      var comboBox = new JSComboBox(this.preferences, dialog.getElement("join-style-select"), {
        nullable: false,
        availableValues: joinStyles,
        render: function(joinStyle, itemElement) {
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
          canvas.style.height = "100%";
          canvas.style.maxWidth = "100%";
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
  
          itemElement.appendChild(canvas);
        },
        selectionChanged: function(newValue) {
          controller.setJoinStyle(newValue);
        }
      });
  
      var setFromController = function() {
        comboBox.enable(controller.isJoinStyleEditable());
        comboBox.set(controller.getJoinStyle());
      };
      setFromController();
      controller.addPropertyChangeListener("JOIN_STYLE", setFromController);
    };

  var initDashStyleComboBox = function(dialog) {
      var dashStyles = [];
      var dashStyleEnumValues = Object.keys(Polyline.DashStyle);
      for (var i = 0; i < dashStyleEnumValues.length; i++) {
        var dashStyle = parseInt(dashStyleEnumValues[i]);
        if (!isNaN(dashStyle) && (dashStyle != Polyline.DashStyle.CUSTOMIZED || controller.getDashStyle() == Polyline.DashStyle.CUSTOMIZED)) {
          dashStyles.push(dashStyle);
        }
      }
  
      var comboBox = new JSComboBox(this.preferences, dialog.getElement("dash-style-select"), 
          {
            nullable: false,
            availableValues: dashStyles,
            render: function(dashStyle, itemElement) {
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
              var canvasContext = canvas.getContext("2d");
              canvasContext.imageSmoothingEnabled= false;
      
              canvasContext.lineWidth = 10;
              canvasContext.beginPath();
              canvasContext.moveTo(0, canvas.height / 2);
              var dashPattern = dashStyle != null && dashStyle != Polyline.DashStyle.CUSTOMIZED 
                  ? Polyline.DashStyle._$wrappers[dashStyle].getDashPattern() 
                  : controller.getDashPattern();
      
              dashPattern = Array.from(dashPattern);
      
              // apply 10 factor to enhance rendering
              for (var i = 0; i < dashPattern.length; i++) {
                dashPattern[i] = 10 * dashPattern[i];
              }
      
              var dashOffset = controller.getDashOffset() != null ? controller.getDashOffset() : 0;
              canvasContext.setLineDash(dashPattern);
              canvasContext.lineDashOffset = dashOffset * canvas.width;
              canvasContext.lineTo(canvas.width, canvas.height / 2);
              canvasContext.stroke();
      
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
            step: 5,
            min: 0,
            max: 100,
          });
      dialog.registerEventListener(dashOffsetInput, "input", function() {
          controller.setDashOffset(dashOffsetInput.value != null
              ? dashOffsetInput.value / 100
              : null);
        });
      controller.addPropertyChangeListener("DASH_OFFSET", function() {
          dashOffsetInput.value = controller.getDashOffset() == null ? null : controller.getDashOffset() * 100;
          comboBox.refreshUI();
        });
  
      var setDashStyleFromController = function() {
          dashOffsetInput.enable(controller.getDashStyle() != Polyline.DashStyle.SOLID);
          comboBox.set(controller.getDashStyle());
        };
      setDashStyleFromController();
      controller.addPropertyChangeListener("DASH_STYLE", setDashStyleFromController);
    };

  return new JSDialogView(preferences, 
      "@{PolylinePanel.polyline.title}", 
      document.getElementById("polyline-dialog-template"), 
      {
        size: "small",
        initializer: function(dialog) {
          dialog.colorSelector = new JSColorSelectorButton(preferences, null,
              {
                colorSelected: function(selectedColor) {
                  controller.setColor(selectedColor);
                }
              });
          dialog.attachChildComponent("color-selector-button", dialog.colorSelector)
          dialog.colorSelector.set(controller.getColor());
  
          dialog.thicknessLabelElement = dialog.getElement("thickness-label");
          dialog.thicknessLabelElement.textContent = dialog.getLocalizedLabelText(
              "PolylinePanel", "thicknessLabel.text", dialog.preferences.getLengthUnit().getName());
          
          dialog.thicknessInput = new JSSpinner(preferences, dialog.getElement("thickness-input"), 
              {format: preferences.getLengthUnit().getFormat(),
               value: controller.getThickness(),
               step: dialog.getLengthInputStepSize(),
               nullable: controller.getThickness() == null,
               min: preferences.getLengthUnit().getMinimumLength(),
               max: 50});
          controller.addPropertyChangeListener("THICKNESS", function(ev) {
              dialog.thicknessInput.value = controller.getThickness();
            });
          dialog.registerEventListener(dialog.thicknessInput, "input", function(ev) {
              controller.setThickness(dialog.thicknessInput.value);
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
        },
        applier: function(dialog) {
          controller.modifyPolylines();
        },
        disposer: function(dialog) {
          dialog.colorSelector.dispose();
        }
      });
}

JSViewFactory.prototype.createLabelView = function(modification, preferences, controller) {
  return new JSDialogView(preferences, 
      "@{LabelPanel.labelModification.title}", 
      document.getElementById("label-dialog-template"), 
      {
        initializer: function(dialog) {
          dialog.nameInput = dialog.getElement("text");
          dialog.nameInput.value = modification ? controller.getText() : "Text";
          
          dialog.alignmentRadios = dialog.getRootNode().querySelectorAll("[name='label-alignment-radio']");
          if (controller.getAlignment() != null) {
            var selectedAlignmentRadio = dialog.findElement("[name='label-alignment-radio'][value='" + TextStyle.Alignment[controller.getAlignment()] + "']");
            if (selectedAlignmentRadio != null) {
              selectedAlignmentRadio.checked = true;
            }
          }
  
          dialog.fontSelect = dialog.getElement("font-select");
          var DEFAULT_SYSTEM_FONT_NAME = "DEFAULT_SYSTEM_FONT_NAME";
          var setFontFromController = function() {
              if (controller.isFontNameSet()) {
                var selectedValue = controller.getFontName() == null ? DEFAULT_SYSTEM_FONT_NAME : controller.getFontName();
                var selectedOption = dialog.fontSelect.querySelector("[value='" + selectedValue + "']");
                if (selectedOption) {
                  selectedOption.selected = true;
                }
              } else {
                dialog.fontSelect.selectedIndex = undefined;
              }
            };
  
          CoreTools.loadAvailableFontNames(function(fonts) {
              fonts = [DEFAULT_SYSTEM_FONT_NAME].concat(fonts);
              for (var i = 0; i < fonts.length; i++) {
                var font = fonts[i];
                var label = i == 0 ? dialog.getLocalizedLabelText("FontNameComboBox", "systemFontName") : font;
                dialog.fontSelect.appendChild(JSComponentView.createOptionElement(font, label));
              }
              setFontFromController();
            });
          controller.addPropertyChangeListener("FONT_NAME", setFontFromController);
  
          dialog.registerEventListener(dialog.fontSelect, "change", function(ev) {
              var selectedValue = dialog.fontSelect.querySelector("option:checked").value;
              controller.setFontName(selectedValue == DEFAULT_SYSTEM_FONT_NAME ? null : selectedValue);
            });
  
          dialog.textSizeLabel = dialog.getElement("text-size-label");
          dialog.textSizeLabel.textContent = dialog.getLocalizedLabelText(
            "LabelPanel", "fontSizeLabel.text", dialog.preferences.getLengthUnit().getName());
          
          dialog.textSizeInput = new JSSpinner(preferences, dialog.getElement("text-size-input"), 
              {
                nullable: controller.getFontSize() == null,
                format: preferences.getLengthUnit().getFormat(),
                value: controller.getFontSize(),
                min: 5,
                max: 999,
                step: dialog.getLengthInputStepSize()
              });
          
          dialog.colorSelector = new JSColorSelectorButton(preferences);
          dialog.attachChildComponent("color-selector-button", dialog.colorSelector)
          dialog.colorSelector.set(controller.getColor());
          
          var pitchEnabled = controller.isPitchEnabled() && controller.getPitch() != null;
          dialog.visibleIn3DCheckbox = dialog.getElement("visible-in-3D-checkbox");        
          dialog.visibleIn3DCheckbox.checked = pitchEnabled;
          
          dialog.pitchRadios = dialog.getRootNode().querySelectorAll("[name='label-pitch-radio']");
          if (pitchEnabled) {
            var selectedPitch = controller.getPitch();
            if (selectedPitch != 0) {
              selectedPitch = 90;
            }
            var selectedPitchRadio = dialog.findElement("[name='label-pitch-radio'][value='" + selectedPitch + "']");
            selectedPitchRadio.checked = true;
          }
  
          dialog.elevationLabel = dialog.getElement("elevation-label");
          dialog.elevationLabel.textContent = dialog.getLocalizedLabelText(
              "LabelPanel", "elevationLabel.text", dialog.preferences.getLengthUnit().getName());
          dialog.elevationInput = new JSSpinner(preferences, dialog.getElement("elevation-input"), 
              {
                nullable: controller.getElevation() == null,
                format: preferences.getLengthUnit().getFormat(),
                value: controller.getElevation(),
                min: 0,
                max: preferences.getLengthUnit().getMaximumElevation(),
                step: dialog.getLengthInputStepSize()
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
            var pitch90Selected = dialog.findElement("[name='label-pitch-radio'][value='90']:checked") != null;
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
      });
}

/**
 * @param {UserPreferences} preferences
 * @param {CompassController} controller
 * @return {JSCompassDialogView}
 */
JSViewFactory.prototype.createCompassView = function(preferences, controller) {
  function JSCompassDialogView() {
    this.controller = controller;

    JSDialogView.call(this, preferences,
        "@{CompassPanel.compass.title}",
        document.getElementById("compass-dialog-template"),
        {
          size: "medium",
          initializer: function (dialog) {
            dialog.initRosePanel();
            dialog.initGeographicLocationPanel();
          },
          applier: function(dialog) {
            dialog.controller.modifyCompass();
          }
        });
  }
  JSCompassDialogView.prototype = Object.create(JSDialogView.prototype);
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
          min: -maximumLength,
          max: maximumLength,
          step: this.getLengthInputStepSize()
        });
    var yLabel = this.getElement("y-label");
    var yInput = new JSSpinner(this.preferences, this.getElement("y-input"), 
        {
          format: preferences.getLengthUnit().getFormat(),
          min: -maximumLength,
          max: maximumLength,
          step: this.getLengthInputStepSize()
        });
    var diameterLabel = this.getElement("diameter-label");
    var diameterInput = new JSSpinner(this.preferences, this.getElement("diameter-input"), 
        {
          format: preferences.getLengthUnit().getFormat(),
          min: preferences.getLengthUnit().getMinimumLength(),
          max: preferences.getLengthUnit().getMaximumLength() / 10,
          step: this.getLengthInputStepSize()
        });

    // Set values
    xInput.value = controller.getX();
    yInput.value = controller.getY();
    diameterInput.value = controller.getDiameter();

    // Set labels
    var unitName = this.preferences.getLengthUnit().getName();
    xLabel.textContent = this.getLocalizedLabelText("CompassPanel", "xLabel.text", unitName);
    yLabel.textContent = this.getLocalizedLabelText("CompassPanel", "yLabel.text", unitName);
    diameterLabel.textContent = this.getLocalizedLabelText("CompassPanel", "diameterLabel.text", unitName);

    // Add property listeners
    var controller = this.controller;
    this.controller.addPropertyChangeListener("X", function (ev) {
        xInput.value = controller.getX();
      });
    this.controller.addPropertyChangeListener("Y", function (ev) {
        yInput.value = controller.getY();
      });
    this.controller.addPropertyChangeListener("DIAMETER", function (ev) {
        diameterInput.value = controller.getDiameter();
      });

    // Add change listeners
    this.registerEventListener([xInput, yInput, diameterInput], "input",
        function (ev) {
          controller.setX(xInput.value != null && xInput.value != "" ? parseFloat(xInput.value) : null);
          controller.setY(yInput.value != null && yInput.value != "" ? parseFloat(yInput.value) : null);
          controller.setDiameter(diameterInput.value != null && diameterInput.value != "" ? parseFloat(diameterInput.value) : null);
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
          min: -90,
          max: 90,
          step: 5
        });
    var longitudeInput = new JSSpinner(this.preferences, this.getElement("longitude-input"), 
        {
          format: new DecimalFormat("E ##0.000;W ##0.000"),
          min: -180,
          max: 180,
          step: 5
        });
    var northDirectionInput = new JSSpinner(this.preferences, this.getElement("north-direction-input"), 
        {
          format: new IntegerFormat(),
          min: 0,
          max: 360,
          step: 5
        });
    northDirectionInput.getRootNode().style.width = "3em";
    northDirectionInput.style.verticalAlign = "super";

    // Set values
    latitudeInput.value = controller.getLatitudeInDegrees();
    longitudeInput.value = controller.getLongitudeInDegrees();
    northDirectionInput.value = controller.getNorthDirectionInDegrees();

    // Add property listeners
    controller.addPropertyChangeListener("LATITUDE_IN_DEGREES", function (ev) {
        latitudeInput.value = controller.getLatitudeInDegrees();
      });
    controller.addPropertyChangeListener("LONGITUDE_IN_DEGREES", function (ev) {
        longitudeInput.value = controller.getLongitudeInDegrees();
      });
    controller.addPropertyChangeListener("NORTH_DIRECTION_IN_DEGREES", function (ev) {
        northDirectionInput.value = controller.getNorthDirectionInDegrees();
      });

    // Add change listeners
    this.registerEventListener([latitudeInput, longitudeInput, northDirectionInput], "input",
        function (ev) {
          controller.setLatitudeInDegrees(latitudeInput.value != null && latitudeInput.value != "" ? parseFloat(latitudeInput.value) : null);
          controller.setLongitudeInDegrees(longitudeInput.value != null && longitudeInput.value != "" ? parseFloat(longitudeInput.value) : null);
          controller.setNorthDirectionInDegrees(northDirectionInput.value != null && northDirectionInput.value != "" ? parseFloat(northDirectionInput.value) : null);
          updateOverview();
        }
    );

    var compassOverviewCanvas = this.getElement("compass-overview");
    compassOverviewCanvas.width = 140;
    compassOverviewCanvas.height = 140;
    compassOverviewCanvas.style.verticalAlign = "middle";

    compassOverviewCanvas.style.width = "35px";

    var compassOverviewCanvasContext = compassOverviewCanvas.getContext("2d");
    var canvasGraphics = new Graphics2D(compassOverviewCanvas);

    var updateOverview = function () {
      canvasGraphics.clear();
      var previousTransform = canvasGraphics.getTransform();
      canvasGraphics.translate(70, 70);
      canvasGraphics.scale(100, 100);

      canvasGraphics.setColor("#000000");
      canvasGraphics.fill(PlanComponent.COMPASS);
      canvasGraphics.setTransform(previousTransform);

      if (controller.getNorthDirectionInDegrees() == 0 || controller.getNorthDirectionInDegrees() == null) {
        compassOverviewCanvas.style.transform = "";
      } else {
        compassOverviewCanvas.style.transform = "rotate(" + controller.getNorthDirectionInDegrees() + "deg)";
      }
    }
    updateOverview();
  };

  return new JSCompassDialogView();
}

JSViewFactory.prototype.createObserverCameraView = function(preferences, controller) {
  function JSObserverCameraDialogView() {
    this.controller = controller;

    JSDialogView.call(this, preferences,
        "@{ObserverCameraPanel.observerCamera.title}",
        document.getElementById("observer-camera-dialog-template"),
        {
          initializer: function (dialog) {
            dialog.initLocationPanel();
            dialog.initAnglesPanel();

            var adjustObserverCameraElevationCheckBox = dialog.getElement("adjust-observer-camera-elevation-checkbox");
            adjustObserverCameraElevationCheckBox.checked = controller.isElevationAdjusted();
            var adjustObserverCameraElevationCheckBoxDisplay = controller.isObserverCameraElevationAdjustedEditable() ? "initial" : "none";
            adjustObserverCameraElevationCheckBox.parentElement.style.display = adjustObserverCameraElevationCheckBoxDisplay;
            dialog.registerEventListener(adjustObserverCameraElevationCheckBox, "change", function(ev) {
                controller.setElevationAdjusted(adjustObserverCameraElevationCheckBox.checked);
              });
            controller.addPropertyChangeListener("OBSERVER_CAMERA_ELEVATION_ADJUSTED", function(ev) {
                adjustObserverCameraElevationCheckBox.checked = controller.isElevationAdjusted();
              });
          },
          applier: function(dialog) {
            dialog.controller.modifyObserverCamera();
          }
        });
  }
  JSObserverCameraDialogView.prototype = Object.create(JSDialogView.prototype);
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
          step: this.getLengthInputStepSize(),
          min: -maximumLength,
          max: maximumLength,
        });
    var yLabel = this.getElement("y-label");
    var yInput = new JSSpinner(this.preferences, this.getElement("y-input"), 
        {
          nullable: this.controller.getY() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          step: this.getLengthInputStepSize(),
          min: -maximumLength,
          max: maximumLength,
        });
    var elevationLabel = this.getElement("elevation-label");
    var elevationInput = new JSSpinner(this.preferences, this.getElement("elevation-input"), 
        {
          nullable: this.controller.getElevation() == null,
          format: this.preferences.getLengthUnit().getFormat(),
          step: this.getLengthInputStepSize(),
          min: this.controller.getMinimumElevation(),
          max: this.preferences.getLengthUnit().getMaximumElevation()
        });

    // set values
    xInput.value = this.controller.getX();
    yInput.value = this.controller.getY();
    elevationInput.value = this.controller.getElevation();

    // set labels
    var unitName = this.preferences.getLengthUnit().getName();
    xLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "xLabel.text", unitName);
    yLabel.textContent = this.getLocalizedLabelText("HomeFurniturePanel", "yLabel.text", unitName);
    elevationLabel.textContent = this.getLocalizedLabelText("ObserverCameraPanel", "elevationLabel.text", unitName);

    // add property listeners
    var controller = this.controller;
    this.controller.addPropertyChangeListener("X", function (ev) {
        xInput.value = controller.getX();
      });
    this.controller.addPropertyChangeListener("Y", function (ev) {
        yInput.value = controller.getY();
      });
    this.controller.addPropertyChangeListener("ELEVATION", function (ev) {
        elevationInput.value = controller.getElevation();
      });

    // add change listeners
    this.registerEventListener([xInput, yInput, elevationInput], "input",
        function (ev) {
          controller.setX(xInput.value != null && xInput.value != "" ? parseFloat(xInput.value) : null);
          controller.setY(yInput.value != null && yInput.value != "" ? parseFloat(yInput.value) : null);
          controller.setElevation(elevationInput.value != null && elevationInput.value != "" ? parseFloat(elevationInput.value) : null);
        });
  };

  /**
   * @private
   */
  JSObserverCameraDialogView.prototype.initAnglesPanel = function() {
    var angleDecimalFormat = new DecimalFormat();
    angleDecimalFormat.maximumFractionDigits = 1;

    var yawInput = new JSSpinner(this.preferences, this.getElement("yaw-input"), 
        {
          format: angleDecimalFormat,
          step: 5,
          min: -10000,
          max: 10000,
          value: Math.toDegrees(this.controller.getYaw())
        });
    var pitchInput = new JSSpinner(this.preferences, this.getElement("pitch-input"), 
        {
          format: angleDecimalFormat,
          step: 5,
          min: -90,
          max: 90,
          value: Math.toDegrees(this.controller.getPitch())
        });
    var fieldOfViewInput = new JSSpinner(this.preferences, this.getElement("field-of-view-input"), 
        {
          nullable: this.controller.getFieldOfView() == null,
          format: angleDecimalFormat,
          step: 1,
          min: 2,
          max: 120,
          value: Math.toDegrees(this.controller.getFieldOfView())
        });

    // add property listeners
    var controller = this.controller;
    this.controller.addPropertyChangeListener("YAW", function (ev) {
      yawInput.value = Math.toDegrees(this.controller.getYaw());
    });
    this.controller.addPropertyChangeListener("PITCH", function (ev) {
      pitchInput.value = Math.toDegrees(this.controller.getPitch());
    });
    this.controller.addPropertyChangeListener("FIELD_OF_VIEW", function (ev) {
      fieldOfViewInput.value = Math.toDegrees(this.controller.getFieldOfView());
    });

    // add change listeners
    this.registerEventListener(
        [yawInput, pitchInput, fieldOfViewInput],
        "input",
        function () {
          controller.setYaw(yawInput.value != null && yawInput.value != "" ? Math.toRadians(parseFloat(yawInput.value)) : null);
          controller.setPitch(pitchInput.value != null && pitchInput.value != "" ? Math.toRadians(parseFloat(pitchInput.value)) : null);
          controller.setFieldOfView(fieldOfViewInput.value != null && fieldOfViewInput.value != "" ? Math.toRadians(parseFloat(fieldOfViewInput.value)) : null);
        }
    );
  };

  return new JSObserverCameraDialogView();
}

JSViewFactory.prototype.createHome3DAttributesView = function(preferences, controller) {
  function JSHome3DAttributesDialogView() {
    this.controller = controller;

    JSDialogView.call(this, preferences,
        "@{Home3DAttributesPanel.home3DAttributes.title}",
        document.getElementById("home-3Dattributes-dialog-template"),
        {
          size: "small",
          initializer: function (dialog) {
            dialog.initGroundPanel();
            dialog.initSkyPanel();
            dialog.initRenderingPanel();
          },
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
  }
  JSHome3DAttributesDialogView.prototype = Object.create(JSDialogView.prototype);
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
          colorSelected: function(selectedColor) {
            paintRadioColor.checked = true;
            controller.setGroundPaint(Home3DAttributesController.EnvironmentPaint.COLORED);
            controller.setGroundColor(selectedColor);
          }
        });
    dialog.attachChildComponent("ground-color-selector-button", colorSelector)
    colorSelector.set(controller.getGroundColor());

    var paintRadioTexture = dialog.findElement("[name='ground-color-and-texture-choice'][value='TEXTURED']");
    var textureSelector = controller.getGroundTextureController().getView();
    textureSelector.onTextureSelected = function(texture) {
        paintRadioTexture.checked = true;
        controller.setGroundPaint(Home3DAttributesController.EnvironmentPaint.TEXTURED);
        controller.getGroundTextureController().setTexture(texture);
      };
    dialog.attachChildComponent("ground-texture-selector-button", textureSelector);
    textureSelector.set(controller.getGroundTextureController().getTexture());

    var radioButtons = [paintRadioColor, paintRadioTexture];
    dialog.registerEventListener(radioButtons, "change", function(ev) {
        if (this.checked) {
          controller.setGroundPaint(Home3DAttributesController.EnvironmentPaint[this.value]);
        }
      });

    var setPaintFromController = function() {
        paintRadioColor.checked = controller.getGroundPaint() == Home3DAttributesController.EnvironmentPaint.COLORED;
        paintRadioTexture.checked = controller.getGroundPaint() == Home3DAttributesController.EnvironmentPaint.TEXTURED;
      };
    setPaintFromController();
    controller.addPropertyChangeListener("GROUND_PAINT", setPaintFromController);
    controller.addPropertyChangeListener("GROUND_COLOR", function(ev) {
        colorSelector.set(controller.getGroundColor());
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
          colorSelected: function(selectedColor) {
            paintRadioColor.checked = true;
    
            controller.setSkyPaint(Home3DAttributesController.EnvironmentPaint.COLORED);
            controller.setSkyColor(selectedColor);
          }
        });
    dialog.attachChildComponent("sky-color-selector-button", colorSelector)
    colorSelector.set(controller.getSkyColor());

    var paintRadioTexture = dialog.findElement("[name='sky-color-and-texture-choice'][value='TEXTURED']");
    var textureSelector = controller.getSkyTextureController().getView();
    textureSelector.onTextureSelected = function(texture) {
      paintRadioTexture.checked = true;
      controller.setSkyPaint(Home3DAttributesController.EnvironmentPaint.TEXTURED);
      controller.getSkyTextureController().setTexture(texture);
    };
    dialog.attachChildComponent("sky-texture-selector-button", textureSelector);
    textureSelector.set(controller.getSkyTextureController().getTexture());

    var radioButtons = [paintRadioColor, paintRadioTexture];
    dialog.registerEventListener(radioButtons, "change", function(ev) {
        if (this.checked) {
          controller.setSkyPaint(Home3DAttributesController.EnvironmentPaint[this.value]);
        }
      });

    function setPaintFromController() {
        paintRadioColor.checked = controller.getSkyPaint() == Home3DAttributesController.EnvironmentPaint.COLORED;
        paintRadioTexture.checked = controller.getSkyPaint() == Home3DAttributesController.EnvironmentPaint.TEXTURED;
      };
    setPaintFromController();
    controller.addPropertyChangeListener("SKY_PAINT", setPaintFromController);
    controller.addPropertyChangeListener("SKY_COLOR", function() {
      colorSelector.set(controller.getSkyColor());
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
        var brightness = this.value;
        controller.setLightColor((brightness << 16) + (brightness << 8) + brightness);
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
 * @param {{ onTextureSelected: function(HomeTexture) }} [options]
 *   > onTextureSelected: called with selected texture, when selection changed
 * @return {JSComponentView} 
 */
JSViewFactory.prototype.createTextureChoiceView = function(preferences, textureChoiceController, options) {
  return new JSTextureSelectorButton(preferences, textureChoiceController, null, options);
}

JSViewFactory.prototype.createBaseboardChoiceView = function(preferences, controller) {
  var view = new JSComponentView(preferences,
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
        initializer: function(view) {
          view.getRootNode().dataset["name"] = "baseboard-panel";
          view.getRootNode().classList.add("label-input-grid");
    
          // VISIBLE
          view.visibleCheckBox = view.getElement("baseboard-visible-checkbox");
          view.visibleCheckBox.checked = controller.getVisible();
          view.registerEventListener(view.visibleCheckBox, "change", function() {
            controller.setVisible(view.visibleCheckBox.checked);
          });
    
          var onVisibleChanged = function() {
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
          controller.addPropertyChangeListener("VISIBLE", function(ev) {
              onVisibleChanged();
            });
    
          // PAINT
          var paintRadioSameAsWall = view.findElement("[name='baseboard-color-and-texture-choice'][value='sameColorAsWall']");
    
          var paintRadioColor = view.findElement("[name='baseboard-color-and-texture-choice'][value='COLORED']");
          view.colorSelector = new JSColorSelectorButton(preferences, null,
              {
                colorSelected: function(selectedColor) {
                  paintRadioColor.checked = true;
                  controller.setPaint(BaseboardChoiceController.BaseboardPaint.COLORED);
                  controller.setColor(selectedColor);
                }
              });
          view.attachChildComponent("baseboard-color-selector-button", view.colorSelector)
          view.colorSelector.set(controller.getColor());
    
          var paintRadioTexture = view.findElement("[name='baseboard-color-and-texture-choice'][value='TEXTURED']");
          view.textureSelector = controller.getTextureController().getView();
          view.textureSelector.onTextureSelected = function(texture) {
            paintRadioTexture.checked = true;
            controller.setPaint(BaseboardChoiceController.BaseboardPaint.TEXTURED);
            controller.getTextureController().setTexture(texture);
          };
          view.attachChildComponent("baseboard-texture-selector-button", view.textureSelector);
          view.textureSelector.set(controller.getTextureController().getTexture());
    
          view.colorAndTextureRadioButtons = [paintRadioSameAsWall, paintRadioColor, paintRadioTexture];
          view.registerEventListener(view.colorAndTextureRadioButtons, "change", function() {
            if (this.checked) {
              var selectedPaint = this.value == "sameColorAsWall"
                  ? BaseboardChoiceController.BaseboardPaint.DEFAULT
                  : BaseboardChoiceController.BaseboardPaint[this.value];
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
    
          // height & thickness
          var unitName = preferences.getLengthUnit().getName();
          view.getElement("height-label").textContent = this.getLocalizedLabelText("BaseboardChoiceComponent", "heightLabel.text", unitName);
          view.getElement("thickness-label").textContent = this.getLocalizedLabelText("BaseboardChoiceComponent", "thicknessLabel.text", unitName);
    
          var minimumLength = preferences.getLengthUnit().getMinimumLength();
          view.heightInput = new JSSpinner(this.preferences, this.getElement("height-input"), 
              {
                nullable: controller.getHeight() == null,
                format: preferences.getLengthUnit().getFormat(),
                min: minimumLength,
                max: controller.getMaxHeight() == null
                    ? preferences.getLengthUnit().getMaximumLength() / 10
                    : controller.getMaxHeight(),
                value: controller.getHeight() != null && controller.getMaxHeight() != null
                    ? Math.min(controller.getHeight(), controller.getMaxHeight())
                    : controller.getHeight(),
                step: view.getLengthInputStepSize()
              });
          view.thicknessInput = new JSSpinner(this.preferences, this.getElement("thickness-input"), 
              {
                nullable: controller.getThickness() == null,
                format: preferences.getLengthUnit().getFormat(),
                min: minimumLength,
                max: 2,
                value: controller.getThickness(),
                step: view.getLengthInputStepSize()
              });
    
          controller.addPropertyChangeListener("HEIGHT", function(ev) {
              view.heightInput.value = ev.getNewValue();
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
              view.thicknessInput.value = ev.getNewValue();
            });
    
          view.registerEventListener(view.heightInput, "input", function() {
              controller.setHeight(view.heightInput.value);
            });
          view.registerEventListener(view.thicknessInput, "input", function() {
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
