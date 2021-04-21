// dojo
import i18n from "dojo/i18n!./Screenshot/nls/resources";

// esri.widgets.Widget
import Widget = require("esri/widgets/Widget");

// esri.core.accessorSupport
import {
  subclass,
  property,
  aliasOf
} from "esri/core/accessorSupport/decorators";

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.views.SceneView
import SceneView = require("esri/views/SceneView");

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

// esri.core.Handles
import Handles = require("esri/core/Handles");

// esri.widgets.support
import { accessibleHandler, tsx, storeNode } from "esri/widgets/support/widget";

// ScreenshotViewModel
import ScreenshotViewModel = require("./Screenshot/ScreenshotViewModel");

// Legend
import Legend = require("esri/widgets/Legend");

// FeatureWidget
import FeatureWidget = require("esri/widgets/Feature");

import SelectedStyleData = require("../InteractiveLegend/InteractiveLegend/styles/InteractiveStyle/SelectedStyleData");

// ----------------------------------
//
//  CSS Classes
//
// ----------------------------------
const CSS = {
  base: "esri-screenshot",
  widget: "esri-widget esri-widget--panel",
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
  pointerCursor: "esri-screenshot--pointer",
  disabledCursor: "esri-screenshot--disabled",
  featureWarning: "esri-screenshot__feature-warning",
  featureWarningTextContainer:
    "esri-screenshot__feature-warning-text-container",
  warningSVG: "esri-screenshot__warning-svg",
  selectFeatureText: "esri-screenshot__select-feature-text",
  screenshotfieldSetCheckbox: "esri-screenshot__field-set-checkbox",
  offScreenPopupContainer: "esri-screenshot__offscreen-pop-up-container",
  offScreenLegendContainer: "esri-screenshot__offscreen-legend-container",
  screenshotClose: "esri-screenshot__close-button",
  closeButtonContainer: "esri-screenshot__close-button-container",
  screenshotPreviewContainer: "esri-screenshot__img-preview-container",
  selectLayout: "esri-screenshot__select-layout"
};

@subclass("Screenshot")
class Screenshot extends Widget {
  constructor(value?: any) {
    super(value);
  }
  // ----------------------------------
  //
  //  Variables
  //
  // ----------------------------------

  // Stored Nodes
  private _maskNode: HTMLElement = null;
  private _screenshotImgNode: HTMLImageElement = null;
  private _downloadBtnNode: HTMLButtonElement = null;
  private _activeScreenshotBtnNode: HTMLButtonElement = null;
  private _selectFeatureAlertIsVisible: boolean = null;
  private _offscreenPopupContainer: HTMLElement = null;
  private _offscreenLegendContainer: HTMLElement = null;

  private _elementOptions: {
    legend?: boolean;
    popup?: boolean;
    custom?: boolean;
  } = {};

  // _handles
  private _handles: Handles = new Handles();

  // ----------------------------------
  //
  //  Properties
  //
  // ----------------------------------

  @aliasOf("viewModel.custom")
  custom: { label: string; element: HTMLElement } = null;

  @aliasOf("viewModel.includeCustomInScreenshot")
  @property()
  includeCustomInScreenshot: boolean = null;

  // view
  @aliasOf("viewModel.view")
  @property()
  view: MapView | SceneView = null;

  // includeLegendInScreenshot
  @aliasOf("viewModel.includeLegendInScreenshot")
  @property()
  includeLegendInScreenshot: boolean = null;

  // includePopupInScreenshot
  @aliasOf("viewModel.includePopupInScreenshot")
  @property()
  includePopupInScreenshot: boolean = null;

  // enableLegendOption
  @aliasOf("viewModel.enableLegendOption")
  enableLegendOption: boolean = null;

  // enablePopupOption
  @aliasOf("viewModel.enablePopupOption")
  enablePopupOption: boolean = null;

  @aliasOf("viewModel.featureWidget")
  @property({
    readOnly: true
  })
  featureWidget: FeatureWidget = null;

  @aliasOf("viewModel.legendWidget")
  @property({
    readOnly: true
  })
  legendWidget: Legend = null;

  @property()
  theme = "light";

