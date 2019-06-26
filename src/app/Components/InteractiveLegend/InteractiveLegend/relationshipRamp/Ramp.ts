/// <amd-dependency path="esri/core/tsSupport/assignHelper" name="__assign" />
/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

// esri.core.Accessor
import Accessor = require("esri/core/Accessor");

// esri.core.accessorSupport
import {
  declared,
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

@subclass("Ramp")
class Ramp extends declared(Accessor) {
  constructor(value?: any) {
    super();
  }

  @property()
  rampDiv: any = null;

  @property()
  shape: any = null;
}

export = Ramp;
