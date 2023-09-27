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

// Requires core.js
//          scene3d.js
//          SweetHome3D.js
//          ModelManager.js
//          HomePieceOfFurniture3D.js
//          Wall3D.js
//          Room3D.js
//          Polyline3D.js
//          DimensionLine3D.js
//          Label3D.js
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
  this.preferences = preferences;
  this.object3dFactory = object3dFactory !== null 
      ? object3dFactory
      : new Object3DBranchFactory(preferences);
  this.homeObjects = [];
  this.homeObjects3D = [];
  this.sceneLights = [];
  this.camera = null;
  this.windowResizeListener = null;
  this.preferencesChangeListener = null;
  // Listeners bound to home that updates 3D scene objects
  this.cameraChangeListener = null;
  this.homeCameraListener = null;
  this.groundChangeListener = null;
  this.backgroundChangeListener = null;
  this.lightColorListener = null;
  this.elevationChangeListener = null;
  this.wallsAlphaListener = null;
  this.selectionListener = null;
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
  this.dimensionLineChangeListener = null;
  this.dimensionLineListener = null;
  this.labelChangeListener = null;
  this.labelListener = null;
  this.approximateHomeBoundsCache = null;
  this.homeHeightCache = null;
  this.createComponent3D(canvasId, preferences, controller);
}

HomeComponent3D["__interfaces"] = ["com.eteks.sweethome3d.viewcontroller.View3D", "com.eteks.sweethome3d.viewcontroller.View"];

HomeComponent3D.LONG_TOUCH_DELAY = 200; // ms
HomeComponent3D.LONG_TOUCH_DELAY_WHEN_DRAGGING = 400; // ms
HomeComponent3D.LONG_TOUCH_DURATION_AFTER_DELAY = 800; // ms
HomeComponent3D.DOUBLE_TOUCH_DELAY = 500; // ms

/**
 * Creates the 3D canvas associated to the given <code>canvasId</code>.
 * @private 
 */
