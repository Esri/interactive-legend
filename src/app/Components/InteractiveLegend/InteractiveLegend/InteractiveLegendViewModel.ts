/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// esri.core.Accessor
import Accessor = require("esri/core/Accessor");

// esri.core.Collection
import Collection = require("esri/core/Collection");

// esri.core.Handles
import Handles = require("esri/core/Handles");

// interfaces
import {
  CollectionChangeEvent,
  LayerInfo
} from "../../../interfaces/interfaces";

// esri.core.watchUtils
import { init, watch, whenTrue, when } from "esri/core/watchUtils";

// esri.core.accessorSupport.decorators
import {
  declared,
  subclass,
  property
} from "esri/core/accessorSupport/decorators";

// esri.layers.Layer
import Layer = require("esri/layers/Layer");

// esri.views.View
import View = require("esri/views/View");

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.views.layers.LayerView
import LayerView = require("esri/views/layers/LayerView");

// esri.widgets.Legend.support.ActiveLayerInfo
import ActiveLayerInfo = require("esri/widgets/Legend/support/ActiveLayerInfo");

type State = "ready" | "disabled";

const REGISTRY_KEYS = {
  state: "state",
  view: "view",
  allLayerViews: "all-layer-views",
  legendProperties: "legend-properties"
};

const ActiveLayerInfoCollection = Collection.ofType<ActiveLayerInfo>(
  ActiveLayerInfo
);

const SUPPORTED_LAYERS = [
    "esri.layers.CSVLayer",
    "esri.layers.FeatureLayer",
    "esri.layers.HeatmapLayer",
    "esri.layers.MapImageLayer",
    "esri.layers.MapNotesLayer",
    "esri.layers.PointCloudLayer",
    "esri.layers.TileLayer",
    "esri.layers.StreamLayer",
    "esri.layers.SceneLayer",
    "esri.layers.GeoRSSLayer",
    "esri.layers.GroupLayer",
    "esri.layers.ImageryLayer",
    "esri.layers.WMSLayer",
    "esri.layers.WMTSLayer"
  ],
  BASE_VIEWS_COLLECTION_NAME = "view.basemapView.baseLayerViews",
  GROUND_VIEWS_COLLECTION_NAME = "view.groundView.layerViews",
  LAYER_VIEWS_COLLECTION_NAME = "view.layerViews",
  REFERENCE_VIEWS_COLLECTION_NAME = "view.basemapView.referenceLayerViews",
  LAYERVIEWS_COLLECTION_NAMES = [
    BASE_VIEWS_COLLECTION_NAME,
    GROUND_VIEWS_COLLECTION_NAME,
    LAYER_VIEWS_COLLECTION_NAME,
    REFERENCE_VIEWS_COLLECTION_NAME
  ];

@subclass("InteractiveLegendViewModel")
class InteractiveLegendViewModel extends declared(Accessor) {
  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  constructor(opts?: any) {
    super(opts);
  }

  initialize(): void {
    this._handles.add(
      when(this, "view", this._viewHandles),
      REGISTRY_KEYS.view
    );
  }

  destroy(): void {
    this._destroyViewActiveLayerInfos();
    this._handles.destroy();
    this._handles = null;
    this.view = null;
  }

  //--------------------------------------------------------------------------
  //
  //  Variables
  //
  //--------------------------------------------------------------------------
  private _handles = new Handles();
  private _layerViewByLayerId: HashMap<LayerView> = {};
  private _layerInfosByLayerViewId: HashMap<LayerInfo> = {};
  private _activeLayerInfosByLayerViewId: HashMap<ActiveLayerInfo> = {};

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  //----------------------------------
  //  activeLayerInfos
  //----------------------------------
  @property({
    type: ActiveLayerInfoCollection
  })
  activeLayerInfos: Collection<
    ActiveLayerInfo
  > = new ActiveLayerInfoCollection();

  //----------------------------------
  //  basemapLegendVisible
  //----------------------------------
  @property()
  basemapLegendVisible = false;

  //----------------------------------
  //  groundLegendVisible
  //----------------------------------

  @property()
  groundLegendVisible = false;

  //----------------------------------
  //  layerInfos
  //----------------------------------

  @property()
  layerInfos: LayerInfo[] = [];

  //----------------------------------
  //  state
  //----------------------------------

  @property({
    dependsOn: ["view.ready"],
    readOnly: true
  })
  get state(): State {
    return this.get("view.ready") ? "ready" : "disabled";
  }

