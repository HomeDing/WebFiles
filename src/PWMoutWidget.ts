// SwitchWidget.ts: Widget Behavior implementation for PWMOut Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl("pwmout")
class PWMOutWidgetClass extends GenericWidgetClass {
  range: number = 255;
  lastValue: string = "";

  connectedCallback(el: HTMLElement) {
    super.connectedCallback(el);
    hub.subscribe(this.microid + "?*", this.newValue.bind(this));
  }

  newValue(_path: string, key: string, value: string) {
    if (key == "range") {
      this.range = Number(value);
    } else if (key == "value") {
      if (this.lastValue !== value) {
        var o: HTMLElement = <HTMLElement>this.el.querySelector(".u-level");
        var h = o.offsetHeight;
        var bh = (h * Number(value)) / this.range;
        if (bh > h - 1) bh = h - 1;
        if (bh < 1) bh = 1;
        o.style.borderBottomWidth = bh + "px";
        this.lastValue = value;
      }
    }
  }
}

// End.
