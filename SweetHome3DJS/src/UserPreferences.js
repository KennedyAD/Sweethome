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
  this.texturesCatalogResourceBundles = [];

  /** @type {FurnitureCatalog} */
  this.furnitureCatalog = null;
  /** @type {TexturesCatalog} */
  this.texturesCatalog = null;
  /** @type {PatternsCatalog} */
  this.patternsCatalog = null;
  this.currency = null;
  this.valueAddedTaxEnabled = false
  this.defaultValueAddedTaxPercentage = null;
  /** @type {LengthUnit} */
  this.unit = null;
  this.furnitureCatalogViewedInTree = false;
  this.navigationPanelVisible = true;
  this.editingIn3DViewEnabled = false;
  this.aerialViewCenteredOnSelectionEnabled = false;
  this.observerCameraSelectedAtChange = true;
  this.magnetismEnabled = true;
  this.rulersVisible = true;
  this.gridVisible = true;
  this.defaultFontName = null;
  this.furnitureViewedFromTop = true;
  this.furnitureModelIconSize = 128;
  this.roomFloorColoredOrTextured = true;
  /** @type {TextureImage} */
  this.wallPattern = null;
  /** @type {TextureImage}  */
  this.newWallPattern = null;
  this.newWallThickness = 7.5;
  this.newWallHeight = 250;
  this.newWallBaseboardThickness = 1;
  this.newWallBaseboardHeight = 7;
  this.newRoomFloorColor = null;
  this.newFloorThickness = 12;
  this.autoSaveDelayForRecovery = 0;
  this.recentHomes = [];
  this.autoCompletionStrings = {};
  this.recentColors = [];
  this.recentTextures = [];
  this.homeExamples = [];

  this.ignoredActionTips = {};
}

UserPreferences.DEFAULT_SUPPORTED_LANGUAGES = ["bg", "cs", "de", "el", "en", "es", "fr", "it", "ja", "hu", "nl", "pl", "pt", "pt_BR", "ru", "sv", "vi", "zh_CN", "zh_TW"];

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
  if (this.language.indexOf("_") !== -1
      || this.defaultCountry == "") {
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
 * @return {LengthUnit}
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
    this.texturesCatalogResourceBundles = [];
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
 * @return an array of languages_countries ISO representations
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
  } else if (resourceClass == "DefaultTexturesCatalog") {
    return CoreTools.getStringFromKey.apply(null, [this.texturesCatalogResourceBundles, resourceKey].concat(Array.prototype.slice.call(arguments, 2))); 
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
  } else if (resourceClass == "DefaultTexturesCatalog") {
    if (this.texturesCatalogResourceBundles.length == 0) {
      this.texturesCatalogResourceBundles = CoreTools.loadResourceBundles("resources/DefaultTexturesCatalog", Locale.getDefault());
    }
    return this.texturesCatalogResourceBundles;
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
  if (currency != this.currency) {
    var oldCurrency = this.currency;
    this.currency = currency;
    this.propertyChangeSupport.firePropertyChange("CURRENCY", oldCurrency, currency);
  }
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
      && (valueAddedTaxPercentage == null || this.defaultValueAddedTaxPercentage == null || !valueAddedTaxPercentage.eq(this.defaultValueAddedTaxPercentage))) {
    var oldValueAddedTaxPercentage = this.defaultValueAddedTaxPercentage;
    this.defaultValueAddedTaxPercentage = valueAddedTaxPercentage;
    this.propertyChangeSupport.firePropertyChange("DEFAULT_VALUE_ADDED_TAX_PERCENTAGE", oldValueAddedTaxPercentage, valueAddedTaxPercentage);

  }
}

/**
 * Returns <code>true</code> if the furniture catalog should be viewed in a tree.
 * @return {boolean}
 * @ignore
 */
UserPreferences.prototype.isFurnitureCatalogViewedInTree = function() {
  return this.furnitureCatalogViewedInTree;
}

/**
 * Sets whether the furniture catalog should be viewed in a tree or a different way.
 * @param {boolean}
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
 * @return {boolean}
 */
UserPreferences.prototype.isNavigationPanelVisible = function() {
  return this.navigationPanelVisible;
}

/**
 * Sets whether the navigation panel should be displayed or not.
 * @param {boolean} navigationPanelVisible
 */
UserPreferences.prototype.setNavigationPanelVisible = function(navigationPanelVisible) {
  if (this.navigationPanelVisible !== navigationPanelVisible) {
    this.navigationPanelVisible = navigationPanelVisible;
    this.propertyChangeSupport.firePropertyChange("NAVIGATION_PANEL_VISIBLE", 
        !navigationPanelVisible, navigationPanelVisible);
  }
}

/**
 * Returns whether interactive editing in 3D view is enabled or not.
 * @return {boolean}
 * @since 7.2
 */
UserPreferences.prototype.isEditingIn3DViewEnabled = function() {
  return this.editingIn3DViewEnabled;
}

/**
 * Sets whether interactive editing in 3D view is enabled or not.
 * @param {boolean} editingIn3DViewEnabled
 * @since 7.2
 */
UserPreferences.prototype.setEditingIn3DViewEnabled = function(editingIn3DViewEnabled) {
  if (editingIn3DViewEnabled != this.editingIn3DViewEnabled) {
    this.editingIn3DViewEnabled = editingIn3DViewEnabled;
    this.propertyChangeSupport.firePropertyChange("EDITING_IN_3D_VIEW_ENABLED",
        !editingIn3DViewEnabled, editingIn3DViewEnabled);
  }
}

/**
 * Returns whether observer camera should be centered on selection or not.
 * @return {boolean}
 */
UserPreferences.prototype.isAerialViewCenteredOnSelectionEnabled = function() {
  return this.aerialViewCenteredOnSelectionEnabled;
}

/**
 * Sets whether aerial view should be centered on selection or not.
 * @param {boolean} aerialViewCenteredOnSelectionEnabled
 */
UserPreferences.prototype.setAerialViewCenteredOnSelectionEnabled = function(aerialViewCenteredOnSelectionEnabled) {
  if (aerialViewCenteredOnSelectionEnabled !== this.aerialViewCenteredOnSelectionEnabled) {
    this.aerialViewCenteredOnSelectionEnabled = aerialViewCenteredOnSelectionEnabled;
    this.propertyChangeSupport.firePropertyChange("AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED", 
        !aerialViewCenteredOnSelectionEnabled, aerialViewCenteredOnSelectionEnabled);
  }
}

/**
 * Returns whether the observer camera should be selected at each change.
 * @return {boolean}
 * @since 5.5
 */
UserPreferences.prototype.isObserverCameraSelectedAtChange = function() {
  return this.observerCameraSelectedAtChange;
}

