/*
 * FurnitureLibraryUserPreferences.java 6 juin 2010
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
package com.eteks.furniturelibraryeditor.model;

import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.eteks.sweethome3d.io.DefaultFurnitureCatalog;
import com.eteks.sweethome3d.model.LengthUnit;
import com.eteks.sweethome3d.model.UserPreferences;

/**
 * User preferences with additional attributes for furniture libraries management.
 * @author Emmanuel Puybaret
 */
public abstract class FurnitureLibraryUserPreferences extends UserPreferences {
  /**
   * The properties of user preferences that may change. <code>PropertyChangeListener</code>s added
   * to user preferences will be notified under a property name equal to the string value of one these properties.
   */
  public enum Property {FURNITURE_PROPERTIES, DEFAULT_CREATOR, OFFLINE_FURNITURE_LIBRARY, FURNITURE_RESOURCES_LOCAL_DIRECTORY,
                        FURNITURE_RESOURCES_REMOTE_URL_BASE, FURNITURE_ID_EDITABLE, CONTENT_MATCHING_FURNITURE_NAME, FURNITURE_NAME_EQUAL_TO_IMPORTED_MODEL_FILE_NAME}

  private final PropertyChangeSupport propertyChangeSupport;
  private String []                   editedProperties;
  private FurnitureProperty []        furnitureProperties;
  private String                      defaultCreator;
  private boolean                     offlineFurnitureLibrary;
  private String                      furnitureResourcesLocalDirectory;
  private String                      furnitureResourcesRemoteUrlBase;
  private boolean                     furnitureIdEditable;
  private boolean                     contentMatchingFurnitureName;
  private boolean                     furnitureNameEqualToImportedModelFileName;

  public FurnitureLibraryUserPreferences() {
    this.propertyChangeSupport = new PropertyChangeSupport(this);
    this.editedProperties = new String [] {
        FurnitureLibrary.FURNITURE_MODEL_PROPERTY,
        FurnitureLibrary.FURNITURE_ICON_PROPERTY,
        FurnitureLibrary.FURNITURE_NAME_PROPERTY,
        FurnitureLibrary.FURNITURE_TAGS_PROPERTY,
        FurnitureLibrary.FURNITURE_CATEGORY_PROPERTY,
        FurnitureLibrary.FURNITURE_CREATOR_PROPERTY,
        FurnitureLibrary.FURNITURE_WIDTH_PROPERTY,
        FurnitureLibrary.FURNITURE_DEPTH_PROPERTY,
        FurnitureLibrary.FURNITURE_HEIGHT_PROPERTY,
        FurnitureLibrary.FURNITURE_ELEVATION_PROPERTY,
        FurnitureLibrary.FURNITURE_MOVABLE_PROPERTY,
        FurnitureLibrary.FURNITURE_DOOR_OR_WINDOW_PROPERTY,
        FurnitureLibrary.FURNITURE_DOOR_OR_WINDOW_CUT_OUT_SHAPE_PROPERTY,
        FurnitureLibrary.FURNITURE_STAIRCASE_CUT_OUT_SHAPE_PROPERTY,
        FurnitureLibrary.FURNITURE_MODEL_ROTATION_PROPERTY};
    setUnit(LengthUnit.CENTIMETER);
    this.offlineFurnitureLibrary = true;
    this.contentMatchingFurnitureName = true;
  }

  @Override
  public String [] getSupportedLanguages() {
    return new String [] {"en", "fr"};
  }

  /**
   * Adds the property change <code>listener</code> in parameter to these preferences.
   */
  public void addPropertyChangeListener(PropertyChangeListener listener) {
    super.addPropertyChangeListener(listener);
    this.propertyChangeSupport.addPropertyChangeListener(listener);
  }

  /**
   * Removes the property change <code>listener</code> in parameter from these preferences.
   */
  public void removePropertyChangeListener(PropertyChangeListener listener) {
    this.propertyChangeSupport.removePropertyChangeListener(listener);
    super.removePropertyChangeListener(listener);
  }

  /**
   * Adds the <code>listener</code> in parameter to these preferences to listen
   * to the changes of the given <code>property</code>.
   * <br>Caution: a user preferences instance generally exists during all the application ;
   * therefore you should take care of not bounding permanently listeners to this
   * object (for example, do not create anonymous listeners on user preferences
   * in classes depending on an edited home).
   */
  public void addPropertyChangeListener(Property property,
                                        PropertyChangeListener listener) {
    this.propertyChangeSupport.addPropertyChangeListener(property.name(), listener);
  }

