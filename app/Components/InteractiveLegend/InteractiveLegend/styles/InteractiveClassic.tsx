// dojo
import i18n from "dojo/i18n!../nls/Legend";
import i18nInteractiveLegend from "dojo/i18n!../../../../nls/resources";

// esri.widgets
import { tsx, accessibleHandler, storeNode } from "esri/widgets/support/widget";
import Widget = require("esri/widgets/Widget");
import ActiveLayerInfo = require("esri/widgets/Legend/support/ActiveLayerInfo");
import LayerListViewModel = require("esri/widgets/LayerList/LayerListViewModel");

// esri.core
import {
  property,
  subclass,
  aliasOf
} from "esri/core/accessorSupport/decorators";
import Collection = require("esri/core/Collection");
import watchUtils = require("esri/core/watchUtils");
import Handles = require("esri/core/Handles");

// esri.views
import MapView = require("esri/views/MapView");

// esri.layers
import Layer = require("esri/layers/Layer");
import ImageryLayer = require("esri/layers/ImageryLayer");
import FeatureLayer = require("esri/layers/FeatureLayer");

// esri.intl
import { formatNumber, convertNumberFormatToIntlOptions } from "esri/intl";

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

import RelationshipRamp = require("../relationshipRamp/RelationshipRamp");
import SelectedStyleData = require("./InteractiveStyle/SelectedStyleData");
import InteractiveStyleViewModel = require("./InteractiveStyle/InteractiveStyleViewModel");

// ----------------------------------
//
//  CSS classes
//
// ----------------------------------
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
  // interactive-legend
  interactiveLegend: "esri-interactive-legend",
  interactiveLayerInfo:
    "esri-interactive-legend__layer-cell esri-interactive-legend__layer-cell--info",
  interactiveLegendSizeRamp: "esri-interactive-legend__size-ramp",
  filterLayerRow: "esri-interactive-legend__filter-layer-row",
  filterLayerRowDark: "esri-interactive-legend--layer-row--dark",
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
  totalFeatureCountDark: "esri-interactive-legend__total-feature-count--dark",
  totalFeatureCountContainer:
    "esri-interactive-legend__total-feature-count-container",
  contentContainer: "esri-interactive-legend__content-container",
  featureCountContainer: "esri-interactive-legend__feature-count-container",
  featureCountContainerDark:
    "esri-interactive-legend__feature-count-container--dark",
  selectedIndicatorContainer:
    "esri-interactive-legend--selected-indicator-container",
  extentButton: "esri-interactive-legend__extent-button",
  selectedIndicator: "esri-interactive-legend--selected-indicator",
  selectedIndicatorDark: "esri-interactive-legend--selected-indicator--dark",
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
      "esri-interactive-legend__onboarding-button-container",
    onboardingDarkThemeText:
      "esri-interactive-legend__onboarding-info-container--dark"
  }
};

const KEY = "esri-legend__",
  GRADIENT_WIDTH = 24;

@subclass("InteractiveClassic")
class InteractiveClassic extends Widget {
  // ----------------------------------
  //
  //  Variables
  //
  // ----------------------------------

  private _handles = new Handles();
  private _interactiveLegendBase: any = null;
  private _filterLayerRowContainerStyles: number = null;

  // --------------------------------------------------------------------------
  //
  //  Properties
  //
  // --------------------------------------------------------------------------

  @aliasOf("viewModel.activeLayerInfos")
  @property()
  activeLayerInfos: Collection<ActiveLayerInfo> = null;

  @aliasOf("viewModel.featureCountEnabled")
  featureCountEnabled: boolean = null;

  @aliasOf("viewModel.filterMode")
  @property()
  filterMode: FilterMode = null;

  @aliasOf("viewModel.grayScale")
  grayScale: number = null;

  @aliasOf("viewModel.layerListViewModel")
  @property()
  layerListViewModel: LayerListViewModel = null;

  @property()
  offscreen: boolean = null;

  @property()
  onboardingPanelEnabled: boolean = null;

  @aliasOf("viewModel.opacity")
  opacity: number = null;

  @property()
  relationshipRampElements = {};

