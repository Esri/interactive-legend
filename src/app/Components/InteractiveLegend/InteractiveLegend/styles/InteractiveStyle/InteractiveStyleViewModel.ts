/// <amd-dependency path="esri/core/tsSupport/assignHelper" name="__assign" />
/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// esri.core.Accessor
import Accessor = require("esri/core/Accessor");

// esri.core.accessorSupport
import {
  property,
  subclass,
  declared
} from "esri/core/accessorSupport/decorators";

// esri.core.Handles
import Handles = require("esri/core/Handles");

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.layers.FeatureLayer
import FeatureLayer = require("esri/layers/FeatureLayer");

// esri.views.layers.FeatureLayerView
import FeatureLayerView = require("esri/views/layers/FeatureLayerView");

// esri.core.Collection
import Collection = require("esri/core/Collection");

// esri.widgets.Legend.support.ActiveLayerInfo
import ActiveLayerInfo = require("esri/widgets/Legend/support/ActiveLayerInfo");

import ListItem = require("esri/widgets/LayerList/ListItem");

// esri.Graphic
import Graphic = require("esri/Graphic");

// esri.Color
import Color = require("esri/Color");

// esri.widgets.LayerList.LayerListViewModel
import LayerListViewModel = require("esri/widgets/LayerList/LayerListViewModel");

// esri.views.layers.support.FeatureFilter
import FeatureFilter = require("esri/views/layers/support/FeatureFilter");

import FeatureEffect = require("esri/views/layers/support/FeatureEffect");

// interfaces
import {
  FilterMode,
  InteractiveStyleData,
  LegendElement
} from "../../../../../interfaces/interfaces";

// HighLightState
type HighLightState = "ready" | "querying" | "loading";

@subclass("InteractiveStyleViewModel")
class InteractiveStyleViewModel extends declared(Accessor) {
  //----------------------------------
  //
  //  Variables
  //
  //----------------------------------
  private _handles = new Handles();
  private _querying: boolean | IPromise<any> = true;

  // interactiveStyleData
  @property()
  interactiveStyleData: InteractiveStyleData = {
    queryExpressions: [],
    highlightedFeatures: []
  };

  //----------------------------------
  //
  //  Properties
  //
  //----------------------------------

  // view
  @property()
  view: MapView = null;

  // activeLayerInfos
  @property()
  activeLayerInfos: Collection<ActiveLayerInfo> = null;

  // featureLayerViews
  @property()
  featureLayerViews: Collection<FeatureLayerView> = new Collection();

  // state
  @property({
    dependsOn: ["view.updating", "searchExpressions", "layerListViewModel"],
    readOnly: true
  })
  get state(): HighLightState {
    return this.get("view.ready")
      ? this.filterMode === "highlight"
        ? this._querying
          ? "querying"
          : "ready"
        : "ready"
      : "loading";
  }

  // layerGraphics
  @property()
  layerGraphics: Collection<Graphic[]> = new Collection();

  // mutedShade
  @property()
  mutedShade: Color = null;

  // filterMode
  @property()
  filterMode: FilterMode = null;

  // layerListViewModel
  @property()
  layerListViewModel: LayerListViewModel = new LayerListViewModel();

  // searchExpressions
  @property()
  searchExpressions: Collection<string> = new Collection();

  @property()
  searchViewModel = null;

  //----------------------------------
  //
  //  Lifecycle methods
  //
  //----------------------------------

  initialize() {
    const layerViewKey = "layer-views";
    this._handles.add([
      watchUtils.init(this, "view", () => {
        if (!this.view) {
          return;
        }
        this._handles.add([
          watchUtils.whenFalseOnce(this, "view.updating", () => {
            this.layerListViewModel.operationalItems.forEach(() => {
              this.searchExpressions.add(null);
            });
            this._storeFeatureData(layerViewKey);
          }),
          watchUtils.whenFalse(this, "view.updating", () => {
            this.layerListViewModel.operationalItems.forEach(() => {
              if (this.filterMode === "highlight") {
                this._queryFeatures(layerViewKey);
              }
            });
          })
        ]);
      })
    ]);
  }

  destroy() {
    this._handles.removeAll();
    this._handles.destroy();
    this.layerGraphics = null;
    this._handles = null;
    this._querying = null;
    const { interactiveStyleData } = this;
    for (let interactiveStyleDataProp in interactiveStyleData) {
      interactiveStyleData[interactiveStyleDataProp] = null;
    }
  }

