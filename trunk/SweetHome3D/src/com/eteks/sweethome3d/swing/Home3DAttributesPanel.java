/*
 * Home3DAttributesPanel.java 25 juin 07
 *
 * Sweet Home 3D, Copyright (c) 2007 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.util.Dictionary;
import java.util.Hashtable;

import javax.swing.ButtonGroup;
import javax.swing.JCheckBox;
import javax.swing.JComponent;
import javax.swing.JFormattedTextField;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JRadioButton;
import javax.swing.JSlider;
import javax.swing.JSpinner;
import javax.swing.KeyStroke;
import javax.swing.SpinnerNumberModel;
import javax.swing.event.ChangeEvent;
import javax.swing.event.ChangeListener;

import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.tools.OperatingSystem;
import com.eteks.sweethome3d.viewcontroller.DialogView;
import com.eteks.sweethome3d.viewcontroller.Home3DAttributesController;
import com.eteks.sweethome3d.viewcontroller.View;

/**
 * Home 3D attributes editing panel.
 * @author Emmanuel Puybaret
 */
public class Home3DAttributesPanel extends JPanel implements DialogView {
  private final Home3DAttributesController controller;
  private JLabel        observerFieldOfViewLabel;
  private JSpinner      observerFieldOfViewSpinner;
  private JLabel        observerHeightLabel;
  private JSpinner      observerHeightSpinner;
  private JLabel        observerCameraElevationLabel;
  private JSpinner      observerCameraElevationSpinner;
  private JCheckBox     adjustObserverCameraElevationCheckBox;
  private JRadioButton  groundColorRadioButton;
  private ColorButton   groundColorButton;
  private JRadioButton  groundTextureRadioButton;
  private JComponent    groundTextureComponent;
  private JRadioButton  skyColorRadioButton;
  private ColorButton   skyColorButton;
  private JRadioButton  skyTextureRadioButton;
  private JComponent    skyTextureComponent;
  private JLabel        brightnessLabel;
  private JSlider       brightnessSlider;
  private JLabel        wallsTransparencyLabel;
  private JSlider       wallsTransparencySlider;
  private String        dialogTitle;

  /**
   * Creates a panel that displays home 3D attributes data according to the units 
   * set in <code>preferences</code>.
   * @param preferences user preferences
   * @param controller the controller of this panel
   */
  public Home3DAttributesPanel(UserPreferences preferences,
                               Home3DAttributesController controller) {
    super(new GridBagLayout());
    this.controller = controller;
    createComponents(preferences, controller);
    setMnemonics(preferences);
    layoutComponents(preferences);
  }

