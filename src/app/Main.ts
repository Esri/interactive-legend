/*
  Copyright 2019 Esri

  Licensed under the Apache License, Version 2.0 (the "License");

  you may not use this file except in compliance with the License.

  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software

  distributed under the License is distributed on an "AS IS" BASIS,

  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

  See the License for the specific language governing permissions and

  limitations under the License.​
*/

import * as i18nInteractiveLegend from "dojo/i18n!./nls/resources";

// ApplicationBase.ApplicationBase
import ApplicationBase = require("ApplicationBase/ApplicationBase");

// ApplicationBase.support.itemUtils
import {
  createMapFromItem,
  createView,
  getConfigViewProperties,
  getItemTitle,
  findQuery,
  goToMarker
} from "ApplicationBase/support/itemUtils";

// ApplicationBase.support.domHelper
import {
  setPageLocale,
  setPageDirection,
  setPageTitle
} from "ApplicationBase/support/domHelper";

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.widgets.Home
import Home = require("esri/widgets/Home");

// esri.widgets.LayerList
import LayerList = require("esri/widgets/LayerList");

// esri.widgets.Search
import Search = require("esri/widgets/Search");

// esri.widgets.Search.LayerSearchSource
import LayerSearchSource = require("esri/widgets/Search/LayerSearchSource");

// esri.layers.FeatureLayer
import FeatureLayer = require("esri/layers/FeatureLayer");

// esri.widgets.BasemapToggle
import BasemapToggle = require("esri/widgets/BasemapToggle");

// esri.widgets.Expand
import Expand = require("esri/widgets/Expand");

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

// esri.Color
import Color = require("esri/Color");

// Screenshot
import Screenshot = require("./Components/Screenshot/Screenshot");

// Telemetry
import Telemetry = require("telemetry/telemetry.dojo");

// InteractiveLegend
import InteractiveLegend = require("./Components/InteractiveLegend/InteractiveLegend");

// CSS
const CSS = {
  loading: "configurable-application--loading",
  legend: ".esri-legend__service",
  popup: ".esri-popup__main-container"
};