  //----------------------------------
  //
  //  Public methods
  //
  //----------------------------------

  // applyFeatureFilter
  applyFeatureFilter(
    elementInfo: any,
    field: string,
    operationalItemIndex: number,
    legendElement: LegendElement,
    legendInfoIndex: number,
    isPredominance: boolean,
    legendElementInfos?: any[]
  ): void {
    if (isPredominance) {
      const queryExpression = this._handlePredominanceExpression(
        elementInfo,
        operationalItemIndex
      ).join(" AND ");

      const queryExpressions = this.interactiveStyleData.queryExpressions[
        operationalItemIndex
      ];
      const expressionIndex = queryExpressions.indexOf(queryExpression);
      if (queryExpressions.length === 0 || expressionIndex === -1) {
        queryExpressions.push(queryExpression);
      } else {
        queryExpressions.splice(expressionIndex, 1);
      }

      const featureLayerView = this.featureLayerViews.getItemAt(
        operationalItemIndex
      );
      const filterExpression = queryExpressions.join(" OR ");
      this._setSearchExpression(filterExpression);
      featureLayerView.filter = new FeatureFilter({
        where: filterExpression
      });
    } else {
      this._generateQueryExpressions(
        elementInfo,
        field,
        operationalItemIndex,
        legendElement,
        legendInfoIndex,
        legendElementInfos
      );
      const queryExpressions = this.interactiveStyleData.queryExpressions[
        operationalItemIndex
      ];
      const featureLayerView = this.featureLayerViews.getItemAt(
        operationalItemIndex
      );
      const filterExpression = queryExpressions.join(" OR ");
      this._setSearchExpression(filterExpression);
      featureLayerView.filter = new FeatureFilter({
        where: filterExpression
      });
    }
  }

  // applyFeatureMute
  applyFeatureMute(
    elementInfo: any,
    field: string,
    legendInfoIndex: number,
    operationalItemIndex: number,
    legendElement: LegendElement,
    legendElementInfos: any[],
    isPredominance: boolean
  ): void {
    const featureLayer = this.layerListViewModel.operationalItems.getItemAt(
      operationalItemIndex
    ).layer as FeatureLayer;
    const { renderer } = featureLayer;
    if (isPredominance) {
      const queryExpression = this._handlePredominanceExpression(
        elementInfo,
        operationalItemIndex
      ).join(" AND ");

      const queryExpressions = this.interactiveStyleData.queryExpressions[
        operationalItemIndex
      ];
      const expressionIndex = queryExpressions.indexOf(queryExpression);
      if (queryExpressions.length === 0 || expressionIndex === -1) {
        queryExpressions.push(queryExpression);
      } else {
        queryExpressions.splice(expressionIndex, 1);
      }

      const featureLayerView = this.featureLayerViews.getItemAt(
        operationalItemIndex
      );
      const filterExpression = queryExpressions.join(" OR ");
      this._setSearchExpression(filterExpression);
      featureLayerView.effect = new FeatureEffect({
        outsideEffect: "opacity(30%) grayscale(100%)",
        filter: {
          where: filterExpression
        }
      });
    } else if (renderer.hasOwnProperty("uniqueValueInfos")) {
      this._muteUniqueValues(
        elementInfo,
        field,
        operationalItemIndex,
        legendElement,
        legendInfoIndex,
        legendElementInfos
      );
    } else if (
      Array.isArray(elementInfo.value) &&
      elementInfo.value.length === 2
    ) {
      this._muteRangeValues(
        elementInfo,
        field,
        operationalItemIndex,
        legendElement,
        legendInfoIndex,
        legendElementInfos
      );
    }
  }

  // applyFeatureHighlight
  applyFeatureHighlight(
    elementInfo: any,
    field: string,
    legendInfoIndex: number,
    operationalItemIndex: number,
    legendElement: LegendElement,
    isPredominance: boolean,
    legendElementInfos: any[]
  ): void {
    if (isPredominance) {
      this._handlePredominanceHighlight(
        elementInfo,
        legendElementInfos,
        operationalItemIndex,
        legendInfoIndex
      );
    } else if (
      Array.isArray(elementInfo.value) &&
      elementInfo.value.length === 2
    ) {
      this._highlightRangeValues(
        legendInfoIndex,
        elementInfo,
        field,
        operationalItemIndex,
        legendElementInfos
      );
    } else {
      this._highlightUniqueValues(
        legendInfoIndex,
        elementInfo,
        field,
        operationalItemIndex
      );
    }

    this._generateQueryExpressions(
      elementInfo,
      field,
      operationalItemIndex,
      legendElement,
      null,
      legendElementInfos
    );
    const queryExpressions = this.interactiveStyleData.queryExpressions[
      operationalItemIndex
    ];
    const filterExpression = queryExpressions.join(" OR ");
    this._setSearchExpression(filterExpression);
  }

