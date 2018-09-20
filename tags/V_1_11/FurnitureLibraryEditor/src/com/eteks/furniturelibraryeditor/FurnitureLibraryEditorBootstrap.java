/*
 * FurnitureLibraryEditorBootstrap.java 14 d�c. 2009
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
package com.eteks.furniturelibraryeditor;

import java.io.File;
import java.lang.reflect.Array;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.eteks.sweethome3d.tools.ExtensionsClassLoader;

/**
 * This bootstrap class loads Furniture library editor classes from jars in classpath 
 * or from extension jars stored as resources.
 * @author Emmanuel Puybaret
 */
public class FurnitureLibraryEditorBootstrap {
  public static void main(String [] args) throws MalformedURLException, IllegalAccessException, 
      InvocationTargetException, NoSuchMethodException, ClassNotFoundException {
    Class<?> furnitureLibraryEditorBootstrapClass = FurnitureLibraryEditorBootstrap.class;
    List<String> extensionJarsAndDlls = new ArrayList<String>(Arrays.asList(new String [] {
        "Loader3DS1_2u.jar", // Jars included in editor executable jar file
        "batik-svgpathparser-1.7.jar", 
        "jnlp.jar"}));
    if (!System.getProperty("os.name").startsWith("Mac OS X")
        || System.getProperty("java.version").startsWith("1.5")
        || System.getProperty("java.version").startsWith("1.6")) {
      extensionJarsAndDlls.addAll(Arrays.asList(new String [] {
          "j3dcore.jar", // Main Java 3D jars
          "vecmath.jar",
          "j3dutils.jar",
          "macosx/gluegen-rt.jar", // Mac OS X jars and DLLs
          "macosx/jogl.jar",
          "macosx/libgluegen-rt.jnilib",
          "macosx/libjogl.jnilib",
          "macosx/libjogl_awt.jnilib",
          "macosx/libjogl_cg.jnilib"}));
    } else {
      extensionJarsAndDlls.addAll(Arrays.asList(new String [] {
          "macosx/java3d-1.6/j3dcore.jar", // Mac OS X Java 3D 1.6 jars and DLLs
          "macosx/java3d-1.6/vecmath.jar",
          "macosx/java3d-1.6/j3dutils.jar",
          "macosx/java3d-1.6/gluegen.jar", 
          "macosx/java3d-1.6/jogl-all.jar",
          "macosx/java3d-1.6/libgluegen-rt.jnilib",
          "macosx/java3d-1.6/libjogl_desktop.jnilib",
          "macosx/java3d-1.6/libnativewindow_awt.jnilib",
          "macosx/java3d-1.6/libnativewindow_macosx.jnilib"}));
      // Disable JOGL library loader
      System.setProperty("jogamp.gluegen.UseTempJarCache", "false");
      System.setProperty("com.eteks.sweethome3d.j3d.useOffScreen3DView", "true");
    }
    if ("64".equals(System.getProperty("sun.arch.data.model"))) {
      extensionJarsAndDlls.add("linux/x64/libj3dcore-ogl.so"); // Linux 64 bits DLLs
      extensionJarsAndDlls.add("windows/x64/j3dcore-ogl.dll"); // Windows 64 bits DLLs
    } else {
      extensionJarsAndDlls.addAll(Arrays.asList(new String [] {
          "linux/i386/libj3dcore-ogl.so", // Linux 32 bits DLLs
          "linux/i386/libj3dcore-ogl-cg.so", // Windows 32 bits DLLs
          "windows/i386/j3dcore-d3d.dll",
          "windows/i386/j3dcore-ogl.dll",
          "windows/i386/j3dcore-ogl-cg.dll",
          "windows/i386/j3dcore-ogl-chk.dll"}));
    }
    
    String [] applicationPackages = {
        "com.eteks.sweethome3d",
        "com.eteks.furniturelibraryeditor",
        "javax.media.j3d",
        "javax.vecmath",
        "com.sun.j3d",
        "com.sun.opengl",
        "com.sun.gluegen.runtime",
        "com.jogamp",
        "jogamp",
        "javax.media.opengl",
        "javax.media.nativewindow",
        "javax.media.opengl",
        "com.microcrowd.loader.java3d"};
    String applicationClassName = "com.eteks.furniturelibraryeditor.FurnitureLibraryEditor";
    ClassLoader java3DClassLoader = System.getProperty("os.name").startsWith("Windows")
        ? new ExtensionsClassLoader(
            furnitureLibraryEditorBootstrapClass.getClassLoader(), 
            furnitureLibraryEditorBootstrapClass.getProtectionDomain(),
            extensionJarsAndDlls.toArray(new String [extensionJarsAndDlls.size()]), null, applicationPackages,
            // Use cache under Windows because temporary files tagged as deleteOnExit can't 
            // be deleted if they are still opened when program exits 
            new File(System.getProperty("java.io.tmpdir")), applicationClassName + "-cache-")  
        : new ExtensionsClassLoader(
            furnitureLibraryEditorBootstrapClass.getClassLoader(), 
            furnitureLibraryEditorBootstrapClass.getProtectionDomain(),
            extensionJarsAndDlls.toArray(new String [extensionJarsAndDlls.size()]), applicationPackages);  
    
    Class<?> applicationClass = java3DClassLoader.loadClass(applicationClassName);
    Method applicationClassMain = 
        applicationClass.getMethod("main", Array.newInstance(String.class, 0).getClass());
    // Call application class main method with reflection
    applicationClassMain.invoke(null, new Object [] {args});
  }
}