/*
 * PieceOfFurniture.java 7 avr. 2006
 * 
 * Copyright (c) 2006 Emmanuel PUYBARET / eTeks <info@eteks.com>. All Rights
 * Reserved.
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; either version 2 of the License, or (at your option) any later
 * version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 59 Temple
 * Place, Suite 330, Boston, MA 02111-1307 USA
 */
package com.eteks.sweethome3d.model;

import java.net.URL;
import java.text.Collator;

/**
 * A piece of furniture.
 * @author Emmanuel Puybaret
 */
public class PieceOfFurniture implements Comparable<PieceOfFurniture> {
  private String  name;
  private URL     iconURL;
  private URL     modelURL;
  private float   width;
  private float   depth;
  private float   height;
  private boolean doorOrWindow;
  private static final Collator COMPARATOR = Collator.getInstance();

  /**
   * Creates a piece of furniture with all its values.
   * @param name  the name of the new piece
   * @param iconURL an URL to the icon file of the new piece
   * @param modelURL an URL to the 3D model file of the new piece
   * @param width  the width in meters of the new piece
   * @param depth  the depth in meters of the new piece
   * @param height  the height in meters of the new piece
   * @param doorOrWindow if true, the new piece is a door or a window
   */
  public PieceOfFurniture(String name, URL iconURL, URL modelURL, 
                          float width, float depth, float height, boolean doorOrWindow) {
    this.name = name;
    this.iconURL = iconURL;
    this.modelURL = modelURL;
    this.width = width;
    this.depth = depth;
    this.height = height;
    this.doorOrWindow = doorOrWindow;
  }

  /**
   * @return Returns the name.
   */
  public String getName() {
    return this.name;
  }

  /**
   * @return Returns the depth.
   */
  public float getDepth() {
    return this.depth;
  }

  /**
   * @return Returns the doorOrWindow.
   */
  public boolean isDoorOrWindow() {
    return this.doorOrWindow;
  }

  /**
   * @return Returns the height.
   */
  public float getHeight() {
    return this.height;
  }

  /**
   * @return Returns the iconURL.
   */
  public URL getIconURL() {
    return this.iconURL;
  }

  /**
   * @return Returns the modelURL.
   */
  public URL getModelURL() {
    return this.modelURL;
  }

  /**
   * @return Returns the width.
   */
  public float getWidth() {
    return this.width;
  }

  /** 
   * Returns true if this piece and the one in parameter have the same name.
   */
  @Override
  public boolean equals(Object obj) {
    return obj instanceof PieceOfFurniture
           && COMPARATOR.equals(this.name, ((PieceOfFurniture)obj).name);
  }

  @Override
  public int hashCode() {
    return this.name.hashCode();
  }

  /** 
   * Compares the names of this piece and the one in parameter.
   */
  public int compareTo(PieceOfFurniture piece) {
    return COMPARATOR.compare(this.name, piece.name);
  }
}
