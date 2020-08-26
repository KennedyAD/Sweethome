/*
 * Sweet Home 3D, Copyright (c) 2020 Emmanuel PUYBARET / eTeks <info@eteks.com>
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
 * Creates a panel that displays <code>catalog</code> furniture in a list.
 * @constructor
 * @author Emmanuel Puybaret
 * @author Renaud Pawlak
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
  this.catalog = catalog;

  this.toolTipDiv = document.createElement("div");
  this.toolTipDiv.classList.add("furniture-tooltip");
  this.toolTipDiv.style.display = "none";
  this.toolTipDiv.style.position = "absolute";
  this.toolTipDiv.style.zIndex = 10;
  document.body.appendChild(this.toolTipDiv);

  // Filtering
  var filteringDiv = document.createElement("div");
  filteringDiv.id = "furniture-filter";
  this.container.appendChild(filteringDiv);

  var categorySelector = document.createElement("select");
  var searchInput = document.createElement("input");
  this.searchInput = searchInput;
  var filterChangeHandler = function() {
    console.info("change ", categorySelector.value, searchInput.value);
    furnitureCatalogListPanel.filterCatalog(categorySelector.selectedIndex, function(piece) {
      if (searchInput.value == null || searchInput.value === "") {
        return true;
      }
      return RegExp(".*" + searchInput.value + ".*", "i").test(piece.name);
    });
  }
  categorySelector.id = "furniture-category-select";
  var categoryOption = document.createElement("option");
  var noCategory = preferences.getLocalizedString("FurnitureCatalogListPanel", "categoryFilterComboBox.noCategory");
  categoryOption.value = noCategory;
  categoryOption.text = noCategory;
  categorySelector.appendChild(categoryOption);
  for (var i = 0; i < catalog.getCategories().length; i++) {
    categoryOption = document.createElement("option");
    categoryOption.value = catalog.getCategories()[i].name;
    categoryOption.text = catalog.getCategories()[i].name;
    categorySelector.appendChild(categoryOption);    
  }
  categorySelector.addEventListener("input", filterChangeHandler);
  categorySelector.addEventListener("mousemove", function(event) { furnitureCatalogListPanel.hideTooltip(); event.stopPropagation(); });
  console.info("adding selector", categorySelector);
  filteringDiv.appendChild(categorySelector);
  searchInput.setAttribute('type', 'text'); 
  searchInput.id = "furniture-search-field";
  searchInput.placeholder = preferences.getLocalizedString("FurnitureCatalogListPanel", "searchLabel.text").replace(":", "");
  searchInput.addEventListener("input", filterChangeHandler);
  searchInput.addEventListener("mousemove", function(event) { furnitureCatalogListPanel.hideTooltip(); event.stopPropagation(); });
  this.getHTMLElement().addEventListener("click", function(event) {
    var bounds = searchInput.getBoundingClientRect();
    if (! (event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom)) {
        furnitureCatalogListPanel.searchInput.blur();
      }
  });
  searchInput.addEventListener("focusin", function(event) {
    if (!searchInput.classList.contains("expanded")) {
      searchInput.classList.add("expanded");
       setTimeout(function() { 
        if (document.body.scrollTop == 0) {
          // Device did not scroll automatically, so we have to force it to show the search field
          window.scrollTo(0, furnitureCatalogListPanel.container.getBoundingClientRect().top); 
          //var delta = window.innerHeight - document.body.getBoundingClientRect();
          //window.scrollBy(0, -delta);
        }
      }, 100);
    }
  });
  searchInput.addEventListener("focusout", function(event) {
    if (searchInput.classList.contains("expanded")) {
      searchInput.classList.remove("expanded");
    }
  });
  filteringDiv.appendChild(searchInput);
  console.info("adding search field", searchInput);

  // Create catalog
  for (var i = 0; i < catalog.getCategoriesCount() ; i++) {
    var category = catalog.getCategories()[i];
    var categoryLabel = document.createElement("div");
    categoryLabel.className = "furniture-category-label";
    categoryLabel.innerHTML = category.name;
    categoryLabel.category = category;
    this.container.appendChild(categoryLabel);

    for (var j = 0; j < category.getFurnitureCount(); j++) {
      var piece = category.getFurniture()[j];
      var pieceContainer = document.createElement("div");
      pieceContainer.pieceOfFurniture = piece;
      pieceContainer.className = "furniture";
      pieceContainer.innerHTML = '<div class="furniture-label">' + piece.name + '</div>';
      this.container.appendChild(pieceContainer);
      this.createPieceOfFurniturePanel(pieceContainer, piece);
      // Memorize piece & category for filtering
      pieceContainer.category = category;
      pieceContainer.piece = piece;
    }

    if (i < catalog.getCategoriesCount() - 1) {
      var categorySeparator = document.createElement("div");
      categorySeparator.className = "furniture-category-separator";
      categorySeparator.category = category;
      this.container.appendChild(categorySeparator);
    }
  }

  // Tooltip management
  var currentFurnitureContainer;
  document.addEventListener("mousemove", function(ev) {
    var panelBounds = furnitureCatalogListPanel.container.getBoundingClientRect();
    var coords = ev;
    if ((coords.clientX >= panelBounds.left) && (coords.clientX < panelBounds.left + furnitureCatalogListPanel.container.clientWidth)
        && (coords.clientY >= panelBounds.top) && (coords.clientY < panelBounds.top + furnitureCatalogListPanel.container.clientHeight)) {
      if (furnitureCatalogListPanel.toolTipDiv.style.display == "none") {
        if (furnitureCatalogListPanel.showTooltipTimeOut) {
          clearTimeout(furnitureCatalogListPanel.showTooltipTimeOut);
        }
        furnitureCatalogListPanel.showTooltipTimeOut = setTimeout(function() {
          if (furnitureCatalogListPanel.currentFurnitureContainer !== undefined) {
            currentFurnitureContainer = furnitureCatalogListPanel.currentFurnitureContainer; 
            furnitureCatalogListPanel.showTooltip(currentFurnitureContainer, ev); 
          }
        }, 1000);
      } else {
        if (currentFurnitureContainer !== furnitureCatalogListPanel.currentFurnitureContainer) {
          currentFurnitureContainer = furnitureCatalogListPanel.currentFurnitureContainer;
          furnitureCatalogListPanel.showTooltip(currentFurnitureContainer, ev);
        }
        if (furnitureCatalogListPanel.hideTooltipTimeOut) {
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

  this.container.addEventListener("mouseleave", function(ev) {
     furnitureCatalogListPanel.hideTooltip();
   });
}

/**
 * @private
 */
