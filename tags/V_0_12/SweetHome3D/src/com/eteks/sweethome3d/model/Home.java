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

import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

/**
 * The home managed by the application with its furniture and walls.
 * @author Emmanuel Puybaret
 */
public class Home implements Serializable {
  private static final long serialVersionUID = 1L;
  
  private List<HomePieceOfFurniture>            furniture;
  private transient List<Object>                selectedItems;
  private transient List<FurnitureListener>     furnitureListeners;
  private transient List<SelectionListener>     selectionListeners;
  private Collection<Wall>                      walls;
  private transient List<WallListener>          wallListeners;
  private float                                 wallHeight;
  private String                                name;
  private HomePieceOfFurniture.SortableProperty furnitureSortedProperty;
  private boolean                               furnitureDescendingSorted;
  private transient boolean                     modified;
  private transient PropertyChangeSupport       propertyChangeSupport;

  /**
   * Creates a home with no furniture, no walls, 
   * and a height equal to 250 cm.
   */
  public Home() {
    this(250);
  }

  /**
   * Creates a home with no furniture and no walls.
   */
  public Home(float wallHeight) {
    this(new ArrayList<HomePieceOfFurniture>(), wallHeight);
  }

  /**
   * Creates a home with the given <code>furniture</code>, 
   * no walls and a height equal to 250 cm.
   */
  public Home(List<HomePieceOfFurniture> furniture) {
    this(furniture, 250);
  }

  private Home(List<HomePieceOfFurniture> furniture, float wallHeight) {
    this.furniture = new ArrayList<HomePieceOfFurniture>(furniture);
    this.walls = new ArrayList<Wall>();
    this.wallHeight = wallHeight;
    // Init transient lists on the fly
  }

  /**
   * Adds the furniture <code>listener</code> in parameter to this home.
   */
  public void addFurnitureListener(FurnitureListener listener) {
    if (this.furnitureListeners == null) {
      this.furnitureListeners = new ArrayList<FurnitureListener>();
    }
    this.furnitureListeners.add(listener);
  }

  /**
   * Removes the furniture <code>listener</code> in parameter from this home.
   */
  public void removeFurnitureListener(FurnitureListener listener) {
    if (this.furnitureListeners != null) {
      this.furnitureListeners.remove(listener);
    }
  }

  /**
   * Returns an unmodifiable list of the furniture managed by this home. 
   * This furniture in this list is always sorted in the index order they were added to home. 
   */
  public List<HomePieceOfFurniture> getFurniture() {
    return Collections.unmodifiableList(this.furniture);
  }

  /**
   * Adds a <code>piece</code> in parameter.
   * Once the <code>piece</code> is added, furniture listeners added to this home will receive a
   * {@link FurnitureListener#pieceOfFurnitureChanged(FurnitureEvent) pieceOfFurnitureChanged}
   * notification.
   */
  public void addPieceOfFurniture(HomePieceOfFurniture piece) {
    addPieceOfFurniture(piece, this.furniture.size());
  }

  /**
   * Adds the <code>piece</code> in parameter at a given <code>index</code>.
   * Once the <code>piece</code> is added, furniture listeners added to this home will receive a
   * {@link FurnitureListener#pieceOfFurnitureChanged(FurnitureEvent) pieceOfFurnitureChanged}
   * notification.
   */
  public void addPieceOfFurniture(HomePieceOfFurniture piece, int index) {
    // Make a copy of the list to avoid conflicts in the list returned by getFurniture
    this.furniture = new ArrayList<HomePieceOfFurniture>(this.furniture);
    this.furniture.add(index, piece);
    firePieceOfFurnitureChanged(piece, index, FurnitureEvent.Type.ADD);
  }

