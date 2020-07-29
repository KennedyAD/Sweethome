<%--
   index.jsp 
   
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
<%@ page contentType="text/html; charset=UTF-8" %>
<% out.clear();
   String homeName = request.getParameter("home");
%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="minimal-ui, user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width">
<meta name="format-detection" content="telephone=no">
<meta name="msapplication-tap-highlight" content="no">
<title>SweetHome3DJS Test</title>
<script type="text/javascript" src="lib/big.min.js"></script>
<script type="text/javascript" src="lib/gl-matrix-min.js"></script>
<script type="text/javascript" src="lib/jszip.min.js"></script>
<script type="text/javascript" src="lib/jsXmlSaxParser.min.js"></script>
<script type="text/javascript" src="lib/core.min.js"></script>
<script type="text/javascript" src="lib/geom.min.js"></script>
<script type="text/javascript" src="lib/stroke.min.js"></script>
<script type="text/javascript" src="lib/swingundo.min.js"></script>
<script type="text/javascript" src="lib/batik-svgpathparser.min.js"></script>
<script type="text/javascript" src="lib/triangulator.min.js"></script>
<script type="text/javascript" src="lib/graphics2d.min.js"></script>
<script type="text/javascript" src="lib/sweethome3d.min.js"></script>
<link rel="stylesheet" type="text/css" href="lib/sweethome3djs.css">
<style type="text/css">

html, body {
  overflow-x: hidden;
  overflow-y: hidden;
}

body {
  position: relative;
  margin: 0px;
  height: 100%;
  -ms-user-select: none;       
  user-select: none;    
  touch-action: none;
}

#home-plan::selection { background: #0042E0; }

#home-pane-toolbar, #furniture-catalog, #home-plan, #home-3D-view {
  position: absolute;
}

/*
 * No-touch devices common CSS
 */
#home-pane-toolbar {
  top: 0px;
  height: 30px;
  white-space: nowrap;
}

#furniture-catalog {
  top: 30px;
  width: 300px;
  height: calc(100% - 30px);
  overflow-y: scroll; 
}

#home-plan {
  top: 30px;
  left: 300px;
  width: calc(100% - 300px);
  height: calc(50% - 16px);
  font-family: sans-serif;
  border-top: 1px solid gray; 
  border-bottom: 1px solid gray; 
}

#home-3D-view {
  top: calc(50% + 16px);
  left: 300px;
  width: calc(100% - 300px);
  height: calc(50% - 16px);
}

@media (orientation: portrait) {

  #furniture-catalog {
    width: 160px;
  }

  #home-plan {
    left: 160px;
    width: calc(100% - 160px);
  }

  #home-3D-view {
    left: 160px;
    width: calc(100% - 160px);
  }

}

/*
 * Touch devices common CSS - ignored by IE
 */
@media (hover: none) {

  body {
    margin: 5px;
    height: calc(100% - 10px);
  }

  /* No scroll bars under Chrome */
  ::-webkit-scrollbar {
    display: none;
  }


  #home-pane-toolbar {
    top: calc(100% - 40px);
    height: 40px;
  }

  #home-pane-toolbar .toolbar-button {
    margin-top: 0px;
    height: calc(100% - 2px);
  }

  @media (orientation: portrait) {

    #home-3D-view {
      top: 0%;
      left: 0%;
      width: calc(100% - 2px);
      height: calc(50% - 60px);
      border: 1px solid gray; 
    }

    #home-plan {
      top: calc(50% - 60px);
      left: 0px;
      width: calc(100% - 2px);
      height: calc(50% - 59.5px);
      z-index: 1;
      border: 1px solid gray;
    }

    /* Funiture catalog horizontal layout */

    .furniture-catalog {
      overflow: scroll;
      white-space: nowrap;
    }

    .furniture-category-label {
      display: none;
    }

    .furniture {
      margin-top: 0px;
      margin-bottom: 0px;
      white-space: normal;
    }
    
    .furniture > .furniture-icon {
      top: 3px;
    }

    .furniture > .furniture-label {
      z-index: 2;
      text-shadow: white 0px -2px;
    }

    .furniture-category-separator {
      display: inline-block;
      height: 80px;
      padding-right: 10px;
      margin-right: 10px;
      border-right: dashed 1px rgba(0, 0, 0, 0.4);
    }

    /* End of horizontal layout */

    #furniture-catalog {
      top: calc(100% - 40px - 80px);
      left: 0px;
      width: calc(100% - 2px);
      height: 78px;
      overflow-x: scroll; 
      overflow-y: hidden; 
    }

  }

  @media (orientation: landscape) {

    #furniture-catalog {
      top: 0%;
      left: 0%;
      width: 150px;
      height: calc(100% - 40px - 2px);
      overflow-x: hidden; 
      overflow-y: scroll; 
    }

    #home-plan {
      top: 0%;
      left: 150px;
      width: calc(50% - 75px - 2px);
      height: calc(100% - 40px - 2px);
      border: 1px solid gray;
      z-index: 1;
    }

    #home-3D-view {
      top: 0%;
      left: calc(50% + 75px);
      width: calc(50% - 75px - 1px);
      height: calc(100% - 40px - 2px);
      border: 1px solid gray; 
      border-left: 0px; 
    }

  }

}

