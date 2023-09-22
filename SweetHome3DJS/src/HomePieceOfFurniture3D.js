/*
 * HomePieceOfFurniture3D.js
 *
 * Sweet Home 3D, Copyright (c) 2015-2020 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
//          ModelManager.js
//          HomeObject.js
//          HomePieceOfFurniture.js


/**
 * Creates the 3D piece matching the given home <code>piece</code>.
 * @param {HomePieceOfFurniture} piece
 * @param {Home} home
 * @param {UserPreferences} [preferences]
 * @param {boolean|function} waitModelAndTextureLoadingEnd
 * @constructor
 * @extends Object3DBranch
 * @author Emmanuel Puybaret
 */
function HomePieceOfFurniture3D(piece, home, preferences, waitModelAndTextureLoadingEnd) {
  if (waitModelAndTextureLoadingEnd === undefined) {
    // 3 parameters
    waitModelAndTextureLoadingEnd = preferences;
    preferences = null;
  }
  Object3DBranch.call(this, piece, home, preferences);
  
  this.createPieceOfFurnitureNode(piece, waitModelAndTextureLoadingEnd);
}
HomePieceOfFurniture3D.prototype = Object.create(Object3DBranch.prototype);
HomePieceOfFurniture3D.prototype.constructor = HomePieceOfFurniture3D;

HomePieceOfFurniture3D.DEFAULT_BOX = new Object();
HomePieceOfFurniture3D.SELECTION_BOX_GEOMETRY = new IndexedLineArray3D(
    [vec3.fromValues(-0.5, -0.5, -0.5),
     vec3.fromValues(0.5, -0.5, -0.5),
     vec3.fromValues(0.5, 0.5, -0.5),
     vec3.fromValues(-0.5, 0.5, -0.5),
     vec3.fromValues(-0.5, -0.5, 0.5),
     vec3.fromValues(0.5, -0.5, 0.5),
     vec3.fromValues(0.5, 0.5, 0.5),
     vec3.fromValues(-0.5, 0.5, 0.5)],
    [0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7, 4, 6, 5, 7]);

/**
 * Creates the piece node with its transform group and add it to the piece branch. 
 * @private
 */
HomePieceOfFurniture3D.prototype.createPieceOfFurnitureNode = function(piece, waitModelAndTextureLoadingEnd) {
  var pieceTransformGroup = new TransformGroup3D();
  pieceTransformGroup.setCapability(Group3D.ALLOW_CHILDREN_EXTEND);
  pieceTransformGroup.setCapability(TransformGroup3D.ALLOW_TRANSFORM_WRITE);
  this.addChild(pieceTransformGroup);
  
  this.loadPieceOfFurnitureModel(waitModelAndTextureLoadingEnd);
}

/**
 * @private
 */
HomePieceOfFurniture3D.prototype.loadPieceOfFurnitureModel = function(waitModelAndTextureLoadingEnd) {
  // While loading model use a temporary node that displays a white box  
  var waitBranch = new BranchGroup3D();
  var normalization = new TransformGroup3D();
  normalization.addChild(this.getModelBox(vec3.fromValues(1, 1, 1)));
  normalization.setUserData(PieceOfFurniture.IDENTITY_ROTATION);
  waitBranch.addChild(normalization);      
  
  var transformGroup = this.getChild(0);
  transformGroup.removeAllChildren();
  transformGroup.addChild(waitBranch);
  
  // Set piece model initial location, orientation and size      
  this.updatePieceOfFurnitureTransform();
  
  var piece = this.getUserData();
  // Store 3D model for possible future changes
  var model = piece.getModel();
  transformGroup.setUserData(model);
  // Load piece real 3D model
  var piece3D = this;
  ModelManager.getInstance().loadModel(model, 
      typeof waitModelAndTextureLoadingEnd == "function" ? false : waitModelAndTextureLoadingEnd, 
      {
        modelUpdated : function(modelRoot) {
          piece3D.updateModelTransformations(modelRoot);
  
          var modelRotation = piece.getModelRotation();
          // Add piece model scene to a normalized transform group
          var modelTransformGroup = ModelManager.getInstance().getNormalizedTransformGroup(
              modelRoot, modelRotation, 1, piece.isModelCenteredAtOrigin());
          // Store model rotation for possible future changes
          modelTransformGroup.setUserData(modelRotation);
          piece3D.updatePieceOfFurnitureModelNode(modelRoot, modelTransformGroup, waitModelAndTextureLoadingEnd);            
        },        
        modelError : function(ex) {
          // In case of problem use a default red box
          piece3D.updatePieceOfFurnitureModelNode(piece3D.getModelBox(vec3.fromValues(1, 0, 0)), 
              new TransformGroup3D(), waitModelAndTextureLoadingEnd);            
        }
      });
}

