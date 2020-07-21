/*
ben et JSweet ? * HomeEditsDeserializer.java - 11 June 2020
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

import java.io.IOException;
import java.io.OutputStream;
import java.lang.reflect.Type;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.swing.undo.UndoableEdit;

import com.eteks.sweethome3d.model.Camera;
import com.eteks.sweethome3d.model.Compass;
import com.eteks.sweethome3d.model.Content;
import com.eteks.sweethome3d.model.DimensionLine;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomeDoorOrWindow;
import com.eteks.sweethome3d.model.HomeEnvironment;
import com.eteks.sweethome3d.model.HomeFurnitureGroup;
import com.eteks.sweethome3d.model.HomeLight;
import com.eteks.sweethome3d.model.HomeObject;
import com.eteks.sweethome3d.model.HomePieceOfFurniture;
import com.eteks.sweethome3d.model.HomeRecorder;
import com.eteks.sweethome3d.model.Label;
import com.eteks.sweethome3d.model.Level;
import com.eteks.sweethome3d.model.ObserverCamera;
import com.eteks.sweethome3d.model.Polyline;
import com.eteks.sweethome3d.model.Room;
import com.eteks.sweethome3d.model.Selectable;
import com.eteks.sweethome3d.model.TextStyle;
import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.model.Wall;
import com.eteks.sweethome3d.tools.URLContent;
import com.eteks.sweethome3d.viewcontroller.HomeController;
import com.eteks.sweethome3d.viewcontroller.PlanController;
import com.eteks.sweethome3d.viewcontroller.PlanController.EditableProperty;
import com.eteks.sweethome3d.viewcontroller.PlanView;
import com.eteks.sweethome3d.viewcontroller.View;
import com.eteks.sweethome3d.viewcontroller.ViewFactoryAdapter;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParseException;
import com.google.gson.reflect.TypeToken;

/**
 * A class to deserialize undoable edits sent from a SweetHome3D client (see
 * IncrementalHomeRecorder).
 *
 * @author Renaud Pawlak
 */
public class HomeEditsDeserializerGson {

