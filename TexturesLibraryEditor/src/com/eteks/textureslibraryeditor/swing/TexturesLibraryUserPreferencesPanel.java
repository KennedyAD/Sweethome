/*
 * TexturesLibraryUserPreferencesPanel.java 11 sept 2012
 *
 * Textures Library Editor, Copyright (c) 2012 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
package com.eteks.textureslibraryeditor.swing;

import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.awt.event.ItemEvent;
import java.awt.event.ItemListener;
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

import javax.swing.ButtonGroup;
import javax.swing.JCheckBox;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JRadioButton;
import javax.swing.JTextField;
import javax.swing.KeyStroke;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;

import com.eteks.sweethome3d.model.UserPreferences;
import com.eteks.sweethome3d.swing.SwingTools;
import com.eteks.sweethome3d.swing.UserPreferencesPanel;
import com.eteks.sweethome3d.tools.OperatingSystem;
import com.eteks.textureslibraryeditor.viewcontroller.TexturesLibraryUserPreferencesController;

/**
 * User preferences panel able to edit the additional preferences used by the editor.
 * @author Emmanuel Puybaret
 */
public class TexturesLibraryUserPreferencesPanel extends UserPreferencesPanel {
  private JLabel       defaultCreatorLabel;
  private JTextField   defaultCreatorTextField;
  private JLabel       offlineTexturesLibraryLabel;
  private JCheckBox    offlineTexturesLibraryCheckBox;
  private JLabel       texturesResourcesLocalDirectoryLabel;
  private JTextField   texturesResourcesLocalDirectoryTextField;
  private JLabel       texturesResourcesRemoteUrlBaseLabel;
  private JTextField   texturesResourcesRemoteUrlBaseTextField;
  private JLabel       texturesIdEditableLabel;
  private JRadioButton texturesIdEditableRadioButton;
  private JRadioButton texturesIdNotEditableRadioButton;
  private JLabel       contentMatchingTexturesNameLabel;
  private JRadioButton contentMatchingImportedFileRadioButton;
  private JRadioButton contentMatchingTexturesNameRadioButton;
  private JLabel       importedTextureNameLabel;
  private JRadioButton textureNameEqualToImportedFileNameRadioButton;
  private JRadioButton textureNameAdaptedRadioButton;

  public TexturesLibraryUserPreferencesPanel(UserPreferences preferences,
                                              TexturesLibraryUserPreferencesController controller) {
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
  private void createComponents(UserPreferences preferences,
                                final TexturesLibraryUserPreferencesController controller) {
    abstract class DocumentChangeListener implements DocumentListener {
      public void insertUpdate(DocumentEvent ev) {
        changedUpdate(ev);
      }

      public void removeUpdate(DocumentEvent ev) {
        changedUpdate(ev);
      }
    };

    if (controller.isPropertyEditable(TexturesLibraryUserPreferencesController.Property.DEFAULT_CREATOR)) {
      // Create default author label and its text field bound to DEFAULT_CREATOR controller property
      this.defaultCreatorLabel = new JLabel(SwingTools.getLocalizedLabelText(preferences, TexturesLibraryUserPreferencesPanel.class, "defaultCreatorLabel.text"));
      this.defaultCreatorTextField = new JTextField(controller.getDefaultCreator(), 10);
      if (!OperatingSystem.isMacOSXLeopardOrSuperior()) {
        SwingTools.addAutoSelectionOnFocusGain(this.defaultCreatorTextField);
      }
      final PropertyChangeListener creatorChangeListener = new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            defaultCreatorTextField.setText(controller.getDefaultCreator());
          }
        };
      controller.addPropertyChangeListener(TexturesLibraryUserPreferencesController.Property.DEFAULT_CREATOR, creatorChangeListener);
      this.defaultCreatorTextField.getDocument().addDocumentListener(new DocumentChangeListener() {
          public void changedUpdate(DocumentEvent ev) {
            controller.removePropertyChangeListener(TexturesLibraryUserPreferencesController.Property.DEFAULT_CREATOR, creatorChangeListener);
            String defaultCreator = defaultCreatorTextField.getText();
            if (defaultCreator == null || defaultCreator.trim().length() == 0) {
              controller.setDefaultCreator(null);
            } else {
              controller.setDefaultCreator(defaultCreator);
            }
            controller.addPropertyChangeListener(TexturesLibraryUserPreferencesController.Property.DEFAULT_CREATOR, creatorChangeListener);
          }
        });
    }

