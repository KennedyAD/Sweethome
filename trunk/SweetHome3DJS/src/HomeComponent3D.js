/*
 * HomeComponent3D.js
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

// Requires Home.js
//          HomeObject.js
//          HomePieceOfFurniture.js
//          scene3d.js
//          ModelManager.js
//          HomePieceOfFurniture3D.js
//          HomeController3D.js
//          HTMLCanvas3D.js

/**
 * Creates a 3D component that displays <code>home</code> walls, rooms and furniture.
 * @param {string} canvasId the id of the HTML canvas associated to this component
 * @param {Home} home the home to display in this component
 * @param {UserPreferences} preferences user preferences
 * @param {Object3DBranchFactory} object3dFactory a factory able to create 3D objects from <code>home</code> items
 *            or <code>null</code> to use default one.
 *            The <code>createObject3D</code> method of this factory is expected to return 
 *            an instance of {@link Object3DBranch} in current implementation.
 * @param {HomeController3D} controller the controller that manages modifications in <code>home</code> (optional).
 * @constructor   
 * @author Emmanuel Puybaret
 */
function HomeComponent3D(canvasId, home, preferences, object3dFactory, controller) {
  this.home = home;
  this.object3dFactory = object3dFactory !== null 
      ? object3dFactory
      : new Object3DBranchFactory();
  this.homeObjects = [];
  this.homeObjects3D = [];
  this.sceneLights = [];
  this.camera = null;
  this.windowSizeListener = null;
  // Listeners bound to home that updates 3D scene objects
  this.cameraChangeListener = null;
  this.homeCameraListener = null;
  this.groundChangeListener = null;
  this.backgroundChangeListener = null;
  this.lightColorListener = null;
  this.elevationChangeListener = null;
  this.wallsAlphaListener = null;
  this.levelListener = null;
  this.levelChangeListener = null;
  this.wallListener = null;
  this.wallChangeListener = null;  
  this.furnitureListener = null;
  this.furnitureChangeListener = null;
  this.roomListener = null;
  this.roomChangeListener = null;
  this.polylineChangeListener = null;
  this.polylineListener = null;
  this.labelListener = null;
  this.labelChangeListener = null;
  this.approximateHomeBoundsCache = null;
  this.homeHeightCache = null;
  this.createComponent3D(canvasId, preferences, controller);
}

/**
 * Creates the 3D canvas associated to the given <code>canvasId</code>.
 * @private 
 */
HomeComponent3D.prototype.createComponent3D = function(canvasId, preferences, controller) {
  this.canvas3D = new HTMLCanvas3D(canvasId);
  if (controller) {
    this.addMouseListeners(controller, this.canvas3D);
    if (preferences !== null) {
      this.navigationPanelId = this.createNavigationPanel(this.home, preferences, controller);
      this.setNavigationPanelVisible(preferences.isNavigationPanelVisible());
      this.revalidate();
      var component3D = this;
      preferences.addPropertyChangeListener("NAVIGATION_PANEL_VISIBLE",
          function(ev) {
            component3D.setNavigationPanelVisible(ev.getNewValue());
          });
    }
    this.createActions(controller);
    this.installKeyboardActions();
  }

  // Update field of view from current camera
  this.updateView(this.home.getCamera());
  // Update point of view from current camera
  this.updateViewPlatformTransform(this.home.getCamera(), false);
  // Add camera listeners to update later point of view from camera
  this.addCameraListeners();
  
  this.canvas3D.setScene(this.createSceneTree(true, false));
}

/**
 * Returns the HTML element used to view this component at screen.
 */
HomeComponent3D.prototype.getHTMLElement = function() {
  return this.canvas3D.getHTMLElement();
}

/**
 * Disposes the 3D shapes geometries displayed by this component. 
 * @package
 * @ignore
 */
HomeComponent3D.prototype.disposeGeometries = function() {
  if (this.home.structure) {
    ModelManager.getInstance().unloadModel(this.home.structure, true);
  }
  ModelManager.getInstance().disposeGeometries(this.canvas3D.getScene());
} 

/**
 * Updates 3D component aspect and navigation panel after a resize. 
 * @package
 * @ignore
 */
HomeComponent3D.prototype.revalidate = function() {
  var canvas = this.canvas3D.getHTMLElement();
  var canvasBounds = canvas.getBoundingClientRect();
  navigationPanelDiv = document.getElementById(this.navigationPanelId);
  if (navigationPanelDiv.style !== undefined) {
    navigationPanelDiv.style.left = (canvasBounds.left + window.pageXOffset) + "px";
    navigationPanelDiv.style.top = (canvasBounds.top + window.pageYOffset) + "px";
  }
  this.canvas3D.updateViewportSize();
}

/**
 * Returns the id of a component displayed as navigation panel upon this 3D view.
 * @private
 */
HomeComponent3D.prototype.createNavigationPanel = function(home, preferences, controller) {
  // Retrieve body elements with a data-simulated-key attribute
  var simulatedKeys = this.getSimulatedKeyElements(document.getElementsByTagName("body") [0]);
  var navigationPanelDiv = null;
  var innerHtml;
  try {
    innerHtml = preferences.getLocalizedString(HomeComponent3D, "navigationPanel.innerHTML");
  } catch (ex) {
    innerHtml = 
          '<img src="' + ZIPTools.getScriptFolder("gl-matrix-min.js") + '/navigationPanel.png"'
        + '     style="width: 56px; height:59px; margin:5px; user-drag: none; user-select: none; -moz-user-select: none; -webkit-user-drag: none; -webkit-user-select: none; -ms-user-select: none;"' 
        + '     usemap="#navigationPanelMap"/>'
        + '<map name="navigationPanelMap" id="navigationPanelMap">'
        + '  <area shape="poly" coords="28,4,33,8,33,19,22,19,22,8,29,4" data-simulated-key="UP" />'
        + '  <area shape="poly" coords="4,28,8,23,19,23,19,34,8,34,4,29" data-simulated-key="LEFT" />'
        + '  <area shape="poly" coords="28,54,33,50,33,39,22,39,22,50,29,54" data-simulated-key="DOWN" />'
        + '  <area shape="poly" coords="51,28,47,23,36,23,36,34,47,34,51,29" data-simulated-key="RIGHT" />'
        + '  <area shape="poly" coords="28,22,33,26,33,28,22,28,22,26,29,22" data-simulated-key="PAGE_UP" />'
        + '  <area shape="poly" coords="28,36,33,32,33,30,22,30,22,32,29,36" data-simulated-key="PAGE_DOWN" />'
        + '</map>';
  }
  var component3D = this;
  if (innerHtml !== null) {
    navigationPanelDiv = document.createElement("div");
    navigationPanelDiv.setAttribute("id", "div" + Math.floor(Math.random() * 1E10));
    navigationPanelDiv.style.position = "absolute";
    var canvas = this.canvas3D.getHTMLElement();
    window.addEventListener("resize", function(ev) {
        component3D.revalidate();
      });
    // Search the first existing zIndex among parents
    var parentZIndex = 0;
    for (var element = this.canvas3D.getHTMLElement();  
         element && element.style && isNaN(parentZIndex = parseInt(element.style.zIndex));
         element = element.parentElement) {
    }
    navigationPanelDiv.style.zIndex = isNaN(parentZIndex) ? "1" : (parentZIndex + 1).toString();
    navigationPanelDiv.style.visibility = "hidden";
    navigationPanelDiv.innerHTML = innerHtml;
    simulatedKeys.push.apply(simulatedKeys, this.getSimulatedKeyElements(navigationPanelDiv));
    var bodyElement = document.getElementsByTagName("body") [0];
    bodyElement.insertBefore(navigationPanelDiv, bodyElement.firstChild);
    // Redirect mouse clicks out of div elements to this component 
    navigationPanelDiv.addEventListener("mousedown", 
        function(ev) {
          component3D.userActionsListener.mousePressed(ev);
        });
  }
  
  this.simulatedElementMousePressedListener = function(ev) {
      var simulatedElement = ev.target;
      var repeatKeyAction = function() {
          var attribute = simulatedElement.getAttribute("data-simulated-key");
          var keyName = attribute.substring(attribute.indexOf(":") + 1);
          var keyStroke = ""; 
          if (ev.ctrlKey || keyName.indexOf("control ") != -1) {
            keyStroke += "control ";
          }
          if (ev.altKey || keyName.indexOf("alt ") != -1) {
            keyStroke += "alt ";
          }
          if (ev.metaKey || keyName.indexOf("meta ") != -1) {
            keyStroke += "meta ";
          }
          if (ev.shiftKey || keyName.indexOf("shift ") != -1) {
            keyStroke += "shift ";
          }
          keyStroke += "pressed " + keyName;
          component3D.callAction(ev, keyStroke);
        };
      var stopInterval = function(ev) {
          window.clearInterval(intervalId);
          simulatedElement.removeEventListener("mouseup", stopInterval);
          simulatedElement.removeEventListener("mouseleave", stopInterval);
          component3D.userActionsListener.windowMouseReleased(ev);
          ev.stopPropagation();
        };
      simulatedElement.addEventListener("mouseup", stopInterval);
      simulatedElement.addEventListener("mouseleave", stopInterval);
      repeatKeyAction();
      var intervalId = window.setInterval(repeatKeyAction, 80);
    };
  for (var i = 0; i < simulatedKeys.length; i++) {
    // Add a listener that simulates the given key and repeats it until mouse is released 
    simulatedKeys [i].addEventListener("mousedown", this.simulatedElementMousePressedListener);
  }

  if (navigationPanelDiv !== null) {
    return navigationPanelDiv.getAttribute("id");
  } else {
    return null;
  }
}

/**
 * Returns the child elements with a <code>data-simulated-key</code> attribute set.
 * @package
 * @ignore
 */
HomeComponent3D.prototype.getSimulatedKeyElements = function(element) {
  var simulatedKeyElements = [];
  if (element.hasChildNodes()) {
    for (var i = 0; i < element.childNodes.length; i++) {
      var child = element.childNodes [i];
      if (child.hasAttribute
          && child.hasAttribute("data-simulated-key")) {
        // Take into account only components with a data-simulated-key attribute 
        // that contains no colon or that starts with canvas id followed by a colon
        var simulatedKey = child.getAttribute("data-simulated-key");
        if (simulatedKey.indexOf(":") === -1
            || simulatedKey.indexOf(this.canvas3D.getHTMLElement().getAttribute("id") + ":") === 0) {
          simulatedKeyElements.push(child);
        }
      }
      simulatedKeyElements.push.apply(simulatedKeyElements, this.getSimulatedKeyElements(child));
    }
  }
  return simulatedKeyElements;
}

/**
 * Sets the image that will be drawn upon the 3D component shown by this component.
 * @private
 */
HomeComponent3D.prototype.setNavigationPanelVisible = function(visible) {
  if (this.navigationPanelId != null) {
    document.getElementById(this.navigationPanelId).style.visibility = visible ? "visible" : "hidden";
  }
}

/**
 * Remove all listeners bound to home that updates 3D scene objects.
 * @private 
 */
