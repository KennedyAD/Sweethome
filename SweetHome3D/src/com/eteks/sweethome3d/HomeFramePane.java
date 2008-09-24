/*
 * HomeFramePane.java 1 sept. 2006
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
package com.eteks.sweethome3d;

import java.awt.Component;
import java.awt.ComponentOrientation;
import java.awt.Container;
import java.awt.Dimension;
import java.awt.EventQueue;
import java.awt.FocusTraversalPolicy;
import java.awt.Insets;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.io.File;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.ResourceBundle;

import javax.swing.ImageIcon;
import javax.swing.JComponent;
import javax.swing.JFrame;
import javax.swing.JRootPane;

import com.eteks.sweethome3d.model.CatalogPieceOfFurniture;
import com.eteks.sweethome3d.model.ContentManager;
import com.eteks.sweethome3d.model.FurnitureCatalog;
import com.eteks.sweethome3d.model.FurnitureEvent;
import com.eteks.sweethome3d.model.FurnitureListener;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomeApplication;
import com.eteks.sweethome3d.model.HomeEvent;
import com.eteks.sweethome3d.model.HomeListener;
import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.swing.HomePane;
import com.eteks.sweethome3d.tools.OperatingSystem;

/**
 * A pane that displays a 
 * {@link com.eteks.sweethome3d.swing.HomePane home pane} in a frame.
 * @author Emmanuel Puybaret
 */
public class HomeFramePane extends JRootPane {
  private static final String FRAME_X_VISUAL_PROPERTY         = "com.eteks.sweethome3d.SweetHome3D.FrameX";
  private static final String FRAME_Y_VISUAL_PROPERTY         = "com.eteks.sweethome3d.SweetHome3D.FrameY";
  private static final String FRAME_WIDTH_VISUAL_PROPERTY     = "com.eteks.sweethome3d.SweetHome3D.FrameWidth";
  private static final String FRAME_HEIGHT_VISUAL_PROPERTY    = "com.eteks.sweethome3d.SweetHome3D.FrameHeight";
  private static final String FRAME_MAXIMIZED_VISUAL_PROPERTY = "com.eteks.sweethome3d.SweetHome3D.FrameMaximized";
  private static final String SCREEN_WIDTH_VISUAL_PROPERTY    = "com.eteks.sweethome3d.SweetHome3D.ScreenWidth";
  private static final String SCREEN_HEIGHT_VISUAL_PROPERTY   = "com.eteks.sweethome3d.SweetHome3D.ScreenHeight";
  
  private static int                    newHomeCount;
  private int                           newHomeNumber;
  private Home                          home;
  private HomeApplication               application;
  private HomeFrameController           controller;
  private ResourceBundle                resource;
  private List<CatalogPieceOfFurniture> catalogSelectedFurniture;
  
  public HomeFramePane(Home home,
                       HomeApplication application,
                       HomeFrameController controller) {
    this.home = home;
    this.controller = controller;
    this.application = application;
    this.resource = ResourceBundle.getBundle(HomeFramePane.class.getName());
    // The catalog selected furniture on a new home pane is always empty
    this.catalogSelectedFurniture = new ArrayList<CatalogPieceOfFurniture>();
    // If home is unnamed, give it a number
    if (home.getName() == null) {
      newHomeNumber = ++newHomeCount;
    }
    // Set controller view as content pane
    setContentPane(controller.getView());
  }

