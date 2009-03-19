/*
 * UserPreferences.java 15 mai 2006
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
package com.eteks.sweethome3d.model;

import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

import com.eteks.sweethome3d.tools.OperatingSystem;

/**
 * User preferences.
 * @author Emmanuel Puybaret
 */
public abstract class UserPreferences {
  /**
   * The properties of user preferences that may change. <code>PropertyChangeListener</code>s added 
   * to user preferences will be notified under a property name equal to the string value of one these properties.
   */
  public enum Property {LANGUAGE, UNIT, MAGNETISM_ENABLED, RULERS_VISIBLE, GRID_VISIBLE, 
                        NEW_WALL_HEIGHT, NEW_WALL_THICKNESS, RECENT_HOMES, IGNORED_ACTION_TIP}  
  private static final String [] SUPPORTED_LANGUAGES; 

  private static final TextStyle DEFAULT_TEXT_STYLE = new TextStyle(18f);
  private static final TextStyle DEFAULT_ROOM_TEXT_STYLE = new TextStyle(24f);

  static {
    ResourceBundle resource = ResourceBundle.getBundle(UserPreferences.class.getName());
    SUPPORTED_LANGUAGES = resource.getString("supportedLanguages").split("\\s");
  }
  
  private final PropertyChangeSupport propertyChangeSupport;
  private final Map<Class<?>, LocalizedStringResource> localizedStringResources;

  private FurnitureCatalog furnitureCatalog;
  private TexturesCatalog  texturesCatalog;
  private String           language;
  private String           defaultCountry;
  private String           currency;
  private LengthUnit       unit;
  private boolean          magnetismEnabled = true;
  private boolean          rulersVisible    = true;
  private boolean          gridVisible      = true;
  private float            newWallThickness;
  private float            newWallHeight;
  private List<String>     recentHomes;


  public UserPreferences() {
    this.propertyChangeSupport = new PropertyChangeSupport(this);
    this.localizedStringResources = new HashMap<Class<?>, LocalizedStringResource>();
    
    Locale defaultLocale = Locale.getDefault();
    this.language = defaultLocale.getLanguage();
    this.defaultCountry = defaultLocale.getCountry();
    // If current default locale isn't supported in Sweet Home 3D, 
    // let's use English as default language
    if (!Arrays.asList(SUPPORTED_LANGUAGES).contains(this.language)) {
      this.language = "en";
    }
    Locale.setDefault(new Locale(this.language, this.defaultCountry));
  }
  
  /**
   * Writes user preferences.
   * @throws RecorderException if user preferences couldn'y be saved.
   */
  public abstract void write() throws RecorderException;
  
  /**
   * Adds the <code>listener</code> in parameter to these preferences. 
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
   * Returns the furniture catalog.
   */
  public FurnitureCatalog getFurnitureCatalog() {
    return this.furnitureCatalog;
  }

  /**
   * Sets furniture catalog.
   */
  protected void setFurnitureCatalog(FurnitureCatalog catalog) {
    this.furnitureCatalog = catalog;
  }

  /**
   * Returns the textures catalog.
   */
  public TexturesCatalog getTexturesCatalog() {
    return this.texturesCatalog;
  }

  /**
   * Sets textures catalog.
   */
  protected void setTexturesCatalog(TexturesCatalog catalog) {
    this.texturesCatalog = catalog;
  }

  /**
   * Returns the length unit currently in use.
   */
  public LengthUnit getLengthUnit() {
    return this.unit;
  }
  
  /**
   * Returns the preferred language to display information, noted with an ISO 639 code
   * that may be followed by an underscore and an ISO 3166 code. 
   */
  public String getLanguage() {
    return this.language;
  }

  /**
   * Sets the preferred language to display information, changes current default locale accordingly 
   * and notifies listeners of this change.
   */
  public void setLanguage(String language) {
    if (!language.equals(this.language)) {
      String oldLanguage = this.language;
      this.language = language;      
      int underscoreIndex = language.indexOf("_");
      if (underscoreIndex != -1) {
        Locale.setDefault(new Locale(language.substring(0, underscoreIndex), 
            language.substring(underscoreIndex + 1)));
      } else {
        Locale.setDefault(new Locale(language, this.defaultCountry));
      }
      this.localizedStringResources.clear();
      this.propertyChangeSupport.firePropertyChange(Property.LANGUAGE.name(), 
          oldLanguage, language);
    }
  }

