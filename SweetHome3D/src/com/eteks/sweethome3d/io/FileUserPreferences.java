/*
 * FileUserPreferences.java 18 sept 2006
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
package com.eteks.sweethome3d.io;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.ResourceBundle;
import java.util.Set;
import java.util.prefs.BackingStoreException;
import java.util.prefs.Preferences;

import com.apple.eio.FileManager;
import com.eteks.sweethome3d.model.CatalogPieceOfFurniture;
import com.eteks.sweethome3d.model.CatalogTexture;
import com.eteks.sweethome3d.model.Content;
import com.eteks.sweethome3d.model.FurnitureCatalog;
import com.eteks.sweethome3d.model.FurnitureCategory;
import com.eteks.sweethome3d.model.IllegalHomonymException;
import com.eteks.sweethome3d.model.RecorderException;
import com.eteks.sweethome3d.model.TexturesCatalog;
import com.eteks.sweethome3d.model.TexturesCategory;
import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.tools.OperatingSystem;
import com.eteks.sweethome3d.tools.TemporaryURLContent;
import com.eteks.sweethome3d.tools.URLContent;

/**
 * User preferences initialized from 
 * {@link com.eteks.sweethome3d.io.DefaultUserPreferences default user preferences}
 * and stored in user preferences on local file system. 
 * @author Emmanuel Puybaret
 */
public class FileUserPreferences extends UserPreferences {
  private static final String LANGUAGE                    = "language";
  private static final String UNIT                        = "unit";
  private static final String MAGNETISM_ENABLED           = "magnetismEnabled";
  private static final String RULERS_VISIBLE              = "rulersVisible";
  private static final String GRID_VISIBLE                = "gridVisible";
  private static final String NEW_WALL_HEIGHT             = "newHomeWallHeight";
  private static final String NEW_WALL_THICKNESS          = "newWallThickness";
  private static final String RECENT_HOMES                = "recentHomes#";

  private static final String FURNITURE_NAME              = "furnitureName#";
  private static final String FURNITURE_CATEGORY          = "furnitureCategory#";
  private static final String FURNITURE_ICON              = "furnitureIcon#";
  private static final String FURNITURE_MODEL             = "furnitureModel#";
  private static final String FURNITURE_WIDTH             = "furnitureWidth#";
  private static final String FURNITURE_DEPTH             = "furnitureDepth#";
  private static final String FURNITURE_HEIGHT            = "furnitureHeight#";
  private static final String FURNITURE_MOVABLE           = "furnitureMovable#";
  private static final String FURNITURE_DOOR_OR_WINDOW    = "furnitureDoorOrWindow#";
  private static final String FURNITURE_ELEVATION         = "furnitureElevation#";
  private static final String FURNITURE_COLOR             = "furnitureColor#";
  private static final String FURNITURE_MODEL_ROTATION    = "furnitureModelRotation#";
  private static final String FURNITURE_BACK_FACE_SHOWN   = "furnitureBackFaceShown#";
  private static final String FURNITURE_ICON_YAW          = "furnitureIconYaw#";
  private static final String FURNITURE_PROPORTIONAL      = "furnitureProportional#";

  private static final String TEXTURE_NAME                = "textureName#";
  private static final String TEXTURE_CATEGORY            = "textureCategory#";
  private static final String TEXTURE_IMAGE               = "textureImage#";
  private static final String TEXTURE_WIDTH               = "textureWidth#";
  private static final String TEXTURE_HEIGHT              = "textureHeight#";

  private static final String FURNITURE_CONTENT_PREFIX    = "Content";
  private static final String TEXTURE_CONTENT_PREFIX      = "TextureContent";
  
  private static final String PLUGIN_FURNITURE_LIBRARIES_SUB_FOLDER = "furniture";

  private static final Content DUMMY_CONTENT;
  
  private static final String EDITOR_SUB_FOLDER; 
  private static final String APPLICATION_SUB_FOLDER; 
  
