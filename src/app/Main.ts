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

// dojo.i18n
import * as i18nInteractiveLegend from "dojo/i18n!./nls/resources";

import * as i18nScreenshot from "dojo/i18n!./Components/Screenshot/Screenshot/nls/resources";

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

// esri.layers.FeatureLayer
import FeatureLayer = require("esri/layers/FeatureLayer");

// esri.widgets.BasemapToggle
import BasemapToggle = require("esri/widgets/BasemapToggle");

// esri.Basemap
import Basemap = require("esri/Basemap");

// esri.widgets.Expand
import Expand = require("esri/widgets/Expand");

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

// esri.Color
import Color = require("esri/Color");

// Screenshot
import Screenshot = require("./Components/Screenshot/Screenshot");

// Info
import Info = require("./Components/Info/Info");

// Telemetry
import Telemetry = require("telemetry/telemetry.dojo");

// InteractiveLegend
import InteractiveLegend = require("./Components/InteractiveLegend/InteractiveLegend");

// Splash
import Splash = require("./Components/Splash/Splash");

// Header
import Header = require("./Components/Header/Header");

// InfoItem
import InfoItem = require("./Components/Info/Info/InfoItem");

// esri.core.Collection
import Collection = require("esri/core/Collection");

// urlUtils
import urlUtils = require("esri/core/urlUtils");

import { ApplicationConfig } from "ApplicationBase/interfaces";

// CSS
const CSS = {
  loading: "configurable-application--loading",
  legend: "esri-interactive-legend__offscreen",
  popup: "offscreen-pop-up-container"
};

