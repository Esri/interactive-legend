// esri.core.Accessor
import Accessor = require("esri/core/Accessor");

// esri.core.accessorSupport
import {
  property,
  subclass
} from "esri/core/accessorSupport/decorators";

@subclass("Ramp")
class Ramp extends Accessor {
  constructor(value?: any) {
    super(value);
  }

  @property()
  rampDiv: any = null;

  @property()
  shape: any = null;
}

export = Ramp;
