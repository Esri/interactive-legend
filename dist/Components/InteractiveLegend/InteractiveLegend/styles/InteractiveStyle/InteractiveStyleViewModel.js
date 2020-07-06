define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/core/Handles", "esri/core/watchUtils", "esri/core/Collection", "esri/widgets/LayerList/LayerListViewModel", "esri/views/layers/support/FeatureFilter", "esri/views/layers/support/FeatureEffect", "esri/tasks/support/Query", "./InteractiveStyleData", "./SelectedStyleData"], function (require, exports, tslib_1, Accessor, decorators_1, Handles, watchUtils, Collection, LayerListViewModel, FeatureFilter, FeatureEffect, Query, InteractiveStyleData, SelectedStyleData) {
    "use strict";
    var InteractiveStyleViewModel = /** @class */ (function (_super) {
        tslib_1.__extends(InteractiveStyleViewModel, _super);
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
            // featureCountEnabled
            _this.featureCountEnabled = null;
            // updateExtentEnabled
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
            enumerable: false,
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
                    _this.selectedStyleDataCollection.addMany(tslib_1.__spreadArrays(selectedStyleDataCollection));
                }),
                watchUtils.watch(this, "filterMode", function () {
                    _this.selectedStyleDataCollection.forEach(function (selectedStyleData) {
                        var _a, _b, _c;
                        if (_this.filterMode === "featureFilter") {
                            var filter = (_b = (_a = selectedStyleData === null || selectedStyleData === void 0 ? void 0 : selectedStyleData.featureLayerView) === null || _a === void 0 ? void 0 : _a.effect) === null || _b === void 0 ? void 0 : _b.filter;
                            if (filter) {
                                selectedStyleData.featureLayerView.effect = null;
                                selectedStyleData.featureLayerView.filter = filter;
                            }
                        }
                        else if (_this.filterMode === "mute") {
                            var filter = (_c = selectedStyleData === null || selectedStyleData === void 0 ? void 0 : selectedStyleData.featureLayerView) === null || _c === void 0 ? void 0 : _c.filter;
                            if (filter) {
                                selectedStyleData.featureLayerView.filter = null;
                                var _d = _this, opacity = _d.opacity, grayScale = _d.grayScale;
                                var opacityValue = opacity === null ? 30 : opacity;
                                var grayScaleValue = grayScale === null ? 100 : grayScale;
                                selectedStyleData.featureLayerView.effect = new FeatureEffect({
                                    excludedEffect: "opacity(" + opacityValue + "%) grayscale(" + grayScaleValue + "%)",
                                    filter: filter
                                });
                            }
                        }
                    });
                }),
                watchUtils.watch(this, "opacity, grayScale", function () {
                    _this.selectedStyleDataCollection.forEach(function (selectedStyleData) {
                        var _a, _b, _c;
                        if (_this.filterMode === "mute") {
                            var filter = ((_a = selectedStyleData === null || selectedStyleData === void 0 ? void 0 : selectedStyleData.featureLayerView) === null || _a === void 0 ? void 0 : _a.filter) || ((_c = (_b = selectedStyleData === null || selectedStyleData === void 0 ? void 0 : selectedStyleData.featureLayerView) === null || _b === void 0 ? void 0 : _b.effect) === null || _c === void 0 ? void 0 : _c.filter);
                            selectedStyleData.featureLayerView.filter = null;
                            var _d = _this, opacity = _d.opacity, grayScale = _d.grayScale;
                            var opacityValue = opacity === null ? 30 : opacity;
                            var grayScaleValue = grayScale === null ? 100 : grayScale;
                            selectedStyleData.featureLayerView.effect = new FeatureEffect({
                                excludedEffect: "opacity(" + opacityValue + "%) grayscale(" + grayScaleValue + "%)",
                                filter: filter
                            });
                        }
                    });
                })
            ]);
            this._initFeatureCount();
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
        // validateInteractivity
        InteractiveStyleViewModel.prototype.validateInteractivity = function (activeLayerInfo, legendElement, field, featureLayerView, legendElementIndex) {
            var _a, _b, _c, _d;
            var type = legendElement.type;
            var classBreakInfos = featureLayerView === null || featureLayerView === void 0 ? void 0 : featureLayerView.get("layer.renderer.classBreakInfos");
            var isSizeRamp = type === "size-ramp";
            var isColorRamp = type === "color-ramp";
            var opacityRamp = type === "opacity-ramp";
            var heatmapRamp = type === "heatmap-ramp";
            var hasMoreThanOneClassBreak = featureLayerView && classBreakInfos && classBreakInfos.length > 1;
            var authoringInfoType = featureLayerView === null || featureLayerView === void 0 ? void 0 : featureLayerView.get("layer.renderer.authoringInfo.type");
            var isPredominance = authoringInfoType === "predominance";
            var classifyDataCheckedColorRamp = authoringInfoType === "class-breaks-color";
            var classifyDataCheckedSizeRamp = authoringInfoType === "class-breaks-size";
            var singleSymbol = ((_a = legendElement === null || legendElement === void 0 ? void 0 : legendElement.infos) === null || _a === void 0 ? void 0 : _a.length) === 1 && !field;
            var isRelationship = authoringInfoType === "relationship" &&
                legendElement.type !== "size-ramp";
            var featureLayerData = (_b = this.selectedStyleDataCollection) === null || _b === void 0 ? void 0 : _b.find(function (data) { var _a; return data ? ((_a = activeLayerInfo === null || activeLayerInfo === void 0 ? void 0 : activeLayerInfo.layer) === null || _a === void 0 ? void 0 : _a.id) === (data === null || data === void 0 ? void 0 : data.layerItemId) : null; });
            var hasSublayers = activeLayerInfo.get("parent.children.length") > 0;
            var isFeatureLayer = (activeLayerInfo === null || activeLayerInfo === void 0 ? void 0 : activeLayerInfo.get("layer.type")) === "feature";
            var moreThanOneClassBreak = !hasSublayers &&
                isFeatureLayer &&
                field &&
                !isColorRamp &&
                !isSizeRamp &&
                featureLayerData &&
                hasMoreThanOneClassBreak;
            var oneClassBreak = !hasSublayers &&
                isFeatureLayer &&
                field &&
                !isColorRamp &&
                !isSizeRamp &&
                featureLayerData &&
                !hasMoreThanOneClassBreak
                ? true
                : false;
            var validate = oneClassBreak ||
                (isPredominance && !isSizeRamp) ||
                (classifyDataCheckedColorRamp && field) ||
                (classifyDataCheckedSizeRamp && field) ||
                (singleSymbol && !field && field !== null) ||
                isRelationship
                ? true
                : false;
            var hasClustering = (activeLayerInfo === null || activeLayerInfo === void 0 ? void 0 : activeLayerInfo.get("layer.featureReduction")) &&
                ((_c = activeLayerInfo === null || activeLayerInfo === void 0 ? void 0 : activeLayerInfo.legendElements[legendElementIndex]) === null || _c === void 0 ? void 0 : _c.type) === "size-ramp";
            var isSingleSymbol = legendElement.type === "symbol-table" &&
                ((_d = legendElement === null || legendElement === void 0 ? void 0 : legendElement.infos) === null || _d === void 0 ? void 0 : _d.length) === 1;
            var hasColorRamp = !(activeLayerInfo === null || activeLayerInfo === void 0 ? void 0 : activeLayerInfo.legendElements.every(function (legendElement) { return legendElement.type !== "color-ramp"; }));
            var hasSizeRamp = !(activeLayerInfo === null || activeLayerInfo === void 0 ? void 0 : activeLayerInfo.legendElements.every(function (legendElement) { return legendElement.type !== "size-ramp"; }));
            var singleSymbolColor = isSingleSymbol && hasColorRamp;
            var singleSymbolSize = isSingleSymbol && hasSizeRamp;
            return isFeatureLayer &&
                !hasClustering &&
                !opacityRamp &&
                !heatmapRamp &&
                !hasSublayers &&
                !singleSymbolColor &&
                !singleSymbolSize
                ? classBreakInfos
                    ? moreThanOneClassBreak || validate
                    : oneClassBreak || validate
                : false;
        };
        // // FEATURE COUNT METHODS
        // _initFeatureCount
        InteractiveStyleViewModel.prototype._initFeatureCount = function () {
            var _this = this;
            var initFeatureCountKey = "init-feature-count";
            this._handles.add(watchUtils.watch(this, "featureCountEnabled", function () {
                _this._handles.remove(initFeatureCountKey);
                _this._handles.add([_this._watchDataForCount(initFeatureCountKey)], initFeatureCountKey);
                _this._updateFeatureCountOnViewUpdate(initFeatureCountKey);
            }));
        };
        // _watchDataForCount
        InteractiveStyleViewModel.prototype._watchDataForCount = function (handlesKey) {
            var _this = this;
            return watchUtils.when(this, "layerListViewModel.operationalItems.length", function () {
                if (_this._handles.has(handlesKey)) {
                    _this._handles.remove(handlesKey);
                }
                var activeLayerInfosCountKey = "active-layer-infos-count-key";
                _this._handles.add(watchUtils.when(_this, "activeLayerInfos.length", function () {
                    if (_this._handles.has(activeLayerInfosCountKey)) {
                        _this._handles.remove(activeLayerInfosCountKey);
                    }
                    var selectedStyleDataCollectionCountKey = "selected-style-data-collection-count-key";
                    _this._handles.add(watchUtils.when(_this, "selectedStyleDataCollection.length", function () {
                        if (_this._handles.has(selectedStyleDataCollectionCountKey)) {
                            _this._handles.remove(selectedStyleDataCollectionCountKey);
                        }
                        _this._handleOperationalItemForCount();
                    }), selectedStyleDataCollectionCountKey);
                }), activeLayerInfosCountKey);
            });
        };
        // _updateFeatureCountOnViewUpdate
        InteractiveStyleViewModel.prototype._updateFeatureCountOnViewUpdate = function (initFeatureCountKey) {
            var _this = this;
            var featureCountViewUpdateKey = "feature-count-view-update-key";
            this._handles.remove(featureCountViewUpdateKey);
            this._handles.add([
                watchUtils.whenFalse(this, "view.stationary", function () {
                    if (!_this.view.stationary) {
                        var stationaryIsTrue_1 = "stationary-is-true";
                        _this._handles.add(watchUtils.whenTrueOnce(_this, "view.stationary", function () {
                            if (_this._handles.has(stationaryIsTrue_1)) {
                                _this._handles.remove(stationaryIsTrue_1);
                            }
                            _this._handles.add([_this._watchDataForCount(initFeatureCountKey)], initFeatureCountKey);
                        }), stationaryIsTrue_1);
                    }
                    else {
                        var stationaryIsFalse_1 = "stationary-is-false";
                        _this._handles.add(watchUtils.whenFalseOnce(_this, "view.interacting", function () {
                            if (_this._handles.has(stationaryIsFalse_1)) {
                                _this._handles.remove(stationaryIsFalse_1);
                            }
                            _this._handles.add([_this._watchDataForCount(initFeatureCountKey)], initFeatureCountKey);
                        }), stationaryIsFalse_1);
                    }
                })
            ], featureCountViewUpdateKey);
        };
        // _handleOperationalItemForCount
        InteractiveStyleViewModel.prototype._handleOperationalItemForCount = function () {
            var _this = this;
            this.layerListViewModel.operationalItems.forEach(function (operationalItem, operationalItemIndex) {
                var _a = _this.interactiveStyleData, featureCount = _a.featureCount, totalFeatureCount = _a.totalFeatureCount;
                if (!featureCount.getItemAt(operationalItemIndex)) {
                    featureCount.add(new Collection(), operationalItemIndex);
                }
                if (totalFeatureCount[operationalItemIndex] === undefined) {
                    totalFeatureCount[operationalItemIndex] = null;
                }
                var featureLayerView = _this.featureLayerViews.getItemAt(operationalItemIndex);
                _this.activeLayerInfos.forEach(function (activeLayerInfo) {
                    if (operationalItem.layer.id === activeLayerInfo.layer.id) {
                        _this._handleActiveLayerInfoForCount(activeLayerInfo, featureLayerView, operationalItemIndex);
                    }
                });
            });
        };
        // _handleActiveLayerInfoForCount
        InteractiveStyleViewModel.prototype._handleActiveLayerInfoForCount = function (activeLayerInfo, featureLayerView, operationalItemIndex) {
            var _this = this;
            var watchLegendElementsForCount = "watch-legend-elements-for-count";
            this._handles.add(watchUtils.whenOnce(activeLayerInfo, "legendElements.length", function () {
                if (_this._handles.has(watchLegendElementsForCount)) {
                    _this._handles.remove(watchLegendElementsForCount);
                }
                activeLayerInfo.legendElements.forEach(function (legendElement, legendElementIndex) {
                    _this._handleLegendElementForCount(legendElement, featureLayerView, legendElementIndex, operationalItemIndex, activeLayerInfo);
                });
            }), watchLegendElementsForCount);
        };
        // _handleLegendElementForCount
        InteractiveStyleViewModel.prototype._handleLegendElementForCount = function (legendElement, featureLayerView, legendElementIndex, operationalItemIndex, activeLayerInfo) {
            var isInteractive = this.validateInteractivity(activeLayerInfo, legendElement, activeLayerInfo.get("layer.renderer.field"), featureLayerView, legendElementIndex);
            if (!(legendElement === null || legendElement === void 0 ? void 0 : legendElement.infos) || !isInteractive) {
                return;
            }
            this._handleLayerViewWatcherForCount(featureLayerView, legendElementIndex, operationalItemIndex, legendElement, activeLayerInfo);
            this._handleFeatureCount(featureLayerView, legendElementIndex, operationalItemIndex, legendElement, activeLayerInfo);
        };
        // _handleLayerViewWatcherForCount
        InteractiveStyleViewModel.prototype._handleLayerViewWatcherForCount = function (featureLayerView, legendElementIndex, operationalItemIndex, legendElement, activeLayerInfo) {
            var _this = this;
            var key = "feature-count-" + activeLayerInfo.layer.id + "-" + operationalItemIndex + "-" + legendElementIndex;
            if (!this._handles.has(key) && featureLayerView) {
                this._handles.add(watchUtils.whenFalse(featureLayerView, "updating", function () {
                    _this._handleFeatureCount(featureLayerView, legendElementIndex, operationalItemIndex, legendElement, activeLayerInfo);
                }), key);
            }
        };
        // _handleFeatureCount
        InteractiveStyleViewModel.prototype._handleFeatureCount = function (featureLayerView, legendElementIndex, operationalItemIndex, legendElement, activeLayerInfo) {
            var _this = this;
            var promises = [];
            legendElement.infos.forEach(function (info, infoIndex) {
                _this._handleLegendElementForFeatureCount(featureLayerView, legendElementIndex, infoIndex, operationalItemIndex, legendElement, info, promises, activeLayerInfo);
            });
            Promise.all(promises).then(function (featureCountResponses) {
                _this._handleFeatureCountResponses(featureCountResponses, operationalItemIndex, legendElementIndex);
            });
        };
        // _handleLegendElementForFeatureCount
        InteractiveStyleViewModel.prototype._handleLegendElementForFeatureCount = function (featureLayerView, legendElementIndex, infoIndex, operationalItemIndex, legendElement, info, promises, activeLayerInfo) {
            var _this = this;
            var handlesKey = featureLayerView
                ? featureLayerView.layer.id + "-" + legendElementIndex + "-" + infoIndex
                : null;
            var selectedStyleData = this.selectedStyleDataCollection.getItemAt(operationalItemIndex);
            var field = selectedStyleData.field, normalizationField = selectedStyleData.normalizationField;
            if (!this._handles.has(handlesKey)) {
                var applyFeatureCount = this.validateInteractivity(activeLayerInfo, legendElement, field, featureLayerView, legendElementIndex);
                var isPredominance = featureLayerView.get("layer.renderer.authoringInfo.type") ===
                    "predominance";
                if (!applyFeatureCount) {
                    return;
                }
                var queryExpression_1 = this._generateQueryCountExpression(info, field, infoIndex, operationalItemIndex, legendElement, isPredominance, legendElement.infos, normalizationField, applyFeatureCount);
                var query = this._generateFeatureCountQuery(queryExpression_1);
                promises.push(featureLayerView
                    .queryFeatureCount(query)
                    .then(function (featureCountRes) {
                    return {
                        featureCountRes: featureCountRes,
                        infoIndex: infoIndex
                    };
                })
                    .catch(function (err) {
                    console.warn("Invalid geometry - querying count without geometry: ", err);
                    var queryNoGeometry = _this._generateFeatureCountQueryNoGeometry(queryExpression_1);
                    return featureLayerView
                        .queryFeatureCount(queryNoGeometry)
                        .then(function (featureCountRes) {
                        return {
                            featureCountRes: featureCountRes,
                            infoIndex: infoIndex
                        };
                    });
                }));
            }
        };
        // _generateFeatureCountQuery
        InteractiveStyleViewModel.prototype._generateFeatureCountQuery = function (queryExpression) {
            var geometry = this.view && this.view.get("extent");
            var outSpatialReference = this.view && this.view.get("spatialReference");
            return new Query({
                where: queryExpression,
                geometry: geometry,
                outSpatialReference: outSpatialReference
            });
        };
        // _generateFeatureCountQueryNoGeometry
        InteractiveStyleViewModel.prototype._generateFeatureCountQueryNoGeometry = function (queryExpression) {
            var outSpatialReference = this.view && this.view.get("spatialReference");
            return new Query({
                where: queryExpression,
                outSpatialReference: outSpatialReference
            });
        };
        // _handleFeatureCountResponses
        InteractiveStyleViewModel.prototype._handleFeatureCountResponses = function (featureCountResObjects, operationalItemIndex, legendElementIndex) {
            var featureCountsForLegendElement = featureCountResObjects
                .slice()
                .map(function (featureCountResObject) { return featureCountResObject.featureCountRes; });
            var featureCountsForLayer = this.interactiveStyleData.featureCount.getItemAt(operationalItemIndex);
            featureCountsForLayer.splice(legendElementIndex, 1, featureCountsForLegendElement);
            var selectedInfoIndexes = this.selectedStyleDataCollection.getItemAt(operationalItemIndex).selectedInfoIndex[legendElementIndex];
            if ((selectedInfoIndexes === null || selectedInfoIndexes === void 0 ? void 0 : selectedInfoIndexes.length) > 0) {
                this.updateTotalFeatureCount(operationalItemIndex, legendElementIndex);
            }
            else {
                this.queryTotalFeatureCount(operationalItemIndex, legendElementIndex);
            }
        };
        // queryTotalFeatureCount
        InteractiveStyleViewModel.prototype.queryTotalFeatureCount = function (operationalItemIndex, legendElementIndex) {
            var totalFeatureCount = this.interactiveStyleData.totalFeatureCount;
            var featureCountCollection = this.interactiveStyleData.get("featureCount");
            var featureCountsForLayer = featureCountCollection.getItemAt(operationalItemIndex);
            var featureCountsForLegendElement = featureCountsForLayer.getItemAt(legendElementIndex);
            var total = (featureCountsForLegendElement === null || featureCountsForLegendElement === void 0 ? void 0 : featureCountsForLegendElement.length) > 0 &&
                featureCountsForLegendElement.reduce(function (num1, num2) { return num1 + num2; });
            totalFeatureCount[operationalItemIndex] = total;
        };
        // updateTotalFeatureCount
        InteractiveStyleViewModel.prototype.updateTotalFeatureCount = function (operationalItemIndex, legendElementIndex) {
            var totalFeatureCount = this.interactiveStyleData.totalFeatureCount;
            var featureCountsForLegendElement = this.interactiveStyleData.featureCount
                .getItemAt(operationalItemIndex)
                .getItemAt(legendElementIndex);
            var selectedInfoIndexes = this.selectedStyleDataCollection.getItemAt(operationalItemIndex).selectedInfoIndex[legendElementIndex];
            var currentTotal = 0;
            selectedInfoIndexes &&
                selectedInfoIndexes.forEach(function (infoIndex) {
                    currentTotal += featureCountsForLegendElement[infoIndex];
                });
            totalFeatureCount[operationalItemIndex] = currentTotal;
        };
        // End of feature count methods
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
                        return field ? noExpression + " OR " + field + " IS NULL" : "";
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
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "activeLayerInfos", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "interactiveStyleData", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "featureLayerViews", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "featureCountQuery", void 0);
        tslib_1.__decorate([
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
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "selectedStyleDataCollection", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "filterMode", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "layerListViewModel", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "searchExpressions", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "searchViewModel", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "opacity", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "grayScale", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "featureCountEnabled", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleViewModel.prototype, "updateExtentEnabled", void 0);
        InteractiveStyleViewModel = tslib_1.__decorate([
            decorators_1.subclass("InteractiveStyleViewModel")
        ], InteractiveStyleViewModel);
        return InteractiveStyleViewModel;
    }(Accessor));
    return InteractiveStyleViewModel;
});
//# sourceMappingURL=InteractiveStyleViewModel.js.map