declare var calcite: any;

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
  infoExpand: Expand = null;
  interactiveLegend: InteractiveLegend = null;

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
      homeEnabled,
      homePosition,
      zoomControlsEnabled,
      zoomControlsPosition,
      searchEnabled,
      searchConfig,
      searchPosition,
      basemapToggleEnabled,
      basemapTogglePosition,
      nextBasemap,
      layerListEnabled,
      layerListPosition,
      screenshotEnabled,
      screenshotPosition,
      enablePopupOption,
      enableLegendOption,
      infoPanelEnabled,
      infoPanelPosition,
      splashButtonPosition,
      interactiveLegendPosition,
      filterMode,
      mutedShade,
      muteOpacity,
      muteGrayScale,
      searchOpenAtStart,
      featureCountEnabled,
      updateExtentEnabled
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

    config.title = !config.title ? getItemTitle(firstItem) : config.title;

    setPageTitle(config.title);

    const portalItem: any = this.base.results.applicationItem.value;
    const appProxies =
      portalItem && portalItem.applicationProxies
        ? portalItem.applicationProxies
        : null;

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
            this._handleBasemapToggleWidget(
              basemapToggleEnabled,
              view,
              nextBasemap,
              basemapTogglePosition
            );
            if (!zoomControlsEnabled) {
              view.ui.remove("zoom");
            }
            if (zoomControlsPosition) {
              view.ui.move("zoom", zoomControlsPosition);
            }
            let defaultShade = null;
            if (!mutedShade) {
              defaultShade = new Color("rgba(169,169,169, 0.5)");
            } else {
              if (typeof mutedShade === "string") {
                defaultShade = new Color(mutedShade);
              } else {
                const { r, g, b, a } = mutedShade;
                defaultShade = new Color(`rgba(${r},${g},${b},${a})`);
              }
            }

            const defaultStyle = "classic";
            const defaultMode = filterMode ? filterMode : "featureFilter";

            this._defineUrlParams(view);
            this._handleHomeWidget(view, homeEnabled, homePosition);
            this._handleSplash(config, view, splashButtonPosition);

            this.layerList = new LayerList({
              view
            });
            this._handleLayerListWidget(
              layerListEnabled,
              view,
              layerListPosition
            );

            const layerListViewModel = this.layerList
              ? this.layerList.viewModel
              : null;
            let onboardingPanelEnabled = null;
            if (localStorage.getItem("firstTimeUseApp")) {
              onboardingPanelEnabled = false;
            } else {
              localStorage.setItem("firstTimeUseApp", `${Date.now()}`);
              onboardingPanelEnabled = true;
            }

            this.interactiveLegend = new InteractiveLegend({
              view,
              mutedShade: defaultShade,
              container: document.createElement("div"),
              style: defaultStyle,
              filterMode: defaultMode,
              layerListViewModel,
              onboardingPanelEnabled,
              opacity: muteOpacity,
              grayScale: muteGrayScale,
              featureCountEnabled,
              updateExtentEnabled
            });

            this._handleSearchWidget(
              searchEnabled,
              this.interactiveLegend,
              view,
              searchConfig,
              searchPosition,
              searchOpenAtStart
            );
            const interactiveLegendGroup =
              interactiveLegendPosition.indexOf("left") !== -1
                ? "left"
                : "right";
            this.interactiveLegendExpand = new Expand({
              view,
              group: interactiveLegendGroup,
              content: this.interactiveLegend,
              mode: "floating",
              expanded: true,
              expandTooltip: i18nInteractiveLegend.expandInteractiveLegend,
              expandIconClass: "custom-interactive-legend"
            });

            watchUtils.whenOnce(
              this.interactiveLegendExpand,
              "container",
              () => {
                if (this.interactiveLegendExpand.container) {
                  const container = this.interactiveLegendExpand
                    .container as HTMLElement;
                  container.classList.add("expand-content-z-index");
                }
              }
            );
            view.ui.add(
              this.interactiveLegendExpand,
              interactiveLegendPosition
            );

            if (infoPanelEnabled) {
              const screenshotTitle =
                i18nInteractiveLegend.onboardingPanelScreenshotTitle;
              const {
                onboardingPanelScreenshotStepOne,
                onboardingPanelScreenshotStepTwo,
                onboardingPanelScreenshotStepThree,
                onboardingPanelScreenshotStepFour,
                onboardingPanelScreenshotStepFive,
                newInteractiveLegend,
                firstOnboardingWelcomeMessage,
                secondOnboardingWelcomeMessage,
                thirdOnboardingWelcomeMessage
              } = i18nInteractiveLegend;

              const screenshotSteps = [
                onboardingPanelScreenshotStepOne,
                onboardingPanelScreenshotStepTwo,
                onboardingPanelScreenshotStepThree,
                onboardingPanelScreenshotStepFour,
                onboardingPanelScreenshotStepFive
              ];
              const infoContent = screenshotEnabled
                ? new Collection([
                    new InfoItem({
                      type: "list",
                      title: screenshotTitle,
                      infoContentItems: screenshotSteps
                    }),
                    new InfoItem({
                      type: "explanation",
                      title: newInteractiveLegend,
                      infoContentItems: [
                        firstOnboardingWelcomeMessage,
                        secondOnboardingWelcomeMessage,
                        thirdOnboardingWelcomeMessage
                      ]
                    })
                  ])
                : new Collection([
                    new InfoItem({
                      type: "explanation",
                      title: newInteractiveLegend,
                      infoContentItems: [
                        firstOnboardingWelcomeMessage,
                        secondOnboardingWelcomeMessage,
                        thirdOnboardingWelcomeMessage
                      ]
                    })
                  ]);

              const infoWidget = new Info({
                view,
                infoContent
              });
              const infoGroup =
                infoPanelPosition.indexOf("left") !== -1 ? "left" : "right";
              this.infoExpand = new Expand({
                view,
                group: infoGroup,
                content: infoWidget,
                mode: "floating",
                expandTooltip: infoWidget.label
              });

              infoWidget.expandWidget = this.infoExpand;

              watchUtils.whenOnce(this.infoExpand, "container", () => {
                if (this.infoExpand.container) {
                  const container = this.infoExpand.container as HTMLElement;
                  container.classList.add("expand-content-z-index");
                }
                if (base.locale === "ar") {
                  const questionMarkIcon = document.querySelector(
                    ".esri-collapse__icon.icon-ui-question.icon-ui-flush"
                  ) as HTMLElement;
                  questionMarkIcon.style.transform = "scaleX(-1)";
                }
              });

              view.ui.add(this.infoExpand, infoPanelPosition);
            }

            this._handleScreenshotWidget(
              screenshotEnabled,
              enableLegendOption,
              enablePopupOption,
              view,
              screenshotPosition,
              featureCountEnabled
            );

            goToMarker(marker, view);

            this._handleHeader(config);

            if (config.customCSS) {
              this._handleCustomCSS(config);
            }
            document.body.classList.remove(CSS.loading);
          })
        )
      );
    });
  }

  // _handleHomeWidget
  private _handleHomeWidget(
    view: MapView,
    homeEnabled: boolean,
    homePosition: string
  ): void {
    if (homeEnabled) {
      const home = new Home({
        view
      });
      view.ui.add(home, homePosition);
    }
  }

  // _handleHeader
  private _handleHeader(config: ApplicationConfig): void {
    const container = document.createElement("div");
    const header = new Header({
      container,
      config
    });

    const parentContainer = document.querySelector(
      ".parent-container"
    ) as HTMLElement;

    const headerContainer = header.container as HTMLElement;

    parentContainer.insertBefore(headerContainer, parentContainer.firstChild);

    const parentContainerHeight = parentContainer.offsetHeight;
    const headerContainerHeight = headerContainer.offsetHeight;
    const hcProportion = headerContainerHeight * 100;
    const hcHeightPercentage = parseFloat(
      (hcProportion / parentContainerHeight).toFixed(4)
    );
    const viewParentContainerPercentage = 100 - hcHeightPercentage;
    document.getElementById(
      "view-parent-container"
    ).style.height = `${viewParentContainerPercentage}%`;
  }

  // _handleSplash
  private _handleSplash(
    config: ApplicationConfig,
    view: MapView,
    splashButtonPosition: string
  ): void {
    if (config.splash) {
      calcite.init();
      const splash = new Splash.default({
        view,
        config,
        container: document.createElement("div")
      });
      document.body.appendChild(splash.container as HTMLElement);
      view.ui.add(splash.createToolbarButton(), splashButtonPosition);

      splash.showSplash();
    }
  }

  // _handleCustomCSS
  private _handleCustomCSS(config: ApplicationConfig): void {
    const styles = document.createElement("style");
    styles.type = "text/css";
    styles.appendChild(document.createTextNode(config.customCSS));
    document.head.appendChild(styles);
  }

  // _handleScreenshotWidget
  private _handleScreenshotWidget(
    screenshotEnabled: boolean,
    enableLegendOption: boolean,
    enablePopupOption: boolean,
    view: MapView,
    screenshotPosition: string,
    featureCountEnabled: boolean
  ): void {
    if (screenshotEnabled) {
      this.screenshot = new Screenshot({
        view,
        enableLegendOption,
        enablePopupOption,
        includeLegendInScreenshot: true,
        selectedStyleData: this.interactiveLegend.style
          .selectedStyleDataCollection,
        legendFeatureCountEnabled: featureCountEnabled,
        layerListViewModel: this.layerList.viewModel
      });

      if (!enableLegendOption) {
        this.screenshot.includeLegendInScreenshot = false;
      }
      if (!enablePopupOption) {
        this.screenshot.includePopupInScreenshot = false;
      }
      const screenshotExpand = new Expand({
        view,
        content: this.screenshot,
        expandTooltip: i18nScreenshot.takeAScreenshot,
        mode: "floating"
      });

      watchUtils.whenFalse(screenshotExpand, "expanded", () => {
        if (this.screenshot.screenshotModeIsActive) {
          this.screenshot.screenshotModeIsActive = false;
        }
      });

      const screenshotGroup =
        screenshotPosition.indexOf("left") !== -1 ? "left" : "right";

      screenshotExpand.group = screenshotGroup;

      view.ui.add(screenshotExpand, screenshotPosition);
      watchUtils.whenTrue(this.screenshot, "screenshotModeIsActive", () => {
        if (
          this.interactiveLegendExpand &&
          this.interactiveLegendExpand.expanded
        ) {
          this.interactiveLegendExpand.expanded = false;
        }
        if (this.infoExpand && this.infoExpand.expanded) {
          this.infoExpand.expanded = false;
        }
        if (this.searchExpand && this.searchExpand.expanded) {
          this.searchExpand.expanded = false;
        }
        if (this.layerListExpand && this.layerListExpand.expanded) {
          this.layerListExpand.expanded = false;
        }
      });
    }
  }

  // _handleLayerListWidget
  private _handleLayerListWidget(
    layerListEnabled: boolean,
    view: MapView,
    layerListPosition: string
  ): void {
    if (layerListEnabled) {
      const layerListContent = this.layerList ? this.layerList : null;
      const layerListGroup =
        layerListPosition.indexOf("left") !== -1 ? "left" : "right";
      this.layerListExpand = new Expand({
        view,
        content: layerListContent,
        mode: "floating",
        expandIconClass: "esri-icon-layer-list",
        expandTooltip: this.layerList.label,
        group: layerListGroup
      });
      watchUtils.whenOnce(this.layerListExpand, "container", () => {
        if (this.layerListExpand.container) {
          const container = this.layerListExpand.container as HTMLElement;
          container.classList.add("expand-content-z-index");
        }
      });
      view.ui.add(this.layerListExpand, layerListPosition);
    }
  }

  // _handleBasemapToggleWidget
  private async _handleBasemapToggleWidget(
    basemapToggleEnabled: boolean,
    view: MapView,
    nextBasemap: string,
    basemapTogglePosition: string
  ): Promise<void> {
    if (basemapToggleEnabled) {
      let basemap;

      basemap = Basemap.fromId(nextBasemap);

      if (!basemap) {
        basemap = await new Basemap({
          portalItem: {
            id: nextBasemap
          }
        }).loadAll();
      }

      if (!basemap) {
        basemap = "topo";
      }

      const basemapToggle = new BasemapToggle({
        view,
        nextBasemap: basemap
      });

      watchUtils.whenOnce(basemapToggle, "container", () => {
        if (basemapToggle.container) {
          const container = basemapToggle.container as HTMLElement;
          container.classList.add("expand-content-z-index");
        }
      });
      view.ui.add(basemapToggle, basemapTogglePosition);
    }
  }

  // _handleSearchWidget
  private _handleSearchWidget(
    searchEnabled: boolean,
    interactiveLegend: InteractiveLegend,
    view: MapView,
    searchConfig: any,
    searchPosition: string,
    searchOpenAtStart: boolean
  ): void {
    // Get any configured search settings
    if (searchEnabled) {
      const searchProperties: any = {
        view,
        container: document.createElement("div")
      };
      if (searchConfig) {
        if (searchConfig.sources) {
          const sources = searchConfig.sources;

          searchProperties.sources = sources.filter(source => {
            if (source.flayerId && source.url) {
              const layer = view.map.findLayerById(source.flayerId);
              source.layer = layer ? layer : new FeatureLayer(source.url);
            }
            if (source.hasOwnProperty("enableSuggestions")) {
              source.suggestionsEnabled = source.enableSuggestions;
            }
            if (source.hasOwnProperty("searchWithinMap")) {
              source.withinViewEnabled = source.searchWithinMap;
            }

            return source;
          });
        }
        if (
          searchProperties.sources &&
          searchProperties.sources.length &&
          searchProperties.sources.length > 0
        ) {
          searchProperties.includeDefaultSources = false;
        }
        searchProperties.searchAllEnabled = searchConfig.enableSearchingAll
          ? true
          : false;
        if (
          searchConfig.activeSourceIndex &&
          searchProperties.sources &&
          searchProperties.sources.length >= searchConfig.activeSourceIndex
        ) {
          searchProperties.activeSourceIndex = searchConfig.activeSourceIndex;
        }
      }

      const search = new Search(searchProperties);
      const searchGroup =
        searchPosition.indexOf("left") !== -1 ? "left" : "right";
      this.searchExpand = new Expand({
        view,
        content: search,
        mode: "floating",
        expandTooltip: search.label,
        group: searchGroup,
        expanded: searchOpenAtStart
      });
      interactiveLegend.searchViewModel = search.viewModel;

      watchUtils.whenOnce(this.searchExpand, "container", () => {
        if (this.searchExpand.container) {
          const container = this.searchExpand.container as HTMLElement;
          container.classList.add("expand-content-z-index");
        }
      });

      view.ui.add(this.searchExpand, searchPosition);
    }
  }

  // _defineUrlParams
  private _defineUrlParams(view: MapView): void {
    if (
      this.base.config.customUrlLayer.id &&
      this.base.config.customUrlLayer.fields.length > 0 &&
      this.base.config.customUrlParam
    ) {
      if (!Search && urlUtils) {
        return;
      }
      const searchResults = urlUtils.urlToObject(document.location.href);
      let searchTerm = null;
      if (searchResults && searchResults.query) {
        if (this.base.config.customUrlParam in searchResults.query) {
          searchTerm = searchResults.query[this.base.config.customUrlParam];
        }
      }

      const featureLayer = view.map.findLayerById(
        this.base.config.customUrlLayer.id
      ) as __esri.Layer;
      const layerSearchSource = {
        layer: featureLayer,
        searchFields: this.base.config.customUrlLayer.fields[0].fields,
        outFields: ["*"],
        exactMatch: true
      } as __esri.LayerSearchSource;
      if (featureLayer && searchTerm) {
        const search = new Search({
          view,
          resultGraphicEnabled: false,
          searchAllEnabled: false,
          includeDefaultSources: false,
          suggestionsEnabled: false,
          searchTerm,
          sources: [layerSearchSource]
        });
        search.search();
      }
    }
  }
}

export = InteractiveLegendApp;