  // screenshotModeIsActive
  @aliasOf("viewModel.screenshotModeIsActive")
  @property()
  screenshotModeIsActive: boolean = null;

  // selectedStyleData
  @aliasOf("viewModel.selectedStyleData")
  @property()
  selectedStyleData: __esri.Collection<SelectedStyleData> = null;

  // layerListViewModel
  @aliasOf("viewModel.layerListViewModel")
  @property()
  layerListViewModel: __esri.LayerListViewModel = null;

  // legendFeatureCountEnabled
  @aliasOf("viewModel.legendFeatureCountEnabled")
  @property()
  legendFeatureCountEnabled: boolean = null;

  // iconClass
  @property()
  iconClass = "esri-icon-media";

  // label
  @property()
  label = i18n.widgetLabel;

  @property()
  includeLayoutOption: boolean = null;

  @aliasOf("viewModel.outputLayout")
  @property()
  outputLayout: "vertical" | "horizontal" = null;

  @aliasOf("viewModel.previewTitleInputNode")
  @property()
  previewTitleInputNode: HTMLInputElement = null;

  @property()
  previewContainer: HTMLDivElement = null;

  // viewModel
  @property()
  viewModel: ScreenshotViewModel = new ScreenshotViewModel();

  // ----------------------------------
  //
  //  Lifecycle Methods
  //
  // ----------------------------------

