/*
 * HomeObject.java 08 Sept. 2016
 *
 * Sweet Home 3D, Copyright (c) 2016 Emmanuel PUYBARET / eTeks <info@eteks.com>
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

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectStreamException;
import java.io.Serializable;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * An object with and ID and data where users can stored their own properties.
 * @author Emmanuel Puybaret
 * @since 5.3
 */
public abstract class HomeObject implements Serializable, Cloneable {
  private static final long serialVersionUID = 1L;

  private static final String ID_DEFAULT_PREFIX = "object";

  private String id; // Should be final but readObject needs to create a default one
  private Map<String, String> properties;

  private transient PropertyChangeSupport propertyChangeSupport;

  /**
   * Creates a new object with a unique ID prefixed by <code>object-</code>.
   */
  public HomeObject() {
    this(createId(ID_DEFAULT_PREFIX));
  }

  /**
   * Returns a new ID prefixed by the given string.
   * @since 6.4
   */
  protected static String createId(String prefix) {
    return prefix + "-" + UUID.randomUUID();
  }

  /**
   * Creates a new object with the given <code>id</code>.
   * @since 6.4
   */
  protected HomeObject(String id) {
    if (id == null) {
      throw new IllegalArgumentException("ID must exist");
    }
    this.id = id;
  }

  /**
   * Initializes id field to ensure it exists.
   * Useful to deserialize files older than version 5.3 where super class HomeObject didn't exist yet.
   */
  private void readObjectNoData() throws ObjectStreamException {
    // Generate a default id in case it didn't exist
    String prefix = getClass().getSimpleName();
    if (prefix.length() == 0) {
      // Anonymous class
      prefix = ID_DEFAULT_PREFIX;
    } else {
      if (prefix.startsWith("Home") && !prefix.equals("Home")) {
        // Remove "Home" prefix
        prefix = prefix.substring(4);
      }
      prefix = Character.toLowerCase(prefix.charAt(0)) + prefix.substring(1);
    }
    this.id = createId(prefix);
  }

