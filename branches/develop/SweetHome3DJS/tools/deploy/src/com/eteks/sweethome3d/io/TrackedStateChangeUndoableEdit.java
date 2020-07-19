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

import java.util.List;
import java.util.Map;

import javax.swing.undo.AbstractUndoableEdit;
import javax.swing.undo.CannotRedoException;

import com.eteks.sweethome3d.model.Camera;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.Level;
import com.eteks.sweethome3d.model.ObserverCamera;

/**
 * An undoable edit for objects/values that are not tracked in the scope of
 * regular undoable edits.
 *
 * WARNING: do not change the fully qualified name of this class unless you
 * change the associated incremental recorder.
 *
 * @author Renaud Pawlak
 */
@SuppressWarnings("serial")
public class TrackedStateChangeUndoableEdit extends AbstractUndoableEdit {

  private final Home home;
  private final Camera topCamera;
  private final ObserverCamera observerCamera;
  private final Map<String, Object> homeProperties;

  public TrackedStateChangeUndoableEdit(Home home, Camera topCamera, ObserverCamera observerCamera,
      Map<String, Object> homeProperties) {
    super();
    this.home = home;
    this.topCamera = topCamera;
    this.observerCamera = observerCamera;
    this.homeProperties = homeProperties;
  }

  @Override
  public void redo() throws CannotRedoException {
    super.redo();
    if (this.topCamera != null) {
      this.home.getTopCamera().setCamera(this.topCamera);
    }
    if (this.observerCamera != null) {
      this.home.getObserverCamera().setCamera(this.observerCamera);
    }
    if (this.homeProperties != null) {
      for (Map.Entry<String, Object> property : homeProperties.entrySet()) {
        this.setProperty(property.getKey(), property.getValue());
      }
    }
  }

  @SuppressWarnings("unchecked")
  private void setProperty(String name, Object value) {
    switch (name) {
    case "CAMERA":
      this.home.setCamera((Camera) value);
      break;
    case "STORED_CAMERAS":
      this.home.setStoredCameras((List<Camera>) value);
      break;
    case "SELECTED_LEVEL":
      this.home.setSelectedLevel((Level) value);
      break;
    default:
      this.home.setProperty(name, (String) value);
    }
  }

}
