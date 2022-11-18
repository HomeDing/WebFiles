// DisplayLineWidget.ts: Widget Behavior implementation for DisplayLine Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />
/// <reference path="DisplayItemWidget.ts" />

@MicroControl('displayline')
class DisplayLineWidgetClass extends DisplayItemWidgetClass {

  override connectedCallback() {
    super.connectedCallback();
    if (this._dispElem)
      this._elem = createHTMLElement(this._dispElem, 'span', { class: 'line' });
  } // connectedCallback

  override newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    const e = this._elem;
    if (!e) {
      // not visible
    } else if (key === 'w') {
      e.style.width = value + 'px';

    } else if (key === 'h') {
      e.style.height = value + 'px';
    }
  } // newData

} // class DisplayLineWidgetClass

// End.
