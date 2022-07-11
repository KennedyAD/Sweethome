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
 * @author Louis Grignon 
 */
function JSViewFactory(application) {
  this.application = application;
}
JSViewFactory.prototype = Object.create(JSViewFactory.prototype);
JSViewFactory.prototype.constructor = JSViewFactory;

JSViewFactory["__class"] = "JSViewFactory";
JSViewFactory["__interfaces"] = ["com.eteks.sweethome3d.viewcontroller.ViewFactory"];


JSViewFactory.dummyDialogView = {
  displayView: function(parent) { 
    // Do nothing
  }
}

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
  return new JSWizardDialog(preferences, controller,  
      controller.getTitle() || "@{WizardPane.wizard.title}", 
      {
      });
}

JSViewFactory.prototype.createBackgroundImageWizardStepsView = function(backgroundImage, preferences, controller) {
  var LARGE_IMAGE_PIXEL_COUNT_THRESHOLD = 10000000;
  var LARGE_IMAGE_MAX_PIXEL_COUNT = 8000000;
  var CANVAS_TOUCHABLE_AREA_RADIUS = 10;

  function BackgroundImageWizardStepsView() {
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
        '    <div class="preview-controls" style="z-index:5">' +
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
        '    <div class="preview-controls" style="z-index:5">' +
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
    this.registerPropertyChangeListener(controller, "STEP", function(ev) {
        component.updateStep();
        component.repaintOriginCanvas();
      });
    this.registerPropertyChangeListener(controller, "IMAGE", function(ev) {
        component.updatePreviewComponentsImage();
      });

    this.updateImage(backgroundImage);
  }
  BackgroundImageWizardStepsView.prototype = Object.create(JSComponent.prototype);
  BackgroundImageWizardStepsView.prototype.constructor = BackgroundImageWizardStepsView;
  
  BackgroundImageWizardStepsView.prototype.buildHtmlFromTemplate = function(templateHtml) {
    return JSComponent.prototype.buildHtmlFromTemplate.call(this, templateHtml).replace(/\<br\>/g, " ");
  }

  /**
   * @private
   */
  BackgroundImageWizardStepsView.prototype.initImageChoiceStep = function () {
    var component = this;
    component.imageChoiceStep = {
        panel: component.findElement("[choiceStep]"),
        imageChoiceOrChangeLabel: component.findElement("[choiceStep] [description]"),
        imageChoiceOrChangeButton: component.findElement("[choiceStep] [selectImage]"),
        imageChooser: component.findElement("[choiceStep] input[type='file']"),
        preview: component.findElement("[choiceStep] [preview] img"),
      };
    var imageErrorListener = function(error) {
        console.warn("Error loading image: " + error);
        component.controller.setImage(null);
        component.setImageChoiceTexts();
        component.updatePreviewComponentsImage();
        alert(ResourceAction.getLocalizedLabelText(preferences, "BackgroundImageWizardStepsPanel",
            "imageChoiceErrorLabel.text"));
      };
    component.registerEventListener(component.imageChoiceStep.imageChoiceOrChangeButton, "click", function(ev) {
        component.imageChoiceStep.imageChooser.click();
      });
    component.registerEventListener(component.imageChoiceStep.imageChooser, "input", function(ev) {
        var file = this.files[0];
        if (file) {
          var reader = new FileReader();
          reader.addEventListener("load", function(ev) {
              var image = new Image();
              image.addEventListener("load", function(ev) {
                  component.updateController(image, file);
                });
              image.addEventListener("error", imageErrorListener);
              image.src = ev.target.result;
            });
          reader.addEventListener("error", imageErrorListener);
          reader.readAsDataURL(file);
        }
      });
  }

  /**
   * @private
   */
  BackgroundImageWizardStepsView.prototype.initScaleStep = function () {
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
    var scaleDistanceChangeListener = function() {
        var scaleDistance = controller.getScaleDistance();
        component.scaleStep.scaleDistanceInput.setNullable(scaleDistance === null);
        component.scaleStep.scaleDistanceInput.setValue(scaleDistance);
      };
    scaleDistanceChangeListener();
    this.registerPropertyChangeListener(controller, "SCALE_DISTANCE", scaleDistanceChangeListener);

    var zoomInButtonAction = new ResourceAction(preferences, "BackgroundImageWizardStepsPanel", "ZOOM_IN", true);
    var zoomOutButtonAction = new ResourceAction(preferences, "BackgroundImageWizardStepsPanel", "ZOOM_OUT", true);
    component.scaleStep.previewZoomIn.style.backgroundImage = "url('" + zoomInButtonAction.getURL(AbstractAction.SMALL_ICON) + "')";
    component.registerEventListener(component.scaleStep.previewZoomIn, "click", function(ev) {
        component.scaleStep.preview.width *= 2;
        component.repaintScaleCanvas();
      });
    component.scaleStep.previewZoomOut.style.backgroundImage = "url('" + zoomOutButtonAction.getURL(AbstractAction.SMALL_ICON) + "')";
    component.registerEventListener(component.scaleStep.previewZoomOut, "click", function(ev) {
        component.scaleStep.preview.width /= 2;
        component.repaintScaleCanvas();
      });
    this.registerPropertyChangeListener(controller, "SCALE_DISTANCE_POINTS", function() {
        component.repaintScaleCanvas();
      });

    component.repaintScaleCanvas();

    var canvas = this.scaleStep.preview;
    canvas.style.touchAction = "none";

    var mouseUp = function(ev) {
        if (canvas.dragging) {
          canvas.dragging = false;
          canvas.distanceStartPoint = canvas.distanceEndPoint = false;
        }
      };
    var mouseMove = function(ev) {
        ev.stopImmediatePropagation();
  
        var canvasRect = canvas.getBoundingClientRect();
        var pointerCoordinatesObject = ev.touches && ev.touches.length > 0 ? ev.touches[0] : ev;
        var x = pointerCoordinatesObject.clientX - canvasRect.left;
        var y = pointerCoordinatesObject.clientY - canvasRect.top;
  
        if (canvas.dragging) {
          var scale = canvas.width / component.selectedImage.width;
          var newX = x / scale;
          var newY = y / scale;
          var scaleDistancePoints = controller.getScaleDistancePoints();
          var updatedPoint;
          var fixedPoint;
          if (canvas.distanceStartPoint) {
            updatedPoint = scaleDistancePoints [0];
            fixedPoint   = scaleDistancePoints [1];
          } else {
            updatedPoint = scaleDistancePoints [1];
            fixedPoint   = scaleDistancePoints [0];
          }
          // Accept new points only if distance is greater that 2 pixels
          if (java.awt.geom.Point2D.distanceSq(fixedPoint [0] * scale, fixedPoint [1] * scale,
                  newX * scale, newY * scale) >= 4) {
            // If shift is down constrain keep the line vertical or horizontal
            if (ev.shiftKey) {
              var angle = Math.abs(Math.atan2(fixedPoint [1] - newY, newX - fixedPoint [0]));
              if (angle > Math.PI / 4 && angle <= 3 * Math.PI / 4) {
                newX = fixedPoint [0];
              } else {
                newY = fixedPoint [1];
              }
            }
            updatedPoint [0] = newX;
            updatedPoint [1] = newY;
            controller.setScaleDistancePoints(
              scaleDistancePoints[0][0], scaleDistancePoints[0][1],
              scaleDistancePoints[1][0], scaleDistancePoints[1][1]);
            component.repaintScaleCanvas();
          }
        } else {
          canvas.distanceStartPoint = 
          canvas.distanceEndPoint = false;
          
          var scaleDistancePoints = controller.getScaleDistancePoints();
          var scale = canvas.width / component.selectedImage.width;
          // Check if user clicked on start or end point of distance line
          if (Math.abs(scaleDistancePoints [0][0] * scale - x) <= CANVAS_TOUCHABLE_AREA_RADIUS
              && Math.abs(scaleDistancePoints [0][1] * scale - y) <= CANVAS_TOUCHABLE_AREA_RADIUS) {
            canvas.distanceStartPoint = true;
          } else if (Math.abs(scaleDistancePoints [1][0] * scale - x) <= CANVAS_TOUCHABLE_AREA_RADIUS
                     && Math.abs(scaleDistancePoints [1][1] * scale - y) <= CANVAS_TOUCHABLE_AREA_RADIUS) {
            canvas.distanceEndPoint = true;
          }
          
          if (canvas.distanceStartPoint || canvas.distanceEndPoint) {
            canvas.style.cursor = "crosshair";
          } else {
            canvas.style.cursor = "default";
          }
        }
      };
    var mouseDown = function(ev) {
        ev.stopImmediatePropagation();
        mouseMove(ev);
  
        if (canvas.distanceStartPoint || canvas.distanceEndPoint) {
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
  BackgroundImageWizardStepsView.prototype.repaintScaleCanvas = function () {
    var canvas = this.scaleStep.preview;
    var g2D = new Graphics2D(canvas);
    g2D.fillRect(0, 0, canvas.width, canvas.height);
    var image = this.selectedImage;
    if (image) {
      canvas.height = (image.height / image.width) * canvas.width;
      g2D.drawImageWithSize(image, 0, 0, canvas.width, canvas.height);
      g2D.setColor("blue");
      var oldTransform = g2D.getTransform();
      var scale = canvas.width / image.width;
      g2D.scale(scale, scale);
      // Draw a scale distance line
      g2D.setStroke(new java.awt.BasicStroke(5 / scale,
          java.awt.BasicStroke.CAP_BUTT, java.awt.BasicStroke.JOIN_BEVEL));
      var scaleDistancePoints = this.controller.getScaleDistancePoints();
      g2D.draw(new java.awt.geom.Line2D.Float(scaleDistancePoints [0][0], scaleDistancePoints [0][1],
                                              scaleDistancePoints [1][0], scaleDistancePoints [1][1]));
      // Draw start point line
      g2D.setStroke(new java.awt.BasicStroke(1 / scale,
          java.awt.BasicStroke.CAP_BUTT, java.awt.BasicStroke.JOIN_BEVEL));
      var angle = Math.atan2(scaleDistancePoints [1][1] - scaleDistancePoints [0][1],
                             scaleDistancePoints [1][0] - scaleDistancePoints [0][0]);
      var oldTransform2 = g2D.getTransform();
      g2D.translate(scaleDistancePoints [0][0], scaleDistancePoints [0][1]);
      g2D.rotate(angle);
      var endLine = new java.awt.geom.Line2D.Double(0, 5 / scale, 0, -5 / scale);
      g2D.draw(endLine);
      g2D.setTransform(oldTransform2);

      // Draw end point line
      g2D.translate(scaleDistancePoints [1][0], scaleDistancePoints [1][1]);
      g2D.rotate(angle);
      g2D.draw(endLine);
      g2D.setTransform(oldTransform);
    }
  }

  /**
   * @private
   */
  BackgroundImageWizardStepsView.prototype.initOriginStep = function () {
    var component = this;
    var unitName = preferences.getLengthUnit().getName();
    var maximumLength = preferences.getLengthUnit().getMaximumLength();

    this.originStep = {
      panel: this.findElement("[originStep]"),
      preview: this.findElement("[originStep] [preview] canvas"),
      previewZoomIn: this.findElement("[originStep] [previewZoomIn]"),
      previewZoomOut: this.findElement("[originStep] [previewZoomOut]"),
      xOriginLabel: this.getElement("x-origin-label"),
      xOriginInput: new JSSpinner(preferences, this.getElement("x-origin-input"), 
          {
            format: preferences.getLengthUnit().getFormat(),
            value: controller.getXOrigin(),
            minimum: -maximumLength,
            maximum: maximumLength,
            stepSize: preferences.getLengthUnit().getStepSize()
          }),
      yOriginLabel: this.getElement("y-origin-label"),
      yOriginInput: new JSSpinner(preferences, this.getElement("y-origin-input"), 
          {
            format: preferences.getLengthUnit().getFormat(),
            value: controller.getYOrigin(),
            minimum: -maximumLength,
            maximum: maximumLength,
            stepSize: preferences.getLengthUnit().getStepSize()
          }),
    };

    this.originStep.xOriginLabel.textContent = this.getLocalizedLabelText(
        "BackgroundImageWizardStepsPanel", "xOriginLabel.text", unitName);
    this.originStep.yOriginLabel.textContent = this.getLocalizedLabelText(
        "BackgroundImageWizardStepsPanel", "yOriginLabel.text", unitName);
    this.registerEventListener([this.originStep.xOriginInput, this.originStep.yOriginInput], "input", function(ev) {
        controller.setOrigin(component.originStep.xOriginInput.getValue(), component.originStep.yOriginInput.getValue());
      });
    this.registerPropertyChangeListener(controller, "X_ORIGIN", function() {
        component.originStep.xOriginInput.setValue(controller.getXOrigin());
        component.repaintOriginCanvas();
      });
    this.registerPropertyChangeListener(controller, "Y_ORIGIN", function() {
        component.originStep.yOriginInput.setValue(controller.getYOrigin());
        component.repaintOriginCanvas();
      });

    var canvas = this.originStep.preview;

    var zoomInButtonAction = new ResourceAction(preferences, "BackgroundImageWizardStepsPanel", "ZOOM_IN", true);
    var zoomOutButtonAction = new ResourceAction(preferences, "BackgroundImageWizardStepsPanel", "ZOOM_OUT", true);
    this.originStep.previewZoomIn.style.backgroundImage = "url('" + zoomInButtonAction.getURL(AbstractAction.SMALL_ICON) + "')";
    this.registerEventListener(this.originStep.previewZoomIn, "click", function(ev) {
        component.originStep.preview.width *= 2;
        component.repaintOriginCanvas();
      });
    this.originStep.previewZoomOut.style.backgroundImage = "url('" + zoomOutButtonAction.getURL(AbstractAction.SMALL_ICON) + "')";
    this.registerEventListener(this.originStep.previewZoomOut, "click", function(ev) {
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
          var scaleDistancePoints = controller.getScaleDistancePoints();
          var rescale = component.originStep.preview.width / component.selectedImage.width;
          rescale = rescale / BackgroundImage.getScale(controller.getScaleDistance(),
              scaleDistancePoints [0][0], scaleDistancePoints [0][1],
              scaleDistancePoints [1][0], scaleDistancePoints [1][1]);
          var xOrigin = Math.round((pointerCoordinatesObject.clientX - canvasRect.left) / rescale * 10) / 10;
          var yOrigin = Math.round((pointerCoordinatesObject.clientY - canvasRect.top) / rescale * 10) / 10;
          controller.setOrigin(xOrigin, yOrigin);
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
  BackgroundImageWizardStepsView.prototype.repaintOriginCanvas = function () {
    var canvas = this.originStep.preview;
    var g2D = new Graphics2D(canvas);
    g2D.fillRect(0, 0, canvas.width, canvas.height);
    var image = this.selectedImage;
    if (image) {
      canvas.height = (image.height / image.width) * canvas.width;
      g2D.drawImageWithSize(image, 0, 0, canvas.width, canvas.height);
      g2D.setColor("blue");
      var oldTransform = g2D.getTransform();
      var scale = canvas.width / image.width;
      var scaleDistancePoints = this.controller.getScaleDistancePoints();
      scale = scale / BackgroundImage.getScale(this.controller.getScaleDistance(),
          scaleDistancePoints [0][0], scaleDistancePoints [0][1],
          scaleDistancePoints [1][0], scaleDistancePoints [1][1]);
      g2D.scale(scale, scale);

      // Draw a dot at origin
      g2D.translate(this.controller.getXOrigin(), this.controller.getYOrigin());
      
      var originRadius = 4 / scale;
      g2D.fill(new java.awt.geom.Ellipse2D.Float(-originRadius, -originRadius,
          originRadius * 2, originRadius * 2));

      // Draw a cross
      g2D.setStroke(new java.awt.BasicStroke(1 / scale,
          java.awt.BasicStroke.CAP_BUTT, java.awt.BasicStroke.JOIN_BEVEL));
      g2D.draw(new java.awt.geom.Line2D.Double(8 / scale, 0, -8 / scale, 0));
      g2D.draw(new java.awt.geom.Line2D.Double(0, 8 / scale, 0, -8 / scale));
      g2D.setTransform(oldTransform);
    }
  }

  /**
   * Sets the texts of label and button of image choice panel with change texts.
   * @private
   */
  BackgroundImageWizardStepsView.prototype.setImageChangeTexts = function () {
    this.imageChoiceStep.imageChoiceOrChangeLabel.innerHTML = this.getLocalizedLabelText(
        "BackgroundImageWizardStepsPanel", "imageChangeLabel.text").replace(/\<br\>/g, " ");
    this.imageChoiceStep.imageChoiceOrChangeButton.innerHTML = this.getLocalizedLabelText(
        "BackgroundImageWizardStepsPanel", "imageChangeButton.text");
  }

  /**
   * Sets the texts of label and button of image choice panel with choice texts.
   * @private
   */
  BackgroundImageWizardStepsView.prototype.setImageChoiceTexts = function () {
    this.imageChoiceStep.imageChoiceOrChangeLabel.innerHTML = this.getLocalizedLabelText(
        "BackgroundImageWizardStepsPanel", "imageChoiceLabel.text").replace(/\<br\>/g, " ");
    this.imageChoiceStep.imageChoiceOrChangeButton.innerHTML = this.getLocalizedLabelText(
        "BackgroundImageWizardStepsPanel", "imageChoiceButton.text");
  }

  /**
   * @param {BackgroundImage} backgroundImage
   * @private
   */
  BackgroundImageWizardStepsView.prototype.updateImage = function(backgroundImage) {
    if (backgroundImage == null) {
      this.setImageChoiceTexts();
      this.updatePreviewComponentsImage();
    } else {
      this.setImageChangeTexts();

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
   * @param {File} file
   * @private
   */
  BackgroundImageWizardStepsView.prototype.updateController = function(image, file) {
    var view = this;
    var controller = this.controller;
    var imageType = ImageTools.isImageWithAlpha(image) ? "image/png" : "image/jpeg";
    this.checkImageSize(image, imageType, function(checkedImage) {
        var contentReady = function(content) {
            setTimeout(function() {
                controller.setImage(content);
                view.setImageChangeTexts();
                var referenceBackgroundImage = controller.getReferenceBackgroundImage();
                if (referenceBackgroundImage != null
                    && referenceBackgroundImage.getScaleDistanceXStart() < checkedImage.width
                    && referenceBackgroundImage.getScaleDistanceXEnd() < checkedImage.width
                    && referenceBackgroundImage.getScaleDistanceYStart() < checkedImage.height
                    && referenceBackgroundImage.getScaleDistanceYEnd() < checkedImage.height) {
                  // Initialize distance and origin with values of the reference checkedImage
                  controller.setScaleDistance(referenceBackgroundImage.getScaleDistance());
                  controller.setScaleDistancePoints(referenceBackgroundImage.getScaleDistanceXStart(),
                      referenceBackgroundImage.getScaleDistanceYStart(),
                      referenceBackgroundImage.getScaleDistanceXEnd(),
                      referenceBackgroundImage.getScaleDistanceYEnd());
                  controller.setOrigin(referenceBackgroundImage.getXOrigin(), referenceBackgroundImage.getYOrigin());
                } else {
                  // Initialize distance and origin with default values
                  controller.setScaleDistance(null);
                  var scaleDistanceXStart = checkedImage.width * 0.1;
                  var scaleDistanceYStart = checkedImage.height / 2;
                  var scaleDistanceXEnd = checkedImage.width * 0.9;
                  controller.setScaleDistancePoints(scaleDistanceXStart, scaleDistanceYStart,
                      scaleDistanceXEnd, scaleDistanceYStart);
                  controller.setOrigin(0, 0);
                }
              }, 100);
          };
        if (image === checkedImage
            && (file.type == "image/jpeg" 
               || file.type == "image/png")) {
          contentReady(new BlobURLContent(file));
        } else {
          BlobURLContent.fromImage(checkedImage, imageType, contentReady);
        }
      });
  }

  /**
   * @param {HTMLImageElement} image
   * @param {string} imageType can be "image/png" or "image/jpeg" depending on image alpha channel requirements
   * @param {function(HTMLImageElement)} imageReady function called after resize with resized image (or with original image if resize was not necessary or declined by user)
   * @private
   */
  BackgroundImageWizardStepsView.prototype.checkImageSize = function (image, imageType, imageReady) {
    if (image.width * image.height < LARGE_IMAGE_PIXEL_COUNT_THRESHOLD) {
      imageReady(image);
    } else {
      var stepsView = this;
      var factor = Math.sqrt(LARGE_IMAGE_MAX_PIXEL_COUNT / (image.width * image.height));
      var reducedWidth = Math.round(image.width * factor);
      var reducedHeight = Math.round(image.height * factor);
      var resizeImage = function() { 
          ImageTools.resize(image, reducedWidth, reducedHeight, imageReady, imageType);
        };
      if (this.getUserPreferences().isImportedImageResizedWithoutPrompting()) {
        resizeImage();
      } else {
        var promptDialog = new JSImageResizingDialog(preferences,
            "@{BackgroundImageWizardStepsPanel.reduceImageSize.title}",
            stepsView.getLocalizedLabelText(
                "BackgroundImageWizardStepsPanel", "reduceImageSize.message", [image.width, image.height, reducedWidth, reducedHeight]),
            "@{BackgroundImageWizardStepsPanel.reduceImageSize.cancel}",
            "@{BackgroundImageWizardStepsPanel.reduceImageSize.keepUnchanged}",
            "@{BackgroundImageWizardStepsPanel.reduceImageSize.reduceSize}",
            resizeImage, // Confirm image resizing
            function() { // Original image 
              imageReady(image); 
            });
        promptDialog.displayView();
      }
    }
  }

  /**
   * @private
   */
  BackgroundImageWizardStepsView.prototype.updatePreviewComponentsImage = function() {
    var component = this;
    var image = this.controller.getImage();

    delete this.imageChoiceStep.preview.src;
    this.imageChoiceStep.preview.width = 0;
    delete this.scaleStep.preview.src;
    delete this.originStep.preview.src;
    if (image != null) {
      TextureManager.getInstance().loadTexture(image, {
          textureUpdated: function(image) {
            component.imageChoiceStep.preview.src = image.src;
            component.imageChoiceStep.preview.width = image.width;
            component.selectedImage = image;
            if (image.width > 400) {
              component.scaleStep.preview.width = 400;
              component.originStep.preview.width = 400;
            }
    
            component.repaintScaleCanvas();
            component.repaintOriginCanvas();
          },
          textureError: function(error) {
            imageErrorListener(error);
          }
        });
    }
  }

  /**
   * Changes displayed view based on current step.
   */
  BackgroundImageWizardStepsView.prototype.updateStep = function() {
    var step = this.controller.getStep();
    switch (step) {
      case BackgroundImageWizardController.Step.CHOICE:
        this.imageChoiceStep.panel.style.display = "flex";
        this.scaleStep.panel.style.display = "none";
        this.originStep.panel.style.display = "none";
        break;
      case BackgroundImageWizardController.Step.SCALE:
        this.imageChoiceStep.panel.style.display = "none";
        this.scaleStep.panel.style.display = "flex";
        delete this.scaleStep.panel.style.display;
        this.originStep.panel.style.display = "none";
        break;
      case BackgroundImageWizardController.Step.ORIGIN:
        this.imageChoiceStep.panel.style.display = "none";
        this.scaleStep.panel.style.display = "none";
        this.originStep.panel.style.display = "flex";
        break;
    }
  };

  return new BackgroundImageWizardStepsView();
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
    this.registerPropertyChangeListener(controller, "STEP", function(ev) {
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
    this.imageChoiceOrChangeLabel = this.findElement("[imageStep] [description]");
    this.imageChoiceOrChangeButton = this.findElement("button[changeImage]");
    this.imageChooserInput = this.findElement("input[type='file']");
    this.previewPanel = this.findElement("[preview]");
  
    if (texture == null) {
      this.setImageChoiceTexts();
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
    var imageErrorListener = function(error) {
        console.warn("Error loading image: " + error);
        component.controller.setImage(null);
        component.setImageChoiceTexts();
        component.updatePreviewComponentsImage();
        alert(ResourceAction.getLocalizedLabelText(preferences, "ImportedTextureWizardStepsPanel",
            "imageChoiceErrorLabel.text"));
      };
    this.registerEventListener(this.imageChoiceOrChangeButton, "click", function(ev) {
        component.imageChooserInput.click();
      });  
    this.registerEventListener(this.imageChooserInput, "input", function(ev) {
        var file = component.imageChooserInput.files[0];
        if (file) {
          var reader = new FileReader();
          reader.addEventListener("load", function(ev) {
              var image = new Image();
              image.addEventListener("load", function(ev) {
                component.updateController(image, file);
              });
              image.addEventListener("error", imageErrorListener);
              image.src = ev.target.result;
            });
          reader.addEventListener("error", imageErrorListener);
          reader.readAsDataURL(file);
        }
      });
  
    this.registerPropertyChangeListener(controller, "IMAGE", function(ev) {
        component.updatePreviewComponentsImage();
      });
    this.registerPropertyChangeListener(controller, "WIDTH", function(ev) {
        component.updatePreviewComponentsImage();
      });
    this.registerPropertyChangeListener(controller, "HEIGHT", function(ev) {
        component.updatePreviewComponentsImage();
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
        "ImportedTextureWizardStepsPanel", "attributesLabel.text").replace(/\<br\>/g, " ");
    this.registerPropertyChangeListener(controller, "NAME", function() {
        if (component.nameInput.value.trim() != controller.getName()) {
          component.nameInput.value = controller.getName();
        }
      });
    this.registerEventListener(this.nameInput, "input", function(ev) {
        controller.setName(component.nameInput.value.trim());
      });
  
    this.registerPropertyChangeListener(controller, "CATEGORY", function(ev) {
        var category = controller.getCategory();
        if (category != null) {
          component.categorySelect.value = category.getName();
        }
      });
    this.registerEventListener(this.categorySelect, "change", function(ev) {
        var category = component.categorySelect.item(component.categorySelect.selectedIndex)._category;
        controller.setCategory(category);
      });
  
    this.registerPropertyChangeListener(controller, "CREATOR", function(ev) {
        if (component.creatorInput.value.trim() != controller.getCreator()) {
          component.creatorInput.value = controller.getCreator();
        }
      });
    this.registerEventListener(component.creatorInput, "input", function(ev) {
        controller.setCreator(component.creatorInput.value.trim());
      });
  
    this.registerPropertyChangeListener(controller, "WIDTH", function(ev) {
        component.widthInput.setValue(controller.getWidth());
      });
    this.registerEventListener(this.widthInput, "input", function(ev) {
        controller.setWidth(parseFloat(component.widthInput.value));
      });
  
    this.registerPropertyChangeListener(controller, "HEIGHT", function(ev) {
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
   * @param {File|CatalogTexture} file
   * @private
   */
  ImportedTextureWizardStepsView.prototype.updateController = function(image, file) {
    var component = this;
    var controller = this.controller;
    this.setImageChangeTexts();
    if (file instanceof CatalogTexture) {
      var catalogTexture = file;
      setTimeout(function() {
          controller.setImage(catalogTexture.getImage());
          controller.setName(catalogTexture.getName());
          controller.setCategory(catalogTexture.getCategory());
          controller.setCreator(catalogTexture.getCreator());
          controller.setWidth(catalogTexture.getWidth());
          controller.setHeight(catalogTexture.getHeight());
        }, 100);
    } else { 
      // File
      var textureName = "Texture";
      if (file.name.lastIndexOf('.') > 0) {
        var parts = file.name.split(/\/|\\|\./);
        if (parts.length > 1) {
          textureName = parts [parts.length - 2];
        }
      }
      var imageType = ImageTools.isImageWithAlpha(image) ? "image/png" : "image/jpeg";
      this.checkImageSize(image, imageType, function(checkedImage) {
          var contentReady = function(content) {
              setTimeout(function() {
                  controller.setImage(content);
                  controller.setName(textureName);
                  var categories = component.preferences.getTexturesCatalog().getCategories();
                  var userCategory = component.findUserCategory(categories) || component.userCategory;
                  controller.setCategory(userCategory);
                  controller.setCreator(null);
                  var defaultWidth = component.preferences.getLengthUnit().isMetric() 
                      ? 20 : LengthUnit.inchToCentimeter(8);
                  controller.setWidth(defaultWidth);
                  controller.setHeight(defaultWidth / checkedImage.width * checkedImage.height);
                }, 100);
            };
          if (image === checkedImage
              && (file.type == "image/jpeg" 
                || file.type == "image/png")) {
            contentReady(new BlobURLContent(file));
          } else {
            BlobURLContent.fromImage(checkedImage, imageType, contentReady);
          }
        });
    }
  }

  /**
   * Sets the texts of label and button of image choice panel with change texts.
   * @private
   */
  ImportedTextureWizardStepsView.prototype.setImageChangeTexts = function() {
    this.imageChoiceOrChangeLabel.innerHTML = this.getLocalizedLabelText(
        "ImportedTextureWizardStepsPanel", "imageChangeLabel.text").replace(/\<br\>/g, " ");
    this.imageChoiceOrChangeButton.innerHTML = this.getLocalizedLabelText(
        "ImportedTextureWizardStepsPanel", "imageChangeButton.text");
  }

  /**
   * Sets the texts of label and button of image choice panel with choice texts.
   * @private
   */
  ImportedTextureWizardStepsView.prototype.setImageChoiceTexts = function() {
    this.imageChoiceOrChangeLabel.innerHTML = this.getLocalizedLabelText(
        "ImportedTextureWizardStepsPanel", "imageChoiceLabel.text").replace(/\<br\>/g, " ");
    this.imageChoiceOrChangeButton.innerHTML = this.getLocalizedLabelText(
        "ImportedTextureWizardStepsPanel", "imageChoiceButton.text");
  }

  /**
   * Returns user category if it exists among existing the given <code>categories</code>.
   * @param {TexturesCategory[]} categories 
   * @return {TexturesCategory | null} found user category, or null if not found
   * @private
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
  ImportedTextureWizardStepsView.prototype.checkImageSize = function (image, imageType, imageReady) {
    if (image.width * image.height < LARGE_IMAGE_PIXEL_COUNT_THRESHOLD) {
      imageReady(image);
    } else {
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
      var resizeImage = function() { 
          ImageTools.resize(image, reducedWidth, reducedHeight, imageReady, imageType);
        };
      if (this.getUserPreferences().isImportedImageResizedWithoutPrompting()) {
        resizeImage();
      } else {
        var promptDialog = new JSImageResizingDialog(preferences,
            "@{ImportedTextureWizardStepsPanel.reduceImageSize.title}",
            this.getLocalizedLabelText(
                "ImportedTextureWizardStepsPanel", "reduceImageSize.message", [image.width, image.height, reducedWidth, reducedHeight]),
            "@{ImportedTextureWizardStepsPanel.reduceImageSize.cancel}",
            "@{ImportedTextureWizardStepsPanel.reduceImageSize.keepUnchanged}",
            "@{ImportedTextureWizardStepsPanel.reduceImageSize.reduceSize}",
            resizeImage, // Confirm image resizing
            function() { // Original image 
                imageReady(image); 
              });
        promptDialog.displayView();
      }
    }
  }

  /**
   * @private
   */
  ImportedTextureWizardStepsView.prototype.updatePreviewComponentsImage = function() {
    this.previewPanel.innerHTML = "";
    var image = new Image();
    if (this.controller.getImage() !== null) {
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
  var isElementVisible = function(element) {
    if (element instanceof JSComponent) {
      element = element.getHTMLElement();
    }
    return window.getComputedStyle(element).display !== "none";
  }

  /**
   * Hides a preference row from any of its input element.
   * @param {HTMLElement} preferenceInput 
   */
  var disablePreferenceRow = function(preferenceInput) {
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
          if (isElementVisible(dialog.furnitureCatalogViewTreeRadioButton)) {
            controller.setFurnitureCatalogViewedInTree(dialog.furnitureCatalogViewTreeRadioButton.checked);
          }
          if (isElementVisible(dialog.navigationPanelCheckBox)) {
            controller.setNavigationPanelVisible(dialog.navigationPanelCheckBox.checked);
          }
          if (isElementVisible(dialog.aerialViewCenteredOnSelectionCheckBox)) {
            controller.setAerialViewCenteredOnSelectionEnabled(dialog.aerialViewCenteredOnSelectionCheckBox.checked);
          }
          if (isElementVisible(dialog.observerCameraSelectedAtChangeCheckBox)) {
            controller.setObserverCameraSelectedAtChange(dialog.observerCameraSelectedAtChangeCheckBox.checked);
          }
          if (isElementVisible(dialog.magnetismCheckBox)) {
            controller.setMagnetismEnabled(dialog.magnetismCheckBox.checked);
          }
          if (isElementVisible(dialog.rulersCheckBox)) {
            controller.setRulersVisible(dialog.rulersCheckBox.checked);
          }
          if (isElementVisible(dialog.gridCheckBox)) {
            controller.setGridVisible(dialog.gridCheckBox.checked);
          }
          if (isElementVisible(dialog.iconTopViewRadioButton)) {
            controller.setFurnitureViewedFromTop(dialog.iconTopViewRadioButton.checked);
          }
          if (isElementVisible(dialog.iconSizeSelect) && !dialog.iconSizeSelect.disabled) {
            controller.setFurnitureModelIconSize(parseInt(dialog.iconSizeSelect.value));
          }
          if (isElementVisible(dialog.roomRenderingFloorColorOrTextureRadioButton)) {
            controller.setRoomFloorColoredOrTextured(dialog.roomRenderingFloorColorOrTextureRadioButton.checked);
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
  if (controller.isPropertyEditable("LANGUAGE")) {
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

      var selected = supportedLanguages[i] == controller.getLanguage();
      var languageOption = JSComponent.createOptionElement(supportedLanguages[i], languageDisplayName, selected);
      dialog.languageSelect.appendChild(languageOption);
    }
  } else {
    disablePreferenceRow(dialog.languageSelect);
  }

  // UNIT
  dialog.unitSelect = dialog.getElement("unit-select");
  if (controller.isPropertyEditable("UNIT")) {
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
        JSComponent.createOptionElement("INCH_FRACTION", 
            preferences.getLocalizedString("UserPreferencesPanel", "unitComboBox.inchFraction.text"),
            controller.getUnit() == LengthUnit.INCH_FRACTION));
    dialog.unitSelect.appendChild(
        JSComponent.createOptionElement("INCH_DECIMALS", 
            preferences.getLocalizedString("UserPreferencesPanel", "unitComboBox.inchDecimals.text"),
            controller.getUnit() == LengthUnit.INCH_DECIMALS));
    dialog.unitSelect.appendChild(
        JSComponent.createOptionElement("FOOT_DECIMALS", 
            preferences.getLocalizedString("UserPreferencesPanel", "unitComboBox.footDecimals.text"),
            controller.getUnit() == LengthUnit.FOOT_DECIMALS));

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
  var noCurrencyLabel = dialog.getLocalizedLabelText("UserPreferencesPanel", "currencyComboBox.noCurrency.text");
  if (controller.isPropertyEditable("CURRENCY")) {
    dialog.currencySelect.appendChild(JSComponent.createOptionElement("", noCurrencyLabel, !controller.getCurrency()));
    var currencyDisplayNames = {
        EUR: 'EUR €',
        AED: 'AED AED',
        AFN: 'AFN ؋',
        ALL: 'ALL Lekë',
        AMD: 'AMD ֏',
        ANG: 'ANG NAf.',
        AOA: 'AOA Kz',
        ARS: 'ARS $',
        AUD: 'AUD $',
        AWG: 'AWG Afl.',
        AZN: 'AZN ₼',
        BAM: 'BAM KM',
        BBD: 'BBD $',
        BDT: 'BDT ৳',
        BGN: 'BGN лв.',
        BHD: 'BHD د.ب.‏',
        BIF: 'BIF FBu',
        BMD: 'BMD $',
        BND: 'BND $',
        BOB: 'BOB Bs',
        BRL: 'BRL R$',
        BSD: 'BSD $',
        BTN: 'BTN Nu.',
        BWP: 'BWP P',
        BYN: 'BYN Br',
        BZD: 'BZD $',
        CAD: 'CAD $',
        CDF: 'CDF FC',
        CHF: 'CHF CHF',
        CLP: 'CLP $',
        CNY: 'CNY ￥',
        COP: 'COP $',
        CRC: 'CRC ₡',
        CSD: 'CSD CSD',
        CUP: 'CUP $',
        CVE: 'CVE ​',
        CZK: 'CZK Kč',
        DJF: 'DJF Fdj',
        DKK: 'DKK kr',
        DOP: 'DOP RD$',
        DZD: 'DZD DA',
        EGP: 'EGP ج.م.‏',
        ERN: 'ERN Nfk',
        ETB: 'ETB Br',
        EUR: 'EUR €',
        FJD: 'FJD $',
        FKP: 'FKP £',
        GBP: 'GBP £',
        GEL: 'GEL ₾',
        GHS: 'GHS GH₵',
        GIP: 'GIP £',
        GMD: 'GMD D',
        GNF: 'GNF FG',
        GTQ: 'GTQ Q',
        GYD: 'GYD $',
        HKD: 'HKD HK$',
        HNL: 'HNL L',
        HRK: 'HRK HRK',
        HTG: 'HTG G',
        HUF: 'HUF Ft',
        IDR: 'IDR Rp',
        ILS: 'ILS ₪',
        INR: 'INR ₹',
        IQD: 'IQD د.ع.‏',
        IRR: 'IRR IRR',
        ISK: 'ISK ISK',
        JMD: 'JMD $',
        JOD: 'JOD د.أ.‏',
        JPY: 'JPY ￥',
        KES: 'KES Ksh',
        KGS: 'KGS сом',
        KHR: 'KHR ៛',
        KMF: 'KMF CF',
        KPW: 'KPW KPW',
        KRW: 'KRW ₩',
        KWD: 'KWD د.ك.‏',
        KYD: 'KYD $',
        KZT: 'KZT ₸',
        LAK: 'LAK ₭',
        LBP: 'LBP ل.ل.‏',
        LKR: 'LKR Rs.',
        LRD: 'LRD $',
        LSL: 'LSL LSL',
        LYD: 'LYD د.ل.‏',
        MAD: 'MAD MAD',
        MDL: 'MDL L',
        MGA: 'MGA Ar',
        MKD: 'MKD den',
        MMK: 'MMK K',
        MNT: 'MNT ₮',
        MOP: 'MOP MOP$',
        MRU: 'MRU UM',
        MUR: 'MUR Rs',
        MWK: 'MWK MK',
        MXN: 'MXN $',
        MYR: 'MYR RM',
        MZN: 'MZN MTn',
        NAD: 'NAD $',
        NGN: 'NGN ₦',
        NIO: 'NIO C$',
        NOK: 'NOK kr',
        NPR: 'NPR नेरू',
        NZD: 'NZD $',
        OMR: 'OMR ر.ع.‏',
        PAB: 'PAB B/.',
        PEN: 'PEN S/',
        PGK: 'PGK K',
        PHP: 'PHP ₱',
        PKR: 'PKR ر',
        PLN: 'PLN zł',
        PYG: 'PYG Gs.',
        QAR: 'QAR ر.ق.‏',
        RON: 'RON RON',
        RSD: 'RSD RSD',
        RUB: 'RUB ₽',
        RWF: 'RWF RF',
        SAR: 'SAR ر.س.‏',
        SBD: 'SBD $',
        SCR: 'SCR SR',
        SDG: 'SDG SDG',
        SEK: 'SEK kr',
        SGD: 'SGD $',
        SHP: 'SHP £',
        SLL: 'SLL Le',
        SOS: 'SOS S',
        SRD: 'SRD $',
        SSP: 'SSP £',
        STN: 'STN Db',
        SVC: 'SVC C',
        SYP: 'SYP LS',
        SZL: 'SZL E',
        THB: 'THB ฿',
        TJS: 'TJS сом.',
        TMT: 'TMT TMT',
        TND: 'TND DT',
        TOP: 'TOP T$',
        TRY: 'TRY ₺',
        TTD: 'TTD $',
        TWD: 'TWD $',
        TZS: 'TZS TSh',
        UAH: 'UAH ₴',
        UGX: 'UGX USh',
        USD: 'USD $',
        UYU: 'UYU $',
        UZS: 'UZS сўм',
        VES: 'VES Bs.S',
        VND: 'VND ₫',
        VUV: 'VUV VT',
        WST: 'WST WS$',
        XAF: 'XAF FCFA',
        XCD: 'XCD $',
        XOF: 'XOF CFA',
        XPF: 'XPF FCFP',
        YER: 'YER ر.ي.‏',
        ZAR: 'ZAR R',
        ZMW: 'ZMW K',
        ZWL: 'ZWL ZWL'
      };
    var currencies = Object.keys(currencyDisplayNames);
    for (var i = 0; i < currencies.length; i++) {
      var currency = currencies[i];
      var currencyLabel = currencyDisplayNames[currency];
      dialog.currencySelect.appendChild(JSComponent.createOptionElement(
          currency, currencyLabel, currency == controller.getCurrency()));
    }

    dialog.registerEventListener(dialog.currencySelect, "change", function(ev) {
        var selectedIndex = dialog.currencySelect.selectedIndex;
        var selectedCurrency = dialog.currencySelect.options[selectedIndex].value;
        controller.setCurrency(selectedCurrency ? selectedCurrency : null);
      });
    dialog.registerPropertyChangeListener(controller, "CURRENCY", function(ev) {
        var option = dialog.currencySelect.querySelector("[value='" + (controller.getCurrency() ? controller.getCurrency() : "") + "']");
        option.selected = true;
        dialog.valueAddedTaxCheckBox.disabled = controller.getCurrency() == null;
      });

    // VALUE_ADDED_TAX_ENABLED
    var vatEnabled = controller.isPropertyEditable("VALUE_ADDED_TAX_ENABLED");
    dialog.valueAddedTaxCheckBox.parentElement.style.display = vatEnabled ? "initial" : "none";
    dialog.valueAddedTaxCheckBox.disabled = controller.getCurrency() == null;
    dialog.valueAddedTaxCheckBox.checked = controller.isValueAddedTaxEnabled();
    dialog.registerEventListener(dialog.valueAddedTaxCheckBox, "change", function(ev) {
        controller.setValueAddedTaxEnabled(dialog.valueAddedTaxCheckBox.checked);
      });
    dialog.registerPropertyChangeListener(controller, "VALUE_ADDED_TAX_ENABLED", function(ev) {
        dialog.valueAddedTaxCheckBox.disabled = controller.getCurrency() == null;
        dialog.valueAddedTaxCheckBox.checked = controller.isValueAddedTaxEnabled();
      });
  } else {
    disablePreferenceRow(dialog.currencySelect);
  }

  // FURNITURE_CATALOG_VIEWED_IN_TREE
  dialog.furnitureCatalogViewTreeRadioButton = dialog.findElement("[name='furniture-catalog-view-radio'][value='tree']");
  if (controller.isPropertyEditable("FURNITURE_CATALOG_VIEWED_IN_TREE") && false) {
    var selectedFurnitureCatalogView = controller.isFurnitureCatalogViewedInTree() ? "tree" : "list";
    dialog.findElement("[name='furniture-catalog-view-radio'][value='" + selectedFurnitureCatalogView + "']").checked = true;
  } else {
    disablePreferenceRow(dialog.furnitureCatalogViewTreeRadioButton);
  }

  // NAVIGATION_PANEL_VISIBLE 
  dialog.navigationPanelCheckBox = dialog.getElement("navigation-panel-checkbox");
  if (controller.isPropertyEditable("NAVIGATION_PANEL_VISIBLE")) {
    dialog.navigationPanelCheckBox.checked = controller.isNavigationPanelVisible();
  } else {
    disablePreferenceRow(dialog.navigationPanelCheckBox);
  }
  
  // AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED
  dialog.aerialViewCenteredOnSelectionCheckBox = dialog.getElement("aerial-view-centered-on-selection-checkbox");
  if (controller.isPropertyEditable("AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED")) {
    dialog.aerialViewCenteredOnSelectionCheckBox.checked = controller.isAerialViewCenteredOnSelectionEnabled();
  } else {
    disablePreferenceRow(dialog.aerialViewCenteredOnSelectionCheckBox);
  }
  
  // OBSERVER_CAMERA_SELECTED_AT_CHANGE
  dialog.observerCameraSelectedAtChangeCheckBox = dialog.getElement("observer-camera-selected-at-change-checkbox");
  if (controller.isPropertyEditable("OBSERVER_CAMERA_SELECTED_AT_CHANGE")) {
    dialog.observerCameraSelectedAtChangeCheckBox.checked = controller.isObserverCameraSelectedAtChange();
  } else {
    disablePreferenceRow(dialog.observerCameraSelectedAtChangeCheckBox);
  }
  
  // MAGNETISM
  dialog.magnetismCheckBox = dialog.getElement("magnetism-checkbox");
  if (controller.isPropertyEditable("MAGNETISM_ENABLED")) {
    dialog.magnetismCheckBox.checked = controller.isMagnetismEnabled();
  } else {
    disablePreferenceRow(dialog.magnetismCheckBox);
  }
  
  // RULERS
  dialog.rulersCheckBox = dialog.getElement("rulers-checkbox");
  if (controller.isPropertyEditable("RULERS_VISIBLE") && false) {
    dialog.rulersCheckBox.checked = controller.isRulersVisible();
  } else {
    disablePreferenceRow(dialog.rulersCheckBox);
  }
  
  // GRID
  dialog.gridCheckBox = dialog.getElement("grid-checkbox");
  if (controller.isPropertyEditable("GRID_VISIBLE")) {
    dialog.gridCheckBox.checked = controller.isGridVisible();
  } else {
    disablePreferenceRow(dialog.gridCheckBox);
  }

  // DEFAULT_FONT_NAME
  dialog.defaultFontNameSelect = dialog.getElement("default-font-name-select");
  if (controller.isPropertyEditable("DEFAULT_FONT_NAME")) {
    var DEFAULT_SYSTEM_FONT_NAME = "DEFAULT_SYSTEM_FONT_NAME";
    var defaultFontChangeListener = function() {
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
      defaultFontChangeListener();
    });

    dialog.registerPropertyChangeListener(controller, "DEFAULT_FONT_NAME", defaultFontChangeListener);

    dialog.registerEventListener(dialog.defaultFontNameSelect, "change", function(ev) {
        var selectedValue = dialog.defaultFontNameSelect.querySelector("option:checked").value;
        controller.setDefaultFontName(selectedValue == DEFAULT_SYSTEM_FONT_NAME ? null : selectedValue);
      });
  } else {
    disablePreferenceRow(dialog.defaultFontNameSelect);
  }

  // FURNITURE ICON 
  dialog.iconTopViewRadioButton = dialog.findElement("[name='furniture-icon-radio'][value='topView']");
  dialog.iconSizeSelect = dialog.getElement("icon-size-select");
  if (controller.isPropertyEditable("FURNITURE_VIEWED_FROM_TOP")) {
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
    var iconModeSelected = function(dialog) {
      dialog.iconSizeSelect.disabled = !dialog.iconTopViewRadioButton.checked;
    }

    iconModeSelected(dialog);
    dialog.registerEventListener(dialog.findElements("[name='furniture-icon-radio']"), "change", function(ev) {
        iconModeSelected(dialog);
      });
  } else {
    disablePreferenceRow(dialog.iconTopViewRadioButton);
  }

  // ROOM_FLOOR_COLORED_OR_TEXTURED
  dialog.roomRenderingFloorColorOrTextureRadioButton = dialog.findElement("[name='room-rendering-radio'][value='floorColorOrTexture']");
  if (controller.isPropertyEditable("ROOM_FLOOR_COLORED_OR_TEXTURED")) {
    var roomRenderingValue = controller.isRoomFloorColoredOrTextured() ? "floorColorOrTexture" : "monochrome";
    dialog.findElement("[name='room-rendering-radio'][value='" + roomRenderingValue + "']").checked = true;
  } else {
    disablePreferenceRow(dialog.roomRenderingFloorColorOrTextureRadioButton);
  }

  // NEW_WALL_PATTERN
  var newWallPatternSelect = dialog.getElement("new-wall-pattern-select");
  if (controller.isPropertyEditable("NEW_WALL_PATTERN")) {
    var patternsTexturesByURL = {};
    var patterns = preferences.getPatternsCatalog().getPatterns();
    for (var i = 0; i < patterns.length; i++) {
      var url = patterns[i].getImage().getURL();
      patternsTexturesByURL[url] = patterns[i];
    }
    newWallPatternSelect.classList.add("wall-pattern-combo-box");
    dialog.patternComboBox = new JSComboBox(preferences, newWallPatternSelect, 
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
    dialog.registerPropertyChangeListener(controller, "NEW_WALL_PATTERN", function() {
        var selectedUrl = controller.getNewWallPattern().getImage().getURL();
        dialog.patternComboBox.setSelectedItem(selectedUrl);
      });
  } else {
    disablePreferenceRow(dialog.newWallPatternSelect);
  }

  // NEW_WALL_THICKNESS
  dialog.newWallThicknessInput = new JSSpinner(preferences, dialog.getElement("new-wall-thickness-input"), 
      {
        value: 1,  
        minimum: 0, 
        maximum: 100000
      });
  if (controller.isPropertyEditable("NEW_WALL_THICKNESS")) {
    dialog.newWallThicknessInput.setValue(controller.getNewWallThickness());
  } else {
    disablePreferenceRow(dialog.newWallThicknessInput);
  }

  // NEW_WALL_HEIGHT
  dialog.newWallHeightInput = new JSSpinner(preferences, dialog.getElement("new-wall-height-input"), 
      {
        value: 1,  
        minimum: 0, 
        maximum: 100000
      });
  if (controller.isPropertyEditable("NEW_WALL_HEIGHT")) {
    dialog.newWallHeightInput.setValue(controller.getNewWallHeight());
  } else {
    disablePreferenceRow(dialog.newWallHeightInput);
  }

  // NEW_FLOOR_THICKNESS
  dialog.newFloorThicknessInput = new JSSpinner(preferences, dialog.getElement("new-floor-thickness-input"), 
      {
        value: 1,  
        minimum: 0, 
        maximum: 100000
      });
  if (controller.isPropertyEditable("NEW_FLOOR_THICKNESS")) {
    dialog.newFloorThicknessInput.setValue(controller.getNewFloorThickness());
  } else {
    disablePreferenceRow(dialog.newFloorThicknessInput);
  }

  var updateSpinnerStepsAndLength = function(spinner, centimeterStepSize, inchStepSize) {
      if (controller.getUnit().isMetric()) {
        spinner.setStepSize(centimeterStepSize);
      } else {
        spinner.setStepSize(inchStepSize);
      }
      spinner.setMinimum(controller.getUnit().getMinimumLength());
      if (spinner.getMinimum() > spinner.getValue()) {
        spinner.setValue(spinner.getMinimum());
      }
      spinner.setFormat(controller.getUnit().getFormat());
    };

  var updateStepsAndLength = function() {
      updateSpinnerStepsAndLength(dialog.newWallThicknessInput, LengthUnit.CENTIMETER.getStepSize(), LengthUnit.INCH.getStepSize());
      updateSpinnerStepsAndLength(dialog.newWallHeightInput, LengthUnit.CENTIMETER.getStepSize() * 20, LengthUnit.INCH.getStepSize() * 16);
      updateSpinnerStepsAndLength(dialog.newFloorThicknessInput, LengthUnit.CENTIMETER.getStepSize(), LengthUnit.INCH.getStepSize());
    };

  updateStepsAndLength();
  dialog.registerPropertyChangeListener(controller, "UNIT", function(ev) {
      updateStepsAndLength();
    });
  return dialog;
}

JSViewFactory.prototype.createLevelView = function(preferences, controller) {
  var dialog = new JSDialog(preferences,
      "@{LevelPanel.level.title}",
      document.getElementById("level-dialog-template"), 
      {
        size: "medium",
        applier: function() {
          controller.modifyLevels();
        }
      });

  var unitName = preferences.getLengthUnit().getName();

  // Viewable check box bound to VIEWABLE controller property
  var viewableCheckBox = dialog.getElement("viewable-checkbox");
  var viewableCheckBoxDisplay = controller.isPropertyEditable("VIEWABLE") ? "initial" : "none";
  viewableCheckBox.parentElement.style.display = viewableCheckBoxDisplay;
  viewableCheckBox.checked = controller.getViewable();
  dialog.registerEventListener(viewableCheckBox, "change", function(ev) {
      controller.setViewable(viewableCheckBox.checked);
    });
  dialog.registerPropertyChangeListener(controller, "VIEWABLE", function(ev) {
      viewableCheckBox.checked = controller.getViewable();
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
  dialog.registerPropertyChangeListener(controller, "NAME", function(ev) {
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
  dialog.registerPropertyChangeListener(controller, "ELEVATION", function(ev) {
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
  dialog.registerPropertyChangeListener(controller, "FLOOR_THICKNESS", function(ev) {
      floorThicknessInput.setValue(ev.getNewValue());
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
  dialog.registerPropertyChangeListener(controller, "HEIGHT", function(ev) {
      heightInput.setValue(ev.getNewValue());
    });

  var elevationButtonsDisplay = controller.isPropertyEditable("ELEVATION_INDEX") ? "initial" : "none";
  var increaseElevationButtonAction = new ResourceAction(preferences, "LevelPanel", "INCREASE_ELEVATION_INDEX", true);
  var decreaseElevationButtonAction = new ResourceAction(preferences, "LevelPanel", "DECREASE_ELEVATION_INDEX", true);
  dialog.increaseElevationButton = dialog.getElement("increase-elevation-index-button");
  dialog.increaseElevationButton.style.backgroundImage = "url('" + increaseElevationButtonAction.getURL(AbstractAction.SMALL_ICON) + "')";
  dialog.increaseElevationButton.style.display = elevationButtonsDisplay;
  dialog.registerEventListener(dialog.increaseElevationButton, "click", function(ev) {
      controller.setElevationIndex(controller.getElevationIndex() + 1);
      setElevationIndexButtonsEnabled();
    });

  dialog.decreaseElevationButton = dialog.getElement("decrease-elevation-index-button");
  dialog.decreaseElevationButton.style.backgroundImage = "url('" + decreaseElevationButtonAction.getURL(AbstractAction.SMALL_ICON) + "')";
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

  dialog.registerPropertyChangeListener(controller, "SELECT_LEVEL_INDEX", updateSelectedLevel);
  dialog.registerPropertyChangeListener(controller, "LEVELS", generateTableBody);
  return dialog;
}

/**
 * 
 * @param {UserPreferences} preferences 
 * @param {HomeFurnitureController} controller
 */
JSViewFactory.prototype.createHomeFurnitureView = function(preferences, controller) {
  function HomeFurnitureDialog() {
    this.controller = controller;
    
    JSDialog.call(this, preferences, 
      "@{HomeFurniturePanel.homeFurniture.title}", 
      document.getElementById("home-furniture-dialog-template"),
      {
        applier: function() {
          controller.modifyFurniture();
        },
        disposer: function(dialog) {
          dialog.paintPanel.colorButton.dispose();
          dialog.paintPanel.textureComponent.dispose();
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
      this.registerPropertyChangeListener(this.controller, "VISIBLE", function(ev) {
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
  HomeFurnitureDialog.prototype = Object.create(JSDialog.prototype);
  HomeFurnitureDialog.prototype.constructor = HomeFurnitureDialog;

  /**
   * @private
   */
  HomeFurnitureDialog.prototype.initNameAndPricePanel = function() {
    var title = this.getElement("name-and-price-title");
    title.textContent = this.getLocalizedLabelText(
        "HomeFurniturePanel", controller.isPropertyEditable("PRICE") ? "nameAndPricePanel.title" : "namePanel.title");

    var nameLabel = this.getElement("name-label");
    var nameInput = this.getElement("name-input");
    var nameVisibleCheckBox = this.getElement("name-visible-checkbox");
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
    
    nameVisibleCheckBox.parentElement.style.display = nameVisibleDisplay;
    
    priceLabel.style.display = priceDisplay;
    priceInput.style.display = priceDisplay;

    valueAddedTaxPercentageInput.getHTMLElement().previousElementSibling.style.display = vatDisplay;
    valueAddedTaxPercentageInput.style.display = vatDisplay;

    // 2) Set values
    nameInput.value = controller.getName() != null ? controller.getName() : "";
    nameVisibleCheckBox.checked = this.controller.getNameVisible();
    priceInput.setValue(this.controller.getPrice());
    if (this.controller.getValueAddedTaxPercentage()) {
      valueAddedTaxPercentageInput.setValue(this.controller.getValueAddedTaxPercentage() * 100);
    }

    // 3) Add property listeners
    this.registerPropertyChangeListener(this.controller, "NAME", function(ev) {
        nameInput.value = controller.getName() != null ? controller.getName() : "";
      });
    this.registerPropertyChangeListener(this.controller, "NAME_VISIBLE", function(ev) {
        nameVisibleCheckBox.checked = controller.getNameVisible();
      });
    this.registerPropertyChangeListener(this.controller, "PRICE", function(ev) {
        priceInput.setValue(controller.getPrice());
      });
    this.registerPropertyChangeListener(this.controller, "VALUE_ADDED_TAX_PERCENTAGE", function(ev) {
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
    this.registerEventListener(nameVisibleCheckBox, "change", function(ev) {
        controller.setNameVisible(nameVisibleCheckBox.checked);
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
  HomeFurnitureDialog.prototype.initLocationPanel = function() {
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

    var mirroredModelCheckBox = this.getElement("mirrored-model-checkbox");
    var basePlanItemCheckBox = this.getElement("base-plan-item-checkbox");

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
    
    mirroredModelCheckBox.parentElement.style.display = modelMirroredDisplay;
    basePlanItemCheckBox.parentElement.style.display = basePlanItemDisplay;

    // 2) Set values
    xInput.setValue(this.controller.getX());
    yInput.setValue(this.controller.getY());
    elevationInput.setValue(this.controller.getElevation());
    mirroredModelCheckBox.checked = this.controller.getModelMirrored();
    basePlanItemCheckBox.checked = this.controller.getBasePlanItem();

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
    this.registerPropertyChangeListener(this.controller, "X", function(ev) {
        xInput.setValue(controller.getX());
      });
    this.registerPropertyChangeListener(this.controller, "Y", function(ev) {
        yInput.setValue(controller.getY());
      });
    this.registerPropertyChangeListener(this.controller, "ELEVATION", function(ev) {
        elevationInput.setValue(controller.getElevation());
      });
    this.registerPropertyChangeListener(this.controller, "MODEL_MIRRORED", function(ev) {
        mirroredModelCheckBox.checked = controller.getModelMirrored();
      });
    this.registerPropertyChangeListener(this.controller, "BASE_PLAN_ITEM", function(ev) {
        basePlanItemCheckBox.checked = controller.getBasePlanItem();
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
    this.registerEventListener(mirroredModelCheckBox, "change", function(ev) {
        controller.setModelMirrored(mirroredModelCheckBox.checked);
      });
    this.registerEventListener(basePlanItemCheckBox, "change", function(ev) {
        controller.setBasePlanItem(basePlanItemCheckBox.checked);
      });

    this.locationPanel = {
      element: this.findElement('.location-panel'),
      elevationInput: elevationInput
    };
  }

  /**
   * @private
   */
  HomeFurnitureDialog.prototype.initOrientationPanel = function() {
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
    var rollRadioButton = this.findElement("[name='horizontal-rotation-radio'][value='ROLL']");
    var pitchRadioButton = this.findElement("[name='horizontal-rotation-radio'][value='PITCH']");
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
	  furnitureOrientationImage.innerHTML = "<img src='" + ZIPTools.getScriptFolder() + "/resources/furnitureOrientation.png' />";

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

    rollRadioButton.parentElement.style.display = rollDisplay; 
    rollInput.getHTMLElement().parentElement.style.display = rollDisplay; 
    
    pitchRadioButton.parentElement.style.display = pitchDisplay; 
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
        rollRadioButton.checked = controller.getHorizontalAxis() == HomeFurnitureController.FurnitureHorizontalAxis.ROLL;
        pitchRadioButton.checked = controller.getHorizontalAxis() == HomeFurnitureController.FurnitureHorizontalAxis.PITCH;
      };
    updateHorizontalAxisRadioButtons();

    // 3) Add property listeners
    this.registerPropertyChangeListener(this.controller, "ANGLE", function(ev) {
        if (controller.getAngle() != null) {
          angleInput.setValue(Math.toDegrees(controller.getAngle()));
        } else {
          angleInput.setValue(null);
        }
      });
    this.registerPropertyChangeListener(this.controller, "ROLL", function(ev) {
        if (controller.getRoll() != null) {
          rollInput.setValue(Math.toDegrees(controller.getRoll()));
        } else {
          rollInput.setValue(null);
        }
      });
    this.registerPropertyChangeListener(this.controller, "PITCH", function(ev) {
        if (controller.getPitch() != null) {
          pitchInput.setValue(Math.toDegrees(controller.getPitch()));
        } else {
          pitchInput.setValue(null);
        }
      });
    this.registerPropertyChangeListener(this.controller, "HORIZONTAL_AXIS", function(ev) {
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
    this.registerEventListener([rollRadioButton, pitchRadioButton], "change", function(ev) {
        if (rollRadioButton.checked) {
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
  HomeFurnitureDialog.prototype.initPaintPanel = function() {
    var dialog = this;
    var controller = this.controller;
    var preferences = this.preferences;

    var colorButton = new ColorButton(preferences, 
        {
          colorChanged: function(color) {
              colorAndTextureRadioButtons[HomeFurnitureController.FurniturePaint.COLORED].checked = true;
              controller.setPaint(HomeFurnitureController.FurniturePaint.COLORED);
              controller.setColor(color);
            }
        });
    this.attachChildComponent("color-button", colorButton);
    colorButton.setColor(controller.getColor());
    colorButton.setColorDialogTitle(preferences.getLocalizedString("HomeFurniturePanel", "colorDialog.title"));

    var textureComponent = controller.getTextureController().getView();
    this.attachChildComponent("texture-component", textureComponent);

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

    // Material
    var modelMaterialsComponent = controller.getModelMaterialsController().getView();
    this.attachChildComponent("material-component", modelMaterialsComponent);

    var uniqueModel = controller.getModelMaterialsController().getModel() != null;
    colorAndTextureRadioButtons[HomeFurnitureController.FurniturePaint.MODEL_MATERIALS].disabled = !uniqueModel;
    modelMaterialsComponent.setEnabled(uniqueModel);

    this.paintPanel = {
        colorAndTextureRadioButtons: colorAndTextureRadioButtons,
        colorButton: colorButton,
        textureComponent: textureComponent};

    var panelDisplay = controller.isPropertyEditable("PAINT") ? undefined : "none";
    this.getElement("paint-panel").style.display = panelDisplay;
    this.getElement("paint-panel").previousElementSibling.style.display = panelDisplay;

    this.registerPropertyChangeListener(controller, "PAINT", function(ev) {
        dialog.updatePaintRadioButtons();
      });

    this.registerEventListener(colorAndTextureRadioButtons, "change", function(ev) { 
        var paint = colorAndTextureRadioButtons.indexOf(ev.target);
        controller.setPaint(paint);
      });
  }

  /**
   * @private
   */
  HomeFurnitureDialog.prototype.updatePaintRadioButtons = function() {
    var dialog = this;
    var controller = this.controller;
    var colorAndTextureRadioButtons = dialog.paintPanel.colorAndTextureRadioButtons;
    if (controller.getPaint() == null) {
      for (var i = 0; i < colorAndTextureRadioButtons.length; i++) {
        colorAndTextureRadioButtons[i].checked = false;
      }
    } else {
      var selectedRadioButton = colorAndTextureRadioButtons[controller.getPaint()];
      if (selectedRadioButton) {
        selectedRadioButton.checked = true;
      }
      this.updateShininessRadioButtons(controller);
    }
  };
  
  /**
   * @private
   */
  HomeFurnitureDialog.prototype.initSizePanel = function() {
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
    var keepProportionsCheckBox = this.getElement("keep-proportions-checkbox");
    var modelTransformationsButton = this.getElement("model-transformations-button");

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
    keepProportionsCheckBox.parentElement.style.display = keepProportionsDisplay;
    modelTransformationsButton.parentElement.style.display = "none";
    
    if (this.controller.isPropertyEditable("MODEL_TRANSFORMATIONS")
        && modelTransformationsButton != null) {
      var modelMaterialsController = controller.getModelMaterialsController();
      if (modelMaterialsController !== null && modelMaterialsController.getModel() !== null) {
        ModelManager.getInstance().loadModel(modelMaterialsController.getModel(),
            {
              modelUpdated : function(modelRoot) {
                var modelManager = ModelManager.getInstance();
                if (modelManager.containsDeformableNode(modelRoot)) {
                  // Make button visible only if model contains some deformable nodes
                  modelTransformationsButton.innerHTML = dialog.getLocalizedLabelText("HomeFurniturePanel", 
                      modelManager.containsNode(modelRoot, ModelManager.MANNEQUIN_ABDOMEN_PREFIX)
                          ? "mannequinTransformationsButton.text"
                          : "modelTransformationsButton.text");
                  modelTransformationsButton.parentElement.style.display = "block";
                  dialog.registerEventListener(modelTransformationsButton, "click", function(ev) {
                      dialog.displayModelTransformationsView(dialog.getUserPreferences(), dialog.controller);
                    });
                }
              },
              modelError : function(ex) {
                // Ignore missing models
              }
            });
      }
    }
    
    // 2) Set values
    widthInput.setValue(this.controller.getWidth());
    depthInput.setValue(this.controller.getDepth());
    heightInput.setValue(this.controller.getHeight());
    keepProportionsCheckBox.checked = this.controller.isProportional();

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
    this.registerPropertyChangeListener(this.controller, "WIDTH", function(ev) {
        widthInput.setValue(controller.getWidth());
      });
    this.registerPropertyChangeListener(this.controller, "DEPTH", function(ev) {
        depthInput.setValue(controller.getDepth());
      });
    this.registerPropertyChangeListener(this.controller, "HEIGHT", function(ev) {
        heightInput.setValue(controller.getHeight());
      });
    this.registerPropertyChangeListener(this.controller, "PROPORTIONAL", function(ev) {
        keepProportionsCheckBox.checked = controller.isProportional();
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
    this.registerEventListener(keepProportionsCheckBox, "change", function(ev) {
          controller.setProportional(keepProportionsCheckBox.checked);
        });

    // 7) Assign panel's components
    this.sizePanel = {
        widthLabel: widthLabel,
        widthInput: widthInput,
        depthLabel: depthLabel,
        depthInput: depthInput,
        heightLabel: heightLabel,
        heightInput: heightInput,
        keepProportionsCheckBox: keepProportionsCheckBox
      };

    // 8) Handle components activation
    this.updateSizeComponents();
    // Add a listener that enables / disables size fields depending on furniture
    // resizable and deformable
    this.registerPropertyChangeListener(this.controller, "RESIZABLE", function(ev) {
        dialog.updateSizeComponents();
      });
    this.registerPropertyChangeListener(this.controller, "DEFORMABLE", function(ev) {
        dialog.updateSizeComponents();
      });
  };

  /**
   * @private
   */
  HomeFurnitureDialog.prototype.updateSizeComponents = function() {
    var editableSize = this.controller.isResizable();
    this.sizePanel.widthLabel.disabled = !editableSize;
    this.sizePanel.widthInput.disabled = !editableSize;
    this.sizePanel.depthLabel.disabled = !editableSize;
    this.sizePanel.depthInput.disabled = !editableSize;
    this.sizePanel.heightLabel.disabled = !editableSize;
    this.sizePanel.heightInput.disabled = !editableSize;
    this.sizePanel.keepProportionsCheckBox.disabled = !editableSize || !this.controller.isDeformable();
  };

  /**
   * @private
   */
  HomeFurnitureDialog.prototype.initShininessPanel = function() {
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
            var selectedRadioButton = dialog.findElement("[name='shininess-radio']:checked");
            controller.setShininess(HomeFurnitureController.FurnitureShininess[selectedRadioButton.value]);
          });
      this.registerPropertyChangeListener(controller, "SHININESS", function(ev) {
          dialog.updateShininessRadioButtons(controller);
        });
      
      this.updateShininessRadioButtons(controller);
    }
  };

  /**
   * @private
   */
  HomeFurnitureDialog.prototype.updateShininessRadioButtons = function() {
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

  /**
   * @private
   */
  HomeFurnitureDialog.prototype.displayModelTransformationsView = function(preferences, controller) {
    var view = controller.getView();
    var html = 
      '<div data-name="label-panel">' +
      '  <span>@{ModelTransformationsPanel.transformationsLabel.text}</span><br/>' +
      '</div>' +
      '<div data-name="preview-panel">' +
      '  <canvas id="model-preview-canvas"></canvas>' +
      '</div>' + 
      '<div data-name="edit-panel">' +
      '  <div>' +
      '    <button name="reset-transformations-button">@{ModelTransformationsPanel.resetTransformationsButton.text}</button>' +
      '    <button name="view-from-front-button">@{ModelTransformationsPanel.viewFromFrontButton.text}</button>' +
      '    <button name="view-from-side-button">@{ModelTransformationsPanel.viewFromSideButton.text}</button>' +
      '    <button name="view-from-top-button">@{ModelTransformationsPanel.viewFromTopButton.text}</button>' +
      '  </div>' +
      '</div>';
    var dialog = new JSDialog(preferences, 
        preferences.getLocalizedString("ModelTransformationsPanel", "modelTransformations.title"),
        html, 
        {
          size: "medium",
          applier: function() {
            var modelX = dialog.previewComponent.getModelX();
            var modelY = dialog.previewComponent.getModelY();
            var pieceX = (controller.getX()
                + modelX * Math.cos(controller.getAngle()) - modelY * Math.sin(controller.getAngle()));
            var pieceY = (controller.getY()
                + modelX * Math.sin(controller.getAngle()) + modelY * Math.cos(controller.getAngle()));
            var pieceElevation = controller.getElevation()
                + dialog.previewComponent.getModelElevation() + controller.getHeight() / 2;
            var modelTransformations = dialog.previewComponent.getModelTransformations();
            controller.setModelTransformations(modelTransformations !== null ? modelTransformations : [],
                pieceX, pieceY, pieceElevation,
                dialog.previewComponent.getModelWidth(),
                dialog.previewComponent.getModelDepth(),
                dialog.previewComponent.getModelHeight());
          },
          disposer: function() {            
          }
        });

    dialog.getHTMLElement().classList.add("model-transformations-chooser-dialog");

    var previewCanvas = dialog.findElement("#model-preview-canvas");
    previewCanvas.width = 350;
    previewCanvas.height = 350;
    
    var modelMaterialsController = controller.getModelMaterialsController();
    dialog.previewComponent = new ModelPreviewComponent(previewCanvas, true, true);
    dialog.previewComponent.setModel(modelMaterialsController.getModel(), modelMaterialsController.getModelFlags(), modelMaterialsController.getModelRotation(),
        modelMaterialsController.getModelWidth(), modelMaterialsController.getModelDepth(), modelMaterialsController.getModelHeight());
    dialog.previewComponent.setModelMaterials(modelMaterialsController.getMaterials());
    dialog.previewComponent.setModelTransformations(controller.getModelTransformations());
    
    var resetTransformationsButton = dialog.getElement("reset-transformations-button");
    dialog.registerEventListener(resetTransformationsButton, "click", function(ev) {
        dialog.previewComponent.resetModelTransformations();
      });
    var viewFromFrontButton = dialog.getElement("view-from-front-button");
    dialog.registerEventListener(viewFromFrontButton, "click", function(ev) {
        dialog.previewComponent.setViewYaw(0);
        dialog.previewComponent.setViewPitch(0);
      });
    var viewFromSideButton = dialog.getElement("view-from-side-button");
    dialog.registerEventListener(viewFromSideButton, "click", function(ev) {
        dialog.previewComponent.setViewYaw(Math.PI / 2);
        dialog.previewComponent.setViewPitch(0);
      });
    var viewFromTopButton = dialog.getElement("view-from-top-button");
    dialog.registerEventListener(viewFromTopButton, "click", function(ev) {
        dialog.previewComponent.setViewYaw(0);
        dialog.previewComponent.setViewPitch(-Math.PI / 2);
      });

    dialog.displayView();
  };

  return new HomeFurnitureDialog();
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

    dialog.registerPropertyChangeListener(controller, "X_START", function(ev) {
        xStartInput.setValue(ev.getNewValue());
      });
    dialog.registerPropertyChangeListener(controller, "Y_START", function(ev) {
        yStartInput.setValue(ev.getNewValue());
      });
    dialog.registerPropertyChangeListener(controller, "X_END", function(ev) {
        xEndInput.setValue(ev.getNewValue());
      });
    dialog.registerPropertyChangeListener(controller, "Y_END", function(ev) {
        yEndInput.setValue(ev.getNewValue());
      });
    dialog.registerPropertyChangeListener(controller, "DISTANCE_TO_END_POINT", function(ev) {
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
            },
            disposer: function() {
              view.dispose();
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
    var leftSideColorRadioButton = dialog.findElement("[name='left-side-color-and-texture-choice'][value='COLORED']");
    var leftSideTextureRadioButton = dialog.findElement("[name='left-side-color-and-texture-choice'][value='TEXTURED']");
    var rightSideColorRadioButton = dialog.findElement("[name='right-side-color-and-texture-choice'][value='COLORED']");
    var rightSideTextureRadioButton = dialog.findElement("[name='right-side-color-and-texture-choice'][value='TEXTURED']");

    var updateLeftSidePaint = function() {
      leftSideColorRadioButton.checked = controller.getLeftSidePaint() == WallController.WallPaint.COLORED;
      leftSideTextureRadioButton.checked = controller.getLeftSidePaint() == WallController.WallPaint.TEXTURED;
    }
    var updateRightSidePaint = function() {
      rightSideColorRadioButton.checked = controller.getRightSidePaint() == WallController.WallPaint.COLORED;
      rightSideTextureRadioButton.checked = controller.getRightSidePaint() == WallController.WallPaint.TEXTURED;
    }

    updateLeftSidePaint();
    updateRightSidePaint();
    dialog.registerPropertyChangeListener(controller, "LEFT_SIDE_PAINT", function() {
        updateLeftSidePaint();
      });
    dialog.registerPropertyChangeListener(controller, "RIGHT_SIDE_PAINT", function() {
        updateRightSidePaint();
      });

    // Colors
    dialog.leftSideColorButton = new ColorButton(preferences,  
        {
          colorChanged: function(selectedColor) {
              dialog.findElement("[name='left-side-color-and-texture-choice'][value='COLORED']").checked = true;
              controller.setLeftSidePaint(WallController.WallPaint.COLORED);
              controller.setLeftSideColor(selectedColor);
            }
        });
    dialog.rightSideColorButton = new ColorButton(preferences,  
        {
          colorChanged: function(selectedColor) {
            dialog.findElement("[name='right-side-color-and-texture-choice'][value='COLORED']").checked = true;
            controller.setRightSidePaint(WallController.WallPaint.COLORED);
            controller.setRightSideColor(selectedColor);
          }
        });
    dialog.attachChildComponent("left-side-color-button", dialog.leftSideColorButton);
    dialog.attachChildComponent("right-side-color-button", dialog.rightSideColorButton);

    dialog.leftSideColorButton.setColor(controller.getLeftSideColor());
    dialog.leftSideColorButton.setColorDialogTitle(preferences.getLocalizedString(
        "WallPanel", "leftSideColorDialog.title"));
    dialog.rightSideColorButton.setColor(controller.getRightSideColor());
    dialog.rightSideColorButton.setColorDialogTitle(preferences.getLocalizedString(
        "WallPanel", "rightSideColorDialog.title"));
    dialog.registerPropertyChangeListener(controller, "LEFT_SIDE_COLOR", function() {
        dialog.leftSideColorButton.setColor(controller.getLeftSideColor());
      });
    dialog.registerPropertyChangeListener(controller, "RIGHT_SIDE_COLOR", function() {
        dialog.rightSideColorButton.setColor(controller.getRightSideColor());
      });

    // Textures
    dialog.leftSideTextureComponent = controller.getLeftSideTextureController().getView();
    dialog.attachChildComponent('left-side-texture-component', dialog.leftSideTextureComponent);

    dialog.rightSideTextureComponent = controller.getRightSideTextureController().getView();
    dialog.attachChildComponent("right-side-texture-component", dialog.rightSideTextureComponent);

    // shininess
    var leftSideMattRadioButton = dialog.findElement("[name='left-side-shininess-choice'][value='0']");
    var leftSideShinyRadioButton = dialog.findElement("[name='left-side-shininess-choice'][value='0.25']");
    var rightSideMattRadioButton = dialog.findElement("[name='right-side-shininess-choice'][value='0']");
    var rightSideShinyRadioButton = dialog.findElement("[name='right-side-shininess-choice'][value='0.25']");

    var updateLeftSideShininess = function() {
      leftSideMattRadioButton.checked = controller.getLeftSideShininess() == 0;
      leftSideShinyRadioButton.checked = controller.getLeftSideShininess() == 0.25;
    }
    var updateRightSideShininess = function() {
      rightSideMattRadioButton.checked = controller.getRightSideShininess() == 0;
      rightSideShinyRadioButton.checked = controller.getRightSideShininess() == 0.25
    }

    updateLeftSideShininess();
    updateRightSideShininess();
    dialog.registerPropertyChangeListener(controller, "LEFT_SIDE_SHININESS", function(ev) {
        updateLeftSideShininess();
      });
    dialog.registerPropertyChangeListener(controller, "RIGHT_SIDE_SHININESS", function(ev) {
        updateRightSideShininess();
      });
    dialog.registerEventListener([leftSideMattRadioButton, leftSideShinyRadioButton], "change", 
        function(ev) {
          controller.setLeftSideShininess(parseFloat(this.value));
        });
    dialog.registerEventListener([rightSideMattRadioButton, rightSideShinyRadioButton], "change", 
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
      var patternSelect = dialog.getElement("pattern-select");
      patternSelect.classList.add("wall-pattern-combo-box");
      var patternComboBox = new JSComboBox(this.preferences, patternSelect, 
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
  
      var patternChangeListener = function() {
          var pattern = controller.getPattern();
          patternComboBox.setSelectedItem(controller.getPattern() != null
              ? pattern.getImage().getURL()
              : null);
        };
      patternChangeListener();
      dialog.registerPropertyChangeListener(controller, "PATTERN", function(ev) {
          patternChangeListener();
        });
  
      var topDefaultColorRadioButton = dialog.findElement("[name='top-color-choice'][value='DEFAULT']");
      var topColorRadioButton = dialog.findElement("[name='top-color-choice'][value='COLORED']");
      var topPaintRadioButtons = [topDefaultColorRadioButton, topColorRadioButton];
      var topPaintChangeListener = function() {
          topDefaultColorRadioButton.checked = controller.getTopPaint() == WallController.WallPaint.DEFAULT;
          topColorRadioButton.checked = controller.getTopPaint() == WallController.WallPaint.COLORED;
        };
  
      dialog.registerEventListener(topPaintRadioButtons, "click", function(ev) {
          controller.setTopPaint(WallController.WallPaint[this.value]);
        });
      topPaintChangeListener();
      dialog.registerPropertyChangeListener(controller, "TOP_PAINT", function(ev) {
          topPaintChangeListener();
        });
  
      dialog.topColorButton = new ColorButton(preferences, 
          {
            colorChanged: function(selectedColor) {
              topColorRadioButton.checked = true;
              controller.setTopPaint(WallController.WallPaint.COLORED);
              controller.setTopColor(selectedColor);
            }
          });
      dialog.attachChildComponent("top-color-button", dialog.topColorButton);
      dialog.topColorButton.setColor(controller.getTopColor());
      dialog.topColorButton.setColorDialogTitle(preferences.getLocalizedString(
          "WallPanel", "topColorDialog.title"));
      dialog.registerPropertyChangeListener(controller, "TOP_COLOR", function() {
          dialog.topColorButton.setColor(controller.getTopColor());
        });
    };

  var initHeightPanel = function(dialog) {
      var unitName = preferences.getLengthUnit().getName();
      dialog.getElement("rectangular-wall-height-label").textContent = dialog.getLocalizedLabelText("WallPanel", "rectangularWallHeightLabel.text", unitName);
  
      var rectangularWallRadioButton = dialog.findElement("[name='wall-shape-choice'][value='RECTANGULAR_WALL']");
      var slopingWallRadioButton = dialog.findElement("[name='wall-shape-choice'][value='SLOPING_WALL']");
  
      dialog.registerEventListener([rectangularWallRadioButton, slopingWallRadioButton], "change", function(ev) {
          controller.setShape(WallController.WallShape[this.value]);
        });
      var wallShapeChangeListener = function() {
          rectangularWallRadioButton.checked = controller.getShape() == WallController.WallShape.RECTANGULAR_WALL;
          slopingWallRadioButton.checked = controller.getShape() == WallController.WallShape.SLOPING_WALL;
        };
      wallShapeChangeListener();
      dialog.registerPropertyChangeListener(controller, "SHAPE", function(ev) {
          wallShapeChangeListener();
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
      dialog.registerPropertyChangeListener(controller, "RECTANGULAR_WALL_HEIGHT", function(ev) {
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
      dialog.registerPropertyChangeListener(controller, "SLOPING_WALL_HEIGHT_AT_START", function(ev) {
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
            minimum: minimumHeight,
            maximum: maximumLength,
            stepSize: preferences.getLengthUnit().getStepSize()
          });
      dialog.registerPropertyChangeListener(controller, "SLOPING_WALL_HEIGHT_AT_END", function(ev) {
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
      dialog.registerPropertyChangeListener(controller, "THICKNESS", function(ev) {
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
      var arcExtentChangeListener = function() {
          arcExtentInput.setValue(controller.getArcExtentInDegrees());
        };
      arcExtentChangeListener();
      dialog.registerPropertyChangeListener(controller, "ARC_EXTENT_IN_DEGREES", function(ev) {
          arcExtentChangeListener();
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
          dialog.leftSideColorButton.dispose();
          dialog.rightSideColorButton.dispose();
          dialog.leftSideTextureComponent.dispose();
          dialog.rightSideTextureComponent.dispose();
          dialog.topColorButton.dispose();
        },
        size: "medium"
      });
  
  initStartAndEndPointsPanel(dialog);
  initLeftAndRightSidesPanels(dialog);
  initTopPanel(dialog);
  initHeightPanel(dialog);

  dialog.getElement("wall-orientation-label").innerHTML = dialog.getLocalizedLabelText(
      "WallPanel", "wallOrientationLabel.text", ZIPTools.getScriptFolder() + "/resources/wallOrientation.png");

  var setVisible = function(element, visible, parent) {
      if (element != null) {
        if (parent) {
          element = element.parentElement;
        }
        element.style.display = visible ? "" : "none";
        element.previousElementSibling.style.display = visible ? "" : "none";
        if (parent) {
          element.nextElementSibling.style.display = visible ? "" : "none";
        }
      }
    };

  var editablePointsListener = function() {
      setVisible(dialog.getElement("x-start-input"), controller.isEditablePoints(), true);
      setVisible(dialog.getElement("x-end-input"), controller.isEditablePoints(), true);
      setVisible(dialog.getElement("distance-to-end-point-input"), controller.isEditablePoints());
      setVisible(dialog.getElement("arc-extent-input"), controller.isEditablePoints());
    };
  dialog.registerPropertyChangeListener(controller, "EDITABLE_POINTS", editablePointsListener);
  editablePointsListener(controller.isEditablePoints());
  
  return dialog;
}

/**
 * @param {UserPreferences} preferences
 * @param {RoomController} controller
 * @return {JSDialog}
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
      dialog.registerPropertyChangeListener(controller, "FLOOR_VISIBLE", function(ev) {
          dialog.floorVisibleCheckBox.checked = controller.getFloorVisible(ev);
        });
  
      // FLOOR_PAINT
      var floorColorRadioButton = dialog.findElement("[name='floor-color-and-texture-choice'][value='COLORED']");
      dialog.floorColorButton = new ColorButton(preferences, 
          {
            colorChanged: function(selectedColor) {
              floorColorRadioButton.checked = true;
              controller.setFloorPaint(RoomController.RoomPaint.COLORED);
              controller.setFloorColor(selectedColor);
            }
          });
      dialog.attachChildComponent("floor-color-button", dialog.floorColorButton);
      dialog.floorColorButton.setColor(controller.getFloorColor());
      dialog.floorColorButton.setColorDialogTitle(preferences.getLocalizedString(
          "RoomPanel", "floorColorDialog.title"));
  
      var floorTextureRadioButton = dialog.findElement("[name='floor-color-and-texture-choice'][value='TEXTURED']");
      dialog.floorTextureComponent = controller.getFloorTextureController().getView();
      dialog.attachChildComponent("floor-texture-component", dialog.floorTextureComponent);
  
      dialog.registerEventListener([floorColorRadioButton, floorTextureRadioButton], "change", function(ev) {
          controller.setFloorPaint(RoomController.RoomPaint[this.value]);
        });
  
      var paintChangeListener = function() {
          floorColorRadioButton.checked = controller.getFloorPaint() == RoomController.RoomPaint.COLORED;
          floorTextureRadioButton.checked = controller.getFloorPaint() == RoomController.RoomPaint.TEXTURED;
        };
      dialog.registerPropertyChangeListener(controller, "FLOOR_PAINT", paintChangeListener);
  
      var floorPaintDisplay = controller.isPropertyEditable("FLOOR_PAINT") ? "initial" : "none";
      floorColorRadioButton.parentElement.parentElement.style.display = floorPaintDisplay;
      floorTextureRadioButton.parentElement.parentElement.style.display = floorPaintDisplay;
      dialog.getElement("floor-color-button").style.display = floorPaintDisplay;
      dialog.getElement("floor-texture-component").style.display = floorPaintDisplay;
  
      paintChangeListener();
      
      // FLOOR_SHININESS
      var shininessRadioButtons = dialog.findElements("[name='floor-shininess-choice']");
      dialog.registerEventListener(shininessRadioButtons, "change", function() {
        controller.setFloorShininess(parseFloat(this.value));
      });
  
      var shininessChangeListener = function() {
          for (var i = 0; i < shininessRadioButtons.length; i++) {
            shininessRadioButtons[i].checked = controller.getFloorShininess() == parseFloat(shininessRadioButtons[i].value);
          }
        };
      shininessChangeListener();
      dialog.registerPropertyChangeListener(controller, "FLOOR_SHININESS", shininessChangeListener);
  
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
      dialog.registerPropertyChangeListener(controller, "CEILING_VISIBLE", function(ev) {
          dialog.ceilingVisibleCheckBox.checked = controller.getCeilingVisible();
        });
  
      // CEILING_PAINT
      var ceilingColorRadioButton = dialog.findElement("[name='ceiling-color-and-texture-choice'][value='COLORED']");
      dialog.ceilingColorButton = new ColorButton(preferences, 
          {
            colorChanged: function(selectedColor) {
              ceilingColorRadioButton.checked = true;
              controller.setCeilingPaint(RoomController.RoomPaint.COLORED);
              controller.setCeilingColor(selectedColor);
            }
          });
      dialog.attachChildComponent("ceiling-color-button", dialog.ceilingColorButton);
      dialog.ceilingColorButton.setColor(controller.getCeilingColor());
      dialog.ceilingColorButton.setColorDialogTitle(preferences.getLocalizedString(
          "RoomPanel", "ceilingColorDialog.title"));
  
      var ceilingTextureRadioButton = dialog.findElement("[name='ceiling-color-and-texture-choice'][value='TEXTURED']");
      dialog.ceilingTextureComponent = controller.getCeilingTextureController().getView();
      dialog.attachChildComponent("ceiling-texture-component", dialog.ceilingTextureComponent);
  
      dialog.registerEventListener([ceilingColorRadioButton, ceilingTextureRadioButton], "change", function(ev) {
          controller.setCeilingPaint(RoomController.RoomPaint[this.value]);
        });
  
      var paintChangeListener = function() {
          ceilingColorRadioButton.checked = controller.getCeilingPaint() == RoomController.RoomPaint.COLORED;
          ceilingTextureRadioButton.checked = controller.getCeilingPaint() == RoomController.RoomPaint.TEXTURED;
        };
      paintChangeListener();
      dialog.registerPropertyChangeListener(controller, "CEILING_PAINT", paintChangeListener);
  
      var ceilingPaintDisplay = controller.isPropertyEditable("CEILING_PAINT") ? "initial" : "none";
      ceilingColorRadioButton.parentElement.parentElement.style.display = ceilingPaintDisplay;
      ceilingTextureRadioButton.parentElement.parentElement.style.display = ceilingPaintDisplay;
      dialog.getElement("ceiling-color-button").style.display = ceilingPaintDisplay;
      dialog.getElement("ceiling-texture-component").style.display = ceilingPaintDisplay;
  
      // CEILING_SHININESS
      var shininessRadioButtons = dialog.findElements("[name='ceiling-shininess-choice']");
      dialog.registerEventListener(shininessRadioButtons, "change", function() {
          controller.setCeilingShininess(parseFloat(this.value));
        });
  
      var shininessChangeListener = function() {
        for (var i = 0; i < shininessRadioButtons.length; i++) {
          shininessRadioButtons[i].checked = controller.getCeilingShininess() == parseFloat(shininessRadioButtons[i].value);
        }
      }
      shininessChangeListener();
      dialog.registerPropertyChangeListener(controller, "CEILING_SHININESS", shininessChangeListener);
  
      var ceilingShininessDisplay = controller.isPropertyEditable("CEILING_SHININESS") ? "initial" : "none";
      shininessRadioButtons[0].parentElement.parentElement = ceilingShininessDisplay;

      // CEILING_FLAT
      dialog.ceilingFlatCheckBox = dialog.getElement("ceiling-flat-checkbox");
      dialog.ceilingFlatCheckBox.checked = controller.getCeilingFlat();
      dialog.ceilingFlatCheckBox.parentElement.style.display = 
          controller.isPropertyEditable("CEILING_FLAT") ? "initial" : "none";
      dialog.registerEventListener(dialog.ceilingFlatCheckBox, "change", function(ev) {
          controller.setCeilingFlat(dialog.ceilingFlatCheckBox.checked);
        });
      dialog.registerPropertyChangeListener(controller, "CEILING_FLAT", function(ev) {
          dialog.ceilingFlatCheckBox.checked = controller.getCeilingFlat(ev);
        });
    };

  var selectSplitSurroundingWallsAtFirstChange = function(dialog) {
      if (dialog.firstWallChange
          && dialog.splitSurroundingWallsCheckBox != null
          && !dialog.splitSurroundingWallsCheckBox.disabled) {
        dialog.splitSurroundingWallsCheckBox.checked = true;
        var ev = document.createEvent("Event");
        ev.initEvent("change", true, true);
        dialog.splitSurroundingWallsCheckBox.dispatchEvent(ev);
        dialog.firstWallChange = false;
      }
    };

   var initWallSidesPanel = function (dialog) {
      // SPLIT_SURROUNDING_WALLS
      var splitSurroundingWallsPropertyChanged = function() {
        dialog.splitSurroundingWallsCheckBox.disabled = !controller.isSplitSurroundingWallsNeeded();
        dialog.splitSurroundingWallsCheckBox.checked = controller.isSplitSurroundingWalls();
      }
  
      var splitSurroundingWallsDisplay = controller.isPropertyEditable("SPLIT_SURROUNDING_WALLS") ? "initial" : "none";
      dialog.splitSurroundingWallsCheckBox = dialog.getElement("split-surrounding-walls-checkbox");
      dialog.splitSurroundingWallsCheckBox.parentElement.style.display = splitSurroundingWallsDisplay;
      dialog.registerEventListener(dialog.splitSurroundingWallsCheckBox, "change", function(ev) {
          controller.setSplitSurroundingWalls(dialog.splitSurroundingWallsCheckBox.checked);
          dialog.firstWallChange = false;
        });
      splitSurroundingWallsPropertyChanged();
      dialog.registerPropertyChangeListener(controller, "SPLIT_SURROUNDING_WALLS", function(ev) {
          splitSurroundingWallsPropertyChanged();
        });
  
      // WALL_SIDES_PAINT
      var wallSidesColorRadioButton = dialog.findElement("[name='wall-sides-color-and-texture-choice'][value='COLORED']");
      dialog.wallSidesColorButton = new ColorButton(preferences, 
          {
            colorChanged: function(selectedColor) {
              wallSidesColorRadioButton.checked = true;
              controller.setWallSidesPaint(RoomController.RoomPaint.COLORED);
              controller.setWallSidesColor(selectedColor);
              selectSplitSurroundingWallsAtFirstChange(dialog);
            }
          });
      dialog.attachChildComponent("wall-sides-color-button", dialog.wallSidesColorButton);
      dialog.wallSidesColorButton.setColor(controller.getWallSidesColor());
      dialog.wallSidesColorButton.setColorDialogTitle(preferences.getLocalizedString(
          "RoomPanel", "wallSidesColorDialog.title"));
  
      var wallSidesTextureRadioButton = dialog.findElement("[name='wall-sides-color-and-texture-choice'][value='TEXTURED']");
      dialog.wallSidesTextureComponent = controller.getWallSidesTextureController().getView();
      dialog.registerPropertyChangeListener(controller.getWallSidesTextureController(), "TEXTURE", function(ev) {
           selectSplitSurroundingWallsAtFirstChange(dialog);
          });
      dialog.attachChildComponent("wall-sides-texture-component", dialog.wallSidesTextureComponent);
  
      dialog.registerEventListener([wallSidesColorRadioButton, wallSidesTextureRadioButton], "change", function(ev) {
          controller.setWallSidesPaint(RoomController.RoomPaint[this.value]);
        });
  
      var paintChangeListener = function() {
          wallSidesColorRadioButton.checked = controller.getWallSidesPaint() == RoomController.RoomPaint.COLORED;
          wallSidesTextureRadioButton.checked = controller.getWallSidesPaint() == RoomController.RoomPaint.TEXTURED;
        };
      paintChangeListener();
      dialog.registerPropertyChangeListener(controller, "WALL_SIDES_PAINT", paintChangeListener);
  
      var wallSidesPaintDisplay = controller.isPropertyEditable("WALL_SIDES_PAINT") ? "initial" : "none";
      wallSidesColorRadioButton.parentElement.parentElement.style.display = wallSidesPaintDisplay;
      wallSidesTextureRadioButton.parentElement.parentElement.style.display = wallSidesPaintDisplay;
      dialog.getElement("wall-sides-color-button").style.display = wallSidesPaintDisplay;
      dialog.getElement("wall-sides-texture-component").style.display = wallSidesPaintDisplay;
  
      // WALL_SIDES_SHININESS
      var shininessRadioButtons = dialog.findElements("[name='wall-sides-shininess-choice']");
      dialog.registerEventListener(shininessRadioButtons, "change", function(ev) {
          controller.setWallSidesShininess(parseFloat(this.value));
        });
  
      var shininessChangeListener = function() {
        for (var i = 0; i < shininessRadioButtons.length; i++) {
          shininessRadioButtons[i].checked = controller.getWallSidesShininess() == parseFloat(shininessRadioButtons[i].value);
        }
      }
      shininessChangeListener();
      dialog.registerPropertyChangeListener(controller, "WALL_SIDES_SHININESS", shininessChangeListener);
  
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
      dialog.registerPropertyChangeListener(controller.getWallSidesBaseboardController(), "VISIBLE", function() {
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
          dialog.floorColorButton.dispose();
          dialog.floorTextureComponent.dispose();
          dialog.ceilingColorButton.dispose();
          dialog.ceilingTextureComponent.dispose();
          controller.getWallSidesBaseboardController().getView().dispose();
        },
      });
  
  var nameDisplay = controller.isPropertyEditable("NAME") ? "initial" : "none";
  dialog.nameInput = dialog.getElement("name-input");
  dialog.nameInput.value = controller.getName() != null ? controller.getName() : "";
  dialog.nameInput.parentElement.style.display = nameDisplay;
  dialog.registerEventListener(dialog.nameInput, "input", function(ev) {
      controller.setName(dialog.nameInput.value.trim());
    });
  dialog.registerPropertyChangeListener(controller, "NAME", function(ev) {
      dialog.nameInput.value = controller.getName() != null ? controller.getName() : "";
    });

  var areaVisiblePanelDisplay = controller.isPropertyEditable("AREA_VISIBLE") ? "initial" : "none";
  dialog.areaVisibleCheckBox = dialog.getElement("area-visible-checkbox");
  dialog.areaVisibleCheckBox.checked = controller.getAreaVisible();
  dialog.areaVisibleCheckBox.parentElement.style.display = areaVisiblePanelDisplay;
  dialog.registerEventListener(dialog.areaVisibleCheckBox, "change", function(ev) {
      controller.setAreaVisible(dialog.areaVisibleCheckBox.checked);
    });
  dialog.registerPropertyChangeListener(controller, "AREA_VISIBLE", function(ev) {
      dialog.areaVisibleCheckBox.checked = controller.getAreaVisible();
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
 
      var openStyleAtStart = new java.awt.geom.GeneralPath();
      openStyleAtStart.moveTo(15, 4);
      openStyleAtStart.lineTo(5, 8);
      openStyleAtStart.lineTo(15, 12);
      var deltaStyleAtStart = new java.awt.geom.GeneralPath();
      deltaStyleAtStart.moveTo(3, 8);
      deltaStyleAtStart.lineTo(15, 3);
      deltaStyleAtStart.lineTo(15, 13);
      deltaStyleAtStart.closePath();
      var iconWidth = 64;
      var openStyleAtEnd = new java.awt.geom.GeneralPath();
      openStyleAtEnd.moveTo(iconWidth - 14, 4);
      openStyleAtEnd.lineTo(iconWidth - 4, 8);
      openStyleAtEnd.lineTo(iconWidth - 14, 12);
      var deltaStyleAtEnd = new java.awt.geom.GeneralPath();
      deltaStyleAtEnd.moveTo(iconWidth - 2, 8);
      deltaStyleAtEnd.lineTo(iconWidth - 14, 3);
      deltaStyleAtEnd.lineTo(iconWidth - 14, 13);
      deltaStyleAtEnd.closePath();
      var comboBox = new JSComboBox(this.preferences, dialog.getElement("arrows-style-select"), 
          {
            nullable: controller.getCapStyle() == null,
            availableValues: arrowsStylesCombinations,
            renderCell: function(arrowStyle, itemElement) {
              itemElement.style.border = "none";
              itemElement.style.maxWidth = "6em";
              itemElement.style.margin = "auto";
              itemElement.style.textAlign = "center";
              
              var canvas = document.createElement("canvas");
              canvas.width = 200;
              canvas.height = 50;
              canvas.style.maxWidth = "100%";
              canvas.style.height = "1em";
              if (arrowStyle != null) {
                var g2D = new Graphics2D(canvas);
                g2D.scale(canvas.width / iconWidth, canvas.width / iconWidth);
                g2D.setStroke(new java.awt.BasicStroke(2));
                g2D.draw(new java.awt.geom.Line2D.Float(6, 8, iconWidth - 6, 8));
                switch (arrowStyle.startStyle) {
                  case Polyline.ArrowStyle.DISC :
                    g2D.fill(new java.awt.geom.Ellipse2D.Float(4, 4, 9, 9));
                    break;
                  case Polyline.ArrowStyle.OPEN :
                    g2D.draw(openStyleAtStart);
                    break;
                  case Polyline.ArrowStyle.DELTA :
                    g2D.fill(deltaStyleAtStart);
                    break;
                }
                switch (arrowStyle.endStyle) {
                  case Polyline.ArrowStyle.DISC :
                    g2D.fill(new java.awt.geom.Ellipse2D.Float(iconWidth - 12, 4, 9, 9));
                    break;
                  case Polyline.ArrowStyle.OPEN :
                    g2D.draw(openStyleAtEnd);
                    break;
                  case Polyline.ArrowStyle.DELTA :
                    g2D.fill(deltaStyleAtEnd);
                    break;
                }
                
                itemElement.appendChild(canvas);
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
      dialog.registerPropertyChangeListener(controller, "START_ARROW_STYLE", arrowStyleChangeListener);
      dialog.registerPropertyChangeListener(controller, "END_ARROW_STYLE", arrowStyleChangeListener);
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

      var joinPath = new java.awt.geom.GeneralPath();
      joinPath.moveTo(10, 10);
      joinPath.lineTo(80, 10);
      joinPath.lineTo(50, 35);
      var curvedPath = new java.awt.geom.Arc2D.Float(10, 20, 80, 20, 0, 180, java.awt.geom.Arc2D.OPEN);
      var comboBox = new JSComboBox(this.preferences, dialog.getElement("join-style-select"), 
          {
            nullable: controller.getJoinStyle() == null,
            availableValues: joinStyles,
            renderCell: function(joinStyle, itemElement) {
              itemElement.style.border = "none";
              itemElement.style.textAlign = "center";
              
              var canvas = document.createElement("canvas");
              canvas.width = 100;
              canvas.height = 40;
              canvas.style.maxWidth = "100%";
              canvas.style.height = "1em";
              if (joinStyle != null) {
                var g2D = new Graphics2D(canvas);
                g2D.setStroke(ShapeTools.getStroke(8, Polyline.CapStyle.BUTT, joinStyle, null, 0));
                if (joinStyle == Polyline.JoinStyle.CURVED) {
                  g2D.draw(curvedPath);
                } else {
                  g2D.draw(joinPath);
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
      dialog.registerPropertyChangeListener(controller, "JOIN_STYLE", joinStyleChangeListener);
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
              canvas.style.maxWidth = "100%";
              canvas.style.height = "1em";
              var dashPattern = dashStyle != null && dashStyle != Polyline.DashStyle.CUSTOMIZED 
                  ? Polyline.DashStyle._$wrappers[dashStyle].getDashPattern() 
                  : controller.getDashPattern();
              if (dashPattern != null) {
                var g2D = new Graphics2D(canvas);
                var dashOffset = controller.getDashOffset() != null ? controller.getDashOffset() : 0;
                g2D.setStroke(ShapeTools.getStroke(12, Polyline.CapStyle.BUTT, Polyline.JoinStyle.MITER,
                    dashPattern, dashOffset));
                g2D.draw(new java.awt.geom.Line2D.Float(20, canvas.height / 2, canvas.width - 60, canvas.height / 2));
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
      dialog.registerPropertyChangeListener(controller, "DASH_OFFSET", function() {
          dashOffsetInput.setValue(controller.getDashOffset() == null ? null : controller.getDashOffset() * 100);
          comboBox.updateUI();
        });
  
      var dashStyleChangeListener = function() {
          dashOffsetInput.setEnabled(controller.getDashStyle() != Polyline.DashStyle.SOLID);
          comboBox.setSelectedItem(controller.getDashStyle());
        };
      dashStyleChangeListener();
      dialog.registerPropertyChangeListener(controller, "DASH_STYLE", dashStyleChangeListener);
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
          dialog.colorButton.dispose();
        }
      });

  dialog.colorButton = new ColorButton(preferences, 
      {
        colorChanged: function(selectedColor) {
          controller.setColor(selectedColor);
        }
      });
  dialog.attachChildComponent("color-button", dialog.colorButton);
  dialog.colorButton.setColor(controller.getColor());
  dialog.colorButton.setColorDialogTitle(preferences.getLocalizedString(
      "PolylinePanel", "colorDialog.title"));

  dialog.thicknessLabelElement = dialog.getElement("thickness-label");
  dialog.thicknessLabelElement.textContent = dialog.getLocalizedLabelText(
      "PolylinePanel", "thicknessLabel.text", dialog.preferences.getLengthUnit().getName());
  
  dialog.thicknessInput = new JSSpinner(preferences, dialog.getElement("thickness-input"), 
      {
        nullable: controller.getThickness() == null,
        format: preferences.getLengthUnit().getFormat(),
        value: controller.getThickness(),
        minimum: preferences.getLengthUnit().getMinimumLength(),
        maximum: 50,
        stepSize: preferences.getLengthUnit().getStepSize()
      });
  dialog.registerPropertyChangeListener(controller, "THICKNESS", function(ev) {
      dialog.thicknessInput.setValue(controller.getThickness());
    });
  dialog.registerEventListener(dialog.thicknessInput, "input", function(ev) {
      controller.setThickness(dialog.thicknessInput.getValue());
    });

  initArrowsStyleComboBox(dialog);
  initJoinStyleComboBox(dialog);
  initDashStyleComboBox(dialog);

  dialog.visibleIn3DCheckBox = dialog.getElement("visible-in-3D-checkbox");        
  dialog.visibleIn3DCheckBox.checked = controller.isElevationEnabled() && controller.getElevation() != null;
  dialog.registerEventListener(dialog.visibleIn3DCheckBox, "change", function(ev) {
      if (dialog.visibleIn3DCheckBox.checked) {
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
  dialog.registerPropertyChangeListener(controller, "TEXT", function(ev) {
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
      var selectedAlignmentRadioButton = dialog.findElement("[name='label-alignment-radio'][value='" + TextStyle.Alignment[controller.getAlignment()] + "']");
      if (selectedAlignmentRadioButton != null) {
        selectedAlignmentRadioButton.checked = true;
      }
    };
  dialog.registerPropertyChangeListener(controller, "ALIGNMENT", alignmentChangeListener);
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
  dialog.registerPropertyChangeListener(controller, "FONT_NAME", fontNameChangeListener);
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
  dialog.registerPropertyChangeListener(controller, "FONT_SIZE", fontSizeChangeListener);
  dialog.registerEventListener(dialog.fontSizeInput, "input", function(ev) {
      controller.setFontSize(dialog.fontSizeInput.getValue());
    });
    
  // Color button bound to controller COLOR controller property
  dialog.colorButton = new ColorButton(preferences,   
      {
        colorChanged: function(selectedColor) {
          controller.setColor(dialog.colorButton.getColor());
        }
      });
  dialog.attachChildComponent("color-button", dialog.colorButton);
  dialog.colorButton.setColor(controller.getColor());
  dialog.colorButton.setColorDialogTitle(preferences
      .getLocalizedString("LabelPanel", "colorDialog.title"));
  dialog.registerPropertyChangeListener(controller, "COLOR", function() {
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
  dialog.registerPropertyChangeListener(controller, "PITCH", update3DViewComponents);
    
  dialog.visibleIn3DCheckBox = dialog.getElement("visible-in-3D-checkbox");
  dialog.visibleIn3DCheckBox.checked = 
      controller.isPitchEnabled() !== null && controller.getPitch() !== null;
  dialog.registerEventListener(dialog.visibleIn3DCheckBox, "change", function(ev) {
      if (!dialog.visibleIn3DCheckBox.checked) {
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
  dialog.registerPropertyChangeListener(controller, "ELEVATION", elevationChangeListener);
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
  function CompassDialog() {
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
  CompassDialog.prototype = Object.create(JSDialog.prototype);
  CompassDialog.prototype.constructor = CompassDialog;

  /**
   * @private
   */
  CompassDialog.prototype.initRosePanel = function() {
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
      this.registerPropertyChangeListener(this.controller, "X", function (ev) {
          xInput.setValue(controller.getX());
        });
      this.registerPropertyChangeListener(this.controller, "Y", function (ev) {
          yInput.setValue(controller.getY());
        });
      this.registerPropertyChangeListener(this.controller, "DIAMETER", function (ev) {
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
          controller.setDiameter(diameterInput.getValue());
        });
  
      var visibleCheckBox = this.getElement("visible-checkbox");
      visibleCheckBox.checked = controller.isVisible();
      this.registerEventListener(visibleCheckBox, "change", function(ev) {
          controller.setVisible(visibleCheckBox.checked);
        });
      this.registerPropertyChangeListener(controller, "VISIBLE", function(ev) {
          visibleCheckBox.checked = controller.isVisible();
        });
    };

  /**
   * @private
   */
  CompassDialog.prototype.initGeographicLocationPanel = function() {
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
      this.registerPropertyChangeListener(controller, "LATITUDE_IN_DEGREES", function(ev) {
          latitudeInput.setValue(controller.getLatitudeInDegrees());
        });
      this.registerPropertyChangeListener(controller, "LONGITUDE_IN_DEGREES", function(ev) {
          longitudeInput.setValue(controller.getLongitudeInDegrees());
        });
      this.registerPropertyChangeListener(controller, "NORTH_DIRECTION_IN_DEGREES", function(ev) {
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

  return new CompassDialog();
}

JSViewFactory.prototype.createObserverCameraView = function(preferences, controller) {
  function ObserverCameraDialog() {
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
    this.registerPropertyChangeListener(controller, "OBSERVER_CAMERA_ELEVATION_ADJUSTED", function(ev) {
        adjustObserverCameraElevationCheckBox.checked = controller.isElevationAdjusted();
      });
  }
  ObserverCameraDialog.prototype = Object.create(JSDialog.prototype);
  ObserverCameraDialog.prototype.constructor = ObserverCameraDialog;

  /**
   * @private
   */
  ObserverCameraDialog.prototype.initLocationPanel = function() {
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
    this.registerPropertyChangeListener(this.controller, "X", function (ev) {
        xInput.setValue(controller.getX());
      });
    this.registerPropertyChangeListener(this.controller, "Y", function (ev) {
        yInput.setValue(controller.getY());
      });
    this.registerPropertyChangeListener(this.controller, "ELEVATION", function (ev) {
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
  ObserverCameraDialog.prototype.initAnglesPanel = function() {
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
    this.registerPropertyChangeListener(this.controller, "YAW", function (ev) {
      yawInput.setValue(Math.toDegrees(this.controller.getYaw()));
    });
    this.registerPropertyChangeListener(this.controller, "PITCH", function (ev) {
      pitchInput.setValue(Math.toDegrees(this.controller.getPitch()));
    });
    this.registerPropertyChangeListener(this.controller, "FIELD_OF_VIEW", function (ev) {
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

  return new ObserverCameraDialog();
}

JSViewFactory.prototype.createHome3DAttributesView = function(preferences, controller) {
  function Home3DAttributesDialog() {
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
            dialog.groundPanel.colorButton.dispose();
            dialog.groundPanel.textureComponent.dispose();
            dialog.skyPanel.colorButton.dispose();
            dialog.skyPanel.textureComponent.dispose();
          }
        });
    

    this.initGroundPanel();
    this.initSkyPanel();
    this.initRenderingPanel();
  }
  Home3DAttributesDialog.prototype = Object.create(JSDialog.prototype);
  Home3DAttributesDialog.prototype.constructor = Home3DAttributesDialog;

  /**
   * @private
   */
  Home3DAttributesDialog.prototype.initGroundPanel = function() {
    var controller = this.controller;
    var dialog = this;

    var groundColorRadioButton = dialog.findElement("[name='ground-color-and-texture-choice'][value='COLORED']");
    var groundColorButton = new ColorButton(preferences,  
        {
          colorChanged: function(selectedColor) {
            groundColorRadioButton.checked = true;
            controller.setGroundPaint(Home3DAttributesController.EnvironmentPaint.COLORED);
            controller.setGroundColor(selectedColor);
          }
        });
    dialog.attachChildComponent("ground-color-button", groundColorButton);
    groundColorButton.setColor(controller.getGroundColor());
    groundColorButton.setColorDialogTitle(preferences.getLocalizedString(
        "Home3DAttributesPanel", "groundColorDialog.title"));

    var groundTextureRadioButton = dialog.findElement("[name='ground-color-and-texture-choice'][value='TEXTURED']");
    var textureComponent = controller.getGroundTextureController().getView();
    dialog.attachChildComponent("ground-texture-component", textureComponent);

    var radioButtons = [groundColorRadioButton, groundTextureRadioButton];
    dialog.registerEventListener(radioButtons, "change", function(ev) {
        if (ev.target.checked) {
          controller.setGroundPaint(Home3DAttributesController.EnvironmentPaint[ev.target.value]);
        }
      });

    var paintChangeListener = function() {
        groundColorRadioButton.checked = controller.getGroundPaint() == Home3DAttributesController.EnvironmentPaint.COLORED;
        groundTextureRadioButton.checked = controller.getGroundPaint() == Home3DAttributesController.EnvironmentPaint.TEXTURED;
      };
    paintChangeListener();
    this.registerPropertyChangeListener(controller, "GROUND_PAINT", paintChangeListener);
    this.registerPropertyChangeListener(controller, "GROUND_COLOR", function(ev) {
        groundColorButton.setColor(controller.getGroundColor());
      });

    var backgroundImageVisibleOnGround3DCheckBox = this.getElement("background-image-visible-on-ground-3D-checkbox");
    backgroundImageVisibleOnGround3DCheckBox.checked = controller.isBackgroundImageVisibleOnGround3D();
    this.registerEventListener(backgroundImageVisibleOnGround3DCheckBox, "change", function(ev) {
        controller.setBackgroundImageVisibleOnGround3D(backgroundImageVisibleOnGround3DCheckBox.checked);
      });
    this.registerPropertyChangeListener(controller, "BACKGROUND_IMAGE_VISIBLE_ON_GROUND_3D", function(ev) {
        backgroundImageVisibleOnGround3DCheckBox.checked = controller.isBackgroundImageVisibleOnGround3D();
      });

    this.groundPanel = {
        colorButton: groundColorButton,
        textureComponent: textureComponent,
      };
  };

  /**
   * @private
   */
  Home3DAttributesDialog.prototype.initSkyPanel = function() {
    var controller = this.controller;
    var dialog = this;

    var skyColorRadioButton = dialog.findElement("[name='sky-color-and-texture-choice'][value='COLORED']");
    var skyColorButton = new ColorButton(preferences,  
        {
          colorChanged: function(selectedColor) {
            skyColorRadioButton.checked = true;
            controller.setSkyPaint(Home3DAttributesController.EnvironmentPaint.COLORED);
            controller.setSkyColor(selectedColor);
          }
        });
    dialog.attachChildComponent("sky-color-button", skyColorButton);
    skyColorButton.setColor(controller.getSkyColor());
    skyColorButton.setColorDialogTitle(preferences.getLocalizedString(
        "Home3DAttributesPanel", "skyColorDialog.title"));

    var skyTextureRadioButton = dialog.findElement("[name='sky-color-and-texture-choice'][value='TEXTURED']");
    var textureComponent = controller.getSkyTextureController().getView();
    dialog.attachChildComponent("sky-texture-component", textureComponent);

    var radioButtons = [skyColorRadioButton, skyTextureRadioButton];
    dialog.registerEventListener(radioButtons, "change", function(ev) {
        if (ev.target.checked) {
          controller.setSkyPaint(Home3DAttributesController.EnvironmentPaint[ev.target.value]);
        }
      });

    var paintChangeListener = function() {
        skyColorRadioButton.checked = controller.getSkyPaint() == Home3DAttributesController.EnvironmentPaint.COLORED;
        skyTextureRadioButton.checked = controller.getSkyPaint() == Home3DAttributesController.EnvironmentPaint.TEXTURED;
      };
    paintChangeListener();
    this.registerPropertyChangeListener(controller, "SKY_PAINT", paintChangeListener);
    this.registerPropertyChangeListener(controller, "SKY_COLOR", function() {
        skyColorButton.setColor(controller.getSkyColor());
      });

    this.skyPanel = {
        colorButton: skyColorButton,
        textureComponent: textureComponent,
      };
  };

  /**
   * @private
   */
  Home3DAttributesDialog.prototype.initRenderingPanel = function() {
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

    this.registerPropertyChangeListener(controller, "LIGHT_COLOR", function(ev) {
        brightnessSlider.value = controller.getLightColor() & 0xFF;
      });
    this.registerPropertyChangeListener(controller, "WALLS_ALPHA", function(ev) {
        wallsTransparencySlider.value = controller.getWallsAlpha() * 255;
      });
  };

  return new Home3DAttributesDialog();
}

/**
 * Creates a texture selection component
 * @param {UserPreferences} preferences current user's preferences 
 * @param {TextureChoiceController} textureChoiceController texture choice controller
 * @return {JSComponent} 
 */
JSViewFactory.prototype.createTextureChoiceView = function(preferences, textureChoiceController) {
  return new TextureChoiceComponent(preferences, textureChoiceController);
}

JSViewFactory.prototype.createBaseboardChoiceView = function(preferences, controller) {
  function BaseboardChoiceComponent() {
    JSComponent.call(this, preferences,
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
        '  <div data-name="baseboard-color-button"></div>' +
        '' +
        '  <div>' +
        '    <label>' +
        '      <input type="radio" name="baseboard-color-and-texture-choice" value="TEXTURED">' +
        '        @{BaseboardChoiceComponent.textureRadioButton.text}' +
        '    </label>' +
        '  </div>' +
        '  <div data-name="baseboard-texture-component"></div>' +
        '' +
        '  <div class="whole-line">' +
        '    <hr/>' +
        '  </div>' +
        '' +
        '  <div data-name="height-label" class="label-cell"></div>' +
        '  <div><span data-name="height-input"></span></div>' +
        '  <div data-name="thickness-label" class="label-cell"></div>' +
        '  <div><span data-name="thickness-input"></span></div>');

    this.initComponents(controller);
  }
  BaseboardChoiceComponent.prototype = Object.create(JSComponent.prototype);
  BaseboardChoiceComponent.prototype.constructor = BaseboardChoiceComponent;
  
  BaseboardChoiceComponent.prototype.dispose = function () {
    this.colorButton.dispose();
    this.textureComponent.dispose();
    JSComponent.prototype.dispose.call(this);
  }
  
  /**
   * @private
   */
  BaseboardChoiceComponent.prototype.initComponents = function (controller) {
    var component = this;
    this.getHTMLElement().dataset["name"] = "baseboard-panel";
    this.getHTMLElement().classList.add("label-input-grid");

    // VISIBLE
    this.visibleCheckBox = this.getElement("baseboard-visible-checkbox");
    this.visibleCheckBox.checked = controller.getVisible();
    this.registerEventListener(this.visibleCheckBox, "change", function(ev) {
        controller.setVisible(component.visibleCheckBox.checked);
      });

    var visibleChanged = function() {
        var visible = controller.getVisible();
        component.visibleCheckBox.checked = visible;
        var componentsEnabled = visible !== false;
        for (var i = 0; i < component.colorAndTextureRadioButtons.length; i++) {
          component.colorAndTextureRadioButtons[i].disabled = !componentsEnabled;
        }
        component.colorButton.setEnabled(componentsEnabled);
        component.textureComponent.setEnabled(componentsEnabled);
        component.heightInput.setEnabled(componentsEnabled);
        component.thicknessInput.setEnabled(componentsEnabled);
      };
    this.registerPropertyChangeListener(controller, "VISIBLE", function(ev) {
        visibleChanged();
      });

    // PAINT
    var sameColorAsWallRadioButton = this.findElement("[name='baseboard-color-and-texture-choice'][value='sameColorAsWall']");

    var colorRadioButton = this.findElement("[name='baseboard-color-and-texture-choice'][value='COLORED']");
    this.colorButton = new ColorButton(preferences, 
        {
          colorChanged: function(selectedColor) {
            colorRadioButton.checked = true;
            controller.setPaint(BaseboardChoiceController.BaseboardPaint.COLORED);
            controller.setColor(selectedColor);
          }
        });
    this.attachChildComponent("baseboard-color-button", this.colorButton);
    this.colorButton.setColor(controller.getColor());
    this.colorButton.setColorDialogTitle(preferences.getLocalizedString(
        "BaseboardChoiceComponent", "colorDialog.title"));

    var textureRadioButton = this.findElement("[name='baseboard-color-and-texture-choice'][value='TEXTURED']");
    this.textureComponent = controller.getTextureController().getView();
    this.attachChildComponent("baseboard-texture-component", this.textureComponent);

    this.colorAndTextureRadioButtons = [sameColorAsWallRadioButton, colorRadioButton, textureRadioButton];
    this.registerEventListener(this.colorAndTextureRadioButtons, "change", function(ev) {
        if (ev.target.checked) {
          var selectedPaint = ev.target.value == "sameColorAsWall"
              ? BaseboardChoiceController.BaseboardPaint.DEFAULT
              : BaseboardChoiceController.BaseboardPaint[ev.target.value];
          controller.setPaint(selectedPaint);
        }
      });

    var paintChangeListener = function() {
        sameColorAsWallRadioButton.checked = controller.getPaint() == BaseboardChoiceController.BaseboardPaint.DEFAULT;
        colorRadioButton.checked = controller.getPaint() == BaseboardChoiceController.BaseboardPaint.COLORED;
        textureRadioButton.checked = controller.getPaint() == BaseboardChoiceController.BaseboardPaint.TEXTURED;
      };
    paintChangeListener();
    this.registerPropertyChangeListener(controller, "PAINT", paintChangeListener);

    // Height & thickness
    var unitName = preferences.getLengthUnit().getName();
    this.getElement("height-label").textContent = this.getLocalizedLabelText("BaseboardChoiceComponent", "heightLabel.text", unitName);
    this.getElement("thickness-label").textContent = this.getLocalizedLabelText("BaseboardChoiceComponent", "thicknessLabel.text", unitName);

    var minimumLength = preferences.getLengthUnit().getMinimumLength();
    this.heightInput = new JSSpinner(preferences, this.getElement("height-input"), 
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
    this.thicknessInput = new JSSpinner(preferences, this.getElement("thickness-input"), 
        {
          nullable: controller.getThickness() == null,
          format: preferences.getLengthUnit().getFormat(),
          value: controller.getThickness(),
          minimum: minimumLength,
          maximum: 2,
          stepSize: preferences.getLengthUnit().getStepSize()
        });

    this.registerPropertyChangeListener(controller, "HEIGHT", function(ev) {
        component.heightInput.setValue(ev.getNewValue());
      });
    this.registerPropertyChangeListener(controller, "MAX_HEIGHT", function(ev) {
        if (ev.getOldValue() == null
            || controller.getMaxHeight() != null
            && component.heightInput.max < controller.getMaxHeight()) {
          // Change max only if larger value to avoid taking into account intermediate max values
          // that may be fired by auto commit spinners while entering a value
          component.heightInput.max = controller.getMaxHeight();
        }
      });
    this.registerPropertyChangeListener(controller, "THICKNESS", function(ev) {
        component.thicknessInput.setValue(ev.getNewValue());
      });

    this.registerEventListener(this.heightInput, "input", function(ev) {
        controller.setHeight(component.heightInput.getValue());
      });
    this.registerEventListener(this.thicknessInput, "input", function(ev) {
        controller.setThickness(component.thicknessInput.getValue());
      });

    visibleChanged();
  }

  return new BaseboardChoiceComponent();
}

JSViewFactory.prototype.createModelMaterialsView = function(preferences, controller) {
  return new ModelMaterialsComponent(preferences, controller);
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
