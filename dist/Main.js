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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "dojo/i18n!./nls/resources", "dojo/i18n!./Components/Screenshot/Screenshot/nls/resources", "ApplicationBase/support/itemUtils", "ApplicationBase/support/domHelper", "esri/widgets/Home", "esri/widgets/LayerList", "esri/widgets/Search", "esri/layers/FeatureLayer", "esri/widgets/BasemapToggle", "esri/Basemap", "esri/widgets/Expand", "esri/core/watchUtils", "esri/Color", "./Components/Screenshot/Screenshot", "./Components/Info/Info", "telemetry/telemetry.dojo", "./Components/InteractiveLegend/InteractiveLegend", "./Components/Splash/Splash", "./Components/Header/Header", "./Components/Info/Info/InfoItem", "esri/core/Collection", "esri/core/urlUtils"], function (require, exports, i18nInteractiveLegend, i18nScreenshot, itemUtils_1, domHelper_1, Home, LayerList, Search, FeatureLayer, BasemapToggle, Basemap, Expand, watchUtils, Color, Screenshot, Info, Telemetry, InteractiveLegend, Splash, Header, InfoItem, Collection, urlUtils) {
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
            this.infoExpand = null;
            this.interactiveLegend = null;
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
            var homeEnabled = config.homeEnabled, homePosition = config.homePosition, zoomControlsEnabled = config.zoomControlsEnabled, zoomControlsPosition = config.zoomControlsPosition, searchEnabled = config.searchEnabled, searchConfig = config.searchConfig, searchPosition = config.searchPosition, basemapToggleEnabled = config.basemapToggleEnabled, basemapTogglePosition = config.basemapTogglePosition, nextBasemap = config.nextBasemap, layerListEnabled = config.layerListEnabled, layerListPosition = config.layerListPosition, screenshotEnabled = config.screenshotEnabled, screenshotPosition = config.screenshotPosition, enablePopupOption = config.enablePopupOption, enableLegendOption = config.enableLegendOption, infoPanelEnabled = config.infoPanelEnabled, infoPanelPosition = config.infoPanelPosition, splashButtonPosition = config.splashButtonPosition, interactiveLegendPosition = config.interactiveLegendPosition, filterMode = config.filterMode, mutedShade = config.mutedShade, muteOpacity = config.muteOpacity, muteGrayScale = config.muteGrayScale, searchOpenAtStart = config.searchOpenAtStart, featureCountEnabled = config.featureCountEnabled, updateExtentEnabled = config.updateExtentEnabled;
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
            var portalItem = this.base.results.applicationItem.value;
            var appProxies = portalItem && portalItem.applicationProxies
                ? portalItem.applicationProxies
                : null;
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
                            _this._defineUrlParams(view);
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
                            _this.interactiveLegend = new InteractiveLegend({
                                view: view,
                                mutedShade: defaultShade,
                                container: document.createElement("div"),
                                style: defaultStyle,
                                filterMode: defaultMode,
                                layerListViewModel: layerListViewModel,
                                onboardingPanelEnabled: onboardingPanelEnabled,
                                opacity: muteOpacity,
                                grayScale: muteGrayScale,
                                featureCountEnabled: featureCountEnabled,
                                updateExtentEnabled: updateExtentEnabled
                            });
                            _this._handleSearchWidget(searchEnabled, _this.interactiveLegend, view, searchConfig, searchPosition, searchOpenAtStart);
                            var interactiveLegendGroup = interactiveLegendPosition.indexOf("left") !== -1
                                ? "left"
                                : "right";
                            _this.interactiveLegendExpand = new Expand({
                                view: view,
                                group: interactiveLegendGroup,
                                content: _this.interactiveLegend,
                                mode: "floating",
                                expanded: true,
                                expandTooltip: i18nInteractiveLegend.expandInteractiveLegend,
                                expandIconClass: "custom-interactive-legend"
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
                                    if (base.locale === "ar") {
                                        var questionMarkIcon = document.querySelector(".esri-collapse__icon.icon-ui-question.icon-ui-flush");
                                        questionMarkIcon.style.transform = "scaleX(-1)";
                                    }
                                });
                                view.ui.add(_this.infoExpand, infoPanelPosition);
                            }
                            _this._handleScreenshotWidget(screenshotEnabled, enableLegendOption, enablePopupOption, view, screenshotPosition, featureCountEnabled);
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
                calcite.init();
                var splash = new Splash.default({
                    view: view,
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
        InteractiveLegendApp.prototype._handleScreenshotWidget = function (screenshotEnabled, enableLegendOption, enablePopupOption, view, screenshotPosition, featureCountEnabled) {
            var _this = this;
            if (screenshotEnabled) {
                this.screenshot = new Screenshot({
                    view: view,
                    enableLegendOption: enableLegendOption,
                    enablePopupOption: enablePopupOption,
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
                var screenshotExpand = new Expand({
                    view: view,
                    content: this.screenshot,
                    expandTooltip: i18nScreenshot.takeAScreenshot,
                    mode: "floating"
                });
                watchUtils.whenFalse(screenshotExpand, "expanded", function () {
                    if (_this.screenshot.screenshotModeIsActive) {
                        _this.screenshot.screenshotModeIsActive = false;
                    }
                });
                var screenshotGroup = screenshotPosition.indexOf("left") !== -1 ? "left" : "right";
                screenshotExpand.group = screenshotGroup;
                view.ui.add(screenshotExpand, screenshotPosition);
                watchUtils.whenTrue(this.screenshot, "screenshotModeIsActive", function () {
                    if (_this.interactiveLegendExpand &&
                        _this.interactiveLegendExpand.expanded) {
                        _this.interactiveLegendExpand.expanded = false;
                    }
                    if (_this.infoExpand && _this.infoExpand.expanded) {
                        _this.infoExpand.expanded = false;
                    }
                    if (_this.searchExpand && _this.searchExpand.expanded) {
                        _this.searchExpand.expanded = false;
                    }
                    if (_this.layerListExpand && _this.layerListExpand.expanded) {
                        _this.layerListExpand.expanded = false;
                    }
                });
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
            return __awaiter(this, void 0, void 0, function () {
                var basemap, basemapToggle_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!basemapToggleEnabled) return [3 /*break*/, 3];
                            basemap = void 0;
                            basemap = Basemap.fromId(nextBasemap);
                            if (!!basemap) return [3 /*break*/, 2];
                            return [4 /*yield*/, new Basemap({
                                    portalItem: {
                                        id: nextBasemap
                                    }
                                }).loadAll()];
                        case 1:
                            basemap = _a.sent();
                            _a.label = 2;
                        case 2:
                            if (!basemap) {
                                basemap = "topo";
                            }
                            basemapToggle_1 = new BasemapToggle({
                                view: view,
                                nextBasemap: basemap
                            });
                            watchUtils.whenOnce(basemapToggle_1, "container", function () {
                                if (basemapToggle_1.container) {
                                    var container = basemapToggle_1.container;
                                    container.classList.add("expand-content-z-index");
                                }
                            });
                            view.ui.add(basemapToggle_1, basemapTogglePosition);
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
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
        // _defineUrlParams
        InteractiveLegendApp.prototype._defineUrlParams = function (view) {
            if (this.base.config.customUrlLayer.id &&
                this.base.config.customUrlLayer.fields.length > 0 &&
                this.base.config.customUrlParam) {
                if (!Search && urlUtils) {
                    return;
                }
                var searchResults = urlUtils.urlToObject(document.location.href);
                var searchTerm = null;
                if (searchResults && searchResults.query) {
                    if (this.base.config.customUrlParam in searchResults.query) {
                        searchTerm = searchResults.query[this.base.config.customUrlParam];
                    }
                }
                var featureLayer = view.map.findLayerById(this.base.config.customUrlLayer.id);
                var layerSearchSource = {
                    layer: featureLayer,
                    searchFields: this.base.config.customUrlLayer.fields[0].fields,
                    outFields: ["*"],
                    exactMatch: true
                };
                if (featureLayer && searchTerm) {
                    var search = new Search({
                        view: view,
                        resultGraphicEnabled: false,
                        searchAllEnabled: false,
                        includeDefaultSources: false,
                        suggestionsEnabled: false,
                        searchTerm: searchTerm,
                        sources: [layerSearchSource]
                    });
                    search.search();
                }
            }
        };
        return InteractiveLegendApp;
    }());
    return InteractiveLegendApp;
});
//# sourceMappingURL=Main.js.map