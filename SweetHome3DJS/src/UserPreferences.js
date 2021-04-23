/*
 * UserPreferences.js
 *
 * Sweet Home 3D, Copyright (c) 2015 Emmanuel PUYBARET / eTeks <info@eteks.com>
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

// Requires core.js
//          LengthUnit.js
//          URLContent.js

/**
 * User preferences.
 * @constructor
 * @author Emmanuel Puybaret
 */
function UserPreferences() {
  this.propertyChangeSupport = new PropertyChangeSupport(this);

  this.initSupportedLanguages(UserPreferences.DEFAULT_SUPPORTED_LANGUAGES);
  
  this.resourceBundles = [];
  this.furnitureCatalogResourceBundles = [];
  
  this.furnitureCatalog = null;
  this.texturesCatalog = null;
  this.patternsCatalog = null;
  this.currency = null;
  this.valueAddedTaxEnabled = false
  this.defaultValueAddedTaxPercentage = null;
  this.unit = null;
  this.furnitureCatalogViewedInTree = true;
  this.aerialViewCenteredOnSelectionEnabled = false;
  this.observerCameraSelectedAtChange = true;
  this.navigationPanelVisible = true;
  this.magnetismEnabled = true;
  this.rulersVisible = true;
  this.gridVisible = true;
  this.defaultFontName = null;
  this.furnitureViewedFromTop = true;
  this.furnitureModelIconSize = 128;
  this.roomFloorColoredOrTextured = true;
  this.wallPattern = null;
  this.newWallPattern = null;
  this.newWallThickness = 7.5;
  this.newWallHeight = 250;
  this.newWallBaseboardThickness = 1;
  this.newWallBaseboardHeight = 7;
  this.newRoomFloorColor = null;
  this.newFloorThickness = 12;
  this.recentHomes = [];
  this.autoSaveDelayForRecovery;
  this.autoCompletionStrings = {};
  this.recentColors = [];
  this.recentTextures = [];
  this.homeExamples = [];
}

UserPreferences.DEFAULT_SUPPORTED_LANGUAGES = ["bg", "cs", "de", "el", "en", "es", "fr", "it", "ja", "hu", "nl", "pl", "pt", "ru", "sv", "vi", "zh_CN", "zh_TW"];

UserPreferences.DEFAULT_TEXT_STYLE = new TextStyle(18);
UserPreferences.DEFAULT_ROOM_TEXT_STYLE = new TextStyle(24);

/**
 * Initializes the supportedLanguage property (and potentially the language property if it has to change)
 * @private
 */
UserPreferences.prototype.initSupportedLanguages = function(supportedLanguages) {
  this.supportedLanguages = supportedLanguages;
  // We also initialize the language except if already set and within the supported languages
  if (!this.language || this.supportedLanguages.indexOf(this.language) === -1) {
    var defaultLocale = Locale.getDefault();
    if (defaultLocale === null) {
      defaultLocale = "en";
    }
    this.defaultCountry = "";
    var defaultLanguage = defaultLocale;
    if (defaultLocale.indexOf("_") > 0) {
      this.defaultCountry = defaultLocale.substring(defaultLocale.indexOf("_") + 1, defaultLocale.length);
      defaultLanguage = this.language 
          ? this.language.substring(0, this.language.indexOf("_")) 
          : defaultLocale.substring(0, defaultLocale.indexOf("_"));
    }
    // Find closest language among supported languages in Sweet Home 3D
    // For example, use simplified Chinese even for Chinese users (zh_?) not from China (zh_CN)
    // unless their exact locale is supported as in Taiwan (zh_TW)
    for (var i = 0; i < this.supportedLanguages.length; i++) {
      var supportedLanguage = this.supportedLanguages[i];
      if (this.defaultCountry != "" && supportedLanguage == defaultLanguage + "_" + this.defaultCountry
          || this.defaultCountry == "" && supportedLanguage == defaultLanguage) {
        this.language = supportedLanguage;
        break; // Found the exact supported language
      } else if (this.language === undefined
        && supportedLanguage.indexOf(defaultLanguage) === 0) {
        this.language = supportedLanguage; // Found a supported language
      }
    }
    // If no language was found, let's use English by default
    if (this.language === undefined) {
      this.language = "en";
    }
    this.updateDefaultLocale();
  }
}

/**
 * Updates default locale from preferences language.
 * @private
 */
UserPreferences.prototype.updateDefaultLocale = function() {
  if (this.language.indexOf("_") !== -1) {
    Locale.setDefault(this.language);
  } else {
    Locale.setDefault(this.language + "_" + this.defaultCountry);
  }
}

/**
 * Writes user preferences.
 */
UserPreferences.prototype.write = function() {
  // Does nothing
}

/**
 * Adds the property change <code>listener</code> in parameter to these preferences.
 * @since 6.4
 */
UserPreferences.prototype.addPropertyChangeListener = function(listener) {
  this.propertyChangeSupport.addPropertyChangeListener(listener);
}

/**
 * Removes the property change <code>listener</code> in parameter from these preferences.
 * @since 6.4
 */
UserPreferences.prototype.removePropertyChangeListener = function(listener) {
  this.propertyChangeSupport.removePropertyChangeListener(listener);
}

