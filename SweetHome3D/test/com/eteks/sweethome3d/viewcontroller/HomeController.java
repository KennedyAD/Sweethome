/*
 * HomeController.java 15 mai 2006
 *
 * Copyright (c) 2006 Emmanuel PUYBARET / eTeks <info@eteks.com>. All Rights Reserved.
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
package com.eteks.sweethome3d.viewcontroller;

import java.util.List;

import javax.swing.undo.UndoManager;
import javax.swing.undo.UndoableEditSupport;

import com.eteks.sweethome3d.model.CatalogPieceOfFurniture;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.UserPreferences;

/**
 * A MVC controller for the home view.
 * @author Emmanuel Puybaret
 */
public class HomeController implements Controller  {
  private HomeView            homeView;
  private UndoableEditSupport undoSupport;
  private UndoManager         undoManager;
  private CatalogController   catalogController;
  private FurnitureController furnitureController;

  /**
   * Creates the controller of home view. 
   * @param viewFactory factory able to create views
   * @param home        the home edited by this controller and its view.
   * @param preferences the preferences of the application.
   */
  public HomeController(ViewFactory viewFactory, Home home, UserPreferences preferences) {
    // Create undo support objects
    this.undoSupport = new UndoableEditSupport();
    this.undoManager = new UndoManager();
    this.undoSupport.addUndoableEditListener(this.undoManager);
    // Create controllers composed by this controller
    this.catalogController   = new CatalogController(viewFactory, preferences);
    this.furnitureController = new FurnitureController(viewFactory, home, preferences, this.undoSupport);
    this.homeView = viewFactory.createHomeView(this);
  }

  /**
   * Returns the view associated with this controller.
   */
  public View getView() {
    return this.homeView;
  }

  /**
   * Returns the furniture controller managed by this controller.
   */
  public FurnitureController getFurnitureController() {
    return this.furnitureController;
  }

  /**
   * Returns the catalog controller managed by this controller.
   */
  public CatalogController getCatalogController() {
    return this.catalogController;
  }

  /**
   * Adds the selected furniture in the catalog view to home.  
   */
  public void addHomeFurniture() {
    List<CatalogPieceOfFurniture> selectedFurniture = 
         this.catalogController.getSelectedFurniture();
    this.furnitureController.addFurniture(selectedFurniture);    
  }

  /**
   * Undo last undoable edit.
   */
  public void undo() {
    if (this.undoManager.canUndo()) {
      this.undoManager.undo();
    }
  }

  /**
   * Redo last undone edit.
   */
  public void redo() {
    if (this.undoManager.canRedo()) {
      this.undoManager.redo();
    }
  }
}
