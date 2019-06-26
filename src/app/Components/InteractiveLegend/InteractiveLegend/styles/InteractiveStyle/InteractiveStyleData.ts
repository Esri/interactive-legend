/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";
import Accessor = require("esri/core/Accessor");
import Collection = require("esri/core/Collection");

@subclass("InteractiveStyleData")
class InteractiveStyleData extends declared(Accessor) {
  @property()
  queryExpressions: Collection<string[]> = new Collection();

  @property()
  featureCount: Collection<Collection<number>> = new Collection();

  @property()
  totalFeatureCount: number[] = [];
}

export = InteractiveStyleData;
