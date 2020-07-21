/*
 * Copyright 2010-2016 Nicolas Debeissat and other contributors,
 * http://debeissat.nicolas.free.fr/
 *
 * This software consists of voluntary contributions made by multiple individuals.
 * For exact contribution history, see the revision history available at
 * https://github.com/ndebeiss/jsXmlSaxParser
 *
 * --------------------------------------------------------------------------------
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 * --------------------------------------------------------------------------------
 *
 * This software bundles a number of components and libraries with separate
 * copyright notices and license terms, including the ones below. We recommend you
 * read them, as their terms may differ from the terms above.
 *
 * JsUnit (http://www.jsunit.net/)
 *   License: MPL 1.1, GPL 2.0, or LGPL 2.1 (See jsunit/licenses/index.html)
 *
 * XML W3C Conformance Test Suite (https://www.w3.org/XML/Test/)
 *   License: See LICENSES FOR W3C TEST SUITES at
 *   https://www.w3.org/Consortium/Legal/2008/04-testsuite-copyright.html
 */

/*global window, document, XMLHttpRequest, ActiveXObject, AnyName, Attribute, AttributeNode, Choice, Context, DatatypeLibrary, Element, ElementNode, Empty, Group, NOT_CHAR, 
Name, NotAllowed, OneOrMore, QName, SAXScanner, Text , TextNode, ValidatorFunctions, XMLFilterImpl2, NamespaceSupport, InputSource, StringReader, Attributes2Impl, AttributesImpl */
(function () { // Begin namespace

var that = this; // probably window object

/* Private static variables (constant) */


// http://www.saxproject.org/apidoc/org/xml/sax/SAXException.html
function SAXException(message, exception) { // java.lang.Exception
    this.message = message;
    this.exception = exception;
}
SAXException.prototype = new Error(); // We try to make useful as a JavaScript error, though we could even implement java.lang.Exception
SAXException.constructor = SAXException;
SAXException.prototype.getMessage = function () {
    return this.message;
};
SAXException.prototype.getException = function () {
    return this.exception;
};


// Not fully implemented
// http://www.saxproject.org/apidoc/org/xml/sax/SAXNotSupportedException.html
function SAXNotSupportedException (msg) { // java.lang.Exception
    this.message = msg || '';
}
SAXNotSupportedException.prototype = new SAXException();
SAXNotSupportedException.constructor = SAXNotSupportedException;

// http://www.saxproject.org/apidoc/org/xml/sax/SAXNotRecognizedException.html
function SAXNotRecognizedException (msg) { // java.lang.Exception
    this.message = msg || '';
}
SAXNotRecognizedException.prototype = new SAXException();
SAXNotRecognizedException.constructor = SAXNotRecognizedException;

//This constructor is more complex and not presently implemented;
//  see Java API to implement additional arguments correctly
// http://www.saxproject.org/apidoc/org/xml/sax/SAXParseException.html
function SAXParseException (msg, locator) { // java.lang.Exception //
    this.message = msg || '';
    this.locator = locator;
}
SAXParseException.prototype = new SAXException();
SAXParseException.constructor = SAXParseException;
SAXParseException.prototype.getColumnNumber = function () {
    if (this.locator) {
        return this.locator.getColumnNumber();
    }
};
SAXParseException.prototype.getLineNumber = function () {
    if (this.locator) {
        return this.locator.getLineNumber();
    }
};
SAXParseException.prototype.getPublicId = function () {
    if (this.locator) {
        return this.locator.getPublicId();
    }
};
SAXParseException.prototype.getSystemId = function () {
    if (this.locator) {
        return this.locator.getSystemId();
    }
};


// NOTES:
// 1) The following notes might not be perfectly up to date
// 2) No property should be retrieved or set publicly.
// 3) We have at least a skeleton for all non-deprecated, non-adapter SAX2 classes/interfaces/exceptions
// 4) // The official SAX2 parse() method is not fully implemented (to accept an InputSource object constructed by a
//    Reader (like StringReader would probably be best) or InputStream). For now the parseString() method can
//    be used (and is more convenient than converting to an InputSource object).
// 5) // The feature/property defaults are incomplete, as they really depend on the implementation and how far we
//   implement them; however, we've added defaults, two of which (on namespaces) are required to be
//   supported (though they don't need to support both true and false options).
// 6) Currently does not call the following (lexicalHandler, dtdHandler, and errorHandler interface methods, are all supported, however):
//  a) on the contentHandler: ignorableWhitespace(), skippedEntity() and for startElement(), support Attributes2 in 4th argument (rename AttributesImpl to Attributes2Impl and support interface)
//  b) on the declarationHandler: externalEntityDecl()
//  c) on entityResolver: resolveEntity() and for EntityResolver2 interface: resolveEntity() (additional args) or getExternalSubset()
//  d) much of Locator information is not made available
//  e) domNode

function SAXParser (contentHandler, lexicalHandler, errorHandler, declarationHandler, dtdHandler, entityResolver, locator, domNode) {
    // Implements SAX2 XMLReader interface (except for parse() methods)
    // XMLReader doesn't specify a constructor (though XMLFilterImpl does), so this class is able to define its own behavior to accept a contentHandler, etc.

    this.contentHandler = contentHandler;
    this.locator = locator;
    if (this.locator) { // Set defaults (if accessed before set)
        // For Locator (there are no standard fields for us to use; our Locator must support these)
        this.locator.columnNumber = -1;
        this.locator.lineNumber = -1;
        this.locator.publicId = null;
        this.locator.systemId = null;
        // For Locator2 (there are no standard fields for us to use; our Locator2 must support these)
        this.locator.version = null;
        this.locator.encoding = null;
        this.contentHandler.setDocumentLocator(locator);
    }
    this.dtdHandler = dtdHandler;
    this.errorHandler = errorHandler;
    this.entityResolver = entityResolver || null;

    if (typeof that.AttributesImpl !== 'function') {
        throw new SAXException("you must import an implementation of AttributesImpl, like AttributesImpl.js, in the html");
    }
    
    try {
        this.namespaceSupport = new NamespaceSupport();
    } catch(e2) {
        throw new SAXException("you must import an implementation of NamespaceSupport, like NamespaceSupport.js, in the html", e2);
    }

    this.disallowedGetProperty = [];
    this.disallowedGetFeature = [];
    this.disallowedSetProperty = [];
    this.disallowedSetFeature = [];

    this.disallowedSetPropertyValues = {};
    this.disallowedSetFeatureValues = {};

    // For official features and properties, see http://www.saxproject.org/apidoc/org/xml/sax/package-summary.html#package_description
    // We can define our own as well
    // Except where specified, all features and properties should be supported (in at least the default configuration)
    this.features = {}; // Boolean values
    this.features['http://xml.org/sax/features/external-general-entities'] = false; // Not supported yet
    this.features['http://xml.org/sax/features/external-parameter-entities'] = false; // Not supported yet
    this.features['http://xml.org/sax/features/is-standalone'] = undefined; // Can only be set during parsing
    this.features['http://xml.org/sax/features/lexical-handler/parameter-entities'] = false; // Not supported yet
    this.features['http://xml.org/sax/features/namespaces'] = true; // must support true
    this.features['http://xml.org/sax/features/namespace-prefixes'] = false; // must support false; are we now operating as true? (i.e., XML qualified names (with prefixes) and attributes (including xmlns* attributes) are available?)
    this.features['http://xml.org/sax/features/resolve-dtd-uris'] = true;
    this.features['http://xml.org/sax/features/string-interning'] = true; // Make safe to treat string literals as identical to String()
    this.features['http://xml.org/sax/features/unicode-normalization-checking'] = false;
    this.features['http://xml.org/sax/features/use-attributes2'] = true; // Not supported yet
    this.features['http://xml.org/sax/features/use-locator2'] = !!(locator && // No interfaces in JavaScript, so we duck-type:
                                                                                                                    typeof locator.getXMLVersion === 'function' &&
                                                                                                                    typeof locator.getEncoding === 'function'
                                                                                                                ); // Not supported yet
    this.features['http://xml.org/sax/features/use-entity-resolver2'] = true;
    this.features['http://xml.org/sax/features/validation'] = false;
    this.features['http://xml.org/sax/features/xmlns-uris'] = false;
    this.features['http://xml.org/sax/features/xml-1.1'] = false; // Not supported yet

    this.features['http://apache.org/xml/features/nonvalidating/load-external-dtd'] = false;

    // Our custom features (as for other features, retrieve/set publicly via getFeature/setFeature):
    // We are deliberately non-conformant by default (for performance reasons)
    this.features['http://debeissat.nicolas.free.fr/ns/character-data-strict'] = false;
    /*for usual case it is possible to deactivate augmentation of XML instance from schema
    if that is activated, a schema of the XML is built during the parsing, and :
        - attributes are typed
        - whitespace normalization of attributes is possible
        - optional attributes which have default values are added
        - validation is possible
        that feature is automatically enabled if validation of attribute-whitespace-normalization is activated
    */
    this.features['http://debeissat.nicolas.free.fr/ns/instance-augmentation'] = false;
    //without that property sax_vs_browser.html.html does not work as Firefox will not normalize attribute value properly
    this.features['http://debeissat.nicolas.free.fr/ns/attribute-whitespace-normalization'] = false;

    this.properties = {}; // objects
    this.properties['http://xml.org/sax/properties/declaration-handler'] = this.declarationHandler = declarationHandler;
    this.properties['http://xml.org/sax/properties/document-xml-version'] = null; // string
    this.properties['http://xml.org/sax/properties/dom-node'] = this.domNode = domNode; // Not supported yet (if treating DOM node as though SAX2, this will be starting node)
    this.properties['http://xml.org/sax/properties/lexical-handler'] = this.lexicalHandler = lexicalHandler || null;
    this.properties['http://xml.org/sax/properties/xml-string'] = null; // Not supported yet (update with characters that were responsible for the event)
}

/* CUSTOM API */
SAXParser.prototype.toString = function () {
    return "SAXParser";
};

// BEGIN SAX2 XMLReader INTERFACE
SAXParser.prototype.getContentHandler = function () {
    // Return the current content handler (ContentHandler).
    return this.contentHandler;
};
SAXParser.prototype.getDTDHandler = function () {
    // Return the current DTD handler (DTDHandler).
    return this.dtdHandler;
};
SAXParser.prototype.getEntityResolver = function () {
    // Return the current entity resolver (EntityResolver).
    return this.entityResolver;
};
SAXParser.prototype.getErrorHandler = function () {
    // Return the current error handler (ErrorHandler).
    return this.errorHandler;
};
SAXParser.prototype.getFeature = function (name) { // (java.lang.String)
    // Look up the value of a feature flag (boolean).
    if (this.features[name] === undefined) {
      throw new SAXNotRecognizedException();
    } else if (this.disallowedGetFeature.indexOf(name) !== -1) {
      throw new SAXNotSupportedException();
    }
    return this.features[name];
};
SAXParser.prototype.getProperty = function (name) { // (java.lang.String)
    // Look up the value of a property (java.lang.Object).
    // It is possible for an XMLReader to recognize a property name but temporarily be unable to return its value. Some property values may be available only in specific contexts, such as before, during, or after a parse.
    if (this.properties[name] === undefined) {
      throw new SAXNotRecognizedException();
    } else if (this.disallowedGetProperty.indexOf(name) !== -1) {
      throw new SAXNotSupportedException();
    }
    return this.properties[name];
};

// For convenience, when dealing with strings as input, one can simply use our own parseString() instead of
// XMLReader's parse() which expects an InputSouce (or systemId)
// Note: The InputSource argument is not fully supported, as the parser currently does not use its methods for parsing
SAXParser.prototype.parse = function (inputOrSystemId, noCache) { // (InputSource input OR java.lang.String systemId)
    // Parse an XML document (void). OR
    // Parse an XML document from a system identifier (URI) (void).
    // may throw java.io.IOException or SAXException
    var systemId, xmlAsString, path;
    //InputSource may not have been imported
    if (typeof that.InputSource === 'function' && inputOrSystemId instanceof InputSource) {
        var charStream = inputOrSystemId.getCharacterStream();
        var byteStream = inputOrSystemId.getByteStream();
        // Priority for the parser is characterStream, byteStream, then URI, but we only really implemented the systemId (URI), so we automatically go with that
        systemId = inputOrSystemId.getSystemId();
        if (charStream) {
            if (charStream instanceof StringReader) { // Fix: This if-else is just a hack, until the parser may support Reader's methods like read()
                xmlAsString = charStream.s;
            } else {
                throw "A character stream InputSource is not implemented at present unless it is a StringReader character stream (and that only if it is our own version which has the string on the 's' property)";
            }
        } else if (byteStream || systemId) {
            this.encoding = inputOrSystemId.getEncoding(); // To be used during XML Declaration checking
            if (byteStream) {
                throw "A byte stream InputSource is not implemented at present in SAXParser's parse() method";
            }
        }
        if (!systemId && !xmlAsString) {
            throw "The SAXParser parse() method must, at present, take an InputSource with a systemId or with a StringReader character stream";
        }
    } else if (typeof inputOrSystemId === "string") {
        systemId = inputOrSystemId;
    } else {
        throw "The argument supplied to SAXParser's parse() method was invalid";
    }
    this.systemId = systemId;
    if (!xmlAsString) { // If not set above
        // Fix: According to the specification for parse() (and InputSource's systemId constructor), the URL should be fully resolved (not relative)
        if (noCache) {
            systemId += ((systemId.indexOf('?') === -1) ? '?' : '&') + '_saxQuertyTime=' + new Date().getTime();
        }
        xmlAsString = SAXParser.loadFile(systemId);
        //get the path to the file
        path = systemId.substring(0, systemId.lastIndexOf("/") + 1);
        this.baseURI = path;
    }
    this.parseString(xmlAsString);
};

SAXParser.prototype.parseString = function (xmlAsString) {
    var reader = new StringReader(xmlAsString);
    var readerWrapper = new ReaderWrapper(reader);
    this.initReaders(readerWrapper, reader);
    this.saxScanner.parse(readerWrapper);
};

SAXParser.prototype.initReaders = function (readerWrapper, reader) {
    var saxEvents = new XMLFilterImpl2(this);
    this.saxScanner = new SAXScanner(this, saxEvents);
    this.saxScanner.namespaceSupport = this.namespaceSupport;
    if (this.features['http://debeissat.nicolas.free.fr/ns/character-data-strict']) {
        this.saxScanner.CHAR_DATA_REGEXP = new RegExp(this.saxScanner.NOT_CHAR+'|[<&\\]]');
    } else {
        this.saxScanner.CHAR_DATA_REGEXP = /[<&\]]/;
    }
    if (!(this.features['http://apache.org/xml/features/nonvalidating/load-external-dtd'])) {
        this.saxScanner.loadExternalDtd = function(externalId) {};
    }
    if (this.features['http://xml.org/sax/features/validation']) {
        this.features['http://debeissat.nicolas.free.fr/ns/instance-augmentation'] = true;
        saxEvents.endDocument = this.endDocument_validating;
    }
    if (this.features['http://debeissat.nicolas.free.fr/ns/attribute-whitespace-normalization']) {
        saxEvents.attWhitespaceNormalize = SAXParser.attWhitespaceNormalize;
        if (this.features['http://debeissat.nicolas.free.fr/ns/instance-augmentation']) {
            saxEvents.attWhitespaceCollapse = SAXParser.attWhitespaceCollapse;
        }
    }
    if (this.features['http://debeissat.nicolas.free.fr/ns/instance-augmentation']) {
        saxEvents.startDocument = this.startDocument_augmenting;
        saxEvents.startDTD = this.startDTD_augmenting;
        saxEvents.elementDecl = this.elementDecl_augmenting;
        saxEvents.attributeDecl = this.attributeDecl_augmenting;
        if (this.features['http://xml.org/sax/features/validation']) {
            saxEvents.augmenting_elm = this.augmenting_elm;
            saxEvents.startElement = this.startElement_validating;
        } else {
            saxEvents.augmenting_elm = this.augmenting_elm;
            saxEvents.startElement = this.startElement_augmenting;
        }
        saxEvents.endElement = this.endElement_augmenting;
        saxEvents.characters = this.characters_augmenting;
    }
    if (this.features['http://xml.org/sax/features/use-entity-resolver2']) {
        saxEvents.resolveEntity = this.resolveEntity;
    }
    if (this.features['http://xml.org/sax/features/use-attributes2']) {
        this.getAttributesInstance = this.getAttributes2Instance;
    } else {
        this.getAttributesInstance = this.getAttributes1Instance;
    }
    if (this.contentHandler.locator) {
        this.contentHandler.locator.reader = reader;
        this.contentHandler.locator.setSystemId(this.systemId);
        saxEvents.startDTDOld = saxEvents.startDTD;
        saxEvents.startDTD = function(name, publicId, systemId) {
            // Check: name or publicId ?
            this.getContentHandler().locator.setPublicId(name);
            return this.startDTDOld(name, publicId, systemId);
  }
        this.contentHandler.locator.getColumnNumberOld = this.contentHandler.locator.getColumnNumber;
        this.contentHandler.locator.getLineNumberOld = this.contentHandler.locator.getLineNumber;
        this.contentHandler.locator.getColumnNumber = function () {
            var columnNumber = this.reader.nextIdx - this.reader.s.substring(0, this.reader.nextIdx).lastIndexOf("\n");
            this.setColumnNumber(columnNumber);
            return this.getColumnNumberOld();
        };
        this.contentHandler.locator.getLineNumber = function () {
            var lineNumber = this.reader.s.substring(0, this.reader.nextIdx).split("\n").length;
            this.setLineNumber(lineNumber);
            return this.getLineNumberOld();
        };
    }
    saxEvents.warning = this.warning;
    saxEvents.error = this.error;
    saxEvents.fatalError = this.fatalError;
}

/* convenient method in order to set all handlers at once */
SAXParser.prototype.setHandler = function (handler) { // (ContentHandler/LexicalHandler/ErrorHandler/DeclarationHandler/DtdHandler)/EntityResolver(2)
    this.contentHandler = handler;
    this.lexicalHandler = handler;
    this.errorHandler = handler;
    this.declarationHandler = handler;
    this.dtdHandler = handler;
    this.entityResolver = handler;
};
SAXParser.prototype.setContentHandler = function (handler) { // (ContentHandler)
    // Allow an application to register a content event handler (void).
    this.contentHandler = handler;
};
SAXParser.prototype.setDTDHandler = function (handler) { // (DTDHandler)
    // Allow an application to register a DTD event handler (void).
    this.dtdHandler = handler;
};
SAXParser.prototype.setEntityResolver = function (resolver) { // (EntityResolver)
    // Allow an application to register an entity resolver (void).
    this.entityResolver = resolver;
};
SAXParser.prototype.setErrorHandler = function (handler) { // (ErrorHandler)
    // Allow an application to register an error event handler (void).
    this.errorHandler = handler;
};
SAXParser.prototype.setFeature = function (name, value) { // (java.lang.String, boolean)
    // Set the value of a feature flag (void).
    if (this.features[name] === undefined) { // Should be defined already in some manner
        throw new SAXNotRecognizedException();
    } else if (
            (this.disallowedSetFeatureValues[name] !== undefined &&
                    this.disallowedSetFeatureValues[name] === value) ||
                (this.disallowedSetFeature.indexOf(name) !== -1)
            ){
        throw new SAXNotSupportedException();
    }
    this.features[name] = value;
};
SAXParser.prototype.setProperty = function (name, value) { // (java.lang.String, java.lang.Object)
    // Set the value of a property (void).
    // It is possible for an XMLReader to recognize a property name but to be unable to change the current value. Some property values may be immutable or mutable only in specific contexts, such as before, during, or after a parse.
    if (this.properties[name] === undefined) { // Should be defined already in some manner
        throw new SAXNotRecognizedException();
    } else if (
                (this.disallowedSetPropertyValues[name] !== undefined &&
                    this.disallowedSetPropertyValues[name] === value) ||
                (this.disallowedSetProperty.indexOf(name) !== -1)
            ){
        throw new SAXNotSupportedException();
    }
    this.properties[name] = value;
    switch (name) { // Keep any aliases up to date as well
        case 'http://xml.org/sax/properties/lexical-handler':
            this.lexicalHandler = value;
            break;
        case 'http://xml.org/sax/properties/declaration-handler':
            this.declarationHandler = value;
            break;
        case 'http://xml.org/sax/properties/dom-node':
            this.domNode = value;
            break;
    }
};
// END SAX2 XMLReader INTERFACE


// BEGIN FUNCTIONS WHICH SHOULD BE CONSIDERED PRIVATE
SAXParser.prototype.getAttributes2Instance = function() {
    return new Attributes2Impl();
};

SAXParser.prototype.getAttributes1Instance = function() {
    return new AttributesImpl();
};

SAXParser.prototype.startDocument_augmenting = function() {
    //initializes the elements at saxParser level, not at XMLFilter
    this.elements = {};
    this.instanceContext = new Context("", []);
    var datatypeLibrary = new DatatypeLibrary();
    this.debug = false;
    this.validatorFunctions = new ValidatorFunctions(this, datatypeLibrary);
    return this.parent.contentHandler.startDocument.call(this.parent.contentHandler);
};

SAXParser.prototype.startDTD_augmenting = function(name, publicId, systemId) {
    this.pattern = this.elements[name] = new Element(new Name(null, name));

    this.context = new Context(publicId, []);
    if (this.parent && this.parent.lexicalHandler) {
        return this.parent.lexicalHandler.startDTD.call(this.parent.lexicalHandler, name, publicId, systemId);
    }
    return undefined;
};

/*
[51]      Mixed    ::=    '(' S? '#PCDATA' (S? '|' S? Name)* S? ')*'
      | '(' S? '#PCDATA' S? ')'
*/
SAXParser.getPatternFromMixed = function(model, xmlFilter) {
    // if other elements
    var pattern, mixed = /^\( ?#PCDATA ?(\|.*) ?\)\*$/.exec(model);
    if (mixed !== null) {
        //remove whitespaces
        var elements = mixed[1].replace(/ /g, "");
        var splitOr = elements.split("|");
        //from the last to the second
        for (var i = splitOr.length - 1 ; i > 0 ; i--) {
            //trim whitespaces
            var elemName = splitOr[i];
            if (!xmlFilter.elements[elemName]) {
                xmlFilter.elements[elemName] = new Element(new Name(null, elemName));
            }
            //adds it to the current pattern
            if (pattern) {
                pattern = new Group(xmlFilter.elements[elemName], pattern);
            } else {
                pattern = xmlFilter.elements[elemName];
            }
        }
        // it is a zero or more
        return new Choice(new Empty(), new OneOrMore(new Choice(new Text(), pattern)));
    }
    return new Text();
};

/*
[47]    children     ::=    (choice | seq) ('?' | '*' | '+')?
[48]    cp     ::=    (Name | choice | seq) ('?' | '*' | '+')?
[49]    choice     ::=    '(' S? cp ( S? '|' S? cp )+ S? ')'
[50]    seq    ::=    '(' S? cp ( S? ',' S? cp )* S? ')'
*/
/* XML Name regular expressions */
// Should disallow independent high or low surrogates or inversed surrogate pairs and also have option to reject private use characters; but strict mode will need to check for sequence of 2 characters if a surrogate is found
var NAME_START_CHAR = ":A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u0200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\ud800-\udbff\udc00-\udfff"; // The last two ranges are for surrogates that comprise #x10000-#xEFFFF; // Fix: Need to remove surrogate pairs here and handle elsewhere; also must deal with surrogates in entities
var NAME_END_CHAR = ".0-9\u00B7\u0300-\u036F\u203F-\u2040-"; // Don't need escaping since to be put in a character class
var parseModelRegexp = new RegExp("([" + NAME_START_CHAR + "][" + NAME_START_CHAR + NAME_END_CHAR + "]*)([*+?])? ?(([,|])?(.*))?");
SAXParser.getPatternFromChildren = function(model, xmlFilter) {
    var brackets = /^\( ?(.*) ?\)([*+?]?)$/.exec(model);
    if (brackets != null) {
        var restOfModel = brackets[1];
        var operator = brackets[2];
        var pattern = SAXParser.getPatternFromChildren(restOfModel, xmlFilter);
        switch (operator) {
            case "?":
                pattern = new Choice(pattern, new Empty());
                break;
            case "+":
                pattern = new OneOrMore(pattern);
                break;
            case "*":
                pattern = new Choice(new Empty(), new OneOrMore(pattern));
                break;
        }
        return pattern;
    } else {
        var parsedModel = parseModelRegexp.exec(model);
        var name = parsedModel[1];
        var operator = parsedModel[2];
        var separator = parsedModel[4];
        var restOfModel = parsedModel[5];
        if (!xmlFilter.elements[name]) {
            xmlFilter.elements[name] = new Element(new Name(null, name));
        }
        var pattern;
        switch (operator) {
            case "?":
                pattern = new Choice(xmlFilter.elements[name], new Empty());
                break;
            case "+":
                pattern = new OneOrMore(xmlFilter.elements[name]);
                break;
            case "*":
                pattern = new Choice(new Empty(), new OneOrMore(xmlFilter.elements[name]));
                break;
            //in case there is no operator, undefined
            default:
                pattern = xmlFilter.elements[name];
                break;
        }
        if (restOfModel) {
            var pattern2 = SAXParser.getPatternFromChildren(restOfModel, xmlFilter);
        }
        if (pattern2) {
            if (separator === "|") {
                pattern = new Choice(pattern, pattern2);
            } else {
                pattern = new Group(pattern, pattern2);
            }
        }
        return pattern;
    }
};

/*
[45]    elementdecl    ::=    '<!ELEMENT' S  Name  S  contentspec  S? '>' [VC: Unique Element Type Declaration]
[46]    contentspec    ::=    'EMPTY' | 'ANY' | Mixed | children 
[51]      Mixed    ::=    '(' S? '#PCDATA' (S? '|' S? Name)* S? ')*'
      | '(' S? '#PCDATA' S? ')'
*/
SAXParser.getPatternFromModel = function(model, xmlFilter) {
    if (model === "EMPTY") {
        return new Empty();
    } else if (model === "ANY") {
        return new Choice(new Empty(), new OneOrMore(new Element(new AnyName())));
    } else {
        var pattern;
        if (/^\( ?#PCDATA/.test(model)) {
            pattern = SAXParser.getPatternFromMixed(model, xmlFilter);
        } else {
            pattern = SAXParser.getPatternFromChildren(model, xmlFilter);
        }
        return pattern;
    }
};

SAXParser.prototype.elementDecl_augmenting = function(name, model) {
    var pattern = SAXParser.getPatternFromModel(model, this);
    var element = this.elements[name];
    if (!element) {
        element = this.elements[name] = new Element(new Name(null, name), pattern);
    } else {
        //if attributes already declared
        if (element.pattern) {
            if (pattern instanceof Text) {
                //mixed patterns are transformed into interleave patterns between their unique child pattern and a text pattern.
                element.pattern = new Interleave(element.pattern, pattern);
            } else {
                element.pattern = new Group(element.pattern, pattern);
            }
        } else {
            element.pattern = pattern;
        }
    }
    if (this.parent && this.parent.declarationHandler) {
        return this.parent.declarationHandler.elementDecl.call(this.parent.declarationHandler,  name, model);
    }
    return undefined;
};

SAXParser.attWhitespaceNormalize = function(value) {
    value = value.replace(/\r\n/g, " ");
    return value.replace(/[\t\n\r]/g, " ");
};

SAXParser.attWhitespaceCollapse = function(type, value) {
    if (type !== "string") {
        value = value.replace(/\s+/g, " ");
        //removes leading and trailing space
        value = value.replace(/^\s/, "").replace(/\s$/, "");
    }
    return value;
};

SAXParser.addAttributesIn = function(pattern, attributes) {
    if (pattern) {
        if (pattern instanceof Choice) {
            SAXParser.addAttributesIn(pattern.pattern1, attributes);
            SAXParser.addAttributesIn(pattern.pattern2, attributes);
        } else if (pattern instanceof Interleave) {
            SAXParser.addAttributesIn(pattern.pattern1, attributes);
            SAXParser.addAttributesIn(pattern.pattern2, attributes);
        } else if (pattern instanceof Group) {
            SAXParser.addAttributesIn(pattern.pattern1, attributes);
            SAXParser.addAttributesIn(pattern.pattern2, attributes);
        } else if (pattern instanceof Attribute) {
            attributes.push(pattern);
        }
    }
};

SAXParser.augmentAttributes = function(elementNode, pattern) {
    if (pattern) {
        if (pattern instanceof Choice) {
            SAXParser.augmentAttributes(elementNode, pattern.pattern1);
            SAXParser.augmentAttributes(elementNode, pattern.pattern2);
        } else if (pattern instanceof Interleave) {
            SAXParser.augmentAttributes(elementNode, pattern.pattern1);
            SAXParser.augmentAttributes(elementNode, pattern.pattern2);
        } else if (pattern instanceof Group) {
            SAXParser.augmentAttributes(elementNode, pattern.pattern1);
            SAXParser.augmentAttributes(elementNode, pattern.pattern2);
        } else if (pattern instanceof Attribute) {
            elementNode.addAttribute(pattern);
        }
    }
};

SAXParser.isAlreadyDeclared = function(aName, attributes) {
    for (var i = 0 ; i < attributes.length ; i++) {
        var nameClass = attributes[i].nameClass
        if (nameClass.localName && nameClass.localName === aName) {
            return true;
        }
    }
    return false;
};


SAXParser.prototype.attributeDecl_augmenting = function(eName, aName, type, mode, value) {
    var element = this.elements[eName];
    var alreadyDeclaredAttributes = [];
    if (!element) {
        element = this.elements[eName] = new Element(new Name(null, eName));
    } else {
        SAXParser.addAttributesIn(element.pattern, alreadyDeclaredAttributes);
    }
    if (SAXParser.isAlreadyDeclared(aName, alreadyDeclaredAttributes)) {
        this.warning("attribute : [" + aName + "] under element : [" + eName + "] is already declared", this.parent.saxScanner);
    } else {
        var datatype;
        if (type === "NMTOKENS" || type === "NMTOKEN") {
            datatype = new Datatype("http://www.w3.org/2001/XMLSchema-datatypes", type);
        } else {
            datatype = new Datatype("http://www.w3.org/2001/XMLSchema-datatypes", "string");
        }
        var paramList = [];
        //if it is an enumeration
        if (/^\(.+\)$/.test(type)) {
            var typeToParse = type.replace(/^\(/, "").replace(/\)$/, "");
            var values = typeToParse.split("|");
            var i = values.length;
            while (i--) {
                paramList.push(new Param("enumeration", values[i]));
            }
        }
        var attributePattern = new Attribute(new Name(null, aName), new Data(datatype, paramList));
        //stores the index in order to respect the order (only for tests validation purpose)
        attributePattern.index = alreadyDeclaredAttributes.length;
        //if it is optional
        if (mode !== "#REQUIRED") {
            //if a default value is provided
            if (value) {
                var valueNormalized = SAXParser.attWhitespaceCollapse(type, value);
                attributePattern.defaultValue = new Value(datatype, valueNormalized, this.context);
            }
            attributePattern = new Choice(attributePattern, new Empty());
        }
        if (element.pattern) {
            var group = new Group(element.pattern, attributePattern);
            element.pattern = group;
        } else {
            element.pattern = attributePattern;
        }
    }
    if (this.parent && this.parent.declarationHandler) {
        return this.parent.declarationHandler.attributeDecl.call(this.parent.declarationHandler, eName, aName, type, mode, value);
    }
    return undefined;
};

SAXParser.prototype.augmenting_elm = function(namespaceURI, localName, qName, atts) {
    var attributeNodes = [];
    for (var i = 0 ; i < atts.getLength() ; i++) {
        var newAtt = new AttributeNode(new QName(atts.getURI(i), atts.getLocalName(i)), atts.getValue(i));
        newAtt.atts = atts;
        newAtt.index = i;
        //may need normalization
        newAtt.attWhitespaceCollapse = this.attWhitespaceCollapse;
        newAtt.setType = function(type) {
            this.atts.setType(this.index, type);
            if (this.attWhitespaceCollapse) {
                var oldValue = this.atts.getValue(this.index);
                var newValue = this.attWhitespaceCollapse(type, oldValue);
                this.atts.setValue(this.index, newValue);
            }
            if (this.atts.setDeclared) {
                this.atts.setDeclared(this.index, true);
                this.atts.setSpecified(this.index, true);
            }
        };
        attributeNodes.push(newAtt);
    }
    var newElement = new ElementNode(new QName(namespaceURI, localName), this.instanceContext, attributeNodes, []);
    newElement.atts = atts;
    newElement.addAttribute = function(pattern) {
        var qName = pattern.nameClass;
        //pattern is Attribute, pattern.pattern is Data
        var type = null;
        if (pattern.pattern instanceof Data || pattern.pattern instanceof DataExcept) {
            type = pattern.pattern.datatype.localName;
        }
        var value = pattern.defaultValue.string;
        var index;
        if (pattern.index !== undefined && this.atts.addAttributeAtIndex) {
            index = pattern.index;
            this.atts.addAttributeAtIndex(pattern.index, qName.uri, qName.localName, qName.localName, type, value);
        } else {
            index = atts.getLength();
            this.atts.addAttribute(qName.uri, qName.localName, qName.localName, type, value);
        }
        //if attributes2 is used
        if (atts.setDeclared) {
            atts.setDeclared(index, true);
            atts.setSpecified(index, false);
        }
        this.attributeNodes.push(new AttributeNode(qName, value));
    };
    //this.childNode must be an ElementNode
    if (!this.childNode) {
        this.childNode = this.currentElementNode = newElement;
    } else {
        this.currentElementNode.childNodes.push(newElement);
        newElement.setParentNode(this.currentElementNode);
        this.currentElementNode = newElement;
    }
};

/*
sets the type of the attributes from DTD
and the default values of non present attributes
*/
SAXParser.prototype.startElement_augmenting = function(namespaceURI, localName, qName, atts) {
    //may not have any DTD
    if (this.context) {
        this.augmenting_elm(namespaceURI, localName, qName, atts);
        //DTD augmentation
        var pattern = this.elements[localName];
        if (pattern) {
            SAXParser.augmentAttributes(this.currentElementNode, pattern.pattern);
        }
    }
    return this.parent.contentHandler.startElement.call(this.parent.contentHandler, namespaceURI, localName, qName, atts);
};

SAXParser.prototype.startElement_validating = function(namespaceURI, localName, qName, atts) {
    //may not have any DTD
    if (this.context) {
        this.augmenting_elm(namespaceURI, localName, qName, atts);
        this.resultPattern = this.validatorFunctions.childDeriv(this.context, this.pattern, this.childNode);
        if (this.resultPattern instanceof NotAllowed && !(this.resultPattern instanceof MissingContent)) {
            var str = "document not valid, message is : [" + this.resultPattern.message + "]";
            if (this.resultPattern.pattern) {
                str += ", expected was : [" + this.resultPattern.pattern.toHTML() + "], found is : [" + this.resultPattern.childNode.toHTML() + "]";
            }
            this.warning(str);
        }
    }
    return this.parent.contentHandler.startElement.call(this.parent.contentHandler, namespaceURI, localName, qName, atts);
};

SAXParser.prototype.endElement_augmenting = function(namespaceURI, localName, qName) {
    if (this.currentElementNode && this.currentElementNode.parentNode) {
        this.currentElementNode = this.currentElementNode.parentNode;
    }
    return this.parent.contentHandler.endElement.call(this.parent.contentHandler, namespaceURI, localName, qName);
};

SAXParser.prototype.characters_augmenting = function(ch, start, length) {
    //may not have any DTD
    if (this.context) {
        var newText = new TextNode(ch);
        this.currentElementNode.childNodes.push(newText);
    }
    return this.parent.contentHandler.characters.call(this.parent.contentHandler, ch, start, length);
};

SAXParser.prototype.endDocument_validating = function() {
    //if a dtd is present
    if (this.pattern) {
        this.resultPattern = this.validatorFunctions.childDeriv(this.context, this.pattern, this.childNode);
        if (this.resultPattern instanceof NotAllowed) {
            //may be string directly
            var found = this.resultPattern.childNode;
            if (found.toHTML) {
                found = found.toHTML();
            }
            throw new SAXException("document not valid, message is : [" + this.resultPattern.message + "], expected was : [" + this.resultPattern.pattern.toHTML() + "], found is : [" + found + "]");
        }
    }
    return this.parent.contentHandler.endDocument.call(this.parent.contentHandler);
};

SAXParser.loadFile = function(fname) {
    var xmlhttp = null;
    if (window.XMLHttpRequest) {// code for Firefox, Opera, IE7, etc.
        xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) {// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (xmlhttp !== null) {
        xmlhttp.open("GET", fname, false);
        xmlhttp.send(null);
        if (xmlhttp.readyState === 4) {
            return xmlhttp.responseText;
        }
    } else {
        throw new SAXException("Your browser does not support XMLHTTP, the external entity with URL : [" + fname + "] will not be resolved");
    }
    return false;
};

SAXParser.prototype.resolveEntity = function(entityName, publicId, baseURI, systemId) {
    var txt;
    if (baseURI) {
        txt = SAXParser.loadFile(baseURI + systemId);
    //new version of method
    } else {
        txt = SAXParser.loadFile(systemId);
    }
    if (txt) {
        //http://www.w3.org/TR/xml/#sec-line-ends replace \r\n and \r by \n
        txt = txt.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        return txt;
    }
    return "";
};

SAXParser.getSAXParseException = function(message, locator, saxScanner) {
    var saxParseException = new SAXParseException(message, locator);
    return saxParseException;
};

SAXParser.prototype.warning = function(message, saxScanner) {
    var saxParseException = SAXParser.getSAXParseException(message, this.parent.contentHandler.locator, saxScanner);
    if (this.parent && this.parent.errorHandler) {
        this.parent.errorHandler.warning.call(this.parent.errorHandler, saxParseException);
    }
};

SAXParser.prototype.error = function(message, saxScanner) {
    var saxParseException = SAXParser.getSAXParseException(message, this.parent.contentHandler.locator, saxScanner);

    if (this.parent && this.parent.errorHandler) {

        this.parent.errorHandler.error.call(this.parent.errorHandler, saxParseException);
    }
};

SAXParser.prototype.fatalError = function(message, saxScanner) {
    var saxParseException = SAXParser.getSAXParseException(message, this.parent.contentHandler.locator, saxScanner);
    if (this.parent && this.parent.errorHandler) {
        this.parent.errorHandler.fatalError.call(this.parent.errorHandler, saxParseException);
    }
    throw saxParseException;
};



/*
static XMLReader  createXMLReader()
          Attempt to create an XMLReader from system defaults.
static XMLReader  createXMLReader(java.lang.String className)
          Attempt to create an XML reader from a class name.
*/
function XMLReaderFactory () {
    throw 'XMLReaderFactory is not meant to be instantiated';
}

// PUBLIC API
XMLReaderFactory.createXMLReader = function (className) {
    if (className) {
        return new that[className]();
    }
    return new SAXParser(); // our system default XMLReader (parse() not implemented, however)
};

// CUSTOM CONVENIENCE METHODS

XMLReaderFactory.getSaxImport = function() {
    if (!that.saxImport) {
        var scripts = document.getElementsByTagName("script");
        for (var i = 0 ; i < scripts.length ; i++) {
            var script = scripts.item(i);
            var src = script.getAttribute("src");
            if (src && src.match("sax.js")) {
                that.saxImport = script;
                return that.saxImport;
            }
        }
    }
    return that.saxImport;
};

XMLReaderFactory.getJsPath = function() {
    if (that.jsPath === undefined) {
        var scriptTag = XMLReaderFactory.getSaxImport();
        if (scriptTag) {
            var src = scriptTag.getAttribute("src");
            that.jsPath = src.substring(0, src.lastIndexOf("/") + 1);
        }
    }
    return that.jsPath;
};

XMLReaderFactory.importJS = function(filename) {
    var scriptTag = XMLReaderFactory.getSaxImport();
    if (scriptTag !== undefined) {
        var path = XMLReaderFactory.getJsPath();
        if (path !== undefined) {
            var script = document.createElement("script");
            script.setAttribute("src", path + filename);
            script.setAttribute("type", "text/javascript");
            scriptTag.parentNode.insertBefore(script, scriptTag);
        } else {
            throw new SAXException("could not get path of sax.js from the script markup");
        }
    } else {
        throw new SAXException("could not find script markup importing sax.js in the document");
    }
};

XMLReaderFactory.checkDependencies = function() {
    if (typeof that.SAXScanner !== 'function') {
        try {
            this.importJS("SAXScanner.js");
        } catch(e) {
            throw new SAXException("implementation of SAXScanner, like SAXScanner.js, not provided and could not be dynamically loaded because of exception", e);
        }
    }
    //need an implementation of AttributesImpl
    if (typeof that.AttributesImpl !== 'function') {
        try {
            this.importJS("AttributesImpl.js");
        } catch(e2) {
            throw new SAXException("implementation of Attributes, like AttributesImpl.js, not provided and could not be dynamically loaded because of exception", e2);
        }
    }
    //also need an implementation of NamespaceSupport
    if (typeof that.NamespaceSupport !== 'function') {
        try {
            this.importJS("NamespaceSupport.js");
        } catch(e3) {
            throw new SAXException("implementation of NamespaceSupport, like NamespaceSupport.js, not provided and could not be dynamically loaded because of exception", e3);
        }
    }
    if (typeof that.XMLFilterImpl !== 'function') {
        try {
            this.importJS("XMLFilterImpls.js");
        } catch(e4) {
            throw new SAXException("implementation of XMLFilterImpl, like XMLFilterImpls.js, not provided and could not be dynamically loaded because of exception", e4);
        }
    }
    if (typeof that.Reader !== 'function') {
        try {
            this.importJS("Reader.js");
        } catch(e4) {
            throw new SAXException("implementation of Reader, like Reader.js, not provided and could not be dynamically loaded because of exception", e5);
        }
    }
    if (typeof that.ReaderWrapper !== 'function') {
        try {
            this.importJS("ReaderWrapper.js");
        } catch(e4) {
            throw new SAXException("implementation of ReaderWrapper.js, like ReaderWrapper.js, not provided and could not be dynamically loaded because of exception", e6);
        }
    }
};


// Add public API to global namespace (or other one, if we are in another)
this.SAXParser = SAXParser; // To avoid introducing any of our own to the namespace, this could be commented out, and require use of XMLReaderFactory.createXMLReader(); to get a parser

// Could put on org.xml.sax.
this.SAXException = SAXException;
this.SAXNotSupportedException = SAXNotSupportedException;
this.SAXNotRecognizedException = SAXNotRecognizedException;
this.SAXParseException = SAXParseException;

// Could put on org.xml.sax.helpers.
this.XMLReaderFactory = XMLReaderFactory;

// EP: No need to check dependencies
// XMLReaderFactory.checkDependencies();

}()); // end namespace


/*global window, AttributesImpl, SAXParseException, SAXParser */

/*
This is the private API for SAX parsing
*/
(function () { // Begin namespace

/* Scanner states */
var STATE_XML_DECL                  =  0;
var STATE_PROLOG                    =  1;
var STATE_EXT_ENT                   =  2;
var STATE_PROLOG_DOCTYPE_DECLARED   =  3;
var STATE_ROOT_ELEMENT              =  4;
var STATE_CONTENT                   =  5;
var STATE_TRAILING_MISC             =  6;

var XML_VERSIONS = ['1.0', '1.1']; // All existing versions of XML; will check this.features['http://xml.org/sax/features/xml-1.1'] if parser supports XML 1.1
var XML_VERSION = /^1\.\d+$/;
var ENCODING = /^[A-Za-z]([A-Za-z0-9._]|-)*$/;
var STANDALONE = /^yes$|^no$/;

/* XML Name regular expressions */
// Should disallow independent high or low surrogates or inversed surrogate pairs and also have option to reject private use characters; but strict mode will need to check for sequence of 2 characters if a surrogate is found
var NAME_START_CHAR = ":A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u0200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\ud800-\udbff\udc00-\udfff"; // The last two ranges are for surrogates that comprise #x10000-#xEFFFF; // Fix: Need to remove surrogate pairs here and handle elsewhere; also must deal with surrogates in entities
var NOT_START_CHAR = new RegExp("[^" + NAME_START_CHAR + "]");
var NAME_END_CHAR = ".0-9\u00B7\u0300-\u036F\u203F-\u2040-"; // Don't need escaping since to be put in a character class
var NOT_START_OR_END_CHAR = new RegExp("[^" + NAME_START_CHAR + NAME_END_CHAR + "]");

//[2]     Char     ::=    #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
//for performance reason I will not be conformant in applying this within the class (see CHAR_DATA_REGEXP)
var HIGH_SURR = "\ud800-\udbff"; // db7f cut-off would restrict private high surrogates
var LOW_SURR = "\udc00-\udfff";
var HIGH_SURR_EXP = new RegExp('['+HIGH_SURR+']');
var LOW_SURR_EXP = new RegExp('['+LOW_SURR+']');

var CHAR = "\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD";
var NOT_CHAR = '[^'+CHAR+']';
var NOT_A_CHAR = new RegExp(NOT_CHAR);
var NOT_A_CHAR_ERROR_CB = function () {
    if (this.reader.peek().search(HIGH_SURR_EXP) !== -1) {
        var temp_ch = this.reader.peek(); // Remember for errors
        this.reader.nextChar(true);
        if (this.reader.peek().search(LOW_SURR_EXP) !== -1) {
            return true;
        }
        return this.saxEvents.fatalError("invalid XML character, high surrogate, decimal code number '"+temp_ch.charCodeAt(0)+"' not immediately followed by a low surrogate", this);
    }
    return this.saxEvents.fatalError("invalid XML character, decimal code number '"+this.reader.peek().charCodeAt(0)+"'", this);
};
var NOT_A_CHAR_CB_OBJ = {pattern:NOT_A_CHAR, cb:NOT_A_CHAR_ERROR_CB};

var WS_CHARS = '\\t\\n\\r ';
var WS_CHAR = '['+WS_CHARS+']'; // \s is too inclusive
var WS = new RegExp(WS_CHAR);
var NON_WS = new RegExp('[^'+WS_CHARS+']');
//in the case of XML declaration document has not yet been processed, token is on <
var XML_DECL_BEGIN_STR = "^<\\?xml"+WS_CHAR;
var XML_DECL_BEGIN = new RegExp(XML_DECL_BEGIN_STR);
// in the case of detection of double XML declation, token is on ?
var XML_DECL_BEGIN_FALSE = new RegExp("^xml("+WS_CHAR+'|\\?)', 'i');

var NOT_REPLACED_ENTITIES = /^amp$|^lt$|^gt$|^quot$/;
var APOS_ENTITY = /^apos$/;
var CHAR_REF_ESCAPED = /^"$|^'$/;
var charRefEscaped = {};
charRefEscaped["'"] = "&apos;";
charRefEscaped['"'] = "&quot;";



// CUSTOM EXCEPTION CLASSES
// Our own exception class; should this perhaps extend SAXParseException?
function EndOfInputException() {}

EndOfInputException.prototype.toString = function() {
    return "EndOfInputException";
};

function EntityNotReplacedException(entityName) {
    this.entityName = entityName;
}
EntityNotReplacedException.prototype.toString = function() {
    return "EntityNotReplacedException";
};

function InternalEntityNotFoundException(entityName) {
    this.entityName = entityName;
}
InternalEntityNotFoundException.prototype.toString = function() {
    return "InternalEntityNotFoundException";
};
InternalEntityNotFoundException.prototype = new SAXParseException();
InternalEntityNotFoundException.constructor = InternalEntityNotFoundException;

// CUSTOM HELPER CLASSES
/*
in case of attributes, empty prefix will be null because default namespace is null for attributes
in case of elements, empty prefix will be "".
*/
function Sax_QName(prefix, localName) {
    this.prefix = prefix;
    this.localName = localName;
    if (prefix) {
        this.qName = prefix + ":" + localName;
    } else {
        this.qName = localName;
    }
}
Sax_QName.prototype.equals = function(qName) {
    return this.qName === qName.qName;
};

/*
Class for storing publicId and systemId
*/
function ExternalId() {
    this.publicId = null;
    this.systemId = null;
}
ExternalId.prototype.toString = function() {
    return "ExternalId";
};

function SAXScanner(saxParser, saxEvents) {
    this.saxParser = saxParser;
    this.saxEvents = saxEvents;
    this.NOT_CHAR = NOT_CHAR; // Set for access by SAXParser.parseString()
}
SAXScanner.prototype.toString = function() {
    return "SAXScanner";
};

SAXScanner.prototype.init = function() {
    this.state = STATE_XML_DECL;
    this.elementsStack = [];
    this.namespaceSupport.reset();
    /* map between entity names and values */
    this.entities = {};
    /* map between parameter entity names and values
            the parameter entites are used inside the DTD */
    this.parameterEntities = {};
    /* map between external entity names and URIs  */
    this.externalEntities = {};
    /* in order to check for recursion inside entities */
    this.currentEntities = [];
    /* on each depth, a relative base URI, empty if no xml:base found, is recorded */
    this.relativeBaseUris = [];
}

// BEGIN CUSTOM API (could make all but parse() private)
SAXScanner.prototype.parse = function(reader) { // We implement our own for now, but should probably call the standard parse() which requires an InputSource object (or systemId string)
    this.init();
    try {
        this.reader = reader;
        this.saxEvents.startDocument();
        // We must test for the XML Declaration before processing any whitespace
        this.startParsing();
        this.state = STATE_PROLOG;
        this.continueParsing();
    } catch(e) {
        if (e instanceof EndOfInputException) {
            if (this.elementsStack.length > 0) {
                this.saxEvents.fatalError("the markup " + this.elementsStack.pop() + " has not been closed", this);
            } else {
                try {
                    //maybe validation exceptions
                    this.saxEvents.endDocument();
                } catch(e2) {
                    throw e2;
                }
            }
        } else {
            throw e;
        }
    }
};


/*
scan XML declaration, test first character of document, and if right goes to character after <
in case external subset, ending character is before first markup of document, otherwise
ending character is first markup of document
*/
SAXScanner.prototype.startParsing = function() {
    try {
        this.reader.peek();
    } catch(e) {
        if (e instanceof EndOfInputException) {
            this.saxEvents.fatalError("empty document", this);
        } else {
            throw e;
        }
    }
    //if no XML declaration, then white spaces are allowed at beginning of XML
    if (!this.scanXMLDeclOrTextDecl()) {
        try {
            this.reader.skipWhiteSpaces();
        } catch(e) {
            //if all whitespaces, w3c test case xmlconf/xmltest/not-wf/sa/050.xml
            if (e instanceof EndOfInputException) {
                this.saxEvents.fatalError("empty document", this);
            } else {
                throw e;
            }
        }
    }
};

/*
used for integration with codemirror
each iteration of that while must be the end of a token
end of a markup or end of a text
*/
SAXScanner.prototype.continueParsing = function() {
    while (true) {
        this.next();
    }
}

SAXScanner.prototype.next = function() {
    if (this.elementsStack.length === 0) {
        //whitespaces are not significant between top level markups
        this.reader.skipWhiteSpaces();
        if (this.reader.matchChar("<")) {
            this.scanMarkup();
        } else {
            this.reader.nextChar();
            this.saxEvents.fatalError("can not have text at root level of the XML", this);
        }
    } else {
        if (this.reader.matchChar("<")) {
            this.scanMarkup();
        } else {
            this.scanText();
        }
    }
};



// [1] document ::= prolog element Misc*
//
// [22] prolog ::= XMLDecl? Misc* (doctypedecl Misc*)?
// [23] XMLDecl ::= '<?xml' VersionInfo EncodingDecl? SDDecl? S? '?>'
// [24] VersionInfo ::= S 'version' Eq (' VersionNum ' | " VersionNum ")
//
// The beginning of XMLDecl simplifies to:
//    '<?xml' S ...
//
// [27] Misc ::= Comment | PI |  S
// [15] Comment ::= '<!--' ((Char - '-') | ('-' (Char - '-')))* '-->'
// [16] PI ::= '<?' PITarget (S (Char* - (Char* '?>' Char*)))? '?>'
// [17] PITarget ::= Name - (('X' | 'x') ('M' | 'm') ('L' | 'l'))
//
// [28] doctypedecl ::= '<!DOCTYPE' S Name (S ExternalID)? S?
//                      ('[' (markupdecl | PEReference | S)* ']' S?)? '>'
//
//White Space
// [3] S ::=(#x20 | #x9 | #xD | #xA)+
SAXScanner.prototype.scanMarkup = function() {
    if (this.state === STATE_PROLOG) {
        if (this.reader.matchChar("!")) {
            if (!this.scanComment()) {
                //there is no other choice but, in case exception is not FATAL,
                // and in order to have equivalent behaviours between scan()
                if (this.scanDoctypeDecl()) {
                    this.state = STATE_PROLOG_DOCTYPE_DECLARED;
                }
            }
        } else if (this.reader.matchChar("?")) {
            //in case it is not a valid processing instruction
            //scanPI will throw the exception itself, with a better message
            this.scanPI();
        } else {
            this.state = STATE_ROOT_ELEMENT;
            //does not go to next char exiting the method
            this.scanMarkup();
        }
    } else if (this.state === STATE_PROLOG_DOCTYPE_DECLARED) {
        if (this.reader.matchChar("!")) {
            if (!this.scanComment()) {
                if (this.reader.matchStr("DOCTYPE")) {
                    this.saxEvents.fatalError("can not have two doctype declarations", this);
                } else {
                    this.saxEvents.fatalError("invalid declaration, only a comment is allowed here after &lt;!", this);
                }
            }
        } else if (this.reader.matchChar("?")) {
            //in case it is not a valid processing instruction
            //scanPI will throw the exception itself, with a better message
            this.scanPI();
        } else {
            this.state = STATE_ROOT_ELEMENT;
            //does not go to next char exiting the method
            this.scanMarkup();
        }
    } else if (this.state === STATE_ROOT_ELEMENT) {
        if (this.scanElement()) {
            //there may be just a root empty markup (already closed)
            if (this.elementsStack.length > 0) {
                this.state = STATE_CONTENT;
            } else {
                this.state = STATE_TRAILING_MISC;
            }
        } else {
            this.saxEvents.fatalError("document is empty, no root element detected", this);
        }
    } else if (this.state === STATE_CONTENT) {
        if (this.reader.matchChar("!")) {
            if (!this.scanComment()) {
                if (!this.scanCData()) {
                    this.saxEvents.fatalError("neither comment nor CDATA after &lt;!", this);
                }
            }
        } else if (this.reader.matchChar("?")) {
            //in case it is not a valid processing instruction
            //scanPI will throw the exception itself, with a better message
            this.scanPI();
        } else if (this.reader.matchChar("/")) {
            if (this.scanEndingTag()) {
                if (this.elementsStack.length === 0) {
                    this.state = STATE_TRAILING_MISC;
                }
            }
        } else {
            if (!this.scanElement()) {
                this.saxEvents.fatalError("not valid markup", this);
            }
        }
    } else if (this.state === STATE_TRAILING_MISC) {
        if (this.reader.matchChar("!")) {
            if (!this.scanComment()) {
                this.saxEvents.fatalError("end of document, only comments or processing instructions are allowed", this);
            }
        } else if (this.reader.matchChar("?")) {
            if (!this.scanPI()) {
                this.saxEvents.fatalError("end of document, only comment or processing instruction are allowed", this);
            }
        } else if (this.reader.matchChar("/")) {
            this.saxEvents.fatalError("invalid ending tag at root of the document", this);
        } else {
            this.saxEvents.fatalError("only one document element is allowed", this);
        }
    }
};

//  what I understand from there : http://www.w3.org/TR/REC-xml/#dt-chardata is that & is allowed
// in character data only if it is an entity reference
SAXScanner.prototype.scanText = function() {
    var content = this.scanCharData();
    //in case of external entity, the process is reinitialized??
    //if found a "&"
    while (this.reader.matchChar("&")) {
        try {
            //scanRef returns character reference if it is not an entity
            var charRef = this.scanRef();
            if (charRef) {
                content += charRef;
            }
        } catch(e) {
            if (e instanceof EntityNotReplacedException) {
                content += "&" + e.entityName + ";";
            } else if (e instanceof InternalEntityNotFoundException) {
                // at this place in XML, that entity ref may be an external entity
                var externalId = this.externalEntities[e.entityName];
                if (externalId === undefined) {
                    this.saxEvents.error("entity : [" + e.entityName + "] not declared as an internal entity or as an external one", this);
                } else {
                    this.includeEntity(e.entityName, externalId);
                }
            } else {
                throw e;
            }
        }
        content += this.scanCharData();
    }
    //xmlconf/xmltest/valid/sa/047.xml test
    content = content.replace(/\r\n/g, "\n");
    if (content.search(NON_WS) === -1) {
        this.saxEvents.ignorableWhitespace(content, 0, content.length);
    } else {
        this.saxEvents.characters(content, 0, content.length);
    }
};

// 14]    CharData ::= [^<&]* - ([^<&]* ']]>' [^<&]*)
SAXScanner.prototype.scanCharData = function() {
    var content = this.reader.nextCharRegExp(this.CHAR_DATA_REGEXP, NOT_A_CHAR_CB_OBJ);
    //if found a "]", must ensure that it is not followed by "]>"
    while (this.reader.matchChar("]")) {
        if (this.reader.matchStr("]>")) {
            this.saxEvents.error("Text must not contain a literal ']]&gt;' sequence", this);
        }
        content +=  "]" + this.reader.nextCharRegExp(this.CHAR_DATA_REGEXP, NOT_A_CHAR_CB_OBJ);
    }
    return content;
};


SAXScanner.prototype.getRelativeBaseUri = function() {
    var returned = this.saxParser.baseURI;
    var i = this.relativeBaseUris.length;
    while (i--) {
        returned += this.relativeBaseUris[i];
    }
    return returned;
};

/*
 entity is replaced and its replacement is parsed, see http://www.w3.org/TR/REC-xml/#included
 entityName is used for SAX compliance with resolveEntity and recursion detection
 */
SAXScanner.prototype.includeEntity = function(entityName, replacement) {
    //if it is an externalId, have to include the external content
    if (replacement instanceof ExternalId) {
        try {
            //it seems externalEntity does not take in account xml:base, see xmlconf.xml
            var externalEntity = this.saxEvents.resolveEntity(entityName, replacement.publicId, this.saxParser.baseURI, replacement.systemId);
            if (externalEntity !== undefined) {
                //check for no recursion
                if (externalEntity.search(new RegExp("&" + entityName + ";")) !== -1) {
                    this.saxEvents.fatalError("Recursion detected : [" + entityName + "] contains a reference to itself", this);
                }
                //there may be another xml declaration at beginning of external entity
                this.includeText(externalEntity);
                var oldState = this.state;
                this.state = STATE_EXT_ENT;
                //if external entity begins with XML declaration, can begin processing otherwise directly use continueParsing
                if (this.reader.matchRegExp(6, XML_DECL_BEGIN, true)) {
                    this.startParsing();
                }
                this.state = oldState;
            }
        } catch(e) {
            this.saxEvents.error("issue at resolving entity : [" + entityName + "], publicId : [" + replacement.publicId + "], uri : [" + this.saxParser.baseURI + "], systemId : [" + replacement.systemId + "], got exception : [" + e.toString() + "]", this);
        }
    } else {
        //check for no recursion
        if (replacement.search(new RegExp("&" + entityName + ";")) !== -1) {
            this.saxEvents.fatalError("Recursion detected : [" + entityName + "] contains a reference to itself", this);
        }
        this.includeText(replacement);
    }
};

SAXScanner.prototype.includeText = function(replacement) {
    // entity is replaced and its replacement is parsed, see http://www.w3.org/TR/REC-xml/#included
    this.reader.unread(replacement);
};

/*
current char is after '&'
does not return the replacement, it is added to the xml
may throw exception if entity has not been found (if external for example)
*/
SAXScanner.prototype.scanRef = function() {
    if (this.reader.matchChar("#")) {
        return this.scanCharRef();
    } else {
        this.scanEntityRef();
    }
};


// [15] Comment ::= '<!--' ((Char - '-') | ('-' (Char - '-')))* '-->'
SAXScanner.prototype.scanComment = function() {
    if (this.reader.matchChar("-")) {
        if (this.reader.matchChar("-")) {
            var comment = this.reader.nextCharRegExp(new RegExp(NOT_CHAR+'|-'), NOT_A_CHAR_CB_OBJ);
            while (this.reader.matchChar("-")) {
                if (this.reader.matchStr("->")) {
                    break;
                }
                else if (this.reader.matchChar("-")) {
                    return this.saxEvents.fatalError("end of comment not valid, must be --&gt;", this);
                }
                comment += "-" + this.reader.nextCharRegExp(new RegExp(NOT_CHAR+'|-'), NOT_A_CHAR_CB_OBJ);
            }
            this.saxEvents.comment(comment, 0, comment.length);// Brett (test for support and change start/length?)
            return true;
        } else {
            return this.saxEvents.fatalError("beginning comment markup is invalid, must be &lt;!--", this);
        }
    } else {
        // can be a doctype
        return false;
    }
};


SAXScanner.prototype.setEncoding = function (encoding) {
    if (this.saxParser.contentHandler.locator) {
        this.saxParser.contentHandler.locator.setEncoding(this.encoding || encoding); // Higher priority is given to any encoding set on an InputSource (passed in during parse())
    }
};

SAXScanner.prototype.setXMLVersion = function (version) {
   if (version) {
        if (XML_VERSIONS.indexOf(version) === -1) {
            this.saxEvents.fatalError("The specified XML Version is not a presently valid XML version number", this); // e.g. 1.5
        } else if (version === '1.1' && this.saxParser.features['http://xml.org/sax/features/xml-1.1'] === false) {
            this.saxEvents.fatalError("The XML text specifies version 1.1, but this parser does not support this version.", this);
        }
        this.saxParser.properties['http://xml.org/sax/properties/document-xml-version'] = version;
        if (this.saxParser.contentHandler.locator) {
            this.saxParser.contentHandler.locator.setXMLVersion(version);
        }
    }
};

SAXScanner.prototype.scanXMLDeclOrTextDeclAttribute = function (allowableAtts, allowableValues, requireWS) {
    if (this.reader.equals("?")) {
        return false;
    }
    if (requireWS && this.reader.peek().search(WS) === -1) {
        return this.saxEvents.fatalError('The XML Declaration or Text Declaration must possess a space between the version/encoding/standalone information.', this);
    }
    this.reader.skipWhiteSpaces();
    var attName = this.scanName();
    var attPos = allowableAtts.indexOf(attName);
    if (attPos === -1) {
        if (['version', 'encoding', 'standalone'].indexOf(attName) !== -1) {
            return this.saxEvents.fatalError('The attribute name "'+attName+'" was not expected at this position in an XML or text declaration. It was expected to be: '+allowableAtts.join(', '), this);
        }
        return this.saxEvents.fatalError('The attribute name "'+attName+'" does not match the allowable names in an XML or text declaration: '+allowableAtts.join(', '), this);
    }
    this.reader.skipWhiteSpaces();
    if (this.reader.matchChar("=")) {
        this.reader.skipWhiteSpaces();
        if (this.reader.equals('"') || this.reader.equals("'")) {
            try {
                var attValue = this.reader.quoteContent();
                if (attValue.search(allowableValues[attPos]) === -1) {
                    return this.saxEvents.fatalError('The attribute value "'+attValue+'" does not match the allowable values in an XML or text declaration: '+allowableValues[attPos], this);
                }
            //adding a message in that case
            } catch(e) {
                if (e instanceof EndOfInputException) {
                    return this.saxEvents.fatalError("document incomplete, attribute value declaration must end with a quote", this);
                } else {
                    throw e;
                }
            }
        } else {
            return this.saxEvents.fatalError("invalid declaration attribute value declaration, must begin with a quote", this);
        }
    } else {
        return this.saxEvents.fatalError("invalid declaration attribute, must contain = between name and value", this);
    }
    return [attName, attValue];
};

/*
 [23] XMLDecl ::= '<?xml' VersionInfo EncodingDecl? SDDecl? S? '?>'
 [24] VersionInfo ::= S 'version' Eq (' VersionNum ' | " VersionNum ")
 [80] EncodingDecl ::= S 'encoding' Eq ('"' EncName '"' |  "'" EncName "'" )
 [81] EncName ::= [A-Za-z] ([A-Za-z0-9._] | '-')*
 [32] SDDecl ::= S 'standalone' Eq (("'" ('yes' | 'no') "'")
                 | ('"' ('yes' | 'no') '"'))
 [77] TextDecl ::= '<?xml' VersionInfo? EncodingDecl S? '?>'
 current character is "<", at return current char is exceptionally after ">" because parsing is just starting, so first character must stay the
first character of document
 */
SAXScanner.prototype.scanXMLDeclOrTextDecl = function() {
    // Fix: need to have conditions to trigger STATE_EXT_ENT somehow
    // allow scanning of text declaration/external XML entity?
    var version = null;
    var encoding = 'UTF-8'; // As the default with no declaration is UTF-8, we assume it is such, unless the
    // encoding is indicated explicitly, in which case we will trust that. We are therefore not able to discern
    // UTF-16 represented without an explicit declaration nor report any inconsistencies between header encoding,
    // byte-order mark, or explicit encoding information, unless it is reported on InputSource (see next note).

    // If we were processing individual bytes (e.g., if we represented XML as an array of bytes), we
    //    could detect the encoding ourselves, including byte-order mark (and also allow checking
    //    against any header encoding), but since JavaScript converts pages for us into UTF-16 (two bytes per
    //    character), we cannot use the same approach unless we allow the InputSource with the InputStream (byteStream)
    //    constructor in Java SAX2; instead we take an approach more similar to the StringReader (Reader characterStream
    //    constructor), though we haven't fully implemented that API at present: http://java.sun.com/j2se/1.4.2/docs/api/java/io/StringReader.html
    // This script will therefore not detect an inconsistency between the encoding of the original document (since
    //    we don't know what it is) and the encoding indicated in its (optional) XML Declaration/Text Declaration

    if (this.reader.matchRegExp(6, XML_DECL_BEGIN)) {
        var standalone = false;
        if (this.state === STATE_XML_DECL) {
            var versionArr = this.scanXMLDeclOrTextDeclAttribute(['version'], [XML_VERSION]);
            if (!versionArr) {
                return this.saxEvents.fatalError("An XML Declaration must have version information", this);
            }
            version = versionArr[1];
            this.setXMLVersion(version);
            var encodingOrStandalone = this.scanXMLDeclOrTextDeclAttribute(['encoding', 'standalone'], [ENCODING, STANDALONE], true);
            if (encodingOrStandalone) {
                if (encodingOrStandalone[0] === 'encoding') {
                    encoding = encodingOrStandalone[1];
                    this.setEncoding(encoding);
                    
                    var standaloneArr = this.scanXMLDeclOrTextDeclAttribute(['standalone'], [STANDALONE], true);
                    if (standaloneArr && standaloneArr === 'yes') {
                        standalone = true;
                    }
                }
            }
            this.saxParser.features['http://xml.org/sax/features/is-standalone'] = standalone;
        } else { // STATE_EXT_ENT
            var versionOrEncodingArr = this.scanXMLDeclOrTextDeclAttribute(['version', 'encoding'], [XML_VERSION, ENCODING]);
            if (versionOrEncodingArr[0] === 'version') {
                version = versionOrEncodingArr[1];
                this.setXMLVersion(version);
                versionOrEncodingArr = this.scanXMLDeclOrTextDeclAttribute(['encoding'], [ENCODING], true);
            }
            if (!versionOrEncodingArr) {
                return this.saxEvents.fatalError("A text declaration must possess explicit encoding information", this);
            }
            encoding = versionOrEncodingArr[1];
            this.setEncoding(encoding);
        }

        this.reader.skipWhiteSpaces();
        if (this.reader.unequals("?")) {
            return this.saxEvents.fatalError("invalid markup, '"+this.reader.peek()+"', in XML or text declaration where '?' expected", this);
        }
        this.reader.nextChar(true);
        if (this.reader.unequals(">")) {
            return this.saxEvents.fatalError("invalid markup inside XML or text declaration; must end with &gt;", this);
        }
        this.reader.nextChar();
        return true;
    } else {
        if (this.state === STATE_XML_DECL) {
            this.setXMLVersion('1.0'); // Assumed when no declaration present
            if (this.saxParser.contentHandler.locator) {
                this.saxParser.contentHandler.locator.setEncoding(encoding);
            }
            this.saxParser.features['http://xml.org/sax/features/is-standalone'] = false;
        }
        return false;
    }
};


// [16] PI ::= '<?' PITarget (S (Char* - (Char* '?>' Char*)))? '?>'
// [17] PITarget ::= Name - (('X' | 'x') ('M' | 'm') ('L' | 'l'))
/*
current char is '?'
*/
SAXScanner.prototype.scanPI = function() {
    if (this.reader.matchRegExp(4, XML_DECL_BEGIN_FALSE)) {
        return this.saxEvents.fatalError("XML Declaration cannot occur past the very beginning of the document.", this);
    }
    var piName = this.scanName();
    this.reader.skipWhiteSpaces();
    var piData = this.reader.nextCharRegExp(new RegExp(NOT_CHAR+'|\\?'), NOT_A_CHAR_CB_OBJ);
    //if found a "?", end if it is followed by ">"
    while (this.reader.matchChar("?")) {
        if (this.reader.matchChar(">")) {
            break;
        }
        piData += "?" + this.reader.nextCharRegExp(new RegExp(NOT_CHAR+'|\\?'), NOT_A_CHAR_CB_OBJ);
    }
    this.saxEvents.processingInstruction(piName, piData);
    return true;
};


SAXScanner.prototype.loadExternalDtd = function(externalId) {
    //in case of restricted uri error
    try {
        var uri;
        //in case xml is loaded from string (do we load dtd in that case ?)
        if (this.saxParser.baseURI) {
            uri = this.saxParser.baseURI + externalId.systemId;
        } else {
            uri = externalId.systemId;
        }
        var extSubset = SAXParser.loadFile(uri);
        this.scanExtSubset(extSubset);
    } catch(e) {
        this.saxEvents.warning("exception : [" + e.toString() + "] trying to load external subset : [" + this.saxParser.baseURI + externalId.systemId + "]", this);
    }
}

//[28]    doctypedecl    ::=    '<!DOCTYPE' S  Name (S  ExternalID)? S? ('[' intSubset ']' S?)? '>'
SAXScanner.prototype.scanDoctypeDecl = function() {
    if (this.reader.matchStr("DOCTYPE")) {
        this.reader.skipWhiteSpaces();
        var name = this.reader.nextCharRegExp(/[ \[>]/);
        this.reader.skipWhiteSpaces();
        var externalId = new ExternalId();
        //if there is an externalId
        if (this.scanExternalId(externalId)) {
            this.reader.skipWhiteSpaces();
        }
        this.saxEvents.startDTD(name, externalId.publicId, externalId.systemId);
        if (this.reader.matchChar("[")) {
            this.reader.skipWhiteSpaces();
            while (this.reader.unequals("]")) {
                this.scanDoctypeDeclIntSubset();
                this.reader.skipWhiteSpaces();
            }
            this.reader.nextChar();
        }
        //extract of specs : if both the external and internal subsets are used, the internal subset MUST be considered to occur before the external subset
        if (externalId.systemId !== null) {
            this.loadExternalDtd(externalId);
        }
        if (this.reader.unequals(">")) {
            return this.saxEvents.fatalError("invalid content in doctype declaration", this);
        }
        this.reader.nextChar();
        this.saxEvents.endDTD();
        return true;
    } else {
        return this.saxEvents.fatalError("invalid doctype declaration, must be &lt;!DOCTYPE", this);
    }
};

/*
[30]    extSubset    ::=     TextDecl? extSubsetDecl
[31]    extSubsetDecl    ::=    ( markupdecl | conditionalSect | DeclSep)*
*/
SAXScanner.prototype.scanExtSubset = function(extSubset) {
    if (extSubset.search(NON_WS) !== -1) {
        var oldReader = this.reader;
        this.reader = new ReaderWrapper(new StringReader(extSubset));
        this.startParsing();
        //current char is first <
        try {
            while(true) {
                //should also support conditionalSect
                this.scanDoctypeDeclIntSubset();
                this.reader.skipWhiteSpaces();
            }
        } catch(e) {
            if (!(e instanceof EndOfInputException)) {
                throw e;
            }
        }
        this.reader = oldReader;
    }
};

//[75]    ExternalID     ::=    'SYSTEM' S  SystemLiteral
//      | 'PUBLIC' S PubidLiteral S SystemLiteral
/*
current char is first non whitespace char
ending char is ending quote
*/
SAXScanner.prototype.scanExternalId = function(externalId) {
    if (this.reader.matchStr("SYSTEM")) {
        this.reader.skipWhiteSpaces();
        externalId.systemId = this.scanSystemLiteral();
        return true;
    } else if (this.reader.matchStr("PUBLIC")) {
        this.reader.skipWhiteSpaces();
        externalId.publicId = this.scanPubIdLiteral();
        this.reader.skipWhiteSpaces();
        externalId.systemId = this.scanSystemLiteral();
        return true;
    }
    return false;
};

//current char should be the quote
//[11]    SystemLiteral    ::=    ('"' [^"]* '"') | ("'" [^']* "'")
SAXScanner.prototype.scanSystemLiteral = function(externalId) {
    if (this.reader.unequals("'") && this.reader.unequals('"')) {
        return this.saxEvents.fatalError("invalid sytem Id declaration, should begin with a quote", this);
    }
    return this.reader.quoteContent();
};

//current char should be the quote
//[12]    PubidLiteral     ::=    '"' PubidChar* '"' | "'" (PubidChar - "'")* "'"
//[13]    PubidChar    ::=    #x20 | #xD | #xA | [a-zA-Z0-9] | [-'()+,./:=?;!*#@$_%]
SAXScanner.prototype.scanPubIdLiteral = function(externalId) {
    if (this.reader.unequals("'") && this.reader.unequals('"')) {
        return this.saxEvents.fatalError("invalid Public Id declaration, should begin with a quote", this);
    }
    return this.reader.quoteContent();
};

/*
Parameter entity references are recognized anywhere in the DTD (internal and external subsets and external parameter entities),
except in literals, processing instructions, comments, and the contents of ignored conditional sections
When a parameter-entity reference is recognized in the DTD and included, its replacement text MUST be enlarged by the attachment
 of one leading and one following space (#x20) character
*/
SAXScanner.prototype.includeParameterEntity = function() {
    var replacement = this.scanPeRef();
    // entity is replaced and its replacement is parsed, see http://www.w3.org/TR/REC-xml/#included
    //if it is an externalId, have to include the external content
    if (replacement instanceof ExternalId) {
        try {
            //it seems externalEntity does not take in account xml:base, see xmlconf.xml
            //call new version of method
            var externalEntity = this.saxEvents.resolveEntity(null, replacement.publicId, null, this.saxParser.baseURI + replacement.systemId);
            //if not only whitespace
            if (externalEntity !== undefined && externalEntity.search(NON_WS) !== -1) {
                //there may be another xml declaration at beginning of external entity
                this.includeText(externalEntity);
                var oldState = this.state;
                this.state = STATE_EXT_ENT;
                //if external entity begins with XML declaration, can begin processing otherwise directly use continueParsing
                if (this.reader.matchRegExp(6, XML_DECL_BEGIN, true)) {
                    this.startParsing();
                }
                this.state = oldState;
            }
        } catch(e) {
            this.saxEvents.error("issue at resolving entity : [" + entityName + "], publicId : [" + replacement.publicId + "], uri : [" + this.saxParser.baseURI + "], systemId : [" + replacement.systemId + "], got exception : [" + e.toString() + "]", this);
        }
    } else {
        this.includeText(" " + replacement + " ");
    }
};

/*
actual char is non whitespace char after '['
[28a]     DeclSep    ::=     PEReference | S
[28b]     intSubset    ::=    (markupdecl | DeclSep)*
[29]    markupdecl     ::=     elementdecl | AttlistDecl | EntityDecl | NotationDecl | PI | Comment
*/
SAXScanner.prototype.scanDoctypeDeclIntSubset = function() {
    if (this.reader.matchChar("<")) {
        if (this.reader.matchChar("?")) {
            if (!this.scanPI()) {
                this.saxEvents.fatalError("invalid processing instruction inside doctype declaration", this);
            }
        } else if (this.reader.matchChar("!")) {
            if (!this.scanComment()) {
                if (!this.scanEntityDecl() && !this.scanElementDecl() &&
                        !this.scanAttlistDecl() && !this.scanNotationDecl()) {
                    //no present support for other declarations
                    this.reader.nextCharWhileNot(">");
                    this.reader.nextChar(true);
                }
            } else {
                //if comment, must go over the whitespaces as they are not significative in doctype internal subset declaration
                this.reader.skipWhiteSpaces();
            }
        }
    /*
    Reference in DTD   Included as PE
*/
    } else if (this.reader.matchChar("%")) {
        this.includeParameterEntity();
    } else {
        this.saxEvents.fatalError("invalid character in internal subset of doctype declaration : [" + this.reader.peek() + "]", this);
    }
};

/*
[70]    EntityDecl     ::=     GEDecl  | PEDecl
[71]              GEDecl     ::=    '<!ENTITY' S  Name  S  EntityDef  S? '>'
[72]    PEDecl     ::=    '<!ENTITY' S '%' S Name S PEDef S? '>'
[73]    EntityDef    ::=     EntityValue  | (ExternalID  NDataDecl?)
[74]    PEDef    ::=    EntityValue | ExternalID
[75]    ExternalID     ::=    'SYSTEM' S  SystemLiteral
      | 'PUBLIC' S PubidLiteral S SystemLiteral
[76]    NDataDecl    ::=    S 'NDATA' S Name
current char is first char of declaration
ending char is >
*/
SAXScanner.prototype.scanEntityDecl = function() {
    var entityName, externalId, entityValue;
    if (this.reader.matchStr("ENTITY")) {
        this.reader.skipWhiteSpaces();
        if (this.reader.matchChar("%")) {
            this.reader.skipWhiteSpaces();
            entityName = this.scanName();
            this.reader.skipWhiteSpaces();
            //if already declared, not effective
            if (!this.parameterEntities[entityName]) {
                externalId = new ExternalId();
                if (!this.scanExternalId(externalId)) {
                    entityValue = this.scanEntityValue();
                    this.parameterEntities[entityName] = entityValue;
                    this.saxEvents.internalEntityDecl("%" + entityName, entityValue);
                } else {
                    this.parameterEntities[entityName] = externalId;
                }
            } else {
                var ignored = this.reader.nextCharWhileNot(">");
                //an XML processor MAY issue a warning if entities are declared multiple times.
                this.saxEvents.warning("entity : [" + entityName + "] is declared several times, only first value : [" + this.parameterEntities[entityName] + "] is effective, declaration : [" + ignored + "] is ignored");
            }
        } else {
            entityName = this.scanName();
            this.reader.skipWhiteSpaces();
            externalId = new ExternalId();
            if (this.scanExternalId(externalId)) {
                this.reader.skipWhiteSpaces();
                if (this.reader.matchStr("NDATA")) {
                    this.reader.skipWhiteSpaces();
                    var ndataName = this.scanName();
                    this.saxEvents.unparsedEntityDecl(entityName, externalId.publicId, externalId.systemId, ndataName);
                }
                if (this.externalEntities[entityName] === undefined) {
                    this.externalEntities[entityName] = externalId;
                } else {
                    //an XML processor MAY issue a warning if entities are declared multiple times.
                    this.saxEvents.warning("external entity : [" + entityName + "] is declared several times, only first value : [" + this.externalEntities[entityName] + "] is effective, declaration : [" + externalId + "] is ignored");
                }
            } else {
                entityValue = this.scanEntityValue();
                if (this.entities[entityName] === undefined) {
                    if (this.isEntityReferencingItself(entityName, entityValue)) {
                        this.saxEvents.error("circular entity declaration, entity : [" + entityName + "] is referencing itself directly or indirectly", this);
                    } else {
                        this.entities[entityName] = entityValue;
                        this.saxEvents.internalEntityDecl(entityName, entityValue);
                    }
                } else {
                    //an XML processor MAY issue a warning if entities are declared multiple times.
                    this.saxEvents.warning("entity : [" + entityName + "] is declared several times, only first value : [" + this.entities[entityName] + "] is effective, declaration : [" + entityValue + "] is ignored");
                }
            }
        }
        this.reader.nextChar(true);
        return true;
    }
    return false;
};
/*
false is OK
*/
SAXScanner.prototype.isEntityReferencingItself = function(entityName, entityValue) {
    var parsedValue = /^[^&]*&([^;]+);(.*)/.exec(entityValue);
    if (parsedValue !== null) {
        // parsedValue[1] is the name of the nested entity
        if (parsedValue[1] === entityName) {
            return true;
        } else {
            var replacement = this.entities[parsedValue[1]];
            //if already declared
            if (replacement !== undefined) {
                var check = this.isEntityReferencingItself(entityName, replacement);
                return check || this.isEntityReferencingItself(entityName, parsedValue[2]);
            } else {
                return this.isEntityReferencingItself(entityName, parsedValue[2]);
            }
        }
    } else {
        return false;
    }
};

/*
[9]     EntityValue    ::=    '"' ([^%&"] | PEReference | Reference)* '"'
      |  "'" ([^%&'] | PEReference | Reference)* "'"
[68]    EntityRef    ::=    '&' Name ';'
[69]    PEReference    ::=    '%' Name ';'
*/
SAXScanner.prototype.scanEntityValue = function() {
    if (this.reader.equals('"') || this.reader.equals("'")) {
        var quote = this.reader.next();
        var regexp = new RegExp("[" + quote + "&%]");
        var entityValue = this.reader.nextCharRegExp(regexp);
        //if found a "%" must replace it, EntityRef are not replaced here, but char ref are replaced, see XML spec 4.4.8
        while (true) {
            if (this.reader.matchChar("%")) {
                var peRef = this.scanPeRef();
                //in this case replace externalId by its content but does not parse anything
                if (peRef instanceof ExternalId) {
                    peRef = this.saxEvents.resolveEntity(null, peRef.publicId, null, this.saxParser.baseURI + peRef.systemId);
                }
                entityValue += peRef + this.reader.nextCharRegExp(regexp);
            } else if (this.reader.matchChar("&")) {
                if (this.reader.matchChar("#")) {
                    var charRef = this.scanCharRef();
                    entityValue += charRef + this.reader.nextCharRegExp(regexp);
                } else {
                    entityValue += "&" + this.reader.nextCharRegExp(regexp);
                }
            } else {
                break;
            }
        }
        if (/\uFFFF/.test(entityValue)) {
            return this.saxEvents.fatalError("invalid entity declaration value, must not contain U+FFFF", this);
        }
        //current char is ending quote
        this.reader.nextChar();
        return entityValue;
    } else {
        return this.saxEvents.error("invalid entity value declaration, must begin with a quote", this);
    }
};

/*
[69]    PEReference    ::=    '%' Name ';'
for use in scanDoctypeDeclIntSubset where we need the original entityName, it may have already been parsed
may return an ExternalId
*/
SAXScanner.prototype.scanPeRef = function(entityName) {
    try {
        entityName = this.reader.nextCharWhileNot(";");
        this.reader.nextChar(true);
        //tries to replace it by its value if declared internally in doctype declaration
        var replacement = this.parameterEntities[entityName];
        if (replacement !== undefined) {
            return replacement;
        }
        this.saxEvents.fatalError("parameter entity reference : [" + entityName + "] has not been declared, no replacement found", this);
        return "";
    //adding a message in that case
    } catch(e) {
        if (e instanceof EndOfInputException) {
            return this.saxEvents.fatalError("document incomplete, parameter entity reference must end with ;", this);
        } else {
            throw e;
        }
    }
};

/*
[45]    elementdecl    ::=    '<!ELEMENT' S  Name  S  contentspec  S? '>'
[46]    contentspec    ::=    'EMPTY' | 'ANY' | Mixed | children
[51]      Mixed    ::=    '(' S? '#PCDATA' (S? '|' S? Name)* S? ')*'
      | '(' S? '#PCDATA' S? ')'
[47]    children     ::=    (choice | seq) ('?' | '*' | '+')?
ending char is >
*/
SAXScanner.prototype.scanElementDecl = function() {
    if (this.reader.matchStr("ELEMENT")) {
        this.reader.skipWhiteSpaces();
        var name = this.scanName();
        this.reader.skipWhiteSpaces();
        var model = this.scanContentModelDecl();
        //current char must be ending >
        this.reader.nextChar(true);
        this.saxEvents.elementDecl(name, model);
        return true;
    }
    return false;
};

/*
does not remove whitespace as "|" is a valid name character
collapse only whitespace to single space
*/
SAXScanner.prototype.scanContentModelDecl = function() {
    var regexp = new RegExp("[%>]");
    var model = this.reader.nextCharRegExp(regexp);
    while (this.reader.matchChar("%")) {
        this.includeParameterEntity();
        model += this.reader.nextCharRegExp(regexp);
    }
    return model.replace(new RegExp(WS_CHAR + "+", "g"), " ");
};


/*
[52]    AttlistDecl    ::=    '<!ATTLIST' S  Name  AttDef* S? '>'
current char is first char of declaration
ending char is >
*/
SAXScanner.prototype.scanAttlistDecl = function() {
    if (this.reader.matchStr("ATTLIST")) {
        this.reader.skipWhiteSpaces();
        if (this.reader.matchChar("%")) {
            this.includeParameterEntity();
            this.reader.skipWhiteSpaces();
        }
        var eName = this.scanName();
        this.reader.skipWhiteSpaces();
        while (this.reader.unequals(">")) {
            this.scanAttDef(eName);
        }
        this.reader.nextChar(true);
        return true;
    }
    return false;
};

/*
[53]    AttDef     ::=    S Name S AttType S DefaultDecl
[60]    DefaultDecl    ::=    '#REQUIRED' | '#IMPLIED'
      | (('#FIXED' S)? AttValue)
[10]      AttValue     ::=    '"' ([^<&"] | Reference)* '"'
                                |  "'" ([^<&'] | Reference)* "'"
ending char is the one before '>'
*/
SAXScanner.prototype.scanAttDef = function(eName) {
    if (this.reader.matchChar("%")) {
        this.includeParameterEntity();
        this.reader.skipWhiteSpaces();
    }
    var aName = this.scanName();
    this.reader.skipWhiteSpaces();
    var type = this.scanAttType();
    this.reader.skipWhiteSpaces();
    //DefaultDecl
    var mode = null;
    if (this.reader.equals("#")) {
        mode = this.reader.nextCharRegExp(new RegExp(WS_CHAR+"|>"));
        this.reader.skipWhiteSpaces();
    }
    var attValue = null;
    if (mode === null || mode === "#FIXED") {
        //attValue
        //here % is included and parsed
        if (this.reader.matchChar("%")) {
            this.includeParameterEntity();
            this.reader.skipWhiteSpaces();
        }
        if (this.reader.equals('"') || this.reader.equals("'")) {
            var quote = this.reader.next();
            attValue = this.reader.nextCharRegExp(new RegExp("[" + quote + "<]"));
            if (this.reader.equals("<")) {
                this.saxEvents.fatalError("invalid attribute value, must not contain &lt;", this);
            }
            //so current char is quote
            this.reader.nextChar();
        }
    }
    this.saxEvents.attributeDecl(eName, aName, type, mode, attValue);
};

/*
[54]    AttType    ::=     StringType | TokenizedType | EnumeratedType
[55]    StringType     ::=    'CDATA'
[56]    TokenizedType    ::=    'ID'  [VC: ID]
      | 'IDREF' [VC: IDREF]
      | 'IDREFS'  [VC: IDREF]
      | 'ENTITY'  [VC: Entity Name]
      | 'ENTITIES'  [VC: Entity Name]
      | 'NMTOKEN' [VC: Name Token]
      | 'NMTOKENS'  [VC: Name Token]
[57]    EnumeratedType     ::=     NotationType | Enumeration
[58]    NotationType     ::=    'NOTATION' S '(' S? Name (S? '|' S? Name)* S? ')'
[59]    Enumeration    ::=    '(' S? Nmtoken (S? '|' S? Nmtoken)* S? ')'
[7]                Nmtoken     ::=    (NameChar)+
*/
SAXScanner.prototype.scanAttType = function() {
    var type;
    //Enumeration
    if (this.reader.matchChar("(")) {
        this.reader.skipWhiteSpaces();
        type = this.reader.nextCharRegExp(NOT_START_OR_END_CHAR);
        //removes whitespaces between Nmtoken, does not support the invalidity of whitespaces inside names
        while (this.reader.peek().search(WS) !== -1) {
            this.reader.skipWhiteSpaces();
            type += this.reader.nextCharRegExp(NOT_START_OR_END_CHAR);
        }
        if (this.reader.unequals(")")) {
            this.saxEvents.error("Invalid character : [" + this.reader.peek() + "] in ATTLIST enumeration", this);
            type += this.reader.nextCharRegExp(WS);
        } else {
            this.reader.nextChar();
        }
        type = "(" + type + ")";
    //NotationType
    } else if (this.reader.matchStr("NOTATION")) {
        this.reader.skipWhiteSpaces();
        if (this.reader.matchChar("(")) {
            this.reader.skipWhiteSpaces();
            type = this.scanName();
            this.reader.skipWhiteSpaces();
            if (this.reader.unequals(")")) {
                this.saxEvents.error("Invalid character : [" + this.reader.peek() + "] in ATTLIST enumeration", this);
            }
            this.reader.nextChar();
        } else {
            this.saxEvents.error("Invalid NOTATION, must be followed by '('", this);
            this.reader.nextCharWhileNot(">");
            this.reader.nextChar(true);
        }
        type = "NOTATION (" + type + ")";
    // StringType | TokenizedType
    } else {
        var regexp = new RegExp("[" + WS_CHARS + "%]");
        type = this.reader.nextCharRegExp(regexp);
        //if found a "%" must replace it, EntityRef are not replaced here, but char ref are replaced
        while (this.reader.matchChar("%")) {
            this.includeParameterEntity();
            //does not skip WS here, may be significative of end of type
            type += this.reader.nextCharRegExp(regexp);
        }
        if (!/^CDATA$|^ID$|^IDREF$|^IDREFS$|^ENTITY$|^ENTITIES$|^NMTOKEN$|^NMTOKENS$/.test(type)) {
            this.saxEvents.error("Invalid type : [" + type + "] defined in ATTLIST", this);
        }
    }
    return type;
};

/*
[82]    NotationDecl     ::=    '<!NOTATION' S  Name  S (ExternalID | PublicID) S? '>'
[83]    PublicID     ::=    'PUBLIC' S  PubidLiteral
*/
SAXScanner.prototype.scanNotationDecl = function() {
    if (this.reader.matchStr("NOTATION")) {
        this.reader.skipWhiteSpaces();
        var name = this.scanName();
        this.reader.skipWhiteSpaces();
        var externalId = new ExternalId();
        // here there may be only PubidLiteral after PUBLIC so can not use directly scanExternalId
        if (this.reader.matchStr("PUBLIC")) {
            this.reader.skipWhiteSpaces();
            externalId.publicId = this.scanPubIdLiteral();
            this.reader.skipWhiteSpaces();
            if (this.reader.unequals(">")) {
                externalId.systemId = this.scanSystemLiteral();
                this.reader.skipWhiteSpaces();
            }
        } else {
            this.scanExternalId(externalId);
        }
        this.reader.nextChar(true);
        this.saxEvents.notationDecl(name, externalId.publicId, externalId.systemId);
        return true;
    }
    return false;
};

/*
if called from an element parsing defaultPrefix would be ""
if called from an attribute parsing defaultPrefix would be null

[39] element ::= EmptyElemTag | STag content ETag
[44] EmptyElemTag ::= '<' Name (S Attribute)* S? '/>'
[40] STag ::= '<' Name (S Attribute)* S? '>'
[41] Attribute ::= Name Eq AttValue
[10] AttValue ::= '"' ([^<&"] | Reference)* '"' | "'" ([^<&'] | Reference)* "'"
[67] Reference ::= EntityRef | CharRef
[68] EntityRef ::= '&' Name ';'
[66] CharRef ::= '&#' [0-9]+ ';' | '&#x' [0-9a-fA-F]+ ';'
[43] content ::= (element | CharData | Reference | CDSect | PI | Comment)*
[42] ETag ::= '</' Name S? '>'
[4]  NameChar ::= Letter | Digit | '.' | '-' | '_' | ':' | CombiningChar | Extender
[5]  Name ::= Letter | '_' | ':') (NameChar)*
*/
SAXScanner.prototype.scanQName = function(defaultPrefix) {
    var name = this.scanName();
    var localName = name;
    if (name.indexOf(":") !== -1) {
        var splitResult = name.split(":");
        defaultPrefix = splitResult[0];
        localName = splitResult[1];
    }
    this.reader.skipWhiteSpaces();
    return new Sax_QName(defaultPrefix, localName);
};

SAXScanner.prototype.scanElement = function() {
    var qName = this.scanQName("");
    this.elementsStack.push(qName.qName);
    var atts = this.scanAttributes(qName);
    var namespaceURI = null;
    try {
        namespaceURI = this.namespaceSupport.getURI(qName.prefix);
    } catch(e) {
        //should be a PrefixNotFoundException but not specified so no hypothesis
        this.saxEvents.error("namespace of element : [" + qName.qName + "] not found", this);
    }
    var selfClosed = false;
    if (this.reader.matchChar("/")) {
        if (this.reader.equals(">")) {
            selfClosed = true;
            this.elementsStack.pop();
            this.endMarkup(namespaceURI, qName);
        } else {
            this.saxEvents.fatalError("invalid empty markup, must finish with /&gt;", this);
        }
    }
    if (this.reader.unequals(">")) {
        this.saxEvents.fatalError("invalid element, must finish with &gt;", this);
    }
    this.reader.nextChar(true);
    this.saxEvents.startElement(namespaceURI, qName.localName, qName.qName, atts);
    if (selfClosed) {
        this.saxEvents.endElement(namespaceURI, qName.localName, qName.qName);
    }
    return true;
};

SAXScanner.prototype.scanAttributes = function(qName) {
    var atts = this.saxParser.getAttributesInstance();
    //namespaces declared at this step will be stored at one level of global this.namespaces
    this.namespaceSupport.pushContext();
    //same way, in all cases a baseUriAddition is recorded on each level
    var baseUriAddition = "";
    this.scanAttribute(qName, atts);
    //as namespaces are defined only after parsing all the attributes, adds the namespaceURI here
    var i = atts.getLength();
    while (i--) {
        var prefix = atts.getPrefix(i);
        var namespaceURI = null;
        try {
            namespaceURI = this.namespaceSupport.getURI(prefix);
        } catch(e) {
            this.saxEvents.error("namespace of attribute : [" + qName.qName + "] not found", this);
        }
        atts.setURI(i, namespaceURI);
        //handling special xml: attributes
        if (namespaceURI === NamespaceSupport.XMLNS) {
            switch (atts.getLocalName(i)) {
                case "base":
                    baseUriAddition = atts.getValue(i);
                    break;
                default:
                    break;
            }
        }
    }
    this.relativeBaseUris.push(baseUriAddition);
    return atts;
};

SAXScanner.prototype.scanAttribute = function(qName, atts) {
    this.reader.skipWhiteSpaces();
    if (this.reader.unequals(">") && this.reader.unequals("/")) {
        var attQName = this.scanQName(null);
        if (this.reader.matchChar("=")) {
            this.reader.skipWhiteSpaces();
            var value = this.scanAttValue();
            if (attQName.prefix === "xmlns") {
                this.namespaceSupport.declarePrefix(attQName.localName, value);
                this.saxEvents.startPrefixMapping(attQName.localName, value);
            } else if (attQName.qName === "xmlns") {
                this.namespaceSupport.declarePrefix("", value);
                this.saxEvents.startPrefixMapping("", value);
            } else {
                //check that an attribute with the same qName has not already been defined
                if (atts.getIndex(attQName.qName) !== -1) {
                    this.saxEvents.error("multiple declarations for same attribute : [" + attQName.qName + "]", this);
                } else {
                    //we do not know yet the namespace URI, added when all attributes have been parser, and the type which is added at augmentation by SAXParser
                    atts.addAttribute(undefined, attQName.localName, attQName.qName, undefined, value);
                }
            }
            this.scanAttribute(qName, atts);
        } else {
            this.saxEvents.fatalError("invalid attribute, must contain = between name and value", this);
        }
    }
};

// [10] AttValue ::= '"' ([^<&"] | Reference)* '"' | "'" ([^<&'] | Reference)* "'"
SAXScanner.prototype.scanAttValue = function() {
    var attValue, quote;
    if (this.reader.equals('"') || this.reader.equals("'")) {
        quote = this.reader.next();
        try {
            attValue = this.reader.nextCharRegExp(new RegExp("[" + quote + "<&\uFFFF]"));
            //depends on property
            if (this.saxEvents.attWhitespaceNormalize) {
                attValue = this.saxEvents.attWhitespaceNormalize(attValue);
            }
            //if found a "&"
            while (this.reader.matchChar("&")) {
                try {
                    //if character reference, dumped directly without normalization
                    var charRef = this.scanRef();
                    if (charRef) {
                        attValue += charRef;
                    }
                } catch (e2) {
                    if (e2 instanceof InternalEntityNotFoundException) {
                        this.saxEvents.error("entity reference : [" + e2.entityName + "] not declared, ignoring it", this);
                    } else if (e2 instanceof EntityNotReplacedException) {
                        attValue += "&" + e2.entityName + ";";
                    } else {
                        throw e2;
                    }
                }
                var attValueConcat = this.reader.nextCharRegExp(new RegExp("[" + quote + "<&]"));
                //depends on property
                if (this.saxEvents.attWhitespaceNormalize) {
                    attValueConcat = this.saxEvents.attWhitespaceNormalize(attValueConcat);
                }
                attValue += attValueConcat;
            }
            if (this.reader.equals("<")) {
                return this.saxEvents.fatalError("invalid attribute value, must not contain &lt;", this);
            }
            if (this.reader.equals('\uFFFF')) {
                return this.saxEvents.fatalError("invalid attribute value, must not contain U+FFFF", this);
            }
            //current char is ending quote
            this.reader.nextChar(true);
            if (/[^\/>"]/.test(this.reader.peek()) && this.reader.peek().search(WS) === -1) { // Extra double-quote and premature slash errors handled elsewhere
                this.saxEvents.fatalError("Whitespace is required between attribute-value pairs.", this);
            }
            this.reader.skipWhiteSpaces();
        //adding a message in that case
        } catch(e) {
            if (e instanceof EndOfInputException) {
                return this.saxEvents.fatalError("document incomplete, attribute value declaration must end with a quote", this);
            } else {
                throw e;
            }
        }
        return attValue;
    } else {
        return this.saxEvents.fatalError("invalid attribute value declaration, must begin with a quote", this);
    }
};

// [18]     CDSect     ::=     CDStart  CData  CDEnd
// [19]     CDStart    ::=    '<![CDATA['
// [20]     CData    ::=    (Char* - (Char* ']]>' Char*))
// [21]     CDEnd    ::=    ']]>'
/*
beginning char is <
ending char is > of ]]>
*/
SAXScanner.prototype.scanCData = function() {
    if (this.reader.matchStr("[CDATA[")) {
        this.saxEvents.startCDATA();
        var cdata = this.reader.nextCharWhileNot("]");
        while (!(this.reader.matchStr("]]>"))) {
            this.reader.nextChar(true);
            cdata += "]" + this.reader.nextCharWhileNot("]");
        }
        if (/\uFFFF/.test(cdata)) {
            this.saxEvents.fatalError("Character U+FFFF is not allowed within CDATA.", this);
        }
       //xmlconf/xmltest/valid/sa/116.xml test
        cdata = cdata.replace(/\r\n/g, "\n");
        this.saxEvents.characters(cdata, 0, cdata.length);
        this.saxEvents.endCDATA();
        return true;
    } else {
        return false;
    }
};

// [66] CharRef ::= '&#' [0-9]+ ';' | '&#x' [0-9a-fA-F]+ ';'
// current ch is char after "&#",  returned current char is after ";"
SAXScanner.prototype.scanCharRef = function() {
    var replacement, charCode = "";
    if (this.reader.matchChar("x")) {
        while (this.reader.unequals(";")) {
            var ch = this.reader.next();
            if (!/[0-9a-fA-F]/.test(ch)) {
                this.saxEvents.error("invalid char reference beginning with x, must contain alphanumeric characters only", this);
            } else {
                charCode += ch;
            }
        }
        this.reader.nextChar(true);
        replacement = String.fromCharCode("0x" + charCode);
        if (this.saxEvents.startCharacterReference) {
            this.saxEvents.startCharacterReference(true, charCode);
        }
    } else {
        while (this.reader.unequals(";")) {
            var ch = this.reader.next();
            if (!/\d/.test(ch)) {
                this.saxEvents.error("invalid char reference, must contain numeric characters only", this);
            } else {
                charCode += ch;
            }
        }
        this.reader.nextChar(true);
        replacement = String.fromCharCode(charCode);
        if (replacement.search(CHAR_REF_ESCAPED) !== -1) {
            replacement = charRefEscaped[replacement];
        }
        if (this.saxEvents.startCharacterReference) {
            this.saxEvents.startCharacterReference(false, charCode);
        }
    }
    return replacement;
};

/*
[68]  EntityRef ::= '&' Name ';'
may return undefined, has to be managed differently depending on
*/
SAXScanner.prototype.scanEntityRef = function() {
    try {
        var entityName = this.scanName();
        this.reader.skipWhiteSpaces();
        //current char must be ';'
        if (this.reader.unequals(";")) {
            this.saxEvents.error("entity : [" + entityName + "] contains an invalid character : [" + this.reader.peek() + "], or it is not ended by ;", this);
            return "";
        }
        this.reader.nextChar(true);
        this.saxEvents.startEntity(entityName);
        this.saxEvents.endEntity(entityName);
        // well-formed documents does not need to declare any of the following entities: amp, lt, gt, quot.
        if (entityName.search(NOT_REPLACED_ENTITIES) !== -1) {
            throw new EntityNotReplacedException(entityName);
        }
        //apos is replaced by '
        if (entityName.search(APOS_ENTITY) !== -1) {
            this.includeText("'");
        } else {
            var replacement = this.entities[entityName];
            if (replacement === undefined) {
                throw new InternalEntityNotFoundException(entityName);
            }
            this.includeEntity(entityName, replacement);
        }
    //adding a message in that case
    } catch(e) {
        if (e instanceof EndOfInputException) {
            return this.saxEvents.fatalError("document incomplete, entity reference must end with ;", this);
        } else {
            throw e;
        }
    }
};

// [42] ETag ::= '</' Name S? '>'
SAXScanner.prototype.scanEndingTag = function() {
    var qName = this.scanQName("");
    var namespaceURI = null;
    try {
        namespaceURI = this.namespaceSupport.getURI(qName.prefix);
    } catch(e) {
        this.saxEvents.error("namespace of ending tag : [" + qName.qName + "] not found", this);
    }
    var currentElement = this.elementsStack.pop();
    if (qName.qName === currentElement) {
        if (this.reader.matchChar(">")) {
            this.endMarkup(namespaceURI, qName);
            this.saxEvents.endElement(namespaceURI, qName.localName, qName.qName);
            return true;
        } else {
            return this.saxEvents.fatalError("invalid ending markup, does not finish with &gt;", this);
        }
    } else {
        //error recovery
        this.reader.matchChar(">");
        return this.saxEvents.fatalError("invalid ending markup : [" + qName.qName + "], markup name does not match current one : [" + currentElement + "]", this);
    }
};


SAXScanner.prototype.endMarkup = function(namespaceURI, qName) {
    var namespacesRemoved = this.namespaceSupport.popContext();
    for (var i in namespacesRemoved) {
        this.saxEvents.endPrefixMapping(i);
    }
    this.relativeBaseUris.pop();
};

/*
[4]     NameStartChar    ::=    ":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
[4a]    NameChar     ::=    NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
[5]     Name     ::=    NameStartChar (NameChar)*
*/
SAXScanner.prototype.scanName = function() {
    if (this.reader.peek().search(NOT_START_CHAR) !== -1) {
        this.saxEvents.fatalError("invalid starting character in Name : [" + this.reader.peek() + "]", this);
        return "";
    }
    return this.reader.nextCharRegExp(NOT_START_OR_END_CHAR);
};


this.SAXScanner = SAXScanner;
this.EndOfInputException = EndOfInputException;

}()); // end namespace


(function () { // Begin namespace

  /*
   int  getIndex(java.lang.String qName)
            Look up the index of an attribute by XML qualified (prefixed) name.
   int  getIndex(java.lang.String uri, java.lang.String localName)
            Look up the index of an attribute by Namespace name.
   int  getLength()
            Return the number of attributes in the list.
   java.lang.String   getLocalName(int index)
            Look up an attribute's local name by index.
   java.lang.String   getQName(int index)
            Look up an attribute's XML qualified (prefixed) name by index.
   java.lang.String   getType(int index)
            Look up an attribute's type by index.
   java.lang.String   getType(java.lang.String qName)
            Look up an attribute's type by XML qualified (prefixed) name.
   java.lang.String   getType(java.lang.String uri, java.lang.String localName)
            Look up an attribute's type by Namespace name.
   java.lang.String   getURI(int index)
            Look up an attribute's Namespace URI by index.
   java.lang.String   getValue(int index)
            Look up an attribute's value by index.
   java.lang.String   getValue(java.lang.String qName)
            Look up an attribute's value by XML qualified (prefixed) name.
   java.lang.String   getValue(java.lang.String uri, java.lang.String localName)
            Look up an attribute's value by Namespace name.
   */

  // Private helpers for AttributesImpl (private static treated as private instance below)
  function _getIndexByQName(qName) {
      var i = this.attsArray.length;
      while (i--) {
          if (this.attsArray[i].qName === qName) {
              return i;
          }
      }
      return -1;
  }
  function _getIndexByURI(uri, localName) {
      var i = this.attsArray.length;
      while (i--) {
          if (this.attsArray[i].namespaceURI === uri && this.attsArray[i].localName === localName) {
              return i;
          }
      }
      return -1;
  }
  function _getValueByIndex(index) {
      return this.attsArray[index] ? this.attsArray[index].value : null;
  }
  function _getValueByQName(qName) {
      var i = this.attsArray.length;
      while (i--) {
          if (this.attsArray[i].qName === qName) {
              return this.attsArray[i].value;
          }
      }
      return null;
  }
  function _getValueByURI(uri, localName) {
      var i = this.attsArray.length;
      while (i--) {
          if (this.attsArray[i].namespaceURI === uri && this.attsArray[i].localName === localName) {
              return this.attsArray[i].value;
          }
      }
      return null;
  }

  function _getPrefix(localName, qName) {
      var prefix = null;
      if (localName.length !== qName.length) {
          prefix = qName.split(":")[0];
      }
      return prefix;
  }

  function Sax_Attribute(namespaceURI, prefix, localName, qName, type, value) {
      this.namespaceURI = namespaceURI;
      //avoiding error, the empty prefix of attribute must be null
      if (prefix === undefined || prefix === "") {
          this.prefix = null;
      } else {
          this.prefix = prefix;
      }
      this.localName = localName;
      this.qName = qName;
      this.type = type;
      this.value = value;
  }

  // INCOMPLETE
  // http://www.saxproject.org/apidoc/org/xml/sax/helpers/AttributesImpl.html
  function AttributesImpl(atts) {
      this.attsArray = [];
      if (atts) {
          this.setAttributes(atts);
      }
  }
  AttributesImpl.prototype.toString = function() {
      return "AttributesImpl";
  };

  // INTERFACE: Attributes: http://www.saxproject.org/apidoc/org/xml/sax/Attributes.html
  AttributesImpl.prototype.getIndex = function(arg1, arg2) {
      if (arg2 === undefined) {
          return _getIndexByQName.call(this, arg1);
      } else {
          return _getIndexByURI.call(this, arg1, arg2);
      }
  };
  AttributesImpl.prototype.getLength = function() {
      return this.attsArray.length;
  };
  //in order not to parse qname several times, add that convenience method
  AttributesImpl.prototype.getPrefix = function(index) {
      return this.attsArray[index].prefix;
  };
  AttributesImpl.prototype.getLocalName = function(index) {
      return this.attsArray[index].localName;
  };
  AttributesImpl.prototype.getQName = function(index) {
      return this.attsArray[index].qName;
  };
  //not supported
  AttributesImpl.prototype.getType = function(arg1, arg2) { // Should allow 1-2 arguments of different types: idnex or qName or uri+localName
      // Besides CDATA (default when not supported), could return "ID", "IDREF", "IDREFS", "NMTOKEN", "NMTOKENS", "ENTITY", "ENTITIES", or "NOTATION" (always in upper case).
      // "For an enumerated attribute that is not a notation, the parser will report the type as 'NMTOKEN'."
      // If uri and localName passed, should return the "attribute type as a string, or null if the attribute is not in the list or if Namespace processing is not being performed."
      // If qName passed, should return the "attribute type as a string, or null if the attribute is not in the list or if qualified names are not available."
      var index;
      if (!arg2) {
          if (arg1) {
              //if it is an index, otherwise should return NaN
              index = parseInt(arg1, 10);
              //index may be 0
              if (!index && index !== 0) {
                  //then it is qName
                  index = _getIndexByQName.call(this, arg1);
              }
          }
      } else {
          index = _getIndexByURI.call(this, arg1, arg2);
      }
      if (index || index === 0) {
          var type = this.attsArray[index].type;
          if (type) {
              return type;
          }
      }
      return "CDATA";
  };
  AttributesImpl.prototype.getURI = function(index) {
      return this.attsArray[index].namespaceURI;
  };
  AttributesImpl.prototype.getValue = function(arg1, arg2) {
      if (arg2 === undefined) {
          if (typeof arg1 === "string") {
              return _getValueByQName.call(this, arg1);
          } else {
              return _getValueByIndex.call(this, arg1);
          }
      } else {
          return _getValueByURI.call(this, arg1, arg2);
      }
  };
  // Other AttributesImpl methods
  AttributesImpl.prototype.addAttribute = function (uri, localName, qName, type, value) {
      var prefix = _getPrefix.call(this, localName, qName);
      this.addPrefixedAttribute(uri, prefix, localName, qName, type, value);
  };
  AttributesImpl.prototype.clear = function () {
      this.attsArray = [];
  };
  AttributesImpl.prototype.removeAttribute = function (index) {
      this.attsArray.splice(index, 1);
  };

  AttributesImpl.prototype.addAttributeAtIndex = function (index, uri, localName, qName, type, value) {
      var prefix = _getPrefix.call(this, localName, qName);
      if (index > this.attsArray.length) {
          this.attsArray[index] = new Sax_Attribute(uri, prefix, localName, qName, type, value);
      } else {        
          this.attsArray.splice(index, 0, new Sax_Attribute(uri, prefix, localName, qName, type, value));
      }
  };

  AttributesImpl.prototype.setAttribute = function (index, uri, localName, qName, type, value) {
      this.setURI(index, uri);
      this.setLocalName(index, localName);
      this.setQName(index, qName);
      this.setType(index, type);
      this.setValue(index, value);
  };

  AttributesImpl.prototype.setAttributes = function (atts) {
      for (var i = 0 ; i < atts.getLength() ; i ++) {
          this.addPrefixedAttribute(atts.getURI(i), atts.getPrefix(i), atts.getLocalName(i), atts.getType(i), atts.getValue(i));
      }
  };

  AttributesImpl.prototype.setLocalName = function (index, localName) {
      this.attsArray[index].localName = localName;
  };
  AttributesImpl.prototype.setQName = function (index, qName) {
      var att = this.attsArray[index];
      att.qName = qName;
      if (qName.indexOf(":") !== -1) {
          var splitResult = qName.split(":");
          att.prefix = splitResult[0];
          att.localName = splitResult[1];
      } else {
          att.prefix = null;
          att.localName = qName;
      }
  };
  AttributesImpl.prototype.setType = function (index, type) {
      this.attsArray[index].type = type;
  };
  AttributesImpl.prototype.setURI = function (index, uri) {
      this.attsArray[index].namespaceURI = uri;
  };
  AttributesImpl.prototype.setValue = function (index, value) {
      this.attsArray[index].value = value;
  };
  // CUSTOM CONVENIENCE METHODS
  //in order not to parse qname several times
  AttributesImpl.prototype.addPrefixedAttribute = function (uri, prefix, localName, qName, type, value) {
      this.attsArray.push(new Sax_Attribute(uri, prefix, localName, qName, type, value));
  };

  /*
  Attributes2Impl()
            Construct a new, empty Attributes2Impl object.
  Attributes2Impl(Attributes atts)
            Copy an existing Attributes or Attributes2 object.
  */
  // http://www.saxproject.org/apidoc/org/xml/sax/ext/Attributes2Impl.html
  // When implemented, use this attribute class if this.features['http://xml.org/sax/features/use-attributes2'] is true
  function Attributes2Impl (atts) {
      AttributesImpl.call(this, atts);
      if (atts) {
          //by default, isDeclared is false and isSpecified is false
          for (var i = 0 ; i < atts.getLength() ; i ++) {
              this.setDeclared(atts.isDeclared(i));
              this.setSpecified(atts.isSpecified(i));
          }
      }
  }

  Attributes2Impl.prototype.toString = function() {
      return "Attributes2Impl";
  };

  Attributes2Impl.prototype = new AttributesImpl();

  // INTERFACE: Attributes2: http://www.saxproject.org/apidoc/org/xml/sax/ext/Attributes2.html
  /*
   boolean  isDeclared(int index)
            Returns false unless the attribute was declared in the DTD.
   boolean  isDeclared(java.lang.String qName)
            Returns false unless the attribute was declared in the DTD.
   boolean  isDeclared(java.lang.String uri, java.lang.String localName)
            Returns false unless the attribute was declared in the DTD.
   boolean  isSpecified(int index)
            Returns true unless the attribute value was provided by DTD defaulting.
   boolean  isSpecified(java.lang.String qName)
            Returns true unless the attribute value was provided by DTD defaulting.
   boolean  isSpecified(java.lang.String uri, java.lang.String localName)
            Returns true unless the attribute value was provided by DTD defaulting.
  */
  // Private helpers for Attributes2Impl (private static treated as private instance below)
  function _getIndex(arg1, arg2) {
      var index;
      if (arg2 === undefined) {
          if (typeof arg1 === "string") {
              index = _getIndexByQName.call(this, arg1);
          } else {
              index = arg1;
          }
      } else {
          index = _getIndexByURI.call(this, arg1, arg2);
      }
      return index;
  }

  Attributes2Impl.prototype.isDeclared = function (indexOrQNameOrURI, localName) {
      var index = _getIndex(indexOrQNameOrURI, localName);
      return this.attsArray[index].declared;
  };

  Attributes2Impl.prototype.isSpecified = function (indexOrQNameOrURI, localName) {
      var index = _getIndex(indexOrQNameOrURI, localName);
      return this.attsArray[index].specified;
  };

  // Other Attributes2Impl methods
  /*
   void   addAttribute(java.lang.String uri, java.lang.String localName, java.lang.String qName, java.lang.String type, java.lang.String value)
            Add an attribute to the end of the list, setting its "specified" flag to true.
  void  removeAttribute(int index)
            Remove an attribute from the list.
   void   setAttributes(Attributes atts)
            Copy an entire Attributes object.
   void   setDeclared(int index, boolean value)
            Assign a value to the "declared" flag of a specific attribute.
   void   setSpecified(int index, boolean value)
            Assign a value to the "specified" flag of a specific attribute.
   **/
  Attributes2Impl.prototype.addAttribute = function (uri, localName, qName, type, value) {
      var prefix = _getPrefix.call(this, localName, qName);
      this.addPrefixedAttribute(uri, prefix, localName, qName, type, value);
      //index of just added attribute is atts.getLength - 1
      var index = this.getLength() - 1;
      //by default declared is false, and specified is true
      this.setDeclared(index, false);
      this.setSpecified(index, true);
  };

  Attributes2Impl.prototype.setAttributes = function (atts) {
      
  };
  Attributes2Impl.prototype.setDeclared = function (index, value) {
      this.attsArray[index].declared = value;
  };
  Attributes2Impl.prototype.setSpecified = function (index, value) {
      this.attsArray[index].specified = value;
  };

  this.AttributesImpl = AttributesImpl;
  this.Attributes2Impl = Attributes2Impl;

  }()); // end namespace

/*global SAXNotSupportedException */
(function () { // Begin namespace

/* Supporting functions and exceptions */
/*
FIELDS
static java.lang.String   NSDECL
          The namespace declaration URI as a constant.
static java.lang.String   XMLNS
          The XML Namespace URI as a constant.

Method Summary
 boolean  declarePrefix(java.lang.String prefix, java.lang.String uri)
          Declare a Namespace prefix.
 java.util.Enumeration  getDeclaredPrefixes()
          Return an enumeration of all prefixes declared in this context.
 java.lang.String   getPrefix(java.lang.String uri)
          Return one of the prefixes mapped to a Namespace URI.
 java.util.Enumeration  getPrefixes()
          Return an enumeration of all prefixes whose declarations are active in the current context.
 java.util.Enumeration  getPrefixes(java.lang.String uri)
          Return an enumeration of all prefixes for a given URI whose declarations are active in the current context.
 java.lang.String   getURI(java.lang.String prefix)
          Look up a prefix and get the currently-mapped Namespace URI.
 boolean  isNamespaceDeclUris()
          Returns true if namespace declaration attributes are placed into a namespace.
 void   popContext()
          Revert to the previous Namespace context.
 java.lang.String[]   processName(java.lang.String qName, java.lang.String[] parts, boolean isAttribute)
          Process a raw XML qualified name, after all declarations in the current context have been handled by declarePrefix().
 void   pushContext()
          Start a new Namespace context.
 void   reset()
          Reset this Namespace support object for reuse.
 void   setNamespaceDeclUris(boolean value)
          Controls whether namespace declaration attributes are placed into the NSDECL namespace by processName().
 **/

// http://www.saxproject.org/apidoc/org/xml/sax/SAXException.html
function PrefixNotFoundException(prefix) { // java.lang.Exception
    this.prefix = prefix;
}
 
// Note: Try to adapt for internal use, as well as offer for external app
// http://www.saxproject.org/apidoc/org/xml/sax/helpers/NamespaceSupport.html
function NamespaceSupport () {
}

NamespaceSupport.prototype.declarePrefix = function (prefix, uri) {
    var namespacesOfThatLevel = this.namespaces[this.namespaces.length - 1];
    namespacesOfThatLevel[prefix] = uri;
};
NamespaceSupport.prototype.getDeclaredPrefixes = function () {
    var declaredPrefixes = [];
    var i = this.namespaces.length;
    while (i--) {
        for (var prefix in this.namespaces[i]) {
            declaredPrefixes.push(prefix);
        }
    }
    return declaredPrefixes;
};
NamespaceSupport.prototype.getPrefix = function (uri) {
    var i = this.namespaces.length;
    while (i--) {
        var namespacesOfThatLevel = this.namespaces[i];
        for (var prefix in namespacesOfThatLevel) {
            if (namespacesOfThatLevel[prefix] === uri) {
                return prefix;
            }
        }
    }
    return null;
};
NamespaceSupport.prototype.getPrefixes = function () {
    throw new SAXNotSupportedException("NamespaceSupport.getPrefixes()");
};
NamespaceSupport.prototype.getPrefixes = function (uri) {
    throw new SAXNotSupportedException("NamespaceSupport.getPrefixes(uri)");
};
NamespaceSupport.prototype.getURI = function (prefix) {
    // if attribute, prefix may be null, then namespaceURI is null
    if (prefix === null) {
        return null;
    }
    var i = this.namespaces.length;
    while (i--) {
        var namespaceURI = this.namespaces[i][prefix];
        if (namespaceURI) {
            return namespaceURI;
        }
    }
    //in case default namespace is not declared, prefix is "", namespaceURI is null
    if (!prefix) {
        return null;
    }
    throw new PrefixNotFoundException(prefix);
};

NamespaceSupport.prototype.isNamespaceDeclUris = function () {
    throw new SAXNotSupportedException("NamespaceSupport.isNamespaceDeclUris()");
};
NamespaceSupport.prototype.popContext = function () {
    return this.namespaces.pop();
};
NamespaceSupport.prototype.processName = function (qName, parts, isAttribute) {
    throw new SAXNotSupportedException("NamespaceSupport.processName(qName, parts, isAttribute)");
};
NamespaceSupport.prototype.pushContext = function () {
    var namespacesOfThatLevel = {};
    this.namespaces.push(namespacesOfThatLevel);
};
NamespaceSupport.prototype.reset = function () {
    /* for each depth, a map of namespaces */
    this.namespaces = [];
    var xmlNamespace = {};
    xmlNamespace.xml = NamespaceSupport.XMLNS;
    this.namespaces.push(xmlNamespace);
};
NamespaceSupport.prototype.setNamespaceDeclUris = function (value) {
    throw new SAXNotSupportedException("NamespaceSupport.setNamespaceDeclUris(value)");
};
NamespaceSupport.NSDECL = 'http://www.w3.org/xmlns/2000/'; // NS of xmlns, xmlns:html, etc.
NamespaceSupport.XMLNS = 'http://www.w3.org/XML/1998/namespace'; // e.g., NS for xml:lang, etc.

this.NamespaceSupport = NamespaceSupport;

}()); // end namespace

(function () { // Begin namespace

  /*
   XMLReader  getParent()
            Get the parent reader.
   void   setParent(XMLReader parent)
            Set the parent reader.
  */

  // http://www.saxproject.org/apidoc/org/xml/sax/helpers/XMLFilterImpl.html
  // Allows subclasses to override methods to filter input before reaching the parent's methods

  function _implements (obj, arr) {
      for (var i = 0; i < arr.length; i++) {
          if (typeof obj[arr[i]] !== 'function') {
              return false;
          }
      }
      return true;
  }

  function XMLFilterImpl (parent) {
      if (parent) {
          if (!_implements(parent,
              ['getContentHandler', 'getDTDHandler', 'getEntityResolver', 'getErrorHandler', 'getFeature', 'getProperty',
              'parse', 'setContentHandler', 'setDTDHandler', 'setEntityResolver', 'setErrorHandler', 'setFeature', 'setProperty'])) {
              throw 'XMLFilterImpl must be given a parent which implements XMLReader';
          }
          this.parent = parent;
      }
      // If there is no parent and it is not set subsequently by setParent(), this class can only be used for event consuming
  }

  XMLFilterImpl.prototype.toString = function () {
      return "XMLFilterImpl";
  };

  // INTERFACE: XMLFilter: http://www.saxproject.org/apidoc/org/xml/sax/XMLFilter.html
  XMLFilterImpl.prototype.setParent = function (parent) { // e.g., SAXParser
      this.parent = parent;
  };
  XMLFilterImpl.prototype.getParent = function () {
      return this.parent;
  };
  // INTERFACE: XMLReader: http://www.saxproject.org/apidoc/org/xml/sax/XMLReader.html
  XMLFilterImpl.prototype.getContentHandler = function () {
      return this.parent.getContentHandler.call(this.parent);
  };
  XMLFilterImpl.prototype.getDTDHandler = function () {
      return this.parent.getDTDHandler.call(this.parent);
  };
  XMLFilterImpl.prototype.getEntityResolver = function () {
      return this.parent.getEntityResolver.call(this.parent);
  };
  XMLFilterImpl.prototype.getErrorHandler = function () {
      return this.parent.getErrorHandler.call(this.parent);
  };
  XMLFilterImpl.prototype.getFeature = function (name) { // (java.lang.String)
      return this.parent.getFeature.call(this.parent, name);
  };
  XMLFilterImpl.prototype.getProperty = function (name) { // (java.lang.String)
      return this.parent.getProperty.call(this.parent, name);
  };
  XMLFilterImpl.prototype.parse = function (inputOrSystemId) { // (InputSource input OR java.lang.String systemId)
      return this.parent.parse.call(this.parent, inputOrSystemId);
  };
  XMLFilterImpl.prototype.setContentHandler = function (handler) { // (ContentHandler)
      return this.parent.setContentHandler.call(this.parent, handler);
  };
  XMLFilterImpl.prototype.setDTDHandler = function (handler) { // (DTDHandler)
      return this.parent.setDTDHandler.call(this.parent, handler);
  };
  XMLFilterImpl.prototype.setEntityResolver = function (resolver) { // (EntityResolver)
      return this.parent.setEntityResolver.call(this.parent, resolver);
  };
  XMLFilterImpl.prototype.setErrorHandler = function (handler) { // (ErrorHandler)
      return this.parent.setErrorHandler.call(this.parent, handler);
  };
  XMLFilterImpl.prototype.setFeature = function (name, value) { // (java.lang.String, boolean)
      return this.parent.setFeature.call(this.parent, name, value);
  };
  XMLFilterImpl.prototype.setProperty = function (name, value) { // (java.lang.String, java.lang.Object)
      return this.parent.setProperty.call(this.parent, name, value);
  };
  // END SAX2 XMLReader INTERFACE

  // INTERFACE: ContentHandler: http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
  XMLFilterImpl.prototype.startDocument = function() {
      return this.parent ? this.parent.contentHandler.startDocument.call(this.parent.contentHandler) : undefined;
  };

  XMLFilterImpl.prototype.startElement = function(namespaceURI, localName, qName, atts) {
      return this.parent ? this.parent.contentHandler.startElement.call(this.parent.contentHandler, namespaceURI, localName, qName, atts) : undefined;
  };

  XMLFilterImpl.prototype.endElement = function(namespaceURI, localName, qName) {
      return this.parent ? this.parent.contentHandler.endElement.call(this.parent.contentHandler, namespaceURI, localName, qName) : undefined;
  };

  XMLFilterImpl.prototype.startPrefixMapping = function(prefix, uri) {
      return this.parent ? this.parent.contentHandler.startPrefixMapping.call(this.parent.contentHandler, prefix, uri) : undefined;
  };

  XMLFilterImpl.prototype.endPrefixMapping = function(prefix) {
      return this.parent ? this.parent.contentHandler.endPrefixMapping.call(this.parent.contentHandler, prefix) : undefined;
  };

  XMLFilterImpl.prototype.processingInstruction = function(target, data) {
      return this.parent ? this.parent.contentHandler.processingInstruction.call(this.parent.contentHandler, target, data) : undefined;
  };

  XMLFilterImpl.prototype.ignorableWhitespace = function(ch, start, length) {
      return this.parent ? this.parent.contentHandler.ignorableWhitespace.call(this.parent.contentHandler, ch, start, length) : undefined;
  };

  XMLFilterImpl.prototype.characters = function(ch, start, length) {
      return this.parent ? this.parent.contentHandler.characters.call(this.parent.contentHandler, ch, start, length) : undefined;
  };

  XMLFilterImpl.prototype.skippedEntity = function(name) {
      return this.parent ? this.parent.contentHandler.skippedEntity.call(this.parent.contentHandler, name) : undefined;
  };

  XMLFilterImpl.prototype.endDocument = function() {
      return this.parent ? this.parent.contentHandler.endDocument.call(this.parent.contentHandler) : undefined;
  };

  XMLFilterImpl.prototype.setDocumentLocator = function (locator) {
      return this.parent ? this.parent.contentHandler.setDocumentLocator.call(this.parent.contentHandler, locator) : undefined;
  };
  // INTERFACE: EntityResolver: http://www.saxproject.org/apidoc/org/xml/sax/EntityResolver.html
  // Could implement this by checking for last two arguments missing in EntityResolver2 resolveEntity() below
  XMLFilterImpl.prototype.resolveEntity = function (publicId, systemId) {
      if (this.parent && this.parent.entityResolver) {
          return this.parent.entityResolver.resolveEntity.call(this.parent.entityResolver, publicId, systemId);
      }
      return undefined;
  };

  // INTERFACE: DTDHandler: http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
  XMLFilterImpl.prototype.notationDecl = function (name, publicId, systemId) {
      if (this.parent && this.parent.dtdHandler && this.parent.dtdHandler.notationDecl) {
          return this.parent.dtdHandler.notationDecl.call(this.parent.dtdHandler, name, publicId, systemId);
      }
      return undefined;
  };
  XMLFilterImpl.prototype.unparsedEntityDecl = function (name, publicId, systemId, notationName) {
      if (this.parent && this.parent.dtdHandler && this.parent.dtdHandler.unparsedEntityDecl) {
          return this.parent.dtdHandler.unparsedEntityDecl.call(this.parent.dtdHandler, name, publicId, systemId, notationName);
      }
      return undefined;
  };

  // INTERFACE: ErrorHandler: http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
  XMLFilterImpl.prototype.warning = function(saxParseException) {
      if (this.parent && this.parent.errorHandler) {
          return this.parent.errorHandler.warning.call(this.parent.errorHandler, saxParseException);
      }
      return undefined;
  };
  XMLFilterImpl.prototype.error = function(saxParseException) {
      if (this.parent && this.parent.errorHandler) {
          return this.parent.errorHandler.error.call(this.parent.errorHandler, saxParseException);
      }
      return undefined;
  };
  XMLFilterImpl.prototype.fatalError = function(saxParseException) {
      if (this.parent && this.parent.errorHandler) {
          return this.parent.errorHandler.fatalError.call(this.parent.errorHandler, saxParseException);
      }
      return undefined;
  };


  // BEGIN CUSTOM API (could make all but parseString() private)
  // The following is not really a part of XMLFilterImpl but we are effectively depending on it
  XMLFilterImpl.prototype.parseString = function(xml) {
      return this.parent.parseString.call(this.parent, xml);
  };


  // There is no XMLFilterImpl2 part of SAX2, but we add one to add the remaining interfaces covered in DefaultHandler2 but not
//    in XMLFilterImpl: DeclHandler, EntityResolver2, LexicalHandler

  function XMLFilterImpl2 (parent) {
      // If there is no parent and it is not set subsequently by setParent(), this class can only be used for event consuming
      return XMLFilterImpl.call(this, parent);
  }
  XMLFilterImpl2.prototype = new XMLFilterImpl();

  XMLFilterImpl2.prototype.toString = function () {
      return "XMLFilterImpl2";
  };

  // INTERFACE: DeclHandler: http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html

  XMLFilterImpl2.prototype.attributeDecl = function(eName, aName, type, mode, value) {
      if (this.parent && this.parent.declarationHandler && this.parent.declarationHandler.attributeDecl) {
          return this.parent.declarationHandler.attributeDecl.call(this.parent.declarationHandler, eName, aName, type, mode, value);
      }
      return undefined;
  };

  XMLFilterImpl2.prototype.elementDecl = function(name, model) {
      if (this.parent && this.parent.declarationHandler && this.parent.declarationHandler.elementDecl) {
          return this.parent.declarationHandler.elementDecl.call(this.parent.declarationHandler,  name, model);
      }
      return undefined;
  };

  XMLFilterImpl2.prototype.externalEntityDecl = function(name, publicId, systemId) {
      if (this.parent && this.parent.declarationHandler && this.parent.declarationHandler.externalEntityDecl) {
          return this.parent.declarationHandler.externalEntityDecl.call(this.parent.declarationHandler,  name, publicId, systemId);
      }
      return undefined;
  };

  XMLFilterImpl2.prototype.internalEntityDecl = function(name, value) {
      if (this.parent && this.parent.declarationHandler && this.parent.declarationHandler.internalEntityDecl) {
          return this.parent.declarationHandler.internalEntityDecl.call(this.parent.declarationHandler,  name, value);
      }
      return undefined;
  };

  // INTERFACE: LexicalHandler: http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html

  XMLFilterImpl2.prototype.comment = function(ch, start, length) {
      if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.comment) {
          return this.parent.lexicalHandler.comment.call(this.parent.lexicalHandler,  ch, start, length);
      }
      return undefined;
  };

  XMLFilterImpl2.prototype.endCDATA = function() {
      if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.endCDATA) {
          return this.parent.lexicalHandler.endCDATA.call(this.parent.lexicalHandler);
      }
      return undefined;
  };

  XMLFilterImpl2.prototype.endDTD = function() {
      if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.endDTD) {
          return this.parent.lexicalHandler.endDTD.call(this.parent.lexicalHandler);
      }
      return undefined;
  };

  XMLFilterImpl2.prototype.endEntity = function(name) {
      if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.endEntity) {
          return this.parent.lexicalHandler.endEntity.call(this.parent.lexicalHandler, name);
      }
      return undefined;
  };

  XMLFilterImpl2.prototype.startCDATA = function() {
      if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.startCDATA) {
          return this.parent.lexicalHandler.startCDATA.call(this.parent.lexicalHandler);
      }
      return undefined;
  };

  XMLFilterImpl2.prototype.startDTD = function(name, publicId, systemId) {
      if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.startDTD) {
          return this.parent.lexicalHandler.startDTD.call(this.parent.lexicalHandler, name, publicId, systemId);
      }
      return undefined;
  };

  XMLFilterImpl2.prototype.startEntity = function(name) {
      if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.startEntity) {
          return this.parent.lexicalHandler.startEntity.call(this.parent.lexicalHandler, name);
      }
      return undefined;
  };
  XMLFilterImpl2.prototype.startCharacterReference = function(hex, number) {
      if (this.parent && this.parent.lexicalHandler && this.parent.lexicalHandler.startCharacterReference) {
          return this.parent.lexicalHandler.startCharacterReference.call(this.parent.lexicalHandler, hex, number);
      }
      return undefined;
  };

  // INTERFACE: EntityResolver: http://www.saxproject.org/apidoc/org/xml/sax/EntityResolver.html
  // Could implement this by checking for last two arguments missing in EntityResolver2 resolveEntity() below
  // XMLFilterImpl2.prototype.resolveEntity = function (publicId, systemId) {};
  // INTERFACE: EntityResolver2: http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
  XMLFilterImpl2.prototype.resolveEntity = function(name, publicId, baseURI, systemId) {
      if (this.parent && this.parent.entityResolver && this.parent.entityResolver.resolveEntity) {
          return this.parent.entityResolver.resolveEntity.call(this.parent.entityResolver, name, publicId, baseURI, systemId);
      }
      return undefined;
  };
  XMLFilterImpl2.prototype.getExternalSubset = function(name, baseURI) {
      if (this.parent && this.parent.entityResolver && this.parent.entityResolver.getExternalSubset) {
          return this.parent.entityResolver.getExternalSubset.call(this.parent.entityResolver, name, baseURI);
      }
      return undefined;
  };

  // Could put on org.xml.sax.helpers.
  this.XMLFilterImpl = XMLFilterImpl;
  this.XMLFilterImpl2 = XMLFilterImpl2;

  }()); // end namespace

