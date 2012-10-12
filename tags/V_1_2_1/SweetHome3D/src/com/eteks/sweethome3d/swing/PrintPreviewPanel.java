/*
 * PrintPreviewPanel.java 27 aout 07
 *
 * Copyright (c) 2007 Emmanuel PUYBARET / eTeks <info@eteks.com>. All Rights Reserved.
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

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Container;
import java.awt.Dimension;
import java.awt.Frame;
import java.awt.GradientPaint;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.Insets;
import java.awt.LayoutManager;
import java.awt.Paint;
import java.awt.event.ActionEvent;
import java.awt.geom.GeneralPath;
import java.util.ResourceBundle;

import javax.swing.Action;
import javax.swing.ActionMap;
import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.InputMap;
import javax.swing.JComponent;
import javax.swing.JDialog;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JToolBar;
import javax.swing.KeyStroke;
import javax.swing.border.AbstractBorder;

import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.tools.OperatingSystem;

/**
 * Home print preview editing panel.
 * @author Emmanuel Puybaret
 */
public class PrintPreviewPanel extends JPanel {
  private enum ActionType {SHOW_PREVIOUS_PAGE, SHOW_NEXT_PAGE}

  private ResourceBundle         resource;
  private JToolBar               toolBar;
  private HomePrintableComponent printableComponent;
  private JLabel                 pageLabel;

  /**
   * Creates a panel that displays print preview.
   * @param home home previewed by this panel
   * @param homeController the controller of <code>home</code>
   * @param printPreviewController the controller of this panel
   */
  public PrintPreviewPanel(Home home,
                           HomeController homeController,
                           PrintPreviewController printPreviewController) {
    super(new BorderLayout());
    this.resource = ResourceBundle.getBundle(PrintPreviewPanel.class.getName());
    createActions();
    installKeyboardActions();
    createComponents(home, homeController);
    layoutComponents();
    updateComponents();
  }

  /**
   * Creates actions.  
   */
  private void createActions() {
    // Show previous page action
    Action showPreviousPageAction = new ResourceAction(
            this.resource, ActionType.SHOW_PREVIOUS_PAGE.toString()) {
        public void actionPerformed(ActionEvent e) {
          printableComponent.setPage(printableComponent.getPage() - 1);
          updateComponents();
        }
      };
    // Show next page action
    Action showNextPageAction = new ResourceAction(
            this.resource, ActionType.SHOW_NEXT_PAGE.toString()) {
        public void actionPerformed(ActionEvent e) {
          printableComponent.setPage(printableComponent.getPage() + 1);
          updateComponents();
        }
      };
    ActionMap actionMap = getActionMap();
    actionMap.put(ActionType.SHOW_PREVIOUS_PAGE, showPreviousPageAction);
    actionMap.put(ActionType.SHOW_NEXT_PAGE, showNextPageAction);
  }

  /**
   * Installs keys bound to actions. 
   */
  private void installKeyboardActions() {
    InputMap inputMap = getInputMap(WHEN_IN_FOCUSED_WINDOW);
    inputMap.put(KeyStroke.getKeyStroke("LEFT"), ActionType.SHOW_PREVIOUS_PAGE);
    inputMap.put(KeyStroke.getKeyStroke("UP"), ActionType.SHOW_PREVIOUS_PAGE);
    inputMap.put(KeyStroke.getKeyStroke("PAGE_UP"), ActionType.SHOW_PREVIOUS_PAGE);
    inputMap.put(KeyStroke.getKeyStroke("RIGHT"), ActionType.SHOW_NEXT_PAGE);
    inputMap.put(KeyStroke.getKeyStroke("DOWN"), ActionType.SHOW_NEXT_PAGE);
    inputMap.put(KeyStroke.getKeyStroke("PAGE_DOWN"), ActionType.SHOW_NEXT_PAGE);
  }

