# screenshot-widget

Screenshot widget built with the ArcGIS API for Javascript version 4.x and html2canvas.

More info on html2canvas can be found here: http://html2canvas.hertzen.com/

## Features:

1.  `MapView` and `SceneView` compatability
2.  Take a screenshot of the `MapView` or `SceneView`
3.  Include screenshots of map components i.e. Legend or Popup

## Screenshot

### Constructor:

#### new **Screenshot(_properties?_)**

##### Property Overview:

| Name                  | Type                 | Summary                                                                                   |
| --------------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| view                  | MapView \| SceneView | A reference to the `MapView` or `SceneView`                                               |
| viewModel             | ScreenshotViewModel  | The view model for this widget.                                                           |
| mapComponentSelectors | String[] //aliased   | Array of strings consisting of HTML class name selectors. Length of array can be up to 2. |
| label                 | String               | The widget's default label.                                                               |
| iconClass             | String               | The widget's icon.                                                                        |

## ScreenshotViewModel

### Constructor:

#### new **ScreenshotViewModel(_properties?_)**

##### Property Overview:

| Name                   | Type                 | Summary                                                                                   |
| ---------------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| view                   | MapView \| SceneView | A reference to the `MapView` or `SceneView`                                               |
| previewIsVisible       | boolean              | Toggles screenshot preview.                                                               |
| screenshotModeIsActive | boolean              | Toggles screenshot mode.                                                                  |
| mapComponentSelectors  | String[]             | Array of strings consisting of HTML class name selectors. Length of array can be up to 2. |

### **Example usage:**

```
const screenshot = new Screenshot({
  view: this.view,
  mapComponentSelectors: [".esri-legend__layer", ".esri-popup__main-container"]
});
```
