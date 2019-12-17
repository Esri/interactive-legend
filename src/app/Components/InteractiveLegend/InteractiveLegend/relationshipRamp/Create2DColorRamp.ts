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

// esri.views.MapView
import MapView = require("esri/views/MapView");

// esri.core.Collection
import Collection = require("esri/core/Collection");

// esri.widgets.Legend.support
import ActiveLayerInfo = require("esri/widgets/Legend/support/ActiveLayerInfo");

// esri.core.Handles
import Handles = require("esri/core/Handles");

// esri.core.watchUtils
import watchUtils = require("esri/core/watchUtils");

// esri.views.layers.FeatureLayerView
import FeatureLayerView = require("esri/views/layers/FeatureLayerView");

// interfaces
import {
  RelationshipRampElement,
  ColorRampProperties,
  MinMaxData,
  RelationshipExpressionParams
} from "../../../../interfaces/interfaces";

// esri.views.layers.support.FeatureEffect
import FeatureEffect = require("esri/views/layers/support/FeatureEffect");

// relationshipRampUtils
import { twoClasses, threeClasses, fourClasses } from "./relationshipRampUtils";

// esri.views.layers.support.FeatureFilter
import FeatureFilter = require("esri/views/layers/support/FeatureFilter");

// esri.core.promiseUtils
import promiseUtils = require("esri/core/promiseUtils");

@subclass("Create2DColorRamp")
class Create2DColorRamp extends declared(Accessor) {
  //----------------------------------
  //
  //  Properties
  //
  //----------------------------------
  private _handles = new Handles();
  private _cellNodeCounter: number = 0;
  private _cellNodes: any[] = null;

  @property()
  queryCountExpressions = [];

  @property()
  queryExpressions: string[] = [];

  // view
  @property()
  view: MapView = null;

  // legendElement
  @property()
  legendElement: RelationshipRampElement = null;

  // id
  @property()
  id: string = null;

  // activeLayerInfos
  @property()
  activeLayerInfos: Collection<ActiveLayerInfo> = null;

  // colorRampProperties
  @property()
  colorRampProperties: ColorRampProperties = null;

  // renderers
  @property()
  layerView: FeatureLayerView = null;

  // filterMode
  @property()
  filterMode: string = null;

  // opacity
  @property()
  opacity: number = null;

  // grayScale
  @property()
  grayScale: number = null;

  @property()
  featureCount: number = null;

  @property()
  searchViewModel: __esri.SearchViewModel = null;

  @property()
  layerListViewModel: __esri.LayerListViewModel = null;

  @property()
  featureCountEnabled: boolean = null;

  //----------------------------------
  //
  //  Lifecycle Methods
  //
  //----------------------------------
  constructor(value?: any) {
    super();
  }

