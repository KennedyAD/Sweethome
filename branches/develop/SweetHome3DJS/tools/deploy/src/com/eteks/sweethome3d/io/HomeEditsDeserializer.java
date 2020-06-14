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
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.swing.undo.UndoableEdit;

import org.json.JSONArray;
import org.json.JSONObject;

import com.eteks.sweethome3d.model.Content;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomeFurnitureGroup;
import com.eteks.sweethome3d.model.HomeObject;
import com.eteks.sweethome3d.model.HomeRecorder;
import com.eteks.sweethome3d.model.Selectable;
import com.eteks.sweethome3d.swing.SwingViewFactory;
import com.eteks.sweethome3d.tools.URLContent;
import com.eteks.sweethome3d.viewcontroller.HomeController;
import com.eteks.sweethome3d.viewcontroller.PlanController;

import sun.misc.Unsafe;

/**
 * A class to deserialize undoable edits sent from a SweetHome3D client (see
 * IncrementalHomeRecorder).
 *
 * @author Renaud Pawlak
 */
public class HomeEditsDeserializer {

  // TODO: create JUnit tests instead
  public static void main(String[] args) throws Exception {
    HomeRecorder recorder = new HomeFileRecorder(0, false, null, false, true);
    File file = new File("test/resources/HomeTest.sh3d");
    Home home = recorder.readHome(file.getPath());
    List<UndoableEdit> edits = new HomeEditsDeserializer(home, file,
        new File(".").toURI().toURL().toString()).deserializeEdits(
          "["
//        + "{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.PolylineResizingUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoPolylineResizeName\",\"controller\":true,\"oldX\":-55.91092,\"oldY\":177.5383,\"polyline\":\"polyline-778b729f-47a8-4c70-a086-be423eceba59\",\"pointIndex\":1,\"newX\":-80.99411,\"newY\":165.1319}"
//        + ","
//        + "{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.ItemsMovingUndoableEdit\",\"controller\":true,\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoMoveSelectionName\",\"oldSelection\":[\"polyline-778b729f-47a8-4c70-a086-be423eceba59\"],\"allLevelsSelection\":false,\"itemsArray\":[\"polyline-778b729f-47a8-4c70-a086-be423eceba59\"],\"dx\":-18.666666666666657,\"dy\":-6.666666666666629}"
//        + ","
//        + "{\"_type\":\"com.eteks.sweethome3d.viewcontroller.LabelController.LabelModificationUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoModifyLabelsName\",\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\",\"oldSelection\":[\"label-8ffffcc7-1222-42e9-80ed-ddc1ab07856e\"],\"modifiedLabels\":[{\"_type\":\"com.eteks.sweethome3d.viewcontroller.LabelController.ModifiedLabel\",\"label\":\"label-8ffffcc7-1222-42e9-80ed-ddc1ab07856e\",\"text\":\"Sloping wall\\nwith\\nblack top in 3D\",\"style\":{\"_type\":\"com.eteks.sweethome3d.model.TextStyle\",\"fontName\":null,\"fontSize\":18,\"bold\":false,\"italic\":false,\"alignment\":0},\"color\":null,\"pitch\":0,\"elevation\":0}],\"text\":\"Sloping wall2\\nwith\\nblack top in 3D\",\"alignment\":0,\"fontName\":null,\"fontNameSet\":true,\"fontSize\":18,\"defaultStyle\":{\"_type\":\"com.eteks.sweethome3d.model.TextStyle\",\"fontName\":null,\"fontSize\":18,\"bold\":false,\"italic\":false,\"alignment\":1},\"color\":null,\"pitch\":0,\"pitchEnabled\":true,\"elevation\":0}"
//        + ","
//        + "{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.TextStyleModificationUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoModifyTextStyleName\",\"controller\":true,\"oldSelection\":[\"label-8ffffcc7-1222-42e9-80ed-ddc1ab07856e\"],\"allLevelsSelection\":false,\"oldStyles\":[{\"_type\":\"com.eteks.sweethome3d.model.TextStyle\",\"fontName\":null,\"fontSize\":18,\"bold\":false,\"italic\":false,\"alignment\":0}],\"items\":[\"label-8ffffcc7-1222-42e9-80ed-ddc1ab07856e\"],\"styles\":[{\"_type\":\"com.eteks.sweethome3d.model.TextStyle\",\"fontName\":null,\"fontSize\":18,\"bold\":false,\"italic\":true,\"alignment\":0}]}"
//        + ","
//        + "{\"_type\":\"javax.swing.undo.CompoundEdit\",\"hasBeenDone\":true,\"alive\":true,\"inProgress\":false,\"edits\":[{\"_type\":\"com.eteks.sweethome3d.viewcontroller.FurnitureController.FurnitureAdditionUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoAddFurnitureName\",\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\",\"allLevelsSelection\":false,\"oldSelection\":[],\"oldBasePlanLocked\":false,\"newFurniture\":[\"pieceOfFurniture-6db92359-c5e0-4120-9125-b6a6b5dff31b\"],\"newFurnitureIndex\":[5],\"newFurnitureGroups\":null,\"newFurnitureLevels\":null,\"furnitureLevel\":null,\"newBasePlanLocked\":false},{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.ItemsAdditionEndUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoAddItemsName\",\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\",\"items\":[\"pieceOfFurniture-6db92359-c5e0-4120-9125-b6a6b5dff31b\"]},{\"_type\":\"com.eteks.sweethome3d.viewcontroller.LocalizedUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoDropName\"}],\"_newObjects\":{\"pieceOfFurniture-6db92359-c5e0-4120-9125-b6a6b5dff31b\":{\"_type\":\"com.eteks.sweethome3d.model.HomePieceOfFurniture\",\"id\":\"pieceOfFurniture-6db92359-c5e0-4120-9125-b6a6b5dff31b\",\"catalogId\":\"eTeks#bed\",\"name\":\"Bed\",\"nameVisible\":false,\"nameXOffset\":0,\"nameYOffset\":0,\"nameStyle\":null,\"nameAngle\":0,\"description\":null,\"information\":null,\"icon\":{\"url\":\"lib/resources/furniture/bed.png\"},\"planIcon\":null,\"model\":{\"url\":\"jar:lib/resources/furniture/bed.zip!/bed.obj\"},\"modelSize\":24868,\"width\":144.6,\"widthInPlan\":144.6,\"depth\":193.10000000000002,\"depthInPlan\":193.10000000000002,\"height\":52.800000000000004,\"heightInPlan\":52.800000000000004,\"elevation\":0,\"dropOnTopElevation\":0.8390151515151515,\"movable\":true,\"doorOrWindow\":false,\"modelMaterials\":null,\"color\":null,\"texture\":null,\"shininess\":null,\"modelRotation\":[[1,0,0],[0,1,0],[0,0,1]],\"modelCenteredAtOrigin\":true,\"modelTransformations\":null,\"staircaseCutOutShape\":null,\"creator\":\"eTeks\",\"backFaceShown\":false,\"resizable\":true,\"deformable\":true,\"texturable\":true,\"horizontallyRotatable\":true,\"price\":null,\"valueAddedTaxPercentage\":null,\"currency\":null,\"visible\":true,\"x\":584.8154773374969,\"y\":97.940583,\"angle\":0,\"pitch\":0,\"roll\":0,\"modelMirrored\":false,\"level\":null,\"shapeCache\":{\"_type\":\"java.awt.geom.GeneralPath\",\"pointTypes\":[0,1,1,1,1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"numTypes\":6,\"numCoords\":10,\"windingRule\":1,\"floatCoords\":[512.5154773374969,1.3905829999999924,657.1154773374969,1.3905829999999924,657.1154773374969,194.49058300000002,512.5154773374969,194.49058300000002,512.5154773374969,1.3905829999999924,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}}}}"
//        + ","
//        + "{\"_type\":\"javax.swing.undo.CompoundEdit\",\"hasBeenDone\":true,\"alive\":true,\"inProgress\":false,\"edits\":[{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.ItemsDeletionStartUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"controller\":true,\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\",\"allLevelsSelection\":false,\"selectedItems\":[\"pieceOfFurniture-6b4c53e1-745e-4581-930b-c8e3a07a0d6b\"]},{\"_type\":\"com.eteks.sweethome3d.viewcontroller.FurnitureController.FurnitureDeletionUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoDeleteSelectionName\",\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\",\"oldSelection\":[\"pieceOfFurniture-6b4c53e1-745e-4581-930b-c8e3a07a0d6b\"],\"basePlanLocked\":false,\"allLevelsSelection\":false,\"furniture\":[\"pieceOfFurniture-6b4c53e1-745e-4581-930b-c8e3a07a0d6b\"],\"furnitureIndex\":[4],\"furnitureGroups\":[null],\"furnitureLevels\":[null]},{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.ItemsDeletionUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoDeleteSelectionName\",\"controller\":true,\"basePlanLocked\":false,\"allLevelsSelection\":false,\"deletedItems\":[],\"joinedDeletedWalls\":[],\"rooms\":[],\"roomsIndices\":[],\"roomsLevels\":[],\"dimensionLines\":[],\"dimensionLinesLevels\":[],\"polylines\":[],\"polylinesIndices\":[],\"polylinesLevels\":[],\"labels\":[],\"labelsLevels\":[]},{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.ItemsDeletionEndUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"controller\":true,\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\"}],\"_newObjects\":{}}"
//        + ","
        + "{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.WallsCreationUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoCreateWallsName\",\"controller\":true,\"oldSelection\":[],\"oldBasePlanLocked\":false,\"oldAllLevelsSelection\":false,\"joinedNewWalls\":[{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.JoinedWall\",\"wall\":\"wall-54ba7ea8-209c-4c21-a893-8af415384cbb\",\"level\":null,\"xStart\":500.5154773374969,\"yStart\":100.07811,\"xEnd\":500.5154773374969,\"yEnd\":200.07810999999998,\"wallAtStart\":null,\"wallAtEnd\":\"wall-2b544c33-2388-4684-8a33-2913d5dff095\",\"joinedAtEndOfWallAtStart\":false,\"joinedAtStartOfWallAtEnd\":true},{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.JoinedWall\",\"wall\":\"wall-2b544c33-2388-4684-8a33-2913d5dff095\",\"level\":null,\"xStart\":500.5154773374969,\"yStart\":200.07810999999998,\"xEnd\":597.5154773374969,\"yEnd\":200.07810999999998,\"wallAtStart\":\"wall-54ba7ea8-209c-4c21-a893-8af415384cbb\",\"wallAtEnd\":null,\"joinedAtEndOfWallAtStart\":true,\"joinedAtStartOfWallAtEnd\":false}],\"newBasePlanLocked\":false,\"_newObjects\":{\"wall-54ba7ea8-209c-4c21-a893-8af415384cbb\":{\"_type\":\"com.eteks.sweethome3d.model.Wall\",\"id\":\"wall-54ba7ea8-209c-4c21-a893-8af415384cbb\",\"xStart\":500.5154773374969,\"yStart\":100.07811,\"xEnd\":500.5154773374969,\"yEnd\":200.07810999999998,\"arcExtent\":null,\"wallAtStart\":null,\"wallAtEnd\":\"wall-2b544c33-2388-4684-8a33-2913d5dff095\",\"thickness\":7.5,\"height\":250,\"heightAtEnd\":null,\"leftSideColor\":null,\"leftSideTexture\":null,\"leftSideShininess\":0,\"leftSideBaseboard\":null,\"rightSideColor\":null,\"rightSideTexture\":null,\"rightSideShininess\":0,\"rightSideBaseboard\":null,\"pattern\":{\"_type\":\"com.eteks.sweethome3d.io.DefaultPatternTexture\",\"name\":\"hatchUp\",\"image\":{\"_type\":\"com.eteks.sweethome3d.tools.URLContent\",\"url\":\"file:///Users/renaudpawlak/Documents/workspace-sh3d/SweetHome3DJS/lib//resources/patterns/hatchUp.png\"}},\"topColor\":null,\"level\":null,\"shapeCache\":{\"_type\":\"java.awt.geom.GeneralPath\",\"pointTypes\":[0,1,1,1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"numTypes\":5,\"numCoords\":8,\"windingRule\":1,\"floatCoords\":[504.2654773374969,100.07811,504.2654773374969,196.32810999999998,496.7654773374969,203.82810999999998,496.7654773374969,100.07811,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},\"arcCircleCenterCache\":null,\"pointsCache\":[[504.2654773374969,100.07811],[504.2654773374969,196.32810999999998],[496.7654773374969,203.82810999999998],[496.7654773374969,100.07811]],\"pointsIncludingBaseboardsCache\":null,\"symmetric\":true},\"wall-2b544c33-2388-4684-8a33-2913d5dff095\":{\"_type\":\"com.eteks.sweethome3d.model.Wall\",\"id\":\"wall-2b544c33-2388-4684-8a33-2913d5dff095\",\"xStart\":500.5154773374969,\"yStart\":200.07810999999998,\"xEnd\":597.5154773374969,\"yEnd\":200.07810999999998,\"arcExtent\":null,\"wallAtStart\":\"wall-54ba7ea8-209c-4c21-a893-8af415384cbb\",\"wallAtEnd\":null,\"thickness\":7.5,\"height\":250,\"heightAtEnd\":null,\"leftSideColor\":null,\"leftSideTexture\":null,\"leftSideShininess\":0,\"leftSideBaseboard\":null,\"rightSideColor\":null,\"rightSideTexture\":null,\"rightSideShininess\":0,\"rightSideBaseboard\":null,\"pattern\":{\"_type\":\"com.eteks.sweethome3d.io.DefaultPatternTexture\",\"name\":\"hatchUp\",\"image\":{\"_type\":\"com.eteks.sweethome3d.tools.URLContent\",\"url\":\"file:///Users/renaudpawlak/Documents/workspace-sh3d/SweetHome3DJS/lib//resources/patterns/hatchUp.png\"}},\"topColor\":null,\"level\":null,\"shapeCache\":{\"_type\":\"java.awt.geom.GeneralPath\",\"pointTypes\":[0,1,1,1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"numTypes\":5,\"numCoords\":8,\"windingRule\":1,\"floatCoords\":[504.2654773374969,196.32810999999998,597.5154773374969,196.32810999999998,597.5154773374969,203.82810999999998,496.7654773374969,203.82810999999998,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},\"arcCircleCenterCache\":null,\"pointsCache\":[[504.2654773374969,196.32810999999998],[597.5154773374969,196.32810999999998],[597.5154773374969,203.82810999999998],[496.7654773374969,203.82810999999998]],\"pointsIncludingBaseboardsCache\":null,\"symmetric\":true}}}"
        + "]"
    );
    System.out.println(edits);
    for (UndoableEdit edit : edits) {
      edit.redo();
    }
    recorder.writeHome(home, "test/resources/HomeTest2.sh3d");
  }