FurnitureCatalogListPanel.prototype.findCategoryElements = function(category) {
  var elements = [];
  for (var i = 0; i < this.container.childNodes.length; i++) {
    if (this.container.childNodes[i].category === category) {
      elements.push(this.container.childNodes[i]);
    }
  }
  return elements;
}

/**
 * @private
 */
FurnitureCatalogListPanel.prototype.filterCatalog = function(categoryIndex, pieceFilter) {
  // First hide all elements (save display value for further restoring)
  for (var i = 0; i < this.container.childNodes.length; i++) {
    if (this.container.childNodes[i].id !== "furniture-filter") {
      if (this.container.childNodes[i]._displayBackup === undefined) {
        this.container.childNodes[i]._displayBackup = this.container.childNodes[i].style.display;
      }
      this.container.childNodes[i].style.display = "none";
    }
  }

  // Unhide all elements that are not filtered out
  var categories = categoryIndex == null || categoryIndex === 0
    ? this.catalog.getCategories()
    : [this.catalog.getCategories()[categoryIndex - 1]];
  for (var i = 0; i < categories.length ; i++) {
    var category = categories[i];
    var furniture = pieceFilter == null?category.getFurniture():category.getFurniture().filter(pieceFilter);
    if (furniture != null && furniture.length > 0) {
      var elements = this.findCategoryElements(category);
      elements.forEach(function(element) {
        if (element.classList.contains("furniture-category-label") || element.classList.contains("furniture-category-separator")) {
          element.style.display = element._displayBackup;
        }
        if (element.piece && furniture.indexOf(element.piece) !== -1) {
          element.style.display = element._displayBackup;
        }
      });
    }
  }

}

/**
 * @private
 */
