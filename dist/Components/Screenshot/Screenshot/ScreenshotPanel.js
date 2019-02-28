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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "dojo/i18n!./nls/resources", "esri/widgets/Widget", "esri/core/accessorSupport/decorators", "esri/core/watchUtils", "esri/core/Handles", "esri/widgets/support/widget", "./ScreenshotViewModel", "esri/widgets/Feature"], function (require, exports, __extends, __decorate, i18n, Widget, decorators_1, watchUtils, Handles, widget_1, ScreenshotViewModel, FeatureWidget) {
    "use strict";
    //----------------------------------
    //
    //  CSS Classes
    //
    //----------------------------------
    var CSS = {
        base: "esri-screenshot",
        widget: "esri-widget",
        screenshotBtn: "esri-screenshot__btn",
        mainContainer: "esri-screenshot__main-container",
        panelTitle: "esri-screenshot__panel-title",
        panelSubTitle: "esri-screenshot__panel-subtitle",
        screenshotOption: "esri-screenshot__screenshot-option",
        buttonContainer: "esri-screenshot__screenshot-button-container",
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
        closeIcon: "icon-ui-close",
        fieldsetCheckbox: "fieldset-checkbox",
        button: "btn",
        buttonRed: "btn-red",
        alert: "alert",
        greenAlert: "alert-green",
        alertClose: "alert-close",
        popupAlert: "esri-screenshot__popup-alert",
        screenshotfieldSetCheckbox: "esri-screenshot__field-set-checkbox",
        offScreenPopupContainer: "esri-screenshot__offscreen-pop-up-container",
        offScreenLegendContainer: "esri-screenshot__offscreen-legend-container"
    };
    var ScreenshotPanel = /** @class */ (function (_super) {
        __extends(ScreenshotPanel, _super);
        function ScreenshotPanel() {
            //----------------------------------
            //
            //  Variables
            //
            //----------------------------------
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // Stored Nodes
            _this._maskNode = null;
            _this._screenshotImgNode = null;
            _this._downloadBtnNode = null;
            _this._activeScreenshotBtnNode = null;
            _this._selectFeatureAlertIsVisible = null;
            _this._offscreenPopupContainer = null;
            _this._offscreenLegendContainer = null;
            // _popupIsIncluded
            _this._popupIsIncluded = null;
            // _handles
            _this._handles = new Handles();
            //----------------------------------
            //
            //  Properties
            //
            //----------------------------------
            // view
            _this.view = null;
            // mapComponentSelectors
            _this.mapComponentSelectors = [];
            // legendScreenshotEnabled
            _this.legendScreenshotEnabled = null;
            // popupScreenshotEnabled
            _this.popupScreenshotEnabled = null;
            // legendIncludedInScreenshot
            _this.legendIncludedInScreenshot = null;
            // popupIncludedInScreenshot
            _this.popupIncludedInScreenshot = null;
            _this.featureWidget = null;
            _this.expandWidget = null;
            _this.legendWidget = null;
            _this.selectedStyleData = null;
            _this.expandWidgetEnabled = null;
            // viewModel
            _this.viewModel = new ScreenshotViewModel();
            return _this;
        }
        //----------------------------------
        //
        //  Lifecycle Methods
        //
        //----------------------------------
        ScreenshotPanel.prototype.postInitialize = function () {
            this.own([
                this._watchPopups(),
                this._togglePopupAlert(),
                this._generateOffScreenPopup(),
                this._resetOffScreenPopup(),
                this._watchOffScreenPopup()
            ]);
        };
        ScreenshotPanel.prototype.render = function () {
            var screenshotModeIsActive = this.viewModel.screenshotModeIsActive;
            var screenshotPanel = this._renderScreenshotPanel();
            var screenshotPreviewOverlay = this._renderScreenshotPreviewOverlay();
            var maskNode = this._renderMaskNode(screenshotModeIsActive);
            var offScreenNodes = this._renderOffScreenNodes();
            var optOutOfScreenshotButton = this._renderOptOutOfScreenshotButton();
            if (this.legendWidget && !this.legendWidget.container) {
                this.legendWidget.container = this._offscreenLegendContainer;
            }
            return (widget_1.tsx("div", { class: this.classes(CSS.widget, CSS.base) },
                screenshotModeIsActive ? optOutOfScreenshotButton : screenshotPanel,
                screenshotPreviewOverlay,
                maskNode,
                offScreenNodes));
        };
        ScreenshotPanel.prototype.destroy = function () {
            this._handles.removeAll();
            this._handles.destroy();
            this._handles = null;
            this._maskNode = null;
            this._screenshotImgNode = null;
        };
        //----------------------------------
        //
        //  Public Methods
        //
        //----------------------------------
        // activateScreenshot
        ScreenshotPanel.prototype.activateScreenshot = function () {
            var _this = this;
            if (this.viewModel.screenshotModeIsActive) {
                return;
            }
            this.viewModel.screenshotModeIsActive = true;
            this.view.container.classList.add(CSS.screenshotCursor);
            this.viewModel.dragHandler = this.view.on("drag", function (event) {
                _this.viewModel.setScreenshotArea(event, _this._maskNode, _this._screenshotImgNode, _this.viewModel.dragHandler, _this._downloadBtnNode);
            });
            this.scheduleRender();
        };
        // downloadImage
        ScreenshotPanel.prototype._downloadImage = function () {
            this.viewModel.downloadImage();
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
        // _renderScreenshotPanel
        ScreenshotPanel.prototype._renderScreenshotPanel = function () {
            var screenshotTitle = i18n.screenshotTitle, screenshotSubtitle = i18n.screenshotSubtitle;
            var fieldSet = this._renderFieldSet();
            var featureAlert = this._renderFeatureAlert();
            var setMapAreaButton = this._renderSetMapAreaButton();
            return (
            // screenshotBtn
            widget_1.tsx("div", { key: "screenshot-panel", class: CSS.base },
                this._selectFeatureAlertIsVisible ? featureAlert : null,
                widget_1.tsx("div", { class: CSS.mainContainer },
                    widget_1.tsx("h1", { class: CSS.panelTitle }, screenshotTitle),
                    this.legendIncludedInScreenshot || this.popupIncludedInScreenshot ? (widget_1.tsx("h3", { class: CSS.panelSubTitle }, screenshotSubtitle)) : null,
                    this.legendIncludedInScreenshot || this.popupIncludedInScreenshot
                        ? fieldSet
                        : null,
                    setMapAreaButton)));
        };
        // _renderFeatureAlert
        ScreenshotPanel.prototype._renderFeatureAlert = function () {
            var _a;
            var alertIsActive = (_a = {},
                _a["is-active"] = this._selectFeatureAlertIsVisible,
                _a);
            return (widget_1.tsx("div", { key: "feature-alert", class: this.classes(CSS.popupAlert, CSS.alert, CSS.greenAlert, CSS.modifierClass, alertIsActive) },
                i18n.selectAFeature,
                widget_1.tsx("button", { bind: this, onclick: this._removeSelectFeatureAlert, onkeydown: this._removeSelectFeatureAlert, class: CSS.alertClose },
                    widget_1.tsx("span", { class: CSS.closeIcon }))));
        };
        // _renderFieldSet
        ScreenshotPanel.prototype._renderFieldSet = function () {
            var legend = i18n.legend, popup = i18n.popup;
            return (widget_1.tsx("fieldset", { class: this.classes(CSS.fieldsetCheckbox, CSS.screenshotfieldSetCheckbox) },
                this.legendIncludedInScreenshot ? (widget_1.tsx("label", { class: CSS.screenshotOption },
                    " ",
                    widget_1.tsx("input", { bind: this, onclick: this._toggleLegend, onkeydown: this._toggleLegend, checked: this.legendScreenshotEnabled, type: "checkbox" }),
                    legend)) : null,
                this.popupIncludedInScreenshot ? (widget_1.tsx("label", { class: CSS.screenshotOption },
                    widget_1.tsx("input", { bind: this, onclick: this._togglePopup, onkeydown: this._togglePopup, type: "checkbox", checked: this.popupScreenshotEnabled }),
                    popup)) : null));
        };
        // _renderSetMapAreaButton
        ScreenshotPanel.prototype._renderSetMapAreaButton = function () {
            var setScreenshotArea = i18n.setScreenshotArea;
            return (widget_1.tsx("div", { class: CSS.buttonContainer },
                widget_1.tsx("button", { bind: this, tabIndex: 0, onclick: this.activateScreenshot, onkeydown: this.activateScreenshot, class: CSS.button, afterCreate: widget_1.storeNode, "data-node-ref": "_activeScreenshotBtnNode", disabled: this.popupIncludedInScreenshot && this.popupScreenshotEnabled
                        ? this.featureWidget && this.featureWidget.graphic
                            ? false
                            : true
                        : false }, setScreenshotArea)));
        };
        // _renderScreenshotPreviewOverlay
        ScreenshotPanel.prototype._renderScreenshotPreviewOverlay = function () {
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
        // _renderScreenshotPreviewBtns
        ScreenshotPanel.prototype._renderScreenshotPreviewBtns = function () {
            return (widget_1.tsx("div", null,
                widget_1.tsx("button", { bind: this, tabIndex: 0, class: CSS.actionBtn, onclick: this._downloadImage, onkeydown: this._downloadImage, afterCreate: widget_1.storeNode, "data-node-ref": "_downloadBtnNode", "aria-label": i18n.downloadImage, title: i18n.downloadImage }, i18n.downloadImage),
                widget_1.tsx("button", { bind: this, tabIndex: 0, class: this.classes(CSS.actionBtn, CSS.backBtn), onclick: this._closePreview, onkeydown: this._closePreview }, i18n.backButton)));
        };
        // _renderMaskNode
        ScreenshotPanel.prototype._renderMaskNode = function (screenshotModeIsActive) {
            var _a;
            var maskDivIsHidden = (_a = {},
                _a[CSS.hide] = !screenshotModeIsActive,
                _a);
            return (widget_1.tsx("div", { bind: this, class: this.classes(CSS.maskDiv, maskDivIsHidden), afterCreate: widget_1.storeNode, "data-node-ref": "_maskNode" }));
        };
        // _renderOptOutOfScreenshotButton
        ScreenshotPanel.prototype._renderOptOutOfScreenshotButton = function () {
            return (widget_1.tsx("button", { bind: this, tabIndex: 0, class: this.classes(CSS.screenshotBtn, CSS.pointerCursor, CSS.button, CSS.buttonRed), onclick: this._deactivateScreenshot, onkeydown: this._deactivateScreenshot, title: i18n.deactivateScreenshot },
                widget_1.tsx("span", { class: CSS.closeIcon })));
        };
        // _renderOffScreenNodes
        ScreenshotPanel.prototype._renderOffScreenNodes = function () {
            return (widget_1.tsx("div", null,
                widget_1.tsx("div", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_offscreenPopupContainer", class: CSS.offScreenPopupContainer }),
                widget_1.tsx("div", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_offscreenLegendContainer", class: CSS.offScreenLegendContainer })));
        };
        // End of render node methods
        // _deactivateScreenshot
        ScreenshotPanel.prototype._deactivateScreenshot = function () {
            var _this = this;
            this.viewModel.screenshotModeIsActive = false;
            this.view.container.classList.remove(CSS.screenshotCursor);
            if (this.featureWidget && this.featureWidget.graphic) {
                this.featureWidget.graphic = null;
            }
            if (this.viewModel.dragHandler) {
                this.viewModel.dragHandler.remove();
                this.viewModel.dragHandler = null;
            }
            window.setTimeout(function () {
                _this._activeScreenshotBtnNode.focus();
            }, 10);
            this.scheduleRender();
        };
        // _toggleLegend
        ScreenshotPanel.prototype._toggleLegend = function (event) {
            var node = event.currentTarget;
            this.legendScreenshotEnabled = node.checked;
            this.scheduleRender();
        };
        // _togglePopup
        ScreenshotPanel.prototype._togglePopup = function (event) {
            var node = event.currentTarget;
            this.popupScreenshotEnabled = node.checked;
            this.scheduleRender();
        };
        // _closePreview
        ScreenshotPanel.prototype._closePreview = function () {
            var _this = this;
            var viewModel = this.viewModel;
            viewModel.previewIsVisible = false;
            viewModel.screenshotModeIsActive = false;
            this.view.popup.clear();
            window.setTimeout(function () {
                _this._activeScreenshotBtnNode.focus();
            }, 10);
            this.scheduleRender();
        };
        // _removeSelectFeatureAlert
        ScreenshotPanel.prototype._removeSelectFeatureAlert = function () {
            this._selectFeatureAlertIsVisible = false;
            this.scheduleRender();
        };
        // _watchPopups
        ScreenshotPanel.prototype._watchPopups = function () {
            var _this = this;
            return watchUtils.init(this, "view.popup.visible", function () {
                if (_this._popupIsIncluded &&
                    !_this.view.popup.visible &&
                    _this.viewModel.dragHandler) {
                    _this.viewModel.screenshotModeIsActive = false;
                    _this.view.container.classList.remove(CSS.screenshotCursor);
                    _this.scheduleRender();
                }
            });
        };
        // _togglePopupAlert
        ScreenshotPanel.prototype._togglePopupAlert = function () {
            var _this = this;
            return watchUtils.watch(this, "popupScreenshotEnabled", function () {
                if (_this.popupScreenshotEnabled && _this.popupIncludedInScreenshot) {
                    if (!_this.featureWidget) {
                        _this._selectFeatureAlertIsVisible = true;
                    }
                    else {
                        _this._selectFeatureAlertIsVisible = false;
                    }
                }
                else {
                    _this._selectFeatureAlertIsVisible = false;
                }
                _this.scheduleRender();
            });
        };
        // _generateOffScreenPopup
        ScreenshotPanel.prototype._generateOffScreenPopup = function () {
            var _this = this;
            return watchUtils.watch(this, "view.popup.visible", function () {
                if (!_this.view) {
                    return;
                }
                if (_this.view.popup.visible && _this._offscreenPopupContainer) {
                    if (!_this.featureWidget) {
                        _this.featureWidget = new FeatureWidget({
                            container: _this._offscreenPopupContainer,
                            graphic: _this.view.popup.selectedFeature
                        });
                        _this._selectFeatureAlertIsVisible = false;
                    }
                }
            });
        };
        // _watchOffScreenPopup
        ScreenshotPanel.prototype._watchOffScreenPopup = function () {
            var _this = this;
            return watchUtils.watch(this, "featureWidget", function () {
                if (!_this.featureWidget) {
                    _this._selectFeatureAlertIsVisible = true;
                }
                else {
                    _this._selectFeatureAlertIsVisible = false;
                }
            });
        };
        // _resetOffScreenPopup
        ScreenshotPanel.prototype._resetOffScreenPopup = function () {
            var _this = this;
            return watchUtils.whenFalse(this, "viewModel.screenshotModeIsActive", function () {
                if (_this._offscreenPopupContainer.hasChildNodes()) {
                    _this._offscreenPopupContainer.removeChild(_this._offscreenPopupContainer.children[0]);
                }
                _this.featureWidget = null;
                _this.scheduleRender();
            });
        };
        __decorate([
            decorators_1.aliasOf("viewModel.view"),
            decorators_1.property()
        ], ScreenshotPanel.prototype, "view", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.mapComponentSelectors"),
            decorators_1.property()
        ], ScreenshotPanel.prototype, "mapComponentSelectors", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.legendScreenshotEnabled"),
            decorators_1.property()
        ], ScreenshotPanel.prototype, "legendScreenshotEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.popupScreenshotEnabled"),
            decorators_1.property()
        ], ScreenshotPanel.prototype, "popupScreenshotEnabled", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.legendIncludedInScreenshot"),
            decorators_1.property()
        ], ScreenshotPanel.prototype, "legendIncludedInScreenshot", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.popupIncludedInScreenshot"),
            decorators_1.property()
        ], ScreenshotPanel.prototype, "popupIncludedInScreenshot", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.featureWidget"),
            decorators_1.property()
        ], ScreenshotPanel.prototype, "featureWidget", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.expandWidget"),
            decorators_1.property()
        ], ScreenshotPanel.prototype, "expandWidget", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.legendWidget"),
            decorators_1.property()
        ], ScreenshotPanel.prototype, "legendWidget", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.selectedStyleData"),
            decorators_1.property()
        ], ScreenshotPanel.prototype, "selectedStyleData", void 0);
        __decorate([
            decorators_1.aliasOf("viewModel.expandWidgetEnabled"),
            decorators_1.property()
        ], ScreenshotPanel.prototype, "expandWidgetEnabled", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable([
                "viewModel.state",
                "viewModel.legendScreenshotEnabled",
                "viewModel.popupScreenshotEnabled",
                "viewModel.legendIncludedInScreenshot",
                "viewModel.popupIncludedInScreenshot",
                "viewModel.featureWidget",
                "viewModel.expandWidget",
                "viewModel.legendWidget",
                "viewModel.selectedStyleData",
                "viewModel.expandWidgetEnabled"
            ])
        ], ScreenshotPanel.prototype, "viewModel", void 0);
        __decorate([
            widget_1.accessibleHandler()
        ], ScreenshotPanel.prototype, "activateScreenshot", null);
        __decorate([
            widget_1.accessibleHandler()
        ], ScreenshotPanel.prototype, "_downloadImage", null);
        __decorate([
            widget_1.accessibleHandler()
        ], ScreenshotPanel.prototype, "_deactivateScreenshot", null);
        __decorate([
            widget_1.accessibleHandler()
        ], ScreenshotPanel.prototype, "_toggleLegend", null);
        __decorate([
            widget_1.accessibleHandler()
        ], ScreenshotPanel.prototype, "_togglePopup", null);
        __decorate([
            widget_1.accessibleHandler()
        ], ScreenshotPanel.prototype, "_closePreview", null);
        __decorate([
            widget_1.accessibleHandler()
        ], ScreenshotPanel.prototype, "_removeSelectFeatureAlert", null);
        ScreenshotPanel = __decorate([
            decorators_1.subclass("ScreenshotPanel")
        ], ScreenshotPanel);
        return ScreenshotPanel;
    }(decorators_1.declared(Widget)));
    return ScreenshotPanel;
});
//# sourceMappingURL=ScreenshotPanel.js.map