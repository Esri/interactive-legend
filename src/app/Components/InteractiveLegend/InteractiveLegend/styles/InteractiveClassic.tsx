/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// dojo
import * as i18n from "dojo/i18n!../nls/Legend";
import * as i18nInteractiveLegend from "dojo/i18n!../../../../nls/resources";

// esri.widgets.Widget
import Widget = require("esri/widgets/Widget");

// esri.core.accessorSupport.decorators
import {
  declared,
  property,
  subclass,
  aliasOf
} from "esri/core/accessorSupport/decorators";

//esri.widgets.support.widget
import {
  renderable,
  tsx,
  accessibleHandler,
  storeNode
} from "esri/widgets/support/widget";

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.layers.Layer
import Layer = require("esri/layers/Layer");

// esri.layers.ImageryLayer
import ImageryLayer = require("esri/layers/ImageryLayer");

// esri.core.Collection
import Collection = require("esri/core/Collection");

// esri.widgets.Legend.support.ActiveLayerInfo
import ActiveLayerInfo = require("esri/widgets/Legend/support/ActiveLayerInfo");

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

// esri.layers.FeatureLayer
import FeatureLayer = require("esri/layers/FeatureLayer");

// InteractiveClassicViewModel
import InteractiveStyleViewModel = require("./InteractiveStyle/InteractiveStyleViewModel");

// esri.core.Handles
import Handles = require("esri/core/Handles");

// esri.widgets.LayerList.LayerListViewModel
import LayerListViewModel = require("esri/widgets/LayerList/LayerListViewModel");

// styleUtils
import {
  attachToNode,
  getTitle,
  isImageryStretchedLegend,
  isRendererTitle
} from "../support/styleUtils";

// interfaces
import {
  ColorRampElement,
  HeatmapRampElement,
  LegendElement,
  OpacityRampElement,
  RendererTitle,
  SymbolTableElement,
  FilterMode,
  VNode,
  LayerUID,
  StretchRampElement,
  ColorRampStop
} from "../../../../interfaces/interfaces";

import { formatNumber } from "esri/intl";

// RelationshipRamp
import RelationshipRamp = require("../relationshipRamp/RelationshipRamp");

// SelectedStyleData
import SelectedStyleData = require("./InteractiveStyle/SelectedStyleData");

//----------------------------------
//
//  CSS classes
//
//----------------------------------
const CSS = {
  widget: "esri-widget",
  base: "esri-legend esri-widget--panel",
  service: "esri-legend__service",
  label: "esri-legend__service-label",
  layer: "esri-legend__layer",
  groupLayer: "esri-legend__group-layer",
  groupLayerChild: "esri-legend__group-layer-child",
  layerTable: "esri-legend__layer-table",
  layerTableSizeRamp: "esri-legend__layer-table--size-ramp",
  layerChildTable: "esri-legend__layer-child-table",
  layerCaption: "esri-legend__layer-caption",
  layerBody: "esri-legend__layer-body",
  layerRow: "esri-legend__layer-row",
  layerCell: "esri-legend__layer-cell",
  layerInfo: "esri-legend__layer-cell esri-legend__layer-cell--info",
  imageryLayerStretchedImage: "esri-legend__imagery-layer-image--stretched",
  imageryLayerCellStretched: "esri-legend__imagery-layer-cell--stretched",
  imageryLayerInfoStretched: "esri-legend__imagery-layer-info--stretched",
  symbolContainer: "esri-legend__layer-cell esri-legend__layer-cell--symbols",
  symbol: "esri-legend__symbol",
  rampContainer: "esri-legend__ramps",
  sizeRamp: "esri-legend__size-ramp",
  colorRamp: "esri-legend__color-ramp",
  opacityRamp: "esri-legend__opacity-ramp",
  borderlessRamp: "esri-legend__borderless-ramp",
  rampTick: "esri-legend__ramp-tick",
  rampFirstTick: "esri-legend__ramp-tick-first",
  rampLastTick: "esri-legend__ramp-tick-last",
  rampLabelsContainer: "esri-legend__ramp-labels",
  rampLabel: "esri-legend__ramp-label",
  message: "esri-legend__message",
  // common
  header: "esri-widget__heading",
  hidden: "esri-hidden",
  calciteStyles: {
    btn: "btn",
    btnSmall: "btn-small",
    btnClear: "btn-clear",
    error: "icon-ui-error",
    close: "icon-ui-close",
    checkMark: "icon-ui-check-mark"
  },
  // interactive-legend
  interactiveLegend: "esri-interactive-legend",
  interactiveLayerInfo:
    "esri-interactive-legend__layer-cell esri-interactive-legend__layer-cell--info",
  interactiveLegendSizeRamp: "esri-interactive-legend__size-ramp",
  filterLayerRow: "esri-interactive-legend__filter-layer-row",
  selectedRow: "esri-interactive-legend--selected-row",
  loader: "esri-interactive-legend__loader",
  hoverStyles: "esri-interactive-legend--layer-row",
  legendElements: "esri-interactive-legend__legend-elements",
  offScreenScreenshot: "esri-interactive-legend__offscreen",
  interactiveLegendLayerCaption: "esri-interactive-legend__layer-caption",
  interactiveLegendLabel: "esri-interactive-legend__label",
  interactiveLegendLayer: "esri-interactive-legend__layer",
  interactiveLegendService: "esri-interactive-legend__service",
  interactiveLegendLayerRow: "esri-interactive-legend__ramp-layer-row",
  interactiveStyles: "esri-interactive-legend__interactive-styles",
  layerCaptionContainer: "esri-interactive-legend__layer-caption-container",
  interactiveLegendLayerTable: "esri-interactive-legend__layer-table",
  interactiveLegendHeaderContainer: "esri-interactive-legend__header-container",
  interactiveLegendTitleContainer: "esri-interactive-legend__title-container",
  interactiveLegendMainContainer: "esri-interactive-legend__main-container",
  interactiveLegendInfoContainer:
    "esri-interactive-legend__legend-info-container",
  interactiveLegendGrayButtonStyles:
    "esri-interactive-legend__gray-button-styles",
  interactiveLegendResetButton: "esri-interactive-legend__reset-button",
  interactiveLegendLayerRowContainer:
    "esri-interactive-legend__layer-row-container",
  interactiveLegendRemoveOutline: "esri-interactive-legend__remove-outline",
  interactiveRelationshipHeader: "esri-interactive-legend__relationship-header",
  interactiveLegendNoCaption: "esri-interactive-legend__no-caption",
  interactiveLegendButtonContainer: "esri-interactive-legend__button-container",
  updateExtentRelationshipStyles:
    "esri-interactive-legend__relationship-extent-styles",
  noCaptionUpdateExtentEnabled:
    "esri-interactive-legend__no-caption-update-extent",
  singleSymbol: "esri-interactive-legend__single-symbol",
  singleSymbolMargin: "esri-interactive-legend__single-symbol-margin",
  updateExtentStyles: "esri-interactive-legend__update-extent-styles",
  singleSymbolButtonContainer:
    "esri-interactive-legend__single-symbol-button-container",
  removeMarginBottom: "esri-interactive-legend__remove-margin-bottom",
  totalFeatureCount: "esri-interactive-legend__total-feature-count",
  featureCountContainerStyles:
    "esri-interactive-legend__total-feature-count-container",
  contentContainer: "esri-interactive-legend__content-container",
  featureCountContainer: "esri-interactive-legend__feature-count-container",
  selectedIndicatorContainer:
    "esri-interactive-legend--selected-indicator-container",
  extentButton: "esri-interactive-legend__extent-button",
  selectedIndicator: "esri-interactive-legend--selected-indicator",
  boxShadowSelected: "esri-interactive-legend--box-shadow-selected",
  notSelected: "esri-interactive-legend__filter-layer-row--not-selected",
  labelContainer: "esri-interactive-legend__label-container",
  relationshipElements: "esri-interactive-legend__relationship-elements",
  interactiveLegendRelationshipLayer:
    "esri-interactive-legend__relationship-layer",
  onboarding: {
    mainContainer: "esri-interactive-legend__onboarding-main-container",
    contentContainer: "esri-interactive-legend__onboarding-content-container",
    closeContainer: "esri-interactive-legend__onboarding-close-container",
    logoContainer: "esri-interactive-legend__onboarding-logo-container",
    titleContainer: "esri-interactive-legend__onboarding-title-container",
    infoContainer: "esri-interactive-legend__onboarding-info-container",
    imgPreviewContainer:
      "esri-interactive-legend__onboarding-img-preview-container",
    onboardingButtonContainer:
      "esri-interactive-legend__onboarding-button-container"
  }
};

