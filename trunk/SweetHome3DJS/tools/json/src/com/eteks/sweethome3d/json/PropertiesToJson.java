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
import java.net.URLDecoder;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.concurrent.atomic.AtomicLong;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;
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
        "pl", "pt", "pt_BR", "ru", "sv", "vi", "zh_CN", "zh_TW"};

    if (args.length >= 5
        && new File(args [0] + "/" + args [1]).isFile()) {
      String sourceRoot = args [0];
      String sourcePropertyFile = args [1];
      boolean resourceNameFromFile = true;
      if (!sourcePropertyFile.endsWith(".properties")) {
        // Check if second parameter is a library file containing PluginFurnitureCatalog.properties or PluginTexturesCatalog.properties
        try (ZipFile zipFile = new ZipFile(new File (sourceRoot, args [1]))) {
          for (Enumeration<? extends ZipEntry> zipEntries = zipFile.entries(); zipEntries.hasMoreElements(); ) {
            ZipEntry entry = zipEntries.nextElement();
            if (!entry.isDirectory() && entry.getName().endsWith("Catalog.properties")) {
              sourcePropertyFile = entry.getName();
              resourceNameFromFile = false;

              File tempFile = File.createTempFile("extract", "");
              tempFile.delete();
              tempFile.mkdir();
              tempFile.deleteOnExit();
              Path tempDir = tempFile.toPath();
              // Extract library content
              try (ZipInputStream zipIn = new ZipInputStream(new FileInputStream(new File (sourceRoot, args [1])))) {
                for (ZipEntry zipEntry; (zipEntry = zipIn.getNextEntry()) != null; ) {
                  Path path = tempDir.resolve(zipEntry.getName());
                  if (zipEntry.isDirectory()) {
                    Files.createDirectories(path);
                  } else {
                    Files.createDirectories(path.getParent());
                    Files.copy(zipIn, path);
                  }
                  path.toFile().deleteOnExit();
                }
              }
              sourceRoot = tempFile.getAbsolutePath();
            }
          }
        } catch (IOException ex) {
          // Not a zip file
        }
      }
      sourcePropertyFile = sourcePropertyFile.substring(0, sourcePropertyFile.lastIndexOf("."));
      convert(sourceRoot,             // Source root
          new String [] {sourcePropertyFile}, // Source properties file
          args [2],                   // Output directory
          args [3],                   // Output name
          null,
          args [4],                   // Resources output directory
          args.length > 5 ? args [5] : null, // Relative output directory stored in .json file
          args.length > 6 ? Boolean.parseBoolean(args [6]) : false,
          resourceNameFromFile,
          supportedLanguages);
    } else {
      String    sourceRoot = "../SweetHome3D/src";
      String [] sourceProperties = {"com/eteks/sweethome3d/package",
          "com/eteks/sweethome3d/applet/package",
          "com/eteks/sweethome3d/swing/package",
          "com/eteks/sweethome3d/viewcontroller/package",
          "com/sun/swing/internal/plaf/basic/resources/basic"};
      String outputDirectory = args.length > 0 ? args [0] : "lib/resources";

      Map<String, Properties> localizationProperties = convert(sourceRoot, sourceProperties,
          outputDirectory, "localization", null, supportedLanguages);
      convert("src", new String[] {"package"},
          outputDirectory, "localization", localizationProperties, supportedLanguages);
      if (args.length > 1) {
        for (int i = 1; i < args.length; i += 2) {
          convert(args [i], new String [] {args [i + 1]},
              outputDirectory, "localization", localizationProperties, supportedLanguages);
        }
      }
      convert(sourceRoot, new String[] {"com/eteks/sweethome3d/io/DefaultFurnitureCatalog"},
          outputDirectory, "DefaultFurnitureCatalog", null, outputDirectory + "/models", null, true, true, supportedLanguages);
      convert(sourceRoot, new String[] {"com/eteks/sweethome3d/io/DefaultTexturesCatalog"},
          outputDirectory, "DefaultTexturesCatalog", null, outputDirectory + "/textures", null, true, true, supportedLanguages);
    }
  }

  private static Map<String, Properties> convert(String sourceRoot, String[] sourcePropertyFiles,
                              String outputDirectory, String outputName, Map<String, Properties> languageProperties,
                              String[] supportedLanguages) throws IOException {
    return convert(sourceRoot, sourcePropertyFiles, outputDirectory, outputName, languageProperties, null, null, false, true, supportedLanguages);
  }

  private static Map<String, Properties> convert(String sourceRoot, String[] sourcePropertyFiles,
                              String outputDirectory, String outputName, Map<String, Properties> languageProperties,
                              String resourcesOutputDirectory, String resourcesRelativeDirectory, boolean copyResources, boolean resourceNameFromFile,
                              String[] supportedLanguages) throws IOException {
    new File(outputDirectory).mkdirs();
    for (String language : supportedLanguages) {
      Properties mergedProperties = new Properties();
      if (languageProperties != null && languageProperties.get(language) != null) {
        mergedProperties.putAll(languageProperties.get(language));
      }
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
        afterLoaded(mergedProperties, sourceRoot, resourcesOutputDirectory, propertyFileName, resourcesRelativeDirectory, copyResources, resourceNameFromFile,
            "".equals(language) ? "en" : language);
      }
      if (mergedProperties.size() > 0) {
        Path outputFilePath = Paths.get(outputDirectory, outputName + ("".equals(language) ? "" : "_") + language + ".json");
        System.out.println("Writing " + mergedProperties.size() + " properties to " + outputFilePath + ".");
        Files.write(outputFilePath, (new JSONObject(mergedProperties).toString(2) + "\n").getBytes("UTF-8"),
            StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        if (languageProperties == null) {
          languageProperties = new HashMap<String, Properties>();
        }
        languageProperties.put(language, mergedProperties);
      }
    }
    return languageProperties;
  }

  private static void afterLoaded(Properties properties, String sourceRoot, String resourcesOutputDirectory, String propertyFileBaseName,
                                  String resourcesRelativeDirectory, boolean copyResources, boolean resourceNameFromFile, String language) throws IOException {
    if ("package".equals(propertyFileBaseName)) {
      for (Iterator<Entry<Object, Object>> it = properties.entrySet().iterator(); it.hasNext(); ) {
        Entry<Object, Object> entry = it.next();
        String key = (String)entry.getKey();
        String value = (String)entry.getValue();
        int acceleratorKeyIndex = key.indexOf(".AcceleratorKey");
        if (acceleratorKeyIndex >= 0
            && !Arrays.asList("HomePane.UNDO", "HomePane.REDO", "HomePane.DELETE",
                    "HomePane.CUT", "HomePane.COPY", "HomePane.PASTE").
                contains(key.substring(0, acceleratorKeyIndex))) {
          // Keep only accelerators that won't clash with browser ones
          it.remove();
        } else if (value.indexOf("/actions/") != -1) {
          // Prefer SVG icons for the web
          entry.setValue(value.replace(".png", ".svg"));
        }
      }
    } else {
      if (propertyFileBaseName.endsWith("FurnitureCatalog")) {
        // Copy icon#, planIcon# images and create a .zip file containing the file pointed by model# property
        updateImageEntries(properties, sourceRoot, "icon#", resourcesOutputDirectory, resourcesRelativeDirectory, copyResources);
        updateImageEntries(properties, sourceRoot, "planIcon#", resourcesOutputDirectory, resourcesRelativeDirectory, copyResources);

        for (Entry<Object, Object> entry : ((Properties)properties.clone()).entrySet()) {
          String key = (String)entry.getKey();
          if (key.startsWith("model#")) {
            int index = Integer.parseInt(key.substring("model#".length()));
            String currentPath = properties.getProperty(key);
            int lastSlash = currentPath.lastIndexOf("/");
            String modelFile = currentPath.substring(lastSlash + 1);
            String modelFileParent = lastSlash > 0
                ? currentPath.substring(currentPath.lastIndexOf("/", lastSlash - 1) + 1, lastSlash)
                : null;
            String extension = modelFile.substring(modelFile.lastIndexOf('.'));

            // Create a .zip file containing the 3D model
            String zipModelFile = resourceNameFromFile || modelFileParent == null
                ? modelFile.replace(extension, ".zip")
                : modelFileParent.replace('/', '-') + ".zip";
            Path modelPath = Paths.get(sourceRoot, currentPath);
            Path modelFolder = modelPath.getParent();
            if (copyResources) {
              new File(resourcesOutputDirectory).mkdirs();
              ZipOutputStream zipOutputStream = new ZipOutputStream(new FileOutputStream(
                  new File(resourcesOutputDirectory, URLDecoder.decode(zipModelFile, "UTF-8"))));
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
            if (properties.getProperty(modelSizeKey) == null) {
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

            String newPath = resourcesRelativeDirectory != null
                ? resourcesRelativeDirectory + "/"
                : (resourcesOutputDirectory.length() > 0
                    ? resourcesOutputDirectory + "/"
                    : "");
            newPath += zipModelFile;
            properties.put(key, (newPath.toString().contains("://") ? "jar:" : "") + newPath + "!/" + modelFile);
          }
        }
      } else if (propertyFileBaseName.endsWith("TexturesCatalog")) {
        updateImageEntries(properties, sourceRoot, "image#", resourcesOutputDirectory, resourcesRelativeDirectory, copyResources);
      }
    }
  }

  private static void updateImageEntries(Properties properties, String sourceRoot, String imagePrefix,
                                         String resourcesOutputDirectory, String resourcesRelativeDirectory,
                                         boolean copyResources) throws IOException {
    for (Entry<Object, Object> entry : properties.entrySet()) {
      String key = (String)entry.getKey();
      if (key.startsWith(imagePrefix)) {
        String currentPath = properties.getProperty(key);
        String image = currentPath.substring(currentPath.lastIndexOf("/") + 1);
        String newPath = (resourcesOutputDirectory.length() > 0  ? resourcesOutputDirectory + "/"  : "") + image;
        if (copyResources) {
          new File(resourcesOutputDirectory).mkdirs();
          Files.copy(Paths.get(sourceRoot, currentPath), Paths.get(newPath), StandardCopyOption.REPLACE_EXISTING);
        }

        entry.setValue(resourcesRelativeDirectory != null
            ? resourcesRelativeDirectory + "/" + image
            : newPath.toString());
      }
    }
  }
}
