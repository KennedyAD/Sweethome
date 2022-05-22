/*
 * ModelPreviewComponent.js
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

// Requires gl-matrix-min.js
//          scene3d.js
//          ModelManager.js
//          HTMLCanvas3D.js

/**
 * Creates a model preview component.
 * @param {string} canvasId  the ID of the 3D canvas where a model will be viewed
 * @param {boolean} pitchAndScaleChangeSupported if <code>true</code> the component 
 *           will handles events to let the user rotate the displayed model
 * @param {boolean} [transformationsChangeSupported] if <code>true</code> the component
 *           will handles events to let the user transform the displayed model
 * @constructor
 * @author Emmanuel Puybaret
 */
function ModelPreviewComponent(canvasId, pitchAndScaleChangeSupported, transformationsChangeSupported) {
  if (transformationsChangeSupported === undefined) {
    transformationsChangeSupported = false;
  }
  this.canvas3D = new HTMLCanvas3D(canvasId);
  this.pickedMaterial = null;
  this.setDefaultTransform();
  
  if (pitchAndScaleChangeSupported) {
    var ANGLE_FACTOR = 0.02;
    var ZOOM_FACTOR = 0.02;
    var previewComponent = this;
    var userActionsListener = {
        pointerTouches : {},
        boundedPitch : false,
        pickedTransformGroup : null,
        pivotCenterPixel : null,
        translationFromOrigin : null,
        translationToOrigin : null,
        modelBounds : null,
        
        mousePressed : function(ev) {
          userActionsListener.mousePressedInCanvas = true;
          previewComponent.stopRotationAnimation();
          var rect = previewComponent.getHTMLElement().getBoundingClientRect();
          userActionsListener.updatePickedMaterial(ev.clientX - rect.left, ev.clientY - rect.top);
          ev.stopPropagation();
        },
        windowMouseMoved : function(ev) {
          if (userActionsListener.mousePressedInCanvas) {
            var rect = previewComponent.getHTMLElement().getBoundingClientRect();
            userActionsListener.mouseDragged(ev.clientX - rect.left, ev.clientY - rect.top, ev.altKey);
          }
        },
        windowMouseReleased : function(ev) {
          userActionsListener.mousePressedInCanvas = false;
        },
        pointerPressed : function(ev) {
          if (ev.pointerType == "mouse") {
            userActionsListener.mousePressed(ev);
          } else {
            // Multi touch support for IE and Edge
            userActionsListener.copyPointerToTargetTouches(ev);
            userActionsListener.touchStarted(ev);
          }
        },
        pointerMousePressed : function(ev) {
          ev.stopPropagation();
        },
        windowPointerMoved : function(ev) {
          if (ev.pointerType == "mouse") {
            userActionsListener.windowMouseMoved(ev);
          } else {
            // Multi touch support for IE and Edge
            userActionsListener.copyPointerToTargetTouches(ev);
            userActionsListener.touchMoved(ev);
          }
        },
        windowPointerReleased : function(ev) {
          if (ev.pointerType == "mouse") {
            userActionsListener.windowMouseReleased(ev);
          } else {
            delete userActionsListener.pointerTouches [ev.pointerId];
            userActionsListener.touchEnded(ev);
          }
        },
        touchStarted : function(ev) {
          ev.preventDefault();
          if (ev.targetTouches.length == 1) {
            userActionsListener.mousePressedInCanvas = true;
            var rect = previewComponent.getHTMLElement().getBoundingClientRect();
            userActionsListener.updatePickedMaterial(ev.targetTouches [0].clientX - rect.left, ev.targetTouches [0].clientY - rect.top);
          } else if (ev.targetTouches.length == 2) {
            userActionsListener.distanceLastPinch = userActionsListener.distance(
                ev.targetTouches [0].clientX, ev.targetTouches [0].clientY, ev.targetTouches [1].clientX, ev.targetTouches [1].clientY);
          }
          previewComponent.stopRotationAnimation();
        },
        touchMoved : function(ev) {
          ev.preventDefault();
          if (ev.targetTouches.length == 1) {
            var rect = previewComponent.getHTMLElement().getBoundingClientRect();
            userActionsListener.mouseDragged(ev.targetTouches [0].clientX - rect.left, ev.targetTouches [0].clientY - rect.top, false);
          } else if (ev.targetTouches.length == 2) {
            var newDistance = userActionsListener.distance(
                ev.targetTouches [0].clientX, ev.targetTouches [0].clientY, ev.targetTouches [1].clientX, ev.targetTouches [1].clientY);
            var scale = userActionsListener.distanceLastPinch / newDistance;
            previewComponent.setViewScale(Math.max(0.5, Math.min(1.3, previewComponent.viewScale * scale)));
            userActionsListener.distanceLastPinch = newDistance;
          }
        },
        touchEnded : function(ev) {
          userActionsListener.mousePressedInCanvas = false;
        },
        copyPointerToTargetTouches : function (ev) {
          // Copy the IE and Edge pointer location to ev.targetTouches
          userActionsListener.pointerTouches [ev.pointerId] = {clientX : ev.clientX, clientY : ev.clientY};
          ev.targetTouches = [];
          for (var attribute in userActionsListener.pointerTouches) {
            if (userActionsListener.pointerTouches.hasOwnProperty(attribute)) {
              ev.targetTouches.push(userActionsListener.pointerTouches [attribute]);
            }
          }
        },
        distance : function(x1, y1, x2, y2) {
          return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        },
        mouseScrolled : function(ev) {
          ev.preventDefault();
          userActionsListener.zoomUpdater(ev.detail);
        },
        mouseWheelMoved : function(ev) {
          ev.preventDefault();
          userActionsListener.zoomUpdater(ev.deltaY !== undefined ? ev.deltaY / 2 : -ev.wheelDelta / 3);
        },
        visibilityChanged : function(ev) {
          if (document.visibilityState == "hidden") {
            previewComponent.stopRotationAnimation();
          }
        },
        updatePickedMaterial : function(x, y) {
          userActionsListener.xLastMove = x;
          userActionsListener.yLastMove = y;
          userActionsListener.pickedTransformGroup = null;
          userActionsListener.pivotCenterPixel = null;
          userActionsListener.boundedPitch = true;
          previewComponent.pickedMaterial = null;
          if (typeof HomeMaterial !== "undefined"
              && previewComponent.getModelNode() !== null) {
            var modelManager = ModelManager.getInstance();
            if (transformationsChangeSupported) {
              userActionsListener.boundedPitch = !modelManager.containsDeformableNode(previewComponent.getModelNode());
            }
            var rect = previewComponent.getHTMLElement().getBoundingClientRect();
            var shape = previewComponent.canvas3D.getClosestShapeAt(x + rect.left, y + rect.top);
            if (shape !== null) {
              var materials = modelManager.getMaterials(shape);
              if (materials.length > 0) {
                previewComponent.pickedMaterial = materials [0];
              }
              for (var node = shape; (node = node.getParent()) !== null; ) {
                if (node instanceof TransformGroup3D) {
                  userActionsListener.pickedTransformGroup = node;
                  break;
                }
              }
              if (transformationsChangeSupported
                  && userActionsListener.pickedTransformGroup != null) {
                // The pivot node is the first sibling node which is not a transform group
                var group = userActionsListener.pickedTransformGroup.getParent();
                var i = group.getChildren().indexOf(userActionsListener.pickedTransformGroup) - 1;
                while (i >= 0 && (group.getChild(i) instanceof TransformGroup3D)) {
                  i--;
                }
                if (i >= 0) {
                  var referenceNode = group.getChild(i);
                  var nodeCenter = modelManager.getCenter(referenceNode);
                  var nodeCenterAtScreen = vec3.clone(nodeCenter);
                  var pivotTransform = userActionsListener.getTransformBetweenNodes(referenceNode.getParent(), previewComponent.canvas3D.getScene(), false);
                  vec3.transformMat4(nodeCenterAtScreen, nodeCenterAtScreen, pivotTransform);
                  var transformToCanvas = previewComponent.canvas3D.getVirtualWorldToImageTransform(mat4.create());
                  var viewPlatformTransform = previewComponent.canvas3D.getViewPlatformTransform(mat4.create());
                  mat4.invert(viewPlatformTransform, viewPlatformTransform);
                  mat4.mul(transformToCanvas, transformToCanvas, viewPlatformTransform);
                  vec3.transformMat4(nodeCenterAtScreen, nodeCenterAtScreen, transformToCanvas);
                  userActionsListener.pivotCenterPixel = [(nodeCenterAtScreen [0] / 2 + 0.5) * rect.width, 
                      rect.height * (0.5 - nodeCenterAtScreen [1] / 2)];

                  var transformationName = userActionsListener.pickedTransformGroup.getName();
                  userActionsListener.translationFromOrigin = mat4.create();
                  userActionsListener.translationFromOrigin [12] = nodeCenter [0];
                  userActionsListener.translationFromOrigin [13] = nodeCenter [1];
                  userActionsListener.translationFromOrigin [14] = nodeCenter [2];

                  var pitchRotation = mat4.create();
                  mat4.fromXRotation(pitchRotation, previewComponent.viewPitch);
                  var yawRotation = mat4.create();
                  mat4.fromYRotation(yawRotation, previewComponent.viewYaw);

                  if (transformationName.indexOf(ModelManager.HINGE_PREFIX) === 0
                      || transformationName.indexOf(ModelManager.RAIL_PREFIX) === 0) {
                    var rotation = mat4.create();
                    var nodeSize = modelManager.getSize(referenceNode);
                    var modelRoot = userActionsListener.getModelRoot(referenceNode);
                    var transformBetweenRootAndModelNode = userActionsListener.getTransformBetweenNodes(modelRoot, previewComponent.getModelNode(), true);
                    vec3.transformMat4(nodeSize, nodeSize, transformBetweenRootAndModelNode);
                    nodeSize [0] = Math.abs(nodeSize [0]);
                    nodeSize [1] = Math.abs(nodeSize [1]);
                    nodeSize [2] = Math.abs(nodeSize [2]);

                    var modelRotationAtScreen = mat4.clone(yawRotation);
                    mat4.mul(modelRotationAtScreen, modelRotationAtScreen, pitchRotation);
                    mat4.invert(modelRotationAtScreen, modelRotationAtScreen);

                    // Set rotation around (or translation along) hinge largest dimension
                    // taking into account the direction of the axis at screen
                    if (nodeSize [1] > nodeSize [0] && nodeSize [1] > nodeSize [2]) {
                      var yAxisAtScreen = vec3.fromValues(0, 1, 0);
                      vec3.transformMat4(yAxisAtScreen, yAxisAtScreen, modelRotationAtScreen);
                      if (transformationName.indexOf(ModelManager.RAIL_PREFIX) === 0
                          ? yAxisAtScreen [1] > 0
                          : yAxisAtScreen [2] < 0) {
                        mat4.fromXRotation(rotation, Math.PI / 2);
                      } else {
                        mat4.fromXRotation(rotation, -Math.PI / 2);
                      }
                    } else if (nodeSize [2] > nodeSize [0] && nodeSize [2] > nodeSize [1]) {
                      var zAxisAtScreen = vec3.fromValues(0, 0, 1);
                      vec3.transformMat4(zAxisAtScreen, zAxisAtScreen, modelRotationAtScreen);
                      if (transformationName.indexOf(ModelManager.RAIL_PREFIX) === 0
                          ? zAxisAtScreen [0] > 0
                          : zAxisAtScreen [2] < 0) {
                        mat4.fromXRotation(rotation, Math.PI);
                      }
                    } else {
                      var xAxisAtScreen = vec3.fromValues(1, 0, 0);
                      vec3.transformMat4(xAxisAtScreen, xAxisAtScreen, modelRotationAtScreen);
                      if (transformationName.indexOf(ModelManager.RAIL_PREFIX) === 0
                          ? xAxisAtScreen [0] > 0
                          : xAxisAtScreen [2] < 0) {
                        mat4.fromYRotation(rotation, -Math.PI / 2);
                      } else {
                        mat4.fromYRotation(rotation, Math.PI / 2);
                      }
                    }

                    mat4.invert(transformBetweenRootAndModelNode, transformBetweenRootAndModelNode);
                    mat4.mul(userActionsListener.translationFromOrigin, userActionsListener.translationFromOrigin, transformBetweenRootAndModelNode);
                    mat4.mul(userActionsListener.translationFromOrigin, userActionsListener.translationFromOrigin, rotation);
                  } else {
                    // Set rotation in the screen plan for mannequin or ball handling
                    mat4.mul(userActionsListener.translationFromOrigin, userActionsListener.translationFromOrigin,
                        mat4.invert(mat4.create(), userActionsListener.getTransformBetweenNodes(referenceNode.getParent(), previewComponent.getModelNode(), true)));
                    mat4.mul(userActionsListener.translationFromOrigin, userActionsListener.translationFromOrigin, yawRotation);
                    mat4.mul(userActionsListener.translationFromOrigin, userActionsListener.translationFromOrigin, pitchRotation);
                  }

                  userActionsListener.translationToOrigin = mat4.invert(mat4.create(), userActionsListener.translationFromOrigin);
                  userActionsListener.modelBounds = modelManager.getBounds(previewComponent.getModelNode());
                }
              }
            }
          }
        },
        getTransformBetweenNodes : function(node, parent, ignoreTranslation) {
          var transform = mat4.create();
          if (node instanceof TransformGroup3D) {
            node.getTransform(transform);
            if (ignoreTranslation) {
              transform [12] = 0;
              transform [13] = 0;
              transform [14] = 0;
            }
          }
          if (node !== parent) {
            var nodeParent = node.getParent();
            if (nodeParent instanceof Group3D) {
              mat4.mul(transform, userActionsListener.getTransformBetweenNodes(nodeParent, parent, ignoreTranslation), transform);
            } else {
              throw new IllegalStateException("Can't retrieve node transform");
            }
          }
          return transform;
        },
        getModelRoot : function(node) {
          // Return the group parent which stores the model content (may be a group and not a branch group)
          if (node instanceof Group3D
              && node.getUserData() instanceof URLContent) {
            return node;
          } else if (node.getParent() != null) {
            return userActionsListener.getModelRoot(node.getParent());
          } else {
            return null;
          }
        },
        mouseDragged : function(x, y, altKeyPressed) {
          if (previewComponent.getModelNode() !== null) {
            if (userActionsListener.pivotCenterPixel !== null) {
              var transformationName = userActionsListener.pickedTransformGroup.getName();
              var additionalTransform = mat4.create();
              if (transformationName.indexOf(ModelManager.RAIL_PREFIX) === 0) {
                mat4.translate(additionalTransform, additionalTransform,
                    vec3.fromValues(0, 0,
                        userActionsListener.distance(x, y, userActionsListener.xLastMove, userActionsListener.yLastMove) * (userActionsListener.xLastMove - x < 0 ? -1 : (userActionsListener.xLastMove - x === 0 ? 0 : 1))));
              } else {
                var angle = Math.atan2(userActionsListener.pivotCenterPixel [1] - y, x - userActionsListener.pivotCenterPixel [0])
                    - Math.atan2(userActionsListener.pivotCenterPixel [1] - userActionsListener.yLastMove, userActionsListener.xLastMove - userActionsListener.pivotCenterPixel [0]);
                mat4.fromZRotation(additionalTransform, angle);
              }

              mat4.mul(additionalTransform, additionalTransform, userActionsListener.translationToOrigin);
              mat4.mul(additionalTransform, userActionsListener.translationFromOrigin, additionalTransform);

              var newTransform = mat4.create();
              userActionsListener.pickedTransformGroup.getTransform(newTransform);
              mat4.mul(newTransform, additionalTransform, newTransform);
              userActionsListener.pickedTransformGroup.setTransform(newTransform);

              // Update size with model normalization and main transformation
              var modelLower = vec3.create();
              userActionsListener.modelBounds.getLower(modelLower);
              var modelUpper = vec3.create();
              userActionsListener.modelBounds.getUpper(modelUpper);
              var modelManager = ModelManager.getInstance();
              var newBounds = modelManager.getBounds(previewComponent.getModelNode());
              var newLower = vec3.create();
              newBounds.getLower(newLower);
              var newUpper = vec3.create();
              newBounds.getUpper(newUpper);
              var previewedPiece = previewComponent.previewedPiece;
              previewedPiece.setX(previewedPiece.getX() + (newUpper [0] + newLower [0]) / 2 - (modelUpper [0] + modelLower [0]) / 2);
              previewedPiece.setY(previewedPiece.getY() + (newUpper [2] + newLower [2]) / 2 - (modelUpper [2] + modelLower [2]) / 2);
              previewedPiece.setElevation(previewedPiece.getElevation() + (newLower [1] - modelLower [1]));
              previewedPiece.setWidth(newUpper [0] - newLower [0]);
              previewedPiece.setDepth(newUpper [2] - newLower [2]);
              previewedPiece.setHeight(newUpper [1] - newLower [1]);
              userActionsListener.modelBounds = newBounds;

              // Update matching piece of furniture transformations array
              var transformations = previewComponent.previewedPiece.getModelTransformations();
              var transformationsArray = [];
              if (transformations !== null) {
                transformationsArray.push.apply(transformationsArray, transformations);
              }
              transformationName = transformationName.substring(0, transformationName.length - ModelManager.DEFORMABLE_TRANSFORM_GROUP_SUFFIX.length);
              for (var i = 0; i < transformationsArray.length; i++) {
                if (transformationName == transformationsArray [i].getName()) {
                  transformationsArray.splice(i, 1);
                  break;
                }
              }
              transformationsArray.push(new Transformation(transformationName, 
                  [[newTransform [0], newTransform [4], newTransform [8], newTransform [12]],
                   [newTransform [1], newTransform [5], newTransform [9], newTransform [13]],
                   [newTransform [2], newTransform [6], newTransform [10], newTransform [14]]]));
              previewComponent.previewedPiece.setModelTransformations(transformationsArray);
            } else {
              if (!altKeyPressed) {
                previewComponent.setViewYaw(previewComponent.viewYaw - ANGLE_FACTOR * (x - userActionsListener.xLastMove));
              }
              
              if (pitchAndScaleChangeSupported && altKeyPressed) {
                userActionsListener.zoomUpdater(y - userActionsListener.yLastMove);
              } else if (pitchAndScaleChangeSupported && !altKeyPressed) {
                var viewPitch = previewComponent.viewPitch - ANGLE_FACTOR * (y - userActionsListener.yLastMove);
                if (userActionsListener.boundedPitch) {
                  previewComponent.setViewPitch(Math.max(-Math.PI / 4, Math.min(0, viewPitch)));
                } else {
                  // Allow any rotation around the model
                  previewComponent.setViewPitch(viewPitch);
                }
              }
            }
          }
          userActionsListener.xLastMove = x;
          userActionsListener.yLastMove = y;
        },
        zoomUpdater : function(delta) {
          previewComponent.setViewScale(Math.max(0.5, Math.min(1.3, previewComponent.viewScale * Math.exp(delta * ZOOM_FACTOR))));
          previewComponent.stopRotationAnimation();
        }
      };
      
    if (OperatingSystem.isInternetExplorerOrLegacyEdge()
        && window.PointerEvent) {
      // Multi touch support for IE and Edge
      this.canvas3D.getHTMLElement().addEventListener("pointerdown", userActionsListener.pointerPressed);
      this.canvas3D.getHTMLElement().addEventListener("mousedown", userActionsListener.pointerMousePressed);
      // Add pointermove and pointerup event listeners to window to capture pointer events out of the canvas 
      window.addEventListener("pointermove", userActionsListener.windowPointerMoved);
      window.addEventListener("pointerup", userActionsListener.windowPointerReleased);
    } else {
      this.canvas3D.getHTMLElement().addEventListener("touchstart", userActionsListener.touchStarted);
      this.canvas3D.getHTMLElement().addEventListener("touchmove", userActionsListener.touchMoved);
      this.canvas3D.getHTMLElement().addEventListener("touchend", userActionsListener.touchEnded);
      this.canvas3D.getHTMLElement().addEventListener("mousedown", userActionsListener.mousePressed);
      // Add mousemove and mouseup event listeners to window to capture mouse events out of the canvas 
      window.addEventListener("mousemove", userActionsListener.windowMouseMoved);
      window.addEventListener("mouseup", userActionsListener.windowMouseReleased);
    }
    this.canvas3D.getHTMLElement().addEventListener("DOMMouseScroll", userActionsListener.mouseScrolled);
    this.canvas3D.getHTMLElement().addEventListener("mousewheel", userActionsListener.mouseWheelMoved);
    document.addEventListener("visibilitychange", userActionsListener.visibilityChanged);
    this.userActionsListener = userActionsListener;
  }
}

