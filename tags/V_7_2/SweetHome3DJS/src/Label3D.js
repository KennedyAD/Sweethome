/*
 * Label3D.js
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

// Requires scene3d.js
//          Object3DBranch.js


/**
 * Creates the 3D label matching the given home <code>label</code>.
 * @param {Label} label
 * @param {Home} home
 * @param {UserPreferences} [preferences]
 * @param {boolean} waitModelAndTextureLoadingEnd
 * @constructor
 * @extends Object3DBranch
 * @author Emmanuel Puybaret
 */
function Label3D(label, home, preferences, waitModelAndTextureLoadingEnd) {
  if (waitModelAndTextureLoadingEnd === undefined) {
    // 3 parameters
    waitModelAndTextureLoadingEnd = preferences;
    preferences = null;
  }
  Object3DBranch.call(this, label, home, preferences);
  
  this.setCapability(Group3D.ALLOW_CHILDREN_EXTEND);
  
  this.update();
}
Label3D.prototype = Object.create(Object3DBranch.prototype);
Label3D.prototype.constructor = Label3D;

Label3D.dummyContext = document.createElement("canvas").getContext("2d");

Label3D.prototype.update = function() {
  var label = this.getUserData();
  var pitch = label.getPitch();
  var style = label.getStyle();
  if (pitch != null 
      && style != null 
      && (label.getLevel() == null 
          || label.getLevel().isViewableAndVisible())) {
    var text = label.getText();
    var color = label.getColor();
    var outlineColor = label.getOutlineColor();
    if (text != this.text 
        || (style == null && this.style != null) 
        || (style != null && !style.equals(this.style)) 
        || (color == null && this.color != null) 
        || (color != null && color !== this.color)) {
      var fontStyle = "";
      if (style.isBold()) {
        fontStyle = "bold ";
      }
      if (style.isItalic()) {
        fontStyle += "italic ";
      }
      var fontName = style.getFontName();
      if (fontName === null) {
        fontName = "sans-serif";
      }
      
      var fontSize = 50; // Size to get a similar outline as in Java
      var fontHeight = fontSize; 
      if (["Times", "Serif", "Helvetica"].indexOf(fontName) === -1) {
        fontHeight *= 1.18;
      }
      var fontScale = fontSize / style.getFontSize();
      var descent = 0.23 * fontHeight;
      var font = fontStyle + " " + fontSize + "px " + fontName;
      Label3D.dummyContext.font = font;
      
      var lines = text.replace(/\n*$/, "").split("\n");
      var lineWidths = new Array(lines.length);
      var textWidth = -Infinity;
      var baseLineShift = -descent + fontHeight * lines.length;
      for (var i = 0; i < lines.length; i++) {
        lineWidths [i] = Label3D.dummyContext.measureText(lines [i]).width;
        if (style.isItalic()) {
          lineWidths [i] += fontHeight * 0.154;
        }
        textWidth = Math.max(lineWidths [i], textWidth);
      }
      
      var textHeight = fontHeight * lines.length;
      var textRatio = Math.sqrt(textWidth / textHeight);
      var textRatio = Math.sqrt(textWidth / textHeight);
      var width;
      var height;
      var scale;
      if (textRatio > 1) {
        width = Math.ceil(Math.max(255 * textRatio, Math.min(textWidth, 511 * textRatio)));
        scale = width / textWidth;
        height = Math.ceil(scale * textHeight);
      } else {
        height = Math.ceil(Math.max(255 * textRatio, Math.min(textHeight, 511 / textRatio)));
        scale = height / textHeight;
        width = Math.ceil(scale * textWidth);
      }
      if (width > 0 && height > 0) {
        var textureImage = document.createElement("canvas");
        textureImage.width = Appearance3D.getNextHighestPowerOfTwo(width) / 2;
        textureImage.height = Appearance3D.getNextHighestPowerOfTwo(height) / 2;
        textureImage.transparent = true;
        var context = textureImage.getContext("2d");
        
        context.scale(scale / width * textureImage.width, scale / height * textureImage.height);
        context.translate(0, baseLineShift);
        context.font = font;
        if (color !== null) {
          context.fillStyle = "rgb(" 
             + ((color >>> 16) & 0xFF) + ","
             + ((color >>> 8) & 0xFF) + ","
             + (color & 0xFF) + ")";
        }
        if (outlineColor !== null) {
          context.strokeStyle = "rgb(" 
              + ((outlineColor >>> 16) & 0xFF) + ","
              + ((outlineColor >>> 8) & 0xFF) + ","
              + (outlineColor & 0xFF) + ")"
        }
        for (var i = lines.length - 1; i >= 0; i--) {
          var line = lines [i];
          var translationX;
          if (style.getAlignment() === TextStyle.Alignment.LEFT) {
            translationX = 0;
          } else if (style.getAlignment() === TextStyle.Alignment.RIGHT) {
            translationX = textWidth - lineWidths [i];
          } else { // CENTER
            translationX = (textWidth - lineWidths [i]) / 2;
          }
          context.translate(translationX, 0);
          context.fillText(line, 0, 0);      
          if (outlineColor !== null) {
            // Fill then stroke to be able to view outline drawn in each character
            context.strokeText(line, 0, 0);
          }
          context.translate(-translationX, -fontHeight);
        }
        
        var scaleTransform = mat4.create();
        mat4.scale(scaleTransform, scaleTransform, vec3.fromValues(textWidth / fontScale, 1, textHeight / fontScale));
        this.baseLineTransform = mat4.create();
        var translationX;
        if (style.getAlignment() == TextStyle.Alignment.LEFT) {
          translationX = textWidth / 2;
        } else if (style.getAlignment() == TextStyle.Alignment.RIGHT) {
          translationX = -textWidth / 2;
        } else { // CENTER
          translationX = 0;
        }
        mat4.fromTranslation(this.baseLineTransform, vec3.fromValues(translationX / fontScale, 0, (textHeight / 2 - baseLineShift) / fontScale));
        mat4.mul(this.baseLineTransform, this.baseLineTransform, scaleTransform);
        this.texture = textureImage;
        this.text = text;
        this.style = style;
        this.color = color;
      } else {
        this.clear();
      }
    }
    if (this.texture !== null) {
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
        var shape = new Shape3D( 
            new IndexedTriangleArray3D(
               [vec3.fromValues(-0.5, 0, -0.5),
                vec3.fromValues(-0.5, 0, 0.5),
                vec3.fromValues(0.5, 0, 0.5),
                vec3.fromValues(0.5, 0, -0.5)],
               [0, 1, 2, 0, 2, 3],
               [vec2.fromValues(0., 0.),
                vec2.fromValues(1., 0.),
                vec2.fromValues(1., 1.),
                vec2.fromValues(0., 1.)],
               [3, 0, 1, 3, 1, 2],
               [vec3.fromValues(0., 1., 0.)],
               [0, 0, 0, 0, 0, 0]), appearance);
        transformGroup.addChild(shape);
        
        var selectionCoordinates = [vec3.fromValues(-0.5, 0, -0.5), vec3.fromValues(0.5, 0, -0.5),
                                    vec3.fromValues(0.5, 0, 0.5),   vec3.fromValues(-0.5, 0, 0.5)];
        var selectionGeometry = new IndexedLineArray3D(selectionCoordinates, [0, 1, 1, 2, 2, 3, 3, 0]);

        selectionAppearance = this.getSelectionAppearance();
        var selectionLinesShape = new Shape3D(selectionGeometry, selectionAppearance);
        selectionLinesShape.setPickable(false);
        transformGroup.addChild(selectionLinesShape);

        this.addChild(group);
      } else {
        transformGroup = this.getChild(0).getChild(0);
        var selectionLinesShape = transformGroup.getChild(1);
        selectionAppearance = selectionLinesShape.getAppearance();
      }
      
      var transformGroup = this.getChild(0).getChild(0);
      var pitchRotation = mat4.create();
      mat4.fromXRotation(pitchRotation, pitch);
      mat4.mul(pitchRotation, pitchRotation, this.baseLineTransform);
      var rotationY = mat4.create();
      mat4.fromYRotation(rotationY, -label.getAngle());
      mat4.mul(rotationY, rotationY, pitchRotation);
      var transform = mat4.create();
      mat4.fromTranslation(transform, vec3.fromValues(label.getX(), label.getGroundElevation() + (pitch == 0 && label.getElevation() < 0.1 ? 0.1 : 0), label.getY()));
      mat4.mul(transform, transform, rotationY);
      transformGroup.setTransform(transform);
      transformGroup.getChild(0).getAppearance().setTextureImage(this.texture);
      
      selectionAppearance.setVisible(this.getUserPreferences() != null
          && this.getUserPreferences().isEditingIn3DViewEnabled()
          && this.getHome().isItemSelected(label));
    }
  } else {
    this.clear();
  }
}

/**
 * Removes children and clear fields.
 * @private
 */
Label3D.prototype.clear = function () {
  this.removeAllChildren();
  this.text = null;
  this.style = null;
  this.color = null;
  this.texture = null;
  this.baseLineTransform = null;
}