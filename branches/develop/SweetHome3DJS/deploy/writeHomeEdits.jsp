<%--
   writeHomeEdits.jsp 
   
   Sweet Home 3D, Copyright (c) 2020 Emmanuel PUYBARET / eTeks <info@eteks.com>
   
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
<%@page import="java.io.*" %>
<%@page import="java.net.URL"%>
<%@page import="java.util.*" %>
<%@page import="java.nio.file.*"%>
<%@page import="javax.swing.undo.UndoableEdit"%>
<%@page import="com.eteks.sweethome3d.model.*" %>
<%@page import="com.eteks.sweethome3d.io.*" %>
<%@page import="com.eteks.sweethome3d.viewcontroller.*" %>
<% out.clear();
   request.setCharacterEncoding("UTF-8");
   String homeName = request.getParameter("home");
   String jsonEdits = request.getParameter("edits");
   URL serverBaseUrl = new URL(request.getScheme(), request.getServerName(), request.getServerPort(), request.getContextPath());
   int count = 0;
   
   if (homeName != null) {
     String homesFolder = getServletContext().getRealPath("/homes");
     File   homeFile = new File(homesFolder, homeName + ".sh3d");

     // Retrieve home file copy stored in session attribute
     File referenceCopy = (File)request.getSession().getAttribute(homeFile.getCanonicalPath());     

     if (referenceCopy != null
         || !HomeServerRecorder.isFileWithContent(homeFile)) {
       // Get home recorder stored as an application attribute
       HomeRecorder homeServerRecorder = (HomeRecorder)getServletContext().getAttribute("homeServerRecorder");
       if (homeServerRecorder == null) {
         UserPreferences preferences = new ServerUserPreferences(
             new URL [] {new URL(serverBaseUrl, "lib/resources/DefaultFurnitureCatalog.json")}, serverBaseUrl,
             new URL [] {new URL(serverBaseUrl, "lib/resources/DefaultTexturesCatalog.json")}, serverBaseUrl);
         homeServerRecorder = new HomeServerRecorder(0, preferences);
         getServletContext().setAttribute("homeServerRecorder", homeServerRecorder);
       }

       synchronized (homeFile.getAbsolutePath().intern()) {
         // Reading a given home then saving it can't be done in two different threads at the same moment   
         Home home = homeServerRecorder.readHome(homeFile.getPath());
         List<UndoableEdit> edits = new HomeEditsDeserializer(home, referenceCopy, serverBaseUrl.toString()).deserializeEdits(jsonEdits);
         count = HomeEditsDeserializer.applyEdits(edits);
         homeServerRecorder.writeHome(home, homeFile.getPath());
       }
%>
Wrote <%= count %> edits to <%= homeFile %>.
<%       
     } else {
       throw new ServletException(homeName + " not opened by client");
     } 
   }
%>
