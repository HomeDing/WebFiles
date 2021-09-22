// DisplayDotWidget.ts: Widget Behavior implementation for DisplayDot Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('displaydot')
class DisplayDotWidgetClass extends GenericWidgetClass {
  lastValue!: string;
  _dispElem!: HTMLElement | null;
  _elem!: HTMLElement | null;
  _x!:number;
  _y!:number;
  _value!:boolean;

  // When the card is created also create a html tag inside the display.
  connectedCallback() {
    super.connectedCallback();
    this.lastValue = '';
    this._dispElem = document.querySelector('#panel .display');
    if (this._dispElem) {
      this._elem = createHTMLElement(this._dispElem, 'span', { class: 'dot' });
      this.updateElem();
    }
    if (!this.showSys()) {
      this.style.display = 'none';
    }
    this._x = 0;
    this._y = 0;
    this._value = false;
  } // connectedCallback


  // new value is set in the element.
  newData(path: string, key: string | null, value: string | null) {
    super.newData(path, key, value);
    if (key && value && this._elem) {
      if (key === 'value') {
        this._value = toBool(value);

      } else if (key === 'page') {
        this._elem.setAttribute('displayPage', value);

      } else if (key === 'x') {
        this._x = Number(value);

      } else if (key === 'y') {
        this._y = Number(value);
      }
      this.updateElem();
    }
  } // newValue


  // update the html inside the display to reflect the properties.
  private updateElem() {
    if (this._elem) {
      this._elem.style.top = this._y + 'px';
      this._elem.style.left = this._x + 'px';
      this._elem.classList.toggle('active', this._value);
    } // if
  } // updateElem()

} // class DisplayDotWidgetClass

// End.
