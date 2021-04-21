import i18nInteractiveLegend from "dojo/i18n!../nls/resources";
import ApplicationBase = require("ApplicationBase/ApplicationBase");
import { esriWidgetProps } from "../interfaces/interfaces";
import { eachAlways } from "esri/core/promiseUtils";
import SelectedStyleData = require("../Components/InteractiveLegend/InteractiveLegend/styles/InteractiveStyle/SelectedStyleData");
import Screenshot = require("../Components/Screenshot/Screenshot");
import TimeFilter = require("../Components/TimeFilter/TimeFilter");

export async function addHome(props: esriWidgetProps) {
  const { view, config, propertyName } = props;
  const { home, homePosition } = config;

  //   Import Home widget
  const Home = await import("esri/widgets/Home");

  //   Find widget node in view UI
  const node = findNode("esri-home");
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

export async function addTimeFilter(props: esriWidgetProps) {
  const { view, config, propertyName } = props;
  const {
    timeFilter,
    timeFilterConfig,
    timeFilterPosition,
    filterMode,
    muteOpacity,
    muteGrayScale
  } = config;

  const modules = await eachAlways([
    import("../Components/TimeFilter/TimeFilter"),
    import("esri/widgets/Expand")
  ]);
  const [TimeFilter, Expand] = modules.map(module => module.value);

  const node = view.ui.find("timeFilterExpand") as __esri.Expand;

  if (!timeFilter) {
    if (node) {
      view.ui.remove(node);
    }
    return;
  }

  const timeFilterPosVal =
    typeof timeFilterPosition === "string"
      ? timeFilterPosition
      : timeFilterPosition.position;

  const group =
    timeFilterPosVal.indexOf("left") !== -1
      ? "left"
      : timeFilterPosVal.indexOf("right") !== -1
      ? "right"
      : null;

  if (node && propertyName === "timeFilterPosition") {
    node.expanded = false;
    node.group = group;
    view.ui.move(node, timeFilterPosition);
  } else if (propertyName === "timeFilter") {
    const timeFilter = new TimeFilter.default({
      view,
      config: timeFilterConfig,
      filterMode,
      muteOpacity,
      muteGrayScale
    }) as TimeFilter;
    const timeFilterExpand = new Expand.default({
      view,
      content: timeFilter,
      id: "timeFilterExpand",
      group,
      expanded: true,
      expandTooltip: i18nInteractiveLegend.timeFilterLabel,
      collapseTooltip: i18nInteractiveLegend.timeFilterLabel,
      mode: "floating"
    });

    view.ui.add(timeFilterExpand, timeFilterPosition);
  } else if (propertyName === "timeFilterConfig") {
    if (node.content) {
      (node.content as TimeFilter).config = timeFilterConfig;
    }
  } else if (propertyName === "filterMode") {
    if (node.content) {
      (node.content as TimeFilter).filterMode = filterMode;
    }
  } else if (propertyName === "muteOpacity") {
    if (node.content) {
      (node.content as TimeFilter).muteOpacity = muteOpacity;
    }
  } else if (propertyName === "muteGrayScale") {
    if (node.content) {
      (node.content as TimeFilter).muteGrayScale = muteGrayScale;
    }
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

  const layerListPosVal =
    typeof layerListPosition === "string"
      ? layerListPosition
      : layerListPosition.position;

  const group =
    layerListPosVal.indexOf("left") !== -1
      ? "left"
      : layerListPosVal.indexOf("right") !== -1
      ? "right"
      : null;

  if (node && propertyName === "layerListPosition") {
    node.expanded = false;
    node.group = group;
    view.ui.move(node, layerListPosition);
  } else if (propertyName === "layerList") {
    const layerList = new LayerList.default({ view }) as __esri.LayerList;
    const layerListExpand = new Expand.default({
      view,
      content: layerList,
      id: "layerListExpand",
      group,
      expandTooltip: i18nInteractiveLegend.layerListLabel,
      collapseTooltip: i18nInteractiveLegend.layerListLabel
    });

    view.ui.add(layerListExpand, layerListPosition);
  }
}

export async function addBookmarks(props: esriWidgetProps) {
  const { view, config, propertyName } = props;
  const { bookmarks, bookmarksPosition } = config;

  const modules = await eachAlways([
    import("esri/widgets/Bookmarks"),
    import("esri/widgets/Expand")
  ]);

  const [Bookmarks, Expand] = modules.map(module => module.value);

  const node = view.ui.find("bookmarksExpand") as __esri.Expand;

  if (!bookmarks) {
    if (node) {
      view.ui.remove(node);
    }
    return;
  }

  const bookmarksPosVal =
    typeof bookmarksPosition === "string"
      ? bookmarksPosition
      : bookmarksPosition.position;

  const group =
  bookmarksPosVal.indexOf("left") !== -1
      ? "left"
      : bookmarksPosVal.indexOf("right") !== -1
      ? "right"
      : null;

  if (node && propertyName === "bookmarksPosition") {
    node.expanded = false;
    node.group = group;
    view.ui.move(node, bookmarksPosition);
  } else if (propertyName === "bookmarks") {
    const bookmarks = new Bookmarks.default({ view }) as __esri.Bookmarks;
    const bookmarksExpand = new Expand.default({
      view,
      content: bookmarks,
      id: "bookmarksExpand",
      group,
      expandTooltip: i18nInteractiveLegend.bookmarksLabel,
      collapseTooltip: i18nInteractiveLegend.bookmarksLabel
    });

    view.ui.add(bookmarksExpand, bookmarksPosition);
  }
}

export async function addShare(props: esriWidgetProps) {
  const { view, config, propertyName } = props;
  const { share, sharePosition, theme } = config;

  const modules = await eachAlways([import("Share")]);

  const [Share] = modules.map(module => module.value);

  const node = view.ui.find("share") as __esri.Expand;

  if (!share) {
    if (node) {
      view.ui.remove(node);
    }
    return;
  }

  const sharePosVal =
    typeof sharePosition === "string" ? sharePosition : sharePosition.position;

  const group =
    sharePosVal.indexOf("left") !== -1
      ? "left"
      : sharePosVal.indexOf("right") !== -1
      ? "right"
      : null;

  if (node && propertyName === "sharePosition") {
    node.expanded = false;
    node.group = group;
    view.ui.move(node, sharePosition);
  } else if (node && propertyName === "theme") {
    node.set("theme", theme);
    setShareButtonTheme(theme);
  } else if (propertyName === "share") {
    const share = new Share.default({
      id: "share",
      view,
      theme,
      shareFeatures: {
        embedMap: false
      }
    });
    view.ui.add(share, sharePosition);

    setShareButtonTheme(theme);
  }
}

export async function addZoom(props: esriWidgetProps) {
  const { view, config, propertyName } = props;
  const { mapZoom, mapZoomPosition } = config;

  const Zoom = await import("esri/widgets/Zoom");

  const node = findNode("esri-zoom");

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

  const searchPosVal =
    typeof searchPosition === "string"
      ? searchPosition
      : searchPosition.position;

  const group =
    searchPosVal.indexOf("left") !== -1
      ? "left"
      : searchPosVal.indexOf("right") !== -1
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
        const layerFromMap = source?.layer?.id
          ? view.map.findLayerById(source.layer.id)
          : null;
        if (layerFromMap) {
          source.layer = layerFromMap;
        } else if (source?.layer?.url) {
          source.layer = new FeatureLayer.default(source?.layer?.url);
        }
      });
    }
    const content = new Search.default({
      view,
      portal,
      ...searchConfiguration
    });

    const geometry = view?.constraints?.geometry;
    if (geometry) {
      content.sources.forEach(source => {
        source.filter = {
          geometry
        };
      });
    } else {
      content.sources.forEach(source => {
        source.filter = null;
      });
    }

    const searchExpand = new Expand.default({
      expanded: searchOpenAtStart,
      id: "searchExpand",
      content,
      mode: "floating",
      group,
      view,
      expandTooltip: i18nInteractiveLegend.searchLabel,
      collapseTooltip: i18nInteractiveLegend.searchLabel
    });
    view.ui.add(searchExpand, searchPosition);

    return content;
  }
}

