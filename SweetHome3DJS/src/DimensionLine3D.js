/*
 * DimensionLine3D.js
 *
 * Sweet Home 3D, Copyright (c) 2023 Emmanuel PUYBARET / eTeks <info@eteks.com>
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


/**
 * Creates the 3D object matching the given dimension line.
 * @param {DimensionLine} dimensionLine
 * @param {Home} home
 * @param {UserPreferences} preferences
 * @param {boolean} waitForLoading
 * @constructor
 * @extends Object3DBranch
 * @author Emmanuel Puybaret
 */
function DimensionLine3D(dimensionLine, home, preferences, waitForLoading) {
  Object3DBranch.call(this, dimensionLine, home, preferences);
  
  this.dimensionLineRotations = null; 
  this.cameraChangeListener = null; 
  this.homeCameraListener = null; 
  this.dimensionLinesListener = null;
     
  this.setCapability(Group3D.ALLOW_CHILDREN_EXTEND);
  
  this.update();
}
DimensionLine3D.prototype = Object.create(Object3DBranch.prototype);
DimensionLine3D.prototype.constructor = DimensionLine3D;

DimensionLine3D.prototype.update = function() {
  var dimensionLine = this.getUserData();
  if (dimensionLine.isVisibleIn3D() 
      && (dimensionLine.getLevel() == null 
          || dimensionLine.getLevel().isViewableAndVisible())){
    var dimensionLineLength = dimensionLine.getLength();
    var lengthText = this.getUserPreferences().getLengthUnit().getFormat().format(dimensionLineLength);
    var lengthStyle = dimensionLine.getLengthStyle();
    if (lengthStyle == null){
      lengthStyle = this.getUserPreferences().getDefaultTextStyle(DimensionLine);
    }
    if (lengthStyle.getFontName() == null) {
      lengthStyle = lengthStyle.deriveStyle(this.getUserPreferences().getDefaultFontName());
    }
    var fontName = lengthStyle.getFontName();
    if (fontName === null) {
      fontName = "sans-serif";
    }
    var fontHeight = lengthStyle.getFontSize(); 
    if (["Times", "Serif", "Helvetica"].indexOf(fontName) === -1) {
      fontHeight *= 1.18;
    }
    var fontDescent = 0.23 * fontHeight;
    var fontAscent = fontHeight - fontDescent;
    var offset = dimensionLine.getOffset();
    var zTranslation = offset <= 0 
        ? -fontDescent - 1 
        : fontAscent + 1;
    var transformGroup;
    var linesShape;
    var linesAppearance;
    var selectionLinesShape;
    var selectionAppearance;
    if (this.getChildren().length === 0) {
      var group = new BranchGroup3D();
 
      transformGroup = new TransformGroup3D();
      transformGroup.setCapability(TransformGroup3D.ALLOW_TRANSFORM_WRITE);
      labelTransformGroup = new TransformGroup3D();
      labelTransformGroup.setCapability(TransformGroup3D.ALLOW_TRANSFORM_WRITE);
      transformGroup.addChild(labelTransformGroup);
  
      var lengthLabel = new Label(lengthText, 0, zTranslation);
      lengthLabel.setColor(dimensionLine.getColor());
      lengthLabel.setStyle(lengthStyle);
      lengthLabel.setPitch(0);
      var label3D = new Label3D(lengthLabel, null, false);
      labelTransformGroup.addChild(label3D);
  
      var linesShape = new Shape3D();
      linesAppearance = new Appearance3D();
      linesAppearance.setIllumination(0);
      linesShape.setAppearance(linesAppearance);
      linesShape.setCapability(Shape3D.ALLOW_GEOMETRY_WRITE);
      transformGroup.addChild(linesShape);
  
      selectionLinesShape = new Shape3D();
      selectionAppearance = this.getSelectionAppearance();
      selectionLinesShape.setAppearance(this.getSelectionAppearance());
      selectionLinesShape.setCapability(Shape3D.ALLOW_GEOMETRY_WRITE);
      selectionLinesShape.setPickable(false);
      transformGroup.addChild(selectionLinesShape);
  
      group.addChild(transformGroup);
      this.addChild(group);
    } else {
      transformGroup = this.getChild(0).getChild(0);
      var label3D = transformGroup.getChild(0).getChild(0);
      var lengthLabel = label3D.getUserData();
      lengthLabel.setText(lengthText);
      lengthLabel.setY(zTranslation);
      lengthLabel.setColor(dimensionLine.getColor());
      lengthLabel.setStyle(lengthStyle);
      label3D.update();
  
      linesShape = transformGroup.getChild(1);
      linesAppearance = linesShape.getAppearance();
  
      selectionLinesShape = transformGroup.getChild(2);
      selectionAppearance = selectionLinesShape.getAppearance();
    }
  
    var elevationStart = dimensionLine.getElevationStart();
    var startPointTransform = mat4.create();
    mat4.fromTranslation(startPointTransform, vec3.fromValues(
        dimensionLine.getXStart(), dimensionLine.getLevel() != null ? dimensionLine.getLevel().getElevation() + elevationStart : elevationStart, dimensionLine.getYStart()));
  
    if (this.dimensionLineRotations == null) {
      this.dimensionLineRotations = mat4.create();
    }
    var elevationAngle = Math.atan2(dimensionLine.getElevationEnd() - elevationStart,
        dimensionLine.getXEnd() - dimensionLine.getXStart());
    mat4.fromZRotation(this.dimensionLineRotations, elevationAngle);
    var rotation = mat4.create();
    var endsAngle = Math.atan2(dimensionLine.getYStart() - dimensionLine.getYEnd(),
        dimensionLine.getXEnd() - dimensionLine.getXStart());
    mat4.fromYRotation(rotation, endsAngle);
    mat4.mul(this.dimensionLineRotations, this.dimensionLineRotations, rotation);
    rotation = mat4.create();
    mat4.fromXRotation(rotation, -dimensionLine.getPitch());
    mat4.mul(this.dimensionLineRotations, this.dimensionLineRotations, rotation);
    mat4.mul(startPointTransform, startPointTransform, this.dimensionLineRotations);
  
    var offsetTransform = mat4.create();
    mat4.fromTranslation(offsetTransform, vec3.fromValues(0, 0, offset));
    mat4.mul(startPointTransform, startPointTransform, offsetTransform);
    transformGroup.setTransform(startPointTransform);
  
    // Handle dimension lines
    var endMarkSize = dimensionLine.getEndMarkSize() / 2;
    var linesCoordinates = new Array(7 * 2);
    linesCoordinates [0] = vec3.fromValues(0, 0, 0);
    linesCoordinates [1] = vec3.fromValues(dimensionLineLength, 0, 0);
    linesCoordinates [2] = vec3.fromValues(-endMarkSize, 0, endMarkSize);
    linesCoordinates [3] = vec3.fromValues(endMarkSize, 0, -endMarkSize);
    linesCoordinates [4] = vec3.fromValues(0, 0, endMarkSize);
    linesCoordinates [5] = vec3.fromValues(0, 0, -endMarkSize);
    linesCoordinates [6] = vec3.fromValues(dimensionLineLength - endMarkSize, 0, endMarkSize);
    linesCoordinates [7] = vec3.fromValues(dimensionLineLength + endMarkSize, 0, -endMarkSize);
    linesCoordinates [8] = vec3.fromValues(dimensionLineLength, 0, endMarkSize);
    linesCoordinates [9] = vec3.fromValues(dimensionLineLength, 0, -endMarkSize);
    linesCoordinates [10] = vec3.fromValues(0, 0, -offset);
    linesCoordinates [11] = vec3.fromValues(0, 0, -endMarkSize);
    linesCoordinates [12] = vec3.fromValues(dimensionLineLength, 0, -offset);
    linesCoordinates [13] = vec3.fromValues(dimensionLineLength, 0, -endMarkSize);
    var lines = new IndexedLineArray3D(linesCoordinates, 
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    linesShape.setGeometry(lines, 0);
    selectionLinesShape.setGeometry(lines, 0);
    this.updateAppearanceMaterial(linesAppearance, dimensionLine.getColor() != null ? dimensionLine.getColor() : 0, 0, 0);
  
    var home = this.getHome();
    var selectionVisible = this.getUserPreferences() != null
        && this.getUserPreferences().isEditingIn3DViewEnabled()
        && home.isItemSelected(dimensionLine);
    // As there's no line thickness in WebGL just display either shapes
    selectionAppearance.setVisible(selectionVisible);
    linesAppearance.setVisible(!selectionVisible)
  
    this.updateLengthLabelDirection(home.getCamera());
  
    var dimensionLine3D = this;
    if (this.cameraChangeListener == null) {
      // Add camera listener to update length label direction
      this.cameraChangeListener = function(ev) {
          var dimensionLine = dimensionLine3D.getUserData();
          if (dimensionLine3D.getChildren().length > 0
              && dimensionLine.isVisibleIn3D()
              && (dimensionLine.getLevel() == null
                  || dimensionLine.getLevel().isViewableAndVisible())) {
            var propertyName = ev.getPropertyName();
            if ("X" == propertyName
                || "Y" == propertyName
                || "Z" == propertyName) {
              dimensionLine3D.updateLengthLabelDirection(ev.getSource());
            }
          }
        };
      this.homeCameraListener = function(ev) {
          ev.getOldValue().removePropertyChangeListener(dimensionLine3D.cameraChangeListener);
          ev.getNewValue().addPropertyChangeListener(dimensionLine3D.cameraChangeListener);
          dimensionLine3D.updateLengthLabelDirection(home.getCamera());
        };
      this.dimensionLinesListener = function(ev) {
          if (ev.getType() === CollectionEvent.Type.DELETE
              && ev.getItem() === dimensionLine) {
            home.getCamera().removePropertyChangeListener(dimensionLine3D.cameraChangeListener);
            home.removePropertyChangeListener("CAMERA", dimensionLine3D.homeCameraListener);
            home.removeDimensionLinesListener(dimensionLine3D.dimensionLinesListener);
          }
        };
      home.getCamera().addPropertyChangeListener(this.cameraChangeListener);
      home.addPropertyChangeListener("CAMERA", this.homeCameraListener);
      home.addDimensionLinesListener(this.dimensionLinesListener);
    }
  } else {
    this.removeAllChildren();
    this.dimensionLineRotations = null;
    if (this.cameraChangeListener != null) {
      this.getHome().getCamera().removePropertyChangeListener(this.cameraChangeListener);
      this.getHome().removePropertyChangeListener("CAMERA", this.homeCameraListener);
      this.getHome().removeDimensionLinesListener(this.dimensionLinesListener);
      this.cameraChangeListener = null;
      this.homeCameraListener = null;
      this.dimensionLinesListener = null;
    }
  }
}

/**
 * Updates length label direction to ensure it's always visible in the direction of writing.
 * @param {Camera} camera
 * @private
 */
DimensionLine3D.prototype.updateLengthLabelDirection = function(camera) {
  var dimensionLine = this.getUserData();
  var dimensionLineNormal = vec3.fromValues(0, 1, 0);
  vec3.transformMat4(dimensionLineNormal, dimensionLineNormal, this.dimensionLineRotations);

  var cameraToDimensionLineDirection = vec3.fromValues((dimensionLine.getXEnd() + dimensionLine.getXStart()) / 2 - camera.getX(),
    (dimensionLine.getElevationEnd() + dimensionLine.getElevationStart()) / 2 - camera.getZ(),
    (dimensionLine.getYEnd() + dimensionLine.getYStart()) / 2 - camera.getY());

  var labelTransformGroup = this.getChild(0).getChild(0).getChild(0);
  var labelTransform = mat4.create();
  mat4.fromTranslation(labelTransform, vec3.fromValues(dimensionLine.getLength() / 2, 0, 0));
  var labelRotation = mat4.create();
  mat4.fromZRotation(labelRotation, vec3.dot(dimensionLineNormal, cameraToDimensionLineDirection) > 0 ? Math.PI : 0);
  mat4.mul(labelTransform, labelTransform, labelRotation);
  labelTransformGroup.setTransform(labelTransform);
}