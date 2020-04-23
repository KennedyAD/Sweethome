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


declare class SwingTools {
    getResolutionScale();
}

interface Content {
  getURL() : string;
}

declare class TextureManager {
    static getInstance() : TextureManager;
    getErrorImage() : HTMLImageElement;
    getWaitImage() : HTMLImageElement;
    loadTexture(content, angle, synchronous, textureObserver);
    loadTexture(content, synchronous, textureObserver);
    loadTexture(content, textureObserver);
}

declare class ShapeTools {
  getStroke(thickness, capStyle, joinStyle, dashPattern, dashOffset);
  getPolylineShape(points, curved, closedPath);  
  getShape(points, closedPath, transform);
}

declare namespace java.awt {
  class BasicStroke {
    constructor(thickness : number, strokeCapStyle?, strokeJoinStyle?, unkown?, dashPattern?, dashPhase?);
    
    getLineWidth() : number;
    static CAP_ROUND : number;
    static CAP_SQUARE : number;
    static CAP_BUTT : number;
    static JOIN_ROUND : number;
    static JOIN_BEVEL : number;
    static JOIN_MITER : number;
  }
}

declare class OperatingSystem {
    static isMacOSX() : boolean;
    static isWindows() : boolean;
}

declare function putToMap(map, key, value);
declare function getFromMap(map, key);

class FontMetrics {
  context : CanvasRenderingContext2D;
  cached : boolean;
  ascent : number;
  descent : number;
  height : number;
  width : number;
  font : string;
  
  constructor(font : string) {
    this.font = font;
    this.cached = false;
  }
  
  getStringBounds(aString : string) {
    this.compute(aString);
    return new java.awt.geom.Rectangle2D.Double(0, -this.ascent, this.width, this.height);
  }
  
  getAscent() : number {
    if(!this.cached) {
      this.compute("Llp");
    }
    return this.ascent;
  }
  
  getDescent() : number {
    if(!this.cached) {
      this.compute("Llp");
    }
    return this.descent;
  }

  getHeight() : number {
    if(!this.cached) {
      this.compute("Llp");
    }
    return this.height;
  }
  
  private compute(aString : string) {
    if(!this.cached) {
      this.context = document.createElement("canvas").getContext("2d");
      this.context.font = this.font;
    }
    var textMetrics = this.context.measureText(aString);
    if (textMetrics.fontBoundingBoxAscent) {
      this.cached = true;
      this.ascent = textMetrics.fontBoundingBoxAscent;
      this.descent = textMetrics.fontBoundingBoxDescent;
      this.height = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;
      this.width = textMetrics.width;
    } else {
      var heightArray = this.context.font.split(' ');
      var height = parseInt(height[heightArray.length - 1]);
      this.cached = true;
      this.ascent = 0.77 * height;
      this.descent = 0.23 * height;
      this.height = height;
      this.width = textMetrics.width;
    }
  }
  
}

/**
 * Creates a new plan that displays <code>home</code>.
 * @param {Home} home the home to display
 * @param {UserPreferences} preferences user preferences to retrieve used unit, grid visibility...
 * @param {Object} object3dFactory a factory able to create 3D objects from <code>home</code> furniture.
 * The {@link Object3DFactory#createObject3D(Home, Selectable, boolean) createObject3D} of
 * this factory is expected to return an instance of {@link Object3DBranch} in current implementation.
 * @param {PlanController} controller the optional controller used to manage home items modification
 * @class
 * @extends javax.swing.JComponent
 * @author Emmanuel Puybaret
 */
class PlanComponent implements PlanView {
    static __static_initialized : boolean = false;
    static __static_initialize() { if(!PlanComponent.__static_initialized) { PlanComponent.__static_initialized = true; PlanComponent.__static_initializer_0(); } }

    static MARGIN : number = 40;

    canvas : HTMLCanvasElement;
    //context : CanvasRenderingContext2D;

    font : string;
    
    mouseListener : any;

    /*private*/ home : Home;

    /*private*/ preferences : any;

    /*private*/ object3dFactory : any;

    /*private*/ resolutionScale : number;

    /*private*/ scale : number;

    /*private*/ selectedItemsOutlinePainted : boolean;

    /*private*/ backgroundPainted : boolean;

    /*private*/ //horizontalRuler : PlanComponent.PlanRulerComponent;

    /*private*/ //verticalRuler : PlanComponent.PlanRulerComponent;

    /*private*/ rotationCursor : string;

    /*private*/ elevationCursor : string;

    /*private*/ heightCursor : string;

    /*private*/ powerCursor : string;

    /*private*/ resizeCursor : string;

    /*private*/ moveCursor : string;

    /*private*/ panningCursor : string;

    /*private*/ duplicationCursor : string;

    /*private*/ rectangleFeedback : java.awt.geom.Rectangle2D;

    /*private*/ alignedObjectClass : any;

    /*private*/ alignedObjectFeedback : any;

    /*private*/ locationFeeback : java.awt.geom.Point2D;

    /*private*/ showPointFeedback : boolean;

    /*private*/ centerAngleFeedback : java.awt.geom.Point2D;

    /*private*/ point1AngleFeedback : java.awt.geom.Point2D;

    /*private*/ point2AngleFeedback : java.awt.geom.Point2D;

    /*private*/ draggedItemsFeedback : Array<any>;

    /*private*/ dimensionLinesFeedback : Array<any>;

    /*private*/ selectionScrollUpdated : boolean;

    /*private*/ wallsDoorsOrWindowsModification : boolean;

    /*private*/ resizeIndicatorVisible : boolean;

    /*private*/ sortedLevelFurniture : Array<any>;

    /*private*/ sortedLevelRooms : Array<any>;

    /*private*/ fonts : any;

    /*private*/ fontsMetrics : any;

    /*private*/ planBoundsCache : java.awt.geom.Rectangle2D;

    /*private*/ planBoundsCacheValid : boolean;

    /*private*/ invalidPlanBounds : java.awt.geom.Rectangle2D;

    /*private*/ backgroundImageCache : HTMLImageElement;

    /*private*/ patternImagesCache : any;

    /*private*/ otherLevelsWallsCache : Array<any>;

    /*private*/ otherLevelsWallAreaCache : java.awt.geom.Area;

    /*private*/ otherLevelsRoomsCache : Array<any>;

    /*private*/ otherLevelsRoomAreaCache : java.awt.geom.Area;

    /*private*/ wallsPatternBackgroundCache : string;

    /*private*/ wallsPatternForegroundCache : string;

    /*private*/ wallAreasCache : any;

    /*private*/ doorOrWindowWallThicknessAreasCache : any;

    /*private*/ floorTextureImagesCache : any;

    /*private*/ furnitureTopViewIconKeys : any;

    /*private*/ furnitureTopViewIconsCache : any;

    /*private*/ furnitureIconsCache : any;

    static POINT_INDICATOR : java.awt.Shape = null;

    static FURNITURE_ROTATION_INDICATOR : java.awt.geom.GeneralPath = null;

    static FURNITURE_PITCH_ROTATION_INDICATOR : java.awt.geom.GeneralPath = null;

    static FURNITURE_ROLL_ROTATION_INDICATOR : java.awt.Shape = null;

    static FURNITURE_RESIZE_INDICATOR : java.awt.geom.GeneralPath = null;

    static ELEVATION_INDICATOR : java.awt.geom.GeneralPath = null;

    static ELEVATION_POINT_INDICATOR : java.awt.Shape = null;

    static FURNITURE_HEIGHT_INDICATOR : java.awt.geom.GeneralPath = null;

    static FURNITURE_HEIGHT_POINT_INDICATOR : java.awt.Shape = null;

    static LIGHT_POWER_INDICATOR : java.awt.geom.GeneralPath = null;

    static LIGHT_POWER_POINT_INDICATOR : java.awt.Shape = null;

    static WALL_ORIENTATION_INDICATOR : java.awt.geom.GeneralPath = null;

    static WALL_POINT : java.awt.Shape = null;

    static WALL_ARC_EXTENT_INDICATOR : java.awt.geom.GeneralPath = null;

    static WALL_AND_LINE_RESIZE_INDICATOR : java.awt.geom.GeneralPath = null;

    static CAMERA_YAW_ROTATION_INDICATOR : java.awt.Shape = null;

    static CAMERA_PITCH_ROTATION_INDICATOR : java.awt.Shape = null;

    static CAMERA_ELEVATION_INDICATOR : java.awt.geom.GeneralPath = null;

    static CAMERA_BODY : java.awt.Shape = null;

    static CAMERA_HEAD : java.awt.Shape = null;

    static DIMENSION_LINE_END : java.awt.geom.GeneralPath = null;

    static TEXT_LOCATION_INDICATOR : java.awt.geom.GeneralPath = null;

    static TEXT_ANGLE_INDICATOR : java.awt.geom.GeneralPath = null;

    static LABEL_CENTER_INDICATOR : java.awt.Shape = null;

    static COMPASS_DISC : java.awt.Shape = null;

    static COMPASS : java.awt.geom.GeneralPath = null;

    static COMPASS_ROTATION_INDICATOR : java.awt.geom.GeneralPath = null;

    static COMPASS_RESIZE_INDICATOR : java.awt.geom.GeneralPath = null;

    static ARROW : java.awt.geom.GeneralPath = null;

    static INDICATOR_STROKE : java.awt.BasicStroke = new java.awt.BasicStroke(1.5);

    static POINT_STROKE : java.awt.BasicStroke = new java.awt.BasicStroke(2.0);

    static WALL_STROKE_WIDTH : number = 1.5;

    static BORDER_STROKE_WIDTH : number = 1.0;

    static ERROR_TEXTURE_IMAGE : HTMLImageElement = null;

    static WAIT_TEXTURE_IMAGE : HTMLImageElement = null;

    static  __static_initializer_0() {
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
        let transform : java.awt.geom.AffineTransform = java.awt.geom.AffineTransform.getRotateInstance(-Math.PI / 2);
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
        let cameraBodyAreaPath : java.awt.geom.GeneralPath = new java.awt.geom.GeneralPath();
        cameraBodyAreaPath.append(new java.awt.geom.Ellipse2D.Float(-0.5, -0.425, 1.0, 0.85), false);
        cameraBodyAreaPath.append(new java.awt.geom.Ellipse2D.Float(-0.5, -0.3, 0.24, 0.6), false);
        cameraBodyAreaPath.append(new java.awt.geom.Ellipse2D.Float(0.26, -0.3, 0.24, 0.6), false);
        PlanComponent.CAMERA_BODY = new java.awt.geom.Area(cameraBodyAreaPath);
        let cameraHeadAreaPath : java.awt.geom.GeneralPath = new java.awt.geom.GeneralPath();
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
        let stroke : java.awt.BasicStroke = new java.awt.BasicStroke(0.01);
        PlanComponent.COMPASS = new java.awt.geom.GeneralPath(stroke.createStrokedShape(PlanComponent.COMPASS_DISC));
        PlanComponent.COMPASS.append(stroke.createStrokedShape(new java.awt.geom.Line2D.Float(-0.6, 0, -0.5, 0)), false);
        PlanComponent.COMPASS.append(stroke.createStrokedShape(new java.awt.geom.Line2D.Float(0.6, 0, 0.5, 0)), false);
        PlanComponent.COMPASS.append(stroke.createStrokedShape(new java.awt.geom.Line2D.Float(0, 0.6, 0, 0.5)), false);
        stroke = new java.awt.BasicStroke(0.04, java.awt.BasicStroke.CAP_ROUND, java.awt.BasicStroke.JOIN_ROUND);
        PlanComponent.COMPASS.append(stroke.createStrokedShape(new java.awt.geom.Line2D.Float(0, 0, 0, 0)), false);
        let compassNeedle : java.awt.geom.GeneralPath = new java.awt.geom.GeneralPath();
        compassNeedle.moveTo(0, -0.47);
        compassNeedle.lineTo(0.15, 0.46);
        compassNeedle.lineTo(0, 0.32);
        compassNeedle.lineTo(-0.15, 0.46);
        compassNeedle.closePath();
        stroke = new java.awt.BasicStroke(0.03);
        PlanComponent.COMPASS.append(stroke.createStrokedShape(compassNeedle), false);
        let compassNorthDirection : java.awt.geom.GeneralPath = new java.awt.geom.GeneralPath();
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
    }

    public constructor(canvasId : string, home : Home, preferences? : any, object3dFactory? : any, controller : PlanController) {
        this.canvas = <HTMLCanvasElement>document.getElementById(canvasId);
        var computedStyle = window.getComputedStyle(this.canvas);
        this.font = computedStyle.fontFamily + " " + computedStyle.fontStyle + " " + computedStyle.fontSize;
        this.resolutionScale = 1.0;
        this.scale = 0.5 * this.resolutionScale;
        this.selectedItemsOutlinePainted = true;
        this.backgroundPainted = true;
        this.planBoundsCacheValid = false;
        this.home = home;
        this.preferences = preferences;
        /*if (object3dFactory == null) {
          var gl = <any>this.canvas.getContext("webgl");
          if (!gl) {
            gl = this.canvas.getContext("experimental-webgl");
          }
          if (gl) {
            //object3dFactory = new Object3DBranchFactory();
          }
        }*/
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
        this.patternImagesCache = <any>({});
        //setForeground(Color.BLACK);
        //setBackground(Color.WHITE);
        this.repaint();
        setTimeout(() => {
          if (this.paintingRequest) {
            console.error("<<painting request dequeued>>");
            this.repaint();
          }
        }, 500);
    }

    getGraphics() : Graphics2D {
      return new Graphics2D(this.canvas);
    }

    painting : boolean = false;
    paintingRequest : boolean = false;

    repaint() : void {
      if(!this.painting) {
        var t = Date.now();
        console.error("<<painting>>");
        this.painting = true;
        this.paintingRequest = false;
        this.paintComponent(this.getGraphics());
        this.painting = false;
        console.error("<<end painting>> - "+(Date.now() - t));
      } else {
        console.error("<<painting request queued>>");
        this.paintingRequest = true;
      }
    }

    revalidate() : void {
      this.repaint();
    }

    private isOpaque() : boolean {
        return true;
    }

    private getWidth() {
        return this.canvas.width;
    }

    private getHeight() {
        return this.canvas.height;
    }

    setToolTipFeedback(s : string, x: number, y:number) {
        // TODO
    }

    private setOpaque(opaque : boolean) {
      // TODO
    }
    
    private getBackground() : string {
      return Color.WHITE;
    }

    private getForeground() : string {
      return Color.BLACK;
    }

    private setFont(font : string) {
      this.font = font;
    }
    
    private getParent() {
      return null;
    }
    
