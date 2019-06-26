// dojo
import * as i18n from "dojo/i18n!../nls/Legend";

// import Lang = require("esri/core/lang");

// esri.layers
import ImageryLayer = require("esri/layers/ImageryLayer");

// esri.widgets
import { RampTitle, RendererTitle } from "../../../../interfaces/interfaces";

import { replace } from "./replace";

function isRampTitle(titleInfo: any, isRamp: boolean): titleInfo is RampTitle {
  return isRamp;
}

export function attachToNode(this: HTMLElement, node: HTMLElement): void {
  const content: HTMLElement = this;
  node.appendChild(content);
}

export function getTitle(
  titleInfo: RendererTitle | RampTitle | string,
  isRamp: boolean
): string {
  if (!titleInfo) {
    return;
  } else if (typeof titleInfo === "string") {
    return titleInfo;
  }

  let bundleKey: string = null;

  if (isRampTitle(titleInfo, isRamp)) {
    bundleKey = titleInfo.ratioPercentTotal
      ? "showRatioPercentTotal"
      : titleInfo.ratioPercent
      ? "showRatioPercent"
      : titleInfo.ratio
      ? "showRatio"
      : titleInfo.normField
      ? "showNormField"
      : titleInfo.field
      ? "showField"
      : null;
  } else if (isRendererTitle(titleInfo, isRamp)) {
    bundleKey = titleInfo.normField
      ? "showNormField"
      : titleInfo.normByPct
      ? "showNormPct"
      : titleInfo.field
      ? "showField"
      : null;
  }

  return bundleKey
    ? replace(bundleKey === "showField" ? "{field}" : i18n[bundleKey], {
        field: titleInfo.field,
        normField: titleInfo.normField
      })
    : null;
}

export function isRendererTitle(
  titleInfo: any,
  isRamp: boolean
): titleInfo is RendererTitle {
  return !isRamp;
}

export function isImageryStretchedLegend(
  layer: ImageryLayer,
  legendType: string
): boolean {
  return !!(
    legendType &&
    legendType === "Stretched" &&
    layer.version >= 10.3 &&
    layer.declaredClass === "esri.layers.ImageryLayer"
  );
}
