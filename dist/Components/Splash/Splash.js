define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "../InteractiveLegend/InteractiveLegend/support/styleUtils", "esri/core/watchUtils"], function (require, exports, tslib_1, decorators_1, Widget, widget_1, styleUtils_1, watchUtils_1) {
    "use strict";
    var CSS = {
        jsModal: "js-modal",
        modalOverlay: "modal-overlay",
        modifierClass: "modifier-class",
        modalContent: "modal-content",
        column12: "column-12",
        appBody: "app-body",
        trailerHalf: "trailer-half",
        textRight: "text-right",
        btn: "btn",
        btnClear: "btn-clear",
        jsModalToggle: "js-modal-toggle",
        appButton: "app-button",
        jsModalButton: "js-modal-toggle",
        esriWidget: "esri-widget",
        esriWidgetButton: "esri-widget--button",
        flushIcon: "icon-ui-flush",
        descriptionIcon: "icon-ui-description",
        splashButtonStyles: "splash-button"
    };
    var Splash = /** @class */ (function (_super) {
        tslib_1.__extends(Splash, _super);
        function Splash(params) {
            var _this = _super.call(this, params) || this;
            _this._calcite = null;
            _this._splashContentNode = null;
            _this.view = null;
            _this.splashButtonText = null;
            _this.splashContent = null;
            _this.splashOnStart = null;
            _this.splashTitle = null;
            _this.modalId = "splash";
            return _this;
        }
        Splash.prototype.postInitialize = function () {
            var _this = this;
            this.own([
                watchUtils_1.when(this, "splashContent", function () {
                    _this._handleSplashContent();
                    _this.scheduleRender();
                }),
                watchUtils_1.watch(this, "splashContent", function () {
                    _this._handleSplashContent();
                    _this.scheduleRender();
                })
            ]);
        };
        Splash.prototype.render = function () {
            var _this = this;
            if (!this._calcite) {
                this._calcite = calcite.init();
            }
            var _a = this, splashTitle = _a.splashTitle, splashButtonText = _a.splashButtonText;
            return (widget_1.tsx("div", { class: this.classes(CSS.jsModal, CSS.modalOverlay, CSS.modifierClass), "data-modal": this.modalId, afterCreate: function () {
                    if (_this.splashOnStart && !sessionStorage.getItem("disableSplash")) {
                        calcite.bus.emit("modal:open", { id: _this.modalId });
                        sessionStorage.setItem("disableSplash", "true");
                    }
                } },
                widget_1.tsx("div", { class: this.classes(CSS.modalContent, CSS.column12, CSS.appBody), role: "dialog", "aria-labelledby": "modal" },
                    widget_1.tsx("h3", { class: CSS.trailerHalf }, splashTitle),
                    this._splashContentNode ? (widget_1.tsx("p", { bind: this._splashContentNode, afterCreate: styleUtils_1.attachToNode })) : null,
                    widget_1.tsx("div", { class: CSS.textRight },
                        widget_1.tsx("button", { class: this.classes(CSS.btn, CSS.btnClear, CSS.jsModalToggle, CSS.appButton) }, splashButtonText)))));
        };
        Splash.prototype.createToolbarButton = function () {
            // add a button to the app that toggles the splash and setup to add to the view
            var splashButton = document.createElement("button");
            splashButton.setAttribute("data-modal", this.modalId);
            splashButton.id = this.modalId;
            var jsModalToggle = CSS.jsModalToggle, esriWidget = CSS.esriWidget, esriWidgetButton = CSS.esriWidgetButton, flushIcon = CSS.flushIcon, descriptionIcon = CSS.descriptionIcon, splashButtonStyles = CSS.splashButtonStyles;
            var headerButtonClasses = [
                jsModalToggle,
                esriWidget,
                esriWidgetButton,
                splashButtonStyles
            ];
            var iconClasses = [descriptionIcon, flushIcon];
            headerButtonClasses.forEach(function (className) {
                splashButton.classList.add(className);
            });
            var spanElement = document.createElement("span");
            iconClasses.forEach(function (className) {
                spanElement.classList.add(className);
            });
            splashButton.appendChild(spanElement);
            return splashButton;
        };
        Splash.prototype._handleSplashContent = function () {
            var content = document.createElement("div");
            content.innerHTML = this.splashContent;
            this._splashContentNode = content;
            this.scheduleRender();
        };
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Splash.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Splash.prototype, "splashButtonText", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Splash.prototype, "splashContent", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Splash.prototype, "splashOnStart", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Splash.prototype, "splashTitle", void 0);
        tslib_1.__decorate([
            decorators_1.property({
                readOnly: true
            })
        ], Splash.prototype, "modalId", void 0);
        Splash = tslib_1.__decorate([
            decorators_1.subclass("Splash")
        ], Splash);
        return Splash;
    }(Widget));
    return Splash;
});
//# sourceMappingURL=Splash.js.map