  static {
    Content dummyURLContent = null;
    try {
      dummyURLContent = new URLContent(new URL("file:/dummySweetHome3DContent"));
    } catch (MalformedURLException ex) {
    }
    DUMMY_CONTENT = dummyURLContent;

    // Retrieve sub folders where is stored application data
    ResourceBundle resource = ResourceBundle.getBundle(FileUserPreferences.class.getName());
    if (OperatingSystem.isMacOSX()) {
      EDITOR_SUB_FOLDER = resource.getString("editorSubFolder.Mac OS X");
      APPLICATION_SUB_FOLDER = resource.getString("applicationSubFolder.Mac OS X");
    } else if (OperatingSystem.isWindows()) {
      EDITOR_SUB_FOLDER = resource.getString("editorSubFolder.Windows");
      APPLICATION_SUB_FOLDER = resource.getString("applicationSubFolder.Windows");
    } else {
      EDITOR_SUB_FOLDER = resource.getString("editorSubFolder");
      APPLICATION_SUB_FOLDER = resource.getString("applicationSubFolder");
    }
  }
 
  /**
   * Creates user preferences read either from user preferences in file system, 
   * or from resource files.
   */
  public FileUserPreferences() {
    final Preferences preferences = getPreferences();
    setLanguage(preferences.get(LANGUAGE, getLanguage()));    

    DefaultUserPreferences defaultPreferences = new DefaultUserPreferences();
    
    // Fill default furniture catalog 
    setFurnitureCatalog(defaultPreferences.getFurnitureCatalog());
    // Read additional furniture
    readFurnitureCatalog(preferences);
    
    // Fill default textures catalog 
    setTexturesCatalog(defaultPreferences.getTexturesCatalog());
    // Read additional textures
    readTexturesCatalog(preferences);
    
    // Read other preferences 
    Unit unit = Unit.valueOf(preferences.get(UNIT, defaultPreferences.getUnit().toString()));
    setUnit(unit);
    setMagnetismEnabled(preferences.getBoolean(MAGNETISM_ENABLED, true));
    setRulersVisible(preferences.getBoolean(RULERS_VISIBLE, true));
    setGridVisible(preferences.getBoolean(GRID_VISIBLE, true));
    setNewWallThickness(preferences.getFloat(NEW_WALL_THICKNESS, 
            defaultPreferences.getNewWallThickness()));
    setNewWallHeight(preferences.getFloat(NEW_WALL_HEIGHT,
            defaultPreferences.getNewWallHeight()));    
    setCurrency(defaultPreferences.getCurrency());    
    // Read recent homes list
    List<String> recentHomes = new ArrayList<String>();
    for (int i = 1; i <= 4; i++) {
      String recentHome = preferences.get(RECENT_HOMES + i, null);
      if (recentHome != null) {
        recentHomes.add(recentHome);
      }
    }
    setRecentHomes(recentHomes);
    
    addPropertyChangeListener(Property.LANGUAGE, new PropertyChangeListener() {
        public void propertyChange(PropertyChangeEvent evt) {
          updateDefaultCatalogs();
        }
      });
  }

  /**
   * Reloads furniture and textures default catalogs.
   */
  private void updateDefaultCatalogs() {
    // Delete default pieces of current furniture catalog          
    FurnitureCatalog furnitureCatalog = getFurnitureCatalog();
    for (FurnitureCategory category : furnitureCatalog.getCategories()) {
      for (CatalogPieceOfFurniture piece : category.getFurniture()) {
        if (!piece.isModifiable()) {
          furnitureCatalog.delete(piece);
        }
      }
    }
    // Read again default furniture and textures catalogs with new default locale
    DefaultUserPreferences defaultPreferences = new DefaultUserPreferences();
    // Add default pieces that don't have homonym among user catalog
    FurnitureCatalog defaultFurnitureCatalog = defaultPreferences.getFurnitureCatalog();
    for (FurnitureCategory category : defaultFurnitureCatalog.getCategories()) {
      for (CatalogPieceOfFurniture piece : category.getFurniture()) {
        try {
          furnitureCatalog.add(category, piece);
        } catch (IllegalHomonymException ex) {
          // Ignore pieces that have the same name as an existing piece
        }
      }
    }
    
    // Delete default textures of current textures catalog          
    TexturesCatalog texturesCatalog = getTexturesCatalog();
    for (TexturesCategory category : texturesCatalog.getCategories()) {
      for (CatalogTexture texture : category.getTextures()) {
        if (!texture.isModifiable()) {
          texturesCatalog.delete(texture);
        }
      }
    }
    // Add default textures that don't have homonym among user catalog
    TexturesCatalog defaultTexturesCatalog = defaultPreferences.getTexturesCatalog();
    for (TexturesCategory category : defaultTexturesCatalog.getCategories()) {
      for (CatalogTexture texture : category.getTextures()) {
        try {
          texturesCatalog.add(category, texture);
        } catch (IllegalHomonymException ex) {
          // Ignore textures that have the same name as an existing piece
        }
      }
    }
  }