/**
 * Updates this branch from the home piece it manages.
 */
HomePieceOfFurniture3D.prototype.update = function() {
  if (this.isVisible()) {
    var piece = this.getUserData();
    var transformGroup = this.getChild(0);
    var normalization = transformGroup.getChild(0).getChild(0);
    if (piece.getModel().equals(transformGroup.getUserData())
        && Object3DBranch.areModelRotationsEqual(piece.getModelRotation(), normalization.getUserData())) {
      this.updatePieceOfFurnitureModelTransformations();
      this.updatePieceOfFurnitureTransform();
      this.updatePieceOfFurnitureColorAndTexture(false);      
    } else {
      this.loadPieceOfFurnitureModel(false);
    }
  }
  this.updatePieceOfFurnitureVisibility();      
}

/**
 * Sets the transformation applied to piece model to match
 * its location, its angle and its size.
 * @private
 */
HomePieceOfFurniture3D.prototype.updatePieceOfFurnitureTransform = function() {
  var transformGroup = this.getChild(0); 
  var pieceTransform = ModelManager.getInstance().getPieceOfFurnitureNormalizedModelTransformation(
      this.getUserData(), transformGroup.getChild(0));
  // Change model transformation      
  transformGroup.setTransform(pieceTransform);
}

/**
 * Sets the color and the texture applied to piece model.
 * @private
 */
HomePieceOfFurniture3D.prototype.updatePieceOfFurnitureColorAndTexture = function(waitTextureLoadingEnd) {
  var piece = this.getUserData();
  var modelNode = this.getModelNode();
  var modelChild = modelNode.getChild(0);
  if (modelChild.getUserData() !== HomePieceOfFurniture3D.DEFAULT_BOX) {
    if (piece.getColor() !== null) {
      this.setColorAndTexture(modelNode, piece.getColor(), null, piece.getShininess(), null, piece.isModelMirrored(), piece.getModelFlags(), false, 
          null, null, []);
    } else if (piece.getTexture() !== null) {
      this.setColorAndTexture(modelNode, null, piece.getTexture(), piece.getShininess(), null, piece.isModelMirrored(), piece.getModelFlags(), waitTextureLoadingEnd,
          vec3.fromValues(piece.getWidth(), piece.getHeight(), piece.getDepth()), ModelManager.getInstance().getBounds(modelChild),
          []);
    } else if (piece.getModelMaterials() !== null) {
      this.setColorAndTexture(modelNode, null, null, null, piece.getModelMaterials(), piece.isModelMirrored(), piece.getModelFlags(), waitTextureLoadingEnd,
          vec3.fromValues(piece.getWidth(), piece.getHeight(), piece.getDepth()), ModelManager.getInstance().getBounds(modelChild), 
          []);
    } else {
      // Set default material and texture of model
      this.setColorAndTexture(modelNode, null, null, piece.getShininess(), null, piece.isModelMirrored(), piece.getModelFlags(), false, null, null, []);
    }
  }
}

/**
 * Returns the node of the filled model.
 * @return {Node}
 * @private
 */
HomePieceOfFurniture3D.prototype.getModelNode = function() {
  var transformGroup = this.getChild(0);
  var branchGroup = transformGroup.getChild(0);
  return branchGroup.getChild(0);
}

/**
 * Returns the selection node of the model.
 * @return {Node}
 * @private
 */
HomePieceOfFurniture3D.prototype.getSelectionNode  = function() {
  var transformGroup = this.getChild(0);
  var branchGroup = transformGroup.getChild(0);
  if (branchGroup.getChildren().length > 1
      && branchGroup.getChild(1) instanceof Shape3D) {
    return branchGroup.getChild(1);
  } else {
    return null;
  }
}