  /**
   * Removes the <code>listener</code> in parameter from these preferences.
   */
  public void removePropertyChangeListener(Property property,
                                           PropertyChangeListener listener) {
    this.propertyChangeSupport.removePropertyChangeListener(property.name(), listener);
  }

  /**
   * Returns the language used to retrieve the default localized values of the furniture.
   */
  public String getFurnitureDefaultLanguage() {
    return getLanguage();
  }

  /**
   * Returns the default list of Sweet Home 3D properties that the user may display and edit with the editor.
   */
  public String [] getEditedProperties() {
    return this.editedProperties;
  }

  /**
   * Returns the available furniture properties.
   */
  public FurnitureProperty [] getFurnitureProperties() {
    if (this.furnitureProperties == null) {
      // Build furniture properties list on the fly from edited properties
      List<FurnitureProperty> furnitureProperties = new ArrayList<FurnitureProperty>();
      String [] modifiableProperties = getEditedProperties().clone();
      Arrays.sort(modifiableProperties);

      // Default properties listed in the order they should appear in furniture table
      DefaultFurnitureCatalog.PropertyKey [] defaultProperties = {
          DefaultFurnitureCatalog.PropertyKey.ID,
          DefaultFurnitureCatalog.PropertyKey.ICON,
          DefaultFurnitureCatalog.PropertyKey.PLAN_ICON,
          DefaultFurnitureCatalog.PropertyKey.MODEL,
          DefaultFurnitureCatalog.PropertyKey.NAME,
          DefaultFurnitureCatalog.PropertyKey.DESCRIPTION,
          DefaultFurnitureCatalog.PropertyKey.INFORMATION,
          DefaultFurnitureCatalog.PropertyKey.TAGS,
          DefaultFurnitureCatalog.PropertyKey.CATEGORY,
          DefaultFurnitureCatalog.PropertyKey.CREATOR,
          DefaultFurnitureCatalog.PropertyKey.LICENSE,
          DefaultFurnitureCatalog.PropertyKey.CREATION_DATE,
          DefaultFurnitureCatalog.PropertyKey.MODEL_SIZE,
          DefaultFurnitureCatalog.PropertyKey.MODEL_ROTATION,
          DefaultFurnitureCatalog.PropertyKey.MODEL_FLAGS,
          DefaultFurnitureCatalog.PropertyKey.HORIZONTALLY_ROTATABLE,
          DefaultFurnitureCatalog.PropertyKey.GRADE,
          DefaultFurnitureCatalog.PropertyKey.WIDTH,
          DefaultFurnitureCatalog.PropertyKey.DEPTH,
          DefaultFurnitureCatalog.PropertyKey.HEIGHT,
          DefaultFurnitureCatalog.PropertyKey.ELEVATION,
          DefaultFurnitureCatalog.PropertyKey.DROP_ON_TOP_ELEVATION,
          DefaultFurnitureCatalog.PropertyKey.MOVABLE,
          DefaultFurnitureCatalog.PropertyKey.RESIZABLE,
          DefaultFurnitureCatalog.PropertyKey.DEFORMABLE,
          DefaultFurnitureCatalog.PropertyKey.TEXTURABLE,
          DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW,
          DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_CUT_OUT_SHAPE,
          DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_WALL_THICKNESS,
          DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_WALL_DISTANCE,
          DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_WALL_CUT_OUT_ON_BOTH_SIDES,
          DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_WIDTH_DEPTH_DEFORMABLE,
          DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_X_AXIS,
          DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_Y_AXIS,
          DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_WIDTH,
          DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_START_ANGLE,
          DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_END_ANGLE,
          DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_X,
          DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_Y,
          DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_Z,
          DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_COLOR,
          DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_DIAMETER,
          DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_MATERIAL_NAME,
          DefaultFurnitureCatalog.PropertyKey.SHELF_ELEVATIONS,
          DefaultFurnitureCatalog.PropertyKey.SHELF_BOXES,
          DefaultFurnitureCatalog.PropertyKey.STAIRCASE_CUT_OUT_SHAPE,
          DefaultFurnitureCatalog.PropertyKey.PRICE,
          DefaultFurnitureCatalog.PropertyKey.CURRENCY,
          DefaultFurnitureCatalog.PropertyKey.VALUE_ADDED_TAX_PERCENTAGE,
          // Ignored properties
          // DefaultFurnitureCatalog.PropertyKey.MULTI_PART_MODEL,
          // DefaultFurnitureCatalog.PropertyKey.ICON_DIGEST,
          // DefaultFurnitureCatalog.PropertyKey.PLAN_ICON_DIGEST,
          // DefaultFurnitureCatalog.PropertyKey.MODEL_DIGEST,
        };

      for (DefaultFurnitureCatalog.PropertyKey defaultProperty : defaultProperties) {
        FurnitureProperty.Type type;
        switch (defaultProperty) {
          case ICON:
          case PLAN_ICON:
          case MODEL:
            type = FurnitureProperty.Type.CONTENT;
            break;
          case CREATION_DATE:
            type = FurnitureProperty.Type.DATE;
          case MOVABLE:
          case DOOR_OR_WINDOW:
          case RESIZABLE:
          case DEFORMABLE:
          case TEXTURABLE:
          case HORIZONTALLY_ROTATABLE:
          case DOOR_OR_WINDOW_WALL_CUT_OUT_ON_BOTH_SIDES:
          case DOOR_OR_WINDOW_WIDTH_DEPTH_DEFORMABLE:
            type = FurnitureProperty.Type.BOOLEAN;
            break;
          case MODEL_FLAGS:
          case MODEL_SIZE:
            type = FurnitureProperty.Type.INTEGER;
            break;
          case GRADE:
            type = FurnitureProperty.Type.NUMBER;
            break;
          case PRICE:
            type = FurnitureProperty.Type.PRICE;
            break;
          case VALUE_ADDED_TAX_PERCENTAGE:
            type = FurnitureProperty.Type.PERCENTAGE;
            break;
          case WIDTH:
          case DEPTH:
          case HEIGHT:
          case ELEVATION:
          case DROP_ON_TOP_ELEVATION:
          case DOOR_OR_WINDOW_WALL_THICKNESS:
          case DOOR_OR_WINDOW_WALL_DISTANCE:
            type = FurnitureProperty.Type.LENGTH;
            break;
          default:
            type = FurnitureProperty.Type.STRING;
            break;
        }

        boolean editable;
        switch (defaultProperty) {
          case ID:
            editable = isFurnitureIdEditable();
            break;
          case MODEL_SIZE:
            editable = false;
            break;
          default:
            editable = true;
            break;
        }

        boolean displayable;
        switch (defaultProperty) {
          case ICON_DIGEST:
          case PLAN_ICON_DIGEST:
          case MODEL_DIGEST:
          case HORIZONTALLY_ROTATABLE:
          case MODEL_ROTATION:
          case MODEL:
          case DROP_ON_TOP_ELEVATION:
          case DOOR_OR_WINDOW_CUT_OUT_SHAPE:
          case DOOR_OR_WINDOW_WALL_THICKNESS:
          case DOOR_OR_WINDOW_WALL_DISTANCE:
          case DOOR_OR_WINDOW_WALL_CUT_OUT_ON_BOTH_SIDES:
          case DOOR_OR_WINDOW_WIDTH_DEPTH_DEFORMABLE:
          case DOOR_OR_WINDOW_SASH_X_AXIS:
          case DOOR_OR_WINDOW_SASH_Y_AXIS:
          case DOOR_OR_WINDOW_SASH_WIDTH:
          case DOOR_OR_WINDOW_SASH_START_ANGLE:
          case DOOR_OR_WINDOW_SASH_END_ANGLE:
          case LIGHT_SOURCE_X:
          case LIGHT_SOURCE_Y:
          case LIGHT_SOURCE_Z:
          case LIGHT_SOURCE_DIAMETER:
          case LIGHT_SOURCE_COLOR:
          case LIGHT_SOURCE_MATERIAL_NAME:
          case SHELF_ELEVATIONS:
          case SHELF_BOXES:
            displayable = false;
            break;
          default:
            displayable = true;
            break;
        }

        boolean modifiable = Arrays.binarySearch(modifiableProperties, defaultProperty.name()) >= 0
            || (defaultProperty == DefaultFurnitureCatalog.PropertyKey.ID && isFurnitureIdEditable());
        // Icon is modifiable only once the user made it modifiable
        furnitureProperties.add(new FurnitureProperty(
            defaultProperty.getKeyPrefix(), type, defaultProperty.name(),
            displayable, modifiable && displayable || defaultProperty == DefaultFurnitureCatalog.PropertyKey.ICON,
            editable, modifiable && defaultProperty != DefaultFurnitureCatalog.PropertyKey.ICON));
      }
      this.furnitureProperties = furnitureProperties.toArray(new FurnitureProperty [furnitureProperties.size()]);
    }
    return this.furnitureProperties.clone();
  }

