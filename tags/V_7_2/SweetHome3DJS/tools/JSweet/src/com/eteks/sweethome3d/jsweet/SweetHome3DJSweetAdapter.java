/*
 * SweetHome3DJSweetAdapter.java
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
package com.eteks.sweethome3d.jsweet;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.net.URL;
import java.text.Format;
import java.util.ArrayList;
import java.util.EventObject;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import javax.lang.model.element.Element;
import javax.lang.model.element.ElementKind;
import javax.lang.model.element.ExecutableElement;
import javax.lang.model.element.Modifier;
import javax.lang.model.element.QualifiedNameable;
import javax.lang.model.element.TypeElement;
import javax.lang.model.type.TypeMirror;

import org.jsweet.JSweetConfig;
import org.jsweet.transpiler.extension.AnnotationManager;
import org.jsweet.transpiler.extension.AnnotationManager.Action;
import org.jsweet.transpiler.extension.PrinterAdapter;
import org.jsweet.transpiler.model.AssignmentElement;
import org.jsweet.transpiler.model.CaseElement;
import org.jsweet.transpiler.model.ExtendedElement;
import org.jsweet.transpiler.model.IdentifierElement;
import org.jsweet.transpiler.model.LiteralElement;
import org.jsweet.transpiler.model.MethodInvocationElement;
import org.jsweet.transpiler.model.NewClassElement;
import org.jsweet.transpiler.model.VariableAccessElement;

/**
 * This adapter tunes the JavaScript generation for some SweetHome3D
 * specificities.
 *
 * @author Renaud Pawlak
 */
public class SweetHome3DJSweetAdapter extends PrinterAdapter {
  // A local type map to save mapping that can be handled in a generic way
  private Map<String, String> sh3dTypeMapping = new HashMap<>();

