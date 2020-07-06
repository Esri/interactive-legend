import i18nInteractiveLegend from "dojo/i18n!../nls/resources";
import ApplicationBase = require("ApplicationBase/ApplicationBase");
import { esriWidgetProps } from "../interfaces/interfaces";
import { eachAlways } from "esri/core/promiseUtils";
import { whenOnce } from "esri/core/watchUtils";
import SelectedStyleData = require("../Components/InteractiveLegend/InteractiveLegend/styles/InteractiveStyle/SelectedStyleData");
import Screenshot = require("../Components/Screenshot/Screenshot");

export async function addHome(props: esriWidgetProps) {
  const { view, config, propertyName } = props;
  const { home, homePosition } = config;

  //   Import Home widget
  const Home = await import("esri/widgets/Home");

  //   Find widget node in view UI
  const node = _findNode("esri-home");
  //   If home is not enabled and  node exists - remove from UI.
  if (!home) {
    if (node) {
      view.ui.remove(node);
    }
    return;
  }

  if (node && propertyName === "homePosition") {
    view.ui.move(node, homePosition);
  } else if (propertyName === "home") {
    view.ui.add(new Home.default({ view }), homePosition);
  }
}

export async function addLayerList(props: esriWidgetProps) {
  const { view, config, propertyName } = props;
  const { layerList, layerListPosition } = config;

  const modules = await eachAlways([
    import("esri/widgets/LayerList"),
    import("esri/widgets/Expand")
  ]);

  const [LayerList, Expand] = modules.map(module => module.value);

  const node = view.ui.find("layerListExpand") as __esri.Expand;

  if (!layerList) {
    if (node) {
      view.ui.remove(node);
    }
    return;
  }

  const group =
    layerListPosition.indexOf("left") !== -1
      ? "left"
      : layerListPosition.indexOf("right") !== -1
      ? "right"
      : null;

  if (node && propertyName === "layerListPosition") {
    node.expanded = false;
    node.group = group;
    view.ui.move(node, layerListPosition);
  } else if (propertyName === "layerList") {
    const layerList = new LayerList.default({ view });

    const layerListExpand = new Expand.default({
      view,
      content: layerList,
      id: "layerListExpand",
      group
    });

    view.ui.add(layerListExpand, layerListPosition);
  }
}

export async function addZoom(props: esriWidgetProps) {
  const { view, config, propertyName } = props;
  const { mapZoom, mapZoomPosition } = config;

  const Zoom = await import("esri/widgets/Zoom");

  const node = _findNode("esri-zoom");

  if (!mapZoom) {
    if (node) {
      view.ui.remove(node);
    }
    return;
  }

  if (node && propertyName === "mapZoomPosition") {
    view.ui.move(node, mapZoomPosition);
  } else if (propertyName === "mapZoom") {
    view.ui.add(new Zoom.default({ view }), mapZoomPosition);
  }
}

export async function addBasemapToggle(props: esriWidgetProps) {
  const { view, config, propertyName } = props;
  const { basemapToggle, basemapTogglePosition, nextBasemap } = config;

  const BasemapToggle = await import("esri/widgets/BasemapToggle");

  const node = _findNode("esri-basemap-toggle");

  if (!basemapToggle) {
    if (node) {
      view.ui.remove(node);
    }
    return;
  }

  if (node && propertyName === "nextBasemap") {
    const basemapToggle = view.ui.find("basemapToggle") as __esri.BasemapToggle;
    basemapToggle.nextBasemap = nextBasemap;
  } else if (node && propertyName === "basemapTogglePosition") {
    view.ui.move(node, basemapTogglePosition);
  } else if (propertyName === "basemapToggle") {
    view.ui.add(
      new BasemapToggle.default({ view, nextBasemap, id: "basemapToggle" }),
      basemapTogglePosition
    );
  }
}

export async function addSearch(props: esriWidgetProps) {
  const { view, portal, config, propertyName } = props;
  const {
    search,
    searchConfiguration,
    searchOpenAtStart,
    searchPosition
  } = config;

  const modules = await eachAlways([
    import("esri/widgets/Search"),
    import("esri/layers/FeatureLayer"),
    import("esri/widgets/Expand")
  ]);
  const [Search, FeatureLayer, Expand] = modules.map(module => module.value);

  const node = view.ui.find("searchExpand") as __esri.Expand;

  if (!Search || !FeatureLayer || !Expand) {
    return;
  }
  if (!search) {
    if (node) {
      view.ui.remove(node);
    }
    return;
  }

  const group =
    searchPosition.indexOf("left") !== -1
      ? "left"
      : searchPosition.indexOf("right") !== -1
      ? "right"
      : null;

  if (propertyName === "searchPosition" && node) {
    node.group = group;
    view.ui.move(node, searchPosition);
  } else if (propertyName === "searchOpenAtStart" && node) {
    node.expanded = searchOpenAtStart;
  } else if (
    propertyName === "search" ||
    (propertyName === "searchConfiguration" && node)
  ) {
    if (node) {
      view.ui.remove(node);
    }
    const sources = searchConfiguration?.sources;

    if (sources) {
      sources.forEach(source => {
        if (source?.layer?.url) {
          source.layer = new FeatureLayer.default(source?.layer?.url);
        }
      });
    }
    const content = new Search.default({
      view,
      portal,
      ...searchConfiguration
    });
    const searchExpand = new Expand.default({
      expanded: searchOpenAtStart,
      id: "searchExpand",
      content,
      mode: "floating",
      group,
      view
    });
    view.ui.add({
      component: searchExpand,
      position: searchPosition
    });
  }
}

