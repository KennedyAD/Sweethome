/*
 * LengthUnit.java 22 nov. 2008
 *
 * Sweet Home 3D, Copyright (c) 2006-2008 Emmanuel PUYBARET / eTeks <info@eteks.com>
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

import java.text.DecimalFormat;
import java.text.FieldPosition;
import java.text.Format;
import java.text.MessageFormat;
import java.text.NumberFormat;
import java.text.ParsePosition;
import java.util.Locale;
import java.util.ResourceBundle;

/**
 * Unit used for lengths.
 */
public enum LengthUnit {
  /**
   * Millimeter unit.
   * @since 2.0
   */
  MILLIMETER {
    private Locale        formatLocale;
    private String        name;
    private DecimalFormat lengthFormatWithUnit;
    private DecimalFormat lengthFormat;
    private DecimalFormat areaFormatWithUnit;

    @Override
    public Format getFormatWithUnit() {
      checkLocaleChange();
      return this.lengthFormatWithUnit;
    }

    @Override
    public Format getAreaFormatWithUnit() {
      checkLocaleChange();
      return this.areaFormatWithUnit;
    }

    @Override
    public Format getFormat() {
      checkLocaleChange();
      return this.lengthFormat;
    }

    @Override
    public String getName() {
      checkLocaleChange();
      return this.name;
    }

    private void checkLocaleChange() {
      // Instantiate formats if locale changed
      if (!Locale.getDefault().equals(this.formatLocale)) {
        this.formatLocale = Locale.getDefault();
        ResourceBundle resource = ResourceBundle.getBundle(LengthUnit.class.getName());
        this.name = resource.getString("millimeterUnit");
        this.lengthFormatWithUnit = new MeterFamilyFormat("#,##0 " + this.name.replace(".", "'.'"), 10);
        this.lengthFormat = new MeterFamilyFormat("#,##0", 10);
        String squareMeterUnit = resource.getString("squareMeterUnit");
        this.areaFormatWithUnit = new SquareMeterAreaFormatWithUnit(squareMeterUnit.replace(".", "'.'"));
      }
    }

    @Override
    public float getMagnetizedLength(float length, float maxDelta) {
      return getMagnetizedMeterLength(length, maxDelta);
    }

    @Override
    public float getMinimumLength() {
      return 0.1f;
    }

    @Override
    public float getMaximumLength() {
      return 100000f;
    }

    @Override
    public float getStepSize() {
      return 0.5f;
    }

    @Override
    public float centimeterToUnit(float length) {
      return length * 10;
    }

    @Override
    public float unitToCentimeter(float length) {
      return length / 10;
    }

    @Override
    public boolean isMetric() {
      return true;
    }
  },

  /**
   * Centimeter unit.
   */
  CENTIMETER {
    private Locale        formatLocale;
    private String        name;
    private DecimalFormat lengthFormatWithUnit;
    private DecimalFormat lengthFormat;
    private DecimalFormat areaFormatWithUnit;

    @Override
    public Format getFormatWithUnit() {
      checkLocaleChange();
      return this.lengthFormatWithUnit;
    }

    @Override
    public Format getAreaFormatWithUnit() {
      checkLocaleChange();
      return this.areaFormatWithUnit;
    }

    @Override
    public Format getFormat() {
      checkLocaleChange();
      return this.lengthFormat;
    }

    @Override
    public String getName() {
      checkLocaleChange();
      return this.name;
    }

    private void checkLocaleChange() {
      // Instantiate formats if locale changed
      if (!Locale.getDefault().equals(this.formatLocale)) {
        this.formatLocale = Locale.getDefault();
        ResourceBundle resource = ResourceBundle.getBundle(LengthUnit.class.getName());
        this.name = resource.getString("centimeterUnit");
        this.lengthFormatWithUnit = new MeterFamilyFormat("#,##0.# " + this.name.replace(".", "'.'"), 1);
        this.lengthFormat = new MeterFamilyFormat("#,##0.#", 1);
        String squareMeterUnit = resource.getString("squareMeterUnit");
        this.areaFormatWithUnit = new SquareMeterAreaFormatWithUnit(squareMeterUnit.replace(".", "'.'"));
      }
    }

    @Override
    public float getMagnetizedLength(float length, float maxDelta) {
      return getMagnetizedMeterLength(length, maxDelta);
    }

    @Override
    public float getMinimumLength() {
      return 0.1f;
    }

    @Override
    public float getMaximumLength() {
      return 100000f;
    }

    @Override
    public float getStepSize() {
      return 0.5f;
    }

    @Override
    public float centimeterToUnit(float length) {
      return length;
    }

    @Override
    public float unitToCentimeter(float length) {
      return length;
    }

    @Override
    public boolean isMetric() {
      return true;
    }
  },

