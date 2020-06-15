/*
 * HomeEditsDeserializer.java - 11 June 2020
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
package com.eteks.sweethome3d.io;

import java.beans.PropertyChangeSupport;
import java.io.File;
import java.lang.reflect.Array;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.swing.undo.UndoableEdit;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.eteks.sweethome3d.model.Content;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomeFurnitureGroup;
import com.eteks.sweethome3d.model.HomeObject;
import com.eteks.sweethome3d.model.Selectable;
import com.eteks.sweethome3d.swing.SwingViewFactory;
import com.eteks.sweethome3d.tools.URLContent;
import com.eteks.sweethome3d.viewcontroller.HomeController;
import com.eteks.sweethome3d.viewcontroller.PlanController;

import sun.misc.Unsafe;

/**
 * A class used to to deserialize undoable edits sent from a SweetHome3D client
 * (see <code>IncrementalHomeRecorder</code>).
 * @author Renaud Pawlak
 * @author Emmanuel Puybaret
 */
public class HomeEditsDeserializer {
  private Home                    home;
  private File                    homeFile;
  private String                  baseUrl;
  private HomeController          homeController;
  private DefaultUserPreferences  preferences;
  private Map<String, HomeObject> homeObjects;

  /**
   * Creates a new home edit deserializer.
   *
   * @param home     the target home (where the edit will be applied)
   * @param homeFile the file path from which <code>home</code> was read
   * @param baseUrl  the base URL (server) for the resources found within the home
   */
  public HomeEditsDeserializer(Home home, File homeFile, String baseUrl) {
    super();
    this.home = home;
    this.homeFile = homeFile;
    this.baseUrl = baseUrl;
    // Default user preferences are needed to decode default wall patterns
    this.preferences = new DefaultUserPreferences();
    // SwingViewFactory is needed to provide a plan component with setScale and getTextBounds methods
    // Caution: be sure to run JSP server with -Djava.awt.headless=true
    this.homeController = new HomeController(home, this.preferences, new SwingViewFactory());
    this.homeObjects = new HashMap<String, HomeObject>();
    for (HomeObject homeObject : home.getHomeObjects()) {
      this.homeObjects.put(homeObject.getId(), homeObject);
    }
  }

  Unsafe unsafe = null;

