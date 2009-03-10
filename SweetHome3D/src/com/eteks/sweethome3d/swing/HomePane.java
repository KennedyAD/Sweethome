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
import java.awt.Color;
import java.awt.Component;
import java.awt.ComponentOrientation;
import java.awt.Container;
import java.awt.Dimension;
import java.awt.EventQueue;
import java.awt.Graphics;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.KeyboardFocusManager;
import java.awt.Point;
import java.awt.Rectangle;
import java.awt.datatransfer.Clipboard;
import java.awt.datatransfer.DataFlavor;
import java.awt.event.ActionEvent;
import java.awt.event.ContainerEvent;
import java.awt.event.ContainerListener;
import java.awt.event.FocusEvent;
import java.awt.event.FocusListener;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.geom.Rectangle2D;
import java.awt.print.PageFormat;
import java.awt.print.PrinterException;
import java.awt.print.PrinterJob;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InterruptedIOException;
import java.io.OutputStream;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.Callable;

import javax.jnlp.BasicService;
import javax.jnlp.ServiceManager;
import javax.jnlp.UnavailableServiceException;
import javax.swing.AbstractAction;
import javax.swing.AbstractButton;
import javax.swing.Action;
import javax.swing.ActionMap;
import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.ButtonGroup;
import javax.swing.Icon;
import javax.swing.ImageIcon;
import javax.swing.JCheckBox;
import javax.swing.JCheckBoxMenuItem;
import javax.swing.JComponent;
import javax.swing.JEditorPane;
import javax.swing.JLabel;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPopupMenu;
import javax.swing.JRadioButtonMenuItem;
import javax.swing.JRootPane;
import javax.swing.JScrollPane;
import javax.swing.JSeparator;
import javax.swing.JSplitPane;
import javax.swing.JToggleButton;
import javax.swing.JToolBar;
import javax.swing.JViewport;
import javax.swing.KeyStroke;
import javax.swing.SwingUtilities;
import javax.swing.ToolTipManager;
import javax.swing.TransferHandler;
import javax.swing.UIManager;
import javax.swing.border.AbstractBorder;
import javax.swing.border.Border;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;
import javax.swing.event.HyperlinkEvent;
import javax.swing.event.HyperlinkListener;
import javax.swing.event.MenuEvent;
import javax.swing.event.MenuListener;
import javax.swing.event.PopupMenuEvent;
import javax.swing.event.PopupMenuListener;
import javax.swing.event.SwingPropertyChangeSupport;

import com.eteks.sweethome3d.j3d.Ground3D;
import com.eteks.sweethome3d.j3d.HomePieceOfFurniture3D;
import com.eteks.sweethome3d.j3d.OBJWriter;
import com.eteks.sweethome3d.j3d.Room3D;
import com.eteks.sweethome3d.j3d.Wall3D;
import com.eteks.sweethome3d.model.Content;
import com.eteks.sweethome3d.model.DimensionLine;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomePieceOfFurniture;
import com.eteks.sweethome3d.model.InterruptedRecorderException;
import com.eteks.sweethome3d.model.Label;
import com.eteks.sweethome3d.model.RecorderException;
import com.eteks.sweethome3d.model.Room;
import com.eteks.sweethome3d.model.Selectable;
import com.eteks.sweethome3d.model.SelectionEvent;
import com.eteks.sweethome3d.model.SelectionListener;
import com.eteks.sweethome3d.model.TextStyle;
import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.model.Wall;
import com.eteks.sweethome3d.plugin.Plugin;
import com.eteks.sweethome3d.plugin.PluginAction;
import com.eteks.sweethome3d.tools.OperatingSystem;
import com.eteks.sweethome3d.viewcontroller.ContentManager;
import com.eteks.sweethome3d.viewcontroller.FurnitureController;
import com.eteks.sweethome3d.viewcontroller.HomeController;
import com.eteks.sweethome3d.viewcontroller.HomeView;
import com.eteks.sweethome3d.viewcontroller.PlanController;
import com.eteks.sweethome3d.viewcontroller.View;

/**
 * The MVC view that edits a home. 
 * @author Emmanuel Puybaret
 */
public class HomePane extends JRootPane implements HomeView {
  private enum MenuActionType {FILE_MENU, EDIT_MENU, FURNITURE_MENU, PLAN_MENU, VIEW_3D_MENU, HELP_MENU, 
      OPEN_RECENT_HOME_MENU, SORT_HOME_FURNITURE_MENU, DISPLAY_HOME_FURNITURE_PROPERTY_MENU, MODIFY_TEXT_STYLE}
  
  private static final String MAIN_PANE_DIVIDER_LOCATION_VISUAL_PROPERTY    = "com.eteks.sweethome3d.SweetHome3D.MainPaneDividerLocation";
  private static final String CATALOG_PANE_DIVIDER_LOCATION_VISUAL_PROPERTY = "com.eteks.sweethome3d.SweetHome3D.CatalogPaneDividerLocation";
  private static final String PLAN_PANE_DIVIDER_LOCATION_VISUAL_PROPERTY    = "com.eteks.sweethome3d.SweetHome3D.PlanPaneDividerLocation";
  private static final String PLAN_VIEWPORT_X_VISUAL_PROPERTY               = "com.eteks.sweethome3d.SweetHome3D.PlanViewportX";
  private static final String PLAN_VIEWPORT_Y_VISUAL_PROPERTY               = "com.eteks.sweethome3d.SweetHome3D.PlanViewportY";
  private static final String FURNITURE_VIEWPORT_Y_VISUAL_PROPERTY          = "com.eteks.sweethome3d.SweetHome3D.FurnitureViewportY";

  private static final int    DEFAULT_SMALL_ICON_HEIGHT = 16;
  
  private final Home                            home;
  private final UserPreferences                 preferences;
  private final HomeController                  controller;
  // Button models shared by Select, Create walls, Create rooms, Create dimensions 
  // and Create labels menu items and their matching tool bar buttons
  private final JToggleButton.ToggleButtonModel selectToggleModel;
  private final JToggleButton.ToggleButtonModel createWallsToggleModel;
  private final JToggleButton.ToggleButtonModel createRoomsToggleModel;
  private final JToggleButton.ToggleButtonModel createDimensionLinesToggleModel;
  private final JToggleButton.ToggleButtonModel createLabelsToggleModel;
  // Button models shared by Bold and Italic menu items and their matching tool bar buttons
  private final JToggleButton.ToggleButtonModel boldStyleToggleModel;
  private final JToggleButton.ToggleButtonModel italicStyleToggleModel;
  // Button models shared by View from top and View from observer menu items and
  // the matching tool bar buttons
  private final JToggleButton.ToggleButtonModel viewFromTopToggleModel;
  private final JToggleButton.ToggleButtonModel viewFromObserverToggleModel;
  private JComponent                            focusedComponent;
  private TransferHandler                       catalogTransferHandler;
  private TransferHandler                       furnitureTransferHandler;
  private TransferHandler                       planTransferHandler;
  private ActionMap                             menuActionMap;
  private List<Action>                          pluginActions;
  
  /**
   * Creates this view associated with its controller.
   */
  public HomePane(Home home, UserPreferences preferences, 
                  HomeController controller) {
    this.home = home;
    this.preferences = preferences;
    this.controller = controller;
    // Create unique toggle button models for Selection / Wall creation / Room creation / 
    // Dimension line creation / Label creation states
    // so the matching menu items and tool bar buttons always reflect the same toggle state at screen
    this.selectToggleModel = new JToggleButton.ToggleButtonModel();
    this.selectToggleModel.setSelected(controller.getPlanController().getMode() 
        == PlanController.Mode.SELECTION);
    this.createWallsToggleModel = new JToggleButton.ToggleButtonModel();
    this.createWallsToggleModel.setSelected(controller.getPlanController().getMode() 
        == PlanController.Mode.WALL_CREATION);
    this.createRoomsToggleModel = new JToggleButton.ToggleButtonModel();
    this.createRoomsToggleModel.setSelected(controller.getPlanController().getMode() 
        == PlanController.Mode.ROOM_CREATION);
    this.createDimensionLinesToggleModel = new JToggleButton.ToggleButtonModel();
    this.createDimensionLinesToggleModel.setSelected(controller.getPlanController().getMode() 
        == PlanController.Mode.DIMENSION_LINE_CREATION);
    this.createLabelsToggleModel = new JToggleButton.ToggleButtonModel();
    this.createLabelsToggleModel.setSelected(controller.getPlanController().getMode() 
        == PlanController.Mode.LABEL_CREATION);
    // Use special models for bold and italic check box menu items and tool bar buttons 
    // that are selected texts in home selected items are all bold or italic
    this.boldStyleToggleModel = createBoldStyleToggleModel(home, preferences);
    this.italicStyleToggleModel = createItalicStyleToggleModel(home, preferences);
    // Create unique toggle button models for top and observer cameras
    // so View from top and View from observer creation menu items and tool bar buttons 
    // always reflect the same toggle state at screen
    this.viewFromTopToggleModel = new JToggleButton.ToggleButtonModel();
    this.viewFromTopToggleModel.setSelected(home.getCamera() == home.getTopCamera());
    this.viewFromObserverToggleModel = new JToggleButton.ToggleButtonModel();
    this.viewFromObserverToggleModel.setSelected(home.getCamera() == home.getObserverCamera());
    
    JPopupMenu.setDefaultLightWeightPopupEnabled(false);
    ToolTipManager.sharedInstance().setLightWeightPopupEnabled(false);    
    
    createActions(preferences, controller);
    createMenuActions(preferences, controller);   
    createPluginActions(controller.getPlugins());
    createTransferHandlers(home, controller);
    addHomeListener(home);
    addLanguageListener(preferences);
    addPlanControllerListener(controller.getPlanController());
    JMenuBar homeMenuBar = createMenuBar(home, preferences, controller);
    setJMenuBar(homeMenuBar);
    Container contentPane = getContentPane();
    contentPane.add(createToolBar(home), BorderLayout.NORTH);
    contentPane.add(createMainPane(home, preferences, controller));
    if (OperatingSystem.isMacOSXLeopardOrSuperior()) {
      // Under Mac OS X 10.5, add some dummy labels at left and right borders
      // to avoid the tool bar to be attached on these borders
      // (segmented buttons created on this system aren't properly rendered
      // when they are aligned vertically)
      contentPane.add(new JLabel(), BorderLayout.WEST);
      contentPane.add(new JLabel(), BorderLayout.EAST);
    }

    disableMenuItemsDuringDragAndDrop(controller.getPlanController().getView(), homeMenuBar);
    // Change component orientation
    applyComponentOrientation(ComponentOrientation.getOrientation(Locale.getDefault()));  
  }

