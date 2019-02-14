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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Splash = /** @class */ (function (_super) {
        __extends(Splash, _super);
        function Splash(params) {
            var _this = _super.call(this, params) || this;
            _this.modalId = "splash";
            _this.config = params.config;
            return _this;
        }
        Splash.prototype.render = function () {
            calcite.init();
            var description = this.config.splashContent ? (widget_1.tsx("span", { innerHTML: this.config.splashContent })) : null;
            var splashContent = (widget_1.tsx("div", { class: "js-modal modal-overlay modifier-class", "data-modal": this.modalId },
                widget_1.tsx("div", { class: "modal-content column-12 app-body", role: "dialog", "aria-labelledby": "modal" },
                    widget_1.tsx("h3", { class: "trailer-half" }, this.config.splashTitle),
                    widget_1.tsx("p", null, description),
                    widget_1.tsx("div", { class: "text-right" },
                        widget_1.tsx("button", { class: "btn btn-clear js-modal-toggle app-button" }, this.config.splashButtonText)))));
            return widget_1.tsx("div", null, splashContent);
        };
        Splash.prototype.createToolbarButton = function () {
            var _a;
            // add a button to the app that toggles the splash and setup to add to the view
            var splashButton = document.createElement("button");
            splashButton.setAttribute("data-modal", this.modalId);
            var headerButtonClasses = [
                "js-modal-toggle",
                "esri-widget",
                "esri-widget--button",
                "icon-ui-flush",
                "icon-ui-description"
            ];
            (_a = splashButton.classList).add.apply(_a, headerButtonClasses);
            return splashButton;
        };
        Splash.prototype.showSplash = function () {
            if (this.config.splashOnStart) {
                // enable splash screen when app loads then
                // set info in session storage when its closed
                // so we don't open again this session.
                if (!sessionStorage.getItem("disableSplash")) {
                    calcite.bus.emit("modal:open", { id: this.modalId });
                }
                sessionStorage.setItem("disableSplash", "true");
            }
        };
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Splash.prototype, "config", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Splash.prototype, "modalId", void 0);
        Splash = __decorate([
            decorators_1.subclass("app.Splash")
        ], Splash);
        return Splash;
    }(decorators_1.declared(Widget)));
    exports.default = Splash;
});
//# sourceMappingURL=Splash.js.map