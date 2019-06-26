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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/assignHelper", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget"], function (require, exports, __assign, __extends, __decorate, decorators_1, Widget, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
        __extends(Splash, _super);
        function Splash(params) {
            var _this = _super.call(this, params) || this;
            _this._calcite = null;
            _this.view = null;
            _this.modalId = "splash";
            _this.config = params.config;
            return _this;
        }
        Splash.prototype.render = function () {
            var description = this.config.splashContent ? (widget_1.tsx("span", { innerHTML: this.config.splashContent })) : null;
            if (!this._calcite) {
                this._calcite = calcite.init();
            }
            var splashContent = (widget_1.tsx("div", { class: this.classes(CSS.jsModal, CSS.modalOverlay, CSS.modifierClass), "data-modal": this.modalId },
                widget_1.tsx("div", { class: this.classes(CSS.modalContent, CSS.column12, CSS.appBody), role: "dialog", "aria-labelledby": "modal" },
                    widget_1.tsx("h3", { class: CSS.trailerHalf }, this.config.splashTitle),
                    widget_1.tsx("p", null, description),
                    widget_1.tsx("div", { class: CSS.textRight },
                        widget_1.tsx("button", { class: this.classes(CSS.btn, CSS.btnClear, CSS.jsModalToggle, CSS.appButton) }, this.config.splashButtonText)))));
            return widget_1.tsx("div", null, splashContent);
        };
        Splash.prototype.createToolbarButton = function () {
            // add a button to the app that toggles the splash and setup to add to the view
            var splashButton = document.createElement("button");
            splashButton.setAttribute("data-modal", this.modalId);
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
        Splash.prototype.showSplash = function () {
            if (this.config.splash) {
                // enable splash screen when app loads then
                // set info in session storage when its closed
                // so we don't open again this session.
                if (this.config.splashOnStart) {
                    calcite.bus.emit("modal:open", { id: this.modalId });
                }
                else {
                    if (!sessionStorage.getItem("disableSplash")) {
                        calcite.bus.emit("modal:open", { id: this.modalId });
                    }
                    sessionStorage.setItem("disableSplash", "true");
                }
            }
        };
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Splash.prototype, "view", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Splash.prototype, "config", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Splash.prototype, "modalId", void 0);
        Splash = __decorate([
            decorators_1.subclass("Splash")
        ], Splash);
        return Splash;
    }(decorators_1.declared(Widget)));
    exports.default = Splash;
});
//# sourceMappingURL=Splash.js.map