HomeComponent3D.prototype.removeHomeListeners = function() {
  this.home.removePropertyChangeListener("CAMERA", this.homeCameraListener);
  var homeEnvironment = this.home.getEnvironment();
  homeEnvironment.removePropertyChangeListener("SKY_COLOR", this.backgroundChangeListener);
  homeEnvironment.removePropertyChangeListener("SKY_TEXTURE", this.backgroundChangeListener);
  homeEnvironment.removePropertyChangeListener("GROUND_COLOR", this.backgroundChangeListener);
  homeEnvironment.removePropertyChangeListener("GROUND_TEXTURE", this.backgroundChangeListener);
  homeEnvironment.removePropertyChangeListener("GROUND_COLOR", this.groundChangeListener);
  homeEnvironment.removePropertyChangeListener("GROUND_TEXTURE", this.groundChangeListener);
  homeEnvironment.removePropertyChangeListener("BACKGROUND_IMAGE_VISIBLE_ON_GROUND_3D", this.groundChangeListener);
  this.home.removePropertyChangeListener("BACKGROUND_IMAGE", this.groundChangeListener);
  homeEnvironment.removePropertyChangeListener("LIGHT_COLOR", this.lightColorListener);
  homeEnvironment.removePropertyChangeListener("WALLS_ALPHA", this.wallsAlphaListener);
  this.home.getCamera().removePropertyChangeListener(this.cameraChangeListener);
  this.home.removePropertyChangeListener("CAMERA", this.elevationChangeListener);
  this.home.getCamera().removePropertyChangeListener(this.elevationChangeListener);
  this.home.removeLevelsListener(this.levelListener);
  var levels = this.home.getLevels();
  for (var i = 0; i < levels.length; i++) {
    levels[i].removePropertyChangeListener(this.levelChangeListener);
  }
  this.home.removeWallsListener(this.wallListener);
  var walls = this.home.getWalls();
  for (var i = 0; i < walls.length; i++) {
    walls[i].removePropertyChangeListener(this.wallChangeListener);
  }
  this.home.removeFurnitureListener(this.furnitureListener);
  var furniture = this.home.getFurniture();
  for (var i = 0; i < furniture.length; i++) {
    this.removePropertyChangeListener(furniture [i], this.furnitureChangeListener);
  }
  this.home.removeRoomsListener(this.roomListener);
  var rooms = this.home.getRooms();
  for (var i = 0; i < rooms.length; i++) {
    rooms[i].removePropertyChangeListener(this.roomChangeListener);
  }
  this.home.removePolylinesListener(this.polylineListener);
  var polylines = this.home.getPolylines();
  for (var i = 0; i < polylines.length; i++) {
    polylines[i].removePropertyChangeListener(this.polylineChangeListener);
  }
  this.home.removeLabelsListener(this.labelListener);
  var labels = this.home.getLabels();
  for (var i = 0; i < labels.length; i++) {
    labels[i].removePropertyChangeListener(this.labelChangeListener);
  }
}

/**
 * Remove all mouse listeners bound to the canvas3D and window.
 * @private 
 */
HomeComponent3D.prototype.removeMouseListeners = function(canvas3D) {
  if (this.userActionsListener) {
    if (OperatingSystem.isInternetExplorerOrLegacyEdge()
        && window.PointerEvent) {
      // Multi touch support for IE and Edge
      canvas3D.getHTMLElement().removeEventListener("pointerdown", this.userActionsListener.pointerPressed);
      canvas3D.getHTMLElement().removeEventListener("mousedown", this.userActionsListener.pointerMousePressed);
      window.removeEventListener("pointermove", this.userActionsListener.windowPointerMoved);
      window.removeEventListener("pointerup", this.userActionsListener.windowPointerReleased);
    } else {
      canvas3D.getHTMLElement().removeEventListener("touchstart", this.userActionsListener.touchStarted);
      canvas3D.getHTMLElement().removeEventListener("touchmove", this.userActionsListener.touchMoved);
      canvas3D.getHTMLElement().removeEventListener("touchend", this.userActionsListener.touchEnded);
      canvas3D.getHTMLElement().removeEventListener("mousedown", this.userActionsListener.mousePressed);
      window.removeEventListener("mousemove", this.userActionsListener.windowMouseMoved);
      window.removeEventListener("mouseup", this.userActionsListener.windowMouseReleased);
    }
    canvas3D.getHTMLElement().removeEventListener("contextmenu", this.userActionsListener.contextMenuDisplayed);
    canvas3D.getHTMLElement().removeEventListener("DOMMouseScroll", this.userActionsListener.mouseScrolled);
    canvas3D.getHTMLElement().removeEventListener("mousewheel", this.userActionsListener.mouseWheelMoved);
  }
}

/**
 * Frees listeners and canvas data.
 */
HomeComponent3D.prototype.dispose = function() {
  this.removeHomeListeners();
  this.removeMouseListeners(this.canvas3D);
  if (this.navigationPanelId != null) {
    window.removeEventListener("resize", this.windowSizeListener);
    var simulatedKeys = this.getSimulatedKeyElements(document.getElementsByTagName("body") [0]);
    for (var i = 0; i < simulatedKeys.length; i++) {
      simulatedKeys [i].removeEventListener("mousedown", this.simulatedElementMousePressedListener);
    }
    var navigationPanel = document.getElementById(this.navigationPanelId);
    navigationPanel.parentElement.removeChild(navigationPanel);
  }
  this.canvas3D.clear();
}

/**
 * Adds listeners to home to update point of view from current camera.
 * @private 
 */
HomeComponent3D.prototype.addCameraListeners = function() {
  var component3D = this;
  var home = this.home;
  this.cameraChangeListener = function(ev) {
      if (!this.updater) {
        // Update view transform later to let finish camera changes  
        var context = this;
        this.updater = function() {
            if (component3D.canvas3D) {
              component3D.updateView(home.getCamera());
              component3D.updateViewPlatformTransform(home.getCamera(), true);
            }
            delete context.updater;
          };
        setTimeout(this.updater, 0);
      }
    };
  home.getCamera().addPropertyChangeListener(this.cameraChangeListener);
  this.homeCameraListener = function(ev) {
      component3D.updateView(home.getCamera());
      component3D.updateViewPlatformTransform(home.getCamera(), false);
      // Add camera change listener to new active camera
      ev.getOldValue().removePropertyChangeListener(component3D.cameraChangeListener);
      home.getCamera().addPropertyChangeListener(component3D.cameraChangeListener);
    };
  this.home.addPropertyChangeListener("CAMERA", this.homeCameraListener);
}

/**
 * Updates <code>view</code> from <code>camera</code> field of view.
 * @private 
 */
HomeComponent3D.prototype.updateView = function(camera) {
  var fieldOfView = camera.getFieldOfView();
  if (fieldOfView === 0) {
    fieldOfView = Math.PI * 63 / 180;
  }
  this.canvas3D.setFieldOfView(fieldOfView);
  var frontClipDistance = 2.5;
  var frontBackDistanceRatio = 500000;
  if (this.canvas3D.getDepthBits() <= 16) {
    // It's recommended to keep ratio between back and front clip distances under 3000
    var frontBackDistanceRatio = 3000;
    var approximateHomeBounds = this.getApproximateHomeBounds();
    // If camera is out of home bounds, adjust the front clip distance to the distance to home bounds 
    if (approximateHomeBounds != null 
        && !approximateHomeBounds.intersect(vec3.fromValues(camera.getX(), camera.getY(), camera.getZ()))) {
      var distanceToClosestBoxSide = this.getDistanceToBox(camera.getX(), camera.getY(), camera.getZ(), approximateHomeBounds);
      if (!isNaN(distanceToClosestBoxSide)) {
        frontClipDistance = Math.max(frontClipDistance, 0.1 * distanceToClosestBoxSide);
      }
    }
  } else {
    var homeHeight = this.getHomeHeight();
    if (camera.getZ() > homeHeight) {
      frontClipDistance = Math.max(frontClipDistance, (camera.getZ() - homeHeight) / 10);
    }
  }    
  var canvasBounds = this.canvas3D.getHTMLElement().getBoundingClientRect();
  if (camera.getZ() > 0 && canvasBounds.width !== 0 && canvasBounds.height !== 0) {
    var halfVerticalFieldOfView = Math.atan(Math.tan(fieldOfView / 2) * canvasBounds.height / canvasBounds.width);
    var fieldOfViewBottomAngle = camera.getPitch() + halfVerticalFieldOfView;
    // If the horizon is above the frustrum bottom, take into account the distance to the ground 
    if (fieldOfViewBottomAngle > 0) {
      var distanceToGroundAtFieldOfViewBottomAngle = (camera.getZ() / Math.sin(fieldOfViewBottomAngle));
      frontClipDistance = Math.min(frontClipDistance, 0.35 * distanceToGroundAtFieldOfViewBottomAngle);
      if (frontClipDistance * frontBackDistanceRatio < distanceToGroundAtFieldOfViewBottomAngle) {
        // Ensure the ground is always visible at the back clip distance
        frontClipDistance = distanceToGroundAtFieldOfViewBottomAngle / frontBackDistanceRatio;
      }
    }
  }
  // Update front and back clip distance 
  this.canvas3D.setFrontClipDistance(frontClipDistance);
  this.canvas3D.setBackClipDistance(frontClipDistance * frontBackDistanceRatio);
}

/**
 * Returns quickly computed bounds of the objects in home.
 * @private 
 */
HomeComponent3D.prototype.getApproximateHomeBounds = function() {
  if (this.approximateHomeBoundsCache === null) {
    var approximateHomeBounds = null;
    var furniture = this.home.getFurniture();
    for (var i = 0; i < furniture.length; i++) {
      var piece = furniture[i];
      if (piece.isVisible() 
          && (piece.getLevel() === null 
              || piece.getLevel().isViewable())) {
        var halfMaxDimension = Math.max(piece.getWidthInPlan(), piece.getDepthInPlan()) / 2;
        var elevation = piece.getGroundElevation();
        var pieceLocation = vec3.fromValues(
            piece.getX() - halfMaxDimension, piece.getY() - halfMaxDimension, elevation);
        if (approximateHomeBounds === null) {
          approximateHomeBounds = new BoundingBox3D(pieceLocation, pieceLocation);
        } else {
          approximateHomeBounds.combine(pieceLocation);
        }
        approximateHomeBounds.combine(vec3.fromValues(
            piece.getX() + halfMaxDimension, piece.getY() + halfMaxDimension, elevation + piece.getHeightInPlan()));
      }
    }
    var walls = this.home.getWalls();
    for (var i = 0; i < walls.length; i++) {
      var wall = walls[i];
      if (wall.getLevel() === null 
          || wall.getLevel().isViewable()) {
        var startPoint = vec3.fromValues(wall.getXStart(), wall.getYStart(), 
            wall.getLevel() !== null ? wall.getLevel().getElevation() : 0);
        if (approximateHomeBounds === null) {
          approximateHomeBounds = new BoundingBox3D(startPoint, startPoint);
        } else {
          approximateHomeBounds.combine(startPoint);
        }
        approximateHomeBounds.combine(vec3.fromValues(wall.getXEnd(), wall.getYEnd(), 
            startPoint.z + (wall.getHeight() !== null ? wall.getHeight() : this.home.getWallHeight())));
      }
    }
    var rooms = this.home.getRooms();
    for (var i = 0; i < rooms.length; i++) {
      var room = rooms[i];
      if (room.getLevel() === null || room.getLevel().isViewable()) {
        var center = vec3.fromValues(room.getXCenter(), room.getYCenter(), 
            room.getLevel() !== null ? room.getLevel().getElevation() : 0);
        if (approximateHomeBounds === null) {
          approximateHomeBounds = new BoundingBox3D(center, center);
        } else {
          approximateHomeBounds.combine(center);
        }
      }
    }
    var labels = this.home.getLabels();
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      if ((label.getLevel() === null 
            || label.getLevel().isViewable()) 
          && label.getPitch() !== null) {
        var center = vec3.fromValues(label.getX(), label.getY(), label.getGroundElevation());
        if (approximateHomeBounds == null) {
          approximateHomeBounds = new BoundingBox3D(center, center);
        } else {
          approximateHomeBounds.combine(center);
        }
      }
    }
    this.approximateHomeBoundsCache = approximateHomeBounds;
  }
  return this.approximateHomeBoundsCache;
}

/**
 * Returns the distance between the point at the given coordinates (x,y,z) 
 * and the closest side of <code>box</code>.
 * @private
 */