  /**
   * Returns the array of available languages in Sweet Home 3D.
   */
  public String [] getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Returns the string matching <code>resourceKey</code> in current language in the 
   * context of <code>resourceClass</code>.
   * If <code>resourceParameters</code> isn't empty the string is considered
   * as a format string, and the returned string will be formatted with these parameters. 
   * This implementation searches first the key in a properties file named as 
   * <code>resourceClass</code>, then if this file doesn't exist, it searches 
   * the key prefixed by <code>resourceClass</code> name and a dot in a package.properties file 
   * in the directory matching the package of <code>resourceClass</code>, 
   * @exception IllegalArgumentException if no string for the given key can be found
   */
  public String getLocalizedString(Class<?> resourceClass,
                                   String   resourceKey, 
                                   Object ... resourceParameters) {
    LocalizedStringResource localizedStringResource = 
        this.localizedStringResources.get(resourceClass);
    ResourceBundle resourceBundle;
    if (localizedStringResource == null) {
      try {      
        resourceBundle = ResourceBundle.getBundle(resourceClass.getName());
        localizedStringResource = new LocalizedStringResource(resourceBundle, null);
        this.localizedStringResources.put(resourceClass, localizedStringResource);
      } catch (MissingResourceException ex) {
        try {
          String className = resourceClass.getName();
          int lastIndex = className.lastIndexOf(".");
          String familyName;
          if (lastIndex != -1) {
            familyName = className.substring(0, lastIndex) + ".package";
          } else {
            familyName = "package";
          }
          resourceBundle = ResourceBundle.getBundle(familyName);
          localizedStringResource = new LocalizedStringResource(resourceBundle, 
              resourceClass.getSimpleName() + ".");
          this.localizedStringResources.put(resourceClass, localizedStringResource);
        } catch (MissingResourceException ex2) {
          throw new IllegalArgumentException(
              "Can't find resource bundle for " + resourceClass, ex);
        }
      }
    } else {
      resourceBundle = localizedStringResource.getResourceBundle();
    }

    if (localizedStringResource.getKeyPrefix() != null) {
      resourceKey = localizedStringResource.getKeyPrefix() + resourceKey;
    }
    
    try {
      String localizedString = resourceBundle.getString(resourceKey);
      if (resourceParameters.length > 0) {
        localizedString = String.format(localizedString, resourceParameters);
      }
      
      // Under Mac OS X, remove bracketed upper case roman letter used in oriental languages to indicate mnemonic 
      String language = Locale.getDefault().getLanguage();
      if (OperatingSystem.isMacOSX()
          && (language.equals(Locale.CHINESE.getLanguage())
              || language.equals(Locale.JAPANESE.getLanguage())
              || language.equals(Locale.KOREAN.getLanguage()))) {
        int openingBracketIndex = localizedString.indexOf('(');
        if (openingBracketIndex != -1) {
          int closingBracketIndex = localizedString.indexOf(')');
          if (openingBracketIndex == closingBracketIndex - 2) {
            char c = localizedString.charAt(openingBracketIndex + 1);
            if (c >= 'A' && c <= 'Z') {
              localizedString = localizedString.substring(0, openingBracketIndex) 
                  + localizedString.substring(closingBracketIndex + 1);
            }
          }
        }
      }
      
      return localizedString;
    } catch (MissingResourceException ex) {
      throw new IllegalArgumentException("Unknown key " + resourceKey);
    }
  }
  
  /**
   * Returns the currency in use, noted with ISO 4217 code, or <code>null</code> 
   * if prices aren't used in application.
   */
  public String getCurrency() {
    return this.currency;
  }

  /**
   * Sets currency in use.
   */
  protected void setCurrency(String currency) {
    this.currency = currency;
  }

  /**
   * Changes the unit currently in use, and notifies listeners of this change. 
   * @param unit one of the values of Unit.
   */
  public void setUnit(LengthUnit unit) {
    if (this.unit != unit) {
      LengthUnit oldUnit = this.unit;
      this.unit = unit;
      this.propertyChangeSupport.firePropertyChange(Property.UNIT.name(), oldUnit, unit);
    }
  }

  /**
   * Returns <code>true</code> if magnetism is enabled.
   * @return <code>true</code> by default.
   */
  public boolean isMagnetismEnabled() {
    return this.magnetismEnabled;
  }

  /**
   * Sets whether magnetism is enabled or not, and notifies
   * listeners of this change. 
   * @param magnetismEnabled <code>true</code> if magnetism is enabled,
   *          <code>false</code> otherwise.
   */
  public void setMagnetismEnabled(boolean magnetismEnabled) {
    if (this.magnetismEnabled != magnetismEnabled) {
      this.magnetismEnabled = magnetismEnabled;
      this.propertyChangeSupport.firePropertyChange(Property.MAGNETISM_ENABLED.name(), 
          !magnetismEnabled, magnetismEnabled);
    }
  }

  /**
   * Returns <code>true</code> if rulers are visible.
   * @return <code>true</code> by default.
   */
  public boolean isRulersVisible() {
    return this.rulersVisible;
  }

  /**
   * Sets whether rulers are visible or not, and notifies
   * listeners of this change. 
   * @param rulersVisible <code>true</code> if rulers are visible,
   *          <code>false</code> otherwise.
   */
  public void setRulersVisible(boolean rulersVisible) {
    if (this.rulersVisible != rulersVisible) {
      this.rulersVisible = rulersVisible;
      this.propertyChangeSupport.firePropertyChange(Property.RULERS_VISIBLE.name(), 
          !rulersVisible, rulersVisible);
    }
  }
  
