/*
 * FileFurnitureLibraryUserPreferences.java 6 juin 2010
 *
 * Furniture Library Editor, Copyright (c) 2010 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
package com.eteks.furniturelibraryeditor.io;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.prefs.BackingStoreException;
import java.util.prefs.Preferences;

import com.eteks.furniturelibraryeditor.model.FurnitureLibraryUserPreferences;
import com.eteks.furniturelibraryeditor.model.FurnitureProperty;
import com.eteks.sweethome3d.model.ObjectProperty;
import com.eteks.sweethome3d.model.LengthUnit;
import com.eteks.sweethome3d.model.Library;
import com.eteks.sweethome3d.model.RecorderException;

/**
 * Editor user preferences stored in file.
 * @author Emmanuel Puybaret
 */
public class FileFurnitureLibraryUserPreferences extends FurnitureLibraryUserPreferences {
  private static final String LANGUAGE                              = "language";
  private static final String UNIT                                  = "unit";
  private static final String DEFAULT_CREATOR                       = "defaultCreator";
  private static final String OFFLINE_FURNITURE_LIBRARY             = "offlineFurnitureLibrary";
  private static final String FURNITURE_RESOURCES_LOCAL_DIRECTORY   = "furnitureResourcesLocalDirectory";
  private static final String FURNITURE_RESOURCES_REMOTE_URL_BASE   = "furnitureResourcesRemoteUrlBase";
  private static final String FURNITURE_ID_EDITABLE                 = "furnitureIdEditable";
  private static final String CONTENT_MATCHING_FURNITURE_NAME       = "contentMatchingFurnitureName";
  private static final String FURNITURE_NAME_EQUAL_TO_IMPORTED_MODEL_FILE_NAME = "furnitureNameEqualToImportedModelFileName";

  private static final String FURNITURE_PROPERTY_NAME               = "furniturePropertyName#";
  private static final String FURNITURE_PROPERTY_TYPE               = "furniturePropertyType#";
  private static final String FURNITURE_PROPERTY_MODIFIABLE         = "furniturePropertyModifiable#";
  private static final String FURNITURE_PROPERTY_DISPLAYED          = "furniturePropertyDisplayed#";

  /**
   * Creates user preferences read from Java preferences.
   */
  public FileFurnitureLibraryUserPreferences() {
    Preferences preferences = getPreferences();
    setLanguage(preferences.get(LANGUAGE, getLanguage()));
    setUnit(LengthUnit.valueOf(preferences.get(UNIT, getLengthUnit().name())));
    setDefaultCreator(preferences.get(DEFAULT_CREATOR, getDefaultCreator()));
    boolean offlineFurnitureLibrary = preferences.getBoolean(OFFLINE_FURNITURE_LIBRARY, isFurnitureLibraryOffline());
    if (isOnlineFurnitureLibrarySupported()) {
      setFurnitureLibraryOffline(offlineFurnitureLibrary);
      setFurnitureResourcesLocalDirectory(preferences.get(FURNITURE_RESOURCES_LOCAL_DIRECTORY,
          getFurnitureResourcesLocalDirectory()));
      setFurnitureResourcesRemoteURLBase(preferences.get(FURNITURE_RESOURCES_REMOTE_URL_BASE,
          getFurnitureResourcesRemoteURLBase()));
    }
    setFurnitureIdEditable(preferences.getBoolean(FURNITURE_ID_EDITABLE, isFurnitureIdEditable()));
    setContentMatchingFurnitureName(preferences.getBoolean(CONTENT_MATCHING_FURNITURE_NAME, isContentMatchingFurnitureName()));
    setFurnitureNameEqualToImportedModelFileName(preferences.getBoolean(FURNITURE_NAME_EQUAL_TO_IMPORTED_MODEL_FILE_NAME,
        isFurnitureNameEqualToImportedModelFileName()));

    // Read furniture properties
    FurnitureProperty [] defaultProperties = getFurnitureProperties();
    List<FurnitureProperty> furnitureProperties = new ArrayList<FurnitureProperty>(Arrays.asList(defaultProperties));
    for (int i = 1; true; i++) {
      String name = preferences.get(FURNITURE_PROPERTY_NAME + i, null);
      if (name == null) {
        break; // Last property
      }
      int j = 0;
      for ( ; j < defaultProperties.length; j++) {
        FurnitureProperty property = defaultProperties [j];
        if (name.equals(property.getName())) {
          property = property.deriveModifiableProperty(preferences.getBoolean(FURNITURE_PROPERTY_MODIFIABLE + i, false))
              .deriveDisplayedProperty(preferences.getBoolean(FURNITURE_PROPERTY_DISPLAYED + i, false));
          furnitureProperties.set(j, property);
          break;
        }
      }
      if (j == defaultProperties.length) {
        // Not a default property
        String type = preferences.get(FURNITURE_PROPERTY_TYPE + i, null);
        FurnitureProperty.Type propertyType;
        try {
          propertyType = type != null ? FurnitureProperty.Type.valueOf(type) : null;
        } catch (IllegalArgumentException e) {
          propertyType = null;
        }
        furnitureProperties.add(new FurnitureProperty(name, propertyType)
            .deriveModifiableProperty(preferences.getBoolean(FURNITURE_PROPERTY_MODIFIABLE + i, true))
            .deriveDisplayedProperty(preferences.getBoolean(FURNITURE_PROPERTY_DISPLAYED + i, true)));
      }
    }
    setFurnitureProperties(furnitureProperties.toArray(new FurnitureProperty [furnitureProperties.size()]));
  }