/**
 * Returns the HTML element used to view this component at screen.
 */
ModelPreviewComponent.prototype.getHTMLElement = function() {
  return this.canvas3D.getHTMLElement();
}

/**
 * @private
 */
ModelPreviewComponent.prototype.setDefaultTransform = function() {
  this.viewYaw = Math.PI / 8;
  this.viewPitch = -Math.PI / 16; 
  this.viewScale = 1;
  this.updateViewPlatformTransform();
}

/**
 * Returns the <code>yaw</code> angle used by view platform transform.
 * @return {number}
 * @protected
 */
ModelPreviewComponent.prototype.getViewYaw = function() {
  return this.viewYaw;
}

/**
 * Sets the <code>yaw</code> angle used by view platform transform.
 * @param {number} viewYaw
 * @protected
 */
ModelPreviewComponent.prototype.setViewYaw = function(viewYaw) {
  this.viewYaw = viewYaw;
  this.updateViewPlatformTransform();
}

/**
 * Returns the zoom factor used by view platform transform.
 * @return {number}
 * @protected
 */
ModelPreviewComponent.prototype.getViewScale = function() {
  return this.viewScale;
}

/**
 * Sets the zoom factor used by view platform transform.
 * @param {number} viewScale
 * @protected
 */
ModelPreviewComponent.prototype.setViewScale = function(viewScale) {
  this.viewScale = viewScale;
  this.updateViewPlatformTransform();
}

