/*
 * DefaultFurnitureCatalog.java 7 avr. 2006
 * 
 * Copyright (c) 2006 Emmanuel PUYBARET / eTeks <info@eteks.com>. All Rights Reserved.
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; either version 2 of the License, or (at your option) any later
 * version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 59 Temple
 * Place, Suite 330, Boston, MA 02111-1307 USA
 */
package com.eteks.sweethome3d.io;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

import com.eteks.sweethome3d.model.CatalogPieceOfFurniture;
import com.eteks.sweethome3d.model.Content;
import com.eteks.sweethome3d.model.FurnitureCatalog;
import com.eteks.sweethome3d.model.FurnitureCategory;
import com.eteks.sweethome3d.tools.ResourceURLContent;

/**
 * Furniture default catalog read from localized resources.
 * @author Emmanuel Puybaret
 */
public class DefaultFurnitureCatalog extends FurnitureCatalog {
  private static final String NAME             = "name#";
  private static final String CATEGORY         = "category#";
  private static final String ICON             = "icon#";
  private static final String MODEL            = "model#";
  private static final String WIDTH            = "width#";
  private static final String DEPTH            = "depth#";
  private static final String HEIGHT           = "height#";
  private static final String MOVABLE          = "movable#";
  private static final String DOOR_OR_WINDOW   = "doorOrWindow#";
  private static final String ELEVATION        = "elevation#";
  private static final String MODEL_ROTATION   = "modelRotation#";
  private static final String CREATOR          = "creator#";
  private static final String MULTI_PART_MODEL = "multiPartModel#";
  
  private static final String CONTRIBUTED_FURNITURE_CATALOG_FAMILY = "ContributedFurnitureCatalog";
  private static final String ADDITIONAL_FURNITURE_CATALOG_FAMILY  = "AdditionalFurnitureCatalog";
  
  private static final String PLUGIN_FURNITURE_DIRECTORY = "furniture";
  private static final String PLUGIN_FURNITURE_EXTENSION = ".zip";
  private static final String PLUGIN_FURNITURE_CATALOG_FAMILY = "PluginFurnitureCatalog";
  
  /**
   * Creates a default furniture catalog read from resources.
   */
  public DefaultFurnitureCatalog() {
    readFurniture(ResourceBundle.getBundle(DefaultFurnitureCatalog.class.getName()), null, false);
    
    String classPackage = DefaultFurnitureCatalog.class.getName();
    classPackage = classPackage.substring(0, classPackage.lastIndexOf("."));
    readFurniture(ResourceBundle.getBundle(classPackage + "." + CONTRIBUTED_FURNITURE_CATALOG_FAMILY), null, false);
    
    try {
      // Try do load com.eteks.sweethome3d.io.AdditionalFurnitureCatalog property file from classpath 
      readFurniture(ResourceBundle.getBundle(classPackage + "." + ADDITIONAL_FURNITURE_CATALOG_FAMILY), null, true);
    } catch (MissingResourceException ex) {
      // Ignore additional furniture catalog
    }
    
    try {
      // Try to load zip files from plugin directory
      File furniturePluginDirectory = new File(FileUserPreferences.getApplicationFolder(), PLUGIN_FURNITURE_DIRECTORY);
      File [] furnitureFiles = furniturePluginDirectory.listFiles();
      if (furnitureFiles != null) {
        for (File furnitureFile : furnitureFiles) {
          if (furnitureFile.getName().toLowerCase().endsWith(PLUGIN_FURNITURE_EXTENSION)) {
            try {
              // Try do load Furniture property file from current file  
              readFurniture(ResourceBundle.getBundle(PLUGIN_FURNITURE_CATALOG_FAMILY, Locale.getDefault(), 
                  new URLClassLoader(new URL [] {furnitureFile.toURI().toURL()})), furnitureFile, true);
            } catch (MissingResourceException ex) {
              // Ignore furniture plugin
            }
          }
        }
      }
    } catch (IOException ex) {
      // Ignore furniture plugin 
    }
  }

