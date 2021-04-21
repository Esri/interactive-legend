// dojo
import i18n from "dojo/i18n!./InteractiveLegend/nls/Legend";

// esri.widgets.Widget
import Widget = require("esri/widgets/Widget");

// esri.core.accessorSupport.decorators
import {
  aliasOf,
  property,
  subclass,
  cast
} from "esri/core/accessorSupport/decorators";

// esri.widgets.support.widget
import { tsx } from "esri/widgets/support/widget";

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.core.Collection
import Collection = require("esri/core/Collection");

// esri.widgets.Legend.support
import ActiveLayerInfo = require("esri/widgets/Legend/support/ActiveLayerInfo");

// esri.core.Handles
import Handles = require("esri/core/Handles");

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

// InteractiveClassic
import InteractiveClassic = require("./InteractiveLegend/styles/InteractiveClassic");

// interfaces
import { LayerInfo, FilterMode, LayerUID } from "../../interfaces/interfaces";

// LegendViewModel
import LegendViewModel = require("esri/widgets/Legend/LegendViewModel");

// esri.widgets.LayerList.LayerListViewModel
import LayerListViewModel = require("esri/widgets/LayerList/LayerListViewModel");

// ----------------------------------
//
//  CSS classes
//
// ----------------------------------
const CSS = {
  widgetIcon: "esri-icon-layer-list"
};

// StyleType
type StyleType = InteractiveClassic["type"];

// LegendStyle
type LegendStyle = InteractiveClassic;

@subclass("InteractiveLegend")
class InteractiveLegend extends Widget {
  // --------------------------------------------------------------------------
  //
  //  Variables
  //
  // --------------------------------------------------------------------------

  // _handles
  private _handles = new Handles();

  // --------------------------------------------------------------------------
  //
  //  Properties
  //
  // --------------------------------------------------------------------------

  // activeLayerInfos
  @aliasOf("viewModel.activeLayerInfos")
  activeLayerInfos: Collection<ActiveLayerInfo> = null;

  // view
  @aliasOf("viewModel.view")
  view: MapView = null;

  // filterMode
  @aliasOf("style.filterMode")
  filterMode: FilterMode = null;

  // basemapLegendVisible
  @aliasOf("viewModel.basemapLegendVisible")
  basemapLegendVisible = false;

  // groundLegendVisible
  @aliasOf("viewModel.groundLegendVisible")
  groundLegendVisible = false;

  // iconClass
  @property()
  iconClass = CSS.widgetIcon;

  // label
  @property()
  label = i18n.widgetLabel;

  // layerInfos
  @aliasOf("viewModel.layerInfos")
  layerInfos: LayerInfo[] = null;

  // searchExpressions
  @aliasOf("style.searchExpressions")
  @property()
  searchExpressions: Collection<string> = null;

  @aliasOf("style.searchViewModel")
  @property()
  searchViewModel = null;

  // layerListViewModel
  @property()
  layerListViewModel: LayerListViewModel = null;

  // onboardingPanelEnabled
  @aliasOf("style.onboardingPanelEnabled")
  onboardingPanelEnabled: boolean = null;

  // offscreen
  @aliasOf("style.offscreen")
  offscreen: boolean = null;

  @aliasOf("style.opacity")
  opacity: number = null;

  @aliasOf("style.grayScale")
  grayScale: number = null;

  @aliasOf("style.featureCountEnabled")
  featureCountEnabled: boolean = null;

  @aliasOf("style.updateExtentEnabled")
  updateExtentEnabled: boolean = null;

  @aliasOf("style.theme")
  theme: string = null;

  // viewModel
  @property()
  viewModel: LegendViewModel = new LegendViewModel();

  // style
  @property()
  style: LegendStyle = new InteractiveClassic({
    view: this.view,
    activeLayerInfos: this.activeLayerInfos,
    filterMode: this.filterMode,
    layerListViewModel: this.layerListViewModel,
    searchViewModel: this.searchViewModel,
    onboardingPanelEnabled: this.onboardingPanelEnabled,
    offscreen: this.offscreen,
    opacity: this.opacity,
    grayScale: this.grayScale,
    featureCountEnabled: this.featureCountEnabled,
    updateExtentEnabled: this.updateExtentEnabled
  });

