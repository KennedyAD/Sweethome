/*
 * SweetHome3D.java 1 sept. 2006
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
package com.eteks.sweethome3d.jface;

import org.eclipse.jface.window.ApplicationWindow;

import com.eteks.sweethome3d.io.DefaultUserPreferences;
import com.eteks.sweethome3d.io.HomeFileRecorder;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomeApplication;
import com.eteks.sweethome3d.model.HomeEvent;
import com.eteks.sweethome3d.model.HomeListener;
import com.eteks.sweethome3d.model.HomeRecorder;
import com.eteks.sweethome3d.model.UserPreferences;

/**
 * Sweet Home 3D main class for SWT/JFace implementation.
 * @author Emmanuel Puybaret
 */
public class SweetHome3D extends HomeApplication {
  private HomeRecorder    homeRecorder;
  private UserPreferences userPreferences;

  private SweetHome3D() {
    this.homeRecorder = new HomeFileRecorder();
    this.userPreferences = new DefaultUserPreferences();
  }

  /**
   * Returns a recorder able to write and read homes in files.
   */
  @Override
  public HomeRecorder getHomeRecorder() {
    return this.homeRecorder;
  }
  
  /**
   * Returns user preferences stored in resources and local file system.
   */
  @Override
  public UserPreferences getUserPreferences() {
    return this.userPreferences;
  }

  /**
   * Sweet Home 3D entry point.
   */
  public static void main(String [] args) {
    // Change Mac OS X application menu name
    System.setProperty("com.apple.mrj.application.apple.menu.about.name", "Sweet Home 3D");

    // Create the application that manages homes
    final HomeApplication application = new SweetHome3D();
    // Add a listener that opens a frame when a home is added to application
    application.addHomeListener(new HomeListener() {
        public void homeChanged(HomeEvent ev) {
          switch (ev.getType()) {
            case ADD :
              Home home = ev.getHome();
              ApplicationWindow window = new HomeApplicationWindow(home, application);
              window.setBlockOnOpen(true);
              window.open();
              break;
            case DELETE :
              // Exit if application has no more home
              if (application.getHomes().isEmpty()) {
                System.exit(0);
              }
              break;
          }
        };
      });

    Home firstHome = new Home(application.getUserPreferences().getNewHomeWallHeight());
    // Opening a frame at the end of a main is ok as main method work is over after this call
    application.addHome(firstHome);    
  }
}
