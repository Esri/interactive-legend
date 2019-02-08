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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/accessorSupport/decorators"], function (require, exports, __extends, __decorate, Accessor, decorators_1) {
    "use strict";
    var InfoViewModel = /** @class */ (function (_super) {
        __extends(InfoViewModel, _super);
        function InfoViewModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.selectedItemIndex = 0;
            _this.expandWidget = null;
            _this.infoContent = [];
            return _this;
        }
        __decorate([
            decorators_1.property()
        ], InfoViewModel.prototype, "selectedItemIndex", void 0);
        __decorate([
            decorators_1.property()
        ], InfoViewModel.prototype, "expandWidget", void 0);
        __decorate([
            decorators_1.property()
        ], InfoViewModel.prototype, "infoContent", void 0);
        InfoViewModel = __decorate([
            decorators_1.subclass("InfoViewModel")
        ], InfoViewModel);
        return InfoViewModel;
    }(decorators_1.declared(Accessor)));
    return InfoViewModel;
});
//# sourceMappingURL=InfoViewModel.js.map