//http://java.sun.com/j2se/1.4.2/docs/api/java/io/Reader.html
//Note: Can't put into "java.io" namespace since "java" is reserved for LiveConnect
//Note: The class is not fully implemented
function Reader (lock) {
 if (lock) { // If this argument is passed, it should be an Object (critical sections will synchronize on the given object;
                      // otherwise will be on the Reader itself)
     this.lock = lock; // "lock" is a field of the class
 }
}
Reader.prototype.close = function () {
 throw 'The Reader close() method is abstract';
};
Reader.prototype.mark = function (readAheadLimit) { // int

};
Reader.prototype.markSupported = function () {

};
Reader.prototype.read = function (cbuf, off, len) { // (char[] (, int, int))
 if (arguments.length > 4 || arguments.length === 2) {
     throw "Reader's read() method expects 0, 1, or 3 arguments";
 }
 if (!cbuf) {
     
 }
 if (!off) {
     
 }
 throw 'The Reader read() method with 3 arguments (char[], int, and int) is abstract.';
};
Reader.prototype.ready = function () {

};
Reader.prototype.reset = function () {

};
Reader.prototype.skip = function (n) { // long

};

//http://java.sun.com/j2se/1.4.2/docs/api/java/io/StringReader.html
//Note: Can't put into "java.io" namespace since "java" is reserved for LiveConnect
//Note: The class is not fully implemented