  @aliasOf("viewModel.selectedStyleDataCollection")
  selectedStyleDataCollection: Collection<SelectedStyleData> = null;

  @aliasOf("viewModel.searchExpressions")
  @property()
  searchExpressions: Collection<string> = null;

  @aliasOf("viewModel.searchViewModel")
  @property()
  searchViewModel = null;

  @property()
  theme = "light";

  @aliasOf("viewModel.updateExtentEnabled")
  updateExtentEnabled: boolean = null;

  @property({ readOnly: true })
  readonly type: "classic" = "classic";

  @aliasOf("viewModel.view")
  @property()
  view: MapView = null;

  @property({
    type: InteractiveStyleViewModel
  })
  viewModel: InteractiveStyleViewModel = new InteractiveStyleViewModel();

  // -------------------------------------------------------------------
  //
  //  Lifecycle methods
  //
  // -------------------------------------------------------------------

  constructor(params?: any) {
    super(params);
  }

  postInitialize() {
    this.own([this._renderOnFeatureCountUpdate()]);
    this.own([this._resetRelationshipRampLegendElements()]);
  }

  render(): VNode {
    const baseClasses = this.classes(
      CSS.base,
      CSS.interactiveLegend,
      CSS.widget
    );
    return (
      <div
        key="interactive-classic"
        bind={this}
        afterCreate={storeNode}
        data-node-ref="_interactiveLegendBase"
        class={baseClasses}
      >
        {this.onboardingPanelEnabled
          ? this._renderOnboardingPanel()
          : this._renderContent()}
      </div>
    );
  }

  destroy() {
    this._handles.removeAll();
    this._handles.destroy();
    this._handles = null;
  }

  // --------------------------------------------------------------------------
  //
  //  Private methods
  //
  // --------------------------------------------------------------------------

  // --------------------------------------------------------------------------
  //
  //  Render methods
  //
  // --------------------------------------------------------------------------

