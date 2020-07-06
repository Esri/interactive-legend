define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/core/Accessor", "esri/core/Collection"], function (require, exports, tslib_1, decorators_1, Accessor, Collection) {
    "use strict";
    var InteractiveStyleData = /** @class */ (function (_super) {
        tslib_1.__extends(InteractiveStyleData, _super);
        function InteractiveStyleData() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.queryExpressions = new Collection();
            _this.featureCount = new Collection();
            _this.totalFeatureCount = [];
            return _this;
        }
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleData.prototype, "queryExpressions", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleData.prototype, "featureCount", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InteractiveStyleData.prototype, "totalFeatureCount", void 0);
        InteractiveStyleData = tslib_1.__decorate([
            decorators_1.subclass("InteractiveStyleData")
        ], InteractiveStyleData);
        return InteractiveStyleData;
    }(Accessor));
    return InteractiveStyleData;
});
//# sourceMappingURL=InteractiveStyleData.js.map