class InteractiveLegendApp {
  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  base: ApplicationBase = null;
  telemetry: Telemetry = null;
  search: Search = null;
  layerList: LayerList = null;
  layerListExpand: Expand = null;
  screenshot: Screenshot = null;
  interactiveLegendExpand: Expand = null;
  searchExpand: Expand = null;

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  public init(base: ApplicationBase): void {
    if (!base) {
      console.error("ApplicationBase is not defined");
      return;
    }
    setPageLocale(base.locale);
    setPageDirection(base.direction);
    this.base = base;

    const { config, results, portal } = base;
    const { find, marker } = config;

    // Setup Telemetry
    if (config.telemetry) {
      let options = config.telemetry.prod;
      if (portal.customBaseUrl.indexOf("mapsdevext") !== -1) {
        // use devext credentials
        options = config.telemetry.devext;
      } else if (portal.customBaseUrl.indexOf("mapsqa") !== -1) {
        // or qa
        options = config.telemetry.qaext;
      }
      this.telemetry = new Telemetry({
        portal,
        disabled: options.disabled,
        debug: options.debug,
        amazon: options.amazon
      });
      this.telemetry.logPageView();
    }

    const {
      drawerEnabled,
      expandEnabled,
      highlightShade,
      mutedShade,
      style,
      mutedOpacity,
      filterMode,
      screenshotEnabled,
      legendIncludedInScreenshot,
      popupIncludedInScreenshot,
      featureCountEnabled,
      layerListEnabled,
      searchEnabled,
      basemapToggleEnabled,
      homeEnabled,
      nextBasemap
    } = config;

    const { webMapItems } = results;
    const validWebMapItems = webMapItems.map(response => {
      return response.value;
    });

    const firstItem = validWebMapItems[0];
    if (!firstItem) {
      const error = i18nInteractiveLegend.error;
      document.body.innerText = error;
      document.body.classList.remove("configurable-application--loading");
      document.body.classList.add("error");
      console.error(error);
      this.telemetry.logError({
        error
      });
      return;
    }

    config.title = !config.title
      ? getItemTitle(firstItem)
      : "Interactive Legend";
    setPageTitle(config.title);

    // todo: Typings will be fixed in next release.
    const portalItem: any = this.base.results.applicationItem.value;
    const appProxies =
      portalItem && portalItem.appProxies ? portalItem.appProxies : null;

    const viewContainerNode = document.getElementById("viewContainer");
    const defaultViewProperties = getConfigViewProperties(config);

    validWebMapItems.forEach(item => {
      const viewNode = document.createElement("div");
      viewContainerNode.appendChild(viewNode);

      const container = {
        container: viewNode
      };

      const viewProperties = {
        ...defaultViewProperties,
        ...container
      };

      createMapFromItem({ item, appProxies }).then(map =>
        createView({
          ...viewProperties,
          map
        }).then((view: MapView) =>
          findQuery(find, view).then(() => {
            const interactiveLegendMapContainer = document.createElement("div");

            const defaultShade = mutedShade ? mutedShade : new Color("#a9a9a9");
            const defaultStyle = style ? style : "classic";
            const defaultMode = filterMode
              ? filterMode
              : "definitionExpression";
            const defaultOpacity = mutedOpacity ? mutedOpacity : 0.5;
            const mode = drawerEnabled ? "drawer" : "auto";
            const defaultExpandMode = mode ? mode : null;
            if (highlightShade) {
              view.highlightOptions = {
                color: new Color(highlightShade)
              };
            } else {
              view.highlightOptions = {
                color: new Color("#000000")
              };
            }

            this._handleHomeWidget(view, homeEnabled);

            this._handleScreenshotWidget(
              screenshotEnabled,
              legendIncludedInScreenshot,
              popupIncludedInScreenshot,
              view
            );

            this._handleBasemapToggleWidget(
              basemapToggleEnabled,
              view,
              nextBasemap
            );
            this.layerList = new LayerList({
              view
            });
            this._handleLayerListWidget(layerListEnabled, view);

            const layerListViewModel = this.layerList
              ? this.layerList.viewModel
              : null;

            const interactiveLegend = new InteractiveLegend({
              view,
              container: interactiveLegendMapContainer,
              mutedShade: defaultShade,
              style: defaultStyle,
              filterMode: defaultMode,
              mutedOpacity: defaultOpacity,
              featureCountEnabled,
              layerListViewModel
            });

            this._handleSearchWidget(searchEnabled, interactiveLegend, view);

            this.interactiveLegendExpand = new Expand({
              content: interactiveLegend,
              expanded: expandEnabled,
              mode: defaultExpandMode
            });
            view.ui.add(this.interactiveLegendExpand, "bottom-left");

            goToMarker(marker, view);
            this._addTitle(config.title);

            document.body.classList.remove(CSS.loading);
          })
        )
      );
    });
  }

  // _addTitle
  private _addTitle(appTitle: string): void {
    const appTitleNode = document.createElement("h1");
    const titleContainerNode = document.querySelector(".title-container");
    appTitleNode.classList.add("app-title");
    appTitleNode.innerText = appTitle;
    titleContainerNode.appendChild(appTitleNode);
  }

  // _handleHomeWidget
  private _handleHomeWidget(view: MapView, homeEnabled: boolean): void {
    if (homeEnabled) {
      const home = new Home({
        view
      });
      view.ui.add(home, "top-left");
    }
  }