  //----------------------------------
  //
  //  Private methods
  //
  //----------------------------------

  // _storeFeatureData
  private _storeFeatureData(layerViewKey: string): void {
    this.layerListViewModel.operationalItems.forEach(operationalItem => {
      this._setUpDataContainers();

      const featureLayerView = operationalItem.layerView as FeatureLayerView;
      this.featureLayerViews.push(featureLayerView);
      this._queryFeatureLayerData(layerViewKey);
    });
  }

  // _setUpDataContainers
  private _setUpDataContainers(): void {
    const { highlightedFeatures, queryExpressions } = this.interactiveStyleData;
    highlightedFeatures.push([]);
    queryExpressions.push([]);
  }

  // _queryFeatureLayerData
  private _queryFeatureLayerData(layerViewKey: string): void {
    const { _handles, layerGraphics, layerListViewModel } = this;
    _handles.remove(layerViewKey);
    layerGraphics.removeAll();
    layerListViewModel.operationalItems.forEach(() => {
      layerGraphics.add(null);
    });
    this._queryFeatures(layerViewKey);
  }

  // queryFeatures
  private _queryFeatures(layerViewKey: string): void {
    this.featureLayerViews.forEach((layerView, layerViewIndex) => {
      if (layerView) {
        this._handles.add(
          watchUtils.whenFalseOnce(layerView, "updating", () => {
            if (!layerView) {
              return;
            }
            if (typeof layerView.queryFeatures !== "function") {
              this._querying = null;
              this.notifyChange("state");
            } else {
              this._querying = layerView
                .queryFeatures()
                .catch(err => {
                  this._querying = null;
                  this.notifyChange("state");
                  console.error("FEATURE QUERY ERROR: ", err);
                })
                .then((results: any) => {
                  const featureLayerViews = this.featureLayerViews.getItemAt(
                    layerViewIndex
                  );
                  if (
                    results.features &&
                    results.features.hasOwnProperty("length") &&
                    results.features.length > 0 &&
                    featureLayerViews.layer.id === results.features[0].layer.id
                  ) {
                    this.layerGraphics.splice(
                      layerViewIndex,
                      1,
                      results.features
                    );
                  }
                  this._querying = null;
                  this.notifyChange("state");
                });
            }
          }),
          layerViewKey
        );
      }
    });
  }

  //----------------------------------
  //
  //  Feature Filter Methods
  //
  //----------------------------------

  // _generateQueryExpressions
  private _generateQueryExpressions(
    elementInfo: any,
    field: string,
    operationalItemIndex: number,
    legendElement: LegendElement,
    legendInfoIndex?: number,
    legendElementInfos?: any[]
  ): void {
    // debugger;
    const queryExpression = this._generateQueryExpression(
      elementInfo,
      field,
      legendInfoIndex,
      legendElement,
      legendElementInfos
    );
    const queryExpressions = this.interactiveStyleData.queryExpressions[
      operationalItemIndex
    ];
    const expressionIndex = queryExpressions.indexOf(queryExpression);
    if (queryExpressions.length === 0 || expressionIndex === -1) {
      queryExpressions.push(queryExpression);
    } else {
      queryExpressions.splice(expressionIndex, 1);
    }
  }

