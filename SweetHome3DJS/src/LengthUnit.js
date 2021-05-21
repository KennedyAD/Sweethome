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
    var resource = CoreTools.loadResourceBundles("resources/LengthUnit", this.formatLocale);
    this.name = CoreTools.getStringFromKey(resource, "millimeterUnit");
    var groupingSeparator = CoreTools.getStringFromKey(resource, "groupingSeparator");
    var decimalSeparator = CoreTools.getStringFromKey(resource, "decimalSeparator");
    var minusSign = CoreTools.getStringFromKey(resource, "minusSign");
    this.lengthFormatWithUnit = new MeterFamilyFormat(groupingSeparator, decimalSeparator, minusSign, "", 10, this.name);          
    this.lengthFormat = new MeterFamilyFormat(groupingSeparator, decimalSeparator, minusSign, "", 10);
    var squareMeterUnit = CoreTools.getStringFromKey(resource, "squareMeterUnit");
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
    var resource = CoreTools.loadResourceBundles("resources/LengthUnit", this.formatLocale);
    this.name = CoreTools.getStringFromKey(resource, "centimeterUnit");
    var groupingSeparator = CoreTools.getStringFromKey(resource, "groupingSeparator");
    var decimalSeparator = CoreTools.getStringFromKey(resource, "decimalSeparator");
    var minusSign = CoreTools.getStringFromKey(resource, "minusSign");
    this.lengthFormatWithUnit = new MeterFamilyFormat(groupingSeparator, decimalSeparator, minusSign, "#", 1, this.name);          
    this.lengthFormat = new MeterFamilyFormat(groupingSeparator, decimalSeparator, minusSign, "#", 1);
    var squareMeterUnit = CoreTools.getStringFromKey(resource, "squareMeterUnit");
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
    var resource = CoreTools.loadResourceBundles("resources/LengthUnit", this.formatLocale);
    this.name = CoreTools.getStringFromKey(resource, "meterUnit");
    var groupingSeparator = CoreTools.getStringFromKey(resource, "groupingSeparator");
    var decimalSeparator = CoreTools.getStringFromKey(resource, "decimalSeparator");
    var minusSign = CoreTools.getStringFromKey(resource, "minusSign");
    this.lengthFormatWithUnit = new MeterFamilyFormat(groupingSeparator, decimalSeparator, minusSign, "00#", 0.01, this.name);          
    this.lengthFormat = new MeterFamilyFormat(groupingSeparator, decimalSeparator, minusSign, "00#", 0.01);
    var squareMeterUnit = CoreTools.getStringFromKey(resource, "squareMeterUnit");
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
    var resource = CoreTools.loadResourceBundles("resources/LengthUnit", this.formatLocale);
    this.name = CoreTools.getStringFromKey(resource, "inchUnit");
    var groupingSeparator = CoreTools.getStringFromKey(resource, "groupingSeparator");
    var decimalSeparator = CoreTools.getStringFromKey(resource, "decimalSeparator");
    var minusSign = CoreTools.getStringFromKey(resource, "minusSign");
    var footInchSeparator = CoreTools.getStringFromKey(resource, "footInchSeparator");
    this.lengthFormat = new InchFormat(groupingSeparator, decimalSeparator, minusSign, footInchSeparator);
    var squareFootUnit = CoreTools.getStringFromKey(resource, "squareFootUnit");
    this.areaFormatWithUnit = new SquareFootAreaFormatWithUnit(this.formatLocale, squareFootUnit);
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
    var resource = CoreTools.loadResourceBundles("resources/LengthUnit", this.formatLocale);
    this.name = CoreTools.getStringFromKey(resource, "inchUnit");
    var groupingSeparator = CoreTools.getStringFromKey(resource, "groupingSeparator");
    var decimalSeparator = CoreTools.getStringFromKey(resource, "decimalSeparator");
    var minusSign = CoreTools.getStringFromKey(resource, "minusSign");
    this.lengthFormat = new InchDecimalFormat(groupingSeparator, decimalSeparator, minusSign, "###");
    this.lengthFormatWithUnit = new InchDecimalFormat(groupingSeparator, decimalSeparator, minusSign, "###", "\""); 
    var squareFootUnit = CoreTools.getStringFromKey(resource, "squareFootUnit");
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

