/*
 * LengthUnit.java 22 nov. 2008
 *
 * Copyright (c) 2006-2008 Emmanuel PUYBARET / eTeks <info@eteks.com>. All Rights Reserved.
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
import java.util.Locale;
import java.util.ResourceBundle;

/**
 * Unit used for lengths.
 */
public enum LengthUnit {
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
        this.lengthFormatWithUnit = new MeterFamilyFormatWithUnit("#,##0.# " + this.name, 1);          
        this.lengthFormat = new MeterFamilyFormatWithUnit("#,##0.#", 1);
        String squareMeterUnit = resource.getString("squareMeterUnit");
        this.areaFormatWithUnit = new SquareMeterAreaFormatWithUnit(squareMeterUnit);
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
    public float centimeterToUnit(float length) {
      return length;
    }

    @Override
    public float unitToCentimeter(float length) {
      return length;
    }
  }, 
  
  /**
   * Millimeter unit.
   * @since 1.9
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
        this.lengthFormatWithUnit = new MeterFamilyFormatWithUnit("#,##0 " + this.name, 10);          
        this.lengthFormat = new MeterFamilyFormatWithUnit("#,##0", 10);
        String squareMeterUnit = resource.getString("squareMeterUnit");
        this.areaFormatWithUnit = new SquareMeterAreaFormatWithUnit(squareMeterUnit);
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
    public float centimeterToUnit(float length) {
      return length * 10;
    }

    @Override
    public float unitToCentimeter(float length) {
      return length / 10;
    }
  }, 
  
  /**
   * Meter unit.
   * @since 1.9
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
        this.lengthFormatWithUnit = new MeterFamilyFormatWithUnit("#,##0.00# " + this.name, 0.01f);          
        this.lengthFormat = new MeterFamilyFormatWithUnit("#,##0.00#", 0.01f);
        String squareMeterUnit = resource.getString("squareMeterUnit");
        this.areaFormatWithUnit = new SquareMeterAreaFormatWithUnit(squareMeterUnit);
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
    public float centimeterToUnit(float length) {
      return length / 100;
    }

    @Override
    public float unitToCentimeter(float length) {
      return length * 100;
    }
  }, 
  
  /**
   * Inch unit.
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
        
        // Create format for feet and inches
        final Format footFormat = new DecimalFormat("#,##0''");
        final char [] inchFractionCharacters = {'\u215b',   // 1/8
                                                '\u00bc',   // 1/4  
                                                '\u215c',   // 3/8
                                                '\u00bd',   // 1/2
                                                '\u215d',   // 5/8
                                                '\u00be',   // 3/4
                                                '\u215e'};  // 7/8        
        this.lengthFormat = new DecimalFormat("0.000\"") {            
            @Override
            public StringBuffer format(double number, StringBuffer result,
                                       FieldPosition fieldPosition) {
              float feet = (float)Math.floor(centimeterToFoot((float)number));              
              float remainingInches = centimeterToInch((float)number - footToCentimeter(feet));
              if (remainingInches >= 11.9995f) {
                feet++;
                remainingInches -= 12;
              }
              footFormat.format(feet, result, fieldPosition);
              // Format remaining inches only if it's larger that 0.0005
              if (remainingInches >= 0.0005f) {
                // Try to format decimals with 1/8, 1/4, 1/2 fractions first
                int integerPart = (int)Math.floor(remainingInches);
                float fractionPart = remainingInches - integerPart;
                float remainderToClosestEighth = fractionPart % 0.125f;
                if (remainderToClosestEighth <= 0.0005f || remainderToClosestEighth >= 0.1245f) {
                  int eighth = Math.round(fractionPart * 8); 
                  String remainingInchesString;
                  if (eighth == 0 || eighth == 8) {
                    remainingInchesString = Math.round(remainingInches) + "\"";
                  } else {
                    remainingInchesString = String.valueOf(integerPart) + inchFractionCharacters [eighth - 1] + "\"";
                  }
                  result.append(remainingInchesString);
                  fieldPosition.setEndIndex(fieldPosition.getEndIndex() + remainingInchesString.length());
                } else {                
                  super.format(remainingInches, result, fieldPosition);
                }
              }
              return result;
            }
          };
        
        String squareFootUnit = resource.getString("squareFootUnit");
        this.areaFormatWithUnit = new DecimalFormat("#,##0.## " + squareFootUnit){
            @Override
            public StringBuffer format(double number, StringBuffer result,
                                       FieldPosition fieldPosition) {
              // Convert square centimeter to square foot
              return super.format(number / 929.0304, result, fieldPosition);                
            }
          };          
      }
    }
    
    @Override
    public float getMagnetizedLength(float length, float maxDelta) {
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
      return inchToCentimeter(Math.round(centimeterToInch(length) / precision) * precision);
    }

    @Override
    public float getMinimumLength() {        
      return LengthUnit.inchToCentimeter(0.125f);
    }

    @Override
    public float centimeterToUnit(float length) {
      return centimeterToInch(length);
    }

    @Override
    public float unitToCentimeter(float length) {
      return inchToCentimeter(length);
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
   * A decimal format for meter family units.
   */
  private static class MeterFamilyFormatWithUnit extends DecimalFormat {
    private final float unitMultiplier;

    public MeterFamilyFormatWithUnit(String pattern, float unitMultiplier) {
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
  }
  
  /**
   * Returns a format able to format lengths.
   */
  public abstract Format getFormat(); 

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
    return Math.round(length / precision) * precision;
  }

  /**
   * Returns the minimum value for length in centimeter.
   */
  public abstract float getMinimumLength();
  
  /**
   * Returns the <code>length</code> given in centimeters converted 
   * to a value expressed in this unit.
   * @since 1.9
   */
  public abstract float centimeterToUnit(float length);

  /**
   * Returns the <code>length</code> given in this unit converted 
   * to a value expressed in centimeter.
   * @since 1.9
   */
  public abstract float unitToCentimeter(float length);
}