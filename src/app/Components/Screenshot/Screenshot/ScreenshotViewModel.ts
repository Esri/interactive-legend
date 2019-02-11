/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// esri.core.Accessor
import Accessor = require("esri/core/Accessor");

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.views.SceneView
import SceneView = require("esri/views/SceneView");

// esri.WebMap
import WebMap = require("esri/WebMap");

// esri.WebScene
import WebScene = require("esri/WebScene");

// html2canvas
import html2canvas = require("./html2canvas/html2canvas");

// esri.core.Handles
import Handles = require("esri/core/Handles");

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property
} from "esri/core/accessorSupport/decorators";

// State
type State = "ready" | "takingScreenshot" | "complete" | "disabled";

// interfaces
import { Area, Screenshot } from "./interfaces/interfaces";

@subclass("ScreenshotViewModel")
class ScreenshotViewModel extends declared(Accessor) {
  //----------------------------------
  //
  //  Variables
  //
  //----------------------------------
  private _area: Area = null;
  private _canvasElement: HTMLCanvasElement = null;
  private _handles: Handles = new Handles();

  // state
  @property({
    dependsOn: ["view.ready"],
    readOnly: true
  })
  get state(): State {
    const ready = this.get("view.ready");
    return ready
      ? this.previewIsVisible
        ? "ready"
        : !this._area
        ? "takingScreenshot"
        : "complete"
      : "disabled";
  }

  //----------------------------------
  //
  //  Properties
  //
  //----------------------------------

  // view
  @property()
  view: MapView | SceneView = null;

  // previewIsVisible
  @property()
  previewIsVisible: boolean = null;

  // screenshotModeIsActive
  @property()
  screenshotModeIsActive: boolean = null;

  // mapComponentSelectors
  @property()
  mapComponentSelectors: string[] = [];

  // firstMapComponent
  @property()
  firstMapComponent = null;

  // secondMapComponent
  @property()
  secondMapComponent = null;

  // legendScreenshotEnabled
  @property()
  legendScreenshotEnabled: boolean = null;

  // popupScreenshotEnabled
  @property()
  popupScreenshotEnabled: boolean = null;

  //----------------------------------
  //
  //  Public Methods
  //
  //----------------------------------

  // setScreenshotArea
  setScreenshotArea(
    event: any,
    maskDiv: HTMLElement,
    screenshotImageElement: HTMLImageElement,
    dragHandler: any
  ): void {
    if (event.action !== "end") {
      event.stopPropagation();
      this._setXYValues(event);
      this._setMaskPosition(maskDiv, this._area);
    } else {
      dragHandler.remove();
      const type = this.get("view.type");
      if (type === "2d") {
        const view = this.view as MapView;
        view
          .takeScreenshot({ area: this._area })
          .catch((err: Error) => {
            console.error("ERROR: ", err);
          })
          .then((viewScreenshot: Screenshot) => {
            this._processScreenshot(
              viewScreenshot,
              screenshotImageElement,
              maskDiv
            );
          });
      } else if (type === "3d") {
        const view = this.view as SceneView;
        view
          .takeScreenshot({ area: this._area })
          .catch((err: Error) => {
            console.error("ERROR: ", err);
          })
          .then((viewScreenshot: Screenshot) => {
            this._processScreenshot(
              viewScreenshot,
              screenshotImageElement,
              maskDiv
            );
          });
      }
    }
  }

  // downloadImage
  downloadImage(): void {
    const type = this.get("view.type");
    if (type === "2d") {
      const view = this.view as MapView;
      const map = view.map as WebMap;
      this._downloadImage(
        `${map.portalItem.title}.png`,
        this._canvasElement.toDataURL()
      );
    } else if (type === "3d") {
      const view = this.view as SceneView;
      const map = view.map as WebScene;
      this._downloadImage(
        `${map.portalItem.title}.png`,
        this._canvasElement.toDataURL()
      );
    }
  }

  //----------------------------------
  //
  //  Private Methods
  //
  //----------------------------------

  // _onlyScreenshotView
  private _onlyTakeScreenshotOfView(
    viewScreenshot: Screenshot,
    viewCanvas: HTMLCanvasElement,
    img: HTMLImageElement,
    screenshotImageElement: HTMLImageElement,
    maskDiv: HTMLElement
  ): void {
    viewCanvas.height = viewScreenshot.data.height;
    viewCanvas.width = viewScreenshot.data.width;
    const context = viewCanvas.getContext("2d") as CanvasRenderingContext2D;
    img.src = viewScreenshot.dataUrl;
    img.onload = () => {
      context.drawImage(img, 0, 0);
      this._showPreview(viewCanvas, screenshotImageElement, maskDiv);
      this._canvasElement = viewCanvas;
    };
  }