/**
 * Sets whether this piece model is visible or not.
 * @private
 */
HomePieceOfFurniture3D.prototype.updatePieceOfFurnitureVisibility = function() {
  var piece = this.getUserData();
  // Update visibility of filled model shapes
  var visible = this.isVisible();
  var materials = piece.getColor() === null && piece.getTexture() === null
      ? piece.getModelMaterials()
      : null;
  this.setVisible(this.getModelNode(), visible, piece.getModelFlags(), materials);
  var selectionNode = this.getSelectionNode();
  if (selectionNode != null) {
    this.setVisible(selectionNode, this.getUserPreferences() != null
        && this.getUserPreferences().isEditingIn3DViewEnabled()
        && visible && this.getHome() != null
        && this.isSelected(this.getHome().getSelectedItems()), 0, null);
  }
}

/**
 * Sets the transformations applied to piece model parts.
 * @private 
 */
HomePieceOfFurniture3D.prototype.updatePieceOfFurnitureModelTransformations = function() {
  var piece = this.getUserData();
  var modelNode = this.getModelNode();
  if (modelNode.getChild(0).getUserData() !== HomePieceOfFurniture3D.DEFAULT_BOX
      && this.updateModelTransformations(this)) {
    // Update normalized transform group
    var modelTransform = ModelManager.getInstance().
        getNormalizedTransform(modelNode.getChild(0), piece.getModelRotation(), 1, piece.isModelCenteredAtOrigin());
    modelNode.setTransform(modelTransform);
  }
}

/**
 * Sets the transformations applied to <code>node</code> children
 * and returns <code>true</code> if a transformation was changed.
 * @param {Node3D} node
 * @private 
 */
HomePieceOfFurniture3D.prototype.updateModelTransformations = function(node) {
  var modifiedTransformations = false;
  var transformations = this.getUserData().getModelTransformations();
  var updatedTransformations = null;
  if (transformations !== null) {
    for (var i = 0; i < transformations.length; i++) {
      var transformation = transformations [i];
      var transformName = transformation.getName() + ModelManager.DEFORMABLE_TRANSFORM_GROUP_SUFFIX;
      if (updatedTransformations === null) {
        updatedTransformations = [];
      }
      updatedTransformations.push(transformName);
      modifiedTransformations |= this.updateTransformation(node, transformName, transformation.getMatrix());
    }
  }
  modifiedTransformations |= this.setNotUpdatedTranformationsToIdentity(node, updatedTransformations);
  return modifiedTransformations;
}

/**
 * Sets the transformation matrix of the children which user data is equal to <code>transformGroupName</code>.
 * @param {Node3D} node
 * @param {String} transformGroupName
 * @param {Array}  matrix
 * @private 
 */
HomePieceOfFurniture3D.prototype.updateTransformation = function(node, transformGroupName, matrix) {
  var modifiedTransformations = false;
  if (node instanceof Group3D) {
    if (node instanceof TransformGroup3D
        && transformGroupName == node.getName()) {
      var transformMatrix = mat4.create();
      node.getTransform(transformMatrix);
      if (matrix [0][0] !== transformMatrix [0]
          || matrix [0][1] !== transformMatrix [4]
          || matrix [0][2] !== transformMatrix [8]
          || matrix [0][3] !== transformMatrix [12]
          || matrix [1][0] !== transformMatrix [1]
          || matrix [1][1] !== transformMatrix [5]
          || matrix [1][2] !== transformMatrix [9]
          || matrix [1][3] !== transformMatrix [13]
          || matrix [2][0] !== transformMatrix [2]
          || matrix [2][1] !== transformMatrix [6]
          || matrix [2][2] !== transformMatrix [10]
          || matrix [2][3] !== transformMatrix [14]) {
        mat4.set(transformMatrix, 
            matrix[0][0], matrix[1][0], matrix[2][0], 0,
            matrix[0][1], matrix[1][1], matrix[2][1], 0,
            matrix[0][2], matrix[1][2], matrix[2][2], 0,
            matrix[0][3], matrix[1][3], matrix[2][3], 1);
        node.setTransform(transformMatrix);
        modifiedTransformations = true;
      }
    } else {
      var children = node.getChildren(); 
      for (var i = 0; i < children.length; i++) {
        modifiedTransformations |= this.updateTransformation(children [i], transformGroupName, matrix);
      }
    }
  }
  // No Link parsing

  return modifiedTransformations;
}

