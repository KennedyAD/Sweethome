/*
 * FurnitureLibraryFileRecorder.java 22 déc. 2009
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
package com.eteks.furniturelibraryeditor.io;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.StringWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.nio.charset.CharsetEncoder;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.MissingResourceException;
import java.util.ResourceBundle;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import com.eteks.furniturelibraryeditor.model.FurnitureLibrary;
import com.eteks.furniturelibraryeditor.model.FurnitureLibraryRecorder;
import com.eteks.furniturelibraryeditor.model.FurnitureLibraryUserPreferences;
import com.eteks.furniturelibraryeditor.model.FurnitureProperty;
import com.eteks.sweethome3d.io.Base64;
import com.eteks.sweethome3d.io.ContentDigestManager;
import com.eteks.sweethome3d.io.DefaultFurnitureCatalog;
import com.eteks.sweethome3d.model.BoxBounds;
import com.eteks.sweethome3d.model.CatalogPieceOfFurniture;
import com.eteks.sweethome3d.model.Content;
import com.eteks.sweethome3d.model.DoorOrWindow;
import com.eteks.sweethome3d.model.FurnitureCatalog;
import com.eteks.sweethome3d.model.FurnitureCategory;
import com.eteks.sweethome3d.model.InterruptedRecorderException;
import com.eteks.sweethome3d.model.Light;
import com.eteks.sweethome3d.model.LightSource;
import com.eteks.sweethome3d.model.RecorderException;
import com.eteks.sweethome3d.model.Sash;
import com.eteks.sweethome3d.model.ShelfUnit;
import com.eteks.sweethome3d.tools.ResourceURLContent;
import com.eteks.sweethome3d.tools.TemporaryURLContent;
import com.eteks.sweethome3d.tools.URLContent;

/**
 * Manages furniture library files.
 * @author Emmanuel Puybaret
 */
public class FurnitureLibraryFileRecorder implements FurnitureLibraryRecorder {
  private static final String       DEFAULT_FURNITURE_LIBRARY = "Furniture.jar";

  private static final String []    IGNORED_EXTENSIONS = {".gsm", ".max", ".lwo", ".dxf"};
  private static final Locale       DEFAULT_LOCALE = new Locale("");
  private static final NumberFormat DECIMAL_FORMAT = new DecimalFormat("0.#####", new DecimalFormatSymbols(Locale.US));

  private static final String ID          = "id";
  private static final String NAME        = "name";
  private static final String DESCRIPTION = "description";
  private static final String VERSION     = "version";
  private static final String LICENSE     = "license";
  private static final String PROVIDER    = "provider";

  /**
   * Reads a furniture library from the given file, after clearing the given library.
   */
  public void readFurnitureLibrary(final FurnitureLibrary furnitureLibrary,
                                   String furnitureLibraryLocation,
                                   FurnitureLibraryUserPreferences preferences) throws RecorderException {
    readFurnitureLibrary(furnitureLibrary, furnitureLibraryLocation, preferences, false);
  }

  /**
   * Merges a furniture library with one in the given file.
   */
  public void mergeFurnitureLibrary(FurnitureLibrary furnitureLibrary,
                                    String furnitureLibraryLocation,
                                    FurnitureLibraryUserPreferences preferences) throws RecorderException {
    readFurnitureLibrary(furnitureLibrary, furnitureLibraryLocation, preferences, true);
  }

  /**
   * Returns <code>true</code> if the given location matches the default furniture library of Sweet Home 3D.
   */
  public boolean isDefaultFurnitureLibrary(String furnitureLibraryLocation) {
    return DEFAULT_FURNITURE_LIBRARY.equals(new File(furnitureLibraryLocation).getName());
  }

