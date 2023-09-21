/*
 * NoOperationViewFactory.java 5 jan 2020
 *
 * Sweet Home 3D, Copyright (c) 2020 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
package com.eteks.sweethome3d.viewcontroller;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.Callable;

import com.eteks.sweethome3d.model.BackgroundImage;
import com.eteks.sweethome3d.model.Camera;
import com.eteks.sweethome3d.model.CatalogPieceOfFurniture;
import com.eteks.sweethome3d.model.CatalogTexture;
import com.eteks.sweethome3d.model.Content;
import com.eteks.sweethome3d.model.DimensionLine;
import com.eteks.sweethome3d.model.FurnitureCatalog;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomePieceOfFurniture;
import com.eteks.sweethome3d.model.RecorderException;
import com.eteks.sweethome3d.model.Selectable;
import com.eteks.sweethome3d.model.TextStyle;
import com.eteks.sweethome3d.model.UserPreferences;

/**
 * A view factory with methods returning views that performs no operation.
 * @author Emmanuel Puybaret
 */
public class NoOperationViewFactory implements ViewFactory {
  public View createFurnitureCatalogView(FurnitureCatalog catalog, UserPreferences preferences,
                                         FurnitureCatalogController furnitureCatalogController) {
    return new NoOperationView();
  }

  public View createFurnitureView(Home home, UserPreferences preferences, FurnitureController furnitureController) {
    return new NoOperationView();
  }

  public PlanView createPlanView(Home home, UserPreferences preferences, PlanController planController) {
    return new NoOperationPlanView();
  }

  public View createView3D(Home home, UserPreferences preferences, HomeController3D homeController3D) {
    return new NoOperationView();
  }

  public HomeView createHomeView(Home home, UserPreferences preferences, HomeController homeController) {
    return new NoOperationHomeView();
  }

  public DialogView createWizardView(UserPreferences preferences, WizardController wizardController) {
    return new NoOperationDialogView();
  }

  public View createBackgroundImageWizardStepsView(BackgroundImage backgroundImage, UserPreferences preferences,
                                                   BackgroundImageWizardController backgroundImageWizardController) {
    return new NoOperationView();
  }

  public ImportedFurnitureWizardStepsView createImportedFurnitureWizardStepsView(CatalogPieceOfFurniture piece,
                                                   String modelName, boolean importHomePiece, UserPreferences preferences,
                                                   ImportedFurnitureWizardController importedFurnitureWizardController) {
    return new ImportedFurnitureWizardStepsView() {
        public Content getIcon() {
          return null;
        }
      };
  }

  public View createImportedTextureWizardStepsView(CatalogTexture texture, String textureName,
                UserPreferences preferences, ImportedTextureWizardController importedTextureWizardController) {
    return new NoOperationView();
  }

  public ThreadedTaskView createThreadedTaskView(String taskMessage, UserPreferences userPreferences,
                                                 ThreadedTaskController threadedTaskController) {
    return new ThreadedTaskView() {
        public void invokeLater(Runnable runnable) {
        }

        public void setTaskRunning(boolean taskRunning, View executingView) {
        }
      };
  }

  public DialogView createUserPreferencesView(UserPreferences preferences,
                                              UserPreferencesController userPreferencesController) {
    return new NoOperationDialogView();
  }

  public DialogView createLevelView(UserPreferences preferences, LevelController levelController) {
    return new NoOperationDialogView();
  }

  public DialogView createHomeFurnitureView(UserPreferences preferences, HomeFurnitureController homeFurnitureController) {
    return new NoOperationDialogView();
  }

  public DialogView createWallView(UserPreferences preferences, WallController wallController) {
    return new NoOperationDialogView();
  }

  public DialogView createRoomView(UserPreferences preferences, RoomController roomController) {
    return new NoOperationDialogView();
  }

  public DialogView createPolylineView(UserPreferences preferences, PolylineController polylineController) {
    return new NoOperationDialogView();
  }

  public DialogView createDimensionLineView(boolean modification, UserPreferences preferences,
                                            DimensionLineController dimensionLineController) {
    return new NoOperationDialogView();
  }

  public DialogView createLabelView(boolean modification, UserPreferences preferences,
                                    LabelController labelController) {
    return new NoOperationDialogView();
  }

