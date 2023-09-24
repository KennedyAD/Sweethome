/*
 * SweetHome3D.java
 *
 * Sweet Home 3D, Copyright (c) 2017 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
package def.sweethome3d;

import java.beans.PropertyChangeListener;
import java.math.BigDecimal;
import java.text.Format;
import java.util.List;

// Bridges to Sweet Home 3D JavaScript classes reimplemented in some src/*.js

class UserPreferences {
  String FURNITURE_LIBRARY_TYPE = "Furniture library";
  String TEXTURES_LIBRARY_TYPE  = "Textures library";
  String LANGUAGE_LIBRARY_TYPE  = "Language library";

  /**
   * Adds the <code>listener</code> in parameter to these preferences.
   * <br>Caution: a user preferences instance generally exists during all the application ;
   * therefore you should take care of not bounding permanently listeners to this
   * object (for example, do not create anonymous listeners on user preferences
   * in classes depending on an edited home).
   */
  public native void addPropertyChangeListener(String property, PropertyChangeListener listener);

  /**
   * Removes the <code>listener</code> in parameter from these preferences.
   */
  public native void removePropertyChangeListener(String property, PropertyChangeListener listener);

//  /**
//   * Returns the furniture catalog.
//   */
//  FurnitureCatalog getFurnitureCatalog();
//
//  /**
//   * Returns the textures catalog.
//   */
//  TexturesCatalog getTexturesCatalog();
//
//  /**
//   * Returns the patterns catalog available to fill plan areas.
//   */
//  PatternsCatalog getPatternsCatalog();

  /**
   * Returns the length unit currently in use.
   */
  public native LengthUnit getLengthUnit();

  /**
   * Changes the unit currently in use, and notifies listeners of this change.
   * @param unit one of the values of Unit.
   */
  public native void setUnit(LengthUnit unit);

  /**
   * Returns the preferred language to display information, noted with an ISO 639 code
   * that may be followed by an underscore and an ISO 3166 code.
   */
  public native String getLanguage();

  /**
   * If {@linkplain #isLanguageEditable() language can be changed}, sets the preferred language to display information,
   * changes current default locale accordingly and notifies listeners of this change.
   * @param language an ISO 639 code that may be followed by an underscore and an ISO 3166 code
   *            (for example fr, de, it, en_US, zh_CN).
   */
  public native void setLanguage(String language);

  /**
   * Returns <code>true</code> if the language in preferences can be set.
   * @return <code>true</code> except if <code>user.language</code> System property isn't writable.
   * @since 3.4
   */
  public native boolean isLanguageEditable();

  /**
   * Returns the array of default available languages in Sweet Home 3D.
   */
  public native String [] getDefaultSupportedLanguages();

  /**
   * Returns the array of available languages in Sweet Home 3D including languages in libraries.
   * @since 3.4
   */
  public native String [] getSupportedLanguages();

  /**
   * Returns the string matching <code>resourceKey</code> in current language
   * for the given resource family.
   * <code>resourceFamily</code> should match the absolute path of a .properties resource family,
   * shouldn't start by a slash and may contain dots '.' or slash '/' as folder separators.
   * If <code>resourceParameters</code> isn't empty the string is considered
   * as a format string, and the returned string will be formatted with these parameters.
   * This implementation searches the key in a properties file named as
   * <code>resourceFamily</code>.
   * @throws IllegalArgumentException if no string for the given key can be found
   * @since 2.3
   */
  public native String getLocalizedString(String resourceFamily, String resourceKey, Object... resourceParameters);

  /**
   * Returns the currency in use, noted with ISO 4217 code, or <code>null</code>
   * if prices aren't used in application.
   */
  public native String getCurrency();

  /**
   * Sets the currency in use.
   */
  public native void setCurrency(String currency);

  /**
   * Returns <code>true</code> if Value Added Tax should be taken in account in prices.
   * @since 6.0
   */
  public native boolean isValueAddedTaxEnabled();

  /**
   * Sets whether Value Added Tax should be taken in account in prices.
   * @param valueAddedTaxEnabled if <code>true</code> VAT will be added to prices.
   * @since 6.0
   */
  public native void setValueAddedTaxEnabled(boolean valueAddedTaxEnabled);

  /**
   * Returns the Value Added Tax percentage applied to prices by default, or <code>null</code>
   * if VAT isn't taken into account in the application.
   * @since 6.0
   */
  public native BigDecimal getDefaultValueAddedTaxPercentage();

  /**
   * Sets the Value Added Tax percentage applied to prices by default.
   * @param valueAddedTaxPercentage the default VAT percentage
   * @since 6.0
   */
  public native void setDefaultValueAddedTaxPercentage(BigDecimal valueAddedTaxPercentage);

  /**
   * Returns <code>true</code> if the furniture catalog should be viewed in a tree.
   * @since 2.3
   */
  public native boolean isFurnitureCatalogViewedInTree();

  /**
   * Sets whether the furniture catalog should be viewed in a tree or a different way.
   * @since 2.3
   */
  public native void setFurnitureCatalogViewedInTree(boolean furnitureCatalogViewedInTree);

  /**
   * Returns <code>true</code> if the navigation panel should be displayed.
   * @since 2.3
   */
  public native boolean isNavigationPanelVisible();

  /**
   * Sets whether the navigation panel should be displayed or not.
   * @since 2.3
   */
  public native void setNavigationPanelVisible(boolean navigationPanelVisible);

  /**
   * Sets whether aerial view should be centered on selection or not.
   * @since 4.0
   */
  public native void setAerialViewCenteredOnSelectionEnabled(boolean aerialViewCenteredOnSelectionEnabled);

  /**
   * Returns whether aerial view should be centered on selection or not.
   * @since 4.0
   */
  public native boolean isAerialViewCenteredOnSelectionEnabled();

  /**
   * Sets whether the observer camera should be selected at each change.
   * @since 5.5
   */
  public native void setObserverCameraSelectedAtChange(boolean observerCameraSelectedAtChange);

  /**
   * Returns whether the observer camera should be selected at each change.
   * @since 5.5
   */
  public native boolean isObserverCameraSelectedAtChange();

  /**
   * Returns <code>true</code> if magnetism is enabled.
   * @return <code>true</code> by default.
   */
  public native boolean isMagnetismEnabled();

  /**
   * Sets whether magnetism is enabled or not, and notifies
   * listeners of this change.
   * @param magnetismEnabled <code>true</code> if magnetism is enabled,
   *          <code>false</code> otherwise.
   */
  public native void setMagnetismEnabled(boolean magnetismEnabled);

  /**
   * Returns <code>true</code> if rulers are visible.
   * @return <code>true</code> by default.
   */
  public native boolean isRulersVisible();

  /**
   * Sets whether rulers are visible or not, and notifies
   * listeners of this change.
   * @param rulersVisible <code>true</code> if rulers are visible,
   *          <code>false</code> otherwise.
   */
  public native void setRulersVisible(boolean rulersVisible);

  /**
   * Returns <code>true</code> if plan grid visible.
   * @return <code>true</code> by default.
   */
  public native boolean isGridVisible();

  /**
   * Sets whether plan grid is visible or not, and notifies
   * listeners of this change.
   * @param gridVisible <code>true</code> if grid is visible,
   *          <code>false</code> otherwise.
   */
  public native void setGridVisible(boolean gridVisible);

  /**
   * Returns <code>true</code> is {@link HomeEnvironment#getDrawingMode() drawing mode}
   * should be taken into account.
   * @since 6.0
   */
  public native boolean isDrawingModeEnabled();

  /**
   * Returns the name of the font that should be used by default or <code>null</code>
   * if the default font should be the default one in the application.
   * @since 5.0
   */
  public native String getDefaultFontName();

  /**
   * Sets the name of the font that should be used by default.
   * @since 5.0
   */
  public native void setDefaultFontName(String defaultFontName);

  /**
   * Returns <code>true</code> if furniture should be viewed from its top in plan.
   * @since 2.0
   */
  public native boolean isFurnitureViewedFromTop();

  /**
   * Sets how furniture icon should be displayed in plan, and notifies
   * listeners of this change.
   * @param furnitureViewedFromTop if <code>true</code> the furniture
   *    should be viewed from its top.
   * @since 2.0
   */
  public native void setFurnitureViewedFromTop(boolean furnitureViewedFromTop);

  /**
   * Returns the size used to generate icons of furniture viewed from top.
   * @since 5.5
   */
  public native int getFurnitureModelIconSize();

  /**
   * Sets the name of the font that should be used by default.
   * @since 5.5
   */
  public native void setFurnitureModelIconSize(int furnitureModelIconSize);

  /**
   * Returns <code>true</code> if room floors should be rendered with color or texture
   * in plan.
   * @return <code>false</code> by default.
   * @since 2.0
   */
  public native boolean isRoomFloorColoredOrTextured();

  /**
   * Sets whether room floors should be rendered with color or texture,
   * and notifies listeners of this change.
   * @param roomFloorColoredOrTextured <code>true</code> if floor color
   *          or texture is used, <code>false</code> otherwise.
   * @since 2.0
   */
  public native void setFloorColoredOrTextured(boolean roomFloorColoredOrTextured);

  /**
   * Returns the wall pattern in plan used by default.
   * @since 2.0
   */
  public native URLContent getWallPattern();

  /**
   * Sets how walls should be displayed in plan by default, and notifies
   * listeners of this change.
   * @since 2.0
   */
  public native void setWallPattern(URLContent wallPattern);

  /**
   * Returns the pattern used for new walls in plan or <code>null</code> if it's not set.
   * @since 4.0
   */
  public native URLContent getNewWallPattern();

  /**
   * Sets how new walls should be displayed in plan, and notifies
   * listeners of this change.
   * @since 4.0
   */
  public native void setNewWallPattern(URLContent newWallPattern);

  /**
   * Returns default thickness of new walls in home.
   */
  public native float getNewWallThickness();

  /**
   * Sets default thickness of new walls in home, and notifies
   * listeners of this change.
   */
  public native void setNewWallThickness(float newWallThickness);

  /**
   * Returns default wall height of new home walls.
   */
  public native float getNewWallHeight();

  /**
   * Sets default wall height of new walls, and notifies
   * listeners of this change.
   */
  public native void setNewWallHeight(float newWallHeight);

  /**
   * Returns default baseboard thickness of new walls in home.
   * @since 5.0
   */
  public native float getNewWallBaseboardThickness();

  /**
   * Sets default baseboard thickness of new walls in home, and notifies
   * listeners of this change.
   * @since 5.0
   */
  public native void setNewWallBaseboardThickness(float newWallBaseboardThickness);

  /**
   * Returns default baseboard height of new home walls.
   * @since 5.0
   */
  public native float getNewWallBaseboardHeight();

  /**
   * Sets default baseboard height of new walls, and notifies
   * listeners of this change.
   * @since 5.0
   */
  public native void setNewWallBaseboardHeight(float newWallBaseboardHeight);

  /**
   * Returns default thickness of the floor of new levels in home.
   * @since 3.4
   */
  public native float getNewFloorThickness();

  /**
   * Sets default thickness of the floor of new levels in home, and notifies
   * listeners of this change.
   * @since 3.4
   */
  public native void setNewFloorThickness(float newFloorThickness);

  /**
   * Returns <code>true</code> if updates should be checked.
   * @since 4.0
   */
  public native boolean isCheckUpdatesEnabled();

  /**
   * Sets whether updates should be checked or not.
   * @since 4.0
   */
  public native void setCheckUpdatesEnabled(boolean updatesChecked);

  /**
   * Returns the minimum date of updates that may interest user.
   * @return the date expressed in millis second since the epoch or <code>null</code> if not defined.
   * @since 4.0
   */
  public native Long getUpdatesMinimumDate();

  /**
   * Sets the minimum date of updates that may interest user, and notifies
   * listeners of this change.
   * @since 4.0
   */
  public native void setUpdatesMinimumDate(Long updatesMinimumDate);

  /**
   * Returns the delay between two automatic save operations of homes for recovery purpose.
   * @return a delay in milliseconds or 0 to disable auto save.
   * @since 3.0
   */
  public native int getAutoSaveDelayForRecovery();

  /**
   * Sets the delay between two automatic save operations of homes for recovery purpose.
   * @since 3.0
   */
  public native void setAutoSaveDelayForRecovery(int autoSaveDelayForRecovery);

  /**
   * Returns an unmodifiable list of the recent homes.
   */
  public native List<String> getRecentHomes();

  /**
   * Sets the recent homes list and notifies listeners of this change.
   */
  public native void setRecentHomes(List<String> recentHomes);

  /**
   * Returns the maximum count of homes that should be proposed to the user.
   */
  public native int getRecentHomesMaxCount();

  /**
   * Returns the maximum count of stored cameras in homes that should be proposed to the user.
   * @since 4.5
   */
  public native int getStoredCamerasMaxCount();

  /**
   * Sets which action tip should be ignored.
   * <br>This method should be overridden to store the ignore information.
   * By default it just notifies listeners of this change.
   */
  public native void setActionTipIgnored(String actionKey);

  /**
   * Returns whether an action tip should be ignored or not.
   * <br>This method should be overridden to return the display information
   * stored in {@link #setActionTipIgnored(String) setActionTipIgnored}.
   * By default it returns <code>true</code>.
   */
  public native boolean isActionTipIgnored(String actionKey);

  /**
   * Resets the ignore flag of action tips.
   * <br>This method should be overridden to clear all the display flags.
   * By default it just notifies listeners of this change.
   */
  public native void resetIgnoredActionTips();

  /**
   * Returns the default text style of a class of selectable item.
   */
  public native String getDefaultTextStyle(String selectableClass);

  /**
   * Returns the strings that may be used for the auto completion of the given <code>property</code>.
   * @since 3.4
   */
  public native List<String> getAutoCompletionStrings(String property);

  /**
   * Adds the given string to the list of the strings used in auto completion of a <code>property</code>
   * and notifies listeners of this change.
   * @since 3.4
   */
  public native void addAutoCompletionString(String property, String autoCompletionString);

  /**
   * Sets the auto completion strings list of the given <code>property</code> and notifies listeners of this change.
   * @since 3.4
   */
  public native void setAutoCompletionStrings(String property, List<String> autoCompletionStrings);

  /**
   * Returns the list of properties with auto completion strings.
   * @since 3.4
   */
  public native List<String> getAutoCompletedProperties();

  /**
   * Returns an unmodifiable list of the recent colors.
   * @since 4.0
   */
  public native List<Integer> getRecentColors();

  /**
   * Sets the recent colors list and notifies listeners of this change.
   * @since 4.0
   */
  public native void setRecentColors(List<Integer> recentColors);

  /**
   * Returns an unmodifiable list of the recent textures.
   * @since 4.4
   */
  public native List<URLContent> getRecentTextures();

  /**
   * Sets the recent colors list and notifies listeners of this change.
   * @since 4.4
   */
  public native void setRecentTextures(List<URLContent> recentTextures);
}

