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

#home-pane-toolbar, 
#catalog-furniture-pane, #furniture-catalog, #catalog-furniture-splitter, #furniture-view, 
#furniture-plan-splitter, #plan-3D-view-pane, #home-plan, #plan-3D-view-splitter, #home-3D-view {
  position: absolute;
}

/*
 * No-touch devices common CSS
 */
#home-pane-toolbar {
  top: 0;
  height: 30px;
  white-space: nowrap;
}

#catalog-furniture-pane {
  top: 30px;
  left: 0;
  width: 296px;
  height: calc(100% - 30px);
  overflow: hidden;
}

#furniture-catalog {
  height: 70%;
  width: 100%;
  overflow-y: hidden;
}

#furniture-catalog-list {
  height: calc(100% - 3.3em);
  width: 100%;
  overflow-y: scroll;
}

#catalog-furniture-splitter {
  top: 70%;
  left: 0;
  width: 100%;
}

#furniture-view {
  top: calc(70% + 4px);
  width: 100%;
  height: calc(30% - 4px);
  box-sizing: border-box; 
}

#furniture-view .tree-table {
  width: 100%;
  height: 100%;
  overflow-y: hidden;
}

.pane-splitter.vertical::after {
  transform: rotate(90deg);
  bottom: initial;
  top: 50%;
}

#furniture-plan-splitter {
  top: 30px;
  left: 296px;
  height: calc(100% - 30px);
}

#plan-3D-view-pane {
  top: 30px;
  left: 300px;
  width: calc(100% - 300px);
  height: calc(100% - 30px);
}

#home-plan {
  width: 100%;
  height: calc(50% - 2px);
  font-family: sans-serif;
  border-top: 1px solid gray; 
  border-bottom: 1px solid gray; 
}

#plan-3D-view-splitter {
  top: calc(50% - 2px);
  width: 100%;
}

#home-3D-view {
  top: calc(50% + 2px);
  width: 100%;
  height: calc(50% - 2px);
  border-bottom: 1px solid gray; 
}

@media (orientation: portrait) {

  #catalog-furniture-pane {
    width: 160px;
  }

  #furniture-plan-splitter {
    left: 160px;
  }

  #plan-3D-view-pane {
    left: 164px;
    width: calc(100% - 164px);
  }
}

/*
 * Touch devices common CSS - ignored by IE (coarse point query required for some Android devices)
 */
@media (hover: none), (pointer: coarse) {

  .pane-splitter {
    display: none;
  }

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

  #furniture-catalog {
    height: 100%;
  }

  #furniture-catalog-list {
    height: calc(100% - 2.5em);
    left: 0;
  }

  #catalog-furniture-splitter {
    display: none;
  }

  #furniture-view {
    display: none;
  }

  #home-plan:focus { 
    outline: none; 
  }

  #home-3D-view:focus { 
    outline: none; 
  }
  
  @media (orientation: portrait), (max-aspect-ratio: 5/4) {

    #plan-3D-view-pane {
      top: 0;
      left: 0;
      width: 100%;
      height: calc(100% - 78px - 40px);
    }

    #home-3D-view {
      top: 0;
      width: calc(100% - 2px);
      height: calc(50% - 2px - 4px);
      border: 1px solid gray;
    }

    #plan-3D-view-splitter {
      display: initial;
      top: calc(50% - 4px);
      left: 0;
      width: calc(100%);
      height: 8px;
    }

    #home-plan {
      top: calc(50% - 1px + 4px);
      width: calc(100% - 2px);
      height: calc(50% - 1px - 4px);
      border: 1px solid gray;
    }
    
    /* Funiture catalog horizontal layout */

    #catalog-furniture-pane {
      top: calc(100% - 40px - 80px);
      left: 0px;
      width: calc(100% - 2px);
      height: 78px;
      overflow-x: scroll; 
      overflow-y: hidden; 
    }

    #furniture-catalog {
      width: 100%;
    }

    #furniture-catalog-list {
      width: 100%;
      height: 100%;
      overflow-x: scroll;
      overflow-y: hidden;
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
  }

  @media (orientation: landscape) and (min-aspect-ratio: 5/4) {

    #catalog-furniture-pane {
      top: 0;
      left: 0;
      width: 150px;
      height: calc(100% - 40px - 2px);
      overflow-x: hidden; 
      overflow-y: scroll; 
    }

    #plan-3D-view-pane {
      top: 0;
      left: 150px;
      width: calc(100% - 150px);
      height: calc(100% - 40px);
    }

    #home-plan {
      top: 0;
      width: calc(50% - 4px);
      height: calc(100% - 2px);
      border: 1px solid gray;
    }

    #plan-3D-view-splitter {
      display: initial;
      top: 0;
      left: calc(50% - 4px);
      width: 8px;
      height: calc(100%);
    }

    #home-3D-view {
      top: 0;
      left: calc(50%  + 4px);
      width: calc(50% - 4px);
      height: calc(100% - 2px);
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
  <div id="home-pane-toolbar"></div>

  <div id="catalog-furniture-pane">
    <div id="furniture-catalog"><div id="furniture-catalog-list" class="furniture-catalog-list"></div></div>
    <div id="catalog-furniture-splitter" class="pane-splitter"></div>
    <div id="furniture-view"></div>
  </div>
  
  <div id="furniture-plan-splitter" class="pane-splitter"></div>
  
  <div id="plan-3D-view-pane">
    <div id="home-plan" style="background-color: #FFFFFF; color: #000000;" tabindex="2" ><select id="level-selector"></select></div>
    <div id="plan-3D-view-splitter" class="pane-splitter"></div>
    <canvas id="home-3D-view" style="background-color: #CCCCCC;" tabindex="1"></canvas>
  </div>
