/*
 * LengthUnit.js
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

/**
 * Unit used for lengths.
 * @constructor
 * @author Emmanuel Puybaret
 */
var LengthUnit = {};

/**
 * Returns the value close to the given length under magnetism for meter units.
 * @private
 */
LengthUnit.getMagnetizedMeterLength = function(length, maxDelta) {
  // Use a maximum precision of 1 mm depending on maxDelta
  maxDelta *= 2;
  var precision = 1 / 10.;
  if (maxDelta > 100) {
    precision = 100;
  } else if (maxDelta > 10) {
    precision = 10;
  } else if (maxDelta > 5) {
    precision = 5;
  } else if (maxDelta > 1) {
    precision = 1;
  } else if  (maxDelta > 0.5) {
    precision = 0.5;
  } 
  var magnetizedLength = Math.round(length / precision) * precision;
  if (magnetizedLength === 0 && length > 0) {
    return length;
  } else {
    return magnetizedLength;
  }
}

/**
 * Returns the value close to the given length under magnetism for inch units.
 * @private
 */
LengthUnit.getMagnetizedInchLength = function(length, maxDelta) {
  // Use a maximum precision of 1/8 inch depending on maxDelta
  maxDelta = LengthUnit.centimeterToInch(maxDelta) * 2;
  var precision = 1 / 8.;
  if (maxDelta > 6) {
    precision = 6;
  } else if (maxDelta > 3) {
    precision = 3;
  } else if (maxDelta > 1) {
    precision = 1;
  } else if  (maxDelta > 0.5) {
    precision = 0.5;
  } else if  (maxDelta > 0.25) {
    precision = 0.25;
  }
  var magnetizedLength = LengthUnit.inchToCentimeter(Math.round(LengthUnit.centimeterToInch(length) / precision) * precision);
  if (magnetizedLength === 0 && length > 0) {
    return length;
  } else {
    return magnetizedLength;
  }
}

/**
 * Returns the <code>length</code> given in centimeters converted to inches.
 */
LengthUnit.centimeterToInch = function(length) {
  return length / 2.54;
}

/**
 * Returns the <code>length</code> given in centimeters converted to feet.
 */
LengthUnit.centimeterToFoot = function(length) {
  return length / 2.54 / 12;
}

/**
 * Returns the <code>length</code> given in inches converted to centimeters.
 */
LengthUnit.inchToCentimeter = function(length) {
  return length * 2.54;
}

/**
 * Returns the <code>length</code> given in feet converted to centimeters.
 */
LengthUnit.footToCentimeter = function(length) {
  return length * 2.54 * 12;
}


/**
 * Millimeter unit.
 */
LengthUnit.MILLIMETER = {formatLocale : null};
  
LengthUnit.MILLIMETER.getFormatWithUnit = function() {
  this.checkLocaleChange();
  return this.lengthFormatWithUnit;
}

LengthUnit.MILLIMETER.getAreaFormatWithUnit = function() {
  this.checkLocaleChange();
  return this.areaFormatWithUnit;
}

LengthUnit.MILLIMETER.getFormat = function() {
  this.checkLocaleChange();
  return this.lengthFormat;
}

LengthUnit.MILLIMETER.getName = function() {
  this.checkLocaleChange();
  return this.name;
}

LengthUnit.MILLIMETER.checkLocaleChange = function() {
  // Instantiate formats if locale changed
  if (Locale.getDefault() != this.formatLocale) {
    this.formatLocale = Locale.getDefault();  
    var resource = loadResourceBundles("lib/generated/LengthUnit", this.formatLocale);
    this.name = getStringFromKey(resource, "millimeterUnit");
    var groupingSeparator = getStringFromKey(resource, "groupingSeparator");
    var decimalSeparator = getStringFromKey(resource, "decimalSeparator");
    this.lengthFormatWithUnit = new MeterFamilyFormat(groupingSeparator, decimalSeparator, "", 10, this.name);          
    this.lengthFormat = new MeterFamilyFormat(groupingSeparator, decimalSeparator, "", 10);
    var squareMeterUnit = getStringFromKey(resource, "squareMeterUnit");
    this.areaFormatWithUnit = new SquareMeterAreaFormatWithUnit(groupingSeparator, decimalSeparator, squareMeterUnit);
  }
}