const KEY = "esri-legend__",
  GRADIENT_WIDTH = 24;

@subclass("InteractiveClassic")
class InteractiveClassic extends declared(Widget) {
  //----------------------------------
  //
  //  Variables
  //
  //----------------------------------

  private _handles = new Handles();
  private _interactiveLegendBase: any = null;
  private _filterLayerRowContainerStyles: number = null;

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  // activeLayerInfos
  @aliasOf("viewModel.activeLayerInfos")
  @property()
  activeLayerInfos: Collection<ActiveLayerInfo> = null;

  // view
  @aliasOf("viewModel.view")
  @property()
  view: MapView = null;

  // filterMode
  @aliasOf("viewModel.filterMode")
  @property()
  filterMode: FilterMode = null;

  // layerListViewModel
  @aliasOf("viewModel.layerListViewModel")
  @property()
  layerListViewModel: LayerListViewModel = null;

  // searchExpressions
  @aliasOf("viewModel.searchExpressions")
  @property()
  searchExpressions: Collection<string> = null;

  // searchViewModel
  @aliasOf("viewModel.searchViewModel")
  @property()
  searchViewModel = null;

  // selectedStyleDataCollection
  @aliasOf("viewModel.selectedStyleDataCollection")
  @renderable()
  selectedStyleDataCollection: Collection<SelectedStyleData> = null;

  // opacity
  @aliasOf("viewModel.opacity")
  @renderable()
  opacity: number = null;

  // grayScale
  @aliasOf("viewModel.grayScale")
  @renderable()
  grayScale: number = null;

  // featureCountEnabled
  @aliasOf("viewModel.featureCountEnabled")
  @renderable()
  featureCountEnabled: boolean = null;

  // updateExtentEnabled
  @aliasOf("viewModel.updateExtentEnabled")
  @renderable()
  updateExtentEnabled: boolean = null;

  // relationshipRampElements
  @property()
  relationshipRampElements = [];

  // viewModel
  @renderable(["viewModel.state"])
  @property({
    type: InteractiveStyleViewModel
  })
  viewModel: InteractiveStyleViewModel = new InteractiveStyleViewModel();

  // onboardingPanelEnabled
  @property()
  onboardingPanelEnabled: boolean = null;

  // offscreen
  @property()
  offscreen: boolean = null;

  // type
  @property({ readOnly: true })
  readonly type: "classic" = "classic";

  //-------------------------------------------------------------------
  //
  //  Lifecycle methods
  //
  //-------------------------------------------------------------------

  constructor(params?: any) {
    super();
  }

  postInitialize() {
    this.own([
      watchUtils.on(
        this,
        "viewModel.interactiveStyleData.featureCount",
        "change",
        () => {
          const featureCount = this.get(
            "viewModel.interactiveStyleData.featureCount"
          ) as __esri.Collection;

          featureCount.forEach(featureCountCollection => {
            this.own([
              featureCountCollection.on("change", () => {
                this.scheduleRender();
              })
            ]);
          });
        }
      )
    ]);
  }

  render(): VNode {
    const { state } = this.viewModel;
    const activeLayerInfos = this.activeLayerInfos,
      baseClasses = this.classes(CSS.base, CSS.interactiveLegend, CSS.widget),
      filteredLayers =
        activeLayerInfos &&
        activeLayerInfos
          .toArray()
          .map((activeLayerInfo, activeLayerInfoIndex) =>
            this._renderLegendForLayer(activeLayerInfo, activeLayerInfoIndex)
          )
          .filter(layer => !!layer);

    const offScreenScreenshot = {
      [CSS.offScreenScreenshot]: this.offscreen
    };

    return (
      <div
        bind={this}
        afterCreate={storeNode}
        data-node-ref="_interactiveLegendBase"
        class={baseClasses}
      >
        {this.onboardingPanelEnabled ? (
          this._renderOnboardingPanel()
        ) : (
          <div>
            {filteredLayers && filteredLayers.length ? (
              <div class={CSS.legendElements}>
                {!this.get("selectedStyleDataCollection.length") ? (
                  <div class={CSS.loader} />
                ) : (
                  <div
                    class={this.classes(
                      CSS.interactiveLegendMainContainer,
                      offScreenScreenshot
                    )}
                  >
                    {filteredLayers}
                  </div>
                )}
              </div>
            ) : (
              <div class={CSS.message}>{i18n.noLegend}</div>
            )}
          </div>
        )}
      </div>
    );
  }

  destroy() {
    this._handles.removeAll();
    this._handles.destroy();
    this._handles = null;
  }

  //--------------------------------------------------------------------------
  //
  //  Private methods
  //
  //--------------------------------------------------------------------------

  //--------------------------------------------------------------------------
  //
  //  Render methods
  //
  //--------------------------------------------------------------------------