/**
 * Adds the <code>listener</code> in parameter to these preferences to listen
 * to the changes of the given <code>property</code>.
 * The listener is a function that will receive in parameter an event of {@link PropertyChangeEvent} class.
 */
UserPreferences.prototype.addPropertyChangeListener = function(property, listener) {
  this.propertyChangeSupport.addPropertyChangeListener(property, listener);
}

/**
 * Removes the <code>listener</code> in parameter from these preferences.
 */
UserPreferences.prototype.removePropertyChangeListener = function(property, listener) {
  this.propertyChangeSupport.removePropertyChangeListener(property, listener);
}

/**
 * Returns the furniture catalog.
 * @ignore
 */
UserPreferences.prototype.getFurnitureCatalog = function() {
  return this.furnitureCatalog;
}

/**
 * Sets furniture catalog.
 * @ignore
 */
UserPreferences.prototype.setFurnitureCatalog = function(catalog) {
  this.furnitureCatalog = catalog;
}

/**
 * Returns the textures catalog.
 * @ignore
 */
UserPreferences.prototype.getTexturesCatalog = function() {
  return this.texturesCatalog;
}

/**
 * Sets textures catalog.
 * @ignore
 */
UserPreferences.prototype.setTexturesCatalog = function(catalog) {
  this.texturesCatalog = catalog;
}

/**
 * Returns the patterns catalog available to fill plan areas. 
 */
UserPreferences.prototype.getPatternsCatalog = function() {
  return this.patternsCatalog;
}

/**
 * Sets the patterns available to fill plan areas.
 * @ignore
 */
UserPreferences.prototype.setPatternsCatalog = function(catalog) {
  this.patternsCatalog = catalog;
}

/**
 * Returns the length unit currently in use.
 */
UserPreferences.prototype.getLengthUnit = function() {
  return this.unit;
}

/**
 * Changes the unit currently in use, and notifies listeners of this change. 
 * @param unit one of the values of Unit.
 */
UserPreferences.prototype.setUnit = function(unit) {
  if (this.unit !== unit) {
    var oldUnit = this.unit;
    this.unit = unit;
    this.propertyChangeSupport.firePropertyChange("UNIT", oldUnit, unit);
  }
}

/**
 * Returns the preferred language to display information, noted with an ISO 639 code
 * that may be followed by an underscore and an ISO 3166 code.
 */
UserPreferences.prototype.getLanguage = function() {
  return this.language;
}

/**
 * If language can be changed, sets the preferred language to display information, 
 * changes current default locale accordingly and notifies listeners of this change.
 * @param language an ISO 639 code that may be followed by an underscore and an ISO 3166 code
 *            (for example fr, de, it, en_US, zh_CN). 
 */
UserPreferences.prototype.setLanguage = function(language) {
  if (language != this.language && this.isLanguageEditable()) {
    var oldLanguage = this.language;
    this.language = language;
    // Make it accessible to other localized parts (e.g. LengthUnit)
    this.updateDefaultLocale();
    this.resourceBundles = [];
    this.furnitureCatalogResourceBundles = [];
    this.propertyChangeSupport.firePropertyChange("LANGUAGE", oldLanguage, language);
  }
}

/**
 * Returns <code>true</code> if the language in preferences can be set.
 * @return <code>true</code> except if <code>user.language</code> System property isn't writable.
 * @ignore 
 */
UserPreferences.prototype.isLanguageEditable = function() {
  return true;
}

/**
 * Returns the array of default available languages in Sweet Home 3D.
 * @returns an array of languages_countries ISO representations
 */
UserPreferences.prototype.getDefaultSupportedLanguages = function() {
  return UserPreferences.DEFAULT_SUPPORTED_LANGUAGES.slice(0);
}

/**
 * Returns the array of available languages in Sweet Home 3D including languages in libraries.
 */
UserPreferences.prototype.getSupportedLanguages = function() {
  return this.supportedLanguages.slice(0);
}

/**
 * Returns the array of available languages in Sweet Home 3D.
 */
UserPreferences.prototype.setSupportedLanguages = function(supportedLanguages) {
  if (this.supportedLanguages != supportedLanguages) {
    var oldSupportedLanguages = this.supportedLanguages;
    var oldLanguage = this.language;
    this.initSupportedLanguages(supportedLanguages.slice(0));
    this.propertyChangeSupport.firePropertyChange("SUPPORTED_LANGUAGES", oldSupportedLanguages, supportedLanguages);
    if (oldLanguage != this.language) {
      this.propertyChangeSupport.firePropertyChange("LANGUAGE", oldLanguage, language);
    }
  }
}

/**
 * Returns the string matching <code>resourceKey</code> in current language in the 
 * context of <code>resourceClass</code> or for a resource family if <code>resourceClass</code>
 * is a string.
 * If <code>resourceParameters</code> isn't empty the string is considered
 * as a format string, and the returned string will be formatted with these parameters. 
 * This implementation searches first the key in a properties file named as 
 * <code>resourceClass</code>, then if this file doesn't exist, it searches 
 * the key prefixed by <code>resourceClass</code> name and a dot in a package.properties file 
 * in the folder matching the package of <code>resourceClass</code>. 
 * @throws IllegalArgumentException if no string for the given key can be found
 */