  /**
   * Sets the available furniture properties.
   */
  public void setFurnitureProperties(FurnitureProperty [] furnitureProperties) {
    if (furnitureProperties != this.furnitureProperties) {
      FurnitureProperty [] oldFurnitureProperties = this.furnitureProperties;
      Boolean furnitureIdEditableNewValue = null;
      for (int i = 0; i < furnitureProperties.length; i++) {
        FurnitureProperty property = furnitureProperties [i];
        if (DefaultFurnitureCatalog.PropertyKey.ID.name().equals(property.getDefaultPropertyKeyName())
            && furnitureProperties [i].isEditable() != furnitureProperties [i].isEditable()) {
          furnitureIdEditableNewValue = furnitureProperties [i].isEditable();
          break;
        }
      }
      this.furnitureProperties = furnitureProperties.clone();
      this.propertyChangeSupport.firePropertyChange(Property.FURNITURE_PROPERTIES.name(), oldFurnitureProperties, furnitureProperties);
      if (furnitureIdEditableNewValue != null) {
        setFurnitureIdEditable(furnitureIdEditableNewValue, false);
      }
    }
  }

  /**
   * Returns <code>true</code> if model content should always converted to OBJ format
   * at importation time.
   */
  public boolean isModelContentAlwaysConvertedToOBJFormat() {
    return false;
  }

