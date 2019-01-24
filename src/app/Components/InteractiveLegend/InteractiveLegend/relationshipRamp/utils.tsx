// esri.widgets
import { RelationshipRampElement } from "../../../../interfaces/interfaces";

// esri.widgets.Legend.support
import { renderRamp } from "./relationshipRampUtils";
import { attachToNode } from "../support/styleUtils";

// esri.widgets.support
import { VNode } from "../../../../interfaces/interfaces";
//esri.widgets.support.widget
import { tsx } from "esri/widgets/support/widget";

const CSS = {
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
  squareTableLabelLeftBottom:
    "esri-relationship-ramp--square__table-label--left-bottom",
  squareTableLabelRightBottom:
    "esri-relationship-ramp--square__table-label--right-bottom",
  squareTableLabelLeftTop:
    "esri-relationship-ramp--square__table-label--left-top",
  squareTableLabelRightTop:
    "esri-relationship-ramp--square__table-label--right-top"
};

export function renderRelationshipRamp(
  legendElement: RelationshipRampElement,
  id: string
): VNode {
  const { focus, labels } = legendElement;
  const isDiamond = !!focus;
  const rampDiv = renderRamp(legendElement, id);

  if (isDiamond) {
    return (
      <div class={CSS.diamondContainer}>
        <div class={CSS.diamondLeftCol}>{labels.left}</div>
        <div class={CSS.diamondMidCol}>
          <div class={CSS.diamondMidColLabel}>{labels.top}</div>
          <div
            class={CSS.diamondMidColRamp}
            bind={rampDiv}
            afterCreate={attachToNode}
          />
          <div class={CSS.diamondMidColLabel}>{labels.bottom}</div>
        </div>
        <div class={CSS.diamondRightCol}>{labels.right}</div>
      </div>
    );
  }

  return (
    <div class={CSS.squareTable}>
      <div class={CSS.squareTableRow}>
        <div
          class={`${CSS.squareTableCell},
            ${CSS.squareTableLabel},
            ${CSS.squareTableLabelRightBottom}`}
        >
          {labels.left}
        </div>
        <div class={CSS.squareTableCell} />
        <div
          class={`${CSS.squareTableCell}, ${CSS.squareTableLabel}, ${
            CSS.squareTableLabelLeftBottom
          }`}
        >
          {labels.top}
        </div>
      </div>
      <div class={CSS.squareTableRow}>
        <div class={CSS.squareTableCell} />
        <div
          class={CSS.squareTableCell}
          bind={rampDiv}
          afterCreate={attachToNode}
        />
        <div class={CSS.squareTableCell} />
      </div>
      <div class={CSS.squareTableRow}>
        <div
          class={`${CSS.squareTableCell} ${CSS.squareTableLabel} ${
            CSS.squareTableLabelRightTop
          }`}
        >
          {labels.bottom}
        </div>
        <div class={CSS.squareTableCell} />
        <div
          class={`${CSS.squareTableCell} ${CSS.squareTableLabel} ${
            CSS.squareTableLabelLeftTop
          }`}
        >
          {labels.right}
        </div>
      </div>
    </div>
  );
}
