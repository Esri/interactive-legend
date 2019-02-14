/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {
  subclass,
  declared,
  property
} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");

import { ApplicationConfig } from "ApplicationBase/interfaces";
import { renderable, tsx } from "esri/widgets/support/widget";

const CSS = {
  title: "title-container"
};

@subclass("Header")
class Header extends declared(Widget) {
  constructor(params) {
    super(params);
  }
  @property()
  @renderable()
  config: ApplicationConfig;

  render() {
    const { headHTML, customHeaderEnabled, title } = this.config;
    return (
      <header
        innerHTML={customHeaderEnabled ? (headHTML ? headHTML : null) : null}
      >
        {customHeaderEnabled ? null : <div class={CSS.title}>{title}</div>}
      </header>
    );
  }
}

export = Header;