export async function addInfoPanel(
  props: esriWidgetProps,
  base: ApplicationBase
): Promise<void> {
  const { view, config, propertyName } = props;
  const { infoPanel, infoPanelPosition, screenshot } = config;

  const modules = await eachAlways([
    import("../Components/Info/Info"),
    import("esri/widgets/Expand")
  ]);

  const [Info, Expand] = modules.map(module => module.value);

  const node = view.ui.find("infoExpand") as __esri.Expand;

  if (!infoPanel) {
    if (node) {
      view.ui.remove(node);
    }
    return;
  }

  const group =
    infoPanelPosition.indexOf("left") !== -1
      ? "left"
      : infoPanelPosition.indexOf("right") !== -1
      ? "right"
      : null;

  if (node && propertyName === "infoPanelPosition") {
    node.expanded = false;
    node.group = group;
    view.ui.move(node, infoPanelPosition);
  } else if (propertyName === "infoPanel") {
    const infoContent = await getInfoContent(screenshot);

    const infoWidget = new Info.default({
      view,
      infoContent
    });

    const infoExpand = new Expand.default({
      id: "infoExpand",
      view,
      group,
      content: infoWidget,
      mode: "floating",
      expandTooltip: infoWidget.label
    });

    infoWidget.expandWidget = infoExpand;

    // whenOnce(infoExpand, "container", () => {
    //   if (base.locale === "ar" || base.locale === "he") {
    //     const questionClass =
    //       ".esri-collapse__icon.icon-ui-question.icon-ui-flush";
    //     const questionIconNode = document.querySelector(
    //       questionClass
    //     ) as HTMLElement;
    //     questionIconNode.style.transform = "scaleX(-1)";
    //   }
    // });

    view.ui.add(infoExpand, infoPanelPosition);
    return infoWidget;
  }
}

function _findNode(className: string): HTMLElement {
  const mainNodes = document.getElementsByClassName(className);
  let node = null;
  for (let j = 0; j < mainNodes.length; j++) {
    node = mainNodes[j] as HTMLElement;
  }
  return node ? node : null;
}

export async function getInfoContent(
  screenshotEnabled: boolean
): Promise<__esri.Collection<any>> {
  const modules = await eachAlways([
    import("../Components/Info/Info/InfoItem"),
    import("esri/core/Collection")
  ]);

  const [InfoItem, Collection] = modules.map(module => module.value);

  const screenshotTitle = i18nInteractiveLegend.onboardingPanelScreenshotTitle;
  const {
    onboardingPanelScreenshotStepOne,
    onboardingPanelScreenshotStepTwo,
    onboardingPanelScreenshotStepThree,
    onboardingPanelScreenshotStepFour,
    onboardingPanelScreenshotStepFive,
    newInteractiveLegend,
    firstOnboardingWelcomeMessage,
    secondOnboardingWelcomeMessage,
    thirdOnboardingWelcomeMessage
  } = i18nInteractiveLegend;

  const screenshotSteps = [
    onboardingPanelScreenshotStepOne,
    onboardingPanelScreenshotStepTwo,
    onboardingPanelScreenshotStepThree,
    onboardingPanelScreenshotStepFour,
    onboardingPanelScreenshotStepFive
  ];

  const infoContentItems = [
    firstOnboardingWelcomeMessage,
    secondOnboardingWelcomeMessage,
    thirdOnboardingWelcomeMessage
  ];

  return screenshotEnabled
    ? new Collection.default([
        new InfoItem.default({
          type: "list",
          title: screenshotTitle,
          infoContentItems: screenshotSteps
        }),
        new InfoItem.default({
          type: "explanation",
          title: newInteractiveLegend,
          infoContentItems
        })
      ])
    : new Collection.default([
        new InfoItem.default({
          type: "explanation",
          title: newInteractiveLegend,
          infoContentItems
        })
      ]);
}

export async function addScreenshot(
  props: esriWidgetProps,
  layerList: __esri.LayerList,
  selectedStyleData: __esri.Collection<SelectedStyleData>
) {
  const { view, config, propertyName } = props;
  const {
    screenshot,
    screenshotPosition,
    enableLegendOption,
    enablePopupOption,
    featureCount
  } = config;

  const modules = await eachAlways([
    import("../Components/Screenshot/Screenshot"),
    import("esri/widgets/Expand")
  ]);

  const [Screenshot, Expand] = modules.map(module => module.value);

  const node = view.ui.find("screenshotExpand") as __esri.Expand;
  if (!screenshot) {
    if (node) {
      const screenshotWidget = node?.content as Screenshot;
      if (
        screenshotWidget &&
        screenshotWidget.get("viewModel.screenshotModeIsActive")
      ) {
        screenshotWidget.set("viewModel.screenshotModeIsActive", false);
      }
      view.ui.remove(node);
    }
    return;
  }

  const group =
    screenshotPosition.indexOf("left") !== -1
      ? "left"
      : screenshotPosition.indexOf("right") !== -1
      ? "right"
      : null;

  if (propertyName === "screenshot" && screenshot) {
    const screenshot = new Screenshot.default({
      view,
      enableLegendOption,
      enablePopupOption,
      includeLegendInScreenshot: true,
      selectedStyleData,
      legendFeatureCountEnabled: featureCount,
      layerListViewModel: layerList.viewModel
    });

    const expand = new Expand.default({
      id: "screenshotExpand",
      view,
      group,
      content: screenshot,
      mode: "floating"
    });
    view.ui.add(expand, screenshotPosition);
    return screenshot;
  } else if (propertyName === "screenshotPosition") {
    node.expanded = false;
    node.group = group;
    view.ui.move(node, screenshotPosition);
  }
}
