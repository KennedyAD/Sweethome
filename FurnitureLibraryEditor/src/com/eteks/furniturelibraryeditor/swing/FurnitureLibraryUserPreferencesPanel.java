/*
 * FurnitureLibraryUserPreferencesPanel.java 7 juin 2010
 *
 * Furniture Library Editor, Copyright (c) 2010 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.swing.ButtonGroup;
import javax.swing.DefaultListCellRenderer;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JComboBox;
import javax.swing.JComponent;
import javax.swing.JLabel;
import javax.swing.JList;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JRadioButton;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.KeyStroke;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.event.ListSelectionEvent;
import javax.swing.event.ListSelectionListener;
import javax.swing.event.TableModelEvent;
import javax.swing.event.TableModelListener;
import javax.swing.table.AbstractTableModel;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.TableCellRenderer;
import javax.swing.table.TableColumnModel;

import com.eteks.furniturelibraryeditor.model.FurnitureProperty;
import com.eteks.furniturelibraryeditor.viewcontroller.FurnitureLibraryUserPreferencesController;
import com.eteks.sweethome3d.io.DefaultFurnitureCatalog;
import com.eteks.sweethome3d.io.DefaultFurnitureCatalog.PropertyKey;
import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.swing.SwingTools;
import com.eteks.sweethome3d.swing.UserPreferencesPanel;
import com.eteks.sweethome3d.tools.OperatingSystem;

/**
 * User preferences panel able to edit the additional preferences used by the editor.
 * @author Emmanuel Puybaret
 */
public class FurnitureLibraryUserPreferencesPanel extends UserPreferencesPanel {
  private JLabel       defaultCreatorLabel;
  private JTextField   defaultCreatorTextField;
  private JLabel       offlineFurnitureLibraryLabel;
  private JCheckBox    offlineFurnitureLibraryCheckBox;
  private JLabel       furnitureResourcesLocalDirectoryLabel;
  private JTextField   furnitureResourcesLocalDirectoryTextField;
  private JLabel       furnitureResourcesRemoteUrlBaseLabel;
  private JTextField   furnitureResourcesRemoteUrlBaseTextField;
  private JLabel       furnitureIdEditableLabel;
  private JRadioButton furnitureIdEditableRadioButton;
  private JRadioButton furnitureIdNotEditableRadioButton;
  private JLabel       contentMatchingFurnitureNameLabel;
  private JRadioButton contentMatchingImportedFileRadioButton;
  private JRadioButton contentMatchingFurnitureNameRadioButton;
  private JLabel       importedFurnitureNameLabel;
  private JRadioButton furnitureNameEqualToModelFileNameRadioButton;
  private JRadioButton furnitureNameAdaptedRadioButton;
  private JLabel       furniturePropertiesLabel;
  private JTable       furniturePropertiesTable;
  private JButton      addPropertyButton;
  private JButton      removePropertyButton;

  public FurnitureLibraryUserPreferencesPanel(UserPreferences preferences,
                                              FurnitureLibraryUserPreferencesController controller) {
    super(preferences, controller);
    // Remove Reset tips button
    remove(getComponentCount() - 1);

    createComponents(preferences, controller);
    setMnemonics(preferences);
    layoutComponents();
  }