// Specific format classes for lengths

/** @private */
function MeterFamilyFormat(groupingSeparator, decimalSeparator, minusSign, 
                           decimalsFormat, unitMultiplier, unit) {
  Format.call(this);
  this.groupingSeparator = groupingSeparator;
  this.groupingUsed = true;
  this.decimalSeparator = decimalSeparator;
  this.minusSign = minusSign;
  this.decimalsFormat = decimalsFormat;
  this.unitMultiplier = unitMultiplier;
  this.unit = unit;
}
MeterFamilyFormat.prototype = Object.create(Format.prototype);
MeterFamilyFormat.prototype.constructor = MeterFamilyFormat;

MeterFamilyFormat.prototype.format = function(number) {
  var formattedNumber = toLocaleStringUniversal(number * this.unitMultiplier, 
      this.groupingSeparator, this.groupingUsed, this.decimalSeparator, this.minusSign,
      { maximumFractionDigits: this.decimalsFormat.length, minimumFractionDigits: this.decimalsFormat.split("0").length - 1 }); 
  return formattedNumber + (this.unit ? " " + this.unit : "");
}

MeterFamilyFormat.prototype.parse = function(text, parsePosition) {
  var number = parseLocalizedNumber(text, parsePosition, this.decimalSeparator, this.minusSign);
  if (number === null) {
    return null;
  } else {
    return number / this.unitMultiplier;
  }
}

MeterFamilyFormat.prototype.setGroupingUsed = function(groupingUsed) {
  this.groupingUsed = groupingUsed;
}

MeterFamilyFormat.prototype.isGroupingUsed = function() {
  return this.groupingUsed;
}

/** @private */
function SquareMeterAreaFormatWithUnit(groupingSeparator, decimalSeparator, unit) {
  Format.call(this);
  this.groupingSeparator = groupingSeparator;
  this.decimalSeparator = decimalSeparator;
  this.unit = unit;
}
SquareMeterAreaFormatWithUnit.prototype = Object.create(Format.prototype);
SquareMeterAreaFormatWithUnit.prototype.constructor = SquareMeterAreaFormatWithUnit;

SquareMeterAreaFormatWithUnit.prototype.format = function(number) {
  var formattedNumber = toLocaleStringUniversal(number / 10000, 
      this.groupingSeparator, true, this.decimalSeparator, 
      { maximumFractionDigits: 2, minimumFractionDigits: 0 }); 
  return formattedNumber + (this.unit ? " " + this.unit : "");
}

var inchFractionCharacters = ['\u215b',   // 1/8
                              '\u00bc',   // 1/4  
                              '\u215c',   // 3/8
                              '\u00bd',   // 1/2
                              '\u215d',   // 5/8
                              '\u00be',   // 3/4
                              '\u215e'];  // 7/8        

/** @private */
function InchFormat(groupingSeparator, decimalSeparator, minusSign, footInchSeparator) {
  Format.call(this);
  this.groupingSeparator = groupingSeparator;
  this.groupingUsed = true;
  this.decimalSeparator = decimalSeparator;
  this.minusSign = minusSign;
  this.footInchSeparator = footInchSeparator;
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
  // fieldPosition.setEndIndex(fieldPosition.getEndIndex() + 1);
  var result = number >= 0 ? "" : "-";
  // Format remaining inches only if it's larger that 0.0005
  var feetString = toLocaleStringUniversal(feet, this.groupingSeparator, this.groupingUsed, this.decimalSeparator, this.minusSign,
        { maximumFractionDigits: 0, minimumFractionDigits: 0 });
  if (remainingInches >= 0.0005) {
    // Try to format decimals with 1/8, 1/4, 1/2 fractions first
    var integerPart = Math.floor(remainingInches);
    var fractionPart = remainingInches - integerPart;
    var eighth = Math.round(fractionPart * 8); 
    result += feetString;
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
    result += feetString;
    result += "'";
  }
  return result;
}

var inchFractionStrings = ["1/8",
                           "1/4",  
                           "3/8",
                           "1/2",
                           "5/8",
                           "3/4",
                           "7/8"];     

