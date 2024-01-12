/*
 * FurnitureLibraryTable.java 18 déc. 2009
 *
 * Furniture Library Editor, Copyright (c) 2009 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
package com.eteks.furniturelibraryeditor.swing;

import java.awt.Component;
import java.awt.Dimension;
import java.awt.EventQueue;
import java.awt.Rectangle;
import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.Transferable;
import java.awt.datatransfer.UnsupportedFlavorException;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.io.File;
import java.io.IOException;
import java.lang.ref.WeakReference;
import java.math.BigDecimal;
import java.text.Collator;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Currency;
import java.util.Date;
import java.util.List;

import javax.swing.ImageIcon;
import javax.swing.JComponent;
import javax.swing.JLabel;
import javax.swing.JTable;
import javax.swing.JToolTip;
import javax.swing.TransferHandler;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;
import javax.swing.table.AbstractTableModel;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableColumnModel;
import javax.swing.table.TableCellRenderer;
import javax.swing.table.TableColumn;
import javax.swing.table.TableColumnModel;
import javax.swing.table.TableModel;

import com.eteks.furniturelibraryeditor.model.FurnitureLibrary;
import com.eteks.furniturelibraryeditor.model.FurnitureLibraryUserPreferences;
import com.eteks.furniturelibraryeditor.model.FurnitureProperty;
import com.eteks.furniturelibraryeditor.viewcontroller.FurnitureLanguageController;
import com.eteks.furniturelibraryeditor.viewcontroller.FurnitureLibraryController;
import com.eteks.sweethome3d.io.DefaultFurnitureCatalog;
import com.eteks.sweethome3d.model.CatalogPieceOfFurniture;
import com.eteks.sweethome3d.model.CollectionEvent;
import com.eteks.sweethome3d.model.CollectionListener;
import com.eteks.sweethome3d.model.Content;
import com.eteks.sweethome3d.model.SelectionEvent;
import com.eteks.sweethome3d.model.SelectionListener;
import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.swing.CatalogItemToolTip;
import com.eteks.sweethome3d.swing.IconManager;
import com.eteks.sweethome3d.swing.SwingTools;
import com.eteks.sweethome3d.viewcontroller.View;

/**
 * A table used to edit furniture library.
 * @author Emmanuel Puybaret
 */
public class FurnitureLibraryTable extends JTable implements View {
  private ListSelectionListener tableSelectionListener;
  private CatalogItemToolTip    toolTip;

  public FurnitureLibraryTable(FurnitureLibrary furnitureLibrary,
                               FurnitureLibraryUserPreferences preferences,
                               FurnitureLibraryController furnitureLibraryController,
                               FurnitureLanguageController furnitureLanguageController) {
    super(new FurnitureLibraryTableModel(furnitureLibrary, furnitureLanguageController),
        new FurnitureLibraryTableColumnModel(furnitureLibrary, preferences, furnitureLanguageController));
    this.toolTip = new CatalogItemToolTip(CatalogItemToolTip.DisplayedInformation.ICON, preferences);
    float resolutionScale = SwingTools.getResolutionScale();
    if (resolutionScale != 1) {
      // Adapt row height to specified resolution scale
      setRowHeight(Math.round(getRowHeight() * resolutionScale));
    }
    addTableHeaderListener();
    setAutoResizeMode(AUTO_RESIZE_OFF);
    updateTableColumnsWidth();
    if (furnitureLibraryController != null) {
      addSelectionListeners(furnitureLibraryController);
      addMouseListener(furnitureLibraryController);
      addFurnitureLanguageListener(furnitureLibrary, furnitureLanguageController);
      setTransferHandler(new TableTransferHandler(furnitureLibraryController));
    }
    addUserPreferencesListener(preferences, furnitureLibrary, furnitureLanguageController);
  }

  /**
   * Adds a listener to <code>preferences</code> to repaint this table
   * and its header when unit changes.
   */
  private void addUserPreferencesListener(FurnitureLibraryUserPreferences preferences,
                                          FurnitureLibrary furnitureLibrary,
                                          FurnitureLanguageController furnitureLanguageController) {
    UserPreferencesChangeListener listener = new UserPreferencesChangeListener(this, furnitureLibrary, furnitureLanguageController);
    preferences.addPropertyChangeListener(UserPreferences.Property.UNIT, listener);
    preferences.addPropertyChangeListener(FurnitureLibraryUserPreferences.Property.FURNITURE_ID_EDITABLE, listener);
    preferences.addPropertyChangeListener(FurnitureLibraryUserPreferences.Property.FURNITURE_PROPERTIES, listener);
  }

  /**
   * Preferences property listener bound to this table with a weak reference to avoid
   * strong link between user preferences and this table.
   */
  private static class UserPreferencesChangeListener implements PropertyChangeListener {
    private WeakReference<FurnitureLibraryTable>        furnitureLibraryTable;
    private WeakReference<FurnitureLibrary>             furnitureLibrary;
    private WeakReference<FurnitureLanguageController>  furnitureLanguageController;

    public UserPreferencesChangeListener(FurnitureLibraryTable furnitureTable,
                                         FurnitureLibrary furnitureLibrary,
                                         FurnitureLanguageController furnitureLanguageController) {
      this.furnitureLibraryTable = new WeakReference<FurnitureLibraryTable>(furnitureTable);
      this.furnitureLibrary = new WeakReference<FurnitureLibrary>(furnitureLibrary);
      this.furnitureLanguageController = new WeakReference<FurnitureLanguageController>(furnitureLanguageController);
    }

    public void propertyChange(PropertyChangeEvent ev) {
      // If furniture table was garbage collected, remove this listener from preferences
      FurnitureLibraryTable furnitureLibraryTable = this.furnitureLibraryTable.get();
      FurnitureLibrary furnitureLibrary = this.furnitureLibrary.get();
      FurnitureLanguageController furnitureLanguageController = this.furnitureLanguageController.get();
      if (furnitureLibraryTable == null) {
        ((FurnitureLibraryUserPreferences)ev.getSource()).removePropertyChangeListener(
            UserPreferences.Property.valueOf(ev.getPropertyName()), this);
      } else {
        if (UserPreferences.Property.UNIT.name().equals(ev.getPropertyName())) {
          furnitureLibraryTable.repaint();
          furnitureLibraryTable.getTableHeader().repaint();
        } else {
          furnitureLibraryTable.setColumnModel(new FurnitureLibraryTableColumnModel(furnitureLibrary, ((FurnitureLibraryUserPreferences)ev.getSource()), furnitureLanguageController));
          furnitureLibraryTable.updateTableColumnsWidth();
        }
      }
    }
  }