HomeComponent3D.prototype.getDistanceToBox = function (x, y, z, box) {
  var point = vec3.fromValues(x, y, z);
  var lower = vec3.create();
  box.getLower(lower);
  var upper = vec3.create();
  box.getUpper(upper);
  var boxVertices = [
      vec3.fromValues(lower[0], lower[1], lower[2]), 
      vec3.fromValues(upper[0], lower[1], lower[2]), 
      vec3.fromValues(lower[0], upper[1], lower[2]), 
      vec3.fromValues(upper[0], upper[1], lower[2]), 
      vec3.fromValues(lower[0], lower[1], upper[2]), 
      vec3.fromValues(upper[0], lower[1], upper[2]), 
      vec3.fromValues(lower[0], upper[1], upper[2]), 
      vec3.fromValues(upper[0], upper[1], upper[2])];
  var distancesToVertex = new Array(boxVertices.length);
  for (var i = 0; i < distancesToVertex.length; i++) {
    distancesToVertex[i] = vec3.squaredDistance(point, boxVertices[i]);
  }
  var distancesToSide = [
      this.getDistanceToSide(point, boxVertices, distancesToVertex, 0, 1, 3, 2, 2), 
      this.getDistanceToSide(point, boxVertices, distancesToVertex, 0, 1, 5, 4, 1), 
      this.getDistanceToSide(point, boxVertices, distancesToVertex, 0, 2, 6, 4, 0), 
      this.getDistanceToSide(point, boxVertices, distancesToVertex, 4, 5, 7, 6, 2), 
      this.getDistanceToSide(point, boxVertices, distancesToVertex, 2, 3, 7, 6, 1), 
      this.getDistanceToSide(point, boxVertices, distancesToVertex, 1, 3, 7, 5, 0)];
  var distance = distancesToSide[0];
  for (var i = 1; i < distancesToSide.length; i++) {
    distance = Math.min(distance, distancesToSide[i]);
  }
  return distance;
}

/**
 * Returns the distance between the given <code>point</code> and the plane defined by four vertices.
 * @private
 */
HomeComponent3D.prototype.getDistanceToSide = function (point, boxVertices, distancesSquaredToVertex, 
                                                        index1, index2, index3, index4, axis) {
  switch (axis) {
    case 0:
      if (point[1] <= boxVertices[index1][1]) {
        if (point[2] <= boxVertices[index1][2]) {
          return Math.sqrt(distancesSquaredToVertex[index1]);
        } else if (point[2] >= boxVertices[index4][2]) {
          return Math.sqrt(distancesSquaredToVertex[index4]);
        } else {
          return this.getDistanceToLine(point, boxVertices[index1], boxVertices[index4]);
        }
      } else if (point[1] >= boxVertices[index2][1]) {
        if (point[2] <= boxVertices[index2][2]) {
          return Math.sqrt(distancesSquaredToVertex[index2]);
        } else if (point[2] >= boxVertices[index3][2]) {
          return Math.sqrt(distancesSquaredToVertex[index3]);
        } else {
          return this.getDistanceToLine(point, boxVertices[index2], boxVertices[index3]);
        }
      } else if (point[2] <= boxVertices[index1][2]) {
        return this.getDistanceToLine(point, boxVertices[index1], boxVertices[index2]);
      } else if (point[2] >= boxVertices[index4][2]) {
        return this.getDistanceToLine(point, boxVertices[index3], boxVertices[index4]);
      }
      break;
    case 1 : // Normal along y axis
      if (point[0] <= boxVertices[index1][0]) {
        if (point[2] <= boxVertices[index1][2]) {
          return Math.sqrt(distancesSquaredToVertex[index1]);
        } else if (point[2] >= boxVertices[index4][2]) {
          return Math.sqrt(distancesSquaredToVertex[index4]);
        } else {
          return this.getDistanceToLine(point, boxVertices[index1], boxVertices[index4]);
        }
      } else if (point[0] >= boxVertices[index2][0]) {
        if (point[2] <= boxVertices[index2][2]) {
          return Math.sqrt(distancesSquaredToVertex[index2]);
        } else if (point[2] >= boxVertices[index3][2]) {
          return Math.sqrt(distancesSquaredToVertex[index3]);
        } else {
          return this.getDistanceToLine(point, boxVertices[index2], boxVertices[index3]);
        }
      } else if (point[2] <= boxVertices[index1][2]) {
        return this.getDistanceToLine(point, boxVertices[index1], boxVertices[index2]);
      } else if (point[2] >= boxVertices[index4][2]) {
        return this.getDistanceToLine(point, boxVertices[index3], boxVertices[index4]);
      }
      break;
    case 2 : // Normal along z axis
      if (point[0] <= boxVertices[index1][0]) {
        if (point[1] <= boxVertices[index1][1]) {
          return Math.sqrt(distancesSquaredToVertex[index1]);
        } else if (point[1] >= boxVertices[index4][1]) {
          return Math.sqrt(distancesSquaredToVertex[index4]);
        } else {
          return this.getDistanceToLine(point, boxVertices[index1], boxVertices[index4]);
        }
      } else if (point[0] >= boxVertices[index2][0]) {
        if (point[1] <= boxVertices[index2][1]) {
          return Math.sqrt(distancesSquaredToVertex[index2]);
        } else if (point[1] >= boxVertices[index3][1]) {
          return Math.sqrt(distancesSquaredToVertex[index3]);
        } else {
          return this.getDistanceToLine(point, boxVertices[index2], boxVertices[index3]);
        }
      } else if (point[1] <= boxVertices[index1][1]) {
        return this.getDistanceToLine(point, boxVertices[index1], boxVertices[index2]);
      } else if (point[1] >= boxVertices[index4][1]) {
        return this.getDistanceToLine(point, boxVertices[index3], boxVertices[index4]);
      }
      break;
  }

  // Return distance to plane 
  // from https://fr.wikipedia.org/wiki/Distance_d%27un_point_à_un_plan 
  var vector1 = vec3.fromValues(boxVertices[index2][0] - boxVertices[index1][0], 
      boxVertices[index2][1] - boxVertices[index1][1], 
      boxVertices[index2][2] - boxVertices[index1][2]);
  var vector2 = vec3.fromValues(boxVertices[index3][0] - boxVertices[index1][0], 
      boxVertices[index3][1] - boxVertices[index1][1], 
      boxVertices[index3][2] - boxVertices[index1][2]);
  var normal = vec3.create();
  vec3.cross(normal, vector1, vector2);
  return Math.abs(vec3.dot(normal, vec3.fromValues(boxVertices[index1][0] - point[0], boxVertices[index1][1] - point[1], boxVertices[index1][2] - point[2]))) / vec3.length(normal);
}

/**
 * Returns the distance between the given <code>point</code> and the line defined by two points.
 * @private
 */
HomeComponent3D.prototype.getDistanceToLine = function (point, point1, point2) {
  // From https://fr.wikipedia.org/wiki/Distance_d%27un_point_à_une_droite#Dans_l.27espace
  var lineDirection = vec3.fromValues(point2[0] - point1[0], point2[1] - point1[1], point2[2] - point1[2]);
  var vector = vec3.fromValues(point[0] - point1[0], point[1] - point1[1], point[2] - point1[2]);
  var crossProduct = vec3.create();
  vec3.cross(crossProduct, lineDirection, vector);
  return vec3.length(crossProduct) / vec3.length(lineDirection);
}

/**
 * Returns quickly computed height of the home.
 * @private
 */
HomeComponent3D.prototype.getHomeHeight = function() {
  if (this.homeHeightCache === null) {
    var homeHeight = 0;
    var furniture = this.home.getFurniture();
    for (var i = 0; i < furniture.length; i++) {
      var piece = furniture[i];
      if (piece.isVisible()
          && (piece.getLevel() == null
              || piece.getLevel().isViewable())) {
        homeHeight = Math.max(homeHeight, piece.getGroundElevation() + piece.getHeight());
      }
    }
    var walls = this.home.getWalls();
    for (var i = 0; i < walls.length; i++) {
      var wall = walls[i];
      if (wall.getLevel() == null
          || wall.getLevel().isViewable()) {
        var wallElevation = wall.getLevel() != null ? wall.getLevel().getElevation() : 0;
        if (wall.getHeight() != null) {
          homeHeight = Math.max(homeHeight, wallElevation + wall.getHeight());
          if (wall.getHeightAtEnd() != null) {
            homeHeight = Math.max(homeHeight, wallElevation + wall.getHeightAtEnd());
          }
        } else {
          homeHeight = Math.max(homeHeight, wallElevation + this.home.getWallHeight());
        }
      }
    }
    var rooms = this.home.getRooms();
    for (var i = 0; i < rooms.length; i++) {
      var room = rooms[i];
      if (room.getLevel() != null
          && room.getLevel().isViewable()) {
        homeHeight = Math.max(homeHeight, room.getLevel().getElevation());
      }
    }
    var polylines = this.home.getPolylines();
    for (var i = 0; i < polylines.length; i++) {
      var polyline = polylines[i];
      if ((polyline.getLevel() == null
          || polyline.getLevel().isViewable())
          && polyline.isVisibleIn3D()) {
        homeHeight = Math.max(homeHeight, polyline.getGroundElevation());
      }
    }
    var labels = this.home.getLabels();
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      if ((label.getLevel() == null
            || label.getLevel().isViewable())
          && label.getPitch() != null) {
        homeHeight = Math.max(homeHeight, label.getGroundElevation());
      }
    }
    this.homeHeightCache = homeHeight;
  }
  return this.homeHeightCache;
}

/**
 * Updates view transform from <code>camera</code> angles and location.
 * @private 
 */
HomeComponent3D.prototype.updateViewPlatformTransform = function(camera, updateWithAnimation) {
  if (updateWithAnimation) {
    this.moveCameraWithAnimation(camera);
  } else {
    delete this.cameraInterpolator; // Stop camera animation if any
    var viewPlatformTransform = mat4.create();
    this.computeViewPlatformTransform(viewPlatformTransform, camera.getX(), camera.getY(), 
        camera.getZ(), camera.getYaw(), camera.getPitch());
    this.canvas3D.setViewPlatformTransform(viewPlatformTransform);
  }
}

/**
 * Moves the camera to a new location using an animation for smooth moves.
 * @private 
 */
HomeComponent3D.prototype.moveCameraWithAnimation = function(finalCamera) {
  if (this.cameraInterpolator === undefined) {
    this.cameraInterpolator = {initialCamera : null, finalCamera : null, alpha : null};
  }
  if (this.cameraInterpolator.finalCamera === null
      || this.cameraInterpolator.finalCamera.getX() !== finalCamera.getX()
      || this.cameraInterpolator.finalCamera.getY() !== finalCamera.getY()
      || this.cameraInterpolator.finalCamera.getZ() !== finalCamera.getZ()
      || this.cameraInterpolator.finalCamera.getYaw() !== finalCamera.getYaw()
      || this.cameraInterpolator.finalCamera.getPitch() !== finalCamera.getPitch()) {
    if (this.cameraInterpolator.alpha === null || this.cameraInterpolator.alpha === 1) {
      this.cameraInterpolator.initialCamera = new Camera(this.camera.getX(), this.camera.getY(), this.camera.getZ(), 
          this.camera.getYaw(), this.camera.getPitch(), this.camera.getFieldOfView());
    } else if (this.cameraInterpolator.alpha < 0.3) {
      var finalTransformation = mat4.create();
      // Jump directly to final location
      this.computeViewPlatformTransform(finalTransformation, this.cameraInterpolator.finalCamera.getX(), this.cameraInterpolator.finalCamera.getY(), this.cameraInterpolator.finalCamera.getZ(), 
          this.cameraInterpolator.finalCamera.getYaw(), this.cameraInterpolator.finalCamera.getPitch());
      this.canvas3D.setViewPlatformTransform(finalTransformation);
      this.cameraInterpolator.initialCamera = this.cameraInterpolator.finalCamera;
    } else {
      // Compute initial location from current alpha value 
      this.cameraInterpolator.initialCamera = new Camera(this.cameraInterpolator.initialCamera.getX() + (this.cameraInterpolator.finalCamera.getX() - this.cameraInterpolator.initialCamera.getX()) * this.cameraInterpolator.alpha, 
          this.cameraInterpolator.initialCamera.getY() + (this.cameraInterpolator.finalCamera.getY() - this.cameraInterpolator.initialCamera.getY()) * this.cameraInterpolator.alpha, 
          this.cameraInterpolator.initialCamera.getZ() + (this.cameraInterpolator.finalCamera.getZ() - this.cameraInterpolator.initialCamera.getZ()) * this.cameraInterpolator.alpha,
          this.cameraInterpolator.initialCamera.getYaw() + (this.cameraInterpolator.finalCamera.getYaw() - this.cameraInterpolator.initialCamera.getYaw()) * this.cameraInterpolator.alpha, 
          this.cameraInterpolator.initialCamera.getPitch() + (this.cameraInterpolator.finalCamera.getPitch() - this.cameraInterpolator.initialCamera.getPitch()) * this.cameraInterpolator.alpha, 
          finalCamera.getFieldOfView());
    }
    this.cameraInterpolator.finalCamera = new Camera(finalCamera.getX(), finalCamera.getY(), finalCamera.getZ(), 
        finalCamera.getYaw(), finalCamera.getPitch(), finalCamera.getFieldOfView());
    // Create an animation that will interpolate camera location 
    // between initial camera and final camera in 75 ms
    if (this.cameraInterpolator.alpha === null) {
      this.cameraInterpolator.animationDuration = 75;
    }
    // Start animation now
    this.cameraInterpolator.startTime = Date.now();
    this.cameraInterpolator.alpha = 0;
    var component3D = this;
    requestAnimationFrame(
        function() {
          component3D.interpolateUntilAlphaEquals1();
        });
  }
}

