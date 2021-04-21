import i18n = require("dojo/i18n!../../nls/resources");
import { subclass, property } from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");

import { tsx, storeNode } from "esri/widgets/support/widget";

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.views.SceneView
import SceneView = require("esri/views/SceneView");
import { attachToNode } from "../InteractiveLegend/InteractiveLegend/support/styleUtils";

import { when, watch, whenOnce } from "esri/core/watchUtils";

const CSS = {
  appBody: "app-body",
  trailerHalf: "trailer-half",
  textRight: "text-right",
  appButton: "app-button",
  esriWidget: "esri-widget",
  esriWidgetButton: "esri-widget--button",
  splashButtonStyles: "splash-button",
  splashContent: "esri-splash__content",
  splashModal: "esri-interactive-legend__splash-modal"
};

@subclass("Splash")
class Splash extends Widget {
  private _splashContentNode = null;
  private _beforeCloseIsSet = false;

  constructor(params: any) {
    super(params);
  }

  @property()
  view: MapView | SceneView = null;

  @property()
  splashButtonText: string = null;

  @property()
  splashContent: string = null;

  @property()
  splashOnStart: boolean = null;

  @property()
  splashTitle: string = null;

  @property()
  modalNode = null;

  @property()
  theme = "light";

  postInitialize() {
    this.own([
      when(this, "splashContent", () => {
        this._handleSplashContent();
        this.scheduleRender();
      }),
      watch(this, "splashContent", () => {
        this._handleSplashContent();
        this.scheduleRender();
      })
    ]);
  }

  render() {
    const { splashTitle, splashButtonText } = this;
    return (
      <calcite-modal
        bind={this}
        afterCreate={storeNode}
        afterUpdate={this._setBeforeClose}
        data-node-ref="modalNode"
        size="medium"
        theme={this.theme}
        class={CSS.splashModal}
      >
        <h3 slot="header">{splashTitle}</h3>
        <div class={CSS.splashContent} slot="content">
          {this._splashContentNode ? (
            <p bind={this._splashContentNode} afterCreate={attachToNode} />
          ) : null}
        </div>
        <calcite-button
          bind={this}
          onclick={this._closeModal}
          slot="primary"
          width="full"
        >
          {splashButtonText}
        </calcite-button>
      </calcite-modal>
    );
  }

  createToolbarButton(): HTMLButtonElement {
    // add a button to the app that toggles the splash and setup to add to the view
    const splashButton = document.createElement("button");
    splashButton.id = "splash";
    splashButton.title = i18n.introductionPanelTooltip;
    const { esriWidget, esriWidgetButton, splashButtonStyles } = CSS;

    const headerButtonClasses = [
      esriWidget,
      esriWidgetButton,
      splashButtonStyles,
      "esri-icon-description"
    ];

    headerButtonClasses.forEach(className => {
      splashButton.classList.add(className);
    });
    const spanElement = document.createElement("span");

    splashButton.appendChild(spanElement);
    whenOnce(this, "modalNode", () => {
      splashButton.addEventListener("click", () => {
        this.modalNode.setAttribute("active", "true");
        const parentContainer = document.querySelector(
          ".parent-container"
        ) as HTMLElement;
        parentContainer.style.zIndex = "0";
      });
    });
    return splashButton;
  }

  private _handleSplashContent(): void {
    const content = document.createElement("div");
    content.innerHTML = this.splashContent;
    this._splashContentNode = content;
    this.scheduleRender();
  }

  private _closeModal() {
    this.modalNode.removeAttribute("active");
  }

  private _setBeforeClose(): void {
    if (this.modalNode && !this._beforeCloseIsSet) {
      this.modalNode.beforeClose = () => {
        return this._beforeClose();
      };

      this._beforeCloseIsSet = true;
    }
  }

  private _beforeClose(): Promise<void> {
    return new Promise(resolve => {
      const parentContainer = document.querySelector(
        ".parent-container"
      ) as HTMLElement;
      parentContainer.style.zIndex = "500";
      this.modalNode.removeAttribute("active");
      resolve();
    });
  }
}

export = Splash;