  /**
   * Deletes the <code>piece</code> in parameter from this home.
   * Once the <code>piece</code> is deleted, furniture listeners added to this home will receive a
   * {@link FurnitureListener#pieceOfFurnitureChanged(FurnitureEvent) pieceOfFurnitureChanged}
   * notification.
   */
  public void deletePieceOfFurniture(HomePieceOfFurniture piece) {
    // Ensure selectedItems don't keep a reference to piece
    deselectItem(piece);
    int index = this.furniture.indexOf(piece);
    if (index != -1) {
      // Make a copy of the list to avoid conflicts in the list returned by getFurniture
      this.furniture = new ArrayList<HomePieceOfFurniture>(this.furniture);
      this.furniture.remove(index);
      firePieceOfFurnitureChanged(piece, index, FurnitureEvent.Type.DELETE);
    }
  }

  /**
   * Updates the name of <code>piece</code>. 
   * Once the <code>piece</code> is updated, furniture listeners added to this home will receive a
   * {@link FurnitureListener#pieceOfFurnitureChanged(FurnitureEvent) pieceOfFurnitureChanged}
   * notification.
   */
  public void setPieceOfFurnitureName(HomePieceOfFurniture piece, 
                                      String name) {
    if ((piece.getName() == null && name != null)
        || (piece.getName() != null && !piece.getName().equals(name))) {
      piece.setName(name);
      firePieceOfFurnitureChanged(piece, this.furniture.indexOf(piece), FurnitureEvent.Type.UPDATE);
    }
  }

  /**
   * Updates the location of <code>piece</code>. 
   * Once the <code>piece</code> is updated, furniture listeners added to this home will receive a
   * {@link FurnitureListener#pieceOfFurnitureChanged(FurnitureEvent) pieceOfFurnitureChanged}
   * notification.
   */
  public void setPieceOfFurnitureLocation(HomePieceOfFurniture piece, 
                                          float x, float y) {
    if (piece.getX() != x
        || piece.getY() != y) {
      piece.setX(x);
      piece.setY(y);
      firePieceOfFurnitureChanged(piece, this.furniture.indexOf(piece), FurnitureEvent.Type.UPDATE);
    }
  }
  
  /**
   * Updates the angle of <code>piece</code>. 
   * Once the <code>piece</code> is updated, furniture listeners added to this home will receive a
   * {@link FurnitureListener#pieceOfFurnitureChanged(FurnitureEvent) pieceOfFurnitureChanged}
   * notification.
   */
  public void setPieceOfFurnitureAngle(HomePieceOfFurniture piece, 
                                       float angle) {
    if (piece.getAngle() != angle) {
      piece.setAngle(angle);
      firePieceOfFurnitureChanged(piece, this.furniture.indexOf(piece), FurnitureEvent.Type.UPDATE);
    }
  }

  /**
   * Updates the dimension of <code>piece</code>. 
   * Once the <code>piece</code> is updated, furniture listeners added to this home will receive a
   * {@link FurnitureListener#pieceOfFurnitureChanged(FurnitureEvent) pieceOfFurnitureChanged}
   * notification.
   */
  public void setPieceOfFurnitureDimension(HomePieceOfFurniture piece, 
                                           float width, float depth, float height) {
    if (piece.getWidth() != width
        || piece.getDepth() != depth
        || piece.getHeight() != height) {
      piece.setWidth(width);
      piece.setDepth(depth);
      piece.setHeight(height);
      firePieceOfFurnitureChanged(piece, this.furniture.indexOf(piece), FurnitureEvent.Type.UPDATE);
    }
  }
  
  /**
   * Updates the color of <code>piece</code>. 
   * Once the <code>piece</code> is updated, furniture listeners added to this home will receive a
   * {@link FurnitureListener#pieceOfFurnitureChanged(FurnitureEvent) pieceOfFurnitureChanged}
   * notification.
   */
  public void setPieceOfFurnitureColor(HomePieceOfFurniture piece, 
                                       Integer color) {
    Integer pieceColor = piece.getColor(); 
    if ((pieceColor == null && color != null)
        || (pieceColor != null && !pieceColor.equals(color))) {
      piece.setColor(color);
      firePieceOfFurnitureChanged(piece, this.furniture.indexOf(piece), FurnitureEvent.Type.UPDATE);
    }
  }

