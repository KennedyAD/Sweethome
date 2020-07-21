SWEET HOME 3D JS v 6.4
----------------------

This archive contains source code of Sweet Home 3D JS, a HTML5 3D viewer 
for Sweet Home 3D files saved with version 5.3 or a more recent version.

You may also download this source code with the following SVN command:

svn checkout https://svn.code.sf.net/p/sweethome3d/code/tags/V_6_4/SweetHome3DJS SweetHome3DJS


As this project depends on Sweet Home 3D, download and install also Sweet Home 3D source code from 
http://prdownloads.sourceforge.net/sweethome3d/SweetHome3D-6.4-src.zip 
or with the following SVN command: 

svn checkout https://svn.code.sf.net/p/sweethome3d/code/tags/V_6_4/SweetHome3D SweetHome3D


HOW TO USE THIS SOURCE CODE
---------------------------

JavaScript code of this project is compatible with HTML5 / WebGL, and the directory where
you find this README.TXT file contains all the information required to run the code.

Part of the JavaScript code required to run examples is generated from Sweet Home 3D Java code 
with JSweet transpiler available at http://www.jsweet.org
To generate the missing JavaScript code and run tests, install JDK 8, Node available 
at https://nodejs.org/ and Ant available at http://ant.apache.org/ then run ant command in the 
directory where you uncompressed this archive followed by the "generatedLibraries" target name.
The generatedLibraries target will create missing JavaScript code in lib/generated 
and required to run the HTML files found in the test directory of this archive 
with any compatible browser. 

The default target provided by build.xml Ant file concatenates .js files by license type, 
minifies them, and generates in install subdirectory a SweetHome3DJSViewer ZIP file 
that contains minified JavaScript code and HTML files you may use for your own web site. 

The main other target named "applicationBuild" provided by build.xml Ant file generates 
a web application .war file in install subdirectory, which you may deploy in a JSP server like Tomcat.
This web application will let you create and modify in a browser the home plan passed in the parameter 
"home" of index.jsp page. Changes in a home edited with in this application are automatically saved 
by the service in writeHomeEdits.jsp and read by the service readHome.jsp.  

Read build.xml Ant file for more information about other available targets. 

Read LICENSE.TXT file for more details about licenses applicable to this software
and included materials developed by third parties.
    
    
Sweet Home 3D, Copyright (c) 2016-2020 Emmanuel PUYBARET / eTeks. 
Distributed under GNU General Public License    