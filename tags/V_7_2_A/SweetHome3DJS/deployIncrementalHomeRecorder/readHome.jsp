<%--
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
--%>
<%@ page import="java.util.*" %>
<%@ page import="java.io.*" %>
<%@ page import="java.nio.file.*"%>
<%@ page import="java.nio.file.attribute.FileAttribute"%>
<%@ page import="com.eteks.sweethome3d.io.HomeServerRecorder"%>
<% out.clear();
   request.setCharacterEncoding("UTF-8");
   String homeName = request.getParameter("home");

   if (homeName != null) {
     String homesFolder = getServletContext().getRealPath("/homes");
     File homeFile = new File(homesFolder, homeName + ".sh3d");
  
     byte [] homeFileContent;
     if (homeFile.exists()) {
       if (HomeServerRecorder.isFileWithContent(homeFile)) {
         // Create a copy of the file and store it as a session attribute
         // to be able to reference some of its content during edition
         Path referenceCopy = Files.createTempFile("open-", ".sh3d");
         Files.copy(homeFile.toPath(), referenceCopy, StandardCopyOption.REPLACE_EXISTING);
    
         File previousOpenedFile = (File)session.getAttribute(homeFile.getCanonicalPath());
         if (previousOpenedFile != null) {
           previousOpenedFile.delete();
         }
         session.setAttribute(homeFile.getCanonicalPath(), referenceCopy.toFile());
         homeFile = referenceCopy.toFile();
         // Temporary file deleted when user calls closeHome.jsp
       }
  
       synchronized (homeFile.getAbsolutePath().intern()) {
         try (InputStream input = new FileInputStream(homeFile);
              ByteArrayOutputStream output = new ByteArrayOutputStream()) {
           byte[] buffer = new byte[8096];
           int size;
           while ((size = input.read(buffer)) != -1) {
             output.write(buffer, 0, size);
           }
           homeFileContent = output.toByteArray();
         }
       }
     } else {
       homeFileContent = HomeServerRecorder.getNewHomeContent();
     }
  
     response.setIntHeader("Content-length", homeFileContent.length);
     response.setHeader("Content-Disposition", "attachment; filename=" + homeFile.getName());
     try (OutputStream servletOut = response.getOutputStream()) {
       servletOut.write(homeFileContent);
     }
   } %>