  /**
   * Updates the visibility of <code>piece</code>. 
   * Once the <code>piece</code> is updated, furniture listeners added to this home will receive a
   * {@link FurnitureListener#pieceOfFurnitureChanged(FurnitureEvent) pieceOfFurnitureChanged}
   * notification.
   */
  public void setPieceOfFurnitureVisible(HomePieceOfFurniture piece, 
                                         boolean visible) {
    piece.setVisible(visible);
    firePieceOfFurnitureChanged(piece, this.furniture.indexOf(piece), FurnitureEvent.Type.UPDATE);
  }

  private void firePieceOfFurnitureChanged(HomePieceOfFurniture piece, int index, 
                                           FurnitureEvent.Type eventType) {
    if (this.furnitureListeners != null
        && !this.furnitureListeners.isEmpty()) {
      FurnitureEvent furnitureEvent = 
          new FurnitureEvent(this, piece, index, eventType);
      // Work on a copy of furnitureListeners to ensure a listener 
      // can modify safely listeners list
      FurnitureListener [] listeners = this.furnitureListeners.
        toArray(new FurnitureListener [this.furnitureListeners.size()]);
      for (FurnitureListener listener : listeners) {
        listener.pieceOfFurnitureChanged(furnitureEvent);
      }
    }
  }

  /**
   * Adds the selection <code>listener</code> in parameter to this home.
   */
  public void addSelectionListener(SelectionListener listener) {
    if (this.selectionListeners == null) {
      this.selectionListeners = new ArrayList<SelectionListener>();
    }
    this.selectionListeners.add(listener);
  }

  /**
   * Removes the selection <code>listener</code> in parameter from this home.
   */
  public void removeSelectionListener(SelectionListener listener) {
    if (this.selectionListeners != null) {
      this.selectionListeners.remove(listener);
    }
  }

  /**
   * Returns an unmodifiable list of the selected items in home.
   */
  public List<Object> getSelectedItems() {
    if (this.selectedItems == null) {
      this.selectedItems = new ArrayList<Object>();
    }
    return Collections.unmodifiableList(this.selectedItems);
  }
  
  /**
   * Sets the selected items in home and notifies listeners selection change.
   */
  public void setSelectedItems(List<? extends Object> selectedItems) {
    // Make a copy of the list to avoid conflicts in the list returned by getSelectedItems
    this.selectedItems = new ArrayList<Object>(selectedItems);
    if (this.selectionListeners != null 
        && !this.selectionListeners.isEmpty()) {
      SelectionEvent selectionEvent = new SelectionEvent(this, getSelectedItems());
      // Work on a copy of selectionListeners to ensure a listener 
      // can modify safely listeners list
      SelectionListener [] listeners = this.selectionListeners.
        toArray(new SelectionListener [this.selectionListeners.size()]);
      for (SelectionListener listener : listeners) {
        listener.selectionChanged(selectionEvent);
      }
    }
  }

  /**
   * Deselects <code>item</code> if it's selected.
   */
  private void deselectItem(Object item) {
    if (this.selectedItems != null) {
      int pieceSelectionIndex = this.selectedItems.indexOf(item);
      if (pieceSelectionIndex != -1) {
        List<Object> selectedItems = new ArrayList<Object>(getSelectedItems());
        selectedItems.remove(pieceSelectionIndex);
        setSelectedItems(selectedItems);
      }
    }
  }

  /**
   * Adds the wall <code>listener</code> in parameter to this home.
   */
  public void addWallListener(WallListener listener) {
    if (this.wallListeners == null) {
      this.wallListeners = new ArrayList<WallListener>();
    }
    this.wallListeners.add(listener);
  }
  
  /**
   * Removes the wall <code>listener</code> in parameter from this home.
   */
  public void removeWallListener(WallListener listener) {
    if (this.wallListeners != null) {
      this.wallListeners.remove(listener);
    }
  } 

