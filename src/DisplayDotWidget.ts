// DisplayDotWidget.ts: Widget Behavior implementation for DisplayDot Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

import { createHTMLElement, toBool } from "./utils";
import { DisplayItemWidgetClass } from "./DisplayItemWidget";
import { MicroControl } from "./microRegistry";

@MicroControl('displaydot')
export class DisplayDotWidgetClass extends DisplayItemWidgetClass {
  // When the card is created also create a html tag inside the display.
  override connectedCallback() {
    super.connectedCallback();
    this._elem = createHTMLElement(this._dispElem, 'span', { class: 'dot' });
  } // connectedCallback


  // new value is set in the element.
  override newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    if (key === 'value') {
      this._elem.classList.toggle('active', toBool(value));
    }
  } // newData

} // class DisplayDotWidgetClass

// End.
