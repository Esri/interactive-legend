/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import Accessor = require("esri/core/Accessor");

@subclass("SelectedStyleData")
class SelectedStyleData extends declared(Accessor) {
  @property()
  layerItemId: string = null;

  @property()
  selectedInfoIndex: any = null;

  @property()
  field: string = null;

  @property()
  applyStyles: boolean = null;

  @property()
  featureLayerView: __esri.FeatureLayerView = null;

  @property()
  normalizationField: string = null;
}

export = SelectedStyleData;
