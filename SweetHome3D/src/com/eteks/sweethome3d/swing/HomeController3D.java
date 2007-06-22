/*
 * HomeController3D.java 21 juin 07
 *
 * Copyright (c) 2007 Emmanuel PUYBARET / eTeks <info@eteks.com>. All Rights Reserved.
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
package com.eteks.sweethome3d.swing;

import java.awt.geom.Rectangle2D;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.swing.JComponent;

import com.eteks.sweethome3d.model.Camera;
import com.eteks.sweethome3d.model.FurnitureEvent;
import com.eteks.sweethome3d.model.FurnitureListener;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomePieceOfFurniture;
import com.eteks.sweethome3d.model.Wall;
import com.eteks.sweethome3d.model.WallEvent;
import com.eteks.sweethome3d.model.WallListener;

/**
 * A MVC controller for the home 3D view.
 * @author Emmanuel Puybaret
 */
public class HomeController3D {
  private Home       home;
  private JComponent home3DView;
  // Current state
  private CameraControllerState cameraState;
  // Possibles states
  private CameraControllerState topCameraState;
  private CameraControllerState observerCameraState;

  /**
   * Creates the controller of home 3D view.
   * @param home the home edited by this controller and its view
   */
  public HomeController3D(Home home) {
    this.home = home;
    // Create view
    this.home3DView = new HomeComponent3D(home, this);
    // Initialize states
    this.topCameraState = new TopCameraState();
    this.observerCameraState = new ObserverCameraState();
    // Set defaut state 
    setCameraState(home.getCamera() == home.getTopCamera() 
        ? this.topCameraState
        : this.observerCameraState);
  }

  /**
   * Returns the view associated with this controller.
   */
  public JComponent getView() {
    return this.home3DView;
  }

  /**
   * Changes home camera for {@link Home#getTopCamera() top camera}.
   */
  public void viewFromTop() {
    this.home.setCamera(this.home.getTopCamera());
    setCameraState(getTopCameraState());              
  }
  
  /**
   * Changes home camera for {@link Home#getObserverCamera() observer camera}.
   */
  public void viewFromObserver() {
    this.home.setCamera(this.home.getObserverCamera());
    setCameraState(getObserverCameraState());
  }

  /**
   * Changes current state of controller.
   */
  protected void setCameraState(CameraControllerState state) {
    if (this.cameraState != null) {
      this.cameraState.exit();
    }
    this.cameraState = state;
    this.cameraState.enter();
  }
  
  /**
   * Moves home camera of <code>delta</code>.
   */
  public void moveCamera(float delta) {
    this.cameraState.moveCamera(delta);
  }

  /**
   * Rotates home camera yaw angle of <code>delta</code> radians.
   */
  public void rotateCameraYaw(float delta) {
    this.cameraState.rotateCameraYaw(delta);
  }

  /**
   * Rotates home camera pitch angle of <code>delta</code> radians.
   */
  public void rotateCameraPitch(float delta) {
    this.cameraState.rotateCameraPitch(delta);
  }

  /**
   * Returns the observer camera state.
   */
  protected CameraControllerState getObserverCameraState() {
    return this.observerCameraState;
  }

  /**
   * Returns the top camera state.
   */
  protected CameraControllerState getTopCameraState() {
    return this.topCameraState;
  }

  /**
   * Controller state classes super class.
   */
  protected static abstract class CameraControllerState {
    public void enter() {
    }

    public void exit() {
    }

    public void moveCamera(float delta) {
    }

    public void rotateCameraYaw(float delta) {
    }

    public void rotateCameraPitch(float delta) {
    }
  }
  
  // CameraControllerState subclasses

  /**
   * Top camera controller state. 
   */
  private class TopCameraState extends CameraControllerState {
    private final float MIN_DIMENSION = 1000;
    
