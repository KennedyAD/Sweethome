/*
 * Polyline3D.js
 *
 * Sweet Home 3D, Copyright (c) 2018 Emmanuel PUYBARET / eTeks <info@eteks.com>
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

// Requires scene3d.js
//          Object3DBranch.js
//          geom.js
//          stroke.js


/**
 * Creates the 3D polyline matching the given home <code>polyline</code>.
 * @param {Polyline} polyline
 * @param {Home} home
 * @param {UserPreferences} [preferences]
 * @param {boolean} waitModelAndTextureLoadingEnd
 * @constructor
 * @extends Object3DBranch
 * @author Emmanuel Puybaret
 */
function Polyline3D(polyline, home, preferences, waitModelAndTextureLoadingEnd) {
  if (waitModelAndTextureLoadingEnd === undefined) {
    // 3 parameters
    waitModelAndTextureLoadingEnd = preferences;
    preferences = null;
  }
  Object3DBranch.call(this, polyline, home, preferences);
  
  if (Polyline3D.ARROW === null) {
    Polyline3D.ARROW = new java.awt.geom.GeneralPath();
    Polyline3D.ARROW.moveTo(-5, -2);
    Polyline3D.ARROW.lineTo(0, 0);
    Polyline3D.ARROW.lineTo(-5, 2);
  }
  
  this.setCapability(Group3D.ALLOW_CHILDREN_EXTEND);
  
  this.update();
}
Polyline3D.prototype = Object.create(Object3DBranch.prototype);
Polyline3D.prototype.constructor = Polyline3D;

Polyline3D.ARROW = null;