  // _includeOneMapComponent
  private _includeOneMapComponent(
    viewScreenshot: Screenshot,
    viewCanvas: HTMLCanvasElement,
    img: HTMLImageElement,
    screenshotImageElement: HTMLImageElement,
    maskDiv: HTMLElement
  ): void {
    const context = viewCanvas.getContext("2d") as CanvasRenderingContext2D;
    const combinedCanvas = document.createElement(
      "canvas"
    ) as HTMLCanvasElement;

    const firstComponent = document.querySelector(
      this.mapComponentSelectors[0]
    ) as HTMLElement;
    const secondMapComponent = document.querySelector(
      this.mapComponentSelectors[1]
    ) as HTMLElement;

    const mapComponent = this.legendScreenshotEnabled
      ? firstComponent
      : secondMapComponent;

    html2canvas(mapComponent, {
      removeContainer: true,
      logging: false
    })
      .catch((err: Error) => {
        console.error("ERROR: ", err);
      })
      .then((mapComponent: HTMLCanvasElement) => {
        viewCanvas.height = viewScreenshot.data.height;
        viewCanvas.width = viewScreenshot.data.width;
        img.src = viewScreenshot.dataUrl;
        img.onload = () => {
          context.drawImage(img, 0, 0);
          this._generateImageForOneComponent(
            viewCanvas,
            combinedCanvas,
            viewScreenshot,
            mapComponent
          );
          this._canvasElement = combinedCanvas;
          this._showPreview(combinedCanvas, screenshotImageElement, maskDiv);
        };
      });
  }

  // _includeTwoMapComponents
  private _includeTwoMapComponents(
    viewScreenshot: Screenshot,
    viewCanvas: HTMLCanvasElement,
    img: HTMLImageElement,
    screenshotImageElement: HTMLImageElement,
    maskDiv: HTMLElement
  ): void {
    const screenshotKey = "screenshot-key";
    const viewCanvasContext = viewCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    const combinedCanvasElements = document.createElement(
      "canvas"
    ) as HTMLCanvasElement;
    html2canvas(document.querySelector(this.mapComponentSelectors[0]), {
      removeContainer: true,
      logging: false
    })
      .catch((err: Error) => {
        console.error("ERROR: ", err);
      })
      .then((firstMapComponent: HTMLCanvasElement) => {
        this.firstMapComponent = firstMapComponent;
        this.notifyChange("state");
        html2canvas(document.querySelector(this.mapComponentSelectors[1]), {
          height: (document.querySelector(
            this.mapComponentSelectors[1]
          ) as HTMLElement).offsetHeight,
          removeContainer: true,
          logging: false
        })
          .catch((err: Error) => {
            console.error("ERROR: ", err);
          })
          .then((secondMapComponent: HTMLCanvasElement) => {
            this.secondMapComponent = secondMapComponent;
            this.notifyChange("state");
          });
      });
    this._handles.add(
      this._watchMapComponents(
        viewCanvas,
        viewScreenshot,
        img,
        viewCanvasContext,
        combinedCanvasElements,
        screenshotImageElement,
        maskDiv,
        screenshotKey
      ),
      screenshotKey
    );
  }

  // _watchMapComponents
  private _watchMapComponents(
    viewCanvas: HTMLCanvasElement,
    viewScreenshot: Screenshot,
    img: HTMLImageElement,
    viewCanvasContext: CanvasRenderingContext2D,
    combinedCanvasElements: HTMLCanvasElement,
    screenshotImageElement: HTMLImageElement,
    maskDiv: HTMLElement,
    screenshotKey: string
  ) {
    return watchUtils.init(
      this,
      "firstMapComponent, secondMapComponent",
      () => {
        if (this.firstMapComponent && this.secondMapComponent) {
          viewCanvas.height = viewScreenshot.data.height;
          viewCanvas.width = viewScreenshot.data.width;
          img.src = viewScreenshot.dataUrl;
          img.onload = () => {
            viewCanvasContext.drawImage(img, 0, 0);
            this._generateImageForTwoComponents(
              viewCanvas,
              combinedCanvasElements,
              viewScreenshot,
              this.firstMapComponent,
              this.secondMapComponent
            );
            this._canvasElement = combinedCanvasElements;
            this._showPreview(
              combinedCanvasElements,
              screenshotImageElement,
              maskDiv
            );
            this.firstMapComponent = null;
            this.secondMapComponent = null;
            this._handles.remove(screenshotKey);
            this.notifyChange("state");
          };
        }
      }
    );
  }

