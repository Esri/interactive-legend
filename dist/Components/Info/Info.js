/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "dojo/i18n!./Info/nls/resources", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "esri/core/watchUtils"], function (require, exports, __extends, __decorate, i18n, decorators_1, Widget, widget_1, watchUtils) {
    "use strict";
    //----------------------------------
    //
    //  CSS Classes
    //
    //----------------------------------
    var CSS = {
        base: "esri-info",
        widget: "esri-widget",
        paginationContainer: "esri-info__pagination-container",
        titleContainer: "esri-info__title-container",
        infoContent: "esri-info__content",
        back: "esri-info__back",
        backText: "esri-info__back-text",
        buttonContainer: "esri-info__button-container",
        nextButton: "esri-info__next",
        list: "esri-info__list",
        listItem: "esri-info__list-item",
        stepNumber: "esri-info__number",
        explanationItem: "esri-info__explanation-item",
        paginationItem: "esri-info__pagination-item",
        paginationItemSelected: "esri-info__pagination-item--selected",
        calciteStyles: {
            btn: "btn"
        },
        icons: {
            widgetIcon: "icon-ui-question"
        }
    };
    var Info = /** @class */ (function (_super) {
        __extends(Info, _super);
        function Info(value) {
            var _this = _super.call(this) || this;
            //----------------------------------
            //
            //  Private Variables
            //
            //----------------------------------
            _this._contentNodes = [];
            _this._selectedItemIndex = 0;
            //----------------------------------
            //
            //  Properties
            //
            //----------------------------------
            _this.infoContent = [];
            //----------------------------------
            //
            //  iconClass and label - Expand Widget Support
            //
            //----------------------------------
            _this.iconClass = CSS.icons.widgetIcon;
            _this.label = i18n.widgetLabel;
            return _this;
        }
        //----------------------------------
        //
        //  Lifecycle
        //
        //----------------------------------
        Info.prototype.postInitialize = function () {
            var _this = this;
            this.own([
                watchUtils.init(this, "content", function () {
                    _this._generateContentNodes();
                })
            ]);
        };
        Info.prototype.render = function () {
            var content = this._renderContent();
            var paginationNodes = this._generatePaginationNodes();
            return (widget_1.tsx("div", { class: this.classes(CSS.widget, CSS.base) },
                widget_1.tsx("div", { class: CSS.paginationContainer }, paginationNodes),
                widget_1.tsx("div", { class: CSS.titleContainer },
                    widget_1.tsx("h1", null, this.infoContent[this._selectedItemIndex].title)),
                widget_1.tsx("div", { class: CSS.infoContent }, content),
                widget_1.tsx("div", { bind: this, onclick: this._previousPage, onkeydown: this._previousPage, class: CSS.back, tabIndex: 0 },
                    widget_1.tsx("span", { class: CSS.backText }, i18n.back)),
                widget_1.tsx("div", { class: CSS.buttonContainer }, this._selectedItemIndex !== this.infoContent.length - 1 ? (widget_1.tsx("button", { bind: this, onclick: this._nextPage, onkeydown: this._nextPage, tabIndex: 0, class: this.classes(CSS.nextButton, CSS.calciteStyles.btn) }, i18n.next)) : (widget_1.tsx("button", { tabIndex: 0, class: this.classes(CSS.nextButton, CSS.calciteStyles.btn) }, i18n.close)))));
        };
        //   _renderContent
        Info.prototype._renderContent = function () {
            return this._contentNodes[this._selectedItemIndex];
        };
        //   _generateContentNodes
        Info.prototype._generateContentNodes = function () {
            var _this = this;
            this.infoContent.forEach(function (contentItem) {
                var type = contentItem.type;
                if (type === "list") {
                    _this._contentNodes.push(_this._generateListNode(contentItem));
                }
                else if (type === "explanation") {
                    _this._contentNodes.push(_this._generateExplanationNode(contentItem));
                }
            });
        };
        //   _generateListNode
        Info.prototype._generateListNode = function (contentItem) {
            var _this = this;
            var listItemNodes = contentItem.listItems.map(function (listItem, listItemIndex) {
                return _this._generateListItemNodes(listItem, listItemIndex);
            });
            return widget_1.tsx("ul", { class: CSS.list }, listItemNodes);
        };
        //   _generateListItemNode
        Info.prototype._generateListItemNodes = function (listItem, listItemIndex) {
            return (widget_1.tsx("li", { class: CSS.listItem },
                widget_1.tsx("div", { class: CSS.stepNumber }, "" + (listItemIndex + 1)),
                widget_1.tsx("span", null, listItem)));
        };
        //   _generateExplanationNode
        Info.prototype._generateExplanationNode = function (contentItem) {
            var _this = this;
            var explanationItemNodes = contentItem.explanationItems.map(function (explanationItem, explanationItemIndex) {
                return _this._generateExplanationItemNodes(explanationItem, explanationItemIndex);
            });
            return widget_1.tsx("div", null, explanationItemNodes);
        };
        //   _generateExplanationItemNodes
        Info.prototype._generateExplanationItemNodes = function (explanationItem, explanationItemIndex) {
            return (widget_1.tsx("p", { key: explanationItemIndex, class: CSS.explanationItem }, explanationItem));
        };
        //   _generatePaginationNodes
        Info.prototype._generatePaginationNodes = function () {
            var _this = this;
            return this.infoContent.map(function (contentItem, contentItemIndex) {
                var paginationClass = _this._selectedItemIndex === contentItemIndex
                    ? _this.classes(CSS.paginationItem, CSS.paginationItemSelected)
                    : CSS.paginationItem;
                return (widget_1.tsx("div", { bind: _this, onclick: _this._goToPage, onkeydown: _this._goToPage, class: paginationClass, "data-pagination-index": "" + contentItemIndex, tabIndex: 0 }));
            });
        };
        // _goToPage
        Info.prototype._goToPage = function (event) {
            var node = event.currentTarget;
            var itemIndex = node.getAttribute("data-pagination-index");
            this._selectedItemIndex = parseInt(itemIndex);
        };
        // _nextPage
        Info.prototype._nextPage = function () {
            if (this._selectedItemIndex !== this.infoContent.length - 1) {
                this._selectedItemIndex += 1;
            }
        };
        // _previousPage
        Info.prototype._previousPage = function () {
            if (this._selectedItemIndex !== 0) {
                this._selectedItemIndex -= 1;
            }
        };
        __decorate([
            decorators_1.property()
        ], Info.prototype, "infoContent", void 0);
        __decorate([
            decorators_1.property()
        ], Info.prototype, "iconClass", void 0);
        __decorate([
            decorators_1.property()
        ], Info.prototype, "label", void 0);
        __decorate([
            widget_1.accessibleHandler()
        ], Info.prototype, "_goToPage", null);
        __decorate([
            widget_1.accessibleHandler()
        ], Info.prototype, "_nextPage", null);
        __decorate([
            widget_1.accessibleHandler()
        ], Info.prototype, "_previousPage", null);
        Info = __decorate([
            decorators_1.subclass("Info")
        ], Info);
        return Info;
    }(decorators_1.declared(Widget)));
    return Info;
});
//# sourceMappingURL=Info.js.map