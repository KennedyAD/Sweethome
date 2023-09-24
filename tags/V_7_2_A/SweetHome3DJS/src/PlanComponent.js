/*
 * PlanComponent.js
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

/**
 * Creates a new plan that displays <code>home</code>.
 * @param {string} containerOrCanvasId the ID of a HTML DIV or CANVAS
 * @param {Home} home the home to display
 * @param {UserPreferences} preferences user preferences to retrieve used unit, grid visibility...
 * @param {Object} [object3dFactory] a factory able to create 3D objects from <code>home</code> furniture.
 * The {@link Object3DFactory#createObject3D(Home, Selectable, boolean) createObject3D} of
 * this factory is expected to return an instance of {@link Object3DBranch} in current implementation.
 * @param {PlanController} controller the optional controller used to manage home items modification
 * @constructor
 * @author Emmanuel Puybaret
 * @author Renaud Pawlak
 */
function PlanComponent(containerOrCanvasId, home, preferences, object3dFactory, controller) {
  this.home = home;
  this.preferences = preferences;
  if (controller == null) {
    controller = object3dFactory;
    object3dFactory = new Object3DBranchFactory();
  }  
  this.object3dFactory = object3dFactory;
  
  var plan = this;
  this.pointerType = View.PointerType.MOUSE; 
  this.canvasNeededRepaint = false;
  this.container = document.getElementById(containerOrCanvasId);
  var computedStyle = window.getComputedStyle(this.container);
  this.font = [computedStyle.fontStyle, computedStyle.fontSize, computedStyle.fontFamily].join(' ');
  if(computedStyle.position != "absolute") {
    this.container.style.position = "relative";
  }
  if (this.container instanceof HTMLCanvasElement) {
    this.canvas = this.view = this.container; // No scrollPane
    this.canvas.width = this.canvas.clientWidth; 
    this.canvas.height = this.canvas.clientHeight;
  } else {
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("id", containerOrCanvasId + ".canvas");
    this.canvas.style.width = "100%"; // computedStyle.width;
    this.canvas.style.height = "100%"; // computedStyle.height;
    if (PlanComponent.initialBackgroundColor === undefined) {
      PlanComponent.initialBackgroundColor = computedStyle.backgroundColor;
      PlanComponent.initialForegroundColor = computedStyle.color;
    }
    this.canvas.style.backgroundColor = PlanComponent.initialBackgroundColor;  // /!\ computedStyle.backgroundColor and color may change when reseting home
    this.canvas.style.color = PlanComponent.initialForegroundColor;
    this.canvas.style.font = computedStyle.font;
    this.scrollPane = document.createElement("div");
    this.scrollPane.setAttribute("id", containerOrCanvasId + ".scrollPane");
    this.scrollPane.style.width = "100%"; // computedStyle.width;
    this.scrollPane.style.height = "100%"; // computedStyle.height;
    if (this.container.style.overflow) {
      this.scrollPane.style.overflow = this.container.style.overflow;
    } else {
      this.scrollPane.style.overflow = "scroll";
    }
    this.view = document.createElement("div");
    this.view.setAttribute("id", containerOrCanvasId + ".view");
    this.container.appendChild(this.scrollPane);
    this.container.appendChild(this.canvas);
    this.scrollPane.appendChild(this.view);
    this.canvas.style.position = "absolute";
    this.canvas.style.left = "0px";
    this.canvas.style.top = "0px";
    this.scrollPane.style.position = "absolute";
    this.scrollPane.style.left = "0px";
    this.scrollPane.style.top = "0px";
    this.scrollPane.addEventListener("scroll", function(ev) {
        plan.repaint();
      });
  }

  this.windowResizeListener = function() {
      plan.revalidate();
    };
  window.addEventListener("resize", this.windowResizeListener);
  this.tooltip = document.createElement("div");
  this.tooltip.style.position = "absolute";
  this.tooltip.style.visibility = "hidden";
  this.tooltip.style.backgroundColor = ColorTools.toRGBAStyle(this.getBackground(), 0.7);
  this.tooltip.style.borderWidth = "2px";
  this.tooltip.style.paddingLeft = "2px";
  this.tooltip.style.borderStyle = "solid";
  this.tooltip.style.whiteSpace = "nowrap";
  this.tooltip.style.borderColor = ColorTools.toRGBAStyle(this.getForeground(), 0.7);
  this.tooltip.style.font = this.font;
  this.tooltip.style.color = this.canvas.style.color;
  this.tooltip.style.zIndex = 101;
  document.body.appendChild(this.tooltip);

  this.touchOverlay = document.createElement("div");
  this.touchOverlay.classList.add("touch-overlay-timer");
  this.touchOverlay.style.position = "absolute";
  this.touchOverlay.style.top = "0px";
  this.touchOverlay.style.left = "0px";
  this.touchOverlay.innerHTML = '<div id="plan-touch-overlay-timer-content" class="touch-overlay-timer-content"></div><div class="touch-overlay-timer-bg"></div><div class="touch-overlay-timer-hidder"></div><div class="touch-overlay-timer-loader1"></div><div class="touch-overlay-timer-loader2"></div>';
  document.body.appendChild(this.touchOverlay);
  for (var i = 0; i < this.touchOverlay.children.length; i++) {
    var item = this.touchOverlay.children.item(i);
    if (item.classList.contains("overlay-timer-loader1")
        || item.classList.contains("overlay-timer-loader2")) {
      item.style.borderTopColor = this.getSelectionColor();
      item.style.borderRightColor = this.getSelectionColor();
    }
    if (item.classList.contains("touch-overlay-timer-content")) {
      item.style.color = this.getForeground();
    }
    item.style.animationDuration = (PlanComponent.LONG_TOUCH_DURATION_AFTER_DELAY) + "ms";
  }

  this.resolutionScale = this.scrollPane ? PlanComponent.HIDPI_SCALE_FACTOR : 1.;
  this.selectedItemsOutlinePainted = true;
  this.backgroundPainted = true;
  this.planBoundsCacheValid = false;
  
  this.setOpaque(true);
  this.addModelListeners(home, preferences, controller);
  if (controller != null) {
    this.addMouseListeners(controller);
    this.addFocusListener(controller);
    this.addControllerListener(controller);
    this.createActions(controller);
    this.installDefaultKeyboardActions();
  }

  this.rotationCursor = PlanComponent.createCustomCursor('rotation', 'alias');
  this.elevationCursor = PlanComponent.createCustomCursor('elevation', 'row-resize');
  this.heightCursor = PlanComponent.createCustomCursor('height', 'ns-resize');
  this.powerCursor = PlanComponent.createCustomCursor('power', 'cell');
  this.resizeCursor = PlanComponent.createCustomCursor('resize', 'ew-resize');
  this.moveCursor = PlanComponent.createCustomCursor('move', 'move');
  this.panningCursor = PlanComponent.createCustomCursor('panning', 'move');
  this.duplicationCursor = 'copy';

  this.patternImagesCache = {};
  
  this.setScale(0.5);
  
  setTimeout(this.windowResizeListener);
}

PlanComponent["__interfaces"] = ["com.eteks.sweethome3d.viewcontroller.PlanView", "com.eteks.sweethome3d.viewcontroller.View", "com.eteks.sweethome3d.viewcontroller.ExportableView", "com.eteks.sweethome3d.viewcontroller.TransferableView"];

/** 
 * @private 
 */
PlanComponent.initStatics = function() {
  PlanComponent.MARGIN = 40;
  
  PlanComponent.INDICATOR_STROKE = new java.awt.BasicStroke(1.5);
  PlanComponent.POINT_STROKE = new java.awt.BasicStroke(2.0);
  
  PlanComponent.WALL_STROKE_WIDTH = 1.5;
  PlanComponent.BORDER_STROKE_WIDTH = 1.0;
  PlanComponent.ALIGNMENT_LINE_OFFSET = 25;
  
  PlanComponent.ERROR_TEXTURE_IMAGE = null;
  PlanComponent.WAIT_TEXTURE_IMAGE = null;
  
  // TODO Generic resolution support (see https://stackoverflow.com/questions/15661339/how-do-i-fix-blurry-text-in-my-html5-canvas)
  PlanComponent.HIDPI_SCALE_FACTOR = 2;

  PlanComponent.POINT_INDICATOR = new java.awt.geom.Ellipse2D.Float(-1.5, -1.5, 3, 3);
  
  PlanComponent.FURNITURE_ROTATION_INDICATOR = new java.awt.geom.GeneralPath();
  PlanComponent.FURNITURE_ROTATION_INDICATOR.append(PlanComponent.POINT_INDICATOR, false);
  PlanComponent.FURNITURE_ROTATION_INDICATOR.append(new java.awt.geom.Arc2D.Float(-8, -8, 16, 16, 45, 180, java.awt.geom.Arc2D.OPEN), false);
  PlanComponent.FURNITURE_ROTATION_INDICATOR.moveTo(2.66, -5.66);
  PlanComponent.FURNITURE_ROTATION_INDICATOR.lineTo(5.66, -5.66);
  PlanComponent.FURNITURE_ROTATION_INDICATOR.lineTo(4.0, -8.3);
  
  PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR = new java.awt.geom.GeneralPath();
  PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR.append(PlanComponent.POINT_INDICATOR, false);
  PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR.moveTo(-4.5, 0);
  PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR.lineTo(-5.2, 0);
  PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR.moveTo(-9.0, 0);
  PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR.lineTo(-10, 0);
  PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR.append(new java.awt.geom.Arc2D.Float(-12, -8, 5, 16, 200, 320, java.awt.geom.Arc2D.OPEN), false);
  PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR.moveTo(-10.0, -4.5);
  PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR.lineTo(-12.3, -2.0);
  PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR.lineTo(-12.8, -5.8);
  
  var transform = java.awt.geom.AffineTransform.getRotateInstance(-Math.PI / 2);
  transform.concatenate(java.awt.geom.AffineTransform.getScaleInstance(1, -1));
  PlanComponent.FURNITURE_ROLL_ROTATION_INDICATOR = PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR.createTransformedShape(transform);
  
  PlanComponent.ELEVATION_POINT_INDICATOR = new java.awt.geom.Rectangle2D.Float(-1.5, -1.5, 3.0, 3.0);
  
  PlanComponent.ELEVATION_INDICATOR = new java.awt.geom.GeneralPath();
  PlanComponent.ELEVATION_INDICATOR.moveTo(0, -5);
  PlanComponent.ELEVATION_INDICATOR.lineTo(0, 5);
  PlanComponent.ELEVATION_INDICATOR.moveTo(-2.5, 5);
  PlanComponent.ELEVATION_INDICATOR.lineTo(2.5, 5);
  PlanComponent.ELEVATION_INDICATOR.moveTo(-1.2, 1.5);
  PlanComponent.ELEVATION_INDICATOR.lineTo(0, 4.5);
  PlanComponent.ELEVATION_INDICATOR.lineTo(1.2, 1.5);
  
  PlanComponent.HEIGHT_POINT_INDICATOR = new java.awt.geom.Rectangle2D.Float(-1.5, -1.5, 3.0, 3.0);
  
  PlanComponent.FURNITURE_HEIGHT_INDICATOR = new java.awt.geom.GeneralPath();
  PlanComponent.FURNITURE_HEIGHT_INDICATOR.moveTo(0, -6);
  PlanComponent.FURNITURE_HEIGHT_INDICATOR.lineTo(0, 6);
  PlanComponent.FURNITURE_HEIGHT_INDICATOR.moveTo(-2.5, -6);
  PlanComponent.FURNITURE_HEIGHT_INDICATOR.lineTo(2.5, -6);
  PlanComponent.FURNITURE_HEIGHT_INDICATOR.moveTo(-2.5, 6);
  PlanComponent.FURNITURE_HEIGHT_INDICATOR.lineTo(2.5, 6);
  PlanComponent.FURNITURE_HEIGHT_INDICATOR.moveTo(-1.2, -2.5);
  PlanComponent.FURNITURE_HEIGHT_INDICATOR.lineTo(0.0, -5.5);
  PlanComponent.FURNITURE_HEIGHT_INDICATOR.lineTo(1.2, -2.5);
  PlanComponent.FURNITURE_HEIGHT_INDICATOR.moveTo(-1.2, 2.5);
  PlanComponent.FURNITURE_HEIGHT_INDICATOR.lineTo(0.0, 5.5);
  PlanComponent.FURNITURE_HEIGHT_INDICATOR.lineTo(1.2, 2.5);
  
  PlanComponent.LIGHT_POWER_POINT_INDICATOR = new java.awt.geom.Rectangle2D.Float(-1.5, -1.5, 3.0, 3.0);
  
  PlanComponent.LIGHT_POWER_INDICATOR = new java.awt.geom.GeneralPath();
  PlanComponent.LIGHT_POWER_INDICATOR.moveTo(-8, 0);
  PlanComponent.LIGHT_POWER_INDICATOR.lineTo(-6.0, 0);
  PlanComponent.LIGHT_POWER_INDICATOR.lineTo(-6.0, -1);
  PlanComponent.LIGHT_POWER_INDICATOR.closePath();
  PlanComponent.LIGHT_POWER_INDICATOR.moveTo(-3, 0);
  PlanComponent.LIGHT_POWER_INDICATOR.lineTo(-1.0, 0);
  PlanComponent.LIGHT_POWER_INDICATOR.lineTo(-1.0, -2.5);
  PlanComponent.LIGHT_POWER_INDICATOR.lineTo(-3.0, -1.8);
  PlanComponent.LIGHT_POWER_INDICATOR.closePath();
  PlanComponent.LIGHT_POWER_INDICATOR.moveTo(2, 0);
  PlanComponent.LIGHT_POWER_INDICATOR.lineTo(4, 0);
  PlanComponent.LIGHT_POWER_INDICATOR.lineTo(4.0, -3.5);
  PlanComponent.LIGHT_POWER_INDICATOR.lineTo(2.0, -2.8);
  PlanComponent.LIGHT_POWER_INDICATOR.closePath();
  
  PlanComponent.FURNITURE_RESIZE_INDICATOR = new java.awt.geom.GeneralPath();
  PlanComponent.FURNITURE_RESIZE_INDICATOR.append(new java.awt.geom.Rectangle2D.Float(-1.5, -1.5, 3.0, 3.0), false);
  PlanComponent.FURNITURE_RESIZE_INDICATOR.moveTo(5, -4);
  PlanComponent.FURNITURE_RESIZE_INDICATOR.lineTo(7, -4);
  PlanComponent.FURNITURE_RESIZE_INDICATOR.lineTo(7, 7);
  PlanComponent.FURNITURE_RESIZE_INDICATOR.lineTo(-4, 7);
  PlanComponent.FURNITURE_RESIZE_INDICATOR.lineTo(-4, 5);
  PlanComponent.FURNITURE_RESIZE_INDICATOR.moveTo(3.5, 3.5);
  PlanComponent.FURNITURE_RESIZE_INDICATOR.lineTo(9, 9);
  PlanComponent.FURNITURE_RESIZE_INDICATOR.moveTo(7, 9.5);
  PlanComponent.FURNITURE_RESIZE_INDICATOR.lineTo(10, 10);
  PlanComponent.FURNITURE_RESIZE_INDICATOR.lineTo(9.5, 7);
  
  PlanComponent.WALL_ORIENTATION_INDICATOR = new java.awt.geom.GeneralPath();
  PlanComponent.WALL_ORIENTATION_INDICATOR.moveTo(-4, -4);
  PlanComponent.WALL_ORIENTATION_INDICATOR.lineTo(4, 0);
  PlanComponent.WALL_ORIENTATION_INDICATOR.lineTo(-4, 4);
  
  PlanComponent.WALL_POINT = new java.awt.geom.Ellipse2D.Float(-3, -3, 6, 6);
  
  PlanComponent.WALL_ARC_EXTENT_INDICATOR = new java.awt.geom.GeneralPath();
  PlanComponent.WALL_ARC_EXTENT_INDICATOR.append(new java.awt.geom.Arc2D.Float(-4, 1, 8, 5, 210, 120, java.awt.geom.Arc2D.OPEN), false);
  PlanComponent.WALL_ARC_EXTENT_INDICATOR.moveTo(0, 6);
  PlanComponent.WALL_ARC_EXTENT_INDICATOR.lineTo(0, 11);
  PlanComponent.WALL_ARC_EXTENT_INDICATOR.moveTo(-1.8, 8.7);
  PlanComponent.WALL_ARC_EXTENT_INDICATOR.lineTo(0, 12);
  PlanComponent.WALL_ARC_EXTENT_INDICATOR.lineTo(1.8, 8.7);
  
  PlanComponent.WALL_AND_LINE_RESIZE_INDICATOR = new java.awt.geom.GeneralPath();
  PlanComponent.WALL_AND_LINE_RESIZE_INDICATOR.moveTo(5, -2);
  PlanComponent.WALL_AND_LINE_RESIZE_INDICATOR.lineTo(5, 2);
  PlanComponent.WALL_AND_LINE_RESIZE_INDICATOR.moveTo(6, 0);
  PlanComponent.WALL_AND_LINE_RESIZE_INDICATOR.lineTo(11, 0);
  PlanComponent.WALL_AND_LINE_RESIZE_INDICATOR.moveTo(8.7, -1.8);
  PlanComponent.WALL_AND_LINE_RESIZE_INDICATOR.lineTo(12, 0);
  PlanComponent.WALL_AND_LINE_RESIZE_INDICATOR.lineTo(8.7, 1.8);
  
  transform = java.awt.geom.AffineTransform.getRotateInstance(-Math.PI / 4);
  PlanComponent.CAMERA_YAW_ROTATION_INDICATOR = PlanComponent.FURNITURE_ROTATION_INDICATOR.createTransformedShape(transform);
  
  transform = java.awt.geom.AffineTransform.getRotateInstance(Math.PI);
  PlanComponent.CAMERA_PITCH_ROTATION_INDICATOR = PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR.createTransformedShape(transform);
  
  PlanComponent.CAMERA_ELEVATION_INDICATOR = new java.awt.geom.GeneralPath();
  PlanComponent.CAMERA_ELEVATION_INDICATOR.moveTo(0, -4);
  PlanComponent.CAMERA_ELEVATION_INDICATOR.lineTo(0, 4);
  PlanComponent.CAMERA_ELEVATION_INDICATOR.moveTo(-2.5, 4);
  PlanComponent.CAMERA_ELEVATION_INDICATOR.lineTo(2.5, 4);
  PlanComponent.CAMERA_ELEVATION_INDICATOR.moveTo(-1.2, 0.5);
  PlanComponent.CAMERA_ELEVATION_INDICATOR.lineTo(0, 3.5);
  PlanComponent.CAMERA_ELEVATION_INDICATOR.lineTo(1.2, 0.5);
  
  var cameraHumanBodyAreaPath = new java.awt.geom.GeneralPath();
  cameraHumanBodyAreaPath.append(new java.awt.geom.Ellipse2D.Float(-0.5, -0.425, 1.0, 0.85), false);
  cameraHumanBodyAreaPath.append(new java.awt.geom.Ellipse2D.Float(-0.5, -0.3, 0.24, 0.6), false);
  cameraHumanBodyAreaPath.append(new java.awt.geom.Ellipse2D.Float(0.26, -0.3, 0.24, 0.6), false);
  PlanComponent.CAMERA_HUMAN_BODY = new java.awt.geom.Area(cameraHumanBodyAreaPath);
  
  var cameraHumanHeadAreaPath = new java.awt.geom.GeneralPath();
  cameraHumanHeadAreaPath.append(new java.awt.geom.Ellipse2D.Float(-0.18, -0.45, 0.36, 1.0), false);
  cameraHumanHeadAreaPath.moveTo(-0.04, 0.55);
  cameraHumanHeadAreaPath.lineTo(0, 0.65);
  cameraHumanHeadAreaPath.lineTo(0.04, 0.55);
  cameraHumanHeadAreaPath.closePath();
  PlanComponent.CAMERA_HUMAN_HEAD = new java.awt.geom.Area(cameraHumanHeadAreaPath);
  
  var cameraBodyAreaPath = new java.awt.geom.GeneralPath();
  cameraBodyAreaPath.moveTo(0.5, 0.3); 
  cameraBodyAreaPath.lineTo(0.45, 0.35);
  cameraBodyAreaPath.lineTo(0.2, 0.35);
  cameraBodyAreaPath.lineTo(0.2, 0.5);
  cameraBodyAreaPath.lineTo(-0.2, 0.5);
  cameraBodyAreaPath.lineTo(-0.2, 0.35);
  cameraBodyAreaPath.lineTo(-0.3, 0.35);
  cameraBodyAreaPath.lineTo(-0.35, 0.5);
  cameraBodyAreaPath.lineTo(-0.5, 0.3);
  cameraBodyAreaPath.lineTo(-0.5, -0.45);
  cameraBodyAreaPath.lineTo(-0.45, -0.5);
  cameraBodyAreaPath.lineTo(0.45, -0.5);
  cameraBodyAreaPath.lineTo(0.5, -0.45);
  cameraBodyAreaPath.closePath();
  PlanComponent.CAMERA_BODY = new java.awt.geom.Area(cameraBodyAreaPath);

  PlanComponent.CAMERA_BUTTON = new java.awt.geom.Ellipse2D.Float(-0.37, -0.2, 0.15, 0.32);

  PlanComponent.DIMENSION_LINE_MARK_END = new java.awt.geom.GeneralPath();
  PlanComponent.DIMENSION_LINE_MARK_END.moveTo(-5, 5);
  PlanComponent.DIMENSION_LINE_MARK_END.lineTo(5, -5);
  PlanComponent.DIMENSION_LINE_MARK_END.moveTo(0, 5);
  PlanComponent.DIMENSION_LINE_MARK_END.lineTo(0, -5);
  
  PlanComponent.VERTICAL_DIMENSION_LINE_DISC = new java.awt.geom.Ellipse2D.Float(-1.5, -1.5, 3, 3);
  PlanComponent.VERTICAL_DIMENSION_LINE = new java.awt.geom.GeneralPath();
  PlanComponent.VERTICAL_DIMENSION_LINE.append(new java.awt.geom.Ellipse2D.Float(-5, -5, 10, 10), false);

  PlanComponent.DIMENSION_LINE_HEIGHT_INDICATOR = PlanComponent.FURNITURE_HEIGHT_INDICATOR;

  PlanComponent.TEXT_LOCATION_INDICATOR = new java.awt.geom.GeneralPath();
  PlanComponent.TEXT_LOCATION_INDICATOR.append(new java.awt.geom.Arc2D.Float(-2, 0, 4, 4, 190, 160, java.awt.geom.Arc2D.CHORD), false);
  PlanComponent.TEXT_LOCATION_INDICATOR.moveTo(0, 4);
  PlanComponent.TEXT_LOCATION_INDICATOR.lineTo(0, 12);
  PlanComponent.TEXT_LOCATION_INDICATOR.moveTo(-1.2, 8.5);
  PlanComponent.TEXT_LOCATION_INDICATOR.lineTo(0.0, 11.5);
  PlanComponent.TEXT_LOCATION_INDICATOR.lineTo(1.2, 8.5);
  PlanComponent.TEXT_LOCATION_INDICATOR.moveTo(2.0, 3.0);
  PlanComponent.TEXT_LOCATION_INDICATOR.lineTo(9, 6);
  PlanComponent.TEXT_LOCATION_INDICATOR.moveTo(6, 6.5);
  PlanComponent.TEXT_LOCATION_INDICATOR.lineTo(10, 7);
  PlanComponent.TEXT_LOCATION_INDICATOR.lineTo(7.5, 3.5);
  PlanComponent.TEXT_LOCATION_INDICATOR.moveTo(-2.0, 3.0);
  PlanComponent.TEXT_LOCATION_INDICATOR.lineTo(-9, 6);
  PlanComponent.TEXT_LOCATION_INDICATOR.moveTo(-6, 6.5);
  PlanComponent.TEXT_LOCATION_INDICATOR.lineTo(-10, 7);
  PlanComponent.TEXT_LOCATION_INDICATOR.lineTo(-7.5, 3.5);
  
  PlanComponent.TEXT_ANGLE_INDICATOR = new java.awt.geom.GeneralPath();
  PlanComponent.TEXT_ANGLE_INDICATOR.append(new java.awt.geom.Arc2D.Float(-1.25, -1.25, 2.5, 2.5, 10, 160, java.awt.geom.Arc2D.CHORD), false);
  PlanComponent.TEXT_ANGLE_INDICATOR.append(new java.awt.geom.Arc2D.Float(-8, -8, 16, 16, 30, 120, java.awt.geom.Arc2D.OPEN), false);
  PlanComponent.TEXT_ANGLE_INDICATOR.moveTo(4.0, -5.2);
  PlanComponent.TEXT_ANGLE_INDICATOR.lineTo(6.9, -4.0);
  PlanComponent.TEXT_ANGLE_INDICATOR.lineTo(5.8, -7.0);
  
  PlanComponent.LABEL_CENTER_INDICATOR = new java.awt.geom.Ellipse2D.Float(-1.0, -1.0, 2, 2);
  
  PlanComponent.COMPASS_DISC = new java.awt.geom.Ellipse2D.Float(-0.5, -0.5, 1, 1);
  var stroke = new java.awt.BasicStroke(0.01);
  PlanComponent.COMPASS = new java.awt.geom.GeneralPath(stroke.createStrokedShape(PlanComponent.COMPASS_DISC));
  PlanComponent.COMPASS.append(stroke.createStrokedShape(new java.awt.geom.Line2D.Float(-0.6, 0, -0.5, 0)), false);
  PlanComponent.COMPASS.append(stroke.createStrokedShape(new java.awt.geom.Line2D.Float(0.6, 0, 0.5, 0)), false);
  PlanComponent.COMPASS.append(stroke.createStrokedShape(new java.awt.geom.Line2D.Float(0, 0.6, 0, 0.5)), false);
  stroke = new java.awt.BasicStroke(0.04, java.awt.BasicStroke.CAP_ROUND, java.awt.BasicStroke.JOIN_ROUND);
  PlanComponent.COMPASS.append(stroke.createStrokedShape(new java.awt.geom.Line2D.Float(0, 0, 0, 0)), false);
  var compassNeedle = new java.awt.geom.GeneralPath();
  compassNeedle.moveTo(0, -0.47);
  compassNeedle.lineTo(0.15, 0.46);
  compassNeedle.lineTo(0, 0.32);
  compassNeedle.lineTo(-0.15, 0.46);
  compassNeedle.closePath();
  stroke = new java.awt.BasicStroke(0.03);
  PlanComponent.COMPASS.append(stroke.createStrokedShape(compassNeedle), false);
  var compassNorthDirection = new java.awt.geom.GeneralPath();
  compassNorthDirection.moveTo(-0.07, -0.55);
  compassNorthDirection.lineTo(-0.07, -0.69);
  compassNorthDirection.lineTo(0.07, -0.56);
  compassNorthDirection.lineTo(0.07, -0.7);
  PlanComponent.COMPASS.append(stroke.createStrokedShape(compassNorthDirection), false);
  
  PlanComponent.COMPASS_ROTATION_INDICATOR = new java.awt.geom.GeneralPath();
  PlanComponent.COMPASS_ROTATION_INDICATOR.append(PlanComponent.POINT_INDICATOR, false);
  PlanComponent.COMPASS_ROTATION_INDICATOR.append(new java.awt.geom.Arc2D.Float(-8, -7, 16, 16, 210, 120, java.awt.geom.Arc2D.OPEN), false);
  PlanComponent.COMPASS_ROTATION_INDICATOR.moveTo(4.0, 5.66);
  PlanComponent.COMPASS_ROTATION_INDICATOR.lineTo(7.0, 5.66);
  PlanComponent.COMPASS_ROTATION_INDICATOR.lineTo(5.6, 8.3);
  
  transform = java.awt.geom.AffineTransform.getRotateInstance(Math.PI / 2);
  PlanComponent.DIMENSION_LINE_HEIGHT_ROTATION_INDICATOR = PlanComponent.COMPASS_ROTATION_INDICATOR.createTransformedShape(transform);

  
  PlanComponent.COMPASS_RESIZE_INDICATOR = new java.awt.geom.GeneralPath();
  PlanComponent.COMPASS_RESIZE_INDICATOR.append(new java.awt.geom.Rectangle2D.Float(-1.5, -1.5, 3.0, 3.0), false);
  PlanComponent.COMPASS_RESIZE_INDICATOR.moveTo(4, -6);
  PlanComponent.COMPASS_RESIZE_INDICATOR.lineTo(6, -6);
  PlanComponent.COMPASS_RESIZE_INDICATOR.lineTo(6, 6);
  PlanComponent.COMPASS_RESIZE_INDICATOR.lineTo(4, 6);
  PlanComponent.COMPASS_RESIZE_INDICATOR.moveTo(5, 0);
  PlanComponent.COMPASS_RESIZE_INDICATOR.lineTo(9, 0);
  PlanComponent.COMPASS_RESIZE_INDICATOR.moveTo(9, -1.5);
  PlanComponent.COMPASS_RESIZE_INDICATOR.lineTo(12, 0);
  PlanComponent.COMPASS_RESIZE_INDICATOR.lineTo(9, 1.5);
  
  PlanComponent.ARROW = new java.awt.geom.GeneralPath();
  PlanComponent.ARROW.moveTo(-5, -2);
  PlanComponent.ARROW.lineTo(0, 0);
  PlanComponent.ARROW.lineTo(-5, 2);
  
  PlanComponent.ERROR_TEXTURE_IMAGE = TextureManager.getInstance().getErrorImage();
  PlanComponent.WAIT_TEXTURE_IMAGE = TextureManager.getInstance().getWaitImage();

  PlanComponent.WEBGL_AVAILABLE = true;
  var canvas = document.createElement("canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    gl = canvas.getContext("experimental-webgl");
    if (!gl) {
      PlanComponent.WEBGL_AVAILABLE = false;
    }
  }
  
  PlanComponent.LONG_TOUCH_DELAY = 200; // ms
  PlanComponent.LONG_TOUCH_DELAY_WHEN_DRAGGING = 400; // ms
  PlanComponent.LONG_TOUCH_DURATION_AFTER_DELAY = 800; // ms
  PlanComponent.DOUBLE_TOUCH_DELAY = 500; // ms
}

PlanComponent.initStatics();

/**
 * The circumstances under which the home items displayed by this component will be painted.
 * @enum
 * @property {PlanComponent.PaintMode} PAINT
 * @property {PlanComponent.PaintMode} PRINT
 * @property {PlanComponent.PaintMode} CLIPBOARD
 * @property {PlanComponent.PaintMode} EXPORT
 */
PlanComponent.PaintMode = {};
PlanComponent.PaintMode[PlanComponent.PaintMode["PAINT"] = 0] = "PAINT";
PlanComponent.PaintMode[PlanComponent.PaintMode["PRINT"] = 1] = "PRINT";
PlanComponent.PaintMode[PlanComponent.PaintMode["CLIPBOARD"] = 2] = "CLIPBOARD";
PlanComponent.PaintMode[PlanComponent.PaintMode["EXPORT"] = 3] = "EXPORT";

/**
 * @private
 */
PlanComponent.ActionType = {};
PlanComponent.ActionType[PlanComponent.ActionType["DELETE_SELECTION"] = 0] = "DELETE_SELECTION";
PlanComponent.ActionType[PlanComponent.ActionType["ESCAPE"] = 1] = "ESCAPE";
PlanComponent.ActionType[PlanComponent.ActionType["MOVE_SELECTION_LEFT"] = 2] = "MOVE_SELECTION_LEFT";
PlanComponent.ActionType[PlanComponent.ActionType["MOVE_SELECTION_UP"] = 3] = "MOVE_SELECTION_UP";
PlanComponent.ActionType[PlanComponent.ActionType["MOVE_SELECTION_DOWN"] = 4] = "MOVE_SELECTION_DOWN";
PlanComponent.ActionType[PlanComponent.ActionType["MOVE_SELECTION_RIGHT"] = 5] = "MOVE_SELECTION_RIGHT";
PlanComponent.ActionType[PlanComponent.ActionType["MOVE_SELECTION_FAST_LEFT"] = 6] = "MOVE_SELECTION_FAST_LEFT";
PlanComponent.ActionType[PlanComponent.ActionType["MOVE_SELECTION_FAST_UP"] = 7] = "MOVE_SELECTION_FAST_UP";
PlanComponent.ActionType[PlanComponent.ActionType["MOVE_SELECTION_FAST_DOWN"] = 8] = "MOVE_SELECTION_FAST_DOWN";
PlanComponent.ActionType[PlanComponent.ActionType["MOVE_SELECTION_FAST_RIGHT"] = 9] = "MOVE_SELECTION_FAST_RIGHT";
PlanComponent.ActionType[PlanComponent.ActionType["TOGGLE_MAGNETISM_ON"] = 10] = "TOGGLE_MAGNETISM_ON";
PlanComponent.ActionType[PlanComponent.ActionType["TOGGLE_MAGNETISM_OFF"] = 11] = "TOGGLE_MAGNETISM_OFF";
PlanComponent.ActionType[PlanComponent.ActionType["ACTIVATE_ALIGNMENT"] = 12] = "ACTIVATE_ALIGNMENT";
PlanComponent.ActionType[PlanComponent.ActionType["DEACTIVATE_ALIGNMENT"] = 13] = "DEACTIVATE_ALIGNMENT";
PlanComponent.ActionType[PlanComponent.ActionType["ACTIVATE_DUPLICATION"] = 14] = "ACTIVATE_DUPLICATION";
PlanComponent.ActionType[PlanComponent.ActionType["DEACTIVATE_DUPLICATION"] = 15] = "DEACTIVATE_DUPLICATION";
PlanComponent.ActionType[PlanComponent.ActionType["ACTIVATE_EDITIION"] = 16] = "ACTIVATE_EDITIION";
PlanComponent.ActionType[PlanComponent.ActionType["DEACTIVATE_EDITIION"] = 17] = "DEACTIVATE_EDITIION";

/**
 * Indicator types that may be displayed on selected items.
 * @constructor
 */
PlanComponent.IndicatorType = function(name) {
  this.name = name;
}

/**
 * @return {string}
 */
PlanComponent.IndicatorType.prototype.name = function() {
  return this.name;
}

/**
 * @return {string}
 */
PlanComponent.IndicatorType.prototype.toString = function() {
  return this.name;
}
PlanComponent.IndicatorType.ROTATE = new PlanComponent.IndicatorType("ROTATE");
PlanComponent.IndicatorType.RESIZE = new PlanComponent.IndicatorType("RESIZE");
PlanComponent.IndicatorType.ELEVATE = new PlanComponent.IndicatorType("ELEVATE");
PlanComponent.IndicatorType.RESIZE_HEIGHT = new PlanComponent.IndicatorType("RESIZE_HEIGHT");
PlanComponent.IndicatorType.CHANGE_POWER = new PlanComponent.IndicatorType("CHANGE_POWER");
PlanComponent.IndicatorType.MOVE_TEXT = new PlanComponent.IndicatorType("MOVE_TEXT");
PlanComponent.IndicatorType.ROTATE_TEXT = new PlanComponent.IndicatorType("ROTATE_TEXT");
PlanComponent.IndicatorType.ROTATE_PITCH = new PlanComponent.IndicatorType("ROTATE_PITCH");
PlanComponent.IndicatorType.ROTATE_ROLL = new PlanComponent.IndicatorType("ROTATE_ROLL");
PlanComponent.IndicatorType.ARC_EXTENT = new PlanComponent.IndicatorType("ARC_EXTENT");

/**
 * Returns the HTML element used to view this component at screen.
 */
PlanComponent.prototype.getHTMLElement = function() {
  return this.container;
}

/**
 * Adds home items and selection listeners on this component to receive
 * changes notifications from home.
 * @param {Home} home
 * @param {UserPreferences} preferences
 * @param {PlanController} controller
 * @private
 */