FurnitureCatalogListPanel.prototype.createPieceOfFurniturePanel = function(pieceContainer, piece) {
  var furnitureCatalogListPanel = this;

  pieceContainer.addEventListener("mousemove", function(ev) {
    furnitureCatalogListPanel.currentFurnitureContainer = pieceContainer;
  });

  pieceContainer.addEventListener("mousedown", function() {
    var furnitureElements = furnitureCatalogListPanel.container.querySelectorAll(".furniture");
    for (var k = 0; k < furnitureElements.length; k++) {
      furnitureElements[k].classList.remove("selected");
    }
    pieceContainer.classList.add("selected");
    furnitureCatalogListPanel.controller.setSelectedFurniture([piece]);
    furnitureCatalogListPanel.hideTooltip();
  });

  var touchEndListener = function(ev) {
      var containerBounds = pieceContainer.getBoundingClientRect();
      // Check touchend event is still within the container bounds 
      if (ev.touches.length === 0 && ev.changedTouches.length === 1
          && ev.changedTouches[0].clientX >= containerBounds.left && ev.changedTouches[0].clientX < containerBounds.left + containerBounds.width
          && ev.changedTouches[0].clientY >= containerBounds.top && ev.changedTouches[0].clientY < containerBounds.top + containerBounds.height) {
        var furnitureElements = furnitureCatalogListPanel.container.querySelectorAll(".furniture");
        for (var k = 0; k < furnitureElements.length; k++) {
          furnitureElements[k].classList.remove("selected");
        }
        pieceContainer.classList.add("selected");
        furnitureCatalogListPanel.controller.setSelectedFurniture([piece]);
      }
    };
  if (OperatingSystem.isInternetExplorerOrLegacyEdge()
      && window.PointerEvent) {
    pieceContainer.addEventListener("pointerup", function(ev) {
        if (ev.pointerType != "mouse") {
          ev.touches = [];
          ev.changedTouches = [{clientX : ev.clientX, clientY : ev.clientY}];
          touchEndListener(ev);
          ev.preventDefault();
        }
      });
    pieceContainer.addEventListener("pointerdown", function(ev) {
        if (ev.pointerType != "mouse") {
          ev.preventDefault();
        }
      });
    var defaultListener = function(ev) {
        ev.preventDefault();
      };
    pieceContainer.addEventListener("mousedown", defaultListener);
    pieceContainer.addEventListener('contextmenu', defaultListener);
  } else {
    pieceContainer.addEventListener("touchend", touchEndListener);
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
}

/** 
 * @private 
 */
FurnitureCatalogListPanel.prototype.showTooltip = function (pieceContainer, ev) {
  this.toolTipDiv.style.left = ev.clientX + 10;
  this.toolTipDiv.style.top = ev.clientY + 10;
  this.toolTipDiv.style.display = "block";
  this.toolTipDiv.innerHTML = this.createCatalogItemTooltipText(pieceContainer.pieceOfFurniture);
  var icon = this.toolTipDiv.querySelector("img");
  icon.src = pieceContainer.querySelector("img.furniture-icon").src;
  var toolTipBounds = this.toolTipDiv.getBoundingClientRect();
  if (toolTipBounds.x < 0) {
    this.toolTipDiv.style.left = ev.clientX + 10 - toolTipBounds.x;
  }
  if (toolTipBounds.y < 0) {
    this.toolTipDiv.style.left = ev.clientY + 10 - toolTipBounds.y;
  }
  if (toolTipBounds.x + toolTipBounds.width > window.innerWidth) {
    this.toolTipDiv.style.left = ev.clientX + 10 - (toolTipBounds.x + toolTipBounds.width - window.innerWidth);
  }
  if (toolTipBounds.y + toolTipBounds.height > window.innerHeight) {
    this.toolTipDiv.style.top = ev.clientY + 10 - (toolTipBounds.y + toolTipBounds.height - window.innerHeight);
  }
}

/**
 * @private 
 */
FurnitureCatalogListPanel.prototype.hideTooltip = function () {
  if (this.hideTooltipTimeOut) {
    clearTimeout(this.hideTooltipTimeOut);
    this.hideTooltipTimeOut = undefined;
  }
  if (this.showTooltipTimeOut) {
    clearTimeout(this.showTooltipTimeOut);
    this.showTooltipTimeOut = undefined;
  }
  if (this.toolTipDiv.style.display != "none") {
    this.toolTipDiv.style.display = "none";
  }
}

/** 
 * @private 
 */
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

