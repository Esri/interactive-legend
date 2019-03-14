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

// esri.views.layers.FeatureLayerView
import FeatureLayerView = require("esri/views/layers/FeatureLayerView");

// esri.core.Collection
import Collection = require("esri/core/Collection");

// esri.widgets.Legend.support.ActiveLayerInfo
import ActiveLayerInfo = require("esri/widgets/Legend/support/ActiveLayerInfo");

// import ListItem = require("esri/widgets/LayerList/ListItem");

// // esri.Graphic
// import Graphic = require("esri/Graphic");

// // esri.Color
// import Color = require("esri/Color");

// esri.widgets.LayerList.LayerListViewModel
import LayerListViewModel = require("esri/widgets/LayerList/LayerListViewModel");

// esri.views.layers.support.FeatureFilter
import FeatureFilter = require("esri/views/layers/support/FeatureFilter");

// esri.views.layers.support.FeatureEffect
import FeatureEffect = require("esri/views/layers/support/FeatureEffect");

// interfaces
import {
  FilterMode,
  InteractiveStyleData,
  LegendElement
} from "../../../../../interfaces/interfaces";

// HighLightState
// type HighLightState = "ready" | "querying" | "loading";

// State
type State = "ready" | "loading" | "disabled";

@subclass("InteractiveStyleViewModel")
class InteractiveStyleViewModel extends declared(Accessor) {
  //----------------------------------
  //
  //  Variables
  //
  //----------------------------------
  private _handles = new Handles();
  // private _querying: boolean | IPromise<any> = true;