  /**
   * Returns an unmodifiable collection of the walls of this home.
   */
  public Collection<Wall> getWalls() {
    return Collections.unmodifiableCollection(this.walls);
  }

  /**
   * Adds a given <code>wall</code> to the set of walls of this home.
   * Once the <code>wall</code> is added, wall listeners added to this home will receive a
   * {@link WallListener#wallChanged(WallEvent) wallChanged}
   * notification, with an {@link WallEvent#getType() event type} 
   * equal to {@link WallEvent.Type#ADD ADD}. 
   */
  public void addWall(Wall wall) {
    // Make a copy of the list to avoid conflicts in the list returned by getWalls
    this.walls = new ArrayList<Wall>(this.walls);
    this.walls.add(wall);
    fireWallEvent(wall, WallEvent.Type.ADD);
  }

  /**
   * Removes a given <code>wall</code> from the set of walls of this home.
   * Once the <code>wall</code> is removed, wall listeners added to this home will receive a
   * {@link WallListener#wallChanged(WallEvent) wallChanged}
   * notification, with an {@link WallEvent#getType() event type} 
   * equal to {@link WallEvent.Type#DELETE DELETE}.
   * If any wall is attached to <code>wall</code> they will be detached from it ;
   * therefore wall listeners will receive a 
   * {@link WallListener#wallChanged(WallEvent) wallChanged}
   * notification, with an {@link WallEvent#getType() event type} 
   * equal to {@link WallEvent.Type#UPDATE UPDATE}. 
   */
  public void deleteWall(Wall wall) {
    //  Ensure selectedItems don't keep a reference to wall
    deselectItem(wall);
    // Detach any other wall attached to wall
    for (Wall otherWall : getWalls()) {
      if (wall.equals(otherWall.getWallAtStart())) {
        setWallAtStart(otherWall, null);
      } else if (wall.equals(otherWall.getWallAtEnd())) {
        setWallAtEnd(otherWall, null);
      }
    }
    // Make a copy of the list to avoid conflicts in the list returned by getWalls
    this.walls = new ArrayList<Wall>(this.walls);
    this.walls.remove(wall);
    fireWallEvent(wall, WallEvent.Type.DELETE);
  }

  /**
   * Moves <code>wall</code> start point to (<code>x</code>, <code>y</code>).
   * Once the <code>wall</code> is updated, wall listeners added to this home will receive a
   * {@link WallListener#wallChanged(WallEvent) wallChanged}
   * notification, with an {@link WallEvent#getType() event type} 
   * equal to {@link WallEvent.Type#UPDATE UPDATE}. 
   * No change is made on walls attached to <code>wall</code>.
   */
  public void moveWallStartPointTo(Wall wall, float x, float y) {
    if (x != wall.getXStart() || y != wall.getYStart()) {
      wall.setXStart(x);
      wall.setYStart(y);
      fireWallEvent(wall, WallEvent.Type.UPDATE);
    }
  }

  /**
   * Moves <code>wall</code> end point to (<code>x</code>, <code>y</code>) pixels.
   * Once the <code>wall</code> is updated, wall listeners added to this home will receive a
   * {@link WallListener#wallChanged(WallEvent) wallChanged}
   * notification, with an {@link WallEvent#getType() event type} 
   * equal to {@link WallEvent.Type#UPDATE UPDATE}. 
   * No change is made on walls attached to <code>wall</code>.
   */
  public void moveWallEndPointTo(Wall wall, float x, float y) {
    if (x != wall.getXEnd() || y != wall.getYEnd()) {
      wall.setXEnd(x);
      wall.setYEnd(y);
      fireWallEvent(wall, WallEvent.Type.UPDATE);
    }
  }

