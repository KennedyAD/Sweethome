/*
 * Camera.java 16 juin 07
 *
 * Sweet Home 3D, Copyright (c) 2007 Emmanuel PUYBARET / eTeks <info@eteks.com>
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

import java.io.IOException;
import java.io.ObjectInputStream;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.TimeZone;

/**
 * Camera characteristics in home.
 * @author Emmanuel Puybaret
 */
public class Camera extends HomeObject {
  /**
   * The kind of lens that can be used with a camera.
   * @author Emmanuel Puybaret
   * @since 3.0
   */
  public enum Lens {PINHOLE, NORMAL, FISHEYE, SPHERICAL}

  /**
   * The properties of a camera that may change. <code>PropertyChangeListener</code>s added
   * to a camera will be notified under a property name equal to the string value of one these properties.
   */
  public enum Property {NAME, X, Y, Z, YAW, PITCH, FIELD_OF_VIEW, TIME, LENS, RENDERER}

  private static final long serialVersionUID = 1L;

  private String              name;
  private float               x;
  private float               y;
  private float               z;
  private float               yaw;
  private float               pitch;
  private float               fieldOfView;
  private long                time;
  private transient Lens      lens;
  // Lens is saved as a string to be able to keep backward compatibility
  // if new constants are added to Lens enum in future versions
  private String              lensName;
  private String              renderer;

  /**
   * Creates a camera at given location and angles at midday and using a pinhole lens.
   */
  public Camera(float x, float y, float z, float yaw, float pitch, float fieldOfView) {
    this(x, y, z, yaw, pitch, fieldOfView, midday(), Lens.PINHOLE);
  }

  /**
   * Creates a camera at given location and angles at midday and using a pinhole lens.
   * @since 6.4
   */
  public Camera(String id, float x, float y, float z, float yaw, float pitch, float fieldOfView) {
    this(id, x, y, z, yaw, pitch, fieldOfView, midday(), Lens.PINHOLE);
  }

  /**
   * Creates a camera at given location and angles.
   * @since 3.0
   */
  public Camera(float x, float y, float z, float yaw, float pitch, float fieldOfView,
                long time, Lens lens) {
    this(createId("camera"), x, y, z, yaw, pitch, fieldOfView, time, lens);
  }


  /**
   * Creates a camera at given location and angles.
   * @since 6.4
   */
  public Camera(String id, float x, float y, float z, float yaw, float pitch, float fieldOfView,
                long time, Lens lens) {
    super(id);
    this.x = x;
    this.y = y;
    this.z = z;
    this.yaw = yaw;
    this.pitch = pitch;
    this.fieldOfView = fieldOfView;
    this.time = time;
    this.lens = lens;
  }

  /**
   * Returns the time of midday today in milliseconds since the Epoch in UTC time zone.
   */
  private static long midday() {
    Calendar midday = new GregorianCalendar(TimeZone.getTimeZone("UTC"));
    midday.set(Calendar.HOUR_OF_DAY, 12);
    midday.set(Calendar.MINUTE, 0);
    midday.set(Calendar.SECOND, 0);
    midday.set(Calendar.MILLISECOND, 0);
    return midday.getTimeInMillis();
  }