/**
 * Sets whether the observer camera should be selected at each change.
 * @param {boolean} observerCameraSelectedAtChange
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
 * Returns <code>true</code> if magnetism is enabled.
 * @return {boolean} <code>true</code> by default.
 */
UserPreferences.prototype.isMagnetismEnabled = function() {
  return this.magnetismEnabled;
}

/**
 * Sets whether magnetism is enabled or not, and notifies
 * listeners of this change. 
 * @param {boolean} magnetismEnabled <code>true</code> if magnetism is enabled,
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
 * @return {boolean} <code>true</code> by default.
 * @ignore
 */
UserPreferences.prototype.isRulersVisible = function() {
  return this.rulersVisible;
}

/**
 * Sets whether rulers are visible or not, and notifies
 * listeners of this change. 
 * @param {boolean} rulersVisible <code>true</code> if rulers are visible,
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
 * @return {boolean} <code>true</code> by default.
 */
UserPreferences.prototype.isGridVisible = function() {
  return this.gridVisible;
}

/**
 * Sets whether plan grid is visible or not, and notifies
 * listeners of this change. 
 * @param {boolean} gridVisible <code>true</code> if grid is visible,
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
 * @return {string}
 */
UserPreferences.prototype.getDefaultFontName = function() {
  return this.defaultFontName;
}

/**
 * Sets the name of the font that should be used by default.
 * @param {string} defaultFontName
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
 * @return {boolean}
 */
UserPreferences.prototype.isFurnitureViewedFromTop = function() {
  return this.furnitureViewedFromTop;
}

/**
 * Sets how furniture icon should be displayed in plan, and notifies
 * listeners of this change. 
 * @param {boolean} furnitureViewedFromTop if <code>true</code> the furniture 
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
 * @return {TextureImage}
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
 * @return {TextureImage}
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
 * @return {boolean} <code>true</code> if updates should be checked.
 * @ignore
 */
UserPreferences.prototype.isCheckUpdatesEnabled = function() {
  // Empty implementation because it is used by the controller but useless for the Web version
}

/**
 * Sets whether updates should be checked or not.
 * @param {boolean} updatesChecked 
 * @since 4.0
 */
UserPreferences.prototype.setCheckUpdatesEnabled = function(updatesChecked) {
  // Empty implementation because it is used by the controller but useless for the Web version
}

/**
 * Returns <code>true</code> if large imported images should be resized without requesting user.
 * @ignore
 */
UserPreferences.prototype.isImportedImageResizedWithoutPrompting = function() {
  return true;
}


/**
 * Default user preferences.
 * @param {string[]|boolean} [furnitureCatalogUrls]
 * @param {string}   [furnitureResourcesUrlBase]
 * @param {string[]} [texturesCatalogUrls]
 * @param {string}   [texturesResourcesUrlBase]
 * @constructor
 * @extends UserPreferences
 * @author Emmanuel Puybaret
 */