  /**
   * Read furniture catalog from preferences.
   */
  private void readFurnitureCatalog(Preferences preferences) {
    for (int i = 1; ; i++) {
      String name = preferences.get(FURNITURE_NAME + i, null);
      if (name == null) {
        // Stop the loop when a key furnitureName# doesn't exist
        break;
      }
      String category = preferences.get(FURNITURE_CATEGORY + i, "");
      Content icon  = getContent(preferences, FURNITURE_ICON + i);
      Content model = getContent(preferences, FURNITURE_MODEL + i);
      float width = preferences.getFloat(FURNITURE_WIDTH + i, 0.1f);
      float depth = preferences.getFloat(FURNITURE_DEPTH + i, 0.1f);
      float height = preferences.getFloat(FURNITURE_HEIGHT + i, 0.1f);
      boolean movable = preferences.getBoolean(FURNITURE_MOVABLE + i, false);
      boolean doorOrWindow = preferences.getBoolean(FURNITURE_DOOR_OR_WINDOW + i, false);
      float elevation = preferences.getFloat(FURNITURE_ELEVATION + i, 0);
      String colorString = preferences.get(FURNITURE_COLOR + i, null);
      Integer color = colorString != null 
          ? Integer.valueOf(colorString) : null; 
      float [][] modelRotation = getModelRotation(preferences, FURNITURE_MODEL_ROTATION + i);
      boolean backFaceShown = preferences.getBoolean(FURNITURE_BACK_FACE_SHOWN + i, false);
      float iconYaw = preferences.getFloat(FURNITURE_ICON_YAW + i, 0);
      boolean proportional = preferences.getBoolean(FURNITURE_PROPORTIONAL + i, true);

      FurnitureCategory pieceCategory = new FurnitureCategory(category);
      CatalogPieceOfFurniture piece = new CatalogPieceOfFurniture(name, icon, model,
          width, depth, height, elevation, movable, doorOrWindow,
          color, modelRotation, backFaceShown, iconYaw, proportional);
      try {        
        getFurnitureCatalog().add(pieceCategory, piece);
      } catch (IllegalHomonymException ex) {
        // If a piece with same name and category already exists in furniture catalog
        // replace the existing piece by the new one
        List<FurnitureCategory> categories = getFurnitureCatalog().getCategories();
        int categoryIndex = Collections.binarySearch(categories, pieceCategory);
        List<CatalogPieceOfFurniture> furniture = categories.get(categoryIndex).getFurniture();
        int existingPieceIndex = Collections.binarySearch(furniture, piece);        
        getFurnitureCatalog().delete(furniture.get(existingPieceIndex));
        
        getFurnitureCatalog().add(pieceCategory, piece);
      }
    }
  }  

  /**
   * Returns model rotation parsed from key value.
   */
  private float [][] getModelRotation(Preferences preferences, String key) {
    String modelRotationString = preferences.get(key, null);
    if (modelRotationString == null) {
      return new float [][] {{1, 0, 0}, {0, 1, 0}, {0, 0, 1}};
    } else {
      String [] values = modelRotationString.split(" ", 9);
      if (values.length != 9) {
        return new float [][] {{1, 0, 0}, {0, 1, 0}, {0, 0, 1}};
      } else {
        try {
          return new float [][] {{Float.parseFloat(values [0]), 
                                  Float.parseFloat(values [1]), 
                                  Float.parseFloat(values [2])}, 
                                 {Float.parseFloat(values [3]), 
                                  Float.parseFloat(values [4]), 
                                  Float.parseFloat(values [5])}, 
                                 {Float.parseFloat(values [6]), 
                                  Float.parseFloat(values [7]), 
                                  Float.parseFloat(values [8])}};
        } catch (NumberFormatException ex) {
          return new float [][] {{1, 0, 0}, {0, 1, 0}, {0, 0, 1}};
        }
      }
    }
  }
  
