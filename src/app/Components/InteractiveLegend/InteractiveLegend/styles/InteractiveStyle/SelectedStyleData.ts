import {
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import Accessor = require("esri/core/Accessor");

@subclass("SelectedStyleData")
class SelectedStyleData extends Accessor {
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