  postInitialize() {
    this.own([
      this._togglePopupAlert(),
      this._generateOffScreenPopup(),
      this._watchSelectedFeature(),
      watchUtils.when(
        this,
        ["enableLegendOption", "enablePopupOption", "custom"],
        () => {
          if (this.enableLegendOption) {
            this._elementOptions.legend = this.includeLegendInScreenshot;
          }
          if (this.enablePopupOption) {
            this._elementOptions.popup = this.includePopupInScreenshot;
          }
          if (this.custom) {
            this._elementOptions.custom = this.includeCustomInScreenshot;
          }
        }
      ),
      watchUtils.whenOnce(this, "previewContainer", () => {
        document.addEventListener("keydown", e => {
          if (this.viewModel.previewIsVisible) {
            const selectors =
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            const focusableElements = this.previewContainer.querySelectorAll(
              selectors
            );
            const firstFocusableElement = focusableElements[0] as HTMLInputElement;
            const lastFocusableElement = focusableElements[
              focusableElements.length - 1
            ] as HTMLButtonElement;
            this._handleTab(e, firstFocusableElement, lastFocusableElement);
          }
        });
      })
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
      <div>
        {screenshotModeIsActive ? (
          <div key="screenshot-container" class={CSS.closeButtonContainer}>
            {optOutOfScreenshotButton}
          </div>
        ) : (
          screenshotPanel
        )}
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

  // ----------------------------------
  //
  //  Public Methods
  //
  // ----------------------------------

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

  // ----------------------------------
  //
  //  Private Methods
  //
  // ----------------------------------

  // ----------------------------------
  //
  //  Render Node Methods
  //
  // ----------------------------------

  // _renderScreenshotPanel
  private _renderScreenshotPanel(): any {
    const { screenshotTitle, screenshotSubtitle } = i18n;
    const fieldSet = this._renderFieldSet();
    const setMapAreaButton = this._renderSetMapAreaButton();
    const featureWarning = this._renderFeatureWarning();
    const screenshotLayout =
      this.includeLayoutOption &&
      (this.enableLegendOption || this.enablePopupOption || this.custom)
        ? this._renderScreenshotLayout()
        : null;
    return (
      // screenshotBtn
      <div key="screenshot-panel" class={this.classes(CSS.base, CSS.widget)}>
        <div class={CSS.mainContainer}>
          <h1 class={CSS.panelTitle}>{screenshotTitle}</h1>
          {this.enableLegendOption || this.enablePopupOption ? (
            <h3 class={CSS.panelSubTitle}>{screenshotSubtitle}</h3>
          ) : null}
          {this.enableLegendOption || this.enablePopupOption ? fieldSet : null}
          {featureWarning}
          {screenshotLayout}
          {setMapAreaButton}
        </div>
      </div>
    );
  }

  private _renderScreenshotLayout(): any {
    const elementOptionKeys = Object.keys(this._elementOptions);
    const allDisabled = elementOptionKeys.every(
      key => !this._elementOptions[key]
    );
    return (
      <label class={CSS.selectLayout}>
        <span>{i18n.screenshotLayout}</span>
        <select
          bind={this}
          onchange={this._updateLayoutOption}
          disabled={allDisabled}
        >
          <option
            value="horizontal"
            selected={this.outputLayout === "horizontal" ? true : false}
          >
            {i18n.horizontal}
          </option>
          <option
            value="vertical"
            selected={this.outputLayout === "vertical" ? true : false}
          >
            {i18n.vertical}
          </option>
        </select>
      </label>
    );
  }

  // _renderFeatureWarning
  private _renderFeatureWarning(): any {
    return (
      <div key="feature-warning" class={CSS.featureWarning}>
        {this._selectFeatureAlertIsVisible ? (
          <div class={CSS.featureWarningTextContainer}>
            <svg
              class={CSS.warningSVG}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              width="16px"
              height="16px"
            >
              <path d="M14.894 12.552l-6-11.998a1 1 0 0 0-1.787 0l-6 11.998A.998.998 0 0 0 2 13.999h12a.998.998 0 0 0 .894-1.447zM9 12H7v-2h2zm0-3H7V4h2z" />
            </svg>
            <span class={CSS.selectFeatureText}>{i18n.selectAFeature}</span>
          </div>
        ) : null}
      </div>
    );
  }

  // _renderFieldSet
  private _renderFieldSet(): any {
    const { legend, popup } = i18n;
    return (
      <div class={CSS.screenshotfieldSetCheckbox}>
        {this.enableLegendOption ? (
          <label
            key="esri-screenshot-legend-option"
            class={CSS.screenshotOption}
          >
            <input
              bind={this}
              onclick={this._toggleLegend}
              onkeydown={this._toggleLegend}
              checked={this.includeLegendInScreenshot}
              type="checkbox"
            />
            {legend}
          </label>
        ) : null}
        {this.enablePopupOption ? (
          <label
            key="esri-screenshot-popup-option"
            class={CSS.screenshotOption}
          >
            <input
              bind={this}
              onclick={this._togglePopup}
              onkeydown={this._togglePopup}
              type="checkbox"
              checked={this.includePopupInScreenshot}
            />
            {popup}
          </label>
        ) : null}
      </div>
    );
  }

  // _renderSetMapAreaButton
  private _renderSetMapAreaButton(): any {
    const { setScreenshotArea } = i18n;
    return (
      <div key="active-button-container" class={CSS.buttonContainer}>
        <calcite-button
          bind={this}
          tabIndex={0}
          onclick={this.activateScreenshot}
          onkeydown={this.activateScreenshot}
          afterCreate={storeNode}
          data-node-ref="_activeScreenshotBtnNode"
          disabled={
            this.enablePopupOption && this.includePopupInScreenshot
              ? this.featureWidget && this.featureWidget.graphic
                ? false
                : true
              : false
          }
          width="full"
          theme={this.theme}
        >
          {setScreenshotArea}
        </calcite-button>
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
        <div
          bind={this}
          data-node-ref="previewContainer"
          class={CSS.screenshotPreviewContainer}
          role="dialog"
          aria-label={i18n.downloadImage}
          afterCreate={storeNode}
        >
          <div class={CSS.screenshotImgContainer}>
            <img
              bind={this}
              afterCreate={storeNode}
              data-node-ref="_screenshotImgNode"
              class={CSS.screenshotImg}
            />
          </div>
          <input
            bind={this}
            type="text"
            afterCreate={storeNode}
            data-node-ref="previewTitleInputNode"
            placeholder={i18n.enterTitle}
          />
          {screenshotPreviewBtns}
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
      <calcite-button
        bind={this}
        tabIndex={0}
        class={this.classes(CSS.pointerCursor, CSS.screenshotClose)}
        onclick={this.deactivateScreenshot}
        onkeydown={this.deactivateScreenshot}
        title={i18n.deactivateScreenshot}
        color="red"
      >
        <calcite-icon icon="x"></calcite-icon>
      </calcite-button>
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
  deactivateScreenshot(): void {
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

  @accessibleHandler()
  private _toggleLegend(event: Event): void {
    const node = event.currentTarget as HTMLInputElement;
    this.includeLegendInScreenshot = node.checked;
    this._elementOptions.legend = node.checked;
    this.scheduleRender();
  }

  @accessibleHandler()
  private _togglePopup(event: Event): void {
    const node = event.currentTarget as HTMLInputElement;
    this.includePopupInScreenshot = node.checked;
    this._elementOptions.popup = node.checked;
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

  // _generateOffScreenPopup
  private _generateOffScreenPopup(): __esri.WatchHandle {
    return watchUtils.watch(this, "view.popup.visible", () => {
      if (!this.view) {
        return;
      }
      if (this.view.popup.visible && this._offscreenPopupContainer) {
        if (!this.featureWidget) {
          this._set(
            "featureWidget",
            new FeatureWidget({
              container: this._offscreenPopupContainer,
              graphic: this.view.popup.selectedFeature,
              map: this.view.map,
              spatialReference: this.view.spatialReference
            })
          );
          this._selectFeatureAlertIsVisible = false;
          this.scheduleRender();
        }
      }
    });
  }

  // _togglePopupAlert
  private _togglePopupAlert(): __esri.WatchHandle {
    return watchUtils.init(this, "enablePopupOption", () => {
      if (this.enablePopupOption) {
        this.own([
          watchUtils.watch(
            this,
            [
              "includePopupInScreenshot",
              "featureWidget",
              "featureWidget.graphic"
            ],
            () => {
              this._triggerAlert();
            }
          ),
          watchUtils.init(this, "includePopupInScreenshot", () => {
            this._triggerAlert();
          })
        ]);
      }
    });
  }

  // _triggerAlert
  private _triggerAlert(): void {
    if (
      this.includePopupInScreenshot &&
      (!this.featureWidget ||
        (this.featureWidget && !this.featureWidget.graphic))
    ) {
      this._selectFeatureAlertIsVisible = true;
    } else {
      this._selectFeatureAlertIsVisible = false;
    }
    this.scheduleRender();
  }

  // _watchSelectedFeature
  private _watchSelectedFeature(): __esri.WatchHandle {
    return watchUtils.watch(this, "view.popup.selectedFeature", () => {
      if (
        this.featureWidget &&
        this.view &&
        this.view.popup &&
        this.view.popup.selectedFeature
      ) {
        while (
          this._offscreenPopupContainer &&
          this._offscreenPopupContainer.firstChild
        ) {
          this._offscreenPopupContainer.removeChild(
            this._offscreenPopupContainer.firstChild
          );
        }
        this.featureWidget.graphic = null;
        this._set("featureWidget", null);
      }
      this._set(
        "featureWidget",
        new FeatureWidget({
          container: this._offscreenPopupContainer,
          graphic: this.view.popup.selectedFeature,
          map: this.view.map,
          spatialReference: this.view.spatialReference
        })
      );
      this.scheduleRender();
    });
  }

  private _updateLayoutOption(e: Event) {
    const node = e.target as HTMLSelectElement;
    this.outputLayout = node.value as "horizontal" | "vertical";
  }

  private _handleTab(e, firstFocusableElement, lastFocusableElement) {
    let isTabPressed = e.key === "Tab" || e.keyCode === 9;

    if (!isTabPressed) {
      return;
    }

    if (e.shiftKey) {
      if (document.activeElement === firstFocusableElement) {
        const interval = setInterval(() => {
          lastFocusableElement.focus();
          if (document.activeElement === lastFocusableElement) {
            clearInterval(interval);
            return;
          }
        }, 0);
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusableElement) {
        const interval = setInterval(() => {
          firstFocusableElement.focus();
          if (document.activeElement === firstFocusableElement) {
            clearInterval(interval);
            return;
          }
        }, 0);
        e.preventDefault();
      }
    }
  }
}

export = Screenshot;