  /**
   * Returns a content instance from the resource file value of key.
   */
  private Content getContent(Preferences preferences, String key) {
    String content = preferences.get(key, null);
    if (content != null) {
      try {
        return new URLContent(new URL(content));
      } catch (MalformedURLException ex) {
        // Return DUMMY_CONTENT for incorrect URL
      } 
    }
    return DUMMY_CONTENT;
  }
  
  /**
   * Read textures catalog from preferences.
   */
  private void readTexturesCatalog(Preferences preferences) {
    for (int i = 1; ; i++) {
      String name = preferences.get(TEXTURE_NAME + i, null);
      if (name == null) {
        // Stop the loop when a key textureName# doesn't exist
        break;
      }
      String category = preferences.get(TEXTURE_CATEGORY + i, "");
      Content image = getContent(preferences, TEXTURE_IMAGE + i);
      float width = preferences.getFloat(TEXTURE_WIDTH + i, 0.1f);
      float height = preferences.getFloat(TEXTURE_HEIGHT + i, 0.1f);

      TexturesCategory textureCategory = new TexturesCategory(category);
      CatalogTexture texture = new CatalogTexture(name, image, width, height, true);
      try {        
        getTexturesCatalog().add(textureCategory, texture);
      } catch (IllegalHomonymException ex) {
        // If a texture with same name and category already exists in textures catalog
        // replace the existing texture by the new one
        List<TexturesCategory> categories = getTexturesCatalog().getCategories();
        int categoryIndex = Collections.binarySearch(categories, textureCategory);
        List<CatalogTexture> textures = categories.get(categoryIndex).getTextures();
        int existingTextureIndex = Collections.binarySearch(textures, texture);        
        getTexturesCatalog().delete(textures.get(existingTextureIndex));
        
        getTexturesCatalog().add(textureCategory, texture);
      }
    }
  }  

  /**
   * Writes user preferences in current user preferences in system.
   */
  @Override
  public void write() throws RecorderException {
    Preferences preferences = getPreferences();

    writeFurnitureCatalog(preferences);
    writeTexturesCatalog(preferences);

    // Write other preferences 
    preferences.put(LANGUAGE, getLanguage());
    preferences.put(UNIT, getUnit().toString());   
    preferences.putBoolean(MAGNETISM_ENABLED, isMagnetismEnabled());
    preferences.putBoolean(RULERS_VISIBLE, isRulersVisible());
    preferences.putBoolean(GRID_VISIBLE, isGridVisible());
    preferences.putFloat(NEW_WALL_THICKNESS, getNewWallThickness());   
    preferences.putFloat(NEW_WALL_HEIGHT, getNewWallHeight());
    // Write recent homes list
    int i = 1;
    for (Iterator<String> it = getRecentHomes().iterator(); it.hasNext() && i <= 4; i ++) {
      preferences.put(RECENT_HOMES + i, it.next());
    }
    // Remove obsolete keys
    for ( ; i <= 4; i++) {
      preferences.remove(RECENT_HOMES + i);
    }
    
    try {
      // Write preferences 
      preferences.sync();
    } catch (BackingStoreException ex) {
      throw new RecorderException("Couldn't write preferences", ex);
    }
  }

