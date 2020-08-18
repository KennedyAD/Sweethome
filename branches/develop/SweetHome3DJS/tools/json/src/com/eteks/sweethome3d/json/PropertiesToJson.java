/*
 * PropertiesToJson.java
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
package com.eteks.sweethome3d.json;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.text.DecimalFormatSymbols;
import java.util.Arrays;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map.Entry;
import java.util.concurrent.atomic.AtomicLong;
import java.util.Properties;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.json.JSONObject;

/**
 * Converts Sweet Home 3D .properties file to .json files.
 * @author Renaud Pawlak
 * @author Emmanuel Puybaret
 */
public class PropertiesToJson {
  public static void main(String[] args) throws IOException {
    String[] supportedLanguages = {"", "bg", "cs", "de", "el", "en_AU", "en_CA", "en_US", "es", "fr", "it", "ja", "hu", "nl",
        "pl", "pt", "ru", "sv", "vi", "zh_CN", "zh_TW"};

    if (args.length >= 5) {
      convert(args [0],               // Source root
          new String [] {args [1]},   // Source properties file
          args [2],                   // Output directory
          args [3],                   // Output name
          args [4],                   // Resources output directory
          args.length > 5 ? Boolean.parseBoolean(args [5]) : false,
          supportedLanguages);
    } else {
      String    sourceRoot = "../SweetHome3D/src";
      String [] sourceProperties = {"com/eteks/sweethome3d/package",
          "com/eteks/sweethome3d/applet/package",
          "com/eteks/sweethome3d/swing/package",
          "com/eteks/sweethome3d/viewcontroller/package",
          "com/sun/swing/internal/plaf/basic/resources/basic"};
      String outputDirectory = "lib/resources";

      convert(sourceRoot, sourceProperties,
          outputDirectory, "localization", null, false, supportedLanguages);
      convert(sourceRoot, new String[] { "com/eteks/sweethome3d/model/LengthUnit" },
          outputDirectory, "LengthUnit", null, false, supportedLanguages);
      convert(sourceRoot, new String[] { "com/eteks/sweethome3d/io/DefaultFurnitureCatalog" },
          outputDirectory, "DefaultFurnitureCatalog", "lib/resources/models", true, supportedLanguages);
      convert(sourceRoot, new String[] { "com/eteks/sweethome3d/io/DefaultTexturesCatalog" },
          outputDirectory, "DefaultTexturesCatalog", "lib/resources/textures", true, supportedLanguages);
    }
  }

  private static void convert(String sourceRoot, String[] sourcePropertyFiles,
                              String outputDirectory, String outputName, String resourcesOutputDirectory,
                              boolean copyResources, String[] supportedLanguages) throws IOException {
    new File(outputDirectory).mkdirs();
    for (String language : supportedLanguages) {
      Properties mergedProperties = new Properties();
      for (String sourcePropertyFile : sourcePropertyFiles) {
        File sourceFile = new File(sourceRoot, sourcePropertyFile);
        File directory = sourceFile.getParentFile();
        String propertyFileName = sourceFile.getName();
        for (File file : directory.listFiles()) {
          if ("".equals(language) && file.getName().equals(propertyFileName + ".properties")
              || !"".equals(language) && file.getName().matches(propertyFileName + "_" + language + ".properties")) {
            Properties properties = new Properties();
            properties.load(new FileInputStream(file));
            System.out.println("Loading " + properties.size() + " properties from " + file + ".");
            mergedProperties.putAll(properties);
          }
        }
        afterLoaded(mergedProperties, sourceRoot, resourcesOutputDirectory, propertyFileName, copyResources,
            "".equals(language) ? "en" : language);
      }
      if (mergedProperties.size() > 0) {
        Path outputFilePath = Paths.get(outputDirectory, outputName + ("".equals(language) ? "" : "_") + language + ".json");
        System.out.println("Writing " + mergedProperties.size() + " properties to " + outputFilePath + ".");
        Files.write(outputFilePath, (new JSONObject(mergedProperties).toString(2) + "\n").getBytes("UTF-8"),
            StandardOpenOption.CREATE);
      }
    }
  }

