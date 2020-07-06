import {
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import Accessor = require("esri/core/Accessor");
import Collection = require("esri/core/Collection");

@subclass("InteractiveStyleData")
class InteractiveStyleData extends Accessor {
  @property()
  queryExpressions: Collection<string[]> = new Collection();

  @property()
  featureCount: Collection<Collection<number[]>> = new Collection();

  @property()
  totalFeatureCount: number[] = [];
}

export = InteractiveStyleData;