/**
 * Returns the <code>pitch</code> angle used by view platform transform.
 * @return {number}
 * @protected
 */
ModelPreviewComponent.prototype.getViewPitch = function() {
  return this.viewPitch;
}

/**
 * Sets the <code>pitch</code> angle used by view platform transform.
 * @param {number} viewPitch
 * @protected
 */
ModelPreviewComponent.prototype.setViewPitch = function(viewPitch) {
  this.viewPitch = viewPitch;
  this.updateViewPlatformTransform();
}

/**
 * @private
 */
ModelPreviewComponent.prototype.updateViewPlatformTransform = function() {
  // Default distance used to view a 2 unit wide scene
  var nominalDistanceToCenter = 1.4 / Math.tan(Math.PI / 8);  
  var translation = mat4.create();
  mat4.translate(translation, translation, vec3.fromValues(0, 0, nominalDistanceToCenter));
  var pitchRotation = mat4.create();
  mat4.rotateX(pitchRotation, pitchRotation, this.viewPitch);
  var yawRotation = mat4.create();
  mat4.rotateY(yawRotation, yawRotation, this.viewYaw);
  var scale = mat4.create();
  mat4.scale(scale, scale, vec3.fromValues(this.viewScale, this.viewScale, this.viewScale));
  
  mat4.mul(pitchRotation, pitchRotation, translation);
  mat4.mul(yawRotation, yawRotation, pitchRotation);
  mat4.mul(scale, scale, yawRotation);
  this.canvas3D.setViewPlatformTransform(scale);
}