  /**
   * Builds and shows the frame that displays this pane.
   */
  public void displayView() {
    JFrame homeFrame = new JFrame() {
      {
        // Replace frame rootPane by home controller view
        setRootPane(HomeFramePane.this);
      }
    };
    // Update frame image and title 
    homeFrame.setIconImage(new ImageIcon(
        HomeFramePane.class.getResource("resources/frameIcon.png")).getImage());
    updateFrameTitle(homeFrame, this.home);
    if (OperatingSystem.isMacOSXLeopardOrSuperior()) {
      // Force focus traversal policy to ensure dividers and components of this kind won't get focus 
      final List<JComponent> focusableComponents = Arrays.asList(new JComponent [] {
          this.controller.getCatalogController().getView(),
          this.controller.getFurnitureController().getView(),
          this.controller.getPlanController().getView(),
          this.controller.getHomeController3D().getView()});      
      homeFrame.setFocusTraversalPolicy(new FocusTraversalPolicy() {
          @Override
          public Component getComponentAfter(Container container, Component component) {
            return focusableComponents.get((focusableComponents.indexOf(component) + 1) % focusableComponents.size());
          }
    
          @Override
          public Component getComponentBefore(Container container, Component component) {
            return focusableComponents.get((focusableComponents.indexOf(component) - 1) % focusableComponents.size());
          }
    
          @Override
          public Component getDefaultComponent(Container container) {
            return focusableComponents.get(0);
          }
    
          @Override
          public Component getFirstComponent(Container container) {
            return focusableComponents.get(0);
          }
    
          @Override
          public Component getLastComponent(Container container) {
            return focusableComponents.get(focusableComponents.size() - 1);
          }
        });
    }
    // Change component orientation
    applyComponentOrientation(ComponentOrientation.getOrientation(Locale.getDefault()));    
    // Compute frame size and location
    computeFrameBounds(this.home, homeFrame);
    // Enable windows to update their content while window resizing
    getToolkit().setDynamicLayout(true); 
    // The best solution should be to avoid the 3 following statements 
    // but Mac OS X accepts to display the menu bar of a frame in the screen 
    // menu bar only if this menu bar depends directly on its root pane  
    HomePane homeView = (HomePane)controller.getView();
    setJMenuBar(homeView.getJMenuBar());
    homeView.setJMenuBar(null);
    // Add listeners to model and frame    
    addListeners(this.home, this.application, this.controller, homeFrame);
    
    // Show frame
    homeFrame.setVisible(true);
  }
  
