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
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipFile;

import com.eteks.sweethome3d.model.Home;
import com.eteks.sweethome3d.model.HomeRecorder;
import com.eteks.sweethome3d.model.RecorderException;
import com.eteks.sweethome3d.model.UserPreferences;

/**
 * Recorder that stores homes on a HTTP server.
 * @author Emmanuel Puybaret
 */
public class HomeServerRecorder implements HomeRecorder {
  private int                 compressionLevel;
  private UserPreferences     preferences;
  private Map<String, String> filesWithContent = new HashMap<>();

  public HomeServerRecorder(int compressionLevel,
                            UserPreferences preferences) {
    this.compressionLevel = compressionLevel;
    this.preferences = preferences;
  }

  public Home readHome(String name) throws RecorderException {
    try {
      File file = new File(name);
      if (isFileWithContent(file)) {
        Path fileWithContent = Files.createTempFile("read-", ".sh3d");
        Files.copy(file.toPath(), fileWithContent, StandardCopyOption.REPLACE_EXISTING);
        this.filesWithContent.put(name, fileWithContent.toFile().getAbsolutePath());
        file = fileWithContent.toFile();
      }

      try (DefaultHomeInputStream in = new DefaultHomeInputStream(file,
              ContentRecording.INCLUDE_TEMPORARY_CONTENT, new HomeXMLHandler(this.preferences),
              this.preferences, true)) {
        return in.readHome();
      }
    } catch (IOException | ClassNotFoundException ex) {
      throw new RecorderException("Can't read home", ex);
    }
  }

  public void writeHome(Home home, String name) throws RecorderException {
    // Write home directly and without Java serialized entry
    try (DefaultHomeOutputStream out = new DefaultHomeOutputStream(
            new BufferedOutputStream(new FileOutputStream(name)),
            this.compressionLevel, ContentRecording.INCLUDE_TEMPORARY_CONTENT,
            false, new HomeXMLExporter())) {
      out.writeHome(home);
    } catch (IOException ex) {
      throw new RecorderException("Can't write home", ex);
    }

    if (this.filesWithContent.get(name) != null) {
      new File(this.filesWithContent.remove(name)).delete();
    }
  }

  @Override
  public boolean exists(String name) throws RecorderException {
    return new File(name).exists();
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