  /**
   * Initializes new camera transient fields
   * and reads its properties from <code>in</code> stream with default reading method.
   */
  private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
    this.time = midday();
    this.lens = Lens.PINHOLE;
    in.defaultReadObject();
    try {
      // Read lens from a string
      if (this.lensName != null) {
        this.lens = Lens.valueOf(this.lensName);
      }
    } catch (IllegalArgumentException ex) {
      // Ignore malformed enum constant
    }
  }

  /**
   * Returns the name of this camera.
   * @since 3.0
   */
  public String getName() {
    return this.name;
  }

  /**
   * Sets the name of this camera and notifies listeners of this change.
   * @since 3.0
   */
  public void setName(String name) {
    if (name != this.name
        && (name == null || !name.equals(this.name))) {
      String oldName = this.name;
      this.name = name;
      firePropertyChange(Property.NAME.name(), oldName, name);
    }
  }

  /**
   * Returns the yaw angle in radians of this camera.
   */
  public float getYaw() {
    return this.yaw;
  }

  /**
   * Sets the yaw angle in radians of this camera and notifies listeners of this change.
   * Yaw axis is vertical axis.
   */
  public void setYaw(float yaw) {
    if (yaw != this.yaw) {
      float oldYaw = this.yaw;
      this.yaw = yaw;
      firePropertyChange(Property.YAW.name(), oldYaw, yaw);
    }
  }

  /**
   * Returns the pitch angle in radians of this camera.
   */
  public float getPitch() {
    return this.pitch;
  }

  /**
   * Sets the pitch angle in radians of this camera and notifies listeners of this change.
   * Pitch axis is horizontal transverse axis.
   */
  public void setPitch(float pitch) {
    if (pitch != this.pitch) {
      float oldPitch = this.pitch;
      this.pitch = pitch;
      firePropertyChange(Property.PITCH.name(), oldPitch, pitch);
    }
  }

  /**
   * Returns the field of view in radians of this camera.
   */
  public float getFieldOfView() {
    return this.fieldOfView;
  }

  /**
   * Sets the field of view in radians of this camera and notifies listeners of this change.
   */
  public void setFieldOfView(float fieldOfView) {
    if (fieldOfView != this.fieldOfView) {
      float oldFieldOfView = this.fieldOfView;
      this.fieldOfView = fieldOfView;
      firePropertyChange(Property.FIELD_OF_VIEW.name(), oldFieldOfView, fieldOfView);
    }
  }

  /**
   * Returns the abscissa of this camera.
   */
  public float getX() {
    return this.x;
  }

  /**
   * Sets the abscissa of this camera and notifies listeners of this change.
   */
  public void setX(float x) {
    if (x != this.x) {
      float oldX = this.x;
      this.x = x;
      firePropertyChange(Property.X.name(), oldX, x);
    }
  }

  /**
   * Returns the ordinate of this camera.
   */
  public float getY() {
    return this.y;
  }

  /**
   * Sets the ordinate of this camera and notifies listeners of this change.
   */
  public void setY(float y) {
    if (y != this.y) {
      float oldY = this.y;
      this.y = y;
      firePropertyChange(Property.Y.name(), oldY, y);
    }
  }

  /**
   * Returns the elevation of this camera.
   */
  public float getZ() {
    return this.z;
  }

  /**
   * Sets the elevation of this camera and notifies listeners of this change.
   */
  public void setZ(float z) {
    if (z != this.z) {
      float oldZ = this.z;
      this.z = z;
      firePropertyChange(Property.Z.name(), oldZ, z);
    }
  }

  /**
   * Returns the time in milliseconds when this camera is used.
   * @return a time in milliseconds since the Epoch in UTC time zone
   * @since 3.0
   */
  public long getTime() {
    return this.time;
  }

  /**
   * Sets the use time in milliseconds since the Epoch in UTC time zone,
   * and notifies listeners of this change.
   * @since 3.0
   */
  public void setTime(long time) {
    if (this.time != time) {
      long oldTime = this.time;
      this.time = time;
      firePropertyChange(Property.TIME.name(), oldTime, time);
    }
  }

  /**
   * Returns a time expressed in UTC time zone converted to the given time zone.
   * @since 3.0
   */
  public static long convertTimeToTimeZone(long utcTime, String timeZone) {
    Calendar utcCalendar = new GregorianCalendar(TimeZone.getTimeZone("UTC"));
    utcCalendar.setTimeInMillis(utcTime);
    Calendar convertedCalendar = new GregorianCalendar(TimeZone.getTimeZone(timeZone));
    convertedCalendar.set(Calendar.YEAR, utcCalendar.get(Calendar.YEAR));
    convertedCalendar.set(Calendar.MONTH, utcCalendar.get(Calendar.MONTH));
    convertedCalendar.set(Calendar.DAY_OF_MONTH, utcCalendar.get(Calendar.DAY_OF_MONTH));
    convertedCalendar.set(Calendar.HOUR_OF_DAY, utcCalendar.get(Calendar.HOUR_OF_DAY));
    convertedCalendar.set(Calendar.MINUTE, utcCalendar.get(Calendar.MINUTE));
    convertedCalendar.set(Calendar.SECOND, utcCalendar.get(Calendar.SECOND));
    convertedCalendar.set(Calendar.MILLISECOND, utcCalendar.get(Calendar.MILLISECOND));
    return convertedCalendar.getTimeInMillis();
  }

  /**
   * Returns the lens of this camera.
   * @since 3.0
   */
  public Lens getLens() {
    return this.lens;
  }

  /**
   * Sets the lens of this camera and notifies listeners of this change.
   * @since 3.0
   */
  public void setLens(Lens lens) {
    if (lens != this.lens) {
      Lens oldLens = this.lens;
      this.lens = lens;
      this.lensName = this.lens.name();
      firePropertyChange(Property.LENS.name(), oldLens, lens);
    }
  }

  /**
   * Sets the rendering engine used to create photos.
   * @since 7.0
   */
  public void setRenderer(String renderer) {
    if (renderer != this.renderer
        && (renderer == null || !renderer.equals(this.renderer))) {
      String oldRenderer = this.renderer;
      this.renderer = renderer;
      firePropertyChange(Property.RENDERER.name(), oldRenderer, renderer);
    }
  }

  /**
   * Returns the rendering engine used to create photos.
   * @since 7.0
   */
  public String getRenderer() {
    return this.renderer;
  }

  /**
   * Sets the location and angles of this camera from the <code>camera</code> in parameter.
   * @since 2.3
   */
  public void setCamera(Camera camera) {
    setX(camera.getX());
    setY(camera.getY());
    setZ(camera.getZ());
    setYaw(camera.getYaw());
    setPitch(camera.getPitch());
    setFieldOfView(camera.getFieldOfView());
  }

  /**
   * Returns a clone of this camera.
   * @since 2.3
   */
  @Override
  public Camera clone() {
    return (Camera)super.clone();
  }
}
