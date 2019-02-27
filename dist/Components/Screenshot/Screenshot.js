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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "dojo/i18n!./Screenshot/nls/resources", "esri/widgets/Widget", "esri/core/accessorSupport/decorators", "esri/widgets/Expand", "./Screenshot/ScreenshotView", "esri/core/watchUtils", "esri/core/Handles"], function (require, exports, __extends, __decorate, i18n, Widget, decorators_1, Expand, ScreenshotView, watchUtils, Handles) {
    "use strict";
    var CSS = {
        screenshotCursor: "esri-screenshot__cursor",
        mediaIcon: "icon-ui-media"
    };
    var Screenshot = /** @class */ (function (_super) {
        __extends(Screenshot, _super);
        function Screenshot(value) {
            var _this = _super.call(this) || this;
            // _handles
            _this._handles = new Handles();
            // view
            _this.view = null;
            // legendIncludedInScreenshot
            _this.legendIncludedInScreenshot = null;
            // popupIncludedInScreenshot
            _this.popupIncludedInScreenshot = null;
            // selectedStyleData
            _this.selectedStyleData = null;
            // expandWidgetEnabled
            _this.expandWidgetEnabled = null;
            // expandWidget
            _this.expandWidget = null;
            // iconClass
            _this.iconClass = CSS.mediaIcon;
            // label
            _this.label = i18n.widgetLabel;
            // screenshotView
            _this.screenshotView = new ScreenshotView();
            return _this;
        }
        Screenshot.prototype.postInitialize = function () {
            this.own([this._watchScreenshotViewProperties()]);
            if (this.expandWidgetEnabled) {
                this._watchScreenshotView();
            }
        };
        Screenshot.prototype.render = function () {
            return this.screenshotView
                ? this.expandWidgetEnabled
                    ? this.expandWidget.render()
                    : this.screenshotView.render()
                : this.screenshotView.render();
        };
        // _watchScreenshotViewProperties
        Screenshot.prototype._watchScreenshotViewProperties = function () {
            var _this = this;
            return watchUtils.init(this, [
                "view",
                "legendIncludedInScreenshot",
                "popupIncludedInScreenshot",
                "selectedStyleData",
                "expandWidgetEnabled"
            ], function () {
                var screenshotView = _this.screenshotView;
                screenshotView.view = _this.view;
                screenshotView.legendIncludedInScreenshot = _this.legendIncludedInScreenshot;
                screenshotView.popupIncludedInScreenshot = _this.popupIncludedInScreenshot;
                screenshotView.selectedStyleData = _this.selectedStyleData;
                screenshotView.expandWidgetEnabled = _this.expandWidgetEnabled;
            });
        };
        // _watchScreenshotView
        Screenshot.prototype._watchScreenshotView = function () {
            var _this = this;
            this.own([
                watchUtils.when(this, "screenshotView", function () {
                    _this.expandWidget = new Expand({
                        view: _this.view,
                        content: _this.screenshotView,
                        expandIconClass: CSS.mediaIcon
                    });
                    _this._handleExpandWidget();
                })
            ]);
        };
        // _handleExpandWidget
        Screenshot.prototype._handleExpandWidget = function () {
            var _this = this;
            var expandWidgetKey = "expand-widget";
            this._handles.remove(expandWidgetKey);
            this._handles.add(watchUtils.when(this, "expandWidget", function () {
                if (_this.expandWidget) {
                    var screenshotModeIsActiveKey = "screenshot-active";
                    _this._handles.remove(screenshotModeIsActiveKey);
                    _this._handles.add(watchUtils.whenTrue(_this, "screenshotView.viewModel.screenshotModeIsActive", function () {
                        var expandedKey = "expanded";
                        _this._handles.remove(expandedKey);
                        _this._handles.add(watchUtils.whenFalse(_this, "expandWidget.expanded", function () {
                            _this.screenshotView.viewModel.screenshotModeIsActive = false;
                            _this.view.container.classList.remove(CSS.screenshotCursor);
                            if (_this.screenshotView.featureWidget &&
                                _this.screenshotView.featureWidget.graphic) {
                                _this.screenshotView.featureWidget.graphic = null;
                            }
                            if (_this.screenshotView.viewModel.dragHandler) {
                                _this.screenshotView.viewModel.dragHandler.remove();
                                _this.screenshotView.viewModel.dragHandler = null;
                            }
                            if (_this.expandWidget) {
                                _this.expandWidget.expanded = false;
                            }
                            _this.scheduleRender();
                        }), expandedKey);
                    }), screenshotModeIsActiveKey);
                }
            }), expandWidgetKey);
        };
        __decorate([
            decorators_1.aliasOf("screenshotView.view"),
            decorators_1.property()
        ], Screenshot.prototype, "view", void 0);
        __decorate([
            decorators_1.aliasOf("screenshotView.legendIncludedInScreenshot"),
            decorators_1.property()
        ], Screenshot.prototype, "legendIncludedInScreenshot", void 0);
        __decorate([
            decorators_1.aliasOf("screenshotView.popupIncludedInScreenshot"),
            decorators_1.property()
        ], Screenshot.prototype, "popupIncludedInScreenshot", void 0);
        __decorate([
            decorators_1.aliasOf("screenshotView.selectedStyleData"),
            decorators_1.property()
        ], Screenshot.prototype, "selectedStyleData", void 0);
        __decorate([
            decorators_1.aliasOf("screenshotView.expandWidgetEnabled"),
            decorators_1.property()
        ], Screenshot.prototype, "expandWidgetEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("screenshotView.expandWidget"),
            decorators_1.property()
        ], Screenshot.prototype, "expandWidget", void 0);
        __decorate([
            decorators_1.property()
        ], Screenshot.prototype, "iconClass", void 0);
        __decorate([
            decorators_1.property()
        ], Screenshot.prototype, "label", void 0);
        __decorate([
            decorators_1.property()
        ], Screenshot.prototype, "screenshotView", void 0);
        Screenshot = __decorate([
            decorators_1.subclass("Screenshot")
        ], Screenshot);
        return Screenshot;
    }(decorators_1.declared(Widget)));
    return Screenshot;
});
//# sourceMappingURL=Screenshot.js.map