/// <amd-dependency path="esri/core/tsSupport/assignHelper" name="__assign" />
/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// dojo
import * as i18n from "dojo/i18n!./InteractiveLegend/nls/Legend";

// esri.widgets.Widget
import Widget = require("esri/widgets/Widget");

// esri.core.accessorSupport.decorators
import {
  aliasOf,
  declared,
  property,
  subclass,
  cast
} from "esri/core/accessorSupport/decorators";

//esri.widgets.support.widget
import { renderable, tsx } from "esri/widgets/support/widget";

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

//----------------------------------
//
//  CSS classes
//
//----------------------------------
const CSS = {
  widgetIcon: "esri-icon-layer-list"
};

// StyleType
type StyleType = InteractiveClassic["type"];

// LegendStyle
type LegendStyle = InteractiveClassic;

@subclass("InteractiveLegend")
class InteractiveLegend extends declared(Widget) {
  //--------------------------------------------------------------------------
  //
  //  Variables
  //
  //--------------------------------------------------------------------------

  // _handles
  private _handles = new Handles();

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  // activeLayerInfos
  @aliasOf("viewModel.activeLayerInfos")
  @renderable()
  activeLayerInfos: Collection<ActiveLayerInfo> = null;

  // view
  @aliasOf("viewModel.view")
  @renderable()
  view: MapView = null;

  // viewModel
  @property()
  @renderable(["view.size"])
  viewModel: LegendViewModel = new LegendViewModel();

  // filterMode
  @aliasOf("style.filterMode")
  @renderable()
  filterMode: FilterMode = null;

  // basemapLegendVisible
  @aliasOf("viewModel.basemapLegendVisible")
  @renderable()
  basemapLegendVisible = false;

  // groundLegendVisible
  @aliasOf("viewModel.groundLegendVisible")
  @renderable()
  groundLegendVisible = false;

  // iconClass
  @property()
  iconClass = CSS.widgetIcon;

  // label
  @property()
  label = i18n.widgetLabel;

  // layerInfos
  @aliasOf("viewModel.layerInfos")
  @renderable()
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
  @renderable()
  onboardingPanelEnabled: boolean = null;

  // offscreen
  @aliasOf("style.offscreen")
  @renderable()
  offscreen: boolean = null;

  @aliasOf("style.opacity")
  @renderable()
  opacity: number = null;

  @aliasOf("style.grayScale")
  @renderable()
  grayScale: number = null;

  @aliasOf("style.featureCountEnabled")
  @renderable()
  featureCountEnabled: boolean = null;

  @aliasOf("style.updateExtentEnabled")
  @renderable()
  updateExtentEnabled: boolean = null;

  // style
  @property()
  @renderable()
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

  //-------------------------------------------------------------------
  //
  //  Lifecycle methods
  //
  //-------------------------------------------------------------------
  constructor(params?: any) {
    super();
  }

  postInitialize(): void {
    const {
      style,
      activeLayerInfos,
      filterMode,
      view,
      layerListViewModel
    } = this;
    this.own([
      watchUtils.on(this, "activeLayerInfos", "change", () => {
        style.activeLayerInfos = activeLayerInfos;
        return this._refreshActiveLayerInfos(activeLayerInfos);
      }),
      watchUtils.init(
        this,
        ["view", "filterMode", "layerListViewModel"],
        () => {
          style.view = view;
          style.filterMode = filterMode;
          style.layerListViewModel = layerListViewModel;
        }
      ),
      watchUtils.init(this, "style", (value, oldValue) => {
        if (oldValue && value !== oldValue) {
          oldValue.destroy();
        }

        if (value) {
          value.activeLayerInfos = activeLayerInfos;

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

  //--------------------------------------------------------------------------
  //
  //  Private methods
  //
  //-------------------------------------------------------------------

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

  // _renderOnActiveLayerInfoChange
  private _renderOnActiveLayerInfoChange(
    activeLayerInfo: ActiveLayerInfo
  ): void {
    const infoVersionHandle = watchUtils.init(activeLayerInfo, "version", () =>
      this.scheduleRender()
    );
    this._handles.add(
      infoVersionHandle,
      `version_${(activeLayerInfo.layer as LayerUID).uid}`
    );

    activeLayerInfo.children.forEach(childActiveLayerInfo =>
      this._renderOnActiveLayerInfoChange(childActiveLayerInfo)
    );
  }
}

export = InteractiveLegend;