  // _generateImageForOneComponent
  private _generateImageForOneComponent(
    viewCanvas: HTMLCanvasElement,
    combinedCanvas: HTMLCanvasElement,
    viewScreenshot: Screenshot,
    mapComponent: HTMLCanvasElement
  ): void {
    const viewScreenshotHeight = viewScreenshot.data.height as number;
    const viewLegendCanvasContext = combinedCanvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    const mapComponentHeight = mapComponent.height as number;
    const height =
      mapComponentHeight > viewScreenshotHeight
        ? mapComponentHeight
        : viewScreenshotHeight;
    combinedCanvas.width = viewScreenshot.data.width + mapComponent.width;
    combinedCanvas.height = height;
    viewLegendCanvasContext.drawImage(mapComponent, 0, 0);
    viewLegendCanvasContext.drawImage(viewCanvas, mapComponent.width, 0);
  }

  // _generateImageForTwoComponents
  private _generateImageForTwoComponents(
    viewCanvas: HTMLCanvasElement,
    combinedCanvasElements: HTMLCanvasElement,
    viewScreenshot: Screenshot,
    firstMapComponent: HTMLCanvasElement,
    secondMapComponent: HTMLCanvasElement
  ): void {
    const combinedCanvasContext = combinedCanvasElements.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    const firstMapComponentHeight = firstMapComponent.height as number;
    const secondMapComponentHeight = secondMapComponent.height as number;
    const viewScreenshotHeight = viewScreenshot.data.height as number;
    combinedCanvasElements.width =
      viewScreenshot.data.width +
      firstMapComponent.width +
      secondMapComponent.width;
    combinedCanvasElements.height = this._setupCombinedScreenshotHeight(
      viewScreenshotHeight,
      firstMapComponentHeight,
      secondMapComponentHeight
    );
    combinedCanvasContext.drawImage(firstMapComponent, 0, 0);
    combinedCanvasContext.drawImage(viewCanvas, firstMapComponent.width, 0);
    combinedCanvasContext.drawImage(
      secondMapComponent,
      viewScreenshot.data.width + firstMapComponent.width,
      0
    );
  }

  // _setupCombinedScreenshotHeight
  private _setupCombinedScreenshotHeight(
    viewScreenshotHeight: number,
    legendCanvasHeight: number,
    popUpCanvasHeight: number
  ): number {
    return viewScreenshotHeight > legendCanvasHeight &&
      viewScreenshotHeight > popUpCanvasHeight
      ? viewScreenshotHeight
      : legendCanvasHeight > viewScreenshotHeight &&
        legendCanvasHeight > popUpCanvasHeight
      ? legendCanvasHeight
      : popUpCanvasHeight > legendCanvasHeight &&
        popUpCanvasHeight > viewScreenshotHeight
      ? popUpCanvasHeight
      : null;
  }

  // _showPreview
  private _showPreview(
    canvasElement: HTMLCanvasElement,
    screenshotImageElement: HTMLImageElement,
    maskDiv: HTMLElement
  ): void {
    const activeElement = document.activeElement as HTMLElement;
    activeElement.blur();
    screenshotImageElement.width = canvasElement.width;
    screenshotImageElement.src = canvasElement.toDataURL();
    this.view.container.classList.remove("esri-screenshot__cursor");

    this._area = null;
    this._setMaskPosition(maskDiv, null);
    this.previewIsVisible = true;
    this.notifyChange("state");
  }

  // _downloadImage
  private _downloadImage(filename: any, dataUrl: string): void {
    if (!window.navigator.msSaveOrOpenBlob) {
      const imgURL = document.createElement("a") as HTMLAnchorElement;
      imgURL.setAttribute("href", dataUrl);
      imgURL.setAttribute("download", filename);
      imgURL.style.display = "none";
      document.body.appendChild(imgURL);
      imgURL.click();
      document.body.removeChild(imgURL);
    } else {
      const byteString = atob(dataUrl.split(",")[1]);
      const mimeString = dataUrl
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      window.navigator.msSaveOrOpenBlob(blob, filename);
    }
  }

