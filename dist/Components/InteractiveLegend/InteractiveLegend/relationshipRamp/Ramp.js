define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators"], function (require, exports, tslib_1, Accessor, decorators_1) {
    "use strict";
    var Ramp = /** @class */ (function (_super) {
        tslib_1.__extends(Ramp, _super);
        function Ramp(value) {
            var _this = _super.call(this, value) || this;
            _this.rampDiv = null;
            _this.shape = null;
            return _this;
        }
        tslib_1.__decorate([
            decorators_1.property()
        ], Ramp.prototype, "rampDiv", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Ramp.prototype, "shape", void 0);
        Ramp = tslib_1.__decorate([
            decorators_1.subclass("Ramp")
        ], Ramp);
        return Ramp;
    }(Accessor));
    return Ramp;
});
//# sourceMappingURL=Ramp.js.map