  /**
   * Creates and initializes components.
   */
  private void createComponents(Home home, HomeController homeController) {
    this.printableComponent = new HomePrintableComponent(home, homeController);
    this.printableComponent.setBorder(BorderFactory.createCompoundBorder(
        new AbstractBorder() {
          @Override
          public Insets getBorderInsets(Component c) {
            return new Insets(0, 0, 5, 5);
          }

          @Override
          public void paintBorder(Component c, Graphics g, int x, int y, int width, int height) {
            Graphics2D g2D = (Graphics2D)g;
            Paint oldPaint = g2D.getPaint();
            Color startColor = new Color(127, 127, 127, 200);
            Color endColor = new Color(192, 192, 192, 50);
            // Fill right border with a gradient
            g2D.setPaint(new GradientPaint(x + width - 5, 0, startColor, x + width - 1, 0, endColor));
            GeneralPath border = new GeneralPath();
            border.moveTo(x + width - 5, 0);
            border.lineTo(x + width, 5);
            border.lineTo(x + width, y + height);
            border.lineTo(x + width - 5, y + height - 5);
            g2D.fill(border);
            // Fill bottom border with a gradient
            g2D.setPaint(new GradientPaint(0, y + height - 5, startColor, 0, y + height - 1, endColor));
            border = new GeneralPath();
            border.moveTo(0, y + height - 5);
            border.lineTo(5, y + height);
            border.lineTo(x + width, y + height);
            border.lineTo(x + width - 5, y + height - 5);
            g2D.fill(border);
            g2D.setPaint(oldPaint);
          }
        },
        BorderFactory.createLineBorder(Color.BLACK)));
    
    this.pageLabel = new JLabel();
    
    this.toolBar = new JToolBar();
    this.toolBar.setFloatable(false);
    ActionMap actions = getActionMap();    
    this.toolBar.add(actions.get(ActionType.SHOW_PREVIOUS_PAGE));
    this.toolBar.add(actions.get(ActionType.SHOW_NEXT_PAGE));
    // Use segmented buttons under Mac OS X 10.5
    if (OperatingSystem.isMacOSXLeopardOrSuperior()) {
      JComponent previousButton = (JComponent)toolBar.getComponentAtIndex(0);
      previousButton.putClientProperty("JButton.buttonType", "segmentedTextured");
      previousButton.putClientProperty("JButton.segmentPosition", "first");
      JComponent nextButton = (JComponent)toolBar.getComponentAtIndex(1);
      nextButton.putClientProperty("JButton.buttonType", "segmentedTextured");
      nextButton.putClientProperty("JButton.segmentPosition", "last");
    }    
    this.toolBar.add(Box.createHorizontalStrut(20));
    this.toolBar.add(this.pageLabel);
    
    // Remove focusable property on buttons
    for (int i = 0, n = toolBar.getComponentCount(); i < n; i++) {
      toolBar.getComponentAtIndex(i).setFocusable(false);      
    }
  }
  
  /**
   * Layouts panel composants in panel with their labels. 
   */
  private void layoutComponents() {
    // First row
    // Add toolbar in a flow layout panel to make it centered
    JPanel panel = new JPanel();
    panel.add(this.toolBar);
    add(panel, BorderLayout.NORTH);
    // Second row
    // Add printable component in a proportional layout panel
    panel = new JPanel(new ProportionalLayout());
    panel.add(this.printableComponent);
    add(panel, BorderLayout.CENTER);
  }

  /**
   * Updates components.
   */
  private void updateComponents() {
    ActionMap actions = getActionMap();    
    actions.get(ActionType.SHOW_PREVIOUS_PAGE).setEnabled(this.printableComponent.getPage() > 0);
    actions.get(ActionType.SHOW_NEXT_PAGE).setEnabled(
        this.printableComponent.getPage() < this.printableComponent.getPageCount() - 1);
    this.pageLabel.setText(String.format(this.resource.getString("pageLabel.text"), 
        this.printableComponent.getPage() + 1, this.printableComponent.getPageCount()));
  }

  /**
   * Displays this panel in a modal resizable dialog box. 
   */
  public void displayView() {
    String dialogTitle = resource.getString("printPreview.title");
    Component parent = null;
    for (Frame frame : Frame.getFrames()) {
      if (frame.isActive()) {
        parent = frame;
        break;
      }
    }
    JOptionPane optionPane = new JOptionPane(this, JOptionPane.PLAIN_MESSAGE, JOptionPane.DEFAULT_OPTION); 
    JDialog dialog = optionPane.createDialog(parent, dialogTitle);
    dialog.setMinimumSize(dialog.getPreferredSize());
    dialog.setResizable(true);
    dialog.setVisible(true);
    dialog.dispose();
  }
  
  /**
   * A layout manager that layouts one component in such a way that this component
   * will always be proportional to its preferred dimension and will fill its parent width or height.
   */
  private static class ProportionalLayout implements LayoutManager {
    public void addLayoutComponent(String name, Component component) {
    }

    public void layoutContainer(Container parent) {
      Component component = parent.getComponent(0);
      Dimension preferredSize = component.getPreferredSize();
      Dimension parentSize = parent.getSize();
      if ((float)parentSize.width / parentSize.height > (float)preferredSize.width / preferredSize.height) {
        // Make the component fill its parent height and center it in parent width
        int componentWidth = preferredSize.width * parentSize.height / preferredSize.height;
        component.setBounds((parentSize.width - componentWidth) / 2, 0, componentWidth, parentSize.height);
      } else {
        // Make the component fill its parent width and center it in parent height
        int componentHeight = preferredSize.height * parentSize.width / preferredSize.width;
        component.setBounds(0, (parentSize.height - componentHeight) / 2, parentSize.width, componentHeight);
      }
    }

    public Dimension minimumLayoutSize(Container parent) {
      return parent.getComponent(0).getMinimumSize();
    }

    public Dimension preferredLayoutSize(Container parent) {
      return parent.getComponent(0).getPreferredSize();
    }

    public void removeLayoutComponent(Component component) {
    }
  }
}
