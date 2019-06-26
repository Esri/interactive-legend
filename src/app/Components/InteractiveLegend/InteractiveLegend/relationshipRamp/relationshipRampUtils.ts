// dojox.gfx
import { createSurface, Fill, Stroke } from "dojox/gfx";

// dojox.gfx.matrix
import gfxMatrix = require("dojox/gfx/matrix");

// esri.symbols.Symbol3D
import Symbol3D = require("esri/symbols/Symbol3D");

// esri.Color
import Color = require("esri/Color");

// esri.symbols.Symbol3DLayer
import Symbol3DLayer = require("esri/symbols/Symbol3DLayer");

// dojox.gfx
import gfxBase = require("dojox/gfx/_base");

// Create2DColorRamp
import Create2DColorRamp = require("./Create2DColorRamp");

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.view.SceneView
import SceneView = require("esri/views/SceneView");

// esri.core.Collection
import Collection = require("esri/core/Collection");

// esri.widgets.Legend.support.ActiveLayerInfo
import ActiveLayerInfo = require("esri/widgets/Legend/support/ActiveLayerInfo");

import Ramp = require("./Ramp");

// interfaces
import {
  RelationshipRampElement,
  RelationshipLabels,
  CustomFill,
  FocusIndexElement
} from "../../../../interfaces/interfaces";

const svgNS = "http://www.w3.org/2000/svg";

const arrowFill = "#555555";

const focusToRotationAngleMap = {
  HH: 315,
  HL: 45,
  LL: 135,
  LH: 225
};

const DPI = 96;

const PICTURE_FILL_SYMBOL = "picture-fill";
const SIMPLE_FILL_SYMBOL = "simple-fill";
const SIMPLE_LINE_SYMBOL = "simple-line";
const SIMPLE_MARKER_SYMBOL = "simple-marker";

const FILL_PATTERN_URL_PREFIX = require.toUrl("esri/symbols/patterns/");

const defaultThematicColor = new Color([128, 128, 128]);

const TEXT_SYMBOL = "text";