/**
 * Sets the transformation matrix of the children which user data is not in <code>updatedTransformations</code> to identity.
 * @param {Node3D} node
 * @param {string[]} updatedTransformations
 * @private 
 */
HomePieceOfFurniture3D.prototype.setNotUpdatedTranformationsToIdentity = function(node, updatedTransformations) {
  var modifiedTransformations = false;
  if (node instanceof Group3D) {
    if (node instanceof TransformGroup3D
        && node.getName() !== null
        && node.getName().indexOf(ModelManager.DEFORMABLE_TRANSFORM_GROUP_SUFFIX) >= 0
        && node.getName().indexOf(ModelManager.DEFORMABLE_TRANSFORM_GROUP_SUFFIX) === node.getName().length - ModelManager.DEFORMABLE_TRANSFORM_GROUP_SUFFIX.length
        && (updatedTransformations === null
            || updatedTransformations.indexOf(node.getName()) < 0)) {
      var group = node;
      var transform = mat4.create();
      group.getTransform(transform);
      if (!TransformGroup3D.isIdentity(transform)) {
        mat4.identity(transform);
        group.setTransform(transform);
        modifiedTransformations = true;
      }
    }
    var children = node.getChildren(); 
    for (var i = 0; i < children.length; i++) {
      modifiedTransformations |= this.setNotUpdatedTranformationsToIdentity(children [i], updatedTransformations);
    }
  }

  return modifiedTransformations;
}

/**
 * Updates transform group children with <code>modelMode</code>.
 * @private
 */
HomePieceOfFurniture3D.prototype.updatePieceOfFurnitureModelNode = function(modelNode, normalization, waitTextureLoadingEnd) {
  normalization.setCapability(TransformGroup3D.ALLOW_TRANSFORM_WRITE);
  normalization.addChild(modelNode);
  // Add model node to branch group
  var modelBranch = new BranchGroup3D();
  modelBranch.addChild(normalization);

  if (this.getHome() != null) {
    // Add selection box node
    var selectionBox = new Shape3D(HomePieceOfFurniture3D.SELECTION_BOX_GEOMETRY, this.getSelectionAppearance());
    selectionBox.setPickable(false);
    modelBranch.addChild(selectionBox);
  }
    
  var piece = this.getUserData();
  if (piece.isDoorOrWindow()) {
    this.setTransparentShapeNotPickable(modelNode);
  }

  var transformGroup = this.getChild(0);
  // Remove previous nodes    
  transformGroup.removeAllChildren();
  // Add model branch to live scene
  transformGroup.addChild(modelBranch);
  if (piece.isHorizontallyRotated()) {
    // Update piece transformation to ensure its center is correctly placed
    this.updatePieceOfFurnitureTransform();
  }

  // Flip normals if back faces of model are shown
  if (piece.isBackFaceShown()) {
    this.setBackFaceNormalFlip(this.getModelNode(), true);
  }
  // Update piece color, visibility and model mirror
  this.modifiedTexturesCount = 0;
  this.updatePieceOfFurnitureColorAndTexture(waitTextureLoadingEnd);      
  this.updatePieceOfFurnitureVisibility();
  // If no texture is customized, report loading end to waitTextureLoadingEnd
  if (this.modifiedTexturesCount === 0 
      && typeof waitTextureLoadingEnd == "function") {
    waitTextureLoadingEnd(this);
  }
}

/**
 * Returns a box that may replace model. 
 * @private
 */
HomePieceOfFurniture3D.prototype.getModelBox = function(color) {
  var boxAppearance = new Appearance3D();
  boxAppearance.setDiffuseColor(color);
  boxAppearance.setAmbientColor(vec3.scale(vec3.create(), color, 0.7));
  var box = new Box3D(0.5, 0.5, 0.5, boxAppearance);
  box.setUserData(HomePieceOfFurniture3D.DEFAULT_BOX);
  return box;
}

/**
 * Sets the material and texture attribute of all <code>Shape3D</code> children nodes of <code>node</code> 
 * from the given <code>color</code> and <code>texture</code>. 
 * @private
 */
