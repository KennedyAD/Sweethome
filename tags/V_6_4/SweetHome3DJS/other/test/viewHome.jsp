<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<%@ page import="javax.naming.*" %>
<%@ page import="java.sql.*" %>
<%@ page import="javax.sql.*" %>
<%@ include file ="/WEB-INF/jspf/userRegistrationID.jspf" %>
<% // Retrieve title and comment
   String title = null;
   String comment = null;
   float  roundsPerMinute = 0;
   String id = request.getParameter("id");
   if (id != null && id.length() > 0) {
     Context context = new InitialContext();
     final DataSource dataSource = (DataSource)context.lookup("java:comp/env/jdbc/DataSource");
     Connection connection = dataSource.getConnection();
     PreparedStatement statement = connection.prepareStatement(
         "SELECT title, comment, userId, shared, roundsPerMinute FROM exportedHome WHERE exportedHome.id = ?");
     statement.setString(1, id);
     ResultSet resultSet = statement.executeQuery();
     if (resultSet.next()) { 
       String userId = resultSet.getString(3);
       boolean shared = resultSet.getInt(4) > 0;
       if (shared
           || userRegistrationID.trim().equals(userId)) {
         title = removeLinksAndScripts(resultSet.getString(1));
         comment = removeLinksAndScripts(resultSet.getString(2));
         roundsPerMinute = resultSet.getFloat(5);
       }
     } 
     resultSet.close();
     statement.close();
     connection.close();
   } %>
<%! private String removeLinksAndScripts(String s) {
      return s == null ? null : s.replaceAll("(?i)(<a.*?</a>|<a.*?>|<.*?script.*?>.*?</.*?script.*?>|<.*?script.*?>?)|\\son.+='.*'|\\son.+=\".*\"", "");
    } %>
<head>
<title>Sweet Home 3D : View <%= title != null && title.trim().length() > 0 ? title : "home" %></title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<link rel="alternate" type="application/rss+xml" title="RSS" href="/blog/rss.xml" />
<link href="/sweethome3d.css" rel="stylesheet" type="text/css">
<script type="text/javascript" src="/SweetHome3D.js"></script>

<script type="text/javascript" src="lib/big.min.js"></script>
<script type="text/javascript" src="lib/gl-matrix-min.js"></script>
<script type="text/javascript" src="lib/jszip.min.js"></script>

<script type="text/javascript" src="lib/core.js"></script>
<script type="text/javascript" src="lib/URLContent.js"></script>
<script type="text/javascript" src="lib/scene3d.js"></script>
<script type="text/javascript" src="lib/HTMLCanvas3D.js"></script>
<script type="text/javascript" src="lib/ModelManager.js"></script>
<script type="text/javascript" src="lib/ModelLoader.js"></script>
<script type="text/javascript" src="lib/OBJLoader.js"></script>
<script type="text/javascript" src="lib/Triangulator.js"></script>

<script type="text/javascript" src="lib/geom.js"></script>
<script type="text/javascript" src="lib/CollectionEvent.js"></script>
<script type="text/javascript" src="lib/CollectionChangeSupport.js"></script>
<script type="text/javascript" src="lib/CatalogPieceOfFurniture.js"></script>
<script type="text/javascript" src="lib/CatalogTexture.js"></script>
<script type="text/javascript" src="lib/HomeObject.js"></script>
<script type="text/javascript" src="lib/HomePieceOfFurniture.js"></script>
<script type="text/javascript" src="lib/HomeFurnitureGroup.js"></script>
<script type="text/javascript" src="lib/Camera.js"></script>
<script type="text/javascript" src="lib/ObserverCamera.js"></script>
<script type="text/javascript" src="lib/HomeMaterial.js"></script>
<script type="text/javascript" src="lib/HomeTexture.js"></script>
<script type="text/javascript" src="lib/TextStyle.js"></script>
<script type="text/javascript" src="lib/HomeEnvironment.js"></script>
<script type="text/javascript" src="lib/Level.js"></script>
<script type="text/javascript" src="lib/SelectionEvent.js"></script>
<script type="text/javascript" src="lib/Home.js"></script>
<script type="text/javascript" src="lib/HomeRecorder.js"></script>
<script type="text/javascript" src="lib/HomeComponent3D.js"></script>
<script type="text/javascript" src="lib/Object3DBranch.js"></script>
<script type="text/javascript" src="lib/HomePieceOfFurniture3D.js"></script>
<script type="text/javascript" src="lib/HomeController3D.js"></script>
<script type="text/javascript" src="lib/TextureManager.js"></script>
<script type="text/javascript" src="lib/UserPreferences.js"></script>
<script type="text/javascript" src="lib/LengthUnit.js"></script>
<script type="text/javascript" src="lib/viewHome.js"></script>

