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
        interactiveLegend: "esri-interactive-legend",
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
            error: "icon-ui-error",
            close: "icon-ui-close"
        },
        // interactive-legend
        loaderContainer: "esri-interactive-legend__loader-container",
        filterLayerRow: "esri-interactive-legend__filter-layer-row",
        selectedRow: "esri-interactive-legend--selected-row",
        loader: "esri-interactive-legend__loader",
        preventScroll: "esri-interactive-legend__prevent-scroll",
        hoverStyles: "esri-interactive-legend--layer-row",
        error: "esri-interactive-legend--error",
        legendElements: "esri-interactive-legend__legend-elements",
        interactiveLegendLayerCaption: "esri-interactive-legend__layer-caption",
        interactiveLegendLabel: "esri-interactive-legend__label",
        interactiveLegendLayer: "esri-interactive-legend__layer",
        interactiveLegendService: "esri-interactive-legend__service",
        interactiveLegendlayerBody: "esri-interactive-legend__layer-body",
        onboarding: {
            mainContainer: "esri-interactive-legend__onboarding-main-container",
            contentContainer: "esri-interactive-legend__onboarding-content-container",
            closeContainer: "esri-interactive-legend__onboarding-close-container",
            logoContainer: "esri-interactive-legend__onboarding-logo-container",
            titleContainer: "esri-interactive-legend__onboarding-title-container",
            infoContainer: "esri-interactive-legend__onboarding-info-container",
            imgPreviewContainer: "esri-interactive-legend__onboarding-img-preview-container",
            onboardingButtonContainer: "esri-interactive-legend__onboarding-button-container"
        }
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
            // layerGraphics
            _this.layerGraphics = null;
            // layerListViewModel
            _this.layerListViewModel = null;
            // searchExpressions
            _this.searchExpressions = null;
            // searchViewModel
            _this.searchViewModel = null;
            // selectedStyleData
            _this.selectedStyleData = new Collection();
            // viewModel
            _this.viewModel = new InteractiveStyleViewModel();
            _this.onboardingPanelEnabled = null;
            _this.offscreen = null;
            // type
            _this.type = "classic";
            return _this;
        }
        InteractiveClassic.prototype.postInitialize = function () {
            var _this = this;
            this.own([
                watchUtils.on(this, "viewModel.featureLayerViews", "change", function () {
                    _this.selectedStyleData.removeAll();
                    _this.viewModel.featureLayerViews.forEach(function (featureLayerView) {
                        if (!featureLayerView) {
                            _this.selectedStyleData.add(null);
                        }
                        else {
                            var featureLayer = featureLayerView.layer;
                            var renderer = featureLayer.renderer;
                            var field = renderer ? renderer.field : null;
                            _this.selectedStyleData.add({
                                layerItemId: featureLayer.id,
                                field: field,
                                selectedInfoIndex: [],
                                applyStyles: false
                            });
                        }
                    });
                })
            ]);
        };
        InteractiveClassic.prototype.render = function () {
            var _this = this;
            var state = this.viewModel.state;
            var activeLayerInfos = this.activeLayerInfos, baseClasses = this.classes(CSS.base, CSS.interactiveLegend, CSS.widget), filteredLayers = activeLayerInfos &&
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
            return (widget_1.tsx("div", { class: baseClasses }, this.onboardingPanelEnabled ? (this._renderOnboardingPanel()) : (widget_1.tsx("div", { class: this.classes(CSS.preventScroll) }, filteredLayers && filteredLayers.length ? (widget_1.tsx("div", { class: CSS.legendElements }, state === "loading" || state === "querying" ? (widget_1.tsx("div", { class: CSS.loader })) : (widget_1.tsx("div", null,
                " ",
                filteredLayers)))) : (widget_1.tsx("div", { class: CSS.message }, i18n.noLegend))))));
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
            var featureLayerData = this.selectedStyleData.length > 0
                ? this.selectedStyleData.find(function (data) {
                    return data ? activeLayerInfo.layer.id === data.layerItemId : null;
                })
                : null;
            var labelClasses = featureLayerData && featureLayerData.applyStyles
                ? this.classes(CSS.header, CSS.label, CSS.interactiveLegendLabel)
                : this.classes(CSS.header, CSS.label);
            var labelNode = activeLayerInfo.title ? (widget_1.tsx("h3", { class: labelClasses }, activeLayerInfo.title)) : null;
            if (hasChildren) {
                var layers = activeLayerInfo.children
                    .map(function (childActiveLayerInfo) {
                    return _this._renderLegendForLayer(childActiveLayerInfo, activeLayerInfoIndex);
                })
                    .toArray();
                var service = featureLayerData && featureLayerData.applyStyles
                    ? this.classes(CSS.service, CSS.interactiveLegendService, CSS.groupLayer)
                    : this.classes(CSS.service, CSS.groupLayer);
                return (widget_1.tsx("div", { key: key, class: service },
                    labelNode,
                    layers));
            }
            else {
                var legendElements = activeLayerInfo.legendElements;
                if (legendElements && !legendElements.length) {
                    return null;
                }
                var operationalItemIndex_1 = this._getOperationalItemIndex(activeLayerInfo);
                var filteredElements = legendElements
                    .map(function (legendElement, legendElementIndex) {
                    return _this._renderLegendForElement(legendElement, activeLayerInfo.layer, legendElementIndex, activeLayerInfo, activeLayerInfoIndex, operationalItemIndex_1, legendElement.infos);
                })
                    .filter(function (element) { return !!element; });
                if (!filteredElements.length) {
                    return null;
                }
                var layerClasses = (_a = {},
                    _a[CSS.groupLayerChild] = !!activeLayerInfo.parent,
                    _a);
                var service = featureLayerData && featureLayerData.applyStyles
                    ? this.classes(CSS.service, CSS.interactiveLegendService, layerClasses)
                    : this.classes(CSS.service, layerClasses);
                return (widget_1.tsx("div", { key: key, class: service },
                    labelNode,
                    widget_1.tsx("div", { class: CSS.layer }, filteredElements)));
            }
        };
        // _renderLegendForElement
        InteractiveClassic.prototype._renderLegendForElement = function (legendElement, layer, legendElementIndex, activeLayerInfo, activeLayerInfoIndex, operationalItemIndex, legendElementInfos, isChild) {
            var _this = this;
            var _a;
            var type = legendElement.type;
            var isColorRamp = type === "color-ramp", isOpacityRamp = type === "opacity-ramp", isSizeRamp = type === "size-ramp", isHeatRamp = type === "heatmap-ramp";
            var content = null;
            var legendTitle = legendElement.hasOwnProperty("title")
                ? legendElement.title
                : null;
            var field = this.selectedStyleData.getItemAt(operationalItemIndex)
                ? this.selectedStyleData.getItemAt(operationalItemIndex).field
                : null;
            // build symbol table or size ramp
            if (legendElement.type === "symbol-table" || isSizeRamp) {
                var rows = legendElement.infos
                    .map(function (info, legendInfoIndex) {
                    return _this._renderLegendForElementInfo(info, layer, isSizeRamp, legendElement.legendType, legendInfoIndex, field, legendElementIndex, legendElement, activeLayerInfo, activeLayerInfoIndex, operationalItemIndex, legendElementInfos);
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
            var featureLayerData = this.selectedStyleData.length > 0
                ? this.selectedStyleData.find(function (data) {
                    return data ? activeLayerInfo.layer.id === data.layerItemId : null;
                })
                : null;
            var layerCaption = featureLayerData && featureLayerData.applyStyles
                ? this.classes(CSS.layerCaption, CSS.interactiveLegendLayerCaption)
                : CSS.layerCaption;
            var layerTable = featureLayerData && featureLayerData.applyStyles
                ? this.classes(CSS.layerTable, "esri-interactive-legend__layer-table")
                : CSS.layerTable;
            var tableClass = isChild ? CSS.layerChildTable : layerTable, caption = title ? widget_1.tsx("div", { class: layerCaption }, title) : null;
            var tableClasses = (_a = {},
                _a[CSS.layerTableSizeRamp] = isSizeRamp || !isChild,
                _a);
            return (widget_1.tsx("div", { class: this.classes(tableClass, tableClasses) },
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
        InteractiveClassic.prototype._renderLegendForElementInfo = function (elementInfo, layer, isSizeRamp, legendType, legendInfoIndex, field, legendElementIndex, legendElement, activeLayerInfo, activeLayerInfoIndex, operationalItemIndex, legendElementInfos) {
            var _this = this;
            var _a, _b;
            // nested
            if (elementInfo.type) {
                return this._renderLegendForElement(elementInfo, layer, legendElementIndex, activeLayerInfo, activeLayerInfoIndex, operationalItemIndex, legendElementInfos, true);
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
            var visibleIcon = null;
            if (this.selectedStyleData.length > 0) {
                var featureLayerData_1 = this.selectedStyleData.find(function (data) {
                    return data ? activeLayerInfo.layer.id === data.layerItemId : null;
                });
                if (featureLayerData_1) {
                    var selectedInfoIndex = featureLayerData_1.selectedInfoIndex[legendElementIndex];
                    visibleIcon = selectedInfoIndex ? (selectedInfoIndex.indexOf(legendInfoIndex) === -1 &&
                        selectedInfoIndex.length > 0 ? (widget_1.tsx("span", { class: "esri-icon-non-visible" })) : (widget_1.tsx("span", { class: "esri-icon-visible" }))) : (widget_1.tsx("span", { class: "esri-icon-visible" }));
                    if (activeLayerInfo.legendElements.length > 1) {
                        selectedRow = selectedInfoIndex
                            ? featureLayerData_1.selectedInfoIndex &&
                                selectedInfoIndex.indexOf(legendInfoIndex) === -1 &&
                                selectedInfoIndex.length > 0
                                ? this.classes(CSS.layerRow, CSS.filterLayerRow, CSS.hoverStyles, CSS.selectedRow)
                                : this.classes(CSS.layerRow, CSS.filterLayerRow, CSS.hoverStyles)
                            : this.classes(CSS.layerRow, CSS.filterLayerRow, CSS.hoverStyles);
                    }
                    else {
                        selectedRow = selectedInfoIndex
                            ? featureLayerData_1.selectedInfoIndex &&
                                selectedInfoIndex.indexOf(legendInfoIndex) === -1 &&
                                selectedInfoIndex.length > 0
                                ? this.classes(CSS.layerRow, CSS.filterLayerRow, CSS.selectedRow, CSS.hoverStyles)
                                : this.classes(CSS.layerRow, CSS.filterLayerRow, CSS.hoverStyles)
                            : this.classes(CSS.layerRow, CSS.filterLayerRow, CSS.hoverStyles);
                    }
                }
            }
            var hasPictureMarkersAndIsMute = this._checkForPictureMarkersAndIsMute(activeLayerInfo);
            var isRelationship = legendElement.type === "relationship-ramp";
            var featureLayer = activeLayerInfo.layer;
            var isPredominance = featureLayer.renderer &&
                featureLayer.renderer.authoringInfo &&
                featureLayer.renderer.authoringInfo.type === "predominance";
            var isSizeRampAndMute = isSizeRamp && this.filterMode === "mute";
            var hasPictureFillAndIsMute = this._checkForPictureFillAndIsMute(activeLayerInfo);
            var hasMoreThanOneInfo = legendElement.infos.length > 1;
            var featureLayerData = this.selectedStyleData.length > 0
                ? this.selectedStyleData.find(function (data) {
                    return data ? activeLayerInfo.layer.id === data.layerItemId : null;
                })
                : null;
            var applySelect = (!isRelationship &&
                !hasPictureMarkersAndIsMute &&
                !isSizeRampAndMute &&
                !hasPictureFillAndIsMute &&
                elementInfo.hasOwnProperty("value") &&
                hasMoreThanOneInfo &&
                !activeLayerInfo.layer.hasOwnProperty("sublayers") &&
                activeLayerInfo.layer.type === "feature" &&
                field &&
                featureLayerData &&
                !isSizeRamp) ||
                isPredominance
                ? selectedRow
                : null;
            if (featureLayerData) {
                featureLayerData.applyStyles = applySelect ? true : false;
            }
            return (widget_1.tsx("div", { bind: this, class: (activeLayerInfo.layer.type === "feature" &&
                    (hasMoreThanOneInfo &&
                        field &&
                        featureLayerData &&
                        !isSizeRamp &&
                        elementInfo.hasOwnProperty("value"))) ||
                    isPredominance
                    ? applySelect
                    : null, tabIndex: (activeLayerInfo.layer.type === "feature" &&
                    !this.offscreen &&
                    (hasMoreThanOneInfo &&
                        field &&
                        featureLayerData &&
                        !isSizeRamp &&
                        elementInfo.hasOwnProperty("value"))) ||
                    isPredominance
                    ? 0
                    : null, "data-legend-index": "" + legendElementIndex, "data-child-index": "" + legendInfoIndex, "data-layer-id": "" + activeLayerInfo.layer.id, onclick: function (event) {
                    if ((!isRelationship &&
                        !hasPictureMarkersAndIsMute &&
                        !isSizeRampAndMute &&
                        !hasPictureFillAndIsMute &&
                        elementInfo.hasOwnProperty("value") &&
                        hasMoreThanOneInfo &&
                        !activeLayerInfo.layer.hasOwnProperty("sublayers") &&
                        activeLayerInfo.layer.type === "feature" &&
                        field &&
                        featureLayerData &&
                        !isSizeRamp) ||
                        isPredominance) {
                        _this._handleFilterOption(event, elementInfo, field, legendInfoIndex, operationalItemIndex, isSizeRamp, legendElement, isPredominance, legendElementInfos);
                    }
                }, onkeydown: function (event) {
                    if ((!isRelationship &&
                        !hasPictureMarkersAndIsMute &&
                        !isSizeRampAndMute &&
                        !hasPictureFillAndIsMute &&
                        elementInfo.hasOwnProperty("value") &&
                        hasMoreThanOneInfo &&
                        !activeLayerInfo.layer.hasOwnProperty("sublayers") &&
                        field &&
                        featureLayerData &&
                        !isSizeRamp) ||
                        isPredominance) {
                        _this._handleFilterOption(event, elementInfo, field, legendInfoIndex, operationalItemIndex, isSizeRamp, legendElement, isPredominance, legendElementInfos);
                    }
                } },
                widget_1.tsx("div", { class: applySelect
                        ? "esri-interactive-legend__legend-info-container"
                        : null },
                    widget_1.tsx("div", { class: this.classes(CSS.symbolContainer, symbolClasses) }, content),
                    widget_1.tsx("div", { class: this.classes(CSS.layerInfo, labelClasses) }, styleUtils_1.getTitle(elementInfo.label, false) || "")),
                applySelect ? widget_1.tsx("div", null, visibleIcon) : null));
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
        // _renderOnboardingPanel
        InteractiveClassic.prototype._renderOnboardingPanel = function () {
            return (widget_1.tsx("div", { class: this.classes(CSS.onboarding.mainContainer) },
                widget_1.tsx("div", { key: "onboarding-panel", class: CSS.onboarding.contentContainer },
                    widget_1.tsx("div", { class: CSS.onboarding.closeContainer },
                        widget_1.tsx("span", { bind: this, onclick: this._disableOnboarding, onkeydown: this._disableOnboarding, tabIndex: 0, class: CSS.calciteStyles.close, title: i18nInteractiveLegend.close })),
                    widget_1.tsx("div", { class: CSS.onboarding.logoContainer }),
                    widget_1.tsx("div", { class: CSS.onboarding.titleContainer },
                        widget_1.tsx("h3", null, i18nInteractiveLegend.newInteractiveLegend)),
                    widget_1.tsx("div", { class: CSS.onboarding.infoContainer },
                        widget_1.tsx("p", null, i18nInteractiveLegend.firstOnboardingWelcomeMessage),
                        widget_1.tsx("p", null, i18nInteractiveLegend.secondOnboardingWelcomeMessage)),
                    widget_1.tsx("div", { class: CSS.onboarding.imgPreviewContainer })),
                widget_1.tsx("div", { class: CSS.onboarding.onboardingButtonContainer },
                    widget_1.tsx("button", { bind: this, onclick: this._disableOnboarding, onkeydown: this._disableOnboarding, tabIndex: 0, class: this.classes(CSS.calciteStyles.btn), title: i18nInteractiveLegend.onboardingConfirmation }, i18nInteractiveLegend.onboardingConfirmation))));
        };
        //-------------------------------------------------------------------
        //
        //  Filter methods
        //
        //-------------------------------------------------------------------
        InteractiveClassic.prototype._handleFilterOption = function (event, elementInfo, field, legendInfoIndex, operationalItemIndex, isSizeRamp, legendElement, isPredominance, legendElementInfos) {
            this.filterMode === "featureFilter"
                ? this._featureFilter(elementInfo, field, operationalItemIndex, legendInfoIndex, isSizeRamp, legendElement, isPredominance, legendElementInfos)
                : this.filterMode === "highlight"
                    ? this._featureHighlight(event, elementInfo, field, legendInfoIndex, operationalItemIndex, isSizeRamp, legendElement, isPredominance, legendElementInfos)
                    : this.filterMode === "mute"
                        ? this._featureMute(event, elementInfo, field, legendInfoIndex, operationalItemIndex, legendElement, legendElementInfos)
                        : null;
        };
        //_filterFeatures
        InteractiveClassic.prototype._featureFilter = function (elementInfo, field, operationalItemIndex, legendInfoIndex, isSizeRamp, legendElement, isPredominance, legendElementInfos) {
            this._handleSelectedStyles(event);
            this.viewModel.applyFeatureFilter(elementInfo, field, operationalItemIndex, legendElement, legendInfoIndex, isPredominance, legendElementInfos);
        };
        // _highlightFeatures
        InteractiveClassic.prototype._featureHighlight = function (event, elementInfo, field, legendInfoIndex, operationalItemIndex, isSizeRamp, legendElement, isPredominance, legendElementInfos) {
            var state = this.viewModel.state;
            if (state === "querying") {
                return;
            }
            this.viewModel.applyFeatureHighlight(elementInfo, field, legendInfoIndex, operationalItemIndex, isSizeRamp, legendElement, isPredominance, legendElementInfos);
            this._handleSelectedStyles(event, operationalItemIndex, legendInfoIndex);
        };
        // _muteFeatures
        InteractiveClassic.prototype._featureMute = function (event, elementInfo, field, legendInfoIndex, operationalItemIndex, legendElement, legendElementInfos) {
            this._handleSelectedStyles(event);
            this.viewModel.applyFeatureMute(elementInfo, field, legendInfoIndex, operationalItemIndex, legendElement, legendElementInfos);
        };
        // End of filter methods
        // _disableOnboarding
        InteractiveClassic.prototype._disableOnboarding = function () {
            this.onboardingPanelEnabled = false;
            this.scheduleRender();
        };
        // _handleSelectedStyles
        InteractiveClassic.prototype._handleSelectedStyles = function (event, operationalItemIndex, legendInfoIndex) {
            var node = event.currentTarget;
            var legendElementInfoIndex = parseInt(node.getAttribute("data-child-index"));
            var legendElementIndex = parseInt(node.getAttribute("data-legend-index"));
            var activeLayerInfoId = node.getAttribute("data-layer-id");
            var featureLayerData = this.selectedStyleData.find(function (layerData) { return layerData.layerItemId === activeLayerInfoId; });
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
            return (((hasRenderer &&
                hasSymbol &&
                renderer.symbol.type === "picture-fill") ||
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
            decorators_1.property()
        ], InteractiveClassic.prototype, "selectedStyleData", void 0);
        __decorate([
            widget_1.renderable(["viewModel.state"]),
            decorators_1.property({
                type: InteractiveStyleViewModel
            })
        ], InteractiveClassic.prototype, "viewModel", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveClassic.prototype, "onboardingPanelEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveClassic.prototype, "offscreen", void 0);
        __decorate([
            decorators_1.property({ readOnly: true })
        ], InteractiveClassic.prototype, "type", void 0);
        __decorate([
            widget_1.accessibleHandler()
        ], InteractiveClassic.prototype, "_handleFilterOption", null);
        __decorate([
            widget_1.accessibleHandler()
        ], InteractiveClassic.prototype, "_disableOnboarding", null);
        InteractiveClassic = __decorate([
            decorators_1.subclass("InteractiveClassic")
        ], InteractiveClassic);
        return InteractiveClassic;
    }(decorators_1.declared(Widget)));
    return InteractiveClassic;
});
//# sourceMappingURL=InteractiveClassic.js.map