  /**
   * Reads a furniture library from the given file.
   */
  private void readFurnitureLibrary(final FurnitureLibrary furnitureLibrary,
                                    String furnitureLibraryLocation,
                                    FurnitureLibraryUserPreferences preferences,
                                    final boolean mergeLibrary) throws RecorderException {
    try {
      // Retrieve furniture library with default reader and locale
      Locale defaultLocale = Locale.getDefault();
      Locale.setDefault(DEFAULT_LOCALE);
      File furnitureLibraryFile = File.createTempFile("furniture", ".sh3f");
      furnitureLibraryFile.deleteOnExit();
      if (isDefaultFurnitureLibrary(furnitureLibraryLocation)) {
        // Copy default furniture library entries, renaming entries with DefaultFurnitureCatalog as PluginFurnitureCatalog
        String defaultFurnitureCatalogPrefix = DefaultFurnitureCatalog.class.getName().replace('.', '/');
        URL furnitureLibraryUrl = new File(furnitureLibraryLocation).toURI().toURL();
        List<ZipEntry> zipEntries = getZipEntries(furnitureLibraryUrl);
        ZipOutputStream zipOut = null;
        try {
          zipOut = new ZipOutputStream(new FileOutputStream(furnitureLibraryFile));
          zipOut.setLevel(0);
          for (ZipEntry zipEntry : zipEntries) {
            String entryName = zipEntry.getName();
            if (entryName.startsWith(defaultFurnitureCatalogPrefix)
                && entryName.endsWith(".properties")) {
              entryName = entryName.replace(defaultFurnitureCatalogPrefix, DefaultFurnitureCatalog.PLUGIN_FURNITURE_CATALOG_FAMILY);
            }
            writeZipEntry(zipOut, new URLContent(new URL("jar:" + furnitureLibraryUrl + "!/" + zipEntry.getName())), entryName);
          }
        } catch (IOException ex) {
          throw new RecorderException("Can't copy library file " + furnitureLibraryLocation, ex);
        } finally {
          if (zipOut != null) {
            try {
              zipOut.close();
            } catch (IOException ex) {
              throw new RecorderException("Can't copy library file " + furnitureLibraryLocation, ex);
            }
          }
        }
      } else {
        copyFile(new File(furnitureLibraryLocation), furnitureLibraryFile);
      }
      URL furnitureLibraryUrl = furnitureLibraryFile.toURI().toURL();
      String furnitureResourcesLocalDirectory = preferences.getFurnitureResourcesLocalDirectory();
      URL furnitureResourcesUrlBase;
      if (preferences.isFurnitureLibraryOffline()) {
        furnitureResourcesUrlBase = null;
      } else {
        if (furnitureResourcesLocalDirectory == null) {
          furnitureResourcesLocalDirectory = new File(furnitureLibraryLocation).getParent();
        } else if (!new File(furnitureResourcesLocalDirectory).isAbsolute()) {
          furnitureResourcesLocalDirectory = new File(new File(furnitureLibraryLocation).getParent(), furnitureResourcesLocalDirectory).toString();
        }
        furnitureResourcesUrlBase = new File(furnitureResourcesLocalDirectory).toURI().toURL();
      }
      final List<CatalogPieceOfFurniture> furniture = new ArrayList<CatalogPieceOfFurniture>();
      new DefaultFurnitureCatalog(new URL [] {furnitureLibraryUrl}, furnitureResourcesUrlBase) {
          @Override
          protected CatalogPieceOfFurniture readPieceOfFurniture(ResourceBundle resource,
                                                                 int index,
                                                                 URL furnitureCatalogUrl,
                                                                 URL furnitureResourcesUrlBase) {
            if (index == 1 && !mergeLibrary) {
              furnitureLibrary.setId(getOptionalString(resource, ID));
              furnitureLibrary.setName(getOptionalString(resource, NAME));
              furnitureLibrary.setDescription(getOptionalString(resource, DESCRIPTION));
              furnitureLibrary.setVersion(getOptionalString(resource, VERSION));
              furnitureLibrary.setLicense(getOptionalString(resource, LICENSE));
              furnitureLibrary.setProvider(getOptionalString(resource, PROVIDER));
            }
            CatalogPieceOfFurniture piece = super.readPieceOfFurniture(resource, index, furnitureCatalogUrl, furnitureResourcesUrlBase);
            if (piece != null) {
              // Set furniture category through dummy catalog
              FurnitureCategory category = super.readFurnitureCategory(resource, index);
              new FurnitureCatalog().add(category, piece);
              furniture.add(piece);
            }
            return piece;
          }

          private String getOptionalString(ResourceBundle resource, String propertyKey) {
            try {
              return resource.getString(propertyKey);
            } catch (MissingResourceException ex) {
              return null;
            }
          }
        };

      // Search which locales are supported
      List<ZipEntry> zipEntries = getZipEntries(furnitureLibraryUrl);
      Set<Locale>    supportedLocales = new HashSet<Locale>();
      for (ZipEntry zipEntry : zipEntries) {
        String entryName = zipEntry.getName();
        if (entryName.startsWith(DefaultFurnitureCatalog.PLUGIN_FURNITURE_CATALOG_FAMILY)
            && entryName.endsWith(".properties")) {
          supportedLocales.add(getLocale(entryName));
        }
      }

      // Replace furniture by the one read
      if (!mergeLibrary) {
        for (CatalogPieceOfFurniture piece : furnitureLibrary.getFurniture()) {
          furnitureLibrary.deletePieceOfFurniture(piece);
        }
      }

      // Get furniture name, description, information, tags and category name in each supported locale
      for (Locale locale : supportedLocales) {
        if (!FurnitureLibrary.DEFAULT_LANGUAGE.equals(locale.toString())) {
          Locale.setDefault(locale);
          final String language = locale.toString();
          new DefaultFurnitureCatalog(new URL [] {furnitureLibraryUrl}, furnitureResourcesUrlBase) {
              @Override
              protected CatalogPieceOfFurniture readPieceOfFurniture(ResourceBundle resource,
                                                                     int index,
                                                                     URL furnitureCatalogUrl,
                                                                     URL furnitureResourcesUrlBase) {
                CatalogPieceOfFurniture piece = super.readPieceOfFurniture(resource, index, furnitureCatalogUrl, furnitureResourcesUrlBase);
                if (piece != null) {
                  FurnitureCategory category = super.readFurnitureCategory(resource, index);
                  CatalogPieceOfFurniture furnitureLibraryPiece = furniture.get(index - 1);
                  furnitureLibrary.setPieceOfFurnitureLocalizedData(furnitureLibraryPiece, language,
                      FurnitureLibrary.FURNITURE_NAME_PROPERTY, piece.getName());
                  furnitureLibrary.setPieceOfFurnitureLocalizedData(furnitureLibraryPiece, language,
                      FurnitureLibrary.FURNITURE_DESCRIPTION_PROPERTY, piece.getDescription());
                  furnitureLibrary.setPieceOfFurnitureLocalizedData(furnitureLibraryPiece, language,
                      FurnitureLibrary.FURNITURE_INFORMATION_PROPERTY, piece.getInformation());
                  furnitureLibrary.setPieceOfFurnitureLocalizedData(furnitureLibraryPiece, language,
                      FurnitureLibrary.FURNITURE_TAGS_PROPERTY, piece.getTags());
                  furnitureLibrary.setPieceOfFurnitureLocalizedData(furnitureLibraryPiece, language,
                      FurnitureLibrary.FURNITURE_CATEGORY_PROPERTY, category.getName());
                  furnitureLibrary.setPieceOfFurnitureLocalizedData(furnitureLibraryPiece, language,
                      FurnitureLibrary.FURNITURE_LICENSE_PROPERTY, piece.getLicense());
                  for (String propertyName : piece.getPropertyNames()) {
                    if (piece.isContentProperty(propertyName)) {
                      Content content = piece.getContentProperty(propertyName);
                      if (!content.equals(furnitureLibraryPiece.getContentProperty(propertyName))) {
                        furnitureLibrary.setPieceOfFurnitureLocalizedData(furnitureLibraryPiece, language, propertyName, content);
                      }
                    } else {
                      String propertyValue = piece.getProperty(propertyName);
                      if (!propertyValue.equals(furnitureLibraryPiece.getProperty(propertyName))) {
                        furnitureLibrary.setPieceOfFurnitureLocalizedData(furnitureLibraryPiece, language, propertyName, propertyValue);
                      }
                    }
                  }
                }
                return piece;
              }
            };
        }
      }

      Locale.setDefault(defaultLocale);
      for (CatalogPieceOfFurniture piece : furniture) {
        furnitureLibrary.addPieceOfFurniture(piece);
      }
    } catch (IOException ex) {
      throw new RecorderException("Invalid furniture library file " + furnitureLibraryLocation, ex);
    } catch (MissingResourceException ex) {
      throw new RecorderException("Invalid furniture library file " + furnitureLibraryLocation, ex);
    }
  }

  /**
   * Returns the locale of the given properties file.
   */
  private Locale getLocale(String fileName) {
    String localeString = fileName.substring(DefaultFurnitureCatalog.PLUGIN_FURNITURE_CATALOG_FAMILY.length(),
        fileName.lastIndexOf(".properties"));
    if (localeString.matches("_\\w{2}")) {
      return new Locale(localeString.substring(1));
    } else if (localeString.matches("_\\w{2}_\\w{2}")) {
      return new Locale(localeString.substring(1, 3), localeString.substring(4));
    } else {
      return DEFAULT_LOCALE;
    }
  }

  /**
   * Writes furniture library in the <code>furnitureLibraryName</code> file.
   */
  public void writeFurnitureLibrary(FurnitureLibrary furnitureLibrary,
                                    String furnitureLibraryName,
                                    FurnitureLibraryUserPreferences userPreferences) throws RecorderException {
    writeFurnitureLibrary(furnitureLibrary, furnitureLibraryName,
        userPreferences.getFurnitureProperties(),
        userPreferences.isFurnitureLibraryOffline(),
        userPreferences.isContentMatchingFurnitureName(),
        userPreferences.getFurnitureResourcesLocalDirectory(),
        userPreferences.getFurnitureResourcesRemoteURLBase());
  }