class URLContent {
  public URLContent(String content) {
  }

  public native String getURL();

  public static native URLContent fromURL(String url);
}

class HomeURLContent {
  public HomeURLContent(String content) {
  }

  public native String getURL();
}

class LengthUnit {
    public static LengthUnit MILLIMETER;
    public static LengthUnit CENTIMETER;
    public static LengthUnit METER;
    public static LengthUnit INCH;
    public static LengthUnit INCH_FRACTION;
    public static LengthUnit INCH_DECIMALS;
    public static LengthUnit FOOT_DECIMALS;

    public native static float centimeterToInch(float length);

    public native static float centimeterToFoot(float length);

    public native static float inchToCentimeter(float length);

    public native static float footToCentimeter(float length);

    public native Format getFormatWithUnit();

    public native Format getFormat();

    public native Format getAreaFormatWithUnit();

    public native String getName();

    public native float getMagnetizedLength(float length, float maxDelta);

    public native float getMinimumLength();

    public native float getMaximumLength();

    public native float getStepSize();

    public native float getMaximumElevation();

    public native float centimeterToUnit(float length);

    public native float unitToCentimeter(float length);
}

class DefaultUserPreferences {
  public DefaultUserPreferences(boolean readCatalogs, UserPreferences localizedPreferences) {
  }
}