LengthUnit.MILLIMETER.getMagnetizedLength = function(length, maxDelta) {
  return LengthUnit.getMagnetizedMeterLength(length, maxDelta);
}

LengthUnit.MILLIMETER.getMinimumLength = function() {
  return 0.1;
}

LengthUnit.MILLIMETER.getMaximumLength = function() {
  return 100000.;
}

LengthUnit.MILLIMETER.getMaximumElevation = function() {
  return this.getMaximumLength() / 10;
}

LengthUnit.MILLIMETER.centimeterToUnit = function(length) {
  return length * 10.;
}

LengthUnit.MILLIMETER.unitToCentimeter = function(length) {
  return length / 10.;
}
 

/**
 * Centimeter unit.
 */
LengthUnit.CENTIMETER = {formatLocale : null};
  
LengthUnit.CENTIMETER.getFormatWithUnit = function() {
  this.checkLocaleChange();
  return this.lengthFormatWithUnit;
}

LengthUnit.CENTIMETER.getAreaFormatWithUnit = function() {
  this.checkLocaleChange();
  return this.areaFormatWithUnit;
}

LengthUnit.CENTIMETER.getFormat = function() {
  this.checkLocaleChange();
  return this.lengthFormat;
}
  
LengthUnit.CENTIMETER.getName = function() {
  this.checkLocaleChange();
  return this.name;
}
  
LengthUnit.CENTIMETER.checkLocaleChange = function() {
  // Instantiate formats if locale changed
  if (Locale.getDefault() != this.formatLocale) {
    this.formatLocale = Locale.getDefault();  
    var resource = loadResourceBundles("lib/generated/LengthUnit", this.formatLocale);
    this.name = getStringFromKey(resource, "centimeterUnit");
    var groupingSeparator = getStringFromKey(resource, "groupingSeparator");
    var decimalSeparator = getStringFromKey(resource, "decimalSeparator");
    this.lengthFormatWithUnit = new MeterFamilyFormat(groupingSeparator, decimalSeparator, "#", 1, this.name);          
    this.lengthFormat = new MeterFamilyFormat(groupingSeparator, decimalSeparator, "#", 1);
    var squareMeterUnit = getStringFromKey(resource, "squareMeterUnit");
    this.areaFormatWithUnit = new SquareMeterAreaFormatWithUnit(groupingSeparator, decimalSeparator, squareMeterUnit);
  }
}

LengthUnit.CENTIMETER.getMagnetizedLength = function(length, maxDelta) {
  return LengthUnit.getMagnetizedMeterLength(length, maxDelta);
}

LengthUnit.CENTIMETER.getMinimumLength = function() {
  return 0.1;
}
  
LengthUnit.CENTIMETER.getMaximumLength = function() {
  return 100000.;
}

LengthUnit.CENTIMETER.getMaximumElevation = function() {
  return this.getMaximumLength() / 10;
}

LengthUnit.CENTIMETER.centimeterToUnit = function(length) {
  return length;
}

LengthUnit.CENTIMETER.unitToCentimeter = function(length) {
  return length;
} 

/**
 * Meter unit.
 */
LengthUnit.METER = {formatLocale : null};
  
LengthUnit.METER.getFormatWithUnit = function() {
  this.checkLocaleChange();
  return this.lengthFormatWithUnit;
}

LengthUnit.METER.getAreaFormatWithUnit = function() {
  this.checkLocaleChange();
  return this.areaFormatWithUnit;
}

LengthUnit.METER.getFormat = function() {
  this.checkLocaleChange();
  return this.lengthFormat;
}

LengthUnit.METER.getName = function() {
  this.checkLocaleChange();
  return this.name;
}

LengthUnit.METER.checkLocaleChange = function() {
  // Instantiate formats if locale changed
  if (Locale.getDefault() != this.formatLocale) {
    this.formatLocale = Locale.getDefault();
    var resource = loadResourceBundles("lib/generated/LengthUnit", this.formatLocale);
    this.name = getStringFromKey(resource, "meterUnit");
    var groupingSeparator = getStringFromKey(resource, "groupingSeparator");
    var decimalSeparator = getStringFromKey(resource, "decimalSeparator");
    this.lengthFormatWithUnit = new MeterFamilyFormat(groupingSeparator, decimalSeparator, "00#", 0.01, this.name);          
    this.lengthFormat = new MeterFamilyFormat(groupingSeparator, decimalSeparator, "00#", 0.01);
    var squareMeterUnit = getStringFromKey(resource, "squareMeterUnit");
    this.areaFormatWithUnit = new SquareMeterAreaFormatWithUnit(groupingSeparator, decimalSeparator, squareMeterUnit);
  }
}

