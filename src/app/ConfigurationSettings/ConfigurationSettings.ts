import {
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

import Accessor = require("esri/core/Accessor");
import { ApplicationConfig } from "../application-base-js/interfaces";
import { FilterMode } from "../interfaces/interfaces";

@subclass("app.ConfigurationSettings")
class ConfigurationSettings extends Accessor {
  @property()
  applySharedTheme: boolean;

  @property()
  screenshot: boolean;

  @property()
  screenshotPosition: string;

  @property()
  enablePopupOption: boolean;

  @property()
  enableLegendOption: boolean;

  @property()
  muteOpacity: number;

  @property()
  muteGrayScale: number;

  @property()
  splashOnStart: boolean;

  @property()
  splashTitle: string;

  @property()
  splashContent: string;

  @property()
  splashButtonText: string;

  @property()
  customCSS: string;

  @property()
  customHeaderHTML: string;

  @property()
  customHeader: boolean;

  @property()
  customUrlParam: any;

  @property()
  customURLParamName: any;

  @property()
  title: string;

  @property()
  home: boolean;

  @property()
  homePosition: string;

  @property()
  mapZoom: boolean;

  @property()
  mapZoomPosition: string;

  @property()
  basemapToggle: boolean;

  @property()
  basemapTogglePosition: string;

  @property()
  nextBasemap: string;

  @property()
  search: boolean;

  @property()
  searchPosition: string;

  @property()
  searchOpenAtStart: boolean;

  @property()
  searchConfiguration: any;

  @property()
  layerList: boolean;

  @property()
  layerListPosition: string;

  @property()
  filterMode: FilterMode;

  @property()
  featureCount: boolean;

  @property()
  updateExtent: boolean;

  @property()
  interactiveLegendPosition: string;

  @property()
  infoPanel: boolean;

  @property()
  infoPanelPosition: string;

  @property()
  splash: boolean;

  @property()
  splashButtonPosition: string;

  @property()
  withinConfigurationExperience: boolean =
    window.location !== window.parent.location;

  _storageKey = "config-values";
  _draft: ApplicationConfig = null;
  _draftMode: boolean = false;
  constructor(params?: ApplicationConfig) {
    super(params);
    this._draft = params?.draft;
    this._draftMode = params?.mode === "draft";
  }
  initialize() {
    if (this.withinConfigurationExperience || this._draftMode) {
      // Apply any draft properties
      if (this._draft) {
        Object.assign(this, this._draft);
      }

      window.addEventListener(
        "message",
        function(e) {
          this._handleConfigurationUpdates(e);
        }.bind(this),
        false
      );
    }
  }

  _handleConfigurationUpdates(e) {
    if (e?.data?.type === "cats-app") {
      Object.assign(this, e.data);
    }
  }
}
export = ConfigurationSettings;
