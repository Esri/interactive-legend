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
import { init, whenTrue, whenOnce } from "esri/core/watchUtils";

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

// ConfigurationSettings
import ConfigurationSettings = require("./ConfigurationSettings/ConfigurationSettings");
import {
  addBasemapToggle,
  addHome,
  addLayerList,
  addSearch,
  addZoom,
  addInfoPanel,
  addScreenshot,
  getInfoContent
} from "./utils/widgetUtils";
import { esriWidgetProps } from "./interfaces/interfaces";

// Misc
import Telemetry = require("telemetry/telemetry.dojo");
import Splash = require("./Components/Splash/Splash");

// CSS
const CSS = {
  loading: "configurable-application--loading",
  legend: "esri-interactive-legend__offscreen",
  popup: "offscreen-pop-up-container"
};

declare var calcite: any;

class InteractiveLegendApp {
  private _configurationSettings: ConfigurationSettings = null;
  private _intLegendPropKey = "int-legend-prop-key";
  private _propWatcherKey = "prop-watcher-key";
  base: ApplicationBase = null;
  handles: Handles = new Handles();
  header: Header = null;
  infoPanel = null;
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
  telemetry: Telemetry = null;
  sharedTheme: any = null;

  init(base: ApplicationBase): void {
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
        findQuery(find, view).then(() => {
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

          this._handleCalciteInit();

          this.sharedTheme = this._createSharedTheme();

          this._initPropertyWatchers(widgetProps, view);

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
            updateExtentEnabled: updateExtent
          });

          this._initInteractiveLegendPropWatchers(widgetProps);

          const group =
            interactiveLegendPosition.indexOf("left") !== -1
              ? "left"
              : interactiveLegendPosition.indexOf("right") !== -1
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
            expandIconClass: "custom-interactive-legend"
          });

          whenOnce(this.interactiveLegendExpand, "container", () => {
            if (this.interactiveLegendExpand.container) {
              const container = this.interactiveLegendExpand
                .container as HTMLElement;
              container.classList.add("expand-content-z-index");
            }
          });
          view.ui.add(this.interactiveLegendExpand, interactiveLegendPosition);
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
    const container = document.createElement("header");
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
      customHeaderHTML
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
              const group =
                this._configurationSettings.interactiveLegendPosition.indexOf(
                  "left"
                ) !== -1
                  ? "left"
                  : this._configurationSettings.interactiveLegendPosition.indexOf(
                      "right"
                    ) !== -1
                  ? "right"
                  : null;

              node.group = group;

              esriWidgetProps.view.ui.move(
                node,
                this._configurationSettings.interactiveLegendPosition
              );
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
          "screenshot, screenshotPosition",
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
          "enableLegendOption, enablePopupOption",
          (newValue, oldValue, propertyName) => {
            esriWidgetProps.propertyName = propertyName;

            if (this.screenshot) {
              this.screenshot.enableLegendOption = this._configurationSettings.enableLegendOption;
              if (!this._configurationSettings.enableLegendOption) {
                this.screenshot.includeLegendInScreenshot = false;
              }

              this.screenshot.enablePopupOption = this._configurationSettings.enablePopupOption;
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
          "mapZoom, mapZoomPosition",
          (newValue, oldValue, propertyName) => {
            widgetProps.propertyName = propertyName;
            addZoom(widgetProps);
          }
        ),
        init(
          this._configurationSettings,
          "basemapToggle, basemapTogglePosition, nextBasemap",
          (newValue, oldValue, propertyName) => {
            widgetProps.propertyName = propertyName;
            addBasemapToggle(widgetProps);
          }
        ),
        init(
          this._configurationSettings,
          "search, searchPosition, searchConfiguration, searchOpenAtStart",
          (newValue, oldValue, propertyName) => {
            widgetProps.propertyName = propertyName;
            addSearch(widgetProps);
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
          "infoPanel, infoPanelPosition",
          async (newValue, oldValue, propertyName) => {
            widgetProps.propertyName = propertyName;
            this.infoPanel = await addInfoPanel(widgetProps, this.base);
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
              const jsModal = document.querySelector(".js-modal");
              if (jsModal) {
                document.querySelector(".js-modal").remove();
              }
              const node = view.ui.find("splash");
              if (node) {
                view.ui.remove(node);
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
        )
      ],
      this._propWatcherKey
    );
  }

  private _handleCalciteInit(): void {
    calcite.init();
  }

  private _createSplashWidget(view: __esri.MapView): void {
    this.splashWidget = new Splash({
      view,
      splashTitle: this._configurationSettings.splashTitle,
      splashContent: this._configurationSettings.splashContent,
      splashButtonText: this._configurationSettings.splashButtonText,
      splashOnStart: this._configurationSettings.splashOnStart,
      container: document.createElement("div")
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
}

export = InteractiveLegendApp;