LengthUnit.METER.getMagnetizedLength = function(length, maxDelta) {
  return LengthUnit.getMagnetizedMeterLength(length, maxDelta);
}

LengthUnit.METER.getMinimumLength = function() {
  return 0.1;
}

LengthUnit.METER.getMaximumLength = function() {
  return 100000.;
}

LengthUnit.METER.getMaximumElevation = function() {
  return this.getMaximumLength() / 10;
}

LengthUnit.METER.centimeterToUnit = function(length) {
  return length / 100;
}

LengthUnit.METER.unitToCentimeter = function(length) {
  return length * 100;
}


/**
 * Foot/Inch unit followed by fractions.
 */
LengthUnit.INCH = {formatLocale : null};

LengthUnit.INCH.getFormatWithUnit = function() {
  this.checkLocaleChange();
  return this.lengthFormat;
}

LengthUnit.INCH.getFormat = function() {
  return this.getFormatWithUnit();
}

LengthUnit.INCH.getAreaFormatWithUnit = function() {
  this.checkLocaleChange();
  return this.areaFormatWithUnit;
}

LengthUnit.INCH.getName = function() {
  this.checkLocaleChange();
  return this.name;
}

LengthUnit.INCH.checkLocaleChange = function() {
  // Instantiate format if locale changed
  if (Locale.getDefault() != this.formatLocale) {
    this.formatLocale = Locale.getDefault();
    var resource = loadResourceBundles("lib/generated/LengthUnit", this.formatLocale);
    this.name = getStringFromKey(resource, "inchUnit");
    this.lengthFormat = new InchFormat(this.name);
    this.lengthFormatWithUnit = new InchFormat(this.name);
    var squareFootUnit = getStringFromKey(resource, "squareFootUnit");
    this.areaFormatWithUnit = new SquareFootAreaFormatWithUnit(this.formatLocale, squareFootUnit);
    
    // Create format for feet and inches
//    final MessageFormat positiveFootFormat = new MessageFormat("{0,number,integer}''");
//    final MessageFormat positiveFootInchFormat = new MessageFormat("{0,number,integer}''{1,number}\"");
//    final MessageFormat positiveFootInchEighthFormat = new MessageFormat("{0,number,integer}''{1,number,integer}{2}\"");
//    final MessageFormat negativeFootFormat = new MessageFormat("-{0,number,integer}''");
//    final MessageFormat negativeFootInchFormat = new MessageFormat("-{0,number,integer}''{1,number}\"");
//    final MessageFormat negativeFootInchEighthFormat = new MessageFormat("-{0,number,integer}''{1,number,integer}{2}\"");
//    final String        footInchSeparator = "";
//    final NumberFormat  footNumberFormat = NumberFormat.getIntegerInstance();
//    final NumberFormat  inchNumberFormat = NumberFormat.getNumberInstance();
//    var inchFractionCharacters = ['\u215b',   // 1/8
//                                  '\u00bc',   // 1/4  
//                                  '\u215c',   // 3/8
//                                  '\u00bd',   // 1/2
//                                  '\u215d',   // 5/8
//                                  '\u00be',   // 3/4
//                                  '\u215e'];  // 7/8        
//    var inchFractionStrings  = ["1/8",
//                                "1/4",  
//                                "3/8",
//                                "1/2",
//                                "5/8",
//                                "3/4",
//                                "7/8"];         
//    this.lengthFormat = new DecimalFormat("0.000\"") {
//        public StringBuffer format(double number, StringBuffer result,
//                                   FieldPosition fieldPosition) {
//          var absoluteValue = Math.abs((float)number);
//          double feet = Math.floor(LengthUnit.centimeterToFoot(absoluteValue));              
//          var remainingInches = LengthUnit.centimeterToInch((float)absoluteValue - LengthUnit.footToCentimeter((float)feet));
//          if (remainingInches >= 11.9375f) {
//            feet++;
//            remainingInches -= 12;
//          }
//          fieldPosition.setEndIndex(fieldPosition.getEndIndex() + 1);
//          // Format remaining inches only if it's larger that 0.0005
//          if (remainingInches >= 0.0005f) {
//            // Try to format decimals with 1/8, 1/4, 1/2 fractions first
//            int integerPart = (int)Math.floor(remainingInches);
//            var fractionPart = remainingInches - integerPart;
//            int eighth = Math.round(fractionPart * 8); 
//            if (eighth === 0 || eighth === 8) {
//              (number >= 0 ? positiveFootInchFormat : negativeFootInchFormat).format(
//                  new Object [] {feet, Math.round(remainingInches * 8) / 8f}, result, fieldPosition);
//            } else { 
//              (number >= 0 ? positiveFootInchEighthFormat : negativeFootInchEighthFormat).format(
//                  new Object [] {feet, integerPart, inchFractionCharacters [eighth - 1]}, result, fieldPosition);
//            }
//          } else {
//            (number >= 0 ? positiveFootFormat : negativeFootFormat).format(
//                new Object [] {feet}, result, fieldPosition);
//          }
//          return result;
//        }
//        
//        public Number parse(String text, ParsePosition parsePosition) {
//          double value = 0;
//          ParsePosition numberPosition = new ParsePosition(parsePosition.getIndex());
//          skipWhiteSpaces(text, numberPosition);
//          // Parse feet
//          int quoteIndex = text.indexOf('\'', parsePosition.getIndex());
//          boolean negative = numberPosition.getIndex() < text.length()  
//              && text.charAt(numberPosition.getIndex()) === this.getDecimalFormatSymbols().getMinusSign();
//          if (quoteIndex != -1) {
//            Number feet = footNumberFormat.parse(text, numberPosition);
//            if (feet === null) {
//              parsePosition.setErrorIndex(numberPosition.getErrorIndex());
//              return null;
//            }
//            skipWhiteSpaces(text, numberPosition);
//            if (numberPosition.getIndex() != quoteIndex) {
//              parsePosition.setErrorIndex(numberPosition.getIndex());
//              return null;
//            }
//            value = LengthUnit.footToCentimeter(feet.intValue());                
//            numberPosition = new ParsePosition(quoteIndex + 1);
//            skipWhiteSpaces(text, numberPosition);
//            // Test optional foot inch separator
//            if (numberPosition.getIndex() < text.length()
//                && footInchSeparator.indexOf(text.charAt(numberPosition.getIndex())) >= 0) {
//              numberPosition.setIndex(numberPosition.getIndex() + 1);
//              skipWhiteSpaces(text, numberPosition);
//            }
//            if (numberPosition.getIndex() === text.length()) {
//              parsePosition.setIndex(text.length());
//              return value;
//            }
//          } 
//          // Parse inches
//          Number inches = inchNumberFormat.parse(text, numberPosition);
//          if (inches === null) {
//            parsePosition.setErrorIndex(numberPosition.getErrorIndex());
//            return null;
//          }
//          if (negative) {
//            if (quoteIndex === -1) {
//              value = inchToCentimeter(inches.floatValue());
//            } else {
//              value -= inchToCentimeter(inches.floatValue());
//            }
//          } else {
//            value += inchToCentimeter(inches.floatValue());
//          }
//          // Parse fraction
//          skipWhiteSpaces(text, numberPosition);
//          if (numberPosition.getIndex() === text.length()) {
//            parsePosition.setIndex(text.length());
//            return value;
//          }
//          if (text.charAt(numberPosition.getIndex()) === '\"') {
//            parsePosition.setIndex(numberPosition.getIndex() + 1);
//            return value;
//          }
//
//          var fractionChar = text.charAt(numberPosition.getIndex());    
//          var fractionString = text.length() - numberPosition.getIndex() >= 3 
//              ? text.substring(numberPosition.getIndex(), numberPosition.getIndex() + 3)
//              : null;
//          for (var i = 0; i < inchFractionCharacters.length; i++) {
//            if (inchFractionCharacters [i] === fractionChar
//                || inchFractionStrings [i] == fractionString) {
//              // Check no decimal fraction was specified
//              int lastDecimalSeparatorIndex = text.lastIndexOf(getDecimalFormatSymbols().getDecimalSeparator(), 
//                  numberPosition.getIndex() - 1);
//              if (lastDecimalSeparatorIndex > quoteIndex) {
//                return null;
//              } else {
//                if (negative) {
//                  value -= inchToCentimeter((i + 1) / 8f);
//                } else {
//                  value += inchToCentimeter((i + 1) / 8f);
//                }
//                parsePosition.setIndex(numberPosition.getIndex() 
//                    + (inchFractionCharacters [i] === fractionChar ? 1 : 3));
//                skipWhiteSpaces(text, parsePosition);
//                if (parsePosition.getIndex() < text.length() 
//                    && text.charAt(parsePosition.getIndex()) === '\"') {
//                  parsePosition.setIndex(parsePosition.getIndex() + 1);
//                }
//                return value;
//              }
//            }
//          }
//          
//          parsePosition.setIndex(numberPosition.getIndex());
//          return value;
//        }
//        
//        /**
//         * Increases the index of <code>fieldPosition</code> to skip white spaces. 
//         */
//        private void skipWhiteSpaces(String text, ParsePosition fieldPosition) {
//          while (fieldPosition.getIndex() < text.length()
//              && Character.isWhitespace(text.charAt(fieldPosition.getIndex()))) {
//            fieldPosition.setIndex(fieldPosition.getIndex() + 1);
//          }
//        }
//      };
    
  }
}