PlanComponent.prototype.addModelListeners = function(home, preferences, controller) {
  var plan = this;
  var furnitureChangeListener = function(ev) {
      if (plan.furnitureTopViewIconKeys != null 
          && ("MODEL" == ev.getPropertyName() 
              || "MODEL_ROTATION" == ev.getPropertyName() 
              || "MODEL_FLAGS" == ev.getPropertyName() 
              || "MODEL_TRANSFORMATIONS" == ev.getPropertyName() 
              || "ROLL" == ev.getPropertyName() 
              || "PITCH" == ev.getPropertyName() 
              || ("WIDTH_IN_PLAN" == ev.getPropertyName() 
                  || "DEPTH_IN_PLAN" == ev.getPropertyName() 
                  || "HEIGHT_IN_PLAN" == ev.getPropertyName())
                 && (ev.getSource().isHorizontallyRotated() 
                     || ev.getSource().getTexture() != null)
              || "MODEL_MIRRORED" == ev.getPropertyName() 
                 && ev.getSource().getRoll() != 0)) {
        if ("HEIGHT_IN_PLAN" == ev.getPropertyName()) {
          plan.sortedLevelFurniture = null;
        }
        if (!(ev.getSource() instanceof HomeFurnitureGroup)) {
          if (controller == null || !controller.isModificationState()) {
            plan.removeTopViewIconFromCache(ev.getSource());
          } else {
            if (plan.invalidFurnitureTopViewIcons == null) {
              plan.invalidFurnitureTopViewIcons = [];
              var modificationStateListener = function(ev2) {
                  for (var i = 0; i < plan.invalidFurnitureTopViewIcons.length; i++) {
                    plan.removeTopViewIconFromCache(plan.invalidFurnitureTopViewIcons[i]);
                  }
                  plan.invalidFurnitureTopViewIcons = null;
                  plan.repaint();
                  controller.removePropertyChangeListener("MODIFICATION_STATE", modificationStateListener);
                };
              controller.addPropertyChangeListener("MODIFICATION_STATE", modificationStateListener);
            }
            if (plan.invalidFurnitureTopViewIcons.indexOf(ev.getSource()) < 0) {
              plan.invalidFurnitureTopViewIcons.push(ev.getSource());
            }
          }
        }
        plan.revalidate();
      } else if (plan.furnitureTopViewIconKeys != null 
                 && ("PLAN_ICON" == ev.getPropertyName() 
                     || "COLOR" == ev.getPropertyName() 
                     || "TEXTURE" == ev.getPropertyName() 
                     || "MODEL_MATERIALS" == ev.getPropertyName() 
                     || "SHININESS" == ev.getPropertyName())) {
        plan.removeTopViewIconFromCache(ev.getSource());
        plan.repaint();
      } else if ("ELEVATION" == ev.getPropertyName() 
                || "LEVEL" == ev.getPropertyName() 
                || "HEIGHT_IN_PLAN" == ev.getPropertyName()) {
        plan.sortedLevelFurniture = null;
        plan.repaint();
      } else if ("ICON" == ev.getPropertyName() 
                 || "WALL_CUT_OUT_ON_BOTH_SIDES" == ev.getPropertyName()) {
        plan.repaint();
      } else if (plan.doorOrWindowWallThicknessAreasCache != null 
                && ("WIDTH" == ev.getPropertyName() 
                    || "DEPTH" == ev.getPropertyName() 
                    || "ANGLE" == ev.getPropertyName() 
                    || "MODEL_MIRRORED" == ev.getPropertyName() 
                    || "X" == ev.getPropertyName() 
                    || "Y" == ev.getPropertyName() 
                    || "LEVEL" == ev.getPropertyName()
                    || "WALL_THICKNESS" == ev.getPropertyName()
                    || "WALL_DISTANCE" == ev.getPropertyName()
                    || "WALL_WIDTH" == ev.getPropertyName()
                    || "WALL_LEFT" == ev.getPropertyName()
                    || "CUT_OUT_SHAPE" == ev.getPropertyName())
                 && CoreTools.removeFromMap(plan.doorOrWindowWallThicknessAreasCache, ev.getSource()) != null) {
        plan.revalidate();
      } else {
        plan.revalidate();
      }
    };
  if (home.getFurniture() != null) {
    home.getFurniture().forEach(function(piece) {
        piece.addPropertyChangeListener(furnitureChangeListener);
        if (piece instanceof HomeFurnitureGroup) {
          piece.getAllFurniture().forEach(function(childPiece) {
            childPiece.addPropertyChangeListener(furnitureChangeListener);
          });
        }
      });
  }
  var furnitureChangeListenerRemover = function(piece) {
      piece.removePropertyChangeListener(furnitureChangeListener);
      plan.removeTopViewIconFromCache(piece);
      if (piece instanceof HomeDoorOrWindow
          && plan.doorOrWindowWallThicknessAreasCache != null) {
        CoreTools.removeFromMap(plan.doorOrWindowWallThicknessAreasCache, piece);
      }
    };
  home.addFurnitureListener(function(ev) {
      var piece = ev.getItem();
      if (ev.getType() === CollectionEvent.Type.ADD) {
        piece.addPropertyChangeListener(furnitureChangeListener);
        if (piece instanceof HomeFurnitureGroup) {
          piece.getAllFurniture().forEach(function(childPiece) {
              childPiece.addPropertyChangeListener(furnitureChangeListener);
            });
        }
      } else if (ev.getType() === CollectionEvent.Type.DELETE) {
        furnitureChangeListenerRemover(piece);
        if (piece instanceof HomeFurnitureGroup) {
          piece.getAllFurniture().forEach(function(childPiece) {
              furnitureChangeListenerRemover(childPiece);
            });
        }
      }
      plan.sortedLevelFurniture = null;
      plan.revalidate();
    });
  var wallChangeListener = function(ev) {
      var propertyName = ev.getPropertyName();
      if ("X_START" == propertyName 
          || "X_END" == propertyName 
          || "Y_START" == propertyName 
          || "Y_END" == propertyName 
          || "WALL_AT_START" == propertyName 
          || "WALL_AT_END" == propertyName 
          || "THICKNESS" == propertyName 
          || "ARC_EXTENT" == propertyName 
          || "PATTERN" == propertyName) {
        if (plan.home.isAllLevelsSelection()) {
          plan.otherLevelsWallAreaCache = null;
          plan.otherLevelsWallsCache = null;
        }
        plan.wallAreasCache = null;
        plan.doorOrWindowWallThicknessAreasCache = null;
        plan.revalidate();
      } else if ("LEVEL" == propertyName 
          || "HEIGHT" == propertyName 
          || "HEIGHT_AT_END" == propertyName) {
        plan.otherLevelsWallAreaCache = null;
        plan.otherLevelsWallsCache = null;
        plan.wallAreasCache = null;
        plan.repaint();
      }
    };
  if (home.getWalls() != null) {
    home.getWalls().forEach(function(wall) {
        wall.addPropertyChangeListener(wallChangeListener);
      });
  }
  home.addWallsListener(function(ev) {
      if (ev.getType() === CollectionEvent.Type.ADD) {
        ev.getItem().addPropertyChangeListener(wallChangeListener);
      } else if (ev.getType() === CollectionEvent.Type.DELETE) {
        ev.getItem().removePropertyChangeListener(wallChangeListener);
      }
      plan.otherLevelsWallAreaCache = null;
      plan.otherLevelsWallsCache = null;
      plan.wallAreasCache = null;
      plan.doorOrWindowWallThicknessAreasCache = null;
      plan.revalidate();
    });
  var roomChangeListener = function(ev) {
      var propertyName = ev.getPropertyName();
      if ("POINTS" == propertyName 
          || "NAME" == propertyName 
          || "NAME_X_OFFSET" == propertyName 
          || "NAME_Y_OFFSET" == propertyName 
          || "NAME_STYLE" == propertyName 
          || "NAME_ANGLE" == propertyName 
          || "AREA_VISIBLE" == propertyName 
          || "AREA_X_OFFSET" == propertyName 
          || "AREA_Y_OFFSET" == propertyName 
          || "AREA_STYLE" == propertyName 
          || "AREA_ANGLE" == propertyName
          || "FLOOR_VISIBLE" == propertyName
          || "CEILING_VISIBLE" == propertyName) {
        plan.sortedLevelRooms = null;
        plan.otherLevelsRoomAreaCache = null;
        plan.otherLevelsRoomsCache = null;
        plan.revalidate();
      } else if (plan.preferences.isRoomFloorColoredOrTextured() 
                 && ("FLOOR_COLOR" == propertyName 
                     || "FLOOR_TEXTURE" == propertyName 
                     || "FLOOR_VISIBLE" == propertyName)) {
        plan.repaint();
      }
    };
  if (home.getRooms() != null) {
    home.getRooms().forEach(function(room) { 
        return room.addPropertyChangeListener(roomChangeListener); 
      });
  }
  home.addRoomsListener(function(ev) {
      if (ev.getType() === CollectionEvent.Type.ADD) {
        ev.getItem().addPropertyChangeListener(roomChangeListener);
      } else if (ev.getType() === CollectionEvent.Type.DELETE) {
        ev.getItem().removePropertyChangeListener(roomChangeListener);
      }
      plan.sortedLevelRooms = null;
      plan.otherLevelsRoomAreaCache = null;
      plan.otherLevelsRoomsCache = null;
      plan.revalidate();
    });
  var changeListener = function(ev) {
      var propertyName = ev.getPropertyName();
      if ("COLOR" == propertyName
          || "DASH_STYLE" == propertyName) {
        plan.repaint();
      } else {
        plan.revalidate();
      }
    };
  if (home.getPolylines() != null) {
    home.getPolylines().forEach(function(polyline) { 
        return polyline.addPropertyChangeListener(changeListener); 
      });
  }
  home.addPolylinesListener(function(ev) {
      if (ev.getType() === CollectionEvent.Type.ADD) {
        ev.getItem().addPropertyChangeListener(changeListener);
      } else if (ev.getType() === CollectionEvent.Type.DELETE) {
        ev.getItem().removePropertyChangeListener(changeListener);
      }
      plan.revalidate();
    });
  var dimensionLineChangeListener = function(ev) { 
      var propertyName = ev.getPropertyName();
      if ("X_START" == propertyName 
          || "X_END" == propertyName 
          || "Y_START" == propertyName 
          || "Y_END" == propertyName 
          || "ELEVATION_START" == propertyName 
          || "ELEVATION_END" == propertyName 
          || "OFFSET" == propertyName 
          || "END_MARK_SIZE" == propertyName 
          || "PITCH" == propertyName 
          || "LENGTH_STYLE" == propertyName) {
        return plan.revalidate();
      } else if ("COLOR" == propertyName) {
        plan.repaint();
      }
    };
  if (home.getDimensionLines() != null) {
    home.getDimensionLines().forEach(function(dimensionLine) { 
        return dimensionLine.addPropertyChangeListener(dimensionLineChangeListener); 
      });
  }
  home.addDimensionLinesListener(function(ev) {
      if (ev.getType() === CollectionEvent.Type.ADD) {
        ev.getItem().addPropertyChangeListener(dimensionLineChangeListener);
      } else if (ev.getType() === CollectionEvent.Type.DELETE) {
        ev.getItem().removePropertyChangeListener(dimensionLineChangeListener);
      }
      plan.revalidate();
    });
  var labelChangeListener = function(ev) { 
      return plan.revalidate(); 
    };
  if (home.getLabels() != null) {
    home.getLabels().forEach(function(label) { 
        return label.addPropertyChangeListener(labelChangeListener); 
      });
  }
  home.addLabelsListener(function(ev) {
      if (ev.getType() === CollectionEvent.Type.ADD) {
        ev.getItem().addPropertyChangeListener(labelChangeListener);
      } else if (ev.getType() === CollectionEvent.Type.DELETE) {
        ev.getItem().removePropertyChangeListener(labelChangeListener);
      }
      plan.revalidate();
    });
  var levelChangeListener = function(ev) {
      var propertyName = ev.getPropertyName();
      if ("BACKGROUND_IMAGE" == propertyName) {
        plan.backgroundImageCache = null;
        plan.revalidate();
      } else if ("ELEVATION" == propertyName 
            || "ELEVATION_INDEX" == propertyName 
            || "VIEWABLE" == propertyName) {
        plan.clearLevelCache();        
        plan.repaint();
      }
    };
  if (home.getLevels() != null) {
    home.getLevels().forEach(function(level) { 
        return level.addPropertyChangeListener(levelChangeListener); 
      });
  }
  home.addLevelsListener(function(ev) {
      var level = ev.getItem();
      if (ev.getType() === CollectionEvent.Type.ADD) {
        level.addPropertyChangeListener(levelChangeListener);
      } else if (ev.getType() === CollectionEvent.Type.DELETE) {
        level.removePropertyChangeListener(levelChangeListener);
      }
      plan.revalidate();
    });
  home.addPropertyChangeListener("CAMERA", function(ev) { 
      return plan.revalidate(); 
    });
  home.getObserverCamera().addPropertyChangeListener(function(ev) {
      var propertyName = ev.getPropertyName();
      if ("X" == propertyName 
          || "Y" == propertyName 
          || "FIELD_OF_VIEW" == propertyName 
          || "YAW" == propertyName 
          || "WIDTH" == propertyName 
          || "DEPTH" == propertyName 
          || "HEIGHT" == propertyName) {
        plan.revalidate();
      }
    });
  home.getCompass().addPropertyChangeListener(function(ev) {
      var propertyName = ev.getPropertyName();
      if ("X" == propertyName 
          || "Y" == propertyName 
          || "NORTH_DIRECTION" == propertyName 
          || "DIAMETER" == propertyName 
          || "VISIBLE" == propertyName) {
        plan.revalidate();
      }
    });
  home.addSelectionListener({
      selectionChanged: function(ev) { 
        return plan.repaint(); 
      }
    });
  home.addPropertyChangeListener("BACKGROUND_IMAGE", function(ev) {
      plan.backgroundImageCache = null;
      plan.repaint();
    });
  home.addPropertyChangeListener("SELECTED_LEVEL", function(ev) {
      plan.clearLevelCache();
      plan.repaint();
    });
  
  this.preferencesListener = new PlanComponent.UserPreferencesChangeListener(this);
  preferences.addPropertyChangeListener("UNIT", this.preferencesListener);
  preferences.addPropertyChangeListener("LANGUAGE", this.preferencesListener);
  preferences.addPropertyChangeListener("GRID_VISIBLE", this.preferencesListener);
  preferences.addPropertyChangeListener("DEFAULT_FONT_NAME", this.preferencesListener);
  preferences.addPropertyChangeListener("FURNITURE_VIEWED_FROM_TOP", this.preferencesListener);
  preferences.addPropertyChangeListener("FURNITURE_MODEL_ICON_SIZE", this.preferencesListener);
  preferences.addPropertyChangeListener("ROOM_FLOOR_COLORED_OR_TEXTURED", this.preferencesListener);
  preferences.addPropertyChangeListener("WALL_PATTERN", this.preferencesListener);
}

/**
 * Preferences property listener bound to this component with a weak reference to avoid
 * strong link between preferences and this component.
 * @param {PlanComponent} planComponent
 * @constructor
 * @private
 */
PlanComponent.UserPreferencesChangeListener = function(planComponent) {
  this.planComponent = planComponent;
}

PlanComponent.UserPreferencesChangeListener.prototype.propertyChange = function(ev) {
  var planComponent = this.planComponent;
  var preferences = ev.getSource();
  var property = ev.getPropertyName();
  if (planComponent == null) {
    preferences.removePropertyChangeListener(property, this);
  } else {
    switch ((property)) {
    case "LANGUAGE":
    case "UNIT":
      if (planComponent.horizontalRuler != null) {
        planComponent.horizontalRuler.repaint();
      }
      if (planComponent.verticalRuler != null) {
        planComponent.verticalRuler.repaint();
      }
      break;
    case "DEFAULT_FONT_NAME":
      planComponent.fonts = null;
      planComponent.fontsMetrics = null;
      planComponent.revalidate();
      break;
    case "WALL_PATTERN":
      planComponent.wallAreasCache = null;
      break;
    case "FURNITURE_VIEWED_FROM_TOP":
      if (planComponent.furnitureTopViewIconKeys != null && !preferences.isFurnitureViewedFromTop()) {
        planComponent.furnitureTopViewIconKeys = null;
        planComponent.furnitureTopViewIconsCache = null;
      }
      break;
    case "FURNITURE_MODEL_ICON_SIZE":
      planComponent.furnitureTopViewIconKeys = null;
      planComponent.furnitureTopViewIconsCache = null;
      break;
    default:
      break;
    }
    planComponent.repaint();
  }
}

/**
 * Removes piece from maps handling top view icons.
 * @private 
 */
PlanComponent.prototype.removeTopViewIconFromCache = function(piece) {
  if (this.furnitureTopViewIconKeys != null) {
    // Explicitely remove deleted object from some maps since there's no WeakHashMap
    var topViewIconKey = CoreTools.removeFromMap(this.furnitureTopViewIconKeys, piece);
    if (topViewIconKey != null) {
      // Update furnitureTopViewIconsCache too if topViewIconKey isn't used anymore
      var keys = CoreTools.valuesFromMap(this.furnitureTopViewIconKeys);
      var removedKeyFound = false; 
      for (var i = 0; i < keys.length; i++) {
        if (keys [i].hashCode === topViewIconKey.hashCode // TODO Why prototype is lost? 
            && keys [i].equals(topViewIconKey)) {
          removedKeyFound = true;
        }
      }
      if (!removedKeyFound) {
        CoreTools.removeFromMap(this.furnitureTopViewIconsCache, topViewIconKey);
      }
    }
  }
}

/**
 * Clears the cached information bound to level.
 * @private 
 */
PlanComponent.prototype.clearLevelCache = function() {
  this.backgroundImageCache = null;
  this.otherLevelsWallAreaCache = null;
  this.otherLevelsWallsCache = null;
  this.otherLevelsRoomAreaCache = null;
  this.otherLevelsRoomsCache = null;
  this.wallAreasCache = null;
  this.doorOrWindowWallThicknessAreasCache = null;
  this.sortedLevelRooms = null;
  this.sortedLevelFurniture = null;
}

/** 
 * @private 
 */
PlanComponent.prototype.isEnabled = function() {
  return true;
}

PlanComponent.prototype.revalidate = function() {
  this.invalidate(true);
  this.validate();
  this.repaint();
}

/** 
 * @private 
 */
PlanComponent.prototype.invalidate = function(invalidatePlanBoundsCache) {
  if (invalidatePlanBoundsCache) {
    var planBoundsCacheWereValid = this.planBoundsCacheValid;
    if (!this.invalidPlanBounds) {
      this.invalidPlanBounds = this.getPlanBounds().getBounds2D();
    }
    if (planBoundsCacheWereValid) {
      this.planBoundsCacheValid = false;
    }
  }
}

/** 
 * @private 
 */
PlanComponent.prototype.validate = function() {
  if (this.invalidPlanBounds != null) {
    var size = this.getPreferredSize();
    if (this.isScrolled()) {
      this.view.style.width = size.width + "px";
      this.view.style.height = size.height + "px";
      if (this.canvas.width !== this.scrollPane.clientWidth * this.resolutionScale 
          || this.canvas.height !== this.scrollPane.clientHeight * this.resolutionScale) {
        this.canvas.width = this.scrollPane.clientWidth * this.resolutionScale;
        this.canvas.height = this.scrollPane.clientHeight * this.resolutionScale;
        this.canvas.style.width = this.scrollPane.clientWidth + "px";
        this.canvas.style.height = this.scrollPane.clientHeight + "px";
      }

      var planBoundsNewMinX = this.getPlanBounds().getMinX();
      var planBoundsNewMinY = this.getPlanBounds().getMinY();
      // If plan bounds upper left corner diminished
      if (planBoundsNewMinX < this.invalidPlanBounds.getMinX()
          || planBoundsNewMinY < this.invalidPlanBounds.getMinY()) {
        // Update view position when scroll bars are visible
        if (this.scrollPane.clientWidth < this.view.clientWidth
            || this.scrollPane.clientHeight < this.view.clientHeight.height) {
          var deltaX = this.convertLengthToPixel(this.invalidPlanBounds.getMinX() - planBoundsNewMinX);
          var deltaY = this.convertLengthToPixel(this.invalidPlanBounds.getMinY() - planBoundsNewMinY);
          this.scrollPane.scrollLeft += deltaX;
          this.scrollPane.scrollTop += deltaY;
        }
      }
    } else if (this.canvas.width !== this.canvas.clientWidth 
        || this.canvas.height !== this.canvas.clientHeight) {
      this.canvas.width = this.canvas.clientWidth; 
      this.canvas.height = this.canvas.clientHeight;
    }
  }
  delete this.invalidPlanBounds;
}

/** 
 * @private 
 */
PlanComponent.prototype.isScrolled = function() {
  return this.scrollPane !== undefined;
}

/**
 * Adds mouse listeners to this component that calls back <code>controller</code> methods.
 * @param {PlanController} controller
 * @private
 */
PlanComponent.prototype.addMouseListeners = function(controller) {
  var plan = this;
  var mouseListener = {
      initialPointerLocation: null,
      lastPointerLocation: null,
      touchEventType : false,
      pointerTouches : {},
      lastEventType : null,
      lastTargetTouches : [],
      distanceLastPinch: null,
      panningAfterPinch: false,
      firstTouchStartedTimeStamp: 0,
      longTouchStartTime: 0,
      autoScroll: null,
      longTouch: null,
      longTouchWhenDragged: false,
      actionStartedInPlanComponent: false,
      contextMenuEventType: false,
      mousePressed: function(ev) {
        if (!mouseListener.touchEventType
            && !mouseListener.contextMenuEventType
            && plan.isEnabled() && ev.button === 0) {
          mouseListener.updateCoordinates(ev, "mousePressed");
          mouseListener.autoScroll = null;
          mouseListener.initialPointerLocation = [ev.canvasX, ev.canvasY];
          mouseListener.lastPointerLocation = [ev.canvasX, ev.canvasY];
          mouseListener.actionStartedInPlanComponent = true;
          controller.pressMouse(plan.convertXPixelToModel(ev.canvasX), plan.convertYPixelToModel(ev.canvasY), 
              ev.clickCount, mouseListener.isShiftDown(ev), mouseListener.isAlignmentActivated(ev), 
              mouseListener.isDuplicationActivated(ev), mouseListener.isMagnetismToggled(ev));
        }
        ev.stopPropagation();
      },
      isShiftDown : function(ev) {
        return ev.shiftKey && !ev.altKey && !ev.ctrlKey && !ev.metaKey;
      }, 
      isAlignmentActivated : function(ev) {
        return OperatingSystem.isWindows() || OperatingSystem.isMacOSX() 
            ? ev.shiftKey 
            : ev.shiftKey && !ev.altKey;
      }, 
      isDuplicationActivated : function(ev) {
        return OperatingSystem.isMacOSX() 
            ? ev.altKey 
            : ev.ctrlKey;
      }, 
      isMagnetismToggled : function(ev) {
        return OperatingSystem.isWindows() 
            ? ev.altKey 
            : (OperatingSystem.isMacOSX() 
                ? ev.metaKey 
                : ev.shiftKey && ev.altKey);
      },
      mouseDoubleClicked: function(ev) {
        mouseListener.updateCoordinates(ev, "mouseDoubleClicked");
        mouseListener.mousePressed(ev);
      },
      windowMouseMoved: function(ev) {
        if (!mouseListener.touchEventType
            && !mouseListener.contextMenuEventType) {
          mouseListener.updateCoordinates(ev, "mouseMoved");
          // Handle autoscroll
          if (mouseListener.lastPointerLocation != null) {
            if (mouseListener.autoScroll == null 
                && !mouseListener.isInCanvas(ev)) {
              mouseListener.autoScroll = setInterval(function() {
                  if (mouseListener.actionStartedInPlanComponent) {
                    // Dispatch a copy of event (IE doesn't support dispatching with the same event)
                    var ev2 = document.createEvent("Event");
                    ev2.initEvent("mousemove", true, true);
                    ev2.clientX = ev.clientX;
                    ev2.clientY = ev.clientY;
                    window.dispatchEvent(ev2);
                  } else {
                    clearInterval(mouseListener.autoScroll);
                    mouseListener.autoScroll = null;
                  }
                }, 10);
            }
            if (mouseListener.autoScroll != null 
                && mouseListener.isInCanvas(ev)) {
              clearInterval(mouseListener.autoScroll);
              mouseListener.autoScroll = null;
            }
            mouseListener.lastPointerLocation = [ev.canvasX, ev.canvasY];
          }
          
          if (mouseListener.initialPointerLocation != null 
              && !(mouseListener.initialPointerLocation[0] === ev.canvasX 
                  && mouseListener.initialPointerLocation[1] === ev.canvasY)) {
            mouseListener.initialPointerLocation = null;
          }
          if (mouseListener.initialPointerLocation == null
              && (ev.buttons === 0 && mouseListener.isInCanvas(ev) 
                  || mouseListener.actionStartedInPlanComponent)) {
            if (plan.isEnabled()) { 
              controller.moveMouse(plan.convertXPixelToModel(ev.canvasX), plan.convertYPixelToModel(ev.canvasY));
            }
          }
        }
      }, 
      windowMouseReleased: function(ev) {
        if (!mouseListener.touchEventType) {
          if (mouseListener.lastPointerLocation != null) {
            // Stop autoscroll
            if (mouseListener.autoScroll != null) {
              clearInterval(mouseListener.autoScroll);
              mouseListener.autoScroll = null;
            }
            
            if (mouseListener.actionStartedInPlanComponent 
                && plan.isEnabled() && ev.button === 0) {
              if (mouseListener.contextMenuEventType) {
                controller.releaseMouse(plan.convertXPixelToModel(mouseListener.initialPointerLocation[0]), 
                    plan.convertYPixelToModel(mouseListener.initialPointerLocation[1]));
              } else {
                mouseListener.updateCoordinates(ev, "mouseReleased");
                controller.releaseMouse(plan.convertXPixelToModel(ev.canvasX), plan.convertYPixelToModel(ev.canvasY));
              }
            }
            mouseListener.initialPointerLocation = null;
            mouseListener.lastPointerLocation = null;
            mouseListener.actionStartedInPlanComponent = false;
          }
        } 
        mouseListener.contextMenuEventType = false;
      },
      pointerPressed : function(ev) {
        if (ev.pointerType == "mouse") {
          mouseListener.mousePressed(ev);
        } else {
          // Multi touch support for IE and Edge
          mouseListener.copyPointerToTargetTouches(ev, false);
          mouseListener.touchStarted(ev);
        }
      },
      pointerMousePressed : function(ev) {
        // Required to avoid click simulation
        ev.stopPropagation();
      },
      windowPointerMoved : function(ev) {
        if (ev.pointerType == "mouse") {
          mouseListener.windowMouseMoved(ev);
        } else {
          // Multi touch support for IE and Edge
          mouseListener.copyPointerToTargetTouches(ev, false) 
          mouseListener.touchMoved(ev);
        }
      },
      windowPointerReleased : function(ev) {
        if (ev.pointerType == "mouse") {
          mouseListener.windowMouseReleased(ev);
        } else {
          ev.preventDefault();
          // Multi touch support for IE and legacy Edge
          mouseListener.copyPointerToTargetTouches(ev, true);
          mouseListener.touchEnded(ev);
        }
      },
      contextMenuDisplayed : function(ev) {
        mouseListener.contextMenuEventType = true;
      },
      touchStarted: function(ev) {
        // Do not prevent default behavior to ensure focus events will be fired if focus changed after a touch event
        // but track touch event types to avoid them to be managed also for mousedown and dblclick events
        mouseListener.touchEventType = ev.pointerType === undefined;
        plan.lastTouchEndX = undefined;
        plan.lastTouchEndY = undefined;
        if (plan.isEnabled()) {
          // Prevent default behavior to ensure a second touchstart event will be received 
          // for double taps under iOS >= 15
          ev.preventDefault(); 
          if (document.activeElement != plan.container) {
            // Request focus explicitly since default behavior is disabled
            plan.container.focus();
          } 
          mouseListener.updateCoordinates(ev, "touchStarted");
          mouseListener.autoScroll = null;
          if (mouseListener.longTouch != null) {
            clearTimeout(mouseListener.longTouch);
            mouseListener.longTouch = null;
            plan.stopLongTouchAnimation();
          }

          if (ev.targetTouches.length === 1) {
            var clickCount = 1;
            if (mouseListener.initialPointerLocation != null
                && mouseListener.distance(ev.canvasX, ev.canvasY,
                    mouseListener.initialPointerLocation [0], mouseListener.initialPointerLocation [1]) < 5 
                && ev.timeStamp - mouseListener.firstTouchStartedTimeStamp <= PlanComponent.DOUBLE_TOUCH_DELAY) { 
              clickCount = 2;
              mouseListener.firstTouchStartedTimeStamp = 0;
              mouseListener.initialPointerLocation = null;
            } else {
              mouseListener.firstTouchStartedTimeStamp = ev.timeStamp;
              mouseListener.initialPointerLocation = [ev.canvasX, ev.canvasY];
            }
                
            mouseListener.distanceLastPinch = null;
            mouseListener.lastPointerLocation = [ev.canvasX, ev.canvasY];
            mouseListener.actionStartedInPlanComponent = true;
            mouseListener.longTouchWhenDragged = false;
            if (controller.getMode() !== PlanController.Mode.PANNING
                && clickCount == 1) {
              var character = controller.getMode() === PlanController.Mode.SELECTION
                  ? '&#x21EA;'
                  : (controller.getMode() === PlanController.Mode.POLYLINE_CREATION
                      && !controller.isModificationState()
                        ? 'S' : '2');
              mouseListener.longTouch = setTimeout(function() {
                plan.startLongTouchAnimation(ev.canvasX, ev.canvasY, character,
                    function() {
                      if (controller.getMode() === PlanController.Mode.SELECTION) {
                        // Simulate shift key press
                        controller.setAlignmentActivated(true);
                      } else if (controller.getMode() === PlanController.Mode.POLYLINE_CREATION) { 
                        // Enable curved or elevation dimension creation 
                        controller.setDuplicationActivated(true);
                      }
                    });
                  }, PlanComponent.LONG_TOUCH_DELAY);
              mouseListener.longTouchStartTime = Date.now();
            }
            
            controller.pressMouse(plan.convertXPixelToModel(ev.canvasX), plan.convertYPixelToModel(ev.canvasY), 
                clickCount, mouseListener.isShiftDown(ev), mouseListener.isAlignmentActivated(ev), 
                mouseListener.isDuplicationActivated(ev), mouseListener.isMagnetismToggled(ev), View.PointerType.TOUCH);
          } else {
            // Cancel autoscroll
            if (mouseListener.autoScroll != null) {
              clearInterval(mouseListener.autoScroll);
              mouseListener.autoScroll = null;
            }            
            // Additional touch allows to escape current modification 
            controller.escape();
            
            if (ev.targetTouches.length === 2) {
              mouseListener.actionStartedInPlanComponent = true;
              mouseListener.initialPointerLocation = null;
              mouseListener.distanceLastPinch = mouseListener.distance(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY, 
                  ev.targetTouches[1].clientX, ev.targetTouches[1].clientY);
            }
          }
        }
      },
      touchMoved: function(ev) {
        if (mouseListener.actionStartedInPlanComponent
            && plan.isEnabled()) {
          ev.preventDefault();
          ev.stopPropagation();
          if (mouseListener.updateCoordinates(ev, "touchMoved")) {
            plan.stopIndicatorAnimation();            

            mouseListener.initialPointerLocation = null;
            
            if (ev.targetTouches.length == 1) {
              // Handle autoscroll
              if (mouseListener.lastPointerLocation != null) {
                if (mouseListener.autoScroll != null 
                    && mouseListener.isInCanvas(ev)) {
                  clearInterval(mouseListener.autoScroll);
                  mouseListener.autoScroll = null;
                }
                if (mouseListener.autoScroll == null 
                    && !mouseListener.isInCanvas(ev)
                    && controller.getMode() !== PlanController.Mode.PANNING
                    && mouseListener.lastPointerLocation != null) {
                  mouseListener.autoScroll = setInterval(function() {
                      if (mouseListener.actionStartedInPlanComponent) {
                        mouseListener.touchMoved(ev);
                      } else {
                        clearInterval(mouseListener.autoScroll);
                        mouseListener.autoScroll = null;
                      }
                    }, 10);
                }
              }
              
              if (mouseListener.longTouch != null) {
                // Cancel long touch animation only when pointer moved during the past 200 ms
                clearTimeout(mouseListener.longTouch);
                mouseListener.longTouch = null;
                plan.stopLongTouchAnimation();
              }
              
              mouseListener.lastPointerLocation = [ev.canvasX, ev.canvasY];
              controller.moveMouse(plan.convertXPixelToModel(ev.canvasX), plan.convertYPixelToModel(ev.canvasY));
              
              if (!mouseListener.autoScroll 
                  && controller.getMode() !== PlanController.Mode.PANNING
                  && controller.getMode() !== PlanController.Mode.SELECTION) {
                mouseListener.longTouch = setTimeout(function() {
                    mouseListener.longTouchWhenDragged = true;   
                    plan.startLongTouchAnimation(ev.canvasX, ev.canvasY, '2');
                  }, PlanComponent.LONG_TOUCH_DELAY_WHEN_DRAGGING);
                mouseListener.longTouchStartTime = Date.now();
              }
            } else if (ev.targetTouches.length == 2
                && mouseListener.distanceLastPinch != null) {
              var newDistance = mouseListener.distance(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY, 
                  ev.targetTouches[1].clientX, ev.targetTouches[1].clientY);
              var scaleDifference = newDistance / mouseListener.distanceLastPinch;
              var rect = plan.canvas.getBoundingClientRect();
              var x = plan.convertXPixelToModel((ev.targetTouches[0].clientX + ev.targetTouches[1].clientX) / 2 - rect.left);
              var y = plan.convertYPixelToModel((ev.targetTouches[0].clientY + ev.targetTouches[1].clientY) / 2 - rect.top);
              var oldScale = plan.getScale();
              controller.zoom(scaleDifference);
              mouseListener.distanceLastPinch = newDistance;
              if (plan.isScrolled() 
                  && plan.getScale() !== oldScale) {
                // If scale changed, update viewport position to keep the same coordinates under mouse cursor
                plan.scrollPane.scrollLeft = 0;
                plan.scrollPane.scrollTop = 0;
                var mouseDeltaX = (ev.targetTouches[0].clientX + ev.targetTouches[1].clientX) / 2 - rect.left - plan.convertXModelToPixel(x);
                var mouseDeltaY = (ev.targetTouches[0].clientY + ev.targetTouches[1].clientY) / 2 - rect.top - plan.convertYModelToPixel(y);
                plan.moveView(-plan.convertPixelToLength(mouseDeltaX), -plan.convertPixelToLength(mouseDeltaY));
              }
            }
          }
        }
      },
      touchEnded: function(ev) {
        if (mouseListener.actionStartedInPlanComponent 
            && plan.isEnabled()) {
          mouseListener.updateCoordinates(ev, "touchEnded");

          if (mouseListener.panningAfterPinch) {
            controller.setMode(PlanController.Mode.SELECTION);
            mouseListener.panningAfterPinch = false;
          }
          
          if (ev.targetTouches.length == 0) {
            // Cancel autoscroll
            if (mouseListener.autoScroll != null) {
              clearInterval(mouseListener.autoScroll);
              mouseListener.autoScroll = null;
            }
          
            if (mouseListener.longTouch != null) {
              clearTimeout(mouseListener.longTouch);
              mouseListener.longTouch = null;
              plan.stopLongTouchAnimation();
            }
          
            var xModel = plan.convertXPixelToModel(mouseListener.lastPointerLocation [0]);
            var yModel = plan.convertYPixelToModel(mouseListener.lastPointerLocation [1]);
            controller.releaseMouse(xModel, yModel);
            if (controller.getMode() !== PlanController.Mode.SELECTION) {
              if (mouseListener.isLongTouch(true)
                  && mouseListener.longTouchWhenDragged) {
                // Emulate double click
                controller.pressMouse(xModel, yModel, 1, false, false, false, false, View.PointerType.TOUCH);
                controller.releaseMouse(xModel, yModel);
                controller.pressMouse(xModel, yModel, 2, false, false, false, false, View.PointerType.TOUCH);
                controller.releaseMouse(xModel, yModel);
              } else if (mouseListener.isLongTouch()
                  && mouseListener.initialPointerLocation != null) {
                // Emulate double click
                controller.pressMouse(xModel, yModel, 2, false, false, false, false, View.PointerType.TOUCH);
                controller.releaseMouse(xModel, yModel);
              }
            }
            
            if (mouseListener.isLongTouch()) {
              // Avoid firing contextmenu event
              ev.preventDefault();
            }
            plan.stopIndicatorAnimation();
            mouseListener.actionStartedInPlanComponent = false;
          } else if (ev.targetTouches.length == 1) {
            if (controller.getMode() === PlanController.Mode.SELECTION) {
              controller.setMode(PlanController.Mode.PANNING);
              controller.pressMouse(plan.convertXPixelToModel(ev.canvasX), 
                  plan.convertYPixelToModel(ev.canvasY), 1, false, false, false, false, View.PointerType.TOUCH);
              mouseListener.panningAfterPinch = true;
            }
          } else if (ev.targetTouches.length == 2
                     && mouseListener.distanceLastPinch != null) {
            // If the user keeps 2 finger on screen after releasing other fingers 
            mouseListener.distanceLastPinch = mouseListener.distance(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY, 
                ev.targetTouches[1].clientX, ev.targetTouches[1].clientY)
          }
          
          plan.lastTouchEndX = plan.lastTouchX;
          plan.lastTouchEndY = plan.lastTouchY; 
          plan.lastTouchX = undefined;
          plan.lastTouchY = undefined;
        }
        // Reset mouseListener.touchEventType in windowMouseReleased call
      },
      copyPointerToTargetTouches : function(ev, touchEnded) {
        // Copy the IE and Edge pointer location to ev.targetTouches or ev.changedTouches
        if (touchEnded) {
          ev.changedTouches = [mouseListener.pointerTouches [ev.pointerId]];
          delete mouseListener.pointerTouches [ev.pointerId];
        } else {
          mouseListener.pointerTouches [ev.pointerId] = {clientX : ev.clientX, clientY : ev.clientY};
        }
        ev.targetTouches = [];
        for (var attribute in mouseListener.pointerTouches) {
          if (mouseListener.pointerTouches.hasOwnProperty(attribute)) {
            ev.targetTouches.push(mouseListener.pointerTouches [attribute]);
          }
        }
      },
      updateCoordinates : function(ev, type) {
        // Updates canvasX and canvasY properties and return true if they changed
        plan.lastTouchX = undefined;
        plan.lastTouchY = undefined;
        var rect = plan.canvas.getBoundingClientRect();
        var updated = true; 
        if (type.indexOf("touch") === 0) {
          plan.pointerType = View.PointerType.TOUCH;
          var minDistance = mouseListener.lastEventType == "touchStarted"
              ? 5 : 1.5;
          var touches;
          if (ev.targetTouches.length === 1
                && type == "touchMoved" 
                && mouseListener.distance(mouseListener.lastTargetTouches [0].clientX, mouseListener.lastTargetTouches [0].clientY,
                    ev.targetTouches[0].clientX, ev.targetTouches[0].clientY) < minDistance
              || ev.targetTouches.length === 0
                     && type == "touchEnded" 
                     && mouseListener.distance(mouseListener.lastTargetTouches [0].clientX, mouseListener.lastTargetTouches [0].clientY,
                         ev.changedTouches[0].clientX, ev.changedTouches[0].clientY) < minDistance) {
            touches = mouseListener.lastTargetTouches;
            updated = false;
          } else {
            if (ev.targetTouches.length == 0) {
              // touchend case
              touches = ev.changedTouches;
            } else {
              touches = ev.targetTouches;
            }
            mouseListener.lastEventType = type;
          }
          
          if (touches.length == 1) {
            ev.canvasX = touches[0].clientX - rect.left;
            ev.canvasY = touches[0].clientY - rect.top;
            plan.lastTouchX = ev.canvasX;
            plan.lastTouchY = ev.canvasY;
          } 
          ev.clickCount = 1;

          if (updated) {
            // Make a copy of touches because old iOS reuse the same ev.targetTouches array between events
            mouseListener.lastTargetTouches = [];
            for (var i = 0; touches[i] !== undefined; i++) {
              mouseListener.lastTargetTouches.push({clientX: touches[i].clientX, clientY: touches[i].clientY});
            }
          }
        } else {
          plan.pointerType = View.PointerType.MOUSE;
          ev.canvasX = ev.clientX - rect.left;
          ev.canvasY = ev.clientY - rect.top;
        }  
        
        if (ev.clickCount === undefined) {
          if (type == "mouseDoubleClicked") {
            ev.clickCount = 2;
          } else if (type == "mousePressed" || type == "mouseReleased") {
            ev.clickCount = 1;
          } else {
            ev.clickCount = 0;
          }
        }
        if (type == "mouseWheelMoved") {
          ev.wheelRotation = (ev.deltaY !== undefined 
              ? ev.deltaX + ev.deltaY 
              : -ev.wheelDelta) / 4;
        }
        
        return updated;
      },
      isLongTouch: function(dragging) {
        return Date.now() - mouseListener.longTouchStartTime 
            > ((dragging 
                ? PlanComponent.LONG_TOUCH_DELAY_WHEN_DRAGGING 
                : PlanComponent.LONG_TOUCH_DELAY) + PlanComponent.LONG_TOUCH_DURATION_AFTER_DELAY);
      },
      distance: function(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      },
      isInCanvas: function(ev) {
        return ev.canvasX >= 0 && ev.canvasX < plan.canvas.clientWidth
            && ev.canvasY >= 0 && ev.canvasY < plan.canvas.clientHeight;
      },
      mouseWheelMoved: function(ev) {
        ev.preventDefault();
        mouseListener.updateCoordinates(ev, "mouseWheelMoved");
        var shortcutKeyPressed = OperatingSystem.isMacOSX() ? ev.metaKey : ev.ctrlKey;
        if (shortcutKeyPressed) {
          var x = plan.convertXPixelToModel(ev.canvasX);
          var y = plan.convertYPixelToModel(ev.canvasY);
          var oldScale = plan.getScale();
          controller.zoom(ev.wheelRotation < 0 
              ? Math.pow(1.05, -ev.wheelRotation) 
              : Math.pow(0.95, ev.wheelRotation));
          if (plan.isScrolled()
              && plan.getScale() !== oldScale) {
            // If scale changed, update viewport position to keep the same coordinates under mouse cursor
            plan.scrollPane.scrollLeft = 0;
            plan.scrollPane.scrollTop = 0;
            var mouseDeltaX = ev.canvasX - plan.convertXModelToPixel(x);
            var mouseDeltaY = ev.canvasY - plan.convertYModelToPixel(y);
            plan.moveView(-plan.convertPixelToLength(mouseDeltaX), -plan.convertPixelToLength(mouseDeltaY));
          }
        } else {
          plan.moveView(ev.shiftKey ? plan.convertPixelToLength(ev.wheelRotation) : 0, 
                        ev.shiftKey ? 0 : plan.convertPixelToLength(ev.wheelRotation));
        }
      }
    };
  if (OperatingSystem.isInternetExplorerOrLegacyEdge()
      && window.PointerEvent) {
    // Multi touch support for IE and Edge
    this.canvas.addEventListener("pointerdown", mouseListener.pointerPressed);
    this.canvas.addEventListener("mousedown", mouseListener.pointerMousePressed);
    this.canvas.addEventListener("dblclick", mouseListener.mouseDoubleClicked);
    // Add pointermove and pointerup event listeners to window to capture pointer events out of the canvas 
    window.addEventListener("pointermove", mouseListener.windowPointerMoved);
    window.addEventListener("pointerup", mouseListener.windowPointerReleased);
  } else {
    this.canvas.addEventListener("touchstart", mouseListener.touchStarted);
    this.canvas.addEventListener("touchmove", mouseListener.touchMoved);
    this.canvas.addEventListener("touchend", mouseListener.touchEnded);
    this.canvas.addEventListener("mousedown", mouseListener.mousePressed);
    this.canvas.addEventListener("dblclick", mouseListener.mouseDoubleClicked);
    window.addEventListener("mousemove", mouseListener.windowMouseMoved);
    window.addEventListener("mouseup", mouseListener.windowMouseReleased);
  }
  this.canvas.addEventListener("contextmenu", mouseListener.contextMenuDisplayed);
  this.canvas.addEventListener("mousewheel", mouseListener.mouseWheelMoved);
  
  this.mouseListener = mouseListener;
}

