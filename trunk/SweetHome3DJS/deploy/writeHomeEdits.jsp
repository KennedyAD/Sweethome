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
<%@ page import="java.io.*" %>
<%@ page import="java.net.URL"%>
<%@ page import="java.util.*" %>
<%@ page import="java.nio.file.*"%>
<%@ page import="javax.swing.undo.UndoableEdit"%>
<%@ page import="com.eteks.sweethome3d.model.UserPreferences" %>
<%@ page import="com.eteks.sweethome3d.io.*" %>
<% out.clear();
   request.setCharacterEncoding("UTF-8");
   String homeName = request.getParameter("home");
   String updateId = request.getParameter("updateId");
   String jsonEdits = request.getParameter("edits");
   URL serverBaseUrl = new URL(request.getScheme(), request.getServerName(), request.getServerPort(), request.getContextPath() + "/");
   int count = 0;
   if (homeName != null) {
     String homesFolder = getServletContext().getRealPath("/homes");
     File   homeFile = new File(homesFolder, homeName + ".sh3d");

     // Retrieve home file copy stored in session attribute
     File referenceCopy = (File)request.getSession().getAttribute(homeFile.getCanonicalPath());
     String readHomeRequest = "readHome.jsp?home=";
     if (referenceCopy != null
         || !homeFile.exists()
         || !HomeServerRecorder.isFileWithContent(homeFile)) {
       // Get preferences stored as an application attribute
       UserPreferences serverUserPreferences = (UserPreferences)getServletContext().getAttribute("serverUserPreferences");
       if (serverUserPreferences == null) {
         serverUserPreferences = new ServerUserPreferences(
             new URL [] {new URL(serverBaseUrl, "lib/resources/DefaultFurnitureCatalog.json")}, serverBaseUrl,
             new URL [] {new URL(serverBaseUrl, "lib/resources/DefaultTexturesCatalog.json")}, serverBaseUrl);
         getServletContext().setAttribute("serverUserPreferences", serverUserPreferences);
       }

       // Reading a given home then saving it can't be done in two different threads at the same moment   
       synchronized (homeFile.getCanonicalPath().intern()) {
         if (updateId.equals(request.getSession().getAttribute("lastUpdateId"))) {
           // If the same update is requested, ignore it and return last count  
           count = (Integer)request.getSession().getAttribute("lastEditCount");
         } else {
           HomeServerRecorder recorder = new HomeServerRecorder(homeFile, serverUserPreferences);
           HomeEditsDeserializer deserializer = new HomeEditsDeserializer(recorder.getHome(), referenceCopy, serverBaseUrl.toString(), readHomeRequest);
           List<UndoableEdit> edits = deserializer.deserializeEdits(jsonEdits);
           count = deserializer.applyEdits(edits);
           recorder.writeHome(homeFile, 0);
           
           // Store update id and edit count to avoid excuting the same update twice 
           // (it looks like some browsers, mainly Chrome, may send the same request twice) 
           request.getSession().setAttribute("lastUpdateId", updateId);
           request.getSession().setAttribute("lastEditCount", count);
         }
       }
%>
{ "result": <%= count %> }
<%       
     } else {
       throw new ServletException(homeName + " not opened by client");
     } 
   }
%>
