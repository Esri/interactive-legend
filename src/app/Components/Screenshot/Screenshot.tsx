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

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

// esri.widgets.Feature
import Feature = require("esri/widgets/Feature");

//esri.widgets.support
import {
  accessibleHandler,
  renderable,
  tsx,
  storeNode
} from "esri/widgets/support/widget";

// ScreenshotViewModel
import ScreenshotViewModel = require("./Screenshot/ScreenshotViewModel");

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
  buttonRed: "btn-red"
};

@subclass("Screenshot")
class Screenshot extends declared(Widget) {
  //----------------------------------
  //
  //  Variables
  //
  //----------------------------------

  // Stored Nodes
  private _maskNode: HTMLElement = null;
  private _screenshotImgNode: HTMLImageElement = null;

  // _dragHandler
  private _dragHandler: any = null;

  // _popupIsIncluded
  private _popupIsIncluded: boolean = null;

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

  // iconClass
  @property()
  iconClass = CSS.mediaIcon;

  // label
  @property()
  label = i18n.widgetLabel;

  // legendScreenshotEnabled
  @aliasOf("viewModel.legendScreenshotEnabled")
  @property()
  legendScreenshotEnabled: boolean = null;

  // popupScreenshotEnabled
  @aliasOf("viewModel.popupScreenshotEnabled")
  @property()
  popupScreenshotEnabled: boolean = null;

  // legendIncludedInScreenshot
  @property()
  legendIncludedInScreenshot: boolean = null;

  // popupIncludedInScreenshot
  @property()
  popupIncludedInScreenshot: boolean = null;

  @property()
  featureWidget: Feature = null;

  // viewModel
  @property()
  @renderable(["viewModel.state"])
  viewModel: ScreenshotViewModel = new ScreenshotViewModel();

  //----------------------------------
  //
  //  Lifecycle Methods
  //
  //----------------------------------

  constructor(value: any) {
    super();
  }

  postInitialize() {
    this.own([this._watchMapComponentSelectors(), this._watchPopups()]);
  }

  render(): any {
    const { screenshotModeIsActive } = this.viewModel;
    const screenshotPreviewOverlay = this._renderScreenshotPreviewOverlay();
    const maskNode = this._renderMaskNode(screenshotModeIsActive);

    return (
      <div class={this.classes(CSS.widget, CSS.base)}>
        {screenshotModeIsActive ? (
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
        ) : (
          this._renderScreenshotPanel()
        )}

        {screenshotPreviewOverlay}
        {maskNode}
      </div>
    );
  }

  destroy() {
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
    this._dragHandler = this.view.on("drag", (event: Event) => {
      this.viewModel.setScreenshotArea(
        event,
        this._maskNode,
        this._screenshotImgNode,
        this._dragHandler
      );
    });
    this.scheduleRender();
  }

  // downloadImage
  @aliasOf("viewModel.downloadImage")
  @accessibleHandler()
  downloadImage: () => void;

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

  // _renderScreenshotPreviewBtns
  private _renderScreenshotPreviewBtns(): any {
    return (
      <div>
        <button
          bind={this}
          tabIndex={0}
          class={this.classes(CSS.actionBtn)}
          onclick={this.downloadImage}
          onkeydown={this.downloadImage}
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

  // _renderScreenshotPanel
  private _renderScreenshotPanel(): any {
    const {
      screenshotTitle,
      screenshotSubtitle,
      setScreenshotArea,
      selectAFeature
    } = i18n;
    return (
      // screenshotBtn
      <div key="screenshot-panel" class={CSS.mainContainer}>
        <h1 class={CSS.panelTitle}>{screenshotTitle}</h1>
        {this.legendIncludedInScreenshot || this.popupIncludedInScreenshot ? (
          <h3 class={CSS.panelSubTitle}>{screenshotSubtitle}</h3>
        ) : null}
        {this.legendIncludedInScreenshot || this.popupIncludedInScreenshot ? (
          <fieldset class={CSS.fieldsetCheckbox}>
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
                Legend
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
                Popup
              </label>
            ) : null}
          </fieldset>
        ) : null}
        <div class={CSS.buttonContainer}>
          <button
            bind={this}
            onclick={this.activateScreenshot}
            onkeydown={this.activateScreenshot}
            disabled={
              this.popupIncludedInScreenshot && this.popupScreenshotEnabled
                ? this.featureWidget && this.featureWidget.graphic
                  ? false
                  : true
                : false
            }
            class={CSS.button}
          >
            {this.popupIncludedInScreenshot && this.popupScreenshotEnabled
              ? this.featureWidget && this.featureWidget.graphic
                ? setScreenshotArea
                : selectAFeature
              : setScreenshotArea}
          </button>
        </div>
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

  // End of render node methods

  // _watchMapComponentSelectors
  private _watchMapComponentSelectors(): __esri.WatchHandle {
    return watchUtils.init(this, "mapComponentSelectors", () => {
      if (this.mapComponentSelectors === null) {
        this.mapComponentSelectors = [];
      }
      if (this.mapComponentSelectors.length === 0) {
        return;
      }
      this.mapComponentSelectors.forEach((componentSelector: string) => {
        if (componentSelector.indexOf("popup") !== -1) {
          this._popupIsIncluded = true;
          this.scheduleRender();
        }
      });
    });
  }

  // _watchPopups
  private _watchPopups(): __esri.WatchHandle {
    return watchUtils.init(this, "view.popup.visible", () => {
      if (
        this._popupIsIncluded &&
        !this.view.popup.visible &&
        this._dragHandler
      ) {
        this.viewModel.screenshotModeIsActive = false;
        this.view.container.classList.remove(CSS.screenshotCursor);
        this.scheduleRender();
      }
    });
  }

  // _deactivateScreenshot
  @accessibleHandler()
  private _deactivateScreenshot(): void {
    this.viewModel.screenshotModeIsActive = false;
    this.view.container.classList.remove(CSS.screenshotCursor);
    if (this.featureWidget && this.featureWidget.graphic) {
      this.featureWidget.graphic = null;
    }
    this._dragHandler.remove();
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
    this.scheduleRender();
  }
}

export = Screenshot;