/*
 * Touch devices common CSS - ignored by IE
 */
@media (hover: none) {

  body {
    margin: 5px;
    height: calc(100% - 10px);
  }

  /* No scroll bars under Chrome */
  ::-webkit-scrollbar {
    display: none;
  }


  #home-pane-toolbar {
    top: calc(100% - 40px);
    height: 40px;
  }

  #home-pane-toolbar .toolbar-button {
    margin-top: 0px;
    height: calc(100% - 2px);
  }

  @media (orientation: portrait) {

    #home-3D-view {
      top: 0%;
      left: 0%;
      width: calc(100% - 2px);
      height: calc(50% - 60px);
      border: 1px solid gray; 
    }

    #home-plan {
      top: calc(50% - 60px);
      left: 0px;
      width: calc(100% - 2px);
      height: calc(50% - 59.5px);
      z-index: 1;
      border: 1px solid gray;
    }

    /* Funiture catalog horizontal layout */

    .furniture-catalog {
      overflow: scroll;
      white-space: nowrap;
    }

    .furniture-category-label {
      display: none;
    }

    .furniture {
      margin-top: 0px;
      margin-bottom: 0px;
      white-space: normal;
    }
    
    .furniture > .furniture-icon {
      top: 3px;
    }

    .furniture > .furniture-label {
      z-index: 2;
      text-shadow: white 0px -2px;
    }

    .furniture-category-separator {
      display: inline-block;
      height: 80px;
      padding-right: 10px;
      margin-right: 10px;
      border-right: dashed 1px rgba(0, 0, 0, 0.4);
    }

    /* End of horizontal layout */

    #furniture-catalog {
      top: calc(100% - 40px - 80px);
      left: 0px;
      width: calc(100% - 2px);
      height: 78px;
      overflow-x: scroll; 
      overflow-y: hidden; 
    }

  }

  @media (orientation: landscape) {

    #furniture-catalog {
      top: 0%;
      left: 0%;
      width: 150px;
      height: calc(100% - 40px - 2px);
      overflow-x: hidden; 
      overflow-y: scroll; 
    }

    #home-plan {
      top: 0%;
      left: 150px;
      width: calc(50% - 75px - 1.5px);
      height: calc(100% - 40px - 2px);
      border: 1px solid gray;
      z-index: 1;
    }

    #home-3D-view {
      top: 0%;
      left: calc(50% + 75px);
      width: calc(50% - 75px - 1px);
      height: calc(100% - 40px - 2px);
      border: 1px solid gray; 
      border-left: 0px; 
    }

  }

}

/* Hide optional buttons when screen is too small */
@media (max-width: 705px) {

  #home-pane-toolbar .toolbar-optional  {
    display: none;
  }
  
}

</style>
</head>
<body>

<div id="home-pane">

  <canvas id="home-3D-view" style="background-color: #CCCCCC;" 
          tabIndex="1"></canvas>

  <div id="home-plan" style="background-color: #FFFFFF; color: #000000"         
          tabIndex="2" ></div>

  <div id="home-pane-toolbar"></div>

  <div id="furniture-catalog"></div>

</div>

<script type="text/javascript">
var homeName = '<%= homeName == null ? "HomeTest" : homeName %>';
var urlBase = '<%= new java.net.URL(request.getScheme(), request.getServerName(), request.getServerPort(), request.getContextPath()).toString() %>';
var application = new SweetHome3DJSApplication(
    {readHomeURL:       urlBase + "/readHome.jsp?home=%s",
     writeHomeEditsURL: urlBase + "/writeHomeEdits.jsp",
     closeHomeURL:      urlBase + "/closeHome.jsp?home=%s",
     pingURL:           urlBase + "/ping.jsp",
     autoWriteDelay:    1000,
     autoWriteTrackedStateChange: true,
     writingObserver:   {
         writeStarted: function(update) {
           console.info("Update started", update);
         },
         writeSucceeded: function(update) {
           console.info("Update succeeded", update);
         },
         writeFailed: function(update, errorStatus, errorText) {
           console.info("Update failed", update);
         },
         connectionFound: function() {
           console.info("Back to online mode");
         },
         connectionLost: function(errorStatus, errorText) {
           console.info("Lost server connection - going offline");
         }
       }
    });

// Set a few settings
application.getUserPreferences().setNewRoomFloorColor(0xFF9999A0);

// Read and display test file 
// TODO Should be performed in HomeController.open
application.getHomeRecorder().readHome(homeName, 
    {
      homeLoaded: function(home) {
        home.setName(homeName);
        application.addHome(home);
        
        // TODO Should be performed in HomeController.close
        window.addEventListener("unload", function() {
            application.deleteHome(home);
          });
      },
      homeError: function(err) {
        console.error(err);
      },
      progression: function(part, info, percentage) {
      }
    });
</script>

</body>
</html>
