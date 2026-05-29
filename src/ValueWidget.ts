// ValueWidget.ts: Widget Behavior implementation for Value Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

import { GenericWidgetClass } from "./GenericWidget";
import { MicroControl } from "./microRegistry";

@MicroControl('value')
export class ValueWidgetClass extends GenericWidgetClass {
  _input!: HTMLInputElement | null;

  override connectedCallback() {
    super.connectedCallback();
    this._input = this.querySelector('input');
  }

  override newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    if (this._input) {
      if (key === 'min') {
        this._input.min = value;
      } else if (key === 'max') {
        this._input.max = value;
      } else if (key === 'step') {
        this._input.step = value;
      }
    }
  }
}

// End.