  /**
   * Adds selection listeners to this table.
   */
  private void addSelectionListeners(final FurnitureLibraryController controller) {
    final SelectionListener controllerSelectionListener = new SelectionListener() {
        public void selectionChanged(SelectionEvent ev) {
          setSelectedFurniture(controller.getSelectedFurniture());
        }
      };
    this.tableSelectionListener = new ListSelectionListener () {
        public void valueChanged(ListSelectionEvent ev) {
          if (!ev.getValueIsAdjusting()) {
            controller.removeSelectionListener(controllerSelectionListener);
            int [] selectedRows = getSelectedRows();
            // Build the list of selected furniture
            List<CatalogPieceOfFurniture> selectedFurniture =
                new ArrayList<CatalogPieceOfFurniture>(selectedRows.length);
            TableModel tableModel = getModel();
            for (int index : selectedRows) {
              // Add to selectedFurniture table model value that stores piece
              selectedFurniture.add((CatalogPieceOfFurniture)tableModel.getValueAt(index, 0));
            }
            // Set the new selection in controller
            controller.setSelectedFurniture(selectedFurniture);
            controller.addSelectionListener(controllerSelectionListener);
          }
        }
      };
    getSelectionModel().addListSelectionListener(this.tableSelectionListener);
    controller.addSelectionListener(controllerSelectionListener);
  }

  /**
   * Adds a double click mouse listener to modify selected furniture.
   */
  private void addMouseListener(final FurnitureLibraryController controller) {
    addMouseListener(new MouseAdapter () {
        @Override
        public void mouseClicked(MouseEvent ev) {
          if (ev.getClickCount() == 2) {
            controller.modifySelectedFurniture();
          }
        }
      });
  }

  /**
   * Adds a mouse listener on table header that will sort furniture.
   */
  private void addTableHeaderListener() {
    // Sort on click in column header
    getTableHeader().addMouseListener(new MouseAdapter() {
        @Override
        public void mouseClicked(MouseEvent ev) {
          FurnitureLibraryTableModel tableModel = (FurnitureLibraryTableModel)getModel();
          List<CatalogPieceOfFurniture> selectedFurniture = new ArrayList<CatalogPieceOfFurniture>();
          for (int index : getSelectedRows()) {
            selectedFurniture.add((CatalogPieceOfFurniture)tableModel.getValueAt(index, 0));
          }
          int columnIndex = getTableHeader().columnAtPoint(ev.getPoint());
          Object columnIdentifier = getColumnModel().getColumn(columnIndex).getIdentifier();
          if (columnIdentifier instanceof FurnitureProperty) {
            FurnitureProperty property = (FurnitureProperty)columnIdentifier;
            if (columnIdentifier.equals(tableModel.getSortProperty())) {
              if (tableModel.isDescendingOrder()) {
                tableModel.setSortProperty(null);
              } else {
                tableModel.setDescendingOrder(true);
              }
            } else if (tableModel.getFurnitureComparator(property) != null) {
              tableModel.setSortProperty(property);
              tableModel.setDescendingOrder(false);
            }
          }
          getTableHeader().repaint();
          setSelectedFurniture(selectedFurniture);
        }
      });
  }

  /**
   * Selects furniture in table.
   */
  private void setSelectedFurniture(List<CatalogPieceOfFurniture> selectedFurniture) {
    getSelectionModel().removeListSelectionListener(this.tableSelectionListener);
    clearSelection();
    FurnitureLibraryTableModel tableModel = (FurnitureLibraryTableModel)getModel();
    int minIndex = Integer.MAX_VALUE;
    int maxIndex = Integer.MIN_VALUE;
    for (CatalogPieceOfFurniture piece : selectedFurniture) {
      if (piece instanceof CatalogPieceOfFurniture) {
        // Search index of piece in sorting table model
        int index = tableModel.getPieceOfFurnitureIndex((CatalogPieceOfFurniture)piece);
        // If the piece was found (during the addition of a piece to library, the model may not be updated yet)
        if (index != -1) {
          addRowSelectionInterval(index, index);
          minIndex = Math.min(minIndex, index);
          maxIndex = Math.max(maxIndex, index);
        }
      }
    }
    if (minIndex != Integer.MIN_VALUE) {
      makeRowsVisible(minIndex, maxIndex);
    }
    getSelectionModel().addListSelectionListener(this.tableSelectionListener);
  }

  /**
   * Ensures the rectangle which displays rows from <code>minIndex</code> to <code>maxIndex</code> is visible.
   */
  private void makeRowsVisible(int minRow, int maxRow) {
    // Compute the rectangle that includes a row
    Rectangle includingRectangle = getCellRect(minRow, 0, true);
    if (minRow != maxRow) {
      includingRectangle = includingRectangle.
          union(getCellRect(maxRow, 0, true));
    }
    if (getAutoResizeMode() == AUTO_RESIZE_OFF) {
      int lastColumn = getColumnCount() - 1;
      includingRectangle = includingRectangle.
          union(getCellRect(minRow, lastColumn, true));
      if (minRow != maxRow) {
        includingRectangle = includingRectangle.
            union(getCellRect(maxRow, lastColumn, true));
      }
    }
    scrollRectToVisible(includingRectangle);
  }

  /**
   * Adds listeners on furniture language change to resort furniture.
   */
  private void addFurnitureLanguageListener(FurnitureLibrary furnitureLibrary,
                                            final FurnitureLanguageController controller) {
    PropertyChangeListener listener = new PropertyChangeListener() {
        private boolean sorting = false;

        public void propertyChange(PropertyChangeEvent ev) {
          if (!sorting) {
            // Postpone update in case of multiple localized data is set
            sorting = true;
            EventQueue.invokeLater(new Runnable() {
                public void run() {
                  FurnitureLibraryTableModel tableModel = (FurnitureLibraryTableModel)getModel();
                  List<CatalogPieceOfFurniture> selectedFurniture = new ArrayList<CatalogPieceOfFurniture>();
                  for (int index : getSelectedRows()) {
                    selectedFurniture.add((CatalogPieceOfFurniture)tableModel.getValueAt(index, 0));
                  }
                  tableModel.sortFurniture();
                  setSelectedFurniture(selectedFurniture);
                  sorting = false;
                }
              });
          }
        }
      };
    controller.addPropertyChangeListener(FurnitureLanguageController.Property.FURNITURE_LANGUAGE, listener);
    furnitureLibrary.addPropertyChangeListener(FurnitureLibrary.Property.LOCALIZED_DATA, listener);
  }

  /**
   * Updates table columns width from the content of its cells.
   */
  private void updateTableColumnsWidth() {
    int intercellWidth = getIntercellSpacing().width;
    TableColumnModel columnModel = getColumnModel();
    TableModel tableModel = getModel();
    for (int columnIndex = 0, n = columnModel.getColumnCount(); columnIndex < n; columnIndex++) {
      TableColumn column = columnModel.getColumn(columnIndex);
      int modelColumnIndex = convertColumnIndexToModel(columnIndex);
      int preferredWidth = column.getPreferredWidth();
      preferredWidth = Math.max(preferredWidth, column.getHeaderRenderer().getTableCellRendererComponent(
          this, column.getHeaderValue(), false, false, -1, columnIndex).getPreferredSize().width);
      for (int rowIndex = 0, m = tableModel.getRowCount(); rowIndex < m; rowIndex++) {
        preferredWidth = Math.max(preferredWidth,
            column.getCellRenderer().getTableCellRendererComponent(
                this, tableModel.getValueAt(rowIndex, modelColumnIndex), false, false, -1, columnIndex).
                    getPreferredSize().width);
      }
      column.setPreferredWidth(preferredWidth + intercellWidth);
      column.setWidth(preferredWidth + intercellWidth);
    }
  }

