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

LengthUnit.UNITS_LOCALIZATION = {
  "":   {"meterUnit": "m",
         "centimeterUnit": "cm",
         "millimeterUnit": "mm",
         "inchUnit": "inch",
         "footUnit": "ft",
         "squareMeterUnit": "m\u00b2",
         "squareFootUnit": "sq ft"},
  "ar": {"meterUnit": "\u0645",
         "centimeterUnit": "\u0633\u0645",
         "millimeterUnit": "\u0645\u0645",
         "inchUnit": "\u0627\u0646\u0634",
         "squareMeterUnit": "\u0645\u062a\u0631 \u0645\u0631\u0628\u0639",
         "squareFootUnit": "\u0642\u062f\u0645 \u0645\u0631\u0628\u0639"},
  "bg": {"inchUnit": "inch"},
  "cs": {"inchUnit": "palce",
         "squareFootUnit": "ft\u00b2"},
  "de": {"inchUnit": "inch",
         "footUnit": "ft",
         "squareFootUnit": "ft\u00b2"},
  "el": {"inchUnit": "\u03af\u03bd\u03c4\u03c3\u03b1",
         "squareMeterUnit": "m\u00b2",
         "squareFootUnit": "\u03c4\u03b5\u03c4\u03c1\u03b1\u03b3\u03c9\u03bd\u03b9\u03ba\u03cc \u03c0\u03cc\u03b4\u03b9"},
  "es": {"inchUnit": "pulgada",
         "squareFootUnit": "ft\u00b2"},
  "eu": {"inchUnit": "hazbete",
         "squareFootUnit": "sq ft"},
  "fi": {"inchUnit": "\"",
         "squareFootUnit": "ft\u00b2"},
  "fr": {"inchUnit": "pouce",
         "footUnit": "pied",
         "squareFootUnit": "ft\u00b2"},
  "hu": {"inchUnit": "inch",
         "squareFootUnit": "ft\u00b2"},
  "in": {"inchUnit": "inci",
         "squareFootUnit": "ft\u00b2"},
  "it": {"inchUnit": "pollice",
         "squareFootUnit": "ft\u00b2"},
  "ja": {"inchUnit": "inch",
         "squareFootUnit": "sq ft"},
  "nl": {"inchUnit": "inch",
         "squareFootUnit": "vt\u00b2"},
  "pl": {"inchUnit": "cal",
         "squareFootUnit": "ft\u00b2"},
  "pt_BR": {"inchUnit": "pol",
            "squareFootUnit": "ft\u00b2"},
  "pt": {"inchUnit": "pol",
         "squareFootUnit": "p\u00e9\u00b2"},
  "ru": {"meterUnit": "\u043c",
         "centimeterUnit": "\u0441\u043c",
         "millimeterUnit": "\u043c\u043c",
         "inchUnit": "\u0434\u044e\u0439\u043c",
         "squareMeterUnit": "\u043c\u00b2",
         "squareFootUnit": "ft\u00b2"},
  "sl": {"inchUnit": "in\u010d",
         "squareFootUnit": "kv \u010dl"},
  "sr": {"inchUnit": "inch",
         "squareFootUnit": "sq ft"},
  "sv": {"inchUnit": "tum",
         "squareFootUnit": "ft\u00b2"},
  "th": {"meterUnit": "\u0e21.",
          "centimeterUnit": "\u0e0b\u0e21.",
          "millimeterUnit": "\u0e21\u0e21.",
          "inchUnit": "\u0e19\u0e34\u0e49\u0e27",
          "squareMeterUnit": "\u0e21.\u00b2",
          "squareFootUnit": "\u0e15\u0e32\u0e23\u0e32\u0e07\u0e1f\u0e38\u0e15"},
  "tr": {"inchUnit": "in\u00e7",
         "squareFootUnit": "kare ft "},
  "uk": {"meterUnit": "\u043c",
         "centimeterUnit": "\u0441\u043c",
         "millimeterUnit": "\u043c\u043c",
         "inchUnit": "\u0434\u044e\u0439\u043c",
         "squareMeterUnit": "\u043c\u00b2",
         "squareFootUnit": "\u043a\u0432. \u0444\u0442"},
  "vi": {"inchUnit": "inch",
         "squareFootUnit": "sq ft"},
  "zh_CN": {"centimeterUnit": "\u5398\u7c73",
            "inchUnit": "\u82f1\u5bf8",
            "millimeterUnit": "\u6beb\u7c73",
            "meterUnit": "\u7c73",
            "squareMeterUnit": "m\u00b2",
            "squareFootUnit": "\u5e73\u65b9\u82f1\u5c3a"},
  "zh_TW": {"centimeterUnit": "\u516c\u5206",
            "inchUnit": "\u82f1\u540b",
            "millimeterUnit": "\u516c\u91d0",
            "meterUnit": "\u516c\u5c3a",
            "squareMeterUnit": "m\u00b2",
            "squareFootUnit": "ft\u00b2"}
  };
  