function StringReader (s) { // String
 this.s = s; // Not part of the interface nor formally a part of the class
 this.nextIdx = 0;
 this.markIdx = 0;
 this.length = s.length;
}
StringReader.prototype = new Reader(); // Effectively overrides all methods, however (and lock field has to be redefined anyways)
StringReader.prototype.constructor = StringReader;
StringReader.prototype.close = function () {
};
StringReader.prototype.mark = function (readAheadLimit) { // int not supported for StringReader
 this.markIdx = this.nextIdx;
};
StringReader.prototype.markSupported = function () {
 return true;
};
StringReader.prototype.read = function (cbuf, off, len) { // (char[] (, int, int))
 if (arguments.length === 0) {
     if (this.nextIdx >= this.length) {
          throw new EndOfInputException();
     }
     var ch = this.s.charAt(this.nextIdx);
     this.nextIdx++;
     return ch;
 }
 if (arguments.length === 1) {
     cbuf = this.s.substr(this.nextIdx);
     this.nextIdx = this.length;
     return cbuf;
 }
 this.nextIdx += off;
 if (this.nextIdx >= this.length) {
     throw new EndOfInputException();
 }
 //do not throw endOfInputException here, it can be just a test
 cbuf = this.s.substr(this.nextIdx, len);
 this.nextIdx += len;
 return cbuf;
};
StringReader.prototype.ready = function () {
 return true;
};
StringReader.prototype.reset = function () {
 this.nextIdx = this.markIdx;
};
StringReader.prototype.skip = function (n) { // long
 this.nextIdx += n;
 return n;
};