HomePieceOfFurniture3D.prototype.setColorAndTexture = function(node, color, texture, shininess, 
                                                               materials, mirrored, modelFlags, waitTextureLoadingEnd, 
                                                               pieceSize, modelBounds, modifiedAppearances) {
  if (node instanceof Group3D) {
    // Set material and texture of all children
    var children = node.getChildren(); 
    for (var i = 0; i < children.length; i++) {
      this.setColorAndTexture(children [i], color, 
          texture, shininess, materials, mirrored, modelFlags, waitTextureLoadingEnd, 
          pieceSize, modelBounds, modifiedAppearances);
    }
  } else if (node instanceof Link3D) {
    this.setColorAndTexture(node.getSharedGroup(), color,
        texture, shininess, materials, mirrored, modelFlags, waitTextureLoadingEnd, 
        pieceSize, modelBounds, modifiedAppearances);
  } else if (node instanceof Shape3D) {
    var shape = node;
    var shapeName = shape.getName();
    var appearance = shape.getAppearance();
    if (appearance === null) {
      appearance = new Appearance3D();
      node.setAppearance(appearance);
    }
    
    // Check appearance wasn't already changed
    if (modifiedAppearances.indexOf(appearance) === -1) {
      var defaultAppearance = null;
      var colorModified = color !== null;
      var textureModified = !colorModified 
          && texture !== null;
      var materialModified = !colorModified
          && !textureModified
          && materials !== null && materials.length > 0;
      var appearanceModified = colorModified            
          || textureModified
          || materialModified
          || shininess !== null
          || mirrored
          || modelFlags != 0;
      var windowPane = shapeName !== null
          && shapeName.indexOf(ModelManager.WINDOW_PANE_SHAPE_PREFIX) === 0;
      if (!windowPane && appearanceModified            
          || windowPane && materialModified) {
        // Store shape default appearance 
        // (global color or texture change doesn't have effect on window panes)
        if (appearance.defaultAppearance === undefined) {
          appearance.defaultAppearance = appearance.clone();
        }
        defaultAppearance = appearance.defaultAppearance;
      }
      var materialShininess = 0.;
      if (appearanceModified) {
        materialShininess = shininess !== null
            ? shininess
            : (appearance.getSpecularColor() !== undefined
                && appearance.getShininess() !== undefined
                ? appearance.getShininess() / 128
                : 0);
      }
      if (colorModified) {
        // Change color only of shapes that are not window panes
        if (windowPane) {
          this.restoreDefaultAppearance(appearance, null);
        } else {
          // Change material if no default texture is displayed on the shape
          // (textures always keep the colors of their image file)
          this.updateAppearanceMaterial(appearance, color, color, materialShininess);
          if (defaultAppearance.getTransparency() !== undefined) {
            appearance.setTransparency(defaultAppearance.getTransparency());
          }
          if (defaultAppearance.getCullFace() !== undefined) {
            appearance.setCullFace(defaultAppearance.getCullFace());
          }
          appearance.setTextureCoordinatesGeneration(defaultAppearance.getTextureCoordinatesGeneration());
          appearance.setTextureImage(null);
        }
      } else if (textureModified) {            
        // Change texture only of shapes that are not window panes
        if (windowPane) {
          this.restoreDefaultAppearance(appearance, null);
        } else {
          appearance.setTextureCoordinatesGeneration(this.getTextureCoordinates(appearance, texture, pieceSize, modelBounds));
          this.updateTextureTransform(appearance, texture, true);
          this.updateAppearanceMaterial(appearance, Object3DBranch.DEFAULT_COLOR, Object3DBranch.DEFAULT_AMBIENT_COLOR, materialShininess);
          TextureManager.getInstance().loadTexture(texture.getImage(), 0,
              typeof waitTextureLoadingEnd == "function" ? false : waitTextureLoadingEnd,
              this.getTextureObserver(appearance, mirrored, modelFlags, waitTextureLoadingEnd));
        }
      } else if (materialModified) {
        var materialFound = false;
        // Apply color, texture and shininess of the material named as appearance name
        for (var i = 0; i < materials.length; i++) {
          var material = materials [i];
          if (material !== null
              && (material.getKey() != null
                      && material.getKey() == appearance.getName()
                  || material.getKey() == null
                      && material.getName() == appearance.getName())) {
            if (material.getShininess() !== null) {
              materialShininess = material.getShininess();
            }
            color = material.getColor();                
            if (color !== null
                && (color & 0xFF000000) != 0) {
              this.updateAppearanceMaterial(appearance, color, color, materialShininess);
              if (defaultAppearance.getTransparency() !== undefined) {
                appearance.setTransparency(defaultAppearance.getTransparency());
              }
              if (defaultAppearance.getCullFace() !== undefined) {
                appearance.setCullFace(defaultAppearance.getCullFace());
              }
              appearance.setTextureImage(null);
            } else if (color === null && material.getTexture() !== null) {
              var materialTexture = material.getTexture();
              if (this.isTexturesCoordinatesDefined(shape)) {
                this.restoreDefaultTextureCoordinatesGeneration(appearance);
                this.updateTextureTransform(appearance, materialTexture);
              } else {
                appearance.setTextureCoordinatesGeneration(this.getTextureCoordinates(appearance, material.getTexture(), pieceSize, modelBounds));
                this.updateTextureTransform(appearance, materialTexture, true);
              }
              this.updateAppearanceMaterial(appearance, Object3DBranch.DEFAULT_COLOR, Object3DBranch.DEFAULT_AMBIENT_COLOR, materialShininess);
              var materialTexture = material.getTexture();
              TextureManager.getInstance().loadTexture(materialTexture.getImage(), 0, 
                  typeof waitTextureLoadingEnd == "function" ? false : waitTextureLoadingEnd,
                  this.getTextureObserver(appearance, mirrored, modelFlags, waitTextureLoadingEnd));
            } else {
              this.restoreDefaultAppearance(appearance, material.getShininess());
            }
            materialFound = true;
            break;
          }
        }
        if (!materialFound) {
          this.restoreDefaultAppearance(appearance, null);
        }
      } else {
        this.restoreDefaultAppearance(appearance, shininess);
      }

      this.setCullFace(appearance, mirrored, (modelFlags & PieceOfFurniture.SHOW_BACK_FACE) != 0);

      // Store modified appearances to avoid changing their values more than once
      modifiedAppearances.push(appearance);
    }
  }
}

