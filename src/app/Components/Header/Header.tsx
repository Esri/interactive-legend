import { subclass, property } from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");

import { renderable, tsx } from "esri/widgets/support/widget";
import { VNode } from "../../interfaces/interfaces";
import { attachToNode } from "../InteractiveLegend/InteractiveLegend/support/styleUtils";
import { watch, when } from "esri/core/watchUtils";

const CSS = {
  title: "title-container",
  sharedThemeLogo: "esri-header__shared-theme-logo"
};

interface SharedThemeStyles {
  background: string;
  color: string;
}

@subclass("Header")
class Header extends Widget {
  private _customHeaderNode = null;
  private _previousHeight: string = null;

  constructor(params) {
    super(params);
  }

  @property()
  sharedTheme: any = null;

  @property()
  @renderable()
  customHeader: boolean;

  @property()
  @renderable()
  customHeaderHTML: string;

  @property()
  @renderable()
  title: string;

  @property()
  @renderable()
  applySharedTheme = false;

  postInitialize() {
    this.own([
      when(this, "customHeaderHTML", () => {
        this._handleCustomHeaderContent();
      }),
      watch(this, "customHeaderHTML", () => {
        this._handleCustomHeaderContent();
      })
    ]);
  }

  render(): VNode {
    const headerContent = this._renderHeaderContent();
    return (
      <header bind={this} afterUpdate={this._handleHeader}>
        {headerContent}
      </header>
    );
  }

  private _handleHeader(headerContainer: HTMLElement) {
    const headerImage = headerContainer.querySelector(
      "img"
    ) as HTMLImageElement;
    if (headerImage) {
      headerImage.onload = () => {
        this._handleHeightDimensions(headerContainer);
      };
    } else {
      this._handleHeightDimensions(headerContainer);
    }
  }

  // _handleHeightDimensions
  private _handleHeightDimensions(headerContainer: HTMLElement): void {
    const portraitMobile =
      "only screen and (max-width: 813px) and (orientation:portrait)";
    const landscapeMobile =
      "only screen and (max-width: 1024px) and (orientation:landscape)";
    if (
      window.matchMedia(portraitMobile).matches ||
      window.matchMedia(landscapeMobile).matches
    ) {
      const viewParentContainer = document.getElementById(
        "view-parent-container"
      );
      const height = `calc(100% - ${headerContainer.offsetHeight}px)`;
      if (this._previousHeight && this._previousHeight === height) {
        return;
      }

      this._previousHeight = height;
      viewParentContainer.style.height = height;
    }
  }

  private _renderHeaderContent(): VNode {
    const { customHeader } = this;
    const customHeaderNode = this._customHeaderNode
      ? this._renderCustomHeader()
      : null;
    const defaultHeaderNode = this._renderDefaultHeader();
    return customHeader ? customHeaderNode : defaultHeaderNode;
  }

  private _renderCustomHeader(): VNode {
    return (
      <div
        key="custom-header"
        bind={this._customHeaderNode}
        afterCreate={attachToNode}
      />
    );
  }

  private _renderDefaultHeader(): VNode {
    const sharedThemeStyles = this._getSharedThemeStyles();
    const logo = this._renderSharedThemeLogo();
    const appTitle = this._getTitle();
    return (
      <div
        key="default-header"
        styles={sharedThemeStyles}
        class={CSS.title}
        title={this.title}
      >
        {logo}
        {appTitle}
      </div>
    );
  }

  private _renderSharedThemeLogo(): VNode {
    return this.applySharedTheme ? (
      this.sharedTheme?.logo ? (
        <div class={CSS.sharedThemeLogo}>
          {this.sharedTheme?.logoLink ? (
            <a
              class="esri-header__logo-link"
              href={this.sharedTheme?.logoLink}
              target="_blank"
            >
              <img key="shared-theme-logo" src={this.sharedTheme?.logo} />
            </a>
          ) : (
            <img key="shared-theme-logo" src={this.sharedTheme?.logo} />
          )}
        </div>
      ) : null
    ) : null;
  }

  private _getTitle(): string {
    const { title } = this;
    return document.body.clientWidth < 830 && title.length > 40
      ? `${title
          .split("")
          .slice(0, 35)
          .join("")}...`
      : document.body.clientWidth > 830 && title.length > 100
      ? `${title
          .split("")
          .slice(0, 95)
          .join("")}...`
      : title;
  }

  private _getSharedThemeStyles(): SharedThemeStyles {
    return this.applySharedTheme
      ? {
          background: this.sharedTheme?.background,
          color: this.sharedTheme?.text
        }
      : {
          background: "",
          color: ""
        };
  }

  private _handleCustomHeaderContent(): void {
    const content = document.createElement("header") as any;
    content.innerHTML = this.customHeaderHTML;
    this._customHeaderNode = content;
    this.scheduleRender();
  }
}

export = Header;
