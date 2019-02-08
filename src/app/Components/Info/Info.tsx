/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// dojo
import i18n = require("dojo/i18n!./Info/nls/resources");

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property
} from "esri/core/accessorSupport/decorators";

// esri.widgets
import Widget = require("esri/widgets/Widget");

//esri.widgets.support
import { accessibleHandler, tsx } from "esri/widgets/support/widget";

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

//----------------------------------
//
//  CSS Classes
//
//----------------------------------

const CSS = {
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
  private _selectedItemIndex = 0;

  //----------------------------------
  //
  //  Properties
  //
  //----------------------------------

  @property()
  infoContent: any[] = [];

  //----------------------------------
  //
  //  iconClass and label - Expand Widget Support
  //
  //----------------------------------

  @property()
  iconClass = CSS.icons.widgetIcon;
  @property()
  label = i18n.widgetLabel;

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
    const paginationNodes = this._generatePaginationNodes();
    return (
      <div class={this.classes(CSS.widget, CSS.base)}>
        <div class={CSS.paginationContainer}>{paginationNodes}</div>
        <div class={CSS.titleContainer}>
          <h1>{this.infoContent[this._selectedItemIndex].title}</h1>
        </div>
        <div class={CSS.infoContent}>{content}</div>

        <div
          bind={this}
          onclick={this._previousPage}
          onkeydown={this._previousPage}
          class={CSS.back}
          tabIndex={0}
        >
          <span class={CSS.backText}>{i18n.back}</span>
        </div>

        <div class={CSS.buttonContainer}>
          {this._selectedItemIndex !== this.infoContent.length - 1 ? (
            <button
              bind={this}
              onclick={this._nextPage}
              onkeydown={this._nextPage}
              tabIndex={0}
              class={this.classes(CSS.nextButton, CSS.calciteStyles.btn)}
            >
              {i18n.next}
            </button>
          ) : (
            <button
              tabIndex={0}
              class={this.classes(CSS.nextButton, CSS.calciteStyles.btn)}
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
    return this._contentNodes[this._selectedItemIndex];
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
    const listItemNodes = contentItem.listItems.map(
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
        <div class={CSS.stepNumber}>{`${listItemIndex + 1}`}</div>
        <span>{listItem}</span>
      </li>
    );
  }

  //   _generateExplanationNode
  private _generateExplanationNode(contentItem: any): any {
    const explanationItemNodes = contentItem.explanationItems.map(
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
    return this.infoContent.map((contentItem, contentItemIndex) => {
      const paginationClass =
        this._selectedItemIndex === contentItemIndex
          ? this.classes(CSS.paginationItem, CSS.paginationItemSelected)
          : CSS.paginationItem;
      return (
        <div
          bind={this}
          onclick={this._goToPage}
          onkeydown={this._goToPage}
          class={paginationClass}
          data-pagination-index={`${contentItemIndex}`}
          tabIndex={0}
        />
      );
    });
  }

  // _goToPage
  @accessibleHandler()
  private _goToPage(event: Event): void {
    const node = event.currentTarget as HTMLElement;
    const itemIndex = node.getAttribute("data-pagination-index");
    this._selectedItemIndex = parseInt(itemIndex);
  }

  // _nextPage
  @accessibleHandler()
  private _nextPage(): void {
    if (this._selectedItemIndex !== this.infoContent.length - 1) {
      this._selectedItemIndex += 1;
    }
  }

  // _previousPage
  @accessibleHandler()
  private _previousPage(): void {
    if (this._selectedItemIndex !== 0) {
      this._selectedItemIndex -= 1;
    }
  }
}

export = Info;