  //----------------------------------
  //  view
  //----------------------------------

  @property()
  view: View = null;

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  // _viewHandles
  private _viewHandles(): void {
    this._handles.remove(REGISTRY_KEYS.state);

    if (this.view) {
      // when map is changed for view, ready property is set to false,
      // hence everything should be cleared and initialized again
      this._handles.add(
        init(this, "state", this._stateHandles),
        REGISTRY_KEYS.state
      );
    }
  }

  // _stateHandles
  private _stateHandles(): void {
    this._resetAll();

    if (this.state === "ready") {
      this._watchPropertiesAndAllLayerViews();
    }
  }

  // _resetAll
  private _resetAll(): void {
    this._handles.remove([
      REGISTRY_KEYS.allLayerViews,
      REGISTRY_KEYS.legendProperties
    ]);

    this._destroyViewActiveLayerInfos();
    this.activeLayerInfos.removeAll();
  }

  // _destroyViewActiveLayerInfos
  private _destroyViewActiveLayerInfos(): void {
    Object.keys(this._activeLayerInfosByLayerViewId).forEach(
      this._destroyViewActiveLayerInfo,
      this
    );
  }

  // _destroyViewActiveLayerInfo
  private _destroyViewActiveLayerInfo(layerViewId: string): void {
    this._handles.remove(layerViewId);
    delete this._activeLayerInfosByLayerViewId[layerViewId];
  }

  // _watchPropertiesAndAllLayerViews
  private _watchPropertiesAndAllLayerViews(): void {
    const { allLayerViews } = this.view;

    if (allLayerViews.length) {
      this._refresh();
    }

    this._handles.add(
      allLayerViews.on("change", this._allLayerViewsChangeHandle.bind(this)),
      REGISTRY_KEYS.allLayerViews
    );
    this._handles.add(
      watch(
        this,
        "layerInfos, basemapLegendVisible, groundLegendVisible",
        this._propertiesChangeHandle.bind(this)
      ),
      REGISTRY_KEYS.legendProperties
    );
  }

  // _allLayerViewsChangeHandle
  private _allLayerViewsChangeHandle(
    evt: CollectionChangeEvent<LayerView>
  ): void {
    evt.removed.forEach((info: any) =>
      this._destroyViewActiveLayerInfo(info.uid)
    );
    this._refresh();
  }

  // _propertiesChangeHandle
  private _propertiesChangeHandle(): void {
    this._destroyViewActiveLayerInfos();
    this._refresh();
  }

  // _refresh
  private _refresh(): void {
    this._layerInfosByLayerViewId = {};
    this.activeLayerInfos.removeAll();

    // first filter the layerViews based on layerInfos
    // If there is atleast one layerInfo, then use layerViews of layerInfos layers
    // otherwise use all layerViews
    // Now filter layerViews based on if their layers are supported
    // Once filtered, generate activeLayerInfos for layerViews
    this._generateLayerViews()
      .filter(this._filterLayerViewsByLayerInfos, this)
      .filter(this._isLayerViewSupported, this)
      .forEach(this._generateActiveLayerInfo, this);

    this._sortActiveLayerInfos(this.activeLayerInfos);
  }

  // _sortActiveLayerInfos
  private _sortActiveLayerInfos(
    activeLayerInfos: ActiveLayerInfo[] | Collection<ActiveLayerInfo>
  ): void {
    const layersIndex: HashMap<number> = {};

    this.view.allLayerViews.forEach(
      (layerView: any, index: number) =>
        (layersIndex[layerView.layer.uid] = index)
    );

    activeLayerInfos.sort((activeLayerInfo1, activeLayerInfo2) => {
      const layerIndex1 = layersIndex[activeLayerInfo1.layer.uid] || 0,
        layerIndex2 = layersIndex[activeLayerInfo2.layer.uid] || 0;

      return layerIndex2 - layerIndex1;
    });
  }

  // _generateLayerViews
  private _generateLayerViews(): LayerView[] {
    const layerViews: LayerView[] = [];

    LAYERVIEWS_COLLECTION_NAMES.filter(this._filterLayerViews, this)
      .map(this.get, this)
      .filter(collection => collection != null)
      .forEach(this._collectLayerViews("layerViews", layerViews));

    return layerViews;
  }

