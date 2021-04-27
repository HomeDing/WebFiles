// DisplayDotWidget.ts: Widget Behavior implementation for DisplayDot Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('display')
class DisplayWidgetClass extends GenericWidgetClass {
  displayPage = "";
  _dialogElem: HTMLElement | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._dialogElem = this.querySelector('.display');
  }

  // new value is set in the element.
  newData(path: string, key: string | null, value: string | null) {
    super.newData(path, key, value);
    if (key && value) {
      if (key === 'page') {
        if (value !== this.displayPage) {
          this.displayPage = value;
          this._dialogElem?.querySelectorAll(":scope > span").forEach((e) => {
            const p = (<HTMLElement>e).getAttribute("displayPage") || "1";
            (<any>e).style.display = (p === this.displayPage) ? "" : "none";
          })
        }
      }
    }
  } // newValue
} // class DisplayWidgetClass

// End.
