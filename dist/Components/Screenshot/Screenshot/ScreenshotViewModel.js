/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "./html2canvas/html2canvas", "esri/core/Handles", "esri/core/watchUtils", "esri/core/accessorSupport/decorators"], function (require, exports, __extends, __decorate, Accessor, html2canvas, Handles, watchUtils, decorators_1) {
    "use strict";
    var ScreenshotViewModel = /** @class */ (function (_super) {
        __extends(ScreenshotViewModel, _super);
        function ScreenshotViewModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            //----------------------------------
            //
            //  Variables
            //
            //----------------------------------
            _this._area = null;
            _this._canvasElement = null;
            _this._handles = new Handles();
            _this._screenshotPromise = null;
            _this._expandWidgetGroup = null;
            //----------------------------------
            //
            //  Properties
            //
            //----------------------------------
            // view
            _this.view = null;
            // previewIsVisible
            _this.previewIsVisible = null;
            // screenshotModeIsActive
            _this.screenshotModeIsActive = null;
            // mapComponentSelectors
            _this.mapComponentSelectors = [];
            // firstMapComponent
            _this.firstMapComponent = null;
            // secondMapComponent
            _this.secondMapComponent = null;
            // legendScreenshotEnabled
            _this.legendScreenshotEnabled = true;
            // popupScreenshotEnabled
            _this.popupScreenshotEnabled = null;
            // expandWidget
            _this.expandWidget = null;
            // dragHandler
            _this.dragHandler = null;
            return _this;
        }
        Object.defineProperty(ScreenshotViewModel.prototype, "state", {
            // state
            get: function () {
                var ready = this.get("view.ready");
                return ready
                    ? this.previewIsVisible
                        ? "ready"
                        : this._screenshotPromise
                            ? "takingScreenshot"
                            : "complete"
                    : "disabled";
            },
            enumerable: true,
            configurable: true
        });
        //----------------------------------
        //
        //  Public Methods
        //
        //----------------------------------
        ScreenshotViewModel.prototype.initialize = function () {
            var _this = this;
            watchUtils.init(this, "expandWidget", function () {
                var widgetGroupKey = "widget-group-key";
                _this._handles.remove(widgetGroupKey);
                _this._handles.add(_this._handleExpandWidgetGroup(), widgetGroupKey);
            });
        };
        ScreenshotViewModel.prototype.destroy = function () {
            this._handles.removeAll();
            this._handles = null;
        };
        // setScreenshotArea
        ScreenshotViewModel.prototype.setScreenshotArea = function (event, maskDiv, screenshotImageElement, dragHandler, downloadBtnNode) {
            var _this = this;
            if (event.action !== "end") {
                event.stopPropagation();
                this._setXYValues(event);
                this._setMaskPosition(maskDiv, this._area);
            }
            else {
                var type = this.get("view.type");
                if (type === "2d") {
                    var view = this.view;
                    this._screenshotPromise = view
                        .takeScreenshot({ area: this._area })
                        .catch(function (err) {
                        console.error("ERROR: ", err);
                    })
                        .then(function (viewScreenshot) {
                        _this._processScreenshot(viewScreenshot, screenshotImageElement, maskDiv, downloadBtnNode);
                        _this._screenshotPromise = null;
                        if (_this.dragHandler) {
                            _this.dragHandler.remove();
                            _this.dragHandler = null;
                        }
                        _this.notifyChange("state");
                    });
                }
                else if (type === "3d") {
                    var view = this.view;
                    this._screenshotPromise = view
                        .takeScreenshot({ area: this._area })
                        .catch(function (err) {
                        console.error("ERROR: ", err);
                    })
                        .then(function (viewScreenshot) {
                        _this._processScreenshot(viewScreenshot, screenshotImageElement, maskDiv, downloadBtnNode);
                        _this._screenshotPromise = null;
                        if (dragHandler) {
                            dragHandler.remove();
                            dragHandler = null;
                        }
                        _this.notifyChange("state");
                    });
                }
            }
        };
        // downloadImage
        ScreenshotViewModel.prototype.downloadImage = function () {
            var type = this.get("view.type");
            if (type === "2d") {
                var view = this.view;
                var map = view.map;
                this._downloadImage(map.portalItem.title + ".png", this._canvasElement.toDataURL());
            }
            else if (type === "3d") {
                var view = this.view;
                var map = view.map;
                this._downloadImage(map.portalItem.title + ".png", this._canvasElement.toDataURL());
            }
        };
        //----------------------------------
        //
        //  Private Methods
        //
        //----------------------------------
        // _onlyScreenshotView
        ScreenshotViewModel.prototype._onlyTakeScreenshotOfView = function (viewScreenshot, viewCanvas, img, screenshotImageElement, maskDiv, downloadBtnNode) {
            var _this = this;
            viewCanvas.height = viewScreenshot.data.height;
            viewCanvas.width = viewScreenshot.data.width;
            var context = viewCanvas.getContext("2d");
            img.src = viewScreenshot.dataUrl;
            img.onload = function () {
                context.drawImage(img, 0, 0);
                _this._showPreview(viewCanvas, screenshotImageElement, maskDiv, downloadBtnNode);
                _this._canvasElement = viewCanvas;
            };
        };
        // _includeOneMapComponent
        ScreenshotViewModel.prototype._includeOneMapComponent = function (viewScreenshot, viewCanvas, img, screenshotImageElement, maskDiv, downloadBtnNode) {
            var _this = this;
            var context = viewCanvas.getContext("2d");
            var combinedCanvas = document.createElement("canvas");
            var firstComponent = document.querySelector(this.mapComponentSelectors[0]);
            var secondMapComponent = document.querySelector(this.mapComponentSelectors[1]);
            var mapComponent = this.legendScreenshotEnabled
                ? firstComponent
                : secondMapComponent;
            this._screenshotPromise = html2canvas(mapComponent, {
                removeContainer: true,
                logging: false
            })
                .catch(function (err) {
                console.error("ERROR: ", err);
            })
                .then(function (mapComponent) {
                viewCanvas.height = viewScreenshot.data.height;
                viewCanvas.width = viewScreenshot.data.width;
                img.src = viewScreenshot.dataUrl;
                img.onload = function () {
                    context.drawImage(img, 0, 0);
                    _this._generateImageForOneComponent(viewCanvas, combinedCanvas, viewScreenshot, mapComponent);
                    _this._canvasElement = combinedCanvas;
                    _this._showPreview(combinedCanvas, screenshotImageElement, maskDiv, downloadBtnNode);
                    _this._screenshotPromise = null;
                    _this.notifyChange("state");
                };
            });
        };
        // _includeTwoMapComponents
        ScreenshotViewModel.prototype._includeTwoMapComponents = function (viewScreenshot, viewCanvas, img, screenshotImageElement, maskDiv, downloadBtnNode) {
            var _this = this;
            var screenshotKey = "screenshot-key";
            var viewCanvasContext = viewCanvas.getContext("2d");
            var combinedCanvasElements = document.createElement("canvas");
            this._screenshotPromise = html2canvas(document.querySelector(this.mapComponentSelectors[0]), {
                removeContainer: true,
                logging: false
            })
                .catch(function (err) {
                console.error("ERROR: ", err);
            })
                .then(function (firstMapComponent) {
                _this.firstMapComponent = firstMapComponent;
                _this.notifyChange("state");
                html2canvas(document.querySelector(_this.mapComponentSelectors[1]), {
                    height: document.querySelector(_this.mapComponentSelectors[1]).offsetHeight,
                    removeContainer: true,
                    logging: false
                })
                    .catch(function (err) {
                    console.error("ERROR: ", err);
                })
                    .then(function (secondMapComponent) {
                    _this.secondMapComponent = secondMapComponent;
                    _this._screenshotPromise = null;
                    _this.notifyChange("state");
                });
            });
            this._handles.remove(screenshotKey);
            this._handles.add(this._watchMapComponents(viewCanvas, viewScreenshot, img, viewCanvasContext, combinedCanvasElements, screenshotImageElement, maskDiv, screenshotKey, downloadBtnNode), screenshotKey);
        };
        // _watchMapComponents
        ScreenshotViewModel.prototype._watchMapComponents = function (viewCanvas, viewScreenshot, img, viewCanvasContext, combinedCanvasElements, screenshotImageElement, maskDiv, screenshotKey, downloadBtnNode) {
            var _this = this;
            return watchUtils.init(this, "firstMapComponent, secondMapComponent", function () {
                if (_this.firstMapComponent && _this.secondMapComponent) {
                    viewCanvas.height = viewScreenshot.data.height;
                    viewCanvas.width = viewScreenshot.data.width;
                    img.src = viewScreenshot.dataUrl;
                    img.onload = function () {
                        viewCanvasContext.drawImage(img, 0, 0);
                        _this._generateImageForTwoComponents(viewCanvas, combinedCanvasElements, viewScreenshot, _this.firstMapComponent, _this.secondMapComponent);
                        _this._canvasElement = combinedCanvasElements;
                        _this._showPreview(combinedCanvasElements, screenshotImageElement, maskDiv, downloadBtnNode);
                        _this.firstMapComponent = null;
                        _this.secondMapComponent = null;
                        _this._handles.remove(screenshotKey);
                        _this.notifyChange("state");
                    };
                }
            });
        };
        // _generateImageForOneComponent
        ScreenshotViewModel.prototype._generateImageForOneComponent = function (viewCanvas, combinedCanvas, viewScreenshot, mapComponent) {
            var viewScreenshotHeight = viewScreenshot.data.height;
            var viewLegendCanvasContext = combinedCanvas.getContext("2d");
            var mapComponentHeight = mapComponent.height;
            var height = mapComponentHeight > viewScreenshotHeight
                ? mapComponentHeight
                : viewScreenshotHeight;
            combinedCanvas.width = viewScreenshot.data.width + mapComponent.width;
            combinedCanvas.height = height;
            viewLegendCanvasContext.drawImage(mapComponent, 0, 0);
            viewLegendCanvasContext.drawImage(viewCanvas, mapComponent.width, 0);
        };
        // _generateImageForTwoComponents
        ScreenshotViewModel.prototype._generateImageForTwoComponents = function (viewCanvas, combinedCanvasElements, viewScreenshot, firstMapComponent, secondMapComponent) {
            var combinedCanvasContext = combinedCanvasElements.getContext("2d");
            var firstMapComponentHeight = firstMapComponent.height;
            var secondMapComponentHeight = secondMapComponent.height;
            var viewScreenshotHeight = viewScreenshot.data.height;
            combinedCanvasElements.width =
                viewScreenshot.data.width +
                    firstMapComponent.width +
                    secondMapComponent.width;
            combinedCanvasElements.height = this._setupCombinedScreenshotHeight(viewScreenshotHeight, firstMapComponentHeight, secondMapComponentHeight);
            combinedCanvasContext.drawImage(firstMapComponent, 0, 0);
            combinedCanvasContext.drawImage(viewCanvas, firstMapComponent.width, 0);
            combinedCanvasContext.drawImage(secondMapComponent, viewScreenshot.data.width + firstMapComponent.width, 0);
        };
        // _setupCombinedScreenshotHeight
        ScreenshotViewModel.prototype._setupCombinedScreenshotHeight = function (viewScreenshotHeight, legendCanvasHeight, popUpCanvasHeight) {
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
        };
        // _showPreview
        ScreenshotViewModel.prototype._showPreview = function (canvasElement, screenshotImageElement, maskDiv, downloadBtnNode) {
            screenshotImageElement.width = canvasElement.width;
            screenshotImageElement.src = canvasElement.toDataURL();
            this.view.container.classList.remove("esri-screenshot__cursor");
            this._area = null;
            this._setMaskPosition(maskDiv, null);
            this.previewIsVisible = true;
            window.setTimeout(function () {
                downloadBtnNode.focus();
            }, 750);
            this.notifyChange("state");
        };
        // _downloadImage
        ScreenshotViewModel.prototype._downloadImage = function (filename, dataUrl) {
            if (!window.navigator.msSaveOrOpenBlob) {
                var imgURL = document.createElement("a");
                imgURL.setAttribute("href", dataUrl);
                imgURL.setAttribute("download", filename);
                imgURL.style.display = "none";
                document.body.appendChild(imgURL);
                imgURL.click();
                document.body.removeChild(imgURL);
            }
            else {
                var byteString = atob(dataUrl.split(",")[1]);
                var mimeString = dataUrl
                    .split(",")[0]
                    .split(":")[1]
                    .split(";")[0];
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                var blob = new Blob([ab], { type: mimeString });
                window.navigator.msSaveOrOpenBlob(blob, filename);
            }
        };
        // _clamp
        ScreenshotViewModel.prototype._clamp = function (value, from, to) {
            return value < from ? from : value > to ? to : value;
        };
        // _setXYValues
        ScreenshotViewModel.prototype._setXYValues = function (event) {
            var xmin = this._clamp(Math.min(event.origin.x, event.x), 0, this.view.width);
            var xmax = this._clamp(Math.max(event.origin.x, event.x), 0, this.view.width);
            var ymin = this._clamp(Math.min(event.origin.y, event.y), 0, this.view.height);
            var ymax = this._clamp(Math.max(event.origin.y, event.y), 0, this.view.height);
            this._area = {
                x: xmin,
                y: ymin,
                width: xmax - xmin,
                height: ymax - ymin
            };
            this.notifyChange("state");
        };
        // _processScreenshot
        ScreenshotViewModel.prototype._processScreenshot = function (viewScreenshot, screenshotImageElement, maskDiv, downloadBtnNode) {
            var viewCanvas = document.createElement("canvas");
            var img = document.createElement("img");
            var firstComponent = document.querySelector(this.mapComponentSelectors[0]);
            var secondMapComponent = document.querySelector(this.mapComponentSelectors[1]);
            if (!this.legendScreenshotEnabled && !this.popupScreenshotEnabled) {
                this._onlyTakeScreenshotOfView(viewScreenshot, viewCanvas, img, screenshotImageElement, maskDiv, downloadBtnNode);
            }
            else {
                if (this.legendScreenshotEnabled && !this.popupScreenshotEnabled) {
                    if (firstComponent.offsetWidth && firstComponent.offsetHeight) {
                        this._includeOneMapComponent(viewScreenshot, viewCanvas, img, screenshotImageElement, maskDiv, downloadBtnNode);
                    }
                    else {
                        this._onlyTakeScreenshotOfView(viewScreenshot, viewCanvas, img, screenshotImageElement, maskDiv, downloadBtnNode);
                    }
                }
                else if (this.popupScreenshotEnabled && !this.legendScreenshotEnabled) {
                    if (secondMapComponent.offsetWidth && secondMapComponent.offsetHeight) {
                        this._includeOneMapComponent(viewScreenshot, viewCanvas, img, screenshotImageElement, maskDiv, downloadBtnNode);
                    }
                    else {
                        this._onlyTakeScreenshotOfView(viewScreenshot, viewCanvas, img, screenshotImageElement, maskDiv, downloadBtnNode);
                    }
                }
                else if (this.legendScreenshotEnabled && this.popupScreenshotEnabled) {
                    if (firstComponent.offsetWidth &&
                        firstComponent.offsetHeight &&
                        secondMapComponent.offsetWidth &&
                        secondMapComponent.offsetHeight) {
                        this._includeTwoMapComponents(viewScreenshot, viewCanvas, img, screenshotImageElement, maskDiv, downloadBtnNode);
                    }
                    else if (!firstComponent.offsetWidth ||
                        !firstComponent.offsetHeight ||
                        (!secondMapComponent.offsetWidth || !secondMapComponent.offsetHeight)) {
                        this._includeOneMapComponent(viewScreenshot, viewCanvas, img, screenshotImageElement, maskDiv, downloadBtnNode);
                    }
                    else {
                        this._onlyTakeScreenshotOfView(viewScreenshot, viewCanvas, img, screenshotImageElement, maskDiv, downloadBtnNode);
                    }
                }
            }
        };
        // _setMaskPosition
        ScreenshotViewModel.prototype._setMaskPosition = function (maskDiv, area) {
            if (!maskDiv) {
                return;
            }
            var calibratedMaskTop = (window.innerHeight - this.view.height);
            if (area) {
                maskDiv.style.left = area.x + "px";
                maskDiv.style.top = area.y + calibratedMaskTop + "px";
                maskDiv.style.width = area.width + "px";
                maskDiv.style.height = area.height + "px";
                this.screenshotModeIsActive = true;
            }
            else {
                maskDiv.style.left = 0 + "px";
                maskDiv.style.top = 0 + "px";
                maskDiv.style.width = 0 + "px";
                maskDiv.style.height = 0 + "px";
                this.screenshotModeIsActive = false;
            }
            this.notifyChange("state");
        };
        // _handleExpandWidgetGroup
        ScreenshotViewModel.prototype._handleExpandWidgetGroup = function () {
            var _this = this;
            return watchUtils.whenTrue(this, "screenshotModeIsActive", function () {
                if (_this.expandWidget && _this.expandWidget.group) {
                    var activeModeKey = "active-mode";
                    _this._handles.remove(activeModeKey);
                    _this._handles.add(watchUtils.whenFalse(_this, "screenshotModeIsActive", function () {
                        if (_this._expandWidgetGroup) {
                            _this.expandWidget.expanded = true;
                        }
                    }), activeModeKey);
                }
            });
        };
        __decorate([
            decorators_1.property({
                dependsOn: ["view.ready"],
                readOnly: true
            })
        ], ScreenshotViewModel.prototype, "state", null);
        __decorate([
            decorators_1.property()
        ], ScreenshotViewModel.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], ScreenshotViewModel.prototype, "previewIsVisible", void 0);
        __decorate([
            decorators_1.property()
        ], ScreenshotViewModel.prototype, "screenshotModeIsActive", void 0);
        __decorate([
            decorators_1.property()
        ], ScreenshotViewModel.prototype, "mapComponentSelectors", void 0);
        __decorate([
            decorators_1.property()
        ], ScreenshotViewModel.prototype, "firstMapComponent", void 0);
        __decorate([
            decorators_1.property()
        ], ScreenshotViewModel.prototype, "secondMapComponent", void 0);
        __decorate([
            decorators_1.property()
        ], ScreenshotViewModel.prototype, "legendScreenshotEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], ScreenshotViewModel.prototype, "popupScreenshotEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], ScreenshotViewModel.prototype, "expandWidget", void 0);
        __decorate([
            decorators_1.property()
        ], ScreenshotViewModel.prototype, "dragHandler", void 0);
        ScreenshotViewModel = __decorate([
            decorators_1.subclass("ScreenshotViewModel")
        ], ScreenshotViewModel);
        return ScreenshotViewModel;
    }(decorators_1.declared(Accessor)));
    return ScreenshotViewModel;
});
//# sourceMappingURL=ScreenshotViewModel.js.map