  // _renderLegendForLayer
  private _renderLegendForLayer(
    activeLayerInfo: ActiveLayerInfo,
    activeLayerInfoIndex: number
  ): VNode {
    const { title } = activeLayerInfo;
    const titleIsString =
      typeof title === "string"
        ? title.indexOf("Description") !== -1 ||
          title.indexOf("Map Notes") !== -1
        : null;
    if (!activeLayerInfo.ready || titleIsString) {
      return null;
    }

    const hasChildren = !!activeLayerInfo.children.length;
    const key = `${KEY}${(activeLayerInfo.layer as LayerUID).uid}-version-${
      activeLayerInfo.version
    }`;

    const featureLayerData = this._getFeatureLayerData(activeLayerInfo);

    const interactiveLegendLabel = {
      [CSS.interactiveLegendLabel]:
        featureLayerData && featureLayerData.applyStyles
    };
    const labelClasses = this.classes(
      CSS.header,
      CSS.label,
      interactiveLegendLabel
    );

    const titleContainer = {
      [CSS.interactiveLegendTitleContainer]:
        featureLayerData && featureLayerData.applyStyles
    };
    const totalFeatureCountArr = this.get(
      "viewModel.interactiveStyleData.totalFeatureCount"
    );
    const operationalItemIndex = this._getOperationalItemIndex(activeLayerInfo);

    const totalFeatureCountForLegend =
      totalFeatureCountArr[operationalItemIndex];

    const relationshipRamp = this.relationshipRampElements[
      operationalItemIndex
    ];

    const relationshipFeatureCount =
      this.featureCountEnabled &&
      relationshipRamp &&
      relationshipRamp.twoDimensionRamp.hasOwnProperty("shape") &&
      relationshipRamp.twoDimensionRamp.shape.featureCount;

    const labelNode = activeLayerInfo.title ? (
      <div class={this.classes(titleContainer)}>
        <h3 class={labelClasses}>{activeLayerInfo.title}</h3>
      </div>
    ) : null;

    if (hasChildren) {
      const layers = activeLayerInfo.children
        .map(childActiveLayerInfo =>
          this._renderLegendForLayer(childActiveLayerInfo, activeLayerInfoIndex)
        )
        .toArray();

      const interactiveLegendService = {
        [CSS.interactiveLegendService]:
          featureLayerData && featureLayerData.applyStyles
      };

      const service = this.classes(
        CSS.service,
        CSS.groupLayer,
        interactiveLegendService
      );

      return (
        <div key={key} class={service}>
          {labelNode}
          {layers}
        </div>
      );
    } else {
      const { legendElements } = activeLayerInfo;

      if (legendElements && !legendElements.length) {
        return null;
      }
      const operationalItemIndex = this._getOperationalItemIndex(
        activeLayerInfo
      );

      const filteredElements = legendElements
        .map((legendElement, legendElementIndex) => {
          return this._renderLegendForElement(
            legendElement as SymbolTableElement,
            activeLayerInfo.layer,
            legendElementIndex,
            activeLayerInfo,
            activeLayerInfoIndex,
            operationalItemIndex,
            legendElement.infos
          );
        })
        .filter(element => !!element);

      if (!filteredElements.length) {
        return null;
      }

      const layerClasses = {
        [CSS.groupLayerChild]: !!activeLayerInfo.parent
      };

      const interactiveLegendService = {
        [CSS.interactiveLegendService]:
          featureLayerData && featureLayerData.applyStyles
      };

      const service = this.classes(
        CSS.service,
        layerClasses,
        interactiveLegendService
      );

      const isRelationship =
        activeLayerInfo.get("layer.renderer.authoringInfo.type") ===
        "relationship";

      const interactiveLegendLayer = {
        [CSS.interactiveLegendLayer]:
          featureLayerData && featureLayerData.applyStyles,
        [CSS.interactiveLegendRelationshipLayer]: isRelationship
      };

      const layer = this.classes(CSS.layer, interactiveLegendLayer);

      const interactiveStyles = {
        [CSS.interactiveStyles]:
          featureLayerData && featureLayerData.applyStyles
      };

      const labelContainer = {
        [CSS.labelContainer]:
          activeLayerInfo &&
          activeLayerInfo.get("layer.renderer.authoringInfo.type") ===
            "relationship"
      };
      return (
        <div key={key} class={service}>
          <div class={this.classes(interactiveStyles)}>
            <div class={this.classes(labelContainer)}>
              {labelNode}
              {this.featureCountEnabled &&
              featureLayerData &&
              featureLayerData.applyStyles ? (
                isNaN(relationshipFeatureCount) ? (
                  <div class={CSS.featureCountContainerStyles}>
                    <span class={CSS.totalFeatureCount}>
                      {totalFeatureCountForLegend ||
                      totalFeatureCountForLegend === 0
                        ? `${i18nInteractiveLegend.totalFeatureCount}: ${totalFeatureCountForLegend}`
                        : null}
                    </span>
                  </div>
                ) : (
                  <div class={CSS.featureCountContainerStyles}>
                    <span class={CSS.totalFeatureCount}>
                      {relationshipFeatureCount ||
                      relationshipFeatureCount === 0
                        ? `${i18nInteractiveLegend.totalFeatureCount}: ${relationshipFeatureCount}`
                        : null}
                    </span>
                  </div>
                )
              ) : null}
            </div>
            <div class={layer}>{filteredElements}</div>
          </div>
        </div>
      );
    }
  }