  public SweetHome3DJSweetAdapter(PrinterAdapter parent) {
    super(parent);
    // Types that are supported in core.js
    this.sh3dTypeMapping.put(IllegalArgumentException.class.getName(), "IllegalArgumentException");
    this.sh3dTypeMapping.put(IllegalStateException.class.getName(), "IllegalStateException");
    this.sh3dTypeMapping.put(InternalError.class.getName(), "InternalError");
    this.sh3dTypeMapping.put(NoSuchElementException.class.getName(), "NoSuchElementException");
    this.sh3dTypeMapping.put(NullPointerException.class.getName(), "NullPointerException");
    this.sh3dTypeMapping.put(UnsupportedOperationException.class.getName(), "UnsupportedOperationException");
    this.sh3dTypeMapping.put(PropertyChangeEvent.class.getName(), "PropertyChangeEvent");
    this.sh3dTypeMapping.put(EventObject.class.getName(), "EventObject");
    this.sh3dTypeMapping.put(PropertyChangeListener.class.getName(), "PropertyChangeListener");
    this.sh3dTypeMapping.put(PropertyChangeSupport.class.getName(), "PropertyChangeSupport");
    // We assume we have the big.js lib and we map BigDecimal to Big
    this.sh3dTypeMapping.put(BigDecimal.class.getName(), "Big");
    // Activate the local type map
    addTypeMappings(this.sh3dTypeMapping);
    // We don't have a specific implementation for ResourceURLContent in JS...
    // Use the default one
    addTypeMapping("com.eteks.sweethome3d.tools.ResourceURLContent", "URLContent");
    addTypeMapping(Format.class.getName(), "string");
    addTypeMapping(URL.class.getName(), "string");
    // Replace OutputStream by StringWriter
    addTypeMapping(OutputStream.class.getName(), "StringWriter");
    // All enums that are named *Property will be translated to string in JS
    addTypeMapping(
        (typeTree, name) -> typeTree.getTypeAsElement().getKind() == ElementKind.ENUM && name.endsWith("Property")
            ? "string"
            : null);

    // All the Java elements to be ignored (will generate no JS) except the ones
    // starting with !
    addAnnotation("jsweet.lang.Erased",
        "**.readObjectNoData(..)",
        "**.readObject(..)",
        "**.writeObject(..)",
        "**.serialVersionUID",
        "java.io.OutputStreamWriter",
        // Remove overloaded addPropertyChangeListener / removePropertyChangeListener methods to manage function listeners case
        "com.eteks.sweethome3d.model.HomeObject.addPropertyChangeListener(java.beans.PropertyChangeListener)",
        "com.eteks.sweethome3d.model.HomeObject.removePropertyChangeListener(java.beans.PropertyChangeListener)",
        // Remove overloaded addPropertyChangeListener / removePropertyChangeListener methods because only their form with a string propertyName is used
        "com.eteks.sweethome3d.model.Home.addPropertyChangeListener(com.eteks.sweethome3d.model.Home.Property,java.beans.PropertyChangeListener)",
        "com.eteks.sweethome3d.model.Home.removePropertyChangeListener(com.eteks.sweethome3d.model.Home.Property,java.beans.PropertyChangeListener)",
        "com.eteks.sweethome3d.model.HomeEnvironment.addPropertyChangeListener(com.eteks.sweethome3d.model.HomeEnvironment.Property,java.beans.PropertyChangeListener)",
        "com.eteks.sweethome3d.model.HomeEnvironment.removePropertyChangeListener(com.eteks.sweethome3d.model.HomeEnvironment.Property,java.beans.PropertyChangeListener)",
        // Unneeded methods of Compass
        "com.eteks.sweethome3d.model.Compass.updateSunLocation(..)",
        "com.eteks.sweethome3d.model.Compass.getSunAzimuth(..)",
        "com.eteks.sweethome3d.model.Compass.getSunElevation(..)",
        "com.eteks.sweethome3d.model.Content.openStream(..)",
        "com.eteks.sweethome3d.model.LengthUnit",
        "com.eteks.sweethome3d.model.UserPreferences",
        "com.eteks.sweethome3d.tools");

    addAnnotation("jsweet.lang.KeepUses",
        "com.eteks.sweethome3d.model.HomeObject.addPropertyChangeListener(java.beans.PropertyChangeListener)",
        "com.eteks.sweethome3d.model.HomeObject.removePropertyChangeListener(java.beans.PropertyChangeListener)",
        "com.eteks.sweethome3d.model.Home.addPropertyChangeListener(com.eteks.sweethome3d.model.Home.Property,java.beans.PropertyChangeListener)",
        "com.eteks.sweethome3d.model.Home.removePropertyChangeListener(com.eteks.sweethome3d.model.Home.Property,java.beans.PropertyChangeListener)",
        "com.eteks.sweethome3d.model.HomeEnvironment.addPropertyChangeListener(com.eteks.sweethome3d.model.HomeEnvironment.Property,java.beans.PropertyChangeListener)",
        "com.eteks.sweethome3d.model.HomeEnvironment.removePropertyChangeListener(com.eteks.sweethome3d.model.HomeEnvironment.Property,java.beans.PropertyChangeListener)");

    if ("SweetHome3DJSViewer".equals(System.getProperty("transpilationTarget"))) {
      // Only HomeController3D and its dependencies are needed for Sweet Home 3D viewer
      addAnnotation("jsweet.lang.Erased",
          "com.eteks.sweethome3d.model.HomeApplication",
          "com.eteks.sweethome3d.model.HomeRecorder",
          "com.eteks.sweethome3d.model.*Exception",
          "com.eteks.sweethome3d.viewcontroller.*",
          "!com.eteks.sweethome3d.viewcontroller.HomeController3D",
          "com.eteks.sweethome3d.viewcontroller.HomeController3D.modifyAttributes(..)",
          "com.eteks.sweethome3d.viewcontroller.HomeController3D.EditingCameraState.isEditingState()",
          "com.eteks.sweethome3d.viewcontroller.HomeController3D.EditingCameraState.pressMouse(..)",
          "com.eteks.sweethome3d.viewcontroller.HomeController3D.EditingCameraState.releaseMouse(..)",
          "com.eteks.sweethome3d.viewcontroller.HomeController3D.EditingCameraState.moveMouse(..)",
          "com.eteks.sweethome3d.viewcontroller.HomeController3D.EditingCameraState.escape()",
          "com.eteks.sweethome3d.viewcontroller.HomeController3D.EditingCameraState.toggleMagnetism(..)",
          "com.eteks.sweethome3d.viewcontroller.HomeController3D.EditingCameraState.setAlignmentActivated(..)",
          "com.eteks.sweethome3d.viewcontroller.HomeController3D.EditingCameraState.setDuplicationActivated(..)",
          "!com.eteks.sweethome3d.viewcontroller.Controller",
          "!com.eteks.sweethome3d.viewcontroller.View",
          // Support for reading homes at XML format,
          "com.eteks.sweethome3d.io.*",
          "!com.eteks.sweethome3d.io.HomeXMLHandler",
          "com.eteks.sweethome3d.io.HomeXMLHandler.contentContext",
          "com.eteks.sweethome3d.io.HomeXMLHandler.setContentContext(**)",
          "com.eteks.sweethome3d.io.HomeXMLHandler.isSameContent(**)");
    } else {
      addAnnotation("jsweet.lang.Erased",
          "com.eteks.sweethome3d.model.HomeRecorder.*(..)",
          "com.eteks.sweethome3d.viewcontroller.ExportableView.exportData(..)",
          "com.eteks.sweethome3d.viewcontroller.HelpController",
          // Support for reading and writing homes at XML format,
          "com.eteks.sweethome3d.io.*",
          "!com.eteks.sweethome3d.io.HomeXMLHandler",
          "com.eteks.sweethome3d.io.HomeXMLHandler.contentContext",
          "com.eteks.sweethome3d.io.HomeXMLHandler.setContentContext(**)",
          "com.eteks.sweethome3d.io.HomeXMLHandler.isSameContent(**)",
          "!com.eteks.sweethome3d.io.XMLWriter",
          "!com.eteks.sweethome3d.io.ObjectXMLExporter",
          "!com.eteks.sweethome3d.io.HomeXMLExporter",
          // Ignore damaged files management
          "com.eteks.sweethome3d.viewcontroller.HomeController.REPAIRED_*",
          "com.eteks.sweethome3d.viewcontroller.HomeController.*Damaged*(..)",
          "com.eteks.sweethome3d.viewcontroller.HomeController.*Invalid*(..)",
          "com.eteks.sweethome3d.viewcontroller.HomeController.getError*(..)",
          // Ignore updates management
          "com.eteks.sweethome3d.viewcontroller.HomeController.*Update*(..)",
          "com.eteks.sweethome3d.viewcontroller.HomeController.Update*",
          "com.eteks.sweethome3d.viewcontroller.HomeController.getPropertyValue(..)",
          "com.eteks.sweethome3d.viewcontroller.PrintPreviewController",
          "com.eteks.sweethome3d.viewcontroller.ThreadedTaskController",
          "com.eteks.sweethome3d.viewcontroller.UserPreferencesController.checkUpdates()",
          "com.eteks.sweethome3d.viewcontroller.UserPreferencesController.mayImportLanguageLibrary()",
          "com.eteks.sweethome3d.viewcontroller.UserPreferencesController.importLanguageLibrary()",
          "com.eteks.sweethome3d.viewcontroller.ViewFactory.createHelpView(..)",
          "com.eteks.sweethome3d.viewcontroller.ViewFactoryAdapter",
          // Ignore overridden property change support
          "com.eteks.sweethome3d.viewcontroller.BackgroundImageWizardController.propertyChangeSupport",
          "com.eteks.sweethome3d.viewcontroller.BackgroundImageWizardController.addPropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.BackgroundImageWizardController.removePropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.ImportedFurnitureWizardController.propertyChangeSupport",
          "com.eteks.sweethome3d.viewcontroller.ImportedFurnitureWizardController.addPropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.ImportedFurnitureWizardController.removePropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.ImportedTextureWizardController.propertyChangeSupport",
          "com.eteks.sweethome3d.viewcontroller.ImportedTextureWizardController.addPropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.ImportedTextureWizardController.removePropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.PhotoController.propertyChangeSupport",
          "com.eteks.sweethome3d.viewcontroller.PhotoController.addPropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.PhotoController.removePropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.PhotosController.propertyChangeSupport",
          "com.eteks.sweethome3d.viewcontroller.PhotosController.addPropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.PhotosController.removePropertyChangeListener(..)");
      addAnnotation("jsweet.lang.KeepUses",
          "com.eteks.sweethome3d.viewcontroller.BackgroundImageWizardController.addPropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.BackgroundImageWizardController.removePropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.ImportedFurnitureWizardController.addPropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.ImportedFurnitureWizardController.removePropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.ImportedTextureWizardController.addPropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.ImportedTextureWizardController.removePropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.PhotoController.addPropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.PhotoController.removePropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.PhotosController.addPropertyChangeListener(..)",
          "com.eteks.sweethome3d.viewcontroller.PhotosController.removePropertyChangeListener(..)");
    }

    // Ignore some Java elements with a programmatic adapter
    addAnnotationManager(new AnnotationManager() {
      @Override
      public Action manageAnnotation(Element element, String annotationType) {
        // Add the @Erased annotation upon some specific conditions
        if (JSweetConfig.ANNOTATION_ERASED.equals(annotationType)) {
          if (element.getKind() == ElementKind.ENUM && element.getSimpleName().toString().endsWith("Property")) {
            // All enums named *Property will be erased (because they will be strings in the generated code)
            return Action.ADD;
          } else if (util().isDeprecated(element)) {
            // All deprecated elements will be erased
            return Action.ADD;
          } else if (element.getKind() == ElementKind.CONSTRUCTOR && ((QualifiedNameable) element.getEnclosingElement())
              .getQualifiedName().toString().equals("com.eteks.sweethome3d.model.CatalogPieceOfFurniture")) {
            // Only keep the private constructor of CatalogPieceOfFurniture and the public
            // constructors used to create pieces available from version 5.3
            // (except the one with 18 parameters where backFaceShown boolean 12th parameter was replaced by modelFlags int parameter)
            ExecutableElement c = (ExecutableElement) element;
            if (!element.getModifiers().contains(Modifier.PRIVATE)) {
              if (c.getParameters().size() != 16
                  && c.getParameters().size() != 26
                  && c.getParameters().size() != 28
                  && c.getParameters().size() != 29
                  && c.getParameters().size() != 31
                  && (c.getParameters().size() != 18 || types().isSameType(c.getParameters().get(11).asType(), util().getType(boolean.class)))) {
                return Action.ADD;
              }
            }
            // Keep less constructors in CatalogLight and CatalogDoorOrWindow
          } else if (element.getKind() == ElementKind.CONSTRUCTOR && ((QualifiedNameable) element.getEnclosingElement())
              .getQualifiedName().toString().equals("com.eteks.sweethome3d.model.CatalogLight")) {
            // Only keep the public constructors of CatalogLight available from version 5.5
            // (CatalogLight class didn't exist in SweetHome3DJS 1.2)
            ExecutableElement c = (ExecutableElement) element;
            if (c.getParameters().size() != 29 && c.getParameters().size() != 30 && c.getParameters().size() != 31 && c.getParameters().size() != 33) {
              return Action.ADD;
            }
          } else if (element.getKind() == ElementKind.CONSTRUCTOR && ((QualifiedNameable) element.getEnclosingElement())
              .getQualifiedName().toString().equals("com.eteks.sweethome3d.model.CatalogDoorOrWindow")) {
            // Only keep the public constructors of CatalogDoorOrWindow used to create unmodifiable pieces
            // (CatalogDoorOrWindow class didn't exist in SweetHome3DJS 1.2)
            ExecutableElement c = (ExecutableElement) element;
            if (c.getParameters().size() != 18 && c.getParameters().size() != 32 && c.getParameters().size() != 33 && c.getParameters().size() != 35) {
              return Action.ADD;
            }
          } else if ("SweetHome3DJSViewer".equals(System.getProperty("transpilationTarget"))
              && element.getKind() == ElementKind.CONSTRUCTOR && ((QualifiedNameable) element.getEnclosingElement())
                    .getQualifiedName().toString().equals("com.eteks.sweethome3d.viewcontroller.HomeController3D")) {
            // Only keep the public constructor of HomeController3D which doesn't use PlanController parameter
            ExecutableElement c = (ExecutableElement) element;
            if (c.getParameters().size() == 6) {
              return Action.ADD;
            }
          }
        }
        return Action.VOID;
      }

    });

    // Erase com.eteks.sweethome3d packages to keep all their elements at top level
    // in JavaScript
    addAnnotation("@Root",
        "com.eteks.sweethome3d.model",
        "com.eteks.sweethome3d.io",
        "com.eteks.sweethome3d.viewcontroller",
        "com.eteks.sweethome3d.j3d");

    // Replace some Java implementations with some JavaScript-specific implementations

    // Manage content without contentContext
    addAnnotation(
        "@Replace('var contentFile = attributes[attributeName];"
        + "        if (contentFile === undefined) { "
        + "          return null;"
        + "        } else if (contentFile.indexOf('://') >= 0) {"
        + "          return URLContent.fromURL(contentFile);"
        + "        } else { "
        + "          return new HomeURLContent('jar:' + this['homeUrl'] + '!/' + contentFile); "
        + "        }')",
        "com.eteks.sweethome3d.io.HomeXMLHandler.parseContent(..)");
    // Store home structure if set in the XML file
    addAnnotation(
        "@Replace('{{ body }}{{ baseIndent }}"
        + "        if (attributes['structure']) { "
        + "          home['structure'] = this.parseContent(this.homeElementName, attributes, 'structure'); "
        + "        }')",
        "com.eteks.sweethome3d.io.HomeXMLHandler.setHomeAttributes(..)");
    // WARNING: this constructor delegates to an erased constructor, so we need to replace its implementation
    addAnnotation(
        "@Replace('this.preferences = preferences;"
        + "        this.viewFactory = viewFactory;"
        + "        this.propertyChangeSupport = new PropertyChangeSupport(this);"
        + "        this.updateProperties();')",
        "com.eteks.sweethome3d.viewcontroller.UserPreferencesController.UserPreferencesController(*,*,*)");
    // Initialize out field in XMLWriter
    addAnnotation(
        "@Replace('this.out = out;"
        + "        this.out.write(\"<?xml version='1.0'?>\\n\");')",
        "com.eteks.sweethome3d.io.XMLWriter.XMLWriter(..)");
    // Manage content without savedContentNames
    addAnnotation(
        "@Replace('if (content == null) {"
        + "          return null;"
        + "        } else if (this.savedContentNames != null) {"
        + "          var contentName = this.savedContentNames[(content as URLContent).getURL()];"
        + "          if (contentName != null) {"
        + "            return contentName;"
        + "          }"
        + "        }"
        + "        return (content as URLContent).getURL();')",
        "com.eteks.sweethome3d.io.HomeXMLExporter.getExportedContentName(..)");

    // Force some interface to be mapped as functional types when possible
    addAnnotation(FunctionalInterface.class, "com.eteks.sweethome3d.model.CollectionListener",
        "com.eteks.sweethome3d.model.LocationAndSizeChangeListener");
  }