    private Camera topCamera;
    private Rectangle2D homeBounds = new Rectangle2D.Float(0, 0, MIN_DIMENSION, MIN_DIMENSION);
    private WallListener wallListener = new WallListener () {
        public void wallChanged(WallEvent ev) {
          updateCameraFromHomeBounds();
        }
      };
    private FurnitureListener furnitureListener = new FurnitureListener() {
        public void pieceOfFurnitureChanged(FurnitureEvent ev) {
          updateCameraFromHomeBounds();
        }
      };

    @Override
    public void enter() {
      this.topCamera = home.getCamera();
      updateCameraFromHomeBounds();
      home.addWallListener(wallListener);
      home.addFurnitureListener(furnitureListener);
    }
    
    /**
     * Updates camera location from home bounds.
     */
    private void updateCameraFromHomeBounds() {
      Rectangle2D newHomeBounds = null;
      // Compute plan bounds to include walls and furniture
      for (Wall wall : home.getWalls()) {
        if (newHomeBounds == null) {
          newHomeBounds = new Rectangle2D.Float(wall.getXStart(), wall.getYStart(), 0, 0);
        } else {
          newHomeBounds.add(wall.getXStart(), wall.getYStart());
        }
        newHomeBounds.add(wall.getXEnd(), wall.getYEnd());
      }
      for (HomePieceOfFurniture piece : home.getFurniture()) {
        if (piece.isVisible()) {
          for (float [] point : piece.getPoints()) {
            if (newHomeBounds == null) {
              newHomeBounds = new Rectangle2D.Float(point [0], point [1], 0, 0);
            } else {
              newHomeBounds.add(point [0], point [1]);
            }
          }
        }
      }
      if (newHomeBounds == null) {
        newHomeBounds = new Rectangle2D.Float(0, 0, MIN_DIMENSION, MIN_DIMENSION);
      } else {
        // Ensure plan bounds are always minimum 10 meters wide centered in middle of 3D view
        newHomeBounds = new Rectangle2D.Float(
            (float)(MIN_DIMENSION < newHomeBounds.getWidth() 
                        ? newHomeBounds.getMinX()
                        : newHomeBounds.getCenterX() - MIN_DIMENSION / 2), 
            (float)(MIN_DIMENSION < newHomeBounds.getHeight() 
                        ? newHomeBounds.getMinY()
                        : newHomeBounds.getCenterY() - MIN_DIMENSION / 2), 
            (float)Math.max(MIN_DIMENSION, newHomeBounds.getWidth()), 
            (float)Math.max(MIN_DIMENSION, newHomeBounds.getHeight()));
      }

      float deltaZ = (float)(Math.max(this.homeBounds.getWidth(), this.homeBounds.getHeight())  
          - Math.max(newHomeBounds.getWidth(), newHomeBounds.getHeight()));
      this.homeBounds = newHomeBounds;
      moveCamera(deltaZ);
    }
    
    @Override
    public void moveCamera(float delta) {
      float newZ = this.topCamera.getZ() - (float)Math.sin(this.topCamera.getPitch()) * delta;
      // Check new evelvation is between home wall height and a half, and 3 times its largest dimension  
      newZ = Math.max(newZ, home.getWallHeight() * 1.5f);
      newZ = Math.min(newZ, (float)Math.max(this.homeBounds.getWidth(), this.homeBounds.getHeight()) * 3);
      double distanceToCenterAtGroundLevel = newZ / (float)Math.tan(this.topCamera.getPitch());
      home.setCameraLocation(this.topCamera, 
          (float)this.homeBounds.getCenterX() + (float)(Math.sin(this.topCamera.getYaw()) * distanceToCenterAtGroundLevel), 
          (float)this.homeBounds.getCenterY() - (float)(Math.cos(this.topCamera.getYaw()) * distanceToCenterAtGroundLevel),
          newZ);
    }

    @Override
    public void rotateCameraYaw(float delta) {
      float  newYaw = this.topCamera.getYaw() + delta;
      double distanceToCenterAtGroundLevel = this.topCamera.getZ() / (float)Math.tan(this.topCamera.getPitch());
      // Change camera yaw and location so user turns around home
      home.setCameraAngles(this.topCamera, newYaw, this.topCamera.getPitch()); 
      home.setCameraLocation(this.topCamera, 
          (float)this.homeBounds.getCenterX() + (float)(Math.sin(newYaw) * distanceToCenterAtGroundLevel), 
          (float)this.homeBounds.getCenterY() - (float)(Math.cos(newYaw) * distanceToCenterAtGroundLevel),
          this.topCamera.getZ());
    }
    
