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

// esri.Graphic
import Graphic = require("esri/Graphic");

// esri.Color
import Color = require("esri/Color");

// esri.widgets.LayerList.LayerListViewModel
import LayerListViewModel = require("esri/widgets/LayerList/LayerListViewModel");

// esri.views.layers.support.FeatureFilter
import FeatureFilter = require("esri/views/layers/support/FeatureFilter");

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
    highlightedFeatures: [],
    originalRenderers: [],
    originalColors: [],
    colorIndexes: [],
    mutedValues: [],
    classBreakInfosIndex: []
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
  mutedShade: Color[] = null;

  // mutedOpacity
  @property()
  mutedOpacity: number = null;

  // filterMode
  @property()
  filterMode: FilterMode = null;

  // layerListViewModel
  @property()
  layerListViewModel: LayerListViewModel = new LayerListViewModel();

  // searchExpressions
  @property()
  searchExpressions: Collection<string> = new Collection();

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
            if (this.filterMode === "mute") {
              this._storeOriginalRenderersAndColors();
            }
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

  // filterFeatures
  applyFeatureFilter(
    elementInfo: any,
    field: string,
    featureLayerViewIndex: number,
    legendElement: LegendElement,
    legendInfoIndex: number,
    legendElementInfos?: any[]
  ): void {
    this._generateQueryExpressions(
      elementInfo,
      field,
      featureLayerViewIndex,
      legendElement,
      legendInfoIndex,
      legendElementInfos
    );
    const queryExpressions = this.interactiveStyleData.queryExpressions[
      featureLayerViewIndex
    ];
    const featureLayerView = this.featureLayerViews.getItemAt(
      featureLayerViewIndex
    );
    const filterExpression = queryExpressions.join(" OR ");
    this._setSearchExpression(filterExpression, featureLayerViewIndex);
    featureLayerView.filter = new FeatureFilter({
      where: filterExpression
    });
  }

  // muteFeatures
  applyFeatureMute(
    elementInfo: any,
    field: string,
    legendInfoIndex: number,
    featureLayerViewIndex: number,
    legendElement: LegendElement,
    legendElementInfos: any[]
  ): void {
    const originalRenderer = this.interactiveStyleData.originalRenderers[
      featureLayerViewIndex
    ];
    if (!originalRenderer) {
      return;
    }
    if (originalRenderer.hasOwnProperty("uniqueValueInfos")) {
      this._muteUniqueValues(legendInfoIndex, field, featureLayerViewIndex);
    } else if (
      Array.isArray(elementInfo.value) &&
      elementInfo.value.length === 2
    ) {
      this._muteRangeValues(legendInfoIndex, field, featureLayerViewIndex);
    }

    this._generateQueryExpressions(
      elementInfo,
      field,
      featureLayerViewIndex,
      legendElement,
      null,
      legendElementInfos
    );
    const queryExpressions = this.interactiveStyleData.queryExpressions[
      featureLayerViewIndex
    ];
    const filterExpression = queryExpressions.join(" OR ");
    this._setSearchExpression(filterExpression, featureLayerViewIndex);
  }

  // highlightFeatures
  applyFeatureHighlight(
    elementInfo: any,
    field: string,
    legendInfoIndex: number,
    featureLayerViewIndex: number,
    isSizeRamp: boolean,
    legendElement: LegendElement,
    legendElementInfos: any[]
  ): void {
    if (isSizeRamp) {
      this._highlightSizeRamp(
        legendInfoIndex,
        field,
        legendElementInfos,
        elementInfo,
        featureLayerViewIndex
      );
    } else if (
      Array.isArray(elementInfo.value) &&
      elementInfo.value.length === 2
    ) {
      this._highlightRangeValues(
        legendInfoIndex,
        elementInfo,
        field,
        featureLayerViewIndex,
        legendElementInfos
      );
    } else {
      this._highlightUniqueValues(
        legendInfoIndex,
        elementInfo,
        field,
        featureLayerViewIndex
      );
    }

    this._generateQueryExpressions(
      elementInfo,
      field,
      featureLayerViewIndex,
      legendElement,
      null,
      legendElementInfos
    );
    const queryExpressions = this.interactiveStyleData.queryExpressions[
      featureLayerViewIndex
    ];
    const filterExpression = queryExpressions.join(" OR ");
    this._setSearchExpression(filterExpression, featureLayerViewIndex);
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
    const {
      highlightedFeatures,
      queryExpressions,
      mutedValues,
      originalColors,
      colorIndexes,
      classBreakInfosIndex
    } = this.interactiveStyleData;
    highlightedFeatures.push([]);
    queryExpressions.push([]);
    mutedValues.push([]);
    originalColors.push([]);
    colorIndexes.push([]);
    classBreakInfosIndex.push([]);
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

  // _storeOriginalRenderersAndColors
  private _storeOriginalRenderersAndColors(): void {
    this.interactiveStyleData.originalRenderers = [];
    this.layerListViewModel.operationalItems.forEach(
      (operationalItem, featureLayerViewIndex) => {
        if (operationalItem.layer.hasOwnProperty("renderer")) {
          this._useLayerFromOperationalItem(
            operationalItem,
            featureLayerViewIndex
          );
        }
      }
    );
  }

  // _useLayerFromOperationalItem
  private _useLayerFromOperationalItem(
    operationalItem: ActiveLayerInfo,
    featureLayerViewIndex: number
  ): void {
    const clonedRenderer = operationalItem.layer.renderer.clone();
    const originalColors = this.interactiveStyleData.originalColors[
      featureLayerViewIndex
    ];
    const infos = clonedRenderer.hasOwnProperty("uniqueValueInfos")
      ? clonedRenderer.uniqueValueInfos
      : clonedRenderer.classBreakInfos;
    if (infos) {
      infos.forEach(info => {
        originalColors.push(info.symbol.color);
      });
      if (!operationalItem.layer.hasOwnProperty("renderer")) {
        return;
      }
      this.interactiveStyleData.originalRenderers[
        featureLayerViewIndex
      ] = clonedRenderer;
    }
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
    featureLayerViewIndex: number,
    legendElement: LegendElement,
    legendInfoIndex?: number,
    legendElementInfos?: any[]
  ): void {
    const queryExpression = this._generateQueryExpression(
      elementInfo,
      field,
      legendInfoIndex,
      legendElement,
      legendElementInfos
    );
    const queryExpressions = this.interactiveStyleData.queryExpressions[
      featureLayerViewIndex
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
    if (
      legendElement.type === "size-ramp" &&
      this.filterMode === "featureFilter"
    ) {
      const expression = this._handleSizeRampFeatureFilter(
        legendInfoIndex,
        field,
        legendElementInfos,
        elementInfo
      );
      return expression;
    }
    if (legendElement.type === "symbol-table") {
      if (label.includes(">")) {
        return Array.isArray(elementInfoHasValue)
          ? `${field} > ${elementInfoHasValue[0]} AND ${field} <= ${
              elementInfo.value[1]
            }`
          : `${field} = ${elementInfoHasValue} OR ${field} = '${elementInfoHasValue}'`;
      } else {
        const expression = Array.isArray(elementInfo.value)
          ? legendElementInfos.length - 1 === legendInfoIndex
            ? `${field} >= ${elementInfoHasValue[0]} AND ${field} <= ${
                elementInfoHasValue[1]
              }`
            : `${field} > ${elementInfoHasValue[0]} AND ${field} <= ${
                elementInfoHasValue[1]
              }`
          : `${field} = ${elementInfoHasValue} OR ${field} = '${elementInfoHasValue}'`;
        return expression;
      }
    }
  }

  // _handleSizeRampFeatureFilter
  private _handleSizeRampFeatureFilter(
    legendInfoIndex: number,
    field: string,
    legendElementInfos: any[],
    elementInfo: any
  ) {
    // FIRST LEGEND INFO
    if (legendInfoIndex === 0) {
      return `${field} >= ${elementInfo.value}`;
    }
    // SECOND LEGEND INFO
    else if (legendInfoIndex === 1) {
      const midPoint =
        legendElementInfos[1].value -
        (legendElementInfos[1].value - legendElementInfos[2].value) / 2;
      return `${field} < ${
        legendElementInfos[0].value
      } AND ${field} >= ${midPoint}`;
    }
    // SECOND TO LAST LEGEND INFO
    else if (legendInfoIndex === legendElementInfos.length - 2) {
      const secondToLastInfo =
        legendElementInfos[legendElementInfos.length - 2];
      const lastInfo = legendElementInfos[legendElementInfos.length - 1];
      const midPoint =
        (secondToLastInfo.value - lastInfo.value) / 2 + secondToLastInfo.value;
      return `${field} > ${lastInfo.value} AND ${field} <= ${midPoint}`;
    }
    // LAST LEGEND INFO
    else if (legendInfoIndex === legendElementInfos.length - 1) {
      return `${field} <= ${elementInfo.value}`;
    }
    // ANY LEGEND INFO IN BETWEEN
    else {
      const midPoint1 =
        (legendElementInfos[legendInfoIndex - 1].value -
          legendElementInfos[legendInfoIndex].value) /
          2 +
        legendElementInfos[legendInfoIndex].value;
      const midPoint2 =
        legendElementInfos[legendInfoIndex].value -
        (legendElementInfos[legendInfoIndex].value -
          legendElementInfos[legendInfoIndex + 1].value) /
          2;
      return `${field} < ${midPoint1} AND ${field} > ${midPoint2}`;
    }
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
    featureLayerViewIndex: number,
    legendElementInfos: any[]
  ): void {
    const features = [];
    const highlightedFeatures = this.interactiveStyleData.highlightedFeatures[
      featureLayerViewIndex
    ];

    const elementInfoValue = elementInfo.value;
    if (highlightedFeatures[legendInfoIndex]) {
      this._removeHighlight(featureLayerViewIndex, legendInfoIndex);
      return;
    }
    this.layerGraphics.getItemAt(featureLayerViewIndex).forEach(feature => {
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
      .getItemAt(featureLayerViewIndex)
      .highlight([...features]);
    highlightedFeatures[legendInfoIndex] = [highlight];
  }

  // _highlightUniqueValue
  private _highlightUniqueValues(
    legendInfoIndex: number,
    elementInfo: any,
    field: string,
    featureLayerViewIndex: number
  ): void {
    const features = [];
    const highlightedFeatures = [];
    const highlightedFeatureData = this.interactiveStyleData
      .highlightedFeatures[featureLayerViewIndex];

    if (highlightedFeatureData[legendInfoIndex]) {
      highlightedFeatureData[legendInfoIndex][0].remove();
      highlightedFeatureData[legendInfoIndex] = null;
      return;
    }
    this.layerGraphics.getItemAt(featureLayerViewIndex).map(feature => {
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
      .getItemAt(featureLayerViewIndex)
      .highlight([...highlightedFeatures]);
    highlightedFeatureData[legendInfoIndex] = [highlight];
  }

  // _highlightSizeRamp
  private _highlightSizeRamp(
    legendInfoIndex: number,
    field: string,
    legendElementInfos: any[],
    elementInfo: any,
    featureLayerViewIndex: number
  ): void {
    const features = [];
    const highlightedFeatureData = this.interactiveStyleData
      .highlightedFeatures[featureLayerViewIndex];

    if (highlightedFeatureData[legendInfoIndex]) {
      this._removeHighlight(featureLayerViewIndex, legendInfoIndex);
      return;
    }

    this.layerGraphics.getItemAt(featureLayerViewIndex).forEach(feature => {
      // FIRST LEGEND INFO
      if (legendInfoIndex === 0) {
        if (feature.attributes[field] >= elementInfo.value) {
          features.push(feature);
        }
      }
      // SECOND LEGEND INFO
      else if (legendInfoIndex === 1) {
        const midPoint =
          legendElementInfos[1].value -
          (legendElementInfos[1].value - legendElementInfos[2].value) / 2;
        if (
          feature.attributes[field] < legendElementInfos[0].value &&
          feature.attributes[field] >= midPoint
        ) {
          features.push(feature);
        }
      }
      // SECOND TO LAST LEGEND INFO
      else if (legendInfoIndex === legendElementInfos.length - 2) {
        const secondToLastInfo =
          legendElementInfos[legendElementInfos.length - 2];
        const lastInfo = legendElementInfos[legendElementInfos.length - 1];
        const midPoint =
          (secondToLastInfo.value - lastInfo.value) / 2 +
          secondToLastInfo.value;
        if (
          feature.attributes[field] > lastInfo.value &&
          feature.attributes[field] <= midPoint
        ) {
          features.push(feature);
        }
      }
      // LAST LEGEND INFO
      else if (legendInfoIndex === legendElementInfos.length - 1) {
        if (feature.attributes[field] <= elementInfo.value) {
          features.push(feature);
        }
      }
      // ANY LEGEND INFO IN BETWEEN
      else {
        const midPoint1 =
          (legendElementInfos[legendInfoIndex - 1].value -
            legendElementInfos[legendInfoIndex].value) /
            2 +
          legendElementInfos[legendInfoIndex].value;
        const midPoint2 =
          legendElementInfos[legendInfoIndex].value -
          (legendElementInfos[legendInfoIndex].value -
            legendElementInfos[legendInfoIndex + 1].value) /
            2;
        if (
          feature.attributes[field] < midPoint1 &&
          feature.attributes[field] > midPoint2
        ) {
          features.push(feature);
        }
      }
    });

    if (features.length === 0) {
      return;
    }
    const highlight = this.featureLayerViews
      .getItemAt(featureLayerViewIndex)
      .highlight([...features]);
    highlightedFeatureData[legendInfoIndex] = [highlight];
  }

  // _removeHighlight
  private _removeHighlight(
    featureLayerViewIndex: number,
    legendInfoIndex: number
  ): void {
    const highlightedFeatures = this.interactiveStyleData.highlightedFeatures[
      featureLayerViewIndex
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
    legendInfoIndex: number,
    field: string,
    featureLayerViewIndex: number
  ): void {
    const featureLayer = this.layerListViewModel.operationalItems.getItemAt(
      featureLayerViewIndex
    ).layer as FeatureLayer;
    const colorIndexes = this.interactiveStyleData.colorIndexes[
      featureLayerViewIndex
    ];

    if (colorIndexes.indexOf(legendInfoIndex) === -1) {
      colorIndexes.push(legendInfoIndex);
    } else {
      colorIndexes.splice(colorIndexes.indexOf(legendInfoIndex), 1);
    }

    this._resetMutedUniqueValues(featureLayerViewIndex);
    if (colorIndexes.length === 0) {
      this._resetMutedUniqueValues(featureLayerViewIndex);
      this._generateRenderer(featureLayerViewIndex, "unique-value", field);
      return;
    }
    const renderer = featureLayer.renderer as any;
    renderer.uniqueValueInfos.forEach(
      (uniqueInfo: __esri.UniqueValueInfo, uniqueInfoIndex: number) => {
        const { symbol } = uniqueInfo;
        if (colorIndexes.indexOf(uniqueInfoIndex) === -1) {
          symbol.color = new Color(this.mutedShade);

          if (this.mutedOpacity) {
            symbol.color.a = this.mutedOpacity;
          }
        }
      }
    );
    this._generateRenderer(featureLayerViewIndex, "unique-value", field);
  }

  // _resetMutedUniqueValues
  private _resetMutedUniqueValues(featureLayerViewIndex: number): void {
    const featureLayer = this.layerListViewModel.operationalItems.getItemAt(
      featureLayerViewIndex
    ).layer as FeatureLayer;
    const originalColors = this.interactiveStyleData.originalColors[
      featureLayerViewIndex
    ];
    originalColors.forEach((original, originalIndex) => {
      const uvr = featureLayer.renderer as __esri.UniqueValueRenderer;
      uvr.uniqueValueInfos.forEach((newItem, newIndex) => {
        if (originalIndex === newIndex) {
          newItem.symbol.color = original;
        }
      });
    });
  }

  // _muteRangeValues
  private _muteRangeValues(
    legendInfoIndex: number,
    field: string,
    featureLayerViewIndex: number
  ): void {
    const featureLayer = this.layerListViewModel.operationalItems.getItemAt(
      featureLayerViewIndex
    ).layer as any;
    const classBreakInfos = featureLayer.renderer.classBreakInfos;
    const originalColors = this.interactiveStyleData.originalColors[
      featureLayerViewIndex
    ];
    const reversedClassBreakInfos = [];
    const reversedColors = [];
    for (let i = classBreakInfos.length - 1; i >= 0; i--) {
      reversedClassBreakInfos.push(classBreakInfos[i]);
      reversedColors.push(originalColors[i]);
    }
    const classBreakInfosIndex = this.interactiveStyleData.classBreakInfosIndex[
      featureLayerViewIndex
    ];
    if (classBreakInfosIndex.indexOf(legendInfoIndex) === -1) {
      classBreakInfosIndex.push(legendInfoIndex);
    } else {
      classBreakInfosIndex.splice(
        classBreakInfosIndex.indexOf(legendInfoIndex),
        1
      );
    }

    this._applyColors(
      featureLayerViewIndex,
      reversedColors,
      reversedClassBreakInfos,
      field
    );
  }

  // _applyColors
  private _applyColors(
    featureLayerViewIndex: number,
    reversedColors: Color[],
    reversedClassBreakInfos: any[],
    field: string
  ): void {
    const classBreakInfosIndex = this.interactiveStyleData.classBreakInfosIndex[
      featureLayerViewIndex
    ];
    if (classBreakInfosIndex.length === 0) {
      reversedClassBreakInfos.forEach((classBreakInfo, classBreakInfoIndex) => {
        const { symbol } = classBreakInfo;
        reversedColors.forEach((color, colorIndex) => {
          if (classBreakInfoIndex === colorIndex) {
            symbol.color = color;
            if (symbol.color.hasOwnProperty("a")) {
              symbol.color.a = 1;
            }
          }
        });
      });
      this._generateRenderer(featureLayerViewIndex, "class-breaks", field);
      return;
    }
    reversedClassBreakInfos.forEach((classBreakInfo, classBreakInfoIndex) => {
      const { symbol } = classBreakInfo;
      const { mutedOpacity, mutedShade } = this;
      if (classBreakInfosIndex.indexOf(classBreakInfoIndex) !== -1) {
        reversedColors.forEach((color, colorIndex) => {
          if (classBreakInfoIndex === colorIndex) {
            symbol.color = color;
            if (symbol.color.hasOwnProperty("a")) {
              symbol.color.a = 1;
            }
          }
        });
      } else {
        symbol.color = mutedShade;
        if (this.mutedOpacity) {
          symbol.color.a = mutedOpacity;
        }
      }
    });
    this._generateRenderer(featureLayerViewIndex, "class-breaks", field);
  }

  // _generateRenderer
  private _generateRenderer(
    featureLayerViewIndex: number,
    type: string,
    field: string
  ): void {
    const featureLayer = this.layerListViewModel.operationalItems.getItemAt(
      featureLayerViewIndex
    ).layer as any;
    const { defaultLabel, defaultSymbol } = featureLayer.renderer;
    const visualVariables =
      featureLayer.renderer.hasOwnProperty("visualVariables") &&
      featureLayer.renderer.visualVariables
        ? [...featureLayer.renderer.visualVariables]
        : null;

    const renderer =
      type === "unique-value"
        ? {
            type,
            field,
            uniqueValueInfos: [...featureLayer.renderer.uniqueValueInfos],
            defaultLabel,
            defaultSymbol,
            visualVariables
          }
        : {
            type,
            field,
            classBreakInfos: [...featureLayer.renderer.classBreakInfos],
            defaultLabel,
            defaultSymbol
          };
    featureLayer.renderer = renderer;
  }

  // End of filter methods

  // _setSearchExpression
  private _setSearchExpression(
    filterExpression: string,
    featureLayerViewIndex: number
  ): void {
    const { searchExpressions } = this;
    if (searchExpressions.getItemAt(featureLayerViewIndex)) {
      searchExpressions.removeAt(featureLayerViewIndex);
    }
    searchExpressions.add(filterExpression, featureLayerViewIndex);
    searchExpressions.removeAt(featureLayerViewIndex + 1);
  }
}

export = InteractiveStyleViewModel;