  /**
   * Writes furniture library .properties files in the <code>furnitureLibraryName</code> file.
   * @param furnitureProperties furniture properties defined by the user
   * @param offlineFurnitureLibrary if <code>offlineFurnitureLibrary</code> is <code>true</code> content
   *                       referenced by furniture is always embedded in the file
   * @param contentMatchingFurnitureName <code>true</code> if the furniture content saved with the library
   *                       should be named from the furniture name in the default language
   * @param furnitureResourcesLocalDirectory  directory where content referenced by furniture will be saved
   *                       if it isn't <code>null</code>
   * @param furnitureResourcesRemoteUrlBase   URL base used for content referenced by furniture in .properties file
   *                       if <code>furnitureResourcesLocalDirectory</code> isn't <code>null</code>
   */
  private void writeFurnitureLibrary(FurnitureLibrary furnitureLibrary,
                                     String furnitureLibraryLocation,
                                     FurnitureProperty [] furnitureProperties,
                                     boolean offlineFurnitureLibrary,
                                     boolean contentMatchingFurnitureName,
                                     String  furnitureResourcesLocalDirectory,
                                     String  furnitureResourcesRemoteUrlBase) throws RecorderException {
    File furnitureLibraryFile = new File(furnitureLibraryLocation);
    boolean jsonExport = furnitureLibraryLocation.endsWith(".json");
    URL furnitureResourcesRemoteAbsoluteUrlBase = null;
    String furnitureResourcesRemoteRelativeUrlBase = null;
    // Store existing entries in lower case to be able to compare their names ignoring case
    Set<String> existingEntryNamesLowerCase = new HashSet<String>();
    if (!offlineFurnitureLibrary || jsonExport) {
      if (furnitureResourcesLocalDirectory == null) {
        furnitureResourcesLocalDirectory = furnitureLibraryFile.getParent();
      } else if (!new File(furnitureResourcesLocalDirectory).isAbsolute()) {
        furnitureResourcesLocalDirectory = new File(furnitureLibraryFile.getParent(), furnitureResourcesLocalDirectory).toString();
      }
      if (furnitureResourcesRemoteUrlBase != null) {
        try {
          furnitureResourcesRemoteAbsoluteUrlBase = new URL(furnitureResourcesRemoteUrlBase);
        } catch (MalformedURLException ex) {
          // furnitureResourcesRemoteUrlBase is a relative URL
          int lastSlashIndex = furnitureResourcesRemoteUrlBase.lastIndexOf('/');
          if (lastSlashIndex != 1) {
            furnitureResourcesRemoteRelativeUrlBase = furnitureResourcesRemoteUrlBase.substring(0, lastSlashIndex + 1);
            furnitureResourcesLocalDirectory = new File(furnitureResourcesLocalDirectory, furnitureResourcesRemoteUrlBase).toString();
          } else {
            furnitureResourcesRemoteRelativeUrlBase = "";
          }
        }
      } else {
        furnitureResourcesRemoteRelativeUrlBase = "";
      }
    }

    OutputStream propertiesOutput = null;
    try {
      Map<Content, String> contentEntries = new HashMap<Content, String>();
      ZipOutputStream zipOut = null;
      File tmpFile = null;
      if (jsonExport) {
        propertiesOutput = new FileOutputStream(furnitureLibraryLocation);
      } else {
        tmpFile = File.createTempFile("temp", ".sh3f");
        // Create a zip output on file
        zipOut = new ZipOutputStream(new FileOutputStream(tmpFile));
        // Write furniture description file in first entry
        zipOut.putNextEntry(new ZipEntry(DefaultFurnitureCatalog.PLUGIN_FURNITURE_CATALOG_FAMILY + ".properties"));
        propertiesOutput = zipOut;
      }
      writeFurnitureLibraryProperties(propertiesOutput, furnitureLibrary, jsonExport,
          furnitureProperties, offlineFurnitureLibrary, contentMatchingFurnitureName,
          furnitureResourcesRemoteAbsoluteUrlBase, furnitureResourcesRemoteRelativeUrlBase,
          !offlineFurnitureLibrary || jsonExport, contentEntries, existingEntryNamesLowerCase);
      if (jsonExport) {
        propertiesOutput.close();
      } else {
        zipOut.closeEntry();
      }

      // Write supported languages description files
      for (String language : furnitureLibrary.getSupportedLanguages()) {
        if (!FurnitureLibrary.DEFAULT_LANGUAGE.equals(language)) {
          if (jsonExport) {
            propertiesOutput = new FileOutputStream(furnitureLibraryLocation.replace(".json", "_" + language + ".json"));
          } else {
            zipOut.putNextEntry(new ZipEntry(DefaultFurnitureCatalog.PLUGIN_FURNITURE_CATALOG_FAMILY + "_" + language + ".properties"));
          }
          writeFurnitureLibraryLocalizedProperties(propertiesOutput, furnitureLibrary, language,
              jsonExport, furnitureProperties, offlineFurnitureLibrary, contentMatchingFurnitureName,
              furnitureResourcesRemoteAbsoluteUrlBase, furnitureResourcesRemoteRelativeUrlBase,
              contentEntries, existingEntryNamesLowerCase);
          if (jsonExport) {
            propertiesOutput.close();
          } else {
            zipOut.closeEntry();
          }
        }
      }

      // Write Content objects in files
      writeContents(zipOut, !offlineFurnitureLibrary || jsonExport, furnitureResourcesLocalDirectory, contentEntries);

      if (zipOut != null) {
        // Finish zip writing
        zipOut.finish();
        zipOut.close();
        zipOut = null;

        copyFile(tmpFile, furnitureLibraryFile);
        tmpFile.delete();
      }
    } catch (IOException ex) {
      throw new RecorderException("Can't save furniture library file " + furnitureLibraryLocation, ex);
    } finally {
      if (propertiesOutput != null) {
        try {
          propertiesOutput.close();
        } catch (IOException ex) {
          throw new RecorderException("Can't close furniture library file " + furnitureLibraryLocation, ex);
        }
      }
    }
  }

