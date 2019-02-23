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
define(["require", "exports", "esri/core/tsSupport/assignHelper", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/core/Handles", "esri/core/watchUtils", "esri/core/Collection", "esri/widgets/LayerList/LayerListViewModel", "esri/views/layers/support/FeatureFilter", "esri/views/layers/support/FeatureEffect"], function (require, exports, __assign, __extends, __decorate, Accessor, decorators_1, Handles, watchUtils, Collection, LayerListViewModel, FeatureFilter, FeatureEffect) {
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
            // private _querying: boolean | IPromise<any> = true;
            // interactiveStyleData
            _this.interactiveStyleData = {
                queryExpressions: []
                // highlightedFeatures: []
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
            // // layerGraphics
            // @property()
            // layerGraphics: Collection<Graphic[]> = new Collection();
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
            return _this;
        }
        Object.defineProperty(InteractiveStyleViewModel.prototype, "state", {
            // state
            get: function () {
                return this.view
                    ? this.get("view.ready")
                        ? "ready"
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
                        })
                        // watchUtils.whenFalse(this, "view.updating", () => {
                        //   this.layerListViewModel.operationalItems.forEach(() => {
                        //     if (this.filterMode === "highlight") {
                        //       this._queryFeatures(layerViewKey);
                        //     }
                        //   });
                        // })
                    ]);
                })
            ]);
        };
        InteractiveStyleViewModel.prototype.destroy = function () {
            this._handles.removeAll();
            this._handles.destroy();
            // this.layerGraphics = null;
            this._handles = null;
            // this._querying = null;
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
        InteractiveStyleViewModel.prototype.applyFeatureFilter = function (elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, isPredominance, legendElementInfos) {
            if (isPredominance) {
                var queryExpression = this._handlePredominanceExpression(elementInfo, operationalItemIndex).join(" AND ");
                var queryExpressions = this.interactiveStyleData.queryExpressions[operationalItemIndex];
                var expressionIndex = queryExpressions.indexOf(queryExpression);
                if (queryExpressions.length === 0 || expressionIndex === -1) {
                    queryExpressions.push(queryExpression);
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
                this._generateQueryExpressions(elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos);
                var queryExpressions = this.interactiveStyleData.queryExpressions[operationalItemIndex];
                var featureLayerView = this.featureLayerViews.getItemAt(operationalItemIndex);
                var filterExpression = queryExpressions.join(" OR ");
                this._setSearchExpression(filterExpression);
                featureLayerView.filter = new FeatureFilter({
                    where: filterExpression
                });
            }
        };
        // applyFeatureMute
        InteractiveStyleViewModel.prototype.applyFeatureMute = function (elementInfo, field, legendInfoIndex, operationalItemIndex, legendElement, legendElementInfos, isPredominance) {
            var featureLayer = this.layerListViewModel.operationalItems.getItemAt(operationalItemIndex).layer;
            var renderer = featureLayer.renderer;
            if (isPredominance) {
                var queryExpression = this._handlePredominanceExpression(elementInfo, operationalItemIndex).join(" AND ");
                var queryExpressions = this.interactiveStyleData.queryExpressions[operationalItemIndex];
                var expressionIndex = queryExpressions.indexOf(queryExpression);
                if (queryExpressions.length === 0 || expressionIndex === -1) {
                    queryExpressions.push(queryExpression);
                }
                else {
                    queryExpressions.splice(expressionIndex, 1);
                }
                var featureLayerView = this.featureLayerViews.getItemAt(operationalItemIndex);
                var filterExpression = queryExpressions.join(" OR ");
                var opacity = this.opacity === null ? 30 : this.opacity;
                var grayScale = this.grayScale === null ? 100 : this.grayScale;
                this._setSearchExpression(filterExpression);
                featureLayerView.effect = new FeatureEffect({
                    outsideEffect: "opacity(" + opacity + "%) grayscale(" + grayScale + "%)",
                    filter: {
                        where: filterExpression
                    }
                });
            }
            else if (renderer.hasOwnProperty("uniqueValueInfos")) {
                this._muteUniqueValues(elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos);
            }
            else if (Array.isArray(elementInfo.value) &&
                elementInfo.value.length === 2) {
                this._muteRangeValues(elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos);
            }
        };
        // // applyFeatureHighlight
        // applyFeatureHighlight(
        //   elementInfo: any,
        //   field: string,
        //   legendInfoIndex: number,
        //   operationalItemIndex: number,
        //   legendElement: LegendElement,
        //   isPredominance: boolean,
        //   legendElementInfos: any[]
        // ): void {
        //   if (isPredominance) {
        //     this._handlePredominanceHighlight(
        //       elementInfo,
        //       legendElementInfos,
        //       operationalItemIndex,
        //       legendInfoIndex
        //     );
        //   } else if (
        //     Array.isArray(elementInfo.value) &&
        //     elementInfo.value.length === 2
        //   ) {
        //     this._highlightRangeValues(
        //       legendInfoIndex,
        //       elementInfo,
        //       field,
        //       operationalItemIndex,
        //       legendElementInfos
        //     );
        //   } else {
        //     this._highlightUniqueValues(
        //       legendInfoIndex,
        //       elementInfo,
        //       field,
        //       operationalItemIndex,
        //       legendElementInfos
        //     );
        //   }
        //   this._generateQueryExpressions(
        //     elementInfo,
        //     field,
        //     operationalItemIndex,
        //     legendElement,
        //     null,
        //     legendElementInfos
        //   );
        //   const queryExpressions = this.interactiveStyleData.queryExpressions[
        //     operationalItemIndex
        //   ];
        //   const filterExpression = queryExpressions.join(" OR ");
        //   this._setSearchExpression(filterExpression);
        // }
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
                // this._queryFeatureLayerData(layerViewKey);
            });
        };
        // _setUpDataContainers
        InteractiveStyleViewModel.prototype._setUpDataContainers = function () {
            // const { highlightedFeatures, queryExpressions } = this.interactiveStyleData;
            var queryExpressions = this.interactiveStyleData.queryExpressions;
            // highlightedFeatures.push([]);
            queryExpressions.push([]);
        };
        // // _queryFeatureLayerData
        // private _queryFeatureLayerData(layerViewKey: string): void {
        //   const { _handles, layerGraphics, layerListViewModel } = this;
        //   _handles.remove(layerViewKey);
        //   layerGraphics.removeAll();
        //   layerListViewModel.operationalItems.forEach(() => {
        //     layerGraphics.add(null);
        //   });
        //   this._queryFeatures(layerViewKey);
        // }
        // // queryFeatures
        // private _queryFeatures(layerViewKey: string): void {
        //   this.featureLayerViews.forEach((layerView, layerViewIndex) => {
        //     if (layerView) {
        //       this._handles.add(
        //         watchUtils.whenFalseOnce(layerView, "updating", () => {
        //           if (!layerView) {
        //             return;
        //           }
        //           if (typeof layerView.queryFeatures !== "function") {
        //             this._querying = null;
        //             this.notifyChange("state");
        //           } else {
        //             this._querying = layerView
        //               .queryFeatures()
        //               .catch(err => {
        //                 this._querying = null;
        //                 this.notifyChange("state");
        //                 console.error("FEATURE QUERY ERROR: ", err);
        //               })
        //               .then((results: any) => {
        //                 const featureLayerViews = this.featureLayerViews.getItemAt(
        //                   layerViewIndex
        //                 );
        //                 if (
        //                   results.features &&
        //                   results.features.hasOwnProperty("length") &&
        //                   results.features.length > 0 &&
        //                   featureLayerViews.layer.id === results.features[0].layer.id
        //                 ) {
        //                   this.layerGraphics.splice(
        //                     layerViewIndex,
        //                     1,
        //                     results.features
        //                   );
        //                 }
        //                 this._querying = null;
        //                 this.notifyChange("state");
        //               });
        //           }
        //         }),
        //         layerViewKey
        //       );
        //     }
        //   });
        // }
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
            if (legendElement.type === "symbol-table") {
                if (label.indexOf(">") !== -1) {
                    return Array.isArray(elementInfoHasValue)
                        ? field + " > " + elementInfoHasValue[0] + " AND " + field + " <= " + elementInfo.value[1]
                        : field + " = " + elementInfoHasValue + " OR " + field + " = '" + elementInfoHasValue + "'";
                }
                else if (!elementInfo.hasOwnProperty("value")) {
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
                    return expressionList_1.join(" AND ");
                }
                else {
                    var singleQuote = elementInfoHasValue.indexOf("'") !== -1
                        ? elementInfoHasValue.split("'").join("''")
                        : null;
                    var expression = Array.isArray(elementInfo.value)
                        ? legendElementInfos.length - 1 === legendInfoIndex
                            ? field + " >= " + elementInfoHasValue[0] + " AND " + field + " <= " + elementInfoHasValue[1]
                            : field + " > " + elementInfoHasValue[0] + " AND " + field + " <= " + elementInfoHasValue[1]
                        : singleQuote
                            ? field + " = '" + singleQuote + "'"
                            : isNaN(elementInfoHasValue)
                                ? field + " = '" + elementInfoHasValue + "'"
                                : field + " = " + elementInfoHasValue + " OR " + field + " = '" + elementInfoHasValue + "'";
                    return expression;
                }
            }
        };
        // _handlePredominanceExpression
        InteractiveStyleViewModel.prototype._handlePredominanceExpression = function (elementInfo, operationalItemIndex) {
            var featureLayerView = this.featureLayerViews.getItemAt(operationalItemIndex);
            var authoringInfo = featureLayerView.layer.renderer.authoringInfo;
            var fields = authoringInfo.fields;
            var expressionArr = [];
            fields.forEach(function (field) {
                if (elementInfo.value === field) {
                    return;
                }
                expressionArr.push(elementInfo.value + " > " + field);
            });
            return expressionArr;
        };
        //----------------------------------
        //
        //  Highlight Methods
        //
        //----------------------------------
        // // _highlightRangeValues
        // private _highlightRangeValues(
        //   legendInfoIndex: number,
        //   elementInfo: any,
        //   field: string,
        //   operationalItemIndex: number,
        //   legendElementInfos: any[]
        // ): void {
        //   const features = [];
        //   const highlightedFeatures = this.interactiveStyleData.highlightedFeatures[
        //     operationalItemIndex
        //   ];
        //   const elementInfoValue = elementInfo.value;
        //   if (highlightedFeatures[legendInfoIndex]) {
        //     this._removeHighlight(operationalItemIndex, legendInfoIndex);
        //     return;
        //   }
        //   this.layerGraphics.getItemAt(operationalItemIndex).forEach(feature => {
        //     const fieldValue = feature.attributes[field];
        //     if (legendElementInfos.length - 1 === legendInfoIndex) {
        //       if (
        //         fieldValue >= elementInfoValue[0] &&
        //         fieldValue <= elementInfoValue[1]
        //       ) {
        //         features.push(feature);
        //       }
        //     } else {
        //       if (
        //         fieldValue > elementInfoValue[0] &&
        //         fieldValue <= elementInfoValue[1]
        //       ) {
        //         features.push(feature);
        //       }
        //     }
        //   });
        //   if (features.length === 0) {
        //     return;
        //   }
        //   const highlight = this.featureLayerViews
        //     .getItemAt(operationalItemIndex)
        //     .highlight([...features]);
        //   highlightedFeatures[legendInfoIndex] = [highlight];
        // }
        // // _highlightUniqueValue
        // private _highlightUniqueValues(
        //   legendInfoIndex: number,
        //   elementInfo: any,
        //   field: string,
        //   operationalItemIndex: number,
        //   legendElementInfos: any[]
        // ): void {
        //   const features = [];
        //   const highlightedFeatures = [];
        //   const highlightedFeatureData = this.interactiveStyleData
        //     .highlightedFeatures[operationalItemIndex];
        //   if (highlightedFeatureData[legendInfoIndex]) {
        //     highlightedFeatureData[legendInfoIndex][0].remove();
        //     highlightedFeatureData[legendInfoIndex] = null;
        //     return;
        //   }
        //   if (elementInfo.hasOwnProperty("value")) {
        //     this.layerGraphics.getItemAt(operationalItemIndex).map(feature => {
        //       const attributes = feature.attributes;
        //       if (
        //         elementInfo.value == attributes[field] ||
        //         elementInfo.value == attributes[field.toLowerCase()] ||
        //         elementInfo.value == attributes[field.toUpperCase()]
        //       ) {
        //         features.push(feature);
        //       }
        //     });
        //   } else {
        //     const elementInfoCollection = new Collection(legendElementInfos);
        //     this.layerGraphics.getItemAt(operationalItemIndex).map(feature => {
        //       const itemExists = elementInfoCollection.find(elementInfo => {
        //         if (elementInfo.value) {
        //           return elementInfo.value == feature.attributes[field];
        //         }
        //       });
        //       if (!itemExists) {
        //         features.push(feature);
        //       }
        //     });
        //   }
        //   features.forEach(feature => {
        //     highlightedFeatures.push(feature);
        //   });
        //   if (features.length === 0) {
        //     return;
        //   }
        //   const highlight = this.featureLayerViews
        //     .getItemAt(operationalItemIndex)
        //     .highlight([...highlightedFeatures]);
        //   highlightedFeatureData[legendInfoIndex] = [highlight];
        // }
        // // _handlePredominanceHighlight
        // private _handlePredominanceHighlight(
        //   elementInfo: any,
        //   legendElementInfos: any[],
        //   operationalItemIndex: number,
        //   legendInfoIndex: number
        // ): void {
        //   const predominantFeatures = this.layerGraphics.getItemAt(
        //     operationalItemIndex
        //   );
        //   const { objectIdField } = this.featureLayerViews.getItemAt(
        //     operationalItemIndex
        //   ).layer;
        //   const featuresToHighlight = [];
        //   predominantFeatures.forEach(predominantFeature => {
        //     const itemsToCompare = [];
        //     for (const attr in predominantFeature.attributes) {
        //       if (
        //         attr !== elementInfo.value &&
        //         attr !== objectIdField &&
        //         legendElementInfos.find(
        //           elementInfo => elementInfo.value === elementInfo.value
        //         )
        //       ) {
        //         const item = {};
        //         item[attr] = predominantFeature.attributes[attr];
        //         itemsToCompare.push(item);
        //       }
        //     }
        //     let pass = true;
        //     itemsToCompare.forEach(itemToCompare => {
        //       for (const key in itemToCompare) {
        //         if (
        //           predominantFeature.attributes[elementInfo.value] <
        //           itemToCompare[key]
        //         ) {
        //           pass = false;
        //           break;
        //         }
        //       }
        //     });
        //     if (pass) {
        //       featuresToHighlight.push(predominantFeature);
        //     }
        //   });
        //   this.interactiveStyleData.highlightedFeatures;
        //   const highlightedFeatures = this.interactiveStyleData.highlightedFeatures[
        //     operationalItemIndex
        //   ];
        //   const highlightedFeatureData = this.interactiveStyleData
        //     .highlightedFeatures[operationalItemIndex];
        //   if (highlightedFeatureData[legendInfoIndex]) {
        //     this._removeHighlight(operationalItemIndex, legendInfoIndex);
        //     return;
        //   }
        //   const highlight = this.featureLayerViews
        //     .getItemAt(operationalItemIndex)
        //     .highlight([...featuresToHighlight]);
        //   highlightedFeatures[legendInfoIndex] = [highlight];
        // }
        // // _removeHighlight
        // private _removeHighlight(
        //   operationalItemIndex: number,
        //   legendInfoIndex: number
        // ): void {
        //   const highlightedFeatures = this.interactiveStyleData.highlightedFeatures[
        //     operationalItemIndex
        //   ];
        //   highlightedFeatures[legendInfoIndex].forEach(feature => {
        //     feature.remove();
        //   });
        //   highlightedFeatures[legendInfoIndex] = null;
        // }
        //----------------------------------
        //
        //  Mute Methods
        //
        //----------------------------------
        InteractiveStyleViewModel.prototype._muteUniqueValues = function (elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos) {
            this._generateQueryExpressions(elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos);
            var queryExpressions = this.interactiveStyleData.queryExpressions[operationalItemIndex];
            var featureLayerView = this.featureLayerViews.getItemAt(operationalItemIndex);
            var filterExpression = queryExpressions.join(" OR ");
            var opacity = this.opacity === null ? 30 : this.opacity;
            var grayScale = this.grayScale === null ? 100 : this.grayScale;
            this._setSearchExpression(filterExpression);
            featureLayerView.effect = new FeatureEffect({
                outsideEffect: "opacity(" + opacity + "%) grayscale(" + grayScale + "%)",
                filter: {
                    where: filterExpression
                }
            });
        };
        // _muteRangeValues
        InteractiveStyleViewModel.prototype._muteRangeValues = function (elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos) {
            this._generateQueryExpressions(elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos);
            var queryExpressions = this.interactiveStyleData.queryExpressions[operationalItemIndex];
            var featureLayerView = this.featureLayerViews.getItemAt(operationalItemIndex);
            var filterExpression = queryExpressions.join(" OR ");
            var opacity = this.opacity === null ? 30 : this.opacity;
            var grayScale = this.grayScale === null ? 100 : this.grayScale;
            this._setSearchExpression(filterExpression);
            featureLayerView.effect = new FeatureEffect({
                outsideEffect: "opacity(" + opacity + "%) grayscale(" + grayScale + "%)",
                filter: {
                    where: filterExpression
                }
            });
        };
        // End of filter methods
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
        // resetLegendFilter
        InteractiveStyleViewModel.prototype.resetLegendFilter = function (featureLayerData, operationalItemIndex) {
            this.interactiveStyleData.queryExpressions[operationalItemIndex].length = 0;
            var _a = featureLayerData.featureLayerView, filter = _a.filter, effect = _a.effect;
            if (this.filterMode === "featureFilter" && filter && filter.where) {
                featureLayerData.featureLayerView.filter = new FeatureFilter({
                    where: ""
                });
            }
            else if (this.filterMode === "mute" &&
                effect &&
                effect.filter &&
                effect.filter.where) {
                featureLayerData.featureLayerView.effect = new FeatureEffect({
                    outsideEffect: "opacity(" + this.opacity + "%) grayscale(" + this.grayScale + "%)",
                    filter: {
                        where: ""
                    }
                });
            }
            if (featureLayerData.selectedInfoIndex.length) {
                featureLayerData.selectedInfoIndex.length = 0;
            }
            this._setSearchExpression(null);
            this.notifyChange("state");
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
        InteractiveStyleViewModel = __decorate([
            decorators_1.subclass("InteractiveStyleViewModel")
        ], InteractiveStyleViewModel);
        return InteractiveStyleViewModel;
    }(decorators_1.declared(Accessor)));
    return InteractiveStyleViewModel;
});
//# sourceMappingURL=InteractiveStyleViewModel.js.map