/**
 * Increases alpha according to elapsed time and interpolates transformation.
 * @private 
 */
HomeComponent3D.prototype.interpolateUntilAlphaEquals1 = function() {
  if (this.cameraInterpolator) {
    var now = Date.now();
    var alpha = Math.min(1, (now - this.cameraInterpolator.startTime) / this.cameraInterpolator.animationDuration);
    if (this.cameraInterpolator.alpha !== alpha) {
      var transform = mat4.create();
      this.computeTransform(alpha, transform);
      this.canvas3D.setViewPlatformTransform(transform);
      this.cameraInterpolator.alpha = alpha;
    }
    if (this.cameraInterpolator.alpha < 1) {
      var component3D = this;
      requestAnimationFrame(
          function() {
            component3D.interpolateUntilAlphaEquals1();
          });
    }
  }
}

/**
 * Computes the transformation interpolated between initial and final camera position 
 * according to alpha. 
 * @private 
 */
HomeComponent3D.prototype.computeTransform = function(alpha, transform) {
  this.computeViewPlatformTransform(transform, 
      this.cameraInterpolator.initialCamera.getX() + (this.cameraInterpolator.finalCamera.getX() - this.cameraInterpolator.initialCamera.getX()) * alpha, 
      this.cameraInterpolator.initialCamera.getY() + (this.cameraInterpolator.finalCamera.getY() - this.cameraInterpolator.initialCamera.getY()) * alpha, 
      this.cameraInterpolator.initialCamera.getZ() + (this.cameraInterpolator.finalCamera.getZ() - this.cameraInterpolator.initialCamera.getZ()) * alpha, 
      this.cameraInterpolator.initialCamera.getYaw() + (this.cameraInterpolator.finalCamera.getYaw() - this.cameraInterpolator.initialCamera.getYaw()) * alpha, 
      this.cameraInterpolator.initialCamera.getPitch() + (this.cameraInterpolator.finalCamera.getPitch() - this.cameraInterpolator.initialCamera.getPitch()) * alpha);
}

/**
 * Updates view transform from camera angles and location.
 * @private 
 */
HomeComponent3D.prototype.computeViewPlatformTransform = function(transform, cameraX, cameraY, cameraZ, cameraYaw, cameraPitch) {
  var yawRotation = mat4.create();
  mat4.fromYRotation(yawRotation, -cameraYaw + Math.PI);
  
  var pitchRotation = mat4.create();
  mat4.fromXRotation(pitchRotation, -cameraPitch);
  mat4.mul(yawRotation, yawRotation, pitchRotation);

  mat4.identity(transform);
  mat4.translate(transform, transform, vec3.fromValues(cameraX, cameraZ, cameraY));
  mat4.mul(transform, transform, yawRotation);
  
  this.camera = new Camera(cameraX, cameraY, cameraZ, cameraYaw, cameraPitch, 0);
}

/**
 * Adds mouse listeners to the canvas3D that calls back <code>controller</code> methods.  
 * @private 
 */
