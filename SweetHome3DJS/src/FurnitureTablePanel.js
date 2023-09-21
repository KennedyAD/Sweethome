/*
 * FurnitureTablePanel.js
 *
 * Sweet Home 3D, Copyright (c) 2021 Emmanuel PUYBARET / eTeks <info@eteks.com>
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

// Requires SweetHome3D.js
// Requires UserPreferences.js
// Requires toolkit.js

/**
 * Creates a new furniture tree table that displays <code>home</code> furniture.
 * @param {string} containerId
 * @param {Home} home
 * @param {UserPreferences} preferences
 * @param {FurnitureController} controller
 * @constructor
 * @author Emmanuel Puybaret
 * @author Louis Grignon
 */
function FurnitureTablePanel(containerId, home, preferences, controller) {
  this.container = document.getElementById(containerId);
  this.preferences = preferences;
  this.controller = controller;
  this.defaultDecimalFormat = new DecimalFormat();  
  this.integerFormat = new IntegerFormat();
  this.treeTable = new JSTreeTable(this.container, this.preferences, this.createTableModel(home));
  this.addHomeListeners(home);
  this.addUserPreferencesListeners(home);
  this.updateData(home);
}

FurnitureTablePanel.EXPANDED_ROWS_VISUAL_PROPERTY = "com.eteks.sweethome3d.SweetHome3D.ExpandedGroups";

/**
 * Returns the HTML element used to view this component at screen.
 */
FurnitureTablePanel.prototype.getHTMLElement = function() {
  return this.container;
}

/**
 * Adds listeners to home to update furniture in table.
 * @param {Home} home
 * @private
 */
FurnitureTablePanel.prototype.addHomeListeners = function(home) {
  var panel = this;
  var treeTable = this.treeTable;
  home.addSelectionListener({
      selectionChanged: function (ev) {
        treeTable.setSelectedRowsByValue(home.getSelectedItems());
      }
    });

  var homePropertyChangeListener = function() {
      treeTable.setModel(panel.createTableModel(home));
    };
  home.addPropertyChangeListener("FURNITURE_SORTED_PROPERTY", homePropertyChangeListener);
  home.addPropertyChangeListener("FURNITURE_DESCENDING_SORTED", homePropertyChangeListener);
  home.addPropertyChangeListener("FURNITURE_VISIBLE_PROPERTIES", homePropertyChangeListener);

  var pieceOfFurnitureChangeListener = function(ev) {
      panel.updatePieceOfFurnitureData(home, ev.getSource(), ev.getPropertyName());
    };
  var furniture = home.getFurniture();
  for (var i = 0; i < furniture.length; i++) {
    var piece = furniture[i];
    piece.addPropertyChangeListener(pieceOfFurnitureChangeListener);
    if (piece instanceof HomeFurnitureGroup) {
      var groupFurniture = piece.getAllFurniture();
      for (var j = 0; j < groupFurniture.length; j++) {
        groupFurniture[j].addPropertyChangeListener(pieceOfFurnitureChangeListener);
      }
    }
  }

  home.addFurnitureListener(function(ev) {
      panel.updateData(home);
      var piece = ev.getItem();
      if (ev.getType() == CollectionEvent.Type.ADD) {
        piece.addPropertyChangeListener(pieceOfFurnitureChangeListener);
        if (piece instanceof HomeFurnitureGroup) {
          var groupFurniture = piece.getAllFurniture();
          for (var j = 0; j < groupFurniture.length; j++) {
            groupFurniture[j].addPropertyChangeListener(pieceOfFurnitureChangeListener);
          }
        }
      } else {
        piece.removePropertyChangeListener(pieceOfFurnitureChangeListener);
        if (piece instanceof HomeFurnitureGroup) {
          var groupFurniture = piece.getAllFurniture();
          for (var j = 0; j < groupFurniture.length; j++) {
            groupFurniture[j].removePropertyChangeListener(pieceOfFurnitureChangeListener);
          }
        }
      }
    });

  var levelChangeListener = function() {
      panel.updateData(home);
    };
  var levels = home.getLevels();
  for (var i = 0; i < levels.length; i++) {
    levels[i].addPropertyChangeListener(levelChangeListener);
  }
  home.addLevelsListener(function(ev) {
      if (ev.getType() == CollectionEvent.Type.ADD) {
        ev.getItem().addPropertyChangeListener(levelChangeListener);
      } else {
        ev.getItem().removePropertyChangeListener(levelChangeListener);
      }
    });
}

