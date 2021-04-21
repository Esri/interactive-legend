// esri.core
import Accessor = require("esri/core/Accessor");

// esri.core
import { property, subclass } from "esri/core/accessorSupport/decorators";
import Handles = require("esri/core/Handles");
import watchUtils = require("esri/core/watchUtils");
import Collection = require("esri/core/Collection");

// esri.views
import MapView = require("esri/views/MapView");
import FeatureFilter = require("esri/views/layers/support/FeatureFilter");
import FeatureEffect = require("esri/views/layers/support/FeatureEffect");

// esri.widgets
import ActiveLayerInfo = require("esri/widgets/Legend/support/ActiveLayerInfo");
import LayerListViewModel = require("esri/widgets/LayerList/LayerListViewModel");

// esri.tasks
import Query = require("esri/tasks/support/Query");

// interfaces
import {
  FilterMode,
  LegendElement
} from "../../../../../interfaces/interfaces";
import SelectedStyleData = require("./SelectedStyleData");

// State
type State = "ready" | "loading" | "disabled" | "querying";

@subclass("InteractiveStyleViewModel")
class InteractiveStyleViewModel extends Accessor {
  // ----------------------------------
  //
  //  Variables
  //
  // ----------------------------------
  private _handles = new Handles();

  // ----------------------------------
  //
  //  Properties
  //
  // ----------------------------------

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

  @property()
  activeLayerInfos: Collection<ActiveLayerInfo> = null;

  @property()
  featureCountEnabled: boolean = null;

  @property()
  featureCountQuery = null;

  @property()
  filterMode: FilterMode = null;

  @property()
  grayScale: number = null;

  @property()
  layerListViewModel: LayerListViewModel = new LayerListViewModel();

  @property()
  opacity: number = null;

  @property()
  searchExpressions: Collection<string> = new Collection();

  @property()
  selectedStyleDataCollection: Collection<SelectedStyleData> = new Collection();

  @property()
  searchViewModel: __esri.SearchViewModel = null;

  @property()
  updateExtentEnabled: boolean = null;

  @property()
  view: MapView = null;

  // ----------------------------------
  //
  //  Lifecycle methods
  //
  // ----------------------------------

  initialize() {
    this._handles.add([
      this._handleSelectedStyleDataCollection(),
      this._watchFilterModeChange(),
      this._watchOpacityGrayScaleChange()
    ]);
  }

  destroy() {
    this._handles.removeAll();
    this._handles.destroy();
    this._handles = null;
  }

  // ----------------------------------
  //
  //  Public methods
  //
  // ----------------------------------
  async applyFeatureFilter(
    elementInfo: any,
    field: string,
    operationalItemIndex: number,
    legendElement: LegendElement,
    legendInfoIndex: number,
    isPredominance: boolean,
    dataLayerId: string,
    legendElementInfos?: any[],
    normalizationField?: string
  ): Promise<void> {
    const selectedStyleData = this.getSelectedStyleData(dataLayerId);

    const queryExpressions = selectedStyleData.queryExpressions;

    if (isPredominance) {
      const queryExpression = this._handlePredominanceExpression(
        elementInfo,
        dataLayerId
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
        queryExpressions[0] = queryExpression;
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression !== queryExpressions[0] &&
        queryExpressions[0] === "1=0"
      ) {
        queryExpressions[0] = queryExpression;
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression === queryExpressions[0] &&
        queryExpressions[0] === "1=0"
      ) {
        queryExpressions[0] = null;
      } else {
        queryExpressions.splice(expressionIndex, 1);
      }

      const selectedStyleData = this.getSelectedStyleData(dataLayerId);

      const featureLayerView = selectedStyleData.featureLayerView;

      const filterExpression = queryExpressions.join(" OR ");
      this._setSearchExpression(filterExpression);
      featureLayerView.filter = new FeatureFilter({
        where: filterExpression,
        timeExtent: featureLayerView?.filter?.timeExtent
          ? featureLayerView.filter.timeExtent
          : null
      });
    } else {
      this._generateQueryExpressions(
        elementInfo,
        field,
        dataLayerId,
        legendElement,
        legendInfoIndex,
        legendElementInfos,
        normalizationField
      );

      const selectedStyleData = this.getSelectedStyleData(dataLayerId);

      const featureLayerView = selectedStyleData.featureLayerView;

      const filterExpression = queryExpressions.join(" OR ");
      this._setSearchExpression(filterExpression);
      featureLayerView.filter = new FeatureFilter({
        where: filterExpression,
        timeExtent: featureLayerView?.filter?.timeExtent
          ? featureLayerView.filter.timeExtent
          : null
      });
    }
  }