function DefaultUserPreferences(furnitureCatalogUrls, furnitureResourcesUrlBase, 
                                texturesCatalogUrls, texturesResourcesUrlBase) {
  UserPreferences.call(this);

  var readCatalogs;
  var userLanguage;
  if (furnitureCatalogUrls !== undefined 
      && (typeof furnitureCatalogUrls === "boolean")) {
    readCatalogs = furnitureCatalogUrls;
    userLanguage = furnitureResourcesUrlBase;
    this.furnitureCatalogUrls = undefined;
    this.furnitureResourcesUrlBase = undefined;
    this.texturesCatalogUrls = undefined;
    this.texturesResourcesUrlBase = undefined;
  } else {
    readCatalogs = true;
    userLanguage = Locale.getDefault();
    this.furnitureCatalogUrls = furnitureCatalogUrls;
    this.furnitureResourcesUrlBase = furnitureResourcesUrlBase;
    this.texturesCatalogUrls = texturesCatalogUrls;
    this.texturesResourcesUrlBase = texturesResourcesUrlBase;
  }
  
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
  this.setFurnitureCatalog(readCatalogs && (typeof DefaultFurnitureCatalog === "function")
      ? (Array.isArray(furnitureCatalogUrls)
           ? new DefaultFurnitureCatalog(furnitureCatalogUrls, furnitureResourcesUrlBase) 
           : new DefaultFurnitureCatalog(this))
      : new FurnitureCatalog());
  this.setTexturesCatalog(readCatalogs && (typeof DefaultTexturesCatalog === "function")
      ? (Array.isArray(texturesCatalogUrls)
           ? new DefaultTexturesCatalog(texturesCatalogUrls, texturesResourcesUrlBase) 
           : new DefaultTexturesCatalog(this))
      : new TexturesCatalog());

  if (userLanguage == "en_US") {
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

  this.setNewFloorThickness(12);
  this.setNavigationPanelVisible(false);
  this.setWallPattern(patternsCatalog.getPattern("hatchUp"));
  this.setNewWallPattern(this.getWallPattern());
  this.setAerialViewCenteredOnSelectionEnabled(true);
  this.setAutoSaveDelayForRecovery(60000);
}
DefaultUserPreferences.prototype = Object.create(UserPreferences.prototype);
DefaultUserPreferences.prototype.constructor = DefaultUserPreferences;

/**
 * Writes user preferences.
 */
DefaultUserPreferences.prototype.write = function() {
  UserPreferences.prototype.write.call(this);
}


/**
 * Creates a pattern built from resources.
 * @param {string} name
 * @constructor
 * @ignore
 * @author Emmanuel Puybaret
 */
function DefaultPatternTexture(name) {
  this.name = name;
  this.image = new URLContent(ZIPTools.getScriptFolder() + "resources/patterns/" + this.name + ".png");
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


/**
 * User's preferences, synchronized with a backend.
 * @param {{furnitureCatalogURLs: string[],
 *          furnitureResourcesURLBase: string,
 *          texturesCatalogURLs: string[],
 *          texturesResourcesURLBase: string,
 *          writePreferencesURL: string,
 *          readPreferencesURL: string,
 *          writeResourceURL: string,
 *          readResourceURL: string,
 *          writePreferencesResourceURL: string,
 *          readPreferencesResourceURL: string,
 *          defaultUserLanguage: string,
 *          writingObserver: {writeStarted: Function, 
 *                            writeSucceeded: Function, 
 *                            writeFailed: Function, 
 *                            connectionFound: Function, 
 *                            connectionLost: Function}
 *         }} [configuration] preferences configuration.
 *              If configuration.writePreferencesResourceURL / configuration.readPreferencesResourceURL is missing,
 *              configuration.writeResourceURL / configuration.readResourceURL will be used.
 * @constructor
 * @extends UserPreferences
 * @author Louis Grignon
 * @author Emmanuel Puybaret
 */
function RecordedUserPreferences(configuration) {
  UserPreferences.call(this);

  if (configuration !== undefined) {
    this.furnitureCatalogUrls = configuration.furnitureCatalogURLs;
    this.furnitureResourcesUrlBase = configuration.furnitureResourcesURLBase;
    this.texturesCatalogUrls = configuration.texturesCatalogURLs;
    this.texturesResourcesUrlBase = configuration.texturesResourcesURLBase;
    this.writePreferencesUrl = configuration.writePreferencesURL;
    this.readPreferencesUrl = configuration.readPreferencesURL;
    this.writeResourceUrl = configuration.writePreferencesResourceURL !== undefined 
        ? configuration.writePreferencesResourceURL : configuration.writeResourceURL;
    this.readResourceUrl = configuration.readPreferencesResourceURL !== undefined 
        ? configuration.readPreferencesResourceURL : configuration.readResourceURL;
    this.writingObserver = configuration.writingObserver;
  }
  
  var userLanguage;
  if (configuration !== undefined && configuration.defaultUserLanguage !== undefined) {
    userLanguage = configuration.defaultUserLanguage;
  } else { 
    userLanguage = this.getLanguage();
  }

  this.uploadingBlobs = {};
  this.properties = {};
  this.setFurnitureCatalog(new FurnitureCatalog());
  this.setTexturesCatalog(new TexturesCatalog());
  if (this.readPreferencesUrl) {
    this.updatePreferencesFromProperties(this.properties, userLanguage, false);
    this.readPreferences(this.properties, userLanguage);
  } else {
    // Initialize properties from default preferences
    this.updatePreferencesFromProperties(this.properties, userLanguage, true);
    this.addListeners();
  }

}
RecordedUserPreferences.prototype = Object.create(UserPreferences.prototype);
RecordedUserPreferences.prototype.constructor = RecordedUserPreferences;

RecordedUserPreferences.LANGUAGE                                  = "language";
RecordedUserPreferences.UNIT                                      = "unit";
RecordedUserPreferences.CURRENCY                                  = "currency";
RecordedUserPreferences.VALUE_ADDED_TAX_ENABLED                   = "valueAddedTaxEnabled";
RecordedUserPreferences.DEFAULT_VALUE_ADDED_TAX_PERCENTAGE        = "defaultValueAddedTaxPercentage";
RecordedUserPreferences.FURNITURE_CATALOG_VIEWED_IN_TREE          = "furnitureCatalogViewedInTree";
RecordedUserPreferences.NAVIGATION_PANEL_VISIBLE                  = "navigationPanelVisible";
RecordedUserPreferences.EDITING_IN_3D_VIEW_ENABLED                = "editingIn3DViewEnabled";
RecordedUserPreferences.AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED = "aerialViewCenteredOnSelectionEnabled";
RecordedUserPreferences.OBSERVER_CAMERA_SELECTED_AT_CHANGE        = "observerCameraSelectedAtChange";
RecordedUserPreferences.MAGNETISM_ENABLED                         = "magnetismEnabled";
RecordedUserPreferences.RULERS_VISIBLE                            = "rulersVisible";
RecordedUserPreferences.GRID_VISIBLE                              = "gridVisible";
RecordedUserPreferences.DEFAULT_FONT_NAME                         = "defaultFontName";
RecordedUserPreferences.FURNITURE_VIEWED_FROM_TOP                 = "furnitureViewedFromTop";
RecordedUserPreferences.FURNITURE_MODEL_ICON_SIZE                 = "furnitureModelIconSize";
RecordedUserPreferences.ROOM_FLOOR_COLORED_OR_TEXTURED            = "roomFloorColoredOrTextured";
RecordedUserPreferences.WALL_PATTERN                              = "wallPattern";
RecordedUserPreferences.NEW_WALL_PATTERN                          = "newWallPattern";
RecordedUserPreferences.NEW_WALL_THICKNESS                        = "newWallThickness";
RecordedUserPreferences.NEW_WALL_HEIGHT                           = "newHomeWallHeight";
RecordedUserPreferences.NEW_WALL_BASEBOARD_THICKNESS              = "newWallBaseboardThickness";
RecordedUserPreferences.NEW_WALL_BASEBOARD_HEIGHT                 = "newWallBaseboardHeight";
RecordedUserPreferences.NEW_FLOOR_THICKNESS                       = "newFloorThickness";
RecordedUserPreferences.AUTO_SAVE_DELAY_FOR_RECOVERY              = "autoSaveDelayForRecovery";
RecordedUserPreferences.RECENT_HOMES                              = "recentHomes#";
RecordedUserPreferences.IGNORED_ACTION_TIP                        = "ignoredActionTip#";
RecordedUserPreferences.TEXTURE_NAME                              = "textureName#";
RecordedUserPreferences.TEXTURE_CREATOR                           = "textureCreator#";
RecordedUserPreferences.TEXTURE_CATEGORY                          = "textureCategory#";
RecordedUserPreferences.TEXTURE_IMAGE                             = "textureImage#";
RecordedUserPreferences.TEXTURE_WIDTH                             = "textureWidth#";
RecordedUserPreferences.TEXTURE_HEIGHT                            = "textureHeight#";

/**
 * Returns value of property in properties map, and return defaultValue if value is null or undefined.
 * @param {string, string} properties
 * @param {string} propertyKey
 * @param {any} [defaultValue]
 * @return {any} property's value
 * @private
 */
RecordedUserPreferences.prototype.getProperty = function(properties, propertyKey, defaultValue) {
  if (properties[propertyKey] === undefined || properties[propertyKey] === null) {
    return defaultValue;
  }
  return properties[propertyKey];
}

/**
 * Returns preferences internal properties.
 * @return {string, string}
 * @private
 */
RecordedUserPreferences.prototype.getProperties = function() {
  return this.properties;
}

/**
 * Sets value of a property in properties map.
 * @param {string, string} properties
 * @param {string} propertyKey
 * @param {any} propertyValue
 * @private
 */
RecordedUserPreferences.prototype.setProperty = function(properties, propertyKey, propertyValue) {
  properties[propertyKey] = propertyValue;
}

/**
 * Removes the given property in properties map.
 * @param {string, string} properties
 * @param {string} propertyKey
 * @private
 */
RecordedUserPreferences.prototype.removeProperty = function(properties, propertyKey) {
  delete properties[propertyKey];
}

/**
 * Updates saved preferences from the given properties.
 * @param {string, string} properties 
 * @param {string}         defaultUserLanguage
 * @param {boolean}        updateCatalogs  
 * @private
 */
RecordedUserPreferences.prototype.updatePreferencesFromProperties = function(properties, defaultUserLanguage, updateCatalogs) {
  this.setLanguage(this.getProperty(properties, RecordedUserPreferences.LANGUAGE, defaultUserLanguage));

  // Read default furniture and textures catalog
  if (updateCatalogs) {
    this.updateDefaultCatalogs();
  }
  this.readModifiableTexturesCatalog(properties);

  var defaultPreferences = new DefaultUserPreferences(false, defaultUserLanguage);
  defaultPreferences.setLanguage(this.getLanguage());

  // Fill default patterns catalog
  var patternsCatalog = defaultPreferences.getPatternsCatalog();
  this.setPatternsCatalog(patternsCatalog);

  // Read other preferences
  var unit = LengthUnit[this.getProperty(properties, RecordedUserPreferences.UNIT)];
  if (!unit) {
    unit = defaultPreferences.getLengthUnit();
  }
  this.setUnit(unit);

  this.setCurrency(this.getProperty(properties, RecordedUserPreferences.CURRENCY, defaultPreferences.getCurrency()));
  this.setValueAddedTaxEnabled(
      this.getProperty(properties, RecordedUserPreferences.VALUE_ADDED_TAX_ENABLED, 
          '' + defaultPreferences.isValueAddedTaxEnabled()) == 'true');
  var percentage = this.getProperty(properties, RecordedUserPreferences.DEFAULT_VALUE_ADDED_TAX_PERCENTAGE);
  var valueAddedTaxPercentage = defaultPreferences.getDefaultValueAddedTaxPercentage();
  if (percentage !== null) {
    try {
      valueAddedTaxPercentage = new Big(percentage);
    } catch (ex) {
    }
  }
  this.setDefaultValueAddedTaxPercentage(valueAddedTaxPercentage);
  this.setFurnitureCatalogViewedInTree(
      this.getProperty(properties, RecordedUserPreferences.FURNITURE_CATALOG_VIEWED_IN_TREE, 
          '' + defaultPreferences.isFurnitureCatalogViewedInTree()) == 'true');
  this.setNavigationPanelVisible(
      this.getProperty(properties, RecordedUserPreferences.NAVIGATION_PANEL_VISIBLE, 
          '' + defaultPreferences.isNavigationPanelVisible()) == 'true');
  this.setEditingIn3DViewEnabled(
      this.getProperty(properties, RecordedUserPreferences.EDITING_IN_3D_VIEW_ENABLED, 
          '' + defaultPreferences.isEditingIn3DViewEnabled()) == 'true');
  this.setAerialViewCenteredOnSelectionEnabled(
      this.getProperty(properties, RecordedUserPreferences.AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED,
          '' + defaultPreferences.isAerialViewCenteredOnSelectionEnabled()) == 'true');
  this.setObserverCameraSelectedAtChange(
      this.getProperty(properties, RecordedUserPreferences.OBSERVER_CAMERA_SELECTED_AT_CHANGE, 
          '' + defaultPreferences.isObserverCameraSelectedAtChange()) == 'true');
  this.setMagnetismEnabled(
      this.getProperty(properties, RecordedUserPreferences.MAGNETISM_ENABLED, 'true') == 'true');
  this.setRulersVisible(
      this.getProperty(properties, RecordedUserPreferences.RULERS_VISIBLE, '' + defaultPreferences.isMagnetismEnabled()) == 'true');
  this.setGridVisible(
      this.getProperty(properties, RecordedUserPreferences.GRID_VISIBLE, '' + defaultPreferences.isGridVisible()) == 'true');
  this.setDefaultFontName(this.getProperty(properties, RecordedUserPreferences.DEFAULT_FONT_NAME, defaultPreferences.getDefaultFontName()));
  this.setFurnitureViewedFromTop(
      this.getProperty(properties, RecordedUserPreferences.FURNITURE_VIEWED_FROM_TOP, 
          '' + defaultPreferences.isFurnitureViewedFromTop()) == 'true');
  this.setFurnitureModelIconSize(parseInt(this.getProperty(properties, RecordedUserPreferences.FURNITURE_MODEL_ICON_SIZE,  
      '' + defaultPreferences.getFurnitureModelIconSize())));
  this.setFloorColoredOrTextured(
      this.getProperty(properties, RecordedUserPreferences.ROOM_FLOOR_COLORED_OR_TEXTURED, 
          '' + defaultPreferences.isRoomFloorColoredOrTextured()) == 'true');

  try {
    this.setWallPattern(patternsCatalog.getPattern(this.getProperty(properties, RecordedUserPreferences.WALL_PATTERN, 
        defaultPreferences.getWallPattern().getName())));
  } catch (ex) {
    // Ensure wall pattern always exists even if new patterns are added in future versions
    this.setWallPattern(defaultPreferences.getWallPattern());
  }

  try {
    if (defaultPreferences.getNewWallPattern() != null) {
      this.setNewWallPattern(patternsCatalog.getPattern(this.getProperty(properties, RecordedUserPreferences.NEW_WALL_PATTERN,
          defaultPreferences.getNewWallPattern().getName())));
    }
  } catch (ex) {
    // Keep new wall pattern unchanged
  }

  this.setNewWallThickness(parseFloat(this.getProperty(properties, RecordedUserPreferences.NEW_WALL_THICKNESS,
      '' + defaultPreferences.getNewWallThickness())));
  this.setNewWallHeight(parseFloat(this.getProperty(properties, RecordedUserPreferences.NEW_WALL_HEIGHT,
      '' + defaultPreferences.getNewWallHeight())));
  this.setNewWallBaseboardThickness(defaultPreferences.getNewWallBaseboardThickness());
  this.setNewWallBaseboardHeight(defaultPreferences.getNewWallBaseboardHeight());
  this.setNewWallBaseboardThickness(parseFloat(this.getProperty(properties, RecordedUserPreferences.NEW_WALL_BASEBOARD_THICKNESS,
      '' + defaultPreferences.getNewWallBaseboardThickness())));
  this.setNewWallBaseboardHeight(parseFloat(this.getProperty(properties, RecordedUserPreferences.NEW_WALL_BASEBOARD_HEIGHT,
      '' + defaultPreferences.getNewWallBaseboardHeight())));
  this.setNewFloorThickness(parseFloat(this.getProperty(properties, RecordedUserPreferences.NEW_FLOOR_THICKNESS,
      '' + defaultPreferences.getNewFloorThickness())));
  this.setAutoSaveDelayForRecovery(parseInt(this.getProperty(properties, RecordedUserPreferences.AUTO_SAVE_DELAY_FOR_RECOVERY,
       '' + defaultPreferences.getAutoSaveDelayForRecovery())));
  // Read recent homes list
  var recentHomes = [];
  for (var i = 1; i <= this.getRecentHomesMaxCount(); i++) {
    var recentHome = this.getProperty(properties, RecordedUserPreferences.RECENT_HOMES + i);
    if (recentHome != null) {
      recentHomes.push(recentHome);
    }
  }
  this.setRecentHomes(recentHomes);

  // Read ignored action tips
  for (var i = 1; ; i++) {
    var ignoredActionTip = this.getProperty(properties, RecordedUserPreferences.IGNORED_ACTION_TIP + i, "");
    if (ignoredActionTip.length == 0) {
      break;
    } else {
      this.ignoredActionTips[ignoredActionTip] = true;
    }
  }
}

/**
 * Adds listeners to update catalogs and follow properties to save.
 * @private
 */
RecordedUserPreferences.prototype.addListeners = function() {
  var preferences = this;
  this.addPropertyChangeListener("LANGUAGE", function() {
      preferences.updateDefaultCatalogs();
    });

  // Add a listener to track written properties and ignore the other ones during a call to write
  var savedPropertyListener = function() {
      preferences.writtenPropertiesUpdated = true;
    };
  var writtenProperties = ["LANGUAGE", "UNIT", "CURRENCY", "VALUE_ADDED_TAX_ENABLED", "DEFAULT_VALUE_ADDED_TAX_PERCENTAGE",
      "FURNITURE_CATALOG_VIEWED_IN_TREE", "NAVIGATION_PANEL_VISIBLE", "EDITING_IN_3D_VIEW_ENABLED", "AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED",
      "OBSERVER_CAMERA_SELECTED_AT_CHANGE", "MAGNETISM_ENABLED", "GRID_VISIBLE", "DEFAULT_FONT_NAME", "FURNITURE_VIEWED_FROM_TOP",
      "FURNITURE_MODEL_ICON_SIZE", "ROOM_FLOOR_COLORED_OR_TEXTURED", "NEW_WALL_PATTERN", "NEW_WALL_THICKNESS",
      "NEW_WALL_HEIGHT", "NEW_WALL_BASEBOARD_THICKNESS", "NEW_WALL_BASEBOARD_HEIGHT", "NEW_FLOOR_THICKNESS"];
  for (var i = 0; i < writtenProperties.length; i++) {
    var writtenProperty = writtenProperties[i];
    this.addPropertyChangeListener(writtenProperty, savedPropertyListener);
  }
  this.getTexturesCatalog().addTexturesListener(savedPropertyListener);
}

/**
 * Read preferences properties from backend.
 * @param {string, string} properties
 * @private
 */
RecordedUserPreferences.prototype.readPreferences = function(properties, defaultUserLanguage) {
  try {
    var preferences = this;
    var updateJsonPreferences = function(jsonPreferences) {
        if (jsonPreferences != null) {
          var preferencesData = JSON.parse(jsonPreferences);
          for (var i in preferencesData) {
            properties [i] = preferencesData [i];
          }
        } 
        preferences.updatePreferencesFromProperties(properties, defaultUserLanguage, true);
        preferences.addListeners();
      };
      
    if (this.readPreferencesUrl.indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) === 0) {
      var key = this.readPreferencesUrl.substring(LocalStorageURLContent.LOCAL_STORAGE_PREFIX.length);
      updateJsonPreferences(localStorage.getItem(key));
    } else if (this.readPreferencesUrl.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) === 0) {
      new IndexedDBURLContent(this.readPreferencesUrl).getBlob({
          blobReady: function(blob) {
            var reader = new FileReader();
            // Use onload rather that addEventListener for Cordova support
            reader.onload = function() {
                updateJsonPreferences(reader.result);
              };
            reader.readAsText(blob);
          },
          blobError : function(status, error) {
            preferences.updateDefaultCatalogs();
            preferences.addListeners();
            if (status != -1) {
              console.log("Can't read preferences from indexedDB " + status + " " + error);
            }
          }
        });
    } else {
      var request = new XMLHttpRequest();
      var querySeparator = this.readPreferencesUrl.indexOf('?') != -1 ? '&' : '?';
      request.open("GET", this.readPreferencesUrl + querySeparator + "requestId=" + UUID.randomUUID(), true); 
      request.addEventListener("load", function() {
          if (request.readyState === XMLHttpRequest.DONE
              && request.status === 200) {
            updateJsonPreferences(request.responseText);
          } else {
            preferences.updateDefaultCatalogs();
            preferences.addListeners();
          }
        });
      var errorListener = function(ev) {
          console.log("Can't read preferences from server");
          preferences.updateDefaultCatalogs();
          preferences.addListeners();
        };
      request.addEventListener("error", errorListener);
      request.addEventListener("timeout", errorListener);
      request.timeout = 10000;
      request.send();
    }
  } catch (ex) {
    console.log(ex);
    preferences.updateDefaultCatalogs();    
    preferences.addListeners();
  }
}