  // _renderLegendForElement
  private _renderLegendForElement(
    legendElement: LegendElement,
    layer: Layer,
    legendElementIndex: number,
    activeLayerInfo: ActiveLayerInfo,
    activeLayerInfoIndex: number,
    operationalItemIndex: number,
    legendElementInfos: any[],
    isChild?: boolean
  ): VNode {
    const { type } = legendElement;
    const isColorRamp = type === "color-ramp",
      isOpacityRamp = type === "opacity-ramp",
      isSizeRamp = type === "size-ramp",
      isHeatRamp = type === "heatmap-ramp";

    let content: any = null;

    const selectedStyleData = this.selectedStyleDataCollection.getItemAt(
      operationalItemIndex
    );

    const field =
      selectedStyleData && (selectedStyleData.get("field") as string);

    const normalizationField =
      selectedStyleData &&
      (selectedStyleData.get("normalizationField") as string);

    // build symbol table or size ramp
    if (legendElement.type === "symbol-table" || isSizeRamp) {
      const rows = (legendElement.infos as any)
        .map((info: any, legendInfoIndex: number) => {
          const elementInfo = this._renderLegendForElementInfo(
            info,
            layer,
            isSizeRamp,
            (legendElement as SymbolTableElement).legendType,
            legendInfoIndex,
            field,
            legendElementIndex,
            legendElement,
            activeLayerInfo,
            activeLayerInfoIndex,
            operationalItemIndex,
            legendElementInfos,
            normalizationField
          );

          return elementInfo;
        })
        .filter((row: any) => !!row);
      const featureLayerView = this.viewModel.featureLayerViews.getItemAt(
        operationalItemIndex
      );
      const type =
        featureLayerView &&
        featureLayerView.get("layer.renderer.authoringInfo.type");

      const isSizeRampBody = {
        [CSS.interactiveLegendSizeRamp]:
          type === "class-breaks-size" || isSizeRamp
      };
      if (rows.length) {
        content = (
          <div class={this.classes(CSS.layerBody, isSizeRampBody)}>{rows}</div>
        );
      }
    } else if (
      legendElement.type === "color-ramp" ||
      legendElement.type === "opacity-ramp" ||
      legendElement.type === "heatmap-ramp"
    ) {
      content = this._renderLegendForRamp(
        legendElement,
        layer.opacity,
        activeLayerInfo,
        legendElementIndex
      );
    } else if (legendElement.type === "relationship-ramp") {
      const layerView = this.viewModel.featureLayerViews.getItemAt(
        operationalItemIndex
      )
        ? this.viewModel.featureLayerViews.getItemAt(operationalItemIndex)
        : null;
      if (!this.relationshipRampElements[operationalItemIndex] && layerView) {
        this.relationshipRampElements[
          operationalItemIndex
        ] = new RelationshipRamp({
          legendElement,
          id: this.id,
          view: this.view,
          activeLayerInfos: this.activeLayerInfos,
          layerView,
          filterMode: this.filterMode,
          opacity: this.opacity,
          grayScale: this.grayScale,
          searchViewModel: this.searchViewModel,
          layerListViewModel: this.layerListViewModel,
          featureCountEnabled: this.featureCountEnabled
        });
        const relationshipElement = this.relationshipRampElements[
          operationalItemIndex
        ];
        this._handles.add(
          watchUtils.watch(
            relationshipElement,
            "twoDimensionRamp.shape.featureCount",
            () => {
              this.scheduleRender();
            }
          )
        );
      }

      content = this.relationshipRampElements[operationalItemIndex]
        ? this.relationshipRampElements[operationalItemIndex].render()
        : null;
    }

    if (!content) {
      return null;
    }

    const titleObj = legendElement.title;
    let title: string = null;
    if (typeof titleObj === "string") {
      title = titleObj;
    } else if (titleObj) {
      const genTitle = getTitle(titleObj, isColorRamp || isOpacityRamp);
      if (
        isRendererTitle(titleObj, isColorRamp || isOpacityRamp) &&
        titleObj.title
      ) {
        title = `${(titleObj as RendererTitle).title} (${genTitle})`;
      } else {
        title = genTitle;
      }
    }

    const featureLayerData = this._getFeatureLayerData(activeLayerInfo);

    const interactiveLegendLayerCaption = {
      [CSS.interactiveLegendLayerCaption]:
        featureLayerData && featureLayerData.applyStyles
    };

    const layerCaption = this.classes(
      CSS.layerCaption,
      interactiveLegendLayerCaption
    );

    const interactiveLegendLayerTable = {
      [CSS.interactiveLegendLayerTable]:
        featureLayerData &&
        featureLayerData.applyStyles &&
        !(isColorRamp || isOpacityRamp || isSizeRamp || isHeatRamp)
    };

    const singleSymbolMargin = {
      [CSS.singleSymbolMargin]:
        legendElementInfos && legendElementInfos.length === 1
    };

    const layerTable = this.classes(
      CSS.layerTable,
      interactiveLegendLayerTable,
      singleSymbolMargin
    );
    const isRelationship = this._checkForRelationshipLegend(
      legendElement,
      operationalItemIndex
    );

    const resetButton = this.offscreen
      ? null
      : this._renderResetButton(
          featureLayerData,
          operationalItemIndex,
          legendElementInfos,
          legendElement
        );
    const zoomToButton =
      this.offscreen || !this.updateExtentEnabled
        ? null
        : this._renderZoomToButton(operationalItemIndex);
    const featureLayer = activeLayerInfo.layer as FeatureLayer;

    const predominanceType = featureLayer.get("renderer.authoringInfo.type");

    const isTypePredominance = predominanceType === "predominance";

    const singleSymbol =
      legendElementInfos && legendElementInfos.length === 1 && !field;

    const updateExtentStyles = {
      [CSS.updateExtentStyles]:
        zoomToButton && legendElementInfos && legendElementInfos.length > 1
    };

    const updateExtentRelationshipStyles = {
      [CSS.updateExtentRelationshipStyles]: this.updateExtentEnabled
    };
    const relationShipHeader = {
      [CSS.interactiveRelationshipHeader]: isRelationship
    };

    const hasField = {
      [CSS.singleSymbolButtonContainer]: !field
    };

    const removeMarginBottom = {
      [CSS.removeMarginBottom]: !field && !isTypePredominance
    };

    const allowInteractivity = this._checkForInteractivity(
      activeLayerInfo,
      legendElement,
      operationalItemIndex,
      featureLayerData,
      singleSymbol,
      isTypePredominance,
      field
    );

    const tableClass = isChild ? CSS.layerChildTable : layerTable,
      caption =
        title ||
        (legendElementInfos && legendElementInfos.length === 1 && !field) ? (
          allowInteractivity ? (
            legendElementInfos &&
            legendElementInfos.length === 1 &&
            !field &&
            !this.updateExtentEnabled ? null : (
              <div
                class={this.classes(
                  CSS.interactiveLegendHeaderContainer,
                  removeMarginBottom,
                  relationShipHeader,
                  updateExtentStyles,
                  updateExtentRelationshipStyles
                )}
              >
                {title ? (
                  <div
                    key="layer-caption"
                    class={this.classes(
                      layerCaption,
                      CSS.layerCaptionContainer
                    )}
                  >
                    {title}
                  </div>
                ) : null}

                {allowInteractivity ? (
                  !title &&
                  legendElementInfos &&
                  legendElementInfos.length > 1 ? (
                    <div class={CSS.interactiveLegendNoCaption}>
                      {zoomToButton}
                      {resetButton}
                    </div>
                  ) : legendElementInfos && legendElementInfos.length === 1 ? (
                    <div
                      class={this.classes(
                        CSS.interactiveLegendButtonContainer,
                        hasField
                      )}
                    >
                      {zoomToButton}
                    </div>
                  ) : (
                    <div class={CSS.interactiveLegendButtonContainer}>
                      {zoomToButton}
                      {resetButton}
                    </div>
                  )
                ) : null}
              </div>
            )
          ) : (
            <div class={layerCaption}>{title}</div>
          )
        ) : null;
    const tableClasses = {
      [CSS.layerTableSizeRamp]: isSizeRamp || !isChild
    };
    const noCaptionUpdateExtent = {
      [CSS.noCaptionUpdateExtentEnabled]: this.updateExtentEnabled
    };

    const relationshipStyles = {
      [CSS.relationshipElements]: isRelationship
    };
    return (
      <div class={this.classes(tableClass, tableClasses, relationshipStyles)}>
        {caption}
        {(field && allowInteractivity && !caption) ||
        (isTypePredominance && !isSizeRamp && !isOpacityRamp && !caption) ? (
          <div>
            <div
              class={this.classes(
                CSS.interactiveLegendNoCaption,
                noCaptionUpdateExtent
              )}
            >
              {zoomToButton}
              {resetButton}
            </div>
          </div>
        ) : null}

        <div key={operationalItemIndex} class={CSS.contentContainer}>
          {content}
        </div>
      </div>
    );
  }

