/*
 * TexturesLibraryEditor.java 11 sept 2012
 *
 * Textures Library Editor, Copyright (c) 2012 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
package com.eteks.textureslibraryeditor;

import java.awt.EventQueue;
import java.awt.Image;
import java.awt.desktop.AboutEvent;
import java.awt.desktop.AboutHandler;
import java.awt.desktop.OpenFilesEvent;
import java.awt.desktop.OpenFilesHandler;
import java.awt.desktop.PreferencesEvent;
import java.awt.desktop.PreferencesHandler;
import java.awt.desktop.QuitEvent;
import java.awt.desktop.QuitHandler;
import java.awt.desktop.QuitResponse;
import java.awt.desktop.QuitStrategy;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.io.File;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.List;

import javax.imageio.ImageIO;
import javax.swing.Action;
import javax.swing.ActionMap;
import javax.swing.ImageIcon;
import javax.swing.InputMap;
import javax.swing.JComponent;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JRootPane;
import javax.swing.KeyStroke;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;
import javax.swing.filechooser.FileFilter;

import com.apple.eawt.Application;
import com.apple.eawt.ApplicationAdapter;
import com.apple.eawt.ApplicationEvent;
import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.swing.FileContentManager;
import com.eteks.sweethome3d.swing.SwingTools;
import com.eteks.sweethome3d.tools.OperatingSystem;
import com.eteks.sweethome3d.viewcontroller.ContentManager;
import com.eteks.sweethome3d.viewcontroller.View;
import com.eteks.textureslibraryeditor.io.FileTexturesLibraryUserPreferences;
import com.eteks.textureslibraryeditor.io.TexturesLibraryFileRecorder;
import com.eteks.textureslibraryeditor.model.TexturesLibrary;
import com.eteks.textureslibraryeditor.model.TexturesLibraryRecorder;
import com.eteks.textureslibraryeditor.model.TexturesLibraryUserPreferences;
import com.eteks.textureslibraryeditor.swing.SwingEditorViewFactory;
import com.eteks.textureslibraryeditor.viewcontroller.EditorController;
import com.eteks.textureslibraryeditor.viewcontroller.EditorView;
import com.eteks.textureslibraryeditor.viewcontroller.EditorViewFactory;

/**
 * An application able to edit the textures described in a SH3F file.
 * @author Emmanuel Puybaret
 */
public class TexturesLibraryEditor {
  private TexturesLibraryFileRecorder texturesLibraryRecorder;
  private FileTexturesLibraryUserPreferences    userPreferences;
  private EditorViewFactory            viewFactory;
  private ContentManager               contentManager;

  /**
   * Returns a recorder able to write and read textures library files.
   */
  public TexturesLibraryRecorder getTexturesLibraryRecorder() {
    // Initialize texturesLibraryRecorder lazily
    if (this.texturesLibraryRecorder == null) {
      this.texturesLibraryRecorder = new TexturesLibraryFileRecorder();
    }
    return this.texturesLibraryRecorder;
  }

  /**
   * Returns user preferences stored in resources and local file system.
   */
  public TexturesLibraryUserPreferences getUserPreferences() {
    // Initialize userPreferences lazily
    if (this.userPreferences == null) {
      this.userPreferences = new FileTexturesLibraryUserPreferences();
    }
    return this.userPreferences;
  }

