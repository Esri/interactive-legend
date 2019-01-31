/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/Collection", "esri/core/Handles", "esri/core/watchUtils", "esri/core/accessorSupport/decorators", "esri/widgets/Legend/support/ActiveLayerInfo"], function (require, exports, __extends, __decorate, Accessor, Collection, Handles, watchUtils_1, decorators_1, ActiveLayerInfo) {
    "use strict";
    var REGISTRY_KEYS = {
        state: "state",
        view: "view",
        allLayerViews: "all-layer-views",
        legendProperties: "legend-properties"
    };
    var ActiveLayerInfoCollection = Collection.ofType(ActiveLayerInfo);
    var SUPPORTED_LAYERS = [
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
    ], BASE_VIEWS_COLLECTION_NAME = "view.basemapView.baseLayerViews", GROUND_VIEWS_COLLECTION_NAME = "view.groundView.layerViews", LAYER_VIEWS_COLLECTION_NAME = "view.layerViews", REFERENCE_VIEWS_COLLECTION_NAME = "view.basemapView.referenceLayerViews", LAYERVIEWS_COLLECTION_NAMES = [
        BASE_VIEWS_COLLECTION_NAME,
        GROUND_VIEWS_COLLECTION_NAME,
        LAYER_VIEWS_COLLECTION_NAME,
        REFERENCE_VIEWS_COLLECTION_NAME
    ];
    var InteractiveLegendViewModel = /** @class */ (function (_super) {
        __extends(InteractiveLegendViewModel, _super);
        //--------------------------------------------------------------------------
        //
        //  Lifecycle
        //
        //--------------------------------------------------------------------------
        function InteractiveLegendViewModel(opts) {
            var _this = _super.call(this, opts) || this;
            //--------------------------------------------------------------------------
            //
            //  Variables
            //
            //--------------------------------------------------------------------------
            _this._handles = new Handles();
            _this._layerViewByLayerId = {};
            _this._layerInfosByLayerViewId = {};
            _this._activeLayerInfosByLayerViewId = {};
            //--------------------------------------------------------------------------
            //
            //  Properties
            //
            //--------------------------------------------------------------------------
            //----------------------------------
            //  activeLayerInfos
            //----------------------------------
            _this.activeLayerInfos = new ActiveLayerInfoCollection();
            //----------------------------------
            //  basemapLegendVisible
            //----------------------------------
            _this.basemapLegendVisible = false;
            //----------------------------------
            //  groundLegendVisible
            //----------------------------------
            _this.groundLegendVisible = false;
            //----------------------------------
            //  layerInfos
            //----------------------------------
            _this.layerInfos = [];
            //----------------------------------
            //  view
            //----------------------------------
            _this.view = null;
            return _this;
        }
        InteractiveLegendViewModel.prototype.initialize = function () {
            this._handles.add(watchUtils_1.when(this, "view", this._viewHandles), REGISTRY_KEYS.view);
        };
        InteractiveLegendViewModel.prototype.destroy = function () {
            this._destroyViewActiveLayerInfos();
            this._handles.destroy();
            this._handles = null;
            this.view = null;
        };
        Object.defineProperty(InteractiveLegendViewModel.prototype, "state", {
            //----------------------------------
            //  state
            //----------------------------------
            get: function () {
                return this.get("view.ready") ? "ready" : "disabled";
            },
            enumerable: true,
            configurable: true
        });
        //--------------------------------------------------------------------------
        //
        //  Private Methods
        //
        //--------------------------------------------------------------------------
        // _viewHandles
        InteractiveLegendViewModel.prototype._viewHandles = function () {
            this._handles.remove(REGISTRY_KEYS.state);
            if (this.view) {
                // when map is changed for view, ready property is set to false,
                // hence everything should be cleared and initialized again
                this._handles.add(watchUtils_1.init(this, "state", this._stateHandles), REGISTRY_KEYS.state);
            }
        };
        // _stateHandles
        InteractiveLegendViewModel.prototype._stateHandles = function () {
            this._resetAll();
            if (this.state === "ready") {
                this._watchPropertiesAndAllLayerViews();
            }
        };
        // _resetAll
        InteractiveLegendViewModel.prototype._resetAll = function () {
            this._handles.remove([
                REGISTRY_KEYS.allLayerViews,
                REGISTRY_KEYS.legendProperties
            ]);
            this._destroyViewActiveLayerInfos();
            this.activeLayerInfos.removeAll();
        };
        // _destroyViewActiveLayerInfos
        InteractiveLegendViewModel.prototype._destroyViewActiveLayerInfos = function () {
            Object.keys(this._activeLayerInfosByLayerViewId).forEach(this._destroyViewActiveLayerInfo, this);
        };
        // _destroyViewActiveLayerInfo
        InteractiveLegendViewModel.prototype._destroyViewActiveLayerInfo = function (layerViewId) {
            this._handles.remove(layerViewId);
            delete this._activeLayerInfosByLayerViewId[layerViewId];
        };
        // _watchPropertiesAndAllLayerViews
        InteractiveLegendViewModel.prototype._watchPropertiesAndAllLayerViews = function () {
            var allLayerViews = this.view.allLayerViews;
            if (allLayerViews.length) {
                this._refresh();
            }
            this._handles.add(allLayerViews.on("change", this._allLayerViewsChangeHandle.bind(this)), REGISTRY_KEYS.allLayerViews);
            this._handles.add(watchUtils_1.watch(this, "layerInfos, basemapLegendVisible, groundLegendVisible", this._propertiesChangeHandle.bind(this)), REGISTRY_KEYS.legendProperties);
        };
        // _allLayerViewsChangeHandle
        InteractiveLegendViewModel.prototype._allLayerViewsChangeHandle = function (evt) {
            var _this = this;
            evt.removed.forEach(function (info) {
                return _this._destroyViewActiveLayerInfo(info.uid);
            });
            this._refresh();
        };
        // _propertiesChangeHandle
        InteractiveLegendViewModel.prototype._propertiesChangeHandle = function () {
            this._destroyViewActiveLayerInfos();
            this._refresh();
        };
        // _refresh
        InteractiveLegendViewModel.prototype._refresh = function () {
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
        };
        // _sortActiveLayerInfos
        InteractiveLegendViewModel.prototype._sortActiveLayerInfos = function (activeLayerInfos) {
            var layersIndex = {};
            this.view.allLayerViews.forEach(function (layerView, index) {
                return (layersIndex[layerView.layer.uid] = index);
            });
            activeLayerInfos.sort(function (activeLayerInfo1, activeLayerInfo2) {
                var layerIndex1 = layersIndex[activeLayerInfo1.layer.uid] || 0, layerIndex2 = layersIndex[activeLayerInfo2.layer.uid] || 0;
                return layerIndex2 - layerIndex1;
            });
        };
        // _generateLayerViews
        InteractiveLegendViewModel.prototype._generateLayerViews = function () {
            var layerViews = [];
            LAYERVIEWS_COLLECTION_NAMES.filter(this._filterLayerViews, this)
                .map(this.get, this)
                .filter(function (collection) { return collection != null; })
                .forEach(this._collectLayerViews("layerViews", layerViews));
            return layerViews;
        };
        // _filterLayerViews
        InteractiveLegendViewModel.prototype._filterLayerViews = function (layersCollectionName) {
            var filterBasemaps = !this.basemapLegendVisible &&
                (layersCollectionName === BASE_VIEWS_COLLECTION_NAME ||
                    layersCollectionName === REFERENCE_VIEWS_COLLECTION_NAME), filterGround = !this.groundLegendVisible &&
                layersCollectionName === GROUND_VIEWS_COLLECTION_NAME;
            return !filterBasemaps && !filterGround;
        };
        // _collectLayerViews
        InteractiveLegendViewModel.prototype._collectLayerViews = function (collectionName, out) {
            var walk = function (collection) {
                if (collection) {
                    collection.forEach(function (entry) {
                        out.push(entry);
                        walk(entry[collectionName]);
                    });
                }
                return out;
            };
            return walk;
        };
        // _filterLayerViewsByLayerInfos
        InteractiveLegendViewModel.prototype._filterLayerViewsByLayerInfos = function (layerView) {
            var _this = this;
            var layerInfos = this.layerInfos;
            if (layerInfos && layerInfos.length) {
                return layerInfos.some(function (layerInfo) {
                    return _this._hasLayerInfo(layerInfo, layerView);
                });
            }
            return true;
        };
        // _hasLayerInfo
        InteractiveLegendViewModel.prototype._hasLayerInfo = function (layerInfo, layerView) {
            var layer = layerView.layer;
            var doesMatch = this._isLayerUIDMatching(layerInfo.layer, layer.uid);
            var layerViewUID = layerView;
            if (doesMatch) {
                this._layerInfosByLayerViewId[layerViewUID.uid] = layerInfo;
            }
            return doesMatch;
        };
        // _isLayerUIDMatching
        InteractiveLegendViewModel.prototype._isLayerUIDMatching = function (layer, layerUID) {
            return (layer &&
                (layer.uid === layerUID || this._hasLayerUID(layer.layers, layerUID)));
        };
        // checks if a layerUID exists in sublayers
        InteractiveLegendViewModel.prototype._hasLayerUID = function (layers, layerUID) {
            var _this = this;
            return (layers && layers.some(function (layer) { return _this._isLayerUIDMatching(layer, layerUID); }));
        };
        // _isLayerViewSupported
        InteractiveLegendViewModel.prototype._isLayerViewSupported = function (layerView) {
            if (SUPPORTED_LAYERS.indexOf(layerView.layer.declaredClass) > -1) {
                var layer = layerView.layer;
                this._layerViewByLayerId[layer.uid] = layerView;
                return true;
            }
            return false;
        };
        // _generateActiveLayerInfo
        InteractiveLegendViewModel.prototype._generateActiveLayerInfo = function (layerView) {
            var _this = this;
            if (this._isLayerActive(layerView)) {
                this._buildActiveLayerInfo(layerView);
                return;
            }
            var layerViewUID = layerView;
            this._handles.remove(layerViewUID.uid);
            this._handles.add(watchUtils_1.watch(layerView, "suspended, layer.legendEnabled", function () {
                return _this._layerActiveHandle(layerView);
            }), layerViewUID.uid);
        };
        // _layerActiveHandle
        InteractiveLegendViewModel.prototype._layerActiveHandle = function (layerView) {
            var layerViewUID = layerView;
            if (this._isLayerActive(layerView)) {
                this._handles.remove(layerViewUID.uid);
                this._buildActiveLayerInfo(layerView);
            }
        };
        // _isLayerActive
        InteractiveLegendViewModel.prototype._isLayerActive = function (layerView) {
            return (!layerView.suspended && layerView.get("layer.legendEnabled"));
        };
        // _buildActiveLayerInfo
        InteractiveLegendViewModel.prototype._buildActiveLayerInfo = function (layerView) {
            var _this = this;
            var layerViewUID = layerView;
            var layer = layerView.layer, layerViewId = layerViewUID.uid, layerInfo = this._layerInfosByLayerViewId[layerViewId];
            var activeLayerInfo = this._activeLayerInfosByLayerViewId[layerViewId];
            // no previous activeLayerInfo for the layerView
            if (!activeLayerInfo) {
                var hasTitle = layerInfo && layerInfo.title !== undefined;
                activeLayerInfo = new ActiveLayerInfo({
                    layer: layer,
                    title: hasTitle ? layerInfo.title : layer.title
                });
                activeLayerInfo.view = this.view;
                this._activeLayerInfosByLayerViewId[layerViewId] = activeLayerInfo;
            }
            if (!activeLayerInfo.parent) {
                var parentLayer = layer.parent;
                var parentLayerView = parentLayer && this._layerViewByLayerId[parentLayer.uid];
                activeLayerInfo.parent =
                    parentLayerView &&
                        this._activeLayerInfosByLayerViewId[parentLayerView.uid];
            }
            if (!this._handles.has(layerViewId)) {
                var titleHandle = watchUtils_1.watch(layer, "title", function (newValue) {
                    return _this._titleHandle(newValue, activeLayerInfo, layerView);
                }), legendEnabledHandle = watchUtils_1.watch(layer, "legendEnabled", function (newValue) {
                    return _this._legendEnabledHandle(newValue, activeLayerInfo, layerView);
                }), layerPropertiesHandle = watchUtils_1.watch(layer, "renderer, opacity", function () {
                    return _this._constructLegendElements(activeLayerInfo, layerView);
                }), suspendedHandle = watchUtils_1.watch(layerView, "suspended", function (newValue) {
                    return _this._suspendedHandle(newValue, activeLayerInfo, layerView);
                }), scaleHandle = watchUtils_1.whenTrue(this.view, "stationary", function () {
                    return _this._scaleHandle(activeLayerInfo, layerView);
                });
                this._handles.add([
                    titleHandle,
                    legendEnabledHandle,
                    layerPropertiesHandle,
                    suspendedHandle,
                    scaleHandle
                ], layerViewId);
                this._constructLegendElements(activeLayerInfo, layerView);
            }
            this._addActiveLayerInfo(activeLayerInfo, layerView);
        };
        // _titleHandle
        InteractiveLegendViewModel.prototype._titleHandle = function (newValue, activeLayerInfo, layerView) {
            activeLayerInfo.title = newValue;
            this._constructLegendElements(activeLayerInfo, layerView);
        };
        // _legendEnabledHandle
        InteractiveLegendViewModel.prototype._legendEnabledHandle = function (newValue, activeLayerInfo, layerView) {
            if (newValue) {
                this._addActiveLayerInfo(activeLayerInfo, layerView);
            }
            else {
                this._removeActiveLayerInfo(activeLayerInfo);
            }
        };
        // _suspendedHandle
        InteractiveLegendViewModel.prototype._suspendedHandle = function (newValue, activeLayerInfo, layerView) {
            if (newValue) {
                this._removeActiveLayerInfo(activeLayerInfo);
            }
            else {
                this._addActiveLayerInfo(activeLayerInfo, layerView);
            }
        };
        // _scaleHandle
        InteractiveLegendViewModel.prototype._scaleHandle = function (activeLayerInfo, layerView) {
            var view = this.view;
            if (activeLayerInfo.scale !== view.scale &&
                activeLayerInfo.isScaleDriven) {
                this._constructLegendElements(activeLayerInfo, layerView);
            }
        };
        // _addActiveLayerInfo
        InteractiveLegendViewModel.prototype._addActiveLayerInfo = function (activeLayerInfo, layerView) {
            if (this._isLayerActive(layerView) &&
                this.activeLayerInfos.indexOf(activeLayerInfo) === -1) {
                var parentActiveLayerInfo = activeLayerInfo.parent;
                if (!parentActiveLayerInfo) {
                    this.activeLayerInfos.add(activeLayerInfo);
                    this._sortActiveLayerInfos(this.activeLayerInfos);
                }
                else {
                    if (parentActiveLayerInfo.children.indexOf(activeLayerInfo) === -1) {
                        parentActiveLayerInfo.children.push(activeLayerInfo);
                        this._sortActiveLayerInfos(parentActiveLayerInfo.children);
                    }
                }
            }
        };
        // _removeActiveLayerInfo
        InteractiveLegendViewModel.prototype._removeActiveLayerInfo = function (activeLayerInfo) {
            var parentActiveLayerInfo = activeLayerInfo.parent;
            if (!parentActiveLayerInfo) {
                this.activeLayerInfos.remove(activeLayerInfo);
            }
            else {
                parentActiveLayerInfo.children.remove(activeLayerInfo);
            }
        };
        // _constructLegendElements
        InteractiveLegendViewModel.prototype._constructLegendElements = function (activeLayerInfo, layerView) {
            var layer = layerView.layer;
            var view = this.view;
            activeLayerInfo.scale = view.scale;
            if (layer.featureCollections) {
                activeLayerInfo.buildLegendElementsForFeatureCollections(layer.featureCollections);
            }
            else if (layer.renderer) {
                activeLayerInfo.buildLegendElementsForRenderer();
            }
            else if (layer.url) {
                activeLayerInfo.buildLegendElementsForTools();
            }
        };
        __decorate([
            decorators_1.property({
                type: ActiveLayerInfoCollection
            })
        ], InteractiveLegendViewModel.prototype, "activeLayerInfos", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveLegendViewModel.prototype, "basemapLegendVisible", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveLegendViewModel.prototype, "groundLegendVisible", void 0);
        __decorate([
            decorators_1.property()
        ], InteractiveLegendViewModel.prototype, "layerInfos", void 0);
        __decorate([
            decorators_1.property({
                dependsOn: ["view.ready"],
                readOnly: true
            })
        ], InteractiveLegendViewModel.prototype, "state", null);
        __decorate([
            decorators_1.property()
        ], InteractiveLegendViewModel.prototype, "view", void 0);
        InteractiveLegendViewModel = __decorate([
            decorators_1.subclass("InteractiveLegendViewModel")
        ], InteractiveLegendViewModel);
        return InteractiveLegendViewModel;
    }(decorators_1.declared(Accessor)));
    return InteractiveLegendViewModel;
});
//# sourceMappingURL=InteractiveLegendViewModel.js.map