define(["require", "exports", "tslib", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "../InteractiveLegend/InteractiveLegend/support/styleUtils", "esri/core/watchUtils"], function (require, exports, tslib_1, decorators_1, Widget, widget_1, styleUtils_1, watchUtils_1) {
    "use strict";
    var CSS = {
        title: "title-container",
        sharedThemeLogo: "esri-header__shared-theme-logo"
    };
    var Header = /** @class */ (function (_super) {
        tslib_1.__extends(Header, _super);
        function Header(params) {
            var _this = _super.call(this, params) || this;
            _this._customHeaderNode = null;
            _this._previousHeight = null;
            _this.sharedTheme = null;
            _this.applySharedTheme = false;
            return _this;
        }
        Header.prototype.postInitialize = function () {
            var _this = this;
            this.own([
                watchUtils_1.when(this, "customHeaderHTML", function () {
                    _this._handleCustomHeaderContent();
                }),
                watchUtils_1.watch(this, "customHeaderHTML", function () {
                    _this._handleCustomHeaderContent();
                })
            ]);
        };
        Header.prototype.render = function () {
            var headerContent = this._renderHeaderContent();
            return (widget_1.tsx("header", { bind: this, afterUpdate: this._handleHeader }, headerContent));
        };
        Header.prototype._handleHeader = function (headerContainer) {
            var _this = this;
            var headerImage = headerContainer.querySelector("img");
            if (headerImage) {
                headerImage.onload = function () {
                    _this._handleHeightDimensions(headerContainer);
                };
            }
            else {
                this._handleHeightDimensions(headerContainer);
            }
        };
        // _handleHeightDimensions
        Header.prototype._handleHeightDimensions = function (headerContainer) {
            var portraitMobile = "only screen and (max-width: 813px) and (orientation:portrait)";
            var landscapeMobile = "only screen and (max-width: 1024px) and (orientation:landscape)";
            if (window.matchMedia(portraitMobile).matches ||
                window.matchMedia(landscapeMobile).matches) {
                var viewParentContainer = document.getElementById("view-parent-container");
                var height = "calc(100% - " + headerContainer.offsetHeight + "px)";
                if (this._previousHeight && this._previousHeight === height) {
                    return;
                }
                this._previousHeight = height;
                viewParentContainer.style.height = height;
            }
        };
        Header.prototype._renderHeaderContent = function () {
            var customHeader = this.customHeader;
            var customHeaderNode = this._customHeaderNode
                ? this._renderCustomHeader()
                : null;
            var defaultHeaderNode = this._renderDefaultHeader();
            return customHeader ? customHeaderNode : defaultHeaderNode;
        };
        Header.prototype._renderCustomHeader = function () {
            return (widget_1.tsx("div", { key: "custom-header", bind: this._customHeaderNode, afterCreate: styleUtils_1.attachToNode }));
        };
        Header.prototype._renderDefaultHeader = function () {
            var sharedThemeStyles = this._getSharedThemeStyles();
            var logo = this._renderSharedThemeLogo();
            var appTitle = this._getTitle();
            return (widget_1.tsx("div", { key: "default-header", styles: sharedThemeStyles, class: CSS.title, title: this.title },
                logo,
                appTitle));
        };
        Header.prototype._renderSharedThemeLogo = function () {
            var _a, _b, _c, _d, _e;
            return this.applySharedTheme ? (((_a = this.sharedTheme) === null || _a === void 0 ? void 0 : _a.logo) ? (widget_1.tsx("div", { class: CSS.sharedThemeLogo }, ((_b = this.sharedTheme) === null || _b === void 0 ? void 0 : _b.logoLink) ? (widget_1.tsx("a", { class: "esri-header__logo-link", href: (_c = this.sharedTheme) === null || _c === void 0 ? void 0 : _c.logoLink, target: "_blank" },
                widget_1.tsx("img", { key: "shared-theme-logo", src: (_d = this.sharedTheme) === null || _d === void 0 ? void 0 : _d.logo }))) : (widget_1.tsx("img", { key: "shared-theme-logo", src: (_e = this.sharedTheme) === null || _e === void 0 ? void 0 : _e.logo })))) : null) : null;
        };
        Header.prototype._getTitle = function () {
            var title = this.title;
            return document.body.clientWidth < 830 && title.length > 40
                ? title
                    .split("")
                    .slice(0, 35)
                    .join("") + "..."
                : document.body.clientWidth > 830 && title.length > 100
                    ? title
                        .split("")
                        .slice(0, 95)
                        .join("") + "..."
                    : title;
        };
        Header.prototype._getSharedThemeStyles = function () {
            var _a, _b;
            return this.applySharedTheme
                ? {
                    background: (_a = this.sharedTheme) === null || _a === void 0 ? void 0 : _a.background,
                    color: (_b = this.sharedTheme) === null || _b === void 0 ? void 0 : _b.text
                }
                : {
                    background: "",
                    color: ""
                };
        };
        Header.prototype._handleCustomHeaderContent = function () {
            var content = document.createElement("header");
            content.innerHTML = this.customHeaderHTML;
            this._customHeaderNode = content;
            this.scheduleRender();
        };
        tslib_1.__decorate([
            decorators_1.property()
        ], Header.prototype, "sharedTheme", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Header.prototype, "customHeader", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Header.prototype, "customHeaderHTML", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Header.prototype, "title", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Header.prototype, "applySharedTheme", void 0);
        Header = tslib_1.__decorate([
            decorators_1.subclass("Header")
        ], Header);
        return Header;
    }(Widget));
    return Header;
});
//# sourceMappingURL=Header.js.map