  async applyFeatureMute(
    elementInfo: any,
    field: string,
    operationalItemIndex: number,
    legendElement: LegendElement,
    legendInfoIndex: number,
    isPredominance: boolean,
    dataLayerId: string,
    legendElementInfos?: any[],
    normalizationField?: string
  ): Promise<void> {
    const selectedStyleData = this.getSelectedStyleData(dataLayerId);

    const queryExpressions = selectedStyleData.queryExpressions;

    const { opacity, grayScale } = this;

    const opacityValue = opacity === null ? 30 : opacity;
    const grayScaleValue = grayScale === null ? 100 : grayScale;
    if (isPredominance) {
      const queryExpression = this._handlePredominanceExpression(
        elementInfo,
        dataLayerId
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
        queryExpressions[0] = queryExpression;
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression !== queryExpressions[0] &&
        queryExpressions[0] === "1=0"
      ) {
        queryExpressions[0] = queryExpression;
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression === queryExpressions[0] &&
        queryExpressions[0] === "1=0"
      ) {
        queryExpressions[0] = null;
      } else {
        queryExpressions.splice(expressionIndex, 1);
      }

      const filterExpression = queryExpressions.join(" OR ");
      this._setSearchExpression(filterExpression);

      selectedStyleData.featureLayerView.effect = new FeatureEffect({
        excludedEffect: `opacity(${opacityValue}%) grayscale(${grayScaleValue}%)`,
        filter: {
          where: filterExpression,
          timeExtent: selectedStyleData.featureLayerView?.effect?.filter
            ?.timeExtent
            ? selectedStyleData.featureLayerView?.effect?.filter?.timeExtent
            : null
        }
      });
    } else {
      this._generateQueryExpressions(
        elementInfo,
        field,
        dataLayerId,
        legendElement,
        legendInfoIndex,
        legendElementInfos,
        normalizationField
      );

      const featureLayerView = selectedStyleData?.featureLayerView;

      const filterExpression = queryExpressions.join(" OR ");
      this._setSearchExpression(filterExpression);

      featureLayerView.effect = new FeatureEffect({
        excludedEffect: `opacity(${opacityValue}%) grayscale(${grayScaleValue}%)`,
        filter: {
          where: filterExpression,
          timeExtent: selectedStyleData.featureLayerView?.effect?.filter
            ?.timeExtent
            ? selectedStyleData.featureLayerView?.effect?.filter?.timeExtent
            : null
        }
      });
    }
  }

  resetLegendFilter(featureLayerData: any): void {
    const { featureLayerView, selectedInfoIndexes } = featureLayerData;

    const queryExpressions = featureLayerData.queryExpressions;

    if (queryExpressions) {
      queryExpressions.length = 0;
    }

    if (this.filterMode === "featureFilter") {
      if (featureLayerView?.filter?.timeExtent) {
        featureLayerView.filter.where = null;
      } else {
        featureLayerView.filter = null;
      }
    } else if (this.filterMode === "mute") {
      if (featureLayerView?.effect?.filter?.timeExtent) {
        featureLayerView.effect.filter.where = null;
      } else {
        featureLayerView.effect = null;
      }
    }
    if (selectedInfoIndexes.length) {
      selectedInfoIndexes.length = 0;
    }
    this._setSearchExpression(null);
    this.notifyChange("state");
  }

