// InputWidget.ts: Widget Behavior implementation for enriching Input Elements
// supporting checkbox, range (and switch)

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

// for range-input up and down labels can be added using class="up"|"down".
// The focus is set to the input element on click events.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('input')
class InputWidgetClass extends MicroControlClass {
  _input!: HTMLInputElement; // Reference to the real input element, maybe "this".
  _type!: string;
  _value!: string;

  connectedCallback() {
    const inObj = this.querySelector('input');
    this._input = <HTMLInputElement><any>this;
    if ((this.tagName !== 'INPUT') && inObj) {
      this._input = inObj;
    }
    super.connectedCallback();
    let type = this._input.getAttribute('type') || 'text';
    if ((type === 'range') && (this._input.classList.contains('switch'))) {
      type = 'switch';
      this._input.min = '0';
      this._input.max = '1';
    }
    this._type = type;
    this._value = this._input.value;
    this._clearWhitespace();

    // bind to event for 
    // while ()
    // this.subId = hub.subscribe(this.microid + '?*', this.newData.bind(this));

  } // connectedCallback

  _check() {
    let newVal = this._value;
    const t = this._type;
    if (t === 'checkbox') {
      newVal = this._input.checked ? '1' : '0';
    } else if ((t === 'range') || (t === 'switch')) {
      newVal = this._input.value;
    }

    if (newVal !== this._value) {
      this._value = newVal;
      this._input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  newData(path: string, key: string | null, value: string | null) {
    console.log(path, key, value);
    // super.newData(path, key, value);
  }

  on_change() {
    this._check();
  }

  on_click(e: MouseEvent) {
    let src: HTMLElement | null = e.target as HTMLElement;

    this._value = this._input.value;
    while (src) {
      if ((this._type === 'range') || (this._type === 'switch')) {
        const cl = src.classList;
        if (cl.contains('up')) {
          // increment value
          const nv = Number(this._input.value) + (Number(<any>(this._input.step) || 1));
          this._input.value = String(nv);
          break;

        } else if (cl.contains('down')) {
          // decrement value
          const nv = Number(this._input.value) - (Number(<any>(this._input.step) || 1));
          this._input.value = String(nv);
          break;
        }
      }
      if (this._type === 'switch') {
        if (src === this._input || src === this) {
          // simple clicks will toggle the value
          this._input.value = String(1 - Number(this._input.value));
          break;
        }
      }
      if (src === this) {
        break;
      } else {
        src = src.parentElement;
      }
    } // while
    this._input.focus();
    this._check();
  } // on_click

}

// End.
