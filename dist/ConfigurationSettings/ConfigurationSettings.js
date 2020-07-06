define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/core/Accessor"], function (require, exports, tslib_1, decorators_1, Accessor) {
    "use strict";
    var ConfigurationSettings = /** @class */ (function (_super) {
        tslib_1.__extends(ConfigurationSettings, _super);
        function ConfigurationSettings(params) {
            var _this = _super.call(this, params) || this;
            _this.withinConfigurationExperience = window.location !== window.parent.location;
            _this._storageKey = "config-values";
            _this._draft = null;
            _this._draftMode = false;
            _this._draft = params === null || params === void 0 ? void 0 : params.draft;
            _this._draftMode = (params === null || params === void 0 ? void 0 : params.mode) === "draft";
            return _this;
        }
        ConfigurationSettings.prototype.initialize = function () {
            if (this.withinConfigurationExperience || this._draftMode) {
                // Apply any draft properties
                if (this._draft) {
                    Object.assign(this, this._draft);
                }
                window.addEventListener("message", function (e) {
                    this._handleConfigurationUpdates(e);
                }.bind(this), false);
            }
        };
        ConfigurationSettings.prototype._handleConfigurationUpdates = function (e) {
            var _a;
            if (((_a = e === null || e === void 0 ? void 0 : e.data) === null || _a === void 0 ? void 0 : _a.type) === "cats-app") {
                Object.assign(this, e.data);
            }
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "applySharedTheme", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "screenshot", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "screenshotPosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "enablePopupOption", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "enableLegendOption", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "muteOpacity", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "muteGrayScale", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "splashOnStart", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "splashTitle", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "splashContent", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "splashButtonText", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "customCSS", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "customHeaderHTML", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "customHeader", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "customUrlParam", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "customURLParamName", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "title", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "home", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "homePosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "mapZoom", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "mapZoomPosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "basemapToggle", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "basemapTogglePosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "nextBasemap", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "search", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "searchPosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "searchOpenAtStart", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "searchConfiguration", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "layerList", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "layerListPosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "filterMode", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "featureCount", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "updateExtent", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "interactiveLegendPosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "infoPanel", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "infoPanelPosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "splash", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "splashButtonPosition", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "withinConfigurationExperience", void 0);
        ConfigurationSettings = tslib_1.__decorate([
            decorators_1.subclass("app.ConfigurationSettings")
        ], ConfigurationSettings);
        return ConfigurationSettings;
    }(Accessor));
    return ConfigurationSettings;
});
//# sourceMappingURL=ConfigurationSettings.js.map