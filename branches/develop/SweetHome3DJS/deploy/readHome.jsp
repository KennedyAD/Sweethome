<!--
   readHome.jsp 
   
   Sweet Home 3D, Copyright (c) 2016-2020 Emmanuel PUYBARET / eTeks <info@eteks.com>
   
   This program is free software; you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation; either version 2 of the License, or
   (at your option) any later version.
 
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
-->
<%@ page import="java.util.*" %>
<%@ page import="java.io.*" %>
<%@page import="java.nio.file.*"%>
<%@page import="java.nio.file.attribute.FileAttribute"%>
<%@page import="java.util.zip.*"%>
<%@page import="com.eteks.sweethome3d.model.Home"%>
<%@page import="com.eteks.sweethome3d.io.HomeServerRecorder"%>
<%
  out.clear();
String homeName = request.getParameter("home");

if (homeName != null) {
  String homesFolder = getServletContext().getRealPath("/homes");
  File homeFile = new File(homesFolder, homeName + ".sh3d");
  if (!homeFile.exists()) {
    // Create a new empty home
    new HomeServerRecorder(9, null).writeHome(new Home(), homeFile.getPath());
  }
  
  Path referenceCopy = null;
  if (HomeServerRecorder.isFileWithContent(homeFile)) {
    // Create a copy of the file and store it as a session attribute
    // to be able to reference some of its content during edition
    referenceCopy = Files.createTempFile("open-", ".sh3d");
    Files.copy(homeFile.toPath(), referenceCopy, StandardCopyOption.REPLACE_EXISTING);
  }
  
  File previousOpenedFile = (File)request.getSession().getAttribute(homeFile.getCanonicalPath());
  if (previousOpenedFile != null) {
    previousOpenedFile.delete();
  }
  if (referenceCopy != null) {
    request.getSession().setAttribute(homeFile.getCanonicalPath(), referenceCopy.toFile());
    // TODO How to handle homes saved once the session has expired ?
    // TODO Delete temporary files when user quits 
  }
  
  response.setIntHeader("Content-length", (int)homeFile.length());
  response.setHeader("Content-Disposition", "attachment; filename=" + homeFile.getName());
  InputStream input = null;
  OutputStream output = response.getOutputStream();
  try {
    input = new FileInputStream(homeFile);
    byte[] buffer = new byte[8096];
    int size;
    while ((size = input.read(buffer)) != -1) {
      output.write(buffer, 0, size);
    }
  } finally {
    if (input != null) {
      input.close();
    }
    if (output != null) {
      output.close();
    }
  }
}
%>