  /**
   * Adds listeners to <code>frame</code> and model objects.
   */
  private void addListeners(final Home home,
                            final HomeApplication application,
                            final HomeFrameController controller,
                            final JFrame frame) {
    // Add a listener that keeps track of window location and size
    frame.addComponentListener(new ComponentAdapter() {
        @Override
        public void componentResized(ComponentEvent ev) {
          // Store new size only if frame isn't maximized
          if ((frame.getExtendedState() & JFrame.MAXIMIZED_BOTH) != JFrame.MAXIMIZED_BOTH) {
            controller.setVisualProperty(FRAME_WIDTH_VISUAL_PROPERTY, frame.getWidth());
            controller.setVisualProperty(FRAME_HEIGHT_VISUAL_PROPERTY, frame.getHeight());
          }
          Dimension userScreenSize = getUserScreenSize();
          controller.setVisualProperty(SCREEN_WIDTH_VISUAL_PROPERTY, userScreenSize.width);
          controller.setVisualProperty(SCREEN_HEIGHT_VISUAL_PROPERTY, userScreenSize.height);
        }
        
        @Override
        public void componentMoved(ComponentEvent ev) {
          // Store new location only if frame isn't maximized
          if ((frame.getExtendedState() & JFrame.MAXIMIZED_BOTH) != JFrame.MAXIMIZED_BOTH) {
            controller.setVisualProperty(FRAME_X_VISUAL_PROPERTY, frame.getX());
            controller.setVisualProperty(FRAME_Y_VISUAL_PROPERTY, frame.getY());
          }
        }
      });
    // Control frame closing and activation 
    frame.setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
    WindowAdapter windowListener = new WindowAdapter () {
        private Component mostRecentFocusOwner;

        @Override
        public void windowStateChanged(WindowEvent ev) {
          controller.setVisualProperty(FRAME_MAXIMIZED_VISUAL_PROPERTY, 
              (frame.getExtendedState() & JFrame.MAXIMIZED_BOTH) == JFrame.MAXIMIZED_BOTH);
        }
        
        @Override
        public void windowClosing(WindowEvent ev) {
          controller.close();
        }
        
        @Override
        public void windowDeactivated(WindowEvent ev) {
          // Store current selected furniture in catalog for future activation
          controller.setCatalogFurnitureSelectionSynchronized(false);
          catalogSelectedFurniture = new ArrayList<CatalogPieceOfFurniture>(
              application.getUserPreferences().getFurnitureCatalog().getSelectedFurniture());
          
          // Java 3D 1.5 bug : windowDeactivated notifications should not be sent to this frame
          // while canvases 3D are created in a child modal dialog like the one managing 
          // ImportedFurnitureWizardStepsPanel. As this makes Swing loose the most recent focus owner
          // let's store it in a field to use it when this frame will be reactivated. 
          Component mostRecentFocusOwner = frame.getMostRecentFocusOwner();
          if (!(mostRecentFocusOwner instanceof JFrame)
              && mostRecentFocusOwner != null) {
            this.mostRecentFocusOwner = mostRecentFocusOwner;
          }
        }
        
        @Override
        public void windowActivated(WindowEvent ev) {                    
          // Let the catalog view of each frame manage its own selection :
          // Restore stored selected furniture when the frame is activated from outside of Sweet Home 3D
          // or from an other shown frame of Sweet Home 3D (don't rely on opposite window parent, because 
          // Java 3D creates some hidden dummy frames to manage its canvases 3D)
          // Note : Linux seems to always return null as an opposite window
          if (ev.getOppositeWindow() == null || ev.getOppositeWindow().isShowing()) {
            application.getUserPreferences().getFurnitureCatalog().setSelectedFurniture(catalogSelectedFurniture);
          } 
          controller.setCatalogFurnitureSelectionSynchronized(true);
          
          // Java 3D 1.5 bug : let's request focus in window for the most recent focus owner when
          // this frame is reactivated
          if (this.mostRecentFocusOwner != null) {
            EventQueue.invokeLater(new Runnable() {
                public void run() {
                  mostRecentFocusOwner.requestFocusInWindow();
                  mostRecentFocusOwner = null;
                }
              });
          }
        } 
      };
    frame.addWindowListener(windowListener);    
    frame.addWindowStateListener(windowListener);    
    // Add a listener to catalog to update the catalog selected furniture displayed by this pane
    application.getUserPreferences().getFurnitureCatalog().addFurnitureListener(
        new CatalogChangeFurnitureListener(this));
    // Add a listener to preferences to apply component orientation to frame matching current language
    application.getUserPreferences().addPropertyChangeListener(UserPreferences.Property.LANGUAGE, 
        new LanguageChangeListener(frame));
    // Dispose window when a home is deleted 
    application.addHomeListener(new HomeListener() {
        public void homeChanged(HomeEvent ev) {
          if (ev.getHome() == home
              && ev.getType() == HomeEvent.Type.DELETE) {
            application.removeHomeListener(this);
            frame.dispose();
          }
        };
      });
    // Update title when the name or the modified state of home changes
    home.addPropertyChangeListener(Home.Property.NAME, new PropertyChangeListener () {
        public void propertyChange(PropertyChangeEvent ev) {
          updateFrameTitle(frame, home);
        }
      });
    home.addPropertyChangeListener(Home.Property.MODIFIED, new PropertyChangeListener () {
        public void propertyChange(PropertyChangeEvent ev) {
          updateFrameTitle(frame, home);
        }
      });
  }

  /**
   * Catalog listener that updates catalog selection furniture each time a piece of furniture 
   * is deleted from catalog. This listener is bound to this controller 
   * with a weak reference to avoid strong link between catalog and this controller.  
   */
  private static class CatalogChangeFurnitureListener implements FurnitureListener {
    private WeakReference<HomeFramePane> homeFramePane;
    
    public CatalogChangeFurnitureListener(HomeFramePane homeFramePane) {
      this.homeFramePane = new WeakReference<HomeFramePane>(homeFramePane);
    }
    
    public void pieceOfFurnitureChanged(FurnitureEvent ev) {
      // If controller was garbage collected, remove this listener from catalog
      final HomeFramePane homeFramePane = this.homeFramePane.get();
      if (homeFramePane == null) {
        ((FurnitureCatalog)ev.getSource()).removeFurnitureListener(this);
      } else {
        switch (ev.getType()) {
          case DELETE :
            homeFramePane.catalogSelectedFurniture.remove(ev.getPieceOfFurniture());
            break;
        }
      }
    }
  }

  /**
   * Preferences property listener bound to this component with a weak reference to avoid
   * strong link between preferences and this component.  
   */
  private static class LanguageChangeListener implements PropertyChangeListener {
    private WeakReference<JFrame> frame;

