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

import com.eteks.sweethome3d.model.ObjectProperty;

/**
 * Information about additional properties proposed in preferences.
 * @author Emmanuel Puybaret
 */
public class FurnitureProperty extends ObjectProperty {
  private final String   defaultPropertyKeyName;
  private final boolean  editable;
  private final boolean  displayed;

  public FurnitureProperty(String name) {
    this(name, null);
  }

  public FurnitureProperty(String name, Type type) {
    this(name, type, null, true, true, true, true);
  }

  public FurnitureProperty(String name, Type type, String defaultPropertyKeyName,
                           boolean displayable, boolean displayed,
                           boolean editable, boolean modifiable) {
    super(name, null, type, displayable, modifiable, true);
    this.defaultPropertyKeyName = defaultPropertyKeyName;
    this.editable = editable;
    this.displayed = displayed;
  }

  public String getDefaultPropertyKeyName() {
    return this.defaultPropertyKeyName;
  }

  public boolean isEditable() {
    return editable;
  }

  public boolean isDisplayed() {
    return this.displayed;
  }

  public FurnitureProperty deriveModifiableProperty(boolean modifiable) {
    return new FurnitureProperty(getName(), getType(), this.defaultPropertyKeyName, isDisplayable(), this.displayed, this.editable, modifiable);
  }

  public FurnitureProperty deriveDisplayedProperty(boolean displayed) {
    return new FurnitureProperty(getName(), getType(), this.defaultPropertyKeyName, isDisplayable(), displayed, this.editable, isModifiable());
  }
}
