define(["require", "exports", "tslib", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/core/Collection", "./InfoItem"], function (require, exports, tslib_1, Accessor, decorators_1, Collection, InfoItem) {
    "use strict";
    //----------------------------------
    //
    //  Info Item Collection
    //
    //----------------------------------
    var InfoItemCollection = Collection.ofType(InfoItem);
    var InfoViewModel = /** @class */ (function (_super) {
        tslib_1.__extends(InfoViewModel, _super);
        function InfoViewModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // view
            _this.view = null;
            // selectedItemIndex
            _this.selectedItemIndex = 0;
            // expandWidget
            _this.expandWidget = null;
            // infoContent
            _this.infoContent = new InfoItemCollection();
            return _this;
        }
        Object.defineProperty(InfoViewModel.prototype, "state", {
            // state
            get: function () {
                var ready = this.get("view.ready");
                return ready ? "ready" : this.view ? "loading" : "disabled";
            },
            enumerable: false,
            configurable: true
        });
        // goToPage
        InfoViewModel.prototype.goToPage = function (event, paginationNodes) {
            var node = event.currentTarget;
            var itemIndex = node.getAttribute("data-pagination-index");
            this.selectedItemIndex = parseInt(itemIndex);
            paginationNodes[this.selectedItemIndex].domNode.focus();
        };
        // nextPage
        InfoViewModel.prototype.nextPage = function (paginationNodes) {
            if (this.selectedItemIndex !== this.infoContent.length - 1) {
                this.selectedItemIndex += 1;
                paginationNodes[this.selectedItemIndex].domNode.focus();
            }
        };
        // previousPage
        InfoViewModel.prototype.previousPage = function (paginationNodes) {
            if (this.selectedItemIndex !== 0) {
                this.selectedItemIndex -= 1;
                paginationNodes[this.selectedItemIndex].domNode.focus();
            }
        };
        // closeInfoPanel
        InfoViewModel.prototype.closeInfoPanel = function () {
            this.selectedItemIndex = 0;
            this.expandWidget.expanded = false;
        };
        tslib_1.__decorate([
            decorators_1.property({
                dependsOn: ["view.ready"],
                readOnly: true
            })
        ], InfoViewModel.prototype, "state", null);
        tslib_1.__decorate([
            decorators_1.property()
        ], InfoViewModel.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InfoViewModel.prototype, "selectedItemIndex", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], InfoViewModel.prototype, "expandWidget", void 0);
        tslib_1.__decorate([
            decorators_1.property({
                type: InfoItemCollection
            })
        ], InfoViewModel.prototype, "infoContent", void 0);
        InfoViewModel = tslib_1.__decorate([
            decorators_1.subclass("InfoViewModel")
        ], InfoViewModel);
        return InfoViewModel;
    }(Accessor));
    return InfoViewModel;
});
//# sourceMappingURL=InfoViewModel.js.map