  @Override
  public boolean substituteNewClass(NewClassElement newClass) {
    String className = newClass.getTypeAsElement().toString();
    // Handle generically all types that are locally mapped
    if (this.sh3dTypeMapping.containsKey(className)) {
      print("new ").print(this.sh3dTypeMapping.get(className)).print("(").printArgList(newClass.getArguments())
          .print(")");
      return true;
    }
    switch (className) {
      // This is a hack until we have actual locale support (just create JS Date objects)
      case "java.util.GregorianCalendar":
        if (newClass.getArguments().size() == 1) {
          if (newClass.getArguments().get(0) instanceof LiteralElement) {
            Object value = ((LiteralElement) newClass.getArguments().get(0)).getValue();
            if (!(value instanceof String && "UTC".equals(value))) {
              // This will use the user's locale
              print("new Date()");
              return true;
            }
          } else {
            // This will use the user's locale
            print("new Date()");
            return true;
          }
        }
      case "java.awt.BasicStroke":
        // Hack to access java.awt.BasicStroke class available in stroke.min.js
        print("new java['awt']['BasicStroke'](").printArgList(newClass.getArguments()).print(")");
        return true;
    }
    return super.substituteNewClass(newClass);
  }

  @Override
  public boolean substituteMethodInvocation(MethodInvocationElement invocation) {
    if (invocation.getTargetExpression() != null) {
      Element targetType = invocation.getTargetExpression().getTypeAsElement();
      switch (targetType.toString()) {
        // Override invocations to LengthUnit so that it is not handled as a
        // complex enum and use the JS implementation instead
        case "com.eteks.sweethome3d.model.LengthUnit":
          print(invocation.getTargetExpression()).print(".").print(invocation.getMethodName()).print("(")
              .printArgList(invocation.getArguments()).print(")");
          return true;
        case "com.eteks.sweethome3d.model.TextStyle.Alignment":
          switch (invocation.getMethodName()) {
            case "hashCode":
              print("0");
              return true;
          }
          break;
        case "java.text.Collator":
          switch (invocation.getMethodName()) {
            case "setStrength":
              printMacroName(invocation.getMethodName());
              // Erase setStrength completely
              print(invocation.getTargetExpression());
              return true;
          }
          break;
        case "java.util.Arrays":
          switch (invocation.getMethodName()) {
          // WARNING: we assume that this method will be used to log arrays so we just pass the array as is
          // to the log function... this may fail if a string is actually expected
          case "deepToString":
            printMacroName(invocation.getMethodName());
            print(invocation.getArgument(0));
            return true;
          case "deepHashCode":
            printMacroName(invocation.getMethodName());
            print("(function(array) { "
                + "function deepHashCode(array) {"
                + "  if (array == null) return 0;"
                + "  var hashCode = 1;"
                + "  for (var i = 0; i < array.length; i++) { "
                + "    var elementHashCode = 1;"
                + "    if (Array.isArray(array[i])) elementHashCode = deepHashCode(array[i]);"
                + "    else if (typeof array[i] == 'number') elementHashCode = (array[i] * 1000) | 0;"
                + "    hashCode = 31 * hashCode + elementHashCode;"
                + "  }"
                + "  return hashCode;"
                + "}"
                + "return deepHashCode;"
                + "})(").print(invocation.getArgument(0)).print(")");
            return true;
          }
          break;
        case "java.util.Collections":
          switch (invocation.getMethodName()) {
            case "synchronizedMap":
            case "synchronizedList":
              printArgList(invocation.getArguments());
              return true;
          }
          break;
        case "java.util.Map":
          switch (invocation.getMethodName()) {
            case "putAll":
              printMacroName(invocation.getMethodName());
              print("(function (m, n) {"
                  + "for (var i in n)"
                  + "  m [i] = n [i];"
                  + "})(").print(invocation.getTargetExpression()).print(",").printArgList(invocation.getArguments()).print(")");
              return true;
          }
          break;
        case "java.util.TreeMap":
          switch (invocation.getMethodName()) {
            case "lastKey":
              printMacroName(invocation.getMethodName());
              print("(function(map) {"
                  + "  return map.entries[map.entries.length - 1].key;"
                  + "})(").print(invocation.getTargetExpression()).print(")");
              return true;
            case "put":
              printMacroName(invocation.getMethodName());
              print("(function (m, k, v) {"
                  + "if (m.entries == null) m.entries = [];"
                  + "for (var i = 0; i < m.entries.length; i++)"
                  + "  if (m.entries[i].key.equals != null"
                  + "        && m.entries[i].key.equals(k)"
                  + "      || m.entries[i].key === k) {"
                  + "     var pv = m.entries[i].value;"
                  + "     m.entries[i].value = v;"
                  + "     return pv;"
                  + "   }"
                  + "m.entries.push({ key: k, value: v, getKey: function () { return this.key; }, getValue: function () { return this.value; } });"
                  + "m.entries.sort(function(e1, e2) { return (e1.key.compareTo != null) ? e1.key.compareTo(e2) : (e1.key - e2.key); });"
                  + "return null;"
                  + "})(").print(invocation.getTargetExpression()).print(",").printArgList(invocation.getArguments()).print(")");
              return true;
          }
          break;
        case "java.util.UUID":
          switch (invocation.getMethodName()) {
            case "randomUUID":
              print("UUID.randomUUID()");
              return true;
          }
          break;
        case "java.math.BigDecimal":
          // Support for Java big decimal (method are mapped to their Big.js equivalent)
          switch (invocation.getMethodName()) {
            case "multiply":
              printMacroName(invocation.getMethodName());
              print(invocation.getTargetExpression()).print(".times(").printArgList(invocation.getArguments()).print(")");
              return true;
            case "add":
              printMacroName(invocation.getMethodName());
              print(invocation.getTargetExpression()).print(".plus(").printArgList(invocation.getArguments()).print(")");
              return true;
            case "subtract":
              printMacroName(invocation.getMethodName());
              print(invocation.getTargetExpression()).print(".minus(").printArgList(invocation.getArguments()).print(")");
              return true;
            case "scale":
              printMacroName(invocation.getMethodName());
              // Always have a scale of 2 (we only have currencies, so 2 is a standard)
              print("2");
              return true;
            case "setScale":
              printMacroName(invocation.getMethodName());
              print(invocation.getTargetExpression()).print(".round(").print(invocation.getArguments().get(0)).print(")");
              return true;
            case "compareTo":
              printMacroName(invocation.getMethodName());
              print(invocation.getTargetExpression()).print(".cmp(").print(invocation.getArguments().get(0)).print(")");
              return true;
            case "equals":
              printMacroName(invocation.getMethodName());
              // Big.eq doesn't accept null parameter
              print("((").print(invocation.getArguments().get(0)).print(") != null ? ")
                  .print(invocation.getTargetExpression()).print(".eq(").print(invocation.getArguments().get(0)).print(") : (")
                  .print(invocation.getTargetExpression()).print(" === (").print(invocation.getArguments().get(0)).print(")))");
              return true;
          }
          break;
        case "java.lang.String":
          switch (invocation.getMethodName()) {
            case "split":
              // Split is supposed to take a regular expression as parameter
              String regex = invocation.getArgument(0).toString().replaceAll("\\\\s", "\\s").replaceAll("\\\\p", "\\p");
              print(invocation.getTargetExpression()).print(".").print(invocation.getMethodName()).print("(/")
                  .print(regex.substring(1, regex.length() - 1)).print("/)");
              return true;
          }
          break;
        case "java.lang.Class":
          switch (invocation.getMethodName()) {
            case "getResource":
              printMacroName(invocation.getMethodName());
              print(invocation.getArgument(0));
              return true;
          }
          break;
        case "java.util.Currency":
          switch (invocation.getMethodName()) {
            case "getDefaultFractionDigits":
              if (invocation.getTargetExpression() instanceof MethodInvocationElement) {
                if ("getInstance".equals(
                    ((MethodInvocationElement) invocation.getTargetExpression()).getMethod().getSimpleName().toString())) {
                  printMacroName(invocation.getMethodName());
                  print("(['JPY','VND'].indexOf(");
                  print(((MethodInvocationElement) invocation.getTargetExpression()).getArgument(0));
                  print(") >= 0 ? 0 : 2)");
                  return true;
                }
              }
          }
          break;
        case "java.text.DateFormat":
          switch (invocation.getMethodName()) {
            case "getDateTimeInstance":
              print("toLocaleDateString(this.preferences.getLanguage().replace('_', '-'))");
              return true;
            case "format":
              print("new Date().").print(invocation.getTargetExpression());
              return true;
          }
          break;
        case "java.lang.System":
          switch (invocation.getMethodName()) {
            case "getProperty":
              if (invocation.getArgument(0).toString().equals("\"com.eteks.sweethome3d.deploymentInformation\"")) {
                print("'JS'");
                return true;
              }
          }
          break;
      }

      // Map model Property enums to strings
      if (targetType.getKind() == ElementKind.ENUM && targetType.toString().endsWith("Property")) {
        switch (invocation.getMethodName()) {
          case "name":
            printMacroName(invocation.getMethodName());
            print(invocation.getTargetExpression());
            return true;
          case "valueOf":
            printMacroName(invocation.getMethodName());
            print(invocation.getArgument(0));
            return true;
          case "equals":
            printMacroName(invocation.getMethodName());
            print("(").print(invocation.getTargetExpression()).print(" == ").print(invocation.getArguments().get(0))
                .print(")");
            return true;
        }
      }
      // Special case for the AspectRatio enum
      if (targetType.toString().endsWith(".AspectRatio") && invocation.getMethodName().equals("getValue")) {
        print("{FREE_RATIO:null,VIEW_3D_RATIO:null,RATIO_4_3:4/3,RATIO_3_2:1.5,RATIO_16_9:16/9,RATIO_2_1:2/1,SQUARE_RATIO:1}[")
            .print(invocation.getTargetExpression()).print("]");
        return true;
      }
    }

    // Provide a partial default simple JavaScript implementation for String.format
    if (invocation.getMethodName().equals("format")
        && String.class.getName().equals(invocation.getTargetExpression().getTypeAsElement().toString())) {
      print("CoreTools.format(").printArgList(invocation.getArguments()).print(")");
      return true;
    }

    boolean substituted = super.substituteMethodInvocation(invocation);
    if (!substituted) {
      // support for equals in case not supported by existing adapters
      if (invocation.getMethodName().equals("equals")) {
        print("((o:any, o2) => { return o.equals?o.equals(o2):o===o2 })(").print(invocation.getTargetExpression())
            .print(",").print(invocation.getArguments().get(0)).print(")");
        return true;
      }
    }
    return substituted;
  }

