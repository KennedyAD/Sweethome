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
  @Override
  public View createFurnitureCatalogView(FurnitureCatalog catalog, UserPreferences preferences,
                                         FurnitureCatalogController furnitureCatalogController) {
    return new NoOperationView();
  }

  @Override
  public View createFurnitureView(Home home, UserPreferences preferences, FurnitureController furnitureController) {
    return new NoOperationView();
  }

  @Override
  public PlanView createPlanView(Home home, UserPreferences preferences, PlanController planController) {
    return new NoOperationPlanView();
  }

  @Override
  public View createView3D(Home home, UserPreferences preferences, HomeController3D homeController3D) {
    return new NoOperationView();
  }

  @Override
  public HomeView createHomeView(Home home, UserPreferences preferences, HomeController homeController) {
    return new NoOperationHomeView();
  }

  @Override
  public DialogView createWizardView(UserPreferences preferences, WizardController wizardController) {
    return new NoOperationDialogView();
  }

  @Override
  public View createBackgroundImageWizardStepsView(BackgroundImage backgroundImage, UserPreferences preferences,
                                                   BackgroundImageWizardController backgroundImageWizardController) {
    return new NoOperationView();
  }

  @Override
  public ImportedFurnitureWizardStepsView createImportedFurnitureWizardStepsView(CatalogPieceOfFurniture piece,
                                                   String modelName, boolean importHomePiece, UserPreferences preferences,
                                                   ImportedFurnitureWizardController importedFurnitureWizardController) {
    return new ImportedFurnitureWizardStepsView() {
        public Content getIcon() {
          return null;
        }
      };
  }

  @Override
  public View createImportedTextureWizardStepsView(CatalogTexture texture, String textureName,
                UserPreferences preferences, ImportedTextureWizardController importedTextureWizardController) {
    return new NoOperationView();
  }

  @Override
  public ThreadedTaskView createThreadedTaskView(String taskMessage, UserPreferences userPreferences,
                                                 ThreadedTaskController threadedTaskController) {
    return new ThreadedTaskView() {
        public void invokeLater(Runnable runnable) {
        }

        public void setTaskRunning(boolean taskRunning, View executingView) {
        }
      };
  }

  @Override
  public DialogView createUserPreferencesView(UserPreferences preferences,
                                              UserPreferencesController userPreferencesController) {
    return new NoOperationDialogView();
  }

  @Override
  public DialogView createLevelView(UserPreferences preferences, LevelController levelController) {
    return new NoOperationDialogView();
  }

  @Override
  public DialogView createHomeFurnitureView(UserPreferences preferences, HomeFurnitureController homeFurnitureController) {
    return new NoOperationDialogView();
  }

  @Override
  public DialogView createWallView(UserPreferences preferences, WallController wallController) {
    return new NoOperationDialogView();
  }

  @Override
  public DialogView createRoomView(UserPreferences preferences, RoomController roomController) {
    return new NoOperationDialogView();
  }

  @Override
  public DialogView createPolylineView(UserPreferences preferences, PolylineController polylineController) {
    return new NoOperationDialogView();
  }

  @Override
  public DialogView createLabelView(boolean modification, UserPreferences preferences,
                                    LabelController labelController) {
    return new NoOperationDialogView();
  }

  @Override
  public DialogView createCompassView(UserPreferences preferences, CompassController compassController) {
    return new NoOperationDialogView();
  }

  @Override
  public DialogView createObserverCameraView(UserPreferences preferences, ObserverCameraController home3dAttributesController) {
    return new NoOperationDialogView();
  }

  @Override
  public DialogView createHome3DAttributesView(UserPreferences preferences, Home3DAttributesController home3dAttributesController) {
    return new NoOperationDialogView();
  }

  @Override
  public TextureChoiceView createTextureChoiceView(UserPreferences preferences,
                                                   TextureChoiceController textureChoiceController) {
    return new TextureChoiceView() {
        public boolean confirmDeleteSelectedCatalogTexture() {
          return false;
        }
      };
  }

  @Override
  public View createBaseboardChoiceView(UserPreferences preferences,
                                        BaseboardChoiceController baseboardChoiceController) {
    return new NoOperationView();
  }

  @Override
  public View createModelMaterialsView(UserPreferences preferences, ModelMaterialsController modelMaterialsController) {
    return new NoOperationView();
  }

  @Override
  public DialogView createPageSetupView(UserPreferences preferences, PageSetupController pageSetupController) {
    return new NoOperationDialogView();
  }

  @Override
  public DialogView createPrintPreviewView(Home home, UserPreferences preferences, HomeController homeController,
                                           PrintPreviewController printPreviewController) {
    return new NoOperationDialogView();
  }

  @Override
  public DialogView createPhotoView(Home home, UserPreferences preferences, PhotoController photoController) {
    return new NoOperationDialogView();
  }

  @Override
  public DialogView createPhotosView(Home home, UserPreferences preferences, PhotosController photosController) {
    return new NoOperationDialogView();
  }

  @Override
  public DialogView createVideoView(Home home, UserPreferences preferences, VideoController videoController) {
    return new NoOperationDialogView();
  }

  @Override
  public HelpView createHelpView(UserPreferences preferences, HelpController helpController) {
    return new HelpView() {
        public void displayView() {
        }
      };
  }

  private static class NoOperationView implements View {
  }

  private static class NoOperationDialogView implements DialogView {
    @Override
    public void displayView(View parentView) {
    }
  }

  /**
   * Home view performing no operation.
   */
  private static class NoOperationHomeView implements HomeView {
    @Override
    public void setEnabled(ActionType actionType, boolean enabled) {
    }

    @Override
    public void setUndoRedoName(String undoText, String redoText) {
    }

    @Override
    public void setTransferEnabled(boolean enabled) {
    }

    @Override
    public void detachView(View view) {
    }

    @Override
    public void attachView(View view) {
    }

    @Override
    public String showOpenDialog() {
      return null;
    }

    @Override
    public OpenDamagedHomeAnswer confirmOpenDamagedHome(String homeName, Home damagedHome, List<Content> invalidContent) {
      return OpenDamagedHomeAnswer.DO_NOT_OPEN_HOME;
    }

    @Override
    public String showNewHomeFromExampleDialog() {
      return null;
    }

    @Override
    public String showImportLanguageLibraryDialog() {
      return null;
    }

    @Override
    public boolean confirmReplaceLanguageLibrary(String languageLibraryName) {
      return false;
    }

    @Override
    public String showImportFurnitureLibraryDialog() {
      return null;
    }

    @Override
    public boolean confirmReplaceFurnitureLibrary(String furnitureLibraryName) {
      return false;
    }

    @Override
    public String showImportTexturesLibraryDialog() {
      return null;
    }

    @Override
    public boolean confirmReplaceTexturesLibrary(String texturesLibraryName) {
      return false;
    }

    @Override
    public boolean confirmReplacePlugin(String pluginName) {
      return false;
    }

    @Override
    public String showSaveDialog(String homeName) {
      return null;
    }

    @Override
    public SaveAnswer confirmSave(String homeName) {
      return SaveAnswer.CANCEL;
    }

    @Override
    public boolean confirmSaveNewerHome(String homeName) {
      return false;
    }

    @Override
    public boolean confirmDeleteCatalogSelection() {
      return false;
    }

    @Override
    public boolean confirmExit() {
      return false;
    }

    @Override
    public void showError(String message) {
    }

    @Override
    public void showMessage(String message) {
    }

    @Override
    public boolean showActionTipMessage(String actionTipKey) {
      return false;
    }

    @Override
    public void showAboutDialog() {

    }

    @Override
    public Callable<Void> showPrintDialog() {
      return null;
    }

    @Override
    public String showPrintToPDFDialog(String homeName) {
      return null;
    }

    @Override
    public void printToPDF(String pdfFile) throws RecorderException {
    }

    @Override
    public String showExportToCSVDialog(String name) {
      return null;
    }

    @Override
    public void exportToCSV(String csvName) throws RecorderException {
    }

    @Override
    public String showExportToSVGDialog(String name) {
      return null;
    }

    @Override
    public void exportToSVG(String svgName) throws RecorderException {
    }

    @Override
    public String showExportToOBJDialog(String homeName) {
      return null;
    }

    @Override
    public void exportToOBJ(String objFile) throws RecorderException {
    }

    @Override
    public String showStoreCameraDialog(String cameraName) {
      return null;
    }

    @Override
    public List<Camera> showDeletedCamerasDialog() {
      return null;
    }

    @Override
    public boolean isClipboardEmpty() {
      return true;
    }

    @Override
    public List<Selectable> getClipboardItems() {
      return null;
    }

    @Override
    public boolean showUpdatesMessage(String updatesMessage, boolean showOnlyMessage) {
      return false;
    }

    @Override
    public void invokeLater(Runnable runnable) {
    }
  }

  /**
   * Plan view able performing no operation.
   * Scale is ignored and one pixel = one centimeter.
   */
  private static class NoOperationPlanView implements PlanView {
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
    }

    @Override
    public Object createTransferData(DataType dataType) {
      throw new UnsupportedOperationException();
    }

    @Override
    public float getPrintPreferredScale(float preferredWidth, float preferredHeight) {
      return 1;
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
      return new float [][] {{x, y}};
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
    public void setToolTipEditedProperties(PlanController.EditableProperty[] toolTipEditedProperties, Object[] toolTipPropertyValues, float x, float y) {
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
      return new NoOperationView();
    }

    @Override
    public View getVerticalRuler() {
      return new NoOperationView();
    }

    @Override
    public boolean canImportDraggedItems(List<Selectable> items, int x, int y) {
      return false;
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