  private _renderContent(): VNode {
    const activeLayerInfos = this.activeLayerInfos,
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
    return filteredLayers && filteredLayers.length ? (
      <div class={CSS.legendElements}>
        {!this.get("selectedStyleDataCollection.length") ? (
          <div class={CSS.loader} />
        ) : (
          <div
            key="interactive-legned-main-container"
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
    );
  }

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

    const featureLayerData = this.viewModel.getSelectedStyleData(
      activeLayerInfo.layer.id
    );

    const interactiveLegendLabel = {
      [CSS.interactiveLegendLabel]: featureLayerData?.applyStyles
    };
    const labelClasses = this.classes(
      CSS.header,
      CSS.label,
      interactiveLegendLabel
    );

    const titleContainer = {
      [CSS.interactiveLegendTitleContainer]: featureLayerData?.applyStyles
    };

    const selectedStyleData = this.viewModel.getSelectedStyleData(
      activeLayerInfo.layer.id
    );

    const totalFeatureCount = selectedStyleData?.totalFeatureCount;
    const queryExpressions = selectedStyleData?.queryExpressions;
    const totalFeatureCountToDisplay = !isNaN(totalFeatureCount)
      ? totalFeatureCount === false ||
        (queryExpressions?.length === 1 && queryExpressions[0] === "1=0")
        ? 0
        : formatNumber(
            totalFeatureCount,
            convertNumberFormatToIntlOptions({
              digitSeparator: true
            })
          )
      : 0;

    const relationshipRamp = this.relationshipRampElements[
      activeLayerInfo.layer.id
    ];

    const relationshipFeatureCount =
      this.featureCountEnabled &&
      relationshipRamp &&
      relationshipRamp.twoDimensionRamp.hasOwnProperty("shape") &&
      relationshipRamp.twoDimensionRamp.shape.featureCount;

    const labelNode = activeLayerInfo.title ? (
      <div class={this.classes(titleContainer)}>
        <h2 class={labelClasses}>{activeLayerInfo.title}</h2>
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

      const totalFeatureCountDark = {
        [CSS.totalFeatureCountDark]: this.theme === "dark"
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
                  <div
                    key="total-feature-count-container"
                    class={CSS.totalFeatureCountContainer}
                  >
                    <span
                      class={this.classes(
                        CSS.totalFeatureCount,
                        totalFeatureCountDark
                      )}
                    >
                      {`${i18nInteractiveLegend.totalFeatureCount}: ${totalFeatureCountToDisplay}`}
                    </span>
                  </div>
                ) : (
                  <div
                    key="total-feature-count-container-relationship"
                    class={CSS.totalFeatureCountContainer}
                  >
                    <span
                      class={this.classes(
                        CSS.totalFeatureCount,
                        totalFeatureCountDark
                      )}
                    >
                      {relationshipFeatureCount ||
                      relationshipFeatureCount === 0
                        ? `${
                            i18nInteractiveLegend.totalFeatureCount
                          }: ${formatNumber(
                            relationshipFeatureCount,
                            convertNumberFormatToIntlOptions({
                              digitSeparator: true
                            })
                          )}`
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
    const selectedStyleData = this.selectedStyleDataCollection.find(
      selectedStyleDataItem =>
        selectedStyleDataItem.layerItemId === activeLayerInfo.layer.id
    );

    const field =
      selectedStyleData && (selectedStyleData.get("field") as string);

    const normalizationField =
      selectedStyleData &&
      (selectedStyleData.get("normalizationField") as string);

    const layerView = selectedStyleData?.featureLayerView;

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
      const featureLayerView = selectedStyleData?.featureLayerView;
      const type =
        featureLayerView &&
        featureLayerView.get("layer.renderer.authoringInfo.type");

      const isSizeRampBody = {
        [CSS.interactiveLegendSizeRamp]:
          type === "class-breaks-size" || isSizeRamp
      };
      if (rows.length) {
        content = (
          <ul class={this.classes(CSS.layerBody, isSizeRampBody)}>{rows}</ul>
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
      if (
        !this.relationshipRampElements[activeLayerInfo.layer.id] &&
        layerView
      ) {
        this.relationshipRampElements[
          activeLayerInfo.layer.id
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
          activeLayerInfo.layer.id
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

      content = this.relationshipRampElements[activeLayerInfo.layer.id]
        ? this.relationshipRampElements[activeLayerInfo.layer.id]?.render()
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

    const featureLayerData = this.viewModel.getSelectedStyleData(
      activeLayerInfo.layer.id
    );

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
      activeLayerInfo.layer.id,
      legendElement,
      operationalItemIndex
    );

    const isClusteringSizeRamp = this._checkForClusteringSizeRampLegend(
      activeLayerInfo,
      legendElementIndex
    );

    const resetButton =
      this.offscreen || isClusteringSizeRamp
        ? null
        : this._renderResetButton(
            featureLayerData,
            operationalItemIndex,
            legendElementInfos,
            legendElement,
            legendElementIndex,
            activeLayerInfo
          );
    const zoomToButton =
      this.offscreen || !this.updateExtentEnabled
        ? null
        : this._renderZoomToButton(
            operationalItemIndex,
            activeLayerInfo.layer.id,
            legendElementIndex
          );

    const featureLayer = activeLayerInfo.layer as FeatureLayer;

    const predominanceType = featureLayer.get("renderer.authoringInfo.type");

    const isTypePredominance = predominanceType === "predominance";

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

    const allowInteractivity = this.viewModel.validateInteractivity(
      activeLayerInfo,
      legendElement,
      field,
      legendElementIndex
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
      <div
        key={`${activeLayerInfo.layer.id}-legend-element`}
        class={this.classes(tableClass, tableClasses, relationshipStyles)}
      >
        {caption}
        {(field && allowInteractivity && !caption) ||
        (isTypePredominance && !isSizeRamp && !isOpacityRamp && !caption) ? (
          <div
            key={`${activeLayerInfo.layer.id}-buttons`}
            class={this.classes(
              CSS.interactiveLegendNoCaption,
              noCaptionUpdateExtent
            )}
          >
            {zoomToButton}
            {resetButton}
          </div>
        ) : null}

        <div
          key={`${activeLayerInfo.layer.id}-content-container`}
          class={CSS.contentContainer}
        >
          {content}
        </div>
      </div>
    );
  }

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

  private _getStretchStopLabel(stop: ColorRampStop): String {
    return stop.label
      ? i18n[stop.label] +
          ": " +
          formatNumber(stop.value, {
            style: "decimal"
          })
      : "";
  }

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
    const selectedStyleData = this.viewModel.getSelectedStyleData(
      activeLayerInfo.layer.id
    );
    const featureLayerView = selectedStyleData?.featureLayerView;
    const symbolClasses = {
      [CSS.imageryLayerInfoStretched]: isStretched,
      [CSS.sizeRamp]: !isStretched && isSizeRamp,
      [CSS.interactiveLegendSizeRamp]:
        (featureLayerView &&
          featureLayerView.get("layer.renderer.authoringInfo.type") ===
            "class-breaks-size") ||
        isSizeRamp
    };

    const queryExpressions = selectedStyleData?.queryExpressions;

    let selectedRow = null;
    let selectedInfoIndex = null;
    if (this.selectedStyleDataCollection.length > 0) {
      const featureLayerData = this.viewModel.getSelectedStyleData(
        activeLayerInfo.layer.id
      );
      if (featureLayerData) {
        const selectedIndex =
          featureLayerData.selectedInfoIndexes[legendElementIndex];
        selectedInfoIndex = selectedIndex ? selectedIndex : null;

        const filterLayerRowDark = {
          [CSS.filterLayerRowDark]: this.theme === "dark"
        };

        const nonSelectedRowStyles = this.classes(
          CSS.layerRow,
          CSS.filterLayerRow,
          CSS.hoverStyles,
          CSS.notSelected,
          filterLayerRowDark
        );

        const selectedRowStyles = this.classes(
          CSS.layerRow,
          CSS.filterLayerRow,
          CSS.hoverStyles,
          CSS.selectedRow,
          filterLayerRowDark
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
            ? (featureLayerData.selectedInfoIndexes &&
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
      activeLayerInfo.layer.id,
      legendElement,
      operationalItemIndex
    );
    const isPredominance =
      featureLayer.get("renderer.authoringInfo.type") === "predominance";

    const featureLayerData = this.viewModel.getSelectedStyleData(
      activeLayerInfo.layer.id
    );

    const singleSymbol =
      legendElementInfos && legendElementInfos.length === 1 && !field;

    const allowSelectStyles = this.viewModel.validateInteractivity(
      activeLayerInfo,
      legendElement,
      field,
      legendElementIndex
    );

    const applySelect = allowSelectStyles ? selectedRow : null;
    if (featureLayerData?.applyStyles === null) {
      featureLayerData.applyStyles = applySelect ? true : false;
      this.scheduleRender();
    }

    // FEATURE COUNT VARIABLES
    const featureCount = selectedStyleData?.featureCount;

    const featureCountForLegendElement = featureCount?.getItemAt(
      legendElementIndex
    );

    const featureCountForLegendInfo =
      featureCountForLegendElement?.[legendInfoIndex];

    const singleSymbolStyles = {
      [CSS.singleSymbol]: legendElementInfos?.length === 1 && !field
    };
    const removeScrollbarFlicker = this._removeScrollbarFlicker();

    if (applySelect && !isRelationship) {
      const selected = this._getSelectedValue(
        legendElementInfos,
        legendInfoIndex,
        selectedInfoIndex,
        queryExpressions
      );

      const boxShadow = {
        [CSS.boxShadowSelected]: selected
      };

      const featureCountContainerDark = {
        [CSS.featureCountContainerDark]: this.theme === "dark"
      };

      const selectedIndicatorDark = {
        [CSS.selectedIndicatorDark]: this.theme === "dark"
      };

      return (
        <li
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
                  normalizationField,
                  activeLayerInfo
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
                  normalizationField,
                  activeLayerInfo
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
            role="button"
            aria-selected={
              selectedInfoIndex && selectedInfoIndex.length > 0 && selected
                ? "true"
                : "false"
            }
          >
            <div class={CSS.selectedIndicatorContainer}>
              {selected && !isSizeRamp ? (
                <div
                  class={this.classes(
                    CSS.selectedIndicator,
                    selectedIndicatorDark
                  )}
                />
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
            {this.featureCountEnabled ? (
              <div
                key={`feature-count-${activeLayerInfo.layer.id}-${legendElementIndex}`}
                class={this.classes(
                  CSS.featureCountContainer,
                  featureCountContainerDark
                )}
                aria-label={`Number of features for ${elementInfo.label}: ${
                  featureCountForLegendInfo && selected
                    ? formatNumber(
                        featureCountForLegendInfo,
                        convertNumberFormatToIntlOptions({
                          digitSeparator: true
                        })
                      )
                    : 0
                }`}
              >
                {selected && !isSizeRamp
                  ? formatNumber(
                      featureCountForLegendInfo,
                      convertNumberFormatToIntlOptions({
                        digitSeparator: true
                      })
                    )
                  : null}
              </div>
            ) : null}
            {selectedInfoIndex && selectedInfoIndex.length > 0 && selected ? (
              <span class="sr-only">{`${elementInfo.label} selected`}</span>
            ) : null}
          </div>
        </li>
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

  private _renderOnboardingPanel(): any {
    const {
      close,
      newInteractiveLegend,
      onboardingConfirmation,
      firstOnboardingWelcomeMessage,
      secondOnboardingWelcomeMessage,
      thirdOnboardingWelcomeMessage
    } = i18nInteractiveLegend;
    const darkTheme = {
      [CSS.onboarding.onboardingDarkThemeText]: this.theme === "dark"
    };
    return (
      <div class={CSS.onboarding.mainContainer}>
        <div key="onboarding-panel" class={CSS.onboarding.contentContainer}>
          <div class={CSS.onboarding.closeContainer}>
            <calcite-icon
              bind={this}
              onclick={this._disableOnboarding}
              onkeydown={this._disableOnboarding}
              tabIndex={0}
              title={close}
              icon="close"
            />
          </div>
          <div class={CSS.onboarding.logoContainer} />
          <div class={CSS.onboarding.titleContainer}>
            <h2>{newInteractiveLegend}</h2>
          </div>
          <div class={this.classes(CSS.onboarding.infoContainer, darkTheme)}>
            <p>{firstOnboardingWelcomeMessage}</p>
            <p>{secondOnboardingWelcomeMessage}</p>
            <p>{thirdOnboardingWelcomeMessage}</p>
          </div>
        </div>
        <div class={CSS.onboarding.onboardingButtonContainer}>
          <calcite-button
            bind={this}
            onclick={this._disableOnboarding}
            onkeydown={this._disableOnboarding}
            tabIndex={0}
            title={onboardingConfirmation}
            theme={this.theme}
          >
            {onboardingConfirmation}
          </calcite-button>
        </div>
      </div>
    );
  }

  private _renderResetButton(
    featureLayerData: SelectedStyleData,
    operationalItemIndex: number,
    legendElementInfos: any[],
    legendElement: LegendElement,
    legendElementIndex: number,
    activeLayerInfo: __esri.ActiveLayerInfo
  ): VNode {
    const isRelationship = this._checkForRelationshipLegend(
      activeLayerInfo.layer.id,
      legendElement,
      operationalItemIndex
    );
    let disabled = null;
    if (isRelationship) {
      disabled = this._handleDisableForRelationship(operationalItemIndex);
    } else {
      disabled = this._handleDisableForShowAll(
        activeLayerInfo.layer.id,
        legendElementInfos
      );
    }

    const grayStyles = {
      [CSS.interactiveLegendGrayButtonStyles]: disabled
    };

    return (
      <button
        bind={this}
        key="reset-button"
        class={this.classes(CSS.interactiveLegendResetButton, grayStyles)}
        tabIndex={this.offscreen ? -1 : 0}
        disabled={disabled ? true : false}
        onclick={(event: Event) => {
          this._resetLegendFilter(
            featureLayerData,
            operationalItemIndex,
            legendElementIndex,
            activeLayerInfo
          );
        }}
        appearance="outline"
        theme={this.theme}
        scale="s"
      >
        {i18nInteractiveLegend.showAll}
      </button>
    );
  }

  private _renderZoomToButton(
    operationalItemIndex: number,
    layerId: string,
    legendElementIndex: number
  ): VNode {
    return (
      <button
        key={`$zoom-to-button-${layerId}-${legendElementIndex}`}
        bind={this}
        class={CSS.extentButton}
        tabIndex={this.offscreen ? -1 : 0}
        onclick={(event: Event) => {
          this._updateExtentToAllFeatures(operationalItemIndex, layerId);
        }}
        theme={this.theme}
        scale="s"
      >
        {i18nInteractiveLegend.zoomTo}
      </button>
    );
  }

  @accessibleHandler()
  private _updateExtentToAllFeatures(
    operationalItemIndex: number,
    layerId: string
  ): void {
    this.viewModel.updateExtentToAllFeatures(operationalItemIndex, layerId);
  }

  // -------------------------------------------------------------------
  //
  //  Filter methods
  //
  // -------------------------------------------------------------------

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
    normalizationField?: string,
    activeLayerInfo?: __esri.ActiveLayerInfo
  ): void {
    const node = event.currentTarget as HTMLDivElement;
    const dataLayerId = node.getAttribute("data-layer-id");
    if (this.filterMode === "featureFilter") {
      this._featureFilter(
        event,
        elementInfo,
        field,
        operationalItemIndex,
        legendInfoIndex,
        legendElement,
        isPredominance,
        dataLayerId,
        legendElementInfos,
        normalizationField
      );
    } else if (this.filterMode === "mute") {
      this._featureMute(
        event,
        elementInfo,
        field,
        operationalItemIndex,
        legendInfoIndex,
        legendElement,
        isPredominance,
        dataLayerId,
        legendElementInfos,
        normalizationField
      );
    }

    if (this.featureCountEnabled) {
      this.viewModel.updateTotalFeatureCount(
        activeLayerInfo,
        legendElementIndex
      );
      this.scheduleRender();
    }
  }

  private _featureFilter(
    event: Event,
    elementInfo: any,
    field: string,
    operationalItemIndex: number,
    legendInfoIndex: number,
    legendElement: LegendElement,
    isPredominance: boolean,
    dataLayerId: string,
    legendElementInfos?: any[],
    normalizationField?: string
  ): void {
    this._handleSelectedStyles(event);
    this.viewModel.applyFeatureFilter(
      elementInfo,
      field,
      operationalItemIndex,
      legendElement,
      legendInfoIndex,
      isPredominance,
      dataLayerId,
      legendElementInfos,
      normalizationField
    );
  }

  private _featureMute(
    event: Event,
    elementInfo: any,
    field: string,
    operationalItemIndex: number,
    legendInfoIndex: number,
    legendElement: LegendElement,
    isPredominance: boolean,
    dataLayerId: string,
    legendElementInfos?: any[],
    normalizationField?: string
  ): void {
    this._handleSelectedStyles(event);
    this.viewModel.applyFeatureMute(
      elementInfo,
      field,
      operationalItemIndex,
      legendElement,
      legendInfoIndex,
      isPredominance,
      dataLayerId,
      legendElementInfos,
      normalizationField
    );
  }
  // End of filter methods

  @accessibleHandler()
  private _resetLegendFilter(
    featureLayerData: any,
    operationalItemIndex: number,
    legendElementIndex: number,
    activeLayerInfo: __esri.ActiveLayerInfo
  ): void {
    this.viewModel.resetLegendFilter(featureLayerData);
    if (this.featureCountEnabled) {
      this.viewModel.queryTotalFeatureCount(
        legendElementIndex,
        activeLayerInfo
      );
    }
  }

  @accessibleHandler()
  private _disableOnboarding(): void {
    this.onboardingPanelEnabled = false;
    this.scheduleRender();
  }

  private _handleSelectedStyles(event: Event): void {
    const node = event.currentTarget as HTMLElement;
    const legendElementInfoIndex = parseInt(
      node.getAttribute("data-child-index")
    );
    const legendElementIndex = parseInt(node.getAttribute("data-legend-index"));
    const activeLayerInfoId = node.getAttribute("data-layer-id");

    let featureLayerData = null;

    featureLayerData = this.selectedStyleDataCollection.find(layerData => {
      return layerData ? layerData.layerItemId === activeLayerInfoId : null;
    });

    const legendElementChildArr =
      featureLayerData.selectedInfoIndexes[legendElementIndex];

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
      featureLayerData.selectedInfoIndexes[legendElementIndex] = [
        legendElementInfoIndex
      ];
    }
  }

  private _removeScrollbarFlicker(): string {
    const intLegend = this._interactiveLegendBase;
    const layerRowContainer = document.querySelector(
      `.${CSS.interactiveLegendLayerRowContainer}`
    );
    const clientHeight = intLegend?.clientHeight;
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

  private _handleDisableForShowAll(layerId: string, legendElementInfos: any[]) {
    const selectedStyleData = this.viewModel.getSelectedStyleData(layerId);

    const queryExpressions = selectedStyleData?.queryExpressions;

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

  private _checkForRelationshipLegend(
    layerId: string,
    legendElement: LegendElement,
    operationalItemIndex: number
  ): boolean {
    const selectedStyleData = this.viewModel.getSelectedStyleData(layerId);
    const featureLayerView = selectedStyleData?.featureLayerView;
    const authoringInfoType =
      featureLayerView &&
      featureLayerView.get("layer.renderer.authoringInfo.type");
    return (
      authoringInfoType === "relationship" && legendElement.type !== "size-ramp"
    );
  }

  private _checkForClusteringSizeRampLegend(
    activeLayerInfo: __esri.ActiveLayerInfo,
    legendElementIndex: number
  ): boolean {
    const hasClustering = activeLayerInfo?.get("layer.featureReduction");
    const isSizeRamp =
      activeLayerInfo?.legendElements[legendElementIndex]?.type === "size-ramp";
    return hasClustering && isSizeRamp;
  }

  private _getOperationalItemIndex(activeLayerInfo: ActiveLayerInfo): number {
    let itemIndex = null;
    this.layerListViewModel.operationalItems.forEach(
      (operationalItem, operationalItemIndex) => {
        if (operationalItem) {
          const operationalItemLayer = operationalItem.layer as any;
          if (operationalItemLayer.type === "group") {
            operationalItemLayer.layers.find(operationalItemGroupLayer => {
              if (operationalItemGroupLayer.id === activeLayerInfo.layer.id) {
                itemIndex = operationalItemIndex;
              }
            });
          } else {
            if (operationalItemLayer.id === activeLayerInfo.layer.id) {
              itemIndex = operationalItemIndex;
            }
          }
        }
      }
    );
    return itemIndex;
  }

  private _getSelectedValue(
    legendElementInfos: any[],
    legendInfoIndex: number,
    selectedInfoIndex: number[],
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
        (selectedInfoIndex &&
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

  private _renderOnFeatureCountUpdate(): __esri.WatchHandle {
    return watchUtils.whenTrue(this, "featureCountEnabled", () => {
      this.own([
        watchUtils.on(
          this,
          "viewModel.selectedStyleDataCollection",
          "change",
          () => {
            this.viewModel.selectedStyleDataCollection.forEach(
              selectedStyleDataItem => {
                watchUtils.on(
                  selectedStyleDataItem,
                  "featureCount",
                  "change",
                  () => {
                    this.scheduleRender();
                  }
                );
              }
            );
          }
        )
      ]);
    });
  }

  private _resetRelationshipRampLegendElements(): __esri.WatchHandle {
    return watchUtils.watch(
      this,
      "featureCountEnabled, filterMode, opacity, grayScale",
      () => {
        const relationshipRampElements = this?.relationshipRampElements;
        const relationshipElementKeys = Object.keys(relationshipRampElements);
        if (relationshipElementKeys?.length === 0) {
          return;
        }
        relationshipElementKeys.forEach(key => {
          const layerView = relationshipRampElements?.[key]?.layerView;
          if (layerView?.filter?.where) {
            layerView.filter.where = null;
          }
          if (layerView?.effect?.filter?.where) {
            layerView.effect.filter.where = null;
          }
        });
        this.relationshipRampElements = {};
        this.scheduleRender();
      }
    );
  }
}

export = InteractiveClassic;
