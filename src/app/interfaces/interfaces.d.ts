// esri.core.Collection
import Collection = require("esri/core/Collection");

// esri.layers.Layer
import Layer = require("esri/layers/Layer");

// esri.Color
import Color = require("esri/Color");

// dojox.gfx
import { Fill } from "dojox/gfx";

// esri.core.Accessor
import Accessor = require("esri/core/Accessor");

// esri.core.Loadable
import Loadable = require("esri/core/Loadable");

// esri.Graphic
import Graphic = require("esri/Graphic");

export type LegendElement =
  | SymbolTableElement
  | ColorRampElement
  | OpacityRampElement
  | SizeRampElement
  | HeatmapRampElement
  | RelationshipRampElement;

type SymbolTableElementType =
  | ImageSymbolTableElementInfo
  | SymbolTableElementInfo;

export interface SelectedStyleData {
  layerItemId: string;
  selectedInfoIndex: any;
  requiredFields: any;
}

export type FilterMode = "featureFilter" | "highlight" | "mute";

interface SymbolTableElementInfo {
  label: RampTitle | string;
  value?: any;
  symbol: Symbol;
  size?: number;
  preview?: HTMLElement;
}
interface ImageSymbolTableElementInfo {
  label?: string;
  src: string;
  opacity: number;
  width?: number;
  height?: number;
}

export interface CollectionChangeEvent<T> {
  target: Collection<T>;
  added: T[];
  removed: T[];
  moved: T[];
}

interface RampTitle {
  field: string;
  normField: string;
  ratio: boolean;
  ratioPercent: boolean;
  ratioPercentTotal: boolean;
}

interface SizeRampElement {
  type: "size-ramp";
  title: RampTitle | string;
  infos: SizeRampStop[];
}

interface SizeRampStop {
  label: string;
  value?: any;
  symbol: Symbol;
  size?: number;
  preview?: HTMLElement;
}

export interface ColorRampElement {
  type: "color-ramp";
  title: RampTitle | string;
  borderColor: Color;
  overlayColor: Color;
  infos: ColorRampStop[];
}

interface ColorRampStop {
  value: number;
  color: Color;
  offset: number;
  label: string;
}

interface HeatmapRampStop {
  color: Color;
  offset: number;
  ratio: number;
  label: string;
}

export interface HeatmapRampElement {
  type: "heatmap-ramp";
  title: RampTitle | string;
  infos: HeatmapRampStop[];
}

export interface OpacityRampElement {
  type: "opacity-ramp";
  title: RampTitle | string;
  borderColor: Color;
  overlayColor: Color;
  infos: OpacityRampStop[];
}

interface OpacityRampStop {
  value: number;
  color: Color;
  offset: number;
  label: string;
}

export interface RendererTitle {
  title?: string;
  field: string;
  normField: string;
  normByPct: boolean;
}

export interface SymbolTableElement {
  type: "symbol-table";
  title?: RendererTitle | string;
  infos: SymbolTableElementType[];
  legendType?: string;
}

export interface RelationshipRampElement {
  type: "relationship-ramp";
  numClasses: number;
  focus: string;
  colors: Fill[][];
  labels: RelationshipLabels;
  rotation: number;
  title?: string;
  infos?: any[];
}

export interface RelationshipLabels {
  top: string;
  bottom: string;
  left: string;
  right: string;
}

export interface LayerInfo {
  layer: Layer;
  title: string;
}

export interface ColorRampProperties {
  surface;
  colors;
  numClasses: number;
  size: number;
  gfxMatrix;
  rotation: number;
  translateX: number;
  translateY: number;
  centerX: number;
  centerY: number;
  focus: string;
}

export interface CustomFill {
  type?: string;
  src: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
}

export interface FocusIndexElement {
  label: string;
  fill: Fill;
}

interface SizeRampElement {
  type: "size-ramp";
  title: RampTitle | string;
  infos: SizeRampStop[];
}

interface RampTitle {
  field: string;
  normField: string;
  ratio: boolean;
  ratioPercent: boolean;
  ratioPercentTotal: boolean;
}

interface SizeRampStop {
  label: string;
  value?: any;
  symbol: Symbol;
  size?: number;
  outlineSize?: number;
  preview?: HTMLElement;
}

interface InteractiveStyleData {
  queryExpressions: string[][];
  highlightedFeatures: any[][];
  originalRenderers: any[];
  originalColors: Color[][];
  colorIndexes: number[][];
  mutedValues: any[][];
  classBreakInfosIndex: number[][];
}

export type VNode = {
  /* avoids exposing vdom implementation details */
};