    if (controller.isPropertyEditable(TexturesLibraryUserPreferencesController.Property.OFFLINE_TEXTURES_LIBRARY)) {
      // Create offline label and check box bound to controller OFFLINE_TEXTURES_LIBRARY property
      this.offlineTexturesLibraryLabel = new JLabel(preferences.getLocalizedString(
          TexturesLibraryUserPreferencesPanel.class, "offlineTexturesLibraryLabel.text"));
      this.offlineTexturesLibraryCheckBox = new JCheckBox(SwingTools.getLocalizedLabelText(preferences,
          TexturesLibraryUserPreferencesPanel.class, "offlineTexturesLibraryCheckBox.text"), controller.isTexturesLibraryOffline());
      this.offlineTexturesLibraryCheckBox.addItemListener(new ItemListener() {
          public void itemStateChanged(ItemEvent ev) {
            controller.setTexturesLibraryOffline(offlineTexturesLibraryCheckBox.isSelected());
          }
        });
      controller.addPropertyChangeListener(TexturesLibraryUserPreferencesController.Property.OFFLINE_TEXTURES_LIBRARY,
          new PropertyChangeListener() {
            public void propertyChange(PropertyChangeEvent ev) {
              boolean texturesLibraryOffline = controller.isTexturesLibraryOffline();
              offlineTexturesLibraryCheckBox.setSelected(texturesLibraryOffline);
              if (texturesResourcesLocalDirectoryTextField != null) {
                texturesResourcesLocalDirectoryTextField.setEnabled(!texturesLibraryOffline);
              }
              if (texturesResourcesRemoteUrlBaseTextField != null) {
                texturesResourcesRemoteUrlBaseTextField.setEnabled(!texturesLibraryOffline);
              }
            }
          });
    }

