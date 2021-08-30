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
  this.refreshData(home);
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
        treeTable.setSelectedRowsByValue(home.getSelectedItems())
      }
    });

  var refreshModel = function() {
      treeTable.setModel(panel.createTableModel(home));
    };
  home.addPropertyChangeListener("FURNITURE_SORTED_PROPERTY", refreshModel);
  home.addPropertyChangeListener("FURNITURE_DESCENDING_SORTED", refreshModel);
  home.addPropertyChangeListener("FURNITURE_VISIBLE_PROPERTIES", refreshModel);

  var refreshData = function() {
      panel.refreshData(home);
    };
  var furniture = home.getFurniture();
  for (var i = 0; i < furniture.length; i++) {
    var piece = furniture[i];
    piece.addPropertyChangeListener(refreshData);
    if (piece instanceof HomeFurnitureGroup) {
      var groupFurniture = piece.getAllFurniture();
      for (var j = 0; j < groupFurniture.length; j++) {
        groupFurniture[j].addPropertyChangeListener(refreshData);
      }
    }
  }

  home.addFurnitureListener(function(ev) {
      refreshData(home);
      var piece = ev.getItem();
      if (ev.getType() == CollectionEvent.Type.ADD) {
        piece.addPropertyChangeListener(refreshData);
        if (piece instanceof HomeFurnitureGroup) {
          var groupFurniture = piece.getAllFurniture();
          for (var j = 0; j < groupFurniture.length; j++) {
            groupFurniture[j].addPropertyChangeListener(refreshData);
          }
        }
      } else {
        piece.removePropertyChangeListener(refreshData);
        if (piece instanceof HomeFurnitureGroup) {
          var groupFurniture = piece.getAllFurniture();
          for (var j = 0; j < groupFurniture.length; j++) {
            groupFurniture[j].removePropertyChangeListener(refreshData);
          }
        }
      }
    });

  var levels = home.getLevels();
  for (var i = 0; i < levels.length; i++) {
    levels[i].addPropertyChangeListener(refreshData);
  }
  home.addLevelsListener(function(ev) {
      if (ev.getType() == CollectionEvent.Type.ADD) {
        ev.getItem().addPropertyChangeListener(refreshData);
      } else {
        ev.getItem().removePropertyChangeListener(refreshData);
      }
    });
}

/**
 * @param {Home} home
 * @private
 */
FurnitureTablePanel.prototype.addUserPreferencesListeners = function(home) {
  var panel = this;
  this.preferences.addPropertyChangeListener(function(ev) {
      if (ev.getPropertyName() == "UNIT" || ev.getPropertyName() == "LANGUAGE") {
        panel.treeTable.setModel(panel.createTableModel(home));
      }
    });
}

/**
 * Returns a new table model matching home furniture.
 * @param {Home} home 
 * @return {TreeTableModel}
 * @private
 */