UserPreferences.prototype.getLocalizedString = function(resourceClass, resourceKey, resourceParameters) {
  this.getResourceBundles(resourceClass);
  if (resourceClass == "DefaultFurnitureCatalog") {
    return CoreTools.getStringFromKey.apply(null, [this.furnitureCatalogResourceBundles, resourceKey].concat(Array.prototype.slice.call(arguments, 2))); 
  } else {
    // JSweet-generated code interop: if resourceClass is a constructor, it may contain the Java class full name in __class
    if (resourceClass.__class) {
      var resourceClassArray = resourceClass.__class.split('.');
      resourceClass = resourceClassArray[resourceClassArray.length - 1];
    }
    var key = resourceClass + "." + resourceKey;
    return CoreTools.getStringFromKey.apply(null, [this.resourceBundles, key].concat(Array.prototype.slice.call(arguments, 2))); 
  } 
}

/**
 * Returns the keys of the localized property strings of the given resource family.
 * @throws IllegalArgumentException if the given resourceFamily is not supported
 */
UserPreferences.prototype.getLocalizedStringKeys = function(resourceFamily) {
  if (resourceClass == "DefaultFurnitureCatalog") {
    var keys = {};
    for (var i = 0; i < resourceBundles.length; i++) {
      if (resourceBundles[i] != null) {
        CoreTools.merge(keys,  resourceBundles[i]);
      }
    }
    return Object.getOwnPropertyNames(keys);
  } else {
    throw new IllegalArgumentException("unsupported family");
  }
}

/**
 * Returns the resource bundle for the given resource family.
 */
UserPreferences.prototype.getResourceBundles = function(resourceClass) {
  if (resourceClass == "DefaultFurnitureCatalog") {
    if (this.furnitureCatalogResourceBundles.length == 0) {
      this.furnitureCatalogResourceBundles = CoreTools.loadResourceBundles("resources/DefaultFurnitureCatalog", Locale.getDefault());
    }
    return this.furnitureCatalogResourceBundles;
  } else {
    if (this.resourceBundles.length == 0) {
      this.resourceBundles = CoreTools.loadResourceBundles("resources/localization", Locale.getDefault());
    }
    return this.resourceBundles;
  } 
}

/**
 * Returns the default currency in use, noted with ISO 4217 code, or <code>null</code> 
 * if prices aren't used in application.
 * @ignore
 */
UserPreferences.prototype.getCurrency = function() {
  return this.currency;
}

/**
 * Sets the default currency in use.
 * @ignore
 */
UserPreferences.prototype.setCurrency = function(currency) {
  this.currency = currency;
}

/**
 * Returns <code>true</code> if Value Added Tax should be taken in account in prices.
 * @since 6.0
 * @ignore
 */
UserPreferences.prototype.isValueAddedTaxEnabled = function() {
  return this.valueAddedTaxEnabled;
}

/**
 * Sets whether Value Added Tax should be taken in account in prices.
 * @param valueAddedTaxEnabled if <code>true</code> VAT will be added to prices.
 * @since 6.0
 * @ignore
 */
UserPreferences.prototype.setValueAddedTaxEnabled = function(valueAddedTaxEnabled) {
  if (this.valueAddedTaxEnabled !== valueAddedTaxEnabled) {
    this.valueAddedTaxEnabled = valueAddedTaxEnabled;
    this.propertyChangeSupport.firePropertyChange("VALUE_ADDED_TAX_ENABLED",
        !valueAddedTaxEnabled, valueAddedTaxEnabled);
  }
}

/**
 * Returns the Value Added Tax percentage applied to prices by default, or <code>null</code>
 * if VAT isn't taken into account in the application.
 * @since 6.0
 * @ignore
 */
UserPreferences.prototype.getDefaultValueAddedTaxPercentage = function() {
  return this.defaultValueAddedTaxPercentage;
}

/**
 * Sets the Value Added Tax percentage applied to prices by default.
 * @param {Big} valueAddedTaxPercentage the default VAT percentage
 * @since 6.0
 * @ignore
 */
UserPreferences.prototype.setDefaultValueAddedTaxPercentage = function(valueAddedTaxPercentage) {
  if (valueAddedTaxPercentage !== this.defaultValueAddedTaxPercentage
      && (valueAddedTaxPercentage == null || !valueAddedTaxPercentage.eq(this.defaultValueAddedTaxPercentage))) {
    var oldValueAddedTaxPercentage = this.defaultValueAddedTaxPercentage;
    this.defaultValueAddedTaxPercentage = valueAddedTaxPercentage;
    this.propertyChangeSupport.firePropertyChange("DEFAULT_VALUE_ADDED_TAX_PERCENTAGE", oldValueAddedTaxPercentage, valueAddedTaxPercentage);

  }
}

/**
 * Returns <code>true</code> if the furniture catalog should be viewed in a tree.
 * @returns {Big} the default VAT percentage
 * @ignore
 */
UserPreferences.prototype.isFurnitureCatalogViewedInTree = function() {
  return this.furnitureCatalogViewedInTree;
}

/**
 * Sets whether the furniture catalog should be viewed in a tree or a different way.
 * @ignore
 */
