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
  this.createComponents(catalog, preferences, controller);
}

/**
 * Creates the components displayed by this panel.
 * @private
 */
FurnitureCatalogListPanel.prototype.createComponents = function (catalog, preferences, controller) {
  for(i = 0; i < catalog.getCategoriesCount() ; i++) {
    var category = catalog.getCategories()[i];
    var categoryContainer = document.createElement("div");
    categoryContainer.className = "furniture-category";
    categoryContainer.innerHTML = '<div class="furniture-category-label">' + category.name + '</div>';
    this.container.appendChild(categoryContainer);
    for(j = 0; j < category.getFurnitureCount(); j++) {
      var furniture = category.getFurniture()[j];
      var furnitureContainer = document.createElement("div");
      furnitureContainer.className = "furniture";
      furnitureContainer.innerHTML = '<div class="furniture-label">' + furniture.name + '</div>';
      categoryContainer.appendChild(furnitureContainer);
      (function(container, furnitureContainer, furniture) {
        furnitureContainer.addEventListener("click", function() {
          var furnitureElements = container.querySelectorAll(".furniture");
          for (k = 0; k < furnitureElements.length; k++) {
            furnitureElements[k].classList.remove("selected");
          }
          furnitureContainer.classList.add("selected");
          controller.setSelectedFurniture([furniture]);
        });
        TextureManager.getInstance().loadTexture(furniture.icon, {
          textureUpdated: function(image) {
            image.classList.add("furniture-icon");
            furnitureContainer.appendChild(image);
          },
          textureError:  function(error) {
            console.error("image cannot be loaded", error);
          }
        });
      })(this.container, furnitureContainer, furniture);
    }
  }
}

FurnitureCatalogListPanel.prototype.enableAddHomeFurnitureAction = function (action) {
  var button = document.createElement('button');
  button.innerHTML = 'Add';
  button.addEventListener("click", function() { action.actionPerformed(); });
  this.container.appendChild(button);
}