/**
 * @param {Home} home
 * @private
 */
FurnitureTablePanel.prototype.addUserPreferencesListeners = function(home) {
  var panel = this;
  this.preferencesListener = function(ev) {
      if (ev.getPropertyName() == "UNIT" || ev.getPropertyName() == "LANGUAGE") {
        panel.treeTable.setModel(panel.createTableModel(home));
      }
    };
  this.preferences.addPropertyChangeListener(this.preferencesListener);
}

/**
 * Returns a new table model matching home furniture.
 * @param {Home} home 
 * @return {TreeTableModel}
 * @private
 */
FurnitureTablePanel.prototype.createTableModel = function(home) {
  var availableColumns = {
      "CATALOG_ID": {
        name: "CATALOG_ID", 
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "catalogIdColumn"),
        defaultWidth: "4rem"
      },
      "NAME": {
        name: "NAME", 
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "nameColumn"),
        defaultWidth: "14rem"
      },
      "DESCRIPTION": {
        name: "DESCRIPTION", 
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "descriptionColumn"),
        defaultWidth: "14rem"
      },
      "WIDTH": {
        name: "WIDTH", 
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "widthColumn") 
      },
      "DEPTH": {
        name: "DEPTH",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "depthColumn")
      },
      "HEIGHT": {
        name: "HEIGHT",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "heightColumn")
      },
      "MOVABLE": {
        name: "MOVABLE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "movableColumn")
      },
      "DOOR_OR_WINDOW": {
        name: "DOOR_OR_WINDOW",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "doorOrWindowColumn")
      },
      "COLOR": {
        name: "COLOR",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "colorColumn")
      },
      "TEXTURE": {
        name: "TEXTURE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "textureColumn")
      },
      "VISIBLE": {
        name: "VISIBLE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "visibleColumn")
      },
      "X": {
        name: "X",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "xColumn")
      },
      "Y": {
        name: "Y",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "yColumn")
      },
      "ELEVATION": {
        name: "ELEVATION",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "elevationColumn")
      },
      "ANGLE": {
        name: "ANGLE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "angleColumn")
      },
      "MODEL_SIZE": {
        name: "MODEL_SIZE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "modelSizeColumn")
      },
      "CREATOR": {
        name: "CREATOR",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "creatorColumn")
      },
      "LICENSE": {
        name: "LICENSE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "licenseColumn"),
        defaultWidth: "5rem"
      },
      "PRICE": {
        name: "PRICE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "priceColumn")
      },
      "VALUE_ADDED_TAX": {
        name: "VALUE_ADDED_TAX",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "valueAddedTaxColumn")
      },
      "VALUE_ADDED_TAX_PERCENTAGE": {
        name: "VALUE_ADDED_TAX_PERCENTAGE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "valueAddedTaxPercentageColumn")
      },
      "PRICE_VALUE_ADDED_TAX_INCLUDED": {
        name: "PRICE_VALUE_ADDED_TAX_INCLUDED",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "priceValueAddedTaxIncludedColumn")
      },
      "LEVEL": {
        name: "LEVEL",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "levelColumn")
      }
    };
  var visibleColumns = [];
  var visibleProperties = home.getFurnitureVisibleProperties();
  for (var i = 0; i < visibleProperties.length; i++) {
    for (var j in availableColumns) {
      if (visibleProperties[i] == availableColumns[j].name) {
        visibleColumns.push(availableColumns[j]);
      }
    }
  }
  var expandedRowsIndices = [];
  if (home.getVersion() >= 5000) {
    var expandedRows = home.getProperty(FurnitureTablePanel.EXPANDED_ROWS_VISUAL_PROPERTY);
    if (expandedRows != null) {
      expandedRowsIndices = [];
      var expandedRowsEntries = expandedRows.split(",");
      for (var i = 0; i < expandedRowsEntries.length; i++) {
        var rowIndex = parseInt(expandedRowsEntries[i]);
        if (!isNaN(rowIndex)) {
          expandedRowsIndices.push(rowIndex);
        }
      }
    }
  }

  var panel = this;
  return {
      columns: visibleColumns,
      renderCell: function(value, columnName, cell) {
        return panel.renderCell(value, columnName, cell);
      },
      getValueComparator: function(sortConfig) {
        if (sortConfig.columnName != null) {
          var furnitureComparator = HomePieceOfFurniture.getFurnitureComparator(sortConfig.columnName);
          if (sortConfig.direction == "desc") {
            return function(o1, o2) {
                return furnitureComparator(o2, o1);
              };
          } else {
            return furnitureComparator;
          } 
        } else {
          return null;
        }
      },
      selectionChanged: function(selectedValues) {
        if (panel.controller !== null) {
          panel.controller.setSelectedFurniture(selectedValues, false);
        }
      },
      rowDoubleClicked: function(value) {
        if (panel.controller !== null) {
          panel.controller.modifySelectedFurniture(value);
        }
      },
      expandedRowsChanged: function(expandedRowsValues, expandedRowsIndices) {
        if (panel.controller !== null) {
          panel.storeExpandedRows(expandedRowsIndices, home, panel.controller);
        }
      },
      sortChanged: function(newSort) {
        if (panel.controller !== null) {
          panel.controller.sortFurniture(newSort.columnName);
        }
      },
      initialState: {
        visibleColumnNames: visibleProperties,
        sort: {
          columnName: home.getFurnitureSortedProperty(),
          direction: home.isFurnitureDescendingSorted() ? "desc" : "asc"
        },
        expandedRowsIndices: expandedRowsIndices
      }
    };
}

