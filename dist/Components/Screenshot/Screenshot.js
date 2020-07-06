define(["require", "exports", "tslib", "dojo/i18n!./Screenshot/nls/resources", "esri/widgets/Widget", "esri/core/accessorSupport/decorators", "esri/core/watchUtils", "esri/core/Handles", "esri/widgets/support/widget", "./Screenshot/ScreenshotViewModel", "esri/widgets/Feature"], function (require, exports, tslib_1, resources_1, Widget, decorators_1, watchUtils, Handles, widget_1, ScreenshotViewModel, FeatureWidget) {
    "use strict";
    resources_1 = tslib_1.__importDefault(resources_1);
    // ----------------------------------
    //
    //  CSS Classes
    //
    // ----------------------------------
    var CSS = {
        base: "esri-screenshot",
        widget: "esri-widget esri-widget--panel",
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
        iconFlush: "icon-ui-flush",
        fieldsetCheckbox: "fieldset-checkbox",
        button: "btn",
        buttonRed: "btn-red",
        featureWarning: "esri-screenshot__feature-warning",
        featureWarningTextContainer: "esri-screenshot__feature-warning-text-container",
        warningSVG: "esri-screenshot__warning-svg",
        selectFeatureText: "esri-screenshot__select-feature-text",
        screenshotfieldSetCheckbox: "esri-screenshot__field-set-checkbox",
        offScreenPopupContainer: "esri-screenshot__offscreen-pop-up-container",
        offScreenLegendContainer: "esri-screenshot__offscreen-legend-container",
        screenshotClose: "esri-screenshot__close-button",
        closeButtonContainer: "esri-screenshot__close-button-container",
        screenshotPreviewContainer: "esri-screenshot__img-preview-container"
    };
    var Screenshot = /** @class */ (function (_super) {
        tslib_1.__extends(Screenshot, _super);
        function Screenshot(value) {
            var _this = _super.call(this, value) || this;
            // ----------------------------------
            //
            //  Variables
            //
            // ----------------------------------
            // Stored Nodes
            _this._maskNode = null;
            _this._screenshotImgNode = null;
            _this._downloadBtnNode = null;
            _this._activeScreenshotBtnNode = null;
            _this._selectFeatureAlertIsVisible = null;
            _this._offscreenPopupContainer = null;
            _this._offscreenLegendContainer = null;
            // _handles
            _this._handles = new Handles();
            // ----------------------------------
            //
            //  Properties
            //
            // ----------------------------------
            // view
            _this.view = null;
            // includeLegendInScreenshot
            _this.includeLegendInScreenshot = null;
            // includePopupInScreenshot
            _this.includePopupInScreenshot = null;
            // enableLegendOption
            _this.enableLegendOption = null;
            // enablePopupOption
            _this.enablePopupOption = null;
            _this.featureWidget = null;
            _this.legendWidget = null;
            // screenshotModeIsActive
            _this.screenshotModeIsActive = null;
            // selectedStyleData
            _this.selectedStyleData = null;
            // layerListViewModel
            _this.layerListViewModel = null;
            // legendFeatureCountEnabled
            _this.legendFeatureCountEnabled = null;
            // iconClass
            _this.iconClass = CSS.mediaIcon;
            // label
            _this.label = resources_1.default.widgetLabel;
            // viewModel
            _this.viewModel = new ScreenshotViewModel();
            return _this;
        }
        // ----------------------------------
        //
        //  Lifecycle Methods
        //
        // ----------------------------------
        Screenshot.prototype.postInitialize = function () {
            this.own([
                this._togglePopupAlert(),
                this._generateOffScreenPopup(),
                this._watchSelectedFeature()
            ]);
        };
        Screenshot.prototype.render = function () {
            var screenshotModeIsActive = this.viewModel.screenshotModeIsActive;
            var screenshotPanel = this._renderScreenshotPanel();
            var screenshotPreviewOverlay = this._renderScreenshotPreviewOverlay();
            var maskNode = this._renderMaskNode(screenshotModeIsActive);
            var offScreenNodes = this._renderOffScreenNodes();
            var optOutOfScreenshotButton = this._renderOptOutOfScreenshotButton();
            if (this.legendWidget && !this.legendWidget.container) {
                this.legendWidget.container = this._offscreenLegendContainer;
            }
            return (widget_1.tsx("div", null,
                screenshotModeIsActive ? (widget_1.tsx("div", { key: "screenshot-container", class: CSS.closeButtonContainer }, optOutOfScreenshotButton)) : (screenshotPanel),
                screenshotPreviewOverlay,
                maskNode,
                offScreenNodes));
        };
        Screenshot.prototype.destroy = function () {
            this._handles.removeAll();
            this._handles.destroy();
            this._handles = null;
            this._maskNode = null;
            this._screenshotImgNode = null;
        };
        // ----------------------------------
        //
        //  Public Methods
        //
        // ----------------------------------
        // activateScreenshot
        Screenshot.prototype.activateScreenshot = function () {
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
        Screenshot.prototype._downloadImage = function () {
            this.viewModel.downloadImage();
        };
        // ----------------------------------
        //
        //  Private Methods
        //
        // ----------------------------------
        // ----------------------------------
        //
        //  Render Node Methods
        //
        // ----------------------------------
        // _renderScreenshotPanel
        Screenshot.prototype._renderScreenshotPanel = function () {
            var screenshotTitle = resources_1.default.screenshotTitle, screenshotSubtitle = resources_1.default.screenshotSubtitle;
            var fieldSet = this._renderFieldSet();
            var setMapAreaButton = this._renderSetMapAreaButton();
            var featureWarning = this._renderFeatureWarning();
            return (
            // screenshotBtn
            widget_1.tsx("div", { key: "screenshot-panel", class: this.classes(CSS.base, CSS.widget) },
                widget_1.tsx("div", { class: CSS.mainContainer },
                    widget_1.tsx("h1", { class: CSS.panelTitle }, screenshotTitle),
                    this.enableLegendOption || this.enablePopupOption ? (widget_1.tsx("h3", { class: CSS.panelSubTitle }, screenshotSubtitle)) : null,
                    this.enableLegendOption || this.enablePopupOption ? fieldSet : null,
                    featureWarning,
                    setMapAreaButton)));
        };
        // _renderFeatureWarning
        Screenshot.prototype._renderFeatureWarning = function () {
            return (widget_1.tsx("div", { class: CSS.featureWarning }, this._selectFeatureAlertIsVisible ? (widget_1.tsx("div", { class: CSS.featureWarningTextContainer },
                widget_1.tsx("svg", { class: CSS.warningSVG, xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", width: "16px", height: "16px" },
                    widget_1.tsx("path", { d: "M14.894 12.552l-6-11.998a1 1 0 0 0-1.787 0l-6 11.998A.998.998 0 0 0 2 13.999h12a.998.998 0 0 0 .894-1.447zM9 12H7v-2h2zm0-3H7V4h2z" })),
                widget_1.tsx("span", { class: CSS.selectFeatureText }, resources_1.default.selectAFeature))) : null));
        };
        // _renderFieldSet
        Screenshot.prototype._renderFieldSet = function () {
            var legend = resources_1.default.legend, popup = resources_1.default.popup;
            return (widget_1.tsx("fieldset", { class: this.classes(CSS.fieldsetCheckbox, CSS.screenshotfieldSetCheckbox) },
                this.enableLegendOption ? (widget_1.tsx("label", { key: "esri-screenshot-legend-option", class: CSS.screenshotOption },
                    widget_1.tsx("input", { bind: this, onclick: this._toggleLegend, onkeydown: this._toggleLegend, checked: this.includeLegendInScreenshot, type: "checkbox" }),
                    legend)) : null,
                this.enablePopupOption ? (widget_1.tsx("label", { key: "esri-screenshot-popup-option", class: CSS.screenshotOption },
                    widget_1.tsx("input", { bind: this, onclick: this._togglePopup, onkeydown: this._togglePopup, type: "checkbox", checked: this.includePopupInScreenshot }),
                    popup)) : null));
        };
        // _renderSetMapAreaButton
        Screenshot.prototype._renderSetMapAreaButton = function () {
            var setScreenshotArea = resources_1.default.setScreenshotArea;
            return (widget_1.tsx("div", { class: CSS.buttonContainer },
                widget_1.tsx("button", { bind: this, tabIndex: 0, onclick: this.activateScreenshot, onkeydown: this.activateScreenshot, class: CSS.button, afterCreate: widget_1.storeNode, "data-node-ref": "_activeScreenshotBtnNode", disabled: this.enablePopupOption && this.includePopupInScreenshot
                        ? this.featureWidget && this.featureWidget.graphic
                            ? false
                            : true
                        : false }, setScreenshotArea)));
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
                widget_1.tsx("div", { class: CSS.screenshotPreviewContainer },
                    widget_1.tsx("div", { class: CSS.screenshotImgContainer },
                        widget_1.tsx("img", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_screenshotImgNode", class: CSS.screenshotImg })),
                    screenshotPreviewBtns)));
        };
        // _renderScreenshotPreviewBtns
        Screenshot.prototype._renderScreenshotPreviewBtns = function () {
            return (widget_1.tsx("div", null,
                widget_1.tsx("button", { bind: this, tabIndex: 0, class: CSS.actionBtn, onclick: this._downloadImage, onkeydown: this._downloadImage, afterCreate: widget_1.storeNode, "data-node-ref": "_downloadBtnNode", "aria-label": resources_1.default.downloadImage, title: resources_1.default.downloadImage }, resources_1.default.downloadImage),
                widget_1.tsx("button", { bind: this, tabIndex: 0, class: this.classes(CSS.actionBtn, CSS.backBtn), onclick: this._closePreview, onkeydown: this._closePreview }, resources_1.default.backButton)));
        };
        // _renderMaskNode
        Screenshot.prototype._renderMaskNode = function (screenshotModeIsActive) {
            var _a;
            var maskDivIsHidden = (_a = {},
                _a[CSS.hide] = !screenshotModeIsActive,
                _a);
            return (widget_1.tsx("div", { bind: this, class: this.classes(CSS.maskDiv, maskDivIsHidden), afterCreate: widget_1.storeNode, "data-node-ref": "_maskNode" }));
        };
        // _renderOptOutOfScreenshotButton
        Screenshot.prototype._renderOptOutOfScreenshotButton = function () {
            return (widget_1.tsx("button", { bind: this, tabIndex: 0, class: this.classes(CSS.pointerCursor, CSS.button, CSS.buttonRed, CSS.screenshotClose), onclick: this.deactivateScreenshot, onkeydown: this.deactivateScreenshot, title: resources_1.default.deactivateScreenshot },
                widget_1.tsx("span", { class: this.classes(CSS.closeIcon, CSS.iconFlush) })));
        };
        // _renderOffScreenNodes
        Screenshot.prototype._renderOffScreenNodes = function () {
            return (widget_1.tsx("div", null,
                widget_1.tsx("div", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_offscreenPopupContainer", class: CSS.offScreenPopupContainer }),
                widget_1.tsx("div", { bind: this, afterCreate: widget_1.storeNode, "data-node-ref": "_offscreenLegendContainer", class: CSS.offScreenLegendContainer })));
        };
        // End of render node methods
        // _deactivateScreenshot
        Screenshot.prototype.deactivateScreenshot = function () {
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
        Screenshot.prototype._toggleLegend = function (event) {
            var node = event.currentTarget;
            this.includeLegendInScreenshot = node.checked;
            this.scheduleRender();
        };
        // _togglePopup
        Screenshot.prototype._togglePopup = function (event) {
            var node = event.currentTarget;
            this.includePopupInScreenshot = node.checked;
            this.scheduleRender();
        };
        // _closePreview
        Screenshot.prototype._closePreview = function () {
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
        Screenshot.prototype._removeSelectFeatureAlert = function () {
            this._selectFeatureAlertIsVisible = false;
            this.scheduleRender();
        };
        // _generateOffScreenPopup
        Screenshot.prototype._generateOffScreenPopup = function () {
            var _this = this;
            return watchUtils.watch(this, "view.popup.visible", function () {
                if (!_this.view) {
                    return;
                }
                if (_this.view.popup.visible && _this._offscreenPopupContainer) {
                    if (!_this.featureWidget) {
                        _this._set("featureWidget", new FeatureWidget({
                            container: _this._offscreenPopupContainer,
                            graphic: _this.view.popup.selectedFeature,
                            map: _this.view.map,
                            spatialReference: _this.view.spatialReference
                        }));
                        _this._selectFeatureAlertIsVisible = false;
                        _this.scheduleRender();
                    }
                }
            });
        };
        // _togglePopupAlert
        Screenshot.prototype._togglePopupAlert = function () {
            var _this = this;
            return watchUtils.init(this, "enablePopupOption", function () {
                if (_this.enablePopupOption) {
                    _this.own([
                        watchUtils.watch(_this, [
                            "includePopupInScreenshot",
                            "featureWidget",
                            "featureWidget.graphic"
                        ], function () {
                            _this._triggerAlert();
                        }),
                        watchUtils.init(_this, "includePopupInScreenshot", function () {
                            _this._triggerAlert();
                        })
                    ]);
                }
            });
        };
        // _triggerAlert
        Screenshot.prototype._triggerAlert = function () {
            if (this.includePopupInScreenshot &&
                (!this.featureWidget ||
                    (this.featureWidget && !this.featureWidget.graphic))) {
                this._selectFeatureAlertIsVisible = true;
            }
            else {
                this._selectFeatureAlertIsVisible = false;
            }
            this.scheduleRender();
        };
        // _watchSelectedFeature
        Screenshot.prototype._watchSelectedFeature = function () {
            var _this = this;
            return watchUtils.watch(this, "view.popup.selectedFeature", function () {
                if (_this.featureWidget &&
                    _this.view &&
                    _this.view.popup &&
                    _this.view.popup.selectedFeature) {
                    while (_this._offscreenPopupContainer &&
                        _this._offscreenPopupContainer.firstChild) {
                        _this._offscreenPopupContainer.removeChild(_this._offscreenPopupContainer.firstChild);
                    }
                    _this.featureWidget.graphic = null;
                    _this._set("featureWidget", null);
                }
                _this._set("featureWidget", new FeatureWidget({
                    container: _this._offscreenPopupContainer,
                    graphic: _this.view.popup.selectedFeature,
                    map: _this.view.map,
                    spatialReference: _this.view.spatialReference
                }));
                _this.scheduleRender();
            });
        };
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.view"),
            decorators_1.property()
        ], Screenshot.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.includeLegendInScreenshot"),
            decorators_1.property()
        ], Screenshot.prototype, "includeLegendInScreenshot", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.includePopupInScreenshot"),
            decorators_1.property()
        ], Screenshot.prototype, "includePopupInScreenshot", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.enableLegendOption"),
            widget_1.renderable()
        ], Screenshot.prototype, "enableLegendOption", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.enablePopupOption"),
            widget_1.renderable()
        ], Screenshot.prototype, "enablePopupOption", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.featureWidget"),
            decorators_1.property({
                readOnly: true
            })
        ], Screenshot.prototype, "featureWidget", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.legendWidget"),
            decorators_1.property({
                readOnly: true
            })
        ], Screenshot.prototype, "legendWidget", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.screenshotModeIsActive"),
            decorators_1.property()
        ], Screenshot.prototype, "screenshotModeIsActive", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.selectedStyleData"),
            decorators_1.property()
        ], Screenshot.prototype, "selectedStyleData", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.layerListViewModel"),
            decorators_1.property()
        ], Screenshot.prototype, "layerListViewModel", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf("viewModel.legendFeatureCountEnabled"),
            decorators_1.property()
        ], Screenshot.prototype, "legendFeatureCountEnabled", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Screenshot.prototype, "iconClass", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Screenshot.prototype, "label", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable([
                "viewModel.state",
                "viewModel.includeLegendInScreenshot",
                "viewModel.includePopupInScreenshot",
                "viewModel.enableLegendOption",
                "viewModel.enablePopupOption",
                "viewModel.featureWidget",
                "viewModel.legendWidget"
            ])
        ], Screenshot.prototype, "viewModel", void 0);
        tslib_1.__decorate([
            widget_1.accessibleHandler()
        ], Screenshot.prototype, "activateScreenshot", null);
        tslib_1.__decorate([
            widget_1.accessibleHandler()
        ], Screenshot.prototype, "_downloadImage", null);
        tslib_1.__decorate([
            widget_1.accessibleHandler()
        ], Screenshot.prototype, "deactivateScreenshot", null);
        tslib_1.__decorate([
            widget_1.accessibleHandler()
        ], Screenshot.prototype, "_toggleLegend", null);
        tslib_1.__decorate([
            widget_1.accessibleHandler()
        ], Screenshot.prototype, "_togglePopup", null);
        tslib_1.__decorate([
            widget_1.accessibleHandler()
        ], Screenshot.prototype, "_closePreview", null);
        tslib_1.__decorate([
            widget_1.accessibleHandler()
        ], Screenshot.prototype, "_removeSelectFeatureAlert", null);
        Screenshot = tslib_1.__decorate([
            decorators_1.subclass("Screenshot")
        ], Screenshot);
        return Screenshot;
    }(Widget));
    return Screenshot;
});
//# sourceMappingURL=Screenshot.js.map