/*
 * DO NOT MODIFY: this source code has been automatically generated from Java
 *                with JSweet (http://www.jsweet.org)
 *
 * Sweet Home 3D, Copyright (c) 2017 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Creates a new plan that displays <code>home</code>.
 * @param {Home} home the home to display
 * @param {UserPreferences} preferences user preferences to retrieve used unit, grid visibility...
 * @param {Object} [object3dFactory] a factory able to create 3D objects from <code>home</code> furniture.
 * The {@link Object3DFactory#createObject3D(Home, Selectable, boolean) createObject3D} of
 * this factory is expected to return an instance of {@link Object3DBranch} in current implementation.
 * @param {PlanController} controller the optional controller used to manage home items modification
 * @class
 * @extends javax.swing.JComponent
 * @author Emmanuel Puybaret
 */
var PlanComponent = (function () {
    function PlanComponent(canvasId, home, preferences, object3dFactory, controller) {
        //painting : boolean = false;
        this.canvasNeededRepaint = false;
        this.canvas = document.getElementById(canvasId);
        var computedStyle = window.getComputedStyle(this.canvas);
        this.font = [computedStyle.fontStyle, computedStyle.fontSize, computedStyle.fontFamily].join(' ');
        this.resolutionScale = 1.0;
        this.scale = 0.5 * this.resolutionScale;
        this.selectedItemsOutlinePainted = true;
        this.backgroundPainted = true;
        this.planBoundsCacheValid = false;
        this.home = home;
        this.preferences = preferences;
        if (controller == null) {
            controller = object3dFactory;
            object3dFactory = new Object3DBranchFactory();
        }
        this.object3dFactory = object3dFactory;
        this.setOpaque(true);
        this.addModelListeners(home, preferences, controller);
        if (controller != null) {
            this.addMouseListeners(controller);
            this.addFocusListener(controller);
            this.addControllerListener(controller);
            this.createActions(controller);
            this.installDefaultKeyboardActions();
        }
        this.rotationCursor = 'alias'; // this.createCustomCursor$java_lang_String$java_lang_String$java_lang_String$int("resources/cursors/rotation16x16.png", "resources/cursors/rotation32x32.png", "Rotation cursor", Cursor.MOVE_CURSOR);
        this.elevationCursor = 'row-resize'; //this.createCustomCursor$java_lang_String$java_lang_String$java_lang_String$int("resources/cursors/elevation16x16.png", "resources/cursors/elevation32x32.png", "Elevation cursor", Cursor.MOVE_CURSOR);
        this.heightCursor = 'n-resize'; //this.createCustomCursor$java_lang_String$java_lang_String$java_lang_String$int("resources/cursors/height16x16.png", "resources/cursors/height32x32.png", "Height cursor", Cursor.MOVE_CURSOR);
        this.powerCursor = 'cell'; //this.createCustomCursor$java_lang_String$java_lang_String$java_lang_String$int("resources/cursors/power16x16.png", "resources/cursors/power32x32.png", "Power cursor", Cursor.MOVE_CURSOR);
        this.resizeCursor = 'all-scroll'; // this.createCustomCursor$java_lang_String$java_lang_String$java_lang_String$int("resources/cursors/resize16x16.png", "resources/cursors/resize32x32.png", "Resize cursor", Cursor.MOVE_CURSOR);
        this.moveCursor = 'move'; // this.createCustomCursor$java_lang_String$java_lang_String$java_lang_String$int("resources/cursors/move16x16.png", "resources/cursors/move32x32.png", "Move cursor", Cursor.MOVE_CURSOR);
        this.panningCursor = 'col-resize'; //this.createCustomCursor$java_lang_String$java_lang_String$java_lang_String$int("resources/cursors/panning16x16.png", "resources/cursors/panning32x32.png", "Panning cursor", Cursor.HAND_CURSOR);
        this.duplicationCursor = 'copy'; //java.awt.dnd.DragSource.DefaultCopyDrop;
        this.patternImagesCache = ({});
        //setForeground(Color.BLACK);
        //setBackground(Color.WHITE);
        this.repaint();
    }
    PlanComponent.__static_initialize = function () { if (!PlanComponent.__static_initialized) {
        PlanComponent.__static_initialized = true;
        PlanComponent.__static_initializer_0();
    } };
    PlanComponent.__static_initializer_0 = function () {
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
        PlanComponent.FURNITURE_HEIGHT_POINT_INDICATOR = new java.awt.geom.Rectangle2D.Float(-1.5, -1.5, 3.0, 3.0);
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
        var cameraBodyAreaPath = new java.awt.geom.GeneralPath();
        cameraBodyAreaPath.append(new java.awt.geom.Ellipse2D.Float(-0.5, -0.425, 1.0, 0.85), false);
        cameraBodyAreaPath.append(new java.awt.geom.Ellipse2D.Float(-0.5, -0.3, 0.24, 0.6), false);
        cameraBodyAreaPath.append(new java.awt.geom.Ellipse2D.Float(0.26, -0.3, 0.24, 0.6), false);
        PlanComponent.CAMERA_BODY = new java.awt.geom.Area(cameraBodyAreaPath);
        var cameraHeadAreaPath = new java.awt.geom.GeneralPath();
        cameraHeadAreaPath.append(new java.awt.geom.Ellipse2D.Float(-0.18, -0.45, 0.36, 1.0), false);
        cameraHeadAreaPath.moveTo(-0.04, 0.55);
        cameraHeadAreaPath.lineTo(0, 0.65);
        cameraHeadAreaPath.lineTo(0.04, 0.55);
        cameraHeadAreaPath.closePath();
        PlanComponent.CAMERA_HEAD = new java.awt.geom.Area(cameraHeadAreaPath);
        PlanComponent.DIMENSION_LINE_END = new java.awt.geom.GeneralPath();
        PlanComponent.DIMENSION_LINE_END.moveTo(-5, 5);
        PlanComponent.DIMENSION_LINE_END.lineTo(5, -5);
        PlanComponent.DIMENSION_LINE_END.moveTo(0, 5);
        PlanComponent.DIMENSION_LINE_END.lineTo(0, -5);
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
        var canvas = document.createElement("canvas");
        var gl = canvas.getContext("webgl");
        if (!gl) {
            gl = canvas.getContext("experimental-webgl");
            if (!gl) {
                PlanComponent.WEBGL_AVAILABLE = false;
            }
        }
    };
    PlanComponent.prototype.getGraphics = function () {
        return new Graphics2D(this.canvas);
    };
    PlanComponent.prototype.repaint = function () {
        var _this = this;
        if (!this.canvasNeededRepaint) {
            this.canvasNeededRepaint = true;
            requestAnimationFrame(function () {
                if (_this.canvasNeededRepaint) {
                    //console.error("<<painting>>");
                    var t = Date.now();
                    _this.canvasNeededRepaint = false;
                    _this.paintComponent(_this.getGraphics());
                }
            });
        }
    };
    PlanComponent.prototype.revalidate = function () {
        this.repaint();
    };
    PlanComponent.prototype.isOpaque = function () {
        return true;
    };
    PlanComponent.prototype.getWidth = function () {
        return this.canvas.width;
    };
    PlanComponent.prototype.getHeight = function () {
        return this.canvas.height;
    };
    PlanComponent.prototype.setToolTipFeedback = function (s, x, y) {
        // TODO
    };
    PlanComponent.prototype.setOpaque = function (opaque) {
        // TODO
    };
    PlanComponent.prototype.getBackground = function () {
        return "#FFFFFF";
    };
    PlanComponent.prototype.getForeground = function () {
        return "#000000";
    };
    PlanComponent.prototype.setFont = function (font) {
        this.font = font;
    };
    PlanComponent.prototype.getParent = function () {
        return null;
    };
    PlanComponent.prototype.getInsets = function () {
        return { top: 0, bottom: 0, left: 0, right: 0 };
    };
    /**
     * Adds home items and selection listeners on this component to receive
     * changes notifications from home.
     * @param {Home} home
     * @param {UserPreferences} preferences
     * @param {PlanController} controller
     * @private
     */
    PlanComponent.prototype.addModelListeners = function (home, preferences, controller) {
        var _this = this;
        var furnitureChangeListener = {
            propertyChange: function (ev) {
                if (_this.furnitureTopViewIconKeys != null && ("MODEL_TRANSFORMATIONS" == ev.getPropertyName() || "ROLL" == ev.getPropertyName() || "PITCH" == ev.getPropertyName() || "WIDTH_IN_PLAN" == ev.getPropertyName() || "DEPTH_IN_PLAN" == ev.getPropertyName() || "HEIGHT_IN_PLAN" == ev.getPropertyName()) && (ev.getSource().isHorizontallyRotated() || ev.getSource().getTexture() != null)) {
                    if ("HEIGHT_IN_PLAN" == ev.getPropertyName()) {
                        _this.sortedLevelFurniture = null;
                    }
                    if (!(ev.getSource() != null && ev.getSource() instanceof HomeFurnitureGroup)) {
                        if (controller == null || !controller.isModificationState()) {
                            /* remove */ (function (m, k) { if (m.entries == null)
                                m.entries = []; for (var i = 0; i < m.entries.length; i++)
                                if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                                    return m.entries.splice(i, 1)[0];
                                } })(_this.furnitureTopViewIconKeys, ev.getSource());
                        }
                        else {
                            controller.addPropertyChangeListener("MODIFICATION_STATE", {
                                propertyChange: function (ev2) {
                                    /* remove */ (function (m, k) { if (m.entries == null)
                                        m.entries = []; for (var i = 0; i < m.entries.length; i++)
                                        if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                                            return m.entries.splice(i, 1)[0];
                                        } })(_this.furnitureTopViewIconKeys, ev.getSource());
                                    _this.repaint();
                                    controller.removePropertyChangeListener("MODIFICATION_STATE", _this);
                                }
                            });
                        }
                    }
                    _this.revalidate();
                }
                else if (_this.furnitureTopViewIconKeys != null && ("COLOR" == ev.getPropertyName() || "TEXTURE" == ev.getPropertyName() || "MODEL_MATERIALS" == ev.getPropertyName() || "SHININESS" == ev.getPropertyName())) {
                    /* remove */ (function (m, k) { if (m.entries == null)
                        m.entries = []; for (var i = 0; i < m.entries.length; i++)
                        if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                            return m.entries.splice(i, 1)[0];
                        } })(_this.furnitureTopViewIconKeys, ev.getSource());
                    _this.repaint();
                }
                else if ("ELEVATION" == ev.getPropertyName() || "LEVEL" == ev.getPropertyName() || "HEIGHT_IN_PLAN" == ev.getPropertyName()) {
                    _this.sortedLevelFurniture = null;
                    _this.repaint();
                }
                else if (_this.doorOrWindowWallThicknessAreasCache != null && (function (m, k) { if (m.entries == null)
                    m.entries = []; for (var i = 0; i < m.entries.length; i++)
                    if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                        return true;
                    } return false; })(_this.doorOrWindowWallThicknessAreasCache, ev.getSource()) && ("WIDTH" == ev.getPropertyName() || "DEPTH" == ev.getPropertyName() || "ANGLE" == ev.getPropertyName() || "MODEL_MIRRORED" == ev.getPropertyName() || "MODEL_TRANSFORMATIONS" == ev.getPropertyName() || "X" == ev.getPropertyName() || "Y" == ev.getPropertyName() || "LEVEL" == ev.getPropertyName())) {
                    /* remove */ (function (m, k) { if (m.entries == null)
                        m.entries = []; for (var i = 0; i < m.entries.length; i++)
                        if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                            return m.entries.splice(i, 1)[0];
                        } })(_this.doorOrWindowWallThicknessAreasCache, ev.getSource());
                    _this.revalidate();
                }
                else {
                    _this.revalidate();
                }
            }
        };
        if (home.getFurniture() != null) {
            home.getFurniture().forEach(function (piece) {
                piece.addPropertyChangeListener(furnitureChangeListener);
                if (piece != null && piece instanceof HomeFurnitureGroup) {
                    piece.getAllFurniture().forEach(function (childPiece) {
                        childPiece.addPropertyChangeListener(furnitureChangeListener);
                    });
                }
            });
        }
        home.addFurnitureListener(function (ev) {
            var piece = ev.getItem();
            if (ev.getType() === CollectionEvent.Type.ADD) {
                piece.addPropertyChangeListener(furnitureChangeListener);
                if (piece != null && piece instanceof HomeFurnitureGroup) {
                    piece.getAllFurniture().forEach(function (childPiece) {
                        childPiece.addPropertyChangeListener(furnitureChangeListener);
                    });
                }
            }
            else if (ev.getType() === CollectionEvent.Type.DELETE) {
                piece.removePropertyChangeListener(furnitureChangeListener);
                if (piece != null && piece instanceof HomeFurnitureGroup) {
                    piece.getAllFurniture().forEach(function (childPiece) {
                        childPiece.removePropertyChangeListener(furnitureChangeListener);
                    });
                }
            }
            _this.sortedLevelFurniture = null;
            _this.revalidate();
        });
        var wallChangeListener = {
            propertyChange: function (ev) {
                var propertyName = ev.getPropertyName();
                if ("X_START" == propertyName || "X_END" == propertyName || "Y_START" == propertyName || "Y_END" == propertyName || "WALL_AT_START" == propertyName || "WALL_AT_END" == propertyName || "THICKNESS" == propertyName || "ARC_EXTENT" == propertyName || "PATTERN" == propertyName) {
                    if (_this.home.isAllLevelsSelection()) {
                        _this.otherLevelsWallAreaCache = null;
                        _this.otherLevelsWallsCache = null;
                    }
                    _this.wallAreasCache = null;
                    _this.doorOrWindowWallThicknessAreasCache = null;
                    _this.revalidate();
                }
                else if ("LEVEL" == propertyName || "HEIGHT" == propertyName || "HEIGHT_AT_END" == propertyName) {
                    _this.otherLevelsWallAreaCache = null;
                    _this.otherLevelsWallsCache = null;
                    _this.wallAreasCache = null;
                    _this.repaint();
                }
            }
        };
        if (home.getWalls() != null)
            home.getWalls().forEach(function (wall) {
                wall.addPropertyChangeListener(wallChangeListener);
            });
        home.addWallsListener(function (ev) {
            if (ev.getType() === CollectionEvent.Type.ADD) {
                ev.getItem().addPropertyChangeListener(wallChangeListener);
            }
            else if (ev.getType() === CollectionEvent.Type.DELETE) {
                ev.getItem().removePropertyChangeListener(wallChangeListener);
            }
            _this.otherLevelsWallAreaCache = null;
            _this.otherLevelsWallsCache = null;
            _this.wallAreasCache = null;
            _this.doorOrWindowWallThicknessAreasCache = null;
            _this.revalidate();
        });
        var roomChangeListener = {
            propertyChange: function (ev) {
                var propertyName = ev.getPropertyName();
                if ("POINTS" == propertyName || "NAME" == propertyName || "NAME_X_OFFSET" == propertyName || "NAME_Y_OFFSET" == propertyName || "NAME_STYLE" == propertyName || "NAME_ANGLE" == propertyName || "AREA_VISIBLE" == propertyName || "AREA_X_OFFSET" == propertyName || "AREA_Y_OFFSET" == propertyName || "AREA_STYLE" == propertyName || "AREA_ANGLE" == propertyName) {
                    _this.sortedLevelRooms = null;
                    _this.otherLevelsRoomAreaCache = null;
                    _this.otherLevelsRoomsCache = null;
                    _this.revalidate();
                }
                else if (_this.preferences.isRoomFloorColoredOrTextured() && ("FLOOR_COLOR" == propertyName || "FLOOR_TEXTURE" == propertyName || "FLOOR_VISIBLE" == propertyName)) {
                    _this.repaint();
                }
            }
        };
        if (home.getRooms() != null)
            home.getRooms().forEach(function (room) { return room.addPropertyChangeListener(roomChangeListener); });
        home.addRoomsListener(function (ev) {
            if (ev.getType() === CollectionEvent.Type.ADD) {
                ev.getItem().addPropertyChangeListener(roomChangeListener);
            }
            else if (ev.getType() === CollectionEvent.Type.DELETE) {
                ev.getItem().removePropertyChangeListener(roomChangeListener);
            }
            _this.sortedLevelRooms = null;
            _this.otherLevelsRoomAreaCache = null;
            _this.otherLevelsRoomsCache = null;
            _this.revalidate();
        });
        var changeListener = {
            propertyChange: function (ev) {
                var propertyName = ev.getPropertyName();
                if ("COLOR" == propertyName || "DASH_STYLE" == propertyName) {
                    _this.repaint();
                }
                else {
                    _this.revalidate();
                }
            }
        };
        if (home.getPolylines() != null)
            home.getPolylines().forEach(function (polyline) { return polyline.addPropertyChangeListener(changeListener); });
        home.addPolylinesListener(function (ev) {
            if (ev.getType() === CollectionEvent.Type.ADD) {
                ev.getItem().addPropertyChangeListener(changeListener);
            }
            else if (ev.getType() === CollectionEvent.Type.DELETE) {
                ev.getItem().removePropertyChangeListener(changeListener);
            }
            _this.revalidate();
        });
        var dimensionLineChangeListener = {
            propertyChange: function (ev) { return _this.revalidate(); }
        };
        if (home.getDimensionLines() != null)
            home.getDimensionLines().forEach(function (dimensionLine) { return dimensionLine.addPropertyChangeListener(dimensionLineChangeListener); });
        home.addDimensionLinesListener(function (ev) {
            if (ev.getType() === CollectionEvent.Type.ADD) {
                ev.getItem().addPropertyChangeListener(dimensionLineChangeListener);
            }
            else if (ev.getType() === CollectionEvent.Type.DELETE) {
                ev.getItem().removePropertyChangeListener(dimensionLineChangeListener);
            }
            _this.revalidate();
        });
        var labelChangeListener = {
            propertyChange: function (ev) { return _this.revalidate(); }
        };
        if (home.getLabels() != null)
            home.getLabels().forEach(function (label) { return label.addPropertyChangeListener(labelChangeListener); });
        home.addLabelsListener(function (ev) {
            if (ev.getType() === CollectionEvent.Type.ADD) {
                ev.getItem().addPropertyChangeListener(labelChangeListener);
            }
            else if (ev.getType() === CollectionEvent.Type.DELETE) {
                ev.getItem().removePropertyChangeListener(labelChangeListener);
            }
            _this.revalidate();
        });
        var levelChangeListener = {
            propertyChange: function (ev) {
                var propertyName = ev.getPropertyName();
                if ("BACKGROUND_IMAGE" == propertyName || "ELEVATION" == propertyName || "ELEVATION_INDEX" == propertyName || "VIEWABLE" == propertyName) {
                    _this.backgroundImageCache = null;
                    _this.otherLevelsWallAreaCache = null;
                    _this.otherLevelsWallsCache = null;
                    _this.otherLevelsRoomAreaCache = null;
                    _this.otherLevelsRoomsCache = null;
                    _this.wallAreasCache = null;
                    _this.doorOrWindowWallThicknessAreasCache = null;
                    _this.sortedLevelFurniture = null;
                    _this.sortedLevelRooms = null;
                    _this.repaint();
                }
            }
        };
        if (home.getLevels() != null)
            home.getLevels().forEach(function (level) { return level.addPropertyChangeListener(levelChangeListener); });
        home.addLevelsListener(function (ev) {
            var level = ev.getItem();
            if (ev.getType() === CollectionEvent.Type.ADD) {
                level.addPropertyChangeListener(levelChangeListener);
            }
            else if (ev.getType() === CollectionEvent.Type.DELETE) {
                level.removePropertyChangeListener(levelChangeListener);
            }
            _this.revalidate();
        });
        home.addPropertyChangeListener("CAMERA", {
            propertyChange: function (ev) { return _this.revalidate(); }
        });
        home.getObserverCamera().addPropertyChangeListener({
            propertyChange: function (ev) {
                var propertyName = ev.getPropertyName();
                if ("X" == propertyName || "Y" == propertyName || "FIELD_OF_VIEW" == propertyName || "YAW" == propertyName || "WIDTH" == propertyName || "DEPTH" == propertyName || "HEIGHT" == propertyName) {
                    _this.revalidate();
                }
            }
        });
        home.getCompass().addPropertyChangeListener({
            propertyChange: function (ev) {
                var propertyName = ev.getPropertyName();
                if ("X" == propertyName || "Y" == propertyName || "NORTH_DIRECTION" == propertyName || "DIAMETER" == propertyName || "VISIBLE" == propertyName) {
                    _this.revalidate();
                }
            }
        });
        home.addSelectionListener({
            selectionChanged: function (ev) { return _this.repaint(); }
        });
        home.addPropertyChangeListener("BACKGROUND_IMAGE", {
            propertyChange: function (ev) {
                _this.backgroundImageCache = null;
                _this.repaint();
            }
        });
        home.addPropertyChangeListener("SELECTED_LEVEL", {
            propertyChange: function (ev) {
                _this.backgroundImageCache = null;
                _this.otherLevelsWallAreaCache = null;
                _this.otherLevelsWallsCache = null;
                _this.otherLevelsRoomAreaCache = null;
                _this.otherLevelsRoomsCache = null;
                _this.wallAreasCache = null;
                _this.doorOrWindowWallThicknessAreasCache = null;
                _this.sortedLevelRooms = null;
                _this.sortedLevelFurniture = null;
                _this.repaint();
            }
        });
        var preferencesListener = new PlanComponent.UserPreferencesChangeListener(this);
        preferences.addPropertyChangeListener("UNIT", preferencesListener);
        preferences.addPropertyChangeListener("LANGUAGE", preferencesListener);
        preferences.addPropertyChangeListener("GRID_VISIBLE", preferencesListener);
        preferences.addPropertyChangeListener("DEFAULT_FONT_NAME", preferencesListener);
        preferences.addPropertyChangeListener("FURNITURE_VIEWED_FROM_TOP", preferencesListener);
        preferences.addPropertyChangeListener("FURNITURE_MODEL_ICON_SIZE", preferencesListener);
        preferences.addPropertyChangeListener("ROOM_FLOOR_COLORED_OR_TEXTURED", preferencesListener);
        preferences.addPropertyChangeListener("WALL_PATTERN", preferencesListener);
    };
    /**
     * Adds AWT mouse listeners to this component that calls back <code>controller</code> methods.
     * @param {PlanController} controller
     * @private
     */
    PlanComponent.prototype.addMouseListeners = function (controller) {
        var mouseListener = {
            lastMousePressedLocation: null,
            mousePressed: function (ev) {
                if (this.isEnabled() && ev.button === 0) {
                    mouseListener.lastMousePressedLocation = [ev.clientX, ev.clientY];
                    var alignmentActivated = OperatingSystem.isWindows() || OperatingSystem.isMacOSX() ? ev.shiftKey : ev.shiftKey && !ev.altKey;
                    var duplicationActivated = OperatingSystem.isMacOSX() ? ev.altKey : ev.ctrlKey;
                    var magnetismToggled = OperatingSystem.isWindows() ? ev.altKey : (OperatingSystem.isMacOSX() ? ev.metaKey : ev.shiftKey && ev.altKey);
                    controller.pressMouse(ev.clientX, ev.clientY, 1, ev.shiftKey && !ev.altKey && !ev.ctrlKey && !ev.metaKey, alignmentActivated, duplicationActivated, magnetismToggled);
                }
            },
            mouseReleased: function (ev) {
                if (this.isEnabled() && ev.button === 0) {
                    this.controller.releaseMouse(ev.clientX, ev.clientY);
                }
            },
            mouseMoved: function (ev) {
                if (this.lastMousePressedLocation != null && !(this.lastMousePressedLocation[0] === ev.clientX && this.lastMousePressedLocation[1] === ev.clientY)) {
                    this.lastMousePressedLocation = null;
                }
                if (this.lastMousePressedLocation == null) {
                    if (this.isEnabled()) {
                        this.controller.moveMouse(ev.clientX, ev.clientY);
                    }
                }
            },
            mouseWheelMoved: function (ev) {
                // TODO
                /*  if(ev.getModifiers() === this.__parent.getToolkit().getMenuShortcutKeyMask()) {
                      let mouseX : number = 0;
                      let mouseY : number = 0;
                      let deltaX : number = 0;
                      let deltaY : number = 0;
                      if(this.__parent.getParent() != null && this.__parent.getParent() instanceof <any>javax.swing.JViewport) {
                          mouseX = this.__parent.convertXPixelToModel(ev.getX());
                          mouseY = this.__parent.convertYPixelToModel(ev.getY());
                          let viewRectangle : java.awt.Rectangle = (<javax.swing.JViewport>this.__parent.getParent()).getViewRect();
                          deltaX = ev.getX() - viewRectangle.x;
                          deltaY = ev.getY() - viewRectangle.y;
                      }
                      let oldScale : number = this.__parent.getScale();
                      this.controller.zoom(<number>(ev.getWheelRotation() < 0?Math.pow(1.05, -ev.getWheelRotation()):Math.pow(0.95, ev.getWheelRotation())));
                      if(this.__parent.getScale() !== oldScale && (this.__parent.getParent() != null && this.__parent.getParent() instanceof <any>javax.swing.JViewport)) {
                          (<javax.swing.JViewport>this.__parent.getParent()).setViewPosition(new java.awt.Point());
                          this.__parent.moveView(mouseX - this.__parent.convertXPixelToModel(deltaX), mouseY - this.__parent.convertYPixelToModel(deltaY));
                      }
                  } else if(this.__parent.getMouseWheelListeners().length === 1) {
                      this.__parent.getParent().dispatchEvent(new java.awt.event.MouseWheelEvent(this.__parent.getParent(), ev.getID(), ev.getWhen(), ev.getModifiersEx() | ev.getModifiers(), ev.getX() - this.__parent.getX(), ev.getY() - this.__parent.getY(), ev.getClickCount(), ev.isPopupTrigger(), ev.getScrollType(), ev.getScrollAmount(), ev.getWheelRotation()));
                  }
              */
            }
        };
        this.canvas.addEventListener("mousedown", mouseListener.mousePressed);
        this.canvas.addEventListener("mouseup", mouseListener.mouseReleased);
        this.canvas.addEventListener("mousemove", mouseListener.mouseMoved);
        this.mouseListener = mouseListener;
    };
    /**
     * Adds AWT focus listener to this component that calls back <code>controller</code>
     * escape method on focus lost event.
     * @param {PlanController} controller
     * @private
     */
    PlanComponent.prototype.addFocusListener = function (controller) {
        // TODO?
        //this.addFocusListener(new PlanComponent.PlanComponent$15(this, controller));
        //if(com.eteks.sweethome3d.tools.OperatingSystem.isMacOSXLeopardOrSuperior()) {
        //    this.addPropertyChangeListener("Frame.active", new PlanComponent.PlanComponent$16(this));
        //}
    };
    /**
     * Adds a listener to the controller to follow changes in base plan modification state.
     * @param {PlanController} controller
     * @private
     */
    PlanComponent.prototype.addControllerListener = function (controller) {
        controller.addPropertyChangeListener("BASE_PLAN_MODIFICATION_STATE", new PlanComponent.PlanComponent$17(this, controller));
    };
    /**
     * Installs default keys bound to actions.
     * @private
     */
    PlanComponent.prototype.installDefaultKeyboardActions = function () {
        // TODO
        /*let inputMap : javax.swing.InputMap = this.getInputMap(javax.swing.JComponent.WHEN_FOCUSED);
        inputMap.clear();
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("DELETE"), PlanComponent.ActionType.DELETE_SELECTION);
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("BACK_SPACE"), PlanComponent.ActionType.DELETE_SELECTION);
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("ESCAPE"), PlanComponent.ActionType.ESCAPE);
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift ESCAPE"), PlanComponent.ActionType.ESCAPE);
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("LEFT"), PlanComponent.ActionType.MOVE_SELECTION_LEFT);
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift LEFT"), PlanComponent.ActionType.MOVE_SELECTION_FAST_LEFT);
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("UP"), PlanComponent.ActionType.MOVE_SELECTION_UP);
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift UP"), PlanComponent.ActionType.MOVE_SELECTION_FAST_UP);
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("DOWN"), PlanComponent.ActionType.MOVE_SELECTION_DOWN);
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift DOWN"), PlanComponent.ActionType.MOVE_SELECTION_FAST_DOWN);
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("RIGHT"), PlanComponent.ActionType.MOVE_SELECTION_RIGHT);
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift RIGHT"), PlanComponent.ActionType.MOVE_SELECTION_FAST_RIGHT);
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("ENTER"), PlanComponent.ActionType.ACTIVATE_EDITIION);
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift ENTER"), PlanComponent.ActionType.ACTIVATE_EDITIION);
        if(com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX()) {
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt pressed ALT"), PlanComponent.ActionType.ACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("released ALT"), PlanComponent.ActionType.DEACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift alt pressed ALT"), PlanComponent.ActionType.ACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift released ALT"), PlanComponent.ActionType.DEACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("meta alt pressed ALT"), PlanComponent.ActionType.ACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("meta released ALT"), PlanComponent.ActionType.DEACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift meta alt pressed ALT"), PlanComponent.ActionType.ACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift meta released ALT"), PlanComponent.ActionType.DEACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt ESCAPE"), PlanComponent.ActionType.ESCAPE);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt ENTER"), PlanComponent.ActionType.ACTIVATE_EDITIION);
        } else {
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control pressed CONTROL"), PlanComponent.ActionType.ACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("released CONTROL"), PlanComponent.ActionType.DEACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift control pressed CONTROL"), PlanComponent.ActionType.ACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift released CONTROL"), PlanComponent.ActionType.DEACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("meta control pressed CONTROL"), PlanComponent.ActionType.ACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("meta released CONTROL"), PlanComponent.ActionType.DEACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift meta control pressed CONTROL"), PlanComponent.ActionType.ACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift meta released CONTROL"), PlanComponent.ActionType.DEACTIVATE_DUPLICATION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control ESCAPE"), PlanComponent.ActionType.ESCAPE);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control ENTER"), PlanComponent.ActionType.ACTIVATE_EDITIION);
        }
        if(com.eteks.sweethome3d.tools.OperatingSystem.isWindows()) {
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt pressed ALT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_ON);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("released ALT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_OFF);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift alt pressed ALT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_ON);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift released ALT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_OFF);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control alt pressed ALT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_ON);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control released ALT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_OFF);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift control alt pressed ALT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_ON);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift control released ALT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_OFF);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt ESCAPE"), PlanComponent.ActionType.ESCAPE);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt ENTER"), PlanComponent.ActionType.ACTIVATE_EDITIION);
        } else if(com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX()) {
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("meta pressed META"), PlanComponent.ActionType.TOGGLE_MAGNETISM_ON);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("released META"), PlanComponent.ActionType.TOGGLE_MAGNETISM_OFF);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift meta pressed META"), PlanComponent.ActionType.TOGGLE_MAGNETISM_ON);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift released META"), PlanComponent.ActionType.TOGGLE_MAGNETISM_OFF);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt meta pressed META"), PlanComponent.ActionType.TOGGLE_MAGNETISM_ON);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt released META"), PlanComponent.ActionType.TOGGLE_MAGNETISM_OFF);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift alt meta pressed META"), PlanComponent.ActionType.TOGGLE_MAGNETISM_ON);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift alt released META"), PlanComponent.ActionType.TOGGLE_MAGNETISM_OFF);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("meta ESCAPE"), PlanComponent.ActionType.ESCAPE);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("meta ENTER"), PlanComponent.ActionType.ACTIVATE_EDITIION);
        } else {
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift alt pressed ALT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_ON);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt shift pressed SHIFT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_ON);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt released SHIFT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_OFF);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift released ALT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_OFF);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control shift alt pressed ALT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_ON);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control alt shift pressed SHIFT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_ON);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control alt released SHIFT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_OFF);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control shift released ALT"), PlanComponent.ActionType.TOGGLE_MAGNETISM_OFF);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt shift ESCAPE"), PlanComponent.ActionType.ESCAPE);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt shift  ENTER"), PlanComponent.ActionType.ACTIVATE_EDITIION);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control alt shift ESCAPE"), PlanComponent.ActionType.ESCAPE);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control alt shift  ENTER"), PlanComponent.ActionType.ACTIVATE_EDITIION);
        }
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift pressed SHIFT"), PlanComponent.ActionType.ACTIVATE_ALIGNMENT);
        inputMap.put(javax.swing.KeyStroke.getKeyStroke("released SHIFT"), PlanComponent.ActionType.DEACTIVATE_ALIGNMENT);
        if(com.eteks.sweethome3d.tools.OperatingSystem.isWindows()) {
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control shift pressed SHIFT"), PlanComponent.ActionType.ACTIVATE_ALIGNMENT);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control released SHIFT"), PlanComponent.ActionType.DEACTIVATE_ALIGNMENT);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt shift pressed SHIFT"), PlanComponent.ActionType.ACTIVATE_ALIGNMENT);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt released SHIFT"), PlanComponent.ActionType.DEACTIVATE_ALIGNMENT);
        } else if(com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX()) {
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt shift pressed SHIFT"), PlanComponent.ActionType.ACTIVATE_ALIGNMENT);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt released SHIFT"), PlanComponent.ActionType.DEACTIVATE_ALIGNMENT);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("meta shift pressed SHIFT"), PlanComponent.ActionType.ACTIVATE_ALIGNMENT);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("meta released SHIFT"), PlanComponent.ActionType.DEACTIVATE_ALIGNMENT);
        } else {
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control shift pressed SHIFT"), PlanComponent.ActionType.ACTIVATE_ALIGNMENT);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control released SHIFT"), PlanComponent.ActionType.DEACTIVATE_ALIGNMENT);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift released ALT"), PlanComponent.ActionType.ACTIVATE_ALIGNMENT);
            inputMap.put(javax.swing.KeyStroke.getKeyStroke("control shift released ALT"), PlanComponent.ActionType.ACTIVATE_ALIGNMENT);
        }*/
    };
    /**
     * Installs keys bound to actions during edition.
     * @private
     */
    PlanComponent.prototype.installEditionKeyboardActions = function () {
        // TODO
        /*
          let inputMap : javax.swing.InputMap = this.getInputMap(javax.swing.JComponent.WHEN_FOCUSED);
          inputMap.clear();
          inputMap.put(javax.swing.KeyStroke.getKeyStroke("ESCAPE"), PlanComponent.ActionType.ESCAPE);
          inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift ESCAPE"), PlanComponent.ActionType.ESCAPE);
          inputMap.put(javax.swing.KeyStroke.getKeyStroke("ENTER"), PlanComponent.ActionType.DEACTIVATE_EDITIION);
          inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift ENTER"), PlanComponent.ActionType.DEACTIVATE_EDITIION);
          if(com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX()) {
              inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt ESCAPE"), PlanComponent.ActionType.ESCAPE);
              inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt ENTER"), PlanComponent.ActionType.DEACTIVATE_EDITIION);
              inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt shift ENTER"), PlanComponent.ActionType.DEACTIVATE_EDITIION);
              inputMap.put(javax.swing.KeyStroke.getKeyStroke("alt pressed ALT"), PlanComponent.ActionType.ACTIVATE_DUPLICATION);
              inputMap.put(javax.swing.KeyStroke.getKeyStroke("released ALT"), PlanComponent.ActionType.DEACTIVATE_DUPLICATION);
              inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift alt pressed ALT"), PlanComponent.ActionType.ACTIVATE_DUPLICATION);
              inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift released ALT"), PlanComponent.ActionType.DEACTIVATE_DUPLICATION);
          } else {
              inputMap.put(javax.swing.KeyStroke.getKeyStroke("control ESCAPE"), PlanComponent.ActionType.ESCAPE);
              inputMap.put(javax.swing.KeyStroke.getKeyStroke("control ENTER"), PlanComponent.ActionType.DEACTIVATE_EDITIION);
              inputMap.put(javax.swing.KeyStroke.getKeyStroke("control shift ENTER"), PlanComponent.ActionType.DEACTIVATE_EDITIION);
              inputMap.put(javax.swing.KeyStroke.getKeyStroke("control pressed CONTROL"), PlanComponent.ActionType.ACTIVATE_DUPLICATION);
              inputMap.put(javax.swing.KeyStroke.getKeyStroke("released CONTROL"), PlanComponent.ActionType.DEACTIVATE_DUPLICATION);
              inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift control pressed CONTROL"), PlanComponent.ActionType.ACTIVATE_DUPLICATION);
              inputMap.put(javax.swing.KeyStroke.getKeyStroke("shift released CONTROL"), PlanComponent.ActionType.DEACTIVATE_DUPLICATION);
          }
          */
    };
    /**
     * Creates actions that calls back <code>controller</code> methods.
     * @param {PlanController} controller
     * @private
     */
    PlanComponent.prototype.createActions = function (controller) {
        /*let deleteSelectionAction : javax.swing.Action = new PlanComponent.PlanComponent$18(this, controller);
        let escapeAction : javax.swing.Action = new PlanComponent.PlanComponent$19(this, controller);
        let actionMap : javax.swing.ActionMap = this.getActionMap();
        actionMap.put(PlanComponent.ActionType.DELETE_SELECTION, deleteSelectionAction);
        actionMap.put(PlanComponent.ActionType.ESCAPE, escapeAction);
        actionMap.put(PlanComponent.ActionType.MOVE_SELECTION_LEFT, new PlanComponent.MoveSelectionAction(this, -1, 0));
        actionMap.put(PlanComponent.ActionType.MOVE_SELECTION_FAST_LEFT, new PlanComponent.MoveSelectionAction(this, -10, 0));
        actionMap.put(PlanComponent.ActionType.MOVE_SELECTION_UP, new PlanComponent.MoveSelectionAction(this, 0, -1));
        actionMap.put(PlanComponent.ActionType.MOVE_SELECTION_FAST_UP, new PlanComponent.MoveSelectionAction(this, 0, -10));
        actionMap.put(PlanComponent.ActionType.MOVE_SELECTION_DOWN, new PlanComponent.MoveSelectionAction(this, 0, 1));
        actionMap.put(PlanComponent.ActionType.MOVE_SELECTION_FAST_DOWN, new PlanComponent.MoveSelectionAction(this, 0, 10));
        actionMap.put(PlanComponent.ActionType.MOVE_SELECTION_RIGHT, new PlanComponent.MoveSelectionAction(this, 1, 0));
        actionMap.put(PlanComponent.ActionType.MOVE_SELECTION_FAST_RIGHT, new PlanComponent.MoveSelectionAction(this, 10, 0));
        actionMap.put(PlanComponent.ActionType.TOGGLE_MAGNETISM_ON, new PlanComponent.ToggleMagnetismAction(this, true));
        actionMap.put(PlanComponent.ActionType.TOGGLE_MAGNETISM_OFF, new PlanComponent.ToggleMagnetismAction(this, false));
        actionMap.put(PlanComponent.ActionType.ACTIVATE_ALIGNMENT, new PlanComponent.SetAlignmentActivatedAction(this, true));
        actionMap.put(PlanComponent.ActionType.DEACTIVATE_ALIGNMENT, new PlanComponent.SetAlignmentActivatedAction(this, false));
        actionMap.put(PlanComponent.ActionType.ACTIVATE_DUPLICATION, new PlanComponent.SetDuplicationActivatedAction(this, true));
        actionMap.put(PlanComponent.ActionType.DEACTIVATE_DUPLICATION, new PlanComponent.SetDuplicationActivatedAction(this, false));
        actionMap.put(PlanComponent.ActionType.ACTIVATE_EDITIION, new PlanComponent.SetEditionActivatedAction(this, true));
        actionMap.put(PlanComponent.ActionType.DEACTIVATE_EDITIION, new PlanComponent.SetEditionActivatedAction(this, false));*/
    };
    /**
     * Returns the preferred size of this component.
     * @return {java.awt.Dimension}
     */
    /*public getPreferredSize() : java.awt.Dimension {
        if(this.isPreferredSizeSet()) {
            return super.getPreferredSize();
        } else {
            let insets = this.getInsets();
            let planBounds : java.awt.geom.Rectangle2D = this.getPlanBounds();
            return new java.awt.Dimension(Math.round((<number>planBounds.getWidth() + PlanComponent.MARGIN * 2) * this.getScale()) + insets.left + insets.right, Math.round((<number>planBounds.getHeight() + PlanComponent.MARGIN * 2) * this.getScale()) + insets.top + insets.bottom);
        }
    }*/
    /**
     * Returns the bounds of the plan displayed by this component.
     * @return {java.awt.geom.Rectangle2D}
     * @private
     */
    PlanComponent.prototype.getPlanBounds = function () {
        var _this = this;
        if (!this.planBoundsCacheValid) {
            if (this.planBoundsCache == null) {
                this.planBoundsCache = new java.awt.geom.Rectangle2D.Float(0, 0, 1000, 1000);
            }
            if (this.backgroundImageCache != null) {
                var backgroundImage = this.home.getBackgroundImage();
                if (backgroundImage != null) {
                    this.planBoundsCache.add(-backgroundImage.getXOrigin(), -backgroundImage.getYOrigin());
                    this.planBoundsCache.add(this.backgroundImageCache.width * backgroundImage.getScale() - backgroundImage.getXOrigin(), this.backgroundImageCache.height * backgroundImage.getScale() - backgroundImage.getYOrigin());
                }
                this.home.getLevels().forEach(function (level) {
                    var levelBackgroundImage = level.getBackgroundImage();
                    if (levelBackgroundImage != null) {
                        _this.planBoundsCache.add(-levelBackgroundImage.getXOrigin(), -levelBackgroundImage.getYOrigin());
                        _this.planBoundsCache.add(_this.backgroundImageCache.width * levelBackgroundImage.getScale() - levelBackgroundImage.getXOrigin(), _this.backgroundImageCache.height * levelBackgroundImage.getScale() - levelBackgroundImage.getYOrigin());
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
            this.home.getObserverCamera().getPoints().forEach(function (point) { return _this.planBoundsCache.add(point[0], point[1]); });
            this.planBoundsCacheValid = true;
        }
        return this.planBoundsCache;
    };
    /**
     * Returns the collection of walls, furniture, rooms and dimension lines of the home
     * painted by this component wherever the level they belong to is selected or not.
     * @return {*[]}
     */
    PlanComponent.prototype.getPaintedItems = function () {
        return this.home.getSelectableViewableItems();
    };
    /**
     * Returns the bounds of the given collection of <code>items</code>.
     * @param {Graphics2D} g
     * @param {Bound[]} items
     * @return {java.awt.geom.Rectangle2D}
     * @private
     */
    PlanComponent.prototype.getItemsBounds = function (g, items) {
        var itemsBounds = null;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (itemsBounds == null) {
                itemsBounds = this.getItemBounds(g, item);
            }
            else {
                itemsBounds.add(this.getItemBounds(g, item));
            }
        }
        return itemsBounds;
    };
    /**
     * Returns the bounds of the given <code>item</code>.
     * @param {Graphics2D} g
     * @param {Object} item
     * @return {java.awt.geom.Rectangle2D}
     */
    PlanComponent.prototype.getItemBounds = function (g, item) {
        var points = item.getPoints();
        var itemBounds = new java.awt.geom.Rectangle2D.Float(points[0][0], points[0][1], 0, 0);
        for (var i = 1; i < points.length; i++) {
            {
                itemBounds.add(points[i][0], points[i][1]);
            }
            ;
        }
        var componentFont;
        if (g != null) {
            componentFont = g.getFont();
        }
        else {
            componentFont = this.getFont();
        }
        if (item != null && item instanceof Room) {
            var room = item;
            var xRoomCenter = room.getXCenter();
            var yRoomCenter = room.getYCenter();
            var roomName = room.getName();
            if (roomName != null && roomName.length > 0) {
                this.addTextBounds(room.constructor, roomName, room.getNameStyle(), xRoomCenter + room.getNameXOffset(), yRoomCenter + room.getNameYOffset(), room.getNameAngle(), itemBounds);
            }
            if (room.isAreaVisible()) {
                var area = room.getArea();
                if (area > 0.01) {
                    var areaText = this.preferences.getLengthUnit().getAreaFormatWithUnit().format(area);
                    this.addTextBounds(room.constructor, areaText, room.getAreaStyle(), xRoomCenter + room.getAreaXOffset(), yRoomCenter + room.getAreaYOffset(), room.getAreaAngle(), itemBounds);
                }
            }
        }
        else if (item != null && item instanceof Polyline) {
            var polyline = item;
            return ShapeTools.getPolylineShape(polyline.getPoints(), polyline.getJoinStyle() === Polyline.JoinStyle.CURVED, polyline.isClosedPath()).getBounds2D();
        }
        else if (item != null && item instanceof HomePieceOfFurniture) {
            if (item != null && item instanceof HomeDoorOrWindow) {
                var doorOrWindow = item;
                {
                    var array149 = doorOrWindow.getSashes();
                    for (var index148 = 0; index148 < array149.length; index148++) {
                        var sash = array149[index148];
                        {
                            itemBounds.add(this.getDoorOrWindowSashShape(doorOrWindow, sash).getBounds2D());
                        }
                    }
                }
            }
            else if (item != null && item instanceof HomeFurnitureGroup) {
                itemBounds.add(this.getItemsBounds(g, (item).getFurniture()));
            }
            var piece = item;
            var pieceName = piece.getName();
            if (piece.isVisible() && piece.isNameVisible() && pieceName.length > 0) {
                this.addTextBounds(piece.constructor, pieceName, piece.getNameStyle(), piece.getX() + piece.getNameXOffset(), piece.getY() + piece.getNameYOffset(), piece.getNameAngle(), itemBounds);
            }
        }
        else if (item != null && item instanceof DimensionLine) {
            var dimensionLine = item;
            var dimensionLineLength = dimensionLine.getLength();
            var lengthText = this.preferences.getLengthUnit().getFormat().format(dimensionLineLength);
            var lengthStyle = dimensionLine.getLengthStyle();
            if (lengthStyle == null) {
                lengthStyle = this.preferences.getDefaultTextStyle(dimensionLine.constructor);
            }
            var lengthFontMetrics = this.getFontMetrics(componentFont, lengthStyle);
            var lengthTextBounds = lengthFontMetrics.getStringBounds(lengthText);
            var angle = Math.atan2(dimensionLine.getYEnd() - dimensionLine.getYStart(), dimensionLine.getXEnd() - dimensionLine.getXStart());
            var transform = java.awt.geom.AffineTransform.getTranslateInstance(dimensionLine.getXStart(), dimensionLine.getYStart());
            transform.rotate(angle);
            transform.translate(0, dimensionLine.getOffset());
            transform.translate((dimensionLineLength - lengthTextBounds.getWidth()) / 2, dimensionLine.getOffset() <= 0 ? -lengthFontMetrics.getDescent() - 1 : lengthFontMetrics.getAscent() + 1);
            var lengthTextBoundsPath = new java.awt.geom.GeneralPath(lengthTextBounds);
            for (var it = lengthTextBoundsPath.getPathIterator(transform); !it.isDone(); it.next()) {
                {
                    var pathPoint = [0, 0];
                    if (it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
                        itemBounds.add(pathPoint[0], pathPoint[1]);
                    }
                }
                ;
            }
            transform.setToTranslation(dimensionLine.getXStart(), dimensionLine.getYStart());
            transform.rotate(angle);
            transform.translate(0, dimensionLine.getOffset());
            for (var it = PlanComponent.DIMENSION_LINE_END.getPathIterator(transform); !it.isDone(); it.next()) {
                {
                    var pathPoint = [0, 0];
                    if (it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
                        itemBounds.add(pathPoint[0], pathPoint[1]);
                    }
                }
                ;
            }
            transform.translate(dimensionLineLength, 0);
            for (var it = PlanComponent.DIMENSION_LINE_END.getPathIterator(transform); !it.isDone(); it.next()) {
                {
                    var pathPoint = [0, 0];
                    if (it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
                        itemBounds.add(pathPoint[0], pathPoint[1]);
                    }
                }
                ;
            }
        }
        else if (item != null && item instanceof Label) {
            var label = item;
            this.addTextBounds(label.constructor, label.getText(), label.getStyle(), label.getX(), label.getY(), label.getAngle(), itemBounds);
        }
        else if (item != null && item instanceof Compass) {
            var compass = item;
            var transform = java.awt.geom.AffineTransform.getTranslateInstance(compass.getX(), compass.getY());
            transform.scale(compass.getDiameter(), compass.getDiameter());
            transform.rotate(compass.getNorthDirection());
            return PlanComponent.COMPASS.createTransformedShape(transform).getBounds2D();
        }
        return itemBounds;
    };
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
    PlanComponent.prototype.addTextBounds = function (selectableClass, text, style, x, y, angle, bounds) {
        if (style == null) {
            style = this.preferences.getDefaultTextStyle(selectableClass);
        }
        this.getTextBounds(text, style, x, y, angle).forEach(function (points) { return bounds.add(points[0], points[1]); });
    };
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
    PlanComponent.prototype.getTextBounds = function (text, style, x, y, angle) {
        var fontMetrics = this.getFontMetrics(this.getFont(), style);
        var textBounds = null;
        var lines = text.split("\n");
        var g = this.getGraphics();
        if (g != null) {
            this.setRenderingHints(g);
        }
        for (var i = 0; i < lines.length; i++) {
            {
                var lineBounds = fontMetrics.getStringBounds(lines[i]);
                if (textBounds == null || textBounds.getWidth() < lineBounds.getWidth()) {
                    textBounds = lineBounds;
                }
            }
            ;
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
            return [[x + shiftX, minY], [x + shiftX + textWidth, minY], [x + shiftX + textWidth, maxY], [x + shiftX, maxY]];
        }
        else {
            textBounds.add(textBounds.getX(), textBounds.getY() - textBounds.getHeight() * (lines.length - 1));
            var transform = new java.awt.geom.AffineTransform();
            transform.translate(x, y);
            transform.rotate(angle);
            transform.translate(shiftX, 0);
            var textBoundsPath = new java.awt.geom.GeneralPath(textBounds);
            var textPoints = ([]);
            for (var it = textBoundsPath.getPathIterator(transform); !it.isDone(); it.next()) {
                {
                    var pathPoint = [0, 0];
                    if (it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
                        /* add */ (textPoints.push(pathPoint) > 0);
                    }
                }
                ;
            }
            return textPoints.slice(0);
        }
    };
    /**
     * Returns the AWT font matching a given text style.
     * @param {string} defaultFont
     * @param {TextStyle} textStyle
     * @return {string}
     */
    PlanComponent.prototype.getFont = function (defaultFont, textStyle) {
        if (defaultFont == null && textStyle == null) {
            return this.font;
        }
        if (this.fonts == null) {
            this.fonts = {};
        }
        var font = getFromMap(this.fonts, textStyle);
        if (font == null) {
            var fontStyle = 'normal';
            var fontWeight = 'normal';
            if (textStyle.isBold()) {
                fontWeight = 'bold';
            }
            if (textStyle.isItalic()) {
                fontStyle = 'italic';
            }
            if (defaultFont == null || this.preferences.getDefaultFontName() != null || textStyle.getFontName() != null) {
                var fontName = textStyle.getFontName();
                if (fontName == null) {
                    fontName = this.preferences.getDefaultFontName();
                }
                if (fontName == null) {
                    fontName = new Font(this.font).family;
                }
                defaultFont = new Font({ style: fontStyle, weight: fontWeight, size: "10px", family: fontName }).toString();
            }
            font = new Font({ style: fontStyle, weight: fontWeight, size: textStyle.getFontSize() + "px", family: new Font(defaultFont).family }).toString();
            putToMap(this.fonts, textStyle, font);
        }
        return font;
    };
    /**
     * Returns the font metrics matching a given text style.
     * @param {string} defaultFont
     * @param {TextStyle} textStyle
     * @return {FontMetrics}
     */
    PlanComponent.prototype.getFontMetrics = function (defaultFont, textStyle) {
        if (textStyle == null) {
            return new FontMetrics(defaultFont);
        }
        if (this.fontsMetrics == null) {
            this.fontsMetrics = {};
        }
        var fontMetrics = getFromMap(this.fontsMetrics, textStyle);
        if (fontMetrics == null) {
            fontMetrics = this.getFontMetrics(this.getFont(defaultFont, textStyle));
            putToMap(this.fontsMetrics, textStyle, fontMetrics);
        }
        return fontMetrics;
    };
    /**
     * Sets whether plan's background should be painted or not.
     * Background may include grid and an image.
     * @param {boolean} backgroundPainted
     */
    PlanComponent.prototype.setBackgroundPainted = function (backgroundPainted) {
        if (this.backgroundPainted !== backgroundPainted) {
            this.backgroundPainted = backgroundPainted;
            this.repaint();
        }
    };
    /**
     * Returns <code>true</code> if plan's background should be painted.
     * @return {boolean}
     */
    PlanComponent.prototype.isBackgroundPainted = function () {
        return this.backgroundPainted;
    };
    /**
     * Sets whether the outline of home selected items should be painted or not.
     * @param {boolean} selectedItemsOutlinePainted
     */
    PlanComponent.prototype.setSelectedItemsOutlinePainted = function (selectedItemsOutlinePainted) {
        if (this.selectedItemsOutlinePainted !== selectedItemsOutlinePainted) {
            this.selectedItemsOutlinePainted = selectedItemsOutlinePainted;
            this.repaint();
        }
    };
    /**
     * Returns <code>true</code> if the outline of home selected items should be painted.
     * @return {boolean}
     */
    PlanComponent.prototype.isSelectedItemsOutlinePainted = function () {
        return this.selectedItemsOutlinePainted;
    };
    /**
     * Paints this component.
     * @param {Graphics2D} g
     */
    PlanComponent.prototype.paintComponent = function (g2D) {
        if (this.backgroundPainted) {
            this.paintBackground(g2D, this.getBackgroundColor(PlanComponent.PaintMode.PAINT));
        }
        var insets = this.getInsets();
        g2D.setTransform(new java.awt.geom.AffineTransform());
        g2D.clear();
        //g2D.clipRect(0, 0, this.getWidth(), this.getHeight());
        var planBounds = this.getPlanBounds();
        var paintScale = this.getScale();
        g2D.translate(insets.left + (PlanComponent.MARGIN - planBounds.getMinX()) * paintScale, insets.top + (PlanComponent.MARGIN - planBounds.getMinY()) * paintScale);
        g2D.scale(paintScale, paintScale);
        this.setRenderingHints(g2D);
        try {
            this.paintContent(g2D, paintScale, PlanComponent.PaintMode.PAINT);
        }
        catch (ex) {
            console.error(ex);
        }
        ;
        g2D.dispose();
    };
    /**
     * Returns the print preferred scale of the plan drawn in this component
     * to make it fill <code>pageFormat</code> imageable size.
     * @param {Graphics2D} g
     * @param {java.awt.print.PageFormat} pageFormat
     * @return {number}
     */
    PlanComponent.prototype.getPrintPreferredScale = function (g, pageFormat) {
        return 1;
    };
    /**
     * Returns the stroke width used to paint an item of the given class.
     * @param {Object} itemClass
     * @param {PlanComponent.PaintMode} paintMode
     * @return {number}
     * @private
     */
    PlanComponent.prototype.getStrokeWidth = function (itemClass, paintMode) {
        var strokeWidth;
        if (Wall === itemClass || Room === itemClass) {
            strokeWidth = PlanComponent.WALL_STROKE_WIDTH;
        }
        else {
            strokeWidth = PlanComponent.BORDER_STROKE_WIDTH;
        }
        if (paintMode === PlanComponent.PaintMode.PRINT) {
            strokeWidth *= 0.5;
        }
        else {
            strokeWidth *= this.resolutionScale;
        }
        return strokeWidth;
    };
    /**
     * Returns an image of selected items in plan for transfer purpose.
     * @param {TransferableView.DataType} dataType
     * @return {Object}
     */
    PlanComponent.prototype.createTransferData = function (dataType) {
        if (dataType === TransferableView.DataType.PLAN_IMAGE) {
            return this.getClipboardImage();
        }
        else {
            return null;
        }
    };
    /**
     * Returns an image of the selected items displayed by this component
     * (camera excepted) with no outline at scale 1/1 (1 pixel = 1cm).
     * @return {HTMLImageElement}
     */
    PlanComponent.prototype.getClipboardImage = function () {
        return null;
    };
    /**
     * Returns <code>true</code> if the given format is SVG.
     * @param {ExportableView.FormatType} formatType
     * @return {boolean}
     */
    PlanComponent.prototype.isFormatTypeSupported = function (formatType) {
        return false;
    };
    /**
     * Writes this plan in the given output stream at SVG (Scalable Vector Graphics) format if this is the requested format.
     * @param {java.io.OutputStream} out
     * @param {ExportableView.FormatType} formatType
     * @param {Object} settings
     */
    PlanComponent.prototype.exportData = function (out, formatType, settings) {
        throw new UnsupportedOperationException("Unsupported format " + formatType);
    };
    /**
     * Throws an <code>InterruptedRecorderException</code> exception if current thread
     * is interrupted and <code>paintMode</code> is equal to <code>PaintMode.EXPORT</code>.
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    PlanComponent.prototype.checkCurrentThreadIsntInterrupted = function (paintMode) {
    };
    /**
     * Sets rendering hints used to paint plan.
     * @param {Graphics2D} g2D
     * @private
     */
    PlanComponent.prototype.setRenderingHints = function (g2D) {
        // TODO
    };
    /**
     * Fills the background.
     * @param {Graphics2D} g2D
     * @param {string} backgroundColor
     * @private
     */
    PlanComponent.prototype.paintBackground = function (g2D, backgroundColor) {
        if (this.isOpaque()) {
            g2D.setColor(backgroundColor);
            g2D.fillRect(0, 0, this.getWidth(), this.getHeight());
        }
    };
    /**
     * Paints background image and returns <code>true</code> if an image is painted.
     * @param {Graphics2D} g2D
     * @param {PlanComponent.PaintMode} paintMode
     * @return {boolean}
     * @private
     */
    PlanComponent.prototype.paintBackgroundImage = function (g2D, paintMode) {
        var selectedLevel = this.home.getSelectedLevel();
        var backgroundImageLevel = null;
        if (selectedLevel != null) {
            var levels = this.home.getLevels();
            for (var i = levels.length - 1; i >= 0; i--) {
                {
                    var level = levels[i];
                    if (level.getElevation() === selectedLevel.getElevation() && level.getElevationIndex() <= selectedLevel.getElevationIndex() && level.isViewable() && level.getBackgroundImage() != null && level.getBackgroundImage().isVisible()) {
                        backgroundImageLevel = level;
                        break;
                    }
                }
                ;
            }
        }
        var backgroundImage = backgroundImageLevel == null ? this.home.getBackgroundImage() : backgroundImageLevel.getBackgroundImage();
        if (backgroundImage != null && backgroundImage.isVisible()) {
            var previousTransform = g2D.getTransform();
            g2D.translate(-backgroundImage.getXOrigin(), -backgroundImage.getYOrigin());
            var backgroundImageScale = backgroundImage.getScale();
            g2D.scale(backgroundImageScale, backgroundImageScale);
            var oldAlpha = this.setTransparency(g2D, 0.7);
            g2D.drawImage(this.backgroundImageCache != null ? this.backgroundImageCache : this.readBackgroundImage(backgroundImage.getImage()), 0, 0);
            g2D.setAlpha(oldAlpha);
            g2D.setTransform(previousTransform);
            return true;
        }
        return false;
    };
    /**
     * Returns the foreground color used to draw content.
     * @param {PlanComponent.PaintMode} mode
     * @return {string}
     */
    PlanComponent.prototype.getForegroundColor = function (mode) {
        if (mode === PlanComponent.PaintMode.PAINT) {
            return this.getForeground();
        }
        else {
            return "#000000";
        }
    };
    /**
     * Returns the background color used to draw content.
     * @param {PlanComponent.PaintMode} mode
     * @return {string}
     */
    PlanComponent.prototype.getBackgroundColor = function (mode) {
        if (mode === PlanComponent.PaintMode.PAINT) {
            return this.getBackground();
        }
        else {
            return "#FFFFFF";
        }
    };
    /**
     * Returns the image contained in <code>imageContent</code> or an empty image if reading failed.
     * @param {Content} imageContent
     * @return {HTMLImageElement}
     * @private
     */
    PlanComponent.prototype.readBackgroundImage = function (imageContent) {
        var _this = this;
        if (this.backgroundImageCache != PlanComponent.WAIT_TEXTURE_IMAGE && this.backgroundImageCache != PlanComponent.ERROR_TEXTURE_IMAGE) {
            this.backgroundImageCache = PlanComponent.WAIT_TEXTURE_IMAGE;
            TextureManager.getInstance().loadTexture(imageContent, {
                textureUpdated: function (texture) {
                    _this.backgroundImageCache = texture;
                    _this.repaint();
                },
                textureError: function () {
                    _this.backgroundImageCache = PlanComponent.ERROR_TEXTURE_IMAGE;
                    _this.repaint();
                }
            });
        }
        return this.backgroundImageCache;
    };
    /**
     * Paints walls and rooms of lower levels or upper levels to help the user draw in the selected level.
     * @param {Graphics2D} g2D
     * @param {number} planScale
     * @param {string} backgroundColor
     * @param {string} foregroundColor
     * @private
     */
    PlanComponent.prototype.paintOtherLevels = function (g2D, planScale, backgroundColor, foregroundColor) {
        var _this = this;
        var levels = this.home.getLevels();
        var selectedLevel = this.home.getSelectedLevel();
        if (levels.length && selectedLevel != null) {
            var level0_1 = levels[0].getElevation() === selectedLevel.getElevation();
            var otherLevels_1 = null;
            if (this.otherLevelsRoomsCache == null || this.otherLevelsWallsCache == null) {
                var selectedLevelIndex = levels.indexOf(selectedLevel);
                otherLevels_1 = [];
                if (level0_1) {
                    var nextElevationLevelIndex = selectedLevelIndex;
                    while (++nextElevationLevelIndex < levels.length && levels[nextElevationLevelIndex].getElevation() === selectedLevel.getElevation())
                        ;
                    if (nextElevationLevelIndex < levels.length) {
                        var nextLevel = levels[nextElevationLevelIndex];
                        var nextElevation = nextLevel.getElevation();
                        do {
                            if (nextLevel.isViewable()) {
                                otherLevels_1.push(nextLevel);
                            }
                        } while (++nextElevationLevelIndex < levels.length && (nextLevel = levels[nextElevationLevelIndex]).getElevation() === nextElevation);
                    }
                }
                else {
                    var previousElevationLevelIndex = selectedLevelIndex;
                    while (--previousElevationLevelIndex >= 0 && levels[previousElevationLevelIndex].getElevation() === selectedLevel.getElevation())
                        ;
                    if (previousElevationLevelIndex >= 0) {
                        var previousLevel = levels[previousElevationLevelIndex];
                        var previousElevation = previousLevel.getElevation();
                        do {
                            if (previousLevel.isViewable()) {
                                otherLevels_1.push(previousLevel);
                            }
                        } while (--previousElevationLevelIndex >= 0 && (previousLevel = levels[previousElevationLevelIndex]).getElevation() === previousElevation);
                    }
                }
                if (this.otherLevelsRoomsCache == null) {
                    if (otherLevels_1.length !== 0) {
                        var otherLevelsRooms_1 = [];
                        this.home.getRooms().forEach(function (room) {
                            otherLevels_1.forEach(function (otherLevel) {
                                if (room.getLevel() === otherLevel && (level0_1 && room.isFloorVisible() || !level0_1 && room.isCeilingVisible())) {
                                    otherLevelsRooms_1.push(room);
                                }
                            });
                        });
                        if (otherLevelsRooms_1.length > 0) {
                            this.otherLevelsRoomAreaCache = this.getItemsArea(otherLevelsRooms_1);
                            this.otherLevelsRoomsCache = otherLevelsRooms_1;
                        }
                    }
                    if (this.otherLevelsRoomsCache == null) {
                        this.otherLevelsRoomsCache = [];
                    }
                }
                if (this.otherLevelsWallsCache == null) {
                    if (otherLevels_1.length !== 0) {
                        var otherLevelswalls_1 = [];
                        this.home.getWalls().forEach(function (wall) {
                            if (!_this.isViewableAtSelectedLevel(wall)) {
                                otherLevels_1.forEach(function (otherLevel) {
                                    if (wall.getLevel() === otherLevel) {
                                        otherLevelswalls_1.push(wall);
                                    }
                                });
                            }
                        });
                        if (otherLevelswalls_1.length > 0) {
                            this.otherLevelsWallAreaCache = this.getItemsArea(otherLevelswalls_1);
                            this.otherLevelsWallsCache = otherLevelswalls_1;
                        }
                    }
                }
                if (this.otherLevelsWallsCache == null) {
                    this.otherLevelsWallsCache = [];
                }
            }
            if (this.otherLevelsRoomsCache.length !== 0) {
                var oldComposite = this.setTransparency(g2D, this.preferences.isGridVisible() ? 0.2 : 0.1);
                g2D.setPaint("#808080");
                g2D.fill(this.otherLevelsRoomAreaCache);
                g2D.setAlpha(oldComposite);
            }
            if (this.otherLevelsWallsCache.length !== 0) {
                var oldComposite = this.setTransparency(g2D, this.preferences.isGridVisible() ? 0.2 : 0.1);
                this.fillAndDrawWallsArea(g2D, this.otherLevelsWallAreaCache, planScale, this.getWallPaint(g2D, planScale, backgroundColor, foregroundColor, this.preferences.getNewWallPattern()), foregroundColor, PlanComponent.PaintMode.PAINT);
                g2D.setAlpha(oldComposite);
            }
        }
    };
    /**
     * Sets the transparency composite to the given percentage and returns the old composite.
     * @param {Graphics2D} g2D
     * @param {number} alpha
     * @return {Object}
     * @private
     */
    PlanComponent.prototype.setTransparency = function (g2D, alpha) {
        var oldAlpha = g2D.getAlpha();
        //        if(oldComposite.length === 7) {
        //          oldComposite += "FF";
        //        }
        //        g2D.setColor(oldComposite.slice(0, 7) + ((alpha * 255) | 0).toString(16));
        //        return oldComposite;
        g2D.setAlpha(alpha);
        return oldAlpha;
    };
    /**
     * Paints background grid lines.
     * @param {Graphics2D} g2D
     * @param {number} gridScale
     * @private
     */
    PlanComponent.prototype.paintGrid = function (g2D, gridScale) {
        var gridSize = this.getGridSize(gridScale);
        var mainGridSize = this.getMainGridSize(gridScale);
        var xMin;
        var yMin;
        var xMax;
        var yMax;
        var planBounds = this.getPlanBounds();
        //        if(this.getParent() != null && this.getParent() instanceof <any>javax.swing.JViewport) {
        //            let viewRectangle : java.awt.Rectangle = (<javax.swing.JViewport>this.getParent()).getViewRect();
        //            xMin = this.convertXPixelToModel(viewRectangle.x - 1);
        //            yMin = this.convertYPixelToModel(viewRectangle.y - 1);
        //            xMax = this.convertXPixelToModel(viewRectangle.x + viewRectangle.width);
        //            yMax = this.convertYPixelToModel(viewRectangle.y + viewRectangle.height);
        //        } else {
        xMin = planBounds.getMinX() - PlanComponent.MARGIN;
        yMin = planBounds.getMinY() - PlanComponent.MARGIN;
        xMax = this.convertXPixelToModel(this.getWidth());
        yMax = this.convertYPixelToModel(this.getHeight());
        //        }
        //        let useGridImage : boolean = false;
        //        try {
        //            useGridImage = com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() && /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(java.lang.System.getProperty("apple.awt.graphics.UseQuartz", "false"),"false"));
        //        } catch(ex) {
        //        };
        //        if(useGridImage) {
        //            let imageWidth : number = Math.round(mainGridSize * gridScale);
        //            let gridImage : java.awt.image.BufferedImage = new java.awt.image.BufferedImage(imageWidth, imageWidth, java.awt.image.BufferedImage.TYPE_INT_ARGB);
        //            let imageGraphics : Graphics2D = <Graphics2D>gridImage.getGraphics();
        //            this.setRenderingHints(imageGraphics);
        //            imageGraphics.scale(gridScale, gridScale);
        //            this.paintGridLines(imageGraphics, gridScale, 0, mainGridSize, 0, mainGridSize, gridSize, mainGridSize);
        //            imageGraphics.dispose();
        //            g2D.setPaint(new java.awt.TexturePaint(gridImage, new java.awt.geom.Rectangle2D.Float(0, 0, mainGridSize, mainGridSize)));
        //            g2D.fill(new java.awt.geom.Rectangle2D.Float(xMin, yMin, xMax - xMin, yMax - yMin));
        //        } else {
        this.paintGridLines(g2D, gridScale, xMin, xMax, yMin, yMax, gridSize, mainGridSize);
        //        }
    };
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
    PlanComponent.prototype.paintGridLines = function (g2D, gridScale, xMin, xMax, yMin, yMax, gridSize, mainGridSize) {
        g2D.setColor("#808080");
        g2D.setStroke(new java.awt.BasicStroke(0.5 / gridScale));
        for (var x = ((xMin / gridSize) | 0) * gridSize; x < xMax; x += gridSize) {
            {
                g2D.draw(new java.awt.geom.Line2D.Double(x, yMin, x, yMax));
            }
            ;
        }
        for (var y = ((yMin / gridSize) | 0) * gridSize; y < yMax; y += gridSize) {
            {
                g2D.draw(new java.awt.geom.Line2D.Double(xMin, y, xMax, y));
            }
            ;
        }
        if (mainGridSize !== gridSize) {
            g2D.setStroke(new java.awt.BasicStroke(1.5 / gridScale, java.awt.BasicStroke.CAP_BUTT, java.awt.BasicStroke.JOIN_BEVEL));
            for (var x = ((xMin / mainGridSize) | 0) * mainGridSize; x < xMax; x += mainGridSize) {
                {
                    g2D.draw(new java.awt.geom.Line2D.Double(x, yMin, x, yMax));
                }
                ;
            }
            for (var y = ((yMin / mainGridSize) | 0) * mainGridSize; y < yMax; y += mainGridSize) {
                {
                    g2D.draw(new java.awt.geom.Line2D.Double(xMin, y, xMax, y));
                }
                ;
            }
        }
    };
    /**
     * Returns the space between main lines grid.
     * @param {number} gridScale
     * @return {number}
     * @private
     */
    PlanComponent.prototype.getMainGridSize = function (gridScale) {
        var mainGridSizes;
        var lengthUnit = this.preferences.getLengthUnit();
        if (lengthUnit === LengthUnit.INCH || lengthUnit === LengthUnit.INCH_DECIMALS) {
            var oneFoot = 2.54 * 12;
            mainGridSizes = [oneFoot, 3 * oneFoot, 6 * oneFoot, 12 * oneFoot, 24 * oneFoot, 48 * oneFoot, 96 * oneFoot, 192 * oneFoot, 384 * oneFoot];
        }
        else {
            mainGridSizes = [100, 200, 500, 1000, 2000, 5000, 10000];
        }
        var mainGridSize = mainGridSizes[0];
        for (var i = 1; i < mainGridSizes.length && mainGridSize * gridScale < 50; i++) {
            {
                mainGridSize = mainGridSizes[i];
            }
            ;
        }
        return mainGridSize;
    };
    /**
     * Returns the space between lines grid.
     * @param {number} gridScale
     * @return {number}
     * @private
     */
    PlanComponent.prototype.getGridSize = function (gridScale) {
        var gridSizes;
        var lengthUnit = this.preferences.getLengthUnit();
        if (lengthUnit === LengthUnit.INCH || lengthUnit === LengthUnit.INCH_DECIMALS) {
            var oneFoot = 2.54 * 12;
            gridSizes = [2.54, 5.08, 7.62, 15.24, oneFoot, 3 * oneFoot, 6 * oneFoot, 12 * oneFoot, 24 * oneFoot, 48 * oneFoot, 96 * oneFoot, 192 * oneFoot, 384 * oneFoot];
        }
        else {
            gridSizes = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
        }
        var gridSize = gridSizes[0];
        for (var i = 1; i < gridSizes.length && gridSize * gridScale < 10; i++) {
            {
                gridSize = gridSizes[i];
            }
            ;
        }
        return gridSize;
    };
    /**
     * Paints plan items.
     * @throws InterruptedIOException if painting was interrupted (may happen only
     * if <code>paintMode</code> is equal to <code>PaintMode.EXPORT</code>).
     * @param {Graphics2D} g2D
     * @param {number} planScale
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    PlanComponent.prototype.paintContent = function (g2D, planScale, paintMode) {
        var backgroundColor = this.getBackgroundColor(paintMode);
        var foregroundColor = this.getForegroundColor(paintMode);
        if (this.backgroundPainted) {
            this.paintBackgroundImage(g2D, paintMode);
            if (paintMode === PlanComponent.PaintMode.PAINT) {
                this.paintOtherLevels(g2D, planScale, backgroundColor, foregroundColor);
                if (this.preferences.isGridVisible()) {
                    this.paintGrid(g2D, planScale);
                }
            }
        }
        this.paintHomeItems(g2D, planScale, backgroundColor, foregroundColor, paintMode);
        if (paintMode === PlanComponent.PaintMode.PAINT) {
            var selectedItems = this.home.getSelectedItems();
            var selectionColor = this.getSelectionColor();
            var furnitureOutlineColor = this.getFurnitureOutlineColor();
            var selectionOutlinePaint = selectionColor + "80"; // add alpha
            var selectionOutlineStroke = new java.awt.BasicStroke(6 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_ROUND, java.awt.BasicStroke.JOIN_ROUND);
            var dimensionLinesSelectionOutlineStroke = new java.awt.BasicStroke(4 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_ROUND, java.awt.BasicStroke.JOIN_ROUND);
            var locationFeedbackStroke = new java.awt.BasicStroke(1 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_SQUARE, java.awt.BasicStroke.JOIN_BEVEL, 0, [20 / planScale, 5 / planScale, 5 / planScale, 5 / planScale], 4 / planScale);
            this.paintCamera(g2D, selectedItems, selectionOutlinePaint, selectionOutlineStroke, selectionColor, planScale, backgroundColor, foregroundColor);
            if (this.alignedObjectClass != null) {
                if (Wall === this.alignedObjectClass) {
                    this.paintWallAlignmentFeedback(g2D, this.alignedObjectFeedback, this.locationFeeback, this.showPointFeedback, selectionColor, locationFeedbackStroke, planScale, selectionOutlinePaint, selectionOutlineStroke);
                }
                else if (Room === this.alignedObjectClass) {
                    this.paintRoomAlignmentFeedback(g2D, this.alignedObjectFeedback, this.locationFeeback, this.showPointFeedback, selectionColor, locationFeedbackStroke, planScale, selectionOutlinePaint, selectionOutlineStroke);
                }
                else if (Polyline === this.alignedObjectClass) {
                    if (this.showPointFeedback) {
                        this.paintPointFeedback(g2D, this.locationFeeback, selectionColor, planScale, selectionOutlinePaint, selectionOutlineStroke);
                    }
                }
                else if (DimensionLine === this.alignedObjectClass) {
                    this.paintDimensionLineAlignmentFeedback(g2D, this.alignedObjectFeedback, this.locationFeeback, this.showPointFeedback, selectionColor, locationFeedbackStroke, planScale, selectionOutlinePaint, selectionOutlineStroke);
                }
            }
            if (this.centerAngleFeedback != null) {
                this.paintAngleFeedback(g2D, this.centerAngleFeedback, this.point1AngleFeedback, this.point2AngleFeedback, planScale, selectionColor);
            }
            if (this.dimensionLinesFeedback != null) {
                var emptySelection = [];
                this.paintDimensionLines(g2D, this.dimensionLinesFeedback, emptySelection, null, null, null, locationFeedbackStroke, planScale, backgroundColor, selectionColor, paintMode, true);
            }
            if (this.draggedItemsFeedback != null) {
                this.paintDimensionLines(g2D, Home.getDimensionLinesSubList(this.draggedItemsFeedback), this.draggedItemsFeedback, selectionOutlinePaint, dimensionLinesSelectionOutlineStroke, null, locationFeedbackStroke, planScale, backgroundColor, foregroundColor, paintMode, false);
                this.paintLabels(g2D, Home.getLabelsSubList(this.draggedItemsFeedback), this.draggedItemsFeedback, selectionOutlinePaint, dimensionLinesSelectionOutlineStroke, null, planScale, foregroundColor, paintMode);
                this.paintRoomsOutline(g2D, this.draggedItemsFeedback, selectionOutlinePaint, selectionOutlineStroke, null, planScale, foregroundColor);
                this.paintWallsOutline(g2D, this.draggedItemsFeedback, selectionOutlinePaint, selectionOutlineStroke, null, planScale, foregroundColor);
                this.paintFurniture(g2D, Home.getFurnitureSubList(this.draggedItemsFeedback), selectedItems, planScale, null, foregroundColor, furnitureOutlineColor, paintMode, false);
                this.paintFurnitureOutline(g2D, this.draggedItemsFeedback, selectionOutlinePaint, selectionOutlineStroke, null, planScale, foregroundColor);
            }
            this.paintRectangleFeedback(g2D, selectionColor, planScale);
        }
    };
    /**
     * Paints home items at the given scale, and with background and foreground colors.
     * Outline around selected items will be painted only under <code>PAINT</code> mode.
     * @param {Graphics2D} g
     * @param {number} planScale
     * @param {string} backgroundColor
     * @param {string} foregroundColor
     * @param {PlanComponent.PaintMode} paintMode
     */
    PlanComponent.prototype.paintHomeItems = function (g2D, planScale, backgroundColor, foregroundColor, paintMode) {
        var _this = this;
        var selectedItems = this.home.getSelectedItems();
        if (this.sortedLevelFurniture == null) {
            this.sortedLevelFurniture = [];
            this.home.getFurniture().forEach(function (piece) {
                if (_this.isViewableAtSelectedLevel(piece)) {
                    _this.sortedLevelFurniture.push(piece);
                }
            });
            sortArray(this.sortedLevelFurniture, {
                compare: function (piece1, piece2) {
                    return (piece1.getGroundElevation() - piece2.getGroundElevation());
                }
            });
        }
        var selectionColor = this.getSelectionColor();
        var selectionOutlinePaint = selectionColor + "80"; // add alpha
        var selectionOutlineStroke = new java.awt.BasicStroke(6 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_ROUND, java.awt.BasicStroke.JOIN_ROUND);
        var dimensionLinesSelectionOutlineStroke = new java.awt.BasicStroke(4 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_ROUND, java.awt.BasicStroke.JOIN_ROUND);
        var locationFeedbackStroke = new java.awt.BasicStroke(1 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_SQUARE, java.awt.BasicStroke.JOIN_BEVEL, 0, [20 / planScale, 5 / planScale, 5 / planScale, 5 / planScale], 4 / planScale);
        //console.log("painting home elements");
        this.paintCompass(g2D, selectedItems, planScale, foregroundColor, paintMode);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        this.paintRooms(g2D, selectedItems, planScale, foregroundColor, paintMode);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        this.paintWalls(g2D, selectedItems, planScale, backgroundColor, foregroundColor, paintMode);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        this.paintFurniture(g2D, this.sortedLevelFurniture, selectedItems, planScale, backgroundColor, foregroundColor, this.getFurnitureOutlineColor(), paintMode, true);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        this.paintPolylines(g2D, this.home.getPolylines(), selectedItems, selectionOutlinePaint, selectionColor, planScale, foregroundColor, paintMode);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        this.paintDimensionLines(g2D, this.home.getDimensionLines(), selectedItems, selectionOutlinePaint, dimensionLinesSelectionOutlineStroke, selectionColor, locationFeedbackStroke, planScale, backgroundColor, foregroundColor, paintMode, false);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        this.paintRoomsNameAndArea(g2D, selectedItems, planScale, foregroundColor, paintMode);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        this.paintFurnitureName(g2D, this.sortedLevelFurniture, selectedItems, planScale, foregroundColor, paintMode);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        this.paintLabels(g2D, this.home.getLabels(), selectedItems, selectionOutlinePaint, dimensionLinesSelectionOutlineStroke, selectionColor, planScale, foregroundColor, paintMode);
        if (paintMode === PlanComponent.PaintMode.PAINT && this.selectedItemsOutlinePainted) {
            this.paintCompassOutline(g2D, selectedItems, selectionOutlinePaint, selectionOutlineStroke, selectionColor, planScale, foregroundColor);
            this.paintRoomsOutline(g2D, selectedItems, selectionOutlinePaint, selectionOutlineStroke, selectionColor, planScale, foregroundColor);
            this.paintWallsOutline(g2D, selectedItems, selectionOutlinePaint, selectionOutlineStroke, selectionColor, planScale, foregroundColor);
            this.paintFurnitureOutline(g2D, selectedItems, selectionOutlinePaint, selectionOutlineStroke, selectionColor, planScale, foregroundColor);
        }
    };
    /**
     * Returns the color used to draw selection outlines.
     * @return {string}
     */
    PlanComponent.prototype.getSelectionColor = function () {
        return PlanComponent.getDefaultSelectionColor(this);
    };
    /**
     * Returns the default color used to draw selection outlines.
     * @param {javax.swing.JComponent} planComponent
     * @return {string}
     */
    PlanComponent.getDefaultSelectionColor = function (planComponent) {
        return "#000080";
    };
    /**
     * Returns the color used to draw furniture outline of
     * the shape where a user can click to select a piece of furniture.
     * @return {string}
     */
    PlanComponent.prototype.getFurnitureOutlineColor = function () {
        //return <string>new String((this.getForeground().getRGB() & 16777215) | 1426063360, true);
        return "#808080";
    };
    /**
     * Paints rooms.
     * @param {Graphics2D} g2D
     * @param {*[]} selectedItems
     * @param {number} planScale
     * @param {string} foregroundColor
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    PlanComponent.prototype.paintRooms = function (g2D, selectedItems, planScale, foregroundColor, paintMode) {
        var _this = this;
        if (this.sortedLevelRooms == null) {
            this.sortedLevelRooms = [];
            this.home.getRooms().forEach(function (room) {
                if (_this.isViewableAtSelectedLevel(room)) {
                    _this.sortedLevelRooms.push(room);
                }
            });
            sortArray(this.sortedLevelRooms, {
                compare: function (room1, room2) {
                    if (room1.isFloorVisible() === room2.isFloorVisible() && room1.isCeilingVisible() === room2.isCeilingVisible()) {
                        return 0;
                    }
                    else if (!room2.isFloorVisible() || room2.isCeilingVisible()) {
                        return 1;
                    }
                    else {
                        return -1;
                    }
                }
            });
        }
        var defaultFillPaint = paintMode === PlanComponent.PaintMode.PRINT ? "#000000" : "#808080";
        g2D.setStroke(new java.awt.BasicStroke(this.getStrokeWidth(Room, paintMode) / planScale));
        var _loop_1 = function(i) {
            var room = this_1.sortedLevelRooms[i];
            var selectedRoom = selectedItems.indexOf(room) >= 0;
            if (paintMode !== PlanComponent.PaintMode.CLIPBOARD || selectedRoom) {
                g2D.setPaint(defaultFillPaint);
                var textureAngle = 0;
                var textureScaleX = 1;
                var textureScaleY = 1;
                var textureOffsetX = 0;
                var textureOffsetY = 0;
                var floorTexture_1 = null;
                if (this_1.preferences.isRoomFloorColoredOrTextured() && room.isFloorVisible()) {
                    if (room.getFloorColor() != null) {
                        g2D.setPaint(intToColorString(room.getFloorColor()));
                    }
                    else {
                        floorTexture_1 = room.getFloorTexture();
                        if (floorTexture_1 != null) {
                            if (this_1.floorTextureImagesCache == null) {
                                this_1.floorTextureImagesCache = {};
                            }
                            var textureImage = this_1.floorTextureImagesCache[floorTexture_1.getImage().getURL()];
                            if (textureImage == null) {
                                console.error(" -> loading texture : " + floorTexture_1.getImage().getURL());
                                textureImage = PlanComponent.WAIT_TEXTURE_IMAGE;
                                //                                    console.info("====> "+textureImage);
                                this_1.floorTextureImagesCache[floorTexture_1.getImage().getURL()] = textureImage;
                                var waitForTexture_1 = paintMode !== PlanComponent.PaintMode.PAINT;
                                TextureManager.getInstance().loadTexture(floorTexture_1.getImage(), waitForTexture_1, {
                                    textureUpdated: function (texture) {
                                        _this.floorTextureImagesCache[floorTexture_1.getImage().getURL()] = texture;
                                        console.error(" -> recieved texture : " + floorTexture_1.getImage().getURL());
                                        if (!waitForTexture_1) {
                                            _this.repaint();
                                        }
                                    },
                                    textureError: function () {
                                        _this.floorTextureImagesCache[floorTexture_1.getImage().getURL()] = PlanComponent.ERROR_TEXTURE_IMAGE;
                                    },
                                    progression: function () { }
                                });
                            }
                            var textureWidth = floorTexture_1.getWidth();
                            var textureHeight = floorTexture_1.getHeight();
                            if (textureWidth === -1 || textureHeight === -1) {
                                textureWidth = 100;
                                textureHeight = 100;
                            }
                            var textureScale = floorTexture_1.getScale();
                            textureScaleX = (textureWidth * textureScale) / textureImage.width;
                            textureScaleY = (textureHeight * textureScale) / textureImage.height;
                            textureAngle = floorTexture_1.getAngle();
                            var cosAngle = Math.cos(textureAngle);
                            var sinAngle = Math.sin(textureAngle);
                            textureOffsetX = (floorTexture_1.getXOffset() * textureImage.width * cosAngle - floorTexture_1.getYOffset() * textureImage.height * sinAngle);
                            textureOffsetY = (-floorTexture_1.getXOffset() * textureImage.width * sinAngle - floorTexture_1.getYOffset() * textureImage.height * cosAngle);
                            //g2D.setPaint(new java.awt.TexturePaint(textureImage, new java.awt.geom.Rectangle2D.Double(floorTexture.getXOffset() * textureWidth * textureScale * cosAngle - floorTexture.getYOffset() * textureHeight * textureScale * sinAngle, -floorTexture.getXOffset() * textureWidth * textureScale * sinAngle - floorTexture.getYOffset() * textureHeight * textureScale * cosAngle, textureWidth * textureScale, textureHeight * textureScale)));
                            //g2D.rotate(textureAngle);
                            g2D.setPaint(g2D.createPattern(textureImage));
                        }
                    }
                }
                var oldComposite = this_1.setTransparency(g2D, 0.75);
                var transform = null;
                if (floorTexture_1 != null) {
                    g2D.scale(textureScaleX, textureScaleY);
                    g2D.rotate(textureAngle, 0, 0);
                    g2D.translate(textureOffsetX, textureOffsetY);
                    transform = java.awt.geom.AffineTransform.getTranslateInstance(-textureOffsetX, -textureOffsetY);
                    transform.rotate(-textureAngle, 0, 0);
                    transform.scale(1 / textureScaleX, 1 / textureScaleY);
                }
                var roomShape = ShapeTools.getShape(room.getPoints(), true, transform);
                this_1.fillShape(g2D, roomShape, paintMode);
                if (floorTexture_1 != null) {
                    g2D.translate(-textureOffsetX, -textureOffsetY);
                    g2D.rotate(-textureAngle, 0, 0);
                    g2D.scale(1 / textureScaleX, 1 / textureScaleY);
                    roomShape = ShapeTools.getShape(room.getPoints(), true);
                }
                g2D.setAlpha(oldComposite);
                g2D.setPaint(foregroundColor);
                g2D.draw(roomShape);
            }
        };
        var this_1 = this;
        for (var i = 0; i < this.sortedLevelRooms.length; i++) {
            _loop_1(i);
        }
    };
    /**
     * Fills the given <code>shape</code>.
     * @param {Graphics2D} g2D
     * @param {Object} shape
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    PlanComponent.prototype.fillShape = function (g2D, shape, paintMode) {
        if (paintMode === PlanComponent.PaintMode.PRINT && (g2D.getPaint() != null && g2D.getPaint() instanceof java.awt.TexturePaint) && com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() && com.eteks.sweethome3d.tools.OperatingSystem.isJavaVersionBetween("1.7", "1.8.0_152")) {
            var clip = g2D.getClip();
            g2D.setClip(shape);
            var paint = g2D.getPaint();
            var image = paint.getImage();
            var anchorRect = paint.getAnchorRect();
            var shapeBounds = shape.getBounds2D();
            var firstX = anchorRect.getX() + Math.round(shapeBounds.getX() / anchorRect.getWidth()) * anchorRect.getWidth();
            if (firstX > shapeBounds.getX()) {
                firstX -= anchorRect.getWidth();
            }
            var firstY = anchorRect.getY() + Math.round(shapeBounds.getY() / anchorRect.getHeight()) * anchorRect.getHeight();
            if (firstY > shapeBounds.getY()) {
                firstY -= anchorRect.getHeight();
            }
            for (var x = firstX; x < shapeBounds.getMaxX(); x += anchorRect.getWidth()) {
                {
                    for (var y = firstY; y < shapeBounds.getMaxY(); y += anchorRect.getHeight()) {
                        {
                            var transform = java.awt.geom.AffineTransform.getTranslateInstance(x, y);
                            transform.concatenate(java.awt.geom.AffineTransform.getScaleInstance(anchorRect.getWidth() / image.getWidth(), anchorRect.getHeight() / image.getHeight()));
                            g2D.drawRenderedImage(image, transform);
                        }
                        ;
                    }
                }
                ;
            }
            g2D.setClip(clip);
        }
        else {
            g2D.fill(shape);
        }
    };
    /**
     * Returns <code>true</code> if <code>TextureManager</code> can be used to manage textures.
     * @return {boolean}
     * @private
     */
    PlanComponent.isTextureManagerAvailable = function () {
        //try {
        //   return !javaemul.internal.BooleanHelper.getBoolean("com.eteks.sweethome3d.no3D") && !(com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() && com.eteks.sweethome3d.tools.OperatingSystem.isJavaVersionGreaterOrEqual("1.7"));
        //} catch(ex) {
        //};
        return true;
    };
    /**
     * Paints rooms name and area.
     * @param {Graphics2D} g2D
     * @param {*[]} selectedItems
     * @param {number} planScale
     * @param {string} foregroundColor
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    PlanComponent.prototype.paintRoomsNameAndArea = function (g2D, selectedItems, planScale, foregroundColor, paintMode) {
        var _this = this;
        g2D.setPaint(foregroundColor);
        var previousFont = g2D.getFont();
        this.sortedLevelRooms.forEach(function (room) {
            var selectedRoom = (selectedItems.indexOf((room)) >= 0);
            if (paintMode !== PlanComponent.PaintMode.CLIPBOARD || selectedRoom) {
                var xRoomCenter = room.getXCenter();
                var yRoomCenter = room.getYCenter();
                var name_1 = room.getName();
                if (name_1 != null) {
                    name_1 = name_1.trim();
                    if (name_1.length > 0) {
                        _this.paintText(g2D, room.constructor, name_1, room.getNameStyle(), null, xRoomCenter + room.getNameXOffset(), yRoomCenter + room.getNameYOffset(), room.getNameAngle(), previousFont);
                    }
                }
                if (room.isAreaVisible()) {
                    var area = room.getArea();
                    if (area > 0.01) {
                        var areaText = _this.preferences.getLengthUnit().getAreaFormatWithUnit().format(area);
                        _this.paintText(g2D, room.constructor, areaText, room.getAreaStyle(), null, xRoomCenter + room.getAreaXOffset(), yRoomCenter + room.getAreaYOffset(), room.getAreaAngle(), previousFont);
                    }
                }
            }
        });
        g2D.setFont(previousFont);
    };
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
    PlanComponent.prototype.paintText = function (g2D, selectableClass, text, style, outlineColor, x, y, angle, defaultFont) {
        var previousTransform = g2D.getTransform();
        g2D.translate(x, y);
        g2D.rotate(angle);
        if (style == null) {
            style = this.preferences.getDefaultTextStyle(selectableClass);
        }
        var fontMetrics = this.getFontMetrics(defaultFont, style);
        var lines = text.split("\n");
        var lineWidths = (function (s) { var a = []; while (s-- > 0)
            a.push(0); return a; })(lines.length);
        var textWidth = -3.4028235E38;
        for (var i = 0; i < lines.length; i++) {
            {
                lineWidths[i] = fontMetrics.getStringBounds(lines[i]).getWidth();
                textWidth = Math.max(lineWidths[i], textWidth);
            }
            ;
        }
        var stroke = null;
        var font;
        if (outlineColor != null) {
            stroke = new java.awt.BasicStroke(style.getFontSize() * 0.05);
            var outlineStyle = style.deriveStyle(style.getFontSize() - stroke.getLineWidth());
            font = this.getFont(defaultFont, outlineStyle);
            g2D.setStroke(stroke);
        }
        else {
            font = this.getFont(defaultFont, style);
        }
        g2D.setFont(font);
        for (var i = lines.length - 1; i >= 0; i--) {
            {
                var line = lines[i];
                var translationX = void 0;
                if (style.getAlignment() === TextStyle.Alignment.LEFT) {
                    translationX = 0;
                }
                else if (style.getAlignment() === TextStyle.Alignment.RIGHT) {
                    translationX = -lineWidths[i];
                }
                else {
                    translationX = -lineWidths[i] / 2;
                }
                if (outlineColor != null) {
                    translationX += stroke.getLineWidth() / 2;
                }
                g2D.translate(translationX, 0);
                if (outlineColor != null) {
                    var defaultColor = g2D.getColor();
                    g2D.setColor(intToColorString(outlineColor));
                    g2D.drawStringOutline(line, 0, 0);
                    g2D.setColor(defaultColor);
                }
                g2D.drawString(line, 0, 0);
                g2D.translate(-translationX, -fontMetrics.getHeight());
            }
            ;
        }
        g2D.setTransform(previousTransform);
    };
    /**
     * Paints the outline of rooms among <code>items</code> and indicators if
     * <code>items</code> contains only one room and indicator paint isn't <code>null</code>.
     * @param {Graphics2D} g2D
     * @param {*[]} items
     * @param {string|CanvasPattern} selectionOutlinePaint
     * @param {java.awt.BasicStroke} selectionOutlineStroke
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @param {string} foregroundColor
     * @private
     */
    PlanComponent.prototype.paintRoomsOutline = function (g2D, items, selectionOutlinePaint, selectionOutlineStroke, indicatorPaint, planScale, foregroundColor) {
        var rooms = Home.getRoomsSubList(items);
        var previousTransform = g2D.getTransform();
        var scaleInverse = 1 / planScale;
        for (var index165 = 0; index165 < rooms.length; index165++) {
            var room = rooms[index165];
            {
                if (this.isViewableAtSelectedLevel(room)) {
                    g2D.setPaint(selectionOutlinePaint);
                    g2D.setStroke(selectionOutlineStroke);
                    g2D.draw(ShapeTools.getShape(room.getPoints(), true, null));
                    if (indicatorPaint != null) {
                        g2D.setPaint(indicatorPaint);
                        {
                            var array167 = room.getPoints();
                            for (var index166 = 0; index166 < array167.length; index166++) {
                                var point = array167[index166];
                                {
                                    g2D.translate(point[0], point[1]);
                                    g2D.scale(scaleInverse, scaleInverse);
                                    g2D.setStroke(PlanComponent.POINT_STROKE);
                                    g2D.fill(PlanComponent.WALL_POINT);
                                    g2D.setTransform(previousTransform);
                                }
                            }
                        }
                    }
                }
            }
        }
        g2D.setPaint(foregroundColor);
        g2D.setStroke(new java.awt.BasicStroke(this.getStrokeWidth(Room, PlanComponent.PaintMode.PAINT) / planScale));
        for (var index168 = 0; index168 < rooms.length; index168++) {
            var room = rooms[index168];
            {
                if (this.isViewableAtSelectedLevel(room)) {
                    g2D.draw(ShapeTools.getShape(room.getPoints(), true, null));
                }
            }
        }
        if (items.length === 1 && rooms.length === 1 && indicatorPaint != null) {
            var selectedRoom = (function (a) { var i = 0; return { next: function () { return i < a.length ? a[i++] : null; }, hasNext: function () { return i < a.length; } }; })(rooms).next();
            if (this.isViewableAtSelectedLevel(selectedRoom)) {
                g2D.setPaint(indicatorPaint);
                this.paintPointsResizeIndicators(g2D, selectedRoom, indicatorPaint, planScale, true, 0, 0, true);
                this.paintRoomNameOffsetIndicator(g2D, selectedRoom, indicatorPaint, planScale);
                this.paintRoomAreaOffsetIndicator(g2D, selectedRoom, indicatorPaint, planScale);
            }
        }
    };
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
    PlanComponent.prototype.paintPointsResizeIndicators = function (g2D, item, indicatorPaint, planScale, closedPath, angleAtStart, angleAtEnd, orientateIndicatorOutsideShape) {
        if (this.resizeIndicatorVisible) {
            g2D.setPaint(indicatorPaint);
            g2D.setStroke(PlanComponent.INDICATOR_STROKE);
            var previousTransform = g2D.getTransform();
            var scaleInverse = 1 / planScale * this.resolutionScale;
            var points = item.getPoints();
            var resizeIndicator = this.getIndicator(item, PlanComponent.IndicatorType.RESIZE);
            for (var i = 0; i < points.length; i++) {
                {
                    var point = points[i];
                    g2D.translate(point[0], point[1]);
                    g2D.scale(scaleInverse, scaleInverse);
                    var previousPoint = i === 0 ? points[points.length - 1] : points[i - 1];
                    var nextPoint = i === points.length - 1 ? points[0] : points[i + 1];
                    var angle = void 0;
                    if (closedPath || (i > 0 && i < points.length - 1)) {
                        var distance1 = java.awt.geom.Point2D.distance(previousPoint[0], previousPoint[1], point[0], point[1]);
                        var xNormal1 = (point[1] - previousPoint[1]) / distance1;
                        var yNormal1 = (previousPoint[0] - point[0]) / distance1;
                        var distance2 = java.awt.geom.Point2D.distance(nextPoint[0], nextPoint[1], point[0], point[1]);
                        var xNormal2 = (nextPoint[1] - point[1]) / distance2;
                        var yNormal2 = (point[0] - nextPoint[0]) / distance2;
                        angle = Math.atan2(yNormal1 + yNormal2, xNormal1 + xNormal2);
                        if (orientateIndicatorOutsideShape && item.containsPoint(point[0] + Math.cos(angle), point[1] + Math.sin(angle), 0.001) || !orientateIndicatorOutsideShape && (xNormal1 * yNormal2 - yNormal1 * xNormal2) < 0) {
                            angle += Math.PI;
                        }
                    }
                    else if (i === 0) {
                        angle = angleAtStart;
                    }
                    else {
                        angle = angleAtEnd;
                    }
                    g2D.rotate(angle);
                    g2D.draw(resizeIndicator);
                    g2D.setTransform(previousTransform);
                }
                ;
            }
        }
    };
    /**
     * Returns the shape of the given indicator type.
     * @param {Object} item
     * @param {PlanComponent.IndicatorType} indicatorType
     * @return {Object}
     */
    PlanComponent.prototype.getIndicator = function (item, indicatorType) {
        if ((function (o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
        }
        else {
            return o1 === o2;
        } })(PlanComponent.IndicatorType.RESIZE, indicatorType)) {
            if (item != null && item instanceof HomePieceOfFurniture) {
                return PlanComponent.FURNITURE_RESIZE_INDICATOR;
            }
            else if (item != null && item instanceof Compass) {
                return PlanComponent.COMPASS_RESIZE_INDICATOR;
            }
            else {
                return PlanComponent.WALL_AND_LINE_RESIZE_INDICATOR;
            }
        }
        else if ((function (o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
        }
        else {
            return o1 === o2;
        } })(PlanComponent.IndicatorType.ROTATE, indicatorType)) {
            if (item != null && item instanceof HomePieceOfFurniture) {
                return PlanComponent.FURNITURE_ROTATION_INDICATOR;
            }
            else if (item != null && item instanceof Compass) {
                return PlanComponent.COMPASS_ROTATION_INDICATOR;
            }
            else if (item != null && item instanceof Camera) {
                return PlanComponent.CAMERA_YAW_ROTATION_INDICATOR;
            }
        }
        else if ((function (o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
        }
        else {
            return o1 === o2;
        } })(PlanComponent.IndicatorType.ELEVATE, indicatorType)) {
            if (item != null && item instanceof Camera) {
                return PlanComponent.CAMERA_ELEVATION_INDICATOR;
            }
            else {
                return PlanComponent.ELEVATION_INDICATOR;
            }
        }
        else if ((function (o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
        }
        else {
            return o1 === o2;
        } })(PlanComponent.IndicatorType.RESIZE_HEIGHT, indicatorType)) {
            if (item != null && item instanceof HomePieceOfFurniture) {
                return PlanComponent.FURNITURE_HEIGHT_INDICATOR;
            }
        }
        else if ((function (o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
        }
        else {
            return o1 === o2;
        } })(PlanComponent.IndicatorType.CHANGE_POWER, indicatorType)) {
            if (item != null && item instanceof HomeLight) {
                return PlanComponent.LIGHT_POWER_INDICATOR;
            }
        }
        else if ((function (o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
        }
        else {
            return o1 === o2;
        } })(PlanComponent.IndicatorType.MOVE_TEXT, indicatorType)) {
            return PlanComponent.TEXT_LOCATION_INDICATOR;
        }
        else if ((function (o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
        }
        else {
            return o1 === o2;
        } })(PlanComponent.IndicatorType.ROTATE_TEXT, indicatorType)) {
            return PlanComponent.TEXT_ANGLE_INDICATOR;
        }
        else if ((function (o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
        }
        else {
            return o1 === o2;
        } })(PlanComponent.IndicatorType.ROTATE_PITCH, indicatorType)) {
            if (item != null && item instanceof HomePieceOfFurniture) {
                return PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR;
            }
            else if (item != null && item instanceof Camera) {
                return PlanComponent.CAMERA_PITCH_ROTATION_INDICATOR;
            }
        }
        else if ((function (o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
        }
        else {
            return o1 === o2;
        } })(PlanComponent.IndicatorType.ROTATE_ROLL, indicatorType)) {
            if (item != null && item instanceof HomePieceOfFurniture) {
                return PlanComponent.FURNITURE_ROLL_ROTATION_INDICATOR;
            }
        }
        else if ((function (o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
        }
        else {
            return o1 === o2;
        } })(PlanComponent.IndicatorType.ARC_EXTENT, indicatorType)) {
            if (item != null && item instanceof Wall) {
                return PlanComponent.WALL_ARC_EXTENT_INDICATOR;
            }
        }
        return null;
    };
    /**
     * Paints name indicator on <code>room</code>.
     * @param {Graphics2D} g2D
     * @param {Room} room
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @private
     */
    PlanComponent.prototype.paintRoomNameOffsetIndicator = function (g2D, room, indicatorPaint, planScale) {
        if (this.resizeIndicatorVisible && room.getName() != null && room.getName().trim().length > 0) {
            var xName = room.getXCenter() + room.getNameXOffset();
            var yName = room.getYCenter() + room.getNameYOffset();
            this.paintTextIndicators(g2D, room.constructor, this.getLineCount(room.getName()), room.getNameStyle(), xName, yName, room.getNameAngle(), indicatorPaint, planScale);
        }
    };
    /**
     * Paints resize indicator on <code>room</code>.
     * @param {Graphics2D} g2D
     * @param {Room} room
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @private
     */
    PlanComponent.prototype.paintRoomAreaOffsetIndicator = function (g2D, room, indicatorPaint, planScale) {
        if (this.resizeIndicatorVisible && room.isAreaVisible() && room.getArea() > 0.01) {
            var xArea = room.getXCenter() + room.getAreaXOffset();
            var yArea = room.getYCenter() + room.getAreaYOffset();
            this.paintTextIndicators(g2D, room.constructor, 1, room.getAreaStyle(), xArea, yArea, room.getAreaAngle(), indicatorPaint, planScale);
        }
    };
    /**
     * Paints text location and angle indicators at the given coordinates.
     * @param {Graphics2D} g2D
     * @param {Object} selectableClass
     * @param {number} lineCount
     * @param {TextStyle} style
     * @param {number} x
     * @param {number} y
     * @param {number} angle
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @private
     */
    PlanComponent.prototype.paintTextIndicators = function (g2D, selectableClass, lineCount, style, x, y, angle, indicatorPaint, planScale) {
        if (this.resizeIndicatorVisible) {
            g2D.setPaint(indicatorPaint);
            g2D.setStroke(PlanComponent.INDICATOR_STROKE);
            var previousTransform = g2D.getTransform();
            var scaleInverse = 1 / planScale * this.resolutionScale;
            g2D.translate(x, y);
            g2D.rotate(angle);
            g2D.scale(scaleInverse, scaleInverse);
            if (selectableClass instanceof Label) {
                g2D.draw(PlanComponent.LABEL_CENTER_INDICATOR);
            }
            else {
                g2D.draw(this.getIndicator(null, PlanComponent.IndicatorType.MOVE_TEXT));
            }
            if (style == null) {
                style = this.preferences.getDefaultTextStyle(selectableClass);
            }
            var fontMetrics = this.getFontMetrics(g2D.getFont(), style);
            g2D.setTransform(previousTransform);
            g2D.translate(x, y);
            g2D.rotate(angle);
            g2D.translate(0, -fontMetrics.getHeight() * (lineCount - 1) - fontMetrics.getAscent() * (selectableClass instanceof Label ? 1 : 0.85));
            g2D.scale(scaleInverse, scaleInverse);
            g2D.draw(this.getIndicator(null, PlanComponent.IndicatorType.ROTATE_TEXT));
            g2D.setTransform(previousTransform);
        }
    };
    /**
     * Returns the number of lines in the given <code>text</code>.
     * @param {string} text
     * @return {number}
     * @private
     */
    PlanComponent.prototype.getLineCount = function (text) {
        var lineCount = 1;
        for (var i = 0, n = text.length; i < n; i++) {
            {
                if ((function (c) { return c.charCodeAt == null ? c : c.charCodeAt(0); })(text.charAt(i)) == '\n'.charCodeAt(0)) {
                    lineCount++;
                }
            }
            ;
        }
        return lineCount;
    };
    /**
     * Paints walls.
     * @param {Graphics2D} g2D
     * @param {*[]} selectedItems
     * @param {number} planScale
     * @param {string} backgroundColor
     * @param {string} foregroundColor
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    PlanComponent.prototype.paintWalls = function (g2D, selectedItems, planScale, backgroundColor, foregroundColor, paintMode) {
        var paintedWalls;
        var wallAreas;
        if (paintMode !== PlanComponent.PaintMode.CLIPBOARD) {
            wallAreas = this.getWallAreas();
        }
        else {
            paintedWalls = Home.getWallsSubList(selectedItems);
            wallAreas = this.getWallAreas(this.getDrawableWallsInSelectedLevel(paintedWalls));
        }
        var wallPaintScale = paintMode === PlanComponent.PaintMode.PRINT ? planScale / 72 * 150 : planScale / this.resolutionScale;
        var oldComposite = null;
        if (paintMode === PlanComponent.PaintMode.PAINT && this.backgroundPainted && this.backgroundImageCache != null && this.wallsDoorsOrWindowsModification) {
            oldComposite = this.setTransparency(g2D, 0.5);
        }
        {
            var array170 = (function (m) { if (m.entries == null)
                m.entries = []; return m.entries; })(wallAreas);
            for (var index169 = 0; index169 < array170.length; index169++) {
                var areaEntry = array170[index169];
                {
                    var wallPattern = (function (a) { var i = 0; return { next: function () { return i < a.length ? a[i++] : null; }, hasNext: function () { return i < a.length; } }; })(areaEntry.getKey()).next().getPattern();
                    this.fillAndDrawWallsArea(g2D, areaEntry.getValue(), planScale, this.getWallPaint(g2D, wallPaintScale, backgroundColor, foregroundColor, wallPattern != null ? wallPattern : this.preferences.getWallPattern()), foregroundColor, paintMode);
                }
            }
        }
        if (oldComposite != null) {
            g2D.setAlpha(oldComposite);
        }
    };
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
    PlanComponent.prototype.fillAndDrawWallsArea = function (g2D, area, planScale, fillPaint, drawPaint, paintMode) {
        g2D.setPaint(fillPaint);
        this.fillShape(g2D, area, paintMode);
        g2D.setPaint(drawPaint);
        g2D.setStroke(new java.awt.BasicStroke(this.getStrokeWidth(Wall, paintMode) / planScale));
        g2D.draw(area);
    };
    /**
     * Paints the outline of walls among <code>items</code> and a resize indicator if
     * <code>items</code> contains only one wall and indicator paint isn't <code>null</code>.
     * @param {Graphics2D} g2D
     * @param {*[]} items
     * @param {string|CanvasPattern} selectionOutlinePaint
     * @param {java.awt.BasicStroke} selectionOutlineStroke
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @param {string} foregroundColor
     * @private
     */
    PlanComponent.prototype.paintWallsOutline = function (g2D, items, selectionOutlinePaint, selectionOutlineStroke, indicatorPaint, planScale, foregroundColor) {
        var scaleInverse = 1 / planScale;
        var walls = Home.getWallsSubList(items);
        var previousTransform = g2D.getTransform();
        for (var index171 = 0; index171 < walls.length; index171++) {
            var wall = walls[index171];
            {
                if (this.isViewableAtSelectedLevel(wall)) {
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
                        var wallAngle = Math.atan2(wall.getYEnd() - wall.getYStart(), wall.getXEnd() - wall.getXStart());
                        if (arcExtent != null && arcExtent !== 0) {
                            xArcCircleCenter = wall.getXArcCircleCenter();
                            yArcCircleCenter = wall.getYArcCircleCenter();
                            arcCircleRadius = java.awt.geom.Point2D.distance(wall.getXStart(), wall.getYStart(), xArcCircleCenter, yArcCircleCenter);
                            distanceAtScale = arcCircleRadius * Math.abs(arcExtent) * planScale;
                            indicatorAngle = Math.atan2(yArcCircleCenter - wall.getYStart(), xArcCircleCenter - wall.getXStart()) + (arcExtent > 0 ? -Math.PI / 2 : Math.PI / 2);
                        }
                        else {
                            distanceAtScale = startPointToEndPointDistance * planScale;
                            indicatorAngle = wallAngle;
                        }
                        if (distanceAtScale < 30) {
                            g2D.rotate(wallAngle);
                            if (arcExtent != null) {
                                var wallToStartPointArcCircleCenterAngle = Math.abs(arcExtent) > Math.PI ? -(Math.PI + arcExtent) / 2 : (Math.PI - arcExtent) / 2;
                                var arcCircleCenterToWallDistance = (Math.tan(wallToStartPointArcCircleCenterAngle) * startPointToEndPointDistance / 2);
                                g2D.translate(startPointToEndPointDistance * planScale / 2, (arcCircleCenterToWallDistance - arcCircleRadius * (Math.abs(wallAngle) > Math.PI / 2 ? -1 : 1)) * planScale);
                            }
                            else {
                                g2D.translate(distanceAtScale / 2, 0);
                            }
                        }
                        else {
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
        }
        g2D.setPaint(foregroundColor);
        g2D.setStroke(new java.awt.BasicStroke(this.getStrokeWidth(Wall, PlanComponent.PaintMode.PAINT) / planScale));
        {
            var array173 = (function (m) { var r = []; if (m.entries == null)
                m.entries = []; for (var i = 0; i < m.entries.length; i++)
                r.push(m.entries[i].value); return r; })(this.getWallAreas(this.getDrawableWallsInSelectedLevel(walls)));
            for (var index172 = 0; index172 < array173.length; index172++) {
                var area = array173[index172];
                {
                    g2D.draw(area);
                }
            }
        }
        if (items.length === 1 && walls.length === 1 && indicatorPaint != null) {
            var wall = (function (a) { var i = 0; return { next: function () { return i < a.length ? a[i++] : null; }, hasNext: function () { return i < a.length; } }; })(walls).next();
            if (this.isViewableAtSelectedLevel(wall)) {
                this.paintWallResizeIndicators(g2D, wall, indicatorPaint, planScale);
            }
        }
    };
    /**
     * Returns <code>true</code> if the given item can be viewed in the plan at the selected level.
     * @param {Object} item
     * @return {boolean}
     */
    PlanComponent.prototype.isViewableAtSelectedLevel = function (item) {
        var level = item.getLevel();
        return level == null || (level.isViewable() && item.isAtLevel(this.home.getSelectedLevel()));
    };
    /**
     * Paints resize indicators on <code>wall</code>.
     * @param {Graphics2D} g2D
     * @param {Wall} wall
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @private
     */
    PlanComponent.prototype.paintWallResizeIndicators = function (g2D, wall, indicatorPaint, planScale) {
        if (this.resizeIndicatorVisible) {
            g2D.setPaint(indicatorPaint);
            g2D.setStroke(PlanComponent.INDICATOR_STROKE);
            var previousTransform = g2D.getTransform();
            var scaleInverse = 1 / planScale * this.resolutionScale;
            var wallPoints = wall.getPoints();
            var leftSideMiddlePointIndex = (wallPoints.length / 4 | 0);
            var wallAngle = Math.atan2(wall.getYEnd() - wall.getYStart(), wall.getXEnd() - wall.getXStart());
            if (wallPoints.length % 4 === 0) {
                g2D.translate((wallPoints[leftSideMiddlePointIndex - 1][0] + wallPoints[leftSideMiddlePointIndex][0]) / 2, (wallPoints[leftSideMiddlePointIndex - 1][1] + wallPoints[leftSideMiddlePointIndex][1]) / 2);
            }
            else {
                g2D.translate(wallPoints[leftSideMiddlePointIndex][0], wallPoints[leftSideMiddlePointIndex][1]);
            }
            g2D.scale(scaleInverse, scaleInverse);
            g2D.rotate(wallAngle + Math.PI);
            g2D.draw(this.getIndicator(wall, PlanComponent.IndicatorType.ARC_EXTENT));
            g2D.setTransform(previousTransform);
            var arcExtent = wall.getArcExtent();
            var indicatorAngle = void 0;
            if (arcExtent != null && arcExtent !== 0) {
                indicatorAngle = Math.atan2(wall.getYArcCircleCenter() - wall.getYEnd(), wall.getXArcCircleCenter() - wall.getXEnd()) + (arcExtent > 0 ? -Math.PI / 2 : Math.PI / 2);
            }
            else {
                indicatorAngle = wallAngle;
            }
            g2D.translate(wall.getXEnd(), wall.getYEnd());
            g2D.scale(scaleInverse, scaleInverse);
            g2D.rotate(indicatorAngle);
            g2D.draw(this.getIndicator(wall, PlanComponent.IndicatorType.RESIZE));
            g2D.setTransform(previousTransform);
            if (arcExtent != null) {
                indicatorAngle += Math.PI - arcExtent;
            }
            else {
                indicatorAngle += Math.PI;
            }
            g2D.translate(wall.getXStart(), wall.getYStart());
            g2D.scale(scaleInverse, scaleInverse);
            g2D.rotate(indicatorAngle);
            g2D.draw(this.getIndicator(wall, PlanComponent.IndicatorType.RESIZE));
            g2D.setTransform(previousTransform);
        }
    };
    /**
     * Returns the walls that belong to the selected level in home.
     * @param {Wall[]} walls
     * @return {Wall[]}
     * @private
     */
    PlanComponent.prototype.getDrawableWallsInSelectedLevel = function (walls) {
        var wallsInSelectedLevel = ([]);
        for (var index174 = 0; index174 < walls.length; index174++) {
            var wall = walls[index174];
            {
                if (this.isViewableAtSelectedLevel(wall)) {
                    /* add */ (wallsInSelectedLevel.push(wall) > 0);
                }
            }
        }
        return wallsInSelectedLevel;
    };
    /**
     * Returns areas matching the union of <code>walls</code> shapes sorted by pattern.
     * @param {Wall[]} walls
     * @return {Object} Map<Collection<Wall>, Area>
     * @private
     */
    PlanComponent.prototype.getWallAreas = function (walls) {
        var _this = this;
        if (walls == null) {
            if (this.wallAreasCache == null) {
                return this.wallAreasCache = this.getWallAreas(this.getDrawableWallsInSelectedLevel(this.home.getWalls()));
            }
            else {
                return this.wallAreasCache;
            }
        }
        else {
            if (walls.length === 0) {
                return {};
            }
            var pattern = (function (a) { var i = 0; return { next: function () { return i < a.length ? a[i++] : null; }, hasNext: function () { return i < a.length; } }; })(walls).next().getPattern();
            var samePattern = true;
            for (var i = 0; i < walls.length; i++) {
                if (pattern !== walls[i].getPattern()) {
                    samePattern = false;
                    break;
                }
            }
            var wallAreas = {};
            if (samePattern) {
                /* put */ (function (m, k, v) { if (m.entries == null)
                    m.entries = []; for (var i = 0; i < m.entries.length; i++)
                    if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                        m.entries[i].value = v;
                        return;
                    } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(wallAreas, walls, this.getItemsArea(walls));
            }
            else {
                var sortedWalls_1 = {};
                walls.forEach(function (wall) {
                    var wallPattern = wall.getPattern();
                    if (wallPattern == null) {
                        wallPattern = _this.preferences.getWallPattern();
                    }
                    var patternWalls = (function (m, k) { if (m.entries == null)
                        m.entries = []; for (var i = 0; i < m.entries.length; i++)
                        if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                            return m.entries[i].value;
                        } return null; })(sortedWalls_1, wallPattern);
                    if (patternWalls == null) {
                        patternWalls = ([]);
                        /* put */ (function (m, k, v) { if (m.entries == null)
                            m.entries = []; for (var i = 0; i < m.entries.length; i++)
                            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                                m.entries[i].value = v;
                                return;
                            } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(sortedWalls_1, wallPattern, patternWalls);
                    }
                    patternWalls.push(wall);
                });
                {
                    var array178 = (function (m) { var r = []; if (m.entries == null)
                        m.entries = []; for (var i = 0; i < m.entries.length; i++)
                        r.push(m.entries[i].value); return r; })(sortedWalls_1);
                    for (var index177 = 0; index177 < array178.length; index177++) {
                        var patternWalls = array178[index177];
                        {
                            /* put */ (function (m, k, v) { if (m.entries == null)
                                m.entries = []; for (var i = 0; i < m.entries.length; i++)
                                if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                                    m.entries[i].value = v;
                                    return;
                                } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(wallAreas, patternWalls, this.getItemsArea(patternWalls));
                        }
                    }
                }
            }
            return wallAreas;
        }
    };
    /**
     * Returns an area matching the union of all <code>items</code> shapes.
     * @param {Bound[]} items
     * @return {java.awt.geom.Area}
     * @private
     */
    PlanComponent.prototype.getItemsArea = function (items) {
        var itemsArea = new java.awt.geom.Area();
        items.forEach(function (item) { return itemsArea.add(new java.awt.geom.Area(ShapeTools.getShape(item.getPoints(), true, null))); });
        return itemsArea;
    };
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
    PlanComponent.prototype.getWallPaint = function (g2D, planScale, backgroundColor, foregroundColor, wallPattern) {
        var _this = this;
        var patternImage = this.patternImagesCache[wallPattern.getImage().getURL()];
        if (patternImage == null || backgroundColor != this.wallsPatternBackgroundCache || foregroundColor != this.wallsPatternForegroundCache) {
            patternImage = TextureManager.getInstance().getWaitImage();
            this.patternImagesCache[wallPattern.getImage().getURL()] = patternImage;
            TextureManager.getInstance().loadTexture(wallPattern.getImage(), false, {
                textureUpdated: function (image) {
                    _this.patternImagesCache[wallPattern.getImage().getURL()] = image;
                    _this.repaint();
                },
                textureError: function () {
                    _this.patternImagesCache[wallPattern.getImage().getURL()] = PlanComponent.ERROR_TEXTURE_IMAGE;
                },
                progression: function () { }
            });
            this.wallsPatternBackgroundCache = backgroundColor;
            this.wallsPatternForegroundCache = foregroundColor;
        }
        return g2D.createPattern(patternImage);
    };
    /**
     * Paints home furniture.
     * @param {Graphics2D} g2D
     * @param {HomePieceOfFurniture[]} furniture
     * @param {Bound[]} selectedItems
     * @param {number} planScale
     * @param {string} backgroundColor
     * @param {string} foregroundColor
     * @param {string} furnitureOutlineColor
     * @param {PlanComponent.PaintMode} paintMode
     * @param {boolean} paintIcon
     * @private
     */
    PlanComponent.prototype.paintFurniture = function (g2D, furniture, selectedItems, planScale, backgroundColor, foregroundColor, furnitureOutlineColor, paintMode, paintIcon) {
        if (!(furniture.length == 0)) {
            var pieceBorderStroke = new java.awt.BasicStroke(this.getStrokeWidth(HomePieceOfFurniture, paintMode) / planScale);
            var allFurnitureViewedFromTop = null;
            for (var i = 0; i < furniture.length; i++) {
                var piece = furniture[i];
                if (piece.isVisible()) {
                    var selectedPiece = (selectedItems.indexOf((piece)) >= 0);
                    if (piece != null && piece instanceof HomeFurnitureGroup) {
                        var groupFurniture = (piece).getFurniture();
                        var emptyList = [];
                        this.paintFurniture(g2D, groupFurniture, selectedPiece ? groupFurniture : emptyList, planScale, backgroundColor, foregroundColor, furnitureOutlineColor, paintMode, paintIcon);
                    }
                    else if (paintMode !== PlanComponent.PaintMode.CLIPBOARD || selectedPiece) {
                        var pieceShape = ShapeTools.getShape(piece.getPoints(), true, null);
                        var pieceShape2D = void 0;
                        if (piece != null && piece instanceof HomeDoorOrWindow) {
                            var doorOrWindow = piece;
                            pieceShape2D = this.getDoorOrWindowWallPartShape(doorOrWindow);
                            if (this.draggedItemsFeedback == null || !(this.draggedItemsFeedback.indexOf((piece)) >= 0)) {
                                this.paintDoorOrWindowWallThicknessArea(g2D, doorOrWindow, planScale, backgroundColor, foregroundColor, paintMode);
                            }
                            this.paintDoorOrWindowSashes(g2D, doorOrWindow, planScale, foregroundColor, paintMode);
                        }
                        else {
                            pieceShape2D = pieceShape;
                        }
                        var viewedFromTop = void 0;
                        if (this.preferences.isFurnitureViewedFromTop()) {
                            if (piece.getPlanIcon() != null || (piece != null && piece instanceof HomeDoorOrWindow)) {
                                viewedFromTop = true;
                            }
                            else {
                                allFurnitureViewedFromTop = PlanComponent.WEBGL_AVAILABLE;
                                viewedFromTop = allFurnitureViewedFromTop;
                            }
                        }
                        else {
                            viewedFromTop = false;
                        }
                        if (paintIcon && viewedFromTop) {
                            if (piece != null && piece instanceof HomeDoorOrWindow) {
                                g2D.setPaint(backgroundColor);
                                g2D.fill(pieceShape2D);
                                g2D.setPaint(foregroundColor);
                                g2D.setStroke(pieceBorderStroke);
                                g2D.draw(pieceShape2D);
                            }
                            else {
                                this.paintPieceOfFurnitureTop(g2D, piece, pieceShape2D, pieceBorderStroke, planScale, backgroundColor, foregroundColor, paintMode);
                            }
                            if (paintMode === PlanComponent.PaintMode.PAINT) {
                                g2D.setStroke(pieceBorderStroke);
                                g2D.setPaint(furnitureOutlineColor);
                                g2D.draw(pieceShape);
                            }
                        }
                        else {
                            if (paintIcon) {
                                this.paintPieceOfFurnitureIcon(g2D, piece, null, pieceShape2D, planScale, backgroundColor, paintMode);
                            }
                            g2D.setPaint(foregroundColor);
                            g2D.setStroke(pieceBorderStroke);
                            g2D.draw(pieceShape2D);
                            if ((piece != null && piece instanceof HomeDoorOrWindow) && paintMode === PlanComponent.PaintMode.PAINT) {
                                g2D.setPaint(furnitureOutlineColor);
                                g2D.draw(pieceShape);
                            }
                        }
                    }
                }
            }
        }
    };
    /**
     * Returns the shape of the wall part of a door or a window.
     * @param {HomeDoorOrWindow} doorOrWindow
     * @return {Object}
     * @private
     */
    PlanComponent.prototype.getDoorOrWindowWallPartShape = function (doorOrWindow) {
        var doorOrWindowWallPartRectangle = this.getDoorOrWindowRectangle(doorOrWindow, true);
        var rotation = java.awt.geom.AffineTransform.getRotateInstance(doorOrWindow.getAngle(), doorOrWindow.getX(), doorOrWindow.getY());
        var it = doorOrWindowWallPartRectangle.getPathIterator(rotation);
        var doorOrWindowWallPartShape = new java.awt.geom.GeneralPath();
        doorOrWindowWallPartShape.append(it, false);
        return doorOrWindowWallPartShape;
    };
    /**
     * Returns the rectangle of a door or a window.
     * @param {HomeDoorOrWindow} doorOrWindow
     * @param {boolean} onlyWallPart
     * @return {java.awt.geom.Rectangle2D}
     * @private
     */
    PlanComponent.prototype.getDoorOrWindowRectangle = function (doorOrWindow, onlyWallPart) {
        var wallThickness = doorOrWindow.getDepth() * (onlyWallPart ? doorOrWindow.getWallThickness() : 1);
        var wallDistance = doorOrWindow.getDepth() * (onlyWallPart ? doorOrWindow.getWallDistance() : 0);
        var cutOutShape = doorOrWindow.getCutOutShape();
        var width = doorOrWindow.getWidth();
        var wallWidth = doorOrWindow.getWallWidth() * width;
        var x = doorOrWindow.getX() - width / 2;
        x += doorOrWindow.isModelMirrored() ? (1 - doorOrWindow.getWallLeft() - doorOrWindow.getWallWidth()) * width : doorOrWindow.getWallLeft() * width;
        if (cutOutShape != null && !(function (o1, o2) { if (o1 && o1.equals) {
            return o1.equals(o2);
        }
        else {
            return o1 === o2;
        } })(PieceOfFurniture.DEFAULT_CUT_OUT_SHAPE, cutOutShape)) {
            var shape = ShapeTools.getShape(cutOutShape);
            var bounds = shape.getBounds2D();
            if (doorOrWindow.isModelMirrored()) {
                x += (1 - bounds.getX() - bounds.getWidth()) * wallWidth;
            }
            else {
                x += bounds.getX() * wallWidth;
            }
            wallWidth *= bounds.getWidth();
        }
        var doorOrWindowWallPartRectangle = new java.awt.geom.Rectangle2D.Float(x, doorOrWindow.getY() - doorOrWindow.getDepth() / 2 + wallDistance, wallWidth, wallThickness);
        return doorOrWindowWallPartRectangle;
    };
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
    PlanComponent.prototype.paintDoorOrWindowWallThicknessArea = function (g2D, doorOrWindow, planScale, backgroundColor, foregroundColor, paintMode) {
        if (doorOrWindow.isWallCutOutOnBothSides()) {
            var doorOrWindowWallArea = null;
            if (this.doorOrWindowWallThicknessAreasCache != null) {
                doorOrWindowWallArea = (function (m, k) { if (m.entries == null)
                    m.entries = []; for (var i = 0; i < m.entries.length; i++)
                    if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                        return m.entries[i].value;
                    } return null; })(this.doorOrWindowWallThicknessAreasCache, doorOrWindow);
            }
            if (doorOrWindowWallArea == null) {
                var doorOrWindowRectangle = this.getDoorOrWindowRectangle(doorOrWindow, false);
                var rotation = java.awt.geom.AffineTransform.getRotateInstance(doorOrWindow.getAngle(), doorOrWindow.getX(), doorOrWindow.getY());
                var it = doorOrWindowRectangle.getPathIterator(rotation);
                var doorOrWindowWallPartShape = new java.awt.geom.GeneralPath();
                doorOrWindowWallPartShape.append(it, false);
                var doorOrWindowWallPartArea = new java.awt.geom.Area(doorOrWindowWallPartShape);
                doorOrWindowWallArea = new java.awt.geom.Area();
                {
                    var array182 = this.home.getWalls();
                    for (var index181 = 0; index181 < array182.length; index181++) {
                        var wall = array182[index181];
                        {
                            if (wall.isAtLevel(doorOrWindow.getLevel()) && doorOrWindow.isParallelToWall(wall)) {
                                var wallShape = ShapeTools.getShape(wall.getPoints(), true, null);
                                var wallArea = new java.awt.geom.Area(wallShape);
                                wallArea.intersect(doorOrWindowWallPartArea);
                                if (!wallArea.isEmpty()) {
                                    var doorOrWindowExtendedRectangle = new java.awt.geom.Rectangle2D.Float(doorOrWindowRectangle.getX(), doorOrWindowRectangle.getY() - 2 * wall.getThickness(), doorOrWindowRectangle.getWidth(), doorOrWindowRectangle.getWidth() + 4 * wall.getThickness());
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
                }
            }
            if (this.doorOrWindowWallThicknessAreasCache == null) {
                this.doorOrWindowWallThicknessAreasCache = ({});
            }
            /* put */ (function (m, k, v) { if (m.entries == null)
                m.entries = []; for (var i = 0; i < m.entries.length; i++)
                if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                    m.entries[i].value = v;
                    return;
                } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(this.doorOrWindowWallThicknessAreasCache, doorOrWindow, doorOrWindowWallArea);
            g2D.setPaint(backgroundColor);
            g2D.fill(doorOrWindowWallArea);
            g2D.setPaint(foregroundColor);
            g2D.setStroke(new java.awt.BasicStroke(this.getStrokeWidth(HomePieceOfFurniture, paintMode) / planScale));
            g2D.draw(doorOrWindowWallArea);
        }
    };
    /**
     * Paints the sashes of a door or a window.
     * @param {Graphics2D} g2D
     * @param {HomeDoorOrWindow} doorOrWindow
     * @param {number} planScale
     * @param {string} foregroundColor
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    PlanComponent.prototype.paintDoorOrWindowSashes = function (g2D, doorOrWindow, planScale, foregroundColor, paintMode) {
        var sashBorderStroke = new java.awt.BasicStroke(this.getStrokeWidth(HomePieceOfFurniture, paintMode) / planScale);
        g2D.setPaint(foregroundColor);
        g2D.setStroke(sashBorderStroke);
        {
            var array184 = doorOrWindow.getSashes();
            for (var index183 = 0; index183 < array184.length; index183++) {
                var sash = array184[index183];
                {
                    g2D.draw(this.getDoorOrWindowSashShape(doorOrWindow, sash));
                }
            }
        }
    };
    /**
     * Returns the shape of a sash of a door or a window.
     * @param {HomeDoorOrWindow} doorOrWindow
     * @param {Sash} sash
     * @return {java.awt.geom.GeneralPath}
     * @private
     */
    PlanComponent.prototype.getDoorOrWindowSashShape = function (doorOrWindow, sash) {
        var modelMirroredSign = doorOrWindow.isModelMirrored() ? -1 : 1;
        var xAxis = modelMirroredSign * sash.getXAxis() * doorOrWindow.getWidth();
        var yAxis = sash.getYAxis() * doorOrWindow.getDepth();
        var sashWidth = sash.getWidth() * doorOrWindow.getWidth();
        var startAngle = (function (x) { return x * 180 / Math.PI; })(sash.getStartAngle());
        if (doorOrWindow.isModelMirrored()) {
            startAngle = 180 - startAngle;
        }
        var extentAngle = modelMirroredSign * (function (x) { return x * 180 / Math.PI; })(sash.getEndAngle() - sash.getStartAngle());
        var arc = new java.awt.geom.Arc2D.Float(xAxis - sashWidth, yAxis - sashWidth, 2 * sashWidth, 2 * sashWidth, startAngle, extentAngle, java.awt.geom.Arc2D.PIE);
        var transformation = java.awt.geom.AffineTransform.getTranslateInstance(doorOrWindow.getX(), doorOrWindow.getY());
        transformation.rotate(doorOrWindow.getAngle());
        transformation.translate(modelMirroredSign * -doorOrWindow.getWidth() / 2, -doorOrWindow.getDepth() / 2);
        var it = arc.getPathIterator(transformation);
        var sashShape = new java.awt.geom.GeneralPath();
        sashShape.append(it, false);
        return sashShape;
    };
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
    PlanComponent.prototype.paintFurnitureName = function (g2D, furniture, selectedItems, planScale, foregroundColor, paintMode) {
        var previousFont = g2D.getFont();
        g2D.setPaint(foregroundColor);
        for (var index185 = 0; index185 < furniture.length; index185++) {
            var piece = furniture[index185];
            {
                if (piece.isVisible()) {
                    var selectedPiece = (selectedItems.indexOf((piece)) >= 0);
                    if (piece != null && piece instanceof HomeFurnitureGroup) {
                        var groupFurniture = (piece).getFurniture();
                        var emptyList = [];
                        this.paintFurnitureName(g2D, groupFurniture, selectedPiece ? groupFurniture : emptyList, planScale, foregroundColor, paintMode);
                    }
                    if (piece.isNameVisible() && (paintMode !== PlanComponent.PaintMode.CLIPBOARD || selectedPiece)) {
                        var name_2 = piece.getName().trim();
                        if (name_2.length > 0) {
                            this.paintText(g2D, piece.constructor, name_2, piece.getNameStyle(), null, piece.getX() + piece.getNameXOffset(), piece.getY() + piece.getNameYOffset(), piece.getNameAngle(), previousFont);
                        }
                    }
                }
            }
        }
        g2D.setFont(previousFont);
    };
    /**
     * Paints the outline of furniture among <code>items</code> and indicators if
     * <code>items</code> contains only one piece and indicator paint isn't <code>null</code>.
     * @param {Graphics2D} g2D
     * @param {*[]} items
     * @param {string|CanvasPattern} selectionOutlinePaint
     * @param {java.awt.BasicStroke} selectionOutlineStroke
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @param {string} foregroundColor
     * @private
     */
    PlanComponent.prototype.paintFurnitureOutline = function (g2D, items, selectionOutlinePaint, selectionOutlineStroke, indicatorPaint, planScale, foregroundColor) {
        var _this = this;
        var pieceBorderStroke = new java.awt.BasicStroke(this.getStrokeWidth(HomePieceOfFurniture, PlanComponent.PaintMode.PAINT) / planScale);
        var pieceFrontBorderStroke = new java.awt.BasicStroke(4 * this.getStrokeWidth(HomePieceOfFurniture, PlanComponent.PaintMode.PAINT) / planScale, java.awt.BasicStroke.CAP_BUTT, java.awt.BasicStroke.JOIN_MITER);
        var furniture = Home.getFurnitureSubList(items);
        var newFurniture = [];
        var furnitureGroupsArea = null;
        var furnitureGroupsStroke = new java.awt.BasicStroke(15 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_SQUARE, java.awt.BasicStroke.JOIN_ROUND);
        var lastGroup = null;
        var furnitureInGroupsArea = null;
        var homeFurniture = this.home.getFurniture();
        for (var it = (function (a) { var i = 0; return { next: function () { return i < a.length ? a[i++] : null; }, hasNext: function () { return i < a.length; } }; })(furniture); it.hasNext();) {
            {
                var piece = it.next();
                newFurniture.push(piece);
                if (piece.isVisible() && this.isViewableAtSelectedLevel(piece)) {
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
                        }
                        else {
                            if (lastGroup !== homePieceOfFurniture) {
                                furnitureGroupsArea.add(groupArea);
                            }
                            furnitureInGroupsArea.add(pieceArea);
                        }
                        lastGroup = homePieceOfFurniture;
                    }
                }
            }
            ;
        }
        if (furnitureGroupsArea != null) {
            furnitureGroupsArea.subtract(furnitureInGroupsArea);
            var oldComposite = this.setTransparency(g2D, 0.6);
            g2D.setPaint(selectionOutlinePaint);
            g2D.fill(furnitureGroupsArea);
            g2D.setAlpha(oldComposite);
        }
        newFurniture.forEach(function (piece) {
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
                _this.paintPieceOFFurnitureIndicators(g2D, piece, indicatorPaint, planScale);
            }
        });
    };
    /**
     * Returns <code>piece</code> if it belongs to home furniture or the group to which <code>piece</code> belongs.
     * @param {HomePieceOfFurniture} piece
     * @param {HomePieceOfFurniture[]} homeFurniture
     * @return {HomePieceOfFurniture}
     * @private
     */
    PlanComponent.prototype.getPieceOfFurnitureInHomeFurniture = function (piece, homeFurniture) {
        if (!(homeFurniture.indexOf((piece)) >= 0)) {
            for (var index187 = 0; index187 < homeFurniture.length; index187++) {
                var homePiece = homeFurniture[index187];
                {
                    if ((homePiece != null && homePiece instanceof HomeFurnitureGroup) && ((homePiece).getAllFurniture().indexOf((piece)) >= 0)) {
                        return homePiece;
                    }
                }
            }
        }
        return piece;
    };
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
    PlanComponent.prototype.paintPieceOfFurnitureIcon = function (g2D, piece, icon, pieceShape2D, planScale, backgroundColor) {
        var _this = this;
        if (icon == null) {
            if (this.furnitureIconsCache == null) {
                this.furnitureIconsCache = {};
            }
            var image = this.furnitureIconsCache[piece.icon.getURL()];
            if (image == null) {
                image = TextureManager.getInstance().getWaitImage();
                console.log("paintPieceOfFurnitureIcon: loading " + piece.icon.getURL());
                TextureManager.getInstance().loadTexture(piece.icon, {
                    textureUpdated: function (texture) {
                        console.log("paintPieceOfFurnitureIcon: loaded " + piece.icon.getURL());
                        _this.furnitureIconsCache[piece.icon.getURL()] = texture;
                        _this.repaint();
                    },
                    textureError: function () {
                        console.error("icon not found: " + piece.icon.getURL());
                        _this.furnitureIconsCache[piece.icon.getURL()] = TextureManager.getInstance().getErrorImage();
                    }
                });
            }
            icon = new PlanComponent.PieceOfFurnitureTopViewIcon(image);
        }
        // Fill piece area
        g2D.setPaint(backgroundColor);
        g2D.fill(pieceShape2D);
        //let previousClip : java.awt.Shape = g2D.getClip();
        // Clip icon drawing into piece shape
        //g2D.clip(pieceShape2D);
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
        }
        else {
            g2D.scale(iconScale, iconScale);
        }
        // Paint piece icon
        //g2D.drawImage(image, -image.width / 2, -image.height / 2);
        icon.paintIcon(g2D, -icon.getIconWidth() / 2, -icon.getIconHeight() / 2);
        // Revert g2D transformation to previous value
        g2D.setTransform(previousTransform);
        //g2D.setClip(previousClip);
    };
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
    PlanComponent.prototype.paintPieceOfFurnitureTop = function (g2D, piece, pieceShape2D, pieceBorderStroke, planScale, backgroundColor, foregroundColor, paintMode) {
        if (this.furnitureTopViewIconKeys == null) {
            this.furnitureTopViewIconKeys = ({});
            this.furnitureTopViewIconsCache = ({});
        }
        var topViewIconKey = (function (m, k) { if (m.entries == null)
            m.entries = []; for (var i = 0; i < m.entries.length; i++)
            if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                return m.entries[i].value;
            } return null; })(this.furnitureTopViewIconKeys, piece);
        var icon;
        if (topViewIconKey == null) {
            topViewIconKey = new PlanComponent.HomePieceOfFurnitureTopViewIconKey(/* clone */ /* clone */ (function (o) { if (o.clone != undefined) {
                return o.clone();
            }
            else {
                var clone = Object.create(o);
                for (var p in o) {
                    if (o.hasOwnProperty(p))
                        clone[p] = o[p];
                }
                return clone;
            } })(piece));
            icon = (function (m, k) { if (m.entries == null)
                m.entries = []; for (var i = 0; i < m.entries.length; i++)
                if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                    return m.entries[i].value;
                } return null; })(this.furnitureTopViewIconsCache, topViewIconKey);
            if (icon == null || icon.isWaitIcon() && paintMode !== PlanComponent.PaintMode.PAINT) {
                var waitingComponent = paintMode === PlanComponent.PaintMode.PAINT ? this : null;
                if (piece.getPlanIcon() != null) {
                    icon = new PlanComponent.PieceOfFurniturePlanIcon(piece, waitingComponent);
                }
                else {
                    icon = new PlanComponent.PieceOfFurnitureModelIcon(piece, this.object3dFactory, waitingComponent, this.preferences.getFurnitureModelIconSize());
                }
                /* put */ (function (m, k, v) { if (m.entries == null)
                    m.entries = []; for (var i = 0; i < m.entries.length; i++)
                    if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                        m.entries[i].value = v;
                        return;
                    } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(this.furnitureTopViewIconsCache, topViewIconKey, icon);
            }
            else {
                {
                    var array189 = (function (m) { var r = []; if (m.entries == null)
                        m.entries = []; for (var i = 0; i < m.entries.length; i++)
                        r.push(m.entries[i].key); return r; })(this.furnitureTopViewIconsCache);
                    for (var index188 = 0; index188 < array189.length; index188++) {
                        var key = array189[index188];
                        {
                            if (key.equals(topViewIconKey)) {
                                topViewIconKey = key;
                                break;
                            }
                        }
                    }
                }
            }
            /* put */ (function (m, k, v) { if (m.entries == null)
                m.entries = []; for (var i = 0; i < m.entries.length; i++)
                if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                    m.entries[i].value = v;
                    return;
                } m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } }); })(this.furnitureTopViewIconKeys, piece, topViewIconKey);
        }
        else {
            icon = (function (m, k) { if (m.entries == null)
                m.entries = []; for (var i = 0; i < m.entries.length; i++)
                if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                    return m.entries[i].value;
                } return null; })(this.furnitureTopViewIconsCache, topViewIconKey);
        }
        if (icon.isWaitIcon() || icon.isErrorIcon()) {
            this.paintPieceOfFurnitureIcon(g2D, piece, icon, pieceShape2D, planScale, backgroundColor);
            g2D.setPaint(foregroundColor);
            g2D.setStroke(pieceBorderStroke);
            g2D.draw(pieceShape2D);
        }
        else {
            var previousTransform = g2D.getTransform();
            var bounds = pieceShape2D.getBounds2D();
            g2D.translate(bounds.getCenterX(), bounds.getCenterY());
            g2D.rotate(piece.getAngle());
            var pieceDepth = piece.getDepthInPlan();
            if (piece.isModelMirrored()) {
                g2D.scale(-piece.getWidthInPlan() / icon.getIconWidth(), pieceDepth / icon.getIconHeight());
            }
            else {
                g2D.scale(piece.getWidthInPlan() / icon.getIconWidth(), pieceDepth / icon.getIconHeight());
            }
            icon.paintIcon(g2D, (-icon.getIconWidth() / 2 | 0), (-icon.getIconHeight() / 2 | 0));
            g2D.setTransform(previousTransform);
        }
    };
    /**
     * Paints rotation, elevation, height and resize indicators on <code>piece</code>.
     * @param {Graphics2D} g2D
     * @param {HomePieceOfFurniture} piece
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @private
     */
    PlanComponent.prototype.paintPieceOFFurnitureIndicators = function (g2D, piece, indicatorPaint, planScale) {
        if (this.resizeIndicatorVisible) {
            g2D.setPaint(indicatorPaint);
            g2D.setStroke(PlanComponent.INDICATOR_STROKE);
            var previousTransform = g2D.getTransform();
            var piecePoints = piece.getPoints();
            var scaleInverse = 1 / planScale * this.resolutionScale;
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
            }
            else if (piece.getRoll() !== 0 && this.isFurnitureSizeInPlanSupported()) {
                var rollIndicator = this.getIndicator(piece, PlanComponent.IndicatorType.ROTATE_ROLL);
                if (rollIndicator != null) {
                    g2D.draw(rollIndicator);
                }
            }
            else if (piece != null && piece instanceof HomeLight) {
                var powerIndicator = this.getIndicator(piece, PlanComponent.IndicatorType.CHANGE_POWER);
                if (powerIndicator != null) {
                    g2D.draw(PlanComponent.LIGHT_POWER_POINT_INDICATOR);
                    g2D.translate(-7.5, 7.5);
                    g2D.rotate(-pieceAngle);
                    g2D.draw(powerIndicator);
                }
            }
            else if (piece.isResizable() && !piece.isHorizontallyRotated()) {
                var heightIndicator = this.getIndicator(piece, PlanComponent.IndicatorType.RESIZE_HEIGHT);
                if (heightIndicator != null) {
                    g2D.draw(PlanComponent.FURNITURE_HEIGHT_POINT_INDICATOR);
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
            if (piece.isNameVisible() && piece.getName().trim().length > 0) {
                var xName = piece.getX() + piece.getNameXOffset();
                var yName = piece.getY() + piece.getNameYOffset();
                this.paintTextIndicators(g2D, piece.constructor, this.getLineCount(piece.getName()), piece.getNameStyle(), xName, yName, piece.getNameAngle(), indicatorPaint, planScale);
            }
        }
    };
    /**
     * Paints polylines.
     * @param {Graphics2D} g2D
     * @param {Polyline[]} polylines
     * @param {*[]} selectedItems
     * @param {string|CanvasPattern} selectionOutlinePaint
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @param {string} foregroundColor
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    PlanComponent.prototype.paintPolylines = function (g2D, polylines, selectedItems, selectionOutlinePaint, indicatorPaint, planScale, foregroundColor, paintMode) {
        for (var i = 0; i < polylines.length; i++) {
            var polyline = polylines[i];
            if (this.isViewableAtSelectedLevel(polyline)) {
                var selected = (selectedItems.indexOf((polyline)) >= 0);
                if (paintMode !== PlanComponent.PaintMode.CLIPBOARD || selected) {
                    g2D.setPaint(intToColorString(polyline.getColor()));
                    var thickness = polyline.getThickness();
                    g2D.setStroke(ShapeTools.getStroke(thickness, polyline.getCapStyle(), polyline.getJoinStyle(), polyline.getDashPattern(), polyline.getDashOffset()));
                    var polylineShape = ShapeTools.getPolylineShape(polyline.getPoints(), polyline.getJoinStyle() === Polyline.JoinStyle.CURVED, polyline.isClosedPath());
                    g2D.draw(polylineShape);
                    var firstPoint = null;
                    var secondPoint = null;
                    var beforeLastPoint = null;
                    var lastPoint = null;
                    for (var it = polylineShape.getPathIterator(null, 0.5); !it.isDone(); it.next()) {
                        {
                            var pathPoint = [0, 0];
                            if (it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
                                if (firstPoint == null) {
                                    firstPoint = pathPoint;
                                }
                                else if (secondPoint == null) {
                                    secondPoint = pathPoint;
                                }
                                beforeLastPoint = lastPoint;
                                lastPoint = pathPoint;
                            }
                        }
                        ;
                    }
                    var angleAtStart = Math.atan2(firstPoint[1] - secondPoint[1], firstPoint[0] - secondPoint[0]);
                    var angleAtEnd = Math.atan2(lastPoint[1] - beforeLastPoint[1], lastPoint[0] - beforeLastPoint[0]);
                    var arrowDelta = polyline.getCapStyle() !== Polyline.CapStyle.BUTT ? thickness / 2 : 0;
                    this.paintArrow(g2D, firstPoint, angleAtStart, polyline.getStartArrowStyle(), thickness, arrowDelta);
                    this.paintArrow(g2D, lastPoint, angleAtEnd, polyline.getEndArrowStyle(), thickness, arrowDelta);
                    if (selected && paintMode === PlanComponent.PaintMode.PAINT) {
                        g2D.setPaint(selectionOutlinePaint);
                        g2D.setStroke(SwingTools.getStroke(thickness + 4 / planScale, polyline.getCapStyle(), polyline.getJoinStyle(), Polyline.DashStyle.SOLID));
                        g2D.draw(polylineShape);
                        if (selectedItems.length === 1 && indicatorPaint != null) {
                            var selectedPolyline = selectedItems[0];
                            if (this.isViewableAtSelectedLevel(selectedPolyline)) {
                                g2D.setPaint(indicatorPaint);
                                this.paintPointsResizeIndicators(g2D, selectedPolyline, indicatorPaint, planScale, selectedPolyline.isClosedPath(), angleAtStart, angleAtEnd, false);
                            }
                        }
                    }
                }
            }
        }
    };
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
    PlanComponent.prototype.paintArrow = function (g2D, point, angle, arrowStyle, thickness, arrowDelta) {
        if (arrowStyle != null && arrowStyle !== Polyline.ArrowStyle.NONE) {
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
    };
    /**
     * Paints dimension lines.
     * @param {Graphics2D} g2D
     * @param {DimensionLine[]} dimensionLines
     * @param {*[]} selectedItems
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
    PlanComponent.prototype.paintDimensionLines = function (g2D, dimensionLines, selectedItems, selectionOutlinePaint, selectionOutlineStroke, indicatorPaint, extensionLineStroke, planScale, backgroundColor, foregroundColor, paintMode, feedback) {
        var _this = this;
        if (paintMode === PlanComponent.PaintMode.CLIPBOARD) {
            dimensionLines = Home.getDimensionLinesSubList(selectedItems);
        }
        g2D.setPaint(foregroundColor);
        var dimensionLineStroke = new java.awt.BasicStroke(this.getStrokeWidth(DimensionLine, paintMode) / planScale);
        var previousFont = g2D.getFont();
        dimensionLines.forEach(function (dimensionLine) {
            if (_this.isViewableAtSelectedLevel(dimensionLine)) {
                var previousTransform = g2D.getTransform();
                var angle = Math.atan2(dimensionLine.getYEnd() - dimensionLine.getYStart(), dimensionLine.getXEnd() - dimensionLine.getXStart());
                var dimensionLineLength = dimensionLine.getLength();
                g2D.translate(dimensionLine.getXStart(), dimensionLine.getYStart());
                g2D.rotate(angle);
                g2D.translate(0, dimensionLine.getOffset());
                if (paintMode === PlanComponent.PaintMode.PAINT && _this.selectedItemsOutlinePainted && (selectedItems.indexOf((dimensionLine)) >= 0)) {
                    g2D.setPaint(selectionOutlinePaint);
                    g2D.setStroke(selectionOutlineStroke);
                    g2D.draw(new java.awt.geom.Line2D.Float(0, 0, dimensionLineLength, 0));
                    g2D.draw(PlanComponent.DIMENSION_LINE_END);
                    g2D.translate(dimensionLineLength, 0);
                    g2D.draw(PlanComponent.DIMENSION_LINE_END);
                    g2D.translate(-dimensionLineLength, 0);
                    g2D.draw(new java.awt.geom.Line2D.Float(0, -dimensionLine.getOffset(), 0, -5));
                    g2D.draw(new java.awt.geom.Line2D.Float(dimensionLineLength, -dimensionLine.getOffset(), dimensionLineLength, -5));
                    g2D.setPaint(foregroundColor);
                }
                g2D.setStroke(dimensionLineStroke);
                g2D.draw(new java.awt.geom.Line2D.Float(0, 0, dimensionLineLength, 0));
                g2D.draw(PlanComponent.DIMENSION_LINE_END);
                g2D.translate(dimensionLineLength, 0);
                g2D.draw(PlanComponent.DIMENSION_LINE_END);
                g2D.translate(-dimensionLineLength, 0);
                g2D.setStroke(extensionLineStroke);
                g2D.draw(new java.awt.geom.Line2D.Float(0, -dimensionLine.getOffset(), 0, -5));
                g2D.draw(new java.awt.geom.Line2D.Float(dimensionLineLength, -dimensionLine.getOffset(), dimensionLineLength, -5));
                var lengthText = _this.preferences.getLengthUnit().getFormat().format(dimensionLineLength);
                var lengthStyle = dimensionLine.getLengthStyle();
                if (lengthStyle == null) {
                    lengthStyle = _this.preferences.getDefaultTextStyle(dimensionLine.constructor);
                }
                if (feedback && _this.getFont() != null) {
                    lengthStyle = lengthStyle.deriveStyle(_this.getFont().getSize() / _this.getScale());
                }
                var font = _this.getFont(previousFont, lengthStyle);
                var lengthFontMetrics = _this.getFontMetrics(font, lengthStyle);
                var lengthTextBounds = lengthFontMetrics.getStringBounds(lengthText, g2D);
                var fontAscent = lengthFontMetrics.getAscent();
                g2D.translate((dimensionLineLength - lengthTextBounds.getWidth()) / 2, dimensionLine.getOffset() <= 0 ? -lengthFontMetrics.getDescent() - 1 : fontAscent + 1);
                if (feedback) {
                    g2D.setPaint(backgroundColor);
                    var oldComposite = _this.setTransparency(g2D, 0.7);
                    g2D.setStroke(new java.awt.BasicStroke(4 / planScale * _this.resolutionScale, java.awt.BasicStroke.CAP_SQUARE, java.awt.BasicStroke.CAP_ROUND));
                    var fontRenderContext = g2D.getFontRenderContext();
                    var textLayout = new java.awt.font.TextLayout(lengthText, font, fontRenderContext);
                    g2D.draw(textLayout.getOutline(new java.awt.geom.AffineTransform()));
                    g2D.setAlpha(oldComposite);
                    g2D.setPaint(foregroundColor);
                }
                g2D.setFont(font);
                g2D.drawString(lengthText, 0, 0);
                g2D.setTransform(previousTransform);
            }
        });
        g2D.setFont(previousFont);
        if (selectedItems.length === 1 && (selectedItems[0] != null && selectedItems[0] instanceof DimensionLine) && paintMode === PlanComponent.PaintMode.PAINT && indicatorPaint != null) {
            this.paintDimensionLineResizeIndicator(g2D, /* get */ selectedItems[0], indicatorPaint, planScale);
        }
    };
    /**
     * Paints resize indicator on a given dimension line.
     * @param {Graphics2D} g2D
     * @param {DimensionLine} dimensionLine
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @private
     */
    PlanComponent.prototype.paintDimensionLineResizeIndicator = function (g2D, dimensionLine, indicatorPaint, planScale) {
        if (this.resizeIndicatorVisible) {
            g2D.setPaint(indicatorPaint);
            g2D.setStroke(PlanComponent.INDICATOR_STROKE);
            var wallAngle = Math.atan2(dimensionLine.getYEnd() - dimensionLine.getYStart(), dimensionLine.getXEnd() - dimensionLine.getXStart());
            var previousTransform = g2D.getTransform();
            var scaleInverse = 1 / planScale * this.resolutionScale;
            g2D.translate(dimensionLine.getXStart(), dimensionLine.getYStart());
            g2D.rotate(wallAngle);
            g2D.translate(0, dimensionLine.getOffset());
            g2D.rotate(Math.PI);
            g2D.scale(scaleInverse, scaleInverse);
            var resizeIndicator = this.getIndicator(dimensionLine, PlanComponent.IndicatorType.RESIZE);
            g2D.draw(resizeIndicator);
            g2D.setTransform(previousTransform);
            g2D.translate(dimensionLine.getXEnd(), dimensionLine.getYEnd());
            g2D.rotate(wallAngle);
            g2D.translate(0, dimensionLine.getOffset());
            g2D.scale(scaleInverse, scaleInverse);
            g2D.draw(resizeIndicator);
            g2D.setTransform(previousTransform);
            g2D.translate((dimensionLine.getXStart() + dimensionLine.getXEnd()) / 2, (dimensionLine.getYStart() + dimensionLine.getYEnd()) / 2);
            g2D.rotate(wallAngle);
            g2D.translate(0, dimensionLine.getOffset());
            g2D.rotate(dimensionLine.getOffset() <= 0 ? Math.PI / 2 : -Math.PI / 2);
            g2D.scale(scaleInverse, scaleInverse);
            g2D.draw(resizeIndicator);
            g2D.setTransform(previousTransform);
        }
    };
    /**
     * Paints home labels.
     * @param {Graphics2D} g2D
     * @param {Label[]} labels
     * @param {*[]} selectedItems
     * @param {string|CanvasPattern} selectionOutlinePaint
     * @param {java.awt.BasicStroke} selectionOutlineStroke
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @param {string} foregroundColor
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    PlanComponent.prototype.paintLabels = function (g2D, labels, selectedItems, selectionOutlinePaint, selectionOutlineStroke, indicatorPaint, planScale, foregroundColor, paintMode) {
        var previousFont = g2D.getFont();
        for (var index192 = 0; index192 < labels.length; index192++) {
            var label = labels[index192];
            {
                if (this.isViewableAtSelectedLevel(label)) {
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
                        g2D.setPaint(color != null ? intToColorString(color) : foregroundColor);
                        this.paintText(g2D, label.constructor, labelText, labelStyle, label.getOutlineColor(), xLabel, yLabel, labelAngle, previousFont);
                        if (paintMode === PlanComponent.PaintMode.PAINT && this.selectedItemsOutlinePainted && selectedLabel) {
                            g2D.setPaint(selectionOutlinePaint);
                            g2D.setStroke(selectionOutlineStroke);
                            var textBounds = this.getTextBounds(labelText, labelStyle, xLabel, yLabel, labelAngle);
                            g2D.draw(ShapeTools.getShape(textBounds, true, null));
                            g2D.setPaint(foregroundColor);
                            if (indicatorPaint != null && selectedItems.length === 1 && selectedItems[0] === label) {
                                this.paintTextIndicators(g2D, label.constructor, this.getLineCount(labelText), labelStyle, xLabel, yLabel, labelAngle, indicatorPaint, planScale);
                                if (this.resizeIndicatorVisible && label.getPitch() != null) {
                                    var elevationIndicator = this.getIndicator(label, PlanComponent.IndicatorType.ELEVATE);
                                    if (elevationIndicator != null) {
                                        var previousTransform = g2D.getTransform();
                                        if (labelStyle.getAlignment() === TextStyle.Alignment.LEFT) {
                                            g2D.translate(textBounds[3][0], textBounds[3][1]);
                                        }
                                        else if (labelStyle.getAlignment() === TextStyle.Alignment.RIGHT) {
                                            g2D.translate(textBounds[2][0], textBounds[2][1]);
                                        }
                                        else {
                                            g2D.translate((textBounds[2][0] + textBounds[3][0]) / 2, (textBounds[2][1] + textBounds[3][1]) / 2);
                                        }
                                        var scaleInverse = 1 / planScale * this.resolutionScale;
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
        }
        g2D.setFont(previousFont);
    };
    /**
     * Paints the compass.
     * @param {Graphics2D} g2D
     * @param {*[]} selectedItems
     * @param {number} planScale
     * @param {string} foregroundColor
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    PlanComponent.prototype.paintCompass = function (g2D, selectedItems, planScale, foregroundColor, paintMode) {
        var compass = this.home.getCompass();
        if (compass.isVisible() && (paintMode !== PlanComponent.PaintMode.CLIPBOARD || selectedItems.indexOf(compass) >= 0)) {
            var previousTransform = g2D.getTransform();
            g2D.translate(compass.getX(), compass.getY());
            g2D.rotate(compass.getNorthDirection());
            var diameter = compass.getDiameter();
            g2D.scale(diameter, diameter);
            g2D.setColor(foregroundColor);
            g2D.fill(PlanComponent.COMPASS);
            g2D.setTransform(previousTransform);
        }
    };
    /**
     * Paints the outline of the compass when it's belongs to <code>items</code>.
     * @param {Graphics2D} g2D
     * @param {*[]} items
     * @param {string|CanvasPattern} selectionOutlinePaint
     * @param {java.awt.BasicStroke} selectionOutlineStroke
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @param {string} foregroundColor
     * @private
     */
    PlanComponent.prototype.paintCompassOutline = function (g2D, items, selectionOutlinePaint, selectionOutlineStroke, indicatorPaint, planScale, foregroundColor) {
        var compass = this.home.getCompass();
        if ((items.indexOf((compass)) >= 0) && compass.isVisible()) {
            var previousTransform = g2D.getTransform();
            g2D.translate(compass.getX(), compass.getY());
            g2D.rotate(compass.getNorthDirection());
            var diameter = compass.getDiameter();
            g2D.scale(diameter, diameter);
            g2D.setPaint(selectionOutlinePaint);
            g2D.setStroke(new java.awt.BasicStroke((5.5 + planScale) / diameter / planScale * this.resolutionScale));
            g2D.draw(PlanComponent.COMPASS_DISC);
            g2D.setColor(foregroundColor);
            g2D.setStroke(new java.awt.BasicStroke(1.0 / diameter / planScale * this.resolutionScale));
            g2D.draw(PlanComponent.COMPASS_DISC);
            g2D.setTransform(previousTransform);
            if (items.length === 1 && items[0] === compass) {
                g2D.setPaint(indicatorPaint);
                this.paintCompassIndicators(g2D, compass, indicatorPaint, planScale);
            }
        }
    };
    PlanComponent.prototype.paintCompassIndicators = function (g2D, compass, indicatorPaint, planScale) {
        if (this.resizeIndicatorVisible) {
            g2D.setPaint(indicatorPaint);
            g2D.setStroke(PlanComponent.INDICATOR_STROKE);
            var previousTransform = g2D.getTransform();
            var compassPoints = compass.getPoints();
            var scaleInverse = 1 / planScale * this.resolutionScale;
            g2D.translate((compassPoints[2][0] + compassPoints[3][0]) / 2, (compassPoints[2][1] + compassPoints[3][1]) / 2);
            g2D.scale(scaleInverse, scaleInverse);
            g2D.rotate(compass.getNorthDirection());
            g2D.draw(this.getIndicator(compass, PlanComponent.IndicatorType.ROTATE));
            g2D.setTransform(previousTransform);
            g2D.translate((compassPoints[1][0] + compassPoints[2][0]) / 2, (compassPoints[1][1] + compassPoints[2][1]) / 2);
            g2D.scale(scaleInverse, scaleInverse);
            g2D.rotate(compass.getNorthDirection());
            g2D.draw(this.getIndicator(compass, PlanComponent.IndicatorType.RESIZE));
            g2D.setTransform(previousTransform);
        }
    };
    /**
     * Paints wall location feedback.
     * @param {Graphics2D} g2D
     * @param {Wall} alignedWall
     * @param {java.awt.geom.Point2D} locationFeedback
     * @param {boolean} showPointFeedback
     * @param {string|CanvasPattern} feedbackPaint
     * @param {java.awt.BasicStroke} feedbackStroke
     * @param {number} planScale
     * @param {string|CanvasPattern} pointPaint
     * @param {java.awt.BasicStroke} pointStroke
     * @private
     */
    PlanComponent.prototype.paintWallAlignmentFeedback = function (g2D, alignedWall, locationFeedback, showPointFeedback, feedbackPaint, feedbackStroke, planScale, pointPaint, pointStroke) {
        if (locationFeedback != null) {
            var margin = 0.5 / planScale;
            var x = locationFeedback.getX();
            var y = locationFeedback.getY();
            var deltaXToClosestWall = Infinity;
            var deltaYToClosestWall = Infinity;
            {
                var array194 = this.getViewedItems(this.home.getWalls(), this.otherLevelsWallsCache);
                for (var index193 = 0; index193 < array194.length; index193++) {
                    var wall = array194[index193];
                    {
                        if (wall !== alignedWall) {
                            if (Math.abs(x - wall.getXStart()) < margin && (alignedWall == null || !this.equalsWallPoint(wall.getXStart(), wall.getYStart(), alignedWall))) {
                                if (Math.abs(deltaYToClosestWall) > Math.abs(y - wall.getYStart())) {
                                    deltaYToClosestWall = y - wall.getYStart();
                                }
                            }
                            else if (Math.abs(x - wall.getXEnd()) < margin && (alignedWall == null || !this.equalsWallPoint(wall.getXEnd(), wall.getYEnd(), alignedWall))) {
                                if (Math.abs(deltaYToClosestWall) > Math.abs(y - wall.getYEnd())) {
                                    deltaYToClosestWall = y - wall.getYEnd();
                                }
                            }
                            if (Math.abs(y - wall.getYStart()) < margin && (alignedWall == null || !this.equalsWallPoint(wall.getXStart(), wall.getYStart(), alignedWall))) {
                                if (Math.abs(deltaXToClosestWall) > Math.abs(x - wall.getXStart())) {
                                    deltaXToClosestWall = x - wall.getXStart();
                                }
                            }
                            else if (Math.abs(y - wall.getYEnd()) < margin && (alignedWall == null || !this.equalsWallPoint(wall.getXEnd(), wall.getYEnd(), alignedWall))) {
                                if (Math.abs(deltaXToClosestWall) > Math.abs(x - wall.getXEnd())) {
                                    deltaXToClosestWall = x - wall.getXEnd();
                                }
                            }
                            var wallPoints = wall.getPoints();
                            wallPoints = [wallPoints[0], wallPoints[(wallPoints.length / 2 | 0) - 1], wallPoints[(wallPoints.length / 2 | 0)], wallPoints[wallPoints.length - 1]];
                            for (var i = 0; i < wallPoints.length; i++) {
                                {
                                    if (Math.abs(x - wallPoints[i][0]) < margin && (alignedWall == null || !this.equalsWallPoint(wallPoints[i][0], wallPoints[i][1], alignedWall))) {
                                        if (Math.abs(deltaYToClosestWall) > Math.abs(y - wallPoints[i][1])) {
                                            deltaYToClosestWall = y - wallPoints[i][1];
                                        }
                                    }
                                    if (Math.abs(y - wallPoints[i][1]) < margin && (alignedWall == null || !this.equalsWallPoint(wallPoints[i][0], wallPoints[i][1], alignedWall))) {
                                        if (Math.abs(deltaXToClosestWall) > Math.abs(x - wallPoints[i][0])) {
                                            deltaXToClosestWall = x - wallPoints[i][0];
                                        }
                                    }
                                }
                                ;
                            }
                        }
                    }
                }
            }
            g2D.setPaint(feedbackPaint);
            g2D.setStroke(feedbackStroke);
            if (deltaXToClosestWall !== Infinity) {
                if (deltaXToClosestWall > 0) {
                    g2D.draw(new java.awt.geom.Line2D.Float(x + 25 / planScale, y, x - deltaXToClosestWall - 25 / planScale, y));
                }
                else {
                    g2D.draw(new java.awt.geom.Line2D.Float(x - 25 / planScale, y, x - deltaXToClosestWall + 25 / planScale, y));
                }
            }
            if (deltaYToClosestWall !== Infinity) {
                if (deltaYToClosestWall > 0) {
                    g2D.draw(new java.awt.geom.Line2D.Float(x, y + 25 / planScale, x, y - deltaYToClosestWall - 25 / planScale));
                }
                else {
                    g2D.draw(new java.awt.geom.Line2D.Float(x, y - 25 / planScale, x, y - deltaYToClosestWall + 25 / planScale));
                }
            }
            if (showPointFeedback) {
                this.paintPointFeedback(g2D, locationFeedback, feedbackPaint, planScale, pointPaint, pointStroke);
            }
        }
    };
    /**
     * Returns the items viewed in the plan at the selected level.
     * @param {*[]} homeItems
     * @param {*[]} otherLevelItems
     * @return {*[]}
     * @private
     */
    PlanComponent.prototype.getViewedItems = function (homeItems, otherLevelItems) {
        var viewedWalls = ([]);
        if (otherLevelItems != null) {
            /* addAll */ (function (l1, l2) { return l1.push.apply(l1, l2); })(viewedWalls, otherLevelItems);
        }
        for (var index195 = 0; index195 < homeItems.length; index195++) {
            var wall = homeItems[index195];
            {
                if (this.isViewableAtSelectedLevel(wall)) {
                    /* add */ (viewedWalls.push(wall) > 0);
                }
            }
        }
        return viewedWalls;
    };
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
    PlanComponent.prototype.paintPointFeedback = function (g2D, locationFeedback, feedbackPaint, planScale, pointPaint, pointStroke) {
        g2D.setPaint(pointPaint);
        g2D.setStroke(pointStroke);
        var circle = new java.awt.geom.Ellipse2D.Float(locationFeedback.getX() - 10.0 / planScale, locationFeedback.getY() - 10.0 / planScale, 20.0 / planScale, 20.0 / planScale);
        g2D.fill(circle);
        g2D.setPaint(feedbackPaint);
        g2D.setStroke(new java.awt.BasicStroke(1 / planScale * this.resolutionScale));
        g2D.draw(circle);
        g2D.draw(new java.awt.geom.Line2D.Float(locationFeedback.getX(), locationFeedback.getY() - 5.0 / planScale, locationFeedback.getX(), locationFeedback.getY() + 5.0 / planScale));
        g2D.draw(new java.awt.geom.Line2D.Float(locationFeedback.getX() - 5.0 / planScale, locationFeedback.getY(), locationFeedback.getX() + 5.0 / planScale, locationFeedback.getY()));
    };
    /**
     * Returns <code>true</code> if <code>wall</code> start or end point
     * equals the point (<code>x</code>, <code>y</code>).
     * @param {number} x
     * @param {number} y
     * @param {Wall} wall
     * @return {boolean}
     * @private
     */
    PlanComponent.prototype.equalsWallPoint = function (x, y, wall) {
        return x === wall.getXStart() && y === wall.getYStart() || x === wall.getXEnd() && y === wall.getYEnd();
    };
    /**
     * Paints room location feedback.
     * @param {Graphics2D} g2D
     * @param {Room} alignedRoom
     * @param {java.awt.geom.Point2D} locationFeedback
     * @param {boolean} showPointFeedback
     * @param {string|CanvasPattern} feedbackPaint
     * @param {java.awt.BasicStroke} feedbackStroke
     * @param {number} planScale
     * @param {string|CanvasPattern} pointPaint
     * @param {java.awt.BasicStroke} pointStroke
     * @private
     */
    PlanComponent.prototype.paintRoomAlignmentFeedback = function (g2D, alignedRoom, locationFeedback, showPointFeedback, feedbackPaint, feedbackStroke, planScale, pointPaint, pointStroke) {
        if (locationFeedback != null) {
            var margin = 0.5 / planScale;
            var x = locationFeedback.getX();
            var y = locationFeedback.getY();
            var deltaXToClosestObject = Infinity;
            var deltaYToClosestObject = Infinity;
            {
                var array197 = this.getViewedItems(this.home.getRooms(), this.otherLevelsRoomsCache);
                for (var index196 = 0; index196 < array197.length; index196++) {
                    var room = array197[index196];
                    {
                        var roomPoints = room.getPoints();
                        var editedPointIndex = -1;
                        if (room === alignedRoom) {
                            for (var i = 0; i < roomPoints.length; i++) {
                                {
                                    if (roomPoints[i][0] === x && roomPoints[i][1] === y) {
                                        editedPointIndex = i;
                                        break;
                                    }
                                }
                                ;
                            }
                        }
                        for (var i = 0; i < roomPoints.length; i++) {
                            {
                                if (editedPointIndex === -1 || (i !== editedPointIndex && roomPoints.length > 2)) {
                                    if (Math.abs(x - roomPoints[i][0]) < margin && Math.abs(deltaYToClosestObject) > Math.abs(y - roomPoints[i][1])) {
                                        deltaYToClosestObject = y - roomPoints[i][1];
                                    }
                                    if (Math.abs(y - roomPoints[i][1]) < margin && Math.abs(deltaXToClosestObject) > Math.abs(x - roomPoints[i][0])) {
                                        deltaXToClosestObject = x - roomPoints[i][0];
                                    }
                                }
                            }
                            ;
                        }
                    }
                }
            }
            {
                var array199 = this.getViewedItems(this.home.getWalls(), this.otherLevelsWallsCache);
                for (var index198 = 0; index198 < array199.length; index198++) {
                    var wall = array199[index198];
                    {
                        var wallPoints = wall.getPoints();
                        wallPoints = [wallPoints[0], wallPoints[(wallPoints.length / 2 | 0) - 1], wallPoints[(wallPoints.length / 2 | 0)], wallPoints[wallPoints.length - 1]];
                        for (var i = 0; i < wallPoints.length; i++) {
                            {
                                if (Math.abs(x - wallPoints[i][0]) < margin && Math.abs(deltaYToClosestObject) > Math.abs(y - wallPoints[i][1])) {
                                    deltaYToClosestObject = y - wallPoints[i][1];
                                }
                                if (Math.abs(y - wallPoints[i][1]) < margin && Math.abs(deltaXToClosestObject) > Math.abs(x - wallPoints[i][0])) {
                                    deltaXToClosestObject = x - wallPoints[i][0];
                                }
                            }
                            ;
                        }
                    }
                }
            }
            g2D.setPaint(feedbackPaint);
            g2D.setStroke(feedbackStroke);
            if (deltaXToClosestObject !== Infinity) {
                if (deltaXToClosestObject > 0) {
                    g2D.draw(new java.awt.geom.Line2D.Float(x + 25 / planScale, y, x - deltaXToClosestObject - 25 / planScale, y));
                }
                else {
                    g2D.draw(new java.awt.geom.Line2D.Float(x - 25 / planScale, y, x - deltaXToClosestObject + 25 / planScale, y));
                }
            }
            if (deltaYToClosestObject !== Infinity) {
                if (deltaYToClosestObject > 0) {
                    g2D.draw(new java.awt.geom.Line2D.Float(x, y + 25 / planScale, x, y - deltaYToClosestObject - 25 / planScale));
                }
                else {
                    g2D.draw(new java.awt.geom.Line2D.Float(x, y - 25 / planScale, x, y - deltaYToClosestObject + 25 / planScale));
                }
            }
            if (showPointFeedback) {
                this.paintPointFeedback(g2D, locationFeedback, feedbackPaint, planScale, pointPaint, pointStroke);
            }
        }
    };
    /**
     * Paints dimension line location feedback.
     * @param {Graphics2D} g2D
     * @param {DimensionLine} alignedDimensionLine
     * @param {java.awt.geom.Point2D} locationFeedback
     * @param {boolean} showPointFeedback
     * @param {string|CanvasPattern} feedbackPaint
     * @param {java.awt.BasicStroke} feedbackStroke
     * @param {number} planScale
     * @param {string|CanvasPattern} pointPaint
     * @param {java.awt.BasicStroke} pointStroke
     * @private
     */
    PlanComponent.prototype.paintDimensionLineAlignmentFeedback = function (g2D, alignedDimensionLine, locationFeedback, showPointFeedback, feedbackPaint, feedbackStroke, planScale, pointPaint, pointStroke) {
        var _this = this;
        if (locationFeedback != null) {
            var margin_1 = 0.5 / planScale;
            var x_1 = locationFeedback.getX();
            var y_1 = locationFeedback.getY();
            var deltaXToClosestObject_1 = Infinity;
            var deltaYToClosestObject_1 = Infinity;
            this.getViewedItems(this.home.getRooms(), this.otherLevelsRoomsCache).forEach(function (room) {
                var roomPoints = room.getPoints();
                for (var i = 0; i < roomPoints.length; i++) {
                    if (Math.abs(x_1 - roomPoints[i][0]) < margin_1 && Math.abs(deltaYToClosestObject_1) > Math.abs(y_1 - roomPoints[i][1])) {
                        deltaYToClosestObject_1 = y_1 - roomPoints[i][1];
                    }
                    if (Math.abs(y_1 - roomPoints[i][1]) < margin_1 && Math.abs(deltaXToClosestObject_1) > Math.abs(x_1 - roomPoints[i][0])) {
                        deltaXToClosestObject_1 = x_1 - roomPoints[i][0];
                    }
                }
            });
            this.home.getDimensionLines().forEach(function (dimensionLine) {
                if (_this.isViewableAtSelectedLevel(dimensionLine) && dimensionLine !== alignedDimensionLine) {
                    if (Math.abs(x_1 - dimensionLine.getXStart()) < margin_1 && (alignedDimensionLine == null || !_this.equalsDimensionLinePoint(dimensionLine.getXStart(), dimensionLine.getYStart(), alignedDimensionLine))) {
                        if (Math.abs(deltaYToClosestObject_1) > Math.abs(y_1 - dimensionLine.getYStart())) {
                            deltaYToClosestObject_1 = y_1 - dimensionLine.getYStart();
                        }
                    }
                    else if (Math.abs(x_1 - dimensionLine.getXEnd()) < margin_1 && (alignedDimensionLine == null || !_this.equalsDimensionLinePoint(dimensionLine.getXEnd(), dimensionLine.getYEnd(), alignedDimensionLine))) {
                        if (Math.abs(deltaYToClosestObject_1) > Math.abs(y_1 - dimensionLine.getYEnd())) {
                            deltaYToClosestObject_1 = y_1 - dimensionLine.getYEnd();
                        }
                    }
                    if (Math.abs(y_1 - dimensionLine.getYStart()) < margin_1 && (alignedDimensionLine == null || !_this.equalsDimensionLinePoint(dimensionLine.getXStart(), dimensionLine.getYStart(), alignedDimensionLine))) {
                        if (Math.abs(deltaXToClosestObject_1) > Math.abs(x_1 - dimensionLine.getXStart())) {
                            deltaXToClosestObject_1 = x_1 - dimensionLine.getXStart();
                        }
                    }
                    else if (Math.abs(y_1 - dimensionLine.getYEnd()) < margin_1 && (alignedDimensionLine == null || !_this.equalsDimensionLinePoint(dimensionLine.getXEnd(), dimensionLine.getYEnd(), alignedDimensionLine))) {
                        if (Math.abs(deltaXToClosestObject_1) > Math.abs(x_1 - dimensionLine.getXEnd())) {
                            deltaXToClosestObject_1 = x_1 - dimensionLine.getXEnd();
                        }
                    }
                }
            });
            this.getViewedItems(this.home.getWalls(), this.otherLevelsWallsCache).forEach(function (wall) {
                var wallPoints = wall.getPoints();
                wallPoints = [wallPoints[0], wallPoints[(wallPoints.length / 2 | 0) - 1], wallPoints[(wallPoints.length / 2 | 0)], wallPoints[wallPoints.length - 1]];
                for (var i = 0; i < wallPoints.length; i++) {
                    if (Math.abs(x_1 - wallPoints[i][0]) < margin_1 && Math.abs(deltaYToClosestObject_1) > Math.abs(y_1 - wallPoints[i][1])) {
                        deltaYToClosestObject_1 = y_1 - wallPoints[i][1];
                    }
                    if (Math.abs(y_1 - wallPoints[i][1]) < margin_1 && Math.abs(deltaXToClosestObject_1) > Math.abs(x_1 - wallPoints[i][0])) {
                        deltaXToClosestObject_1 = x_1 - wallPoints[i][0];
                    }
                }
            });
            this.home.getFurniture().forEach(function (piece) {
                if (piece.isVisible() && _this.isViewableAtSelectedLevel(piece)) {
                    var piecePoints = piece.getPoints();
                    for (var i = 0; i < piecePoints.length; i++) {
                        if (Math.abs(x_1 - piecePoints[i][0]) < margin_1 && Math.abs(deltaYToClosestObject_1) > Math.abs(y_1 - piecePoints[i][1])) {
                            deltaYToClosestObject_1 = y_1 - piecePoints[i][1];
                        }
                        if (Math.abs(y_1 - piecePoints[i][1]) < margin_1 && Math.abs(deltaXToClosestObject_1) > Math.abs(x_1 - piecePoints[i][0])) {
                            deltaXToClosestObject_1 = x_1 - piecePoints[i][0];
                        }
                    }
                }
            });
            g2D.setPaint(feedbackPaint);
            g2D.setStroke(feedbackStroke);
            if (deltaXToClosestObject_1 !== Infinity) {
                if (deltaXToClosestObject_1 > 0) {
                    g2D.draw(new java.awt.geom.Line2D.Float(x_1 + 25 / planScale, y_1, x_1 - deltaXToClosestObject_1 - 25 / planScale, y_1));
                }
                else {
                    g2D.draw(new java.awt.geom.Line2D.Float(x_1 - 25 / planScale, y_1, x_1 - deltaXToClosestObject_1 + 25 / planScale, y_1));
                }
            }
            if (deltaYToClosestObject_1 !== Infinity) {
                if (deltaYToClosestObject_1 > 0) {
                    g2D.draw(new java.awt.geom.Line2D.Float(x_1, y_1 + 25 / planScale, x_1, y_1 - deltaYToClosestObject_1 - 25 / planScale));
                }
                else {
                    g2D.draw(new java.awt.geom.Line2D.Float(x_1, y_1 - 25 / planScale, x_1, y_1 - deltaYToClosestObject_1 + 25 / planScale));
                }
            }
            if (showPointFeedback) {
                this.paintPointFeedback(g2D, locationFeedback, feedbackPaint, planScale, pointPaint, pointStroke);
            }
        }
    };
    /**
     * Returns <code>true</code> if <code>dimensionLine</code> start or end point
     * equals the point (<code>x</code>, <code>y</code>).
     * @param {number} x
     * @param {number} y
     * @param {DimensionLine} dimensionLine
     * @return {boolean}
     * @private
     */
    PlanComponent.prototype.equalsDimensionLinePoint = function (x, y, dimensionLine) {
        return x === dimensionLine.getXStart() && y === dimensionLine.getYStart() || x === dimensionLine.getXEnd() && y === dimensionLine.getYEnd();
    };
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
    PlanComponent.prototype.paintAngleFeedback = function (g2D, center, point1, point2, planScale, selectionColor) {
        g2D.setColor(selectionColor);
        g2D.setStroke(new java.awt.BasicStroke(1 / planScale * this.resolutionScale));
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
        g2D.draw(new java.awt.geom.Arc2D.Double(-radius, -radius, radius * 2, radius * 2, /* toDegrees */ (function (x) { return x * 180 / Math.PI; })(angle1), /* toDegrees */ (function (x) { return x * 180 / Math.PI; })(extent), java.awt.geom.Arc2D.OPEN));
        radius += 5 / planScale;
        g2D.draw(new java.awt.geom.Line2D.Double(0, 0, radius * Math.cos(angle1), -radius * Math.sin(angle1)));
        g2D.draw(new java.awt.geom.Line2D.Double(0, 0, radius * Math.cos(angle1 + extent), -radius * Math.sin(angle1 + extent)));
        g2D.setTransform(previousTransform);
    };
    /**
     * Paints the observer camera at its current location, if home camera is the observer camera.
     * @param {Graphics2D} g2D
     * @param {*[]} selectedItems
     * @param {string|CanvasPattern} selectionOutlinePaint
     * @param {java.awt.Stroke} selectionOutlineStroke
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @param {string} backgroundColor
     * @param {string} foregroundColor
     * @private
     */
    PlanComponent.prototype.paintCamera = function (g2D, selectedItems, selectionOutlinePaint, selectionOutlineStroke, indicatorPaint, planScale, backgroundColor, foregroundColor) {
        var camera = this.home.getObserverCamera();
        if (camera === this.home.getCamera()) {
            var previousTransform = g2D.getTransform();
            g2D.translate(camera.getX(), camera.getY());
            g2D.rotate(camera.getYaw());
            var points = camera.getPoints();
            var yScale = java.awt.geom.Point2D.distance(points[0][0], points[0][1], points[3][0], points[3][1]);
            var xScale = java.awt.geom.Point2D.distance(points[0][0], points[0][1], points[1][0], points[1][1]);
            var cameraTransform = java.awt.geom.AffineTransform.getScaleInstance(xScale, yScale);
            var scaledCameraBody = new java.awt.geom.Area(PlanComponent.CAMERA_BODY).createTransformedArea(cameraTransform);
            var scaledCameraHead = new java.awt.geom.Area(PlanComponent.CAMERA_HEAD).createTransformedArea(cameraTransform);
            g2D.setPaint(backgroundColor);
            g2D.fill(scaledCameraBody);
            g2D.setPaint(foregroundColor);
            var stroke = new java.awt.BasicStroke(this.getStrokeWidth(ObserverCamera, PlanComponent.PaintMode.PAINT) / planScale);
            g2D.setStroke(stroke);
            g2D.draw(scaledCameraBody);
            if ((selectedItems.indexOf((camera)) >= 0) && this.selectedItemsOutlinePainted) {
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
            if (selectedItems.length === 1 && selectedItems[0] === camera) {
                this.paintCameraRotationIndicators(g2D, camera, indicatorPaint, planScale);
            }
        }
    };
    PlanComponent.prototype.paintCameraRotationIndicators = function (g2D, camera, indicatorPaint, planScale) {
        if (this.resizeIndicatorVisible) {
            g2D.setPaint(indicatorPaint);
            g2D.setStroke(PlanComponent.INDICATOR_STROKE);
            var previousTransform = g2D.getTransform();
            var cameraPoints = camera.getPoints();
            var scaleInverse = 1 / planScale * this.resolutionScale;
            g2D.translate((cameraPoints[0][0] + cameraPoints[3][0]) / 2, (cameraPoints[0][1] + cameraPoints[3][1]) / 2);
            g2D.scale(scaleInverse, scaleInverse);
            g2D.rotate(camera.getYaw());
            g2D.draw(this.getIndicator(camera, PlanComponent.IndicatorType.ROTATE));
            g2D.setTransform(previousTransform);
            g2D.translate((cameraPoints[1][0] + cameraPoints[2][0]) / 2, (cameraPoints[1][1] + cameraPoints[2][1]) / 2);
            g2D.scale(scaleInverse, scaleInverse);
            g2D.rotate(camera.getYaw());
            g2D.draw(this.getIndicator(camera, PlanComponent.IndicatorType.ROTATE_PITCH));
            g2D.setTransform(previousTransform);
            var elevationIndicator = this.getIndicator(camera, PlanComponent.IndicatorType.ELEVATE);
            if (elevationIndicator != null) {
                g2D.translate((cameraPoints[0][0] + cameraPoints[1][0]) / 2, (cameraPoints[0][1] + cameraPoints[1][1]) / 2);
                g2D.scale(scaleInverse, scaleInverse);
                g2D.draw(PlanComponent.POINT_INDICATOR);
                g2D.translate(Math.sin(camera.getYaw()) * 8, -Math.cos(camera.getYaw()) * 8);
                g2D.draw(elevationIndicator);
                g2D.setTransform(previousTransform);
            }
        }
    };
    /**
     * Paints rectangle feedback.
     * @param {Graphics2D} g2D
     * @param {string} selectionColor
     * @param {number} planScale
     * @private
     */
    PlanComponent.prototype.paintRectangleFeedback = function (g2D, selectionColor, planScale) {
        if (this.rectangleFeedback != null) {
            g2D.setPaint(selectionColor + "20"); // add alpha
            g2D.fill(this.rectangleFeedback);
            g2D.setPaint(selectionColor);
            g2D.setStroke(new java.awt.BasicStroke(1 / planScale * this.resolutionScale));
            g2D.draw(this.rectangleFeedback);
        }
    };
    /**
     * Sets rectangle selection feedback coordinates.
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     */
    PlanComponent.prototype.setRectangleFeedback = function (x0, y0, x1, y1) {
        this.rectangleFeedback = new java.awt.geom.Rectangle2D.Float(x0, y0, 0, 0);
        this.rectangleFeedback.add(x1, y1);
        this.repaint();
    };
    /**
     * Ensures selected items are visible at screen and moves
     * scroll bars if needed.
     */
    PlanComponent.prototype.makeSelectionVisible = function () {
        var _this = this;
        if (!this.selectionScrollUpdated) {
            this.selectionScrollUpdated = true;
            java.awt.EventQueue.invokeLater(function () {
                _this.selectionScrollUpdated = false;
                var selectionBounds = _this.getSelectionBounds(true);
                if (selectionBounds != null) {
                    var pixelBounds = _this.getShapePixelBounds(selectionBounds);
                    pixelBounds.grow(5, 5);
                    var visibleRectangle = _this.getVisibleRect();
                    if (!pixelBounds.intersects(visibleRectangle)) {
                        _this.scrollRectToVisible(pixelBounds);
                    }
                }
            });
        }
    };
    /**
     * Returns the bounds of the selected items.
     * @param {boolean} includeCamera
     * @return {java.awt.geom.Rectangle2D}
     * @private
     */
    PlanComponent.prototype.getSelectionBounds = function (includeCamera) {
        var _this = this;
        var g = this.getGraphics();
        if (g != null) {
            this.setRenderingHints(g);
        }
        if (includeCamera) {
            return this.getItemsBounds(g, this.home.getSelectedItems());
        }
        else {
            var selectedItems = (this.home.getSelectedItems().slice(0));
            /* remove */ (function (a) { var index = a.indexOf(_this.home.getCamera()); if (index >= 0) {
                a.splice(index, 1);
                return true;
            }
            else {
                return false;
            } })(selectedItems);
            return this.getItemsBounds(g, selectedItems);
        }
    };
    /**
     * Ensures the point at (<code>x</code>, <code>y</code>) is visible,
     * moving scroll bars if needed.
     * @param {number} x
     * @param {number} y
     */
    PlanComponent.prototype.makePointVisible = function (x, y) {
        this.scrollRectToVisible(this.getShapePixelBounds(new java.awt.geom.Rectangle2D.Float(x, y, 1 / this.getScale(), 1 / this.getScale())));
    };
    /**
     * Moves the view from (dx, dy) unit in the scrolling zone it belongs to.
     * @param {number} dx
     * @param {number} dy
     */
    PlanComponent.prototype.moveView = function (dx, dy) {
        if (this.getParent() != null && this.getParent() instanceof javax.swing.JViewport) {
            var viewport = this.getParent();
            var viewRectangle = viewport.getViewRect();
            viewRectangle.translate(Math.round(dx * this.getScale()), Math.round(dy * this.getScale()));
            viewRectangle.x = Math.min(Math.max(0, viewRectangle.x), this.getWidth() - viewRectangle.width);
            viewRectangle.y = Math.min(Math.max(0, viewRectangle.y), this.getHeight() - viewRectangle.height);
            viewport.setViewPosition(viewRectangle.getLocation());
        }
    };
    /**
     * Returns the scale used to display the plan.
     * @return {number}
     */
    PlanComponent.prototype.getScale = function () {
        return this.scale;
    };
    /**
     * Sets the scale used to display the plan.
     * If this component is displayed in a viewport the view position is updated
     * to ensure the center's view will remain the same after the scale change.
     * @param {number} scale
     */
    PlanComponent.prototype.setScale = function (scale) {
        if (this.scale !== scale) {
            var parent_1 = null;
            var viewRectangle = null;
            var xViewCenterPosition = 0;
            var yViewCenterPosition = 0;
            if (this.getParent() != null && this.getParent() instanceof javax.swing.JViewport) {
                parent_1 = this.getParent();
                viewRectangle = parent_1.getViewRect();
                xViewCenterPosition = this.convertXPixelToModel(viewRectangle.x + (viewRectangle.width / 2 | 0));
                yViewCenterPosition = this.convertYPixelToModel(viewRectangle.y + (viewRectangle.height / 2 | 0));
            }
            this.scale = scale;
            this.revalidate();
            if (parent_1 != null && parent_1 instanceof javax.swing.JViewport) {
                var viewSize = parent_1.getViewSize();
                var viewWidth = this.convertXPixelToModel(viewRectangle.x + viewRectangle.width) - this.convertXPixelToModel(viewRectangle.x);
                var xViewLocation = Math.max(0, Math.min(this.convertXModelToPixel(xViewCenterPosition - viewWidth / 2), viewSize.width - viewRectangle.x));
                var viewHeight = this.convertYPixelToModel(viewRectangle.y + viewRectangle.height) - this.convertYPixelToModel(viewRectangle.y);
                var yViewLocation = Math.max(0, Math.min(this.convertYModelToPixel(yViewCenterPosition - viewHeight / 2), viewSize.height - viewRectangle.y));
                parent_1.setViewPosition(new java.awt.Point(xViewLocation, yViewLocation));
            }
        }
    };
    /**
     * Returns <code>x</code> converted in model coordinates space.
     * @param {number} x
     * @return {number}
     */
    PlanComponent.prototype.convertXPixelToModel = function (x) {
        var insets = this.getInsets();
        var planBounds = this.getPlanBounds();
        return (x - insets.left) / this.getScale() - PlanComponent.MARGIN + planBounds.getMinX();
    };
    /**
     * Returns <code>y</code> converted in model coordinates space.
     * @param {number} y
     * @return {number}
     */
    PlanComponent.prototype.convertYPixelToModel = function (y) {
        var insets = this.getInsets();
        var planBounds = this.getPlanBounds();
        return (y - insets.top) / this.getScale() - PlanComponent.MARGIN + planBounds.getMinY();
    };
    /**
     * Returns <code>x</code> converted in view coordinates space.
     * @param {number} x
     * @return {number}
     * @private
     */
    PlanComponent.prototype.convertXModelToPixel = function (x) {
        var insets = this.getInsets();
        var planBounds = this.getPlanBounds();
        return (Math.round((x - planBounds.getMinX() + PlanComponent.MARGIN) * this.getScale()) | 0) + insets.left;
    };
    /**
     * Returns <code>y</code> converted in view coordinates space.
     * @param {number} y
     * @return {number}
     * @private
     */
    PlanComponent.prototype.convertYModelToPixel = function (y) {
        var insets = this.getInsets();
        var planBounds = this.getPlanBounds();
        return (Math.round((y - planBounds.getMinY() + PlanComponent.MARGIN) * this.getScale()) | 0) + insets.top;
    };
    /**
     * Returns <code>x</code> converted in screen coordinates space.
     * @param {number} x
     * @return {number}
     */
    PlanComponent.prototype.convertXModelToScreen = function (x) {
        var point = new java.awt.Point(this.convertXModelToPixel(x), 0);
        javax.swing.SwingUtilities.convertPointToScreen(point, this);
        return point.x;
    };
    /**
     * Returns <code>y</code> converted in screen coordinates space.
     * @param {number} y
     * @return {number}
     */
    PlanComponent.prototype.convertYModelToScreen = function (y) {
        var point = new java.awt.Point(0, this.convertYModelToPixel(y));
        javax.swing.SwingUtilities.convertPointToScreen(point, this);
        return point.y;
    };
    /**
     * Returns the length in centimeters of a pixel with the current scale.
     * @return {number}
     */
    PlanComponent.prototype.getPixelLength = function () {
        return 1 / this.getScale();
    };
    /**
     * Returns the bounds of <code>shape</code> in pixels coordinates space.
     * @param {Object} shape
     * @return {java.awt.Rectangle}
     * @private
     */
    PlanComponent.prototype.getShapePixelBounds = function (shape) {
        var shapeBounds = shape.getBounds2D();
        return new java.awt.Rectangle(this.convertXModelToPixel(shapeBounds.getMinX()), this.convertYModelToPixel(shapeBounds.getMinY()), (Math.round(shapeBounds.getWidth() * this.getScale()) | 0), (Math.round(shapeBounds.getHeight() * this.getScale()) | 0));
    };
    /**
     * Sets the cursor of this component.
     * @param {PlanView.CursorType|string} cursorType
     */
    PlanComponent.prototype.setCursor = function (cursorType) {
        if (typeof cursorType == "string") {
            this.canvas.style.cursor = cursorType;
        }
        else {
            switch ((cursorType)) {
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
    };
    /**
     * Set tool tip edition.
     * @param {Array} toolTipEditedProperties
     * @param {Array} toolTipPropertyValues
     * @param {number} x
     * @param {number} y
     */
    PlanComponent.prototype.setToolTipEditedProperties = function (toolTipEditedProperties, toolTipPropertyValues, x, y) {
        // TODO
    };
    /**
     * Deletes tool tip text from screen.
     */
    PlanComponent.prototype.deleteToolTipFeedback = function () {
        // TODO
    };
    /**
     * Sets whether the resize indicator of selected wall or piece of furniture
     * should be visible or not.
     * @param {boolean} resizeIndicatorVisible
     */
    PlanComponent.prototype.setResizeIndicatorVisible = function (resizeIndicatorVisible) {
        this.resizeIndicatorVisible = resizeIndicatorVisible;
        this.repaint();
    };
    /**
     * Sets the location point for alignment feedback.
     * @param {Object} alignedObjectClass
     * @param {Object} alignedObject
     * @param {number} x
     * @param {number} y
     * @param {boolean} showPointFeedback
     */
    PlanComponent.prototype.setAlignmentFeedback = function (alignedObjectClass, alignedObject, x, y, showPointFeedback) {
        this.alignedObjectClass = alignedObjectClass;
        this.alignedObjectFeedback = alignedObject;
        this.locationFeeback = new java.awt.geom.Point2D.Float(x, y);
        this.showPointFeedback = showPointFeedback;
        this.repaint();
    };
    /**
     * Sets the points used to draw an angle in plan view.
     * @param {number} xCenter
     * @param {number} yCenter
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     */
    PlanComponent.prototype.setAngleFeedback = function (xCenter, yCenter, x1, y1, x2, y2) {
        this.centerAngleFeedback = new java.awt.geom.Point2D.Float(xCenter, yCenter);
        this.point1AngleFeedback = new java.awt.geom.Point2D.Float(x1, y1);
        this.point2AngleFeedback = new java.awt.geom.Point2D.Float(x2, y2);
    };
    /**
     * Sets the feedback of dragged items drawn during a drag and drop operation,
     * initiated from outside of plan view.
     * @param {*[]} draggedItems
     */
    PlanComponent.prototype.setDraggedItemsFeedback = function (draggedItems) {
        this.draggedItemsFeedback = draggedItems;
        this.repaint();
    };
    /**
     * Sets the given dimension lines to be drawn as feedback.
     * @param {DimensionLine[]} dimensionLines
     */
    PlanComponent.prototype.setDimensionLinesFeedback = function (dimensionLines) {
        this.dimensionLinesFeedback = dimensionLines;
        this.repaint();
    };
    /**
     * Deletes all elements shown as feedback.
     */
    PlanComponent.prototype.deleteFeedback = function () {
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
    };
    /**
     * Returns <code>true</code>.
     * @param {*[]} items
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    PlanComponent.prototype.canImportDraggedItems = function (items, x, y) {
        return true;
    };
    /**
     * Returns the size of the given piece of furniture in the horizontal plan,
     * or <code>null</code> if the view isn't able to compute such a value.
     * @param {HomePieceOfFurniture} piece
     * @return {Array}
     */
    PlanComponent.prototype.getPieceOfFurnitureSizeInPlan = function (piece) {
        if (piece.getRoll() === 0 && piece.getPitch() === 0) {
            return [piece.getWidth(), piece.getDepth(), piece.getHeight()];
        }
        else if (!this.isFurnitureSizeInPlanSupported()) {
            return null;
        }
        else {
            return PlanComponent.PieceOfFurnitureModelIcon.computePieceOfFurnitureSizeInPlan(piece, this.object3dFactory);
        }
    };
    /**
     * Returns <code>true</code> if this component is able to compute the size of horizontally rotated furniture.
     * @return {boolean}
     */
    PlanComponent.prototype.isFurnitureSizeInPlanSupported = function () {
        try {
            return !javaemul.internal.BooleanHelper.getBoolean("com.eteks.sweethome3d.no3D");
        }
        catch (ex) {
            return false;
        }
        ;
    };
    PlanComponent.prototype.getPreferredScrollableViewportSize = function () {
        return this.getPreferredSize();
    };
    PlanComponent.prototype.getScrollableBlockIncrement = function (visibleRect, orientation, direction) {
        if (orientation === javax.swing.SwingConstants.HORIZONTAL) {
            return (visibleRect.width / 2 | 0);
        }
        else {
            return (visibleRect.height / 2 | 0);
        }
    };
    PlanComponent.prototype.getScrollableTracksViewportHeight = function () {
        return (this.getParent() != null && this.getParent() instanceof javax.swing.JViewport) && this.getPreferredSize().height < this.getParent().getHeight();
    };
    PlanComponent.prototype.getScrollableTracksViewportWidth = function () {
        return (this.getParent() != null && this.getParent() instanceof javax.swing.JViewport) && this.getPreferredSize().width < this.getParent().getWidth();
    };
    PlanComponent.prototype.getScrollableUnitIncrement = function (visibleRect, orientation, direction) {
        if (orientation === javax.swing.SwingConstants.HORIZONTAL) {
            return (visibleRect.width / 10 | 0);
        }
        else {
            return (visibleRect.height / 10 | 0);
        }
    };
    /**
     * Returns the component used as an horizontal ruler for this plan.
     * @return {Object}
     */
    PlanComponent.prototype.getHorizontalRuler = function () {
        if (this.horizontalRuler == null) {
            this.horizontalRuler = new PlanComponent.PlanRulerComponent(this, javax.swing.SwingConstants.HORIZONTAL);
        }
        return this.horizontalRuler;
    };
    /**
     * Returns the component used as a vertical ruler for this plan.
     * @return {Object}
     */
    PlanComponent.prototype.getVerticalRuler = function () {
        if (this.verticalRuler == null) {
            this.verticalRuler = new PlanComponent.PlanRulerComponent(this, javax.swing.SwingConstants.VERTICAL);
        }
        return this.verticalRuler;
    };
    PlanComponent.__static_initialized = false;
    PlanComponent.MARGIN = 40;
    PlanComponent.POINT_INDICATOR = null;
    PlanComponent.FURNITURE_ROTATION_INDICATOR = null;
    PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR = null;
    PlanComponent.FURNITURE_ROLL_ROTATION_INDICATOR = null;
    PlanComponent.FURNITURE_RESIZE_INDICATOR = null;
    PlanComponent.ELEVATION_INDICATOR = null;
    PlanComponent.ELEVATION_POINT_INDICATOR = null;
    PlanComponent.FURNITURE_HEIGHT_INDICATOR = null;
    PlanComponent.FURNITURE_HEIGHT_POINT_INDICATOR = null;
    PlanComponent.LIGHT_POWER_INDICATOR = null;
    PlanComponent.LIGHT_POWER_POINT_INDICATOR = null;
    PlanComponent.WALL_ORIENTATION_INDICATOR = null;
    PlanComponent.WALL_POINT = null;
    PlanComponent.WALL_ARC_EXTENT_INDICATOR = null;
    PlanComponent.WALL_AND_LINE_RESIZE_INDICATOR = null;
    PlanComponent.CAMERA_YAW_ROTATION_INDICATOR = null;
    PlanComponent.CAMERA_PITCH_ROTATION_INDICATOR = null;
    PlanComponent.CAMERA_ELEVATION_INDICATOR = null;
    PlanComponent.CAMERA_BODY = null;
    PlanComponent.CAMERA_HEAD = null;
    PlanComponent.DIMENSION_LINE_END = null;
    PlanComponent.TEXT_LOCATION_INDICATOR = null;
    PlanComponent.TEXT_ANGLE_INDICATOR = null;
    PlanComponent.LABEL_CENTER_INDICATOR = null;
    PlanComponent.COMPASS_DISC = null;
    PlanComponent.COMPASS = null;
    PlanComponent.COMPASS_ROTATION_INDICATOR = null;
    PlanComponent.COMPASS_RESIZE_INDICATOR = null;
    PlanComponent.ARROW = null;
    PlanComponent.INDICATOR_STROKE = new java.awt.BasicStroke(1.5);
    PlanComponent.POINT_STROKE = new java.awt.BasicStroke(2.0);
    PlanComponent.WALL_STROKE_WIDTH = 1.5;
    PlanComponent.BORDER_STROKE_WIDTH = 1.0;
    PlanComponent.ERROR_TEXTURE_IMAGE = null;
    PlanComponent.WAIT_TEXTURE_IMAGE = null;
    PlanComponent.WEBGL_AVAILABLE = true;
    return PlanComponent;
}());
PlanComponent["__class"] = "com.eteks.sweethome3d.swing.PlanComponent";
PlanComponent["__interfaces"] = ["com.eteks.sweethome3d.viewcontroller.PlanView", "com.eteks.sweethome3d.viewcontroller.View", "javax.swing.Scrollable", "com.eteks.sweethome3d.viewcontroller.ExportableView", "java.awt.print.Printable", "javax.swing.TransferHandler.HasGetTransferHandler", "java.awt.MenuContainer", "java.awt.image.ImageObserver", "com.eteks.sweethome3d.viewcontroller.TransferableView", "java.io.Serializable"];
var PlanComponent;
(function (PlanComponent) {
    /**
     * The circumstances under which the home items displayed by this component will be painted.
     * @enum
     * @property {PlanComponent.PaintMode} PAINT
     * @property {PlanComponent.PaintMode} PRINT
     * @property {PlanComponent.PaintMode} CLIPBOARD
     * @property {PlanComponent.PaintMode} EXPORT
     * @class
     */
    (function (PaintMode) {
        PaintMode[PaintMode["PAINT"] = 0] = "PAINT";
        PaintMode[PaintMode["PRINT"] = 1] = "PRINT";
        PaintMode[PaintMode["CLIPBOARD"] = 2] = "CLIPBOARD";
        PaintMode[PaintMode["EXPORT"] = 3] = "EXPORT";
    })(PlanComponent.PaintMode || (PlanComponent.PaintMode = {}));
    var PaintMode = PlanComponent.PaintMode;
    (function (ActionType) {
        ActionType[ActionType["DELETE_SELECTION"] = 0] = "DELETE_SELECTION";
        ActionType[ActionType["ESCAPE"] = 1] = "ESCAPE";
        ActionType[ActionType["MOVE_SELECTION_LEFT"] = 2] = "MOVE_SELECTION_LEFT";
        ActionType[ActionType["MOVE_SELECTION_UP"] = 3] = "MOVE_SELECTION_UP";
        ActionType[ActionType["MOVE_SELECTION_DOWN"] = 4] = "MOVE_SELECTION_DOWN";
        ActionType[ActionType["MOVE_SELECTION_RIGHT"] = 5] = "MOVE_SELECTION_RIGHT";
        ActionType[ActionType["MOVE_SELECTION_FAST_LEFT"] = 6] = "MOVE_SELECTION_FAST_LEFT";
        ActionType[ActionType["MOVE_SELECTION_FAST_UP"] = 7] = "MOVE_SELECTION_FAST_UP";
        ActionType[ActionType["MOVE_SELECTION_FAST_DOWN"] = 8] = "MOVE_SELECTION_FAST_DOWN";
        ActionType[ActionType["MOVE_SELECTION_FAST_RIGHT"] = 9] = "MOVE_SELECTION_FAST_RIGHT";
        ActionType[ActionType["TOGGLE_MAGNETISM_ON"] = 10] = "TOGGLE_MAGNETISM_ON";
        ActionType[ActionType["TOGGLE_MAGNETISM_OFF"] = 11] = "TOGGLE_MAGNETISM_OFF";
        ActionType[ActionType["ACTIVATE_ALIGNMENT"] = 12] = "ACTIVATE_ALIGNMENT";
        ActionType[ActionType["DEACTIVATE_ALIGNMENT"] = 13] = "DEACTIVATE_ALIGNMENT";
        ActionType[ActionType["ACTIVATE_DUPLICATION"] = 14] = "ACTIVATE_DUPLICATION";
        ActionType[ActionType["DEACTIVATE_DUPLICATION"] = 15] = "DEACTIVATE_DUPLICATION";
        ActionType[ActionType["ACTIVATE_EDITIION"] = 16] = "ACTIVATE_EDITIION";
        ActionType[ActionType["DEACTIVATE_EDITIION"] = 17] = "DEACTIVATE_EDITIION";
    })(PlanComponent.ActionType || (PlanComponent.ActionType = {}));
    var ActionType = PlanComponent.ActionType;
    /**
     * Indicator types that may be displayed on selected items.
     * @class
     */
    var IndicatorType = (function () {
        function IndicatorType(name) {
            if (this.__name === undefined)
                this.__name = null;
            this.__name = name;
        }
        IndicatorType.prototype.name = function () {
            return this.__name;
        };
        /**
         *
         * @return {string}
         */
        IndicatorType.prototype.toString = function () {
            return this.__name;
        };
        return IndicatorType;
    }());
    PlanComponent.IndicatorType = IndicatorType;
    IndicatorType["__class"] = "com.eteks.sweethome3d.swing.PlanComponent.IndicatorType";
    IndicatorType.ROTATE = new PlanComponent.IndicatorType("ROTATE");
    IndicatorType.RESIZE = new PlanComponent.IndicatorType("RESIZE");
    IndicatorType.ELEVATE = new PlanComponent.IndicatorType("ELEVATE");
    IndicatorType.RESIZE_HEIGHT = new PlanComponent.IndicatorType("RESIZE_HEIGHT");
    IndicatorType.CHANGE_POWER = new PlanComponent.IndicatorType("CHANGE_POWER");
    IndicatorType.MOVE_TEXT = new PlanComponent.IndicatorType("MOVE_TEXT");
    IndicatorType.ROTATE_TEXT = new PlanComponent.IndicatorType("ROTATE_TEXT");
    IndicatorType.ROTATE_PITCH = new PlanComponent.IndicatorType("ROTATE_PITCH");
    IndicatorType.ROTATE_ROLL = new PlanComponent.IndicatorType("ROTATE_ROLL");
    IndicatorType.ARC_EXTENT = new PlanComponent.IndicatorType("ARC_EXTENT");
    /**
     * Preferences property listener bound to this component with a weak reference to avoid
     * strong link between preferences and this component.
     * @param {PlanComponent} planComponent
     * @class
     */
    var UserPreferencesChangeListener = (function () {
        function UserPreferencesChangeListener(planComponent) {
            if (this.planComponent === undefined)
                this.planComponent = null;
            this.planComponent = (planComponent);
        }
        UserPreferencesChangeListener.prototype.propertyChange = function (ev) {
            var planComponent = this.planComponent;
            var preferences = ev.getSource();
            var property = ev.getPropertyName();
            if (planComponent == null) {
                preferences.removePropertyChangeListener(property, this);
            }
            else {
                switch ((property)) {
                    case "LANGUAGE":
                    case "UNIT":
                        {
                            var array211 = (function (m) { if (m.entries == null)
                                m.entries = []; return m.entries; })(planComponent.toolTipEditableTextFields);
                            for (var index210 = 0; index210 < array211.length; index210++) {
                                var toolTipTextFieldEntry = array211[index210];
                                {
                                    PlanComponent.updateToolTipTextFieldFormatterFactory(toolTipTextFieldEntry.getValue(), toolTipTextFieldEntry.getKey(), preferences);
                                }
                            }
                        }
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
                        null /*erased method planComponent.revalidate*/;
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
        };
        return UserPreferencesChangeListener;
    }());
    PlanComponent.UserPreferencesChangeListener = UserPreferencesChangeListener;
    UserPreferencesChangeListener["__class"] = "com.eteks.sweethome3d.swing.PlanComponent.UserPreferencesChangeListener";
    UserPreferencesChangeListener["__interfaces"] = ["java.util.EventListener", "java.beans.PropertyChangeListener"];
    /**
     * Separated static class to be able to exclude FreeHEP library from classpath
     * in case the application doesn't use export to SVG format.
     * @class
     */
    var SVGSupport = (function () {
        function SVGSupport() {
        }
        SVGSupport.exportToSVG = function (out, planComponent) {
            var homeItems = planComponent.getPaintedItems();
            var svgItemBounds = planComponent.getItemsBounds(null, homeItems);
            if (svgItemBounds == null) {
                svgItemBounds = new java.awt.geom.Rectangle2D.Float();
            }
            var svgScale = 1.0;
            var extraMargin = planComponent.getStrokeWidthExtraMargin(homeItems, PlanComponent.PaintMode.EXPORT);
            var imageSize = new java.awt.Dimension((Math.ceil(svgItemBounds.getWidth() * svgScale + 2 * extraMargin) | 0), (Math.ceil(svgItemBounds.getHeight() * svgScale + 2 * extraMargin) | 0));
            var exportG2D = new SVGSupport.SVGSupport$0(out, imageSize);
            var properties = new org.freehep.util.UserProperties();
            properties.setProperty(org.freehep.graphicsio.svg.SVGGraphics2D.STYLABLE, true);
            properties.setProperty(org.freehep.graphicsio.svg.SVGGraphics2D.WRITE_IMAGES_AS, org.freehep.graphicsio.ImageConstants.PNG);
            properties.setProperty(org.freehep.graphicsio.svg.SVGGraphics2D.TITLE, planComponent.home.getName() != null ? planComponent.home.getName() : "");
            properties.setProperty(org.freehep.graphicsio.svg.SVGGraphics2D.FOR, java.lang.System.getProperty("user.name", ""));
            exportG2D.setProperties(properties);
            exportG2D.startExport();
            exportG2D.translate(-svgItemBounds.getMinX() + extraMargin, -svgItemBounds.getMinY() + extraMargin);
            planComponent.checkCurrentThreadIsntInterrupted(PlanComponent.PaintMode.EXPORT);
            planComponent.paintContent(exportG2D, svgScale, PlanComponent.PaintMode.EXPORT);
            exportG2D.endExport();
        };
        return SVGSupport;
    }());
    PlanComponent.SVGSupport = SVGSupport;
    SVGSupport["__class"] = "com.eteks.sweethome3d.swing.PlanComponent.SVGSupport";
    /**
     * A map key used to compare furniture with the same top view icon.
     * @param {HomePieceOfFurniture} piece
     * @class
     */
    var HomePieceOfFurnitureTopViewIconKey = (function () {
        function HomePieceOfFurnitureTopViewIconKey(piece) {
            this.piece = piece;
            //            this.__hashCode = (piece.getPlanIcon() != null?null/*erased method piece.getPlanIcon().hashCode*/:null/*erased method piece.getModel().hashCode*/) + (piece.getColor() != null?37 * null/*erased method this.piece.getColor().hashCode*/:1234);
            //            if(this.piece.isHorizontallyRotated() || this.piece.getTexture() != null) {
            //                this.__hashCode += (piece.getTexture() != null?37 * null/*erased method this.piece.getTexture().hashCode*/:0) + 37 * null/*erased method Float.valueOf(piece.getWidthInPlan()).hashCode*/ + 37 * null/*erased method Float.valueOf(piece.getDepthInPlan()).hashCode*/ + 37 * null/*erased method Float.valueOf(piece.getHeightInPlan()).hashCode*/;
            //            }
            //            if(this.piece.getPlanIcon() != null) {
            //                this.__hashCode += 37 * java.util.Arrays.deepHashCode(piece.getModelRotation()) + 37 * null/*erased method Boolean.valueOf(piece.isModelCenteredAtOrigin()).hashCode*/ + 37 * null/*erased method Boolean.valueOf(piece.isBackFaceShown()).hashCode*/ + 37 * null/*erased method Float.valueOf(piece.getPitch()).hashCode*/ + 37 * null/*erased method Float.valueOf(piece.getRoll()).hashCode*/ + 37 * null/*erased method Arrays.hashCode*/ + 37 * null/*erased method Arrays.hashCode*/ + (piece.getShininess() != null?37 * null/*erased method this.piece.getShininess().hashCode*/:3456);
            //            }
        }
        /**
         *
         * @param {Object} obj
         * @return {boolean}
         */
        HomePieceOfFurnitureTopViewIconKey.prototype.equals = function (obj) {
            if (obj instanceof HomePieceOfFurnitureTopViewIconKey) {
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
                    && (this.piece.getPlanIcon() != null
                        || this.piece.getModelRotation() == piece2.getModelRotation()) // TODO : array equality
                    && this.piece.isModelCenteredAtOrigin() == piece2.isModelCenteredAtOrigin()
                    && this.piece.isBackFaceShown() == piece2.isBackFaceShown()
                    && this.piece.getPitch() == piece2.getPitch()
                    && this.piece.getRoll() == piece2.getRoll()
                    && this.piece.getModelTransformations() == piece2.getModelTransformations() // TODO : array equality
                    && this.piece.getModelMaterials() == piece2.getModelMaterials() // TODO : array equality
                    && (this.piece.getShininess() == piece2.getShininess());
            }
            else {
                return false;
            }
        };
        return HomePieceOfFurnitureTopViewIconKey;
    }());
    PlanComponent.HomePieceOfFurnitureTopViewIconKey = HomePieceOfFurnitureTopViewIconKey;
    HomePieceOfFurnitureTopViewIconKey["__class"] = "com.eteks.sweethome3d.swing.PlanComponent.HomePieceOfFurnitureTopViewIconKey";
    var PlanComponent$14 = (function () {
        function PlanComponent$14(__parent, controller) {
            this.controller = controller;
            this.__parent = __parent;
        }
        PlanComponent$14.prototype.mouseWheelMoved = function (ev) {
            if (ev.getModifiers() === this.__parent.getToolkit().getMenuShortcutKeyMask()) {
                var mouseX = 0;
                var mouseY = 0;
                var deltaX = 0;
                var deltaY = 0;
                if (this.__parent.getParent() != null && this.__parent.getParent() instanceof javax.swing.JViewport) {
                    mouseX = this.__parent.convertXPixelToModel(ev.getX());
                    mouseY = this.__parent.convertYPixelToModel(ev.getY());
                    var viewRectangle = this.__parent.getParent().getViewRect();
                    deltaX = ev.getX() - viewRectangle.x;
                    deltaY = ev.getY() - viewRectangle.y;
                }
                var oldScale = this.__parent.getScale();
                this.controller.zoom((ev.getWheelRotation() < 0 ? Math.pow(1.05, -ev.getWheelRotation()) : Math.pow(0.95, ev.getWheelRotation())));
                if (this.__parent.getScale() !== oldScale && (this.__parent.getParent() != null && this.__parent.getParent() instanceof javax.swing.JViewport)) {
                    this.__parent.getParent().setViewPosition(new java.awt.Point());
                    this.__parent.moveView(mouseX - this.__parent.convertXPixelToModel(deltaX), mouseY - this.__parent.convertYPixelToModel(deltaY));
                }
            }
            else if (this.__parent.getMouseWheelListeners().length === 1) {
                this.__parent.getParent().dispatchEvent(new java.awt.event.MouseWheelEvent(this.__parent.getParent(), ev.getID(), ev.getWhen(), ev.getModifiersEx() | ev.getModifiers(), ev.getX() - this.__parent.getX(), ev.getY() - this.__parent.getY(), ev.getClickCount(), ev.isPopupTrigger(), ev.getScrollType(), ev.getScrollAmount(), ev.getWheelRotation()));
            }
        };
        return PlanComponent$14;
    }());
    PlanComponent.PlanComponent$14 = PlanComponent$14;
    PlanComponent$14["__interfaces"] = ["java.util.EventListener", "java.awt.event.MouseWheelListener"];
    var PlanComponent$15 = (function () {
        function PlanComponent$15(__parent, controller) {
            this.controller = controller;
            this.__parent = __parent;
        }
        /**
         *
         * @param {java.awt.event.FocusEvent} ev
         */
        PlanComponent$15.prototype.focusLost = function (ev) {
            this.controller.escape();
        };
        return PlanComponent$15;
    }());
    PlanComponent.PlanComponent$15 = PlanComponent$15;
    PlanComponent$15["__interfaces"] = ["java.util.EventListener", "java.awt.event.FocusListener"];
    var PlanComponent$16 = (function () {
        function PlanComponent$16(__parent) {
            this.__parent = __parent;
        }
        PlanComponent$16.prototype.propertyChange = function (ev) {
            if (!(this.__parent.home.getSelectedItems().length == 0)) {
                this.__parent.repaint();
            }
        };
        return PlanComponent$16;
    }());
    PlanComponent.PlanComponent$16 = PlanComponent$16;
    PlanComponent$16["__interfaces"] = ["java.util.EventListener", "java.beans.PropertyChangeListener"];
    var PlanComponent$17 = (function () {
        function PlanComponent$17(__parent, controller) {
            this.controller = controller;
            this.__parent = __parent;
        }
        PlanComponent$17.prototype.propertyChange = function (ev) {
            var wallsDoorsOrWindowsModification = this.controller.isBasePlanModificationState();
            if (wallsDoorsOrWindowsModification) {
                if (this.controller.getMode() !== PlanController.Mode.WALL_CREATION) {
                    {
                        var array214 = (this.__parent.draggedItemsFeedback != null ? this.__parent.draggedItemsFeedback : this.__parent.home.getSelectedItems());
                        for (var index213 = 0; index213 < array214.length; index213++) {
                            var item = array214[index213];
                            {
                                if (!(item != null && item instanceof Wall) && !((item != null && item instanceof HomePieceOfFurniture) && (item).isDoorOrWindow())) {
                                    wallsDoorsOrWindowsModification = false;
                                }
                            }
                        }
                    }
                }
            }
            if (this.__parent.wallsDoorsOrWindowsModification !== wallsDoorsOrWindowsModification) {
                this.__parent.wallsDoorsOrWindowsModification = wallsDoorsOrWindowsModification;
                this.__parent.repaint();
            }
        };
        return PlanComponent$17;
    }());
    PlanComponent.PlanComponent$17 = PlanComponent$17;
    PlanComponent$17["__interfaces"] = ["java.util.EventListener", "java.beans.PropertyChangeListener"];
    var PlanComponent$18 /*extends javax.swing.AbstractAction*/ = (function () {
        function PlanComponent$18 /*extends javax.swing.AbstractAction*/(__parent, controller) {
            this.controller = controller;
            _super.call(this);
            this.__parent = __parent;
        }
        PlanComponent$18 /*extends javax.swing.AbstractAction*/.prototype.actionPerformed = function (ev) {
            this.controller.deleteSelection();
        };
        return PlanComponent$18 /*extends javax.swing.AbstractAction*/;
    }());
    PlanComponent.PlanComponent$18 /*extends javax.swing.AbstractAction*/ = PlanComponent$18 /*extends javax.swing.AbstractAction*/;
    PlanComponent$18["__interfaces"] = ["java.util.EventListener", "java.lang.Cloneable", "java.awt.event.ActionListener", "javax.swing.Action", "java.io.Serializable"];
    var PlanComponent$19 /*extends javax.swing.AbstractAction*/ = (function () {
        function PlanComponent$19 /*extends javax.swing.AbstractAction*/(__parent, controller) {
            this.controller = controller;
            _super.call(this);
            this.__parent = __parent;
        }
        PlanComponent$19 /*extends javax.swing.AbstractAction*/.prototype.actionPerformed = function (ev) {
            this.controller.escape();
        };
        return PlanComponent$19 /*extends javax.swing.AbstractAction*/;
    }());
    PlanComponent.PlanComponent$19 /*extends javax.swing.AbstractAction*/ = PlanComponent$19 /*extends javax.swing.AbstractAction*/;
    PlanComponent$19["__interfaces"] = ["java.util.EventListener", "java.lang.Cloneable", "java.awt.event.ActionListener", "javax.swing.Action", "java.io.Serializable"];
    var PlanComponent$20 /*extends javax.swing.JFormattedTextField*/ = (function () {
        function PlanComponent$20 /*extends javax.swing.JFormattedTextField*/(__parent) {
            _super.call(this);
            this.__parent = __parent;
        }
        /**
         *
         * @return {java.awt.Dimension}
         */
        PlanComponent$20 /*extends javax.swing.JFormattedTextField*/.prototype.getPreferredSize = function () {
            var preferredSize = _super.prototype.getPreferredSize.call(this);
            return new java.awt.Dimension(preferredSize.width + 1, preferredSize.height);
        };
        return PlanComponent$20 /*extends javax.swing.JFormattedTextField*/;
    }());
    PlanComponent.PlanComponent$20 /*extends javax.swing.JFormattedTextField*/ = PlanComponent$20 /*extends javax.swing.JFormattedTextField*/;
    PlanComponent$20["__interfaces"] = ["javax.swing.Scrollable", "javax.swing.TransferHandler.HasGetTransferHandler", "java.awt.MenuContainer", "javax.accessibility.Accessible", "javax.swing.SwingConstants", "java.awt.image.ImageObserver", "java.io.Serializable"];
    var PlanComponent$21 /*implements javax.swing.event.DocumentListener*/ = (function () {
        function PlanComponent$21 /*implements javax.swing.event.DocumentListener*/(__parent, textField, controller, editableProperty) {
            this.textField = textField;
            this.controller = controller;
            this.editableProperty = editableProperty;
            this.__parent = __parent;
        }
        PlanComponent$21 /*implements javax.swing.event.DocumentListener*/.prototype.changedUpdate = function (ev) {
            try {
                this.textField.commitEdit();
                this.controller.updateEditableProperty(this.editableProperty, this.textField.getValue());
            }
            catch (ex) {
                this.controller.updateEditableProperty(this.editableProperty, null);
            }
            ;
        };
        PlanComponent$21 /*implements javax.swing.event.DocumentListener*/.prototype.insertUpdate = function (ev) {
            this.changedUpdate(ev);
        };
        PlanComponent$21 /*implements javax.swing.event.DocumentListener*/.prototype.removeUpdate = function (ev) {
            this.changedUpdate(ev);
        };
        return PlanComponent$21 /*implements javax.swing.event.DocumentListener*/;
    }());
    PlanComponent.PlanComponent$21 /*implements javax.swing.event.DocumentListener*/ = PlanComponent$21 /*implements javax.swing.event.DocumentListener*/;
    PlanComponent$21["__interfaces"] = ["java.util.EventListener", "javax.swing.event.DocumentListener"];
    var PlanComponent$24 /*extends javax.swing.event.MouseInputAdapter*/ = (function () {
        function PlanComponent$24 /*extends javax.swing.event.MouseInputAdapter*/(__parent) {
            _super.call(this);
            this.__parent = __parent;
        }
        /**
         *
         * @param {java.awt.event.MouseEvent} ev
         */
        PlanComponent$24 /*extends javax.swing.event.MouseInputAdapter*/.prototype.mousePressed = function (ev) {
            this.mouseMoved(ev);
        };
        /**
         *
         * @param {java.awt.event.MouseEvent} ev
         */
        PlanComponent$24 /*extends javax.swing.event.MouseInputAdapter*/.prototype.mouseReleased = function (ev) {
            this.mouseMoved(ev);
        };
        /**
         *
         * @param {java.awt.event.MouseEvent} ev
         */
        PlanComponent$24 /*extends javax.swing.event.MouseInputAdapter*/.prototype.mouseMoved = function (ev) {
            this.__parent.dispatchEvent(javax.swing.SwingUtilities.convertMouseEvent(this.__parent.toolTipWindow, ev, this.__parent));
        };
        /**
         *
         * @param {java.awt.event.MouseEvent} ev
         */
        PlanComponent$24 /*extends javax.swing.event.MouseInputAdapter*/.prototype.mouseDragged = function (ev) {
            this.mouseMoved(ev);
        };
        return PlanComponent$24 /*extends javax.swing.event.MouseInputAdapter*/;
    }());
    PlanComponent.PlanComponent$24 /*extends javax.swing.event.MouseInputAdapter*/ = PlanComponent$24 /*extends javax.swing.event.MouseInputAdapter*/;
    PlanComponent$24["__interfaces"] = ["java.util.EventListener", "java.awt.event.MouseMotionListener", "javax.swing.event.MouseInputListener", "java.awt.event.MouseWheelListener", "java.awt.event.MouseListener"];
    var PlanComponent$25 = (function () {
        function PlanComponent$25(__parent, toolTipEditedProperties) {
            var _this = this;
            this.toolTipEditedProperties = toolTipEditedProperties;
            this.__parent = __parent;
            if (this.focusedTextFieldIndex === undefined)
                this.focusedTextFieldIndex = 0;
            if (this.focusedTextField === undefined)
                this.focusedTextField = null;
            (function () {
                _this.setFocusedTextFieldIndex(0);
            })();
        }
        PlanComponent$25.prototype.setFocusedTextFieldIndex = function (textFieldIndex) {
            if (this.focusedTextField != null) {
                this.focusedTextField.getCaret().setVisible(false);
                this.focusedTextField.getCaret().setSelectionVisible(false);
                this.focusedTextField.setValue(this.focusedTextField.getValue());
            }
            this.focusedTextFieldIndex = textFieldIndex;
            this.focusedTextField = (function (m, k) { if (m.entries == null)
                m.entries = []; for (var i = 0; i < m.entries.length; i++)
                if (m.entries[i].key.equals != null && m.entries[i].key.equals(k) || m.entries[i].key === k) {
                    return m.entries[i].value;
                } return null; })(this.__parent.toolTipEditableTextFields, this.toolTipEditedProperties[textFieldIndex]);
            if (this.focusedTextField.getText().length === 0) {
                this.focusedTextField.getCaret().setVisible(false);
            }
            else {
                this.focusedTextField.selectAll();
            }
            this.focusedTextField.getCaret().setSelectionVisible(true);
        };
        PlanComponent$25.prototype.keyPressed = function (ev) {
            this.keyTyped(ev);
        };
        PlanComponent$25.prototype.keyReleased = function (ev) {
            if (ev.getKeyCode() !== java.awt.event.KeyEvent.VK_CONTROL && ev.getKeyCode() !== java.awt.event.KeyEvent.VK_ALT) {
                java.awt.KeyboardFocusManager.getCurrentKeyboardFocusManager().redispatchEvent(this.focusedTextField, ev);
            }
        };
        PlanComponent$25.prototype.keyTyped = function (ev) {
            var forwardKeys = this.focusedTextField.getFocusTraversalKeys(java.awt.KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS);
            if ((forwardKeys.indexOf((java.awt.AWTKeyStroke.getAWTKeyStrokeForEvent(ev))) >= 0) || ev.getKeyCode() === java.awt.event.KeyEvent.VK_DOWN) {
                this.setFocusedTextFieldIndex((this.focusedTextFieldIndex + 1) % this.toolTipEditedProperties.length);
                ev.consume();
            }
            else {
                var backwardKeys = this.focusedTextField.getFocusTraversalKeys(java.awt.KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS);
                if ((backwardKeys.indexOf((java.awt.AWTKeyStroke.getAWTKeyStrokeForEvent(ev))) >= 0) || ev.getKeyCode() === java.awt.event.KeyEvent.VK_UP) {
                    this.setFocusedTextFieldIndex((this.focusedTextFieldIndex - 1 + this.toolTipEditedProperties.length) % this.toolTipEditedProperties.length);
                    ev.consume();
                }
                else if ((ev.getKeyCode() === java.awt.event.KeyEvent.VK_HOME || ev.getKeyCode() === java.awt.event.KeyEvent.VK_END) && com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() && !com.eteks.sweethome3d.tools.OperatingSystem.isMacOSXLeopardOrSuperior()) {
                    if (ev.getKeyCode() === java.awt.event.KeyEvent.VK_HOME) {
                        this.focusedTextField.setCaretPosition(0);
                    }
                    else if (ev.getKeyCode() === java.awt.event.KeyEvent.VK_END) {
                        this.focusedTextField.setCaretPosition(this.focusedTextField.getText().length);
                    }
                    ev.consume();
                }
                else if (ev.getKeyCode() !== java.awt.event.KeyEvent.VK_ESCAPE && ev.getKeyCode() !== java.awt.event.KeyEvent.VK_CONTROL && ev.getKeyCode() !== java.awt.event.KeyEvent.VK_ALT) {
                    java.awt.KeyboardFocusManager.getCurrentKeyboardFocusManager().redispatchEvent(this.focusedTextField, ev);
                    this.focusedTextField.getCaret().setVisible(true);
                    this.__parent.toolTipWindow.pack();
                }
            }
        };
        return PlanComponent$25;
    }());
    PlanComponent.PlanComponent$25 = PlanComponent$25;
    PlanComponent$25["__interfaces"] = ["java.util.EventListener", "java.awt.event.KeyListener"];
    var MoveSelectionAction /*extends javax.swing.AbstractAction*/ = (function () {
        function MoveSelectionAction /*extends javax.swing.AbstractAction*/(__parent, dx, dy) {
            _super.call(this);
            this.__parent = __parent;
            if (this.dx === undefined)
                this.dx = 0;
            if (this.dy === undefined)
                this.dy = 0;
            this.dx = dx;
            this.dy = dy;
        }
        MoveSelectionAction /*extends javax.swing.AbstractAction*/.prototype.actionPerformed = function (ev) {
            controller.moveSelection(this.dx / this.__parent.getScale(), this.dy / this.__parent.getScale());
        };
        return MoveSelectionAction /*extends javax.swing.AbstractAction*/;
    }());
    PlanComponent.MoveSelectionAction /*extends javax.swing.AbstractAction*/ = MoveSelectionAction /*extends javax.swing.AbstractAction*/;
    MoveSelectionAction["__class"] = "MoveSelectionAction";
    MoveSelectionAction["__interfaces"] = ["java.util.EventListener", "java.lang.Cloneable", "java.awt.event.ActionListener", "javax.swing.Action", "java.io.Serializable"];
    var ToggleMagnetismAction /*extends javax.swing.AbstractAction*/ = (function () {
        function ToggleMagnetismAction /*extends javax.swing.AbstractAction*/(__parent, toggle) {
            _super.call(this);
            this.__parent = __parent;
            if (this.toggle === undefined)
                this.toggle = false;
            this.toggle = toggle;
        }
        ToggleMagnetismAction /*extends javax.swing.AbstractAction*/.prototype.actionPerformed = function (ev) {
            controller.toggleMagnetism(this.toggle);
        };
        return ToggleMagnetismAction /*extends javax.swing.AbstractAction*/;
    }());
    PlanComponent.ToggleMagnetismAction /*extends javax.swing.AbstractAction*/ = ToggleMagnetismAction /*extends javax.swing.AbstractAction*/;
    ToggleMagnetismAction["__class"] = "ToggleMagnetismAction";
    ToggleMagnetismAction["__interfaces"] = ["java.util.EventListener", "java.lang.Cloneable", "java.awt.event.ActionListener", "javax.swing.Action", "java.io.Serializable"];
    var SetAlignmentActivatedAction /*extends javax.swing.AbstractAction*/ = (function () {
        function SetAlignmentActivatedAction /*extends javax.swing.AbstractAction*/(__parent, alignmentActivated) {
            _super.call(this);
            this.__parent = __parent;
            if (this.alignmentActivated === undefined)
                this.alignmentActivated = false;
            this.alignmentActivated = alignmentActivated;
        }
        SetAlignmentActivatedAction /*extends javax.swing.AbstractAction*/.prototype.actionPerformed = function (ev) {
            controller.setAlignmentActivated(this.alignmentActivated);
        };
        return SetAlignmentActivatedAction /*extends javax.swing.AbstractAction*/;
    }());
    PlanComponent.SetAlignmentActivatedAction /*extends javax.swing.AbstractAction*/ = SetAlignmentActivatedAction /*extends javax.swing.AbstractAction*/;
    SetAlignmentActivatedAction["__class"] = "SetAlignmentActivatedAction";
    SetAlignmentActivatedAction["__interfaces"] = ["java.util.EventListener", "java.lang.Cloneable", "java.awt.event.ActionListener", "javax.swing.Action", "java.io.Serializable"];
    var SetDuplicationActivatedAction /*extends javax.swing.AbstractAction*/ = (function () {
        function SetDuplicationActivatedAction /*extends javax.swing.AbstractAction*/(__parent, duplicationActivated) {
            _super.call(this);
            this.__parent = __parent;
            if (this.duplicationActivated === undefined)
                this.duplicationActivated = false;
            this.duplicationActivated = duplicationActivated;
        }
        SetDuplicationActivatedAction /*extends javax.swing.AbstractAction*/.prototype.actionPerformed = function (ev) {
            controller.setDuplicationActivated(this.duplicationActivated);
        };
        return SetDuplicationActivatedAction /*extends javax.swing.AbstractAction*/;
    }());
    PlanComponent.SetDuplicationActivatedAction /*extends javax.swing.AbstractAction*/ = SetDuplicationActivatedAction /*extends javax.swing.AbstractAction*/;
    SetDuplicationActivatedAction["__class"] = "SetDuplicationActivatedAction";
    SetDuplicationActivatedAction["__interfaces"] = ["java.util.EventListener", "java.lang.Cloneable", "java.awt.event.ActionListener", "javax.swing.Action", "java.io.Serializable"];
    var SetEditionActivatedAction /*extends javax.swing.AbstractAction*/ = (function () {
        function SetEditionActivatedAction /*extends javax.swing.AbstractAction*/(__parent, editionActivated) {
            _super.call(this);
            this.__parent = __parent;
            if (this.editionActivated === undefined)
                this.editionActivated = false;
            this.editionActivated = editionActivated;
        }
        SetEditionActivatedAction /*extends javax.swing.AbstractAction*/.prototype.actionPerformed = function (ev) {
            controller.setEditionActivated(this.editionActivated);
        };
        return SetEditionActivatedAction /*extends javax.swing.AbstractAction*/;
    }());
    PlanComponent.SetEditionActivatedAction /*extends javax.swing.AbstractAction*/ = SetEditionActivatedAction /*extends javax.swing.AbstractAction*/;
    SetEditionActivatedAction["__class"] = "SetEditionActivatedAction";
    SetEditionActivatedAction["__interfaces"] = ["java.util.EventListener", "java.lang.Cloneable", "java.awt.event.ActionListener", "javax.swing.Action", "java.io.Serializable"];
    // =======================================================
    /**
     * A proxy for the furniture icon seen from top.
     * @param {Image} icon
     * @constructor
     */
    var PieceOfFurnitureTopViewIcon = (function () {
        function PieceOfFurnitureTopViewIcon(image) {
            this.image = image;
        }
        PieceOfFurnitureTopViewIcon.prototype.getIconWidth = function () {
            return this.image.width;
        };
        PieceOfFurnitureTopViewIcon.prototype.getIconHeight = function () {
            return this.image.height;
        };
        PieceOfFurnitureTopViewIcon.prototype.paintIcon = function (g, x, y) {
            g.drawImage(this.image, x, y);
        };
        PieceOfFurnitureTopViewIcon.prototype.isWaitIcon = function () {
            return this.image === TextureManager.getInstance().getWaitImage();
        };
        PieceOfFurnitureTopViewIcon.prototype.isErrorIcon = function () {
            return this.image === TextureManager.getInstance().getErrorImage();
        };
        PieceOfFurnitureTopViewIcon.prototype.setIcon = function (image) {
            this.image = image;
        };
        return PieceOfFurnitureTopViewIcon;
    }());
    PlanComponent.PieceOfFurnitureTopViewIcon = PieceOfFurnitureTopViewIcon;
    /**
     * Creates a top view icon proxy for a <code>piece</code> of furniture.
     * @param {HomePieceOfFurniture} piece an object containing a 3D content
     * @param {Object} object3dFactory a factory with a <code>createObject3D(home, item, waitForLoading)</code> method
     * @param {Object} waitingComponent a waiting component. If <code>null</code>, the returned icon will
     *          be read immediately in the current thread.
     * @param {number} iconSize the size in pixels of the generated icon
     * @constructor
     * @extends PlanComponent.PieceOfFurnitureTopViewIcon
     */
    var PieceOfFurnitureModelIcon = (function (_super) {
        __extends(PieceOfFurnitureModelIcon, _super);
        function PieceOfFurnitureModelIcon(piece, object3dFactory, waitingComponent, iconSize) {
            _super.call(this, TextureManager.getInstance().getWaitImage());
            var modelIcon = this;
            ModelManager.getInstance().loadModel(piece.getModel(), waitingComponent === null, {
                modelUpdated: function (modelRoot) {
                    var normalizedPiece = piece.clone();
                    if (normalizedPiece.isResizable()) {
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
                        var updater = function () {
                            modelIcon.createIcon(object3dFactory.createObject3D(null, normalizedPiece, true), pieceWidth, pieceDepth, pieceHeight, iconSize, function (icon) {
                                modelIcon.setIcon(icon);
                                waitingComponent.repaint();
                            });
                        };
                        setTimeout(updater, 0);
                    }
                    else {
                        modelIcon.setIcon(modelIcon.createIcon(object3dFactory.createObject3D(null, normalizedPiece, true), pieceWidth, pieceDepth, pieceHeight, iconSize));
                    }
                },
                modelError: function (ex) {
                    // In case of problem use a default red box
                    modelIcon.setIcon(TextureManager.getInstance().getErrorImage());
                    if (waitingComponent !== null) {
                        waitingComponent.repaint();
                    }
                }
            });
        }
        /**
         * Returns the branch group bound to a universe and a canvas for the given
         * resolution.
         * @param {number} iconSize
         * @return {BranchGroup3D}
         * @private
         */
        PieceOfFurnitureModelIcon.prototype.getSceneRoot = function (iconSize) {
            if (!PlanComponent.PieceOfFurnitureModelIcon.canvas3D) {
                var canvas = document.createElement("canvas");
                canvas.width = iconSize;
                canvas.height = iconSize;
                canvas.style.backgroundColor = "rgba(255, 255, 255, 0)";
                var canvas3D = new HTMLCanvas3D(canvas);
                var rotation = mat4.create();
                mat4.fromXRotation(rotation, -Math.PI / 2);
                var transform = mat4.create();
                mat4.fromTranslation(transform, vec3.fromValues(0, 5, 0));
                mat4.mul(transform, transform, rotation);
                canvas3D.setViewPlatformTransform(transform);
                canvas3D.setProjectionPolicy(HTMLCanvas3D.PARALLEL_PROJECTION);
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
                PlanComponent.PieceOfFurnitureModelIcon.canvas3D = canvas3D;
            }
            else {
                if (PlanComponent.PieceOfFurnitureModelIcon.canvas3D.getCanvas().width !== iconSize) {
                    PlanComponent.PieceOfFurnitureModelIcon.canvas3D = undefined;
                    PlanComponent.PieceOfFurnitureModelIcon.canvas3D.clear();
                    return this.getSceneRoot(iconSize);
                }
            }
            return PlanComponent.PieceOfFurnitureModelIcon.canvas3D.getScene();
        };
        /**
         * Returns an icon created and scaled from piece model content.
         * @param {Object3DBranch} pieceNode
         * @param {number} pieceWidth
         * @param {number} pieceDepth
         * @param {number} pieceHeight
         * @param {number} iconSize
         * @return {Object}
         * @private
         */
        PieceOfFurnitureModelIcon.prototype.createIcon = function (pieceNode, pieceWidth, pieceDepth, pieceHeight, iconSize, iconObserver) {
            var scaleTransform = mat4.create();
            mat4.scale(scaleTransform, scaleTransform, vec3.fromValues(2 / pieceWidth, 2 / pieceHeight, 2 / pieceDepth));
            var modelTransformGroup = new TransformGroup3D();
            modelTransformGroup.setTransform(scaleTransform);
            modelTransformGroup.addChild(pieceNode);
            var model = new BranchGroup3D();
            model.addChild(modelTransformGroup);
            var sceneRoot = this.getSceneRoot(iconSize);
            sceneRoot.addChild(model);
            if (iconObserver) {
                PlanComponent.PieceOfFurnitureModelIcon.canvas3D.getImage(function (icon) {
                    iconObserver(icon);
                    sceneRoot.removeChild(model);
                });
                return undefined;
            }
            else {
                var icon = PlanComponent.PieceOfFurnitureModelIcon.canvas3D.getImage();
                sceneRoot.removeChild(model);
                return icon;
            }
        };
        /**
         * Returns the size of the given piece computed from its vertices.
         * @param {HomePieceOfFurniture} piece
         * @param {Object} object3dFactory
         * @return {Array}
         * @private
         */
        PieceOfFurnitureModelIcon.prototype.computePieceOfFurnitureSizeInPlan = function (piece, object3dFactory) {
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
        };
        return PieceOfFurnitureModelIcon;
    }(PieceOfFurnitureTopViewIcon));
    PlanComponent.PieceOfFurnitureModelIcon = PieceOfFurnitureModelIcon;
    /**
     * Creates a plan icon proxy for a <code>piece</code> of furniture.
     * @param {HomePieceOfFurniture} piece an object containing a plan icon content
     * @param {java.awt.Component} waitingComponent a waiting component. If <code>null</code>, the returned icon will
     * be read immediately in the current thread.
     * @class
     * @extends PlanComponent.PieceOfFurnitureTopViewIcon
     */
    var PieceOfFurniturePlanIcon = (function (_super) {
        __extends(PieceOfFurniturePlanIcon, _super);
        //        pieceWidth : number;
        //
        //        pieceDepth : number;
        //
        //        pieceColor : number;
        //
        //        pieceTexture : TextureImage;
        function PieceOfFurniturePlanIcon(piece, waitingComponent) {
            var _this = this;
            _super.call(this, null);
            //            this.pieceWidth = piece.getWidth();
            //            this.pieceDepth = piece.getDepth();
            //            this.pieceColor = piece.getColor();
            //            this.pieceTexture = piece.getTexture();
            if (this.image != PlanComponent.WAIT_TEXTURE_IMAGE && this.image != PlanComponent.ERROR_TEXTURE_IMAGE) {
                if (piece.getPlanIcon() != null) {
                    this.image = PlanComponent.WAIT_TEXTURE_IMAGE;
                    TextureManager.getInstance().loadTexture(piece.getPlanIcon(), true, {
                        textureUpdated: function (textureImage) {
                            _this.image = textureImage;
                            waitingComponent.repaint();
                        },
                        textureError: function (error) {
                            _this.image = PlanComponent.ERROR_TEXTURE_IMAGE;
                            waitingComponent.repaint();
                        }
                    });
                }
                else if (piece.getColor() != null) {
                    this.image = TextureManager.getInstance().getColoredImage(piece.getColor());
                }
                else if (piece.getTexture() != null) {
                    this.image = PlanComponent.WAIT_TEXTURE_IMAGE;
                    TextureManager.getInstance().loadTexture(piece.getTexture().getImage(), true, {
                        textureUpdated: function (textureImage) {
                            _this.image = textureImage;
                            waitingComponent.repaint();
                        },
                        textureError: function (error) {
                            _this.image = PlanComponent.ERROR_TEXTURE_IMAGE;
                            waitingComponent.repaint();
                        }
                    });
                }
            }
        }
        return PieceOfFurniturePlanIcon;
    }(PlanComponent.PieceOfFurnitureTopViewIcon));
    PlanComponent.PieceOfFurniturePlanIcon = PieceOfFurniturePlanIcon;
    PieceOfFurniturePlanIcon["__class"] = "com.eteks.sweethome3d.swing.PlanComponent.PieceOfFurniturePlanIcon";
    PieceOfFurniturePlanIcon["__interfaces"] = ["javax.swing.Icon"];
})(PlanComponent || (PlanComponent = {}));
PlanComponent.__static_initialize();