/*global window, ReaderWrapper */
function ReaderWrapper(reader) {
    this.reader = reader;
    this.peeked = [];
}

/************ NOT USED BY SCANNER ********************/

ReaderWrapper.WS = new RegExp('[\\t\\n\\r ]');

ReaderWrapper.prototype.peekLen = function (len) {
    var peekedLen = this.peeked.length;
    if (len <= peekedLen) {
        return this.peeked.slice(-len).reverse().join("");
    }
    var returned = this.peeked.slice(0).reverse().join("");
    var lenToRead = len - peekedLen;
    //completes with read characters from reader
    var newRead = this.reader.read(returned, 0, lenToRead);
    returned += newRead;
    for (var i = 0; i < lenToRead; i++) {
        this.peeked.unshift(newRead.charAt(i));
    }
    return returned;
}

ReaderWrapper.prototype.skip = function (n) {
    for (var i = 0; this.peeked.length !== 0 && i < n; i++) {
        this.peeked.pop();
    }
    n -= i;
    if (n) {
        this.reader.skip(n);
    }
};


/************ USED BY SCANNER ********************/

/*
consumes first char of peeked array, or consumes next char of Reader
*/
ReaderWrapper.prototype.next = function () {
    if (this.peeked.length !== 0) {
         return this.peeked.pop();
    }
    return this.reader.read();
};