const relationshipColorClassValues = {
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

type PreviewFill =
  | Color
  | CustomFill
  | [number, number, number]
  | [number, number, number, number];

export type RelationshipFocus = "HH" | "LL" | "HL" | "LH";

function getSymbolColor(symbol: any): Fill {
  if (!symbol) {
    return;
  }

  const { type } = symbol;

  if (type.indexOf("3d") > -1) {
    return getSymbolLayerFill((symbol as Symbol3D).symbolLayers.getItemAt(
      0
    ) as Symbol3DLayerCustom);
  } else {
    if (type === "simple-line") {
      const stroke = getStroke(symbol);
      return stroke && stroke.color;
    } else if (symbol.type === "simple-marker") {
      if (symbol.style === "x" || symbol.style === "cross") {
        const stroke = getStroke(symbol);
        return stroke && stroke.color;
      }
    }
    return getFill(symbol);
  }
}

function getLabels(
  focus: RelationshipFocus,
  index: HashMap<FocusIndexElement>
): RelationshipLabels {
  const HH = index["HH"].label;
  const LL = index["LL"].label;
  const HL = index["HL"].label;
  const LH = index["LH"].label;

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

function setLineArrow(
  pathNode: HTMLElement,
  side: "left" | "right",
  focus: string,
  id: string
): void {
  const markerStart = "marker-start";
  const markerEnd = "marker-end";
  const startId = `${id}_arrowStart`;
  const endId = `${id}_arrowEnd`;
  const isLeftSide = side === "left";

  switch (focus) {
    case "HL":
      pathNode.setAttribute(
        isLeftSide ? markerStart : markerEnd,
        `url(#${isLeftSide ? endId : startId})`
      );
      break;
    case "LL":
      pathNode.setAttribute(markerStart, `url(#${endId})`);
      break;
    case "LH":
      pathNode.setAttribute(
        isLeftSide ? markerEnd : markerStart,
        `url(#${isLeftSide ? startId : endId})`
      );
      break;
    default:
      pathNode.setAttribute(markerEnd, `url(#${startId})`);
      break;
  }
}

function createArrowMarker(
  defNode: Node,
  direction: "start" | "end",
  id: string
): void {
  const isStart = direction === "start";
  const nodeId = isStart ? `${id}_arrowStart` : `${id}_arrowEnd`;
  const path = isStart ? "0,0 5,5 0,10" : "5,0 0,5 5,10";
  const refX = isStart ? "5" : "0";

  // <marker>
  const marker = document.createElementNS(svgNS, "marker");
  marker.setAttribute("id", nodeId);
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "10");
  marker.setAttribute("refX", refX);
  marker.setAttribute("refY", "5");
  marker.setAttribute("markerUnits", "strokeWidth");
  marker.setAttribute("orient", "auto");

  // <path> within <marker>
  const arrow = document.createElementNS(svgNS, "polyline");
  arrow.setAttribute("points", path);
  arrow.setAttribute("fill", "none");
  arrow.setAttribute("stroke", arrowFill);
  arrow.setAttribute("stroke-width", "1");
  marker.appendChild(arrow);

  defNode.appendChild(marker);
}

const _dekebabify = (function(): (text: string) => string {
  const cache: HashMap<string> = {};

  return function(text: string): string {
    if (cache[text]) {
      return cache[text];
    }

    const dekebabified = text.replace(/-/g, "");
    cache[text] = dekebabified;

    return dekebabified;
  };
})();

function getStroke(symbol: any): Stroke {
  if (!symbol) {
    return null;
  }

  let stroke: Stroke;
  const width = pt2px(symbol.width);

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

function pt2px(pt): number {
  if (!pt) {
    return 0;
  }
  return (pt / 72) * DPI;
}

interface Symbol3DLayerCustom extends Symbol3DLayer {
  material: any;
}

function getSymbolLayerFill(
  symbolLayer: Symbol3DLayerCustom,
  brightnessFactor: number = 0
): PreviewFill {
  if (!symbolLayer.material || !symbolLayer.material.color) {
    const defaultColor = defaultThematicColor.r,
      defaultColorLum = adjustBrightness(defaultColor, brightnessFactor);

    return [defaultColorLum, defaultColorLum, defaultColorLum, 100];
  }

  const fillColorArray = symbolLayer.material.color.toRgb();

  for (let j = 0; j < 3; j++) {
    fillColorArray[j] = adjustBrightness(fillColorArray[j], brightnessFactor);
  }

  fillColorArray.push(symbolLayer.material.color.a);

  return fillColorArray;
}

function adjustBrightness(colorComponent: number, factor: number): number {
  const magnitudeFactor = 0.75;
  return Math.min(
    Math.max(colorComponent + 255 * factor * magnitudeFactor, 0),
    255
  );
}

export function renderRamp(
  legendElement: RelationshipRampElement,
  id: string,
  view: MapView | SceneView,
  activeLayerInfos: Collection<ActiveLayerInfo>,
  layerView: any,
  filterMode: string,
  opacity: number,
  grayScale: number,
  searchViewModel: __esri.SearchViewModel,
  layerListViewModel: __esri.LayerListViewModel,
  featureCountEnabled: boolean,
  size: number = 60
): any {
  const { focus, numClasses, colors, rotation } = legendElement;
  const isDiamond = !!focus;
  const surfaceSize =
    Math.sqrt(Math.pow(size, 2) + Math.pow(size, 2)) + (isDiamond ? 0 : 5); // diagonal length + 5px padding for arrows

  const rampDiv = document.createElement("div");
  const surface = createSurface(rampDiv, surfaceSize, surfaceSize);

  const translateX = (surfaceSize - size) / 2;
  const translateY = (surfaceSize - size) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const colorRampProperties = {
    surface,
    colors,
    numClasses,
    size,
    gfxMatrix,
    translateX,
    translateY,
    centerX,
    centerY,
    rotation,
    focus
  };

  const shape = new Create2DColorRamp({
    view,
    activeLayerInfos,
    colorRampProperties,
    legendElement,
    layerView,
    surface,
    filterMode,
    opacity,
    grayScale,
    searchViewModel,
    layerListViewModel,
    featureCountEnabled
  });
  shape.generateCells();

  const arrowGroup = surface.createGroup();
  const stroke = { width: 1, color: arrowFill };

  const defNode = (surface as any).defNode;
  createArrowMarker(defNode, "start", id);
  createArrowMarker(defNode, "end", id);

  const leftPaddingX = 10;
  const leftPaddingY = 15;
  const leftLineShape = arrowGroup
    .createLine({
      x1: -leftPaddingX,
      y1: size - leftPaddingY,
      x2: -leftPaddingX,
      y2: leftPaddingY
    })
    .setStroke(stroke);

  const rightPaddingX = 15;
  const rightPaddingY = 10;
  const rightLineShape = arrowGroup
    .createLine({
      x1: rightPaddingX,
      y1: size + rightPaddingY,
      x2: size - rightPaddingX,
      y2: size + rightPaddingY
    })
    .setStroke(stroke);

  setLineArrow(leftLineShape.rawNode as HTMLElement, "left", focus, id);
  setLineArrow(rightLineShape.rawNode as HTMLElement, "right", focus, id);

  arrowGroup.applyTransform(gfxMatrix.translate(translateX, translateY));

  if (isDiamond) {
    arrowGroup.applyTransform(gfxMatrix.rotategAt(-45, centerX, centerY));
  } else {
    (surface.rawNode as HTMLElement).style.margin = "-15px -15px -18px -15px";
  }
  return new Ramp({
    rampDiv,
    shape
  });
}

export function getFill(symbol: any): Fill {
  const style = symbol.style;
  let fill: Fill = null;

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
        } else if (style !== "none") {
          fill = {
            ...gfxBase.defaultPattern,
            src: FILL_PATTERN_URL_PREFIX + style + ".png",
            width: 8,
            height: 8
          };
        }
        break;
      case PICTURE_FILL_SYMBOL:
        fill = {
          ...gfxBase.defaultPattern,
          src: symbol.url,
          width: pt2px(symbol.width) * symbol.xscale,
          height: pt2px(symbol.height) * symbol.yscale,
          x: pt2px(symbol.xoffset),
          y: pt2px(symbol.yoffset)
        };
        break;
      case TEXT_SYMBOL:
        fill = symbol.color;
        break;
    }
  }
  return fill;
}