  // _generateQueryExpression
  private _generateQueryExpression(
    elementInfo: any,
    field: string,
    legendInfoIndex: number,
    legendElement: LegendElement,
    legendElementInfos?: any[]
  ): string {
    const { value, label } = elementInfo;
    const elementInfoHasValue = elementInfo.hasOwnProperty("value")
      ? value
      : label;

    if (legendElement.type === "symbol-table") {
      if (label.indexOf(">") !== -1) {
        return Array.isArray(elementInfoHasValue)
          ? `${field} > ${elementInfoHasValue[0]} AND ${field} <= ${
              elementInfo.value[1]
            }`
          : `${field} = ${elementInfoHasValue} OR ${field} = '${elementInfoHasValue}'`;
      } else {
        const singleQuote =
          elementInfoHasValue.indexOf("'") !== -1
            ? elementInfoHasValue.split("'").join("''")
            : null;
        const expression = Array.isArray(elementInfo.value)
          ? legendElementInfos.length - 1 === legendInfoIndex
            ? `${field} >= ${elementInfoHasValue[0]} AND ${field} <= ${
                elementInfoHasValue[1]
              }`
            : `${field} > ${elementInfoHasValue[0]} AND ${field} <= ${
                elementInfoHasValue[1]
              }`
          : singleQuote
          ? `${field} = '${singleQuote}'`
          : isNaN(elementInfoHasValue)
          ? `${field} = '${elementInfoHasValue}'`
          : `${field} = ${elementInfoHasValue} OR ${field} = '${elementInfoHasValue}'`;
        return expression;
      }
    }
  }

  // _handlePredominanceExpression
  private _handlePredominanceExpression(
    elementInfo: any,
    operationalItemIndex: number
  ): string[] {
    const featureLayerView = this.featureLayerViews.getItemAt(
      operationalItemIndex
    );
    const authoringInfo = featureLayerView.layer.renderer.authoringInfo as any;
    const fields = authoringInfo.fields;
    const expressionArr = [];
    fields.forEach(field => {
      if (elementInfo.value === field) {
        return;
      }
      expressionArr.push(`${elementInfo.value} > ${field}`);
    });

    return expressionArr;
  }

  //----------------------------------
  //
  //  Highlight Methods
  //
  //----------------------------------

  // _highlightRangeValues
  private _highlightRangeValues(
    legendInfoIndex: number,
    elementInfo: any,
    field: string,
    operationalItemIndex: number,
    legendElementInfos: any[]
  ): void {
    const features = [];
    const highlightedFeatures = this.interactiveStyleData.highlightedFeatures[
      operationalItemIndex
    ];

    const elementInfoValue = elementInfo.value;
    if (highlightedFeatures[legendInfoIndex]) {
      this._removeHighlight(operationalItemIndex, legendInfoIndex);
      return;
    }
    this.layerGraphics.getItemAt(operationalItemIndex).forEach(feature => {
      const fieldValue = feature.attributes[field];
      if (legendElementInfos.length - 1 === legendInfoIndex) {
        if (
          fieldValue >= elementInfoValue[0] &&
          fieldValue <= elementInfoValue[1]
        ) {
          features.push(feature);
        }
      } else {
        if (
          fieldValue > elementInfoValue[0] &&
          fieldValue <= elementInfoValue[1]
        ) {
          features.push(feature);
        }
      }
    });

    if (features.length === 0) {
      return;
    }
    const highlight = this.featureLayerViews
      .getItemAt(operationalItemIndex)
      .highlight([...features]);
    highlightedFeatures[legendInfoIndex] = [highlight];
  }

  // _highlightUniqueValue
  private _highlightUniqueValues(
    legendInfoIndex: number,
    elementInfo: any,
    field: string,
    operationalItemIndex: number
  ): void {
    const features = [];
    const highlightedFeatures = [];
    const highlightedFeatureData = this.interactiveStyleData
      .highlightedFeatures[operationalItemIndex];

    if (highlightedFeatureData[legendInfoIndex]) {
      highlightedFeatureData[legendInfoIndex][0].remove();
      highlightedFeatureData[legendInfoIndex] = null;
      return;
    }
    this.layerGraphics.getItemAt(operationalItemIndex).map(feature => {
      const attributes = feature.attributes;

      if (
        elementInfo.value == attributes[field] ||
        elementInfo.value == attributes[field.toLowerCase()] ||
        elementInfo.value == attributes[field.toUpperCase()]
      ) {
        features.push(feature);
      }
    });

    features.forEach(feature => {
      highlightedFeatures.push(feature);
    });

    if (features.length === 0) {
      return;
    }
    const highlight = this.featureLayerViews
      .getItemAt(operationalItemIndex)
      .highlight([...highlightedFeatures]);
    highlightedFeatureData[legendInfoIndex] = [highlight];
  }

