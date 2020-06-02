/*
 * DO NOT MODIFY: this source code has been automatically generated from Java
 *                with JSweet (http://www.jsweet.org)
 *
 * Sweet Home 3D, Copyright (c) 2017 Emmanuel PUYBARET / eTeks <info@eteks.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */

/**
 * Creates a panel that displays <code>catalog</code> furniture in a list with a filter combo box
 * and a search field.
 * @constructor
 */
function FurnitureCatalogListPanel(containerId, catalog, preferences, controller) {
  this.container = document.getElementById(containerId);
  this.container.classList.add("furniture-catalog");
  this.controller = controller;
  this.preferences = preferences;
  this.createComponents(catalog, preferences, controller);
}

/**
 * Returns the HTML element used to view this component at screen.
 */
FurnitureCatalogListPanel.prototype.getHTMLElement = function() {
  return this.container;
}

/**
 * Creates the components displayed by this panel.
 * @private
 */
FurnitureCatalogListPanel.prototype.createComponents = function (catalog, preferences, controller) {
  var furnitureCatalogListPanel = this;

  this.toolTipDiv = document.createElement("div");
  this.toolTipDiv.classList.add("furniture-tooltip");
  this.toolTipDiv.style.display = "none";
  this.toolTipDiv.style.position = "absolute";
  this.toolTipDiv.style.zIndex = 10;
  // this.toolTipDiv.addEventListener("mousemove", function(ev) {
  //   furnitureCatalogListPanel.container.dispatchEvent(ev);
  // });
  document.body.appendChild(this.toolTipDiv);

  for(i = 0; i < catalog.getCategoriesCount() ; i++) {
    var category = catalog.getCategories()[i];
    var categoryContainer = document.createElement("div");
    categoryContainer.className = "furniture-category";
    categoryContainer.innerHTML = '<div class="furniture-category-label">' + category.name + '</div>';
    this.container.appendChild(categoryContainer);

    for(j = 0; j < category.getFurnitureCount(); j++) {
      var piece = category.getFurniture()[j];
      var pieceContainer = document.createElement("div");
      pieceContainer.pieceOfFurniture = piece;
      pieceContainer.className = "furniture";
      pieceContainer.innerHTML = '<div class="furniture-label">' + piece.name + '</div>';
      categoryContainer.appendChild(pieceContainer);
      this.createPieceOfFurniturePanel(pieceContainer, piece);
    }
  }

  // Tooltip management
  var currentFurnitureContainer;
  document.addEventListener("mousemove", function(ev) {
    var rect = furnitureCatalogListPanel.container.getBoundingClientRect();
    var coords = ev;
    if((coords.clientX >= rect.left) && (coords.clientX < rect.left + furnitureCatalogListPanel.container.clientWidth)
        && (coords.clientY >= rect.top) && (coords.clientY < rect.top + furnitureCatalogListPanel.container.clientHeight)) {
      if(furnitureCatalogListPanel.toolTipDiv.style.display == "none") {
        if(furnitureCatalogListPanel.showTooltipTimeOut) {
          clearTimeout(furnitureCatalogListPanel.showTooltipTimeOut);
        }
        furnitureCatalogListPanel.showTooltipTimeOut = setTimeout(function() {
          if (furnitureCatalogListPanel.currentFurnitureContainer !== undefined) {
            currentFurnitureContainer = furnitureCatalogListPanel.currentFurnitureContainer; 
            furnitureCatalogListPanel.showTooltip(currentFurnitureContainer, ev); 
          }
        }, 1000);
      } else {
        if(currentFurnitureContainer !== furnitureCatalogListPanel.currentFurnitureContainer) {
          currentFurnitureContainer = furnitureCatalogListPanel.currentFurnitureContainer;
          furnitureCatalogListPanel.showTooltip(currentFurnitureContainer, ev);
        }
        if(furnitureCatalogListPanel.hideTooltipTimeOut) {
          clearTimeout(furnitureCatalogListPanel.hideTooltipTimeOut);
        }
        furnitureCatalogListPanel.hideTooltipTimeOut = setTimeout(function() { 
          furnitureCatalogListPanel.hideTooltip(); 
        }, 3000);
      }
    } else {
      furnitureCatalogListPanel.currentFurnitureContainer = undefined;
      furnitureCatalogListPanel.hideTooltip();
    }
  });

  // container.addEventListener("mouseout", function(ev) {
  //   var rect = container.getBoundingClientRect();
  //   var coords = ev;
  //   if((coords.clientX >= rect.left) && (coords.clientX < rect.left + rect.width)
  //     && (coords.clientY >= rect.top) && (coords.clientY < rect.top + rect.height)) {
  //     if(showTooltipTimeOut) {
  //       clearTimeout(showTooltipTimeOut);
  //     }
  //     if(hideTooltipTimeOut) {
  //       clearTimeout(hideTooltipTimeOut);
  //     }
  //     this.hideTooltip();
  //   });
}