  private Home home;
  private File homeFile;
  private String baseUrl;
  private DefaultUserPreferences preferences;
  private HomeController homeController;
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

  private Field getField(Class<?> clazz, String name) {
    try {
      Field field = clazz.getDeclaredField(name);
      if (!field.isAccessible()) {
        field.setAccessible(true);
      }
      return field;
    } catch (NoSuchFieldException e) {
      if (clazz.getSuperclass() != Object.class) {
        return getField(clazz.getSuperclass(), name);
      }
    }
    return null;
  }

  private Method getMethod(Class<?> clazz, String name, Class<?> ... parameterTypes) {
    try {
      Method method = clazz.getDeclaredMethod(name, parameterTypes);
      if (!method.isAccessible()) {
        method.setAccessible(true);
      }
      return method;
    } catch (NoSuchMethodException e) {
      if (clazz.getSuperclass() != Object.class) {
        return getMethod(clazz.getSuperclass(), name, parameterTypes);
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  private <T, U> T deserialize(Class<T> type, Object value) throws Exception {
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
        if (url.startsWith("jar:")) {
          if (HomeURLContent.class.getName().equals(jsonObject.getString("_type"))) {
            value = new HomeURLContent(new URL("jar:" + this.homeFile.toURI().toURL() + url.substring(url.indexOf("!/"))));
          } else {
            value = new URLContent(new URL("jar:" + baseUrl + "/" + url.substring(4)));
          }
        } else if (!url.contains(":")) {
          value = new URLContent(new URL(baseUrl + "/" + url));
        }
      } else {
        value = deserializeObject(type, (JSONObject) value);
      }
    } else if (value instanceof JSONArray) {
      value = deserializeArray(type, (JSONArray) value);
    } else {
      if (value == JSONObject.NULL) {
        value = null;
      } else if (HomeObject.class.isAssignableFrom(type) || Selectable.class.isAssignableFrom(type)) {
        if (homeObjects.containsKey(value)) {
          value = (T) homeObjects.get(value);
        } else {
          throw new RuntimeException("Cannot find referenced home object " + type + ": " + value);
        }
      } else if(Home.class.isAssignableFrom(type)) {
        // TODO: check that the URL is consistent
        value = home;
      } else if (type.isEnum()) {
        value = Array.get(type.getMethod("values").invoke(null), (Integer)value);
      } else if (PlanController.class.isAssignableFrom(type)) {
        value = homeController.getPlanController();
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
  private <T> T deserializeArray(Class<T> type, JSONArray json) throws Exception {
    if (type.isArray()) {
      Object target = Array.newInstance(type.getComponentType(), json.length());
      for (int i = 0; i < json.length(); i++) {
        Array.set(target, i, deserialize(type.getComponentType(), json.get(i)));
      }
      return (T) target;
    } else if (List.class.isAssignableFrom(type)) {
      List<Object> target;
      if(type.isInterface()) {
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

  private <T> T deserializeObject(Class<T> type, JSONObject json) throws Exception {
    return fillInstance(createInstance(type, json), json);
  }

  @SuppressWarnings("unchecked")
  private <T> T createInstance(Class<T> type, JSONObject json) throws Exception {
    T instance = null;
    Class<T> clazz = null;

    // Deserialize the objects created by the edit (placed in _newObject protocol
    // field)
    if (json.has("_newObjects")) {
      JSONObject map = json.getJSONObject("_newObjects");
      // Pass 1: create instances for new objects
      for (String key : map.keySet()) {
        homeObjects.put(key, createInstance(HomeObject.class, map.getJSONObject(key)));
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
        clazz = (Class<T>) Class.forName(typeName);
      } catch (Exception e) {
        // Should not happen
        throw new RuntimeException("Cannot find type " + typeName, e);
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

  private <T> T fillInstance(T instance, JSONObject json) throws Exception {
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
  public List<UndoableEdit> deserializeEdits(String jsonEdits) throws Exception {

    JSONArray jsonArray = new JSONArray(jsonEdits);
    List<UndoableEdit> list = new ArrayList<UndoableEdit>();
    // System.out.println("deserializing "+jsonArray.length()+" edit(s)");
    for (int i = 0; i < jsonArray.length(); i++) {
      list.add(deserializeObject(UndoableEdit.class, jsonArray.getJSONObject(i)));
    }
    return list;
  }
}