  /**
   * Meter unit.
   * @since 2.0
   */
  METER {
    private Locale        formatLocale;
    private String        name;
    private DecimalFormat lengthFormatWithUnit;
    private DecimalFormat lengthFormat;
    private DecimalFormat areaFormatWithUnit;

    @Override
    public Format getFormatWithUnit() {
      checkLocaleChange();
      return this.lengthFormatWithUnit;
    }

    @Override
    public Format getAreaFormatWithUnit() {
      checkLocaleChange();
      return this.areaFormatWithUnit;
    }

    @Override
    public Format getFormat() {
      checkLocaleChange();
      return this.lengthFormat;
    }

    @Override
    public String getName() {
      checkLocaleChange();
      return this.name;
    }

    private void checkLocaleChange() {
      // Instantiate formats if locale changed
      if (!Locale.getDefault().equals(this.formatLocale)) {
        this.formatLocale = Locale.getDefault();
        ResourceBundle resource = ResourceBundle.getBundle(LengthUnit.class.getName());
        this.name = resource.getString("meterUnit");
        this.lengthFormatWithUnit = new MeterFamilyFormat("#,##0.00# " + this.name.replace(".", "'.'"), 0.01f);
        this.lengthFormat = new MeterFamilyFormat("#,##0.00#", 0.01f);
        String squareMeterUnit = resource.getString("squareMeterUnit");
        this.areaFormatWithUnit = new SquareMeterAreaFormatWithUnit(squareMeterUnit.replace(".", "'.'"));
      }
    }

    @Override
    public float getMagnetizedLength(float length, float maxDelta) {
      return getMagnetizedMeterLength(length, maxDelta);
    }

    @Override
    public float getMinimumLength() {
      return 0.1f;
    }

    @Override
    public float getMaximumLength() {
      return 100000f;
    }

    @Override
    public float getStepSize() {
      return 0.5f;
    }

    @Override
    public float centimeterToUnit(float length) {
      return length / 100;
    }

    @Override
    public float unitToCentimeter(float length) {
      return length * 100;
    }

    @Override
    public boolean isMetric() {
      return true;
    }
  },

  /**
   * Foot/Inch unit followed by fraction.
   */
  INCH {
    private Locale        formatLocale;
    private String        name;
    private DecimalFormat lengthFormat;
    private DecimalFormat areaFormatWithUnit;

    @Override
    public Format getFormatWithUnit() {
      checkLocaleChange();
      return this.lengthFormat;
    }

    @Override
    public Format getFormat() {
      return getFormatWithUnit();
    }

    @Override
    public Format getAreaFormatWithUnit() {
      checkLocaleChange();
      return this.areaFormatWithUnit;
    }

    @Override
    public String getName() {
      checkLocaleChange();
      return this.name;
    }

    private void checkLocaleChange() {
      // Instantiate format if locale changed
      if (!Locale.getDefault().equals(this.formatLocale)) {
        this.formatLocale = Locale.getDefault();
        ResourceBundle resource = ResourceBundle.getBundle(LengthUnit.class.getName());
        this.name = resource.getString("inchUnit");

        this.lengthFormat = new InchFractionFormat(true);
        String squareFootUnit = resource.getString("squareFootUnit");
        this.areaFormatWithUnit = new SquareFootAreaFormatWithUnit("#,##0 " + squareFootUnit.replace(".", "'.'"));
      }
    }

    @Override
    public float getMagnetizedLength(float length, float maxDelta) {
      return getMagnetizedInchLength(length, maxDelta);
    }

    @Override
    public float getMinimumLength() {
      return LengthUnit.inchToCentimeter(0.125f);
    }

    @Override
    public float getMaximumLength() {
      return LengthUnit.inchToCentimeter(99974.4f); // 3280 ft
    }

    @Override
    public float getStepSize() {
      return inchToCentimeter(0.125f);
    }

    @Override
    public float centimeterToUnit(float length) {
      return centimeterToInch(length);
    }

    @Override
    public float unitToCentimeter(float length) {
      return inchToCentimeter(length);
    }
  },