export async function addInfoPanel(
  props: esriWidgetProps,
  base: ApplicationBase
): Promise<void> {
  const { view, config, propertyName } = props;
  const { infoPanel, infoPanelPosition, screenshot, theme } = config;

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

  const infoPosVal =
    typeof infoPanelPosition === "string"
      ? infoPanelPosition
      : infoPanelPosition.position;

  const group =
    infoPosVal.indexOf("left") !== -1
      ? "left"
      : infoPosVal.indexOf("right") !== -1
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
      infoContent,
      theme
    });

    const infoExpand = new Expand.default({
      id: "infoExpand",
      view,
      group,
      content: infoWidget,
      mode: "floating",
      expandTooltip: infoWidget.label,
      collapseTooltip: infoWidget.label
    }) as __esri.Expand;

    infoWidget.expandWidget = infoExpand;

    view.ui.add(infoExpand, infoPanelPosition);
    return infoWidget;
  }
}

export function findNode(className: string): HTMLElement {
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
    includeLegendInScreenshot,
    includePopupInScreenshot,
    featureCount,
    theme
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

  const screenshotPosVal =
    typeof screenshotPosition === "string"
      ? screenshotPosition
      : screenshotPosition.position;

  const group =
    screenshotPosVal.indexOf("left") !== -1
      ? "left"
      : screenshotPosVal.indexOf("right") !== -1
      ? "right"
      : null;

  if (propertyName === "screenshot" && screenshot) {
    const screenshot = new Screenshot.default({
      view,
      enableLegendOption,
      enablePopupOption,
      includeLegendInScreenshot: enableLegendOption
        ? includeLegendInScreenshot
        : false,
      includePopupInScreenshot: enablePopupOption
        ? includePopupInScreenshot
        : false,
      selectedStyleData,
      legendFeatureCountEnabled: featureCount,
      layerListViewModel: layerList.viewModel,
      theme,
      includeLayoutOption: true
    });

    const expand = new Expand.default({
      id: "screenshotExpand",
      view,
      group,
      content: screenshot,
      mode: "floating",
      expandTooltip: screenshot.label,
      collapseTooltip: screenshot.label
    });
    view.ui.add(expand, screenshotPosition);
    return screenshot;
  } else if (propertyName === "screenshotPosition") {
    node.expanded = false;
    node.group = group;
    view.ui.move(node, screenshotPosition);
  }
}

export async function updateAppTheme(theme: string): Promise<void> {
  const style = document.getElementById("esri-stylesheet") as any;
  style.href =
    style.href.indexOf("light") !== -1
      ? style.href.replace(/light/g, theme)
      : style.href.replace(/dark/g, theme);
}

function setShareButtonTheme(theme: string): void {
  const buttonInterval = setInterval(() => {
    const shareButton = findNode("esri-share__share-button");

    if (shareButton) {
      clearInterval(buttonInterval);
    }

    if (!shareButton) {
      return;
    }

    if (theme === "dark") {
      shareButton.classList.add("esri-share__dark-theme--button");
    } else {
      shareButton.classList.remove("esri-share__dark-theme--button");
    }
  }, 1);
}