HomeComponent3D.prototype.createComponent3D = function(canvasId, preferences, controller) {
  this.canvas3D = new HTMLCanvas3D(canvasId);
  var component3D = this;
  if (controller) {
    this.addMouseListeners(controller, preferences, this.canvas3D);
    if (preferences !== null) {
      this.navigationPanelId = this.createNavigationPanel(this.home, preferences, controller);
      this.setNavigationPanelVisible(preferences.isNavigationPanelVisible());
      this.preferencesChangeListener = function(ev) {
          component3D.setNavigationPanelVisible(ev.getNewValue());
        };
      preferences.addPropertyChangeListener("NAVIGATION_PANEL_VISIBLE", this.preferencesChangeListener);
      this.editingIn3DViewChangeListener = function(ev) {
          component3D.updateObjectsAndFurnitureGroups(component3D.home.getSelectedItems());
        };
      preferences.addPropertyChangeListener("EDITING_IN_3D_VIEW_ENABLED", this.editingIn3DViewChangeListener);
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
  this.unitChangeListener = function(ev) {
      component3D.updateObjects(component3D.home.getDimensionLines());
    };
  preferences.addPropertyChangeListener("UNIT", this.unitChangeListener);
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
  if (this.navigationPanelId != null) {
    navigationPanelDiv = document.getElementById(this.navigationPanelId);
    if (navigationPanelDiv !== undefined && navigationPanelDiv.style !== undefined) {
      navigationPanelDiv.style.left = (canvasBounds.left + window.pageXOffset) + "px";
      navigationPanelDiv.style.top = (canvasBounds.top + window.pageYOffset) + "px";
    }
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
    innerHtml = preferences.getLocalizedString("HomeComponent3D", "navigationPanel.innerHTML");
  } catch (ex) {
    innerHtml = 
          '<img src="' + ZIPTools.getScriptFolder("gl-matrix-min.js") + 'navigationPanel.png"'
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
    this.windowResizeListener = function(ev) {
        component3D.revalidate();
      };
    window.addEventListener("resize", this.windowResizeListener);
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
          component3D.mouseListener.mousePressed(ev);
        });
  }
  
  this.simulatedEventListener = {
      mousePressed: function(ev) {
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
            if (OperatingSystem.isInternetExplorerOrLegacyEdge()
                && window.PointerEvent) {
              simulatedElement.removeEventListener("pointerup", stopInterval);
              simulatedElement.removeEventListener("pointerleave", stopInterval);
            } else {
              simulatedElement.removeEventListener("touchend", stopInterval);
              simulatedElement.removeEventListener("mouseup", stopInterval);
              simulatedElement.removeEventListener("mouseleave", stopInterval);
            }
            component3D.mouseListener.windowMouseReleased(ev);
            ev.stopPropagation();
          };
        if (OperatingSystem.isInternetExplorerOrLegacyEdge()
            && window.PointerEvent) {
          // Multi touch support for IE and Edge
          simulatedElement.addEventListener("pointerup", stopInterval);
          simulatedElement.addEventListener("pointerleave", stopInterval);
        } else {
          simulatedElement.addEventListener("touchend", stopInterval);
          simulatedElement.addEventListener("mouseup", stopInterval);
          simulatedElement.addEventListener("mouseleave", stopInterval);
        }
        repeatKeyAction();
        var intervalId = window.setInterval(repeatKeyAction, 80);
      },
      pointerMousePressed : function(ev) {
        // Required to avoid click simulation
        ev.stopPropagation();
      },
      touchStarted : function(ev) {
        // Prevent default behavior to avoid local zooming under iOS >= 15
        ev.preventDefault(); 
        component3D.simulatedEventListener.mousePressed(ev);
      }
    };
  for (var i = 0; i < simulatedKeys.length; i++) {
    // Add a listener that simulates the given key and repeats it until mouse is released 
    if (OperatingSystem.isInternetExplorerOrLegacyEdge()
        && window.PointerEvent) {
      // Multi touch support for IE and Edge
      simulatedKeys [i].addEventListener("pointerdown", this.simulatedEventListener.mousePressed);
      simulatedKeys [i].addEventListener("mousedown", this.simulatedEventListener.pointerMousePressed);
    } else {
      simulatedKeys [i].addEventListener("touchstart", this.simulatedEventListener.touchStarted);
      simulatedKeys [i].addEventListener("mousedown", this.simulatedEventListener.mousePressed);
    }
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
    if (visible) {
      this.revalidate();
    }
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
  this.home.removeSelectionListener(this.selectionListener);
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
  this.home.removeDimensionLinesListener(this.dimensionLineListener);
  var dimensionLines = this.home.getDimensionLines();
  for (var i = 0; i < dimensionLines.length; i++) {
    dimensionLines [i].removePropertyChangeListener(this.dimensionLineChangeListener);
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
  if (this.mouseListener) {
    if (OperatingSystem.isInternetExplorerOrLegacyEdge()
        && window.PointerEvent) {
      // Multi touch support for IE and Edge
      canvas3D.getHTMLElement().removeEventListener("pointerdown", this.mouseListener.pointerPressed);
      canvas3D.getHTMLElement().removeEventListener("mousedown", this.mouseListener.pointerMousePressed);
      canvas3D.getHTMLElement().removeEventListener("dblclick", this.mouseListener.mouseDoubleClicked);
      window.removeEventListener("pointermove", this.mouseListener.windowPointerMoved);
      window.removeEventListener("pointerup", this.mouseListener.windowPointerReleased);
    } else {
      canvas3D.getHTMLElement().removeEventListener("touchstart", this.mouseListener.touchStarted);
      canvas3D.getHTMLElement().removeEventListener("touchmove", this.mouseListener.touchMoved);
      canvas3D.getHTMLElement().removeEventListener("touchend", this.mouseListener.touchEnded);
      canvas3D.getHTMLElement().removeEventListener("mousedown", this.mouseListener.mousePressed);
      canvas3D.getHTMLElement().removeEventListener("dblclick", this.mouseListener.mouseDoubleClicked);
      window.removeEventListener("mousemove", this.mouseListener.windowMouseMoved);
      window.removeEventListener("mouseup", this.mouseListener.windowMouseReleased);
    }
    canvas3D.getHTMLElement().removeEventListener("contextmenu", this.mouseListener.contextMenuDisplayed);
    canvas3D.getHTMLElement().removeEventListener("DOMMouseScroll", this.mouseListener.mouseScrolled);
    canvas3D.getHTMLElement().removeEventListener("mousewheel", this.mouseListener.mouseWheelMoved);
  }
}

/**
 * Frees listeners and canvas data.
 */
HomeComponent3D.prototype.dispose = function() {
  this.removeHomeListeners();
  this.removeMouseListeners(this.canvas3D);
  if (this.navigationPanelId != null) {
    this.preferences.removePropertyChangeListener("NAVIGATION_PANEL_VISIBLE", this.preferencesChangeListener);
    window.removeEventListener("resize", this.windowResizeListener);
    var simulatedKeys = this.getSimulatedKeyElements(document.getElementsByTagName("body") [0]);
    for (var i = 0; i < simulatedKeys.length; i++) {
      if (OperatingSystem.isInternetExplorerOrLegacyEdge()
          && window.PointerEvent) {
        simulatedKeys [i].removeEventListener("pointerdown", this.simulatedEventListener.mousePressed);
        simulatedKeys [i].removeEventListener("mousedown", this.simulatedEventListener.pointerMousePressed);
      } else {
        simulatedKeys [i].removeEventListener("touchstart", this.simulatedEventListener.touchStarted);
        simulatedKeys [i].removeEventListener("mousedown", this.simulatedEventListener.mousePressed);
      }
    }
    var navigationPanel = document.getElementById(this.navigationPanelId);
    navigationPanel.parentElement.removeChild(navigationPanel);
    this.navigationPanelId = null;
  }
  this.preferences.removePropertyChangeListener("EDITING_IN_3D_VIEW_ENABLED", this.editingIn3DViewChangeListener);
  this.preferences.removePropertyChangeListener("UNIT", this.unitChangeListener);
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
      if (!component3D.cameraChangeListener.updater) {
        // Update view transform later to let finish camera changes  
        component3D.cameraChangeListener.updater = function() {
            if (component3D.canvas3D) {
              component3D.updateView(home.getCamera());
              component3D.updateViewPlatformTransform(home.getCamera(), true);
            }
            delete component3D.cameraChangeListener.updater;
          };
        setTimeout(component3D.cameraChangeListener.updater, 0);
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
    var dimensionLines = this.home.getDimensionLines();
    for (var i = 0; i < dimensionLines.length; i++) {
      var dimensionLine = dimensionLines [i];
      if ((dimensionLine.getLevel() == null
            || dimensionLine.getLevel().isViewable())
          && dimensionLine.isVisibleIn3D()) {
        var levelElevation = dimensionLine.getLevel() != null ? dimensionLine.getLevel().getElevation() : 0;
        var startPoint = vec3.fromValues(dimensionLine.getXStart(), dimensionLine.getYStart(),
            levelElevation + dimensionLine.getElevationStart());
        if (approximateHomeBounds == null) {
          approximateHomeBounds = new BoundingBox3D(startPoint, startPoint);
        } else {
          approximateHomeBounds.combine(startPoint);
        }
        approximateHomeBounds.combine(vec3.fromValues(dimensionLine.getXEnd(), dimensionLine.getYEnd(),
            levelElevation + dimensionLine.getElevationEnd()));
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
    var polylines = this.home.getPolylines();
    for (var i = 0; i < polylines.length; i++) {
      var polyline = polylines [i];
      if ((polyline.getLevel() == null
            || polyline.getLevel().isViewable())
          && polyline.isVisibleIn3D()) {
        var points = polyline.getPoints()
        for (var j = 0; j < points.length; j++) {
          var point3d = vec3.fromValues(points[j][0], points[j][1], polyline.getGroundElevation());
          if (approximateHomeBounds == null) {
            approximateHomeBounds = new BoundingBox3D(point3d, point3d);
          } else {
            approximateHomeBounds.combine(point3d);
          }
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
      if (polyline.isVisibleIn3D()
          && (polyline.getLevel() == null
              || polyline.getLevel().isViewable())) {
        homeHeight = Math.max(homeHeight, polyline.getGroundElevation());
      }
    }
    var dimensionLines = this.home.getDimensionLines();
    for (var i = 0; i < dimensionLines.length; i++) {
      var dimensionLine = dimensionLines [i];
      if (dimensionLine.isVisibleIn3D()
          && (dimensionLine.getLevel() == null
              || dimensionLine.getLevel().isViewable())) {
        var levelElevation = dimensionLine.getLevel() != null ? dimensionLine.getLevel().getElevation() : 0;
        homeHeight = Math.max(homeHeight,
            levelElevation + Math.max(dimensionLine.getElevationStart(), dimensionLine.getElevationEnd()));
      }
    }
    var labels = this.home.getLabels();
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      if (label.getPitch() != null
          && (label.getLevel() == null
              || label.getLevel().isViewable())) {
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
HomeComponent3D.prototype.addMouseListeners = function(controller, preferences, canvas3D) {
  var component3D = this; 
  var mouseListener = {
      initialPointerLocation: null,
      lastPointerLocation: null,
      touchEventType : false,
      buttonPressed : -1,
      pointerTouches : {},
      lastEventType : null,
      lastTargetTouches : [],
      distanceLastPinch : -1,
      firstTouchStartedTimeStamp: 0,
      longTouchActivated: false,
      doubleLongTouchActivated: false,
      longTouchStartTime: 0,
      actionStartedInComponent3D : false,
      contextMenuEventType: false,
      mousePressed : function(ev) {
        if (!mouseListener.touchEventType
            && !mouseListener.contextMenuEventType
            && ev.button === 0) {
          mouseListener.updateCoordinates(ev, "mousePressed");
          mouseListener.initialPointerLocation = [ev.canvasX, ev.canvasY];
          mouseListener.lastPointerLocation = [ev.canvasX, ev.canvasY];
          mouseListener.actionStartedInComponent3D = true;
          controller.pressMouse(ev.canvasX, ev.canvasY, 
              ev.clickCount, mouseListener.isShiftDown(ev), mouseListener.isAlignmentActivated(ev), 
              mouseListener.isDuplicationActivated(ev), mouseListener.isMagnetismToggled(ev), View.PointerType.MOUSE);
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
        actionStartedInComponent3D = false;
      },
      windowMouseMoved: function(ev) {
        if (!mouseListener.touchEventType
            && !mouseListener.contextMenuEventType) {
          mouseListener.updateCoordinates(ev, "mouseMoved");
          if (mouseListener.initialPointerLocation != null 
              && !(mouseListener.initialPointerLocation[0] === ev.canvasX 
                  && mouseListener.initialPointerLocation[1] === ev.canvasY)) {
            mouseListener.initialPointerLocation = null;
          }
          
          if (mouseListener.initialPointerLocation == null
              && (ev.buttons === 0 && mouseListener.isInCanvas(ev) 
                  || mouseListener.actionStartedInComponent3D)) {
            if (controller.isEditingState()) {
              controller.moveMouse(ev.canvasX, ev.canvasY);
            } else if (mouseListener.actionStartedInComponent3D
                       && document.activeElement === component3D.canvas3D.getHTMLElement()) {
              mouseListener.moveCamera(ev.canvasX, ev.canvasY, mouseListener.lastPointerLocation [0], mouseListener.lastPointerLocation [1], 
                  ev.altKey, ev.shiftKey);
            }
          }
          mouseListener.lastPointerLocation = [ev.canvasX, ev.canvasY];
        }
      }, 
      windowMouseReleased: function(ev) {
        if (!mouseListener.touchEventType) {
          if (mouseListener.lastPointerLocation != null) {
            if (mouseListener.actionStartedInComponent3D 
                && document.activeElement === component3D.canvas3D.getHTMLElement()
                && ev.button === 0) {
              if (mouseListener.contextMenuEventType) {
                controller.releaseMouse(mouseListener.initialPointerLocation[0], mouseListener.initialPointerLocation[1]);
              } else {
                mouseListener.updateCoordinates(ev, "mouseReleased");
                controller.releaseMouse(ev.canvasX, ev.canvasY);
              }
            }
            mouseListener.initialPointerLocation = null;
            mouseListener.lastPointerLocation = null;
            mouseListener.actionStartedInComponent3D = false;
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
        // Prevent default behavior to ensure a second touchstart event will be received 
        // for double taps under iOS >= 15
        ev.preventDefault(); 
        if (document.activeElement !== component3D.canvas3D.getHTMLElement()) {
          // Request focus explicitly since default behavior is disabled
          component3D.canvas3D.getHTMLElement().focus();
        } 
        mouseListener.updateCoordinates(ev, "touchStarted");
        if (mouseListener.longTouch != null) {
          clearTimeout(mouseListener.longTouch);
          mouseListener.longTouch = null;
          component3D.stopLongTouchAnimation();
        }

        if (ev.targetTouches.length === 1) {
          var clickCount = 1;
          if (mouseListener.initialPointerLocation != null
              && mouseListener.distance(ev.canvasX, ev.canvasY,
                  mouseListener.initialPointerLocation [0], mouseListener.initialPointerLocation [1]) < 5 
              && ev.timeStamp - mouseListener.firstTouchStartedTimeStamp <= HomeComponent3D.DOUBLE_TOUCH_DELAY) { 
            clickCount = 2;
            mouseListener.firstTouchStartedTimeStamp = 0;
            mouseListener.initialPointerLocation = null;
          } else {
            mouseListener.firstTouchStartedTimeStamp = ev.timeStamp;
            mouseListener.initialPointerLocation = [ev.canvasX, ev.canvasY];
          }
                
          mouseListener.longTouchActivated = false;
          mouseListener.doubleLongTouchActivated = false;
          mouseListener.distanceLastPinch = null;
          mouseListener.lastPointerLocation = [ev.canvasX, ev.canvasY];
          mouseListener.actionStartedInComponent3D = true;
          mouseListener.longTouchWhenDragged = false;
          if (preferences.isEditingIn3DViewEnabled()
              && clickCount == 1
              && component3D.getClosestSelectableItemAt(ev.canvasX, ev.canvasY) !== null) {
            mouseListener.longTouch = setTimeout(function() {
              component3D.startLongTouchAnimation(ev.canvasX, ev.canvasY, 
                  function() {
                    // Simulate shift key press
                    mouseListener.longTouchActivated = true;
                    controller.setAlignmentActivated(true);
                  });
                }, HomeComponent3D.LONG_TOUCH_DELAY);
            mouseListener.longTouchStartTime = Date.now();
          }
              
          controller.pressMouse(ev.canvasX, ev.canvasY, 
              clickCount, mouseListener.isShiftDown(ev), mouseListener.isAlignmentActivated(ev), 
              mouseListener.isDuplicationActivated(ev), mouseListener.isMagnetismToggled(ev), View.PointerType.TOUCH);
        } else {
          if (mouseListener.longTouchActivated
              && ev.targetTouches.length === 2) {
            // Simulate alt + shift key press
            mouseListener.doubleLongTouchActivated = true;
            controller.setDuplicationActivated(true);
          } else  {
            // Additional touch allows to escape current modification 
            controller.escape();
          }
            
          if (ev.targetTouches.length === 2) {
            mouseListener.actionStartedInComponent3D = true;
            mouseListener.initialPointerLocation = null;
            mouseListener.distanceLastPinch = mouseListener.distance(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY, 
                ev.targetTouches[1].clientX, ev.targetTouches[1].clientY);
          }
        }
      },
      touchMoved: function(ev) {
        if (mouseListener.actionStartedInComponent3D) {
          ev.preventDefault();
          ev.stopPropagation();
          if (mouseListener.updateCoordinates(ev, "touchMoved")) {
            mouseListener.initialPointerLocation = null;
            
            if (ev.targetTouches.length == 1) {
              if (mouseListener.longTouch != null) {
                // Cancel long touch animation only when pointer moved during the past 200 ms
                clearTimeout(mouseListener.longTouch);
                mouseListener.longTouch = null;
                component3D.stopLongTouchAnimation();
              }
              
              if (controller.isEditingState()) {
                if (!mouseListener.doubleLongTouchActivated) {
                  controller.moveMouse(ev.canvasX, ev.canvasY);
                }
              } else {
                if (component3D.home.getCamera() === component3D.home.getObserverCamera()) {
                  mouseListener.moveCamera(-ev.canvasX, -ev.canvasY, 
                      -mouseListener.lastPointerLocation [0], -mouseListener.lastPointerLocation [1], false, false);
                } else {
                  mouseListener.moveCamera(ev.canvasX, ev.canvasY, 
                     mouseListener.lastPointerLocation [0], mouseListener.lastPointerLocation [1], false, false);
                }
              }
              mouseListener.lastPointerLocation = [ev.canvasX, ev.canvasY];
            } else if (ev.targetTouches.length == 2
                       && mouseListener.distanceLastPinch != null) {
              if (controller.isEditingState()) {
                controller.moveMouse(ev.targetTouches[1].clientX, ev.targetTouches[1].clientY);
              } else {
                var newDistance = mouseListener.distance(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY, 
                    ev.targetTouches[1].clientX, ev.targetTouches[1].clientY);
                var scaleDifference = newDistance / mouseListener.distanceLastPinch;
                mouseListener.zoomCamera((1 - scaleDifference) * 50, false);
                mouseListener.distanceLastPinch = newDistance;
              }
            }
          }
        }
      },
      touchEnded: function(ev) {
        if (mouseListener.actionStartedInComponent3D) {
          mouseListener.updateCoordinates(ev, "touchEnded");
          if (ev.targetTouches.length == 0) {
            if (mouseListener.longTouch != null) {
              clearTimeout(mouseListener.longTouch);
              mouseListener.longTouch = null;
              component3D.stopLongTouchAnimation();
            }
          
            controller.releaseMouse(mouseListener.lastPointerLocation [0], mouseListener.lastPointerLocation [1]);
            
            if (mouseListener.isLongTouch()) {
              // Avoid firing contextmenu event
              ev.preventDefault();
            }
            mouseListener.actionStartedInComponent3D = false;
          } else if (ev.targetTouches.length == 1) {
            mouseListener.lastPointerLocation = [ev.canvasX, ev.canvasY];
          } else if (ev.targetTouches.length == 2
                     && mouseListener.distanceLastPinch != null) {
            // If the user keeps 2 finger on screen after releasing other fingers 
            mouseListener.distanceLastPinch = mouseListener.distance(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY, 
                ev.targetTouches[1].clientX, ev.targetTouches[1].clientY)
          }
        }
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
        var rect = component3D.canvas3D.getHTMLElement().getBoundingClientRect();
        var updated = true; 
        if (type.indexOf("touch") === 0) {
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
            var rect = component3D.canvas3D.getHTMLElement().getBoundingClientRect();
            ev.clientX = touches[0].clientX;
            ev.clientY = touches[0].clientY;
            ev.button = 0;
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
                ? HomeComponent3D.LONG_TOUCH_DELAY_WHEN_DRAGGING 
                : HomeComponent3D.LONG_TOUCH_DELAY) + HomeComponent3D.LONG_TOUCH_DURATION_AFTER_DELAY);
      },
      distance: function(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      },
      isInCanvas: function(ev) {
        return ev.canvasX >= 0 && ev.canvasX < component3D.canvas3D.getHTMLElement().clientWidth
            && ev.canvasY >= 0 && ev.canvasY < component3D.canvas3D.getHTMLElement().clientHeight;
      },
      mouseScrolled : function(ev) {
        mouseListener.zoomCamera(ev.detail, ev.shiftKey);
      },
      mouseWheelMoved : function(ev) {
        ev.preventDefault();
        if (!controller.isEditingState()) {
          mouseListener.zoomCamera((ev.deltaY !== undefined ? ev.deltaY : -ev.wheelDelta) / 4, ev.shiftKey);
        }
      },        
      zoomCamera : function(delta, shiftKey) {
        // Mouse wheel changes camera location 
        var delta = -2.5 * delta;
        // Multiply delta by 10 if shift is down
        if (shiftKey) {
          delta *= 5;
        } 
        controller.moveCamera(delta);
      },
      moveCamera: function(x, y, lastX, lastY, altKey, shiftKey) {
        if (mouseListener.actionStartedInComponent3D
            && (mouseListener.lastPointerLocation [0] !== x
                || mouseListener.lastPointerLocation [1] !== y)) {
          if (altKey) {
            // Mouse move along Y axis while alt is down changes camera location
            var delta = 1.25 * (lastY - y);
            // Multiply delta by 5 if shift is down
            if (shiftKey) {
              delta *= 5;
            } 
            controller.moveCamera(delta);
          } else {
            var ANGLE_FACTOR = 0.005;
            // Mouse move along X axis changes camera yaw 
            var yawDelta = ANGLE_FACTOR * (x - lastX);
            // Multiply yaw delta by 5 if shift is down
            if (shiftKey) {
              yawDelta *= 5;
            } 
            controller.rotateCameraYaw(yawDelta);
            
            // Mouse move along Y axis changes camera pitch 
            var pitchDelta = ANGLE_FACTOR * (y - lastY);
            controller.rotateCameraPitch(pitchDelta);
          }
        }
      }
    };
    
  if (OperatingSystem.isInternetExplorerOrLegacyEdge()
      && window.PointerEvent) {
    // Multi touch support for IE and Edge
    // IE and Edge test from https://stackoverflow.com/questions/31757852/how-can-i-detect-internet-explorer-ie-and-microsoft-edge-using-javascript
    canvas3D.getHTMLElement().addEventListener("pointerdown", mouseListener.pointerPressed);
    canvas3D.getHTMLElement().addEventListener("mousedown", mouseListener.pointerMousePressed);
    canvas3D.getHTMLElement().addEventListener("dblclick", mouseListener.mouseDoubleClicked);
    // Add pointermove and pointerup event listeners to window to capture pointer events out of the canvas 
    window.addEventListener("pointermove", mouseListener.windowPointerMoved);
    window.addEventListener("pointerup", mouseListener.windowPointerReleased);
  } else {
    canvas3D.getHTMLElement().addEventListener("touchstart", mouseListener.touchStarted);
    canvas3D.getHTMLElement().addEventListener("touchmove", mouseListener.touchMoved);
    canvas3D.getHTMLElement().addEventListener("touchend", mouseListener.touchEnded);
    canvas3D.getHTMLElement().addEventListener("mousedown", mouseListener.mousePressed);
    canvas3D.getHTMLElement().addEventListener("dblclick", mouseListener.mouseDoubleClicked);
    // Add mousemove and mouseup event listeners to window to capture mouse events out of the canvas 
    window.addEventListener("mousemove", mouseListener.windowMouseMoved);
    window.addEventListener("mouseup", mouseListener.windowMouseReleased);
  }
  canvas3D.getHTMLElement().addEventListener("contextmenu", mouseListener.contextMenuDisplayed);
  canvas3D.getHTMLElement().addEventListener("DOMMouseScroll", mouseListener.mouseScrolled);
  canvas3D.getHTMLElement().addEventListener("mousewheel", mouseListener.mouseWheelMoved);

  this.mouseListener = mouseListener;
}

/**
 * @private 
 */
HomeComponent3D.prototype.startLongTouchAnimation = function(x, y, animationPostTask) {
  if (this.touchOverlay === undefined) {
    this.touchOverlay = document.createElement("div");
    this.touchOverlay.id = "touch-overlay-timer";
    this.touchOverlay.classList.add("touch-overlay-timer");
    this.touchOverlay.style.position = "absolute";
    this.touchOverlay.style.top = "0px";
    this.touchOverlay.style.left = "0px";
    this.touchOverlay.innerHTML = '<div class="touch-overlay-timer-content"></div><div class="touch-overlay-timer-bg"></div><div class="touch-overlay-timer-hidder"></div><div class="touch-overlay-timer-loader1"></div><div class="touch-overlay-timer-loader2"></div>';
    document.body.appendChild(this.touchOverlay);
    for (var i = 0; i < this.touchOverlay.children.length; i++) {
      var item = this.touchOverlay.children.item(i);
      if (item.classList.contains("overlay-timer-loader1")
          || item.classList.contains("overlay-timer-loader2")) {
        item.style.borderTopColor = "#0000B5";
        item.style.borderRightColor = "#0000B5";
      }
      if (item.classList.contains("touch-overlay-timer-content")) {
        item.style.color = "#000000";
        item.innerHTML = "<span style='font-weight: bold; font-family: sans-serif; font-size: 140%; line-height: 90%'>&#x21EA;</span>";
      }
      item.style.animationDuration = (PlanComponent.LONG_TOUCH_DURATION_AFTER_DELAY) + "ms";
    }
  }
  this.touchOverlay.style.visibility = "visible";
  this.touchOverlay.style.left = (this.getHTMLElement().getBoundingClientRect().left + x - this.touchOverlay.clientWidth / 2) + "px";
  this.touchOverlay.style.top = (this.getHTMLElement().getBoundingClientRect().top + y - this.touchOverlay.clientHeight - 40) + "px";
  for (var i = 0; i < this.touchOverlay.children.length; i++) {
    this.touchOverlay.children.item(i).classList.add("animated");
  }
  if (animationPostTask !== undefined) {
    this.longTouchAnimationPostTask = setTimeout(animationPostTask, HomeComponent3D.LONG_TOUCH_DURATION_AFTER_DELAY);
  }
}

/**
 * @private 
 */
HomeComponent3D.prototype.stopLongTouchAnimation = function(x, y) {
  if (this.touchOverlay !== undefined) {
    this.touchOverlay.style.visibility = "hidden";
    for (var i = 0; i < this.touchOverlay.children.length; i++) {
      this.touchOverlay.children.item(i).classList.remove("animated");
    }
    if (this.longTouchAnimationPostTask !== undefined) {
      clearTimeout(this.longTouchAnimationPostTask);
      delete this.longTouchAnimationPostTask;
    }
  }
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
      "pressed ESCAPE" : "ESCAPE",
      "shift pressed ESCAPE" : "ESCAPE"
    };
    
  if (OperatingSystem.isMacOSX()) {
    // Under Mac OS X, duplication with Alt key
    this.inputMap["alt pressed ALT"] = "ACTIVATE_DUPLICATION";
    this.inputMap["released ALT"] = "DEACTIVATE_DUPLICATION";
    this.inputMap["shift alt pressed ALT"] = "ACTIVATE_DUPLICATION";
    this.inputMap["shift released ALT"] = "DEACTIVATE_DUPLICATION";
    this.inputMap["meta alt pressed ALT"] = "ACTIVATE_DUPLICATION";
    this.inputMap["meta released ALT"] = "DEACTIVATE_DUPLICATION";
    this.inputMap["shift meta alt pressed ALT"] = "ACTIVATE_DUPLICATION";
    this.inputMap["shift meta released ALT"] = "DEACTIVATE_DUPLICATION";
    this.inputMap["alt pressed ESCAPE"] = "ESCAPE";
  } else {
    // Under other systems, duplication with Ctrl key
    this.inputMap["control pressed CONTROL"] = "ACTIVATE_DUPLICATION";
    this.inputMap["released CONTROL"] = "DEACTIVATE_DUPLICATION";
    this.inputMap["shift control pressed CONTROL"] = "ACTIVATE_DUPLICATION";
    this.inputMap["shift released CONTROL"] = "DEACTIVATE_DUPLICATION";
    this.inputMap["meta control pressed CONTROL"] = "ACTIVATE_DUPLICATION";
    this.inputMap["meta released CONTROL"] = "DEACTIVATE_DUPLICATION";
    this.inputMap["shift meta control pressed CONTROL"] = "ACTIVATE_DUPLICATION";
    this.inputMap["shift meta released CONTROL"] = "DEACTIVATE_DUPLICATION";
    this.inputMap["control pressed ESCAPE"] = "ESCAPE";
  }
  if (OperatingSystem.isWindows()) {
    // Under Windows, magnetism toggled with Alt key
    this.inputMap["alt pressed ALT"] = "TOGGLE_MAGNETISM_ON";
    this.inputMap["released ALT"] = "TOGGLE_MAGNETISM_OFF";
    this.inputMap["shift alt pressed ALT"] = "TOGGLE_MAGNETISM_ON";
    this.inputMap["shift released ALT"] = "TOGGLE_MAGNETISM_OFF";
    this.inputMap["control alt pressed ALT"] = "TOGGLE_MAGNETISM_ON";
    this.inputMap["control released ALT"] = "TOGGLE_MAGNETISM_OFF";
    this.inputMap["shift control alt pressed ALT"] = "TOGGLE_MAGNETISM_ON";
    this.inputMap["shift control released ALT"] = "TOGGLE_MAGNETISM_OFF";
    this.inputMap["alt pressed ESCAPE"] = "ESCAPE";
  } else if (OperatingSystem.isMacOSX()) {
    // Under Mac OS X, magnetism toggled with cmd key
    this.inputMap["meta pressed META"] = "TOGGLE_MAGNETISM_ON";
    this.inputMap["released META"] = "TOGGLE_MAGNETISM_OFF";
    this.inputMap["shift meta pressed META"] = "TOGGLE_MAGNETISM_ON";
    this.inputMap["shift released META"] = "TOGGLE_MAGNETISM_OFF";
    this.inputMap["alt meta pressed META"] = "TOGGLE_MAGNETISM_ON";
    this.inputMap["alt released META"] = "TOGGLE_MAGNETISM_OFF";
    this.inputMap["shift alt meta pressed META"] = "TOGGLE_MAGNETISM_ON";
    this.inputMap["shift alt released META"] = "TOGGLE_MAGNETISM_OFF";
    this.inputMap["meta pressed ESCAPE"] = "ESCAPE";
  } else {
    // Under other Unix systems, magnetism toggled with Alt + Shift key
    this.inputMap["shift alt pressed ALT"] = "TOGGLE_MAGNETISM_ON";
    this.inputMap["alt shift pressed SHIFT"] = "TOGGLE_MAGNETISM_ON";
    this.inputMap["alt released SHIFT"] = "TOGGLE_MAGNETISM_OFF";
    this.inputMap["shift released ALT"] = "TOGGLE_MAGNETISM_OFF";
    this.inputMap["control shift alt pressed ALT"] = "TOGGLE_MAGNETISM_ON";
    this.inputMap["control alt shift pressed SHIFT"] = "TOGGLE_MAGNETISM_ON";
    this.inputMap["control alt released SHIFT"] = "TOGGLE_MAGNETISM_OFF";
    this.inputMap["control shift released ALT"] = "TOGGLE_MAGNETISM_OFF";
    this.inputMap["alt shift ESCAPE"] = "ESCAPE";
    this.inputMap["control alt shift pressed ESCAPE"] = "ESCAPE";
  }

  this.inputMap["shift pressed SHIFT"] = "ACTIVATE_ALIGNMENT";
  this.inputMap["released SHIFT"] = "DEACTIVATE_ALIGNMENT";
  if (OperatingSystem.isWindows()) {
    this.inputMap["control shift pressed SHIFT"] = "ACTIVATE_ALIGNMENT";
    this.inputMap["control released SHIFT"] = "DEACTIVATE_ALIGNMENT";
    this.inputMap["alt shift pressed SHIFT"] = "ACTIVATE_ALIGNMENT";
    this.inputMap["alt released SHIFT"] = "DEACTIVATE_ALIGNMENT";
  } else if (OperatingSystem.isMacOSX()) {
    this.inputMap["alt shift pressed SHIFT"] = "ACTIVATE_ALIGNMENT";
    this.inputMap["alt released SHIFT"] = "DEACTIVATE_ALIGNMENT";
    this.inputMap["meta shift pressed SHIFT"] = "ACTIVATE_ALIGNMENT";
    this.inputMap["meta released SHIFT"] = "DEACTIVATE_ALIGNMENT";
  } else {
    this.inputMap["control shift pressed SHIFT"] = "ACTIVATE_ALIGNMENT";
    this.inputMap["control released SHIFT"] = "DEACTIVATE_ALIGNMENT";
    this.inputMap["shift released ALT"] = "ACTIVATE_ALIGNMENT";
    this.inputMap["control shift released ALT"] = "ACTIVATE_ALIGNMENT";
  }
  
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
      "ESCAPE": {
          actionPerformed: function(ev) {
            controller.escape();
          }
        },
      "ACTIVATE_ALIGNMENT": {
          actionPerformed: function(ev) {
            controller.setAlignmentActivated(true);
          }
        },
      "DEACTIVATE_ALIGNMENT": {
          actionPerformed: function(ev) {
            controller.setAlignmentActivated(false);
          }
        },
      "TOGGLE_MAGNETISM_ON": {
          actionPerformed: function(ev) {
            controller.toggleMagnetism(true);
          }
        },
      "TOGGLE_MAGNETISM_OFF": {
          actionPerformed: function(ev) {
            controller.toggleMagnetism(false);
          }
        },
      "ACTIVATE_DUPLICATION": {
          actionPerformed: function(ev) {
            controller.setDuplicationActivated(true);
          }
        },
      "DEACTIVATE_DUPLICATION": {
          actionPerformed: function(ev) {
            controller.setDuplicationActivated(false);
          }
        }
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
 * @deprecated
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
 * Returns the closest home item displayed at component coordinates (x, y),
 * or <code>null</code> if not found. 
 * @param {number} x
 * @param {number} y
 * @return {Selectable}
 */
HomeComponent3D.prototype.getClosestSelectableItemAt = function(x, y) {
  var rect = component3D.canvas3D.getHTMLElement().getBoundingClientRect();
  return this.getClosestItemAt(x + rect.left, y + rect.top);
}

/**
 * Returns the 3D point matching the point (x, y) in component coordinates space.
 * @return {vec3}
 * @private 
 */
HomeComponent3D.prototype.convertPixelLocationToVirtualWorldPoint = function(x, y) {
  // See http://webglfactory.blogspot.com/2011/05/how-to-convert-world-to-screen.html
  var transform = this.canvas3D.getVirtualWorldToImageTransform(mat4.create());
  mat4.invert(transform, transform);
  mat4.mul(transform, this.canvas3D.getViewPlatformTransform(mat4.create()), transform);
  
  var rect = this.getHTMLElement().getBoundingClientRect();
  var point = vec3.fromValues((x / rect.width - 0.5) * 2, (0.5 - y / rect.height) * 2, 0);
  vec3.transformMat4(point, point, transform);
  return point;
}

/**
 * Returns the 3D point matching the point (x, y) in component coordinates space.
 * @return {Array}
 */
HomeComponent3D.prototype.convertPixelLocationToVirtualWorld = function(x, y) {
  var point = this.convertPixelLocationToVirtualWorldPoint(x, y);
  return [point [0], point [2], point [1]];
}

/**
 * Returns the coordinates intersecting the floor of the selected level in the direction
 * joining camera location and component coordinates (x, y).
 */
HomeComponent3D.prototype.getVirtualWorldPointAt = function(x, y, elevation) {
  var point = this.convertPixelLocationToVirtualWorldPoint(x, y);
  var camera = this.home.getCamera();
  var eye = vec3.fromValues(camera.getX(), camera.getZ(), camera.getY());
  var eyePointDirection = vec3.sub(vec3.fromValues(0, 0, 0), point, eye);
  // If direction points to the sky, negate it to point to the ground
  if (eyePointDirection [1] > 0) {
    eyePointDirection [1] = -eyePointDirection [1];
  }

  // Compute coordinates of the intersection point between the line joining
  // eye and the given point with the plan y = elevation
  // Parametric equation of the line
  // x = point.x + t . direction.x
  // y = point.y + t . direction.y
  // z = point.z + t . direction.z
  var t = (elevation - point [1]) / eyePointDirection [1];
  var xFloor = (point [0] + t * eyePointDirection [0]);
  var zFloor = (point [2] + t * eyePointDirection [2]);
  return [xFloor, zFloor, elevation];
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
      var component3D = this;
      // Add a listener on ground color and texture properties change
      this.groundChangeListener = function(ev) {
          if (!component3D.groundChangeListener.updater) {
            component3D.groundChangeListener.updater = function() {
                ground3D.update();
                delete component3D.groundChangeListener.updater;
              };
            setTimeout(component3D.groundChangeListener.updater, 0);
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
  // Add walls, pieces, rooms, polylines, dimension lines and labels already available
  var labels = this.home.getLabels();
  for (var i = 0; i < labels.length; i++) {
    this.addObject(homeRoot, labels [i], listenToHomeUpdates, waitForLoading);
  }
  var dimensionLines = this.home.getDimensionLines();
  for (var i = 0; i < dimensionLines.length; i++) {
    this.addObject(homeRoot, dimensionLines [i], listenToHomeUpdates, waitForLoading);
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
    this.addDimensionLineListener(homeRoot);
    this.addLabelListener(homeRoot);
    this.addEnvironmentListeners();
    component3D = this;
    this.selectionListener = {
       selectionChanged: function(ev) {
          component3D.updateObjectsAndFurnitureGroups(ev.getOldSelectedItems());
          component3D.updateObjectsAndFurnitureGroups(ev.getSelectedItems());
        }
      };
    this.home.addSelectionListener(this.selectionListener);
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
 * Adds a dimension line listener to home dimension lines that updates the children of the given
 * <code>group</code>, each time a dimension line is added, updated or deleted.
 * @param {Group3D} group
 * @private
 */
HomeComponent3D.prototype.addDimensionLineListener = function(group) {
  var component3D = this;
  this.dimensionLineChangeListener = function(ev) {
      var updatedDimensionLine = ev.getSource();
      component3D.updateObjects([updatedDimensionLine]);
    };
  var dimensionLines = this.home.getDimensionLines();
  for (var i = 0; i < dimensionLines.length; i++) {
    dimensionLines [i].addPropertyChangeListener(this.dimensionLineChangeListener);
  }
  this.dimensionLineListener = function(ev) {
      var dimensionLine = ev.getItem();
      switch (ev.getType()) {
        case CollectionEvent.Type.ADD :
          component3D.addObject(group, dimensionLine, true, false);
          dimensionLine.addPropertyChangeListener(component3D.dimensionLineChangeListener);
          break;
        case CollectionEvent.Type.DELETE :
          component3D.deleteObject(dimensionLine);
          dimensionLine.removePropertyChangeListener(component3D.dimensionLineChangeListener);
          break;
      }
    };
  this.home.addDimensionLinesListener(this.dimensionLineListener);
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
 * Updates 3D objects and furniture groups children, if <code>objects</code> contains some groups.
 * @param {Array} objects
 * @private
 */
HomeComponent3D.prototype.updateObjectsAndFurnitureGroups = function(objects) {
  this.updateObjects(objects);
  for (var i = 0; i < objects.length; i++) {
    var item = objects [i];
    if (item instanceof HomeFurnitureGroup) {
      this.updateObjects(item.getAllFurniture());
    }
  }
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
 * @param {UserPreferences} [preferences]
 * @constructor
 * @author Emmanuel Puybaret
 */
function Object3DBranchFactory(preferences) {
  if (preferences !== undefined) {
    this.preferences = preferences;
  }
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
    return new HomePieceOfFurniture3D(item, home, this.preferences, waitForLoading);
  } else if (item instanceof Wall) {
    return new Wall3D(item, home, this.preferences, waitForLoading);
  } else if (item instanceof Room) {
    return new Room3D(item, home, this.preferences, false, waitForLoading);
  } else if (item instanceof Polyline) {
    return new Polyline3D(item, home, this.preferences, waitForLoading);
  } else if (item instanceof DimensionLine) {
    return new DimensionLine3D(item, home, this.preferences, waitForLoading);
  } else if (item instanceof Label) {
     return new Label3D(item, home, this.preferences, waitForLoading);
  } else {
    return new Group3D();
  }  
}