/**
 * Refreshes data list and updates UI.
 * @param {Home} home
 * @private
 */
FurnitureTablePanel.prototype.updateData = function(home) {
  var dataList = [];
  var addToDataList = function(furnitureList, dataList) {
      for (var i = 0; i < furnitureList.length; i++) {
        var piece = furnitureList[i];
        var dataItem = { value: piece };
        if (piece instanceof HomeFurnitureGroup) {
          dataItem.children = [];
          addToDataList(piece.getFurniture(), dataItem.children);
        }
        dataList.push(dataItem);
      }
    };
    
  addToDataList(home.getFurniture(), dataList);
  this.treeTable.setData(dataList);
}

/**
 * Refreshes data row matching the given piece of furniture and its parent groups.
 * @param {Home} home
 * @param {HomePieceOfFurniture} piece
 * @param {string} [propertyName]
 * @private
 */
FurnitureTablePanel.prototype.updatePieceOfFurnitureData = function(home, piece, propertyName) {
  this.treeTable.updateRowData(piece, propertyName);
 
  var panel = this;
  var updatePieceGroupsRowData = function(furniture, propertyName) {
      for (var i = 0; i < furniture.length; i++) {
        if (furniture[i] === piece) {
          return true;
        } else if (furniture[i] instanceof HomeFurnitureGroup) {
          var parent = updatePieceGroupsRowData(furniture[i].getFurniture(), propertyName);
          if (parent) {
            panel.treeTable.updateRowData(furniture[i], propertyName);
          }
          return parent;
        }
      }
      return false;
    };
  
  if (propertyName === undefined) {
    updatePieceGroupsRowData(home.getFurniture(), propertyName);
  }
  // Update row data depending on prices and VAT
  if (propertyName == "PRICE"
      || propertyName == "VALUE_ADDED_TAX_PERCENTAGE") {
    updatePieceGroupsRowData(home.getFurniture(), propertyName);
    this.treeTable.updateRowData(piece, "PRICE_VALUE_ADDED_TAX_INCLUDED");
    updatePieceGroupsRowData(home.getFurniture(), "PRICE_VALUE_ADDED_TAX_INCLUDED");
  }
  if (propertyName == "VALUE_ADDED_TAX_PERCENTAGE") {
    updatePieceGroupsRowData(home.getFurniture(), propertyName);
    this.treeTable.updateRowData(piece, "VALUE_ADDED_TAX");
    updatePieceGroupsRowData(home.getFurniture(), "VALUE_ADDED_TAX");
  }
  if (propertyName == "CURRENCY") {
    this.treeTable.updateRowData(piece, "PRICE");
    updatePieceGroupsRowData(home.getFurniture(), "PRICE");
    this.treeTable.updateRowData(piece, "PRICE_VALUE_ADDED_TAX_INCLUDED");
    updatePieceGroupsRowData(home.getFurniture(), "PRICE_VALUE_ADDED_TAX_INCLUDED");
  }
}