  /**
   * Sets the wall at start of <code>wall</code> as <code>wallAtEnd</code>. 
   * Once the <code>wall</code> is updated, wall listeners added to this home will receive a
   * {@link WallListener#wallChanged(WallEvent) wallChanged} notification, with
   * an {@link WallEvent#getType() event type} equal to
   * {@link WallEvent.Type#UPDATE UPDATE}. 
   * If the wall attached to <code>wall</code> start point is attached itself
   * to <code>wall</code>, this wall will be detached from <code>wall</code>, 
   * and wall listeners will receive
   * {@link WallListener#wallChanged(WallEvent) wallChanged}
   * notification about this wall, with an {@link WallEvent#getType() event type} 
   * equal to {@link WallEvent.Type#UPDATE UPDATE}. 
   * @param wallAtStart a wall or <code>null</code> to detach <code>wall</code>
   *          from any wall it was attached to before.
   */
  public void setWallAtStart(Wall wall, Wall wallAtStart) {
    detachJoinedWall(wall, wall.getWallAtStart());    
    wall.setWallAtStart(wallAtStart);
    fireWallEvent(wall, WallEvent.Type.UPDATE);
  }

  /**
   * Sets the wall at end of <code>wall</code> as <code>wallAtEnd</code>. 
   * Once the <code>wall</code> is updated, wall listeners added to this home will receive a
   * {@link WallListener#wallChanged(WallEvent) wallChanged} notification, with
   * an {@link WallEvent#getType() event type} equal to
   * {@link WallEvent.Type#UPDATE UPDATE}. 
   * If the wall attached to <code>wall</code> end point is attached itself
   * to <code>wall</code>, this wall will be detached from <code>wall</code>, 
   * and wall listeners will receive
   * {@link WallListener#wallChanged(WallEvent) wallChanged}
   * notification about this wall, with an {@link WallEvent#getType() event type} 
   * equal to {@link WallEvent.Type#UPDATE UPDATE}. 
   * @param wallAtEnd a wall or <code>null</code> to detach <code>wall</code>
   *          from any wall it was attached to before.
   */
  public void setWallAtEnd(Wall wall, Wall wallAtEnd) {
    detachJoinedWall(wall, wall.getWallAtEnd());    
    wall.setWallAtEnd(wallAtEnd);
    fireWallEvent(wall, WallEvent.Type.UPDATE);
  }

  /**
   * Detaches <code>joinedWall</code> from <code>wall</code>.
   */
  private void detachJoinedWall(Wall wall, Wall joinedWall) {
    // Detach the previously attached wall to wall in parameter
    if (joinedWall != null) {
      if (wall.equals(joinedWall.getWallAtStart())) {
        joinedWall.setWallAtStart(null);
        fireWallEvent(joinedWall, WallEvent.Type.UPDATE);
      } else if (wall.equals(joinedWall.getWallAtEnd())) {
        joinedWall.setWallAtEnd(null);
        fireWallEvent(joinedWall, WallEvent.Type.UPDATE);
      } 
    }
  }

  /**
   * Notifies all wall listeners added to this home an event of 
   * a given type.
   */
  private void fireWallEvent(Wall wall, WallEvent.Type eventType) {
    if (this.wallListeners != null 
        && !this.wallListeners.isEmpty()) {
      WallEvent wallEvent = new WallEvent(this, wall, eventType);
      // Work on a copy of wallListeners to ensure a listener 
      // can modify safely listeners list
      WallListener [] listeners = this.wallListeners.
        toArray(new WallListener [this.wallListeners.size()]);
      for (WallListener listener : listeners) {
        listener.wallChanged(wallEvent);
      }
    }
  }

  /**
   * Adds the home <code>listener</code> in parameter to this home.
   */
  public void addPropertyChangeListener(String property, PropertyChangeListener listener) {
    if (this.propertyChangeSupport == null) {
      this.propertyChangeSupport = new PropertyChangeSupport(this);
    }
    this.propertyChangeSupport.addPropertyChangeListener(property, listener);
  }