  // _filterLayerViews
  private _filterLayerViews(layersCollectionName: string): boolean {
    const filterBasemaps =
        !this.basemapLegendVisible &&
        (layersCollectionName === BASE_VIEWS_COLLECTION_NAME ||
          layersCollectionName === REFERENCE_VIEWS_COLLECTION_NAME),
      filterGround =
        !this.groundLegendVisible &&
        layersCollectionName === GROUND_VIEWS_COLLECTION_NAME;

    return !filterBasemaps && !filterGround;
  }

  // _collectLayerViews
  private _collectLayerViews(
    collectionName: string,
    out: LayerView[]
  ): (collection: Collection<LayerView>[]) => LayerView[] {
    const walk = (collection: any[]) => {
      if (collection) {
        collection.forEach(entry => {
          out.push(entry);
          walk(entry[collectionName]);
        });
      }
      return out;
    };

    return walk;
  }

  // _filterLayerViewsByLayerInfos
  private _filterLayerViewsByLayerInfos(layerView: LayerView): boolean {
    const layerInfos = this.layerInfos;

    if (layerInfos && layerInfos.length) {
      return layerInfos.some(layerInfo =>
        this._hasLayerInfo(layerInfo, layerView)
      );
    }
    return true;
  }

  // _hasLayerInfo
  private _hasLayerInfo(layerInfo: LayerInfo, layerView: LayerView): boolean {
    const layer = layerView.layer as any;
    const doesMatch = this._isLayerUIDMatching(
      layerInfo.layer as any,
      layer.uid
    );
    const layerViewUID = layerView as any;
    if (doesMatch) {
      this._layerInfosByLayerViewId[layerViewUID.uid] = layerInfo;
    }

    return doesMatch;
  }

  // _isLayerUIDMatching
  private _isLayerUIDMatching(layer: any, layerUID: string): boolean {
    return (
      layer &&
      (layer.uid === layerUID || this._hasLayerUID(layer.layers, layerUID))
    );
  }

  // checks if a layerUID exists in sublayers
  private _hasLayerUID(layers: Layer[], layerUID: string): boolean {
    return (
      layers && layers.some(layer => this._isLayerUIDMatching(layer, layerUID))
    );
  }

  // _isLayerViewSupported
  private _isLayerViewSupported(layerView: LayerView): boolean {
    if (SUPPORTED_LAYERS.indexOf(layerView.layer.declaredClass) > -1) {
      const layer = layerView.layer as any;
      this._layerViewByLayerId[layer.uid] = layerView;
      return true;
    }

    return false;
  }

  // _generateActiveLayerInfo
  private _generateActiveLayerInfo(layerView: LayerView): void {
    if (this._isLayerActive(layerView)) {
      this._buildActiveLayerInfo(layerView);
      return;
    }
    const layerViewUID = layerView as any;
    this._handles.remove(layerViewUID.uid);
    this._handles.add(
      watch(layerView, "suspended, layer.legendEnabled", () =>
        this._layerActiveHandle(layerView)
      ),
      layerViewUID.uid
    );
  }

  // _layerActiveHandle
  private _layerActiveHandle(layerView: LayerView): void {
    const layerViewUID = layerView as any;
    if (this._isLayerActive(layerView)) {
      this._handles.remove(layerViewUID.uid);
      this._buildActiveLayerInfo(layerView);
    }
  }

  // _isLayerActive
  private _isLayerActive(layerView: LayerView): boolean {
    return (
      !layerView.suspended && (layerView.get("layer.legendEnabled") as boolean)
    );
  }

