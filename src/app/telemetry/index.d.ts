declare module "telemetry/telemetry.dojo" {
  import Portal = require("esri/portal/Portal");

  class Telemetry {
    disabled: boolean;
    logPageView(): void;
    logEvent(args: {
      category: string;
      action: string;
      label: string;
      datasetID?: string;
      attribute?: string;
      user?: string;
    }): void;
    logError(args: {
      error: string;
      urlRequested?: string;
      statusCode?: number;
    }): void;
    constructor(args: {
      debug?: boolean;
      disabled?: boolean;
      amazon?: {
        userPoolID: string;
        app: {
          name: string;
          id: string;
          version: string;
        };
      };
      portal?: Portal;
    });
  }
  export = Telemetry;
}