/*
read next char without consuming it
if peeked buffer is not empty take the first one
else take next char of Reader and keep it in peeked
*/
ReaderWrapper.prototype.peek = function () {
    var peekedLen = this.peeked.length;
    if (peekedLen !== 0) {
         return this.peeked[peekedLen - 1];
    }
    var returned = this.reader.read();
    this.peeked[0] = returned;
    return returned;
};

/*
if dontSkipWhiteSpace is not passed, then it is false so skipWhiteSpaces is default
if end of document, char is ''
*/
ReaderWrapper.prototype.nextChar = function(dontSkipWhiteSpace) {
    this.next();
    if (!dontSkipWhiteSpace) {
        this.skipWhiteSpaces();
    }
};

ReaderWrapper.prototype.skipWhiteSpaces = function() {
    while (this.peek().search(ReaderWrapper.WS) !== -1) {
        this.next();
    }
};

/*
ending char is the last matching the regexp
return consumed chars
*/
ReaderWrapper.prototype.nextCharRegExp = function(regExp, continuation) {
    var returned = "", currChar = this.peek();
    while (true) {
        if (currChar.search(regExp) !== -1) {
            if (continuation && currChar.search(continuation.pattern) !== -1) {
                var cb = continuation.cb.call(this);
                if (cb !== true) {
                    return cb;
                }
                returned += currChar;
                currChar = this.peek();
                continue;
            }
            return returned;
        } else {
            returned += currChar;
            //consumes actual char
            this.next();
            currChar = this.peek();
        }
    }
};