  /**
   * Returns the tool tip displayed by this tree.
   */
  @Override
  public JToolTip createToolTip() {
    if (this.toolTip.isTipTextComplete()) {
      // Use toolTip object only for its text returned in getToolTipText
      return super.createToolTip();
    } else {
      this.toolTip.setComponent(this);
      return this.toolTip;
    }
  }

  /**
   * Returns a tooltip for furniture pieces described in this tree.
   */
  @Override
  public String getToolTipText(MouseEvent ev) {
    int column = columnAtPoint(ev.getPoint());
    if (column != -1
        && DefaultFurnitureCatalog.PropertyKey.ICON.getKeyPrefix().equals(((FurnitureProperty)getColumnModel().getColumn(column).getIdentifier()).getName())) {
      int row = rowAtPoint(ev.getPoint());
      if (row != -1) {
        this.toolTip.setCatalogItem((CatalogPieceOfFurniture)getModel().getValueAt(row, convertColumnIndexToModel(column)));
        return this.toolTip.getTipText();
      }
    }
    return null;
  }

  @Override
  public Dimension getPreferredScrollableViewportSize() {
    return new Dimension(getPreferredSize().width, 400);
  }


  /**
   * Model used by furniture table.
   */
  private static class FurnitureLibraryTableModel extends AbstractTableModel {
    private final FurnitureLibrary              furnitureLibrary;
    private final FurnitureLanguageController   controller;
    private List<CatalogPieceOfFurniture>       sortedFurniture;
    private FurnitureProperty                   sortProperty;
    private boolean                             descendingOrder;

    public FurnitureLibraryTableModel(FurnitureLibrary furnitureLibrary,
                                      FurnitureLanguageController controller) {
      this.furnitureLibrary = furnitureLibrary;
      this.controller = controller;
      addFurnitureLibraryListener(furnitureLibrary);
      sortFurniture();
    }

    private void addFurnitureLibraryListener(final FurnitureLibrary furnitureLibrary) {
      furnitureLibrary.addListener(new CollectionListener<CatalogPieceOfFurniture>() {
        public void collectionChanged(CollectionEvent<CatalogPieceOfFurniture> ev) {
            CatalogPieceOfFurniture piece = ev.getItem();
            int pieceIndex = ev.getIndex();
            switch (ev.getType()) {
              case ADD :
                int insertionIndex = getPieceOfFurnitureInsertionIndex(piece, furnitureLibrary, pieceIndex);
                if (insertionIndex != -1) {
                  sortedFurniture.add(insertionIndex, piece);
                  fireTableRowsInserted(insertionIndex, insertionIndex);
                }
                break;
              case DELETE :
                int deletionIndex = getPieceOfFurnitureDeletionIndex(piece, furnitureLibrary, pieceIndex);
                if (deletionIndex != -1) {
                  sortedFurniture.remove(deletionIndex);
                  fireTableRowsDeleted(deletionIndex, deletionIndex);
                }
                break;
            }
          }

          /**
           * Returns the index of an added <code>piece</code> in furniture table, with a default index
           * of <code>pieceIndex</code> if furniture library isn't sorting.
           * If <code>piece</code> isn't added to furniture table, the returned value is
           * equals to the insertion index where piece should be added.
           */
          private int getPieceOfFurnitureInsertionIndex(CatalogPieceOfFurniture piece,
                                                        FurnitureLibrary furnitureLibrary,
                                                        int pieceIndex) {
            if (sortProperty == null) {
              return pieceIndex;
            }
            // Default case when piece is included and furniture is  sorting
            int sortedIndex = Collections.binarySearch(sortedFurniture, piece, getFurnitureComparator(sortProperty));
            if (sortedIndex >= 0) {
              return sortedIndex;
            } else {
              return -(sortedIndex + 1);
            }
          }

          /**
           * Returns the index of an existing <code>piece</code> in furniture table, with a default index
           * of <code>pieceIndex</code> if furniture isn't sorting.
           */
          private int getPieceOfFurnitureDeletionIndex(CatalogPieceOfFurniture piece,
                                                       FurnitureLibrary furnitureLibrary,
                                                       int pieceIndex) {
            if (sortProperty == null) {
              return pieceIndex;
            }
            return getPieceOfFurnitureIndex(piece);
          }
        });
    }

    @Override
    public String getColumnName(int columnIndex) {
      // Column name is set by TableColumn instances themselves
      return null;
    }

    public int getColumnCount() {
      // Column count is set by TableColumnModel itself
      return 0;
    }

    public int getRowCount() {
      return this.sortedFurniture.size();
    }

    public Object getValueAt(int rowIndex, int columnIndex) {
      // Always return piece itself, the real property displayed at screen is chosen by renderer
      return this.sortedFurniture.get(rowIndex);
    }

    /**
     * Returns the index of <code>piece</code> in furniture table, or -1.
     */
    public int getPieceOfFurnitureIndex(CatalogPieceOfFurniture searchedPiece) {
      for (int i = 0, n = this.sortedFurniture.size(); i < n; i++) {
        CatalogPieceOfFurniture piece = this.sortedFurniture.get(i);
        if (searchedPiece == piece) {
          return i;
        }
      }
      return -1;
    }

    /**
     * Sorts furniture.
     */
    public void sortFurniture() {
      int previousRowCount = this.sortedFurniture != null
          ? this.sortedFurniture.size()
          : 0;
      List<CatalogPieceOfFurniture> libraryFurniture = this.furnitureLibrary.getFurniture();
      this.sortedFurniture = new ArrayList<CatalogPieceOfFurniture>(libraryFurniture);
      // Sort it if necessary
      if (this.sortProperty != null) {
        Comparator<CatalogPieceOfFurniture> furnitureComparator = getFurnitureComparator(this.sortProperty);
        Collections.sort(this.sortedFurniture, furnitureComparator);
      }

      if (previousRowCount != this.sortedFurniture.size()) {
        fireTableDataChanged();
      } else {
        fireTableRowsUpdated(0, getRowCount() - 1);
      }
    }

