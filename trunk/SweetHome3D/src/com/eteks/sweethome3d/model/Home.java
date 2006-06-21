/*
 * Home.java 15 mai 2006
 *
 * Copyright (c) 2006 Emmanuel PUYBARET / eTeks <info@eteks.com>. All Rights Reserved.
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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * The home managed by the application with its furniture.
 * @author Emmanuel Puybaret
 */
public class Home {
  private List<HomePieceOfFurniture> furniture;
  private List<FurnitureListener>    furnitureListeners;

  /**
   * Creates a home with no furniture.
   */
  public Home() {
    this.furniture = new ArrayList<HomePieceOfFurniture>();
    this.furnitureListeners = new ArrayList<FurnitureListener>();
  }

  /**
   * Adds the furniture <code>listener</code> in parameter to this home.
   * <br>Caution : This method isn't thread safe.
   */
  public void addFurnitureListener(FurnitureListener listener) {
    this.furnitureListeners.add(listener);
  }

  /**
   * Removes the furniture <code>listener</code> in parameter from this home.
   * <br>Caution : This method isn't thread safe.
   */
  public void removeFurnitureListener(FurnitureListener listener) {
    this.furnitureListeners.remove(listener);
  }

  /**
   * Returns an unmodifiable list of the furniture managed by this home.
   * @return the furniture in the order they were
   *         {@link #add(HomePieceOfFurniture, int) added}.
   */
  public List<HomePieceOfFurniture> getFurniture() {
    return Collections.unmodifiableList(this.furniture);
  }

  /**
   * Adds a <code>piece</code> in parameter at a given <code>index</code>.
   * Once the <code>piece</code> is added, furniture listeners added to this home will receive a
   * {@link FurnitureListener#pieceOfFurnitureAdded(FurnitureEvent) pieceOfFurnitureAdded}
   * notification.
   * <br>Caution : This method isn't thread safe.
   */
  public void add(HomePieceOfFurniture piece, int index) {
    this.furniture.add(index, piece);
    if (!this.furnitureListeners.isEmpty()) {
      FurnitureEvent furnitureEvent = new FurnitureEvent(this, piece);
      for (FurnitureListener listener : this.furnitureListeners) {
        listener.pieceOfFurnitureAdded(furnitureEvent);
      }
    }
  }

  /**
   * Removes a given <code>piece</code> of furniture from this home.
   * Once the <code>piece</code> is removed, furniture listeners added to this home will receive a
   * {@link FurnitureListener#pieceOfFurnitureDeleted(FurnitureEvent) pieceOfFurnitureDeleted}
   * notification.
   * <br>Caution : This method isn't thread safe.
   */
  public void delete(HomePieceOfFurniture piece) {
    this.furniture.remove(piece);
    if (!this.furnitureListeners.isEmpty()) {
      FurnitureEvent furnitureEvent = new FurnitureEvent(this, piece);
      for (FurnitureListener listener : this.furnitureListeners) {
        listener.pieceOfFurnitureDeleted(furnitureEvent);
      }
    }
  }
}
