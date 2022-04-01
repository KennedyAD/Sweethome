/*
 * Object3DBranch.js
 *
 * Sweet Home 3D, Copyright (c) 2015 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
//          ShapeTools.js
//          geom.js

/**
 * Root of a 3D branch that matches a home object. 
 * @constructor
 * @extends BranchGroup3D
 * @author Emmanuel Puybaret
 */
function Object3DBranch() {
  BranchGroup3D.call(this);
}
Object3DBranch.prototype = Object.create(BranchGroup3D.prototype);
Object3DBranch.prototype.constructor = Object3DBranch;

Object3DBranch.DEFAULT_COLOR         = 0xFFFFFF;
Object3DBranch.DEFAULT_AMBIENT_COLOR = 0x333333;

/**
 * Returns the shape matching the coordinates in <code>points</code> array.
 * @param {Array} points
 * @return {Shape}
 * @protected
 * @ignore
 */
Object3DBranch.prototype.getShape = function(points) {
  return ShapeTools.getShape(points, true, null);
}

/**
 * Updates an appearance with the given colors.
 * @protected
 * @ignore
 */
Object3DBranch.prototype.updateAppearanceMaterial = function(appearance, diffuseColor, ambientColor, shininess) {
  if (diffuseColor !== null) {
    appearance.setAmbientColor(vec3.fromValues(((ambientColor >>> 16) & 0xFF) / 255.,
                                               ((ambientColor >>> 8) & 0xFF) / 255.,
                                                (ambientColor & 0xFF) / 255.));
    appearance.setDiffuseColor(vec3.fromValues(((diffuseColor >>> 16) & 0xFF) / 255.,
                                               ((diffuseColor >>> 8) & 0xFF) / 255.,
                                                (diffuseColor & 0xFF) / 255.));
    appearance.setSpecularColor(vec3.fromValues(shininess, shininess, shininess));
    appearance.setShininess(Math.max(1, shininess * 128));
  } else {
    appearance.setAmbientColor(vec3.fromValues(.2, .2, .2));
    appearance.setDiffuseColor(vec3.fromValues(1, 1, 1));
    appearance.setSpecularColor(vec3.fromValues(shininess, shininess, shininess));
    appearance.setShininess(Math.max(1, shininess * 128));
  }
}

/**
 * Updates the texture transformation of an appearance.
 * and scaled if required.
 * @param {Appearance3D} appearance
 * @param {HomeTexture} texture
 * @param {boolean} [scaled]
 */
Object3DBranch.prototype.updateTextureTransform = function(appearance, texture, scaled) {
  var textureWidth = texture.getWidth();
  var textureHeight = texture.getHeight();
  if (textureWidth === -1 || textureHeight === -1) {
    // Set a default value of 1m for textures with width and height equal to -1
    // (this may happen for textures retrieved from 3D models)
    textureWidth = 100.;
    textureHeight = 100.;
  }
  var textureXOffset = texture.getXOffset();
  var textureYOffset = texture.getYOffset();
  var textureScale = 1 / texture.getScale();
  var rotation = mat3.create();
  mat3.rotate(rotation, rotation, texture.getAngle());
  var translation = mat3.create();
  var transform = mat3.create();
  // Change scale if required
  if (scaled) {
    mat3.fromTranslation(translation, vec2.fromValues(-textureXOffset / textureScale * textureWidth, -textureYOffset / textureScale * textureHeight));
    mat3.scale(transform, transform, vec2.fromValues(textureScale / textureWidth, textureScale / textureHeight));
  } else {
    mat3.fromTranslation(translation, vec2.fromValues(-textureXOffset / textureScale, -textureYOffset / textureScale));
    mat3.multiplyScalar(transform, transform, textureScale);
  }
  mat3.mul(rotation, rotation, translation);
  mat3.mul(transform, transform, rotation);
  appearance.setTextureTransform(transform);
}

/**
 * Updates the texture transformation of an appearance to fit the surface matching <code>areaPoints</code>.
 * @param {Appearance3D} appearance
 * @param {HomeTexture} texture
 * @param {Array} areaPoints
 * @param {boolean} invertY
 */