  initialize() {
    this._handles.add([
      watchUtils.when(
        this,
        ["layerView", "searchViewModel", "layerListViewModel"],
        () => {
          this._handleCellBehavior();
          if (this.featureCountEnabled) {
            const queryFeatureCount = promiseUtils.debounce(() => {
              const where =
                this.queryExpressions.join(" OR ") === ""
                  ? this.queryCountExpressions.join(" OR ")
                  : this.queryExpressions.join(" OR ");

              const geometry = this.view && this.view.get("extent");
              const outSpatialReference =
                this.view && this.view.get("spatialReference");
              const queryFeatureCount =
                this.layerView &&
                this.layerView.queryFeatureCount &&
                this.layerView.queryFeatureCount({
                  geometry,
                  outSpatialReference,
                  where
                });
              if (!queryFeatureCount) {
                return;
              }
              return queryFeatureCount.then(totalFeatureCount => {
                this.set("featureCount", totalFeatureCount);
              });
            });

            const featureCountKey = "feature-count-key";

            if (!this._handles.has(featureCountKey)) {
              this._handles.add(
                [
                  watchUtils.whenFalse(this.view, "stationary", () => {
                    if (!this.view.stationary) {
                      watchUtils.whenTrueOnce(this.view, "stationary", () => {
                        queryFeatureCount();
                      });
                    } else {
                      watchUtils.whenFalseOnce(this.view, "interacting", () => {
                        queryFeatureCount();
                      });
                    }
                  }),
                  watchUtils.whenFalse(this.layerView, "updating", () => {
                    watchUtils.whenFalseOnce(this.layerView, "updating", () => {
                      queryFeatureCount();
                    });
                  })
                ],
                featureCountKey
              );
            }
          }
        }
      ),
      watchUtils.init(this, "layerView", () => {
        if (this.filterMode === "featureFilter") {
          const layerViewFilterKey = "layer-view-filter";
          this._handles.remove(layerViewFilterKey);
          this._handles.add(
            watchUtils.when(this, "layerView.filter", () => {
              const layerViewFilterWhereKey = "layer-view-filter-where";
              this._handles.remove(layerViewFilterWhereKey);
              this._handles.add(
                watchUtils.watch(this, "layerView.filter.where", () => {
                  const cellGroup = this.colorRampProperties.surface.children[0]
                    .children;
                  if (!this.layerView.filter) {
                    cellGroup.forEach(cell => {
                      cell.rawNode.removeAttribute("stroke");
                      cell.rawNode.removeAttribute("stroke-width");
                      cell.rawNode.removeAttribute("stroke-opacity");
                      cell.rawNode.classList.remove(
                        "esri-interactive-legend--selected-cell"
                      );
                    });
                    this.queryExpressions = [];
                    this._queryFeatureCount();
                  }
                }),
                layerViewFilterWhereKey
              );
            }),
            layerViewFilterKey
          );
        } else {
          const layerViewEffectKey = "layer-view-effect";
          this._handles.remove(layerViewEffectKey);
          this._handles.add(
            watchUtils.when(this, "layerView.effect", () => {
              const layerViewEffectWhereKey = "layer-view-effect-where";
              this._handles.remove(layerViewEffectWhereKey);
              this._handles.add(
                watchUtils.watch(this, "layerView.effect.filter.where", () => {
                  const cellGroup = this.colorRampProperties.surface.children[0]
                    .children;
                  if (!this.layerView.filter) {
                    cellGroup.forEach(cell => {
                      const { rawNode } = cell;

                      rawNode.removeAttribute("stroke");
                      rawNode.removeAttribute("stroke-width");
                      rawNode.removeAttribute("stroke-opacity");
                      rawNode.classList.remove(
                        "esri-interactive-legend--selected-cell"
                      );
                    });
                    this.queryExpressions = [];
                    this._queryFeatureCount();
                  }
                }),
                layerViewEffectWhereKey
              );
            }),
            layerViewEffectKey
          );
        }
      })
    ]);
  }

