/*
 * TrackedStateChangeUndoableEdit.java
 *
 * Sweet Home 3D, Copyright (c) 2020 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
package com.eteks.sweethome3d.io;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.swing.undo.AbstractUndoableEdit;
import javax.swing.undo.CannotRedoException;

import com.eteks.sweethome3d.model.Camera;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomePieceOfFurniture;
import com.eteks.sweethome3d.model.Level;
import com.eteks.sweethome3d.model.ObserverCamera;

/**
 * An undoable edit for objects/values that are not tracked in the scope of
 * regular undoable edits, but which should be still saved in a home.
 * This class is instantiated only by reflection by {@link HomeEditsDeserializer} on server side
 * which fills the value of its fields with the ones received by a map sent by client.
 *
 * WARNING: do not change the fully qualified name of this class unless you
 * change the associated incremental recorder.
 *
 * @author Renaud Pawlak
 */
@SuppressWarnings("serial")
class TrackedStateChangeUndoableEdit extends AbstractUndoableEdit {
  private Home                home;
  private Level               selectedLevel;
  private List<Camera>        storedCameras;
  private Camera              camera;
  private List<String>        furnitureVisibleProperties;
  private String              furnitureSortedProperty;
  private Boolean             furnitureDescendingSorted;
  private Map<String, String> homeProperties;
  private Boolean             observerCameraElevationAdjusted;
  private Boolean             allLevelsVisible;
  private Camera              topCamera;
  private ObserverCamera      observerCamera;

  private TrackedStateChangeUndoableEdit() {
  }

  @Override
  public void redo() throws CannotRedoException {
    super.redo();
    if (this.selectedLevel != null) {
      this.home.setSelectedLevel(this.selectedLevel);
    }
    if (this.storedCameras != null) {
      this.home.setStoredCameras(this.storedCameras);
    }
    if (this.camera != null) {
      this.home.setCamera(this.camera);
    }
    if (this.furnitureVisibleProperties != null) {
      List<HomePieceOfFurniture.SortableProperty> furnitureVisibleProperties = new ArrayList<HomePieceOfFurniture.SortableProperty>();
      for (String furnitureVisibleProperty : this.furnitureVisibleProperties) {
        try {
          furnitureVisibleProperties.add(
              HomePieceOfFurniture.SortableProperty.valueOf(furnitureVisibleProperty));
        } catch (IllegalArgumentException ex) {
          // Ignore malformed enum constants
        }
      }
      this.home.setFurnitureVisibleProperties(furnitureVisibleProperties);
    }
    if (this.furnitureSortedProperty != null) {
      this.home.setFurnitureSortedProperty(HomePieceOfFurniture.SortableProperty.valueOf(this.furnitureSortedProperty));
    }
    if (this.furnitureDescendingSorted != null) {
      this.home.setFurnitureDescendingSorted(this.furnitureDescendingSorted);
    }
    if (this.homeProperties != null) {
      for (Map.Entry<String, String> property : this.homeProperties.entrySet()) {
        this.home.setProperty(property.getKey(), property.getValue());
      }
    }
    if (this.observerCameraElevationAdjusted != null) {
      home.getEnvironment().setObserverCameraElevationAdjusted(this.observerCameraElevationAdjusted);
    }
    if (this.allLevelsVisible!= null) {
      home.getEnvironment().setAllLevelsVisible(this.allLevelsVisible);
    }
    if (this.topCamera != null) {
      Camera topCamera = this.home.getTopCamera();
      topCamera.setCamera(this.topCamera);
      topCamera.setTime(this.topCamera.getTime());
      topCamera.setLens(this.topCamera.getLens());
    }
    if (this.observerCamera != null) {
      Camera observerCamera = this.home.getObserverCamera();
      observerCamera.setCamera(this.observerCamera);
      observerCamera.setTime(this.observerCamera.getTime());
      observerCamera.setLens(this.observerCamera.getLens());
    }
  }
}