<%-- Make canvas fill all the main space --%>
<style type="text/css">
.menuCell {
	padding: 0;
}
.printerCell {
	padding-top: 0; 
	padding-right: 0;
}
.translationsCell {
	padding-top: 0; 
	padding-right: 0;
}
.mainCell {
	padding-top: 0; 
	padding-right: 0; 
	padding-bottom: 5px;
}
.mainFooter {
	margin-top: 0;
	margin-bottom: -5px; 
	background-image: url("/images/decoration/headerBackground.gif");
	background-repeat: repeat-x;
	width: 100%
}
.noselect {
	-webkit-touch-callout: none; 
	-webkit-user-select: none;   
	-khtml-user-select: none;    
	-moz-user-select: none;      
	-ms-user-select: none;       
	user-select: none;           
}
.navigationButton {
	font-weight: bold; 
	font-size: larger;
	width: 100%
}
</style>
</head>

<body>
<jsp:include page="/WEB-INF/jspf/header.jsp"/>
<jsp:include page="/WEB-INF/jspf/mainStart.jsp">
  <jsp:param name="displayMenu" value="false"/>
  <jsp:param name="displayAvailableTranslations" value="false"/>
</jsp:include>

<div>
  <canvas id="viewerCanvas" class="noselect" width="600" height="400"
          style="background-color: #777777; outline:none" tabIndex="1"></canvas>
  <div id="title" style="position: absolute; left: 80px; right: 80px; text-align: center;">
    <h1 class="noSelect" style="display: <%= title == null || title.length() == 0 ? "none" : "inline-block" %>; margin-top: 5px; background-color: rgba(128, 128, 128, 0.33); padding: 5px; border-radius: 5px"><%= title %></h1>
  </div>
  <img id="closeButton" src="/libjs/close.png" style="position: absolute; right: 0px" onclick="hideControls()" title="Hide controls and comments">
  <div id="viewerProgressDiv" style="width: 50%; position: absolute; top: 45%; left: 24%; background-color: rgba(128, 128, 128, 0.7); padding: 20px; border-radius: 25px">
    <progress id="viewerProgress"  class="viewerComponent" value="0" max="200" style="width: 100%"></progress>
    <label id="viewerProgressLabel" class="viewerComponent" style="margin-top: 2px; display: block; margin-left: 10px"></label>
  </div>
  <div id="comment" style="position: absolute; left: 50%; right: 5px; text-align: right; bottom: 25px">
    <div class="noSelect" style="display: <%= comment == null || comment.length() == 0 ? "none" : "inline-block" %>; background-color: rgba(128, 128, 128, 0.33); padding: 5px; border-radius: 5px"><%= comment %></div>
  </div>
  <div id="switchDiv" style="position: absolute; left: 5px; bottom: 30px;">
    <input id="aerialView"  class="viewerComponent" name="cameraType" type="radio" style="visibility: hidden; vertical-align: baseline" />
      <label class="viewerComponent" for="aerialView" style="visibility: hidden">Aerial view</label>
    <input id="virtualVisit" class="viewerComponent" name="cameraType" type="radio" style="visibility: hidden; vertical-align: baseline"/>
      <label class="viewerComponent" for="virtualVisit" style="visibility: hidden">Virtual visit</label>
    <select id="levelsAndCameras" class="viewerComponent" style="visibility: hidden;"></select>
  </div>