  // _renderLegendForRamp
  private _renderLegendForRamp(
    legendElement:
      | ColorRampElement
      | StretchRampElement
      | OpacityRampElement
      | HeatmapRampElement,
    opacity: number,
    activeLayerInfo: ActiveLayerInfo,
    legendElementIndex: number
  ): VNode {
    const rampStops: any[] = legendElement.infos;
    const isOpacityRamp = legendElement.type === "opacity-ramp";
    const isHeatmapRamp = legendElement.type === "heatmap-ramp";
    const isStretchRamp = legendElement.type === "stretch-ramp";

    const rampDiv = legendElement.preview;
    const opacityRampClass = isOpacityRamp ? CSS.opacityRamp : "";
    rampDiv.className = `${CSS.colorRamp} ${opacityRampClass}`;

    if (opacity != null) {
      rampDiv.style.opacity = opacity.toString();
    }

    const labelsContent = rampStops.map(stop => (
      <div class={stop.label ? CSS.rampLabel : null}>
        {isHeatmapRamp
          ? i18n[stop.label]
          : isStretchRamp
          ? this._getStretchStopLabel(stop)
          : stop.label}
      </div>
    ));

    const symbolContainerStyles = { width: `${GRADIENT_WIDTH}px` },
      rampLabelsContainerStyles = { height: rampDiv.style.height };

    return (
      <div class={CSS.layerRow}>
        <div
          key={`${activeLayerInfo.layer.id}-${legendElementIndex}`}
          class={CSS.symbolContainer}
          styles={symbolContainerStyles}
        >
          <div
            class={CSS.rampContainer}
            bind={rampDiv}
            afterCreate={attachToNode}
          />
        </div>
        <div class={CSS.layerInfo}>
          <div
            class={CSS.rampLabelsContainer}
            styles={rampLabelsContainerStyles}
          >
            {labelsContent}
          </div>
        </div>
      </div>
    );
  }

  // _getStretchStopLabel
  private _getStretchStopLabel(stop: ColorRampStop): String {
    return stop.label
      ? i18n[stop.label] +
          ": " +
          formatNumber(stop.value, {
            style: "decimal"
          })
      : "";
  }

  // _renderLegendForElementInfo
  private _renderLegendForElementInfo(
    elementInfo: any,
    layer: Layer,
    isSizeRamp: boolean,
    legendType: string,
    legendInfoIndex: number,
    field: string,
    legendElementIndex: number,
    legendElement: LegendElement,
    activeLayerInfo: ActiveLayerInfo,
    activeLayerInfoIndex: number,
    operationalItemIndex: number,
    legendElementInfos: any[],
    normalizationField: string
  ): VNode {
    // nested
    if (elementInfo.type) {
      return this._renderLegendForElement(
        elementInfo,
        layer,
        legendElementIndex,
        activeLayerInfo,
        activeLayerInfoIndex,
        operationalItemIndex,
        legendElementInfos,
        true
      );
    }

    let content: any = null;
    const isStretched = isImageryStretchedLegend(
      layer as ImageryLayer,
      legendType
    );

    if (elementInfo.symbol && elementInfo.preview) {
      content = (
        <div
          class={CSS.symbol}
          bind={elementInfo.preview}
          afterCreate={attachToNode}
        />
      );
    } else if (elementInfo.src) {
      content = this._renderImage(elementInfo, layer, isStretched);
    }

    if (!content) {
      return null;
    }

    const labelClasses = {
      [CSS.imageryLayerInfoStretched]: isStretched
    };
    const featureLayerView = this.viewModel.featureLayerViews.getItemAt(
      operationalItemIndex
    );
    const symbolClasses = {
      [CSS.imageryLayerInfoStretched]: isStretched,
      [CSS.sizeRamp]: !isStretched && isSizeRamp,
      [CSS.interactiveLegendSizeRamp]:
        (featureLayerView &&
          featureLayerView.get("layer.renderer.authoringInfo.type") ===
            "class-breaks-size") ||
        isSizeRamp
    };
    const queryExpressionsCollection = this.get(
      "viewModel.interactiveStyleData.queryExpressions"
    ) as __esri.Collection;

    const queryExpressions = queryExpressionsCollection.getItemAt(
      operationalItemIndex
    );

    let selectedRow = null;
    let selectedInfoIndex = null;
    if (this.selectedStyleDataCollection.length > 0) {
      const featureLayerData = this._getFeatureLayerData(activeLayerInfo);
      if (featureLayerData) {
        const selectedIndex =
          featureLayerData.selectedInfoIndex[legendElementIndex];
        selectedInfoIndex = selectedIndex ? selectedIndex : null;

        const nonSelectedRowStyles = this.classes(
          CSS.layerRow,
          CSS.filterLayerRow,
          CSS.hoverStyles,
          CSS.notSelected
        );

        const selectedRowStyles = this.classes(
          CSS.layerRow,
          CSS.filterLayerRow,
          CSS.hoverStyles,
          CSS.selectedRow
        );

        if (legendElementInfos && legendElementInfos.length === 1) {
          selectedRow =
            (selectedInfoIndex && selectedInfoIndex.length === 0) ||
            (selectedInfoIndex === null &&
              queryExpressions &&
              queryExpressions[0] !== "1=0")
              ? selectedRowStyles
              : nonSelectedRowStyles;
        } else {
          selectedRow = selectedInfoIndex
            ? (featureLayerData.selectedInfoIndex &&
                selectedInfoIndex.indexOf(legendInfoIndex) === -1 &&
                selectedInfoIndex.length > 0) ||
              (queryExpressions && queryExpressions[0] === "1=0")
              ? nonSelectedRowStyles
              : selectedRowStyles
            : selectedRowStyles;
        }
      }
    }

    const featureLayer = activeLayerInfo.layer as FeatureLayer;

    const isRelationship = this._checkForRelationshipLegend(
      legendElement,
      operationalItemIndex
    );
    const isPredominance =
      featureLayer.get("renderer.authoringInfo.type") === "predominance";

    const featureLayerData = this._getFeatureLayerData(activeLayerInfo);
    const singleSymbol =
      legendElementInfos && legendElementInfos.length === 1 && !field;

    const classifyDataCheckedColorRamp = this._colorRampCheck(activeLayerInfo);

    const classifyDataCheckedSizeRamp =
      featureLayerView &&
      featureLayerView.get("layer.renderer.authoringInfo.type") ===
        "class-breaks-size";

    const isColorRamp = legendElement.type === "color-ramp";

    const classBreakInfos =
      featureLayerView &&
      (featureLayerView.get(
        "layer.renderer.classBreakInfos"
      ) as __esri.ClassBreak[]);

    const hasMoreThanOneClassBreak =
      featureLayerView && classBreakInfos && classBreakInfos.length > 1;

    const allowSelectStyles =
      activeLayerInfo && activeLayerInfo.get("layer.type") === "feature"
        ? classBreakInfos
          ? (!activeLayerInfo.layer.hasOwnProperty("sublayers") &&
              activeLayerInfo.layer.type === "feature" &&
              field &&
              !isColorRamp &&
              !isSizeRamp &&
              hasMoreThanOneClassBreak &&
              featureLayerData) ||
            (isPredominance && !isSizeRamp) ||
            (classifyDataCheckedColorRamp && field) ||
            (classifyDataCheckedSizeRamp && field) ||
            (singleSymbol && !field && field !== null) ||
            isRelationship
          : (!activeLayerInfo.layer.hasOwnProperty("sublayers") &&
              activeLayerInfo.layer.type === "feature" &&
              field &&
              !isColorRamp &&
              !isSizeRamp &&
              featureLayerData) ||
            (isPredominance && !isSizeRamp) ||
            (classifyDataCheckedColorRamp && field) ||
            (classifyDataCheckedSizeRamp && field) ||
            (singleSymbol && !field && field !== null) ||
            isRelationship
        : false;

    const applySelect = allowSelectStyles ? selectedRow : null;
    if (featureLayerData && featureLayerData.applyStyles === null) {
      featureLayerData.applyStyles = applySelect ? true : false;

      this.scheduleRender();
    }
    if (allowSelectStyles) {
      if (this.featureCountEnabled) {
        this.viewModel.queryFeatureCount(
          elementInfo,
          field,
          legendInfoIndex,
          operationalItemIndex,
          legendElement,
          isPredominance,
          legendElementIndex,
          legendElementInfos,
          normalizationField,
          true
        );
      }
    }
    // FEATURE COUNT VARIABLES
    const featureCountArrForLayer = this.get(
      "viewModel.interactiveStyleData.featureCount"
    ) as __esri.Collection;

    const featureCountArrForLegend = featureCountArrForLayer.getItemAt(
      operationalItemIndex
    );

    const featureCountArrForElementInfo =
      featureCountArrForLayer && featureCountArrForLegend
        ? featureCountArrForLegend.getItemAt(legendInfoIndex)
        : null;

    const singleSymbolStyles = {
      [CSS.singleSymbol]:
        legendElementInfos && legendElementInfos.length === 1 && !field
    };
    const removeScrollbarFlicker = this._removeScrollbarFlicker();

    if (applySelect && !isRelationship) {
      const selected = this._getSelectedValue(
        legendElementInfos,
        legendInfoIndex,
        selectedInfoIndex,
        featureLayerData,
        queryExpressions
      );

      const boxShadow = {
        [CSS.boxShadowSelected]: selected
      };

      return (
        <div
          style={removeScrollbarFlicker}
          class={CSS.interactiveLegendLayerRowContainer}
        >
          <div
            bind={this}
            class={
              activeLayerInfo && activeLayerInfo.get("layer.type") === "feature"
                ? (field && featureLayerData && !isSizeRamp) ||
                  (isPredominance && !isSizeRamp) ||
                  singleSymbol
                  ? this.classes(applySelect, singleSymbolStyles, boxShadow)
                  : CSS.interactiveLegendRemoveOutline
                : CSS.interactiveLegendRemoveOutline
            }
            onclick={(event: Event) => {
              if (allowSelectStyles) {
                this._handleFilterOption(
                  event,
                  elementInfo,
                  field,
                  legendInfoIndex,
                  operationalItemIndex,
                  legendElement,
                  isPredominance,
                  legendElementIndex,
                  legendElementInfos,
                  normalizationField
                );
              }
            }}
            onkeydown={(event: Event) => {
              if (allowSelectStyles) {
                this._handleFilterOption(
                  event,
                  elementInfo,
                  field,
                  legendInfoIndex,
                  operationalItemIndex,
                  legendElement,
                  isPredominance,
                  legendElementIndex,
                  legendElementInfos,
                  normalizationField
                );
              }
            }}
            tabIndex={
              activeLayerInfo.layer.type === "feature" &&
              !this.offscreen &&
              ((field && featureLayerData && !isSizeRamp) ||
                (isPredominance && !isSizeRamp) ||
                singleSymbol)
                ? 0
                : -1
            }
            data-legend-index={`${legendElementIndex}`}
            data-child-index={`${legendInfoIndex}`}
            data-layer-id={`${activeLayerInfo.layer.id}`}
          >
            <div class={CSS.selectedIndicatorContainer}>
              {selected && !isSizeRamp ? (
                <div class={CSS.selectedIndicator} />
              ) : null}
            </div>
            <div class={CSS.interactiveLegendInfoContainer}>
              <div
                key={`${activeLayerInfo.layer.id}-${legendElementIndex}`}
                class={this.classes(CSS.symbolContainer, symbolClasses)}
              >
                {content}
              </div>
              <div
                class={this.classes(
                  CSS.layerInfo,
                  labelClasses,
                  CSS.interactiveLayerInfo
                )}
              >
                {getTitle(elementInfo.label, false) || ""}
              </div>
            </div>
            <div class={CSS.featureCountContainer}>
              {selected && !isSizeRamp ? featureCountArrForElementInfo : null}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div class={CSS.layerRow}>
          <div
            key={`${activeLayerInfo.layer.id}-${legendElementIndex}`}
            class={this.classes(CSS.symbolContainer, symbolClasses)}
          >
            {content}
          </div>
          <div class={this.classes(CSS.layerInfo, labelClasses)}>
            {getTitle(elementInfo.label, false) || ""}
          </div>
        </div>
      );
    }
  }

