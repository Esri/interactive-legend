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

// esri.widgets.LayerList.LayerListViewModel
import LayerListViewModel = require("esri/widgets/LayerList/LayerListViewModel");

// esri.views.layers.support.FeatureFilter
import FeatureFilter = require("esri/views/layers/support/FeatureFilter");

// esri.views.layers.support.FeatureEffect
import FeatureEffect = require("esri/views/layers/support/FeatureEffect");

// esri.tasks.support.Query
import Query = require("esri/tasks/support/Query");

// InteractiveStyleData
import InteractiveStyleData = require("./InteractiveStyleData");

// interfaces
import {
  FilterMode,
  LegendElement
} from "../../../../../interfaces/interfaces";
import SelectedStyleData = require("./SelectedStyleData");

import promiseUtils = require("esri/core/promiseUtils");

// State
type State = "ready" | "loading" | "disabled" | "querying";

@subclass("InteractiveStyleViewModel")
class InteractiveStyleViewModel extends declared(Accessor) {
  //----------------------------------
  //
  //  Variables
  //
  //----------------------------------
  private _handles = new Handles();

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

  // interactiveStyleData
  @property()
  interactiveStyleData: InteractiveStyleData = new InteractiveStyleData();

  // featureLayerViews
  @property()
  featureLayerViews: Collection<FeatureLayerView> = new Collection();

  @property()
  featureCountQuery = null;

  // state
  @property({
    dependsOn: [
      "view.updating",
      "searchExpressions",
      "layerListViewModel",
      "featureCountQuery"
    ],
    readOnly: true
  })
  get state(): State {
    return this.view
      ? this.get("view.ready")
        ? this.featureCountQuery
          ? "querying"
          : "ready"
        : "loading"
      : "disabled";
  }

  // selectedStyleDataCollection
  @property()
  selectedStyleDataCollection: Collection<SelectedStyleData> = new Collection();

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
  searchViewModel: __esri.SearchViewModel = null;

  // opacity
  @property()
  opacity: number = null;

  // grayScale
  @property()
  grayScale: number = null;

  @property()
  featureCountEnabled: boolean = null;

  @property()
  updateExtentEnabled: boolean = null;

  //----------------------------------
  //
  //  Lifecycle methods
  //
  //----------------------------------