  /**
   * Creates and initializes components and spinners model.
   */
  private void createComponents(UserPreferences preferences,
                                final Home3DAttributesController controller) {
    // Get unit name matching current unit 
    String unitName = preferences.getLengthUnit().getName();
    
    // Create observer field of view label and spinner bound to OBSERVER_FIELD_OF_VIEW_IN_DEGREES controller property
    this.observerFieldOfViewLabel = new JLabel(SwingTools.getLocalizedLabelText(preferences, 
        Home3DAttributesPanel.class, "observerFieldOfViewLabel.text"));
    final SpinnerNumberModel observerFieldOfViewSpinnerModel = new SpinnerNumberModel(10, 10, 120, 1);
    this.observerFieldOfViewSpinner = new AutoCommitSpinner(observerFieldOfViewSpinnerModel);
    observerFieldOfViewSpinnerModel.setValue(controller.getObserverFieldOfViewInDegrees());
    observerFieldOfViewSpinnerModel.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent ev) {
          controller.setObserverFieldOfViewInDegrees(
              ((Number)observerFieldOfViewSpinnerModel.getValue()).intValue());
        }
      });
    controller.addPropertyChangeListener(Home3DAttributesController.Property.OBSERVER_FIELD_OF_VIEW_IN_DEGREES, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            observerFieldOfViewSpinnerModel.setValue(controller.getObserverFieldOfViewInDegrees());
          }
        });
    
    // Create observer height label and spinner bound to OBSERVER_HEIGHT controller property
    this.observerHeightLabel = new JLabel(String.format(SwingTools.getLocalizedLabelText(preferences, 
        Home3DAttributesPanel.class, "observerHeightLabel.text"), unitName));
    float maximumElevation = preferences.getLengthUnit().getMaximumElevation();
    final NullableSpinner.NullableSpinnerLengthModel observerHeightSpinnerModel = 
        new NullableSpinner.NullableSpinnerLengthModel(preferences, controller.getMinimumElevation(), maximumElevation * 15 / 14);
    this.observerHeightSpinner = new AutoCommitSpinner(observerHeightSpinnerModel);
    observerHeightSpinnerModel.setLength((float)Math.round(controller.getObserverHeight() * 100) / 100);
    observerHeightSpinnerModel.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent ev) {
          controller.setObserverHeight(observerHeightSpinnerModel.getLength());
        }
      });
    controller.addPropertyChangeListener(Home3DAttributesController.Property.OBSERVER_HEIGHT, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            observerHeightSpinnerModel.setLength((float)Math.round(controller.getObserverHeight() * 100) / 100);
          }
        });
    
    // Create camera elevation label and spinner bound to OBSERVER_CAMERA_ELEVATION controller property
    this.observerCameraElevationLabel = new JLabel(String.format(SwingTools.getLocalizedLabelText(preferences, 
        Home3DAttributesPanel.class, "observerCameraElevationLabel.text"), unitName));
    final NullableSpinner.NullableSpinnerLengthModel observerCameraElevationSpinnerModel = 
        new NullableSpinner.NullableSpinnerLengthModel(preferences, controller.getMinimumElevation(), maximumElevation);
    this.observerCameraElevationSpinner = new AutoCommitSpinner(observerCameraElevationSpinnerModel);    
    observerCameraElevationSpinnerModel.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent ev) {
          controller.setObserverCameraElevation(observerCameraElevationSpinnerModel.getLength());
        }
      });
    PropertyChangeListener observerCameraElevationChangeListener = new PropertyChangeListener() {
        public void propertyChange(PropertyChangeEvent ev) {
          Float observerCameraElevation = controller.getObserverCameraElevation();
          observerCameraElevationSpinnerModel.setNullable(observerCameraElevation == null);
          observerCameraElevationSpinnerModel.setLength(observerCameraElevation != null
              ? (float)Math.round(controller.getObserverCameraElevation() * 100) / 100
              : null);
          observerCameraElevationLabel.setVisible(observerCameraElevation != null);
          observerCameraElevationSpinner.setVisible(observerCameraElevation != null);
          observerHeightLabel.setVisible(observerCameraElevation == null);
          observerHeightSpinner.setVisible(observerCameraElevation == null);
        }
      };
    observerCameraElevationChangeListener.propertyChange(null);
    controller.addPropertyChangeListener(Home3DAttributesController.Property.OBSERVER_CAMERA_ELEVATION, observerCameraElevationChangeListener);
    
    this.adjustObserverCameraElevationCheckBox = new JCheckBox(SwingTools.getLocalizedLabelText(preferences, 
        Home3DAttributesPanel.class, "adjustObserverCameraElevationCheckBox.text"), controller.isObserverCameraElevationAdjusted());
    this.adjustObserverCameraElevationCheckBox.setEnabled(controller.isObserverCameraElevationAdjustedModifiable());
    this.adjustObserverCameraElevationCheckBox.addItemListener(new ItemListener() {
        public void itemStateChanged(ItemEvent ev) {
          controller.setObserverCameraElevationAdjusted(adjustObserverCameraElevationCheckBox.isSelected());
        }
      });
    controller.addPropertyChangeListener(Home3DAttributesController.Property.OBSERVER_CAMERA_ELEVATION_ADJUSTED, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            adjustObserverCameraElevationCheckBox.setSelected(controller.isObserverCameraElevationAdjusted());
          }
        });

    controller.addPropertyChangeListener(Home3DAttributesController.Property.MINIMUM_ELEVATION, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            observerHeightSpinnerModel.setLength(Math.max(observerHeightSpinnerModel.getLength(), controller.getMinimumElevation()));
            observerHeightSpinnerModel.setMinimum(controller.getMinimumElevation());
            if (observerCameraElevationSpinnerModel.getLength() != null) {
              observerCameraElevationSpinnerModel.setLength(Math.max(observerCameraElevationSpinnerModel.getLength(), controller.getMinimumElevation()));
            }
            observerCameraElevationSpinnerModel.setMinimum(controller.getMinimumElevation());
          }
        });
    
    // Ground color and texture buttons bound to ground controller properties
    this.groundColorRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences, 
        Home3DAttributesPanel.class, "groundColorRadioButton.text"));
    this.groundColorRadioButton.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent ev) {
          if (groundColorRadioButton.isSelected()) {
            controller.setGroundPaint(Home3DAttributesController.EnvironmentPaint.COLORED);
          }
        }
      });
    controller.addPropertyChangeListener(Home3DAttributesController.Property.GROUND_PAINT, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            updateGroundRadioButtons(controller);
          }
        });
  
    this.groundColorButton = new ColorButton();
    this.groundColorButton.setColorDialogTitle(preferences.getLocalizedString(
        Home3DAttributesPanel.class, "groundColorDialog.title"));
    this.groundColorButton.setColor(controller.getGroundColor());
    this.groundColorButton.addPropertyChangeListener(ColorButton.COLOR_PROPERTY, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            controller.setGroundColor(groundColorButton.getColor());
          }
        });
    controller.addPropertyChangeListener(Home3DAttributesController.Property.GROUND_COLOR, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            groundColorButton.setColor(controller.getGroundColor());
          }
        });
    
    this.groundTextureRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences, 
        Home3DAttributesPanel.class, "groundTextureRadioButton.text"));
    this.groundTextureRadioButton.addChangeListener(new ChangeListener() {
      public void stateChanged(ChangeEvent ev) {
        if (groundTextureRadioButton.isSelected()) {
          controller.setGroundPaint(Home3DAttributesController.EnvironmentPaint.TEXTURED);
        }
      }
    });
    
    this.groundTextureComponent = (JComponent)controller.getGroundTextureController().getView();

    ButtonGroup groundGroup = new ButtonGroup();
    groundGroup.add(this.groundColorRadioButton);
    groundGroup.add(this.groundTextureRadioButton);
    updateGroundRadioButtons(controller);
    
    // Sky color and texture buttons bound to sky controller properties
    this.skyColorRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences, 
        Home3DAttributesPanel.class, "skyColorRadioButton.text"));
    this.skyColorRadioButton.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent ev) {
          if (skyColorRadioButton.isSelected()) {
            controller.setSkyPaint(Home3DAttributesController.EnvironmentPaint.COLORED);
          }
        }
      });
    controller.addPropertyChangeListener(Home3DAttributesController.Property.SKY_PAINT, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            updateSkyRadioButtons(controller);
          }
        });
  
    this.skyColorButton = new ColorButton();
    this.skyColorButton.setColorDialogTitle(preferences.getLocalizedString(
        Home3DAttributesPanel.class, "skyColorDialog.title"));
    this.skyColorButton.setColor(controller.getSkyColor());
    this.skyColorButton.addPropertyChangeListener(ColorButton.COLOR_PROPERTY, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            controller.setSkyColor(skyColorButton.getColor());
          }
        });
    controller.addPropertyChangeListener(Home3DAttributesController.Property.SKY_COLOR, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            skyColorButton.setColor(controller.getSkyColor());
          }
        });
    
    this.skyTextureRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences, 
        Home3DAttributesPanel.class, "skyTextureRadioButton.text"));
    this.skyTextureRadioButton.addChangeListener(new ChangeListener() {
      public void stateChanged(ChangeEvent ev) {
        if (skyTextureRadioButton.isSelected()) {
          controller.setSkyPaint(Home3DAttributesController.EnvironmentPaint.TEXTURED);
        }
      }
    });
    
    this.skyTextureComponent = (JComponent)controller.getSkyTextureController().getView();

    ButtonGroup skyGroup = new ButtonGroup();
    skyGroup.add(this.skyColorRadioButton);
    skyGroup.add(this.skyTextureRadioButton);
    updateSkyRadioButtons(controller);
    
    // Brightness label and slider bound to LIGHT_COLOR controller property
    this.brightnessLabel = new JLabel(SwingTools.getLocalizedLabelText(preferences, 
        Home3DAttributesPanel.class, "brightnessLabel.text"));
    this.brightnessSlider = new JSlider(0, 255);
    JLabel darkLabel = new JLabel(preferences.getLocalizedString(
        Home3DAttributesPanel.class, "darkLabel.text"));
    JLabel brightLabel = new JLabel(preferences.getLocalizedString(
        Home3DAttributesPanel.class, "brightLabel.text"));
    Dictionary<Integer,JComponent> brightnessSliderLabelTable = new Hashtable<Integer,JComponent>();
    brightnessSliderLabelTable.put(0, darkLabel);
    brightnessSliderLabelTable.put(255, brightLabel);
    this.brightnessSlider.setLabelTable(brightnessSliderLabelTable);
    this.brightnessSlider.setPaintLabels(true);
    this.brightnessSlider.setPaintTicks(true);
    this.brightnessSlider.setMajorTickSpacing(16);
    this.brightnessSlider.setValue(controller.getLightColor() & 0xFF);
    this.brightnessSlider.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent ev) {
          int brightness = brightnessSlider.getValue();
          controller.setLightColor((brightness << 16) + (brightness << 8) + brightness);
        }
      });
    controller.addPropertyChangeListener(Home3DAttributesController.Property.LIGHT_COLOR, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            brightnessSlider.setValue(controller.getLightColor() & 0xFF);
          }
        });
    
    // Walls transparency label and slider bound to WALLS_ALPHA controller property
    this.wallsTransparencyLabel = new JLabel(SwingTools.getLocalizedLabelText(preferences, 
        Home3DAttributesPanel.class, "wallsTransparencyLabel.text"));
    this.wallsTransparencySlider = new JSlider(0, 255);
    JLabel opaqueLabel = new JLabel(preferences.getLocalizedString(
        Home3DAttributesPanel.class, "opaqueLabel.text"));
    JLabel invisibleLabel = new JLabel(preferences.getLocalizedString(
        Home3DAttributesPanel.class, "invisibleLabel.text"));
    Dictionary<Integer,JComponent> wallsTransparencySliderLabelTable = new Hashtable<Integer,JComponent>();
    wallsTransparencySliderLabelTable.put(0, opaqueLabel);
    wallsTransparencySliderLabelTable.put(255, invisibleLabel);
    this.wallsTransparencySlider.setLabelTable(wallsTransparencySliderLabelTable);
    this.wallsTransparencySlider.setPaintLabels(true);
    this.wallsTransparencySlider.setPaintTicks(true);
    this.wallsTransparencySlider.setMajorTickSpacing(16);
    this.wallsTransparencySlider.setValue((int)(controller.getWallsAlpha() * 255));
    this.wallsTransparencySlider.addChangeListener(new ChangeListener() {
        public void stateChanged(ChangeEvent ev) {
          controller.setWallsAlpha(wallsTransparencySlider.getValue() / 255f);
        }
      });
    controller.addPropertyChangeListener(Home3DAttributesController.Property.WALLS_ALPHA, 
        new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            wallsTransparencySlider.setValue((int)(controller.getWallsAlpha() * 255));
          }
        });

    this.dialogTitle = preferences.getLocalizedString(
        Home3DAttributesPanel.class, "home3DAttributes.title");
  }

  /**
   * Updates ground radio buttons. 
   */
  private void updateGroundRadioButtons(Home3DAttributesController controller) {
    if (controller.getGroundPaint() == Home3DAttributesController.EnvironmentPaint.COLORED) {
      this.groundColorRadioButton.setSelected(true);
    } else {
      this.groundTextureRadioButton.setSelected(true);
    } 
  }

  /**
   * Updates sky radio buttons. 
   */
  private void updateSkyRadioButtons(Home3DAttributesController controller) {
    if (controller.getSkyPaint() == Home3DAttributesController.EnvironmentPaint.COLORED) {
      this.skyColorRadioButton.setSelected(true);
    } else {
      this.skyTextureRadioButton.setSelected(true);
    } 
  }

  /**
   * Sets components mnemonics and label / component associations.
   */
  private void setMnemonics(UserPreferences preferences) {
    if (!OperatingSystem.isMacOSX()) {
      this.observerFieldOfViewLabel.setDisplayedMnemonic(
          KeyStroke.getKeyStroke(preferences.getLocalizedString(
              Home3DAttributesPanel.class, "observerFieldOfViewLabel.mnemonic")).getKeyCode());
      this.observerFieldOfViewLabel.setLabelFor(this.observerFieldOfViewLabel);
      this.observerHeightLabel.setDisplayedMnemonic(
          KeyStroke.getKeyStroke(preferences.getLocalizedString(
              Home3DAttributesPanel.class, "observerHeightLabel.mnemonic")).getKeyCode());
      this.observerHeightLabel.setLabelFor(this.observerHeightSpinner);
      this.observerCameraElevationLabel.setDisplayedMnemonic(
          KeyStroke.getKeyStroke(preferences.getLocalizedString(
              Home3DAttributesPanel.class, "observerCameraElevationLabel.mnemonic")).getKeyCode());
      this.observerCameraElevationLabel.setLabelFor(this.observerCameraElevationSpinner);
      this.adjustObserverCameraElevationCheckBox.setMnemonic(
          KeyStroke.getKeyStroke(preferences.getLocalizedString(
              Home3DAttributesPanel.class, "adjustObserverCameraElevationCheckBox.mnemonic")).getKeyCode());
      this.groundColorRadioButton.setMnemonic(
          KeyStroke.getKeyStroke(preferences.getLocalizedString(
              Home3DAttributesPanel.class,"groundColorRadioButton.mnemonic")).getKeyCode());
      this.groundTextureRadioButton.setMnemonic(
          KeyStroke.getKeyStroke(preferences.getLocalizedString(
              Home3DAttributesPanel.class,"groundTextureRadioButton.mnemonic")).getKeyCode());
      this.skyColorRadioButton.setMnemonic(
          KeyStroke.getKeyStroke(preferences.getLocalizedString(
              Home3DAttributesPanel.class,"skyColorRadioButton.mnemonic")).getKeyCode());
      this.skyTextureRadioButton.setMnemonic(
          KeyStroke.getKeyStroke(preferences.getLocalizedString(
              Home3DAttributesPanel.class,"skyTextureRadioButton.mnemonic")).getKeyCode());
      this.brightnessLabel.setDisplayedMnemonic(
          KeyStroke.getKeyStroke(preferences.getLocalizedString(
              Home3DAttributesPanel.class,"brightnessLabel.mnemonic")).getKeyCode());
      this.brightnessLabel.setLabelFor(this.brightnessSlider);
      this.wallsTransparencyLabel.setDisplayedMnemonic(
          KeyStroke.getKeyStroke(preferences.getLocalizedString(
              Home3DAttributesPanel.class,"wallsTransparencyLabel.mnemonic")).getKeyCode());
      this.wallsTransparencyLabel.setLabelFor(this.wallsTransparencySlider);
    }
  }
  
  /**
   * Layouts panel components in panel with their labels. 
   */
  private void layoutComponents(UserPreferences preferences) {
    int labelAlignment = OperatingSystem.isMacOSX() 
        ? GridBagConstraints.LINE_END
        : GridBagConstraints.LINE_START;
    // First row
    JPanel observerPanel = SwingTools.createTitledPanel(preferences.getLocalizedString(
        Home3DAttributesPanel.class, "observerPanel.title"));
    Insets labelInsets = new Insets(0, 0, 10, 5);
    observerPanel.add(this.observerFieldOfViewLabel, new GridBagConstraints(
        0, 0, 1, 1, 0, 0, labelAlignment, 
        GridBagConstraints.NONE, labelInsets, 0, 0));
    Insets componentInsets = new Insets(0, 0, 10, 15);
    observerPanel.add(this.observerFieldOfViewSpinner, new GridBagConstraints(
        1, 0, 1, 1, 0, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, componentInsets, 20, 0));
    observerPanel.add(this.observerHeightLabel, new GridBagConstraints(
        2, 0, 1, 1, 0, 0, labelAlignment, 
        GridBagConstraints.NONE, labelInsets, 0, 0));
    Insets rightComponentInsets = new Insets(0, 0, 10, 0);
    observerPanel.add(this.observerHeightSpinner, new GridBagConstraints(
        3, 0, 1, 1, 0, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, rightComponentInsets, -25, 0));
    // observerCameraElevation label and spinner at the same location but both are never visible at the same time 
    observerPanel.add(this.observerCameraElevationLabel, new GridBagConstraints(
        2, 0, 1, 1, 0, 0, labelAlignment, 
        GridBagConstraints.NONE, labelInsets, 0, 0));
    observerPanel.add(this.observerCameraElevationSpinner, new GridBagConstraints(
        3, 0, 1, 1, 0, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, rightComponentInsets, -25, 0));
    // Second row
    observerPanel.add(this.adjustObserverCameraElevationCheckBox, new GridBagConstraints(
        0, 1, 4, 1, 0, 0, GridBagConstraints.CENTER, 
        GridBagConstraints.NONE, new Insets(0, 0, 0, 0), 0, 0));
    Insets rowInsets;
    if (OperatingSystem.isMacOSXLeopardOrSuperior()) {
      // User smaller insets for Mac OS X 10.5
      rowInsets = new Insets(0, 0, 0, 0);
    } else {
      rowInsets = new Insets(0, 0, 5, 0);
    }
    add(observerPanel, new GridBagConstraints(
        0, 0, 2, 1, 0, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, rowInsets, 0, 0));
    
    JPanel groundPanel = SwingTools.createTitledPanel(preferences.getLocalizedString(
        Home3DAttributesPanel.class, "groundPanel.title"));
    // Third row
    Insets closeLabelInsets = new Insets(0, 0, 2, 5);
    groundPanel.add(this.groundColorRadioButton, new GridBagConstraints(
        0, 0, 1, 1, 0, 0, labelAlignment, 
        GridBagConstraints.NONE, closeLabelInsets, 0, 0));
    groundPanel.add(this.groundColorButton, new GridBagConstraints(
        1, 0, 1, 1, 0, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, new Insets(0, 0, 2, 0), 0, 0));
    // Fourth row
    groundPanel.add(this.groundTextureRadioButton, new GridBagConstraints(
        0, 1, 1, 1, 0, 0, labelAlignment, 
        GridBagConstraints.NONE, new Insets(0, 0, 0, 5), 0, 0));
    groundPanel.add(this.groundTextureComponent, new GridBagConstraints(
        1, 1, 1, 1, 0, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, new Insets(0, 0, 0, 0), 0, 0));
    add(groundPanel, new GridBagConstraints(
        0, 1, 1, 1, 0.5, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, rowInsets, 0, 0));
    
    JPanel skyPanel = SwingTools.createTitledPanel(preferences.getLocalizedString(
        Home3DAttributesPanel.class, "skyPanel.title"));
    skyPanel.add(this.skyColorRadioButton, new GridBagConstraints(
        0, 0, 1, 1, 0, 0, labelAlignment, 
        GridBagConstraints.NONE, closeLabelInsets, 0, 0));
    skyPanel.add(this.skyColorButton, new GridBagConstraints(
        1, 0, 1, 1, 0, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, new Insets(0, 0, 2, 0), 0, 0));
    skyPanel.add(this.skyTextureRadioButton, new GridBagConstraints(
        0, 1, 1, 1, 0, 0, labelAlignment, 
        GridBagConstraints.NONE, new Insets(0, 0, 0, 5), 0, 0));
    skyPanel.add(this.skyTextureComponent, new GridBagConstraints(
        1, 1, 1, 1, 0, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, new Insets(0, 0, 0, 0), 0, 0));
    add(skyPanel, new GridBagConstraints(
        1, 1, 1, 1, 0.5, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, rowInsets, 0, 0));
    
    JPanel renderingPanel = SwingTools.createTitledPanel(preferences.getLocalizedString(
        Home3DAttributesPanel.class, "renderingPanel.title"));
    // fifth row
    renderingPanel.add(this.brightnessLabel, new GridBagConstraints(
        0, 0, 1, 1, 0, 0, labelAlignment, 
        GridBagConstraints.NONE, new Insets(0, 0, 0, 5), 0, 0));
    renderingPanel.add(this.brightnessSlider, new GridBagConstraints(
        1, 0, 3, 1, 1, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, new Insets(0, 0, 0, 0), 0, 0));
    // Last row
    renderingPanel.add(this.wallsTransparencyLabel, new GridBagConstraints(
        0, 1, 1, 1, 0, 0, labelAlignment, 
        GridBagConstraints.NONE, new Insets(0, 0, 0, 5), 0, 0));
    renderingPanel.add(this.wallsTransparencySlider, new GridBagConstraints(
        1, 1, 3, 1, 1, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, new Insets(0, 0, 0, 0), 0, 0));
    add(renderingPanel, new GridBagConstraints(
        0, 2, 2, 1, 0, 0, GridBagConstraints.LINE_START, 
        GridBagConstraints.HORIZONTAL, new Insets(0, 0, 0, 0), 0, 0));
  }

  /**
   * Displays this panel in a modal dialog box. 
   */
  public void displayView(View parentView) {
    JFormattedTextField observerFieldOfViewSpinnerTextField = 
        ((JSpinner.DefaultEditor)this.observerFieldOfViewSpinner.getEditor()).getTextField();
    if (SwingTools.showConfirmDialog((JComponent)parentView, 
            this, this.dialogTitle, observerFieldOfViewSpinnerTextField) == JOptionPane.OK_OPTION
        && this.controller != null) {
      this.controller.modify3DAttributes();
    }
  }
}