  validateInteractivity(
    activeLayerInfo: __esri.ActiveLayerInfo,
    legendElement: LegendElement,
    field: string,
    legendElementIndex: number
  ): boolean {
    const { type } = legendElement;
    const layerView = activeLayerInfo.get("layerView") as __esri.LayerView;
    const classBreakInfos = layerView?.get(
      "layer.renderer.classBreakInfos"
    ) as __esri.ClassBreak[];
    const uniqueValueInfos =
      layerView?.get("layer.renderer.uniqueValueInfos") && field;
    const isSizeRamp = type === "size-ramp";
    const isColorRamp = type === "color-ramp";
    const opacityRamp = type === "opacity-ramp";
    const heatmapRamp = type === "heatmap-ramp";

    const hasMoreThanOneClassBreak =
      layerView && classBreakInfos && classBreakInfos.length > 1;

    const authoringInfoType = layerView?.get(
      "layer.renderer.authoringInfo.type"
    );
    const isPredominance = authoringInfoType === "predominance";
    const classifyDataCheckedColorRamp =
      authoringInfoType === "class-breaks-color";
    const classifyDataCheckedSizeRamp =
      authoringInfoType === "class-breaks-size";

    const singleSymbol = legendElement?.infos?.length === 1 && !field;

    const isRelationship =
      authoringInfoType === "relationship" &&
      legendElement.type !== "size-ramp";

    let featureLayerData = null;

    this.selectedStyleDataCollection?.forEach(data => {
      if (data.hasOwnProperty("length")) {
        const selectedStyleDataItem = data as unknown;
        const featureLayerDataGroup = selectedStyleDataItem as __esri.Collection<
          SelectedStyleData
        >;
        featureLayerData = featureLayerDataGroup.find(groupLayerItem =>
          data
            ? activeLayerInfo?.layer?.id === groupLayerItem?.layerItemId
            : null
        );
      } else {
        featureLayerData = data
          ? activeLayerInfo?.layer?.id === data?.layerItemId
          : null;
      }
    });

    const isFeatureLayer = activeLayerInfo?.get("layer.type") === "feature";

    const moreThanOneClassBreak =
      isFeatureLayer &&
      field &&
      !isColorRamp &&
      !isSizeRamp &&
      featureLayerData &&
      hasMoreThanOneClassBreak;

    const oneClassBreak =
      isFeatureLayer &&
      field &&
      !isColorRamp &&
      !isSizeRamp &&
      featureLayerData &&
      !hasMoreThanOneClassBreak
        ? true
        : false;

    const validate =
      oneClassBreak ||
      (isPredominance && !isSizeRamp) ||
      (classifyDataCheckedColorRamp && field) ||
      (classifyDataCheckedSizeRamp && field) ||
      (singleSymbol && !field && field !== null) ||
      isRelationship ||
      uniqueValueInfos
        ? true
        : false;

    const hasClustering =
      activeLayerInfo?.get("layer.featureReduction") &&
      activeLayerInfo?.legendElements[legendElementIndex]?.type === "size-ramp";

    const isSingleSymbol =
      legendElement.type === "symbol-table" &&
      legendElement?.infos?.length === 1;

    const hasColorRamp = !activeLayerInfo?.legendElements.every(
      legendElement => legendElement.type !== "color-ramp"
    );

    const hasSizeRamp = !activeLayerInfo?.legendElements.every(
      legendElement => legendElement.type !== "size-ramp"
    );

    const singleSymbolColor = isSingleSymbol && hasColorRamp;

    const singleSymbolSize = isSingleSymbol && hasSizeRamp;

    const isUnclassifiedSizeRamp = legendElement?.infos?.every(
      info => typeof info.value === "number"
    );

    const isValidated =
      isFeatureLayer &&
      !hasClustering &&
      !opacityRamp &&
      !heatmapRamp &&
      !singleSymbolColor &&
      !singleSymbolSize &&
      !isUnclassifiedSizeRamp
        ? classBreakInfos
          ? moreThanOneClassBreak || validate
          : oneClassBreak || validate
        : false;

    return isValidated;
  }