  initialize() {
    const disableClusteringKey = "disable-clustering";
    this._handles.add(
      watchUtils.when(this, "view.map.allLayers", () => {
        this._disableClustering(disableClusteringKey);
      }),
      disableClusteringKey
    );

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
            this._storeFeatureData();
          })
        ]);
      }),
      watchUtils.on(this, "featureLayerViews", "change", () => {
        this.selectedStyleDataCollection.removeAll();
        const selectedStyleDataCollection = [];
        this.featureLayerViews.forEach(
          (featureLayerView: __esri.FeatureLayerView) => {
            if (!featureLayerView) {
              selectedStyleDataCollection.push(null);
            } else {
              const featureLayer = featureLayerView.get(
                  "layer"
                ) as __esri.FeatureLayer,
                renderer = featureLayer.get("renderer") as any,
                field = renderer && renderer.get("field"),
                field2 = renderer && renderer.get("field2"),
                field3 = renderer && renderer.get("field3"),
                fieldDelimiter = renderer && renderer.get("fieldDelimiter"),
                normalizationField =
                  renderer && renderer.get("normalizationField"),
                normalizationType =
                  renderer && renderer.get("normalizationType"),
                hasCustomArcade =
                  (field2 || field3) && fieldDelimiter ? true : false,
                invalidNormalization =
                  normalizationType === "percent-of-total" ||
                  normalizationType === "log";

              if (hasCustomArcade || invalidNormalization) {
                selectedStyleDataCollection.push(null);
              } else {
                const selectedStyleData = new SelectedStyleData({
                  layerItemId: featureLayer.id,
                  field,
                  selectedInfoIndex: [],
                  applyStyles: null,
                  featureLayerView,
                  normalizationField
                });
                selectedStyleDataCollection.push(selectedStyleData);
              }
            }
          }
        );
        this.selectedStyleDataCollection.addMany([
          ...selectedStyleDataCollection
        ]);
      })
    ]);
  }

  destroy() {
    this._handles.removeAll();
    this._handles.destroy();
    this._handles = null;
    this.interactiveStyleData.destroy();
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
    const queryExpressionsCollection = this.interactiveStyleData.get(
      "queryExpressions"
    ) as __esri.Collection;
    const queryExpressions = queryExpressionsCollection.getItemAt(
      operationalItemIndex
    );
    if (isPredominance) {
      const queryExpression = this._handlePredominanceExpression(
        elementInfo,
        operationalItemIndex
      );

      const expressionIndex = queryExpressions.indexOf(queryExpression);
      if (queryExpressions.length === 0 || expressionIndex === -1) {
        if (queryExpressions && queryExpressions[0] === "1=0") {
          queryExpressions.splice(0, 1);
        }
        queryExpressions.push(queryExpression);
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression === queryExpressions[0]
      ) {
        queryExpressions[0] = "1=0";
      } else if (queryExpressions && queryExpressions.length === 1) {
        queryExpressions[0] = [queryExpression];
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression !== queryExpressions[0] &&
        queryExpressions[0] === "1=0"
      ) {
        queryExpressions[0] = [queryExpression];
        // queryExpressions.push(queryExpression);
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression === queryExpressions[0] &&
        queryExpressions[0] === "1=0"
      ) {
        queryExpressions[0] = [];
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
    const queryExpressionsCollection = this.interactiveStyleData.get(
      "queryExpressions"
    ) as __esri.Collection;
    const queryExpressions = queryExpressionsCollection.getItemAt(
      operationalItemIndex
    );

    const { opacity, grayScale } = this;

    const opacityValue = opacity === null ? 30 : opacity;
    const grayScaleValue = grayScale === null ? 100 : grayScale;
    if (isPredominance) {
      const queryExpression = this._handlePredominanceExpression(
        elementInfo,
        operationalItemIndex
      );

      const expressionIndex = queryExpressions.indexOf(queryExpression);
      if (queryExpressions.length === 0 || expressionIndex === -1) {
        if (queryExpressions && queryExpressions[0] === "1=0") {
          queryExpressions.splice(0, 1);
        }
        queryExpressions.push(queryExpression);
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression === queryExpressions[0]
      ) {
        queryExpressions[0] = "1=0";
      } else if (queryExpressions && queryExpressions.length === 1) {
        queryExpressions[0] = [queryExpression];
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression !== queryExpressions[0] &&
        queryExpressions[0] === "1=0"
      ) {
        queryExpressions[0] = [queryExpression];
        // queryExpressions.push(queryExpression);
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression === queryExpressions[0] &&
        queryExpressions[0] === "1=0"
      ) {
        queryExpressions[0] = [];
      } else {
        queryExpressions.splice(expressionIndex, 1);
      }

      const featureLayerView = this.featureLayerViews.getItemAt(
        operationalItemIndex
      );
      const filterExpression = queryExpressions.join(" OR ");
      this._setSearchExpression(filterExpression);

      featureLayerView.effect = new FeatureEffect({
        excludedEffect: `opacity(${opacityValue}%) grayscale(${grayScaleValue}%)`,
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

      const featureLayerView = this.featureLayerViews.getItemAt(
        operationalItemIndex
      );
      const filterExpression = queryExpressions.join(" OR ");
      this._setSearchExpression(filterExpression);

      featureLayerView.effect = new FeatureEffect({
        excludedEffect: `opacity(${opacityValue}%) grayscale(${grayScaleValue}%)`,
        filter: {
          where: filterExpression
        }
      });
    }
  }

  // resetLegendFilter
  resetLegendFilter(featureLayerData: any, operationalItemIndex: number): void {
    const { featureLayerView, selectedInfoIndex } = featureLayerData;
    const queryExpressionsCollection = this.interactiveStyleData.get(
      "queryExpressions"
    ) as __esri.Collection;
    const queryExpressions = queryExpressionsCollection.getItemAt(
      operationalItemIndex
    );
    if (queryExpressions) {
      queryExpressions.length = 0;
    }

    if (this.filterMode === "featureFilter") {
      featureLayerView.filter = null;
    } else if (this.filterMode === "mute") {
      featureLayerView.effect = null;
    }
    if (selectedInfoIndex.length) {
      selectedInfoIndex.length = 0;
    }
    this._setSearchExpression(null);
    this.notifyChange("state");
  }

  // FEATURE COUNT METHODS

  queryFeatureCount(
    elementInfo: any,
    field: string,
    legendInfoIndex: number,
    operationalItemIndex: number,
    legendElement: LegendElement,
    isPredominance: boolean,
    legendElementIndex: number,
    legendElementInfos?: any[],
    normalizationField?: string,
    generateFeatureCountExpression?: boolean
  ) {
    const { featureCount, totalFeatureCount } = this.interactiveStyleData;

    if (!featureCount.getItemAt(operationalItemIndex)) {
      featureCount.add(new Collection(), operationalItemIndex);
    }
    if (totalFeatureCount[operationalItemIndex] === undefined) {
      totalFeatureCount[operationalItemIndex] = null;
    }

    const featureLayerView = this.featureLayerViews.getItemAt(
      operationalItemIndex
    );

    const handlesKey = featureLayerView
      ? `${featureLayerView.layer.id}-${legendInfoIndex}`
      : null;

    if (!this._handles.has(handlesKey)) {
      const queryFeatureCount = promiseUtils.debounce(() => {
        const queryExpression = this._generateQueryCountExpression(
          elementInfo,
          field,
          legendInfoIndex,
          operationalItemIndex,
          legendElement,
          isPredominance,
          legendElementInfos,
          normalizationField,
          generateFeatureCountExpression
        );
        const query = this._generateFeatureCountQuery(queryExpression);
        this.featureCountQuery =
          featureLayerView &&
          featureLayerView.queryFeatureCount &&
          featureLayerView.queryFeatureCount(query);

        if (!this.featureCountQuery) {
          return;
        }
        const featureCountValue = featureCount.getItemAt(operationalItemIndex);
        return this.featureCountQuery.then(featureCountRes => {
          if (featureCountValue) {
            featureCountValue.removeAt(legendInfoIndex);
          }
          featureCountValue.add(featureCountRes, legendInfoIndex);
          const selectedInfoLength = this.selectedStyleDataCollection.getItemAt(
            operationalItemIndex
          ).selectedInfoIndex.length;
          if (selectedInfoLength === 0) {
            this.queryTotalFeatureCount(operationalItemIndex);
          } else {
            this.updateTotalFeatureCount(
              operationalItemIndex,
              legendElementIndex
            );
          }
          this.featureCountQuery = null;
          this.notifyChange("state");
        });
      });

      this._handles.add(
        [
          watchUtils.whenFalse(this.view, "stationary", () => {
            if (!this.view.stationary) {
              watchUtils.whenTrueOnce(this.view, "stationary", () => {
                queryFeatureCount();
              });
            } else {
              watchUtils.whenFalseOnce(this.view, "interacting", () => {
                queryFeatureCount();
              });
            }
          }),
          watchUtils.whenFalse(featureLayerView, "updating", () => {
            watchUtils.whenFalseOnce(featureLayerView, "updating", () => {
              queryFeatureCount();
            });
          })
        ],
        handlesKey
      );
    }
  }

  private _generateFeatureCountQuery(queryExpression: string): __esri.Query {
    const geometry = this.view && this.view.get("extent");

    const outSpatialReference = this.view && this.view.get("spatialReference");

    return new Query({
      where: queryExpression,
      geometry,
      outSpatialReference
    });
  }

  // queryTotalFeatureCount
  queryTotalFeatureCount(operationalItemIndex: number): void {
    const { totalFeatureCount } = this.interactiveStyleData;
    const featureCountCollection = this.interactiveStyleData.get(
      "featureCount"
    ) as __esri.Collection;

    const featureCount = featureCountCollection.getItemAt(operationalItemIndex);
    totalFeatureCount[operationalItemIndex] = null;

    const queryExpressionsCollection = this.interactiveStyleData.get(
      "queryExpressions"
    ) as __esri.Collection;

    const queryExpressions = queryExpressionsCollection.getItemAt(
      operationalItemIndex
    );

    if (queryExpressions && queryExpressions[0] === "1=0") {
      totalFeatureCount[operationalItemIndex] = 0;
    } else if (featureCount) {
      featureCount.forEach(count => {
        totalFeatureCount[operationalItemIndex] += count;
      });
    }

    this.notifyChange("state");
  }

  // updateTotalFeatureCount
  updateTotalFeatureCount(
    operationalItemIndex: number,
    legendElementIndex: number
  ): void {
    const selectedInfoIndexes = this.selectedStyleDataCollection.getItemAt(
      operationalItemIndex
    ).selectedInfoIndex[legendElementIndex];
    if (selectedInfoIndexes && selectedInfoIndexes.length === 0) {
      this.queryTotalFeatureCount(operationalItemIndex);
    } else {
      const { totalFeatureCount } = this.interactiveStyleData;
      totalFeatureCount[operationalItemIndex] = null;
      const featureCount = this.interactiveStyleData.featureCount.getItemAt(
        operationalItemIndex
      );

      featureCount.forEach((count, countIndex) => {
        selectedInfoIndexes.forEach(selectedIndex => {
          if (countIndex === selectedIndex) {
            totalFeatureCount[operationalItemIndex] += count;
          }
        });
      });
    }
    this.notifyChange("state");
  }

  // updateExtentToAllFeatures

  // LIMITATION: When complex expressions (normalized fields) are queried against feature services that have Use Standardized Queries set to false - update extent cannot be applied.
  updateExtentToAllFeatures(operationalItemIndex: number): void {
    const layerView = this.featureLayerViews.getItemAt(operationalItemIndex);
    const filterWhere = layerView.get("filter.where");
    const effectWhere = layerView.get("effect.filter.where");
    const featureLayer = this.featureLayerViews.getItemAt(operationalItemIndex)
      .layer;
    const query = new Query();
    const queryExpressions =
      this.filterMode === "featureFilter" ? filterWhere : effectWhere;
    const whereClause = queryExpressions ? `${queryExpressions}` : "1=1";
    query.where = whereClause;
    query.outSpatialReference = this.view.spatialReference;
    featureLayer
      .queryExtent(query)
      .catch(err => {
        console.error("ERROR: ", err);
      })
      .then(extent => {
        this.view.goTo(extent);
      });
  }

  //----------------------------------
  //
  //  Private methods
  //
  //----------------------------------

  // _storeFeatureData
  private _storeFeatureData(): void {
    this.layerListViewModel.operationalItems.forEach(operationalItem => {
      this._setUpDataContainers();
      const featureLayerView = operationalItem.layerView as FeatureLayerView;
      this.featureLayerViews.push(featureLayerView);
    });
  }

  // _setUpDataContainers
  private _setUpDataContainers(): void {
    const { queryExpressions } = this.interactiveStyleData;
    queryExpressions.add([]);
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
    legendElementInfos?: any[],
    normalizationField?: string,
    generateFeatureCountExpression?: boolean
  ): string {
    const queryExpression = this._generateQueryExpression(
      elementInfo,
      field,
      legendInfoIndex,
      legendElement,
      legendElementInfos,
      normalizationField
    );

    if (!generateFeatureCountExpression) {
      const hasOneValue = legendElementInfos && legendElementInfos.length === 1;

      const queryExpressionsCollection = this.interactiveStyleData.get(
        "queryExpressions"
      ) as __esri.Collection;

      const queryExpressions = queryExpressionsCollection.getItemAt(
        operationalItemIndex
      );

      const expressionIndex = queryExpressions.indexOf(queryExpression);
      if (queryExpressions.length === 0 || expressionIndex === -1) {
        if (queryExpressions && queryExpressions[0] === "1=0") {
          queryExpressions.splice(0, 1);
        }
        queryExpressions.push(queryExpression);
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression === queryExpressions[0] &&
        !hasOneValue
      ) {
        queryExpressions[0] = "1=0";
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        !hasOneValue
      ) {
        queryExpressions[0] = [queryExpression];
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression !== queryExpressions[0] &&
        queryExpressions[0] === "1=0" &&
        !hasOneValue
      ) {
        queryExpressions[0] = [queryExpression];
        // queryExpressions.push(queryExpression);
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression === queryExpressions[0] &&
        queryExpressions[0] === "1=0" &&
        !hasOneValue
      ) {
        queryExpressions[0] = [];
      } else {
        queryExpressions.splice(expressionIndex, 1);
      }
    } else {
      return queryExpression;
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
    const { value } = elementInfo;
    if (legendElement.type === "symbol-table") {
      // Classify data size/color ramp
      if (
        !elementInfo.hasOwnProperty("value") ||
        (Array.isArray(elementInfo.value) && legendElementInfos.length === 1)
      ) {
        // Classify data size/color ramp - 'Other' category
        if (
          legendElementInfos[0].hasOwnProperty("value") &&
          Array.isArray(legendElementInfos[0].value) &&
          legendElementInfos[legendElementInfos.length - 2] &&
          legendElementInfos[legendElementInfos.length - 2].hasOwnProperty(
            "value"
          ) &&
          Array.isArray(legendElementInfos[legendElementInfos.length - 2].value)
        ) {
          const expression = normalizationField
            ? `((${field}/${normalizationField}) > ${
                legendElementInfos[0].value[1]
              }) OR ((${field}/${normalizationField}) < ${
                legendElementInfos[legendElementInfos.length - 2].value[0]
              }) OR ${normalizationField} = 0 OR ${normalizationField} IS NULL`
            : `${field} > ${legendElementInfos[0].value[1]} OR ${field} < ${
                legendElementInfos[legendElementInfos.length - 2].value[0]
              } OR ${field} IS NULL`;
          return expression;
        } else if (legendElementInfos.length === 1) {
          return "1=0";
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
      } else {
        const singleQuote =
          value.indexOf("'") !== -1 ? value.split("'").join("''") : null;
        const isArray = Array.isArray(elementInfo.value);
        const isLastElement = legendElementInfos.length - 1 === legendInfoIndex;
        const lastElementAndNoValue = !legendElementInfos[
          legendElementInfos.length - 1
        ].hasOwnProperty("value");
        const secondToLastElement =
          legendInfoIndex === legendElementInfos.length - 2;
        const expression = isArray
          ? normalizationField
            ? isLastElement || (lastElementAndNoValue && secondToLastElement)
              ? `(${field}/${normalizationField}) >= ${value[0]} AND (${field}/${normalizationField}) <= ${elementInfo.value[1]}`
              : `(${field}/${normalizationField}) > ${value[0]} AND (${field}/${normalizationField}) <= ${elementInfo.value[1]}`
            : isLastElement || (lastElementAndNoValue && secondToLastElement)
            ? `${field} >= ${value[0]} AND ${field} <= ${value[1]}`
            : `${field} > ${value[0]} AND ${field} <= ${value[1]}`
          : legendElementInfos.length === 1 && field
          ? isNaN(value) || !value.trim().length
            ? `${field} <> '${value}'`
            : `${field} <> ${value} OR ${field} <> '${value}'`
          : singleQuote
          ? `${field} = '${singleQuote}'`
          : isNaN(value) || !value.trim().length
          ? `${field} = '${value}'`
          : `${field} = ${value} OR ${field} = '${value}'`;

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
    const authoringInfo = featureLayerView
      ? (featureLayerView.layer.renderer.authoringInfo as any)
      : null;
    const fields = authoringInfo ? authoringInfo.fields : null;
    const expressionArr = [];
    if (!fields) {
      return;
    }
    if (elementInfo.hasOwnProperty("value")) {
      fields.forEach(field => {
        if (elementInfo.value === field) {
          return;
        }
        const sqlQuery = `(${elementInfo.value} > ${field} OR (${field} IS NULL AND ${elementInfo.value} <> 0 AND ${elementInfo.value} IS NOT NULL))`;

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

        const isNull = [];

        fields.forEach(field => {
          isNull.push(`${field} IS NULL`);
        });
        const generatedOtherExpression = `(${queryForZeroes.join(
          " AND "
        )}) OR (${otherExpression.join(" OR ")}) OR (${isNull.join(" AND ")})`;
        return generatedOtherExpression;
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

        const zeroAndNull = [];
        fields.forEach(field1 => {
          fields.forEach(field2 => {
            if (field1 === field2) {
              return;
            }
            zeroAndNull.push(
              `(${field1} = 0 AND ${field2} IS NULL) OR (${field1} IS NULL AND ${field2} IS NULL)`
            );
          });
        });

        return `(${expressions.join(" OR ")}) OR (${zeroAndNull.join(" OR ")})`;
      }
    }
  }

  // _generateQueryCountExpression
  private _generateQueryCountExpression(
    elementInfo: any,
    field: string,
    legendInfoIndex: number,
    operationalItemIndex: number,
    legendElement: LegendElement,
    isPredominance: boolean,
    legendElementInfos?: any[],
    normalizationField?: string,
    generateFeatureCountExpression?: boolean
  ): string {
    const singleSymbol = legendElementInfos.length === 1;
    if (!singleSymbol) {
      if (isPredominance) {
        const predominanceExpression = this._handlePredominanceExpression(
          elementInfo,
          operationalItemIndex
        );
        return predominanceExpression;
      } else {
        return this._generateQueryExpressions(
          elementInfo,
          field,
          operationalItemIndex,
          legendElement,
          legendInfoIndex,
          legendElementInfos,
          normalizationField,
          generateFeatureCountExpression
        );
      }
    } else {
      const queryExpressionCollection = this.interactiveStyleData.get(
        "queryExpressions"
      ) as __esri.Collection;
      const queryExpressions = queryExpressionCollection.getItemAt(
        operationalItemIndex
      );
      const expression = queryExpressions[0];

      if (
        (expression && expression === "1=0") ||
        (expression && expression.indexOf("<>"))
      ) {
        return "1=0";
      } else {
        return "1=1";
      }
    }
  }

  // _setSearchExpression
  private _setSearchExpression(filterExpression: string): void {
    if (!this.searchViewModel) {
      return;
    }

    this.searchViewModel.sources.forEach(
      (searchSource: __esri.LayerSearchSource) => {
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
      }
    );
  }

  // _disableClustering
  private _disableClustering(disableClusteringKey: string): void {
    const allLayers = this.get("view.map.allLayers") as __esri.Collection<
      __esri.Layer
    >;

    const layerPromises = [];

    allLayers.forEach(layer => {
      layerPromises.push(
        layer.load().then(loadedLayer => {
          return loadedLayer;
        })
      );
    });

    Promise.all(layerPromises).then(layers => {
      layers.forEach(layerItem => {
        if (layerItem && layerItem.get("featureReduction")) {
          layerItem.set("featureReduction", null);
        }
      });
      this._handles.remove(disableClusteringKey);
    });
  }
}

export = InteractiveStyleViewModel;