/**
 * Loads and displays the given 3D model.
 * @param {URLContent} model a content with a URL pointing to a 3D model to parse and view
 * @param {boolean|Number} [modelFlags] if <code>true</code>, displays opposite faces
 * @param {Array} modelRotation  a 3x3 array describing how to transform the 3D model
 * @param {number} [width] optional width of the model
 * @param {number} [depth] optional width of the model
 * @param {number} [height] optional width of the model
 * @param onerror       callback called in case of error while reading the model
 * @param onprogression callback to follow the reading of the model
 */
ModelPreviewComponent.prototype.setModel = function(model, modelFlags, modelRotation,
                                                    width, depth, height,
                                                    onerror, onprogression) {
  if (depth === undefined 
      && height === undefined                                                     
      && onerror === undefined  
      && onprogression === undefined) {
    // Only model, modelRotation, onerror, onprogression parameters
    onprogression = width;
    onerror = modelRotation;
    modelRotation = modelFlags;
    modelFlags = 0;
    width = -1;
    depth = -1;
    height = -1;
  }
  this.model = model;
  this.canvas3D.clear();       
  if (typeof HomePieceOfFurniture !== "undefined") {
    this.previewedPiece = null;
  }
  if (model !== null) {
    var previewComponent = this;
    ModelManager.getInstance().loadModel(model,
        {
          modelUpdated : function(modelRoot) {
            if (model === previewComponent.model) {
              // Place model at origin in a box as wide as the canvas
              var modelManager = ModelManager.getInstance();
              var size = width < 0
                  ? modelManager.getSize(modelRoot)
                  : vec3.fromValues(width, height, depth); 
              var scaleFactor = 1.8 / Math.max(Math.max(size[0], size[2]), size[1]);
              
              var modelTransformGroup;
              if (typeof HomePieceOfFurniture !== "undefined") {
                if (typeof modelFlags === "boolean") {
                  modelFlags = modelFlags ? PieceOfFurniture.SHOW_BACK_FACE : 0;
                }
                previewComponent.previewedPiece = new HomePieceOfFurniture(
                    new CatalogPieceOfFurniture(null, null, model,
                        size[0], size[2], size[1], 0, false, null, null, 
                        modelRotation, modelFlags, null, null, 0, 0, 1, false));
                previewComponent.previewedPiece.setX(0);
                previewComponent.previewedPiece.setY(0);
                previewComponent.previewedPiece.setElevation(-previewComponent.previewedPiece.getHeight() / 2);
                
                var modelTransform = mat4.create();
                mat4.scale(modelTransform, modelTransform, vec3.fromValues(scaleFactor, scaleFactor, scaleFactor));
                modelTransformGroup = new TransformGroup3D(modelTransform);
                
                var piece3D = new HomePieceOfFurniture3D(previewComponent.previewedPiece, null, true);
                modelTransformGroup.addChild(piece3D);
              } else {
                var modelTransform = modelRotation 
                    ? modelManager.getRotationTransformation(modelRotation)  
                    : mat4.create();
                mat4.scale(modelTransform, modelTransform, vec3.fromValues(scaleFactor, scaleFactor, scaleFactor));
                mat4.scale(modelTransform, modelTransform, size);
                mat4.mul(modelTransform, modelTransform, modelManager.getNormalizedTransform(modelRoot, null, 1));
                
                modelTransformGroup = new TransformGroup3D(modelTransform); 
                modelTransformGroup.addChild(modelRoot);
              }
              
              var scene = new BranchGroup3D(); 
              scene.addChild(modelTransformGroup);
              // Add lights
              scene.addChild(new DirectionalLight3D(vec3.fromValues(0.9, 0.9, 0.9), vec3.fromValues(1.732, -0.8, -1)));
              scene.addChild(new DirectionalLight3D(vec3.fromValues(0.9, 0.9, 0.9), vec3.fromValues(-1.732, -0.8, -1))); 
              scene.addChild(new DirectionalLight3D(vec3.fromValues(0.9, 0.9, 0.9), vec3.fromValues(0, -0.8, 1)));
              scene.addChild(new DirectionalLight3D(vec3.fromValues(0.66, 0.66, 0.66), vec3.fromValues(0, 1, 0)));
              scene.addChild(new AmbientLight3D(vec3.fromValues(0.2, 0.2, 0.2))); 
              
              previewComponent.setDefaultTransform();
              previewComponent.canvas3D.setScene(scene, onprogression);
              previewComponent.canvas3D.updateViewportSize();
            }
          },
          modelError : function(err) {
            if (model === previewComponent.model
                && onerror !== undefined) {
              onerror(err);
            }
          },
          progression : function(part, info, percentage) {
            if (model === previewComponent.model
                && onprogression !== undefined) {
              onprogression(part, info, percentage);
            }
          }
        });
  }
}

