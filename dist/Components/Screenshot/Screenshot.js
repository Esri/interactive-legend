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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "dojo/i18n!./Screenshot/nls/resources", "esri/widgets/Widget", "esri/core/accessorSupport/decorators", "esri/widgets/Expand", "./Screenshot/ScreenshotPanel", "esri/core/watchUtils", "esri/core/Handles"], function (require, exports, __extends, __decorate, i18n, Widget, decorators_1, Expand, ScreenshotPanel, watchUtils, Handles) {
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
            // legendScreenshotEnabled
            _this.legendScreenshotEnabled = null;
            // popupScreenshotEnabled
            _this.popupScreenshotEnabled = null;
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
            // screenshotPanel
            _this.screenshotPanel = new ScreenshotPanel();
            return _this;
        }
        Screenshot.prototype.postInitialize = function () {
            this.own([this._watchScreenshotViewProperties()]);
            if (this.expandWidgetEnabled) {
                this._watchScreenshotView();
            }
        };
        Screenshot.prototype.render = function () {
            return this.screenshotPanel
                ? this.expandWidgetEnabled
                    ? this.expandWidget.render()
                    : this.screenshotPanel.render()
                : this.screenshotPanel.render();
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
                var screenshotPanel = _this.screenshotPanel;
                screenshotPanel.view = _this.view;
                screenshotPanel.legendIncludedInScreenshot = _this.legendIncludedInScreenshot;
                screenshotPanel.popupIncludedInScreenshot = _this.popupIncludedInScreenshot;
                screenshotPanel.selectedStyleData = _this.selectedStyleData;
                screenshotPanel.expandWidgetEnabled = _this.expandWidgetEnabled;
                screenshotPanel.legendScreenshotEnabled = _this.legendScreenshotEnabled;
                screenshotPanel.popupScreenshotEnabled = _this.popupScreenshotEnabled;
            });
        };
        // _watchScreenshotView
        Screenshot.prototype._watchScreenshotView = function () {
            var _this = this;
            this.own([
                watchUtils.when(this, "screenshotPanel", function () {
                    _this.expandWidget = new Expand({
                        view: _this.view,
                        content: _this.screenshotPanel,
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
                    _this._handles.add(watchUtils.whenTrue(_this, "screenshotPanel.viewModel.screenshotModeIsActive", function () {
                        var expandedKey = "expanded";
                        _this._handles.remove(expandedKey);
                        _this._handles.add(watchUtils.whenFalse(_this, "expandWidget.expanded", function () {
                            _this.screenshotPanel.viewModel.screenshotModeIsActive = false;
                            _this.view.container.classList.remove(CSS.screenshotCursor);
                            if (_this.screenshotPanel.featureWidget &&
                                _this.screenshotPanel.featureWidget.graphic) {
                                _this.screenshotPanel.featureWidget.graphic = null;
                            }
                            if (_this.screenshotPanel.viewModel.dragHandler) {
                                _this.screenshotPanel.viewModel.dragHandler.remove();
                                _this.screenshotPanel.viewModel.dragHandler = null;
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
            decorators_1.aliasOf("screenshotPanel.view"),
            decorators_1.property()
        ], Screenshot.prototype, "view", void 0);
        __decorate([
            decorators_1.aliasOf("screenshotPanel.legendIncludedInScreenshot"),
            decorators_1.property()
        ], Screenshot.prototype, "legendIncludedInScreenshot", void 0);
        __decorate([
            decorators_1.aliasOf("screenshotPanel.popupIncludedInScreenshot"),
            decorators_1.property()
        ], Screenshot.prototype, "popupIncludedInScreenshot", void 0);
        __decorate([
            decorators_1.aliasOf("screenshotPanel.legendScreenshotEnabled"),
            decorators_1.property()
        ], Screenshot.prototype, "legendScreenshotEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("screenshotPanel.popupScreenshotEnabled"),
            decorators_1.property()
        ], Screenshot.prototype, "popupScreenshotEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("screenshotPanel.selectedStyleData"),
            decorators_1.property()
        ], Screenshot.prototype, "selectedStyleData", void 0);
        __decorate([
            decorators_1.aliasOf("screenshotPanel.expandWidgetEnabled"),
            decorators_1.property()
        ], Screenshot.prototype, "expandWidgetEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("screenshotPanel.expandWidget"),
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
        ], Screenshot.prototype, "screenshotPanel", void 0);
        Screenshot = __decorate([
            decorators_1.subclass("Screenshot")
        ], Screenshot);
        return Screenshot;
    }(decorators_1.declared(Widget)));
    return Screenshot;
});
//# sourceMappingURL=Screenshot.js.map