  // _renderImage
  private _renderImage(
    elementInfo: any,
    layer: Layer,
    isStretched: boolean
  ): VNode {
    const { label, src, opacity } = elementInfo;

    const stretchedClasses = {
      [CSS.imageryLayerStretchedImage]: isStretched,
      [CSS.symbol]: !isStretched
    };

    const dynamicStyles = {
      opacity: `${opacity != null ? opacity : layer.opacity}`
    };

    return (
      <img
        class={this.classes(stretchedClasses)}
        styles={dynamicStyles}
        src={src}
        alt={label}
        border={0}
        width={elementInfo.width}
        height={elementInfo.height}
      />
    );
  }

  // _renderOnboardingPanel
  private _renderOnboardingPanel(): any {
    const {
      close,
      newInteractiveLegend,
      onboardingConfirmation,
      firstOnboardingWelcomeMessage,
      secondOnboardingWelcomeMessage,
      thirdOnboardingWelcomeMessage
    } = i18nInteractiveLegend;

    const relationshipTest = this.activeLayerInfos.filter(activeLayerInfo => {
      return (
        activeLayerInfo.get("layer.renderer.authoringInfo.type") ===
        "relationship"
      );
    });
    return (
      <div class={CSS.onboarding.mainContainer}>
        <div key="onboarding-panel" class={CSS.onboarding.contentContainer}>
          <div class={CSS.onboarding.closeContainer}>
            <span
              bind={this}
              onclick={this._disableOnboarding}
              onkeydown={this._disableOnboarding}
              tabIndex={0}
              class={CSS.calciteStyles.close}
              title={close}
            />
          </div>
          <div class={CSS.onboarding.logoContainer} />
          <div class={CSS.onboarding.titleContainer}>
            <h3>{newInteractiveLegend}</h3>
          </div>
          <div class={CSS.onboarding.infoContainer}>
            <p>{firstOnboardingWelcomeMessage}</p>
            <p>{secondOnboardingWelcomeMessage}</p>
            <p>{thirdOnboardingWelcomeMessage}</p>
          </div>
        </div>
        <div class={CSS.onboarding.onboardingButtonContainer}>
          <button
            bind={this}
            onclick={this._disableOnboarding}
            onkeydown={this._disableOnboarding}
            tabIndex={0}
            class={CSS.calciteStyles.btn}
            title={onboardingConfirmation}
          >
            {onboardingConfirmation}
          </button>
        </div>
      </div>
    );
  }

