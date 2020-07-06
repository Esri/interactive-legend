define(["require", "exports", "tslib", "dojo/i18n!../nls/resources", "esri/core/promiseUtils"], function (require, exports, tslib_1, resources_1, promiseUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addScreenshot = exports.getInfoContent = exports.addInfoPanel = exports.addSearch = exports.addBasemapToggle = exports.addZoom = exports.addLayerList = exports.addHome = void 0;
    resources_1 = tslib_1.__importDefault(resources_1);
    function addHome(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, home, homePosition, Home, node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        home = config.home, homePosition = config.homePosition;
                        return [4 /*yield*/, new Promise(function (resolve_1, reject_1) { require(["esri/widgets/Home"], resolve_1, reject_1); }).then(tslib_1.__importStar)];
                    case 1:
                        Home = _a.sent();
                        node = _findNode("esri-home");
                        //   If home is not enabled and  node exists - remove from UI.
                        if (!home) {
                            if (node) {
                                view.ui.remove(node);
                            }
                            return [2 /*return*/];
                        }
                        if (node && propertyName === "homePosition") {
                            view.ui.move(node, homePosition);
                        }
                        else if (propertyName === "home") {
                            view.ui.add(new Home.default({ view: view }), homePosition);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addHome = addHome;
    function addLayerList(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, layerList, layerListPosition, modules, _a, LayerList, Expand, node, group, layerList_1, layerListExpand;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        layerList = config.layerList, layerListPosition = config.layerListPosition;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([
                                new Promise(function (resolve_2, reject_2) { require(["esri/widgets/LayerList"], resolve_2, reject_2); }).then(tslib_1.__importStar),
                                new Promise(function (resolve_3, reject_3) { require(["esri/widgets/Expand"], resolve_3, reject_3); }).then(tslib_1.__importStar)
                            ])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), LayerList = _a[0], Expand = _a[1];
                        node = view.ui.find("layerListExpand");
                        if (!layerList) {
                            if (node) {
                                view.ui.remove(node);
                            }
                            return [2 /*return*/];
                        }
                        group = layerListPosition.indexOf("left") !== -1
                            ? "left"
                            : layerListPosition.indexOf("right") !== -1
                                ? "right"
                                : null;
                        if (node && propertyName === "layerListPosition") {
                            node.expanded = false;
                            node.group = group;
                            view.ui.move(node, layerListPosition);
                        }
                        else if (propertyName === "layerList") {
                            layerList_1 = new LayerList.default({ view: view });
                            layerListExpand = new Expand.default({
                                view: view,
                                content: layerList_1,
                                id: "layerListExpand",
                                group: group
                            });
                            view.ui.add(layerListExpand, layerListPosition);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addLayerList = addLayerList;
    function addZoom(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, mapZoom, mapZoomPosition, Zoom, node;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        mapZoom = config.mapZoom, mapZoomPosition = config.mapZoomPosition;
                        return [4 /*yield*/, new Promise(function (resolve_4, reject_4) { require(["esri/widgets/Zoom"], resolve_4, reject_4); }).then(tslib_1.__importStar)];
                    case 1:
                        Zoom = _a.sent();
                        node = _findNode("esri-zoom");
                        if (!mapZoom) {
                            if (node) {
                                view.ui.remove(node);
                            }
                            return [2 /*return*/];
                        }
                        if (node && propertyName === "mapZoomPosition") {
                            view.ui.move(node, mapZoomPosition);
                        }
                        else if (propertyName === "mapZoom") {
                            view.ui.add(new Zoom.default({ view: view }), mapZoomPosition);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addZoom = addZoom;
    function addBasemapToggle(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, basemapToggle, basemapTogglePosition, nextBasemap, BasemapToggle, node, basemapToggle_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        basemapToggle = config.basemapToggle, basemapTogglePosition = config.basemapTogglePosition, nextBasemap = config.nextBasemap;
                        return [4 /*yield*/, new Promise(function (resolve_5, reject_5) { require(["esri/widgets/BasemapToggle"], resolve_5, reject_5); }).then(tslib_1.__importStar)];
                    case 1:
                        BasemapToggle = _a.sent();
                        node = _findNode("esri-basemap-toggle");
                        if (!basemapToggle) {
                            if (node) {
                                view.ui.remove(node);
                            }
                            return [2 /*return*/];
                        }
                        if (node && propertyName === "nextBasemap") {
                            basemapToggle_1 = view.ui.find("basemapToggle");
                            basemapToggle_1.nextBasemap = nextBasemap;
                        }
                        else if (node && propertyName === "basemapTogglePosition") {
                            view.ui.move(node, basemapTogglePosition);
                        }
                        else if (propertyName === "basemapToggle") {
                            view.ui.add(new BasemapToggle.default({ view: view, nextBasemap: nextBasemap, id: "basemapToggle" }), basemapTogglePosition);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addBasemapToggle = addBasemapToggle;
    function addSearch(props) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, portal, config, propertyName, search, searchConfiguration, searchOpenAtStart, searchPosition, modules, _a, Search, FeatureLayer, Expand, node, group, sources, content, searchExpand;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, portal = props.portal, config = props.config, propertyName = props.propertyName;
                        search = config.search, searchConfiguration = config.searchConfiguration, searchOpenAtStart = config.searchOpenAtStart, searchPosition = config.searchPosition;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([
                                new Promise(function (resolve_6, reject_6) { require(["esri/widgets/Search"], resolve_6, reject_6); }).then(tslib_1.__importStar),
                                new Promise(function (resolve_7, reject_7) { require(["esri/layers/FeatureLayer"], resolve_7, reject_7); }).then(tslib_1.__importStar),
                                new Promise(function (resolve_8, reject_8) { require(["esri/widgets/Expand"], resolve_8, reject_8); }).then(tslib_1.__importStar)
                            ])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), Search = _a[0], FeatureLayer = _a[1], Expand = _a[2];
                        node = view.ui.find("searchExpand");
                        if (!Search || !FeatureLayer || !Expand) {
                            return [2 /*return*/];
                        }
                        if (!search) {
                            if (node) {
                                view.ui.remove(node);
                            }
                            return [2 /*return*/];
                        }
                        group = searchPosition.indexOf("left") !== -1
                            ? "left"
                            : searchPosition.indexOf("right") !== -1
                                ? "right"
                                : null;
                        if (propertyName === "searchPosition" && node) {
                            node.group = group;
                            view.ui.move(node, searchPosition);
                        }
                        else if (propertyName === "searchOpenAtStart" && node) {
                            node.expanded = searchOpenAtStart;
                        }
                        else if (propertyName === "search" ||
                            (propertyName === "searchConfiguration" && node)) {
                            if (node) {
                                view.ui.remove(node);
                            }
                            sources = searchConfiguration === null || searchConfiguration === void 0 ? void 0 : searchConfiguration.sources;
                            if (sources) {
                                sources.forEach(function (source) {
                                    var _a, _b;
                                    if ((_a = source === null || source === void 0 ? void 0 : source.layer) === null || _a === void 0 ? void 0 : _a.url) {
                                        source.layer = new FeatureLayer.default((_b = source === null || source === void 0 ? void 0 : source.layer) === null || _b === void 0 ? void 0 : _b.url);
                                    }
                                });
                            }
                            content = new Search.default(tslib_1.__assign({ view: view,
                                portal: portal }, searchConfiguration));
                            searchExpand = new Expand.default({
                                expanded: searchOpenAtStart,
                                id: "searchExpand",
                                content: content,
                                mode: "floating",
                                group: group,
                                view: view
                            });
                            view.ui.add({
                                component: searchExpand,
                                position: searchPosition
                            });
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addSearch = addSearch;
    function addInfoPanel(props, base) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, infoPanel, infoPanelPosition, screenshot, modules, _a, Info, Expand, node, group, infoContent, infoWidget, infoExpand;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        infoPanel = config.infoPanel, infoPanelPosition = config.infoPanelPosition, screenshot = config.screenshot;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([
                                new Promise(function (resolve_9, reject_9) { require(["../Components/Info/Info"], resolve_9, reject_9); }).then(tslib_1.__importStar),
                                new Promise(function (resolve_10, reject_10) { require(["esri/widgets/Expand"], resolve_10, reject_10); }).then(tslib_1.__importStar)
                            ])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), Info = _a[0], Expand = _a[1];
                        node = view.ui.find("infoExpand");
                        if (!infoPanel) {
                            if (node) {
                                view.ui.remove(node);
                            }
                            return [2 /*return*/];
                        }
                        group = infoPanelPosition.indexOf("left") !== -1
                            ? "left"
                            : infoPanelPosition.indexOf("right") !== -1
                                ? "right"
                                : null;
                        if (!(node && propertyName === "infoPanelPosition")) return [3 /*break*/, 2];
                        node.expanded = false;
                        node.group = group;
                        view.ui.move(node, infoPanelPosition);
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(propertyName === "infoPanel")) return [3 /*break*/, 4];
                        return [4 /*yield*/, getInfoContent(screenshot)];
                    case 3:
                        infoContent = _b.sent();
                        infoWidget = new Info.default({
                            view: view,
                            infoContent: infoContent
                        });
                        infoExpand = new Expand.default({
                            id: "infoExpand",
                            view: view,
                            group: group,
                            content: infoWidget,
                            mode: "floating",
                            expandTooltip: infoWidget.label
                        });
                        infoWidget.expandWidget = infoExpand;
                        // whenOnce(infoExpand, "container", () => {
                        //   if (base.locale === "ar" || base.locale === "he") {
                        //     const questionClass =
                        //       ".esri-collapse__icon.icon-ui-question.icon-ui-flush";
                        //     const questionIconNode = document.querySelector(
                        //       questionClass
                        //     ) as HTMLElement;
                        //     questionIconNode.style.transform = "scaleX(-1)";
                        //   }
                        // });
                        view.ui.add(infoExpand, infoPanelPosition);
                        return [2 /*return*/, infoWidget];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    exports.addInfoPanel = addInfoPanel;
    function _findNode(className) {
        var mainNodes = document.getElementsByClassName(className);
        var node = null;
        for (var j = 0; j < mainNodes.length; j++) {
            node = mainNodes[j];
        }
        return node ? node : null;
    }
    function getInfoContent(screenshotEnabled) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var modules, _a, InfoItem, Collection, screenshotTitle, onboardingPanelScreenshotStepOne, onboardingPanelScreenshotStepTwo, onboardingPanelScreenshotStepThree, onboardingPanelScreenshotStepFour, onboardingPanelScreenshotStepFive, newInteractiveLegend, firstOnboardingWelcomeMessage, secondOnboardingWelcomeMessage, thirdOnboardingWelcomeMessage, screenshotSteps, infoContentItems;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, promiseUtils_1.eachAlways([
                            new Promise(function (resolve_11, reject_11) { require(["../Components/Info/Info/InfoItem"], resolve_11, reject_11); }).then(tslib_1.__importStar),
                            new Promise(function (resolve_12, reject_12) { require(["esri/core/Collection"], resolve_12, reject_12); }).then(tslib_1.__importStar)
                        ])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), InfoItem = _a[0], Collection = _a[1];
                        screenshotTitle = resources_1.default.onboardingPanelScreenshotTitle;
                        onboardingPanelScreenshotStepOne = resources_1.default.onboardingPanelScreenshotStepOne, onboardingPanelScreenshotStepTwo = resources_1.default.onboardingPanelScreenshotStepTwo, onboardingPanelScreenshotStepThree = resources_1.default.onboardingPanelScreenshotStepThree, onboardingPanelScreenshotStepFour = resources_1.default.onboardingPanelScreenshotStepFour, onboardingPanelScreenshotStepFive = resources_1.default.onboardingPanelScreenshotStepFive, newInteractiveLegend = resources_1.default.newInteractiveLegend, firstOnboardingWelcomeMessage = resources_1.default.firstOnboardingWelcomeMessage, secondOnboardingWelcomeMessage = resources_1.default.secondOnboardingWelcomeMessage, thirdOnboardingWelcomeMessage = resources_1.default.thirdOnboardingWelcomeMessage;
                        screenshotSteps = [
                            onboardingPanelScreenshotStepOne,
                            onboardingPanelScreenshotStepTwo,
                            onboardingPanelScreenshotStepThree,
                            onboardingPanelScreenshotStepFour,
                            onboardingPanelScreenshotStepFive
                        ];
                        infoContentItems = [
                            firstOnboardingWelcomeMessage,
                            secondOnboardingWelcomeMessage,
                            thirdOnboardingWelcomeMessage
                        ];
                        return [2 /*return*/, screenshotEnabled
                                ? new Collection.default([
                                    new InfoItem.default({
                                        type: "list",
                                        title: screenshotTitle,
                                        infoContentItems: screenshotSteps
                                    }),
                                    new InfoItem.default({
                                        type: "explanation",
                                        title: newInteractiveLegend,
                                        infoContentItems: infoContentItems
                                    })
                                ])
                                : new Collection.default([
                                    new InfoItem.default({
                                        type: "explanation",
                                        title: newInteractiveLegend,
                                        infoContentItems: infoContentItems
                                    })
                                ])];
                }
            });
        });
    }
    exports.getInfoContent = getInfoContent;
    function addScreenshot(props, layerList, selectedStyleData) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, screenshot, screenshotPosition, enableLegendOption, enablePopupOption, featureCount, modules, _a, Screenshot, Expand, node, screenshotWidget, group, screenshot_1, expand;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        screenshot = config.screenshot, screenshotPosition = config.screenshotPosition, enableLegendOption = config.enableLegendOption, enablePopupOption = config.enablePopupOption, featureCount = config.featureCount;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([
                                new Promise(function (resolve_13, reject_13) { require(["../Components/Screenshot/Screenshot"], resolve_13, reject_13); }).then(tslib_1.__importStar),
                                new Promise(function (resolve_14, reject_14) { require(["esri/widgets/Expand"], resolve_14, reject_14); }).then(tslib_1.__importStar)
                            ])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), Screenshot = _a[0], Expand = _a[1];
                        node = view.ui.find("screenshotExpand");
                        if (!screenshot) {
                            if (node) {
                                screenshotWidget = node === null || node === void 0 ? void 0 : node.content;
                                if (screenshotWidget &&
                                    screenshotWidget.get("viewModel.screenshotModeIsActive")) {
                                    screenshotWidget.set("viewModel.screenshotModeIsActive", false);
                                }
                                view.ui.remove(node);
                            }
                            return [2 /*return*/];
                        }
                        group = screenshotPosition.indexOf("left") !== -1
                            ? "left"
                            : screenshotPosition.indexOf("right") !== -1
                                ? "right"
                                : null;
                        if (propertyName === "screenshot" && screenshot) {
                            screenshot_1 = new Screenshot.default({
                                view: view,
                                enableLegendOption: enableLegendOption,
                                enablePopupOption: enablePopupOption,
                                includeLegendInScreenshot: true,
                                selectedStyleData: selectedStyleData,
                                legendFeatureCountEnabled: featureCount,
                                layerListViewModel: layerList.viewModel
                            });
                            expand = new Expand.default({
                                id: "screenshotExpand",
                                view: view,
                                group: group,
                                content: screenshot_1,
                                mode: "floating"
                            });
                            view.ui.add(expand, screenshotPosition);
                            return [2 /*return*/, screenshot_1];
                        }
                        else if (propertyName === "screenshotPosition") {
                            node.expanded = false;
                            node.group = group;
                            view.ui.move(node, screenshotPosition);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addScreenshot = addScreenshot;
});
//# sourceMappingURL=widgetUtils.js.map