  /**
   * Returns a content manager able to handle files.
   */
  protected ContentManager getContentManager() {
    if (this.contentManager == null) {
      this.contentManager = new FileContentManager(getUserPreferences()) {
          private final String JSON_EXTENSION   = ".json";

          private File texturesDirectory;

          @Override
          public String showOpenDialog(View parentView,
                                       String dialogTitle,
                                       ContentType contentType) {
            if (contentType == ContentType.USER_DEFINED) {
              // Let user choose multiple image files
              JFileChooser fileChooser = new JFileChooser();
              // Update current directory
              if (this.texturesDirectory != null) {
                fileChooser.setCurrentDirectory(this.texturesDirectory);
              }
              fileChooser.setDialogTitle(dialogTitle);
              fileChooser.setMultiSelectionEnabled(true);
              if (fileChooser.showOpenDialog((JComponent)parentView) == JFileChooser.APPROVE_OPTION) {
                // Retrieve current directory for future calls
                this.texturesDirectory = fileChooser.getCurrentDirectory();
                // Return selected files separated by path separator character
                String files = "";
                for (File selectedFile : fileChooser.getSelectedFiles()) {
                  if (files.length() > 0) {
                    files += File.pathSeparator;
                  }
                  files += selectedFile;
                }
                return files;
              } else {
                return null;
              }
            } else {
              return super.showOpenDialog(parentView, dialogTitle, contentType);
            }
          }

          @Override
          public String showSaveDialog(View parentView, String dialogTitle, ContentType contentType, String path) {
            String savedPath = super.showSaveDialog(parentView, dialogTitle, contentType, path);
            if (contentType == ContentType.USER_DEFINED
                && savedPath != null) {
              // Reset textures library extension if user entered JSON + TEXTURES_LIBRARY extensions (TEXTURES_LIBRARY being added by default)
              String defaultExtension = getDefaultFileExtension(ContentType.TEXTURES_LIBRARY);
              if (savedPath.toLowerCase().endsWith(JSON_EXTENSION + defaultExtension)) {
                savedPath = savedPath.substring(0, savedPath.lastIndexOf(defaultExtension));
                // If the file exists, prompt user if he wants to overwrite it
                File savedFile = new File(savedPath);
                if (savedFile.exists()
                    && !OperatingSystem.isMacOSX()
                    && !confirmOverwrite(parentView, savedFile.getName())) {
                  return showSaveDialog(parentView, dialogTitle, contentType, savedPath);
                }
              }
            }
            return savedPath;
          }

          @Override
          protected FileFilter [] getFileFilter(ContentType contentType) {
            if (contentType == ContentType.TEXTURES_LIBRARY) {
              FileFilter [] fileFilter = super.getFileFilter(contentType);
              FileFilter [] filters = new FileFilter [fileFilter.length + 1];
              System.arraycopy(fileFilter, 0, filters, 0, fileFilter.length);
              filters [filters.length - 1] = new FileFilter() {
                  @Override
                  public String getDescription() {
                    return "Default library";
                  }

                  @Override
                  public boolean accept(File file) {
                    return file.isDirectory()
                        || getTexturesLibraryRecorder().isDefaultTexturesLibrary(file.getAbsolutePath());
                  }
                };
              return filters;
            } else if (contentType == ContentType.USER_DEFINED) {
              FileFilter [] fileFilter = super.getFileFilter(ContentType.TEXTURES_LIBRARY);
              FileFilter [] filters = new FileFilter [fileFilter.length + 1];
              System.arraycopy(fileFilter, 0, filters, 0, fileFilter.length);
              filters [filters.length - 1] = new FileFilter() {
                  @Override
                  public boolean accept(File file) {
                    // Accept JSON files
                    return file.isDirectory()
                        || file.getName().toLowerCase().endsWith(JSON_EXTENSION);
                  }

                  @Override
                  public String getDescription() {
                    return "JSON";
                  }
                };
              return filters;
            } else {
              return super.getFileFilter(contentType);
            }
          }

          @Override
          protected String [] getFileExtensions(ContentType contentType) {
            String [] fileExtensions = super.getFileExtensions(contentType);
            if (contentType == ContentType.USER_DEFINED) {
              String [] fileExtensionsWithJson = new String [fileExtensions.length + 1];
              System.arraycopy(fileExtensions, 0, fileExtensionsWithJson, 0, fileExtensions.length);
              fileExtensionsWithJson [fileExtensionsWithJson.length - 1] = JSON_EXTENSION;
              return fileExtensionsWithJson;
            } else {
              return fileExtensions;
            }
          }

          @Override
          public String getDefaultFileExtension(ContentType contentType) {
            return super.getDefaultFileExtension(contentType == ContentType.USER_DEFINED
                ? ContentType.TEXTURES_LIBRARY
                : contentType);
          }
        };
    }
    return this.contentManager;
  }

  /**
   * Returns a Swing view factory.
   */
  protected EditorViewFactory getViewFactory() {
    if (this.viewFactory == null) {
      this.viewFactory = new SwingEditorViewFactory();
    }
    return this.viewFactory;
  }

  /**
   * Returns a new instance of an editor controller after <code>texturesLibrary</code> was created.
   */
  protected EditorController createEditorController(TexturesLibrary texturesLibrary) {
    return new EditorController(texturesLibrary, getTexturesLibraryRecorder(), getUserPreferences(),
        getViewFactory(), getContentManager());
  }