  /**
   * Returns <code>true</code> if plan grid visible.
   * @return <code>true</code> by default.
   */
  public boolean isGridVisible() {
    return this.gridVisible;
  }
  
  /**
   * Sets whether plan grid is visible or not, and notifies
   * listeners of this change. 
   * @param gridVisible <code>true</code> if grid is visible,
   *          <code>false</code> otherwise.
   */
  public void setGridVisible(boolean gridVisible) {
    if (this.gridVisible != gridVisible) {
      this.gridVisible = gridVisible;
      this.propertyChangeSupport.firePropertyChange(Property.GRID_VISIBLE.name(), 
          !gridVisible, gridVisible);
    }
  }

  /**
   * Returns default thickness of new walls in home. 
   */
  public float getNewWallThickness() {
    return this.newWallThickness;
  }

  /**
   * Sets default thickness of new walls in home, and notifies
   * listeners of this change.  
   */
  public void setNewWallThickness(float newWallThickness) {
    if (this.newWallThickness != newWallThickness) {
      float oldDefaultThickness = this.newWallThickness;
      this.newWallThickness = newWallThickness;
      this.propertyChangeSupport.firePropertyChange(Property.NEW_WALL_THICKNESS.name(), 
          oldDefaultThickness, newWallThickness);
    }
  }

  /**
   * Returns default wall height of new home walls. 
   */
  public float getNewWallHeight() {
    return this.newWallHeight;
  }

  /**
   * Sets default wall height of new walls, and notifies
   * listeners of this change. 
   */
  public void setNewWallHeight(float newWallHeight) {
    if (this.newWallHeight != newWallHeight) {
      float oldWallHeight = this.newWallHeight;
      this.newWallHeight = newWallHeight;
      this.propertyChangeSupport.firePropertyChange(Property.NEW_WALL_HEIGHT.name(), 
          oldWallHeight, newWallHeight);
    }
  }
  
  /**
   * Returns an unmodifiable list of the recent homes.
   */
  public List<String> getRecentHomes() {
    return Collections.unmodifiableList(this.recentHomes);
  }

  /**
   * Sets the recent homes list and notifies listeners of this change.
   */
  public void setRecentHomes(List<String> recentHomes) {
    if (!recentHomes.equals(this.recentHomes)) {
      List<String> oldRecentHomes = this.recentHomes;
      this.recentHomes = new ArrayList<String>(recentHomes);
      this.propertyChangeSupport.firePropertyChange(Property.RECENT_HOMES.name(), 
          oldRecentHomes, getRecentHomes());
    }
  }
  
  /**
   * Sets which action tip should be ignored.
   * <br>This method should be overridden to store the ignore information.
   * By default it just notifies listeners of this change. 
   */
  public void setActionTipIgnored(String actionKey) {    
    this.propertyChangeSupport.firePropertyChange(Property.IGNORED_ACTION_TIP.name(), null, actionKey);
  }
  
  /**
   * Returns whether an action tip should be ignored or not. 
   * <br>This method should be overridden to return the the display information
   * stored in {@link #setActionTipIgnored(String) setActionTipDisplayed}.
   * By default it returns <code>true</code>. 
   */
  public boolean isActionTipIgnored(String actionKey) {
    return true;
  }
  
  /**
   * Resets the ignore flag of action tips.
   * <br>This method should be overridden to clear all the display flags.
   * By default it just notifies listeners of this change. 
   */
  public void resetIgnoredActionTips() {    
    this.propertyChangeSupport.firePropertyChange(Property.IGNORED_ACTION_TIP.name(), null, null);
  }
  
  /**
   * Returns the default text style of a class of selectable item. 
   */
  public TextStyle getDefaultTextStyle(Class<? extends Selectable> selectableClass) {
    if (Room.class.isAssignableFrom(selectableClass)) {
      return DEFAULT_ROOM_TEXT_STYLE;
    } else {
      return DEFAULT_TEXT_STYLE;
    }
  }

  /**
   * Adds <code>furnitureLibraryName</code> to furniture catalog  
   * to make the furniture library it contains available.
   * @param furnitureLibraryName  the name of the resource in which the library will be written. 
   */
  public abstract void addFurnitureLibrary(String furnitureLibraryName) throws RecorderException;
  
  /**
   * Returns <code>true</code> if the given furniture library exists.
   * @param furnitureLibraryName the name of the resource to check
   */
  public abstract boolean furnitureLibraryExists(String furnitureLibraryName) throws RecorderException;

  /**
   * Stores the resource bundle of a class and the prefix that may be 
   * added to resource key.
   */
  private static class LocalizedStringResource {
    private ResourceBundle resourceBundle;
    private String         keyPrefix;

    public LocalizedStringResource(ResourceBundle resourceBundle,
                                   String keyPrefix) {
      this.resourceBundle = resourceBundle;
      this.keyPrefix = keyPrefix;
    }
    
    public ResourceBundle getResourceBundle() {
      return this.resourceBundle;
    }
    
    public String getKeyPrefix() {
      return this.keyPrefix;
    }
  }
}
