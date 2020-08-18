/*
 * ServerPreferences.java
 *
 * Sweet Home 3D, Copyright (c) 2020 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
package com.eteks.sweethome3d.io;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.net.URL;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.MissingResourceException;
import java.util.Properties;
import java.util.ResourceBundle;
import java.util.Set;

import org.json.JSONObject;

import com.eteks.sweethome3d.model.CatalogPieceOfFurniture;
import com.eteks.sweethome3d.model.CatalogTexture;
import com.eteks.sweethome3d.model.FurnitureCategory;
import com.eteks.sweethome3d.model.Library;
import com.eteks.sweethome3d.model.RecorderException;
import com.eteks.sweethome3d.model.TexturesCategory;

/**
 * Server user preferences.
 * @author Emmanuel Puybaret
 */
public class ServerUserPreferences extends DefaultUserPreferences {
  /**
   * Creates user preferences with catalogs read from the urls given in parameter.
   */
  public ServerUserPreferences(final URL [] furnitureCatalogUrls,
                               final URL    furnitureResourcesUrlBase,
                               final URL [] texturesCatalogUrls,
                               final URL    texturesResourcesUrlBase) throws IOException {
    // Initialize preferences without default catalogs
    super(false, null);

    setLanguage(Locale.ENGLISH.getLanguage());

    // Read furniture catalog
    new DefaultFurnitureCatalog(new URL [0]) {
      {
        Set<String> identifiedFurniture = new HashSet<>();
        for (final URL furnitureCatalogUrl : furnitureCatalogUrls) {
          ResourceBundle resource = new JSONResourceBundle(furnitureCatalogUrl);
          int index = 0;
          while (true) {
            // Ignore furniture with a key ignored# set at true
            String ignored;
            try {
              ignored = resource.getString("ignored#" + (++index));
            } catch (MissingResourceException ex) {
              // Not ignored
              ignored = null;
            }

            if (ignored == null || !Boolean.parseBoolean(ignored)) {
              CatalogPieceOfFurniture piece = ignored == null
                  ? readPieceOfFurniture(resource, index, furnitureCatalogUrl, furnitureResourcesUrlBase)
                  : null;
              if (piece == null) {
                // Read furniture until no data is found at current index
                break;
              } else {
                if (piece.getId() != null) {
                  // Take into account only furniture that have an ID
                  if (identifiedFurniture.contains(piece.getId())) {
                    continue;
                  } else {
                    identifiedFurniture.add(piece.getId());
                  }
                }
                FurnitureCategory pieceCategory = readFurnitureCategory(resource, index);
                getFurnitureCatalog().add(pieceCategory, piece);
              }
            }
          }
        }
      }
    };

    // Read textures catalog
    new DefaultTexturesCatalog(new URL [0]) {
      {
        Set<String> identifiedTextures = new HashSet<>();
        for (final URL texturesCatalogUrl : texturesCatalogUrls) {
          ResourceBundle resource = new JSONResourceBundle(texturesCatalogUrl);
          CatalogTexture texture;
          for (int i = 1; (texture = readTexture(resource, i, texturesCatalogUrl, texturesResourcesUrlBase)) != null; i++) {
            if (texture.getId() != null) {
              // Take into account only texture that have an ID
              if (identifiedTextures.contains(texture.getId())) {
                continue;
              } else {
                identifiedTextures.add(texture.getId());
              }
            }
            TexturesCategory textureCategory = readTexturesCategory(resource, i);
            getTexturesCatalog().add(textureCategory, texture);
          }
        }
      }
    };
  }

  /**
   * Does nothing.
   */
  @Override
  public void write() throws RecorderException {
  }

  /**
   * Throws an exception because server user preferences can't manage language libraries.
   */
  @Override
  public void addLanguageLibrary(String location) throws RecorderException {
    throw new UnsupportedOperationException();
  }

  /**
   * Throws an exception because server user preferences can't manage additional language libraries.
   */
  @Override
  public boolean languageLibraryExists(String location) throws RecorderException {
    throw new UnsupportedOperationException();
  }

  /**
   * Returns <code>true</code> if the furniture library at the given <code>location</code> exists.
   */
  @Override
  public boolean furnitureLibraryExists(String location) throws RecorderException {
    throw new UnsupportedOperationException();
  }

  /**
   * Throws an exception because server user preferences can't manage additional furniture libraries.
   */
  @Override
  public void addFurnitureLibrary(String location) throws RecorderException {
    throw new UnsupportedOperationException();
  }

  /**
   * Returns <code>true</code> if the textures library at the given <code>location</code> exists.
   */
  @Override
  public boolean texturesLibraryExists(String location) throws RecorderException {
    throw new UnsupportedOperationException();
  }

  /**
   * Throws an exception because server user preferences can't manage additional textures libraries.
   */
  @Override
  public void addTexturesLibrary(String location) throws RecorderException {
    throw new UnsupportedOperationException();
  }


  /**
   * Throws an exception because server user preferences don't manage additional libraries.
   */
  @Override
  public List<Library> getLibraries() {
    throw new UnsupportedOperationException();
  }


  /**
   * A resource bundle read from a JSON file.
   */
  private static class JSONResourceBundle extends ResourceBundle {
    private Properties properties;

    public JSONResourceBundle(URL url) throws IOException {
      // Read url
      StringWriter out = new StringWriter();
      try (BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream(), "UTF-8"))) {
        for (String s; (s = in.readLine()) != null; ) {
          out.write(s);
        }
      }
      this.properties = org.json.Property.toProperties(new JSONObject(out.toString()));
    }

    @Override
    protected Object handleGetObject(String key) {
      return this.properties.get(key);
    }

    @Override
    public Enumeration<String> getKeys() {
      return (Enumeration<String>)this.properties.propertyNames();
    }
  };
}
