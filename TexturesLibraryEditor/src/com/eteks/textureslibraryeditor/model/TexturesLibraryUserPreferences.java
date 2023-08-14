/*
 * TexturesLibraryUserPreferences.java 11 sept 2012
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
package com.eteks.textureslibraryeditor.model;

import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;

import com.eteks.sweethome3d.model.LengthUnit;
import com.eteks.sweethome3d.model.UserPreferences;

/**
 * User preferences with additional attributes for textures libraries management.
 * @author Emmanuel Puybaret
 */
public abstract class TexturesLibraryUserPreferences extends UserPreferences {
  /**
   * The properties of user preferences that may change. <code>PropertyChangeListener</code>s added
   * to user preferences will be notified under a property name equal to the string value of one these properties.
   */
  public enum Property {DEFAULT_CREATOR, OFFLINE_TEXTURES_LIBRARY, TEXTURES_RESOURCES_LOCAL_DIRECTORY,
                        TEXTURES_RESOURCES_REMOTE_URL_BASE, TEXTURES_ID_EDITABLE, CONTENT_MATCHING_TEXTURES_NAME, TEXTURE_NAME_EQUAL_TO_IMPORTED_FILE_NAME}

  private final PropertyChangeSupport propertyChangeSupport;
  private String [] editedProperties;
  private String    defaultCreator;
  private boolean   offlineTexturesLibrary;
  private String    texturesResourcesLocalDirectory;
  private String    texturesResourcesRemoteUrlBase;
  private boolean   texturesIdEditable;
  private boolean   contentMatchingTexturesName;
  private boolean   textureNameEqualToImportedFileName;

