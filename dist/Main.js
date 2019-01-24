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
define(["require", "exports", "dojo/i18n!./nls/resources", "ApplicationBase/support/itemUtils", "ApplicationBase/support/domHelper", "esri/widgets/Home", "esri/widgets/LayerList", "esri/widgets/Search", "esri/widgets/Search/LayerSearchSource", "esri/widgets/BasemapToggle", "esri/widgets/Expand", "esri/core/watchUtils", "esri/Color", "./Components/Screenshot/Screenshot", "telemetry/telemetry.dojo", "./Components/InteractiveLegend/InteractiveLegend"], function (require, exports, i18nInteractiveLegend, itemUtils_1, domHelper_1, Home, LayerList, Search, LayerSearchSource, BasemapToggle, Expand, watchUtils, Color, Screenshot, Telemetry, InteractiveLegend) {
    "use strict";
    // CSS
    var CSS = {
        loading: "configurable-application--loading",
        legend: ".esri-legend__service",
        popup: ".esri-popup__main-container"
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
            var drawerEnabled = config.drawerEnabled, expandEnabled = config.expandEnabled, highlightShade = config.highlightShade, mutedShade = config.mutedShade, style = config.style, mutedOpacity = config.mutedOpacity, filterMode = config.filterMode, screenshotEnabled = config.screenshotEnabled, legendIncludedInScreenshot = config.legendIncludedInScreenshot, popupIncludedInScreenshot = config.popupIncludedInScreenshot, featureCountEnabled = config.featureCountEnabled, layerListEnabled = config.layerListEnabled, searchEnabled = config.searchEnabled, basemapToggleEnabled = config.basemapToggleEnabled, homeEnabled = config.homeEnabled, nextBasemap = config.nextBasemap;
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
            config.title = !config.title
                ? itemUtils_1.getItemTitle(firstItem)
                : "Interactive Legend";
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
                            var interactiveLegendMapContainer = document.createElement("div");
                            var defaultShade = mutedShade ? mutedShade : new Color("#a9a9a9");
                            var defaultStyle = style ? style : "classic";
                            var defaultMode = filterMode
                                ? filterMode
                                : "definitionExpression";
                            var defaultOpacity = mutedOpacity ? mutedOpacity : 0.5;
                            var mode = drawerEnabled ? "drawer" : "auto";
                            var defaultExpandMode = mode ? mode : null;
                            if (highlightShade) {
                                view.highlightOptions = {
                                    color: new Color(highlightShade)
                                };
                            }
                            else {
                                view.highlightOptions = {
                                    color: new Color("#000000")
                                };
                            }
                            _this._handleHomeWidget(view, homeEnabled);
                            _this._handleScreenshotWidget(screenshotEnabled, legendIncludedInScreenshot, popupIncludedInScreenshot, view);
                            _this._handleBasemapToggleWidget(basemapToggleEnabled, view, nextBasemap);
                            _this.layerList = new LayerList({
                                view: view
                            });
                            _this._handleLayerListWidget(layerListEnabled, view);
                            var layerListViewModel = _this.layerList
                                ? _this.layerList.viewModel
                                : null;
                            var interactiveLegend = new InteractiveLegend({
                                view: view,
                                container: interactiveLegendMapContainer,
                                mutedShade: defaultShade,
                                style: defaultStyle,
                                filterMode: defaultMode,
                                mutedOpacity: defaultOpacity,
                                featureCountEnabled: featureCountEnabled,
                                layerListViewModel: layerListViewModel
                            });
                            _this._handleSearchWidget(searchEnabled, interactiveLegend, view);
                            _this.interactiveLegendExpand = new Expand({
                                content: interactiveLegend,
                                expanded: expandEnabled,
                                mode: defaultExpandMode
                            });
                            view.ui.add(_this.interactiveLegendExpand, "bottom-left");
                            itemUtils_1.goToMarker(marker, view);
                            _this._addTitle(config.title);
                            document.body.classList.remove(CSS.loading);
                        });
                    });
                });
            });
        };
        // _addTitle
        InteractiveLegendApp.prototype._addTitle = function (appTitle) {
            var appTitleNode = document.createElement("h1");
            var titleContainerNode = document.querySelector(".title-container");
            appTitleNode.classList.add("app-title");
            appTitleNode.innerText = appTitle;
            titleContainerNode.appendChild(appTitleNode);
        };
        // _handleHomeWidget
        InteractiveLegendApp.prototype._handleHomeWidget = function (view, homeEnabled) {
            if (homeEnabled) {
                var home = new Home({
                    view: view
                });
                view.ui.add(home, "top-left");
            }
        };
        // _handleScreenshotWidget
        InteractiveLegendApp.prototype._handleScreenshotWidget = function (screenshotEnabled, legendIncludedInScreenshot, popupIncludedInScreenshot, view) {
            var _this = this;
            if (screenshotEnabled) {
                var mapComponentSelectors = legendIncludedInScreenshot && popupIncludedInScreenshot
                    ? [CSS.legend, CSS.popup]
                    : legendIncludedInScreenshot && !popupIncludedInScreenshot
                        ? [CSS.legend]
                        : !legendIncludedInScreenshot && popupIncludedInScreenshot
                            ? [CSS.popup]
                            : null;
                this.screenshot = new Screenshot({
                    view: view,
                    mapComponentSelectors: mapComponentSelectors
                });
                watchUtils.watch(this.screenshot.viewModel, "screenshotModeIsActive", function () {
                    if (_this.screenshot.viewModel.screenshotModeIsActive) {
                        if (!legendIncludedInScreenshot) {
                            _this.interactiveLegendExpand.expanded = false;
                        }
                        if (!popupIncludedInScreenshot && view.popup.visible) {
                            view.popup.dockEnabled = true;
                        }
                        if (_this.layerListExpand) {
                            _this.layerListExpand.expanded = false;
                        }
                        if (_this.searchExpand) {
                            _this.searchExpand.expanded = false;
                        }
                    }
                    else {
                        _this.interactiveLegendExpand.expanded = true;
                        if (view.popup.dockEnabled) {
                            view.popup.dockEnabled = false;
                        }
                        if (_this.layerListExpand) {
                            _this.layerListExpand.expanded = true;
                        }
                        if (_this.searchExpand) {
                            _this.searchExpand.expanded = true;
                        }
                    }
                });
                view.ui.add(this.screenshot, "top-left");
            }
        };
        // _handleLayerListWidget
        InteractiveLegendApp.prototype._handleLayerListWidget = function (layerListEnabled, view) {
            if (layerListEnabled) {
                var layerListContent = this.layerList ? this.layerList : null;
                this.layerListExpand = new Expand({
                    expandIconClass: "esri-icon-layer-list",
                    view: view,
                    content: layerListContent,
                    expanded: true
                });
                view.ui.add(this.layerListExpand, "bottom-right");
            }
        };
        // _handleBasemapToggleWidget
        InteractiveLegendApp.prototype._handleBasemapToggleWidget = function (basemapToggleEnabled, view, nextBasemap) {
            var nextBaseMapVal = nextBasemap ? nextBasemap : "topo";
            if (basemapToggleEnabled) {
                var basemapToggle = new BasemapToggle({
                    view: view,
                    nextBasemap: nextBaseMapVal
                });
                view.ui.add(basemapToggle, "bottom-right");
            }
        };
        // _handleSearchWidget
        InteractiveLegendApp.prototype._handleSearchWidget = function (searchEnabled, interactiveLegend, view) {
            var _this = this;
            if (searchEnabled) {
                var search_1 = new Search({
                    view: view,
                    maxResults: 6,
                    maxSuggestions: 6,
                    suggestionsEnabled: true,
                    includeDefaultSources: false
                });
                this.searchExpand = new Expand({
                    content: search_1,
                    expanded: true
                });
                watchUtils.on(interactiveLegend, "activeLayerInfos", "change", function () {
                    search_1.sources.removeAll();
                    interactiveLegend.activeLayerInfos.forEach(function (activeLayerInfo) {
                        if (activeLayerInfo.layer.type === "map-notes") {
                            _this.search.sources.add(null);
                            return;
                        }
                        var featureLayer = activeLayerInfo.layer;
                        watchUtils.init(featureLayer, "fields", function () {
                            if (featureLayer.fields) {
                                var fields_1 = [];
                                featureLayer.fields.forEach(function (field) {
                                    if (field.name !== "OBJECTID" && field.name !== "GlobalID") {
                                        fields_1.push(field.name);
                                    }
                                });
                                var featureLayerSearchSource = new LayerSearchSource({
                                    layer: featureLayer,
                                    searchFields: fields_1,
                                    exactMatch: false,
                                    name: featureLayer.title,
                                    placeholder: featureLayer.title,
                                    suggestionsEnabled: true
                                });
                                search_1.sources.add(featureLayerSearchSource);
                            }
                        });
                    });
                });
                watchUtils.on(interactiveLegend, "searchExpressions", "change", function () {
                    _this.layerList.operationalItems.forEach(function (operationalItems, operationalItemIndex) {
                        search_1.sources.forEach(function (searchSource) {
                            var layerSearchSource = searchSource;
                            if (!searchSource) {
                                return;
                            }
                            var featureLayer = operationalItems.layer;
                            if (featureLayer.id === layerSearchSource.layer.id) {
                                searchSource.filter = {
                                    where: interactiveLegend.searchExpressions.getItemAt(operationalItemIndex)
                                };
                            }
                        });
                    });
                });
                view.ui.add(this.searchExpand, "top-right");
            }
        };
        return InteractiveLegendApp;
    }());
    return InteractiveLegendApp;
});
//# sourceMappingURL=Main.js.map