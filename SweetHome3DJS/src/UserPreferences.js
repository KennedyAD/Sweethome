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

/**
 * @type {FurnitureCatalog}
 */
  this.furnitureCatalog = null;
/**
 * @type {TexturesCatalog}
 */
  this.texturesCatalog = null;
/**
 * @type {PatternsCatalog}
 */
  this.patternsCatalog = null;
  this.currency = null;
  this.valueAddedTaxEnabled = false
  this.defaultValueAddedTaxPercentage = null;
/**
 * @type {LengthUnit}
 */
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
/**
 * @type {TextureImage}
 */
  this.wallPattern = null;
/**
 * @type {TextureImage}
 */
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

  this.ignoredActionTips = {};
}

UserPreferences.DEFAULT_SUPPORTED_LANGUAGES = ["bg", "cs", "de", "el", "en", "es", "fr", "it", "ja", "hu", "nl", "pl", "pt", "ru", "sv", "vi", "zh_CN", "zh_TW"];

UserPreferences.DEFAULT_TEXT_STYLE = new TextStyle(18);
UserPreferences.DEFAULT_ROOM_TEXT_STYLE = new TextStyle(24);

UserPreferences.CURRENCIES = {
  EUR: 'EUR €',
  AED: 'AED AED',
  AFN: 'AFN ؋',
  ALL: 'ALL Lekë',
  AMD: 'AMD ֏',
  ANG: 'ANG NAf.',
  AOA: 'AOA Kz',
  ARS: 'ARS $',
  AUD: 'AUD $',
  AWG: 'AWG Afl.',
  AZN: 'AZN ₼',
  BAM: 'BAM KM',
  BBD: 'BBD $',
  BDT: 'BDT ৳',
  BGN: 'BGN лв.',
  BHD: 'BHD د.ب.‏',
  BIF: 'BIF FBu',
  BMD: 'BMD $',
  BND: 'BND $',
  BOB: 'BOB Bs',
  BRL: 'BRL R$',
  BSD: 'BSD $',
  BTN: 'BTN Nu.',
  BWP: 'BWP P',
  BYN: 'BYN Br',
  BZD: 'BZD $',
  CAD: 'CAD $',
  CDF: 'CDF FC',
  CHF: 'CHF CHF',
  CLP: 'CLP $',
  CNY: 'CNY ￥',
  COP: 'COP $',
  CRC: 'CRC ₡',
  CSD: 'CSD CSD',
  CUP: 'CUP $',
  CVE: 'CVE ​',
  CZK: 'CZK Kč',
  DJF: 'DJF Fdj',
  DKK: 'DKK kr',
  DOP: 'DOP RD$',
  DZD: 'DZD DA',
  EGP: 'EGP ج.م.‏',
  ERN: 'ERN Nfk',
  ETB: 'ETB Br',
  EUR: 'EUR €',
  FJD: 'FJD $',
  FKP: 'FKP £',
  GBP: 'GBP £',
  GEL: 'GEL ₾',
  GHS: 'GHS GH₵',
  GIP: 'GIP £',
  GMD: 'GMD D',
  GNF: 'GNF FG',
  GTQ: 'GTQ Q',
  GYD: 'GYD $',
  HKD: 'HKD HK$',
  HNL: 'HNL L',
  HRK: 'HRK HRK',
  HTG: 'HTG G',
  HUF: 'HUF Ft',
  IDR: 'IDR Rp',
  ILS: 'ILS ₪',
  INR: 'INR ₹',
  IQD: 'IQD د.ع.‏',
  IRR: 'IRR IRR',
  ISK: 'ISK ISK',
  JMD: 'JMD $',
  JOD: 'JOD د.أ.‏',
  JPY: 'JPY ￥',
  KES: 'KES Ksh',
  KGS: 'KGS сом',
  KHR: 'KHR ៛',
  KMF: 'KMF CF',
  KPW: 'KPW KPW',
  KRW: 'KRW ₩',
  KWD: 'KWD د.ك.‏',
  KYD: 'KYD $',
  KZT: 'KZT ₸',
  LAK: 'LAK ₭',
  LBP: 'LBP ل.ل.‏',
  LKR: 'LKR Rs.',
  LRD: 'LRD $',
  LSL: 'LSL LSL',
  LYD: 'LYD د.ل.‏',
  MAD: 'MAD MAD',
  MDL: 'MDL L',
  MGA: 'MGA Ar',
  MKD: 'MKD den',
  MMK: 'MMK K',
  MNT: 'MNT ₮',
  MOP: 'MOP MOP$',
  MRU: 'MRU UM',
  MUR: 'MUR Rs',
  MWK: 'MWK MK',
  MXN: 'MXN $',
  MYR: 'MYR RM',
  MZN: 'MZN MTn',
  NAD: 'NAD $',
  NGN: 'NGN ₦',
  NIO: 'NIO C$',
  NOK: 'NOK kr',
  NPR: 'NPR नेरू',
  NZD: 'NZD $',
  OMR: 'OMR ر.ع.‏',
  PAB: 'PAB B/.',
  PEN: 'PEN S/',
  PGK: 'PGK K',
  PHP: 'PHP ₱',
  PKR: 'PKR ر',
  PLN: 'PLN zł',
  PYG: 'PYG Gs.',
  QAR: 'QAR ر.ق.‏',
  RON: 'RON RON',
  RSD: 'RSD RSD',
  RUB: 'RUB ₽',
  RWF: 'RWF RF',
  SAR: 'SAR ر.س.‏',
  SBD: 'SBD $',
  SCR: 'SCR SR',
  SDG: 'SDG SDG',
  SEK: 'SEK kr',
  SGD: 'SGD $',
  SHP: 'SHP £',
  SLL: 'SLL Le',
  SOS: 'SOS S',
  SRD: 'SRD $',
  SSP: 'SSP £',
  STN: 'STN Db',
  SVC: 'SVC C',
  SYP: 'SYP LS',
  SZL: 'SZL E',
  THB: 'THB ฿',
  TJS: 'TJS сом.',
  TMT: 'TMT TMT',
  TND: 'TND DT',
  TOP: 'TOP T$',
  TRY: 'TRY ₺',
  TTD: 'TTD $',
  TWD: 'TWD $',
  TZS: 'TZS TSh',
  UAH: 'UAH ₴',
  UGX: 'UGX USh',
  USD: 'USD $',
  UYU: 'UYU $',
  UZS: 'UZS сўм',
  VES: 'VES Bs.S',
  VND: 'VND ₫',
  VUV: 'VUV VT',
  WST: 'WST WS$',
  XAF: 'XAF FCFA',
  XCD: 'XCD $',
  XOF: 'XOF CFA',
  XPF: 'XPF FCFP',
  YER: 'YER ر.ي.‏',
  ZAR: 'ZAR R',
  ZMW: 'ZMW K',
  ZWL: 'ZWL ZWL'
};

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
  } else   if (resourceClass == "DefaultTexturesCatalog") {
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
  this.currency = currency;
  if (currency != this.currency) {
    var oldCurrency = this.currency;
    this.currency = currency;
    this.propertyChangeSupport.firePropertyChange("LANGUAGE", oldCurrency, currency);
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
 * Default user preferences.
 * @param {string[]|boolean}       [furnitureCatalogUrls]
 * @param {string|UserPreferences} [furnitureResourcesUrlBase]
 * @param {string[]} [texturesCatalogUrls]
 * @param {string}   [texturesResourcesUrlBase]
 * @param {string}   [writeResourceURL] URL to which upload new resource files
 * @constructor
 * @extends UserPreferences
 * @author Emmanuel Puybaret
 */
function DefaultUserPreferences(furnitureCatalogUrls, furnitureResourcesUrlBase, 
                                texturesCatalogUrls, texturesResourcesUrlBase, 
                                userResourcesURLBase, writeResourceURL) {
  UserPreferences.call(this);

  this.furnitureCatalogUrls = furnitureCatalogUrls;
  this.furnitureResourcesUrlBase = furnitureResourcesUrlBase;
  this.texturesCatalogUrls = texturesCatalogUrls;
  this.texturesResourcesUrlBase = texturesResourcesUrlBase;
  this.userResourcesURLBase = userResourcesURLBase;
  this.writeResourceURL = writeResourceURL;
  
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
  this.setTexturesCatalog(typeof DefaultTexturesCatalog === "function"
      ? (Array.isArray(texturesCatalogUrls)
           ? new DefaultTexturesCatalog(this, texturesCatalogUrls, texturesResourcesUrlBase) 
           : new DefaultTexturesCatalog(this))
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

/**
 * User's preferences, synchronized with a backend.
 * @param {string[]|boolean}       [furnitureCatalogUrls]
 * @param {string|UserPreferences} [furnitureResourcesUrlBase]
 * @param {string[]} [texturesCatalogUrls]
 * @param {string}   [texturesResourcesUrlBase]
 * @param {string}   [writeResourceURL] URL to which upload new resource files
 * @param {string}   [writePreferencesURL] URL to which upload preference file
 * @param {string}   [readPreferencesURL] URL from which download the preference file
 * @constructor
 * @extends UserPreferences
 * @author Louis Grignon
 */
function RecordedUserPreferences(furnitureCatalogUrls, furnitureResourcesUrlBase,
                                texturesCatalogUrls, texturesResourcesUrlBase,
                                userResourcesURLBase, writeResourceURL,
                                writePreferencesURL, readPreferencesURL) {
  UserPreferences.call(this);

  this.furnitureCatalogUrls = furnitureCatalogUrls;
  this.furnitureResourcesUrlBase = furnitureResourcesUrlBase;
  this.texturesCatalogUrls = texturesCatalogUrls;
  this.texturesResourcesUrlBase = texturesResourcesUrlBase;
  this.userResourcesURLBase = userResourcesURLBase;
  this.writeResourceURL = writeResourceURL;
  this.writePreferencesURL = writePreferencesURL;
  this.readPreferencesURL = readPreferencesURL;

  this.readPreferences();
  this.onReadPreferencesDone();
};

RecordedUserPreferences.prototype = Object.create(UserPreferences.prototype);
RecordedUserPreferences.prototype.constructor = RecordedUserPreferences;

RecordedUserPreferences.PROPERTIES = {
  LANGUAGE                                  : "language",
  UNIT                                      : "unit",
  CURRENCY                                  : "currency",
  VALUE_ADDED_TAX_ENABLED                   : "valueAddedTaxEnabled",
  DEFAULT_VALUE_ADDED_TAX_PERCENTAGE        : "defaultValueAddedTaxPercentage",
  FURNITURE_CATALOG_VIEWED_IN_TREE          : "furnitureCatalogViewedInTree",
  NAVIGATION_PANEL_VISIBLE                  : "navigationPanelVisible",
  AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED : "aerialViewCenteredOnSelectionEnabled",
  OBSERVER_CAMERA_SELECTED_AT_CHANGE        : "observerCameraSelectedAtChange",
  MAGNETISM_ENABLED                         : "magnetismEnabled",
  RULERS_VISIBLE                            : "rulersVisible",
  GRID_VISIBLE                              : "gridVisible",
  DEFAULT_FONT_NAME                         : "defaultFontName",
  FURNITURE_VIEWED_FROM_TOP                 : "furnitureViewedFromTop",
  FURNITURE_MODEL_ICON_SIZE                 : "furnitureModelIconSize",
  ROOM_FLOOR_COLORED_OR_TEXTURED            : "roomFloorColoredOrTextured",
  WALL_PATTERN                              : "wallPattern",
  NEW_WALL_PATTERN                          : "newWallPattern",
  NEW_WALL_THICKNESS                        : "newWallThickness",
  NEW_WALL_HEIGHT                           : "newHomeWallHeight",
  NEW_FLOOR_THICKNESS                       : "newFloorThickness",
  RECENT_HOMES                              : "recentHomes#",
  IGNORED_ACTION_TIP                        : "ignoredActionTip#",
  TEXTURE_NAME                              : "textureName#",
  TEXTURE_CREATOR                           : "textureCreator#",
  TEXTURE_CATEGORY                          : "textureCategory#",
  TEXTURE_IMAGE                             : "textureImage#",
  TEXTURE_WIDTH                             : "textureWidth#",
  TEXTURE_HEIGHT                            : "textureHeight#"
};

/**
 * Returns value of property in internal properties map, and return defaultValue if value is null or undefined
 *
 * @param {string} propertyKey
 * @param {any} [defaultValue]
 *
 * @return {any} property's value
 *
 * @private
 */
RecordedUserPreferences.prototype.getProperty = function(propertyKey, defaultValue) {
  if (this.properties[propertyKey] === undefined || this.properties[propertyKey] === null) {
    return defaultValue;
  }
  return this.properties[propertyKey];
};

/**
 * Sets value of a property in internal properties map
 *
 * @param {string} propertyKey
 * @param {any} propertyValue
 *
 * @private
 */
RecordedUserPreferences.prototype.setProperty = function(propertyKey, propertyValue) {
  this.properties[propertyKey] = propertyValue;
};

/**
 * Loads saved preferences in this object's properties, from backend
 * @private
 */
RecordedUserPreferences.prototype.onReadPreferencesDone = function() {
  var PROPERTIES = RecordedUserPreferences.PROPERTIES;
  var preferences = this;

  var language = this.properties[PROPERTIES.LANGUAGE];
  if (language == null) {
    language = "en";
  }
  this.setLanguage(language);

  // Read default furniture and textures catalog
  this.setFurnitureCatalog(new FurnitureCatalog());
  this.setTexturesCatalog(new TexturesCatalog());
  this.updateDefaultCatalogs();

  var defaultPreferences = new DefaultUserPreferences(this.furnitureCatalogUrls, this.furnitureResourcesUrlBase,
    this.texturesCatalogUrls, this.texturesResourcesUrlBase, this.userResourcesURLBase, this.writeResourceURL);
  defaultPreferences.setLanguage(this.getLanguage());

  // Fill default patterns catalog
  var patternsCatalog = defaultPreferences.getPatternsCatalog();
  this.setPatternsCatalog(patternsCatalog);

  // Read other preferences
  var unit = LengthUnit[this.getProperty(PROPERTIES.UNIT)];
  if (!unit) {
    unit = defaultPreferences.getLengthUnit();
  }
  this.setUnit(unit);

  this.setCurrency(this.getProperty(PROPERTIES.CURRENCY));
  this.setValueAddedTaxEnabled(this.getProperty(PROPERTIES.VALUE_ADDED_TAX_ENABLED) == 'true');
  this.setDefaultValueAddedTaxPercentage(this.getProperty(PROPERTIES.DEFAULT_VALUE_ADDED_TAX_PERCENTAGE) == null ? null : parseFloat(this.getProperty(PROPERTIES.DEFAULT_VALUE_ADDED_TAX_PERCENTAGE)));
  this.setFurnitureModelIconSize(this.getProperty(PROPERTIES.FURNITURE_MODEL_ICON_SIZE) == null ? null : parseFloat(this.getProperty(PROPERTIES.FURNITURE_MODEL_ICON_SIZE)));

  this.setFurnitureCatalogViewedInTree(
    this.getProperty(PROPERTIES.FURNITURE_CATALOG_VIEWED_IN_TREE, '' + defaultPreferences.isFurnitureCatalogViewedInTree()) == 'true'
  );
  this.setNavigationPanelVisible(
    this.getProperty(PROPERTIES.NAVIGATION_PANEL_VISIBLE, '' + defaultPreferences.isNavigationPanelVisible()) == 'true'
  );
  this.setAerialViewCenteredOnSelectionEnabled(
    this.getProperty(
      PROPERTIES.AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED,
      '' + defaultPreferences.isAerialViewCenteredOnSelectionEnabled()
    ) == 'true'
  );
  this.setObserverCameraSelectedAtChange(
    this.getProperty(PROPERTIES.OBSERVER_CAMERA_SELECTED_AT_CHANGE, '' + defaultPreferences.isObserverCameraSelectedAtChange()) == 'true'
  );
  this.setMagnetismEnabled(
    this.getProperty(PROPERTIES.MAGNETISM_ENABLED, 'true') == 'true'
  );
  this.setRulersVisible(
    this.getProperty(PROPERTIES.RULERS_VISIBLE, '' + defaultPreferences.isMagnetismEnabled()) == 'true'
  );
  this.setGridVisible(
    this.getProperty(PROPERTIES.GRID_VISIBLE, '' + defaultPreferences.isGridVisible()) == 'true'
  );
  this.setDefaultFontName(this.getProperty(PROPERTIES.DEFAULT_FONT_NAME, defaultPreferences.getDefaultFontName()));
  this.setFurnitureViewedFromTop(
    this.getProperty(PROPERTIES.FURNITURE_VIEWED_FROM_TOP, '' + defaultPreferences.isFurnitureViewedFromTop()) == 'true'
  );
  this.setFloorColoredOrTextured(
    this.getProperty(PROPERTIES.ROOM_FLOOR_COLORED_OR_TEXTURED, '' + defaultPreferences.isRoomFloorColoredOrTextured()) == 'true'
  );

  try {
    this.setWallPattern(patternsCatalog.getPattern(this.getProperty(PROPERTIES.WALL_PATTERN, defaultPreferences.getWallPattern().getName())));
  } catch (ex) {
    // Ensure wall pattern always exists even if new patterns are added in future versions
    this.setWallPattern(defaultPreferences.getWallPattern());
  }

  try {
    if (defaultPreferences.getNewWallPattern() != null) {
      this.setNewWallPattern(patternsCatalog.getPattern(this.getProperty(PROPERTIES.NEW_WALL_PATTERN,
        defaultPreferences.getNewWallPattern().getName())));
    }
  } catch (ex) {
    // Keep new wall pattern unchanged
  }

  this.setNewWallThickness(parseFloat(this.getProperty(PROPERTIES.NEW_WALL_THICKNESS,
    '' + defaultPreferences.getNewWallThickness())));
  this.setNewWallHeight(parseFloat(this.getProperty(PROPERTIES.NEW_WALL_HEIGHT,
    '' + defaultPreferences.getNewWallHeight())));
  this.setNewWallBaseboardThickness(defaultPreferences.getNewWallBaseboardThickness());
  this.setNewWallBaseboardHeight(defaultPreferences.getNewWallBaseboardHeight());
  this.setNewFloorThickness(parseFloat(this.getProperty(PROPERTIES.NEW_FLOOR_THICKNESS,
    '' + defaultPreferences.getNewFloorThickness())));
  this.setCurrency(defaultPreferences.getCurrency());
  // Read recent homes list
  var recentHomes = [];
  for (var i = 1; i <= this.getRecentHomesMaxCount(); i++) {
    var recentHome = this.getProperty(PROPERTIES.RECENT_HOMES + i);
    if (recentHome != null) {
      recentHomes.add(recentHome);
    }
  }
  this.setRecentHomes(recentHomes);

  // Read ignored action tips
  for (var i = 1; ; i++) {
    var ignoredActionTip = this.getProperty(PROPERTIES.IGNORED_ACTION_TIP + i, "");
    if (ignoredActionTip.length == 0) {
      break;
    } else {
      this.ignoredActionTips[ignoredActionTip] = true;
    }
  }

  this.addPropertyChangeListener('LANGUAGE', function() {
    preferences.updateDefaultCatalogs();
  });

  // Add a listener to track written properties and ignore the other ones during a call to write
  var savedPropertyListener = function() {
      preferences.writtenPropertiesUpdated = true;
  };
  var writtenProperties = ["LANGUAGE", "UNIT", "CURRENCY", "VALUE_ADDED_TAX_ENABLED", "DEFAULT_VALUE_ADDED_TAX_PERCENTAGE",
    "FURNITURE_CATALOG_VIEWED_IN_TREE", "NAVIGATION_PANEL_VISIBLE", 'DEFAULT_FONT_NAME', "AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED",
    "OBSERVER_CAMERA_SELECTED_AT_CHANGE", "MAGNETISM_ENABLED", "GRID_VISIBLE", "FURNITURE_VIEWED_FROM_TOP",
    "FURNITURE_MODEL_ICON_SIZE", "ROOM_FLOOR_COLORED_OR_TEXTURED", "NEW_WALL_PATTERN", "NEW_WALL_THICKNESS",
    "NEW_WALL_HEIGHT", "NEW_FLOOR_THICKNESS", "TEXTURE_NAME", "TEXTURE_CREATOR", "TEXTURE_CATEGORY", "TEXTURE_IMAGE",
    "TEXTURE_WIDTH", "TEXTURE_HEIGHT"];
  for (var i = 0; i < writtenProperties.length; i++) {
    var writtenProperty = writtenProperties[i];
    this.addPropertyChangeListener(writtenProperty, savedPropertyListener);
  }
};

/**
 * Loads saved preferences from backend to this object's properties field
 * @private
 */
RecordedUserPreferences.prototype.readPreferences = function() {
  var properties = this.properties = {};
  if (this.readPreferencesURL) {
    try {
      var timestampQueryStringSeparator = this.readPreferencesURL.indexOf('?') > -1 ? '&' : '?';
      var responseText = null;
      var request = new XMLHttpRequest();
      request.open("GET", this.readPreferencesURL + timestampQueryStringSeparator + Date.now().toString(), false);
      request.onload = function() {
        responseText = request.responseText;
      };
      request.send();

      if (responseText) {
        console.debug("load preferences from data", responseText);
        var preferencesData = JSON.parse(responseText);

        var propertiesKeys = Object.values(RecordedUserPreferences.PROPERTIES);
        for (var i = 0; i < propertiesKeys.length; i++) {
          var propertyKey = propertiesKeys[i];
          var propertyValue = preferencesData[propertyKey];
          if (propertyValue !== undefined) {
            properties[propertyKey] = propertyValue;
          }
        }
        console.info("preferences read DONE", properties);
      }
    } catch(e) {
        // proceed anyway
    }
  }
};

/**
 * @private
 */
RecordedUserPreferences.prototype.updateDefaultCatalogs = function() {
  // Delete default pieces of current furniture catalog
  var furnitureCatalog = this.getFurnitureCatalog();
  for (var i = 0; i < furnitureCatalog.getCategories().length; i++) {
    var category = furnitureCatalog.getCategory(i);
    for (var j = 0; j < category.getFurniture().length; j++) {
      var piece = category.getPieceOfFurniture(j);
      if (!piece.isModifiable()) {
        furnitureCatalog['delete'](piece);
      }
    }
  }

  // Add default pieces
  var defaultFurnitureCatalog = typeof DefaultFurnitureCatalog === "function"
    ? (Array.isArray(this.furnitureCatalogUrls)
      ? new DefaultFurnitureCatalog(this.furnitureCatalogUrls, this.furnitureResourcesUrlBase)
      : new DefaultFurnitureCatalog(this))
    : new FurnitureCatalog();
  for (var i = 0; i < defaultFurnitureCatalog.getCategories().length; i++) {
    var category = defaultFurnitureCatalog.getCategory(i);
    for (var j = 0; j < category.getFurniture().length; j++) {
      var piece = category.getPieceOfFurniture(j);
      furnitureCatalog.add(category, piece);
    }
  }

  // Delete default textures of current textures catalog
  var texturesCatalog = this.getTexturesCatalog();
  for (var i = 0; i < texturesCatalog.getCategories().length; i++) {
    var category = texturesCatalog.getCategory(i);
    for (var j = 0; j < category.getTextures().length; j++) {
      var texture = category.getTexture(j);
      if (!texture.isModifiable()) {
        texturesCatalog['delete'](texture);
      }
    }
  }
  // Add default textures
  var defaultTexturesCatalog = typeof DefaultTexturesCatalog === "function"
    ? (Array.isArray(this.texturesCatalogUrls)
      ? new DefaultTexturesCatalog(this, this.texturesCatalogUrls, this.texturesResourcesUrlBase)
      : new DefaultTexturesCatalog(this))
    : new TexturesCatalog();

  for (var i = 0; i < defaultTexturesCatalog.getCategories().length; i++) {
    var category = defaultTexturesCatalog.getCategory(i);
    for (var j = 0; j < category.getTextures().length; j++) {
      var texture = category.getTexture(j);
      texturesCatalog.add(category, texture);
    }
  }
}

/**
 * Writes user preferences to properties, and sends to the <code>writePreferencesURL</code> (if
 * given at the creation) a JSON content describing preferences in a parameter named preferences.
 * @override
 */
RecordedUserPreferences.prototype.write = function() {
  UserPreferences.prototype.write.call(this);

  if (this.writeResourceURL) {
    this.saveTexturesCatalog();
  }

  if (this.writtenPropertiesUpdated) {
    // Write actually preferences only if written properties were updated
    this.writtenPropertiesUpdated = false;

    var PROPERTIES = RecordedUserPreferences.PROPERTIES;
    // Write other preferences
    this.setProperty(PROPERTIES.LANGUAGE, this.getLanguage());

    this.setProperty(PROPERTIES.CURRENCY, this.getCurrency());
    this.setProperty(PROPERTIES.VALUE_ADDED_TAX_ENABLED, '' + this.isValueAddedTaxEnabled());
    this.setProperty(PROPERTIES.DEFAULT_VALUE_ADDED_TAX_PERCENTAGE, this.getDefaultValueAddedTaxPercentage() == null ? null : '' + this.getDefaultValueAddedTaxPercentage());
    this.setProperty(PROPERTIES.FURNITURE_MODEL_ICON_SIZE, this.getFurnitureModelIconSize() == null ? null : '' + this.getFurnitureModelIconSize());

    this.setProperty(PROPERTIES.UNIT, this.getLengthUnit().name());
    this.setProperty(PROPERTIES.FURNITURE_CATALOG_VIEWED_IN_TREE, '' + this.isFurnitureCatalogViewedInTree());
    this.setProperty(PROPERTIES.NAVIGATION_PANEL_VISIBLE, '' + this.isNavigationPanelVisible());
    this.setProperty(PROPERTIES.AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED, '' + this.isAerialViewCenteredOnSelectionEnabled());
    this.setProperty(PROPERTIES.OBSERVER_CAMERA_SELECTED_AT_CHANGE, '' + this.isObserverCameraSelectedAtChange());
    this.setProperty(PROPERTIES.MAGNETISM_ENABLED, '' + this.isMagnetismEnabled());
    this.setProperty(PROPERTIES.RULERS_VISIBLE, '' + this.isRulersVisible());
    this.setProperty(PROPERTIES.GRID_VISIBLE, '' + this.isGridVisible());
    var defaultFontName = this.getDefaultFontName();
    if (defaultFontName == null) {
      delete this.properties[PROPERTIES.DEFAULT_FONT_NAME];
    } else {
      this.setProperty(PROPERTIES.DEFAULT_FONT_NAME, defaultFontName);
    }
    this.setProperty(PROPERTIES.FURNITURE_VIEWED_FROM_TOP, '' + this.isFurnitureViewedFromTop());
    this.setProperty(PROPERTIES.ROOM_FLOOR_COLORED_OR_TEXTURED, '' + this.isRoomFloorColoredOrTextured());
    this.setProperty(PROPERTIES.WALL_PATTERN, this.getWallPattern().getName());
    var newWallPattern = this.getNewWallPattern();
    if (newWallPattern != null) {
      this.setProperty(PROPERTIES.NEW_WALL_PATTERN, newWallPattern.getName());
    }
    this.setProperty(PROPERTIES.NEW_WALL_THICKNESS, '' + this.getNewWallThickness());
    this.setProperty(PROPERTIES.NEW_WALL_HEIGHT, '' + this.getNewWallHeight());
    this.setProperty(PROPERTIES.NEW_FLOOR_THICKNESS, '' + this.getNewFloorThickness());
    // Write recent homes list
    var recentHomes = this.getRecentHomes();
    for (var i = 0; i < recentHomes.length && i < this.getRecentHomesMaxCount(); i++) {
      this.setProperty(PROPERTIES.RECENT_HOMES + (i + 1), recentHomes[i]);
    }
    // Write ignored action tips
    var ignoredActionTipsKeys = Object.keys(this.ignoredActionTips);
    for (var i = 0; i < ignoredActionTipsKeys.length; i++) {
      var key = ignoredActionTipsKeys[i];
      if (this.ignoredActionTips[key]) {
        this.setProperty(PROPERTIES.IGNORED_ACTION_TIP + (i + 1), key);
      }
    }

    try {
      // Write preferences to back end
      this.writePreferences();
    } catch (ex) {
      throw new RecorderException("Couldn't write preferences", ex);
    }
  }
}

/**
 * Sends user preferences to backend
 * @private
 */
RecordedUserPreferences.prototype.writePreferences = function() {
  if (!this.writePreferencesURL) {
    return;
  }

  var error = null;
  var serverErrorHandler = function(theError) {
    error = theError;
    console.error('an error occurred during write preferences', error);
  }

  var jsonPreferences = JSON.stringify(this.properties);
  var request = new XMLHttpRequest();
  request.open("POST", this.writePreferencesURL, false);
  request.onload = function() {
    console.info("preferences saved");
  };
  request.onerror = serverErrorHandler;
  request.ontimeout = serverErrorHandler;
  request.send(jsonPreferences);

  if (error) {
    throw error;
  }
}

/**
 * Sets which action tip should be ignored.
 * @override
 */
RecordedUserPreferences.prototype.setActionTipIgnored = function(actionKey) {
  this.ignoredActionTips[actionKey] = true;
  UserPreferences.prototype.setActionTipIgnored.call(this, actionKey);
}

/**
 * Returns whether an action tip should be ignored or not.
 * @override
 */
RecordedUserPreferences.prototype.isActionTipIgnored = function(actionKey) {
  var ignoredActionTip = this.ignoredActionTips[actionKey];
  return ignoredActionTip === true;
}

/**
 * Resets the display flag of action tips.
 * @override
 */
RecordedUserPreferences.prototype.resetIgnoredActionTips = function() {
  var keys = Object.keys(this.ignoredActionTips);
  for (var i = 0; i < keys.length; i++) {
    this.ignoredActionTips[keys[i]] = false;
  }
  UserPreferences.prototype.resetIgnoredActionTips.call(this);
}

/**
 * Throws an exception because applet user preferences can't manage language libraries.
 * @override
 */
RecordedUserPreferences.prototype.addLanguageLibrary = function(location) {
  throw new UnsupportedOperationException();
}

/**
 * Throws an exception because applet user preferences can't manage additional language libraries.
 * @override
 */
RecordedUserPreferences.prototype.languageLibraryExists = function(location) {
  throw new UnsupportedOperationException();
}

/**
 * Returns <code>true</code> if the furniture library at the given <code>location</code> exists.
 * @override
 */
RecordedUserPreferences.prototype.furnitureLibraryExists = function(location) {
  throw new UnsupportedOperationException();
}

/**
 * Throws an exception because applet user preferences can't manage additional furniture libraries.
 * @override
 */
RecordedUserPreferences.prototype.addFurnitureLibrary = function(location) {
  throw new UnsupportedOperationException();
}

/**
 * Returns <code>true</code> if the textures library at the given <code>location</code> exists.
 * @override
 */
RecordedUserPreferences.prototype.texturesLibraryExists = function(location) {
  throw new UnsupportedOperationException();
}

/**
 * Throws an exception because applet user preferences can't manage additional textures libraries.
 * @override
 */
RecordedUserPreferences.prototype.addTexturesLibrary = function(location) {
  throw new UnsupportedOperationException();
}

/**
 * Throws an exception because applet user preferences don't manage additional libraries.
 * @override
 */
RecordedUserPreferences.prototype.getLibraries = function() {
  throw new UnsupportedOperationException();
}


/**
 * Save modifiable textures to catalog.json and upload new resources
 *
 * @param {function()} [onSuccess] called when textures catalog is fully saved
 * @param {function()} [onError] called if any error occurs during save
 *
 * @private
 */
RecordedUserPreferences.prototype.saveTexturesCatalog = function(onSuccess, onError) {
  console.info("save textures catalog");
  if (!onSuccess) { onSuccess = function() {} }
  if (!onError) { onError = function(error) { console.error('an error occurred during saveTexturesCatalog', error) } }

  var texturesCatalogJson = {};
  function putTextureProperty(propertyKey, index, value) {
    texturesCatalogJson[DefaultTexturesCatalog.PropertyKey.getKey(propertyKey, index)] = value;
  }

  var texturesDirectoryPathRelativeToUserResources = this.texturesResourcesUrlBase.substring(this.userResourcesURLBase.length);

  var expectedUploadCount = 1;
  function onUploadSuccess() {
    expectedUploadCount--;
    if (expectedUploadCount === 0) {
      onSuccess();
    }
  }

  var uploadDate = new Date();
  var uploadId = '' + uploadDate.getFullYear() + '-' + uploadDate.getMonth() + '-' + uploadDate.getDate()
    + '_' + uploadDate.getHours() + 'h' + uploadDate.getMinutes() + 'm' + uploadDate.getSeconds() + '.' + uploadDate.getMilliseconds();

  var index = 1;
  var texturesCatalog = this.getTexturesCatalog();
  for (var i = 0; i < texturesCatalog.getCategoriesCount(); i++) {
    var textureCategory = texturesCatalog.getCategory(i);
    for (var j = 0; j < textureCategory.getTexturesCount(); j++) {
      var catalogTexture = textureCategory.getTexture(j);
      if (catalogTexture.isModifiable()) {
        if (catalogTexture.getName() != null) {
          putTextureProperty(DefaultTexturesCatalog.PropertyKey.NAME, index, catalogTexture.getName());
        }
        putTextureProperty(DefaultTexturesCatalog.PropertyKey.CATEGORY, index, textureCategory.getName());
        putTextureProperty(DefaultTexturesCatalog.PropertyKey.MODIFIABLE, index, catalogTexture.isModifiable());
        putTextureProperty(DefaultTexturesCatalog.PropertyKey.WIDTH, index, catalogTexture.getWidth());
        putTextureProperty(DefaultTexturesCatalog.PropertyKey.HEIGHT, index, catalogTexture.getHeight());
        if (catalogTexture.getCreator() != null) {
          putTextureProperty(DefaultTexturesCatalog.PropertyKey.CREATOR, index, catalogTexture.getCreator());
        }
        if (catalogTexture.getId() != null) {
          putTextureProperty(DefaultTexturesCatalog.PropertyKey.ID, index, catalogTexture.getId());
        }

        var textureImageFileName = "";
        var textureImage = catalogTexture.getImage();
        if (textureImage instanceof BlobURLContent) {
          var imageExtension = textureImage.getBlob().type == 'image/png' ? 'png' : 'jpg';
          textureImageFileName = 'preferencesCatalogTexture_' + uploadId + '_' + index + '.' + imageExtension;
          var imagePath = texturesDirectoryPathRelativeToUserResources + textureImageFileName;

          expectedUploadCount++;
          this.writeResource(imagePath, textureImage.getBlob(), onUploadSuccess, onError);

          // TODO LOUIS this looks like messing with private properties...
          catalogTexture.image = new URLContent(this.texturesResourcesUrlBase + textureImageFileName);
        } else if (textureImage instanceof URLContent) {
          textureImageFileName = textureImage.getURL();
          if (this.texturesResourcesUrlBase != null) {
            textureImageFileName = textureImageFileName.substring(this.texturesResourcesUrlBase.length);
          }
        }
        putTextureProperty(DefaultTexturesCatalog.PropertyKey.IMAGE, index, textureImageFileName);

        index++;
      }
    }
  }

  this.writeResource(
    texturesDirectoryPathRelativeToUserResources + 'catalog.json',
    new Blob([JSON.stringify(texturesCatalogJson)], { type: "application/json"}),
    onUploadSuccess,
    onError
  );
}

/**
 * @param {string} path uploaded file path relative to userResources directory
 * @param {Blob} blob file content
 * @param {function()} onSuccess called when content is uploaded
 * @param {function()} onError called if error is detected
 * @private
 */
RecordedUserPreferences.prototype.writeResource = function(path, blob, onSuccess, onError) {
  console.info("uploading blob content to " + path);
  var request = new XMLHttpRequest();

  var uploadUrl = CoreTools.format(this.writeResourceURL.replace(/(%[^s])/g, "%$1"), encodeURIComponent(path));
  request.open("POST", uploadUrl, false);
  request.onload = onSuccess;
  request.onerror = onError;
  request.ontimeout = onError;

  request.send(blob);
}
