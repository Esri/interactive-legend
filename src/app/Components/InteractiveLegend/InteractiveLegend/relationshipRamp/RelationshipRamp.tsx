/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// esri.widgets.Widget
import Widget = require("esri/widgets/Widget");

// esri.core.accessorSupport
import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

// esri.widgets.support
import { tsx } from "esri/widgets/support/widget";

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.core.Collection
import Collection = require("esri/core/Collection");

// esri.widgets.Legend.support.ActiveLayerInfo
import ActiveLayerInfo = require("esri/widgets/Legend/support/ActiveLayerInfo");

// esri.views.layers.FeatureLayerView
import FeatureLayerView = require("esri/views/layers/FeatureLayerView");

import Ramp = require("./Ramp");

// relationshipRampUtils
import { renderRamp } from "../relationshipRamp/relationshipRampUtils";

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

// styleUtils
import { attachToNode } from "../support/styleUtils";

// interfaces
import { RelationshipRampElement } from "../../../../interfaces/interfaces";

import * as i18nInteractiveLegend from "dojo/i18n!../../../../nls/resources";

//----------------------------------
//
//  CSS classes
//
//----------------------------------
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
    "esri-relationship-ramp--square__table-label--right-top",
  // custom
  relationshipInstructions: "esri-interactive-legend__relationship-instructions"
};

@subclass("RelationshipRamp")
class RelationshipRamp extends declared(Widget) {
  //----------------------------------
  //
  //  Variables
  //
  //----------------------------------
  private _rampDiv: HTMLElement = null;

  @property()
  twoDimensionRamp: Ramp = null;

  //----------------------------------
  //
  //  Properties
  //
  //----------------------------------

  // view
  @property()
  view: MapView = null;

  // legendElement
  @property()
  legendElement: RelationshipRampElement = null;

  // id
  @property()
  id: string = null;

  // activeLayerInfos
  @property()
  activeLayerInfos: Collection<ActiveLayerInfo> = null;

  // layerView
  @property()
  layerView: FeatureLayerView = null;

  // featureCount
  @property()
  featureCount: number = null;

  // filterMode
  @property()
  filterMode: string = null;

  // opacity
  @property()
  opacity: number = null;

  // grayScale
  @property()
  grayScale: number = null;

  @property()
  searchViewModel: __esri.SearchViewModel = null;

  @property()
  layerListViewModel: __esri.LayerListViewModel = null;

  @property()
  featureCountEnabled: boolean = null;

  //----------------------------------
  //
  //  Lifecycle methods
  //
  //----------------------------------

  constructor(value?: any) {
    super();
  }

  postInitialize() {
    this.own([
      watchUtils.init(this, "activeLayerInfos", () => {
        this.activeLayerInfos.forEach(() => {
          if (!this._rampDiv) {
            this.twoDimensionRamp = renderRamp(
              this.legendElement,
              this.id,
              this.view,
              this.activeLayerInfos,
              this.layerView,
              this.filterMode,
              this.opacity,
              this.grayScale,
              this.searchViewModel,
              this.layerListViewModel,
              this.featureCountEnabled
            );
            this._rampDiv = this.twoDimensionRamp.rampDiv;
          } else {
            if (this.twoDimensionRamp) {
              this.twoDimensionRamp.shape.layerView = this.layerView;
              this.featureCount = this.twoDimensionRamp.shape.layerView;
            }
          }
        });
      })
    ]);
  }

  render() {
    const { focus, labels } = this.legendElement;
    const isDiamond = !!focus;
    if (isDiamond) {
      return (
        <div>
          <div class={CSS.relationshipInstructions}>
            {i18nInteractiveLegend.relationshipInstruction}
          </div>
          <div key={`${this.id}`} class={CSS.diamondContainer}>
            <div class={CSS.diamondLeftCol}>{labels.left}</div>
            <div class={CSS.diamondMidCol}>
              <div class={CSS.diamondMidColLabel}>{labels.top}</div>
              <div
                class={CSS.diamondMidColRamp}
                bind={this._rampDiv ? this._rampDiv : null}
                afterCreate={this._rampDiv ? attachToNode : null}
              />
              <div class={CSS.diamondMidColLabel}>{labels.bottom}</div>
            </div>
            <div class={CSS.diamondRightCol}>{labels.right}</div>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div class={CSS.relationshipInstructions}>
          {i18nInteractiveLegend.relationshipInstruction}
        </div>
        <div class={CSS.squareTable}>
          <div class={CSS.squareTableRow}>
            <div
              class={this.classes(
                CSS.squareTableCell,
                CSS.squareTableLabel,
                CSS.squareTableLabelRightBottom
              )}
            >
              {labels.left}
            </div>
            <div class={CSS.squareTableCell} />
            <div
              class={this.classes(
                CSS.squareTableCell,
                CSS.squareTableLabel,
                CSS.squareTableLabelLeftBottom
              )}
            >
              {labels.top}
            </div>
          </div>
          <div class={CSS.squareTableRow}>
            <div class={CSS.squareTableCell} />
            <div
              class={CSS.squareTableCell}
              bind={this._rampDiv ? this._rampDiv : null}
              afterCreate={this._rampDiv ? attachToNode : null}
            />
            <div class={CSS.squareTableCell} />
          </div>
          <div class={CSS.squareTableRow}>
            <div
              class={this.classes(
                CSS.squareTableCell,
                CSS.squareTableLabel,
                CSS.squareTableLabelRightTop
              )}
            >
              {labels.bottom}
            </div>
            <div class={CSS.squareTableCell} />
            <div
              class={this.classes(
                CSS.squareTableCell,
                CSS.squareTableLabel,
                CSS.squareTableLabelLeftTop
              )}
            >
              {labels.right}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export = RelationshipRamp;
