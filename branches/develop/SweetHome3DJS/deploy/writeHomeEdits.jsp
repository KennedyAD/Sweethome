<!--
   writeHomeEdits.jsp 
   
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
<%@page import="javax.swing.undo.UndoableEdit"%>
<%@page import="java.util.*" %>
<%@page import="java.io.*" %>
<%@page import="com.eteks.sweethome3d.model.*" %>
<%@page import="com.eteks.sweethome3d.io.*" %>
<%@page import="com.eteks.sweethome3d.viewcontroller.*" %>
<% out.clear();
   String homeName = request.getParameter("home");
   String jsonEdits = request.getParameter("edits");
   String url = request.getRequestURL().toString();
   String baseUrl = url.substring(0, url.length() - request.getRequestURI().length());   
   File file = null;
   int count = 0;
   
   if (homeName != null) {
       file = new File(new File(getServletContext().getRealPath("/")).getParentFile(),
               homeName.endsWith(".sh3d") ? homeName : homeName + ".sh3d");

		   HomeRecorder recorder = new HomeFileRecorder(0, false, null, false, true);
		   Home home = recorder.readHome(file.getPath());

		    List<UndoableEdit> edits = new HomeEditsDeserializer(home, baseUrl).deserializeEdits(jsonEdits);
        for(UndoableEdit edit : edits) {
          edit.redo();
          count++;
        }
        recorder.writeHome(home, file.getPath());
        
   } %>
Wrote <%= count %> edits to <%= file %>.
