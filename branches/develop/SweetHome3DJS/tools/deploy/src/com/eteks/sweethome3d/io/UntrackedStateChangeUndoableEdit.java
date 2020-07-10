package com.eteks.sweethome3d.io;

import java.util.List;

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
public class UntrackedStateChangeUndoableEdit extends AbstractUndoableEdit {

  private final Home            home;
  private final Camera          topCamera;
  private final ObserverCamera  observerCamera;
  private final String           planScale;
  private final String           planViewportX;
  private final String           planViewportY;
  private final Camera          camera;
  private final List<Camera>    storedCameras;
  private final Level           selectedLevel;
  
  public UntrackedStateChangeUndoableEdit(Home home, Camera topCamera, ObserverCamera observerCamera, String planScale,
      String planViewportX, String planViewportY, Camera camera, List<Camera> storedCameras, Level selectedLevel) {
    super();
    this.home = home;
    this.topCamera = topCamera;
    this.observerCamera = observerCamera;
    this.planScale = planScale;
    this.planViewportX = planViewportX;
    this.planViewportY = planViewportY;
    this.camera = camera;
    this.storedCameras = storedCameras;
    this.selectedLevel = selectedLevel;
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
    if (this.camera != null) {
      this.home.setCamera(this.camera);
    }
    if (this.selectedLevel != null) {
      this.home.setSelectedLevel(this.selectedLevel);
    }
    if (this.storedCameras != null) {
      this.home.setStoredCameras(this.storedCameras);
    }
    if (this.planScale != null) {
      this.home.setProperty("com.eteks.sweethome3d.SweetHome3D.PlanScale", String.valueOf(this.planScale));
    }
    if (this.planViewportX != null) {
      this.home.setProperty("com.eteks.sweethome3d.SweetHome3D.PlanViewportX", String.valueOf(this.planViewportX));
    }
    if (this.planViewportY != null) {
      this.home.setProperty("com.eteks.sweethome3d.SweetHome3D.PlanViewportY", String.valueOf(this.planViewportY));
    }
  }
  
}
