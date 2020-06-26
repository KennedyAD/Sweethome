/*
 * HomeAppletRecorder.java
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
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipFile;

import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.NotEnoughSpaceRecorderException;
import com.eteks.sweethome3d.model.RecorderException;
import com.eteks.sweethome3d.model.UserPreferences;

/**
 * A recorder able to read and write homes with minimum temporary files and no <code>Home</code> entry.
 * @author Emmanuel Puybaret
 */
public class HomeServerRecorder {
  private String              homeFileName;
  private String              homeFileWithContent;
  private Home                home;

  public HomeServerRecorder(String homeFileName,
                            UserPreferences preferences) throws RecorderException {
    this.homeFileName = homeFileName;
    File homeFile = new File(homeFileName);
    try {
      if (isFileWithContent(homeFile)) {
        File fileWithContent = File.createTempFile("read-", ".sh3d");
        fileWithContent.deleteOnExit();
        Files.copy(homeFile.toPath(), fileWithContent.toPath(), StandardCopyOption.REPLACE_EXISTING);
        this.homeFileWithContent = fileWithContent.getCanonicalPath();
        homeFile = fileWithContent;
      }

      try (DefaultHomeInputStream in = new DefaultHomeInputStream(homeFile,
              ContentRecording.INCLUDE_TEMPORARY_CONTENT, new HomeXMLHandler(preferences),
              preferences, true)) {
        this.home = in.readHome();
      }
    } catch (IOException | ClassNotFoundException ex) {
      throw new RecorderException("Can't read home", ex);
    }
  }

  /**
   * Returns the read home.
   */
  public Home getHome() {
    return this.home;
  }

  public void writeHome(int compressionLevel) throws RecorderException {
    File homeFile = new File(this.homeFileName);
    if (homeFile.exists()
        && !homeFile.canWrite()) {
      throw new RecorderException("Can't write over file " + this.homeFileName);
    }

    File tempFile = null;
    try {
      tempFile = File.createTempFile("save-", ".sweethome3d");
      // Write home without Java serialized entry
      try (DefaultHomeOutputStream out = new DefaultHomeOutputStream(
              new BufferedOutputStream(new FileOutputStream(tempFile)),
              compressionLevel, ContentRecording.INCLUDE_TEMPORARY_CONTENT,
              false, new HomeXMLExporter())) {
        out.writeHome(this.home);
      }

      // Check disk space
      if (!isDiskUsableSpaceLargeEnough(tempFile)) {
        // Try to delete temporary files with content
        System.gc();
        if (!isDiskUsableSpaceLargeEnough(tempFile)) {
          throw new NotEnoughSpaceRecorderException("Not enough disk space to save file " + this.homeFileName, -1);
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

  private boolean isDiskUsableSpaceLargeEnough(File tempFile) throws NotEnoughSpaceRecorderException {
    File homeFile = new File(this.homeFileName);
    long usableSpace = homeFile.getUsableSpace();
    long requiredSpace = tempFile.length();
    if (homeFile.exists()) {
      requiredSpace -= homeFile.length();
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