/** 
 * @private 
 */
PlanComponent.prototype.startLongTouchAnimation = function(x, y, character, animationPostTask) {
  this.touchOverlay.style.visibility = "visible";
  if (character == '&#x21EA;') {
    document.getElementById("plan-touch-overlay-timer-content").innerHTML = "<span style='font-weight: bold; font-family: sans-serif; font-size: 140%; line-height: 90%'>&#x21EA;</span>";
  } else {
    document.getElementById("plan-touch-overlay-timer-content").innerHTML = "<span style='font-weight: bold; font-family: sans-serif'>" + character + "</span>";
  }
  this.touchOverlay.style.left = (this.canvas.getBoundingClientRect().left + x - this.touchOverlay.clientWidth / 2) + "px";
  this.touchOverlay.style.top = (this.canvas.getBoundingClientRect().top + y - this.touchOverlay.clientHeight - 40) + "px";
  if (this.tooltip.style.visibility == "visible"
      && this.tooltip.getBoundingClientRect().top < this.canvas.getBoundingClientRect().top + y) {
    this.tooltip.style.marginTop = -(this.tooltip.clientHeight + 70) + "px";
  }
  for (var i = 0; i < this.touchOverlay.children.length; i++) {
    this.touchOverlay.children.item(i).classList.remove("indicator");
    this.touchOverlay.children.item(i).classList.add("animated");
  }
  if (animationPostTask !== undefined) {
    this.longTouchAnimationPostTask = setTimeout(animationPostTask, PlanComponent.LONG_TOUCH_DURATION_AFTER_DELAY);
  }
}

/** 
 * @private 
 */
PlanComponent.prototype.startIndicatorAnimation = function(x, y, indicator) {
  if (indicator == "default" || indicator == "selection") {
    this.touchOverlay.style.visibility = "hidden";
  } else {
    this.touchOverlay.style.visibility = "visible";
    document.getElementById("plan-touch-overlay-timer-content").innerHTML = '<img src="' + ZIPTools.getScriptFolder() + 'resources/cursors/' + indicator + '32x32.png"/>';
    this.touchOverlay.style.left = (this.canvas.getBoundingClientRect().left + x - this.touchOverlay.clientWidth / 2) + "px";
    this.touchOverlay.style.top = (this.canvas.getBoundingClientRect().top + y - this.touchOverlay.clientHeight - 40) + "px";
    if (this.tooltip.style.visibility == "visible" 
        && this.tooltip.getBoundingClientRect().top < this.canvas.getBoundingClientRect().top + y) {
      this.tooltip.style.marginTop = -(this.tooltip.clientHeight + 70) + "px";
    }
    for (var i = 0; i < this.touchOverlay.children.length; i++) {
      this.touchOverlay.children.item(i).classList.remove("animated");
      this.touchOverlay.children.item(i).classList.add("indicator");
    }
  }
}

/** 
 * @private 
 */
PlanComponent.prototype.stopLongTouchAnimation = function(x, y) {
  this.touchOverlay.style.visibility = "hidden";
  for (var i = 0; i < this.touchOverlay.children.length; i++) {
    this.touchOverlay.children.item(i).classList.remove("animated");
    this.touchOverlay.children.item(i).classList.remove("indicator");
  }
  if (this.longTouchAnimationPostTask !== undefined) {
    clearTimeout(this.longTouchAnimationPostTask);
    delete this.longTouchAnimationPostTask;
  }
}

/** 
 * @private 
 */
PlanComponent.prototype.stopIndicatorAnimation = function() {
  this.touchOverlay.style.visibility = "hidden";
  for (var i = 0; i < this.touchOverlay.children.length; i++) {
    this.touchOverlay.children.item(i).classList.remove("animated");
    this.touchOverlay.children.item(i).classList.remove("indicator");
  }
}

/**
 * Adds focus listener to this component that calls back <code>controller</code>
 * escape method on focus lost event.
 * @param {PlanController} controller
 * @private
 */
PlanComponent.prototype.addFocusListener = function(controller) {
  var plan = this;
  this.focusOutListener = function() {
      if (plan.pointerType === View.PointerType.TOUCH
          && plan.lastTouchEndX
          && plan.lastTouchEndY
          && controller.isModificationState()
          && (controller.getMode() === PlanController.Mode.WALL_CREATION
              || controller.getMode() === PlanController.Mode.ROOM_CREATION
              || controller.getMode() === PlanController.Mode.POLYLINE_CREATION
              || controller.getMode() === PlanController.Mode.DIMENSION_LINE_CREATION)) {
        // Emulate a mouse click at last touch location to validate last entered point
        controller.pressMouse(plan.convertXPixelToModel(plan.lastTouchEndX), 
            plan.convertYPixelToModel(plan.lastTouchEndY), 1, false, false, false, false, View.PointerType.TOUCH);
        controller.releaseMouse(plan.convertXPixelToModel(plan.lastTouchEndX), 
            plan.convertYPixelToModel(plan.lastTouchEndY));
      }
      plan.mouseListener.lastPointerLocation = null;
      plan.mouseListener.actionStartedInPlanComponent = false;
      controller.escape();
    };
  this.container.addEventListener("focusout", this.focusOutListener);
}

/**
 * Adds a listener to the controller to follow changes in base plan modification state.
 * @param {PlanController} controller
 * @private
 */
PlanComponent.prototype.addControllerListener = function(controller) {
  var plan = this;
  controller.addPropertyChangeListener("BASE_PLAN_MODIFICATION_STATE", 
      function(ev) {
        var wallsDoorsOrWindowsModification = controller.isBasePlanModificationState();
        if (wallsDoorsOrWindowsModification) {
          if (controller.getMode() !== PlanController.Mode.WALL_CREATION) {
            var items = plan.draggedItemsFeedback != null ? plan.draggedItemsFeedback : plan.home.getSelectedItems();
            for (var i = 0; i < items.length; i++) {
              var item = items[i];
              if (!(item instanceof Wall) 
                  && !((item instanceof HomePieceOfFurniture) && item.isDoorOrWindow())) {
                wallsDoorsOrWindowsModification = false;
              }
            }
          }
        }
        if (plan.wallsDoorsOrWindowsModification !== wallsDoorsOrWindowsModification) {
          plan.wallsDoorsOrWindowsModification = wallsDoorsOrWindowsModification;
          plan.repaint();
        }
      });
}

/**
 * Installs default keys bound to actions.
 * @private
 */
PlanComponent.prototype.installDefaultKeyboardActions = function() {
  var plan = this;
  this.inputMap = {
      "pressed DELETE": "DELETE_SELECTION",
      "pressed BACK_SPACE": "DELETE_SELECTION",
      "pressed ESCAPE": "ESCAPE",
      "shift pressed ESCAPE": "ESCAPE",
      "pressed LEFT": "MOVE_SELECTION_LEFT",
      "shift pressed LEFT": "MOVE_SELECTION_FAST_LEFT",
      "pressed UP": "MOVE_SELECTION_UP",
      "shift pressed UP": "MOVE_SELECTION_FAST_UP",
      "pressed DOWN": "MOVE_SELECTION_DOWN",
      "shift pressed DOWN": "MOVE_SELECTION_FAST_DOWN",
      "pressed RIGHT": "MOVE_SELECTION_RIGHT",
      "shift pressed RIGHT": "MOVE_SELECTION_FAST_RIGHT",
      "pressed ENTER": "ACTIVATE_EDITIION",
      "shift pressed ENTER": "ACTIVATE_EDITIION"
  };
  if (OperatingSystem.isMacOSX()) {
    CoreTools.merge(this.inputMap, {
      "alt pressed ALT": "ACTIVATE_DUPLICATION",
      "released ALT": "DEACTIVATE_DUPLICATION",
      "shift alt pressed ALT": "ACTIVATE_DUPLICATION",
      "shift released ALT": "DEACTIVATE_DUPLICATION",
      "meta alt pressed ALT": "ACTIVATE_DUPLICATION",
      "meta released ALT": "DEACTIVATE_DUPLICATION",
      "shift meta alt pressed ALT": "ACTIVATE_DUPLICATION",
      "shift meta released ALT": "DEACTIVATE_DUPLICATION",
      "alt pressed ESCAPE": "ESCAPE",
      "alt pressed ENTER": "ACTIVATE_EDITIION"
    });
  }
  else {
    CoreTools.merge(this.inputMap, {
      "control pressed CONTROL": "ACTIVATE_DUPLICATION",
      "released CONTROL": "DEACTIVATE_DUPLICATION",
      "shift control pressed CONTROL": "ACTIVATE_DUPLICATION",
      "shift released CONTROL": "DEACTIVATE_DUPLICATION",
      "meta control pressed CONTROL": "ACTIVATE_DUPLICATION",
      "meta released CONTROL": "DEACTIVATE_DUPLICATION",
      "shift meta control pressed CONTROL": "ACTIVATE_DUPLICATION",
      "shift meta released CONTROL": "DEACTIVATE_DUPLICATION",
      "control pressed ESCAPE": "ESCAPE",
      "control pressed ENTER": "ACTIVATE_EDITIION"
    });
  }
  if (OperatingSystem.isWindows()) {
    CoreTools.merge(this.inputMap, {
      "alt pressed ALT": "TOGGLE_MAGNETISM_ON",
      "released ALT": "TOGGLE_MAGNETISM_OFF",
      "shift alt pressed ALT": "TOGGLE_MAGNETISM_ON",
      "shift released ALT": "TOGGLE_MAGNETISM_OFF",
      "control alt pressed ALT": "TOGGLE_MAGNETISM_ON",
      "control released ALT": "TOGGLE_MAGNETISM_OFF",
      "shift control alt pressed ALT": "TOGGLE_MAGNETISM_ON",
      "shift control released ALT": "TOGGLE_MAGNETISM_OFF",
      "alt pressed ESCAPE": "ESCAPE",
      "alt pressed ENTER": "ACTIVATE_EDITIION"
    });
  }
  else if (OperatingSystem.isMacOSX()) {
    CoreTools.merge(this.inputMap, {
      "meta pressed META": "TOGGLE_MAGNETISM_ON",
      "released META": "TOGGLE_MAGNETISM_OFF",
      "shift meta pressed META": "TOGGLE_MAGNETISM_ON",
      "shift released META": "TOGGLE_MAGNETISM_OFF",
      "alt meta pressed META": "TOGGLE_MAGNETISM_ON",
      "alt released META": "TOGGLE_MAGNETISM_OFF",
      "shift alt meta pressed META": "TOGGLE_MAGNETISM_ON",
      "shift alt released META": "TOGGLE_MAGNETISM_OFF",
      "meta pressed ESCAPE": "ESCAPE",
      "meta pressed ENTER": "ACTIVATE_EDITIION"
    });
  }
  else {
    CoreTools.merge(this.inputMap, {
      "shift alt pressed ALT": "TOGGLE_MAGNETISM_ON",
      "alt shift pressed SHIFT": "TOGGLE_MAGNETISM_ON",
      "alt released SHIFT": "TOGGLE_MAGNETISM_OFF",
      "shift released ALT": "TOGGLE_MAGNETISM_OFF",
      "control shift alt pressed ALT": "TOGGLE_MAGNETISM_ON",
      "control alt shift pressed SHIFT": "TOGGLE_MAGNETISM_ON",
      "control alt released SHIFT": "TOGGLE_MAGNETISM_OFF",
      "control shift released ALT": "TOGGLE_MAGNETISM_OFF",
      "alt shift pressed ESCAPE": "ESCAPE",
      "alt shift  pressed ENTER": "ACTIVATE_EDITIION",
      "control alt shift pressed ESCAPE": "ESCAPE",
      "control alt shift pressed ENTER": "ACTIVATE_EDITIION"
    });
  }
  CoreTools.merge(this.inputMap, {
    "shift pressed SHIFT": "ACTIVATE_ALIGNMENT",
    "released SHIFT": "DEACTIVATE_ALIGNMENT"
  });
  if (OperatingSystem.isWindows()) {
    CoreTools.merge(this.inputMap, {
      "control shift pressed SHIFT": "ACTIVATE_ALIGNMENT",
      "control released SHIFT": "DEACTIVATE_ALIGNMENT",
      "alt shift pressed SHIFT": "ACTIVATE_ALIGNMENT",
      "alt released SHIFT": "DEACTIVATE_ALIGNMENT"
    });
  }
  else if (OperatingSystem.isMacOSX()) {
    CoreTools.merge(this.inputMap, {
      "alt shift pressed SHIFT": "ACTIVATE_ALIGNMENT",
      "alt released SHIFT": "DEACTIVATE_ALIGNMENT",
      "meta shift pressed SHIFT": "ACTIVATE_ALIGNMENT",
      "meta released SHIFT": "DEACTIVATE_ALIGNMENT"
    });
  }
  else {
    CoreTools.merge(this.inputMap, {
      "control shift pressed SHIFT": "ACTIVATE_ALIGNMENT",
      "control released SHIFT": "DEACTIVATE_ALIGNMENT",
      "shift released ALT": "ACTIVATE_ALIGNMENT",
      "control shift released ALT": "ACTIVATE_ALIGNMENT"
    });
  }
  this.keyDownListener = function(ev) { 
      return plan.callAction(ev, "keydown"); 
    };
  this.container.addEventListener("keydown", this.keyDownListener, false);
  this.keyUpListener = function(ev) { 
      return plan.callAction(ev, "keyup"); 
    };
  this.container.addEventListener("keyup", this.keyUpListener, false);
}

/**
 * Runs the action bound to the key event in parameter.
 * @private
 */
PlanComponent.prototype.callAction = function(ev, keyType) {
  var keyStroke = KeyStroke.getKeyStrokeForEvent(ev, keyType);
  if (keyStroke !== undefined) {
    var actionKey = this.inputMap[keyStroke];
    if (actionKey !== undefined) {
      var action = this.actionMap[actionKey];
      if (action !== undefined) {
        action.actionPerformed(ev);
      }
      ev.stopPropagation();
    }
  }
}

/**
 * Installs keys bound to actions during edition.
 * @private
 */
PlanComponent.prototype.installEditionKeyboardActions = function() {
  this.inputMap = {
      "ESCAPE": "ESCAPE",
      "shift ESCAPE": "ESCAPE",
      "ENTER": "DEACTIVATE_EDITIION",
      "shift ENTER": "DEACTIVATE_EDITIION"
  };
  if (OperatingSystem.isMacOSX()) {
    CoreTools.merge(this.inputMap, {
      "alt ESCAPE": "ESCAPE",
      "alt ENTER": "DEACTIVATE_EDITIION",
      "alt shift ENTER": "DEACTIVATE_EDITIION",
      "alt pressed ALT": "ACTIVATE_DUPLICATION",
      "released ALT": "DEACTIVATE_DUPLICATION",
      "shift alt pressed ALT": "ACTIVATE_DUPLICATION",
      "shift released ALT": "DEACTIVATE_DUPLICATION"
    });
  }
  else {
    CoreTools.merge(this.inputMap, {
      "control ESCAPE": "ESCAPE",
      "control ENTER": "DEACTIVATE_EDITIION",
      "control shift ENTER": "DEACTIVATE_EDITIION",
      "control pressed CONTROL": "ACTIVATE_DUPLICATION",
      "released CONTROL": "DEACTIVATE_DUPLICATION",
      "shift control pressed CONTROL": "ACTIVATE_DUPLICATION",
      "shift released CONTROL": "DEACTIVATE_DUPLICATION"
    });
  }
}

/**
 * Creates actions that calls back <code>controller</code> methods.
 * @param {PlanController} controller
 * @private
 */
PlanComponent.prototype.createActions = function(controller) {
  var plan = this;
  
  function MoveSelectionAction(dx, dy) {
    this.dx = dx;
    this.dy = dy;
  }
  MoveSelectionAction.prototype.actionPerformed = function(ev) {
    controller.moveSelection(this.dx / plan.getScale(), this.dy / plan.getScale());
  };
    
  function ToggleMagnetismAction(toggle) {
    this.toggle = toggle;
  }
  ToggleMagnetismAction.prototype.actionPerformed = function(ev) {
    controller.toggleMagnetism(this.toggle);
  };
    
  function SetAlignmentActivatedAction(alignmentActivated) {
    this.alignmentActivated = alignmentActivated;
  }
  SetAlignmentActivatedAction.prototype.actionPerformed = function(ev) {
    controller.setAlignmentActivated(this.alignmentActivated);
  };
    
  function SetDuplicationActivatedAction(duplicationActivated) {
    this.duplicationActivated = duplicationActivated;
  }
  SetDuplicationActivatedAction.prototype.actionPerformed = function(ev) {
    controller.setDuplicationActivated(this.duplicationActivated);
  };
    
  function SetEditionActivatedAction(editionActivated) {
    this.editionActivated = editionActivated;
  }
  SetEditionActivatedAction.prototype.actionPerformed = function(ev) {
    controller.setEditionActivated(this.editionActivated);
  };
    
  this.actionMap = {
      "DELETE_SELECTION": { 
          actionPerformed: function() { 
              controller.deleteSelection(); 
            } 
          },
      "ESCAPE": { 
           actionPerformed: function() { 
               controller.escape(); 
             } 
          },
      "MOVE_SELECTION_LEFT": new MoveSelectionAction(-1, 0),
      "MOVE_SELECTION_FAST_LEFT": new MoveSelectionAction(-10, 0),
      "MOVE_SELECTION_UP": new MoveSelectionAction(0, -1),
      "MOVE_SELECTION_FAST_UP": new MoveSelectionAction(0, -10),
      "MOVE_SELECTION_DOWN": new MoveSelectionAction(0, 1),
      "MOVE_SELECTION_FAST_DOWN": new MoveSelectionAction(0, 10),
      "MOVE_SELECTION_RIGHT": new MoveSelectionAction(1, 0),
      "MOVE_SELECTION_FAST_RIGHT": new MoveSelectionAction(10, 0),
      "TOGGLE_MAGNETISM_ON": new ToggleMagnetismAction(true),
      "TOGGLE_MAGNETISM_OFF": new ToggleMagnetismAction(false),
      "ACTIVATE_ALIGNMENT": new SetAlignmentActivatedAction(true),
      "DEACTIVATE_ALIGNMENT": new SetAlignmentActivatedAction(false),
      "ACTIVATE_DUPLICATION": new SetDuplicationActivatedAction(true),
      "DEACTIVATE_DUPLICATION": new SetDuplicationActivatedAction(false),
      "ACTIVATE_EDITIION": new SetEditionActivatedAction(true),
      "DEACTIVATE_EDITIION": new SetEditionActivatedAction(false)
  };
}

PlanComponent.createCustomCursor = function(name, defaultCursor) {
   if (OperatingSystem.isInternetExplorer()) {
     return defaultCursor;
   } else {
     return 'url("' + ZIPTools.getScriptFolder() + '/resources/cursors/' 
                 + name + '16x16' + (OperatingSystem.isMacOSX() ? '-macosx' : '') + '.png") 8 8, ' + defaultCursor;
   }
}

/**
 * Returns the preferred size of this component in actual screen pixels size.
 * @return {java.awt.Dimension}
 */
PlanComponent.prototype.getPreferredSize = function() {
  var insets = this.getInsets();
  var planBounds = this.getPlanBounds();
  return {width:  this.convertLengthToPixel(planBounds.getWidth() + PlanComponent.MARGIN * 2) + insets.left + insets.right,
          height: this.convertLengthToPixel(planBounds.getHeight() + PlanComponent.MARGIN * 2) + insets.top + insets.bottom};
}

/** 
 * @private 
 */
PlanComponent.prototype.getInsets = function() {
  return { top: 0, bottom: 0, left: 0, right: 0 };
}

/** 
 * @private 
 */
PlanComponent.prototype.getWidth = function() {
  return this.view.clientWidth;
}

/** 
 * @private 
 */
PlanComponent.prototype.getHeight = function() {
  return this.view.clientHeight;
}

/**
 * Returns the bounds of the plan displayed by this component.
 * @return {java.awt.geom.Rectangle2D}
 * @private
 */
PlanComponent.prototype.getPlanBounds = function() {
  var plan = this;
  if (!this.planBoundsCacheValid) {
    if (this.planBoundsCache == null) {
      this.planBoundsCache = new java.awt.geom.Rectangle2D.Float(0, 0, 1000, 1000);
    }
    if (this.backgroundImageCache != null) {
      var backgroundImage = this.home.getBackgroundImage();
      if (backgroundImage != null) {
        this.planBoundsCache.add(-backgroundImage.getXOrigin(), -backgroundImage.getYOrigin());
        this.planBoundsCache.add(this.backgroundImageCache.width * backgroundImage.getScale() - backgroundImage.getXOrigin(), 
            this.backgroundImageCache.height * backgroundImage.getScale() - backgroundImage.getYOrigin());
      }
      this.home.getLevels().forEach(function(level) {
          var levelBackgroundImage = level.getBackgroundImage();
          if (levelBackgroundImage != null) {
            plan.planBoundsCache.add(-levelBackgroundImage.getXOrigin(), -levelBackgroundImage.getYOrigin());
            plan.planBoundsCache.add(plan.backgroundImageCache.width * levelBackgroundImage.getScale() - levelBackgroundImage.getXOrigin(), 
                plan.backgroundImageCache.height * levelBackgroundImage.getScale() - levelBackgroundImage.getYOrigin());
          }
        });
    }
    var g = this.getGraphics();
    if (g != null) {
      this.setRenderingHints(g);
    }
    var homeItemsBounds = this.getItemsBounds(g, this.getPaintedItems());
    if (homeItemsBounds != null) {
      this.planBoundsCache.add(homeItemsBounds);
    }
    this.home.getObserverCamera().getPoints().forEach(function(point) { 
        return plan.planBoundsCache.add(point[0], point[1]); 
      });
    this.planBoundsCacheValid = true;
  }
  return this.planBoundsCache;
}

/**
 * Returns the collection of walls, furniture, rooms and dimension lines of the home
 * painted by this component wherever the level they belong to is selected or not.
 * @return {Object[]}
 */
PlanComponent.prototype.getPaintedItems = function() {
  return this.home.getSelectableViewableItems();
}

/**
 * Returns the bounds of the given collection of <code>items</code>.
 * @param {Graphics2D} g
 * @param {Bound[]} items
 * @return {java.awt.geom.Rectangle2D}
 * @private
 */
PlanComponent.prototype.getItemsBounds = function(g, items) {
  var itemsBounds = null;
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var itemBounds = this.getItemBounds(g, item);
    if (itemsBounds == null) {
      itemsBounds = itemBounds;
    } else {
      itemsBounds.add(itemBounds);
    }
  }
  return itemsBounds;
}

/**
 * Returns the bounds of the given <code>item</code>.
 * @param {Graphics2D} g
 * @param {Object} item
 * @return {java.awt.geom.Rectangle2D}
 */
PlanComponent.prototype.getItemBounds = function(g, item) {
  var plan = this;
  var points = item.getPoints();
  var itemBounds = new java.awt.geom.Rectangle2D.Float(points[0][0], points[0][1], 0, 0);
  for (var i = 1; i < points.length; i++) {
    itemBounds.add(points[i][0], points[i][1]);
  }
  var componentFont;
  if (g != null) {
    componentFont = g.getFont();
  } else {
    componentFont = this.getFont();
  }
  if (item instanceof Room) {
    var room = item;
    var xRoomCenter = room.getXCenter();
    var yRoomCenter = room.getYCenter();
    var roomName = room.getName();
    if (roomName != null && roomName.length > 0) {
      this.addTextBounds(room.constructor, 
          roomName, room.getNameStyle(), 
          xRoomCenter + room.getNameXOffset(), 
          yRoomCenter + room.getNameYOffset(), room.getNameAngle(), itemBounds);
    }
    if (room.isAreaVisible()) {
      var area = room.getArea();
      if (area > 0.01) {
        var areaText = this.preferences.getLengthUnit().getAreaFormatWithUnit().format(area);
        this.addTextBounds(room.constructor, 
            areaText, room.getAreaStyle(), 
            xRoomCenter + room.getAreaXOffset(), 
            yRoomCenter + room.getAreaYOffset(), room.getAreaAngle(), itemBounds);
      }
    }
  } else if (item instanceof Polyline) {
    var polyline = item;
    return ShapeTools.getPolylineShape(polyline.getPoints(), 
        polyline.getJoinStyle() === Polyline.JoinStyle.CURVED, polyline.isClosedPath()).getBounds2D();
  } else if (item instanceof HomePieceOfFurniture) {
    if (item != null && item instanceof HomeDoorOrWindow) {
      var doorOrWindow_1 = item;
      doorOrWindow_1.getSashes().forEach(function(sash) {
        itemBounds.add(plan.getDoorOrWindowSashShape(doorOrWindow_1, sash).getBounds2D());
      });
    } else if (item instanceof HomeFurnitureGroup) {
      itemBounds.add(this.getItemsBounds(g, item.getFurniture()));
    }
    var piece = item;
    var pieceName = piece.getName();
    if (piece.isVisible() 
        && piece.isNameVisible() 
        && pieceName.length > 0) {
      this.addTextBounds(piece.constructor, 
          pieceName, piece.getNameStyle(), 
          piece.getX() + piece.getNameXOffset(), 
          piece.getY() + piece.getNameYOffset(), piece.getNameAngle(), itemBounds);
    }
  } else if (item instanceof DimensionLine) {
    var dimensionLine = item;
    var dimensionLineLength = dimensionLine.getLength();
    var lengthText = this.preferences.getLengthUnit().getFormat().format(dimensionLineLength);
    var lengthStyle = dimensionLine.getLengthStyle();
    if (lengthStyle == null) {
      lengthStyle = this.preferences.getDefaultTextStyle(dimensionLine.constructor);
    }
    var transform = java.awt.geom.AffineTransform.getTranslateInstance(
        dimensionLine.getXStart(), dimensionLine.getYStart());
    var angle = dimensionLine.isElevationDimensionLine()
        ? (dimensionLine.getPitch() + 2 * Math.PI) % (2 * Math.PI)
        : Math.atan2(dimensionLine.getYEnd() - dimensionLine.getYStart(), dimensionLine.getXEnd() - dimensionLine.getXStart());
    if (dimensionLine.getElevationStart() == dimensionLine.getElevationEnd()) {
      var lengthFontMetrics = this.getFontMetrics(componentFont, lengthStyle);
      var lengthTextBounds = lengthFontMetrics.getStringBounds(lengthText);
      transform.rotate(angle);
      transform.translate(0, dimensionLine.getOffset());
      transform.translate((dimensionLineLength - lengthTextBounds.getWidth()) / 2, 
          dimensionLine.getOffset() <= 0 
              ? -lengthFontMetrics.getDescent() - 1 
              : lengthFontMetrics.getAscent() + 1);
      var lengthTextBoundsPath = new java.awt.geom.GeneralPath(lengthTextBounds);
      for (var it = lengthTextBoundsPath.getPathIterator(transform); !it.isDone(); it.next()) {
        var pathPoint = [0, 0];
        if (it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
          itemBounds.add(pathPoint[0], pathPoint[1]);
        }
      }
    }
    transform.setToTranslation(dimensionLine.getXStart(), dimensionLine.getYStart());
    transform.rotate(angle);
    transform.translate(0, dimensionLine.getOffset());
    for (var it = PlanComponent.DIMENSION_LINE_MARK_END.getPathIterator(transform); !it.isDone(); it.next()) {
      var pathPoint = [0, 0];
      if (it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
        itemBounds.add(pathPoint[0], pathPoint[1]);
      }
    }
    transform.translate(dimensionLineLength, 0);
    for (var it = PlanComponent.DIMENSION_LINE_MARK_END.getPathIterator(transform); !it.isDone(); it.next()) {
      var pathPoint = [0, 0];
      if (it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
        itemBounds.add(pathPoint[0], pathPoint[1]);
      }
    }
  } else if (item instanceof Label) {
    var label = item;
    this.addTextBounds(label.constructor, 
        label.getText(), label.getStyle(), label.getX(), label.getY(), label.getAngle(), itemBounds);
  } else if (item instanceof Compass) {
    var compass = item;
    var transform = java.awt.geom.AffineTransform.getTranslateInstance(compass.getX(), compass.getY());
    transform.scale(compass.getDiameter(), compass.getDiameter());
    transform.rotate(compass.getNorthDirection());
    return PlanComponent.COMPASS.createTransformedShape(transform).getBounds2D();
  }
  return itemBounds;
}

/**
 * Add <code>text</code> bounds to the given rectangle <code>bounds</code>.
 * @param {Object} selectableClass
 * @param {string} text
 * @param {TextStyle} style
 * @param {number} x
 * @param {number} y
 * @param {number} angle
 * @param {java.awt.geom.Rectangle2D} bounds
 * @private
 */
PlanComponent.prototype.addTextBounds = function(selectableClass, text, style, x, y, angle, bounds) {
  if (style == null) {
    style = this.preferences.getDefaultTextStyle(selectableClass);
  }
  this.getTextBounds(text, style, x, y, angle).forEach(function(points) { 
      return bounds.add(points[0], points[1]); 
    });
}

/**
 * Returns the coordinates of the bounding rectangle of the <code>text</code> centered at
 * the point (<code>x</code>,<code>y</code>).
 * @param {string} text
 * @param {TextStyle} style
 * @param {number} x
 * @param {number} y
 * @param {number} angle
 * @return {Array}
 */
PlanComponent.prototype.getTextBounds = function(text, style, x, y, angle) {
  var fontMetrics = this.getFontMetrics(this.getFont(), style);
  var textBounds = null;
  var lines = text.replace(/\n*$/, "").split("\n");
  var g = this.getGraphics();
  if (g != null) {
    this.setRenderingHints(g);
  }
  for (var i = 0; i < lines.length; i++) {
    var lineBounds = fontMetrics.getStringBounds(lines[i]);
    if (textBounds == null || textBounds.getWidth() < lineBounds.getWidth()) {
      textBounds = lineBounds;
    }
  }
  var textWidth = textBounds.getWidth();
  var shiftX;
  if (style.getAlignment() === TextStyle.Alignment.LEFT) {
    shiftX = 0;
  }
  else if (style.getAlignment() === TextStyle.Alignment.RIGHT) {
    shiftX = -textWidth;
  }
  else {
    shiftX = -textWidth / 2;
  }
  if (angle === 0) {
    var minY = (y + textBounds.getY());
    var maxY = (minY + textBounds.getHeight());
    minY -= (textBounds.getHeight() * (lines.length - 1));
    return [
        [x + shiftX, minY], 
        [x + shiftX + textWidth, minY], 
        [x + shiftX + textWidth, maxY], 
        [x + shiftX, maxY]];
  } else {
    textBounds.add(textBounds.getX(), textBounds.getY() - textBounds.getHeight() * (lines.length - 1));
    var transform = new java.awt.geom.AffineTransform();
    transform.translate(x, y);
    transform.rotate(angle);
    transform.translate(shiftX, 0);
    var textBoundsPath = new java.awt.geom.GeneralPath(textBounds);
    var textPoints = [];
    for (var it = textBoundsPath.getPathIterator(transform); !it.isDone(); it.next()) {
      var pathPoint = [0, 0];
      if (it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
        textPoints.push(pathPoint);
      }
    }
    return textPoints.slice(0);
  }
}

/**
 * Returns the HTML font matching a given text style.
 * @param {string} [defaultFont]
 * @param {TextStyle} [textStyle]
 * @return {string}
 */
PlanComponent.prototype.getFont = function(defaultFont, textStyle) {
  if (defaultFont == null && textStyle == null) {
    return this.font;
  }
  if (this.fonts == null) {
    this.fonts = {};
  }
  var font = CoreTools.getFromMap(this.fonts, textStyle);
  if (font == null) {
    var fontStyle = 'normal';
    var fontWeight = 'normal';
    if (textStyle.isBold()) {
      fontWeight = 'bold';
    }
    if (textStyle.isItalic()) {
      fontStyle = 'italic';
    }
    if (defaultFont == null 
        || this.preferences.getDefaultFontName() != null 
        || textStyle.getFontName() != null) {
      var fontName = textStyle.getFontName();
      if (fontName == null) {
        fontName = this.preferences.getDefaultFontName();
      }
      if (fontName == null) {
        fontName = new Font(this.font).family;
      }
      defaultFont = new Font({ 
          style: fontStyle, 
          weight: fontWeight, 
          size: "10px", 
          family: fontName }).toString();
    }
    font = new Font({ 
        style: fontStyle, 
        weight: fontWeight, 
        size: textStyle.getFontSize() + "px", 
        family: new Font(defaultFont).family }).toString();
    CoreTools.putToMap(this.fonts, textStyle, font);
  }
  return font;
}

/** 
 * Sets the default font used to paint text in this component.
 * @param {string} font a HTML font
 * @private 
 */
PlanComponent.prototype.setFont = function(font) {
  this.font = font;
}

/**
 * Returns the font metrics matching a given text style.
 * @param {string} defaultFont
 * @param {TextStyle} textStyle
 * @return {FontMetrics}
 */
PlanComponent.prototype.getFontMetrics = function(defaultFont, textStyle) {
  if (textStyle == null) {
    return new FontMetrics(defaultFont);
  }
  if (this.fontsMetrics == null) {
    this.fontsMetrics = {};
  }
  var fontMetrics = CoreTools.getFromMap(this.fontsMetrics, textStyle);
  if (fontMetrics == null) {
    fontMetrics = this.getFontMetrics(this.getFont(defaultFont, textStyle));
    CoreTools.putToMap(this.fontsMetrics, textStyle, fontMetrics);
  }
  return fontMetrics;
}

/**
 * Sets whether plan's background should be painted or not.
 * Background may include grid and an image.
 * @param {boolean} backgroundPainted
 */
PlanComponent.prototype.setBackgroundPainted = function(backgroundPainted) {
  if (this.backgroundPainted !== backgroundPainted) {
    this.backgroundPainted = backgroundPainted;
    this.repaint();
  }
}

/**
 * Returns <code>true</code> if plan's background should be painted.
 * @return {boolean}
 */
PlanComponent.prototype.isBackgroundPainted = function() {
  return this.backgroundPainted;
}

/**
 * Sets whether the outline of home selected items should be painted or not.
 * @param {boolean} selectedItemsOutlinePainted
 */