/*
same as above but with a char not a regexp and no continuation
best for performance
*/
ReaderWrapper.prototype.nextCharWhileNot = function(ch) {
    var returned = "", currChar = this.peek();
    while (currChar !== ch) {
        returned += currChar;
        this.next();
        currChar = this.peek();
    }
    return returned;
}

/*

*/
ReaderWrapper.prototype.matchRegExp = function(len, regExp, dontConsume) {
    var follow = this.peekLen(len);
    if (follow.search(regExp) === 0) {
        if (!dontConsume) {
            this.skip(len);
        }
        return true;
    }
    return false;
}

/*
*/
ReaderWrapper.prototype.matchStr = function(str) {
    var len = str.length;
    var follow = this.peekLen(len);
    if (follow === str) {
        this.skip(len);
        return true;
    }
    return false;
};

/*
if next char is ch
*/
ReaderWrapper.prototype.matchChar = function(ch) {
   if (this.equals(ch)) {
       this.next();
       return true;
   }
   return false;
}
/*
beginnnig before quote
ending after quote
*/
ReaderWrapper.prototype.quoteContent = function() {
    var quote = this.next();
    var content = this.nextCharWhileNot(quote);
    this.next();
    return content;
};

ReaderWrapper.prototype.equals = function(ch) {
      return ch === this.peek();
};