  /**
   * Writes furniture catalog in <code>preferences</code>.
   */
  private void writeFurnitureCatalog(Preferences preferences) throws RecorderException {
    final Set<URL> furnitureContentURLs = new HashSet<URL>();
    int i = 1;
    for (FurnitureCategory category : getFurnitureCatalog().getCategories()) {
      for (CatalogPieceOfFurniture piece : category.getFurniture()) {
        if (piece.isModifiable()) {
          preferences.put(FURNITURE_NAME + i, piece.getName());
          preferences.put(FURNITURE_CATEGORY + i, category.getName());
          putContent(preferences, FURNITURE_ICON + i, piece.getIcon(), 
              FURNITURE_CONTENT_PREFIX, furnitureContentURLs);
          putContent(preferences, FURNITURE_MODEL + i, piece.getModel(), 
              FURNITURE_CONTENT_PREFIX, furnitureContentURLs);
          preferences.putFloat(FURNITURE_WIDTH + i, piece.getWidth());
          preferences.putFloat(FURNITURE_DEPTH + i, piece.getDepth());
          preferences.putFloat(FURNITURE_HEIGHT + i, piece.getHeight());
          preferences.putBoolean(FURNITURE_MOVABLE + i, piece.isMovable());
          preferences.putBoolean(FURNITURE_DOOR_OR_WINDOW + i, piece.isDoorOrWindow());
          preferences.putFloat(FURNITURE_ELEVATION + i, piece.getElevation());
          if (piece.getColor() == null) {
            preferences.remove(FURNITURE_COLOR + i);
          } else {
            preferences.put(FURNITURE_COLOR + i, String.valueOf(piece.getColor()));
          }
          float [][] modelRotation = piece.getModelRotation();
          preferences.put(FURNITURE_MODEL_ROTATION + i, 
              modelRotation[0][0] + " " + modelRotation[0][1] + " " + modelRotation[0][2] + " "
              + modelRotation[1][0] + " " + modelRotation[1][1] + " " + modelRotation[1][2] + " "
              + modelRotation[2][0] + " " + modelRotation[2][1] + " " + modelRotation[2][2]);
          preferences.putBoolean(FURNITURE_BACK_FACE_SHOWN + i, piece.isBackFaceShown());
          preferences.putFloat(FURNITURE_ICON_YAW + i, piece.getIconYaw());
          preferences.putBoolean(FURNITURE_PROPORTIONAL + i, piece.isProportional());
          i++;
        }
      }
    }
    // Remove obsolete keys
    for ( ; preferences.get(FURNITURE_NAME + i, null) != null; i++) {
      preferences.remove(FURNITURE_NAME + i);
      preferences.remove(FURNITURE_CATEGORY + i);
      preferences.remove(FURNITURE_ICON + i);
      preferences.remove(FURNITURE_MODEL + i);
      preferences.remove(FURNITURE_WIDTH + i);
      preferences.remove(FURNITURE_DEPTH + i);
      preferences.remove(FURNITURE_HEIGHT + i);
      preferences.remove(FURNITURE_MOVABLE + i);
      preferences.remove(FURNITURE_DOOR_OR_WINDOW + i);
      preferences.remove(FURNITURE_ELEVATION + i);
      preferences.remove(FURNITURE_COLOR + i);
      preferences.remove(FURNITURE_MODEL_ROTATION + i);
      preferences.remove(FURNITURE_BACK_FACE_SHOWN + i);
      preferences.remove(FURNITURE_ICON_YAW + i);
      preferences.remove(FURNITURE_PROPORTIONAL + i);
    }
    deleteObsoleteContent(furnitureContentURLs, FURNITURE_CONTENT_PREFIX);
  }

  /**
   * Writes textures catalog in <code>preferences</code>.
   */
  private void writeTexturesCatalog(Preferences preferences) throws RecorderException {
    final Set<URL> texturesContentURLs = new HashSet<URL>();
    int i = 1;
    for (TexturesCategory category : getTexturesCatalog().getCategories()) {
      for (CatalogTexture texture : category.getTextures()) {
        if (texture.isModifiable()) {
          preferences.put(TEXTURE_NAME + i, texture.getName());
          preferences.put(TEXTURE_CATEGORY + i, category.getName());
          putContent(preferences, TEXTURE_IMAGE + i, texture.getImage(), 
              TEXTURE_CONTENT_PREFIX, texturesContentURLs);
          preferences.putFloat(TEXTURE_WIDTH + i, texture.getWidth());
          preferences.putFloat(TEXTURE_HEIGHT + i, texture.getHeight());
          i++;
        }
      }
    }
    // Remove obsolete keys
    for ( ; preferences.get(TEXTURE_NAME + i, null) != null; i++) {
      preferences.remove(TEXTURE_NAME + i);
      preferences.remove(TEXTURE_CATEGORY + i);
      preferences.remove(TEXTURE_IMAGE + i);
      preferences.remove(TEXTURE_WIDTH + i);
      preferences.remove(TEXTURE_HEIGHT + i);
    }
    deleteObsoleteContent(texturesContentURLs, TEXTURE_CONTENT_PREFIX);
  }