  /**
   * Inch unit followed by fraction.
   * @since 7.0
   */
  INCH_FRACTION {
    private Locale        formatLocale;
    private String        name;
    private DecimalFormat lengthFormat;
    private DecimalFormat areaFormatWithUnit;

    @Override
    public Format getFormatWithUnit() {
      checkLocaleChange();
      return this.lengthFormat;
    }

    @Override
    public Format getFormat() {
      return getFormatWithUnit();
    }

    @Override
    public Format getAreaFormatWithUnit() {
      checkLocaleChange();
      return this.areaFormatWithUnit;
    }

    @Override
    public String getName() {
      checkLocaleChange();
      return this.name;
    }

    private void checkLocaleChange() {
      // Instantiate format if locale changed
      if (!Locale.getDefault().equals(this.formatLocale)) {
        this.formatLocale = Locale.getDefault();
        ResourceBundle resource = ResourceBundle.getBundle(LengthUnit.class.getName());
        this.name = resource.getString("inchUnit");

        this.lengthFormat = new InchFractionFormat(false);
        String squareFootUnit = resource.getString("squareFootUnit");
        this.areaFormatWithUnit = new SquareFootAreaFormatWithUnit("#,##0 " + squareFootUnit.replace(".", "'.'"));
      }
    }

    @Override
    public float getMagnetizedLength(float length, float maxDelta) {
      return getMagnetizedInchLength(length, maxDelta);
    }

    @Override
    public float getMinimumLength() {
      return LengthUnit.inchToCentimeter(0.125f);
    }

    @Override
    public float getMaximumLength() {
      return LengthUnit.inchToCentimeter(99974.4f); // 3280 ft
    }

    @Override
    public float getStepSize() {
      return inchToCentimeter(0.125f);
    }

    @Override
    public float centimeterToUnit(float length) {
      return centimeterToInch(length);
    }

    @Override
    public float unitToCentimeter(float length) {
      return inchToCentimeter(length);
    }
  },

  /**
   * Inch unit with decimals.
   * @since 4.0
   */
  INCH_DECIMALS {
    private Locale        formatLocale;
    private String        name;
    private DecimalFormat lengthFormat;
    private DecimalFormat lengthFormatWithUnit;
    private DecimalFormat areaFormatWithUnit;

    @Override
    public Format getFormatWithUnit() {
      checkLocaleChange();
      return this.lengthFormatWithUnit;
    }

    @Override
    public Format getFormat() {
      checkLocaleChange();
      return this.lengthFormat;
    }

    @Override
    public Format getAreaFormatWithUnit() {
      checkLocaleChange();
      return this.areaFormatWithUnit;
    }

    @Override
    public String getName() {
      checkLocaleChange();
      return this.name;
    }

    private void checkLocaleChange() {
      // Instantiate format if locale changed
      if (!Locale.getDefault().equals(this.formatLocale)) {
        this.formatLocale = Locale.getDefault();
        ResourceBundle resource = ResourceBundle.getBundle(LengthUnit.class.getName());
        this.name = resource.getString("inchUnit");

        // Create formats for inches with decimals
        class InchDecimalsFormat extends DecimalFormat {
          private final MessageFormat inchDecimalsFormat;
          private final NumberFormat  inchNumberFormat = NumberFormat.getNumberInstance();

          private InchDecimalsFormat(MessageFormat inchDecimalsFormat) {
            super("0.###");
            this.inchDecimalsFormat = inchDecimalsFormat;
          }

          @Override
          public StringBuffer format(double number, StringBuffer result,
                                     FieldPosition fieldPosition) {
            float inches = centimeterToInch((float)number);
            fieldPosition.setEndIndex(fieldPosition.getEndIndex() + 1);
            this.inchDecimalsFormat.format(new Object [] {inches}, result, fieldPosition);
            return result;
          }

          @Override
          public Number parse(String text, ParsePosition parsePosition) {
            ParsePosition numberPosition = new ParsePosition(parsePosition.getIndex());
            skipWhiteSpaces(text, numberPosition);
            // Parse inches
            Number inches = this.inchNumberFormat.parse(text, numberPosition);
            if (inches == null) {
              parsePosition.setErrorIndex(numberPosition.getErrorIndex());
              return null;
            }
            double value = inchToCentimeter(inches.floatValue());
            // Parse "
            skipWhiteSpaces(text, numberPosition);
            if (numberPosition.getIndex() < text.length()
                && text.charAt(numberPosition.getIndex()) == '\"') {
              parsePosition.setIndex(numberPosition.getIndex() + 1);
            } else {
              parsePosition.setIndex(numberPosition.getIndex());
            }
            return value;
          }
        }
        this.lengthFormat = new InchDecimalsFormat(new MessageFormat(resource.getString("inchDecimalsFormat")));
        this.lengthFormatWithUnit = new InchDecimalsFormat(new MessageFormat(resource.getString("inchDecimalsFormatWithUnit")));

        String squareFootUnit = resource.getString("squareFootUnit");
        this.areaFormatWithUnit = new SquareFootAreaFormatWithUnit("#,##0.## " + squareFootUnit.replace(".", "'.'"));
      }
    }

    @Override
    public float getMagnetizedLength(float length, float maxDelta) {
      return getMagnetizedInchLength(length, maxDelta);
    }

    @Override
    public float getMinimumLength() {
      return LengthUnit.inchToCentimeter(0.125f);
    }

    @Override
    public float getMaximumLength() {
      return LengthUnit.inchToCentimeter(99974.4f); // 3280 ft
    }

    @Override
    public float getStepSize() {
      return inchToCentimeter(0.125f);
    }

    @Override
    public float centimeterToUnit(float length) {
      return centimeterToInch(length);
    }

    @Override
    public float unitToCentimeter(float length) {
      return inchToCentimeter(length);
    }
  },