/**
 * Returns false if furniture is nested in a group.
 * @param {HomePieceOfFurniture} piece
 * @return {boolean}
 * @private
 */
FurnitureTablePanel.prototype.isRootPieceOfFurniture = function(piece) {
  var dataList = this.treeTable.getData();
  for (var i = 0; i < dataList.length; i++) {
    if (dataList[i].value == piece) {
      return true;
    }
  }
  return false;
}

/**
 * @param {number} value
 * @param {HTMLTableCellElement} cell
 * @param {Format} [format] 
 * @private
 */
FurnitureTablePanel.prototype.renderNumberCellValue = function(value, cell, format) {
  if (!format) {
    format = this.defaultDecimalFormat;
  }
  var text = "";
  if (value != null) {
    text = format.format(value);
  }
  cell.innerHTML = text;
  cell.classList.add("number");
}

/**
 * @param {number} value
 * @param {HTMLTableCellElement} cell
 * @private
 */
FurnitureTablePanel.prototype.renderSizeCellValue = function(value, cell) {
  this.renderNumberCellValue(value, cell, this.preferences.getLengthUnit().getFormat());
}

/**
 * @param {HomePieceOfFurniture} piece
 * @param {HTMLTableCellElement} cell
 * @private
 */
FurnitureTablePanel.prototype.renderNameCell = function(piece, cell) {
  while (cell.firstChild) {
    cell.removeChild(cell.firstChild);
  }
  cell.classList.add("main", "name");
  var iconElement = document.createElement("span");
  iconElement.setAttribute("icon", true);
  var icon = piece instanceof HomeFurnitureGroup
      ? new URLContent(ZIPTools.getScriptFolder() + "resources/groupIcon.png")
      : piece.getIcon();
  if (icon != null) {
    TextureManager.getInstance().loadTexture(icon, 0, false,
        {
          textureUpdated : function(image) {
            iconElement.appendChild(image.cloneNode());
          },
          textureError : function(error) {
            return this.textureUpdated(TextureManager.getInstance().getErrorImage());
          }
        });
  } else {
    var emptyImage = document.createElement("img");
    emptyImage.width = 15;
    iconElement.appendChild(emptyImage);
  }
  cell.appendChild(iconElement);

  var nameElement = document.createElement("span");
  nameElement.textContent = piece.getName();
  cell.appendChild(nameElement);
}

/**
 * @param {HomePieceOfFurniture} piece
 * @param {HTMLTableCellElement} cell
 * @private
 */
FurnitureTablePanel.prototype.renderColorCell = function(piece, cell) {
  while (cell.firstChild) {
    cell.removeChild(cell.firstChild);
  }
  cell.classList.add("color");
  if (piece.getColor() != null) {
    var colorSquare = document.createElement("div");
    colorSquare.style.backgroundColor = ColorTools.integerToHexadecimalString(piece.getColor());
    cell.appendChild(colorSquare);
  } else {
    cell.textContent = "-";
  }
}

