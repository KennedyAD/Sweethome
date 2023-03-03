/*
 * HomeServerRecorder.java
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

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipFile;

import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomePieceOfFurniture;
import com.eteks.sweethome3d.model.NotEnoughSpaceRecorderException;
import com.eteks.sweethome3d.model.RecorderException;
import com.eteks.sweethome3d.model.UserPreferences;

/**
 * A recorder able to read and write homes with minimum temporary files and no <code>Home</code> entry.
 * @author Emmanuel Puybaret
 */
public class HomeServerRecorder {
  private String              homeFileWithContent;
  private Home                home;
  private static byte []      newHomeContent;

  public HomeServerRecorder(File homeFile,
                            UserPreferences preferences) throws RecorderException {
    if (homeFile.exists()) {
      try {
        if (isFileWithContent(homeFile)) {
          int dotIndex = homeFile.getName().lastIndexOf('.');
          File fileWithContent = File.createTempFile("read-",
              dotIndex > 0 ? homeFile.getName().substring(dotIndex) : ".sh3d");
          fileWithContent.deleteOnExit();
          Files.copy(homeFile.toPath(), fileWithContent.toPath(), StandardCopyOption.REPLACE_EXISTING);
          this.homeFileWithContent = fileWithContent.getCanonicalPath();
          homeFile = fileWithContent;
        }

        try (DefaultHomeInputStream in = createHomeInputStream(homeFile, preferences)) {
          this.home = in.readHome();
        }
      } catch (IOException | ClassNotFoundException ex) {
        throw new RecorderException("Can't read home", ex);
      }
    } else {
      // If home file doesn't exist, simply instantiate a new home
      this.home = createHome();
    }
  }

  /**
   * Returns a new home if home file doesn't exist yet.
   */
  protected Home createHome() {
    return new Home();
  }

  /**
   * Returns the read home.
   */
  public Home getHome() {
    return this.home;
  }

  /**
   * Returns the filter input stream used to read a home from the file in parameter.
   */
  protected DefaultHomeInputStream createHomeInputStream(File homeFile, UserPreferences preferences) throws IOException {
    return new DefaultHomeInputStream(homeFile, ContentRecording.INCLUDE_TEMPORARY_CONTENT,
        new HomeXMLHandler(preferences), preferences, true);
  }

  /**
   * Writes the read home in the given file.
   */
  public void writeHome(File homeFile, int compressionLevel) throws RecorderException {
    if (homeFile.exists()
        && !homeFile.canWrite()) {
      throw new RecorderException("Can't write over file " + homeFile);
    }

    File tempFile = null;
    try {
      tempFile = File.createTempFile("save-", ".sweethome3d");
      // Write home without Java serialized entry
      try (DefaultHomeOutputStream out = createHomeOutputStream(tempFile, compressionLevel)) {
        out.writeHome(this.home);
      }

      // Check disk space
      if (!isDiskUsableSpaceLargeEnough(tempFile, homeFile)) {
        // Try to delete temporary files with content
        System.gc();
        if (!isDiskUsableSpaceLargeEnough(tempFile, homeFile)) {
          throw new NotEnoughSpaceRecorderException("Not enough disk space to save file " + homeFile, -1);
        }
      }

      // Overwriting home file
      Files.copy(tempFile.toPath(), homeFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
    } catch (IOException ex) {
      throw new RecorderException("Can't write home", ex);
    } finally {
      if (tempFile != null) {
        tempFile.delete();
      }
    }
  }

  /**
   * Returns the filter output stream used to write a home in the file in parameter.
   */
  protected DefaultHomeOutputStream createHomeOutputStream(File homeFile, int compressionLevel) throws IOException {
    return new DefaultHomeOutputStream(new BufferedOutputStream(new FileOutputStream(homeFile)),
        compressionLevel, ContentRecording.INCLUDE_TEMPORARY_CONTENT, false, new HomeXMLExporter());
  }

  private boolean isDiskUsableSpaceLargeEnough(File copiedFile, File destinationFile) throws NotEnoughSpaceRecorderException {
    long usableSpace = destinationFile.getUsableSpace();
    long requiredSpace = copiedFile.length();
    if (destinationFile.exists()) {
      requiredSpace -= destinationFile.length();
    }
    return usableSpace == 0
        || usableSpace >= requiredSpace;
  }

  @Override
  protected void finalize() {
    if (this.homeFileWithContent != null) {
      new File(this.homeFileWithContent).delete();
    }
  }

  /**
   * Returns the file content of a new home.
   */
  public static byte [] getNewHomeContent() throws RecorderException {
    if (newHomeContent == null) {
      ByteArrayOutputStream byteArrayOutput = new ByteArrayOutputStream(2048);
      try (DefaultHomeOutputStream output = new DefaultHomeOutputStream(byteArrayOutput,
              9, ContentRecording.INCLUDE_TEMPORARY_CONTENT,
              false, new HomeXMLExporter())) {
        Home home = new Home();
        home.setFurnitureVisibleProperties(Arrays.asList(
            HomePieceOfFurniture.SortableProperty.NAME,
            HomePieceOfFurniture.SortableProperty.VISIBLE));
        output.writeHome(home);
      } catch (IOException ex) {
        throw new RecorderException("Couldn't generate content of an empty home", ex);
      }
      newHomeContent = byteArrayOutput.toByteArray();
    }
    return newHomeContent.clone();
  }

  /**
   * Returns <code>true</code> if the given file contain some
   * content that can be referenced elsewhere.
   */
  public static boolean isFileWithContent(File file) throws IOException {
    try (ZipFile zipFile = new ZipFile(file)) {
      Enumeration<? extends ZipEntry> entries = zipFile.entries();
      // Return true if the zip file doesn't contain only Home.xml entry
      return !entries.hasMoreElements()
          || !"Home.xml".equals(entries.nextElement().getName())
          || entries.hasMoreElements();
    } catch (ZipException ex) {
      return !file.getName().endsWith(".xml");
    }
  }
}