  // _clamp
  private _clamp(value: number, from: number, to: number): number {
    return value < from ? from : value > to ? to : value;
  }

  // _setXYValues
  private _setXYValues(event: any): void {
    const xmin = this._clamp(
      Math.min(event.origin.x, event.x),
      0,
      this.view.width
    ) as number;
    const xmax = this._clamp(
      Math.max(event.origin.x, event.x),
      0,
      this.view.width
    ) as number;
    const ymin = this._clamp(
      Math.min(event.origin.y, event.y),
      0,
      this.view.height
    ) as number;
    const ymax = this._clamp(
      Math.max(event.origin.y, event.y),
      0,
      this.view.height
    ) as number;
    this._area = {
      x: xmin,
      y: ymin,
      width: xmax - xmin,
      height: ymax - ymin
    };
    this.notifyChange("state");
  }

  // _processScreenshot
  private _processScreenshot(
    viewScreenshot: Screenshot,
    screenshotImageElement: HTMLImageElement,
    maskDiv: HTMLElement
  ): void {
    const viewCanvas = document.createElement("canvas") as HTMLCanvasElement;
    const img = document.createElement("img") as HTMLImageElement;
    const firstComponent = document.querySelector(
      this.mapComponentSelectors[0]
    ) as HTMLElement;
    const secondMapComponent = document.querySelector(
      this.mapComponentSelectors[1]
    ) as HTMLElement;
    if (!this.legendScreenshotEnabled && !this.popupScreenshotEnabled) {
      this._onlyTakeScreenshotOfView(
        viewScreenshot,
        viewCanvas,
        img,
        screenshotImageElement,
        maskDiv
      );
    } else {
      if (this.legendScreenshotEnabled && !this.popupScreenshotEnabled) {
        if (firstComponent.offsetWidth && firstComponent.offsetHeight) {
          this._includeOneMapComponent(
            viewScreenshot,
            viewCanvas,
            img,
            screenshotImageElement,
            maskDiv
          );
        } else {
          this._onlyTakeScreenshotOfView(
            viewScreenshot,
            viewCanvas,
            img,
            screenshotImageElement,
            maskDiv
          );
        }
      } else if (this.popupScreenshotEnabled && !this.legendScreenshotEnabled) {
        if (secondMapComponent.offsetWidth && secondMapComponent.offsetHeight) {
          this._includeOneMapComponent(
            viewScreenshot,
            viewCanvas,
            img,
            screenshotImageElement,
            maskDiv
          );
        } else {
          this._onlyTakeScreenshotOfView(
            viewScreenshot,
            viewCanvas,
            img,
            screenshotImageElement,
            maskDiv
          );
        }
      } else if (this.legendScreenshotEnabled && this.popupScreenshotEnabled) {
        if (
          firstComponent.offsetWidth &&
          firstComponent.offsetHeight &&
          secondMapComponent.offsetWidth &&
          secondMapComponent.offsetHeight
        ) {
          this._includeTwoMapComponents(
            viewScreenshot,
            viewCanvas,
            img,
            screenshotImageElement,
            maskDiv
          );
        } else if (
          !firstComponent.offsetWidth ||
          !firstComponent.offsetHeight ||
          (!secondMapComponent.offsetWidth || !secondMapComponent.offsetHeight)
        ) {
          this._includeOneMapComponent(
            viewScreenshot,
            viewCanvas,
            img,
            screenshotImageElement,
            maskDiv
          );
        } else {
          this._onlyTakeScreenshotOfView(
            viewScreenshot,
            viewCanvas,
            img,
            screenshotImageElement,
            maskDiv
          );
        }
      }
    }
  }

  // _setMaskPosition
  private _setMaskPosition(maskDiv: HTMLElement, area?: any): void {
    if (!maskDiv) {
      return;
    }
    const calibratedMaskTop = (window.innerHeight - this.view.height) as number;

    if (area) {
      maskDiv.style.left = `${area.x}px`;
      maskDiv.style.top = `${area.y + calibratedMaskTop}px`;
      maskDiv.style.width = `${area.width}px`;
      maskDiv.style.height = `${area.height}px`;
      this.screenshotModeIsActive = true;
    } else {
      maskDiv.style.left = `${0}px`;
      maskDiv.style.top = `${0}px`;
      maskDiv.style.width = `${0}px`;
      maskDiv.style.height = `${0}px`;
      this.screenshotModeIsActive = false;
    }
    this.notifyChange("state");
  }
}

export = ScreenshotViewModel;