  private Unsafe getUnsafe() {
    if (unsafe == null) {
      try {
        Field f = Unsafe.class.getDeclaredField("theUnsafe");
        f.setAccessible(true);
        unsafe = (Unsafe) f.get(null);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    return unsafe;
  }

  private Field getField(Class<?> type, String name) {
    try {
      Field field = type.getDeclaredField(name);
      if (!field.isAccessible()) {
        field.setAccessible(true);
      }
      return field;
    } catch (NoSuchFieldException e) {
      if (type.getSuperclass() != Object.class) {
        return getField(type.getSuperclass(), name);
      }
    }
    return null;
  }

  private Method getMethod(Class<?> type, String name, Class<?> ... parameterTypes) {
    try {
      Method method = type.getDeclaredMethod(name, parameterTypes);
      if (!method.isAccessible()) {
        method.setAccessible(true);
      }
      return method;
    } catch (NoSuchMethodException e) {
      if (type.getSuperclass() != Object.class) {
        return getMethod(type.getSuperclass(), name, parameterTypes);
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  private <T> T deserialize(Class<T> type, Object value) throws ReflectiveOperationException  {
    if (value instanceof JSONObject) {
      JSONObject jsonObject = (JSONObject)value;
      if (DefaultPatternTexture.class.getName().equals(jsonObject.getString("_type"))) {
        try {
          value = this.preferences.getPatternsCatalog().getPattern(jsonObject.getString("name"));
        } catch (IllegalArgumentException ex) {
          value = null; // Ignore unknown pattern
        }
      } else if (Content.class.isAssignableFrom(type)) {
        String url = jsonObject.getString("url");
        try {
          if (url.startsWith("jar:")) {
            if (HomeURLContent.class.getName().equals(jsonObject.getString("_type"))) {
              value = new HomeURLContent(new URL("jar:" + this.homeFile.toURI().toURL() + url.substring(url.indexOf("!/"))));
            } else {
              value = new URLContent(new URL("jar:" + baseUrl + "/" + url.substring(4)));
            }
          } else if (!url.contains(":")) {
            value = new URLContent(new URL(baseUrl + "/" + url));
          }
        } catch (MalformedURLException ex) {
          throw new IllegalArgumentException("Can't build URL ", ex);
        }
      } else {
        value = deserializeObject(type, (JSONObject)value);
      }
    } else if (value instanceof JSONArray) {
      value = deserializeArray(type, (JSONArray)value);
    } else {
      if (value == JSONObject.NULL) {
        value = null;
      } else if (HomeObject.class.isAssignableFrom(type) || Selectable.class.isAssignableFrom(type)) {
        if (this.homeObjects.containsKey(value)) {
          value = (T)this.homeObjects.get(value);
        } else {
          throw new RuntimeException("Cannot find referenced home object " + type + ": " + value);
        }
      } else if (Home.class.isAssignableFrom(type)) {
        // TODO: check that the URL is consistent
        value = this.home;
      } else if (type.isEnum()) {
        value = type.getEnumConstants() [(Integer)value];
      } else if (PlanController.class.isAssignableFrom(type)) {
        value = this.homeController.getPlanController();
      } else if (float.class == type || Float.class == type) {
        value = ((Number) value).floatValue();
      }  else if (int.class == type || Integer.class == type) {
        value = ((Number) value).intValue();
      }  else if (long.class == type || Long.class == type) {
        value = ((Number) value).longValue();
      }  else if (byte.class == type || Byte.class == type) {
        value = ((Number) value).byteValue();
      }  else if (short.class == type || Short.class == type) {
        value = ((Number) value).shortValue();
      }
    }
    return (T) value;
  }

  @SuppressWarnings("unchecked")
  private <T> T deserializeArray(Class<T> type, JSONArray json) throws ReflectiveOperationException, JSONException {
    if (type.isArray()) {
      Object target = Array.newInstance(type.getComponentType(), json.length());
      for (int i = 0; i < json.length(); i++) {
        Array.set(target, i, deserialize(type.getComponentType(), json.get(i)));
      }
      return (T) target;
    } else if (List.class.isAssignableFrom(type)) {
      List<Object> target;
      if (type.isInterface()) {
        target = new ArrayList<>();
      } else {
        target = (List<Object>)type.newInstance();
      }
      for (int i = 0; i < json.length(); i++) {
        target.add(deserialize(Object.class, json.get(i)));
      }
      return (T) target;
    } else {
      throw new RuntimeException("Unsupported collection type " + type);
    }
  }

  private <T> T deserializeObject(Class<T> type, JSONObject json) throws ReflectiveOperationException {
    return fillInstance(createInstance(type, json), json);
  }

  @SuppressWarnings("unchecked")
  private <T> T createInstance(Class<T> type, JSONObject json) throws ReflectiveOperationException, JSONException {
    T instance = null;
    Class<T> clazz = null;

    // Deserialize the objects created by the edit (placed in _newObject protocol field)
    if (json.has("_newObjects")) {
      JSONObject map = json.getJSONObject("_newObjects");
      // Pass 1: create instances for new objects
      for (String key : map.keySet()) {
        this.homeObjects.put(key, createInstance(HomeObject.class, map.getJSONObject(key)));
      }
      // Pass 2: fill instances for new objects (instances have been created in pass 1
      // so that (cross) references can be looked up)
      for (String key : map.keySet()) {
        fillInstance(homeObjects.get(key), map.getJSONObject(key));
      }
    }

    // Force UndoableEdit.hasBeenDone to false so that redo() can be called
    if (json.has("hasBeenDone")) {
      json.put("hasBeenDone", false);
    }

    if (json.has("_type")) {
      String typeName = json.getString("_type");
      String[] typeNameParts = typeName.split("\\.");

      if (Character.isUpperCase(typeNameParts[typeNameParts.length - 2].charAt(0))) {
        typeName = String.join(".", Arrays.copyOfRange(typeNameParts, 0, typeNameParts.length - 1));
        typeName += "$" + typeNameParts[typeNameParts.length - 1];
      }

      try {
        clazz = (Class<T>)Class.forName(typeName);
      } catch (ClassNotFoundException ex) {
        // Should not happen
        throw new RuntimeException("Cannot find type " + typeName, ex);
      }
    } else {
      clazz = type;
    }
    try {
      Constructor<T> constructor = clazz.getConstructor();
      instance = constructor.newInstance();
    } catch (Exception e) {
      instance = (T) getUnsafe().allocateInstance(clazz);
    }
    return instance;
  }

  private <T> T fillInstance(T instance, JSONObject json) throws ReflectiveOperationException {
    for (Class<?> type = instance.getClass(); type != Object.class; type = type.getSuperclass()) {
      Field field = getField(type, "propertyChangeSupport");
      if (field != null) {
        field.set(instance, new PropertyChangeSupport(instance));
      }
    }

    for (String key : json.keySet()) {
      Object value = json.get(key);
      Field field = getField(instance.getClass(), key);
      if (field != null && !value.equals(JSONObject.NULL)) {
        System.out.println("deserializing "+key+" --- "+field + " " + instance.getClass());
        field.set(instance, deserialize(field.getType(), value));
      }
    }

    if (instance instanceof HomeFurnitureGroup) {
      // Convert ids to furniture
      List furniture = (List)getField(instance.getClass(), "furniture").get(instance);
      for (int i = 0; i < furniture.size(); i++) {
        furniture.set(i, homeObjects.get(furniture.get(i)));
      }
      getMethod(instance.getClass(), "addFurnitureListener").invoke(instance);
    }
    return instance;
  }

  /**
   * Desearializes a list of edits passed as a JSON string.
   *
   * @param jsonEdits the edits as a JSON string
   * @return a list of undoable edits (to be applied to the target home)
   */
  public List<UndoableEdit> deserializeEdits(String jsonEdits) throws JSONException, ReflectiveOperationException {
    JSONArray jsonArray = new JSONArray(jsonEdits);
    List<UndoableEdit> list = new ArrayList<UndoableEdit>();
    // System.out.println("deserializing "+jsonArray.length()+" edit(s)");
    for (int i = 0; i < jsonArray.length(); i++) {
      list.add(deserializeObject(UndoableEdit.class, jsonArray.getJSONObject(i)));
    }
    return list;
  }
}
