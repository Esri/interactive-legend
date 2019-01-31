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
  screenshotBtn: "esri-screenshot__btn",
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
  closeIcon: "icon-ui-close"
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

  // viewModel
  @property()
  @renderable(["viewModel.state"])
  viewModel: ScreenshotViewModel = new ScreenshotViewModel();

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
    const screenshotBtn = this._renderScreenshotBtn(screenshotModeIsActive);
    const screenshotPreviewOverlay = this._renderScreenshotPreviewOverlay();
    const maskNode = this._renderMaskNode(screenshotModeIsActive);
    return (
      <div class={CSS.base}>
        {screenshotModeIsActive ? (
          <button
            bind={this}
            tabIndex={0}
            class={this.classes(CSS.screenshotBtn, CSS.pointerCursor)}
            onclick={this._deactivateScreenshot}
            onkeydown={this._deactivateScreenshot}
            title={i18n.deactivateScreenshot}
          >
            <span class={CSS.closeIcon} />
          </button>
        ) : (
          screenshotBtn
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
    this.mapComponentSelectors.forEach((mapComponents: string) => {
      if (mapComponents.indexOf("popup") !== -1) {
        this.view.popup.dockEnabled = true;
      }
    });
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

  // _renderScreenshotBtn
  private _renderScreenshotBtn(screenshotModeIsActive: boolean): any {
    const cursorStyles = {
      [CSS.disabledCursor]: screenshotModeIsActive,
      [CSS.pointerCursor]: !screenshotModeIsActive
    };

    return (
      <button
        bind={this}
        tabIndex={!screenshotModeIsActive ? 0 : -1}
        class={this.classes(CSS.screenshotBtn, cursorStyles)}
        onclick={this.activateScreenshot}
        title={i18n.widgetLabel}
      >
        <span class={CSS.mediaIcon} />
      </button>
    );
  }

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

  // _closePreview
  private _closePreview(): void {
    const { viewModel } = this;
    viewModel.previewIsVisible = false;
    viewModel.screenshotModeIsActive = false;
    this.scheduleRender();
  }

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
  private _deactivateScreenshot(): void {
    this.viewModel.screenshotModeIsActive = false;
    this.view.container.classList.remove(CSS.screenshotCursor);
    this._dragHandler.remove();
    this.scheduleRender();
  }
}

export = Screenshot;