  /**
   * Textures Library Editor entry point.
   * @param args may contain one .sh3f file to open,
   *     following a <code>-open</code> option.
   */
  public static void main(String [] args) {
    new TexturesLibraryEditor().init(args);
  }

  /**
   * Initializes application instance.
   */
  protected void init(final String [] args) {
    initSystemProperties();
    initLookAndFeel();
    EventQueue.invokeLater(new Runnable() {
      public void run() {
        TexturesLibraryEditor.this.run(args);
      }
    });
  }

  /**
   * Sets various <code>System</code> properties.
   */
  private void initSystemProperties() {
    if (OperatingSystem.isMacOSX()) {
      // Change Mac OS X application menu name
      System.setProperty("com.apple.mrj.application.apple.menu.about.name", "Textures Library Editor");
      // Use Mac OS X screen menu bar for frames menu bar
      System.setProperty("apple.laf.useScreenMenuBar", "true");
      // Force the use of Quartz under Mac OS X for better Java 2D rendering performance
      System.setProperty("apple.awt.graphics.UseQuartz", "true");
    }
  }

  /**
   * Sets application look and feel.
   */
  private void initLookAndFeel() {
    try {
      // Apply current system look and feel
      UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
      // Change default titled borders under Mac OS X 10.5
      if (OperatingSystem.isMacOSXLeopardOrSuperior()) {
        UIManager.put("TitledBorder.border",
            UIManager.getBorder("TitledBorder.aquaVariant"));
      }
      SwingTools.updateSwingResourceLanguage();
    } catch (Exception ex) {
      // Too bad keep current look and feel
    }
  }

  /**
   * Runs application once initialized.
   */
  private void run(String [] args) {
    final String texturesLibraryName;
    if (args.length == 2
        && "-open".equals(args [0])) {
      texturesLibraryName = args [1];
    } else {
      texturesLibraryName = null;
    }

    final TexturesLibrary texturesLibrary = new TexturesLibrary();
    final EditorController editorController = createEditorController(texturesLibrary);
    final View editorView = editorController.getView();

    final JFrame texturesFrame = new JFrame() {
        {
          if (editorView instanceof JRootPane) {
            setRootPane((JRootPane)editorView);
          } else {
            add((JComponent)editorView);
          }
        }
      };
    // Update frame image and title
    Image [] frameImages = {new ImageIcon(TexturesLibraryEditor.class.getResource("resources/frameIcon.png")).getImage(),
                            new ImageIcon(TexturesLibraryEditor.class.getResource("resources/frameIcon32x32.png")).getImage()};
    try {
      // Call Java 1.6 setIconImages by reflection
      texturesFrame.getClass().getMethod("setIconImages", List.class)
          .invoke(texturesFrame, Arrays.asList(frameImages));
    } catch (Exception ex) {
      // Call setIconImage available in previous versions
      texturesFrame.setIconImage(frameImages [0]);
    }
    texturesFrame.setLocationByPlatform(true);
    texturesFrame.pack();
    texturesFrame.setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE);
    texturesFrame.setVisible(true);
    texturesFrame.addWindowListener(new WindowAdapter() {
        @Override
        public void windowClosing(WindowEvent ev) {
          editorController.exit();
        }
      });
    if (texturesFrame.getJMenuBar() == null) {
      installAccelerators(texturesFrame, editorController);
    }

    if (OperatingSystem.isMacOSX()) {
      MacOSXConfiguration.bindToApplicationMenu(editorController);
    }