PlanComponent.prototype.setSelectedItemsOutlinePainted = function(selectedItemsOutlinePainted) {
  if (this.selectedItemsOutlinePainted !== selectedItemsOutlinePainted) {
    this.selectedItemsOutlinePainted = selectedItemsOutlinePainted;
    this.repaint();
  }
}

/**
 * Returns <code>true</code> if the outline of home selected items should be painted.
 * @return {boolean}
 */
PlanComponent.prototype.isSelectedItemsOutlinePainted = function() {
  return this.selectedItemsOutlinePainted;
}

/**
 * Repaints this component elements when possible.
 */
PlanComponent.prototype.repaint = function() {
  var plan = this;
  if (!this.canvasNeededRepaint) {
    this.canvasNeededRepaint = true;
    requestAnimationFrame(function() {
        if (plan.canvasNeededRepaint) {
          plan.canvasNeededRepaint = false;
          plan.paintComponent(plan.getGraphics());
        }
      });
  }
}

/**
 * Returns a <code>Graphics2D</code> object.
 * @return {Graphics2D}
 */
PlanComponent.prototype.getGraphics = function() {
  if (!this.graphics) {
    this.graphics = new Graphics2D(this.canvas);
  }
  return this.graphics;
}

/**
 * Paints this component.
 * @param {Graphics2D} g
 */
PlanComponent.prototype.paintComponent = function(g2D) {
  g2D.setTransform(new java.awt.geom.AffineTransform());
  g2D.clear();
  if (this.backgroundPainted) {
    this.paintBackground(g2D, this.getBackgroundColor(PlanComponent.PaintMode.PAINT));
  }
  var insets = this.getInsets();
  // g2D.clipRect(0, 0, this.getWidth(), this.getHeight());
  var planBounds = this.getPlanBounds();
  var planScale = this.getScale() * this.resolutionScale; 
  if (this.isScrolled()) {
    g2D.translate(-this.scrollPane.scrollLeft * this.resolutionScale, -this.scrollPane.scrollTop * this.resolutionScale);
  } 
  g2D.translate(insets.left * this.resolutionScale + (PlanComponent.MARGIN - planBounds.getMinX()) * planScale,
      insets.top * this.resolutionScale + (PlanComponent.MARGIN - planBounds.getMinY()) * planScale);
  g2D.scale(planScale, planScale);
  this.setRenderingHints(g2D);
  // For debugging only
  if (this.drawPlanBounds) {
    g2D.setColor("#FF0000");
    g2D.draw(planBounds);
  }
  this.paintContent(g2D, this.home.getSelectedLevel(), this.getScale(), PlanComponent.PaintMode.PAINT);
  g2D.dispose();
}

/**
 * Returns the print preferred scale of the plan drawn in this component
 * to make it fill <code>pageFormat</code> imageable size.
 * @param {Graphics2D} g
 * @param {java.awt.print.PageFormat} pageFormat
 * @return {number}
 */
PlanComponent.prototype.getPrintPreferredScale = function(g, pageFormat) {
  return 1;
}

/**
 * Returns the stroke width used to paint an item of the given class.
 * @param {Object} itemClass
 * @param {PlanComponent.PaintMode} paintMode
 * @return {number}
 * @private
 */
PlanComponent.prototype.getStrokeWidth = function(itemClass, paintMode) {
  var strokeWidth;
  if (Wall === itemClass || Room === itemClass) {
    strokeWidth = PlanComponent.WALL_STROKE_WIDTH;
  } else {
    strokeWidth = PlanComponent.BORDER_STROKE_WIDTH;
  }
  if (paintMode === PlanComponent.PaintMode.PRINT) {
    strokeWidth *= 0.5;
  }
  return strokeWidth;
}

/**
 * Returns an image of selected items in plan for transfer purpose.
 * @param {TransferableView.DataType} dataType
 * @return {Object}
 */
PlanComponent.prototype.createTransferData = function(dataType) {
  if (dataType === TransferableView.DataType.PLAN_IMAGE) {
    return this.getClipboardImage();
  } else {
    return null;
  }
}

/**
 * Returns an image of the selected items displayed by this component
 * (camera excepted) with no outline at scale 1/1 (1 pixel = 1cm).
 * @return {HTMLImageElement}
 */
PlanComponent.prototype.getClipboardImage = function() {
  throw new UnsupportedOperationException("Not implemented");
}

/**
 * Returns <code>true</code> if the given format is SVG.
 * @param {ExportableView.FormatType} formatType
 * @return {boolean}
 */
PlanComponent.prototype.isFormatTypeSupported = function(formatType) {
  return false;
}

/**
 * Writes this plan in the given output stream at SVG (Scalable Vector Graphics) format if this is the requested format.
 * @param {java.io.OutputStream} out
 * @param {ExportableView.FormatType} formatType
 * @param {Object} settings
 */
PlanComponent.prototype.exportData = function(out, formatType, settings) {
  throw new UnsupportedOperationException("Unsupported format " + formatType);
}

/**
 * Sets rendering hints used to paint plan.
 * @param {Graphics2D} g2D
 * @private
 */
PlanComponent.prototype.setRenderingHints = function(g2D) {
  // TODO
}

/**
 * Fills the background.
 * @param {Graphics2D} g2D
 * @param {string} backgroundColor
 * @private
 */