</div>

<div id="home-furniture-dialog-template" class="dialog-template">
  <div class="home-furniture-dialog">
    <h3 class="card" data-name="name-and-price-title"></h3>
    <div data-name="name-and-price-panel" class="card label-input-grid">
      <div class="label-cell">
        <div data-name="name-label">@{HomeFurniturePanel.nameLabel.text}</div>
      </div>
      <div>
        <input name="name-input" size="50" type="text" />

        <label>
          <input type="checkbox" name="name-visible-checkbox" />
          <span>@{HomeFurniturePanel.nameVisibleCheckBox.text}</span>
        </label>
      </div>

      <div class="label-cell">
        <div data-name="price-label">@{HomeFurniturePanel.priceLabel.text}</div>
      </div>
      <div>
        <span data-name="price-input"></span>

        <span>@{HomeFurniturePanel.valueAddedTaxPercentageLabel.text}</span>
        <span data-name="value-added-tax-percentage-input"></span>
      </div>
    </div>

    <br />
    <div class="columns">
      <div class="location-column">
        <h3 class="card">@{HomeFurniturePanel.locationPanel.title}</h3>
        <div class="location-panel card label-input-grid">
          <div data-name="x-label" class="label-cell"></div>
          <div>
            <span data-name="x-input" />
          </div>

          <div data-name="y-label" class="label-cell"></div>
          <div>
            <span data-name="y-input" />
          </div>

          <div data-name="elevation-label" class="label-cell"></div>
          <div>
            <span data-name="elevation-input" />
          </div>

          <label title="@{HomeFurniturePanel.mirroredModelCheckBox.tooltip}" class="whole-line">
            <input type="checkbox" name="mirrored-model-checkbox" />
            <span>@{HomeFurniturePanel.mirroredModelCheckBox.text}</span>
          </label>

          <label title="@{HomeFurniturePanel.basePlanItemCheckBox.tooltip}" class="whole-line">
            <input type="checkbox" name="base-plan-item-checkbox" />
            <span>@{HomeFurniturePanel.basePlanItemCheckBox.text}</span>
          </label>
        </div>

        <br />
        <h3 class="card">@{HomeFurniturePanel.colorAndTexturePanel.title}</h3>
        <div data-name="paint-panel" class="card label-input-grid">
          <div>
            <label>
              <input type="radio" name="paint-checkbox" value="default">
              @{HomeFurniturePanel.defaultColorAndTextureRadioButton.text}
            </label>
          </div>
          <div></div>

          <div>
            <label>
              <input type="radio" name="paint-checkbox" value="color">
              @{HomeFurniturePanel.colorRadioButton.text}
            </label>
          </div>
          <div data-name="color-button"></div>

          <div>
            <label>
              <input type="radio" name="paint-checkbox" value="texture">
              @{HomeFurniturePanel.textureRadioButton.text}
            </label>
          </div>
          <div data-name="texture-component"></div>

          <div>
            <label>
              <input type="radio" name="paint-checkbox" value="MODEL_MATERIALS">
              @{HomeFurniturePanel.modelMaterialsRadioButton.text}
            </label>
          </div>
          <div data-name="material-component"></div>
        </div>
      </div>
      
      <div class="orientation-column">
        <h3 class="card">@{HomeFurniturePanel.orientationPanel.title}</h3>
        <div data-name="orientation-panel" class="card label-input-grid">
          <div class="whole-line" data-name="vertical-rotation-label">@{HomeFurniturePanel.verticalRotationLabel.text}</div>

          <div class="label-cell" data-name="angle-label">@{HomeFurniturePanel.angleLabel.text}</div>
          <div>
            <span data-name="angle-input"></span>
          </div>

          <div class="whole-line"  data-name="horizontal-rotation-label">@{HomeFurniturePanel.horizontalRotationLabel.text}</div>

          <label class="label-cell">
            <input type="radio" name="horizontal-rotation-radio" value="PITCH" />
            @{HomeFurniturePanel.pitchRadioButton.text}
          </label>
          <div>
            <span data-name="pitch-input"></span>
          </div>

          <label class="label-cell">
            <input type="radio" name="horizontal-rotation-radio" value="ROLL" />
            @{HomeFurniturePanel.rollRadioButton.text}
          </label>
          <div>
            <span data-name="roll-input"></span>
          </div>

          <div class="whole-line" data-name="furniture-orientation-image">
          </div>
        </div>
      </div>
      
      <div>
        <h3 class="card">@{HomeFurniturePanel.sizePanel.title}</h3>
        <div data-name="size-panel" class="card label-input-grid">
          <div data-name="width-label" class="label-cell"></div>
          <div>
            <span data-name="width-input"></span>
          </div>
          
          <div data-name="depth-label" class="label-cell"></div>
          <div>
            <span data-name="depth-input"></span>
          </div>
          
          <div data-name="height-label" class="label-cell"></div>
          <div>
            <span data-name="height-input"></span>
          </div>

          <label class="whole-line">
            <input type="checkbox" name="keep-proportions-checkbox" />
            <span>@{ImportedFurnitureWizardStepsPanel.keepProportionsCheckBox.text}</span>
          </label>
          
          <div class="whole-line" style="text-align: center">
            <button name="model-transformations-button">@{HomeFurniturePanel.modelTransformationsButton.text}</button>
          </div>
        </div>
        
        <br />
        <h3 class="card">@{HomeFurniturePanel.shininessPanel.title}</h3>
        <div data-name="shininess-panel" class="card label-input-grid">
          <div>
            <label>
              <input name="shininess-radio" type="radio" value="DEFAULT" />
              <span>@{HomeFurniturePanel.defaultShininessRadioButton.text}</span>
            </label>
          </div>

          <div>
            <label>
              <input name="shininess-radio" type="radio" value="MATT" />
              <span>@{HomeFurniturePanel.mattRadioButton.text}</span>
            </label>
          </div>

          <div>
            <label>
              <input name="shininess-radio" type="radio" value="SHINY" />
              <span>@{HomeFurniturePanel.shinyRadioButton.text}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <br />
    <div class="card visibility">
      <label>
        <input type="checkbox" name="visible-checkbox" />
        <span>@{HomeFurniturePanel.visibleCheckBox.text}</span>
      </label>
    </div>
  </div>
