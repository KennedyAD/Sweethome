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
<%@page import="java.nio.file.attribute.FileAttribute"%>
<%@page import="com.eteks.sweethome3d.io.HomeFileRecorder"%>
<%@page import="com.eteks.sweethome3d.model.Home"%>
<%@ page import="java.util.*" %>
<%@ page import="java.io.*" %>
<%@page import="java.nio.file.*"%>
<%
out.clear();
String homeName = request.getParameter("home");

if (homeName != null) {
  String homesFolder = getServletContext().getRealPath("/homes");
  File file = new File(homesFolder, homeName + ".sh3d");
  if (!file.exists()) {
	new HomeFileRecorder(9, false, null, false, true).writeHome(new Home(), file.getPath());
  }
  
  // Create a copy of the file and store it as a session attribute
  Path tempFile = Files.createTempFile("open-", ".sh3d");
  Files.copy(file.toPath(), tempFile, StandardCopyOption.REPLACE_EXISTING);
  File previousOpenedFile = (File)request.getSession().getAttribute(file.getCanonicalPath());
  if (previousOpenedFile != null) {
    previousOpenedFile.delete();
  }
  request.getSession().setAttribute(file.getCanonicalPath(), tempFile.toFile());
  // TODO When temporary files should be deleted?
  
  response.setIntHeader("Content-length", (int) file.length());
  response.setHeader("Content-Disposition", "attachment; filename=" + file.getName());
  InputStream input = null;
  OutputStream output = response.getOutputStream();
  try {
    input = new FileInputStream(file);
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