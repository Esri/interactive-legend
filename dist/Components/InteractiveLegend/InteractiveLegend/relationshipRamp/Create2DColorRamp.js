define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/core/Handles", "esri/core/watchUtils", "esri/views/layers/support/FeatureEffect", "./relationshipRampUtils", "esri/views/layers/support/FeatureFilter", "esri/core/promiseUtils"], function (require, exports, tslib_1, Accessor, decorators_1, Handles, watchUtils, FeatureEffect, relationshipRampUtils_1, FeatureFilter, promiseUtils) {
    "use strict";
    var Create2DColorRamp = /** @class */ (function (_super) {
        tslib_1.__extends(Create2DColorRamp, _super);
        // ----------------------------------
        //
        //  Lifecycle Methods
        //
        // ----------------------------------
        function Create2DColorRamp(value) {
            var _this = _super.call(this, value) || this;
            // ----------------------------------
            //
            //  Properties
            //
            // ----------------------------------
            _this._handles = new Handles();
            _this._cellNodeCounter = 0;
            _this._cellNodes = null;
            _this.queryCountExpressions = [];
            _this.queryExpressions = [];
            // view
            _this.view = null;
            // legendElement
            _this.legendElement = null;
            // id
            _this.id = null;
            // activeLayerInfos
            _this.activeLayerInfos = null;
            // colorRampProperties
            _this.colorRampProperties = null;
            // renderers
            _this.layerView = null;
            // filterMode
            _this.filterMode = null;
            // opacity
            _this.opacity = null;
            // grayScale
            _this.grayScale = null;
            _this.featureCount = null;
            _this.searchViewModel = null;
            _this.layerListViewModel = null;
            _this.featureCountEnabled = null;
            return _this;
        }
        Create2DColorRamp.prototype.initialize = function () {
            var _this = this;
            this._handles.add([
                watchUtils.when(this, ["layerView", "searchViewModel", "layerListViewModel"], function () {
                    _this._handleCellBehavior();
                    if (_this.featureCountEnabled) {
                        var queryFeatureCount_1 = promiseUtils.debounce(function () {
                            var where = _this.queryExpressions.join(" OR ") === ""
                                ? _this.queryCountExpressions.join(" OR ")
                                : _this.queryExpressions.join(" OR ");
                            var geometry = _this.view && _this.view.get("extent");
                            var outSpatialReference = _this.view && _this.view.get("spatialReference");
                            var queryFeatureCount = _this.layerView &&
                                _this.layerView.queryFeatureCount &&
                                _this.layerView.queryFeatureCount({
                                    geometry: geometry,
                                    outSpatialReference: outSpatialReference,
                                    where: where
                                });
                            if (!queryFeatureCount) {
                                return;
                            }
                            return queryFeatureCount.then(function (totalFeatureCount) {
                                _this.set("featureCount", totalFeatureCount);
                            });
                        });
                        var featureCountKey = "feature-count-key";
                        if (!_this._handles.has(featureCountKey)) {
                            _this._handles.add([
                                watchUtils.whenFalse(_this.view, "stationary", function () {
                                    if (!_this.view.stationary) {
                                        watchUtils.whenTrueOnce(_this.view, "stationary", function () {
                                            queryFeatureCount_1();
                                        });
                                    }
                                    else {
                                        watchUtils.whenFalseOnce(_this.view, "interacting", function () {
                                            queryFeatureCount_1();
                                        });
                                    }
                                }),
                                watchUtils.whenFalse(_this.layerView, "updating", function () {
                                    watchUtils.whenFalseOnce(_this.layerView, "updating", function () {
                                        queryFeatureCount_1();
                                    });
                                })
                            ], featureCountKey);
                        }
                    }
                }),
                watchUtils.init(this, "layerView", function () {
                    if (_this.filterMode === "featureFilter") {
                        var layerViewFilterKey = "layer-view-filter";
                        _this._handles.remove(layerViewFilterKey);
                        _this._handles.add(watchUtils.when(_this, "layerView.filter", function () {
                            var layerViewFilterWhereKey = "layer-view-filter-where";
                            _this._handles.remove(layerViewFilterWhereKey);
                            _this._handles.add(watchUtils.watch(_this, "layerView.filter.where", function () {
                                var cellGroup = _this.colorRampProperties.surface.children[0]
                                    .children;
                                if (!_this.layerView.filter) {
                                    cellGroup.forEach(function (cell) {
                                        cell.rawNode.removeAttribute("stroke");
                                        cell.rawNode.removeAttribute("stroke-width");
                                        cell.rawNode.removeAttribute("stroke-opacity");
                                        cell.rawNode.classList.remove("esri-interactive-legend--selected-cell");
                                    });
                                    _this.queryExpressions = [];
                                    _this._queryFeatureCount();
                                }
                            }), layerViewFilterWhereKey);
                        }), layerViewFilterKey);
                    }
                    else {
                        var layerViewEffectKey = "layer-view-effect";
                        _this._handles.remove(layerViewEffectKey);
                        _this._handles.add(watchUtils.when(_this, "layerView.effect", function () {
                            var layerViewEffectWhereKey = "layer-view-effect-where";
                            _this._handles.remove(layerViewEffectWhereKey);
                            _this._handles.add(watchUtils.watch(_this, "layerView.effect.filter.where", function () {
                                var cellGroup = _this.colorRampProperties.surface.children[0]
                                    .children;
                                if (!_this.layerView.filter) {
                                    cellGroup.forEach(function (cell) {
                                        var rawNode = cell.rawNode;
                                        rawNode.removeAttribute("stroke");
                                        rawNode.removeAttribute("stroke-width");
                                        rawNode.removeAttribute("stroke-opacity");
                                        rawNode.classList.remove("esri-interactive-legend--selected-cell");
                                    });
                                    _this.queryExpressions = [];
                                    _this._queryFeatureCount();
                                }
                            }), layerViewEffectWhereKey);
                        }), layerViewEffectKey);
                    }
                })
            ]);
        };
        Create2DColorRamp.prototype.destroy = function () {
            this._handles.removeAll();
            this._handles.destroy();
            this._handles = null;
        };
        //----------------------------------
        //
        //  Public Methods
        //
        //----------------------------------
        // generateCells
        Create2DColorRamp.prototype.generateCells = function () {
            var _a = this.colorRampProperties, surface = _a.surface, colors = _a.colors, numClasses = _a.numClasses, size = _a.size, gfxMatrix = _a.gfxMatrix, translateX = _a.translateX, translateY = _a.translateY, centerX = _a.centerX, centerY = _a.centerY, rotation = _a.rotation;
            var shapeGroup = surface.createGroup();
            var groupSize = size || 75;
            var cellSize = groupSize / numClasses;
            for (var i = 0; i < numClasses; i++) {
                var y = i * cellSize;
                for (var j = 0; j < numClasses; j++) {
                    var fill = colors[i][j];
                    var x = j * cellSize;
                    shapeGroup
                        .createRect({ x: x, y: y, width: cellSize, height: cellSize })
                        .setFill(fill);
                }
            }
            shapeGroup.applyTransform(gfxMatrix.translate(translateX, translateY));
            shapeGroup.applyTransform(gfxMatrix.rotategAt(rotation, centerX, centerY));
            this._handleCellBehavior();
            return;
        };
        //----------------------------------
        //
        //  Private Methods
        //
        //----------------------------------
        Create2DColorRamp.prototype._handleCellBehavior = function () {
            var legendElement = this.legendElement;
            var authoringInfo = this.layerView && this.layerView.layer && this.layerView.layer.renderer
                ? this.layerView.layer.renderer.authoringInfo
                : null;
            if (legendElement.type === "relationship-ramp" &&
                authoringInfo &&
                authoringInfo.field1 &&
                authoringInfo.field2) {
                this._applyCellBehavior(this.colorRampProperties.surface);
            }
        };
        // _applyCellBehavior
        Create2DColorRamp.prototype._applyCellBehavior = function (surface) {
            var _this = this;
            if (surface.children.length === 0) {
                return;
            }
            var cellGroup = surface.children[0].children;
            cellGroup.map(function (cell, cellIndex) {
                var uvInfos = _this.layerView.layer
                    .renderer.uniqueValueInfos;
                if (_this.legendElement.type === "relationship-ramp" &&
                    _this.layerView.layer.renderer.authoringInfo &&
                    uvInfos) {
                    if (uvInfos[cellIndex]) {
                        var color_1 = uvInfos[cellIndex].symbol.color;
                        uvInfos.forEach(function (uvInfo, index) {
                            var itemColor = uvInfo.symbol.color;
                            if (color_1.r === itemColor.r &&
                                color_1.g === itemColor.g &&
                                color_1.b === itemColor.b &&
                                color_1.a === itemColor.a) {
                                _this._setCellAttributes(cell, index);
                            }
                        });
                        cell.rawNode.classList.add("esri-interactive-legend__svg-rect-element");
                    }
                }
            });
            var cellItems = this._reorderCellNodes(cellGroup);
            this._attachFeatureIndexes(cellItems);
            this._cellNodes = cellItems;
            this._applyEventHandlers(cellGroup);
        };
        Create2DColorRamp.prototype._generateTotalFeatureCount = function () {
            var _this = this;
            var where = this.queryExpressions.join(" OR ") === ""
                ? this.queryCountExpressions.join(" OR ")
                : this.queryExpressions.join(" OR ");
            this.layerView
                .queryFeatureCount({
                where: where
            })
                .then(function (totalFeatureCount) {
                _this.set("featureCount", totalFeatureCount);
            });
        };
        // _reorderCellNodes
        Create2DColorRamp.prototype._reorderCellNodes = function (cellGroup) {
            var _this = this;
            var cellItems = [];
            while (this._cellNodeCounter <= cellGroup.length - 1) {
                cellGroup.map(function (cell) {
                    if (parseInt(cell.rawNode.getAttribute("data-cell-index")) ===
                        _this._cellNodeCounter) {
                        cellItems.push(cell);
                    }
                });
                this._cellNodeCounter++;
            }
            this._cellNodeCounter = 0;
            return cellItems;
        };
        // _attachFeatureIndexes
        Create2DColorRamp.prototype._attachFeatureIndexes = function (cellItems) {
            var focus = this.colorRampProperties.focus;
            focus === "HH" || focus === null
                ? this._relationshipFocusIsHighHigh(cellItems)
                : focus === "LL"
                    ? this._relationshipFocusIsLowLow(cellItems)
                    : focus === "LH"
                        ? this._relationshipFocusIsLowHigh(cellItems)
                        : focus === "HL"
                            ? this._relationshipFocusIsHighLow(cellItems)
                            : null;
            this._cellNodeCounter = 0;
        };
        // _relationshipFocusIsHighHigh
        Create2DColorRamp.prototype._relationshipFocusIsHighHigh = function (cellItems) {
            for (var i = this.colorRampProperties.numClasses - 1; i >= 0; i--) {
                for (var j = this.colorRampProperties.numClasses - 1; j >= 0; j--) {
                    this._setDataAttributes(cellItems, i, j);
                    this._cellNodeCounter++;
                }
            }
        };
        // _relationshipFocusIsLowLow
        Create2DColorRamp.prototype._relationshipFocusIsLowLow = function (cellItems) {
            for (var i = 0; i < this.colorRampProperties.numClasses; i++) {
                for (var j = 0; j < this.colorRampProperties.numClasses; j++) {
                    this._setDataAttributes(cellItems, i, j);
                    this._cellNodeCounter++;
                }
            }
        };
        // _relationshipFocusIsLowHigh
        Create2DColorRamp.prototype._relationshipFocusIsLowHigh = function (cellItems) {
            for (var i = 0; i < this.colorRampProperties.numClasses; i++) {
                for (var j = this.colorRampProperties.numClasses - 1; j >= 0; j--) {
                    this._setDataAttributes(cellItems, i, j);
                    this._cellNodeCounter++;
                }
            }
        };
        // _relationshipFocusIsHighLow
        Create2DColorRamp.prototype._relationshipFocusIsHighLow = function (cellItems) {
            for (var j = this.colorRampProperties.numClasses - 1; j >= 0; j--) {
                for (var i = 0; i < this.colorRampProperties.numClasses; i++) {
                    this._setDataAttributes(cellItems, i, j);
                    this._cellNodeCounter++;
                }
            }
        };
        // _setDataAttributes
        Create2DColorRamp.prototype._setDataAttributes = function (cellItems, i, j) {
            var rawNode = cellItems[this._cellNodeCounter].rawNode;
            if (this.colorRampProperties.numClasses === 2) {
                this._twoClassAttributes(rawNode, i, j);
            }
            else if (this.colorRampProperties.numClasses === 3) {
                this._threeClassAttributes(rawNode, i, j);
            }
            else {
                this._fourClassAttributes(rawNode, i, j);
            }
        };
        // _setCellAttributes
        Create2DColorRamp.prototype._setCellAttributes = function (cell, index) {
            var uvInfo = this.layerView.layer.renderer
                .uniqueValueInfos;
            if (this.legendElement.type === "relationship-ramp" &&
                this.layerView.layer.renderer.authoringInfo &&
                uvInfo) {
                var numClasses = this.colorRampProperties.numClasses;
                var newIndex = this._generateIndexPattern(numClasses, index);
                if (uvInfo[newIndex]) {
                    cell.rawNode.setAttribute("data-color", "" + uvInfo[newIndex].symbol.color);
                    cell.rawNode.setAttribute("data-cell-index", "" + newIndex);
                    cell.rawNode.setAttribute("tabindex", "0");
                }
            }
        };
        // _setDataCellFocus
        Create2DColorRamp.prototype._setDataCellFocus = function (rawNode, i, j) {
            var numClasses = this.colorRampProperties.numClasses;
            if (numClasses === 2) {
                this._setDataCellFocusForTwoClasses(rawNode, i, j);
            }
            else if (numClasses === 3) {
                this._setDataCellFocusForThreeClasses(rawNode, i, j);
            }
            else if (numClasses === 4) {
                this._setDataCellFocusForFourClasses(rawNode, i, j);
            }
        };
        Create2DColorRamp.prototype._setDataCellFocusForTwoClasses = function (rawNode, i, j) {
            i === 0 && j === 0
                ? rawNode.setAttribute("data-cell-focus", "LL")
                : i === 0 && j === 1
                    ? rawNode.setAttribute("data-cell-focus", "LH")
                    : i === 1 && j === 0
                        ? rawNode.setAttribute("data-cell-focus", "HL")
                        : i === 1 && j === 1
                            ? rawNode.setAttribute("data-cell-focus", "HH")
                            : null;
        };
        Create2DColorRamp.prototype._setDataCellFocusForThreeClasses = function (rawNode, i, j) {
            i === 0 && j === 0
                ? rawNode.setAttribute("data-cell-focus", "LL")
                : i === 0 && j === 1
                    ? rawNode.setAttribute("data-cell-focus", "LM")
                    : i === 0 && j === 2
                        ? rawNode.setAttribute("data-cell-focus", "LH")
                        : i === 1 && j === 0
                            ? rawNode.setAttribute("data-cell-focus", "ML")
                            : i === 1 && j === 1
                                ? rawNode.setAttribute("data-cell-focus", "MM")
                                : i === 1 && j === 2
                                    ? rawNode.setAttribute("data-cell-focus", "MH")
                                    : i === 2 && j === 0
                                        ? rawNode.setAttribute("data-cell-focus", "HL")
                                        : i === 2 && j === 1
                                            ? rawNode.setAttribute("data-cell-focus", "HM")
                                            : i === 2 && j === 2
                                                ? rawNode.setAttribute("data-cell-focus", "HH")
                                                : null;
        };
        Create2DColorRamp.prototype._setDataCellFocusForFourClasses = function (rawNode, i, j) {
            i === 0 && j === 0
                ? rawNode.setAttribute("data-cell-focus", "LL")
                : i === 0 && j === 1
                    ? rawNode.setAttribute("data-cell-focus", "LM1")
                    : i === 0 && j === 2
                        ? rawNode.setAttribute("data-cell-focus", "LM2")
                        : i === 0 && j === 3
                            ? rawNode.setAttribute("data-cell-focus", "LH")
                            : i === 1 && j === 0
                                ? rawNode.setAttribute("data-cell-focus", "M1L")
                                : i === 1 && j === 1
                                    ? rawNode.setAttribute("data-cell-focus", "M1M1")
                                    : i === 1 && j === 2
                                        ? rawNode.setAttribute("data-cell-focus", "M1M2")
                                        : i === 1 && j === 3
                                            ? rawNode.setAttribute("data-cell-focus", "M1H")
                                            : i === 2 && j === 0
                                                ? rawNode.setAttribute("data-cell-focus", "M2L")
                                                : i === 2 && j === 1
                                                    ? rawNode.setAttribute("data-cell-focus", "M2M1")
                                                    : i === 2 && j === 2
                                                        ? rawNode.setAttribute("data-cell-focus", "M2M2")
                                                        : i === 2 && j === 3
                                                            ? rawNode.setAttribute("data-cell-focus", "M2H")
                                                            : i === 3 && j === 0
                                                                ? rawNode.setAttribute("data-cell-focus", "HL")
                                                                : i === 3 && j === 1
                                                                    ? rawNode.setAttribute("data-cell-focus", "HM1")
                                                                    : i === 3 && j === 2
                                                                        ? rawNode.setAttribute("data-cell-focus", "HM2")
                                                                        : i === 3 && j === 3
                                                                            ? rawNode.setAttribute("data-cell-focus", "HH")
                                                                            : null;
        };
        // _generateIndexPattern
        Create2DColorRamp.prototype._generateIndexPattern = function (numClasses, index) {
            var focus = this.colorRampProperties.focus;
            if (focus === "HL") {
                return index;
            }
            return numClasses === 2
                ? relationshipRampUtils_1.twoClasses(index, focus)
                : numClasses === 3
                    ? relationshipRampUtils_1.threeClasses(index, focus)
                    : numClasses === 4
                        ? relationshipRampUtils_1.fourClasses(index, focus)
                        : null;
        };
        // _swapDataFeatureIndexes
        Create2DColorRamp.prototype._swapDataFeatureIndexes = function (rawNode, i, j) {
            rawNode.setAttribute("data-feature-i", "" + j);
            rawNode.setAttribute("data-feature-j", "" + i);
            this._setDataCellFocus(rawNode, j, i);
        };
        // _setDataFeatureIndexes
        Create2DColorRamp.prototype._setDataFeatureIndexes = function (rawNode, i, j) {
            rawNode.setAttribute("data-feature-i", "" + i);
            rawNode.setAttribute("data-feature-j", "" + j);
            this._setDataCellFocus(rawNode, i, j);
        };
        // _twoClassAttributes
        Create2DColorRamp.prototype._twoClassAttributes = function (rawNode, i, j) {
            if (this._cellNodeCounter === 0 || this._cellNodeCounter === 3) {
                this.colorRampProperties.focus === "HL"
                    ? this._swapDataFeatureIndexes(rawNode, i, j)
                    : this._setDataFeatureIndexes(rawNode, i, j);
            }
            else {
                this.colorRampProperties.focus === "HL"
                    ? this._swapDataFeatureIndexes(rawNode, i, j)
                    : this._setDataFeatureIndexes(rawNode, i, j);
            }
        };
        // _threeClassAttributes
        Create2DColorRamp.prototype._threeClassAttributes = function (rawNode, i, j) {
            if (this._cellNodeCounter === 1 ||
                this._cellNodeCounter === 3 ||
                this._cellNodeCounter === 5 ||
                this._cellNodeCounter === 7) {
                this.colorRampProperties.focus === "HL"
                    ? this._swapDataFeatureIndexes(rawNode, i, j)
                    : this._setDataFeatureIndexes(rawNode, i, j);
            }
            else {
                this.colorRampProperties.focus !== "HL"
                    ? this._setDataFeatureIndexes(rawNode, i, j)
                    : this._swapDataFeatureIndexes(rawNode, i, j);
            }
        };
        // _fourClassAttributes
        Create2DColorRamp.prototype._fourClassAttributes = function (rawNode, i, j) {
            if (this._cellNodeCounter === 1 ||
                this._cellNodeCounter === 2 ||
                this._cellNodeCounter === 4 ||
                this._cellNodeCounter === 5 ||
                this._cellNodeCounter === 7 ||
                this._cellNodeCounter === 8 ||
                this._cellNodeCounter === 10 ||
                this._cellNodeCounter === 11 ||
                this._cellNodeCounter === 13 ||
                this._cellNodeCounter === 14) {
                this.colorRampProperties.focus === "HL"
                    ? this._swapDataFeatureIndexes(rawNode, i, j)
                    : this._setDataFeatureIndexes(rawNode, i, j);
            }
            else {
                this.colorRampProperties.focus !== "HL"
                    ? this._setDataFeatureIndexes(rawNode, i, j)
                    : this._swapDataFeatureIndexes(rawNode, i, j);
            }
        };
        // _applyEventHandlers
        Create2DColorRamp.prototype._applyEventHandlers = function (cellGroup) {
            var _this = this;
            cellGroup.map(function (cell, cellIndex) {
                var i = cell.rawNode.getAttribute("data-feature-i");
                var j = cell.rawNode.getAttribute("data-feature-j");
                var focus = cell.rawNode.getAttribute("data-cell-focus");
                cell.rawNode.onclick = function () {
                    _this._handleFilter(i, j, focus);
                    _this._handleSelectedElement(cell);
                    if (_this.featureCountEnabled) {
                        _this._queryFeatureCount();
                    }
                };
                cell.rawNode.onkeydown = function (event) {
                    if (event.keyCode === 32) {
                        _this._handleFilter(i, j, focus);
                        _this._handleSelectedElement(cell);
                        if (_this.featureCountEnabled) {
                            _this._queryFeatureCount();
                        }
                    }
                };
                if (_this.featureCountEnabled) {
                    var authoringInfo = _this.layerView.layer.renderer.authoringInfo;
                    var field1 = authoringInfo.field1, field2 = authoringInfo.field2;
                    var expressionParams = _this._generateExpressionParams(field1, field2, authoringInfo, i, j, focus);
                    var queryExpression = _this._generateExpressionForRelationship(expressionParams);
                    _this.queryCountExpressions.push(queryExpression);
                    var numClasses = _this.colorRampProperties.numClasses;
                    var length_1 = _this.queryCountExpressions.length;
                    if ((numClasses === 2 && length_1 === 4 && cellIndex === 3) ||
                        (numClasses === 3 && length_1 === 9 && cellIndex === 8) ||
                        (numClasses === 4 && length_1 === 16 && cellIndex === 15)) {
                        _this._generateTotalFeatureCount();
                    }
                }
            });
        };
        Create2DColorRamp.prototype._queryFeatureCount = function () {
            var _this = this;
            var where = this.queryExpressions.join(" OR ") === ""
                ? this.queryCountExpressions.join(" OR ")
                : this.queryExpressions.join(" OR ");
            var geometry = this.view && this.view.get("extent");
            var outSpatialReference = this.view && this.view.get("spatialReference");
            this.layerView
                .queryFeatureCount({
                geometry: geometry,
                outSpatialReference: outSpatialReference,
                where: where
            })
                .then(function (totalFeatureCount) {
                _this.set("featureCount", totalFeatureCount);
            });
        };
        // _handleSelectedElement
        Create2DColorRamp.prototype._handleSelectedElement = function (cell) {
            var cellClass = cell.rawNode.classList;
            if (!cellClass.contains("esri-interactive-legend--selected-cell")) {
                cellClass.add("esri-interactive-legend--selected-cell");
                cell.rawNode.setAttribute("stroke", "black");
                cell.rawNode.setAttribute("stroke-width", "3px");
                cell.rawNode.setAttribute("stroke-opacity", "1");
            }
            else {
                cell.rawNode.removeAttribute("stroke");
                cell.rawNode.removeAttribute("stroke-width");
                cell.rawNode.removeAttribute("stroke-opacity");
                cellClass.remove("esri-interactive-legend--selected-cell");
            }
        };
        // _handleDefinitionExpression
        Create2DColorRamp.prototype._handleFilter = function (i, j, focus) {
            var authoringInfo = this.layerView.layer.renderer.authoringInfo;
            var field1 = authoringInfo.field1, field2 = authoringInfo.field2;
            var queryExpressions = this.queryExpressions;
            if (this.legendElement.type === "relationship-ramp" &&
                authoringInfo &&
                field1 &&
                field2) {
                var expressionParams = this._generateExpressionParams(field1, field2, authoringInfo, i, j, focus);
                var queryExpression = this._generateExpressionForRelationship(expressionParams);
                if (queryExpressions.length === 0) {
                    queryExpressions[0] = queryExpression;
                }
                else {
                    if (queryExpressions.indexOf(queryExpression) === -1) {
                        queryExpressions.push(queryExpression);
                    }
                    else {
                        queryExpressions.splice(queryExpressions.indexOf(queryExpression), 1);
                    }
                }
                var where = this.queryExpressions.join(" OR ");
                if (this.filterMode === "mute") {
                    var opacity = this.opacity || this.opacity === 0 ? this.opacity : 30;
                    var grayScale = this.grayScale || this.grayScale === 0 ? this.grayScale : 100;
                    this.layerView.effect = new FeatureEffect({
                        filter: new FeatureFilter({
                            where: where
                        }),
                        excludedEffect: "grayscale(" + grayScale + "%) opacity(" + opacity + "%)"
                    });
                }
                else if (this.filterMode === "featureFilter") {
                    this.layerView.filter = new FeatureFilter({
                        where: where
                    });
                }
                this._setSearchExpression(where);
            }
        };
        Create2DColorRamp.prototype._generateExpressionParams = function (field1, field2, authoringInfo, i, j, focus) {
            var data = [];
            var authoringInfofield1 = field1.field;
            var authoringInfofield2 = field2.field;
            var classBreakInfos1 = field1.classBreakInfos;
            var classBreakInfos2 = field2.classBreakInfos;
            var normalizationField1 = authoringInfo.field1.hasOwnProperty("normalizationField")
                ? authoringInfo.field1.normalizationField
                : null;
            var normalizationField2 = authoringInfo.field2.hasOwnProperty("normalizationField")
                ? authoringInfo.field2.normalizationField
                : null;
            classBreakInfos1.forEach(function (item, itemIndex1) {
                var nestedData = [];
                classBreakInfos2.forEach(function (item2, itemIndex2) {
                    nestedData.push([
                        classBreakInfos1[itemIndex1],
                        classBreakInfos2[itemIndex2]
                    ]);
                });
                data.push(nestedData);
            });
            var field1ToInclude = normalizationField1
                ? "(" + authoringInfofield1 + "/" + normalizationField1 + ")"
                : "" + authoringInfofield1;
            var field2ToInclude = normalizationField2
                ? "(" + authoringInfofield2 + "/" + normalizationField2 + ")"
                : "" + authoringInfofield2;
            return {
                data: data,
                i: i,
                j: j,
                field1: field1ToInclude,
                field2: field2ToInclude,
                focus: focus
            };
        };
        // _generateExpressionForTwoClasses
        Create2DColorRamp.prototype._generateExpressionForRelationship = function (expressionParams) {
            var focus = expressionParams.focus, field1 = expressionParams.field1, field2 = expressionParams.field2, data = expressionParams.data, i = expressionParams.i, j = expressionParams.j;
            return focus === "LL"
                ? field1 + " >= " + data[i][j][0].minValue + " AND " + field1 + " <= " + data[i][j][0].maxValue + " AND " + field2 + " >= " + data[i][j][1].minValue + " AND " + field2 + " <= " + data[i][j][1].maxValue
                : focus === "LM" || focus === "LM1" || focus === "LM2" || focus === "LH"
                    ? field1 + " >= " + data[i][j][0].minValue + " AND " + field1 + " <= " + data[i][j][0].maxValue + " AND " + field2 + " > " + data[i][j][1].minValue + " AND " + field2 + " <= " + data[i][j][1].maxValue
                    : focus === "ML" || focus === "M1L" || focus === "M2L" || focus === "HL"
                        ? field1 + " > " + data[i][j][0].minValue + " AND " + field1 + " <= " + data[i][j][0].maxValue + " AND " + field2 + " >= " + data[i][j][1].minValue + " AND " + field2 + " <= " + data[i][j][1].maxValue
                        : field1 + " > " + data[i][j][0].minValue + " AND " + field1 + " <= " + data[i][j][0].maxValue + " AND " + field2 + " > " + data[i][j][1].minValue + " AND " + field2 + " <= " + data[i][j][1].maxValue;
        };
        // _setSearchExpression
        Create2DColorRamp.prototype._setSearchExpression = function (filterExpression) {
            var _this = this;
            if (!this.searchViewModel) {
                return;
            }
            this.searchViewModel.sources.forEach(function (searchSource) {
                _this.layerListViewModel.operationalItems.forEach(function (operationalItem) {
                    if (searchSource.layer &&
                        searchSource.layer.id === operationalItem.layer.id) {
                        if (filterExpression) {
                            searchSource.filter = {
                                where: filterExpression
                            };
                        }
                        else {
                            searchSource.filter = null;
                        }
                    }
                });
            });
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "queryCountExpressions", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "queryExpressions", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "legendElement", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "id", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "activeLayerInfos", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "colorRampProperties", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "layerView", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "filterMode", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "opacity", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "grayScale", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "featureCount", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "searchViewModel", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "layerListViewModel", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "featureCountEnabled", void 0);
        Create2DColorRamp = tslib_1.__decorate([
            decorators_1.subclass("Create2DColorRamp")
        ], Create2DColorRamp);
        return Create2DColorRamp;
    }(Accessor));
    return Create2DColorRamp;
});
//# sourceMappingURL=Create2DColorRamp.js.map