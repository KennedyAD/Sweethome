/*
 * FurnitureTable.java 29 mai 2006
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
package com.eteks.sweethome3d.jface;

import java.io.IOException;
import java.io.InputStream;
import java.text.NumberFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ResourceBundle;

import org.eclipse.jface.viewers.IStructuredContentProvider;
import org.eclipse.jface.viewers.IStructuredSelection;
import org.eclipse.jface.viewers.ITableLabelProvider;
import org.eclipse.jface.viewers.LabelProvider;
import org.eclipse.jface.viewers.StructuredSelection;
import org.eclipse.jface.viewers.TableViewer;
import org.eclipse.jface.viewers.Viewer;
import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Image;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.TableColumn;

import com.eteks.sweethome3d.model.FurnitureEvent;
import com.eteks.sweethome3d.model.FurnitureListener;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomePieceOfFurniture;
import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.viewcontroller.FurnitureController;
import com.eteks.sweethome3d.viewcontroller.FurnitureView;

/**
 * A table displaying furniture.
 * @author Emmanuel Puybaret
 */
public class FurnitureTable implements FurnitureView {
  private TableViewer tableViewer;
  
  public FurnitureTable(Composite parent, FurnitureController controller, Home home, UserPreferences preferences) {
    this.tableViewer = new TableViewer(parent); 
    String [] columnNames = getColumnNames();
    // Create SWT table columns
    int    [] columnAlignment = {SWT.LEFT, SWT.RIGHT, SWT.RIGHT, SWT.RIGHT, SWT.CENTER, SWT.CENTER, SWT.CENTER, SWT.CENTER};
    int    [] columnWidth     = {100, 50, 50, 50, 50, 60, 70, 50};
    for (int columnIndex = 0; columnIndex < columnNames.length; columnIndex++) {
      TableColumn column = new TableColumn(this.tableViewer.getTable(), columnAlignment [columnIndex]);
      column.setText(columnNames [columnIndex]);  // Set column title
      column.setWidth(columnWidth [columnIndex]); // Need a minimum width or columns are invisible
    }
    this.tableViewer.getTable().setHeaderVisible(true);
    
    this.tableViewer.setColumnProperties(columnNames);
    this.tableViewer.setContentProvider(new FurnitureTableContentProvider(home));
    this.tableViewer.setLabelProvider(new FurnitureLabelProvider(preferences));
    this.tableViewer.setInput(home);
  }

  /**
   * Returns localized column names.
   */
  private String [] getColumnNames() {
    ResourceBundle resource = 
      ResourceBundle.getBundle(getClass().getName());
    String [] columnNames = {
       resource.getString("nameColumn"),
       resource.getString("widthColumn"),
       resource.getString("heightColumn"),
       resource.getString("depthColumn"),
       resource.getString("colorColumn"),
       resource.getString("movableColumn"),
       resource.getString("doorOrWindowColumn"),
       resource.getString("visibleColumn")};
    return columnNames;
  }

  /**
   * Returns the list of selected furniture in table.
   * @return a list of furniture. If no furniture is selected, the list is empty.
   */
  public List<HomePieceOfFurniture> getSelectedFurniture() {
    return ((IStructuredSelection)this.tableViewer.getSelection()).toList();
  }

  /**
   * Sets the list of selected furniture in table and ensures the first and the
   * last one is visible.
   * @param furniture the furniture to select
   */
  public void setSelectedFurniture(List<HomePieceOfFurniture> furniture) {
    this.tableViewer.setSelection(new StructuredSelection(furniture), true);
  }

  /**
   * Label provider for this furnitur table.
   */
  private class FurnitureLabelProvider extends LabelProvider implements ITableLabelProvider {
    // Label images cache (we're obliged to keep track of all the images
    // to dispose them when tree will be disposed)
    private Map<HomePieceOfFurniture, Image> imagesCache = 
      new HashMap<HomePieceOfFurniture, Image>();
    private UserPreferences preferences;

    public FurnitureLabelProvider(UserPreferences preferences) {
      this.preferences = preferences;
    }
    
    public Image getColumnImage(Object element, int columnIndex) {
      if (columnIndex == 0) {
        try {
          HomePieceOfFurniture piece = (HomePieceOfFurniture)element;
          Image scaledImage = imagesCache.get(piece);
          if (scaledImage == null) {
            // Read the icon of the piece 
            InputStream iconStream = (piece).getIcon().openStream();
            Image image = new Image(Display.getCurrent(), iconStream);
            iconStream.close();
            // Scale the read icon  
            int rowHeight = tableViewer.getTable().getItemHeight();
            int imageWidth = image.getBounds().width * rowHeight 
                             / image.getBounds().height;
            scaledImage = new Image (Display.getCurrent(), 
                image.getImageData().scaledTo(imageWidth, rowHeight));
            image.dispose();
            imagesCache.put(piece, scaledImage);
          }
          return scaledImage;
        } catch (IOException ex) {
          // Too bad the icon can't be read
          ex.printStackTrace();
        }
      }
      return null;
    }

    public String getColumnText(Object element, int columnIndex) {
      HomePieceOfFurniture piece = (HomePieceOfFurniture)element;
      switch (columnIndex) {
        case 0 : return piece.getName();
        case 1 : return getSizeInPreferredUnit(piece.getWidth());
        case 2 : return getSizeInPreferredUnit(piece.getHeight());
        case 3 : return getSizeInPreferredUnit(piece.getDepth());
        case 4 : return "-";
        case 5 : return piece.isMovable() ? "x" : "";
        case 6 : return piece.isDoorOrWindow() ? "x" : "";
        case 7 : return piece.isVisible() ? "x" : "";
        default : throw new IllegalArgumentException("Unknown column " + columnIndex);
      }
    }
    
    private String getSizeInPreferredUnit(float size) {
      if (preferences.getUnit() == UserPreferences.Unit.INCH) {
        size = UserPreferences.Unit.centimerToInch(size);
      }
      return NumberFormat.getNumberInstance().format(size);
    }

    public void dispose() {
      // Dispose all the images created for the tree
      for (Image image : imagesCache.values()) {
        image.dispose();
      }
    }
  }

  /**
   * Table content provider adaptor to Home class.  
   */
  public class FurnitureTableContentProvider implements IStructuredContentProvider {

    public FurnitureTableContentProvider(Home home) {
      addHomeListener(home);
    }

    private void addHomeListener(Home home)
    {
      home.addFurnitureListener(new FurnitureListener () { 
        public void pieceOfFurnitureAdded(FurnitureEvent ev) {
          addPieceOfFurniture((Home)ev.getSource(), 
              (HomePieceOfFurniture)ev.getPieceOfFurniture()); 
        }
        public void pieceOfFurnitureDeleted(FurnitureEvent ev) {
          removePieceOfFurniture(
            (HomePieceOfFurniture)ev.getPieceOfFurniture()); 
        }
      });
    }

    private void addPieceOfFurniture(Home home, 
                     HomePieceOfFurniture piece) {
      int row = home.getFurniture().indexOf(piece);
      tableViewer.insert(piece, row);
    }

    private void removePieceOfFurniture(HomePieceOfFurniture piece) {
      tableViewer.remove(piece);
    }

    public Object [] getElements(Object inputElement) {
      return ((Home)inputElement).getFurniture().toArray();
    }
    
    public void inputChanged(Viewer viewer, Object oldInput,
                             Object newInput) {
      // Input change are ignored, changes are coming from model through furniture controller
    }

    public void dispose() {
    }
  }
}