/**
 * Returns the 3D model node displayed by this component.
 * @private
 */
ModelPreviewComponent.prototype.getModelNode = function() {
  var modelTransformGroup = this.canvas3D.getScene().getChild(0);
  if (modelTransformGroup.getChildren().length > 0) {
    return modelTransformGroup.getChild(0);
  } else {
    return null;
  }
}

/**
 * Sets the materials applied to 3D model.
 * @param {Array} materials
 */
ModelPreviewComponent.prototype.setModelMaterials = function(materials) {
  if (this.previewedPiece != null) {
    this.previewedPiece.setModelMaterials(materials);
    this.getModelNode().update();
  }
}

/**
 * Sets the transformations applied to 3D model
 * @param {Array} transformations
 */
ModelPreviewComponent.prototype.setModelTransformations = function(transformations) {
  if (this.previewedPiece != null) {
    this.previewedPiece.setModelTransformations(transformations);
    this.getModelNode().update();
  }
}

/**
 * @private
 */
ModelPreviewComponent.prototype.resetModelTransformations = function() {
  if (this.previewedPiece != null) {
    var modelManager = ModelManager.getInstance();
    var oldBounds = modelManager.getBounds(this.getModelNode());
    var oldLower = vec3.create();
    oldBounds.getLower(oldLower);
    var oldUpper = vec3.create();
    oldBounds.getUpper(oldUpper);

    this.resetTransformations(this.getModelNode());

    var newBounds = modelManager.getBounds(this.getModelNode());
    var newLower = vec3.create();
    newBounds.getLower(newLower);
    var newUpper = vec3.create();
    newBounds.getUpper(newUpper);
    this.previewedPiece.setX(this.previewedPiece.getX() + (newUpper [0] + newLower [0]) / 2 - (oldUpper [0] + oldLower [0]) / 2);
    this.previewedPiece.setY(this.previewedPiece.getY() + (newUpper [2] + newLower [2]) / 2 - (oldUpper [2] + oldLower [2]) / 2);
    this.previewedPiece.setElevation(this.previewedPiece.getElevation() + (newLower [1] - oldLower [1]));
    this.previewedPiece.setWidth(newUpper [0] - newLower [0]);
    this.previewedPiece.setDepth(newUpper [2] - newLower [2]);
    this.previewedPiece.setHeight(newUpper [1] - newLower [1]);
    this.previewedPiece.setModelTransformations(null);
  }
}

