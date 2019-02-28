/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// dojo
import * as i18n from "dojo/i18n!./nls/resources";

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

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

// esri.widgets.Expand
import Expand = require("esri/widgets/Expand");

// esri.core.Handles
import Handles = require("esri/core/Handles");

//esri.widgets.support
import {
  accessibleHandler,
  renderable,
  tsx,
  storeNode
} from "esri/widgets/support/widget";

// ScreenshotViewModel
import ScreenshotViewModel = require("./ScreenshotViewModel");

// FeatureWidget
import FeatureWidget = require("esri/widgets/Feature");

// esri.core.Collection
import Collection = require("esri/core/Collection");

// Interactive Legend
import InteractiveLegend = require("../../InteractiveLegend/InteractiveLegend");

// SelectedStyleData
import { SelectedStyleData } from "../../../interfaces/interfaces";

//----------------------------------
//
//  CSS Classes
//
//----------------------------------
const CSS = {
  base: "esri-screenshot",
  widget: "esri-widget",
  screenshotBtn: "esri-screenshot__btn",
  mainContainer: "esri-screenshot__main-container",
  panelTitle: "esri-screenshot__panel-title",
  panelSubTitle: "esri-screenshot__panel-subtitle",
  screenshotOption: "esri-screenshot__screenshot-option",
  buttonContainer: "esri-screenshot__screenshot-button-container",
  hide: "esri-screenshot--hide",
  screenshotCursor: "esri-screenshot__cursor",
  maskDiv: "esri-screenshot__mask-div",
  actionBtn: "esri-screenshot__action-btn",
  screenshotImg: "esri-screenshot__js-screenshot-image",
  screenshotDiv: "esri-screenshot__screenshot-div",
  screenshotImgContainer: "esri-screenshot__screenshot-img-container",
  downloadBtn: "esri-screenshot__download-btn",
  backBtn: "esri-screenshot__back-btn",
  showOverlay: "esri-screenshot--show-overlay",
  hideOverlay: "esri-screenshot--hide-overlay",
  mediaIcon: "icon-ui-media",
  pointerCursor: "esri-screenshot--pointer",
  disabledCursor: "esri-screenshot--disabled",
  tooltip: "tooltip",
  tooltipRight: "tooltip-right",
  modifierClass: "modifier-class",
  closeIcon: "icon-ui-close",
  fieldsetCheckbox: "fieldset-checkbox",
  button: "btn",
  buttonRed: "btn-red",
  alert: "alert",
  greenAlert: "alert-green",
  alertClose: "alert-close",
  popupAlert: "esri-screenshot__popup-alert",
  screenshotfieldSetCheckbox: "esri-screenshot__field-set-checkbox",
  offScreenPopupContainer: "esri-screenshot__offscreen-pop-up-container",
  offScreenLegendContainer: "esri-screenshot__offscreen-legend-container"
};

@subclass("ScreenshotPanel")
class ScreenshotPanel extends declared(Widget) {
  //----------------------------------
  //
  //  Variables
  //
  //----------------------------------

  // Stored Nodes
  private _maskNode: HTMLElement = null;
  private _screenshotImgNode: HTMLImageElement = null;
  private _downloadBtnNode: HTMLButtonElement = null;
  private _activeScreenshotBtnNode: HTMLButtonElement = null;
  private _selectFeatureAlertIsVisible: boolean = null;
  private _offscreenPopupContainer: HTMLElement = null;
  private _offscreenLegendContainer: HTMLElement = null;

  // _popupIsIncluded
  private _popupIsIncluded: boolean = null;

  // _handles
  private _handles: Handles = new Handles();

  //----------------------------------
  //
  //  Properties
  //
  //----------------------------------

  // view
  @aliasOf("viewModel.view")
  @property()
  view: MapView | SceneView = null;

  // mapComponentSelectors
  @aliasOf("viewModel.mapComponentSelectors")
  @property()
  mapComponentSelectors: string[] = [];

  // legendScreenshotEnabled
  @aliasOf("viewModel.legendScreenshotEnabled")
  @property()
  legendScreenshotEnabled: boolean = null;

  // popupScreenshotEnabled
  @aliasOf("viewModel.popupScreenshotEnabled")
  @property()
  popupScreenshotEnabled: boolean = null;

  // legendIncludedInScreenshot
  @aliasOf("viewModel.legendIncludedInScreenshot")
  @property()
  legendIncludedInScreenshot: boolean = null;

  // popupIncludedInScreenshot
  @aliasOf("viewModel.popupIncludedInScreenshot")
  @property()
  popupIncludedInScreenshot: boolean = null;