Object3DBranch.prototype.updateTextureTransformFittingArea = function(appearance, texture, areaPoints, invertY) {
  var minX = Number.POSITIVE_INFINITY;
  var minY = Number.POSITIVE_INFINITY;
  var maxX = Number.NEGATIVE_INFINITY;
  var maxY = Number.NEGATIVE_INFINITY;
  for (var i = 0; i < areaPoints.length; i++) {
    minX = Math.min(minX, areaPoints [i][0]);
    minY = Math.min(minY, areaPoints [i][1]);
    maxX = Math.max(maxX, areaPoints [i][0]);
    maxY = Math.max(maxY, areaPoints [i][1]);
  }
  if (maxX - minX <= 0 || maxY - minY <= 0) {
    this.updateTextureTransform(appearance, texture, true);
  }

  var translation = mat3.create();
  mat3.fromTranslation(translation, vec2.fromValues(-minX, invertY ? minY : -minY));
  var transform = mat3.create();
  mat3.scale(transform, transform, vec2.fromValues(1 / (maxX - minX),  1 / (maxY - minY)));
  mat3.mul(transform, transform, translation);
  appearance.setTextureTransform(transform);
}

/**
 * Returns the list of polygons points matching the given <code>area</code> with detailed information in
 * <code>areaPoints</code> and <code>areaHoles</code> if they exists.
 * @param {Area} area
 * @param {Array} [areaPoints]
 * @param {Array} [areaHoles]
 * @param {number} flatness
 * @param {boolean} reversed
 * @return {Array}
 * @protected
 * @ignore
 */
