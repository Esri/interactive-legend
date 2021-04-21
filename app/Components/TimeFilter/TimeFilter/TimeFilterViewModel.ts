import { property, subclass } from "esri/core/accessorSupport/decorators";

import Accessor = require("esri/core/Accessor");
import { whenOnce, watch, init } from "esri/core/watchUtils";

import { ITimeFilterConfigItem } from "../../../interfaces/interfaces";

import Collection = require("esri/core/Collection");

import Handles = require("esri/core/Handles");

import TimeInterval = require("esri/TimeInterval");

import FeatureFilter = require("esri/views/layers/support/FeatureFilter");
import FeatureEffect = require("esri/views/layers/support/FeatureEffect");

@subclass("TimeFilterViewModel")
class TimeFilterViewModel extends Accessor {
  private _handles = new Handles();

  @property()
  currentTimeConfigItem: ITimeFilterConfigItem = null;

  @property()
  viewModel: TimeFilterViewModel = null;

  @property()
  config = null;

  @property()
  timeFilterConfigCollection: __esri.Collection<ITimeFilterConfigItem> = new Collection();

  @property()
  view: __esri.MapView = null;

  @property()
  timeSlider: __esri.TimeSlider = null;

  @property()
  filterMode = null;

  @property()
  muteOpacity = null;

  @property()
  muteGrayScale = null;

  initialize() {
    this._watchMapLoad();
  }

  private _watchMapLoad(): void {
    whenOnce(this, "view", () => {
      this.view.when(() => {
        this._initConfig();
        this._initUpdateTimeSliderWatchers();
      });
    });
  }

  private _initConfig(): void {
    init(this, "config", () => {
      this._setUpTimeFilterConfigItems();
    });
  }

  private async _setUpTimeFilterConfigItems(): Promise<void> {
    const configItemIds = this._getConfigItemsIds();
    const configItemsExist = this._configItemIdsExist(configItemIds);
    if (!configItemsExist) {
      window.location.reload();
      return;
    }
    const layerViewPromisesArr = this._getLayerViewPromisesArr(configItemIds);
    const layerViewsRes = await Promise.all(layerViewPromisesArr);
    const timeFilterItems = this._getTimeFilterItemsArr(layerViewsRes);
    this.timeFilterConfigCollection.removeAll();
    this.timeFilterConfigCollection.addMany(timeFilterItems);
  }

  private _getConfigItemsIds(): string[] {
    return this.config.slice().map(configItem => configItem.id);
  }

  private _configItemIdsExist(configItemIds: string[]): boolean {
    return configItemIds.every(id =>
      this.view.map.allLayers.find(layer => layer.id === id)
    );
  }

  private _getLayerViewPromisesArr(
    configItemIds: string[]
  ): Promise<__esri.FeatureLayerView>[] {
    const layerViews = [];
    configItemIds.forEach(async id => {
      const allLayers = this.get(
        "view.map.allLayers"
      ) as __esri.Collection<__esri.Layer>;
      const layer = allLayers.find(layer => {
        return layer.id === id && layer.type === "feature";
      }) as __esri.FeatureLayer;
      layerViews.push(this.view.whenLayerView(layer));
    });
    return layerViews;
  }

  private _getTimeFilterItemsArr(
    layerViewsRes: __esri.FeatureLayerView[]
  ): ITimeFilterConfigItem[] {
    const timeFilterItems = [];
    this.config.forEach(item => {
      const layerView = layerViewsRes.filter(
        layerViewResItem => layerViewResItem.layer.id === item.id
      )[0];
      timeFilterItems.push({
        layerView,
        increments: item.increments,
        rangeStart: item.rangeStart,
        rangeEnd: item.rangeEnd
      });
    });
    return timeFilterItems;
  }

  private _initUpdateTimeSliderWatchers(): void {
    this._handles.add([
      watch(this, "config", () => {
        if (!this.config) {
          return;
        }
        this.config.forEach(configItem => {
          const timeFilterItem = this.timeFilterConfigCollection.find(
            timeFilterConfigItem =>
              timeFilterConfigItem.layerView.layer.id === configItem.id
          );
          if (timeFilterItem) {
            const { rangeStart, rangeEnd, increments } = configItem;
            timeFilterItem.rangeStart = rangeStart;
            timeFilterItem.rangeEnd = rangeEnd;
            timeFilterItem.increments = increments;
          }
        });
        this._updateTimeSlider();
      }),
      whenOnce(this, "timeSlider", () => {
        whenOnce(this, "currentTimeConfigItem", () => {
          this._updateTimeSlider();
        });
      }),
      watch(this, "currentTimeConfigItem", () => {
        this._updateTimeSlider();
      }),
      this._watchFilterModeChange(),
      this._watchOpacityGrayScaleChange()
    ]);
  }