</div>


<div id="observer-camera-dialog-template" class="dialog-template">
  <div class="observer-camera-dialog">
    <div class="columns">
      <div>
        <h3 class="card">@{ObserverCameraPanel.locationPanel.title}</h3>
        <div data-name="location-panel" class="card label-input-grid">
          <div data-name="x-label" class="label-cell"></div>
          <div>
            <span data-name="x-input" />
          </div>

          <div data-name="y-label" class="label-cell"></div>
          <div>
            <span data-name="y-input" />
          </div>

          <div data-name="elevation-label" class="label-cell"></div>
          <div>
            <span data-name="elevation-input" />
          </div>
        </div>
      </div>

      <div>
        <h3 class="card">@{ObserverCameraPanel.anglesPanel.title}</h3>
        <div data-name="angles-panel" class="card label-input-grid">

          <div class="label-cell">@{ObserverCameraPanel.yawLabel.text}</div>
          <div>
            <span data-name="yaw-input"></span>
          </div>

          <div class="label-cell">@{ObserverCameraPanel.pitchLabel.text}</div>
          <div>
            <span data-name="pitch-input"></span>
          </div>

          <div class="label-cell">@{ObserverCameraPanel.fieldOfViewLabel.text}</div>
          <div>
            <span data-name="field-of-view-input"></span>
          </div>
        </div>
      </div>
    </div>

    <br />
    <label>
      <input type="checkbox" name="adjust-observer-camera-elevation-checkbox" />
      @{ObserverCameraPanel.adjustObserverCameraElevationCheckBox.text}
    </label>
  </div>
</div>