  @Override
  public boolean substituteVariableAccess(VariableAccessElement variableAccess) {
    switch (variableAccess.getTargetElement().toString()) {
      case "java.text.Collator":
        switch (variableAccess.getVariableName()) {
          case "CANONICAL_DECOMPOSITION":
          case "FULL_DECOMPOSITION":
          case "IDENTICAL":
          case "NO_DECOMPOSITION":
          case "PRIMARY":
          case "SECONDARY":
          case "TERTIARY":
            print("undefined");
            return true;
        }
        break;
      case "com.eteks.sweethome3d.viewcontroller.BackgroundImageWizardController":
      case "com.eteks.sweethome3d.viewcontroller.ImportedFurnitureWizardController":
      case "com.eteks.sweethome3d.viewcontroller.ImportedTextureWizardController":
      case "com.eteks.sweethome3d.viewcontroller.PhotoController":
      case "com.eteks.sweethome3d.viewcontroller.PhotosController":
        // Reuse propertyChangeSupport field defined in super class
        if ("propertyChangeSupport".equals(variableAccess.getVariableName())) {
          print(variableAccess.getTargetExpression()).print(".propertyChangeSupport");
          return true;
        }
        break;
    }
    // Map *Property enums to strings
    if (variableAccess.getTargetElement().getKind() == ElementKind.ENUM
        && variableAccess.getTargetElement().toString().endsWith("Property")) {
      print("\"" + variableAccess.getVariableName() + "\"");
      return true;
    }
    return super.substituteVariableAccess(variableAccess);
  }