  // _renderResetButton
  private _renderResetButton(
    featureLayerData: SelectedStyleData,
    operationalItemIndex: number,
    legendElementInfos: any[],
    legendElement: LegendElement
  ): VNode {
    const isRelationship = this._checkForRelationshipLegend(
      legendElement,
      operationalItemIndex
    );
    let disabled = null;
    if (isRelationship) {
      disabled = this._handleDisableForRelationship(operationalItemIndex);
    } else {
      disabled = this._handleDisableForShowAll(
        operationalItemIndex,
        legendElementInfos
      );
    }

    const grayStyles = {
      [CSS.interactiveLegendGrayButtonStyles]: disabled
    };

    return (
      <button
        bind={this}
        class={this.classes(
          CSS.interactiveLegendResetButton,
          CSS.calciteStyles.btn,
          CSS.calciteStyles.btnClear,
          CSS.calciteStyles.btnSmall,
          grayStyles
        )}
        tabIndex={this.offscreen ? -1 : 0}
        disabled={disabled ? true : false}
        onclick={(event: Event) => {
          this._resetLegendFilter(featureLayerData, operationalItemIndex);
        }}
        onkeydown={(event: Event) => {
          this._resetLegendFilter(featureLayerData, operationalItemIndex);
        }}
      >
        {i18nInteractiveLegend.showAll}
      </button>
    );
  }

  // _renderZoomToButton
  private _renderZoomToButton(operationalItemIndex: number): VNode {
    return (
      <button
        bind={this}
        class={this.classes(
          CSS.calciteStyles.btn,
          CSS.calciteStyles.btnClear,
          CSS.calciteStyles.btnSmall,
          CSS.extentButton
        )}
        tabIndex={this.offscreen ? -1 : 0}
        onclick={(event: Event) => {
          this.viewModel.updateExtentToAllFeatures(operationalItemIndex);
        }}
        onkeydown={(event: Event) => {
          this.viewModel.updateExtentToAllFeatures(operationalItemIndex);
        }}
      >
        {i18nInteractiveLegend.zoomTo}
      </button>
    );
  }

  //-------------------------------------------------------------------
  //
  //  Filter methods
  //
  //-------------------------------------------------------------------

  @accessibleHandler()
  private _handleFilterOption(
    event: Event,
    elementInfo: any,
    field: string,
    legendInfoIndex: number,
    operationalItemIndex: number,
    legendElement: LegendElement,
    isPredominance: boolean,
    legendElementIndex: number,
    legendElementInfos?: any[],
    normalizationField?: string
  ): void {
    if (this.filterMode === "featureFilter") {
      this._featureFilter(
        event,
        elementInfo,
        field,
        operationalItemIndex,
        legendInfoIndex,
        legendElement,
        isPredominance,
        legendElementInfos,
        normalizationField
      );
    } else if (this.filterMode === "mute") {
      this._featureMute(
        event,
        elementInfo,
        field,
        legendInfoIndex,
        operationalItemIndex,
        legendElement,
        legendElementInfos,
        isPredominance,
        normalizationField
      );
    }

    if (this.featureCountEnabled) {
      this.viewModel.updateTotalFeatureCount(
        operationalItemIndex,
        legendElementIndex
      );
      this.scheduleRender();
    }
  }

  //_filterFeatures
  private _featureFilter(
    event: Event,
    elementInfo: any,
    field: string,
    operationalItemIndex: number,
    legendInfoIndex: number,
    legendElement: LegendElement,
    isPredominance: boolean,
    legendElementInfos?: any[],
    normalizationField?: string
  ): void {
    this._handleSelectedStyles(event, legendElementInfos);
    this.viewModel.applyFeatureFilter(
      elementInfo,
      field,
      operationalItemIndex,
      legendElement,
      legendInfoIndex,
      isPredominance,
      legendElementInfos,
      normalizationField
    );
  }

  // _muteFeatures
  private _featureMute(
    event: Event,
    elementInfo: any,
    field: string,
    legendInfoIndex: number,
    operationalItemIndex: number,
    legendElement: LegendElement,
    legendElementInfos: any[],
    isPredominance: boolean,
    normalizationField?: string
  ): void {
    this._handleSelectedStyles(event, legendElementInfos);
    this.viewModel.applyFeatureMute(
      elementInfo,
      field,
      legendInfoIndex,
      operationalItemIndex,
      legendElement,
      legendElementInfos,
      isPredominance,
      normalizationField
    );
  }
  // End of filter methods

  // _resetLegendFilter
  @accessibleHandler()
  private _resetLegendFilter(
    featureLayerData: any,
    operationalItemIndex: number
  ): void {
    this.viewModel.resetLegendFilter(featureLayerData, operationalItemIndex);
    if (this.featureCountEnabled) {
      this.viewModel.queryTotalFeatureCount(operationalItemIndex);
    }
  }

  // _disableOnboarding
  @accessibleHandler()
  private _disableOnboarding(): void {
    this.onboardingPanelEnabled = false;
    this.scheduleRender();
  }

  // _handleSelectedStyles
  private _handleSelectedStyles(event: Event, legendElementInfos: any[]): void {
    const node = event.currentTarget as HTMLElement;
    const legendElementInfoIndex = parseInt(
      node.getAttribute("data-child-index")
    );
    const legendElementIndex = parseInt(node.getAttribute("data-legend-index"));
    const activeLayerInfoId = node.getAttribute("data-layer-id");
    const featureLayerData = this.selectedStyleDataCollection.find(
      layerData => {
        return layerData ? layerData.layerItemId === activeLayerInfoId : null;
      }
    );

    const legendElementChildArr =
      featureLayerData.selectedInfoIndex[legendElementIndex];

    if (
      Array.isArray(legendElementChildArr) &&
      legendElementChildArr.length >= 1
    ) {
      legendElementChildArr.indexOf(legendElementInfoIndex) === -1
        ? legendElementChildArr.push(legendElementInfoIndex)
        : legendElementChildArr.splice(
            legendElementChildArr.indexOf(legendElementInfoIndex),
            1
          );
    } else {
      featureLayerData.selectedInfoIndex[legendElementIndex] = [
        legendElementInfoIndex
      ];
    }
  }

