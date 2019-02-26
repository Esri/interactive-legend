/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// esri.core
import Accessor = require("esri/core/Accessor");

// esri.core.accessorSupport
import {
  subclass,
  declared,
  property
} from "esri/core/accessorSupport/decorators";

import { InfoContentItem } from "../interfaces/interfaces";

// esri.widgets.Expand
import Expand = require("esri/widgets/Expand");

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.views.SceneView
import SceneView = require("esri/views/SceneView");

type State = "ready" | "loading" | "disabled";

@subclass("InfoViewModel")
class InfoViewModel extends declared(Accessor) {
  @property({
    dependsOn: ["view.ready"],
    readOnly: true
  })
  get state(): State {
    const ready = this.get("view.ready");
    return ready ? "ready" : this.view ? "loading" : "disabled";
  }

  @property()
  view: MapView | SceneView = null;

  @property()
  selectedItemIndex: number = 0;

  @property()
  expandWidget: Expand = null;

  @property()
  infoContent: InfoContentItem[] = [];

  // goToPage
  goToPage(event: Event, paginationNodes: any[]): void {
    const node = event.currentTarget as HTMLElement;
    const itemIndex = node.getAttribute("data-pagination-index");
    this.selectedItemIndex = parseInt(itemIndex);
    paginationNodes[this.selectedItemIndex].domNode.focus();
    this.notifyChange("state");
  }

  // nextPage
  nextPage(paginationNodes: any[]): void {
    if (this.selectedItemIndex !== this.infoContent.length - 1) {
      this.selectedItemIndex += 1;
      paginationNodes[this.selectedItemIndex].domNode.focus();
    }
  }

  // previousPage
  previousPage(paginationNodes: any[]): void {
    if (this.selectedItemIndex !== 0) {
      this.selectedItemIndex -= 1;
      paginationNodes[this.selectedItemIndex].domNode.focus();
    }
  }

  // closeInfoPanel
  closeInfoPanel(): void {
    this.selectedItemIndex = 0;
    this.expandWidget.expanded = false;
  }
}

export = InfoViewModel;
