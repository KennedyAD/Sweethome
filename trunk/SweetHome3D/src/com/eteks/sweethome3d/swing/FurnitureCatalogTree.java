/*
 * FurnitureCatalogTree.java 7 avr. 2006
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
package com.eteks.sweethome3d.swing;

import java.awt.Component;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.KeyboardFocusManager;
import java.awt.RenderingHints;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.ResourceBundle;

import javax.swing.Icon;
import javax.swing.JLabel;
import javax.swing.JTree;
import javax.swing.SwingUtilities;
import javax.swing.ToolTipManager;
import javax.swing.event.TreeModelEvent;
import javax.swing.event.TreeModelListener;
import javax.swing.event.TreeSelectionEvent;
import javax.swing.event.TreeSelectionListener;
import javax.swing.tree.DefaultTreeCellRenderer;
import javax.swing.tree.TreeModel;
import javax.swing.tree.TreePath;

import com.eteks.sweethome3d.model.CatalogPieceOfFurniture;
import com.eteks.sweethome3d.model.CollectionEvent;
import com.eteks.sweethome3d.model.CollectionListener;
import com.eteks.sweethome3d.model.Content;
import com.eteks.sweethome3d.model.FurnitureCatalog;
import com.eteks.sweethome3d.model.FurnitureCategory;
import com.eteks.sweethome3d.model.SelectionEvent;
import com.eteks.sweethome3d.model.SelectionListener;
import com.eteks.sweethome3d.tools.URLContent;
import com.eteks.sweethome3d.viewcontroller.FurnitureCatalogController;
import com.eteks.sweethome3d.viewcontroller.View;

/**
 * A tree displaying furniture catalog by category.
 * @author Emmanuel Puybaret
 */
public class FurnitureCatalogTree extends JTree implements View {
  private final FurnitureCatalog           catalog;
  private final FurnitureCatalogController controller;
  private TreeSelectionListener            treeSelectionListener;
  private SelectionListener                modelSelectionListener;
  private boolean                          selectionSynchronized;

  /**
   * Creates a tree that displays <code>catalog</code> content.
   */
  public FurnitureCatalogTree(FurnitureCatalog catalog) {
    this(catalog, null);
  }

  /**
   * Creates a tree controlled by <code>controller</code> that displays 
   * <code>catalog</code> content and its selection.
   */
  public FurnitureCatalogTree(FurnitureCatalog catalog, 
                              FurnitureCatalogController controller) {
    this(catalog, controller, false);
  }
  
  /**
   * Creates a tree controlled by <code>controller</code> that displays 
   * <code>catalog</code> content. If <code>synchronizeSelectionOnlyWhenInFocusedRoot</code> 
   * is <code>true</code>, selected items in catalog and selected items in this tree will be 
   * synchronized only when this tree belongs to the same hierarchy as the focused component. 
   */
  public FurnitureCatalogTree(FurnitureCatalog catalog, 
                              FurnitureCatalogController controller,
                              boolean synchronizeSelectionOnlyWhenInFocusedRoot) {
    this.catalog = catalog;
    this.controller = controller;
    setModel(new CatalogTreeModel(catalog));
    setRootVisible(false);
    setShowsRootHandles(true);
    setCellRenderer(new CatalogCellRenderer());
    if (!synchronizeSelectionOnlyWhenInFocusedRoot) {
      updateTreeSelectedFurniture();
    }
    if (controller != null) {
      addSelectionListeners(catalog, controller, synchronizeSelectionOnlyWhenInFocusedRoot);
      addMouseListener(controller);
    }
    setDragEnabled(true);
    ToolTipManager.sharedInstance().registerComponent(this);
  }
  
  /** 
   * Adds the listeners that manage selection synchronization in this tree. 
   */
  private void addSelectionListeners(final FurnitureCatalog catalog, 
                                     final FurnitureCatalogController controller, 
                                     final boolean synchronizeSelectionOnlyWhenInFocusedRoot) {
    this.modelSelectionListener = new FurnitureCatalogSelectionListener(
        this, synchronizeSelectionOnlyWhenInFocusedRoot);
    this.treeSelectionListener = new TreeSelectionListener () {
        public void valueChanged(TreeSelectionEvent ev) {
          updateCatalogSelectedFurniture();
        }
      };
      
    catalog.addSelectionListener(this.modelSelectionListener);
    getSelectionModel().addTreeSelectionListener(this.treeSelectionListener);

    if (synchronizeSelectionOnlyWhenInFocusedRoot) {
      updateSelectionSynchronizationFromFocusOwner(); 
      KeyboardFocusManager.getCurrentKeyboardFocusManager().addPropertyChangeListener("focusOwner", 
          new FocusListener(this));
    } else {
      this.selectionSynchronized = true;
    }
  }

