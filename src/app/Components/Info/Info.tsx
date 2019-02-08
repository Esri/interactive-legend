/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// dojo
import i18n = require("dojo/i18n!./Info/nls/resources");

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property,
  aliasOf
} from "esri/core/accessorSupport/decorators";

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

// esri.widgets
import Widget = require("esri/widgets/Widget");

// esri.widgets.Expand
import Expand = require("esri/widgets/Expand");

//esri.widgets.support
import {
  accessibleHandler,
  tsx,
  renderable
} from "esri/widgets/support/widget";

// InfoContentItem
import { InfoContentItem } from "./interfaces/interfaces";

// InfoViewModel
import InfoViewModel = require("./Info/InfoViewModel");

//----------------------------------
//
//  CSS Classes
//
//----------------------------------

const CSS = {
  base: "esri-info",
  widget: "esri-widget",
  paginationContainer: "esri-info__pagination-container",
  paginationItem: "esri-info__pagination-item",
  paginationItemSelected: "esri-info__pagination-item--selected",
  titleContainer: "esri-info__title-container",
  infoContent: "esri-info__content",
  back: "esri-info__back",
  backText: "esri-info__back-text",
  buttonContainer: "esri-info__button-container",
  nextButton: "esri-info__next",
  list: "esri-info__list",
  listItem: "esri-info__list-item",
  listItemTextContainer: "esri-info__list-item-text-container",
  stepNumberContainer: "esri-info__number-container",
  stepNumber: "esri-info__number",
  explanationItem: "esri-info__explanation-item",
  calciteStyles: {
    btn: "btn"
  },
  icons: {
    widgetIcon: "icon-ui-question"
  }
};

@subclass("Info")
class Info extends declared(Widget) {
  constructor(value: any) {
    super();
  }
  //----------------------------------
  //
  //  Private Variables
  //
  //----------------------------------
  private _contentNodes: any[] = [];
  private _paginationNodes: any[] = [];
  //----------------------------------
  //
  //  Properties
  //
  //----------------------------------

  // infoContent
  @aliasOf("viewModel.infoContent")
  @property()
  @renderable()
  infoContent: InfoContentItem[] = null;

  // expandWidget
  @aliasOf("viewModel.expandWidget")
  @property()
  @renderable()
  expandWidget: Expand = null;

  // selectedItemIndex
  @aliasOf("viewModel.selectedItemIndex")
  @property()
  @renderable()
  selectedItemIndex: number = null;

  //----------------------------------------------
  //
  //  iconClass and label - Expand Widget Support
  //
  //----------------------------------------------

  // iconClass
  @property()
  iconClass = CSS.icons.widgetIcon;

  // label
  @property()
  label = i18n.widgetLabel;

  // viewModel
  @renderable()
  @property({
    type: InfoViewModel
  })
  viewModel: InfoViewModel = new InfoViewModel();

  //----------------------------------
  //
  //  Lifecycle
  //
  //----------------------------------

  postInitialize() {
    this.own([
      watchUtils.init(this, "content", () => {
        this._generateContentNodes();
      })
    ]);
  }

  render() {
    const content = this._renderContent();
    const paginationNodes =
      this.infoContent.length > 1 ? this._generatePaginationNodes() : null;
    return (
      <div class={this.classes(CSS.widget, CSS.base)}>
        {paginationNodes ? (
          <div class={CSS.paginationContainer}>{paginationNodes}</div>
        ) : null}
        <div class={CSS.titleContainer}>
          <h1>{this.infoContent[this.selectedItemIndex].title}</h1>
        </div>
        <div class={CSS.infoContent}>{content}</div>

        {paginationNodes && this.selectedItemIndex !== 0 ? (
          <div key="previous-page" class={CSS.back}>
            <span
              bind={this}
              onclick={this._previousPage}
              onkeydown={this._previousPage}
              tabIndex={0}
              class={CSS.backText}
              title={i18n.back}
            >
              {i18n.back}
            </span>
          </div>
        ) : null}

        <div class={CSS.buttonContainer}>
          {this.selectedItemIndex !== this.infoContent.length - 1 ? (
            <button
              bind={this}
              onclick={this._nextPage}
              onkeydown={this._nextPage}
              tabIndex={0}
              class={this.classes(CSS.nextButton, CSS.calciteStyles.btn)}
              title={i18n.next}
            >
              {i18n.next}
            </button>
          ) : (
            <button
              bind={this}
              onclick={this._closeInfoPanel}
              onkeydown={this._closeInfoPanel}
              tabIndex={0}
              class={this.classes(CSS.nextButton, CSS.calciteStyles.btn)}
              title={i18n.close}
            >
              {i18n.close}
            </button>
          )}
        </div>
      </div>
    );
  }