UserPreferences.prototype.setFurnitureCatalogViewedInTree = function(furnitureCatalogViewedInTree) {
  if (this.furnitureCatalogViewedInTree !== furnitureCatalogViewedInTree) {
    this.furnitureCatalogViewedInTree = furnitureCatalogViewedInTree;
    this.propertyChangeSupport.firePropertyChange("FURNITURE_CATALOG_VIEWED_IN_TREE", 
        !furnitureCatalogViewedInTree, furnitureCatalogViewedInTree);
  }
}

/**
 * Returns <code>true</code> if the navigation panel should be displayed.
 */
UserPreferences.prototype.isNavigationPanelVisible = function() {
  return this.navigationPanelVisible;
}

/**
 * Sets whether the navigation panel should be displayed or not.
 */
UserPreferences.prototype.setNavigationPanelVisible = function(navigationPanelVisible) {
  if (this.navigationPanelVisible !== navigationPanelVisible) {
    this.navigationPanelVisible = navigationPanelVisible;
    this.propertyChangeSupport.firePropertyChange("NAVIGATION_PANEL_VISIBLE", 
        !navigationPanelVisible, navigationPanelVisible);
  }
}

/**
 * Sets whether aerial view should be centered on selection or not.
 */
UserPreferences.prototype.setAerialViewCenteredOnSelectionEnabled = function(aerialViewCenteredOnSelectionEnabled) {
  if (aerialViewCenteredOnSelectionEnabled !== this.aerialViewCenteredOnSelectionEnabled) {
    this.aerialViewCenteredOnSelectionEnabled = aerialViewCenteredOnSelectionEnabled;
    this.propertyChangeSupport.firePropertyChange("AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED", 
        !aerialViewCenteredOnSelectionEnabled, aerialViewCenteredOnSelectionEnabled);
  }
}

/**
 * Returns whether aerial view should be centered on selection or not.
 */
UserPreferences.prototype.isAerialViewCenteredOnSelectionEnabled = function() {
  return this.aerialViewCenteredOnSelectionEnabled;
}

/**
 * Sets whether the observer camera should be selected at each change.
 * @since 5.5
 */
UserPreferences.prototype.setObserverCameraSelectedAtChange = function(observerCameraSelectedAtChange) {
  if (observerCameraSelectedAtChange !== this.observerCameraSelectedAtChange) {
    this.observerCameraSelectedAtChange = observerCameraSelectedAtChange;
    this.propertyChangeSupport.firePropertyChange("OBSERVER_CAMERA_SELECTED_AT_CHANGE", 
        !observerCameraSelectedAtChange, observerCameraSelectedAtChange);
  }
}

/**
 * Returns whether the observer camera should be selected at each change.
 * @since 5.5
 */
UserPreferences.prototype.isObserverCameraSelectedAtChange = function() {
  return this.observerCameraSelectedAtChange;
}

/**
 * Returns <code>true</code> if magnetism is enabled.
 * @return <code>true</code> by default.
 */
UserPreferences.prototype.isMagnetismEnabled = function() {
  return this.magnetismEnabled;
}

/**
 * Sets whether magnetism is enabled or not, and notifies
 * listeners of this change. 
 * @param magnetismEnabled <code>true</code> if magnetism is enabled,
 *          <code>false</code> otherwise.
 */
UserPreferences.prototype.setMagnetismEnabled = function(magnetismEnabled) {
  if (this.magnetismEnabled !== magnetismEnabled) {
    this.magnetismEnabled = magnetismEnabled;
    this.propertyChangeSupport.firePropertyChange("MAGNETISM_ENABLED", 
        !magnetismEnabled, magnetismEnabled);
  }
}

/**
 * Returns <code>true</code> if rulers are visible.
 * @return <code>true</code> by default.
 * @ignore
 */
UserPreferences.prototype.isRulersVisible = function() {
  return this.rulersVisible;
}

/**
 * Sets whether rulers are visible or not, and notifies
 * listeners of this change. 
 * @param rulersVisible <code>true</code> if rulers are visible,
 *          <code>false</code> otherwise.
 * @ignore
 */
UserPreferences.prototype.setRulersVisible = function(rulersVisible) {
  if (this.rulersVisible !== rulersVisible) {
    this.rulersVisible = rulersVisible;
    this.propertyChangeSupport.firePropertyChange("RULERS_VISIBLE", 
        !rulersVisible, rulersVisible);
  }
}

/**
 * Returns <code>true</code> if plan grid visible.
 * @return <code>true</code> by default.
 */
UserPreferences.prototype.isGridVisible = function() {
  return this.gridVisible;
}

/**
 * Sets whether plan grid is visible or not, and notifies
 * listeners of this change. 
 * @param gridVisible <code>true</code> if grid is visible,
 *          <code>false</code> otherwise.
 */
UserPreferences.prototype.setGridVisible = function(gridVisible) {
  if (this.gridVisible !== gridVisible) {
    this.gridVisible = gridVisible;
    this.propertyChangeSupport.firePropertyChange("GRID_VISIBLE", 
        !gridVisible, gridVisible);
  }
}

/**
 * Returns the name of the font that should be used by default or <code>null</code> 
 * if the default font should be the default one in the application.
 */
UserPreferences.prototype.getDefaultFontName = function() {
  return this.defaultFontName;
}