InchFormat.prototype.parse = function(text, parsePosition) {
  var value = 0;
  var numberPosition = new ParsePosition(parsePosition.getIndex());
  this.skipWhiteSpaces(text, numberPosition);
  // Parse feet
  var quoteIndex = text.indexOf('\'', parsePosition.getIndex());
  var negative = numberPosition.getIndex() < text.length  
      && text.charAt(numberPosition.getIndex()) === this.minusSign;
  var footValue = false;
  if (quoteIndex !== -1) {
    var feet = parseLocalizedNumber(text, numberPosition, this.minusSign);
    if (feet === null) {
      parsePosition.setErrorIndex(numberPosition.getErrorIndex());
      return null;
    }
    this.skipWhiteSpaces(text, numberPosition);
    if (numberPosition.getIndex() === quoteIndex) {
      value = LengthUnit.footToCentimeter(feet);
      footValue = true;
      numberPosition = new ParsePosition(quoteIndex + 1);
      this.skipWhiteSpaces(text, numberPosition);
      // Test optional foot inch separator
      if (numberPosition.getIndex() < text.length
          && this.footInchSeparator.indexOf(text.charAt(numberPosition.getIndex())) >= 0) {
        numberPosition.setIndex(numberPosition.getIndex() + 1);
        this.skipWhiteSpaces(text, numberPosition);
      }
      if (numberPosition.getIndex() === text.length) {
        parsePosition.setIndex(text.length);
        return value;
      }
    } else {
      if (this.decimalSeparator === text.charAt(numberPosition.getIndex())) {
        var decimalNumberPosition = new ParsePosition(parsePosition.getIndex());
        if (parseLocalizedNumber(text, decimalNumberPosition, this.decimalSeparator, this.minusSign) !== null
            && decimalNumberPosition.getIndex() === quoteIndex) {
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
  var inches = parseLocalizedNumber(text, numberPosition, this.decimalSeparator, this.minusSign);
  if (inches === null) {
    if (footValue) {
      parsePosition.setIndex(numberPosition.getIndex());
      return value;
    } else {
      parsePosition.setErrorIndex(numberPosition.getErrorIndex());
      return null;
    }
  }
  if (negative) {
    if (quoteIndex === -1) {
      value = LengthUnit.inchToCentimeter(inches);
    } else {
      value -= LengthUnit.inchToCentimeter(inches);
    }
  } else {
    value += LengthUnit.inchToCentimeter(inches);
  }
  // Parse fraction
  this.skipWhiteSpaces(text, numberPosition);
  if (numberPosition.getIndex() === text.length) {
    parsePosition.setIndex(text.length);
    return value;
  }
  if (text.charAt(numberPosition.getIndex()) === '\"') {
    parsePosition.setIndex(numberPosition.getIndex() + 1);
    return value;
  }

  var fractionChar = text.charAt(numberPosition.getIndex());    
  var fractionString = text.length - numberPosition.getIndex() >= 3 
      ? text.substring(numberPosition.getIndex(), numberPosition.getIndex() + 3)
      : null;
  for (var i = 0; i < inchFractionCharacters.length; i++) {
    if (inchFractionCharacters [i] === fractionChar
        || inchFractionStrings [i] == fractionString) {
      // Check no decimal fraction was specified
      var lastDecimalSeparatorIndex = text.lastIndexOf(this.decimalSeparator, 
          numberPosition.getIndex() - 1);
      if (lastDecimalSeparatorIndex > quoteIndex) {
        return null;
      } else {
        if (negative) {
          value -= LengthUnit.inchToCentimeter((i + 1) / 8);
        } else {
          value += LengthUnit.inchToCentimeter((i + 1) / 8);
        }
        parsePosition.setIndex(numberPosition.getIndex() 
            + (inchFractionCharacters [i] === fractionChar ? 1 : 3));
        this.skipWhiteSpaces(text, parsePosition);
        if (parsePosition.getIndex() < text.length
            && text.charAt(parsePosition.getIndex()) === '\"') {
          parsePosition.setIndex(parsePosition.getIndex() + 1);
        }
        return value;
      }
    }
  }
  
  parsePosition.setIndex(numberPosition.getIndex());
  return value;
}

/**
 * Increases the index of <code>fieldPosition</code> to skip white spaces.
 * @param {string} text
 * @param {ParsePosition} fieldPosition
 * @private 
 */
InchFormat.prototype.skipWhiteSpaces = function(text, fieldPosition) {
  while (fieldPosition.getIndex() < text.length
      && /\s/.test(text.charAt(fieldPosition.getIndex()))) {
    fieldPosition.setIndex(fieldPosition.getIndex() + 1);
  }
}

InchFormat.prototype.setGroupingUsed = function(groupingUsed) {
  this.groupingUsed = groupingUsed;
}

InchFormat.prototype.isGroupingUsed = function() {
  return this.groupingUsed;
}

/** @private */
function SquareFootAreaFormatWithUnit(formatLocale, unit) {
  Format.call(this);
  this.formatLocale = formatLocale;
  this.unit = unit;
}
SquareFootAreaFormatWithUnit.prototype = Object.create(Format.prototype);
SquareFootAreaFormatWithUnit.prototype.constructor = SquareFootAreaFormatWithUnit;

SquareFootAreaFormatWithUnit.prototype.format = function(number) {
  var formattedNumber = toLocaleStringUniversal(number / 929.0304, 
      this.groupingSeparator, true, this.decimalSeparator,
      { maximumFractionDigits: 0, minimumFractionDigits: 0 }); 
  return formattedNumber + (this.unit ? " " + this.unit : "");
}

/** @private */
function InchDecimalFormat(groupingSeparator, decimalSeparator, minusSign, decimalsFormat, unit) {
  Format.call(this);
  this.groupingSeparator = groupingSeparator;
  this.groupingUsed = true;
  this.decimalSeparator = decimalSeparator;
  this.minusSign = minusSign;
  this.decimalsFormat = decimalsFormat;
  this.unit = unit;
}
InchDecimalFormat.prototype = Object.create(Format.prototype);
InchDecimalFormat.prototype.constructor = InchDecimalFormat;

InchDecimalFormat.prototype.format = function(number) {
  var formattedNumber = toLocaleStringUniversal(LengthUnit.centimeterToInch(number), 
      this.groupingSeparator, this.groupingUsed, this.decimalSeparator, this.minusSign,
      { maximumFractionDigits: this.decimalsFormat.length, minimumFractionDigits: this.decimalsFormat.split("0").length - 1 });
  return formattedNumber + (this.unit ? this.unit : "");
}

InchDecimalFormat.prototype.parse = function(text, parsePosition) {
  var numberPosition = new ParsePosition(parsePosition.getIndex());
  this.skipWhiteSpaces(text, numberPosition);
  // Parse inches
  var inches = parseLocalizedNumber(text, numberPosition, this.decimalSeparator, this.minusSign);
  if (inches === null) {
    parsePosition.setErrorIndex(numberPosition.getErrorIndex());
    return null;
  }
  var value = LengthUnit.inchToCentimeter(inches);
  // Parse "
  this.skipWhiteSpaces(text, numberPosition);
  if (numberPosition.getIndex() < text.length 
      && text.charAt(numberPosition.getIndex()) === '\"') {
    parsePosition.setIndex(numberPosition.getIndex() + 1);
  } else {
    parsePosition.setIndex(numberPosition.getIndex());
  }
  return value;
}

/**
 * Increases the index of <code>fieldPosition</code> to skip white spaces.
 * @param {string} text
 * @param {ParsePosition} fieldPosition
 * @private 
 */
InchDecimalFormat.prototype.skipWhiteSpaces = function(text, fieldPosition) {
  while (fieldPosition.getIndex() < text.length
      && /\s/.test(text.charAt(fieldPosition.getIndex()))) {
    fieldPosition.setIndex(fieldPosition.getIndex() + 1);
  }
}

InchDecimalFormat.prototype.setGroupingUsed = function(groupingUsed) {
  this.groupingUsed = groupingUsed;
}

InchDecimalFormat.prototype.isGroupingUsed = function() {
  return this.groupingUsed;
}