Polyline3D.prototype.update = function() {
  var polyline = this.getUserData();
  if (polyline.isVisibleIn3D() 
      && (polyline.getLevel() == null 
          || polyline.getLevel().isViewableAndVisible())) {
    var stroke = ShapeTools.getStroke(polyline.getThickness(), polyline.getCapStyle(), polyline.getJoinStyle(), 
        polyline.getDashStyle() !== Polyline.DashStyle.SOLID ? polyline.getDashPattern() : null, // null renders better closed shapes with a solid style
        polyline.getDashOffset());
    var polylineShape = ShapeTools.getPolylineShape(polyline.getPoints(), 
        polyline.getJoinStyle() === Polyline.JoinStyle.CURVED, polyline.isClosedPath());
    
    var firstPoint = null;
    var secondPoint = null;
    var beforeLastPoint = null;
    var lastPoint = null;
    for (var it = polylineShape.getPathIterator(null, 0.5); !it.isDone(); it.next()) {
      var pathPoint = [0, 0];
      if (it.currentSegment(pathPoint) !== java.awt.geom.PathIterator.SEG_CLOSE) {
        if (firstPoint === null) {
          firstPoint = pathPoint;
        } else if (secondPoint === null) {
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
        ? polyline.getThickness() / 2 
        : 0;
    var polylineShapes = [this.getArrowShape(firstPoint, angleAtStart, polyline.getStartArrowStyle(), polyline.getThickness(), arrowDelta), 
                          this.getArrowShape(lastPoint, angleAtEnd, polyline.getEndArrowStyle(), polyline.getThickness(), arrowDelta), 
                          stroke.createStrokedShape(polylineShape)];
    var polylineArea = new java.awt.geom.Area();
    for (var i = 0; i < polylineShapes.length; i++) {
      var shape = polylineShapes[i];
      if (shape != null) {
          polylineArea.add(new java.awt.geom.Area(shape));
      }
    }

    var polylinePoints = this.getAreaPoints(polylineArea, 0.5, false);
    var pointsCount = 0;
    for (var i = 0; i < polylinePoints.length; i++) {
      pointsCount += polylinePoints [i].length;
    }
    var vertices = new Array(pointsCount);
    var stripCounts = new Array(polylinePoints.length);
    var selectionIndices =  new Array(pointsCount * 2);
    for (var i = 0, j = 0, k = 0; i < polylinePoints.length; i++) {
      var points = polylinePoints [i];
      var initialIndex = j;
      for (var l = 0; l < points.length; l++) {
        var point = points [l];
        selectionIndices [k++] = j;
        if (l > 0) {
          selectionIndices [k++] = j;
        }
        vertices [j++] = vec3.fromValues(point [0], 0, point [1]);
      }
      selectionIndices [k++] = initialIndex;
      stripCounts [i] = points.length;
    }
    
    var geometryInfo = new GeometryInfo3D(GeometryInfo3D.POLYGON_ARRAY);
    geometryInfo.setCoordinates(vertices);
    var normals = new Array(vertices.length);
    var normal = vec3.fromValues(0, 1, 0);
    for (var i = 0; i < vertices.length; i++) {
      normals [i] = normal;
    }
    geometryInfo.setNormals(normals);
    geometryInfo.setStripCounts(stripCounts);
    var geometry = geometryInfo.getIndexedGeometryArray();
    
    var selectionGeometry = new IndexedLineArray3D(vertices, selectionIndices);
    
    var transformGroup;
    var selectionAppearance;
    if (this.getChildren().length === 0) {
      var group = new BranchGroup3D();
      transformGroup = new TransformGroup3D();
      transformGroup.setCapability(TransformGroup3D.ALLOW_TRANSFORM_WRITE);
      group.addChild(transformGroup);
      
      var appearance = new Appearance3D();
      this.updateAppearanceMaterial(appearance, Object3DBranch.DEFAULT_COLOR, Object3DBranch.DEFAULT_AMBIENT_COLOR, 0);
      appearance.setCullFace(Appearance3D.CULL_NONE);
      var shape = new Shape3D(geometry, appearance);
      shape.setCapability(Shape3D.ALLOW_GEOMETRY_WRITE);
      transformGroup.addChild(shape);
      this.addChild(group);
      
      var selectionAppearance = this.getSelectionAppearance();
      var selectionLinesShape = new Shape3D(selectionGeometry, selectionAppearance);
      selectionLinesShape.setCapability(Shape3D.ALLOW_GEOMETRY_WRITE);
      selectionLinesShape.setPickable(false);
      transformGroup.addChild(selectionLinesShape);
    } else {
      transformGroup = this.getChild(0).getChild(0);
      var shape = transformGroup.getChild(0);
      shape.setGeometry(geometry, 0);
      
      selectionLinesShape = transformGroup.getChild(1);
      selectionLinesShape.setGeometry(selectionGeometry, 0);
      selectionAppearance = selectionLinesShape.getAppearance();
    }
    
    var transform = mat4.create();
    mat4.fromTranslation(transform, vec3.fromValues(0, polyline.getGroundElevation() + (polyline.getElevation() < 0.05 ? 0.05 : 0), 0));
    transformGroup.setTransform(transform);
    this.updateAppearanceMaterial(transformGroup.getChild(0).getAppearance(), polyline.getColor(), polyline.getColor(), 0);
    
    selectionAppearance.setVisible(this.getUserPreferences() != null
        && this.getUserPreferences().isEditingIn3DViewEnabled()
        && this.getHome().isItemSelected(polyline));
  } else {
    this.removeAllChildren();
  }
}

/**
 * Returns the shape of polyline arrow at the given point and orientation.
 * @param {Array} point
 * @param {number} angle
 * @param {Polyline.ArrowStyle} arrowStyle
 * @param {number} thickness
 * @param {number} arrowDelta
 * @return {Object}
 * @private
 */
Polyline3D.prototype.getArrowShape = function (point, angle, arrowStyle, thickness, arrowDelta) {
  if (arrowStyle != null 
      && arrowStyle !== Polyline.ArrowStyle.NONE) {
    var transform = java.awt.geom.AffineTransform.getTranslateInstance(point[0], point[1]);
    transform.rotate(angle);
    transform.translate(arrowDelta, 0);
    var scale = Math.pow(thickness, 0.66) * 2;
    transform.scale(scale, scale);
    var arrowPath = new java.awt.geom.GeneralPath();
    switch (arrowStyle) {
      case Polyline.ArrowStyle.DISC:
        arrowPath.append(new java.awt.geom.Ellipse2D.Float(-3.5, -2, 4, 4), false);
        break;
      case Polyline.ArrowStyle.OPEN:
        var arrowStroke = new java.awt.BasicStroke((thickness / scale / 0.9), java.awt.BasicStroke.CAP_BUTT, java.awt.BasicStroke.JOIN_MITER);
        arrowPath.append(arrowStroke.createStrokedShape(Polyline3D.ARROW).getPathIterator(java.awt.geom.AffineTransform.getScaleInstance(0.9, 0.9), 0), false);
        break;
      case Polyline.ArrowStyle.DELTA:
        var deltaPath = new java.awt.geom.GeneralPath(Polyline3D.ARROW);
        deltaPath.closePath();
        arrowPath.append(deltaPath.getPathIterator(java.awt.geom.AffineTransform.getTranslateInstance(1.65, 0), 0), false);
        break;
      default:
        return null;
    }
    return arrowPath.createTransformedShape(transform);
  }
  return null;
}
