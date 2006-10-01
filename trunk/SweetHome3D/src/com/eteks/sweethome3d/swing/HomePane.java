/*
 * HomePane.java 15 mai 2006
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
package com.eteks.sweethome3d.swing;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.event.ActionEvent;
import java.util.ResourceBundle;

import javax.swing.AbstractButton;
import javax.swing.Action;
import javax.swing.ActionMap;
import javax.swing.JCheckBoxMenuItem;
import javax.swing.JComponent;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JPopupMenu;
import javax.swing.JRootPane;
import javax.swing.JScrollPane;
import javax.swing.JSplitPane;
import javax.swing.JToggleButton;
import javax.swing.JToolBar;
import javax.swing.ToolTipManager;

import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.UserPreferences;

/**
 * The MVC view that edits home. 
 * @author Emmanuel Puybaret
 */
public class HomePane extends JRootPane {
  public enum ActionType {
    UNDO, REDO, ADD_HOME_FURNITURE, DELETE_HOME_FURNITURE, 
    WALL_CREATION, DELETE_SELECTION}

  private ResourceBundle    resource;
  // Button model shared by Wall creation menu item and the matching tool bar button
  private JToggleButton.ToggleButtonModel wallCreationToggleModel;
  
  /**
   * Create this view associated with its controller.
   */
  public HomePane(Home home, UserPreferences preferences, HomeController controller) {
    this.resource = ResourceBundle.getBundle(HomePane.class.getName());
    // Create a unique toggle button model for Wall creation / Selection states
    // so Wall creation menu item and tool bar button 
    // always reflect the same toggle state at screen
    this.wallCreationToggleModel = new JToggleButton.ToggleButtonModel();
    JPopupMenu.setDefaultLightWeightPopupEnabled(false);
    ToolTipManager.sharedInstance().setLightWeightPopupEnabled(false);
    createActions(controller);
    setJMenuBar(getHomeMenuBar());
    getContentPane().add(getToolBar(), BorderLayout.NORTH);
    getContentPane().add(getMainPane(home, preferences, controller));
  }
  
  /**
   * Create the actions map of this component.
   */
  private void createActions(final HomeController controller) {
    createAction(ActionType.UNDO, controller, "undo");
    createAction(ActionType.REDO, controller, "redo");
    createAction(ActionType.ADD_HOME_FURNITURE, controller, "addHomeFurniture");
    createAction(ActionType.DELETE_HOME_FURNITURE, controller, "deleteHomeFurniture");
    getActionMap().put(ActionType.WALL_CREATION,
        new ResourceAction (this.resource, ActionType.WALL_CREATION.toString()) {
          public void actionPerformed(ActionEvent ev) {
            boolean selected = ((AbstractButton)ev.getSource()).isSelected();
            if (selected) {
              controller.setWallCreationMode();
            } else {
              controller.setSelectionMode();
            }
          }
        });
    createAction(ActionType.DELETE_SELECTION, 
        controller.getPlanController(), "deleteSelection");
  }
  
  private void createAction(ActionType action, Object controller, 
                            String method) {
    try {
      getActionMap().put(action, new ControllerAction(
          this.resource, action.toString(), controller, method));
    } catch (NoSuchMethodException ex) {
      throw new RuntimeException(ex);
    }
  }
  
  /**
   * Returns the menu bar displayed in this pane.
   */
  private JMenuBar getHomeMenuBar() {
    ActionMap actions = getActionMap();
    
    // Create Edit menu
    JMenu editMenu = new JMenu(
        new ResourceAction(this.resource, "EDIT_MENU"));
    editMenu.setEnabled(true);
    editMenu.add(actions.get(ActionType.UNDO));
    editMenu.add(actions.get(ActionType.REDO));
    
    // Create Furniture menu
    JMenu furnitureMenu = new JMenu(
        new ResourceAction(this.resource, "FURNITURE_MENU"));
    furnitureMenu.setEnabled(true);
    furnitureMenu.add(actions.get(ActionType.ADD_HOME_FURNITURE));
    furnitureMenu.add(actions.get(ActionType.DELETE_HOME_FURNITURE));
    
    // Create Plan menu
    JMenu planMenu = new JMenu(
        new ResourceAction(this.resource, "PLAN_MENU"));
    planMenu.setEnabled(true);
    JCheckBoxMenuItem wallCreationCheckBoxMenuItem = 
      new JCheckBoxMenuItem(actions.get(ActionType.WALL_CREATION));
    // Use the same model as Wall creation tool bar button
    wallCreationCheckBoxMenuItem.setModel(this.wallCreationToggleModel);
    planMenu.add(wallCreationCheckBoxMenuItem);
    planMenu.add(actions.get(ActionType.DELETE_SELECTION));

    // Add menus to menu bar
    JMenuBar menuBar = new JMenuBar();
    menuBar.add(editMenu);
    menuBar.add(furnitureMenu);
    menuBar.add(planMenu);
    return menuBar;
  }

