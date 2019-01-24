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

// interfaces
import { ColorRampProperties } from "../../../../interfaces/interfaces";

@subclass("Create2DColorRamp")
class Create2DColorRamp extends declared(Accessor) {
  constructor(value?: any) {
    super();
  }

  // colorRampProperties
  @property()
  colorRampProperties: ColorRampProperties = null;

  //----------------------------------
  //
  //  Public Methods
  //
  //----------------------------------

  // generateCells
  generateCells(): void {
    const {
      surface,
      colors,
      numClasses,
      size,
      gfxMatrix,
      translateX,
      translateY,
      centerX,
      centerY,
      rotation
    } = this.colorRampProperties;
    const shapeGroup = surface.createGroup();
    const groupSize = size || 75;
    const cellSize = groupSize / numClasses;
    for (let i = 0; i < numClasses; i++) {
      const y = i * cellSize;
      for (let j = 0; j < numClasses; j++) {
        const fill = colors[i][j];
        const x = j * cellSize;

        shapeGroup
          .createRect({ x, y, width: cellSize, height: cellSize })
          .setFill(fill);
      }
    }
    shapeGroup.applyTransform(gfxMatrix.translate(translateX, translateY));
    shapeGroup.applyTransform(gfxMatrix.rotategAt(rotation, centerX, centerY));
    return;
  }
}

export = Create2DColorRamp;