/**
 * Sets the name of the font that should be used by default.
 */
UserPreferences.prototype.setDefaultFontName = function(defaultFontName) {
  if (defaultFontName != this.defaultFontName) {
    var oldName = this.defaultFontName;
    this.defaultFontName = defaultFontName;
    this.propertyChangeSupport.firePropertyChange("DEFAULT_FONT_NAME", oldName, defaultFontName);
  }
}

/**
 * Returns <code>true</code> if furniture should be viewed from its top in plan.
 */
UserPreferences.prototype.isFurnitureViewedFromTop = function() {
  return this.furnitureViewedFromTop;
}

/**
 * Sets how furniture icon should be displayed in plan, and notifies
 * listeners of this change. 
 * @param furnitureViewedFromTop if <code>true</code> the furniture 
 *    should be viewed from its top.
 */
UserPreferences.prototype.setFurnitureViewedFromTop = function(furnitureViewedFromTop) {
  if (this.furnitureViewedFromTop !== furnitureViewedFromTop) {
    this.furnitureViewedFromTop = furnitureViewedFromTop;
    this.propertyChangeSupport.firePropertyChange("FURNITURE_VIEWED_FROM_TOP", 
        !furnitureViewedFromTop, furnitureViewedFromTop);
  }
}

/**
 * Returns the size used to generate icons of furniture viewed from top.
 * @since 5.5
 */
UserPreferences.prototype.getFurnitureModelIconSize = function() {
  return this.furnitureModelIconSize;
}

/**
 * Sets the name of the font that should be used by default.
 * @since 5.5
 */
UserPreferences.prototype.setFurnitureModelIconSize = function(furnitureModelIconSize) {
  if (furnitureModelIconSize !== this.furnitureModelIconSize) {
    var oldSize = this.furnitureModelIconSize;
    this.furnitureModelIconSize = furnitureModelIconSize;
    this.propertyChangeSupport.firePropertyChange("FURNITURE_MODEL_ICON_SIZE", oldSize, furnitureModelIconSize);
  }
}

/**
 * Returns <code>true</code> if room floors should be rendered with color or texture in plan.
 * @return <code>false</code> by default.
 */
UserPreferences.prototype.isRoomFloorColoredOrTextured = function() {
  return this.roomFloorColoredOrTextured;
}

/**
 * Sets whether room floors should be rendered with color or texture, 
 * and notifies listeners of this change. 
 * @param roomFloorColoredOrTextured <code>true</code> if floor color 
 *          or texture is used, <code>false</code> otherwise.
 */
UserPreferences.prototype.setFloorColoredOrTextured = function(roomFloorColoredOrTextured) {
  if (this.roomFloorColoredOrTextured !== roomFloorColoredOrTextured) {
    this.roomFloorColoredOrTextured = roomFloorColoredOrTextured;
    this.propertyChangeSupport.firePropertyChange("ROOM_FLOOR_COLORED_OR_TEXTURED", 
        !roomFloorColoredOrTextured, roomFloorColoredOrTextured);
  }
}

/**
 * Returns the wall pattern in plan used by default.
 * @ignore
 */
UserPreferences.prototype.getWallPattern = function() {
  return this.wallPattern;
}

/**
 * Sets how walls should be displayed in plan by default, and notifies
 * listeners of this change.
 * @ignore
 */
UserPreferences.prototype.setWallPattern = function(wallPattern) {
  if (this.wallPattern !== wallPattern) {
    var oldWallPattern = this.wallPattern;
    this.wallPattern = wallPattern;
    this.propertyChangeSupport.firePropertyChange("WALL_PATTERN", 
        oldWallPattern, wallPattern);
  }
}

/**
 * Returns the pattern used for new walls in plan or <code>null</code> if it's not set.
 */
UserPreferences.prototype.getNewWallPattern = function() {
  return this.newWallPattern;
}

/**
 * Sets how new walls should be displayed in plan, and notifies
 * listeners of this change.
 */
UserPreferences.prototype.setNewWallPattern = function(newWallPattern) {
  if (this.newWallPattern !== newWallPattern) {
    var oldWallPattern = this.newWallPattern;
    this.newWallPattern = newWallPattern;
    this.propertyChangeSupport.firePropertyChange("NEW_WALL_PATTERN", 
        oldWallPattern, newWallPattern);
  }
}

/**
 * Returns default thickness of new walls in home. 
 */
UserPreferences.prototype.getNewWallThickness = function() {
  return this.newWallThickness;
}

/**
 * Sets default thickness of new walls in home, and notifies
 * listeners of this change.  
 */
UserPreferences.prototype.setNewWallThickness = function(newWallThickness) {
  if (this.newWallThickness !== newWallThickness) {
    var oldDefaultThickness = this.newWallThickness;
    this.newWallThickness = newWallThickness;
    this.propertyChangeSupport.firePropertyChange("NEW_WALL_THICKNESS", 
        oldDefaultThickness, newWallThickness);
  }
}

/**
 * Returns default wall height of new home walls. 
 */
UserPreferences.prototype.getNewWallHeight = function() {
  return this.newWallHeight;
}

/**
 * Sets default wall height of new walls, and notifies
 * listeners of this change. 
 */