FurnitureTablePanel.prototype.createTableModel = function(home) {
  var columns = {
      "CATALOG_ID": {
        name: "CATALOG_ID", 
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "catalogIdColumn"), 
        orderIndex: i++,
        defaultWidth: "4rem"
      },
      "NAME": {
        name: "NAME", 
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "nameColumn"), 
        orderIndex: i++,
        defaultWidth: "14rem"
      },
      "WIDTH": {
        name: "WIDTH", 
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "widthColumn"), 
        orderIndex: i++,
      },
      "DEPTH": {
        name: "DEPTH",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "depthColumn"),
        orderIndex: i++
      },
      "HEIGHT": {
        name: "HEIGHT",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "heightColumn"),
        orderIndex: i++
      },
      "MOVABLE": {
        name: "MOVABLE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "movableColumn"),
        orderIndex: i++
      },
      "DOOR_OR_WINDOW": {
        name: "DOOR_OR_WINDOW",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "doorOrWindowColumn"),
        orderIndex: i++
      },
      "COLOR": {
        name: "COLOR",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "colorColumn"),
        orderIndex: i++
      },
      "TEXTURE": {
        name: "TEXTURE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "textureColumn"),
        orderIndex: i++
      },
      "VISIBLE": {
        name: "VISIBLE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "visibleColumn"),
        orderIndex: i++
      },
      "X": {
        name: "X",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "xColumn"),
        orderIndex: i++
      },
      "Y": {
        name: "Y",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "yColumn"),
        orderIndex: i++
      },
      "ELEVATION": {
        name: "ELEVATION",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "elevationColumn"),
        orderIndex: i++
      },
      "ANGLE": {
        name: "ANGLE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "angleColumn"),
        orderIndex: i++
      },
      "MODEL_SIZE": {
        name: "MODEL_SIZE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "modelSizeColumn"),
        orderIndex: i++
      },
      "CREATOR": {
        name: "CREATOR",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "creatorColumn"),
        orderIndex: i++
      },
      "PRICE": {
        name: "PRICE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "priceColumn"),
        orderIndex: i++
      },
      "VALUE_ADDED_TAX": {
        name: "VALUE_ADDED_TAX",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "valueAddedTaxColumn"),
        orderIndex: i++
      },
      "VALUE_ADDED_TAX_PERCENTAGE": {
        name: "VALUE_ADDED_TAX_PERCENTAGE",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "valueAddedTaxPercentageColumn"),
        orderIndex: i++
      },
      "PRICE_VALUE_ADDED_TAX_INCLUDED": {
        name: "PRICE_VALUE_ADDED_TAX_INCLUDED",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "priceValueAddedTaxIncludedColumn"),
        orderIndex: i++
      },
      "LEVEL": {
        name: "LEVEL",
        label: ResourceAction.getLocalizedLabelText(this.preferences, "FurnitureTable", "levelColumn"),
        orderIndex: i++
      }
    };
  var visibleColumns = [];
  var visibleProperties = home.getFurnitureVisibleProperties();
  for (var i in columns) {
    if (visibleProperties.indexOf(columns[i].name) > -1) {
      visibleColumns.push(columns[i]);
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
        visibleColumnNames: home.getFurnitureVisibleProperties(),
        sort: {
          columnName: home.getFurnitureSortedProperty(),
          direction: home.isFurnitureDescendingSorted() ? "desc" : "asc"
        },
        expandedRowsIndices: expandedRowsIndices
      }
    };
}

/**
 * Refresh data list and updates UI.
 * @param {Home} home
 * @private
 */
FurnitureTablePanel.prototype.refreshData = function(home) {
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
  cell.classList.add("main", "name");
  var iconElement = document.createElement("span");
  iconElement.setAttribute("icon", true);
  if (piece instanceof HomeFurnitureGroup) {
    iconElement.style.backgroundImage = "url('" + ZIPTools.getScriptFolder() + "/resources/groupIcon.png')";
  } else {
    TextureManager.getInstance().loadTexture(piece.getIcon(), 0, false,
        {
          textureUpdated : function(image) {
            iconElement.appendChild(image.cloneNode());
          },
          textureError : function(error) {
            return this.textureUpdated(TextureManager.getInstance().getErrorImage());
          }
        });
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
  cell.classList.add("texture");
  if (piece.getTexture() != null) {
    var overviewSquare = document.createElement("div");
    TextureManager.getInstance().loadTexture(piece.getTexture().getImage(), 0, false,
        {
          textureUpdated : function(image) {
            overviewSquare.style.backgroundImage = "url('" + image.src + "')";
          },
          textureError : function(error) {
            return this.textureUpdated(TextureManager.getInstance().getErrorImage());
          }
        });

    cell.appendChild(overviewSquare);
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
  cell.classList.add("boolean");
  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.disabled = editEnabled !== true;
  checkbox.checked = value === true;
  if (stateChanged !== undefined) {
    checkbox.addEventListener("click", function(ev) {
          var checked = checkbox.checked;
          stateChanged(checked);
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
  // TODO Manage price format for IE 11
  var priceFormat = new Intl.NumberFormat(this.preferences.getLanguage(), { style: "currency", currency: currency });
  this.renderNumberCellValue(bigToNumber(value), cell, priceFormat);
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
      cell.textContent = piece.getCatalogId();
      break;
    case "NAME":
      return this.renderNameCell(piece, cell);
    case "CREATOR":
      return this.renderCreatorCell(piece, cell);
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
      return this.renderNumberCellValue(bigToNumber(piece.getValueAddedTaxPercentage()) * 100, cell);
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