  // _handlePredominanceHighlight
  private _handlePredominanceHighlight(
    elementInfo: any,
    legendElementInfos: any[],
    operationalItemIndex: number,
    legendInfoIndex: number
  ): void {
    const predominantFeatures = this.layerGraphics.getItemAt(
      operationalItemIndex
    );
    const { objectIdField } = this.featureLayerViews.getItemAt(
      operationalItemIndex
    ).layer;
    const featuresToHighlight = [];
    predominantFeatures.forEach(predominantFeature => {
      const itemsToCompare = [];
      for (const attr in predominantFeature.attributes) {
        if (
          attr !== elementInfo.value &&
          attr !== objectIdField &&
          legendElementInfos.find(
            elementInfo => elementInfo.value === elementInfo.value
          )
        ) {
          const item = {};
          item[attr] = predominantFeature.attributes[attr];
          itemsToCompare.push(item);
        }
      }
      let pass = true;
      itemsToCompare.forEach(itemToCompare => {
        for (const key in itemToCompare) {
          if (
            predominantFeature.attributes[elementInfo.value] <
            itemToCompare[key]
          ) {
            pass = false;
            break;
          }
        }
      });
      if (pass) {
        featuresToHighlight.push(predominantFeature);
      }
    });
    this.interactiveStyleData.highlightedFeatures;

    const highlightedFeatures = this.interactiveStyleData.highlightedFeatures[
      operationalItemIndex
    ];
    const highlightedFeatureData = this.interactiveStyleData
      .highlightedFeatures[operationalItemIndex];
    if (highlightedFeatureData[legendInfoIndex]) {
      this._removeHighlight(operationalItemIndex, legendInfoIndex);
      return;
    }
    const highlight = this.featureLayerViews
      .getItemAt(operationalItemIndex)
      .highlight([...featuresToHighlight]);

    highlightedFeatures[legendInfoIndex] = [highlight];
  }

  // _removeHighlight
  private _removeHighlight(
    operationalItemIndex: number,
    legendInfoIndex: number
  ): void {
    const highlightedFeatures = this.interactiveStyleData.highlightedFeatures[
      operationalItemIndex
    ];
    highlightedFeatures[legendInfoIndex].forEach(feature => {
      feature.remove();
    });
    highlightedFeatures[legendInfoIndex] = null;
  }

  //----------------------------------
  //
  //  Mute Methods
  //
  //----------------------------------

  private _muteUniqueValues(
    elementInfo: any,
    field: string,
    operationalItemIndex: number,
    legendElement: LegendElement,
    legendInfoIndex: number,
    legendElementInfos: any[]
  ): void {
    this._generateQueryExpressions(
      elementInfo,
      field,
      operationalItemIndex,
      legendElement,
      legendInfoIndex,
      legendElementInfos
    );
    const queryExpressions = this.interactiveStyleData.queryExpressions[
      operationalItemIndex
    ];
    const featureLayerView = this.featureLayerViews.getItemAt(
      operationalItemIndex
    );
    const filterExpression = queryExpressions.join(" OR ");
    this._setSearchExpression(filterExpression);

    featureLayerView.effect = new FeatureEffect({
      outsideEffect: "opacity(30%) grayscale(100%)",
      filter: {
        where: filterExpression
      }
    });
  }

  // _muteRangeValues
  private _muteRangeValues(
    elementInfo: any,
    field: string,
    operationalItemIndex: number,
    legendElement: LegendElement,
    legendInfoIndex: number,
    legendElementInfos: any[]
  ): void {
    this._generateQueryExpressions(
      elementInfo,
      field,
      operationalItemIndex,
      legendElement,
      legendInfoIndex,
      legendElementInfos
    );
    const queryExpressions = this.interactiveStyleData.queryExpressions[
      operationalItemIndex
    ];
    const featureLayerView = this.featureLayerViews.getItemAt(
      operationalItemIndex
    );
    const filterExpression = queryExpressions.join(" OR ");
    this._setSearchExpression(filterExpression);
    featureLayerView.effect = new FeatureEffect({
      outsideEffect: "opacity(30%) grayscale(100%)",
      filter: {
        where: filterExpression
      }
    });
  }

  // End of filter methods

  // _setSearchExpression
  private _setSearchExpression(filterExpression: string): void {
    if (!this.searchViewModel) {
      return;
    }
    this.searchViewModel.sources.forEach(searchSource => {
      this.layerListViewModel.operationalItems.forEach(operationalItem => {
        if (
          searchSource.layer &&
          searchSource.layer.id === operationalItem.layer.id
        ) {
          if (filterExpression) {
            searchSource.filter = {
              where: filterExpression
            };
          } else {
            searchSource.filter = null;
          }
        }
      });
    });
  }
}

export = InteractiveStyleViewModel;