/**
 * @private
 */
RecordedUserPreferences.prototype.updateDefaultCatalogs = function() {
  // Delete default pieces of current furniture catalog
  var furnitureCatalog = this.getFurnitureCatalog();
  for (var i = furnitureCatalog.getCategories().length - 1; i >= 0; i--) {
    var category = furnitureCatalog.getCategory(i);
    for (var j = category.getFurniture().length - 1; j >= 0; j--) {
      var piece = category.getPieceOfFurniture(j);
      if (!piece.isModifiable()) {
        furnitureCatalog['delete'](piece); // Can't call delete method directly because delete is a JS reserved word 
      }
    }
  }

  // Add default pieces
  var resourceFurnitureCatalog = typeof DefaultFurnitureCatalog === "function"
      ? (Array.isArray(this.furnitureCatalogUrls)
          ? this.readFurnitureCatalogFromResource(this.furnitureCatalogUrls, this.furnitureResourcesUrlBase)
          : new DefaultFurnitureCatalog(this))
      : new FurnitureCatalog();
  for (var i = 0; i < resourceFurnitureCatalog.getCategories().length; i++) {
    var category = resourceFurnitureCatalog.getCategory(i);
    for (var j = 0; j < category.getFurniture().length; j++) {
      var piece = category.getPieceOfFurniture(j);
      furnitureCatalog.add(category, piece);
    }
  }

  // Delete default textures of current textures catalog
  var texturesCatalog = this.getTexturesCatalog();
  for (var i = texturesCatalog.getCategories().length - 1; i >= 0; i--) {
    var category = texturesCatalog.getCategory(i);
    for (var j = category.getTextures().length - 1; j >= 0; j--) {
      var texture = category.getTexture(j);
      if (!texture.isModifiable()) {
        texturesCatalog['delete'](texture);
      }
    }
  }
  
  // Add default textures
  var resourceTexturesCatalog = typeof DefaultTexturesCatalog === "function"
      ? (Array.isArray(this.texturesCatalogUrls)
          ? this.readTexturesCatalogFromResource(this.texturesCatalogUrls, this.texturesResourcesUrlBase)
          : new DefaultTexturesCatalog(this))
      : new TexturesCatalog();

  for (var i = 0; i < resourceTexturesCatalog.getCategories().length; i++) {
    var category = resourceTexturesCatalog.getCategory(i);
    for (var j = 0; j < category.getTextures().length; j++) {
      var texture = category.getTexture(j);
      texturesCatalog.add(category, texture);
    }
  }
}