<div id="home-3Dattributes-dialog-template" class="dialog-template">
  <div class="home-3Dattributes-dialog">
    <div class="columns">
      <div class="column1">
        <h3 class="card">@{Home3DAttributesPanel.groundPanel.title}</h3>
        <div class="card label-input-grid">
          <div>
            <label>
              <input type="radio" name="ground-color-and-texture-choice" value="COLORED">
              @{Home3DAttributesPanel.groundColorRadioButton.text}
            </label>
          </div>
          <div data-name="ground-color-button"></div>

          <div>
            <label>
              <input type="radio" name="ground-color-and-texture-choice" value="TEXTURED">
              @{Home3DAttributesPanel.groundTextureRadioButton.text}
            </label>
          </div>
          <div data-name="ground-texture-component"></div>

          <div class="whole-line">
            <label>
              <input type="checkbox" name="background-image-visible-on-ground-3D-checkbox" />
              @{Home3DAttributesPanel.backgroundImageVisibleOnGround3DCheckBox.text}
            </label>
          </div>
        </div>
      </div>
      <div class="column2">
        <h3 class="card">@{Home3DAttributesPanel.skyPanel.title}</h3>
        <div class="card label-input-grid">
          <div>
            <label>
              <input type="radio" name="sky-color-and-texture-choice" value="COLORED">
              @{Home3DAttributesPanel.skyColorRadioButton.text}
            </label>
          </div>
          <div data-name="sky-color-button"></div>

          <div>
            <label>
              <input type="radio" name="sky-color-and-texture-choice" value="TEXTURED">
              @{Home3DAttributesPanel.skyTextureRadioButton.text}
            </label>
          </div>
          <div data-name="sky-texture-component"></div>
        </div>
      </div>
    </div>

    <br />
    <h3 class="card">@{Home3DAttributesPanel.renderingPanel.title}</h3>
    <div class="card label-input-grid">
      <div>
        @{Home3DAttributesPanel.brightnessLabel.text}
      </div>
      <div>
        <input type="range" name="brightness-slider" min="0" max="255" list="home-3Dattributes-brightness-list" />
        <datalist id="home-3Dattributes-brightness-list"></datalist>
        <div class="slider-labels">
          <div>@{Home3DAttributesPanel.darkLabel.text}</div>
          <div>@{Home3DAttributesPanel.brightLabel.text}</div>
        </div>
      </div>

      <div>
        @{Home3DAttributesPanel.wallsTransparencyLabel.text}
      </div>
      <div>
        <input type="range" name="walls-transparency-slider" min="0" max="255" list="home-3Dattributes-walls-transparency-list" />
        <datalist id="home-3Dattributes-walls-transparency-list"></datalist>
        <div class="slider-labels">
          <div>@{Home3DAttributesPanel.opaqueLabel.text}</div>
          <div>@{Home3DAttributesPanel.invisibleLabel.text}</div>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="compass-dialog-template" class="dialog-template">
  <div class="compass-dialog">
    <h3 class="card">@{CompassPanel.compassRosePanel.title}</h3>
    <div class="card label-input-grid double">
      <span data-name="x-label" class="label-cell"></span>
      <span data-name="x-input"></span>

      <label class="label-and-input">
        <input type="checkbox" name="visible-checkbox" />
        <span>@{CompassPanel.visibleCheckBox.text}</span>
      </label>

      <span data-name="y-label" class="label-cell"></span>
      <span data-name="y-input"></span>

      <span data-name="diameter-label" class="label-cell"></span>
      <span data-name="diameter-input"></span>
    </div>
    
    <br />
    <h3 class="card">@{CompassPanel.geographicLocationPanel.title}</h3>
    <div class="card label-input-grid double">
      <span class="label-cell">@{CompassPanel.latitudeLabel.text}</span>
      <span data-name="latitude-input"></span>

      <span class="label-cell">@{CompassPanel.northDirectionLabel.text}</span>
      <span>
        <span data-name="north-direction-input"></span>
        <canvas data-name="compass-preview">
        </canvas>
      </span>

      <span class="label-cell">@{CompassPanel.longitudeLabel.text}</span>
      <span data-name="longitude-input"></span>
    </div>
  </div>
</div>

<div id="level-dialog-template" class="dialog-template">
  <div class="level-dialog">
    <div class="label-input-grid">
      <span></span>
      <label>
        <input type="checkbox" name="viewable-checkbox" />
        <span>@{LevelPanel.viewableCheckBox.text}</span>
      </label>

      <span class="label-cell">@{LevelPanel.nameLabel.text}</span>
      <span><input name="name-input" type="text" /></span>

      <span data-name="elevation-label" class="label-cell"></span>
      <span>
        <span data-name="elevation-input"></span>
      </span>

      <span data-name="floor-thickness-label" class="label-cell"></span>
      <span>
        <span data-name="floor-thickness-input"></span>
      </span>

      <span data-name="height-label" class="label-cell"></span>
      <span>
        <span data-name="height-input"></span>
      </span>
    </div>

    <hr />
    <div>@{LevelPanel.levelsSummaryLabel.text}</div>
    <br/>
    <div class="levels-summary">
      <table data-name="levels-table">
        <thead>
          <tr>
            <th>@{LevelPanel.nameColumn}</th>
            <th>@{LevelPanel.elevationColumn}</th>
            <th>@{LevelPanel.floorThicknessColumn}</th>
            <th>@{LevelPanel.heightColumn}</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>
      <div class="levels-elevation-index-buttons">
        <button name="increase-elevation-index-button"></button>
        <br/>
        <button name="decrease-elevation-index-button"></button>
      </div>
    </div>
  </div>
</div>