  /**
   * Foot unit with decimals.
   * @since 7.0
   */
  FOOT_DECIMALS {
    private Locale        formatLocale;
    private String        name;
    private DecimalFormat lengthFormat;
    private DecimalFormat lengthFormatWithUnit;
    private DecimalFormat areaFormatWithUnit;

    @Override
    public Format getFormatWithUnit() {
      checkLocaleChange();
      return this.lengthFormatWithUnit;
    }

    @Override
    public Format getFormat() {
      checkLocaleChange();
      return this.lengthFormat;
    }

    @Override
    public Format getAreaFormatWithUnit() {
      checkLocaleChange();
      return this.areaFormatWithUnit;
    }

    @Override
    public String getName() {
      checkLocaleChange();
      return this.name;
    }

    private void checkLocaleChange() {
      // Instantiate format if locale changed
      if (!Locale.getDefault().equals(this.formatLocale)) {
        this.formatLocale = Locale.getDefault();
        ResourceBundle resource = ResourceBundle.getBundle(LengthUnit.class.getName());
        this.name = resource.getString("footUnit");

        // Create formats for feet with decimals
        class FootDecimalsFormat extends DecimalFormat {
          private final MessageFormat footDecimalsFormat;
          private final NumberFormat  footNumberFormat = NumberFormat.getNumberInstance();

          private FootDecimalsFormat(MessageFormat footDecimalsFormat) {
            super("0.###");
            this.footDecimalsFormat = footDecimalsFormat;
          }

          @Override
          public StringBuffer format(double number, StringBuffer result,
                                     FieldPosition fieldPosition) {
            float feet = centimeterToFoot((float)number);
            fieldPosition.setEndIndex(fieldPosition.getEndIndex() + 1);
            this.footDecimalsFormat.format(new Object [] {feet}, result, fieldPosition);
            return result;
          }

          @Override
          public Number parse(String text, ParsePosition parsePosition) {
            ParsePosition numberPosition = new ParsePosition(parsePosition.getIndex());
            skipWhiteSpaces(text, numberPosition);
            // Parse feet
            Number feet = this.footNumberFormat.parse(text, numberPosition);
            if (feet == null) {
              parsePosition.setErrorIndex(numberPosition.getErrorIndex());
              return null;
            }
            double value = footToCentimeter(feet.floatValue());
            // Parse '
            skipWhiteSpaces(text, numberPosition);
            if (numberPosition.getIndex() < text.length()
                && text.charAt(numberPosition.getIndex()) == '\'') {
              parsePosition.setIndex(numberPosition.getIndex() + 1);
            } else {
              parsePosition.setIndex(numberPosition.getIndex());
            }
            return value;
          }
        }
        this.lengthFormat = new FootDecimalsFormat(new MessageFormat(resource.getString("footDecimalsFormat")));
        this.lengthFormatWithUnit = new FootDecimalsFormat(new MessageFormat(resource.getString("footDecimalsFormatWithUnit")));

        String squareFootUnit = resource.getString("squareFootUnit");
        this.areaFormatWithUnit = new SquareFootAreaFormatWithUnit("#,##0.## " + squareFootUnit.replace(".", "'.'"));
      }
    }

    @Override
    public float getMagnetizedLength(float length, float maxDelta) {
      return getMagnetizedInchLength(length, maxDelta);
    }

    @Override
    public float getMinimumLength() {
      return LengthUnit.inchToCentimeter(0.125f);
    }

    @Override
    public float getMaximumLength() {
      return LengthUnit.footToCentimeter(3280);
    }

    @Override
    public float getStepSize() {
      return inchToCentimeter(0.125f);
    }

    @Override
    public float centimeterToUnit(float length) {
      return centimeterToFoot(length);
    }

    @Override
    public float unitToCentimeter(float length) {
      return footToCentimeter(length);
    }
  };