/**
 * @param {HomePieceOfFurniture} piece
 * @param {HTMLTableCellElement} cell
 * @private
 */
FurnitureTablePanel.prototype.renderTextureCell = function(piece, cell) {
  while (cell.firstChild) {
    cell.removeChild(cell.firstChild);
  }
  cell.classList.add("texture");
  if (piece.getTexture() != null) {
    var previewSquare = document.createElement("div");
    TextureManager.getInstance().loadTexture(piece.getTexture().getImage(), 0, false,
        {
          textureUpdated : function(image) {
            previewSquare.style.backgroundImage = "url('" + image.src + "')";
          },
          textureError : function(error) {
            return this.textureUpdated(TextureManager.getInstance().getErrorImage());
          }
        });

    cell.appendChild(previewSquare);
  }
}

/**
 * @param {boolean} value
 * @param {HTMLTableCellElement} cell
 * @param {boolean} [editEnabled] default to false
 * @param {function(checkedState: boolean)} [stateChanged]
 * @private
 */
FurnitureTablePanel.prototype.renderBooleanCell = function(value, cell, editEnabled, stateChanged) {
  while (cell.firstChild) {
    cell.removeChild(cell.firstChild);
  }
  cell.classList.add("boolean");
  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.disabled = editEnabled !== true;
  checkbox.checked = value === true;
  checkbox.tabIndex = -1;
  if (stateChanged !== undefined) {
    checkbox.addEventListener("click", function(ev) {
          stateChanged(checkbox.checked);
        }, 
        true);
  }
  cell.appendChild(checkbox);
}

/**
 * @param {HomePieceOfFurniture} piece
 * @param {Big} value
 * @param {HTMLTableCellElement} cell
 * @private
 */
FurnitureTablePanel.prototype.renderPriceCellValue = function(piece, value, cell) {
  var currency = piece.getCurrency() == null 
      ? this.preferences.getCurrency() 
      : piece.getCurrency();
  var currencyFormat = NumberFormat.getCurrencyInstance(); 
  currencyFormat.setCurrency(currency);
  this.renderNumberCellValue(this.bigToNumber(value), cell, currencyFormat);
}

/**
 * @param {Big} bigNumber
 * @return {number}
 * @private
 */
FurnitureTablePanel.prototype.bigToNumber = function(bigNumber) {
  return bigNumber == null ? null : parseFloat(bigNumber.valueOf());
}

/**
 * @param {HomePieceOfFurniture} piece
 * @param {HTMLTableCellElement} cell
 * @private
 */
FurnitureTablePanel.prototype.renderCreatorCell = function(piece, cell) {
  var creator = piece.getCreator();
  if (creator != null) {
    var texture = piece.getTexture();
    if (texture != null) {
      var textureCreator = texture.getCreator();
      if (textureCreator != null && creator != textureCreator) {
        creator += ", " + textureCreator;
      }
    } else {
      var modelCreator = creator;
      var materials = piece.getModelMaterials();
      if (materials != null) {
        for (var i = 0; i < materials.length; i++) {
          var material = materials[i];
          if (material != null) {
            var materialTexture = material.getTexture();
            if (materialTexture != null) {
              var textureCreator = materialTexture.getCreator();
              if (textureCreator != null
                && modelCreator != textureCreator
                && creator.indexOf(", " + textureCreator) == -1) {
                creator += ", " + textureCreator;
              }
            }
          }
        }
      }
    }
  }
  cell.textContent = creator;
}

/**
 * @param {string} value
 * @param {HTMLTableCellElement} cell
 * @private
 */
FurnitureTablePanel.prototype.renderTextCell = function(value, cell) {
  cell.textContent = value;
}

/**
 * @param {HomePieceOfFurniture} piece
 * @param {string} columnName
 * @param {HTMLTableCellElement} cell
 * @private
 */