  private _updateTimeSlider(): void {
    if (!this.timeSlider) {
      return;
    }
    const timeConfigItemToUpdate = this.timeFilterConfigCollection.find(
      timeConfigItem =>
        timeConfigItem?.layerView?.layer?.id ===
        this.currentTimeConfigItem?.layerView?.layer?.id
    );
    if (timeConfigItemToUpdate) {
      this.currentTimeConfigItem = timeConfigItemToUpdate;
    }
    const currentLayerView = this.currentTimeConfigItem.layerView
      .layer as __esri.FeatureLayer;
    const currentLVFullTimeExtent = currentLayerView.get(
      "timeInfo.fullTimeExtent"
    ) as __esri.TimeExtent;
    this.timeSlider.set("fullTimeExtent", currentLVFullTimeExtent);
    const { rangeStart, rangeEnd } = this.currentTimeConfigItem;
    this.timeSlider.set("fullTimeExtent.start", rangeStart);
    this.timeSlider.set("fullTimeExtent.end", rangeEnd);

    const { currentTimeExtent } = this.currentTimeConfigItem;
    if (currentTimeExtent) {
      const { start, end } = currentTimeExtent;
      this.timeSlider.set("values", [start, end]);
    } else {
      const { rangeStart, rangeEnd } = this.currentTimeConfigItem;
      this.timeSlider.set("values", [new Date(rangeStart), new Date(rangeEnd)]);
    }
    this.timeSlider.set("stops", {
      interval: new TimeInterval({
        unit: this.currentTimeConfigItem.increments,
        value: 1
      })
    });

    this._watchCurrentTimeExtent();
  }

  private _watchFilterModeChange(): __esri.WatchHandle {
    return watch(this, "filterMode", () => {
      this.timeFilterConfigCollection.forEach(timeFilterItem => {
        const flayerView = timeFilterItem.layerView as __esri.FeatureLayerView;
        if (this.filterMode === "featureFilter") {
          const filter = flayerView?.effect?.filter;
          if (filter) {
            flayerView.effect = null;
            flayerView.filter = filter;
          }
        } else if (this.filterMode === "mute") {
          const filter = flayerView?.filter;
          if (filter) {
            flayerView.filter = null;
            const { muteOpacity, muteGrayScale } = this;
            const opacityValue = muteOpacity === null ? 30 : muteOpacity;
            const grayScaleValue = muteGrayScale === null ? 100 : muteGrayScale;
            flayerView.effect = new FeatureEffect({
              excludedEffect: `opacity(${opacityValue}%) grayscale(${grayScaleValue}%)`,
              filter
            });
          }
        }
      });
    });
  }

  private _watchOpacityGrayScaleChange(): __esri.WatchHandle {
    return watch(this, "muteOpacity, muteGrayScale", () => {
      this.timeFilterConfigCollection.forEach(timeFilterItem => {
        if (this.filterMode === "mute") {
          const flayerView = timeFilterItem.layerView as __esri.FeatureLayerView;
          const filter = flayerView?.filter || flayerView?.effect?.filter;
          flayerView.filter = null;
          const { muteOpacity, muteGrayScale } = this;
          const opacityValue = muteOpacity === null ? 30 : muteOpacity;
          const grayScaleValue = muteGrayScale === null ? 100 : muteGrayScale;
          flayerView.effect = new FeatureEffect({
            excludedEffect: `opacity(${opacityValue}%) grayscale(${grayScaleValue}%)`,
            filter
          });
        }
      });
    });
  }

  private _watchCurrentTimeExtent(): void {
    const key = "timeSliderKey";
    if (this._handles.has(key)) {
      this._handles.remove(key);
    }
    this._handles.add(
      this.timeSlider.watch("timeExtent", timeExtent => {
        this.currentTimeConfigItem.currentTimeExtent = timeExtent;
        const layerView = this.currentTimeConfigItem
          .layerView as __esri.FeatureLayerView;
        if (this.filterMode === "featureFilter") {
          if (layerView.filter) {
            layerView.set("filter.timeExtent", timeExtent);
          } else {
            layerView.set(
              "filter",
              new FeatureFilter({
                timeExtent
              })
            );
          }
        } else if (this.filterMode === "mute") {
          const { muteOpacity, muteGrayScale } = this;
          const opacityValue = muteOpacity === null ? 30 : muteOpacity;
          const grayScaleValue = muteGrayScale === null ? 100 : muteGrayScale;
          if (layerView.effect?.filter) {
            layerView.set("effect.filter.timeExtent", timeExtent);
          } else {
            layerView.set(
              "effect",
              new FeatureEffect({
                filter: new FeatureFilter({
                  timeExtent
                }),
                excludedEffect: `opacity(${opacityValue}%) grayscale(${grayScaleValue}%)`
              })
            );
          }
        }
      }),
      key
    );
  }
}

export = TimeFilterViewModel;
