define(["require", "exports", "tslib", "dojox/gfx", "dojox/gfx/matrix", "esri/Color", "dojox/gfx/_base", "./Create2DColorRamp", "./Ramp"], function (require, exports, tslib_1, gfx_1, gfxMatrix, Color, gfxBase, Create2DColorRamp, Ramp) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fourClasses = exports.threeClasses = exports.twoClasses = exports.getRotationAngleForFocus = exports.getRelationshipRampElement = exports.getFill = exports.renderRamp = void 0;
    var svgNS = "http://www.w3.org/2000/svg";
    var arrowFill = "#555555";
    var focusToRotationAngleMap = {
        HH: 315,
        HL: 45,
        LL: 135,
        LH: 225
    };
    var DPI = 96;
    var PICTURE_FILL_SYMBOL = "picture-fill";
    var SIMPLE_FILL_SYMBOL = "simple-fill";
    var SIMPLE_LINE_SYMBOL = "simple-line";
    var SIMPLE_MARKER_SYMBOL = "simple-marker";
    var FILL_PATTERN_URL_PREFIX = require.toUrl("esri/symbols/patterns/");
    var defaultThematicColor = new Color([128, 128, 128]);
    var TEXT_SYMBOL = "text";
    var relationshipColorClassValues = {
        // Each "class value" representing a relationship class has "two codes".
        // The first code represents the classification of field1.
        // The second code represents the classification of field2.
        // Value of field1 increases from the bottom-most row to the top-most row in
        // the matrix (represented as 2D array) below.
        // Value of field2 increases from the left-most column to the right-most column.
        "2": [["HL", "HH"], ["LL", "LH"]],
        "3": [["HL", "HM", "HH"], ["ML", "MM", "MH"], ["LL", "LM", "LH"]],
        "4": [
            ["HL", "HM1", "HM2", "HH"],
            ["M2L", "M2M1", "M2M2", "M2H"],
            ["M1L", "M1M1", "M1M2", "M1H"],
            ["LL", "LM1", "LM2", "LH"]
        ]
    };
    function getSymbolColor(symbol) {
        if (!symbol) {
            return;
        }
        var type = symbol.type;
        if (type.indexOf("3d") > -1) {
            return getSymbolLayerFill(symbol.symbolLayers.getItemAt(0));
        }
        else {
            if (type === "simple-line") {
                var stroke = getStroke(symbol);
                return stroke && stroke.color;
            }
            else if (symbol.type === "simple-marker") {
                if (symbol.style === "x" || symbol.style === "cross") {
                    var stroke = getStroke(symbol);
                    return stroke && stroke.color;
                }
            }
            return getFill(symbol);
        }
    }
    function getLabels(focus, index) {
        var HH = index["HH"].label;
        var LL = index["LL"].label;
        var HL = index["HL"].label;
        var LH = index["LH"].label;
        switch (focus) {
            case "HH":
                return { top: HH, bottom: LL, left: HL, right: LH };
            case "HL":
                return { top: HL, bottom: LH, left: LL, right: HH };
            case "LL":
                return { top: LL, bottom: HH, left: LH, right: HL };
            case "LH":
                return { top: LH, bottom: HL, left: HH, right: LL };
            default:
                return { top: HH, bottom: LL, left: HL, right: LH };
        }
    }
    function setLineArrow(pathNode, side, focus, id) {
        var markerStart = "marker-start";
        var markerEnd = "marker-end";
        var startId = id + "_arrowStart";
        var endId = id + "_arrowEnd";
        var isLeftSide = side === "left";
        switch (focus) {
            case "HL":
                pathNode.setAttribute(isLeftSide ? markerStart : markerEnd, "url(#" + (isLeftSide ? endId : startId) + ")");
                break;
            case "LL":
                pathNode.setAttribute(markerStart, "url(#" + endId + ")");
                break;
            case "LH":
                pathNode.setAttribute(isLeftSide ? markerEnd : markerStart, "url(#" + (isLeftSide ? startId : endId) + ")");
                break;
            default:
                pathNode.setAttribute(markerEnd, "url(#" + startId + ")");
                break;
        }
    }
    function createArrowMarker(defNode, direction, id) {
        var isStart = direction === "start";
        var nodeId = isStart ? id + "_arrowStart" : id + "_arrowEnd";
        var path = isStart ? "0,0 5,5 0,10" : "5,0 0,5 5,10";
        var refX = isStart ? "5" : "0";
        // <marker>
        var marker = document.createElementNS(svgNS, "marker");
        marker.setAttribute("id", nodeId);
        marker.setAttribute("markerWidth", "10");
        marker.setAttribute("markerHeight", "10");
        marker.setAttribute("refX", refX);
        marker.setAttribute("refY", "5");
        marker.setAttribute("markerUnits", "strokeWidth");
        marker.setAttribute("orient", "auto");
        // <path> within <marker>
        var arrow = document.createElementNS(svgNS, "polyline");
        arrow.setAttribute("points", path);
        arrow.setAttribute("fill", "none");
        arrow.setAttribute("stroke", arrowFill);
        arrow.setAttribute("stroke-width", "1");
        marker.appendChild(arrow);
        defNode.appendChild(marker);
    }
    var _dekebabify = (function () {
        var cache = {};
        return function (text) {
            if (cache[text]) {
                return cache[text];
            }
            var dekebabified = text.replace(/-/g, "");
            cache[text] = dekebabified;
            return dekebabified;
        };
    })();
    function getStroke(symbol) {
        if (!symbol) {
            return null;
        }
        var stroke;
        var width = pt2px(symbol.width);
        switch (symbol.type) {
            case SIMPLE_FILL_SYMBOL:
            case PICTURE_FILL_SYMBOL:
            case SIMPLE_MARKER_SYMBOL:
                stroke = getStroke(symbol.outline);
                break;
            case SIMPLE_LINE_SYMBOL:
                if (symbol.style !== "none" && width !== 0) {
                    stroke = {
                        color: symbol.color,
                        style: _dekebabify(symbol.style),
                        width: width,
                        cap: symbol.cap,
                        join: symbol.join === "miter" ? pt2px(symbol.miterLimit) : symbol.join
                    };
                }
                break;
            default:
                // PictureMarkerSymbol, TextSymbol
                stroke = null;
                break;
        }
        return stroke;
    }
    function pt2px(pt) {
        if (!pt) {
            return 0;
        }
        return (pt / 72) * DPI;
    }
    function getSymbolLayerFill(symbolLayer, brightnessFactor) {
        if (brightnessFactor === void 0) { brightnessFactor = 0; }
        if (!symbolLayer.material || !symbolLayer.material.color) {
            var defaultColor = defaultThematicColor.r, defaultColorLum = adjustBrightness(defaultColor, brightnessFactor);
            return [defaultColorLum, defaultColorLum, defaultColorLum, 100];
        }
        var fillColorArray = symbolLayer.material.color.toRgb();
        for (var j = 0; j < 3; j++) {
            fillColorArray[j] = adjustBrightness(fillColorArray[j], brightnessFactor);
        }
        fillColorArray.push(symbolLayer.material.color.a);
        return fillColorArray;
    }
    function adjustBrightness(colorComponent, factor) {
        var magnitudeFactor = 0.75;
        return Math.min(Math.max(colorComponent + 255 * factor * magnitudeFactor, 0), 255);
    }
    function renderRamp(legendElement, id, view, activeLayerInfos, layerView, filterMode, opacity, grayScale, searchViewModel, layerListViewModel, featureCountEnabled, size) {
        if (size === void 0) { size = 60; }
        var focus = legendElement.focus, numClasses = legendElement.numClasses, colors = legendElement.colors, rotation = legendElement.rotation;
        var isDiamond = !!focus;
        var surfaceSize = Math.sqrt(Math.pow(size, 2) + Math.pow(size, 2)) + (isDiamond ? 0 : 5); // diagonal length + 5px padding for arrows
        var rampDiv = document.createElement("div");
        var surface = gfx_1.createSurface(rampDiv, surfaceSize, surfaceSize);
        var translateX = (surfaceSize - size) / 2;
        var translateY = (surfaceSize - size) / 2;
        var centerX = size / 2;
        var centerY = size / 2;
        var colorRampProperties = {
            surface: surface,
            colors: colors,
            numClasses: numClasses,
            size: size,
            gfxMatrix: gfxMatrix,
            translateX: translateX,
            translateY: translateY,
            centerX: centerX,
            centerY: centerY,
            rotation: rotation,
            focus: focus
        };
        var shape = new Create2DColorRamp({
            view: view,
            activeLayerInfos: activeLayerInfos,
            colorRampProperties: colorRampProperties,
            legendElement: legendElement,
            layerView: layerView,
            surface: surface,
            filterMode: filterMode,
            opacity: opacity,
            grayScale: grayScale,
            searchViewModel: searchViewModel,
            layerListViewModel: layerListViewModel,
            featureCountEnabled: featureCountEnabled
        });
        shape.generateCells();
        var arrowGroup = surface.createGroup();
        var stroke = { width: 1, color: arrowFill };
        var defNode = surface.defNode;
        createArrowMarker(defNode, "start", id);
        createArrowMarker(defNode, "end", id);
        var leftPaddingX = 10;
        var leftPaddingY = 15;
        var leftLineShape = arrowGroup
            .createLine({
            x1: -leftPaddingX,
            y1: size - leftPaddingY,
            x2: -leftPaddingX,
            y2: leftPaddingY
        })
            .setStroke(stroke);
        var rightPaddingX = 15;
        var rightPaddingY = 10;
        var rightLineShape = arrowGroup
            .createLine({
            x1: rightPaddingX,
            y1: size + rightPaddingY,
            x2: size - rightPaddingX,
            y2: size + rightPaddingY
        })
            .setStroke(stroke);
        setLineArrow(leftLineShape.rawNode, "left", focus, id);
        setLineArrow(rightLineShape.rawNode, "right", focus, id);
        arrowGroup.applyTransform(gfxMatrix.translate(translateX, translateY));
        if (isDiamond) {
            arrowGroup.applyTransform(gfxMatrix.rotategAt(-45, centerX, centerY));
        }
        else {
            surface.rawNode.style.margin = "-15px -15px -18px -15px";
        }
        return new Ramp({
            rampDiv: rampDiv,
            shape: shape
        });
    }
    exports.renderRamp = renderRamp;
    function getFill(symbol) {
        var style = symbol.style;
        var fill = null;
        if (symbol) {
            switch (symbol.type) {
                case SIMPLE_MARKER_SYMBOL:
                    if (style !== "cross" && style !== "x") {
                        fill = symbol.color;
                    }
                    break;
                case SIMPLE_FILL_SYMBOL:
                    if (style === "solid") {
                        fill = symbol.color;
                    }
                    else if (style !== "none") {
                        fill = tslib_1.__assign(tslib_1.__assign({}, gfxBase.defaultPattern), { src: FILL_PATTERN_URL_PREFIX + style + ".png", width: 8, height: 8 });
                    }
                    break;
                case PICTURE_FILL_SYMBOL:
                    fill = tslib_1.__assign(tslib_1.__assign({}, gfxBase.defaultPattern), { src: symbol.url, width: pt2px(symbol.width) * symbol.xscale, height: pt2px(symbol.height) * symbol.yscale, x: pt2px(symbol.xoffset), y: pt2px(symbol.yoffset) });
                    break;
                case TEXT_SYMBOL:
                    fill = symbol.color;
                    break;
            }
        }
        return fill;
    }
    exports.getFill = getFill;
    // infos type: UniqueValueInfos
    function getRelationshipRampElement(params) {
        var focus = params.focus, infos = params.infos, numClasses = params.numClasses;
        var classValues = relationshipColorClassValues[numClasses];
        var index = {};
        infos.forEach(function (info) {
            index[info.value] = {
                label: info.label,
                fill: getSymbolColor(info.symbol)
            };
        });
        // generate 2d array of colors
        var colors = [];
        for (var i = 0; i < numClasses; i++) {
            var arr = [];
            for (var j = 0; j < numClasses; j++) {
                var info = index[classValues[i][j]];
                arr.push(info.fill);
            }
            colors.push(arr);
        }
        var labels = getLabels(focus, index);
        return {
            type: "relationship-ramp",
            numClasses: numClasses,
            focus: focus,
            colors: colors,
            labels: labels,
            rotation: getRotationAngleForFocus(focus)
        };
    }
    exports.getRelationshipRampElement = getRelationshipRampElement;
    function getRotationAngleForFocus(focus) {
        var rotation = focusToRotationAngleMap[focus];
        // handle invalid focus
        if (focus && rotation == null) {
            rotation = focusToRotationAngleMap["HH"];
        }
        return rotation || 0;
    }
    exports.getRotationAngleForFocus = getRotationAngleForFocus;
    // _twoClasses
    function twoClasses(index, focus) {
        if (focus === "HH" || focus === null) {
            return index === 0 || index === 2
                ? index + 1
                : index === 1 || index === 3
                    ? index - 1
                    : null;
        }
        else if (focus === "LH") {
            return index === 0
                ? index + 3
                : index === 1
                    ? index + 1
                    : index === 2
                        ? index - 1
                        : index === 3
                            ? index - 3
                            : index === 4
                                ? index + 0
                                : null;
        }
        else if (focus === "LL") {
            return index === 0 || index === 1
                ? index + 2
                : index === 2 || index === 3
                    ? index - 2
                    : null;
        }
    }
    exports.twoClasses = twoClasses;
    // _threeClasses
    function threeClasses(index, focus) {
        if (focus === "HH" || focus === null) {
            return index === 0 || index === 3 || index === 6
                ? index + 2
                : index === 2 || index === 5 || index === 8
                    ? index - 2
                    : index;
        }
        else if (focus === "LH") {
            return index === 0
                ? index + 8
                : index === 1
                    ? index + 6
                    : index === 2
                        ? index + 4
                        : index === 3
                            ? index + 2
                            : index === 5
                                ? index - 2
                                : index === 6
                                    ? index - 4
                                    : index === 7
                                        ? index - 6
                                        : index === 8
                                            ? index - 8
                                            : index;
        }
        else if (focus === "LL") {
            return index === 0 || index === 1 || index === 2
                ? index + 6
                : index === 6 || index === 7 || index === 8
                    ? index - 6
                    : index;
        }
    }
    exports.threeClasses = threeClasses;
    // _fourNumClasses
    function fourClasses(index, focus) {
        if (focus === "HH" || focus === null) {
            return index === 0 || index === 4 || index === 8 || index === 12
                ? index + 3
                : index === 1 || index === 5 || index === 9 || index === 13
                    ? index + 1
                    : index === 2 || index === 6 || index === 10 || index === 14
                        ? index - 1
                        : index === 3 || index === 7 || index === 11 || index === 15
                            ? index - 3
                            : null;
        }
        else if (focus === "LH") {
            return index === 0
                ? index + 15
                : index === 1
                    ? index + 13
                    : index === 2
                        ? index + 11
                        : index === 3
                            ? index + 9
                            : index === 4
                                ? index + 7
                                : index === 5
                                    ? index + 5
                                    : index === 6
                                        ? index + 3
                                        : index === 7
                                            ? index + 1
                                            : index === 8
                                                ? index - 1
                                                : index === 9
                                                    ? index - 3
                                                    : index === 10
                                                        ? index - 5
                                                        : index === 11
                                                            ? index - 7
                                                            : index === 12
                                                                ? index - 9
                                                                : index === 13
                                                                    ? index - 11
                                                                    : index === 14
                                                                        ? index - 13
                                                                        : index === 15
                                                                            ? index - 15
                                                                            : null;
        }
        else if (focus === "LL") {
            return index === 0 || index === 1 || index === 2 || index === 3
                ? index + 12
                : index === 4 || index === 5 || index === 6 || index === 7
                    ? index + 4
                    : index === 8 || index === 9 || index === 10 || index === 11
                        ? index - 4
                        : index === 12 || index === 13 || index === 14 || index === 15
                            ? index - 12
                            : null;
        }
    }
    exports.fourClasses = fourClasses;
});
//# sourceMappingURL=relationshipRampUtils.js.map