  private _createSelectedStyleData(
    featureLayerView: __esri.FeatureLayerView
  ): SelectedStyleData {
    if (!featureLayerView) {
      return null;
    } else {
      const featureLayer = featureLayerView.get("layer") as __esri.FeatureLayer,
        renderer = featureLayer.get("renderer") as any,
        field = renderer?.get("field"),
        field2 = renderer?.get("field2"),
        field3 = renderer?.get("field3"),
        fieldDelimiter = renderer?.get("fieldDelimiter"),
        normalizationField = renderer?.get("normalizationField"),
        normalizationType = renderer?.get("normalizationType"),
        hasCustomArcade = (field2 || field3) && fieldDelimiter ? true : false,
        invalidNormalization =
          normalizationType === "percent-of-total" ||
          normalizationType === "log";
      if (hasCustomArcade || invalidNormalization) {
        return null;
      } else {
        const selectedStyleData = new SelectedStyleData({
          layerItemId: featureLayer.id,
          field,
          selectedInfoIndexes: [],
          applyStyles: null,
          featureLayerView,
          normalizationField
        });
        return selectedStyleData;
      }
    }
  }

  // LIMITATION: When complex expressions (normalized fields) are queried against feature services that have Use Standardized Queries set to false - update extent cannot be applied.
  updateExtentToAllFeatures(
    operationalItemIndex: number,
    layerId: string
  ): void {
    const selectedStyleData = this.getSelectedStyleData(layerId);
    const layerView = selectedStyleData.featureLayerView;
    const filterWhere = layerView.get("filter.where");
    const effectWhere = layerView.get("effect.filter.where");
    const featureLayer = this.view.map.findLayerById(
      layerId
    ) as __esri.FeatureLayer;
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

  // ----------------------------------
  //
  //  Feature Filter Methods
  //
  // ----------------------------------
  private _generateQueryExpressions(
    elementInfo: any,
    field: string,
    dataLayerId: string,
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

      const selectedStyleData = this.getSelectedStyleData(dataLayerId);

      const queryExpressions = selectedStyleData?.queryExpressions;

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
        queryExpressions[0] = queryExpression;
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression !== queryExpressions[0] &&
        queryExpressions[0] === "1=0" &&
        !hasOneValue
      ) {
        queryExpressions[0] = queryExpression;
      } else if (
        queryExpressions &&
        queryExpressions.length === 1 &&
        queryExpression === queryExpressions[0] &&
        queryExpressions[0] === "1=0" &&
        !hasOneValue
      ) {
        queryExpressions[0] = null;
      } else {
        queryExpressions.splice(expressionIndex, 1);
      }
    } else {
      return queryExpression;
    }
  }

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
                : isNaN(value) || typeof value === "string" && !value.trim()
                ? `${field} <> '${value}'`
                : `${field} <> ${value} AND ${field} <> '${value}'`;
              expressionList.push(expression);
            }
          });
          const noExpression = expressionList.join(" AND ");
          return field ? `${noExpression} OR ${field} IS NULL` : "";
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

  private _handlePredominanceExpression(
    elementInfo: any,
    dataLayerId: string
  ): string {
    const selectedStyleData = this.getSelectedStyleData(dataLayerId);

    const featureLayerView = selectedStyleData.featureLayerView;
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

  private _generateQueryCountExpression(
    elementInfo: any,
    field: string,
    dataLayerId: string,
    legendInfoIndex: number,
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
          dataLayerId
        );
        return predominanceExpression;
      } else {
        return this._generateQueryExpressions(
          elementInfo,
          field,
          dataLayerId,
          legendElement,
          legendInfoIndex,
          legendElementInfos,
          normalizationField,
          generateFeatureCountExpression
        );
      }
    } else {
      const selectedStyleData = this.getSelectedStyleData(dataLayerId);
      const queryExpressions = selectedStyleData.queryExpressions;

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

  getSelectedStyleData(layerId: string): SelectedStyleData {
    return this.selectedStyleDataCollection.find(
      selectedStyleDataItem => selectedStyleDataItem.layerItemId === layerId
    );
  }

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

  private _handleSelectedStyleDataCollection(): __esri.WatchHandle {
    return watchUtils.on(this, "activeLayerInfos", "change", () => {
      if (!this.view) {
        return;
      }
      const selectedStyleDataItems = [];
      const promises = [];
      this._createSelectedStyleDataCollection(selectedStyleDataItems, promises);
    });
  }

  private _createSelectedStyleDataCollection(
    selectedStyleDataArr: any[],
    promises
  ): void {
    this.activeLayerInfos.forEach(activeLayerInfo => {
      if (activeLayerInfo.layer.type === "group") {
        this._groupLayerRecursion(
          activeLayerInfo.layer as __esri.GroupLayer,
          selectedStyleDataArr,
          promises
        );
      } else {
        this._getFeatureLayerView(activeLayerInfo.layer, promises);
      }
    });
    Promise.all(promises).then(promiseResponses => {
      promiseResponses.forEach((promiseResponse: __esri.FeatureLayerView) => {
        const selectedStyleDataItem = this._createSelectedStyleData(
          promiseResponse
        );

        const existingSelectedStyleDataItem = this.selectedStyleDataCollection.find(
          selectedStyleDataItemToTest =>
            selectedStyleDataItemToTest.layerItemId ===
            selectedStyleDataItem.layerItemId
        );

        if (!existingSelectedStyleDataItem) {
          this.selectedStyleDataCollection.add(selectedStyleDataItem);
        }
      });

      this._initFeatureCount();
    });
  }

  private _groupLayerRecursion(
    groupLayer: __esri.GroupLayer,
    selectedStyleDataArr,
    promises
  ): void {
    groupLayer.layers.forEach((layerChild: __esri.Layer) => {
      if (layerChild.type === "group") {
        const groupLayerChild = layerChild as __esri.GroupLayer;
        this._groupLayerRecursion(
          groupLayerChild,
          selectedStyleDataArr,
          promises
        );
      } else {
        this._getFeatureLayerView(layerChild, promises);
      }
    });
  }

  private _getFeatureLayerView(layer: __esri.Layer, promises): void {
    promises.push(
      this.view.whenLayerView(layer).then(layerView => {
        return layerView;
      })
    );
  }

  private _watchFilterModeChange(): __esri.WatchHandle {
    return watchUtils.watch(this, "filterMode", () => {
      this.selectedStyleDataCollection.forEach(selectedStyleData => {
        if (this.filterMode === "featureFilter") {
          const filter = selectedStyleData?.featureLayerView?.effect?.filter?.clone();
          if (filter) {
            selectedStyleData.featureLayerView.effect = null;
            selectedStyleData.featureLayerView.filter = filter;
          }
        } else if (this.filterMode === "mute") {
          const filter = selectedStyleData?.featureLayerView?.filter?.clone();
          if (filter) {
            selectedStyleData.featureLayerView.filter = null;
            const { opacity, grayScale } = this;
            const opacityValue = opacity === null ? 30 : opacity;
            const grayScaleValue = grayScale === null ? 100 : grayScale;
            selectedStyleData.featureLayerView.effect = new FeatureEffect({
              excludedEffect: `opacity(${opacityValue}%) grayscale(${grayScaleValue}%)`,
              filter
            });
          }
        }
      });
    });
  }

  private _watchOpacityGrayScaleChange(): __esri.WatchHandle {
    return watchUtils.watch(this, "opacity, grayScale", () => {
      this.selectedStyleDataCollection.forEach(selectedStyleData => {
        if (this.filterMode === "mute") {
          const filter =
            selectedStyleData?.featureLayerView?.filter ||
            selectedStyleData?.featureLayerView?.effect?.filter;
          selectedStyleData.featureLayerView.filter = null;
          const { opacity, grayScale } = this;
          const opacityValue = opacity === null ? 30 : opacity;
          const grayScaleValue = grayScale === null ? 100 : grayScale;
          selectedStyleData.featureLayerView.effect = new FeatureEffect({
            excludedEffect: `opacity(${opacityValue}%) grayscale(${grayScaleValue}%)`,
            filter
          });
        }
      });
    });
  }

  // // FEATURE COUNT METHODS
  private _initFeatureCount(): void {
    this._handleFeatureCountForLayers();
    this._updateFeatureCountOnViewUpdate();
  }

  private _handleFeatureCountForLayers(): void {
    this.selectedStyleDataCollection.forEach(selectedStyleDataItem => {
      const featureLayerView = selectedStyleDataItem.featureLayerView;
      const savedActiveLayerInfo = {
        activeLayerInfo: null
      };
      this._getActiveLayerInfo(
        selectedStyleDataItem.layerItemId,
        savedActiveLayerInfo
      );
      if (savedActiveLayerInfo.activeLayerInfo) {
        watchUtils.whenTrueOnce(
          savedActiveLayerInfo.activeLayerInfo,
          "ready",
          () => {
            this._handleActiveLayerInfoForCount(
              savedActiveLayerInfo.activeLayerInfo,
              featureLayerView
            );
          }
        );
      }
    });
  }

  private _getActiveLayerInfo(layerId: string, savedActiveLayerInfo) {
    const activeLayerInfo = this.activeLayerInfos.find(
      activeLayerInfo => activeLayerInfo.layer.id === layerId
    );
    if (!activeLayerInfo) {
      this.activeLayerInfos.forEach(activeLayerInfo => {
        if (activeLayerInfo.children.length > 0) {
          this._getNestedActiveLayerInfo(
            layerId,
            activeLayerInfo,
            savedActiveLayerInfo
          );
        }
      });
    }
    if (activeLayerInfo) {
      savedActiveLayerInfo.activeLayerInfo = activeLayerInfo;
    }
  }

  private _getNestedActiveLayerInfo(
    layerId: string,
    activeLayerInfoParent: __esri.ActiveLayerInfo,
    savedActiveLayerInfo
  ) {
    const activeLayerInfo = activeLayerInfoParent.children.find(
      activeLayerInfoChild => activeLayerInfoChild.layer.id === layerId
    );
    if (!activeLayerInfo) {
      if (activeLayerInfoParent.children.length > 0) {
        activeLayerInfoParent.children.forEach(nestedActiveLayerInfoChild => {
          this._getNestedActiveLayerInfo(
            layerId,
            nestedActiveLayerInfoChild,
            savedActiveLayerInfo
          );
        });
      }
    } else {
      if (activeLayerInfo) {
        savedActiveLayerInfo.activeLayerInfo = activeLayerInfo;
      }
    }
  }

  private _handleActiveLayerInfoForCount(
    activeLayerInfo: __esri.ActiveLayerInfo,
    featureLayerView: __esri.FeatureLayerView
  ): void {
    const watchLegendElementsForCount = "watch-legend-elements-for-count";
    this._handles.add(
      watchUtils.whenOnce(activeLayerInfo, "legendElements.length", () => {
        if (this._handles.has(watchLegendElementsForCount)) {
          this._handles.remove(watchLegendElementsForCount);
        }
        activeLayerInfo.legendElements.forEach(
          (legendElement: any, legendElementIndex) => {
            this._handleLegendElementForCount(
              legendElement,
              featureLayerView,
              legendElementIndex,
              activeLayerInfo
            );
          }
        );
      }),
      watchLegendElementsForCount
    );
  }

  private _handleLegendElementForCount(
    legendElement: LegendElement,
    featureLayerView: __esri.FeatureLayerView,
    legendElementIndex: number,
    activeLayerInfo: __esri.ActiveLayerInfo
  ): void {
    const isInteractive = this.validateInteractivity(
      activeLayerInfo,
      legendElement,
      activeLayerInfo.get("layer.renderer.field"),
      legendElementIndex
    );
    if (!legendElement?.infos || !isInteractive) {
      return;
    }

    this._handleLayerViewWatcherForCount(
      featureLayerView,
      legendElementIndex,
      legendElement,
      activeLayerInfo
    );

    this._handleFeatureCount(
      featureLayerView,
      legendElementIndex,
      legendElement,
      activeLayerInfo
    );
  }

  private _handleLayerViewWatcherForCount(
    featureLayerView: __esri.FeatureLayerView,
    legendElementIndex: number,
    legendElement: LegendElement,
    activeLayerInfo: __esri.ActiveLayerInfo
  ): void {
    const key = `feature-count-${activeLayerInfo.layer.id}-${legendElementIndex}`;

    if (!this._handles.has(key) && featureLayerView) {
      this._handles.add(
        watchUtils.whenFalse(featureLayerView, "updating", () => {
          this._handleFeatureCount(
            featureLayerView,
            legendElementIndex,
            legendElement,
            activeLayerInfo
          );
        }),
        key
      );
    }
  }

  private _handleFeatureCount(
    featureLayerView: __esri.FeatureLayerView,
    legendElementIndex: number,
    legendElement: LegendElement,
    activeLayerInfo: __esri.ActiveLayerInfo
  ): void {
    const promises = [];
    legendElement.infos.forEach((info, infoIndex) => {
      this._handleLegendElementForFeatureCount(
        featureLayerView,
        legendElementIndex,
        infoIndex,
        legendElement,
        info,
        promises,
        activeLayerInfo
      );
    });
    Promise.all(promises).then(featureCountResponses => {
      this._handleFeatureCountResponses(
        featureCountResponses,
        legendElementIndex,
        activeLayerInfo
      );
    });
  }

  private _handleLegendElementForFeatureCount(
    featureLayerView: __esri.FeatureLayerView,
    legendElementIndex: number,
    infoIndex: number,
    legendElement: any,
    info: any,
    promises: Array<Promise<{ featureCountRes: number; infoIndex: number }>>,
    activeLayerInfo: __esri.ActiveLayerInfo
  ): void {
    const handlesKey = featureLayerView
      ? `${featureLayerView.layer.id}-${legendElementIndex}-${infoIndex}`
      : null;

    const selectedStyleData = this.getSelectedStyleData(
      activeLayerInfo.layer.id
    );

    const { field, normalizationField } = selectedStyleData;

    if (!this._handles.has(handlesKey)) {
      const applyFeatureCount = this.validateInteractivity(
        activeLayerInfo,
        legendElement,
        field,
        legendElementIndex
      );
      const isPredominance =
        featureLayerView.get("layer.renderer.authoringInfo.type") ===
        "predominance";

      if (!applyFeatureCount) {
        return;
      }

      const queryExpression = this._generateQueryCountExpression(
        info,
        field,
        featureLayerView.layer.id,
        infoIndex,
        legendElement,
        isPredominance,
        legendElement.infos,
        normalizationField,
        applyFeatureCount
      );

      const query = this._generateFeatureCountQuery(
        queryExpression,
        featureLayerView
      );
      promises.push(
        featureLayerView
          .queryFeatureCount(query)
          .then(featureCountRes => {
            return {
              featureCountRes,
              infoIndex
            };
          })
          .catch(err => {
            console.warn(
              "Invalid geometry - querying count without geometry: ",
              err
            );
            const queryNoGeometry = this._generateFeatureCountQueryNoGeometry(
              queryExpression,
              featureLayerView
            );
            return featureLayerView
              .queryFeatureCount(queryNoGeometry)
              .then(featureCountRes => {
                return {
                  featureCountRes,
                  infoIndex
                };
              });
          })
      );
    }
  }

  private _generateFeatureCountQueryNoGeometry(
    queryExpression: string,
    featureLayerView: __esri.FeatureLayerView
  ): __esri.Query {
    const outSpatialReference = this.view && this.view.get("spatialReference");
    return new Query({
      where: queryExpression,
      outSpatialReference,
      timeExtent: featureLayerView?.filter?.timeExtent
        ? featureLayerView.filter.timeExtent
        : featureLayerView?.effect?.filter?.timeExtent
        ? featureLayerView.effect.filter.timeExtent
        : null
    });
  }

  private _generateFeatureCountQuery(
    queryExpression: string,
    featureLayerView: __esri.FeatureLayerView
  ): __esri.Query {
    const geometry = this.view && this.view.get("extent");
    const outSpatialReference = this.view && this.view.get("spatialReference");
    return new Query({
      where: queryExpression,
      geometry,
      outSpatialReference,
      timeExtent: featureLayerView?.filter?.timeExtent
        ? featureLayerView.filter.timeExtent
        : featureLayerView?.effect?.filter?.timeExtent
        ? featureLayerView.effect.filter.timeExtent
        : null
    });
  }

  private _handleFeatureCountResponses(
    featureCountResObjects: Array<{
      featureCountRes: number;
      infoIndex: number;
    }>,
    legendElementIndex: number,
    activeLayerInfo: __esri.ActiveLayerInfo
  ): void {
    const featureCountsForLegendElement = featureCountResObjects
      .slice()
      .map(featureCountResObject => featureCountResObject.featureCountRes);

    const selectedStyleData = this.getSelectedStyleData(
      activeLayerInfo.layer.id
    );

    if (!selectedStyleData) {
      return;
    }

    const featureCountsForLayer = selectedStyleData?.featureCount;

    featureCountsForLayer?.splice(
      legendElementIndex,
      1,
      featureCountsForLegendElement
    );

    if (selectedStyleData.selectedInfoIndexes[legendElementIndex]?.length > 0) {
      this.updateTotalFeatureCount(activeLayerInfo, legendElementIndex);
    } else {
      this.queryTotalFeatureCount(legendElementIndex, activeLayerInfo);
    }
  }

  private _updateFeatureCountOnViewUpdate(): void {
    const featureCountViewUpdateKey = "feature-count-view-update-key";
    this._handles.remove(featureCountViewUpdateKey);
    this._handles.add(
      [
        watchUtils.whenFalse(this, "view.stationary", () => {
          if (!this.view.stationary) {
            const stationaryIsTrue = "stationary-is-true";
            this._handles.add(
              watchUtils.whenTrueOnce(this, "view.stationary", () => {
                if (this._handles.has(stationaryIsTrue)) {
                  this._handles.remove(stationaryIsTrue);
                }
                this._watchDataForCount();
              }),
              stationaryIsTrue
            );
          } else {
            const stationaryIsFalse = "stationary-is-false";
            this._handles.add(
              watchUtils.whenFalseOnce(this, "view.interacting", () => {
                if (this._handles.has(stationaryIsFalse)) {
                  this._handles.remove(stationaryIsFalse);
                }

                this._watchDataForCount();
              }),
              stationaryIsFalse
            );
          }
        })
      ],
      featureCountViewUpdateKey
    );
  }

  private _watchDataForCount(): void {
    const activeLayerInfosCountKey = "active-layer-infos-count-key";
    this._handles.add(
      watchUtils.when(this, "activeLayerInfos.length", () => {
        if (this._handles.has(activeLayerInfosCountKey)) {
          this._handles.remove(activeLayerInfosCountKey);
        }
        const selectedStyleDataCollectionCountKey =
          "selected-style-data-collection-count-key";
        this._handles.add(
          watchUtils.when(this, "selectedStyleDataCollection.length", () => {
            if (this._handles.has(selectedStyleDataCollectionCountKey)) {
              this._handles.remove(selectedStyleDataCollectionCountKey);
            }
            this._handleFeatureCountForLayers();
          }),
          selectedStyleDataCollectionCountKey
        );
      }),
      activeLayerInfosCountKey
    );
  }
  // END OF INIT FEATURE COUNT METHODS

  // START TOTAL FEATURE COUNT METHODS
  queryTotalFeatureCount(
    legendElementIndex: number,
    activeLayerInfo: __esri.ActiveLayerInfo
  ): void {
    const selectedStyleData = this.getSelectedStyleData(
      activeLayerInfo.layer.id
    );

    const { featureCount, totalFeatureCount } = selectedStyleData;
    const featureCountForLegend = featureCount.getItemAt(legendElementIndex);
    const total =
      featureCountForLegend?.length > 0 &&
      featureCountForLegend.reduce((num1, num2) => num1 + num2);
    if (totalFeatureCount === undefined || totalFeatureCount === null) {
      selectedStyleData.totalFeatureCount = 0;
      return;
    }

    selectedStyleData.totalFeatureCount = total;
  }

  updateTotalFeatureCount(
    activeLayerInfo: __esri.ActiveLayerInfo,
    legendElementIndex: number
  ): void {
    const selectedStyleData = this.getSelectedStyleData(
      activeLayerInfo.layer.id
    );

    const { featureCount } = selectedStyleData;
    const featureCountForLegend = featureCount.getItemAt(legendElementIndex);
    const selectedInfoIndexes =
      selectedStyleData.selectedInfoIndexes[legendElementIndex];

    let currentTotal = 0;

    selectedInfoIndexes &&
      selectedInfoIndexes.forEach(infoIndex => {
        currentTotal += featureCountForLegend[infoIndex];
      });

    selectedStyleData.totalFeatureCount = currentTotal;
  }
  // END OF TOTAL FEATURE COUNT METHODS
}

export = InteractiveStyleViewModel;