  // _removeScrollbarFlicker
  private _removeScrollbarFlicker(): string {
    const intLegend = this._interactiveLegendBase;
    const layerRowContainer = document.querySelector(
      `.${CSS.interactiveLegendLayerRowContainer}`
    );
    const { clientHeight } = intLegend;
    const maxHeight = intLegend
      ? parseFloat(getComputedStyle(intLegend).maxHeight)
      : null;

    const paddingBottom = layerRowContainer
      ? parseFloat(getComputedStyle(layerRowContainer).paddingBottom)
      : null;
    if (!this._filterLayerRowContainerStyles) {
      this._filterLayerRowContainerStyles = paddingBottom;
    }
    return this._filterLayerRowContainerStyles &&
      maxHeight < clientHeight + 5 &&
      maxHeight > clientHeight - 5
      ? `padding-bottom: ${this._filterLayerRowContainerStyles + 2}px`
      : null;
  }

  // _handleDisableForRelationship
  private _handleDisableForRelationship(operationalItemIndex: number): boolean {
    const relationshipElement = this.relationshipRampElements[
      operationalItemIndex
    ];
    if (
      relationshipElement &&
      relationshipElement.twoDimensionRamp &&
      relationshipElement.twoDimensionRamp.shape &&
      relationshipElement.twoDimensionRamp.shape.queryExpressions
    ) {
      const {
        numClasses
      } = relationshipElement.twoDimensionRamp.shape.colorRampProperties;
      const { queryExpressions } = relationshipElement.twoDimensionRamp.shape;
      if (queryExpressions.length === 0) {
        return true;
      }
      if (numClasses === 2) {
        if (queryExpressions.length === 4) {
          return true;
        }
      } else if (numClasses === 3) {
        if (queryExpressions.length === 9) {
          return true;
        }
      } else if (numClasses === 4) {
        if (queryExpressions.length === 16) {
          return true;
        }
      }
    }
  }

  // _handleDisableForShowAll
  private _handleDisableForShowAll(
    operationalItemIndex: number,
    legendElementInfos: any[]
  ) {
    const queryExpressionCollection = this.get(
      "viewModel.interactiveStyleData.queryExpressions"
    ) as __esri.Collection;

    const queryExpressions = queryExpressionCollection.getItemAt(
      operationalItemIndex
    );

    const disabled =
      queryExpressions &&
      (queryExpressions.length === 0 ||
        (queryExpressions.length ===
          (legendElementInfos && legendElementInfos.length) &&
          legendElementInfos.length > 1))
        ? true
        : false;

    return disabled;
  }

  // _checkForInteractivity
  private _checkForInteractivity(
    activeLayerInfo: ActiveLayerInfo,
    legendElement: LegendElement,
    operationalItemIndex: number,
    featureLayerData: any,
    singleSymbol: boolean,
    isTypePredominance: boolean,
    field: string
  ) {
    if (activeLayerInfo && activeLayerInfo.get("layer.type") !== "feature") {
      return false;
    }
    const isRelationship = this._checkForRelationshipLegend(
      legendElement,
      operationalItemIndex
    );

    const classifyDataCheckedColorRamp = this._colorRampCheck(activeLayerInfo);

    const featureLayerView = this.viewModel.featureLayerViews.getItemAt(
      operationalItemIndex
    );

    const { type } = legendElement;
    const isOpacityRamp = type === "opacity-ramp",
      isSizeRamp = type === "size-ramp",
      isHeatRamp = type === "heatmap-ramp",
      isColorRamp = type === "color-ramp",
      classifyDataCheckedSizeRamp =
        featureLayerView &&
        featureLayerView.get("layer.renderer.authoringInfo.type") ===
          "class-breaks-size";

    const classBreakInfos =
      featureLayerView &&
      (featureLayerView.get(
        "layer.renderer.classBreakInfos"
      ) as __esri.ClassBreak[]);

    const hasMoreThanOneClassBreak =
      featureLayerView && classBreakInfos && classBreakInfos.length > 1;

    const standardInteractivityCheck =
      field &&
      !activeLayerInfo.get("layer.sublayers") &&
      activeLayerInfo.get("layer.type") === "feature" &&
      featureLayerData &&
      !isOpacityRamp &&
      !isHeatRamp &&
      !isSizeRamp &&
      !isColorRamp;

    return classBreakInfos
      ? (standardInteractivityCheck && hasMoreThanOneClassBreak) ||
          (isTypePredominance && !isSizeRamp && !isOpacityRamp) ||
          singleSymbol ||
          isRelationship ||
          (classifyDataCheckedColorRamp && field) ||
          (classifyDataCheckedSizeRamp && field)
      : standardInteractivityCheck ||
          (isTypePredominance && !isSizeRamp && !isOpacityRamp) ||
          singleSymbol ||
          isRelationship ||
          (classifyDataCheckedColorRamp && field) ||
          (classifyDataCheckedSizeRamp && field);
  }

  // _checkForRelationshipLegend
  private _checkForRelationshipLegend(
    legendElement: LegendElement,
    operationalItemIndex: number
  ): boolean {
    const featureLayerView = this.viewModel.featureLayerViews.getItemAt(
      operationalItemIndex
    );
    const authoringInfoType =
      featureLayerView &&
      featureLayerView.get("layer.renderer.authoringInfo.type");
    return (
      authoringInfoType === "relationship" && legendElement.type !== "size-ramp"
    );
  }

  // _colorRampCheck
  private _colorRampCheck(activeLayerInfo: __esri.ActiveLayerInfo): boolean {
    return (
      activeLayerInfo.get("layer.renderer.authoringInfo.type") ===
      "class-breaks-color"
    );
  }

  // _getFeatureLayerData
  private _getFeatureLayerData(
    activeLayerInfo: __esri.ActiveLayerInfo
  ): SelectedStyleData {
    const { selectedStyleDataCollection } = this;
    return selectedStyleDataCollection.length > 0
      ? selectedStyleDataCollection.find(data =>
          data ? activeLayerInfo.layer.id === data.layerItemId : null
        )
      : null;
  }

  // _getOperationalItemIndex
  private _getOperationalItemIndex(activeLayerInfo: ActiveLayerInfo): number {
    let itemIndex = null;
    this.layerListViewModel.operationalItems.forEach(
      (operationalItem, operationalItemIndex) => {
        if (operationalItem) {
          const operationalItemLayer = operationalItem.layer as any;
          if (operationalItemLayer.id === activeLayerInfo.layer.id) {
            itemIndex = operationalItemIndex;
          }
        }
      }
    );
    return itemIndex;
  }

  // _getSelectedValue
  private _getSelectedValue(
    legendElementInfos: any[],
    legendInfoIndex: number,
    selectedInfoIndex: number[],
    featureLayerData: any,
    queryExpressions: string[]
  ): boolean {
    if (legendElementInfos && legendElementInfos.length === 1) {
      if (
        (selectedInfoIndex && selectedInfoIndex.length === 0) ||
        selectedInfoIndex === null
      ) {
        return true;
      } else {
        return false;
      }
    } else if (selectedInfoIndex) {
      if (
        (featureLayerData.selectedInfoIndex &&
          selectedInfoIndex.indexOf(legendInfoIndex) === -1 &&
          selectedInfoIndex.length > 0) ||
        (queryExpressions && queryExpressions[0] === "1=0")
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
}

export = InteractiveClassic;