/**
 * Returns a texture observer that will update the given <code>appearance</code>.
 * @private
 */
HomePieceOfFurniture3D.prototype.getTextureObserver = function(appearance, mirrored, modelFlags, waitTextureLoadingEnd) {
  var piece3D = this;
  this.modifiedTexturesCount++;
  return {
      textureUpdated : function(textureImage) {
        if (TextureManager.getInstance().isTextureTransparent(textureImage)) {
          appearance.setCullFace(Appearance3D.CULL_NONE);
        } else {
          var defaultAppearance = appearance.defaultAppearance;
          if (defaultAppearance !== null
              && defaultAppearance.getCullFace() !== null) {
            appearance.setCullFace(defaultAppearance.getCullFace());
          }
        }
        if (appearance.getTextureImage() !== textureImage) {
          appearance.setTextureImage(textureImage);
        }

        piece3D.setCullFace(appearance, mirrored, (modelFlags & PieceOfFurniture.SHOW_BACK_FACE) != 0);
        
        // If all customized textures are loaded, report loading end to waitTextureLoadingEnd
        if (--piece3D.modifiedTexturesCount === 0 
            && typeof waitTextureLoadingEnd == "function") {
          waitTextureLoadingEnd(piece3D);
        }
      },
      textureError : function(error) {
        return this.textureUpdated(TextureManager.getInstance().getErrorImage());
      }
    };
}

/**
 * Returns a texture coordinates generator that wraps the given texture on front face.
 * @private
 */
HomePieceOfFurniture3D.prototype.getTextureCoordinates = function(appearance, texture, pieceSize, modelBounds) {
  var lower = vec3.create();
  modelBounds.getLower(lower);
  var upper = vec3.create();
  modelBounds.getUpper(upper);
  var minimumSize = ModelManager.getInstance().getMinimumSize();
  var sx = pieceSize [0] / Math.max(upper [0] - lower [0], minimumSize);
  var sw = -lower [0] * sx;
  var ty = pieceSize [1] / Math.max(upper [1] - lower [1], minimumSize);
  var tz = pieceSize [2] / Math.max(upper [2] - lower [2], minimumSize);
  var tw = -lower [1] * ty + upper [2] * tz;
  return {planeS : vec4.fromValues(sx, 0, 0, sw), 
          planeT : vec4.fromValues(0, ty, -tz, tw)};
}

