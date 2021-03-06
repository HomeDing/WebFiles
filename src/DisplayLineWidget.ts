// DisplayLineWidget.ts: Widget Behavior implementation for DisplayLine Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('displayline')
class DisplayLineWidgetClass extends GenericWidgetClass {
  _dispElem: HTMLElement | null = null;
  _elem: HTMLElement | null = null;
  _x0 = 0;
  _x1 = 0;
  _y0 = 0;
  _y1 = 0;

  connectedCallback() {
    super.connectedCallback();
    this._dispElem = document.querySelector('#panel .display');
    if (this._dispElem) {
      this._elem = createHTMLElement(this._dispElem, 'span', { class: 'line' });
      this.updateElem();
    }
    if (!this.showSys()) {
      this.style.display = 'none';
    }
  } // connectedCallback

  newData(path: string, key: string | null, value: string | null) {
    super.newData(path, key, value);
    if (key && value && this._elem) {
      if (key === 'page') {
        this._elem.setAttribute('displayPage', value);

      } else if ((<any>this)['_' + key] != null) {
        (<any>this)['_' + key] = value;
      }
      this.updateElem();
    }
  } // newValue


  // update the html inside the display to reflect the properties.
  private updateElem() {
    if (this._elem) {
      this._elem.style.top = this._y0 + 'px';
      this._elem.style.left = this._x0 + 'px';
      this._elem.style.width = (this._x1 - this._x0) + 'px';
      this._elem.style.height = (this._y1 - this._y0) + 'px';
    }
  } // updateElem()

} // class DisplayLineWidgetClass

// End.