</div>

<script type="text/javascript">
  window.onresize = function(ev) {
    var canvas = document.getElementById("viewerCanvas");
    canvas.width = self.innerWidth;
    canvas.height = self.innerHeight - canvas.getBoundingClientRect().top 
        - document.getElementById("mainFooter").getBoundingClientRect().height;
    document.getElementById("title").style.top = canvas.getBoundingClientRect().top + "px";
    document.getElementById("closeButton").style.top = canvas.getBoundingClientRect().top + "px";
    document.getElementById("switchDiv").style.bottom = 
    document.getElementById("comment").style.bottom = (document.getElementById("mainFooter").getBoundingClientRect().height + 5) + "px";
  }
  
  var homeComponent;
  window.onload = function(ev) {
    window.onresize(ev);
    
    var homeUrl = '/online/readExportedHome.jsp?id=<%= request.getParameter("id") %>';
    var onerror = function(err) {
        document.getElementById("viewerProgress").style.visibility = "hidden";
        if (err == "No WebGL") {
          document.getElementById("viewerProgressLabel").innerHTML = "<div style='text-align: center; font-weight: bold;'>Sorry, your browser doesn't support WebGL.</div>";
        } else if (err instanceof Error 
      		     && err.message.indexOf("403 while requesting") === 0) {
          document.getElementById("viewerProgressLabel").innerHTML = "<div style='text-align: center; font-weight: bold;'>This document is not shared.</div>";
        } else if (err instanceof Error 
   		         && err.message.indexOf("404 while requesting") === 0) {
          document.getElementById("viewerProgressLabel").innerHTML = "<div style='text-align: center; font-weight: bold;'>This document doesn't exist.</div>";
        } else {    	  
          console.log(err.stack);
          document.getElementById("viewerProgressLabel").innerHTML = "<div style='text-align: center;'>" + "Error: " + (err.message  ? err.constructor.name + " " +  err.message  : err) + "</div>";
        }
      };
    var onprogression = function(part, info, percentage) {
        var progress = document.getElementById("viewerProgress"); 
        if (part === HomeRecorder.READING_HOME) {
          // Home loading is finished 
          progress.value = percentage * 100;
          info = "";
        } else if (part === ModelLoader.READING_MODEL) {
          // Models loading is finished 
          progress.value = 100 + percentage * 100;
          if (percentage === 1) {
            document.getElementById("viewerProgressDiv").style.visibility = "hidden";
          }
        }
      
        document.getElementById("viewerProgressLabel").innerHTML = 
            (percentage ? Math.floor(percentage * 100) + "% " : "") + part + " " + info;
      };
    
    homeComponent = viewHome("viewerCanvas", homeUrl, onerror, onprogression,      
        {roundsPerMinute: <%= roundsPerMinute %>,                     
         navigationPanel: (!/ipad|iphone|ipod|android/.test(navigator.userAgent.toLowerCase()) || !!window.MSStream) 
             ? "default" 
             : (/android/.test(navigator.userAgent.toLowerCase()) 
                   ? "<table style='margin-left: 5px; margin-top: 15px;'><tr><td><button data-simulated-key='UP' class='noselect navigationButton'>Forward &uarr;</button></td></tr><tr><td><button data-simulated-key='DOWN' style='margin-top:5px;' class='noselect navigationButton'>Backward &darr;</button></td></tr></table>" 
                   : "none"),             
         aerialViewButtonId: "aerialView",     
         virtualVisitButtonId: "virtualVisit",  
         levelsAndCamerasListId: "levelsAndCameras"
        });
  }
   
  function hideControls() {
    document.getElementById("closeButton").style.display = "none";
    document.getElementById("switchDiv").style.display = "none";
    document.getElementById("title").style.display = "none";
    document.getElementById("comment").style.display = "none";
    homeComponent.getUserPreferences().setNavigationPanelVisible(false);
  }
</script>

<jsp:include page="/WEB-INF/jspf/mainEnd.jsp">
  <jsp:param name="displayButtons" value="false"/>
</jsp:include>
</body>
</html>