/**
 * Returns <code>true</code> if all the geometries of the given <code>shape</code> define some texture coordinates.
 * @private
 */
HomePieceOfFurniture3D.prototype.isTexturesCoordinatesDefined = function(shape) {
  var geometries = shape.getGeometries();
  for (var i = 0, n = geometries.length; i < n; i++) {
    if (!geometries [i].hasTextureCoordinates()) {
      return false;
    }
  }
  return true;
}

/**
 * Sets the cull face of the given <code>appearance</code>.
 * @private
 */
HomePieceOfFurniture3D.prototype.setCullFace = function(appearance, mirrored, backFaceShown) {
  // Change cull face 
  if (appearance.getCullFace() !== Appearance3D.CULL_NONE) {
    var cullFace = appearance.getCullFace() !== undefined 
        ? appearance.getCullFace()
        : Appearance3D.CULL_BACK;
    var defaultCullFace = appearance.defaultCullFace; 
    if (defaultCullFace === undefined) {
      appearance.defaultCullFace = (defaultCullFace = cullFace);
    }
    appearance.setCullFace((mirrored ^ backFaceShown ^ defaultCullFace === Appearance3D.CULL_FRONT)
        ? Appearance3D.CULL_FRONT 
        : Appearance3D.CULL_BACK);
  }
}

/**
 * Restores default material and texture of the given <code>appearance</code>.
 * @private
 */
HomePieceOfFurniture3D.prototype.restoreDefaultAppearance = function(appearance, shininess) {
  if (appearance.defaultAppearance !== undefined) {
    var defaultAppearance = appearance.defaultAppearance;
    if (defaultAppearance.getAmbientColor() !== undefined) {
      appearance.setAmbientColor(defaultAppearance.getAmbientColor());
    }
    if (defaultAppearance.getDiffuseColor() !== undefined) {
      appearance.setDiffuseColor(defaultAppearance.getDiffuseColor());
      if (shininess !== null) {
        appearance.setSpecularColor(vec3.fromValues(shininess, shininess, shininess));
        appearance.setShininess(shininess * 128);
      } else {
        appearance.setSpecularColor(defaultAppearance.getSpecularColor());
        appearance.setShininess(defaultAppearance.getShininess());
      }
    }
    if (defaultAppearance.getTransparency() !== undefined) {
      appearance.setTransparency(defaultAppearance.getTransparency());
    }
    if (appearance.getCullFace() !== undefined) {
      appearance.setCullFace(defaultAppearance.getCullFace());
    }
    if (defaultAppearance.getTextureCoordinatesGeneration() !== undefined) {
      appearance.setTextureCoordinatesGeneration(defaultAppearance.getTextureCoordinatesGeneration());
    }
    if (appearance.getTextureImage() !== undefined) {
      appearance.setTextureImage(defaultAppearance.getTextureImage());
    }
  }
}

/**
 * Restores default texture coordinates generation of the given <code>appearance</code>.
 * @private
 */
HomePieceOfFurniture3D.prototype.restoreDefaultTextureCoordinatesGeneration = function(appearance) {
  if (appearance.defaultAppearance !== undefined) {
    var defaultAppearance = appearance.defaultAppearance;
    if (defaultAppearance.getTextureCoordinatesGeneration() !== undefined) {
      appearance.setTextureCoordinatesGeneration(defaultAppearance.getTextureCoordinatesGeneration());
    }
  }
}

/**
 * Sets the visible attribute of the <code>Shape3D</code> children nodes of <code>node</code>.
 * @private
 */