Object3DBranch.prototype.getAreaPoints = function (area, areaPoints, areaHoles, flatness, reversed) {
  if (flatness === undefined && reversed === undefined) {
    // 3 parameters
    flatness = areaPoints;
    reversed = areaHoles;
    areaPoints = null; 
    areaHoles = null;
  }
  var areaPointsLists = [];
  var areaHolesLists = [];
  var currentPathPoints = null;
  var previousPoint = null;
  for (var it = area.getPathIterator(null, flatness); !it.isDone(); it.next()) {
    var point = [0, 0];
    switch ((it.currentSegment(point))) {
      case java.awt.geom.PathIterator.SEG_MOVETO :
        currentPathPoints = [];
        currentPathPoints.push(point);
        previousPoint = point;
        break;
      case java.awt.geom.PathIterator.SEG_LINETO :
        if (point[0] !== previousPoint[0] || point[1] !== previousPoint[1]) {
          currentPathPoints.push(point);
        }
        previousPoint = point;
        break;
      case java.awt.geom.PathIterator.SEG_CLOSE :
        var firstPoint = currentPathPoints[0];
        if (firstPoint[0] === previousPoint[0]
            && firstPoint[1] === previousPoint[1]) {
          currentPathPoints.splice(currentPathPoints.length - 1, 1);
        }
        if (currentPathPoints.length > 2) {
          var areaPartPoints = currentPathPoints;
          var subRoom = new Room(areaPartPoints);
          if (subRoom.getArea() > 0) {
            var pathPointsClockwise = subRoom.isClockwise();
            if (pathPointsClockwise) {
              areaHolesLists.push(currentPathPoints);
            } else {
              areaPointsLists.push(currentPathPoints);
            }
            if (areaPoints !== null || areaHoles !== null) {
              if (pathPointsClockwise !== reversed) {
                areaPartPoints = currentPathPoints.slice(0);
                areaPartPoints.reverse();
              }
              if (pathPointsClockwise) {
                if (areaHoles != null) {
                  areaHoles.push(areaPartPoints);
                }
              } else {
                if (areaPoints != null) {
                  areaPoints.push(areaPartPoints);
                }
              }
            }
          }
        }
        break;
    }
  }
  
  var areaPointsWithoutHoles = [];
  if ((areaHolesLists.length === 0) && areaPoints !== null) {
    areaPointsWithoutHoles.push.apply(areaPointsWithoutHoles, areaPoints);
  } else if ((areaPointsLists.length === 0) && !(areaHolesLists.length === 0)) {
    if (areaHoles !== null) {
      areaHoles.length = 0;
    }
  } else {
    var sortedAreaPoints;
    var subAreas = [];
    if (areaPointsLists.length > 1) {
      sortedAreaPoints = [];
      for (var i = 0; areaPointsLists.length !== 0; ) {
        var testedArea = areaPointsLists[i];
        var j = 0;
        for ( ; j < areaPointsLists.length; j++) {
          if (i !== j) {
            var testedAreaPoints = areaPointsLists[j];
            var subArea = null;
            for (var k = 0; k < subAreas.length; k++) {
              if (subAreas [k].key === testedAreaPoints) {
                subArea = subAreas [k].value;
                break;
              }
            }
            if (subArea == null) {
              subArea = new java.awt.geom.Area(this.getShape(testedAreaPoints.slice(0)));
              subAreas.push({key : testedAreaPoints, value : subArea});
            }
            if (subArea.contains(testedArea[0][0], testedArea[0][1])) {
              break;
            }
          }
        }
        if (j === areaPointsLists.length) {
          areaPointsLists.splice(i, 1);
          sortedAreaPoints.push(testedArea);
          i = 0;
        } else if (i < areaPointsLists.length) {
          i++;
        } else {
          i = 0;
        }
      }
    } else {
      sortedAreaPoints = areaPointsLists;
    }
    for (var i = sortedAreaPoints.length - 1; i >= 0; i--) {
      var enclosingAreaPartPoints = sortedAreaPoints[i];
      var subArea = null;
      for (var k = 0; k < subAreas.length; k++) {
        if (subAreas [k].key === enclosingAreaPartPoints) {
          subArea = subAreas [k].value;
          break;
        }
      }
      if (subArea === null) {
        subArea = new java.awt.geom.Area(this.getShape(enclosingAreaPartPoints.slice(0)));
      }
      var holesInArea = [];
      for (var k = 0; k < areaHolesLists.length; k++) {
        var holePoints = areaHolesLists[k];
        if (subArea.contains(holePoints[0][0], holePoints[0][1])) {
          holesInArea.push(holePoints);
        }
      }
      
      var lastEnclosingAreaPointJoiningHoles = null;
      while (holesInArea.length !== 0) {
        var minDistance = Number.MAX_VALUE;
        var closestHolePointsIndex = 0;
        var closestPointIndex = 0;
        var areaClosestPointIndex = 0;
        for (var j = 0; j < holesInArea.length && minDistance > 0; j++) {
          var holePoints = holesInArea[j];
          for (var k = 0; k < holePoints.length && minDistance > 0; k++) {
            for (var l = 0; l < enclosingAreaPartPoints.length && minDistance > 0; l++) {
              var enclosingAreaPartPoint = enclosingAreaPartPoints[l];
              var distance = java.awt.geom.Point2D.distanceSq(holePoints[k][0], holePoints[k][1], 
                  enclosingAreaPartPoint[0], enclosingAreaPartPoint[1]);
              if (distance < minDistance
                  && lastEnclosingAreaPointJoiningHoles !== enclosingAreaPartPoint) {
                minDistance = distance;
                closestHolePointsIndex = j;
                closestPointIndex = k;
                areaClosestPointIndex = l;
              }
            }
          }
        }
        var closestHolePoints = holesInArea[closestHolePointsIndex];
        if (minDistance !== 0) {
          lastEnclosingAreaPointJoiningHoles = enclosingAreaPartPoints[areaClosestPointIndex];
          enclosingAreaPartPoints.splice(areaClosestPointIndex, 0, lastEnclosingAreaPointJoiningHoles);
          enclosingAreaPartPoints.splice(++areaClosestPointIndex, 0, closestHolePoints[closestPointIndex]);
        }
        var lastPartPoints = closestHolePoints.slice(closestPointIndex, closestHolePoints.length);
        for (var k = 0; k < lastPartPoints.length; k++, areaClosestPointIndex++) {
          enclosingAreaPartPoints.splice(areaClosestPointIndex, 0, lastPartPoints[k]);
        }
        var points = closestHolePoints.slice(0, closestPointIndex);
        for (var k = 0; k < points.length; k++, areaClosestPointIndex++) {
          enclosingAreaPartPoints.splice(areaClosestPointIndex, 0, points[k]);
        }
        
        holesInArea.splice(closestHolePointsIndex, 1);
        areaHolesLists.splice(closestHolePoints, 1);
      }
    }
    for (var k = 0; k < sortedAreaPoints.length; k++) {
      var pathPoints = sortedAreaPoints[k];
      if (reversed) {
        pathPoints.reverse();
      }
      areaPointsWithoutHoles.push(pathPoints.slice(0));
    }
  }
  return areaPointsWithoutHoles;
}

/**
 * Returns <code>true</code> if the given arrays contain the same values. 
 * @private
 */
Object3DBranch.areModelRotationsEqual = function(rotation1, rotation2) {
  if (rotation1 === rotation2) {
    return true;
  } else if (rotation1 == null || rotation2 == null) {
    return false;
  } else {
    for (var i = 0; i < rotation1.length; i++) {
      for (var j = 0; j < rotation2.length; j++) {
        if (rotation1[i][j] !== rotation2 [i][j]) {
          return false;
        }
      }
    }
    return true;
  }
}