    public LanguageChangeListener(JFrame frame) {
      this.frame = new WeakReference<JFrame>(frame);
    }
    
    public void propertyChange(PropertyChangeEvent ev) {
      // If frame was garbage collected, remove this listener from preferences
      JFrame frame = this.frame.get();
      if (frame == null) {
        ((UserPreferences)ev.getSource()).removePropertyChangeListener(
            UserPreferences.Property.LANGUAGE, this);
      } else {
        frame.applyComponentOrientation(ComponentOrientation.getOrientation(Locale.getDefault()));
      }
    }
  }
  
  /**
   * Computes <code>frame</code> size and location to fit into screen.
   */
  private void computeFrameBounds(Home home, JFrame frame) {
    Integer x = (Integer)home.getVisualProperty(FRAME_X_VISUAL_PROPERTY);
    Integer y = (Integer)home.getVisualProperty(FRAME_Y_VISUAL_PROPERTY);
    Integer width = (Integer)home.getVisualProperty(FRAME_WIDTH_VISUAL_PROPERTY);
    Integer height = (Integer)home.getVisualProperty(FRAME_HEIGHT_VISUAL_PROPERTY);
    Boolean maximized = (Boolean)home.getVisualProperty(FRAME_MAXIMIZED_VISUAL_PROPERTY);
    Integer screenWidth = (Integer)home.getVisualProperty(SCREEN_WIDTH_VISUAL_PROPERTY);
    Integer screenHeight = (Integer)home.getVisualProperty(SCREEN_HEIGHT_VISUAL_PROPERTY);
    
    Dimension screenSize = getUserScreenSize();
    // If home frame bounds exist and screen resolution didn't reduce 
    if (x != null && y != null 
        && width != null && height != null 
        && screenWidth != null && screenHeight != null
        && screenWidth >= screenSize.width
        && screenHeight >= screenSize.height) {
      // Reuse home bounds
      frame.setBounds(x, y, width, height);
      if (maximized != null && maximized) {
        frame.setExtendedState(JFrame.MAXIMIZED_BOTH);
      }
    } else {      
      frame.setLocationByPlatform(true);
      frame.pack();
      frame.setSize(Math.min(screenSize.width * 4 / 5, frame.getWidth()), 
              Math.min(screenSize.height * 4 / 5, frame.getHeight()));
    }
  }

  /**
   * Returns the screen size available to user. 
   */
  private Dimension getUserScreenSize() {
    Dimension screenSize = getToolkit().getScreenSize();
    Insets screenInsets = getToolkit().getScreenInsets(getGraphicsConfiguration());
    screenSize.width -= screenInsets.left + screenInsets.right;
    screenSize.height -= screenInsets.top + screenInsets.bottom;
    return screenSize;
  }
  
  /**
   * Updates <code>frame</code> title from <code>home</code> name.
   */
  private void updateFrameTitle(JFrame frame, Home home) {
    String homeName = home.getName();
    String homeDisplayedName;
    if (homeName == null) {
      homeDisplayedName = this.resource.getString("untitled"); 
      if (newHomeNumber > 1) {
        homeDisplayedName += " " + newHomeNumber;
      }
    } else {
      homeDisplayedName = this.application.getContentManager().getPresentationName(
          homeName, ContentManager.ContentType.SWEET_HOME_3D);
    }
    
    String title = homeDisplayedName;
    if (OperatingSystem.isMacOSX()) {
      // Use black indicator in close icon for a modified home 
      Boolean homeModified = Boolean.valueOf(home.isModified());
      // Set Mac OS X 10.4 property for backward compatibility
      putClientProperty("windowModified", homeModified);
      
      if (OperatingSystem.isMacOSXLeopardOrSuperior()) {
        putClientProperty("Window.documentModified", homeModified);
        
        if (homeName != null) {        
          File homeFile = new File(homeName);
          if (homeFile.exists()) {
            // Update the home icon in window title bar for home files
            putClientProperty("Window.documentFile", homeFile);
          }
        }
      }
    } else {
      title += " - Sweet Home 3D"; 
      if (home.isModified()) {
        title = "* " + title;
      }
    }
    frame.setTitle(title);
  }
}