    public Comparator<CatalogPieceOfFurniture> getFurnitureComparator(final FurnitureProperty property) {
      final Collator collator = Collator.getInstance();
      Comparator<CatalogPieceOfFurniture> furnitureComparator = null;
      final String propertyName = property.getName();
      if (DefaultFurnitureCatalog.PropertyKey.ID.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              if (piece1.getId() == null) {
                return -1;
              } else if (piece2.getId() == null) {
                return 1;
              } else {
                return collator.compare(piece1.getId(), piece2.getId());
              }
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.NAME.getKeyPrefix().equals(propertyName)) {
         furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
             public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
               String piece1Name = (String)furnitureLibrary.getPieceOfFurnitureLocalizedData(
                   piece1, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece1.getName());
               String piece2Name = (String)furnitureLibrary.getPieceOfFurnitureLocalizedData(
                   piece2, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece2.getName());
               return collator.compare(piece1Name, piece2Name);
             }
           };
      } else if (DefaultFurnitureCatalog.PropertyKey.DESCRIPTION.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              String piece1Description = (String)furnitureLibrary.getPieceOfFurnitureLocalizedData(
                  piece1, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece1.getDescription());
              if (piece1Description == null) {
                return -1;
              } else {
                String piece2Description = (String)furnitureLibrary.getPieceOfFurnitureLocalizedData(
                    piece2, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece2.getDescription());
                if (piece2Description == null) {
                  return 1;
                } else {
                  return collator.compare(piece1Description, piece2Description);
                }
              }
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.CREATOR.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              return collator.compare(piece1.getCreator(), piece2.getCreator());
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.LICENSE.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              String piece1License = (String)furnitureLibrary.getPieceOfFurnitureLocalizedData(
                  piece1, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece1.getLicense());
              if (piece1License == null) {
                return -1;
              } else {
                String piece2License = (String)furnitureLibrary.getPieceOfFurnitureLocalizedData(
                    piece2, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece2.getLicense());
                if (piece2License == null) {
                  return 1;
                } else {
                  return collator.compare(piece1License, piece2License);
                }
              }
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.TAGS.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              String [] piece1Tags = (String [])furnitureLibrary.getPieceOfFurnitureLocalizedData(
                  piece1, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece1.getTags());
              if (piece1Tags == null) {
                return -1;
              } else {
                String [] piece2Tags = (String [])furnitureLibrary.getPieceOfFurnitureLocalizedData(
                    piece2, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece2.getTags());
                if (piece2Tags == null) {
                  return 1;
                } else {
                  return collator.compare(Arrays.toString(piece1Tags), Arrays.toString(piece2Tags));
                }
              }
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.INFORMATION.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              String piece1Information = (String)furnitureLibrary.getPieceOfFurnitureLocalizedData(
                  piece1, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece1.getInformation());
              if (piece1Information == null) {
                return -1;
              } else {
                String piece2Information = (String)furnitureLibrary.getPieceOfFurnitureLocalizedData(
                    piece2, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece2.getInformation());
                if (piece2Information == null) {
                  return 1;
                } else {
                  return collator.compare(piece1Information, piece2Information);
                }
              }
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.CREATION_DATE.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              if (piece1.getCreationDate() == null) {
                return -1;
              } else if (piece2.getCreationDate() == null) {
                return 1;
              } else {
                return piece1.getCreationDate().compareTo(piece2.getCreationDate());
              }
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.GRADE.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              if (piece1.getGrade() == null) {
                return -1;
              } else if (piece2.getGrade() == null) {
                return 1;
              } else {
                return piece1.getGrade().compareTo(piece2.getGrade());
              }
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.CATEGORY.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              String piece1Category = (String)furnitureLibrary.getPieceOfFurnitureLocalizedData(
                  piece1, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece1.getCategory().getName());
              String piece2Category = (String)furnitureLibrary.getPieceOfFurnitureLocalizedData(
                  piece2, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece2.getCategory().getName());
              return collator.compare(piece1Category, piece2Category);
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.PRICE.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              if (piece1.getPrice() == null) {
                return -1;
              } else if (piece2.getPrice() == null) {
                return 1;
              } else {
                return piece1.getPrice().compareTo(piece2.getPrice());
              }
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.VALUE_ADDED_TAX_PERCENTAGE.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              if (piece1.getValueAddedTaxPercentage() == null) {
                return -1;
              } else if (piece2.getValueAddedTaxPercentage() == null) {
                return 1;
              } else {
                return piece1.getValueAddedTaxPercentage().compareTo(piece2.getValueAddedTaxPercentage());
              }
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.WIDTH.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              return piece1.getWidth() < piece2.getWidth()
                  ? -1
                  : (piece1.getWidth() == piece2.getWidth()
                      ? 0 : 1);
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.DEPTH.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              return piece1.getDepth() < piece2.getDepth()
                  ? -1
                  : (piece1.getDepth() == piece2.getDepth()
                      ? 0 : 1);
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.HEIGHT.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              return piece1.getHeight() < piece2.getHeight()
                  ? -1
                  : (piece1.getHeight() == piece2.getHeight()
                      ? 0 : 1);
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.MOVABLE.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              return piece1.isMovable() == piece2.isMovable()
                  ? 0
                  : (piece1.isMovable()
                      ? -1 : 1);
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              return piece1.isDoorOrWindow() == piece2.isDoorOrWindow()
                  ? 0
                  : (piece1.isDoorOrWindow()
                      ? -1 : 1);
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.STAIRCASE_CUT_OUT_SHAPE.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              if (piece1.getStaircaseCutOutShape() == null) {
                return -1;
              } else if (piece2.getStaircaseCutOutShape() == null) {
                return 1;
              } else {
                return piece1.getStaircaseCutOutShape().compareTo(piece2.getStaircaseCutOutShape());
              }
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.ELEVATION.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              return piece1.getElevation() < piece2.getElevation()
                  ? -1
                  : (piece1.getElevation() == piece2.getElevation()
                      ? 0 : 1);
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.DROP_ON_TOP_ELEVATION.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              return piece1.getDropOnTopElevation() < piece2.getDropOnTopElevation()
                  ? -1
                  : (piece1.getDropOnTopElevation() == piece2.getDropOnTopElevation()
                      ? 0 : 1);
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.MODEL_SIZE.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              if (piece1.getModelSize() == null) {
                return -1;
              } else if (piece2.getModelSize() == null) {
                return 1;
              } else {
                return piece1.getModelSize().compareTo(piece2.getModelSize());
              }
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.RESIZABLE.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              return piece1.isResizable() == piece2.isResizable()
                  ? 0
                  : (piece1.isResizable()
                      ? -1 : 1);
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.DEFORMABLE.getKeyPrefix().equals(propertyName)) {
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              return piece1.isDeformable() == piece2.isDeformable()
                  ? 0
                  : (piece1.isDeformable()
                      ? -1 : 1);
            }
          };
      } else if (DefaultFurnitureCatalog.PropertyKey.TEXTURABLE.getKeyPrefix().equals(propertyName)) {
          furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
            public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
              return piece1.isTexturable() == piece2.isTexturable()
                  ? 0
                  : (piece1.isTexturable()
                      ? -1 : 1);
            }
          };
      } else {
        final DateFormat dateParser = new SimpleDateFormat("yyyy-MM-dd");
        furnitureComparator = new Comparator<CatalogPieceOfFurniture>() {
          public int compare(CatalogPieceOfFurniture piece1, CatalogPieceOfFurniture piece2) {
            String value1 = (String)furnitureLibrary.getPieceOfFurnitureLocalizedData(
                piece1, controller.getFurnitureLangauge(), propertyName, piece1.getProperty(propertyName));
            String value2 = (String)furnitureLibrary.getPieceOfFurnitureLocalizedData(
                piece2, controller.getFurnitureLangauge(), propertyName, piece2.getProperty(propertyName));
            if (value1 == null) {
              if (value2 == null) {
                return collator.compare(piece1.getName(), piece2.getName());
              } else {
                return -1;
              }
            } else if (value2 == null) {
              return 1;
            } else {
              FurnitureProperty.Type type = property.getType();
              if (type == null) {
                type = FurnitureProperty.Type.ANY;
              }
              switch (type) {
                case BOOLEAN:
                  return (Boolean.parseBoolean(value1) == Boolean.parseBoolean(value2))
                      ? 0
                      : (Boolean.parseBoolean(value1)
                            ? 1 : -1);
                case DATE:
                  try {
                    Date date1 = dateParser.parse(value1);
                    Date date2 = dateParser.parse(value2);
                    int valueComparison = date1.compareTo(date2);
                    if (valueComparison != 0) {
                      return valueComparison;
                    } else {
                      return collator.compare(piece1.getName(), piece2.getName());
                    }
                  } catch (ParseException ex) {
                    int valueComparison = collator.compare(value1, value2);
                    if (valueComparison != 0) {
                      return valueComparison;
                    } else {
                      return collator.compare(piece1.getName(), piece2.getName());
                    }
                  }
                case ANY:
                case INTEGER:
                case PERCENTAGE:
                case LENGTH:
                case NUMBER:
                case PRICE:
                  try {
                    double number1 = Double.parseDouble(value1);
                    double number2 = Double.parseDouble(value2);
                    int valueComparison = Double.compare(number1, number2);
                    if (valueComparison != 0) {
                      return valueComparison;
                    } else {
                      return collator.compare(piece1.getName(), piece2.getName());
                    }
                  } catch (NumberFormatException ex) {
                    int valueComparison = collator.compare(value1, value2);
                    if (valueComparison != 0) {
                      return valueComparison;
                    } else {
                      return collator.compare(piece1.getName(), piece2.getName());
                    }
                  }
                case CONTENT:
                case STRING:
                default:
                  return collator.compare(value1, value2);
              }
            }
          }
        };
      }
      if (this.descendingOrder) {
        furnitureComparator = Collections.reverseOrder(furnitureComparator);
      }
      return furnitureComparator;
    }

    public FurnitureProperty getSortProperty() {
      return this.sortProperty;
    }

    public void setSortProperty(FurnitureProperty sortProperty) {
      this.sortProperty = sortProperty;
      sortFurniture();
    }

    public boolean isDescendingOrder() {
      return this.descendingOrder;
    }

    public void setDescendingOrder(boolean descendingOrder) {
      this.descendingOrder = descendingOrder;
      sortFurniture();
    }
  }


  /**
   * Column table model used by furniture library table.
   */
  private static class FurnitureLibraryTableColumnModel extends DefaultTableColumnModel {
    public FurnitureLibraryTableColumnModel(FurnitureLibrary furnitureLibrary,
                                            FurnitureLibraryUserPreferences preferences,
                                            FurnitureLanguageController controller) {
      createColumns(furnitureLibrary, preferences, controller);
      addLanguageListener(preferences);
    }

    /**
     * Creates the list of available columns from furniture sortable properties.
     */
    private void createColumns(FurnitureLibrary furnitureLibrary,
                               FurnitureLibraryUserPreferences preferences,
                               FurnitureLanguageController controller) {
      // Create the list of custom columns
      TableCellRenderer headerRenderer = getHeaderRenderer();
      List<FurnitureProperty> editedProperties = new ArrayList<FurnitureProperty>();
      for (FurnitureProperty property : preferences.getFurnitureProperties()) {
        if (property.isDisplayed()) {
          editedProperties.add(property);
        }
      }
      for (FurnitureProperty columnProperty : editedProperties) {
        TableColumn tableColumn = new TableColumn();
        tableColumn.setIdentifier(columnProperty);
        tableColumn.setHeaderValue(getColumnName(columnProperty, preferences));
        tableColumn.setPreferredWidth(getColumnPreferredWidth(columnProperty));
        tableColumn.setCellRenderer(getColumnRenderer(columnProperty, furnitureLibrary, preferences, controller));
        tableColumn.setHeaderRenderer(headerRenderer);
        addColumn(tableColumn);
      }
    }

    /**
     * Adds a property change listener to <code>preferences</code> to update
     * column names when preferred language changes.
     */
    private void addLanguageListener(UserPreferences preferences) {
      preferences.addPropertyChangeListener(UserPreferences.Property.LANGUAGE,
          new LanguageChangeListener(this));
    }

    /**
     * Preferences property listener bound to this component with a weak reference to avoid
     * strong link between preferences and this component.
     */
    private static class LanguageChangeListener implements PropertyChangeListener {
      private WeakReference<FurnitureLibraryTableColumnModel> furnitureTableColumnModel;

      public LanguageChangeListener(FurnitureLibraryTableColumnModel furnitureTable) {
        this.furnitureTableColumnModel = new WeakReference<FurnitureLibraryTableColumnModel>(furnitureTable);
      }

      public void propertyChange(PropertyChangeEvent ev) {
        // If furniture table column model was garbage collected, remove this listener from preferences
        FurnitureLibraryTableColumnModel furnitureTableColumnModel = this.furnitureTableColumnModel.get();
        UserPreferences preferences = (UserPreferences)ev.getSource();
        if (furnitureTableColumnModel == null) {
          preferences.removePropertyChangeListener(UserPreferences.Property.LANGUAGE, this);
        } else {
          // Change column name and renderer from current locale
          for (int i = 0; i < furnitureTableColumnModel.getColumnCount(); i++) {
            TableColumn tableColumn = furnitureTableColumnModel.getColumn(i);
            Object columnIdentifier = tableColumn.getIdentifier();
            if (columnIdentifier instanceof FurnitureProperty) {
              try {
                tableColumn.setHeaderValue(furnitureTableColumnModel.getColumnName(
                    (FurnitureProperty)columnIdentifier, preferences));
              } catch (IllegalArgumentException ex) {
                // Don't change unknown columns
              }
            }
          }
        }
      }
    }

    /**
     * Returns localized column names.
     */
    private String getColumnName(FurnitureProperty property,
                                 UserPreferences preferences) {
      if (property.getDefaultPropertyKeyName() != null) {
        try {
          return preferences.getLocalizedString(FurnitureLibraryTable.class, property.getName() + "Column");
        } catch (IllegalArgumentException ex) {
        }
      }
      return property.getName();
    }

    /**
     * Returns the preferred width of a column.
     */
    private int getColumnPreferredWidth(FurnitureProperty property) {
      String propertyName = property.getName();
      if (DefaultFurnitureCatalog.PropertyKey.ID.getKeyPrefix().equals(propertyName)) {
        return 120;
      } else if (DefaultFurnitureCatalog.PropertyKey.DESCRIPTION.getKeyPrefix().equals(propertyName)
          || DefaultFurnitureCatalog.PropertyKey.INFORMATION.getKeyPrefix().equals(propertyName)
          || DefaultFurnitureCatalog.PropertyKey.TAGS.getKeyPrefix().equals(propertyName)) {
        return 150;
      } else if (DefaultFurnitureCatalog.PropertyKey.CATEGORY.getKeyPrefix().equals(propertyName)
                 || DefaultFurnitureCatalog.PropertyKey.LICENSE.getKeyPrefix().equals(propertyName)) {
        return 70;
      } else if (DefaultFurnitureCatalog.PropertyKey.PRICE.getKeyPrefix().equals(propertyName)) {
        return 70;
      } else if (DefaultFurnitureCatalog.PropertyKey.ICON.getKeyPrefix().equals(propertyName)
          || DefaultFurnitureCatalog.PropertyKey.PLAN_ICON.getKeyPrefix().equals(propertyName)) {
        return 50;
      } else if (DefaultFurnitureCatalog.PropertyKey.STAIRCASE_CUT_OUT_SHAPE.getKeyPrefix().equals(propertyName)) {
        return 20;
      } else if (property.getType() != null) {
        switch (property.getType()) {
          case BOOLEAN:
            return 20;
          case DATE:
          case INTEGER:
          case PERCENTAGE:
          case PRICE:
          case CONTENT:
            return 50;
          case LENGTH:
          case NUMBER:
            return 45;
          case STRING:
          default:
            return 100;
        }
      } else {
        return 70;
      }
    }

    /**
     * Returns column renderers.
     */
    private TableCellRenderer getColumnRenderer(final FurnitureProperty property,
                                                FurnitureLibrary furnitureLibrary,
                                                UserPreferences preferences,
                                                FurnitureLanguageController controller) {
      if (DefaultFurnitureCatalog.PropertyKey.STAIRCASE_CUT_OUT_SHAPE.getKeyPrefix().equals(property.getName())) {
        return getBooleanRenderer(property);
      } else if (property.getType() != null
                 && property.getType() != FurnitureProperty.Type.ANY) {
        switch (property.getType()) {
          case BOOLEAN:
            return getBooleanRenderer(property);
          case DATE:
            return getDateRenderer(property);
          case INTEGER:
            return getIntegerRenderer(property);
          case PERCENTAGE:
            return getPercentageRenderer(property);
          case CONTENT:
            return getIconRenderer(property);
          case LENGTH:
            return getLengthRenderer(property, preferences);
          case NUMBER:
            return getNumberRenderer(property);
          case PRICE:
            return getPriceRenderer(property, preferences);
          case STRING:
          default:
            return getStringRenderer(property, furnitureLibrary, controller);
        }
      } else {
        return new DefaultTableCellRenderer() {
            private TableCellRenderer booleanRenderer;

            @Override
            public Component getTableCellRendererComponent(JTable table, Object value, boolean isSelected,
                                                           boolean hasFocus, int row, int column) {
              String propertyValue = ((CatalogPieceOfFurniture)value).getProperty(property.getName());
              if (propertyValue != null) {
                try {
                  // Try to display value as a number
                  super.getTableCellRendererComponent(table, NumberFormat.getInstance().format(new BigDecimal(propertyValue)),
                      isSelected, hasFocus, row, column);
                  setHorizontalAlignment(JLabel.RIGHT);
                  return this;
                } catch (NumberFormatException ex) {
                }

                if ("true".equalsIgnoreCase(propertyValue)
                    || "false".equalsIgnoreCase(propertyValue)) {
                  if (this.booleanRenderer == null) {
                    this.booleanRenderer = table.getDefaultRenderer(Boolean.class);
                  }
                  return this.booleanRenderer.getTableCellRendererComponent(table, Boolean.parseBoolean(propertyValue), isSelected, hasFocus, row, column);
                }
              }
              super.getTableCellRendererComponent(table, propertyValue, isSelected, hasFocus, row, column);
              setHorizontalAlignment(JLabel.LEFT);
              return this;
            }
          };
      }
    }

    /**
     * Returns a renderer that displays a string property of a piece of furniture.
     */
    private TableCellRenderer getStringRenderer(final FurnitureProperty property,
                                                final FurnitureLibrary furnitureLibrary,
                                                final FurnitureLanguageController controller) {
      final String propertyName = property.getName();
      return new DefaultTableCellRenderer() {
          @Override
          public Component getTableCellRendererComponent(JTable table, Object value,
              boolean isSelected, boolean hasFocus, int row, int column) {
            CatalogPieceOfFurniture piece = (CatalogPieceOfFurniture)value;
            if (DefaultFurnitureCatalog.PropertyKey.ID.getKeyPrefix().equals(propertyName)) {
              value = piece.getId();
            } else if (DefaultFurnitureCatalog.PropertyKey.NAME.getKeyPrefix().equals(propertyName)) {
              value = furnitureLibrary.getPieceOfFurnitureLocalizedData(
                  piece, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece.getName());
            } else if (DefaultFurnitureCatalog.PropertyKey.DESCRIPTION.getKeyPrefix().equals(propertyName)) {
              value = furnitureLibrary.getPieceOfFurnitureLocalizedData(
                  piece, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece.getDescription());
            } else if (DefaultFurnitureCatalog.PropertyKey.INFORMATION.getKeyPrefix().equals(propertyName)) {
              value = furnitureLibrary.getPieceOfFurnitureLocalizedData(
                  piece, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece.getInformation());
            } else if (DefaultFurnitureCatalog.PropertyKey.CREATOR.getKeyPrefix().equals(propertyName)) {
              value = piece.getCreator();
            } else if (DefaultFurnitureCatalog.PropertyKey.LICENSE.getKeyPrefix().equals(propertyName)) {
              value = furnitureLibrary.getPieceOfFurnitureLocalizedData(
                  piece, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece.getLicense());
            } else if (DefaultFurnitureCatalog.PropertyKey.TAGS.getKeyPrefix().equals(propertyName)) {
              String tagsText = Arrays.toString((String [])furnitureLibrary.getPieceOfFurnitureLocalizedData(
                  piece, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece.getTags()));
              value = tagsText.substring(1, tagsText.length() - 1);
            } else if (DefaultFurnitureCatalog.PropertyKey.CATEGORY.getKeyPrefix().equals(propertyName)) {
              value = furnitureLibrary.getPieceOfFurnitureLocalizedData(
                  piece, controller.getFurnitureLangauge(), property.getDefaultPropertyKeyName(), piece.getCategory().getName());
            } else if (DefaultFurnitureCatalog.PropertyKey.CURRENCY.getKeyPrefix().equals(propertyName)) {
              value = piece.getCurrency();
            } else {
              value = (String)furnitureLibrary.getPieceOfFurnitureLocalizedData(
                  piece, controller.getFurnitureLangauge(), propertyName, piece.getProperty(propertyName));
            }
            return super.getTableCellRendererComponent(
                table, value, isSelected, hasFocus, row, column);
          }
        };
    }

    /**
     * Returns a renderer that displays the icons of a piece of furniture.
     */
    private TableCellRenderer getIconRenderer(FurnitureProperty property) {
      final String propertyName = property.getName();
      return new DefaultTableCellRenderer() {
        @Override
        public Component getTableCellRendererComponent(JTable table,
             Object value, boolean isSelected, boolean hasFocus,
             int row, int column) {
          JLabel label = (JLabel)super.getTableCellRendererComponent(
            table, "", isSelected, hasFocus, row, column);
          CatalogPieceOfFurniture piece = (CatalogPieceOfFurniture)value;
          if (DefaultFurnitureCatalog.PropertyKey.ICON.getKeyPrefix().equals(propertyName)) {
            value = piece.getIcon();
          } else if (DefaultFurnitureCatalog.PropertyKey.PLAN_ICON.getKeyPrefix().equals(propertyName)) {
            value = piece.getPlanIcon();
          } else {
            value = piece.getContentProperty(propertyName);
          }
          if (value != null) {
            label.setIcon(IconManager.getInstance().getIcon((Content)value, table.getRowHeight() - 1, table));
            label.setHorizontalAlignment(JLabel.CENTER);
          } else {
            label.setIcon(null);
          }
          return label;
        }
      };
    }

    /**
     * Returns a renderer that displays the property of a piece of furniture as a date.
     */
    private TableCellRenderer getDateRenderer(final FurnitureProperty property) {
      return new DefaultTableCellRenderer() {
          public Component getTableCellRendererComponent(JTable table,
               Object value, boolean isSelected, boolean hasFocus,
               int row, int column) {
            try {
              CatalogPieceOfFurniture piece = (CatalogPieceOfFurniture)value;
              value = DefaultFurnitureCatalog.PropertyKey.CREATION_DATE.getKeyPrefix().equals(property.getName())
                  ? piece.getCreationDate()
                  : new SimpleDateFormat("yyyy-MM-dd").parse(piece.getProperty(property.getName()));
            } catch (NullPointerException ex) {
              value = null;
            } catch (ParseException ex) {
              value = null;
            }
            if (value != null) {
              value = DateFormat.getDateInstance(DateFormat.SHORT).format(value);
            } else {
              value = "";
            }
            setHorizontalAlignment(JLabel.RIGHT);
            return super.getTableCellRendererComponent(
                table, value, isSelected, hasFocus, row, column);
          }
        };
    }

    /**
     * Returns a renderer that displays the property of a piece of furniture as a integer.
     */
    private TableCellRenderer getIntegerRenderer(final FurnitureProperty property) {
      return new DefaultTableCellRenderer() {
          public Component getTableCellRendererComponent(JTable table,
               Object value, boolean isSelected, boolean hasFocus,
               int row, int column) {
            CatalogPieceOfFurniture piece = (CatalogPieceOfFurniture)value;
            if (DefaultFurnitureCatalog.PropertyKey.MODEL_SIZE.getKeyPrefix().equals(property.getName())) {
              value = piece.getModelSize();
            } else if (DefaultFurnitureCatalog.PropertyKey.MODEL_FLAGS.getKeyPrefix().equals(property.getName())) {
              value = piece.getModelFlags();
            } else {
              try {
                value = Long.parseLong(piece.getProperty(property.getName()));
              } catch (NullPointerException ex) {
                value = null;
              } catch (NumberFormatException ex) {
                value = null;
              }
            }
            if (value != null) {
              value = NumberFormat.getIntegerInstance().format(value);
            } else {
              value = "";
            }
            setHorizontalAlignment(JLabel.RIGHT);
            return super.getTableCellRendererComponent(
                table, value, isSelected, hasFocus, row, column);
          }
        };
    }

    /**
     * Returns a renderer that displays the property of a piece of furniture as a number.
     */
    private TableCellRenderer getNumberRenderer(final FurnitureProperty property) {
      return new DefaultTableCellRenderer() {
          public Component getTableCellRendererComponent(JTable table,
               Object value, boolean isSelected, boolean hasFocus,
               int row, int column) {
            CatalogPieceOfFurniture piece = (CatalogPieceOfFurniture)value;
            if (DefaultFurnitureCatalog.PropertyKey.GRADE.getKeyPrefix().equals(property.getName())) {
              value = piece.getGrade();
            } else {
              try {
                value = Float.parseFloat(piece.getProperty(property.getName()));
              } catch (NullPointerException ex) {
                value = null;
              } catch (NumberFormatException ex) {
                value = null;
              }
            }
            if (value != null) {
              value = NumberFormat.getNumberInstance().format(value);
            } else {
              value = "";
            }
            setHorizontalAlignment(JLabel.RIGHT);
            return super.getTableCellRendererComponent(
                table, value, isSelected, hasFocus, row, column);
          }
        };
    }

    /**
     * Returns a renderer that converts the displayed <code>property</code> of a piece of furniture
     * to inch in case preferences unit us equal to INCH.
     */
    private TableCellRenderer getLengthRenderer(FurnitureProperty property,
                                                final UserPreferences preferences) {
      final String propertyName = property.getName();
      return new DefaultTableCellRenderer() {
          public Component getTableCellRendererComponent(JTable table,
               Object value, boolean isSelected, boolean hasFocus,
               int row, int column) {
            CatalogPieceOfFurniture piece = (CatalogPieceOfFurniture)value;
            if (DefaultFurnitureCatalog.PropertyKey.WIDTH.getKeyPrefix().equals(propertyName)) {
              value = piece.getWidth();
            } else if (DefaultFurnitureCatalog.PropertyKey.DEPTH.getKeyPrefix().equals(propertyName)) {
              value = piece.getDepth();
            } else if (DefaultFurnitureCatalog.PropertyKey.HEIGHT.getKeyPrefix().equals(propertyName)) {
              value = piece.getHeight();
            } else if (DefaultFurnitureCatalog.PropertyKey.ELEVATION.getKeyPrefix().equals(propertyName)) {
              value = piece.getElevation();
            } else if (DefaultFurnitureCatalog.PropertyKey.DROP_ON_TOP_ELEVATION.getKeyPrefix().equals(propertyName)) {
              value = piece.getDropOnTopElevation();
            } else {
              try {
                value = Float.parseFloat(piece.getProperty(propertyName));
              } catch (NullPointerException ex) {
                value = null;
              } catch (NumberFormatException ex) {
                value = null;
              }
            }
            if (value != null) {
              value = preferences.getLengthUnit().getFormat().format((Float)value);
            } else {
              value = "";
            }
            setHorizontalAlignment(JLabel.RIGHT);
            return super.getTableCellRendererComponent(
                table, value, isSelected, hasFocus, row, column);
          }
        };
    }

    /**
     * Returns a renderer that displays the property of a piece of furniture as a price.
     */
    private TableCellRenderer getPriceRenderer(final FurnitureProperty property,
                                               final UserPreferences preferences) {
      return new DefaultTableCellRenderer() {
          public Component getTableCellRendererComponent(JTable table,
               Object value, boolean isSelected, boolean hasFocus,
               int row, int column) {
            CatalogPieceOfFurniture piece = (CatalogPieceOfFurniture)value;
            try {
              value = DefaultFurnitureCatalog.PropertyKey.PRICE.getKeyPrefix().equals(property.getName())
                  ? piece.getPrice()
                  : new BigDecimal(piece.getProperty(property.getName()));
            } catch (NullPointerException ex) {
              value = null;
            } catch (NumberFormatException ex) {
              value = null;
            }
            if (value != null) {
              String currencyCode = piece.getCurrency() != null
                  ? piece.getCurrency()
                  : preferences.getCurrency();
              NumberFormat currencyFormat;
              if (currencyCode != null) {
                currencyFormat = NumberFormat.getCurrencyInstance();
                Currency currency = Currency.getInstance(currencyCode);
                currencyFormat.setCurrency(currency);
                currencyFormat.setMaximumFractionDigits(currency.getDefaultFractionDigits());
              } else {
                currencyFormat = new DecimalFormat("##0.00");
              }
              value = currencyFormat.format(value);
            } else {
              value = "";
            }
            setHorizontalAlignment(JLabel.RIGHT);
            return super.getTableCellRendererComponent(
                table, value, isSelected, hasFocus, row, column);
          }
        };
    }

    /**
     * Returns a renderer that displays the property of a piece of furniture as a percentage.
     */
    private TableCellRenderer getPercentageRenderer(final FurnitureProperty property) {
      return new DefaultTableCellRenderer() {
          @Override
          public Component getTableCellRendererComponent(JTable table,
               Object value, boolean isSelected, boolean hasFocus,
               int row, int column) {
            BigDecimal percentageValue;
            try {
              CatalogPieceOfFurniture piece = (CatalogPieceOfFurniture)value;
              percentageValue = DefaultFurnitureCatalog.PropertyKey.VALUE_ADDED_TAX_PERCENTAGE.getKeyPrefix().equals(property.getName())
                  ? piece.getValueAddedTaxPercentage()
                  : new BigDecimal(piece.getProperty(property.getName()));
            } catch (NullPointerException ex) {
              percentageValue = null;
            } catch (NumberFormatException ex) {
              percentageValue = null;
            }
            if (percentageValue != null) {
              NumberFormat percentInstance = NumberFormat.getPercentInstance();
              percentInstance.setMinimumFractionDigits(percentageValue.scale() - 2);
              value = percentInstance.format(percentageValue);
            } else {
              value = "";
            }
            setHorizontalAlignment(JLabel.RIGHT);
            return super.getTableCellRendererComponent(
                table, value, isSelected, hasFocus, row, column);
          }
        };
    }

    /**
     * Returns a renderer that displays a property of a piece of furniture
     * with <code>JTable</code> default boolean renderer.
     */
    private TableCellRenderer getBooleanRenderer(FurnitureProperty property) {
      // Renderer super class used to display booleans
      final String propertyName = property.getName();
      return new TableCellRenderer() {
          private TableCellRenderer booleanRenderer;

          public Component getTableCellRendererComponent(JTable table,
               Object value, boolean isSelected, boolean hasFocus, int row, int column) {
            if (this.booleanRenderer == null) {
              this.booleanRenderer = table.getDefaultRenderer(Boolean.class);
            }
            CatalogPieceOfFurniture piece = (CatalogPieceOfFurniture)value;
            if (DefaultFurnitureCatalog.PropertyKey.MOVABLE.getKeyPrefix().equals(propertyName)) {
              value = piece.isMovable();
            } else if (DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW.getKeyPrefix().equals(propertyName)) {
              value = piece.isDoorOrWindow();
            } else if (DefaultFurnitureCatalog.PropertyKey.RESIZABLE.getKeyPrefix().equals(propertyName)) {
              value = piece.isResizable();
            } else if (DefaultFurnitureCatalog.PropertyKey.DEFORMABLE.getKeyPrefix().equals(propertyName)) {
              value = piece.isDeformable();
            } else if (DefaultFurnitureCatalog.PropertyKey.TEXTURABLE.getKeyPrefix().equals(propertyName)) {
              value = piece.isTexturable();
            } else if (DefaultFurnitureCatalog.PropertyKey.HORIZONTALLY_ROTATABLE.getKeyPrefix().equals(propertyName)) {
              value = piece.isHorizontallyRotatable();
            } else if (DefaultFurnitureCatalog.PropertyKey.STAIRCASE_CUT_OUT_SHAPE.getKeyPrefix().equals(propertyName)) {
              value = piece.getStaircaseCutOutShape() != null;
            } else {
              value = Boolean.parseBoolean(piece.getProperty(propertyName));
            }
            JComponent component = (JComponent)this.booleanRenderer.getTableCellRendererComponent(
                table, value, isSelected, hasFocus, row, column);
            component.setEnabled(false);
            return component;
          }
        };
    }

    /**
     * Returns column header renderer that displays an ascending or a descending icon
     * when column is sorted, beside column name.
     */
    private TableCellRenderer getHeaderRenderer() {
      // Return a table renderer that displays the icon matching current sort
      return new TableCellRenderer() {
          private TableCellRenderer headerRenderer;
          private ImageIcon ascendingSortIcon = new ImageIcon(getClass().getResource("resources/ascending.png"));
          private ImageIcon descendingSortIcon = new ImageIcon(getClass().getResource("resources/descending.png"));

          public Component getTableCellRendererComponent(JTable table,
               Object value, boolean isSelected, boolean hasFocus, int row, int column) {
            if (this.headerRenderer == null) {
              this.headerRenderer = table.getTableHeader().getDefaultRenderer();
            }
            // Get default label
            JLabel label = (JLabel)this.headerRenderer.getTableCellRendererComponent(
                table, value, isSelected, hasFocus, row, column);
            // Add to column an icon matching sort
            FurnitureLibraryTableModel model = (FurnitureLibraryTableModel)table.getModel();
            if (getColumn(column).getIdentifier().equals(model.getSortProperty())) {
              label.setHorizontalTextPosition(JLabel.LEADING);
              if (model.isDescendingOrder()) {
                label.setIcon(descendingSortIcon);
              } else {
                label.setIcon(ascendingSortIcon);
              }
            } else {
              label.setIcon(null);
            }
            return label;
          }
        };
    }
  }


  /**
   * Table transfer handler.
   */
  private class TableTransferHandler extends TransferHandler {
    private final FurnitureLibraryController furnitureController;

    /**
     * Creates a handler able to receive furniture files.
     */
    public TableTransferHandler(FurnitureLibraryController furnitureController) {
      this.furnitureController = furnitureController;
    }

    @Override
    public int getSourceActions(JComponent source) {
      return NONE;
    }

    /**
     * Returns <code>true</code> if flavors contains
     * <code>DataFlavor.javaFileListFlavor</code> flavor.
     */
    @Override
    public boolean canImport(JComponent destination, DataFlavor [] flavors) {
      return this.furnitureController != null
          && Arrays.asList(flavors).contains(DataFlavor.javaFileListFlavor);
    }

    /**
     * Add to library the furniture contained in <code>transferable</code>.
     */
    @SuppressWarnings("unchecked")
    @Override
    public boolean importData(JComponent destination, Transferable transferable) {
      if (canImport(destination, transferable.getTransferDataFlavors())) {
        try {
          List<File> files = (List<File>)transferable.getTransferData(DataFlavor.javaFileListFlavor);
          final List<String> importableModels = new ArrayList<String>();
          for (File file : files) {
            if (!file.isDirectory()) {
              String absolutePath = file.getAbsolutePath();
              importableModels.add(absolutePath);
            }
          }
          EventQueue.invokeLater(new Runnable() {
              public void run() {
                furnitureController.importFurniture(importableModels.toArray(new String [importableModels.size()]));
              }
            });
          return !importableModels.isEmpty();
        } catch (UnsupportedFlavorException ex) {
          throw new RuntimeException("Can't import", ex);
        } catch (IOException ex) {
          throw new RuntimeException("Can't access to data", ex);
        }
      } else {
        return false;
      }
    }
  }
}


