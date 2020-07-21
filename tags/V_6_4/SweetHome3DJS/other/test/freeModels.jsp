<%@ page contentType="text/html; charset=UTF-8" import="java.util.Set" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c"   uri="http://java.sun.com/jstl/core_rt" %>
<jsp:include page="/WEB-INF/jspf/environment.jsp" />

<c:import url="/WEB-INF/jspf/modelsTable.jsp" var="contributionsTable">
  <c:param name="library" value="contributions"/>
</c:import> 
<c:import url="/WEB-INF/jspf/modelsTable.jsp" var="otherTable">
  <c:param name="library" value="other"/>
</c:import> 
<c:import url="/WEB-INF/jspf/modelsTable.jsp" var="scopiaTable">
  <c:param name="library" value="scopia"/>
</c:import> 
<c:import url="/WEB-INF/jspf/modelsTable.jsp" var="katorLegazTable">
  <c:param name="library" value="katorLegaz"/>
</c:import> 
<c:import url="/WEB-INF/jspf/modelsTable.jsp" var="blendSwapCc0Table">
  <c:param name="library" value="blendSwapCc0"/>
</c:import> 
<c:import url="/WEB-INF/jspf/modelsTable.jsp" var="blendSwapCcByTable">
  <c:param name="library" value="blendSwapCcBy"/>
</c:import> 
<c:import url="/WEB-INF/jspf/modelsTable.jsp" var="reallusionTable">
  <c:param name="library" value="reallusion"/>
</c:import> 

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title>Sweet Home 3D : WebGL test on 3D models</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="Description" content="Download free 3D models">
<link rel="alternate" type="application/rss+xml" title="RSS" href="/blog/rss.xml" />
<link href="/sweethome3d.css" rel="stylesheet" type="text/css">
<script type="text/javascript" src="/SweetHome3D.js"></script>
<style type="text/css">p { margin-left: 20px }</style>

<script type="text/javascript" src="lib/gl-matrix-min.js"></script>
<script type="text/javascript" src="lib/jszip.min.js"></script>
<%-- 
<script type="text/javascript" src="lib/core.min.js"></script>
<script type="text/javascript" src="lib/triangulator.min.js"></script>
<script type="text/javascript" src="lib/viewmodel.min.js"></script>
 --%>
<script type="text/javascript" src="lib/core.js"></script>
<script type="text/javascript" src="lib/CollectionEvent.js"></script>
<script type="text/javascript" src="lib/CollectionChangeSupport.js"></script>
<script type="text/javascript" src="lib/URLContent.js"></script>
<script type="text/javascript" src="lib/scene3d.js"></script>
<script type="text/javascript" src="lib/HTMLCanvas3D.js"></script>
<script type="text/javascript" src="lib/ModelPreviewComponent.js"></script>
<script type="text/javascript" src="lib/ModelManager.js"></script>
<script type="text/javascript" src="lib/ModelLoader.js"></script>
<script type="text/javascript" src="lib/OBJLoader.js"></script>
<script type="text/javascript" src="lib/Triangulator.js"></script>
<script type="text/javascript" src="lib/viewModel.js"></script>