  // _buildActiveLayerInfo
  private _buildActiveLayerInfo(layerView: LayerView): void {
    const layerViewUID = layerView as any;
    const layer = layerView.layer,
      layerViewId = layerViewUID.uid,
      layerInfo = this._layerInfosByLayerViewId[layerViewId];

    let activeLayerInfo = this._activeLayerInfosByLayerViewId[layerViewId];

    // no previous activeLayerInfo for the layerView
    if (!activeLayerInfo) {
      const hasTitle = layerInfo && layerInfo.title !== undefined;

      activeLayerInfo = new ActiveLayerInfo({
        layer,
        title: hasTitle ? layerInfo.title : layer.title,
        view: this.view
      });

      this._activeLayerInfosByLayerViewId[layerViewId] = activeLayerInfo;
    }

    if (!activeLayerInfo.parent) {
      const parentLayer = (layer as any).parent;
      const parentLayerView =
        parentLayer && (this._layerViewByLayerId[parentLayer.uid] as any);

      activeLayerInfo.parent =
        parentLayerView &&
        this._activeLayerInfosByLayerViewId[parentLayerView.uid];
    }

    if (!this._handles.has(layerViewId)) {
      const titleHandle = watch(layer, "title", (newValue: string) =>
          this._titleHandle(newValue, activeLayerInfo, layerView)
        ),
        legendEnabledHandle = watch(
          layer,
          "legendEnabled",
          (newValue: boolean) =>
            this._legendEnabledHandle(newValue, activeLayerInfo, layerView)
        ),
        layerPropertiesHandle = watch(layer, "renderer, opacity", () =>
          this._constructLegendElements(activeLayerInfo, layerView)
        ),
        suspendedHandle = watch(layerView, "suspended", (newValue: boolean) =>
          this._suspendedHandle(newValue, activeLayerInfo, layerView)
        ),
        scaleHandle = whenTrue(this.view, "stationary", () =>
          this._scaleHandle(activeLayerInfo, layerView)
        );

      this._handles.add(
        [
          titleHandle,
          legendEnabledHandle,
          layerPropertiesHandle,
          suspendedHandle,
          scaleHandle
        ],
        layerViewId
      );

      this._constructLegendElements(activeLayerInfo, layerView);
    }

    this._addActiveLayerInfo(activeLayerInfo, layerView);
  }

  // _titleHandle
  private _titleHandle(
    newValue: string,
    activeLayerInfo: ActiveLayerInfo,
    layerView: LayerView
  ): void {
    activeLayerInfo.title = newValue;
    this._constructLegendElements(activeLayerInfo, layerView);
  }

  // _legendEnabledHandle
  private _legendEnabledHandle(
    newValue: boolean,
    activeLayerInfo: ActiveLayerInfo,
    layerView: LayerView
  ): void {
    if (newValue) {
      this._addActiveLayerInfo(activeLayerInfo, layerView);
    } else {
      this._removeActiveLayerInfo(activeLayerInfo);
    }
  }

  // _suspendedHandle
  private _suspendedHandle(
    newValue: boolean,
    activeLayerInfo: ActiveLayerInfo,
    layerView: LayerView
  ): void {
    if (newValue) {
      this._removeActiveLayerInfo(activeLayerInfo);
    } else {
      this._addActiveLayerInfo(activeLayerInfo, layerView);
    }
  }

  // _scaleHandle
  private _scaleHandle(
    activeLayerInfo: ActiveLayerInfo,
    layerView: LayerView
  ): void {
    const view = this.view as MapView;
    if (activeLayerInfo.scale !== view.scale && activeLayerInfo.isScaleDriven) {
      this._constructLegendElements(activeLayerInfo, layerView);
    }
  }

  // _addActiveLayerInfo
  private _addActiveLayerInfo(
    activeLayerInfo: ActiveLayerInfo,
    layerView: LayerView
  ): void {
    if (
      this._isLayerActive(layerView) &&
      this.activeLayerInfos.indexOf(activeLayerInfo) === -1
    ) {
      const parentActiveLayerInfo = activeLayerInfo.parent;

      if (!parentActiveLayerInfo) {
        this.activeLayerInfos.add(activeLayerInfo);
        this._sortActiveLayerInfos(this.activeLayerInfos);
      } else {
        if (parentActiveLayerInfo.children.indexOf(activeLayerInfo) === -1) {
          parentActiveLayerInfo.children.push(activeLayerInfo);
          this._sortActiveLayerInfos(parentActiveLayerInfo.children);
        }
      }
    }
  }

  // _removeActiveLayerInfo
  private _removeActiveLayerInfo(activeLayerInfo: ActiveLayerInfo): void {
    const parentActiveLayerInfo = activeLayerInfo.parent;

    if (!parentActiveLayerInfo) {
      this.activeLayerInfos.remove(activeLayerInfo);
    } else {
      parentActiveLayerInfo.children.remove(activeLayerInfo);
    }
  }

  // _constructLegendElements
  private _constructLegendElements(
    activeLayerInfo: ActiveLayerInfo,
    layerView: LayerView
  ): void {
    const layer = layerView.layer as any;
    const view = this.view as MapView;
    activeLayerInfo.scale = view.scale;

    if (layer.featureCollections) {
      activeLayerInfo.buildLegendElementsForFeatureCollections(
        layer.featureCollections
      );
    } else if (layer.renderer) {
      activeLayerInfo.buildLegendElementsForRenderer();
    } else if (layer.url) {
      activeLayerInfo.buildLegendElementsForTools();
    }
  }
}

export = InteractiveLegendViewModel;
