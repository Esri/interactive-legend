define(["require", "exports", "dojo/i18n!../nls/Legend", "esri/core/lang"], function (require, exports, i18n, lang_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isRampTitle(titleInfo, isRamp) {
        return isRamp;
    }
    function attachToNode(node) {
        var content = this;
        node.appendChild(content);
    }
    exports.attachToNode = attachToNode;
    function getTitle(titleInfo, isRamp) {
        if (!titleInfo) {
            return;
        }
        else if (typeof titleInfo === "string") {
            return titleInfo;
        }
        var bundleKey = null;
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
        }
        else if (isRendererTitle(titleInfo, isRamp)) {
            bundleKey = titleInfo.normField
                ? "showNormField"
                : titleInfo.normByPct
                    ? "showNormPct"
                    : titleInfo.field
                        ? "showField"
                        : null;
        }
        return bundleKey
            ? lang_1.substitute({ field: titleInfo.field, normField: titleInfo.normField }, bundleKey === "showField" ? "{field}" : i18n[bundleKey])
            : null;
    }
    exports.getTitle = getTitle;
    function isRendererTitle(titleInfo, isRamp) {
        return !isRamp;
    }
    exports.isRendererTitle = isRendererTitle;
    function isImageryStretchedLegend(layer, legendType) {
        return !!(legendType &&
            legendType === "Stretched" &&
            layer.version >= 10.3 &&
            layer.declaredClass === "esri.layers.ImageryLayer");
    }
    exports.isImageryStretchedLegend = isImageryStretchedLegend;
});
//# sourceMappingURL=styleUtils.js.map