  /**
   * Removes the home <code>listener</code> in parameter from this home.
   */
  public void removeProrertyChangeistener(String property, PropertyChangeListener listener) {
    if (this.propertyChangeSupport != null) {
      this.propertyChangeSupport.removePropertyChangeListener(property, listener);
    }
  }

  /**
   * Returns the wall height of this home.
   */
  public float getWallHeight() {
    return this.wallHeight;
  }

  /**
   * Returns the name of this home.
   */
  public String getName() {
    return this.name;
  }

  /**
   * Sets the name of this home and fires a <code>PropertyChangeEvent</code>.
   */
  public void setName(String name) {
    if (name != this.name
        || (name != null && !name.equals(this.name))) {
      String oldName = this.name;
      this.name = name;
      if (this.propertyChangeSupport != null) {
        this.propertyChangeSupport.firePropertyChange("name", oldName, name);
      }
    }
  }

  /**
   * Returns whether the state of this home is modified or not.
   */
  public boolean isModified() {
    return this.modified;
  }

  /**
   * Sets the modified state of this home and fires a <code>PropertyChangeEvent</code>.
   */
  public void setModified(boolean modified) {
    if (modified != this.modified) {
      this.modified = modified;
      if (this.propertyChangeSupport != null) {
        this.propertyChangeSupport.firePropertyChange("modified", !modified, modified);
      }
    }
  }
  
  /**
   * Returns the furniture property on which home is sorted or <code>null</code> if
   * home furniture isn't sorted.
   */
  public HomePieceOfFurniture.SortableProperty getFurnitureSortedProperty() {
    return this.furnitureSortedProperty;
  }

  /**
   * Sets the furniture property on which this home should be sorted 
   * and fires a <code>PropertyChangeEvent</code>.
   */
  public void setFurnitureSortedProperty(HomePieceOfFurniture.SortableProperty furnitureSortedProperty) {
    if (furnitureSortedProperty != this.furnitureSortedProperty
        || (furnitureSortedProperty != null && !furnitureSortedProperty.equals(this.furnitureSortedProperty))) {
      HomePieceOfFurniture.SortableProperty oldFurnitureSortedProperty = this.furnitureSortedProperty;
      this.furnitureSortedProperty = furnitureSortedProperty;
      if (this.propertyChangeSupport != null) {
        this.propertyChangeSupport.firePropertyChange("furnitureSortedProperty", 
            oldFurnitureSortedProperty, furnitureSortedProperty);
      }
    }
  }

  /**
   * Returns whether furniture is sorted in ascending or descending order.
   */
  public boolean isFurnitureDescendingSorted() {
    return this.furnitureDescendingSorted;
  }
  
  /**
   * Sets the furniture sort order on which home should be sorted 
   * and fires a <code>PropertyChangeEvent</code>.
   */
  public void setFurnitureDescendingSorted(boolean furnitureDescendingSorted) {
    if (furnitureDescendingSorted != this.furnitureDescendingSorted) {
      this.furnitureDescendingSorted = furnitureDescendingSorted;
      if (this.propertyChangeSupport != null) {
        this.propertyChangeSupport.firePropertyChange("furnitureDescendingSorted", 
            !furnitureDescendingSorted, furnitureDescendingSorted);
      }
    }
  }

  /**
   * Returns a sub list of <code>items</code> that contains only home furniture.
   */
  public static List<HomePieceOfFurniture> getFurnitureSubList(List<? extends Object> items) {
    return getSubList(items, HomePieceOfFurniture.class);
  }

  /**
   * Returns a sub list of <code>items</code> that contains only walls.
   */
  public static List<Wall> getWallsSubList(List<? extends Object> items) {
    return getSubList(items, Wall.class);
  }

  @SuppressWarnings("unchecked")
  private static <T> List<T> getSubList(List<? extends Object> items, 
                                        Class<T> subListClass) {
    List<T> subList = new ArrayList<T>();
    for (Object item : items) {
      if (subListClass.isInstance(item)) {
        subList.add((T)item);
      }
    }
    return subList;
  }
}

