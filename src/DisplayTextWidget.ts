// DisplayTextWidget.ts: Widget Behavior implementation for DisplayText Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl("displaytext")
class DisplayTextWidgetClass extends GenericWidgetClass {
  lastValue: string | null = null;
  _dispElem: HTMLElement | null = null;
  _dispGrid: number = 1;
  _elem: HTMLElement | null = null;
  _prefix = '';
  _postfix = '';

  connectedCallback(el: HTMLElement) {
    super.connectedCallback(el);

    this._dispElem = document.getElementById('display');
    if (this._dispElem) {
      if (this._dispElem.getAttribute('grid'))
        this._dispGrid = Number(this._dispElem.getAttribute('grid'));

      const e: HTMLSpanElement = this._elem = document.createElement('span');
      e.className = 'text';
      e.style.top = '0px';
      e.style.left = '0px';
      this._dispElem.appendChild(e);
    }

    hub.subscribe(this.microid + "?*", this.newValue.bind(this), true);
  }

  newValue(_path: string, key: string | null, value: string | null) {
    if (key && value && this._elem) {

      if (key === 'value') {
        const t = `${this._prefix}${value}${this._postfix}`;
        this._elem.innerHTML = t.replace(/ /g, '&nbsp;');

      } else if (key === 'x') {
        this._elem.style.left = (Number(value) * this._dispGrid * 7 / 10) + 'px';

      } else if (key === 'y') {
        this._elem.style.top = (Number(value) * this._dispGrid) + 'px';

      } else if (key === 'fontsize') {
        this._elem.style.fontSize = value + 'px';
        this._elem.style.lineHeight = value + 'px';
        this._elem.style.height = value + 'px';

      } else if (key === 'prefix') {
        this._prefix = value;
      } else if (key === 'postfix') {
        this._postfix = value;


      } else {
        console.log("key", key, value);
      }
    }
  }
}

// End.
