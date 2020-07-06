define(["require", "exports", "tslib", "esri/widgets/Widget", "esri/core/accessorSupport/decorators", "esri/widgets/support/widget", "../relationshipRamp/relationshipRampUtils", "esri/core/watchUtils", "../support/styleUtils", "dojo/i18n!../../../../nls/resources"], function (require, exports, tslib_1, Widget, decorators_1, widget_1, relationshipRampUtils_1, watchUtils, styleUtils_1, resources_1) {
    "use strict";
    resources_1 = tslib_1.__importDefault(resources_1);
    // ----------------------------------
    //
    //  CSS classes
    //
    // ----------------------------------
    var CSS = {
        // relationship diamond
        diamondContainer: "esri-relationship-ramp--diamond__container",
        diamondLeftCol: "esri-relationship-ramp--diamond__left-column",
        diamondRightCol: "esri-relationship-ramp--diamond__right-column",
        diamondMidCol: "esri-relationship-ramp--diamond__middle-column",
        diamondMidColLabel: "esri-relationship-ramp--diamond__middle-column--label",
        diamondMidColRamp: "esri-relationship-ramp--diamond__middle-column--ramp",
        // relationship square
        squareTable: "esri-relationship-ramp--square__table",
        squareTableRow: "esri-relationship-ramp--square__table-row",
        squareTableCell: "esri-relationship-ramp--square__table-cell",
        squareTableLabel: "esri-relationship-ramp--square__table-label",
        squareTableLabelLeftBottom: "esri-relationship-ramp--square__table-label--left-bottom",
        squareTableLabelRightBottom: "esri-relationship-ramp--square__table-label--right-bottom",
        squareTableLabelLeftTop: "esri-relationship-ramp--square__table-label--left-top",
        squareTableLabelRightTop: "esri-relationship-ramp--square__table-label--right-top",
        // custom
        relationshipInstructions: "esri-interactive-legend__relationship-instructions"
    };
    var RelationshipRamp = /** @class */ (function (_super) {
        tslib_1.__extends(RelationshipRamp, _super);
        // ----------------------------------
        //
        //  Lifecycle methods
        //
        // ----------------------------------
        function RelationshipRamp(value) {
            var _this = _super.call(this, value) || this;
            // ----------------------------------
            //
            //  Variables
            //
            // ----------------------------------
            _this._rampDiv = null;
            _this.twoDimensionRamp = null;
            // ----------------------------------
            //
            //  Properties
            //
            // ----------------------------------
            // view
            _this.view = null;
            // legendElement
            _this.legendElement = null;
            // id
            _this.id = null;
            // activeLayerInfos
            _this.activeLayerInfos = null;
            // layerView
            _this.layerView = null;
            // featureCount
            _this.featureCount = null;
            // filterMode
            _this.filterMode = null;
            // opacity
            _this.opacity = null;
            // grayScale
            _this.grayScale = null;
            _this.searchViewModel = null;
            _this.layerListViewModel = null;
            _this.featureCountEnabled = null;
            return _this;
        }
        RelationshipRamp.prototype.postInitialize = function () {
            var _this = this;
            this.own([
                watchUtils.init(this, "activeLayerInfos", function () {
                    _this.activeLayerInfos.forEach(function () {
                        if (!_this._rampDiv) {
                            _this.twoDimensionRamp = relationshipRampUtils_1.renderRamp(_this.legendElement, _this.id, _this.view, _this.activeLayerInfos, _this.layerView, _this.filterMode, _this.opacity, _this.grayScale, _this.searchViewModel, _this.layerListViewModel, _this.featureCountEnabled);
                            _this._rampDiv = _this.twoDimensionRamp.rampDiv;
                        }
                        else {
                            if (_this.twoDimensionRamp) {
                                _this.twoDimensionRamp.shape.layerView = _this.layerView;
                                _this.featureCount = _this.twoDimensionRamp.shape.layerView;
                            }
                        }
                    });
                })
            ]);
        };
        RelationshipRamp.prototype.render = function () {
            var _a = this.legendElement, focus = _a.focus, labels = _a.labels;
            var isDiamond = !!focus;
            if (isDiamond) {
                return (widget_1.tsx("div", { key: this.layerView.layer.id + "-relationship" },
                    widget_1.tsx("div", { class: CSS.relationshipInstructions }, resources_1.default.relationshipInstruction),
                    widget_1.tsx("div", { key: "" + this.id, class: CSS.diamondContainer },
                        widget_1.tsx("div", { class: CSS.diamondLeftCol }, labels.left),
                        widget_1.tsx("div", { class: CSS.diamondMidCol },
                            widget_1.tsx("div", { class: CSS.diamondMidColLabel }, labels.top),
                            widget_1.tsx("div", { class: CSS.diamondMidColRamp, bind: this._rampDiv ? this._rampDiv : null, afterCreate: this._rampDiv ? styleUtils_1.attachToNode : null }),
                            widget_1.tsx("div", { class: CSS.diamondMidColLabel }, labels.bottom)),
                        widget_1.tsx("div", { class: CSS.diamondRightCol }, labels.right))));
            }
            return (widget_1.tsx("div", null,
                widget_1.tsx("div", { class: CSS.relationshipInstructions }, resources_1.default.relationshipInstruction),
                widget_1.tsx("div", { class: CSS.squareTable },
                    widget_1.tsx("div", { class: CSS.squareTableRow },
                        widget_1.tsx("div", { class: this.classes(CSS.squareTableCell, CSS.squareTableLabel, CSS.squareTableLabelRightBottom) }, labels.left),
                        widget_1.tsx("div", { class: CSS.squareTableCell }),
                        widget_1.tsx("div", { class: this.classes(CSS.squareTableCell, CSS.squareTableLabel, CSS.squareTableLabelLeftBottom) }, labels.top)),
                    widget_1.tsx("div", { class: CSS.squareTableRow },
                        widget_1.tsx("div", { class: CSS.squareTableCell }),
                        widget_1.tsx("div", { class: CSS.squareTableCell, bind: this._rampDiv ? this._rampDiv : null, afterCreate: this._rampDiv ? styleUtils_1.attachToNode : null }),
                        widget_1.tsx("div", { class: CSS.squareTableCell })),
                    widget_1.tsx("div", { class: CSS.squareTableRow },
                        widget_1.tsx("div", { class: this.classes(CSS.squareTableCell, CSS.squareTableLabel, CSS.squareTableLabelRightTop) }, labels.bottom),
                        widget_1.tsx("div", { class: CSS.squareTableCell }),
                        widget_1.tsx("div", { class: this.classes(CSS.squareTableCell, CSS.squareTableLabel, CSS.squareTableLabelLeftTop) }, labels.right)))));
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "twoDimensionRamp", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "legendElement", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "id", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "activeLayerInfos", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "layerView", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "featureCount", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "filterMode", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "opacity", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "grayScale", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "searchViewModel", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "layerListViewModel", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "featureCountEnabled", void 0);
        RelationshipRamp = tslib_1.__decorate([
            decorators_1.subclass("RelationshipRamp")
        ], RelationshipRamp);
        return RelationshipRamp;
    }(Widget));
    return RelationshipRamp;
});
//# sourceMappingURL=RelationshipRamp.js.map