  /**
   * Creates and initializes components and their models.
   */
  private void createComponents(final UserPreferences preferences,
                                final FurnitureLibraryUserPreferencesController controller) {
    abstract class DocumentChangeListener implements DocumentListener {
      public void insertUpdate(DocumentEvent ev) {
        changedUpdate(ev);
      }

      public void removeUpdate(DocumentEvent ev) {
        changedUpdate(ev);
      }
    };

    if (controller.isPropertyEditable(FurnitureLibraryUserPreferencesController.Property.DEFAULT_CREATOR)) {
      // Create default author label and its text field bound to DEFAULT_CREATOR controller property
      this.defaultCreatorLabel = new JLabel(SwingTools.getLocalizedLabelText(preferences, FurnitureLibraryUserPreferencesPanel.class, "defaultCreatorLabel.text"));
      this.defaultCreatorTextField = new JTextField(controller.getDefaultCreator(), 10);
      if (!OperatingSystem.isMacOSXLeopardOrSuperior()) {
        SwingTools.addAutoSelectionOnFocusGain(this.defaultCreatorTextField);
      }
      final PropertyChangeListener creatorChangeListener = new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            defaultCreatorTextField.setText(controller.getDefaultCreator());
          }
        };
      controller.addPropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.DEFAULT_CREATOR, creatorChangeListener);
      this.defaultCreatorTextField.getDocument().addDocumentListener(new DocumentChangeListener() {
          public void changedUpdate(DocumentEvent ev) {
            controller.removePropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.DEFAULT_CREATOR, creatorChangeListener);
            String defaultCreator = defaultCreatorTextField.getText();
            if (defaultCreator == null || defaultCreator.trim().length() == 0) {
              controller.setDefaultCreator(null);
            } else {
              controller.setDefaultCreator(defaultCreator);
            }
            controller.addPropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.DEFAULT_CREATOR, creatorChangeListener);
          }
        });
    }

    if (controller.isPropertyEditable(FurnitureLibraryUserPreferencesController.Property.OFFLINE_FURNITURE_LIBRARY)) {
      // Create offline label and check box bound to controller OFFLINE_FURNITURE_LIBRARY property
      this.offlineFurnitureLibraryLabel = new JLabel(preferences.getLocalizedString(
          FurnitureLibraryUserPreferencesPanel.class, "offlineFurnitureLibraryLabel.text"));
      this.offlineFurnitureLibraryCheckBox = new JCheckBox(SwingTools.getLocalizedLabelText(preferences,
          FurnitureLibraryUserPreferencesPanel.class, "offlineFurnitureLibraryCheckBox.text"), controller.isFurnitureLibraryOffline());
      this.offlineFurnitureLibraryCheckBox.addItemListener(new ItemListener() {
          public void itemStateChanged(ItemEvent ev) {
            controller.setFurnitureLibraryOffline(offlineFurnitureLibraryCheckBox.isSelected());
          }
        });
      controller.addPropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.OFFLINE_FURNITURE_LIBRARY,
          new PropertyChangeListener() {
            public void propertyChange(PropertyChangeEvent ev) {
              boolean furnitureLibraryOffline = controller.isFurnitureLibraryOffline();
              offlineFurnitureLibraryCheckBox.setSelected(furnitureLibraryOffline);
              if (furnitureResourcesLocalDirectoryTextField != null) {
                furnitureResourcesLocalDirectoryTextField.setEnabled(!furnitureLibraryOffline);
              }
              if (furnitureResourcesRemoteUrlBaseTextField != null) {
                furnitureResourcesRemoteUrlBaseTextField.setEnabled(!furnitureLibraryOffline);
              }
            }
          });
    }

    if (controller.isPropertyEditable(FurnitureLibraryUserPreferencesController.Property.FURNITURE_RESOURCES_LOCAL_DIRECTORY)) {
      // Create local directory  label and its text field bound to FURNITURE_RESOURCES_LOCAL_DIRECTORY controller property
      this.furnitureResourcesLocalDirectoryLabel = new JLabel(SwingTools.getLocalizedLabelText(preferences, FurnitureLibraryUserPreferencesPanel.class, "furnitureResourcesLocalDirectoryLabel.text"));
      this.furnitureResourcesLocalDirectoryTextField = new JTextField(controller.getFurnitureResourcesLocalDirectory(), 20);
      this.furnitureResourcesLocalDirectoryTextField.setEnabled(!controller.isFurnitureLibraryOffline());
      if (!OperatingSystem.isMacOSXLeopardOrSuperior()) {
        SwingTools.addAutoSelectionOnFocusGain(this.furnitureResourcesLocalDirectoryTextField);
      }
      final PropertyChangeListener localDirectoryChangeListener = new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            furnitureResourcesLocalDirectoryTextField.setText(controller.getFurnitureResourcesLocalDirectory());
          }
        };
      controller.addPropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.FURNITURE_RESOURCES_LOCAL_DIRECTORY, localDirectoryChangeListener);
      this.furnitureResourcesLocalDirectoryTextField.getDocument().addDocumentListener(new DocumentChangeListener() {
          public void changedUpdate(DocumentEvent ev) {
            controller.removePropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.FURNITURE_RESOURCES_LOCAL_DIRECTORY, localDirectoryChangeListener);
            String furnitureResourcesLocalDirectory = furnitureResourcesLocalDirectoryTextField.getText();
            if (furnitureResourcesLocalDirectory == null || furnitureResourcesLocalDirectory.trim().length() == 0) {
              controller.setFurnitureResourcesLocalDirectory(null);
            } else {
              controller.setFurnitureResourcesLocalDirectory(furnitureResourcesLocalDirectory);
            }
            controller.addPropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.FURNITURE_RESOURCES_LOCAL_DIRECTORY, localDirectoryChangeListener);
          }
        });
    }

    if (controller.isPropertyEditable(FurnitureLibraryUserPreferencesController.Property.FURNITURE_RESOURCES_REMOTE_URL_BASE)) {
      // Create URL base label and its text field bound to FURNITURE_RESOURCES_REMOTE_URL_BASE controller property
      this.furnitureResourcesRemoteUrlBaseLabel = new JLabel(SwingTools.getLocalizedLabelText(preferences, FurnitureLibraryUserPreferencesPanel.class, "furnitureResourcesRemoteUrlBaseLabel.text"));
      this.furnitureResourcesRemoteUrlBaseTextField = new JTextField(controller.getFurnitureResourcesRemoteURLBase(), 20);
      this.furnitureResourcesRemoteUrlBaseTextField.setEnabled(!controller.isFurnitureLibraryOffline());
      if (!OperatingSystem.isMacOSXLeopardOrSuperior()) {
        SwingTools.addAutoSelectionOnFocusGain(this.furnitureResourcesRemoteUrlBaseTextField);
      }
      final PropertyChangeListener urlBaseChangeListener = new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            furnitureResourcesRemoteUrlBaseTextField.setText(controller.getFurnitureResourcesRemoteURLBase());
          }
        };
      controller.addPropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.FURNITURE_RESOURCES_REMOTE_URL_BASE, urlBaseChangeListener);
      this.furnitureResourcesRemoteUrlBaseTextField.getDocument().addDocumentListener(new DocumentChangeListener() {
          public void changedUpdate(DocumentEvent ev) {
            controller.removePropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.FURNITURE_RESOURCES_REMOTE_URL_BASE, urlBaseChangeListener);
            String furnitureResourcesRemoteUrlBase = furnitureResourcesRemoteUrlBaseTextField.getText();
            if (furnitureResourcesRemoteUrlBase == null || furnitureResourcesRemoteUrlBase.trim().length() == 0) {
              controller.setFurnitureResourcesRemoteURLBase(null);
            } else {
              controller.setFurnitureResourcesRemoteURLBase(furnitureResourcesRemoteUrlBase);
            }
            controller.addPropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.FURNITURE_RESOURCES_REMOTE_URL_BASE, urlBaseChangeListener);
          }
        });
    }

    if (controller.isPropertyEditable(FurnitureLibraryUserPreferencesController.Property.FURNITURE_ID_EDITABLE)) {
      // Create furniture catalog label and radio buttons bound to controller FURNITURE_ID_EDITABLE property
      this.furnitureIdEditableLabel = new JLabel(preferences.getLocalizedString(
          FurnitureLibraryUserPreferencesPanel.class, "furnitureIdEditableLabel.text"));
      this.furnitureIdEditableRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences,
          FurnitureLibraryUserPreferencesPanel.class, "furnitureIdEditableRadioButton.text"),
          controller.isFurnitureIdEditable());
      this.furnitureIdNotEditableRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences,
          FurnitureLibraryUserPreferencesPanel.class, "furnitureIdNotEditableRadioButton.text"),
          !controller.isFurnitureIdEditable());
      ButtonGroup furnitureIdEditableButtonGroup = new ButtonGroup();
      furnitureIdEditableButtonGroup.add(this.furnitureIdEditableRadioButton);
      furnitureIdEditableButtonGroup.add(this.furnitureIdNotEditableRadioButton);

      ItemListener furnitureIdEditableChangeListener = new ItemListener() {
          public void itemStateChanged(ItemEvent ev) {
            boolean idEditable = furnitureIdEditableRadioButton.isSelected();
            controller.setFurnitureIdEditable(idEditable);
            FurnitureProperty [] furnitureProperties = controller.getFurnitureProperties();
            for (int i = 0; i < furnitureProperties.length; i++) {
              FurnitureProperty property = furnitureProperties [i];
              if (DefaultFurnitureCatalog.PropertyKey.ID.name().equals(property.getDefaultPropertyKeyName())) {
                furnitureProperties [i] = new FurnitureProperty(property.getName(), property.getType(), property.getDefaultPropertyKeyName(),
                    property.isDisplayed(), property.isDisplayable(), idEditable, idEditable);
                break;
              }
            }
            controller.setFurnitureProperties(furnitureProperties);
          }
        };
      this.furnitureIdEditableRadioButton.addItemListener(furnitureIdEditableChangeListener);
      this.furnitureIdNotEditableRadioButton.addItemListener(furnitureIdEditableChangeListener);
      controller.addPropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.FURNITURE_ID_EDITABLE,
          new PropertyChangeListener() {
            public void propertyChange(PropertyChangeEvent ev) {
              furnitureIdEditableRadioButton.setSelected(controller.isFurnitureIdEditable());
            }
          });
    }

    if (controller.isPropertyEditable(FurnitureLibraryUserPreferencesController.Property.CONTENT_MATCHING_FURNITURE_NAME)) {
      // Create furniture catalog label and radio buttons bound to controller CONTENT_MATCHING_FURNITURE_NAME property
      this.contentMatchingFurnitureNameLabel = new JLabel(preferences.getLocalizedString(
          FurnitureLibraryUserPreferencesPanel.class, "contentMatchingFurnitureNameLabel.text"));
      this.contentMatchingImportedFileRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences,
          FurnitureLibraryUserPreferencesPanel.class, "contentMatchingImportedFileRadioButton.text"),
          !controller.isContentMatchingFurnitureName());
      this.contentMatchingFurnitureNameRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences,
          FurnitureLibraryUserPreferencesPanel.class, "contentMatchingFurnitureNameRadioButton.text"),
          controller.isContentMatchingFurnitureName());
      ButtonGroup contentMatchingFurnitureNameButtonGroup = new ButtonGroup();
      contentMatchingFurnitureNameButtonGroup.add(this.contentMatchingImportedFileRadioButton);
      contentMatchingFurnitureNameButtonGroup.add(this.contentMatchingFurnitureNameRadioButton);

      ItemListener contentMatchingFurnitureNameChangeListener = new ItemListener() {
          public void itemStateChanged(ItemEvent ev) {
            controller.setContentMatchingFurnitureName(contentMatchingFurnitureNameRadioButton.isSelected());
          }
        };
      this.contentMatchingImportedFileRadioButton.addItemListener(contentMatchingFurnitureNameChangeListener);
      this.contentMatchingFurnitureNameRadioButton.addItemListener(contentMatchingFurnitureNameChangeListener);
      controller.addPropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.CONTENT_MATCHING_FURNITURE_NAME,
          new PropertyChangeListener() {
            public void propertyChange(PropertyChangeEvent ev) {
              contentMatchingFurnitureNameRadioButton.setSelected(controller.isContentMatchingFurnitureName());
            }
          });
    }

    if (controller.isPropertyEditable(FurnitureLibraryUserPreferencesController.Property.FURNITURE_NAME_EQUAL_TO_IMPORTED_MODEL_FILE_NAME)) {
      // Create furniture catalog label and radio buttons bound to controller FURNITURE_NAME_EQUAL_TO_IMPORTED_MODEL_FILE_NAME property
      this.importedFurnitureNameLabel = new JLabel(preferences.getLocalizedString(
          FurnitureLibraryUserPreferencesPanel.class, "importedFurnitureNameLabel.text"));
      this.furnitureNameEqualToModelFileNameRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences,
          FurnitureLibraryUserPreferencesPanel.class, "furnitureNameEqualToModelFileNameRadioButton.text"),
          controller.isFurnitureNameEqualToImportedModelFileName());
      this.furnitureNameAdaptedRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences,
          FurnitureLibraryUserPreferencesPanel.class, "furnitureNameAdaptedRadioButton.text"),
          !controller.isFurnitureNameEqualToImportedModelFileName());
      ButtonGroup importedFurnitureNameButtonGroup = new ButtonGroup();
      importedFurnitureNameButtonGroup.add(this.furnitureNameEqualToModelFileNameRadioButton);
      importedFurnitureNameButtonGroup.add(this.furnitureNameAdaptedRadioButton);

      ItemListener importedFurnitureNameChangeListener = new ItemListener() {
          public void itemStateChanged(ItemEvent ev) {
            controller.setFurnitureNameEqualToImportedModelFileName(furnitureNameEqualToModelFileNameRadioButton.isSelected());
          }
        };
      this.furnitureNameEqualToModelFileNameRadioButton.addItemListener(importedFurnitureNameChangeListener);
      this.furnitureNameAdaptedRadioButton.addItemListener(importedFurnitureNameChangeListener);
      controller.addPropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.FURNITURE_NAME_EQUAL_TO_IMPORTED_MODEL_FILE_NAME,
          new PropertyChangeListener() {
            public void propertyChange(PropertyChangeEvent ev) {
              furnitureNameEqualToModelFileNameRadioButton.setSelected(controller.isFurnitureNameEqualToImportedModelFileName());
            }
          });
    }

    if (controller.isPropertyEditable(FurnitureLibraryUserPreferencesController.Property.FURNITURE_PROPERTIES)) {
      this.furniturePropertiesLabel = new JLabel(SwingTools.getLocalizedLabelText(preferences,
          FurnitureLibraryUserPreferencesPanel.class, "furniturePropertiesLabel.text"));
      final FurniturePropertiesTableModel furniturePropertiesTableModel = new FurniturePropertiesTableModel(controller.getFurnitureProperties(), preferences);
      this.furniturePropertiesTable = new JTable(furniturePropertiesTableModel);
      this.furniturePropertiesTable.getTableHeader().setReorderingAllowed(false);
      float resolutionScale = SwingTools.getResolutionScale();
      if (resolutionScale != 1) {
        // Adapt row height to specified resolution scale
        this.furniturePropertiesTable.setRowHeight(Math.round(this.furniturePropertiesTable.getRowHeight() * resolutionScale));
      }
      // Set column widths
      this.furniturePropertiesTable.setAutoResizeMode(JTable.AUTO_RESIZE_ALL_COLUMNS);
      TableColumnModel columnModel = this.furniturePropertiesTable.getColumnModel();
      int [] columnMinWidths = {50, 15, 15};
      Font defaultFont = new DefaultTableCellRenderer().getFont();
      int charWidth;
      if (defaultFont != null) {
        charWidth = getFontMetrics(defaultFont).getWidths() ['A'];
      } else {
        charWidth = 10;
      }
      for (int i = 0; i < columnMinWidths.length; i++) {
        columnModel.getColumn(i).setPreferredWidth(columnMinWidths [i] * charWidth);
      }

      columnModel.getColumn(0).setCellRenderer(new DefaultTableCellRenderer() {
          @Override
          public Component getTableCellRendererComponent(JTable table, Object value, boolean isSelected, boolean hasFocus, int row, int column) {
            JComponent label = (JComponent)super.getTableCellRendererComponent(table, value, isSelected, hasFocus, row, column);
            if (furniturePropertiesTableModel.getFurnitureProperties() [row].getDefaultPropertyKeyName() == null) {
              label.setFont(label.getFont().deriveFont(Font.ITALIC));
            }
            return label;
          }
        });
      // Display second and third column as a check box
      TableCellRenderer checkBoxCellRenderer = new TableCellRenderer() {
          private TableCellRenderer booleanRenderer = furniturePropertiesTable.getDefaultRenderer(Boolean.class);

          public Component getTableCellRendererComponent(JTable table,
               Object value, boolean isSelected, boolean hasFocus, int row, int column) {
            Component checkBox = this.booleanRenderer.getTableCellRendererComponent(
                table, value, isSelected, hasFocus, row, column);
            checkBox.setEnabled(table.isCellEditable(row, column));
            return checkBox;
          }
        };
      columnModel.getColumn(1).setCellRenderer(checkBoxCellRenderer);
      columnModel.getColumn(1).setCellEditor(this.furniturePropertiesTable.getDefaultEditor(Boolean.class));
      columnModel.getColumn(2).setCellRenderer(checkBoxCellRenderer);
      columnModel.getColumn(2).setCellEditor(this.furniturePropertiesTable.getDefaultEditor(Boolean.class));

      final PropertyChangeListener furniturePropertiesChangeListener = new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            furniturePropertiesTableModel.setFurnitureProperties(controller.getFurnitureProperties());
          }
        };
      controller.addPropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.FURNITURE_PROPERTIES,
          furniturePropertiesChangeListener);
      furniturePropertiesTableModel.addTableModelListener(new TableModelListener() {
            public void tableChanged(TableModelEvent ev) {
              controller.removePropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.FURNITURE_PROPERTIES, furniturePropertiesChangeListener);
              controller.setFurnitureProperties(furniturePropertiesTableModel.getFurnitureProperties());
              controller.addPropertyChangeListener(FurnitureLibraryUserPreferencesController.Property.FURNITURE_PROPERTIES, furniturePropertiesChangeListener);
            }
          });

      this.addPropertyButton = new JButton(SwingTools.getLocalizedLabelText(preferences,
          FurnitureLibraryUserPreferencesPanel.class, "addPropertyButton.text"));
      this.addPropertyButton.addActionListener(new ActionListener() {
          public void actionPerformed(ActionEvent ev) {
            String title = SwingTools.getLocalizedLabelText(preferences, FurnitureLibraryUserPreferencesPanel.class, "addProperty.title");
            // Prepare input panel
            JLabel nameLabel = new JLabel(SwingTools.getLocalizedLabelText(preferences, FurnitureLibraryUserPreferencesPanel.class, "addProperty.nameLabel.text"));
            JTextField nameTextField = new JTextField(20);
            JLabel typeLabel = new JLabel(SwingTools.getLocalizedLabelText(preferences, FurnitureLibraryUserPreferencesPanel.class, "addProperty.typeLabel.text"));
            List<FurnitureProperty.Type> types = new ArrayList<FurnitureProperty.Type>(Arrays.asList(
                FurnitureProperty.Type.ANY,
                FurnitureProperty.Type.STRING,
                FurnitureProperty.Type.BOOLEAN,
                FurnitureProperty.Type.NUMBER,
                FurnitureProperty.Type.LENGTH,
                FurnitureProperty.Type.DATE,
                FurnitureProperty.Type.CONTENT));
            JComboBox typeComboBox = new JComboBox(types.toArray());
            typeComboBox.setMaximumRowCount(types.size());
            typeComboBox.setRenderer(new DefaultListCellRenderer() {
                public Component getListCellRendererComponent(JList list, Object value, int index, boolean isSelected, boolean cellHasFocus) {
                  value = preferences.getLocalizedString(FurnitureLibraryUserPreferencesPanel.class, "propertyType." +  ((FurnitureProperty.Type)value).name() + ".text");
                  return super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus);
                }
              });
            JPanel inputPanel = new JPanel(new GridBagLayout());
            inputPanel.add(nameLabel, new GridBagConstraints(
                0, 0, 1, 1, 0, 0, OperatingSystem.isMacOSX() ? GridBagConstraints.LINE_END : GridBagConstraints.LINE_START,
                GridBagConstraints.NONE, new Insets(0, 0, 5, 5), 0, 0));
            inputPanel.add(nameTextField, new GridBagConstraints(
                1, 0, 1, 1, 0, 0, GridBagConstraints.LINE_START,
                GridBagConstraints.NONE, new Insets(0, 0, 5, 0), 0, 0));
            inputPanel.add(typeLabel, new GridBagConstraints(
                0, 1, 1, 1, 0, 0, OperatingSystem.isMacOSX() ? GridBagConstraints.LINE_END : GridBagConstraints.LINE_START,
                GridBagConstraints.NONE, new Insets(0, 0, 0, 5), 0, 0));
            inputPanel.add(typeComboBox, new GridBagConstraints(
                1, 1, 1, 1, 0, 0, GridBagConstraints.LINE_START,
                GridBagConstraints.NONE, new Insets(0, 0, 0, 0), 0, 0));
            if (SwingTools.showConfirmDialog(FurnitureLibraryUserPreferencesPanel.this, inputPanel, title, nameTextField) == JOptionPane.OK_OPTION) {
              if (nameTextField.getText() != null && nameTextField.getText().trim().length() > 0) {
                for (DefaultFurnitureCatalog.PropertyKey defaultProperty : DefaultFurnitureCatalog.PropertyKey.values()) {
                  if (defaultProperty.getKeyPrefix().equalsIgnoreCase(nameTextField.getText())) {
                    title = SwingTools.getLocalizedLabelText(preferences, FurnitureLibraryUserPreferencesPanel.class, "addExistingProperty.title");
                    String message = SwingTools.getLocalizedLabelText(preferences, FurnitureLibraryUserPreferencesPanel.class, "addExistingProperty.message");
                    JOptionPane.showMessageDialog(FurnitureLibraryUserPreferencesPanel.this, message, title, JOptionPane.ERROR_MESSAGE);
                    return;
                  }
                }
                ArrayList<FurnitureProperty> furnitureProperties = new ArrayList<FurnitureProperty>(Arrays.asList(controller.getFurnitureProperties()));
                furnitureProperties.add(new FurnitureProperty(nameTextField.getText(), (FurnitureProperty.Type)typeComboBox.getSelectedItem()));
                controller.setFurnitureProperties(furnitureProperties.toArray(new FurnitureProperty [furnitureProperties.size()]));
                furniturePropertiesTable.setRowSelectionInterval(furnitureProperties.size() - 1, furnitureProperties.size() - 1);
                furniturePropertiesTable.scrollRectToVisible(furniturePropertiesTable.getCellRect(furnitureProperties.size() - 1, 0, true));
              }
            }
          }
        });
      this.removePropertyButton = new JButton(SwingTools.getLocalizedLabelText(preferences,
          FurnitureLibraryUserPreferencesPanel.class, "removePropertyButton.text"));
      this.removePropertyButton.addActionListener(new ActionListener() {
          public void actionPerformed(ActionEvent ev) {
            ArrayList<FurnitureProperty> furnitureProperties = new ArrayList<FurnitureProperty>(Arrays.asList(controller.getFurnitureProperties()));
            int [] selectedRows = furniturePropertiesTable.getSelectedRows();
            for (int i = selectedRows.length - 1; i >= 0; i--) {
              if (furnitureProperties.get(selectedRows[i]).getDefaultPropertyKeyName() == null) {
                furnitureProperties.remove(selectedRows[i]);
              }
            }
            controller.setFurnitureProperties(furnitureProperties.toArray(new FurnitureProperty [furnitureProperties.size()]));
            furniturePropertiesTable.clearSelection();
          }
        });
      this.removePropertyButton.setEnabled(false);
      this.furniturePropertiesTable.getSelectionModel().addListSelectionListener(new ListSelectionListener() {
          public void valueChanged(ListSelectionEvent ev) {
            ArrayList<FurnitureProperty> furnitureProperties = new ArrayList<FurnitureProperty>(Arrays.asList(controller.getFurnitureProperties()));
            int [] selectedRows = furniturePropertiesTable.getSelectedRows();
            for (int i = selectedRows.length - 1; i >= 0; i--) {
              if (furnitureProperties.get(selectedRows[i]).getDefaultPropertyKeyName() == null) {
                removePropertyButton.setEnabled(true);
                return;
              }
            }
            removePropertyButton.setEnabled(false);
          }
        });
    }
  }

  /**
   * Sets components mnemonics and label / component associations.
   */
  private void setMnemonics(UserPreferences preferences) {
    if (!OperatingSystem.isMacOSX()) {
      if (this.defaultCreatorLabel != null) {
        this.defaultCreatorLabel.setDisplayedMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            FurnitureLibraryUserPreferencesPanel.class, "defaultCreatorLabel.mnemonic")).getKeyCode());
        this.defaultCreatorLabel.setLabelFor(this.defaultCreatorTextField);
      }
      if (this.offlineFurnitureLibraryLabel != null) {
        this.offlineFurnitureLibraryCheckBox.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            FurnitureLibraryUserPreferencesPanel.class, "offlineFurnitureLibraryCheckBox.mnemonic")).getKeyCode());
      }
      if (this.furnitureResourcesLocalDirectoryLabel != null) {
        this.furnitureResourcesLocalDirectoryLabel.setDisplayedMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            FurnitureLibraryUserPreferencesPanel.class, "furnitureResourcesLocalDirectoryLabel.mnemonic")).getKeyCode());
        this.furnitureResourcesLocalDirectoryLabel.setLabelFor(this.furnitureResourcesLocalDirectoryTextField);
      }
      if (this.furnitureResourcesRemoteUrlBaseLabel != null) {
        this.furnitureResourcesRemoteUrlBaseLabel.setDisplayedMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            FurnitureLibraryUserPreferencesPanel.class, "furnitureResourcesRemoteUrlBaseLabel.mnemonic")).getKeyCode());
        this.furnitureResourcesRemoteUrlBaseLabel.setLabelFor(this.furnitureResourcesRemoteUrlBaseTextField);
      }
      if (this.furnitureIdEditableLabel != null) {
        this.furnitureIdEditableRadioButton.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            FurnitureLibraryUserPreferencesPanel.class, "furnitureIdEditableRadioButton.mnemonic")).getKeyCode());
        this.furnitureIdNotEditableRadioButton.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            FurnitureLibraryUserPreferencesPanel.class, "furnitureIdNotEditableRadioButton.mnemonic")).getKeyCode());
      }
      if (this.contentMatchingFurnitureNameLabel != null) {
        this.contentMatchingImportedFileRadioButton.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            FurnitureLibraryUserPreferencesPanel.class, "contentMatchingImportedFileRadioButton.mnemonic")).getKeyCode());
        this.contentMatchingFurnitureNameRadioButton.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            FurnitureLibraryUserPreferencesPanel.class, "contentMatchingFurnitureNameRadioButton.mnemonic")).getKeyCode());
      }
      if (this.importedFurnitureNameLabel != null) {
        this.furnitureNameEqualToModelFileNameRadioButton.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            FurnitureLibraryUserPreferencesPanel.class, "furnitureNameEqualToModelFileNameRadioButton.mnemonic")).getKeyCode());
        this.furnitureNameAdaptedRadioButton.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            FurnitureLibraryUserPreferencesPanel.class, "furnitureNameAdaptedRadioButton.mnemonic")).getKeyCode());
      }
      if (this.addPropertyButton != null) {
        this.addPropertyButton.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            FurnitureLibraryUserPreferencesPanel.class, "addPropertyButton.mnemonic")).getKeyCode());
        this.removePropertyButton.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            FurnitureLibraryUserPreferencesPanel.class, "removePropertyButton.mnemonic")).getKeyCode());;
      }
    }
  }

  /**
   * Layouts panel components in panel with their labels.
   */
  private void layoutComponents() {
    int labelAlignment = OperatingSystem.isMacOSX()
        ? GridBagConstraints.LINE_END
        : GridBagConstraints.LINE_START;
    int gap = Math.round(5 * SwingTools.getResolutionScale());
    Insets labelInsets = new Insets(0, 0, gap, gap);
    Insets componentInsets = new Insets(0, 0, gap, 0);
    if (this.defaultCreatorLabel != null) {
      add(this.defaultCreatorLabel, new GridBagConstraints(
          0, 100, 1, 1, 0, 0, labelAlignment,
          GridBagConstraints.NONE, labelInsets, 0, 0));
      add(this.defaultCreatorTextField, new GridBagConstraints(
          1, 100, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.HORIZONTAL, componentInsets, 0, 0));
    }
    if (this.offlineFurnitureLibraryLabel != null) {
      add(this.offlineFurnitureLibraryLabel, new GridBagConstraints(
          0, 101, 1, 1, 0, 0, labelAlignment,
          GridBagConstraints.NONE, labelInsets, 0, 0));
      add(this.offlineFurnitureLibraryCheckBox, new GridBagConstraints(
          1, 101, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, componentInsets, 0, 0));
    }
    if (this.furnitureResourcesLocalDirectoryLabel != null) {
      add(this.furnitureResourcesLocalDirectoryLabel, new GridBagConstraints(
          0, 102, 1, 1, 0, 0, labelAlignment,
          GridBagConstraints.NONE, labelInsets, 0, 0));
      add(this.furnitureResourcesLocalDirectoryTextField, new GridBagConstraints(
          1, 102, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.HORIZONTAL, componentInsets, 0, 0));
    }
    if (this.furnitureResourcesRemoteUrlBaseLabel != null) {
      add(this.furnitureResourcesRemoteUrlBaseLabel, new GridBagConstraints(
          0, 103, 1, 1, 0, 0, labelAlignment,
          GridBagConstraints.NONE, labelInsets, 0, 0));
      add(this.furnitureResourcesRemoteUrlBaseTextField, new GridBagConstraints(
          1, 103, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.HORIZONTAL, componentInsets, 0, 0));
    }
    if (this.furnitureIdEditableLabel != null) {
      add(this.furnitureIdEditableLabel, new GridBagConstraints(
          0, 104, 1, 1, 0, 0, labelAlignment,
          GridBagConstraints.NONE, labelInsets, 0, 0));
      JPanel panel = new JPanel(new GridBagLayout());
      panel.add(this.furnitureIdEditableRadioButton, new GridBagConstraints(
          0, 0, 1, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, new Insets(0, 0, 0, gap), 0, 0));
      panel.add(this.furnitureIdNotEditableRadioButton, new GridBagConstraints(
          1, 0, 1, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, new Insets(0, 0, 0, 0), 0, 0));
      add(panel, new GridBagConstraints(
          1, 104, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, componentInsets, 0, 0));
    }
    if (this.contentMatchingFurnitureNameLabel != null) {
      add(this.contentMatchingFurnitureNameLabel, new GridBagConstraints(
          0, 105, 1, 1, 0, 0, labelAlignment,
          GridBagConstraints.NONE, labelInsets, 0, 0));
      add(this.contentMatchingImportedFileRadioButton, new GridBagConstraints(
          1, 105, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, componentInsets, 0, 0));
      add(this.contentMatchingFurnitureNameRadioButton, new GridBagConstraints(
          1, 106, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, new Insets(0, 0, 2 * gap, 0), 0, 0));
    }
    if (this.importedFurnitureNameLabel != null) {
      add(this.importedFurnitureNameLabel, new GridBagConstraints(
          0, 107, 1, 1, 0, 0, labelAlignment,
          GridBagConstraints.NONE, labelInsets, 0, 0));
      add(this.furnitureNameEqualToModelFileNameRadioButton, new GridBagConstraints(
          1, 107, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, componentInsets, 0, 0));
      add(this.furnitureNameAdaptedRadioButton, new GridBagConstraints(
          1, 108, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, componentInsets, 0, 0));
    }
   if (this.furniturePropertiesTable != null) {
      add(this.furniturePropertiesLabel, new GridBagConstraints(
          0, 109, 1, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, labelInsets, 0, 0));
      JPanel furniturePropertiesPanel = new JPanel(new GridBagLayout());
      JScrollPane furniturePropertiesScrollPane = SwingTools.createScrollPane(this.furniturePropertiesTable);
      furniturePropertiesScrollPane.setPreferredSize(new Dimension(
          Math.round(400 * SwingTools.getResolutionScale()),
          this.furniturePropertiesTable.getTableHeader().getPreferredSize().height + this.furniturePropertiesTable.getRowHeight() * 10 + 3));
      furniturePropertiesPanel.add(furniturePropertiesScrollPane, new GridBagConstraints(
          0, 0, 1, 2, 0, 0, GridBagConstraints.CENTER,
          GridBagConstraints.BOTH, new Insets(0, 0, 0, gap), 0, 0));
      furniturePropertiesPanel.add(this.addPropertyButton, new GridBagConstraints(
          1, 0, 1, 1, 0, 0.5, GridBagConstraints.SOUTH,
          GridBagConstraints.HORIZONTAL, componentInsets, 0, 0));
      furniturePropertiesPanel.add(this.removePropertyButton, new GridBagConstraints(
          1, 1, 1, 1, 0, 0.5, GridBagConstraints.NORTH,
          GridBagConstraints.HORIZONTAL, new Insets(0, 0, 0, 0), 0, 0));
      add(furniturePropertiesPanel, new GridBagConstraints(
          0, 110, 3, 1, 0, 0, GridBagConstraints.NORTH,
          GridBagConstraints.NONE, new Insets(0, 0, 0, 0), 0, 0));
    }
  }

  /**
   * Table model showing the name of furniture properties.
   */
  private class FurniturePropertiesTableModel extends AbstractTableModel {
    private FurnitureProperty [] furnitureProperties;
    private String []            columnNames;

    private FurniturePropertiesTableModel(FurnitureProperty [] furnitureProperties,
                                          UserPreferences preferences) {
      this.furnitureProperties = furnitureProperties;
      this.columnNames = new String [] {
          preferences.getLocalizedString(FurnitureLibraryUserPreferencesPanel.class,"furnitureProperties.nameColumn"),
          preferences.getLocalizedString(FurnitureLibraryUserPreferencesPanel.class,"furnitureProperties.modifiableColumn"),
          preferences.getLocalizedString(FurnitureLibraryUserPreferencesPanel.class,"furnitureProperties.displayedColumn")};
    }

    public int getRowCount() {
      return this.furnitureProperties.length;
    }

    public int getColumnCount() {
      return columnNames.length;
    }

    @Override
    public String getColumnName(int column) {
      return columnNames [column];
    }

    public Object getValueAt(int rowIndex, int columnIndex) {
      FurnitureProperty property = this.furnitureProperties [rowIndex];
      switch (columnIndex) {
        case 0:
          return property.getName();
        case 1:
          return property.isModifiable();
        case 2:
          return property.isDisplayed();
        default:
          throw new IllegalArgumentException();
      }
    }

    @Override
    public void setValueAt(Object value, int rowIndex, int columnIndex) {
      FurnitureProperty property = this.furnitureProperties [rowIndex];
      switch (columnIndex) {
        case 1:
          Boolean modifiable = (Boolean)value;
          this.furnitureProperties [rowIndex] = property.deriveModifiableProperty(modifiable);
          fireTableCellUpdated(rowIndex, columnIndex);
          if (property.getDefaultPropertyKeyName() != null) {
            // Update modifiable state of bound properties
            PropertyKey defaultProperty = DefaultFurnitureCatalog.PropertyKey.valueOf(property.getDefaultPropertyKeyName());
            switch (defaultProperty) {
              case DOOR_OR_WINDOW_SASH_X_AXIS:
              case DOOR_OR_WINDOW_SASH_Y_AXIS:
              case DOOR_OR_WINDOW_SASH_WIDTH:
              case DOOR_OR_WINDOW_SASH_START_ANGLE:
              case DOOR_OR_WINDOW_SASH_END_ANGLE:
                setValueAt(modifiable, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_X_AXIS);
                setValueAt(modifiable, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_Y_AXIS);
                setValueAt(modifiable, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_START_ANGLE);
                setValueAt(modifiable, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_END_ANGLE);
                setValueAt(modifiable, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_WIDTH);
                break;
              case LIGHT_SOURCE_X:
              case LIGHT_SOURCE_Y:
              case LIGHT_SOURCE_Z:
              case LIGHT_SOURCE_COLOR:
              case LIGHT_SOURCE_DIAMETER:
                setValueAt(modifiable, DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_X);
                setValueAt(modifiable, DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_Y);
                setValueAt(modifiable, DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_Z);
                setValueAt(modifiable, DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_COLOR);
                if (!modifiable && defaultProperty != DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_DIAMETER) {
                  setValueAt(modifiable, DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_DIAMETER);
                }
            }
          }
          break;
        case 2:
          this.furnitureProperties [rowIndex] = property.deriveDisplayedProperty((Boolean)value);
          fireTableCellUpdated(rowIndex, columnIndex);
          break;
      }
    }

    public void setValueAt(boolean modifiable, DefaultFurnitureCatalog.PropertyKey propertyKey) {
      for (int row = 0; row < this.furnitureProperties.length; row++) {
        FurnitureProperty property = this.furnitureProperties [row];
        if (property.getDefaultPropertyKeyName() != null
            && propertyKey == DefaultFurnitureCatalog.PropertyKey.valueOf(property.getDefaultPropertyKeyName())) {
          this.furnitureProperties [row] = property.deriveModifiableProperty(modifiable);
          fireTableCellUpdated(row, 1);
          break;
        }
      }
    }

    public boolean isCellEditable(int rowIndex, int columnIndex) {
      FurnitureProperty property = this.furnitureProperties [rowIndex];
      return columnIndex == 1 && property.isEditable() && !DefaultFurnitureCatalog.PropertyKey.NAME.getKeyPrefix().equals(property.getName())
          || columnIndex == 2 && property.isDisplayable() && !DefaultFurnitureCatalog.PropertyKey.NAME.getKeyPrefix().equals(property.getName());
    }

    public FurnitureProperty [] getFurnitureProperties() {
      return this.furnitureProperties;
    }

    public void setFurnitureProperties(FurnitureProperty [] furnitureProperties) {
      this.furnitureProperties = furnitureProperties;
      fireTableDataChanged();
    }
  }
}
