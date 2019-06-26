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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/widgets/Widget", "esri/core/accessorSupport/decorators", "esri/widgets/support/widget", "../relationshipRamp/relationshipRampUtils", "esri/core/watchUtils", "../support/styleUtils", "dojo/i18n!../../../../nls/resources"], function (require, exports, __extends, __decorate, Widget, decorators_1, widget_1, relationshipRampUtils_1, watchUtils, styleUtils_1, i18nInteractiveLegend) {
    "use strict";
    //----------------------------------
    //
    //  CSS classes
    //
    //----------------------------------
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
        __extends(RelationshipRamp, _super);
        //----------------------------------
        //
        //  Lifecycle methods
        //
        //----------------------------------
        function RelationshipRamp(value) {
            var _this = _super.call(this) || this;
            //----------------------------------
            //
            //  Variables
            //
            //----------------------------------
            _this._rampDiv = null;
            _this.twoDimensionRamp = null;
            //----------------------------------
            //
            //  Properties
            //
            //----------------------------------
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
                return (widget_1.tsx("div", null,
                    widget_1.tsx("div", { class: CSS.relationshipInstructions }, i18nInteractiveLegend.relationshipInstruction),
                    widget_1.tsx("div", { key: "" + this.id, class: CSS.diamondContainer },
                        widget_1.tsx("div", { class: CSS.diamondLeftCol }, labels.left),
                        widget_1.tsx("div", { class: CSS.diamondMidCol },
                            widget_1.tsx("div", { class: CSS.diamondMidColLabel }, labels.top),
                            widget_1.tsx("div", { class: CSS.diamondMidColRamp, bind: this._rampDiv ? this._rampDiv : null, afterCreate: this._rampDiv ? styleUtils_1.attachToNode : null }),
                            widget_1.tsx("div", { class: CSS.diamondMidColLabel }, labels.bottom)),
                        widget_1.tsx("div", { class: CSS.diamondRightCol }, labels.right))));
            }
            return (widget_1.tsx("div", null,
                widget_1.tsx("div", { class: CSS.relationshipInstructions }, i18nInteractiveLegend.relationshipInstruction),
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
        __decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "twoDimensionRamp", void 0);
        __decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "legendElement", void 0);
        __decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "id", void 0);
        __decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "activeLayerInfos", void 0);
        __decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "layerView", void 0);
        __decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "featureCount", void 0);
        __decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "filterMode", void 0);
        __decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "opacity", void 0);
        __decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "grayScale", void 0);
        __decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "searchViewModel", void 0);
        __decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "layerListViewModel", void 0);
        __decorate([
            decorators_1.property()
        ], RelationshipRamp.prototype, "featureCountEnabled", void 0);
        RelationshipRamp = __decorate([
            decorators_1.subclass("RelationshipRamp")
        ], RelationshipRamp);
        return RelationshipRamp;
    }(decorators_1.declared(Widget)));
    return RelationshipRamp;
});
//# sourceMappingURL=RelationshipRamp.js.map