  @Override
  public boolean substituteAssignment(AssignmentElement assignment) {
    if (assignment.getTypeAsElement().getSimpleName().toString().equals("PropertyChangeSupport")) {
      switch (assignment.getTarget().getTargetElement().toString()) {
        case "com.eteks.sweethome3d.viewcontroller.BackgroundImageWizardController":
        case "com.eteks.sweethome3d.viewcontroller.ImportedFurnitureWizardController":
        case "com.eteks.sweethome3d.viewcontroller.ImportedTextureWizardController":
        case "com.eteks.sweethome3d.viewcontroller.PhotoController":
        case "com.eteks.sweethome3d.viewcontroller.PhotosController":
          // Ignore propertyChangeSupport field defined in sub class
          if ("propertyChangeSupport".equals(assignment.getTarget().getVariableName())) {
            print("/* Use propertyChangeSupport defined in super class */");
            return true;
          }
          break;
      }
    }
    return super.substituteAssignment(assignment);
  }

  @Override
  public boolean substituteExecutable(ExecutableElement executable) {
    if (executable.getEnclosingElement().toString().equals("com.eteks.sweethome3d.viewcontroller.HomeController")) {
      switch(executable.getSimpleName().toString()) {
        case "newHomeFromExample":
        case "open":
        case "close":
          if (executable.getParameters().size() > 0) {
            return true;
          }
        case "save":
        case "saveAs":
          if (!executable.getModifiers().contains(Modifier.PUBLIC)) {
            return true;
          }
        case "saveAndCompress":
        case "saveAsAndCompress":
        case "exportToCSV":
        case "exportToSVG":
        case "exportToOBJ":
        case "createPhotos":
        case "createPhoto":
        case "createVideo":
        case "setupPage":
        case "previewPrint":
        case "print":
        case "printToPDF":
        case "help":
          // Implements main I/O HomeController methods with empty code
          print("public ").print(executable.getSimpleName().toString()).print("(");
          print(")\n    {\n    }\n");
          return true;
      }
    }

    // Replace overloaded addPropertyChangeListener / removePropertyChangeListener
    // methods to ignore PropertyChangeListener type when listener is a function
    if (executable.getSimpleName().toString().equals("addPropertyChangeListener")
        && !hasAnnotationType(executable, JSweetConfig.ANNOTATION_ERASED)
        && executable.getEnclosingElement().toString().equals("com.eteks.sweethome3d.model.HomeObject")) {
      print("public addPropertyChangeListener(propertyName: any, listener?: any) {");
      print("  if (this.propertyChangeSupport == null) {"
          + "    this.propertyChangeSupport = new PropertyChangeSupport(this);"
          + "  }"
          + "  if (listener === undefined) {"
          + "    this.propertyChangeSupport.addPropertyChangeListener(propertyName);"
          + "  } else {"
          + "    this.propertyChangeSupport.addPropertyChangeListener(propertyName, listener);"
          + "  }");
      print("}");
      return true;
    }
    if (executable.getSimpleName().toString().equals("removePropertyChangeListener")
        && !hasAnnotationType(executable, JSweetConfig.ANNOTATION_ERASED)
        && executable.getEnclosingElement().toString().equals("com.eteks.sweethome3d.model.HomeObject")) {
      print("public removePropertyChangeListener(propertyName: any, listener?: any) {");
      print("  if (this.propertyChangeSupport != null) {"
          + "    if (listener === undefined) {"
          + "      this.propertyChangeSupport.removePropertyChangeListener(<any>propertyName);"
          + "    } else {"
          + "      this.propertyChangeSupport.removePropertyChangeListener(propertyName, listener);"
          + "    }"
          + "    if (this.propertyChangeSupport.getPropertyChangeListeners().length === 0) {"
          + "      this.propertyChangeSupport = null;"
          + "    }"
          + "  }");
      print("}");
      return true;
    }

    return super.substituteExecutable(executable);
  }