  /**
   * Selection listener bound to this tree with a weak reference to avoid
   * strong link between keyboard catalog and this tree.
   */
  private static final class FurnitureCatalogSelectionListener implements SelectionListener {
    private final WeakReference<FurnitureCatalogTree> catalogTree;
    private final boolean synchronizeSelectionOnlyWhenInFocusedRoot;

    private FurnitureCatalogSelectionListener(FurnitureCatalogTree catalogTree, 
                                              boolean synchronizeSelectionOnlyWhenInFocusedRoot) {
      this.synchronizeSelectionOnlyWhenInFocusedRoot = synchronizeSelectionOnlyWhenInFocusedRoot;
      this.catalogTree = new WeakReference<FurnitureCatalogTree>(catalogTree);
    }

    public void selectionChanged(SelectionEvent ev) {
      FurnitureCatalogTree catalogTree = this.catalogTree.get();
      FurnitureCatalog catalog = (FurnitureCatalog)ev.getSource(); 
      if (catalogTree == null) {
        catalog.removeSelectionListener(this);
      } else {
        Component focusOwner = KeyboardFocusManager.getCurrentKeyboardFocusManager().getFocusOwner();
        // Update the selection in tree if there's no condition on synchronization
        // or if this tree belongs to the same hierarchy as the focused component
        if (!this.synchronizeSelectionOnlyWhenInFocusedRoot 
            || (focusOwner != null 
                && SwingUtilities.isDescendingFrom(focusOwner, SwingUtilities.getRoot(catalogTree)))) {
          catalogTree.updateTreeSelectedFurniture();        
        }
      }
    }
  }

  /**
   * Focus listener bound to this tree with a weak reference to avoid
   * strong link between keyboard focus manager and this tree.  
   */
  private static final class FocusListener implements PropertyChangeListener {
    private final WeakReference<FurnitureCatalogTree> catalogTree;

    private FocusListener(FurnitureCatalogTree catalogTree) {
      this.catalogTree = new WeakReference<FurnitureCatalogTree>(catalogTree);
    }

    public void propertyChange(PropertyChangeEvent ev) {
      FurnitureCatalogTree catalogTree = this.catalogTree.get();
      if (catalogTree == null) {
        ((KeyboardFocusManager)ev.getSource()).removePropertyChangeListener("focusOwner", this);
      } else {
        catalogTree.updateSelectionSynchronizationFromFocusOwner();
      }
    }
  }

  /**
   * Updates selection synchronization by adding or removing selection listeners on this tree
   * depending on whether this tree belongs to the same hierarchy as the focused component or not. 
   */
  private void updateSelectionSynchronizationFromFocusOwner() {
    Component focusOwner = KeyboardFocusManager.getCurrentKeyboardFocusManager().getFocusOwner();
    if (focusOwner != null
        && (SwingUtilities.isDescendingFrom(focusOwner, SwingUtilities.getRoot(this))
            ^ this.selectionSynchronized)) {
      // If the component that gained focus belongs to the same hierarchy as the tree
      // select furniture matching selected nodes
      if (!this.selectionSynchronized) {        
        updateCatalogSelectedFurniture();
      }              
      this.selectionSynchronized = !this.selectionSynchronized; 
    }
  }
  
  /**
   * Updates selected nodes in tree from <code>catalog</code> selected furniture. 
   */
  private void updateTreeSelectedFurniture() {
    if (this.treeSelectionListener != null) {
      getSelectionModel().removeTreeSelectionListener(this.treeSelectionListener);
    }
    
    clearSelection();
    for (CatalogPieceOfFurniture piece : this.catalog.getSelectedFurniture()) {
      TreePath path = new TreePath(new Object [] {this.catalog, piece.getCategory(), piece});
      addSelectionPath(path);
      scrollRowToVisible(getRowForPath(path));
    }
    
    if (this.treeSelectionListener != null) {
      getSelectionModel().addTreeSelectionListener(this.treeSelectionListener);
    }
  }

  /**
   * Updates selected furniture in <code>catalog</code> from selected nodes in tree. 
   */
  private void updateCatalogSelectedFurniture() {
    this.catalog.removeSelectionListener(this.modelSelectionListener);
    // Set the new selection in catalog with controller
    this.controller.setSelectedFurniture(getSelectedFurniture());
    this.catalog.addSelectionListener(this.modelSelectionListener);
  }

