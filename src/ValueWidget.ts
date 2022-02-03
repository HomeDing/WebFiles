// PWMOutWidget.ts: Widget Behavior implementation for PWMOut Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('value')
class ValueWidget extends GenericWidgetClass {
  _input!: HTMLInputElement | null;

  connectedCallback() {
    super.connectedCallback();
    this._input = this.querySelector('input')
  }

  newData(path: string, key?: string, value?: string) {
    console.log(path, key, value);
    if ((this._input) && (value)) {
      if (key === 'min') {
        this._input.min = value;
      } else if (key === 'max') {
        this._input.max = value;
      }
    }
    super.newData(path, key, value);
  }
}

// End.