    if (texturesLibraryName != null) {
      editorController.open(texturesLibraryName);
    }
    updateFrameTitle(texturesFrame, texturesLibrary, getUserPreferences(), getContentManager());
    // Update title when the name or the modified state of library changes
    texturesLibrary.addPropertyChangeListener(TexturesLibrary.Property.LOCATION, new PropertyChangeListener () {
        public void propertyChange(PropertyChangeEvent ev) {
          updateFrameTitle(texturesFrame, texturesLibrary, getUserPreferences(), getContentManager());
        }
      });
    texturesLibrary.addPropertyChangeListener(TexturesLibrary.Property.MODIFIED, new PropertyChangeListener () {
        public void propertyChange(PropertyChangeEvent ev) {
          updateFrameTitle(texturesFrame, texturesLibrary, getUserPreferences(), getContentManager());
        }
      });
  }

  /**
   * Changes the input map of textures library view to ensure accelerators work even with no menu.
   */
  private void installAccelerators(JFrame texturesFrame,
                                   final EditorController texturesLibraryController) {
    JComponent texturesLibraryView = (JComponent)texturesLibraryController.getView();
    InputMap inputMap = texturesLibraryView.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW);
    ActionMap actionMap = texturesLibraryView.getActionMap();
    for (Object key : actionMap.allKeys()) {
      if (key instanceof EditorView.ActionType) {
        inputMap.put((KeyStroke)actionMap.get(key).getValue(Action.ACCELERATOR_KEY), key);
      }
    }
  }

  /**
   * Updates <code>frame</code> title from <code>texturesLibrary</code> name.
   */
  private void updateFrameTitle(JFrame frame,
                                TexturesLibrary texturesLibrary,
                                UserPreferences  preferences,
                                ContentManager   contentManager) {
    String texturesLibraryLocation = texturesLibrary.getLocation();
    String texturesLibraryDisplayedName;
    if (texturesLibraryLocation == null) {
      texturesLibraryDisplayedName = preferences.getLocalizedString(TexturesLibraryEditor.class, "untitled");
    } else {
      texturesLibraryDisplayedName = contentManager.getPresentationName(
          texturesLibraryLocation, ContentManager.ContentType.TEXTURES_LIBRARY);
    }

    String title = texturesLibraryDisplayedName;
    if (OperatingSystem.isMacOSX()) {
      // Use black indicator in close icon for a modified library
      Boolean texturesLibraryModified = Boolean.valueOf(texturesLibrary.isModified());
      // Set Mac OS X 10.4 property for backward compatibility
      frame.getRootPane().putClientProperty("windowModified", texturesLibraryModified);

      if (OperatingSystem.isMacOSXLeopardOrSuperior()) {
        frame.getRootPane().putClientProperty("Window.documentModified", texturesLibraryModified);

        if (texturesLibraryLocation != null) {
          File texturesLibraryFile = new File(texturesLibraryLocation);
          if (texturesLibraryFile.exists()) {
            // Update the icon in window title bar for library files
            frame.getRootPane().putClientProperty("Window.documentFile", texturesLibraryFile);
          }
        }
      }
    } else {
      title += " - " + preferences.getLocalizedString(TexturesLibraryEditor.class, "title");
      if (texturesLibrary.isModified()) {
        title = "* " + title;
      }
    }
    frame.setTitle(title);
  }

  /**
   * Mac OS X configuration. The methods use in this class are invoked in a separated class
   * because they exist only under Mac OS X.
   */
  private static class MacOSXConfiguration {
    /**
     * Binds <code>controller</code> to Mac OS X application menu.
     */
    public static void bindToApplicationMenu(final EditorController controller) {
      Application macosxApplication = Application.getApplication();
      boolean applicationListenerSupported = false;
      try {
        // Add a listener to Mac OS X application that will call
        // controller methods of the active frame
        // Call macosxApplication.addApplicationListener(new MacOSXApplicationListener(homeApplication, defaultController, defaultFrame));
        macosxApplication.getClass().getMethod("addApplicationListener", Class.forName("com.apple.eawt.ApplicationListener")).invoke(macosxApplication,
            MacOSXApplicationListener.class.getConstructor(EditorController.class).newInstance(controller));
        macosxApplication.setEnabledAboutMenu(true);
        macosxApplication.setEnabledPreferencesMenu(true);
        applicationListenerSupported = true;
      } catch (NoSuchMethodException ex) {
      } catch (IllegalAccessException ex) {
      } catch (InvocationTargetException ex) {
      } catch (ClassNotFoundException ex) {
      } catch (InstantiationException ex) {
      }

      if (!applicationListenerSupported) {
        // Probably running under Java 9 where previous methods were removed
        if (OperatingSystem.isJavaVersionGreaterOrEqual("1.9")) {
          try {
            // Instantiate Java 9 handlers and set them on desktop by reflection
            Class<?> desktopClass = Class.forName("java.awt.Desktop");
            Object desktopInstance = desktopClass.getMethod("getDesktop").invoke(null);

            Object quitHandler = new QuitHandler() {
                public void handleQuitRequestWith(QuitEvent ev, QuitResponse answer) {
                  MacOSXConfiguration.handleQuit(controller);
                  answer.cancelQuit();
                }
              };
            desktopClass.getMethod("setQuitHandler", QuitHandler.class).invoke(desktopInstance, quitHandler);

            Object aboutHandler = new AboutHandler() {
                public void handleAbout(AboutEvent ev) {
                  MacOSXConfiguration.handleAbout(controller);
                }
              };
            desktopClass.getMethod("setAboutHandler", AboutHandler.class).invoke(desktopInstance, aboutHandler);

            Object preferencesHandler = new PreferencesHandler() {
                public void handlePreferences(PreferencesEvent ev) {
                  MacOSXConfiguration.handlePreferences(controller);
                }
              };
            desktopClass.getMethod("setPreferencesHandler", PreferencesHandler.class).invoke(desktopInstance, preferencesHandler);

            Object openFilesHandler = new OpenFilesHandler() {
                public void openFiles(OpenFilesEvent ev) {
                  for (java.io.File file : ev.getFiles()) {
                    MacOSXConfiguration.handleOpenFile(controller, file.getAbsolutePath());
                  }
                }
              };
            desktopClass.getMethod("setOpenFileHandler", OpenFilesHandler.class).invoke(desktopInstance, openFilesHandler);

            // Call Desktop.getDesktop().setQuitStrategy(QuitStrategy.CLOSE_ALL_WINDOWS) to prevent default call to System#exit
            desktopClass.getMethod("setQuitStrategy", QuitStrategy.class).invoke(desktopInstance, QuitStrategy.CLOSE_ALL_WINDOWS);
          } catch (NoSuchMethodException ex) {
          } catch (IllegalAccessException ex) {
          } catch (InvocationTargetException ex) {
          } catch (ClassNotFoundException ex) {
          }
        }
      }

      // Set application icon if program wasn't launch from bundle
      if (!"true".equalsIgnoreCase(System.getProperty("textureslibraryeditor.bundle", "false"))) {
        try {
          Image icon = ImageIO.read(MacOSXConfiguration.class.getResource("swing/resources/aboutIcon.png"));
          macosxApplication.setDockIconImage(icon);
        } catch (NoSuchMethodError ex) {
          // Ignore icon change if setDockIconImage isn't available
        } catch (IOException ex) {
        }
      }
    }

    /**
     * Handles quit action.
     */
    private static void handleQuit(final EditorController controller) {
      controller.exit();
    }

    /**
     * Handles how about pane is displayed.
     */
    protected static void handleAbout(final EditorController controller) {
      controller.about();
    }

    /**
     * Handles how preferences pane is displayed.
     */
    private static void handlePreferences(final EditorController controller) {
      controller.editPreferences();
    }

    /**
     * Handles the opening of a document.
     */
    private static void handleOpenFile(EditorController controller, String fileName) {
      controller.open(fileName);
    }

    /**
     * Handles application when it's reopened.
     */
    private static void handleReOpenApplication(EditorController controller) {
      SwingUtilities.getWindowAncestor((JComponent)controller.getView()).toFront();
    }
  }

  /**
   * Listener for Mac OS X application events.
   * Declared in a separated static class and instantiated by reflection to be able to run Sweet Home 3D with Java 10.
   */
  private static class MacOSXApplicationListener extends ApplicationAdapter {
    private final EditorController controller;

    public MacOSXApplicationListener(EditorController controller) {
      this.controller = controller;
    }

    @Override
    public void handleQuit(ApplicationEvent ev) {
      MacOSXConfiguration.handleQuit(this.controller);
    }

    @Override
    public void handleAbout(ApplicationEvent ev) {
      MacOSXConfiguration.handleAbout(this.controller);
      ev.setHandled(true);
    }

    @Override
    public void handlePreferences(ApplicationEvent ev) {
      MacOSXConfiguration.handlePreferences(this.controller);
      ev.setHandled(true);
    }

    @Override
    public void handleOpenFile(ApplicationEvent ev) {
      MacOSXConfiguration.handleOpenFile(this.controller, ev.getFilename());
    }

    @Override
    public void handleReOpenApplication(ApplicationEvent ev) {
      MacOSXConfiguration.handleReOpenApplication(this.controller);
    }
  }
}
