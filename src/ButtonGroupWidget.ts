// ButtonWidget.ts: Widget Behavior implementation for Button Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('buttongroup')
class ButtonGroupWidgetClass extends GenericWidgetClass {
  _count = 0;
  _blockElem: HTMLElement | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._blockElem = this.querySelector('.block');
  }

  newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    if (key && value) {
      if (key !== 'title') {
        if (this._count % 2 === 0) {
          this._blockElem = createHTMLElement(this, 'div', { 'class': 'block' });
        }
        // create a new button
        if (this._blockElem) {
          createHTMLElement(this._blockElem, 'button', { 'u-action': value }).textContent = key;
        }
        this._count++;
      }
    } // if
  } // newData()
}