  @Override
  public boolean substituteIdentifier(IdentifierElement identifier) {
    // Map *Property enums to strings
    if (identifier.getTypeAsElement().getKind() == ElementKind.ENUM && identifier.isConstant()
        && identifier.getTypeAsElement().getSimpleName().toString().endsWith("Property")) {
      print("\"" + identifier + "\"");
      return true;
    }
    return super.substituteIdentifier(identifier);
  }

  @Override
  public boolean substituteCaseStatementPattern(CaseElement caseStatement, ExtendedElement pattern) {
    // Map *Property enums to strings
    if (pattern.getTypeAsElement().getKind() == ElementKind.ENUM
        && pattern.getTypeAsElement().getSimpleName().toString().endsWith("Property")) {
      print("\"" + pattern + "\"");
      return true;
    }
    return super.substituteCaseStatementPattern(caseStatement, pattern);
  }

  @Override
  public String adaptDocComment(Element element, String commentText) {
    String comment = super.adaptDocComment(element, commentText);
    if (comment == null) {
      return comment;
    }
    String[] lines = comment.split("\n");
    StringBuilder newComment = new StringBuilder();
    boolean firstParam = true;
    for (String line : lines) {
      if (element.getKind() == ElementKind.CLASS && ((QualifiedNameable) element).getQualifiedName().toString()
          .equals("com.eteks.sweethome3d.model.CatalogPieceOfFurniture") && line.contains("@param") && firstParam) {
        // Add extra information to CatalogPieceOfFurniture constructor
        newComment.append(
            "<br>Caution: The constructor of <code>CatalogPieceOfFurniture</code> was modified in version 5.5 with incompatible changes with previous versions"
                + " and might require some changes in your program.\n");
        firstParam = false;
      }
      if (!line.contains("@since")) {
        // Ignore unmodifiable comment
        newComment.append(line.replace("an unmodifiable", "a"));
        newComment.append("\n");
      }
    }
    newComment.deleteCharAt(newComment.length() - 1);
    if (element instanceof TypeElement) {
      TypeElement type = (TypeElement)element;
      if (types().isSubtype(type.asType(), util().getType(Throwable.class))
          // Additional controller classes not used yet
          || type.getQualifiedName().contentEquals("com.eteks.sweethome3d.viewcontroller.AbstractPhotoController")
          || type.getQualifiedName().contentEquals("com.eteks.sweethome3d.viewcontroller.PhotoController")
          || type.getQualifiedName().contentEquals("com.eteks.sweethome3d.viewcontroller.PhotosController")
          || type.getQualifiedName().contentEquals("com.eteks.sweethome3d.viewcontroller.VideoController")
          || type.getQualifiedName().contentEquals("com.eteks.sweethome3d.viewcontroller.PageSetupController")
          || type.getQualifiedName().contentEquals("com.eteks.sweethome3d.viewcontroller.ImportedFurnitureWizardController")) {
        newComment.append("\n");
        newComment.append("@ignore");
      }
    }
    if (!element.getModifiers().contains(Modifier.PUBLIC)
        && !element.getModifiers().contains(Modifier.PROTECTED)
        && !element.getModifiers().contains(Modifier.PRIVATE)) {
      newComment.append("\n");
      newComment.append("@private");
    }

    return newComment.toString().replace("{*}", "{Object}");
  }