  /**
   * Returns the selected furniture in tree.
   */
  private List<CatalogPieceOfFurniture> getSelectedFurniture() {
    // Build the list of selected furniture
    List<CatalogPieceOfFurniture> selectedFurniture = new ArrayList<CatalogPieceOfFurniture>();
    TreePath [] selectionPaths = getSelectionPaths(); 
    if (selectionPaths != null) {
      for (TreePath path : selectionPaths) {
        // Add to selectedFurniture all the nodes that matches a piece of furniture
        if (path.getPathCount() == 3) {
          selectedFurniture.add((CatalogPieceOfFurniture)path.getLastPathComponent());
        }
      }
    }   
    return selectedFurniture;
  }
  
  /**
   * Adds a double click mouse listener to modify selected furniture.
   */
  private void addMouseListener(final FurnitureCatalogController controller) {
    addMouseListener(new MouseAdapter () {
        @Override
        public void mouseClicked(MouseEvent ev) {
          if (ev.getClickCount() == 2) {
            TreePath clickedPath = getPathForLocation(ev.getX(), ev.getY());
            if (clickedPath != null
                && clickedPath.getLastPathComponent() instanceof CatalogPieceOfFurniture) {
              controller.modifySelectedFurniture();
            }
          }
        }
      });
  }

  /**
   * Returns a tooltip for furniture pieces described in this tree.
   */
  @Override
  public String getToolTipText(MouseEvent ev) {
    TreePath path = getPathForLocation(ev.getX(), ev.getY());
    if (path != null
        && path.getPathCount() == 3) {
      CatalogPieceOfFurniture piece = (CatalogPieceOfFurniture)path.getLastPathComponent();
      String tooltip = "<html><center>&nbsp;<b>" + piece.getName() + "</b>&nbsp;";
      if (piece.getCreator() != null) {
        String creatorFormat = 
            ResourceBundle.getBundle(FurnitureCatalogTree.class.getName()).getString("tooltipCreator");
        tooltip += "<br>" + String.format(creatorFormat, piece.getCreator());
      }
      if (piece.getIcon() instanceof URLContent) {
        tooltip += "<br><img width='128' height='128' src='" 
          + ((URLContent)piece.getIcon()).getURL() + "'>"; 
      }
      return tooltip;
    } else {
      return null;
    }
  }
  
  /**
   * Cell renderer for this catalog tree.
   */
  private static class CatalogCellRenderer extends DefaultTreeCellRenderer {
    private static final int DEFAULT_ICON_HEIGHT = 32;
    private Font defaultFont;
    private Font modifiablePieceFont;
    
    @Override
    public Component getTreeCellRendererComponent(JTree tree, 
        Object value, boolean selected, boolean expanded, 
        boolean leaf, int row, boolean hasFocus) {
      // Get default label with its icon, background and focus colors 
      JLabel label = (JLabel)super.getTreeCellRendererComponent( 
          tree, value, selected, expanded, leaf, row, hasFocus);
      // Initialize fonts if not done
      if (this.defaultFont == null) {
        this.defaultFont = label.getFont();
        this.modifiablePieceFont = 
            new Font(this.defaultFont.getFontName(), Font.ITALIC, this.defaultFont.getSize());
        
      }
      // If node is a category, change label text
      if (value instanceof FurnitureCategory) {
        label.setText(((FurnitureCategory)value).getName());
        label.setFont(this.defaultFont);
      } 
      // Else if node is a piece of furniture, change label text and icon
      else if (value instanceof CatalogPieceOfFurniture) {
        CatalogPieceOfFurniture piece = (CatalogPieceOfFurniture)value;
        label.setText(piece.getName());
        label.setIcon(getLabelIcon(tree, piece.getIcon()));
        label.setFont(piece.isModifiable() 
            ? this.modifiablePieceFont : this.defaultFont);
      }
      return label;
    }

    /**
     * Returns an Icon instance with the read image scaled at the tree row height or
     * an empty image if the image couldn't be read.
     * @param content the content of an image.
     */
    private Icon getLabelIcon(JTree tree, Content content) {
      int rowHeight = tree.isFixedRowHeight()
                         ? tree.getRowHeight()
                         : DEFAULT_ICON_HEIGHT;
      return IconManager.getInstance().getIcon(content, rowHeight, tree);
    }
    
    @Override
    protected void paintComponent(Graphics g) {
      // Force text anti aliasing on texts
      ((Graphics2D)g).setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, 
          RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
      super.paintComponent(g);
    }
  }
  
  /**
   * Tree model adaptor to Catalog / Category / PieceOfFurniture classes.  
   */
  private static class CatalogTreeModel implements TreeModel {
    private FurnitureCatalog                 catalog;
    private List<TreeModelListener> listeners;
    
    public CatalogTreeModel(FurnitureCatalog catalog) {
      this.catalog = catalog;
      this.listeners = new ArrayList<TreeModelListener>(2);
      catalog.addFurnitureListener(new CatalogFurnitureListener(this));
    }