/**
 * @param {Node3D} node
 * @private
 */
ModelPreviewComponent.prototype.resetTransformations = function(node) {
  if (node instanceof Group3D) {
    if (node instanceof TransformGroup3D
        && node.getName() !== null
        && node.getName().lastIndexOf(ModelManager.DEFORMABLE_TRANSFORM_GROUP_SUFFIX) === node.getName().length - ModelManager.DEFORMABLE_TRANSFORM_GROUP_SUFFIX.length) {
      node.setTransform(mat4.create());
    }
    var children = node.getChildren();
    for (var i = 0; i < children.length; i++) {
      this.resetTransformations(children [i]);
    }
  }
}

/**
 * Returns the transformations applied to 3D model.
 * @return {Array}
 */
ModelPreviewComponent.prototype.getModelTransformations = function() {
  if (this.previewedPiece != null) {
    return this.previewedPiece.getModelTransformations();
  } else {
    return null;
  }
}

/**
 * Returns the abscissa of the 3D model.
 * @return {number}
 */
ModelPreviewComponent.prototype.getModelX = function() {
  return this.previewedPiece.getX();
}

/**
 * Returns the ordinate of the 3D model.
 * @return {number}
 */
ModelPreviewComponent.prototype.getModelY = function() {
  return this.previewedPiece.getY();
}