  /**
   * Returns the creator used by default for imported furniture or <code>null</code>.
   */
  public String getDefaultCreator() {
    return this.defaultCreator;
  }

  /**
   * Sets the creator used by default for imported furniture.
   */
  public void setDefaultCreator(String defaultCreator) {
    if (defaultCreator != this.defaultCreator
        && (defaultCreator == null || !defaultCreator.equals(this.defaultCreator))) {
      String oldDefaultCreator = this.defaultCreator;
      this.defaultCreator = defaultCreator;
      this.propertyChangeSupport.firePropertyChange(Property.DEFAULT_CREATOR.name(), oldDefaultCreator, defaultCreator);
    }
  }

  /**
   * Returns <code>true</code> if the user may edit online libraries,
   * and sets furniture resources local directory and remote URL base.
   */
  public boolean isOnlineFurnitureLibrarySupported() {
    return false;
  }

  /**
   * Returns <code>true</code> if resources needed by the furniture of a library
   * must be included with the library to let it work without connection.
   */
  public boolean isFurnitureLibraryOffline() {
    return this.offlineFurnitureLibrary;
  }

  /**
   * Sets whether resources needed by the furniture of a library
   * must be included with the library to let it work without connection or not.
   */
  public void setFurnitureLibraryOffline(boolean offlineFurnitureLibrary) {
    if (!isOnlineFurnitureLibrarySupported() && !offlineFurnitureLibrary) {
      throw new IllegalArgumentException("Furniture library doesn't support online libraries");
    }
    if (offlineFurnitureLibrary != this.offlineFurnitureLibrary) {
      this.offlineFurnitureLibrary = offlineFurnitureLibrary;
      this.propertyChangeSupport.firePropertyChange(Property.OFFLINE_FURNITURE_LIBRARY.name(),
          !offlineFurnitureLibrary, offlineFurnitureLibrary);
    }
  }

  /**
   * Returns the local directory where resources needed by the furniture of a library
   * will be saved before being deployed on server.
   */
  public String getFurnitureResourcesLocalDirectory() {
    return this.furnitureResourcesLocalDirectory;
  }

  /**
   * Sets the local directory where resources needed by the furniture of a library
   * will be saved before being deployed on server.
   */
  public void setFurnitureResourcesLocalDirectory(String furnitureResourcesLocalDirectory) {
    if (!isOnlineFurnitureLibrarySupported()) {
      throw new IllegalArgumentException("Furniture library doesn't support online libraries");
    }
    if (furnitureResourcesLocalDirectory != this.furnitureResourcesLocalDirectory
        && (furnitureResourcesLocalDirectory == null || !furnitureResourcesLocalDirectory.equals(this.furnitureResourcesLocalDirectory))) {
      String oldValue = this.furnitureResourcesLocalDirectory;
      this.furnitureResourcesLocalDirectory = furnitureResourcesLocalDirectory;
      this.propertyChangeSupport.firePropertyChange(Property.FURNITURE_RESOURCES_LOCAL_DIRECTORY.name(),
          oldValue, furnitureResourcesLocalDirectory);
    }
  }

  /**
   * Returns the URL base (relative or absolute) used to build the path to resources
   * needed by the furniture of a library.
   */
  public String getFurnitureResourcesRemoteURLBase() {
    return this.furnitureResourcesRemoteUrlBase;
  }