  @Override
  public void beforeTypeBody(TypeElement type) {
    if ("com.eteks.sweethome3d.io.XMLWriter".equals(type.getQualifiedName().toString())) {
      print("/*private*/ out : StringWriter;\n");
    }
    super.beforeTypeBody(type);
  }

  @Override
  public boolean eraseSuperClass(TypeElement type, TypeElement superClass) {
    String name = superClass.getQualifiedName().toString();
    if (EventObject.class.getName().equals(name)) {
      return false;
    }
    return super.eraseSuperClass(type, superClass);
  }

  @Override
  public boolean substituteInstanceof(String exprStr, ExtendedElement expr, TypeMirror type) {
    if(type.toString().equals("com.eteks.sweethome3d.model.LengthUnit")) {
      print(exprStr, expr);
      print(" != null");
      return true;
    }
    return super.substituteInstanceof(exprStr, expr, type);
  }

  @Override
  public void afterType(TypeElement type) {
    if (!hasAnnotationType(type, JSweetConfig.ANNOTATION_ERASED)
        && !types().isAssignable(type.asType(), util().getType(Throwable.class))) {
      List<String> transientFields = new ArrayList<>();
      for (Element e : util().getAllMembers(type)) {
        if (e.getModifiers().contains(Modifier.TRANSIENT)) {
          transientFields.add(e.getSimpleName().toString());
        }
      }
      if (!transientFields.isEmpty()) {
        print(type.getSimpleName()).print("['__transients'] = ['").print(String.join("', '", transientFields))
            .print("'];");
      }
    }
    super.afterType(type);
  }

}