  // TODO: create JUnit tests instead
  public static void main(String[] args) throws Exception {
    HomeRecorder recorder = new HomeFileRecorder(0, false, null, false, true);
    Home home = recorder.readHome("test/resources/HomeTest.sh3d");
    List<UndoableEdit> edits = new HomeEditsDeserializerGson(home,
        "file:///Users/renaudpawlak/Documents/workspace-sh3d/SweetHome3DJS").deserializeEdits(
            // "[{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.PolylineResizingUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoPolylineResizeName\",\"controller\":true,\"oldX\":-55.91092,\"oldY\":177.5383,\"polyline\":\"polyline-778b729f-47a8-4c70-a086-be423eceba59\",\"pointIndex\":1,\"newX\":-80.99411,\"newY\":165.1319}]"
            // "[{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.ItemsMovingUndoableEdit\",\"controller\":true,\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoMoveSelectionName\",\"oldSelection\":[\"polyline-778b729f-47a8-4c70-a086-be423eceba59\"],\"allLevelsSelection\":false,\"itemsArray\":[\"polyline-778b729f-47a8-4c70-a086-be423eceba59\"],\"dx\":-18.666666666666657,\"dy\":-6.666666666666629}]"
            // "[{\"_type\":\"com.eteks.sweethome3d.viewcontroller.LabelController.LabelModificationUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoModifyLabelsName\",\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\",\"oldSelection\":[\"label-8ffffcc7-1222-42e9-80ed-ddc1ab07856e\"],\"modifiedLabels\":[{\"_type\":\"com.eteks.sweethome3d.viewcontroller.LabelController.ModifiedLabel\",\"label\":\"label-8ffffcc7-1222-42e9-80ed-ddc1ab07856e\",\"text\":\"Sloping
            // wall\\nwith\\nblack top in
            // 3D\",\"style\":{\"_type\":\"com.eteks.sweethome3d.model.TextStyle\",\"fontName\":null,\"fontSize\":18,\"bold\":false,\"italic\":false,\"alignment\":0},\"color\":null,\"pitch\":0,\"elevation\":0}],\"text\":\"Sloping
            // wall2\\nwith\\nblack top in
            // 3D\",\"alignment\":0,\"fontName\":null,\"fontNameSet\":true,\"fontSize\":18,\"defaultStyle\":{\"_type\":\"com.eteks.sweethome3d.model.TextStyle\",\"fontName\":null,\"fontSize\":18,\"bold\":false,\"italic\":false,\"alignment\":1},\"color\":null,\"pitch\":0,\"pitchEnabled\":true,\"elevation\":0}]"
            // "[{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.TextStyleModificationUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoModifyTextStyleName\",\"controller\":true,\"oldSelection\":[\"label-8ffffcc7-1222-42e9-80ed-ddc1ab07856e\"],\"allLevelsSelection\":false,\"oldStyles\":[{\"_type\":\"com.eteks.sweethome3d.model.TextStyle\",\"fontName\":null,\"fontSize\":18,\"bold\":false,\"italic\":false,\"alignment\":0}],\"items\":[\"label-8ffffcc7-1222-42e9-80ed-ddc1ab07856e\"],\"styles\":[{\"_type\":\"com.eteks.sweethome3d.model.TextStyle\",\"fontName\":null,\"fontSize\":18,\"bold\":false,\"italic\":true,\"alignment\":0}]}]"
            "[{\"_type\":\"javax.swing.undo.CompoundEdit\",\"hasBeenDone\":true,\"alive\":true,\"inProgress\":false,\"edits\":[{\"_type\":\"com.eteks.sweethome3d.viewcontroller.FurnitureController.FurnitureAdditionUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoAddFurnitureName\",\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\",\"allLevelsSelection\":false,\"oldSelection\":[],\"oldBasePlanLocked\":false,\"newFurniture\":[\"pieceOfFurniture-6db92359-c5e0-4120-9125-b6a6b5dff31b\"],\"newFurnitureIndex\":[5],\"newFurnitureGroups\":null,\"newFurnitureLevels\":null,\"furnitureLevel\":null,\"newBasePlanLocked\":false},{\"_type\":\"com.eteks.sweethome3d.viewcontroller.PlanController.ItemsAdditionEndUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoAddItemsName\",\"home\":\"http://localhost:8080/readHome.jsp?home=test/resources/HomeTest.sh3d\",\"items\":[\"pieceOfFurniture-6db92359-c5e0-4120-9125-b6a6b5dff31b\"]},{\"_type\":\"com.eteks.sweethome3d.viewcontroller.LocalizedUndoableEdit\",\"hasBeenDone\":true,\"alive\":true,\"presentationNameKey\":\"undoDropName\"}],\"_newObjects\":{\"pieceOfFurniture-6db92359-c5e0-4120-9125-b6a6b5dff31b\":{\"_type\":\"com.eteks.sweethome3d.model.HomePieceOfFurniture\",\"id\":\"pieceOfFurniture-6db92359-c5e0-4120-9125-b6a6b5dff31b\",\"catalogId\":\"eTeks#bed\",\"name\":\"Bed\",\"nameVisible\":false,\"nameXOffset\":0,\"nameYOffset\":0,\"nameStyle\":null,\"nameAngle\":0,\"description\":null,\"information\":null,\"icon\":{\"url\":\"lib/resources/furniture/bed.png\"},\"planIcon\":null,\"model\":{\"url\":\"jar:lib/resources/furniture/bed.zip!/bed.obj\"},\"modelSize\":24868,\"width\":144.6,\"widthInPlan\":144.6,\"depth\":193.10000000000002,\"depthInPlan\":193.10000000000002,\"height\":52.800000000000004,\"heightInPlan\":52.800000000000004,\"elevation\":0,\"dropOnTopElevation\":0.8390151515151515,\"movable\":true,\"doorOrWindow\":false,\"modelMaterials\":null,\"color\":null,\"texture\":null,\"shininess\":null,\"modelRotation\":[[1,0,0],[0,1,0],[0,0,1]],\"modelCenteredAtOrigin\":true,\"modelTransformations\":null,\"staircaseCutOutShape\":null,\"creator\":\"eTeks\",\"backFaceShown\":false,\"resizable\":true,\"deformable\":true,\"texturable\":true,\"horizontallyRotatable\":true,\"price\":null,\"valueAddedTaxPercentage\":null,\"currency\":null,\"visible\":true,\"x\":584.8154773374969,\"y\":97.940583,\"angle\":0,\"pitch\":0,\"roll\":0,\"modelMirrored\":false,\"level\":null,\"shapeCache\":{\"_type\":\"java.awt.geom.GeneralPath\",\"pointTypes\":[0,1,1,1,1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0],\"numTypes\":6,\"numCoords\":10,\"windingRule\":1,\"floatCoords\":[512.5154773374969,1.3905829999999924,657.1154773374969,1.3905829999999924,657.1154773374969,194.49058300000002,512.5154773374969,194.49058300000002,512.5154773374969,1.3905829999999924,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}}}}]");
    System.out.println(edits);
    for (UndoableEdit edit : edits) {
      edit.redo();
    }
    recorder.writeHome(home, "test/resources/HomeTest2.sh3d");
  }

  private Map<String, HomeObject> homeObjects;
  private HomeController homeController;
  private Home home;
  private String baseUrl;