  destroy() {
    this._handles.removeAll();
    this._handles.destroy();
    this._handles = null;
  }

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
    this._handleCellBehavior();
    return;
  }

  //----------------------------------
  //
  //  Private Methods
  //
  //----------------------------------

  private _handleCellBehavior(): void {
    const { legendElement } = this;
    const authoringInfo =
      this.layerView && this.layerView.layer && this.layerView.layer.renderer
        ? this.layerView.layer.renderer.authoringInfo
        : null;
    if (
      legendElement.type === "relationship-ramp" &&
      authoringInfo &&
      authoringInfo.field1 &&
      authoringInfo.field2
    ) {
      this._applyCellBehavior(this.colorRampProperties.surface);
    }
  }

  // _applyCellBehavior
  private _applyCellBehavior(surface: any): void {
    if (surface.children.length === 0) {
      return;
    }
    const cellGroup = surface.children[0].children;
    cellGroup.map((cell, cellIndex) => {
      const uvInfos = (this.layerView.layer
        .renderer as __esri.UniqueValueRenderer).uniqueValueInfos;
      if (
        this.legendElement.type === "relationship-ramp" &&
        this.layerView.layer.renderer.authoringInfo &&
        uvInfos
      ) {
        if (uvInfos[cellIndex]) {
          const color = uvInfos[cellIndex].symbol.color;
          uvInfos.forEach((uvInfo, index) => {
            const itemColor = uvInfo.symbol.color;
            if (
              color.r === itemColor.r &&
              color.g === itemColor.g &&
              color.b === itemColor.b &&
              color.a === itemColor.a
            ) {
              this._setCellAttributes(cell, index);
            }
          });
          cell.rawNode.classList.add(
            "esri-interactive-legend__svg-rect-element"
          );
        }
      }
    });
    const cellItems = this._reorderCellNodes(cellGroup);
    this._attachFeatureIndexes(cellItems);
    this._cellNodes = cellItems;
    this._applyEventHandlers(cellGroup);
  }

  private _generateTotalFeatureCount() {
    const where =
      this.queryExpressions.join(" OR ") === ""
        ? this.queryCountExpressions.join(" OR ")
        : this.queryExpressions.join(" OR ");
    this.layerView
      .queryFeatureCount({
        where
      })
      .then(totalFeatureCount => {
        this.set("featureCount", totalFeatureCount);
      });
  }

  // _reorderCellNodes
  private _reorderCellNodes(cellGroup: any): any[] {
    const cellItems = [];
    while (this._cellNodeCounter <= cellGroup.length - 1) {
      cellGroup.map(cell => {
        if (
          parseInt(cell.rawNode.getAttribute("data-cell-index")) ===
          this._cellNodeCounter
        ) {
          cellItems.push(cell);
        }
      });
      this._cellNodeCounter++;
    }
    this._cellNodeCounter = 0;
    return cellItems;
  }

  // _attachFeatureIndexes
  private _attachFeatureIndexes(cellItems: any[]): void {
    const focus = this.colorRampProperties.focus;
    focus === "HH" || focus === null
      ? this._relationshipFocusIsHighHigh(cellItems)
      : focus === "LL"
      ? this._relationshipFocusIsLowLow(cellItems)
      : focus === "LH"
      ? this._relationshipFocusIsLowHigh(cellItems)
      : focus === "HL"
      ? this._relationshipFocusIsHighLow(cellItems)
      : null;
    this._cellNodeCounter = 0;
  }

  // _relationshipFocusIsHighHigh
  private _relationshipFocusIsHighHigh(cellItems: any[]): void {
    for (let i = this.colorRampProperties.numClasses - 1; i >= 0; i--) {
      for (let j = this.colorRampProperties.numClasses - 1; j >= 0; j--) {
        this._setDataAttributes(cellItems, i, j);
        this._cellNodeCounter++;
      }
    }
  }

  // _relationshipFocusIsLowLow
  private _relationshipFocusIsLowLow(cellItems: any[]): void {
    for (let i = 0; i < this.colorRampProperties.numClasses; i++) {
      for (let j = 0; j < this.colorRampProperties.numClasses; j++) {
        this._setDataAttributes(cellItems, i, j);
        this._cellNodeCounter++;
      }
    }
  }

  // _relationshipFocusIsLowHigh
  private _relationshipFocusIsLowHigh(cellItems: any[]): void {
    for (let i = 0; i < this.colorRampProperties.numClasses; i++) {
      for (let j = this.colorRampProperties.numClasses - 1; j >= 0; j--) {
        this._setDataAttributes(cellItems, i, j);
        this._cellNodeCounter++;
      }
    }
  }

  // _relationshipFocusIsHighLow
  private _relationshipFocusIsHighLow(cellItems: any[]): void {
    for (let j = this.colorRampProperties.numClasses - 1; j >= 0; j--) {
      for (let i = 0; i < this.colorRampProperties.numClasses; i++) {
        this._setDataAttributes(cellItems, i, j);
        this._cellNodeCounter++;
      }
    }
  }

  // _setDataAttributes
  private _setDataAttributes(cellItems, i, j): void {
    const rawNode = cellItems[this._cellNodeCounter].rawNode;
    if (this.colorRampProperties.numClasses === 2) {
      this._twoClassAttributes(rawNode, i, j);
    } else if (this.colorRampProperties.numClasses === 3) {
      this._threeClassAttributes(rawNode, i, j);
    } else {
      this._fourClassAttributes(rawNode, i, j);
    }
  }

  // _setCellAttributes
  private _setCellAttributes(cell: any, index: number): void {
    const uvInfo = (this.layerView.layer.renderer as __esri.UniqueValueRenderer)
      .uniqueValueInfos;
    if (
      this.legendElement.type === "relationship-ramp" &&
      this.layerView.layer.renderer.authoringInfo &&
      uvInfo
    ) {
      const numClasses = this.colorRampProperties.numClasses;
      const newIndex = this._generateIndexPattern(numClasses, index);
      if (uvInfo[newIndex]) {
        cell.rawNode.setAttribute(
          "data-color",
          `${uvInfo[newIndex].symbol.color}`
        );
        cell.rawNode.setAttribute("data-cell-index", `${newIndex}`);
        cell.rawNode.setAttribute("tabindex", "0");
      }
    }
  }

  // _setDataCellFocus
  private _setDataCellFocus(rawNode: any, i: number, j: number): void {
    const { numClasses } = this.colorRampProperties;
    if (numClasses === 2) {
      this._setDataCellFocusForTwoClasses(rawNode, i, j);
    } else if (numClasses === 3) {
      this._setDataCellFocusForThreeClasses(rawNode, i, j);
    } else if (numClasses === 4) {
      this._setDataCellFocusForFourClasses(rawNode, i, j);
    }
  }

  private _setDataCellFocusForTwoClasses(
    rawNode: HTMLElement,
    i: number,
    j: number
  ): void {
    i === 0 && j === 0
      ? rawNode.setAttribute("data-cell-focus", "LL")
      : i === 0 && j === 1
      ? rawNode.setAttribute("data-cell-focus", "LH")
      : i === 1 && j === 0
      ? rawNode.setAttribute("data-cell-focus", "HL")
      : i === 1 && j === 1
      ? rawNode.setAttribute("data-cell-focus", "HH")
      : null;
  }

  private _setDataCellFocusForThreeClasses(
    rawNode: HTMLElement,
    i: number,
    j: number
  ): void {
    i === 0 && j === 0
      ? rawNode.setAttribute("data-cell-focus", "LL")
      : i === 0 && j === 1
      ? rawNode.setAttribute("data-cell-focus", "LM")
      : i === 0 && j === 2
      ? rawNode.setAttribute("data-cell-focus", "LH")
      : i === 1 && j === 0
      ? rawNode.setAttribute("data-cell-focus", "ML")
      : i === 1 && j === 1
      ? rawNode.setAttribute("data-cell-focus", "MM")
      : i === 1 && j === 2
      ? rawNode.setAttribute("data-cell-focus", "MH")
      : i === 2 && j === 0
      ? rawNode.setAttribute("data-cell-focus", "HL")
      : i === 2 && j === 1
      ? rawNode.setAttribute("data-cell-focus", "HM")
      : i === 2 && j === 2
      ? rawNode.setAttribute("data-cell-focus", "HH")
      : null;
  }

  private _setDataCellFocusForFourClasses(
    rawNode: HTMLElement,
    i: number,
    j: number
  ): void {
    i === 0 && j === 0
      ? rawNode.setAttribute("data-cell-focus", "LL")
      : i === 0 && j === 1
      ? rawNode.setAttribute("data-cell-focus", "LM1")
      : i === 0 && j === 2
      ? rawNode.setAttribute("data-cell-focus", "LM2")
      : i === 0 && j === 3
      ? rawNode.setAttribute("data-cell-focus", "LH")
      : i === 1 && j === 0
      ? rawNode.setAttribute("data-cell-focus", "M1L")
      : i === 1 && j === 1
      ? rawNode.setAttribute("data-cell-focus", "M1M1")
      : i === 1 && j === 2
      ? rawNode.setAttribute("data-cell-focus", "M1M2")
      : i === 1 && j === 3
      ? rawNode.setAttribute("data-cell-focus", "M1H")
      : i === 2 && j === 0
      ? rawNode.setAttribute("data-cell-focus", "M2L")
      : i === 2 && j === 1
      ? rawNode.setAttribute("data-cell-focus", "M2M1")
      : i === 2 && j === 2
      ? rawNode.setAttribute("data-cell-focus", "M2M2")
      : i === 2 && j === 3
      ? rawNode.setAttribute("data-cell-focus", "M2H")
      : i === 3 && j === 0
      ? rawNode.setAttribute("data-cell-focus", "HL")
      : i === 3 && j === 1
      ? rawNode.setAttribute("data-cell-focus", "HM1")
      : i === 3 && j === 2
      ? rawNode.setAttribute("data-cell-focus", "HM2")
      : i === 3 && j === 3
      ? rawNode.setAttribute("data-cell-focus", "HH")
      : null;
  }

  // _generateIndexPattern
  private _generateIndexPattern(numClasses: number, index: number): number {
    const focus = this.colorRampProperties.focus;
    if (focus === "HL") {
      return index;
    }
    return numClasses === 2
      ? twoClasses(index, focus)
      : numClasses === 3
      ? threeClasses(index, focus)
      : numClasses === 4
      ? fourClasses(index, focus)
      : null;
  }

  // _swapDataFeatureIndexes
  private _swapDataFeatureIndexes(
    rawNode: HTMLElement,
    i: number,
    j: number
  ): void {
    rawNode.setAttribute("data-feature-i", `${j}`);
    rawNode.setAttribute("data-feature-j", `${i}`);
    this._setDataCellFocus(rawNode, j, i);
  }

  // _setDataFeatureIndexes
  private _setDataFeatureIndexes(
    rawNode: HTMLElement,
    i: number,
    j: number
  ): void {
    rawNode.setAttribute("data-feature-i", `${i}`);
    rawNode.setAttribute("data-feature-j", `${j}`);
    this._setDataCellFocus(rawNode, i, j);
  }

  // _twoClassAttributes
  private _twoClassAttributes(
    rawNode: HTMLElement,
    i: number,
    j: number
  ): void {
    if (this._cellNodeCounter === 0 || this._cellNodeCounter === 3) {
      this.colorRampProperties.focus === "HL"
        ? this._swapDataFeatureIndexes(rawNode, i, j)
        : this._setDataFeatureIndexes(rawNode, i, j);
    } else {
      this.colorRampProperties.focus === "HL"
        ? this._swapDataFeatureIndexes(rawNode, i, j)
        : this._setDataFeatureIndexes(rawNode, i, j);
    }
  }

  // _threeClassAttributes
  private _threeClassAttributes(rawNode: any, i: number, j: number): void {
    if (
      this._cellNodeCounter === 1 ||
      this._cellNodeCounter === 3 ||
      this._cellNodeCounter === 5 ||
      this._cellNodeCounter === 7
    ) {
      this.colorRampProperties.focus === "HL"
        ? this._swapDataFeatureIndexes(rawNode, i, j)
        : this._setDataFeatureIndexes(rawNode, i, j);
    } else {
      this.colorRampProperties.focus !== "HL"
        ? this._setDataFeatureIndexes(rawNode, i, j)
        : this._swapDataFeatureIndexes(rawNode, i, j);
    }
  }

  // _fourClassAttributes
  private _fourClassAttributes(rawNode: any, i: number, j: number): void {
    if (
      this._cellNodeCounter === 1 ||
      this._cellNodeCounter === 2 ||
      this._cellNodeCounter === 4 ||
      this._cellNodeCounter === 5 ||
      this._cellNodeCounter === 7 ||
      this._cellNodeCounter === 8 ||
      this._cellNodeCounter === 10 ||
      this._cellNodeCounter === 11 ||
      this._cellNodeCounter === 13 ||
      this._cellNodeCounter === 14
    ) {
      this.colorRampProperties.focus === "HL"
        ? this._swapDataFeatureIndexes(rawNode, i, j)
        : this._setDataFeatureIndexes(rawNode, i, j);
    } else {
      this.colorRampProperties.focus !== "HL"
        ? this._setDataFeatureIndexes(rawNode, i, j)
        : this._swapDataFeatureIndexes(rawNode, i, j);
    }
  }

  // _applyEventHandlers
  private _applyEventHandlers(cellGroup: any[]) {
    cellGroup.map((cell, cellIndex) => {
      const i = cell.rawNode.getAttribute("data-feature-i");
      const j = cell.rawNode.getAttribute("data-feature-j");
      const focus = cell.rawNode.getAttribute("data-cell-focus");
      cell.rawNode.onclick = () => {
        this._handleFilter(i, j, focus);
        this._handleSelectedElement(cell);
        if (this.featureCountEnabled) {
          this._queryFeatureCount();
        }
      };
      cell.rawNode.onkeydown = event => {
        if (event.keyCode === 32) {
          this._handleFilter(i, j, focus);
          this._handleSelectedElement(cell);
          if (this.featureCountEnabled) {
            this._queryFeatureCount();
          }
        }
      };

      if (this.featureCountEnabled) {
        const { authoringInfo } = this.layerView.layer.renderer;
        const { field1, field2 } = authoringInfo;
        const expressionParams = this._generateExpressionParams(
          field1,
          field2,
          authoringInfo,
          i,
          j,
          focus
        ) as RelationshipExpressionParams;

        const queryExpression = this._generateExpressionForRelationship(
          expressionParams
        );
        this.queryCountExpressions.push(queryExpression);
        const { numClasses } = this.colorRampProperties;
        const { length } = this.queryCountExpressions;
        if (
          (numClasses === 2 && length === 4 && cellIndex === 3) ||
          (numClasses === 3 && length === 9 && cellIndex === 8) ||
          (numClasses === 4 && length === 16 && cellIndex === 15)
        ) {
          this._generateTotalFeatureCount();
        }
      }
    });
  }

  private _queryFeatureCount() {
    const where =
      this.queryExpressions.join(" OR ") === ""
        ? this.queryCountExpressions.join(" OR ")
        : this.queryExpressions.join(" OR ");

    const geometry = this.view && this.view.get("extent");
    const outSpatialReference = this.view && this.view.get("spatialReference");

    this.layerView
      .queryFeatureCount({
        geometry,
        outSpatialReference,
        where
      })
      .then(totalFeatureCount => {
        this.set("featureCount", totalFeatureCount);
      });
  }

  // _handleSelectedElement
  private _handleSelectedElement(cell: any): void {
    const cellClass = cell.rawNode.classList;
    if (!cellClass.contains("esri-interactive-legend--selected-cell")) {
      cellClass.add("esri-interactive-legend--selected-cell");
      cell.rawNode.setAttribute("stroke", "black");
      cell.rawNode.setAttribute("stroke-width", "3px");
      cell.rawNode.setAttribute("stroke-opacity", "1");
    } else {
      cell.rawNode.removeAttribute("stroke");
      cell.rawNode.removeAttribute("stroke-width");
      cell.rawNode.removeAttribute("stroke-opacity");
      cellClass.remove("esri-interactive-legend--selected-cell");
    }
  }

  // _handleDefinitionExpression
  private _handleFilter(i: number, j: number, focus: string): void {
    const { authoringInfo } = this.layerView.layer.renderer;
    const { field1, field2 } = authoringInfo;
    const { queryExpressions } = this;
    if (
      this.legendElement.type === "relationship-ramp" &&
      authoringInfo &&
      field1 &&
      field2
    ) {
      const expressionParams = this._generateExpressionParams(
        field1,
        field2,
        authoringInfo,
        i,
        j,
        focus
      ) as RelationshipExpressionParams;

      const queryExpression = this._generateExpressionForRelationship(
        expressionParams
      );

      if (queryExpressions.length === 0) {
        queryExpressions[0] = queryExpression;
      } else {
        if (queryExpressions.indexOf(queryExpression) === -1) {
          queryExpressions.push(queryExpression);
        } else {
          queryExpressions.splice(queryExpressions.indexOf(queryExpression), 1);
        }
      }
      const where = this.queryExpressions.join(" OR ");
      if (this.filterMode === "mute") {
        const opacity = this.opacity || this.opacity === 0 ? this.opacity : 30;
        const grayScale =
          this.grayScale || this.grayScale === 0 ? this.grayScale : 100;

        this.layerView.effect = new FeatureEffect({
          filter: new FeatureFilter({
            where
          }),
          excludedEffect: `grayscale(${grayScale}%) opacity(${opacity}%)`
        });
      } else if (this.filterMode === "featureFilter") {
        this.layerView.filter = new FeatureFilter({
          where
        });
      }
      this._setSearchExpression(where);
    }
  }

  private _generateExpressionParams(
    field1: __esri.AuthoringInfoField1,
    field2: __esri.AuthoringInfoField2,
    authoringInfo: __esri.AuthoringInfo,
    i: number,
    j: number,
    focus: string
  ): RelationshipExpressionParams {
    const data = [] as MinMaxData[][];
    const authoringInfofield1 = field1.field;
    const authoringInfofield2 = field2.field;
    const classBreakInfos1 = field1.classBreakInfos;
    const classBreakInfos2 = field2.classBreakInfos;
    const normalizationField1 = authoringInfo.field1.hasOwnProperty(
      "normalizationField"
    )
      ? authoringInfo.field1.normalizationField
      : null;
    const normalizationField2 = authoringInfo.field2.hasOwnProperty(
      "normalizationField"
    )
      ? authoringInfo.field2.normalizationField
      : null;
    classBreakInfos1.forEach((item, itemIndex1) => {
      const nestedData = [];
      classBreakInfos2.forEach((item2, itemIndex2) => {
        nestedData.push([
          classBreakInfos1[itemIndex1],
          classBreakInfos2[itemIndex2]
        ]);
      });
      data.push(nestedData);
    });
    const field1ToInclude = normalizationField1
      ? `(${authoringInfofield1}/${normalizationField1})`
      : `${authoringInfofield1}`;
    const field2ToInclude = normalizationField2
      ? `(${authoringInfofield2}/${normalizationField2})`
      : `${authoringInfofield2}`;

    return {
      data,
      i,
      j,
      field1: field1ToInclude,
      field2: field2ToInclude,
      focus
    };
  }

  // _generateExpressionForTwoClasses
  private _generateExpressionForRelationship(
    expressionParams: RelationshipExpressionParams
  ): string {
    const { focus, field1, field2, data, i, j } = expressionParams;
    return focus === "LL"
      ? `${field1} >= ${data[i][j][0].minValue} AND ${field1} <= ${
          data[i][j][0].maxValue
        } AND ${field2} >= ${data[i][j][1].minValue} AND ${field2} <= ${
          data[i][j][1].maxValue
        }`
      : focus === "LM" || focus === "LM1" || focus === "LM2" || focus === "LH"
      ? `${field1} >= ${data[i][j][0].minValue} AND ${field1} <= ${
          data[i][j][0].maxValue
        } AND ${field2} > ${data[i][j][1].minValue} AND ${field2} <= ${
          data[i][j][1].maxValue
        }`
      : focus === "ML" || focus === "M1L" || focus === "M2L" || focus === "HL"
      ? `${field1} > ${data[i][j][0].minValue} AND ${field1} <= ${
          data[i][j][0].maxValue
        } AND ${field2} >= ${data[i][j][1].minValue} AND ${field2} <= ${
          data[i][j][1].maxValue
        }`
      : `${field1} > ${data[i][j][0].minValue} AND ${field1} <= ${
          data[i][j][0].maxValue
        } AND ${field2} > ${data[i][j][1].minValue} AND ${field2} <= ${
          data[i][j][1].maxValue
        }`;
  }

  // _setSearchExpression
  private _setSearchExpression(filterExpression: string): void {
    if (!this.searchViewModel) {
      return;
    }

    this.searchViewModel.sources.forEach(
      (searchSource: __esri.LayerSearchSource) => {
        this.layerListViewModel.operationalItems.forEach(operationalItem => {
          if (
            searchSource.layer &&
            searchSource.layer.id === operationalItem.layer.id
          ) {
            if (filterExpression) {
              searchSource.filter = {
                where: filterExpression
              };
            } else {
              searchSource.filter = null;
            }
          }
        });
      }
    );
  }
}

export = Create2DColorRamp;