  /**
   * Returns the tool bar displayed in this pane.
   */
  private JToolBar getToolBar() {
    JToolBar toolBar = new JToolBar();
    ActionMap actions = getActionMap();    
    toolBar.add(actions.get(ActionType.ADD_HOME_FURNITURE));
    toolBar.add(actions.get(ActionType.DELETE_HOME_FURNITURE));
    toolBar.addSeparator();
    JToggleButton wallCreationToggleButton = 
      new JToggleButton(actions.get(ActionType.WALL_CREATION));
    // Use the same model as Wall creation menu item
    wallCreationToggleButton.setModel(this.wallCreationToggleModel);
    // Don't display text with icon
    wallCreationToggleButton.setText("");
    toolBar.add(wallCreationToggleButton);
    toolBar.add(actions.get(ActionType.DELETE_SELECTION));
    toolBar.addSeparator();
    toolBar.add(actions.get(ActionType.UNDO));
    toolBar.add(actions.get(ActionType.REDO));
    return toolBar;
  }
  
  /**
   * Enables or disables the action matching <code>actionType</code>.
   */
  public void setEnabled(ActionType actionType, 
                         boolean enabled) {
    getActionMap().get(actionType).setEnabled(enabled);
  }

  /**
   * Sets the <code>NAME</code> and <code>SHORT_DESCRIPTION</code> properties value 
   * of undo and redo actions. If a parameter is null,
   * the properties will be reset to their initial values.
   */
  public void setUndoRedoName(String undoText, String redoText) {
    setNameAndShortDescription(ActionType.UNDO, undoText);
    setNameAndShortDescription(ActionType.REDO, redoText);
  }

  /**
   * Sets the <code>NAME</code> and <code>SHORT_DESCRIPTION</code> properties value 
   * matching <code>actionType</code>. If <code>name</code> is null,
   * the properties will be reset to their initial values.
   */
  private void setNameAndShortDescription(ActionType actionType, String name) {
    Action action = getActionMap().get(actionType);
    if (name == null) {
      name = (String)action.getValue(Action.DEFAULT);
    }
    action.putValue(Action.NAME, name);
    action.putValue(Action.SHORT_DESCRIPTION, name);
  }

  /**
   * Returns the main pane with catalog tree, furniture table and plan pane. 
   */
  private JComponent getMainPane(Home home, UserPreferences preferences, 
                                 HomeController controller) {
    JSplitPane mainPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, 
        getCatalogFurniturePane(home, preferences), 
        getPlanView3DPane(home, controller));
    mainPane.setContinuousLayout(true);
    mainPane.setOneTouchExpandable(true);
    mainPane.setResizeWeight(0.3);
    return mainPane;
  }

  /**
   * Returns the catalog tree and furniture table pane. 
   */
  private JComponent getCatalogFurniturePane(Home home, UserPreferences preferences) {
    JComponent catalogView = new CatalogTree(preferences.getCatalog());
    JComponent furnitureView = new FurnitureTable(home, preferences);
    // Create a split pane that displays both components
    JSplitPane catalogFurniturePane = new JSplitPane(JSplitPane.VERTICAL_SPLIT, 
        new JScrollPane(catalogView), new JScrollPane(furnitureView));
    catalogFurniturePane.setContinuousLayout(true);
    catalogFurniturePane.setOneTouchExpandable(true);
    catalogFurniturePane.setResizeWeight(0.5);
    return catalogFurniturePane;
  }

  /**
   * Returns the plan view and 3D view pane. 
   */
  private JComponent getPlanView3DPane(Home home, HomeController controller) {
    JComponent planView = controller.getPlanController().getView();
    JComponent view3D = new HomeComponent3D(home);
    view3D.setPreferredSize(planView.getPreferredSize());
    view3D.setMinimumSize(new Dimension(0, 0));
    // Create a split pane that displays both components
    JSplitPane planView3DPane = new JSplitPane(JSplitPane.VERTICAL_SPLIT, 
        new JScrollPane(planView), view3D);
    planView3DPane.setContinuousLayout(true);
    planView3DPane.setOneTouchExpandable(true);
    planView3DPane.setResizeWeight(0.5);
    return planView3DPane;
  }
}
