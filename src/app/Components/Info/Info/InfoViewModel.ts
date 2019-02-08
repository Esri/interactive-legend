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

import Expand = require("esri/widgets/Expand");

@subclass("InfoViewModel")
class InfoViewModel extends declared(Accessor) {
  @property()
  selectedItemIndex: number = 0;

  @property()
  expandWidget: Expand = null;

  @property()
  infoContent: InfoContentItem[] = [];
}

export = InfoViewModel;