</head>
<body onload="bindAnchorsToModel3DViewer(/.*\/models\/.*\.zip/)">
  <jsp:include page="/WEB-INF/jspf/header.jsp"/>
  <jsp:include page="/WEB-INF/jspf/mainStart.jsp"/>
    <h1 align="center">WebGL test on 3D models</h1>
      <p align="center"><a href="#ContributedModels">Contributors models</a><br>
        <a href="#ScopiaModels">Scopia models</a><br>
        <a href="#KatorLegazModels">Kator Legaz models</a><br>
        <a href="#BlendSwapModels">Blend Swap models</a><br>
        <a href="#ReallusionModels">Reallusion models</a> </p>

       <p align="center">Click on the images of the following models to view them in 3D with WebGL!</p> 

    <h3 align="left"><img src="/images/bullet.gif" width="16" height="12"><a name="ContributedModels"></a>3D models created by Sweet Home 3D contributors</h3>
      <p>The ${contributionsModelsCount} following 3D models were created by contributors of Sweet Home 3D project, and are available under 
      <a href="http://artlibre.org/licence/lal/en/">Free Art License</a><c:if test='${param.applicationId ne "SweetHome3D#MacAppStore"}'>
      (the models surrounded with a <span class="modelReleased" style="padding-bottom: 0; width: auto; height: auto">green</span> border are  available by default in the <a href="/download.jsp">current version</a> of Sweet Home 3D)</c:if>.</p>
       
      ${contributionsTable}  
          
      <p align="center"><i>Thanks to
      <% int i = -1;
         Set<String> creators = (Set<String>)application.getAttribute("contributionsCreators");
         for (String creator : creators) { %>
           <b><%= creator %></b><%= ++i == creators.size() - 2 ? " and" : (i < creators.size() - 1 ? "," : "") %>
      <% } %>
        for their contribution.</i>
      <br>The creator of each 3D model is indicated when you place the mouse pointer on its image.
          Trees were generated with <a href="http://arbaro.sourceforge.net/">Arbaro</a>.</p>
      <p align="center">The set of previous models is available as the <tt>Contributions.sh3f</tt>, <tt>LucaPresidente.sh3f</tt> and <tt>Trees.sh3f</tt>
        <a href="/importModels.jsp#ModelsLibraries">libraries 
        of 3D models</a> contained in the  <a style="white-space:nowrap" href='${sweetHome3DFiles["3DModels-Contributions-%s.zip"]}'><tt>3DModels-Contributions-${furnitureLibrariesVersion}.zip</tt></a> 
        (<fmt:formatNumber value="${sweetHome3DFileSizes['3DModels-Contributions-%s.zip']}"/> MB), <a style="white-space:nowrap" href='${sweetHome3DFiles["3DModels-LucaPresidente-%s.zip"]}'><tt>3DModels-LucaPresidente-${furnitureLibrariesVersion}.zip</tt></a> 
        (<fmt:formatNumber value="${sweetHome3DFileSizes['3DModels-LucaPresidente-%s.zip']}"/> MB) and <a style="white-space:nowrap" href='${sweetHome3DFiles["3DModels-Trees-%s.zip"]}'><tt>3DModels-Trees-${furnitureLibrariesVersion}.zip</tt></a> 
        (<fmt:formatNumber value="${sweetHome3DFileSizes['3DModels-Trees-%s.zip']}"/> MB) downloadable files.
      </p>
      
      <p style="margin-top: 40px">The following basic shapes are made available separately because it's often needed to change their orientation them during importation:</p>
      
      ${otherTable}

    
    <h3 align="left"><img src="/images/bullet.gif" width="16" height="12"><a name="ScopiaModels"></a>3D models created by Scopia</h3>
      <p align="left">The ${scopiaModelsCount} following 3D models were created by the author of <a href="http://resources.blogscopia.com/category/models/">Resources.blogscopia</a> and are available under <a href="http://creativecommons.org/licenses/by/3.0/">Creative
            Commons Attribution 3.0 Unported license</a>.</p>
      
      ${scopiaTable} 
        
      <p align="center">The set of Scopia  models is available as the <a href="/importModels.jsp#ModelsLibraries"></a> <tt>Scopia.sh3f</tt> <a href="/importModels.jsp#ModelsLibraries">library
          of 3D models</a>         contained in the <a style="white-space:nowrap" href='${sweetHome3DFiles["3DModels-Scopia-%s.zip"]}'><tt>3DModels-Scopia-${furnitureLibrariesVersion}.zip</tt></a> 
        (<fmt:formatNumber value="${sweetHome3DFileSizes['3DModels-Scopia-%s.zip']}"/> MB) downloadable file.</p>
        
    <h3 align="left"><img src="/images/bullet.gif" width="16" height="12"><a name="KatorLegazModels"></a>3D models created by Kator Legaz</h3>
      <p>The ${katorLegazModelsCount} following 3D models were created by <a href="http://www.katorlegaz.com/3d_models/">Andrew
      Kator &amp; Jennifer Legaz</a> and converted  to OBJ + MTL format to be importable in Sweet Home 3D. These creations are available under <a href="http://creativecommons.org/licenses/by/3.0/us/">Creative Commons Attribution 3.0 United States license</a>.</p>

      ${katorLegazTable}

      <p align="center"><i>Copyright &copy; 2003-2008 Andrew Kator &amp; Jennifer Legaz </i></p>
      <p align="center">The set of Kator Legaz  models is available as the <a href="/importModels.jsp#ModelsLibraries"></a> <tt>KatorLegaz.sh3f</tt> <a href="/importModels.jsp#ModelsLibraries">library
          of 3D models</a> contained in the <a style="white-space:nowrap" href='${sweetHome3DFiles["3DModels-KatorLegaz-%s.zip"]}'><tt>3DModels-KatorLegaz-${furnitureLibrariesVersion}.zip</tt></a> 
          (<fmt:formatNumber value="${sweetHome3DFileSizes['3DModels-KatorLegaz-%s.zip']}"/> MB) downloadable file.</p>
          
    <h3 align="left"><img src="/images/bullet.gif" width="16" height="12"><a name="BlendSwapModels" id="BlendSwapModels"></a>3D models created by Blend Swap contributors</h3>
      <p>The ${blendSwapCc0ModelsCount + blendSwapCcByModelsCount} following 3D models were created by contributors of <a href="http://www.blendswap.com">Blend Swap</a> and converted  to OBJ + MTL format to be importable in Sweet Home 3D. 
         The ${blendSwapCc0ModelsCount} first 3D models are part of the <a href="http://creativecommons.org/choose/zero/">public domain</a>, and the ${blendSwapCcByModelsCount} other models are available under 
         <a href="http://creativecommons.org/licenses/by/3.0/">Creative Commons Attribution 3.0 license</a>.</p>

      <h4 align="center" style="margin-bottom: 5px">3D models part of the <a href="http://creativecommons.org/choose/zero/">public domain</a> (CC-0)</h4>
      ${blendSwapCc0Table}

      <h4 align="center" style="margin-bottom: 5px; margin-top: 30px">3D model available under <a href="http://creativecommons.org/licenses/by/3.0/">Creative Commons Attribution 3.0 license</a> (CC-BY)</h4>
      ${blendSwapCcByTable}

      <p align="center"><i>Thanks to 
      <% i = -1;
         creators = (Set<String>)application.getAttribute("blendSwapCreators");
         for (String creator : creators) { %>
           <b><%= creator %></b><%= ++i == creators.size() - 2 ? " and" : (i < creators.size() - 1 ? "," : "") %>
      <% } %>
      for their contribution.</i>
      <br>The creator of each 3D model is indicated when you place the mouse pointer on its image.</p> 
      <p align="center">The set of Blend Swap  models is available as the <a href="/importModels.jsp#ModelsLibraries"></a> <tt>BlendSwap-CC-0.sh3f</tt> and <tt>BlendSwap-CC-BY.sh3f</tt> <a href="/importModels.jsp#ModelsLibraries">libraries
        of 3D models</a> contained in the  <a style="white-space:nowrap" href='${sweetHome3DFiles["3DModels-BlendSwap-CC-0-%s.zip"]}'><tt>3DModels-BlendSwap-CC-0-${furnitureLibrariesVersion}.zip</tt></a> 
        (<fmt:formatNumber value="${sweetHome3DFileSizes['3DModels-BlendSwap-CC-0-%s.zip']}"/> MB) 
        and <a style="white-space:nowrap" href='${sweetHome3DFiles["3DModels-BlendSwap-CC-BY-%s.zip"]}'><tt>3DModels-BlendSwap-CC-BY-${furnitureLibrariesVersion}.zip</tt></a> 
        (<fmt:formatNumber value="${sweetHome3DFileSizes['3DModels-BlendSwap-CC-BY-%s.zip']}"/> MB) downloadable files.</p>
          
    <h3 align="left"><img src="/images/bullet.gif" width="16" height="12"><a name="ReallusionModels"></a>3D models created by Reallusion</h3>
      <p>The ${reallusionModelsCount} following 3D models were created by <a href="http://www.reallusion.com/">Reallusion</a> 
         and distributed here with their authorization. These creations are available under <a href="http://creativecommons.org/licenses/by/3.0/us/">Creative 
         Commons Attribution 3.0 United States license</a>.</p>
      
      ${reallusionTable}
 
      <p align="center"><i>Copyright &copy; 2008-2013 Reallusion</i></p>
      <p align="center">The set of Reallusion 3D models is available as the <a href="/importModels.jsp#ModelsLibraries"></a> <tt>Reallusion.sh3f</tt> <a href="/importModels.jsp#ModelsLibraries">library 
        of 3D models</a> contained in the <a style="white-space:nowrap" href='${sweetHome3DFiles["3DModels-Reallusion-%s.zip"]}'><tt>3DModels-Reallusion-${furnitureLibrariesVersion}.zip</tt></a> 
        (<fmt:formatNumber value="${sweetHome3DFileSizes['3DModels-Reallusion-%s.zip']}"/> MB) downloadable file.</p>
      
      <p align="center" style="margin-top: 40px"><i>Last update: <fmt:formatDate value="${freeModelsUpdateDate}" dateStyle="long" type="date" /></i></p>
    <jsp:include page="/WEB-INF/jspf/mainEnd.jsp"/>
</body>
</html>
