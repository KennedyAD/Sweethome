/*
 * RoomPanel.java 20 nov. 2008
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

import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

import javax.swing.ButtonGroup;
import javax.swing.JComponent;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JRadioButton;
import javax.swing.JTextField;
import javax.swing.KeyStroke;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;

import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.tools.OperatingSystem;
import com.eteks.sweethome3d.viewcontroller.DialogView;
import com.eteks.sweethome3d.viewcontroller.RoomController;
import com.eteks.sweethome3d.viewcontroller.View;

/**
 * Room editing panel.
 * @author Emmanuel Puybaret
 */
public class RoomPanel extends JPanel implements DialogView {
  private final RoomController  controller;
  private JLabel                nameLabel;
  private JTextField            nameTextField;
  private NullableCheckBox      areaVisibleCheckBox;
  private NullableCheckBox      floorVisibleCheckBox;
  private JRadioButton          floorColorRadioButton;
  private ColorButton           floorColorButton;
  private JRadioButton          floorTextureRadioButton;
  private JComponent            floorTextureComponent;
  private NullableCheckBox      ceilingVisibleCheckBox;
  private JRadioButton          ceilingColorRadioButton;
  private ColorButton           ceilingColorButton;
  private JRadioButton          ceilingTextureRadioButton;
  private JComponent            ceilingTextureComponent;
  private String                dialogTitle;

  /**
   * Creates a panel that displays room data according to the units set in
   * <code>preferences</code>.
   * @param preferences user preferences
   * @param controller the controller of this panel
   */
  public RoomPanel(UserPreferences preferences,
                   RoomController controller) {
    super(new GridBagLayout());
    this.controller = controller;
    createComponents(preferences, controller);
    setMnemonics(preferences);
    layoutComponents(preferences, controller);
  }

