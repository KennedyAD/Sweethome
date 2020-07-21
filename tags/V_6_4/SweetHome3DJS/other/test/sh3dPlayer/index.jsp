<%@ page contentType="text/html; charset=UTF-8" %>
<%@ page import="java.net.*, java.io.*, java.text.*, java.util.*, java.util.zip.*, org.apache.commons.fileupload.*, org.apache.commons.fileupload.disk.*, org.apache.commons.fileupload.servlet.*, com.eteks.sweethome3d.io.*, com.eteks.sweethome3d.model.*" %>
<%@ include file ="/WEB-INF/jspf/userRegistrationID.jspf" %>
      
<% if ("read".equals(request.getParameter("action"))) {
      out.clear();
      String home = request.getParameter("home");
      File homeFile = new File(getServletContext().getRealPath("/../uploadedHomes") + "/" + home);
      if (home == null
         || !homeFile.exists()) {
        response.sendError(HttpServletResponse.SC_NOT_FOUND);
      } else {
        response.setContentType("application/SweetHome3D");
        response.setIntHeader("Content-length", (int)homeFile.length());
        response.setHeader("Content-Disposition", "attachment; filename=" + homeFile.getName());
        InputStream input = null;
        OutputStream output = response.getOutputStream();
        try {
          input = new FileInputStream(homeFile);
          byte [] buffer = new byte [8096];
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
      return;
    } %>

<%! private Map<String, java.util.Date> lastRequestDates = new HashMap<String, java.util.Date>(); 
    private Collator comparator = Collator.getInstance(); 
    private UserPreferences preferences; %>
    
<%  response.setHeader("Cache-Control","no-cache"); // HTTP 1.1
	response.setHeader("Pragma","no-cache"); // HTTP 1.0
	response.setDateHeader ("Expires", -1);
	userRegistrationID = userRegistrationID.trim();
	boolean guestUser = userRegistrationID.equals("0");
    int maxSize = 50;

    if ("list".equals(request.getParameter("action"))) {
     out.clear();
     if (guestUser) {
       out.print("{\"error\":10, \"message\":\"Unknown user\"}");
     } else {
       // Return files in uploadedHomes
       File userDirectory = new File(getServletContext().getRealPath("/../uploadedHomes/" + userRegistrationID)).getCanonicalFile();
       File files [] = userDirectory.listFiles(new FileFilter() {
           public boolean accept(File path) {
             return path.getName().toLowerCase().endsWith("sh3d");
           }
         });
       out.print("[");
       if (files != null) {
         comparator.setStrength(Collator.PRIMARY);
         Arrays.sort(files, new Comparator<File>() {
           	  public int compare(File f1, File f2) {
           	    return comparator.compare(f1.getName(), f2.getName());
           	  }
           });
         for (int i = 0; i < files.length; i++) { 
           String name = files [i].getName();
           if (i > 0) {
             out.print(",");
           } 
           out.print("\n{\"name\": \"" + name.replaceAll("\\\"", "\\\\\"") + "\", " 
                      + "\"file\": \"" + userRegistrationID + "/" + name.replaceAll("\\\"", "\\\\\"") + "\", " 
                      + "\"length\": " + files [i].length() + "}");
         } 
       }
       out.print("\n]");
    }
    return;
  } else if ("delete".equals(request.getParameter("action"))) {
     out.clear();
     String referer = request.getHeader("referer");
     String home = request.getParameter("home");
     if (userRegistrationID.equals("0")) {
       out.print("{\"error\":10, \"message\":\"Unknown user\"}");
     } else if (referer == null
                || referer.length() == 0
                || !home.startsWith(userRegistrationID + "/")
                || home.substring(home.indexOf('/') + 1).indexOf('/') >= 0) {
       out.print("{\"error\":11, \"message\":\"Can't delete without form\"}");
     } else if (home == null) {
       out.print("{\"error\":12, \"message\":\"Missing home\"}");
     } else {
       File homeFile = new File(getServletContext().getRealPath("/../uploadedHomes") + "/" + home);
       if (homeFile.delete()) {
         out.print("{\"home\": \"" + home + "\"}");
       } else {
         out.print("{\"error\":42, \"message\":\"File not deleted\"}");
       }
       return;
     }
   } else if ("upload".equals(request.getParameter("action"))) {
     out.clear();
     if (guestUser) {
       out.print("{\"error\":10, \"message\":\"Unknown user\"}");
     } else {     
       java.util.Date lastRequestDate = lastRequestDates.get(userRegistrationID);
       if (lastRequestDate != null
           && (System.currentTimeMillis() - lastRequestDate.getTime()) < 5000) {
         out.print("{\"error\":11, \"message\":\"Too small delay between requests by user\"}");
       } else if (!ServletFileUpload.isMultipartContent(request)) {
         out.print("{\"error\":20, \"message\":\"Request at incorrect format\"}");
       } else {
         lastRequestDates.put(userRegistrationID, new java.util.Date());
         try {
           // Create a factory for disk-based file items
           DiskFileItemFactory factory = new DiskFileItemFactory();
           factory.setSizeThreshold(1024);
           // Create a new file upload handler for files smaller than 15 MB
           ServletFileUpload upload = new ServletFileUpload(factory);
           upload.setHeaderEncoding("UTF-8");
           upload.setFileSizeMax(maxSize * 1024 * 1024);
           // Parse the request
           List<FileItem> items = upload.parseRequest(request);
           // Process simple form fields
           Integer homeId = null;
           Iterator<FileItem> it = items.iterator();
           while (it.hasNext()) {
             FileItem item = it.next();
             if ("home".equals(item.getFieldName())
                 && item.getName().length() > 0) {
               // Process the uploaded file 
               String homeName = item.getName();
               File userDirectory = new File(getServletContext().getRealPath("/../uploadedHomes/" + userRegistrationID)).getCanonicalFile();
               if (!userDirectory.exists()) {
                 if (!userDirectory.mkdirs()) {
                   out.print("{\"error\":30, \"message\":\"Can't create directory to store home\"}");
                   return;
                 }
               } 
               File [] files = userDirectory.listFiles();
               if (files != null && files.length > 100) {
                 out.print("{\"error\":37, \"message\":\"Exported homes count exceeds limit\"}"); 
                 return;
               }
               File homeFile = new File(userDirectory, homeName);
               File tempHomeFile = null;
               try {
                 tempHomeFile = File.createTempFile("home-", ".sh3d", userDirectory);
                 item.write(tempHomeFile);
               } catch (Exception ex) {
                 if (tempHomeFile != null) {
                   tempHomeFile.delete();
                 }
                 out.print("{\"error\":24, \"message\":\"Can't write uploaded file / " + ex.getClass() + "\"}");
                 return;
               }
               
               // Optional part: read home with Sweet Home 3D API and write it in homeFile to ensure it contains a Home.xml entry 
               DefaultHomeOutputStream homeOut = null;
               try {
                 if (this.preferences == null) {
                   this.preferences = new com.eteks.sweethome3d.applet.AppletUserPreferences(
                       new URL [] {new URL("http://www.sweethome3d.com/online/furnitureCatalog.zip"), 
                                   new URL("http://www.sweethome3d.com/online/additionalFurnitureCatalog.zip")}, 
                       new URL("http://www.sweethome3d.com/models/"), 
                       new URL [] {new URL("http://www.sweethome3d.com/online/texturesCatalog.zip")}, 
                       new URL("http://www.sweethome3d.com/textures/"), 
                       null, null, null, "en");
                 }
                 // Read home to ensure it's valid and save it with XML entry to make it readable by SweetHome3DJS
                 DefaultHomeInputStream in = new DefaultHomeInputStream(tempHomeFile, ContentRecording.INCLUDE_ALL_CONTENT,
                     new HomeXMLHandler(preferences), preferences, false /* or true */); // preferences are useful only if content on the server should be referenced
                 Home home = in.readHome();
                 homeOut = new DefaultHomeOutputStream(new BufferedOutputStream(new FileOutputStream(homeFile)), 
                     9, ContentRecording.INCLUDE_ALL_CONTENT /* or ContentRecording.INCLUDE_TEMPORARY_CONTENT */, false, new HomeXMLExporter());
                 homeOut.writeHome(home);
               } catch (Exception ex) {
                 ex.printStackTrace();
                 out.print("{\"error\":42, \"message\":\"Not a valid Sweet Home 3D file\"}");
                 return;
               } finally {
                 if (homeOut != null) {
                   homeOut.close();
                 }
                 if (tempHomeFile != null) {
                   tempHomeFile.delete();
                 }
               }
               
               out.print("{\"name\": \"" + homeName.replaceAll("\\\"", "\\\\\"") + "\", " 
                        + "\"file\": \"" + userRegistrationID + "/" + homeName.replaceAll("\\\"", "\\\\\"") + "\"}");
               break;
             }
           }
         } catch (FileUploadBase.FileSizeLimitExceededException ex) {
           out.print("{\"error\":22, \"message\":\"Submitted file size exceeds limit\"}");
         } catch (FileUploadException ex) {
           ex.printStackTrace();
           out.print("{\"error\":23, \"message\":\"Can't handle request / " + ex.getClass() + "\"}");
         } 
       }
     }
     return;
   } %>
   
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<% if (request.getParameter("home") != null) {   
     // Viewer
     String home = request.getParameter("home"); %>
	<head>
	<title>Sweet Home 3D Player : <%= home.substring(home.indexOf('/') + 1) %></title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<link rel="alternate" type="application/rss+xml" title="RSS" href="/blog/rss.xml" />
	<link href="/sweethome3d.css" rel="stylesheet" type="text/css">
	<script type="text/javascript" src="/SweetHome3D.js"></script>
	<script type="text/javascript" src="/sh3dPlayerBeta/libjs/big.min.js"></script>
	<script type="text/javascript" src="/sh3dPlayerBeta/libjs/gl-matrix-min.js"></script>
	<script type="text/javascript" src="/sh3dPlayerBeta/libjs/jszip.min.js"></script>
	<script type="text/javascript" src="/sh3dPlayerBeta/libjs/jsXmlSaxParser.min.js"></script>
	<script type="text/javascript" src="/sh3dPlayerBeta/libjs/core.min.js"></script>
	<script type="text/javascript" src="/sh3dPlayerBeta/libjs/geom.min.js"></script>
	<script type="text/javascript" src="/sh3dPlayerBeta/libjs/batik-svgpathparser.min.js"></script>
	<script type="text/javascript" src="/sh3dPlayerBeta/libjs/triangulator.min.js"></script>
	<script type="text/javascript" src="/sh3dPlayerBeta/libjs/viewmodel.min.js"></script>
	<script type="text/javascript" src="/sh3dPlayerBeta/libjs/viewhome.min.js"></script>

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
		touch-action: none       
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
	  <img id="closeButton" src="/libjs/close.png" style="position: absolute; right: 0px" onclick="hideControls()" title="Hide controls and comments">
	  <div id="viewerProgressDiv" style="width: 50%; position: absolute; top: 45%; left: 24%; background-color: rgba(128, 128, 128, 0.7); padding: 20px; border-radius: 25px">
	    <progress id="viewerProgress"  class="viewerComponent" value="0" max="200" style="width: 100%"></progress>
	    <label id="viewerProgressLabel" class="viewerComponent" style="margin-top: 2px; display: block; margin-left: 10px"></label>
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
	    document.getElementById("closeButton").style.top = canvas.getBoundingClientRect().top + "px";
	    document.getElementById("switchDiv").style.bottom = (document.getElementById("mainFooter").getBoundingClientRect().height + 5) + "px";
	  }
	  
	  var homeComponent;
	  window.onload = function(ev) {
	    window.onresize(ev);
	    
	    var homeUrl = '/sh3dPlayerBeta/?action=read&home=' + encodeURIComponent('<%= home %>');
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
	        {navigationPanel: (!/ipad|iphone|ipod|android/.test(navigator.userAgent.toLowerCase()) || !!window.MSStream) ? "default" : "none",             
	         aerialViewButtonId: "aerialView",     
	         virtualVisitButtonId: "virtualVisit",  
	         levelsAndCamerasListId: "levelsAndCameras"
	        });
	  }
	   
	  function hideControls() {
	    document.getElementById("closeButton").style.display = "none";
	    document.getElementById("switchDiv").style.display = "none";
	    homeComponent.getUserPreferences().setNavigationPanelVisible(false);
	  }
	</script>
	
	<jsp:include page="/WEB-INF/jspf/mainEnd.jsp">
	  <jsp:param name="displayButtons" value="false"/>
	  <jsp:param name="additionalCopyrights" value="Sweet Home 3D Player / Version 2.0 Beta&nbsp;&nbsp;&nbsp;"/>
	</jsp:include>
	</body>
<% } else { 
    // Sweet Home 3D file upload form %>
	<head>
	<title>Sweet Home 3D Player</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<link rel="alternate" type="application/rss+xml" title="RSS" href="/blog/rss.xml" />
	<link href="/sweethome3d.css" rel="stylesheet" type="text/css">
	<script type="text/javascript" src="/SweetHome3D.js"></script>
	</head>
	<body>
	  <jsp:include page="/WEB-INF/jspf/header.jsp"/>
	  <jsp:include page="/WEB-INF/jspf/mainStart.jsp"/> 
	  <h1 align="center">Sweet Home 3D Player</h1>
	    <p align="center">This service lets registered users upload their Sweet Home 3D files on this web server,
	          to display them in 3D with any browser compatible with WebGL.</p>
	    <% if (guestUser) { %>
	      <p align="center">This service is reserved to <a href="/support/forum/registermember"><b>registered</b></a>  
	          and <a href='<%= response.encodeRedirectURL("/support/forum/login?url=" + URLEncoder.encode(request.getRequestURL().toString().split ("\\?") [0], "UTF-8") + "&forumLogin=false&lang=en") %>'><b>identified</b></a> members.</p>
	      </p>
	      <p align="center"><img src="/images/viewSweetHome3DExample3.jpg"></p>
	    <% } else {    %>
	      <p align="center">To upload a <code>.sh3d</code> file, select it in the form below then click on <i>View</i> button. 
	          <br>Once ready, a link to the page showing the 3D view of your file will be displayed.</p>
	      <table border="1" cellpadding="2" cellspacing="0"  align="center" style="margin-top: 15px; margin-bottom: 15px" width="90%">
	        <thead class="menu"><tr><td colspan="2" id="formCaption">New home</td></tr></thead>
	        <tbody>
	          <tr id="fileRow">
	              <td>Sweet Home 3D file:<br><font size="-1">(<%= maxSize %> MB max, save your home with <i>File > Save and compress</i> to reduce upload time)</font></td>
	              <td><input id="uploadedFile" type="file" size="10" tabindex="1" onchange="checkSelectedFile()" ></td>
	          </tr>
	          <tr id="linkRow" style="display: none;">
	              <td colspan="2" align="center" style="padding: 5px" id="linkCell"></td>
	          </tr>
	          <tr id="warningRow">
	          	<td colspan="2"><div style="color: #770000; margin-bottom: 5px"><b>Important notice</b>: 
				   Be sure to upload Sweet Home 3D files that contain only 3D models and textures <b>designed by yourself</b> or <b>freely redistributable</b>.
				   Note also that any file uploaded on the server is shared and can be viewed by anyone on the web.<br>
				   This service is for <b>Beta test</b> purpose and may be altered or removed at any moment.</div>
	            </td>
	          </tr>
	          <tr><td colspan="2" align="center">
	              <div id="buttons"><button id="uploadHome" onclick="uploadHome()" disabled>Upload</button></div>
	              <progress id="uploadProgress" max="110" style="width: 50%; display: none; margin:5px"></progress></td>
	          </tr>
	        </tbody>
	      </table>
	      
	      <h3 align="center">Available uploaded homes</h3>
	      <table border="1" cellpadding="2" cellspacing="0"  align="center" id="availableHomes"  style="margin-top: -5px; margin-bottom: 20px">
	        <thead class="menu"><tr><td>Name</td><td>Size</td><td>Shared</td><td>Link</td><td></td></tr></thead>
	        <tbody></tbody>
	      </table>
	    
	      <script type="text/javascript">
	        var homes = [];
	        
	        function checkSelectedFile() {
	          var fileElement = document.getElementById("uploadedFile");
	          if (fileElement.files.length) {
	        	if (fileElement.files[0].size > <%= maxSize %> * 1024 * 1024) {
	              resetElement(fileElement);
	        	  alert("Selected file size exceeds limit");
	        	} else {
	        	  if (fileElement.files[0].name.toLowerCase().indexOf(".sh3d") !== fileElement.files[0].name.length - ".sh3d".length 
	        	      && !confirm("Selected file extension isn't .sh3d. Are you sure you want to submit this file?")) {
	            	resetElement(fileElement);
	            	return; 
	              }
                  document.getElementById('uploadHome').disabled = false;
	        	}
	          }          
	        }
	        
	        function resetElement(element) {
	      	  var resetElement = element.cloneNode();
	      	  element.parentElement.insertBefore(resetElement, element);
	      	  element.parentElement.removeChild(element);
	        }
	        
	        function uploadHome(homeName) {
	          var fileElement = document.getElementById("uploadedFile");
	          if (homeName
	        	  || homes.indexOf(fileElement.files[0].name) < 0
	              || confirm(fileElement.files[0].name + " was already uploaded.\nAre you sure you want to overwrite it?")) {
	            var formData = new FormData();
	            formData.append("home", fileElement.files[0]);
	            var request = new XMLHttpRequest();
	            request.open("POST", "/sh3dPlayerBeta/?action=upload", true);
	            request.addEventListener("readystatechange", 
	                function(ev) {
	                  if (request.readyState === XMLHttpRequest.DONE 
	                      && request.status === 200
	                      && request.response !== null) {
	                   var response = JSON.parse(request.responseText);
	        	       document.getElementById("uploadProgress").style.display = "none";
	                   document.getElementById("buttons").style.display = "block";
	                   if (response.error === undefined) {
	             	     document.getElementById("fileRow").style.display = "none";
	             	     document.getElementById("linkRow").style.display = "table-row";
	           	         document.getElementById("linkCell").innerHTML = 
	           	        	 "<a href='/sh3dPlayerBeta?home=" + encodeURIComponent(response.file) + "' target='" + response.name + "'>Link to view " + response.name + "</a>";
	              	     document.getElementById("warningRow").style.display = "none";
	             	     document.getElementById("buttons").innerHTML = 
	         	             "<button onclick='location.href=\"/sh3dPlayerBeta/\"'>Upload another home</button>";
	                	 document.getElementById("formCaption").innerHTML = "Uploaded home";
	                     updateUploadedList(response.name);
	                   } else if (response.error === 11) {  // Too small delay between requests by user
	                     alert("Delay between requests too short. Try again in a few seconds");
	                   } else {
	        	         document.getElementById("buttons").innerHTML = "<button onclick='location.href=\"/sh3dPlayerBeta/\"'>Upload another home</button>";
	                     alert("Couldn't upload home " + name + "\nError " + response.error + ": " + response.message);
	                   }
	                 }
	               });
	            if (request.upload) {
	              request.upload.addEventListener("progress", 
	                  function(ev) {
	            	    document.getElementById("uploadedFile").disabled = true;
	            	    document.getElementById("uploadProgress").value = ev.loaded / ev.total * 100;
	                  });
	            }
	            request.send(formData);
	   	        document.getElementById("buttons").style.display = "none";
	   	        document.getElementById("uploadProgress").value = 0;
	       	    document.getElementById("uploadProgress").style.display = "block";
	          }
	        }
	      
	         function updateUploadedList(homeName) {
	           var request = new XMLHttpRequest();
	           request.open("GET", "/sh3dPlayerBeta/?action=list", true);
	           request.addEventListener("readystatechange", 
	               function(ev) {
	                 if (request.readyState === XMLHttpRequest.DONE 
	                     && request.status === 200
	                     && request.response !== null) {
	                  var availableHomes = JSON.parse(request.responseText);
	                  homes = [];
	                  var table = document.getElementById("availableHomes");
	                  var availableHomesTableBody = table.getElementsByTagName("tbody") [0];
	                  if (availableHomes.length > 0) {
	                    var availableHomesHtml = "";
	                    for (var i = 0; i < availableHomes.length; i++) {
	                      homes.push(availableHomes [i].name);
	                      var size = Math.max(1, Math.round(parseInt(availableHomes [i].length) / (1024)));
	                      availableHomesHtml += "<tr><td>" + availableHomes [i].name + "</td>"
	                          + "<td align='right'>" + size + " kB</td>"
	                          + "<td align='center'><input type='checkbox' disabled checked></td>"
	                          + "<td><a href='/sh3dPlayerBeta?home=" + encodeURIComponent(availableHomes [i].file) + "' target='" + availableHomes [i].name + "'>Link to SH3D Player</a></td>"
	                          + "<td><button onclick='deleteHome(\"" + availableHomes [i].name + "\", \"" + availableHomes [i].file + "\", " + (homeName === availableHomes [i].name) + ")'>Delete</button></td>"
	                    }
	                    availableHomesTableBody.innerHTML = availableHomesHtml;
	                  } else {
	                    availableHomesTableBody.innerHTML = "<tr><td colspan='10' width='300' align='center'><i>No uploaded home</i></td></tr>";
	                  }
	                 }
	               });
	           request.send();
	         }
	         
	         function deleteHome(homeName, homeFile, reload) {
	           if (confirm("Are you sure you want to delete " + homeName + "?")) {
	             var request = new XMLHttpRequest();
	             request.open("GET", "/sh3dPlayerBeta/?action=delete&home=" + encodeURIComponent(homeFile), false);
	             request.addEventListener("readystatechange", 
	                function(ev) {
	                  if (request.readyState === XMLHttpRequest.DONE 
	                      && request.status === 200) {
	                      var response = JSON.parse(request.responseText);
	                      if (response.error === undefined) {
	                    	if (reload) {
	                          location.reload();
	                    	} else {
	                    	  updateUploadedList();
	                    	}
	                      } else {
	                        alert("Couldn't delete " + name + "\nError " + response.error + ": " + response.message);
	                      }
	                    }
	                });
	             request.send();
	           }
	         }
	         
	         updateUploadedList();
	     </script>
	    <% } %>
	   <jsp:include page="/WEB-INF/jspf/mainEnd.jsp"/>
	</body>
<% } %>
</html>