<div id="wall-dialog-template" class="dialog-template">
  <div class="wall-dialog">
    <h3 class="card">@{WallPanel.startPointPanel.title}</h3>
    <div class="card label-input-grid double">
      <span data-name="x-start-label"></span>
      <span data-name="x-start-input"></span>
      <span data-name="y-start-label"></span>
      <span data-name="y-start-input"></span>
    </div>

    <br />
    <h3 class="card">@{WallPanel.endPointPanel.title}</h3>
    <div class="card label-input-grid double">
      <span data-name="x-end-label"></span>
      <span data-name="x-end-input"></span>
      <span data-name="y-end-label"></span>
      <span data-name="y-end-input"></span>
      <span class="whole-line">
        <span data-name="distance-to-end-point-label"></span>
        <span data-name="distance-to-end-point-input"></span>
      </span>
    </div>

    <br />
    <div class="columns-2">
      <div class="column1">
        <h3 class="card">@{WallPanel.leftSidePanel.title}</h3>
        <div class="color-and-texture-panel card label-input-grid">
          <div>
            <label>
              <input type="radio" name="left-side-color-and-texture-choice" value="COLORED">
              @{WallPanel.leftSideColorRadioButton.text}
            </label>
          </div>
          <div data-name="left-side-color-button"></div>
          
          <div>
            <label>
              <input type="radio" name="left-side-color-and-texture-choice" value="TEXTURED">
              @{WallPanel.leftSideTextureRadioButton.text}
            </label>
          </div>
          <div data-name="left-side-texture-component"></div>

          <div class="whole-line">
            <hr />
          </div>

          <label>
            <input type="radio" name="left-side-shininess-choice" value="0">
            @{WallPanel.leftSideMattRadioButton.text}
          </label>
          <label>
            <input type="radio" name="left-side-shininess-choice" value="0.25">
            @{WallPanel.leftSideShinyRadioButton.text}
          </label>

          <div class="whole-line" style="text-align: center">
            <button name="left-side-modify-baseboard-button"></button>
          </div>
        </div>
      </div>
      
      <div class="column2">
        <h3 class="card">@{WallPanel.rightSidePanel.title}</h3>
        <div class="color-and-texture-panel card label-input-grid">
          <div>
            <label>
              <input type="radio" name="right-side-color-and-texture-choice" value="COLORED">
              @{WallPanel.rightSideColorRadioButton.text}
            </label>
          </div>
          <div data-name="right-side-color-button"></div>
          
          <div>
            <label>
              <input type="radio" name="right-side-color-and-texture-choice" value="TEXTURED">
              @{WallPanel.rightSideTextureRadioButton.text}
            </label>
          </div>         
          <div data-name="right-side-texture-component"></div>

          <div class="whole-line">
            <hr />
          </div>

          <label>
            <input type="radio" name="right-side-shininess-choice" value="0">
            @{WallPanel.rightSideMattRadioButton.text}
          </label>
          <label>
            <input type="radio" name="right-side-shininess-choice" value="0.25">
            @{WallPanel.rightSideShinyRadioButton.text}
          </label>

          <div class="whole-line" style="text-align: center">
            <button name="right-side-modify-baseboard-button"></button>
          </div>
        </div>
      </div>
    </div>

    <br />
    <h3 class="card">@{WallPanel.topPanel.title}</h3>
    <div class="card label-input-grid">
      <span>@{WallPanel.patternLabel.text}</span>
      <div data-name="pattern-select"></div>

      <span>@{WallPanel.topColorLabel.text}</span>
      <span>
        <label>
          <input type="radio" name="top-color-choice" value="DEFAULT">
          @{WallPanel.topDefaultColorRadioButton.text}
        </label>
        <label>
          <input type="radio" name="top-color-choice" value="COLORED">
          @{WallPanel.topColorRadioButton.text}
          <span data-name="top-color-button"></span>
        </label>
      </span>
    </div>

    <br />
    <h3 class="card">@{WallPanel.heightPanel.title}</h3>
    <div class="card">
      <div class="columns-2">
        <div class="column1">

          <div>
            <label>
              <input type="radio" name="wall-shape-choice" value="RECTANGULAR_WALL">
              @{WallPanel.rectangularWallRadioButton.text}
            </label>
          </div>
          <br />

          <div class="label-input-grid">
            <span data-name="rectangular-wall-height-label" class="label-cell"></span>
            <span data-name="rectangular-wall-height-input"></span>
          </div>
        </div>

        <div class="column2">
          <div>
            <label class="label-and-input">
              <input type="radio" name="wall-shape-choice" value="SLOPING_WALL">
              @{WallPanel.slopingWallRadioButton.text}
            </label>
          </div>
          <br />

          <div class="label-input-grid">
            <span class="label-cell">@{WallPanel.slopingWallHeightAtStartLabel.text}</span>
            <span data-name="sloping-wall-height-at-start-input"></span>
            <span class="label-cell">@{WallPanel.slopingWallHeightAtEndLabel.text}</span>
            <span data-name="sloping-wall-height-at-end-input"></span>
          </div>
        </div>
      </div>
    </div>

    <br />
    <div class="card label-input-grid double">
      <span data-name="thickness-label" class="label-cell"></span>
      <span data-name="thickness-input"></span>
      <span data-name="arc-extent-label" class="label-cell"></span>
      <span data-name="arc-extent-input"></span>
    </div>
    
    <br/>
    <div data-name="wall-orientation-label" class="card">
    </div>
  </div>
