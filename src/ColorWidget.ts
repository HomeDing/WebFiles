// ColorWidget.ts: Widget Behavior implementation for the Color Element.

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.
// Support hue, brightness and white bands for single `WWRRGGBB` value.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />


@MicroControl('color')
class ColorWidgetClass extends GenericWidgetClass {
  private _value!: string;   // actual value
  private _color!: string;   // actual color value from the color input
  private _white: number | undefined;   // actual white value from the slider
  private _brightness!: number;   // actual brightness value from the slider

  connectedCallback() {
    super.connectedCallback();
    this._value = '00000000';
    this._color = 'x000000';
    this._white = undefined;
  } // connectedCallback


  // visualize any new data for the widget.
  newData(_path: string, key?: string, value?: string) {
    let newValue: string = this._value;

    if (!value) {
    } else if (key === 'value') {
      newValue = this.normColor(value);
      if (newValue.match(/[0-9a-z]{8}/)) {
        this._color = '#' + newValue.substring(2);
      } else {
        this._color = newValue;
      }
      this._white = parseInt(newValue.substring(0, 2), 16)

      if (newValue !== this._value) {
        this._value = newValue;

        this.querySelectorAll('*[name=value]').forEach(e => { (e as HTMLInputElement).value = value; });
        this.querySelectorAll('*[name=color]').forEach(e => {
          (e as HTMLInputElement).value = this._color;
        });
        this.querySelectorAll('*[name=white]').forEach(e => { (e as HTMLInputElement).value = String(this._white); });
      }

    } else if (key === 'brightness') {
      this._brightness = parseInt(value, 10);

      this.querySelectorAll('*[name=brightness]').forEach(e => {
        (e as HTMLInputElement).value = String(this._brightness);
      });

    } else if (key === 'config') {
      if (value.toLowerCase() === 'wrgb') {
        let o = this.querySelector('input[name=white]') as HTMLElement | null;
        if (o) o = o.parentElement; // div
        if (o && o.previousElementSibling) {
          o.style.display = '';
          (o.previousElementSibling as HTMLElement).style.display = '';
        }
      }
      // if (this._wObj) {
      //   this._wObj.style.display = this._hasWhite ? '' : 'none';
      // }
    }
    super.newData(_path, key, value);
  }


  // calculate the new color value from input sliders
  on_input(evt: InputEvent) {
    const n = (evt.target as HTMLInputElement).name;
    const val = (evt.target as HTMLInputElement).value;

    if (n === 'brightness') {
      this._brightness = parseInt(val, 10);
      this.dispatchAction(n, val);

    } else if (n === 'white') {
      this._white = parseInt(val, 10);
      const v = 'x' + this.to16(this._white) + this._color.substring(1);
      this.dispatchAction('value', v);

    } else if (n === 'color') {
      this._color = val;
      let v = this._color.substring(1);
      if (this._white) {
        v = this.to16(this._white) + v;
      }
      this.dispatchAction('value', 'x' + v);
    }
  } // on_input


  // convert from various value formats to 'wwrrggbb'
  private normColor(color: string): string {
    if ((!color) || (color.length === 0)) {
      color = '00000000';
    } else {
      color = color.toLowerCase();
      if (color === 'black') { color = '000000';}
      if (color === 'red') { color = 'ff0000';}
      if (color === 'green') { color = '00ff00';}
      if (color === 'blue') { color = '0000ff';}
      if (color === 'white') { color = 'ffffff';}

      if ((color.substring(0, 1) === 'x') || (color.substring(0, 1) === '#')) {
        color = color.substring(1);
      }
      if (color.length === 6) {
        color = '00' + color;
      }
    }
    return (color.toLowerCase());
  } // normColor()

  private to16(d: number): string {
    let x = d.toString(16);
    if (x.length === 1) {
      x = '0' + x;
    }
    return (x);
  }
}

// End.