UserPreferences.prototype.setNewWallHeight = function(newWallHeight) {
  if (this.newWallHeight !== newWallHeight) {
    var oldWallHeight = this.newWallHeight;
    this.newWallHeight = newWallHeight;
    this.propertyChangeSupport.firePropertyChange("NEW_WALL_HEIGHT", 
        oldWallHeight, newWallHeight);
  }
}

/**
 * Returns default baseboard thickness of new walls in home. 
 */
UserPreferences.prototype.getNewWallBaseboardThickness = function() {
  return this.newWallBaseboardThickness;
}

/**
 * Sets default baseboard thickness of new walls in home, and notifies
 * listeners of this change.  
 */
UserPreferences.prototype.setNewWallBaseboardThickness = function(newWallBaseboardThickness) {
  if (this.newWallBaseboardThickness !== newWallBaseboardThickness) {
    var oldThickness = this.newWallBaseboardThickness;
    this.newWallBaseboardThickness = newWallBaseboardThickness;
    this.propertyChangeSupport.firePropertyChange("NEW_WALL_SIDEBOARD_THICKNESS", 
        oldThickness, newWallBaseboardThickness);
  }
}

/**
 * Returns default baseboard height of new home walls. 
 */
UserPreferences.prototype.getNewWallBaseboardHeight = function() {
  return this.newWallBaseboardHeight;
}

/**
 * Sets default baseboard height of new walls, and notifies
 * listeners of this change. 
 */
UserPreferences.prototype.setNewWallBaseboardHeight = function(newWallBaseboardHeight) {
  if (this.newWallBaseboardHeight !== newWallBaseboardHeight) {
    var oldHeight = this.newWallBaseboardHeight;
    this.newWallBaseboardHeight = newWallBaseboardHeight;
    this.propertyChangeSupport.firePropertyChange("NEW_WALL_SIDEBOARD_HEIGHT", 
        oldHeight, newWallBaseboardHeight);
  }
}

/**
 * Returns the default color of new rooms in home.
 * @since 6.4
 */
UserPreferences.prototype.getNewRoomFloorColor = function() {
  return this.newRoomFloorColor;
}

/**
 * Sets the default color of new rooms in home, and notifies
 * listeners of this change.
 * @since 6.4
 */
UserPreferences.prototype.setNewRoomFloorColor = function(newRoomFloorColor) {
  if (this.newRoomFloorColor !== newRoomFloorColor) {
    var oldRoomFloorColor = this.newRoomFloorColor;
    this.newRoomFloorColor = newRoomFloorColor;
    this.propertyChangeSupport.firePropertyChange("NEW_ROOM_FLOOR_COLOR",
        oldRoomFloorColor, newRoomFloorColor);
  }
}

/**
 * Returns default thickness of the floor of new levels in home. 
 */
UserPreferences.prototype.getNewFloorThickness = function() {
  return this.newFloorThickness;
}

/**
 * Sets default thickness of the floor of new levels in home, and notifies
 * listeners of this change.  
 */
UserPreferences.prototype.setNewFloorThickness = function(newFloorThickness) {
  if (this.newFloorThickness !== newFloorThickness) {
    var oldFloorThickness = this.newFloorThickness;
    this.newFloorThickness = newFloorThickness;
    this.propertyChangeSupport.firePropertyChange("NEW_FLOOR_THICKNESS", 
        oldFloorThickness, newFloorThickness);
  }
}

/**
 * Returns the delay between two automatic save operations of homes for recovery purpose.
 * @return a delay in milliseconds or 0 to disable auto save.
 * @ignore
 */
UserPreferences.prototype.getAutoSaveDelayForRecovery = function() {
  return this.autoSaveDelayForRecovery;
}

/**
 * Sets the delay between two automatic save operations of homes for recovery purpose.
 * @ignore
 */
UserPreferences.prototype.setAutoSaveDelayForRecovery = function(autoSaveDelayForRecovery) {
  if (this.autoSaveDelayForRecovery !== autoSaveDelayForRecovery) {
    var oldAutoSaveDelayForRecovery = this.autoSaveDelayForRecovery;
    this.autoSaveDelayForRecovery = autoSaveDelayForRecovery;
    this.propertyChangeSupport.firePropertyChange("AUTO_SAVE_DELAY_FOR_RECOVERY", 
        oldAutoSaveDelayForRecovery, autoSaveDelayForRecovery);
  }
}

/**
 * Returns an unmodifiable list of the recent homes.
 * @ignore
 */
UserPreferences.prototype.getRecentHomes = function() {
  return this.recentHomes.slice(0);
}

/**
 * Sets the recent homes list and notifies listeners of this change.
 * @ignore
 */
UserPreferences.prototype.setRecentHomes = function(recentHomes) {
  if (recentHomes != this.recentHomes) {
    var oldRecentHomes = this.recentHomes;
    this.recentHomes = recentHomes.slice(0);
    this.propertyChangeSupport.firePropertyChange("RECENT_HOMES", 
        oldRecentHomes, this.getRecentHomes());
  }
}

/**
 * Returns the maximum count of homes that should be proposed to the user.
 * @ignore
 */
UserPreferences.prototype.getRecentHomesMaxCount = function() {
  return 10;
}