/**
 * Returns the unit name in default locale. 
 * @param {string} unit
 */
LengthUnit.getLocalizedUnit = function(unit) {
  var locale = Locale.getDefault();
  var localizedUnits = LengthUnit.UNITS_LOCALIZATION [locale];
  if (localizedUnits !== undefined) {
	var localizedUnit = localizedUnits [unit];
    if (localizedUnit !== undefined) {
      return localizedUnit;
	}
  }
  if (locale.indexOf("_") > 0) {
    locale = locale.substring(0, locale.indexOf("_"));	
    var localizedUnits = LengthUnit.UNITS_LOCALIZATION [locale];
    if (localizedUnits !== undefined) {
	  var localizedUnit = localizedUnits [unit];
      if (localizedUnit !== undefined) {
        return localizedUnit;
	  }
    }
  }
  return LengthUnit.UNITS_LOCALIZATION [""][unit];
} 

/**
 * Returns the value close to the given length under magnetism for meter units.
 * @param {number} length
 * @param {number} maxDelta
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
 * @param {number} length
 * @param {number} maxDelta
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
 * Increases the index of <code>fieldPosition</code> to skip white spaces.
 * @param {string} text
 * @param {ParsePosition} fieldPosition
 * @private 
 */
LengthUnit.skipWhiteSpaces = function(text, fieldPosition) {
  while (fieldPosition.getIndex() < text.length
      && /\s/.test(text.charAt(fieldPosition.getIndex()))) {
    fieldPosition.setIndex(fieldPosition.getIndex() + 1);
  }
}

/**
 * @param {number} length
 * Returns the <code>length</code> given in centimeters converted to inches.
 */
LengthUnit.centimeterToInch = function(length) {
  return length / 2.54;
}

/**
 * @param {number} length
 * Returns the <code>length</code> given in centimeters converted to feet.
 */
LengthUnit.centimeterToFoot = function(length) {
  return length / 2.54 / 12;
}

/**
 * @param {number} length
 * Returns the <code>length</code> given in inches converted to centimeters.
 */
LengthUnit.inchToCentimeter = function(length) {
  return length * 2.54;
}

/**
 * @param {number} length
 * Returns the <code>length</code> given in feet converted to centimeters.
 */
LengthUnit.footToCentimeter = function(length) {
  return length * 2.54 * 12;
}

/**
 * Returns the enum name of the given unit.
 * <b>WARNING</b> enum name (CENTIMETERS, MILLIMETERS, ..) is different from unit's name (cm, mm, ..)
 * @param {LengthUnit} unit
 */
LengthUnit.nameOf = function(unit) {
  if (unit != null) {
    var unitEnumNames = Object.keys(LengthUnit);
    for (var i = 0; i < unitEnumNames.length; i++) {
      var unitEnumName = unitEnumNames[i];
      if (LengthUnit[unitEnumName] == unit) {
        return unitEnumName;
      }
    }
  }
  return null;
}