ReaderWrapper.prototype.unequals = function(ch) {
      return ch !== this.peek();
};

ReaderWrapper.prototype.unread = function (str) {
    var i = str.length;
    //http://www.scottlogic.co.uk/2010/10/javascript-array-performance/
    while (i--) {
        this.peeked[this.peeked.length] = str.charAt(i);
    }
};


/*global SAXParseException */
(function () { // Begin namespace
    

// Overridable handlers which ignore all parsing events (though see resolveEntity() and fatalError())

// http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
function DefaultHandler () {
    this.saxParseExceptions = [];
}
// INTERFACE: ContentHandler: http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
DefaultHandler.prototype.startDocument = function() {
};

DefaultHandler.prototype.startElement = function(namespaceURI, localName, qName, atts) {
};

DefaultHandler.prototype.endElement = function(namespaceURI, localName, qName) {
};

DefaultHandler.prototype.startPrefixMapping = function(prefix, uri) {
};

DefaultHandler.prototype.endPrefixMapping = function(prefix) {
};

DefaultHandler.prototype.processingInstruction = function(target, data) {
};

DefaultHandler.prototype.ignorableWhitespace = function(ch, start, length) {
};

DefaultHandler.prototype.characters = function(ch, start, length) {
};

DefaultHandler.prototype.skippedEntity = function(name) {
};

DefaultHandler.prototype.endDocument = function() {
};

DefaultHandler.prototype.setDocumentLocator = function (locator) {
    this.locator = locator;
};
// INTERFACE: EntityResolver: http://www.saxproject.org/apidoc/org/xml/sax/EntityResolver.html
// Could implement this by checking for last two arguments missing in EntityResolver2 resolveEntity() below
DefaultHandler.prototype.resolveEntity = function (publicId, systemId) {
    return null;
};

// INTERFACE: DTDHandler: http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
DefaultHandler.prototype.notationDecl = function (name, publicId, systemId) {
};
DefaultHandler.prototype.unparsedEntityDecl = function (name, publicId, systemId, notationName) {
};

// INTERFACE: ErrorHandler: http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
DefaultHandler.prototype.warning = function(saxParseException) {
    this.saxParseExceptions.push(saxParseException);
};
DefaultHandler.prototype.error = function(saxParseException) {
    this.saxParseExceptions.push(saxParseException);
};
DefaultHandler.prototype.fatalError = function(saxParseException) {
    throw saxParseException;
};


// http://www.saxproject.org/apidoc/org/xml/sax/ext/DefaultHandler2.html
function DefaultHandler2 () {
    DefaultHandler.call(this);
}
DefaultHandler2.prototype = new DefaultHandler();

// INTERFACE: DeclHandler: http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html

DefaultHandler2.prototype.attributeDecl = function(eName, aName, type, mode, value) {
};

DefaultHandler2.prototype.elementDecl = function(name, model) {
};

DefaultHandler2.prototype.externalEntityDecl = function(name, publicId, systemId) {
};

DefaultHandler2.prototype.internalEntityDecl = function(name, value) {
};

// INTERFACE: LexicalHandler: http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html

DefaultHandler2.prototype.comment = function(ch, start, length) {
};

DefaultHandler2.prototype.endCDATA = function() {
};

DefaultHandler2.prototype.endDTD = function() {
};

DefaultHandler2.prototype.endEntity = function(name) {
};

DefaultHandler2.prototype.startCDATA = function() {
};

DefaultHandler2.prototype.startDTD = function(name, publicId, systemId) {
};

DefaultHandler2.prototype.startEntity = function(name) {
};
// INTERFACE: EntityResolver: http://www.saxproject.org/apidoc/org/xml/sax/EntityResolver.html
// Could implement this by checking for last two arguments missing in EntityResolver2 resolveEntity() below
// DefaultHandler2.prototype.resolveEntity = function (publicId, systemId) {};
// INTERFACE: EntityResolver2: http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
DefaultHandler2.prototype.resolveEntity = function(name, publicId, baseURI, systemId) {
};
DefaultHandler2.prototype.getExternalSubset = function(name, baseURI) {
};



// Could put on org.xml.sax.helpers.
this.DefaultHandler = DefaultHandler;

// Could put on org.xml.sax.ext.
this.DefaultHandler2 = DefaultHandler2;

}()); // end namespace
