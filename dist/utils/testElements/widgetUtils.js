var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
define(["require", "exports", "dojo/i18n!../nls/resources", "esri/core/promiseUtils", "esri/core/watchUtils"], function (require, exports, i18nInteractiveLegend, promiseUtils_1, watchUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function addHome(props) {
        return __awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, homeEnabled, homePosition, Home, node;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        homeEnabled = config.homeEnabled, homePosition = config.homePosition;
                        return [4 /*yield*/, new Promise(function (resolve_1, reject_1) { require(["esri/widgets/Home"], resolve_1, reject_1); })];
                    case 1:
                        Home = _a.sent();
                        node = _findNode("esri-home");
                        //   If home is not enabled and  node exists - remove from UI.
                        if (!homeEnabled) {
                            if (node)
                                view.ui.remove(node);
                            return [2 /*return*/];
                        }
                        if (node && propertyName === "homePosition") {
                            view.ui.move(node, homePosition);
                        }
                        else if (propertyName === "homeEnabled") {
                            view.ui.add(new Home({ view: view }), homePosition);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addHome = addHome;
    function addLayerList(props) {
        return __awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, layerListEnabled, layerListPosition, modules, _a, LayerList, Expand, node, layerList, layerListExpand;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        layerListEnabled = config.layerListEnabled, layerListPosition = config.layerListPosition;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([
                                new Promise(function (resolve_2, reject_2) { require(["esri/widgets/LayerList"], resolve_2, reject_2); }),
                                new Promise(function (resolve_3, reject_3) { require(["esri/widgets/Expand"], resolve_3, reject_3); })
                            ])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), LayerList = _a[0], Expand = _a[1];
                        node = view.ui.find("layerListExpand");
                        if (!layerListEnabled) {
                            if (node)
                                view.ui.remove(node);
                            return [2 /*return*/];
                        }
                        if (node && propertyName === "layerListPosition") {
                            view.ui.move(node, layerListPosition);
                        }
                        else if (propertyName === "layerListEnabled") {
                            layerList = new LayerList({ view: view });
                            layerListExpand = new Expand({
                                view: view,
                                content: layerList,
                                id: "layerListExpand"
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
        return __awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, zoomControlsEnabled, zoomControlsPosition, Zoom, node;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        zoomControlsEnabled = config.zoomControlsEnabled, zoomControlsPosition = config.zoomControlsPosition;
                        return [4 /*yield*/, new Promise(function (resolve_4, reject_4) { require(["esri/widgets/Zoom"], resolve_4, reject_4); })];
                    case 1:
                        Zoom = _a.sent();
                        node = _findNode("esri-zoom");
                        if (!zoomControlsEnabled) {
                            if (node)
                                view.ui.remove(node);
                            return [2 /*return*/];
                        }
                        if (node && propertyName === "zoomControlsPosition") {
                            view.ui.move(node, zoomControlsPosition);
                        }
                        else if (propertyName === "zoomControlsEnabled") {
                            view.ui.add(new Zoom({ view: view }), zoomControlsPosition);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addZoom = addZoom;
    function addBasemapToggle(props) {
        return __awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, basemapToggleEnabled, basemapTogglePosition, nextBasemap, BasemapToggle, node, basemapToggle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        basemapToggleEnabled = config.basemapToggleEnabled, basemapTogglePosition = config.basemapTogglePosition, nextBasemap = config.nextBasemap;
                        return [4 /*yield*/, new Promise(function (resolve_5, reject_5) { require(["esri/widgets/BasemapToggle"], resolve_5, reject_5); })];
                    case 1:
                        BasemapToggle = _a.sent();
                        node = _findNode("esri-basemap-toggle");
                        if (!basemapToggleEnabled) {
                            if (node)
                                view.ui.remove(node);
                            return [2 /*return*/];
                        }
                        if (node && propertyName === "nextBasemap") {
                            basemapToggle = view.ui.find("basemapToggle");
                            basemapToggle.nextBasemap = nextBasemap;
                        }
                        else if (node && propertyName === "basemapTogglePosition") {
                            view.ui.move(node, basemapTogglePosition);
                        }
                        else if (propertyName === "basemapToggleEnabled") {
                            view.ui.add(new BasemapToggle({ view: view, nextBasemap: nextBasemap, id: "basemapToggle" }), basemapTogglePosition);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.addBasemapToggle = addBasemapToggle;
    function addSearch(props) {
        return __awaiter(this, void 0, void 0, function () {
            var view, portal, config, propertyName, searchEnabled, searchConfig, searchOpenAtStart, searchPosition, modules, _a, Search, FeatureLayer, Expand, node, search, parsedSearchConfig, sources, content, searchExpand;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, portal = props.portal, config = props.config, propertyName = props.propertyName;
                        searchEnabled = config.searchEnabled, searchConfig = config.searchConfig, searchOpenAtStart = config.searchOpenAtStart, searchPosition = config.searchPosition;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([
                                new Promise(function (resolve_6, reject_6) { require(["esri/widgets/Search"], resolve_6, reject_6); }),
                                new Promise(function (resolve_7, reject_7) { require(["esri/layers/FeatureLayer"], resolve_7, reject_7); }),
                                new Promise(function (resolve_8, reject_8) { require(["esri/widgets/Expand"], resolve_8, reject_8); })
                            ])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), Search = _a[0], FeatureLayer = _a[1], Expand = _a[2];
                        node = view.ui.find("searchExpand");
                        if (!Search || !FeatureLayer || !Expand)
                            return [2 /*return*/];
                        if (!searchEnabled) {
                            if (node)
                                view.ui.remove(node);
                            return [2 /*return*/];
                        }
                        if (propertyName === "searchPosition" && node) {
                            search = view.ui.find("searchExpand");
                            view.ui.move(search, searchPosition);
                        }
                        else if (propertyName === "searchOpenAtStart" && node) {
                            node.expanded = searchOpenAtStart;
                        }
                        else if (propertyName === "searchEnabled" ||
                            (propertyName === "searchConfig" && node)) {
                            parsedSearchConfig = searchConfig ? JSON.parse(searchConfig) : null;
                            if (node)
                                view.ui.remove(node);
                            sources = parsedSearchConfig === null || parsedSearchConfig === void 0 ? void 0 : parsedSearchConfig.sources;
                            if (sources) {
                                sources.forEach(function (source) {
                                    var _a, _b;
                                    if ((_a = source === null || source === void 0 ? void 0 : source.layer) === null || _a === void 0 ? void 0 : _a.url) {
                                        source.layer = new FeatureLayer((_b = source === null || source === void 0 ? void 0 : source.layer) === null || _b === void 0 ? void 0 : _b.url);
                                    }
                                });
                            }
                            content = new Search(__assign({ view: view,
                                portal: portal, includeDefaultSources: false }, parsedSearchConfig));
                            searchExpand = new Expand({
                                expanded: searchOpenAtStart,
                                id: "searchExpand",
                                content: content,
                                mode: "floating",
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
        return __awaiter(this, void 0, void 0, function () {
            var view, config, propertyName, infoPanelEnabled, infoPanelPosition, screenshotEnabled, modules, _a, Info, Expand, node, infoContent, infoWidget, infoGroup, infoExpand;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        view = props.view, config = props.config, propertyName = props.propertyName;
                        infoPanelEnabled = config.infoPanelEnabled, infoPanelPosition = config.infoPanelPosition, screenshotEnabled = config.screenshotEnabled;
                        return [4 /*yield*/, promiseUtils_1.eachAlways([
                                new Promise(function (resolve_9, reject_9) { require(["../Components/Info/Info"], resolve_9, reject_9); }),
                                new Promise(function (resolve_10, reject_10) { require(["esri/widgets/Expand"], resolve_10, reject_10); })
                            ])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), Info = _a[0], Expand = _a[1];
                        node = view.ui.find("infoExpand");
                        if (!infoPanelEnabled) {
                            if (node)
                                view.ui.remove(node);
                            return [2 /*return*/];
                        }
                        if (!(node && propertyName === "infoPanelPosition")) return [3 /*break*/, 2];
                        view.ui.move(node, infoPanelPosition);
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(propertyName === "infoPanelEnabled")) return [3 /*break*/, 4];
                        return [4 /*yield*/, _getInfoContent(screenshotEnabled)];
                    case 3:
                        infoContent = _b.sent();
                        infoWidget = new Info({
                            view: view,
                            infoContent: infoContent
                        });
                        infoGroup = infoPanelPosition.indexOf("left") !== -1 ? "left" : "right";
                        infoExpand = new Expand({
                            id: "infoExpand",
                            view: view,
                            group: infoGroup,
                            content: infoWidget,
                            mode: "floating",
                            expandTooltip: infoWidget.label
                        });
                        infoWidget.expandWidget = infoExpand;
                        watchUtils_1.whenOnce(infoExpand, "container", function () {
                            if (base.locale === "ar" || base.locale === "he") {
                                var questionClass = ".esri-collapse__icon.icon-ui-question.icon-ui-flush";
                                var questionIconNode = document.querySelector(questionClass);
                                questionIconNode.style.transform = "scaleX(-1)";
                            }
                        });
                        view.ui.add(infoExpand, infoPanelPosition);
                        _b.label = 4;
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
    function _getInfoContent(screenshotEnabled) {
        return __awaiter(this, void 0, void 0, function () {
            var modules, _a, InfoItem, Collection, screenshotTitle, onboardingPanelScreenshotStepOne, onboardingPanelScreenshotStepTwo, onboardingPanelScreenshotStepThree, onboardingPanelScreenshotStepFour, onboardingPanelScreenshotStepFive, newInteractiveLegend, firstOnboardingWelcomeMessage, secondOnboardingWelcomeMessage, thirdOnboardingWelcomeMessage, screenshotSteps, infoContentItems;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, promiseUtils_1.eachAlways([
                            new Promise(function (resolve_11, reject_11) { require(["../Components/Info/Info/InfoItem"], resolve_11, reject_11); }),
                            new Promise(function (resolve_12, reject_12) { require(["esri/core/Collection"], resolve_12, reject_12); })
                        ])];
                    case 1:
                        modules = _b.sent();
                        _a = modules.map(function (module) { return module.value; }), InfoItem = _a[0], Collection = _a[1];
                        screenshotTitle = i18nInteractiveLegend.onboardingPanelScreenshotTitle;
                        onboardingPanelScreenshotStepOne = i18nInteractiveLegend.onboardingPanelScreenshotStepOne, onboardingPanelScreenshotStepTwo = i18nInteractiveLegend.onboardingPanelScreenshotStepTwo, onboardingPanelScreenshotStepThree = i18nInteractiveLegend.onboardingPanelScreenshotStepThree, onboardingPanelScreenshotStepFour = i18nInteractiveLegend.onboardingPanelScreenshotStepFour, onboardingPanelScreenshotStepFive = i18nInteractiveLegend.onboardingPanelScreenshotStepFive, newInteractiveLegend = i18nInteractiveLegend.newInteractiveLegend, firstOnboardingWelcomeMessage = i18nInteractiveLegend.firstOnboardingWelcomeMessage, secondOnboardingWelcomeMessage = i18nInteractiveLegend.secondOnboardingWelcomeMessage, thirdOnboardingWelcomeMessage = i18nInteractiveLegend.thirdOnboardingWelcomeMessage;
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
                                ? new Collection([
                                    new InfoItem({
                                        type: "list",
                                        title: screenshotTitle,
                                        infoContentItems: screenshotSteps
                                    }),
                                    new InfoItem({
                                        type: "explanation",
                                        title: newInteractiveLegend,
                                        infoContentItems: infoContentItems
                                    })
                                ])
                                : new Collection([
                                    new InfoItem({
                                        type: "explanation",
                                        title: newInteractiveLegend,
                                        infoContentItems: infoContentItems
                                    })
                                ])];
                }
            });
        });
    }
});
//# sourceMappingURL=widgetUtils.js.map