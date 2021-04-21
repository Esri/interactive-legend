/*
  Copyright 2020 Esri
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

// i18n
import i18nInteractiveLegend from "dojo/i18n!./nls/resources";

// ApplicationBase
import {
  setPageLocale,
  setPageDirection,
  setPageTitle
} from "ApplicationBase/support/domHelper";
import {
  createMapFromItem,
  createView,
  getConfigViewProperties,
  getItemTitle,
  findQuery,
  goToMarker
} from "ApplicationBase/support/itemUtils";
import ApplicationBase = require("ApplicationBase/ApplicationBase");

// esri
import Color = require("esri/Color");

// esri.core
import urlUtils = require("esri/core/urlUtils");
import Handles = require("esri/core/Handles");
import {
  init,
  whenTrue,
  whenOnce,
  whenDefinedOnce,
  watch,
  when
} from "esri/core/watchUtils";
import { eachAlways } from "esri/core/promiseUtils";

// esri.views
import MapView = require("esri/views/MapView");

// esri.widgets
import Expand = require("esri/widgets/Expand");
import LayerList = require("esri/widgets/LayerList");
import Search = require("esri/widgets/Search");

// Components
import Header = require("./Components/Header/Header");
import InteractiveLegend = require("./Components/InteractiveLegend/InteractiveLegend");
import Screenshot = require("./Components/Screenshot/Screenshot");
import Alert = require("./Components/Alert");

// ConfigurationSettings
import ConfigurationSettings = require("./ConfigurationSettings/ConfigurationSettings");
import {
  addHome,
  addLayerList,
  addSearch,
  addZoom,
  addInfoPanel,
  addScreenshot,
  addTimeFilter,
  addBookmarks,
  getInfoContent,
  updateAppTheme,
  addShare
} from "./utils/widgetUtils";
import { esriWidgetProps } from "./interfaces/interfaces";

import BasemapToggle = require("esri/widgets/BasemapToggle");
import {
  getBasemaps,
  resetBasemapsInToggle
} from "TemplatesCommonLib/functionality/basemapToggle";

// Misc
import Splash = require("./Components/Splash/Splash");

import { fromJSON } from "esri/geometry/support/jsonUtils";

// CSS
const CSS = {
  loading: "configurable-application--loading",
  legend: "esri-interactive-legend__offscreen",
  popup: "offscreen-pop-up-container"
};

declare var calcite: any;

import Telemetry, { TelemetryInstance } from "./telemetry/telemetry";

import esriConfig = require("esri/config");

class InteractiveLegendApp {
  private _configurationSettings: ConfigurationSettings = null;
  private _intLegendPropKey = "int-legend-prop-key";
  private _propWatcherKey = "prop-watcher-key";
  private _telemetry: TelemetryInstance = null;
  private _initialExtent = null;
  base: ApplicationBase = null;
  handles: Handles = new Handles();
  analyticsHandles: Handles = new Handles();
  header: Header = null;
  infoPanel = null;
  share = null;
  infoExpand: Expand = null;
  interactiveLegend: InteractiveLegend = null;
  interactiveLegendExpand: Expand = null;
  layerList: LayerList = null;
  layerListExpand: Expand = null;
  screenshot: Screenshot = null;
  search: Search = null;
  searchExpand: Expand = null;
  splashWidget = null;
  splashWidgetButton = null;
  sharedTheme: any = null;

  basemapToggle: __esri.BasemapToggle = null;

  init(base: ApplicationBase): void {
    if (!base) {
      console.error("ApplicationBase is not defined");
      return;
    }
    setPageLocale(base.locale);
    setPageDirection(base.direction);

    this.base = base;

    const { config, results, portal } = base;

    esriConfig.portalUrl = portal.url;

    const { find, marker } = config;

    const { webMapItems } = results;
    const validWebMapItems = webMapItems.map(response => {
      return response.value;
    });
    const firstItem = validWebMapItems[0];
    if (!firstItem) {
      document.location.href = `../../shared/unavailable/index.html?appid=${
        config?.appid || null
      }`;
      return;
    }

    config.title = !config.title ? getItemTitle(firstItem) : config.title;

    setPageTitle(config.title);

    const {
      interactiveLegendPosition,
      filterMode,
      mutedShade,
      muteOpacity,
      muteGrayScale,
      featureCount,
      updateExtent
    } = config;

    this._configurationSettings = new ConfigurationSettings(config);

    this._handleTelemetry();

    const portalItem: any = this.base.results.applicationItem.value;
    const appProxies =
      portalItem && portalItem.applicationProxies
        ? portalItem.applicationProxies
        : null;

    const viewContainerNode = document.getElementById("viewContainer");
    const defaultViewProperties = getConfigViewProperties(config);

    const viewNode = document.createElement("div");
    viewContainerNode.appendChild(viewNode);

    const container = {
      container: viewNode
    };

    const viewProperties = {
      ...defaultViewProperties,
      ...container
    };

    createMapFromItem({ item: firstItem, appProxies }).then(map =>
      createView({
        ...viewProperties,
        map
      }).then((view: MapView) =>
        findQuery(find, view).then(async () => {
          view.when(loadedView => {
            this._initialExtent = loadedView.extent.clone();
          });

          view.ui.remove("zoom");

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

          this.layerList = new LayerList({
            view
          });

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

          const widgetProps: esriWidgetProps = {
            view,
            config: this._configurationSettings,
            portal: this.base.portal
          };

          this.sharedTheme = this._createSharedTheme();

          this._initPropertyWatchers(widgetProps, view);

          this._handleThemeUpdates();

          this.interactiveLegend = new InteractiveLegend({
            view,
            mutedShade: defaultShade,
            style: defaultStyle,
            filterMode: defaultMode,
            layerListViewModel,
            onboardingPanelEnabled,
            opacity: muteOpacity,
            grayScale: muteGrayScale,
            faetureCountEnabled: featureCount,
            updateExtentEnabled: updateExtent,
            theme: this._configurationSettings.theme
          });

          this._initInteractiveLegendPropWatchers(widgetProps);

          const interactiveLegendPosVal =
            typeof interactiveLegendPosition === "string"
              ? interactiveLegendPosition
              : interactiveLegendPosition.position;

          const group =
            interactiveLegendPosVal.indexOf("left") !== -1
              ? "left"
              : interactiveLegendPosVal.indexOf("right") !== -1
              ? "right"
              : null;

          this.interactiveLegendExpand = new Expand({
            id: "interactiveLegend",
            view,
            group,
            content: this.interactiveLegend,
            mode: "floating",
            expanded: true,
            expandTooltip: i18nInteractiveLegend.expandInteractiveLegend,
            collapseTooltip: i18nInteractiveLegend.expandInteractiveLegend,
            expandIconClass: "custom-interactive-legend"
          });

          whenOnce(this.interactiveLegendExpand, "container", () => {
            if (this.interactiveLegendExpand.container) {
              const container = this.interactiveLegendExpand
                .container as HTMLElement;
              container.classList.add("expand-content-z-index");
            }
          });
          view.ui.add(this.interactiveLegendExpand, interactiveLegendPosVal);
          goToMarker(marker, view);

          document.body.classList.remove(CSS.loading);

          this._handleHeader();

          if (!this._configurationSettings.withinConfigurationExperience) {
            this.handles.remove(this._intLegendPropKey);
            this.handles.remove(this._propWatcherKey);
          }
        })
      )
    );
  }

  private _handleHeader(): void {
    const container = document.createElement("div");
    container.classList.add("esri-interactive-legend__header-app-container");

    const {
      title,
      customHeaderHTML,
      customHeader,
      applySharedTheme
    } = this._configurationSettings;

    this.header = new Header({
      container,
      title,
      applySharedTheme,
      sharedTheme: this.sharedTheme,
      customHeader,
      customHeaderHTML,
      theme: this._configurationSettings.theme
    });

    const parentContainer = document.querySelector(
      ".parent-container"
    ) as HTMLElement;

    const headerContainer = this.header.container as HTMLElement;

    parentContainer.insertBefore(headerContainer, parentContainer.firstChild);
  }

  private _handleCustomCSS(): void {
    const customCSSStyleSheet = document.getElementById("customCSS");

    if (customCSSStyleSheet) {
      customCSSStyleSheet.remove();
    }

    const styles = document.createElement("style");
    styles.id = "customCSS";
    styles.type = "text/css";
    const styleTextNode = document.createTextNode(
      this._configurationSettings.customCSS
    );
    styles.appendChild(styleTextNode);
    document.head.appendChild(styles);
  }

  private _initInteractiveLegendPropWatchers(
    esriWidgetProps: esriWidgetProps
  ): void {
    this.handles.add(
      [
        init(
          this._configurationSettings,
          "filterMode",
          (newValue, oldValue, propertyName) => {
            this.interactiveLegend.filterMode = this._configurationSettings.filterMode;
          }
        ),
        init(
          this._configurationSettings,
          "featureCount",
          (newValue, oldValue, propertyName) => {
            this.interactiveLegend.featureCountEnabled = this._configurationSettings.featureCount;
          }
        ),
        init(
          this._configurationSettings,
          "updateExtent",
          (newValue, oldValue, propertyName) => {
            this.interactiveLegend.updateExtentEnabled = this._configurationSettings.updateExtent;
          }
        ),
        init(
          this._configurationSettings,
          "interactiveLegendPosition",
          (newValue, oldValue, propertyName) => {
            const node = esriWidgetProps.view.ui.find(
              "interactiveLegend"
            ) as __esri.Expand;
            if (node) {
              const { interactiveLegendPosition } = this._configurationSettings;
              const interactiveLegendPosVal =
                typeof interactiveLegendPosition === "string"
                  ? interactiveLegendPosition
                  : interactiveLegendPosition?.position;

              const group =
                interactiveLegendPosVal.indexOf("left") !== -1
                  ? "left"
                  : interactiveLegendPosVal.indexOf("right") !== -1
                  ? "right"
                  : null;

              node.group = group;

              esriWidgetProps.view.ui.move(node, interactiveLegendPosVal);
            }
          }
        ),
        init(
          this._configurationSettings,
          "muteOpacity, muteGrayScale",
          (newValue, oldValue, propertyName) => {
            this.interactiveLegend.grayScale = this._configurationSettings.muteGrayScale;
            this.interactiveLegend.opacity = this._configurationSettings.muteOpacity;
          }
        ),
        init(
          this._configurationSettings,
          "screenshot, screenshotPosition, theme",
          async (newValue, oldValue, propertyName) => {
            esriWidgetProps.propertyName = propertyName;
            const screenshot = await addScreenshot(
              esriWidgetProps,
              this.layerList,
              this.interactiveLegend.style.selectedStyleDataCollection
            );
            if (screenshot) {
              this.screenshot = screenshot;
              const screenshotWatcher = "screenshot-watcher-key";
              this.handles.remove(screenshotWatcher);
              this.handles.add(
                whenTrue(this.screenshot, "screenshotModeIsActive", () => {
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
                }),
                screenshotWatcher
              );
            }
            if (this.infoPanel) {
              const screenshotEnabled = this._configurationSettings.screenshot;
              const infoContent = await getInfoContent(screenshotEnabled);
              this.infoPanel.infoContent = infoContent;
              this.infoPanel.selectedItemIndex = 0;
            }
          }
        ),
        init(
          this._configurationSettings,
          "enableLegendOption, enablePopupOption, includeLegendInScreenshot, includePopupInScreenshot",
          (newValue, oldValue, propertyName) => {
            esriWidgetProps.propertyName = propertyName;
            if (this.screenshot) {
              this.screenshot.enableLegendOption = this._configurationSettings.enableLegendOption;
              this.screenshot.enablePopupOption = this._configurationSettings.enablePopupOption;
              this.screenshot.includeLegendInScreenshot = this._configurationSettings.includeLegendInScreenshot;
              this.screenshot.includePopupInScreenshot = this._configurationSettings.includePopupInScreenshot;
              if (!this._configurationSettings.enableLegendOption) {
                this.screenshot.includeLegendInScreenshot = false;
              }
              if (!this._configurationSettings.enablePopupOption) {
                this.screenshot.includePopupInScreenshot = false;
              }
            }
          }
        )
      ],
      this._intLegendPropKey
    );
  }

  private _initPropertyWatchers(widgetProps: esriWidgetProps, view): void {
    this.handles.add(
      [
        init(this._configurationSettings, "applySharedTheme", () => {
          if (this.header) {
            this.header.applySharedTheme = this._configurationSettings.applySharedTheme;
          }
        }),
        init(
          this._configurationSettings,
          "home, homePosition",
          (newValue, oldValue, propertyName) => {
            widgetProps.propertyName = propertyName;
            addHome(widgetProps);
          }
        ),
        init(
          this._configurationSettings,
          "bookmarks, bookmarksPosition",
          (newValue, oldValue, propertyName) => {
            widgetProps.propertyName = propertyName;
            addBookmarks(widgetProps);
          }
        ),
        init(
          this._configurationSettings,
          "mapZoom, mapZoomPosition",
          (newValue, oldValue, propertyName) => {
            widgetProps.propertyName = propertyName;
            addZoom(widgetProps);
          }
        ),
        init(
          this._configurationSettings,
          "basemapToggle, basemapTogglePosition, basemapSelector, nextBasemap",
          async (newValue, oldValue, propertyName) => {
            const {
              basemapToggle,
              basemapTogglePosition
            } = this._configurationSettings;

            const { originalBasemap, nextBasemap } = await getBasemaps(
              widgetProps
            );
            // Decide what to do based on the property that changed

            switch (propertyName) {
              case "basemapToggle":
                if (basemapToggle) {
                  this.basemapToggle = new BasemapToggle({
                    view,
                    nextBasemap
                  });
                  view.ui.add(this.basemapToggle, basemapTogglePosition);
                } else {
                  if (!this.basemapToggle) {
                    return;
                  }
                  resetBasemapsInToggle(
                    this.basemapToggle,
                    originalBasemap,
                    nextBasemap
                  );
                  view.ui.remove(this.basemapToggle);
                  this.basemapToggle.destroy();
                }
                break;
              case "basemapTogglePosition":
                if (!this.basemapToggle) {
                  return;
                }
                view.ui.move(this.basemapToggle, basemapTogglePosition);
                break;
              case "basemapSelector":
                if (!this.basemapToggle) {
                  return;
                }
                resetBasemapsInToggle(
                  this.basemapToggle,
                  originalBasemap,
                  nextBasemap
                );
                break;
              case "nextBasemap":
                if (!this.basemapToggle) {
                  return;
                }
                resetBasemapsInToggle(
                  this.basemapToggle,
                  originalBasemap,
                  nextBasemap
                );
                break;
            }
          }
        ),
        init(
          this._configurationSettings,
          "search, searchPosition, searchConfiguration, searchOpenAtStart",
          async (newValue, oldValue, propertyName) => {
            widgetProps.propertyName = propertyName;
            const search = await addSearch(widgetProps);

            if (search) {
              this.search = search;
            }
            if (!this.handles.has("searchExtentSelector")) {
              this.handles.add(
                init(
                  this._configurationSettings,
                  "extentSelector, extentSelectorConfig",
                  () => {
                    if (!this.search) {
                      return;
                    }
                    const extentSelector = this._configurationSettings
                      ?.extentSelector;
                    const extentSelectorConfig = this._configurationSettings
                      ?.extentSelectorConfig;
                    if (extentSelector && extentSelectorConfig) {
                      const constraints =
                        extentSelectorConfig?.constraints || null;
                      const geometry = constraints?.geometry;
                      if (geometry) {
                        const extent = fromJSON(geometry);
                        if (
                          extent &&
                          (extent?.type === "extent" ||
                            extent?.type === "polygon")
                        ) {
                          this.search.allSources.forEach(source => {
                            source.filter = {
                              geometry: extent
                            };
                          });
                        } else {
                          constraints.geometry = null;
                          this.search.allSources.forEach(source => {
                            source.filter = null;
                          });
                        }
                      }
                    } else {
                      this.search.allSources.forEach(source => {
                        source.filter = null;
                      });
                    }
                  }
                ),
                "searchExtentSelector"
              );
            }

            if (search) {
              this.search = search;
            }
          }
        ),
        init(
          this._configurationSettings,
          "layerList, layerListPosition",
          (newValue, oldValue, propertyName) => {
            widgetProps.propertyName = propertyName;
            addLayerList(widgetProps);
          }
        ),
        init(
          this._configurationSettings,
          "timeFilter, timeFilterPosition, timeFilterConfig, filterMode, muteOpacity, muteGrayScale",
          (newValue, oldValue, propertyName) => {
            widgetProps.propertyName = propertyName;
            addTimeFilter(widgetProps);
          }
        ),
        init(
          this._configurationSettings,
          "infoPanel, infoPanelPosition",
          async (newValue, oldValue, propertyName) => {
            widgetProps.propertyName = propertyName;
            this.infoPanel = await addInfoPanel(widgetProps, this.base);
          }
        ),
        init(
          this._configurationSettings,
          "share, sharePosition, theme",
          async (newValue, oldValue, propertyName) => {
            widgetProps.propertyName = propertyName;
            this.share = await addShare(widgetProps);
          }
        ),
        init(
          this._configurationSettings,
          "splash",
          async (newValue, oldValue, propertyName) => {
            const { view, config } = widgetProps;
            const { splash } = config;

            if (splash) {
              this._createSplashWidget(view);
              this.splashWidgetButton = this.splashWidget.createToolbarButton();
              view.ui.add(this.splashWidgetButton, config.splashButtonPosition);
            } else {
              const node = view.ui.find("splash");
              if (node) {
                view.ui.remove(node);
                document
                  .querySelector(".esri-interactive-legend__splash-modal")
                  .remove();
              }
            }
          }
        ),
        init(
          this._configurationSettings,
          "splashButtonPosition, splashOnStart, splashTitle, splashContent, splashButtonText",
          async (newValue, oldValue, propertyName) => {
            if (this.splashWidget && propertyName === "splashButtonText") {
              this.splashWidget.splashButtonText = this._configurationSettings.splashButtonText;
            } else if (this.splashWidget && propertyName === "splashContent") {
              this.splashWidget.splashContent = this._configurationSettings.splashContent;
            } else if (this.splashWidget && propertyName === "splashTitle") {
              this.splashWidget.splashTitle = this._configurationSettings.splashTitle;
            } else if (this.splashWidget && propertyName === "splashOnStart") {
              this.splashWidget.splashOnStart = this._configurationSettings.splashOnStart;
            } else if (
              this.splashWidget &&
              propertyName === "splashButtonPosition"
            ) {
              widgetProps.view.ui.move(
                this.splashWidgetButton,
                this._configurationSettings.splashButtonPosition
              );
            }
          }
        ),
        init(
          this._configurationSettings,
          "title",
          (newValue, oldValue, propertyName) => {
            if (this.header) {
              this.header.title = this._configurationSettings.title
                ? this._configurationSettings.title
                : this.base.config.title;
            }
          }
        ),
        init(
          this._configurationSettings,
          "customHeader, customHeaderHTML",
          () => {
            if (this.header) {
              this.header.customHeaderHTML = this._configurationSettings.customHeaderHTML;
              this.header.customHeader = this._configurationSettings.customHeader;
            }
          }
        ),
        init(
          this._configurationSettings,
          "customCSS",
          (newValue, oldValue, propertyName) => {
            this._handleCustomCSS();
          }
        ),
        init(
          this._configurationSettings,
          "mapA11yDesc",
          (newValue, oldValue, propertyName) => {
            if (this._configurationSettings.mapA11yDesc) {
              if (!document.getElementById("mapDescription")) {
                const mapA11yDescContainer = document.createElement("div");
                mapA11yDescContainer.id = "mapDescription";
                mapA11yDescContainer.classList.add("sr-only");
                mapA11yDescContainer.innerHTML = this._configurationSettings.mapA11yDesc;
                view.container.appendChild(mapA11yDescContainer);
                const rootNode = document.getElementsByClassName(
                  "esri-view-surface"
                );
                view.container.setAttribute(
                  "aria-describedby",
                  "mapDescription"
                );
                for (let k = 0; k < rootNode.length; k++) {
                  rootNode[k].setAttribute(
                    "aria-describedby",
                    "mapDescription"
                  );
                }
              } else {
                document.getElementById(
                  "mapDescription"
                ).innerHTML = this._configurationSettings.mapA11yDesc;
              }
            } else {
              const portalItem = view?.map?.portalItem;
              const mapA11yDescVal =
                portalItem?.snippet || portalItem?.description;
              if (!document.getElementById("mapDescription")) {
                const mapA11yDescContainer = document.createElement("div");
                mapA11yDescContainer.id = "mapDescription";
                mapA11yDescContainer.classList.add("sr-only");
                mapA11yDescContainer.innerHTML = mapA11yDescVal;
                view.container.appendChild(mapA11yDescContainer);
                const rootNode = document.getElementsByClassName(
                  "esri-view-surface"
                );
                view.container.setAttribute(
                  "aria-describedby",
                  "mapDescription"
                );
                for (let k = 0; k < rootNode.length; k++) {
                  rootNode[k].setAttribute(
                    "aria-describedby",
                    "mapDescription"
                  );
                }
              } else {
                document.getElementById(
                  "mapDescription"
                ).innerHTML = mapA11yDescVal;
              }
            }
          }
        ),
        init(
          this._configurationSettings,
          "customUrlParam, customURLParamName",
          (newValue, oldValue, propertyName) => {
            const customUrlParam = this._configurationSettings.customUrlParam
              ?.layers?.[0];
            const fieldName = customUrlParam?.fields?.[0];
            const customUrlParamName = this._configurationSettings
              .customURLParamName;
            if (!customUrlParam || !customUrlParamName || !fieldName) {
              return;
            }
            const layer = view.map.findLayerById(
              customUrlParam.id
            ) as __esri.Layer;

            const layerSearchSource = {
              layer,
              searchFields: customUrlParam.fields,
              outFields: ["*"],
              exactMatch: true,
              displayField: fieldName
            } as __esri.LayerSearchSource;

            const href = this._configurationSettings
              .withinConfigurationExperience
              ? document.referrer
              : document.location.href;

            const searchResults = urlUtils.urlToObject(href);
            let searchTerm = null;
            if (searchResults?.query) {
              if (customUrlParamName in searchResults.query) {
                searchTerm = searchResults.query[customUrlParamName];
              }
            }

            if (layer) {
              const search = new Search({
                view,
                resultGraphicEnabled: false,
                searchAllEnabled: false,
                includeDefaultSources: false,
                suggestionsEnabled: false,
                sources: [layerSearchSource],
                searchTerm
              });
              search.search();
            }
          }
        ),
        init(
          this._configurationSettings,
          "extentSelector, extentSelectorConfig",
          (newValue, oldValue, propertyName) => {
            if (
              this._configurationSettings?.extentSelector &&
              this._configurationSettings.extentSelectorConfig
            ) {
              const constraints =
                this._configurationSettings?.extentSelectorConfig
                  ?.constraints || null;
              const geometry = constraints?.geometry;
              if (geometry) {
                const extent = fromJSON(geometry);
                if (
                  extent &&
                  (extent?.type === "extent" || extent?.type === "polygon")
                ) {
                  constraints.geometry = extent;
                  view.goTo(extent, false).catch(() => {});
                } else {
                  constraints.geometry = null;
                }
              }
              view.constraints = constraints;
              this._setMapViewRotation(view);
            } else {
              view.rotation = 0;
              view.constraints.geometry = null;
              view.constraints.minZoom = -1;
              view.constraints.maxZoom = -1;
              view.constraints.minScale = 0;
              view.constraints.maxScale = 0;
              if (this._initialExtent) {
                view.goTo(this._initialExtent);
              }
            }
          }
        )
      ],
      this._propWatcherKey
    );
  }

  private _handleThemeUpdates(): void {
    // Check for a preferred color scheme and then
    // monitor updates to that color scheme and the
    // configuration panel updates.
    if (!this._configurationSettings.theme) {
      this._configurationSettings.theme = window.matchMedia(
        "(prefers-color-scheme: dark)"
      )
        ? "dark"
        : "light";
    }
    this.handles.add(
      init(this._configurationSettings, "theme", () => {
        const { theme } = this._configurationSettings;
        updateAppTheme(theme);
        if (this.interactiveLegend) {
          this.interactiveLegend.set("theme", theme);
        }
        if (this.header) {
          this.header.set("theme", theme);
        }
        if (this.screenshot) {
          this.screenshot.set("theme", theme);
        }
        if (this.infoPanel) {
          this.infoPanel.set("theme", theme);
        }
        if (this.splashWidget) {
          this.splashWidget.set("theme", theme);
        }
      }),
      "configuration"
    );
  }

  private _createSplashWidget(view: __esri.MapView): void {
    this.splashWidget = new Splash({
      view,
      splashTitle: this._configurationSettings.splashTitle,
      splashContent: this._configurationSettings.splashContent,
      splashButtonText: this._configurationSettings.splashButtonText,
      splashOnStart: this._configurationSettings.splashOnStart,
      container: document.createElement("calcite-modal")
    });

    whenOnce(this.splashWidget, "modalNode", () => {
      if (this.splashWidget.splashOnStart) {
        this.splashWidget.modalNode.setAttribute("active", "");
      }
    });

    document.body.appendChild(this.splashWidget.container as HTMLElement);
  }

  private _createSharedTheme(): void {
    const portal = this.base?.portal;
    let sharedTheme: any = null;
    if (portal?.portalProperties) {
      const theme = portal?.portalProperties?.sharedTheme;
      sharedTheme = {
        background: theme?.header?.background,
        text: theme?.header?.text,
        logo: theme?.logo?.small,
        logoLink: theme?.logo?.link
      };
    }

    return sharedTheme;
  }

  async createTelemetry() {
    // add alert to container
    const { portal } = this.base;
    const appName = this.base.config?.telemetry?.name;
    this._telemetry = await Telemetry.init({
      portal,
      config: this._configurationSettings,
      appName
    });
    this._telemetry?.logPageView();
  }
  private _handleTelemetry() {
    // Wait until both are defined
    eachAlways([
      whenDefinedOnce(this._configurationSettings, "googleAnalytics"),
      whenDefinedOnce(this._configurationSettings, "googleAnalyticsKey"),
      whenDefinedOnce(this._configurationSettings, "googleAnalyticsConsentMsg"),
      whenDefinedOnce(this._configurationSettings, "googleAnalyticsConsent")
    ]).then(() => {
      this.createTelemetry();

      const alertContainer = document.createElement("container");
      document.body.appendChild(alertContainer);
      new Alert({
        config: this._configurationSettings,
        container: alertContainer,
        appName: this.base.config?.telemetry?.name
      });

      this.analyticsHandles.add([
        watch(
          this._configurationSettings,
          [
            "googleAnalytics",
            "googleAnalyticsConsent",
            "googleAnalyticsConsentMsg",
            "googleAnalyticsKey"
          ],
          (newValue, oldValue, propertyName) => {
            this.createTelemetry();
          }
        )
      ]);
    });
  }

  private _setMapViewRotation(view): void {
    const mapRotation = this._configurationSettings?.extentSelectorConfig
      ?.mapRotation;
    if (view && view.constraints && !view.constraints.rotationEnabled) {
      // if rotation is disabled
      view.constraints.rotationEnabled = true; // set rotation to enabled
      if (mapRotation || mapRotation === 0) {
        view.rotation = mapRotation;
      }
      view.constraints.rotationEnabled = false; // set rotation back to disabled
    } else {
      if (mapRotation || mapRotation === 0) {
        view.rotation = mapRotation;
      }
    }
  }
}

export = InteractiveLegendApp;
