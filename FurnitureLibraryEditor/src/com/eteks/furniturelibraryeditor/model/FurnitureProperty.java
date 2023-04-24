/*
 * FurnitureProperty.java 18 avr. 2023
 *
 * Copyright (c) 2023 Emmanuel PUYBARET / eTeks <info@eteks.com>. All Rights Reserved.
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
package com.eteks.furniturelibraryeditor.model;

/**
 * Information about additional properties proposed in preferences.
 * @author Emmanuel Puybaret
 */
public final class FurnitureProperty {
  /**
   * Property type.
   */
  public enum Type {
    STRING,
    DATE,
    BOOLEAN,
    INTEGER,
    NUMBER,
    PRICE,
    LENGTH,
    PERCENTAGE,
    CONTENT,
  }

  private final String   name;
  private final Type     type;
  private final String   defaultPropertyKeyName;
  private final boolean  editable;
  private final boolean  modifiable;
  private final boolean  displayable;
  private final boolean  displayed;

  public FurnitureProperty(String name) {
    this(name, null);
  }

  public FurnitureProperty(String name, Type type) {
    this(name, type, null, true, true, true, true);
  }

  public FurnitureProperty(String name, Type type, String defaultPropertyKeyName,
                           boolean editable, boolean modifiable,
                           boolean displayable, boolean displayed) {
    this.name = name;
    this.type = type;
    this.defaultPropertyKeyName = defaultPropertyKeyName;
    this.editable = editable;
    this.modifiable = modifiable;
    this.displayable = displayable;
    this.displayed = displayed;
  }

  public String getName() {
    return this.name;
  }

  public Type getType() {
    return this.type;
  }

  public String getDefaultPropertyKeyName() {
    return this.defaultPropertyKeyName;
  }

  public boolean isEditable() {
    return editable;
  }

  public boolean isModifiable() {
    return this.modifiable;
  }

  public boolean isDisplayable() {
    return this.displayable;
  }

  public boolean isDisplayed() {
    return this.displayed;
  }

  public FurnitureProperty deriveModifiableProperty(boolean modifiable) {
    return new FurnitureProperty(this.name, this.type, this.defaultPropertyKeyName, this.editable, modifiable, this.displayable, this.displayed);
  }

  public FurnitureProperty deriveDisplayedProperty(boolean displayed) {
    return new FurnitureProperty(this.name, this.type, this.defaultPropertyKeyName, this.editable, this.modifiable, this.displayable, displayed);
  }

  @Override
  public int hashCode() {
    return this.name == null ? 0 : this.name.hashCode();
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj) {
      return true;
    } else if (obj instanceof FurnitureProperty) {
      return this.name.equals(((FurnitureProperty)obj).name);
    }
    return false;
  }
}