LengthUnit.INCH.getMagnetizedLength = function(length, maxDelta) {
  return LengthUnit.getMagnetizedInchLength(length, maxDelta);
}

LengthUnit.INCH.getMinimumLength = function() {        
  return LengthUnit.inchToCentimeter(0.125);
}

LengthUnit.INCH.getMaximumLength = function() {
  return LengthUnit.inchToCentimeter(99974.4); // 3280 ft
}

LengthUnit.INCH.getMaximumElevation = function() {
  return this.getMaximumLength() / 10;
}

LengthUnit.INCH.centimeterToUnit = function(length) {
  return LengthUnit.centimeterToInch(length);
}

LengthUnit.INCH.unitToCentimeter = function(length) {
  return LengthUnit.inchToCentimeter(length);
}


/**
 * Inch unit with decimals.
 */
LengthUnit.INCH_DECIMALS = {formatLocale : null};

LengthUnit.INCH_DECIMALS.getFormatWithUnit = function() {
  this.checkLocaleChange();
  return this.lengthFormatWithUnit;
}

LengthUnit.INCH_DECIMALS.getFormat = function() {
  this.checkLocaleChange();
  return this.lengthFormat;
}

LengthUnit.INCH_DECIMALS.getAreaFormatWithUnit = function() {
  this.checkLocaleChange();
  return this.areaFormatWithUnit;
}