  /**
   * Creates a new home edit deserializer.
   *
   * @param home    the target home (where the edit will be applied)
   * @param baseUrl the base URL (server) for the resources found within the home
   */
  public HomeEditsDeserializerGson(Home home, String baseUrl) {
    super();
    this.home = home;
    this.baseUrl = baseUrl;
    this.homeController = new HomeController(home, new DefaultUserPreferences(), new ViewFactoryAdapter() {
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
   * Desearializes a list of edits passed as a JSON string.
   *
   * @param jsonEdits the edits as a JSON string
   * @return a list of undoable edits (to be applied to the target home)
   */
  public List<UndoableEdit> deserializeEdits(String jsonEdits) {

    final GsonBuilder gsonBuilder = new GsonBuilder();

    JsonDeserializer<Object> typeAdapter = new JsonDeserializer<Object>() {
      @Override
      public Object deserialize(final JsonElement json, final java.lang.reflect.Type type,
          final JsonDeserializationContext context) throws JsonParseException {

        System.out.println("deserialize " + json + " => " + type + " / " + json.isJsonPrimitive());

        if (json.isJsonPrimitive() && type instanceof Class && (HomeObject.class.isAssignableFrom(((Class<?>) type))
            || Selectable.class.isAssignableFrom(((Class<?>) type)))) {
          String id = json.getAsString();
          if (homeObjects.containsKey(id)) {
            return homeObjects.get(id);
          } else {
            throw new RuntimeException("Cannot find referenced home object " + type + ": " + id);
          }
        }

        JsonObject jsonObject = json.getAsJsonObject();

        // Deserialize the objects created by the edit (placed in _newObject protocol
        // field)
        if (jsonObject.has("_newObjects")) {
          Map<String, HomeObject> newHomeObjects = gsonBuilder.create().fromJson(
              jsonObject.get("_newObjects"),
              new TypeToken<Map<String, HomeObject>>() {}.getType());

          for (Map.Entry<String, HomeObject> entry : newHomeObjects.entrySet()) {
            homeObjects.put(entry.getKey(), entry.getValue());
          }
        }

        // Force UndoableEdit.hasBeenDone to false so that redo() can be called
        if (jsonObject.has("hasBeenDone")) {
          jsonObject.addProperty("hasBeenDone", false);
        }

        // Use _type to determine actual target Java class
        if (jsonObject.has("_type")) {
          JsonElement jsonType = jsonObject.get("_type");
          String typeName = jsonType.getAsString();
          String[] typeNameParts = typeName.split("\\.");

          if (Character.isUpperCase(typeNameParts[typeNameParts.length - 2].charAt(0))) {
            typeName = String.join(".", Arrays.copyOfRange(typeNameParts, 0, typeNameParts.length - 1));
            typeName += "$" + typeNameParts[typeNameParts.length - 1];
          }

          if (!typeName.equals(type.getTypeName())) {
            Class<?> clazz = null;
            try {
              clazz = Class.forName(typeName);
            } catch (Exception e) {
              // Should not happen
              throw new RuntimeException("Cannot find type " + typeName, e);
            }
            return gsonBuilder.create().fromJson(jsonObject, clazz);
          }
        }

        // Basic fields deserialization (with the Content type exception)
        return new GsonBuilder().registerTypeAdapter(Content.class, new JsonDeserializer<Content>() {
          @Override
          public Content deserialize(JsonElement element, Type type, JsonDeserializationContext context)
              throws JsonParseException {
            try {
              String url = element.getAsJsonObject().get("url").getAsString();
              if (url.startsWith("jar:")) {
                url = "jar:" + baseUrl + "/" + url.substring(4);
              } else if (!url.contains(":")) {
                url = baseUrl + "/" + url;
              }
              return new URLContent(new URL(url));
            } catch (MalformedURLException e) {
              e.printStackTrace();
              return null;
            }
          }
        }).create().fromJson(json, type);
      }
    };

    // TODO: use a TypeAdapter factory to have a global handling of all types
    gsonBuilder.registerTypeAdapter(UndoableEdit.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(HomeObject.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(Camera.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(ObserverCamera.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(Compass.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(DimensionLine.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(HomeEnvironment.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(HomePieceOfFurniture.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(HomeDoorOrWindow.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(HomeFurnitureGroup.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(HomeLight.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(Label.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(Level.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(Polyline.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(Room.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(Wall.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(Selectable.class, typeAdapter);
    gsonBuilder.registerTypeAdapter(Content.class, typeAdapter);

    // TODO: make generic handler for enums
    gsonBuilder.registerTypeAdapter(TextStyle.Alignment.class, new JsonDeserializer<TextStyle.Alignment>() {
      @Override
      public TextStyle.Alignment deserialize(JsonElement element, Type type, JsonDeserializationContext context)
          throws JsonParseException {
        int value = element.getAsInt();
        return TextStyle.Alignment.values()[value];
      }
    });

    gsonBuilder.registerTypeAdapter(PlanController.class, new JsonDeserializer<PlanController>() {
      @Override
      public PlanController deserialize(JsonElement element, Type type, JsonDeserializationContext context)
          throws JsonParseException {
        if (homeController.getPlanController() != null) {
          return homeController.getPlanController();
        } else {
          throw new RuntimeException("home controller should have a plan controller");
        }
      }
    });
    gsonBuilder.registerTypeAdapter(Home.class, new JsonDeserializer<Home>() {
      @Override
      public Home deserialize(JsonElement element, Type type, JsonDeserializationContext context)
          throws JsonParseException {
        // TODO: check id and throw exception if not equal
        return home;
      }
    });

    return gsonBuilder.create().fromJson(jsonEdits, new TypeToken<List<UndoableEdit>>() {}.getType());

  }

  // We need a dummy view for the controller because it calls setScale when opening a new home.
  // TODO: check if we can just get rid of this by avoiding calling setScale when the view is null.
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
