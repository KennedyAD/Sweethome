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
import java.io.IOException;
import java.io.OutputStream;
import java.lang.reflect.Array;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.swing.undo.UndoableEdit;

import org.json.JSONArray;
import org.json.JSONObject;

import com.eteks.sweethome3d.model.Content;
import com.eteks.sweethome3d.model.DimensionLine;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomeObject;
import com.eteks.sweethome3d.model.HomePieceOfFurniture;
import com.eteks.sweethome3d.model.HomeRecorder;
import com.eteks.sweethome3d.model.Selectable;
import com.eteks.sweethome3d.model.TextStyle;
import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.tools.URLContent;
import com.eteks.sweethome3d.viewcontroller.HomeController;
import com.eteks.sweethome3d.viewcontroller.PlanController;
import com.eteks.sweethome3d.viewcontroller.PlanController.EditableProperty;
import com.eteks.sweethome3d.viewcontroller.PlanView;
import com.eteks.sweethome3d.viewcontroller.View;
import com.eteks.sweethome3d.viewcontroller.ViewFactoryAdapter;

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
        + "{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.PolylineResizingUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoPolylineResizeName\",\"controller\":true,\"oldX\":-55.91092,\"oldY\":177.5383,\"polyline\":\"polyline-778b729f-47a8-4c70-a086-be423eceba59\",\"pointIndex\":1,\"newX\":-80.99411,\"newY\":165.1319}"
        + ","
        + "{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.ItemsMovingUndoableEdit\",\"controller\":true,\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoMoveSelectionName\",\"oldSelection\":[\"polyline-778b729f-47a8-4c70-a086-be423eceba59\"],\"allLevelsSelection\":false,\"itemsArray\":[\"polyline-778b729f-47a8-4c70-a086-be423eceba59\"],\"dx\":-18.666666666666657,\"dy\":-6.666666666666629}"
        + ","
        + "{\"_type\":\"com.eteks.sweethome3d.viewcontroller.LabelController.LabelModificationUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoModifyLabelsName\",\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\",\"oldSelection\":[\"label-8ffffcc7-1222-42e9-80ed-ddc1ab07856e\"],\"modifiedLabels\":[{\"_type\":\"com.eteks.sweethome3d.viewcontroller.LabelController.ModifiedLabel\",\"label\":\"label-8ffffcc7-1222-42e9-80ed-ddc1ab07856e\",\"text\":\"Sloping wall\\nwith\\nblack top in 3D\",\"style\":{\"_type\":\"com.eteks.sweethome3d.model.TextStyle\",\"fontName\":null,\"fontSize\":18,\"bold\":false,\"italic\":false,\"alignment\":0},\"color\":null,\"pitch\":0,\"elevation\":0}],\"text\":\"Sloping wall2\\nwith\\nblack top in 3D\",\"alignment\":0,\"fontName\":null,\"fontNameSet\":true,\"fontSize\":18,\"defaultStyle\":{\"_type\":\"com.eteks.sweethome3d.model.TextStyle\",\"fontName\":null,\"fontSize\":18,\"bold\":false,\"italic\":false,\"alignment\":1},\"color\":null,\"pitch\":0,\"pitchEnabled\":true,\"elevation\":0}"
        + ","
        + "{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.TextStyleModificationUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoModifyTextStyleName\",\"controller\":true,\"oldSelection\":[\"label-8ffffcc7-1222-42e9-80ed-ddc1ab07856e\"],\"allLevelsSelection\":false,\"oldStyles\":[{\"_type\":\"com.eteks.sweethome3d.model.TextStyle\",\"fontName\":null,\"fontSize\":18,\"bold\":false,\"italic\":false,\"alignment\":0}],\"items\":[\"label-8ffffcc7-1222-42e9-80ed-ddc1ab07856e\"],\"styles\":[{\"_type\":\"com.eteks.sweethome3d.model.TextStyle\",\"fontName\":null,\"fontSize\":18,\"bold\":false,\"italic\":true,\"alignment\":0}]}"
        + ","
        + "{\"_type\":\"javax.swing.undo.CompoundEdit\",\"hasBeenDone\":true,\"alive\":true,\"inProgress\":false,\"edits\":[{\"_type\":\"com.eteks.sweethome3d.viewcontroller.FurnitureController.FurnitureAdditionUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoAddFurnitureName\",\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\",\"allLevelsSelection\":false,\"oldSelection\":[],\"oldBasePlanLocked\":false,\"newFurniture\":[\"pieceOfFurniture-6db92359-c5e0-4120-9125-b6a6b5dff31b\"],\"newFurnitureIndex\":[5],\"newFurnitureGroups\":null,\"newFurnitureLevels\":null,\"furnitureLevel\":null,\"newBasePlanLocked\":false},{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.ItemsAdditionEndUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoAddItemsName\",\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\",\"items\":[\"pieceOfFurniture-6db92359-c5e0-4120-9125-b6a6b5dff31b\"]},{\"_type\":\"com.eteks.sweethome3d.viewcontroller.LocalizedUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoDropName\"}],\"_newObjects\":{\"pieceOfFurniture-6db92359-c5e0-4120-9125-b6a6b5dff31b\":{\"_type\":\"com.eteks.sweethome3d.model.HomePieceOfFurniture\",\"id\":\"pieceOfFurniture-6db92359-c5e0-4120-9125-b6a6b5dff31b\",\"catalogId\":\"eTeks#bed\",\"name\":\"Bed\",\"nameVisible\":false,\"nameXOffset\":0,\"nameYOffset\":0,\"nameStyle\":null,\"nameAngle\":0,\"description\":null,\"information\":null,\"icon\":{\"url\":\"lib/resources/furniture/bed.png\"},\"planIcon\":null,\"model\":{\"url\":\"jar:lib/resources/furniture/bed.zip!/bed.obj\"},\"modelSize\":24868,\"width\":144.6,\"widthInPlan\":144.6,\"depth\":193.10000000000002,\"depthInPlan\":193.10000000000002,\"height\":52.800000000000004,\"heightInPlan\":52.800000000000004,\"elevation\":0,\"dropOnTopElevation\":0.8390151515151515,\"movable\":true,\"doorOrWindow\":false,\"modelMaterials\":null,\"color\":null,\"texture\":null,\"shininess\":null,\"modelRotation\":[[1,0,0],[0,1,0],[0,0,1]],\"modelCenteredAtOrigin\":true,\"modelTransformations\":null,\"staircaseCutOutShape\":null,\"creator\":\"eTeks\",\"backFaceShown\":false,\"resizable\":true,\"deformable\":true,\"texturable\":true,\"horizontallyRotatable\":true,\"price\":null,\"valueAddedTaxPercentage\":null,\"currency\":null,\"visible\":true,\"x\":584.8154773374969,\"y\":97.940583,\"angle\":0,\"pitch\":0,\"roll\":0,\"modelMirrored\":false,\"level\":null,\"shapeCache\":{\"_type\":\"java.awt.geom.GeneralPath\",\"pointTypes\":[0,1,1,1,1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"numTypes\":6,\"numCoords\":10,\"windingRule\":1,\"floatCoords\":[512.5154773374969,1.3905829999999924,657.1154773374969,1.3905829999999924,657.1154773374969,194.49058300000002,512.5154773374969,194.49058300000002,512.5154773374969,1.3905829999999924,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}}}}"
        + ","
        + "{\"_type\":\"javax.swing.undo.CompoundEdit\",\"hasBeenDone\":true,\"alive\":true,\"inProgress\":false,\"edits\":[{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.ItemsDeletionStartUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"controller\":true,\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\",\"allLevelsSelection\":false,\"selectedItems\":[\"pieceOfFurniture-6b4c53e1-745e-4581-930b-c8e3a07a0d6b\"]},{\"_type\":\"com.eteks.sweethome3d.viewcontroller.FurnitureController.FurnitureDeletionUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoDeleteSelectionName\",\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\",\"oldSelection\":[\"pieceOfFurniture-6b4c53e1-745e-4581-930b-c8e3a07a0d6b\"],\"basePlanLocked\":false,\"allLevelsSelection\":false,\"furniture\":[\"pieceOfFurniture-6b4c53e1-745e-4581-930b-c8e3a07a0d6b\"],\"furnitureIndex\":[4],\"furnitureGroups\":[null],\"furnitureLevels\":[null]},{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.ItemsDeletionUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoDeleteSelectionName\",\"controller\":true,\"basePlanLocked\":false,\"allLevelsSelection\":false,\"deletedItems\":[],\"joinedDeletedWalls\":[],\"rooms\":[],\"roomsIndices\":[],\"roomsLevels\":[],\"dimensionLines\":[],\"dimensionLinesLevels\":[],\"polylines\":[],\"polylinesIndices\":[],\"polylinesLevels\":[],\"labels\":[],\"labelsLevels\":[]},{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.ItemsDeletionEndUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"controller\":true,\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\"}],\"_newObjects\":{}}"
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
    this.homeController = new HomeController(home, this.preferences, new ViewFactoryAdapter() {
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

  @SuppressWarnings("unchecked")
  private <T, U> T deserialize(Class<T> type, Object value) throws Exception {
    if (value instanceof JSONObject) {
      if (DefaultPatternTexture.class.getName().equals(((JSONObject) value).getString("_type"))) {
        value = this.preferences.getPatternsCatalog().getPattern(((JSONObject) value).getString("name"));
      } else if (Content.class.isAssignableFrom(type)) {
        String url = ((JSONObject) value).getString("url");
        if (url.startsWith("jar:")) {
          if (HomeURLContent.class.getName().equals(((JSONObject) value).getString("_type"))) {
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

  @SuppressWarnings("unchecked")
  private <T> T deserializeObject(Class<T> type, JSONObject json) throws Exception {
    T instance = null;
    Class<T> clazz = null;

    // Deserialize the objects created by the edit (placed in _newObject protocol
    // field)
    if (json.has("_newObjects")) {
      JSONObject map = json.getJSONObject("_newObjects");
      for (String key : map.keySet()) {
        homeObjects.put(key, deserializeObject(HomeObject.class, map.getJSONObject(key)));
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

    Field field = getField(clazz, "propertyChangeSupport");
    if(field != null) {
      field.set(instance, new PropertyChangeSupport(instance));
    }

    for (String key : json.keySet()) {
      Object value = json.get(key);
      field = getField(clazz, key);
      if(field != null && !value.equals(JSONObject.NULL)) {
        System.out.println("deserializing "+key+" --- "+field + " " + clazz);
        field.set(instance, deserialize(field.getType(), value));
      }
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

  // We need a dummy view for the controller because it calls setScale when
  // opening a new home.
  // TODO: check if we can just get rid of this by avoiding calling setScale when
  // the view is null.
  private static class DummyPlanView implements PlanView {
    @Override
    public boolean isFormatTypeSupported(FormatType formatType) {
      return false;
    }

    @Override
    public void exportData(OutputStream out, FormatType formatType, Properties settings) throws IOException {
    }

    @Override
    public Object createTransferData(DataType dataType) {
      return null;
    }

    @Override
    public void setRectangleFeedback(float x0, float y0, float x1, float y1) {
    }

    @Override
    public void makeSelectionVisible() {
    }

    @Override
    public void makePointVisible(float x, float y) {
    }

    @Override
    public float getScale() {
      return 0;
    }

    @Override
    public void setScale(float scale) {
    }

    @Override
    public float getPrintPreferredScale(float preferredWidth, float preferredHeight) {
      return 0;
    }

    @Override
    public void moveView(float dx, float dy) {
    }

    @Override
    public float convertXPixelToModel(int x) {
      return 0;
    }

    @Override
    public float convertYPixelToModel(int y) {
      return 0;
    }

    @Override
    public int convertXModelToScreen(float x) {
      return 0;
    }

    @Override
    public int convertYModelToScreen(float y) {
      return 0;
    }

    @Override
    public float getPixelLength() {
      return 0;
    }

    @Override
    public float[][] getTextBounds(String text, TextStyle style, float x, float y, float angle) {
      return null;
    }

    @Override
    public void setCursor(CursorType cursorType) {
    }

    @Override
    public void setToolTipFeedback(String toolTipFeedback, float x, float y) {
    }

    @Override
    public void setToolTipEditedProperties(EditableProperty[] toolTipEditedProperties, Object[] toolTipPropertyValues,
        float x, float y) {
    }

    @Override
    public void deleteToolTipFeedback() {
    }

    @Override
    public void setResizeIndicatorVisible(boolean resizeIndicatorVisible) {
    }

    @Override
    public void setAlignmentFeedback(Class<? extends Selectable> alignedObjectClass, Selectable alignedObject, float x,
        float y, boolean showPoint) {
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
      return null;
    }

    @Override
    public View getVerticalRuler() {
      return null;
    }

    @Override
    public boolean canImportDraggedItems(List<Selectable> items, int x, int y) {
      return false;
    }

    @Override
    public float[] getPieceOfFurnitureSizeInPlan(HomePieceOfFurniture piece) {
      return null;
    }

    @Override
    public boolean isFurnitureSizeInPlanSupported() {
      return false;
    }

  }

}
