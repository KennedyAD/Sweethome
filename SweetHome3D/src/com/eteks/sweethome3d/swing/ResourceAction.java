/*
 * ResourceAction.java 8 juil. 2006
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

import java.awt.event.ActionEvent;
import java.beans.PropertyChangeListener;
import java.util.MissingResourceException;
import java.util.ResourceBundle;

import javax.swing.AbstractAction;
import javax.swing.Action;
import javax.swing.ImageIcon;
import javax.swing.KeyStroke;

/**
 * An action with properties read from a resource bundle file.
 * @author Emmanuel Puybaret
 */
public class ResourceAction extends AbstractAction {
  public static final String POPUP = "Popup";
  
  /**
   * Creates a disabled action with properties retrieved from a resource bundle 
   * in which key starts with <code>actionPrefix</code>.
   * @param resource a resource bundle
   * @param actionPrefix  prefix used in resource bundle to search action properties
   */
  public ResourceAction(ResourceBundle resource, String actionPrefix) {
    this(resource, actionPrefix, false);
  }
  
  /**
   * Creates an action with properties retrieved from a resource bundle 
   * in which key starts with <code>actionPrefix</code>.
   * @param resource a resource bundle
   * @param actionPrefix  prefix used in resource bundle to search action properties
   * @param enabled <code>true</code> if the action should be enabled at creation.
   */
  public ResourceAction(ResourceBundle resource, String actionPrefix, boolean enabled) {
    String propertyPrefix = actionPrefix + ".";
    putValue(NAME, resource.getString(propertyPrefix + NAME));
    putValue(DEFAULT, getValue(NAME));
    putValue(POPUP, getOptionalString(resource, propertyPrefix + POPUP));
    
    putValue(SHORT_DESCRIPTION, 
        getOptionalString(resource, propertyPrefix + SHORT_DESCRIPTION));
    putValue(LONG_DESCRIPTION, 
        getOptionalString(resource, propertyPrefix + LONG_DESCRIPTION));
    
    String smallIcon = getOptionalString(resource, propertyPrefix + SMALL_ICON);
    if (smallIcon != null) {
      putValue(SMALL_ICON, new ImageIcon(getClass().getResource(smallIcon)));
    }

    String propertyKey = propertyPrefix + ACCELERATOR_KEY;
    // Search first if there's a key for this OS
    String acceleratorKey = getOptionalString(resource, 
        propertyKey + "." + System.getProperty("os.name"));
    if (acceleratorKey == null) {
      // Then search default value
      acceleratorKey = getOptionalString(resource, propertyKey);
    }
    if (acceleratorKey !=  null) {
      putValue(ACCELERATOR_KEY, KeyStroke.getKeyStroke(acceleratorKey));
    }
    
    String mnemonicKey = getOptionalString(resource, propertyPrefix + MNEMONIC_KEY);
    if (mnemonicKey != null) {
      putValue(MNEMONIC_KEY, Integer.valueOf(KeyStroke.getKeyStroke(mnemonicKey).getKeyCode()));
    }
    
    setEnabled(enabled);
  }

  /**
   * Returns the value of <code>propertyKey</code> in <code>resource</code>, 
   * or <code>null</code> if the property doesn't exist.
   */
  private String getOptionalString(ResourceBundle resource, String propertyKey) {
    try {
      return resource.getString(propertyKey);
    } catch (MissingResourceException ex) {
      return null;
    }
  }

  /**
   * Unsupported operation. Subclasses should override this method if they want
   * to associate a real action to this class.
   */
  public void actionPerformed(ActionEvent ev) {
    throw new UnsupportedOperationException();
  }
  
  /**
   * An action decorator for popup menu items.  
   */
  public static class PopupAction implements Action {
    private Action action;

    public PopupAction(Action action) {
      this.action = action;
    }

    public void actionPerformed(ActionEvent ev) {
      this.action.actionPerformed(ev);
    }

    public void addPropertyChangeListener(PropertyChangeListener listener) {
      this.action.addPropertyChangeListener(listener);
    }

    public Object getValue(String key) {
      // If it exists, return POPUP key value if NAME key is required 
      if (key.equals(NAME)) {
        Object value = this.action.getValue(POPUP);
        if (value != null) {
          return value;
        }
      // Avoid icons and mnemonics for Mac OS X in popup menus
      } else if (key.equals(SMALL_ICON)
                 || (System.getProperty("os.name").startsWith("Mac OS X")
                     && key.equals(MNEMONIC_KEY))) {
        return null;
      }
      return this.action.getValue(key);
    }

    public boolean isEnabled() {
      return this.action.isEnabled();
    }

    public void putValue(String key, Object value) {
      this.action.putValue(key, value);
    }

    public void removePropertyChangeListener(PropertyChangeListener listener) {
      this.action.removePropertyChangeListener(listener);
    }

    public void setEnabled(boolean enabled) {
      this.action.setEnabled(enabled);
    }
  }
}