/**
 * Returns the maximum count of stored cameras in homes that should be proposed to the user.
 * @ignore
 */
UserPreferences.prototype.getStoredCamerasMaxCount = function() {
  return 50;
}

/**
 * Sets which action tip should be ignored.
 * <br>This method should be overridden to store the ignore information.
 * By default it just notifies listeners of this change. 
 * @ignore
 */
UserPreferences.prototype.setActionTipIgnored = function(actionKey) {    
  this.propertyChangeSupport.firePropertyChange("IGNORED_ACTION_TIP", null, actionKey);
}

/**
 * Returns whether an action tip should be ignored or not. 
 * <br>This method should be overridden to return the display information
 * stored in setActionTipIgnored.
 * By default it returns <code>true</code>. 
 * @ignore
 */
UserPreferences.prototype.isActionTipIgnored = function(actionKey) {
  return true;
}

/**
 * Resets the ignore flag of action tips.
 * <br>This method should be overridden to clear all the display flags.
 * By default it just notifies listeners of this change. 
 * @ignore
 */
UserPreferences.prototype.resetIgnoredActionTips = function() {    
  this.propertyChangeSupport.firePropertyChange("IGNORED_ACTION_TIP", null, null);
}

/**
 * Returns the default text style of a class of selectable item. 
 * @ignore
 */
UserPreferences.prototype.getDefaultTextStyle = function(selectableClass) {
  if (selectableClass.name == "Room") {
    return UserPreferences.DEFAULT_ROOM_TEXT_STYLE;
  } else {
    return UserPreferences.DEFAULT_TEXT_STYLE;
  }
}

/**
 * Returns the strings that may be used for the auto completion of the given <code>property</code>.
 * @ignore
 */
UserPreferences.prototype.getAutoCompletionStrings = function(property) {
  var propertyAutoCompletionStrings = this.autoCompletionStrings.get(property);
  if (propertyAutoCompletionStrings !== undefined) {
    return propertyAutoCompletionStrings.slice(0);
  } else {
    return [];
  }
}

/**
 * Adds the given string to the list of the strings used in auto completion of a <code>property</code>
 * and notifies listeners of this change.
 * @ignore
 */
UserPreferences.prototype.addAutoCompletionString = function(property, autoCompletionString) {
  if (autoCompletionString !== null 
      && autoCompletionString.length > 0) {
    var propertyAutoCompletionStrings = this.autoCompletionStrings [property];
    if (propertyAutoCompletionStrings === undefined) {
      propertyAutoCompletionStrings = [];
    } else if (propertyAutoCompletionStrings.indexOf(autoCompletionString) < 0) {
      propertyAutoCompletionStrings = propertyAutoCompletionStrings.slice(0);
    } else {
      return;
    }
    propertyAutoCompletionStrings.splice(0, 0, autoCompletionString);
    this.setAutoCompletionStrings(property, propertyAutoCompletionStrings);
  }
}

/**
 * Sets the auto completion strings list of the given <code>property</code> and notifies listeners of this change.
 * @ignore
 */
UserPreferences.prototype.setAutoCompletionStrings = function(property, autoCompletionStrings) {
  var propertyAutoCompletionStrings = this.autoCompletionStrings [property];
  if (autoCompletionStrings != propertyAutoCompletionStrings) {
    this.autoCompletionStrings [property] = autoCompletionStrings.slice(0);
    this.propertyChangeSupport.firePropertyChange("AUTO_COMPLETION_STRINGS", 
        null, property);
  }
}

/**
 * Returns the list of properties with auto completion strings. 
 * @ignore
 */
UserPreferences.prototype.getAutoCompletedProperties = function() {
  if (this.autoCompletionStrings !== null) {
    return Object.keys(this.autoCompletionStrings);
  } else {
    return [];
  }
}

/**
 * Returns the list of the recent colors.
 * @ignore
 */
UserPreferences.prototype.getRecentColors = function() {
  return this.recentColors;
}

/**
 * Sets the recent colors list and notifies listeners of this change.
 * @ignore
 */
UserPreferences.prototype.setRecentColors = function(recentColors) {
  if (recentColors != this.recentColors) {
    var oldRecentColors = this.recentColors;
    this.recentColors = recentColors.slice(0);
    this.propertyChangeSupport.firePropertyChange("RECENT_COLORS", 
        oldRecentColors, this.getRecentColors());
  }
}

/**
 * Returns the list of the recent textures.
 * @ignore
 */
UserPreferences.prototype.getRecentTextures = function() {
  return this.recentTextures;
}

/**
 * Sets the recent colors list and notifies listeners of this change.
 * @ignore
 */
UserPreferences.prototype.setRecentTextures = function(recentTextures) {
  if (recentTextures != this.recentTextures) {
    var oldRecentTextures = this.recentTextures;
    this.recentTextures = recentTextures.slice(0);
    this.propertyChangeSupport.firePropertyChange("RECENT_TEXTURES", 
        oldRecentTextures, this.getRecentTextures());
  }
}

/**
 * Sets the home examples available for the user.
 * @param {HomeDescriptor[]} homeExamples an array of examples
 * @since 5.5
 * @ignore
 */
