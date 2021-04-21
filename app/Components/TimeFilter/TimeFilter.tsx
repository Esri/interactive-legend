import {
  subclass,
  property,
  aliasOf
} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import i18n = require("dojo/i18n!./TimeFilter/nls/resources");
import { tsx } from "esri/widgets/support/widget";
import TimeFilterViewModel from "./TimeFilter/TimeFilterViewModel";
import { ITimeFilterConfigItem, VNode } from "../../interfaces/interfaces";
import TimeSlider = require("esri/widgets/TimeSlider");
import { whenOnce } from "esri/core/watchUtils";

const base = "esri-time-filter";

const CSS = {
  base: `${base} esri-widget`,
  panel: "esri-widget--panel",
  selectLayerLabel: `${base}__layer-selector-label`,
  layerSelectorDropdown: `${base}__layer-selector-dropdown`,
  noTimeLayerContainer: `${base}__no-time-layer-container esri-widget esri-widget--panel`,
  icons: {
    clock: "esri-icon-time-clock"
  }
};

@subclass("TimeFilter")
class TimeFilter extends Widget {
  constructor(params) {
    super(params);
  }

  @property()
  iconClass: string = CSS.icons.clock;

  @aliasOf("viewModel.timeFilterConfigCollection")
  timeFilterConfigCollection: __esri.Collection<ITimeFilterConfigItem> = null;

  @aliasOf("viewModel.config")
  config = null;

  @aliasOf("viewModel.view")
  view: __esri.MapView = null;

  @aliasOf("viewModel.currentTimeConfigItem")
  currentTimeConfigItem: ITimeFilterConfigItem = null;

  @aliasOf("viewModel.timeSlider")
  timeSlider: __esri.TimeSlider = null;

  @aliasOf("viewModel.filterMode")
  filterMode: __esri.TimeSlider = null;

  @aliasOf("viewModel.muteOpacity")
  muteOpacity = null;

  @aliasOf("viewModel.muteGrayScale")
  muteGrayScale = null;

  @property({ type: TimeFilterViewModel })
  viewModel: TimeFilterViewModel = new TimeFilterViewModel();

  postInitialize() {
    whenOnce(this, "timeFilterConfigCollection.length", () => {
      this.currentTimeConfigItem = this.timeFilterConfigCollection.getItemAt(0);
    });
  }

  render() {
    const layerSelector = this._renderLayerSelector();
    const timeSlider = this._renderTimeSlider();
    const noTimeLayers = this.viewModel.timeFilterConfigCollection.length === 0;
    const widgetPanel = {
      [CSS.panel]: document.body.clientWidth < 813
    };
    return (
      <div class={this.classes(CSS.base, widgetPanel)}>
        {noTimeLayers ? (
          <div class={CSS.noTimeLayerContainer}>
            No time enabled layers in map.
          </div>
        ) : null}
        {!noTimeLayers ? layerSelector : null}
        {!noTimeLayers ? timeSlider : null}
      </div>
    );
  }

  // START OF PRIVATE RENDER METHODS
  private _renderLayerSelector(): VNode {
    const options = this._renderLayerOptions();
    return (
      <label class={CSS.selectLayerLabel}>
        {i18n.selectLayer}
        <select
          bind={this}
          onchange={this._handleSelect}
          id="timeLayers"
          class={CSS.layerSelectorDropdown}
          disabled={
            this.timeFilterConfigCollection.length < 2 ||
            this.timeSlider?.viewModel?.state === "playing"
              ? true
              : false
          }
        >
          {options}
        </select>
      </label>
    );
  }

  private _renderTimeSlider(): VNode {
    return <div bind={this} afterCreate={this._initTimeSlider} />;
  }

  private _renderLayerOptions(): VNode {
    return this.timeFilterConfigCollection.toArray().map(item => {
      const { id, title } = item.layerView.layer;
      return (
        <option key={`time-filter-layer-${id}`} value={id}>
          {title}
        </option>
      );
    });
  }

  // END OF PRIVATE RENDER METHODS

  private _handleSelect(e: Event): void {
    const node = e.target as HTMLSelectElement;
    const { options, selectedIndex } = node;
    const selected = options[selectedIndex];
    const { value } = selected;
    const { timeFilterConfigCollection } = this;
    const timeConfigItem = timeFilterConfigCollection.find(
      timeConfigItem => timeConfigItem.layerView.layer.id === value
    );
    this.currentTimeConfigItem = timeConfigItem;
  }

  private _initTimeSlider(container: HTMLDivElement): void {
    if (this.timeSlider) {
      return;
    }
    if (!this.view) {
      return;
    }
    this.timeSlider = new TimeSlider({
      container,
      mode: "time-window",
      loop: true
    });
  }
}

export = TimeFilter;