  /**
   * Returns the <code>length</code> given in centimeters converted to inches.
   */
  public static float centimeterToInch(float length) {
    return length / 2.54f;
  }

  /**
   * Returns the <code>length</code> given in centimeters converted to feet.
   */
  public static float centimeterToFoot(float length) {
    return length / 2.54f / 12;
  }

  /**
   * Returns the <code>length</code> given in inches converted to centimeters.
   */
  public static float inchToCentimeter(float length) {
    return length * 2.54f;
  }

  /**
   * Returns the <code>length</code> given in feet converted to centimeters.
   */
  public static float footToCentimeter(float length) {
    return length * 2.54f * 12;
  }

  /**
   * Returns a format able to format lengths with their localized unit.
   */
  public abstract Format getFormatWithUnit();

  /**
   * Returns a format able to format lengths.
   */
  public abstract Format getFormat();

  /**
   * A decimal format for meter family units.
   */
  private static class MeterFamilyFormat extends DecimalFormat {
    private final float unitMultiplier;

    public MeterFamilyFormat(String pattern, float unitMultiplier) {
      super(pattern);
      this.unitMultiplier = unitMultiplier;

    }

    @Override
    public StringBuffer format(double number, StringBuffer result,
                               FieldPosition fieldPosition) {
      // Convert centimeter to millimeter
      return super.format(number * this.unitMultiplier, result, fieldPosition);
    }

    @Override
    public StringBuffer format(long number, StringBuffer result,
                               FieldPosition fieldPosition) {
      return format((double)number, result, fieldPosition);
    }

    @Override
    public Number parse(String text, ParsePosition pos) {
      Number number = super.parse(text, pos);
      if (number == null) {
        return null;
      } else {
        return number.floatValue() / this.unitMultiplier;
      }
    }
  }

  /**
   * Returns a format able to format areas with their localized unit.
   */
  public abstract Format getAreaFormatWithUnit();

  /**
   * A decimal format for square meter.
   */
  private static class SquareMeterAreaFormatWithUnit extends DecimalFormat {
    public SquareMeterAreaFormatWithUnit(String squareMeterUnit) {
      super("#,##0.## " + squareMeterUnit);
    }

    @Override
    public StringBuffer format(double number, StringBuffer result,
                               FieldPosition fieldPosition) {
      // Convert square centimeter to square meter
      return super.format(number / 10000, result, fieldPosition);
    }
  }

  /**
   * A decimal format for inch lengths with fraction.
   */
  private static class InchFractionFormat extends DecimalFormat {
    private static final char [] INCH_FRACTION_CHARACTERS = {'\u215b',   // 1/8
                                                             '\u00bc',   // 1/4
                                                             '\u215c',   // 3/8
                                                             '\u00bd',   // 1/2
                                                             '\u215d',   // 5/8
                                                             '\u00be',   // 3/4
                                                             '\u215e'};  // 7/8
    private static final String [] INCH_FRACTION_STRINGS  = {"1/8",
                                                             "1/4",
                                                             "3/8",
                                                             "1/2",
                                                             "5/8",
                                                             "3/4",
                                                             "7/8"};