  public DialogView createCompassView(UserPreferences preferences, CompassController compassController) {
    return new NoOperationDialogView();
  }

  public DialogView createObserverCameraView(UserPreferences preferences, ObserverCameraController home3dAttributesController) {
    return new NoOperationDialogView();
  }

  public DialogView createHome3DAttributesView(UserPreferences preferences, Home3DAttributesController home3dAttributesController) {
    return new NoOperationDialogView();
  }

  public TextureChoiceView createTextureChoiceView(UserPreferences preferences,
                                                   TextureChoiceController textureChoiceController) {
    return new TextureChoiceView() {
        public boolean confirmDeleteSelectedCatalogTexture() {
          return false;
        }
      };
  }

  public View createBaseboardChoiceView(UserPreferences preferences,
                                        BaseboardChoiceController baseboardChoiceController) {
    return new NoOperationView();
  }

  public View createModelMaterialsView(UserPreferences preferences, ModelMaterialsController modelMaterialsController) {
    return new NoOperationView();
  }

  public DialogView createPageSetupView(UserPreferences preferences, PageSetupController pageSetupController) {
    return new NoOperationDialogView();
  }

  public DialogView createPrintPreviewView(Home home, UserPreferences preferences, HomeController homeController,
                                           PrintPreviewController printPreviewController) {
    return new NoOperationDialogView();
  }

  public DialogView createPhotoView(Home home, UserPreferences preferences, PhotoController photoController) {
    return new NoOperationDialogView();
  }

  public DialogView createPhotosView(Home home, UserPreferences preferences, PhotosController photosController) {
    return new NoOperationDialogView();
  }

  public DialogView createVideoView(Home home, UserPreferences preferences, VideoController videoController) {
    return new NoOperationDialogView();
  }

  public HelpView createHelpView(UserPreferences preferences, HelpController helpController) {
    return new HelpView() {
        public void displayView() {
        }
      };
  }

  /**
   * View performing no operation.
   */
  protected static class NoOperationView implements View {
  }

  /**
   * Dialog view performing no operation.
   */
  protected static class NoOperationDialogView implements DialogView {
    public void displayView(View parentView) {
    }
  }

  /**
   * Home view performing no operation.
   */
  protected static class NoOperationHomeView implements HomeView {
    public void setEnabled(ActionType actionType, boolean enabled) {
    }

    public void setActionEnabled(String actionKey, boolean enabled) {
    }

    public void setUndoRedoName(String undoText, String redoText) {
    }

    public void setTransferEnabled(boolean enabled) {
    }

    public void detachView(View view) {
    }

    public void attachView(View view) {
    }

    public String showOpenDialog() {
      return null;
    }

    public OpenDamagedHomeAnswer confirmOpenDamagedHome(String homeName, Home damagedHome, List<Content> invalidContent) {
      return OpenDamagedHomeAnswer.DO_NOT_OPEN_HOME;
    }

    public String showNewHomeFromExampleDialog() {
      return null;
    }

    public String showImportLanguageLibraryDialog() {
      return null;
    }

    public boolean confirmReplaceLanguageLibrary(String languageLibraryName) {
      return false;
    }

    public String showImportFurnitureLibraryDialog() {
      return null;
    }

    public boolean confirmReplaceFurnitureLibrary(String furnitureLibraryName) {
      return false;
    }

    public String showImportTexturesLibraryDialog() {
      return null;
    }

    public boolean confirmReplaceTexturesLibrary(String texturesLibraryName) {
      return false;
    }

    public boolean confirmReplacePlugin(String pluginName) {
      return false;
    }

    public String showSaveDialog(String homeName) {
      return null;
    }

    public SaveAnswer confirmSave(String homeName) {
      return SaveAnswer.CANCEL;
    }

    public boolean confirmSaveNewerHome(String homeName) {
      return false;
    }

    public boolean confirmDeleteCatalogSelection() {
      return false;
    }

    public boolean confirmExit() {
      return false;
    }

    public void showError(String message) {
    }

    public void showMessage(String message) {
    }

    public boolean showActionTipMessage(String actionTipKey) {
      return false;
    }

    public void showAboutDialog() {
    }