  /**
   * Writes <code>key</code> <code>content</code> in <code>preferences</code>.
   */
  private void putContent(Preferences preferences, String key, 
                          Content content, String contentPrefix,
                          Set<URL> furnitureContentURLs) throws RecorderException {
    if (content instanceof TemporaryURLContent) {
      URLContent urlContent = (URLContent)content;
      URLContent copiedContent;
      if (urlContent.isJAREntry()) {
        try {
          // If content is a JAR entry copy the content of its URL and rebuild a new URL content from 
          // this copy and the entry name
          copiedContent = copyToApplicationURLContent(new URLContent(urlContent.getJAREntryURL()), contentPrefix);
          copiedContent = new URLContent(new URL("jar:" + copiedContent.getURL() + "!/" + urlContent.getJAREntryName()));
        } catch (MalformedURLException ex) {
          // Shouldn't happen
          throw new RecorderException("Can't build URL", ex);
        }
      } else {
        copiedContent = copyToApplicationURLContent(urlContent, contentPrefix);
      }
      putContent(preferences, key, copiedContent, contentPrefix, furnitureContentURLs);
    } else if (content instanceof URLContent) {
      URLContent urlContent = (URLContent)content;
      preferences.put(key, urlContent.getURL().toString());
      // Add to furnitureContentURLs the URL to the application file
      if (urlContent.isJAREntry()) {
        furnitureContentURLs.add(urlContent.getJAREntryURL());
      } else {
        furnitureContentURLs.add(urlContent.getURL());
      }
    } else {
      putContent(preferences, key, copyToApplicationURLContent(content, contentPrefix), 
          contentPrefix, furnitureContentURLs);
    }
  }

  /**
   * Returns a content object that references a copy of <code>content</code> in 
   * user application folder.
   */
  private URLContent copyToApplicationURLContent(Content content, 
                                                 String contentPrefix) throws RecorderException {
    InputStream tempIn = null;
    OutputStream tempOut = null;
    try {
      File applicationFile = createApplicationFile(contentPrefix);
      tempIn = content.openStream();
      tempOut = new FileOutputStream(applicationFile);
      byte [] buffer = new byte [8096];
      int size; 
      while ((size = tempIn.read(buffer)) != -1) {
        tempOut.write(buffer, 0, size);
      }
      return new URLContent(applicationFile.toURI().toURL());
    } catch (IOException ex) {
      throw new RecorderException("Can't save content", ex);
    } finally {
      try {
        if (tempIn != null) {
          tempIn.close();
        }
        if (tempOut != null) {
          tempOut.close();
        }
      } catch (IOException ex) {
        throw new RecorderException("Can't close files", ex);
      }
    }
  }

  /**
   * Returns a new file in user application folder.
   */
  private File createApplicationFile(String filePrefix) throws IOException {
    File applicationFolder = getApplicationFolder();
    // Create application folder if it doesn't exist
    if (!applicationFolder.exists()
        && !applicationFolder.mkdirs()) {
      throw new IOException("Couldn't create " + applicationFolder);
    }
    // Return a new file in application folder
    return File.createTempFile(filePrefix, ".pref", applicationFolder);
  }

  /**
   * Returns the folder where plugin furniture libraries files must be placed.
   */
  static File getFurnitureLibrariesPluginFolder() throws IOException {
    return new File(getApplicationFolder(), PLUGIN_FURNITURE_LIBRARIES_SUB_FOLDER);
  }