  /**
   * Initializes id field to ensure it exists
   * and reads object from <code>in</code> stream with default reading method.
   */
  private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
    readObjectNoData();
    in.defaultReadObject();
  }

  /**
   * Adds the property change <code>listener</code> in parameter to this object.
   * Properties set with {@link #setProperty(String, String) setProperty} will be notified with
   * an event of {@link UserPropertyChangeEvent} class, whereas property change events fired by
   * subclasses of <code>HomeObject</code> will be of {@link PropertyChangeEvent} class,
   * which can be useful to distinguish homonym property names.
   * @since 6.4
   */
  public void addPropertyChangeListener(PropertyChangeListener listener) {
    if (this.propertyChangeSupport == null) {
      // Create property change support on the fly
      this.propertyChangeSupport = new PropertyChangeSupport(this);
    }
    this.propertyChangeSupport.addPropertyChangeListener(listener);
  }

  /**
   * Removes the property change <code>listener</code> in parameter from this object.
   * @since 6.4
   */
  public void removePropertyChangeListener(PropertyChangeListener listener) {
    if (this.propertyChangeSupport != null) {
      this.propertyChangeSupport.removePropertyChangeListener(listener);
      if (this.propertyChangeSupport.getPropertyChangeListeners().length == 0) {
        this.propertyChangeSupport = null;
      }
    }
  }

  /**
   * Adds the property change <code>listener</code> in parameter to this object for a specific property name.
   * Properties set with {@link #setProperty(String, String) setProperty} will be notified with
   * an event of {@link UserPropertyChangeEvent} class, whereas property change events fired by
   * subclasses of <code>HomeObject</code> will be of {@link PropertyChangeEvent} class,
   * which can be useful to distinguish homonym property names.
   * @since 6.4
   */
  public void addPropertyChangeListener(String propertyName, PropertyChangeListener listener) {
    if (this.propertyChangeSupport == null) {
      // Create property change support on the fly
      this.propertyChangeSupport = new PropertyChangeSupport(this);
    }
    this.propertyChangeSupport.addPropertyChangeListener(propertyName, listener);
  }

  /**
   * Removes the property change <code>listener</code> in parameter from this object.
   * @since 6.4
   */
  public void removePropertyChangeListener(String propertyName, PropertyChangeListener listener) {
    if (this.propertyChangeSupport != null) {
      this.propertyChangeSupport.removePropertyChangeListener(propertyName, listener);
    }
  }

  /**
   * Fires a property change of {@link PropertyChangeEvent} class to listeners.
   * @since 6.4
   */
  protected void firePropertyChange(String propertyName, Object oldValue, Object newValue) {
    if (this.propertyChangeSupport != null) {
      this.propertyChangeSupport.firePropertyChange(propertyName, oldValue, newValue);
    }
  }

  /**
   * Returns the ID of this object.
   * @return a unique ID
   * @since 6.4
   */
  public final String getId() {
    return this.id;
  }

  /**
   * Returns the value of the property <code>name</code> associated with this object.
   * @return the value of the property or <code>null</code> if it doesn't exist.
   */
  public String getProperty(String name) {
    if (this.properties != null) {
      return this.properties.get(name);
    } else {
      return null;
    }
  }

  /**
   * Sets a property associated with this object. Once the property is updated,
   * listeners added to this object will receive a change event of
   * {@link UserPropertyChangeEvent} class.<br>
   * To avoid any issue with existing or future properties of Sweet Home 3D classes,
   * do not use property names written with only upper case letters.
   * @param name   the name of the property to set
   * @param value  the new value of the property or <code>null</code> to remove an existing property
   */
  public void setProperty(String name, String value) {
    String oldValue = this.properties != null
        ? this.properties.get(name)
        : null;
    if (value == null) {
      if (this.properties != null && oldValue != null) {
        try {
          this.properties.remove(name);
          if (this.properties.size() == 0) {
            this.properties = null;
          }
        } catch (UnsupportedOperationException ex) {
          // Exception thrown by singleton map when an entry is removed
          this.properties = null;
        }
        firePropertyChange(name, oldValue, null);
      }
    } else {
      if (this.properties == null
          || (this.properties.size() == 1
              && oldValue != null)) {
        // Create properties map on the fly with a singleton map first
        this.properties = Collections.singletonMap(name, value);
      } else {
        if (this.properties.size() == 1) {
          // Then a HashMap if the user needs more than a property
          this.properties = new HashMap<String, String>(this.properties);
        }
        this.properties.put(name, value);
      }
      // Event fired only if not null value changed
      firePropertyChange(name, oldValue, value);
    }
  }

  /**
   * Returns the property names.
   * @return a collection of all the names of the properties set with {@link #setProperty(String, String) setProperty}
   */
  public Collection<String> getPropertyNames() {
    if (this.properties != null) {
      return this.properties.keySet();
    } else {
      return Collections.emptySet();
    }
  }

  /**
   * Returns a copy of this object with a new id.
   * @since 6.4
   */
  public HomeObject duplicate() {
    HomeObject copy = clone();
    // Generate a new ID with the same prefix
    int index = 0;
    char c;
    while (index < this.id.length()
        && (c = Character.toLowerCase(this.id.charAt(index))) >= 'a'
        && c <= 'z') {
      index++;
    }
    String prefix = index >= 0
        ? this.id.substring(0, index)
        : ID_DEFAULT_PREFIX;
    copy.id = createId(prefix);
    return copy;
  }

  /**
   * Returns a clone of this object.
   * The returned object has the same id as this object.
   */
  @Override
  public HomeObject clone() {
    try {
      HomeObject clone = (HomeObject)super.clone();
      if (this.properties != null) {
        clone.properties = clone.properties.size() == 1
            ? Collections.singletonMap(this.properties.keySet().iterator().next(), this.properties.values().iterator().next())
            : new HashMap<String, String>(this.properties);
      }
      clone.propertyChangeSupport = null;
      return clone;
    } catch (CloneNotSupportedException ex) {
      throw new IllegalStateException("Super class isn't cloneable");
    }
  }
}