LengthUnit.INCH_DECIMALS.getName = function() {
  this.checkLocaleChange();
  return this.name;
}
  
LengthUnit.INCH_DECIMALS.checkLocaleChange = function() {
  
  // Instantiate format if locale changed
  if (Locale.getDefault() != this.formatLocale) {
    this.formatLocale = Locale.getDefault();  
    var resource = loadResourceBundles("lib/generated/LengthUnit", this.formatLocale);
    this.name = getStringFromKey(resource, "inchUnit");
    
    // Create formats for inches with decimals
//    class InchDecimalsFormat extends DecimalFormat {
//      private final MessageFormat inchDecimalsFormat;
//      private final NumberFormat  inchNumberFormat = NumberFormat.getNumberInstance();
//
//      private InchDecimalsFormat(MessageFormat inchDecimalsFormat) {
//        super("0.###");
//        this.inchDecimalsFormat = inchDecimalsFormat;
//      }
//
//      public StringBuffer format(double number, StringBuffer result,
//                                 FieldPosition fieldPosition) {
//        var inches = centimeterToInch((float)number);
//        fieldPosition.setEndIndex(fieldPosition.getEndIndex() + 1);
//        this.inchDecimalsFormat.format(new Object [] {inches}, result, fieldPosition);
//        return result;
//      }
//
//      public Number parse(String text, ParsePosition parsePosition) {
//        ParsePosition numberPosition = new ParsePosition(parsePosition.getIndex());
//        skipWhiteSpaces(text, numberPosition);
//        // Parse inches
//        Number inches = this.inchNumberFormat.parse(text, numberPosition);
//        if (inches === null) {
//          parsePosition.setErrorIndex(numberPosition.getErrorIndex());
//          return null;
//        }
//        double value = LengthUnit.inchToCentimeter(inches.floatValue());
//        // Parse "
//        skipWhiteSpaces(text, numberPosition);
//        if (numberPosition.getIndex() < text.length() 
//            && text.charAt(numberPosition.getIndex()) === '\"') {
//          parsePosition.setIndex(numberPosition.getIndex() + 1);
//        } else {
//          parsePosition.setIndex(numberPosition.getIndex());
//        }
//        return value;
//      }
//
//      /**
//       * Increases the index of <code>fieldPosition</code> to skip white spaces. 
//       */
//      private void skipWhiteSpaces(String text, ParsePosition fieldPosition) {
//        while (fieldPosition.getIndex() < text.length()
//            && Character.isWhitespace(text.charAt(fieldPosition.getIndex()))) {
//          fieldPosition.setIndex(fieldPosition.getIndex() + 1);
//        }
//      }
//    }
    this.lengthFormat = new InchDecimalsFormat(new MessageFormat(resource.getString("inchDecimalsFormat")));
    this.lengthFormatWithUnit = new InchDecimalsFormat(new MessageFormat(resource.getString("inchDecimalsFormatWithUnit")));
    
    var squareFootUnit = getStringFromKey(resource, "squareFootUnit");
    this.areaFormatWithUnit = new SquareFootAreaFormatWithUnit(this.formatLocale, squareFootUnit);
  }
}
  
