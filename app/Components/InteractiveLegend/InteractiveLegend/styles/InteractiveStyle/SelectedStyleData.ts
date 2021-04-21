import { property, subclass } from "esri/core/accessorSupport/decorators";
import Accessor = require("esri/core/Accessor");
import Collection = require("esri/core/Collection");

@subclass("SelectedStyleData")
class SelectedStyleData extends Accessor {
  @property()
  activeLayerInfo: __esri.ActiveLayerInfo = null;

  @property()
  layerItemId: string = null;

  @property()
  selectedInfoIndexes: number[][] = [];

  @property()
  field: string = null;

  @property()
  applyStyles: boolean = null;

  @property()
  featureLayerView: __esri.FeatureLayerView = null;

  @property()
  normalizationField: string = null;

  @property()
  queryExpressions: string[] = [];

  @property()
  featureCount: Collection<number[]> = new Collection();

  @property()
  totalFeatureCount = null;
}

export = SelectedStyleData;