/**
 * Gets a LengthUnit by its enum name
 * <br/>
 * <b>WARNING</b> enum name (CENTIMETER, MILLIMETER, ..) is different from unit's name (cm, mm, ..)
 * @param {string} unitEnumName
 * @return {LengthUnit}
 */
LengthUnit.valueOf = function(unitEnumName) {
  return LengthUnit[unitEnumName];
}

/**
 * Millimeter unit.
 */
LengthUnit.MILLIMETER = {
    formatLocale : null
};

LengthUnit.MILLIMETER.name = function() {
  return LengthUnit.nameOf(this);
}
  
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
  return this.unitName; // Use unitName rather than name field to avoid clashes with name() method
}

LengthUnit.MILLIMETER.checkLocaleChange = function() {
  // Instantiate formats if locale changed
  if (Locale.getDefault() != this.formatLocale) {
    this.formatLocale = Locale.getDefault();  
    this.unitName = LengthUnit.getLocalizedUnit("millimeterUnit");
    this.lengthFormatWithUnit = new MeterFamilyFormat("0", 10, this.unitName);
    this.lengthFormat = new MeterFamilyFormat("0", 10);
    var squareMeterUnit = LengthUnit.getLocalizedUnit("squareMeterUnit");
    this.areaFormatWithUnit = new SquareMeterAreaFormatWithUnit(squareMeterUnit);
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

/**
 * @since 6.6
 */
LengthUnit.MILLIMETER.getStepSize = function() {
  return 0.5;
}

LengthUnit.MILLIMETER.centimeterToUnit = function(length) {
  return length * 10.;
}

LengthUnit.MILLIMETER.unitToCentimeter = function(length) {
  return length / 10.;
}
 
/**
 * @since 7.0
 */
LengthUnit.MILLIMETER.isMetric = function() {
  return true;
}


/**
 * Centimeter unit.
 */
LengthUnit.CENTIMETER = {
    formatLocale : null
};

LengthUnit.CENTIMETER.name = function() {
  return LengthUnit.nameOf(this);
}

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
  return this.unitName; // Use unitName rather than name field to avoid clashes with name() method
}
  
LengthUnit.CENTIMETER.checkLocaleChange = function() {
  // Instantiate formats if locale changed
  if (Locale.getDefault() != this.formatLocale) {
    this.formatLocale = Locale.getDefault();  
    this.unitName = LengthUnit.getLocalizedUnit("centimeterUnit");
    this.lengthFormatWithUnit = new MeterFamilyFormat("0.#", 1, this.unitName);
    this.lengthFormat = new MeterFamilyFormat("0.#", 1);
    var squareMeterUnit = LengthUnit.getLocalizedUnit("squareMeterUnit");
    this.areaFormatWithUnit = new SquareMeterAreaFormatWithUnit(squareMeterUnit);
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

/**
 * Returns the preferred step size in centimeter used to increment / decrement values of this unit.
 * @since 6.6
 */
LengthUnit.CENTIMETER.getStepSize = function() {
  return 0.5;
}

LengthUnit.CENTIMETER.centimeterToUnit = function(length) {
  return length;
}

LengthUnit.CENTIMETER.unitToCentimeter = function(length) {
  return length;
} 

/**
 * @since 7.0
 */
LengthUnit.CENTIMETER.isMetric = function() {
  return true;
}


/**
 * Meter unit.
 */
LengthUnit.METER = {
    formatLocale : null
};

LengthUnit.METER.name = function() {
  return LengthUnit.nameOf(this);
}

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
  return this.unitName; // Use unitName rather than name field to avoid clashes with name() method
}

LengthUnit.METER.checkLocaleChange = function() {
  // Instantiate formats if locale changed
  if (Locale.getDefault() != this.formatLocale) {
    this.formatLocale = Locale.getDefault();
    this.unitName = LengthUnit.getLocalizedUnit("meterUnit");
    this.lengthFormatWithUnit = new MeterFamilyFormat("0.00#", 0.01, this.unitName);
    this.lengthFormat = new MeterFamilyFormat("0.00#", 0.01);
    var squareMeterUnit = LengthUnit.getLocalizedUnit("squareMeterUnit");
    this.areaFormatWithUnit = new SquareMeterAreaFormatWithUnit(squareMeterUnit);
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

/**
 * @since 6.6
 */
LengthUnit.METER.getStepSize = function() {
  return 0.5;
}

LengthUnit.METER.centimeterToUnit = function(length) {
  return length / 100;
}

LengthUnit.METER.unitToCentimeter = function(length) {
  return length * 100;
}

/**
 * @since 7.0
 */
LengthUnit.METER.isMetric = function() {
  return true;
}


/**
 * Foot/Inch unit followed by fraction.
 */
LengthUnit.INCH = {
    formatLocale : null
};

LengthUnit.INCH.name = function() {
  return LengthUnit.nameOf(this);
}

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
  return this.unitName; // Use unitName rather than name field to avoid clashes with name() method
}

LengthUnit.INCH.checkLocaleChange = function() {
  // Instantiate format if locale changed
  if (Locale.getDefault() != this.formatLocale) {
    this.formatLocale = Locale.getDefault();
    this.unitName = LengthUnit.getLocalizedUnit("inchUnit");
    var footInchSeparator = "";
    this.lengthFormat = new InchFractionFormat(true, footInchSeparator);
    var squareFootUnit = LengthUnit.getLocalizedUnit("squareFootUnit");
    this.areaFormatWithUnit = new SquareFootAreaFormatWithUnit("0", squareFootUnit);
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

/**
 * @since 6.6
 */
LengthUnit.INCH.getStepSize = function() {
  return LengthUnit.inchToCentimeter(0.125);
}

LengthUnit.INCH.centimeterToUnit = function(length) {
  return LengthUnit.centimeterToInch(length);
}

LengthUnit.INCH.unitToCentimeter = function(length) {
  return LengthUnit.inchToCentimeter(length);
}

/**
 * @since 7.0
 */
LengthUnit.INCH.isMetric = function() {
  return false;
}


/**
 * Inch unit followed by fraction.
 * @since 7.0
 */
LengthUnit.INCH_FRACTION = {
    formatLocale : null
};

LengthUnit.INCH_FRACTION.name = function() {
  return LengthUnit.nameOf(this);
}

LengthUnit.INCH_FRACTION.getFormatWithUnit = function() {
  this.checkLocaleChange();
  return this.lengthFormat;
}

LengthUnit.INCH_FRACTION.getFormat = function() {
  return this.getFormatWithUnit();
}

LengthUnit.INCH_FRACTION.getAreaFormatWithUnit = function() {
  this.checkLocaleChange();
  return this.areaFormatWithUnit;
}

LengthUnit.INCH_FRACTION.getName = function() {
  this.checkLocaleChange();
  return this.unitName; // Use unitName rather than name field to avoid clashes with name() method
}

LengthUnit.INCH_FRACTION.checkLocaleChange = function() {
  // Instantiate format if locale changed
  if (Locale.getDefault() != this.formatLocale) {
    this.formatLocale = Locale.getDefault();
    this.unitName = LengthUnit.getLocalizedUnit("inchUnit");
    var footInchSeparator = "";
    this.lengthFormat = new InchFractionFormat(false, footInchSeparator);
    var squareFootUnit = LengthUnit.getLocalizedUnit("squareFootUnit");
    this.areaFormatWithUnit = new SquareFootAreaFormatWithUnit("0", squareFootUnit);
  }
}

LengthUnit.INCH_FRACTION.getMagnetizedLength = function(length, maxDelta) {
  return LengthUnit.getMagnetizedInchLength(length, maxDelta);
}

LengthUnit.INCH_FRACTION.getMinimumLength = function() {        
  return LengthUnit.inchToCentimeter(0.125);
}

LengthUnit.INCH_FRACTION.getMaximumLength = function() {
  return LengthUnit.inchToCentimeter(99974.4); // 3280 ft
}

LengthUnit.INCH_FRACTION.getMaximumElevation = function() {
  return this.getMaximumLength() / 10;
}

LengthUnit.INCH_FRACTION.getStepSize = function() {
  return LengthUnit.inchToCentimeter(0.125);
}

LengthUnit.INCH_FRACTION.centimeterToUnit = function(length) {
  return LengthUnit.centimeterToInch(length);
}

LengthUnit.INCH_FRACTION.unitToCentimeter = function(length) {
  return LengthUnit.inchToCentimeter(length);
}

/**
 * @since 7.0
 */
LengthUnit.INCH_FRACTION.isMetric = function() {
  return false;
}


/**
 * Inch unit with decimals.
 */
LengthUnit.INCH_DECIMALS = {
    formatLocale : null
};

LengthUnit.INCH_DECIMALS.name = function() {
  return LengthUnit.nameOf(this);
}

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
  return this.unitName; // Use unitName rather than name field to avoid clashes with name() method
}
  
LengthUnit.INCH_DECIMALS.checkLocaleChange = function() {  
  // Instantiate format if locale changed
  if (Locale.getDefault() != this.formatLocale) {
    this.formatLocale = Locale.getDefault();
    this.unitName = LengthUnit.getLocalizedUnit("inchUnit");
    this.lengthFormat = new InchDecimalsFormat("0.###");
    this.lengthFormatWithUnit = new InchDecimalsFormat("0.###", "\""); 
    var squareFootUnit = LengthUnit.getLocalizedUnit("squareFootUnit");
    this.areaFormatWithUnit = new SquareFootAreaFormatWithUnit("0.##", squareFootUnit);
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

/**
 * @since 6.6
 */
LengthUnit.INCH_DECIMALS.getStepSize = function() {
  return LengthUnit.inchToCentimeter(0.125);
}

LengthUnit.INCH_DECIMALS.centimeterToUnit = function(length) {
  return LengthUnit.centimeterToInch(length);
}

LengthUnit.INCH_DECIMALS.unitToCentimeter = function(length) {
  return LengthUnit.inchToCentimeter(length);
}

/**
 * @since 7.0
 */
LengthUnit.INCH_DECIMALS.isMetric = function() {
  return false;
}


/**
 * Inch unit with decimals.
 * @since 7.0
 */
LengthUnit.FOOT_DECIMALS = {
    formatLocale : null
};

LengthUnit.FOOT_DECIMALS.name = function() {
  return LengthUnit.nameOf(this);
}

LengthUnit.FOOT_DECIMALS.getFormatWithUnit = function() {
  this.checkLocaleChange();
  return this.lengthFormatWithUnit;
}

LengthUnit.FOOT_DECIMALS.getFormat = function() {
  this.checkLocaleChange();
  return this.lengthFormat;
}

LengthUnit.FOOT_DECIMALS.getAreaFormatWithUnit = function() {
  this.checkLocaleChange();
  return this.areaFormatWithUnit;
}

LengthUnit.FOOT_DECIMALS.getName = function() {
  this.checkLocaleChange();
  return this.unitName; // Use unitName rather than name field to avoid clashes with name() method
}
  
LengthUnit.FOOT_DECIMALS.checkLocaleChange = function() {  
  // Instantiate format if locale changed
  if (Locale.getDefault() != this.formatLocale) {
    this.formatLocale = Locale.getDefault();
    this.unitName = LengthUnit.getLocalizedUnit("footUnit");
    this.lengthFormat = new FootDecimalsFormat("0.###");
    this.lengthFormatWithUnit = new FootDecimalsFormat("0.###", "\'"); 
    var squareFootUnit = LengthUnit.getLocalizedUnit("squareFootUnit");
    this.areaFormatWithUnit = new SquareFootAreaFormatWithUnit("0.##", squareFootUnit);
  }
}
  
LengthUnit.FOOT_DECIMALS.getMagnetizedLength = function(length, maxDelta) {
  return LengthUnit.getMagnetizedInchLength(length, maxDelta);
}

LengthUnit.FOOT_DECIMALS.getMinimumLength = function() {        
  return LengthUnit.inchToCentimeter(0.125);
}

LengthUnit.FOOT_DECIMALS.getMaximumLength = function() {
  return LengthUnit.footToCentimeter(3280); 
}

LengthUnit.FOOT_DECIMALS.getMaximumElevation = function() {
  return this.getMaximumLength() / 10;
}

LengthUnit.FOOT_DECIMALS.getStepSize = function() {
  return LengthUnit.inchToCentimeter(0.125);
}

LengthUnit.FOOT_DECIMALS.centimeterToUnit = function(length) {
  return LengthUnit.centimeterToFoot(length);
}

LengthUnit.FOOT_DECIMALS.unitToCentimeter = function(length) {
  return LengthUnit.footToCentimeter(length);
}

LengthUnit.FOOT_DECIMALS.isMetric = function() {
  return false;
}


// Specific format classes for lengths

/** 
 * @constructor
 * @extends DecimalFormat
 * @private 
 */
function MeterFamilyFormat(pattern, unitMultiplier, unit) {
  DecimalFormat.call(this, pattern);
  this.setGroupingUsed(true);
  this.unitMultiplier = unitMultiplier;
  this.unit = unit;
}
MeterFamilyFormat.prototype = Object.create(DecimalFormat.prototype);
MeterFamilyFormat.prototype.constructor = MeterFamilyFormat;

MeterFamilyFormat.prototype.format = function(number) {
  var formattedNumber = DecimalFormat.prototype.format.call(this, number * this.unitMultiplier); 
  return formattedNumber + (this.unit ? " " + this.unit : "");
}

MeterFamilyFormat.prototype.parse = function(text, parsePosition) {
  var number = DecimalFormat.prototype.parse.call(this, text, parsePosition);
  if (number === null) {
    return null;
  } else {
    return number / this.unitMultiplier;
  }
}

/** 
 * @constructor
 * @extends DecimalFormat
 * @private 
 */
function SquareMeterAreaFormatWithUnit(squareMeterUnit) {
  DecimalFormat.call(this, "0.##");
  this.setGroupingUsed(true);
  this.squareMeterUnit = squareMeterUnit;
}
SquareMeterAreaFormatWithUnit.prototype = Object.create(DecimalFormat.prototype);
SquareMeterAreaFormatWithUnit.prototype.constructor = SquareMeterAreaFormatWithUnit;

SquareMeterAreaFormatWithUnit.prototype.format = function(number) {
  var formattedNumber = DecimalFormat.prototype.format.call(this, number / 10000); 
  return formattedNumber + (this.squareMeterUnit ? " " + this.squareMeterUnit : "");
}


/** 
 * A decimal format for inch lengths with fraction.
 * @param {boolean} footInch
 * @param {string} footInchSeparator
 * @constructor
 * @extends DecimalFormat
 * @private 
 */
function InchFractionFormat(footInch, footInchSeparator) {
  DecimalFormat.call(this, "0.###");
  this.setGroupingUsed(true);
  this.footInch = footInch;
  this.footInchSeparator = footInchSeparator;
}
InchFractionFormat.prototype = Object.create(DecimalFormat.prototype);
InchFractionFormat.prototype.constructor = InchFractionFormat;

InchFractionFormat.INCH_FRACTION_CHARACTERS = ['\u215b',   // 1/8
                                               '\u00bc',   // 1/4  
                                               '\u215c',   // 3/8
                                               '\u00bd',   // 1/2
                                               '\u215d',   // 5/8
                                               '\u00be',   // 3/4
                                               '\u215e'];  // 7/8        
InchFractionFormat.INCH_FRACTION_STRINGS = ["1/8",
                                            "1/4",  
                                            "3/8",
                                            "1/2",
                                            "5/8",
                                            "3/4",
                                            "7/8"];     

InchFractionFormat.prototype.format = function(number) {
  var absoluteValue = Math.abs(number);
  var feet = Math.floor(LengthUnit.centimeterToFoot(absoluteValue));              
  var remainingInches = LengthUnit.centimeterToInch(absoluteValue - LengthUnit.footToCentimeter(feet));
  if (remainingInches >= 11.9375) {
    feet++;
    remainingInches -= 12;
  }
  var result = number >= 0 ? "" : "-";
  // Format remaining inches only if it's larger that 0.0005
  var feetString = DecimalFormat.prototype.format.call(this, feet);
  if (remainingInches >= 0.0005) {
    // Try to format decimals with 1/8, 1/4, 1/2 fractions first
    var integerPart = Math.floor(remainingInches);
    var fractionPart = remainingInches - integerPart;
    var eighth = Math.round(fractionPart * 8); 
    if (this.footInch) {
      result += feetString;
      if (eighth === 0 || eighth === 8) {
        result += "'";
        result += Math.round(remainingInches * 8) / 8;
      } else {
        result += "'";
        result += integerPart;
        result += InchFractionFormat.INCH_FRACTION_CHARACTERS[eighth - 1];
      }
    } else {
      if (eighth === 0 || eighth === 8) {
        result += feet * 12 + Math.round(remainingInches * 8) / 8;
      } else {
        result += feet * 12 + integerPart;
        result += InchFractionFormat.INCH_FRACTION_CHARACTERS[eighth - 1];
      }
    }
    result += "\"";
  } else {
    if (this.footInch) {
      result += feetString;
      result += "'";
    } else {
      result += DecimalFormat.prototype.format.call(this, feet * 12);
      result += "\"";
    }
  }
  return result;
}

InchFractionFormat.prototype.parse = function(text, parsePosition) {
  var value = 0;
  var numberPosition = new ParsePosition(parsePosition.getIndex());
  LengthUnit.skipWhiteSpaces(text, numberPosition);
  var footNumberFormat = NumberFormat.getIntegerInstance();
  // Parse feet
  var quoteIndex = text.indexOf('\'', parsePosition.getIndex());
  var negative = numberPosition.getIndex() < text.length  
      && text.charAt(numberPosition.getIndex()) === '-';
  var footValue = false;
  if (quoteIndex !== -1) {
    var feet = footNumberFormat.parse(text, numberPosition);
    if (feet === null) {
      parsePosition.setErrorIndex(numberPosition.getErrorIndex());
      return null;
    }
    LengthUnit.skipWhiteSpaces(text, numberPosition);
    if (numberPosition.getIndex() === quoteIndex) {
      value = LengthUnit.footToCentimeter(feet);
      footValue = true;
      numberPosition = new ParsePosition(quoteIndex + 1);
      LengthUnit.skipWhiteSpaces(text, numberPosition);
      // Test optional foot inch separator
      if (numberPosition.getIndex() < text.length
          && this.footInchSeparator.indexOf(text.charAt(numberPosition.getIndex())) >= 0) {
        numberPosition.setIndex(numberPosition.getIndex() + 1);
        LengthUnit.skipWhiteSpaces(text, numberPosition);
      }
      if (numberPosition.getIndex() === text.length) {
        parsePosition.setIndex(text.length);
        return value;
      }
    } else {
      if (this.decimalSeparator === text.charAt(numberPosition.getIndex())) {
        var decimalNumberPosition = new ParsePosition(parsePosition.getIndex());
        if (DecimalFormat.prototype.parse.call(this, text, decimalNumberPosition) !== null
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
  var inches = DecimalFormat.prototype.parse.call(this, text, numberPosition);
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
  LengthUnit.skipWhiteSpaces(text, numberPosition);
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
  for (var i = 0; i < InchFractionFormat.INCH_FRACTION_CHARACTERS.length; i++) {
    if (InchFractionFormat.INCH_FRACTION_CHARACTERS [i] === fractionChar
        || InchFractionFormat.INCH_FRACTION_STRINGS [i] == fractionString) {
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
            + (InchFractionFormat.INCH_FRACTION_CHARACTERS [i] === fractionChar ? 1 : 3));
        LengthUnit.skipWhiteSpaces(text, parsePosition);
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
 * @constructor
 * @extends DecimalFormat
 * @private 
 */
function SquareFootAreaFormatWithUnit(pattern, unit) {
  DecimalFormat.call(this, pattern);
  this.setGroupingUsed(true);
  this.unit = unit;
}
SquareFootAreaFormatWithUnit.prototype = Object.create(DecimalFormat.prototype);
SquareFootAreaFormatWithUnit.prototype.constructor = SquareFootAreaFormatWithUnit;

SquareFootAreaFormatWithUnit.prototype.format = function(number) {
  var formattedNumber = DecimalFormat.prototype.format.call(this, number / 929.0304); 
  return formattedNumber + (this.unit ? " " + this.unit : "");
}

/** 
 * @constructor
 * @extends DecimalFormat
 * @private 
 */
function InchDecimalsFormat(pattern, unit) {
  DecimalFormat.call(this, pattern);
  this.setGroupingUsed(true);
  this.unit = unit;
}
InchDecimalsFormat.prototype = Object.create(DecimalFormat.prototype);
InchDecimalsFormat.prototype.constructor = InchDecimalsFormat;

InchDecimalsFormat.prototype.format = function(number) {
  var formattedNumber = DecimalFormat.prototype.format.call(this, LengthUnit.centimeterToInch(number));
  return formattedNumber + (this.unit ? this.unit : "");
}

InchDecimalsFormat.prototype.parse = function(text, parsePosition) {
  var numberPosition = new ParsePosition(parsePosition.getIndex());
  LengthUnit.skipWhiteSpaces(text, numberPosition);
  // Parse inches
  var inches = DecimalFormat.prototype.parse.call(this, text, numberPosition);
  if (inches === null) {
    parsePosition.setErrorIndex(numberPosition.getErrorIndex());
    return null;
  }
  var value = LengthUnit.inchToCentimeter(inches);
  // Parse "
  LengthUnit.skipWhiteSpaces(text, numberPosition);
  if (numberPosition.getIndex() < text.length 
      && text.charAt(numberPosition.getIndex()) === '\"') {
    parsePosition.setIndex(numberPosition.getIndex() + 1);
  } else {
    parsePosition.setIndex(numberPosition.getIndex());
  }
  return value;
}

/** 
 * @constructor
 * @extends DecimalFormat
 * @private 
 */
function FootDecimalsFormat(pattern, unit) {
  DecimalFormat.call(this, pattern);
  this.setGroupingUsed(true);
  this.unit = unit;
}
FootDecimalsFormat.prototype = Object.create(DecimalFormat.prototype);
FootDecimalsFormat.prototype.constructor = FootDecimalsFormat;

FootDecimalsFormat.prototype.format = function(number) {
  var formattedNumber = DecimalFormat.prototype.format.call(this, LengthUnit.centimeterToFoot(number));
  return formattedNumber + (this.unit ? this.unit : "");
}

FootDecimalsFormat.prototype.parse = function(text, parsePosition) {
  var numberPosition = new ParsePosition(parsePosition.getIndex());
  LengthUnit.skipWhiteSpaces(text, numberPosition);
  // Parse feet
  var feet = DecimalFormat.prototype.parse.call(this, text, numberPosition);
  if (feet === null) {
    parsePosition.setErrorIndex(numberPosition.getErrorIndex());
    return null;
  }
  var value = LengthUnit.footToCentimeter(feet);
  // Parse '
  LengthUnit.skipWhiteSpaces(text, numberPosition);
  if (numberPosition.getIndex() < text.length 
      && text.charAt(numberPosition.getIndex()) === '\'') {
    parsePosition.setIndex(numberPosition.getIndex() + 1);
  } else {
    parsePosition.setIndex(numberPosition.getIndex());
  }
  return value;
}