  /**
   * Reads each piece of furniture described in <code>resource</code> bundle.
   * Resources described in piece properties will be loaded from <code>furnitureFile</code> 
   * if it isn't <code>null</code>. 
   */
  private void readFurniture(ResourceBundle resource, 
                             File furnitureFile,
                             boolean replaceHomonyms) {
    for (int i = 1;; i++) {
      String name = null;
      try {
        name = resource.getString(NAME + i);
      } catch (MissingResourceException ex) {
        // Stop the loop when a key name# doesn't exist
        break;
      }
      String category = resource.getString(CATEGORY + i);
      Content icon  = getContent(resource, ICON + i, furnitureFile, false);
      boolean multiPartModel = false;
      try {
        multiPartModel = Boolean.parseBoolean(resource.getString(MULTI_PART_MODEL + i));
      } catch (MissingResourceException ex) {
        // By default inDirectory is false
      }
      Content model = getContent(resource, MODEL + i, furnitureFile, multiPartModel);
      float width = Float.parseFloat(resource.getString(WIDTH + i));
      float depth = Float.parseFloat(resource.getString(DEPTH + i));
      float height = Float.parseFloat(resource.getString(HEIGHT + i));
      boolean movable = Boolean.parseBoolean(resource.getString(MOVABLE + i));
      boolean doorOrWindow = Boolean.parseBoolean(
          resource.getString(DOOR_OR_WINDOW + i));
      float elevation = 0;
      try {
        elevation = Float.parseFloat(resource.getString(ELEVATION + i));
      } catch (MissingResourceException ex) {
        // By default elevation is null
      }
      float [][] modelRotation = getModelRotation(resource, MODEL_ROTATION + i);
      String creator = "eTeks";
      try {
        creator = resource.getString(CREATOR + i);
      } catch (MissingResourceException ex) {
        // By default creator is eTeks
      }

      FurnitureCategory pieceCategory = new FurnitureCategory(category);
      CatalogPieceOfFurniture piece = new CatalogPieceOfFurniture(name, icon, model,
          width, depth, height, elevation, movable, doorOrWindow, modelRotation, creator);
      try {        
        add(pieceCategory, piece);
      } catch (IllegalArgumentException ex) {
        if (replaceHomonyms) {
          // If a piece with same name and category already exists in furniture catalog
          // replace the existing piece by the new one
          List<FurnitureCategory> categories = getCategories();
          int categoryIndex = Collections.binarySearch(categories, pieceCategory);
          List<CatalogPieceOfFurniture> furniture = categories.get(categoryIndex).getFurniture();
          int existingPieceIndex = Collections.binarySearch(furniture, piece);        
          delete(furniture.get(existingPieceIndex));
          
          add(pieceCategory, piece);
        } else {
          throw ex;
        }
      }
    }
  }
  
  /**
   * Returns a valid content instance from the resource file value of key.
   * @param resource a resource bundle
   * @param key      the key of a resource file
   * @param furnitureFile the file containing the target resource if it's not <code>null</code> 
   * @param multiPartModel if <code>true</code> the resource is a multi part resource stored 
   *                 in a directory with other required resources
   * @throws IllegalArgumentException if the file value doesn't match a valid resource.
   */
  private Content getContent(ResourceBundle resource, 
                             String key, 
                             File furnitureFile, 
                             boolean multiPartModel) {
    String file = resource.getString(key);
    if (furnitureFile == null) {
      return new ResourceURLContent(DefaultFurnitureCatalog.class, file, multiPartModel);
    } else {
      try {
        return new ResourceURLContent(new URL("jar:" + furnitureFile.toURI().toURL() + "!" + file), multiPartModel);
      } catch (MalformedURLException ex) {
        throw new IllegalArgumentException("Invalid URL", ex);
      }
    }
  }
  
  /**
   * Returns model rotation parsed from key value.
   */
  private float [][] getModelRotation(ResourceBundle resource, String key) {
      try {
        String modelRotationString = resource.getString(key);
        String [] values = modelRotationString.split(" ", 9);
        return new float [][] {{Float.parseFloat(values [0]), 
                                Float.parseFloat(values [1]), 
                                Float.parseFloat(values [2])}, 
                               {Float.parseFloat(values [3]), 
                                Float.parseFloat(values [4]), 
                                Float.parseFloat(values [5])}, 
                               {Float.parseFloat(values [6]), 
                                Float.parseFloat(values [7]), 
                                Float.parseFloat(values [8])}};
      } catch (MissingResourceException ex) {
        return null;
      }
  }
}
