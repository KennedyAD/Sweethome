<!--
   index.jsp 
   
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
<% out.clear();
   String homeName = request.getParameter("home");
%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width">
<meta name="format-detection" content="telephone=no">
<meta name="msapplication-tap-highlight" content="no">
<title>SweetHome3DJS Test</title>
<base href="..">
<script type="text/javascript" src="lib/big.min.js"></script>
<script type="text/javascript" src="lib/gl-matrix-min.js"></script>
<script type="text/javascript" src="lib/jszip.min.js"></script>
<script type="text/javascript" src="lib/jsXmlSaxParser.min.js"></script>
<script type="text/javascript" src="lib/core.min.js"></script>
<script type="text/javascript" src="lib/geom.min.js"></script>
<script type="text/javascript" src="lib/stroke.min.js"></script>
<script type="text/javascript" src="lib/generated/swingundo.js"></script>
<script type="text/javascript" src="lib/generated/batik-svgpathparser.js"></script>
<script type="text/javascript" src="lib/triangulator.min.js"></script>
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

#home-pane-toolbar {
  height: 30px;
  white-space: nowrap;
}

#home-pane-toolbar, #furniture-catalog, #home-plan, #home-3D-view {
  position: absolute;
}

@media (orientation: landscape) {
  
  #home-pane {
    padding-top: 30px;
    height: calc(100% - 30px);
  }

  #home-pane-toolbar {
    top: 0px;
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
    height: calc(50% - 2px);
  }

  #home-3D-view {
    top: calc(50% + 32px);
    left: 300px;
    width: calc(100% - 300px);
    height: calc(50% - 2px);
  }

}

@media (orientation: portrait) {

  #home-3D-view {
    top: 0%;
    width: 100%;
    height: calc(50% - 65px);
  }

  #home-plan {
    top: calc(50% - 65px);
    width: 100%;
    height: calc(50% - 65px);
    z-index: 1;
  }

  #furniture-catalog {
    top: calc(100% - 130px);
    width: 100%;
    height: calc(130px - 32px);
    overflow-x: scroll; 
    overflow-y: hidden; 
  }

  #home-pane-toolbar {
    top: calc(100% - 30px);
  }

  @supports (-webkit-touch-callout: none) {
    /* Under iOS, scroll bar is visible only when scrolling */
    #home-3D-view {
      height: calc(50% - 55px);
    }

    #home-plan {
      top: calc(50% - 55px);
      height: calc(50% - 55px);
    }

    #furniture-catalog {
      top: calc(100% - 110px);
      height: calc(110px - 32px);
    }
  }
}

#home-plan::selection { background: #0042E0; }

</style>
</head>
<body>

<div id="home-pane">

  <canvas id="home-3D-view" style="background-color: #CCCCCC; border: 1px solid gray;" 
          tabIndex="1"></canvas>

  <div id="home-plan" style="background-color: #FFFFFF; border: 1px solid gray; font-family: sans-serif; color: #000000"         
          tabIndex="2" ></div>

  <div id="home-pane-toolbar"></div>

  <div id="furniture-catalog"></div>

</div>

<script type="text/javascript">
var homeName = '<%= homeName == null ? "HomeTest" : homeName %>';
var application = new SweetHome3DJSApplication('<%= new java.net.URL(request.getScheme(), request.getServerName(), request.getServerPort(), request.getContextPath()).toString() %>');
// Read and display test file 
// TODO Should be performed in HomeController.open
application.getHomeRecorder().readHome(homeName, 
    {
      homeLoaded: function(home) {
        application.addHome(home);
      },
      homeError: function(err) {
        console.error(err);
        //alert(err);
      },
      progression: function(part, info, percentage) {
      }
    });
</script>

</body>
</html>
