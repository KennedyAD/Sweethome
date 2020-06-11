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
import java.util.Properties;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import com.google.gson.GsonBuilder;

public class PropertiesToJson {

  public static void main(String[] args) throws IOException {
    String[] sourceProperties = { "../SweetHome3D/src/com/eteks/sweethome3d/package",
        "../SweetHome3D/src/com/eteks/sweethome3d/applet/package",
        "../SweetHome3D/src/com/eteks/sweethome3d/swing/package",
        "../SweetHome3D/src/com/eteks/sweethome3d/viewcontroller/package",
        "../SweetHome3D/src/com/sun/swing/internal/plaf/basic/resources/basic" };
    String[] supportedLanguages = { "", "_bg", "_cs", "_de", "_el", "_en", "_es", "_fr", "_it", "_ja", "_hu", "_nl",
        "_pl", "_pt", "_ru", "_sv", "_vi", "_zh_CN", "_zh_TW" };
    String outputDirectory = "lib/generated";
    String outputName = "localization";
    new PropertiesToJson().convert(sourceProperties, outputDirectory, null, outputName, supportedLanguages);
    new PropertiesToJson().convert(new String[] { "../SweetHome3D/src/com/eteks/sweethome3d/model/LengthUnit" },
        outputDirectory, null, "LengthUnit", supportedLanguages);
    new PropertiesToJson().convert(new String[] { "../SweetHome3D/src/com/eteks/sweethome3d/io/DefaultFurnitureCatalog" },
        outputDirectory, "lib/resources/furniture", "DefaultFurnitureCatalog", supportedLanguages);
  }

  public void convert(String[] sourceProperties, String outputDirectory, String resourcesOutputDirectory, String outputName, String[] supportedLanguages)
      throws IOException {
    new File(outputDirectory).mkdirs();
    for (String lang : supportedLanguages) {
      Path outputFilePath = Paths.get(outputDirectory, outputName + lang + ".json");
      System.out.println("Generating " + outputFilePath + "...");
      outputFilePath.toFile().delete();
      outputFilePath.toFile().createNewFile();
      Properties properties = new Properties();
      for (String sourceProperty : sourceProperties) {
        File dir = new File(sourceProperty).getParentFile();
        String name = new File(sourceProperty).getName();
        for (File file : dir.listFiles()) {
          if (file.getName().equals(name + lang + ".properties")) {
            Properties props = new Properties();
            props.load(new FileInputStream(file));
            System.out.println("Loading " + props.size() + " properties from " + file + ".");
            properties.putAll(props);
          }
        }
        afterLoaded(dir, resourcesOutputDirectory, name, "".equals(lang) ? "en" : lang.substring(1), properties);
      }
      System.out.println("Writing " + properties.size() + " properties to " + outputFilePath + ".");
      Files.write(outputFilePath, (new GsonBuilder().setPrettyPrinting().create().toJson(properties) + "\n").getBytes("UTF-8"),
          StandardOpenOption.APPEND);
    }

  }

  private void afterLoaded(File dir, String resourcesOutputDirectory, String name, String lang, Properties properties) throws IOException {
    if ("LengthUnit".equals(name)) {
      System.out.println("***** Adding extra keys for '" + lang + "'");
      properties.put("groupingSeparator", new DecimalFormatSymbols(Locale.forLanguageTag(lang)).getGroupingSeparator());
      properties.put("decimalSeparator", new DecimalFormatSymbols(Locale.forLanguageTag(lang)).getDecimalSeparator());
    } else if ("package".equals(name)) {
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
    } else if ("DefaultFurnitureCatalog".equals(name)) {
      new File(resourcesOutputDirectory).mkdirs();
      // Copy icon#, planIcon# images and create a .zip file containing the file pointed by model# property
      for (Entry<Object, Object> entry : properties.entrySet()) {
        String key = (String)entry.getKey();
        if (key.startsWith("icon#")
            || key.startsWith("planIcon#")) {
          String currentPath = properties.getProperty(key);
          Path newPath = Paths.get(resourcesOutputDirectory, currentPath.substring(currentPath.lastIndexOf("/")));
          Files.copy(Paths.get("../SweetHome3D/src", currentPath), newPath, StandardCopyOption.REPLACE_EXISTING);

          entry.setValue(newPath.toString());
        } else if (key.startsWith("model#")) {
          int index = Integer.parseInt(key.substring("model#".length()));
          String currentPath = properties.getProperty(key);
          String modelFile = currentPath.substring(currentPath.lastIndexOf("/") + 1);
          String extension = modelFile.substring(modelFile.lastIndexOf('.'));
          // Create a .zip file containing the 3D model
          Path newPath = Paths.get(resourcesOutputDirectory, modelFile.replace(extension, ".zip"));
          ZipOutputStream zipOutputStream = new ZipOutputStream(new FileOutputStream(newPath.toFile()));
          if (Boolean.parseBoolean(properties.getProperty("multiPartModel#" + index))) {
            // Include multiPart files in same folder
            Path folder = Paths.get("../SweetHome3D/src", currentPath).getParent();
            Files.walkFileTree(folder,
                new SimpleFileVisitor<Path>() {
                  @Override
                  public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    String multiPartEntry = folder.relativize(file).toString();
                    zipOutputStream.putNextEntry(new ZipEntry(multiPartEntry));
                    Files.copy(file, zipOutputStream);
                    zipOutputStream.closeEntry();
                    return FileVisitResult.CONTINUE;
                  }
                });
          } else {
            zipOutputStream.putNextEntry(new ZipEntry(modelFile));
            Files.copy(Paths.get("../SweetHome3D/src", currentPath), zipOutputStream);
            zipOutputStream.closeEntry();
          }
          zipOutputStream.close();

          entry.setValue("jar:" + newPath + "!/" + modelFile);
        }
      }
    }
  }
}