    private final boolean       footInch;
    private final MessageFormat positiveFootFormat;
    private final MessageFormat positiveFootInchFormat;
    private final MessageFormat positiveFootInchEighthFormat;
    private final MessageFormat negativeFootFormat;
    private final MessageFormat negativeFootInchFormat;
    private final MessageFormat negativeFootInchEighthFormat;
    private final String        footInchSeparator;
    private final MessageFormat positiveInchFormat;
    private final MessageFormat positiveInchEighthFormat;
    private final MessageFormat negativeInchFormat;
    private final MessageFormat negativeInchEighthFormat;
    private final NumberFormat  footNumberFormat;
    private final NumberFormat  inchNumberFormat;

    public InchFractionFormat(boolean footInch) {
      super("0.000\"");
      this.footInch = footInch;

      ResourceBundle resource = ResourceBundle.getBundle(LengthUnit.class.getName());
      this.positiveFootFormat = new MessageFormat(resource.getString("footFormat"));
      this.positiveFootInchFormat = new MessageFormat(resource.getString("footInchFormat"));
      this.positiveFootInchEighthFormat = new MessageFormat(resource.getString("footInchEighthFormat"));
      this.negativeFootFormat = new MessageFormat("-" + resource.getString("footFormat"));
      this.negativeFootInchFormat = new MessageFormat("-" + resource.getString("footInchFormat"));
      this.negativeFootInchEighthFormat = new MessageFormat("-" + resource.getString("footInchEighthFormat"));
      this.footInchSeparator = resource.getString("footInchSeparator");

      this.positiveInchFormat = new MessageFormat(resource.getString("inchFormat"));
      this.positiveInchEighthFormat = new MessageFormat(resource.getString("inchEighthFormat"));
      this.negativeInchFormat = new MessageFormat("-" + resource.getString("inchFormat"));
      this.negativeInchEighthFormat = new MessageFormat("-" + resource.getString("inchEighthFormat"));

      this.footNumberFormat = NumberFormat.getIntegerInstance();
      this.inchNumberFormat = NumberFormat.getNumberInstance();
    }

    @Override
    public StringBuffer format(double number, StringBuffer result,
                               FieldPosition fieldPosition) {
      float absoluteValue = Math.abs((float)number);
      double feet = Math.floor(centimeterToFoot(absoluteValue));
      float remainingInches = centimeterToInch((float)absoluteValue - footToCentimeter((float)feet));
      if (remainingInches >= 11.9375f) {
        feet++;
        remainingInches -= 12;
      }
      fieldPosition.setEndIndex(fieldPosition.getEndIndex() + 1);
      // Format remaining inches only if it's larger that 0.0005
      if (remainingInches >= 0.0005f) {
        // Try to format decimals with 1/8, 1/4, 1/2 fractions first
        int integerPart = (int)Math.floor(remainingInches);
        float fractionPart = remainingInches - integerPart;
        int eighth = Math.round(fractionPart * 8);
        if (eighth == 0 || eighth == 8) {
          if (this.footInch) {
            (number >= 0 ? this.positiveFootInchFormat : this.negativeFootInchFormat).format(
                new Object [] {feet, Math.round(remainingInches * 8) / 8f}, result, fieldPosition);
          } else {
            (number >= 0 ? this.positiveInchFormat : this.negativeInchFormat).format(
                new Object [] {feet * 12 + Math.round(remainingInches * 8) / 8f}, result, fieldPosition);
          }
        } else {
          if (this.footInch) {
            (number >= 0 ? this.positiveFootInchEighthFormat : this.negativeFootInchEighthFormat).format(
                new Object [] {feet, integerPart, INCH_FRACTION_CHARACTERS [eighth - 1]}, result, fieldPosition);
          } else {
            (number >= 0 ? this.positiveInchEighthFormat : this.negativeInchEighthFormat).format(
                new Object [] {feet * 12 + integerPart, INCH_FRACTION_CHARACTERS [eighth - 1]}, result, fieldPosition);
          }
        }
      } else {
        if (this.footInch) {
          (number >= 0 ? this.positiveFootFormat : this.negativeFootFormat).format(
              new Object [] {feet}, result, fieldPosition);
        } else {
          (number >= 0 ? this.positiveInchFormat : this.negativeInchFormat).format(
              new Object [] {feet * 12}, result, fieldPosition);
        }
      }
      return result;
    }

