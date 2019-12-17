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
define(["require", "exports", "esri/core/tsSupport/assignHelper", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/core/Handles", "esri/core/watchUtils", "esri/core/Collection", "esri/widgets/LayerList/LayerListViewModel", "esri/views/layers/support/FeatureFilter", "esri/views/layers/support/FeatureEffect", "esri/tasks/support/Query", "./InteractiveStyleData", "./SelectedStyleData", "esri/core/promiseUtils"], function (require, exports, __assign, __extends, __decorate, Accessor, decorators_1, Handles, watchUtils, Collection, LayerListViewModel, FeatureFilter, FeatureEffect, Query, InteractiveStyleData, SelectedStyleData, promiseUtils) {
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
            //----------------------------------
            //
            //  Properties
            //
            //----------------------------------
            // view
            _this.view = null;
            // activeLayerInfos
            _this.activeLayerInfos = null;
            // interactiveStyleData
            _this.interactiveStyleData = new InteractiveStyleData();
            // featureLayerViews
            _this.featureLayerViews = new Collection();
            _this.featureCountQuery = null;
            // selectedStyleDataCollection
            _this.selectedStyleDataCollection = new Collection();
            // filterMode
            _this.filterMode = null;
            // layerListViewModel
            _this.layerListViewModel = new LayerListViewModel();
            // searchExpressions
            _this.searchExpressions = new Collection();
            // searchViewModel
            _this.searchViewModel = null;
            // opacity
            _this.opacity = null;
            // grayScale
            _this.grayScale = null;
            _this.featureCountEnabled = null;
            _this.updateExtentEnabled = null;
            return _this;
        }
        Object.defineProperty(InteractiveStyleViewModel.prototype, "state", {
            // state
            get: function () {
                return this.view
                    ? this.get("view.ready")
                        ? this.featureCountQuery
                            ? "querying"
                            : "ready"
                        : "loading"
                    : "disabled";
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
            var disableClusteringKey = "disable-clustering";
            this._handles.add(watchUtils.when(this, "view.map.allLayers", function () {
                _this._disableClustering(disableClusteringKey);
            }), disableClusteringKey);
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
                            _this._storeFeatureData();
                        })
                    ]);
                }),
                watchUtils.on(this, "featureLayerViews", "change", function () {
                    _this.selectedStyleDataCollection.removeAll();
                    var selectedStyleDataCollection = [];
                    _this.featureLayerViews.forEach(function (featureLayerView) {
                        if (!featureLayerView) {
                            selectedStyleDataCollection.push(null);
                        }
                        else {
                            var featureLayer = featureLayerView.get("layer"), renderer = featureLayer.get("renderer"), field = renderer && renderer.get("field"), field2 = renderer && renderer.get("field2"), field3 = renderer && renderer.get("field3"), fieldDelimiter = renderer && renderer.get("fieldDelimiter"), normalizationField = renderer && renderer.get("normalizationField"), normalizationType = renderer && renderer.get("normalizationType"), hasCustomArcade = (field2 || field3) && fieldDelimiter ? true : false, invalidNormalization = normalizationType === "percent-of-total" ||
                                normalizationType === "log";
                            if (hasCustomArcade || invalidNormalization) {
                                selectedStyleDataCollection.push(null);
                            }
                            else {
                                var selectedStyleData = new SelectedStyleData({
                                    layerItemId: featureLayer.id,
                                    field: field,
                                    selectedInfoIndex: [],
                                    applyStyles: null,
                                    featureLayerView: featureLayerView,
                                    normalizationField: normalizationField
                                });
                                selectedStyleDataCollection.push(selectedStyleData);
                            }
                        }
                    });
                    _this.selectedStyleDataCollection.addMany(selectedStyleDataCollection.slice());
                })
            ]);
        };
        InteractiveStyleViewModel.prototype.destroy = function () {
            this._handles.removeAll();
            this._handles.destroy();
            this._handles = null;
            this.interactiveStyleData.destroy();
        };
        //----------------------------------
        //
        //  Public methods
        //
        //----------------------------------
        // applyFeatureFilter
        InteractiveStyleViewModel.prototype.applyFeatureFilter = function (elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, isPredominance, legendElementInfos, normalizationField) {
            var queryExpressionsCollection = this.interactiveStyleData.get("queryExpressions");
            var queryExpressions = queryExpressionsCollection.getItemAt(operationalItemIndex);
            if (isPredominance) {
                var queryExpression = this._handlePredominanceExpression(elementInfo, operationalItemIndex);
                var expressionIndex = queryExpressions.indexOf(queryExpression);
                if (queryExpressions.length === 0 || expressionIndex === -1) {
                    if (queryExpressions && queryExpressions[0] === "1=0") {
                        queryExpressions.splice(0, 1);
                    }
                    queryExpressions.push(queryExpression);
                }
                else if (queryExpressions &&
                    queryExpressions.length === 1 &&
                    queryExpression === queryExpressions[0]) {
                    queryExpressions[0] = "1=0";
                }
                else if (queryExpressions && queryExpressions.length === 1) {
                    queryExpressions[0] = [queryExpression];
                }
                else if (queryExpressions &&
                    queryExpressions.length === 1 &&
                    queryExpression !== queryExpressions[0] &&
                    queryExpressions[0] === "1=0") {
                    queryExpressions[0] = [queryExpression];
                    // queryExpressions.push(queryExpression);
                }
                else if (queryExpressions &&
                    queryExpressions.length === 1 &&
                    queryExpression === queryExpressions[0] &&
                    queryExpressions[0] === "1=0") {
                    queryExpressions[0] = [];
                }
                else {
                    queryExpressions.splice(expressionIndex, 1);
                }
                var featureLayerView = this.featureLayerViews.getItemAt(operationalItemIndex);
                var filterExpression = queryExpressions.join(" OR ");
                this._setSearchExpression(filterExpression);
                featureLayerView.filter = new FeatureFilter({
                    where: filterExpression
                });
            }
            else {
                this._generateQueryExpressions(elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos, normalizationField);
                var featureLayerView = this.featureLayerViews.getItemAt(operationalItemIndex);
                var filterExpression = queryExpressions.join(" OR ");
                this._setSearchExpression(filterExpression);
                featureLayerView.filter = new FeatureFilter({
                    where: filterExpression
                });
            }
        };
        // applyFeatureMute
        InteractiveStyleViewModel.prototype.applyFeatureMute = function (elementInfo, field, legendInfoIndex, operationalItemIndex, legendElement, legendElementInfos, isPredominance, normalizationField) {
            var queryExpressionsCollection = this.interactiveStyleData.get("queryExpressions");
            var queryExpressions = queryExpressionsCollection.getItemAt(operationalItemIndex);
            var _a = this, opacity = _a.opacity, grayScale = _a.grayScale;
            var opacityValue = opacity === null ? 30 : opacity;
            var grayScaleValue = grayScale === null ? 100 : grayScale;
            if (isPredominance) {
                var queryExpression = this._handlePredominanceExpression(elementInfo, operationalItemIndex);
                var expressionIndex = queryExpressions.indexOf(queryExpression);
                if (queryExpressions.length === 0 || expressionIndex === -1) {
                    if (queryExpressions && queryExpressions[0] === "1=0") {
                        queryExpressions.splice(0, 1);
                    }
                    queryExpressions.push(queryExpression);
                }
                else if (queryExpressions &&
                    queryExpressions.length === 1 &&
                    queryExpression === queryExpressions[0]) {
                    queryExpressions[0] = "1=0";
                }
                else if (queryExpressions && queryExpressions.length === 1) {
                    queryExpressions[0] = [queryExpression];
                }
                else if (queryExpressions &&
                    queryExpressions.length === 1 &&
                    queryExpression !== queryExpressions[0] &&
                    queryExpressions[0] === "1=0") {
                    queryExpressions[0] = [queryExpression];
                    // queryExpressions.push(queryExpression);
                }
                else if (queryExpressions &&
                    queryExpressions.length === 1 &&
                    queryExpression === queryExpressions[0] &&
                    queryExpressions[0] === "1=0") {
                    queryExpressions[0] = [];
                }
                else {
                    queryExpressions.splice(expressionIndex, 1);
                }
                var featureLayerView = this.featureLayerViews.getItemAt(operationalItemIndex);
                var filterExpression = queryExpressions.join(" OR ");
                this._setSearchExpression(filterExpression);
                featureLayerView.effect = new FeatureEffect({
                    excludedEffect: "opacity(" + opacityValue + "%) grayscale(" + grayScaleValue + "%)",
                    filter: {
                        where: filterExpression
                    }
                });
            }
            else {
                this._generateQueryExpressions(elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos, normalizationField);
                var featureLayerView = this.featureLayerViews.getItemAt(operationalItemIndex);
                var filterExpression = queryExpressions.join(" OR ");
                this._setSearchExpression(filterExpression);
                featureLayerView.effect = new FeatureEffect({
                    excludedEffect: "opacity(" + opacityValue + "%) grayscale(" + grayScaleValue + "%)",
                    filter: {
                        where: filterExpression
                    }
                });
            }
        };
        // resetLegendFilter
        InteractiveStyleViewModel.prototype.resetLegendFilter = function (featureLayerData, operationalItemIndex) {
            var featureLayerView = featureLayerData.featureLayerView, selectedInfoIndex = featureLayerData.selectedInfoIndex;
            var queryExpressionsCollection = this.interactiveStyleData.get("queryExpressions");
            var queryExpressions = queryExpressionsCollection.getItemAt(operationalItemIndex);
            if (queryExpressions) {
                queryExpressions.length = 0;
            }
            if (this.filterMode === "featureFilter") {
                featureLayerView.filter = null;
            }
            else if (this.filterMode === "mute") {
                featureLayerView.effect = null;
            }
            if (selectedInfoIndex.length) {
                selectedInfoIndex.length = 0;
            }
            this._setSearchExpression(null);
            this.notifyChange("state");
        };
        // FEATURE COUNT METHODS
        InteractiveStyleViewModel.prototype.queryFeatureCount = function (elementInfo, field, legendInfoIndex, operationalItemIndex, legendElement, isPredominance, legendElementIndex, legendElementInfos, normalizationField, generateFeatureCountExpression) {
            var _this = this;
            var _a = this.interactiveStyleData, featureCount = _a.featureCount, totalFeatureCount = _a.totalFeatureCount;
            if (!featureCount.getItemAt(operationalItemIndex)) {
                featureCount.add(new Collection(), operationalItemIndex);
            }
            if (totalFeatureCount[operationalItemIndex] === undefined) {
                totalFeatureCount[operationalItemIndex] = null;
            }
            var featureLayerView = this.featureLayerViews.getItemAt(operationalItemIndex);
            var handlesKey = featureLayerView
                ? featureLayerView.layer.id + "-" + legendInfoIndex
                : null;
            if (!this._handles.has(handlesKey)) {
                var queryFeatureCount_1 = promiseUtils.debounce(function () {
                    var queryExpression = _this._generateQueryCountExpression(elementInfo, field, legendInfoIndex, operationalItemIndex, legendElement, isPredominance, legendElementInfos, normalizationField, generateFeatureCountExpression);
                    var query = _this._generateFeatureCountQuery(queryExpression);
                    _this.featureCountQuery =
                        featureLayerView &&
                            featureLayerView.queryFeatureCount &&
                            featureLayerView.queryFeatureCount(query);
                    if (!_this.featureCountQuery) {
                        return;
                    }
                    var featureCountValue = featureCount.getItemAt(operationalItemIndex);
                    return _this.featureCountQuery.then(function (featureCountRes) {
                        if (featureCountValue) {
                            featureCountValue.removeAt(legendInfoIndex);
                        }
                        featureCountValue.add(featureCountRes, legendInfoIndex);
                        var selectedInfoLength = _this.selectedStyleDataCollection.getItemAt(operationalItemIndex).selectedInfoIndex.length;
                        if (selectedInfoLength === 0) {
                            _this.queryTotalFeatureCount(operationalItemIndex);
                        }
                        else {
                            _this.updateTotalFeatureCount(operationalItemIndex, legendElementIndex);
                        }
                        _this.featureCountQuery = null;
                        _this.notifyChange("state");
                    });
                });
                this._handles.add([
                    watchUtils.whenFalse(this.view, "stationary", function () {
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
                    watchUtils.whenFalse(featureLayerView, "updating", function () {
                        watchUtils.whenFalseOnce(featureLayerView, "updating", function () {
                            queryFeatureCount_1();
                        });
                    })
                ], handlesKey);
            }
        };
        InteractiveStyleViewModel.prototype._generateFeatureCountQuery = function (queryExpression) {
            var geometry = this.view && this.view.get("extent");
            var outSpatialReference = this.view && this.view.get("spatialReference");
            return new Query({
                where: queryExpression,
                geometry: geometry,
                outSpatialReference: outSpatialReference
            });
        };
        // queryTotalFeatureCount
        InteractiveStyleViewModel.prototype.queryTotalFeatureCount = function (operationalItemIndex) {
            var totalFeatureCount = this.interactiveStyleData.totalFeatureCount;
            var featureCountCollection = this.interactiveStyleData.get("featureCount");
            var featureCount = featureCountCollection.getItemAt(operationalItemIndex);
            totalFeatureCount[operationalItemIndex] = null;
            var queryExpressionsCollection = this.interactiveStyleData.get("queryExpressions");
            var queryExpressions = queryExpressionsCollection.getItemAt(operationalItemIndex);
            if (queryExpressions && queryExpressions[0] === "1=0") {
                totalFeatureCount[operationalItemIndex] = 0;
            }
            else if (featureCount) {
                featureCount.forEach(function (count) {
                    totalFeatureCount[operationalItemIndex] += count;
                });
            }
            this.notifyChange("state");
        };
        // updateTotalFeatureCount
        InteractiveStyleViewModel.prototype.updateTotalFeatureCount = function (operationalItemIndex, legendElementIndex) {
            var selectedInfoIndexes = this.selectedStyleDataCollection.getItemAt(operationalItemIndex).selectedInfoIndex[legendElementIndex];
            if (selectedInfoIndexes && selectedInfoIndexes.length === 0) {
                this.queryTotalFeatureCount(operationalItemIndex);
            }
            else {
                var totalFeatureCount_1 = this.interactiveStyleData.totalFeatureCount;
                totalFeatureCount_1[operationalItemIndex] = null;
                var featureCount = this.interactiveStyleData.featureCount.getItemAt(operationalItemIndex);
                featureCount.forEach(function (count, countIndex) {
                    selectedInfoIndexes.forEach(function (selectedIndex) {
                        if (countIndex === selectedIndex) {
                            totalFeatureCount_1[operationalItemIndex] += count;
                        }
                    });
                });
            }
            this.notifyChange("state");
        };
        // updateExtentToAllFeatures
        // LIMITATION: When complex expressions (normalized fields) are queried against feature services that have Use Standardized Queries set to false - update extent cannot be applied.
        InteractiveStyleViewModel.prototype.updateExtentToAllFeatures = function (operationalItemIndex) {
            var _this = this;
            var layerView = this.featureLayerViews.getItemAt(operationalItemIndex);
            var filterWhere = layerView.get("filter.where");
            var effectWhere = layerView.get("effect.filter.where");
            var featureLayer = this.featureLayerViews.getItemAt(operationalItemIndex)
                .layer;
            var query = new Query();
            var queryExpressions = this.filterMode === "featureFilter" ? filterWhere : effectWhere;
            var whereClause = queryExpressions ? "" + queryExpressions : "1=1";
            query.where = whereClause;
            query.outSpatialReference = this.view.spatialReference;
            featureLayer
                .queryExtent(query)
                .catch(function (err) {
                console.error("ERROR: ", err);
            })
                .then(function (extent) {
                _this.view.goTo(extent);
            });
        };
        //----------------------------------
        //
        //  Private methods
        //
        //----------------------------------
        // _storeFeatureData
        InteractiveStyleViewModel.prototype._storeFeatureData = function () {
            var _this = this;
            this.layerListViewModel.operationalItems.forEach(function (operationalItem) {
                _this._setUpDataContainers();
                var featureLayerView = operationalItem.layerView;
                _this.featureLayerViews.push(featureLayerView);
            });
        };
        // _setUpDataContainers
        InteractiveStyleViewModel.prototype._setUpDataContainers = function () {
            var queryExpressions = this.interactiveStyleData.queryExpressions;
            queryExpressions.add([]);
        };
        //----------------------------------
        //
        //  Feature Filter Methods
        //
        //----------------------------------
        // _generateQueryExpressions
        InteractiveStyleViewModel.prototype._generateQueryExpressions = function (elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos, normalizationField, generateFeatureCountExpression) {
            var queryExpression = this._generateQueryExpression(elementInfo, field, legendInfoIndex, legendElement, legendElementInfos, normalizationField);
            if (!generateFeatureCountExpression) {
                var hasOneValue = legendElementInfos && legendElementInfos.length === 1;
                var queryExpressionsCollection = this.interactiveStyleData.get("queryExpressions");
                var queryExpressions = queryExpressionsCollection.getItemAt(operationalItemIndex);
                var expressionIndex = queryExpressions.indexOf(queryExpression);
                if (queryExpressions.length === 0 || expressionIndex === -1) {
                    if (queryExpressions && queryExpressions[0] === "1=0") {
                        queryExpressions.splice(0, 1);
                    }
                    queryExpressions.push(queryExpression);
                }
                else if (queryExpressions &&
                    queryExpressions.length === 1 &&
                    queryExpression === queryExpressions[0] &&
                    !hasOneValue) {
                    queryExpressions[0] = "1=0";
                }
                else if (queryExpressions &&
                    queryExpressions.length === 1 &&
                    !hasOneValue) {
                    queryExpressions[0] = [queryExpression];
                }
                else if (queryExpressions &&
                    queryExpressions.length === 1 &&
                    queryExpression !== queryExpressions[0] &&
                    queryExpressions[0] === "1=0" &&
                    !hasOneValue) {
                    queryExpressions[0] = [queryExpression];
                    // queryExpressions.push(queryExpression);
                }
                else if (queryExpressions &&
                    queryExpressions.length === 1 &&
                    queryExpression === queryExpressions[0] &&
                    queryExpressions[0] === "1=0" &&
                    !hasOneValue) {
                    queryExpressions[0] = [];
                }
                else {
                    queryExpressions.splice(expressionIndex, 1);
                }
            }
            else {
                return queryExpression;
            }
        };
        // _generateQueryExpression
        InteractiveStyleViewModel.prototype._generateQueryExpression = function (elementInfo, field, legendInfoIndex, legendElement, legendElementInfos, normalizationField) {
            var value = elementInfo.value;
            if (legendElement.type === "symbol-table") {
                // Classify data size/color ramp
                if (!elementInfo.hasOwnProperty("value") ||
                    (Array.isArray(elementInfo.value) && legendElementInfos.length === 1)) {
                    // Classify data size/color ramp - 'Other' category
                    if (legendElementInfos[0].hasOwnProperty("value") &&
                        Array.isArray(legendElementInfos[0].value) &&
                        legendElementInfos[legendElementInfos.length - 2] &&
                        legendElementInfos[legendElementInfos.length - 2].hasOwnProperty("value") &&
                        Array.isArray(legendElementInfos[legendElementInfos.length - 2].value)) {
                        var expression = normalizationField
                            ? "((" + field + "/" + normalizationField + ") > " + legendElementInfos[0].value[1] + ") OR ((" + field + "/" + normalizationField + ") < " + legendElementInfos[legendElementInfos.length - 2].value[0] + ") OR " + normalizationField + " = 0 OR " + normalizationField + " IS NULL"
                            : field + " > " + legendElementInfos[0].value[1] + " OR " + field + " < " + legendElementInfos[legendElementInfos.length - 2].value[0] + " OR " + field + " IS NULL";
                        return expression;
                    }
                    else if (legendElementInfos.length === 1) {
                        return "1=0";
                    }
                    else {
                        // Types unique symbols - 'Other' category
                        var expressionList_1 = [];
                        legendElementInfos.forEach(function (legendElementInfo) {
                            if (legendElementInfo.value) {
                                var value_1 = legendElementInfo.value;
                                var singleQuote = value_1.indexOf("'") !== -1 ? value_1.split("'").join("''") : null;
                                var expression = singleQuote
                                    ? field + " <> '" + singleQuote + "'"
                                    : isNaN(value_1)
                                        ? field + " <> '" + value_1 + "'"
                                        : field + " <> " + value_1 + " AND " + field + " <> '" + value_1 + "'";
                                expressionList_1.push(expression);
                            }
                        });
                        var noExpression = expressionList_1.join(" AND ");
                        return noExpression + " OR " + field + " IS NULL";
                    }
                }
                else {
                    var singleQuote = value.indexOf("'") !== -1 ? value.split("'").join("''") : null;
                    var isArray = Array.isArray(elementInfo.value);
                    var isLastElement = legendElementInfos.length - 1 === legendInfoIndex;
                    var lastElementAndNoValue = !legendElementInfos[legendElementInfos.length - 1].hasOwnProperty("value");
                    var secondToLastElement = legendInfoIndex === legendElementInfos.length - 2;
                    var expression = isArray
                        ? normalizationField
                            ? isLastElement || (lastElementAndNoValue && secondToLastElement)
                                ? "(" + field + "/" + normalizationField + ") >= " + value[0] + " AND (" + field + "/" + normalizationField + ") <= " + elementInfo.value[1]
                                : "(" + field + "/" + normalizationField + ") > " + value[0] + " AND (" + field + "/" + normalizationField + ") <= " + elementInfo.value[1]
                            : isLastElement || (lastElementAndNoValue && secondToLastElement)
                                ? field + " >= " + value[0] + " AND " + field + " <= " + value[1]
                                : field + " > " + value[0] + " AND " + field + " <= " + value[1]
                        : legendElementInfos.length === 1 && field
                            ? isNaN(value) || !value.trim().length
                                ? field + " <> '" + value + "'"
                                : field + " <> " + value + " OR " + field + " <> '" + value + "'"
                            : singleQuote
                                ? field + " = '" + singleQuote + "'"
                                : isNaN(value) || !value.trim().length
                                    ? field + " = '" + value + "'"
                                    : field + " = " + value + " OR " + field + " = '" + value + "'";
                    return expression;
                }
            }
        };
        // _handlePredominanceExpression
        InteractiveStyleViewModel.prototype._handlePredominanceExpression = function (elementInfo, operationalItemIndex) {
            var featureLayerView = this.featureLayerViews.getItemAt(operationalItemIndex);
            var authoringInfo = featureLayerView
                ? featureLayerView.layer.renderer.authoringInfo
                : null;
            var fields = authoringInfo ? authoringInfo.fields : null;
            var expressionArr = [];
            if (!fields) {
                return;
            }
            if (elementInfo.hasOwnProperty("value")) {
                fields.forEach(function (field) {
                    if (elementInfo.value === field) {
                        return;
                    }
                    var sqlQuery = "(" + elementInfo.value + " > " + field + " OR (" + field + " IS NULL AND " + elementInfo.value + " <> 0 AND " + elementInfo.value + " IS NOT NULL))";
                    expressionArr.push(sqlQuery);
                });
                return expressionArr.join(" AND ");
            }
            else {
                var queryForZeroes_1 = [];
                fields.forEach(function (field) {
                    queryForZeroes_1.push(field + " = 0");
                });
                var otherExpression_1 = [];
                if (fields.length > 2) {
                    fields.forEach(function (field1) {
                        fields.forEach(function (field2) {
                            if (field1 === field2) {
                                return;
                            }
                            var queryForMultiplePredominance = [];
                            fields.forEach(function (field3) {
                                if (field1 === field3 || field2 === field3) {
                                    return;
                                }
                                queryForMultiplePredominance.push(field1 + " = " + field2 + " AND (" + field1 + " > " + field3 + " OR " + field1 + " >= " + field3 + ")");
                            });
                            otherExpression_1.push("(" + queryForMultiplePredominance.join(" AND ") + ")");
                        });
                    });
                    var isNull_1 = [];
                    fields.forEach(function (field) {
                        isNull_1.push(field + " IS NULL");
                    });
                    var generatedOtherExpression = "(" + queryForZeroes_1.join(" AND ") + ") OR (" + otherExpression_1.join(" OR ") + ") OR (" + isNull_1.join(" AND ") + ")";
                    return generatedOtherExpression;
                }
                else {
                    var expressions_1 = [];
                    fields.forEach(function (field1) {
                        fields.forEach(function (field2) {
                            if (field1 === field2) {
                                return;
                            }
                            expressions_1.push(field1 + " = " + field2);
                            expressions_1.push("(" + queryForZeroes_1.join(" AND ") + ")");
                        });
                    });
                    var zeroAndNull_1 = [];
                    fields.forEach(function (field1) {
                        fields.forEach(function (field2) {
                            if (field1 === field2) {
                                return;
                            }
                            zeroAndNull_1.push("(" + field1 + " = 0 AND " + field2 + " IS NULL) OR (" + field1 + " IS NULL AND " + field2 + " IS NULL)");
                        });
                    });
                    return "(" + expressions_1.join(" OR ") + ") OR (" + zeroAndNull_1.join(" OR ") + ")";
                }
            }
        };
        // _generateQueryCountExpression
        InteractiveStyleViewModel.prototype._generateQueryCountExpression = function (elementInfo, field, legendInfoIndex, operationalItemIndex, legendElement, isPredominance, legendElementInfos, normalizationField, generateFeatureCountExpression) {
            var singleSymbol = legendElementInfos.length === 1;
            if (!singleSymbol) {
                if (isPredominance) {
                    var predominanceExpression = this._handlePredominanceExpression(elementInfo, operationalItemIndex);
                    return predominanceExpression;
                }
                else {
                    return this._generateQueryExpressions(elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos, normalizationField, generateFeatureCountExpression);
                }
            }
            else {
                var queryExpressionCollection = this.interactiveStyleData.get("queryExpressions");
                var queryExpressions = queryExpressionCollection.getItemAt(operationalItemIndex);
                var expression = queryExpressions[0];
                if ((expression && expression === "1=0") ||
                    (expression && expression.indexOf("<>"))) {
                    return "1=0";
                }
                else {
                    return "1=1";
                }
            }
        };
        // _setSearchExpression
        InteractiveStyleViewModel.prototype._setSearchExpression = function (filterExpression) {
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
        // _disableClustering
        InteractiveStyleViewModel.prototype._disableClustering = function (disableClusteringKey) {
            var _this = this;
            var allLayers = this.get("view.map.allLayers");
            var layerPromises = [];
            allLayers.forEach(function (layer) {
                layerPromises.push(layer.load().then(function (loadedLayer) {
                    return loadedLayer;
                }));
            });
            Promise.all(layerPromises).then(function (layers) {
                layers.forEach(function (layerItem) {
                    if (layerItem && layerItem.get("featureReduction")) {
                        layerItem.set("featureReduction", null);
                    }
                });
                _this._handles.remove(disableClusteringKey);
            });
        };
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "activeLayerInfos", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "interactiveStyleData", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "featureLayerViews", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "featureCountQuery", void 0);
        __decorate([
            decorators_1.property({
                dependsOn: [
                    "view.updating",
                    "searchExpressions",
                    "layerListViewModel",
                    "featureCountQuery"
                ],
                readOnly: true
            })
        ], InteractiveStyleViewModel.prototype, "state", null);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "selectedStyleDataCollection", void 0);
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
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "opacity", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "grayScale", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "featureCountEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "updateExtentEnabled", void 0);
        InteractiveStyleViewModel = __decorate([
            decorators_1.subclass("InteractiveStyleViewModel")
        ], InteractiveStyleViewModel);
        return InteractiveStyleViewModel;
    }(decorators_1.declared(Accessor)));
    return InteractiveStyleViewModel;
});
//# sourceMappingURL=InteractiveStyleViewModel.js.map