  /**
   * Creates and initializes components and spinners model.
   */
  private void createComponents(UserPreferences preferences, 
                                final RoomController controller) {
    // Create name label and its text field bound to NAME controller property
    this.nameLabel = new JLabel(SwingTools.getLocalizedLabelText(preferences, 
        RoomPanel.class, "nameLabel.text"));
    this.nameTextField = new JTextField(controller.getName(), 10);
    if (!OperatingSystem.isMacOSXLeopardOrSuperior()) {
      SwingTools.addAutoSelectionOnFocusGain(this.nameTextField);
    }
    final PropertyChangeListener nameChangeListener = new PropertyChangeListener() {
        public void propertyChange(PropertyChangeEvent ev) {
          nameTextField.setText(controller.getName());
        }
      };
    controller.addPropertyChangeListener(RoomController.Property.NAME, nameChangeListener);
    this.nameTextField.getDocument().addDocumentListener(new DocumentListener() {
        public void changedUpdate(DocumentEvent ev) {
          controller.removePropertyChangeListener(RoomController.Property.NAME, nameChangeListener);
          String name = nameTextField.getText(); 
          if (name == null || name.trim().length() == 0) {
            controller.setName("");
          } else {
            controller.setName(name);
          }
          controller.addPropertyChangeListener(RoomController.Property.NAME, nameChangeListener);
        }
  
        public void insertUpdate(DocumentEvent ev) {
          changedUpdate(ev);
        }
  
        public void removeUpdate(DocumentEvent ev) {
          changedUpdate(ev);
        }
      });
    
    // Create area visible check box bound to AREA_VISIBLE controller property
    this.areaVisibleCheckBox = new NullableCheckBox(SwingTools.getLocalizedLabelText(preferences, 
        RoomPanel.class, "areaVisibleCheckBox.text"));
    this.areaVisibleCheckBox.setNullable(controller.getAreaVisible() == null);
    this.areaVisibleCheckBox.setValue(controller.getAreaVisible());
    final PropertyChangeListener visibleChangeListener = new PropertyChangeListener() {
      public void propertyChange(PropertyChangeEvent ev) {
        areaVisibleCheckBox.setNullable(ev.getNewValue() == null);
        areaVisibleCheckBox.setValue((Boolean)ev.getNewValue());
      }
    };
    controller.addPropertyChangeListener(RoomController.Property.AREA_VISIBLE, visibleChangeListener);
    this.areaVisibleCheckBox.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent ev) {
          controller.removePropertyChangeListener(RoomController.Property.AREA_VISIBLE, visibleChangeListener);
          controller.setAreaVisible(areaVisibleCheckBox.getValue());
          controller.addPropertyChangeListener(RoomController.Property.AREA_VISIBLE, visibleChangeListener);
        }
      });

    // Create floor visible check box bound to FLOOR_VISIBLE controller property
    this.floorVisibleCheckBox = new NullableCheckBox(SwingTools.getLocalizedLabelText(preferences, 
        RoomPanel.class, "floorVisibleCheckBox.text"));
    this.floorVisibleCheckBox.setNullable(controller.getFloorVisible() == null);
    this.floorVisibleCheckBox.setValue(controller.getFloorVisible());
    final PropertyChangeListener floorVisibleChangeListener = new PropertyChangeListener() {
      public void propertyChange(PropertyChangeEvent ev) {
        floorVisibleCheckBox.setNullable(ev.getNewValue() == null);
        floorVisibleCheckBox.setValue((Boolean)ev.getNewValue());
      }
    };
    controller.addPropertyChangeListener(RoomController.Property.FLOOR_VISIBLE, floorVisibleChangeListener);
    this.floorVisibleCheckBox.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent ev) {
          controller.removePropertyChangeListener(RoomController.Property.FLOOR_VISIBLE, floorVisibleChangeListener);
          controller.setFloorVisible(floorVisibleCheckBox.getValue());
          controller.addPropertyChangeListener(RoomController.Property.FLOOR_VISIBLE, floorVisibleChangeListener);
        }
      });
    
    // Floor color and texture buttons bound to floor controller properties
    this.floorColorRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences, 
        RoomPanel.class, "floorColorRadioButton.text"));
    this.floorColorRadioButton.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent ev) {
          if (floorColorRadioButton.isSelected()) {
            controller.setFloorPaint(RoomController.RoomPaint.COLORED);
          }
        }
      });
    controller.addPropertyChangeListener(RoomController.Property.FLOOR_PAINT, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            updateFloorRadioButtons(controller);
          }
        });
    
    this.floorColorButton = new ColorButton();
    this.floorColorButton.setColorDialogTitle(preferences.getLocalizedString(
        RoomPanel.class, "floorColorDialog.title"));
    this.floorColorButton.setColor(controller.getFloorColor());
    this.floorColorButton.addPropertyChangeListener(ColorButton.COLOR_PROPERTY, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            controller.setFloorColor(floorColorButton.getColor());
            controller.setFloorPaint(RoomController.RoomPaint.COLORED);
          }
        });
    controller.addPropertyChangeListener(RoomController.Property.FLOOR_COLOR, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            floorColorButton.setColor(controller.getFloorColor());
          }
        });

    this.floorTextureRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences, 
        RoomPanel.class, "floorTextureRadioButton.text"));
    this.floorTextureRadioButton.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent ev) {
          if (floorTextureRadioButton.isSelected()) {
            controller.setFloorPaint(RoomController.RoomPaint.TEXTURED);
          }
        }
      });
    
    this.floorTextureComponent = (JComponent)controller.getFloorTextureController().getView();
    
    ButtonGroup floorButtonGroup = new ButtonGroup();
    floorButtonGroup.add(this.floorColorRadioButton);
    floorButtonGroup.add(this.floorTextureRadioButton);
    updateFloorRadioButtons(controller);
    
    // Create ceiling visible check box bound to CEILING_VISIBLE controller property
    this.ceilingVisibleCheckBox = new NullableCheckBox(SwingTools.getLocalizedLabelText(preferences, 
        RoomPanel.class, "ceilingVisibleCheckBox.text"));
    this.ceilingVisibleCheckBox.setNullable(controller.getCeilingVisible() == null);
    this.ceilingVisibleCheckBox.setValue(controller.getCeilingVisible());
    final PropertyChangeListener ceilingVisibleChangeListener = new PropertyChangeListener() {
      public void propertyChange(PropertyChangeEvent ev) {
        ceilingVisibleCheckBox.setNullable(ev.getNewValue() == null);
        ceilingVisibleCheckBox.setValue((Boolean)ev.getNewValue());
      }
    };
    controller.addPropertyChangeListener(RoomController.Property.CEILING_VISIBLE, ceilingVisibleChangeListener);
    this.ceilingVisibleCheckBox.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent ev) {
          controller.removePropertyChangeListener(RoomController.Property.CEILING_VISIBLE, ceilingVisibleChangeListener);
          controller.setCeilingVisible(ceilingVisibleCheckBox.getValue());
          controller.addPropertyChangeListener(RoomController.Property.CEILING_VISIBLE, ceilingVisibleChangeListener);
        }
      });

    // Ceiling color and texture buttons bound to ceiling controller properties
    this.ceilingColorRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences, 
        RoomPanel.class, "ceilingColorRadioButton.text"));
    this.ceilingColorRadioButton.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent e) {
          if (ceilingColorRadioButton.isSelected()) {
            controller.setCeilingPaint(RoomController.RoomPaint.COLORED);
          }
        }
      });
    controller.addPropertyChangeListener(RoomController.Property.CEILING_PAINT, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            updateCeilingRadioButtons(controller);
          }
        });

    this.ceilingColorButton = new ColorButton();
    this.ceilingColorButton.setColor(controller.getCeilingColor());
    this.ceilingColorButton.setColorDialogTitle(preferences.getLocalizedString(
        RoomPanel.class, "ceilingColorDialog.title"));
    this.ceilingColorButton.addPropertyChangeListener(ColorButton.COLOR_PROPERTY, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            controller.setCeilingColor(ceilingColorButton.getColor());
            controller.setCeilingPaint(RoomController.RoomPaint.COLORED);
          }
        });
    controller.addPropertyChangeListener(RoomController.Property.CEILING_COLOR, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            ceilingColorButton.setColor(controller.getCeilingColor());
          }
        });
    
    this.ceilingTextureRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences, 
        RoomPanel.class, "ceilingTextureRadioButton.text"));
    this.ceilingTextureRadioButton.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent e) {
          if (ceilingTextureRadioButton.isSelected()) {
            controller.setCeilingPaint(RoomController.RoomPaint.TEXTURED);
          }
        }
      });
  
    this.ceilingTextureComponent = (JComponent)controller.getCeilingTextureController().getView();

    ButtonGroup ceilingButtonGroup = new ButtonGroup();
    ceilingButtonGroup.add(this.ceilingColorRadioButton);
    ceilingButtonGroup.add(this.ceilingTextureRadioButton);
    updateCeilingRadioButtons(controller);

    this.dialogTitle = preferences.getLocalizedString(RoomPanel.class, "room.title");
  }

  /**
   * Updates floor radio buttons. 
   */
  private void updateFloorRadioButtons(RoomController controller) {
    if (controller.getFloorPaint() == RoomController.RoomPaint.COLORED) {
      this.floorColorRadioButton.setSelected(true);
    } else if (controller.getFloorPaint() == RoomController.RoomPaint.TEXTURED) {
      this.floorTextureRadioButton.setSelected(true);
    } else { // null
      SwingTools.deselectAllRadioButtons(this.floorColorRadioButton, this.floorTextureRadioButton);
    }
  }

  /**
   * Updates ceiling radio buttons. 
   */
  private void updateCeilingRadioButtons(RoomController controller) {
    if (controller.getCeilingPaint() == RoomController.RoomPaint.COLORED) {
      this.ceilingColorRadioButton.setSelected(true);
    } else if (controller.getCeilingPaint() == RoomController.RoomPaint.TEXTURED) {
      this.ceilingTextureRadioButton.setSelected(true);
    } else { // null
      SwingTools.deselectAllRadioButtons(this.ceilingColorRadioButton, this.ceilingTextureRadioButton);
    }
  }

  /**
   * Sets components mnemonics and label / component associations.
   */
  private void setMnemonics(UserPreferences preferences) {
    if (!OperatingSystem.isMacOSX()) {
      this.nameLabel.setDisplayedMnemonic(KeyStroke.getKeyStroke(
          preferences.getLocalizedString(RoomPanel.class, "nameLabel.mnemonic")).getKeyCode());
      this.nameLabel.setLabelFor(this.nameTextField);
      this.areaVisibleCheckBox.setMnemonic(KeyStroke.getKeyStroke(
          preferences.getLocalizedString(RoomPanel.class, "areaVisibleCheckBox.mnemonic")).getKeyCode());
      this.floorVisibleCheckBox.setMnemonic(KeyStroke.getKeyStroke(
          preferences.getLocalizedString(RoomPanel.class, "floorVisibleCheckBox.mnemonic")).getKeyCode());
      this.floorColorRadioButton.setMnemonic(KeyStroke.getKeyStroke(
          preferences.getLocalizedString(RoomPanel.class, "floorColorRadioButton.mnemonic")).getKeyCode());
      this.floorTextureRadioButton.setMnemonic(KeyStroke.getKeyStroke(
          preferences.getLocalizedString(RoomPanel.class, "floorTextureRadioButton.mnemonic")).getKeyCode());
      this.ceilingVisibleCheckBox.setMnemonic(KeyStroke.getKeyStroke(
          preferences.getLocalizedString(RoomPanel.class, "ceilingVisibleCheckBox.mnemonic")).getKeyCode());
      this.ceilingColorRadioButton.setMnemonic(KeyStroke.getKeyStroke(
          preferences.getLocalizedString(RoomPanel.class, "ceilingColorRadioButton.mnemonic")).getKeyCode());
      this.ceilingTextureRadioButton.setMnemonic(KeyStroke.getKeyStroke(
          preferences.getLocalizedString(RoomPanel.class, "ceilingTextureRadioButton.mnemonic")).getKeyCode());
    }
  }
  
  /**
   * Layouts panel components in panel with their labels. 
   */
  private void layoutComponents(UserPreferences preferences, 
                                final RoomController controller) {
    int labelAlignment = OperatingSystem.isMacOSX() 
        ? GridBagConstraints.LINE_END
        : GridBagConstraints.LINE_START;
    // First row
    Insets rowInsets;
    JPanel nameAndAreaPanel = SwingTools.createTitledPanel(preferences.getLocalizedString(
        RoomPanel.class, "nameAndAreaPanel.title"));
    nameAndAreaPanel.add(this.nameLabel, new GridBagConstraints(
        0, 0, 1, 1, 0, 0, labelAlignment, 
        GridBagConstraints.HORIZONTAL, new Insets(0, 8, 0, 5), 0, 0));
    nameAndAreaPanel.add(this.nameTextField, new GridBagConstraints(
        1, 0, 1, 1, 0, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, new Insets(0, 0, 0, 10), 0, 0));
    nameAndAreaPanel.add(this.areaVisibleCheckBox, new GridBagConstraints(
        2, 0, 1, 1, 1, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, new Insets(0, 0, 0, 0), 0, 0));
    if (OperatingSystem.isMacOSXLeopardOrSuperior()) {
      // User smaller insets for Mac OS X 10.5
      rowInsets = new Insets(0, 0, 0, 0);
    } else {
      rowInsets = new Insets(0, 0, 5, 0);
    }
    add(nameAndAreaPanel, new GridBagConstraints(
        0, 0, 2, 1, 0, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, rowInsets, 0, 0));
    // Last row
    JPanel floorPanel = createVerticalTitledPanel(preferences.getLocalizedString(
        RoomPanel.class, "floorPanel.title"),
        new JComponent [] {this.floorVisibleCheckBox, null,
                           this.floorColorRadioButton, this.floorColorButton, 
                           this.floorTextureRadioButton, this.floorTextureComponent});
    add(floorPanel, new GridBagConstraints(
        0, 1, 1, 1, 1, 0, GridBagConstraints.LINE_START,
        GridBagConstraints.HORIZONTAL, new Insets(0, 0, 0, 0), 0, 0));
    JPanel ceilingPanel = createVerticalTitledPanel(preferences.getLocalizedString(
        RoomPanel.class, "ceilingPanel.title"),
        new JComponent [] {this.ceilingVisibleCheckBox, null,
                           this.ceilingColorRadioButton, this.ceilingColorButton, 
                           this.ceilingTextureRadioButton, this.ceilingTextureComponent});
    add(ceilingPanel, new GridBagConstraints(
        1, 1, 1, 1, 1, 0, GridBagConstraints.LINE_START,
        GridBagConstraints.HORIZONTAL, new Insets(0, 0, 0, 0), 0, 0));
  }
  
  private JPanel createVerticalTitledPanel(String title, JComponent [] components) {
    JPanel titledPanel = SwingTools.createTitledPanel(title);    
    
    for (int i = 0; i < components.length; i += 2) {
      int bottomInset = i < components.length - 2  ? 2  : 0;      
      JComponent component = components [i];
      JComponent nextComponent = components [i + 1];
      if (nextComponent != null) {
        titledPanel.add(component, new GridBagConstraints(
            0, i / 2, 1, 1, 1, 0, GridBagConstraints.LINE_START, 
            GridBagConstraints.NONE, 
            new Insets(0, 0, bottomInset, 5), 0, 0));
        titledPanel.add(nextComponent, new GridBagConstraints(
            1, i / 2, 1, 1, 1, 0, GridBagConstraints.LINE_START, 
            GridBagConstraints.HORIZONTAL, new Insets(0, 0, bottomInset, 0), 0, 0));
      } else {
        titledPanel.add(component, new GridBagConstraints(
            0, i / 2, 2, 1, 1, 0, GridBagConstraints.LINE_START, 
            GridBagConstraints.HORIZONTAL, new Insets(0, 0, bottomInset, 0), 0, 0));
      }
    }
    return titledPanel;
  }
  
  /**
   * Displays this panel in a modal dialog box. 
   */
  public void displayView(View parentView) {
    if (SwingTools.showConfirmDialog((JComponent)parentView, 
            this, this.dialogTitle, this.nameTextField) == JOptionPane.OK_OPTION
        && this.controller != null) {
      this.controller.modifyRooms();
    }
  }
}