    @Override
    public Number parse(String text, ParsePosition parsePosition) {
      double value = 0;
      ParsePosition numberPosition = new ParsePosition(parsePosition.getIndex());
      skipWhiteSpaces(text, numberPosition);
      // Parse feet
      int quoteIndex = text.indexOf('\'', parsePosition.getIndex());
      boolean negative = numberPosition.getIndex() < text.length()
          && text.charAt(numberPosition.getIndex()) == this.getDecimalFormatSymbols().getMinusSign();
      boolean footValue = false;
      if (quoteIndex != -1) {
        Number feet = this.footNumberFormat.parse(text, numberPosition);
        if (feet == null) {
          parsePosition.setErrorIndex(numberPosition.getErrorIndex());
          return null;
        }
        skipWhiteSpaces(text, numberPosition);
        if (numberPosition.getIndex() == quoteIndex) {
          value = footToCentimeter(feet.intValue());
          footValue = true;
          numberPosition = new ParsePosition(quoteIndex + 1);
          skipWhiteSpaces(text, numberPosition);
          // Test optional foot inch separator
          if (numberPosition.getIndex() < text.length()
              && this.footInchSeparator.indexOf(text.charAt(numberPosition.getIndex())) >= 0) {
            numberPosition.setIndex(numberPosition.getIndex() + 1);
            skipWhiteSpaces(text, numberPosition);
          }
          if (numberPosition.getIndex() == text.length()) {
            parsePosition.setIndex(text.length());
            return value;
          }
        } else {
          if (getDecimalFormatSymbols().getDecimalSeparator() == text.charAt(numberPosition.getIndex())) {
            ParsePosition decimalNumberPosition = new ParsePosition(parsePosition.getIndex());
            if (this.inchNumberFormat.parse(text, decimalNumberPosition) != null
                && decimalNumberPosition.getIndex() == quoteIndex) {
              // Don't allow a decimal number in front of a quote
              parsePosition.setErrorIndex(numberPosition.getErrorIndex());
              return null;
            }
          }

          // Try to parse beginning as inches
          numberPosition.setIndex(parsePosition.getIndex());
        }
      }
      // Parse inches
      Number inches = this.inchNumberFormat.parse(text, numberPosition);
      if (inches == null) {
        if (footValue) {
          parsePosition.setIndex(numberPosition.getIndex());
          return value;
        } else {
          parsePosition.setErrorIndex(numberPosition.getErrorIndex());
          return null;
        }
      }
      if (negative) {
        if (quoteIndex == -1) {
          value = inchToCentimeter(inches.floatValue());
        } else {
          value -= inchToCentimeter(inches.floatValue());
        }
      } else {
        value += inchToCentimeter(inches.floatValue());
      }
      // Parse fraction
      skipWhiteSpaces(text, numberPosition);
      if (numberPosition.getIndex() == text.length()) {
        parsePosition.setIndex(text.length());
        return value;
      }
      if (text.charAt(numberPosition.getIndex()) == '\"') {
        parsePosition.setIndex(numberPosition.getIndex() + 1);
        return value;
      }

      char fractionChar = text.charAt(numberPosition.getIndex());
      String fractionString = text.length() - numberPosition.getIndex() >= 3
          ? text.substring(numberPosition.getIndex(), numberPosition.getIndex() + 3)
          : null;
      for (int i = 0; i < INCH_FRACTION_CHARACTERS.length; i++) {
        if (INCH_FRACTION_CHARACTERS [i] == fractionChar
            || INCH_FRACTION_STRINGS [i].equals(fractionString)) {
          // Check no decimal fraction was specified
          int lastDecimalSeparatorIndex = text.lastIndexOf(getDecimalFormatSymbols().getDecimalSeparator(),
              numberPosition.getIndex() - 1);
          if (lastDecimalSeparatorIndex > quoteIndex) {
            return null;
          } else {
            if (negative) {
              value -= inchToCentimeter((i + 1) / 8f);
            } else {
              value += inchToCentimeter((i + 1) / 8f);
            }
            parsePosition.setIndex(numberPosition.getIndex()
                + (INCH_FRACTION_CHARACTERS [i] == fractionChar ? 1 : 3));
            skipWhiteSpaces(text, parsePosition);
            if (parsePosition.getIndex() < text.length()
                && text.charAt(parsePosition.getIndex()) == '\"') {
              parsePosition.setIndex(parsePosition.getIndex() + 1);
            }
            return value;
          }
        }
      }

      parsePosition.setIndex(numberPosition.getIndex());
      return value;
    }
  }

