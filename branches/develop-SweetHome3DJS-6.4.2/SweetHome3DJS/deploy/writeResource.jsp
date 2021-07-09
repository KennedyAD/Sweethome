<%--
   writeResource.jsp
   
   Sweet Home 3D, Copyright (c) 2021 Emmanuel PUYBARET / eTeks <info@eteks.com>
   
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
--%>
<%@ page import="java.io.*" %>
<%@ page import="java.net.URL"%>
<%@ page import="java.util.*" %>
<%@ page import="java.nio.file.*"%>
<%@ page import="javax.swing.undo.UndoableEdit"%>
<%@ page import="com.eteks.sweethome3d.model.UserPreferences" %>
<%@ page import="com.eteks.sweethome3d.io.*" %>
<% out.clear();
   request.setCharacterEncoding("UTF-8");

   String contentType = request.getContentType();

   InputStream inputStream = request.getInputStream();
   int formDataLength = request.getContentLength();

   final int BUFFER_SIZE = 4096;

   File outputFile = new File(getServletContext().getRealPath("/userResources"), request.getParameter("path"));
   outputFile.getParentFile().mkdirs();
   System.out.println(outputFile.getCanonicalPath());
   try (OutputStream outputStream = new BufferedOutputStream(new FileOutputStream(outputFile), BUFFER_SIZE)) {
      int bytesRead;
      byte[] buffer = new byte[BUFFER_SIZE];
      int totalBytesRead = 0;
      while (totalBytesRead < formDataLength) {
         bytesRead = inputStream.read(buffer, 0, BUFFER_SIZE);
         totalBytesRead += bytesRead;
         outputStream.write(buffer, 0, bytesRead);
      }
   }
   System.out.println("written to " + outputFile);

%>