/**
 * Returns the furniture catalog contained from the given resources.
 * @param {Array} furnitureCatalogUrls
 * @param {String} furnitureResourcesUrlBase
 * @protected
 */
RecordedUserPreferences.prototype.readFurnitureCatalogFromResource = function(furnitureCatalogUrls, furnitureResourcesUrlBase) {
  return new DefaultFurnitureCatalog(furnitureCatalogUrls, furnitureResourcesUrlBase);
}

/**
 * Returns the textures catalog contained from the the given resources.
 * @param {Array} texturesCatalogUrls
 * @param {String} texturesResourcesUrlBase
 * @protected
 */
RecordedUserPreferences.prototype.readTexturesCatalogFromResource = function(texturesCatalogUrls, texturesResourcesUrlBase) {
  return new DefaultTexturesCatalog(texturesCatalogUrls, texturesResourcesUrlBase);
}

/**
 * Reads modifiable textures catalog from preferences.
 * @param {string, string} properties 
 * @private
 */
RecordedUserPreferences.prototype.readModifiableTexturesCatalog = function(properties) {
  var texture;
  for (var i = 1; (texture = this.readModifiableTexture(properties, i)) != null; i++) {
    if (texture.getImage().getURL() != "") {
      var textureCategory = this.readModifiableTextureCategory(properties, i);
      this.getTexturesCatalog().add(textureCategory, texture);
    }
  }
}

