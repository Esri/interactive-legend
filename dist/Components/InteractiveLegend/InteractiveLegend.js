define(["require", "exports", "tslib", "dojo/i18n!./InteractiveLegend/nls/Legend", "esri/widgets/Widget", "esri/core/accessorSupport/decorators", "esri/widgets/support/widget", "esri/core/Handles", "esri/core/watchUtils", "./InteractiveLegend/styles/InteractiveClassic", "esri/widgets/Legend/LegendViewModel"], function (require, exports, tslib_1, Legend_1, Widget, decorators_1, widget_1, Handles, watchUtils, InteractiveClassic, LegendViewModel) {
    "use strict";
    Legend_1 = tslib_1.__importDefault(Legend_1);
    // ----------------------------------
    //
    //  CSS classes
    //
    // ----------------------------------
    var CSS = {
        widgetIcon: "esri-icon-layer-list"
    };
    var InteractiveLegend = /** @class */ (function (_super) {
        tslib_1.__extends(InteractiveLegend, _super);
        // -------------------------------------------------------------------
        //
        //  Lifecycle methods
        //
        // -------------------------------------------------------------------
        function InteractiveLegend(params) {
            var _this = _super.call(this, params) || this;
            // --------------------------------------------------------------------------
            //
            //  Variables
            //
            // --------------------------------------------------------------------------
            // _handles
            _this._handles = new Handles();
            // --------------------------------------------------------------------------
            //
            //  Properties
            //
            // --------------------------------------------------------------------------
            // activeLayerInfos
            _this.activeLayerInfos = null;
            // view
            _this.view = null;
            // viewModel
            _this.viewModel = new LegendViewModel();
            // filterMode
            _this.filterMode = null;
            // basemapLegendVisible
            _this.basemapLegendVisible = false;
            // groundLegendVisible
            _this.groundLegendVisible = false;
            // iconClass
            _this.iconClass = CSS.widgetIcon;
            // label
            _this.label = Legend_1.default.widgetLabel;
            // layerInfos
            _this.layerInfos = null;
            // searchExpressions
            _this.searchExpressions = null;
            _this.searchViewModel = null;
            // layerListViewModel
            _this.layerListViewModel = null;
            // onboardingPanelEnabled
            _this.onboardingPanelEnabled = null;
            // offscreen
            _this.offscreen = null;
            _this.opacity = null;
            _this.grayScale = null;
            _this.featureCountEnabled = null;
            _this.updateExtentEnabled = null;
            // style
            _this.style = new InteractiveClassic({
                view: _this.view,
                activeLayerInfos: _this.activeLayerInfos,
                filterMode: _this.filterMode,
                layerListViewModel: _this.layerListViewModel,
                searchViewModel: _this.searchViewModel,
                onboardingPanelEnabled: _this.onboardingPanelEnabled,
                offscreen: _this.offscreen,
                opacity: _this.opacity,
                grayScale: _this.grayScale,
                featureCountEnabled: _this.featureCountEnabled,
                updateExtentEnabled: _this.updateExtentEnabled
            });
            return _this;
        }
        // castStyle
        InteractiveLegend.prototype.castStyle = function (value) {
            if (value instanceof InteractiveClassic) {
                return value;
            }
            if (typeof value === "string") {
                return new InteractiveClassic({
                    view: this.view,
                    activeLayerInfos: this.activeLayerInfos,
                    filterMode: this.filterMode,
                    layerListViewModel: this.layerListViewModel,
                    searchViewModel: this.searchViewModel,
                    onboardingPanelEnabled: this.onboardingPanelEnabled,
                    offscreen: this.offscreen,
                    opacity: this.opacity,
                    grayScale: this.grayScale,
                    featureCountEnabled: this.featureCountEnabled,
                    updateExtentEnabled: this.updateExtentEnabled
                });
            }
            if (value && typeof value.type === "string") {
                var options = tslib_1.__assign({}, value);
                delete options.type;
                var StyleClass = InteractiveClassic;
                return new StyleClass(options);
            }
            return new InteractiveClassic({
                view: this.view,
                activeLayerInfos: this.activeLayerInfos,
                filterMode: this.filterMode,
                layerListViewModel: this.layerListViewModel,
                searchViewModel: this.searchViewModel,
                onboardingPanelEnabled: this.onboardingPanelEnabled,
                offscreen: this.offscreen,
                opacity: this.opacity,
                grayScale: this.grayScale,
                featureCountEnabled: this.featureCountEnabled,
                updateExtentEnabled: this.updateExtentEnabled
            });
        };
        InteractiveLegend.prototype.postInitialize = function () {
            var _this = this;
            var _a = this, style = _a.style, activeLayerInfos = _a.activeLayerInfos, view = _a.view, layerListViewModel = _a.layerListViewModel;
            this.own([
                watchUtils.on(this, "activeLayerInfos", "change", function () {
                    style.activeLayerInfos = activeLayerInfos;
                    return _this._refreshActiveLayerInfos(activeLayerInfos);
                }),
                watchUtils.init(this, [
                    "view",
                    "filterMode",
                    "layerListViewModel",
                    "featureCountEnabled",
                    "updateExtentEnabled"
                ], function () {
                    style.view = view;
                    style.filterMode = _this.filterMode;
                    style.featureCountEnabled = _this.featureCountEnabled;
                    style.updateExtentEnabled = _this.updateExtentEnabled;
                    style.opacity = _this.opacity;
                    style.grayScale = _this.grayScale;
                    style.layerListViewModel = layerListViewModel;
                }),
                watchUtils.init(this, "style", function (value, oldValue) {
                    if (oldValue && value !== oldValue) {
                        oldValue.destroy();
                    }
                    if (value) {
                        value.activeLayerInfos = activeLayerInfos;
                        if (value.type === "card") {
                            value.view = view;
                        }
                    }
                })
            ]);
        };
        InteractiveLegend.prototype.destroy = function () {
            this._handles.destroy();
            this._handles = null;
        };
        InteractiveLegend.prototype.render = function () {
            return this.style.render();
        };
        // --------------------------------------------------------------------------
        //
        //  Private methods
        //
        // -------------------------------------------------------------------
        // _refreshActiveLayerInfos
        InteractiveLegend.prototype._refreshActiveLayerInfos = function (activeLayerInfos) {
            var _this = this;
            this._handles.removeAll();
            activeLayerInfos.forEach(function (activeLayerInfo) {
                return _this._renderOnActiveLayerInfoChange(activeLayerInfo);
            });
            this.scheduleRender();
        };
        // _renderOnActiveLayerInfoChange
        InteractiveLegend.prototype._renderOnActiveLayerInfoChange = function (activeLayerInfo) {
            var _this = this;
            var infoVersionHandle = watchUtils.init(activeLayerInfo, "version", function () {
                return _this.scheduleRender();
            });
            this._handles.add(infoVersionHandle, "version_" + activeLayerInfo.layer.uid);
            activeLayerInfo.children.forEach(function (childActiveLayerInfo) {
                return _this._renderOnActiveLayerInfoChange(childActiveLayerInfo);
            });
        };
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.activeLayerInfos"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "activeLayerInfos", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.view"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable(["view.size"])
        ], InteractiveLegend.prototype, "viewModel", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("style.filterMode")
        ], InteractiveLegend.prototype, "filterMode", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.basemapLegendVisible"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "basemapLegendVisible", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.groundLegendVisible"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "groundLegendVisible", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveLegend.prototype, "iconClass", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveLegend.prototype, "label", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.layerInfos"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "layerInfos", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("style.searchExpressions"),
            decorators_1.property()
        ], InteractiveLegend.prototype, "searchExpressions", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("style.searchViewModel"),
            decorators_1.property()
        ], InteractiveLegend.prototype, "searchViewModel", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveLegend.prototype, "layerListViewModel", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("style.onboardingPanelEnabled"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "onboardingPanelEnabled", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("style.offscreen"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "offscreen", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("style.opacity"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "opacity", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("style.grayScale"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "grayScale", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("style.featureCountEnabled"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "featureCountEnabled", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("style.updateExtentEnabled"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "updateExtentEnabled", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "style", void 0);
        tslib_1.__decorate([
            decorators_1.cast("style")
        ], InteractiveLegend.prototype, "castStyle", null);
        InteractiveLegend = tslib_1.__decorate([
            decorators_1.subclass("InteractiveLegend")
        ], InteractiveLegend);
        return InteractiveLegend;
    }(Widget));
    return InteractiveLegend;
});
//# sourceMappingURL=InteractiveLegend.js.map