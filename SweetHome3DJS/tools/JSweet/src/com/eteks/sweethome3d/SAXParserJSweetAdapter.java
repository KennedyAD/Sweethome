/*
 * SweetHome3DJava3DJSweetAdapter.java 
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
package com.eteks.sweethome3d;

import org.jsweet.transpiler.extension.PrinterAdapter;
import org.jsweet.transpiler.model.MethodInvocationElement;
import org.jsweet.transpiler.model.NewClassElement;

/**
 * This adapter tunes the JavaScript generation adapting Java SAX parsers to a
 * JavaScript library.
 * 
 * @author Renaud Pawlak
 */
public class SAXParserJSweetAdapter extends PrinterAdapter {

  public SAXParserJSweetAdapter(PrinterAdapter parent) {
    super(parent);

    addTypeMapping("org.xml.sax.helpers.DefaultHandler", "DefaultHandler");
    addTypeMapping("org.xml.sax.SAXException", "SAXException");
    addTypeMapping("org.xml.sax.Attributes", "Attributes");

  }

  @Override
  public boolean substituteMethodInvocation(MethodInvocationElement invocation) {
    return super.substituteMethodInvocation(invocation);
  }

  @Override
  public boolean substituteNewClass(NewClassElement newClass) {
    switch (newClass.getTypeAsElement().toString()) {
    case "org.xml.sax.SAXException":
      print("new SAXException(").printArgList(newClass.getArguments()).print(")");
      return true;
    }
    return super.substituteNewClass(newClass);
  }

}