</div>

<div id="room-dialog-template" class="dialog-template">
  <div class="room-dialog">
    <h3 class=card>@{RoomPanel.nameAndAreaPanel.title}</h3>
    <div data-name="name-and-area-panel" class=card>
      <span>
        @{RoomPanel.nameLabel.text}
        <input name="name-input" type="text" />
      </span>

      <label>
        <input type="checkbox" name="area-visible-checkbox" />
        @{RoomPanel.areaVisibleCheckBox.text}
      </label>
    </div>

    <div class="columns">
      <div>
        <h3 class=card>@{RoomPanel.floorPanel.title}</h3>
        <div data-name="floor-panel" class="card label-input-grid">

          <div class="whole-line">
            <label>
              <input type="checkbox" name="floor-visible-checkbox" />
              @{RoomPanel.floorVisibleCheckBox.text}
            </label>
          </div>

          <div>
            <label>
              <input type="radio" name="floor-color-and-texture-choice" value="COLORED">
              @{RoomPanel.floorColorRadioButton.text}
            </label>
          </div>
          <div data-name="floor-color-button"></div>

          <div>
            <label>
              <input type="radio" name="floor-color-and-texture-choice" value="TEXTURED">
              @{RoomPanel.floorTextureRadioButton.text}
            </label>
          </div>
          <div data-name="floor-texture-component"></div>
    
          <div class="whole-line">
            <label>&nbsp;</label>
          </div>

          <div class="whole-line">
            <hr />
          </div>

          <div class="whole-line">
            <label>
              <input type="radio" name="floor-shininess-choice" value="0">
              @{RoomPanel.floorMattRadioButton.text}
            </label>
            <label>
              <input type="radio" name="floor-shininess-choice" value="0.25">
              @{RoomPanel.floorShinyRadioButton.text}
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 class=card>@{RoomPanel.ceilingPanel.title}</h3>
        <div data-name="ceiling-panel" class="card label-input-grid">

          <div class="whole-line">
            <label>
              <input type="checkbox" name="ceiling-visible-checkbox" />
              @{RoomPanel.ceilingVisibleCheckBox.text}
            </label>
          </div>

          <div>
            <label>
              <input type="radio" name="ceiling-color-and-texture-choice" value="COLORED">
              @{RoomPanel.ceilingColorRadioButton.text}
            </label>
          </div>
          <div data-name="ceiling-color-button"></div>

          <div>
            <label>
              <input type="radio" name="ceiling-color-and-texture-choice" value="TEXTURED">
              @{RoomPanel.ceilingTextureRadioButton.text}
            </label>
          </div>
          <div data-name="ceiling-texture-component"></div>

          <div class="whole-line">
            <label>
              <input type="checkbox" name="ceiling-flat-checkbox" />
              @{RoomPanel.ceilingFlatCheckBox.text}
            </label>
          </div>

          <div class="whole-line">
            <hr />
          </div>

          <div class="whole-line">
            <label>
              <input type="radio" name="ceiling-shininess-choice" value="0">
              @{RoomPanel.ceilingMattRadioButton.text}
            </label>
            <label>
              <input type="radio" name="ceiling-shininess-choice" value="0.25">
              @{RoomPanel.ceilingShinyRadioButton.text}
            </label>
          </div>

        </div>
      </div>

      <div>
        <h3 class="card">@{RoomPanel.wallSidesPanel.title}</h3>
        <div data-name="wall-sides-panel" class="card label-input-grid">

          <div class="whole-line">
            <label title="@{RoomPanel.splitSurroundingWallsCheckBox.tooltip}">
              <input type="checkbox" name="split-surrounding-walls-checkbox" />
              @{RoomPanel.splitSurroundingWallsCheckBox.text}
            </label>
          </div>

          <div>
            <label>
              <input type="radio" name="wall-sides-color-and-texture-choice" value="COLORED">
              @{RoomPanel.wallSidesColorRadioButton.text}
            </label>
          </div>
          <div data-name="wall-sides-color-button"></div>
          <div>
            <label>
              <input type="radio" name="wall-sides-color-and-texture-choice" value="TEXTURED">
              @{RoomPanel.wallSidesTextureRadioButton.text}
            </label>
          </div>
          <div data-name="wall-sides-texture-component"></div>

          <div class="whole-line">
            <label>&nbsp;</label>
          </div>
          
          <div class="whole-line">
            <hr />
          </div>

          <div class="whole-line">
            <label>
              <input type="radio" name="wall-sides-shininess-choice" value="0">
              @{RoomPanel.wallSidesMattRadioButton.text}
            </label>
            <label>
              <input type="radio" name="wall-sides-shininess-choice" value="0.25">
              @{RoomPanel.wallSidesShinyRadioButton.text}
            </label>
          </div>
        </div>
      </div>

      <div>
          <h3 class="card">@{RoomPanel.wallSidesBaseboardPanel.title}</h3>
          <div data-name="wall-sides-baseboard-panel" class="card">

          </div>
      </div>
    </div>
  </div>
