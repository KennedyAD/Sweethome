/*
 * FurnitureTableTest.java 11 mai 2006
 * 
 * Copyright (c) 2006 Emmanuel PUYBARET / eTeks <info@eteks.com>. All Rights
 * Reserved.
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
package com.eteks.sweethome3d.junit;

import java.awt.BorderLayout;
import java.awt.Component;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.ResourceBundle;

import javax.swing.ImageIcon;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JRootPane;
import javax.swing.JTable;
import javax.swing.JToolBar;
import javax.swing.table.TableCellRenderer;
import javax.swing.table.TableModel;

import junit.framework.TestCase;

import com.eteks.sweethome3d.io.DefaultUserPreferences;
import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomePieceOfFurniture;
import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.swing.CatalogController;
import com.eteks.sweethome3d.swing.CatalogTree;
import com.eteks.sweethome3d.swing.FurnitureController;
import com.eteks.sweethome3d.swing.FurnitureTable;
import com.eteks.sweethome3d.swing.HomeController;

public class FurnitureTableTest extends TestCase {
  public void testFurnitureTable()  {
    // 1. Choose a locale that displays furniture dimensions in inches
    Locale.setDefault(Locale.US);
    // Create model objects
    UserPreferences preferences = new DefaultUserPreferences();
    Home home = new Home();

    // Check the current unit isn't centimeter
    UserPreferences.Unit currentUnit = preferences.getUnit();
    assertFalse("Unit is in centimeter", currentUnit == UserPreferences.Unit.CENTIMETER);
   
    // Create home controller
    HomeController homeController = 
        new HomeController(home, preferences);
    // Retrieve tree and table objects created by home controller
    CatalogController catalogController = 
        homeController.getCatalogController();
    CatalogTree tree = (CatalogTree)catalogController.getView();
    FurnitureController furnitureController = 
        homeController.getFurnitureController();
    FurnitureTable table = 
        (FurnitureTable)furnitureController.getView();

    // 2. Select two pieces of furniture in tree and add them to the table
    tree.expandRow(0); 
    tree.addSelectionInterval(1, 2);
    homeController.addHomeFurniture();

    // Check the model contains two pieces
    List<HomePieceOfFurniture> homeFurniture = home.getFurniture(); 
    assertEquals("Home doesn't contain 2 pieces", 
        2, homeFurniture.size());
    //  Check the two pieces in table are selected
    assertEquals("Table doesn't display 2 selected pieces", 
        2, table.getSelectedFurniture().size());

    // 3. Select the first piece in table, delete it
    table.setSelectedFurniture(Arrays.asList(
        new HomePieceOfFurniture [] {homeFurniture.get(0)}));
    furnitureController.deleteSelectedFurniture();
    // Check the model contains only one piece
    assertEquals("Home doesn't contain 1 piece", 
        1, home.getFurniture().size());
    // Check the table doesn't display any selection
    assertEquals("Table selection isn't empty", 
        0, table.getSelectedFurniture().size());

    // 4. Undo previous operation
    homeController.undo();
    // Check the model contains two pieces
    assertEquals("Home doesn't contain 2 pieces after undo", 
        2, home.getFurniture().size());
    //  Check the deleted piece in table is selected
    assertEquals("Table selection doesn't contain the previously deleted piece",
        homeFurniture.get(0), table.getSelectedFurniture().get(0));


    // 5. Undo first operation on table
    homeController.undo();
    // Check the model and the table doesn't contain any piece
    assertEquals("Home isn't empty after 2 undo operations", 
        0, home.getFurniture().size());

    // 6. Redo the last undone operation on table
    homeController.redo();
    // Check the model contains the two pieces that where added at beginning
    assertEquals("Home doesn't contain the same furniture",
        homeFurniture, home.getFurniture());
    assertEquals("Table doesn't display 2 selected pieces",
        2, table.getSelectedFurniture().size());

    // 7. Redo the delete operation
    homeController.redo();
    // Check the model contains only one piece
    assertEquals("Home doesn't contain 1 piece", 
        1, home.getFurniture().size());
    // Check the table doesn't display any selection
    assertEquals("Table selection isn't empty", 
        0, table.getSelectedFurniture().size());

    // 8. Check the displayed depth in table are different in French and US version
    String widthInInch = getRenderedDepth(table, 0);
    preferences.setUnit(UserPreferences.Unit.CENTIMETER);
    String widthInMeter = getRenderedDepth(table, 0);
    assertFalse("Same depth in different units", 
        widthInInch.equals(widthInMeter));
  }

  private String getRenderedDepth(JTable table, int row) {
    // Get index of detph column in model
    ResourceBundle resource = 
      ResourceBundle.getBundle(table.getClass().getName());
    String columnName = resource.getString("depthColumn");
    int modelColumnIndex = table.getColumn(columnName).getModelIndex();

    // Get depth value at row
    TableModel model = table.getModel();
    Object cellValue = model.getValueAt(row, modelColumnIndex);
    
    // Get component used to render the depth cell at row
    TableCellRenderer renderer = table.getCellRenderer(row, modelColumnIndex);
    int tableColumnIndex = table.convertColumnIndexToView(modelColumnIndex);
    Component cellLabel = renderer.getTableCellRendererComponent(
        table, cellValue, false, false, row, tableColumnIndex);
    
    // Return rendered depth
    return ((JLabel)cellLabel).getText();
  }

  public static void main(String [] args) {
    UserPreferences preferences = new DefaultUserPreferences();
    Home home = new Home();
    new HomeControllerTest(home, preferences);
  }

  private static class HomeControllerTest extends HomeController {
    public HomeControllerTest(Home home, UserPreferences preferences) {
      super(home, preferences);
      new HomeViewTest(this).displayView();
    }
  }

  private static class HomeViewTest extends JRootPane {
    public HomeViewTest(final HomeController controller) {
      // Create buttons that will launch controler methods
      JButton addButton = new JButton(new ImageIcon(
          getClass().getResource("resources/Add16.gif")));
      addButton.addActionListener(new ActionListener() {
        public void actionPerformed(ActionEvent ev) {
          controller.addHomeFurniture();
        }
      });
      JButton deleteButton = new JButton(new ImageIcon(
          getClass().getResource("resources/Delete16.gif")));
      deleteButton.addActionListener(new ActionListener() {
        public void actionPerformed(ActionEvent ev) {
          controller.getFurnitureController().deleteSelectedFurniture();
        }
      });
      JButton undoButton = new JButton(new ImageIcon(
          getClass().getResource("resources/Undo16.gif")));
      undoButton.addActionListener(new ActionListener() {
        public void actionPerformed(ActionEvent ev) {
          controller.undo();
        }
      });
      JButton redoButton = new JButton(new ImageIcon(
          getClass().getResource("resources/Redo16.gif")));
      redoButton.addActionListener(new ActionListener() {
        public void actionPerformed(ActionEvent ev) {
          controller.redo();
        }
      });
      // Put them it a tool bar
      JToolBar toolBar = new JToolBar();
      toolBar.add(addButton);
      toolBar.add(deleteButton);
      toolBar.add(undoButton);
      toolBar.add(redoButton);
      // Display the tool bar and main view in this pane
      getContentPane().add(toolBar, BorderLayout.NORTH);
      getContentPane().add(controller.getView(), BorderLayout.CENTER);
    }

    public void displayView() {
      JFrame frame = new JFrame("Furniture Table Test") {
        {
          setRootPane(HomeViewTest.this);
        }
      };
      frame.pack();
      frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
      frame.setVisible(true);
    } 
  }
}
