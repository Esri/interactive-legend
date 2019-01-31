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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "dojo/i18n!./Screenshot/nls/resources", "esri/widgets/Widget", "esri/core/accessorSupport/decorators", "esri/core/watchUtils", "esri/widgets/support/widget", "./Screenshot/ScreenshotViewModel"], function (require, exports, __extends, __decorate, i18n, Widget, decorators_1, watchUtils, widget_1, ScreenshotViewModel) {
    "use strict";
    //----------------------------------
    //
    //  CSS Classes
    //
    //----------------------------------
    var CSS = {
        base: "esri-screenshot",
        screenshotBtn: "esri-screenshot__btn",
        hide: "esri-screenshot--hide",
        screenshotCursor: "esri-screenshot__cursor",
        maskDiv: "esri-screenshot__mask-div",
        actionBtn: "esri-screenshot__action-btn",
        screenshotImg: "esri-screenshot__js-screenshot-image",
        screenshotDiv: "esri-screenshot__screenshot-div",
        screenshotImgContainer: "esri-screenshot__screenshot-img-container",
        downloadBtn: "esri-screenshot__download-btn",
        backBtn: "esri-screenshot__back-btn",
        showOverlay: "esri-screenshot--show-overlay",
        hideOverlay: "esri-screenshot--hide-overlay",
        mediaIcon: "icon-ui-media",
        pointerCursor: "esri-screenshot--pointer",
        disabledCursor: "esri-screenshot--disabled",
        tooltip: "tooltip",
        tooltipRight: "tooltip-right",
        modifierClass: "modifier-class",
        closeIcon: "icon-ui-close"
    };
    var Screenshot = /** @class */ (function (_super) {
        __extends(Screenshot, _super);
        //----------------------------------
        //
        //  Lifecycle Methods
        //
        //----------------------------------
        function Screenshot(value) {
            var _this = _super.call(this) || this;
            //----------------------------------
            //
            //  Variables
            //
            //----------------------------------
            // Stored Nodes
            _this._maskNode = null;
            _this._screenshotImgNode = null;
            // _dragHandler
            _this._dragHandler = null;
            // _popupIsIncluded
            _this._popupIsIncluded = null;
            //----------------------------------
            //
            //  Properties
            //
            //----------------------------------
            // view
            _this.view = null;
            // viewModel
            _this.viewModel = new ScreenshotViewModel();
            // mapComponentSelectors
            _this.mapComponentSelectors = [];
            // iconClass
            _this.iconClass = CSS.mediaIcon;
            // label
            _this.label = i18n.widgetLabel;
            return _this;
        }
        Screenshot.prototype.postInitialize = function () {
            this.own([this._watchMapComponentSelectors(), this._watchPopups()]);
        };
        Screenshot.prototype.render = function () {
            var screenshotModeIsActive = this.viewModel.screenshotModeIsActive;
            var screenshotBtn = this._renderScreenshotBtn(screenshotModeIsActive);
            var screenshotPreviewOverlay = this._renderScreenshotPreviewOverlay();
            var maskNode = this._renderMaskNode(screenshotModeIsActive);
            return (widget_1.tsx("div", { class: CSS.base },
                screenshotModeIsActive ? (widget_1.tsx("button", { bind: this, tabIndex: 0, class: this.classes(CSS.screenshotBtn, CSS.pointerCursor), onclick: this._deactivateScreenshot, onkeydown: this._deactivateScreenshot, title: i18n.deactivateScreenshot },
                    widget_1.tsx("span", { class: CSS.closeIcon }))) : (screenshotBtn),
                screenshotPreviewOverlay,
                maskNode));
        };
        Screenshot.prototype.destroy = function () {
            this._maskNode = null;
            this._screenshotImgNode = null;
        };
        //----------------------------------
        //
        //  Public Methods
        //
        //----------------------------------
        // activateScreenshot
        Screenshot.prototype.activateScreenshot = function () {
            var _this = this;
            if (this.viewModel.screenshotModeIsActive) {
                return;
            }
            this.mapComponentSelectors.forEach(function (mapComponents) {
                if (mapComponents.indexOf("popup") !== -1) {
                    _this.view.popup.dockEnabled = true;
                }
            });
            this.viewModel.screenshotModeIsActive = true;
            this.view.container.classList.add(CSS.screenshotCursor);
            this._dragHandler = this.view.on("drag", function (event) {
                _this.viewModel.setScreenshotArea(event, _this._maskNode, _this._screenshotImgNode, _this._dragHandler);
            });
        };
        //----------------------------------
        //
        //  Private Methods
        //
        //----------------------------------
        //----------------------------------
        //
        //  Render Node Methods
        //
        //----------------------------------
        // _renderScreenshotBtn
        Screenshot.prototype._renderScreenshotBtn = function (screenshotModeIsActive) {
            var _a;
            var cursorStyles = (_a = {},
                _a[CSS.disabledCursor] = screenshotModeIsActive,
                _a[CSS.pointerCursor] = !screenshotModeIsActive,
                _a);
            return (widget_1.tsx("button", { bind: this, tabIndex: !screenshotModeIsActive ? 0 : -1, class: this.classes(CSS.screenshotBtn, cursorStyles), onclick: this.activateScreenshot, title: i18n.widgetLabel },
                widget_1.tsx("span", { class: CSS.mediaIcon })));
        };
        // _renderScreenshotPreviewBtns
        Screenshot.prototype._renderScreenshotPreviewBtns = function () {
            return (widget_1.tsx("div", null,
                widget_1.tsx("button", { bind: this, tabIndex: 0, class: this.classes(CSS.actionBtn), onclick: this.downloadImage, onkeydown: this.downloadImage, afterCreate: widget_1.storeNode, "data-node-ref": "_downloadBtnNode", "aria-label": i18n.downloadImage, title: i18n.downloadImage }, i18n.downloadImage),
                widget_1.tsx("button", { bind: this, tabIndex: 0, class: this.classes(CSS.actionBtn, CSS.backBtn), onclick: this._closePreview, onkeydown: this._closePreview }, i18n.backButton)));
        };
        // _renderScreenshotPreviewOverlay
        Screenshot.prototype._renderScreenshotPreviewOverlay = function () {
            var _a;
            var previewIsVisible = this.viewModel.previewIsVisible;
            var overlayIsVisible = (_a = {},
                _a[CSS.showOverlay] = previewIsVisible,
                _a[CSS.hideOverlay] = !previewIsVisible,
                _a);
            var screenshotPreviewBtns = this._renderScreenshotPreviewBtns();
            return (widget_1.tsx("div", { class: this.classes(CSS.screenshotDiv, overlayIsVisible) },
                widget_1.tsx("div", { class: CSS.screenshotImgContainer },
                    widget_1.tsx("div", null,
                        widget_1.tsx("img", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_screenshotImgNode", class: CSS.screenshotImg }),
                        screenshotPreviewBtns))));
        };
        // _renderMaskNode
        Screenshot.prototype._renderMaskNode = function (screenshotModeIsActive) {
            var _a;
            var maskDivIsHidden = (_a = {},
                _a[CSS.hide] = !screenshotModeIsActive,
                _a);
            return (widget_1.tsx("div", { bind: this, class: this.classes(CSS.maskDiv, maskDivIsHidden), afterCreate: widget_1.storeNode, "data-node-ref": "_maskNode" }));
        };
        // End of render node methods
        // _closePreview
        Screenshot.prototype._closePreview = function () {
            var viewModel = this.viewModel;
            viewModel.previewIsVisible = false;
            viewModel.screenshotModeIsActive = false;
            this.scheduleRender();
        };
        // _watchMapComponentSelectors
        Screenshot.prototype._watchMapComponentSelectors = function () {
            var _this = this;
            return watchUtils.init(this, "mapComponentSelectors", function () {
                if (_this.mapComponentSelectors === null) {
                    _this.mapComponentSelectors = [];
                }
                if (_this.mapComponentSelectors.length === 0) {
                    return;
                }
                _this.mapComponentSelectors.forEach(function (componentSelector) {
                    if (componentSelector.indexOf("popup") !== -1) {
                        _this._popupIsIncluded = true;
                        _this.scheduleRender();
                    }
                });
            });
        };
        // _watchPopups
        Screenshot.prototype._watchPopups = function () {
            var _this = this;
            return watchUtils.init(this, "view.popup.visible", function () {
                if (_this._popupIsIncluded &&
                    !_this.view.popup.visible &&
                    _this._dragHandler) {
                    _this.viewModel.screenshotModeIsActive = false;
                    _this.view.container.classList.remove(CSS.screenshotCursor);
                    _this.scheduleRender();
                }
            });
        };
        // _deactivateScreenshot
        Screenshot.prototype._deactivateScreenshot = function () {
            this.viewModel.screenshotModeIsActive = false;
            this.view.container.classList.remove(CSS.screenshotCursor);
            this._dragHandler.remove();
            this.scheduleRender();
        };
        __decorate([
            decorators_1.aliasOf("viewModel.view"),
            decorators_1.property()
        ], Screenshot.prototype, "view", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable(["viewModel.state"])
        ], Screenshot.prototype, "viewModel", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.mapComponentSelectors"),
            decorators_1.property()
        ], Screenshot.prototype, "mapComponentSelectors", void 0);
        __decorate([
            decorators_1.property()
        ], Screenshot.prototype, "iconClass", void 0);
        __decorate([
            decorators_1.property()
        ], Screenshot.prototype, "label", void 0);
        __decorate([
            widget_1.accessibleHandler()
        ], Screenshot.prototype, "activateScreenshot", null);
        __decorate([
            decorators_1.aliasOf("viewModel.downloadImage"),
            widget_1.accessibleHandler()
        ], Screenshot.prototype, "downloadImage", void 0);
        Screenshot = __decorate([
            decorators_1.subclass("Screenshot")
        ], Screenshot);
        return Screenshot;
    }(decorators_1.declared(Widget)));
    return Screenshot;
});
//# sourceMappingURL=Screenshot.js.map