    private getInsets() {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    /**
     * Adds home items and selection listeners on this component to receive
     * changes notifications from home.
     * @param {Home} home
     * @param {UserPreferences} preferences
     * @param {PlanController} controller
     * @private
     */
    addModelListeners(home : any, preferences : any, controller : any) {
        let furnitureChangeListener : PropertyChangeListener = {
          propertyChange : (ev : PropertyChangeEvent) => {
            if(this.furnitureTopViewIconKeys != null && (/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"MODEL_TRANSFORMATIONS",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"ROLL",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"PITCH",ev.getPropertyName())) || (/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"WIDTH_IN_PLAN",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"DEPTH_IN_PLAN",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"HEIGHT_IN_PLAN",ev.getPropertyName()))) && ((ev.getSource()).isHorizontallyRotated() || (ev.getSource()).getTexture() != null))) {
                if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"HEIGHT_IN_PLAN",ev.getPropertyName()))) {
                    this.sortedLevelFurniture = null;
                }
                if(!(ev.getSource() != null && ev.getSource() instanceof <any>HomeFurnitureGroup)) {
                    if(controller == null || !controller.isModificationState()) {
                        /* remove */((m,k) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { return m.entries.splice(i,1)[0]; } })(<any>this.furnitureTopViewIconKeys, ev.getSource());
                    } else {
                        controller.addPropertyChangeListener("MODIFICATION_STATE", 
                        {
                          propertyChange : (ev2 : PropertyChangeEvent) => {
                            
                            /* remove */((m,k) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { return m.entries.splice(i,1)[0]; } })(<any>this.furnitureTopViewIconKeys, ev.getSource());
                            this.repaint();
                            controller.removePropertyChangeListener("MODIFICATION_STATE", this);
                          }
                        });
                    }
                }
                this.revalidate();
            } else if(this.furnitureTopViewIconKeys != null && (/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"COLOR",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"TEXTURE",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"MODEL_MATERIALS",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"SHININESS",ev.getPropertyName())))) {
                /* remove */((m,k) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { return m.entries.splice(i,1)[0]; } })(<any>this.furnitureTopViewIconKeys, ev.getSource());
                this.repaint();
            } else if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"ELEVATION",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"LEVEL",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"HEIGHT_IN_PLAN",ev.getPropertyName()))) {
                this.sortedLevelFurniture = null;
                this.repaint();
            } else if(this.doorOrWindowWallThicknessAreasCache != null && /* containsKey */((m,k) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { return true; } return false; })(<any>this.doorOrWindowWallThicknessAreasCache, ev.getSource()) && (/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"WIDTH",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"DEPTH",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"ANGLE",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"MODEL_MIRRORED",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"MODEL_TRANSFORMATIONS",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"X",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"Y",ev.getPropertyName())) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"LEVEL",ev.getPropertyName())))) {
                /* remove */((m,k) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { return m.entries.splice(i,1)[0]; } })(<any>this.doorOrWindowWallThicknessAreasCache, ev.getSource());
                this.revalidate();
            } else {
                this.revalidate();
            }
          }
        }

        
        {
            let array122 = home.getFurniture();
            for(let index121=0; index121 < array122.length; index121++) {
                let piece = array122[index121];
                {
                    piece.addPropertyChangeListener(furnitureChangeListener);
                    if(piece != null && piece instanceof <any>HomeFurnitureGroup) {
                        {
                            let array124 = (piece).getAllFurniture();
                            for(let index123=0; index123 < array124.length; index123++) {
                                let childPiece = array124[index123];
                                {
                                    childPiece.addPropertyChangeListener(furnitureChangeListener);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        home.addFurnitureListener((ev : any) => {
            let piece : any = ev.getItem();
            if(ev.getType() === CollectionEvent.Type.ADD) {
                piece.addPropertyChangeListener(furnitureChangeListener);
                if(piece != null && piece instanceof <any>HomeFurnitureGroup) {
                    {
                        let array126 = (piece).getAllFurniture();
                        for(let index125=0; index125 < array126.length; index125++) {
                            let childPiece = array126[index125];
                            {
                                childPiece.addPropertyChangeListener(furnitureChangeListener);
                            }
                        }
                    }
                }
            } else if(ev.getType() === CollectionEvent.Type.DELETE) {
                piece.removePropertyChangeListener(furnitureChangeListener);
                if(piece != null && piece instanceof <any>HomeFurnitureGroup) {
                    {
                        let array128 = (piece).getAllFurniture();
                        for(let index127=0; index127 < array128.length; index127++) {
                            let childPiece = array128[index127];
                            {
                                childPiece.removePropertyChangeListener(furnitureChangeListener);
                            }
                        }
                    }
                }
            }
            this.sortedLevelFurniture = null;
            this.revalidate();
        });
        let wallChangeListener : PropertyChangeListener = {
                  propertyChange : (ev : PropertyChangeEvent) => {
            let propertyName : string = ev.getPropertyName();
            if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"X_START",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"X_END",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"Y_START",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"Y_END",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"WALL_AT_START",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"WALL_AT_END",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"THICKNESS",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"ARC_EXTENT",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"PATTERN",propertyName))) {
                if(this.home.isAllLevelsSelection()) {
                    this.otherLevelsWallAreaCache = null;
                    this.otherLevelsWallsCache = null;
                }
                this.wallAreasCache = null;
                this.doorOrWindowWallThicknessAreasCache = null;
                this.revalidate();
            } else if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"LEVEL",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"HEIGHT",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"HEIGHT_AT_END",propertyName))) {
                this.otherLevelsWallAreaCache = null;
                this.otherLevelsWallsCache = null;
                this.wallAreasCache = null;
                this.repaint();
            }
          }
        };
        
        {
            let array130 = home.getWalls();
            for(let index129=0; index129 < array130.length; index129++) {
                let wall = array130[index129];
                {
                    wall.addPropertyChangeListener(wallChangeListener);
                }
            }
        }
        home.addWallsListener((ev : any) => {
            if(ev.getType() === CollectionEvent.Type.ADD) {
                ev.getItem().addPropertyChangeListener(wallChangeListener);
            } else if(ev.getType() === CollectionEvent.Type.DELETE) {
                ev.getItem().removePropertyChangeListener(wallChangeListener);
            }
            this.otherLevelsWallAreaCache = null;
            this.otherLevelsWallsCache = null;
            this.wallAreasCache = null;
            this.doorOrWindowWallThicknessAreasCache = null;
            this.revalidate();
        });
        
        let roomChangeListener : PropertyChangeListener = {
          propertyChange : (ev : PropertyChangeEvent) => {
            let propertyName : string = ev.getPropertyName();
            if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"POINTS",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"NAME",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"NAME_X_OFFSET",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"NAME_Y_OFFSET",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"NAME_STYLE",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"NAME_ANGLE",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"AREA_VISIBLE",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"AREA_X_OFFSET",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"AREA_Y_OFFSET",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"AREA_STYLE",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"AREA_ANGLE",propertyName))) {
                this.sortedLevelRooms = null;
                this.otherLevelsRoomAreaCache = null;
                this.otherLevelsRoomsCache = null;
                this.revalidate();
            } else if(this.preferences.isRoomFloorColoredOrTextured() && (/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"FLOOR_COLOR",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"FLOOR_TEXTURE",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"FLOOR_VISIBLE",propertyName)))) {
                this.repaint();
            }
          }
        }        
        
        {
            let array132 = home.getRooms();
            for(let index131=0; index131 < array132.length; index131++) {
                let room = array132[index131];
                {
                    room.addPropertyChangeListener(roomChangeListener);
                }
            }
        }
        home.addRoomsListener((ev : any) => {
            if(ev.getType() === CollectionEvent.Type.ADD) {
                ev.getItem().addPropertyChangeListener(roomChangeListener);
            } else if(ev.getType() === CollectionEvent.Type.DELETE) {
                ev.getItem().removePropertyChangeListener(roomChangeListener);
            }
            this.sortedLevelRooms = null;
            this.otherLevelsRoomAreaCache = null;
            this.otherLevelsRoomsCache = null;
            this.revalidate();
        });
        let changeListener : PropertyChangeListener = {
          propertyChange : (ev : PropertyChangeEvent) => {
              let propertyName : string = ev.getPropertyName();
              if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"COLOR",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"DASH_STYLE",propertyName))) {
                  this.repaint();
              } else {
                  this.revalidate();
              }
          }
        }
        
        {
            let array134 = home.getPolylines();
            for(let index133=0; index133 < array134.length; index133++) {
                let polyline = array134[index133];
                {
                    polyline.addPropertyChangeListener(changeListener);
                }
            }
        }
        home.addPolylinesListener((ev : any) => {
            if(ev.getType() === CollectionEvent.Type.ADD) {
                ev.getItem().addPropertyChangeListener(changeListener);
            } else if(ev.getType() === CollectionEvent.Type.DELETE) {
                ev.getItem().removePropertyChangeListener(changeListener);
            }
            this.revalidate();
        });
        let dimensionLineChangeListener : PropertyChangeListener = {
          propertyChange : (ev : PropertyChangeEvent) => this.revalidate()
        }
        {
            let array136 = home.getDimensionLines();
            for(let index135=0; index135 < array136.length; index135++) {
                let dimensionLine = array136[index135];
                {
                    dimensionLine.addPropertyChangeListener(dimensionLineChangeListener);
                }
            }
        }
        home.addDimensionLinesListener((ev : any) => {
            if(ev.getType() === CollectionEvent.Type.ADD) {
                ev.getItem().addPropertyChangeListener(dimensionLineChangeListener);
            } else if(ev.getType() === CollectionEvent.Type.DELETE) {
                ev.getItem().removePropertyChangeListener(dimensionLineChangeListener);
            }
            this.revalidate();
        });
        let labelChangeListener : PropertyChangeListener = {
          propertyChange : (ev : PropertyChangeEvent) => this.revalidate()
        }
        {
            let array138 = home.getLabels();
            for(let index137=0; index137 < array138.length; index137++) {
                let label = array138[index137];
                {
                    label.addPropertyChangeListener(labelChangeListener);
                }
            }
        }
        home.addLabelsListener((ev : any) => {
            if(ev.getType() === CollectionEvent.Type.ADD) {
                ev.getItem().addPropertyChangeListener(labelChangeListener);
            } else if(ev.getType() === CollectionEvent.Type.DELETE) {
                ev.getItem().removePropertyChangeListener(labelChangeListener);
            }
            this.revalidate();
        });
        let levelChangeListener : PropertyChangeListener = {
          propertyChange : (ev : PropertyChangeEvent) => {
            let propertyName : string = ev.getPropertyName();
            if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"BACKGROUND_IMAGE",propertyName))) {
                this.backgroundImageCache = null;
                this.revalidate();
            } else if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"ELEVATION",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"ELEVATION_INDEX",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"VIEWABLE",propertyName))) {
                this.backgroundImageCache = null;
                this.otherLevelsWallAreaCache = null;
                this.otherLevelsWallsCache = null;
                this.otherLevelsRoomAreaCache = null;
                this.otherLevelsRoomsCache = null;
                this.wallAreasCache = null;
                this.doorOrWindowWallThicknessAreasCache = null;
                this.sortedLevelFurniture = null;
                this.sortedLevelRooms = null;
                this.repaint();
            }
            
          }
        }
        
        {
            let array140 = home.getLevels();
            for(let index139=0; index139 < array140.length; index139++) {
                let level = array140[index139];
                {
                    level.addPropertyChangeListener(levelChangeListener);
                }
            }
        }
        home.addLevelsListener((ev : any) => {
            let level : any = ev.getItem();
            if(ev.getType() === CollectionEvent.Type.ADD) {
                level.addPropertyChangeListener(levelChangeListener);
            } else if(ev.getType() === CollectionEvent.Type.DELETE) {
                level.removePropertyChangeListener(levelChangeListener);
            }
            this.revalidate();
        });
        home.addPropertyChangeListener("CAMERA", 
        {
          propertyChange : (ev : PropertyChangeEvent) => this.revalidate()
        });
        home.getObserverCamera().addPropertyChangeListener(
          {
          propertyChange : (ev : PropertyChangeEvent) => {
            let propertyName : string = ev.getPropertyName();
            if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"X",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"Y",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"FIELD_OF_VIEW",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"YAW",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"WIDTH",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"DEPTH",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"HEIGHT",propertyName))) {
                this.revalidate();
            }
          }
        });
        home.getCompass().addPropertyChangeListener(
        {
          propertyChange : (ev : PropertyChangeEvent) => {
            let propertyName : string = ev.getPropertyName();
            if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"X",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"Y",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"NORTH_DIRECTION",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"DIAMETER",propertyName)) || /* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(/* name */"VISIBLE",propertyName))) {
                this.revalidate();
            }
          }
        });
        home.addSelectionListener({
          selectionChanged : (ev : any) => this.repaint() 
        });
        home.addPropertyChangeListener("BACKGROUND_IMAGE", 
          {
             propertyChange : (ev : PropertyChangeEvent) => {
              this.backgroundImageCache = null;
              this.repaint();
            }
            
          });
        home.addPropertyChangeListener("SELECTED_LEVEL", 
          {
             propertyChange : (ev : PropertyChangeEvent) => {
                this.backgroundImageCache = null;
                this.otherLevelsWallAreaCache = null;
                this.otherLevelsWallsCache = null;
                this.otherLevelsRoomAreaCache = null;
                this.otherLevelsRoomsCache = null;
                this.wallAreasCache = null;
                this.doorOrWindowWallThicknessAreasCache = null;
                this.sortedLevelRooms = null;
                this.sortedLevelFurniture = null;
                this.repaint();
            }
            
          });
        let preferencesListener : PlanComponent.UserPreferencesChangeListener = new PlanComponent.UserPreferencesChangeListener(this);
        preferences.addPropertyChangeListener("UNIT", preferencesListener);
        preferences.addPropertyChangeListener("LANGUAGE", preferencesListener);
        preferences.addPropertyChangeListener("GRID_VISIBLE", preferencesListener);
        preferences.addPropertyChangeListener("DEFAULT_FONT_NAME", preferencesListener);
        preferences.addPropertyChangeListener("FURNITURE_VIEWED_FROM_TOP", preferencesListener);
        preferences.addPropertyChangeListener("FURNITURE_MODEL_ICON_SIZE", preferencesListener);
        preferences.addPropertyChangeListener("ROOM_FLOOR_COLORED_OR_TEXTURED", preferencesListener);
        preferences.addPropertyChangeListener("WALL_PATTERN", preferencesListener);
    }

    /**
     * Adds AWT mouse listeners to this component that calls back <code>controller</code> methods.
     * @param {PlanController} controller
     * @private
     */
    addMouseListeners(controller : PlanController) {
      
      var mouseListener = {
        lastMousePressedLocation : null,
        mousePressed : function(ev : MouseEvent) {
          if(this.isEnabled() && ev.button === 0) {
            mouseListener.lastMousePressedLocation = [ ev.clientX, ev.clientY ];
            let alignmentActivated: boolean = OperatingSystem.isWindows() || OperatingSystem.isMacOSX() ? ev.shiftKey : ev.shiftKey && !ev.altKey;
            let duplicationActivated: boolean = OperatingSystem.isMacOSX() ? ev.altKey : ev.ctrlKey;
            let magnetismToggled: boolean = OperatingSystem.isWindows() ? ev.altKey : (OperatingSystem.isMacOSX() ? ev.metaKey : ev.shiftKey && ev.altKey);
            controller.pressMouse(ev.clientX, ev.clientY, 1, ev.shiftKey && !ev.altKey && !ev.ctrlKey && !ev.metaKey, alignmentActivated, duplicationActivated, magnetismToggled);
          }
        },
        mouseReleased : function(ev : MouseEvent) {
            if(this.isEnabled() && ev.button === 0) {
                this.controller.releaseMouse(ev.clientX, ev.clientY);
            }
        },
        mouseMoved : function(ev : MouseEvent) {
          if(this.lastMousePressedLocation != null && !(this.lastMousePressedLocation[0] === ev.clientX && this.lastMousePressedLocation[1] === ev.clientY)) {
                this.lastMousePressedLocation = null;
            }
            if(this.lastMousePressedLocation == null) {
              if(this.isEnabled()) {
                this.controller.moveMouse(ev.clientX, ev.clientY);
              }
            }       
        },
        mouseWheelMoved : function(ev : MouseWheelEvent) {
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

    }

    /**
     * Adds AWT focus listener to this component that calls back <code>controller</code>
     * escape method on focus lost event.
     * @param {PlanController} controller
     * @private
     */
    addFocusListener(controller : any) {
      // TODO?
        //this.addFocusListener(new PlanComponent.PlanComponent$15(this, controller));
        //if(com.eteks.sweethome3d.tools.OperatingSystem.isMacOSXLeopardOrSuperior()) {
        //    this.addPropertyChangeListener("Frame.active", new PlanComponent.PlanComponent$16(this));
        //}
    }

    /**
     * Adds a listener to the controller to follow changes in base plan modification state.
     * @param {PlanController} controller
     * @private
     */
    addControllerListener(controller : any) {
        controller.addPropertyChangeListener("BASE_PLAN_MODIFICATION_STATE", new PlanComponent.PlanComponent$17(this, controller));
    }

    /**
     * Installs default keys bound to actions.
     * @private
     */
    installDefaultKeyboardActions() {
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
    }

    /**
     * Installs keys bound to actions during edition.
     * @private
     */
    installEditionKeyboardActions() {
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
    }

    /**
     * Creates actions that calls back <code>controller</code> methods.
     * @param {PlanController} controller
     * @private
     */
    createActions(controller : any) {
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
    }

    /**
     * Returns the preferred size of this component.
     * @return {java.awt.Dimension}
     */
    /*public getPreferredSize() : java.awt.Dimension {
        if(this.isPreferredSizeSet()) {
            return super.getPreferredSize();
        } else {
            let insets : java.awt.Insets = this.getInsets();
            let planBounds : java.awt.geom.Rectangle2D = this.getPlanBounds();
            return new java.awt.Dimension(Math.round((<number>planBounds.getWidth() + PlanComponent.MARGIN * 2) * this.getScale()) + insets.left + insets.right, Math.round((<number>planBounds.getHeight() + PlanComponent.MARGIN * 2) * this.getScale()) + insets.top + insets.bottom);
        }
    }*/

    /**
     * Returns the bounds of the plan displayed by this component.
     * @return {java.awt.geom.Rectangle2D}
     * @private
     */
    getPlanBounds() : java.awt.geom.Rectangle2D {
        if(!this.planBoundsCacheValid) {
            if(this.planBoundsCache == null) {
                this.planBoundsCache = new java.awt.geom.Rectangle2D.Float(0, 0, 1000, 1000);
            }
            if(this.backgroundImageCache != null) {
                let backgroundImage : any = this.home.getBackgroundImage();
                if(backgroundImage != null) {
                    this.planBoundsCache.add(-backgroundImage.getXOrigin(), -backgroundImage.getYOrigin());
                    this.planBoundsCache.add(this.backgroundImageCache.width * backgroundImage.getScale() - backgroundImage.getXOrigin(), this.backgroundImageCache.height * backgroundImage.getScale() - backgroundImage.getYOrigin());
                }
                {
                    let array144 = this.home.getLevels();
                    for(let index143=0; index143 < array144.length; index143++) {
                        let level = array144[index143];
                        {
                            let levelBackgroundImage : any = level.getBackgroundImage();
                            if(levelBackgroundImage != null) {
                                this.planBoundsCache.add(-levelBackgroundImage.getXOrigin(), -levelBackgroundImage.getYOrigin());
                                this.planBoundsCache.add(this.backgroundImageCache.width * levelBackgroundImage.getScale() - levelBackgroundImage.getXOrigin(), this.backgroundImageCache.height * levelBackgroundImage.getScale() - levelBackgroundImage.getYOrigin());
                            }
                        }
                    }
                }
            }
            let g : Graphics2D = <Graphics2D>this.getGraphics();
            if(g != null) {
                this.setRenderingHints(g);
            }
            let homeItemsBounds : java.awt.geom.Rectangle2D = this.getItemsBounds(g, this.getPaintedItems());
            if(homeItemsBounds != null) {
                this.planBoundsCache.add(homeItemsBounds);
            }
            {
                let array146 = this.home.getObserverCamera().getPoints();
                for(let index145=0; index145 < array146.length; index145++) {
                    let point = array146[index145];
                    {
                        this.planBoundsCache.add(point[0], point[1]);
                    }
                }
            }
            this.planBoundsCacheValid = true;
        }
        return this.planBoundsCache;
    }

    /**
     * Returns the collection of walls, furniture, rooms and dimension lines of the home
     * painted by this component wherever the level they belong to is selected or not.
     * @return {*[]}
     */
    getPaintedItems() : Array<any> {
        return this.home.getSelectableViewableItems();
    }

    /**
     * Returns the bounds of the given collection of <code>items</code>.
     * @param {Graphics2D} g
     * @param {Bound[]} items
     * @return {java.awt.geom.Rectangle2D}
     * @private
     */
    getItemsBounds(g : Graphics2D, items : Array<any>) : java.awt.geom.Rectangle2D {
        let itemsBounds : java.awt.geom.Rectangle2D = null;
        for(let index147=0; index147 < items.length; index147++) {
            let item = items[index147];
            {
                if(itemsBounds == null) {
                    itemsBounds = this.getItemBounds(g, item);
                } else {
                    itemsBounds.add(this.getItemBounds(g, item));
                }
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
    getItemBounds(g : Graphics2D, item : any) : java.awt.geom.Rectangle2D {
        let points : number[][] = item.getPoints();
        let itemBounds : java.awt.geom.Rectangle2D = new java.awt.geom.Rectangle2D.Float(points[0][0], points[0][1], 0, 0);
        for(let i : number = 1; i < points.length; i++) {{
            itemBounds.add(points[i][0], points[i][1]);
        };}
        let componentFont : string;
        if(g != null) {
            componentFont = g.getFont();
        } else {
            componentFont = this.getFont();
        }
        if(item != null && item instanceof <any>Room) {
            let room : any = item;
            let xRoomCenter : number = room.getXCenter();
            let yRoomCenter : number = room.getYCenter();
            let roomName : string = room.getName();
            if(roomName != null && roomName.length > 0) {
                this.addTextBounds((<any>room.constructor), roomName, room.getNameStyle(), xRoomCenter + room.getNameXOffset(), yRoomCenter + room.getNameYOffset(), room.getNameAngle(), itemBounds);
            }
            if(room.isAreaVisible()) {
                let area : number = room.getArea();
                if(area > 0.01) {
                    let areaText : string = this.preferences.getLengthUnit().getAreaFormatWithUnit().format(area);
                    this.addTextBounds((<any>room.constructor), areaText, room.getAreaStyle(), xRoomCenter + room.getAreaXOffset(), yRoomCenter + room.getAreaYOffset(), room.getAreaAngle(), itemBounds);
                }
            }
        } else if(item != null && item instanceof <any>Polyline) {
            let polyline : any = item;
            return ShapeTools.getPolylineShape(polyline.getPoints(), polyline.getJoinStyle() === Polyline.JoinStyle.CURVED, polyline.isClosedPath()).getBounds2D();
        } else if(item != null && item instanceof <any>HomePieceOfFurniture) {
            if(item != null && item instanceof <any>HomeDoorOrWindow) {
                let doorOrWindow : any = item;
                {
                    let array149 = doorOrWindow.getSashes();
                    for(let index148=0; index148 < array149.length; index148++) {
                        let sash = array149[index148];
                        {
                            itemBounds.add(this.getDoorOrWindowSashShape(doorOrWindow, sash).getBounds2D());
                        }
                    }
                }
            } else if(item != null && item instanceof <any>HomeFurnitureGroup) {
                itemBounds.add(this.getItemsBounds(g, (item).getFurniture()));
            }
            let piece : any = item;
            let pieceName : string = piece.getName();
            if(piece.isVisible() && piece.isNameVisible() && pieceName.length > 0) {
                this.addTextBounds((<any>piece.constructor), pieceName, piece.getNameStyle(), piece.getX() + piece.getNameXOffset(), piece.getY() + piece.getNameYOffset(), piece.getNameAngle(), itemBounds);
            }
        } else if(item != null && item instanceof <any>DimensionLine) {
            let dimensionLine : any = item;
            let dimensionLineLength : number = dimensionLine.getLength();
            let lengthText : string = this.preferences.getLengthUnit().getFormat().format(dimensionLineLength);
            let lengthStyle : any = dimensionLine.getLengthStyle();
            if(lengthStyle == null) {
                lengthStyle = this.preferences.getDefaultTextStyle((<any>dimensionLine.constructor));
            }
            let lengthFontMetrics : FontMetrics = this.getFontMetrics(componentFont, lengthStyle);
            let lengthTextBounds : java.awt.geom.Rectangle2D = lengthFontMetrics.getStringBounds(lengthText);
            let angle : number = Math.atan2(dimensionLine.getYEnd() - dimensionLine.getYStart(), dimensionLine.getXEnd() - dimensionLine.getXStart());
            let transform : java.awt.geom.AffineTransform = java.awt.geom.AffineTransform.getTranslateInstance(dimensionLine.getXStart(), dimensionLine.getYStart());
            transform.rotate(angle);
            transform.translate(0, dimensionLine.getOffset());
            transform.translate((dimensionLineLength - lengthTextBounds.getWidth()) / 2, dimensionLine.getOffset() <= 0?-lengthFontMetrics.getDescent() - 1:lengthFontMetrics.getAscent() + 1);
            let lengthTextBoundsPath : java.awt.geom.GeneralPath = new java.awt.geom.GeneralPath(lengthTextBounds);
            for(let it : java.awt.geom.PathIterator = lengthTextBoundsPath.getPathIterator(transform); !it.isDone(); it.next()) {{
                let pathPoint : number[] = [0, 0];
                if(it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
                    itemBounds.add(pathPoint[0], pathPoint[1]);
                }
            };}
            transform.setToTranslation(dimensionLine.getXStart(), dimensionLine.getYStart());
            transform.rotate(angle);
            transform.translate(0, dimensionLine.getOffset());
            for(let it : java.awt.geom.PathIterator = PlanComponent.DIMENSION_LINE_END.getPathIterator(transform); !it.isDone(); it.next()) {{
                let pathPoint : number[] = [0, 0];
                if(it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
                    itemBounds.add(pathPoint[0], pathPoint[1]);
                }
            };}
            transform.translate(dimensionLineLength, 0);
            for(let it : java.awt.geom.PathIterator = PlanComponent.DIMENSION_LINE_END.getPathIterator(transform); !it.isDone(); it.next()) {{
                let pathPoint : number[] = [0, 0];
                if(it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
                    itemBounds.add(pathPoint[0], pathPoint[1]);
                }
            };}
        } else if(item != null && item instanceof <any>Label) {
            let label : any = item;
            this.addTextBounds((<any>label.constructor), label.getText(), label.getStyle(), label.getX(), label.getY(), label.getAngle(), itemBounds);
        } else if(item != null && item instanceof <any>Compass) {
            let compass : any = item;
            let transform : java.awt.geom.AffineTransform = java.awt.geom.AffineTransform.getTranslateInstance(compass.getX(), compass.getY());
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
    addTextBounds(selectableClass : any, text : string, style : any, x : number, y : number, angle : number, bounds : java.awt.geom.Rectangle2D) {
        if(style == null) {
            style = this.preferences.getDefaultTextStyle(selectableClass);
        }
        {
            let array151 = this.getTextBounds(text, style, x, y, angle);
            for(let index150=0; index150 < array151.length; index150++) {
                let points = array151[index150];
                {
                    bounds.add(points[0], points[1]);
                }
            }
        }
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
    public getTextBounds(text : string, style : any, x : number, y : number, angle : number) : number[][] {
        let fontMetrics : FontMetrics = this.getFontMetrics(this.getFont(), style);
        let textBounds : java.awt.geom.Rectangle2D = null;
        let lines : string[] = text.split("\n");
        let g : Graphics2D = <Graphics2D>this.getGraphics();
        if(g != null) {
            this.setRenderingHints(g);
        }
        for(let i : number = 0; i < lines.length; i++) {{
            let lineBounds : java.awt.geom.Rectangle2D = fontMetrics.getStringBounds(lines[i]);
            if(textBounds == null || textBounds.getWidth() < lineBounds.getWidth()) {
                textBounds = lineBounds;
            }
        };}
        let textWidth : number = <number>textBounds.getWidth();
        let shiftX : number;
        if(style.getAlignment() === TextStyle.Alignment.LEFT) {
            shiftX = 0;
        } else if(style.getAlignment() === TextStyle.Alignment.RIGHT) {
            shiftX = -textWidth;
        } else {
            shiftX = -textWidth / 2;
        }
        if(angle === 0) {
            let minY : number = <number>(y + textBounds.getY());
            let maxY : number = <number>(minY + textBounds.getHeight());
            minY -= <number>(textBounds.getHeight() * (lines.length - 1));
            return [[x + shiftX, minY], [x + shiftX + textWidth, minY], [x + shiftX + textWidth, maxY], [x + shiftX, maxY]];
        } else {
            textBounds.add(textBounds.getX(), textBounds.getY() - textBounds.getHeight() * (lines.length - 1));
            let transform : java.awt.geom.AffineTransform = new java.awt.geom.AffineTransform();
            transform.translate(x, y);
            transform.rotate(angle);
            transform.translate(shiftX, 0);
            let textBoundsPath : java.awt.geom.GeneralPath = new java.awt.geom.GeneralPath(textBounds);
            let textPoints : Array<number[]> = <any>([]);
            for(let it : java.awt.geom.PathIterator = textBoundsPath.getPathIterator(transform); !it.isDone(); it.next()) {{
                let pathPoint : number[] = [0, 0];
                if(it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
                    /* add */(textPoints.push(pathPoint)>0);
                }
            };}
            return /* toArray */textPoints.slice(0);
        }
    }

    /**
     * Returns the AWT font matching a given text style.
     * @param {string} defaultFont
     * @param {TextStyle} textStyle
     * @return {string}
     */
    getFont(defaultFont? : string, textStyle? : TextStyle) : string {
        if(defaultFont == null && textStyle == null) {
          return this.font;
        }
        if(this.fonts == null) {
            this.fonts = {};
        }
        let font : string = getFromMap(this.fonts, textStyle);
        if(font == null) {
            let fontStyle : string = 'normal';
            if(textStyle.isBold()) {
                fontStyle = 'bold';
            }
            if(textStyle.isItalic()) {
                fontStyle += ' italic';
            }
            if(defaultFont == null || this.preferences.getDefaultFontName() != null || textStyle.getFontName() != null) {
                let fontName : string = textStyle.getFontName();
                if(fontName == null) {
                    fontName = this.preferences.getDefaultFontName();
                }
                if(fontName == null) {
                    fontName = this.font.split(' ')[0];
                }
                defaultFont = fontName + " " + fontStyle + " 1";
            }
            var fontArray = defaultFont.split(' ');
            font = fontArray[0] + " " + fontStyle + " " + textStyle.getFontSize();
            putToMap(this.fonts, textStyle, font);
        }
        return font;
    }

    /**
     * Returns the font metrics matching a given text style.
     * @param {string} defaultFont
     * @param {TextStyle} textStyle
     * @return {FontMetrics}
     */
    getFontMetrics(defaultFont : string, textStyle? : TextStyle) : FontMetrics {
        if(textStyle == null) {
          return new FontMetrics(defaultFont);
        }
        if(this.fontsMetrics == null) {
            this.fontsMetrics = {};
        }
        let fontMetrics : FontMetrics = getFromMap(this.fontsMetrics, textStyle);
        if(fontMetrics == null) {
            fontMetrics = this.getFontMetrics(this.getFont(defaultFont, textStyle));
            putToMap(this.fontsMetrics, textStyle, fontMetrics);
        }
        return fontMetrics;
    }

    /**
     * Sets whether plan's background should be painted or not.
     * Background may include grid and an image.
     * @param {boolean} backgroundPainted
     */
    public setBackgroundPainted(backgroundPainted : boolean) {
        if(this.backgroundPainted !== backgroundPainted) {
            this.backgroundPainted = backgroundPainted;
            this.repaint();
        }
    }

    /**
     * Returns <code>true</code> if plan's background should be painted.
     * @return {boolean}
     */
    public isBackgroundPainted() : boolean {
        return this.backgroundPainted;
    }

    /**
     * Sets whether the outline of home selected items should be painted or not.
     * @param {boolean} selectedItemsOutlinePainted
     */
    public setSelectedItemsOutlinePainted(selectedItemsOutlinePainted : boolean) {
        if(this.selectedItemsOutlinePainted !== selectedItemsOutlinePainted) {
            this.selectedItemsOutlinePainted = selectedItemsOutlinePainted;
            this.repaint();
        }
    }

    /**
     * Returns <code>true</code> if the outline of home selected items should be painted.
     * @return {boolean}
     */
    public isSelectedItemsOutlinePainted() : boolean {
        return this.selectedItemsOutlinePainted;
    }

    /**
     * Paints this component.
     * @param {Graphics2D} g
     */
    paintComponent(g2D : Graphics2D) {
      console.log("painting component");
        if(this.backgroundPainted) {
            this.paintBackground(g2D, this.getBackgroundColor(PlanComponent.PaintMode.PAINT));
        }
        g2D.setTransform(new java.awt.geom.AffineTransform());
        g2D.clear();
        //g2D.clipRect(0, 0, this.getWidth(), this.getHeight());
        let planBounds : java.awt.geom.Rectangle2D = this.getPlanBounds();
        let paintScale : number = this.getScale();
        g2D.translate((PlanComponent.MARGIN - planBounds.getMinX()) * paintScale, (PlanComponent.MARGIN - planBounds.getMinY()) * paintScale);
        g2D.scale(paintScale, paintScale);
        this.setRenderingHints(g2D);
        try {
            this.paintContent(g2D, paintScale, PlanComponent.PaintMode.PAINT);
        } catch(ex) {
          console.error(ex);
        };
        g2D.dispose();
    }

    /**
     * Returns the print preferred scale of the plan drawn in this component
     * to make it fill <code>pageFormat</code> imageable size.
     * @param {Graphics2D} g
     * @param {java.awt.print.PageFormat} pageFormat
     * @return {number}
     */
    public getPrintPreferredScale(g? : any, pageFormat? : any) : any {
        return 1;
    }

    /**
     * Returns the stroke width used to paint an item of the given class.
     * @param {Object} itemClass
     * @param {PlanComponent.PaintMode} paintMode
     * @return {number}
     * @private
     */
    getStrokeWidth(itemClass : any, paintMode : PlanComponent.PaintMode) : number {
        let strokeWidth : number;
        if(Wall === itemClass || Room === itemClass) {
            strokeWidth = PlanComponent.WALL_STROKE_WIDTH;
        } else {
            strokeWidth = PlanComponent.BORDER_STROKE_WIDTH;
        }
        if(paintMode === PlanComponent.PaintMode.PRINT) {
            strokeWidth *= 0.5;
        } else {
            strokeWidth *= this.resolutionScale;
        }
        return strokeWidth;
    }

    /**
     * Returns an image of selected items in plan for transfer purpose.
     * @param {TransferableView.DataType} dataType
     * @return {Object}
     */
    public createTransferData(dataType : TransferableView.DataType) : any {
        if(dataType === TransferableView.DataType.PLAN_IMAGE) {
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
    public getClipboardImage() : HTMLImageElement {
        return null;
    }

    /**
     * Returns <code>true</code> if the given format is SVG.
     * @param {ExportableView.FormatType} formatType
     * @return {boolean}
     */
    public isFormatTypeSupported(formatType : ExportableView.FormatType) : boolean {
        return false;
    }

    /**
     * Writes this plan in the given output stream at SVG (Scalable Vector Graphics) format if this is the requested format.
     * @param {java.io.OutputStream} out
     * @param {ExportableView.FormatType} formatType
     * @param {Object} settings
     */
    public exportData(out : any, formatType : ExportableView.FormatType, settings : any) {
            throw new UnsupportedOperationException("Unsupported format " + formatType);
    }

    /**
     * Throws an <code>InterruptedRecorderException</code> exception if current thread
     * is interrupted and <code>paintMode</code> is equal to <code>PaintMode.EXPORT</code>.
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    checkCurrentThreadIsntInterrupted(paintMode : PlanComponent.PaintMode) {
    }

    /**
     * Sets rendering hints used to paint plan.
     * @param {Graphics2D} g2D
     * @private
     */
    setRenderingHints(g2D : Graphics2D) {
        // TODO
    }

    /**
     * Fills the background.
     * @param {Graphics2D} g2D
     * @param {string} backgroundColor
     * @private
     */
    paintBackground(g2D : Graphics2D, backgroundColor : string) {
        if(this.isOpaque()) {
            g2D.setColor(backgroundColor);
            g2D.fillRect(0, 0, this.getWidth(), this.getHeight());
        }
    }

    /**
     * Paints background image and returns <code>true</code> if an image is painted.
     * @param {Graphics2D} g2D
     * @param {PlanComponent.PaintMode} paintMode
     * @return {boolean}
     * @private
     */
    paintBackgroundImage(g2D : Graphics2D, paintMode : PlanComponent.PaintMode) : boolean {
        let selectedLevel : any = this.home.getSelectedLevel();
        let backgroundImageLevel : any = null;
        if(selectedLevel != null) {
            let levels : Array<any> = this.home.getLevels();
            for(let i : number = /* size */(<number>levels.length) - 1; i >= 0; i--) {{
                let level : any = /* get */levels[i];
                if(level.getElevation() === selectedLevel.getElevation() && level.getElevationIndex() <= selectedLevel.getElevationIndex() && level.isViewable() && level.getBackgroundImage() != null && level.getBackgroundImage().isVisible()) {
                    backgroundImageLevel = level;
                    break;
                }
            };}
        }
        let backgroundImage : any = backgroundImageLevel == null?this.home.getBackgroundImage():backgroundImageLevel.getBackgroundImage();
        if(backgroundImage != null && backgroundImage.isVisible()) {
            let prepareBackgroundImageWithAlphaInMemory : boolean = com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX();
            if(this.backgroundImageCache == null && paintMode === PlanComponent.PaintMode.PAINT) {
                if(PlanComponent.backgroundImageLoader == null) {
                    PlanComponent.backgroundImageLoader = java.util.concurrent.Executors.newSingleThreadExecutor();
                }
                PlanComponent.backgroundImageLoader.execute(() => {
                    if(this.backgroundImageCache == null) {
                        this.backgroundImageCache = this.readBackgroundImage(backgroundImage.getImage(), prepareBackgroundImageWithAlphaInMemory);
                        this.revalidate();
                    }
                });
            } else {
                let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
                g2D.translate(-backgroundImage.getXOrigin(), -backgroundImage.getYOrigin());
                let backgroundImageScale : number = backgroundImage.getScale();
                g2D.scale(backgroundImageScale, backgroundImageScale);
                let oldComposite : java.awt.Composite = null;
                if(!prepareBackgroundImageWithAlphaInMemory) {
                    oldComposite = this.setTransparency(g2D, 0.7);
                }
                g2D.drawImage(this.backgroundImageCache != null?this.backgroundImageCache:this.readBackgroundImage(backgroundImage.getImage(), prepareBackgroundImageWithAlphaInMemory), 0, 0, this);
                if(!prepareBackgroundImageWithAlphaInMemory) {
                    g2D.setComposite(oldComposite);
                }
                g2D.setTransform(previousTransform);
            }
            return true;
        }
        return false;
    }

    /**
     * Returns the foreground color used to draw content.
     * @param {PlanComponent.PaintMode} mode
     * @return {string}
     */
    getForegroundColor(mode : PlanComponent.PaintMode) : string {
        if(mode === PlanComponent.PaintMode.PAINT) {
            return this.getForeground();
        } else {
            return Color.BLACK;
        }
    }

    /**
     * Returns the background color used to draw content.
     * @param {PlanComponent.PaintMode} mode
     * @return {string}
     */
    getBackgroundColor(mode : PlanComponent.PaintMode) : string {
        if(mode === PlanComponent.PaintMode.PAINT) {
            return this.getBackground();
        } else {
            return Color.WHITE;
        }
    }

    /**
     * Returns the image contained in <code>imageContent</code> or an empty image if reading failed.
     * @param {Object} imageContent
     * @param {boolean} prepareBackgroundImageWithAlpha
     * @return {HTMLImageElement}
     * @private
     */
    readBackgroundImage(imageContent : any, prepareBackgroundImageWithAlpha : boolean) : HTMLImageElement {
        let contentStream : { str: string, cursor: number } = null;
        try {
            try {
                contentStream = null/*erased method imageContent.openStream*/;
                let image : HTMLImageElement = javax.imageio.ImageIO.read(contentStream);
                if(prepareBackgroundImageWithAlpha) {
                    let backgroundImage : HTMLImageElement = new java.awt.image.BufferedImage(image.getWidth(), image.getHeight(), java.awt.image.BufferedImage.TYPE_INT_ARGB);
                    let g2D : Graphics2D = <Graphics2D>backgroundImage.getGraphics();
                    g2D.setComposite(java.awt.AlphaComposite.getInstance(java.awt.AlphaComposite.SRC_OVER, 0.7));
                    g2D.drawRenderedImage(image, null);
                    g2D.dispose();
                    return backgroundImage;
                } else {
                    return image;
                }
            } finally {
                if(contentStream != null) {
                    /* close */;
                };
            };
        } catch(ex) {
            return new java.awt.image.BufferedImage(1, 1, java.awt.image.BufferedImage.TYPE_INT_ARGB);
        };
    }

    /**
     * Paints walls and rooms of lower levels or upper levels to help the user draw in the selected level.
     * @param {Graphics2D} g2D
     * @param {number} planScale
     * @param {string} backgroundColor
     * @param {string} foregroundColor
     * @private
     */
    paintOtherLevels(g2D : Graphics2D, planScale : number, backgroundColor : string, foregroundColor : string) {
        let levels : Array<any> = this.home.getLevels();
        let selectedLevel : any = this.home.getSelectedLevel();
        if(/* size */(<number>levels.length) > 1 && selectedLevel != null) {
            let level0 : boolean = /* get */levels[0].getElevation() === selectedLevel.getElevation();
            let otherLevels : Array<any> = null;
            if(this.otherLevelsRoomsCache == null || this.otherLevelsWallsCache == null) {
                let selectedLevelIndex : number = levels.indexOf(selectedLevel);
                otherLevels = <any>([]);
                if(level0) {
                    let nextElevationLevelIndex : number = selectedLevelIndex;
                    while((++nextElevationLevelIndex < /* size */(<number>levels.length) && /* get */levels[nextElevationLevelIndex].getElevation() === selectedLevel.getElevation())) {{
                    }};
                    if(nextElevationLevelIndex < /* size */(<number>levels.length)) {
                        let nextLevel : any = /* get */levels[nextElevationLevelIndex];
                        let nextElevation : number = nextLevel.getElevation();
                        do {{
                            if(nextLevel.isViewable()) {
                                /* add */(otherLevels.push(nextLevel)>0);
                            }
                        }} while((++nextElevationLevelIndex < /* size */(<number>levels.length) && (nextLevel = /* get */levels[nextElevationLevelIndex]).getElevation() === nextElevation));
                    }
                } else {
                    let previousElevationLevelIndex : number = selectedLevelIndex;
                    while((--previousElevationLevelIndex >= 0 && /* get */levels[previousElevationLevelIndex].getElevation() === selectedLevel.getElevation())) {{
                    }};
                    if(previousElevationLevelIndex >= 0) {
                        let previousLevel : any = /* get */levels[previousElevationLevelIndex];
                        let previousElevation : number = previousLevel.getElevation();
                        do {{
                            if(previousLevel.isViewable()) {
                                /* add */(otherLevels.push(previousLevel)>0);
                            }
                        }} while((--previousElevationLevelIndex >= 0 && (previousLevel = /* get */levels[previousElevationLevelIndex]).getElevation() === previousElevation));
                    }
                }
                if(this.otherLevelsRoomsCache == null) {
                    if(!/* isEmpty */(otherLevels.length == 0)) {
                        let otherLevelsRooms : Array<any> = <any>([]);
                        {
                            let array154 = this.home.getRooms();
                            for(let index153=0; index153 < array154.length; index153++) {
                                let room = array154[index153];
                                {
                                    for(let index155=0; index155 < otherLevels.length; index155++) {
                                        let otherLevel = otherLevels[index155];
                                        {
                                            if(room.getLevel() === otherLevel && (level0 && room.isFloorVisible() || !level0 && room.isCeilingVisible())) {
                                                /* add */(otherLevelsRooms.push(room)>0);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if(/* size */(<number>otherLevelsRooms.length) > 0) {
                            this.otherLevelsRoomAreaCache = this.getItemsArea(otherLevelsRooms);
                            this.otherLevelsRoomsCache = otherLevelsRooms;
                        }
                    }
                    if(this.otherLevelsRoomsCache == null) {
                        this.otherLevelsRoomsCache = /* emptyList */[];
                    }
                }
                if(this.otherLevelsWallsCache == null) {
                    if(!/* isEmpty */(otherLevels.length == 0)) {
                        let otherLevelswalls : Array<any> = <any>([]);
                        {
                            let array157 = this.home.getWalls();
                            for(let index156=0; index156 < array157.length; index156++) {
                                let wall = array157[index156];
                                {
                                    if(!this.isViewableAtSelectedLevel(wall)) {
                                        for(let index158=0; index158 < otherLevels.length; index158++) {
                                            let otherLevel = otherLevels[index158];
                                            {
                                                if(wall.getLevel() === otherLevel) {
                                                    /* add */(otherLevelswalls.push(wall)>0);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if(/* size */(<number>otherLevelswalls.length) > 0) {
                            this.otherLevelsWallAreaCache = this.getItemsArea(otherLevelswalls);
                            this.otherLevelsWallsCache = otherLevelswalls;
                        }
                    }
                }
                if(this.otherLevelsWallsCache == null) {
                    this.otherLevelsWallsCache = /* emptyList */[];
                }
            }
            if(!/* isEmpty */(this.otherLevelsRoomsCache.length == 0)) {
                let oldComposite : string = this.setTransparency(g2D, this.preferences.isGridVisible()?0.2:0.1);
                g2D.setPaint(Color.GRAY);
                g2D.fill(this.otherLevelsRoomAreaCache);
                g2D.setComposite(oldComposite);
            }
            if(!/* isEmpty */(this.otherLevelsWallsCache.length == 0)) {
                let oldComposite : string = this.setTransparency(g2D, this.preferences.isGridVisible()?0.2:0.1);
                this.fillAndDrawWallsArea(g2D, this.otherLevelsWallAreaCache, planScale, this.getWallPaint(g2D, planScale, backgroundColor, foregroundColor, this.preferences.getNewWallPattern()), foregroundColor, PlanComponent.PaintMode.PAINT);
                g2D.setComposite(oldComposite);
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
    setTransparency(g2D : Graphics2D, alpha : number) : string {
        let oldComposite : string = g2D.getColor();
        if(oldComposite.length === 7) {
          oldComposite += "FF";
        }
        g2D.setColor(oldComposite.slice(0, 7) + (((1 - alpha) * 255) | 0).toString(16));
        return oldComposite;
    }

    /**
     * Paints background grid lines.
     * @param {Graphics2D} g2D
     * @param {number} gridScale
     * @private
     */
    paintGrid(g2D : Graphics2D, gridScale : number) {
        let gridSize : number = this.getGridSize(gridScale);
        let mainGridSize : number = this.getMainGridSize(gridScale);
        let xMin : number;
        let yMin : number;
        let xMax : number;
        let yMax : number;
        let planBounds : java.awt.geom.Rectangle2D = this.getPlanBounds();
//        if(this.getParent() != null && this.getParent() instanceof <any>javax.swing.JViewport) {
//            let viewRectangle : java.awt.Rectangle = (<javax.swing.JViewport>this.getParent()).getViewRect();
//            xMin = this.convertXPixelToModel(viewRectangle.x - 1);
//            yMin = this.convertYPixelToModel(viewRectangle.y - 1);
//            xMax = this.convertXPixelToModel(viewRectangle.x + viewRectangle.width);
//            yMax = this.convertYPixelToModel(viewRectangle.y + viewRectangle.height);
//        } else {
            xMin = <number>planBounds.getMinX() - PlanComponent.MARGIN;
            yMin = <number>planBounds.getMinY() - PlanComponent.MARGIN;
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
    paintGridLines(g2D : Graphics2D, gridScale : number, xMin : number, xMax : number, yMin : number, yMax : number, gridSize : number, mainGridSize : number) {
        g2D.setColor("#808080");
        g2D.setStroke(new java.awt.BasicStroke(0.5 / gridScale));
        for(let x : number = (<number>(xMin / gridSize)|0) * gridSize; x < xMax; x += gridSize) {{
            g2D.draw(new java.awt.geom.Line2D.Double(x, yMin, x, yMax));
        };}
        for(let y : number = (<number>(yMin / gridSize)|0) * gridSize; y < yMax; y += gridSize) {{
            g2D.draw(new java.awt.geom.Line2D.Double(xMin, y, xMax, y));
        };}
        if(mainGridSize !== gridSize) {
            g2D.setStroke(new java.awt.BasicStroke(1.5 / gridScale, java.awt.BasicStroke.CAP_BUTT, java.awt.BasicStroke.JOIN_BEVEL));
            for(let x : number = (<number>(xMin / mainGridSize)|0) * mainGridSize; x < xMax; x += mainGridSize) {{
                g2D.draw(new java.awt.geom.Line2D.Double(x, yMin, x, yMax));
            };}
            for(let y : number = (<number>(yMin / mainGridSize)|0) * mainGridSize; y < yMax; y += mainGridSize) {{
                g2D.draw(new java.awt.geom.Line2D.Double(xMin, y, xMax, y));
            };}
        }
    }

    /**
     * Returns the space between main lines grid.
     * @param {number} gridScale
     * @return {number}
     * @private
     */
    getMainGridSize(gridScale : number) : number {
        let mainGridSizes : number[];
        let lengthUnit : any = this.preferences.getLengthUnit();
        if(lengthUnit === LengthUnit.INCH || lengthUnit === LengthUnit.INCH_DECIMALS) {
            let oneFoot : number = 2.54 * 12;
            mainGridSizes = [oneFoot, 3 * oneFoot, 6 * oneFoot, 12 * oneFoot, 24 * oneFoot, 48 * oneFoot, 96 * oneFoot, 192 * oneFoot, 384 * oneFoot];
        } else {
            mainGridSizes = [100, 200, 500, 1000, 2000, 5000, 10000];
        }
        let mainGridSize : number = mainGridSizes[0];
        for(let i : number = 1; i < mainGridSizes.length && mainGridSize * gridScale < 50; i++) {{
            mainGridSize = mainGridSizes[i];
        };}
        return mainGridSize;
    }

    /**
     * Returns the space between lines grid.
     * @param {number} gridScale
     * @return {number}
     * @private
     */
    getGridSize(gridScale : number) : number {
        let gridSizes : number[];
        let lengthUnit : any = this.preferences.getLengthUnit();
        if(lengthUnit === LengthUnit.INCH || lengthUnit === LengthUnit.INCH_DECIMALS) {
            let oneFoot : number = 2.54 * 12;
            gridSizes = [2.54, 5.08, 7.62, 15.24, oneFoot, 3 * oneFoot, 6 * oneFoot, 12 * oneFoot, 24 * oneFoot, 48 * oneFoot, 96 * oneFoot, 192 * oneFoot, 384 * oneFoot];
        } else {
            gridSizes = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000];
        }
        let gridSize : number = gridSizes[0];
        for(let i : number = 1; i < gridSizes.length && gridSize * gridScale < 10; i++) {{
            gridSize = gridSizes[i];
        };}
        return gridSize;
    }

    /**
     * Paints plan items.
     * @throws InterruptedIOException if painting was interrupted (may happen only
     * if <code>paintMode</code> is equal to <code>PaintMode.EXPORT</code>).
     * @param {Graphics2D} g2D
     * @param {number} planScale
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    paintContent(g2D : Graphics2D, planScale : number, paintMode : PlanComponent.PaintMode) {
        let backgroundColor : string = this.getBackgroundColor(paintMode);
        let foregroundColor : string = this.getForegroundColor(paintMode);
        if(this.backgroundPainted) {
            this.paintBackgroundImage(g2D, paintMode);
            if(paintMode === PlanComponent.PaintMode.PAINT) {
                this.paintOtherLevels(g2D, planScale, backgroundColor, foregroundColor);
                if(this.preferences.isGridVisible()) {
                    this.paintGrid(g2D, planScale);
                }
            }
        }
        this.paintHomeItems(g2D, planScale, backgroundColor, foregroundColor, paintMode);
        if(paintMode === PlanComponent.PaintMode.PAINT) {
            let selectedItems : Array<any> = this.home.getSelectedItems();
            let selectionColor : string = this.getSelectionColor();
            let furnitureOutlineColor : string = this.getFurnitureOutlineColor();
            let selectionOutlinePaint : string = selectionColor+"80"; // add alpha
            let selectionOutlineStroke : java.awt.BasicStroke = new java.awt.BasicStroke(6 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_ROUND, java.awt.BasicStroke.JOIN_ROUND);
            let dimensionLinesSelectionOutlineStroke : java.awt.BasicStroke = new java.awt.BasicStroke(4 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_ROUND, java.awt.BasicStroke.JOIN_ROUND);
            let locationFeedbackStroke : java.awt.BasicStroke = new java.awt.BasicStroke(1 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_SQUARE, java.awt.BasicStroke.JOIN_BEVEL, 0, [20 / planScale, 5 / planScale, 5 / planScale, 5 / planScale], 4 / planScale);
            this.paintCamera(g2D, selectedItems, selectionOutlinePaint, selectionOutlineStroke, selectionColor, planScale, backgroundColor, foregroundColor);
            if(this.alignedObjectClass != null) {
                if(Wall === this.alignedObjectClass) {
                    this.paintWallAlignmentFeedback(g2D, this.alignedObjectFeedback, this.locationFeeback, this.showPointFeedback, selectionColor, locationFeedbackStroke, planScale, selectionOutlinePaint, selectionOutlineStroke);
                } else if(Room === this.alignedObjectClass) {
                    this.paintRoomAlignmentFeedback(g2D, this.alignedObjectFeedback, this.locationFeeback, this.showPointFeedback, selectionColor, locationFeedbackStroke, planScale, selectionOutlinePaint, selectionOutlineStroke);
                } else if(Polyline === this.alignedObjectClass) {
                    if(this.showPointFeedback) {
                        this.paintPointFeedback(g2D, this.locationFeeback, selectionColor, planScale, selectionOutlinePaint, selectionOutlineStroke);
                    }
                } else if(DimensionLine === this.alignedObjectClass) {
                    this.paintDimensionLineAlignmentFeedback(g2D, this.alignedObjectFeedback, this.locationFeeback, this.showPointFeedback, selectionColor, locationFeedbackStroke, planScale, selectionOutlinePaint, selectionOutlineStroke);
                }
            }
            if(this.centerAngleFeedback != null) {
                this.paintAngleFeedback(g2D, this.centerAngleFeedback, this.point1AngleFeedback, this.point2AngleFeedback, planScale, selectionColor);
            }
            if(this.dimensionLinesFeedback != null) {
                let emptySelection : Array<any> = /* emptyList */[];
                this.paintDimensionLines(g2D, this.dimensionLinesFeedback, emptySelection, null, null, null, locationFeedbackStroke, planScale, backgroundColor, selectionColor, paintMode, true);
            }
            if(this.draggedItemsFeedback != null) {
                this.paintDimensionLines(g2D, Home.getDimensionLinesSubList(this.draggedItemsFeedback), this.draggedItemsFeedback, selectionOutlinePaint, dimensionLinesSelectionOutlineStroke, null, locationFeedbackStroke, planScale, backgroundColor, foregroundColor, paintMode, false);
                this.paintLabels(g2D, Home.getLabelsSubList(this.draggedItemsFeedback), this.draggedItemsFeedback, selectionOutlinePaint, dimensionLinesSelectionOutlineStroke, null, planScale, foregroundColor, paintMode);
                this.paintRoomsOutline(g2D, this.draggedItemsFeedback, selectionOutlinePaint, selectionOutlineStroke, null, planScale, foregroundColor);
                this.paintWallsOutline(g2D, this.draggedItemsFeedback, selectionOutlinePaint, selectionOutlineStroke, null, planScale, foregroundColor);
                this.paintFurniture(g2D, Home.getFurnitureSubList(this.draggedItemsFeedback), selectedItems, planScale, null, foregroundColor, furnitureOutlineColor, paintMode, false);
                this.paintFurnitureOutline(g2D, this.draggedItemsFeedback, selectionOutlinePaint, selectionOutlineStroke, null, planScale, foregroundColor);
            }
            this.paintRectangleFeedback(g2D, selectionColor, planScale);
        }
    }

    /**
     * Paints home items at the given scale, and with background and foreground colors.
     * Outline around selected items will be painted only under <code>PAINT</code> mode.
     * @param {Graphics2D} g
     * @param {number} planScale
     * @param {string} backgroundColor
     * @param {string} foregroundColor
     * @param {PlanComponent.PaintMode} paintMode
     */
    paintHomeItems(g2D : Graphics2D, planScale : number, backgroundColor : string, foregroundColor : string, paintMode : PlanComponent.PaintMode) {
        let selectedItems : Array<any> = this.home.getSelectedItems();
        if(this.sortedLevelFurniture == null) {
            this.sortedLevelFurniture = <any>([]);
            {
                let array160 = this.home.getFurniture();
                for(let index159=0; index159 < array160.length; index159++) {
                    let piece = array160[index159];
                    {
                        if(this.isViewableAtSelectedLevel(piece)) {
                            /* add */(this.sortedLevelFurniture.push(piece)>0);
                        }
                    }
                }
            }
            /* sort */((l,c) => { if((<any>c).compare) l.sort((e1,e2)=>(<any>c).compare(e1,e2)); else l.sort(<any>c); })(this.sortedLevelFurniture,new PlanComponent.PlanComponent$22(this));
        }
        let selectionColor : string = this.getSelectionColor();
        let selectionOutlinePaint : string = selectionColor+"80"; // add alpha
        let selectionOutlineStroke : java.awt.Stroke = new java.awt.BasicStroke(6 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_ROUND, java.awt.BasicStroke.JOIN_ROUND);
        let dimensionLinesSelectionOutlineStroke : java.awt.Stroke = new java.awt.BasicStroke(4 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_ROUND, java.awt.BasicStroke.JOIN_ROUND);
        let locationFeedbackStroke : java.awt.Stroke = new java.awt.BasicStroke(1 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_SQUARE, java.awt.BasicStroke.JOIN_BEVEL, 0, [20 / planScale, 5 / planScale, 5 / planScale, 5 / planScale], 4 / planScale);
        console.log("painting compass");
        this.paintCompass(g2D, selectedItems, planScale, foregroundColor, paintMode);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        console.log("painting rooms");
        this.paintRooms(g2D, selectedItems, planScale, foregroundColor, paintMode);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        console.log("painting walls");
        this.paintWalls(g2D, selectedItems, planScale, backgroundColor, foregroundColor, paintMode);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        console.log("painting furniture");
        this.paintFurniture(g2D, this.sortedLevelFurniture, selectedItems, planScale, backgroundColor, foregroundColor, this.getFurnitureOutlineColor(), paintMode, true);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        console.log("painting polylines");
        //this.paintPolylines(g2D, this.home.getPolylines(), selectedItems, selectionOutlinePaint, selectionColor, planScale, foregroundColor, paintMode);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        console.log("painting dimension lines");
        //this.paintDimensionLines(g2D, this.home.getDimensionLines(), selectedItems, selectionOutlinePaint, dimensionLinesSelectionOutlineStroke, selectionColor, locationFeedbackStroke, planScale, backgroundColor, foregroundColor, paintMode, false);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        console.log("painting room names");
        //this.paintRoomsNameAndArea(g2D, selectedItems, planScale, foregroundColor, paintMode);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        console.log("painting furniture name");
        //this.paintFurnitureName(g2D, this.sortedLevelFurniture, selectedItems, planScale, foregroundColor, paintMode);
        this.checkCurrentThreadIsntInterrupted(paintMode);
        console.log("painting labels");
        //this.paintLabels(g2D, this.home.getLabels(), selectedItems, selectionOutlinePaint, dimensionLinesSelectionOutlineStroke, selectionColor, planScale, foregroundColor, paintMode);
//        if(paintMode === PlanComponent.PaintMode.PAINT && this.selectedItemsOutlinePainted) {
//          console.log("painting outline");
//            this.paintCompassOutline(g2D, selectedItems, selectionOutlinePaint, selectionOutlineStroke, selectionColor, planScale, foregroundColor);
//            this.paintRoomsOutline(g2D, selectedItems, selectionOutlinePaint, selectionOutlineStroke, selectionColor, planScale, foregroundColor);
//            this.paintWallsOutline(g2D, selectedItems, selectionOutlinePaint, selectionOutlineStroke, selectionColor, planScale, foregroundColor);
//            this.paintFurnitureOutline(g2D, selectedItems, selectionOutlinePaint, selectionOutlineStroke, selectionColor, planScale, foregroundColor);
//        }
    }

    /**
     * Returns the color used to draw selection outlines.
     * @return {string}
     */
    getSelectionColor() : string {
        return PlanComponent.getDefaultSelectionColor(this);
    }

    /**
     * Returns the default color used to draw selection outlines.
     * @param {javax.swing.JComponent} planComponent
     * @return {string}
     */
    static getDefaultSelectionColor(planComponent : PlanComponent) : string {
        return "#000080";
    }

    /**
     * Returns the color used to draw furniture outline of
     * the shape where a user can click to select a piece of furniture.
     * @return {string}
     */
    getFurnitureOutlineColor() : string {
        //return <string>new String((this.getForeground().getRGB() & 16777215) | 1426063360, true);
        return Color.BLACK;
    }

    /**
     * Paints rooms.
     * @param {Graphics2D} g2D
     * @param {*[]} selectedItems
     * @param {number} planScale
     * @param {string} foregroundColor
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    paintRooms(g2D : Graphics2D, selectedItems : Array<any>, planScale : number, foregroundColor : string, paintMode : PlanComponent.PaintMode) {
        if(this.sortedLevelRooms == null) {
            this.sortedLevelRooms = <any>([]);
            {
                let array162 = this.home.getRooms();
                for(let index161=0; index161 < array162.length; index161++) {
                    let room = array162[index161];
                    {
                        if(this.isViewableAtSelectedLevel(room)) {
                            /* add */(this.sortedLevelRooms.push(room)>0);
                        }
                    }
                }
            }
            /* sort */((l,c) => { if((<any>c).compare) l.sort((e1,e2)=>(<any>c).compare(e1,e2)); else l.sort(<any>c); })(this.sortedLevelRooms,new PlanComponent.PlanComponent$23(this));
        }
        let defaultFillPaint : string = paintMode === PlanComponent.PaintMode.PRINT?Color.WHITE:Color.GRAY;
        g2D.setStroke(new java.awt.BasicStroke(this.getStrokeWidth(Room, paintMode) / planScale));
        for(let index163=0; index163 < this.sortedLevelRooms.length; index163++) {
            let room = this.sortedLevelRooms[index163];
            {
                let selectedRoom : boolean = /* contains */(selectedItems.indexOf(<any>(room)) >= 0);
                if(paintMode !== PlanComponent.PaintMode.CLIPBOARD || selectedRoom) {
                    g2D.setPaint(defaultFillPaint);
                    let textureAngle : number = 0;
                    if(this.preferences.isRoomFloorColoredOrTextured() && room.isFloorVisible()) {
                        if(room.getFloorColor() != null) {
                            g2D.setPaint(room.getFloorColor());
                        } else {
                            let floorTexture : any = room.getFloorTexture();
                            if(floorTexture != null) {
                                if(this.floorTextureImagesCache == null) {
                                    this.floorTextureImagesCache = <any>({});
                                }
                                let textureImage : HTMLImageElement = this.floorTextureImagesCache[floorTexture.getImage().getURL()];
                                if(textureImage == null) {
                                    console.error(" -> loading texture : " + floorTexture.getImage().getURL());
                                    textureImage = PlanComponent.WAIT_TEXTURE_IMAGE;
//                                    console.info("====> "+textureImage);
                                    this.floorTextureImagesCache[floorTexture.getImage().getURL()] = textureImage;
                                    let waitForTexture : boolean = paintMode !== PlanComponent.PaintMode.PAINT;
//                                    if(PlanComponent.isTextureManagerAvailable()) {
                                        TextureManager.getInstance().loadTexture(floorTexture.getImage(), waitForTexture, {
                                          textureUpdated : (texture : HTMLImageElement) => {
                                             this.floorTextureImagesCache[floorTexture.getImage().getURL()] = texture;
                                            console.error(" -> recieved texture : " + floorTexture.getImage().getURL());
                                            if(!waitForTexture) {
                                                this.repaint();
                                            }
                                          },
                                          textureError : () => {
                                             this.floorTextureImagesCache[floorTexture.getImage().getURL()] = PlanComponent.ERROR_TEXTURE_IMAGE;
                                          },
                                          progression : () => {}
                                        });
//                                    } else {
//                                        let textureIcon : javax.swing.Icon = IconManager.getInstance().getIcon(floorTexture.getImage(), waitForTexture?null:this);
//                                        if(IconManager.getInstance().isWaitIcon(textureIcon)) {
//                                            /* put */((m,k,v) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { m.entries[i].value=v; return; } m.entries.push({key:k,value:v,getKey: function() { return this.key }, getValue: function() { return this.value }}); })(<any>this.floorTextureImagesCache, floorTexture, PlanComponent.WAIT_TEXTURE_IMAGE);
//                                        } else if(IconManager.getInstance().isErrorIcon(textureIcon)) {
//                                            /* put */((m,k,v) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { m.entries[i].value=v; return; } m.entries.push({key:k,value:v,getKey: function() { return this.key }, getValue: function() { return this.value }}); })(<any>this.floorTextureImagesCache, floorTexture, PlanComponent.ERROR_TEXTURE_IMAGE);
//                                        } else {
//                                            let textureIconImage : java.awt.image.BufferedImage = new java.awt.image.BufferedImage(textureIcon.getIconWidth(), textureIcon.getIconHeight(), java.awt.image.BufferedImage.TYPE_INT_ARGB);
//                                            let g2DIcon : Graphics2D = <Graphics2D>textureIconImage.getGraphics();
//                                            textureIcon.paintIcon(this, g2DIcon, 0, 0);
//                                            g2DIcon.dispose();
//                                            /* put */((m,k,v) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { m.entries[i].value=v; return; } m.entries.push({key:k,value:v,getKey: function() { return this.key }, getValue: function() { return this.value }}); })(<any>this.floorTextureImagesCache, floorTexture, textureIconImage);
//                                        }
//                                    }
//                                    textureImage = /* get */((m,k) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { return m.entries[i].value; } return null; })(<any>this.floorTextureImagesCache, floorTexture);
                                }
                                let textureWidth : number = floorTexture.getWidth();
                                let textureHeight : number = floorTexture.getHeight();
                                if(textureWidth === -1 || textureHeight === -1) {
                                    textureWidth = 100;
                                    textureHeight = 100;
                                }
                                let textureScale : number = floorTexture.getScale();
                                textureAngle = floorTexture.getAngle();
                                let cosAngle : number = Math.cos(textureAngle);
                                let sinAngle : number = Math.sin(textureAngle);
                                //g2D.setPaint(new java.awt.TexturePaint(textureImage, new java.awt.geom.Rectangle2D.Double(floorTexture.getXOffset() * textureWidth * textureScale * cosAngle - floorTexture.getYOffset() * textureHeight * textureScale * sinAngle, -floorTexture.getXOffset() * textureWidth * textureScale * sinAngle - floorTexture.getYOffset() * textureHeight * textureScale * cosAngle, textureWidth * textureScale, textureHeight * textureScale)));
                                g2D.setPaint(g2D.createPattern(textureImage));
                            }
                        }
                    }
                    let oldComposite = this.setTransparency(g2D, 0.75);
                    g2D.rotate(textureAngle, 0, 0);
                    let rotation : java.awt.geom.AffineTransform = textureAngle !== 0?java.awt.geom.AffineTransform.getRotateInstance(-textureAngle, 0, 0):null;
                    let roomShape : java.awt.Shape = ShapeTools.getShape(room.getPoints(), true, rotation);
                    this.fillShape(g2D, roomShape, paintMode);
                    g2D.setComposite(oldComposite);
                    g2D.setPaint(foregroundColor);
                    g2D.draw(roomShape);
                    g2D.rotate(-textureAngle, 0, 0);
                }
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
    fillShape(g2D : Graphics2D, shape : java.awt.Shape, paintMode : PlanComponent.PaintMode) {
        if(paintMode === PlanComponent.PaintMode.PRINT && (g2D.getPaint() != null && g2D.getPaint() instanceof <any>java.awt.TexturePaint) && com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() && com.eteks.sweethome3d.tools.OperatingSystem.isJavaVersionBetween("1.7", "1.8.0_152")) {
            let clip : java.awt.Shape = g2D.getClip();
            g2D.setClip(shape);
            let paint : java.awt.TexturePaint = <java.awt.TexturePaint><any>g2D.getPaint();
            let image : java.awt.image.BufferedImage = paint.getImage();
            let anchorRect : java.awt.geom.Rectangle2D = paint.getAnchorRect();
            let shapeBounds : java.awt.geom.Rectangle2D = shape.getBounds2D();
            let firstX : number = anchorRect.getX() + Math.round(shapeBounds.getX() / anchorRect.getWidth()) * anchorRect.getWidth();
            if(firstX > shapeBounds.getX()) {
                firstX -= anchorRect.getWidth();
            }
            let firstY : number = anchorRect.getY() + Math.round(shapeBounds.getY() / anchorRect.getHeight()) * anchorRect.getHeight();
            if(firstY > shapeBounds.getY()) {
                firstY -= anchorRect.getHeight();
            }
            for(let x : number = firstX; x < shapeBounds.getMaxX(); x += anchorRect.getWidth()) {{
                for(let y : number = firstY; y < shapeBounds.getMaxY(); y += anchorRect.getHeight()) {{
                    let transform : java.awt.geom.AffineTransform = java.awt.geom.AffineTransform.getTranslateInstance(x, y);
                    transform.concatenate(java.awt.geom.AffineTransform.getScaleInstance(anchorRect.getWidth() / image.getWidth(), anchorRect.getHeight() / image.getHeight()));
                    g2D.drawRenderedImage(image, transform);
                };}
            };}
            g2D.setClip(clip);
        } else {
            g2D.fill(shape);
        }
    }

    /**
     * Returns <code>true</code> if <code>TextureManager</code> can be used to manage textures.
     * @return {boolean}
     * @private
     */
    static isTextureManagerAvailable() : boolean {
        //try {
        //   return !javaemul.internal.BooleanHelper.getBoolean("com.eteks.sweethome3d.no3D") && !(com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() && com.eteks.sweethome3d.tools.OperatingSystem.isJavaVersionGreaterOrEqual("1.7"));
        //} catch(ex) {
        //};
        return true;
    }

    /**
     * Paints rooms name and area.
     * @param {Graphics2D} g2D
     * @param {*[]} selectedItems
     * @param {number} planScale
     * @param {string} foregroundColor
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    paintRoomsNameAndArea(g2D : Graphics2D, selectedItems : Array<any>, planScale : number, foregroundColor : string, paintMode : PlanComponent.PaintMode) {
        g2D.setPaint(foregroundColor);
        let previousFont : string = g2D.getFont();
        for(let index164=0; index164 < this.sortedLevelRooms.length; index164++) {
            let room = this.sortedLevelRooms[index164];
            {
                let selectedRoom : boolean = /* contains */(selectedItems.indexOf(<any>(room)) >= 0);
                if(paintMode !== PlanComponent.PaintMode.CLIPBOARD || selectedRoom) {
                    let xRoomCenter : number = room.getXCenter();
                    let yRoomCenter : number = room.getYCenter();
                    let name : string = room.getName();
                    if(name != null) {
                        name = name.trim();
                        if(name.length > 0) {
                            this.paintText(g2D, (<any>room.constructor), name, room.getNameStyle(), null, xRoomCenter + room.getNameXOffset(), yRoomCenter + room.getNameYOffset(), room.getNameAngle(), previousFont);
                        }
                    }
                    if(room.isAreaVisible()) {
                        let area : number = room.getArea();
                        if(area > 0.01) {
                            let areaText : string = this.preferences.getLengthUnit().getAreaFormatWithUnit().format(area);
                            this.paintText(g2D, (<any>room.constructor), areaText, room.getAreaStyle(), null, xRoomCenter + room.getAreaXOffset(), yRoomCenter + room.getAreaYOffset(), room.getAreaAngle(), previousFont);
                        }
                    }
                }
            }
        }
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
    paintText(g2D : Graphics2D, selectableClass : any, text : string, style : any, outlineColor : number, x : number, y : number, angle : number, defaultFont : string) {
        let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
        g2D.translate(x, y);
        g2D.rotate(angle);
        if(style == null) {
            style = this.preferences.getDefaultTextStyle(selectableClass);
        }
        let fontMetrics : FontMetrics = this.getFontMetrics(defaultFont, style);
        let lines : string[] = text.split("\n");
        let lineWidths : number[] = (s => { let a=[]; while(s-->0) a.push(0); return a; })(lines.length);
        let textWidth : number = -3.4028235E38;
        for(let i : number = 0; i < lines.length; i++) {{
            lineWidths[i] = <number>fontMetrics.getStringBounds(lines[i], g2D).getWidth();
            textWidth = Math.max(lineWidths[i], textWidth);
        };}
        let stroke : java.awt.BasicStroke = null;
        let font : string;
        if(outlineColor != null) {
            stroke = new java.awt.BasicStroke(style.getFontSize() * 0.05);
            let outlineStyle : any = style.deriveStyle(style.getFontSize() - stroke.getLineWidth());
            font = this.getFont(defaultFont, outlineStyle);
            g2D.setStroke(stroke);
        } else {
            font = this.getFont(defaultFont, style);
        }
        g2D.setFont(font);
        for(let i : number = lines.length - 1; i >= 0; i--) {{
            let line : string = lines[i];
            let translationX : number;
            if(style.getAlignment() === TextStyle.Alignment.LEFT) {
                translationX = 0;
            } else if(style.getAlignment() === TextStyle.Alignment.RIGHT) {
                translationX = -lineWidths[i];
            } else {
                translationX = -lineWidths[i] / 2;
            }
            if(outlineColor != null) {
                translationX += stroke.getLineWidth() / 2;
            }
            g2D.translate(translationX, 0);
            if(outlineColor != null) {
                let defaultColor : string = g2D.getColor();
                g2D.setColor(<string>new String(outlineColor));
                let textLayout : java.awt.font.TextLayout = new java.awt.font.TextLayout(line, font, g2D.getFontRenderContext());
                g2D.draw(textLayout.getOutline(null));
                g2D.setColor(defaultColor);
            }
            g2D.drawString(line, 0, 0);
            g2D.translate(-translationX, -fontMetrics.getHeight());
        };}
        g2D.setTransform(previousTransform);
    }

    /**
     * Paints the outline of rooms among <code>items</code> and indicators if
     * <code>items</code> contains only one room and indicator paint isn't <code>null</code>.
     * @param {Graphics2D} g2D
     * @param {*[]} items
     * @param {string|CanvasPattern} selectionOutlinePaint
     * @param {string} selectionOutlineStroke
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @param {string} foregroundColor
     * @private
     */
    paintRoomsOutline(g2D : Graphics2D, items : Array<any>, selectionOutlinePaint : string|CanvasPattern, selectionOutlineStroke : java.awt.Stroke, indicatorPaint : string|CanvasPattern, planScale : number, foregroundColor : string) {
        let rooms : Array<any> = Home.getRoomsSubList(items);
        let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
        let scaleInverse : number = 1 / planScale;
        for(let index165=0; index165 < rooms.length; index165++) {
            let room = rooms[index165];
            {
                if(this.isViewableAtSelectedLevel(room)) {
                    g2D.setPaint(selectionOutlinePaint);
                    g2D.setStroke(selectionOutlineStroke);
                    g2D.draw(ShapeTools.getShape(room.getPoints(), true, null));
                    if(indicatorPaint != null) {
                        g2D.setPaint(indicatorPaint);
                        {
                            let array167 = room.getPoints();
                            for(let index166=0; index166 < array167.length; index166++) {
                                let point = array167[index166];
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
        for(let index168=0; index168 < rooms.length; index168++) {
            let room = rooms[index168];
            {
                if(this.isViewableAtSelectedLevel(room)) {
                    g2D.draw(ShapeTools.getShape(room.getPoints(), true, null));
                }
            }
        }
        if(/* size */(<number>items.length) === 1 && /* size */(<number>rooms.length) === 1 && indicatorPaint != null) {
            let selectedRoom : any = /* iterator */((a) => { var i = 0; return { next: function() { return i<a.length?a[i++]:null; }, hasNext: function() { return i<a.length; }}})(rooms).next();
            if(this.isViewableAtSelectedLevel(selectedRoom)) {
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
    paintPointsResizeIndicators(g2D : Graphics2D, item : any, indicatorPaint : string|CanvasPattern, planScale : number, closedPath : boolean, angleAtStart : number, angleAtEnd : number, orientateIndicatorOutsideShape : boolean) {
        if(this.resizeIndicatorVisible) {
            g2D.setPaint(indicatorPaint);
            g2D.setStroke(PlanComponent.INDICATOR_STROKE);
            let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
            let scaleInverse : number = 1 / planScale * this.resolutionScale;
            let points : number[][] = item.getPoints();
            let resizeIndicator : java.awt.Shape = this.getIndicator(item, PlanComponent.IndicatorType.RESIZE);
            for(let i : number = 0; i < points.length; i++) {{
                let point : number[] = points[i];
                g2D.translate(point[0], point[1]);
                g2D.scale(scaleInverse, scaleInverse);
                let previousPoint : number[] = i === 0?points[points.length - 1]:points[i - 1];
                let nextPoint : number[] = i === points.length - 1?points[0]:points[i + 1];
                let angle : number;
                if(closedPath || (i > 0 && i < points.length - 1)) {
                    let distance1 : number = <number>java.awt.geom.Point2D.distance(previousPoint[0], previousPoint[1], point[0], point[1]);
                    let xNormal1 : number = (point[1] - previousPoint[1]) / distance1;
                    let yNormal1 : number = (previousPoint[0] - point[0]) / distance1;
                    let distance2 : number = <number>java.awt.geom.Point2D.distance(nextPoint[0], nextPoint[1], point[0], point[1]);
                    let xNormal2 : number = (nextPoint[1] - point[1]) / distance2;
                    let yNormal2 : number = (point[0] - nextPoint[0]) / distance2;
                    angle = Math.atan2(yNormal1 + yNormal2, xNormal1 + xNormal2);
                    if(orientateIndicatorOutsideShape && item.containsPoint(point[0] + <number>Math.cos(angle), point[1] + <number>Math.sin(angle), 0.001) || !orientateIndicatorOutsideShape && (xNormal1 * yNormal2 - yNormal1 * xNormal2) < 0) {
                        angle += Math.PI;
                    }
                } else if(i === 0) {
                    angle = angleAtStart;
                } else {
                    angle = angleAtEnd;
                }
                g2D.rotate(angle);
                g2D.draw(resizeIndicator);
                g2D.setTransform(previousTransform);
            };}
        }
    }

    /**
     * Returns the shape of the given indicator type.
     * @param {Object} item
     * @param {PlanComponent.IndicatorType} indicatorType
     * @return {Object}
     */
    getIndicator(item : any, indicatorType : PlanComponent.IndicatorType) : java.awt.Shape {
        if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(PlanComponent.IndicatorType.RESIZE,indicatorType))) {
            if(item != null && item instanceof <any>HomePieceOfFurniture) {
                return PlanComponent.FURNITURE_RESIZE_INDICATOR;
            } else if(item != null && item instanceof <any>Compass) {
                return PlanComponent.COMPASS_RESIZE_INDICATOR;
            } else {
                return PlanComponent.WALL_AND_LINE_RESIZE_INDICATOR;
            }
        } else if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(PlanComponent.IndicatorType.ROTATE,indicatorType))) {
            if(item != null && item instanceof <any>HomePieceOfFurniture) {
                return PlanComponent.FURNITURE_ROTATION_INDICATOR;
            } else if(item != null && item instanceof <any>Compass) {
                return PlanComponent.COMPASS_ROTATION_INDICATOR;
            } else if(item != null && item instanceof <any>Camera) {
                return PlanComponent.CAMERA_YAW_ROTATION_INDICATOR;
            }
        } else if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(PlanComponent.IndicatorType.ELEVATE,indicatorType))) {
            if(item != null && item instanceof <any>Camera) {
                return PlanComponent.CAMERA_ELEVATION_INDICATOR;
            } else {
                return PlanComponent.ELEVATION_INDICATOR;
            }
        } else if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(PlanComponent.IndicatorType.RESIZE_HEIGHT,indicatorType))) {
            if(item != null && item instanceof <any>HomePieceOfFurniture) {
                return PlanComponent.FURNITURE_HEIGHT_INDICATOR;
            }
        } else if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(PlanComponent.IndicatorType.CHANGE_POWER,indicatorType))) {
            if(item != null && item instanceof <any>HomeLight) {
                return PlanComponent.LIGHT_POWER_INDICATOR;
            }
        } else if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(PlanComponent.IndicatorType.MOVE_TEXT,indicatorType))) {
            return PlanComponent.TEXT_LOCATION_INDICATOR;
        } else if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(PlanComponent.IndicatorType.ROTATE_TEXT,indicatorType))) {
            return PlanComponent.TEXT_ANGLE_INDICATOR;
        } else if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(PlanComponent.IndicatorType.ROTATE_PITCH,indicatorType))) {
            if(item != null && item instanceof <any>HomePieceOfFurniture) {
                return PlanComponent.FURNITURE_PITCH_ROTATION_INDICATOR;
            } else if(item != null && item instanceof <any>Camera) {
                return PlanComponent.CAMERA_PITCH_ROTATION_INDICATOR;
            }
        } else if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(PlanComponent.IndicatorType.ROTATE_ROLL,indicatorType))) {
            if(item != null && item instanceof <any>HomePieceOfFurniture) {
                return PlanComponent.FURNITURE_ROLL_ROTATION_INDICATOR;
            }
        } else if(/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(PlanComponent.IndicatorType.ARC_EXTENT,indicatorType))) {
            if(item != null && item instanceof <any>Wall) {
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
    paintRoomNameOffsetIndicator(g2D : Graphics2D, room : any, indicatorPaint : string|CanvasPattern, planScale : number) {
        if(this.resizeIndicatorVisible && room.getName() != null && room.getName().trim().length > 0) {
            let xName : number = room.getXCenter() + room.getNameXOffset();
            let yName : number = room.getYCenter() + room.getNameYOffset();
            this.paintTextIndicators(g2D, (<any>room.constructor), this.getLineCount(room.getName()), room.getNameStyle(), xName, yName, room.getNameAngle(), indicatorPaint, planScale);
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
    paintRoomAreaOffsetIndicator(g2D : Graphics2D, room : any, indicatorPaint : string|CanvasPattern, planScale : number) {
        if(this.resizeIndicatorVisible && room.isAreaVisible() && room.getArea() > 0.01) {
            let xArea : number = room.getXCenter() + room.getAreaXOffset();
            let yArea : number = room.getYCenter() + room.getAreaYOffset();
            this.paintTextIndicators(g2D, (<any>room.constructor), 1, room.getAreaStyle(), xArea, yArea, room.getAreaAngle(), indicatorPaint, planScale);
        }
    }

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
    paintTextIndicators(g2D : Graphics2D, selectableClass : any, lineCount : number, style : any, x : number, y : number, angle : number, indicatorPaint : string|CanvasPattern, planScale : number) {
        if(this.resizeIndicatorVisible) {
            g2D.setPaint(indicatorPaint);
            g2D.setStroke(PlanComponent.INDICATOR_STROKE);
            let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
            let scaleInverse : number = 1 / planScale * this.resolutionScale;
            g2D.translate(x, y);
            g2D.rotate(angle);
            g2D.scale(scaleInverse, scaleInverse);
            if(selectableClass instanceof Label) {
                g2D.draw(PlanComponent.LABEL_CENTER_INDICATOR);
            } else {
                g2D.draw(this.getIndicator(null, PlanComponent.IndicatorType.MOVE_TEXT));
            }
            if(style == null) {
                style = this.preferences.getDefaultTextStyle(selectableClass);
            }
            let fontMetrics : FontMetrics = this.getFontMetrics(g2D.getFont(), style);
            g2D.setTransform(previousTransform);
            g2D.translate(x, y);
            g2D.rotate(angle);
            g2D.translate(0, -fontMetrics.getHeight() * (lineCount - 1) - fontMetrics.getAscent() * (selectableClass instanceof Label?1:0.85));
            g2D.scale(scaleInverse, scaleInverse);
            g2D.draw(this.getIndicator(null, PlanComponent.IndicatorType.ROTATE_TEXT));
            g2D.setTransform(previousTransform);
        }
    }

    /**
     * Returns the number of lines in the given <code>text</code>.
     * @param {string} text
     * @return {number}
     * @private
     */
    getLineCount(text : string) : number {
        let lineCount : number = 1;
        for(let i : number = 0, n : number = text.length; i < n; i++) {{
            if((c => c.charCodeAt==null?<any>c:c.charCodeAt(0))(text.charAt(i)) == '\n'.charCodeAt(0)) {
                lineCount++;
            }
        };}
        return lineCount;
    }

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
    paintWalls(g2D : Graphics2D, selectedItems : Array<any>, planScale : number, backgroundColor : string, foregroundColor : string, paintMode : PlanComponent.PaintMode) {
        let paintedWalls : Array<any>;
        let wallAreas : any;
        if(paintMode !== PlanComponent.PaintMode.CLIPBOARD) {
            wallAreas = this.getWallAreas$();
        } else {
            paintedWalls = Home.getWallsSubList(selectedItems);
            wallAreas = this.getWallAreas$java_util_Collection(this.getDrawableWallsInSelectedLevel(paintedWalls));
        }
        let wallPaintScale : number = paintMode === PlanComponent.PaintMode.PRINT?planScale / 72 * 150:planScale / this.resolutionScale;
        let oldComposite : string = null;
        if(paintMode === PlanComponent.PaintMode.PAINT && this.backgroundPainted && this.backgroundImageCache != null && this.wallsDoorsOrWindowsModification) {
            oldComposite = this.setTransparency(g2D, 0.5);
        }
        {
            let array170 = /* entrySet */((m) => { if(m.entries==null) m.entries=[]; return m.entries; })(<any>wallAreas);
            for(let index169=0; index169 < array170.length; index169++) {
                let areaEntry = array170[index169];
                {
                    let wallPattern : any = /* iterator */((a) => { var i = 0; return { next: function() { return i<a.length?a[i++]:null; }, hasNext: function() { return i<a.length; }}})(areaEntry.getKey()).next().getPattern();
                    this.fillAndDrawWallsArea(g2D, areaEntry.getValue(), planScale, this.getWallPaint(g2D, wallPaintScale, backgroundColor, foregroundColor, wallPattern != null?wallPattern:this.preferences.getWallPattern()), foregroundColor, paintMode);
                }
            }
        }
        if(oldComposite != null) {
            g2D.setComposite(oldComposite);
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
    fillAndDrawWallsArea(g2D : Graphics2D, area : java.awt.geom.Area, planScale : number, fillPaint : string|CanvasPattern, drawPaint : string|CanvasPattern, paintMode : PlanComponent.PaintMode) {
        g2D.setPaint(fillPaint);
        this.fillShape(g2D, area, paintMode);
        g2D.setPaint(drawPaint);
        g2D.setStroke(new java.awt.BasicStroke(this.getStrokeWidth(Wall, paintMode) / planScale));
        g2D.draw(area);
    }

    /**
     * Paints the outline of walls among <code>items</code> and a resize indicator if
     * <code>items</code> contains only one wall and indicator paint isn't <code>null</code>.
     * @param {Graphics2D} g2D
     * @param {*[]} items
     * @param {string|CanvasPattern} selectionOutlinePaint
     * @param {string} selectionOutlineStroke
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @param {string} foregroundColor
     * @private
     */
    paintWallsOutline(g2D : Graphics2D, items : Array<any>, selectionOutlinePaint : string|CanvasPattern, selectionOutlineStroke : java.awt.Stroke, indicatorPaint : string|CanvasPattern, planScale : number, foregroundColor : string) {
        let scaleInverse : number = 1 / planScale;
        let walls : Array<any> = Home.getWallsSubList(items);
        let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
        for(let index171=0; index171 < walls.length; index171++) {
            let wall = walls[index171];
            {
                if(this.isViewableAtSelectedLevel(wall)) {
                    g2D.setPaint(selectionOutlinePaint);
                    g2D.setStroke(selectionOutlineStroke);
                    g2D.draw(ShapeTools.getShape(wall.getPoints(), true, null));
                    if(indicatorPaint != null) {
                        g2D.translate(wall.getXStart(), wall.getYStart());
                        g2D.scale(scaleInverse, scaleInverse);
                        g2D.setPaint(indicatorPaint);
                        g2D.setStroke(PlanComponent.POINT_STROKE);
                        g2D.fill(PlanComponent.WALL_POINT);
                        let arcExtent : number = wall.getArcExtent();
                        let indicatorAngle : number;
                        let distanceAtScale : number;
                        let xArcCircleCenter : number = 0;
                        let yArcCircleCenter : number = 0;
                        let arcCircleRadius : number = 0;
                        let startPointToEndPointDistance : number = wall.getStartPointToEndPointDistance();
                        let wallAngle : number = Math.atan2(wall.getYEnd() - wall.getYStart(), wall.getXEnd() - wall.getXStart());
                        if(arcExtent != null && /* floatValue */arcExtent !== 0) {
                            xArcCircleCenter = wall.getXArcCircleCenter();
                            yArcCircleCenter = wall.getYArcCircleCenter();
                            arcCircleRadius = java.awt.geom.Point2D.distance(wall.getXStart(), wall.getYStart(), xArcCircleCenter, yArcCircleCenter);
                            distanceAtScale = arcCircleRadius * Math.abs(arcExtent) * planScale;
                            indicatorAngle = Math.atan2(yArcCircleCenter - wall.getYStart(), xArcCircleCenter - wall.getXStart()) + (arcExtent > 0?-Math.PI / 2:Math.PI / 2);
                        } else {
                            distanceAtScale = startPointToEndPointDistance * planScale;
                            indicatorAngle = wallAngle;
                        }
                        if(distanceAtScale < 30) {
                            g2D.rotate(wallAngle);
                            if(arcExtent != null) {
                                let wallToStartPointArcCircleCenterAngle : number = Math.abs(arcExtent) > Math.PI?-(Math.PI + arcExtent) / 2:(Math.PI - arcExtent) / 2;
                                let arcCircleCenterToWallDistance : number = <number>(Math.tan(wallToStartPointArcCircleCenterAngle) * startPointToEndPointDistance / 2);
                                g2D.translate(startPointToEndPointDistance * planScale / 2, (arcCircleCenterToWallDistance - arcCircleRadius * (Math.abs(wallAngle) > Math.PI / 2?-1:1)) * planScale);
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
                        if(distanceAtScale >= 30) {
                            if(arcExtent != null) {
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
            let array173 = /* values */((m) => { let r=[]; if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) r.push(m.entries[i].value); return r; })(<any>this.getWallAreas$java_util_Collection(this.getDrawableWallsInSelectedLevel(walls)));
            for(let index172=0; index172 < array173.length; index172++) {
                let area = array173[index172];
                {
                    g2D.draw(area);
                }
            }
        }
        if(/* size */(<number>items.length) === 1 && /* size */(<number>walls.length) === 1 && indicatorPaint != null) {
            let wall : any = /* iterator */((a) => { var i = 0; return { next: function() { return i<a.length?a[i++]:null; }, hasNext: function() { return i<a.length; }}})(walls).next();
            if(this.isViewableAtSelectedLevel(wall)) {
                this.paintWallResizeIndicators(g2D, wall, indicatorPaint, planScale);
            }
        }
    }

    /**
     * Returns <code>true</code> if the given item can be viewed in the plan at the selected level.
     * @param {Object} item
     * @return {boolean}
     */
    isViewableAtSelectedLevel(item : any) : boolean {
        let level : any = item.getLevel();
        return level == null || (level.isViewable() && item.isAtLevel(this.home.getSelectedLevel()));
    }

    /**
     * Paints resize indicators on <code>wall</code>.
     * @param {Graphics2D} g2D
     * @param {Wall} wall
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @private
     */
    paintWallResizeIndicators(g2D : Graphics2D, wall : any, indicatorPaint : string|CanvasPattern, planScale : number) {
        if(this.resizeIndicatorVisible) {
            g2D.setPaint(indicatorPaint);
            g2D.setStroke(PlanComponent.INDICATOR_STROKE);
            let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
            let scaleInverse : number = 1 / planScale * this.resolutionScale;
            let wallPoints : number[][] = wall.getPoints();
            let leftSideMiddlePointIndex : number = (wallPoints.length / 4|0);
            let wallAngle : number = Math.atan2(wall.getYEnd() - wall.getYStart(), wall.getXEnd() - wall.getXStart());
            if(wallPoints.length % 4 === 0) {
                g2D.translate((wallPoints[leftSideMiddlePointIndex - 1][0] + wallPoints[leftSideMiddlePointIndex][0]) / 2, (wallPoints[leftSideMiddlePointIndex - 1][1] + wallPoints[leftSideMiddlePointIndex][1]) / 2);
            } else {
                g2D.translate(wallPoints[leftSideMiddlePointIndex][0], wallPoints[leftSideMiddlePointIndex][1]);
            }
            g2D.scale(scaleInverse, scaleInverse);
            g2D.rotate(wallAngle + Math.PI);
            g2D.draw(this.getIndicator(wall, PlanComponent.IndicatorType.ARC_EXTENT));
            g2D.setTransform(previousTransform);
            let arcExtent : number = wall.getArcExtent();
            let indicatorAngle : number;
            if(arcExtent != null && /* floatValue */arcExtent !== 0) {
                indicatorAngle = Math.atan2(wall.getYArcCircleCenter() - wall.getYEnd(), wall.getXArcCircleCenter() - wall.getXEnd()) + (arcExtent > 0?-Math.PI / 2:Math.PI / 2);
            } else {
                indicatorAngle = wallAngle;
            }
            g2D.translate(wall.getXEnd(), wall.getYEnd());
            g2D.scale(scaleInverse, scaleInverse);
            g2D.rotate(indicatorAngle);
            g2D.draw(this.getIndicator(wall, PlanComponent.IndicatorType.RESIZE));
            g2D.setTransform(previousTransform);
            if(arcExtent != null) {
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

    getWallAreas$() : any {
        if(this.wallAreasCache == null) {
            this.wallAreasCache = this.getWallAreas$java_util_Collection(this.getDrawableWallsInSelectedLevel(this.home.getWalls()));
        }
        return this.wallAreasCache;
    }

    /**
     * Returns the walls that belong to the selected level in home.
     * @param {Wall[]} walls
     * @return {Wall[]}
     * @private
     */
    getDrawableWallsInSelectedLevel(walls : Array<any>) : Array<any> {
        let wallsInSelectedLevel : Array<any> = <any>([]);
        for(let index174=0; index174 < walls.length; index174++) {
            let wall = walls[index174];
            {
                if(this.isViewableAtSelectedLevel(wall)) {
                    /* add */(wallsInSelectedLevel.push(wall)>0);
                }
            }
        }
        return wallsInSelectedLevel;
    }

    public getWallAreas$java_util_Collection(walls : Array<any>) : any {
        if(/* size */(<number>walls.length) === 0) {
            return /* emptyMap */{};
        }
        let pattern : any = /* iterator */((a) => { var i = 0; return { next: function() { return i<a.length?a[i++]:null; }, hasNext: function() { return i<a.length; }}})(walls).next().getPattern();
        let samePattern : boolean = true;
        for(let index175=0; index175 < walls.length; index175++) {
            let wall = walls[index175];
            {
                if(pattern !== wall.getPattern()) {
                    samePattern = false;
                    break;
                }
            }
        }
        let wallAreas : any = <any>({});
        if(samePattern) {
            /* put */((m,k,v) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { m.entries[i].value=v; return; } m.entries.push({key:k,value:v,getKey: function() { return this.key }, getValue: function() { return this.value }}); })(<any>wallAreas, walls, this.getItemsArea(walls));
        } else {
            let sortedWalls : any = <any>({});
            for(let index176=0; index176 < walls.length; index176++) {
                let wall = walls[index176];
                {
                    let wallPattern : any = wall.getPattern();
                    if(wallPattern == null) {
                        wallPattern = this.preferences.getWallPattern();
                    }
                    let patternWalls : Array<any> = /* get */((m,k) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { return m.entries[i].value; } return null; })(<any>sortedWalls, wallPattern);
                    if(patternWalls == null) {
                        patternWalls = <any>([]);
                        /* put */((m,k,v) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { m.entries[i].value=v; return; } m.entries.push({key:k,value:v,getKey: function() { return this.key }, getValue: function() { return this.value }}); })(<any>sortedWalls, wallPattern, patternWalls);
                    }
                    /* add */(patternWalls.push(wall)>0);
                }
            }
            {
                let array178 = /* values */((m) => { let r=[]; if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) r.push(m.entries[i].value); return r; })(<any>sortedWalls);
                for(let index177=0; index177 < array178.length; index177++) {
                    let patternWalls = array178[index177];
                    {
                        /* put */((m,k,v) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { m.entries[i].value=v; return; } m.entries.push({key:k,value:v,getKey: function() { return this.key }, getValue: function() { return this.value }}); })(<any>wallAreas, patternWalls, this.getItemsArea(patternWalls));
                    }
                }
            }
        }
        return wallAreas;
    }

    /**
     * Returns areas matching the union of <code>walls</code> shapes sorted by pattern.
     * @param {Wall[]} walls
     * @return {Object}
     * @private
     */
    public getWallAreas(walls? : any) : any {
        if(((walls != null && (walls instanceof Array)) || walls === null)) {
            return <any>this.getWallAreas$java_util_Collection(walls);
        } else if(walls === undefined) {
            return <any>this.getWallAreas$();
        } else throw new Error('invalid overload');
    }

    /**
     * Returns an area matching the union of all <code>items</code> shapes.
     * @param {Bound[]} items
     * @return {java.awt.geom.Area}
     * @private
     */
    getItemsArea(items : Array<any>) : java.awt.geom.Area {
        let itemsArea : java.awt.geom.Area = new java.awt.geom.Area();
        for(let index179=0; index179 < items.length; index179++) {
            let item = items[index179];
            {
                itemsArea.add(new java.awt.geom.Area(ShapeTools.getShape(item.getPoints(), true, null)));
            }
        }
        return itemsArea;
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
    getWallPaint(g2D : Graphics2D, planScale : number, backgroundColor : string, foregroundColor : string, wallPattern : TextureImage) : CanvasPattern {
        let patternImage : HTMLImageElement = this.patternImagesCache[wallPattern.getImage().getURL()];
        if(patternImage == null || backgroundColor != this.wallsPatternBackgroundCache || foregroundColor != this.wallsPatternForegroundCache) {
            patternImage = TextureManager.getInstance().getWaitImage();
            this.patternImagesCache[wallPattern.getImage().getURL()] = patternImage;
            TextureManager.getInstance().loadTexture(wallPattern.getImage(), false, {
              textureUpdated : (image : HTMLImageElement) => {
                this.patternImagesCache[wallPattern.getImage().getURL()] = image;
                this.repaint();
              },
              textureError : () => {
                 this.patternImagesCache[wallPattern.getImage().getURL()] = PlanComponent.ERROR_TEXTURE_IMAGE;
              },
              progression : () => {}
              
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
     * @param {number} planScale
     * @param {string} backgroundColor
     * @param {string} foregroundColor
     * @param {string} furnitureOutlineColor
     * @param {PlanComponent.PaintMode} paintMode
     * @param {boolean} paintIcon
     * @private
     */
    paintFurniture(g2D : Graphics2D, furniture : Array<any>, selectedItems : Array<any>, planScale : number, backgroundColor : string, foregroundColor : string, furnitureOutlineColor : string, paintMode : PlanComponent.PaintMode, paintIcon : boolean) {
        if(!/* isEmpty */(furniture.length == 0)) {
            let pieceBorderStroke : java.awt.BasicStroke = new java.awt.BasicStroke(this.getStrokeWidth(HomePieceOfFurniture, paintMode) / planScale);
            let allFurnitureViewedFromTop : boolean = null;
            for(let index180=0; index180 < furniture.length; index180++) {
                let piece = furniture[index180];
                {
                    if(piece.isVisible()) {
                        let selectedPiece : boolean = /* contains */(selectedItems.indexOf(<any>(piece)) >= 0);
                        if(piece != null && piece instanceof <any>HomeFurnitureGroup) {
                            let groupFurniture : Array<any> = (piece).getFurniture();
                            let emptyList : Array<any> = /* emptyList */[];
                            this.paintFurniture(g2D, groupFurniture, selectedPiece?groupFurniture:emptyList, planScale, backgroundColor, foregroundColor, furnitureOutlineColor, paintMode, paintIcon);
                        } else if(paintMode !== PlanComponent.PaintMode.CLIPBOARD || selectedPiece) {
                            let pieceShape : java.awt.Shape = ShapeTools.getShape(piece.getPoints(), true, null);
                            let pieceShape2D : java.awt.Shape;
                            if(piece != null && piece instanceof <any>HomeDoorOrWindow) {
                                let doorOrWindow : any = piece;
                                pieceShape2D = this.getDoorOrWindowWallPartShape(doorOrWindow);
                                if(this.draggedItemsFeedback == null || !/* contains */(this.draggedItemsFeedback.indexOf(<any>(piece)) >= 0)) {
                                    this.paintDoorOrWindowWallThicknessArea(g2D, doorOrWindow, planScale, backgroundColor, foregroundColor, paintMode);
                                }
                                this.paintDoorOrWindowSashes(g2D, doorOrWindow, planScale, foregroundColor, paintMode);
                            } else {
                                pieceShape2D = pieceShape;
                            }
                            let viewedFromTop : boolean;
                            if(this.preferences.isFurnitureViewedFromTop()) {
                                if(piece.getPlanIcon() != null || (piece != null && piece instanceof <any>HomeDoorOrWindow)) {
                                    viewedFromTop = true;
                                } else {
                                    if(allFurnitureViewedFromTop == null) {
                                        try {
                                            allFurnitureViewedFromTop = !javaemul.internal.BooleanHelper.getBoolean("com.eteks.sweethome3d.no3D") && Component3DManager.getInstance().isOffScreenImageSupported();
                                        } catch(ex) {
                                            allFurnitureViewedFromTop = false;
                                        };
                                    }
                                    viewedFromTop = /* booleanValue */allFurnitureViewedFromTop;
                                }
                            } else {
                                viewedFromTop = false;
                            }
                            if(paintIcon && viewedFromTop) {
                                if(piece != null && piece instanceof <any>HomeDoorOrWindow) {
                                    g2D.setPaint(backgroundColor);
                                    g2D.fill(pieceShape2D);
                                    g2D.setPaint(foregroundColor);
                                    g2D.setStroke(pieceBorderStroke);
                                    g2D.draw(pieceShape2D);
                                } else {
                                    this.paintPieceOfFurnitureTop(g2D, piece, pieceShape2D, pieceBorderStroke, planScale, backgroundColor, foregroundColor, paintMode);
                                }
                                if(paintMode === PlanComponent.PaintMode.PAINT) {
                                    g2D.setStroke(pieceBorderStroke);
                                    g2D.setPaint(furnitureOutlineColor);
                                    g2D.draw(pieceShape);
                                }
                            } else {
                                if(paintIcon) {
                                    this.paintPieceOfFurnitureIcon(g2D, piece, pieceShape2D, planScale, backgroundColor, paintMode);
                                }
                                g2D.setPaint(foregroundColor);
                                g2D.setStroke(pieceBorderStroke);
                                g2D.draw(pieceShape2D);
                                if((piece != null && piece instanceof <any>HomeDoorOrWindow) && paintMode === PlanComponent.PaintMode.PAINT) {
                                    g2D.setPaint(furnitureOutlineColor);
                                    g2D.draw(pieceShape);
                                }
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
    getDoorOrWindowWallPartShape(doorOrWindow : any) : java.awt.Shape {
        let doorOrWindowWallPartRectangle : java.awt.geom.Rectangle2D = this.getDoorOrWindowRectangle(doorOrWindow, true);
        let rotation : java.awt.geom.AffineTransform = java.awt.geom.AffineTransform.getRotateInstance(doorOrWindow.getAngle(), doorOrWindow.getX(), doorOrWindow.getY());
        let it : java.awt.geom.PathIterator = doorOrWindowWallPartRectangle.getPathIterator(rotation);
        let doorOrWindowWallPartShape : java.awt.geom.GeneralPath = new java.awt.geom.GeneralPath();
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
    getDoorOrWindowRectangle(doorOrWindow : any, onlyWallPart : boolean) : java.awt.geom.Rectangle2D {
        let wallThickness : number = doorOrWindow.getDepth() * (onlyWallPart?doorOrWindow.getWallThickness():1);
        let wallDistance : number = doorOrWindow.getDepth() * (onlyWallPart?doorOrWindow.getWallDistance():0);
        let cutOutShape : string = doorOrWindow.getCutOutShape();
        let width : number = doorOrWindow.getWidth();
        let wallWidth : number = doorOrWindow.getWallWidth() * width;
        let x : number = doorOrWindow.getX() - width / 2;
        x += doorOrWindow.isModelMirrored()?(1 - doorOrWindow.getWallLeft() - doorOrWindow.getWallWidth()) * width:doorOrWindow.getWallLeft() * width;
        if(cutOutShape != null && !/* equals */(<any>((o1: any, o2: any) => { if(o1 && o1.equals) { return o1.equals(o2); } else { return o1 === o2; } })(PieceOfFurniture.DEFAULT_CUT_OUT_SHAPE,cutOutShape))) {
            let shape : java.awt.Shape = ShapeTools.getShape(cutOutShape);
            let bounds : java.awt.geom.Rectangle2D = shape.getBounds2D();
            if(doorOrWindow.isModelMirrored()) {
                x += <number>(1 - bounds.getX() - bounds.getWidth()) * wallWidth;
            } else {
                x += <number>bounds.getX() * wallWidth;
            }
            wallWidth *= bounds.getWidth();
        }
        let doorOrWindowWallPartRectangle : java.awt.geom.Rectangle2D = new java.awt.geom.Rectangle2D.Float(x, doorOrWindow.getY() - doorOrWindow.getDepth() / 2 + wallDistance, wallWidth, wallThickness);
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
    paintDoorOrWindowWallThicknessArea(g2D : Graphics2D, doorOrWindow : any, planScale : number, backgroundColor : string, foregroundColor : string, paintMode : PlanComponent.PaintMode) {
        if(doorOrWindow.isWallCutOutOnBothSides()) {
            let doorOrWindowWallArea : java.awt.geom.Area = null;
            if(this.doorOrWindowWallThicknessAreasCache != null) {
                doorOrWindowWallArea = /* get */((m,k) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { return m.entries[i].value; } return null; })(<any>this.doorOrWindowWallThicknessAreasCache, doorOrWindow);
            }
            if(doorOrWindowWallArea == null) {
                let doorOrWindowRectangle : java.awt.geom.Rectangle2D = this.getDoorOrWindowRectangle(doorOrWindow, false);
                let rotation : java.awt.geom.AffineTransform = java.awt.geom.AffineTransform.getRotateInstance(doorOrWindow.getAngle(), doorOrWindow.getX(), doorOrWindow.getY());
                let it : java.awt.geom.PathIterator = doorOrWindowRectangle.getPathIterator(rotation);
                let doorOrWindowWallPartShape : java.awt.geom.GeneralPath = new java.awt.geom.GeneralPath();
                doorOrWindowWallPartShape.append(it, false);
                let doorOrWindowWallPartArea : java.awt.geom.Area = new java.awt.geom.Area(doorOrWindowWallPartShape);
                doorOrWindowWallArea = new java.awt.geom.Area();
                {
                    let array182 = this.home.getWalls();
                    for(let index181=0; index181 < array182.length; index181++) {
                        let wall = array182[index181];
                        {
                            if(wall.isAtLevel(doorOrWindow.getLevel()) && doorOrWindow.isParallelToWall(wall)) {
                                let wallShape : java.awt.Shape = ShapeTools.getShape(wall.getPoints(), true, null);
                                let wallArea : java.awt.geom.Area = new java.awt.geom.Area(wallShape);
                                wallArea.intersect(doorOrWindowWallPartArea);
                                if(!wallArea.isEmpty()) {
                                    let doorOrWindowExtendedRectangle : java.awt.geom.Rectangle2D = new java.awt.geom.Rectangle2D.Float(<number>doorOrWindowRectangle.getX(), <number>doorOrWindowRectangle.getY() - 2 * wall.getThickness(), <number>doorOrWindowRectangle.getWidth(), <number>doorOrWindowRectangle.getWidth() + 4 * wall.getThickness());
                                    it = doorOrWindowExtendedRectangle.getPathIterator(rotation);
                                    let path : java.awt.geom.GeneralPath = new java.awt.geom.GeneralPath();
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
            if(this.doorOrWindowWallThicknessAreasCache == null) {
                this.doorOrWindowWallThicknessAreasCache = <any>({});
            }
            /* put */((m,k,v) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { m.entries[i].value=v; return; } m.entries.push({key:k,value:v,getKey: function() { return this.key }, getValue: function() { return this.value }}); })(<any>this.doorOrWindowWallThicknessAreasCache, doorOrWindow, doorOrWindowWallArea);
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
    paintDoorOrWindowSashes(g2D : Graphics2D, doorOrWindow : any, planScale : number, foregroundColor : string, paintMode : PlanComponent.PaintMode) {
        let sashBorderStroke : java.awt.BasicStroke = new java.awt.BasicStroke(this.getStrokeWidth(HomePieceOfFurniture, paintMode) / planScale);
        g2D.setPaint(foregroundColor);
        g2D.setStroke(sashBorderStroke);
        {
            let array184 = doorOrWindow.getSashes();
            for(let index183=0; index183 < array184.length; index183++) {
                let sash = array184[index183];
                {
                    g2D.draw(this.getDoorOrWindowSashShape(doorOrWindow, sash));
                }
            }
        }
    }

    /**
     * Returns the shape of a sash of a door or a window.
     * @param {HomeDoorOrWindow} doorOrWindow
     * @param {Sash} sash
     * @return {java.awt.geom.GeneralPath}
     * @private
     */
    getDoorOrWindowSashShape(doorOrWindow : any, sash : any) : java.awt.geom.GeneralPath {
        let modelMirroredSign : number = doorOrWindow.isModelMirrored()?-1:1;
        let xAxis : number = modelMirroredSign * sash.getXAxis() * doorOrWindow.getWidth();
        let yAxis : number = sash.getYAxis() * doorOrWindow.getDepth();
        let sashWidth : number = sash.getWidth() * doorOrWindow.getWidth();
        let startAngle : number = <number>/* toDegrees */(x => x * 180 / Math.PI)(sash.getStartAngle());
        if(doorOrWindow.isModelMirrored()) {
            startAngle = 180 - startAngle;
        }
        let extentAngle : number = modelMirroredSign * <number>/* toDegrees */(x => x * 180 / Math.PI)(sash.getEndAngle() - sash.getStartAngle());
        let arc : java.awt.geom.Arc2D = new java.awt.geom.Arc2D.Float(xAxis - sashWidth, yAxis - sashWidth, 2 * sashWidth, 2 * sashWidth, startAngle, extentAngle, java.awt.geom.Arc2D.PIE);
        let transformation : java.awt.geom.AffineTransform = java.awt.geom.AffineTransform.getTranslateInstance(doorOrWindow.getX(), doorOrWindow.getY());
        transformation.rotate(doorOrWindow.getAngle());
        transformation.translate(modelMirroredSign * -doorOrWindow.getWidth() / 2, -doorOrWindow.getDepth() / 2);
        let it : java.awt.geom.PathIterator = arc.getPathIterator(transformation);
        let sashShape : java.awt.geom.GeneralPath = new java.awt.geom.GeneralPath();
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
    paintFurnitureName(g2D : Graphics2D, furniture : Array<any>, selectedItems : Array<any>, planScale : number, foregroundColor : string, paintMode : PlanComponent.PaintMode) {
        let previousFont : string = g2D.getFont();
        g2D.setPaint(foregroundColor);
        for(let index185=0; index185 < furniture.length; index185++) {
            let piece = furniture[index185];
            {
                if(piece.isVisible()) {
                    let selectedPiece : boolean = /* contains */(selectedItems.indexOf(<any>(piece)) >= 0);
                    if(piece != null && piece instanceof <any>HomeFurnitureGroup) {
                        let groupFurniture : Array<any> = (piece).getFurniture();
                        let emptyList : Array<any> = /* emptyList */[];
                        this.paintFurnitureName(g2D, groupFurniture, selectedPiece?groupFurniture:emptyList, planScale, foregroundColor, paintMode);
                    }
                    if(piece.isNameVisible() && (paintMode !== PlanComponent.PaintMode.CLIPBOARD || selectedPiece)) {
                        let name : string = piece.getName().trim();
                        if(name.length > 0) {
                            this.paintText(g2D, (<any>piece.constructor), name, piece.getNameStyle(), null, piece.getX() + piece.getNameXOffset(), piece.getY() + piece.getNameYOffset(), piece.getNameAngle(), previousFont);
                        }
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
     * @param {*[]} items
     * @param {string|CanvasPattern} selectionOutlinePaint
     * @param {string} selectionOutlineStroke
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @param {string} foregroundColor
     * @private
     */
    paintFurnitureOutline(g2D : Graphics2D, items : Array<any>, selectionOutlinePaint : string|CanvasPattern, selectionOutlineStroke : java.awt.Stroke, indicatorPaint : string|CanvasPattern, planScale : number, foregroundColor : string) {
        let pieceBorderStroke : java.awt.BasicStroke = new java.awt.BasicStroke(this.getStrokeWidth(HomePieceOfFurniture, PlanComponent.PaintMode.PAINT) / planScale);
        let pieceFrontBorderStroke : java.awt.BasicStroke = new java.awt.BasicStroke(4 * this.getStrokeWidth(HomePieceOfFurniture, PlanComponent.PaintMode.PAINT) / planScale, java.awt.BasicStroke.CAP_BUTT, java.awt.BasicStroke.JOIN_MITER);
        let furniture : Array<any> = Home.getFurnitureSubList(items);
        let furnitureGroupsArea : java.awt.geom.Area = null;
        let furnitureGroupsStroke : java.awt.BasicStroke = new java.awt.BasicStroke(15 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_SQUARE, java.awt.BasicStroke.JOIN_ROUND);
        let lastGroup : any = null;
        let furnitureInGroupsArea : java.awt.geom.Area = null;
        let homeFurniture : Array<any> = this.home.getFurniture();
        for(let it : any = /* iterator */((a) => { var i = 0; return { next: function() { return i<a.length?a[i++]:null; }, hasNext: function() { return i<a.length; }}})(furniture); it.hasNext(); ) {{
            let piece : any = it.next();
            if(piece.isVisible() && this.isViewableAtSelectedLevel(piece)) {
                let homePieceOfFurniture : any = this.getPieceOfFurnitureInHomeFurniture(piece, homeFurniture);
                if(homePieceOfFurniture !== piece) {
                    let groupArea : java.awt.geom.Area = null;
                    if(lastGroup !== homePieceOfFurniture) {
                        let groupShape : java.awt.Shape = ShapeTools.getShape(homePieceOfFurniture.getPoints(), true, null);
                        groupArea = new java.awt.geom.Area(groupShape);
                        groupArea.add(new java.awt.geom.Area(furnitureGroupsStroke.createStrokedShape(groupShape)));
                    }
                    let pieceArea : java.awt.geom.Area = new java.awt.geom.Area(ShapeTools.getShape(piece.getPoints(), true, null));
                    if(furnitureGroupsArea == null) {
                        furnitureGroupsArea = groupArea;
                        furnitureInGroupsArea = pieceArea;
                    } else {
                        if(lastGroup !== homePieceOfFurniture) {
                            furnitureGroupsArea.add(groupArea);
                        }
                        furnitureInGroupsArea.add(pieceArea);
                    }
                    lastGroup = homePieceOfFurniture;
                }
            } else {
                it.remove();
            }
        };}
        if(furnitureGroupsArea != null) {
            furnitureGroupsArea.subtract(furnitureInGroupsArea);
            let oldComposite : java.awt.Composite = this.setTransparency(g2D, 0.6);
            g2D.setPaint(selectionOutlinePaint);
            g2D.fill(furnitureGroupsArea);
            g2D.setComposite(oldComposite);
        }
        for(let index186=0; index186 < furniture.length; index186++) {
            let piece = furniture[index186];
            {
                let points : number[][] = piece.getPoints();
                let pieceShape : java.awt.Shape = ShapeTools.getShape(points, true, null);
                g2D.setPaint(selectionOutlinePaint);
                g2D.setStroke(selectionOutlineStroke);
                g2D.draw(pieceShape);
                g2D.setPaint(foregroundColor);
                g2D.setStroke(pieceBorderStroke);
                g2D.draw(pieceShape);
                g2D.setStroke(pieceFrontBorderStroke);
                g2D.draw(new java.awt.geom.Line2D.Float(points[2][0], points[2][1], points[3][0], points[3][1]));
                if(/* size */(<number>items.length) === 1 && indicatorPaint != null) {
                    this.paintPieceOFFurnitureIndicators(g2D, piece, indicatorPaint, planScale);
                }
            }
        }
    }

    /**
     * Returns <code>piece</code> if it belongs to home furniture or the group to which <code>piece</code> belongs.
     * @param {HomePieceOfFurniture} piece
     * @param {HomePieceOfFurniture[]} homeFurniture
     * @return {HomePieceOfFurniture}
     * @private
     */
    getPieceOfFurnitureInHomeFurniture(piece : any, homeFurniture : Array<any>) : any {
        if(!/* contains */(homeFurniture.indexOf(<any>(piece)) >= 0)) {
            for(let index187=0; index187 < homeFurniture.length; index187++) {
                let homePiece = homeFurniture[index187];
                {
                    if((homePiece != null && homePiece instanceof <any>HomeFurnitureGroup) && /* contains */((homePiece).getAllFurniture().indexOf(<any>(piece)) >= 0)) {
                        return homePiece;
                    }
                }
            }
        }
        return piece;
    }

    /**
     * Paints <code>icon</code> with <code>g2D</code>.
     * @param {Graphics2D} g2D
     * @param {HomePieceOfFurniture} piece
     * @param {Object} icon
     * @param {Object} pieceShape2D
     * @param {number} planScale
     * @param {string} backgroundColor
     * @private
     */
    public paintPieceOfFurnitureIcon(g2D : Graphics2D, piece : HomePieceOfFurniture, pieceShape2D? : java.awt.geom.GeneralPath, planScale? : any, backgroundColor? : any) : any {
      if(this.furnitureIconsCache === undefined) {
        this.furnitureIconsCache = {};
      }
        var image = this.furnitureIconsCache[piece.icon.getURL()];
        if(image == null) {
          image = TextureManager.getInstance().getWaitImage();
          console.log("paintPieceOfFurnitureIcon: loading "+piece.icon.getURL());
          TextureManager.getInstance().loadTexture(piece.icon, {
            textureUpdated: (texture : HTMLImageElement) => {
              console.log("paintPieceOfFurnitureIcon: loaded "+piece.icon.getURL());
              this.furnitureIconsCache[piece.icon.getURL()] = texture;
              //this.repaint();
            },
            textureError : () => {
              console.error("icon not found: "+piece.icon.getURL());
              this.furnitureIconsCache[piece.icon.getURL()] = TextureManager.getInstance().getErrorImage();
            }
          });
        }
        var bounds = pieceShape2D.getBounds2D(); 
        g2D.drawImageWithSize(image, bounds.getX(), bounds.getY(), bounds.getWidth(), bounds.getHeight());
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
    paintPieceOfFurnitureTop(g2D : Graphics2D, piece : HomePieceOfFurniture, pieceShape2D : java.awt.Shape, pieceBorderStroke : java.awt.BasicStroke, planScale : number, backgroundColor : string, foregroundColor : string, paintMode : PlanComponent.PaintMode) {
        if(this.furnitureTopViewIconKeys == null) {
            this.furnitureTopViewIconKeys = <any>({});
            this.furnitureTopViewIconsCache = <any>({});
        }
        
        let topViewIconKey : PlanComponent.HomePieceOfFurnitureTopViewIconKey = /* get */((m,k) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { return m.entries[i].value; } return null; })(<any>this.furnitureTopViewIconKeys, piece);
        let icon : PlanComponent.PieceOfFurnitureTopViewIcon;
        if(topViewIconKey == null) {
            topViewIconKey = new PlanComponent.HomePieceOfFurnitureTopViewIconKey(/* clone *//* clone */((o:any) => { if(o.clone!=undefined) { return (<any>o).clone(); } else { let clone = Object.create(o); for(let p in o) { if (o.hasOwnProperty(p)) clone[p] = o[p]; } return clone; } })(piece));
            icon = /* get */((m,k) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { return m.entries[i].value; } return null; })(<any>this.furnitureTopViewIconsCache, topViewIconKey);
            if(icon == null || icon.isWaitIcon() && paintMode !== PlanComponent.PaintMode.PAINT) {
                let waitingComponent : PlanComponent = paintMode === PlanComponent.PaintMode.PAINT?this:null;
                if(piece.getPlanIcon() != null) {
                    icon = new PlanComponent.PieceOfFurniturePlanIcon(piece, waitingComponent);
                } else {
                    icon = new PlanComponent.PieceOfFurnitureModelIcon(piece, this.object3dFactory, waitingComponent, this.preferences.getFurnitureModelIconSize());
                }
                /* put */((m,k,v) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { m.entries[i].value=v; return; } m.entries.push({key:k,value:v,getKey: function() { return this.key }, getValue: function() { return this.value }}); })(<any>this.furnitureTopViewIconsCache, topViewIconKey, icon);
            } else {
                {
                    let array189 = /* keySet */((m) => { let r=[]; if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) r.push(m.entries[i].key); return r; })(<any>this.furnitureTopViewIconsCache);
                    for(let index188=0; index188 < array189.length; index188++) {
                        let key = array189[index188];
                        {
                            if(key.equals(topViewIconKey)) {
                                topViewIconKey = key;
                                break;
                            }
                        }
                    }
                }
            }
            /* put */((m,k,v) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { m.entries[i].value=v; return; } m.entries.push({key:k,value:v,getKey: function() { return this.key }, getValue: function() { return this.value }}); })(<any>this.furnitureTopViewIconKeys, piece, topViewIconKey);
        } else {
            icon = /* get */((m,k) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { return m.entries[i].value; } return null; })(<any>this.furnitureTopViewIconsCache, topViewIconKey);
        }
        if(icon.isWaitIcon() || icon.isErrorIcon()) {
            this.paintPieceOfFurnitureIcon(g2D, piece, icon, pieceShape2D, planScale, backgroundColor);
            g2D.setPaint(foregroundColor);
            g2D.setStroke(pieceBorderStroke);
            g2D.draw(pieceShape2D);
        } else {
            let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
            let bounds : java.awt.geom.Rectangle2D = pieceShape2D.getBounds2D();
            g2D.translate(bounds.getCenterX(), bounds.getCenterY());
            g2D.rotate(piece.getAngle());
            let pieceDepth : number = piece.getDepthInPlan();
            if(piece.isModelMirrored()) {
                g2D.scale(-piece.getWidthInPlan() / icon.getIconWidth(), pieceDepth / icon.getIconHeight());
            } else {
                g2D.scale(piece.getWidthInPlan() / icon.getIconWidth(), pieceDepth / icon.getIconHeight());
            }
            icon.paintIcon(this, g2D, (-icon.getIconWidth() / 2|0), (-icon.getIconHeight() / 2|0));
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
    paintPieceOFFurnitureIndicators(g2D : Graphics2D, piece : any, indicatorPaint : string|CanvasPattern, planScale : number) {
        if(this.resizeIndicatorVisible) {
            g2D.setPaint(indicatorPaint);
            g2D.setStroke(PlanComponent.INDICATOR_STROKE);
            let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
            let piecePoints : number[][] = piece.getPoints();
            let scaleInverse : number = 1 / planScale * this.resolutionScale;
            let pieceAngle : number = piece.getAngle();
            let rotationIndicator : java.awt.Shape = this.getIndicator(piece, PlanComponent.IndicatorType.ROTATE);
            if(rotationIndicator != null) {
                g2D.translate(piecePoints[0][0], piecePoints[0][1]);
                g2D.scale(scaleInverse, scaleInverse);
                g2D.rotate(pieceAngle);
                g2D.draw(rotationIndicator);
                g2D.setTransform(previousTransform);
            }
            let elevationIndicator : java.awt.Shape = this.getIndicator(piece, PlanComponent.IndicatorType.ELEVATE);
            if(elevationIndicator != null) {
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
            if(piece.getPitch() !== 0 && this.isFurnitureSizeInPlanSupported()) {
                let pitchIndicator : java.awt.Shape = this.getIndicator(piece, PlanComponent.IndicatorType.ROTATE_PITCH);
                if(pitchIndicator != null) {
                    g2D.draw(pitchIndicator);
                }
            } else if(piece.getRoll() !== 0 && this.isFurnitureSizeInPlanSupported()) {
                let rollIndicator : java.awt.Shape = this.getIndicator(piece, PlanComponent.IndicatorType.ROTATE_ROLL);
                if(rollIndicator != null) {
                    g2D.draw(rollIndicator);
                }
            } else if(piece != null && piece instanceof <any>HomeLight) {
                let powerIndicator : java.awt.Shape = this.getIndicator(piece, PlanComponent.IndicatorType.CHANGE_POWER);
                if(powerIndicator != null) {
                    g2D.draw(PlanComponent.LIGHT_POWER_POINT_INDICATOR);
                    g2D.translate(-7.5, 7.5);
                    g2D.rotate(-pieceAngle);
                    g2D.draw(powerIndicator);
                }
            } else if(piece.isResizable() && !piece.isHorizontallyRotated()) {
                let heightIndicator : java.awt.Shape = this.getIndicator(piece, PlanComponent.IndicatorType.RESIZE_HEIGHT);
                if(heightIndicator != null) {
                    g2D.draw(PlanComponent.FURNITURE_HEIGHT_POINT_INDICATOR);
                    g2D.translate(-7.5, 7.5);
                    g2D.rotate(-pieceAngle);
                    g2D.draw(heightIndicator);
                }
            }
            g2D.setTransform(previousTransform);
            if(piece.isResizable()) {
                let resizeIndicator : java.awt.Shape = this.getIndicator(piece, PlanComponent.IndicatorType.RESIZE);
                if(resizeIndicator != null) {
                    g2D.translate(piecePoints[2][0], piecePoints[2][1]);
                    g2D.scale(scaleInverse, scaleInverse);
                    g2D.rotate(pieceAngle);
                    g2D.draw(resizeIndicator);
                    g2D.setTransform(previousTransform);
                }
            }
            if(piece.isNameVisible() && piece.getName().trim().length > 0) {
                let xName : number = piece.getX() + piece.getNameXOffset();
                let yName : number = piece.getY() + piece.getNameYOffset();
                this.paintTextIndicators(g2D, (<any>piece.constructor), this.getLineCount(piece.getName()), piece.getNameStyle(), xName, yName, piece.getNameAngle(), indicatorPaint, planScale);
            }
        }
    }

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
    paintPolylines(g2D : Graphics2D, polylines : Array<any>, selectedItems : Array<any>, selectionOutlinePaint : string|CanvasPattern, indicatorPaint : string|CanvasPattern, planScale : number, foregroundColor : string, paintMode : PlanComponent.PaintMode) {
        for(let index190=0; index190 < polylines.length; index190++) {
            let polyline = polylines[index190];
            {
                if(this.isViewableAtSelectedLevel(polyline)) {
                    let selected : boolean = /* contains */(selectedItems.indexOf(<any>(polyline)) >= 0);
                    if(paintMode !== PlanComponent.PaintMode.CLIPBOARD || selected) {
                        g2D.setPaint(<string>new String(polyline.getColor()));
                        let thickness : number = polyline.getThickness();
                        g2D.setStroke(ShapeTools.getStroke(thickness, polyline.getCapStyle(), polyline.getJoinStyle(), polyline.getDashPattern(), polyline.getDashOffset()));
                        let polylineShape : java.awt.Shape = ShapeTools.getPolylineShape(polyline.getPoints(), polyline.getJoinStyle() === Polyline.JoinStyle.CURVED, polyline.isClosedPath());
                        g2D.draw(polylineShape);
                        let firstPoint : number[] = null;
                        let secondPoint : number[] = null;
                        let beforeLastPoint : number[] = null;
                        let lastPoint : number[] = null;
                        for(let it : java.awt.geom.PathIterator = polylineShape.getPathIterator(null, 0.5); !it.isDone(); it.next()) {{
                            let pathPoint : number[] = [0, 0];
                            if(it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
                                if(firstPoint == null) {
                                    firstPoint = pathPoint;
                                } else if(secondPoint == null) {
                                    secondPoint = pathPoint;
                                }
                                beforeLastPoint = lastPoint;
                                lastPoint = pathPoint;
                            }
                        };}
                        let angleAtStart : number = <number>Math.atan2(firstPoint[1] - secondPoint[1], firstPoint[0] - secondPoint[0]);
                        let angleAtEnd : number = <number>Math.atan2(lastPoint[1] - beforeLastPoint[1], lastPoint[0] - beforeLastPoint[0]);
                        let arrowDelta : number = polyline.getCapStyle() !== Polyline.CapStyle.BUTT?thickness / 2:0;
                        this.paintArrow(g2D, firstPoint, angleAtStart, polyline.getStartArrowStyle(), thickness, arrowDelta);
                        this.paintArrow(g2D, lastPoint, angleAtEnd, polyline.getEndArrowStyle(), thickness, arrowDelta);
                        if(selected && paintMode === PlanComponent.PaintMode.PAINT) {
                            g2D.setPaint(selectionOutlinePaint);
                            g2D.setStroke(SwingTools.getStroke(thickness + 4 / planScale, polyline.getCapStyle(), polyline.getJoinStyle(), Polyline.DashStyle.SOLID));
                            g2D.draw(polylineShape);
                            if(/* size */(<number>selectedItems.length) === 1 && indicatorPaint != null) {
                                let selectedPolyline : any = /* get */selectedItems[0];
                                if(this.isViewableAtSelectedLevel(selectedPolyline)) {
                                    g2D.setPaint(indicatorPaint);
                                    this.paintPointsResizeIndicators(g2D, selectedPolyline, indicatorPaint, planScale, selectedPolyline.isClosedPath(), angleAtStart, angleAtEnd, false);
                                }
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
    paintArrow(g2D : Graphics2D, point : number[], angle : number, arrowStyle : Polyline.ArrowStyle, thickness : number, arrowDelta : number) {
        if(arrowStyle != null && arrowStyle !== Polyline.ArrowStyle.NONE) {
            let oldTransform : java.awt.geom.AffineTransform = g2D.getTransform();
            g2D.translate(point[0], point[1]);
            g2D.rotate(angle);
            g2D.translate(arrowDelta, 0);
            let scale : number = Math.pow(thickness, 0.66) * 2;
            g2D.scale(scale, scale);
            switch((arrowStyle)) {
            case Polyline.ArrowStyle.DISC:
                g2D.fill(new java.awt.geom.Ellipse2D.Float(-3.5, -2, 4, 4));
                break;
            case Polyline.ArrowStyle.OPEN:
                g2D.scale(0.9, 0.9);
                g2D.setStroke(new java.awt.BasicStroke(<number>(thickness / scale / 0.9), java.awt.BasicStroke.CAP_BUTT, java.awt.BasicStroke.JOIN_MITER));
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
     * @param {*[]} selectedItems
     * @param {string|CanvasPattern} selectionOutlinePaint
     * @param {string} selectionOutlineStroke
     * @param {string|CanvasPattern} indicatorPaint
     * @param {string} extensionLineStroke
     * @param {number} planScale
     * @param {string} backgroundColor
     * @param {string} foregroundColor
     * @param {PlanComponent.PaintMode} paintMode
     * @param {boolean} feedback
     * @private
     */
    paintDimensionLines(g2D : Graphics2D, dimensionLines : Array<any>, selectedItems : Array<any>, selectionOutlinePaint : string|CanvasPattern, selectionOutlineStroke : java.awt.Stroke, indicatorPaint : string|CanvasPattern, extensionLineStroke : java.awt.Stroke, planScale : number, backgroundColor : string, foregroundColor : string, paintMode : PlanComponent.PaintMode, feedback : boolean) {
        if(paintMode === PlanComponent.PaintMode.CLIPBOARD) {
            dimensionLines = Home.getDimensionLinesSubList(selectedItems);
        }
        g2D.setPaint(foregroundColor);
        let dimensionLineStroke : java.awt.BasicStroke = new java.awt.BasicStroke(this.getStrokeWidth(DimensionLine, paintMode) / planScale);
        let previousFont : string = g2D.getFont();
        for(let index191=0; index191 < dimensionLines.length; index191++) {
            let dimensionLine = dimensionLines[index191];
            {
                if(this.isViewableAtSelectedLevel(dimensionLine)) {
                    let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
                    let angle : number = Math.atan2(dimensionLine.getYEnd() - dimensionLine.getYStart(), dimensionLine.getXEnd() - dimensionLine.getXStart());
                    let dimensionLineLength : number = dimensionLine.getLength();
                    g2D.translate(dimensionLine.getXStart(), dimensionLine.getYStart());
                    g2D.rotate(angle);
                    g2D.translate(0, dimensionLine.getOffset());
                    if(paintMode === PlanComponent.PaintMode.PAINT && this.selectedItemsOutlinePainted && /* contains */(selectedItems.indexOf(<any>(dimensionLine)) >= 0)) {
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
                    let lengthText : string = this.preferences.getLengthUnit().getFormat().format(dimensionLineLength);
                    let lengthStyle : any = dimensionLine.getLengthStyle();
                    if(lengthStyle == null) {
                        lengthStyle = this.preferences.getDefaultTextStyle((<any>dimensionLine.constructor));
                    }
                    if(feedback && this.getFont() != null) {
                        lengthStyle = lengthStyle.deriveStyle(this.getFont().getSize() / this.getScale());
                    }
                    let font : string = this.getFont(previousFont, lengthStyle);
                    let lengthFontMetrics : FontMetrics = this.getFontMetrics(font, lengthStyle);
                    let lengthTextBounds : java.awt.geom.Rectangle2D = lengthFontMetrics.getStringBounds(lengthText, g2D);
                    let fontAscent : number = lengthFontMetrics.getAscent();
                    g2D.translate((dimensionLineLength - <number>lengthTextBounds.getWidth()) / 2, dimensionLine.getOffset() <= 0?-lengthFontMetrics.getDescent() - 1:fontAscent + 1);
                    if(feedback) {
                        g2D.setPaint(backgroundColor);
                        let oldComposite : java.awt.Composite = this.setTransparency(g2D, 0.7);
                        g2D.setStroke(new java.awt.BasicStroke(4 / planScale * this.resolutionScale, java.awt.BasicStroke.CAP_SQUARE, java.awt.BasicStroke.CAP_ROUND));
                        let fontRenderContext : java.awt.font.FontRenderContext = g2D.getFontRenderContext();
                        let textLayout : java.awt.font.TextLayout = new java.awt.font.TextLayout(lengthText, font, fontRenderContext);
                        g2D.draw(textLayout.getOutline(new java.awt.geom.AffineTransform()));
                        g2D.setComposite(oldComposite);
                        g2D.setPaint(foregroundColor);
                    }
                    g2D.setFont(font);
                    g2D.drawString(lengthText, 0, 0);
                    g2D.setTransform(previousTransform);
                }
            }
        }
        g2D.setFont(previousFont);
        if(/* size */(<number>selectedItems.length) === 1 && (/* get */selectedItems[0] != null && /* get */selectedItems[0] instanceof <any>DimensionLine) && paintMode === PlanComponent.PaintMode.PAINT && indicatorPaint != null) {
            this.paintDimensionLineResizeIndicator(g2D, /* get */selectedItems[0], indicatorPaint, planScale);
        }
    }

    /**
     * Paints resize indicator on a given dimension line.
     * @param {Graphics2D} g2D
     * @param {DimensionLine} dimensionLine
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @private
     */
    paintDimensionLineResizeIndicator(g2D : Graphics2D, dimensionLine : any, indicatorPaint : string|CanvasPattern, planScale : number) {
        if(this.resizeIndicatorVisible) {
            g2D.setPaint(indicatorPaint);
            g2D.setStroke(PlanComponent.INDICATOR_STROKE);
            let wallAngle : number = Math.atan2(dimensionLine.getYEnd() - dimensionLine.getYStart(), dimensionLine.getXEnd() - dimensionLine.getXStart());
            let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
            let scaleInverse : number = 1 / planScale * this.resolutionScale;
            g2D.translate(dimensionLine.getXStart(), dimensionLine.getYStart());
            g2D.rotate(wallAngle);
            g2D.translate(0, dimensionLine.getOffset());
            g2D.rotate(Math.PI);
            g2D.scale(scaleInverse, scaleInverse);
            let resizeIndicator : java.awt.Shape = this.getIndicator(dimensionLine, PlanComponent.IndicatorType.RESIZE);
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
            g2D.rotate(dimensionLine.getOffset() <= 0?Math.PI / 2:-Math.PI / 2);
            g2D.scale(scaleInverse, scaleInverse);
            g2D.draw(resizeIndicator);
            g2D.setTransform(previousTransform);
        }
    }

    /**
     * Paints home labels.
     * @param {Graphics2D} g2D
     * @param {Label[]} labels
     * @param {*[]} selectedItems
     * @param {string|CanvasPattern} selectionOutlinePaint
     * @param {string} selectionOutlineStroke
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @param {string} foregroundColor
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    paintLabels(g2D : Graphics2D, labels : Array<any>, selectedItems : Array<any>, selectionOutlinePaint : string|CanvasPattern, selectionOutlineStroke : java.awt.Stroke, indicatorPaint : string|CanvasPattern, planScale : number, foregroundColor : string, paintMode : PlanComponent.PaintMode) {
        let previousFont : string = g2D.getFont();
        for(let index192=0; index192 < labels.length; index192++) {
            let label = labels[index192];
            {
                if(this.isViewableAtSelectedLevel(label)) {
                    let selectedLabel : boolean = /* contains */(selectedItems.indexOf(<any>(label)) >= 0);
                    if(paintMode !== PlanComponent.PaintMode.CLIPBOARD || selectedLabel) {
                        let labelText : string = label.getText();
                        let xLabel : number = label.getX();
                        let yLabel : number = label.getY();
                        let labelAngle : number = label.getAngle();
                        let labelStyle : any = label.getStyle();
                        if(labelStyle == null) {
                            labelStyle = this.preferences.getDefaultTextStyle((<any>label.constructor));
                        }
                        if(labelStyle.getFontName() == null && this.getFont() != null) {
                            labelStyle = labelStyle.deriveStyle(this.getFont().getFontName());
                        }
                        let color : number = label.getColor();
                        g2D.setPaint(color != null?<string>new String(color):foregroundColor);
                        this.paintText(g2D, (<any>label.constructor), labelText, labelStyle, label.getOutlineColor(), xLabel, yLabel, labelAngle, previousFont);
                        if(paintMode === PlanComponent.PaintMode.PAINT && this.selectedItemsOutlinePainted && selectedLabel) {
                            g2D.setPaint(selectionOutlinePaint);
                            g2D.setStroke(selectionOutlineStroke);
                            let textBounds : number[][] = this.getTextBounds(labelText, labelStyle, xLabel, yLabel, labelAngle);
                            g2D.draw(ShapeTools.getShape(textBounds, true, null));
                            g2D.setPaint(foregroundColor);
                            if(indicatorPaint != null && /* size */(<number>selectedItems.length) === 1 && /* get */selectedItems[0] === label) {
                                this.paintTextIndicators(g2D, (<any>label.constructor), this.getLineCount(labelText), labelStyle, xLabel, yLabel, labelAngle, indicatorPaint, planScale);
                                if(this.resizeIndicatorVisible && label.getPitch() != null) {
                                    let elevationIndicator : java.awt.Shape = this.getIndicator(label, PlanComponent.IndicatorType.ELEVATE);
                                    if(elevationIndicator != null) {
                                        let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
                                        if(labelStyle.getAlignment() === TextStyle.Alignment.LEFT) {
                                            g2D.translate(textBounds[3][0], textBounds[3][1]);
                                        } else if(labelStyle.getAlignment() === TextStyle.Alignment.RIGHT) {
                                            g2D.translate(textBounds[2][0], textBounds[2][1]);
                                        } else {
                                            g2D.translate((textBounds[2][0] + textBounds[3][0]) / 2, (textBounds[2][1] + textBounds[3][1]) / 2);
                                        }
                                        let scaleInverse : number = 1 / planScale * this.resolutionScale;
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
    }

    /**
     * Paints the compass.
     * @param {Graphics2D} g2D
     * @param {*[]} selectedItems
     * @param {number} planScale
     * @param {string} foregroundColor
     * @param {PlanComponent.PaintMode} paintMode
     * @private
     */
    paintCompass(g2D : Graphics2D, selectedItems : Array<any>, planScale : number, foregroundColor : string, paintMode : PlanComponent.PaintMode) {
        let compass : any = this.home.getCompass();
        if(compass.isVisible() && (paintMode !== PlanComponent.PaintMode.CLIPBOARD || /* contains */(selectedItems.indexOf(<any>(compass)) >= 0))) {
            let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
            g2D.translate(compass.getX(), compass.getY());
            g2D.rotate(compass.getNorthDirection());
            let diameter : number = compass.getDiameter();
            g2D.scale(diameter, diameter);
            g2D.setColor(foregroundColor);
            //g2D.fill(PlanComponent.COMPASS);
            g2D.setTransform(previousTransform);
        }
    }

    /**
     * Paints the outline of the compass when it's belongs to <code>items</code>.
     * @param {Graphics2D} g2D
     * @param {*[]} items
     * @param {string|CanvasPattern} selectionOutlinePaint
     * @param {string} selectionOutlineStroke
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @param {string} foregroundColor
     * @private
     */
    paintCompassOutline(g2D : Graphics2D, items : Array<any>, selectionOutlinePaint : string|CanvasPattern, selectionOutlineStroke : java.awt.Stroke, indicatorPaint : string|CanvasPattern, planScale : number, foregroundColor : string) {
        let compass : any = this.home.getCompass();
        if(/* contains */(items.indexOf(<any>(compass)) >= 0) && compass.isVisible()) {
            let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
            g2D.translate(compass.getX(), compass.getY());
            g2D.rotate(compass.getNorthDirection());
            let diameter : number = compass.getDiameter();
            g2D.scale(diameter, diameter);
            g2D.setPaint(selectionOutlinePaint);
            g2D.setStroke(new java.awt.BasicStroke((5.5 + planScale) / diameter / planScale * this.resolutionScale));
            g2D.draw(PlanComponent.COMPASS_DISC);
            g2D.setColor(foregroundColor);
            g2D.setStroke(new java.awt.BasicStroke(1.0 / diameter / planScale * this.resolutionScale));
            g2D.draw(PlanComponent.COMPASS_DISC);
            g2D.setTransform(previousTransform);
            if(/* size */(<number>items.length) === 1 && /* get */items[0] === compass) {
                g2D.setPaint(indicatorPaint);
                this.paintCompassIndicators(g2D, compass, indicatorPaint, planScale);
            }
        }
    }

    paintCompassIndicators(g2D : Graphics2D, compass : any, indicatorPaint : string|CanvasPattern, planScale : number) {
        if(this.resizeIndicatorVisible) {
            g2D.setPaint(indicatorPaint);
            g2D.setStroke(PlanComponent.INDICATOR_STROKE);
            let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
            let compassPoints : number[][] = compass.getPoints();
            let scaleInverse : number = 1 / planScale * this.resolutionScale;
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
    }

    /**
     * Paints wall location feedback.
     * @param {Graphics2D} g2D
     * @param {Wall} alignedWall
     * @param {java.awt.geom.Point2D} locationFeedback
     * @param {boolean} showPointFeedback
     * @param {string|CanvasPattern} feedbackPaint
     * @param {string} feedbackStroke
     * @param {number} planScale
     * @param {string|CanvasPattern} pointPaint
     * @param {string} pointStroke
     * @private
     */
    paintWallAlignmentFeedback(g2D : Graphics2D, alignedWall : any, locationFeedback : java.awt.geom.Point2D, showPointFeedback : boolean, feedbackPaint : string|CanvasPattern, feedbackStroke : java.awt.Stroke, planScale : number, pointPaint : string|CanvasPattern, pointStroke : java.awt.Stroke) {
        if(locationFeedback != null) {
            let margin : number = 0.5 / planScale;
            let x : number = <number>locationFeedback.getX();
            let y : number = <number>locationFeedback.getY();
            let deltaXToClosestWall : number = Infinity;
            let deltaYToClosestWall : number = Infinity;
            {
                let array194 = this.getViewedItems<any>(this.home.getWalls(), this.otherLevelsWallsCache);
                for(let index193=0; index193 < array194.length; index193++) {
                    let wall = array194[index193];
                    {
                        if(wall !== alignedWall) {
                            if(Math.abs(x - wall.getXStart()) < margin && (alignedWall == null || !this.equalsWallPoint(wall.getXStart(), wall.getYStart(), alignedWall))) {
                                if(Math.abs(deltaYToClosestWall) > Math.abs(y - wall.getYStart())) {
                                    deltaYToClosestWall = y - wall.getYStart();
                                }
                            } else if(Math.abs(x - wall.getXEnd()) < margin && (alignedWall == null || !this.equalsWallPoint(wall.getXEnd(), wall.getYEnd(), alignedWall))) {
                                if(Math.abs(deltaYToClosestWall) > Math.abs(y - wall.getYEnd())) {
                                    deltaYToClosestWall = y - wall.getYEnd();
                                }
                            }
                            if(Math.abs(y - wall.getYStart()) < margin && (alignedWall == null || !this.equalsWallPoint(wall.getXStart(), wall.getYStart(), alignedWall))) {
                                if(Math.abs(deltaXToClosestWall) > Math.abs(x - wall.getXStart())) {
                                    deltaXToClosestWall = x - wall.getXStart();
                                }
                            } else if(Math.abs(y - wall.getYEnd()) < margin && (alignedWall == null || !this.equalsWallPoint(wall.getXEnd(), wall.getYEnd(), alignedWall))) {
                                if(Math.abs(deltaXToClosestWall) > Math.abs(x - wall.getXEnd())) {
                                    deltaXToClosestWall = x - wall.getXEnd();
                                }
                            }
                            let wallPoints : number[][] = wall.getPoints();
                            wallPoints = [wallPoints[0], wallPoints[(wallPoints.length / 2|0) - 1], wallPoints[(wallPoints.length / 2|0)], wallPoints[wallPoints.length - 1]];
                            for(let i : number = 0; i < wallPoints.length; i++) {{
                                if(Math.abs(x - wallPoints[i][0]) < margin && (alignedWall == null || !this.equalsWallPoint(wallPoints[i][0], wallPoints[i][1], alignedWall))) {
                                    if(Math.abs(deltaYToClosestWall) > Math.abs(y - wallPoints[i][1])) {
                                        deltaYToClosestWall = y - wallPoints[i][1];
                                    }
                                }
                                if(Math.abs(y - wallPoints[i][1]) < margin && (alignedWall == null || !this.equalsWallPoint(wallPoints[i][0], wallPoints[i][1], alignedWall))) {
                                    if(Math.abs(deltaXToClosestWall) > Math.abs(x - wallPoints[i][0])) {
                                        deltaXToClosestWall = x - wallPoints[i][0];
                                    }
                                }
                            };}
                        }
                    }
                }
            }
            g2D.setPaint(feedbackPaint);
            g2D.setStroke(feedbackStroke);
            if(deltaXToClosestWall !== Infinity) {
                if(deltaXToClosestWall > 0) {
                    g2D.draw(new java.awt.geom.Line2D.Float(x + 25 / planScale, y, x - deltaXToClosestWall - 25 / planScale, y));
                } else {
                    g2D.draw(new java.awt.geom.Line2D.Float(x - 25 / planScale, y, x - deltaXToClosestWall + 25 / planScale, y));
                }
            }
            if(deltaYToClosestWall !== Infinity) {
                if(deltaYToClosestWall > 0) {
                    g2D.draw(new java.awt.geom.Line2D.Float(x, y + 25 / planScale, x, y - deltaYToClosestWall - 25 / planScale));
                } else {
                    g2D.draw(new java.awt.geom.Line2D.Float(x, y - 25 / planScale, x, y - deltaYToClosestWall + 25 / planScale));
                }
            }
            if(showPointFeedback) {
                this.paintPointFeedback(g2D, locationFeedback, feedbackPaint, planScale, pointPaint, pointStroke);
            }
        }
    }

    /**
     * Returns the items viewed in the plan at the selected level.
     * @param {*[]} homeItems
     * @param {*[]} otherLevelItems
     * @return {*[]}
     * @private
     */
    getViewedItems<T extends any>(homeItems : Array<T>, otherLevelItems : Array<T>) : Array<T> {
        let viewedWalls : Array<T> = <any>([]);
        if(otherLevelItems != null) {
            /* addAll */((l1, l2) => l1.push.apply(l1, l2))(viewedWalls, otherLevelItems);
        }
        for(let index195=0; index195 < homeItems.length; index195++) {
            let wall = homeItems[index195];
            {
                if(this.isViewableAtSelectedLevel(wall)) {
                    /* add */(viewedWalls.push(wall)>0);
                }
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
     * @param {string} pointStroke
     * @private
     */
    paintPointFeedback(g2D : Graphics2D, locationFeedback : java.awt.geom.Point2D, feedbackPaint : string|CanvasPattern, planScale : number, pointPaint : string|CanvasPattern, pointStroke : java.awt.Stroke) {
        g2D.setPaint(pointPaint);
        g2D.setStroke(pointStroke);
        let circle : java.awt.geom.Ellipse2D.Float = new java.awt.geom.Ellipse2D.Float(<number>locationFeedback.getX() - 10.0 / planScale, <number>locationFeedback.getY() - 10.0 / planScale, 20.0 / planScale, 20.0 / planScale);
        g2D.fill(circle);
        g2D.setPaint(feedbackPaint);
        g2D.setStroke(new java.awt.BasicStroke(1 / planScale * this.resolutionScale));
        g2D.draw(circle);
        g2D.draw(new java.awt.geom.Line2D.Float(<number>locationFeedback.getX(), <number>locationFeedback.getY() - 5.0 / planScale, <number>locationFeedback.getX(), <number>locationFeedback.getY() + 5.0 / planScale));
        g2D.draw(new java.awt.geom.Line2D.Float(<number>locationFeedback.getX() - 5.0 / planScale, <number>locationFeedback.getY(), <number>locationFeedback.getX() + 5.0 / planScale, <number>locationFeedback.getY()));
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
    equalsWallPoint(x : number, y : number, wall : any) : boolean {
        return x === wall.getXStart() && y === wall.getYStart() || x === wall.getXEnd() && y === wall.getYEnd();
    }

    /**
     * Paints room location feedback.
     * @param {Graphics2D} g2D
     * @param {Room} alignedRoom
     * @param {java.awt.geom.Point2D} locationFeedback
     * @param {boolean} showPointFeedback
     * @param {string|CanvasPattern} feedbackPaint
     * @param {string} feedbackStroke
     * @param {number} planScale
     * @param {string|CanvasPattern} pointPaint
     * @param {string} pointStroke
     * @private
     */
    paintRoomAlignmentFeedback(g2D : Graphics2D, alignedRoom : any, locationFeedback : java.awt.geom.Point2D, showPointFeedback : boolean, feedbackPaint : string|CanvasPattern, feedbackStroke : java.awt.Stroke, planScale : number, pointPaint : string|CanvasPattern, pointStroke : java.awt.Stroke) {
        if(locationFeedback != null) {
            let margin : number = 0.5 / planScale;
            let x : number = <number>locationFeedback.getX();
            let y : number = <number>locationFeedback.getY();
            let deltaXToClosestObject : number = Infinity;
            let deltaYToClosestObject : number = Infinity;
            {
                let array197 = this.getViewedItems<any>(this.home.getRooms(), this.otherLevelsRoomsCache);
                for(let index196=0; index196 < array197.length; index196++) {
                    let room = array197[index196];
                    {
                        let roomPoints : number[][] = room.getPoints();
                        let editedPointIndex : number = -1;
                        if(room === alignedRoom) {
                            for(let i : number = 0; i < roomPoints.length; i++) {{
                                if(roomPoints[i][0] === x && roomPoints[i][1] === y) {
                                    editedPointIndex = i;
                                    break;
                                }
                            };}
                        }
                        for(let i : number = 0; i < roomPoints.length; i++) {{
                            if(editedPointIndex === -1 || (i !== editedPointIndex && roomPoints.length > 2)) {
                                if(Math.abs(x - roomPoints[i][0]) < margin && Math.abs(deltaYToClosestObject) > Math.abs(y - roomPoints[i][1])) {
                                    deltaYToClosestObject = y - roomPoints[i][1];
                                }
                                if(Math.abs(y - roomPoints[i][1]) < margin && Math.abs(deltaXToClosestObject) > Math.abs(x - roomPoints[i][0])) {
                                    deltaXToClosestObject = x - roomPoints[i][0];
                                }
                            }
                        };}
                    }
                }
            }
            {
                let array199 = this.getViewedItems<any>(this.home.getWalls(), this.otherLevelsWallsCache);
                for(let index198=0; index198 < array199.length; index198++) {
                    let wall = array199[index198];
                    {
                        let wallPoints : number[][] = wall.getPoints();
                        wallPoints = [wallPoints[0], wallPoints[(wallPoints.length / 2|0) - 1], wallPoints[(wallPoints.length / 2|0)], wallPoints[wallPoints.length - 1]];
                        for(let i : number = 0; i < wallPoints.length; i++) {{
                            if(Math.abs(x - wallPoints[i][0]) < margin && Math.abs(deltaYToClosestObject) > Math.abs(y - wallPoints[i][1])) {
                                deltaYToClosestObject = y - wallPoints[i][1];
                            }
                            if(Math.abs(y - wallPoints[i][1]) < margin && Math.abs(deltaXToClosestObject) > Math.abs(x - wallPoints[i][0])) {
                                deltaXToClosestObject = x - wallPoints[i][0];
                            }
                        };}
                    }
                }
            }
            g2D.setPaint(feedbackPaint);
            g2D.setStroke(feedbackStroke);
            if(deltaXToClosestObject !== Infinity) {
                if(deltaXToClosestObject > 0) {
                    g2D.draw(new java.awt.geom.Line2D.Float(x + 25 / planScale, y, x - deltaXToClosestObject - 25 / planScale, y));
                } else {
                    g2D.draw(new java.awt.geom.Line2D.Float(x - 25 / planScale, y, x - deltaXToClosestObject + 25 / planScale, y));
                }
            }
            if(deltaYToClosestObject !== Infinity) {
                if(deltaYToClosestObject > 0) {
                    g2D.draw(new java.awt.geom.Line2D.Float(x, y + 25 / planScale, x, y - deltaYToClosestObject - 25 / planScale));
                } else {
                    g2D.draw(new java.awt.geom.Line2D.Float(x, y - 25 / planScale, x, y - deltaYToClosestObject + 25 / planScale));
                }
            }
            if(showPointFeedback) {
                this.paintPointFeedback(g2D, locationFeedback, feedbackPaint, planScale, pointPaint, pointStroke);
            }
        }
    }

    /**
     * Paints dimension line location feedback.
     * @param {Graphics2D} g2D
     * @param {DimensionLine} alignedDimensionLine
     * @param {java.awt.geom.Point2D} locationFeedback
     * @param {boolean} showPointFeedback
     * @param {string|CanvasPattern} feedbackPaint
     * @param {string} feedbackStroke
     * @param {number} planScale
     * @param {string|CanvasPattern} pointPaint
     * @param {string} pointStroke
     * @private
     */
    paintDimensionLineAlignmentFeedback(g2D : Graphics2D, alignedDimensionLine : any, locationFeedback : java.awt.geom.Point2D, showPointFeedback : boolean, feedbackPaint : string|CanvasPattern, feedbackStroke : java.awt.Stroke, planScale : number, pointPaint : string|CanvasPattern, pointStroke : java.awt.Stroke) {
        if(locationFeedback != null) {
            let margin : number = 0.5 / planScale;
            let x : number = <number>locationFeedback.getX();
            let y : number = <number>locationFeedback.getY();
            let deltaXToClosestObject : number = Infinity;
            let deltaYToClosestObject : number = Infinity;
            {
                let array201 = this.getViewedItems<any>(this.home.getRooms(), this.otherLevelsRoomsCache);
                for(let index200=0; index200 < array201.length; index200++) {
                    let room = array201[index200];
                    {
                        let roomPoints : number[][] = room.getPoints();
                        for(let i : number = 0; i < roomPoints.length; i++) {{
                            if(Math.abs(x - roomPoints[i][0]) < margin && Math.abs(deltaYToClosestObject) > Math.abs(y - roomPoints[i][1])) {
                                deltaYToClosestObject = y - roomPoints[i][1];
                            }
                            if(Math.abs(y - roomPoints[i][1]) < margin && Math.abs(deltaXToClosestObject) > Math.abs(x - roomPoints[i][0])) {
                                deltaXToClosestObject = x - roomPoints[i][0];
                            }
                        };}
                    }
                }
            }
            {
                let array203 = this.home.getDimensionLines();
                for(let index202=0; index202 < array203.length; index202++) {
                    let dimensionLine = array203[index202];
                    {
                        if(this.isViewableAtSelectedLevel(dimensionLine) && dimensionLine !== alignedDimensionLine) {
                            if(Math.abs(x - dimensionLine.getXStart()) < margin && (alignedDimensionLine == null || !this.equalsDimensionLinePoint(dimensionLine.getXStart(), dimensionLine.getYStart(), alignedDimensionLine))) {
                                if(Math.abs(deltaYToClosestObject) > Math.abs(y - dimensionLine.getYStart())) {
                                    deltaYToClosestObject = y - dimensionLine.getYStart();
                                }
                            } else if(Math.abs(x - dimensionLine.getXEnd()) < margin && (alignedDimensionLine == null || !this.equalsDimensionLinePoint(dimensionLine.getXEnd(), dimensionLine.getYEnd(), alignedDimensionLine))) {
                                if(Math.abs(deltaYToClosestObject) > Math.abs(y - dimensionLine.getYEnd())) {
                                    deltaYToClosestObject = y - dimensionLine.getYEnd();
                                }
                            }
                            if(Math.abs(y - dimensionLine.getYStart()) < margin && (alignedDimensionLine == null || !this.equalsDimensionLinePoint(dimensionLine.getXStart(), dimensionLine.getYStart(), alignedDimensionLine))) {
                                if(Math.abs(deltaXToClosestObject) > Math.abs(x - dimensionLine.getXStart())) {
                                    deltaXToClosestObject = x - dimensionLine.getXStart();
                                }
                            } else if(Math.abs(y - dimensionLine.getYEnd()) < margin && (alignedDimensionLine == null || !this.equalsDimensionLinePoint(dimensionLine.getXEnd(), dimensionLine.getYEnd(), alignedDimensionLine))) {
                                if(Math.abs(deltaXToClosestObject) > Math.abs(x - dimensionLine.getXEnd())) {
                                    deltaXToClosestObject = x - dimensionLine.getXEnd();
                                }
                            }
                        }
                    }
                }
            }
            {
                let array205 = this.getViewedItems<any>(this.home.getWalls(), this.otherLevelsWallsCache);
                for(let index204=0; index204 < array205.length; index204++) {
                    let wall = array205[index204];
                    {
                        let wallPoints : number[][] = wall.getPoints();
                        wallPoints = [wallPoints[0], wallPoints[(wallPoints.length / 2|0) - 1], wallPoints[(wallPoints.length / 2|0)], wallPoints[wallPoints.length - 1]];
                        for(let i : number = 0; i < wallPoints.length; i++) {{
                            if(Math.abs(x - wallPoints[i][0]) < margin && Math.abs(deltaYToClosestObject) > Math.abs(y - wallPoints[i][1])) {
                                deltaYToClosestObject = y - wallPoints[i][1];
                            }
                            if(Math.abs(y - wallPoints[i][1]) < margin && Math.abs(deltaXToClosestObject) > Math.abs(x - wallPoints[i][0])) {
                                deltaXToClosestObject = x - wallPoints[i][0];
                            }
                        };}
                    }
                }
            }
            {
                let array207 = this.home.getFurniture();
                for(let index206=0; index206 < array207.length; index206++) {
                    let piece = array207[index206];
                    {
                        if(piece.isVisible() && this.isViewableAtSelectedLevel(piece)) {
                            let piecePoints : number[][] = piece.getPoints();
                            for(let i : number = 0; i < piecePoints.length; i++) {{
                                if(Math.abs(x - piecePoints[i][0]) < margin && Math.abs(deltaYToClosestObject) > Math.abs(y - piecePoints[i][1])) {
                                    deltaYToClosestObject = y - piecePoints[i][1];
                                }
                                if(Math.abs(y - piecePoints[i][1]) < margin && Math.abs(deltaXToClosestObject) > Math.abs(x - piecePoints[i][0])) {
                                    deltaXToClosestObject = x - piecePoints[i][0];
                                }
                            };}
                        }
                    }
                }
            }
            g2D.setPaint(feedbackPaint);
            g2D.setStroke(feedbackStroke);
            if(deltaXToClosestObject !== Infinity) {
                if(deltaXToClosestObject > 0) {
                    g2D.draw(new java.awt.geom.Line2D.Float(x + 25 / planScale, y, x - deltaXToClosestObject - 25 / planScale, y));
                } else {
                    g2D.draw(new java.awt.geom.Line2D.Float(x - 25 / planScale, y, x - deltaXToClosestObject + 25 / planScale, y));
                }
            }
            if(deltaYToClosestObject !== Infinity) {
                if(deltaYToClosestObject > 0) {
                    g2D.draw(new java.awt.geom.Line2D.Float(x, y + 25 / planScale, x, y - deltaYToClosestObject - 25 / planScale));
                } else {
                    g2D.draw(new java.awt.geom.Line2D.Float(x, y - 25 / planScale, x, y - deltaYToClosestObject + 25 / planScale));
                }
            }
            if(showPointFeedback) {
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
    equalsDimensionLinePoint(x : number, y : number, dimensionLine : any) : boolean {
        return x === dimensionLine.getXStart() && y === dimensionLine.getYStart() || x === dimensionLine.getXEnd() && y === dimensionLine.getYEnd();
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
    paintAngleFeedback(g2D : Graphics2D, center : java.awt.geom.Point2D, point1 : java.awt.geom.Point2D, point2 : java.awt.geom.Point2D, planScale : number, selectionColor : string) {
        g2D.setColor(selectionColor);
        g2D.setStroke(new java.awt.BasicStroke(1 / planScale * this.resolutionScale));
        let angle1 : number = Math.atan2(center.getY() - point1.getY(), point1.getX() - center.getX());
        if(angle1 < 0) {
            angle1 = 2 * Math.PI + angle1;
        }
        let angle2 : number = Math.atan2(center.getY() - point2.getY(), point2.getX() - center.getX());
        if(angle2 < 0) {
            angle2 = 2 * Math.PI + angle2;
        }
        let extent : number = angle2 - angle1;
        if(angle1 > angle2) {
            extent = 2 * Math.PI + extent;
        }
        let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
        g2D.translate(center.getX(), center.getY());
        let radius : number = 20 / planScale;
        g2D.draw(new java.awt.geom.Arc2D.Double(-radius, -radius, radius * 2, radius * 2, /* toDegrees */(x => x * 180 / Math.PI)(angle1), /* toDegrees */(x => x * 180 / Math.PI)(extent), java.awt.geom.Arc2D.OPEN));
        radius += 5 / planScale;
        g2D.draw(new java.awt.geom.Line2D.Double(0, 0, radius * Math.cos(angle1), -radius * Math.sin(angle1)));
        g2D.draw(new java.awt.geom.Line2D.Double(0, 0, radius * Math.cos(angle1 + extent), -radius * Math.sin(angle1 + extent)));
        g2D.setTransform(previousTransform);
    }

    /**
     * Paints the observer camera at its current location, if home camera is the observer camera.
     * @param {Graphics2D} g2D
     * @param {*[]} selectedItems
     * @param {string|CanvasPattern} selectionOutlinePaint
     * @param {string} selectionOutlineStroke
     * @param {string|CanvasPattern} indicatorPaint
     * @param {number} planScale
     * @param {string} backgroundColor
     * @param {string} foregroundColor
     * @private
     */
    paintCamera(g2D : Graphics2D, selectedItems : Array<any>, selectionOutlinePaint : string|CanvasPattern, selectionOutlineStroke : java.awt.Stroke, indicatorPaint : string|CanvasPattern, planScale : number, backgroundColor : string, foregroundColor : string) {
        let camera : any = this.home.getObserverCamera();
        if(camera === this.home.getCamera()) {
            let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
            g2D.translate(camera.getX(), camera.getY());
            g2D.rotate(camera.getYaw());
            let points : number[][] = camera.getPoints();
            let yScale : number = java.awt.geom.Point2D.distance(points[0][0], points[0][1], points[3][0], points[3][1]);
            let xScale : number = java.awt.geom.Point2D.distance(points[0][0], points[0][1], points[1][0], points[1][1]);
            let cameraTransform : java.awt.geom.AffineTransform = java.awt.geom.AffineTransform.getScaleInstance(xScale, yScale);
            let scaledCameraBody : java.awt.Shape = new java.awt.geom.Area(PlanComponent.CAMERA_BODY).createTransformedArea(cameraTransform);
            let scaledCameraHead : java.awt.Shape = new java.awt.geom.Area(PlanComponent.CAMERA_HEAD).createTransformedArea(cameraTransform);
            g2D.setPaint(backgroundColor);
            g2D.fill(scaledCameraBody);
            g2D.setPaint(foregroundColor);
            let stroke : java.awt.BasicStroke = new java.awt.BasicStroke(this.getStrokeWidth(ObserverCamera, PlanComponent.PaintMode.PAINT) / planScale);
            g2D.setStroke(stroke);
            g2D.draw(scaledCameraBody);
            if(/* contains */(selectedItems.indexOf(<any>(camera)) >= 0) && this.selectedItemsOutlinePainted) {
                g2D.setPaint(selectionOutlinePaint);
                g2D.setStroke(selectionOutlineStroke);
                let cameraOutline : java.awt.geom.Area = new java.awt.geom.Area(scaledCameraBody);
                cameraOutline.add(new java.awt.geom.Area(scaledCameraHead));
                g2D.draw(cameraOutline);
            }
            g2D.setPaint(backgroundColor);
            g2D.fill(scaledCameraHead);
            g2D.setPaint(foregroundColor);
            g2D.setStroke(stroke);
            g2D.draw(scaledCameraHead);
            let sin : number = <number>Math.sin(camera.getFieldOfView() / 2);
            let cos : number = <number>Math.cos(camera.getFieldOfView() / 2);
            let xStartAngle : number = <number>(0.9 * yScale * sin);
            let yStartAngle : number = <number>(0.9 * yScale * cos);
            let xEndAngle : number = <number>(2.2 * yScale * sin);
            let yEndAngle : number = <number>(2.2 * yScale * cos);
            let cameraFieldOfViewAngle : java.awt.geom.GeneralPath = new java.awt.geom.GeneralPath();
            cameraFieldOfViewAngle.moveTo(xStartAngle, yStartAngle);
            cameraFieldOfViewAngle.lineTo(xEndAngle, yEndAngle);
            cameraFieldOfViewAngle.moveTo(-xStartAngle, yStartAngle);
            cameraFieldOfViewAngle.lineTo(-xEndAngle, yEndAngle);
            g2D.draw(cameraFieldOfViewAngle);
            g2D.setTransform(previousTransform);
            if(/* size */(<number>selectedItems.length) === 1 && /* get */selectedItems[0] === camera) {
                this.paintCameraRotationIndicators(g2D, camera, indicatorPaint, planScale);
            }
        }
    }

    paintCameraRotationIndicators(g2D : Graphics2D, camera : any, indicatorPaint : string|CanvasPattern, planScale : number) {
        if(this.resizeIndicatorVisible) {
            g2D.setPaint(indicatorPaint);
            g2D.setStroke(PlanComponent.INDICATOR_STROKE);
            let previousTransform : java.awt.geom.AffineTransform = g2D.getTransform();
            let cameraPoints : number[][] = camera.getPoints();
            let scaleInverse : number = 1 / planScale * this.resolutionScale;
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
            let elevationIndicator : java.awt.Shape = this.getIndicator(camera, PlanComponent.IndicatorType.ELEVATE);
            if(elevationIndicator != null) {
                g2D.translate((cameraPoints[0][0] + cameraPoints[1][0]) / 2, (cameraPoints[0][1] + cameraPoints[1][1]) / 2);
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
    paintRectangleFeedback(g2D : Graphics2D, selectionColor : string, planScale : number) {
        if(this.rectangleFeedback != null) {
            g2D.setPaint(selectionColor+"20"); // add alpha
            g2D.fill(this.rectangleFeedback);
            g2D.setPaint(selectionColor);
            g2D.setStroke(new java.awt.BasicStroke(1 / planScale * this.resolutionScale));
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
    public setRectangleFeedback(x0 : number, y0 : number, x1 : number, y1 : number) {
        this.rectangleFeedback = new java.awt.geom.Rectangle2D.Float(x0, y0, 0, 0);
        this.rectangleFeedback.add(x1, y1);
        this.repaint();
    }

    /**
     * Ensures selected items are visible at screen and moves
     * scroll bars if needed.
     */
    public makeSelectionVisible() {
        if(!this.selectionScrollUpdated) {
            this.selectionScrollUpdated = true;
            java.awt.EventQueue.invokeLater(() => {
                this.selectionScrollUpdated = false;
                let selectionBounds : java.awt.geom.Rectangle2D = this.getSelectionBounds(true);
                if(selectionBounds != null) {
                    let pixelBounds : java.awt.Rectangle = this.getShapePixelBounds(selectionBounds);
                    pixelBounds.grow(5, 5);
                    let visibleRectangle : java.awt.Rectangle = this.getVisibleRect();
                    if(!pixelBounds.intersects(visibleRectangle)) {
                        this.scrollRectToVisible(pixelBounds);
                    }
                }
            });
        }
    }

    /**
     * Returns the bounds of the selected items.
     * @param {boolean} includeCamera
     * @return {java.awt.geom.Rectangle2D}
     * @private
     */
    getSelectionBounds(includeCamera : boolean) : java.awt.geom.Rectangle2D {
        let g : Graphics2D = <Graphics2D>this.getGraphics();
        if(g != null) {
            this.setRenderingHints(g);
        }
        if(includeCamera) {
            return this.getItemsBounds(g, this.home.getSelectedItems());
        } else {
            let selectedItems : Array<any> = <any>(this.home.getSelectedItems().slice(0));
            /* remove */(a => { let index = a.indexOf(this.home.getCamera()); if(index>=0) { a.splice(index, 1); return true; } else { return false; }})(selectedItems);
            return this.getItemsBounds(g, selectedItems);
        }
    }

    /**
     * Ensures the point at (<code>x</code>, <code>y</code>) is visible,
     * moving scroll bars if needed.
     * @param {number} x
     * @param {number} y
     */
    public makePointVisible(x : number, y : number) {
        this.scrollRectToVisible(this.getShapePixelBounds(new java.awt.geom.Rectangle2D.Float(x, y, 1 / this.getScale(), 1 / this.getScale())));
    }

    /**
     * Moves the view from (dx, dy) unit in the scrolling zone it belongs to.
     * @param {number} dx
     * @param {number} dy
     */
    public moveView(dx : number, dy : number) {
        if(this.getParent() != null && this.getParent() instanceof <any>javax.swing.JViewport) {
            let viewport : javax.swing.JViewport = <javax.swing.JViewport>this.getParent();
            let viewRectangle : java.awt.Rectangle = viewport.getViewRect();
            viewRectangle.translate(Math.round(dx * this.getScale()), Math.round(dy * this.getScale()));
            viewRectangle.x = Math.min(Math.max(0, viewRectangle.x), this.getWidth() - viewRectangle.width);
            viewRectangle.y = Math.min(Math.max(0, viewRectangle.y), this.getHeight() - viewRectangle.height);
            viewport.setViewPosition(viewRectangle.getLocation());
        }
    }

    /**
     * Returns the scale used to display the plan.
     * @return {number}
     */
    public getScale() : number {
        return this.scale;
    }

    /**
     * Sets the scale used to display the plan.
     * If this component is displayed in a viewport the view position is updated
     * to ensure the center's view will remain the same after the scale change.
     * @param {number} scale
     */
    public setScale(scale : number) {
        if(this.scale !== scale) {
            let parent : javax.swing.JViewport = null;
            let viewRectangle : java.awt.Rectangle = null;
            let xViewCenterPosition : number = 0;
            let yViewCenterPosition : number = 0;
            if(this.getParent() != null && this.getParent() instanceof <any>javax.swing.JViewport) {
                parent = <javax.swing.JViewport>this.getParent();
                viewRectangle = parent.getViewRect();
                xViewCenterPosition = this.convertXPixelToModel(viewRectangle.x + (viewRectangle.width / 2|0));
                yViewCenterPosition = this.convertYPixelToModel(viewRectangle.y + (viewRectangle.height / 2|0));
            }
            this.scale = scale;
            this.revalidate();
            if(parent != null && parent instanceof <any>javax.swing.JViewport) {
                let viewSize : java.awt.Dimension = parent.getViewSize();
                let viewWidth : number = this.convertXPixelToModel(viewRectangle.x + viewRectangle.width) - this.convertXPixelToModel(viewRectangle.x);
                let xViewLocation : number = Math.max(0, Math.min(this.convertXModelToPixel(xViewCenterPosition - viewWidth / 2), viewSize.width - viewRectangle.x));
                let viewHeight : number = this.convertYPixelToModel(viewRectangle.y + viewRectangle.height) - this.convertYPixelToModel(viewRectangle.y);
                let yViewLocation : number = Math.max(0, Math.min(this.convertYModelToPixel(yViewCenterPosition - viewHeight / 2), viewSize.height - viewRectangle.y));
                parent.setViewPosition(new java.awt.Point(xViewLocation, yViewLocation));
            }
        }
    }

    /**
     * Returns <code>x</code> converted in model coordinates space.
     * @param {number} x
     * @return {number}
     */
    public convertXPixelToModel(x : number) : number {
        let insets : java.awt.Insets = this.getInsets();
        let planBounds : java.awt.geom.Rectangle2D = this.getPlanBounds();
        return (x - insets.left) / this.getScale() - PlanComponent.MARGIN + <number>planBounds.getMinX();
    }

    /**
     * Returns <code>y</code> converted in model coordinates space.
     * @param {number} y
     * @return {number}
     */
    public convertYPixelToModel(y : number) : number {
        let insets : java.awt.Insets = this.getInsets();
        let planBounds : java.awt.geom.Rectangle2D = this.getPlanBounds();
        return (y - insets.top) / this.getScale() - PlanComponent.MARGIN + <number>planBounds.getMinY();
    }

    /**
     * Returns <code>x</code> converted in view coordinates space.
     * @param {number} x
     * @return {number}
     * @private
     */
    convertXModelToPixel(x : number) : number {
        let insets : java.awt.Insets = this.getInsets();
        let planBounds : java.awt.geom.Rectangle2D = this.getPlanBounds();
        return (<number>Math.round((x - planBounds.getMinX() + PlanComponent.MARGIN) * this.getScale())|0) + insets.left;
    }

    /**
     * Returns <code>y</code> converted in view coordinates space.
     * @param {number} y
     * @return {number}
     * @private
     */
    convertYModelToPixel(y : number) : number {
        let insets : java.awt.Insets = this.getInsets();
        let planBounds : java.awt.geom.Rectangle2D = this.getPlanBounds();
        return (<number>Math.round((y - planBounds.getMinY() + PlanComponent.MARGIN) * this.getScale())|0) + insets.top;
    }

    /**
     * Returns <code>x</code> converted in screen coordinates space.
     * @param {number} x
     * @return {number}
     */
    public convertXModelToScreen(x : number) : number {
        let point : java.awt.Point = new java.awt.Point(this.convertXModelToPixel(x), 0);
        javax.swing.SwingUtilities.convertPointToScreen(point, this);
        return point.x;
    }

    /**
     * Returns <code>y</code> converted in screen coordinates space.
     * @param {number} y
     * @return {number}
     */
    public convertYModelToScreen(y : number) : number {
        let point : java.awt.Point = new java.awt.Point(0, this.convertYModelToPixel(y));
        javax.swing.SwingUtilities.convertPointToScreen(point, this);
        return point.y;
    }

    /**
     * Returns the length in centimeters of a pixel with the current scale.
     * @return {number}
     */
    public getPixelLength() : number {
        return 1 / this.getScale();
    }

    /**
     * Returns the bounds of <code>shape</code> in pixels coordinates space.
     * @param {Object} shape
     * @return {java.awt.Rectangle}
     * @private
     */
    getShapePixelBounds(shape : java.awt.Shape) : java.awt.Rectangle {
        let shapeBounds : java.awt.geom.Rectangle2D = shape.getBounds2D();
        return new java.awt.Rectangle(this.convertXModelToPixel(<number>shapeBounds.getMinX()), this.convertYModelToPixel(<number>shapeBounds.getMinY()), (<number>Math.round(shapeBounds.getWidth() * this.getScale())|0), (<number>Math.round(shapeBounds.getHeight() * this.getScale())|0));
    }

    /**
     * Sets the cursor of this component.
     * @param {PlanView.CursorType|string} cursorType
     */
    public setCursor(cursorType : PlanView.CursorType|string) {
      if(typeof cursorType == "string") {
        this.canvas.style.cursor = cursorType;
      } else {
        switch((cursorType)) {
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
     * Set tool tip edition.
     * @param {Array} toolTipEditedProperties
     * @param {Array} toolTipPropertyValues
     * @param {number} x
     * @param {number} y
     */
    public setToolTipEditedProperties(toolTipEditedProperties : any[], toolTipPropertyValues : any[], x : number, y : number) {
        // TODO
    }

    /**
     * Deletes tool tip text from screen.
     */
    public deleteToolTipFeedback() {
        // TODO
    }

    /**
     * Sets whether the resize indicator of selected wall or piece of furniture
     * should be visible or not.
     * @param {boolean} resizeIndicatorVisible
     */
    public setResizeIndicatorVisible(resizeIndicatorVisible : boolean) {
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
    public setAlignmentFeedback(alignedObjectClass : any, alignedObject : any, x : number, y : number, showPointFeedback : boolean) {
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
    public setAngleFeedback(xCenter : number, yCenter : number, x1 : number, y1 : number, x2 : number, y2 : number) {
        this.centerAngleFeedback = new java.awt.geom.Point2D.Float(xCenter, yCenter);
        this.point1AngleFeedback = new java.awt.geom.Point2D.Float(x1, y1);
        this.point2AngleFeedback = new java.awt.geom.Point2D.Float(x2, y2);
    }

    /**
     * Sets the feedback of dragged items drawn during a drag and drop operation,
     * initiated from outside of plan view.
     * @param {*[]} draggedItems
     */
    public setDraggedItemsFeedback(draggedItems : Array<any>) {
        this.draggedItemsFeedback = draggedItems;
        this.repaint();
    }

    /**
     * Sets the given dimension lines to be drawn as feedback.
     * @param {DimensionLine[]} dimensionLines
     */
    public setDimensionLinesFeedback(dimensionLines : Array<any>) {
        this.dimensionLinesFeedback = dimensionLines;
        this.repaint();
    }

    /**
     * Deletes all elements shown as feedback.
     */
    public deleteFeedback() {
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
     * @param {*[]} items
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    public canImportDraggedItems(items : Array<any>, x : number, y : number) : boolean {
        return true;
    }

    /**
     * Returns the size of the given piece of furniture in the horizontal plan,
     * or <code>null</code> if the view isn't able to compute such a value.
     * @param {HomePieceOfFurniture} piece
     * @return {Array}
     */
    public getPieceOfFurnitureSizeInPlan(piece : any) : number[] {
        if(piece.getRoll() === 0 && piece.getPitch() === 0) {
            return [piece.getWidth(), piece.getDepth(), piece.getHeight()];
        } else if(!this.isFurnitureSizeInPlanSupported()) {
            return null;
        } else {
            return PlanComponent.PieceOfFurnitureModelIcon.computePieceOfFurnitureSizeInPlan(piece, this.object3dFactory);
        }
    }

    /**
     * Returns <code>true</code> if this component is able to compute the size of horizontally rotated furniture.
     * @return {boolean}
     */
    public isFurnitureSizeInPlanSupported() : boolean {
        try {
            return !javaemul.internal.BooleanHelper.getBoolean("com.eteks.sweethome3d.no3D");
        } catch(ex) {
            return false;
        };
    }

    public getPreferredScrollableViewportSize() : java.awt.Dimension {
        return this.getPreferredSize();
    }

    public getScrollableBlockIncrement(visibleRect : java.awt.Rectangle, orientation : number, direction : number) : number {
        if(orientation === javax.swing.SwingConstants.HORIZONTAL) {
            return (visibleRect.width / 2|0);
        } else {
            return (visibleRect.height / 2|0);
        }
    }

    public getScrollableTracksViewportHeight() : boolean {
        return (this.getParent() != null && this.getParent() instanceof <any>javax.swing.JViewport) && this.getPreferredSize().height < (<javax.swing.JViewport>this.getParent()).getHeight();
    }

    public getScrollableTracksViewportWidth() : boolean {
        return (this.getParent() != null && this.getParent() instanceof <any>javax.swing.JViewport) && this.getPreferredSize().width < (<javax.swing.JViewport>this.getParent()).getWidth();
    }

    public getScrollableUnitIncrement(visibleRect : java.awt.Rectangle, orientation : number, direction : number) : number {
        if(orientation === javax.swing.SwingConstants.HORIZONTAL) {
            return (visibleRect.width / 10|0);
        } else {
            return (visibleRect.height / 10|0);
        }
    }

    /**
     * Returns the component used as an horizontal ruler for this plan.
     * @return {Object}
     */
    public getHorizontalRuler() : any {
        if(this.horizontalRuler == null) {
            this.horizontalRuler = new PlanComponent.PlanRulerComponent(this, javax.swing.SwingConstants.HORIZONTAL);
        }
        return this.horizontalRuler;
    }

    /**
     * Returns the component used as a vertical ruler for this plan.
     * @return {Object}
     */
    public getVerticalRuler() : any {
        if(this.verticalRuler == null) {
            this.verticalRuler = new PlanComponent.PlanRulerComponent(this, javax.swing.SwingConstants.VERTICAL);
        }
        return this.verticalRuler;
    }
}
PlanComponent["__class"] = "com.eteks.sweethome3d.swing.PlanComponent";
PlanComponent["__interfaces"] = ["com.eteks.sweethome3d.viewcontroller.PlanView","com.eteks.sweethome3d.viewcontroller.View","javax.swing.Scrollable","com.eteks.sweethome3d.viewcontroller.ExportableView","java.awt.print.Printable","javax.swing.TransferHandler.HasGetTransferHandler","java.awt.MenuContainer","java.awt.image.ImageObserver","com.eteks.sweethome3d.viewcontroller.TransferableView","java.io.Serializable"];



namespace PlanComponent {

    /**
     * The circumstances under which the home items displayed by this component will be painted.
     * @enum
     * @property {PlanComponent.PaintMode} PAINT
     * @property {PlanComponent.PaintMode} PRINT
     * @property {PlanComponent.PaintMode} CLIPBOARD
     * @property {PlanComponent.PaintMode} EXPORT
     * @class
     */
    export enum PaintMode {
        PAINT, PRINT, CLIPBOARD, EXPORT
    }

    export enum ActionType {
        DELETE_SELECTION, ESCAPE, MOVE_SELECTION_LEFT, MOVE_SELECTION_UP, MOVE_SELECTION_DOWN, MOVE_SELECTION_RIGHT, MOVE_SELECTION_FAST_LEFT, MOVE_SELECTION_FAST_UP, MOVE_SELECTION_FAST_DOWN, MOVE_SELECTION_FAST_RIGHT, TOGGLE_MAGNETISM_ON, TOGGLE_MAGNETISM_OFF, ACTIVATE_ALIGNMENT, DEACTIVATE_ALIGNMENT, ACTIVATE_DUPLICATION, DEACTIVATE_DUPLICATION, ACTIVATE_EDITIION, DEACTIVATE_EDITIION
    }

    /**
     * Indicator types that may be displayed on selected items.
     * @class
     */
    export class IndicatorType {
        public static ROTATE : PlanComponent.IndicatorType;

        public static RESIZE : PlanComponent.IndicatorType;

        public static ELEVATE : PlanComponent.IndicatorType;

        public static RESIZE_HEIGHT : PlanComponent.IndicatorType;

        public static CHANGE_POWER : PlanComponent.IndicatorType;

        public static MOVE_TEXT : PlanComponent.IndicatorType;

        public static ROTATE_TEXT : PlanComponent.IndicatorType;

        public static ROTATE_PITCH : PlanComponent.IndicatorType;

        public static ROTATE_ROLL : PlanComponent.IndicatorType;

        public static ARC_EXTENT : PlanComponent.IndicatorType;

        __name : string;

        constructor(name : string) {
            if(this.__name===undefined) this.__name = null;
            this.__name = name;
        }

        public name() : string {
            return this.__name;
        }

        /**
         * 
         * @return {string}
         */
        public toString() : string {
            return this.__name;
        }
    }
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
    export class UserPreferencesChangeListener {
        planComponent : PlanComponent;

        public constructor(planComponent : PlanComponent) {
            if(this.planComponent===undefined) this.planComponent = null;
            this.planComponent = <any>(planComponent);
        }

        public propertyChange(ev : PropertyChangeEvent) {
            let planComponent : PlanComponent = /* get */this.planComponent;
            let preferences : any = ev.getSource();
            let property : any = /* valueOf */ev.getPropertyName();
            if(planComponent == null) {
                preferences.removePropertyChangeListener(property, this);
            } else {
                switch((property)) {
                case "LANGUAGE":
                case "UNIT":
                    {
                        let array211 = /* entrySet */((m) => { if(m.entries==null) m.entries=[]; return m.entries; })(<any>planComponent.toolTipEditableTextFields);
                        for(let index210=0; index210 < array211.length; index210++) {
                            let toolTipTextFieldEntry = array211[index210];
                            {
                                PlanComponent.updateToolTipTextFieldFormatterFactory(toolTipTextFieldEntry.getValue(), toolTipTextFieldEntry.getKey(), preferences);
                            }
                        }
                    }
                    if(planComponent.horizontalRuler != null) {
                        planComponent.horizontalRuler.repaint();
                    }
                    if(planComponent.verticalRuler != null) {
                        planComponent.verticalRuler.repaint();
                    }
                    break;
                case "DEFAULT_FONT_NAME":
                    planComponent.fonts = null;
                    planComponent.fontsMetrics = null;
                    null/*erased method planComponent.revalidate*/;
                    break;
                case "WALL_PATTERN":
                    planComponent.wallAreasCache = null;
                    break;
                case "FURNITURE_VIEWED_FROM_TOP":
                    if(planComponent.furnitureTopViewIconKeys != null && !preferences.isFurnitureViewedFromTop()) {
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
    }
    UserPreferencesChangeListener["__class"] = "com.eteks.sweethome3d.swing.PlanComponent.UserPreferencesChangeListener";
    UserPreferencesChangeListener["__interfaces"] = ["java.util.EventListener","java.beans.PropertyChangeListener"];



    /**
     * Separated static class to be able to exclude FreeHEP library from classpath
     * in case the application doesn't use export to SVG format.
     * @class
     */
    export class SVGSupport {
        public static exportToSVG(out : java.io.OutputStream, planComponent : PlanComponent) {
            let homeItems : Array<any> = planComponent.getPaintedItems();
            let svgItemBounds : java.awt.geom.Rectangle2D = planComponent.getItemsBounds(null, homeItems);
            if(svgItemBounds == null) {
                svgItemBounds = new java.awt.geom.Rectangle2D.Float();
            }
            let svgScale : number = 1.0;
            let extraMargin : number = planComponent.getStrokeWidthExtraMargin(homeItems, PlanComponent.PaintMode.EXPORT);
            let imageSize : java.awt.Dimension = new java.awt.Dimension((<number>Math.ceil(svgItemBounds.getWidth() * svgScale + 2 * extraMargin)|0), (<number>Math.ceil(svgItemBounds.getHeight() * svgScale + 2 * extraMargin)|0));
            let exportG2D : org.freehep.graphicsio.svg.SVGGraphics2D = new SVGSupport.SVGSupport$0(out, imageSize);
            let properties : org.freehep.util.UserProperties = new org.freehep.util.UserProperties();
            properties.setProperty(org.freehep.graphicsio.svg.SVGGraphics2D.STYLABLE, true);
            properties.setProperty(org.freehep.graphicsio.svg.SVGGraphics2D.WRITE_IMAGES_AS, org.freehep.graphicsio.ImageConstants.PNG);
            properties.setProperty(org.freehep.graphicsio.svg.SVGGraphics2D.TITLE, planComponent.home.getName() != null?planComponent.home.getName():"");
            properties.setProperty(org.freehep.graphicsio.svg.SVGGraphics2D.FOR, java.lang.System.getProperty("user.name", ""));
            exportG2D.setProperties(properties);
            exportG2D.startExport();
            exportG2D.translate(-svgItemBounds.getMinX() + extraMargin, -svgItemBounds.getMinY() + extraMargin);
            planComponent.checkCurrentThreadIsntInterrupted(PlanComponent.PaintMode.EXPORT);
            planComponent.paintContent(exportG2D, svgScale, PlanComponent.PaintMode.EXPORT);
            exportG2D.endExport();
        }

        constructor() {
        }
    }
    SVGSupport["__class"] = "com.eteks.sweethome3d.swing.PlanComponent.SVGSupport";


    /**
     * A map key used to compare furniture with the same top view icon.
     * @param {HomePieceOfFurniture} piece
     * @class
     */
    export class HomePieceOfFurnitureTopViewIconKey {
        piece : any;

        public constructor(piece : any) {
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
        public equals(obj : any) : boolean {
          if (obj instanceof HomePieceOfFurnitureTopViewIconKey) {
            var piece2 : HomePieceOfFurniture = (<HomePieceOfFurnitureTopViewIconKey>obj).piece;
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
          } else {
            return false;
          }
         }
    }
    HomePieceOfFurnitureTopViewIconKey["__class"] = "com.eteks.sweethome3d.swing.PlanComponent.HomePieceOfFurnitureTopViewIconKey";


    export abstract class PieceOfFurnitureTopViewIcon {
      constructor(icon : any) {}
    }

    /**
     * Creates a plan icon proxy for a <code>piece</code> of furniture.
     * @param {HomePieceOfFurniture} piece an object containing a plan icon content
     * @param {java.awt.Component} waitingComponent a waiting component. If <code>null</code>, the returned icon will
     * be read immediately in the current thread.
     * @class
     * @extends PlanComponent.PieceOfFurnitureTopViewIcon
     */
    export class PieceOfFurniturePlanIcon extends PlanComponent.PieceOfFurnitureTopViewIcon {
        pieceWidth : number;

        pieceDepth : number;

        pieceColor : number;

        pieceTexture : any;
        
        image : HTMLImageElement;

        public constructor(piece : any) {
            super(piece.getPlanIcon());
            this.pieceWidth = piece.getWidth();
            this.pieceDepth = piece.getDepth();
            this.pieceColor = piece.getColor();
            this.pieceTexture = piece.getTexture();
        }

        /**
         * 
         * @param {Graphics2D} g
         * @param {number} x
         * @param {number} y
         */
        public paintIcon(g : Graphics2D, x : number, y : number) {
            if(this.image != PlanComponent.WAIT_TEXTURE_IMAGE && this.image != PlanComponent.ERROR_TEXTURE_IMAGE) {
                if(this.pieceColor != null) {
                  this.image = TextureManager.getInstance().getColoredImage(this.pieceColor);
                  this.pieceColor = null;
                } else if(this.pieceTexture != null) {
                        TextureManager.getInstance().loadTexture(this.pieceTexture.getImage(), true, {
                          textureUpdated : (textureImage : HTMLImageElement) => {
                            this.image = textureImage;
                          },
                          textureError : (error) => {
                            this.image = PlanComponent.ERROR_TEXTURE_IMAGE;
                          } 
                        });
                    this.pieceTexture = null;
                }
            }
            g.drawImage(this.image, x, y);
        }

//        setTexturedIcon(c : java.awt.Component, textureImage : java.awt.image.BufferedImage, angle : number) {
//            let image : java.awt.image.BufferedImage = new java.awt.image.BufferedImage(this.getIconWidth(), this.getIconHeight(), java.awt.image.BufferedImage.TYPE_INT_ARGB);
//            let imageGraphics : Graphics2D = <Graphics2D>image.getGraphics();
//            imageGraphics.setRenderingHint(java.awt.RenderingHints.KEY_RENDERING, java.awt.RenderingHints.VALUE_RENDER_QUALITY);
//            PlanComponent.PieceOfFurniturePlanIcon.super.paintIcon(c, imageGraphics, 0, 0);
//            imageGraphics.setPaint(new java.awt.TexturePaint(textureImage, new java.awt.geom.Rectangle2D.Float(0, 0, -this.getIconWidth() / this.pieceWidth * this.pieceTexture.getWidth(), -this.getIconHeight() / this.pieceDepth * this.pieceTexture.getHeight())));
//            imageGraphics.setComposite(java.awt.AlphaComposite.getInstance(java.awt.AlphaComposite.SRC_IN));
//            imageGraphics.rotate(angle);
//            let maxDimension : number = Math.max(image.getWidth(), image.getHeight());
//            imageGraphics.fill(new java.awt.geom.Rectangle2D.Float(-maxDimension, -maxDimension, 3 * maxDimension, 3 * maxDimension));
//            imageGraphics.fillRect(0, 0, this.getIconWidth(), this.getIconHeight());
//            imageGraphics.dispose();
//            this.setIcon(new javax.swing.ImageIcon(image));
//        }
    }
    PieceOfFurniturePlanIcon["__class"] = "com.eteks.sweethome3d.swing.PlanComponent.PieceOfFurniturePlanIcon";
    PieceOfFurniturePlanIcon["__interfaces"] = ["javax.swing.Icon"];



    export namespace PieceOfFurniturePlanIcon {

        export class PieceOfFurniturePlanIcon$0 {
            public __parent: any;
            public filterRGB(x : number, y : number, argb : number) : number {
                let alpha : number = argb & -16777216;
                let red : number = (argb & 16711680) >> 16;
                let green : number = (argb & 65280) >> 8;
                let blue : number = argb & 255;
                let brightness : number = ((red + red + red + green + green + green + green + blue) >> 4) + 127;
                red = ((this.colorRed * brightness / 255|0)) & 16711680;
                green = ((this.colorGreen * brightness / 255|0)) & 65280;
                blue = ((this.colorBlue * brightness / 255|0)) & 255;
                return alpha | red | green | blue;
            }

            constructor(__parent: any, private colorRed: any, private colorGreen: any, private colorBlue: any) {
                this.__parent = __parent;
                (() => {
                    this.canFilterIndexColorModel = true;
                })();
            }
        }
        PieceOfFurniturePlanIcon$0["__interfaces"] = ["java.lang.Cloneable","java.awt.image.ImageConsumer"];


    }


    /**
     * Creates a top view icon proxy for a <code>piece</code> of furniture.
     * @param {HomePieceOfFurniture} piece an object containing a 3D content
     * @param {java.awt.Component} waitingComponent a waiting component. If <code>null</code>, the returned icon will
     * be read immediately in the current thread.
     * @param {number} iconSize the size in pixels of the generated icon
     * @param {Object} object3dFactory
     * @class
     * @extends PlanComponent.PieceOfFurnitureTopViewIcon
     */
    export class PieceOfFurnitureModelIcon extends PlanComponent.PieceOfFurnitureTopViewIcon {
        static sceneRoot : BranchGroup3D = null;

        static iconsCreationExecutor : java.util.concurrent.ExecutorService = null;

        public constructor(piece : any, object3dFactory : any, waitingComponent : java.awt.Component, iconSize : number) {
            super(IconManager.getInstance().getWaitIcon());
            ModelManager.getInstance().loadModel(piece.getModel(), waitingComponent == null, new PieceOfFurnitureModelIcon.PieceOfFurnitureModelIcon$0(this, piece, waitingComponent, object3dFactory, iconSize));
        }

        /**
         * Returns the branch group bound to a universe and a canvas for the given resolution.
         * @param {number} iconSize
         * @return {BranchGroup3D}
         * @private
         */
        getSceneRoot(iconSize : number) : BranchGroup3D {
            if(PieceOfFurnitureModelIcon.sceneRoot == null) {
                let canvas3D : javax.media.j3d.Canvas3D = Component3DManager.getInstance().getOffScreenCanvas3D(iconSize, iconSize);
                let universe : com.sun.j3d.utils.universe.SimpleUniverse = new com.sun.j3d.utils.universe.SimpleUniverse(canvas3D);
                let viewingPlatform : com.sun.j3d.utils.universe.ViewingPlatform = universe.getViewingPlatform();
                let viewPlatformTransform : TransformGroup3D = viewingPlatform.getViewPlatformTransform();
                let rotation : mat4 = mat4.create();
                mat4.fromXRotation(rotation, -Math.PI / 2);
                let transform : mat4 = mat4.create();
                mat4.fromTranslation(transform, vec3.fromValues(0, 5, 0));
                mat4.mul(transform, transform, rotation);
                viewPlatformTransform.setTransform(transform);
                let viewer : com.sun.j3d.utils.universe.Viewer = viewingPlatform.getViewers()[0];
                let view : javax.media.j3d.View = viewer.getView();
                view.setProjectionPolicy(javax.media.j3d.View.PARALLEL_PROJECTION);
                PieceOfFurnitureModelIcon.sceneRoot = new BranchGroup3D();
                PieceOfFurnitureModelIcon.sceneRoot.setCapability(Group3D.ALLOW_CHILDREN_EXTEND);
                let background : javax.media.j3d.Background = new javax.media.j3d.Background(1.1, 1.1, 1.1);
                background.setCapability(javax.media.j3d.Background.ALLOW_COLOR_WRITE);
                background.setApplicationBounds(new javax.media.j3d.BoundingBox(vec3.fromValues(-1.1, -1.1, -1.1), vec3.fromValues(1.1, 1.1, 1.1)));
                PieceOfFurnitureModelIcon.sceneRoot.addChild(background);
                let lights : javax.media.j3d.Light[] = [new javax.media.j3d.DirectionalLight(new javax.vecmath.Color3f(0.6, 0.6, 0.6), vec3.fromValues(1.5, -0.8, -1)), new javax.media.j3d.DirectionalLight(new javax.vecmath.Color3f(0.6, 0.6, 0.6), vec3.fromValues(-1.5, -0.8, -1)), new javax.media.j3d.DirectionalLight(new javax.vecmath.Color3f(0.6, 0.6, 0.6), vec3.fromValues(0, -0.8, 1)), new javax.media.j3d.AmbientLight(new javax.vecmath.Color3f(0.2, 0.2, 0.2))];
                for(let index212=0; index212 < lights.length; index212++) {
                    let light = lights[index212];
                    {
                        light.setInfluencingBounds(new javax.media.j3d.BoundingBox(vec3.fromValues(-1.1, -1.1, -1.1), vec3.fromValues(1.1, 1.1, 1.1)));
                        PieceOfFurnitureModelIcon.sceneRoot.addChild(light);
                    }
                }
                universe.addBranchGraph(PieceOfFurnitureModelIcon.sceneRoot);
            } else {
                let universe : com.sun.j3d.utils.universe.SimpleUniverse = <com.sun.j3d.utils.universe.SimpleUniverse>PieceOfFurnitureModelIcon.sceneRoot.getLocale().getVirtualUniverse();
                let canvas3D : javax.media.j3d.Canvas3D = universe.getCanvas();
                if(canvas3D.getWidth() !== iconSize) {
                    universe.cleanup();
                    PieceOfFurnitureModelIcon.sceneRoot = null;
                    return this.getSceneRoot(iconSize);
                }
            }
            return PieceOfFurnitureModelIcon.sceneRoot;
        }

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
        createIcon(pieceNode : any, pieceWidth : number, pieceDepth : number, pieceHeight : number, iconSize : number) : javax.swing.Icon {
            let scaleTransform : mat4 = mat4.create();
            mat4.scale(scaleTransform, scaleTransform, vec3.fromValues(2 / pieceWidth, 2 / pieceHeight, 2 / pieceDepth));
            let modelTransformGroup : TransformGroup3D = new TransformGroup3D();
            modelTransformGroup.setTransform(scaleTransform);
            modelTransformGroup.addChild(pieceNode);
            this.cloneTexture(pieceNode, <any>(new java.util.IdentityHashMap<Object, Object>()));
            let model : BranchGroup3D = new BranchGroup3D();
            model.addChild(modelTransformGroup);
            let sceneRoot : BranchGroup3D = this.getSceneRoot(iconSize);
            sceneRoot.addChild(model);
            let background : javax.media.j3d.Background = <javax.media.j3d.Background>sceneRoot.getChild(0);
            background.setColor(1, 1, 1);
            let canvas3D : javax.media.j3d.Canvas3D = (<com.sun.j3d.utils.universe.SimpleUniverse>sceneRoot.getLocale().getVirtualUniverse()).getCanvas();
            canvas3D.renderOffScreenBuffer();
            canvas3D.waitForOffScreenRendering();
            let imageWithWhiteBackgound : java.awt.image.BufferedImage = canvas3D.getOffScreenBuffer().getImage();
            let imageWithWhiteBackgoundPixels : number[] = this.getImagePixels(imageWithWhiteBackgound);
            background.setColor(0, 0, 0);
            canvas3D.renderOffScreenBuffer();
            canvas3D.waitForOffScreenRendering();
            let imageWithBlackBackgound : java.awt.image.BufferedImage = canvas3D.getOffScreenBuffer().getImage();
            let imageWithBlackBackgoundPixels : number[] = this.getImagePixels(imageWithBlackBackgound);
            for(let i : number = 0; i < imageWithBlackBackgoundPixels.length; i++) {{
                if(imageWithBlackBackgoundPixels[i] !== imageWithWhiteBackgoundPixels[i] && imageWithBlackBackgoundPixels[i] === -16777216 && imageWithWhiteBackgoundPixels[i] === -1) {
                    imageWithWhiteBackgoundPixels[i] = 0;
                }
            };}
            sceneRoot.removeChild(model);
            return new javax.swing.ImageIcon(java.awt.Toolkit.getDefaultToolkit().createImage(new java.awt.image.MemoryImageSource(imageWithWhiteBackgound.getWidth(), imageWithWhiteBackgound.getHeight(), imageWithWhiteBackgoundPixels, 0, imageWithWhiteBackgound.getWidth())));
        }

        /**
         * Replace the textures set on node shapes by clones.
         * @param {Node3D} node
         * @param {Object} replacedTextures
         * @private
         */
        cloneTexture(node : Node3D, replacedTextures : any) {
            if(node != null && node instanceof <any>Group3D) {
                let enumeration : any = (<Group3D>node).getAllChildren();
                while((enumeration.hasMoreElements())) {{
                    this.cloneTexture(<any>enumeration.nextElement(), replacedTextures);
                }};
            } else if(node != null && node instanceof <any>Link3D) {
                this.cloneTexture((<Link3D>node).getSharedGroup(), replacedTextures);
            } else if(node != null && node instanceof <any>Shape3D) {
                let appearance : Appearance3D = (<Shape3D>node).getAppearance();
                if(appearance != null) {
                    let texture : Object = appearance.getTexture();
                    if(texture != null) {
                        let replacedTexture : Object = /* get */((m,k) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { return m.entries[i].value; } return null; })(<any>replacedTextures, texture);
                        if(replacedTexture == null) {
                            replacedTexture = <Object>texture.cloneNodeComponent(false);
                            /* put */((m,k,v) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { m.entries[i].value=v; return; } m.entries.push({key:k,value:v,getKey: function() { return this.key }, getValue: function() { return this.value }}); })(<any>replacedTextures, texture, replacedTexture);
                        }
                        appearance.setTextureImage(replacedTexture);
                    }
                }
            }
        }

        /**
         * Returns the pixels of the given <code>image</code>.
         * @param {java.awt.image.BufferedImage} image
         * @return {Array}
         * @private
         */
        getImagePixels(image : java.awt.image.BufferedImage) : number[] {
            if(image.getType() === java.awt.image.BufferedImage.TYPE_INT_RGB || image.getType() === java.awt.image.BufferedImage.TYPE_INT_ARGB) {
                return <number[]>image.getRaster().getDataElements(0, 0, image.getWidth(), image.getHeight(), null);
            } else {
                return image.getRGB(0, 0, image.getWidth(), image.getHeight(), null, 0, image.getWidth());
            }
        }

        /**
         * Returns the size of the given piece computed from its vertices.
         * @param {HomePieceOfFurniture} piece
         * @param {Object} object3dFactory
         * @return {Array}
         * @private
         */
        static computePieceOfFurnitureSizeInPlan(piece : any, object3dFactory : any) : number[] {
            let horizontalRotation : mat4 = mat4.create();
            if(piece.getPitch() !== 0) {
                mat4.fromXRotation(horizontalRotation, -piece.getPitch());
            }
            if(piece.getRoll() !== 0) {
                let rollRotation : mat4 = mat4.create();
                mat4.fromZRotation(rollRotation, -piece.getRoll());
                mat4.mul(horizontalRotation, horizontalRotation, rollRotation, horizontalRotation);
            }
            piece = /* clone *//* clone */((o:any) => { if(o.clone!=undefined) { return (<any>o).clone(); } else { let clone = Object.create(o); for(let p in o) { if (o.hasOwnProperty(p)) clone[p] = o[p]; } return clone; } })(piece);
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
            let bounds : javax.media.j3d.BoundingBox = ModelManager.getInstance().getBounds(object3dFactory.createObject3D(null, piece, true), horizontalRotation);
            let lower : javax.vecmath.Point3d = vec3.fromValues();
            bounds.getLower(lower);
            let upper : javax.vecmath.Point3d = vec3.fromValues();
            bounds.getUpper(upper);
            return [Math.max(0.001, <number>(upper[0] - lower[0])), Math.max(0.001, <number>(upper[2] - lower[2])), Math.max(0.001, <number>(upper[1] - lower[1]))];
        }
    }
    PieceOfFurnitureModelIcon["__class"] = "com.eteks.sweethome3d.swing.PlanComponent.PieceOfFurnitureModelIcon";
    PieceOfFurnitureModelIcon["__interfaces"] = ["javax.swing.Icon"];



    export namespace PieceOfFurnitureModelIcon {

        export class PieceOfFurnitureModelIcon$0 implements ModelManager.ModelObserver {
            public __parent: any;
            public modelUpdated(modelNode : BranchGroup3D) {
                let normalizedPiece : any = /* clone *//* clone */((o:any) => { if(o.clone!=undefined) { return (<any>o).clone(); } else { let clone = Object.create(o); for(let p in o) { if (o.hasOwnProperty(p)) clone[p] = o[p]; } return clone; } })(this.piece);
                if(normalizedPiece.isResizable()) {
                    normalizedPiece.setModelMirrored(false);
                }
                let pieceWidth : number = normalizedPiece.getWidthInPlan();
                let pieceDepth : number = normalizedPiece.getDepthInPlan();
                let pieceHeight : number = normalizedPiece.getHeightInPlan();
                normalizedPiece.setX(0);
                normalizedPiece.setY(0);
                normalizedPiece.setElevation(-pieceHeight / 2);
                normalizedPiece.setLevel(null);
                normalizedPiece.setAngle(0);
                if(this.waitingComponent != null) {
                    if(PlanComponent.PieceOfFurnitureModelIcon.iconsCreationExecutor == null) {
                        PlanComponent.PieceOfFurnitureModelIcon.iconsCreationExecutor = java.util.concurrent.Executors.newSingleThreadExecutor();
                    }
                    PlanComponent.PieceOfFurnitureModelIcon.iconsCreationExecutor.execute(() => {
                        this.__parent.setIcon(this.__parent.createIcon(this.object3dFactory.createObject3D(null, normalizedPiece, true), pieceWidth, pieceDepth, pieceHeight, this.iconSize));
                        this.waitingComponent.repaint();
                    });
                } else {
                    this.__parent.setIcon(this.__parent.createIcon(this.object3dFactory.createObject3D(null, normalizedPiece, true), pieceWidth, pieceDepth, pieceHeight, this.iconSize));
                }
            }

            public modelError(ex : Error) {
                this.__parent.setIcon(IconManager.getInstance().getErrorIcon());
                if(this.waitingComponent != null) {
                    this.waitingComponent.repaint();
                }
            }

            constructor(__parent: any, private piece: any, private waitingComponent: any, private object3dFactory: any, private iconSize: any) {
                this.__parent = __parent;
            }
        }
        PieceOfFurnitureModelIcon$0["__interfaces"] = ["com.eteks.sweethome3d.j3d.ModelManager.ModelObserver"];


    }


    export class PlanComponent$14 {
        public __parent: any;
        public mouseWheelMoved(ev : java.awt.event.MouseWheelEvent) {
            if(ev.getModifiers() === this.__parent.getToolkit().getMenuShortcutKeyMask()) {
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
        }

        constructor(__parent: any, private controller: any) {
            this.__parent = __parent;
        }
    }
    PlanComponent$14["__interfaces"] = ["java.util.EventListener","java.awt.event.MouseWheelListener"];



    export class PlanComponent$15 {
        public __parent: any;
        /**
         * 
         * @param {java.awt.event.FocusEvent} ev
         */
        public focusLost(ev : java.awt.event.FocusEvent) {
            this.controller.escape();
        }

        constructor(__parent: any, private controller: any) {
            this.__parent = __parent;
        }
    }
    PlanComponent$15["__interfaces"] = ["java.util.EventListener","java.awt.event.FocusListener"];



    export class PlanComponent$16 {
        public __parent: any;
        public propertyChange(ev : PropertyChangeEvent) {
            if(!/* isEmpty */(this.__parent.home.getSelectedItems().length == 0)) {
                this.__parent.repaint();
            }
        }

        constructor(__parent: any) {
            this.__parent = __parent;
        }
    }
    PlanComponent$16["__interfaces"] = ["java.util.EventListener","java.beans.PropertyChangeListener"];



    export class PlanComponent$17 {
        public __parent: any;
        public propertyChange(ev : PropertyChangeEvent) {
            let wallsDoorsOrWindowsModification : boolean = this.controller.isBasePlanModificationState();
            if(wallsDoorsOrWindowsModification) {
                if(this.controller.getMode() !== PlanController.Mode.WALL_CREATION) {
                    {
                        let array214 = (this.__parent.draggedItemsFeedback != null?this.__parent.draggedItemsFeedback:this.__parent.home.getSelectedItems());
                        for(let index213=0; index213 < array214.length; index213++) {
                            let item = array214[index213];
                            {
                                if(!(item != null && item instanceof <any>Wall) && !((item != null && item instanceof <any>HomePieceOfFurniture) && (item).isDoorOrWindow())) {
                                    wallsDoorsOrWindowsModification = false;
                                }
                            }
                        }
                    }
                }
            }
            if(this.__parent.wallsDoorsOrWindowsModification !== wallsDoorsOrWindowsModification) {
                this.__parent.wallsDoorsOrWindowsModification = wallsDoorsOrWindowsModification;
                this.__parent.repaint();
            }
        }

        constructor(__parent: any, private controller: any) {
            this.__parent = __parent;
        }
    }
    PlanComponent$17["__interfaces"] = ["java.util.EventListener","java.beans.PropertyChangeListener"];



    export class PlanComponent$18 /*extends javax.swing.AbstractAction*/ {
        public __parent: any;
        public actionPerformed(ev : java.awt.event.ActionEvent) {
            this.controller.deleteSelection();
        }

        constructor(__parent: any, private controller: any) {
            super();
            this.__parent = __parent;
        }
    }
    PlanComponent$18["__interfaces"] = ["java.util.EventListener","java.lang.Cloneable","java.awt.event.ActionListener","javax.swing.Action","java.io.Serializable"];



    export class PlanComponent$19 /*extends javax.swing.AbstractAction*/ {
        public __parent: any;
        public actionPerformed(ev : java.awt.event.ActionEvent) {
            this.controller.escape();
        }

        constructor(__parent: any, private controller: any) {
            super();
            this.__parent = __parent;
        }
    }
    PlanComponent$19["__interfaces"] = ["java.util.EventListener","java.lang.Cloneable","java.awt.event.ActionListener","javax.swing.Action","java.io.Serializable"];



    export class PlanComponent$20 /*extends javax.swing.JFormattedTextField*/ {
        public __parent: any;
        /**
         * 
         * @return {java.awt.Dimension}
         */
        public getPreferredSize() : java.awt.Dimension {
            let preferredSize : java.awt.Dimension = super.getPreferredSize();
            return new java.awt.Dimension(preferredSize.width + 1, preferredSize.height);
        }

        constructor(__parent: any) {
            super();
            this.__parent = __parent;
        }
    }
    PlanComponent$20["__interfaces"] = ["javax.swing.Scrollable","javax.swing.TransferHandler.HasGetTransferHandler","java.awt.MenuContainer","javax.accessibility.Accessible","javax.swing.SwingConstants","java.awt.image.ImageObserver","java.io.Serializable"];



    export class PlanComponent$21 /*implements javax.swing.event.DocumentListener*/ {
        public __parent: any;
        public changedUpdate(ev : javax.swing.event.DocumentEvent) {
            try {
                this.textField.commitEdit();
                this.controller.updateEditableProperty(this.editableProperty, this.textField.getValue());
            } catch(ex) {
                this.controller.updateEditableProperty(this.editableProperty, null);
            };
        }

        public insertUpdate(ev : javax.swing.event.DocumentEvent) {
            this.changedUpdate(ev);
        }

        public removeUpdate(ev : javax.swing.event.DocumentEvent) {
            this.changedUpdate(ev);
        }

        constructor(__parent: any, private textField: any, private controller: any, private editableProperty: any) {
            this.__parent = __parent;
        }
    }
    PlanComponent$21["__interfaces"] = ["java.util.EventListener","javax.swing.event.DocumentListener"];



    export class PlanComponent$22 {
        public __parent: any;
        public compare(piece1 : any, piece2 : any) : number {
            return /* compare */(piece1.getGroundElevation() - piece2.getGroundElevation());
        }

        constructor(__parent: any) {
            this.__parent = __parent;
        }
    }
    PlanComponent$22["__interfaces"] = ["java.util.Comparator"];



    export class PlanComponent$23 {
        public __parent: any;
        public compare(room1 : any, room2 : any) : number {
            if(room1.isFloorVisible() === room2.isFloorVisible() && room1.isCeilingVisible() === room2.isCeilingVisible()) {
                return 0;
            } else if(!room2.isFloorVisible() || room2.isCeilingVisible()) {
                return 1;
            } else {
                return -1;
            }
        }

        constructor(__parent: any) {
            this.__parent = __parent;
        }
    }
    PlanComponent$23["__interfaces"] = ["java.util.Comparator"];



    export class PlanComponent$24 /*extends javax.swing.event.MouseInputAdapter*/ {
        public __parent: any;
        /**
         * 
         * @param {java.awt.event.MouseEvent} ev
         */
        public mousePressed(ev : java.awt.event.MouseEvent) {
            this.mouseMoved(ev);
        }

        /**
         * 
         * @param {java.awt.event.MouseEvent} ev
         */
        public mouseReleased(ev : java.awt.event.MouseEvent) {
            this.mouseMoved(ev);
        }

        /**
         * 
         * @param {java.awt.event.MouseEvent} ev
         */
        public mouseMoved(ev : java.awt.event.MouseEvent) {
            this.__parent.dispatchEvent(javax.swing.SwingUtilities.convertMouseEvent(this.__parent.toolTipWindow, ev, this.__parent));
        }

        /**
         * 
         * @param {java.awt.event.MouseEvent} ev
         */
        public mouseDragged(ev : java.awt.event.MouseEvent) {
            this.mouseMoved(ev);
        }

        constructor(__parent: any) {
            super();
            this.__parent = __parent;
        }
    }
    PlanComponent$24["__interfaces"] = ["java.util.EventListener","java.awt.event.MouseMotionListener","javax.swing.event.MouseInputListener","java.awt.event.MouseWheelListener","java.awt.event.MouseListener"];



    export class PlanComponent$25 {
        public __parent: any;
        focusedTextFieldIndex : number;

        focusedTextField : javax.swing.JFormattedTextField;

        setFocusedTextFieldIndex(textFieldIndex : number) {
            if(this.focusedTextField != null) {
                this.focusedTextField.getCaret().setVisible(false);
                this.focusedTextField.getCaret().setSelectionVisible(false);
                this.focusedTextField.setValue(this.focusedTextField.getValue());
            }
            this.focusedTextFieldIndex = textFieldIndex;
            this.focusedTextField = /* get */((m,k) => { if(m.entries==null) m.entries=[]; for(let i=0;i<m.entries.length;i++) if(m.entries[i].key.equals!=null && m.entries[i].key.equals(k) || m.entries[i].key===k) { return m.entries[i].value; } return null; })(<any>this.__parent.toolTipEditableTextFields, this.toolTipEditedProperties[textFieldIndex]);
            if(this.focusedTextField.getText().length === 0) {
                this.focusedTextField.getCaret().setVisible(false);
            } else {
                this.focusedTextField.selectAll();
            }
            this.focusedTextField.getCaret().setSelectionVisible(true);
        }

        public keyPressed(ev : java.awt.event.KeyEvent) {
            this.keyTyped(ev);
        }

        public keyReleased(ev : java.awt.event.KeyEvent) {
            if(ev.getKeyCode() !== java.awt.event.KeyEvent.VK_CONTROL && ev.getKeyCode() !== java.awt.event.KeyEvent.VK_ALT) {
                java.awt.KeyboardFocusManager.getCurrentKeyboardFocusManager().redispatchEvent(this.focusedTextField, ev);
            }
        }

        public keyTyped(ev : java.awt.event.KeyEvent) {
            let forwardKeys : Array<java.awt.AWTKeyStroke> = this.focusedTextField.getFocusTraversalKeys(java.awt.KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS);
            if(/* contains */(forwardKeys.indexOf(<any>(java.awt.AWTKeyStroke.getAWTKeyStrokeForEvent(ev))) >= 0) || ev.getKeyCode() === java.awt.event.KeyEvent.VK_DOWN) {
                this.setFocusedTextFieldIndex((this.focusedTextFieldIndex + 1) % this.toolTipEditedProperties.length);
                ev.consume();
            } else {
                let backwardKeys : Array<java.awt.AWTKeyStroke> = this.focusedTextField.getFocusTraversalKeys(java.awt.KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS);
                if(/* contains */(backwardKeys.indexOf(<any>(java.awt.AWTKeyStroke.getAWTKeyStrokeForEvent(ev))) >= 0) || ev.getKeyCode() === java.awt.event.KeyEvent.VK_UP) {
                    this.setFocusedTextFieldIndex((this.focusedTextFieldIndex - 1 + this.toolTipEditedProperties.length) % this.toolTipEditedProperties.length);
                    ev.consume();
                } else if((ev.getKeyCode() === java.awt.event.KeyEvent.VK_HOME || ev.getKeyCode() === java.awt.event.KeyEvent.VK_END) && com.eteks.sweethome3d.tools.OperatingSystem.isMacOSX() && !com.eteks.sweethome3d.tools.OperatingSystem.isMacOSXLeopardOrSuperior()) {
                    if(ev.getKeyCode() === java.awt.event.KeyEvent.VK_HOME) {
                        this.focusedTextField.setCaretPosition(0);
                    } else if(ev.getKeyCode() === java.awt.event.KeyEvent.VK_END) {
                        this.focusedTextField.setCaretPosition(this.focusedTextField.getText().length);
                    }
                    ev.consume();
                } else if(ev.getKeyCode() !== java.awt.event.KeyEvent.VK_ESCAPE && ev.getKeyCode() !== java.awt.event.KeyEvent.VK_CONTROL && ev.getKeyCode() !== java.awt.event.KeyEvent.VK_ALT) {
                    java.awt.KeyboardFocusManager.getCurrentKeyboardFocusManager().redispatchEvent(this.focusedTextField, ev);
                    this.focusedTextField.getCaret().setVisible(true);
                    this.__parent.toolTipWindow.pack();
                }
            }
        }

        constructor(__parent: any, private toolTipEditedProperties: any) {
            this.__parent = __parent;
            if(this.focusedTextFieldIndex===undefined) this.focusedTextFieldIndex = 0;
            if(this.focusedTextField===undefined) this.focusedTextField = null;
            (() => {
                this.setFocusedTextFieldIndex(0);
            })();
        }
    }
    PlanComponent$25["__interfaces"] = ["java.util.EventListener","java.awt.event.KeyListener"];



    export class MoveSelectionAction /*extends javax.swing.AbstractAction*/ {
        public __parent: any;
        dx : number;

        dy : number;

        public constructor(__parent: any, dx : number, dy : number) {
            super();
            this.__parent = __parent;
            if(this.dx===undefined) this.dx = 0;
            if(this.dy===undefined) this.dy = 0;
            this.dx = dx;
            this.dy = dy;
        }

        public actionPerformed(ev : java.awt.event.ActionEvent) {
            controller.moveSelection(this.dx / this.__parent.getScale(), this.dy / this.__parent.getScale());
        }
    }
    MoveSelectionAction["__class"] = "MoveSelectionAction";
    MoveSelectionAction["__interfaces"] = ["java.util.EventListener","java.lang.Cloneable","java.awt.event.ActionListener","javax.swing.Action","java.io.Serializable"];



    export class ToggleMagnetismAction /*extends javax.swing.AbstractAction*/ {
        public __parent: any;
        toggle : boolean;

        public constructor(__parent: any, toggle : boolean) {
            super();
            this.__parent = __parent;
            if(this.toggle===undefined) this.toggle = false;
            this.toggle = toggle;
        }

        public actionPerformed(ev : java.awt.event.ActionEvent) {
            controller.toggleMagnetism(this.toggle);
        }
    }
    ToggleMagnetismAction["__class"] = "ToggleMagnetismAction";
    ToggleMagnetismAction["__interfaces"] = ["java.util.EventListener","java.lang.Cloneable","java.awt.event.ActionListener","javax.swing.Action","java.io.Serializable"];



    export class SetAlignmentActivatedAction /*extends javax.swing.AbstractAction*/ {
        public __parent: any;
        alignmentActivated : boolean;

        public constructor(__parent: any, alignmentActivated : boolean) {
            super();
            this.__parent = __parent;
            if(this.alignmentActivated===undefined) this.alignmentActivated = false;
            this.alignmentActivated = alignmentActivated;
        }

        public actionPerformed(ev : java.awt.event.ActionEvent) {
            controller.setAlignmentActivated(this.alignmentActivated);
        }
    }
    SetAlignmentActivatedAction["__class"] = "SetAlignmentActivatedAction";
    SetAlignmentActivatedAction["__interfaces"] = ["java.util.EventListener","java.lang.Cloneable","java.awt.event.ActionListener","javax.swing.Action","java.io.Serializable"];



    export class SetDuplicationActivatedAction /*extends javax.swing.AbstractAction*/ {
        public __parent: any;
        duplicationActivated : boolean;

        public constructor(__parent: any, duplicationActivated : boolean) {
            super();
            this.__parent = __parent;
            if(this.duplicationActivated===undefined) this.duplicationActivated = false;
            this.duplicationActivated = duplicationActivated;
        }

        public actionPerformed(ev : java.awt.event.ActionEvent) {
            controller.setDuplicationActivated(this.duplicationActivated);
        }
    }
    SetDuplicationActivatedAction["__class"] = "SetDuplicationActivatedAction";
    SetDuplicationActivatedAction["__interfaces"] = ["java.util.EventListener","java.lang.Cloneable","java.awt.event.ActionListener","javax.swing.Action","java.io.Serializable"];



    export class SetEditionActivatedAction /*extends javax.swing.AbstractAction*/ {
        public __parent: any;
        editionActivated : boolean;

        public constructor(__parent: any, editionActivated : boolean) {
            super();
            this.__parent = __parent;
            if(this.editionActivated===undefined) this.editionActivated = false;
            this.editionActivated = editionActivated;
        }

        public actionPerformed(ev : java.awt.event.ActionEvent) {
            controller.setEditionActivated(this.editionActivated);
        }
    }
    SetEditionActivatedAction["__class"] = "SetEditionActivatedAction";
    SetEditionActivatedAction["__interfaces"] = ["java.util.EventListener","java.lang.Cloneable","java.awt.event.ActionListener","javax.swing.Action","java.io.Serializable"];


}




PlanComponent.__static_initialize();
