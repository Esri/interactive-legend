/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// dojo
import * as i18n from "dojo/i18n!../nls/Legend";
import * as i18nInteractiveLegend from "dojo/i18n!../../../../nls/resources";

// dojox.gfx
import { createSurface } from "dojox/gfx";

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
  accessibleHandler
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

// esri.Grahpic
import Graphic = require("esri/Graphic");

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
  SelectedStyleData,
  LayerUID
} from "../../../../interfaces/interfaces";
import { renderRelationshipRamp } from "../relationshipRamp/utils";

//----------------------------------
//
//  CSS classes
//
//----------------------------------
const CSS = {
  widget: "esri-widget",
  interactiveLegend: "esri-interactive-legend",
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
    refreshIcon: "icon-ui-refresh",
    btn: "btn",
    btnSmall: "btn-small",
    btnPrimary: "btn-primary",
    error: "icon-ui-error",
    close: "icon-ui-close",
    nonVisibleIcon: "esri-icon-non-visible",
    visibleIcon: "esri-icon-visible"
  },
  // interactive-legend
  loaderContainer: "esri-interactive-legend__loader-container",
  filterLayerRow: "esri-interactive-legend__filter-layer-row",
  selectedRow: "esri-interactive-legend--selected-row",
  loader: "esri-interactive-legend__loader",
  preventScroll: "esri-interactive-legend__prevent-scroll",
  hoverStyles: "esri-interactive-legend--layer-row",
  error: "esri-interactive-legend--error",
  legendElements: "esri-interactive-legend__legend-elements",
  interactiveLegendLayerCaption: "esri-interactive-legend__layer-caption",
  interactiveLegendLabel: "esri-interactive-legend__label",
  interactiveLegendLayer: "esri-interactive-legend__layer",
  interactiveLegendService: "esri-interactive-legend__service",
  interactiveLegendlayerBody: "esri-interactive-legend__layer-body",
  interactiveLegendVisibleIcon: "esri-interactive-legend__visible-icon",
  interactiveLegendNonVisibleIcon: "esri-interactive-legend__non-visible-icon",
  interactiveLegendLayerRow: "esri-interactive-legend__ramp-layer-row",
  interactiveStyles: "esri-interactive-legend__interactive-styles",
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

  // mutedShade
  @aliasOf("viewModel.mutedShade")
  @property()
  mutedShade: number[] = null;

  // layerGraphics
  @aliasOf("viewModel.layerGraphics")
  @property()
  layerGraphics: Collection<Graphic[]> = null;

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

  // selectedStyleData
  @property()
  selectedStyleData: Collection<SelectedStyleData> = new Collection();

  // viewModel
  @renderable(["viewModel.state"])
  @property({
    type: InteractiveStyleViewModel
  })
  viewModel: InteractiveStyleViewModel = new InteractiveStyleViewModel();

  @property()
  onboardingPanelEnabled: boolean = null;

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
      watchUtils.on(this, "viewModel.featureLayerViews", "change", () => {
        this.selectedStyleData.removeAll();
        this.viewModel.featureLayerViews.forEach(
          (featureLayerView: __esri.FeatureLayerView) => {
            if (!featureLayerView) {
              this.selectedStyleData.add(null);
            } else {
              const featureLayer = featureLayerView.layer as FeatureLayer;
              const renderer = featureLayer.renderer as
                | __esri.UniqueValueRenderer
                | __esri.ClassBreaksRenderer;
              const field = renderer ? renderer.field : null;
              this.selectedStyleData.add({
                layerItemId: featureLayer.id,
                field,
                selectedInfoIndex: [],
                applyStyles: null
              });
            }
          }
        );
      })
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
    const legendElements = [];
    this.activeLayerInfos.forEach(activeLayerInfo => {
      activeLayerInfo.legendElements.forEach(legendElement => {
        legendElements.push(legendElement);
      });
    });
    return (
      <div class={baseClasses}>
        {this.onboardingPanelEnabled ? (
          this._renderOnboardingPanel()
        ) : (
          <div class={this.classes(CSS.preventScroll)}>
            {filteredLayers && filteredLayers.length ? (
              <div class={CSS.legendElements}>
                {state === "loading" || state === "querying" ? (
                  <div class={CSS.loader} />
                ) : (
                  <div> {filteredLayers}</div>
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
    const featureLayerData =
      this.selectedStyleData.length > 0
        ? this.selectedStyleData.find(data =>
            data ? activeLayerInfo.layer.id === data.layerItemId : null
          )
        : null;
    const labelClasses =
      featureLayerData && featureLayerData.applyStyles
        ? this.classes(CSS.header, CSS.label, CSS.interactiveLegendLabel)
        : this.classes(CSS.header, CSS.label);
    const titleContainer =
      featureLayerData && featureLayerData.applyStyles
        ? "esri-interactive-legend__title-container"
        : null;

    const labelNode = activeLayerInfo.title ? (
      <div class={titleContainer}>
        <h3 class={labelClasses}>{activeLayerInfo.title}</h3>
      </div>
    ) : null;

    if (hasChildren) {
      const layers = activeLayerInfo.children
        .map(childActiveLayerInfo =>
          this._renderLegendForLayer(childActiveLayerInfo, activeLayerInfoIndex)
        )
        .toArray();
      const service =
        featureLayerData && featureLayerData.applyStyles
          ? this.classes(
              CSS.service,
              CSS.interactiveLegendService,
              CSS.groupLayer
            )
          : this.classes(CSS.service, CSS.groupLayer);
      return (
        <div key={key} class={service}>
          {labelNode}
          {layers}
        </div>
      );
    } else {
      const legendElements = activeLayerInfo.legendElements;

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
      const service =
        featureLayerData && featureLayerData.applyStyles
          ? this.classes(
              CSS.service,
              CSS.interactiveLegendService,
              layerClasses
            )
          : this.classes(CSS.service, layerClasses);

      const layer =
        featureLayerData && featureLayerData.applyStyles
          ? this.classes(CSS.layer, CSS.interactiveLegendLayer)
          : CSS.layer;
      const interactiveStyles =
        featureLayerData && featureLayerData.applyStyles
          ? CSS.interactiveStyles
          : null;
      return (
        <div key={key} class={service}>
          <div class={interactiveStyles}>
            {labelNode}
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

    const legendTitle = legendElement.hasOwnProperty("title")
      ? (legendElement.title as any)
      : null;
    const field = this.selectedStyleData.getItemAt(operationalItemIndex)
      ? this.selectedStyleData.getItemAt(operationalItemIndex).field
      : null;

    // build symbol table or size ramp
    if (legendElement.type === "symbol-table" || isSizeRamp) {
      const rows = (legendElement.infos as any)
        .map((info: any, legendInfoIndex: number) =>
          this._renderLegendForElementInfo(
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
            legendElementInfos
          )
        )
        .filter((row: any) => !!row);

      if (rows.length) {
        content = <div class={CSS.layerBody}>{rows}</div>;
      }
    } else if (
      legendElement.type === "color-ramp" ||
      legendElement.type === "opacity-ramp" ||
      legendElement.type === "heatmap-ramp"
    ) {
      content = this._renderLegendForRamp(legendElement, activeLayerInfo);
    } else if (legendElement.type === "relationship-ramp") {
      content = renderRelationshipRamp(legendElement, this.id);
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
    const featureLayerData =
      this.selectedStyleData.length > 0
        ? this.selectedStyleData.find(data =>
            data ? activeLayerInfo.layer.id === data.layerItemId : null
          )
        : null;
    const layerCaption =
      featureLayerData && featureLayerData.applyStyles
        ? this.classes(CSS.layerCaption, CSS.interactiveLegendLayerCaption)
        : CSS.layerCaption;
    const layerTable =
      featureLayerData && featureLayerData.applyStyles
        ? this.classes(CSS.layerTable, "esri-interactive-legend__layer-table")
        : CSS.layerTable;
    const tableClass = isChild ? CSS.layerChildTable : layerTable,
      caption = title ? <div class={layerCaption}>{title}</div> : null;

    const tableClasses = {
      [CSS.layerTableSizeRamp]: isSizeRamp || !isChild
    };
    return (
      <div class={this.classes(tableClass, tableClasses)}>
        {caption}
        {content}
      </div>
    );
  }

  // _renderLegendForRamp
  private _renderLegendForRamp(
    legendElement: ColorRampElement | OpacityRampElement | HeatmapRampElement,
    activeLayerInfo: ActiveLayerInfo
  ): VNode {
    const rampStops: any[] = legendElement.infos;
    const isOpacityRamp = legendElement.type === "opacity-ramp";
    const isHeatmapRamp = legendElement.type === "heatmap-ramp";
    const numGradients = rampStops.length - 1;

    const rampWidth = "100%";
    const rampHeight: number = 75;

    const rampDiv = document.createElement("div");
    const opacityRampClass = isOpacityRamp ? CSS.opacityRamp : "";
    rampDiv.className = `${CSS.colorRamp} ${opacityRampClass}`;
    rampDiv.style.height = `${rampHeight}px`;

    const surface = createSurface(rampDiv, rampWidth, rampHeight);

    try {
      // TODO: When HeatmapRenderer is supported, stop offsets should not be adjusted.
      // equalIntervalStops will be true for sizeInfo, false for heatmap.
      // Heatmaps tend to have lots of colors, we don't want a giant color ramp.
      // Hence equalIntervalStops = false.

      if (!isHeatmapRamp) {
        // Adjust the stop offsets so that we have stops at fixed/equal interval.
        rampStops.forEach((stop, index) => {
          stop.offset = index / numGradients;
        });
      }

      surface
        .createRect({ x: 0, y: 0, width: rampWidth as any, height: rampHeight })
        .setFill({
          type: "linear",
          x1: 0,
          y1: 0,
          x2: 0,
          y2: rampHeight,
          colors: rampStops
        })
        .setStroke(null);

      if (
        legendElement.type === "color-ramp" ||
        legendElement.type === "opacity-ramp"
      ) {
        const overlayColor = legendElement.overlayColor;

        if (overlayColor && overlayColor.a > 0) {
          surface
            .createRect({
              x: 0,
              y: 0,
              width: rampWidth as any,
              height: rampHeight
            })
            .setFill(overlayColor)
            .setStroke(null);
        }
      }
    } catch (e) {
      surface.clear();
      surface.destroy();
    }

    if (!surface) {
      return null;
    }

    const labelsContent = rampStops
      .filter(stop => !!stop.label)
      .map(stop => (
        <div class={CSS.rampLabel}>
          {isHeatmapRamp ? i18n[stop.label] : stop.label}
        </div>
      ));

    const symbolContainerStyles = { width: `${GRADIENT_WIDTH}px` },
      rampLabelsContainerStyles = { height: `${rampHeight}px` };

    return (
      <div class={CSS.layerRow}>
        <div class={CSS.symbolContainer} styles={symbolContainerStyles}>
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
    legendElementInfos: any[]
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

    const symbolClasses = {
      [CSS.imageryLayerInfoStretched]: isStretched,
      [CSS.sizeRamp]: !isStretched && isSizeRamp
    };

    let selectedRow = null;
    let visibleIcon = null;
    if (this.selectedStyleData.length > 0) {
      const featureLayerData = this.selectedStyleData.find(data =>
        data ? activeLayerInfo.layer.id === data.layerItemId : null
      );
      if (featureLayerData) {
        const selectedInfoIndex =
          featureLayerData.selectedInfoIndex[legendElementIndex];

        visibleIcon = selectedInfoIndex ? (
          selectedInfoIndex.indexOf(legendInfoIndex) === -1 &&
          selectedInfoIndex.length > 0 ? (
            <span
              class={this.classes(
                CSS.calciteStyles.nonVisibleIcon,
                CSS.interactiveLegendNonVisibleIcon
              )}
            />
          ) : (
            <span
              class={this.classes(
                CSS.calciteStyles.visibleIcon,
                CSS.interactiveLegendVisibleIcon
              )}
            />
          )
        ) : (
          <span class={CSS.calciteStyles.visibleIcon} />
        );
        if (activeLayerInfo.legendElements.length > 1) {
          selectedRow = selectedInfoIndex
            ? featureLayerData.selectedInfoIndex &&
              selectedInfoIndex.indexOf(legendInfoIndex) === -1 &&
              selectedInfoIndex.length > 0
              ? this.classes(
                  CSS.layerRow,
                  CSS.filterLayerRow,
                  CSS.hoverStyles,
                  CSS.selectedRow
                )
              : this.classes(CSS.layerRow, CSS.filterLayerRow, CSS.hoverStyles)
            : this.classes(CSS.layerRow, CSS.filterLayerRow, CSS.hoverStyles);
        } else {
          selectedRow = selectedInfoIndex
            ? featureLayerData.selectedInfoIndex &&
              selectedInfoIndex.indexOf(legendInfoIndex) === -1 &&
              selectedInfoIndex.length > 0
              ? this.classes(
                  CSS.layerRow,
                  CSS.filterLayerRow,
                  CSS.selectedRow,
                  CSS.hoverStyles
                )
              : this.classes(CSS.layerRow, CSS.filterLayerRow, CSS.hoverStyles)
            : this.classes(CSS.layerRow, CSS.filterLayerRow, CSS.hoverStyles);
        }
      }
    }

    const hasPictureMarkersAndIsMute = this._checkForPictureMarkersAndIsMute(
      activeLayerInfo
    );
    const isRelationship = legendElement.type === "relationship-ramp";
    const featureLayer = activeLayerInfo.layer as FeatureLayer;
    const isPredominance =
      featureLayer.renderer &&
      featureLayer.renderer.authoringInfo &&
      featureLayer.renderer.authoringInfo.type === "predominance";
    const isSizeRampAndMute = isSizeRamp && this.filterMode === "mute";

    const hasPictureFillAndIsMute = this._checkForPictureFillAndIsMute(
      activeLayerInfo
    );
    const hasMoreThanOneInfo = legendElement.infos.length > 1;

    const featureLayerData =
      this.selectedStyleData.length > 0
        ? this.selectedStyleData.find(data =>
            data ? activeLayerInfo.layer.id === data.layerItemId : null
          )
        : null;
    const applySelect =
      (!isRelationship &&
        !hasPictureMarkersAndIsMute &&
        !isSizeRampAndMute &&
        !hasPictureFillAndIsMute &&
        elementInfo.hasOwnProperty("value") &&
        hasMoreThanOneInfo &&
        !activeLayerInfo.layer.hasOwnProperty("sublayers") &&
        activeLayerInfo.layer.type === "feature" &&
        field &&
        featureLayerData &&
        !isSizeRamp) ||
      (isPredominance && !isSizeRamp)
        ? selectedRow
        : null;
    if (featureLayerData && featureLayerData.applyStyles === null) {
      featureLayerData.applyStyles = applySelect ? true : false;
    }

    return (
      <div
        bind={this}
        class={
          (activeLayerInfo.layer.type === "feature" &&
            (hasMoreThanOneInfo &&
              field &&
              featureLayerData &&
              !isSizeRamp &&
              elementInfo.hasOwnProperty("value"))) ||
          (isPredominance && !isSizeRamp)
            ? applySelect
            : null
        }
        tabIndex={
          activeLayerInfo.layer.type === "feature" &&
          !this.offscreen &&
          ((hasMoreThanOneInfo &&
            field &&
            featureLayerData &&
            !isSizeRamp &&
            elementInfo.hasOwnProperty("value")) ||
            (isPredominance && !isSizeRamp))
            ? 0
            : -1
        }
        data-legend-index={`${legendElementIndex}`}
        data-child-index={`${legendInfoIndex}`}
        data-layer-id={`${activeLayerInfo.layer.id}`}
        onclick={(event: Event) => {
          if (
            (!isRelationship &&
              !hasPictureMarkersAndIsMute &&
              !isSizeRampAndMute &&
              !hasPictureFillAndIsMute &&
              elementInfo.hasOwnProperty("value") &&
              hasMoreThanOneInfo &&
              !activeLayerInfo.layer.hasOwnProperty("sublayers") &&
              activeLayerInfo.layer.type === "feature" &&
              field &&
              featureLayerData &&
              !isSizeRamp) ||
            (isPredominance && !isSizeRamp)
          ) {
            this._handleFilterOption(
              event,
              elementInfo,
              field,
              legendInfoIndex,
              operationalItemIndex,
              isSizeRamp,
              legendElement,
              isPredominance,
              legendElementInfos
            );
          }
        }}
        onkeydown={(event: Event) => {
          if (
            (!isRelationship &&
              !hasPictureMarkersAndIsMute &&
              !isSizeRampAndMute &&
              !hasPictureFillAndIsMute &&
              elementInfo.hasOwnProperty("value") &&
              hasMoreThanOneInfo &&
              !activeLayerInfo.layer.hasOwnProperty("sublayers") &&
              field &&
              featureLayerData &&
              !isSizeRamp) ||
            (isPredominance && !isSizeRamp)
          ) {
            this._handleFilterOption(
              event,
              elementInfo,
              field,
              legendInfoIndex,
              operationalItemIndex,
              isSizeRamp,
              legendElement,
              isPredominance,
              legendElementInfos
            );
          }
        }}
      >
        <div
          class={
            applySelect
              ? "esri-interactive-legend__legend-info-container"
              : null
          }
        >
          <div class={this.classes(CSS.symbolContainer, symbolClasses)}>
            {content}
          </div>
          <div class={this.classes(CSS.layerInfo, labelClasses)}>
            {getTitle(elementInfo.label, false) || ""}
          </div>
        </div>
        {applySelect ? <div>{visibleIcon}</div> : null}
      </div>
    );
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
        alt={label}
        src={src}
        border={0}
        width={elementInfo.width}
        height={elementInfo.height}
        class={this.classes(stretchedClasses)}
        styles={dynamicStyles}
      />
    );
  }

  // _renderOnboardingPanel
  private _renderOnboardingPanel(): any {
    return (
      <div class={this.classes(CSS.onboarding.mainContainer)}>
        <div key="onboarding-panel" class={CSS.onboarding.contentContainer}>
          <div class={CSS.onboarding.closeContainer}>
            <span
              bind={this}
              onclick={this._disableOnboarding}
              onkeydown={this._disableOnboarding}
              tabIndex={0}
              class={CSS.calciteStyles.close}
              title={i18nInteractiveLegend.close}
            />
          </div>
          <div class={CSS.onboarding.logoContainer} />
          <div class={CSS.onboarding.titleContainer}>
            <h3>{i18nInteractiveLegend.newInteractiveLegend}</h3>
          </div>
          <div class={CSS.onboarding.infoContainer}>
            <p>{i18nInteractiveLegend.firstOnboardingWelcomeMessage}</p>
            <p>{i18nInteractiveLegend.secondOnboardingWelcomeMessage}</p>
            <p>{i18nInteractiveLegend.thirdOnboardingWelcomeMessage}</p>
          </div>
          <div class={CSS.onboarding.imgPreviewContainer} />
        </div>
        <div class={CSS.onboarding.onboardingButtonContainer}>
          <button
            bind={this}
            onclick={this._disableOnboarding}
            onkeydown={this._disableOnboarding}
            tabIndex={0}
            class={this.classes(CSS.calciteStyles.btn)}
            title={i18nInteractiveLegend.onboardingConfirmation}
          >
            {i18nInteractiveLegend.onboardingConfirmation}
          </button>
        </div>
      </div>
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
    isSizeRamp: boolean,
    legendElement: LegendElement,
    isPredominance: boolean,
    legendElementInfos?: any[]
  ): void {
    this.filterMode === "featureFilter"
      ? this._featureFilter(
          elementInfo,
          field,
          operationalItemIndex,
          legendInfoIndex,
          isSizeRamp,
          legendElement,
          isPredominance,
          legendElementInfos
        )
      : this.filterMode === "highlight"
      ? this._featureHighlight(
          event,
          elementInfo,
          field,
          legendInfoIndex,
          operationalItemIndex,

          isSizeRamp,
          legendElement,
          isPredominance,
          legendElementInfos
        )
      : this.filterMode === "mute"
      ? this._featureMute(
          event,
          elementInfo,
          field,
          legendInfoIndex,
          operationalItemIndex,
          legendElement,
          legendElementInfos
        )
      : null;
  }

  //_filterFeatures
  private _featureFilter(
    elementInfo: any,
    field: string,
    operationalItemIndex: number,
    legendInfoIndex: number,
    isSizeRamp: boolean,
    legendElement: LegendElement,
    isPredominance: boolean,
    legendElementInfos?: any[]
  ): void {
    this._handleSelectedStyles(event);
    this.viewModel.applyFeatureFilter(
      elementInfo,
      field,
      operationalItemIndex,
      legendElement,
      legendInfoIndex,
      isPredominance,
      legendElementInfos
    );
  }

  // _highlightFeatures
  private _featureHighlight(
    event: Event,
    elementInfo: any,
    field: string,
    legendInfoIndex: number,
    operationalItemIndex: number,
    isSizeRamp: boolean,
    legendElement: LegendElement,
    isPredominance: boolean,
    legendElementInfos: any[]
  ): void {
    const { state } = this.viewModel;
    if (state === "querying") {
      return;
    }

    this.viewModel.applyFeatureHighlight(
      elementInfo,
      field,
      legendInfoIndex,
      operationalItemIndex,
      isSizeRamp,
      legendElement,
      isPredominance,
      legendElementInfos
    );
    this._handleSelectedStyles(event, operationalItemIndex, legendInfoIndex);
  }

  // _muteFeatures
  private _featureMute(
    event: Event,
    elementInfo: any,
    field: string,
    legendInfoIndex: number,
    operationalItemIndex: number,
    legendElement: LegendElement,
    legendElementInfos: any[]
  ): void {
    this._handleSelectedStyles(event);
    this.viewModel.applyFeatureMute(
      elementInfo,
      field,
      legendInfoIndex,
      operationalItemIndex,
      legendElement,
      legendElementInfos
    );
  }
  // End of filter methods

  // _disableOnboarding
  @accessibleHandler()
  private _disableOnboarding(): void {
    this.onboardingPanelEnabled = false;
    this.scheduleRender();
  }

  // _handleSelectedStyles
  private _handleSelectedStyles(
    event: Event,
    operationalItemIndex?: number,
    legendInfoIndex?: number
  ): void {
    const node = event.currentTarget as HTMLElement;
    const legendElementInfoIndex = parseInt(
      node.getAttribute("data-child-index")
    );
    const legendElementIndex = parseInt(node.getAttribute("data-legend-index"));
    const activeLayerInfoId = node.getAttribute("data-layer-id");
    const featureLayerData = this.selectedStyleData.find(layerData => {
      return layerData ? layerData.layerItemId === activeLayerInfoId : null;
    });

    const legendElementChildArr =
      featureLayerData.selectedInfoIndex[legendElementIndex];

    if (this.filterMode === "highlight") {
      const highlightedFeatures = this.viewModel.interactiveStyleData
        .highlightedFeatures[operationalItemIndex];
      if (
        !highlightedFeatures[legendInfoIndex] &&
        !featureLayerData.selectedInfoIndex[legendElementIndex] &&
        featureLayerData.selectedInfoIndex.indexOf(legendInfoIndex) === -1
      ) {
        return;
      }
    }

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

  // _checkForPictureMarkersAndIsMute
  private _checkForPictureMarkersAndIsMute(
    activeLayerInfo: ActiveLayerInfo
  ): boolean {
    const { layer } = activeLayerInfo;
    const hasRenderer = layer.hasOwnProperty("renderer");
    if (!hasRenderer) {
      return false;
    }
    const { renderer } = layer as FeatureLayer;
    const hasSymbol = renderer.hasOwnProperty("symbol");
    const hasUniqueValueInfos = renderer.hasOwnProperty("uniqueValueInfos");
    const hasClassBreakInfos = renderer.hasOwnProperty("classBreakInfos");
    return (
      ((hasRenderer &&
        hasSymbol &&
        (renderer as __esri.SimpleRenderer).symbol.type === "picture-marker") ||
        (hasRenderer &&
          hasUniqueValueInfos &&
          (renderer as __esri.UniqueValueRenderer).uniqueValueInfos.every(
            (uvInfo: __esri.UniqueValueInfo) =>
              uvInfo.symbol.type === "picture-marker"
          )) ||
        (hasRenderer &&
          hasClassBreakInfos &&
          (renderer as __esri.ClassBreaksRenderer).classBreakInfos.every(
            (cbInfo: __esri.ClassBreaksRendererClassBreakInfos) =>
              cbInfo.symbol.type === "picture-marker"
          ))) &&
      this.filterMode === "mute"
    );
  }

  // _checkForPictureFillAndIsMute
  private _checkForPictureFillAndIsMute(
    activeLayerInfo: ActiveLayerInfo
  ): boolean {
    const { layer } = activeLayerInfo;
    const hasRenderer = layer.hasOwnProperty("renderer");
    if (!hasRenderer) {
      return false;
    }
    const { renderer } = layer as FeatureLayer;
    const hasSymbol = renderer.hasOwnProperty("symbol");
    const hasUniqueValueInfos = renderer.hasOwnProperty("uniqueValueInfos");
    const hasClassBreakInfos = renderer.hasOwnProperty("classBreakInfos");
    return (
      ((hasRenderer &&
        hasSymbol &&
        (renderer as __esri.SimpleRenderer).symbol.type === "picture-fill") ||
        (hasRenderer &&
          hasUniqueValueInfos &&
          (renderer as __esri.UniqueValueRenderer).uniqueValueInfos.every(
            (uvInfo: __esri.UniqueValueInfo) =>
              uvInfo.symbol.type === "picture-fill"
          )) ||
        (hasRenderer &&
          hasClassBreakInfos &&
          (renderer as __esri.ClassBreaksRenderer).classBreakInfos.every(
            (cbInfo: __esri.ClassBreaksRendererClassBreakInfos) =>
              cbInfo.symbol.type === "picture-fill"
          ))) &&
      this.filterMode === "mute"
    );
  }
}

export = InteractiveClassic;
