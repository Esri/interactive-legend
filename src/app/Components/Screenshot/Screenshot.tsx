/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// dojo
import * as i18n from "dojo/i18n!./Screenshot/nls/resources";

// esri.widgets.Widget
import Widget = require("esri/widgets/Widget");

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property,
  aliasOf
} from "esri/core/accessorSupport/decorators";

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.views.SceneView
import SceneView = require("esri/views/SceneView");

// esri.widgets.Expand
import Expand = require("esri/widgets/Expand");

// ScreenshotView
import ScreenshotView = require("./Screenshot/ScreenshotView");

// esri.core.watchUtils.
import watchUtils = require("esri/core/watchUtils");

// esri.core.Collection
import Collection = require("esri/core/Collection");

// esri.core.Handles
import Handles = require("esri/core/Handles");

import { SelectedStyleData } from "../../interfaces/interfaces";

const CSS = {
  screenshotCursor: "esri-screenshot__cursor",
  mediaIcon: "icon-ui-media"
};

@subclass("Screenshot")
class Screenshot extends declared(Widget) {
  constructor(value: any) {
    super();
  }

  // _handles
  private _handles: Handles = new Handles();

  // view
  @aliasOf("screenshotView.view")
  @property()
  view: MapView | SceneView = null;

  // legendIncludedInScreenshot
  @aliasOf("screenshotView.legendIncludedInScreenshot")
  @property()
  legendIncludedInScreenshot: boolean = null;

  // popupIncludedInScreenshot
  @aliasOf("screenshotView.popupIncludedInScreenshot")
  @property()
  popupIncludedInScreenshot: boolean = null;

  // selectedStyleData
  @aliasOf("screenshotView.selectedStyleData")
  @property()
  selectedStyleData: Collection<SelectedStyleData> = null;

  // expandWidgetEnabled
  @aliasOf("screenshotView.expandWidgetEnabled")
  @property()
  expandWidgetEnabled: boolean = null;

  // expandWidget
  @aliasOf("screenshotView.expandWidget")
  @property()
  expandWidget: Expand = null;

  // iconClass
  @property()
  iconClass = CSS.mediaIcon;

  // label
  @property()
  label = i18n.widgetLabel;

  // screenshotView
  @property()
  screenshotView: ScreenshotView = new ScreenshotView();

  postInitialize() {
    this.own([this._watchScreenshotViewProperties()]);

    if (this.expandWidgetEnabled) {
      this._watchScreenshotView();
    }
  }

  render() {
    return this.screenshotView
      ? this.expandWidgetEnabled
        ? this.expandWidget.render()
        : this.screenshotView.render()
      : this.screenshotView.render();
  }

  // _watchScreenshotViewProperties
  private _watchScreenshotViewProperties(): __esri.WatchHandle {
    return watchUtils.init(
      this,
      [
        "view",
        "legendIncludedInScreenshot",
        "popupIncludedInScreenshot",
        "selectedStyleData",
        "expandWidgetEnabled"
      ],
      () => {
        const { screenshotView } = this;
        screenshotView.view = this.view;
        screenshotView.legendIncludedInScreenshot = this.legendIncludedInScreenshot;
        screenshotView.popupIncludedInScreenshot = this.popupIncludedInScreenshot;
        screenshotView.selectedStyleData = this.selectedStyleData;
        screenshotView.expandWidgetEnabled = this.expandWidgetEnabled;
      }
    );
  }

  // _watchScreenshotView
  private _watchScreenshotView(): void {
    this.own([
      watchUtils.when(this, "screenshotView", () => {
        this.expandWidget = new Expand({
          view: this.view,
          content: this.screenshotView,
          expandIconClass: CSS.mediaIcon
        });
        this._handleExpandWidget();
      })
    ]);
  }

  // _handleExpandWidget
  private _handleExpandWidget(): void {
    const expandWidgetKey = "expand-widget";
    this._handles.remove(expandWidgetKey);
    this._handles.add(
      watchUtils.when(this, "expandWidget", () => {
        if (this.expandWidget) {
          const screenshotModeIsActiveKey = "screenshot-active";

          this._handles.remove(screenshotModeIsActiveKey);
          this._handles.add(
            watchUtils.whenTrue(
              this,
              "screenshotView.viewModel.screenshotModeIsActive",
              () => {
                const expandedKey = "expanded";
                this._handles.remove(expandedKey);
                this._handles.add(
                  watchUtils.whenFalse(this, "expandWidget.expanded", () => {
                    this.screenshotView.viewModel.screenshotModeIsActive = false;
                    this.view.container.classList.remove(CSS.screenshotCursor);
                    if (
                      this.screenshotView.featureWidget &&
                      this.screenshotView.featureWidget.graphic
                    ) {
                      this.screenshotView.featureWidget.graphic = null;
                    }
                    if (this.screenshotView.viewModel.dragHandler) {
                      this.screenshotView.viewModel.dragHandler.remove();
                      this.screenshotView.viewModel.dragHandler = null;
                    }
                    if (this.expandWidget) {
                      this.expandWidget.expanded = false;
                    }
                    this.scheduleRender();
                  }),
                  expandedKey
                );
              }
            ),
            screenshotModeIsActiveKey
          );
        }
      }),
      expandWidgetKey
    );
  }
}

export = Screenshot;
