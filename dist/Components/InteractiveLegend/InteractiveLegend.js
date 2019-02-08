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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/assignHelper", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "dojo/i18n!./InteractiveLegend/nls/Legend", "esri/widgets/Widget", "esri/core/accessorSupport/decorators", "esri/widgets/support/widget", "esri/core/Handles", "esri/core/watchUtils", "./InteractiveLegend/styles/InteractiveClassic", "./InteractiveLegend/InteractiveLegendViewModel"], function (require, exports, __assign, __extends, __decorate, i18n, Widget, decorators_1, widget_1, Handles, watchUtils, InteractiveClassic, InteractiveLegendViewModel) {
    "use strict";
    //----------------------------------
    //
    //  CSS classes
    //
    //----------------------------------
    var CSS = {
        widgetIcon: "esri-icon-layer-list"
    };
    var InteractiveLegend = /** @class */ (function (_super) {
        __extends(InteractiveLegend, _super);
        //-------------------------------------------------------------------
        //
        //  Lifecycle methods
        //
        //-------------------------------------------------------------------
        function InteractiveLegend(params) {
            var _this = _super.call(this) || this;
            //--------------------------------------------------------------------------
            //
            //  Variables
            //
            //--------------------------------------------------------------------------
            // _handles
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
            // viewModel
            _this.viewModel = new InteractiveLegendViewModel();
            // filterMode
            _this.filterMode = null;
            // basemapLegendVisible
            _this.basemapLegendVisible = false;
            // groundLegendVisible
            _this.groundLegendVisible = false;
            // iconClass
            _this.iconClass = CSS.widgetIcon;
            // label
            _this.label = i18n.widgetLabel;
            // layerInfos
            _this.layerInfos = null;
            // mutedShade
            _this.mutedShade = null;
            // searchExpressions
            _this.searchExpressions = null;
            _this.searchViewModel = null;
            // layerListViewModel
            _this.layerListViewModel = null;
            // mutedShade
            _this.onboardingPanelEnabled = null;
            _this.offscreen = null;
            // style
            _this.style = new InteractiveClassic({
                view: _this.view,
                activeLayerInfos: _this.activeLayerInfos,
                filterMode: _this.filterMode,
                mutedShade: _this.mutedShade,
                layerListViewModel: _this.layerListViewModel,
                searchViewModel: _this.searchViewModel,
                onboardingPanelEnabled: _this.onboardingPanelEnabled,
                offscreen: _this.offscreen
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
                    mutedShade: this.mutedShade,
                    layerListViewModel: this.layerListViewModel,
                    searchViewModel: this.searchViewModel,
                    onboardingPanelEnabled: this.onboardingPanelEnabled,
                    offscreen: this.offscreen
                });
            }
            if (value && typeof value.type === "string") {
                var options = __assign({}, value);
                delete options.type;
                var StyleClass = InteractiveClassic;
                return new StyleClass(options);
            }
            return new InteractiveClassic({
                view: this.view,
                activeLayerInfos: this.activeLayerInfos,
                filterMode: this.filterMode,
                mutedShade: this.mutedShade,
                layerListViewModel: this.layerListViewModel,
                searchViewModel: this.searchViewModel,
                onboardingPanelEnabled: this.onboardingPanelEnabled,
                offscreen: this.offscreen
            });
        };
        InteractiveLegend.prototype.postInitialize = function () {
            var _this = this;
            var _a = this, style = _a.style, activeLayerInfos = _a.activeLayerInfos, filterMode = _a.filterMode, view = _a.view, layerListViewModel = _a.layerListViewModel;
            this.own([
                watchUtils.on(this, "activeLayerInfos", "change", function () {
                    style.activeLayerInfos = activeLayerInfos;
                    return _this._refreshActiveLayerInfos(activeLayerInfos);
                }),
                watchUtils.init(this, ["view", "filterMode", "layerListViewModel"], function () {
                    style.view = view;
                    style.filterMode = filterMode;
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
        //--------------------------------------------------------------------------
        //
        //  Private methods
        //
        //-------------------------------------------------------------------
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
        __decorate([
            decorators_1.aliasOf("viewModel.activeLayerInfos"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "activeLayerInfos", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.view"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "view", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable(["view.size"])
        ], InteractiveLegend.prototype, "viewModel", void 0);
        __decorate([
            decorators_1.aliasOf("style.filterMode"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "filterMode", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.basemapLegendVisible"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "basemapLegendVisible", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.groundLegendVisible"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "groundLegendVisible", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveLegend.prototype, "iconClass", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveLegend.prototype, "label", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.layerInfos"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "layerInfos", void 0);
        __decorate([
            decorators_1.aliasOf("style.mutedShade"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "mutedShade", void 0);
        __decorate([
            decorators_1.aliasOf("style.searchExpressions"),
            decorators_1.property()
        ], InteractiveLegend.prototype, "searchExpressions", void 0);
        __decorate([
            decorators_1.aliasOf("style.searchViewModel"),
            decorators_1.property()
        ], InteractiveLegend.prototype, "searchViewModel", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveLegend.prototype, "layerListViewModel", void 0);
        __decorate([
            decorators_1.aliasOf("style.onboardingPanelEnabled"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "onboardingPanelEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("style.offscreen"),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "offscreen", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], InteractiveLegend.prototype, "style", void 0);
        __decorate([
            decorators_1.cast("style")
        ], InteractiveLegend.prototype, "castStyle", null);
        InteractiveLegend = __decorate([
            decorators_1.subclass("InteractiveLegend")
        ], InteractiveLegend);
        return InteractiveLegend;
    }(decorators_1.declared(Widget)));
    return InteractiveLegend;
});
//# sourceMappingURL=InteractiveLegend.js.map