  /**
   * Writes in <code>output</code> the given furniture library
   * with properties as defined as in <code>DefaultFurnitureCatalog</code>.
   */
  private void writeFurnitureLibraryProperties(OutputStream output,
                                               FurnitureLibrary furnitureLibrary,
                                               boolean jsonExport,
                                               FurnitureProperty [] furnitureProperties,
                                               boolean offlineFurnitureLibrary,
                                               boolean contentMatchingFurnitureName,
                                               URL furnitureResourcesRemoteAbsoluteUrlBase,
                                               String furnitureResourcesRemoteRelativeUrlBase,
                                               boolean contentDigest,
                                               Map<Content, String> contentEntries,
                                               Set<String> existingEntryNamesLowerCase) throws IOException {
    boolean keepURLContentUnchanged = !offlineFurnitureLibrary
        && furnitureResourcesRemoteAbsoluteUrlBase == null
        && furnitureResourcesRemoteRelativeUrlBase == null;
    DateFormat creationDateFormat = new SimpleDateFormat("yyyy-MM-dd");
    StringWriter jsonWriter = null;
    BufferedWriter writer;
    if (jsonExport) {
      // Write first in a string buffer to remove the last comma
      jsonWriter = new StringWriter();
      writer = new BufferedWriter(jsonWriter);
      writer.write("{");
    } else {
      writer = new BufferedWriter(new OutputStreamWriter(output, "ISO-8859-1"));
      final String CATALOG_FILE_HEADER = "#\n# "
          + DefaultFurnitureCatalog.PLUGIN_FURNITURE_CATALOG_FAMILY + ".properties %tc\n"
          + "# Generated by Furniture Library Editor\n#\n";
      writer.write(String.format(CATALOG_FILE_HEADER, new Date()));
    }
    writer.newLine();
    writeProperty(writer, jsonExport, ID, furnitureLibrary.getId());
    writeProperty(writer, jsonExport, NAME, furnitureLibrary.getName());
    writeProperty(writer, jsonExport, DESCRIPTION, furnitureLibrary.getDescription());
    writeProperty(writer, jsonExport, VERSION, furnitureLibrary.getVersion());
    writeProperty(writer, jsonExport, LICENSE, furnitureLibrary.getLicense());
    writeProperty(writer, jsonExport, PROVIDER, furnitureLibrary.getProvider());

    int i = 1;
    for (CatalogPieceOfFurniture piece : furnitureLibrary.getFurniture()) {
      writer.newLine();
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.ID, i, piece.getId());
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.NAME, i, piece.getName());
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DESCRIPTION, i, piece.getDescription());
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.INFORMATION, i, piece.getInformation());
      String tags = Arrays.toString(piece.getTags());
      if (tags.length() > 2) {
        // Write comma separated tags without [ and ] characters
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.TAGS, i, tags.substring(1, tags.length() - 1));
      }
      Long creationDate = piece.getCreationDate();
      if (creationDate != null) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.CREATION_DATE,
            i, creationDateFormat.format(new Date(piece.getCreationDate())));
      }
      if (piece.getGrade() != null) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.GRADE, i, piece.getGrade());
      }
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.CATEGORY, i, piece.getCategory().getName());
      String contentBaseName = getContentBaseName(piece, contentMatchingFurnitureName);
      Content pieceIcon = piece.getIcon();
      String iconContentEntryName = contentEntries.get(pieceIcon);
      // If piece icon content not referenced yet among saved content
      if (iconContentEntryName == null) {
        iconContentEntryName = getContentEntry(pieceIcon, contentBaseName + ".png",
            keepURLContentUnchanged, existingEntryNamesLowerCase);
        if (iconContentEntryName != null) {
          contentEntries.put(pieceIcon, iconContentEntryName);
        }
      }
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.ICON,
          i, getContentProperty(pieceIcon, iconContentEntryName, jsonExport,
              offlineFurnitureLibrary, furnitureResourcesRemoteAbsoluteUrlBase, furnitureResourcesRemoteRelativeUrlBase));
      if (contentDigest) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.ICON_DIGEST,
            i, Base64.encodeBytes(ContentDigestManager.getInstance().getContentDigest(pieceIcon)));
      }
      Content piecePlanIcon = piece.getPlanIcon();
      if (piecePlanIcon != null) {
        String planIconContentEntryName = contentEntries.get(piecePlanIcon);
        // If plan icon content not referenced yet among saved content
        if (planIconContentEntryName == null) {
          planIconContentEntryName = getContentEntry(piecePlanIcon, contentBaseName + "PlanIcon.png",
              keepURLContentUnchanged, existingEntryNamesLowerCase);
          if (planIconContentEntryName != null) {
            contentEntries.put(piecePlanIcon, planIconContentEntryName);
          }
        }
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.PLAN_ICON,
            i, getContentProperty(piecePlanIcon, planIconContentEntryName, jsonExport,
                offlineFurnitureLibrary, furnitureResourcesRemoteAbsoluteUrlBase, furnitureResourcesRemoteRelativeUrlBase));
        if (contentDigest) {
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.PLAN_ICON_DIGEST,
              i, Base64.encodeBytes(ContentDigestManager.getInstance().getContentDigest(piecePlanIcon)));
        }
      }
      Content pieceModel = piece.getModel();
      boolean multipart = pieceModel instanceof ResourceURLContent
              && ((ResourceURLContent)pieceModel).isMultiPartResource()
          || !(pieceModel instanceof ResourceURLContent)
              && pieceModel instanceof URLContent
              && ((URLContent)pieceModel).isJAREntry();
      String modelContentEntryName = contentEntries.get(pieceModel);
      // If piece model content not referenced yet among saved content
      if (modelContentEntryName == null) {
        if (jsonExport // Handle all exported contents in ZIP files even if not multipart
            || multipart) {
          String jarEntryName = ((URLContent)pieceModel).getJAREntryName().replace("%20", " ");
          modelContentEntryName = getContentEntry(pieceModel,
              pieceModel instanceof TemporaryURLContent
                  ? contentBaseName + "/" + jarEntryName
                  : contentBaseName + "/" + jarEntryName.substring(jarEntryName.lastIndexOf('/') + 1),
              keepURLContentUnchanged, existingEntryNamesLowerCase);
        } else {
          modelContentEntryName = getContentEntry(pieceModel,
              contentBaseName + ".obj", keepURLContentUnchanged, existingEntryNamesLowerCase);
        }
        if (modelContentEntryName != null) {
          contentEntries.put(pieceModel, modelContentEntryName);
        }
      }
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.MODEL,
          i, getContentProperty(pieceModel, modelContentEntryName, jsonExport,
              offlineFurnitureLibrary, furnitureResourcesRemoteAbsoluteUrlBase, furnitureResourcesRemoteRelativeUrlBase));
      if (contentDigest) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.MODEL_DIGEST,
            i, Base64.encodeBytes(ContentDigestManager.getInstance().getContentDigest(pieceModel)));
      }
      if (multipart) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.MULTI_PART_MODEL, i, "true");
      }
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.WIDTH, i, piece.getWidth());
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DEPTH, i, piece.getDepth());
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.HEIGHT, i, piece.getHeight());
      if (Math.abs(piece.getDropOnTopElevation() - 1f) > 1E-6f) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DROP_ON_TOP_ELEVATION,
            i, piece.getDropOnTopElevation() * piece.getHeight());
      }
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.MOVABLE, i, piece.isMovable());
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW, i, piece.isDoorOrWindow());
      if (piece.isDoorOrWindow()) {
        // Write properties specific to doors and windows
        DoorOrWindow doorOrWindow = (DoorOrWindow)piece;
        if (doorOrWindow.getCutOutShape() != null) {
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_CUT_OUT_SHAPE,
              i, doorOrWindow.getCutOutShape());
        }
        if (doorOrWindow.getWallThickness() != 1) {
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_WALL_THICKNESS,
              i, doorOrWindow.getWallThickness() * doorOrWindow.getDepth());
        }
        if (doorOrWindow.getWallDistance() != 0) {
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_WALL_DISTANCE,
              i, doorOrWindow.getWallDistance() * doorOrWindow.getDepth());
        }
        if (!doorOrWindow.isWallCutOutOnBothSides()) {
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_WALL_CUT_OUT_ON_BOTH_SIDES,
              i, doorOrWindow.isWallCutOutOnBothSides());
        }
        if (!doorOrWindow.isWidthDepthDeformable()) {
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_WIDTH_DEPTH_DEFORMABLE,
              i, doorOrWindow.isWidthDepthDeformable());
        }
        Sash [] sashes = doorOrWindow.getSashes();
        if (sashes.length > 0) {
          String sashXAxis = "";
          String sashYAxis = "";
          String sashWidth = "";
          String sashStartAngle = "";
          String sashEndAngle = "";
          for (int sashIndex = 0; sashIndex < sashes.length; sashIndex++) {
            if (sashIndex > 0) {
              sashXAxis += " ";
              sashYAxis += " ";
              sashWidth += " ";
              sashStartAngle += " ";
              sashEndAngle += " ";
            }
            sashXAxis += DECIMAL_FORMAT.format(sashes [sashIndex].getXAxis() * doorOrWindow.getWidth());
            sashYAxis += DECIMAL_FORMAT.format(sashes [sashIndex].getYAxis() * doorOrWindow.getDepth());
            sashWidth += DECIMAL_FORMAT.format(sashes [sashIndex].getWidth() * doorOrWindow.getWidth());
            sashStartAngle += Math.round(Math.toDegrees(sashes [sashIndex].getStartAngle()) * 100) / 100;
            sashEndAngle += Math.round(Math.toDegrees(sashes [sashIndex].getEndAngle()) * 100) / 100;
          }
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_X_AXIS, i, sashXAxis);
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_Y_AXIS, i, sashYAxis);
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_WIDTH, i, sashWidth);
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_START_ANGLE, i, sashStartAngle);
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DOOR_OR_WINDOW_SASH_END_ANGLE, i, sashEndAngle);
        }
      }
      if (piece instanceof Light) {
        // Write properties specific to lights
        Light light = (Light)piece;
        LightSource [] lightSources = light.getLightSources();
        if (lightSources.length > 0) {
          String lightSourceX = "";
          String lightSourceY = "";
          String lightSourceZ = "";
          String lightSourceColor = "";
          String lightSourceDiameter = null;
          for (int lightIndex = 0; lightIndex < lightSources.length; lightIndex++) {
            if (lightIndex > 0) {
              lightSourceX += " ";
              lightSourceY += " ";
              lightSourceZ += " ";
              lightSourceColor += " ";
              if (lightSourceDiameter != null) {
                lightSourceDiameter += " ";
              }
            }
            lightSourceX += DECIMAL_FORMAT.format(lightSources [lightIndex].getX() * light.getWidth());
            lightSourceY += DECIMAL_FORMAT.format(lightSources [lightIndex].getY() * light.getDepth());
            lightSourceZ += DECIMAL_FORMAT.format(lightSources [lightIndex].getZ() * light.getHeight());
            lightSourceColor += "#" + String.format("%06X", lightSources [lightIndex].getColor());
            if (lightSources [lightIndex].getDiameter() != null) {
              if (lightSourceDiameter == null) {
                lightSourceDiameter = "";
              }
              lightSourceDiameter += DECIMAL_FORMAT.format(lightSources [lightIndex].getDiameter() * light.getWidth());
            }
          }
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_X, i, lightSourceX);
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_Y, i, lightSourceY);
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_Z, i, lightSourceZ);
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_COLOR, i, lightSourceColor);
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_DIAMETER, i, lightSourceDiameter);
        }
        String [] lightSourceMaterialNames = light.getLightSourceMaterialNames();
        if (lightSourceMaterialNames.length > 0) {
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.LIGHT_SOURCE_MATERIAL_NAME, i, lightSourceMaterialNames);
        }
      }
      if (piece.getElevation() > 0) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.ELEVATION, i, piece.getElevation());
      }
      if (piece instanceof ShelfUnit) {
        // Write properties specific to lights
        ShelfUnit shelfUnit = (ShelfUnit)piece;
        float [] elevations = shelfUnit.getShelfElevations();
        if (elevations.length > 0) {
          String elevationsProperty = "";
          for (int j = 0; j < elevations.length; j++) {
            if (j > 0) {
              elevationsProperty += " ";
            }
            elevationsProperty += DECIMAL_FORMAT.format(elevations [j] * shelfUnit.getHeight());
          }
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.SHELF_ELEVATIONS, i, elevationsProperty);
        }

        BoxBounds [] shelfBoxes = shelfUnit.getShelfBoxes();
        if (shelfBoxes.length > 0) {
          String shelves = "";
          for (int shelfIndex = 0; shelfIndex < shelfBoxes.length; shelfIndex++) {
            if (shelfIndex > 0) {
              shelves += "   ";
            }
            shelves += DECIMAL_FORMAT.format(shelfBoxes [shelfIndex].getXLower() * shelfUnit.getWidth())
                + " " + DECIMAL_FORMAT.format(shelfBoxes [shelfIndex].getYLower() * shelfUnit.getDepth())
                + " " + DECIMAL_FORMAT.format(shelfBoxes [shelfIndex].getZLower() * shelfUnit.getHeight())
                + " " + DECIMAL_FORMAT.format(shelfBoxes [shelfIndex].getXUpper() * shelfUnit.getWidth())
                + " " + DECIMAL_FORMAT.format(shelfBoxes [shelfIndex].getYUpper() * shelfUnit.getDepth())
                + " " + DECIMAL_FORMAT.format(shelfBoxes [shelfIndex].getZUpper() * shelfUnit.getHeight());
          }
          writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.SHELF_BOXES, i, shelves);
        }
      }
      float [][] modelRotation = piece.getModelRotation();
      String modelRotationString =
          floatToString(modelRotation[0][0]) + " " + floatToString(modelRotation[0][1]) + " " + floatToString(modelRotation[0][2]) + " "
        + floatToString(modelRotation[1][0]) + " " + floatToString(modelRotation[1][1]) + " " + floatToString(modelRotation[1][2]) + " "
        + floatToString(modelRotation[2][0]) + " " + floatToString(modelRotation[2][1]) + " " + floatToString(modelRotation[2][2]);
      if (!"1 0 0 0 1 0 0 0 1".equals(modelRotationString)) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.MODEL_ROTATION, i, modelRotationString);
      }
      if (piece.getModelFlags() != 0) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.MODEL_FLAGS, i, piece.getModelFlags());
      }
      if (piece.getStaircaseCutOutShape() != null) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.STAIRCASE_CUT_OUT_SHAPE, i, piece.getStaircaseCutOutShape());
      }
      if (piece.getModelSize() != null) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.MODEL_SIZE, i, piece.getModelSize());
      }
      if (!piece.isResizable()) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.RESIZABLE, i, piece.isResizable());
      }
      if (!piece.isDeformable()) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.DEFORMABLE, i, piece.isDeformable());
      }
      if (!piece.isTexturable()) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.TEXTURABLE, i, piece.isTexturable());
      }
      if (!piece.isHorizontallyRotatable()) {
        writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.HORIZONTALLY_ROTATABLE, i, piece.isHorizontallyRotatable());
      }
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.PRICE, i, piece.getPrice());
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.VALUE_ADDED_TAX_PERCENTAGE, i, piece.getValueAddedTaxPercentage());
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.CURRENCY, i, piece.getCurrency());
      List<String> propertyNames = new ArrayList<String>(piece.getPropertyNames());
      Collections.sort(propertyNames);
      for (String propertyName : propertyNames) {
        if (piece.isContentProperty(propertyName)) {
          Content content = piece.getContentProperty(propertyName);
          String contentEntryName = contentEntries.get(content);
          if (contentEntryName == null) {
            contentEntryName = getContentEntry(content,
                contentBaseName + Character.toUpperCase(propertyName.charAt(0)) + propertyName.substring(1, propertyName.length()) + ".png",
                keepURLContentUnchanged, existingEntryNamesLowerCase);
            if (contentEntryName != null) {
              contentEntries.put(content, contentEntryName);
            }
          }
          writeProperty(writer, jsonExport,
              propertyName + "#" + i + ":" + FurnitureProperty.Type.CONTENT.name(), getContentProperty(content, contentEntryName, jsonExport,
                  offlineFurnitureLibrary, furnitureResourcesRemoteAbsoluteUrlBase, furnitureResourcesRemoteRelativeUrlBase));
        } else {
          String propertyValue = piece.getProperty(propertyName);
          if (propertyValue != null) {
            FurnitureProperty.Type propertyType = null;
            for (FurnitureProperty property : furnitureProperties) {
              if (propertyName.equals(property.getName())) {
                propertyType = property.getType();
              }
            }
            String propertyTypeInfo = Boolean.getBoolean("com.eteks.furniturelibraryeditor.writePropertyType")
                && propertyType != null
                && propertyType != FurnitureProperty.Type.ANY  ? ":" + propertyType.name()  : "";
            writeProperty(writer, jsonExport, propertyName + "#" + i + propertyTypeInfo, propertyValue);
          }
        }
      }
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.CREATOR, i, piece.getCreator());
      writeProperty(writer, jsonExport, DefaultFurnitureCatalog.PropertyKey.LICENSE, i, piece.getLicense());
      i++;
    }

    writer.flush();
    if (jsonExport) {
      // Remove last comma
      String jsonString = jsonWriter.toString();
      int lastCommaIndex = jsonString.lastIndexOf(',');
      if (lastCommaIndex > 0) {
        jsonString = jsonString.substring(0, lastCommaIndex);
      }
      output.write((jsonString + "\n}\n").getBytes("UTF-8"));
    }
  }

  /**
   * Returns the string value of the given float, except for -1.0, 1.0 or 0.0 where -1, 1 and 0 is returned.
   */
  private String floatToString(float f) {
    if (Math.abs(f) < 1E-6) {
      return "0";
    } else if (Math.abs(f - 1f) < 1E-6) {
      return "1";
    } else if (Math.abs(f + 1f) < 1E-6) {
      return "-1";
    } else {
      return String.valueOf(f);
    }
  }

  /**
   * Writes in <code>output</code> the given furniture library
   * with properties as defined as in <code>DefaultFurnitureCatalog</code>.
   */
  private void writeFurnitureLibraryLocalizedProperties(OutputStream output,
                                                        FurnitureLibrary furnitureLibrary,
                                                        String language,
                                                        boolean jsonExport,
                                                        FurnitureProperty [] furnitureProperties,
                                                        boolean offlineFurnitureLibrary,
                                                        boolean contentMatchingFurnitureName,
                                                        URL furnitureResourcesRemoteAbsoluteUrlBase,
                                                        String furnitureResourcesRemoteRelativeUrlBase,
                                                        Map<Content, String> contentEntries,
                                                        Set<String> existingEntryNamesLowerCase) throws IOException {
    boolean keepURLContentUnchanged = !offlineFurnitureLibrary
        && furnitureResourcesRemoteAbsoluteUrlBase == null
        && furnitureResourcesRemoteRelativeUrlBase == null;
    StringWriter jsonWriter = null;
    BufferedWriter writer;
    if (jsonExport) {
      // Write first in a string buffer to remove the last comma
      jsonWriter = new StringWriter();
      writer = new BufferedWriter(jsonWriter);
      writer.write("{");
    } else {
      writer = new BufferedWriter(new OutputStreamWriter(output, "ISO-8859-1"));
      final String CATALOG_FILE_HEADER = "#\n# "
          + DefaultFurnitureCatalog.PLUGIN_FURNITURE_CATALOG_FAMILY + "_" + language + ".properties %tc\n"
          + "# Generated by Furniture Library Editor\n#\n";
      writer.write(String.format(CATALOG_FILE_HEADER, new Date()));
    }
    Map<String, DefaultFurnitureCatalog.PropertyKey> localizedProperties = new LinkedHashMap<String, DefaultFurnitureCatalog.PropertyKey>();
    localizedProperties.put(FurnitureLibrary.FURNITURE_NAME_PROPERTY, DefaultFurnitureCatalog.PropertyKey.NAME);
    localizedProperties.put(FurnitureLibrary.FURNITURE_DESCRIPTION_PROPERTY, DefaultFurnitureCatalog.PropertyKey.DESCRIPTION);
    localizedProperties.put(FurnitureLibrary.FURNITURE_INFORMATION_PROPERTY, DefaultFurnitureCatalog.PropertyKey.INFORMATION);
    localizedProperties.put(FurnitureLibrary.FURNITURE_TAGS_PROPERTY, DefaultFurnitureCatalog.PropertyKey.TAGS);
    localizedProperties.put(FurnitureLibrary.FURNITURE_CATEGORY_PROPERTY, DefaultFurnitureCatalog.PropertyKey.CATEGORY);
    localizedProperties.put(FurnitureLibrary.FURNITURE_LICENSE_PROPERTY, DefaultFurnitureCatalog.PropertyKey.LICENSE);

    int i = 1;
    for (CatalogPieceOfFurniture piece : furnitureLibrary.getFurniture()) {
      writer.newLine();
      for (Map.Entry<String, DefaultFurnitureCatalog.PropertyKey> localizedPropertyEntry : localizedProperties.entrySet()) {
        Object pieceData = furnitureLibrary.getPieceOfFurnitureLocalizedData(
            piece, language, localizedPropertyEntry.getKey());
        if (pieceData != null) {
          writeProperty(writer, jsonExport, localizedPropertyEntry.getValue(), i, pieceData);
        }
      }

      List<String> propertyNames = new ArrayList<String>(piece.getPropertyNames());
      Collections.sort(propertyNames);
      for (String propertyName : propertyNames) {
        Object pieceData = furnitureLibrary.getPieceOfFurnitureLocalizedData(piece, language, propertyName);
        if (pieceData != null) {
          if (piece.isContentProperty(propertyName)) {
            Content content = (Content)pieceData;
            String contentEntryName = contentEntries.get(content);
            if (contentEntryName == null) {
              String contentBaseName = getContentBaseName(piece, contentMatchingFurnitureName);
              contentEntryName = getContentEntry(content,
                  contentBaseName + Character.toUpperCase(propertyName.charAt(0)) + propertyName.substring(1, propertyName.length()) + "_" + language + ".png",
                  keepURLContentUnchanged, existingEntryNamesLowerCase);
              if (contentEntryName != null) {
                contentEntries.put(content, contentEntryName);
              }
            }
            writeProperty(writer, jsonExport,
                propertyName + "#" + i + ":" + FurnitureProperty.Type.CONTENT.name(), getContentProperty(content, contentEntryName, jsonExport,
                    offlineFurnitureLibrary, furnitureResourcesRemoteAbsoluteUrlBase, furnitureResourcesRemoteRelativeUrlBase));
          } else {
            String propertyValue = (String)pieceData;
            FurnitureProperty.Type propertyType = null;
            for (FurnitureProperty property : furnitureProperties) {
              if (propertyName.equals(property.getName())) {
                propertyType = property.getType();
              }
            }
            String propertyTypeInfo = Boolean.getBoolean("com.eteks.furniturelibraryeditor.writePropertyType")
                && propertyType != null
                && propertyType != FurnitureProperty.Type.ANY  ? ":" + propertyType.name()  : "";
            writeProperty(writer, jsonExport, propertyName + "#" + i + propertyTypeInfo, propertyValue);
          }
        }
      }
      i++;
    }

    writer.flush();
    if (jsonExport) {
      // Remove last comma
      String jsonString = jsonWriter.toString();
      int lastCommaIndex = jsonString.lastIndexOf(',');
      if (lastCommaIndex > 0) {
        jsonString = jsonString.substring(0, lastCommaIndex);
      }
      output.write((jsonString + "\n}\n").getBytes("UTF-8"));
    }
  }

  /**
   * Returns the base name for piece contents.
   */
  private String getContentBaseName(CatalogPieceOfFurniture piece, boolean contentMatchingFurnitureName) {
    Content pieceModel = piece.getModel();
    String contentBaseName;
    if (contentMatchingFurnitureName
        || !(pieceModel instanceof URLContent)
        || ((URLContent)pieceModel).getURL().getFile().toString().endsWith("model.obj")) {
      contentBaseName = piece.getName().replace('/', '-');
    } else {
      String file = ((URLContent)pieceModel).getURL().getFile();
      if (file.lastIndexOf('/') != -1) {
        file = file.substring(file.lastIndexOf('/') + 1);
      }
      if (file.lastIndexOf('.') != -1) {
        file = file.substring(0, file.lastIndexOf('.'));
      }
      contentBaseName = file;
    }
    // Replace # and % symbols in file names to avoid wrongly encoded URLs
    return contentBaseName.replace('%', '_').replace('#', '_');
  }

  /**
   * Returns the entry name of a <code>content</code>.
   */
  private String getContentEntry(Content content,
                                 String entryName,
                                 boolean keepURLContentUnchanged,
                                 Set<String> existingEntryNamesLowerCase) throws IOException {
    if (content instanceof TemporaryURLContent
        || content instanceof ResourceURLContent) {
      int slashIndex = entryName.indexOf('/');
      if (slashIndex == -1) {
        if (existingEntryNamesLowerCase.contains(entryName.toLowerCase())) {
          // Search an unexisting entry name
          int i = 2;
          String defaultEntryName = entryName;
          do {
            int dotIndex = defaultEntryName.lastIndexOf('.');
            entryName = defaultEntryName.substring(0, dotIndex)
                + i++ + defaultEntryName.substring(dotIndex);
          } while (existingEntryNamesLowerCase.contains(entryName.toLowerCase()));
        }
      } else {
        String entryDirectory = entryName.substring(0, slashIndex + 1);
        int i = 2;
        while (true) {
          boolean entryDirectoryExists = false;
          String entryDirectoryLowerCase = entryDirectory.toLowerCase();
          // Search an unexisting entry directory
          for (String existingEntryNameLowerCase : existingEntryNamesLowerCase) {
            // If existingEntryName starts with entryDirectory ignoring case
            if (existingEntryNameLowerCase.startsWith(entryDirectoryLowerCase)) {
              entryDirectoryExists = true;
              break;
            }
          }
          if (entryDirectoryExists) {
            entryDirectory = entryName.substring(0, slashIndex) + i++ + "/";
          } else {
            entryName = entryDirectory + entryName.substring(slashIndex + 1);
            break;
          }
        }
      }
      existingEntryNamesLowerCase.add(entryName.toLowerCase());
      return entryName;
    } else if (content instanceof URLContent) {
      if (keepURLContentUnchanged) {
        // Won't save content
        return null;
      } else {
        URLContent urlContent = (URLContent)content;
        if (urlContent.isJAREntry()) {
          String file = urlContent.getJAREntryURL().getFile();
          file = file.substring(file.lastIndexOf('/') + 1);
          int zipIndex = file.lastIndexOf(".zip");
          if (zipIndex == -1) {
            return null;
          } else {
            file = file.substring(0, zipIndex);
            entryName = file + "/" + urlContent.getJAREntryName();
          }
        } else {
          String file = urlContent.getURL().getFile();
          entryName = file.substring(file.lastIndexOf('/') + 1);
        }
        existingEntryNamesLowerCase.add(entryName.toLowerCase());
        return entryName;
      }
    } else {
      throw new IOException("Unexpected content class: " + content.getClass().getName());
    }
  }

  /**
   * Returns the property value saved for a resource <code>content</code>.
   */
  private String getContentProperty(Content content,
                                    String  entryName,
                                    boolean jsonExport,
                                    boolean offlineFurnitureLibrary,
                                    URL furnitureResourcesRemoteAbsoluteUrlBase,
                                    String furnitureResourcesRemoteRelativeUrlBase) throws IOException {
    if (!jsonExport
        && (offlineFurnitureLibrary
            || (furnitureResourcesRemoteAbsoluteUrlBase == null
                && furnitureResourcesRemoteRelativeUrlBase == null))) {
      return "/" + entryName;
    } else if (content instanceof TemporaryURLContent
               || content instanceof ResourceURLContent
               || furnitureResourcesRemoteAbsoluteUrlBase != null
               || furnitureResourcesRemoteRelativeUrlBase != null
               || jsonExport) {
      int slashIndex = entryName.indexOf('/');
      if (slashIndex == -1) {
        if (furnitureResourcesRemoteAbsoluteUrlBase != null) {
          return new URL(furnitureResourcesRemoteAbsoluteUrlBase, entryName).toString();
        } else {
          return furnitureResourcesRemoteRelativeUrlBase + entryName;
        }
      } else {
        String encodedEntry = URLEncoder.encode(entryName.substring(slashIndex + 1), "UTF-8").replace("+", "%20").replace("%2F", "/");
        if (furnitureResourcesRemoteAbsoluteUrlBase != null) {
          return "jar:" + new URL(furnitureResourcesRemoteAbsoluteUrlBase, entryName.substring(0, slashIndex) + ".zip")
              + "!/" + encodedEntry;
        } else {
          return furnitureResourcesRemoteRelativeUrlBase + entryName.substring(0, slashIndex) + ".zip"
              + "!/" + encodedEntry;
        }
      }
    } else {
      return ((URLContent)content).getURL().toString();
    }
  }

  /**
   * Writes the (<code>key</code>, <code>value</code>) of a property
   * in <code>writer</code>.
   */
  private void writeProperty(BufferedWriter writer, boolean jsonExport,
                             DefaultFurnitureCatalog.PropertyKey key, int index,
                             Object value) throws IOException {
    writeProperty(writer, jsonExport, key.getKey(index), value);
  }

  /**
   * Writes the (<code>key</code>, <code>value</code>) of a property
   * in <code>writer</code>, if the <code>value</code> isn't <code>null</code>.
   */
  private void writeProperty(BufferedWriter writer, boolean jsonExport,
                             String key, Object value) throws IOException {
    if (value != null) {
      // Write key, escaping the characters \ " : = and space
      writer.write(jsonExport
           ? " \"" + key.replace("\\", "\\\\").replace("\"", "\\\"")
           : key.replace(":", "\\:").replace("=", "\\=").replace(" ", "\\ "));
      writer.write(jsonExport ? "\": \"" : "=");
      String s;
      if (value.getClass().isArray()) {
        s = Arrays.toString((Object [])value);
        s = s.substring(1, s.length() - 1); // Remove brackets
      } else if (value instanceof Float) {
        s = DECIMAL_FORMAT.format(value);
      } else {
        s = value.toString();
      }
      CharsetEncoder encoder = Charset.forName(jsonExport ? "UTF-8" : "ISO-8859-1").newEncoder();
      for (int i = 0; i < s.length(); i++) {
        char c = s.charAt(i);
        switch (c) {
          case '\\':
            writer.write('\\');
            writer.write('\\');
            break;
          case '\t':
            writer.write('\\');
            writer.write('t');
            break;
          case '"':
            if (jsonExport) {
              writer.write('\\');
              writer.write('"');
              break;
            }
          default:
            if (encoder.canEncode(c)) {
              writer.write(c);
            } else {
              writer.write('\\');
              writer.write('u');
              writer.write(Integer.toHexString((c >> 12) & 0xF));
              writer.write(Integer.toHexString((c >> 8) & 0xF));
              writer.write(Integer.toHexString((c >> 4) & 0xF));
              writer.write(Integer.toHexString(c & 0xF));
            }
        }
      }
      if (jsonExport) {
        writer.write("\",");
      }
      writer.newLine();
    }
  }

  /**
   * Writes in <code>zipOut</code> stream the given contents.
   */
  private void writeContents(ZipOutputStream zipOut,
                             boolean contentSavedInSeparateFile,
                             String  furnitureResourcesLocalDirectory,
                             Map<Content, String> contentEntries) throws IOException, InterruptedRecorderException {
    if (contentSavedInSeparateFile && furnitureResourcesLocalDirectory != null) {
      // Check local directory
      File directory = new File(furnitureResourcesLocalDirectory);
      if (!directory.exists()) {
        if (!directory.mkdirs()) {
          throw new IOException("Can't create directory " + directory);
        }
      } else if (!directory.isDirectory()) {
        throw new IOException(directory + " isn't a directory");
      }
    }

    Map<String, List<ZipEntry>> zipUrlsEntries = new HashMap<String, List<ZipEntry>>();
    for (Map.Entry<Content, String> contentEntry : contentEntries.entrySet()) {
      Content content = contentEntry.getKey();
      if (content instanceof URLContent) {
        URLContent urlContent = (URLContent)content;
        String entryName = contentEntry.getValue();
        if (entryName.indexOf('/') != -1) {
          writeZipEntries(zipOut, contentSavedInSeparateFile, furnitureResourcesLocalDirectory,
              urlContent, entryName, zipUrlsEntries);
        } else if (!contentSavedInSeparateFile || furnitureResourcesLocalDirectory == null) {
          writeZipEntry(zipOut, urlContent, entryName);
        } else {
          File file = new File(furnitureResourcesLocalDirectory, entryName);
          if (!file.exists()) {
            copyContent(urlContent, file);
          }
        }
      }
      if (Thread.interrupted()) {
        throw new InterruptedRecorderException();
      }
    }
  }

  /**
   * Writes in <code>zipOut</code> stream all the sibling files of the zipped
   * <code>content</code>.
   */
  private void writeZipEntries(ZipOutputStream zipOut,
                               boolean contentSavedInSeparateFile,
                               String furnitureResourcesLocalDirectory,
                               URLContent content,
                               String mainEntryName,
                               Map<String, List<ZipEntry>> zipUrlsEntries) throws IOException {
    String mainEntryDirectory = mainEntryName.substring(0, mainEntryName.indexOf('/'));
    if (contentSavedInSeparateFile && furnitureResourcesLocalDirectory != null) {
      // Write content entries in a separate zipped file, if the file doesn't exist
      File file = new File(furnitureResourcesLocalDirectory, mainEntryDirectory + ".zip");
      if (file.exists()) {
        return;
      }
      zipOut = new ZipOutputStream(new FileOutputStream(file));
      mainEntryDirectory = "";
    } else {
      mainEntryDirectory += "/";
    }

    String contentDirectory = "";
    if (content instanceof ResourceURLContent) {
      contentDirectory = URLDecoder.decode(content.getJAREntryName().replace("+", "%2B"), "UTF-8");
      int slashIndex = contentDirectory.lastIndexOf('/');
      if (slashIndex != -1) {
        contentDirectory = contentDirectory.substring(0, slashIndex + 1);
      }
    }

    if (content instanceof ResourceURLContent
         && !((ResourceURLContent)content).isMultiPartResource()
         && contentSavedInSeparateFile) {
      // mainEntry is actually not saved in a sub folder
      writeZipEntry(zipOut, content, mainEntryName.substring(mainEntryName.indexOf('/') + 1));
    } else {
      URL zipUrl = content.getJAREntryURL();
      // Keep in cache the entries of the read zip files to speed up save process
      List<ZipEntry> entries = zipUrlsEntries.get(zipUrl.toString());
      if (entries == null) {
        zipUrlsEntries.put(zipUrl.toString(), entries = getZipEntries(zipUrl));
      }
      for (ZipEntry entry : entries) {
        String zipEntryName = entry.getName();
        URLContent siblingContent = new URLContent(new URL("jar:" + zipUrl + "!/" +
            URLEncoder.encode(zipEntryName, "UTF-8").replace("+", "%20")));
        if (contentDirectory.length() == 0) {
          boolean saveEntry = true;
          for (String ignoredExtension : IGNORED_EXTENSIONS) {
            if (zipEntryName.toLowerCase().endsWith(ignoredExtension)) {
              saveEntry = false;
              break;
            }
          }
          if (saveEntry) {
            // Write each zipped stream entry that is stored in content except useless content
            writeZipEntry(zipOut, siblingContent, mainEntryDirectory + zipEntryName);
          }
        } else if (zipEntryName.startsWith(contentDirectory)) {
          // Write each zipped stream entry that is stored in the same directory as content
          writeZipEntry(zipOut, siblingContent, mainEntryDirectory + zipEntryName.substring(contentDirectory.length()));
        }
      }
    }

    if (contentSavedInSeparateFile && furnitureResourcesLocalDirectory != null) {
      zipOut.close();
    }
  }

  /**
   * Returns the ZIP entries in <code>zipUrl</code>.
   */
  private List<ZipEntry> getZipEntries(URL zipUrl) throws IOException {
    List<ZipEntry> entries;
    // Get zipped stream entries
    ZipInputStream zipIn = null;
    try {
      entries = new ArrayList<ZipEntry>();
      zipIn = new ZipInputStream(zipUrl.openStream());
      for (ZipEntry entry; (entry = zipIn.getNextEntry()) != null; ) {
        entries.add(entry);
      }
      return entries;
    } finally {
      if (zipIn != null) {
        zipIn.close();
      }
    }
  }

  /**
   * Writes in <code>zipOut</code> stream a new entry named <code>entryName</code> that
   * contains a given <code>content</code>.
   */
  private void writeZipEntry(ZipOutputStream zipOut,
                             URLContent content,
                             String entryName) throws IOException {
    byte [] buffer = new byte [8096];
    InputStream contentIn = null;
    try {
      zipOut.putNextEntry(new ZipEntry(entryName));
      contentIn = content.openStream();
      int size;
      while ((size = contentIn.read(buffer)) != -1) {
        zipOut.write(buffer, 0, size);
      }
      zipOut.closeEntry();
    } finally {
      if (contentIn != null) {
        contentIn.close();
      }
    }
  }

  /**
   * Copy the given <code>content</code> to <code>file</code>.
   */
  private void copyContent(Content content, File file) throws IOException {
    InputStream in = null;
    try {
      in = content.openStream();
      copyContentToFile(in, file);
    } catch (IOException ex) {
      throw new IOException("Can't copy content " + content + " to " + file);
    } finally {
      try {
        if (in != null) {
          in.close();
        }
      } catch (IOException ex) {
        // Forget exception
      }
    }
  }

  /**
   * Copy <code>file1</code> to <code>file2</code>.
   */
  private void copyFile(File file1, File file2) throws IOException {
    InputStream in = null;
    try {
      in = new FileInputStream(file1);
      copyContentToFile(in, file2);
    } catch (IOException ex) {
      throw new IOException("Can't copy file " + file1 + " to " + file2);
    } finally {
      try {
        if (in != null) {
          in.close();
        }
      } catch (IOException ex) {
        // Forget exception
      }
    }
  }

  /**
   * Copy the content of <code>in</code> stream to <code>file</code>.
   */
  private void copyContentToFile(InputStream in, File file) throws IOException {
    byte [] buffer = new byte [8192];
    OutputStream out = null;
    try {
      out = new FileOutputStream(file);
      int size;
      while ((size = in.read(buffer)) != -1) {
        out.write(buffer, 0, size);
      }
    } finally {
      try {
        if (out != null) {
          out.close();
        }
      } catch (IOException ex) {
        throw new IOException("Can't close file " + file);
      }
    }
  }
}