HomePieceOfFurniture3D.prototype.setVisible = function(node, visible, modelFlags, materials) {
  if (node instanceof Group3D) {
    // Set visibility of all children
    var children = node.getChildren(); 
    for (var i = 0; i < children.length; i++) {
      this.setVisible(children [i], visible, modelFlags, materials);
    }
  } else if (node instanceof Link3D) {
    this.setVisible(node.getSharedGroup(), visible, modelFlags, materials);
  } else if (node instanceof Shape3D) {
    var shape = node;
    var appearance = shape.getAppearance();
    if (appearance === null) {
      appearance = new Appearance3D();
      node.setAppearance(appearance);
    }
    var shapeName = shape.getName();
    if (visible 
        && shapeName !== null
        && shapeName.indexOf(ModelManager.LIGHT_SHAPE_PREFIX) === 0
        && this.getHome() !== null
        && !this.isSelected(this.getHome().getSelectedItems())
        && (typeof HomeLight === "undefined"
            || this.getUserData() instanceof HomeLight)) {
      // Don't display light sources shapes of unselected lights
      visible = false;
    }
    
    if (visible) {
      var appearanceName = appearance.getName();
      if (appearanceName != null) {
        if ((modelFlags & PieceOfFurniture.HIDE_EDGE_COLOR_MATERIAL) != 0
            && appearanceName.indexOf(ModelManager.EDGE_COLOR_MATERIAL_PREFIX) === 0) {
          visible = false;
        } else if (materials != null) {
          // Check whether the material color used by this shape isn't invisible 
          for (var i = 0; i < materials.length; i++) {
            var material = materials [i];
            if (material !== null 
                && material.getName() == appearanceName) {
              var color = material.getColor();  
              visible = color === null
                  || (color & 0xFF000000) !== 0;
              break;
            }
          }
        }
      }
    }  

    // Change visibility
    appearance.setVisible(visible);
  } 
} 

/**
 * Returns <code>true</code> if this 3D piece is visible.
 * @private
 */
HomePieceOfFurniture3D.prototype.isVisible = function() {
  var piece = this.getUserData();
  return piece.isVisible()
      && (piece.getLevel() === null
          || piece.getLevel().isViewableAndVisible());
}

/**
 * Returns <code>true</code> if this piece of furniture belongs to <code>selectedItems</code>.
 * @private
 */
HomePieceOfFurniture3D.prototype.isSelected = function(selectedItems) {
  for (var i = 0; i < selectedItems.length; i++) {
    var item = selectedItems [i];
    if (item === this.getUserData()
        || (item instanceof HomeFurnitureGroup
            && this.isSelected(item.getFurniture()))) {
      return true;
    }
  }
  return false;
}

/**
 * Sets whether all <code>Shape3D</code> children nodes of <code>node</code> should have 
 * their normal flipped or not.
 * Caution !!! Should be executed only once per instance 
 * @param backFaceNormalFlip <code>true</code> if normals should be flipped.
 * @private
 */
HomePieceOfFurniture3D.prototype.setBackFaceNormalFlip = function(node, backFaceNormalFlip) {
  if (node instanceof Group3D) {
    // Set back face normal flip of all children
    var children = node.getChildren(); 
    for (var i = 0; i < children.length; i++) {
      this.setBackFaceNormalFlip(children [i], backFaceNormalFlip);
    }
  } else if (node instanceof Link3D) {
    this.setBackFaceNormalFlip(node.getSharedGroup(), backFaceNormalFlip);
  } else if (node instanceof Shape3D) {
    var appearance = node.getAppearance();
    if (appearance === null) {
      appearance = new Appearance3D();
      node.setAppearance(appearance);
    }
    // Change back face normal flip
    appearance.setBackFaceNormalFlip(
        backFaceNormalFlip ^ appearance.getCullFace() === Appearance3D.CULL_FRONT);
  }
}

/**
 * Cancels the pickability of the <code>Shape3D</code> children nodes of <code>node</code> 
 * when it uses a transparent appearance. 
 * @private
 */
HomePieceOfFurniture3D.prototype.setTransparentShapeNotPickable = function(node) {
  if (node instanceof Group3D) {
    var children = node.getChildren(); 
    for (var i = 0; i < children.length; i++) {
      this.setTransparentShapeNotPickable(children [i]);
    }
  } else if (node instanceof Link3D) {
    this.setTransparentShapeNotPickable(node.getSharedGroup());
  } else if (node instanceof Shape3D) {
    var appearance = node.getAppearance();
    if (appearance !== null
        && appearance.getTransparency() > 0) {
      node.setPickable(false);
    }
  }
}