FurnitureCatalogListPanel.prototype.createPieceOfFurniturePanel = function(pieceContainer, piece) {
  var furnitureCatalogListPanel = this;

  pieceContainer.addEventListener("mousemove", function(ev) {
    furnitureCatalogListPanel.currentFurnitureContainer = pieceContainer;
  });

  pieceContainer.addEventListener("mousedown", function() {
    var furnitureElements = furnitureCatalogListPanel.container.querySelectorAll(".furniture");
    for (k = 0; k < furnitureElements.length; k++) {
      furnitureElements[k].classList.remove("selected");
    }
    pieceContainer.classList.add("selected");
    furnitureCatalogListPanel.controller.setSelectedFurniture([piece]);
    furnitureCatalogListPanel.hideTooltip();
  });

  var touchListener = function(ev) {
      var furnitureElements = furnitureCatalogListPanel.container.querySelectorAll(".furniture");
      for (k = 0; k < furnitureElements.length; k++) {
        furnitureElements[k].classList.remove("selected");
        furnitureElements[k].querySelector(".furniture-add-icon").style.display = "none";
      }
      pieceContainer.classList.add("selected");
      pieceContainer.querySelector(".furniture-add-icon").style.display = "block";
      furnitureCatalogListPanel.controller.setSelectedFurniture([piece]);
    };
  if (OperatingSystem.isEdgeOrInternetExplorer()
      && window.PointerEvent) {
    pieceContainer.addEventListener("pointerdown", touchListener);
    var defaultListener = function(ev) {
        ev.preventDefault();
      };
    pieceContainer.addEventListener("mousedown", defaultListener);
    pieceContainer.addEventListener('contextmenu', defaultListener);
  } else {
    pieceContainer.addEventListener("touchstart", touchListener);
  }

  TextureManager.getInstance().loadTexture(piece.icon, {
    textureUpdated: function(image) {
      image.classList.add("furniture-icon");
      pieceContainer.appendChild(image);
    },
    textureError:  function(error) {
      console.error("image cannot be loaded", error);
    }
  });

  // Create invisible add icon
  var addIcon = document.createElement("img");
  addIcon.classList.add("furniture-add-icon");
  addIcon.style.display = "none";
  pieceContainer.appendChild(addIcon);
}

/** @private */
FurnitureCatalogListPanel.prototype.showTooltip = function (pieceContainer, ev) {
  this.toolTipDiv.style.left = ev.clientX + 10;
  this.toolTipDiv.style.top = ev.clientY + 10;
  this.toolTipDiv.style.display = "block";
  this.toolTipDiv.innerHTML = this.createCatalogItemTooltipText(pieceContainer.pieceOfFurniture);
  var icon = this.toolTipDiv.querySelector("img");
  icon.src = pieceContainer.querySelector("img.furniture-icon").src;
  var rect = this.toolTipDiv.getBoundingClientRect();
  if(rect.x < 0) {
    this.toolTipDiv.style.left = ev.clientX + 10 - rect.x;
  }
  if(rect.y < 0) {
    this.toolTipDiv.style.left = ev.clientY + 10 - rect.y;
  }
  if(rect.x + rect.width > window.innerWidth) {
    this.toolTipDiv.style.left = ev.clientX + 10 - (rect.x + rect.width - window.innerWidth);
  }
  if(rect.y + rect.height > window.innerHeight) {
    this.toolTipDiv.style.top = ev.clientY + 10 - (rect.y + rect.height - window.innerHeight);
  }
}

/** @private */
FurnitureCatalogListPanel.prototype.hideTooltip = function () {
  if(this.hideTooltipTimeOut) {
    clearTimeout(this.hideTooltipTimeOut);
    this.hideTooltipTimeOut = undefined;
  }
  if(this.showTooltipTimeOut) {
    clearTimeout(this.showTooltipTimeOut);
    this.showTooltipTimeOut = undefined;
  }
  if(this.toolTipDiv.style.display != "none") {
    this.toolTipDiv.style.display = "none";
  }
}

/** @private */
FurnitureCatalogListPanel.prototype.createCatalogItemTooltipText = function(piece) {
  if (this.preferences != null) {
    var creator = piece.getCreator();
    if (creator != null && creator.length > 0) {
      tipTextCreator = this.preferences.getLocalizedString("CatalogItemToolTip", "tooltipCreator", creator);
    }
    var tipTextModelSize;
    var format = this.preferences.getLengthUnit().getFormatWithUnit();
    tipTextDimensions = this.preferences.getLocalizedString("CatalogItemToolTip", "tooltipPieceOfFurnitureDimensions",
      format.format(piece.getWidth()), format.format(piece.getDepth()), format.format(piece.getHeight()));
    if (piece.getModelSize() != null && piece.getModelSize() > 0) {
      tipTextModelSize = this.preferences.getLocalizedString("CatalogItemToolTip", "tooltipModelSize",
        Math.max(1, Math.round(piece.getModelSize() / 1000)));
    }
  }

  var tipText = "<center>";
  tipText += "- <b>" + piece.getCategory().getName() + "</b> -<br>";
  tipText += "<b>" + piece.getName() + "</b>";
  if (tipTextDimensions != null) {
    tipText += "<br>" + tipTextDimensions;
  }
  if (tipTextModelSize != null) {
    tipText += "<br>" + tipTextModelSize;
  }
  if (tipTextCreator != null) {
    tipText += "<br>" + tipTextCreator;
  }
  tipText += "<br/><img height='100px'/>";
  tipText += "</center>";
  return tipText;
} 