  @aliasOf("viewModel.featureWidget")
  @property()
  featureWidget: FeatureWidget = null;

  @aliasOf("viewModel.expandWidget")
  @property()
  expandWidget: Expand = null;

  @aliasOf("viewModel.legendWidget")
  @property()
  legendWidget: InteractiveLegend = null;

  @aliasOf("viewModel.selectedStyleData")
  @property()
  selectedStyleData: Collection<SelectedStyleData> = null;

  @aliasOf("viewModel.expandWidgetEnabled")
  @property()
  expandWidgetEnabled: boolean = null;

  // viewModel
  @property()
  @renderable([
    "viewModel.state",
    "viewModel.legendScreenshotEnabled",
    "viewModel.popupScreenshotEnabled",
    "viewModel.legendIncludedInScreenshot",
    "viewModel.popupIncludedInScreenshot",
    "viewModel.featureWidget",
    "viewModel.expandWidget",
    "viewModel.legendWidget",
    "viewModel.selectedStyleData",
    "viewModel.expandWidgetEnabled"
  ])
  viewModel: ScreenshotViewModel = new ScreenshotViewModel();

  //----------------------------------
  //
  //  Lifecycle Methods
  //
  //----------------------------------

  postInitialize() {
    this.own([
      this._watchPopups(),
      this._togglePopupAlert(),
      this._generateOffScreenPopup(),
      this._resetOffScreenPopup(),
      this._watchOffScreenPopup()
    ]);
  }

  render(): any {
    const { screenshotModeIsActive } = this.viewModel;
    const screenshotPanel = this._renderScreenshotPanel();
    const screenshotPreviewOverlay = this._renderScreenshotPreviewOverlay();
    const maskNode = this._renderMaskNode(screenshotModeIsActive);
    const offScreenNodes = this._renderOffScreenNodes();
    const optOutOfScreenshotButton = this._renderOptOutOfScreenshotButton();
    if (this.legendWidget && !this.legendWidget.container) {
      this.legendWidget.container = this._offscreenLegendContainer;
    }
    return (
      <div class={this.classes(CSS.widget, CSS.base)}>
        {screenshotModeIsActive ? optOutOfScreenshotButton : screenshotPanel}
        {screenshotPreviewOverlay}
        {maskNode}
        {offScreenNodes}
      </div>
    );
  }

  destroy() {
    this._handles.removeAll();
    this._handles.destroy();
    this._handles = null;
    this._maskNode = null;
    this._screenshotImgNode = null;
  }

  //----------------------------------
  //
  //  Public Methods
  //
  //----------------------------------

  // activateScreenshot
  @accessibleHandler()
  activateScreenshot(): void {
    if (this.viewModel.screenshotModeIsActive) {
      return;
    }
    this.viewModel.screenshotModeIsActive = true;
    this.view.container.classList.add(CSS.screenshotCursor);
    this.viewModel.dragHandler = this.view.on("drag", (event: Event) => {
      this.viewModel.setScreenshotArea(
        event,
        this._maskNode,
        this._screenshotImgNode,
        this.viewModel.dragHandler,
        this._downloadBtnNode
      );
    });
    this.scheduleRender();
  }

  // downloadImage
  @accessibleHandler()
  private _downloadImage() {
    this.viewModel.downloadImage();
  }

  //----------------------------------
  //
  //  Private Methods
  //
  //----------------------------------

  //----------------------------------
  //
  //  Render Node Methods
  //
  //----------------------------------

  // _renderScreenshotPanel
  private _renderScreenshotPanel(): any {
    const { screenshotTitle, screenshotSubtitle } = i18n;
    const fieldSet = this._renderFieldSet();
    const featureAlert = this._renderFeatureAlert();
    const setMapAreaButton = this._renderSetMapAreaButton();
    return (
      // screenshotBtn
      <div key="screenshot-panel" class={CSS.base}>
        {this._selectFeatureAlertIsVisible ? featureAlert : null}
        <div class={CSS.mainContainer}>
          <h1 class={CSS.panelTitle}>{screenshotTitle}</h1>
          {this.legendIncludedInScreenshot || this.popupIncludedInScreenshot ? (
            <h3 class={CSS.panelSubTitle}>{screenshotSubtitle}</h3>
          ) : null}
          {this.legendIncludedInScreenshot || this.popupIncludedInScreenshot
            ? fieldSet
            : null}
          {setMapAreaButton}
        </div>
      </div>
    );
  }