</div>

<div id="user-preferences-dialog-template" class="dialog-template">
  
  <div class="user-preferences-dialog label-input-grid">
    <div>@{UserPreferencesPanel.languageLabel.text}</div>
    <div>
      <select name="language-select"></select>
    </div>

    <div>@{UserPreferencesPanel.unitLabel.text}</div>
    <div>
      <select name="unit-select"></select>
    </div>
    
    <div>@{UserPreferencesPanel.currencyLabel.text}</div>
    <div>
      <select name="currency-select"></select>

      <label>
        <input type="checkbox" name="value-added-tax-checkbox" />
        @{UserPreferencesPanel.valueAddedTaxCheckBox.text}
      </label>
    </div>
    
    <div>@{UserPreferencesPanel.furnitureCatalogViewLabel.text}</div>
    <div>
      <label>
        <input type="radio" name="furniture-catalog-view-radio" value="tree" />
        @{UserPreferencesPanel.treeRadioButton.text}
      </label>
      <label>
        <input type="radio" name="furniture-catalog-view-radio" value="list" />
        @{UserPreferencesPanel.listRadioButton.text}
      </label>
    </div>

    <div>@{UserPreferencesPanel.navigationPanelLabel.text}</div>
    <div>
      <label>
        <input type="checkbox" name="navigation-panel-checkbox" />
        @{UserPreferencesPanel.navigationPanelCheckBox.text}
      </label>
    </div>
    
    <div>@{UserPreferencesPanel.aerialViewCenteredOnSelectionLabel.text}</div>
    <div>
      <label>
        <input type="checkbox" name="aerial-view-centered-on-selection-checkbox" />
        @{UserPreferencesPanel.aerialViewCenteredOnSelectionCheckBox.text}
      </label>
    </div>

    <div>@{UserPreferencesPanel.observerCameraSelectedAtChangeLabel.text}</div>
    <div>
      <label>
        <input type="checkbox" name="observer-camera-selected-at-change-checkbox" />
        @{UserPreferencesPanel.observerCameraSelectedAtChangeCheckBox.text}
      </label>
    </div>

    <div>@{UserPreferencesPanel.magnetismLabel.text}</div>
    <div>
      <label>
        <input type="checkbox" name="magnetism-checkbox" />
        @{UserPreferencesPanel.magnetismCheckBox.text}
      </label>
    </div>

    <div>@{UserPreferencesPanel.rulersLabel.text}</div>
    <div>
      <label>
        <input type="checkbox" name="rulers-checkbox" />
        @{UserPreferencesPanel.rulersCheckBox.text}
      </label>
    </div>

    <div>@{UserPreferencesPanel.gridLabel.text}</div>
    <div>
      <label>
        <input type="checkbox" name="grid-checkbox" />
        @{UserPreferencesPanel.gridCheckBox.text}
      </label>
    </div>

    <div>@{UserPreferencesPanel.defaultFontNameLabel.text}</div>
    <div>
      <select name="default-font-name-select">
      </select>
    </div>

    <div>@{UserPreferencesPanel.furnitureIconLabel.text}</div>
    <div>
      <label>
        <input type="radio" name="furniture-icon-radio" value="catalog" />
        @{UserPreferencesPanel.catalogIconRadioButton.text}
      </label>
      <br />
      <label>
        <input type="radio" name="furniture-icon-radio" value="topView" />
        @{UserPreferencesPanel.topViewRadioButton.text}
      </label>
      @{UserPreferencesPanel.iconSizeLabel.text}
      <select name="icon-size-select"></select>
    </div>

    <div>@{UserPreferencesPanel.roomRenderingLabel.text}</div>
    <div>
      <label>
        <input type="radio" name="room-rendering-radio" value="monochrome" />
        @{UserPreferencesPanel.monochromeRadioButton.text}
      </label>
      <label>
        <input type="radio" name="room-rendering-radio" value="floorColorOrTexture" />
        @{UserPreferencesPanel.floorColorOrTextureRadioButton.text}
      </label>
    </div>

    <div>@{UserPreferencesPanel.newWallPatternLabel.text}</div>
    <div data-name="new-wall-pattern-select"></div>

    <div>@{UserPreferencesPanel.newWallThicknessLabel.text}</div>
    <div>
      <span data-name="new-wall-thickness-input"></span>
    </div>
    <div>@{UserPreferencesPanel.newWallHeightLabel.text}</div>
    <div>
      <span data-name="new-wall-height-input"></span>
    </div>
    <div>@{UserPreferencesPanel.newFloorThicknessLabel.text}</div>
    <div>
      <span data-name="new-floor-thickness-input"></span>
    </div>
  </div>
