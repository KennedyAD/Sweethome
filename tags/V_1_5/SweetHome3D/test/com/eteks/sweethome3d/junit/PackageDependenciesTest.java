/**
 * PackageDependenciesTest.java
 */
package com.eteks.sweethome3d.junit;

import java.io.IOException;

import jdepend.framework.DependencyConstraint;
import jdepend.framework.JDepend;
import jdepend.framework.JavaPackage;
import jdepend.framework.PackageFilter;
import junit.framework.TestCase;

/**
 * Tests if dependencies between Sweet Home 3D packages are met.
 * @author Emmanuel Puybaret
 */
public class PackageDependenciesTest extends TestCase {
  /**
   * Tests that the package dependencies constraint is met for the analyzed packages.
   */
  public void testPackageDependencies() throws IOException {
    PackageFilter packageFilter = new PackageFilter();
    // Ignore Java packages and Swing sub packages
    packageFilter.addPackage("java.*");
    packageFilter.addPackage("javax.swing.*");
    // Ignore JUnit tests
    packageFilter.addPackage("com.eteks.sweethome3d.junit");
    // Ignore other test classes 
    packageFilter.addPackage("com.eteks.sweethome3d.test");
    packageFilter.addPackage("com.eteks.sweethome3d.utilities");
    
    JDepend jdepend = new JDepend(packageFilter);
    jdepend.addDirectory("classes");

    DependencyConstraint constraint = new DependencyConstraint();
    // Sweet Home 3D packages
    JavaPackage sweetHome3dModel = constraint.addPackage("com.eteks.sweethome3d.model");
    JavaPackage sweetHome3DTools = constraint.addPackage("com.eteks.sweethome3d.tools");
    JavaPackage sweetHome3DPlugin = constraint.addPackage("com.eteks.sweethome3d.plugin");
    JavaPackage sweetHome3DViewController = constraint.addPackage("com.eteks.sweethome3d.viewcontroller");
    JavaPackage sweetHome3DSwing = constraint.addPackage("com.eteks.sweethome3d.swing");
    JavaPackage sweetHome3DIO = constraint.addPackage("com.eteks.sweethome3d.io");
    JavaPackage sweetHome3DApplication = constraint.addPackage("com.eteks.sweethome3d");
    JavaPackage sweetHome3DApplet = constraint.addPackage("com.eteks.sweethome3d.applet");
    // Swing components packages
    JavaPackage swing = constraint.addPackage("javax.swing");
    JavaPackage imageio = constraint.addPackage("javax.imageio");
    // Java 3D
    JavaPackage java3d = constraint.addPackage("javax.media.j3d");
    JavaPackage vecmath = constraint.addPackage("javax.vecmath");
    JavaPackage sun3dLoaders = constraint.addPackage("com.sun.j3d.loaders");
    JavaPackage sun3dLoadersLw3d = constraint.addPackage("com.sun.j3d.loaders.lw3d");
    JavaPackage sun3dLoadersObj = constraint.addPackage("com.sun.j3d.loaders.objectfile");
    JavaPackage sun3dUtilsGeometry = constraint.addPackage("com.sun.j3d.utils.geometry");
    JavaPackage sun3dUtilsImage = constraint.addPackage("com.sun.j3d.utils.image");
    JavaPackage sun3dUtilsUniverse = constraint.addPackage("com.sun.j3d.utils.universe");
    JavaPackage loader3ds = constraint.addPackage("com.microcrowd.loader.java3d.max3ds");
    // iText for PDF
    JavaPackage iText = constraint.addPackage("com.lowagie.text");
    JavaPackage iTextPdf = constraint.addPackage("com.lowagie.text.pdf");
    // Java JNLP
    JavaPackage jnlp = constraint.addPackage("javax.jnlp");
    // Mac OS X specific interfaces
    JavaPackage eawt = constraint.addPackage("com.applet.eawt");
    JavaPackage eio = constraint.addPackage("com.applet.eio");

    // Describe dependencies : model don't have any dependency on
    // other packages, IO and View/Controller packages ignore each other
    // and Swing components and Java 3D use is isolated in sweetHome3DSwing
    sweetHome3DTools.dependsUpon(sweetHome3dModel);
    
    sweetHome3DPlugin.dependsUpon(sweetHome3dModel);
    sweetHome3DPlugin.dependsUpon(sweetHome3DTools);
    
    sweetHome3DViewController.dependsUpon(sweetHome3dModel);
    sweetHome3DViewController.dependsUpon(sweetHome3DTools);
    sweetHome3DViewController.dependsUpon(sweetHome3DPlugin);   
    
    sweetHome3DSwing.dependsUpon(sweetHome3dModel);
    sweetHome3DSwing.dependsUpon(sweetHome3DTools);
    sweetHome3DSwing.dependsUpon(sweetHome3DPlugin);   
    sweetHome3DSwing.dependsUpon(sweetHome3DViewController);
    sweetHome3DSwing.dependsUpon(swing);
    sweetHome3DSwing.dependsUpon(imageio);
    sweetHome3DSwing.dependsUpon(java3d);
    sweetHome3DSwing.dependsUpon(vecmath);
    sweetHome3DSwing.dependsUpon(sun3dLoaders);
    sweetHome3DSwing.dependsUpon(sun3dLoadersLw3d);
    sweetHome3DSwing.dependsUpon(sun3dLoadersObj);
    sweetHome3DSwing.dependsUpon(sun3dUtilsGeometry);
    sweetHome3DSwing.dependsUpon(sun3dUtilsImage);
    sweetHome3DSwing.dependsUpon(sun3dUtilsUniverse);
    sweetHome3DSwing.dependsUpon(loader3ds);
    sweetHome3DSwing.dependsUpon(iText);
    sweetHome3DSwing.dependsUpon(iTextPdf);
    sweetHome3DSwing.dependsUpon(jnlp);
    
    sweetHome3DIO.dependsUpon(sweetHome3dModel);
    sweetHome3DIO.dependsUpon(sweetHome3DTools);
    sweetHome3DIO.dependsUpon(eio);

    // Describe application and applet assembly packages
    sweetHome3DApplication.dependsUpon(sweetHome3dModel);
    sweetHome3DApplication.dependsUpon(sweetHome3DTools);
    sweetHome3DApplication.dependsUpon(sweetHome3DPlugin);
    sweetHome3DApplication.dependsUpon(sweetHome3DViewController);
    sweetHome3DApplication.dependsUpon(sweetHome3DSwing);
    sweetHome3DApplication.dependsUpon(sweetHome3DIO);
    sweetHome3DApplication.dependsUpon(swing);
    sweetHome3DApplication.dependsUpon(imageio);
    sweetHome3DApplication.dependsUpon(java3d);
    sweetHome3DApplication.dependsUpon(eawt);
    sweetHome3DApplication.dependsUpon(jnlp);
    
    sweetHome3DApplet.dependsUpon(sweetHome3dModel);
    sweetHome3DApplet.dependsUpon(sweetHome3DTools);
    sweetHome3DApplet.dependsUpon(sweetHome3DPlugin);
    sweetHome3DApplet.dependsUpon(sweetHome3DViewController);
    sweetHome3DApplet.dependsUpon(sweetHome3DSwing);
    sweetHome3DApplet.dependsUpon(sweetHome3DIO);
    sweetHome3DApplet.dependsUpon(swing);
    sweetHome3DApplet.dependsUpon(java3d);
    sweetHome3DApplet.dependsUpon(jnlp);
    
    jdepend.analyze();

    assertTrue("Dependency mismatch", jdepend.dependencyMatch(constraint));
  }
}