  private static void afterLoaded(Properties properties, String sourceRoot, String resourcesOutputDirectory, String propertyFileBaseName,
                                  boolean copyResources, String language) throws IOException {
    if ("LengthUnit".equals(propertyFileBaseName)) {
      System.out.println("***** Adding extra keys for '" + language + "'");
      properties.put("groupingSeparator", new DecimalFormatSymbols(Locale.forLanguageTag(language)).getGroupingSeparator());
      properties.put("decimalSeparator", new DecimalFormatSymbols(Locale.forLanguageTag(language)).getDecimalSeparator());
    } else if ("package".equals(propertyFileBaseName)) {
      for (Iterator<Entry<Object, Object>> it = properties.entrySet().iterator(); it.hasNext(); ) {
        String key = (String)it.next().getKey();
        int acceleratorKeyIndex = key.indexOf(".AcceleratorKey");
        if (acceleratorKeyIndex >= 0
            && !Arrays.asList("HomePane.UNDO", "HomePane.REDO", "HomePane.DELETE",
                    "HomePane.CUT", "HomePane.COPY", "HomePane.PASTE").
                contains(key.substring(0, acceleratorKeyIndex))) {
          // Keep only accelerators that won't clash with browser ones
          it.remove();
        }
      }
    } else {
      if (propertyFileBaseName.endsWith("FurnitureCatalog")) {
        // Copy icon#, planIcon# images and create a .zip file containing the file pointed by model# property
        updateImageEntries(properties, sourceRoot, "icon#", resourcesOutputDirectory, copyResources);
        updateImageEntries(properties, sourceRoot, "planIcon#", resourcesOutputDirectory, copyResources);

        for (Entry<Object, Object> entry : properties.entrySet()) {
          String key = (String)entry.getKey();
          if (key.startsWith("model#")) {
            int index = Integer.parseInt(key.substring("model#".length()));
            String currentPath = properties.getProperty(key);
            String modelFile = currentPath.substring(currentPath.lastIndexOf("/") + 1);
            String extension = modelFile.substring(modelFile.lastIndexOf('.'));

            // Create a .zip file containing the 3D model
            String newPath = (resourcesOutputDirectory.length() > 0  ? resourcesOutputDirectory + "/"  : "")
                + modelFile.replace(extension, ".zip");
            Path modelPath = Paths.get(sourceRoot, currentPath);
            Path modelFolder = modelPath.getParent();
            if (copyResources) {
              new File(resourcesOutputDirectory).mkdirs();
              ZipOutputStream zipOutputStream = new ZipOutputStream(new FileOutputStream(newPath));
              if (Boolean.parseBoolean(properties.getProperty("multiPartModel#" + index))) {
                // Include multiPart files in same folder
                Files.walkFileTree(modelFolder,
                    new SimpleFileVisitor<Path>() {
                      @Override
                      public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                        String multiPartEntry = modelFolder.relativize(file).toString();
                        zipOutputStream.putNextEntry(new ZipEntry(multiPartEntry));
                        Files.copy(file, zipOutputStream);
                        zipOutputStream.closeEntry();
                        return FileVisitResult.CONTINUE;
                      }
                    });
              } else {
                zipOutputStream.putNextEntry(new ZipEntry(modelFile));
                Files.copy(modelPath, zipOutputStream);
                zipOutputStream.closeEntry();
              }
              zipOutputStream.close();
            }

            String modelSizeKey = "modelSize#" + key.substring(key.indexOf('#') + 1);
            if (properties.get(modelSizeKey) == null) {
              AtomicLong size = new AtomicLong();
              if (Boolean.parseBoolean(properties.getProperty("multiPartModel#" + index))) {
                Files.walkFileTree(modelFolder, new SimpleFileVisitor<Path>() {
                  @Override
                  public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    size.addAndGet(file.toFile().length());
                    return FileVisitResult.CONTINUE;
                  }
                });
              } else {
                size.addAndGet(modelPath.toFile().length());
              }
              properties.put(modelSizeKey, size.longValue());
            }

            entry.setValue((newPath.toString().contains("://") ? "jar:" : "") + newPath + "!/" + modelFile);
          }
        }
      } else if (propertyFileBaseName.endsWith("TexturesCatalog")) {
        updateImageEntries(properties, sourceRoot, "image#", resourcesOutputDirectory, copyResources);
      }
    }
  }

  private static void updateImageEntries(Properties properties, String sourceRoot, String imagePrefix,
                                         String resourcesOutputDirectory, boolean copyResources) throws IOException {
    for (Entry<Object, Object> entry : properties.entrySet()) {
      String key = (String)entry.getKey();
      if (key.startsWith(imagePrefix)) {
        String currentPath = properties.getProperty(key);
        String newPath = (resourcesOutputDirectory.length() > 0  ? resourcesOutputDirectory + "/"  : "")
            + currentPath.substring(currentPath.lastIndexOf("/") + 1);
        if (copyResources) {
          new File(resourcesOutputDirectory).mkdirs();
          Files.copy(Paths.get(sourceRoot, currentPath), Paths.get(newPath), StandardCopyOption.REPLACE_EXISTING);
        }

        entry.setValue(newPath.toString());
      }
    }
  }
}