/**
 * Returns the elevation of the 3D model.
 * @return {number}
 */
ModelPreviewComponent.prototype.getModelElevation = function() {
  return this.previewedPiece.getElevation();
}

/**
 * Returns the width of the 3D model.
 * @return {number}
 */
ModelPreviewComponent.prototype.getModelWidth = function() {
  return this.previewedPiece.getWidth();
}

/**
 * Returns the depth of the 3D model.
 * @return {number}
 */
ModelPreviewComponent.prototype.getModelDepth = function() {
  return this.previewedPiece.getDepth();
}

/**
 * Returns the height of the 3D model.
 * @return {number}
 */
ModelPreviewComponent.prototype.getModelHeight = function() {
  return this.previewedPiece.getHeight();
}

/**
 * Returns the material of the shape last picked by the user.
 * @return {HomeMaterial}
 */
ModelPreviewComponent.prototype.getPickedMaterial = function() {
  return this.pickedMaterial;
}

/**
 * Stops rotation animation and clears buffers used by its canvas.
 */
ModelPreviewComponent.prototype.clear = function() {
  this.stopRotationAnimation();
  this.canvas3D.clear();
}

/**
 * Removes listeners bound to global objects and clears this component.
 * This method should be called to free resources in the browser when this component is not needed anymore.
 */