UserPreferences.prototype.setHomeExamples = function(homeExamples) {
  if (homeExamples != this.homeExamples) {
    var oldExamples = this.homeExamples;
    this.homeExamples = homeExamples.slice(0);
    this.propertyChangeSupport.firePropertyChange("HOME_EXAMPLES", 
        oldExamples, this.getHomeExamples());
  }
}

/**
 * Returns the home examples available for the user.
 * @return {HomeDescriptor[]} an array of examples.
 * @since 5.5
 * @ignore
 */
UserPreferences.prototype.getHomeExamples = function() {
  return this.homeExamples;
}


/**
 * Default user preferences.
 * @param {string[]|boolean}       [furnitureCatalogUrls]
 * @param {string|UserPreferences} [furnitureResourcesUrlBase]
 * @param {string[]} [texturesCatalogUrls]
 * @param {string}   [texturesResourcesUrlBase]
 * @constructor
 * @extends UserPreferences
 * @author Emmanuel Puybaret
 */
function DefaultUserPreferences(furnitureCatalogUrls, furnitureResourcesUrlBase, 
                                texturesCatalogUrls, texturesResourcesUrlBase) {
  UserPreferences.call(this);
  
  // Build default patterns catalog
  var patterns = [];
  patterns.push(new DefaultPatternTexture("foreground"));
  patterns.push(new DefaultPatternTexture("reversedHatchUp"));
  patterns.push(new DefaultPatternTexture("reversedHatchDown"));
  patterns.push(new DefaultPatternTexture("reversedCrossHatch"));
  patterns.push(new DefaultPatternTexture("background"));
  patterns.push(new DefaultPatternTexture("hatchUp"));
  patterns.push(new DefaultPatternTexture("hatchDown"));
  patterns.push(new DefaultPatternTexture("crossHatch"));
  var patternsCatalog = new PatternsCatalog(patterns);  
  this.setPatternsCatalog(patternsCatalog);
  this.setFurnitureCatalog(typeof DefaultFurnitureCatalog === "function"
      ? (Array.isArray(furnitureCatalogUrls)
           ? new DefaultFurnitureCatalog(furnitureCatalogUrls, furnitureResourcesUrlBase) 
           : new DefaultFurnitureCatalog(this))
      : new FurnitureCatalog());
  this.setTexturesCatalog(typeof DefaultTextureCatalog === "function"
      ? (Array.isArray(texturesCatalogUrls)
           ? new DefaultTextureCatalog(texturesCatalogUrls, texturesResourcesUrlBase) 
           : new DefaultTextureCatalog(this))
      : new TexturesCatalog());

  if (Locale.getDefault() == "en_US") {
    this.setUnit(LengthUnit.INCH);
    this.setNewWallThickness(7.62);
    this.setNewWallHeight(243.84);
    this.setNewWallBaseboardThickness(0.9525);
    this.setNewWallBaseboardHeight(6.35);
  } else {
    this.setUnit(LengthUnit.CENTIMETER);
    this.setNewWallThickness(7.5);
    this.setNewWallHeight(250);
    this.setNewWallBaseboardThickness(1);
    this.setNewWallBaseboardHeight(7);
  }

  this.setNavigationPanelVisible(false);
  this.setWallPattern(patternsCatalog.getPattern("hatchUp"));
  this.setNewWallPattern(this.getWallPattern());
}
DefaultUserPreferences.prototype = Object.create(UserPreferences.prototype);
DefaultUserPreferences.prototype.constructor = DefaultUserPreferences;


/**
 * Creates a pattern built from resources.
 * @param {string} name
 * @constructor
 * @ignore
 * @author Emmanuel Puybaret
 */
function DefaultPatternTexture(name) {
  this.name = name;
  this.image = new URLContent(ZIPTools.getScriptFolder() + "/resources/patterns/" + this.name + ".png");
}

DefaultPatternTexture["__class"] = "com.eteks.sweethome3d.io.DefaultPatternTexture";
DefaultPatternTexture["__interfaces"] = ["com.eteks.sweethome3d.model.TextureImage"];
DefaultPatternTexture['__transients'] = ["image"];

/**
 * Returns the name of this texture.
 * @return {string}
 */
DefaultPatternTexture.prototype.getName = function () {
  return this.name;
}

/**
 * Returns the creator of this texture.
 * @return {string}
 */
DefaultPatternTexture.prototype.getCreator = function () {
  return null;
}

/**
 * Returns the content of the image used for this texture.
 * @return {Object}
 */
DefaultPatternTexture.prototype.getImage = function () {
  return this.image;
}

/**
 * Returns the width of the image in centimeters.
 * @return {number}
 */
DefaultPatternTexture.prototype.getWidth = function () {
  return 10;
}

/**
 * Returns the height of the image in centimeters.
 * @return {number}
 */
DefaultPatternTexture.prototype.getHeight = function () {
  return 10;
}

/**
 * Returns <code>true</code> if the object in parameter is equal to this texture.
 * @param {Object} obj
 * @return {boolean}
 */
DefaultPatternTexture.prototype.equals = function (obj) {
  if (obj === this) {
    return true;
  } else if (obj instanceof DefaultPatternTexture) {
    var pattern = obj;
    return pattern.name == this.name;
  } else {
    return false;
  }
}
