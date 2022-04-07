<%--
   closeHome.jsp 
   
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
<% out.clear();
   request.setCharacterEncoding("UTF-8");
   String homeName = request.getParameter("home");
   
   if (homeName != null) {
     String homesFolder = getServletContext().getRealPath("/homes");
     File   homeFile = new File(homesFolder, homeName + ".sh3d");

     // Retrieve home file copy stored in session attribute
     File referenceCopy = (File)session.getAttribute(homeFile.getCanonicalPath());     

     if (referenceCopy != null) {
       referenceCopy.delete();
       session.removeAttribute(homeFile.getCanonicalPath());     
     } 
%>
Closed <%= homeName %>.
<%       
   }
%>