  /**
   * Returns Sweet Home 3D application folder. 
   */
  private static File getApplicationFolder() throws IOException {
    File userApplicationFolder; 
    if (OperatingSystem.isMacOSX()) {
      userApplicationFolder = new File(MacOSXFileManager.getApplicationSupportFolder());
    } else if (OperatingSystem.isWindows()) {
      userApplicationFolder = new File(System.getProperty("user.home"), "Application Data");
      // If user Application Data directory doesn't exist, use user home
      if (!userApplicationFolder.exists()) {
        userApplicationFolder = new File(System.getProperty("user.home"));
      }
    } else { 
      // Unix
      userApplicationFolder = new File(System.getProperty("user.home"));
    }
    return new File(userApplicationFolder, 
        EDITOR_SUB_FOLDER + File.separator + APPLICATION_SUB_FOLDER);
  }

  /**
   * Deletes from application folder the content files starting by <code>contentPrefix</code>
   * that don't belong to <code>contentURLs</code>. 
   */
  private void deleteObsoleteContent(final Set<URL> contentURLs, 
                                     final String contentPrefix) throws RecorderException {
    // Search obsolete contents
    File applicationFolder;
    try {
      applicationFolder = getApplicationFolder();
    } catch (IOException ex) {
      throw new RecorderException("Can't access to application folder");
    }
    File [] obsoleteContentFiles = applicationFolder.listFiles(
        new FileFilter() {
          public boolean accept(File applicationFile) {
            try {
              URL toURL = applicationFile.toURI().toURL();
              return applicationFile.getName().startsWith(contentPrefix)
                 && !contentURLs.contains(toURL);
            } catch (MalformedURLException ex) {
              return false;
            }
          }
        });
    if (obsoleteContentFiles != null) {
      // Remove obsolete contents
      for (File file : obsoleteContentFiles) {
        if (!file.delete()) {
          throw new RecorderException("Couldn't delete file " + file);
        }
      }
    }
  }
  
  /**
   * File manager class that accesses to Mac OS X specifics.
   * Do not invoke methods of this class without checking first if 
   * <code>os.name</code> System property is <code>Mac OS X</code>.
   * This class requires some classes of <code>com.apple.eio</code> package  
   * to compile.
   */
  private static class MacOSXFileManager {
    public static String getApplicationSupportFolder() throws IOException {
      // Find application support folder (0x61737570) for user domain (-32763)
      return FileManager.findFolder((short)-32763, 0x61737570);
    }
  }
  
  /**
   * Returns Java preferences for current system user.
   */
  protected Preferences getPreferences() {
    return Preferences.userNodeForPackage(FileUserPreferences.class);
  }

  /**
   * Returns <code>true</code> if the given furniture library file exists in plugin directory.
   * @param name the name of the resource to check
   */
  @Override
  public boolean furnitureLibraryExists(String name) throws RecorderException {
    String libraryFileName = new File(name).getName();
    try {
      return new File(getFurnitureLibrariesPluginFolder(), libraryFileName).exists();
    } catch (IOException ex) {
      throw new RecorderException("Can't access to furniture libraries plugin folder", ex);
    }
  }

  /**
   * Adds the file <code>furnitureLibraryName</code> to plugin furniture libraries folder 
   * to make the furniture library available to catalog.
   */
  @Override
  public void addFurnitureLibrary(String furnitureLibraryName) throws RecorderException {
    try {
      String libraryFileName = new File(furnitureLibraryName).getName();
      File furnitureLibrariesPluginFolder = getFurnitureLibrariesPluginFolder();
      File destinationFile = new File(furnitureLibrariesPluginFolder, libraryFileName);

      // Copy furnitureCatalogFile to furniture plugin folder
      InputStream tempIn = null;
      OutputStream tempOut = null;
      try {
        tempIn = new BufferedInputStream(new FileInputStream(furnitureLibraryName));
        furnitureLibrariesPluginFolder.mkdirs();
        tempOut = new FileOutputStream(destinationFile);          
        byte [] buffer = new byte [8096];
        int size; 
        while ((size = tempIn.read(buffer)) != -1) {
          tempOut.write(buffer, 0, size);
        }
      } finally {
        if (tempIn != null) {
          tempIn.close();
        }
        if (tempOut != null) {
          tempOut.close();
        }
      }
      updateDefaultCatalogs();
    } catch (IOException ex) {
      throw new RecorderException(
          "Can't write " + furnitureLibraryName +  " in furniture libraries plugin folder", ex);
    }
  }
}