  /**
   * A decimal format for square foot.
   */
  private static class SquareFootAreaFormatWithUnit extends DecimalFormat {
    public SquareFootAreaFormatWithUnit(String pattern) {
      super(pattern);
    }

    @Override
    public StringBuffer format(double number, StringBuffer result,
                               FieldPosition fieldPosition) {
      // Convert square centimeter to square foot
      return super.format(number / 929.0304, result, fieldPosition);
    }
  }

  /**
   * Returns a localized name of this unit.
   */
  public abstract String getName();

  /**
   * Returns the value close to the given <code>length</code> in centimeter under magnetism.
   */
  public abstract float getMagnetizedLength(float length, float maxDelta);

  /**
   * Returns the value close to the given length under magnetism for meter units.
   */
  private static float getMagnetizedMeterLength(float length, float maxDelta) {
    // Use a maximum precision of 1 mm depending on maxDelta
    maxDelta *= 2;
    float precision = 1 / 10f;
    if (maxDelta > 100) {
      precision = 100;
    } else if (maxDelta > 10) {
      precision = 10;
    } else if (maxDelta > 5) {
      precision = 5;
    } else if (maxDelta > 1) {
      precision = 1;
    } else if  (maxDelta > 0.5f) {
      precision = 0.5f;
    }
    float magnetizedLength = Math.round(length / precision) * precision;
    if (magnetizedLength == 0 && length > 0) {
      return length;
    } else {
      return magnetizedLength;
    }
  }

  /**
   * Returns the value close to the given length under magnetism for inch units.
   */
  private static float getMagnetizedInchLength(float length, float maxDelta) {
    // Use a maximum precision of 1/8 inch depending on maxDelta
    maxDelta = centimeterToInch(maxDelta) * 2;
    float precision = 1 / 8f;
    if (maxDelta > 6) {
      precision = 6;
    } else if (maxDelta > 3) {
      precision = 3;
    } else if (maxDelta > 1) {
      precision = 1;
    } else if  (maxDelta > 0.5f) {
      precision = 0.5f;
    } else if  (maxDelta > 0.25f) {
      precision = 0.25f;
    }
    float magnetizedLength = inchToCentimeter(Math.round(centimeterToInch(length) / precision) * precision);
    if (magnetizedLength == 0 && length > 0) {
      return length;
    } else {
      return magnetizedLength;
    }
  }

  /**
   * Increases the index of <code>fieldPosition</code> to skip white spaces.
   */
  private static void skipWhiteSpaces(String text, ParsePosition fieldPosition) {
    while (fieldPosition.getIndex() < text.length()
        && Character.isWhitespace(text.charAt(fieldPosition.getIndex()))) {
      fieldPosition.setIndex(fieldPosition.getIndex() + 1);
    }
  }

  /**
   * Returns the minimum value for length in centimeter.
   */
  public abstract float getMinimumLength();

  /**
   * Returns the maximum value for length in centimeter.
   * @since 3.4
   */
  public abstract float getMaximumLength();

  /**
   * Returns the preferred step value for length in centimeter.
   * @since 7.0
   */
  public abstract float getStepSize();

  /**
   * Returns the maximum value for elevation in centimeter.
   * @since 3.4
   */
  public float getMaximumElevation() {
    return getMaximumLength() / 10;
  }

  /**
   * Returns the <code>length</code> given in centimeters converted
   * to a value expressed in this unit.
   * @since 2.0
   */
  public abstract float centimeterToUnit(float length);

  /**
   * Returns the <code>length</code> given in this unit converted
   * to a value expressed in centimeter.
   * @since 2.0
   */
  public abstract float unitToCentimeter(float length);

  /**
   * Returns <code>true</code> if this unit belongs to Metric system.
   * @since 7.0
   */
  public boolean isMetric() {
    return false;
  }
}