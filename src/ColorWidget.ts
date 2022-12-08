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
  private _duration!: number;   // actual duration of the effect in msec.

  override connectedCallback() {
    super.connectedCallback();
    this._value = '00000000';
    this._color = 'x000000';
    this._white = undefined;
  } // connectedCallback


  // visualize any new data for the widget.
  override newData(_path: string, key: string, value: string) {
    super.newData(_path, key, value);

    if (key === 'value') {
      const newValue = this.normColor(value);
      if (newValue.match(/[0-9a-z]{8}/)) {
        this._color = '#' + newValue.substring(2);
      } else {
        this._color = newValue;
      }
      this._white = parseInt(newValue.substring(0, 2), 16);

      if (newValue !== this._value) {
        this._value = newValue;
        this.querySelectorAll('*[name=value]').forEach(e => { (e as HTMLInputElement).value = value; });
        this.querySelectorAll('*[name=color]').forEach(e => { (e as HTMLInputElement).value = this._color; });
        this.querySelectorAll('*[name=white]').forEach(e => { (e as HTMLInputElement).value = String(this._white); });
      }

    } else if (key === 'brightness') {
      this._brightness = parseInt(value, 10);

      this.querySelectorAll('*[name=brightness]').forEach(e => {
        (e as HTMLInputElement).value = String(this._brightness);
      });

    } else if (key === 'duration') {
      this._duration = parseInt(value, 10);

      this.querySelectorAll('*[name=duration]').forEach(e => {
        (e as HTMLInputElement).value = String(this._duration);
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
    }
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
      const v = 'x' + this.x16(this._white) + this._color.substring(1);
      this.dispatchAction('value', v);

    } else if (n === 'color') {
      this._color = val;
      let v = this._color.substring(1);
      if (this._white) {
        v = this.x16(this._white) + v;
      }
      this.dispatchAction('value', 'x' + v);

    } else if (n === 'duration') {
      this._duration = parseInt(val, 10);
      this.dispatchAction(n, val + "ms");

    }
  } // on_input

  // convert from various value formats to 'wwrrggbb'
  private normColor(color: string): string {
    const colNames: { [key: string]: string } = {
      "black": "000000",
      "red": "ff0000",
      "green": "00ff00",
      "blue": "0000ff",
      "white": "ffffff"
    };

    if ((!color) || (color.length === 0)) {
      color = '00000000';
    } else {
      color = color.toLowerCase();
      color = colNames[color] ?? color;
      if ((color.substring(0, 1) === 'x') || (color.substring(0, 1) === '#')) {
        color = color.substring(1);
      }
      if (color.length === 6) {
        color = '00' + color;
      }
    }
    return (color.toLowerCase());
  } // normColor()

  private x16(d: number): string {
    let x = d.toString(16);
    if (x.length === 1) {
      x = '0' + x;
    }
    return (x);
  }
}

// End.