  @Override
  public void write() throws RecorderException {
    Preferences preferences = getPreferences();
    preferences.put(LANGUAGE, getLanguage());
    preferences.put(UNIT, getLengthUnit().name());
    if (getDefaultCreator() != null) {
      preferences.put(DEFAULT_CREATOR, getDefaultCreator());
    } else {
      preferences.remove(DEFAULT_CREATOR);
    }
    preferences.putBoolean(OFFLINE_FURNITURE_LIBRARY, isFurnitureLibraryOffline());
    if (getFurnitureResourcesLocalDirectory() != null) {
      preferences.put(FURNITURE_RESOURCES_LOCAL_DIRECTORY, getFurnitureResourcesLocalDirectory());
    } else {
      preferences.remove(FURNITURE_RESOURCES_LOCAL_DIRECTORY);
    }
    if (getFurnitureResourcesRemoteURLBase() != null) {
      preferences.put(FURNITURE_RESOURCES_REMOTE_URL_BASE, getFurnitureResourcesRemoteURLBase());
    } else {
      preferences.remove(FURNITURE_RESOURCES_REMOTE_URL_BASE);
    }
    preferences.putBoolean(FURNITURE_ID_EDITABLE, isFurnitureIdEditable());
    preferences.putBoolean(CONTENT_MATCHING_FURNITURE_NAME, isContentMatchingFurnitureName());
    preferences.putBoolean(FURNITURE_NAME_EQUAL_TO_IMPORTED_MODEL_FILE_NAME, isFurnitureNameEqualToImportedModelFileName());

    FurnitureProperty [] furnitureProperties = getFurnitureProperties();
    int i = 1;
    for ( ; i <= furnitureProperties.length; i++) {
      FurnitureProperty property = furnitureProperties [i - 1];
      preferences.put(FURNITURE_PROPERTY_NAME + i, property.getName());
      if (property.getDefaultPropertyKeyName() == null) {
        if (property.getType() != null
            && property.getType() != ObjectProperty.Type.ANY) {
          preferences.put(FURNITURE_PROPERTY_TYPE + i, property.getType().name());
        } else {
          preferences.remove(FURNITURE_PROPERTY_TYPE + i);
        }
      }
      preferences.putBoolean(FURNITURE_PROPERTY_MODIFIABLE + i, property.isModifiable());
      preferences.putBoolean(FURNITURE_PROPERTY_DISPLAYED + i, property.isDisplayed());
    }
    // Remove obsolete keys
    for ( ; preferences.get(FURNITURE_PROPERTY_NAME + i, null) != null; i++) {
      preferences.remove(FURNITURE_PROPERTY_NAME + i);
      preferences.remove(FURNITURE_PROPERTY_TYPE + i);
      preferences.remove(FURNITURE_PROPERTY_MODIFIABLE + i);
      preferences.remove(FURNITURE_PROPERTY_DISPLAYED + i);
    }

    try {
      // Write preferences
      preferences.sync();
    } catch (BackingStoreException ex) {
      throw new RecorderException("Couldn't write preferences", ex);
    }
  }

  /**
   * Returns Java preferences for current system user.
   */
  protected Preferences getPreferences() {
    return Preferences.userNodeForPackage(FileFurnitureLibraryUserPreferences.class);
  }

  @Override
  public void addFurnitureLibrary(String furnitureLibraryName) throws RecorderException {
    throw new UnsupportedOperationException();
  }

  @Override
  public void addLanguageLibrary(String languageLibraryName) throws RecorderException {
    throw new UnsupportedOperationException();
  }

  @Override
  public void addTexturesLibrary(String texturesLibraryName) throws RecorderException {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean furnitureLibraryExists(String furnitureLibraryName) throws RecorderException {
    return new File(furnitureLibraryName).exists();
  }

  @Override
  public boolean languageLibraryExists(String languageLibraryName) throws RecorderException {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean texturesLibraryExists(String texturesLibraryName) throws RecorderException {
    throw new UnsupportedOperationException();
  }

  @Override
  public List<Library> getLibraries() {
    throw new UnsupportedOperationException();
  }
}
