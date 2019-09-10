// DisplayTextWidget.ts: Widget Behavior implementation for DisplayText Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl("displaydot")
class DisplayDotWidgetClass extends GenericWidgetClass {
  lastValue: string | null = null;
  _dispElem: HTMLElement | null = null;
  _elem: HTMLElement | null = null;
  _x = 0;
  _y = 0;
  _value: boolean = false;

  connectedCallback(el: HTMLElement) {
    super.connectedCallback(el);

    this._dispElem = document.querySelector("#panel .display");
    hub.subscribe(this.microid + "?*", this.newValue.bind(this), true);
  } // connectedCallback


  updateDisp(create: boolean) {
    if (this._dispElem) {
      if (create && !this._elem) {
        this._elem = document.createElement("span");
        this._dispElem.appendChild(this._elem);
      }
      if (this._elem) {
        this._elem.className = "dot";
        this._elem.style.top = this._y + "px";
        this._elem.style.left = this._x + "px";
        this._elem.classList.toggle("active", this._value);
      }
    }
  } // updateDisp


  newValue(_path: string, key: string | null, value: string | null) {
    if (key && value) {
      if (key === "active" && !this._elem) {
        this.updateDisp(true);

      } else if (key === "value") {
        this._value = toBool(value);
        this.updateDisp(false);

      } else if (key === "x") {
        this._x = Number(value);
        this.updateDisp(false);

      } else if (key === "y") {
        this._y = Number(value);
        this.updateDisp(false);

      } else {
        console.log("key", key, value);
      }
    }
  } // newValue
}

// End.
