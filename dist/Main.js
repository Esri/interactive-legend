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
define(["require", "exports", "tslib", "dojo/i18n!./nls/resources", "ApplicationBase/support/domHelper", "ApplicationBase/support/itemUtils", "esri/Color", "esri/core/urlUtils", "esri/core/Handles", "esri/core/watchUtils", "esri/widgets/Expand", "esri/widgets/LayerList", "esri/widgets/Search", "./Components/Header/Header", "./Components/InteractiveLegend/InteractiveLegend", "./ConfigurationSettings/ConfigurationSettings", "./utils/widgetUtils", "telemetry/telemetry.dojo", "./Components/Splash/Splash"], function (require, exports, tslib_1, resources_1, domHelper_1, itemUtils_1, Color, urlUtils, Handles, watchUtils_1, Expand, LayerList, Search, Header, InteractiveLegend, ConfigurationSettings, widgetUtils_1, Telemetry, Splash) {
    "use strict";
    resources_1 = tslib_1.__importDefault(resources_1);
    // CSS
    var CSS = {
        loading: "configurable-application--loading",
        legend: "esri-interactive-legend__offscreen",
        popup: "offscreen-pop-up-container"
    };
    var InteractiveLegendApp = /** @class */ (function () {
        function InteractiveLegendApp() {
            this._configurationSettings = null;
            this._intLegendPropKey = "int-legend-prop-key";
            this._propWatcherKey = "prop-watcher-key";
            this.base = null;
            this.handles = new Handles();
            this.header = null;
            this.infoPanel = null;
            this.infoExpand = null;
            this.interactiveLegend = null;
            this.interactiveLegendExpand = null;
            this.layerList = null;
            this.layerListExpand = null;
            this.screenshot = null;
            this.search = null;
            this.searchExpand = null;
            this.splashWidget = null;
            this.splashWidgetButton = null;
            this.telemetry = null;
            this.sharedTheme = null;
        }
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
            var webMapItems = results.webMapItems;
            var validWebMapItems = webMapItems.map(function (response) {
                return response.value;
            });
            var firstItem = validWebMapItems[0];
            if (!firstItem) {
                var error = resources_1.default.error;
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
            var interactiveLegendPosition = config.interactiveLegendPosition, filterMode = config.filterMode, mutedShade = config.mutedShade, muteOpacity = config.muteOpacity, muteGrayScale = config.muteGrayScale, featureCount = config.featureCount, updateExtent = config.updateExtent;
            this._configurationSettings = new ConfigurationSettings(config);
            var portalItem = this.base.results.applicationItem.value;
            var appProxies = portalItem && portalItem.applicationProxies
                ? portalItem.applicationProxies
                : null;
            var viewContainerNode = document.getElementById("viewContainer");
            var defaultViewProperties = itemUtils_1.getConfigViewProperties(config);
            var viewNode = document.createElement("div");
            viewContainerNode.appendChild(viewNode);
            var container = {
                container: viewNode
            };
            var viewProperties = tslib_1.__assign(tslib_1.__assign({}, defaultViewProperties), container);
            itemUtils_1.createMapFromItem({ item: firstItem, appProxies: appProxies }).then(function (map) {
                return itemUtils_1.createView(tslib_1.__assign(tslib_1.__assign({}, viewProperties), { map: map })).then(function (view) {
                    return itemUtils_1.findQuery(find, view).then(function () {
                        view.ui.remove("zoom");
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
                        _this.layerList = new LayerList({
                            view: view
                        });
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
                        var widgetProps = {
                            view: view,
                            config: _this._configurationSettings,
                            portal: _this.base.portal
                        };
                        _this._handleCalciteInit();
                        _this.sharedTheme = _this._createSharedTheme();
                        _this._initPropertyWatchers(widgetProps, view);
                        _this.interactiveLegend = new InteractiveLegend({
                            view: view,
                            mutedShade: defaultShade,
                            style: defaultStyle,
                            filterMode: defaultMode,
                            layerListViewModel: layerListViewModel,
                            onboardingPanelEnabled: onboardingPanelEnabled,
                            opacity: muteOpacity,
                            grayScale: muteGrayScale,
                            faetureCountEnabled: featureCount,
                            updateExtentEnabled: updateExtent
                        });
                        _this._initInteractiveLegendPropWatchers(widgetProps);
                        var group = interactiveLegendPosition.indexOf("left") !== -1
                            ? "left"
                            : interactiveLegendPosition.indexOf("right") !== -1
                                ? "right"
                                : null;
                        _this.interactiveLegendExpand = new Expand({
                            id: "interactiveLegend",
                            view: view,
                            group: group,
                            content: _this.interactiveLegend,
                            mode: "floating",
                            expanded: true,
                            expandTooltip: resources_1.default.expandInteractiveLegend,
                            expandIconClass: "custom-interactive-legend"
                        });
                        watchUtils_1.whenOnce(_this.interactiveLegendExpand, "container", function () {
                            if (_this.interactiveLegendExpand.container) {
                                var container_1 = _this.interactiveLegendExpand
                                    .container;
                                container_1.classList.add("expand-content-z-index");
                            }
                        });
                        view.ui.add(_this.interactiveLegendExpand, interactiveLegendPosition);
                        itemUtils_1.goToMarker(marker, view);
                        document.body.classList.remove(CSS.loading);
                        _this._handleHeader();
                        if (!_this._configurationSettings.withinConfigurationExperience) {
                            _this.handles.remove(_this._intLegendPropKey);
                            _this.handles.remove(_this._propWatcherKey);
                        }
                    });
                });
            });
        };
        InteractiveLegendApp.prototype._handleHeader = function () {
            var container = document.createElement("header");
            container.classList.add("esri-interactive-legend__header-app-container");
            var _a = this._configurationSettings, title = _a.title, customHeaderHTML = _a.customHeaderHTML, customHeader = _a.customHeader, applySharedTheme = _a.applySharedTheme;
            this.header = new Header({
                container: container,
                title: title,
                applySharedTheme: applySharedTheme,
                sharedTheme: this.sharedTheme,
                customHeader: customHeader,
                customHeaderHTML: customHeaderHTML
            });
            var parentContainer = document.querySelector(".parent-container");
            var headerContainer = this.header.container;
            parentContainer.insertBefore(headerContainer, parentContainer.firstChild);
        };
        InteractiveLegendApp.prototype._handleCustomCSS = function () {
            var customCSSStyleSheet = document.getElementById("customCSS");
            if (customCSSStyleSheet) {
                customCSSStyleSheet.remove();
            }
            var styles = document.createElement("style");
            styles.id = "customCSS";
            styles.type = "text/css";
            var styleTextNode = document.createTextNode(this._configurationSettings.customCSS);
            styles.appendChild(styleTextNode);
            document.head.appendChild(styles);
        };
        InteractiveLegendApp.prototype._initInteractiveLegendPropWatchers = function (esriWidgetProps) {
            var _this = this;
            this.handles.add([
                watchUtils_1.init(this._configurationSettings, "filterMode", function (newValue, oldValue, propertyName) {
                    _this.interactiveLegend.filterMode = _this._configurationSettings.filterMode;
                }),
                watchUtils_1.init(this._configurationSettings, "featureCount", function (newValue, oldValue, propertyName) {
                    _this.interactiveLegend.featureCountEnabled = _this._configurationSettings.featureCount;
                }),
                watchUtils_1.init(this._configurationSettings, "updateExtent", function (newValue, oldValue, propertyName) {
                    _this.interactiveLegend.updateExtentEnabled = _this._configurationSettings.updateExtent;
                }),
                watchUtils_1.init(this._configurationSettings, "interactiveLegendPosition", function (newValue, oldValue, propertyName) {
                    var node = esriWidgetProps.view.ui.find("interactiveLegend");
                    if (node) {
                        var group = _this._configurationSettings.interactiveLegendPosition.indexOf("left") !== -1
                            ? "left"
                            : _this._configurationSettings.interactiveLegendPosition.indexOf("right") !== -1
                                ? "right"
                                : null;
                        node.group = group;
                        esriWidgetProps.view.ui.move(node, _this._configurationSettings.interactiveLegendPosition);
                    }
                }),
                watchUtils_1.init(this._configurationSettings, "muteOpacity, muteGrayScale", function (newValue, oldValue, propertyName) {
                    _this.interactiveLegend.grayScale = _this._configurationSettings.muteGrayScale;
                    _this.interactiveLegend.opacity = _this._configurationSettings.muteOpacity;
                }),
                watchUtils_1.init(this._configurationSettings, "screenshot, screenshotPosition", function (newValue, oldValue, propertyName) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var screenshot, screenshotWatcher, screenshotEnabled, infoContent;
                    var _this = this;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                esriWidgetProps.propertyName = propertyName;
                                return [4 /*yield*/, widgetUtils_1.addScreenshot(esriWidgetProps, this.layerList, this.interactiveLegend.style.selectedStyleDataCollection)];
                            case 1:
                                screenshot = _a.sent();
                                if (screenshot) {
                                    this.screenshot = screenshot;
                                    screenshotWatcher = "screenshot-watcher-key";
                                    this.handles.remove(screenshotWatcher);
                                    this.handles.add(watchUtils_1.whenTrue(this.screenshot, "screenshotModeIsActive", function () {
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
                                    }), screenshotWatcher);
                                }
                                if (!this.infoPanel) return [3 /*break*/, 3];
                                screenshotEnabled = this._configurationSettings.screenshot;
                                return [4 /*yield*/, widgetUtils_1.getInfoContent(screenshotEnabled)];
                            case 2:
                                infoContent = _a.sent();
                                this.infoPanel.infoContent = infoContent;
                                this.infoPanel.selectedItemIndex = 0;
                                _a.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                }); }),
                watchUtils_1.init(this._configurationSettings, "enableLegendOption, enablePopupOption", function (newValue, oldValue, propertyName) {
                    esriWidgetProps.propertyName = propertyName;
                    if (_this.screenshot) {
                        _this.screenshot.enableLegendOption = _this._configurationSettings.enableLegendOption;
                        if (!_this._configurationSettings.enableLegendOption) {
                            _this.screenshot.includeLegendInScreenshot = false;
                        }
                        _this.screenshot.enablePopupOption = _this._configurationSettings.enablePopupOption;
                        if (!_this._configurationSettings.enablePopupOption) {
                            _this.screenshot.includePopupInScreenshot = false;
                        }
                    }
                })
            ], this._intLegendPropKey);
        };
        InteractiveLegendApp.prototype._initPropertyWatchers = function (widgetProps, view) {
            var _this = this;
            this.handles.add([
                watchUtils_1.init(this._configurationSettings, "applySharedTheme", function () {
                    if (_this.header) {
                        _this.header.applySharedTheme = _this._configurationSettings.applySharedTheme;
                    }
                }),
                watchUtils_1.init(this._configurationSettings, "home, homePosition", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    widgetUtils_1.addHome(widgetProps);
                }),
                watchUtils_1.init(this._configurationSettings, "mapZoom, mapZoomPosition", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    widgetUtils_1.addZoom(widgetProps);
                }),
                watchUtils_1.init(this._configurationSettings, "basemapToggle, basemapTogglePosition, nextBasemap", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    widgetUtils_1.addBasemapToggle(widgetProps);
                }),
                watchUtils_1.init(this._configurationSettings, "search, searchPosition, searchConfiguration, searchOpenAtStart", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    widgetUtils_1.addSearch(widgetProps);
                }),
                watchUtils_1.init(this._configurationSettings, "layerList, layerListPosition", function (newValue, oldValue, propertyName) {
                    widgetProps.propertyName = propertyName;
                    widgetUtils_1.addLayerList(widgetProps);
                }),
                watchUtils_1.init(this._configurationSettings, "infoPanel, infoPanelPosition", function (newValue, oldValue, propertyName) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var _a;
                    return tslib_1.__generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                widgetProps.propertyName = propertyName;
                                _a = this;
                                return [4 /*yield*/, widgetUtils_1.addInfoPanel(widgetProps, this.base)];
                            case 1:
                                _a.infoPanel = _b.sent();
                                return [2 /*return*/];
                        }
                    });
                }); }),
                watchUtils_1.init(this._configurationSettings, "splash", function (newValue, oldValue, propertyName) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    var view, config, splash, jsModal, node;
                    return tslib_1.__generator(this, function (_a) {
                        view = widgetProps.view, config = widgetProps.config;
                        splash = config.splash;
                        if (splash) {
                            this._createSplashWidget(view);
                            this.splashWidgetButton = this.splashWidget.createToolbarButton();
                            view.ui.add(this.splashWidgetButton, config.splashButtonPosition);
                        }
                        else {
                            jsModal = document.querySelector(".js-modal");
                            if (jsModal) {
                                document.querySelector(".js-modal").remove();
                            }
                            node = view.ui.find("splash");
                            if (node) {
                                view.ui.remove(node);
                            }
                        }
                        return [2 /*return*/];
                    });
                }); }),
                watchUtils_1.init(this._configurationSettings, "splashButtonPosition, splashOnStart, splashTitle, splashContent, splashButtonText", function (newValue, oldValue, propertyName) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        if (this.splashWidget && propertyName === "splashButtonText") {
                            this.splashWidget.splashButtonText = this._configurationSettings.splashButtonText;
                        }
                        else if (this.splashWidget && propertyName === "splashContent") {
                            this.splashWidget.splashContent = this._configurationSettings.splashContent;
                        }
                        else if (this.splashWidget && propertyName === "splashTitle") {
                            this.splashWidget.splashTitle = this._configurationSettings.splashTitle;
                        }
                        else if (this.splashWidget && propertyName === "splashOnStart") {
                            this.splashWidget.splashOnStart = this._configurationSettings.splashOnStart;
                        }
                        else if (this.splashWidget &&
                            propertyName === "splashButtonPosition") {
                            widgetProps.view.ui.move(this.splashWidgetButton, this._configurationSettings.splashButtonPosition);
                        }
                        return [2 /*return*/];
                    });
                }); }),
                watchUtils_1.init(this._configurationSettings, "title", function (newValue, oldValue, propertyName) {
                    if (_this.header) {
                        _this.header.title = _this._configurationSettings.title
                            ? _this._configurationSettings.title
                            : _this.base.config.title;
                    }
                }),
                watchUtils_1.init(this._configurationSettings, "customHeader, customHeaderHTML", function () {
                    if (_this.header) {
                        _this.header.customHeaderHTML = _this._configurationSettings.customHeaderHTML;
                        _this.header.customHeader = _this._configurationSettings.customHeader;
                    }
                }),
                watchUtils_1.init(this._configurationSettings, "customCSS", function (newValue, oldValue, propertyName) {
                    _this._handleCustomCSS();
                }),
                watchUtils_1.init(this._configurationSettings, "customUrlParam, customURLParamName", function (newValue, oldValue, propertyName) {
                    var _a, _b, _c;
                    var customUrlParam = (_b = (_a = _this._configurationSettings.customUrlParam) === null || _a === void 0 ? void 0 : _a.layers) === null || _b === void 0 ? void 0 : _b[0];
                    var fieldName = (_c = customUrlParam === null || customUrlParam === void 0 ? void 0 : customUrlParam.fields) === null || _c === void 0 ? void 0 : _c[0];
                    var customUrlParamName = _this._configurationSettings
                        .customURLParamName;
                    if (!customUrlParam || !customUrlParamName || !fieldName) {
                        return;
                    }
                    var layer = view.map.findLayerById(customUrlParam.id);
                    var layerSearchSource = {
                        layer: layer,
                        searchFields: customUrlParam.fields,
                        outFields: ["*"],
                        exactMatch: true,
                        displayField: fieldName
                    };
                    var href = _this._configurationSettings
                        .withinConfigurationExperience
                        ? document.referrer
                        : document.location.href;
                    var searchResults = urlUtils.urlToObject(href);
                    var searchTerm = null;
                    if (searchResults === null || searchResults === void 0 ? void 0 : searchResults.query) {
                        if (customUrlParamName in searchResults.query) {
                            searchTerm = searchResults.query[customUrlParamName];
                        }
                    }
                    if (layer) {
                        var search = new Search({
                            view: view,
                            resultGraphicEnabled: false,
                            searchAllEnabled: false,
                            includeDefaultSources: false,
                            suggestionsEnabled: false,
                            sources: [layerSearchSource],
                            searchTerm: searchTerm
                        });
                        search.search();
                    }
                })
            ], this._propWatcherKey);
        };
        InteractiveLegendApp.prototype._handleCalciteInit = function () {
            calcite.init();
        };
        InteractiveLegendApp.prototype._createSplashWidget = function (view) {
            this.splashWidget = new Splash({
                view: view,
                splashTitle: this._configurationSettings.splashTitle,
                splashContent: this._configurationSettings.splashContent,
                splashButtonText: this._configurationSettings.splashButtonText,
                splashOnStart: this._configurationSettings.splashOnStart,
                container: document.createElement("div")
            });
            document.body.appendChild(this.splashWidget.container);
        };
        InteractiveLegendApp.prototype._createSharedTheme = function () {
            var _a, _b, _c, _d, _e, _f;
            var portal = (_a = this.base) === null || _a === void 0 ? void 0 : _a.portal;
            var sharedTheme = null;
            if (portal === null || portal === void 0 ? void 0 : portal.portalProperties) {
                var theme = (_b = portal === null || portal === void 0 ? void 0 : portal.portalProperties) === null || _b === void 0 ? void 0 : _b.sharedTheme;
                sharedTheme = {
                    background: (_c = theme === null || theme === void 0 ? void 0 : theme.header) === null || _c === void 0 ? void 0 : _c.background,
                    text: (_d = theme === null || theme === void 0 ? void 0 : theme.header) === null || _d === void 0 ? void 0 : _d.text,
                    logo: (_e = theme === null || theme === void 0 ? void 0 : theme.logo) === null || _e === void 0 ? void 0 : _e.small,
                    logoLink: (_f = theme === null || theme === void 0 ? void 0 : theme.logo) === null || _f === void 0 ? void 0 : _f.link
                };
            }
            return sharedTheme;
        };
        return InteractiveLegendApp;
    }());
    return InteractiveLegendApp;
});
//# sourceMappingURL=Main.js.map