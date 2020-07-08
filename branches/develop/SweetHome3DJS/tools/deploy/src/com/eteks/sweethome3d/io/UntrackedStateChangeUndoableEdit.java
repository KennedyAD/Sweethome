package com.eteks.sweethome3d.io;

import javax.swing.undo.AbstractUndoableEdit;
import javax.swing.undo.CannotRedoException;

import com.eteks.sweethome3d.model.Camera;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.ObserverCamera;

/**
 * An undoable edit for objects that are not tracked in the scope of regular
 * undoable edits.
 * 
 * WARNING: do not change the fully qualified name of this class unless you change the associated incremental recorder.
 * 
 * @author Renaud Pawlak
 */
@SuppressWarnings("serial")
public class UntrackedStateChangeUndoableEdit extends AbstractUndoableEdit {

  private final Home            home;
  private final Camera          topCamera;
  private final ObserverCamera  observerCamera;
  
  public UntrackedStateChangeUndoableEdit(Home home, Camera topCamera, ObserverCamera observerCamera) {
    super();
    this.home = home;
    this.topCamera = topCamera;
    this.observerCamera = observerCamera;
  }

  @Override
  public void redo() throws CannotRedoException {
    super.redo();
    this.home.getTopCamera().setCamera(this.topCamera);
    this.home.getObserverCamera().setCamera(this.observerCamera);
  }
  
}