// infos type: UniqueValueInfos
export function getRelationshipRampElement(params: {
  focus: RelationshipFocus;
  numClasses: number;
  infos: any[];
}): RelationshipRampElement {
  const { focus, infos, numClasses } = params;
  const classValues = relationshipColorClassValues[numClasses];
  const index: HashMap<FocusIndexElement> = {};

  infos.forEach(info => {
    index[info.value] = {
      label: info.label,
      fill: getSymbolColor(info.symbol)
    };
  });

  // generate 2d array of colors
  const colors = [];

  for (let i = 0; i < numClasses; i++) {
    const arr = [];

    for (let j = 0; j < numClasses; j++) {
      const info = index[classValues[i][j]];
      arr.push(info.fill);
    }

    colors.push(arr);
  }

  const labels = getLabels(focus, index);
  return {
    type: "relationship-ramp",
    numClasses,
    focus,
    colors,
    labels,
    rotation: getRotationAngleForFocus(focus)
  };
}

export function getRotationAngleForFocus(focus: string): number {
  let rotation = focusToRotationAngleMap[focus];

  // handle invalid focus
  if (focus && rotation == null) {
    rotation = focusToRotationAngleMap["HH"];
  }

  return rotation || 0;
}

// _twoClasses
export function twoClasses(index: number, focus: string): number {
  if (focus === "HH" || focus === null) {
    return index === 0 || index === 2
      ? index + 1
      : index === 1 || index === 3
      ? index - 1
      : null;
  } else if (focus === "LH") {
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
  } else if (focus === "LL") {
    return index === 0 || index === 1
      ? index + 2
      : index === 2 || index === 3
      ? index - 2
      : null;
  }
}

// _threeClasses
export function threeClasses(index: number, focus: string): number {
  if (focus === "HH" || focus === null) {
    return index === 0 || index === 3 || index === 6
      ? index + 2
      : index === 2 || index === 5 || index === 8
      ? index - 2
      : index;
  } else if (focus === "LH") {
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
  } else if (focus === "LL") {
    return index === 0 || index === 1 || index === 2
      ? index + 6
      : index === 6 || index === 7 || index === 8
      ? index - 6
      : index;
  }
}

// _fourNumClasses
export function fourClasses(index: number, focus: string): number {
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
  } else if (focus === "LH") {
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
  } else if (focus === "LL") {
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