  public TexturesLibraryUserPreferences() {
    this.propertyChangeSupport = new PropertyChangeSupport(this);
    this.editedProperties = new String [] {
        TexturesLibrary.TEXTURES_IMAGE_PROPERTY,
        TexturesLibrary.TEXTURES_NAME_PROPERTY,
        TexturesLibrary.TEXTURES_CATEGORY_PROPERTY,
        TexturesLibrary.TEXTURES_CREATOR_PROPERTY,
        TexturesLibrary.TEXTURES_WIDTH_PROPERTY,
        TexturesLibrary.TEXTURES_HEIGHT_PROPERTY};
    setUnit(LengthUnit.CENTIMETER);
    this.offlineTexturesLibrary = true;
    this.contentMatchingTexturesName = true;
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
   * Returns the language used to retrieve the default localized values of the textures.
   */
  public String getTexturesDefaultLanguage() {
    return getLanguage();
  }

  /**
   * Returns the list of properties that the user may display and edit with the editor.
   */
  public String [] getEditedProperties() {
    return this.editedProperties;
  }

  /**
   * Returns the creator used by default for imported textures or <code>null</code>.
   */
  public String getDefaultCreator() {
    return this.defaultCreator;
  }

  /**
   * Sets the creator used by default for imported textures.
   */
  public void setDefaultCreator(String defaultCreator) {
    if (defaultCreator != this.defaultCreator
        || defaultCreator != null && !defaultCreator.equals(this.defaultCreator)) {
      String oldDefaultCreator = this.defaultCreator;
      this.defaultCreator = defaultCreator;
      this.propertyChangeSupport.firePropertyChange(Property.DEFAULT_CREATOR.name(), oldDefaultCreator, defaultCreator);
    }
  }

  /**
   * Returns <code>true</code> if the user may edit online libraries,
   * and sets textures resources local directory and remote URL base.
   */
  public boolean isOnlineTexturesLibrarySupported() {
    return false;
  }

  /**
   * Returns <code>true</code> if resources needed by the textures of a library
   * must be included with the library to let it work without connection.
   */
  public boolean isTexturesLibraryOffline() {
    return this.offlineTexturesLibrary;
  }

  /**
   * Sets whether resources needed by the textures of a library
   * must be included with the library to let it work without connection or not.
   */
  public void setTexturesLibraryOffline(boolean offlineTexturesLibrary) {
    if (!isOnlineTexturesLibrarySupported() && !offlineTexturesLibrary) {
      throw new IllegalArgumentException("Textures library doesn't support online libraries");
    }
    if (offlineTexturesLibrary != this.offlineTexturesLibrary) {
      this.offlineTexturesLibrary = offlineTexturesLibrary;
      this.propertyChangeSupport.firePropertyChange(Property.OFFLINE_TEXTURES_LIBRARY.name(),
          !offlineTexturesLibrary, offlineTexturesLibrary);
    }
  }

  /**
   * Returns the local directory where resources needed by the textures of a library
   * will be saved before being deployed on server.
   */
  public String getTexturesResourcesLocalDirectory() {
    return this.texturesResourcesLocalDirectory;
  }

  /**
   * Sets the local directory where resources needed by the textures of a library
   * will be saved before being deployed on server.
   */
  public void setTexturesResourcesLocalDirectory(String texturesResourcesLocalDirectory) {
    if (!isOnlineTexturesLibrarySupported()) {
      throw new IllegalArgumentException("Textures library doesn't support online libraries");
    }
    if (texturesResourcesLocalDirectory != this.texturesResourcesLocalDirectory
        || texturesResourcesLocalDirectory != null && !texturesResourcesLocalDirectory.equals(this.texturesResourcesLocalDirectory)) {
      String oldValue = this.texturesResourcesLocalDirectory;
      this.texturesResourcesLocalDirectory = texturesResourcesLocalDirectory;
      this.propertyChangeSupport.firePropertyChange(Property.TEXTURES_RESOURCES_LOCAL_DIRECTORY.name(),
          oldValue, texturesResourcesLocalDirectory);
    }
  }

  /**
   * Returns the URL base (relative or absolute) used to build the path to resources
   * needed by the textures of a library.
   */
  public String getTexturesResourcesRemoteURLBase() {
    return this.texturesResourcesRemoteUrlBase;
  }

  /**
   * Sets the URL base (relative or absolute) used to build the path to resources
   * needed by the textures of a library. This base should be ended by a / character
   * if it's a directory.
   */
  public void setTexturesResourcesRemoteURLBase(String texturesResourcesRemoteUrlBase) {
    if (!isOnlineTexturesLibrarySupported()) {
      throw new IllegalArgumentException("Textures library doesn't support online libraries");
    }
    if (texturesResourcesRemoteUrlBase != this.texturesResourcesRemoteUrlBase
        || texturesResourcesRemoteUrlBase != null && !texturesResourcesRemoteUrlBase.equals(this.texturesResourcesRemoteUrlBase)) {
      Object oldValue = this.texturesResourcesRemoteUrlBase;
      this.texturesResourcesRemoteUrlBase = texturesResourcesRemoteUrlBase;
      this.propertyChangeSupport.firePropertyChange(Property.TEXTURES_RESOURCES_REMOTE_URL_BASE.name(),
          oldValue, texturesResourcesRemoteUrlBase);
    }
  }

  /**
   * Returns <code>true</code> if texture ids are editable.
   */
  public boolean isTexturesIdEditable() {
    return this.texturesIdEditable;
  }

  /**
   * Sets whether texture ids are editable.
   */
  public void setTexturesIdEditable(boolean texturesIdEditable) {
    if (texturesIdEditable != this.texturesIdEditable) {
      this.texturesIdEditable = texturesIdEditable;
      this.propertyChangeSupport.firePropertyChange(Property.TEXTURES_ID_EDITABLE.name(), !texturesIdEditable, texturesIdEditable);
    }
  }

  /**
   * Returns <code>true</code> if the texture content saved with the library should be named
   * from the textures name in the default language.
   */
  public boolean isContentMatchingTexturesName() {
    return this.contentMatchingTexturesName;
  }

  /**
   * Sets whether the texture content saved with the library should be named
   * from the textures name in the default language.
   */
  public void setContentMatchingTexturesName(boolean contentMatchingTexturesName) {
    if (contentMatchingTexturesName != this.contentMatchingTexturesName) {
      this.contentMatchingTexturesName = contentMatchingTexturesName;
      this.propertyChangeSupport.firePropertyChange(Property.CONTENT_MATCHING_TEXTURES_NAME.name(), !contentMatchingTexturesName, contentMatchingTexturesName);
    }
  }

  /**
   * Returns <code>true</code> if the texture name of an imported image be equal
   * to the imported file name.
   */
  public boolean isTextureNameEqualToImportedFileName() {
    return this.textureNameEqualToImportedFileName;
  }

  /**
   * Sets if the texture name of an imported image be equal
   * to the imported file name.
   */
  public void setTextureNameEqualToImportedFileName(boolean textureNameEqualToImportedFileName) {
    if (textureNameEqualToImportedFileName != this.textureNameEqualToImportedFileName) {
      this.textureNameEqualToImportedFileName = textureNameEqualToImportedFileName;
      this.propertyChangeSupport.firePropertyChange(Property.TEXTURE_NAME_EQUAL_TO_IMPORTED_FILE_NAME.name(),
          !textureNameEqualToImportedFileName, textureNameEqualToImportedFileName);
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