FurnitureTablePanel.prototype.renderCell = function(piece, columnName, cell) {
  switch (columnName) {
    case "CATALOG_ID":
      return this.renderTextCell(piece.getCatalogId(), cell);
    case "NAME":
      return this.renderNameCell(piece, cell);
    case "DESCRIPTION":
      return this.renderTextCell(piece.getDescription(), cell);
    case "CREATOR":
      return this.renderCreatorCell(piece, cell);
    case "LICENSE":
      return this.renderTextCell(piece.getLicense(), cell);
    case "WIDTH":
      return this.renderSizeCellValue(piece.getWidth(), cell);
    case "DEPTH":
      return this.renderSizeCellValue(piece.getDepth(), cell);
    case "HEIGHT":
      return this.renderSizeCellValue(piece.getHeight(), cell);
    case "X":
      return this.renderSizeCellValue(piece.getX(), cell);
    case "Y":
      return this.renderSizeCellValue(piece.getY(), cell);
    case "ELEVATION":
      return this.renderSizeCellValue(piece.getElevation(), cell);
    case "ANGLE":
      var value = Math.round(Math.toDegrees(piece.getAngle()) + 360) % 360;
      return this.renderNumberCellValue(value, cell, this.integerFormat);
    case "LEVEL":
      cell.textContent = piece != null && piece.getLevel() != null ? piece.getLevel().getName() : "";
      break;
    case "MODEL_SIZE":
      var value = piece != null && piece.getModelSize() != null && piece.getModelSize() > 0
        ? Math.max(1, Math.round(piece.getModelSize() / 1000))
        : null;
      return this.renderNumberCellValue(value, cell, this.integerFormat);
    case "COLOR":
      return this.renderColorCell(piece, cell);
    case "TEXTURE":
      return this.renderTextureCell(piece, cell);
    case "MOVABLE":
      return this.renderBooleanCell(piece.isMovable(), cell);
    case "DOOR_OR_WINDOW":
      return this.renderBooleanCell(piece.isDoorOrWindow(), cell);
    case "VISIBLE":
      var controller = this.controller;
      return this.renderBooleanCell(piece.isVisible(), cell, this.isRootPieceOfFurniture(piece), 
          function(checked) {
            if (controller !== null) {
              controller.toggleSelectedFurnitureVisibility();
            }
          });
    case "PRICE":
      return this.renderPriceCellValue(piece, piece.getPrice(), cell);
    case "VALUE_ADDED_TAX_PERCENTAGE":
      return this.renderNumberCellValue(piece.getValueAddedTaxPercentage() !== null 
          ? this.bigToNumber(piece.getValueAddedTaxPercentage()) * 100 : null, cell);
    case "VALUE_ADDED_TAX":
      return this.renderPriceCellValue(piece, piece.getValueAddedTax(), cell);
    case "PRICE_VALUE_ADDED_TAX_INCLUDED":
      return this.renderPriceCellValue(piece, piece.getPriceValueAddedTaxIncluded(), cell);
    default:
      cell.textContent = "-";
      break;
  }
}

/**
 * Stores expanded rows in home.
 * @param {number[]} expandedRowsIndices index based on filtered and sorted data list
 * @param {Home} home
 * @param {FurnitureController} controller
 * @private
 */
FurnitureTablePanel.prototype.storeExpandedRows = function(expandedRowsIndices, home, controller) {
  var propertyValue = expandedRowsIndices.join(',');
  if (home.getProperty(FurnitureTablePanel.EXPANDED_ROWS_VISUAL_PROPERTY) != null || propertyValue.length > 0) {
    controller.setHomeProperty(FurnitureTablePanel.EXPANDED_ROWS_VISUAL_PROPERTY, propertyValue);
  }
}

/** 
 * Removes components added to this panel and their listeners.
 */
FurnitureTablePanel.prototype.dispose = function() {
  this.treeTable.dispose();
  this.preferences.removePropertyChangeListener(this.preferencesListener);
}
