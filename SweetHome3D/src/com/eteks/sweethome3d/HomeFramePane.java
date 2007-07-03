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

import java.awt.Dimension;
import java.awt.Frame;
import java.awt.Insets;
import java.awt.event.ActionEvent;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.ResourceBundle;

import javax.swing.AbstractAction;
import javax.swing.ImageIcon;
import javax.swing.JCheckBoxMenuItem;
import javax.swing.JFrame;
import javax.swing.JMenu;
import javax.swing.JMenuItem;
import javax.swing.JRootPane;
import javax.swing.event.MenuEvent;
import javax.swing.event.MenuListener;

import com.eteks.sweethome3d.model.CatalogPieceOfFurniture;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomeApplication;
import com.eteks.sweethome3d.model.HomeEvent;
import com.eteks.sweethome3d.model.HomeListener;
import com.eteks.sweethome3d.swing.HomePane;

/**
 * A pane that displays a 
 * {@link com.eteks.sweethome3d.swing.HomePane home pane} in a frame.
 * @author Emmanuel Puybaret
 */
public class HomeFramePane extends JRootPane {
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
    // Update frame image ans title 
    homeFrame.setIconImage(new ImageIcon(
        HomeFramePane.class.getResource("resources/frameIcon.png")).getImage());
    updateFrameTitle(homeFrame, this.home);
    // Compute frame size and location
    computeFrameBounds(homeFrame);
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
   * Add listeners to <code>frame</code> and model objects.
   */
  private void addListeners(final Home home,
                            final HomeApplication application,
                            final HomeFrameController controller,
                            final JFrame frame) {
    // Control frame closing and activation 
    frame.setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
    frame.addWindowListener(new WindowAdapter () {
        @Override
        public void windowClosing(WindowEvent ev) {
          controller.close();
        }
        
        @Override
        public void windowDeactivated(WindowEvent ev) {
          controller.setCatalogFurnitureSelectionSynchronized(false);
          // Store current selected furniture in catalog for future activation
          catalogSelectedFurniture = 
              application.getUserPreferences().getCatalog().getSelectedFurniture();
        }
        
        @Override
        public void windowActivated(WindowEvent ev) {          
          // Let the catalog view of each frame manage its own selection
          application.getUserPreferences().getCatalog().setSelectedFurniture(catalogSelectedFurniture);
          controller.setCatalogFurnitureSelectionSynchronized(true);
        }        
      });
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
    
    if (System.getProperty("os.name").startsWith("Mac OS X")) {
      // Add Mac OS X Window menu
      MacOSXConfiguration.addWindowMenuToFrame(frame);
    }
  }

  /**
   * Computes <code>frame</code> size and location to fit into screen.
   */
  private void computeFrameBounds(JFrame frame) {
    frame.setLocationByPlatform(true);
    frame.pack();
    Dimension screenSize = getToolkit().getScreenSize();
    Insets screenInsets = getToolkit().getScreenInsets(getGraphicsConfiguration());
    screenSize.width -= screenInsets.left + screenInsets.right;
    screenSize.height -= screenInsets.top + screenInsets.bottom;
    frame.setSize(Math.min(screenSize.width * 4 / 5, frame.getWidth()), 
            Math.min(screenSize.height * 4 / 5, frame.getHeight()));
  }
  
  /**
   * Updates <code>frame</code> title from <code>home</code> name.
   */
  private void updateFrameTitle(JFrame frame, Home home) {
    String name = home.getName();
    if (name == null) {
      name = this.resource.getString("untitled"); 
      if (newHomeNumber > 1) {
        name += " " + newHomeNumber;
      }
    } else {
      name = new File(name).getName();
    }
    
    String title = name;
    if (System.getProperty("os.name").startsWith("Mac OS X")) {
      // Use black indicator in close icon to show home is modified
      putClientProperty("windowModified", 
          Boolean.valueOf(home.isModified())); 
    } else {
      title += " - Sweet Home 3D"; 
      if (home.isModified()) {
        title = "* " + title;
      }
    }
    frame.setTitle(title);
  }
}
