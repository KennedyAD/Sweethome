package com.eteks.sweethome3d.jsweet;

import org.jsweet.JSweetCommandLineLauncher;

/**
 * A class to transpile the Sweet Home 3D Java source code to JavaScript.
 * 
 * @author Renaud Pawlak
 */
public class SweetHome3DTranspiler {

  public static void main(String[] args) {

    System.setProperty("java.ext.dirs", "../SweetHome3D/lib");
    System.setProperty("transpilationTarget", "SweetHome3DJSViewer");
    JSweetCommandLineLauncher.main(new String[] { "-h", "-v", //
        "-b", //
        "--workingDir", "tools/JSweet/build/jsweet.tmp", //
        "--factoryClassName", "com.eteks.sweethome3d.jsweet.SweetHome3DJSweetFactory", //
        "--header", "tools/JSweet/header.txt", //
        "--tsout", "tools/JSweet/build/ts", //
        "-o", "tools/JSweet/build/js", //
        "--classpath",
        "tools/JSweet/lib/jsweet-core-5-20170726.jar:tools/JSweet/lib/bigjs-3.1.0-20170726.jar:tools/JSweet/lib/j4ts-awtgeom-1.8.132-20170726.jar:tools/JSweet/lib/j4ts-swingundo-1.8.132-20170726.jar:../SweetHome3D/libtest/AppleJavaExtensions.jar", //
        "--declaration", //
        "--jdkHome", System.getProperty("java.home"), //
        "--encoding", "ISO-8859-1", //
        "--candiesJsOut", "tools/JSweet/build/js", //
        "-i", "../SweetHome3D/src:tools/JSweet/src", //
        "--includes",
        "def:com/eteks/sweethome3d/model:com/eteks/sweethome3d/tools:com/eteks/sweethome3d/viewcontroller:com/eteks/sweethome3d/io" });

  }

}
