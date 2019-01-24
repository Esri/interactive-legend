/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/accessorSupport/decorators"], function (require, exports, __extends, __decorate, Accessor, decorators_1) {
    "use strict";
    var Create2DColorRamp = /** @class */ (function (_super) {
        __extends(Create2DColorRamp, _super);
        function Create2DColorRamp(value) {
            var _this = _super.call(this) || this;
            // colorRampProperties
            _this.colorRampProperties = null;
            return _this;
        }
        //----------------------------------
        //
        //  Public Methods
        //
        //----------------------------------
        // generateCells
        Create2DColorRamp.prototype.generateCells = function () {
            var _a = this.colorRampProperties, surface = _a.surface, colors = _a.colors, numClasses = _a.numClasses, size = _a.size, gfxMatrix = _a.gfxMatrix, translateX = _a.translateX, translateY = _a.translateY, centerX = _a.centerX, centerY = _a.centerY, rotation = _a.rotation;
            var shapeGroup = surface.createGroup();
            var groupSize = size || 75;
            var cellSize = groupSize / numClasses;
            for (var i = 0; i < numClasses; i++) {
                var y = i * cellSize;
                for (var j = 0; j < numClasses; j++) {
                    var fill = colors[i][j];
                    var x = j * cellSize;
                    shapeGroup
                        .createRect({ x: x, y: y, width: cellSize, height: cellSize })
                        .setFill(fill);
                }
            }
            shapeGroup.applyTransform(gfxMatrix.translate(translateX, translateY));
            shapeGroup.applyTransform(gfxMatrix.rotategAt(rotation, centerX, centerY));
            return;
        };
        __decorate([
            decorators_1.property()
        ], Create2DColorRamp.prototype, "colorRampProperties", void 0);
        Create2DColorRamp = __decorate([
            decorators_1.subclass("Create2DColorRamp")
        ], Create2DColorRamp);
        return Create2DColorRamp;
    }(decorators_1.declared(Accessor)));
    return Create2DColorRamp;
});
//# sourceMappingURL=Create2DColorRamp.js.map