/**
 * Returns the modifiable texture read from <code>properties</code> at the given <code>index</code>.
 * @param {string, string} properties 
 * @param {number} index  the index of the read texture
 * @return the read texture or <code>null</code> if the texture at the given index doesn't exist.
 * @protected
 */
RecordedUserPreferences.prototype.readModifiableTexture = function(properties, index) {
  var name = this.getProperty(properties, RecordedUserPreferences.TEXTURE_NAME + index, null);
  if (name == null) {
    // Return null if key textureName# doesn't exist
    return null;
  }
  var image = URLContent.fromURL(this.getProperty(properties, RecordedUserPreferences.TEXTURE_IMAGE + index, ""));
  var width = parseFloat(this.getProperty(properties, RecordedUserPreferences.TEXTURE_WIDTH + index, "0.1"));
  var height = parseFloat(this.getProperty(properties, RecordedUserPreferences.TEXTURE_HEIGHT + index, "0.1"));
  var creator = this.getProperty(properties, RecordedUserPreferences.TEXTURE_CREATOR + index, null);
  return new CatalogTexture(null, name, image, width, height, creator, true);
}

/**
* Returns the category of a texture at the given <code>index</code>
* read from <code>properties</code>.
 * @param {string, string} properties 
 * @param {number} index  the index of the read texture
 * @protected
*/
RecordedUserPreferences.prototype.readModifiableTextureCategory = function(properties, index) {
  var category = this.getProperty(properties, RecordedUserPreferences.TEXTURE_CATEGORY + index, "");
  return new TexturesCategory(category);
}

/**
 * Writes user preferences to properties, and sends to the <code>writePreferencesUrl</code> (if
 * given at the creation) a JSON content describing preferences.
 */
RecordedUserPreferences.prototype.write = function() {
  UserPreferences.prototype.write.call(this);

  // Write actually preferences only if written properties were updated
  if (this.writtenPropertiesUpdated) {
    var properties = this.getProperties();
    this.writeModifiableTexturesCatalog(properties);
   
    // Write other preferences
    this.setProperty(properties, RecordedUserPreferences.LANGUAGE, this.getLanguage());
    this.setProperty(properties, RecordedUserPreferences.UNIT, this.getLengthUnit().name());
    var currency = this.getCurrency();
    if (currency === null) {
      this.removeProperty(properties, RecordedUserPreferences.CURRENCY);
    } else {
      this.setProperty(properties, RecordedUserPreferences.CURRENCY, currency);
    }
    this.setProperty(properties, RecordedUserPreferences.VALUE_ADDED_TAX_ENABLED, '' + this.isValueAddedTaxEnabled());
    var valueAddedTaxPercentage = this.getDefaultValueAddedTaxPercentage();
    if (valueAddedTaxPercentage === null) {
      this.removeProperty(properties, RecordedUserPreferences.DEFAULT_VALUE_ADDED_TAX_PERCENTAGE);
    } else {
      this.setProperty(properties, RecordedUserPreferences.DEFAULT_VALUE_ADDED_TAX_PERCENTAGE, valueAddedTaxPercentage.toString());
    }
    this.setProperty(properties, RecordedUserPreferences.FURNITURE_CATALOG_VIEWED_IN_TREE, '' + this.isFurnitureCatalogViewedInTree());
    this.setProperty(properties, RecordedUserPreferences.NAVIGATION_PANEL_VISIBLE, '' + this.isNavigationPanelVisible());
    this.setProperty(properties, RecordedUserPreferences.EDITING_IN_3D_VIEW_ENABLED, '' + this.isEditingIn3DViewEnabled());
    this.setProperty(properties, RecordedUserPreferences.AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED, '' + this.isAerialViewCenteredOnSelectionEnabled());
    this.setProperty(properties, RecordedUserPreferences.OBSERVER_CAMERA_SELECTED_AT_CHANGE, '' + this.isObserverCameraSelectedAtChange());
    this.setProperty(properties, RecordedUserPreferences.MAGNETISM_ENABLED, '' + this.isMagnetismEnabled());
    this.setProperty(properties, RecordedUserPreferences.RULERS_VISIBLE, '' + this.isRulersVisible());
    this.setProperty(properties, RecordedUserPreferences.GRID_VISIBLE, '' + this.isGridVisible());
    var defaultFontName = this.getDefaultFontName();
    if (defaultFontName == null) {
      this.removeProperty(properties, RecordedUserPreferences.DEFAULT_FONT_NAME);
    } else {
      this.setProperty(properties, RecordedUserPreferences.DEFAULT_FONT_NAME, defaultFontName);
    }
    this.setProperty(properties, RecordedUserPreferences.FURNITURE_VIEWED_FROM_TOP, '' + this.isFurnitureViewedFromTop());
    this.setProperty(properties, RecordedUserPreferences.FURNITURE_MODEL_ICON_SIZE, '' + this.getFurnitureModelIconSize());
    this.setProperty(properties, RecordedUserPreferences.ROOM_FLOOR_COLORED_OR_TEXTURED, '' + this.isRoomFloorColoredOrTextured());
    this.setProperty(properties, RecordedUserPreferences.WALL_PATTERN, this.getWallPattern().getName());
    var newWallPattern = this.getNewWallPattern();
    if (newWallPattern != null) {
      this.setProperty(properties, RecordedUserPreferences.NEW_WALL_PATTERN, newWallPattern.getName());
    }
    this.setProperty(properties, RecordedUserPreferences.NEW_WALL_THICKNESS, '' + this.getNewWallThickness());
    this.setProperty(properties, RecordedUserPreferences.NEW_WALL_HEIGHT, '' + this.getNewWallHeight());
    this.setProperty(properties, RecordedUserPreferences.NEW_WALL_BASEBOARD_THICKNESS, '' + this.getNewWallBaseboardThickness());
    this.setProperty(properties, RecordedUserPreferences.NEW_WALL_BASEBOARD_HEIGHT, '' + this.getNewWallBaseboardHeight());
    this.setProperty(properties, RecordedUserPreferences.NEW_FLOOR_THICKNESS, '' + this.getNewFloorThickness());
    this.setProperty(properties, RecordedUserPreferences.AUTO_SAVE_DELAY_FOR_RECOVERY, '' + this.getAutoSaveDelayForRecovery());
     // Write recent homes list
    var recentHomes = this.getRecentHomes();
    for (var i = 0; i < recentHomes.length && i < this.getRecentHomesMaxCount(); i++) {
      this.setProperty(properties, RecordedUserPreferences.RECENT_HOMES + (i + 1), recentHomes[i]);
    }
    // Write ignored action tips
    var ignoredActionTipsKeys = Object.keys(this.ignoredActionTips);
    for (var i = 0; i < ignoredActionTipsKeys.length; i++) {
      var key = ignoredActionTipsKeys[i];
      if (this.ignoredActionTips[key]) {
        this.setProperty(properties, RecordedUserPreferences.IGNORED_ACTION_TIP + (i + 1), key);
      }
    }

    if (Object.keys(this.uploadingBlobs).length > 0) {
      var preferences = this;
      // Wait blobs uploading end before trying to write preferences referencing them
      setTimeout(function() {
          preferences.write();
        }, 1000);
    } else {
      this.writtenPropertiesUpdated = false;
      this.writePreferences(properties);
    }
  }
}

