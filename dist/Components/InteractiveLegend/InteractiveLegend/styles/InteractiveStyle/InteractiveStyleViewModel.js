/// <amd-dependency path="esri/core/tsSupport/assignHelper" name="__assign" />
/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/assignHelper", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/core/Handles", "esri/core/watchUtils", "esri/core/Collection", "esri/Color", "esri/widgets/LayerList/LayerListViewModel", "esri/views/layers/support/FeatureFilter"], function (require, exports, __assign, __extends, __decorate, Accessor, decorators_1, Handles, watchUtils, Collection, Color, LayerListViewModel, FeatureFilter) {
    "use strict";
    var InteractiveStyleViewModel = /** @class */ (function (_super) {
        __extends(InteractiveStyleViewModel, _super);
        function InteractiveStyleViewModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            //----------------------------------
            //
            //  Variables
            //
            //----------------------------------
            _this._handles = new Handles();
            _this._querying = true;
            // interactiveStyleData
            _this.interactiveStyleData = {
                queryExpressions: [],
                highlightedFeatures: [],
                originalRenderers: [],
                originalColors: [],
                colorIndexes: [],
                mutedValues: [],
                classBreakInfosIndex: []
            };
            //----------------------------------
            //
            //  Properties
            //
            //----------------------------------
            // view
            _this.view = null;
            // activeLayerInfos
            _this.activeLayerInfos = null;
            // featureLayerViews
            _this.featureLayerViews = new Collection();
            // layerGraphics
            _this.layerGraphics = new Collection();
            // mutedShade
            _this.mutedShade = null;
            // mutedOpacity
            _this.mutedOpacity = null;
            // filterMode
            _this.filterMode = null;
            // layerListViewModel
            _this.layerListViewModel = new LayerListViewModel();
            // searchExpressions
            _this.searchExpressions = new Collection();
            _this.searchViewModel = null;
            return _this;
        }
        Object.defineProperty(InteractiveStyleViewModel.prototype, "state", {
            // state
            get: function () {
                return this.get("view.ready")
                    ? this.filterMode === "highlight"
                        ? this._querying
                            ? "querying"
                            : "ready"
                        : "ready"
                    : "loading";
            },
            enumerable: true,
            configurable: true
        });
        //----------------------------------
        //
        //  Lifecycle methods
        //
        //----------------------------------
        InteractiveStyleViewModel.prototype.initialize = function () {
            var _this = this;
            var layerViewKey = "layer-views";
            this._handles.add([
                watchUtils.init(this, "view", function () {
                    if (!_this.view) {
                        return;
                    }
                    _this._handles.add([
                        watchUtils.whenFalseOnce(_this, "view.updating", function () {
                            _this.layerListViewModel.operationalItems.forEach(function () {
                                _this.searchExpressions.add(null);
                            });
                            _this._storeFeatureData(layerViewKey);
                            if (_this.filterMode === "mute") {
                                _this._storeOriginalRenderersAndColors();
                            }
                        }),
                        watchUtils.whenFalse(_this, "view.updating", function () {
                            _this.layerListViewModel.operationalItems.forEach(function () {
                                if (_this.filterMode === "highlight") {
                                    _this._queryFeatures(layerViewKey);
                                }
                            });
                        })
                    ]);
                })
            ]);
        };
        InteractiveStyleViewModel.prototype.destroy = function () {
            this._handles.removeAll();
            this._handles.destroy();
            this.layerGraphics = null;
            this._handles = null;
            this._querying = null;
            var interactiveStyleData = this.interactiveStyleData;
            for (var interactiveStyleDataProp in interactiveStyleData) {
                interactiveStyleData[interactiveStyleDataProp] = null;
            }
        };
        //----------------------------------
        //
        //  Public methods
        //
        //----------------------------------
        // applyFeatureFilter
        InteractiveStyleViewModel.prototype.applyFeatureFilter = function (elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos) {
            this._generateQueryExpressions(elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos);
            var queryExpressions = this.interactiveStyleData.queryExpressions[operationalItemIndex];
            var featureLayerView = this.featureLayerViews.getItemAt(operationalItemIndex);
            var filterExpression = queryExpressions.join(" OR ");
            this._setSearchExpression(filterExpression, operationalItemIndex);
            featureLayerView.filter = new FeatureFilter({
                where: filterExpression
            });
        };
        // applyFeatureMute
        InteractiveStyleViewModel.prototype.applyFeatureMute = function (elementInfo, field, legendInfoIndex, operationalItemIndex, legendElement, legendElementInfos) {
            var originalRenderer = this.interactiveStyleData.originalRenderers[operationalItemIndex];
            if (!originalRenderer) {
                return;
            }
            if (originalRenderer.hasOwnProperty("uniqueValueInfos")) {
                this._muteUniqueValues(legendInfoIndex, field, operationalItemIndex);
            }
            else if (Array.isArray(elementInfo.value) &&
                elementInfo.value.length === 2) {
                this._muteRangeValues(legendInfoIndex, field, operationalItemIndex);
            }
            this._generateQueryExpressions(elementInfo, field, operationalItemIndex, legendElement, null, legendElementInfos);
            var queryExpressions = this.interactiveStyleData.queryExpressions[operationalItemIndex];
            var filterExpression = queryExpressions.join(" OR ");
            this._setSearchExpression(filterExpression, operationalItemIndex);
        };
        // applyFeatureHighlight
        InteractiveStyleViewModel.prototype.applyFeatureHighlight = function (elementInfo, field, legendInfoIndex, operationalItemIndex, isSizeRamp, legendElement, legendElementInfos) {
            if (isSizeRamp) {
                this._highlightSizeRamp(legendInfoIndex, field, legendElementInfos, elementInfo, operationalItemIndex);
            }
            else if (Array.isArray(elementInfo.value) &&
                elementInfo.value.length === 2) {
                this._highlightRangeValues(legendInfoIndex, elementInfo, field, operationalItemIndex, legendElementInfos);
            }
            else {
                this._highlightUniqueValues(legendInfoIndex, elementInfo, field, operationalItemIndex);
            }
            this._generateQueryExpressions(elementInfo, field, operationalItemIndex, legendElement, null, legendElementInfos);
            var queryExpressions = this.interactiveStyleData.queryExpressions[operationalItemIndex];
            var filterExpression = queryExpressions.join(" OR ");
            this._setSearchExpression(filterExpression, operationalItemIndex);
        };
        //----------------------------------
        //
        //  Private methods
        //
        //----------------------------------
        // _storeFeatureData
        InteractiveStyleViewModel.prototype._storeFeatureData = function (layerViewKey) {
            var _this = this;
            this.layerListViewModel.operationalItems.forEach(function (operationalItem) {
                _this._setUpDataContainers();
                var featureLayerView = operationalItem.layerView;
                _this.featureLayerViews.push(featureLayerView);
                _this._queryFeatureLayerData(layerViewKey);
            });
        };
        // _setUpDataContainers
        InteractiveStyleViewModel.prototype._setUpDataContainers = function () {
            var _a = this.interactiveStyleData, highlightedFeatures = _a.highlightedFeatures, queryExpressions = _a.queryExpressions, mutedValues = _a.mutedValues, originalColors = _a.originalColors, colorIndexes = _a.colorIndexes, classBreakInfosIndex = _a.classBreakInfosIndex;
            highlightedFeatures.push([]);
            queryExpressions.push([]);
            mutedValues.push([]);
            originalColors.push([]);
            colorIndexes.push([]);
            classBreakInfosIndex.push([]);
        };
        // _queryFeatureLayerData
        InteractiveStyleViewModel.prototype._queryFeatureLayerData = function (layerViewKey) {
            var _a = this, _handles = _a._handles, layerGraphics = _a.layerGraphics, layerListViewModel = _a.layerListViewModel;
            _handles.remove(layerViewKey);
            layerGraphics.removeAll();
            layerListViewModel.operationalItems.forEach(function () {
                layerGraphics.add(null);
            });
            this._queryFeatures(layerViewKey);
        };
        // queryFeatures
        InteractiveStyleViewModel.prototype._queryFeatures = function (layerViewKey) {
            var _this = this;
            this.featureLayerViews.forEach(function (layerView, layerViewIndex) {
                if (layerView) {
                    _this._handles.add(watchUtils.whenFalseOnce(layerView, "updating", function () {
                        if (!layerView) {
                            return;
                        }
                        if (typeof layerView.queryFeatures !== "function") {
                            _this._querying = null;
                            _this.notifyChange("state");
                        }
                        else {
                            _this._querying = layerView
                                .queryFeatures()
                                .catch(function (err) {
                                _this._querying = null;
                                _this.notifyChange("state");
                                console.error("FEATURE QUERY ERROR: ", err);
                            })
                                .then(function (results) {
                                var featureLayerViews = _this.featureLayerViews.getItemAt(layerViewIndex);
                                if (featureLayerViews.layer.id === results.features[0].layer.id) {
                                    _this.layerGraphics.splice(layerViewIndex, 1, results.features);
                                }
                                _this._querying = null;
                                _this.notifyChange("state");
                            });
                        }
                    }), layerViewKey);
                }
            });
        };
        // _storeOriginalRenderersAndColors
        InteractiveStyleViewModel.prototype._storeOriginalRenderersAndColors = function () {
            var _this = this;
            this.interactiveStyleData.originalRenderers = [];
            this.layerListViewModel.operationalItems.forEach(function (operationalItem, operationalItemIndex) {
                if (operationalItem.layer.hasOwnProperty("renderer")) {
                    _this._useLayerFromOperationalItem(operationalItem, operationalItemIndex);
                }
            });
        };
        // _useLayerFromOperationalItem
        InteractiveStyleViewModel.prototype._useLayerFromOperationalItem = function (operationalItem, operationalItemIndex) {
            var clonedRenderer = operationalItem.layer.renderer.clone();
            var originalColors = this.interactiveStyleData.originalColors[operationalItemIndex];
            var infos = clonedRenderer.hasOwnProperty("uniqueValueInfos")
                ? clonedRenderer.uniqueValueInfos
                : clonedRenderer.classBreakInfos;
            if (infos) {
                infos.forEach(function (info) {
                    originalColors.push(info.symbol.color);
                });
                if (!operationalItem.layer.hasOwnProperty("renderer")) {
                    return;
                }
                this.interactiveStyleData.originalRenderers[operationalItemIndex] = clonedRenderer;
            }
        };
        //----------------------------------
        //
        //  Feature Filter Methods
        //
        //----------------------------------
        // _generateQueryExpressions
        InteractiveStyleViewModel.prototype._generateQueryExpressions = function (elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos) {
            var queryExpression = this._generateQueryExpression(elementInfo, field, legendInfoIndex, legendElement, legendElementInfos);
            var queryExpressions = this.interactiveStyleData.queryExpressions[operationalItemIndex];
            var expressionIndex = queryExpressions.indexOf(queryExpression);
            if (queryExpressions.length === 0 || expressionIndex === -1) {
                queryExpressions.push(queryExpression);
            }
            else {
                queryExpressions.splice(expressionIndex, 1);
            }
        };
        // _generateQueryExpression
        InteractiveStyleViewModel.prototype._generateQueryExpression = function (elementInfo, field, legendInfoIndex, legendElement, legendElementInfos) {
            var value = elementInfo.value, label = elementInfo.label;
            var elementInfoHasValue = elementInfo.hasOwnProperty("value")
                ? value
                : label;
            if (legendElement.type === "size-ramp" &&
                this.filterMode === "featureFilter") {
                var expression = this._handleSizeRampFeatureFilter(legendInfoIndex, field, legendElementInfos, elementInfo);
                return expression;
            }
            if (legendElement.type === "symbol-table") {
                if (label.indexOf(">") !== -1) {
                    return Array.isArray(elementInfoHasValue)
                        ? field + " > " + elementInfoHasValue[0] + " AND " + field + " <= " + elementInfo.value[1]
                        : field + " = " + elementInfoHasValue + " OR " + field + " = '" + elementInfoHasValue + "'";
                }
                else {
                    var expression = Array.isArray(elementInfo.value)
                        ? legendElementInfos.length - 1 === legendInfoIndex
                            ? field + " >= " + elementInfoHasValue[0] + " AND " + field + " <= " + elementInfoHasValue[1]
                            : field + " > " + elementInfoHasValue[0] + " AND " + field + " <= " + elementInfoHasValue[1]
                        : isNaN(elementInfoHasValue)
                            ? field + " = '" + elementInfoHasValue + "'"
                            : field + " = " + elementInfoHasValue + " OR " + field + " = '" + elementInfoHasValue + "'";
                    return expression;
                }
            }
        };
        // LOGIC MAY CHANGE FOR SIZE RAMP FILTER
        // _handleSizeRampFeatureFilter
        InteractiveStyleViewModel.prototype._handleSizeRampFeatureFilter = function (legendInfoIndex, field, legendElementInfos, elementInfo) {
            // FIRST LEGEND INFO
            if (legendInfoIndex === 0) {
                return field + " >= " + elementInfo.value;
            }
            // SECOND LEGEND INFO
            else if (legendInfoIndex === 1) {
                var midPoint = legendElementInfos[1].value -
                    (legendElementInfos[1].value - legendElementInfos[2].value) / 2;
                return field + " < " + legendElementInfos[0].value + " AND " + field + " >= " + midPoint;
            }
            // SECOND TO LAST LEGEND INFO
            else if (legendInfoIndex === legendElementInfos.length - 2) {
                var secondToLastInfo = legendElementInfos[legendElementInfos.length - 2];
                var lastInfo = legendElementInfos[legendElementInfos.length - 1];
                var midPoint = (secondToLastInfo.value - lastInfo.value) / 2 + secondToLastInfo.value;
                return field + " > " + lastInfo.value + " AND " + field + " <= " + midPoint;
            }
            // LAST LEGEND INFO
            else if (legendInfoIndex === legendElementInfos.length - 1) {
                return field + " <= " + elementInfo.value;
            }
            // ANY LEGEND INFO IN BETWEEN
            else {
                var midPoint1 = (legendElementInfos[legendInfoIndex - 1].value -
                    legendElementInfos[legendInfoIndex].value) /
                    2 +
                    legendElementInfos[legendInfoIndex].value;
                var midPoint2 = legendElementInfos[legendInfoIndex].value -
                    (legendElementInfos[legendInfoIndex].value -
                        legendElementInfos[legendInfoIndex + 1].value) /
                        2;
                return field + " < " + midPoint1 + " AND " + field + " > " + midPoint2;
            }
        };
        //----------------------------------
        //
        //  Highlight Methods
        //
        //----------------------------------
        // _highlightRangeValues
        InteractiveStyleViewModel.prototype._highlightRangeValues = function (legendInfoIndex, elementInfo, field, operationalItemIndex, legendElementInfos) {
            var features = [];
            var highlightedFeatures = this.interactiveStyleData.highlightedFeatures[operationalItemIndex];
            var elementInfoValue = elementInfo.value;
            if (highlightedFeatures[legendInfoIndex]) {
                this._removeHighlight(operationalItemIndex, legendInfoIndex);
                return;
            }
            this.layerGraphics.getItemAt(operationalItemIndex).forEach(function (feature) {
                var fieldValue = feature.attributes[field];
                if (legendElementInfos.length - 1 === legendInfoIndex) {
                    if (fieldValue >= elementInfoValue[0] &&
                        fieldValue <= elementInfoValue[1]) {
                        features.push(feature);
                    }
                }
                else {
                    if (fieldValue > elementInfoValue[0] &&
                        fieldValue <= elementInfoValue[1]) {
                        features.push(feature);
                    }
                }
            });
            if (features.length === 0) {
                return;
            }
            var highlight = this.featureLayerViews
                .getItemAt(operationalItemIndex)
                .highlight(features.slice());
            highlightedFeatures[legendInfoIndex] = [highlight];
        };
        // _highlightUniqueValue
        InteractiveStyleViewModel.prototype._highlightUniqueValues = function (legendInfoIndex, elementInfo, field, operationalItemIndex) {
            var features = [];
            var highlightedFeatures = [];
            var highlightedFeatureData = this.interactiveStyleData
                .highlightedFeatures[operationalItemIndex];
            if (highlightedFeatureData[legendInfoIndex]) {
                highlightedFeatureData[legendInfoIndex][0].remove();
                highlightedFeatureData[legendInfoIndex] = null;
                return;
            }
            this.layerGraphics.getItemAt(operationalItemIndex).map(function (feature) {
                var attributes = feature.attributes;
                if (elementInfo.value == attributes[field] ||
                    elementInfo.value == attributes[field.toLowerCase()] ||
                    elementInfo.value == attributes[field.toUpperCase()]) {
                    features.push(feature);
                }
            });
            features.forEach(function (feature) {
                highlightedFeatures.push(feature);
            });
            if (features.length === 0) {
                return;
            }
            var highlight = this.featureLayerViews
                .getItemAt(operationalItemIndex)
                .highlight(highlightedFeatures.slice());
            highlightedFeatureData[legendInfoIndex] = [highlight];
        };
        // LOGIC MAY CHANGE FOR SIZE RAMP FILTER
        // _highlightSizeRamp
        InteractiveStyleViewModel.prototype._highlightSizeRamp = function (legendInfoIndex, field, legendElementInfos, elementInfo, operationalItemIndex) {
            var features = [];
            var highlightedFeatureData = this.interactiveStyleData
                .highlightedFeatures[operationalItemIndex];
            if (highlightedFeatureData[legendInfoIndex]) {
                this._removeHighlight(operationalItemIndex, legendInfoIndex);
                return;
            }
            this.layerGraphics.getItemAt(operationalItemIndex).forEach(function (feature) {
                // FIRST LEGEND INFO
                if (legendInfoIndex === 0) {
                    if (feature.attributes[field] >= elementInfo.value) {
                        features.push(feature);
                    }
                }
                // SECOND LEGEND INFO
                else if (legendInfoIndex === 1) {
                    var midPoint = legendElementInfos[1].value -
                        (legendElementInfos[1].value - legendElementInfos[2].value) / 2;
                    if (feature.attributes[field] < legendElementInfos[0].value &&
                        feature.attributes[field] >= midPoint) {
                        features.push(feature);
                    }
                }
                // SECOND TO LAST LEGEND INFO
                else if (legendInfoIndex === legendElementInfos.length - 2) {
                    var secondToLastInfo = legendElementInfos[legendElementInfos.length - 2];
                    var lastInfo = legendElementInfos[legendElementInfos.length - 1];
                    var midPoint = (secondToLastInfo.value - lastInfo.value) / 2 +
                        secondToLastInfo.value;
                    if (feature.attributes[field] > lastInfo.value &&
                        feature.attributes[field] <= midPoint) {
                        features.push(feature);
                    }
                }
                // LAST LEGEND INFO
                else if (legendInfoIndex === legendElementInfos.length - 1) {
                    if (feature.attributes[field] <= elementInfo.value) {
                        features.push(feature);
                    }
                }
                // ANY LEGEND INFO IN BETWEEN
                else {
                    var midPoint1 = (legendElementInfos[legendInfoIndex - 1].value -
                        legendElementInfos[legendInfoIndex].value) /
                        2 +
                        legendElementInfos[legendInfoIndex].value;
                    var midPoint2 = legendElementInfos[legendInfoIndex].value -
                        (legendElementInfos[legendInfoIndex].value -
                            legendElementInfos[legendInfoIndex + 1].value) /
                            2;
                    if (feature.attributes[field] < midPoint1 &&
                        feature.attributes[field] > midPoint2) {
                        features.push(feature);
                    }
                }
            });
            if (features.length === 0) {
                return;
            }
            var highlight = this.featureLayerViews
                .getItemAt(operationalItemIndex)
                .highlight(features.slice());
            highlightedFeatureData[legendInfoIndex] = [highlight];
        };
        // _removeHighlight
        InteractiveStyleViewModel.prototype._removeHighlight = function (operationalItemIndex, legendInfoIndex) {
            var highlightedFeatures = this.interactiveStyleData.highlightedFeatures[operationalItemIndex];
            highlightedFeatures[legendInfoIndex].forEach(function (feature) {
                feature.remove();
            });
            highlightedFeatures[legendInfoIndex] = null;
        };
        //----------------------------------
        //
        //  Mute Methods
        //
        //----------------------------------
        InteractiveStyleViewModel.prototype._muteUniqueValues = function (legendInfoIndex, field, operationalItemIndex) {
            var _this = this;
            var featureLayer = this.layerListViewModel.operationalItems.getItemAt(operationalItemIndex).layer;
            var colorIndexes = this.interactiveStyleData.colorIndexes[operationalItemIndex];
            if (colorIndexes.indexOf(legendInfoIndex) === -1) {
                colorIndexes.push(legendInfoIndex);
            }
            else {
                colorIndexes.splice(colorIndexes.indexOf(legendInfoIndex), 1);
            }
            this._resetMutedUniqueValues(operationalItemIndex);
            if (colorIndexes.length === 0) {
                this._resetMutedUniqueValues(operationalItemIndex);
                this._generateRenderer(operationalItemIndex, "unique-value", field);
                return;
            }
            var renderer = featureLayer.renderer;
            renderer.uniqueValueInfos.forEach(function (uniqueInfo, uniqueInfoIndex) {
                var symbol = uniqueInfo.symbol;
                if (colorIndexes.indexOf(uniqueInfoIndex) === -1) {
                    symbol.color = new Color(_this.mutedShade);
                    if (_this.mutedOpacity || _this.mutedOpacity === 0) {
                        symbol.color.a = _this.mutedOpacity;
                    }
                }
            });
            this._generateRenderer(operationalItemIndex, "unique-value", field);
        };
        // _resetMutedUniqueValues
        InteractiveStyleViewModel.prototype._resetMutedUniqueValues = function (operationalItemIndex) {
            var featureLayer = this.layerListViewModel.operationalItems.getItemAt(operationalItemIndex).layer;
            var originalColors = this.interactiveStyleData.originalColors[operationalItemIndex];
            originalColors.forEach(function (original, originalIndex) {
                var uvr = featureLayer.renderer;
                uvr.uniqueValueInfos.forEach(function (newItem, newIndex) {
                    if (originalIndex === newIndex) {
                        newItem.symbol.color = original;
                    }
                });
            });
        };
        // _muteRangeValues
        InteractiveStyleViewModel.prototype._muteRangeValues = function (legendInfoIndex, field, operationalItemIndex) {
            var featureLayer = this.layerListViewModel.operationalItems.getItemAt(operationalItemIndex).layer;
            var classBreakInfos = featureLayer.renderer.classBreakInfos;
            var originalColors = this.interactiveStyleData.originalColors[operationalItemIndex];
            var reversedClassBreakInfos = [];
            var reversedColors = [];
            for (var i = classBreakInfos.length - 1; i >= 0; i--) {
                reversedClassBreakInfos.push(classBreakInfos[i]);
                reversedColors.push(originalColors[i]);
            }
            var classBreakInfosIndex = this.interactiveStyleData.classBreakInfosIndex[operationalItemIndex];
            if (classBreakInfosIndex.indexOf(legendInfoIndex) === -1) {
                classBreakInfosIndex.push(legendInfoIndex);
            }
            else {
                classBreakInfosIndex.splice(classBreakInfosIndex.indexOf(legendInfoIndex), 1);
            }
            this._applyColors(operationalItemIndex, reversedColors, reversedClassBreakInfos, field);
        };
        // _applyColors
        InteractiveStyleViewModel.prototype._applyColors = function (operationalItemIndex, reversedColors, reversedClassBreakInfos, field) {
            var _this = this;
            var classBreakInfosIndex = this.interactiveStyleData.classBreakInfosIndex[operationalItemIndex];
            if (classBreakInfosIndex.length === 0) {
                reversedClassBreakInfos.forEach(function (classBreakInfo, classBreakInfoIndex) {
                    var symbol = classBreakInfo.symbol;
                    reversedColors.forEach(function (color, colorIndex) {
                        if (classBreakInfoIndex === colorIndex) {
                            symbol.color = color;
                            if (symbol.color.hasOwnProperty("a")) {
                                symbol.color.a = 1;
                            }
                        }
                    });
                });
                this._generateRenderer(operationalItemIndex, "class-breaks", field);
                return;
            }
            reversedClassBreakInfos.forEach(function (classBreakInfo, classBreakInfoIndex) {
                var symbol = classBreakInfo.symbol;
                var _a = _this, mutedOpacity = _a.mutedOpacity, mutedShade = _a.mutedShade;
                if (classBreakInfosIndex.indexOf(classBreakInfoIndex) !== -1) {
                    reversedColors.forEach(function (color, colorIndex) {
                        if (classBreakInfoIndex === colorIndex) {
                            symbol.color = color;
                            if (symbol.color.hasOwnProperty("a")) {
                                symbol.color.a = 1;
                            }
                        }
                    });
                }
                else {
                    symbol.color = mutedShade;
                    if (_this.mutedOpacity || _this.mutedOpacity === 0) {
                        symbol.color.a = mutedOpacity;
                    }
                }
            });
            this._generateRenderer(operationalItemIndex, "class-breaks", field);
        };
        // _generateRenderer
        InteractiveStyleViewModel.prototype._generateRenderer = function (operationalItemIndex, type, field) {
            var featureLayer = this.layerListViewModel.operationalItems.getItemAt(operationalItemIndex).layer;
            var _a = featureLayer.renderer, defaultLabel = _a.defaultLabel, defaultSymbol = _a.defaultSymbol;
            var visualVariables = featureLayer.renderer.hasOwnProperty("visualVariables") &&
                featureLayer.renderer.visualVariables
                ? featureLayer.renderer.visualVariables.slice() : null;
            var renderer = type === "unique-value"
                ? {
                    type: type,
                    field: field,
                    uniqueValueInfos: featureLayer.renderer.uniqueValueInfos.slice(),
                    defaultLabel: defaultLabel,
                    defaultSymbol: defaultSymbol,
                    visualVariables: visualVariables
                }
                : {
                    type: type,
                    field: field,
                    classBreakInfos: featureLayer.renderer.classBreakInfos.slice(),
                    defaultLabel: defaultLabel,
                    defaultSymbol: defaultSymbol
                };
            featureLayer.renderer = renderer;
        };
        // End of filter methods
        // _setSearchExpression
        InteractiveStyleViewModel.prototype._setSearchExpression = function (filterExpression, operationalItemIndex) {
            var _this = this;
            if (!this.searchViewModel) {
                return;
            }
            var searchSource = this.searchViewModel.sources.find(function (searchSource) {
                return searchSource.flayerId ===
                    _this.layerListViewModel.operationalItems.getItemAt(operationalItemIndex)
                        .layer.id;
            });
            if (filterExpression) {
                searchSource.filter = {
                    where: filterExpression
                };
            }
            else {
                searchSource.filter = null;
            }
        };
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "interactiveStyleData", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "activeLayerInfos", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "featureLayerViews", void 0);
        __decorate([
            decorators_1.property({
                dependsOn: ["view.updating", "searchExpressions", "layerListViewModel"],
                readOnly: true
            })
        ], InteractiveStyleViewModel.prototype, "state", null);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "layerGraphics", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "mutedShade", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "mutedOpacity", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "filterMode", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "layerListViewModel", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "searchExpressions", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "searchViewModel", void 0);
        InteractiveStyleViewModel = __decorate([
            decorators_1.subclass("InteractiveStyleViewModel")
        ], InteractiveStyleViewModel);
        return InteractiveStyleViewModel;
    }(decorators_1.declared(Accessor)));
    return InteractiveStyleViewModel;
});
//# sourceMappingURL=InteractiveStyleViewModel.js.map