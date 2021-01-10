// PWMOutWidget.ts: Widget Behavior implementation for PWMOut Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('pwmout')
class PWMOutWidgetClass extends GenericWidgetClass {
  _range = 255;
  lastValue: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    hub.subscribe(this.microid + '?*', this.newValue.bind(this));
  }

  newValue(_path: string, key: string | null, value: string | null) {
    if (key === 'range') {
      this._range = Number(value);
    } else if (key === 'value') {
      if (this.lastValue !== value) {
        const o: HTMLElement = <HTMLElement>this.querySelector('.ux-levelbar');
        const h = o.offsetHeight;
        let bh = (h * Number(value)) / this._range;
        if (bh > h - 1) { bh = h - 1; }
        if (bh < 1) { bh = 1; }
        o.style.borderBottomWidth = bh + 'px';
        this.lastValue = value;
      }
    }
  }
}

// End.