  // _renderFeatureAlert
  private _renderFeatureAlert(): any {
    const alertIsActive = {
      ["is-active"]: this._selectFeatureAlertIsVisible
    };
    return (
      <div
        key="feature-alert"
        class={this.classes(
          CSS.popupAlert,
          CSS.alert,
          CSS.greenAlert,
          CSS.modifierClass,
          alertIsActive
        )}
      >
        {i18n.selectAFeature}
        <button
          bind={this}
          onclick={this._removeSelectFeatureAlert}
          onkeydown={this._removeSelectFeatureAlert}
          class={CSS.alertClose}
        >
          <span class={CSS.closeIcon} />
        </button>
      </div>
    );
  }

  // _renderFieldSet
  private _renderFieldSet(): any {
    const { legend, popup } = i18n;
    return (
      <fieldset
        class={this.classes(
          CSS.fieldsetCheckbox,
          CSS.screenshotfieldSetCheckbox
        )}
      >
        {this.legendIncludedInScreenshot ? (
          <label class={CSS.screenshotOption}>
            {" "}
            <input
              bind={this}
              onclick={this._toggleLegend}
              onkeydown={this._toggleLegend}
              checked={this.legendScreenshotEnabled}
              type="checkbox"
            />
            {legend}
          </label>
        ) : null}
        {this.popupIncludedInScreenshot ? (
          <label class={CSS.screenshotOption}>
            <input
              bind={this}
              onclick={this._togglePopup}
              onkeydown={this._togglePopup}
              type="checkbox"
              checked={this.popupScreenshotEnabled}
            />
            {popup}
          </label>
        ) : null}
      </fieldset>
    );
  }

  // _renderSetMapAreaButton
  private _renderSetMapAreaButton(): any {
    const { setScreenshotArea } = i18n;
    return (
      <div class={CSS.buttonContainer}>
        <button
          bind={this}
          tabIndex={0}
          onclick={this.activateScreenshot}
          onkeydown={this.activateScreenshot}
          class={CSS.button}
          afterCreate={storeNode}
          data-node-ref="_activeScreenshotBtnNode"
          disabled={
            this.popupIncludedInScreenshot && this.popupScreenshotEnabled
              ? this.featureWidget && this.featureWidget.graphic
                ? false
                : true
              : false
          }
        >
          {setScreenshotArea}
        </button>
      </div>
    );
  }

  // _renderScreenshotPreviewOverlay
  private _renderScreenshotPreviewOverlay(): any {
    const { previewIsVisible } = this.viewModel;
    const overlayIsVisible = {
      [CSS.showOverlay]: previewIsVisible,
      [CSS.hideOverlay]: !previewIsVisible
    };
    const screenshotPreviewBtns = this._renderScreenshotPreviewBtns();
    return (
      <div class={this.classes(CSS.screenshotDiv, overlayIsVisible)}>
        <div class={CSS.screenshotImgContainer}>
          <div>
            <img
              bind={this}
              afterCreate={storeNode}
              data-node-ref="_screenshotImgNode"
              class={CSS.screenshotImg}
            />
            {screenshotPreviewBtns}
          </div>
        </div>
      </div>
    );
  }

  // _renderScreenshotPreviewBtns
  private _renderScreenshotPreviewBtns(): any {
    return (
      <div>
        <button
          bind={this}
          tabIndex={0}
          class={CSS.actionBtn}
          onclick={this._downloadImage}
          onkeydown={this._downloadImage}
          afterCreate={storeNode}
          data-node-ref="_downloadBtnNode"
          aria-label={i18n.downloadImage}
          title={i18n.downloadImage}
        >
          {i18n.downloadImage}
        </button>
        <button
          bind={this}
          tabIndex={0}
          class={this.classes(CSS.actionBtn, CSS.backBtn)}
          onclick={this._closePreview}
          onkeydown={this._closePreview}
        >
          {i18n.backButton}
        </button>
      </div>
    );
  }

  // _renderMaskNode
  private _renderMaskNode(screenshotModeIsActive: boolean): any {
    const maskDivIsHidden = {
      [CSS.hide]: !screenshotModeIsActive
    };
    return (
      <div
        bind={this}
        class={this.classes(CSS.maskDiv, maskDivIsHidden)}
        afterCreate={storeNode}
        data-node-ref="_maskNode"
      />
    );
  }

  // _renderOptOutOfScreenshotButton
  private _renderOptOutOfScreenshotButton(): any {
    return (
      <button
        bind={this}
        tabIndex={0}
        class={this.classes(
          CSS.screenshotBtn,
          CSS.pointerCursor,
          CSS.button,
          CSS.buttonRed
        )}
        onclick={this._deactivateScreenshot}
        onkeydown={this._deactivateScreenshot}
        title={i18n.deactivateScreenshot}
      >
        <span class={CSS.closeIcon} />
      </button>
    );
  }

