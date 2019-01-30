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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "dojo/i18n!../nls/Legend", "dojo/i18n!../../../../nls/resources", "dojox/gfx", "esri/widgets/Widget", "esri/core/accessorSupport/decorators", "esri/widgets/support/widget", "esri/core/Collection", "esri/core/watchUtils", "./InteractiveStyle/InteractiveStyleViewModel", "esri/core/Handles", "../support/styleUtils", "../relationshipRamp/utils"], function (require, exports, __extends, __decorate, i18n, i18nInteractiveLegend, gfx_1, Widget, decorators_1, widget_1, Collection, watchUtils, InteractiveStyleViewModel, Handles, styleUtils_1, utils_1) {
    "use strict";
    //----------------------------------
    //
    //  CSS classes
    //
    //----------------------------------
    var CSS = {
        widget: "esri-widget",
        base: "esri-legend esri-widget--panel",
        service: "esri-legend__service",
        label: "esri-legend__service-label",
        layer: "esri-legend__layer",
        groupLayer: "esri-legend__group-layer",
        groupLayerChild: "esri-legend__group-layer-child",
        layerTable: "esri-legend__layer-table",
        layerTableSizeRamp: "esri-legend__layer-table--size-ramp",
        layerChildTable: "esri-legend__layer-child-table",
        layerCaption: "esri-legend__layer-caption",
        layerBody: "esri-legend__layer-body",
        layerRow: "esri-legend__layer-row",
        layerCell: "esri-legend__layer-cell",
        layerInfo: "esri-legend__layer-cell esri-legend__layer-cell--info",
        imageryLayerStretchedImage: "esri-legend__imagery-layer-image--stretched",
        imageryLayerCellStretched: "esri-legend__imagery-layer-cell--stretched",
        imageryLayerInfoStretched: "esri-legend__imagery-layer-info--stretched",
        symbolContainer: "esri-legend__layer-cell esri-legend__layer-cell--symbols",
        symbol: "esri-legend__symbol",
        rampContainer: "esri-legend__ramps",
        sizeRamp: "esri-legend__size-ramp",
        colorRamp: "esri-legend__color-ramp",
        opacityRamp: "esri-legend__opacity-ramp",
        borderlessRamp: "esri-legend__borderless-ramp",
        rampTick: "esri-legend__ramp-tick",
        rampFirstTick: "esri-legend__ramp-tick-first",
        rampLastTick: "esri-legend__ramp-tick-last",
        rampLabelsContainer: "esri-legend__ramp-labels",
        rampLabel: "esri-legend__ramp-label",
        message: "esri-legend__message",
        // common
        header: "esri-widget__heading",
        hidden: "esri-hidden",
        calciteStyles: {
            refreshIcon: "icon-ui-refresh",
            btn: "btn",
            btnSmall: "btn-small",
            btnPrimary: "btn-primary",
            error: "icon-ui-error"
        },
        // interactive-legend
        loaderContainer: "esri-interactive-legend__loader-container",
        filterLayerRow: "esri-interactive-legend__filter-layer-row",
        selectedRow: "esri-interactive-legend--selected-row",
        loader: "esri-interactive-legend__loader",
        preventScroll: "esri-interactive-legend__prevent-scroll",
        screenshot: "esri-interactive-legend__screenshot",
        hoverStyles: "esri-interactive-legend--layer-row",
        error: "esri-interactive-legend--error",
        legendElements: "esri-interactive-legend__legend-elements"
    };
    var KEY = "esri-legend__", GRADIENT_WIDTH = 24;
    var InteractiveClassic = /** @class */ (function (_super) {
        __extends(InteractiveClassic, _super);
        //-------------------------------------------------------------------
        //
        //  Lifecycle methods
        //
        //-------------------------------------------------------------------
        function InteractiveClassic(params) {
            var _this = _super.call(this) || this;
            //----------------------------------
            //
            //  Variables
            //
            //----------------------------------
            _this._selectedStyleData = new Collection();
            _this._handles = new Handles();
            //--------------------------------------------------------------------------
            //
            //  Properties
            //
            //--------------------------------------------------------------------------
            // activeLayerInfos
            _this.activeLayerInfos = null;
            // view
            _this.view = null;
            // filterMode
            _this.filterMode = null;
            // mutedShade
            _this.mutedShade = null;
            // mutedOpacity
            _this.mutedOpacity = null;
            // layerGraphics
            _this.layerGraphics = null;
            // layerListViewModel
            _this.layerListViewModel = null;
            // searchExpressions
            _this.searchExpressions = null;
            _this.searchViewModel = null;
            // viewModel
            _this.viewModel = new InteractiveStyleViewModel();
            // type
            _this.type = "classic";
            return _this;
        }
        InteractiveClassic.prototype.postInitialize = function () {
            var _this = this;
            this.own([
                watchUtils.on(this, "viewModel.featureLayerViews", "change", function () {
                    _this._selectedStyleData.removeAll();
                    _this.viewModel.featureLayerViews.forEach(function (featureLayerView) {
                        if (!featureLayerView) {
                            _this._selectedStyleData.add(null);
                        }
                        else {
                            var featureLayer = featureLayerView.layer;
                            var renderer = featureLayer.renderer;
                            var requiredFields = renderer ? renderer.requiredFields : null;
                            _this._selectedStyleData.add({
                                layerItemId: featureLayer.id,
                                requiredFields: requiredFields,
                                selectedInfoIndex: []
                            });
                        }
                    });
                })
            ]);
        };
        InteractiveClassic.prototype.render = function () {
            var _this = this;
            var state = this.viewModel.state;
            var activeLayerInfos = this.activeLayerInfos, baseClasses = this.classes(CSS.base, CSS.widget), filteredLayers = activeLayerInfos &&
                activeLayerInfos
                    .toArray()
                    .map(function (activeLayerInfo, activeLayerInfoIndex) {
                    return _this._renderLegendForLayer(activeLayerInfo, activeLayerInfoIndex);
                })
                    .filter(function (layer) { return !!layer; });
            var legendElements = [];
            this.activeLayerInfos.forEach(function (activeLayerInfo) {
                activeLayerInfo.legendElements.forEach(function (legendElement) {
                    legendElements.push(legendElement);
                });
            });
            return (widget_1.tsx("div", { class: this.classes(baseClasses, CSS.preventScroll) }, filteredLayers && filteredLayers.length ? (widget_1.tsx("div", { class: CSS.legendElements }, state === "loading" || state === "querying" ? (widget_1.tsx("div", { class: CSS.loader })) : (widget_1.tsx("div", null,
                " ",
                filteredLayers)))) : (widget_1.tsx("div", { class: CSS.message }, i18n.noLegend))));
        };
        InteractiveClassic.prototype.destroy = function () {
            this._handles.removeAll();
            this._handles.destroy();
            this._handles = null;
        };
        //--------------------------------------------------------------------------
        //
        //  Private methods
        //
        //--------------------------------------------------------------------------
        //--------------------------------------------------------------------------
        //
        //  Render methods
        //
        //--------------------------------------------------------------------------
        InteractiveClassic.prototype._renderLegendForLayer = function (activeLayerInfo, activeLayerInfoIndex) {
            var _this = this;
            var _a;
            var title = activeLayerInfo.title;
            var titleIsString = typeof title === "string"
                ? title.indexOf("Description") !== -1 ||
                    title.indexOf("Map Notes") !== -1
                : null;
            if (!activeLayerInfo.ready || titleIsString) {
                return null;
            }
            var hasChildren = !!activeLayerInfo.children.length;
            var key = "" + KEY + activeLayerInfo.layer.uid + "-version-" + activeLayerInfo.version;
            var labelNode = activeLayerInfo.title ? (widget_1.tsx("h3", { class: this.classes(CSS.header, CSS.label) }, activeLayerInfo.title)) : null;
            if (hasChildren) {
                var layers = activeLayerInfo.children
                    .map(function (childActiveLayerInfo) {
                    return _this._renderLegendForLayer(childActiveLayerInfo, activeLayerInfoIndex);
                })
                    .toArray();
                return (widget_1.tsx("div", { key: key, class: this.classes(CSS.service, CSS.groupLayer, CSS.screenshot) },
                    labelNode,
                    layers));
            }
            else {
                var legendElements_1 = activeLayerInfo.legendElements;
                if (legendElements_1 && !legendElements_1.length) {
                    return null;
                }
                var operationalItemIndex_1 = this._getOperationalItemIndex(activeLayerInfo);
                var filteredElements = legendElements_1
                    .map(function (legendElement, legendElementIndex) {
                    return _this._renderLegendForElement(legendElement, activeLayerInfo.layer, legendElementIndex, activeLayerInfo, activeLayerInfoIndex, operationalItemIndex_1, legendElement.infos, legendElements_1.length);
                })
                    .filter(function (element) { return !!element; });
                if (!filteredElements.length) {
                    return null;
                }
                var layerClasses = (_a = {},
                    _a[CSS.groupLayerChild] = !!activeLayerInfo.parent,
                    _a);
                return (widget_1.tsx("div", { key: key, class: this.classes(CSS.service, layerClasses) },
                    labelNode,
                    activeLayerInfo.layer.hasOwnProperty("sublayers") ? (widget_1.tsx("div", { class: CSS.error },
                        widget_1.tsx("span", { class: CSS.calciteStyles.error }),
                        i18nInteractiveLegend.sublayerFiltering)) : null,
                    widget_1.tsx("div", { class: CSS.layer }, filteredElements)));
            }
        };
        // _renderLegendForElement
        InteractiveClassic.prototype._renderLegendForElement = function (legendElement, layer, legendElementIndex, activeLayerInfo, activeLayerInfoIndex, operationalItemIndex, legendElementInfos, legendElementsLength, isChild) {
            var _this = this;
            var _a;
            var type = legendElement.type;
            var isColorRamp = type === "color-ramp", isOpacityRamp = type === "opacity-ramp", isSizeRamp = type === "size-ramp", isHeatRamp = type === "heatmap-ramp";
            var content = null;
            var legendTitle = legendElement.hasOwnProperty("title")
                ? legendElement.title
                : null;
            var field = null;
            var selectedStyleData = this._selectedStyleData.getItemAt(operationalItemIndex);
            if (selectedStyleData) {
                var requiredFields = selectedStyleData.requiredFields;
                if (legendElementsLength > 1) {
                    var fieldVal_1 = legendTitle && legendTitle.hasOwnProperty("field")
                        ? legendTitle.field
                        : null;
                    var requiredFields_1 = this._selectedStyleData.getItemAt(operationalItemIndex).requiredFields;
                    var requiredFieldsCollection_1 = new Collection();
                    requiredFields_1.forEach(function (requiredField) {
                        requiredFieldsCollection_1.add(requiredField);
                    });
                    if (requiredFields_1 && fieldVal_1) {
                        field = requiredFieldsCollection_1.find(function (requiredField) { return requiredField === fieldVal_1; });
                    }
                }
                else {
                    if (requiredFields && activeLayerInfo.layer.renderer.field) {
                        var requiredFields_2 = this._selectedStyleData.getItemAt(operationalItemIndex).requiredFields;
                        var activeLayerRequiredFields = activeLayerInfo.layer.renderer.requiredFields;
                        var requiredFieldsCollection_2 = new Collection();
                        var activeLayerFieldsCollection_1 = new Collection();
                        requiredFields_2.forEach(function (requiredField) {
                            requiredFieldsCollection_2.add(requiredField);
                        });
                        activeLayerRequiredFields.forEach(function (activeLayerField) {
                            activeLayerFieldsCollection_1.add(activeLayerField);
                        });
                        field = requiredFieldsCollection_2.find(function (requiredField) {
                            return requiredField ===
                                activeLayerFieldsCollection_1.find(function (requiredField2) { return requiredField === requiredField2; });
                        });
                    }
                }
            }
            // build symbol table or size ramp
            if (legendElement.type === "symbol-table" || isSizeRamp) {
                var rows = legendElement.infos
                    .map(function (info, legendInfoIndex) {
                    return _this._renderLegendForElementInfo(info, layer, isSizeRamp, legendElement.legendType, legendInfoIndex, field, legendElementIndex, legendTitle, legendElement, activeLayerInfo, activeLayerInfoIndex, operationalItemIndex, legendElementInfos);
                })
                    .filter(function (row) { return !!row; });
                if (rows.length) {
                    content = widget_1.tsx("div", { class: CSS.layerBody }, rows);
                }
            }
            else if (legendElement.type === "color-ramp" ||
                legendElement.type === "opacity-ramp" ||
                legendElement.type === "heatmap-ramp") {
                content = this._renderLegendForRamp(legendElement);
            }
            else if (legendElement.type === "relationship-ramp") {
                content = utils_1.renderRelationshipRamp(legendElement, this.id);
            }
            if (!content) {
                return null;
            }
            var titleObj = legendElement.title;
            var title = null;
            if (typeof titleObj === "string") {
                title = titleObj;
            }
            else if (titleObj) {
                var genTitle = styleUtils_1.getTitle(titleObj, isColorRamp || isOpacityRamp);
                if (styleUtils_1.isRendererTitle(titleObj, isColorRamp || isOpacityRamp) &&
                    titleObj.title) {
                    title = titleObj.title + " (" + genTitle + ")";
                }
                else {
                    title = genTitle;
                }
            }
            var tableClass = isChild ? CSS.layerChildTable : CSS.layerTable, caption = title ? widget_1.tsx("div", { class: CSS.layerCaption }, title) : null;
            var tableClasses = (_a = {},
                _a[CSS.layerTableSizeRamp] = isSizeRamp || !isChild,
                _a);
            var hasPictureMarkersAndIsMute = this._checkForPictureMarkersAndIsMute(activeLayerInfo);
            var hasPictureFillAndIsMute = this._checkForPictureFillAndIsMute(activeLayerInfo);
            var isRelationship = (legendElement.type === "symbol-table" &&
                legendElement.title == "Relationship") ||
                legendElement.type === "relationship-ramp";
            return (widget_1.tsx("div", { class: this.classes(tableClass, tableClasses) },
                !field &&
                    legendElementInfos &&
                    legendElementInfos.length > 1 &&
                    !isRelationship &&
                    !activeLayerInfo.layer.hasOwnProperty("sublayers") &&
                    !isColorRamp &&
                    !isOpacityRamp &&
                    !isHeatRamp ? (widget_1.tsx("div", { class: CSS.error },
                    widget_1.tsx("span", { class: CSS.calciteStyles.error }),
                    i18nInteractiveLegend.noFieldAttribute)) : null,
                legendElementInfos &&
                    legendElementInfos.every(function (elementInfo) { return !elementInfo.hasOwnProperty("value"); }) &&
                    legendElementInfos.length > 1 &&
                    !isRelationship &&
                    !activeLayerInfo.layer.hasOwnProperty("sublayers") ? (widget_1.tsx("div", { class: CSS.error },
                    widget_1.tsx("span", { class: CSS.calciteStyles.error }),
                    i18nInteractiveLegend.elementInfoNoValue)) : null,
                legendElement.title === "Predominant category" ? (widget_1.tsx("div", { class: CSS.error },
                    widget_1.tsx("span", { class: CSS.calciteStyles.error }),
                    i18nInteractiveLegend.predominantNotSupported)) : null,
                isSizeRamp && this.filterMode === "mute" ? (widget_1.tsx("div", { class: CSS.error },
                    widget_1.tsx("span", { class: CSS.calciteStyles.error }),
                    i18nInteractiveLegend.muteAndSizeRamp)) : null,
                hasPictureMarkersAndIsMute &&
                    legendElementInfos &&
                    legendElementInfos.length > 1 ? (widget_1.tsx("div", { class: CSS.error },
                    widget_1.tsx("span", { class: CSS.calciteStyles.error }),
                    i18nInteractiveLegend.muteAndPictureMarkerError)) : null,
                hasPictureFillAndIsMute &&
                    legendElementInfos &&
                    legendElementInfos.length > 1 ? (widget_1.tsx("div", { class: CSS.error },
                    widget_1.tsx("span", { class: CSS.calciteStyles.error }),
                    i18nInteractiveLegend.muteAndPictureFillError)) : null,
                caption,
                content));
        };
        // _renderLegendForRamp
        InteractiveClassic.prototype._renderLegendForRamp = function (legendElement) {
            var rampStops = legendElement.infos;
            var isOpacityRamp = legendElement.type === "opacity-ramp";
            var isHeatmapRamp = legendElement.type === "heatmap-ramp";
            var numGradients = rampStops.length - 1;
            var rampWidth = "100%";
            var rampHeight = 75;
            var rampDiv = document.createElement("div");
            var opacityRampClass = isOpacityRamp ? CSS.opacityRamp : "";
            rampDiv.className = CSS.colorRamp + " " + opacityRampClass;
            rampDiv.style.height = rampHeight + "px";
            var surface = gfx_1.createSurface(rampDiv, rampWidth, rampHeight);
            try {
                // TODO: When HeatmapRenderer is supported, stop offsets should not be adjusted.
                // equalIntervalStops will be true for sizeInfo, false for heatmap.
                // Heatmaps tend to have lots of colors, we don't want a giant color ramp.
                // Hence equalIntervalStops = false.
                if (!isHeatmapRamp) {
                    // Adjust the stop offsets so that we have stops at fixed/equal interval.
                    rampStops.forEach(function (stop, index) {
                        stop.offset = index / numGradients;
                    });
                }
                surface
                    .createRect({ x: 0, y: 0, width: rampWidth, height: rampHeight })
                    .setFill({
                    type: "linear",
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: rampHeight,
                    colors: rampStops
                })
                    .setStroke(null);
                if (legendElement.type === "color-ramp" ||
                    legendElement.type === "opacity-ramp") {
                    var overlayColor = legendElement.overlayColor;
                    if (overlayColor && overlayColor.a > 0) {
                        surface
                            .createRect({
                            x: 0,
                            y: 0,
                            width: rampWidth,
                            height: rampHeight
                        })
                            .setFill(overlayColor)
                            .setStroke(null);
                    }
                }
            }
            catch (e) {
                surface.clear();
                surface.destroy();
            }
            if (!surface) {
                return null;
            }
            var labelsContent = rampStops
                .filter(function (stop) { return !!stop.label; })
                .map(function (stop) { return (widget_1.tsx("div", { class: CSS.rampLabel }, isHeatmapRamp ? i18n[stop.label] : stop.label)); });
            var symbolContainerStyles = { width: GRADIENT_WIDTH + "px" }, rampLabelsContainerStyles = { height: rampHeight + "px" };
            return (widget_1.tsx("div", { class: this.classes(CSS.layerRow) },
                widget_1.tsx("div", { class: CSS.symbolContainer, styles: symbolContainerStyles },
                    widget_1.tsx("div", { class: CSS.rampContainer, bind: rampDiv, afterCreate: styleUtils_1.attachToNode })),
                widget_1.tsx("div", { class: CSS.layerInfo },
                    widget_1.tsx("div", { class: CSS.rampLabelsContainer, styles: rampLabelsContainerStyles }, labelsContent))));
        };
        // _renderLegendForElementInfo
        InteractiveClassic.prototype._renderLegendForElementInfo = function (elementInfo, layer, isSizeRamp, legendType, legendInfoIndex, field, legendElementIndex, legendTitle, legendElement, activeLayerInfo, activeLayerInfoIndex, operationalItemIndex, legendElementInfos) {
            var _this = this;
            var _a, _b;
            // nested
            if (elementInfo.type) {
                return this._renderLegendForElement(elementInfo, layer, legendElementIndex, activeLayerInfo, activeLayerInfoIndex, operationalItemIndex, legendElementInfos, null, true);
            }
            var content = null;
            var isStretched = styleUtils_1.isImageryStretchedLegend(layer, legendType);
            if (elementInfo.symbol && elementInfo.preview) {
                content = (widget_1.tsx("div", { class: CSS.symbol, bind: elementInfo.preview, afterCreate: styleUtils_1.attachToNode }));
            }
            else if (elementInfo.src) {
                content = this._renderImage(elementInfo, layer, isStretched);
            }
            if (!content) {
                return null;
            }
            var labelClasses = (_a = {},
                _a[CSS.imageryLayerInfoStretched] = isStretched,
                _a);
            var symbolClasses = (_b = {},
                _b[CSS.imageryLayerInfoStretched] = isStretched,
                _b[CSS.sizeRamp] = !isStretched && isSizeRamp,
                _b);
            var selectedRow = null;
            if (this._selectedStyleData.length > 0) {
                var featureLayerData_1 = this._selectedStyleData.find(function (data) {
                    return data ? activeLayerInfo.layer.id === data.layerItemId : null;
                });
                if (featureLayerData_1) {
                    var selectedInfoIndex = featureLayerData_1.selectedInfoIndex;
                    if (activeLayerInfo.legendElements.length > 1) {
                        selectedRow =
                            selectedInfoIndex.length > 0 &&
                                selectedInfoIndex[legendElementIndex] &&
                                selectedInfoIndex[legendElementIndex].indexOf(legendInfoIndex) !==
                                    -1
                                ? this.classes(CSS.layerRow, CSS.filterLayerRow, CSS.selectedRow, CSS.hoverStyles)
                                : this.classes(CSS.layerRow, CSS.filterLayerRow, CSS.hoverStyles);
                    }
                    else {
                        selectedRow =
                            selectedInfoIndex.indexOf(legendInfoIndex) !== -1
                                ? this.classes(CSS.layerRow, CSS.filterLayerRow, CSS.selectedRow, CSS.hoverStyles)
                                : this.classes(CSS.layerRow, CSS.filterLayerRow, CSS.hoverStyles);
                    }
                }
            }
            var hasPictureMarkersAndIsMute = this._checkForPictureMarkersAndIsMute(activeLayerInfo);
            var isRelationship = legendElement.type === "relationship-ramp";
            var isSizeRampAndMute = isSizeRamp && this.filterMode === "mute";
            var selectedStyleData = this._selectedStyleData.getItemAt(operationalItemIndex);
            var requiredFields = selectedStyleData
                ? selectedStyleData &&
                    selectedStyleData.requiredFields &&
                    this._selectedStyleData.getItemAt(operationalItemIndex).requiredFields
                        .length > 0
                    ? true
                    : false
                : null;
            var hasPictureFillAndIsMute = this._checkForPictureFillAndIsMute(activeLayerInfo);
            var applySelect = ((isRelationship ||
                hasPictureMarkersAndIsMute ||
                isSizeRampAndMute ||
                hasPictureFillAndIsMute ||
                legendTitle === "Predominant") &&
                legendElement.infos.length > 1 &&
                !activeLayerInfo.layer.hasOwnProperty("sublayers")) ||
                !requiredFields
                ? null
                : field && elementInfo.hasOwnProperty("value")
                    ? selectedRow
                    : null;
            var hasMoreThanOneInfo = legendElement.infos.length > 1;
            var featureLayerData = this._selectedStyleData.length > 0
                ? this._selectedStyleData.find(function (data) {
                    return data ? activeLayerInfo.layer.id === data.layerItemId : null;
                })
                : null;
            return (widget_1.tsx("div", { bind: this, class: hasMoreThanOneInfo && requiredFields && featureLayerData
                    ? applySelect
                    : null, tabIndex: hasMoreThanOneInfo && applySelect ? 0 : null, "data-legend-index": "" + legendElementIndex, "data-child-index": "" + legendInfoIndex, "data-layer-id": "" + activeLayerInfo.layer.id, onclick: function (event) {
                    if (!isRelationship &&
                        !hasPictureMarkersAndIsMute &&
                        !isSizeRampAndMute &&
                        !hasPictureFillAndIsMute &&
                        elementInfo.hasOwnProperty("value") &&
                        legendElement.title !== "Predominant category" &&
                        hasMoreThanOneInfo &&
                        !activeLayerInfo.layer.hasOwnProperty("sublayers") &&
                        requiredFields &&
                        field &&
                        featureLayerData) {
                        _this._handleFilterOption(event, elementInfo, field, legendInfoIndex, operationalItemIndex, isSizeRamp, legendElement, legendElementInfos);
                    }
                }, onkeydown: function (event) {
                    if (!isRelationship &&
                        !hasPictureMarkersAndIsMute &&
                        !isSizeRampAndMute &&
                        !hasPictureFillAndIsMute &&
                        elementInfo.hasOwnProperty("value") &&
                        legendElement.title !== "Predominant category" &&
                        hasMoreThanOneInfo &&
                        !activeLayerInfo.layer.hasOwnProperty("sublayers") &&
                        requiredFields &&
                        field &&
                        featureLayerData) {
                        _this._handleFilterOption(event, elementInfo, field, legendInfoIndex, operationalItemIndex, isSizeRamp, legendElement, legendElementInfos);
                    }
                } },
                widget_1.tsx("div", { class: this.classes(CSS.symbolContainer, symbolClasses) }, content),
                widget_1.tsx("div", { class: this.classes(CSS.layerInfo, labelClasses) }, styleUtils_1.getTitle(elementInfo.label, false) || "")));
        };
        // _renderImage
        InteractiveClassic.prototype._renderImage = function (elementInfo, layer, isStretched) {
            var _a;
            var label = elementInfo.label, src = elementInfo.src, opacity = elementInfo.opacity;
            var stretchedClasses = (_a = {},
                _a[CSS.imageryLayerStretchedImage] = isStretched,
                _a[CSS.symbol] = !isStretched,
                _a);
            var dynamicStyles = {
                opacity: "" + (opacity != null ? opacity : layer.opacity)
            };
            return (widget_1.tsx("img", { alt: label, src: src, border: 0, width: elementInfo.width, height: elementInfo.height, class: this.classes(stretchedClasses), styles: dynamicStyles }));
        };
        //-------------------------------------------------------------------
        //
        //  Filter methods
        //
        //-------------------------------------------------------------------
        InteractiveClassic.prototype._handleFilterOption = function (event, elementInfo, field, legendInfoIndex, operationalItemIndex, isSizeRamp, legendElement, legendElementInfos) {
            this.filterMode === "highlight"
                ? this._featureHighlight(event, elementInfo, field, legendInfoIndex, operationalItemIndex, isSizeRamp, legendElement, legendElementInfos)
                : this.filterMode === "featureFilter"
                    ? this._featureFilter(elementInfo, field, operationalItemIndex, legendInfoIndex, legendElement, legendElementInfos)
                    : this.filterMode === "mute"
                        ? this._featureMute(event, elementInfo, field, legendInfoIndex, operationalItemIndex, legendElement, legendElementInfos)
                        : null;
        };
        //_filterFeatures
        InteractiveClassic.prototype._featureFilter = function (elementInfo, field, operationalItemIndex, legendInfoIndex, legendElement, legendElementInfos) {
            this._handleSelectedStyles(event);
            this.viewModel.applyFeatureFilter(elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, legendElementInfos);
        };
        // _highlightFeatures
        InteractiveClassic.prototype._featureHighlight = function (event, elementInfo, field, legendInfoIndex, operationalItemIndex, isSizeRamp, legendElement, legendElementInfos) {
            var state = this.viewModel.state;
            if (state === "querying") {
                return;
            }
            this.viewModel.applyFeatureHighlight(elementInfo, field, legendInfoIndex, operationalItemIndex, isSizeRamp, legendElement, legendElementInfos);
            this._handleSelectedStyles(event, operationalItemIndex, legendInfoIndex);
        };
        // _muteFeatures
        InteractiveClassic.prototype._featureMute = function (event, elementInfo, field, legendInfoIndex, operationalItemIndex, legendElement, legendElementInfos) {
            this._handleSelectedStyles(event);
            this.viewModel.applyFeatureMute(elementInfo, field, legendInfoIndex, operationalItemIndex, legendElement, legendElementInfos);
        };
        // End of filter methods
        // _handleSelectedStyles
        InteractiveClassic.prototype._handleSelectedStyles = function (event, operationalItemIndex, legendInfoIndex) {
            var node = event.currentTarget;
            var legendElementInfoIndex = parseInt(node.getAttribute("data-child-index"));
            var legendElementIndex = parseInt(node.getAttribute("data-legend-index"));
            var activeLayerInfoId = node.getAttribute("data-layer-id");
            var featureLayerData = this._selectedStyleData.find(function (layerData) { return layerData.layerItemId === activeLayerInfoId; });
            var selectedInfoIndex = featureLayerData.selectedInfoIndex;
            var legendElementInfoIndexFromData = selectedInfoIndex.indexOf(legendElementInfoIndex);
            var activeLayerInfo = this.activeLayerInfos.find(function (activeLayerInfo) {
                return activeLayerInfo.layer.id === featureLayerData.layerItemId;
            });
            var legendElementChildArr = featureLayerData.selectedInfoIndex[legendElementIndex];
            if (this.filterMode === "highlight") {
                var highlightedFeatures = this.viewModel.interactiveStyleData
                    .highlightedFeatures[operationalItemIndex];
                if (!highlightedFeatures[legendInfoIndex] &&
                    !featureLayerData.selectedInfoIndex[legendElementIndex] &&
                    featureLayerData.selectedInfoIndex.indexOf(legendInfoIndex) === -1) {
                    return;
                }
            }
            if (activeLayerInfo.legendElements.length === 1) {
                legendElementInfoIndexFromData === -1
                    ? selectedInfoIndex.push(legendElementInfoIndex)
                    : selectedInfoIndex.splice(legendElementInfoIndexFromData, 1);
            }
            else if (activeLayerInfo.legendElements.length > 1) {
                if (Array.isArray(legendElementChildArr) &&
                    legendElementChildArr.length >= 1) {
                    legendElementChildArr.indexOf(legendElementInfoIndex) === -1
                        ? legendElementChildArr.push(legendElementInfoIndex)
                        : legendElementChildArr.splice(legendElementChildArr.indexOf(legendElementInfoIndex), 1);
                }
                else {
                    featureLayerData.selectedInfoIndex[legendElementIndex] = [
                        legendElementInfoIndex
                    ];
                }
            }
        };
        // _getOperationalItemIndex
        InteractiveClassic.prototype._getOperationalItemIndex = function (activeLayerInfo) {
            var itemIndex = null;
            this.layerListViewModel.operationalItems.forEach(function (operationalItem, operationalItemIndex) {
                if (operationalItem) {
                    var operationalItemLayer = operationalItem.layer;
                    if (operationalItemLayer.id === activeLayerInfo.layer.id) {
                        itemIndex = operationalItemIndex;
                    }
                }
            });
            return itemIndex;
        };
        // _checkForPictureMarkersAndIsMute
        InteractiveClassic.prototype._checkForPictureMarkersAndIsMute = function (activeLayerInfo) {
            var layer = activeLayerInfo.layer;
            var hasRenderer = layer.hasOwnProperty("renderer");
            if (!hasRenderer) {
                return false;
            }
            var renderer = layer.renderer;
            var hasSymbol = renderer.hasOwnProperty("symbol");
            var hasUniqueValueInfos = renderer.hasOwnProperty("uniqueValueInfos");
            var hasClassBreakInfos = renderer.hasOwnProperty("classBreakInfos");
            return (((hasRenderer &&
                hasSymbol &&
                renderer.symbol.type === "picture-marker") ||
                (hasRenderer &&
                    hasUniqueValueInfos &&
                    renderer.uniqueValueInfos.every(function (uvInfo) {
                        return uvInfo.symbol.type === "picture-marker";
                    })) ||
                (hasRenderer &&
                    hasClassBreakInfos &&
                    renderer.classBreakInfos.every(function (cbInfo) {
                        return cbInfo.symbol.type === "picture-marker";
                    }))) &&
                this.filterMode === "mute");
        };
        // _checkForPictureFillAndIsMute
        InteractiveClassic.prototype._checkForPictureFillAndIsMute = function (activeLayerInfo) {
            var layer = activeLayerInfo.layer;
            var hasRenderer = layer.hasOwnProperty("renderer");
            if (!hasRenderer) {
                return false;
            }
            var renderer = layer.renderer;
            var hasSymbol = renderer.hasOwnProperty("symbol");
            var hasUniqueValueInfos = renderer.hasOwnProperty("uniqueValueInfos");
            var hasClassBreakInfos = renderer.hasOwnProperty("classBreakInfos");
            return (((hasRenderer && hasSymbol && renderer.symbol.type === "picture-fill") ||
                (hasRenderer &&
                    hasUniqueValueInfos &&
                    renderer.uniqueValueInfos.every(function (uvInfo) {
                        return uvInfo.symbol.type === "picture-fill";
                    })) ||
                (hasRenderer &&
                    hasClassBreakInfos &&
                    renderer.classBreakInfos.every(function (cbInfo) {
                        return cbInfo.symbol.type === "picture-fill";
                    }))) &&
                this.filterMode === "mute");
        };
        __decorate([
            decorators_1.aliasOf("viewModel.activeLayerInfos"),
            decorators_1.property()
        ], InteractiveClassic.prototype, "activeLayerInfos", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.view"),
            decorators_1.property()
        ], InteractiveClassic.prototype, "view", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.filterMode"),
            decorators_1.property()
        ], InteractiveClassic.prototype, "filterMode", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.mutedShade"),
            decorators_1.property()
        ], InteractiveClassic.prototype, "mutedShade", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.mutedOpacity"),
            decorators_1.property()
        ], InteractiveClassic.prototype, "mutedOpacity", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.layerGraphics"),
            decorators_1.property()
        ], InteractiveClassic.prototype, "layerGraphics", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.layerListViewModel"),
            decorators_1.property()
        ], InteractiveClassic.prototype, "layerListViewModel", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.searchExpressions"),
            decorators_1.property()
        ], InteractiveClassic.prototype, "searchExpressions", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.searchViewModel"),
            decorators_1.property()
        ], InteractiveClassic.prototype, "searchViewModel", void 0);
        __decorate([
            widget_1.renderable(["viewModel.state"]),
            decorators_1.property({
                type: InteractiveStyleViewModel
            })
        ], InteractiveClassic.prototype, "viewModel", void 0);
        __decorate([
            decorators_1.property({ readOnly: true })
        ], InteractiveClassic.prototype, "type", void 0);
        __decorate([
            widget_1.accessibleHandler()
        ], InteractiveClassic.prototype, "_handleFilterOption", null);
        InteractiveClassic = __decorate([
            decorators_1.subclass("InteractiveClassic")
        ], InteractiveClassic);
        return InteractiveClassic;
    }(decorators_1.declared(Widget)));
    return InteractiveClassic;
});
//# sourceMappingURL=InteractiveClassic.js.map