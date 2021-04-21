import { subclass, property } from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import AppConfig from "../ConfigurationSettings/ConfigurationSettings";
import i18n = require("dojo/i18n!../nls/resources");
import { storeNode, tsx } from "esri/widgets/support/widget";

const CSS = {
  base: "esri-interactive-legend-ga-alert",
  optOutButton: "esri-interactive-legend__opt-out-button"
};

@subclass("Alert")
class Alert extends Widget {
  constructor(params) {
    super(params);
  }

  private _alertNode: any = null;

  @property()
  portal: __esri.Portal = null;

  @property()
  config: AppConfig;

  @property()
  appName: string = "interactivelegend";

  render() {
    const enableGA =
      localStorage.getItem(`analytics-opt-in-${this.appName}`) || false;

    const {
      googleAnalytics,
      googleAnalyticsKey,
      googleAnalyticsConsent,
      googleAnalyticsConsentMsg
    } = this.config;
    const isActive =
      googleAnalytics &&
      googleAnalyticsKey !== null &&
      googleAnalyticsConsent &&
      !enableGA
        ? true
        : false;
    return (
      <div bind={this}>
        <calcite-alert
          afterCreate={storeNode}
          bind={this}
          data-node-ref="_alertNode"
          intl-close={i18n.close}
          scale="s"
          active={isActive}
          class={CSS.base}
          theme={this.config?.theme === "dark" ? "dark" : "light"}
        >
          <div slot="alert-message" innerHTML={googleAnalyticsConsentMsg}></div>
          <calcite-button
            scale="s"
            slot="alert-link"
            bind={this}
            afterCreate={this.handleClick}
            class={CSS.optOutButton}
          >
            {i18n.webAnalytics.optIn}
          </calcite-button>
        </calcite-alert>
      </div>
    );
  }

  handleClick(element) {
    element.addEventListener("click", () => {
      // Add opt-in value to local storage
      localStorage.setItem(`analytics-opt-in-${this.appName}`, "true");
      // update config setting to trigger GA reset and
      // prevent dialog from showing
      this.config.googleAnalyticsConsent = false;
    });
  }
}

export = Alert;
