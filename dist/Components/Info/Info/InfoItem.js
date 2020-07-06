define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/core/Accessor"], function (require, exports, tslib_1, decorators_1, Accessor) {
    "use strict";
    var InfoItem = /** @class */ (function (_super) {
        tslib_1.__extends(InfoItem, _super);
        function InfoItem() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // type
            _this.type = null;
            // title
            _this.title = null;
            // infoContentItems
            _this.infoContentItems = null;
            return _this;
        }
        tslib_1.__decorate([
            decorators_1.property()
        ], InfoItem.prototype, "type", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InfoItem.prototype, "title", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InfoItem.prototype, "infoContentItems", void 0);
        InfoItem = tslib_1.__decorate([
            decorators_1.subclass("InfoItem")
        ], InfoItem);
        return InfoItem;
    }(Accessor));
    return InfoItem;
});
//# sourceMappingURL=InfoItem.js.map