  /**
   * Create the actions map of this component.
   */
  private void createActions(UserPreferences preferences, 
                             HomeController controller) {
    createAction(preferences, ActionType.NEW_HOME, controller, "newHome");
    createAction(preferences, ActionType.OPEN, controller, "open");
    createAction(preferences, ActionType.DELETE_RECENT_HOMES, controller, "deleteRecentHomes");
    createAction(preferences, ActionType.CLOSE, controller, "close");
    createAction(preferences, ActionType.SAVE, controller, "save");
    createAction(preferences, ActionType.SAVE_AS, controller, "saveAs");
    createAction(preferences, ActionType.PAGE_SETUP, controller, "setupPage");
    createAction(preferences, ActionType.PRINT_PREVIEW, controller, "previewPrint");
    createAction(preferences, ActionType.PRINT, controller, "print");
    createAction(preferences, ActionType.PRINT_TO_PDF, controller, "printToPDF");
    createAction(preferences, ActionType.PREFERENCES, controller, "editPreferences");
    createAction(preferences, ActionType.EXIT, controller, "exit");
    
    createAction(preferences, ActionType.UNDO, controller, "undo");
    createAction(preferences, ActionType.REDO, controller, "redo");
    createClipboardAction(preferences, ActionType.CUT, TransferHandler.getCutAction());
    createClipboardAction(preferences, ActionType.COPY, TransferHandler.getCopyAction());
    createClipboardAction(preferences, ActionType.PASTE, TransferHandler.getPasteAction());
    createAction(preferences, ActionType.DELETE, controller, "delete");
    createAction(preferences, ActionType.SELECT_ALL, controller, "selectAll");
    
    createAction(preferences, ActionType.ADD_HOME_FURNITURE, controller, "addHomeFurniture");
    FurnitureController furnitureController = controller.getFurnitureController();
    createAction(preferences, ActionType.DELETE_HOME_FURNITURE,
        furnitureController, "deleteSelection");
    createAction(preferences, ActionType.MODIFY_FURNITURE, controller, "modifySelectedFurniture");
    createAction(preferences, ActionType.IMPORT_FURNITURE, controller, "importFurniture");
    createAction(preferences, ActionType.IMPORT_FURNITURE_LIBRARY, controller, "importFurnitureLibrary");
    createAction(preferences, ActionType.ALIGN_FURNITURE_ON_TOP, 
        furnitureController, "alignSelectedFurnitureOnTop");
    createAction(preferences, ActionType.ALIGN_FURNITURE_ON_BOTTOM, 
        furnitureController, "alignSelectedFurnitureOnBottom");
    createAction(preferences, ActionType.ALIGN_FURNITURE_ON_LEFT, 
        furnitureController, "alignSelectedFurnitureOnLeft");
    createAction(preferences, ActionType.ALIGN_FURNITURE_ON_RIGHT, 
        furnitureController, "alignSelectedFurnitureOnRight");
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_CATALOG_ID, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.CATALOG_ID);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_NAME, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.NAME);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_WIDTH, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.WIDTH);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_DEPTH, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.DEPTH);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_HEIGHT, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.HEIGHT);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_X, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.X);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_Y, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.Y);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_ELEVATION, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.ELEVATION);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_ANGLE, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.ANGLE);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_COLOR, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.COLOR);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_MOVABILITY, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.MOVABLE);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_TYPE, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.DOOR_OR_WINDOW);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_VISIBILITY, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.VISIBLE);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_PRICE, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.PRICE);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX_PERCENTAGE, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.VALUE_ADDED_TAX_PERCENTAGE);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.VALUE_ADDED_TAX);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_PRICE_VALUE_ADDED_TAX_INCLUDED, 
        furnitureController, "toggleFurnitureSort", HomePieceOfFurniture.SortableProperty.PRICE_VALUE_ADDED_TAX_INCLUDED);
    createAction(preferences, ActionType.SORT_HOME_FURNITURE_BY_DESCENDING_ORDER, 
        furnitureController, "toggleFurnitureSortOrder");
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_CATALOG_ID, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.CATALOG_ID);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_NAME, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.NAME);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_WIDTH, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.WIDTH);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_DEPTH, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.DEPTH);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_HEIGHT, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.HEIGHT);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_X, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.X);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_Y, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.Y);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_ELEVATION, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.ELEVATION);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_ANGLE, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.ANGLE);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_COLOR, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.COLOR);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_MOVABLE, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.MOVABLE);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_DOOR_OR_WINDOW, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.DOOR_OR_WINDOW);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_VISIBLE, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.VISIBLE);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_PRICE, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.PRICE);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX_PERCENTAGE, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.VALUE_ADDED_TAX_PERCENTAGE);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.VALUE_ADDED_TAX);
    createAction(preferences, ActionType.DISPLAY_HOME_FURNITURE_PRICE_VALUE_ADDED_TAX_INCLUDED, 
        furnitureController, "toggleFurnitureVisibleProperty", HomePieceOfFurniture.SortableProperty.PRICE_VALUE_ADDED_TAX_INCLUDED);
    
    createAction(preferences, ActionType.SELECT, controller, "setMode", 
        PlanController.Mode.SELECTION);
    createAction(preferences, ActionType.CREATE_WALLS, controller, "setMode",
        PlanController.Mode.WALL_CREATION);
    createAction(preferences, ActionType.CREATE_ROOMS, controller, "setMode",
        PlanController.Mode.ROOM_CREATION);
    createAction(preferences, ActionType.CREATE_DIMENSION_LINES, controller, "setMode",
        PlanController.Mode.DIMENSION_LINE_CREATION);
    createAction(preferences, ActionType.CREATE_LABELS, controller, "setMode",
        PlanController.Mode.LABEL_CREATION);
    createAction(preferences, ActionType.DELETE_SELECTION, 
        controller.getPlanController(), "deleteSelection");
    createAction(preferences, ActionType.MODIFY_WALL, 
        controller.getPlanController(), "modifySelectedWalls");
    createAction(preferences, ActionType.MODIFY_ROOM, 
        controller.getPlanController(), "modifySelectedRooms");
    createAction(preferences, ActionType.INCREASE_TEXT_SIZE, 
        controller.getPlanController(), "increaseTextSize");
    createAction(preferences, ActionType.DECREASE_TEXT_SIZE, 
        controller.getPlanController(), "decreaseTextSize");
    createAction(preferences, ActionType.TOGGLE_BOLD_STYLE, 
        controller.getPlanController(), "toggleBoldStyle");
    createAction(preferences, ActionType.TOGGLE_ITALIC_STYLE, 
        controller.getPlanController(), "toggleItalicStyle");
    createAction(preferences, ActionType.MODIFY_LABEL, 
        controller.getPlanController(), "modifySelectedLabels");
    createAction(preferences, ActionType.REVERSE_WALL_DIRECTION, 
        controller.getPlanController(), "reverseSelectedWallsDirection");
    createAction(preferences, ActionType.SPLIT_WALL, 
        controller.getPlanController(), "splitSelectedWall");
    createAction(preferences, ActionType.IMPORT_BACKGROUND_IMAGE, 
        controller, "importBackgroundImage");
    createAction(preferences, ActionType.MODIFY_BACKGROUND_IMAGE, 
        controller, "modifyBackgroundImage");
    createAction(preferences, ActionType.DELETE_BACKGROUND_IMAGE, 
        controller, "deleteBackgroundImage");
    createAction(preferences, ActionType.ZOOM_IN, controller, "zoomIn");
    createAction(preferences, ActionType.ZOOM_OUT, controller, "zoomOut");
    
    createAction(preferences, ActionType.VIEW_FROM_TOP, 
        controller.getHomeController3D(), "viewFromTop");
    createAction(preferences, ActionType.VIEW_FROM_OBSERVER, 
        controller.getHomeController3D(), "viewFromObserver");
    createAction(preferences, ActionType.MODIFY_3D_ATTRIBUTES, 
        controller.getHomeController3D(), "modifyAttributes");
    createAction(preferences, ActionType.EXPORT_TO_OBJ, controller, "exportToOBJ");
    
    createAction(preferences, ActionType.HELP, controller, "help");
    createAction(preferences, ActionType.ABOUT, controller, "about");
  }

  /**
   * Creates a <code>ControllerAction</code> object that calls on <code>controller</code> a given
   * <code>method</code> with its <code>parameters</code>.
   */
  private void createAction(UserPreferences preferences,
                            ActionType action,                            
                            Object controller, 
                            String method, 
                            Object ... parameters) {
    try {
      getActionMap().put(action, new ControllerAction(
          preferences, HomePane.class, action.name(), controller, method, parameters));
    } catch (NoSuchMethodException ex) {
      throw new RuntimeException(ex);
    }
  }
  
  /**
   * Creates a <code>ReourceAction</code> object that calls 
   * <code>actionPerfomed</code> method on a given 
   * existing <code>clipboardAction</code> with a source equal to focused component.
   */
  private void createClipboardAction(UserPreferences preferences,
                                     ActionType actionType, 
                                     final Action clipboardAction) {
    getActionMap().put(actionType,
        new ResourceAction (preferences, HomePane.class, actionType.name()) {
          public void actionPerformed(ActionEvent ev) {
            ev = new ActionEvent(focusedComponent, ActionEvent.ACTION_PERFORMED, null);
            clipboardAction.actionPerformed(ev);
          }
        });
  }

  /**
   * Create the actions map used to create menus of this component.
   */
  private void createMenuActions(UserPreferences preferences, 
                                 HomeController controller) {
    this.menuActionMap = new ActionMap();
    createMenuAction(preferences, MenuActionType.FILE_MENU);
    createMenuAction(preferences, MenuActionType.EDIT_MENU);
    createMenuAction(preferences, MenuActionType.FURNITURE_MENU);
    createMenuAction(preferences, MenuActionType.PLAN_MENU);
    createMenuAction(preferences, MenuActionType.VIEW_3D_MENU);
    createMenuAction(preferences, MenuActionType.HELP_MENU);
    createMenuAction(preferences, MenuActionType.OPEN_RECENT_HOME_MENU);
    createMenuAction(preferences, MenuActionType.SORT_HOME_FURNITURE_MENU);
    createMenuAction(preferences, MenuActionType.DISPLAY_HOME_FURNITURE_PROPERTY_MENU);
    createMenuAction(preferences, MenuActionType.MODIFY_TEXT_STYLE);
  }
  
  /**
   * Creates a <code>ResourceAction</code> object stored in menu action map.
   */
  private void createMenuAction(UserPreferences preferences, 
                                MenuActionType action) {
    this.menuActionMap.put(action, new ResourceAction(
        preferences, HomePane.class, action.name(), true));
  }

  /**
   * Creates the Swing actions matching each actions available in <code>plugins</code>.
   */
  private void createPluginActions(List<Plugin> plugins) {
    this.pluginActions = new ArrayList<Action>();
    if (plugins != null) {
      for (Plugin plugin : plugins) {
        for (final PluginAction pluginAction : plugin.getActions()) {
          // Create a Swing action adapter to plug-in action
          this.pluginActions.add(new ActionAdapter(pluginAction)); 
        }
      }
    }
  }

  /**
   * Creates components transfer handlers.
   */
  private void createTransferHandlers(Home home, 
                                      HomeController controller) {
    this.catalogTransferHandler = 
        new FurnitureCatalogTransferHandler(controller.getContentManager(), controller.getFurnitureCatalogController());
    this.furnitureTransferHandler = 
        new FurnitureTransferHandler(home, controller.getContentManager(), controller);
    this.planTransferHandler = 
        new PlanTransferHandler(home, controller.getContentManager(), controller);
  }

  /**
   * Adds a property change listener to <code>home</code> to update
   * View from top and View from observer toggle models according to used camera.
   */
  private void addHomeListener(final Home home) {
    home.addPropertyChangeListener(Home.Property.CAMERA, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            viewFromTopToggleModel.setSelected(
                home.getCamera() == home.getTopCamera());
            viewFromObserverToggleModel.setSelected(
                home.getCamera() == home.getObserverCamera());
          }
        });
  }

  /**
   * Adds a property change listener to <code>preferences</code> to update
   * actions when preferred language changes.
   */
  private void addLanguageListener(UserPreferences preferences) {
    preferences.addPropertyChangeListener(UserPreferences.Property.LANGUAGE, 
        new LanguageChangeListener(this));
  }

  /**
   * Preferences property listener bound to this component with a weak reference to avoid
   * strong link between preferences and this component.  
   */
  private static class LanguageChangeListener implements PropertyChangeListener {
    private WeakReference<HomePane> homePane;

    public LanguageChangeListener(HomePane homePane) {
      this.homePane = new WeakReference<HomePane>(homePane);
    }
    
    public void propertyChange(PropertyChangeEvent ev) {
      // If home pane was garbage collected, remove this listener from preferences
      HomePane homePane = this.homePane.get();
      if (homePane == null) {
        ((UserPreferences)ev.getSource()).removePropertyChangeListener(
            UserPreferences.Property.LANGUAGE, this);
      } else {
        SwingTools.updateSwingResourceLanguage();
      }
    }
  }
  
  /**
   * Adds a property change listener to <code>planController</code> to update
   * Select and Create walls toggle models according to current mode.
   */
  private void addPlanControllerListener(final PlanController planController) {
    planController.addPropertyChangeListener(PlanController.Property.MODE, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            selectToggleModel.setSelected(planController.getMode() 
                == PlanController.Mode.SELECTION);
            createWallsToggleModel.setSelected(planController.getMode() 
                == PlanController.Mode.WALL_CREATION);
            createRoomsToggleModel.setSelected(planController.getMode() 
                == PlanController.Mode.ROOM_CREATION);
            createDimensionLinesToggleModel.setSelected(planController.getMode() 
                == PlanController.Mode.DIMENSION_LINE_CREATION);
            createLabelsToggleModel.setSelected(planController.getMode() 
                == PlanController.Mode.LABEL_CREATION);
          }
        });
  }
  
  /**
   * Returns the menu bar displayed in this pane.
   */
  private JMenuBar createMenuBar(final Home home, 
                                 UserPreferences preferences,
                                 final HomeController controller) {
    // Create File menu
    JMenu fileMenu = new JMenu(this.menuActionMap.get(MenuActionType.FILE_MENU));
    fileMenu.add(getMenuItemAction(ActionType.NEW_HOME));
    fileMenu.add(getMenuItemAction(ActionType.OPEN));
    
    final JMenu openRecentHomeMenu = 
        new JMenu(this.menuActionMap.get(MenuActionType.OPEN_RECENT_HOME_MENU));
    openRecentHomeMenu.addMenuListener(new MenuListener() {
        public void menuSelected(MenuEvent ev) {
          updateOpenRecentHomeMenu(openRecentHomeMenu, controller);
        }
      
        public void menuCanceled(MenuEvent ev) {
        }
  
        public void menuDeselected(MenuEvent ev) {
        }
      });
    
    fileMenu.add(openRecentHomeMenu);
    fileMenu.addSeparator();
    fileMenu.add(getMenuItemAction(ActionType.CLOSE));
    fileMenu.add(getMenuItemAction(ActionType.SAVE));
    fileMenu.add(getMenuItemAction(ActionType.SAVE_AS));
    fileMenu.addSeparator();
    fileMenu.add(getMenuItemAction(ActionType.PAGE_SETUP));
    fileMenu.add(getMenuItemAction(ActionType.PRINT_PREVIEW));
    fileMenu.add(getMenuItemAction(ActionType.PRINT));
    // Don't add PRINT_TO_PDF, PREFERENCES and EXIT menu items under Mac OS X, 
    // because PREFERENCES and EXIT items are displayed in application menu
    // and PRINT_TO_PDF is available in standard Mac OS X Print dialog
    if (!OperatingSystem.isMacOSX()) {
      fileMenu.add(getMenuItemAction(ActionType.PRINT_TO_PDF));
      fileMenu.addSeparator();
      fileMenu.add(getMenuItemAction(ActionType.PREFERENCES));
    }

    // Create Edit menu
    JMenu editMenu = new JMenu(this.menuActionMap.get(MenuActionType.EDIT_MENU));
    editMenu.add(getMenuItemAction(ActionType.UNDO));
    editMenu.add(getMenuItemAction(ActionType.REDO));
    editMenu.addSeparator();
    editMenu.add(getMenuItemAction(ActionType.CUT));
    editMenu.add(getMenuItemAction(ActionType.COPY));
    editMenu.add(getMenuItemAction(ActionType.PASTE));
    editMenu.addSeparator();
    editMenu.add(getMenuItemAction(ActionType.DELETE));
    editMenu.add(getMenuItemAction(ActionType.SELECT_ALL));

    // Create Furniture menu
    JMenu furnitureMenu = new JMenu(this.menuActionMap.get(MenuActionType.FURNITURE_MENU));
    furnitureMenu.add(getMenuItemAction(ActionType.ADD_HOME_FURNITURE));
    furnitureMenu.add(getMenuItemAction(ActionType.MODIFY_FURNITURE));
    furnitureMenu.addSeparator();
    furnitureMenu.add(getMenuItemAction(ActionType.IMPORT_FURNITURE));
    furnitureMenu.add(getMenuItemAction(ActionType.IMPORT_FURNITURE_LIBRARY));
    furnitureMenu.addSeparator();
    furnitureMenu.add(getMenuItemAction(ActionType.ALIGN_FURNITURE_ON_TOP));
    furnitureMenu.add(getMenuItemAction(ActionType.ALIGN_FURNITURE_ON_BOTTOM));
    furnitureMenu.add(getMenuItemAction(ActionType.ALIGN_FURNITURE_ON_LEFT));
    furnitureMenu.add(getMenuItemAction(ActionType.ALIGN_FURNITURE_ON_RIGHT));
    furnitureMenu.addSeparator();
    furnitureMenu.add(createFurnitureSortMenu(home, preferences));
    furnitureMenu.add(createFurnitureDisplayPropertyMenu(home, preferences));
    
    // Create Plan menu
    JMenu planMenu = new JMenu(this.menuActionMap.get(MenuActionType.PLAN_MENU));
    JRadioButtonMenuItem selectRadioButtonMenuItem = 
        createRadioButtonMenuItemFromModel(this.selectToggleModel, ActionType.SELECT, false);
    planMenu.add(selectRadioButtonMenuItem);
    JRadioButtonMenuItem createWallsRadioButtonMenuItem = 
        createRadioButtonMenuItemFromModel(this.createWallsToggleModel, ActionType.CREATE_WALLS, false);
    planMenu.add(createWallsRadioButtonMenuItem);
    JRadioButtonMenuItem createRoomsRadioButtonMenuItem = 
        createRadioButtonMenuItemFromModel(this.createRoomsToggleModel, ActionType.CREATE_ROOMS, false);
    planMenu.add(createRoomsRadioButtonMenuItem);
    JRadioButtonMenuItem createDimensionLinesRadioButtonMenuItem = 
        createRadioButtonMenuItemFromModel(this.createDimensionLinesToggleModel, ActionType.CREATE_DIMENSION_LINES, false);
    planMenu.add(createDimensionLinesRadioButtonMenuItem);
    JRadioButtonMenuItem createLabelsRadioButtonMenuItem = 
        createRadioButtonMenuItemFromModel(this.createLabelsToggleModel, ActionType.CREATE_LABELS, false);
    planMenu.add(createLabelsRadioButtonMenuItem);
    // Add Select, Create Walls and Create dimensions menu items to radio group 
    ButtonGroup group = new ButtonGroup();
    group.add(selectRadioButtonMenuItem);
    group.add(createWallsRadioButtonMenuItem);  
    group.add(createRoomsRadioButtonMenuItem);  
    group.add(createDimensionLinesRadioButtonMenuItem);  
    group.add(createLabelsRadioButtonMenuItem);  
    planMenu.addSeparator();
    planMenu.add(getMenuItemAction(ActionType.MODIFY_WALL));
    planMenu.add(getMenuItemAction(ActionType.REVERSE_WALL_DIRECTION));
    planMenu.add(getMenuItemAction(ActionType.SPLIT_WALL));
    planMenu.add(getMenuItemAction(ActionType.MODIFY_ROOM));
    planMenu.add(getMenuItemAction(ActionType.MODIFY_LABEL));
    planMenu.add(createTextStyleMenu(home, preferences, false));
    planMenu.addSeparator();
    planMenu.add(createImportModifyBackgroundImageMenuItem(home, false));
    planMenu.add(getMenuItemAction(ActionType.DELETE_BACKGROUND_IMAGE));
    planMenu.addSeparator();
    planMenu.add(getMenuItemAction(ActionType.ZOOM_IN));
    planMenu.add(getMenuItemAction(ActionType.ZOOM_OUT));

    // Create 3D Preview menu
    JMenu preview3DMenu = new JMenu(this.menuActionMap.get(MenuActionType.VIEW_3D_MENU));
    JRadioButtonMenuItem viewFromTopRadioButtonMenuItem = 
        createRadioButtonMenuItemFromModel(this.viewFromTopToggleModel, ActionType.VIEW_FROM_TOP, false);
    preview3DMenu.add(viewFromTopRadioButtonMenuItem);
    JRadioButtonMenuItem viewFromObserverRadioButtonMenuItem = 
        createRadioButtonMenuItemFromModel(this.viewFromObserverToggleModel, ActionType.VIEW_FROM_OBSERVER, false);
    preview3DMenu.add(viewFromObserverRadioButtonMenuItem);
    // Add View from top and View from observer menu items to radio group  
    group = new ButtonGroup();
    group.add(viewFromTopRadioButtonMenuItem);
    group.add(viewFromObserverRadioButtonMenuItem);
    preview3DMenu.addSeparator();
    preview3DMenu.add(getMenuItemAction(ActionType.MODIFY_3D_ATTRIBUTES));
    preview3DMenu.addSeparator();
    preview3DMenu.add(getMenuItemAction(ActionType.EXPORT_TO_OBJ));
    
    // Create Help menu
    JMenu helpMenu = new JMenu(this.menuActionMap.get(MenuActionType.HELP_MENU));
    helpMenu.add(getMenuItemAction(ActionType.HELP));      
    if (!OperatingSystem.isMacOSX()) {
      helpMenu.add(getMenuItemAction(ActionType.ABOUT));      
    }
    
    // Add menus to menu bar
    JMenuBar menuBar = new JMenuBar();
    menuBar.add(fileMenu);
    menuBar.add(editMenu);
    menuBar.add(furnitureMenu);
    menuBar.add(planMenu);
    menuBar.add(preview3DMenu);
    menuBar.add(helpMenu);

    // Add plugin actions menu items
    for (Action pluginAction : this.pluginActions) {
      String pluginMenu = (String)pluginAction.getValue(PluginAction.Property.MENU.name());
      if (pluginMenu != null) {
        boolean pluginActionAdded = false;
        for (int i = 0; i < menuBar.getMenuCount(); i++) {
          JMenu menu = menuBar.getMenu(i);
          if (menu.getText().equals(pluginMenu)) {
            // Add menu item to existing menu
            menu.addSeparator();
            menu.add(new ResourceAction.MenuItemAction(pluginAction));
            pluginActionAdded = true;
            break;
          }
        }
        if (!pluginActionAdded) {
          // Create missing menu before last menu
          JMenu menu = new JMenu(pluginMenu);
          menu.add(new ResourceAction.MenuItemAction(pluginAction));
          menuBar.add(menu, menuBar.getMenuCount() - 1);
        }
      }
    }

    // Add EXIT action at end to ensure it's the last item of file menu
    if (!OperatingSystem.isMacOSX()) {
      fileMenu.addSeparator();
      fileMenu.add(getMenuItemAction(ActionType.EXIT));
    }

    return menuBar;
  }

  /**
   * Returns furniture sort menu.
   */
  private JMenu createFurnitureSortMenu(final Home home, UserPreferences preferences) {
    // Create Furniture Sort submenu
    JMenu sortMenu = new JMenu(this.menuActionMap.get(MenuActionType.SORT_HOME_FURNITURE_MENU));
    // Map sort furniture properties to sort actions
    Map<HomePieceOfFurniture.SortableProperty, Action> sortActions = 
        new LinkedHashMap<HomePieceOfFurniture.SortableProperty, Action>(); 
    // Use catalog id if currency isn't null
    if (preferences.getCurrency() != null) {
      sortActions.put(HomePieceOfFurniture.SortableProperty.CATALOG_ID, 
          getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_CATALOG_ID)); 
    }
    sortActions.put(HomePieceOfFurniture.SortableProperty.NAME, 
        getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_NAME)); 
    sortActions.put(HomePieceOfFurniture.SortableProperty.WIDTH, 
        getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_WIDTH));
    sortActions.put(HomePieceOfFurniture.SortableProperty.DEPTH, 
        getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_DEPTH));
    sortActions.put(HomePieceOfFurniture.SortableProperty.HEIGHT, 
        getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_HEIGHT));
    sortActions.put(HomePieceOfFurniture.SortableProperty.X, 
        getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_X));
    sortActions.put(HomePieceOfFurniture.SortableProperty.Y, 
        getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_Y));
    sortActions.put(HomePieceOfFurniture.SortableProperty.ELEVATION, 
        getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_ELEVATION));
    sortActions.put(HomePieceOfFurniture.SortableProperty.ANGLE, 
        getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_ANGLE));
    sortActions.put(HomePieceOfFurniture.SortableProperty.COLOR, 
        getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_COLOR));
    sortActions.put(HomePieceOfFurniture.SortableProperty.MOVABLE, 
        getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_MOVABILITY));
    sortActions.put(HomePieceOfFurniture.SortableProperty.DOOR_OR_WINDOW, 
        getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_TYPE));
    sortActions.put(HomePieceOfFurniture.SortableProperty.VISIBLE, 
        getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_VISIBILITY));
    // Use prices if currency isn't null
    if (preferences.getCurrency() != null) {
      sortActions.put(HomePieceOfFurniture.SortableProperty.PRICE, 
          getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_PRICE));
      sortActions.put(HomePieceOfFurniture.SortableProperty.VALUE_ADDED_TAX_PERCENTAGE, 
          getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX_PERCENTAGE));
      sortActions.put(HomePieceOfFurniture.SortableProperty.VALUE_ADDED_TAX, 
          getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_VALUE_ADDED_TAX));
      sortActions.put(HomePieceOfFurniture.SortableProperty.PRICE_VALUE_ADDED_TAX_INCLUDED, 
          getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_PRICE_VALUE_ADDED_TAX_INCLUDED));
    }
    // Add radio button menu items to sub menu and make them share the same radio button group
    ButtonGroup sortButtonGroup = new ButtonGroup();
    for (Map.Entry<HomePieceOfFurniture.SortableProperty, Action> entry : sortActions.entrySet()) {
      final HomePieceOfFurniture.SortableProperty furnitureProperty = entry.getKey();
      Action sortAction = entry.getValue();
      JRadioButtonMenuItem sortMenuItem = new JRadioButtonMenuItem();
      // Use a special model for sort radio button menu item that is selected if
      // home is sorted on furnitureProperty criterion
      sortMenuItem.setModel(new JToggleButton.ToggleButtonModel() {
          @Override
          public boolean isSelected() {
            return furnitureProperty == home.getFurnitureSortedProperty();
          }
        }); 
      // Configure check box menu item action after setting its model to avoid losing its mnemonic
      sortMenuItem.setAction(sortAction);
      sortMenu.add(sortMenuItem);
      sortButtonGroup.add(sortMenuItem);
    }
    sortMenu.addSeparator();
    JCheckBoxMenuItem sortOrderCheckBoxMenuItem = new JCheckBoxMenuItem();
    // Use a special model for sort order check box menu item that is selected depending on
    // home sort order property
    sortOrderCheckBoxMenuItem.setModel(new JToggleButton.ToggleButtonModel() {
        @Override
        public boolean isSelected() {
          return home.isFurnitureDescendingSorted();
        }
      });
    sortOrderCheckBoxMenuItem.setAction(
        getMenuItemAction(ActionType.SORT_HOME_FURNITURE_BY_DESCENDING_ORDER));
    sortMenu.add(sortOrderCheckBoxMenuItem);
    return sortMenu;
  }
  
  /**
   * Returns furniture display property menu.
   */
  private JMenu createFurnitureDisplayPropertyMenu(final Home home, UserPreferences preferences) {
    // Create Furniture Display property submenu
    JMenu displayPropertyMenu = new JMenu(
        this.menuActionMap.get(MenuActionType.DISPLAY_HOME_FURNITURE_PROPERTY_MENU));
    // Map displayProperty furniture properties to displayProperty actions
    Map<HomePieceOfFurniture.SortableProperty, Action> displayPropertyActions = 
        new LinkedHashMap<HomePieceOfFurniture.SortableProperty, Action>(); 
    // Use catalog id if currency isn't null
    if (preferences.getCurrency() != null) {
      displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.CATALOG_ID, 
          getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_CATALOG_ID)); 
    }
    displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.NAME, 
        getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_NAME)); 
    displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.WIDTH, 
        getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_WIDTH));
    displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.DEPTH, 
        getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_DEPTH));
    displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.HEIGHT, 
        getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_HEIGHT));
    displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.X, 
        getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_X));
    displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.Y, 
        getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_Y));
    displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.ELEVATION, 
        getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_ELEVATION));
    displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.ANGLE, 
        getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_ANGLE));
    displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.COLOR, 
        getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_COLOR));
    displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.MOVABLE, 
        getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_MOVABLE));
    displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.DOOR_OR_WINDOW, 
        getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_DOOR_OR_WINDOW));
    displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.VISIBLE, 
        getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_VISIBLE));
    // Use prices if currency isn't null
    if (preferences.getCurrency() != null) {
      displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.PRICE, 
          getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_PRICE));
      displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.VALUE_ADDED_TAX_PERCENTAGE, 
          getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX_PERCENTAGE));
      displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.VALUE_ADDED_TAX, 
          getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_VALUE_ADDED_TAX));
      displayPropertyActions.put(HomePieceOfFurniture.SortableProperty.PRICE_VALUE_ADDED_TAX_INCLUDED, 
          getMenuItemAction(ActionType.DISPLAY_HOME_FURNITURE_PRICE_VALUE_ADDED_TAX_INCLUDED));
    }
    // Add radio button menu items to sub menu 
    for (Map.Entry<HomePieceOfFurniture.SortableProperty, Action> entry : displayPropertyActions.entrySet()) {
      final HomePieceOfFurniture.SortableProperty furnitureProperty = entry.getKey();
      Action displayPropertyAction = entry.getValue();
      JCheckBoxMenuItem displayPropertyMenuItem = new JCheckBoxMenuItem();
      // Use a special model for displayProperty check box menu item that is selected if
      // home furniture visible properties contains furnitureProperty
      displayPropertyMenuItem.setModel(new JToggleButton.ToggleButtonModel() {
          @Override
          public boolean isSelected() {
            return home.getFurnitureVisibleProperties().contains(furnitureProperty);
          }
        }); 
      // Configure check box menu item action after setting its model to avoid losing its mnemonic
      displayPropertyMenuItem.setAction(displayPropertyAction);
      displayPropertyMenu.add(displayPropertyMenuItem);
    }
    return displayPropertyMenu;
  }
  
  /**
   * Returns text style menu.
   */
  private JMenu createTextStyleMenu(final Home home,
                                    final UserPreferences preferences,
                                    boolean popup) {
    JMenu modifyTextStyleMenu = new JMenu(
        this.menuActionMap.get(MenuActionType.MODIFY_TEXT_STYLE));
    
    modifyTextStyleMenu.add(popup
        ? getPopupMenuItemAction(ActionType.INCREASE_TEXT_SIZE)
        : getMenuItemAction(ActionType.INCREASE_TEXT_SIZE));
    modifyTextStyleMenu.add(popup 
        ? getPopupMenuItemAction(ActionType.DECREASE_TEXT_SIZE)
        : getMenuItemAction(ActionType.DECREASE_TEXT_SIZE));
    modifyTextStyleMenu.addSeparator();
    JCheckBoxMenuItem boldMenuItem = new JCheckBoxMenuItem();
    boldMenuItem.setModel(this.boldStyleToggleModel); 
    // Configure check box menu item action after setting its model to avoid losing its mnemonic
    boldMenuItem.setAction(popup
        ? getPopupMenuItemAction(ActionType.TOGGLE_BOLD_STYLE)
        : getMenuItemAction(ActionType.TOGGLE_BOLD_STYLE));
    modifyTextStyleMenu.add(boldMenuItem);
    
    JCheckBoxMenuItem italicMenuItem = new JCheckBoxMenuItem();
    // Use a special model for italic check box menu item that is selected if
    // texts in home selected items are all italic 
    italicMenuItem.setModel(this.italicStyleToggleModel); 
    // Configure check box menu item action after setting its model to avoid losing its mnemonic
    italicMenuItem.setAction(popup 
        ? getPopupMenuItemAction(ActionType.TOGGLE_ITALIC_STYLE)
        : getMenuItemAction(ActionType.TOGGLE_ITALIC_STYLE));
    modifyTextStyleMenu.add(italicMenuItem);
    return modifyTextStyleMenu;
  }

  /**
   * Creates a toggle button model that is selected when all the text of the 
   * selected items in <code>home</code> use bold style.  
   */
  private JToggleButton.ToggleButtonModel createBoldStyleToggleModel(final Home home, 
                                                                     final UserPreferences preferences) {
    return new JToggleButton.ToggleButtonModel() {
      {
        home.addSelectionListener(new SelectionListener() {
          public void selectionChanged(SelectionEvent ev) {
            fireStateChanged();
          }
        });
      }
      
      @Override
      public boolean isSelected() {
        // Find if selected items are all bold or not
        Boolean selectionBoldStyle = null;
        for (Selectable item : home.getSelectedItems()) {
          Boolean bold;
          if (item instanceof Label) {
            bold = isItemTextBold(item, ((Label)item).getStyle());
          } else if (item instanceof HomePieceOfFurniture
              && ((HomePieceOfFurniture)item).isVisible()) {
            bold = isItemTextBold(item, ((HomePieceOfFurniture)item).getNameStyle());
          } else if (item instanceof Room) {
            Room room = (Room)item;
            bold = isItemTextBold(room, room.getNameStyle());
            if (bold != isItemTextBold(room, room.getAreaStyle())) {
              bold = null;
            }
          } else if (item instanceof DimensionLine) {
            bold = isItemTextBold(item, ((DimensionLine)item).getLengthStyle());
          } else {
            continue;
          }
          if (selectionBoldStyle == null) {
            selectionBoldStyle = bold;
          } else if (bold == null || !selectionBoldStyle.equals(bold)) {
            selectionBoldStyle = null;
            break;
          }
        }
        return selectionBoldStyle != null && selectionBoldStyle;
      }
      
      private boolean isItemTextBold(Selectable item, TextStyle textStyle) {
        if (textStyle == null) {
          textStyle = preferences.getDefaultTextStyle(item.getClass());              
        }
        
        return textStyle.isBold();
      }        
    };
  }

  /**
   * Creates a toggle button model that is selected when all the text of the 
   * selected items in <code>home</code> use italic style.  
   */
  private JToggleButton.ToggleButtonModel createItalicStyleToggleModel(final Home home,
                                                                       final UserPreferences preferences) {
    return new JToggleButton.ToggleButtonModel() {
      {
        home.addSelectionListener(new SelectionListener() {
          public void selectionChanged(SelectionEvent ev) {
            fireStateChanged();
          }
        });
      }
      
      @Override
      public boolean isSelected() {
        // Find if selected items are all italic or not
        Boolean selectionItalicStyle = null;
        for (Selectable item : home.getSelectedItems()) {
          Boolean italic;
          if (item instanceof Label) {
            italic = isItemTextItalic(item, ((Label)item).getStyle());
          } else if (item instanceof HomePieceOfFurniture
              && ((HomePieceOfFurniture)item).isVisible()) {
            italic = isItemTextItalic(item, ((HomePieceOfFurniture)item).getNameStyle());
          } else if (item instanceof Room) {
            Room room = (Room)item;
            italic = isItemTextItalic(room, room.getNameStyle());
            if (italic != isItemTextItalic(room, room.getAreaStyle())) {
              italic = null;
            }
          } else if (item instanceof DimensionLine) {
            italic = isItemTextItalic(item, ((DimensionLine)item).getLengthStyle());
          } else {
            continue;
          }
          if (selectionItalicStyle == null) {
            selectionItalicStyle = italic;
          } else if (italic == null || !selectionItalicStyle.equals(italic)) {
            selectionItalicStyle = null;
            break;
          }
        }
        return selectionItalicStyle != null && selectionItalicStyle;
      }
      
      private boolean isItemTextItalic(Selectable item, TextStyle textStyle) {
        if (textStyle == null) {
          textStyle = preferences.getDefaultTextStyle(item.getClass());              
        }          
        return textStyle.isItalic();
      }
    };
  }
  
  /**
   * Returns Import / Modify background image menu item.
   */
  private JMenuItem createImportModifyBackgroundImageMenuItem(final Home home, 
                                                              final boolean popup) {
    final JMenuItem importModifyBackgroundImageMenuItem = new JMenuItem(
        getImportModifyBackgroundImageAction(home, popup));
    // Add a listener to home on backgroundImage property change to 
    // switch action according to backgroundImage change
    home.addPropertyChangeListener(Home.Property.BACKGROUND_IMAGE, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            importModifyBackgroundImageMenuItem.setAction(
                getImportModifyBackgroundImageAction(home, popup));
          }
        });    
    return importModifyBackgroundImageMenuItem;
  }
  
  /**
   * Returns the action active on import / modify menu.
   */
  private Action getImportModifyBackgroundImageAction(Home home, boolean popup) {
    ActionType backgroundImageActionType = home.getBackgroundImage() == null 
        ? ActionType.IMPORT_BACKGROUND_IMAGE
        : ActionType.MODIFY_BACKGROUND_IMAGE;
    return popup 
        ? getPopupMenuItemAction(backgroundImageActionType)
        : getMenuItemAction(backgroundImageActionType);
  }
  
  /**
   * Updates <code>openRecentHomeMenu</code> from current recent homes in preferences.
   */
  protected void updateOpenRecentHomeMenu(JMenu openRecentHomeMenu, 
                                          final HomeController controller) {
    openRecentHomeMenu.removeAll();
    for (final String homeName : controller.getRecentHomes()) {
      openRecentHomeMenu.add(
          new AbstractAction(controller.getContentManager().getPresentationName(
                  homeName, ContentManager.ContentType.SWEET_HOME_3D)) {
            public void actionPerformed(ActionEvent e) {
              controller.open(homeName);
            }
          });
    }
    if (openRecentHomeMenu.getMenuComponentCount() > 0) {
      openRecentHomeMenu.addSeparator();
    }
    openRecentHomeMenu.add(getMenuItemAction(ActionType.DELETE_RECENT_HOMES));
  }

  /**
   * Returns an action decorated for menu items.
   */
  private Action getMenuItemAction(ActionType actionType) {
    return new ResourceAction.MenuItemAction(getActionMap().get(actionType));
  }

  /**
   * Returns an action decorated for popup menu items.
   */
  private Action getPopupMenuItemAction(ActionType actionType) {
    return new ResourceAction.PopupMenuItemAction(getActionMap().get(actionType));
  }

  /**
   * Returns an action decorated for tool bar buttons.
   */
  private Action getToolBarAction(ActionType actionType) {
    return new ResourceAction.ToolBarAction(getActionMap().get(actionType));
  }

  /**
   * Returns a new radio menu item with the given <code>model</code>.
   */
  private JRadioButtonMenuItem createRadioButtonMenuItemFromModel(
                                   JToggleButton.ToggleButtonModel model,
                                   ActionType action,
                                   boolean popup) {
    JRadioButtonMenuItem radioButtonMenuItem = new JRadioButtonMenuItem();
    // Configure shared model
    radioButtonMenuItem.setModel(model);
    // Configure check box menu item action after setting its model to avoid losing its mnemonic
    radioButtonMenuItem.setAction(
        popup ? getPopupMenuItemAction(action)
              : getMenuItemAction(action));
    return radioButtonMenuItem;
  }
  
  /**
   * Returns the tool bar displayed in this pane.
   */
  private JToolBar createToolBar(Home home) {
    final JToolBar toolBar = new JToolBar();
    toolBar.add(getToolBarAction(ActionType.NEW_HOME));
    toolBar.add(getToolBarAction(ActionType.OPEN));
    toolBar.add(getToolBarAction(ActionType.SAVE));
    toolBar.addSeparator();

    toolBar.add(getToolBarAction(ActionType.UNDO));
    toolBar.add(getToolBarAction(ActionType.REDO));
    toolBar.add(Box.createRigidArea(new Dimension(2, 2)));
    toolBar.add(getToolBarAction(ActionType.CUT));
    toolBar.add(getToolBarAction(ActionType.COPY));
    toolBar.add(getToolBarAction(ActionType.PASTE));
    toolBar.add(Box.createRigidArea(new Dimension(2, 2)));
    toolBar.add(getToolBarAction(ActionType.DELETE));
    toolBar.addSeparator();

    toolBar.add(getToolBarAction(ActionType.ADD_HOME_FURNITURE));
    toolBar.add(getToolBarAction(ActionType.IMPORT_FURNITURE));
    toolBar.addSeparator();
   
    JToggleButton selectToggleButton = 
        new JToggleButton(getToolBarAction(ActionType.SELECT));
    // Use the same model as Select menu item
    selectToggleButton.setModel(this.selectToggleModel);
    toolBar.add(selectToggleButton);
    JToggleButton createWallsToggleButton = 
        new JToggleButton(getToolBarAction(ActionType.CREATE_WALLS));
    // Use the same model as Create walls menu item
    createWallsToggleButton.setModel(this.createWallsToggleModel);
    toolBar.add(createWallsToggleButton);
    JToggleButton createRoomsToggleButton = 
        new JToggleButton(getToolBarAction(ActionType.CREATE_ROOMS));
    // Use the same model as Create rooms menu item
    createRoomsToggleButton.setModel(this.createRoomsToggleModel);
    toolBar.add(createRoomsToggleButton);
    JToggleButton createDimensionLinesToggleButton = 
        new JToggleButton(getToolBarAction(ActionType.CREATE_DIMENSION_LINES));
    // Use the same model as Create dimensions menu item
    createDimensionLinesToggleButton.setModel(this.createDimensionLinesToggleModel);
    toolBar.add(createDimensionLinesToggleButton);
    JToggleButton createLabelsToggleButton = 
        new JToggleButton(getToolBarAction(ActionType.CREATE_LABELS));
    // Use the same model as Create labels menu item
    createLabelsToggleButton.setModel(this.createLabelsToggleModel);
    toolBar.add(createLabelsToggleButton);
    // Add Select, Create Walls and Create dimensions buttons to radio group 
    ButtonGroup group = new ButtonGroup();
    group.add(selectToggleButton);
    group.add(createWallsToggleButton);
    group.add(createRoomsToggleButton);
    group.add(createDimensionLinesToggleButton);
    group.add(createLabelsToggleButton);
    toolBar.add(Box.createRigidArea(new Dimension(2, 2)));
    
    toolBar.add(getToolBarAction(ActionType.INCREASE_TEXT_SIZE));
    toolBar.add(getToolBarAction(ActionType.DECREASE_TEXT_SIZE));
    JToggleButton boldToggleButton = 
        new JToggleButton(getToolBarAction(ActionType.TOGGLE_BOLD_STYLE));
    // Use the same model as Toggle bold style menu item
    boldToggleButton.setModel(this.boldStyleToggleModel); 
    toolBar.add(boldToggleButton);
    JToggleButton italicToggleButton = 
        new JToggleButton(getToolBarAction(ActionType.TOGGLE_ITALIC_STYLE));
    // Use the same model as Toggle italic style menu item
    italicToggleButton.setModel(this.italicStyleToggleModel); 
    toolBar.add(italicToggleButton);
    toolBar.add(Box.createRigidArea(new Dimension(2, 2)));
    
    toolBar.add(getToolBarAction(ActionType.ZOOM_IN));
    toolBar.add(getToolBarAction(ActionType.ZOOM_OUT));
    toolBar.addSeparator();
    
    // Add plugin actions buttons
    boolean pluginActionsAdded = false;
    for (Action pluginAction : this.pluginActions) {
      if (Boolean.TRUE.equals(pluginAction.getValue(PluginAction.Property.TOOL_BAR.name()))) {
        toolBar.add(new ResourceAction.ToolBarAction(pluginAction));
        pluginActionsAdded = true;
      }
    }
    if (pluginActionsAdded) {
      toolBar.addSeparator();
    }
    
    toolBar.add(getToolBarAction(ActionType.HELP));
    
    updateToolBarButtons(toolBar);
    // Update toolBar buttons when component orientation changes 
    // and when buttons are added or removed to it  
    toolBar.addPropertyChangeListener("componentOrientation", 
        new PropertyChangeListener () {
          public void propertyChange(PropertyChangeEvent evt) {
            updateToolBarButtons(toolBar);
          }
        });
    toolBar.addContainerListener(new ContainerListener() {
        public void componentAdded(ContainerEvent ev) {
          updateToolBarButtons(toolBar);
        }
        
        public void componentRemoved(ContainerEvent ev) {
          updateToolBarButtons(toolBar);
        }
      });
    
    return toolBar;
  }

  /**
   * Ensures that all the children of toolBar aren't focusable. 
   * Under Mac OS X 10.5, it also uses segmented buttons and groups them depending
   * on toolbar orientation and whether a button is after or before a separator.
   */
  private void updateToolBarButtons(final JToolBar toolBar) {
    // Retrieve component orientation because Mac OS X 10.5 miserably doesn't it take into account 
    ComponentOrientation orientation = toolBar.getComponentOrientation();
    Component previousComponent = null;
    for (int i = 0, n = toolBar.getComponentCount(); i < n; i++) {        
      JComponent component = (JComponent)toolBar.getComponentAtIndex(i); 
      // Remove focusable property on buttons
      component.setFocusable(false);
      
      if (!(component instanceof AbstractButton)) {
        previousComponent = null;
        continue;
      }          
      if (OperatingSystem.isMacOSXLeopardOrSuperior()) {
        Component nextComponent;
        if (i < n - 1) {
          nextComponent = toolBar.getComponentAtIndex(i + 1);
        } else {
          nextComponent = null;
        }
        component.putClientProperty("JButton.buttonType", "segmentedTextured");
        if (previousComponent == null
            && !(nextComponent instanceof AbstractButton)) {
          component.putClientProperty("JButton.segmentPosition", "only");
        } else if (previousComponent == null) {
          component.putClientProperty("JButton.segmentPosition", 
              orientation == ComponentOrientation.LEFT_TO_RIGHT 
                ? "first"
                : "last");
        } else if (!(nextComponent instanceof AbstractButton)) {
          component.putClientProperty("JButton.segmentPosition",
              orientation == ComponentOrientation.LEFT_TO_RIGHT 
                ? "last"
                : "first");
        } else {
          component.putClientProperty("JButton.segmentPosition", "middle");
        }
        previousComponent = component;
      }
    }
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
   * Enables or disables transfer between components.  
   */
  public void setTransferEnabled(boolean enabled) {
    if (enabled) {
      ((JComponent)this.controller.getFurnitureCatalogController().getView()).
          setTransferHandler(this.catalogTransferHandler);
      ((JComponent)this.controller.getFurnitureController().getView()).
          setTransferHandler(this.furnitureTransferHandler);
      ((JComponent)this.controller.getPlanController().getView()).
          setTransferHandler(this.planTransferHandler);
      ((JViewport)((JComponent)this.controller.getFurnitureController().getView()).getParent()).
          setTransferHandler(this.furnitureTransferHandler);
    } else {
      ((JComponent)this.controller.getFurnitureCatalogController().getView()).setTransferHandler(null);
      ((JComponent)this.controller.getFurnitureController().getView()).setTransferHandler(null);
      ((JComponent)this.controller.getPlanController().getView()).setTransferHandler(null);
      ((JViewport)((JComponent)this.controller.getFurnitureController().getView()).getParent()).
          setTransferHandler(null);
    }
  }

  /**
   * Returns the main pane with catalog tree, furniture table and plan pane. 
   */
  private JComponent createMainPane(Home home, UserPreferences preferences, 
                                    HomeController controller) {
    JSplitPane mainPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, 
        createCatalogFurniturePane(home, preferences, controller), 
        createPlanView3DPane(home, preferences, controller));
    configureSplitPane(mainPane, home, MAIN_PANE_DIVIDER_LOCATION_VISUAL_PROPERTY, 0.3, controller);
    return mainPane;
  }

  /**
   * Configures <code>splitPane</code> divider location. 
   * If <code>dividerLocationProperty</code> visual property exists in <code>home</code>,
   * its value will be used, otherwise the given resize weight will be used.
   */
  private void configureSplitPane(final JSplitPane splitPane,
                                  Home home,
                                  final String dividerLocationProperty,
                                  double defaultResizeWeight, 
                                  final HomeController controller) {
    splitPane.setContinuousLayout(true);
    splitPane.setOneTouchExpandable(true);
    splitPane.setResizeWeight(defaultResizeWeight);
    // Restore divider location previously set 
    Integer dividerLocation = (Integer)home.getVisualProperty(dividerLocationProperty);
    if (dividerLocation != null) {
      splitPane.setDividerLocation(dividerLocation);
    }
    splitPane.addPropertyChangeListener(JSplitPane.DIVIDER_LOCATION_PROPERTY, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            Component focusOwner = KeyboardFocusManager.getCurrentKeyboardFocusManager().getFocusOwner();
            if (focusOwner != null && isChildComponentInvisible(focusOwner)) {
              List<View> splitPanesFocusableViews = Arrays.asList(new View [] {
                  controller.getFurnitureCatalogController().getView(),
                  controller.getFurnitureController().getView(),
                  controller.getPlanController().getView(),
                  controller.getHomeController3D().getView()});      
              // Find the first child component that is visible among split panes
              int focusOwnerIndex = splitPanesFocusableViews.indexOf(focusOwner);
              for (int i = 1; i < splitPanesFocusableViews.size(); i++) {
                View focusableView = splitPanesFocusableViews.get(
                    (focusOwnerIndex + i) % splitPanesFocusableViews.size());
                if (!isChildComponentInvisible((JComponent)focusableView)) {
                  ((JComponent)focusableView).requestFocusInWindow();
                  break;
                }
              }
            }
            controller.setVisualProperty(dividerLocationProperty, ev.getNewValue());
          }

          /**
           * Returns <code>true</code> if the top or the bottom component is a parent 
           * of the given child component and is too small enough to show it. 
           */
          private boolean isChildComponentInvisible(Component childComponent) {
            return (SwingUtilities.isDescendingFrom(childComponent, splitPane.getTopComponent())
                 && splitPane.getDividerLocation() < splitPane.getMinimumDividerLocation())
                || (SwingUtilities.isDescendingFrom(childComponent, splitPane.getBottomComponent())
                    && splitPane.getDividerLocation() > splitPane.getMaximumDividerLocation());
          }
        });
  }

  /**
   * Returns the catalog tree and furniture table pane. 
   */
  private JComponent createCatalogFurniturePane(Home home,
                                                UserPreferences preferences,
                                                final HomeController controller) {
    JComponent catalogView = (JComponent)controller.getFurnitureCatalogController().getView();
    JScrollPane catalogScrollPane = new HomeScrollPane(catalogView);
    // Add focus listener to catalog tree
    catalogView.addFocusListener(new FocusableViewListener(
        controller, catalogScrollPane));
    
    // Create catalog view popup menu
    JPopupMenu catalogViewPopup = new JPopupMenu();
    catalogViewPopup.add(getPopupMenuItemAction(ActionType.COPY));
    catalogViewPopup.addSeparator();
    catalogViewPopup.add(getPopupMenuItemAction(ActionType.DELETE));
    catalogViewPopup.addSeparator();
    catalogViewPopup.add(getPopupMenuItemAction(ActionType.ADD_HOME_FURNITURE));
    catalogViewPopup.add(getPopupMenuItemAction(ActionType.MODIFY_FURNITURE));
    catalogViewPopup.addSeparator();
    catalogViewPopup.add(getPopupMenuItemAction(ActionType.IMPORT_FURNITURE));
    catalogViewPopup.addPopupMenuListener(new MenuItemsVisibilityListener());
    catalogView.setComponentPopupMenu(catalogViewPopup);

    // Configure furniture view
    final JComponent furnitureView = (JComponent)controller.getFurnitureController().getView();
    JScrollPane furnitureScrollPane = new HomeScrollPane(furnitureView);
    // Set default traversal keys of furniture view
    KeyboardFocusManager focusManager =
        KeyboardFocusManager.getCurrentKeyboardFocusManager();
    furnitureView.setFocusTraversalKeys(
        KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS,
        focusManager.getDefaultFocusTraversalKeys(
            KeyboardFocusManager.FORWARD_TRAVERSAL_KEYS));
    furnitureView.setFocusTraversalKeys(
        KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS,
        focusManager.getDefaultFocusTraversalKeys(
            KeyboardFocusManager.BACKWARD_TRAVERSAL_KEYS));

    // Add focus listener to furniture table 
    furnitureView.addFocusListener(new FocusableViewListener(
        controller, furnitureScrollPane));
    // Add a mouse listener that gives focus to furniture view when
    // user clicks in its viewport
    final JViewport viewport = furnitureScrollPane.getViewport();
    viewport.addMouseListener(
        new MouseAdapter() {
          @Override
          public void mouseClicked(MouseEvent ev) {
            furnitureView.requestFocusInWindow();
          }
        });    
    Integer viewportY = (Integer)home.getVisualProperty(FURNITURE_VIEWPORT_Y_VISUAL_PROPERTY);
    if (viewportY != null) {
      viewport.setViewPosition(new Point(0, viewportY));
    }
    viewport.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent ev) {
          controller.setVisualProperty(FURNITURE_VIEWPORT_Y_VISUAL_PROPERTY, viewport.getViewPosition().y);
        }
      });
    
    // Create furniture view popup menu
    JPopupMenu furnitureViewPopup = new JPopupMenu();
    furnitureViewPopup.add(getPopupMenuItemAction(ActionType.UNDO));
    furnitureViewPopup.add(getPopupMenuItemAction(ActionType.REDO));
    furnitureViewPopup.addSeparator();
    furnitureViewPopup.add(getPopupMenuItemAction(ActionType.CUT));
    furnitureViewPopup.add(getPopupMenuItemAction(ActionType.COPY));
    furnitureViewPopup.add(getPopupMenuItemAction(ActionType.PASTE));
    furnitureViewPopup.addSeparator();
    furnitureViewPopup.add(getPopupMenuItemAction(ActionType.DELETE));
    furnitureViewPopup.add(getPopupMenuItemAction(ActionType.SELECT_ALL));
    furnitureViewPopup.addSeparator();
    furnitureViewPopup.add(getPopupMenuItemAction(ActionType.MODIFY_FURNITURE));
    furnitureViewPopup.addSeparator();
    furnitureViewPopup.add(createFurnitureSortMenu(home, preferences));
    furnitureViewPopup.add(createFurnitureDisplayPropertyMenu(home, preferences));
    furnitureViewPopup.addPopupMenuListener(new MenuItemsVisibilityListener());
    furnitureView.setComponentPopupMenu(furnitureViewPopup);
    ((JViewport)furnitureView.getParent()).setComponentPopupMenu(furnitureViewPopup);
    
    // Create a split pane that displays both components
    JSplitPane catalogFurniturePane = new JSplitPane(JSplitPane.VERTICAL_SPLIT, 
        catalogScrollPane, furnitureScrollPane);
    configureSplitPane(catalogFurniturePane, home, 
        CATALOG_PANE_DIVIDER_LOCATION_VISUAL_PROPERTY, 0.5, controller);
    return catalogFurniturePane;
  }

  /**
   * Returns the plan view and 3D view pane. 
   */
  private JComponent createPlanView3DPane(Home home, UserPreferences preferences, 
                                       final HomeController controller) {
    JComponent planView = (JComponent)controller.getPlanController().getView();
    JScrollPane planScrollPane = new HomeScrollPane(planView);
    setPlanRulersVisible(planScrollPane, controller, preferences.isRulersVisible());
    // Add a listener to update rulers visibility in preferences
    preferences.addPropertyChangeListener(UserPreferences.Property.RULERS_VISIBLE, 
        new RulersVisibilityChangeListener(this, planScrollPane, controller));
    planView.addFocusListener(new FocusableViewListener(controller, planScrollPane));
    // Restore viewport position if it exists
    final JViewport viewport = planScrollPane.getViewport();
    Integer viewportX = (Integer)home.getVisualProperty(PLAN_VIEWPORT_X_VISUAL_PROPERTY);
    Integer viewportY = (Integer)home.getVisualProperty(PLAN_VIEWPORT_Y_VISUAL_PROPERTY);
    if (viewportX != null && viewportY != null) {
      viewport.setViewPosition(new Point(viewportX, viewportY));
    }
    viewport.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent ev) {
          Point viewportPosition = viewport.getViewPosition();
          controller.setVisualProperty(PLAN_VIEWPORT_X_VISUAL_PROPERTY, viewportPosition.x);
          controller.setVisualProperty(PLAN_VIEWPORT_Y_VISUAL_PROPERTY, viewportPosition.y);
        }
      });

    // Create plan view popup menu
    JPopupMenu planViewPopup = new JPopupMenu();
    planViewPopup.add(getPopupMenuItemAction(ActionType.UNDO));
    planViewPopup.add(getPopupMenuItemAction(ActionType.REDO));
    planViewPopup.addSeparator();
    planViewPopup.add(getPopupMenuItemAction(ActionType.CUT));
    planViewPopup.add(getPopupMenuItemAction(ActionType.COPY));
    planViewPopup.add(getPopupMenuItemAction(ActionType.PASTE));
    planViewPopup.addSeparator();
    planViewPopup.add(getPopupMenuItemAction(ActionType.DELETE));
    planViewPopup.add(getPopupMenuItemAction(ActionType.SELECT_ALL));
    planViewPopup.addSeparator();
    JRadioButtonMenuItem selectRadioButtonMenuItem = 
        createRadioButtonMenuItemFromModel(this.selectToggleModel, ActionType.SELECT, true);
    planViewPopup.add(selectRadioButtonMenuItem);
    JRadioButtonMenuItem createWallsRadioButtonMenuItem = 
        createRadioButtonMenuItemFromModel(this.createWallsToggleModel, ActionType.CREATE_WALLS, true);
    planViewPopup.add(createWallsRadioButtonMenuItem);
    JRadioButtonMenuItem createRoomsRadioButtonMenuItem = 
        createRadioButtonMenuItemFromModel(this.createRoomsToggleModel, ActionType.CREATE_ROOMS, true);
    planViewPopup.add(createRoomsRadioButtonMenuItem);
    JRadioButtonMenuItem createDimensionLinesRadioButtonMenuItem = 
        createRadioButtonMenuItemFromModel(this.createDimensionLinesToggleModel, ActionType.CREATE_DIMENSION_LINES, true);
    planViewPopup.add(createDimensionLinesRadioButtonMenuItem);
    JRadioButtonMenuItem createLabelsRadioButtonMenuItem = 
        createRadioButtonMenuItemFromModel(this.createLabelsToggleModel, ActionType.CREATE_LABELS, true);
    planViewPopup.add(createLabelsRadioButtonMenuItem);
    // Add Select and Create Walls menu items to radio group 
    ButtonGroup group = new ButtonGroup();
    group.add(selectRadioButtonMenuItem);
    group.add(createWallsRadioButtonMenuItem);
    group.add(createRoomsRadioButtonMenuItem);
    group.add(createDimensionLinesRadioButtonMenuItem);
    group.add(createLabelsRadioButtonMenuItem);
    planViewPopup.addSeparator();
    planViewPopup.add(getPopupMenuItemAction(ActionType.MODIFY_FURNITURE));
    planViewPopup.add(getPopupMenuItemAction(ActionType.MODIFY_WALL));
    planViewPopup.add(getPopupMenuItemAction(ActionType.REVERSE_WALL_DIRECTION));
    planViewPopup.add(getPopupMenuItemAction(ActionType.SPLIT_WALL));
    planViewPopup.add(getPopupMenuItemAction(ActionType.MODIFY_ROOM));
    planViewPopup.add(getPopupMenuItemAction(ActionType.MODIFY_LABEL));
    planViewPopup.add(createTextStyleMenu(home, preferences, true));
    planViewPopup.addSeparator();
    planViewPopup.add(createImportModifyBackgroundImageMenuItem(home, true));
    planViewPopup.add(getPopupMenuItemAction(ActionType.DELETE_BACKGROUND_IMAGE));
    planViewPopup.addSeparator();
    planViewPopup.add(getPopupMenuItemAction(ActionType.ZOOM_OUT));
    planViewPopup.add(getPopupMenuItemAction(ActionType.ZOOM_IN));
    planViewPopup.addPopupMenuListener(new MenuItemsVisibilityListener());
    planView.setComponentPopupMenu(planViewPopup);
    
    // Configure 3D view
    JComponent view3D = (JComponent)controller.getHomeController3D().getView();
    view3D.setPreferredSize(planView.getPreferredSize());
    view3D.setMinimumSize(new Dimension(0, 0));
    view3D.addFocusListener(new FocusableViewListener(controller, view3D));
    // Create 3D view popup menu
    JPopupMenu view3DPopup = new JPopupMenu();
    JRadioButtonMenuItem viewFromTopRadioButtonMenuItem = 
        createRadioButtonMenuItemFromModel(this.viewFromTopToggleModel, ActionType.VIEW_FROM_TOP, true);
    view3DPopup.add(viewFromTopRadioButtonMenuItem);
    JRadioButtonMenuItem viewFromObserverRadioButtonMenuItem = 
        createRadioButtonMenuItemFromModel(this.viewFromObserverToggleModel, ActionType.VIEW_FROM_OBSERVER, true);
    view3DPopup.add(viewFromObserverRadioButtonMenuItem);
    // Add View from top and View from observer menu items to radio group 
    group = new ButtonGroup();
    group.add(viewFromTopRadioButtonMenuItem);
    group.add(viewFromObserverRadioButtonMenuItem);
    view3DPopup.addPopupMenuListener(new MenuItemsVisibilityListener());
    view3D.setComponentPopupMenu(view3DPopup);
    view3DPopup.addSeparator();
    view3DPopup.add(getPopupMenuItemAction(ActionType.MODIFY_3D_ATTRIBUTES));
    view3DPopup.addSeparator();
    view3DPopup.add(getPopupMenuItemAction(ActionType.EXPORT_TO_OBJ));
    
    // Create a split pane that displays both components
    JSplitPane planView3DPane = new JSplitPane(JSplitPane.VERTICAL_SPLIT, 
        planScrollPane, view3D);
    configureSplitPane(planView3DPane, home, 
        PLAN_PANE_DIVIDER_LOCATION_VISUAL_PROPERTY, 0.5, controller);
    return planView3DPane;
  }
  
  /**
   * Preferences property listener bound to this component with a weak reference to avoid
   * strong link between preferences and this component.  
   */
  private static class RulersVisibilityChangeListener implements PropertyChangeListener {
    private WeakReference<HomePane>       homePane;
    private WeakReference<JScrollPane>    planScrollPane;
    private WeakReference<HomeController> controller;

    public RulersVisibilityChangeListener(HomePane homePane,
                                          JScrollPane planScrollPane, 
                                          HomeController controller) {
      this.homePane = new WeakReference<HomePane>(homePane);
      this.planScrollPane = new WeakReference<JScrollPane>(planScrollPane);
      this.controller = new WeakReference<HomeController>(controller);
    }
    
    public void propertyChange(PropertyChangeEvent ev) {
      // If home pane was garbage collected, remove this listener from preferences
      HomePane homePane = this.homePane.get();
      JScrollPane planScrollPane = this.planScrollPane.get();
      HomeController controller = this.controller.get();
      if (homePane == null
          || planScrollPane == null
          || controller == null) {
        ((UserPreferences)ev.getSource()).removePropertyChangeListener(
            UserPreferences.Property.RULERS_VISIBLE, this);
      } else {
        homePane.setPlanRulersVisible(planScrollPane, controller, (Boolean)ev.getNewValue());
      }
    }
  }

  /**
   * Sets the rulers visible in plan view.
   */
  private void setPlanRulersVisible(JScrollPane planScrollPane, 
                                    HomeController controller, boolean visible) {
    if (visible) {
      // Change column and row header views
      planScrollPane.setColumnHeaderView(
          (JComponent)controller.getPlanController().getHorizontalRulerView());
      planScrollPane.setRowHeaderView(
          (JComponent)controller.getPlanController().getVerticalRulerView());
    } else {
      planScrollPane.setColumnHeaderView(null);
      planScrollPane.setRowHeaderView(null);
    }
  }
  
  /**
   * Adds to <code>view</code> a mouse listener that disables all menu items of
   * <code>menuBar</code> during a drag and drop operation in <code>view</code>.
   */
  private void disableMenuItemsDuringDragAndDrop(View view, 
                                                 final JMenuBar menuBar) {
    class MouseAndFocusListener extends MouseAdapter implements FocusListener {      
      @Override
      public void mousePressed(MouseEvent ev) {
        EventQueue.invokeLater(new Runnable() {
            public void run() {
              for (int i = 0, n = menuBar.getMenuCount(); i < n; i++) {
                setMenuItemsEnabled(menuBar.getMenu(i), false);
              }
            }
          });
      }
      
      @Override
      public void mouseReleased(MouseEvent ev) {
        enableMenuItems(menuBar);
      }

      private void enableMenuItems(final JMenuBar menuBar) {
        EventQueue.invokeLater(new Runnable() {
            public void run() {
              for (int i = 0, n = menuBar.getMenuCount(); i < n; i++) {
                setMenuItemsEnabled(menuBar.getMenu(i), true);
              }
            }
          });
      }

      private void setMenuItemsEnabled(JMenu menu, boolean enabled) {
        for (int i = 0, n = menu.getItemCount(); i < n; i++) {
          JMenuItem item = menu.getItem(i);
          if (item instanceof JMenu) {
            setMenuItemsEnabled((JMenu)item, enabled);
          } else if (item != null) {
            item.setEnabled(enabled 
                ? item.getAction().isEnabled()
                : false);
          }
        }
      }

      // Need to take into account focus events because a mouse released event 
      // isn't dispatched when the component loses focus  
      public void focusGained(FocusEvent ev) {
        enableMenuItems(menuBar);
      }

      public void focusLost(FocusEvent ev) {
        enableMenuItems(menuBar);
      }
    };
    
    MouseAndFocusListener listener = new MouseAndFocusListener();
    ((JComponent)view).addMouseListener(listener);
    ((JComponent)view).addFocusListener(listener);
  }
  
  /**
   * Displays a content chooser open dialog to choose the name of a home.
   */
  public String showOpenDialog() {
    return this.controller.getContentManager().showOpenDialog(this, 
        this.preferences.getLocalizedString(HomePane.class, "openHomeDialog.title"), 
        ContentManager.ContentType.SWEET_HOME_3D);
  }

  /**
   * Displays a content chooser open dialog to choose a furniture library.
   */
  public String showImportFurnitureLibraryDialog() {
    return this.controller.getContentManager().showOpenDialog(this, 
        this.preferences.getLocalizedString(HomePane.class, "importFurnitureLibraryDialog.title"), 
        ContentManager.ContentType.FURNITURE_LIBRARY);
  }

  /**
   * Displays a dialog that lets user choose whether he wants to overwrite
   * an existing furniture library or not. 
   */
  public boolean confirmReplaceFurnitureLibrary(String furnitureLibraryName) {
    // Retrieve displayed text in buttons and message
    String message = this.preferences.getLocalizedString(HomePane.class, "confirmReplaceFurnitureLibrary.message", 
        new File(furnitureLibraryName).getName());
    String title = this.preferences.getLocalizedString(HomePane.class, "confirmReplaceFurnitureLibrary.title");
    String replace = this.preferences.getLocalizedString(HomePane.class, "confirmReplaceFurnitureLibrary.replace");
    String doNotReplace = this.preferences.getLocalizedString(HomePane.class, "confirmReplaceFurnitureLibrary.doNotReplace");
        
    return JOptionPane.showOptionDialog(this, 
        message, title, JOptionPane.OK_CANCEL_OPTION, JOptionPane.QUESTION_MESSAGE,
        null, new Object [] {replace, doNotReplace}, doNotReplace) == JOptionPane.OK_OPTION;
  }
  
  /**
   * Displays a dialog that lets user choose whether he wants to overwrite
   * an existing plug-in or not. 
   */
  public boolean confirmReplacePlugin(String pluginName) {
    // Retrieve displayed text in buttons and message
    String message = this.preferences.getLocalizedString(HomePane.class, "confirmReplacePlugin.message", 
        new File(pluginName).getName());
    String title = this.preferences.getLocalizedString(HomePane.class, "confirmReplacePlugin.title");
    String replace = this.preferences.getLocalizedString(HomePane.class, "confirmReplacePlugin.replace");
    String doNotReplace = this.preferences.getLocalizedString(HomePane.class, "confirmReplacePlugin.doNotReplace");
        
    return JOptionPane.showOptionDialog(this, 
        message, title, JOptionPane.OK_CANCEL_OPTION, JOptionPane.QUESTION_MESSAGE,
        null, new Object [] {replace, doNotReplace}, doNotReplace) == JOptionPane.OK_OPTION;
  }
  
  /**
   * Displays a content chooser save dialog to choose the name of a home.
   */
  public String showSaveDialog(String homeName) {
    return this.controller.getContentManager().showSaveDialog(this,
        this.preferences.getLocalizedString(HomePane.class, "saveHomeDialog.title"), 
        ContentManager.ContentType.SWEET_HOME_3D, homeName);
  }
  
  /**
   * Displays <code>message</code> in an error message box.
   */
  public void showError(String message) {
    String title = this.preferences.getLocalizedString(HomePane.class, "error.title");
    JOptionPane.showMessageDialog(this, message, title, 
        JOptionPane.ERROR_MESSAGE);
  }

  /**
   * Displays <code>message</code> in a message box.
   */
  public void showMessage(String message) {
    String title = this.preferences.getLocalizedString(HomePane.class, "message.title");
    JOptionPane.showMessageDialog(this, message, title, 
        JOptionPane.INFORMATION_MESSAGE);
  }

  /**
   * Displays the tip matching <code>actionTipKey</code> and 
   * returns <code>true</code> if the user chose not to display again the tip.
   */
  public boolean showActionTipMessage(String actionTipKey) {
    String title = this.preferences.getLocalizedString(HomePane.class, actionTipKey + ".tipTitle");
    String message = this.preferences.getLocalizedString(HomePane.class, actionTipKey + ".tipMessage");
    if (message.length() > 0) {
      JPanel tipPanel = new JPanel(new GridBagLayout());
      
      JLabel messageLabel = new JLabel(message);
      tipPanel.add(messageLabel, new GridBagConstraints(
          0, 0, 1, 1, 0, 0, GridBagConstraints.NORTH, 
          GridBagConstraints.NONE, new Insets(0, 0, 10, 0), 0, 0));
      
      // Add a check box that lets user choose whether he wants to display again the tip or not
      JCheckBox doNotDisplayTipCheckBox = new JCheckBox(
          this.preferences.getLocalizedString(HomePane.class, "doNotDisplayTipCheckBox.text"));
      if (!OperatingSystem.isMacOSX()) {
        doNotDisplayTipCheckBox.setMnemonic(KeyStroke.getKeyStroke(
            this.preferences.getLocalizedString(HomePane.class, "doNotDisplayTipCheckBox.mnemonic")).getKeyCode());
      }
      tipPanel.add(doNotDisplayTipCheckBox, new GridBagConstraints(
          0, 1, 1, 1, 0, 1, GridBagConstraints.CENTER, 
          GridBagConstraints.NONE, new Insets(0, 0, 5, 0), 0, 0));
      
      SwingTools.showMessageDialog(this, tipPanel, title, 
          JOptionPane.INFORMATION_MESSAGE, doNotDisplayTipCheckBox);
      return doNotDisplayTipCheckBox.isSelected();
    } else {
      // Ignore untranslated tips
      return true;
    }
  }
  
  /**
   * Displays a dialog that lets user choose whether he wants to save
   * the current home or not.
   * @return {@link com.eteks.sweethome3d.viewcontroller.HomeView.SaveAnswer#SAVE} 
   * if the user chose to save home,
   * {@link com.eteks.sweethome3d.viewcontroller.HomeView.SaveAnswer#DO_NOT_SAVE} 
   * if he doesn't want to save home,
   * or {@link com.eteks.sweethome3d.viewcontroller.HomeView.SaveAnswer#CANCEL} 
   * if he doesn't want to continue current operation.
   */
  public SaveAnswer confirmSave(String homeName) {
    // Retrieve displayed text in buttons and message
    String message;
    if (homeName != null) {
      message = this.preferences.getLocalizedString(HomePane.class, "confirmSave.message", 
          "\"" + this.controller.getContentManager().getPresentationName(
              homeName, ContentManager.ContentType.SWEET_HOME_3D) + "\"");
    } else {
      message = this.preferences.getLocalizedString(HomePane.class, "confirmSave.message", "");
    }
    String title = this.preferences.getLocalizedString(HomePane.class, "confirmSave.title");
    String save = this.preferences.getLocalizedString(HomePane.class, "confirmSave.save");
    String doNotSave = this.preferences.getLocalizedString(HomePane.class, "confirmSave.doNotSave");
    String cancel = this.preferences.getLocalizedString(HomePane.class, "confirmSave.cancel");

    switch (JOptionPane.showOptionDialog(this, message, title, 
        JOptionPane.YES_NO_CANCEL_OPTION, JOptionPane.QUESTION_MESSAGE,
        null, new Object [] {save, doNotSave, cancel}, save)) {
      // Convert showOptionDialog answer to SaveAnswer enum constants
      case JOptionPane.YES_OPTION:
        return SaveAnswer.SAVE;
      case JOptionPane.NO_OPTION:
        return SaveAnswer.DO_NOT_SAVE;
      default : return SaveAnswer.CANCEL;
    }
  }

  /**
   * Displays a dialog that let user choose whether he wants to save
   * a home that was created with a newer version of Sweet Home 3D.
   * @return <code>true</code> if user confirmed to save.
   */
  public boolean confirmSaveNewerHome(String homeName) {
    String message = this.preferences.getLocalizedString(HomePane.class, "confirmSaveNewerHome.message", 
        this.controller.getContentManager().getPresentationName(
            homeName, ContentManager.ContentType.SWEET_HOME_3D));
    String title = this.preferences.getLocalizedString(HomePane.class, "confirmSaveNewerHome.title");
    String save = this.preferences.getLocalizedString(HomePane.class, "confirmSaveNewerHome.save");
    String doNotSave = this.preferences.getLocalizedString(HomePane.class, "confirmSaveNewerHome.doNotSave");
    
    return JOptionPane.showOptionDialog(this, message, title, 
        JOptionPane.YES_NO_OPTION, JOptionPane.QUESTION_MESSAGE,
        null, new Object [] {save, doNotSave}, doNotSave) == JOptionPane.YES_OPTION;
  }
  
  /**
   * Displays a dialog that let user choose whether he wants to exit 
   * application or not.
   * @return <code>true</code> if user confirmed to exit.
   */
  public boolean confirmExit() {
    String message = this.preferences.getLocalizedString(HomePane.class, "confirmExit.message");
    String title = this.preferences.getLocalizedString(HomePane.class, "confirmExit.title");
    String quit = this.preferences.getLocalizedString(HomePane.class, "confirmExit.quit");
    String doNotQuit = this.preferences.getLocalizedString(HomePane.class, "confirmExit.doNotQuit");
    
    return JOptionPane.showOptionDialog(this, message, title, 
        JOptionPane.YES_NO_OPTION, JOptionPane.QUESTION_MESSAGE,
        null, new Object [] {quit, doNotQuit}, doNotQuit) == JOptionPane.YES_OPTION;
  }
  
  /**
   * Displays an about dialog.
   */
  public void showAboutDialog() {
    String messageFormat = this.preferences.getLocalizedString(HomePane.class, "about.message");
    String aboutVersion = this.controller.getVersion();
    String message = String.format(messageFormat, aboutVersion, System.getProperty("java.version"));
    // Use an uneditable editor pane to let user select text in dialog
    JEditorPane messagePane = new JEditorPane("text/html", message);
    messagePane.setOpaque(false);
    messagePane.setEditable(false);
    try { 
      // Lookup the javax.jnlp.BasicService object 
      final BasicService service = (BasicService)ServiceManager.lookup("javax.jnlp.BasicService");
      // If basic service supports  web browser
      if (service.isWebBrowserSupported()) {
        // Add a listener that displays hyperlinks content in browser
        messagePane.addHyperlinkListener(new HyperlinkListener() {
          public void hyperlinkUpdate(HyperlinkEvent ev) {
            if (ev.getEventType() == HyperlinkEvent.EventType.ACTIVATED) {
              service.showDocument(ev.getURL()); 
            }
          }
        });
      }
    } catch (UnavailableServiceException ex) {
      // Too bad : service is unavailable             
    } 
    
    String title = this.preferences.getLocalizedString(HomePane.class, "about.title");
    Icon   icon  = new ImageIcon(HomePane.class.getResource(
        this.preferences.getLocalizedString(HomePane.class, "about.icon")));
    JOptionPane.showMessageDialog(this, messagePane, title,  
        JOptionPane.INFORMATION_MESSAGE, icon);
  }

  /**
   * Shows a print dialog to print the home displayed by this pane.  
   * @return a print task to execute or <code>null</code> if the user canceled print.
   *    The <code>call</code> method of the returned task may throw a 
   *    {@link RecorderException RecorderException} exception if print failed 
   *    or an {@link InterruptedRecorderException InterruptedRecorderException}
   *    exception if it was interrupted.
   */
  public Callable<Void> showPrintDialog() {
    PageFormat pageFormat = HomePrintableComponent.getPageFormat(this.home.getPrint());
    final PrinterJob printerJob = PrinterJob.getPrinterJob();
    printerJob.setPrintable(new HomePrintableComponent(this.home, this.controller, getFont()), pageFormat);
    if (printerJob.printDialog()) {
      return new Callable<Void>() {
          public Void call() throws RecorderException {
            try {
              printerJob.print();
              return null;
            } catch (InterruptedPrinterException ex) {
              throw new InterruptedRecorderException("Print interrupted");
            } catch (PrinterException ex) {
              throw new RecorderException("Couldn't print", ex);
            } 
          }
        };
    } else {
      return null;
    }
  }

  /**
   * Shows a content chooser save dialog to print a home in a PDF file.
   */
  public String showPrintToPDFDialog(String homeName) {
    return this.controller.getContentManager().showSaveDialog(this,
        this.preferences.getLocalizedString(HomePane.class, "printToPDFDialog.title"), 
        ContentManager.ContentType.PDF, homeName);
  }
  
  /**
   * Prints a home to a given PDF file. This method may be overridden
   * to write to another kind of output stream.
   */
  public void printToPDF(String pdfFile) throws RecorderException {
    OutputStream outputStream = null;
    try {
      outputStream = new FileOutputStream(pdfFile);
      new HomePDFPrinter(this.home, this.preferences, this.controller, getFont())
          .write(outputStream);
    } catch (InterruptedIOException ex) {
      throw new InterruptedRecorderException("Print interrupted");
    } catch (IOException ex) {
      throw new RecorderException("Couldn't export to PDF", ex);
    } finally {
      try {
        if (outputStream != null) {
          outputStream.close();
        }
      } catch (IOException ex) {
        throw new RecorderException("Couldn't export to PDF", ex);
      }
    }
  }
  
  /**
   * Shows a content chooser save dialog to export a 3D home in a OBJ file.
   */
  public String showExportToOBJDialog(String homeName) {
    return this.controller.getContentManager().showSaveDialog(this,
        this.preferences.getLocalizedString(HomePane.class, "exportToOBJDialog.title"), 
        ContentManager.ContentType.OBJ, homeName);
  }
  
  /**
   * Exports the objects of the 3D view to the given OBJ file.
   */
  public void exportToOBJ(String objFile) throws RecorderException {
    try {
      String header = this.preferences != null
          ? this.preferences.getLocalizedString(HomePane.class, 
                                                "exportToOBJ.header", new Date())
          : "";      
      OBJWriter writer = new OBJWriter(objFile, header, -1);

      if (this.home.getWalls().size() > 0) {
        // Create a not alive new ground to be able to explore its coordinates without setting capabilities
        Rectangle2D homeBounds = getExportedHomeBounds();
        Ground3D groundNode = new Ground3D(this.home, 
            (float)homeBounds.getX(), (float)homeBounds.getY(), 
            (float)homeBounds.getWidth(), (float)homeBounds.getHeight(), true);
        writer.writeNode(groundNode, "ground");
      }
      
      // Write 3D walls 
      int i = 0;
      for (Wall wall : this.home.getWalls()) {
        // Create a not alive new wall to be able to explore its coordinates without setting capabilities 
        Wall3D wallNode = new Wall3D(wall, this.home, true, true);
        writer.writeNode(wallNode, "wall_" + ++i);
      }
      // Write 3D furniture 
      i = 0;
      for (HomePieceOfFurniture piece : this.home.getFurniture()) {
        if (piece.isVisible()) {
          // Create a not alive new piece to be able to explore its coordinates without setting capabilities
          HomePieceOfFurniture3D pieceNode = new HomePieceOfFurniture3D(piece, this.home, true, true);
          writer.writeNode(pieceNode, "piece_" + ++i);
        }
      }
      // Write 3D rooms 
      i = 0;
      for (Room room : this.home.getRooms()) {
        // Create a not alive new room to be able to explore its coordinates without setting capabilities 
        Room3D roomNode = new Room3D(room, this.home, false, true, true);
        writer.writeNode(roomNode, "room_" + ++i);
      }
      writer.close();
    } catch (InterruptedIOException ex) {
      throw new InterruptedRecorderException("Export to " + objFile + " interrupted");
    } catch (IOException ex) {
      throw new RecorderException("Failed to export to " + objFile, ex);
    } 
  }
  
  /**
   * Returns home bounds. 
   */
  private Rectangle2D getExportedHomeBounds() {
    // Compute bounds that include walls and furniture
    Rectangle2D homeBounds = updateObjectsBounds(null, this.home.getWalls());
    for (HomePieceOfFurniture piece : this.home.getFurniture()) {
      if (piece.isVisible()) {
        for (float [] point : piece.getPoints()) {
          if (homeBounds == null) {
            homeBounds = new Rectangle2D.Float(point [0], point [1], 0, 0);
          } else {
            homeBounds.add(point [0], point [1]);
          }
        }
      }
    }
    return updateObjectsBounds(homeBounds, this.home.getRooms());
  }
  
  /**
   * Updates <code>objectBounds</code> to include the bounds of <code>objects</code>.
   */
  private Rectangle2D updateObjectsBounds(Rectangle2D objectBounds,
                                          Collection<? extends Selectable> objects) {
    for (Selectable wall : objects) {
      for (float [] point : wall.getPoints()) {
        if (objectBounds == null) {
          objectBounds = new Rectangle2D.Float(point [0], point [1], 0, 0);
        } else {
          objectBounds.add(point [0], point [1]);
        }
      }
    }
    return objectBounds;
  }

  /**
   * Displays a dialog that let user choose whether he wants to delete 
   * the selected furniture from catalog or not.
   * @return <code>true</code> if user confirmed to delete.
   */
  public boolean confirmDeleteCatalogSelection() {
    // Retrieve displayed text in buttons and message
    String message = this.preferences.getLocalizedString(HomePane.class, "confirmDeleteCatalogSelection.message");
    String title = this.preferences.getLocalizedString(HomePane.class, "confirmDeleteCatalogSelection.title");
    String delete = this.preferences.getLocalizedString(HomePane.class, "confirmDeleteCatalogSelection.delete");
    String cancel = this.preferences.getLocalizedString(HomePane.class, "confirmDeleteCatalogSelection.cancel");
    
    return JOptionPane.showOptionDialog(this, message, title, 
        JOptionPane.OK_CANCEL_OPTION, JOptionPane.QUESTION_MESSAGE,
        null, new Object [] {delete, cancel}, cancel) == JOptionPane.OK_OPTION;
  }
  
  /**
   * Returns <code>true</code> if clipboard contains data that
   * components are able to handle.
   */
  public boolean isClipboardEmpty() {
    Clipboard clipboard = getToolkit().getSystemClipboard();
    return !(clipboard.isDataFlavorAvailable(HomeTransferableList.HOME_FLAVOR)
        || getToolkit().getSystemClipboard().isDataFlavorAvailable(DataFlavor.javaFileListFlavor));
    
  }

  /**
   * Execute <code>runnable</code> asynchronously in the thread 
   * that manages toolkit events.  
   */
  public void invokeLater(Runnable runnable) {
    EventQueue.invokeLater(runnable);
  }

  /**
   * A Swing action adapter to a plug-in action.
   */
  private class ActionAdapter implements Action {
    private PluginAction               pluginAction;
    private SwingPropertyChangeSupport propertyChangeSupport;
    
    private ActionAdapter(PluginAction pluginAction) {
      this.pluginAction = pluginAction;
      this.propertyChangeSupport = new SwingPropertyChangeSupport(this);
      this.pluginAction.addPropertyChangeListener(new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            String propertyName = ev.getPropertyName();
            Object oldValue = ev.getOldValue();
            Object newValue = getValue(propertyName);
            if (PluginAction.Property.ENABLED.name().equals(propertyName)) {
              propertyChangeSupport.firePropertyChange(
                  new PropertyChangeEvent(ev.getSource(), "enabled", oldValue, newValue));
            } else {
              // In case a property value changes, fire the new value decorated in subclasses
              // unless new value is null (most Swing listeners don't check new value is null !)
              if (newValue != null) {
                if (PluginAction.Property.NAME.name().equals(propertyName)) {
                  propertyChangeSupport.firePropertyChange(new PropertyChangeEvent(ev.getSource(), 
                      Action.NAME, oldValue, newValue));
                } else if (PluginAction.Property.SHORT_DESCRIPTION.name().equals(propertyName)) {
                  propertyChangeSupport.firePropertyChange(new PropertyChangeEvent(ev.getSource(), 
                      Action.NAME, oldValue, newValue));
                } else if (PluginAction.Property.MNEMONIC.name().equals(propertyName)) {
                  propertyChangeSupport.firePropertyChange(new PropertyChangeEvent(ev.getSource(), 
                      Action.MNEMONIC_KEY, 
                      oldValue != null 
                          ? new Integer((Character)oldValue) 
                          : null, newValue));
                } else if (PluginAction.Property.SMALL_ICON.name().equals(propertyName)) {
                  propertyChangeSupport.firePropertyChange(new PropertyChangeEvent(ev.getSource(), 
                      Action.SMALL_ICON, 
                      oldValue != null 
                         ? IconManager.getInstance().getIcon((Content)oldValue, DEFAULT_SMALL_ICON_HEIGHT, HomePane.this) 
                         : null, newValue));
                } else {
                  propertyChangeSupport.firePropertyChange(new PropertyChangeEvent(ev.getSource(), 
                      propertyName, oldValue, newValue));
                }
              }
            }
          }
        });
    }

    public void actionPerformed(ActionEvent ev) {
      this.pluginAction.execute();
    }

    public void addPropertyChangeListener(PropertyChangeListener listener) {
      this.propertyChangeSupport.addPropertyChangeListener(listener);
    }

    public void removePropertyChangeListener(PropertyChangeListener listener) {
      this.propertyChangeSupport.removePropertyChangeListener(listener);
    }

    public Object getValue(String key) {
      if (NAME.equals(key)) {
        return this.pluginAction.getPropertyValue(PluginAction.Property.NAME);
      } else if (SHORT_DESCRIPTION.equals(key)) {
        return this.pluginAction.getPropertyValue(PluginAction.Property.SHORT_DESCRIPTION);
      } else if (SMALL_ICON.equals(key)) {
        Content smallIcon = (Content)this.pluginAction.getPropertyValue(PluginAction.Property.SMALL_ICON);
        return smallIcon != null
            ? IconManager.getInstance().getIcon(smallIcon, DEFAULT_SMALL_ICON_HEIGHT, HomePane.this)
            : null;
      } else if (MNEMONIC_KEY.equals(key)) {
        Character mnemonic = (Character)this.pluginAction.getPropertyValue(PluginAction.Property.MNEMONIC);
        return mnemonic != null
            ? new Integer(mnemonic)
            : null;
      } else if (PluginAction.Property.TOOL_BAR.name().equals(key)) {
        return this.pluginAction.getPropertyValue(PluginAction.Property.TOOL_BAR);
      } else if (PluginAction.Property.MENU.name().equals(key)) {
        return this.pluginAction.getPropertyValue(PluginAction.Property.MENU);
      } else { 
        return null;
      }
    }

    public void putValue(String key, Object value) {
      if (NAME.equals(key)) {
        this.pluginAction.putPropertyValue(PluginAction.Property.NAME, value);
      } else if (SHORT_DESCRIPTION.equals(key)) {
        this.pluginAction.putPropertyValue(PluginAction.Property.SHORT_DESCRIPTION, value);
      } else if (SMALL_ICON.equals(key)) {
        // Ignore icon change
      } else if (MNEMONIC_KEY.equals(key)) {
        this.pluginAction.putPropertyValue(PluginAction.Property.MNEMONIC, 
            new Character((char)((Integer)value).intValue()));
      } else if (PluginAction.Property.TOOL_BAR.name().equals(key)) {
        this.pluginAction.putPropertyValue(PluginAction.Property.TOOL_BAR, value);
      } else if (PluginAction.Property.MENU.name().equals(key)) {
        this.pluginAction.putPropertyValue(PluginAction.Property.MENU, value);
      } 
    }

    public boolean isEnabled() {
      return this.pluginAction.isEnabled();
    }

    public void setEnabled(boolean enabled) {
      this.pluginAction.setEnabled(enabled);
    }
  }

  /**
   * A scroll pane that always displays scroll bar on Mac OS X.
   */
  private static class HomeScrollPane extends JScrollPane {
    public HomeScrollPane(JComponent view) {
      super(view);
      if (OperatingSystem.isMacOSX()) {
        setHorizontalScrollBarPolicy(HORIZONTAL_SCROLLBAR_ALWAYS);
        setVerticalScrollBarPolicy(VERTICAL_SCROLLBAR_ALWAYS);
      }
    }
  }

  private static final Border UNFOCUSED_BORDER;
  private static final Border FOCUSED_BORDER;

  static {
    if (OperatingSystem.isMacOSXLeopardOrSuperior()) {
      UNFOCUSED_BORDER = BorderFactory.createCompoundBorder(
          BorderFactory.createEmptyBorder(2, 2, 2, 2),
          BorderFactory.createLineBorder(Color.LIGHT_GRAY));
      FOCUSED_BORDER = new AbstractBorder() {
          private Insets insets = new Insets(3, 3, 3, 3);
          
          public Insets getBorderInsets(Component c) {
            return this.insets;
          }
    
          public void paintBorder(Component c, Graphics g, int x, int y, int width, int height) {
            Color previousColor = g.getColor();
            // Paint a gradient paint around component
            Rectangle rect = getInteriorRectangle(c, x, y, width, height);
            g.setColor(Color.GRAY);
            g.drawRect(rect.x - 1, rect.y - 1, rect.width + 1, rect.height + 1);
            Color focusColor = UIManager.getColor("Focus.color");
            int   transparency = 192;
            if (focusColor == null) {
              focusColor = UIManager.getColor("textHighlight");
              transparency = 128;
            }
            g.setColor(new Color(focusColor.getRed(), focusColor.getGreen(), focusColor.getBlue(), transparency));
            g.drawRect(rect.x - 1, rect.y - 1, rect.width + 1, rect.height + 1);
            g.drawRoundRect(rect.x - 3, rect.y - 3, rect.width + 5, rect.height + 5, 2, 2);
            g.setColor(focusColor);
            g.drawRoundRect(rect.x - 2, rect.y - 2, rect.width + 3, rect.height + 3, 1, 1);
            
            g.setColor(previousColor);
          }
        };
    } else {
      if (OperatingSystem.isMacOSX()) {
        UNFOCUSED_BORDER = BorderFactory.createCompoundBorder(
            BorderFactory.createEmptyBorder(1, 1, 1, 1),
            BorderFactory.createLineBorder(Color.LIGHT_GRAY));
      } else {
        UNFOCUSED_BORDER = BorderFactory.createEmptyBorder(2, 2, 2, 2);
      }
      FOCUSED_BORDER = BorderFactory.createLineBorder(UIManager.getColor("textHighlight"), 2);
    }
  }

  /**
   * A focus listener that calls <code>focusChanged</code> in 
   * home controller.
   */
  private class FocusableViewListener implements FocusListener {
    private HomeController controller;
    private JComponent     feedbackComponent;
    private KeyListener    specialKeysListener = new KeyAdapter() {
        @Override
        public void keyTyped(KeyEvent ev) {
          // This listener manages accelerator keys that may require the use of shift key 
          // depending on keyboard layout (like + - or ?) 
          ActionMap actionMap = getActionMap();
          Action [] specialKeyActions = {actionMap.get(ActionType.ZOOM_IN), 
                                         actionMap.get(ActionType.ZOOM_OUT), 
                                         actionMap.get(ActionType.INCREASE_TEXT_SIZE), 
                                         actionMap.get(ActionType.DECREASE_TEXT_SIZE), 
                                         actionMap.get(ActionType.HELP)};
          int modifiersMask = KeyEvent.ALT_MASK | KeyEvent.CTRL_MASK | KeyEvent.META_MASK;
          for (Action specialKeyAction : specialKeyActions) {
            KeyStroke actionKeyStroke = (KeyStroke)specialKeyAction.getValue(Action.ACCELERATOR_KEY);
            if (ev.getKeyChar() == actionKeyStroke.getKeyChar()
                && (ev.getModifiers() & modifiersMask) == (actionKeyStroke.getModifiers() & modifiersMask)
                && specialKeyAction.isEnabled()) {
              specialKeyAction.actionPerformed(new ActionEvent(HomePane.this, 
                  ActionEvent.ACTION_PERFORMED, (String)specialKeyAction.getValue(Action.ACTION_COMMAND_KEY)));
              ev.consume();
            }
          }
        }
      };
  
    public FocusableViewListener(HomeController controller, 
                                 JComponent     feedbackComponent) {
      this.controller = controller;
      this.feedbackComponent = feedbackComponent;
      feedbackComponent.setBorder(UNFOCUSED_BORDER);
    }
        
    public void focusGained(FocusEvent ev) {
      // Display a colored border
      this.feedbackComponent.setBorder(FOCUSED_BORDER);
      // Update the component used by clipboard actions
      focusedComponent = (JComponent)ev.getComponent();
      // Notify controller that active view changed
      this.controller.focusedViewChanged((View)focusedComponent);
      focusedComponent.addKeyListener(specialKeysListener);
    }
    
    public void focusLost(FocusEvent ev) {
      this.feedbackComponent.setBorder(UNFOCUSED_BORDER);
      focusedComponent.removeKeyListener(specialKeysListener);
    }
  }
  
  /**
   * A popup menu listener that displays only enabled menu items.
   */
  private static class MenuItemsVisibilityListener implements PopupMenuListener {
    public void popupMenuWillBecomeVisible(PopupMenuEvent ev) {        
      JPopupMenu popupMenu = (JPopupMenu)ev.getSource();
      // Make visible only enabled menu items   
      for (int i = 0; i < popupMenu.getComponentCount(); i++) {
        Component component = popupMenu.getComponent(i);
        if (component instanceof JMenu) {
          component.setVisible(containsEnabledItems((JMenu)component));
        } else if (component instanceof JMenuItem) {
          component.setVisible(component.isEnabled());
        }
      }
      // Make useless separators invisible
      boolean allMenuItemsInvisible = true;
      int lastVisibleSeparatorIndex = -1;
      for (int i = 0; i < popupMenu.getComponentCount(); i++) {
        Component component = popupMenu.getComponent(i);
        if (allMenuItemsInvisible && (component instanceof JMenuItem)) {
          if (component.isVisible()) {
            allMenuItemsInvisible = false;
          }
        } else if (component instanceof JSeparator) {          
          component.setVisible(!allMenuItemsInvisible);
          if (!allMenuItemsInvisible) {
            lastVisibleSeparatorIndex = i;
          }
          allMenuItemsInvisible = true;
        }
      }  
      if (lastVisibleSeparatorIndex != -1 && allMenuItemsInvisible) {
        // Check if last separator is the first visible component
        boolean allComponentsBeforeLastVisibleSeparatorInvisible = true;
        for (int i = lastVisibleSeparatorIndex - 1; i >= 0; i--) {
          if (popupMenu.getComponent(i).isVisible()) {
            allComponentsBeforeLastVisibleSeparatorInvisible = false;
            break;
          }
        }
        boolean allComponentsAfterLastVisibleSeparatorInvisible = true;
        for (int i = lastVisibleSeparatorIndex; i < popupMenu.getComponentCount(); i++) {
          if (popupMenu.getComponent(i).isVisible()) {
            allComponentsBeforeLastVisibleSeparatorInvisible = false;
            break;
          }
        }
        
        popupMenu.getComponent(lastVisibleSeparatorIndex).setVisible(
            !allComponentsBeforeLastVisibleSeparatorInvisible && !allComponentsAfterLastVisibleSeparatorInvisible);
      }
      // Ensure at least one item is visible
      boolean allItemsInvisible = true;
      for (int i = 0; i < popupMenu.getComponentCount(); i++) {
        if (popupMenu.getComponent(i).isVisible()) {
          allItemsInvisible = false;
          break;
        }
      }  
      if (allItemsInvisible) {
        popupMenu.getComponent(0).setVisible(true);
      }
    }

    /**
     * Returns <code>true</code> if the given <code>menu</code> contains 
     * at least one enabled menu item.
     */
    private boolean containsEnabledItems(JMenu menu) {
      boolean menuContainsEnabledItems = false;
      for (int i = 0; i < menu.getMenuComponentCount() && !menuContainsEnabledItems; i++) {
        Component component = menu.getMenuComponent(i);
        if (component instanceof JMenu) {
          menuContainsEnabledItems = containsEnabledItems((JMenu)component);
        } else if (component instanceof JMenuItem) {
          menuContainsEnabledItems = component.isEnabled();
        }
      }
      return menuContainsEnabledItems;
    }

    public void popupMenuCanceled(PopupMenuEvent ev) {
    }

    public void popupMenuWillBecomeInvisible(PopupMenuEvent ev) {
    }
  }
}