  //   _renderContent
  private _renderContent(): any {
    return this._contentNodes[this.selectedItemIndex];
  }

  //   _generateContentNodes
  private _generateContentNodes(): void {
    this.infoContent.forEach(contentItem => {
      const { type } = contentItem;
      if (type === "list") {
        this._contentNodes.push(this._generateListNode(contentItem));
      } else if (type === "explanation") {
        this._contentNodes.push(this._generateExplanationNode(contentItem));
      }
    });
  }

  //   _generateListNode
  private _generateListNode(contentItem: any): any {
    const listItemNodes = contentItem.infoContentItems.map(
      (listItem, listItemIndex) => {
        return this._generateListItemNodes(listItem, listItemIndex);
      }
    );
    return <ul class={CSS.list}>{listItemNodes}</ul>;
  }

  //   _generateListItemNode
  private _generateListItemNodes(listItem: string, listItemIndex: number): any {
    return (
      <li class={CSS.listItem}>
        <div class={CSS.stepNumberContainer}>
          <div class={CSS.stepNumber}>{`${listItemIndex + 1}`}</div>
        </div>
        <div class={CSS.listItemTextContainer}>
          <span>{listItem}</span>
        </div>
      </li>
    );
  }

  //   _generateExplanationNode
  private _generateExplanationNode(contentItem: any): any {
    const explanationItemNodes = contentItem.infoContentItems.map(
      (explanationItem, explanationItemIndex) => {
        return this._generateExplanationItemNodes(
          explanationItem,
          explanationItemIndex
        );
      }
    );
    return <div>{explanationItemNodes}</div>;
  }

  //   _generateExplanationItemNodes
  private _generateExplanationItemNodes(
    explanationItem: string,
    explanationItemIndex: number
  ): any {
    return (
      <p key={explanationItemIndex} class={CSS.explanationItem}>
        {explanationItem}
      </p>
    );
  }

  //   _generatePaginationNodes
  private _generatePaginationNodes(): any {
    this._paginationNodes = [];
    return this.infoContent.map((contentItem, contentItemIndex) => {
      const paginationClass =
        this.selectedItemIndex === contentItemIndex
          ? this.classes(CSS.paginationItem, CSS.paginationItemSelected)
          : CSS.paginationItem;
      const paginationNode = (
        <div
          bind={this}
          onclick={this._goToPage}
          onkeydown={this._goToPage}
          class={paginationClass}
          data-pagination-index={`${contentItemIndex}`}
          tabIndex={0}
        />
      );
      this._paginationNodes.push(paginationNode);
      return paginationNode;
    });
  }

  // _goToPage
  @accessibleHandler()
  private _goToPage(event: Event): void {
    const node = event.currentTarget as HTMLElement;
    const itemIndex = node.getAttribute("data-pagination-index");
    this.viewModel.selectedItemIndex = parseInt(itemIndex);
    this._paginationNodes[this.selectedItemIndex].domNode.focus();
    this.scheduleRender();
  }

  // _nextPage
  @accessibleHandler()
  private _nextPage(): void {
    if (this.selectedItemIndex !== this.infoContent.length - 1) {
      this.selectedItemIndex += 1;
      this._paginationNodes[this.selectedItemIndex].domNode.focus();
    }
  }

  // _previousPage
  @accessibleHandler()
  private _previousPage(): void {
    if (this.selectedItemIndex !== 0) {
      this.selectedItemIndex -= 1;
      this._paginationNodes[this.selectedItemIndex].domNode.focus();
    }
  }

  // _closeInfoPanel
  @accessibleHandler()
  private _closeInfoPanel(): void {
    this.selectedItemIndex = 0;
    this.expandWidget.expanded = false;
  }
}

export = Info;
