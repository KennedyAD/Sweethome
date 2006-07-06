/*
 * CatalogTree.java 1 mai 2006
 * 
 * Copyright (c) 2006 Emmanuel PUYBARET / eTeks <info@eteks.com>. All Rights Reserved.
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; either version 2 of the License, or (at your option) any later
 * version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 59 Temple
 * Place, Suite 330, Boston, MA 02111-1307 USA
 */
package com.eteks.sweethome3d.jface;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.eclipse.jface.viewers.ISelectionChangedListener;
import org.eclipse.jface.viewers.ITreeContentProvider;
import org.eclipse.jface.viewers.LabelProvider;
import org.eclipse.jface.viewers.SelectionChangedEvent;
import org.eclipse.jface.viewers.StructuredSelection;
import org.eclipse.jface.viewers.TreeViewer;
import org.eclipse.jface.viewers.Viewer;
import org.eclipse.swt.graphics.Image;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Display;

import com.eteks.sweethome3d.model.Catalog;
import com.eteks.sweethome3d.model.CatalogPieceOfFurniture;
import com.eteks.sweethome3d.model.Category;
import com.eteks.sweethome3d.model.SelectionEvent;
import com.eteks.sweethome3d.model.SelectionListener;

/**
 * Furniture catalog tree JFace implementation.
 * @author Emmanuel Puybaret
 */
public class CatalogTree {
  private TreeViewer treeViewer;
  private ISelectionChangedListener tableSelectionListener; 
  
  public CatalogTree(Composite parent, Catalog catalog) {
    this.treeViewer = new TreeViewer(parent);
    this.treeViewer.setContentProvider(new CatalogTreeContentProvider(catalog));
    this.treeViewer.setLabelProvider(new CatalogLabelProvider());
    this.treeViewer.setInput(catalog);
    addSelectionListeners(catalog);
  }
  
  /**
   * Adds selection listeners to this tree.
   */
  private void addSelectionListeners(final Catalog catalog) {   
    final SelectionListener homeSelectionListener  = 
      new SelectionListener() {
        public void selectionChanged(SelectionEvent ev) {
          treeViewer.removeSelectionChangedListener(tableSelectionListener);
          treeViewer.setSelection(new StructuredSelection(ev.getSelectedItems()), true);
          treeViewer.addSelectionChangedListener(tableSelectionListener);
        }
      };
    this.tableSelectionListener = 
      new ISelectionChangedListener () {
        public void selectionChanged(SelectionChangedEvent ev) {
          catalog.removeSelectionListener(homeSelectionListener);
          List<CatalogPieceOfFurniture> selectedFurniture = 
              new ArrayList<CatalogPieceOfFurniture>();
          for (Object item : ((StructuredSelection)ev.getSelection()).toList()) {
            if (item instanceof CatalogPieceOfFurniture) {
              selectedFurniture.add((CatalogPieceOfFurniture)item);
            }          
          }        
          // Set the new selection in home
          catalog.setSelectedFurniture(selectedFurniture);
          catalog.addSelectionListener(homeSelectionListener);
        }
      };
    this.treeViewer.addSelectionChangedListener(this.tableSelectionListener);
    catalog.addSelectionListener(homeSelectionListener );
  }

  /**
   * Label provider for this catalog tree.
   */
  private class CatalogLabelProvider extends LabelProvider {
    // Label images cache (we're obliged to keep track of all the images
    // to dispose them when tree will be disposed)
    private Map<CatalogPieceOfFurniture, Image> imagesCache = 
      new HashMap<CatalogPieceOfFurniture, Image>();
    
    @Override
    public Image getImage(Object element) {
      if (element instanceof CatalogPieceOfFurniture) {
        try {
          CatalogPieceOfFurniture piece = (CatalogPieceOfFurniture)element;
          Image scaledImage = imagesCache.get(piece);
          if (scaledImage == null) {
            // Read the icon of the piece 
            InputStream iconStream = (piece).getIcon().openStream();
            Image image = new Image(Display.getCurrent(), iconStream);
            iconStream.close();
            // Scale the read icon  
            int rowHeight = treeViewer.getTree().getItemHeight();
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
      return super.getImage(element);
    }

    @Override
    public String getText(Object element) {
      if (element instanceof Category) {
        return ((Category)element).getName();
      } else if (element instanceof CatalogPieceOfFurniture) {
        return ((CatalogPieceOfFurniture)element).getName();
      } else {
        return super.getText(element);
      }
    }

    @Override
    public void dispose() {
      // Dispose all the images created for the tree
      for (Image image : imagesCache.values()) {
        image.dispose();
      }
      super.dispose();
    }
  }

  /**
   * Tree content provider adaptor to Catalog / Category / PieceOfFurniture classes.  
   */
  private static class CatalogTreeContentProvider implements ITreeContentProvider {
    private Catalog catalog;
    
    public CatalogTreeContentProvider(Catalog catalog) {
      this.catalog = catalog;
    }

    public Object [] getChildren(Object parentElement) {
      if (parentElement instanceof Catalog) {
        return ((Catalog)parentElement).getCategories().toArray();
      } else {
        return ((Category)parentElement).getFurniture().toArray();
      }
    }

    public Object getParent(Object element) {
      if (element instanceof Category) {
        return catalog;
      } else {
        // Search the parent of a piece of furniture. 
        // If Sweet Home 3D UI changes to SWT, there should be a getCategory()
        // method in PieceOfFurniture class to simplify this search
        for (Category category : catalog.getCategories())
          for (CatalogPieceOfFurniture piece : category.getFurniture())
            if (element == piece)
              return category;
        return null;
      }
    }

    public boolean hasChildren(Object element) {
      return !(element instanceof CatalogPieceOfFurniture);
    }

    public Object [] getElements(Object inputElement) {
      // Return categories displayed from root
      return catalog.getCategories().toArray();
    }

    public void inputChanged(Viewer viewer, Object oldInput,
                             Object newInput) {
    }
    
    public void dispose() {
    }
  }
}