LengthUnit.INCH_DECIMALS.getMagnetizedLength = function(length, maxDelta) {
  return LengthUnit.getMagnetizedInchLength(length, maxDelta);
}

LengthUnit.INCH_DECIMALS.getMinimumLength = function() {        
  return LengthUnit.inchToCentimeter(0.125);
}

LengthUnit.INCH_DECIMALS.getMaximumLength = function() {
  return LengthUnit.inchToCentimeter(99974.4); // 3280 ft
}

LengthUnit.INCH_DECIMALS.getMaximumElevation = function() {
  return this.getMaximumLength() / 10;
}

LengthUnit.INCH_DECIMALS.centimeterToUnit = function(length) {
  return centimeterToInch(length);
}

LengthUnit.INCH_DECIMALS.unitToCentimeter = function(length) {
  return LengthUnit.inchToCentimeter(length);
}

///**
// * A decimal format for meter family units.
// */
//private static class MeterFamilyFormat extends DecimalFormat {
//  private final float unitMultiplier;
//
//  public MeterFamilyFormat(String pattern, float unitMultiplier) {
//    super(pattern);
//    this.unitMultiplier = unitMultiplier;
//    
//  }
//
//  public StringBuffer format(double number, StringBuffer result,
//                             FieldPosition fieldPosition) {
//    // Convert centimeter to millimeter
//    return super.format(number * this.unitMultiplier, result, fieldPosition);                
//  }
//
//  public StringBuffer format(long number, StringBuffer result,
//                             FieldPosition fieldPosition) {
//    return format((double)number, result, fieldPosition);
//  }
//  
//  public Number parse(String text, ParsePosition pos) {
//    Number number = super.parse(text, pos);
//    if (number === null) {
//      return null;
//    } else {
//      return number.floatValue() / this.unitMultiplier;
//    }
//  }
//}
//
///**
// * A decimal format for square meter.
// */
//private static class SquareMeterAreaFormatWithUnit extends DecimalFormat {
//  public SquareMeterAreaFormatWithUnit(String squareMeterUnit) {
//    super("#,##0.## " + squareMeterUnit);
//  }
//  
//  public StringBuffer format(double number, StringBuffer result,
//                             FieldPosition fieldPosition) {
//    // Convert square centimeter to square meter
//    return super.format(number / 10000, result, fieldPosition);                
//  }
//}
//
///**
// * A decimal format for square foot.
// */
//private static class SquareFootAreaFormatWithUnit extends DecimalFormat {
//  public SquareFootAreaFormatWithUnit(String pattern) {
//    super(pattern);
//  }
//  
//  public StringBuffer format(double number, StringBuffer result,
//                             FieldPosition fieldPosition) {
//    // Convert square centimeter to square foot
//      return super.format(number / 929.0304, result, fieldPosition);                
//    }
//  }
//}

