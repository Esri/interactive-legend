define(["require", "exports", "./relationshipRampUtils", "../support/styleUtils", "esri/widgets/support/widget"], function (require, exports, relationshipRampUtils_1, styleUtils_1, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
        squareTableLabelRightTop: "esri-relationship-ramp--square__table-label--right-top"
    };
    function renderRelationshipRamp(legendElement, id) {
        var focus = legendElement.focus, labels = legendElement.labels;
        var isDiamond = !!focus;
        var rampDiv = relationshipRampUtils_1.renderRamp(legendElement, id);
        if (isDiamond) {
            return (widget_1.tsx("div", { class: CSS.diamondContainer },
                widget_1.tsx("div", { class: CSS.diamondLeftCol }, labels.left),
                widget_1.tsx("div", { class: CSS.diamondMidCol },
                    widget_1.tsx("div", { class: CSS.diamondMidColLabel }, labels.top),
                    widget_1.tsx("div", { class: CSS.diamondMidColRamp, bind: rampDiv, afterCreate: styleUtils_1.attachToNode }),
                    widget_1.tsx("div", { class: CSS.diamondMidColLabel }, labels.bottom)),
                widget_1.tsx("div", { class: CSS.diamondRightCol }, labels.right)));
        }
        return (widget_1.tsx("div", { class: CSS.squareTable },
            widget_1.tsx("div", { class: CSS.squareTableRow },
                widget_1.tsx("div", { class: CSS.squareTableCell + ",\n            " + CSS.squareTableLabel + ",\n            " + CSS.squareTableLabelRightBottom }, labels.left),
                widget_1.tsx("div", { class: CSS.squareTableCell }),
                widget_1.tsx("div", { class: CSS.squareTableCell + ", " + CSS.squareTableLabel + ", " + CSS.squareTableLabelLeftBottom }, labels.top)),
            widget_1.tsx("div", { class: CSS.squareTableRow },
                widget_1.tsx("div", { class: CSS.squareTableCell }),
                widget_1.tsx("div", { class: CSS.squareTableCell, bind: rampDiv, afterCreate: styleUtils_1.attachToNode }),
                widget_1.tsx("div", { class: CSS.squareTableCell })),
            widget_1.tsx("div", { class: CSS.squareTableRow },
                widget_1.tsx("div", { class: CSS.squareTableCell + " " + CSS.squareTableLabel + " " + CSS.squareTableLabelRightTop }, labels.bottom),
                widget_1.tsx("div", { class: CSS.squareTableCell }),
                widget_1.tsx("div", { class: CSS.squareTableCell + " " + CSS.squareTableLabel + " " + CSS.squareTableLabelLeftTop }, labels.right))));
    }
    exports.renderRelationshipRamp = renderRelationshipRamp;
});
//# sourceMappingURL=utils.js.map