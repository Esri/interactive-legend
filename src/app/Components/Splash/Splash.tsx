/// <amd-dependency path="esri/core/tsSupport/assignHelper" name="__assign" />
/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import i18n = require("dojo/i18n!./../nls/resources");
import {
  subclass,
  declared,
  property
} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");

import { ApplicationConfig } from "ApplicationBase/interfaces";
import { renderable, tsx } from "esri/widgets/support/widget";

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.views.SceneView
import SceneView = require("esri/views/SceneView");

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
class Splash extends declared(Widget) {
  constructor(params: any) {
    super(params);
    this.config = params.config;
  }

  private _calcite: any = null;

  @property()
  @renderable()
  view: MapView | SceneView = null;

  @property()
  @renderable()
  config: ApplicationConfig;

  @property()
  @renderable()
  modalId: string = "splash";

  render() {
    const description = this.config.splashContent ? (
      <span innerHTML={this.config.splashContent} />
    ) : null;
    if (!this._calcite) {
      this._calcite = calcite.init();
    }

    const splashContent = (
      <div
        class={this.classes(CSS.jsModal, CSS.modalOverlay, CSS.modifierClass)}
        data-modal={this.modalId}
      >
        <div
          class={this.classes(CSS.modalContent, CSS.column12, CSS.appBody)}
          role="dialog"
          aria-labelledby="modal"
        >
          <h3 class={CSS.trailerHalf}>{this.config.splashTitle}</h3>
          <p>{description}</p>
          <div class={CSS.textRight}>
            <button
              class={this.classes(
                CSS.btn,
                CSS.btnClear,
                CSS.jsModalToggle,
                CSS.appButton
              )}
            >
              {this.config.splashButtonText}
            </button>
          </div>
        </div>
      </div>
    );

    return <div>{splashContent}</div>;
  }

  public createToolbarButton(): HTMLButtonElement {
    // add a button to the app that toggles the splash and setup to add to the view
    const splashButton = document.createElement("button");
    splashButton.setAttribute("data-modal", this.modalId);
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

  public showSplash() {
    if (this.config.splash) {
      // enable splash screen when app loads then
      // set info in session storage when its closed
      // so we don't open again this session.
      if (this.config.splashOnStart) {
        calcite.bus.emit("modal:open", { id: this.modalId });
      } else {
        if (!sessionStorage.getItem("disableSplash")) {
          calcite.bus.emit("modal:open", { id: this.modalId });
        }
        sessionStorage.setItem("disableSplash", "true");
      }
    }
  }
}

export default Splash;
