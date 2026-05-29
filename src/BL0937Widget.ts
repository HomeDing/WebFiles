// BL0937Widget.ts: Widget Behavior implementation for BL0937 Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

import { GenericWidgetClass } from "./GenericWidget";
import { MicroControl } from "./microRegistry";
import { hub } from "./microHub"; 


@MicroControl('bl0937')
export class BL0937WidgetClass extends GenericWidgetClass {

  override connectedCallback() {
    super.connectedCallback();
    this.data = { id: this.microid };
    hub.replay(this.subId);
  } // connectedCallback

  // visualize any new data for the widget.
  override newData(path: string, key: string, value: string): void {
    super.newData(path, key, value);
    if (key === 'mode') {
      ['current', 'voltage'].forEach(m => {
        const td = this.querySelector(`[u-text="${m}"]`);
        td!.parentElement!.style.display = (m === value ? '' : 'none');
      });
    }
  }
}

// End.
