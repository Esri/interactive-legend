import { property, subclass } from "esri/core/accessorSupport/decorators";

import {
  FilterMode,
  IExtentSelectorOutput,
  ITimeFilterConfigItem
} from "../interfaces/interfaces";
import ConfigurationSettingsBase = require("TemplatesCommonLib/baseClasses/configurationSettingsBase");

@subclass("app.ConfigurationSettings")
class ConfigurationSettings extends ConfigurationSettingsBase {
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
  includeLegendInScreenshot: boolean;

  @property()
  includePopupInScreenshot: boolean;

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
  basemapSelector: string;

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
  interactiveLegendPosition: string | { index: 0; position: string };

  @property()
  infoPanel: boolean;

  @property()
  infoPanelPosition: string;

  @property()
  splash: boolean;

  @property()
  splashButtonPosition: string;

  @property()
  theme: string;

  @property()
  googleAnalytics: boolean = null;

  @property()
  googleAnalyticsKey: string = null;

  @property()
  googleAnalyticsConsent: boolean = null;

  @property()
  googleAnalyticsConsentMsg: string = null;

  @property()
  extentSelector: boolean = null;

  @property()
  extentSelectorConfig: IExtentSelectorOutput = null;

  @property()
  share = null;

  @property()
  sharePosition = null;

  @property()
  timeFilter: boolean = null;

  @property()
  timeFilterPosition: string;

  @property()
  bookmarks: boolean = null;

  @property()
  bookmarksPosition: string;

  @property()
  timeFilterConfig: ITimeFilterConfigItem[] = null;

  @property()
  mapA11yDesc: string = null;
}
export = ConfigurationSettings;