HomeComponent3D.prototype.addMouseListeners = function(controller, canvas3D) {
  var component3D = this; 
  var userActionsListener = {
      xLastMove : -1,
      yLastMove : -1,
      buttonPressed : -1,
      touchEventType: false,
      pointerTouches : {},
      distanceLastPinch : -1,
      actionStartedInComponent3D : false,
      contextMenuEventType: false,
      mousePressed : function(ev) {
        if (!userActionsListener.touchEventType
            && !userActionsListener.contextMenuEventType) {
          userActionsListener.xLastMove = ev.clientX;
          userActionsListener.yLastMove = ev.clientY;
          userActionsListener.buttonPressed  = ev.button;
          userActionsListener.actionStartedInComponent3D = true;
          ev.stopPropagation();
        }
      },
      windowMouseMoved : function(ev) {
        if (userActionsListener.actionStartedInComponent3D
            && !userActionsListener.contextMenuEventType) {
          userActionsListener.moved(ev.clientX, ev.clientY, ev.altKey, ev.shiftKey);
        }
      },
      windowMouseReleased : function(ev) {
        if (!userActionsListener.touchEventType
            && !userActionsListener.contextMenuEventType) {
          userActionsListener.buttonPressed = -1;
        }
        userActionsListener.touchEventType = false;
        userActionsListener.contextMenuEventType = false;
        userActionsListener.actionStartedInComponent3D = false;
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
        // Required to avoid click simulation
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
      contextMenuDisplayed : function(ev) {
        userActionsListener.contextMenuEventType = true;
      },
      touchStarted : function(ev) {
        // Prevent default behavior to avoid local zooming under iOS >= 15
        ev.preventDefault(); 
        if (document.activeElement != component3D.canvas3D.getHTMLElement()) {
          // Request focus explicitly since default behavior is disabled
          component3D.canvas3D.getHTMLElement().focus();
        }
        userActionsListener.touchEventType = ev.pointerType === undefined;
        this.actionStartedInComponent3D = true;
        if (ev.targetTouches.length == 1) {
          userActionsListener.xLastMove = ev.targetTouches [0].pageX;
          userActionsListener.yLastMove = ev.targetTouches [0].pageY;
          if (component3D.home.getCamera() === component3D.home.getObserverCamera()) {
            userActionsListener.xLastMove = -userActionsListener.xLastMove;
            userActionsListener.yLastMove = -userActionsListener.yLastMove;
          }
          userActionsListener.buttonPressed = 0;
        } else if (ev.targetTouches.length == 2) {
          userActionsListener.distanceLastPinch = userActionsListener.distance(
              ev.targetTouches [0], ev.targetTouches [1]);
        }
      },
      touchMoved : function(ev) {
        if (this.actionStartedInComponent3D) {
          ev.preventDefault();
          if (ev.targetTouches.length == 1) {
            if (component3D.home.getCamera() === component3D.home.getObserverCamera()) {
              userActionsListener.moved(-ev.targetTouches [0].pageX, -ev.targetTouches [0].pageY, false, false);
            } else {
              userActionsListener.moved(ev.targetTouches [0].pageX,  ev.targetTouches [0].pageY, false, false);
            }
          } else if (ev.targetTouches.length == 2) {
            var newDistance = userActionsListener.distance(ev.targetTouches [0], ev.targetTouches [1]);
            var scaleDifference = newDistance / userActionsListener.distanceLastPinch;
            userActionsListener.zoomed((1 - scaleDifference) * 50, false);
            userActionsListener.distanceLastPinch = newDistance;
          }
        }
      },
      touchEnded : function(ev) {
        userActionsListener.buttonPressed = -1;
        this.actionStartedInComponent3D = false;
        // Reset mouseListener.touchEventType in windowMouseReleased call
      },
      copyPointerToTargetTouches : function(ev) {
        // Copy the IE and Edge pointer location to ev.targetTouches
        userActionsListener.pointerTouches [ev.pointerId] = {pageX : ev.clientX, pageY : ev.clientY};
        ev.targetTouches = [];
        for (var attribute in userActionsListener.pointerTouches) {
          if (userActionsListener.pointerTouches.hasOwnProperty(attribute)) {
            ev.targetTouches.push(userActionsListener.pointerTouches [attribute]);
          }
        }
      },
      distance : function(p1, p2) {
        return Math.sqrt(Math.pow(p2.pageX - p1.pageX, 2) + Math.pow(p2.pageY - p1.pageY, 2));
      },
      moved : function(x, y, altKey, shiftKey) {
        if ((userActionsListener.xLastMove !== x
              || userActionsListener.yLastMove !== y)
            && userActionsListener.buttonPressed === 0) {
          if (altKey) {
            // Mouse move along Y axis while alt is down changes camera location
            var delta = 1.25 * (userActionsListener.yLastMove - y);
            // Multiply delta by 5 if shift is down
            if (shiftKey) {
              delta *= 5;
            } 
            controller.moveCamera(delta);
          } else {
            var ANGLE_FACTOR = 0.005;
            // Mouse move along X axis changes camera yaw 
            var yawDelta = ANGLE_FACTOR * (x - userActionsListener.xLastMove);
            // Multiply yaw delta by 5 if shift is down
            if (shiftKey) {
              yawDelta *= 5;
            } 
            controller.rotateCameraYaw(yawDelta);
            
            // Mouse move along Y axis changes camera pitch 
            var pitchDelta = ANGLE_FACTOR * (y - userActionsListener.yLastMove);
            controller.rotateCameraPitch(pitchDelta);
          }
          userActionsListener.xLastMove = x;
          userActionsListener.yLastMove = y;
        }
      },
      mouseScrolled : function(ev) {
        userActionsListener.zoomed(ev.detail, ev.shiftKey);
      },
      mouseWheelMoved : function(ev) {
        ev.preventDefault();
        userActionsListener.zoomed((ev.deltaY !== undefined ? ev.deltaY : -ev.wheelDelta) / 4, ev.shiftKey);
      },        
      zoomed : function(delta, shiftKey) {
        // Mouse wheel changes camera location 
        var delta = -2.5 * delta;
        // Multiply delta by 10 if shift is down
        if (shiftKey) {
          delta *= 5;
        } 
        controller.moveCamera(delta);
      }
    };
    
  if (OperatingSystem.isInternetExplorerOrLegacyEdge()
      && window.PointerEvent) {
    // Multi touch support for IE and Edge
    // IE and Edge test from https://stackoverflow.com/questions/31757852/how-can-i-detect-internet-explorer-ie-and-microsoft-edge-using-javascript
    canvas3D.getHTMLElement().addEventListener("pointerdown", userActionsListener.pointerPressed);
    canvas3D.getHTMLElement().addEventListener("mousedown", userActionsListener.pointerMousePressed);
    // Add pointermove and pointerup event listeners to window to capture pointer events out of the canvas 
    window.addEventListener("pointermove", userActionsListener.windowPointerMoved);
    window.addEventListener("pointerup", userActionsListener.windowPointerReleased);
  } else {
    canvas3D.getHTMLElement().addEventListener("touchstart", userActionsListener.touchStarted);
    canvas3D.getHTMLElement().addEventListener("touchmove", userActionsListener.touchMoved);
    canvas3D.getHTMLElement().addEventListener("touchend", userActionsListener.touchEnded);
    canvas3D.getHTMLElement().addEventListener("mousedown", userActionsListener.mousePressed);
    // Add mousemove and mouseup event listeners to window to capture mouse events out of the canvas 
    window.addEventListener("mousemove", userActionsListener.windowMouseMoved);
    window.addEventListener("mouseup", userActionsListener.windowMouseReleased);
  }
  canvas3D.getHTMLElement().addEventListener("contextmenu", userActionsListener.contextMenuDisplayed);
  canvas3D.getHTMLElement().addEventListener("DOMMouseScroll", userActionsListener.mouseScrolled);
  canvas3D.getHTMLElement().addEventListener("mousewheel", userActionsListener.mouseWheelMoved);

  this.userActionsListener = userActionsListener;
}

/**
 * Installs keys bound to actions. 
 * @private 
 */
HomeComponent3D.prototype.installKeyboardActions = function() {
  // Tolerate alt modifier for forward and backward moves with UP and DOWN keys to avoid 
  // the user to release the alt key when he wants to alternate forward/backward and sideways moves
  this.inputMap = {
      "shift pressed UP" : "MOVE_CAMERA_FAST_FORWARD",
      "alt shift pressed UP" : "MOVE_CAMERA_FAST_FORWARD",
      "shift pressed W" : "MOVE_CAMERA_FAST_FORWARD",
      "pressed UP" : "MOVE_CAMERA_FORWARD",
      "alt pressed UP" : "MOVE_CAMERA_FORWARD",
      "pressed W" : "MOVE_CAMERA_FORWARD",
      "shift pressed DOWN" : "MOVE_CAMERA_FAST_BACKWARD",
      "alt shift pressed DOWN" : "MOVE_CAMERA_FAST_BACKWARD",
      "shift pressed S" : "MOVE_CAMERA_FAST_BACKWARD",
      "pressed DOWN" : "MOVE_CAMERA_BACKWARD",
      "alt pressed DOWN" : "MOVE_CAMERA_BACKWARD",
      "pressed S" : "MOVE_CAMERA_BACKWARD",
      "alt shift pressed LEFT" : "MOVE_CAMERA_FAST_LEFT",
      "alt pressed LEFT" : "MOVE_CAMERA_LEFT",
      "alt shift pressed RIGHT" : "MOVE_CAMERA_FAST_RIGHT",
      "alt pressed RIGHT" : "MOVE_CAMERA_RIGHT",
      "shift pressed LEFT" : "ROTATE_CAMERA_YAW_FAST_LEFT",
      "shift pressed A" : "ROTATE_CAMERA_YAW_FAST_LEFT",
      "pressed LEFT" : "ROTATE_CAMERA_YAW_LEFT",
      "pressed A" : "ROTATE_CAMERA_YAW_LEFT",
      "shift pressed RIGHT" : "ROTATE_CAMERA_YAW_FAST_RIGHT",
      "shift pressed D" : "ROTATE_CAMERA_YAW_FAST_RIGHT",
      "pressed RIGHT" : "ROTATE_CAMERA_YAW_RIGHT",
      "pressed D" : "ROTATE_CAMERA_YAW_RIGHT",
      "shift pressed PAGE_UP" : "ROTATE_CAMERA_PITCH_FAST_UP",
      "pressed PAGE_UP" : "ROTATE_CAMERA_PITCH_UP",
      "shift pressed PAGE_DOWN" : "ROTATE_CAMERA_PITCH_FAST_DOWN",
      "pressed PAGE_DOWN" : "ROTATE_CAMERA_PITCH_DOWN",
      "shift pressed HOME" : "ELEVATE_CAMERA_FAST_UP",
      "pressed HOME" : "ELEVATE_CAMERA_UP",
      "shift pressed END" : "ELEVATE_CAMERA_FAST_DOWN",
      "pressed END" : "ELEVATE_CAMERA_DOWN",
  };
  var component3D = this;
  this.canvas3D.getHTMLElement().addEventListener("keydown", 
      function(ev) {
        component3D.callAction(ev, KeyStroke.getKeyStrokeForEvent(ev, "keydown"));
      }, false);
  this.canvas3D.getHTMLElement().addEventListener("keyup", 
      function(ev) {
        component3D.callAction(ev, KeyStroke.getKeyStrokeForEvent(ev, "keyup"));
      }, false);
}

/**
 * Runs the action bound to the key stroke in parameter.
 * @param {UIEvent} ev
 * @param {string} keyStroke
 * @private 
 */
HomeComponent3D.prototype.callAction = function(ev, keyStroke) {
  if (keyStroke !== undefined) {
    var actionKey = this.inputMap [keyStroke];
    if (actionKey !== undefined) {
      var action = this.actionMap [actionKey];
      if (action !== undefined) {
        action.actionPerformed(ev);
      }
      ev.stopPropagation();
    }
  }
}

/**
 * Creates actions that calls back <code>controller</code> methods.  
 * @private 
 */
HomeComponent3D.prototype.createActions = function(controller) {
  // Move camera action mapped to arrow keys.
  function MoveCameraAction(delta) {
    this.delta = delta;
  }

  MoveCameraAction.prototype.actionPerformed = function(ev) {
    controller.moveCamera(this.delta);
  }

  // Move camera sideways action mapped to arrow keys.
  function MoveCameraSidewaysAction (delta) {
    this.delta = delta;
  }

  MoveCameraSidewaysAction.prototype.actionPerformed = function(ev) {
    controller.moveCameraSideways(this.delta);
  }

  // Elevate camera action mapped to arrow keys.
  function ElevateCameraAction(delta) {
    this.delta = delta;
  }

  ElevateCameraAction.prototype.actionPerformed = function(ev) {
    controller.elevateCamera(this.delta);
  }

  // Rotate camera yaw action mapped to arrow keys.
  function RotateCameraYawAction (delta) {
    this.delta = delta;
  }

  RotateCameraYawAction.prototype.actionPerformed = function(ev) {
    controller.rotateCameraYaw(this.delta);
  }

  // Rotate camera pitch action mapped to arrow keys.
  function RotateCameraPitchAction(delta) {
    this.delta = delta;
  }

  RotateCameraPitchAction.prototype.actionPerformed = function(ev) {
    controller.rotateCameraPitch(this.delta);
  }

  this.actionMap = {
      "MOVE_CAMERA_FORWARD" : new MoveCameraAction(6.5),
      "MOVE_CAMERA_FAST_FORWARD" : new MoveCameraAction(32.5),
      "MOVE_CAMERA_BACKWARD" : new MoveCameraAction(-6.5),
      "MOVE_CAMERA_FAST_BACKWARD" : new MoveCameraAction(-32.5),
      "MOVE_CAMERA_LEFT" : new MoveCameraSidewaysAction(-2.5),
      "MOVE_CAMERA_FAST_LEFT" : new MoveCameraSidewaysAction(-10),
      "MOVE_CAMERA_RIGHT" : new MoveCameraSidewaysAction(2.5),
      "MOVE_CAMERA_FAST_RIGHT" : new MoveCameraSidewaysAction(10),
      "ELEVATE_CAMERA_DOWN" : new ElevateCameraAction(-2.5),
      "ELEVATE_CAMERA_FAST_DOWN" : new ElevateCameraAction(-10),
      "ELEVATE_CAMERA_UP" : new ElevateCameraAction(2.5),
      "ELEVATE_CAMERA_FAST_UP" : new ElevateCameraAction(10),
      "ROTATE_CAMERA_YAW_LEFT" : new RotateCameraYawAction(-Math.PI / 60),
      "ROTATE_CAMERA_YAW_FAST_LEFT" : new RotateCameraYawAction(-Math.PI / 12),
      "ROTATE_CAMERA_YAW_RIGHT" : new RotateCameraYawAction(Math.PI / 60),
      "ROTATE_CAMERA_YAW_FAST_RIGHT" : new RotateCameraYawAction(Math.PI / 12),
      "ROTATE_CAMERA_PITCH_UP" : new RotateCameraPitchAction(-Math.PI / 120),
      "ROTATE_CAMERA_PITCH_FAST_UP" : new RotateCameraPitchAction(-Math.PI / 24),
      "ROTATE_CAMERA_PITCH_DOWN" : new RotateCameraPitchAction(Math.PI / 120),
      "ROTATE_CAMERA_PITCH_FAST_DOWN" : new RotateCameraPitchAction(Math.PI / 24),
  };
}

/**
 * Returns the action map of this component.
 */
HomeComponent3D.prototype.getActionMap = function() {
  return this.actionMap;
}

/**
 * Returns the input map of this component.
 */
HomeComponent3D.prototype.getInputMap = function() {
  return this.inputMap;
}

/**
 * Returns the closest home item displayed at client coordinates (x, y). 
 * @param {number} x
 * @param {number} y
 * @return {Object}
 * @since 1.1
 */
HomeComponent3D.prototype.getClosestItemAt = function(x, y) {
  var node = this.canvas3D.getClosestShapeAt(x, y);
  var homeObjectIndex = -1;
  while (node !== null
         && (homeObjectIndex = this.homeObjects3D.indexOf(node)) < 0) {
    node = node.getParent();
  }
  if (node != null) {
    return this.homeObjects [homeObjectIndex];
  } else {
    return null;
  }
}

/**
 * Returns a new scene tree root.
 * @private 
 */
HomeComponent3D.prototype.createSceneTree = function(listenToHomeUpdates, waitForLoading) {
  var root = new Group3D();
  // Build scene tree with background node first to ensure home structure will be loaded first if it exists
  root.addChild(this.createBackgroundNode(listenToHomeUpdates, waitForLoading));
  // Limit ground area to 1 km x 1 km to avoid bad effects with a larger area 
  var groundNode = this.createGroundNode(-0.5E5, -0.5E5, 1E5, 1E5, listenToHomeUpdates, waitForLoading);
  root.addChild(groundNode);
  root.addChild(this.createHomeTree(listenToHomeUpdates, waitForLoading)); 
  
  this.sceneLights = this.createLights(listenToHomeUpdates);
  for (var i = 0; i < this.sceneLights.length; i++) {
    root.addChild(this.sceneLights [i]);
  }
  
  return root;
}

/**
 * Returns a new background node.  
 * @private 
 */
HomeComponent3D.prototype.createBackgroundNode = function(listenToHomeUpdates, waitForLoading) {
  var skyBackgroundAppearance = new Appearance3D();
  var topHalfSphereGeometry = this.createHalfSphereGeometry(true);   
  var topHalfSphere = new Shape3D(topHalfSphereGeometry, skyBackgroundAppearance);
  var backgroundGroup = new BranchGroup3D();
  backgroundGroup.addChild(topHalfSphere);
  backgroundGroup.addChild(new Shape3D(this.createHalfSphereGeometry(false)));

  // Add a plane at ground level to complete landscape at the horizon when camera is above horizon 
  var groundBackgroundAppearance = new Appearance3D();
  var groundBackground = new Shape3D( 
      new IndexedTriangleArray3D([vec3.fromValues(-1, -0.01, -1),
                                  vec3.fromValues(-1, -0.01, 1),
                                  vec3.fromValues(1, -0.01, 1),
                                  vec3.fromValues(1, -0.01, -1)],
                                 [0, 1, 2, 0, 2, 3],
                                 [], [],
                                 [vec3.fromValues(0., 1., 0.)], [0, 0, 0, 0, 0, 0]),
      groundBackgroundAppearance);
  backgroundGroup.addChild(groundBackground);
  
  // No need of different lights for background because scene lights will have an effect on background too
  
  var background = new Background3D(backgroundGroup);
  this.updateBackgroundColorAndTexture(skyBackgroundAppearance, groundBackgroundAppearance, this.home, waitForLoading);
  groundBackgroundAppearance.setVisible(this.home.getCamera().getZ() >= 0);

  if (listenToHomeUpdates) {
    // Add a listener on home properties change 
    var component3D = this;
    this.backgroundChangeListener = function(ev) {
        component3D.updateBackgroundColorAndTexture(skyBackgroundAppearance, groundBackgroundAppearance, 
            component3D.home, waitForLoading);
      };
    component3D.home.getEnvironment().addPropertyChangeListener("SKY_COLOR", this.backgroundChangeListener);
    component3D.home.getEnvironment().addPropertyChangeListener("SKY_TEXTURE", this.backgroundChangeListener);
    component3D.home.getEnvironment().addPropertyChangeListener("GROUND_COLOR", this.backgroundChangeListener);
    component3D.home.getEnvironment().addPropertyChangeListener("GROUND_TEXTURE", this.backgroundChangeListener);
    // Make groundBackground invisible if camera is below the ground
    this.elevationChangeListener = function(ev) {
        if (ev.getSource() === component3D.home) {
          // Move listener to the new camera
          ev.getOldValue().removePropertyChangeListener(component3D.elevationChangeListener);
          component3D.home.getCamera().addPropertyChangeListener(component3D.elevationChangeListener);
        } 
        if (ev.getSource() === component3D.home
            || ev.getPropertyName() === "Z") {
          groundBackgroundAppearance.setVisible(component3D.home.getCamera().getZ() >= 0);
        }
      };
    this.home.getCamera().addPropertyChangeListener(this.elevationChangeListener);
    this.home.addPropertyChangeListener("CAMERA", this.elevationChangeListener);
  }
  return background;
}

/**
 * Returns a half sphere oriented inward and with texture ordinates 
 * that spread along an hemisphere. 
 * @param {boolean} top  if true returns an upper geometry
 * @private 
 */
HomeComponent3D.prototype.createHalfSphereGeometry = function(top) {
  var divisionCount = 48; 
  var coords = [];
  var coordIndices = [];
  var textureCoords = [];
  for (var i = 0, k = 0; i < divisionCount; i++) {
    var alpha = i * 2 * Math.PI / divisionCount;
    var cosAlpha = Math.cos(alpha);
    var sinAlpha = Math.sin(alpha);
    var nextAlpha = (i  + 1) * 2 * Math.PI / divisionCount;
    var cosNextAlpha = Math.cos(nextAlpha);
    var sinNextAlpha = Math.sin(nextAlpha);
    for (var j = 0, max = divisionCount / 4; j < max; j++, k += 4) {
      var beta = 2 * j * Math.PI / divisionCount;
      var cosBeta = Math.cos(beta); 
      var sinBeta = Math.sin(beta);
      // Correct the bottom of the hemisphere to avoid seeing a bottom hemisphere at the horizon
      var y = j !== 0 ? (top ? sinBeta : -sinBeta) : -0.01;
      var nextBeta = 2 * (j + 1) * Math.PI / divisionCount;
      if (!top) {
        nextBeta = -nextBeta;
      }
      var cosNextBeta = Math.cos(nextBeta);
      var sinNextBeta = Math.sin(nextBeta);
      coords.push(vec3.fromValues(cosAlpha * cosBeta, y, sinAlpha * cosBeta));
      coords.push(vec3.fromValues(cosNextAlpha * cosBeta, y, sinNextAlpha * cosBeta));
      coords.push(vec3.fromValues(cosNextAlpha * cosNextBeta, sinNextBeta, sinNextAlpha * cosNextBeta));
      coords.push(vec3.fromValues(cosAlpha * cosNextBeta, sinNextBeta, sinAlpha * cosNextBeta));
      if (top) {
        coordIndices.push(k);
        coordIndices.push(k + 1);
        coordIndices.push(k + 2);
        coordIndices.push(k);
        coordIndices.push(k + 2);
        coordIndices.push(k + 3);
        textureCoords.push(vec2.fromValues(i / divisionCount, j / max)); 
        textureCoords.push(vec2.fromValues((i + 1) / divisionCount, j / max)); 
        textureCoords.push(vec2.fromValues((i + 1) / divisionCount, (j + 1) / max)); 
        textureCoords.push(vec2.fromValues(i / divisionCount, (j + 1) / max));
      } else {
        coordIndices.push(k);
        coordIndices.push(k + 2);
        coordIndices.push(k + 1);
        coordIndices.push(k);
        coordIndices.push(k + 3);
        coordIndices.push(k + 2);
      }
    }
  }
  
  return new IndexedTriangleArray3D(coords, coordIndices, textureCoords, coordIndices, [], []);
}

/**
 * Updates <code>skyBackgroundAppearance</code> and <code>groundBackgroundAppearance</code> 
 * color / texture from <code>home</code> sky color and texture.
 * @param {Appearance3D} skyBackgroundAppearance    the sky appearance to update
 * @param {Appearance3D} groundBackgroundAppearance the shape of the ground used in the background     
 * @param {Home}         home
 * @param {boolean}      waitForLoading
 * @private 
 */
HomeComponent3D.prototype.updateBackgroundColorAndTexture = function(skyBackgroundAppearance, groundBackgroundAppearance, 
                                                                     home, waitForLoading) {
  var skyColor = home.getEnvironment().getSkyColor();
  skyBackgroundAppearance.setDiffuseColor(vec3.fromValues(((skyColor >>> 16) & 0xFF) / 255.,
                                                          ((skyColor >>> 8) & 0xFF) / 255.,
                                                           (skyColor & 0xFF) / 255.));
  var skyTexture = home.getEnvironment().getSkyTexture();
  if (skyTexture !== null) {
    var transform = mat3.create();
    mat3.fromTranslation(transform, vec2.fromValues(-skyTexture.getXOffset(), 0));
    TextureManager.getInstance().loadTexture(skyTexture.getImage(), 0, waitForLoading,
        {
          textureUpdated : function(textureImage) {
            skyBackgroundAppearance.setTextureImage(textureImage);
            skyBackgroundAppearance.setTextureTransform(transform);
          },
          textureError : function(error) {
            return this.textureUpdated(TextureManager.getInstance().getErrorImage());
          } 
        });
  } else {
    skyBackgroundAppearance.setTextureImage(null);
  }
  
  var groundColor = home.getEnvironment().getGroundColor();
  var color = vec3.fromValues(((groundColor >>> 16) & 0xFF) / 255.,
                              ((groundColor >>> 8) & 0xFF) / 255.,
                               (groundColor & 0xFF) / 255.);
  groundBackgroundAppearance.setDiffuseColor(color);
  groundBackgroundAppearance.setAmbientColor(color);
  var groundTexture = home.getEnvironment().getGroundTexture();
  if (groundTexture !== null) {
    TextureManager.getInstance().loadTexture(groundTexture.getImage(), 0, waitForLoading,
        {
          textureUpdated : function(textureImage) {
            // Display texture very small to get an average color at the horizon 
            groundBackgroundAppearance.setTextureImage(textureImage);
            groundBackgroundAppearance.setTextureCoordinatesGeneration(
                {planeS : vec4.fromValues(1E5, 0, 0, 0), 
                 planeT : vec4.fromValues(0, 0, 1E5, 0)});
          },
          textureError : function(error) {
            return this.textureUpdated(TextureManager.getInstance().getErrorImage());
          }
        });
  } else {
    groundBackgroundAppearance.setTextureImage(null);
  }
}

/**
 * Returns a new ground node.  
 * @private 
 */
HomeComponent3D.prototype.createGroundNode = function(groundOriginX, groundOriginY, groundWidth, groundDepth, 
                                                      listenToHomeUpdates, waitForLoading) {
  if (this.home.structure) {
    var structureGroup = new BranchGroup3D();
    structureGroup.setCapability(Group3D.ALLOW_CHILDREN_EXTEND);
    ModelManager.getInstance().loadModel(this.home.structure, waitForLoading,
        { 
          modelUpdated : function(structureNode) {
            structureGroup.addChild(structureNode);
          },
          modelError : function(ex) {
            // Display a large red box at ground level
            var boxAppearance = new Appearance3D();
            boxAppearance.setDiffuseColor(vec3.fromValues(1, 0, 0));
            structureGroup.addChild(new Box3D(1E7, 0, 1E7, boxAppearance));
          }
        });
    
    this.groundChangeListener = function(ev) {}; // Dummy listener
    return structureGroup;
  } else {
    var ground3D = typeof Ground3D !== "undefined" 
        ? new Ground3D(this.home, groundOriginX, groundOriginY, groundWidth, groundDepth, waitForLoading) 
        : new Box3D(1E7, 0, 1E7, new Appearance3D());
    var translation = mat4.create();
    mat4.translate(translation, translation, vec3.fromValues(0, -0.2, 0));
    var transformGroup = new TransformGroup3D(translation);
    transformGroup.addChild(ground3D);

    if (listenToHomeUpdates) {
      // Add a listener on ground color and texture properties change 
      this.groundChangeListener = function(ev) {
          if (!this.updater) {
            var context = this;
            this.updater = function() {
                ground3D.update();
                delete context.updater;
              };
            setTimeout(this.updater, 0);
          }
        };
      var homeEnvironment = this.home.getEnvironment();
      homeEnvironment.addPropertyChangeListener("GROUND_COLOR", this.groundChangeListener);
      homeEnvironment.addPropertyChangeListener("BACKGROUND_IMAGE_VISIBLE_ON_GROUND_3D", this.groundChangeListener);
      homeEnvironment.addPropertyChangeListener("GROUND_TEXTURE", this.groundChangeListener);
      this.home.addPropertyChangeListener("BACKGROUND_IMAGE", this.groundChangeListener);
    }    
    return transformGroup;
  }
}

/**
 * Returns the lights of the scene.
 * @private 
 */
HomeComponent3D.prototype.createLights = function(listenToHomeUpdates) {
  var lights = [
      new DirectionalLight3D(vec3.fromValues(0.9, 0.9, 0.9), vec3.fromValues(1.5, -0.8, -1)),         
      new DirectionalLight3D(vec3.fromValues(0.9, 0.9, 0.9), vec3.fromValues(-1.5, -0.8, -1)), 
      new DirectionalLight3D(vec3.fromValues(0.9, 0.9, 0.9), vec3.fromValues(0, -0.8, 1)), 
      new DirectionalLight3D(vec3.fromValues(0.7, 0.7, 0.7), vec3.fromValues(0, 1, 0)), 
      new AmbientLight3D(vec3.fromValues(0.2, 0.2, 0.2))]; 
  for (var i = 0; i < lights.length - 1; i++) {
    // Store default color 
    lights [i].defaultColor = lights [i].getColor();
    this.updateLightColor(lights [i]);
  }
  
  if (listenToHomeUpdates) {
    // Add a listener on light color property change to home
    var component3D = this;
    this.lightColorListener = function(ev) {
        for (var i = 0; i < lights.length - 1; i++) {
          component3D.updateLightColor(lights [i]);
        }
      };
    this.home.getEnvironment().addPropertyChangeListener(
        "LIGHT_COLOR", this.lightColorListener);
  }

  return lights;
}

/**
 * Updates<code>light</code> color from <code>home</code> light color.
 * @param {Light3D} light the light to update 
 * @private 
 */
HomeComponent3D.prototype.updateLightColor = function(light) {
  var defaultColor = light.defaultColor;
  var lightColor = this.home.getEnvironment().getLightColor();
  light.setColor(vec3.fromValues(((lightColor >>> 16) & 0xFF) / 255 * defaultColor [0],
                                  ((lightColor >>> 8) & 0xFF) / 255 * defaultColor [1],
                                          (lightColor & 0xFF) / 255 * defaultColor [2]));
}

/**
 * Returns a <code>home</code> new tree node, with branches for each wall 
 * and piece of furniture of <code>home</code>. 
 * @private 
 */
HomeComponent3D.prototype.createHomeTree = function(listenToHomeUpdates, waitForLoading) {
  var homeRoot = new BranchGroup3D();
  homeRoot.setCapability(Group3D.ALLOW_CHILDREN_EXTEND);
  // Add walls, pieces, rooms, polylines and labels already available
  var labels = this.home.getLabels();
  for (var i = 0; i < labels.length; i++) {
    this.addObject(homeRoot, labels [i], listenToHomeUpdates, waitForLoading);
  }
  var polylines = this.home.getPolylines();
  for (var i = 0; i < polylines.length; i++) {
    this.addObject(homeRoot, polylines [i], listenToHomeUpdates, waitForLoading);
  }
  var rooms = this.home.getRooms();
  for (var i = 0; i < rooms.length; i++) {
    this.addObject(homeRoot, rooms [i], listenToHomeUpdates, waitForLoading);
  }    
  var walls = this.home.getWalls();
  for (var i = 0; i < walls.length; i++) {
    this.addObject(homeRoot, walls [i], listenToHomeUpdates, waitForLoading);
  }
  var furniture = this.home.getFurniture();
  for (var i = 0; i < furniture.length; i++) { 
    var piece = furniture [i];
    if (piece instanceof HomeFurnitureGroup) {
      var groupFurniture = piece.getAllFurniture();
      for (var j = 0; j < groupFurniture.length; j++) {
        var childPiece = groupFurniture [j];
        if (!(childPiece instanceof HomeFurnitureGroup)) {
          this.addObject(homeRoot, childPiece, listenToHomeUpdates, waitForLoading);
        }
      }
    } else {
      this.addObject(homeRoot, piece, listenToHomeUpdates, waitForLoading);
    }
  }
  if (listenToHomeUpdates) {
    // Add level, wall, furniture, room listeners to home for further update    
    this.addLevelListener(homeRoot);
    this.addWallListener(homeRoot);
    this.addFurnitureListener(homeRoot);
    this.addRoomListener(homeRoot);
    this.addPolylineListener(homeRoot);
    this.addLabelListener(homeRoot);
    this.addEnvironmentListeners();
  }
  return homeRoot;
}

/**
 * Adds a level listener to home levels that updates the children of the given
 * <code>group</code>, each time a level is added, updated or deleted.
 * @param {Group3D} group
 * @private
 */
HomeComponent3D.prototype.addLevelListener = function(group) {
  var component3D = this;
  this.levelChangeListener = function(ev) {
      var propertyName = ev.getPropertyName();
      if ("VISIBLE" == propertyName
          || "VIEWABLE" == propertyName) {
        var objects = component3D.homeObjects;
        var updatedItems = [];
        for (var i = 0; i < objects.length; i++) {
          var item = objects [i];
          if (item instanceof Room // 3D rooms depend on rooms at other levels
              || item.isAtLevel !== undefined // item instanceof Elevetable
              || item.isAtLevel(ev.getSource())) {
            updatedItems.push(item);
          }
        }
        component3D.updateObjects(updatedItems);          
        component3D.groundChangeListener(null);
      } else if ("ELEVATION" == propertyName) {
        component3D.updateObjects(component3D.homeObjects.slice(0));          
        component3D.groundChangeListener(null);
      } else if ("BACKGROUND_IMAGE" == propertyName) {
        component3D.groundChangeListener(null);
      } else if ("FLOOR_THICKNESS" == propertyName) {
        component3D.updateObjects(component3D.home.getWalls());          
        component3D.updateObjects(component3D.home.getRooms());
      } else if ("HEIGHT" == propertyName) {
        component3D.updateObjects(component3D.home.getRooms());
      }  
    };
  var levels = this.home.getLevels();
  for (var i = 0; i < levels.length; i++) {
    levels[i].addPropertyChangeListener(this.levelChangeListener);
  }

  this.levelListener = function(ev) {
      var level = ev.getItem();
      switch ((ev.getType())) {
        case CollectionEvent.Type.ADD :
          level.addPropertyChangeListener(component3D.levelChangeListener);
          break;
        case CollectionEvent.Type.DELETE :
          level.removePropertyChangeListener(component3D.levelChangeListener);
          break;
        }
      component3D.updateObjects(component3D.home.getRooms());
    };
  this.home.addLevelsListener(this.levelListener);
}

/**
 * Adds a wall listener to home walls that updates the children of the given
 * <code>group</code>, each time a wall is added, updated or deleted.
 * @param {Group3D} group
 * @private
 */
HomeComponent3D.prototype.addWallListener = function(group) {
  var component3D = this;
  this.wallChangeListener = function(ev) {
      var propertyName = ev.getPropertyName();
      if ("PATTERN" != propertyName) {
        var updatedWall = ev.getSource();
        component3D.updateWall(updatedWall);          
        var levels = component3D.home.getLevels();
        if (updatedWall.getLevel() === null
            || updatedWall.isAtLevel(levels [levels.length - 1])) {
          component3D.updateObjects(component3D.home.getRooms());
        }
        if (updatedWall.getLevel() != null && updatedWall.getLevel().getElevation() < 0) {
          component3D.groundChangeListener(null);
        }
      }
    };
  var walls = this.home.getWalls();
  for (var i = 0; i < walls.length; i++) {
    walls[i].addPropertyChangeListener(this.wallChangeListener);
  }
  this.wallListener = function(ev) {
      var wall = ev.getItem();
      switch ((ev.getType())) {
        case CollectionEvent.Type.ADD :
          component3D.addObject(group, wall, true, false);
          wall.addPropertyChangeListener(component3D.wallChangeListener);
          break;
        case CollectionEvent.Type.DELETE :
          component3D.deleteObject(wall);
          wall.removePropertyChangeListener(component3D.wallChangeListener);
          break;
      }
      component3D.updateObjects(component3D.home.getRooms());
      component3D.groundChangeListener(null);
    };
  this.home.addWallsListener(this.wallListener);
}

/**
 * Adds a furniture listener to home that updates the children of the given <code>group</code>, 
 * each time a piece of furniture is added, updated or deleted.
 * @private 
 */
HomeComponent3D.prototype.addFurnitureListener = function(group) {
  var component3D = this;
  var updatePieceOfFurnitureGeometry = function(piece, propertyName, oldValue) {
      component3D.updateObjects([piece]);
      if (component3D.containsDoorsAndWindows(piece)) {
        if (oldValue !== null) {
          var oldPiece = piece.clone();
          if ("X" == propertyName) {
            oldPiece.setX(oldValue);
          } else if ("Y" == propertyName) {
            oldPiece.setY(oldValue);
          } else if ("ANGLE" == propertyName) {
            oldPiece.setAngle(oldValue);
          } else if ("WIDTH" == propertyName) {
            oldPiece.setWidth(oldValue);
          } else if ("DEPTH" == propertyName) {
            oldPiece.setDepth(oldValue);
          }
          // For doors and windows, propertyName can't be equal to ROLL or PITCH

          component3D.updateIntersectingWalls([oldPiece, piece]);
        } else {
          component3D.updateIntersectingWalls([piece]);
        }
        
        component3D.updateObjects(component3D.home.getWalls());
      } else if (component3D.containsStaircases(piece)) {
        component3D.updateObjects(component3D.home.getRooms());
      }
      if (piece.getLevel() !== null && piece.getLevel().getElevation() < 0) {
        component3D.groundChangeListener(null);
      }
    };  
  this.furnitureChangeListener = function(ev) {
      var updatedPiece = ev.getSource();
      var propertyName = ev.getPropertyName();
      if ("X" == propertyName
          || "Y" == propertyName
          || "ANGLE" == propertyName
          || "ROLL" == propertyName
          || "PITCH" == propertyName
          || "WIDTH" == propertyName
          || "DEPTH" == propertyName) {
        updatePieceOfFurnitureGeometry(updatedPiece, propertyName, ev.getOldValue());
      } else if ("HEIGHT" == propertyName
          || "ELEVATION" == propertyName
          || "MODEL" == propertyName
          || "MODEL_ROTATION" == propertyName
          || "MODEL_MIRRORED" == propertyName
          || "MODEL_FLAGS" == propertyName
          || "MODEL_TRANSFORMATIONS" == propertyName
          || "STAIRCASE_CUT_OUT_SHAPE" == propertyName
          || "VISIBLE" == propertyName
          || "LEVEL" == propertyName) {
        updatePieceOfFurnitureGeometry(updatedPiece, null, null);
      } else if ("CUT_OUT_SHAPE" == propertyName
          || "WALL_CUT_OUT_ON_BOTH_SIDES" == propertyName
          || "WALL_WIDTH" == propertyName
          || "WALL_LEFT" == propertyName
          || "WALL_HEIGHT" == propertyName
          || "WALL_TOP" == propertyName) {
        if (component3D.containsDoorsAndWindows(updatedPiece)) {
          component3D.updateIntersectingWalls([updatedPiece]);
        }
      } else if ("COLOR" == propertyName
          || "TEXTURE" == propertyName
          || "MODEL_MATERIALS" == propertyName
          || "SHININESS" == propertyName
          || ("POWER" == propertyName
              && component3D.home.getEnvironment().getSubpartSizeUnderLight() > 0)) {
        component3D.updateObjects([updatedPiece]);
      }
    };

  var furniture = this.home.getFurniture();
  for (var i = 0; i < furniture.length; i++) { 
    this.addPropertyChangeListener(furniture [i], this.furnitureChangeListener);
  }      
  this.furnitureListener = function(ev) {
      var piece = ev.getItem();
      switch (ev.getType()) {
        case CollectionEvent.Type.ADD :
          component3D.addPieceOfFurniture(group, piece, true, false);
          component3D.addPropertyChangeListener(piece, component3D.furnitureChangeListener);
          break;
        case CollectionEvent.Type.DELETE : 
          component3D.deletePieceOfFurniture(piece);
          component3D.removePropertyChangeListener(piece, component3D.furnitureChangeListener);
          break;
      }
      // If piece is or contains a door or a window, update walls that intersect with piece
      if (component3D.containsDoorsAndWindows(piece)) {
        component3D.updateIntersectingWalls([piece]);
      } else if (component3D.containsStaircases(piece)) {
        component3D.updateObjects(component3D.home.getRooms());
      } else {
        component3D.approximateHomeBoundsCache = null;
        component3D.homeHeightCache = null;
      }
      component3D.groundChangeListener(null);
    };
  this.home.addFurnitureListener(this.furnitureListener);
}

/**
 * Adds the given <code>listener</code> to <code>piece</code> and its children.
 * @param {HomePieceOfFurniture} piece
 * @param {PropertyChangeListener} listener
 * @private
 */
HomeComponent3D.prototype.addPropertyChangeListener = function(piece, listener) {
  if (piece instanceof HomeFurnitureGroup) {
    var furniture = piece.getFurniture();
    for (var i = 0; i < furniture.length; i++) {
      this.addPropertyChangeListener(furniture [i], listener);
    }
  } else {
    piece.addPropertyChangeListener(listener);
  }
}

/**
 * Removes the given <code>listener</code> from <code>piece</code> and its children.
 * @param {HomePieceOfFurniture} piece
 * @param {PropertyChangeListener} listener
 * @private
 */
HomeComponent3D.prototype.removePropertyChangeListener = function(piece, listener) {
  if (piece instanceof HomeFurnitureGroup) {
    var furniture = piece.getFurniture();
    for (var i = 0; i < furniture.length; i++) {
      this.removePropertyChangeListener(furniture [i], listener);
    }
  } else {
    piece.removePropertyChangeListener(listener);
  }
}

/**
 * Returns <code>true</code> if the given <code>piece</code> is or contains a door or window.
 * @param {HomePieceOfFurniture} piece
 * @return {boolean}
 * @private
 */
HomeComponent3D.prototype.containsDoorsAndWindows = function(piece) {
  if (piece instanceof HomeFurnitureGroup) {
    var furniture = piece.getFurniture();
    for (var i = 0; i < furniture.length; i++) {
      if (this.containsDoorsAndWindows(furniture[i])) {
        return true;
      }
    }
    return false;
  } else {
    return piece.isDoorOrWindow();
  }
}

/**
 * Returns <code>true</code> if the given <code>piece</code> is or contains a staircase
 * with a top cut out shape.
 * @param {HomePieceOfFurniture} piece
 * @return {boolean}
 * @private
 */
HomeComponent3D.prototype.containsStaircases = function(piece) {
  if (piece instanceof HomeFurnitureGroup) {
    var furniture = piece.getFurniture();
    for (var i = 0; i < furniture.length; i++) {
      if (this.containsStaircases(furniture[i])) {
        return true;
      }
    }
    return false;
  } else {
    return piece.getStaircaseCutOutShape() !== null;
  }
}

/**
 * Adds a room listener to home rooms that updates the children of the given
 * <code>group</code>, each time a room is added, updated or deleted.
 * @param {Group3D} group
 * @private
 */
HomeComponent3D.prototype.addRoomListener = function(group) {
  var component3D = this;
  this.roomChangeListener = function(ev) {
      var updatedRoom = ev.getSource();
      var propertyName = ev.getPropertyName();
      if ("FLOOR_COLOR" == propertyName
          || "FLOOR_TEXTURE" == propertyName
          || "FLOOR_SHININESS" == propertyName
          || "CEILING_COLOR" == propertyName
          || "CEILING_TEXTURE" == propertyName
          || "CEILING_SHININESS" == propertyName
          || "CEILING_FLAT" == propertyName) {
        component3D.updateObjects([updatedRoom]);
      } else if ("FLOOR_VISIBLE" == propertyName
          || "CEILING_VISIBLE" == propertyName
          || "LEVEL" == propertyName) {   
        component3D.updateObjects(component3D.home.getRooms());
        component3D.groundChangeListener(null);
      } else if ("POINTS" == propertyName) {   
        if (component3D.homeObjectsToUpdate) {
          // Don't try to optimize if more than one room to update
          component3D.updateObjects(component3D.home.getRooms());
        } else {
          component3D.updateObjects([updatedRoom]);
          // Search the rooms that overlap the updated one
          var oldArea = new java.awt.geom.Area(component3D.getShape(ev.getOldValue()));
          var newArea = new java.awt.geom.Area(component3D.getShape(ev.getNewValue()));
          var updatedRoomLevel = updatedRoom.getLevel(); 
          var rooms = component3D.home.getRooms();
          for (var i = 0; i < rooms.length; i++) {
            var room = rooms[i];
            var roomLevel = room.getLevel();
            if (room != updatedRoom
                && (roomLevel == null
                    || Math.abs(updatedRoomLevel.getElevation() + updatedRoomLevel.getHeight() - (roomLevel.getElevation() + roomLevel.getHeight())) < 1E-5
                    || Math.abs(updatedRoomLevel.getElevation() + updatedRoomLevel.getHeight() - (roomLevel.getElevation() - roomLevel.getFloorThickness())) < 1E-5)) {
              var roomAreaIntersectionWithOldArea = new java.awt.geom.Area(component3D.getShape(room.getPoints()));
              var roomAreaIntersectionWithNewArea = new java.awt.geom.Area(roomAreaIntersectionWithOldArea);
              roomAreaIntersectionWithNewArea.intersect(newArea);                  
              if (!roomAreaIntersectionWithNewArea.isEmpty()) {
                component3D.updateObjects([room]);
              } else {
                roomAreaIntersectionWithOldArea.intersect(oldArea);
                if (!roomAreaIntersectionWithOldArea.isEmpty()) {
                  component3D.updateObjects([room]);
                }
              }
            }
          }              
        }
        component3D.groundChangeListener(null);
      }            
    };
  var rooms = this.home.getRooms();
  for (var i = 0; i < rooms.length; i++) {
    rooms[i].addPropertyChangeListener(this.roomChangeListener);
  }
  this.roomListener = function(ev) {
      var room = ev.getItem();
      switch (ev.getType()) {
        case CollectionEvent.Type.ADD :
          component3D.addObject(group, room, ev.getIndex(), true, false);
          room.addPropertyChangeListener(component3D.roomChangeListener);
          break;
        case CollectionEvent.Type.DELETE :
          component3D.deleteObject(room);
          room.removePropertyChangeListener(component3D.roomChangeListener);
          break;
      }
      component3D.updateObjects(component3D.home.getRooms());
      component3D.groundChangeListener(null);
    };
  this.home.addRoomsListener(this.roomListener);
}

/**
 * Returns the path matching points.
 * @param {Array} points
 * @return {GeneralPath}
 * @private
 */
HomeComponent3D.prototype.getShape = function(points) {
  var path = new java.awt.geom.GeneralPath();
  path.moveTo(points[0][0], points[0][1]);
  for (var i = 1; i < points.length; i++) {
    path.lineTo(points[i][0], points[i][1]);
  }
  path.closePath();
  return path;
}

/**
 * Adds a polyline listener to home polylines that updates the children of the given
 * <code>group</code>, each time a polyline is added, updated or deleted.
 * @param {Group} group
 * @private
 */
HomeComponent3D.prototype.addPolylineListener = function(group) {
  var component3D = this;
  this.polylineChangeListener = function(ev) {
      var polyline = ev.getSource();
      component3D.updateObjects([polyline]);
    };
  var polylines = this.home.getPolylines();
  for (var i = 0; i < polylines.length; i++) {
    polylines[i].addPropertyChangeListener(this.polylineChangeListener);
  }
  this.polylineListener = function(ev) {
      var polyline = ev.getItem();
      switch (ev.getType()) {
        case CollectionEvent.Type.ADD :
          component3D.addObject(group, polyline, true, false);
          polyline.addPropertyChangeListener(component3D.polylineChangeListener);
          break;
        case CollectionEvent.Type.DELETE :
          component3D.deleteObject(polyline);
          polyline.removePropertyChangeListener(component3D.polylineChangeListener);
          break;
      }
    };
  this.home.addPolylinesListener(this.polylineListener);
}

/**
 * Adds a label listener to home labels that updates the children of the given
 * <code>group</code>, each time a label is added, updated or deleted.
 * @param {Group3D} group
 * @private
 */
HomeComponent3D.prototype.addLabelListener = function(group) {
  var component3D = this;
  this.labelChangeListener = function(ev) {
      var label = ev.getSource();
      component3D.updateObjects([label]);
    };
  var labels = this.home.getLabels();
  for (var i = 0; i < labels.length; i++) {
    labels[i].addPropertyChangeListener(this.labelChangeListener);
  }
  this.labelListener = function(ev) {
      var label = ev.getItem();
      switch (ev.getType()) {
        case CollectionEvent.Type.ADD :
          component3D.addObject(group, label, true, false);
          label.addPropertyChangeListener(component3D.labelChangeListener);
          break;
        case CollectionEvent.Type.DELETE :
          component3D.deleteObject(label);
          label.removePropertyChangeListener(component3D.labelChangeListener);
          break;
      }
    };
  this.home.addLabelsListener(this.labelListener);
}

/**
 * Adds a walls alpha change listener and drawing mode change listener to home
 * environment that updates the home scene objects appearance.
 * @private
 */
HomeComponent3D.prototype.addEnvironmentListeners = function() {
  var component3D = this;
  this.wallsAlphaListener = function(ev) {
      component3D.updateObjects(component3D.home.getWalls());
      component3D.updateObjects(component3D.home.getRooms());
    };
  this.home.getEnvironment().addPropertyChangeListener("WALLS_ALPHA", this.wallsAlphaListener);
}

/**
 * Adds to <code>group</code> a branch matching <code>homeObject</code> at a given <code>index</code>.
 * If <code>index</code> is missing or equal to -1, <code>homeObject</code> will be added at the end of the group.
 * @param {Group3D} group
 * @param {Object}  homeObject
 * @param {number}  [index]
 * @param {boolean} listenToHomeUpdates
 * @param {boolean} waitForLoading
 * @private
 */
HomeComponent3D.prototype.addObject = function(group, homeObject, index, 
                                               listenToHomeUpdates, waitForLoading) {
  if (waitForLoading === undefined) {
    waitForLoading = listenToHomeUpdates;
    listenToHomeUpdates = index;
    index = -1;
  }
  var object3D = this.object3dFactory.createObject3D(this.home, homeObject, waitForLoading);
  if (listenToHomeUpdates) {
    homeObject.object3D = object3D;
    this.homeObjects.push(homeObject);
    this.homeObjects3D.push(object3D);
  }
  if (index === -1) {
    group.addChild(object3D);
  } else {
    group.insertChild(object3D, index);
  }
  return object3D;
}

/**
 * Adds to <code>group</code> a branch matching <code>homeObject</code> or its children if the piece is a group of furniture.
 * @param {Group3D} group
 * @param {HomePieceOfFurniture} piece
 * @param {boolean} listenToHomeUpdates
 * @param {boolean} waitForLoading
 * @private
 */
HomeComponent3D.prototype.addPieceOfFurniture = function(group, piece, listenToHomeUpdates, waitForLoading) {
  if (piece instanceof HomeFurnitureGroup) {
    var furniture = piece.getFurniture();
    for (var i = 0; i < furniture.length; i++) {
      this.addPieceOfFurniture(group, furniture [i], listenToHomeUpdates, waitForLoading);
    }
  } else {
    this.addObject(group, piece, listenToHomeUpdates, waitForLoading);
  }
}

/**
 * Detaches from the scene the branch matching <code>homeObject</code>.
 * @param {Object}  homeObject
 * @private
 */
HomeComponent3D.prototype.deleteObject = function(homeObject) {
  if (homeObject.object3D) {
    homeObject.object3D.detach();
    delete homeObject.object3D;
    var objectIndex = this.homeObjects.indexOf(homeObject);
    this.homeObjects.splice(objectIndex, 1);
    this.homeObjects3D.splice(objectIndex, 1);
    if (this.homeObjectsToUpdate) {
      var index = this.homeObjectsToUpdate.indexOf(homeObject);
      if (index >= 0) {
        this.homeObjectsToUpdate.splice(index, 1);
      }
    }
  }
}

/**
 * Detaches from the scene the branches matching <code>piece</code> or its children if it's a group.
 * @param {HomePieceOfFurniture} piece
 * @private
 */
HomeComponent3D.prototype.deletePieceOfFurniture = function(piece) {
  if (piece instanceof HomeFurnitureGroup) {
    var furniture = piece.getFurniture();
    for (var i = 0; i < furniture.length; i++) {
      this.deletePieceOfFurniture(furniture [i]);
    }
  } else {
    this.deleteObject(piece);
  }
}

/**
 * Updates 3D <code>objects</code> later. 
 * @param {Array} objects
 * @private
 */
HomeComponent3D.prototype.updateObjects = function(objects) {
  if (this.homeObjectsToUpdate) {
    for (var i = 0; i < objects.length; i++) {
      var object = objects [i];
      if (this.homeObjectsToUpdate.indexOf(object) <= -1) {        
        this.homeObjectsToUpdate.push(object);
      }
    }
  } else {
    this.homeObjectsToUpdate = objects.slice(0);
    // Invoke later the update of objects of homeObjectsToUpdate
    setTimeout(
        function(component3D) {
          for (var i = 0; i < component3D.homeObjectsToUpdate.length; i++) {
            var homeObject = component3D.homeObjectsToUpdate [i];
            // Check object wasn't deleted since updateObjects call
            if (homeObject.object3D) { 
              homeObject.object3D.update();
            }
          }
          delete component3D.homeObjectsToUpdate;
        }, 0, this);
  }
  this.approximateHomeBoundsCache = null;
  this.homeHeightCache = null;
}

/**
 * Updates walls that may intersect from the given doors or window.
 * @param {Array} doorOrWindows
 * @private
 */
HomeComponent3D.prototype.updateIntersectingWalls = function(doorOrWindows) {
  var walls = this.home.getWalls();
  var wallCount = 0;
  if (this.homeObjectsToUpdate) {
    for (var i = 0; i < this.homeObjectsToUpdate.length; i++) {
      if (this.homeObjectsToUpdate [i] instanceof Wall) {
        wallCount++;
      }
    }
  }

  if (wallCount !== walls.length) {
    var updatedWalls = [];
    var doorOrWindowBounds = null;
    for (var i = 0; i < doorOrWindows.length; i++) {
      var doorOrWindow = doorOrWindows [i];
      var points = doorOrWindow.getPoints();
      if (doorOrWindowBounds === null) {
        doorOrWindowBounds = new java.awt.geom.Rectangle2D.Float(points [0][0], points [0][1], 0, 0);
      } else {
        doorOrWindowBounds.add(points [0][0], points [0][1]);
      }
      for (var j = 1; j < points.length; j++) {
        doorOrWindowBounds.add(points [j][0], points [j][1]);
      }
    }
    // Search walls that intersect approximative bounds
    for (var i = 0; i < walls.length; i++) {
      var wall = walls [i];
      if (wall.intersectsRectangle(doorOrWindowBounds.getX(), doorOrWindowBounds.getY(),
          doorOrWindowBounds.getX() + doorOrWindowBounds.getWidth(),
          doorOrWindowBounds.getY() + doorOrWindowBounds.getHeight())) {
        updatedWalls.push(wall);
      }
    }
    this.updateObjects(updatedWalls);
  }
}

/**
 * Updates <code>wall</code> geometry,
 * and the walls at its end or start.
 * @param {Wall} wall
 * @private
 */
HomeComponent3D.prototype.updateWall = function(wall) {
  var wallsToUpdate = [];
  wallsToUpdate.push(wall);
  if (wall.getWallAtStart() != null) {
    wallsToUpdate.push(wall.getWallAtStart());
  }
  if (wall.getWallAtEnd() != null) {
    wallsToUpdate.push(wall.getWallAtEnd());
  }
  this.updateObjects(wallsToUpdate);
}


/**
 * A factory able to create instances of {@link Object3DBranch} class.
 * @constructor
 * @author Emmanuel Puybaret
 */
function Object3DBranchFactory() {
}

/**
 * Returns the 3D object matching a given <code>item</code>.
 * @param {Home} home
 * @param {Object} item
 * @param {boolean|function} waitForLoading 
 * @return {Object3DBranch} an instance of a subclass of {@link Object3DBranch}
 */
Object3DBranchFactory.prototype.createObject3D = function(home, item, waitForLoading) {
  if (item instanceof HomePieceOfFurniture) {
    return new HomePieceOfFurniture3D(item, home, waitForLoading);
  } else if (item instanceof Wall) {
    return new Wall3D(item, home, waitForLoading);
  } else if (item instanceof Room) {
    return new Room3D(item, home, false, waitForLoading);
  } else if (item instanceof Polyline) {
    return new Polyline3D(item, home);
   } else if (item instanceof Label) {
     return new Label3D(item, home, waitForLoading);
  } else {
    return new Group3D();
  }  
}