  // _handleScreenshotWidget
  private _handleScreenshotWidget(
    screenshotEnabled: boolean,
    legendIncludedInScreenshot: boolean,
    popupIncludedInScreenshot: boolean,
    view: MapView
  ): void {
    if (screenshotEnabled) {
      const mapComponentSelectors =
        legendIncludedInScreenshot && popupIncludedInScreenshot
          ? [CSS.legend, CSS.popup]
          : legendIncludedInScreenshot && !popupIncludedInScreenshot
          ? [CSS.legend]
          : !legendIncludedInScreenshot && popupIncludedInScreenshot
          ? [CSS.popup]
          : null;
      this.screenshot = new Screenshot({
        view,
        mapComponentSelectors
      });

      watchUtils.watch(
        this.screenshot.viewModel,
        "screenshotModeIsActive",
        () => {
          if (this.screenshot.viewModel.screenshotModeIsActive) {
            if (!legendIncludedInScreenshot) {
              this.interactiveLegendExpand.expanded = false;
            }
            if (!popupIncludedInScreenshot && view.popup.visible) {
              view.popup.dockEnabled = true;
            }
            if (this.layerListExpand) {
              this.layerListExpand.expanded = false;
            }
            if (this.searchExpand) {
              this.searchExpand.expanded = false;
            }
          } else {
            this.interactiveLegendExpand.expanded = true;
            if (view.popup.dockEnabled) {
              view.popup.dockEnabled = false;
            }

            if (this.layerListExpand) {
              this.layerListExpand.expanded = true;
            }
            if (this.searchExpand) {
              this.searchExpand.expanded = true;
            }
          }
        }
      );

      view.ui.add(this.screenshot, "top-left");
    }
  }

  // _handleLayerListWidget
  private _handleLayerListWidget(
    layerListEnabled: boolean,
    view: MapView
  ): void {
    if (layerListEnabled) {
      const layerListContent = this.layerList ? this.layerList : null;
      this.layerListExpand = new Expand({
        expandIconClass: "esri-icon-layer-list",
        view,
        content: layerListContent,
        expanded: true
      });
      view.ui.add(this.layerListExpand, "bottom-right");
    }
  }

  // _handleBasemapToggleWidget
  private _handleBasemapToggleWidget(
    basemapToggleEnabled: boolean,
    view: MapView,
    nextBasemap: string
  ): void {
    const nextBaseMapVal = nextBasemap ? nextBasemap : "topo";
    if (basemapToggleEnabled) {
      const basemapToggle = new BasemapToggle({
        view,
        nextBasemap: nextBaseMapVal
      });

      view.ui.add(basemapToggle, "bottom-right");
    }
  }

  // _handleSearchWidget
  private _handleSearchWidget(
    searchEnabled: boolean,
    interactiveLegend: InteractiveLegend,
    view: MapView
  ): void {
    if (searchEnabled) {
      const search = new Search({
        view,
        maxResults: 6,
        maxSuggestions: 6,
        suggestionsEnabled: true,
        includeDefaultSources: false
      });

      this.searchExpand = new Expand({
        content: search,
        expanded: true
      });

      watchUtils.on(interactiveLegend, "activeLayerInfos", "change", () => {
        search.sources.removeAll();
        interactiveLegend.activeLayerInfos.forEach(activeLayerInfo => {
          if (activeLayerInfo.layer.type === "map-notes") {
            this.search.sources.add(null);
            return;
          }
          const featureLayer = activeLayerInfo.layer as FeatureLayer;
          watchUtils.init(featureLayer, "fields", () => {
            if (featureLayer.fields) {
              const fields = [];
              featureLayer.fields.forEach((field: __esri.Field) => {
                if (field.name !== "OBJECTID" && field.name !== "GlobalID") {
                  fields.push(field.name);
                }
              });
              const featureLayerSearchSource = new LayerSearchSource({
                layer: featureLayer,
                searchFields: fields,
                exactMatch: false,
                name: featureLayer.title,
                placeholder: featureLayer.title,
                suggestionsEnabled: true
              });
              search.sources.add(featureLayerSearchSource);
            }
          });
        });
      });

      watchUtils.on(interactiveLegend, "searchExpressions", "change", () => {
        this.layerList.operationalItems.forEach(
          (operationalItems, operationalItemIndex) => {
            search.sources.forEach(searchSource => {
              const layerSearchSource = searchSource as LayerSearchSource;
              if (!searchSource) {
                return;
              }
              const featureLayer = operationalItems.layer as FeatureLayer;
              if (featureLayer.id === layerSearchSource.layer.id) {
                searchSource.filter = {
                  where: interactiveLegend.searchExpressions.getItemAt(
                    operationalItemIndex
                  )
                };
              }
            });
          }
        );
      });
      view.ui.add(this.searchExpand, "top-right");
    }
  }
}

export = InteractiveLegendApp;