/**
 * Sends user preferences stored in properties to backend.
 * @param {string, string} properties
 * @private
 */
RecordedUserPreferences.prototype.writePreferences = function(properties) {
  if (this.writePreferencesUrl) {
    var preferences = this;
    if (this.writingPreferences) {
      // Avoid writing preferences twice at the same time
      setTimeout(function() {
          preferences.writePreferences(properties);
        }, 100);
    } else {
      this.writingPreferences = true;
      var jsonPreferences = JSON.stringify(properties);
      var successHandler = function() {
          if (preferences.writingObserver !== undefined
                && preferences.writingObserver.writeSucceeded) {
            preferences.writingObserver.writeSucceeded(properties);
          }
          setTimeout(function() {
              delete preferences.writingPreferences;
            }, 500);
        };
      var errorHandler = function(status, error) {
          if (preferences.writingObserver !== undefined
              && preferences.writingObserver.writeFailed) {
            preferences.writingObserver.writeFailed(properties, status, error);
          }
          setTimeout(function() {
              delete preferences.writingPreferences;
              // Retry
              preferences.writePreferences(properties);
            }, 10000);
        };
        
      if (this.writePreferencesUrl.indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) === 0) {
        try {
          var key = this.writePreferencesUrl.substring(LocalStorageURLContent.LOCAL_STORAGE_PREFIX.length);
          localStorage.setItem(key, jsonPreferences);
          successHandler();
          delete preferences.writingPreferences;
        } catch (ex) {
          errorHandler(ex, ex.message);
        }
      } else if (this.writePreferencesUrl.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) === 0) {
        var preferencesContent = new BlobURLContent(new Blob([jsonPreferences], { type: 'application/json' }));
        preferencesContent.writeBlob(this.writePreferencesUrl, "", {
            blobSaved: function(content, name) {
              URL.revokeObjectURL(preferencesContent.getURL());
              successHandler();
            },
            blobError : function(status, error) {
              URL.revokeObjectURL(preferencesContent.getURL());
              errorHandler(status, error);
            }
         });
      } else {
        var request = new XMLHttpRequest();
        var querySeparator = this.writePreferencesUrl.indexOf('?') != -1 ? '&' : '?';
        request.open("POST", this.writePreferencesUrl + querySeparator + "updateId=" + UUID.randomUUID(), true);
        request.addEventListener('load', function (ev) {
            if (request.readyState === XMLHttpRequest.DONE) {
              if (request.status === 200) {
                successHandler();
              } else {
                errorHandler(request.status, request.responseText);
              }
            }
          });
        var errorListener = function(ev) {
            errorHandler(0, "Can't post " + preferences.writePreferencesUrl);
          };
        request.addEventListener("error", errorListener);
        request.addEventListener("timeout", errorListener);
        request.send(jsonPreferences);
      }
    }
  }
}

/**
 * Sets which action tip should be ignored.
 * @ignore
 */
RecordedUserPreferences.prototype.setActionTipIgnored = function(actionKey) {
  this.ignoredActionTips[actionKey] = true;
  UserPreferences.prototype.setActionTipIgnored.call(this, actionKey);
}

/**
 * Returns whether an action tip should be ignored or not.
 * @ignore
 */
RecordedUserPreferences.prototype.isActionTipIgnored = function(actionKey) {
  var ignoredActionTip = this.ignoredActionTips[actionKey];
  return ignoredActionTip === true;
}

/**
 * Resets the display flag of action tips.
 * @ignore
 */
RecordedUserPreferences.prototype.resetIgnoredActionTips = function() {
  var keys = Object.keys(this.ignoredActionTips);
  for (var i = 0; i < keys.length; i++) {
    this.ignoredActionTips[keys[i]] = false;
  }
  UserPreferences.prototype.resetIgnoredActionTips.call(this);
}

/**
 * Throws an exception because these user preferences can't manage language libraries.
 * @ignore
 */
RecordedUserPreferences.prototype.addLanguageLibrary = function(location) {
  throw new UnsupportedOperationException();
}

/**
 * Throws an exception because these user preferences can't manage additional language libraries.
 * @ignore
 */
RecordedUserPreferences.prototype.languageLibraryExists = function(location) {
  throw new UnsupportedOperationException();
}

/**
 * Returns <code>true</code> if the furniture library at the given <code>location</code> exists.
 * @ignore
 */
RecordedUserPreferences.prototype.furnitureLibraryExists = function(location) {
  throw new UnsupportedOperationException();
}

/**
 * Throws an exception because these user preferences can't manage additional furniture libraries.
 * @ignore
 */
RecordedUserPreferences.prototype.addFurnitureLibrary = function(location) {
  throw new UnsupportedOperationException();
}

/**
 * Returns <code>true</code> if the textures library at the given <code>location</code> exists.
 * @ignore
 */
RecordedUserPreferences.prototype.texturesLibraryExists = function(location) {
  throw new UnsupportedOperationException();
}