  // interactiveStyleData
  @property()
  interactiveStyleData: InteractiveStyleData = {
    queryExpressions: []
    // highlightedFeatures: []
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
  get state(): State {
    return this.view
      ? this.get("view.ready")
        ? "ready"
        : "loading"
      : "disabled";
  }

  // // layerGraphics
  // @property()
  // layerGraphics: Collection<Graphic[]> = new Collection();

  // filterMode
  @property()
  filterMode: FilterMode = null;

  // layerListViewModel
  @property()
  layerListViewModel: LayerListViewModel = new LayerListViewModel();

  // searchExpressions
  @property()
  searchExpressions: Collection<string> = new Collection();

  // searchViewModel
  @property()
  searchViewModel: any = null;

  // opacity
  @property()
  opacity: number = null;

  // grayScale
  @property()
  grayScale: number = null;

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
          })
          // watchUtils.whenFalse(this, "view.updating", () => {
          //   this.layerListViewModel.operationalItems.forEach(() => {
          //     if (this.filterMode === "highlight") {
          //       this._queryFeatures(layerViewKey);
          //     }
          //   });
          // })
        ]);
      })
    ]);
  }

  destroy() {
    this._handles.removeAll();
    this._handles.destroy();
    // this.layerGraphics = null;
    this._handles = null;
    // this._querying = null;
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
    legendElementInfos?: any[],
    normalizationField?: string
  ): void {
    if (isPredominance) {
      const queryExpression = this._handlePredominanceExpression(
        elementInfo,
        operationalItemIndex
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
        legendElementInfos,
        normalizationField
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
    isPredominance: boolean,
    normalizationField: string
  ): void {
    if (isPredominance) {
      const queryExpression = this._handlePredominanceExpression(
        elementInfo,
        operationalItemIndex
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

      const featureLayerView = this.featureLayerViews.getItemAt(
        operationalItemIndex
      );
      const filterExpression = queryExpressions.join(" OR ");
      this._setSearchExpression(filterExpression);
      const opacity = this.opacity === null ? 30 : this.opacity;
      const grayScale = this.grayScale === null ? 100 : this.grayScale;
      featureLayerView.effect = new FeatureEffect({
        excludedEffect: `opacity(${opacity}%) grayscale(${grayScale}%)`,
        filter: {
          where: filterExpression
        }
      });
    } else {
      this._generateQueryExpressions(
        elementInfo,
        field,
        operationalItemIndex,
        legendElement,
        legendInfoIndex,
        legendElementInfos,
        normalizationField
      );
      const queryExpressions = this.interactiveStyleData.queryExpressions[
        operationalItemIndex
      ];
      const featureLayerView = this.featureLayerViews.getItemAt(
        operationalItemIndex
      );
      const filterExpression = queryExpressions.join(" OR ");
      this._setSearchExpression(filterExpression);
      const opacity = this.opacity === null ? 30 : this.opacity;
      const grayScale = this.grayScale === null ? 100 : this.grayScale;
      featureLayerView.effect = new FeatureEffect({
        excludedEffect: `opacity(${opacity}%) grayscale(${grayScale}%)`,
        filter: {
          where: filterExpression
        }
      });
    }
  }

  // // applyFeatureHighlight
  // applyFeatureHighlight(
  //   elementInfo: any,
  //   field: string,
  //   legendInfoIndex: number,
  //   operationalItemIndex: number,
  //   legendElement: LegendElement,
  //   isPredominance: boolean,
  //   legendElementInfos: any[]
  // ): void {
  //   if (isPredominance) {
  //     this._handlePredominanceHighlight(
  //       elementInfo,
  //       legendElementInfos,
  //       operationalItemIndex,
  //       legendInfoIndex
  //     );
  //   } else if (
  //     Array.isArray(elementInfo.value) &&
  //     elementInfo.value.length === 2
  //   ) {
  //     this._highlightRangeValues(
  //       legendInfoIndex,
  //       elementInfo,
  //       field,
  //       operationalItemIndex,
  //       legendElementInfos
  //     );
  //   } else {
  //     this._highlightUniqueValues(
  //       legendInfoIndex,
  //       elementInfo,
  //       field,
  //       operationalItemIndex,
  //       legendElementInfos
  //     );
  //   }

  //   this._generateQueryExpressions(
  //     elementInfo,
  //     field,
  //     operationalItemIndex,
  //     legendElement,
  //     null,
  //     legendElementInfos
  //   );
  //   const queryExpressions = this.interactiveStyleData.queryExpressions[
  //     operationalItemIndex
  //   ];
  //   const filterExpression = queryExpressions.join(" OR ");
  //   this._setSearchExpression(filterExpression);
  // }

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
      // this._queryFeatureLayerData(layerViewKey);
    });
  }

  // _setUpDataContainers
  private _setUpDataContainers(): void {
    // const { highlightedFeatures, queryExpressions } = this.interactiveStyleData;
    const { queryExpressions } = this.interactiveStyleData;

    // highlightedFeatures.push([]);
    queryExpressions.push([]);
  }

  // // _queryFeatureLayerData
  // private _queryFeatureLayerData(layerViewKey: string): void {
  //   const { _handles, layerGraphics, layerListViewModel } = this;
  //   _handles.remove(layerViewKey);
  //   layerGraphics.removeAll();
  //   layerListViewModel.operationalItems.forEach(() => {
  //     layerGraphics.add(null);
  //   });
  //   this._queryFeatures(layerViewKey);
  // }

  // // queryFeatures
  // private _queryFeatures(layerViewKey: string): void {
  //   this.featureLayerViews.forEach((layerView, layerViewIndex) => {
  //     if (layerView) {
  //       this._handles.add(
  //         watchUtils.whenFalseOnce(layerView, "updating", () => {
  //           if (!layerView) {
  //             return;
  //           }
  //           if (typeof layerView.queryFeatures !== "function") {
  //             this._querying = null;
  //             this.notifyChange("state");
  //           } else {
  //             this._querying = layerView
  //               .queryFeatures()
  //               .catch(err => {
  //                 this._querying = null;
  //                 this.notifyChange("state");
  //                 console.error("FEATURE QUERY ERROR: ", err);
  //               })
  //               .then((results: any) => {
  //                 const featureLayerViews = this.featureLayerViews.getItemAt(
  //                   layerViewIndex
  //                 );
  //                 if (
  //                   results.features &&
  //                   results.features.hasOwnProperty("length") &&
  //                   results.features.length > 0 &&
  //                   featureLayerViews.layer.id === results.features[0].layer.id
  //                 ) {
  //                   this.layerGraphics.splice(
  //                     layerViewIndex,
  //                     1,
  //                     results.features
  //                   );
  //                 }
  //                 this._querying = null;
  //                 this.notifyChange("state");
  //               });
  //           }
  //         }),
  //         layerViewKey
  //       );
  //     }
  //   });
  // }

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
    legendElementInfos?: any[],
    normalizationField?: string
  ): void {
    const queryExpression = this._generateQueryExpression(
      elementInfo,
      field,
      legendInfoIndex,
      legendElement,
      legendElementInfos,
      normalizationField
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
    legendElementInfos?: any[],
    normalizationField?: string
  ): string {
    const { value, label } = elementInfo;
    const elementInfoHasValue = elementInfo.hasOwnProperty("value")
      ? value
      : label;
    if (legendElement.type === "symbol-table") {
      // Classify data size/color ramp
      if (!elementInfo.hasOwnProperty("value")) {
        // Classify data size/color ramp - 'Other' category
        if (
          legendElementInfos[0].hasOwnProperty("value") &&
          Array.isArray(legendElementInfos[0].value) &&
          legendElementInfos[legendElementInfos.length - 2].hasOwnProperty(
            "value"
          ) &&
          Array.isArray(legendElementInfos[legendElementInfos.length - 2].value)
        ) {
          const expression = normalizationField
            ? `${normalizationField} = 0 OR ((${field}/${normalizationField}) > ${
                legendElementInfos[0].value[1]
              }) OR ((${field}/${normalizationField}) < ${
                legendElementInfos[legendElementInfos.length - 2].value[0]
              }) OR ${field} IS NULL`
            : `${field} > ${legendElementInfos[0].value[1]} OR ${field} < ${
                legendElementInfos[legendElementInfos.length - 2].value[0]
              } OR ${field} IS NULL`;
          return expression;
        } else {
          // Types unique symbols - 'Other' category
          const expressionList = [];
          legendElementInfos.forEach(legendElementInfo => {
            if (legendElementInfo.value) {
              const { value } = legendElementInfo;
              const singleQuote =
                value.indexOf("'") !== -1 ? value.split("'").join("''") : null;
              const expression = singleQuote
                ? `${field} <> '${singleQuote}'`
                : isNaN(value)
                ? `${field} <> '${value}'`
                : `${field} <> ${value} AND ${field} <> '${value}'`;
              expressionList.push(expression);
            }
          });
          const noExpression = expressionList.join(" AND ");
          return `${noExpression} OR ${field} IS NULL`;
        }
      } else if (label.indexOf(">") !== -1) {
        const expression = Array.isArray(elementInfoHasValue)
          ? normalizationField
            ? `(${field}/${normalizationField}) > ${
                elementInfoHasValue[0]
              } AND (${field}/${normalizationField})<= ${elementInfo.value[1]}`
            : `${field} > ${elementInfoHasValue[0]} AND ${field} <= ${
                elementInfo.value[1]
              }`
          : `${field} = ${elementInfoHasValue} OR ${field} = '${elementInfoHasValue}'`;
        return expression;
      } else {
        // Types unique symbols
        const singleQuote =
          elementInfoHasValue.indexOf("'") !== -1
            ? elementInfoHasValue.split("'").join("''")
            : null;
        const expression = Array.isArray(elementInfo.value)
          ? legendElementInfos.length - 1 === legendInfoIndex ||
            (!legendElementInfos[legendElementInfos.length - 1].hasOwnProperty(
              "value"
            ) &&
              legendInfoIndex === legendElementInfos.length - 2)
            ? normalizationField
              ? `(${field}/${normalizationField}) >= ${
                  elementInfoHasValue[0]
                } AND (${field}/${normalizationField})<= ${
                  elementInfo.value[1]
                }`
              : `${field} >= ${elementInfoHasValue[0]} AND ${field} <= ${
                  elementInfoHasValue[1]
                }`
            : `${field} > ${elementInfoHasValue[0]} AND ${field} <= ${
                elementInfoHasValue[1]
              }`
          : singleQuote
          ? `${field} = '${singleQuote}'`
          : isNaN(elementInfoHasValue) || !elementInfoHasValue.trim().length
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
  ): string {
    const featureLayerView = this.featureLayerViews.getItemAt(
      operationalItemIndex
    );
    const authoringInfo = featureLayerView.layer.renderer.authoringInfo as any;
    const fields = authoringInfo.fields;
    const expressionArr = [];
    if (elementInfo.hasOwnProperty("value")) {
      fields.forEach(field => {
        if (elementInfo.value === field) {
          return;
        }
        const sqlQuery = `(${
          elementInfo.value
        } > ${field} OR ${field} IS NULL)`;

        expressionArr.push(sqlQuery);
      });
      return expressionArr.join(" AND ");
    } else {
      const queryForZeroes = [];
      fields.forEach(field => {
        queryForZeroes.push(`${field} = 0`);
      });

      const otherExpression = [];
      if (fields.length > 2) {
        fields.forEach(field1 => {
          fields.forEach(field2 => {
            if (field1 === field2) {
              return;
            }
            const queryForMultiplePredominance = [];
            fields.forEach(field3 => {
              if (field1 === field3 || field2 === field3) {
                return;
              }
              queryForMultiplePredominance.push(
                `${field1} = ${field2} AND (${field1} > ${field3} OR ${field1} >= ${field3})`
              );
            });
            otherExpression.push(
              `(${queryForMultiplePredominance.join(" AND ")})`
            );
          });
        });
        return `(${queryForZeroes.join(" AND ")}) OR ${otherExpression.join(
          " OR "
        )}`;
      } else {
        const expressions = [];
        fields.forEach(field1 => {
          fields.forEach(field2 => {
            if (field1 === field2) {
              return;
            }
            expressions.push(`${field1} = ${field2}`);
            expressions.push(`(${queryForZeroes.join(" AND ")})`);
          });
        });
        return `(${expressions.join(" OR ")})`;
      }
    }
  }

  //----------------------------------
  //
  //  Highlight Methods
  //
  //----------------------------------

  // // _highlightRangeValues
  // private _highlightRangeValues(
  //   legendInfoIndex: number,
  //   elementInfo: any,
  //   field: string,
  //   operationalItemIndex: number,
  //   legendElementInfos: any[]
  // ): void {
  //   const features = [];
  //   const highlightedFeatures = this.interactiveStyleData.highlightedFeatures[
  //     operationalItemIndex
  //   ];

  //   const elementInfoValue = elementInfo.value;
  //   if (highlightedFeatures[legendInfoIndex]) {
  //     this._removeHighlight(operationalItemIndex, legendInfoIndex);
  //     return;
  //   }
  //   this.layerGraphics.getItemAt(operationalItemIndex).forEach(feature => {
  //     const fieldValue = feature.attributes[field];
  //     if (legendElementInfos.length - 1 === legendInfoIndex) {
  //       if (
  //         fieldValue >= elementInfoValue[0] &&
  //         fieldValue <= elementInfoValue[1]
  //       ) {
  //         features.push(feature);
  //       }
  //     } else {
  //       if (
  //         fieldValue > elementInfoValue[0] &&
  //         fieldValue <= elementInfoValue[1]
  //       ) {
  //         features.push(feature);
  //       }
  //     }
  //   });

  //   if (features.length === 0) {
  //     return;
  //   }
  //   const highlight = this.featureLayerViews
  //     .getItemAt(operationalItemIndex)
  //     .highlight([...features]);
  //   highlightedFeatures[legendInfoIndex] = [highlight];
  // }

  // // _highlightUniqueValue
  // private _highlightUniqueValues(
  //   legendInfoIndex: number,
  //   elementInfo: any,
  //   field: string,
  //   operationalItemIndex: number,
  //   legendElementInfos: any[]
  // ): void {
  //   const features = [];
  //   const highlightedFeatures = [];
  //   const highlightedFeatureData = this.interactiveStyleData
  //     .highlightedFeatures[operationalItemIndex];

  //   if (highlightedFeatureData[legendInfoIndex]) {
  //     highlightedFeatureData[legendInfoIndex][0].remove();
  //     highlightedFeatureData[legendInfoIndex] = null;
  //     return;
  //   }

  //   if (elementInfo.hasOwnProperty("value")) {
  //     this.layerGraphics.getItemAt(operationalItemIndex).map(feature => {
  //       const attributes = feature.attributes;

  //       if (
  //         elementInfo.value == attributes[field] ||
  //         elementInfo.value == attributes[field.toLowerCase()] ||
  //         elementInfo.value == attributes[field.toUpperCase()]
  //       ) {
  //         features.push(feature);
  //       }
  //     });
  //   } else {
  //     const elementInfoCollection = new Collection(legendElementInfos);
  //     this.layerGraphics.getItemAt(operationalItemIndex).map(feature => {
  //       const itemExists = elementInfoCollection.find(elementInfo => {
  //         if (elementInfo.value) {
  //           return elementInfo.value == feature.attributes[field];
  //         }
  //       });
  //       if (!itemExists) {
  //         features.push(feature);
  //       }
  //     });
  //   }

  //   features.forEach(feature => {
  //     highlightedFeatures.push(feature);
  //   });

  //   if (features.length === 0) {
  //     return;
  //   }
  //   const highlight = this.featureLayerViews
  //     .getItemAt(operationalItemIndex)
  //     .highlight([...highlightedFeatures]);
  //   highlightedFeatureData[legendInfoIndex] = [highlight];
  // }

  // // _handlePredominanceHighlight
  // private _handlePredominanceHighlight(
  //   elementInfo: any,
  //   legendElementInfos: any[],
  //   operationalItemIndex: number,
  //   legendInfoIndex: number
  // ): void {
  //   const predominantFeatures = this.layerGraphics.getItemAt(
  //     operationalItemIndex
  //   );
  //   const { objectIdField } = this.featureLayerViews.getItemAt(
  //     operationalItemIndex
  //   ).layer;
  //   const featuresToHighlight = [];
  //   predominantFeatures.forEach(predominantFeature => {
  //     const itemsToCompare = [];
  //     for (const attr in predominantFeature.attributes) {
  //       if (
  //         attr !== elementInfo.value &&
  //         attr !== objectIdField &&
  //         legendElementInfos.find(
  //           elementInfo => elementInfo.value === elementInfo.value
  //         )
  //       ) {
  //         const item = {};
  //         item[attr] = predominantFeature.attributes[attr];
  //         itemsToCompare.push(item);
  //       }
  //     }
  //     let pass = true;
  //     itemsToCompare.forEach(itemToCompare => {
  //       for (const key in itemToCompare) {
  //         if (
  //           predominantFeature.attributes[elementInfo.value] <
  //           itemToCompare[key]
  //         ) {
  //           pass = false;
  //           break;
  //         }
  //       }
  //     });
  //     if (pass) {
  //       featuresToHighlight.push(predominantFeature);
  //     }
  //   });
  //   this.interactiveStyleData.highlightedFeatures;

  //   const highlightedFeatures = this.interactiveStyleData.highlightedFeatures[
  //     operationalItemIndex
  //   ];
  //   const highlightedFeatureData = this.interactiveStyleData
  //     .highlightedFeatures[operationalItemIndex];
  //   if (highlightedFeatureData[legendInfoIndex]) {
  //     this._removeHighlight(operationalItemIndex, legendInfoIndex);
  //     return;
  //   }
  //   const highlight = this.featureLayerViews
  //     .getItemAt(operationalItemIndex)
  //     .highlight([...featuresToHighlight]);

  //   highlightedFeatures[legendInfoIndex] = [highlight];
  // }

  // // _removeHighlight
  // private _removeHighlight(
  //   operationalItemIndex: number,
  //   legendInfoIndex: number
  // ): void {
  //   const highlightedFeatures = this.interactiveStyleData.highlightedFeatures[
  //     operationalItemIndex
  //   ];
  //   highlightedFeatures[legendInfoIndex].forEach(feature => {
  //     feature.remove();
  //   });
  //   highlightedFeatures[legendInfoIndex] = null;
  // }

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

  // resetLegendFilter
  resetLegendFilter(featureLayerData: any, operationalItemIndex: number): void {
    this.interactiveStyleData.queryExpressions[operationalItemIndex].length = 0;
    if (this.filterMode === "featureFilter") {
      featureLayerData.featureLayerView.filter = null;
    } else if (this.filterMode === "mute") {
      featureLayerData.featureLayerView.effect = null;
    }
    if (featureLayerData.selectedInfoIndex.length) {
      featureLayerData.selectedInfoIndex.length = 0;
    }
    this._setSearchExpression(null);
    this.notifyChange("state");
  }
}

export = InteractiveStyleViewModel;
