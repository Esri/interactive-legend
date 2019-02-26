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
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "dojo/i18n!./nls/resources", "ApplicationBase/support/itemUtils", "ApplicationBase/support/domHelper", "esri/widgets/Home", "esri/widgets/LayerList", "esri/widgets/Search", "esri/layers/FeatureLayer", "esri/widgets/BasemapToggle", "esri/widgets/Expand", "esri/core/watchUtils", "esri/Color", "./Components/Screenshot/Screenshot", "./Components/Info/Info", "telemetry/telemetry.dojo", "esri/widgets/Feature", "./Components/InteractiveLegend/InteractiveLegend", "./Components/Splash/Splash", "./Components/Header/Header"], function (require, exports, i18nInteractiveLegend, itemUtils_1, domHelper_1, Home, LayerList, Search, FeatureLayer, BasemapToggle, Expand, watchUtils, Color, Screenshot, Info, Telemetry, FeatureWidget, InteractiveLegend, Splash, Header) {
    "use strict";
    // CSS
    var CSS = {
        loading: "configurable-application--loading",
        legend: "esri-interactive-legend__offscreen",
        popup: "offscreen-pop-up-container"
    };
    var InteractiveLegendApp = /** @class */ (function () {
        function InteractiveLegendApp() {
            //--------------------------------------------------------------------------
            //
            //  Properties
            //
            //--------------------------------------------------------------------------
            this.base = null;
            this.telemetry = null;
            this.search = null;
            this.layerList = null;
            this.layerListExpand = null;
            this.screenshot = null;
            this.interactiveLegendExpand = null;
            this.searchExpand = null;
            this.featureWidget = null;
            this.highlightedFeature = null;
            this.infoExpand = null;
        }
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        InteractiveLegendApp.prototype.init = function (base) {
            var _this = this;
            if (!base) {
                console.error("ApplicationBase is not defined");
                return;
            }
            domHelper_1.setPageLocale(base.locale);
            domHelper_1.setPageDirection(base.direction);
            this.base = base;
            var config = base.config, results = base.results, portal = base.portal;
            var find = config.find, marker = config.marker;
            // Setup Telemetry
            if (config.telemetry) {
                var options = config.telemetry.prod;
                if (portal.customBaseUrl.indexOf("mapsdevext") !== -1) {
                    // use devext credentials
                    options = config.telemetry.devext;
                }
                else if (portal.customBaseUrl.indexOf("mapsqa") !== -1) {
                    // or qa
                    options = config.telemetry.qaext;
                }
                this.telemetry = new Telemetry({
                    portal: portal,
                    disabled: options.disabled,
                    debug: options.debug,
                    amazon: options.amazon
                });
                this.telemetry.logPageView();
            }
            var homeEnabled = config.homeEnabled, homePosition = config.homePosition, zoomControlsEnabled = config.zoomControlsEnabled, zoomControlsPosition = config.zoomControlsPosition, searchEnabled = config.searchEnabled, searchConfig = config.searchConfig, searchPosition = config.searchPosition, basemapToggleEnabled = config.basemapToggleEnabled, basemapTogglePosition = config.basemapTogglePosition, nextBasemap = config.nextBasemap, layerListEnabled = config.layerListEnabled, layerListPosition = config.layerListPosition, screenshotEnabled = config.screenshotEnabled, screenshotPosition = config.screenshotPosition, popupIncludedInScreenshot = config.popupIncludedInScreenshot, legendIncludedInScreenshot = config.legendIncludedInScreenshot, infoPanelEnabled = config.infoPanelEnabled, infoPanelPosition = config.infoPanelPosition, splashButtonPosition = config.splashButtonPosition, interactiveLegendPosition = config.interactiveLegendPosition, filterMode = config.filterMode, 
            // highlightShade,
            mutedShade = config.mutedShade, muteOpacity = config.muteOpacity, muteGrayScale = config.muteGrayScale, searchOpenAtStart = config.searchOpenAtStart;
            var webMapItems = results.webMapItems;
            var validWebMapItems = webMapItems.map(function (response) {
                return response.value;
            });
            var firstItem = validWebMapItems[0];
            if (!firstItem) {
                var error = i18nInteractiveLegend.error;
                document.body.innerText = error;
                document.body.classList.remove("configurable-application--loading");
                document.body.classList.add("error");
                console.error(error);
                this.telemetry.logError({
                    error: error
                });
                return;
            }
            config.title = !config.title ? itemUtils_1.getItemTitle(firstItem) : config.title;
            domHelper_1.setPageTitle(config.title);
            // todo: Typings will be fixed in next release.
            var portalItem = this.base.results.applicationItem.value;
            var appProxies = portalItem && portalItem.appProxies ? portalItem.appProxies : null;
            var viewContainerNode = document.getElementById("viewContainer");
            var defaultViewProperties = itemUtils_1.getConfigViewProperties(config);
            validWebMapItems.forEach(function (item) {
                var viewNode = document.createElement("div");
                viewContainerNode.appendChild(viewNode);
                var container = {
                    container: viewNode
                };
                var viewProperties = __assign({}, defaultViewProperties, container);
                itemUtils_1.createMapFromItem({ item: item, appProxies: appProxies }).then(function (map) {
                    return itemUtils_1.createView(__assign({}, viewProperties, { map: map })).then(function (view) {
                        return itemUtils_1.findQuery(find, view).then(function () {
                            _this._handleBasemapToggleWidget(basemapToggleEnabled, view, nextBasemap, basemapTogglePosition);
                            if (!zoomControlsEnabled) {
                                view.ui.remove("zoom");
                            }
                            if (zoomControlsPosition) {
                                view.ui.move("zoom", zoomControlsPosition);
                            }
                            var defaultShade = null;
                            if (!mutedShade) {
                                defaultShade = new Color("rgba(169,169,169, 0.5)");
                            }
                            else {
                                if (typeof mutedShade === "string") {
                                    defaultShade = new Color(mutedShade);
                                }
                                else {
                                    var r = mutedShade.r, g = mutedShade.g, b = mutedShade.b, a = mutedShade.a;
                                    defaultShade = new Color("rgba(" + r + "," + g + "," + b + "," + a + ")");
                                }
                            }
                            var defaultStyle = "classic";
                            var defaultMode = filterMode ? filterMode : "featureFilter";
                            // if (highlightShade) {
                            //   const highlightedShade = new Color(highlightShade);
                            //   const { r, g, b, a } = highlightedShade;
                            //   view.highlightOptions = {
                            //     color: new Color(`rgb(${r},${g},${b})`),
                            //     fillOpacity: a
                            //   };
                            // } else {
                            //   view.highlightOptions = {
                            //     color: new Color("#000000")
                            //   };
                            // }
                            _this._handleHomeWidget(view, homeEnabled, homePosition);
                            _this._handleSplash(config, view, splashButtonPosition);
                            _this.layerList = new LayerList({
                                view: view
                            });
                            _this._handleLayerListWidget(layerListEnabled, view, layerListPosition);
                            var layerListViewModel = _this.layerList
                                ? _this.layerList.viewModel
                                : null;
                            var onboardingPanelEnabled = null;
                            if (localStorage.getItem("firstTimeUseApp")) {
                                onboardingPanelEnabled = false;
                            }
                            else {
                                localStorage.setItem("firstTimeUseApp", "" + Date.now());
                                onboardingPanelEnabled = true;
                            }
                            var interactiveLegend = new InteractiveLegend({
                                view: view,
                                mutedShade: defaultShade,
                                style: defaultStyle,
                                filterMode: defaultMode,
                                layerListViewModel: layerListViewModel,
                                onboardingPanelEnabled: onboardingPanelEnabled,
                                opacity: muteOpacity,
                                grayScale: muteGrayScale
                            });
                            var offScreenInteractiveLegend = new InteractiveLegend({
                                view: view,
                                container: document.querySelector(".offscreen-interactive-legend-container"),
                                mutedShade: defaultShade,
                                style: defaultStyle,
                                filterMode: defaultMode,
                                layerListViewModel: layerListViewModel,
                                offscreen: true
                            });
                            offScreenInteractiveLegend.style.selectedStyleData =
                                interactiveLegend.style.selectedStyleData;
                            _this._handleSearchWidget(searchEnabled, interactiveLegend, view, searchConfig, searchPosition, searchOpenAtStart);
                            var interactiveLegendGroup = interactiveLegendPosition.indexOf("left") !== -1
                                ? "left"
                                : "right";
                            _this.interactiveLegendExpand = new Expand({
                                view: view,
                                group: interactiveLegendGroup,
                                content: interactiveLegend,
                                mode: "floating",
                                expanded: true,
                                expandTooltip: interactiveLegend.label
                            });
                            watchUtils.whenOnce(_this.interactiveLegendExpand, "container", function () {
                                if (_this.interactiveLegendExpand.container) {
                                    var container_1 = _this.interactiveLegendExpand
                                        .container;
                                    container_1.classList.add("expand-content-z-index");
                                }
                            });
                            view.ui.add(_this.interactiveLegendExpand, interactiveLegendPosition);
                            if (infoPanelEnabled) {
                                var screenshotTitle = i18nInteractiveLegend.onboardingPanelScreenshotTitle;
                                var onboardingPanelScreenshotStepOne = i18nInteractiveLegend.onboardingPanelScreenshotStepOne, onboardingPanelScreenshotStepTwo = i18nInteractiveLegend.onboardingPanelScreenshotStepTwo, onboardingPanelScreenshotStepThree = i18nInteractiveLegend.onboardingPanelScreenshotStepThree, onboardingPanelScreenshotStepFour = i18nInteractiveLegend.onboardingPanelScreenshotStepFour, onboardingPanelScreenshotStepFive = i18nInteractiveLegend.onboardingPanelScreenshotStepFive, newInteractiveLegend = i18nInteractiveLegend.newInteractiveLegend, firstOnboardingWelcomeMessage = i18nInteractiveLegend.firstOnboardingWelcomeMessage, secondOnboardingWelcomeMessage = i18nInteractiveLegend.secondOnboardingWelcomeMessage, thirdOnboardingWelcomeMessage = i18nInteractiveLegend.thirdOnboardingWelcomeMessage;
                                var screenshotSteps = [
                                    onboardingPanelScreenshotStepOne,
                                    onboardingPanelScreenshotStepTwo,
                                    onboardingPanelScreenshotStepThree,
                                    onboardingPanelScreenshotStepFour,
                                    onboardingPanelScreenshotStepFive
                                ];
                                var infoContent = screenshotEnabled
                                    ? [
                                        {
                                            type: "list",
                                            title: screenshotTitle,
                                            infoContentItems: screenshotSteps
                                        },
                                        {
                                            type: "explanation",
                                            title: newInteractiveLegend,
                                            infoContentItems: [
                                                firstOnboardingWelcomeMessage,
                                                secondOnboardingWelcomeMessage,
                                                thirdOnboardingWelcomeMessage
                                            ]
                                        }
                                    ]
                                    : [
                                        {
                                            type: "explanation",
                                            title: newInteractiveLegend,
                                            infoContentItems: [
                                                firstOnboardingWelcomeMessage,
                                                secondOnboardingWelcomeMessage,
                                                thirdOnboardingWelcomeMessage
                                            ]
                                        }
                                    ];
                                var infoWidget = new Info({
                                    view: view,
                                    infoContent: infoContent
                                });
                                var infoGroup = infoPanelPosition.indexOf("left") !== -1 ? "left" : "right";
                                _this.infoExpand = new Expand({
                                    view: view,
                                    group: infoGroup,
                                    content: infoWidget,
                                    mode: "floating",
                                    expandTooltip: infoWidget.label
                                });
                                infoWidget.expandWidget = _this.infoExpand;
                                watchUtils.whenOnce(_this.infoExpand, "container", function () {
                                    if (_this.infoExpand.container) {
                                        var container_2 = _this.infoExpand.container;
                                        container_2.classList.add("expand-content-z-index");
                                    }
                                });
                                view.ui.add(_this.infoExpand, infoPanelPosition);
                            }
                            _this._handleScreenshotWidget(screenshotEnabled, legendIncludedInScreenshot, popupIncludedInScreenshot, view, screenshotPosition);
                            itemUtils_1.goToMarker(marker, view);
                            _this._handleHeader(config);
                            if (config.customCSS) {
                                _this._handleCustomCSS(config);
                            }
                            document.body.classList.remove(CSS.loading);
                        });
                    });
                });
            });
        };
        // _handleHomeWidget
        InteractiveLegendApp.prototype._handleHomeWidget = function (view, homeEnabled, homePosition) {
            if (homeEnabled) {
                var home = new Home({
                    view: view
                });
                view.ui.add(home, homePosition);
            }
        };
        // _handleHeader
        InteractiveLegendApp.prototype._handleHeader = function (config) {
            var container = document.createElement("div");
            var header = new Header({
                container: container,
                config: config
            });
            var parentContainer = document.querySelector(".parent-container");
            var headerContainer = header.container;
            parentContainer.insertBefore(headerContainer, parentContainer.firstChild);
            var parentContainerHeight = parentContainer.offsetHeight;
            var headerContainerHeight = headerContainer.offsetHeight;
            var hcProportion = headerContainerHeight * 100;
            var hcHeightPercentage = parseFloat((hcProportion / parentContainerHeight).toFixed(4));
            var viewParentContainerPercentage = 100 - hcHeightPercentage;
            document.getElementById("view-parent-container").style.height = viewParentContainerPercentage + "%";
        };
        // _handleSplash
        InteractiveLegendApp.prototype._handleSplash = function (config, view, splashButtonPosition) {
            if (config.splash) {
                var splash = new Splash.default({
                    config: config,
                    container: document.createElement("div")
                });
                document.body.appendChild(splash.container);
                view.ui.add(splash.createToolbarButton(), splashButtonPosition);
                splash.showSplash();
            }
        };
        // _handleCustomCSS
        InteractiveLegendApp.prototype._handleCustomCSS = function (config) {
            var styles = document.createElement("style");
            styles.type = "text/css";
            styles.appendChild(document.createTextNode(config.customCSS));
            document.head.appendChild(styles);
        };
        // _handleScreenshotWidget
        InteractiveLegendApp.prototype._handleScreenshotWidget = function (screenshotEnabled, legendIncludedInScreenshot, popupIncludedInScreenshot, view, screenshotPosition) {
            var _this = this;
            if (screenshotEnabled) {
                var mapComponentSelectors = ["." + CSS.legend, "." + CSS.popup];
                this.screenshot = new Screenshot({
                    view: view,
                    mapComponentSelectors: mapComponentSelectors,
                    legendIncludedInScreenshot: legendIncludedInScreenshot,
                    popupIncludedInScreenshot: popupIncludedInScreenshot
                });
                var screenshotGroup = screenshotPosition.indexOf("left") !== -1 ? "left" : "right";
                var screenshotExpand = new Expand({
                    view: view,
                    group: screenshotGroup,
                    content: this.screenshot,
                    mode: "floating",
                    expandTooltip: this.screenshot.label
                });
                this.screenshot.expandWidget = screenshotExpand;
                watchUtils.watch(view, "popup.visible", function () {
                    if (view.popup.visible) {
                        if (!_this.featureWidget) {
                            _this.featureWidget = new FeatureWidget({
                                graphic: view.popup.selectedFeature,
                                container: document.querySelector(".offscreen-pop-up-container")
                            });
                            _this.screenshot.featureWidget = _this.featureWidget;
                        }
                        else {
                            _this.featureWidget.graphic = view.popup.selectedFeature;
                        }
                    }
                });
                watchUtils.watch(this.screenshot.viewModel, "screenshotModeIsActive", function () {
                    view.popup.visible = false;
                });
                watchUtils.watch(view, "popup.visible", function () {
                    if (!view.popup.visible &&
                        _this.screenshot.viewModel.screenshotModeIsActive &&
                        popupIncludedInScreenshot &&
                        view.popup.selectedFeature) {
                        var layerView = view.layerViews.find(function (layerView) {
                            return layerView.layer.id === view.popup.selectedFeature.layer.id;
                        });
                        _this.highlightedFeature = layerView.highlight(view.popup.selectedFeature);
                    }
                });
                watchUtils.watch(this.screenshot, "viewModel.screenshotModeIsActive", function () {
                    if (!_this.screenshot.viewModel.screenshotModeIsActive) {
                        if (_this.featureWidget) {
                            _this.featureWidget.graphic = null;
                        }
                        if (_this.highlightedFeature) {
                            _this.highlightedFeature.remove();
                            _this.highlightedFeature = null;
                        }
                    }
                });
                view.ui.add(screenshotExpand, screenshotPosition);
            }
        };
        // _handleLayerListWidget
        InteractiveLegendApp.prototype._handleLayerListWidget = function (layerListEnabled, view, layerListPosition) {
            var _this = this;
            if (layerListEnabled) {
                var layerListContent = this.layerList ? this.layerList : null;
                var layerListGroup = layerListPosition.indexOf("left") !== -1 ? "left" : "right";
                this.layerListExpand = new Expand({
                    view: view,
                    content: layerListContent,
                    mode: "floating",
                    expandIconClass: "esri-icon-layer-list",
                    expandTooltip: this.layerList.label,
                    group: layerListGroup
                });
                watchUtils.whenOnce(this.layerListExpand, "container", function () {
                    if (_this.layerListExpand.container) {
                        var container = _this.layerListExpand.container;
                        container.classList.add("expand-content-z-index");
                    }
                });
                view.ui.add(this.layerListExpand, layerListPosition);
            }
        };
        // _handleBasemapToggleWidget
        InteractiveLegendApp.prototype._handleBasemapToggleWidget = function (basemapToggleEnabled, view, nextBasemap, basemapTogglePosition) {
            var nextBaseMapVal = nextBasemap ? nextBasemap : "topo";
            if (basemapToggleEnabled) {
                var basemapToggle_1 = new BasemapToggle({
                    view: view,
                    nextBasemap: nextBaseMapVal
                });
                watchUtils.whenOnce(basemapToggle_1, "container", function () {
                    if (basemapToggle_1.container) {
                        var container = basemapToggle_1.container;
                        container.classList.add("expand-content-z-index");
                    }
                });
                view.ui.add(basemapToggle_1, basemapTogglePosition);
            }
        };
        // _handleSearchWidget
        InteractiveLegendApp.prototype._handleSearchWidget = function (searchEnabled, interactiveLegend, view, searchConfig, searchPosition, searchOpenAtStart) {
            var _this = this;
            // Get any configured search settings
            if (searchEnabled) {
                var searchProperties = {
                    view: view,
                    container: document.createElement("div")
                };
                if (searchConfig) {
                    if (searchConfig.sources) {
                        var sources = searchConfig.sources;
                        searchProperties.sources = sources.filter(function (source) {
                            if (source.flayerId && source.url) {
                                var layer = view.map.findLayerById(source.flayerId);
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
                    if (searchProperties.sources &&
                        searchProperties.sources.length &&
                        searchProperties.sources.length > 0) {
                        searchProperties.includeDefaultSources = false;
                    }
                    searchProperties.searchAllEnabled = searchConfig.enableSearchingAll
                        ? true
                        : false;
                    if (searchConfig.activeSourceIndex &&
                        searchProperties.sources &&
                        searchProperties.sources.length >= searchConfig.activeSourceIndex) {
                        searchProperties.activeSourceIndex = searchConfig.activeSourceIndex;
                    }
                }
                var search = new Search(searchProperties);
                var searchGroup = searchPosition.indexOf("left") !== -1 ? "left" : "right";
                this.searchExpand = new Expand({
                    view: view,
                    content: search,
                    mode: "floating",
                    expandTooltip: search.label,
                    group: searchGroup,
                    expanded: searchOpenAtStart
                });
                interactiveLegend.searchViewModel = search.viewModel;
                watchUtils.whenOnce(this.searchExpand, "container", function () {
                    if (_this.searchExpand.container) {
                        var container = _this.searchExpand.container;
                        container.classList.add("expand-content-z-index");
                    }
                });
                view.ui.add(this.searchExpand, searchPosition);
            }
        };
        return InteractiveLegendApp;
    }());
    return InteractiveLegendApp;
});
//# sourceMappingURL=Main.js.map