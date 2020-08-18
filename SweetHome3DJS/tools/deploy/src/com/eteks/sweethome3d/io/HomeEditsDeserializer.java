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

import java.io.File;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.OutputStream;
import java.lang.reflect.Array;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;

import javax.swing.undo.CompoundEdit;
import javax.swing.undo.UndoableEdit;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.eteks.sweethome3d.model.Content;
import com.eteks.sweethome3d.model.DimensionLine;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomeObject;
import com.eteks.sweethome3d.model.HomePieceOfFurniture;
import com.eteks.sweethome3d.model.Selectable;
import com.eteks.sweethome3d.model.TextStyle;
import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.tools.SimpleURLContent;
import com.eteks.sweethome3d.tools.URLContent;
import com.eteks.sweethome3d.viewcontroller.HomeController;
import com.eteks.sweethome3d.viewcontroller.PlanController;
import com.eteks.sweethome3d.viewcontroller.PlanController.EditableProperty;
import com.eteks.sweethome3d.viewcontroller.PlanView;
import com.eteks.sweethome3d.viewcontroller.View;
import com.eteks.sweethome3d.viewcontroller.ViewFactoryAdapter;

import sun.misc.Unsafe;

/**
 * A class used to deserialize undoable edits sent from a SweetHome3D client
 * (see <code>IncrementalHomeRecorder</code>).
 *
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
    this.homeController = new HomeController(home, this.preferences,
        new ViewFactoryAdapter() {
          @Override
          public PlanView createPlanView(Home home, UserPreferences preferences, PlanController planController) {
            return new DummyPlanView();
          }
        });
    this.homeObjects = new HashMap<String, HomeObject>();
    for (HomeObject homeObject : home.getHomeObjects()) {
      this.homeObjects.put(homeObject.getId(), homeObject);
    }
  }

  /**
   * Applies a list of edits that have been deserialized. Most of the time, edits are
   * redone, but they maybe undone in case of an undo action.
   *
   * @param edits the list of edits to be run
   * @return the number of edits that have been applied
   */
  public int applyEdits(List<UndoableEdit> edits) {
    int count = 0;
    for (UndoableEdit edit : edits) {
      if (edit.canRedo()) {
        edit.redo();
        count++;
      } else {
        edit.undo();
        count++;
      }
    }
    return count;
  }

  private Unsafe unsafe = null;

  private Unsafe getUnsafe() {
    if (this.unsafe == null) {
      try {
        Field field = Unsafe.class.getDeclaredField("theUnsafe");
        field.setAccessible(true);
        this.unsafe = (Unsafe)field.get(null);
      } catch (ReflectiveOperationException ex) {
        ex.printStackTrace();
      }
    }
    return this.unsafe;
  }

  private Field getField(Class<?> type, String name) {
    try {
      Field field = type.getDeclaredField(name);
      if (!field.isAccessible()) {
        field.setAccessible(true);
      }
      return field;
    } catch (NoSuchFieldException ex) {
      if (type.getSuperclass() != Object.class) {
        return getField(type.getSuperclass(), name);
      }
    }
    return null;
  }

  private List<Field> getDeclaredFields(Class<?> type) {
    List<Field> result = new ArrayList<Field>();
    Field[] fields = type.getDeclaredFields();
    for (Field field : fields) {
      if (!field.isAccessible()) {
        field.setAccessible(true);
      }
      result.add(field);
    }
    return result;
  }

  private Method getDeclaredMethod(Class<?> type, String name, Class<?> ... parameterTypes) {
    try {
      Method method = type.getDeclaredMethod(name, parameterTypes);
      if (!method.isAccessible()) {
        method.setAccessible(true);
      }
      return method;
    } catch (NoSuchMethodException ex) {
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  private <T> T deserialize(Type valueType, Object jsonValue, boolean undo) throws ReflectiveOperationException  {
    Class<T> valueClass = valueType instanceof Class<?> ? (Class<T>)valueType : null;
    if (valueClass == null && (valueType instanceof ParameterizedType)) {
      if (((ParameterizedType)valueType).getRawType() == Map.class) {
        valueType = Map.class;
        valueClass = (Class<T>)valueType;
      }
    }
    Object value;
    if (jsonValue instanceof JSONObject) {
      JSONObject jsonObject = (JSONObject)jsonValue;
      String jsonObjectType = jsonObject.has("_type")
          ? jsonObject.getString("_type") : null;
      if (DefaultPatternTexture.class.getName().equals(jsonObjectType)) {
        try {
          value = this.preferences.getPatternsCatalog().getPattern(jsonObject.getString("name"));
        } catch (IllegalArgumentException ex) {
          value = null; // Ignore unknown pattern
        }
      } else if (valueClass != null
                 && BigDecimal.class.isAssignableFrom(valueClass)) {
        value = new BigDecimal(jsonObject.getString("value"));
      } else if (valueClass != null
                 && Content.class.isAssignableFrom(valueClass)) {
        String url = jsonObject.getString("url");
        try {
          if (SimpleURLContent.class.getName().equals(jsonObjectType)) {
            value = new SimpleURLContent(new URL(url.contains("://")
                ? url
                : "jar:" + this.homeFile.toURI().toURL() + url.substring(url.indexOf("!/"))));
          } else if (HomeURLContent.class.getName().equals(jsonObjectType)) {
            value = new HomeURLContent(new URL("jar:" + this.homeFile.toURI().toURL() + url.substring(url.indexOf("!/"))));
          } else if (url.startsWith("jar:") && !url.contains("://")) {
            value = new URLContent(new URL("jar:" + baseUrl + "/" + url.substring(4)));
          } else if (url.contains(":")) {
            value = new URLContent(new URL(url));
          } else {
            value = new URLContent(new URL(baseUrl + "/" + url));
          }
        } catch (MalformedURLException ex) {
          throw new IllegalArgumentException("Can't build URL ", ex);
        }
      } else if (Map.class.isAssignableFrom(valueClass) ) {
        value = deserializeMap(valueClass, (JSONObject)jsonValue, undo);
      } else {
        value = deserializeObject(valueClass, (JSONObject)jsonValue, undo);
      }
    } else if (jsonValue instanceof JSONArray) {
      value = deserializeArray(valueType, (JSONArray)jsonValue, undo);
    } else if (jsonValue == JSONObject.NULL) {
      value = null;
    } else if (valueClass != null
               && (HomeObject.class.isAssignableFrom(valueClass) || Selectable.class.isAssignableFrom(valueClass))) {
      if (this.homeObjects.containsKey(jsonValue)) {
        value = (T)this.homeObjects.get(jsonValue);
      } else {
        throw new RuntimeException("Cannot find referenced home object " + valueType.getTypeName() + ": " + jsonValue);
      }
    } else if (valueClass != null
               && valueClass.isEnum()) {
      value = valueClass.getEnumConstants() [(Integer)jsonValue];
    } else if (float.class == valueType || Float.class == valueType) {
      value = ((Number)jsonValue).floatValue();
    } else if (int.class == valueType || Integer.class == valueType) {
      value = ((Number)jsonValue).intValue();
    } else if (long.class == valueType || Long.class == valueType) {
      value = ((Number)jsonValue).longValue();
    } else if (byte.class == valueType || Byte.class == valueType) {
      value = ((Number)jsonValue).byteValue();
    } else if (short.class == valueType || Short.class == valueType) {
      value = ((Number)jsonValue).shortValue();
    } else {
      value = jsonValue;
    }
    return (T)value;
  }

  private Map<String, Object> deserializeMap(Class<?> type, JSONObject jsonMap, boolean undo) throws ReflectiveOperationException {
    Map<String, Object> map = new HashMap<String, Object>();
    for (String key : jsonMap.keySet()) {
      map.put(key, deserialize(Object.class, jsonMap.get(key), undo));
    }
    return map;
  }

  @SuppressWarnings("unchecked")
  private <T> T deserializeArray(Type arrayType, JSONArray jsonArray, boolean undo) throws ReflectiveOperationException, JSONException {
    Class<T> arrayClass = arrayType instanceof Class<?> ? (Class<T>)arrayType : null;
    if (arrayClass != null
        && arrayClass.isArray()) {
      Object array = Array.newInstance(arrayClass.getComponentType(), jsonArray.length());
      for (int i = 0; i < jsonArray.length(); i++) {
        Array.set(array, i, deserialize(arrayClass.getComponentType(), jsonArray.get(i), undo));
      }
      return (T)array;
    } else if (arrayClass != null
                  && List.class.isAssignableFrom(arrayClass)
               || arrayType instanceof ParameterizedType
                   && ((ParameterizedType)arrayType).getRawType() instanceof Class<?>
                   && List.class.isAssignableFrom((Class<?>)((ParameterizedType)arrayType).getRawType())) {

      List<?> list;
      if (arrayClass != null
          && !arrayClass.isInterface()) {
        list = (List<?>)arrayClass.newInstance();
      } else if (arrayType instanceof ParameterizedType
                 && !((Class<?>)((ParameterizedType)arrayType).getRawType()).isInterface()) {
        list = (List<?>)((Class<?>)((ParameterizedType)arrayType).getRawType()).newInstance();
      } else {
        list = new ArrayList<>();
      }

      for (int i = 0; i < jsonArray.length(); i++) {
        list.add(deserialize(arrayType instanceof ParameterizedType
                ? ((ParameterizedType)arrayType).getActualTypeArguments() [0]
                : Object.class,
            jsonArray.get(i), undo));
      }
      return (T)list;
    } else {
      throw new RuntimeException("Unsupported collection type " + arrayType);
    }
  }

  private <T> T deserializeObject(Class<T> type, JSONObject json, boolean undo) throws ReflectiveOperationException {
    return fillInstance(createInstance(type, json, undo), json, undo);
  }

  @SuppressWarnings("unchecked")
  private <T> T createInstance(Class<T> defaultType, JSONObject jsonValue, boolean undo) throws ReflectiveOperationException, JSONException {
    Class<T> instanceType;

    // Deserialize the objects created by the edit (placed in _newObjects protocol field)
    if (jsonValue.has("_newObjects")) {
      JSONArray newObjects = jsonValue.getJSONArray("_newObjects");
      List<Entry<HomeObject, JSONObject>> homeObjectEntryList = new ArrayList<>();
      // Pass 1: create instances for new objects
      for (int i = 0; i < newObjects.length(); i++) {
        JSONObject jsonObject = newObjects.getJSONObject(i);
        HomeObject homeObject = createInstance(HomeObject.class, jsonObject, undo);
        this.homeObjects.put(jsonObject.getString("id"), homeObject);
        // Instance initialization shall apply in reverse order
        homeObjectEntryList.add(0, new AbstractMap.SimpleEntry<>(homeObject, jsonObject));
      }

      // Pass 2: fill instances for new objects (instances have been created in pass 1
      // so that (cross) references can be looked up)
      for (Entry<HomeObject, JSONObject> homeObjectEntry : homeObjectEntryList) {
        fillInstance(homeObjectEntry.getKey(), homeObjectEntry.getValue(), undo);
      }
    }

    if (jsonValue.has("_type")) {
      String typeName = jsonValue.getString("_type");
      String[] typeNameParts = typeName.split("\\.");

      if (Character.isUpperCase(typeNameParts[typeNameParts.length - 2].charAt(0))) {
        typeName = String.join(".", Arrays.copyOfRange(typeNameParts, 0, typeNameParts.length - 1));
        typeName += "$" + typeNameParts[typeNameParts.length - 1];
      }

      try {
        instanceType = (Class<T>)Class.forName(typeName);
      } catch (ClassNotFoundException ex) {
        // Should not happen
        throw new RuntimeException("Cannot find type " + typeName, ex);
      }
    } else {
      instanceType = defaultType;
    }

    try {
      Constructor<T> constructor = instanceType.getConstructor();
      return constructor.newInstance();
    } catch (ReflectiveOperationException ex) {
      return (T)getUnsafe().allocateInstance(instanceType);
    }
  }

  private <T> T defaultFillInstance(Class<?> type, T instance, JSONObject jsonObject, boolean undo) throws ReflectiveOperationException {
    for(Field field : getDeclaredFields(type)) {
      if (Home.class.isAssignableFrom(field.getType())) {
        field.set(instance, this.home);
      } else if (PlanController.class.isAssignableFrom(field.getType())) {
        field.set(instance, this.homeController.getPlanController());
      }
    }

    for (String key : jsonObject.keySet()) {
      Object jsonValue = jsonObject.get(key);
      Field field = getField(type, key);
      if (field != null && !jsonValue.equals(JSONObject.NULL)) {
        field.set(instance, deserialize(field.getGenericType(), jsonValue, undo));
      }
    }

    if (instance instanceof UndoableEdit) {
      getField(instance.getClass(), "hasBeenDone").set(instance, undo);
      getField(instance.getClass(), "alive").set(instance, true);
    }

    if (instance instanceof CompoundEdit) {
      getField(instance.getClass(), "inProgress").set(instance, false);
    }

    return instance;
  }

  private <T> T fillInstance(T instance, JSONObject jsonObject, boolean undo) throws ReflectiveOperationException {
    List<Class<?>> hierarchy = new ArrayList<Class<?>>();
    for (Class<?> type = instance.getClass(); type != Object.class; type = type.getSuperclass()) {
      hierarchy.add(0, type);
    }

    for (Class<?> type : hierarchy) {
      // Invoke readObject methods for local initializations if exists (otherwise fallback to default)
      Method readObjectMethod = getDeclaredMethod(type, "readObject", ObjectInputStream.class);
      if (readObjectMethod != null) {
        try {
          readObjectMethod.invoke(instance, new ObjectInputStream() {
            @Override
            public void defaultReadObject() throws IOException, ClassNotFoundException {
              try {
                defaultFillInstance(type, instance, jsonObject, undo);
              } catch (ReflectiveOperationException ex) {
                throw new IOException("Can't fill instance", ex);
              }
            }
          });
        } catch (IOException ex) {
          ex.printStackTrace();
        }
      } else {
        defaultFillInstance(type, instance, jsonObject, undo);
      }
    }

    return instance;
  }

  /**
   * Returns a list of edits deserialized from a JSON string.
   * @param jsonEdits the edits as a JSON string
   * @return a list of undoable edits (to be applied to the target home)
   */
  public List<UndoableEdit> deserializeEdits(String jsonEdits) throws JSONException, ReflectiveOperationException {
    JSONArray jsonEditsArray = new JSONArray(jsonEdits);
    List<UndoableEdit> edits = new ArrayList<UndoableEdit>();
    for (int i = 0; i < jsonEditsArray.length(); i++) {
      JSONObject jsonObject = jsonEditsArray.getJSONObject(i);
      edits.add(deserializeObject(UndoableEdit.class, jsonObject, jsonObject.has("_action") && "undo".equals(jsonObject.getString("_action"))));
    }
    return edits;
  }

  // Dummy view able to perform some plan controller tasks during undoable edits operations (setScale, makeSelectionVisible).
  // Scale is ignored and one pixel = one centimeter.
  private static class DummyPlanView implements PlanView {
    @Override
    public float getScale() {
      return 1;
    }

    @Override
    public void setScale(float scale) {
    }

    @Override
    public void makeSelectionVisible() {
    }

    @Override
    public void makePointVisible(float x, float y) {
    }

    @Override
    public void moveView(float dx, float dy) {
    }

    @Override
    public boolean isFormatTypeSupported(FormatType formatType) {
      return false;
    }

    @Override
    public void exportData(OutputStream out, FormatType formatType, Properties settings) throws IOException {
      throw new UnsupportedOperationException();
    }

    @Override
    public Object createTransferData(DataType dataType) {
      throw new UnsupportedOperationException();
    }

    @Override
    public float getPrintPreferredScale(float preferredWidth, float preferredHeight) {
      throw new UnsupportedOperationException();
    }

    @Override
    public float convertXPixelToModel(int x) {
      return x;
    }

    @Override
    public float convertYPixelToModel(int y) {
      return y;
    }

    @Override
    public int convertXModelToScreen(float x) {
      return (int)x;
    }

    @Override
    public int convertYModelToScreen(float y) {
      return (int)y;
    }

    @Override
    public float getPixelLength() {
      return 1;
    }

    @Override
    public float[][] getTextBounds(String text, TextStyle style, float x, float y, float angle) {
      throw new UnsupportedOperationException();
    }

    @Override
    public void setCursor(CursorType cursorType) {
    }

    @Override
    public void setRectangleFeedback(float x0, float y0, float x1, float y1) {
    }

    @Override
    public void setToolTipFeedback(String toolTipFeedback, float x, float y) {
    }

    @Override
    public void setToolTipEditedProperties(EditableProperty[] toolTipEditedProperties, Object[] toolTipPropertyValues, float x, float y) {
    }

    @Override
    public void deleteToolTipFeedback() {
    }

    @Override
    public void setResizeIndicatorVisible(boolean resizeIndicatorVisible) {
    }

    @Override
    public void setAlignmentFeedback(Class<? extends Selectable> alignedObjectClass, Selectable alignedObject,
                                     float x, float y, boolean showPoint) {
    }

    @Override
    public void setAngleFeedback(float xCenter, float yCenter, float x1, float y1, float x2, float y2) {
    }

    @Override
    public void setDraggedItemsFeedback(List<Selectable> draggedItems) {
    }

    @Override
    public void setDimensionLinesFeedback(List<DimensionLine> dimensionLines) {
    }

    @Override
    public void deleteFeedback() {
    }

    @Override
    public View getHorizontalRuler() {
      throw new UnsupportedOperationException();
    }

    @Override
    public View getVerticalRuler() {
      throw new UnsupportedOperationException();
    }

    @Override
    public boolean canImportDraggedItems(List<Selectable> items, int x, int y) {
      throw new UnsupportedOperationException();
    }

    @Override
    public float[] getPieceOfFurnitureSizeInPlan(HomePieceOfFurniture piece) {
      if (piece.getRoll() == 0 && piece.getPitch() == 0) {
        return new float [] {piece.getWidth(), piece.getDepth(), piece.getHeight()};
      } else {
        return null; // Size in plan will be computed proportionally or reset by undoable edit
      }
    }

    @Override
    public boolean isFurnitureSizeInPlanSupported() {
      return false;
    }
  }
}
