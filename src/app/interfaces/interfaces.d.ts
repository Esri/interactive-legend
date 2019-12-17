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

// esri.views.layers.FeatureLayerView
import FeatureLayerView = require("esri/views/layers/FeatureLayerView");

// esri.widgets.Legend.support.ActiveLayerInfo
import ActiveLayerInfo = require("esri/widgets/Legend/support/ActiveLayerInfo");

// esri.views.View
import View = require("esri/views/View");

type LegendElement =
  | SymbolTableElement
  | ColorRampElement
  | StretchRampElement
  | OpacityRampElement
  | SizeRampElement
  | HeatmapRampElement
  | RelationshipRampElement;
type SymbolTableElementType =
  | ImageSymbolTableElementInfo
  | SymbolTableElementInfo;

// export type FilterMode = "featureFilter" | "highlight" | "mute";

export type FilterMode = "featureFilter" | "mute";

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

interface LayerUID extends Layer {
  uid: string;
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
  infos: ColorRampStop[];
  preview?: HTMLElement;
}

export interface ColorRampStop {
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
  preview?: HTMLElement;
}

export interface OpacityRampElement {
  type: "opacity-ramp";
  title: RampTitle | string;
  infos: OpacityRampStop[];
  preview?: HTMLElement;
}

interface OpacityRampStop {
  value: number;
  color: Color;
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

export interface StretchRampElement {
  type: "stretch-ramp";
  title: RampTitle | string;
  infos: ColorRampStop[];
  preview?: HTMLElement;
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

interface ActiveLayerInfoProps extends ActiveLayerInfo {
  isScaleDriven: boolean;
  view: View;
}

export type VNode = {
  /* avoids exposing vdom implementation details */
};

interface FeatureDataParams {
  classBreakInfos1: any;
  classBreakInfos2: any;
  fieldValue1: number;
  fieldValue2: number;
  feature: Graphic;
}

interface MinMaxData {
  minValue: number;
  maxValue: number;
}

interface RelationshipExpressionParams {
  data: MinMaxData[][];
  focus: string;
  field1: string;
  field2: string;
  i: number;
  j: number;
}

declare module "*.png" {
  const value: any;
  export = value;
}
