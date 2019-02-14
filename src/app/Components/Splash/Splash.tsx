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
declare var calcite: any;
@subclass("app.Splash")
class Splash extends declared(Widget) {
  constructor(params) {
    super(params);
    this.config = params.config;
  }
  @property()
  @renderable()
  config: ApplicationConfig;

  @property()
  @renderable()
  modalId: string = "splash";

  render() {
    calcite.init();
    const description = this.config.splashContent ? (
      <span innerHTML={this.config.splashContent} />
    ) : null;

    const splashContent = (
      <div
        class="js-modal modal-overlay modifier-class"
        data-modal={this.modalId}
      >
        <div
          class="modal-content column-12 app-body"
          role="dialog"
          aria-labelledby="modal"
        >
          <h3 class="trailer-half">{this.config.splashTitle}</h3>
          <p>{description}</p>
          <div class="text-right">
            <button class="btn btn-clear js-modal-toggle app-button">
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
    const headerButtonClasses = [
      "js-modal-toggle",
      "esri-widget",
      "esri-widget--button",
      "icon-ui-flush",
      "icon-ui-description"
    ];

    splashButton.classList.add(...headerButtonClasses);

    return splashButton;
  }

  public showSplash() {
    if (this.config.splashOnStart) {
      // enable splash screen when app loads then
      // set info in session storage when its closed
      // so we don't open again this session.
      if (!sessionStorage.getItem("disableSplash")) {
        calcite.bus.emit("modal:open", { id: this.modalId });
      }
      sessionStorage.setItem("disableSplash", "true");
    }
  }
}

export default Splash;