    @Override
    public void rotateCameraPitch(float delta) {
      float newPitch = this.topCamera.getPitch() - delta;
      // Check new pitch is between PI / 2 and PI / 8  
      newPitch = Math.max(newPitch, (float)Math.PI / 8);
      newPitch = Math.min(newPitch, (float)Math.PI / 2);
      // Compute new z to keep the same distance to view center
      double cameraToBoundsCenterDistance = Math.sqrt(Math.pow(this.topCamera.getX() - this.homeBounds.getCenterX(), 2)
          + Math.pow(this.topCamera.getY() - this.homeBounds.getCenterY(), 2)
          + Math.pow(this.topCamera.getZ(), 2));
      float newZ = (float)(cameraToBoundsCenterDistance * Math.sin(newPitch));
      double distanceToCenterAtGroundLevel = newZ / (float)Math.tan(newPitch);
      // Change camera pitch 
      home.setCameraAngles(this.topCamera, this.topCamera.getYaw(), newPitch); 
      home.setCameraLocation(this.topCamera, 
          (float)this.homeBounds.getCenterX() + (float)(Math.sin(this.topCamera.getYaw()) * distanceToCenterAtGroundLevel), 
          (float)this.homeBounds.getCenterY() - (float)(Math.cos(this.topCamera.getYaw()) * distanceToCenterAtGroundLevel),
          newZ);
    }
    
    @Override
    public void exit() {
      this.topCamera = null;
      home.removeWallListener(wallListener);
      home.removeFurnitureListener(furnitureListener);
    }
  }
  
  /**
   * Observer camera controller state. 
   */
  private class ObserverCameraState extends CameraControllerState {
    private Camera observerCamera;

    @Override
    public void enter() {
      this.observerCamera = home.getCamera();
      // Select observer camera for user feedback
      home.setSelectedItems(Arrays.asList(new Object [] {this.observerCamera}));
    }
    
    @Override
    public void moveCamera(float delta) {
      home.setCameraLocation(this.observerCamera, 
          this.observerCamera.getX() - (float)Math.sin(this.observerCamera.getYaw()) * delta, 
          this.observerCamera.getY() + (float)Math.cos(this.observerCamera.getYaw()) * delta,
          this.observerCamera.getZ());
      // Select observer camera for user feedback
      home.setSelectedItems(Arrays.asList(new Object [] {this.observerCamera}));
    }

    @Override
    public void rotateCameraYaw(float delta) {
      home.setCameraAngles(this.observerCamera, 
          this.observerCamera.getYaw() + delta, this.observerCamera.getPitch()); 
      // Select observer camera for user feedback
      home.setSelectedItems(Arrays.asList(new Object [] {this.observerCamera}));
    }
    
    @Override
    public void rotateCameraPitch(float delta) {
      float newPitch = this.observerCamera.getPitch() + delta; 
      // Check new angle is between -60� and 75�  
      newPitch = Math.max(newPitch, -(float)Math.PI / 3);
      newPitch = Math.min(newPitch, (float)Math.PI / 36 * 15);
      home.setCameraAngles(this.observerCamera, this.observerCamera.getYaw(), newPitch); 
      // Select observer camera for user feedback
      home.setSelectedItems(Arrays.asList(new Object [] {this.observerCamera}));
    }
    
    @Override
    public void exit() {
      // Remove observer camera from selection
      List<Object> selectedItems = home.getSelectedItems();
      if (selectedItems.contains(this.observerCamera)) {
        selectedItems = new ArrayList<Object>(selectedItems);
        selectedItems.remove(this.observerCamera);
        home.setSelectedItems(selectedItems);
      }
      this.observerCamera = null;
    }
  }
}