ModelPreviewComponent.prototype.dispose = function() {
  if (OperatingSystem.isInternetExplorerOrLegacyEdge()
      && window.PointerEvent) {
    window.removeEventListener("pointermove", this.userActionsListener.windowPointerMoved);
    window.removeEventListener("pointerup", this.userActionsListener.windowPointerReleased);
  } else {
    window.removeEventListener("mousemove", this.userActionsListener.windowMouseMoved);
    window.removeEventListener("mouseup", this.userActionsListener.windowMouseReleased);
  }
  document.removeEventListener("visibilitychange", this.userActionsListener.visibilityChanged);
  this.clear();
}

/**
 * Starts rotation animation.
 * @param {number} [roundsPerMinute]  the rotation speed in rounds per minute, 5rpm if missing
 */
ModelPreviewComponent.prototype.startRotationAnimation = function(roundsPerMinute) {
  this.roundsPerMinute = roundsPerMinute !== undefined ? roundsPerMinute : 5;
  if (!this.rotationAnimationStarted) {
    this.rotationAnimationStarted = true;
    this.animate();
  }
}

/**
 * @private
 */
ModelPreviewComponent.prototype.animate = function() {
  if (this.rotationAnimationStarted) {
    var now = Date.now();
    if (this.lastRotationAnimationTime !== undefined) {
      var angularSpeed = this.roundsPerMinute * 2 * Math.PI / 60000; 
      this.viewYaw += ((now - this.lastRotationAnimationTime) * angularSpeed) % (2 * Math.PI);
      this.updateViewPlatformTransform();
    }
    this.lastRotationAnimationTime = now;
    var previewComponent = this;
    requestAnimationFrame(
        function() {
          previewComponent.animate();
        });
  }
}

/**
 * Stops the running rotation animation.
 */
ModelPreviewComponent.prototype.stopRotationAnimation = function() {
  delete this.lastRotationAnimationTime;
  delete this.rotationAnimationStarted;
}
