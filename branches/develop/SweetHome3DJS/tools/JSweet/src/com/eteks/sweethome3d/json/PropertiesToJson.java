package com.eteks.sweethome3d.json;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Properties;

import org.json.JSONObject;

public class PropertiesToJson {

  public static void main(String[] args) throws Exception {
    String[] sourcePropertyDirectories = { "../SweetHome3D/src/com/eteks/sweethome3d",
        "../SweetHome3D/src/com/eteks/sweethome3d/applet", "../SweetHome3D/src/com/eteks/sweethome3d/swing",
        "../SweetHome3D/src/com/eteks/sweethome3d/viewcontroller" };
    String[] supportedLanguages = { "", "_bg", "_cs", "_de", "_el", "_en", "_es", "_fr", "_it", "_ja", "_hu", "_nl",
        "_pl", "_pt", "_ru", "_sv", "_vi", "_zh_CN", "_zh_TW" };
    String outputDirectory = "lib/generated";
    String outputName = "localization";
    new PropertiesToJson().convert(sourcePropertyDirectories, "package", outputDirectory, outputName,
        supportedLanguages);
  }

  public void convert(String[] sourcePropertyDirectories, String sourceName, String outputDirectory, String outputName,
      String[] supportedLanguages) throws Exception {

    new File(outputDirectory).mkdirs();
    for (String lang : supportedLanguages) {
      Path outputFilePath = Paths.get(outputDirectory, outputName + lang + ".json");
      System.out.println("Generating " + outputFilePath + "...");
      outputFilePath.toFile().delete();
      outputFilePath.toFile().createNewFile();
      Properties properties = new Properties();
      for (String sourcePropertyDirectory : sourcePropertyDirectories) {
        File dir = new File(sourcePropertyDirectory);
        for (File file : dir.listFiles()) {
          if (file.getName().equals(sourceName + lang + ".properties")) {
            Properties props = new Properties();
            props.load(new FileInputStream(file));
            System.out.println("Loading " + props.size() + " properties from " + file + ".");
            properties.putAll(props);
          }
        }
      }
      System.out.println("Writing " + properties.size() + " properties to " + outputFilePath + ".");
      Files.write(outputFilePath, (new JSONObject(properties).toString(2) + "\n").getBytes("UTF-8"), StandardOpenOption.APPEND);
    }

  }

}