    if (controller.isPropertyEditable(TexturesLibraryUserPreferencesController.Property.TEXTURES_RESOURCES_LOCAL_DIRECTORY)) {
      // Create local directory  label and its text field bound to TEXTURES_RESOURCES_LOCAL_DIRECTORY controller property
      this.texturesResourcesLocalDirectoryLabel = new JLabel(SwingTools.getLocalizedLabelText(preferences, TexturesLibraryUserPreferencesPanel.class, "texturesResourcesLocalDirectoryLabel.text"));
      this.texturesResourcesLocalDirectoryTextField = new JTextField(controller.getTexturesResourcesLocalDirectory(), 20);
      this.texturesResourcesLocalDirectoryTextField.setEnabled(!controller.isTexturesLibraryOffline());
      if (!OperatingSystem.isMacOSXLeopardOrSuperior()) {
        SwingTools.addAutoSelectionOnFocusGain(this.texturesResourcesLocalDirectoryTextField);
      }
      final PropertyChangeListener localDirectoryChangeListener = new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            texturesResourcesLocalDirectoryTextField.setText(controller.getTexturesResourcesLocalDirectory());
          }
        };
      controller.addPropertyChangeListener(TexturesLibraryUserPreferencesController.Property.TEXTURES_RESOURCES_LOCAL_DIRECTORY, localDirectoryChangeListener);
      this.texturesResourcesLocalDirectoryTextField.getDocument().addDocumentListener(new DocumentChangeListener() {
          public void changedUpdate(DocumentEvent ev) {
            controller.removePropertyChangeListener(TexturesLibraryUserPreferencesController.Property.TEXTURES_RESOURCES_LOCAL_DIRECTORY, localDirectoryChangeListener);
            String texturesResourcesLocalDirectory = texturesResourcesLocalDirectoryTextField.getText();
            if (texturesResourcesLocalDirectory == null || texturesResourcesLocalDirectory.trim().length() == 0) {
              controller.setTexturesResourcesLocalDirectory(null);
            } else {
              controller.setTexturesResourcesLocalDirectory(texturesResourcesLocalDirectory);
            }
            controller.addPropertyChangeListener(TexturesLibraryUserPreferencesController.Property.TEXTURES_RESOURCES_LOCAL_DIRECTORY, localDirectoryChangeListener);
          }
        });
    }

    if (controller.isPropertyEditable(TexturesLibraryUserPreferencesController.Property.TEXTURES_RESOURCES_REMOTE_URL_BASE)) {
      // Create URL base label and its text field bound to TEXTURES_RESOURCES_REMOTE_URL_BASE controller property
      this.texturesResourcesRemoteUrlBaseLabel = new JLabel(SwingTools.getLocalizedLabelText(preferences, TexturesLibraryUserPreferencesPanel.class, "texturesResourcesRemoteUrlBaseLabel.text"));
      this.texturesResourcesRemoteUrlBaseTextField = new JTextField(controller.getTexturesResourcesRemoteURLBase(), 20);
      this.texturesResourcesRemoteUrlBaseTextField.setEnabled(!controller.isTexturesLibraryOffline());
      if (!OperatingSystem.isMacOSXLeopardOrSuperior()) {
        SwingTools.addAutoSelectionOnFocusGain(this.texturesResourcesRemoteUrlBaseTextField);
      }
      final PropertyChangeListener urlBaseChangeListener = new PropertyChangeListener() {
          public void propertyChange(PropertyChangeEvent ev) {
            texturesResourcesRemoteUrlBaseTextField.setText(controller.getTexturesResourcesRemoteURLBase());
          }
        };
      controller.addPropertyChangeListener(TexturesLibraryUserPreferencesController.Property.TEXTURES_RESOURCES_REMOTE_URL_BASE, urlBaseChangeListener);
      this.texturesResourcesRemoteUrlBaseTextField.getDocument().addDocumentListener(new DocumentChangeListener() {
          public void changedUpdate(DocumentEvent ev) {
            controller.removePropertyChangeListener(TexturesLibraryUserPreferencesController.Property.TEXTURES_RESOURCES_REMOTE_URL_BASE, urlBaseChangeListener);
            String texturesResourcesRemoteUrlBase = texturesResourcesRemoteUrlBaseTextField.getText();
            if (texturesResourcesRemoteUrlBase == null || texturesResourcesRemoteUrlBase.trim().length() == 0) {
              controller.setTexturesResourcesRemoteURLBase(null);
            } else {
              controller.setTexturesResourcesRemoteURLBase(texturesResourcesRemoteUrlBase);
            }
            controller.addPropertyChangeListener(TexturesLibraryUserPreferencesController.Property.TEXTURES_RESOURCES_REMOTE_URL_BASE, urlBaseChangeListener);
          }
        });
    }


    if (controller.isPropertyEditable(TexturesLibraryUserPreferencesController.Property.TEXTURES_ID_EDITABLE)) {
      // Create textures catalog label and radio buttons bound to controller TEXTURES_ID_EDITABLE property
      this.texturesIdEditableLabel = new JLabel(preferences.getLocalizedString(
          TexturesLibraryUserPreferencesPanel.class, "texturesIdEditableLabel.text"));
      this.texturesIdEditableRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences,
          TexturesLibraryUserPreferencesPanel.class, "texturesIdEditableRadioButton.text"),
          controller.isTexturesIdEditable());
      this.texturesIdNotEditableRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences,
          TexturesLibraryUserPreferencesPanel.class, "texturesIdNotEditableRadioButton.text"),
          !controller.isTexturesIdEditable());
      ButtonGroup texturesIdEditableButtonGroup = new ButtonGroup();
      texturesIdEditableButtonGroup.add(this.texturesIdEditableRadioButton);
      texturesIdEditableButtonGroup.add(this.texturesIdNotEditableRadioButton);

      ItemListener texturesIdEditableChangeListener = new ItemListener() {
          public void itemStateChanged(ItemEvent ev) {
            controller.setTexturesIdEditable(texturesIdEditableRadioButton.isSelected());
          }
        };
      this.texturesIdEditableRadioButton.addItemListener(texturesIdEditableChangeListener);
      this.texturesIdNotEditableRadioButton.addItemListener(texturesIdEditableChangeListener);
      controller.addPropertyChangeListener(TexturesLibraryUserPreferencesController.Property.TEXTURES_ID_EDITABLE,
          new PropertyChangeListener() {
            public void propertyChange(PropertyChangeEvent ev) {
              texturesIdEditableRadioButton.setSelected(controller.isTexturesIdEditable());
            }
          });
    }

    if (controller.isPropertyEditable(TexturesLibraryUserPreferencesController.Property.CONTENT_MATCHING_TEXTURES_NAME)) {
      // Create textures catalog label and radio buttons bound to controller CONTENT_MATCHING_TEXTURES_NAME property
      this.contentMatchingTexturesNameLabel = new JLabel(preferences.getLocalizedString(
          TexturesLibraryUserPreferencesPanel.class, "contentMatchingTexturesNameLabel.text"));
      this.contentMatchingImportedFileRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences,
          TexturesLibraryUserPreferencesPanel.class, "contentMatchingImportedFileRadioButton.text"),
          !controller.isContentMatchingTexturesName());
      this.contentMatchingTexturesNameRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences,
          TexturesLibraryUserPreferencesPanel.class, "contentMatchingTexturesNameRadioButton.text"),
          controller.isContentMatchingTexturesName());
      ButtonGroup contentMatchingTexturesNameButtonGroup = new ButtonGroup();
      contentMatchingTexturesNameButtonGroup.add(this.contentMatchingImportedFileRadioButton);
      contentMatchingTexturesNameButtonGroup.add(this.contentMatchingTexturesNameRadioButton);

      ItemListener contentMatchingTexturesNameChangeListener = new ItemListener() {
          public void itemStateChanged(ItemEvent ev) {
            controller.setContentMatchingTexturesName(contentMatchingTexturesNameRadioButton.isSelected());
          }
        };
      this.contentMatchingImportedFileRadioButton.addItemListener(contentMatchingTexturesNameChangeListener);
      this.contentMatchingTexturesNameRadioButton.addItemListener(contentMatchingTexturesNameChangeListener);
      controller.addPropertyChangeListener(TexturesLibraryUserPreferencesController.Property.CONTENT_MATCHING_TEXTURES_NAME,
          new PropertyChangeListener() {
            public void propertyChange(PropertyChangeEvent ev) {
              contentMatchingTexturesNameRadioButton.setSelected(controller.isContentMatchingTexturesName());
            }
          });
    }

    if (controller.isPropertyEditable(TexturesLibraryUserPreferencesController.Property.TEXTURE_NAME_EQUAL_TO_IMPORTED_FILE_NAME)) {
      // Create texture catalog label and radio buttons bound to controller TEXTURE_NAME_EQUAL_TO_IMPORTED_FILE_NAME property
      this.importedTextureNameLabel = new JLabel(preferences.getLocalizedString(
          TexturesLibraryUserPreferencesPanel.class, "importedTextureNameLabel.text"));
      this.textureNameEqualToImportedFileNameRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences,
          TexturesLibraryUserPreferencesPanel.class, "textureNameEqualToImportedFileNameRadioButton.text"),
          controller.isTextureNameEqualToImportedFileName());
      this.textureNameAdaptedRadioButton = new JRadioButton(SwingTools.getLocalizedLabelText(preferences,
          TexturesLibraryUserPreferencesPanel.class, "textureNameAdaptedRadioButton.text"),
          !controller.isTextureNameEqualToImportedFileName());
      ButtonGroup importedTextureNameButtonGroup = new ButtonGroup();
      importedTextureNameButtonGroup.add(this.textureNameEqualToImportedFileNameRadioButton);
      importedTextureNameButtonGroup.add(this.textureNameAdaptedRadioButton);

      ItemListener importedTextureNameChangeListener = new ItemListener() {
          public void itemStateChanged(ItemEvent ev) {
            controller.setTextureNameEqualToImportedFileName(textureNameEqualToImportedFileNameRadioButton.isSelected());
          }
        };
      this.textureNameEqualToImportedFileNameRadioButton.addItemListener(importedTextureNameChangeListener);
      this.textureNameAdaptedRadioButton.addItemListener(importedTextureNameChangeListener);
      controller.addPropertyChangeListener(TexturesLibraryUserPreferencesController.Property.TEXTURE_NAME_EQUAL_TO_IMPORTED_FILE_NAME,
          new PropertyChangeListener() {
            public void propertyChange(PropertyChangeEvent ev) {
              textureNameEqualToImportedFileNameRadioButton.setSelected(controller.isTextureNameEqualToImportedFileName());
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
            TexturesLibraryUserPreferencesPanel.class, "defaultCreatorLabel.mnemonic")).getKeyCode());
        this.defaultCreatorLabel.setLabelFor(this.defaultCreatorTextField);
      }
      if (this.offlineTexturesLibraryLabel != null) {
        this.offlineTexturesLibraryCheckBox.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            TexturesLibraryUserPreferencesPanel.class, "offlineTexturesLibraryCheckBox.mnemonic")).getKeyCode());
      }
      if (this.texturesResourcesLocalDirectoryLabel != null) {
        this.texturesResourcesLocalDirectoryLabel.setDisplayedMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            TexturesLibraryUserPreferencesPanel.class, "texturesResourcesLocalDirectoryLabel.mnemonic")).getKeyCode());
        this.texturesResourcesLocalDirectoryLabel.setLabelFor(this.texturesResourcesLocalDirectoryTextField);
      }
      if (this.texturesResourcesRemoteUrlBaseLabel != null) {
        this.texturesResourcesRemoteUrlBaseLabel.setDisplayedMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            TexturesLibraryUserPreferencesPanel.class, "texturesResourcesRemoteUrlBaseLabel.mnemonic")).getKeyCode());
        this.texturesResourcesRemoteUrlBaseLabel.setLabelFor(this.texturesResourcesRemoteUrlBaseTextField);
      }
      if (this.texturesIdEditableLabel != null) {
        this.texturesIdEditableRadioButton.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            TexturesLibraryUserPreferencesPanel.class, "texturesIdEditableRadioButton.mnemonic")).getKeyCode());
        this.texturesIdNotEditableRadioButton.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            TexturesLibraryUserPreferencesPanel.class, "texturesIdNotEditableRadioButton.mnemonic")).getKeyCode());
      }
      if (this.contentMatchingTexturesNameLabel != null) {
        this.contentMatchingImportedFileRadioButton.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            TexturesLibraryUserPreferencesPanel.class, "contentMatchingImportedFileRadioButton.mnemonic")).getKeyCode());
        this.contentMatchingTexturesNameRadioButton.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            TexturesLibraryUserPreferencesPanel.class, "contentMatchingTexturesNameRadioButton.mnemonic")).getKeyCode());
      }
      if (this.importedTextureNameLabel != null) {
        this.textureNameEqualToImportedFileNameRadioButton.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            TexturesLibraryUserPreferencesPanel.class, "textureNameEqualToImportedFileNameRadioButton.mnemonic")).getKeyCode());
        this.textureNameAdaptedRadioButton.setMnemonic(KeyStroke.getKeyStroke(preferences.getLocalizedString(
            TexturesLibraryUserPreferencesPanel.class, "textureNameAdaptedRadioButton.mnemonic")).getKeyCode());
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
    if (this.offlineTexturesLibraryLabel != null) {
      add(this.offlineTexturesLibraryLabel, new GridBagConstraints(
          0, 101, 1, 1, 0, 0, labelAlignment,
          GridBagConstraints.NONE, labelInsets, 0, 0));
      add(this.offlineTexturesLibraryCheckBox, new GridBagConstraints(
          1, 101, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, componentInsets, 0, 0));
    }
    if (this.texturesResourcesLocalDirectoryLabel != null) {
      add(this.texturesResourcesLocalDirectoryLabel, new GridBagConstraints(
          0, 102, 1, 1, 0, 0, labelAlignment,
          GridBagConstraints.NONE, labelInsets, 0, 0));
      add(this.texturesResourcesLocalDirectoryTextField, new GridBagConstraints(
          1, 102, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.HORIZONTAL, componentInsets, 0, 0));
    }
    if (this.texturesResourcesRemoteUrlBaseLabel != null) {
      add(this.texturesResourcesRemoteUrlBaseLabel, new GridBagConstraints(
          0, 103, 1, 1, 0, 0, labelAlignment,
          GridBagConstraints.NONE, labelInsets, 0, 0));
      add(this.texturesResourcesRemoteUrlBaseTextField, new GridBagConstraints(
          1, 103, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.HORIZONTAL, componentInsets, 0, 0));
    }
    if (this.texturesIdEditableLabel != null) {
      add(this.texturesIdEditableLabel, new GridBagConstraints(
          0, 104, 1, 1, 0, 0, labelAlignment,
          GridBagConstraints.NONE, labelInsets, 0, 0));
      JPanel panel = new JPanel(new GridBagLayout());
      panel.add(this.texturesIdEditableRadioButton, new GridBagConstraints(
          0, 0, 1, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, new Insets(0, 0, 0, gap), 0, 0));
      panel.add(this.texturesIdNotEditableRadioButton, new GridBagConstraints(
          1, 0, 1, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, new Insets(0, 0, 0, 0), 0, 0));
      add(panel, new GridBagConstraints(
          1, 104, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, componentInsets, 0, 0));
    }
    if (this.contentMatchingTexturesNameLabel != null) {
      add(this.contentMatchingTexturesNameLabel, new GridBagConstraints(
          0, 105, 1, 1, 0, 0, labelAlignment,
          GridBagConstraints.NONE, labelInsets, 0, 0));
      add(this.contentMatchingImportedFileRadioButton, new GridBagConstraints(
          1, 105, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, componentInsets, 0, 0));
      add(this.contentMatchingTexturesNameRadioButton, new GridBagConstraints(
          1, 106, 2, 1, 0, 0, GridBagConstraints.LINE_START,
          GridBagConstraints.NONE, new Insets(0, 0, 2 * gap, 0), 0, 0));
     }
     if (this.importedTextureNameLabel != null) {
       add(this.importedTextureNameLabel, new GridBagConstraints(
           0, 107, 1, 1, 0, 0, labelAlignment,
           GridBagConstraints.NONE, labelInsets, 0, 0));
       add(this.textureNameEqualToImportedFileNameRadioButton, new GridBagConstraints(
           1, 107, 2, 1, 0, 0, GridBagConstraints.LINE_START,
           GridBagConstraints.NONE, componentInsets, 0, 0));
       add(this.textureNameAdaptedRadioButton, new GridBagConstraints(
           1, 108, 2, 1, 0, 0, GridBagConstraints.LINE_START,
           GridBagConstraints.NONE, new Insets(0, 0, 0, 0), 0, 0));
    }
  }
}