    public Object getRoot() {
      return this.catalog;
    }

    public Object getChild(Object parent, int index) {
      if (parent instanceof FurnitureCatalog) {
        return ((FurnitureCatalog)parent).getCategory(index);
      } else {
        return ((FurnitureCategory)parent).getPieceOfFurniture(index);
      }
    }

    public int getChildCount(Object parent) {
      if (parent instanceof FurnitureCatalog) {
        return ((FurnitureCatalog)parent).getCategoriesCount();
      } else {
        return ((FurnitureCategory)parent).getFurnitureCount();
      } 
    }

    public int getIndexOfChild(Object parent, Object child) {
      if (parent instanceof FurnitureCatalog) {
        return Collections.binarySearch(((FurnitureCatalog)parent).getCategories(), (FurnitureCategory)child);
      } else {
        return Collections.binarySearch(((FurnitureCategory)parent).getFurniture(), (CatalogPieceOfFurniture)child);
      }
    }

    public boolean isLeaf(Object node) {
      return node instanceof CatalogPieceOfFurniture;
    }

    public void valueForPathChanged(TreePath path, Object newValue) {
      // Tree isn't editable
    }

    public void addTreeModelListener(TreeModelListener l) {
      this.listeners.add(l);
    }

    public void removeTreeModelListener(TreeModelListener l) {
      this.listeners.remove(l);
    }
    
    private void fireTreeNodesInserted(TreeModelEvent treeModelEvent) {
      // Work on a copy of listeners to ensure a listener 
      // can modify safely listeners list
      TreeModelListener [] listeners = this.listeners.
          toArray(new TreeModelListener [this.listeners.size()]);
      for (TreeModelListener listener : listeners) {
        listener.treeNodesInserted(treeModelEvent);
      }
    }

    private void fireTreeNodesRemoved(TreeModelEvent treeModelEvent) {
      // Work on a copy of listeners to ensure a listener 
      // can modify safely listeners list
      TreeModelListener [] listeners = this.listeners.
          toArray(new TreeModelListener [this.listeners.size()]);
      for (TreeModelListener listener : listeners) {
        listener.treeNodesRemoved(treeModelEvent);
      }
    }
    
    /**
     * Catalog furniture listener bound to this tree model with a weak reference to avoid
     * strong link between catalog and this tree.  
     */
    private static class CatalogFurnitureListener implements CollectionListener<CatalogPieceOfFurniture> {
      private WeakReference<CatalogTreeModel>  catalogTreeModel;

      public CatalogFurnitureListener(CatalogTreeModel catalogTreeModel) {
        this.catalogTreeModel = new WeakReference<CatalogTreeModel>(catalogTreeModel);
      }
      
      public void collectionChanged(CollectionEvent<CatalogPieceOfFurniture> ev) {
        // If catalog tree model was garbage collected, remove this listener from catalog
        CatalogTreeModel catalogTreeModel = this.catalogTreeModel.get();
        FurnitureCatalog catalog = (FurnitureCatalog)ev.getSource();
        if (catalogTreeModel == null) {
          catalog.removeFurnitureListener(this);
        } else {
          CatalogPieceOfFurniture piece = ev.getItem();
          switch (ev.getType()) {
            case ADD :
              if (piece.getCategory().getFurnitureCount() == 1) {
                // Fire nodes inserted for new category
                catalogTreeModel.fireTreeNodesInserted(new TreeModelEvent(this,
                    new Object [] {catalog}, 
                    new int [] {Collections.binarySearch(catalog.getCategories(), piece.getCategory())}, 
                    new Object [] {piece.getCategory()}));
              } else {
                // Fire nodes inserted for new piece
                catalogTreeModel.fireTreeNodesInserted(new TreeModelEvent(this,
                    new Object [] {catalog, piece.getCategory()},
                    new int [] {ev.getIndex()},
                    new Object [] {piece}));
              }
              break;
            case DELETE :
              if (piece.getCategory().getFurnitureCount() == 0) {
                // Fire nodes removed for deleted category
                catalogTreeModel.fireTreeNodesRemoved(new TreeModelEvent(this,
                    new Object [] {catalog},
                    new int [] {-(Collections.binarySearch(catalog.getCategories(), piece.getCategory()) + 1)},
                    new Object [] {piece.getCategory()}));
              } else {
                // Fire nodes removed for deleted piece
                catalogTreeModel.fireTreeNodesRemoved(new TreeModelEvent(this, 
                    new Object [] {catalog, piece.getCategory()},
                    new int [] {ev.getIndex()},
                    new Object [] {piece}));
              }
              break;
          }
        }
      }
    }
  }
}