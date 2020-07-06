define(["require", "exports", "tslib", "dojo/i18n!../nls/Legend", "./replace"], function (require, exports, tslib_1, Legend_1, replace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isImageryStretchedLegend = exports.isRendererTitle = exports.getTitle = exports.attachToNode = void 0;
    Legend_1 = tslib_1.__importDefault(Legend_1);
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
            ? replace_1.replace(bundleKey === "showField" ? "{field}" : Legend_1.default[bundleKey], {
                field: titleInfo.field,
                normField: titleInfo.normField
            })
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