<%@ page contentType="text/html; charset=UTF-8" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title>Sweet Home 3D : Galerie</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="Description" content="Découvrez et téléchargez des aménagements réalisés avec Sweet Home 3D">
<link rel="alternate" type="application/rss+xml" title="RSS" href="/blog/rss.xml" />
<link href="../sweethome3d.css" rel="stylesheet" type="text/css">
<script type="text/javascript" src="../SweetHome3D.js"></script>
<link rel="stylesheet" href="/lightbox/lightbox.css" type="text/css" media="screen" />
<script type="text/javascript" src="/lightbox/lightbox.js"></script>

<script type="text/javascript" src="lib/big.min.js"></script>
<script type="text/javascript" src="lib/gl-matrix-min.js"></script>
<script type="text/javascript" src="lib/jszip.min.js"></script>

<script type="text/javascript" src="lib/core.js"></script>
<script type="text/javascript" src="lib/CollectionEvent.js"></script>
<script type="text/javascript" src="lib/CollectionChangeSupport.js"></script>
<script type="text/javascript" src="lib/URLContent.js"></script>
<script type="text/javascript" src="lib/scene3d.js"></script>
<script type="text/javascript" src="lib/HTMLCanvas3D.js"></script>
<script type="text/javascript" src="lib/ModelManager.js"></script>
<script type="text/javascript" src="lib/ModelLoader.js"></script>
<script type="text/javascript" src="lib/OBJLoader.js"></script>
<script type="text/javascript" src="lib/Triangulator.js"></script>

<script type="text/javascript" src="lib/geom.js"></script>
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

</head>

<body onload="javascript:initLightbox()">
  <jsp:include page="/WEB-INF/jspf/header.jsp"/>
  <jsp:include page="/WEB-INF/jspf/mainStart.jsp"/>
    <h1 align="center">Galerie</center> </h1>
      <p align="center">Cette page propose quelques exemples de logements cr&eacute;&eacute;s 
        avec <a href="index.jsp">Sweet Home 3D</a>. <br>
        Retrouverez aussi des exemples créés par des utilisateurs dans la <a href="/support/forum/listthreads?forum=6&lang=fr">galerie 
        du forum</a>. 
      <p align="center">Pour tester un exemple de cette page, t&eacute;l&eacute;chargez-le 
        en cliquant sur son lien et ouvrez-le avec Sweet Home 3D.<br>
        Vous pouvez aussi cliquer sur les images pour les voir en plus grand, et cliquer 
        sur les boutons <b>Animation 3D</b> pour voir les logements et y naviguer en 3D. 
      <blockquote> 
        <jsp:include page="/WEB-INF/jspf/galleryTable.jsp"/>
      </blockquote>
      <p align="center" style="margin-bottom:30px"><i>Exemples conçus par eTeks et distribués sous <a href="http://creativecommons.org/licenses/by/3.0/">licence CC-BY</a><br>
Ces logments contiennent des <a href="freeModels.jsp">modèles 3D</a> et des <a href="importTextures.jsp">textures</a> distribués sous licences libres</i></p>
      
	  
      <jsp:include page="/WEB-INF/jspf/mainEnd.jsp"/>
</body>
</html>
