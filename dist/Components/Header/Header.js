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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1) {
    "use strict";
    var CSS = {
        title: "title-container"
    };
    var Header = /** @class */ (function (_super) {
        __extends(Header, _super);
        function Header(params) {
            return _super.call(this, params) || this;
        }
        Header.prototype.render = function () {
            var _a = this.config, headHTML = _a.headHTML, customHeaderEnabled = _a.customHeaderEnabled, title = _a.title;
            var appTitle = document.body.clientWidth < 813 && title.length > 40
                ? title
                    .split("")
                    .slice(0, 35)
                    .join("") + "..."
                : title;
            return (widget_1.tsx("header", { innerHTML: customHeaderEnabled ? (headHTML ? headHTML : null) : null }, customHeaderEnabled ? null : widget_1.tsx("div", { class: CSS.title }, appTitle)));
        };
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Header.prototype, "config", void 0);
        Header = __decorate([
            decorators_1.subclass("Header")
        ], Header);
        return Header;
    }(decorators_1.declared(Widget)));
    return Header;
});
//# sourceMappingURL=Header.js.map