    public Callable<Void> showPrintDialog() {
      return null;
    }

    public String showPrintToPDFDialog(String homeName) {
      return null;
    }

    public void printToPDF(String pdfFile) throws RecorderException {
    }

    public String showExportToCSVDialog(String name) {
      return null;
    }

    public void exportToCSV(String csvName) throws RecorderException {
    }

    public String showExportToSVGDialog(String name) {
      return null;
    }

    public void exportToSVG(String svgName) throws RecorderException {
    }

    public String showExportToOBJDialog(String homeName) {
      return null;
    }

    public void exportToOBJ(String objFile) throws RecorderException {
    }

    public String showStoreCameraDialog(String cameraName) {
      return null;
    }

    public List<Camera> showDeletedCamerasDialog() {
      return null;
    }

    public boolean isClipboardEmpty() {
      return true;
    }

    public List<Selectable> getClipboardItems() {
      return null;
    }

    public boolean showUpdatesMessage(String updatesMessage, boolean showOnlyMessage) {
      return false;
    }

    public void invokeLater(Runnable runnable) {
    }
  }

  /**
   * Plan view able performing no operation.
   * Scale is ignored and one pixel = one centimeter.
   */
  protected static class NoOperationPlanView implements PlanView {
    public float getScale() {
      return 1;
    }

    public void setScale(float scale) {
    }

    public void makeSelectionVisible() {
    }

    public void makePointVisible(float x, float y) {
    }

    public void moveView(float dx, float dy) {
    }

    public boolean isFormatTypeSupported(FormatType formatType) {
      return false;
    }

    public void exportData(OutputStream out, FormatType formatType, Properties settings) throws IOException {
    }

    public Object createTransferData(DataType dataType) {
      throw new UnsupportedOperationException();
    }

    public float getPrintPreferredScale(float preferredWidth, float preferredHeight) {
      return 1;
    }

    public float convertXPixelToModel(int x) {
      return x;
    }

    public float convertYPixelToModel(int y) {
      return y;
    }

    public int convertXModelToScreen(float x) {
      return (int)x;
    }

    public int convertYModelToScreen(float y) {
      return (int)y;
    }

    public float getPixelLength() {
      return 1;
    }

    public float[][] getTextBounds(String text, TextStyle style, float x, float y, float angle) {
      return new float [][] {{x, y}};
    }

    public void setCursor(CursorType cursorType) {
    }

    public void setRectangleFeedback(float x0, float y0, float x1, float y1) {
    }

    public void setToolTipFeedback(String toolTipFeedback, float x, float y) {
    }

    public void setToolTipEditedProperties(PlanController.EditableProperty[] toolTipEditedProperties, Object[] toolTipPropertyValues, float x, float y) {
    }

    public void setToolTipEditedPropertyValue(PlanController.EditableProperty toolTipEditedProperty, Object toolTipPropertyValue) {
    }

    public void deleteToolTipFeedback() {
    }

    public void setResizeIndicatorVisible(boolean resizeIndicatorVisible) {
    }

    public void setAlignmentFeedback(Class<? extends Selectable> alignedObjectClass, Selectable alignedObject,
                                     float x, float y, boolean showPoint) {
    }

    public void setAngleFeedback(float xCenter, float yCenter, float x1, float y1, float x2, float y2) {
    }

    public void setDraggedItemsFeedback(List<Selectable> draggedItems) {
    }

    public void setDimensionLinesFeedback(List<DimensionLine> dimensionLines) {
    }

    public void deleteFeedback() {
    }

    public View getHorizontalRuler() {
      return new NoOperationView();
    }

    public View getVerticalRuler() {
      return new NoOperationView();
    }

    public boolean canImportDraggedItems(List<Selectable> items, int x, int y) {
      return false;
    }

    public float[] getPieceOfFurnitureSizeInPlan(HomePieceOfFurniture piece) {
      if (piece.getRoll() == 0 && piece.getPitch() == 0) {
        return new float [] {piece.getWidth(), piece.getDepth(), piece.getHeight()};
      } else {
        return null; // Size in plan will be computed proportionally or reset by undoable edit
      }
    }

    public boolean isFurnitureSizeInPlanSupported() {
      return false;
    }
  }
}