PlanComponent.prototype.paintBackground = function(g2D, backgroundColor) {
  if (this.isOpaque()) {
    g2D.setColor(backgroundColor);
    g2D.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

/** 
 * @private 
 */
PlanComponent.prototype.isOpaque = function() {
  return this.opaque === true;
}

/** 
 * @private 
 */
PlanComponent.prototype.setOpaque = function(opaque) {
  this.opaque = opaque;
}

/**
 * Paints background image and returns <code>true</code> if an image is painted.
 * @param {Graphics2D} g2D
 * @param {Level} level
 * @param {PlanComponent.PaintMode} paintMode
 * @return {boolean}
 * @private
 */
PlanComponent.prototype.paintBackgroundImage = function(g2D, level, paintMode) {
  var selectedLevel = this.home.getSelectedLevel();
  var backgroundImageLevel = null;
  if (level != null) {
    var levels = this.home.getLevels();
    for (var i = levels.length - 1; i >= 0; i--) {
      var homeLevel = levels[i];
      if (homeLevel.getElevation() === level.getElevation() 
          && homeLevel.getElevationIndex() <= level.getElevationIndex() 
          && homeLevel.isViewable() 
          && homeLevel.getBackgroundImage() != null 
          && homeLevel.getBackgroundImage().isVisible()) {
        backgroundImageLevel = homeLevel;
        break;
      }
    }
  }
  var backgroundImage = backgroundImageLevel == null 
      ? this.home.getBackgroundImage() 
      : backgroundImageLevel.getBackgroundImage();
  if (backgroundImage != null && backgroundImage.isVisible()) {
    var previousTransform = g2D.getTransform();
    g2D.translate(-backgroundImage.getXOrigin(), -backgroundImage.getYOrigin());
    var backgroundImageScale = backgroundImage.getScale();
    g2D.scale(backgroundImageScale, backgroundImageScale);
    var oldAlpha = this.setTransparency(g2D, 0.7);
    g2D.drawImage(this.backgroundImageCache != null 
        ? this.backgroundImageCache 
        : this.readBackgroundImage(backgroundImage.getImage()), 0, 0);
    g2D.setAlpha(oldAlpha);
    g2D.setTransform(previousTransform);
    return true;
  }
  return false;
}

/**
 * Returns the foreground color used to draw content.
 * @param {PlanComponent.PaintMode} mode
 * @return {string}
 */
PlanComponent.prototype.getForegroundColor = function(mode) {
  if (mode === PlanComponent.PaintMode.PAINT) {
    return this.getForeground();
  }
  else {
    return "#000000";
  }
}

/** 
 * @private 
 */
PlanComponent.prototype.getForeground = function() {
  if (this.foreground == null) {
    this.foreground = ColorTools.styleToHexadecimalString(this.canvas.style.color);
  }
  return this.foreground;
}

/**
 * Returns the background color used to draw content.
 * @param {PlanComponent.PaintMode} mode
 * @return {string}
 */
PlanComponent.prototype.getBackgroundColor = function(mode) {
  if (mode === PlanComponent.PaintMode.PAINT) {
    return this.getBackground();
  }
  else {
    return "#FFFFFF";
  }
}

/** 
 * @private 
 */
PlanComponent.prototype.getBackground = function() {
  if (this.background == null) {
    this.background = ColorTools.styleToHexadecimalString(this.canvas.style.backgroundColor);
  }
  return this.background;
}

/**
 * Returns the image contained in <code>imageContent</code> or an empty image if reading failed.
 * @param {Content} imageContent
 * @return {HTMLImageElement}
 * @private
 */
PlanComponent.prototype.readBackgroundImage = function(imageContent) {
  var plan = this;
  if (this.backgroundImageCache != PlanComponent.WAIT_TEXTURE_IMAGE 
      && this.backgroundImageCache != PlanComponent.ERROR_TEXTURE_IMAGE) {
    this.backgroundImageCache = PlanComponent.WAIT_TEXTURE_IMAGE;
    TextureManager.getInstance().loadTexture(imageContent, {
      textureUpdated: function(texture) {
        plan.backgroundImageCache = texture;
        plan.repaint();
      },
      textureError: function() {
        plan.backgroundImageCache = PlanComponent.ERROR_TEXTURE_IMAGE;
        plan.repaint();
      }
    });
  }
  return this.backgroundImageCache;
}

/**
 * Paints walls and rooms of lower levels or upper levels to help the user draw in the given level.
 * @param {Graphics2D} g2D
 * @param {Level} level
 * @param {number} planScale
 * @param {string} backgroundColor
 * @param {string} foregroundColor
 * @private
 */
PlanComponent.prototype.paintOtherLevels = function(g2D, level, planScale, backgroundColor, foregroundColor) {
  var plan = this;
  var levels = this.home.getLevels();
  if (levels.length 
      && level != null) {
    var level0 = levels[0].getElevation() === level.getElevation();
    var otherLevels = null;
    if (this.otherLevelsRoomsCache == null 
        || this.otherLevelsWallsCache == null) {
      var selectedLevelIndex = levels.indexOf(level);
      otherLevels = [];
      if (level0) {
        var nextElevationLevelIndex = selectedLevelIndex;
        while (++nextElevationLevelIndex < levels.length 
            && levels[nextElevationLevelIndex].getElevation() === level.getElevation()) {
        }
        if (nextElevationLevelIndex < levels.length) {
          var nextLevel = levels[nextElevationLevelIndex];
          var nextElevation = nextLevel.getElevation();
          do {
            if (nextLevel.isViewable()) {
              otherLevels.push(nextLevel);
            }
          } while (++nextElevationLevelIndex < levels.length 
              && (nextLevel = levels[nextElevationLevelIndex]).getElevation() === nextElevation);
        }
      } else {
        var previousElevationLevelIndex = selectedLevelIndex;
        while (--previousElevationLevelIndex >= 0 
            && levels[previousElevationLevelIndex].getElevation() === level.getElevation()) {
        }
        if (previousElevationLevelIndex >= 0) {
          var previousLevel = levels[previousElevationLevelIndex];
          var previousElevation = previousLevel.getElevation();
          do {
            if (previousLevel.isViewable()) {
              otherLevels.push(previousLevel);
            }
          } while (--previousElevationLevelIndex >= 0 
              && (previousLevel = levels[previousElevationLevelIndex]).getElevation() === previousElevation);
        }
      }
      if (this.otherLevelsRoomsCache == null) {
        if (otherLevels.length !== 0) {
          var otherLevelsRooms = [];
          this.home.getRooms().forEach(function(room) {
              otherLevels.forEach(function(otherLevel) {
                  if (room.getLevel() === otherLevel 
                      && (level0 && room.isFloorVisible() 
                          || !level0 && room.isCeilingVisible())) {
                    otherLevelsRooms.push(room);
                  }
                });
            });
          if (otherLevelsRooms.length > 0) {
            this.otherLevelsRoomAreaCache = this.getItemsArea(otherLevelsRooms);
            this.otherLevelsRoomsCache = otherLevelsRooms;
          }
        }
        if (this.otherLevelsRoomsCache == null) {
          this.otherLevelsRoomsCache = [];
        }
      }
      if (this.otherLevelsWallsCache == null) {
        if (otherLevels.length !== 0) {
          var otherLevelswalls = [];
          this.home.getWalls().forEach(function(wall) {
            if (!plan.isViewableAtLevel(wall, level)) {
              otherLevels.forEach(function(otherLevel) {
                  if (wall.getLevel() === otherLevel) {
                    otherLevelswalls.push(wall);
                  }
                });
            }
          });
          if (otherLevelswalls.length > 0) {
            this.otherLevelsWallAreaCache = this.getItemsArea(otherLevelswalls);
            this.otherLevelsWallsCache = otherLevelswalls;
          }
        }
      }
      if (this.otherLevelsWallsCache == null) {
        this.otherLevelsWallsCache = [];
      }
    }
    if (this.otherLevelsRoomsCache.length !== 0) {
      var oldComposite = this.setTransparency(g2D, 
          this.preferences.isGridVisible() ? 0.2 : 0.1);
      g2D.setPaint("#808080");
      g2D.fill(this.otherLevelsRoomAreaCache);
      g2D.setAlpha(oldComposite);
    }
    if (this.otherLevelsWallsCache.length !== 0) {
      var oldComposite = this.setTransparency(g2D, 
          this.preferences.isGridVisible() ? 0.2 : 0.1);
      this.fillAndDrawWallsArea(g2D, this.otherLevelsWallAreaCache, planScale, 
          this.getWallPaint(g2D, planScale, backgroundColor, foregroundColor, this.preferences.getNewWallPattern()), 
          foregroundColor, PlanComponent.PaintMode.PAINT);
      g2D.setAlpha(oldComposite);
    }
  }
}

/**
 * Sets the transparency composite to the given percentage and returns the old composite.
 * @param {Graphics2D} g2D
 * @param {number} alpha
 * @return {Object}
 * @private
 */
PlanComponent.prototype.setTransparency = function(g2D, alpha) {
  var oldAlpha = g2D.getAlpha();
  g2D.setAlpha(alpha);
  return oldAlpha;
}

/**
 * Paints background grid lines.
 * @param {Graphics2D} g2D
 * @param {number} gridScale
 * @private
 */
PlanComponent.prototype.paintGrid = function(g2D, gridScale) {
  var gridSize = this.getGridSize(gridScale);
  var mainGridSize = this.getMainGridSize(gridScale);
  var planBounds = this.getPlanBounds();
  var xMin = planBounds.getMinX() - PlanComponent.MARGIN;
  var yMin = planBounds.getMinY() - PlanComponent.MARGIN;
  var xMax = this.convertXPixelToModel(Math.max(this.getWidth(), this.canvas.clientWidth));
  var yMax = this.convertYPixelToModel(Math.max(this.getHeight(), this.canvas.clientHeight));
  this.paintGridLines(g2D, gridScale, xMin, xMax, yMin, yMax, gridSize, mainGridSize);
}

/**
 * Paints background grid lines from <code>xMin</code> to <code>xMax</code>
 * and <code>yMin</code> to <code>yMax</code>.
 * @param {Graphics2D} g2D
 * @param {number} gridScale
 * @param {number} xMin
 * @param {number} xMax
 * @param {number} yMin
 * @param {number} yMax
 * @param {number} gridSize
 * @param {number} mainGridSize
 * @private
 */
PlanComponent.prototype.paintGridLines = function(g2D, gridScale, xMin, xMax, yMin, yMax, gridSize, mainGridSize) {
  g2D.setColor(this.getGridColor());
  g2D.setStroke(new java.awt.BasicStroke(0.5 / gridScale));
  for (var x = ((xMin / gridSize) | 0) * gridSize; x < xMax; x += gridSize) {
    g2D.draw(new java.awt.geom.Line2D.Double(x, yMin, x, yMax));
  }
  for (var y = ((yMin / gridSize) | 0) * gridSize; y < yMax; y += gridSize) {
    g2D.draw(new java.awt.geom.Line2D.Double(xMin, y, xMax, y));
  }
  if (mainGridSize !== gridSize) {
    g2D.setStroke(new java.awt.BasicStroke(1.5 / gridScale, 
        java.awt.BasicStroke.CAP_BUTT, java.awt.BasicStroke.JOIN_BEVEL));
    for (var x = ((xMin / mainGridSize) | 0) * mainGridSize; x < xMax; x += mainGridSize) {
      g2D.draw(new java.awt.geom.Line2D.Double(x, yMin, x, yMax));
    }
    for (var y = ((yMin / mainGridSize) | 0) * mainGridSize; y < yMax; y += mainGridSize) {
      g2D.draw(new java.awt.geom.Line2D.Double(xMin, y, xMax, y));
    }
  }
}

/**
 * Returns the color used to paint the grid. 
 * @private 
 */
PlanComponent.prototype.getGridColor = function() {
  if (this.gridColor == null) {
    // compute the gray color in between background and foreground colors
    var background = ColorTools.styleToInteger(this.canvas.style.backgroundColor);
    var foreground = ColorTools.styleToInteger(this.canvas.style.color);
    var gridColorComponent = ((((background & 0xFF) + (foreground & 0xFF) + (background & 0xFF00) + (foreground & 0xFF00) + (background & 0xFF0000) + (foreground & 0xFF0000)) / 6) | 0) & 0xFF;
    this.gridColor = ColorTools.integerToHexadecimalString(gridColorComponent + (gridColorComponent << 8) + (gridColorComponent << 16));
  }
  return this.gridColor;
}

/**
 * Returns the space between main lines grid.
 * @param {number} gridScale
 * @return {number}
 * @private
 */
PlanComponent.prototype.getMainGridSize = function(gridScale) {
  var mainGridSizes;
  var lengthUnit = this.preferences.getLengthUnit();
  if (lengthUnit.isMetric()) {
    mainGridSizes = [100, 200, 500, 1000, 2000, 5000, 10000];
  } else {
    var oneFoot = 2.54 * 12;
    mainGridSizes = [oneFoot, 3 * oneFoot, 6 * oneFoot, 
                     12 * oneFoot, 24 * oneFoot, 48 * oneFoot, 96 * oneFoot, 192 * oneFoot, 384 * oneFoot];
  }
  var mainGridSize = mainGridSizes[0];
  for (var i = 1; i < mainGridSizes.length && mainGridSize * gridScale < 50; i++) {
    mainGridSize = mainGridSizes[i];
  }
  return mainGridSize;
}

/**
 * Returns the space between lines grid.
 * @param {number} gridScale
 * @return {number}
 * @private
 */
PlanComponent.prototype.getGridSize = function(gridScale) {
  var gridSizes;
  var lengthUnit = this.preferences.getLengthUnit();
  if (lengthUnit.isMetric()) {
    gridSizes = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
  } else {
    var oneFoot = 2.54 * 12;
    gridSizes = [2.54, 5.08, 7.62, 15.24, oneFoot, 3 * oneFoot, 6 * oneFoot, 
                 12 * oneFoot, 24 * oneFoot, 48 * oneFoot, 96 * oneFoot, 192 * oneFoot, 384 * oneFoot];
  }
  var gridSize = gridSizes[0];
  for (var i = 1; i < gridSizes.length && gridSize * gridScale < 10; i++) {
    gridSize = gridSizes[i];
  }
  return gridSize;
}

/**
 * Paints plan items at the given <code>level</code>.
 * @throws InterruptedIOException if painting was interrupted (may happen only
 * if <code>paintMode</code> is equal to <code>PaintMode.EXPORT</code>).
 * @param {Graphics2D} g2D
 * @param {Level} level
 * @param {number} gridScale
 * @param {PlanComponent.PaintMode} paintMode
 * @private
 */
PlanComponent.prototype.paintContent = function(g2D, level, planScale, paintMode) {
  var backgroundColor = this.getBackgroundColor(paintMode);
  var foregroundColor = this.getForegroundColor(paintMode);
  if (this.backgroundPainted) {
    this.paintBackgroundImage(g2D, level, paintMode);
    if (paintMode === PlanComponent.PaintMode.PAINT) {
      this.paintOtherLevels(g2D, level, planScale, backgroundColor, foregroundColor);
      if (this.preferences.isGridVisible()) {
        this.paintGrid(g2D, planScale);
      }
    }
  }
  
  if (level == this.home.getSelectedLevel()) {
    // Call deprecated implementation in case a subclass did override paintHomeItems
    this.paintHomeItems(g2D, planScale, backgroundColor, foregroundColor, paintMode);
  } else {
    this.paintHomeItems(g2D, level, planScale, backgroundColor, foregroundColor, paintMode);
  }

  if (paintMode === PlanComponent.PaintMode.PAINT) {
    var selectedItems = this.home.getSelectedItems();
    var selectionColor = this.getSelectionColor();
    var furnitureOutlineColor = this.getFurnitureOutlineColor();
    var selectionOutlinePaint = ColorTools.toRGBAStyle(selectionColor, 0.5);
    var selectionOutlineStroke = new java.awt.BasicStroke(6 / planScale, 
        java.awt.BasicStroke.CAP_ROUND, java.awt.BasicStroke.JOIN_ROUND);
    var dimensionLinesSelectionOutlineStroke = new java.awt.BasicStroke(4 / planScale, 
        java.awt.BasicStroke.CAP_ROUND, java.awt.BasicStroke.JOIN_ROUND);
    var locationFeedbackStroke = new java.awt.BasicStroke(
        1 / planScale, java.awt.BasicStroke.CAP_SQUARE, java.awt.BasicStroke.JOIN_BEVEL, 0, 
        [20 / planScale, 5 / planScale, 5 / planScale, 5 / planScale], 4 / planScale);
    
    this.paintCamera(g2D, selectedItems, selectionOutlinePaint, selectionOutlineStroke, selectionColor, 
        planScale, backgroundColor, foregroundColor);
    
    if (this.alignedObjectClass != null) {
      if (Wall === this.alignedObjectClass) {
        this.paintWallAlignmentFeedback(g2D, this.alignedObjectFeedback, level, this.locationFeeback, this.showPointFeedback, 
            selectionColor, locationFeedbackStroke, planScale, 
            selectionOutlinePaint, selectionOutlineStroke);
      } else if (Room === this.alignedObjectClass) {
        this.paintRoomAlignmentFeedback(g2D, this.alignedObjectFeedback, level, this.locationFeeback, this.showPointFeedback, 
            selectionColor, locationFeedbackStroke, planScale, 
            selectionOutlinePaint, selectionOutlineStroke);
      } else if (Polyline === this.alignedObjectClass) {
        if (this.showPointFeedback) {
          this.paintPointFeedback(g2D, this.locationFeeback, selectionColor, planScale, selectionOutlinePaint, selectionOutlineStroke);
        }
      } else if (DimensionLine === this.alignedObjectClass) {
        this.paintDimensionLineAlignmentFeedback(g2D, this.alignedObjectFeedback, level, this.locationFeeback, this.showPointFeedback, 
            selectionColor, locationFeedbackStroke, planScale, 
            selectionOutlinePaint, selectionOutlineStroke);
      }
    }
    if (this.centerAngleFeedback != null) {
      this.paintAngleFeedback(g2D, this.centerAngleFeedback, this.point1AngleFeedback, this.point2AngleFeedback, 
          planScale, selectionColor);
    }
    if (this.dimensionLinesFeedback != null) {
      var emptySelection = [];
      this.paintDimensionLines(g2D, this.dimensionLinesFeedback, emptySelection, level,
          null, null, null, locationFeedbackStroke, planScale, 
          backgroundColor, selectionColor, paintMode, true);
    }
    
    if (this.draggedItemsFeedback != null) {
      this.paintDimensionLines(g2D, Home.getDimensionLinesSubList(this.draggedItemsFeedback), this.draggedItemsFeedback, level,
          selectionOutlinePaint, dimensionLinesSelectionOutlineStroke, null, 
          locationFeedbackStroke, planScale, backgroundColor, foregroundColor, paintMode, false);
      this.paintLabels(g2D, Home.getLabelsSubList(this.draggedItemsFeedback), this.draggedItemsFeedback, level,
          selectionOutlinePaint, dimensionLinesSelectionOutlineStroke, null, 
          planScale, foregroundColor, paintMode);
      this.paintRoomsOutline(g2D, this.draggedItemsFeedback, level, selectionOutlinePaint, selectionOutlineStroke, null, 
          planScale, foregroundColor);
      this.paintWallsOutline(g2D, this.draggedItemsFeedback, level, selectionOutlinePaint, selectionOutlineStroke, null, 
          planScale, foregroundColor);
      this.paintFurniture(g2D, Home.getFurnitureSubList(this.draggedItemsFeedback), selectedItems, level, planScale, null, 
          foregroundColor, furnitureOutlineColor, paintMode, false);
      this.paintFurnitureOutline(g2D, this.draggedItemsFeedback, level, selectionOutlinePaint, selectionOutlineStroke, null, 
          planScale, foregroundColor);
    }
    
    this.paintRectangleFeedback(g2D, selectionColor, planScale);
  }
}

/**
 * Paints home items at the given scale, and with background and foreground colors.
 * Outline around selected items will be painted only under <code>PAINT</code> mode.
 * @param {Graphics2D} g
 * @param {Level} level
 * @param {number} planScale
 * @param {string} backgroundColor
 * @param {string} foregroundColor
 * @param {PlanComponent.PaintMode} paintMode
 */
PlanComponent.prototype.paintHomeItems = function(g2D, level, planScale, backgroundColor, foregroundColor, paintMode) {
  if (paintMode === undefined) {
    // 5 parameters
    paintMode = foregroundColor;  
    foregroundColor = backgroundColor; 
    backgroundColor = planScale; 
    planScale = level; 
    level = this.home.getSelectedLevel(); 
  }
  var plan = this;
  var selectedItems = this.home.getSelectedItems();
  if (this.sortedLevelFurniture == null) {
    this.sortedLevelFurniture = [];
    this.home.getFurniture().forEach(function(piece) {
        if (plan.isViewableAtLevel(piece, level)) {
          plan.sortedLevelFurniture.push(piece);
        }
      });
    CoreTools.sortArray(this.sortedLevelFurniture, {
        compare: function(piece1, piece2) {
          return (piece1.getGroundElevation() - piece2.getGroundElevation());
        }
      });
  }
  var selectionColor = this.getSelectionColor();
  var selectionOutlinePaint = ColorTools.toRGBAStyle(selectionColor, 0.5);
  var selectionOutlineStroke = new java.awt.BasicStroke(6 / planScale, 
      java.awt.BasicStroke.CAP_ROUND, java.awt.BasicStroke.JOIN_ROUND);
  var dimensionLinesSelectionOutlineStroke = new java.awt.BasicStroke(4 / planScale, 
      java.awt.BasicStroke.CAP_ROUND, java.awt.BasicStroke.JOIN_ROUND);
  var locationFeedbackStroke = new java.awt.BasicStroke(
      1 / planScale, java.awt.BasicStroke.CAP_SQUARE, java.awt.BasicStroke.JOIN_BEVEL, 0, 
      [20 / planScale, 5 / planScale, 5 / planScale, 5 / planScale], 4 / planScale);

  this.paintCompass(g2D, selectedItems, planScale, foregroundColor, paintMode);
  
  this.paintRooms(g2D, selectedItems, level, planScale, foregroundColor, paintMode);
  
  this.paintWalls(g2D, selectedItems, level, planScale, backgroundColor, foregroundColor, paintMode);
  
  this.paintFurniture(g2D, this.sortedLevelFurniture, selectedItems, level,
      planScale, backgroundColor, foregroundColor, this.getFurnitureOutlineColor(), paintMode, true);
  
  this.paintPolylines(g2D, this.home.getPolylines(), selectedItems, level,
      selectionOutlinePaint, selectionColor, planScale, foregroundColor, paintMode);
  
  this.paintDimensionLines(g2D, this.home.getDimensionLines(), selectedItems, level,
      selectionOutlinePaint, dimensionLinesSelectionOutlineStroke, selectionColor, 
      locationFeedbackStroke, planScale, backgroundColor, foregroundColor, paintMode, false);
  
  this.paintRoomsNameAndArea(g2D, selectedItems, planScale, foregroundColor, paintMode);
  
  this.paintFurnitureName(g2D, this.sortedLevelFurniture, selectedItems, planScale, foregroundColor, paintMode);
  
  this.paintLabels(g2D, this.home.getLabels(), selectedItems, level,
      selectionOutlinePaint, dimensionLinesSelectionOutlineStroke, 
      selectionColor, planScale, foregroundColor, paintMode);
  
  if (paintMode === PlanComponent.PaintMode.PAINT 
      && this.selectedItemsOutlinePainted) {
    this.paintCompassOutline(g2D, selectedItems, selectionOutlinePaint, selectionOutlineStroke, selectionColor, 
        planScale, foregroundColor);
    this.paintRoomsOutline(g2D, selectedItems, level, selectionOutlinePaint, selectionOutlineStroke, selectionColor, 
        planScale, foregroundColor);
    this.paintWallsOutline(g2D, selectedItems, level, selectionOutlinePaint, selectionOutlineStroke, selectionColor, 
        planScale, foregroundColor);
    this.paintFurnitureOutline(g2D, selectedItems, level, selectionOutlinePaint, selectionOutlineStroke, selectionColor, 
        planScale, foregroundColor);
  }
}

/**
 * Returns the color used to draw selection outlines.
 * @return {string}
 */
PlanComponent.prototype.getSelectionColor = function() {
  return PlanComponent.getDefaultSelectionColor(this);
}

/**
 * Returns the default color used to draw selection outlines.
 * Note that the default selection color may be forced using CSS by setting backgroundColor with the ::selection selector.
 * In case the browser does not support the ::selection selector, one can force the selectio color in JavaScript by setting PlanComponent.DEFAULT_SELECTION_COLOR.
 * @param {PlanComponent} planComponent
 * @return {string}
 */
PlanComponent.getDefaultSelectionColor = function(planComponent) {
  if (PlanComponent.DEFAULT_SELECTION_COLOR == null) {
    var color = window.getComputedStyle(planComponent.container, "::selection").backgroundColor;
    if (color.indexOf("rgb") === -1 
        || ColorTools.isTransparent(color) 
        || color == window.getComputedStyle(planComponent.container).backgroundColor) {
      planComponent.container.style.color = "Highlight";
      color = window.getComputedStyle(planComponent.container).color;
    }
    if (color.indexOf("rgb") === -1 
        || ColorTools.isTransparent(color) 
        || color == window.getComputedStyle(planComponent.container).backgroundColor) {
      PlanComponent.DEFAULT_SELECTION_COLOR = "#0042E0";
    } else {
      PlanComponent.DEFAULT_SELECTION_COLOR = ColorTools.styleToHexadecimalString(color);
    }
  }
  return PlanComponent.DEFAULT_SELECTION_COLOR;
}

/**
 * Returns the color used to draw furniture outline of
 * the shape where a user can click to select a piece of furniture.
 * @return {string}
 */
PlanComponent.prototype.getFurnitureOutlineColor = function() {
  return ColorTools.toRGBAStyle(this.getForeground(), 0.33);
}

/**
 * Paints rooms.
 * @param {Graphics2D} g2D
 * @param {Object[]} selectedItems
 * @param {Level} level
 * @param {number} planScale
 * @param {string} foregroundColor
 * @param {PlanComponent.PaintMode} paintMode
 * @private
 */
PlanComponent.prototype.paintRooms = function(g2D, selectedItems, level, planScale, foregroundColor, paintMode) {
  var plan = this;
  if (this.sortedLevelRooms == null) {
    this.sortedLevelRooms = [];
    this.home.getRooms().forEach(function(room) {
        if (plan.isViewableAtLevel(room, level)) {
          plan.sortedLevelRooms.push(room);
        }
      });
    CoreTools.sortArray(this.sortedLevelRooms, {
        compare: function(room1, room2) {
          if (room1.isFloorVisible() === room2.isFloorVisible() 
              && room1.isCeilingVisible() === room2.isCeilingVisible()) {
            return 0;
          } else if (!room1.isFloorVisible() && !room1.isCeilingVisible()
                     || room1.isFloorVisible() && room2.isCeilingVisible()) {
            return -1;
          } else {
            return 1;
          }
        }
      });
  }
  var defaultFillPaint = paintMode === PlanComponent.PaintMode.PRINT
      ? "#000000" 
      : "#808080";
  g2D.setStroke(new java.awt.BasicStroke(this.getStrokeWidth(Room, paintMode) / planScale));
  for (var i = 0; i < this.sortedLevelRooms.length; i++) {
    var room = plan.sortedLevelRooms[i];
    var selectedRoom = selectedItems.indexOf(room) >= 0;
    if (paintMode !== PlanComponent.PaintMode.CLIPBOARD 
        || selectedRoom) {
      g2D.setPaint(defaultFillPaint);
      var textureAngle = 0;
      var textureScaleX = 1;
      var textureScaleY = 1;
      var textureOffsetX = 0;
      var textureOffsetY = 0;
      var floorTexture = null;
      if (plan.preferences.isRoomFloorColoredOrTextured() && room.isFloorVisible()) {
        if (room.getFloorColor() != null) {
          g2D.setPaint(ColorTools.integerToHexadecimalString(room.getFloorColor()));
        } else {
          floorTexture = room.getFloorTexture();
          if (floorTexture != null) {
            if (plan.floorTextureImagesCache == null) {
              plan.floorTextureImagesCache = {};
            }
            var textureImage = plan.floorTextureImagesCache[floorTexture.getImage().getURL()];
            if (textureImage == null) {
              textureImage = PlanComponent.WAIT_TEXTURE_IMAGE;
              plan.floorTextureImagesCache[floorTexture.getImage().getURL()] = textureImage;
              var waitForTexture = paintMode !== PlanComponent.PaintMode.PAINT;
              TextureManager.getInstance().loadTexture(floorTexture.getImage(), waitForTexture, {
                  floorTexture: floorTexture,
                  textureUpdated: function(texture) {
                    plan.floorTextureImagesCache[this.floorTexture.getImage().getURL()] = texture;
                    if (!waitForTexture) {
                      plan.repaint();
                    }
                  },
                  textureError: function() {
                    plan.floorTextureImagesCache[this.floorTexture.getImage().getURL()] = PlanComponent.ERROR_TEXTURE_IMAGE;
                  },
                  progression: function() { }
                });
            }
            if (room.getFloorTexture().isFittingArea()) {
              var min = room.getBoundsMinimumCoordinates();
              var max = room.getBoundsMaximumCoordinates();
              textureScaleX = (max[0] - min[0]) / textureImage.naturalWidth;
              textureScaleY = (max[1] - min[1]) / textureImage.naturalHeight;
              textureOffsetX = min[0] / textureScaleX;
              textureOffsetY = min[1] / textureScaleY;
            } else {
              var textureWidth = floorTexture.getWidth();
              var textureHeight = floorTexture.getHeight();
              if (textureWidth === -1 || textureHeight === -1) {
                textureWidth = 100;
                textureHeight = 100;
              }
              var textureScale = floorTexture.getScale();
              textureScaleX = (textureWidth * textureScale) / textureImage.naturalWidth;
              textureScaleY = (textureHeight * textureScale) / textureImage.naturalHeight;
              textureAngle = floorTexture.getAngle();
              var cosAngle = Math.cos(textureAngle);
              var sinAngle = Math.sin(textureAngle);
              textureOffsetX = (floorTexture.getXOffset() * textureImage.naturalWidth * cosAngle - floorTexture.getYOffset() * textureImage.height * sinAngle);
              textureOffsetY = (-floorTexture.getXOffset() * textureImage.naturalWidth * sinAngle - floorTexture.getYOffset() * textureImage.height * cosAngle);
            }
            g2D.setPaint(g2D.createPattern(textureImage));
          }
        }
      }
      
      var oldComposite = plan.setTransparency(g2D, room.isFloorVisible() ? 0.75 : 0.5);
      var transform = null;
      if (floorTexture != null) {
        g2D.scale(textureScaleX, textureScaleY);
        g2D.rotate(textureAngle, 0, 0);
        g2D.translate(textureOffsetX, textureOffsetY);
        transform = java.awt.geom.AffineTransform.getTranslateInstance(-textureOffsetX, -textureOffsetY);
        transform.rotate(-textureAngle, 0, 0);
        transform.scale(1 / textureScaleX, 1 / textureScaleY);
      }
      var roomShape = ShapeTools.getShape(room.getPoints(), true, transform);
      plan.fillShape(g2D, roomShape, paintMode);
      if (floorTexture != null) {
        g2D.translate(-textureOffsetX, -textureOffsetY);
        g2D.rotate(-textureAngle, 0, 0);
        g2D.scale(1 / textureScaleX, 1 / textureScaleY);
        roomShape = ShapeTools.getShape(room.getPoints(), true);
      }
      g2D.setAlpha(oldComposite);
      g2D.setPaint(foregroundColor);
      g2D.draw(roomShape);
    }
  }
}

/**
 * Fills the given <code>shape</code>.
 * @param {Graphics2D} g2D
 * @param {Object} shape
 * @param {PlanComponent.PaintMode} paintMode
 * @private
 */
PlanComponent.prototype.fillShape = function(g2D, shape, paintMode) {
  g2D.fill(shape);
}

/**
 * Returns <code>true</code> if <code>TextureManager</code> can be used to manage textures.
 * @return {boolean}
 * @private
 */
PlanComponent.isTextureManagerAvailable = function() {
  return true;
}

/**
 * Paints rooms name and area.
 * @param {Graphics2D} g2D
 * @param {Object[]} selectedItems
 * @param {number} planScale
 * @param {string} foregroundColor
 * @param {PlanComponent.PaintMode} paintMode
 * @private
 */
PlanComponent.prototype.paintRoomsNameAndArea = function(g2D, selectedItems, planScale, foregroundColor, paintMode) {
  var plan = this;
  g2D.setPaint(foregroundColor);
  var previousFont = g2D.getFont();
  this.sortedLevelRooms.forEach(function(room) {
      var selectedRoom = (selectedItems.indexOf(room) >= 0);
      if (paintMode !== PlanComponent.PaintMode.CLIPBOARD 
          || selectedRoom) {
        var xRoomCenter = room.getXCenter();
        var yRoomCenter = room.getYCenter();
        var name = room.getName();
        if (name != null) {
          name = name.trim();
          if (name.length > 0) {
            plan.paintText(g2D, room.constructor, name, room.getNameStyle(), null, 
                xRoomCenter + room.getNameXOffset(), 
                yRoomCenter + room.getNameYOffset(), 
                room.getNameAngle(), previousFont);
          }
        }
        if (room.isAreaVisible()) {
          var area = room.getArea();
          if (area > 0.01) {
            var areaText = plan.preferences.getLengthUnit().getAreaFormatWithUnit().format(area);
            plan.paintText(g2D, room.constructor, areaText, room.getAreaStyle(), null, 
                xRoomCenter + room.getAreaXOffset(), 
                yRoomCenter + room.getAreaYOffset(), 
                room.getAreaAngle(), previousFont);
          }
        }
      }
    });
  g2D.setFont(previousFont);
}

/**
 * Paints the given <code>text</code> centered at the point (<code>x</code>,<code>y</code>).
 * @param {Graphics2D} g2D
 * @param {Object} selectableClass
 * @param {string} text
 * @param {TextStyle} style
 * @param {number} outlineColor
 * @param {number} x
 * @param {number} y
 * @param {number} angle
 * @param {string} defaultFont
 * @private
 */
PlanComponent.prototype.paintText = function(g2D, selectableClass, text, style, outlineColor, x, y, angle, defaultFont) {
  var previousTransform = g2D.getTransform();
  g2D.translate(x, y);
  g2D.rotate(angle);
  if (style == null) {
    style = this.preferences.getDefaultTextStyle(selectableClass);
  }
  var fontMetrics = this.getFontMetrics(defaultFont, style);
  var lines = text.replace(/\n*$/, "").split("\n");
  var lineWidths = new Array(lines.length);
  var textWidth = -3.4028235E38;
  for (var i = 0; i < lines.length; i++) {
    lineWidths[i] = fontMetrics.getStringBounds(lines[i]).getWidth();
    textWidth = Math.max(lineWidths[i], textWidth);
  }
  var stroke = null;
  var font;
  if (outlineColor != null) {
    stroke = new java.awt.BasicStroke(style.getFontSize() * 0.05);
    // Call directly the overloaded deriveStyle method that takes a float parameter 
    // to avoid confusion with the one that takes a TextStyle.Alignment parameter
    var outlineStyle = style.deriveStyle$float(style.getFontSize() - stroke.getLineWidth());
    font = this.getFont(defaultFont, outlineStyle);
    g2D.setStroke(stroke);
  } else {
    font = this.getFont(defaultFont, style);
  }
  g2D.setFont(font);
  
  for (var i = lines.length - 1; i >= 0; i--) {
    var line = lines[i];
    var translationX = void 0;
    if (style.getAlignment() === TextStyle.Alignment.LEFT) {
      translationX = 0;
    } else if (style.getAlignment() === TextStyle.Alignment.RIGHT) {
      translationX = -lineWidths[i];
    } else {
      translationX = -lineWidths[i] / 2;
    }
    if (outlineColor != null) {
      translationX += stroke.getLineWidth() / 2;
    }
    g2D.translate(translationX, 0);
    if (outlineColor != null) {
      var defaultColor = g2D.getColor();
      g2D.setColor(ColorTools.integerToHexadecimalString(outlineColor));
      g2D.drawStringOutline(line, 0, 0);
      g2D.setColor(defaultColor);
    }
    g2D.drawString(line, 0, 0);
    g2D.translate(-translationX, -fontMetrics.getHeight());
  }
  g2D.setTransform(previousTransform);
}

/**
 * Paints the outline of rooms among <code>items</code> and indicators if
 * <code>items</code> contains only one room and indicator paint isn't <code>null</code>.
 * @param {Graphics2D} g2D
 * @param {Object[]} items
 * @param {Level} level
 * @param {string|CanvasPattern} selectionOutlinePaint
 * @param {java.awt.BasicStroke} selectionOutlineStroke
 * @param {string|CanvasPattern} indicatorPaint
 * @param {number} planScale
 * @param {string} foregroundColor
 * @private
 */
PlanComponent.prototype.paintRoomsOutline = function(g2D, items, level, selectionOutlinePaint, selectionOutlineStroke, indicatorPaint, planScale, foregroundColor) {
  var rooms = Home.getRoomsSubList(items);
  var previousTransform = g2D.getTransform();
  var scaleInverse = 1 / planScale;
  for (var i = 0; i < rooms.length; i++) {
    var room = rooms[i];
    if (this.isViewableAtLevel(room, level)) {
      g2D.setPaint(selectionOutlinePaint);
      g2D.setStroke(selectionOutlineStroke);
      g2D.draw(ShapeTools.getShape(room.getPoints(), true, null));
      
      if (indicatorPaint != null) {
        g2D.setPaint(indicatorPaint);
        room.getPoints().forEach(function(point) {
            g2D.translate(point[0], point[1]);
            g2D.scale(scaleInverse, scaleInverse);
            g2D.setStroke(PlanComponent.POINT_STROKE);
            g2D.fill(PlanComponent.WALL_POINT);
            g2D.setTransform(previousTransform);
          });
      }
    }
  }
  
  g2D.setPaint(foregroundColor);
  g2D.setStroke(new java.awt.BasicStroke(this.getStrokeWidth(Room, PlanComponent.PaintMode.PAINT) / planScale));
  for (var i = 0; i < rooms.length; i++) {
    var room = rooms[i];
    if (this.isViewableAtLevel(room, level)) {
      g2D.draw(ShapeTools.getShape(room.getPoints(), true, null));
    }
  }
  
  if (items.length === 1 
      && rooms.length === 1 
      && indicatorPaint != null) {
    var selectedRoom = rooms[0];
    if (this.isViewableAtLevel(room, level)) {
      g2D.setPaint(indicatorPaint);
      this.paintPointsResizeIndicators(g2D, selectedRoom, indicatorPaint, planScale, true, 0, 0, true);
      this.paintRoomNameOffsetIndicator(g2D, selectedRoom, indicatorPaint, planScale);
      this.paintRoomAreaOffsetIndicator(g2D, selectedRoom, indicatorPaint, planScale);
    }
  }
}

/**
 * Paints resize indicators on selectable <code>item</code>.
 * @param {Graphics2D} g2D
 * @param {Object} item
 * @param {string|CanvasPattern} indicatorPaint
 * @param {number} planScale
 * @param {boolean} closedPath
 * @param {number} angleAtStart
 * @param {number} angleAtEnd
 * @param {boolean} orientateIndicatorOutsideShape
 * @private
 */
PlanComponent.prototype.paintPointsResizeIndicators = function(g2D, item, indicatorPaint, planScale, closedPath, angleAtStart, angleAtEnd, orientateIndicatorOutsideShape) {
  if (this.resizeIndicatorVisible) {
    g2D.setPaint(indicatorPaint);
    g2D.setStroke(PlanComponent.INDICATOR_STROKE);
    var previousTransform = g2D.getTransform();
    var scaleInverse = 1 / planScale;
    var points = item.getPoints();
    var resizeIndicator = this.getIndicator(item, PlanComponent.IndicatorType.RESIZE);
    for (var i = 0; i < points.length; i++) {
      var point = points[i];
      g2D.translate(point[0], point[1]);
      g2D.scale(scaleInverse, scaleInverse);
      var previousPoint = i === 0 
          ? points[points.length - 1]
          : points[i - 1];
      var nextPoint = i === points.length - 1 
          ? points[0] 
          : points[i + 1];
      var angle = void 0;
      if (closedPath || (i > 0 && i < points.length - 1)) {
        var distance1 = java.awt.geom.Point2D.distance(
            previousPoint[0], previousPoint[1], point[0], point[1]);
        var xNormal1 = (point[1] - previousPoint[1]) / distance1;
        var yNormal1 = (previousPoint[0] - point[0]) / distance1;
        var distance2 = java.awt.geom.Point2D.distance(
            nextPoint[0], nextPoint[1], point[0], point[1]);
        var xNormal2 = (nextPoint[1] - point[1]) / distance2;
        var yNormal2 = (point[0] - nextPoint[0]) / distance2;
        angle = Math.atan2(yNormal1 + yNormal2, xNormal1 + xNormal2);
        if (orientateIndicatorOutsideShape 
              && item.containsPoint(point[0] + Math.cos(angle), 
                  point[1] + Math.sin(angle), 0.001) 
            || !orientateIndicatorOutsideShape 
                && (xNormal1 * yNormal2 - yNormal1 * xNormal2) < 0) {
          angle += Math.PI;
        }
      } else if (i === 0) {
        angle = angleAtStart;
      } else {
        angle = angleAtEnd;
      }
      g2D.rotate(angle);
      g2D.draw(resizeIndicator);
      g2D.setTransform(previousTransform);
    }
  }
}

/**
 * Returns the shape of the given indicator type.
 * @param {Object} item
 * @param {PlanComponent.IndicatorType} indicatorType
 * @return {Object}
 */
PlanComponent.prototype.getIndicator = function(item, indicatorType) {
  if (PlanComponent.IndicatorType.RESIZE === indicatorType) {
    if (item instanceof HomePieceOfFurniture) {
      return PlanComponent.FURNITURE_RESIZE_INDICATOR;
    } else if (item instanceof Compass) {
      return PlanComponent.COMPASS_RESIZE_INDICATOR;
    } else {
      return PlanComponent.WALL_AND_LINE_RESIZE_INDICATOR;
    }
  } else if (PlanComponent.IndicatorType.ROTATE === indicatorType) {
    if (item instanceof HomePieceOfFurniture) {
      return PlanComponent.FURNITURE_ROTATION_INDICATOR;
    } else if (item instanceof Compass) {
      return PlanComponent.COMPASS_ROTATION_INDICATOR;
    } else if (item instanceof Camera) {
      return PlanComponent.CAMERA_YAW_ROTATION_INDICATOR;
    } else if (item instanceof DimensionLine) {
      return PlanComponent.DIMENSION_LINE_HEIGHT_ROTATION_INDICATOR;
    }
  } else if (PlanComponent.IndicatorType.ELEVATE === indicatorType) {
    if (item instanceof Camera) {
      return PlanComponent.CAMERA_ELEVATION_INDICATOR;
    } else {
      return PlanComponent.ELEVATION_INDICATOR;
    }
  } else if (PlanComponent.IndicatorType.RESIZE_HEIGHT === indicatorType) {
    if (item instanceof HomePieceOfFurniture) {
      return PlanComponent.FURNITURE_HEIGHT_INDICATOR;
    } else if (item instanceof DimensionLine) {
      return PlanComponent.DIMENSION_LINE_HEIGHT_INDICATOR;
    }
  } else if (PlanComponent.IndicatorType.CHANGE_POWER === indicatorType) {
    if (item instanceof HomeLight) {
      return PlanComponent.LIGHT_POWER_INDICATOR;
    }
  } else if (PlanComponent.IndicatorType.MOVE_TEXT === indicatorType) {
    return PlanComponent.TEXT_LOCATION_INDICATOR;
  } else if (PlanComponent.IndicatorType.ROTATE_TEXT === indicatorType) {
    return PlanComponent.TEXT_ANGLE_INDICATOR;
  } else if (PlanComponent.IndicatorType.ROTATE_PITCH === indicatorType) {
    if (item instanceof HomePieceOfFurniture) {
      return PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR;
    } else if (item instanceof Camera) {
      return PlanComponent.CAMERA_PITCH_ROTATION_INDICATOR;
    }
  } else if (PlanComponent.IndicatorType.ROTATE_ROLL === indicatorType) {
    if (item instanceof HomePieceOfFurniture) {
      return PlanComponent.FURNITURE_ROLL_ROTATION_INDICATOR;
    }
  } else if (PlanComponent.IndicatorType.ARC_EXTENT === indicatorType) {
    if (item instanceof Wall) {
      return PlanComponent.WALL_ARC_EXTENT_INDICATOR;
    }
  }
  return null;
}

/**
 * Paints name indicator on <code>room</code>.
 * @param {Graphics2D} g2D
 * @param {Room} room
 * @param {string|CanvasPattern} indicatorPaint
 * @param {number} planScale
 * @private
 */
PlanComponent.prototype.paintRoomNameOffsetIndicator = function(g2D, room, indicatorPaint, planScale) {
  if (this.resizeIndicatorVisible 
      && room.getName() != null 
      && room.getName().trim().length > 0) {
    var xName = room.getXCenter() + room.getNameXOffset();
    var yName = room.getYCenter() + room.getNameYOffset();
    this.paintTextIndicators(g2D, room, this.getLineCount(room.getName()), 
        room.getNameStyle(), xName, yName, room.getNameAngle(), indicatorPaint, planScale);
  }
}

/**
 * Paints resize indicator on <code>room</code>.
 * @param {Graphics2D} g2D
 * @param {Room} room
 * @param {string|CanvasPattern} indicatorPaint
 * @param {number} planScale
 * @private
 */
PlanComponent.prototype.paintRoomAreaOffsetIndicator = function(g2D, room, indicatorPaint, planScale) {
  if (this.resizeIndicatorVisible 
      && room.isAreaVisible() 
      && room.getArea() > 0.01) {
    var xArea = room.getXCenter() + room.getAreaXOffset();
    var yArea = room.getYCenter() + room.getAreaYOffset();
    this.paintTextIndicators(g2D, room, 1, room.getAreaStyle(), xArea, yArea, room.getAreaAngle(), 
        indicatorPaint, planScale);
  }
}

/**
 * Paints text location and angle indicators at the given coordinates.
 * @param {Graphics2D} g2D
 * @param {Object} selectableObject
 * @param {number} lineCount
 * @param {TextStyle} style
 * @param {number} x
 * @param {number} y
 * @param {number} angle
 * @param {string|CanvasPattern} indicatorPaint
 * @param {number} planScale
 * @private
 */
PlanComponent.prototype.paintTextIndicators = function(g2D, selectableObject, lineCount, style, x, y, angle, indicatorPaint, planScale) {
  if (this.resizeIndicatorVisible) {
    g2D.setPaint(indicatorPaint);
    g2D.setStroke(PlanComponent.INDICATOR_STROKE);
    var previousTransform = g2D.getTransform();
    var scaleInverse = 1 / planScale;
    g2D.translate(x, y);
    g2D.rotate(angle);
    g2D.scale(scaleInverse, scaleInverse);
    if (selectableObject instanceof Label) {
      g2D.draw(PlanComponent.LABEL_CENTER_INDICATOR);
    } else {
      g2D.draw(this.getIndicator(null, PlanComponent.IndicatorType.MOVE_TEXT));
    }
    if (style == null) {
      style = this.preferences.getDefaultTextStyle(selectableObject);
    }
    var fontMetrics = this.getFontMetrics(g2D.getFont(), style);
    g2D.setTransform(previousTransform);
    g2D.translate(x, y);
    g2D.rotate(angle);
    g2D.translate(0, -fontMetrics.getHeight() * (lineCount - 1) 
        - fontMetrics.getAscent() * (selectableObject instanceof Label ? 1 : 0.85));
    g2D.scale(scaleInverse, scaleInverse);
    g2D.draw(this.getIndicator(null, PlanComponent.IndicatorType.ROTATE_TEXT));
    g2D.setTransform(previousTransform);
  }
}

/**
 * Returns the number of lines in the given <code>text</code> ignoring trailing line returns.
 * @param {string} text
 * @return {number}
 * @private
 */
PlanComponent.prototype.getLineCount = function(text) {
  var lineCount = 1;
  var i = text.length - 1;
  while (i >= 0 && text.charAt(i) == '\n') {
    i--;
  }
  for ( ; i >= 0; i--) {
    if (text.charAt(i) == '\n') {
      lineCount++;
    }
  }
  return lineCount;
}

/**
 * Paints walls.
 * @param {Graphics2D} g2D
 * @param {Object[]} selectedItems
 * @param {Level}  level
 * @param {number} planScale
 * @param {string} backgroundColor
 * @param {string} foregroundColor
 * @param {PlanComponent.PaintMode} paintMode
 * @private
 */
PlanComponent.prototype.paintWalls = function(g2D, selectedItems, level, planScale, backgroundColor, foregroundColor, paintMode) {
  var paintedWalls;
  var wallAreas;
  if (paintMode !== PlanComponent.PaintMode.CLIPBOARD) {
    wallAreas = this.getWallAreasAtLevel(level);
  } else {
    paintedWalls = Home.getWallsSubList(selectedItems);
    wallAreas = this.getWallAreas(this.getDrawableWallsAtLevel(paintedWalls, level));
  }
  var wallPaintScale = paintMode === PlanComponent.PaintMode.PRINT 
      ? planScale / 72 * 150 
      : planScale;
  var oldComposite = null;
  if (paintMode === PlanComponent.PaintMode.PAINT 
      && this.backgroundPainted 
      && this.backgroundImageCache != null 
      && this.wallsDoorsOrWindowsModification) {
    oldComposite = this.setTransparency(g2D, 0.5);
  }
  
  var areaEntries = wallAreas.entries == null ? [] : wallAreas.entries; // Parse entrySet
  for (var i = 0; i < areaEntries.length; i++) {
    var areaEntry = areaEntries[i];
    var wallPattern = areaEntry.getKey() [0].getPattern();
    this.fillAndDrawWallsArea(g2D, areaEntry.getValue(), planScale, 
        this.getWallPaint(g2D, wallPaintScale, backgroundColor, foregroundColor, 
            wallPattern != null ? wallPattern : this.preferences.getWallPattern()), foregroundColor, paintMode);
  }
  if (oldComposite != null) {
    g2D.setAlpha(oldComposite);
  }
}

/**
 * Fills and paints the given area.
 * @param {Graphics2D} g2D
 * @param {java.awt.geom.Area} area
 * @param {number} planScale
 * @param {string|CanvasPattern} fillPaint
 * @param {string|CanvasPattern} drawPaint
 * @param {PlanComponent.PaintMode} paintMode
 * @private
 */
PlanComponent.prototype.fillAndDrawWallsArea = function(g2D, area, planScale, fillPaint, drawPaint, paintMode) {
  g2D.setPaint(fillPaint);
  var patternScale = 1 / planScale;
  g2D.scale(patternScale, patternScale);
  var filledArea = area.clone();
  filledArea.transform(java.awt.geom.AffineTransform.getScaleInstance(1 / patternScale, 1 / patternScale));
  this.fillShape(g2D, filledArea, paintMode);
  g2D.scale(1 / patternScale, 1 / patternScale);
  g2D.setPaint(drawPaint);
  g2D.setStroke(new java.awt.BasicStroke(this.getStrokeWidth(Wall, paintMode) / planScale));
  g2D.draw(area);
}

/**
 * Paints the outline of walls among <code>items</code> and a resize indicator if
 * <code>items</code> contains only one wall and indicator paint isn't <code>null</code>.
 * @param {Graphics2D} g2D
 * @param {Object[]} items
 * @param {Level} level
 * @param {string|CanvasPattern} selectionOutlinePaint
 * @param {java.awt.BasicStroke} selectionOutlineStroke
 * @param {string|CanvasPattern} indicatorPaint
 * @param {number} planScale
 * @param {string} foregroundColor
 * @private
 */
PlanComponent.prototype.paintWallsOutline = function(g2D, items, level, selectionOutlinePaint, selectionOutlineStroke, indicatorPaint, planScale, foregroundColor) {
  var scaleInverse = 1 / planScale;
  var walls = Home.getWallsSubList(items);
  var previousTransform = g2D.getTransform();
  for (var i = 0; i < walls.length; i++) {
    var wall = walls[i];
    if (this.isViewableAtLevel(wall, level)) {
      g2D.setPaint(selectionOutlinePaint);
      g2D.setStroke(selectionOutlineStroke);
      g2D.draw(ShapeTools.getShape(wall.getPoints(), true, null));
      
      if (indicatorPaint != null) {
        g2D.translate(wall.getXStart(), wall.getYStart());
        g2D.scale(scaleInverse, scaleInverse);
        g2D.setPaint(indicatorPaint);
        g2D.setStroke(PlanComponent.POINT_STROKE);
        g2D.fill(PlanComponent.WALL_POINT);
        
        var arcExtent = wall.getArcExtent();
        var indicatorAngle = void 0;
        var distanceAtScale = void 0;
        var xArcCircleCenter = 0;
        var yArcCircleCenter = 0;
        var arcCircleRadius = 0;
        var startPointToEndPointDistance = wall.getStartPointToEndPointDistance();
        var wallAngle = Math.atan2(wall.getYEnd() - wall.getYStart(), 
            wall.getXEnd() - wall.getXStart());
        if (arcExtent != null && arcExtent !== 0) {
          xArcCircleCenter = wall.getXArcCircleCenter();
          yArcCircleCenter = wall.getYArcCircleCenter();
          arcCircleRadius = java.awt.geom.Point2D.distance(wall.getXStart(), wall.getYStart(), 
              xArcCircleCenter, yArcCircleCenter);
          distanceAtScale = arcCircleRadius * Math.abs(arcExtent) * planScale;
          indicatorAngle = Math.atan2(yArcCircleCenter - wall.getYStart(), 
                  xArcCircleCenter - wall.getXStart()) 
              + (arcExtent > 0 ? -Math.PI / 2 : Math.PI / 2);
        } else {
          distanceAtScale = startPointToEndPointDistance * planScale;
          indicatorAngle = wallAngle;
        }
        if (distanceAtScale < 30) {
          g2D.rotate(wallAngle);
          if (arcExtent != null) {
            var wallToStartPointArcCircleCenterAngle = Math.abs(arcExtent) > Math.PI 
                ? -(Math.PI + arcExtent) / 2 
                : (Math.PI - arcExtent) / 2;
            var arcCircleCenterToWallDistance = (Math.tan(wallToStartPointArcCircleCenterAngle) 
                * startPointToEndPointDistance / 2);
            g2D.translate(startPointToEndPointDistance * planScale / 2, 
                (arcCircleCenterToWallDistance - arcCircleRadius * (Math.abs(wallAngle) > Math.PI / 2 ? -1 : 1)) * planScale);
          } else {
            g2D.translate(distanceAtScale / 2, 0);
          }
        } else {
          g2D.rotate(indicatorAngle);
          g2D.translate(8, 0);
        }
        g2D.draw(PlanComponent.WALL_ORIENTATION_INDICATOR);
        g2D.setTransform(previousTransform);
        g2D.translate(wall.getXEnd(), wall.getYEnd());
        g2D.scale(scaleInverse, scaleInverse);
        g2D.fill(PlanComponent.WALL_POINT);
        if (distanceAtScale >= 30) {
          if (arcExtent != null) {
            indicatorAngle += arcExtent;
          }
          g2D.rotate(indicatorAngle);
          g2D.translate(-10, 0);
          g2D.draw(PlanComponent.WALL_ORIENTATION_INDICATOR);
        }
        g2D.setTransform(previousTransform);
      }
    }
  }
  g2D.setPaint(foregroundColor);
  g2D.setStroke(new java.awt.BasicStroke(this.getStrokeWidth(Wall, PlanComponent.PaintMode.PAINT) / planScale));
  var areas = CoreTools.valuesFromMap(this.getWallAreas(this.getDrawableWallsAtLevel(walls, level)));
  for (var i = 0; i < areas.length; i++) {
    g2D.draw(areas[i]);
  }
  if (items.length === 1 
      && walls.length === 1 
      && indicatorPaint != null) {
    var wall = walls[0];
    if (this.isViewableAtLevel(wall, level)) {
      this.paintWallResizeIndicators(g2D, wall, indicatorPaint, planScale);
    }
  }
}

/**
 * Returns <code>true</code> if the given item can be viewed in the plan at a level.
 * @param {Object} item
 * @param {Level} level
 * @return {boolean}
 */
PlanComponent.prototype.isViewableAtLevel = function(item, level) {
  var itemLevel = item.getLevel();
  return itemLevel == null
      || (itemLevel.isViewable()
          && item.isAtLevel(level));
}
  
/**
 * Returns <code>true</code> if the given item can be viewed in the plan at the selected level.
 * @deprecated Override {@link #isViewableAtLevel} if you want to print different levels
 * @param {Object} item
 * @return {boolean}
 */
PlanComponent.prototype.isViewableAtSelectedLevel = function(item) {
  return this.isViewableAtLevel(item, this.home.getSelectedLevel());
}

/**
 * Paints resize indicators on <code>wall</code>.
 * @param {Graphics2D} g2D
 * @param {Wall} wall
 * @param {string|CanvasPattern} indicatorPaint
 * @param {number} planScale
 * @private
 */
PlanComponent.prototype.paintWallResizeIndicators = function(g2D, wall, indicatorPaint, planScale) {
  if (this.resizeIndicatorVisible) {
    g2D.setPaint(indicatorPaint);
    g2D.setStroke(PlanComponent.INDICATOR_STROKE);
    var previousTransform = g2D.getTransform();
    var scaleInverse = 1 / planScale;
    var wallPoints = wall.getPoints();
    var leftSideMiddlePointIndex = (wallPoints.length / 4 | 0);
    var wallAngle = Math.atan2(wall.getYEnd() - wall.getYStart(), 
        wall.getXEnd() - wall.getXStart());
    
    if (wallPoints.length % 4 === 0) {
      g2D.translate((wallPoints[leftSideMiddlePointIndex - 1][0] + wallPoints[leftSideMiddlePointIndex][0]) / 2, 
          (wallPoints[leftSideMiddlePointIndex - 1][1] + wallPoints[leftSideMiddlePointIndex][1]) / 2);
    } else {
      g2D.translate(wallPoints[leftSideMiddlePointIndex][0], wallPoints[leftSideMiddlePointIndex][1]);
    }
    g2D.scale(scaleInverse, scaleInverse);
    g2D.rotate(wallAngle + Math.PI);
    g2D.draw(this.getIndicator(wall, PlanComponent.IndicatorType.ARC_EXTENT));
    g2D.setTransform(previousTransform);
    
    var arcExtent = wall.getArcExtent();
    var indicatorAngle = void 0;
    if (arcExtent != null && arcExtent !== 0) {
      indicatorAngle = Math.atan2(wall.getYArcCircleCenter() - wall.getYEnd(), 
              wall.getXArcCircleCenter() - wall.getXEnd()) 
          + (arcExtent > 0 ? -Math.PI / 2 : Math.PI / 2);
    } else {
      indicatorAngle = wallAngle;
    }
    
    g2D.translate(wall.getXEnd(), wall.getYEnd());
    g2D.scale(scaleInverse, scaleInverse);
    g2D.rotate(indicatorAngle);
    g2D.draw(this.getIndicator(wall, PlanComponent.IndicatorType.RESIZE));
    g2D.setTransform(previousTransform);
    
    if (arcExtent != null) {
      indicatorAngle += Math.PI - arcExtent;
    } else {
      indicatorAngle += Math.PI;
    }
    
    g2D.translate(wall.getXStart(), wall.getYStart());
    g2D.scale(scaleInverse, scaleInverse);
    g2D.rotate(indicatorAngle);
    g2D.draw(this.getIndicator(wall, PlanComponent.IndicatorType.RESIZE));
    g2D.setTransform(previousTransform);
  }
}

/**
 * Returns areas matching the union of home wall shapes sorted by pattern.
 * @param {Level} level
 * @return {Object}
 * @private
 */
PlanComponent.prototype.getWallAreasAtLevel = function(level) {
  if (this.wallAreasCache == null) {
    this.wallAreasCache = this.getWallAreas(this.getDrawableWallsAtLevel(this.home.getWalls(), level));
  }
  return this.wallAreasCache;
}

/**
 * Returns the walls that belong to the given <code>level</code> in home.
 * @param {Wall[]} walls
 * @param {Level} level
 * @return {Wall[]}
 * @private
 */
PlanComponent.prototype.getDrawableWallsAtLevel = function(walls, level) {
  var wallsAtLevel = [];
  for (var i = 0; i < walls.length; i++) {
    var wall = walls[i];
    if (this.isViewableAtLevel(wall, level)) {
      wallsAtLevel.push(wall);
    }
  }
  return wallsAtLevel;
}

/**
 * Returns areas matching the union of <code>walls</code> shapes sorted by pattern.
 * @param {Wall[]} walls
 * @return {Object} Map<Collection<Wall>, Area>
 * @private
 */
PlanComponent.prototype.getWallAreas = function(walls) {
  var plan = this;
  if (walls.length === 0) {
    return {};
  }
  var pattern = walls[0].getPattern();
  var samePattern = true;
  for (var i = 0; i < walls.length; i++) {
    if (pattern !== walls[i].getPattern()) {
      samePattern = false;
      break;
    }
  }
  var wallAreas = {};
  if (samePattern) {
    CoreTools.putToMap(wallAreas, walls, this.getItemsArea(walls));
  } else {
    var sortedWalls = {}; // LinkedHashMap
    walls.forEach(function(wall) {
        var wallPattern = wall.getPattern();
        if (wallPattern == null) {
          wallPattern = plan.preferences.getWallPattern();
        }
        var patternWalls = CoreTools.getFromMap(sortedWalls, wallPattern);
        if (patternWalls == null) {
          patternWalls = [];
          CoreTools.putToMap(sortedWalls, wallPattern, patternWalls);
        }
        patternWalls.push(wall);
      });
    
    var walls = CoreTools.valuesFromMap(sortedWalls);
    for (var i = 0; i < walls.length; i++) {
      var patternWalls = walls[i];
      CoreTools.putToMap(wallAreas, patternWalls, this.getItemsArea(patternWalls));
    }
  }
  return wallAreas;
}

/**
 * Returns an area matching the union of all <code>items</code> shapes.
 * @param {Bound[]} items
 * @return {java.awt.geom.Area}
 * @private
 */
PlanComponent.prototype.getItemsArea = function(items) {
  var itemsArea = new java.awt.geom.Area();
  items.forEach(function(item) { 
      itemsArea.add(new java.awt.geom.Area(ShapeTools.getShape(item.getPoints(), true, null))); 
    });
  return itemsArea;
}

/**
 * Modifies the pattern image to substitute the transparent color with backgroundColor and the black color with the foregroundColor.
 * @param {HTMLImageElement} image the orginal pattern image (black over transparent background)
 * @param {string} foregroundColor the foreground color
 * @param {string} backgroundColor the background color
 * @return {HTMLImageElement} the final pattern image with the substituted colors
 * @private
 */
PlanComponent.prototype.makePatternImage = function(image, foregroundColor, backgroundColor) {
  var canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  var context = canvas.getContext("2d");
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);
  var imageData = context.getImageData(0, 0, image.naturalWidth, image.height).data;
  var bgColor = ColorTools.hexadecimalStringToInteger(backgroundColor);
  var fgColor = ColorTools.hexadecimalStringToInteger(foregroundColor);
  var updatedImageData = context.createImageData(image.naturalWidth, image.height);
  for (var i = 0; i < imageData.length; i += 4) {
    updatedImageData.data[i + 3] = 0xFF;
    if (imageData[i] === 0xFF && imageData[i + 1] === 0xFF && imageData[i + 2] === 0xFF) {
      // Change white pixels to background color
      updatedImageData.data[i] = (bgColor & 0xFF0000) >> 16;
      updatedImageData.data[i + 1] = (bgColor & 0xFF00) >> 8;
      updatedImageData.data[i + 2] = bgColor & 0xFF;
    } else if (imageData[i] === 0 && imageData[i + 1] === 0 && imageData[i + 2] === 0) {
      // Change black pixels to foreground color
      updatedImageData.data[i] = (fgColor & 0xFF0000) >> 16;
      updatedImageData.data[i + 1] = (fgColor & 0xFF00) >> 8;
      updatedImageData.data[i + 2] = fgColor & 0xFF;
    } else {
      // Change color mixing foreground and background color 
      var percent = 1 - (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3. / 0xFF;
      updatedImageData.data[i] = Math.min(0xFF, ((fgColor & 0xFF0000) >> 16) * percent + ((bgColor & 0xFF0000) >> 16) * (1 - percent));
      updatedImageData.data[i + 1] = Math.min(0xFF, ((fgColor & 0xFF00) >> 8) * percent + ((bgColor & 0xFF00) >> 8) * (1 - percent));
      updatedImageData.data[i + 2] = Math.min(0xFF, (fgColor & 0xFF) * percent + (bgColor & 0xFF) * (1 - percent));
    }
  }
  context.putImageData(updatedImageData, 0, 0);
  image.src = canvas.toDataURL();
  return image;
}

/**
 * Returns the <code>Paint</code> object used to fill walls.
 * @param {Graphics2D} g2D
 * @param {number} planScale
 * @param {string} backgroundColor
 * @param {string} foregroundColor
 * @param {TextureImage} wallPattern
 * @return {Object}
 * @private
 */
PlanComponent.prototype.getWallPaint = function(g2D, planScale, backgroundColor, foregroundColor, wallPattern) {
  var plan = this;
  var patternImage = this.patternImagesCache[wallPattern.getImage().getURL()];
  if (patternImage == null 
      || backgroundColor != this.wallsPatternBackgroundCache 
      || foregroundColor != this.wallsPatternForegroundCache) {
    patternImage = TextureManager.getInstance().getWaitImage();
    this.patternImagesCache[wallPattern.getImage().getURL()] = patternImage;
    TextureManager.getInstance().loadTexture(wallPattern.getImage(), false, {
        textureUpdated: function(image) {
          plan.patternImagesCache[wallPattern.getImage().getURL()] = plan.makePatternImage(image, plan.getForeground(), plan.getBackground());
          plan.repaint();
        },
        textureError: function() {
          plan.patternImagesCache[wallPattern.getImage().getURL()] = PlanComponent.ERROR_TEXTURE_IMAGE;
        },
        progression: function() { }
      });
    this.wallsPatternBackgroundCache = backgroundColor;
    this.wallsPatternForegroundCache = foregroundColor;
  }
  return g2D.createPattern(patternImage);
}

/**
 * Paints home furniture.
 * @param {Graphics2D} g2D
 * @param {HomePieceOfFurniture[]} furniture
 * @param {Bound[]} selectedItems
 * @param {Level}  level 
 * @param {number} planScale
 * @param {string} backgroundColor
 * @param {string} foregroundColor
 * @param {string} furnitureOutlineColor
 * @param {PlanComponent.PaintMode} paintMode
 * @param {boolean} paintIcon
 * @private
 */
PlanComponent.prototype.paintFurniture = function(g2D, furniture, selectedItems, level, planScale, backgroundColor, foregroundColor, furnitureOutlineColor, paintMode, paintIcon) {
  if (!(furniture.length == 0)) {
    var pieceBorderStroke = new java.awt.BasicStroke(this.getStrokeWidth(HomePieceOfFurniture, paintMode) / planScale);
    var allFurnitureViewedFromTop = null;
    for (var i = 0; i < furniture.length; i++) {
      var piece = furniture[i];
      if (piece.isVisible()) {
        var selectedPiece = (selectedItems.indexOf((piece)) >= 0);
        if (piece instanceof HomeFurnitureGroup) {
          var groupFurniture = (piece).getFurniture();
          var emptyList = [];
          this.paintFurniture(g2D, groupFurniture, 
              selectedPiece 
                  ? groupFurniture 
                  : emptyList, level,
              planScale, backgroundColor, foregroundColor, 
              furnitureOutlineColor, paintMode, paintIcon);
        } else if (paintMode !== PlanComponent.PaintMode.CLIPBOARD || selectedPiece) {
          var pieceShape = ShapeTools.getShape(piece.getPoints(), true, null);
          var pieceShape2D = void 0;
          if (piece instanceof HomeDoorOrWindow) {
            var doorOrWindow = piece;
            pieceShape2D = this.getDoorOrWindowWallPartShape(doorOrWindow);
            if (this.draggedItemsFeedback == null 
                || !(this.draggedItemsFeedback.indexOf((piece)) >= 0)) {
              this.paintDoorOrWindowWallThicknessArea(g2D, doorOrWindow, planScale, backgroundColor, foregroundColor, paintMode);
            }
            this.paintDoorOrWindowSashes(g2D, doorOrWindow, planScale, foregroundColor, paintMode);
          } else {
            pieceShape2D = pieceShape;
          }
          
          var viewedFromTop = void 0;
          if (this.preferences.isFurnitureViewedFromTop()) {
            if (piece.getPlanIcon() != null 
                || (piece instanceof HomeDoorOrWindow)) {
              viewedFromTop = true;
            } else {
              allFurnitureViewedFromTop = PlanComponent.WEBGL_AVAILABLE;
              viewedFromTop = allFurnitureViewedFromTop;
            }
          } else {
            viewedFromTop = false;
          }
          if (paintIcon && viewedFromTop) {
            if (piece instanceof HomeDoorOrWindow) {
              g2D.setPaint(backgroundColor);
              g2D.fill(pieceShape2D);
              g2D.setPaint(foregroundColor);
              g2D.setStroke(pieceBorderStroke);
              g2D.draw(pieceShape2D);
            } else {
              this.paintPieceOfFurnitureTop(g2D, piece, pieceShape2D, pieceBorderStroke, planScale, 
                  backgroundColor, foregroundColor, paintMode);
            }
            if (paintMode === PlanComponent.PaintMode.PAINT) {
              g2D.setStroke(pieceBorderStroke);
              g2D.setPaint(furnitureOutlineColor);
              g2D.draw(pieceShape);
            }
          } else {
            if (paintIcon) {
              this.paintPieceOfFurnitureIcon(g2D, piece, null, pieceShape2D, planScale, 
                  backgroundColor, paintMode);
            }
            g2D.setPaint(foregroundColor);
            g2D.setStroke(pieceBorderStroke);
            g2D.draw(pieceShape2D);
            if ((piece instanceof HomeDoorOrWindow) 
                && paintMode === PlanComponent.PaintMode.PAINT) {
              g2D.setPaint(furnitureOutlineColor);
              g2D.draw(pieceShape);
            }
          }
        }
      }
    }
  }
}

/**
 * Returns the shape of the wall part of a door or a window.
 * @param {HomeDoorOrWindow} doorOrWindow
 * @return {Object}
 * @private
 */
PlanComponent.prototype.getDoorOrWindowWallPartShape = function(doorOrWindow) {
  var doorOrWindowWallPartRectangle = this.getDoorOrWindowRectangle(doorOrWindow, true);
  var rotation = java.awt.geom.AffineTransform.getRotateInstance(
      doorOrWindow.getAngle(), doorOrWindow.getX(), doorOrWindow.getY());
  var it = doorOrWindowWallPartRectangle.getPathIterator(rotation);
  var doorOrWindowWallPartShape = new java.awt.geom.GeneralPath();
  doorOrWindowWallPartShape.append(it, false);
  return doorOrWindowWallPartShape;
}

/**
 * Returns the rectangle of a door or a window.
 * @param {HomeDoorOrWindow} doorOrWindow
 * @param {boolean} onlyWallPart
 * @return {java.awt.geom.Rectangle2D}
 * @private
 */
PlanComponent.prototype.getDoorOrWindowRectangle = function(doorOrWindow, onlyWallPart) {
  var wallThickness = doorOrWindow.getDepth() * (onlyWallPart ? doorOrWindow.getWallThickness() : 1);
  var wallDistance = doorOrWindow.getDepth() * (onlyWallPart ? doorOrWindow.getWallDistance() : 0);
  var cutOutShape = doorOrWindow.getCutOutShape();
  var width = doorOrWindow.getWidth();
  var wallWidth = doorOrWindow.getWallWidth() * width;
  var x = doorOrWindow.getX() - width / 2;
  x += doorOrWindow.isModelMirrored() 
      ? (1 - doorOrWindow.getWallLeft() - doorOrWindow.getWallWidth()) * width 
      : doorOrWindow.getWallLeft() * width;
  if (cutOutShape != null 
      && PieceOfFurniture.DEFAULT_CUT_OUT_SHAPE != cutOutShape) {
    var shape = ShapeTools.getShape(cutOutShape);
    var bounds = shape.getBounds2D();
    if (doorOrWindow.isModelMirrored()) {
      x += (1 - bounds.getX() - bounds.getWidth()) * wallWidth;
    } else {
      x += bounds.getX() * wallWidth;
    }
    wallWidth *= bounds.getWidth();
  }
  var doorOrWindowWallPartRectangle = new java.awt.geom.Rectangle2D.Float(
      x, doorOrWindow.getY() - doorOrWindow.getDepth() / 2 + wallDistance, 
      wallWidth, wallThickness);
  return doorOrWindowWallPartRectangle;
}

/**
 * Paints the shape of a door or a window in the thickness of the wall it intersects.
 * @param {Graphics2D} g2D
 * @param {HomeDoorOrWindow} doorOrWindow
 * @param {number} planScale
 * @param {string} backgroundColor
 * @param {string} foregroundColor
 * @param {PlanComponent.PaintMode} paintMode
 * @private
 */
PlanComponent.prototype.paintDoorOrWindowWallThicknessArea = function(g2D, doorOrWindow, planScale, backgroundColor, foregroundColor, paintMode) {
  if (doorOrWindow.isWallCutOutOnBothSides()) {
    var doorOrWindowWallArea = null;
    if (this.doorOrWindowWallThicknessAreasCache != null) {
      doorOrWindowWallArea = CoreTools.getFromMap(this.doorOrWindowWallThicknessAreasCache, doorOrWindow);
    }
    
    if (doorOrWindowWallArea == null) {
      var doorOrWindowRectangle = this.getDoorOrWindowRectangle(doorOrWindow, false);
      var rotation = java.awt.geom.AffineTransform.getRotateInstance(
          doorOrWindow.getAngle(), doorOrWindow.getX(), doorOrWindow.getY());
      var it = doorOrWindowRectangle.getPathIterator(rotation);
      var doorOrWindowWallPartShape = new java.awt.geom.GeneralPath();
      doorOrWindowWallPartShape.append(it, false);
      var doorOrWindowWallPartArea = new java.awt.geom.Area(doorOrWindowWallPartShape);
      
      doorOrWindowWallArea = new java.awt.geom.Area();
      var walls = this.home.getWalls();
      for (var i = 0; i < walls.length; i++) {
        var wall = walls[i];
        if (wall.isAtLevel(doorOrWindow.getLevel()) 
            && doorOrWindow.isParallelToWall(wall)) {
          var wallShape = ShapeTools.getShape(wall.getPoints(), true, null);
          var wallArea = new java.awt.geom.Area(wallShape);
          wallArea.intersect(doorOrWindowWallPartArea);
          if (!wallArea.isEmpty()) {
            var doorOrWindowExtendedRectangle = new java.awt.geom.Rectangle2D.Float(
                doorOrWindowRectangle.getX(), 
                doorOrWindowRectangle.getY() - 2 * wall.getThickness(), 
                doorOrWindowRectangle.getWidth(), 
                doorOrWindowRectangle.getWidth() + 4 * wall.getThickness());
            it = doorOrWindowExtendedRectangle.getPathIterator(rotation);
            var path = new java.awt.geom.GeneralPath();
            path.append(it, false);
            wallArea = new java.awt.geom.Area(wallShape);
            wallArea.intersect(new java.awt.geom.Area(path));
            doorOrWindowWallArea.add(wallArea);
          }
        }
      }
    }
    
    if (this.doorOrWindowWallThicknessAreasCache == null) {
      this.doorOrWindowWallThicknessAreasCache = {};
    }
    CoreTools.putToMap(this.doorOrWindowWallThicknessAreasCache, doorOrWindow, doorOrWindowWallArea);
    
    g2D.setPaint(backgroundColor);
    g2D.fill(doorOrWindowWallArea);
    g2D.setPaint(foregroundColor);
    g2D.setStroke(new java.awt.BasicStroke(this.getStrokeWidth(HomePieceOfFurniture, paintMode) / planScale));
    g2D.draw(doorOrWindowWallArea);
  }
}

/**
 * Paints the sashes of a door or a window.
 * @param {Graphics2D} g2D
 * @param {HomeDoorOrWindow} doorOrWindow
 * @param {number} planScale
 * @param {string} foregroundColor
 * @param {PlanComponent.PaintMode} paintMode
 * @private
 */
PlanComponent.prototype.paintDoorOrWindowSashes = function(g2D, doorOrWindow, planScale, foregroundColor, paintMode) {
  var sashBorderStroke = new java.awt.BasicStroke(this.getStrokeWidth(HomePieceOfFurniture, paintMode) / planScale);
  g2D.setPaint(foregroundColor);
  g2D.setStroke(sashBorderStroke);
  var sashes = doorOrWindow.getSashes();
  for (var i = 0; i < sashes.length; i++) {
    g2D.draw(this.getDoorOrWindowSashShape(doorOrWindow, sashes[i]));
  }
}

/**
 * Returns the shape of a sash of a door or a window.
 * @param {HomeDoorOrWindow} doorOrWindow
 * @param {Sash} sash
 * @return {java.awt.geom.GeneralPath}
 * @private
 */
PlanComponent.prototype.getDoorOrWindowSashShape = function(doorOrWindow, sash) {
  var modelMirroredSign = doorOrWindow.isModelMirrored() ? -1 : 1;
  var xAxis = modelMirroredSign * sash.getXAxis() * doorOrWindow.getWidth();
  var yAxis = sash.getYAxis() * doorOrWindow.getDepth();
  var sashWidth = sash.getWidth() * doorOrWindow.getWidth();
  var startAngle = sash.getStartAngle() * 180 / Math.PI;
  if (doorOrWindow.isModelMirrored()) {
    startAngle = 180 - startAngle;
  }
  var extentAngle = modelMirroredSign * ((sash.getEndAngle() - sash.getStartAngle()) * 180 / Math.PI);
  
  var arc = new java.awt.geom.Arc2D.Float(xAxis - sashWidth, yAxis - sashWidth, 
      2 * sashWidth, 2 * sashWidth, 
      startAngle, extentAngle, java.awt.geom.Arc2D.PIE);
  var transformation = java.awt.geom.AffineTransform.getTranslateInstance(doorOrWindow.getX(), doorOrWindow.getY());
  transformation.rotate(doorOrWindow.getAngle());
  transformation.translate(modelMirroredSign * -doorOrWindow.getWidth() / 2, -doorOrWindow.getDepth() / 2);
  var it = arc.getPathIterator(transformation);
  var sashShape = new java.awt.geom.GeneralPath();
  sashShape.append(it, false);
  return sashShape;
}

/**
 * Paints home furniture visible name.
 * @param {Graphics2D} g2D
 * @param {HomePieceOfFurniture[]} furniture
 * @param {Bound[]} selectedItems
 * @param {number} planScale
 * @param {string} foregroundColor
 * @param {PlanComponent.PaintMode} paintMode
 * @private
 */
PlanComponent.prototype.paintFurnitureName = function(g2D, furniture, selectedItems, planScale, foregroundColor, paintMode) {
  var previousFont = g2D.getFont();
  g2D.setPaint(foregroundColor);
  for (var i = 0; i < furniture.length; i++) {
    var piece = furniture[i];
    if (piece.isVisible()) {
      var selectedPiece = (selectedItems.indexOf((piece)) >= 0);
      if (piece instanceof HomeFurnitureGroup) {
        var groupFurniture = (piece).getFurniture();
        var emptyList = [];
        this.paintFurnitureName(g2D, groupFurniture, 
            selectedPiece 
                ? groupFurniture 
                : emptyList, 
            planScale, foregroundColor, paintMode);
      }
      if (piece.isNameVisible() 
          && (paintMode !== PlanComponent.PaintMode.CLIPBOARD 
              || selectedPiece)) {
        var name = piece.getName().trim();
        if (name.length > 0) {
          this.paintText(g2D, piece.constructor, name, piece.getNameStyle(), null, 
              piece.getX() + piece.getNameXOffset(), 
              piece.getY() + piece.getNameYOffset(), 
              piece.getNameAngle(), previousFont);
        }
      }
    }
  }
  g2D.setFont(previousFont);
}

/**
 * Paints the outline of furniture among <code>items</code> and indicators if
 * <code>items</code> contains only one piece and indicator paint isn't <code>null</code>.
 * @param {Graphics2D} g2D
 * @param {Object[]} items
 * @param {Level} level 
 * @param {string|CanvasPattern} selectionOutlinePaint
 * @param {java.awt.BasicStroke} selectionOutlineStroke
 * @param {string|CanvasPattern} indicatorPaint
 * @param {number} planScale
 * @param {string} foregroundColor
 * @private
 */
PlanComponent.prototype.paintFurnitureOutline = function(g2D, items, level, selectionOutlinePaint, selectionOutlineStroke, indicatorPaint, planScale, foregroundColor) {
  var plan = this;
  var pieceBorderStroke = new java.awt.BasicStroke(this.getStrokeWidth(HomePieceOfFurniture, PlanComponent.PaintMode.PAINT) / planScale);
  var pieceFrontBorderStroke = new java.awt.BasicStroke(4 * this.getStrokeWidth(HomePieceOfFurniture, PlanComponent.PaintMode.PAINT) / planScale, 
      java.awt.BasicStroke.CAP_BUTT, java.awt.BasicStroke.JOIN_MITER);
  
  var furniture = Home.getFurnitureSubList(items);
  var paintedFurniture = [];
  var furnitureGroupsArea = null;
  var furnitureGroupsStroke = new java.awt.BasicStroke(15 / planScale, java.awt.BasicStroke.CAP_SQUARE, java.awt.BasicStroke.JOIN_ROUND);
  var lastGroup = null;
  var furnitureInGroupsArea = null;
  var homeFurniture = this.home.getFurniture();
  for (var i = 0; i < furniture.length; i++) {
    var piece = furniture [i];
    if (piece.isVisible() 
        && this.isViewableAtLevel(piece, level)) {
      var homePieceOfFurniture = this.getPieceOfFurnitureInHomeFurniture(piece, homeFurniture);
      if (homePieceOfFurniture !== piece) {
        var groupArea = null;
        if (lastGroup !== homePieceOfFurniture) {
          var groupShape = ShapeTools.getShape(homePieceOfFurniture.getPoints(), true, null);
          groupArea = new java.awt.geom.Area(groupShape);
          groupArea.add(new java.awt.geom.Area(furnitureGroupsStroke.createStrokedShape(groupShape)));
        }
        var pieceArea = new java.awt.geom.Area(ShapeTools.getShape(piece.getPoints(), true, null));
        if (furnitureGroupsArea == null) {
          furnitureGroupsArea = groupArea;
          furnitureInGroupsArea = pieceArea;
        } else {
          if (lastGroup !== homePieceOfFurniture) {
            furnitureGroupsArea.add(groupArea);
          }
          furnitureInGroupsArea.add(pieceArea);
        }
        lastGroup = homePieceOfFurniture;
      }
      paintedFurniture.push(piece);
    }
  }
  if (furnitureGroupsArea != null) {
    furnitureGroupsArea.subtract(furnitureInGroupsArea);
    var oldComposite = this.setTransparency(g2D, 0.6);
    g2D.setPaint(selectionOutlinePaint);
    g2D.fill(furnitureGroupsArea);
    g2D.setAlpha(oldComposite);
  }
  
  paintedFurniture.forEach(function(piece) {
      var points = piece.getPoints();
      var pieceShape = ShapeTools.getShape(points, true, null);
      
      g2D.setPaint(selectionOutlinePaint);
      g2D.setStroke(selectionOutlineStroke);
      g2D.draw(pieceShape);
      
      g2D.setPaint(foregroundColor);
      g2D.setStroke(pieceBorderStroke);
      g2D.draw(pieceShape);
      
      g2D.setStroke(pieceFrontBorderStroke);
      g2D.draw(new java.awt.geom.Line2D.Float(points[2][0], points[2][1], points[3][0], points[3][1]));
      
      if (items.length === 1 && indicatorPaint != null) {
        plan.paintPieceOfFurnitureIndicators(g2D, piece, indicatorPaint, planScale);
      }
    });
}

/**
 * Returns <code>piece</code> if it belongs to home furniture or the group to which <code>piece</code> belongs.
 * @param {HomePieceOfFurniture} piece
 * @param {HomePieceOfFurniture[]} homeFurniture
 * @return {HomePieceOfFurniture}
 * @private
 */
PlanComponent.prototype.getPieceOfFurnitureInHomeFurniture = function(piece, homeFurniture) {
  if (!(homeFurniture.indexOf((piece)) >= 0)) {
    for (var i = 0; i < homeFurniture.length; i++) {
      var homePiece = homeFurniture[i];
      if ((homePiece instanceof HomeFurnitureGroup) 
          && ((homePiece).getAllFurniture().indexOf((piece)) >= 0)) {
        return homePiece;
      }
    }
  }
  return piece;
}

/**
 * Paints <code>icon</code> with <code>g2D</code>.
 * @param {Graphics2D} g2D
 * @param {HomePieceOfFurniture} piece
 * @param {PlanComponent.PieceOfFurnitureTopViewIcon} icon
 * @param {Object} pieceShape2D
 * @param {number} planScale
 * @param {string} backgroundColor
 * @private
 */
PlanComponent.prototype.paintPieceOfFurnitureIcon = function(g2D, piece, icon, pieceShape2D, planScale, backgroundColor) {
  var plan = this;
  if (icon == null) {
    if (this.furnitureIconsCache == null) {
      this.furnitureIconsCache = {};
    }
    var image = this.furnitureIconsCache[piece.icon.getURL()];
    if (image == null) {
      image = TextureManager.getInstance().getWaitImage();
      TextureManager.getInstance().loadTexture(piece.icon, {
          textureUpdated: function(texture) {
            plan.furnitureIconsCache[piece.icon.getURL()] = texture;
            plan.repaint();
          },
          textureError: function() {
            plan.furnitureIconsCache[piece.icon.getURL()] = TextureManager.getInstance().getErrorImage();
            plan.repaint();
          }
        });
    }
    icon = new PlanComponent.PieceOfFurnitureTopViewIcon(image);
  }
  
  // Fill piece area
  g2D.setPaint(backgroundColor);
  g2D.fill(pieceShape2D);
  var previousClip = g2D.getClip();
  // Clip icon drawing into piece shape
  g2D.clip(pieceShape2D);
  var previousTransform = g2D.getTransform();
  // Translate to piece center
  var bounds = pieceShape2D.getBounds2D();
  g2D.translate(bounds.getCenterX(), bounds.getCenterY());
  var pieceDepth = piece.getDepthInPlan();
  if (piece instanceof HomeDoorOrWindow) {
    pieceDepth *= piece.getWallThickness();
  }
  // Scale icon to fit in its area
  var minDimension = Math.min(piece.getWidthInPlan(), pieceDepth);
  var iconScale = Math.min(1 / planScale, minDimension / icon.getIconHeight());
  // If piece model is mirrored, inverse x scale
  if (piece.isModelMirrored()) {
    g2D.scale(-iconScale, iconScale);
  } else {
    g2D.scale(iconScale, iconScale);
  }
  // Paint piece icon
  icon.paintIcon(g2D, -icon.getIconWidth() / 2 | 0, -icon.getIconHeight() / 2 | 0);
  // Revert g2D transformation to previous value
  g2D.setTransform(previousTransform);
  g2D.setClip(previousClip);
}

/**
 * Paints <code>piece</code> top icon with <code>g2D</code>.
 * @param {Graphics2D} g2D
 * @param {HomePieceOfFurniture} piece
 * @param {Object} pieceShape2D
 * @param {java.awt.BasicStroke} pieceBorderStroke
 * @param {number} planScale
 * @param {string} backgroundColor
 * @param {string} foregroundColor
 * @param {PlanComponent.PaintMode} paintMode
 * @private
 */
PlanComponent.prototype.paintPieceOfFurnitureTop = function(g2D, piece, pieceShape2D, pieceBorderStroke, planScale, backgroundColor, foregroundColor, paintMode) {
  if (this.furnitureTopViewIconKeys == null) {
    this.furnitureTopViewIconKeys = {};
    this.furnitureTopViewIconsCache = {};
  }
  var topViewIconKey = CoreTools.getFromMap(this.furnitureTopViewIconKeys, piece);
  var icon;
  if (topViewIconKey == null) {
    topViewIconKey = new PlanComponent.HomePieceOfFurnitureTopViewIconKey(piece.clone());
    icon = CoreTools.getFromMap(this.furnitureTopViewIconsCache, topViewIconKey);
    if (icon == null 
        || icon.isWaitIcon() 
           && paintMode !== PlanComponent.PaintMode.PAINT) {
      var waitingComponent = paintMode === PlanComponent.PaintMode.PAINT ? this : null;
      if (piece.getPlanIcon() != null) {
        icon = new PlanComponent.PieceOfFurniturePlanIcon(piece, waitingComponent);
      } else {
        icon = new PlanComponent.PieceOfFurnitureModelIcon(piece, this.object3dFactory, waitingComponent, this.preferences.getFurnitureModelIconSize());
      }
      CoreTools.putToMap(this.furnitureTopViewIconsCache, topViewIconKey, icon);
    } else {
      for (var i = 0; i < this.furnitureTopViewIconsCache.entries.length; i++) { // Parse keySet
        var key = this.furnitureTopViewIconsCache.entries[i].key;
        if (key.equals(topViewIconKey)) {
          topViewIconKey = key;
          break;
        }
      }
    }
    CoreTools.putToMap(this.furnitureTopViewIconKeys, piece, topViewIconKey);
  } else {
    icon = CoreTools.getFromMap(this.furnitureTopViewIconsCache, topViewIconKey);
  }
  if (icon.isWaitIcon() || icon.isErrorIcon()) {
    this.paintPieceOfFurnitureIcon(g2D, piece, icon, pieceShape2D, planScale, backgroundColor);
    g2D.setPaint(foregroundColor);
    g2D.setStroke(pieceBorderStroke);
    g2D.draw(pieceShape2D);
  } else {
    var previousTransform = g2D.getTransform();
    var bounds = pieceShape2D.getBounds2D();
    g2D.translate(bounds.getCenterX(), bounds.getCenterY());
    g2D.rotate(piece.getAngle());
    var pieceDepth = piece.getDepthInPlan();
    if (piece.isModelMirrored()
        && piece.getRoll() == 0) {
      g2D.scale(-piece.getWidthInPlan() / icon.getIconWidth(), pieceDepth / icon.getIconHeight());
    } else {
      g2D.scale(piece.getWidthInPlan() / icon.getIconWidth(), pieceDepth / icon.getIconHeight());
    }
    icon.paintIcon(g2D, (-icon.getIconWidth() / 2 | 0), (-icon.getIconHeight() / 2 | 0));
    g2D.setTransform(previousTransform);
  }
}

/**
 * Paints rotation, elevation, height and resize indicators on <code>piece</code>.
 * @param {Graphics2D} g2D
 * @param {HomePieceOfFurniture} piece
 * @param {string|CanvasPattern} indicatorPaint
 * @param {number} planScale
 * @private
 */
PlanComponent.prototype.paintPieceOfFurnitureIndicators = function(g2D, piece, indicatorPaint, planScale) {
  if (this.resizeIndicatorVisible) {
    g2D.setPaint(indicatorPaint);
    g2D.setStroke(PlanComponent.INDICATOR_STROKE);
    
    var previousTransform = g2D.getTransform();
    var piecePoints = piece.getPoints();
    var scaleInverse = 1 / planScale;
    var pieceAngle = piece.getAngle();
    var rotationIndicator = this.getIndicator(piece, PlanComponent.IndicatorType.ROTATE);
    if (rotationIndicator != null) {
      g2D.translate(piecePoints[0][0], piecePoints[0][1]);
      g2D.scale(scaleInverse, scaleInverse);
      g2D.rotate(pieceAngle);
      g2D.draw(rotationIndicator);
      g2D.setTransform(previousTransform);
    }
    
    var elevationIndicator = this.getIndicator(piece, PlanComponent.IndicatorType.ELEVATE);
    if (elevationIndicator != null) {
      g2D.translate(piecePoints[1][0], piecePoints[1][1]);
      g2D.scale(scaleInverse, scaleInverse);
      g2D.rotate(pieceAngle);
      g2D.draw(PlanComponent.ELEVATION_POINT_INDICATOR);
      g2D.translate(6.5, -6.5);
      g2D.rotate(-pieceAngle);
      g2D.draw(elevationIndicator);
      g2D.setTransform(previousTransform);
    }
    
    g2D.translate(piecePoints[3][0], piecePoints[3][1]);
    g2D.scale(scaleInverse, scaleInverse);
    g2D.rotate(pieceAngle);
    if (piece.getPitch() !== 0 && this.isFurnitureSizeInPlanSupported()) {
      var pitchIndicator = this.getIndicator(piece, PlanComponent.IndicatorType.ROTATE_PITCH);
      if (pitchIndicator != null) {
        g2D.draw(pitchIndicator);
      }
    } else if (piece.getRoll() !== 0 && this.isFurnitureSizeInPlanSupported()) {
      var rollIndicator = this.getIndicator(piece, PlanComponent.IndicatorType.ROTATE_ROLL);
      if (rollIndicator != null) {
        g2D.draw(rollIndicator);
      }
    } else if (piece instanceof HomeLight) {
      var powerIndicator = this.getIndicator(piece, PlanComponent.IndicatorType.CHANGE_POWER);
      if (powerIndicator != null) {
        g2D.draw(PlanComponent.LIGHT_POWER_POINT_INDICATOR);
        g2D.translate(-7.5, 7.5);
        g2D.rotate(-pieceAngle);
        g2D.draw(powerIndicator);
      }
    } else if (piece.isResizable() && !piece.isHorizontallyRotated()) {
      var heightIndicator = this.getIndicator(piece, PlanComponent.IndicatorType.RESIZE_HEIGHT);
      if (heightIndicator != null) {
        g2D.draw(PlanComponent.HEIGHT_POINT_INDICATOR);
        g2D.translate(-7.5, 7.5);
        g2D.rotate(-pieceAngle);
        g2D.draw(heightIndicator);
      }
    }
    g2D.setTransform(previousTransform);
    if (piece.isResizable()) {
      var resizeIndicator = this.getIndicator(piece, PlanComponent.IndicatorType.RESIZE);
      if (resizeIndicator != null) {
        g2D.translate(piecePoints[2][0], piecePoints[2][1]);
        g2D.scale(scaleInverse, scaleInverse);
        g2D.rotate(pieceAngle);
        g2D.draw(resizeIndicator);
        g2D.setTransform(previousTransform);
      }
    }
    
    if (piece.isNameVisible() 
        && piece.getName().trim().length > 0) {
      var xName = piece.getX() + piece.getNameXOffset();
      var yName = piece.getY() + piece.getNameYOffset();
      this.paintTextIndicators(g2D, piece, this.getLineCount(piece.getName()), piece.getNameStyle(), xName, yName, piece.getNameAngle(), indicatorPaint, planScale);
    }
  }
}

/**
 * Paints polylines.
 * @param {Graphics2D} g2D
 * @param {Polyline[]} polylines
 * @param {Object[]} selectedItems
 * @param {Level} level
 * @param {string|CanvasPattern} selectionOutlinePaint
 * @param {string|CanvasPattern} indicatorPaint
 * @param {number} planScale
 * @param {string} foregroundColor
 * @param {PlanComponent.PaintMode} paintMode
 * @private
 */
PlanComponent.prototype.paintPolylines = function(g2D, polylines, selectedItems, level, selectionOutlinePaint, indicatorPaint, planScale, foregroundColor, paintMode) {
  for (var i = 0; i < polylines.length; i++) {
    var polyline = polylines[i];
    if (this.isViewableAtLevel(polyline, level)) {
      var selected = (selectedItems.indexOf((polyline)) >= 0);
      if (paintMode !== PlanComponent.PaintMode.CLIPBOARD || selected) {
        g2D.setPaint(ColorTools.integerToHexadecimalString(polyline.getColor()));
        var thickness = polyline.getThickness();
        g2D.setStroke(ShapeTools.getStroke(thickness, polyline.getCapStyle(), polyline.getJoinStyle(), 
            polyline.getDashStyle() !== Polyline.DashStyle.SOLID ? polyline.getDashPattern() : null, // null renders better closed shapes with a solid style 
            polyline.getDashOffset()));
        var polylineShape = ShapeTools.getPolylineShape(polyline.getPoints(), 
            polyline.getJoinStyle() === Polyline.JoinStyle.CURVED, polyline.isClosedPath());
        g2D.draw(polylineShape);
        
        var firstPoint = null;
        var secondPoint = null;
        var beforeLastPoint = null;
        var lastPoint = null;
        for (var it = polylineShape.getPathIterator(null, 0.5); !it.isDone(); it.next()) {
          var pathPoint = [0, 0];
          if (it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
            if (firstPoint == null) {
              firstPoint = pathPoint;
            } else if (secondPoint == null) {
              secondPoint = pathPoint;
            }
            beforeLastPoint = lastPoint;
            lastPoint = pathPoint;
          }
        }
        var angleAtStart = Math.atan2(firstPoint[1] - secondPoint[1], 
            firstPoint[0] - secondPoint[0]);
        var angleAtEnd = Math.atan2(lastPoint[1] - beforeLastPoint[1], 
            lastPoint[0] - beforeLastPoint[0]);
        var arrowDelta = polyline.getCapStyle() !== Polyline.CapStyle.BUTT 
            ? thickness / 2 
            : 0;
        this.paintArrow(g2D, firstPoint, angleAtStart, polyline.getStartArrowStyle(), thickness, arrowDelta);
        this.paintArrow(g2D, lastPoint, angleAtEnd, polyline.getEndArrowStyle(), thickness, arrowDelta);
        
        if (selected && paintMode === PlanComponent.PaintMode.PAINT) {
          g2D.setPaint(selectionOutlinePaint);
          g2D.setStroke(ShapeTools.getStroke(thickness + 4 / planScale, 
              polyline.getCapStyle(), polyline.getJoinStyle(), null));
          g2D.draw(polylineShape);
          
          if (selectedItems.length === 1 
              && indicatorPaint != null) {
            var selectedPolyline = selectedItems[0];
            if (this.isViewableAtLevel(polyline, level)) {
              g2D.setPaint(indicatorPaint);
              this.paintPointsResizeIndicators(g2D, selectedPolyline, indicatorPaint, planScale, 
                  selectedPolyline.isClosedPath(), angleAtStart, angleAtEnd, false);
            }
          }
        }
      }
    }
  }
}

/**
 * Paints polyline arrow at the given point and orientation.
 * @param {Graphics2D} g2D
 * @param {Array} point
 * @param {number} angle
 * @param {Polyline.ArrowStyle} arrowStyle
 * @param {number} thickness
 * @param {number} arrowDelta
 * @private
 */
PlanComponent.prototype.paintArrow = function(g2D, point, angle, arrowStyle, thickness, arrowDelta) {
  if (arrowStyle != null 
      && arrowStyle !== Polyline.ArrowStyle.NONE) {
    var oldTransform = g2D.getTransform();
    g2D.translate(point[0], point[1]);
    g2D.rotate(angle);
    g2D.translate(arrowDelta, 0);
    var scale = Math.pow(thickness, 0.66) * 2;
    g2D.scale(scale, scale);
    switch ((arrowStyle)) {
      case Polyline.ArrowStyle.DISC:
        g2D.fill(new java.awt.geom.Ellipse2D.Float(-3.5, -2, 4, 4));
        break;
      case Polyline.ArrowStyle.OPEN:
        g2D.scale(0.9, 0.9);
        g2D.setStroke(new java.awt.BasicStroke((thickness / scale / 0.9), java.awt.BasicStroke.CAP_BUTT, java.awt.BasicStroke.JOIN_MITER));
        g2D.draw(PlanComponent.ARROW);
        break;
      case Polyline.ArrowStyle.DELTA:
        g2D.translate(1.65, 0);
        g2D.fill(PlanComponent.ARROW);
        break;
      default:
        break;
    }
    g2D.setTransform(oldTransform);
  }
}

/**
 * Paints dimension lines.
 * @param {Graphics2D} g2D
 * @param {DimensionLine[]} dimensionLines
 * @param {Object[]} selectedItems
 * @param {Level} level
 * @param {string|CanvasPattern} selectionOutlinePaint
 * @param {java.awt.BasicStroke} selectionOutlineStroke
 * @param {string|CanvasPattern} indicatorPaint
 * @param {java.awt.BasicStroke} extensionLineStroke
 * @param {number} planScale
 * @param {string} backgroundColor
 * @param {string} foregroundColor
 * @param {PlanComponent.PaintMode} paintMode
 * @param {boolean} feedback
 * @private
 */
PlanComponent.prototype.paintDimensionLines = function(g2D, dimensionLines, selectedItems, level, selectionOutlinePaint, selectionOutlineStroke, indicatorPaint, extensionLineStroke, planScale, backgroundColor, foregroundColor, paintMode, feedback) {
  var plan = this;
  if (paintMode === PlanComponent.PaintMode.CLIPBOARD) {
    dimensionLines = Home.getDimensionLinesSubList(selectedItems);
  }
  var markEndWidth = PlanComponent.DIMENSION_LINE_MARK_END.getBounds2D().getWidth();
  var selectedDimensionLineWithIndicators = selectedItems.length == 1
         && selectedItems[0] instanceof DimensionLine
         && paintMode === PlanComponent.PaintMode.PAINT
         && indicatorPaint != null
      ? selectedItems[0]
      : null;

  var previousFont = g2D.getFont();
  for (var i = 0; i < dimensionLines.length; i++) {
    var dimensionLine = dimensionLines[i];
    if (plan.isViewableAtLevel(dimensionLine, level)) {
      var dimensionLineColor = dimensionLine.getColor();
      var markEndScale = dimensionLine.getEndMarkSize() / markEndWidth;
      var dimensionLineStroke = new java.awt.BasicStroke(plan.getStrokeWidth(DimensionLine, paintMode) / markEndScale / planScale);
      g2D.setPaint(dimensionLineColor != null ? ColorTools.integerToHexadecimalString(dimensionLineColor) : foregroundColor);
      var previousTransform = g2D.getTransform();
      var elevationDimensionLine = dimensionLine.isElevationDimensionLine();
      var angle = elevationDimensionLine
          ? (dimensionLine.getPitch() + 2 * Math.PI) % (2 * Math.PI)
          : Math.atan2(dimensionLine.getYEnd() - dimensionLine.getYStart(), dimensionLine.getXEnd() - dimensionLine.getXStart());
      var dimensionLineOffset = dimensionLine.getOffset();
      var dimensionLineLength = dimensionLine.getLength();
      g2D.translate(dimensionLine.getXStart(), dimensionLine.getYStart());
      g2D.rotate(angle);
      g2D.translate(0, dimensionLineOffset);
        
      var horizontalDimensionLine = dimensionLine.getElevationStart() == dimensionLine.getElevationEnd();
      if (paintMode === PlanComponent.PaintMode.PAINT 
          && plan.selectedItemsOutlinePainted 
          && (selectedItems.indexOf((dimensionLine)) >= 0)) {
        g2D.setPaint(selectionOutlinePaint);
        g2D.setStroke(selectionOutlineStroke);
        if (horizontalDimensionLine) {
          g2D.draw(new java.awt.geom.Line2D.Float(0, 0, dimensionLineLength, 0));
          g2D.scale(markEndScale, markEndScale);
          g2D.draw(PlanComponent.DIMENSION_LINE_MARK_END);
          g2D.translate(dimensionLineLength / markEndScale, 0);
          g2D.draw(PlanComponent.DIMENSION_LINE_MARK_END);
          g2D.scale(1 / markEndScale, 1 / markEndScale);
          g2D.translate(-dimensionLineLength, 0);
          g2D.draw(new java.awt.geom.Line2D.Float(0, -dimensionLineOffset, 0, 0));
          g2D.draw(new java.awt.geom.Line2D.Float(dimensionLineLength, -dimensionLineOffset, dimensionLineLength, 0));
        } else {
          g2D.scale(markEndScale, markEndScale);
          g2D.draw(PlanComponent.VERTICAL_DIMENSION_LINE);
          g2D.scale(1 / markEndScale, 1 / markEndScale);
          if (Math.abs(dimensionLineOffset) > dimensionLine.getEndMarkSize() / 2) {
            g2D.draw(new java.awt.geom.Line2D.Float(0, -dimensionLineOffset,
                0, -dimensionLine.getEndMarkSize() / 2 * (dimensionLineOffset >= 0 ? (dimensionLineOffset == 0 ? 0 : 1) : -1)));
          }
        }
        g2D.setPaint(dimensionLineColor != null ? ColorTools.integerToHexadecimalString(dimensionLineColor) : foregroundColor);
      }
        
      g2D.setStroke(dimensionLineStroke);
      if (horizontalDimensionLine) {
        g2D.draw(new java.awt.geom.Line2D.Float(0, 0, dimensionLineLength, 0));
        g2D.scale(markEndScale, markEndScale);
        g2D.draw(PlanComponent.DIMENSION_LINE_MARK_END);
        g2D.translate(dimensionLineLength / markEndScale, 0);
        g2D.draw(PlanComponent.DIMENSION_LINE_MARK_END);
        g2D.scale(1 / markEndScale, 1 / markEndScale);
        g2D.translate(-dimensionLineLength, 0);
        g2D.setStroke(extensionLineStroke);
        g2D.draw(new java.awt.geom.Line2D.Float(0, -dimensionLineOffset, 0, 0));
        g2D.draw(new java.awt.geom.Line2D.Float(dimensionLineLength, -dimensionLineOffset, dimensionLineLength, 0));
      } else {
        g2D.scale(markEndScale, markEndScale);
        g2D.fill(PlanComponent.VERTICAL_DIMENSION_LINE_DISC);
        g2D.draw(PlanComponent.VERTICAL_DIMENSION_LINE);
        g2D.scale(1 / markEndScale, 1 / markEndScale);
        g2D.setStroke(extensionLineStroke);
        if (Math.abs(dimensionLineOffset) > dimensionLine.getEndMarkSize() / 2) {
          g2D.draw(new java.awt.geom.Line2D.Float(0, -dimensionLineOffset,
              0, -dimensionLine.getEndMarkSize() / 2 * (dimensionLineOffset >= 0 ? (dimensionLineOffset == 0 ? 0 : 1) : -1)));
        }
      }
        
      if (horizontalDimensionLine
          || dimensionLine === selectedDimensionLineWithIndicators) {
        var lengthText = plan.preferences.getLengthUnit().getFormat().format(dimensionLineLength);
        var lengthStyle = dimensionLine.getLengthStyle();
        if (lengthStyle == null) {
          lengthStyle = plan.preferences.getDefaultTextStyle(dimensionLine.constructor);
        }
        if (feedback && plan.getFont() != null
            || !horizontalDimensionLine
                && dimensionLine == selectedDimensionLineWithIndicators) {
          // Call directly the overloaded deriveStyle method that takes a float parameter 
          // to avoid confusion with the one that takes a TextStyle.Alignment parameter
          lengthStyle = lengthStyle.deriveStyle$float(parseInt(new Font(plan.getFont()).size) / planScale);
        }
        var font = plan.getFont(previousFont, lengthStyle);
        var lengthFontMetrics = plan.getFontMetrics(font, lengthStyle);
        var lengthTextBounds = lengthFontMetrics.getStringBounds(lengthText, g2D);
        g2D.setFont(font);
        if (!horizontalDimensionLine
            && dimensionLine === selectedDimensionLineWithIndicators) {
          g2D.rotate(angle > Math.PI ? Math.PI / 2 : -Math.PI / 2);
          g2D.translate(dimensionLineOffset <= 0 ^ angle <= Math.PI
                ? -lengthTextBounds.getWidth() - markEndWidth / 2 - 5 / planScale
                : markEndWidth / 2 + 5 / planScale,
              lengthFontMetrics.getAscent() / 2);
          if (elevationDimensionLine
              && this.resizeIndicatorVisible) {
            // Add room for pitch rotation indicator
            g2D.translate((dimensionLineOffset <= 0 ^ angle <= Math.PI ? -1 : 1) * 10 / planScale, 0);
          }
        } else {
          g2D.translate((dimensionLineLength - lengthTextBounds.getWidth()) / 2,
              dimensionLineOffset <= 0
                  ? -lengthFontMetrics.getDescent() - 1
                  : lengthFontMetrics.getAscent() + 1);
        }
        if (feedback
            || !horizontalDimensionLine
                && dimensionLine === selectedDimensionLineWithIndicators) {
          g2D.setColor(backgroundColor);
          var oldComposite = plan.setTransparency(g2D, 0.7);
          g2D.setStroke(new java.awt.BasicStroke(4 / planScale, java.awt.BasicStroke.CAP_SQUARE, java.awt.BasicStroke.CAP_ROUND));
          g2D.drawStringOutline(lengthText, 0, 0);
          g2D.setAlpha(oldComposite);
          g2D.setColor(foregroundColor);
          if (!feedback) {
            g2D.setPaint(indicatorPaint);
          }
        }
        g2D.setFont(font);
        g2D.drawString(lengthText, 0, 0);
      }
      g2D.setTransform(previousTransform);
    }
  }
  g2D.setFont(previousFont);
  if (selectedDimensionLineWithIndicators != null) {
    this.paintDimensionLineResizeIndicators(g2D, selectedDimensionLineWithIndicators, indicatorPaint, planScale);
  }
}

/**
 * Paints resize indicators on a given dimension line.
 * @param {Graphics2D} g2D
 * @param {DimensionLine} dimensionLine
 * @param {string|CanvasPattern} indicatorPaint
 * @param {number} planScale
 * @private
 */
PlanComponent.prototype.paintDimensionLineResizeIndicators = function(g2D, dimensionLine, indicatorPaint, planScale) {
  if (this.resizeIndicatorVisible) {
    g2D.setPaint(indicatorPaint);
    g2D.setStroke(PlanComponent.INDICATOR_STROKE);
    
    var dimensionLineAngle = dimensionLine.isElevationDimensionLine()
        ? dimensionLine.getPitch()
        : Math.atan2(dimensionLine.getYEnd() - dimensionLine.getYStart(), dimensionLine.getXEnd() - dimensionLine.getXStart());
    var horizontalDimensionLine = dimensionLine.getElevationStart() === dimensionLine.getElevationEnd();
    
    var previousTransform = g2D.getTransform();
    var scaleInverse = 1 / planScale;
    var resizeIndicator = this.getIndicator(dimensionLine, PlanComponent.IndicatorType.RESIZE);
    if (horizontalDimensionLine) {
      g2D.translate(dimensionLine.getXStart(), dimensionLine.getYStart());
      g2D.rotate(dimensionLineAngle);
      g2D.translate(0, dimensionLine.getOffset());
      g2D.rotate(Math.PI);
      g2D.scale(scaleInverse, scaleInverse);
      g2D.draw(resizeIndicator);
      g2D.setTransform(previousTransform);
    
      g2D.translate(dimensionLine.getXEnd(), dimensionLine.getYEnd());
      g2D.rotate(dimensionLineAngle);
      g2D.translate(0, dimensionLine.getOffset());
      g2D.scale(scaleInverse, scaleInverse);
      g2D.draw(resizeIndicator);
      g2D.setTransform(previousTransform);
    
      g2D.translate((dimensionLine.getXStart() + dimensionLine.getXEnd()) / 2, 
          (dimensionLine.getYStart() + dimensionLine.getYEnd()) / 2);
    } else {
      g2D.translate(dimensionLine.getXStart(), dimensionLine.getYStart());
    }
    
    g2D.rotate(dimensionLineAngle);
    var middlePointTransform = g2D.getTransform();
    g2D.translate(0, dimensionLine.getOffset()
        - (horizontalDimensionLine ? 0 : dimensionLine.getEndMarkSize() / 2 * (dimensionLine.getOffset() > 0 ? 1 : -1)));
    g2D.rotate(dimensionLine.getOffset() <= 0 
        ? Math.PI / 2 
        : -Math.PI / 2);
    g2D.scale(scaleInverse, scaleInverse);
    g2D.draw(resizeIndicator);

    if (!horizontalDimensionLine) {
      if (dimensionLine.isElevationDimensionLine()) {
        g2D.setTransform(middlePointTransform);        
        g2D.translate(0, dimensionLine.getOffset() + dimensionLine.getEndMarkSize() / 2 * (dimensionLine.getOffset() > 0 ? 1 : -1));
        g2D.rotate(dimensionLine.getOffset() <= 0
            ? Math.PI / 2
            : -Math.PI / 2);
        g2D.scale(scaleInverse, scaleInverse);
        g2D.draw(this.getIndicator(dimensionLine, PlanComponent.IndicatorType.ROTATE));
      }

      g2D.setTransform(middlePointTransform);      
      g2D.translate(-dimensionLine.getEndMarkSize() / 2, dimensionLine.getOffset());
      g2D.scale(scaleInverse, scaleInverse);
      g2D.draw(PlanComponent.ELEVATION_POINT_INDICATOR);
      g2D.translate(-9, 0);
      g2D.rotate(-dimensionLineAngle);
      g2D.draw(this.getIndicator(dimensionLine, PlanComponent.IndicatorType.ELEVATE));

      g2D.setTransform(middlePointTransform);
      g2D.translate(5, dimensionLine.getOffset());
      g2D.scale(scaleInverse, scaleInverse);
      g2D.draw(PlanComponent.HEIGHT_POINT_INDICATOR);
      g2D.translate(10, 0);
      g2D.rotate(-dimensionLineAngle);
      g2D.draw(this.getIndicator(dimensionLine, PlanComponent.IndicatorType.RESIZE_HEIGHT));
    }
    
    g2D.setTransform(previousTransform);
  }
}

/**
 * Paints home labels.
 * @param {Graphics2D} g2D
 * @param {Label[]} labels
 * @param {Object[]} selectedItems
 * @param {Level} level
 * @param {string|CanvasPattern} selectionOutlinePaint
 * @param {java.awt.BasicStroke} selectionOutlineStroke
 * @param {string|CanvasPattern} indicatorPaint
 * @param {number} planScale
 * @param {string} foregroundColor
 * @param {PlanComponent.PaintMode} paintMode
 * @private
 */
PlanComponent.prototype.paintLabels = function(g2D, labels, selectedItems, level, selectionOutlinePaint, selectionOutlineStroke, indicatorPaint, planScale, foregroundColor, paintMode) {
  var previousFont = g2D.getFont();
  for (var i = 0; i < labels.length; i++) {
    var label = labels[i];
    if (this.isViewableAtLevel(label, level)) {
      var selectedLabel = (selectedItems.indexOf((label)) >= 0);
      if (paintMode !== PlanComponent.PaintMode.CLIPBOARD || selectedLabel) {
        var labelText = label.getText();
        var xLabel = label.getX();
        var yLabel = label.getY();
        var labelAngle = label.getAngle();
        var labelStyle = label.getStyle();
        if (labelStyle == null) {
          labelStyle = this.preferences.getDefaultTextStyle(label.constructor);
        }
        if (labelStyle.getFontName() == null && this.getFont() != null) {
          labelStyle = labelStyle.deriveStyle(new Font(this.getFont()).family);
        }
        var color = label.getColor();
        g2D.setPaint(color != null ? ColorTools.integerToHexadecimalString(color) : foregroundColor);
        this.paintText(g2D, label.constructor, labelText, labelStyle, label.getOutlineColor(), 
            xLabel, yLabel, labelAngle, previousFont);
        
        if (paintMode === PlanComponent.PaintMode.PAINT && this.selectedItemsOutlinePainted && selectedLabel) {
          g2D.setPaint(selectionOutlinePaint);
          g2D.setStroke(selectionOutlineStroke);
          var textBounds = this.getTextBounds(labelText, labelStyle, xLabel, yLabel, labelAngle);
          g2D.draw(ShapeTools.getShape(textBounds, true, null));
          g2D.setPaint(foregroundColor);
          if (indicatorPaint != null && selectedItems.length === 1 && selectedItems[0] === label) {
            this.paintTextIndicators(g2D, label, this.getLineCount(labelText), 
                labelStyle, xLabel, yLabel, labelAngle, indicatorPaint, planScale);
            
            if (this.resizeIndicatorVisible 
                && label.getPitch() != null) {
              var elevationIndicator = this.getIndicator(label, PlanComponent.IndicatorType.ELEVATE);
              if (elevationIndicator != null) {
                var previousTransform = g2D.getTransform();
                if (labelStyle.getAlignment() === TextStyle.Alignment.LEFT) {
                  g2D.translate(textBounds[3][0], textBounds[3][1]);
                } else if (labelStyle.getAlignment() === TextStyle.Alignment.RIGHT) {
                  g2D.translate(textBounds[2][0], textBounds[2][1]);
                } else {
                  g2D.translate((textBounds[2][0] + textBounds[3][0]) / 2, (textBounds[2][1] + textBounds[3][1]) / 2);
                }
                var scaleInverse = 1 / planScale;
                g2D.scale(scaleInverse, scaleInverse);
                g2D.rotate(label.getAngle());
                g2D.draw(PlanComponent.ELEVATION_POINT_INDICATOR);
                g2D.translate(0, 10.0);
                g2D.rotate(-label.getAngle());
                g2D.draw(elevationIndicator);
                g2D.setTransform(previousTransform);
              }
            }
          }
        }
      }
    }
  }
  g2D.setFont(previousFont);
}

/**
 * Paints the compass.
 * @param {Graphics2D} g2D
 * @param {Object[]} selectedItems
 * @param {number} planScale
 * @param {string} foregroundColor
 * @param {PlanComponent.PaintMode} paintMode
 * @private
 */
PlanComponent.prototype.paintCompass = function(g2D, selectedItems, planScale, foregroundColor, paintMode) {
  var compass = this.home.getCompass();
  if (compass.isVisible() 
      && (paintMode !== PlanComponent.PaintMode.CLIPBOARD 
          || selectedItems.indexOf(compass) >= 0)) {
    var previousTransform = g2D.getTransform();
    g2D.translate(compass.getX(), compass.getY());
    g2D.rotate(compass.getNorthDirection());
    var diameter = compass.getDiameter();
    g2D.scale(diameter, diameter);
    g2D.setColor(foregroundColor);
    g2D.fill(PlanComponent.COMPASS);
    g2D.setTransform(previousTransform);
  }
}

/**
 * Paints the outline of the compass when it's belongs to <code>items</code>.
 * @param {Graphics2D} g2D
 * @param {Object[]} items
 * @param {string|CanvasPattern} selectionOutlinePaint
 * @param {java.awt.BasicStroke} selectionOutlineStroke
 * @param {string|CanvasPattern} indicatorPaint
 * @param {number} planScale
 * @param {string} foregroundColor
 * @private
 */
PlanComponent.prototype.paintCompassOutline = function(g2D, items, selectionOutlinePaint, selectionOutlineStroke, indicatorPaint, planScale, foregroundColor) {
  var compass = this.home.getCompass();
  if ((items.indexOf(compass) >= 0) 
      && compass.isVisible()) {
    var previousTransform = g2D.getTransform();
    g2D.translate(compass.getX(), compass.getY());
    g2D.rotate(compass.getNorthDirection());
    var diameter = compass.getDiameter();
    g2D.scale(diameter, diameter);
    
    g2D.setPaint(selectionOutlinePaint);
    g2D.setStroke(new java.awt.BasicStroke((5.5 + planScale) / diameter / planScale));
    g2D.draw(PlanComponent.COMPASS_DISC);
    g2D.setColor(foregroundColor);
    g2D.setStroke(new java.awt.BasicStroke(1.0 / diameter / planScale));
    g2D.draw(PlanComponent.COMPASS_DISC);
    g2D.setTransform(previousTransform);
    
    if (items.length === 1 
        && items[0] === compass) {
      g2D.setPaint(indicatorPaint);
      this.paintCompassIndicators(g2D, compass, indicatorPaint, planScale);
    }
  }
}

/**
 * @private
 */
PlanComponent.prototype.paintCompassIndicators = function(g2D, compass, indicatorPaint, planScale) {
  if (this.resizeIndicatorVisible) {
    g2D.setPaint(indicatorPaint);
    g2D.setStroke(PlanComponent.INDICATOR_STROKE);
    
    var previousTransform = g2D.getTransform();
    var compassPoints = compass.getPoints();
    var scaleInverse = 1 / planScale;
    g2D.translate((compassPoints[2][0] + compassPoints[3][0]) / 2, 
        (compassPoints[2][1] + compassPoints[3][1]) / 2);
    g2D.scale(scaleInverse, scaleInverse);
    g2D.rotate(compass.getNorthDirection());
    g2D.draw(this.getIndicator(compass, PlanComponent.IndicatorType.ROTATE));
    g2D.setTransform(previousTransform);
    
    g2D.translate((compassPoints[1][0] + compassPoints[2][0]) / 2, 
        (compassPoints[1][1] + compassPoints[2][1]) / 2);
    g2D.scale(scaleInverse, scaleInverse);
    g2D.rotate(compass.getNorthDirection());
    g2D.draw(this.getIndicator(compass, PlanComponent.IndicatorType.RESIZE));
    g2D.setTransform(previousTransform);
  }
}

/**
 * Paints wall location feedback.
 * @param {Graphics2D} g2D
 * @param {Wall} alignedWall
 * @param {Level} level
 * @param {java.awt.geom.Point2D} locationFeedback
 * @param {boolean} showPointFeedback
 * @param {string|CanvasPattern} feedbackPaint
 * @param {java.awt.BasicStroke} feedbackStroke
 * @param {number} planScale
 * @param {string|CanvasPattern} pointPaint
 * @param {java.awt.BasicStroke} pointStroke
 * @private
 */
PlanComponent.prototype.paintWallAlignmentFeedback = function(g2D, alignedWall, level, locationFeedback, showPointFeedback, feedbackPaint, feedbackStroke, planScale, pointPaint, pointStroke) {
  var plan = this;
  if (locationFeedback != null) {
    var margin = 0.5 / planScale;
    var x = locationFeedback.getX();
    var y = locationFeedback.getY();
    var deltaXToClosestWall = Infinity;
    var deltaYToClosestWall = Infinity;
    this.getViewedItems(this.home.getWalls(), level, this.otherLevelsWallsCache).forEach(function(wall) {
        if (wall !== alignedWall) {
          if (Math.abs(x - wall.getXStart()) < margin 
              && (alignedWall == null 
                  || !plan.equalsWallPoint(wall.getXStart(), wall.getYStart(), alignedWall))) {
            if (Math.abs(deltaYToClosestWall) > Math.abs(y - wall.getYStart())) {
              deltaYToClosestWall = y - wall.getYStart();
            }
          } else if (Math.abs(x - wall.getXEnd()) < margin 
                     && (alignedWall == null 
                         || !plan.equalsWallPoint(wall.getXEnd(), wall.getYEnd(), alignedWall))) {
            if (Math.abs(deltaYToClosestWall) > Math.abs(y - wall.getYEnd())) {
              deltaYToClosestWall = y - wall.getYEnd();
            }
          }
          
          if (Math.abs(y - wall.getYStart()) < margin 
              && (alignedWall == null 
                  || !plan.equalsWallPoint(wall.getXStart(), wall.getYStart(), alignedWall))) {
            if (Math.abs(deltaXToClosestWall) > Math.abs(x - wall.getXStart())) {
              deltaXToClosestWall = x - wall.getXStart();
            }
          } else if (Math.abs(y - wall.getYEnd()) < margin 
                     && (alignedWall == null 
                         || !plan.equalsWallPoint(wall.getXEnd(), wall.getYEnd(), alignedWall))) {
            if (Math.abs(deltaXToClosestWall) > Math.abs(x - wall.getXEnd())) {
              deltaXToClosestWall = x - wall.getXEnd();
            }
          }
          
          var wallPoints = wall.getPoints();
          wallPoints = [wallPoints[0], wallPoints[(wallPoints.length / 2 | 0) - 1], 
                        wallPoints[(wallPoints.length / 2 | 0)], wallPoints[wallPoints.length - 1]];
          for (var i = 0; i < wallPoints.length; i++) {
            if (Math.abs(x - wallPoints[i][0]) < margin 
                && (alignedWall == null 
                    || !plan.equalsWallPoint(wallPoints[i][0], wallPoints[i][1], alignedWall))) {
              if (Math.abs(deltaYToClosestWall) > Math.abs(y - wallPoints[i][1])) {
                deltaYToClosestWall = y - wallPoints[i][1];
              }
            }
            if (Math.abs(y - wallPoints[i][1]) < margin 
                && (alignedWall == null 
                    || !plan.equalsWallPoint(wallPoints[i][0], wallPoints[i][1], alignedWall))) {
              if (Math.abs(deltaXToClosestWall) > Math.abs(x - wallPoints[i][0])) {
                deltaXToClosestWall = x - wallPoints[i][0];
              }
            }
          }
        }
      });
    
    g2D.setPaint(feedbackPaint);
    g2D.setStroke(feedbackStroke);
    var alignmentLineOffset = this.pointerType === View.PointerType.TOUCH 
        ? PlanComponent.ALIGNMENT_LINE_OFFSET * 2
        : PlanComponent.ALIGNMENT_LINE_OFFSET;
    if (deltaXToClosestWall !== Infinity) {
      if (deltaXToClosestWall > 0) {
        g2D.draw(new java.awt.geom.Line2D.Float(x + alignmentLineOffset / planScale, y, 
            x - deltaXToClosestWall - alignmentLineOffset / planScale, y));
      } else {
        g2D.draw(new java.awt.geom.Line2D.Float(x - alignmentLineOffset / planScale, y, 
            x - deltaXToClosestWall + alignmentLineOffset / planScale, y));
      }
    }
    
    if (deltaYToClosestWall !== Infinity) {
      if (deltaYToClosestWall > 0) {
        g2D.draw(new java.awt.geom.Line2D.Float(x, y + alignmentLineOffset / planScale, 
            x, y - deltaYToClosestWall - alignmentLineOffset / planScale));
      } else {
        g2D.draw(new java.awt.geom.Line2D.Float(x, y - alignmentLineOffset / planScale, 
            x, y - deltaYToClosestWall + alignmentLineOffset / planScale));
      }
    }
    if (showPointFeedback) {
      this.paintPointFeedback(g2D, locationFeedback, feedbackPaint, planScale, pointPaint, pointStroke);
    }
  }
}

/**
 * Returns the items viewed in the plan at the given <code>level</code>.
 * @param {Object[]} homeItems
 * @param {Level} level
 * @param {Object[]} otherLevelItems
 * @return {Object[]}
 * @private
 */
PlanComponent.prototype.getViewedItems = function(homeItems, level, otherLevelItems) {
  var viewedWalls = [];
  if (otherLevelItems != null) {
    viewedWalls.push.apply(viewedWalls, otherLevelItems);
  }
  for (var i = 0; i < homeItems.length; i++) {
    var wall = homeItems[i];
    if (this.isViewableAtLevel(wall, level)) {
      viewedWalls.push(wall);
    }
  }
  return viewedWalls;
}

/**
 * Paints point feedback.
 * @param {Graphics2D} g2D
 * @param {java.awt.geom.Point2D} locationFeedback
 * @param {string|CanvasPattern} feedbackPaint
 * @param {number} planScale
 * @param {string|CanvasPattern} pointPaint
 * @param {java.awt.BasicStroke} pointStroke
 * @private
 */
PlanComponent.prototype.paintPointFeedback = function(g2D, locationFeedback, feedbackPaint, planScale, pointPaint, pointStroke) {
  g2D.setPaint(pointPaint);
  g2D.setStroke(pointStroke);
  var radius = this.pointerType === View.PointerType.TOUCH ? 20 :  10;
  var circle = new java.awt.geom.Ellipse2D.Float(locationFeedback.getX() - radius / planScale, 
      locationFeedback.getY() - radius / planScale, 2 * radius / planScale, 2 * radius / planScale);
  g2D.fill(circle);
  g2D.setPaint(feedbackPaint);
  g2D.setStroke(new java.awt.BasicStroke(1 / planScale));
  g2D.draw(circle);
  g2D.draw(new java.awt.geom.Line2D.Float(locationFeedback.getX(), 
      locationFeedback.getY() - radius / planScale, 
      locationFeedback.getX(), 
      locationFeedback.getY() + radius / planScale));
  g2D.draw(new java.awt.geom.Line2D.Float(locationFeedback.getX() - radius / planScale, 
      locationFeedback.getY(), 
      locationFeedback.getX() + radius / planScale, 
      locationFeedback.getY()));
}

/**
 * Returns <code>true</code> if <code>wall</code> start or end point
 * equals the point (<code>x</code>, <code>y</code>).
 * @param {number} x
 * @param {number} y
 * @param {Wall} wall
 * @return {boolean}
 * @private
 */
PlanComponent.prototype.equalsWallPoint = function(x, y, wall) {
  return x === wall.getXStart() && y === wall.getYStart() 
         || x === wall.getXEnd() && y === wall.getYEnd();
}

/**
 * Paints room location feedback.
 * @param {Graphics2D} g2D
 * @param {Room} alignedRoom
 * @param {Level} level
 * @param {java.awt.geom.Point2D} locationFeedback
 * @param {boolean} showPointFeedback
 * @param {string|CanvasPattern} feedbackPaint
 * @param {java.awt.BasicStroke} feedbackStroke
 * @param {number} planScale
 * @param {string|CanvasPattern} pointPaint
 * @param {java.awt.BasicStroke} pointStroke
 * @private
 */
PlanComponent.prototype.paintRoomAlignmentFeedback = function(g2D, alignedRoom, level, locationFeedback, showPointFeedback, feedbackPaint, feedbackStroke, planScale, pointPaint, pointStroke) {
  if (locationFeedback != null) {
    var margin = 0.5 / planScale;
    var x = locationFeedback.getX();
    var y = locationFeedback.getY();
    var deltaXToClosestObject = Infinity;
    var deltaYToClosestObject = Infinity;
    this.getViewedItems(this.home.getRooms(), level, this.otherLevelsRoomsCache).forEach(function(room) {
        var roomPoints = room.getPoints();
        var editedPointIndex = -1;
        if (room === alignedRoom) {
          for (var i = 0; i < roomPoints.length; i++) {
            if (roomPoints[i][0] === x && roomPoints[i][1] === y) {
              editedPointIndex = i;
              break;
            }
          }
        }
        for (var i = 0; i < roomPoints.length; i++) {
          if (editedPointIndex === -1 || (i !== editedPointIndex && roomPoints.length > 2)) {
            if (Math.abs(x - roomPoints[i][0]) < margin 
                && Math.abs(deltaYToClosestObject) > Math.abs(y - roomPoints[i][1])) {
              deltaYToClosestObject = y - roomPoints[i][1];
            }
            if (Math.abs(y - roomPoints[i][1]) < margin 
                && Math.abs(deltaXToClosestObject) > Math.abs(x - roomPoints[i][0])) {
              deltaXToClosestObject = x - roomPoints[i][0];
            }
          }
        }
      });
    
    this.getViewedItems(this.home.getWalls(), level, this.otherLevelsWallsCache).forEach(function(wall) {
        var wallPoints = wall.getPoints();
        wallPoints = [wallPoints[0], wallPoints[(wallPoints.length / 2 | 0) - 1], 
                      wallPoints[(wallPoints.length / 2 | 0)], wallPoints[wallPoints.length - 1]];
        for (var i = 0; i < wallPoints.length; i++) {
          if (Math.abs(x - wallPoints[i][0]) < margin 
              && Math.abs(deltaYToClosestObject) > Math.abs(y - wallPoints[i][1])) {
            deltaYToClosestObject = y - wallPoints[i][1];
          }
          if (Math.abs(y - wallPoints[i][1]) < margin 
              && Math.abs(deltaXToClosestObject) > Math.abs(x - wallPoints[i][0])) {
            deltaXToClosestObject = x - wallPoints[i][0];
          }
        }
      });
    
    g2D.setPaint(feedbackPaint);
    g2D.setStroke(feedbackStroke);
    var alignmentLineOffset = this.pointerType === View.PointerType.TOUCH 
        ? PlanComponent.ALIGNMENT_LINE_OFFSET * 2
        : PlanComponent.ALIGNMENT_LINE_OFFSET;
    if (deltaXToClosestObject !== Infinity) {
      if (deltaXToClosestObject > 0) {
        g2D.draw(new java.awt.geom.Line2D.Float(x + alignmentLineOffset / planScale, y, 
            x - deltaXToClosestObject - alignmentLineOffset / planScale, y));
      } else {
        g2D.draw(new java.awt.geom.Line2D.Float(x - alignmentLineOffset / planScale, y, 
            x - deltaXToClosestObject + alignmentLineOffset / planScale, y));
      }
    }
    if (deltaYToClosestObject !== Infinity) {
      if (deltaYToClosestObject > 0) {
        g2D.draw(new java.awt.geom.Line2D.Float(x, y + alignmentLineOffset / planScale, 
            x, y - deltaYToClosestObject - alignmentLineOffset / planScale));
      } else {
        g2D.draw(new java.awt.geom.Line2D.Float(x, y - alignmentLineOffset / planScale, 
            x, y - deltaYToClosestObject + alignmentLineOffset / planScale));
      }
    }
    if (showPointFeedback) {
      this.paintPointFeedback(g2D, locationFeedback, feedbackPaint, planScale, pointPaint, pointStroke);
    }
  }
}

/**
 * Paints dimension line location feedback.
 * @param {Graphics2D} g2D
 * @param {DimensionLine} alignedDimensionLine
 * @param {Level} level
 * @param {java.awt.geom.Point2D} locationFeedback
 * @param {boolean} showPointFeedback
 * @param {string|CanvasPattern} feedbackPaint
 * @param {java.awt.BasicStroke} feedbackStroke
 * @param {number} planScale
 * @param {string|CanvasPattern} pointPaint
 * @param {java.awt.BasicStroke} pointStroke
 * @private
 */
PlanComponent.prototype.paintDimensionLineAlignmentFeedback = function(g2D, alignedDimensionLine, level, locationFeedback, showPointFeedback, feedbackPaint, feedbackStroke, planScale, pointPaint, pointStroke) {
  var plan = this;
  if (locationFeedback != null) {
    var margin = 0.5 / planScale;
    var x = locationFeedback.getX();
    var y = locationFeedback.getY();
    var deltaXToClosestObject = Infinity;
    var deltaYToClosestObject = Infinity;
    this.getViewedItems(this.home.getRooms(), level, this.otherLevelsRoomsCache).forEach(function(room) {
        var roomPoints = room.getPoints();
        for (var i = 0; i < roomPoints.length; i++) {
          if (Math.abs(x - roomPoints[i][0]) < margin 
              && Math.abs(deltaYToClosestObject) > Math.abs(y - roomPoints[i][1])) {
            deltaYToClosestObject = y - roomPoints[i][1];
          }
          if (Math.abs(y - roomPoints[i][1]) < margin 
              && Math.abs(deltaXToClosestObject) > Math.abs(x - roomPoints[i][0])) {
            deltaXToClosestObject = x - roomPoints[i][0];
          }
        }
      });
    
    this.home.getDimensionLines().forEach(function(dimensionLine) {
        if (plan.isViewableAtLevel(dimensionLine, level) 
            && dimensionLine !== alignedDimensionLine) {
          if (Math.abs(x - dimensionLine.getXStart()) < margin 
              && (alignedDimensionLine == null 
                  || !plan.equalsDimensionLinePoint(dimensionLine.getXStart(), dimensionLine.getYStart(), 
                          alignedDimensionLine))) {
            if (Math.abs(deltaYToClosestObject) > Math.abs(y - dimensionLine.getYStart())) {
              deltaYToClosestObject = y - dimensionLine.getYStart();
            }
          } else if (Math.abs(x - dimensionLine.getXEnd()) < margin 
                     && (alignedDimensionLine == null 
                         || !plan.equalsDimensionLinePoint(dimensionLine.getXEnd(), dimensionLine.getYEnd(), 
                                 alignedDimensionLine))) {
            if (Math.abs(deltaYToClosestObject) > Math.abs(y - dimensionLine.getYEnd())) {
              deltaYToClosestObject = y - dimensionLine.getYEnd();
            }
          }
          if (Math.abs(y - dimensionLine.getYStart()) < margin 
              && (alignedDimensionLine == null 
                  || !plan.equalsDimensionLinePoint(dimensionLine.getXStart(), dimensionLine.getYStart(), 
                          alignedDimensionLine))) {
            if (Math.abs(deltaXToClosestObject) > Math.abs(x - dimensionLine.getXStart())) {
              deltaXToClosestObject = x - dimensionLine.getXStart();
            }
          } else if (Math.abs(y - dimensionLine.getYEnd()) < margin 
                     && (alignedDimensionLine == null 
                         || !plan.equalsDimensionLinePoint(dimensionLine.getXEnd(), dimensionLine.getYEnd(), 
                                 alignedDimensionLine))) {
            if (Math.abs(deltaXToClosestObject) > Math.abs(x - dimensionLine.getXEnd())) {
              deltaXToClosestObject = x - dimensionLine.getXEnd();
            }
          }
        }
      });
    
    this.getViewedItems(this.home.getWalls(), level, this.otherLevelsWallsCache).forEach(function(wall) {
        var wallPoints = wall.getPoints();
        wallPoints = [wallPoints[0], wallPoints[(wallPoints.length / 2 | 0) - 1], 
                      wallPoints[(wallPoints.length / 2 | 0)], wallPoints[wallPoints.length - 1]];
        for (var i = 0; i < wallPoints.length; i++) {
          if (Math.abs(x - wallPoints[i][0]) < margin 
              && Math.abs(deltaYToClosestObject) > Math.abs(y - wallPoints[i][1])) {
            deltaYToClosestObject = y - wallPoints[i][1];
          }
          if (Math.abs(y - wallPoints[i][1]) < margin 
              && Math.abs(deltaXToClosestObject) > Math.abs(x - wallPoints[i][0])) {
            deltaXToClosestObject = x - wallPoints[i][0];
          }
        }
      });
    
    this.home.getFurniture().forEach(function(piece) {
        if (piece.isVisible() 
            && plan.isViewableAtLevel(piece, level)) {
          var piecePoints = piece.getPoints();
          for (var i = 0; i < piecePoints.length; i++) {
            if (Math.abs(x - piecePoints[i][0]) < margin 
                && Math.abs(deltaYToClosestObject) > Math.abs(y - piecePoints[i][1])) {
              deltaYToClosestObject = y - piecePoints[i][1];
            }
            if (Math.abs(y - piecePoints[i][1]) < margin 
                && Math.abs(deltaXToClosestObject) > Math.abs(x - piecePoints[i][0])) {
              deltaXToClosestObject = x - piecePoints[i][0];
            }
          }
        }
      });
    
    g2D.setPaint(feedbackPaint);
    g2D.setStroke(feedbackStroke);
    var alignmentLineOffset = this.pointerType === View.PointerType.TOUCH 
        ? PlanComponent.ALIGNMENT_LINE_OFFSET * 2
        : PlanComponent.ALIGNMENT_LINE_OFFSET;
    if (deltaXToClosestObject !== Infinity) {
      if (deltaXToClosestObject > 0) {
        g2D.draw(new java.awt.geom.Line2D.Float(x + alignmentLineOffset / planScale, y, 
            x - deltaXToClosestObject - alignmentLineOffset / planScale, y));
      } else {
        g2D.draw(new java.awt.geom.Line2D.Float(x - alignmentLineOffset / planScale, y, 
            x - deltaXToClosestObject + alignmentLineOffset / planScale, y));
      }
    }
    if (deltaYToClosestObject !== Infinity) {
      if (deltaYToClosestObject > 0) {
        g2D.draw(new java.awt.geom.Line2D.Float(x, y + alignmentLineOffset / planScale, 
            x, y - deltaYToClosestObject - alignmentLineOffset / planScale));
      } else {
        g2D.draw(new java.awt.geom.Line2D.Float(x, y - alignmentLineOffset / planScale, 
            x, y - deltaYToClosestObject + alignmentLineOffset / planScale));
      }
    }
    if (showPointFeedback) {
      this.paintPointFeedback(g2D, locationFeedback, feedbackPaint, planScale, pointPaint, pointStroke);
    }
  }
}

/**
 * Returns <code>true</code> if <code>dimensionLine</code> start or end point
 * equals the point (<code>x</code>, <code>y</code>).
 * @param {number} x
 * @param {number} y
 * @param {DimensionLine} dimensionLine
 * @return {boolean}
 * @private
 */
PlanComponent.prototype.equalsDimensionLinePoint = function(x, y, dimensionLine) {
  return x === dimensionLine.getXStart() && y === dimensionLine.getYStart() 
         || x === dimensionLine.getXEnd() && y === dimensionLine.getYEnd();
}

/**
 * Paints an arc centered at <code>center</code> point that goes
 * @param {Graphics2D} g2D
 * @param {java.awt.geom.Point2D} center
 * @param {java.awt.geom.Point2D} point1
 * @param {java.awt.geom.Point2D} point2
 * @param {number} planScale
 * @param {string} selectionColor
 * @private
 */
PlanComponent.prototype.paintAngleFeedback = function(g2D, center, point1, point2, planScale, selectionColor) {
  if (!point1.equals(center) && !point2.equals(center)) {
    g2D.setColor(selectionColor);
    g2D.setStroke(new java.awt.BasicStroke(1 / planScale));
    var angle1 = Math.atan2(center.getY() - point1.getY(), point1.getX() - center.getX());
    if (angle1 < 0) {
      angle1 = 2 * Math.PI + angle1;
    }
    var angle2 = Math.atan2(center.getY() - point2.getY(), point2.getX() - center.getX());
    if (angle2 < 0) {
      angle2 = 2 * Math.PI + angle2;
    }
    var extent = angle2 - angle1;
    if (angle1 > angle2) {
      extent = 2 * Math.PI + extent;
    }
    var previousTransform = g2D.getTransform();
    g2D.translate(center.getX(), center.getY());
    var radius = 20 / planScale;
    g2D.draw(new java.awt.geom.Arc2D.Double(-radius, -radius, 
        radius * 2, radius * 2, angle1 * 180 / Math.PI, extent * 180 / Math.PI, java.awt.geom.Arc2D.OPEN));
    radius += 5 / planScale;
    g2D.draw(new java.awt.geom.Line2D.Double(0, 0, radius * Math.cos(angle1), -radius * Math.sin(angle1)));
    g2D.draw(new java.awt.geom.Line2D.Double(0, 0, radius * Math.cos(angle1 + extent), -radius * Math.sin(angle1 + extent)));
    g2D.setTransform(previousTransform);
  }
}

/**
 * Paints the observer camera at its current location, if home camera is the observer camera.
 * @param {Graphics2D} g2D
 * @param {Object[]} selectedItems
 * @param {string|CanvasPattern} selectionOutlinePaint
 * @param {java.awt.Stroke} selectionOutlineStroke
 * @param {string|CanvasPattern} indicatorPaint
 * @param {number} planScale
 * @param {string} backgroundColor
 * @param {string} foregroundColor
 * @private
 */
PlanComponent.prototype.paintCamera = function(g2D, selectedItems, selectionOutlinePaint, selectionOutlineStroke, indicatorPaint, planScale, backgroundColor, foregroundColor) {
  var camera = this.home.getObserverCamera();
  if (camera === this.home.getCamera()) {
    var previousTransform = g2D.getTransform();
    g2D.translate(camera.getX(), camera.getY());
    g2D.rotate(camera.getYaw());
    
    var points = camera.getPoints();
    var yScale = java.awt.geom.Point2D.distance(points[0][0], points[0][1], points[3][0], points[3][1]);
    var xScale = java.awt.geom.Point2D.distance(points[0][0], points[0][1], points[1][0], points[1][1]);
    var cameraTransform = java.awt.geom.AffineTransform.getScaleInstance(xScale, yScale);
    var cameraScale = camera.getPlanScale();
    var scaledCameraBody = new java.awt.geom.Area(cameraScale <= 1 ? PlanComponent.CAMERA_HUMAN_BODY : PlanComponent.CAMERA_BODY).createTransformedArea(cameraTransform);
    var scaledCameraHead = new java.awt.geom.Area(cameraScale <= 1 ? PlanComponent.CAMERA_HUMAN_HEAD : PlanComponent.CAMERA_BUTTON).createTransformedArea(cameraTransform);
    
    g2D.setPaint(backgroundColor);
    g2D.fill(scaledCameraBody);
    g2D.setPaint(foregroundColor);
    var stroke = new java.awt.BasicStroke(this.getStrokeWidth(ObserverCamera, PlanComponent.PaintMode.PAINT) / planScale);
    g2D.setStroke(stroke);
    g2D.draw(scaledCameraBody);
    
    if (selectedItems.indexOf(camera) >= 0 
        && this.selectedItemsOutlinePainted) {
      g2D.setPaint(selectionOutlinePaint);
      g2D.setStroke(selectionOutlineStroke);
      var cameraOutline = new java.awt.geom.Area(scaledCameraBody);
      cameraOutline.add(new java.awt.geom.Area(scaledCameraHead));
      g2D.draw(cameraOutline);
    }
    
    g2D.setPaint(backgroundColor);
    g2D.fill(scaledCameraHead);
    g2D.setPaint(foregroundColor);
    g2D.setStroke(stroke);
    g2D.draw(scaledCameraHead);
    var sin = Math.sin(camera.getFieldOfView() / 2);
    var cos = Math.cos(camera.getFieldOfView() / 2);
    var xStartAngle = (0.9 * yScale * sin);
    var yStartAngle = (0.9 * yScale * cos);
    var xEndAngle = (2.2 * yScale * sin);
    var yEndAngle = (2.2 * yScale * cos);
    var cameraFieldOfViewAngle = new java.awt.geom.GeneralPath();
    cameraFieldOfViewAngle.moveTo(xStartAngle, yStartAngle);
    cameraFieldOfViewAngle.lineTo(xEndAngle, yEndAngle);
    cameraFieldOfViewAngle.moveTo(-xStartAngle, yStartAngle);
    cameraFieldOfViewAngle.lineTo(-xEndAngle, yEndAngle);
    g2D.draw(cameraFieldOfViewAngle);
    g2D.setTransform(previousTransform);
    
    if (selectedItems.length === 1 
        && selectedItems[0] === camera) {
      this.paintCameraRotationIndicators(g2D, camera, indicatorPaint, planScale);
    }
  }
}

/**
 * @private
 */
PlanComponent.prototype.paintCameraRotationIndicators = function(g2D, camera, indicatorPaint, planScale) {
  if (this.resizeIndicatorVisible) {
    g2D.setPaint(indicatorPaint);
    g2D.setStroke(PlanComponent.INDICATOR_STROKE);
    
    var previousTransform = g2D.getTransform();
    var cameraPoints = camera.getPoints();
    var scaleInverse = 1 / planScale;
    g2D.translate((cameraPoints[0][0] + cameraPoints[3][0]) / 2, 
        (cameraPoints[0][1] + cameraPoints[3][1]) / 2);
    g2D.scale(scaleInverse, scaleInverse);
    g2D.rotate(camera.getYaw());
    g2D.draw(this.getIndicator(camera, PlanComponent.IndicatorType.ROTATE));
    g2D.setTransform(previousTransform);
    
    g2D.translate((cameraPoints[1][0] + cameraPoints[2][0]) / 2, 
        (cameraPoints[1][1] + cameraPoints[2][1]) / 2);
    g2D.scale(scaleInverse, scaleInverse);
    g2D.rotate(camera.getYaw());
    g2D.draw(this.getIndicator(camera, PlanComponent.IndicatorType.ROTATE_PITCH));
    g2D.setTransform(previousTransform);
    
    var elevationIndicator = this.getIndicator(camera, PlanComponent.IndicatorType.ELEVATE);
    if (elevationIndicator != null) {
      g2D.translate((cameraPoints[0][0] + cameraPoints[1][0]) / 2, 
          (cameraPoints[0][1] + cameraPoints[1][1]) / 2);
      g2D.scale(scaleInverse, scaleInverse);
      g2D.draw(PlanComponent.POINT_INDICATOR);
      g2D.translate(Math.sin(camera.getYaw()) * 8, -Math.cos(camera.getYaw()) * 8);
      g2D.draw(elevationIndicator);
      g2D.setTransform(previousTransform);
    }
  }
}

/**
 * Paints rectangle feedback.
 * @param {Graphics2D} g2D
 * @param {string} selectionColor
 * @param {number} planScale
 * @private
 */
PlanComponent.prototype.paintRectangleFeedback = function(g2D, selectionColor, planScale) {
  if (this.rectangleFeedback != null) {
    g2D.setPaint(ColorTools.toRGBAStyle(selectionColor, 0.125));
    g2D.fill(this.rectangleFeedback);
    g2D.setPaint(selectionColor);
    g2D.setStroke(new java.awt.BasicStroke(1 / planScale));
    g2D.draw(this.rectangleFeedback);
  }
}

/**
 * Sets rectangle selection feedback coordinates.
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 */
PlanComponent.prototype.setRectangleFeedback = function(x0, y0, x1, y1) {
  this.rectangleFeedback = new java.awt.geom.Rectangle2D.Float(x0, y0, 0, 0);
  this.rectangleFeedback.add(x1, y1);
  this.repaint();
}

/**
 * Ensures selected items are visible at screen and moves
 * scroll bars if needed.
 */
PlanComponent.prototype.makeSelectionVisible = function() {
  if (this.isScrolled() && !this.selectionScrollUpdated) {
    this.selectionScrollUpdated = true;
    var plan = this;
    setTimeout(function() {
        plan.selectionScrollUpdated = false;
        var selectionBounds = plan.getSelectionBounds(true);
        if (selectionBounds != null) {
          var pixelBounds = plan.getShapePixelBounds(selectionBounds);
          pixelBounds = new java.awt.geom.Rectangle2D.Float(pixelBounds.getX() - 5, pixelBounds.getY() - 5, 
              pixelBounds.getWidth() + 10, pixelBounds.getHeight() + 10);
          var visibleRectangle = new java.awt.geom.Rectangle2D.Float(0, 0, 
              plan.scrollPane.clientWidth, plan.scrollPane.clientHeight);
          if (!pixelBounds.intersects(visibleRectangle)) {
            plan.scrollRectToVisible(pixelBounds);
          }
        }
      });
  }
}

/** 
 * @private 
 */
PlanComponent.prototype.scrollRectToVisible = function(rectangle) {
  if (this.isScrolled()) {
    var dx = 0;
    var dy = 0;
    if (rectangle.x < 0) {
      dx = rectangle.x;
    } else if (rectangle.getX() + rectangle.getWidth() > this.scrollPane.clientWidth) {
      dx = rectangle.getX() + rectangle.getWidth() - this.scrollPane.clientWidth;
    }
    if (rectangle.y < 0) {
      dy = rectangle.y;
    } else if (rectangle.getY() + rectangle.getHeight() > this.scrollPane.clientHeight) {
      dy = rectangle.getY() + rectangle.getHeight() - this.scrollPane.clientHeight;
    }
    this.moveView(this.convertPixelToLength(dx), this.convertPixelToLength(dy));
  }
}

/**
 * Returns the bounds of the selected items.
 * @param {boolean} includeCamera
 * @return {java.awt.geom.Rectangle2D}
 * @private
 */
PlanComponent.prototype.getSelectionBounds = function(includeCamera) {
  var g = this.getGraphics();
  if (g != null) {
    this.setRenderingHints(g);
  }
  if (includeCamera) {
    return this.getItemsBounds(g, this.home.getSelectedItems());
  } else {
    var selectedItems = this.home.getSelectedItems().slice(0);
    var index = selectedItems.indexOf(this.home.getCamera());
    if (index >= 0) {
      selectedItems.splice(index, 1);
    }
    return this.getItemsBounds(g, selectedItems);
  }
}

/**
 * Ensures the point at (<code>x</code>, <code>y</code>) is visible,
 * moving scroll bars if needed.
 * @param {number} x
 * @param {number} y
 */
PlanComponent.prototype.makePointVisible = function(x, y) {
  this.scrollRectToVisible(this.getShapePixelBounds(
      new java.awt.geom.Rectangle2D.Float(x, y, this.getPixelLength(), this.getPixelLength())));
}

/**
 * Moves the view from (dx, dy) unit in the scrolling zone it belongs to.
 * @param {number} dx
 * @param {number} dy
 */
PlanComponent.prototype.moveView = function(dx, dy) {
  if (this.isScrolled() 
      && (dx != 0 || dy != 0)) {
    this.scrollPane.scrollLeft += this.convertLengthToPixel(dx);
    this.scrollPane.scrollTop += this.convertLengthToPixel(dy);
    this.repaint();
  }
}

/**
 * Returns the scale used to display the plan.
 * @return {number}
 */
PlanComponent.prototype.getScale = function() {
  return this.scale;
}

/**
 * Sets the scale used to display the plan.
 * If this component is displayed in a scrolled panel the view position is updated
 * to ensure the center's view will remain the same after the scale change.
 * @param {number} scale
 */
PlanComponent.prototype.setScale = function(scale) {
  if (this.scale !== scale) {
    var xViewCenterPosition = 0;
    var yViewCenterPosition = 0;
    if (this.isScrolled()) {
      xViewCenterPosition = this.convertXPixelToModel(this.scrollPane.clientWidth / 2);
      yViewCenterPosition = this.convertYPixelToModel(this.scrollPane.clientHeight / 2);
    }

    this.scale = scale;
    this.revalidate();
    
    if (this.isScrolled()
        && !isNaN(xViewCenterPosition)) {
      var viewWidth = this.convertPixelToLength(this.scrollPane.clientWidth);
      var viewHeight = this.convertPixelToLength(this.scrollPane.clientHeight);
      this.scrollPane.scrollLeft += this.convertXModelToPixel(xViewCenterPosition - viewWidth / 2);
      this.scrollPane.scrollTop += this.convertYModelToPixel(yViewCenterPosition - viewHeight / 2);
    }
  }
}

/**
 * Returns <code>x</code> converted in model coordinates space.
 * @param {number} x
 * @return {number}
 */
PlanComponent.prototype.convertXPixelToModel = function(x) {
  var insets = this.getInsets();
  var planBounds = this.getPlanBounds();
  return this.convertPixelToLength(x - insets.left + (this.isScrolled() ? this.scrollPane.scrollLeft : 0)) - PlanComponent.MARGIN + planBounds.getMinX();
}

/**
 * Returns <code>y</code> converted in model coordinates space.
 * @param {number} y
 * @return {number}
 */
PlanComponent.prototype.convertYPixelToModel = function(y) {
  var insets = this.getInsets();
  var planBounds = this.getPlanBounds();
  return this.convertPixelToLength(y - insets.top + (this.isScrolled() ? this.scrollPane.scrollTop : 0)) - PlanComponent.MARGIN + planBounds.getMinY();
}

/**
 * Returns the length in model units (cm) of the given <code>size</code> in pixels.
 * @private
 */
PlanComponent.prototype.convertPixelToLength = function(size) {
  return size * this.getPixelLength();
}

/**
 * Returns <code>x</code> converted in view coordinates space.
 * @param {number} x
 * @return {number}
 * @private
 */
PlanComponent.prototype.convertXModelToPixel = function(x) {
  var insets = this.getInsets();
  var planBounds = this.getPlanBounds();
  return this.convertLengthToPixel(x - planBounds.getMinX() + PlanComponent.MARGIN) + insets.left - (this.isScrolled() ? this.scrollPane.scrollLeft : 0);
}

/**
 * Returns <code>y</code> converted in view coordinates space.
 * @param {number} y
 * @return {number}
 * @private
 */
PlanComponent.prototype.convertYModelToPixel = function(y) {
  var insets = this.getInsets();
  var planBounds = this.getPlanBounds();
  return this.convertLengthToPixel(y - planBounds.getMinY() + PlanComponent.MARGIN) + insets.top - (this.isScrolled() ? this.scrollPane.scrollTop : 0);
}

/**
 * Returns the size in pixels of the given <code>length</code> in model units (cm).
 * @private
 */
PlanComponent.prototype.convertLengthToPixel = function(length) {
  return Math.round(length / this.getPixelLength());
}

/**
 * Returns <code>x</code> converted in screen coordinates space.
 * @param {number} x
 * @return {number}
 */
PlanComponent.prototype.convertXModelToScreen = function(x) {
  return this.canvas.getBoundingClientRect().left + this.convertXModelToPixel(x);
}

/**
 * Returns <code>y</code> converted in screen coordinates space.
 * @param {number} y
 * @return {number}
 */
PlanComponent.prototype.convertYModelToScreen = function(y) {
  return this.canvas.getBoundingClientRect().top + this.convertYModelToPixel(y);
}

/**
 * Returns the length in centimeters of a pixel with the current scale.
 * @return {number}
 */
PlanComponent.prototype.getPixelLength = function() {
  // On contrary to Java version based on resolution scale, we use the actual scale 
  return 1 / this.getScale();
}

/**
 * Returns the bounds of <code>shape</code> in pixels coordinates space.
 * @param {Object} shape
 * @return {java.awt.geom.Rectangle2D.Float}
 * @private
 */
PlanComponent.prototype.getShapePixelBounds = function(shape) {
  var shapeBounds = shape.getBounds2D();
  return new java.awt.geom.Rectangle2D.Float(
      this.convertXModelToPixel(shapeBounds.getMinX()), 
      this.convertYModelToPixel(shapeBounds.getMinY()), 
      this.convertLengthToPixel(shapeBounds.getWidth()), 
      this.convertLengthToPixel(shapeBounds.getHeight()));
}

/**
 * Sets the cursor of this component.
 * @param {PlanView.CursorType|string} cursorType
 */
PlanComponent.prototype.setCursor = function(cursorType) {
  if (typeof cursorType === 'string') {
    this.canvas.style.cursor = cursorType;
  } else {
    switch (cursorType) {
      case PlanView.CursorType.ROTATION:
      case PlanView.CursorType.HEIGHT:
      case PlanView.CursorType.POWER:
      case PlanView.CursorType.ELEVATION:
      case PlanView.CursorType.RESIZE:
        if (this.mouseListener.longTouch != null) {
          clearTimeout(this.mouseListener.longTouch);
          this.mouseListener.longTouch = null;
          this.stopLongTouchAnimation();
        }
        // No break;
      case PlanView.CursorType.MOVE:
        if (this.lastTouchX 
            && this.lastTouchY) {
          this.startIndicatorAnimation(this.lastTouchX, this.lastTouchY, PlanView.CursorType[cursorType].toLowerCase());
        }
        break;
    }

    switch (cursorType) {
      case PlanView.CursorType.DRAW:
        this.setCursor('crosshair');
        break;
      case PlanView.CursorType.ROTATION:
        this.setCursor(this.rotationCursor);
        break;
      case PlanView.CursorType.HEIGHT:
        this.setCursor(this.heightCursor);
        break;
      case PlanView.CursorType.POWER:
        this.setCursor(this.powerCursor);
        break;
      case PlanView.CursorType.ELEVATION:
        this.setCursor(this.elevationCursor);
        break;
      case PlanView.CursorType.RESIZE:
        this.setCursor(this.resizeCursor);
        break;
      case PlanView.CursorType.PANNING:
        this.setCursor(this.panningCursor);
        break;
      case PlanView.CursorType.DUPLICATION:
        this.setCursor(this.duplicationCursor);
        break;
      case PlanView.CursorType.MOVE:
        this.setCursor(this.moveCursor);
        break;
      case PlanView.CursorType.SELECTION:
      default:
        this.setCursor('default');
        break;
    }
  }
}

/**
 * Sets tool tip text displayed as feedback.
 * @param {string} toolTipFeedback the text displayed in the tool tip
 *                    or <code>null</code> to make tool tip disappear.
 */
PlanComponent.prototype.setToolTipFeedback = function(toolTipFeedback, x, y) {
  this.tooltip.style.width = "";
  this.tooltip.style.marginLeft = "";
  if (toolTipFeedback.indexOf("<html>") === 0) {
    this.tooltip.style.textAlign = "left";
  } else {
    this.tooltip.style.textAlign = "center";
  }
  this.tooltip.innerHTML = toolTipFeedback.replace("<html>", "").replace("</html>", "");
  var marginTop = -(this.tooltip.clientHeight + (this.pointerType === View.PointerType.TOUCH ? 55 : 20));
  this.tooltip.style.marginTop = (marginTop - (this.pointerType === View.PointerType.TOUCH && this.touchOverlay.style.visibility == "visible" ? 15 : 0)) + "px";
  var width = this.tooltip.clientWidth + 10;
  this.tooltip.style.width = width + "px";
  this.tooltip.style.marginLeft = -width / 2 + "px";
  var containerRect = this.container.getBoundingClientRect();
  this.tooltip.style.left = Math.max(5 + width / 2, 
     Math.min(window.innerWidth - width / 2 - 10, containerRect.left + this.convertXModelToPixel(x))) + "px";
  var top =  containerRect.top + this.convertYModelToPixel(y);
  this.tooltip.style.top =  (top + marginTop > 15 ? top : top - marginTop + (this.pointerType === View.PointerType.TOUCH ? 100 : 20)) + "px";
  this.tooltip.style.visibility = "visible";  
}

/**
 * Set tool tip edition.
 * @param {Array} toolTipEditedProperties
 * @param {Array} toolTipPropertyValues
 * @param {number} x
 * @param {number} y
 */
PlanComponent.prototype.setToolTipEditedProperties = function(toolTipEditedProperties, toolTipPropertyValues, x, y) {
  // TODO
}

/**
 * Deletes tool tip text from screen.
 */
PlanComponent.prototype.deleteToolTipFeedback = function() {
  this.tooltip.style.visibility = "hidden";
  this.tooltip.style.width = "";
  this.tooltip.style.marginLeft = "";
  this.tooltip.style.marginTop = "";
}

/**
 * Sets whether the resize indicator of selected wall or piece of furniture
 * should be visible or not.
 * @param {boolean} resizeIndicatorVisible
 */
PlanComponent.prototype.setResizeIndicatorVisible = function(resizeIndicatorVisible) {
  this.resizeIndicatorVisible = resizeIndicatorVisible;
  this.repaint();
}

/**
 * Sets the location point for alignment feedback.
 * @param {Object} alignedObjectClass
 * @param {Object} alignedObject
 * @param {number} x
 * @param {number} y
 * @param {boolean} showPointFeedback
 */
PlanComponent.prototype.setAlignmentFeedback = function(alignedObjectClass, alignedObject, x, y, showPointFeedback) {
  this.alignedObjectClass = alignedObjectClass;
  this.alignedObjectFeedback = alignedObject;
  this.locationFeeback = new java.awt.geom.Point2D.Float(x, y);
  this.showPointFeedback = showPointFeedback;
  this.repaint();
}

/**
 * Sets the points used to draw an angle in plan view.
 * @param {number} xCenter
 * @param {number} yCenter
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
PlanComponent.prototype.setAngleFeedback = function(xCenter, yCenter, x1, y1, x2, y2) {
  this.centerAngleFeedback = new java.awt.geom.Point2D.Float(xCenter, yCenter);
  this.point1AngleFeedback = new java.awt.geom.Point2D.Float(x1, y1);
  this.point2AngleFeedback = new java.awt.geom.Point2D.Float(x2, y2);
}

/**
 * Sets the feedback of dragged items drawn during a drag and drop operation,
 * initiated from outside of plan view.
 * @param {Object[]} draggedItems
 */
PlanComponent.prototype.setDraggedItemsFeedback = function(draggedItems) {
  this.draggedItemsFeedback = draggedItems;
  this.repaint();
}

/**
 * Sets the given dimension lines to be drawn as feedback.
 * @param {DimensionLine[]} dimensionLines
 */
PlanComponent.prototype.setDimensionLinesFeedback = function(dimensionLines) {
  this.dimensionLinesFeedback = dimensionLines;
  this.repaint();
}

/**
 * Deletes all elements shown as feedback.
 */
PlanComponent.prototype.deleteFeedback = function() {
  this.deleteToolTipFeedback();
  this.rectangleFeedback = null;
  this.alignedObjectClass = null;
  this.alignedObjectFeedback = null;
  this.locationFeeback = null;
  this.centerAngleFeedback = null;
  this.point1AngleFeedback = null;
  this.point2AngleFeedback = null;
  this.draggedItemsFeedback = null;
  this.dimensionLinesFeedback = null;
  this.repaint();
}

/**
 * Returns <code>true</code>.
 * @param {Object[]} items
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
PlanComponent.prototype.canImportDraggedItems = function(items, x, y) {
  return true;
}

/**
 * Returns the size of the given piece of furniture in the horizontal plan,
 * or <code>null</code> if the view isn't able to compute such a value.
 * @param {HomePieceOfFurniture} piece
 * @return {Array}
 */
PlanComponent.prototype.getPieceOfFurnitureSizeInPlan = function(piece) {
  if (piece.getRoll() === 0 && piece.getPitch() === 0) {
    return [piece.getWidth(), piece.getDepth(), piece.getHeight()];
  }
  else if (!this.isFurnitureSizeInPlanSupported()) {
    return null;
  }
  else {
    return PlanComponent.PieceOfFurnitureModelIcon.computePieceOfFurnitureSizeInPlan(piece, this.object3dFactory);
  }
}

/**
 * Returns <code>true</code> if this component is able to compute the size of horizontally rotated furniture.
 * @return {boolean}
 */
PlanComponent.prototype.isFurnitureSizeInPlanSupported = function() {
  return PlanComponent.WEBGL_AVAILABLE;
}

/**
 * Removes components added to this pane and their listeners.
 */
PlanComponent.prototype.dispose = function() {
  this.container.removeEventListener("keydown", this.keyDownListener, false);
  this.container.removeEventListener("keyup", this.keyUpListener, false);
  this.container.removeEventListener("focusout", this.focusOutListener);
  if (OperatingSystem.isInternetExplorerOrLegacyEdge()
      && window.PointerEvent) {
    window.removeEventListener("pointermove", this.mouseListener.windowPointerMoved);
    window.removeEventListener("pointerup", this.mouseListener.windowPointerReleased);
  } else {
    window.removeEventListener("mousemove", this.mouseListener.windowMouseMoved);
    window.removeEventListener("mouseup", this.mouseListener.windowMouseReleased);
  }
  document.body.removeChild(this.touchOverlay);
  document.body.removeChild(this.tooltip);
  window.removeEventListener("resize", this.windowResizeListener);
  if (this.scrollPane != null) {
    this.container.removeChild(this.canvas);
    this.container.removeChild(this.scrollPane);
  }
  this.preferences.removePropertyChangeListener("UNIT", this.preferencesListener);
  this.preferences.removePropertyChangeListener("LANGUAGE", this.preferencesListener);
  this.preferences.removePropertyChangeListener("GRID_VISIBLE", this.preferencesListener);
  this.preferences.removePropertyChangeListener("DEFAULT_FONT_NAME", this.preferencesListener);
  this.preferences.removePropertyChangeListener("FURNITURE_VIEWED_FROM_TOP", this.preferencesListener);
  this.preferences.removePropertyChangeListener("FURNITURE_MODEL_ICON_SIZE", this.preferencesListener);
  this.preferences.removePropertyChangeListener("ROOM_FLOOR_COLORED_OR_TEXTURED", this.preferencesListener);
  this.preferences.removePropertyChangeListener("WALL_PATTERN", this.preferencesListener);
}

/**
 * Returns the component used as an horizontal ruler for this plan.
 * @return {Object}
 */
PlanComponent.prototype.getHorizontalRuler = function() {
  throw new UnsupportedOperationException("No rulers");
}

/**
 * Returns the component used as a vertical ruler for this plan.
 * @return {Object}
 */
PlanComponent.prototype.getVerticalRuler = function() {
  throw new UnsupportedOperationException("No rulers");
}


/**
 * A proxy for the furniture icon seen from top.
 * @param {Image} icon
 * @constructor
 * @private
 */
PlanComponent.PieceOfFurnitureTopViewIcon = function(image) {
  this.image = image;
}

/**
 * @ignore
 */
PlanComponent.PieceOfFurnitureTopViewIcon.prototype.getIconWidth = function() {
  return this.image.naturalWidth;
}

/**
 * @ignore
 */
PlanComponent.PieceOfFurnitureTopViewIcon.prototype.getIconHeight = function() {
  return this.image.naturalHeight;
}

/**
 * @ignore
 */
PlanComponent.PieceOfFurnitureTopViewIcon.prototype.paintIcon = function(g, x, y) {
  g.drawImage(this.image, x, y);
}

/**
 * @ignore
 */
PlanComponent.PieceOfFurnitureTopViewIcon.prototype.isWaitIcon = function() {
  return this.image === TextureManager.getInstance().getWaitImage();
}

/**
 * @ignore
 */
PlanComponent.PieceOfFurnitureTopViewIcon.prototype.isErrorIcon = function() {
  return this.image === TextureManager.getInstance().getErrorImage();
}

/**
 * @ignore
 */
PlanComponent.PieceOfFurnitureTopViewIcon.prototype.setIcon = function(image) {
  this.image = image;
}


/**
 * Creates a plan icon proxy for a <code>piece</code> of furniture.
 * @param {HomePieceOfFurniture} piece an object containing a plan icon content
 * @param {java.awt.Component} waitingComponent a waiting component. If <code>null</code>, the returned icon will
 * be read immediately in the current thread.
 * @constructor
 * @extends PlanComponent.PieceOfFurnitureTopViewIcon
 * @private
 */
PlanComponent.PieceOfFurniturePlanIcon = function(piece, waitingComponent) {
  PlanComponent.PieceOfFurnitureTopViewIcon.call(this, TextureManager.getInstance().getWaitImage());
  var planIcon = this;
  TextureManager.getInstance().loadTexture(piece.getPlanIcon(), false, {
      textureUpdated: function(textureImage) {
        planIcon.setIcon(textureImage);
        waitingComponent.repaint();
      },
      textureError: function(error) {
        planIcon.setIcon(TextureManager.getInstance().getErrorImage());
        waitingComponent.repaint();
      }
    });
}
PlanComponent.PieceOfFurniturePlanIcon.prototype = Object.create(PlanComponent.PieceOfFurnitureTopViewIcon.prototype);
PlanComponent.PieceOfFurniturePlanIcon.prototype.constructor = PlanComponent.PieceOfFurniturePlanIcon;


/**
 * Creates a top view icon proxy for a <code>piece</code> of furniture.
 * @param {HomePieceOfFurniture} piece an object containing a 3D content
 * @param {Object} object3dFactory a factory with a <code>createObject3D(home, item, waitForLoading)</code> method
 * @param {Object} waitingComponent a waiting component. If <code>null</code>, the returned icon will
 *          be read immediately in the current thread.
 * @param {number} iconSize the size in pixels of the generated icon
 * @constructor
 * @extends PlanComponent.PieceOfFurnitureTopViewIcon
 * @private
 */
PlanComponent.PieceOfFurnitureModelIcon = function(piece, object3dFactory, waitingComponent, iconSize) {
  PlanComponent.PieceOfFurnitureTopViewIcon.call(this, TextureManager.getInstance().getWaitImage());
  var modelIcon = this;
  ModelManager.getInstance().loadModel(piece.getModel(), waitingComponent === null, {
      modelUpdated: function(modelRoot) {
        var normalizedPiece = piece.clone();
        if (normalizedPiece.isResizable()
            && piece.getRoll() == 0) {
          normalizedPiece.setModelMirrored(false);
        }
        var pieceWidth = normalizedPiece.getWidthInPlan();
        var pieceDepth = normalizedPiece.getDepthInPlan();
        var pieceHeight = normalizedPiece.getHeightInPlan();
        normalizedPiece.setX(0);
        normalizedPiece.setY(0);
        normalizedPiece.setElevation(-pieceHeight / 2);
        normalizedPiece.setLevel(null);
        normalizedPiece.setAngle(0);
        if (waitingComponent !== null) {
          var updater = function() {
              object3dFactory.createObject3D(null, normalizedPiece,
                  function(pieceNode) {
                    modelIcon.createIcon(pieceNode, pieceWidth, pieceDepth, pieceHeight, iconSize, 
                        function(icon) {
                          modelIcon.setIcon(icon);
                          waitingComponent.repaint();
                        });
                  });
            };
          setTimeout(updater, 0);
        } else {
          modelIcon.setIcon(modelIcon.createIcon(object3dFactory.createObject3D(null, normalizedPiece, true), pieceWidth, pieceDepth, pieceHeight, iconSize));
        }
      },
      modelError: function(ex) {
        // In case of problem use a default red box
        modelIcon.setIcon(TextureManager.getInstance().getErrorImage());
        if (waitingComponent !== null) {
          waitingComponent.repaint();
        }
      }
    });
}
PlanComponent.PieceOfFurnitureModelIcon.prototype = Object.create(PlanComponent.PieceOfFurnitureTopViewIcon.prototype);
PlanComponent.PieceOfFurnitureModelIcon.prototype.constructor = PlanComponent.PieceOfFurnitureModelIcon;

/**
 * Returns the branch group bound to a universe and a canvas for the given
 * resolution.
 * @param {number} iconSize
 * @return {BranchGroup3D}
 * @private
 */
PlanComponent.PieceOfFurnitureModelIcon.prototype.getSceneRoot = function(iconSize) {
  if (!PlanComponent.PieceOfFurnitureModelIcon.canvas3D
      || !PlanComponent.PieceOfFurnitureModelIcon.canvas3D [iconSize]) {
    var canvas = document.createElement("canvas");
    canvas.width = iconSize;
    canvas.height = iconSize;
    canvas.style.backgroundColor = "rgba(0, 0, 0, 0)";
    var canvas3D = new HTMLCanvas3D(canvas);
    var rotation = mat4.create();
    mat4.fromXRotation(rotation, -Math.PI / 2);
    canvas3D.setViewPlatformTransform(rotation);
    canvas3D.setProjectionPolicy(HTMLCanvas3D.PARALLEL_PROJECTION);
    canvas3D.setFrontClipDistance(-1.1);
    canvas3D.setBackClipDistance(1.1);
    var sceneRoot = new BranchGroup3D();
    sceneRoot.setCapability(Group3D.ALLOW_CHILDREN_EXTEND);
    var lights = [
      new DirectionalLight3D(vec3.fromValues(0.6, 0.6, 0.6), vec3.fromValues(1.5, -0.8, -1)),
      new DirectionalLight3D(vec3.fromValues(0.6, 0.6, 0.6), vec3.fromValues(-1.5, -0.8, -1)),
      new DirectionalLight3D(vec3.fromValues(0.6, 0.6, 0.6), vec3.fromValues(0, -0.8, 1)),
      new AmbientLight3D(vec3.fromValues(0.2, 0.2, 0.2))];
    for (var i = 0; i < lights.length; i++) {
      sceneRoot.addChild(lights[i]);
    }
    canvas3D.setScene(sceneRoot);
    if (!PlanComponent.PieceOfFurnitureModelIcon.canvas3D) {
      PlanComponent.PieceOfFurnitureModelIcon.canvas3D = {};
    }
    PlanComponent.PieceOfFurnitureModelIcon.canvas3D [iconSize] = canvas3D;
  }
  
  if (iconSize !== 128) {
    // Keep only canvas for 128 (default) size and the requested icon size
    for (var key in PlanComponent.PieceOfFurnitureModelIcon.canvas3D) {
      if (key != 128
          && key != iconSize
          && PlanComponent.PieceOfFurnitureModelIcon.canvas3D.hasOwnProperty(key)) {
        PlanComponent.PieceOfFurnitureModelIcon.canvas3D [key].clear();
        delete PlanComponent.PieceOfFurnitureModelIcon.canvas3D [key];
      }
    }
  }
  return PlanComponent.PieceOfFurnitureModelIcon.canvas3D [iconSize].getScene();
}

/**
 * Creates an icon created and scaled from piece model content, and calls <code>iconObserver</code> once the icon is ready
 * or returns the icon itself if <code>iconObserver</code> is not given.
 * @param {Object3DBranch} pieceNode
 * @param {number} pieceWidth
 * @param {number} pieceDepth
 * @param {number} pieceHeight
 * @param {number} iconSize
 * @param {Object} [iconObserver] a function that will receive the icon as parameter
 * @return {Image} the icon or <code>undefined</code> if <code>iconObserver</code> exists
 * @private
 */
PlanComponent.PieceOfFurnitureModelIcon.prototype.createIcon = function(pieceNode, pieceWidth, pieceDepth, pieceHeight, iconSize, iconObserver) {
  var scaleTransform = mat4.create();
  mat4.scale(scaleTransform, scaleTransform, vec3.fromValues(2 / pieceWidth, 2 / pieceHeight, 2 / pieceDepth));
  var modelTransformGroup = new TransformGroup3D();
  modelTransformGroup.setTransform(scaleTransform);
  if (pieceNode.getParent() != null) {
    pieceNode.getParent().removeChild(pieceNode);
  }
  modelTransformGroup.addChild(pieceNode);
  var model = new BranchGroup3D();
  model.addChild(modelTransformGroup);
  var sceneRoot = this.getSceneRoot(iconSize);
  if (iconObserver) {
    var observingStart = Date.now();
    var iconGeneration = function() {
        sceneRoot.addChild(model);
        var loadingCompleted = PlanComponent.PieceOfFurnitureModelIcon.canvas3D [iconSize].isLoadingCompleted();
        if (loadingCompleted || (Date.now() - observingStart) > 5000) {
          PlanComponent.PieceOfFurnitureModelIcon.canvas3D [iconSize].getImage(iconObserver);
        }
        sceneRoot.removeChild(model);
        if (!loadingCompleted) {
          setTimeout(iconGeneration, 0);
        }
      };
    iconGeneration();
    return undefined;
  }
  else {
    sceneRoot.addChild(model);
    var icon = PlanComponent.PieceOfFurnitureModelIcon.canvas3D [iconSize].getImage();
    sceneRoot.removeChild(model);
    return icon;
  }
}

/**
 * Returns the size of the given piece computed from its vertices.
 * @param {HomePieceOfFurniture} piece
 * @param {Object} object3dFactory
 * @return {Array}
 * @private
 */
PlanComponent.PieceOfFurnitureModelIcon.computePieceOfFurnitureSizeInPlan = function(piece, object3dFactory) {
  var horizontalRotation = mat4.create();
  if (piece.getPitch() !== 0) {
    mat4.fromXRotation(horizontalRotation, -piece.getPitch());
  }
  if (piece.getRoll() !== 0) {
    var rollRotation = mat4.create();
    mat4.fromZRotation(rollRotation, -piece.getRoll());
    mat4.mul(horizontalRotation, horizontalRotation, rollRotation, horizontalRotation);
  }
  // Compute bounds of a piece centered at the origin and rotated around the target horizontal angle
  piece = piece.clone();
  piece.setX(0);
  piece.setY(0);
  piece.setElevation(-piece.getHeight() / 2);
  piece.setLevel(null);
  piece.setAngle(0);
  piece.setRoll(0);
  piece.setPitch(0);
  piece.setWidthInPlan(piece.getWidth());
  piece.setDepthInPlan(piece.getDepth());
  piece.setHeightInPlan(piece.getHeight());
  var bounds = ModelManager.getInstance().getBounds(object3dFactory.createObject3D(null, piece, true), horizontalRotation);
  var lower = vec3.create();
  bounds.getLower(lower);
  var upper = vec3.create();
  bounds.getUpper(upper);
  return [Math.max(0.001, (upper[0] - lower[0])),
    Math.max(0.001, (upper[2] - lower[2])),
    Math.max(0.001, (upper[1] - lower[1]))];
}


/**
 * A map key used to compare furniture with the same top view icon.
 * @param {HomePieceOfFurniture} piece
 * @constructor
 * @private
 */
PlanComponent.HomePieceOfFurnitureTopViewIconKey = function(piece) {
  this.piece = piece;
  this.hashCode = (piece.getPlanIcon() != null ? piece.getPlanIcon().hashCode() : piece.getModel().hashCode())
      + (piece.getColor() != null ? 37 * piece.getColor() : 1234);
  if (piece.isHorizontallyRotated()
      || piece.getTexture() != null) {
    this.hashCode +=
          (piece.getTexture() != null ? 37 * piece.getTexture().hashCode() : 0)
        + 37 * (piece.getWidthInPlan() | 0)
        + 37 * (piece.getDepthInPlan() | 0)
        + 37 * (piece.getHeightInPlan() | 0);
  }
  if (piece.getRoll() != 0) {
    this.hashCode += 37 * (piece.isModelMirrored() ? 1231 : 1237);
  }
  if (piece.getPlanIcon() != null) {
    this.hashCode +=
          37 * (function(matrix) { 
                   return (31 * matrix[0][0] + 31 * matrix[0][1] + 31 * matrix[0][2]
                         + 37 * matrix[1][0] + 37 * matrix[1][1] + 37 * matrix[1][2]
                         + 41 * matrix[2][0] + 41 * matrix[2][1] + 41 * matrix[2][2]) | 0; })(piece.getModelRotation())
        + 37 * (piece.isModelCenteredAtOrigin() ? 1 : 0)
        + 37 * (piece.isBackFaceShown() ? 1 : 0)
        + 37 * ((piece.getPitch() * 1000) | 0)
        + 37 * ((piece.getRoll() * 1000) | 0)
        + 37 * (function(array) {
                   var hashCode = 0;
                   if (array != null) {
                     for (var i = 0; i < array.length; i++) {
                       if (array [i] != null) {
                         hashCode += 37 * array [i].hashCode(); 
                       }
                     }
                   }
                   return hashCode | 0; })(piece.getModelTransformations())
        + 37 * (function(array) {
                   var hashCode = 0;
                   if (array != null) {
                     for (var i = 0; i < array.length; i++) {
                       if (array [i] != null) {
                         hashCode += 37 * array [i].hashCode(); 
                       }
                     }
                   }
                   return hashCode | 0; })(piece.getModelMaterials())
        + (piece.getShininess() != null ? 37 * ((piece.getShininess() * 1000) | 0) : 3456);
  }
}
  
/**
 * @param {Object} obj
 * @return {boolean}
 * @private
 */
PlanComponent.HomePieceOfFurnitureTopViewIconKey.prototype.equals = function(obj) {
  if (obj instanceof PlanComponent.HomePieceOfFurnitureTopViewIconKey) {
    var piece2 = obj.piece;
    // Test all furniture data that could make change the plan icon
    // (see HomePieceOfFurniture3D and PlanComponent#addModelListeners for changes conditions)
    return (this.piece.getPlanIcon() != null
            ? this.piece.getPlanIcon().equals(piece2.getPlanIcon())
            : this.piece.getModel().equals(piece2.getModel()))
        && (this.piece.getColor() == piece2.getColor())
        && (this.piece.getTexture() == piece2.getTexture()
            || this.piece.getTexture() != null && this.piece.getTexture().equals(piece2.getTexture()))
        && (!this.piece.isHorizontallyRotated()
                && !piece2.isHorizontallyRotated()
                && this.piece.getTexture() == null
                && piece2.getTexture() == null
            || this.piece.getWidthInPlan() == piece2.getWidthInPlan()
                && this.piece.getDepthInPlan() == piece2.getDepthInPlan()
                && this.piece.getHeightInPlan() == piece2.getHeightInPlan())
        && (this.piece.getRoll() == 0
                && piece2.getRoll() == 0
            || this.piece.isModelMirrored() == piece2.isModelMirrored())
        && (this.piece.getPlanIcon() != null
            || (function(matrix1, matrix2) { 
                  return matrix1[0][0] == matrix2[0][0] && matrix1[0][1] == matrix2[0][1] && matrix1[0][2] == matrix2[0][2]
                      && matrix1[1][0] == matrix2[1][0] && matrix1[1][1] == matrix2[1][1] && matrix1[1][2] == matrix2[1][2]
                      && matrix1[2][0] == matrix2[2][0] && matrix1[2][1] == matrix2[2][1] && matrix1[2][2] == matrix2[2][2]; })(this.piece.getModelRotation(), piece2.getModelRotation()) 
                && this.piece.isModelCenteredAtOrigin() == piece2.isModelCenteredAtOrigin()
                && this.piece.isBackFaceShown() == piece2.isBackFaceShown()
                && this.piece.getPitch() == piece2.getPitch()
                && this.piece.getRoll() == piece2.getRoll()
                && (function(array1, array2) { 
                      if (array1 === array2) return true;
                      if (array1 == null || array2 == null || array1.length !== array2.length) return false;
                      for (var i = 0; i < array1.length; i++) {
                        if (array1[i] !== array2[i] && (array1[i] == null || !array1[i].equals(array2[i]))) return false;
                      }
                      return true; })(this.piece.getModelTransformations(), piece2.getModelTransformations()) 
                && (function(array1, array2) { 
                      if (array1 === array2) return true;
                      if (array1 == null || array2 == null || array1.length !== array2.length) return false;
                      for (var i = 0; i < array1.length; i++) {
                        if (array1[i] !== array2[i] && (array1[i] == null || !array1[i].equals(array2[i]))) return false;
                      }
                      return true; })(this.piece.getModelMaterials(), piece2.getModelMaterials()) 
                && this.piece.getShininess() == piece2.getShininess());
  } else {
    return false;
  }
}
  
/**
 * @private
 */
PlanComponent.HomePieceOfFurnitureTopViewIconKey.prototype.hashCode = function() {
  return this.hashCode;
}