/**
 * Throws an exception because these user preferences can't manage additional textures libraries.
 * @ignore
 */
RecordedUserPreferences.prototype.addTexturesLibrary = function(location) {
  throw new UnsupportedOperationException();
}

/**
 * Throws an exception because these user preferences don't manage additional libraries.
 * @ignore
 */
RecordedUserPreferences.prototype.getLibraries = function() {
  throw new UnsupportedOperationException();
}

/**
 * Save modifiable textures to catalog.json and upload new resources.
 * @param {string, string} properties 
 * @private
 */
RecordedUserPreferences.prototype.writeModifiableTexturesCatalog = function(properties) {
  if (this.writeResourceUrl && this.readResourceUrl) {
    var index = 1;
    var texturesCatalog = this.getTexturesCatalog();
    var preferences = this;
    for (var i = 0; i < texturesCatalog.getCategoriesCount(); i++) {
      var textureCategory = texturesCatalog.getCategory(i);
      for (var j = 0; j < textureCategory.getTexturesCount(); j++) {
        var catalogTexture = textureCategory.getTexture(j);
        var textureImage = catalogTexture.getImage();
        if (catalogTexture.isModifiable() 
            && textureImage instanceof URLContent) {
          this.setProperty(properties, RecordedUserPreferences.TEXTURE_NAME + index, catalogTexture.getName());
          this.setProperty(properties, RecordedUserPreferences.TEXTURE_CATEGORY + index, textureCategory.getName());
          this.setProperty(properties, RecordedUserPreferences.TEXTURE_WIDTH + index, catalogTexture.getWidth());
          this.setProperty(properties, RecordedUserPreferences.TEXTURE_HEIGHT + index, catalogTexture.getHeight());
          if (catalogTexture.getCreator() != null) {
            this.setProperty(properties, RecordedUserPreferences.TEXTURE_CREATOR + index, catalogTexture.getCreator());
          } else {
            this.removeProperty(properties, RecordedUserPreferences.TEXTURE_CREATOR + index);
          }
  
          if (textureImage instanceof LocalURLContent
              && (!(textureImage instanceof LocalStorageURLContent)
                  || this.writeResourceUrl.indexOf(LocalStorageURLContent.LOCAL_STORAGE_PREFIX) < 0)
              && (!(textureImage instanceof IndexedDBURLContent)
                  || this.writeResourceUrl.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) < 0)) {
            if (!this.isSavedContentInResourceScope(textureImage)) {
              var textureImageFileName = this.uploadingBlobs[textureImage.getURL()];
              if (textureImageFileName === undefined) {
                textureImage.getBlob({
                    textureImage: textureImage, 
                    blobReady: function(blob) {
                      textureImageFileName = UUID.randomUUID();
                      preferences.uploadingBlobs[this.textureImage.getURL()] = textureImageFileName;
                      var imageExtension = blob.type == "image/png" ? ".png" : ".jpg";
                      var loadListener = function(textureImage, fileName, textureIndex) {
                          if (!preferences.isSavedContentInResourceScope(textureImage)) {
                            var savedContent = URLContent.fromURL(
                                CoreTools.format(preferences.readResourceUrl.replace(/(%[^s])/g, "%$1"), encodeURIComponent(fileName)));
                            textureImage.setSavedContent(savedContent);
                          }
                          delete preferences.uploadingBlobs[textureImage.getURL()];
                          preferences.setProperty(properties, RecordedUserPreferences.TEXTURE_IMAGE + textureIndex, textureImage.getSavedContent().getURL());
                        };
                      preferences.writeResource(textureImage, textureImageFileName + imageExtension, index, loadListener);
                    },
                    blobError: function(status, error) {
                      contentsObserver.resourcesError(status, error);
                    }
                });    
              }
            } else {
              // Always update uploading blobs map because blob may have been saved elsewhere
              delete preferences.uploadingBlobs[textureImage.getURL()];
              this.setProperty(properties, RecordedUserPreferences.TEXTURE_IMAGE + index, textureImage.getSavedContent().getURL());
            }
          } else if (textureImage instanceof URLContent) {
            this.setProperty(properties, RecordedUserPreferences.TEXTURE_IMAGE + index, textureImage.getURL());
          }
          index++;
        }
      }
    }
    
    // Remove obsolete keys
    for ( ; this.getProperty(properties, RecordedUserPreferences.TEXTURE_NAME + index, null) != null; index++) {
      this.removeProperty(properties, RecordedUserPreferences.TEXTURE_NAME + index);
      this.removeProperty(properties, RecordedUserPreferences.TEXTURE_IMAGE + index);
      this.removeProperty(properties, RecordedUserPreferences.TEXTURE_CATEGORY + index);
      this.removeProperty(properties, RecordedUserPreferences.TEXTURE_WIDTH + index);
      this.removeProperty(properties, RecordedUserPreferences.TEXTURE_HEIGHT + index);
      this.removeProperty(properties, RecordedUserPreferences.TEXTURE_CREATOR + index);
    }
  }
}

/**
 * Returns <code>true</code> if the saved content of the given content exists 
 * and depends on the scope where the resources managed by preferences are saved.
 * @param {URLContent} urlContent  content
 * @private
 */
RecordedUserPreferences.prototype.isSavedContentInResourceScope = function(urlContent) {
  var savedContent = urlContent.getSavedContent();
  return savedContent !== null
      && (!(savedContent instanceof IndexedDBURLContent)
          || this.writeResourceUrl.indexOf(IndexedDBURLContent.INDEXED_DB_PREFIX) < 0
          || savedContent.getURL().indexOf(this.writeResourceUrl.substring(0, this.writeResourceUrl.indexOf('?'))) === 0);
}

/**
 * @param {BlobURLContent} urlContent  blob content
 * @param {string} path unique file name of the written resource
 * @param {number} index
 * @param {function()} loadListener called when content is uploaded
 * @private
 */
RecordedUserPreferences.prototype.writeResource = function(urlContent, path, index, loadListener) {
  var preferences = this;
  urlContent.writeBlob(this.writeResourceUrl, path, {
      blobSaved: function(content, name) {
        if (preferences.writingObserver !== undefined
            && preferences.writingObserver.writeSucceeded) {
          preferences.writingObserver.writeSucceeded(content.getBlob());
        }
        loadListener(content, path, index);
      },
      blobError : function(status, error) {
         if (preferences.writingObserver !== undefined
              && preferences.writingObserver.writeFailed) {
           preferences.writingObserver.writeFailed(urlContent.getBlob(), status, error);
         }
         // In case of error, wait 10s before attempting a new upload
         setTimeout(function() {
             // Check it wasn't saved elsewhere
             if (urlContent.getSavedContent() === null) {
               preferences.writeResource(urlContent, path, index, loadListener);
             } else {
               loadListener(urlContent, index);
             }
           }, 10000);
      }
    });
}