  // _renderOffScreenNodes
  private _renderOffScreenNodes(): any {
    return (
      <div>
        <div
          bind={this}
          afterCreate={storeNode}
          data-node-ref="_offscreenPopupContainer"
          class={CSS.offScreenPopupContainer}
        />
        <div
          bind={this}
          afterCreate={storeNode}
          data-node-ref="_offscreenLegendContainer"
          class={CSS.offScreenLegendContainer}
        />
      </div>
    );
  }

  // End of render node methods

  // _deactivateScreenshot
  @accessibleHandler()
  private _deactivateScreenshot(): void {
    this.viewModel.screenshotModeIsActive = false;
    this.view.container.classList.remove(CSS.screenshotCursor);
    if (this.featureWidget && this.featureWidget.graphic) {
      this.featureWidget.graphic = null;
    }
    if (this.viewModel.dragHandler) {
      this.viewModel.dragHandler.remove();
      this.viewModel.dragHandler = null;
    }

    window.setTimeout(() => {
      this._activeScreenshotBtnNode.focus();
    }, 10);

    this.scheduleRender();
  }

  // _toggleLegend
  @accessibleHandler()
  private _toggleLegend(event: Event): void {
    const node = event.currentTarget as HTMLInputElement;
    this.legendScreenshotEnabled = node.checked;
    this.scheduleRender();
  }

  // _togglePopup
  @accessibleHandler()
  private _togglePopup(event: Event): void {
    const node = event.currentTarget as HTMLInputElement;
    this.popupScreenshotEnabled = node.checked;
    this.scheduleRender();
  }

  // _closePreview
  @accessibleHandler()
  private _closePreview(): void {
    const { viewModel } = this;
    viewModel.previewIsVisible = false;
    viewModel.screenshotModeIsActive = false;
    this.view.popup.clear();
    window.setTimeout(() => {
      this._activeScreenshotBtnNode.focus();
    }, 10);
    this.scheduleRender();
  }

  // _removeSelectFeatureAlert
  @accessibleHandler()
  private _removeSelectFeatureAlert(): void {
    this._selectFeatureAlertIsVisible = false;
    this.scheduleRender();
  }

  // _watchPopups
  private _watchPopups(): __esri.WatchHandle {
    return watchUtils.init(this, "view.popup.visible", () => {
      if (
        this._popupIsIncluded &&
        !this.view.popup.visible &&
        this.viewModel.dragHandler
      ) {
        this.viewModel.screenshotModeIsActive = false;
        this.view.container.classList.remove(CSS.screenshotCursor);
        this.scheduleRender();
      }
    });
  }

  // _togglePopupAlert
  private _togglePopupAlert(): __esri.WatchHandle {
    return watchUtils.watch(this, "popupScreenshotEnabled", () => {
      if (this.popupScreenshotEnabled && this.popupIncludedInScreenshot) {
        if (!this.featureWidget) {
          this._selectFeatureAlertIsVisible = true;
        } else {
          this._selectFeatureAlertIsVisible = false;
        }
      } else {
        this._selectFeatureAlertIsVisible = false;
      }
      this.scheduleRender();
    });
  }

  // _generateOffScreenPopup
  private _generateOffScreenPopup(): __esri.WatchHandle {
    return watchUtils.watch(this, "view.popup.visible", () => {
      if (!this.view) {
        return;
      }
      if (this.view.popup.visible && this._offscreenPopupContainer) {
        if (!this.featureWidget) {
          this.featureWidget = new FeatureWidget({
            container: this._offscreenPopupContainer,
            graphic: this.view.popup.selectedFeature
          });
          this._selectFeatureAlertIsVisible = false;
        }
      }
    });
  }

  // _watchOffScreenPopup
  private _watchOffScreenPopup(): __esri.WatchHandle {
    return watchUtils.watch(this, "featureWidget", () => {
      if (!this.featureWidget) {
        this._selectFeatureAlertIsVisible = true;
      } else {
        this._selectFeatureAlertIsVisible = false;
      }
    });
  }

  // _resetOffScreenPopup
  private _resetOffScreenPopup(): __esri.WatchHandle {
    return watchUtils.whenFalse(
      this,
      "viewModel.screenshotModeIsActive",
      () => {
        if (this._offscreenPopupContainer.hasChildNodes()) {
          this._offscreenPopupContainer.removeChild(
            this._offscreenPopupContainer.children[0]
          );
        }
        this.featureWidget = null;
        this.scheduleRender();
      }
    );
  }
}

export = ScreenshotPanel;