</div>

<div id="polyline-dialog-template" class="dialog-template">
  <div class="polyline-dialog label-input-grid">
    <div data-name="thickness-label">
    </div>
    <div>
      <span data-name="thickness-input"></span>
    </div>

    <div>
      @{PolylinePanel.arrowsStyleLabel.text}
    </div>
    <div data-name="arrows-style-select"></div>

    <div>
      @{PolylinePanel.joinStyleLabel.text}
    </div>
    <div data-name="join-style-select"></div>

    <div>
      @{PolylinePanel.dashStyleLabel.text}
    </div>
    <div data-name="dash-style-select"></div>

    <div>
      @{PolylinePanel.dashOffsetLabel.text}
    </div>
    <div>
      <span data-name="dash-offset-input"></span>
    </div>

    <div>
      @{PolylinePanel.colorLabel.text}
    </div>
    <div data-name="color-button"></div>
    
    <div></div>
    <div>
      <label>
        <input type="checkbox" name="visible-in-3D-checkbox" />
        @{PolylinePanel.visibleIn3DViewCheckBox.text}
      </label>
    </div>
    <div></div>
  </div>
</div>

<div id="label-dialog-template" class="dialog-template">
  <div class="label-dialog">
    <h3 class=card>@{LabelPanel.textAndStylePanel.title}</h3>
    <div data-name="text-and-style-panel" class="card label-input-grid">
      <div>
        @{LabelPanel.textLabel.text}
      </div>
      <div>
        <textarea name="text" rows="4"></textarea>
      </div>

      <div>
        @{LabelPanel.alignmentLabel.text}
      </div>
      <div>
        <label>
          <input type="radio" name="label-alignment-radio" value="LEFT" />
          @{LabelPanel.leftAlignmentRadioButton.text}
        </label>
        <label>
          <input type="radio" name="label-alignment-radio" value="CENTER" />
          @{LabelPanel.centerAlignmentRadioButton.text}
        </label>
        <label>
          <input type="radio" name="label-alignment-radio" value="RIGHT" />
          @{LabelPanel.rightAlignmentRadioButton.text}
        </label>
      </div>

      <div>
        @{LabelPanel.fontNameLabel.text}
      </div>
      <div>
        <select name="font-select">
        </select>
      </div>

      <div data-name="font-size-label">
      </div>
      <div data-name="font-size-input-container">
        <span data-name="font-size-input" />
      </div>

      <div data-name="color-label">
        @{LabelPanel.colorLabel.text}
      </div>
      <div data-name="color-button"></div>
    </div>

    <br />
    <h3 class=card>@{LabelPanel.rendering3DPanel.title}</h3>
    <div data-name="rendering-3D-panel" class="card label-input-grid">
      <div class="whole-line">
        <label>
          <input type="checkbox" name="visible-in-3D-checkbox" />
          @{LabelPanel.visibleIn3DViewCheckBox.text}
        </label>
      </div>

      <div>
        @{LabelPanel.pitchLabel.text}
      </div>
      <div>
        <label>
          <input type="radio" name="label-pitch-radio" value="0" />
          @{LabelPanel.pitch0DegreeRadioButton.text}
        </label>
        <label>
          <input type="radio" name="label-pitch-radio" value="90" />
          @{LabelPanel.pitch90DegreeRadioButton.text}
        </label>
      </div>

      <div data-name="elevation-label">
      </div>
      <div>
        <span data-name="elevation-input" />
      </div>
    </div>
  </div>
</div>

<script type="text/javascript">
var homeName = '<%= homeName == null ? "HomeTest" : homeName %>';
var urlBase = '<%= new java.net.URL(request.getScheme(), request.getServerName(), request.getServerPort(), request.getContextPath()).toString() %>';
var application = new SweetHome3DJSApplication(
    {readHomeURL:         urlBase + "/readHome.jsp?home=%s",
     writeHomeEditsURL:   urlBase + "/writeHomeEdits.jsp",
     closeHomeURL:        urlBase + "/closeHome.jsp?home=%s",
     pingURL:             urlBase + "/ping.jsp",
     writeResourceURL:    urlBase + "/writeResource.jsp?path=%s",
     readResourceURL:     urlBase + "/userResources/%s",
     writePreferencesURL: urlBase + "/writeResource.jsp?path=userPreferences.json",
     readPreferencesURL:  urlBase + "/userResources/userPreferences.json",
     autoWriteDelay:      1000,
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
