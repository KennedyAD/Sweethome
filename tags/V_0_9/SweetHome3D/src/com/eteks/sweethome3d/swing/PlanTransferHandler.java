/*
 * PlanTransferHandler.java 12 sept. 2006
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

import java.awt.Point;
import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.Transferable;
import java.awt.datatransfer.UnsupportedFlavorException;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import javax.swing.JComponent;
import javax.swing.SwingUtilities;

import com.eteks.sweethome3d.model.Home;

/**
 * Plan transfer handler.
 * @author Emmanuel Puybaret
 */
public class PlanTransferHandler extends LocatedTransferHandler {
  private Home             home;
  private HomeController   homeController;
  private List<Object>     copiedItems;

  /**
   * Creates a handler able to transfer furniture and walls in plan.
   */
  public PlanTransferHandler(Home home, HomeController homeController) {
    this.home = home;  
    this.homeController = homeController;  
  }
  
  /**
   * Returns <code>COPY_OR_MOVE</code>.
   */
  @Override
  public int getSourceActions(JComponent source) {
    return COPY_OR_MOVE;
  }
  
  /**
   * Returns a {@link HomeTransferableList transferable object}
   * that contains a copy of the selected furniture in home. 
   */
  @Override
  protected Transferable createTransferable(JComponent source) {
    this.copiedItems = this.home.getSelectedItems();
    return new HomeTransferableList(this.copiedItems);
  }
  
  /**
   * Removes the copied element once moved.
   */
  @Override
  protected void exportDone(JComponent source, Transferable data, int action) {
    if (action == MOVE) {
      this.homeController.cut(this.copiedItems);      
    }
    this.copiedItems = null;
    this.homeController.enablePasteAction();    
  }

  /**
   * Returns <code>true</code> if flavors contains 
   * {@link HomeTransferableList#HOME_FLAVOR LIST_FLAVOR} flavor.
   */
  @Override
  public boolean canImport(JComponent destination, DataFlavor [] flavors) {
    return Arrays.asList(flavors).contains(HomeTransferableList.HOME_FLAVOR);
  }

  /**
   * Add to home items contained in <code>transferable</code>.
   */
  @Override
  public boolean importData(JComponent destination, Transferable transferable) {
    if (canImport(destination, transferable.getTransferDataFlavors())) {
      try {
        List<Object> items = (List<Object>)transferable.
            getTransferData(HomeTransferableList.HOME_FLAVOR);
        if (isDrop()) {
          float x = 0;
          float y = 0;
          if (destination instanceof PlanComponent) {
            PlanComponent planView = (PlanComponent)destination;
            Point dropLocation = getDropLocation();
            SwingUtilities.convertPointFromScreen(dropLocation, planView);
            x = planView.convertXPixelToModel(dropLocation.x);
            y = planView.convertYPixelToModel(dropLocation.y);
          }
          homeController.drop(items, x, y);
        } else {
          homeController.paste(items);
        }
        return true; 
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