function MeterFamilyFormat(groupingSeparator, decimalSeparator, decimalsFormat, unitMultiplier, unit) {
  Format.call(this);
  this.groupingSeparator = groupingSeparator;
  this.decimalSeparator = decimalSeparator;
  this.decimalsFormat = decimalsFormat;
  this.unitMultiplier = unitMultiplier;
  this.unit = unit;
}
MeterFamilyFormat.prototype = Object.create(Format.prototype);
MeterFamilyFormat.prototype.constructor = MeterFamilyFormat;

MeterFamilyFormat.prototype.format = function(number) {
  var formattedNumber = (number * this.unitMultiplier).toLocaleString("en", { maximumFractionDigits: this.decimalsFormat.length, minimumFractionDigits: this.decimalsFormat.split("0").length - 1 });
  formattedNumber = formattedNumber.replace(".", "#").replace(",", this.groupingSeparator).replace("#", this.decimalSeparator).replace(' ', '\u00a0');
  return formattedNumber + (this.unit ? " " + this.unit : "");
}

function SquareMeterAreaFormatWithUnit(groupingSeparator, decimalSeparator, unit) {
  Format.call(this);
  this.groupingSeparator = groupingSeparator;
  this.decimalSeparator = decimalSeparator;
  this.unit = unit;
}
SquareMeterAreaFormatWithUnit.prototype = Object.create(Format.prototype);
SquareMeterAreaFormatWithUnit.prototype.constructor = SquareMeterAreaFormatWithUnit;

SquareMeterAreaFormatWithUnit.prototype.format = function(number) {
  var formattedNumber = (number / 10000).toLocaleString("en", { maximumFractionDigits: 2, minimumFractionDigits: 0 });
  formattedNumber = formattedNumber.replace(".", "#").replace(",", this.groupingSeparator).replace("#", this.decimalSeparator).replace(' ', '\u00a0');
  return formattedNumber + (this.unit ? " " + this.unit : "");
}

var inchFractionCharacters = ['\u215b',   // 1/8
                              '\u00bc',   // 1/4  
                              '\u215c',   // 3/8
                              '\u00bd',   // 1/2
                              '\u215d',   // 5/8
                              '\u00be',   // 3/4
                              '\u215e'];  // 7/8        

function InchFormat(unit) {
  Format.call(this);
  this.unit = unit;
}
InchFormat.prototype = Object.create(Format.prototype);
InchFormat.prototype.constructor = InchFormat;

InchFormat.prototype.format = function(number) {
  var absoluteValue = Math.abs(number);
  var feet = Math.floor(LengthUnit.centimeterToFoot(absoluteValue));              
  var remainingInches = LengthUnit.centimeterToInch(absoluteValue - LengthUnit.footToCentimeter(feet));
  if (remainingInches >= 11.9375) {
    feet++;
    remainingInches -= 12;
  }
  //fieldPosition.setEndIndex(fieldPosition.getEndIndex() + 1);
  var result = number >= 0 ? "" : "-";
  // Format remaining inches only if it's larger that 0.0005
  if (remainingInches >= 0.0005) {
    // Try to format decimals with 1/8, 1/4, 1/2 fractions first
    var integerPart = Math.floor(remainingInches);
    var fractionPart = remainingInches - integerPart;
    var eighth = Math.round(fractionPart * 8); 
    result += feet;
    if (eighth === 0 || eighth === 8) {
      result += "'";
      result += Math.round(remainingInches * 8) / 8;
      result += "\"";
    } else {
      result += "'";
      result += integerPart;
      result += inchFractionCharacters[eighth - 1];
      result += "\"";
    }
  } else {
    result += feet;
    result += "'";
  }
  return result;
}

function SquareFootAreaFormatWithUnit(groupingSeparator, decimalSeparator, unit) {
  Format.call(this);
  this.groupingSeparator = groupingSeparator;
  this.decimalSeparator = decimalSeparator;
  this.unit = unit;
}
SquareFootAreaFormatWithUnit.prototype = Object.create(Format.prototype);
SquareFootAreaFormatWithUnit.prototype.constructor = SquareFootAreaFormatWithUnit;

SquareFootAreaFormatWithUnit.prototype.format = function(number) {
  var formattedNumber = (number / 929.0304).toLocaleString("en", { maximumFractionDigits: 2, minimumFractionDigits: 0 });
  formattedNumber = formattedNumber.replace(".", "#").replace(",", this.groupingSeparator).replace("#", this.decimalSeparator).replace(' ', '\u00a0');
  return formattedNumber + (this.unit ? " " + this.unit : "");
}