  /**
   * Sets the URL base (relative or absolute) used to build the path to resources
   * needed by the furniture of a library. This base should be ended by a / character
   * if it's a directory.
   */
  public void setFurnitureResourcesRemoteURLBase(String furnitureResourcesRemoteUrlBase) {
    if (!isOnlineFurnitureLibrarySupported()) {
      throw new IllegalArgumentException("Furniture library doesn't support online libraries");
    }
    if (furnitureResourcesRemoteUrlBase != this.furnitureResourcesRemoteUrlBase
        && (furnitureResourcesRemoteUrlBase == null || !furnitureResourcesRemoteUrlBase.equals(this.furnitureResourcesRemoteUrlBase))) {
      Object oldValue = this.furnitureResourcesRemoteUrlBase;
      this.furnitureResourcesRemoteUrlBase = furnitureResourcesRemoteUrlBase;
      this.propertyChangeSupport.firePropertyChange(Property.FURNITURE_RESOURCES_REMOTE_URL_BASE.name(),
          oldValue, furnitureResourcesRemoteUrlBase);
    }
  }

  /**
   * Returns <code>true</code> if furniture ids is editable.
   */
  public boolean isFurnitureIdEditable() {
    return this.furnitureIdEditable;
  }

  /**
   * Sets whether furniture ids is editable.
   */
  public void setFurnitureIdEditable(boolean furnitureIdEditable) {
    setFurnitureIdEditable(furnitureIdEditable, true);
  }

  private void setFurnitureIdEditable(boolean furnitureIdEditable, boolean updateFurnitureProperty) {
    if (furnitureIdEditable != this.furnitureIdEditable) {
      this.furnitureIdEditable = furnitureIdEditable;
      // Update duplicated information in furnitureProperties
      FurnitureProperty [] furnitureProperties = getFurnitureProperties();
      for (int i = 0; i < furnitureProperties.length; i++) {
        FurnitureProperty property = furnitureProperties [i];
        if (DefaultFurnitureCatalog.PropertyKey.ID.name().equals(property.getDefaultPropertyKeyName())) {
          furnitureProperties [i] = new FurnitureProperty(property.getName(), property.getType(), property.getDefaultPropertyKeyName(),
              property.isDisplayed(), property.isDisplayable(), furnitureIdEditable, furnitureIdEditable);
        }
      }
      setFurnitureProperties(furnitureProperties);
      this.propertyChangeSupport.firePropertyChange(Property.FURNITURE_ID_EDITABLE.name(), !furnitureIdEditable, furnitureIdEditable);
    }
  }

  /**
   * Returns <code>true</code> if the furniture content saved with the library should be named
   * from the furniture name in the default language.
   */
  public boolean isContentMatchingFurnitureName() {
    return this.contentMatchingFurnitureName;
  }

  /**
   * Sets whether the furniture content saved with the library should be named
   * from the furniture name in the default language.
   */
  public void setContentMatchingFurnitureName(boolean contentMatchingFurnitureName) {
    if (contentMatchingFurnitureName != this.contentMatchingFurnitureName) {
      this.contentMatchingFurnitureName = contentMatchingFurnitureName;
      this.propertyChangeSupport.firePropertyChange(Property.CONTENT_MATCHING_FURNITURE_NAME.name(), !contentMatchingFurnitureName, contentMatchingFurnitureName);
    }
  }

  /**
   * Returns <code>true</code> if the furniture name of an imported model be equal
   * to the imported file name.
   */
  public boolean isFurnitureNameEqualToImportedModelFileName() {
    return this.furnitureNameEqualToImportedModelFileName;
  }

  /**
   * Sets if the furniture name of an imported model be equal
   * to the imported file name.
   */
  public void setFurnitureNameEqualToImportedModelFileName(boolean furnitureNameEqualToImportedModelFileName) {
    if (furnitureNameEqualToImportedModelFileName != this.furnitureNameEqualToImportedModelFileName) {
      this.furnitureNameEqualToImportedModelFileName = furnitureNameEqualToImportedModelFileName;
      this.propertyChangeSupport.firePropertyChange(Property.FURNITURE_NAME_EQUAL_TO_IMPORTED_MODEL_FILE_NAME.name(),
          !furnitureNameEqualToImportedModelFileName, furnitureNameEqualToImportedModelFileName);
    }
  }

  /**
   * Returns <code>false</code>.
   */
  @Override
  public boolean isCheckUpdatesEnabled() {
    return false;
  }
}