  // castStyle
  @cast("style")
  protected castStyle(
    value: StyleType | LegendStyle | { type: StyleType }
  ): LegendStyle {
    if (value instanceof InteractiveClassic) {
      return value;
    }
    if (typeof value === "string") {
      return new InteractiveClassic({
        view: this.view,
        activeLayerInfos: this.activeLayerInfos,
        filterMode: this.filterMode,
        layerListViewModel: this.layerListViewModel,
        searchViewModel: this.searchViewModel,
        onboardingPanelEnabled: this.onboardingPanelEnabled,
        offscreen: this.offscreen,
        opacity: this.opacity,
        grayScale: this.grayScale,
        featureCountEnabled: this.featureCountEnabled,
        updateExtentEnabled: this.updateExtentEnabled
      });
    }

    if (value && typeof value.type === "string") {
      const options = { ...value };
      delete options.type;

      const StyleClass = InteractiveClassic;

      return new StyleClass(options);
    }

    return new InteractiveClassic({
      view: this.view,
      activeLayerInfos: this.activeLayerInfos,
      filterMode: this.filterMode,
      layerListViewModel: this.layerListViewModel,
      searchViewModel: this.searchViewModel,
      onboardingPanelEnabled: this.onboardingPanelEnabled,
      offscreen: this.offscreen,
      opacity: this.opacity,
      grayScale: this.grayScale,
      featureCountEnabled: this.featureCountEnabled,
      updateExtentEnabled: this.updateExtentEnabled
    });
  }

  // -------------------------------------------------------------------
  //
  //  Lifecycle methods
  //
  // -------------------------------------------------------------------
  constructor(params?: any) {
    super(params);
  }

  postInitialize(): void {
    const { style, activeLayerInfos, view, layerListViewModel } = this;
    this.own([
      watchUtils.on(this, "activeLayerInfos", "change", () => {
        style.activeLayerInfos = activeLayerInfos;
        return this._refreshActiveLayerInfos(this.activeLayerInfos);
      }),
      watchUtils.init(
        this,
        [
          "view",
          "filterMode",
          "layerListViewModel",
          "featureCountEnabled",
          "updateExtentEnabled"
        ],
        () => {
          style.view = view;
          style.filterMode = this.filterMode;
          style.featureCountEnabled = this.featureCountEnabled;
          style.updateExtentEnabled = this.updateExtentEnabled;
          style.opacity = this.opacity;
          style.grayScale = this.grayScale;
          style.layerListViewModel = layerListViewModel;
        }
      ),
      watchUtils.init(this, "style", (value, oldValue) => {
        if (oldValue && value !== oldValue) {
          oldValue.destroy();
        }

        if (value) {
          value.activeLayerInfos = this.activeLayerInfos;

          if (value.type === "card") {
            value.view = view;
          }
        }
      })
    ]);
  }

  destroy(): void {
    this._handles.destroy();
    this._handles = null;
  }

  render() {
    return this.style.render();
  }

  // --------------------------------------------------------------------------
  //
  //  Private methods
  //
  // -------------------------------------------------------------------

  // _refreshActiveLayerInfos
  private _refreshActiveLayerInfos(
    activeLayerInfos: Collection<ActiveLayerInfo>
  ): void {
    this._handles.removeAll();
    activeLayerInfos.forEach(activeLayerInfo =>
      this._renderOnActiveLayerInfoChange(activeLayerInfo)
    );
    this.scheduleRender();
  }

  private _renderOnActiveLayerInfoChange(
    activeLayerInfo: ActiveLayerInfo
  ): void {
    const infoVersionHandle = watchUtils.init(activeLayerInfo, "version", () =>
      this.scheduleRender()
    );
    this._handles.add(
      infoVersionHandle,
      `version_${(activeLayerInfo.layer as any).uid}`
    );

    const childrenChangeHandle = watchUtils.on(
      activeLayerInfo,
      "children",
      "change",
      () => {
        activeLayerInfo.children.forEach(childActiveLayerInfo =>
          this._renderOnActiveLayerInfoChange(childActiveLayerInfo)
        );
      }
    );
    this._handles.add(
      childrenChangeHandle,
      `children_${(activeLayerInfo.layer as any).uid}`
    );

    activeLayerInfo.children.forEach(childActiveLayerInfo =>
      this._renderOnActiveLayerInfoChange(childActiveLayerInfo)
    );
  }
}

export = InteractiveLegend;
