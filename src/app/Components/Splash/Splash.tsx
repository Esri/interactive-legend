import i18n = require("dojo/i18n!./../nls/resources");
import {
  subclass,
  property
} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");

import { renderable, tsx } from "esri/widgets/support/widget";

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.views.SceneView
import SceneView = require("esri/views/SceneView");
import { attachToNode } from "../InteractiveLegend/InteractiveLegend/support/styleUtils";

import { when, watch } from "esri/core/watchUtils";

const CSS = {
  jsModal: "js-modal",
  modalOverlay: "modal-overlay",
  modifierClass: "modifier-class",
  modalContent: "modal-content",
  column12: "column-12",
  appBody: "app-body",
  trailerHalf: "trailer-half",
  textRight: "text-right",
  btn: "btn",
  btnClear: "btn-clear",
  jsModalToggle: "js-modal-toggle",
  appButton: "app-button",
  jsModalButton: "js-modal-toggle",
  esriWidget: "esri-widget",
  esriWidgetButton: "esri-widget--button",
  flushIcon: "icon-ui-flush",
  descriptionIcon: "icon-ui-description",
  splashButtonStyles: "splash-button"
};

declare var calcite: any;
@subclass("Splash")
class Splash extends Widget {
  private _calcite: any = null;
  private _splashContentNode = null;

  constructor(params: any) {
    super(params);
  }

  @property()
  @renderable()
  view: MapView | SceneView = null;

  @property()
  @renderable()
  splashButtonText: string = null;

  @property()
  @renderable()
  splashContent: string = null;

  @property()
  @renderable()
  splashOnStart: boolean = null;

  @property()
  @renderable()
  splashTitle: string = null;

  @property({
    readOnly: true
  })
  readonly modalId: string = "splash";

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
    if (!this._calcite) {
      this._calcite = calcite.init();
    }
    const { splashTitle, splashButtonText } = this;
    return (
      <div
        class={this.classes(CSS.jsModal, CSS.modalOverlay, CSS.modifierClass)}
        data-modal={this.modalId}
        afterCreate={() => {
          if (this.splashOnStart && !sessionStorage.getItem("disableSplash")) {
            calcite.bus.emit("modal:open", { id: this.modalId });
            sessionStorage.setItem("disableSplash", "true");
          }
        }}
      >
        <div
          class={this.classes(CSS.modalContent, CSS.column12, CSS.appBody)}
          role="dialog"
          aria-labelledby="modal"
        >
          <h3 class={CSS.trailerHalf}>{splashTitle}</h3>
          {this._splashContentNode ? (
            <p bind={this._splashContentNode} afterCreate={attachToNode} />
          ) : null}
          <div class={CSS.textRight}>
            <button
              class={this.classes(
                CSS.btn,
                CSS.btnClear,
                CSS.jsModalToggle,
                CSS.appButton
              )}
            >
              {splashButtonText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  createToolbarButton(): HTMLButtonElement {
    // add a button to the app that toggles the splash and setup to add to the view
    const splashButton = document.createElement("button");
    splashButton.setAttribute("data-modal", this.modalId);
    splashButton.id = this.modalId;
    const {
      jsModalToggle,
      esriWidget,
      esriWidgetButton,
      flushIcon,
      descriptionIcon,
      splashButtonStyles
    } = CSS;

    const headerButtonClasses = [
      jsModalToggle,
      esriWidget,
      esriWidgetButton,
      splashButtonStyles
    ];

    const iconClasses = [descriptionIcon, flushIcon];
    headerButtonClasses.forEach(className => {
      splashButton.classList.add(className);
    });
    const spanElement = document.createElement("span");
    iconClasses.forEach(className => {
      spanElement.classList.add(className);
    });
    splashButton.appendChild(spanElement);
    return splashButton;
  }

  private _handleSplashContent(): void {
    const content = document.createElement("div");
    content.innerHTML = this.splashContent;
    this._splashContentNode = content;
    this.scheduleRender();
  }
}

export = Splash;
