package com.eteks.sweethome3d.json;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.text.DecimalFormatSymbols;
import java.util.Locale;
import java.util.Properties;

import org.json.JSONObject;

public class PropertiesToJson {

  public static void main(String[] args) throws Exception {
    String[] sourceProperties = { "../SweetHome3D/src/com/eteks/sweethome3d/package",
        "../SweetHome3D/src/com/eteks/sweethome3d/applet/package",
        "../SweetHome3D/src/com/eteks/sweethome3d/swing/package",
        "../SweetHome3D/src/com/eteks/sweethome3d/viewcontroller/package",
        "../SweetHome3D/src/com/sun/swing/internal/plaf/basic/resources/basic" };
    String[] supportedLanguages = { "", "_bg", "_cs", "_de", "_el", "_en", "_es", "_fr", "_it", "_ja", "_hu", "_nl",
        "_pl", "_pt", "_ru", "_sv", "_vi", "_zh_CN", "_zh_TW" };
    String outputDirectory = "lib/generated";
    String outputName = "localization";
    new PropertiesToJson().convert(sourceProperties, outputDirectory, outputName, supportedLanguages);
    new PropertiesToJson().convert(new String[] { "../SweetHome3D/src/com/eteks/sweethome3d/model/LengthUnit" },
        outputDirectory, "LengthUnit", supportedLanguages);

  }

  public void convert(String[] sourceProperties, String outputDirectory, String outputName, String[] supportedLanguages)
      throws Exception {

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
        afterLoaded(dir, name, "".equals(lang) ? "en" : lang.substring(1), properties);
      }
      System.out.println("Writing " + properties.size() + " properties to " + outputFilePath + ".");
      Files.write(outputFilePath, (new JSONObject(properties).toString(2) + "\n").getBytes("UTF-8"),
          StandardOpenOption.APPEND);
    }

  }

  private void afterLoaded(File dir, String name, String lang, Properties properties) {
    if ("LengthUnit".equals(name)) {
      System.out.println("***** Adding extra keys for '" + lang + "'");
      properties.put("groupingSeparator", new DecimalFormatSymbols(Locale.forLanguageTag(lang)).getGroupingSeparator());
      properties.put("decimalSeparator", new DecimalFormatSymbols(Locale.forLanguageTag(lang)).getDecimalSeparator());
    }
  }

}
