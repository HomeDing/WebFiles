// ColorWidget.ts: Widget Behavior implementation for the Color Element.

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.
// Support hue, brightness and white bands for single `WWRRGGBB` value.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

interface HslType {
  h: number;  // 0...359
  s: number;  // 0...255 as %
  l: number;   // 0...255 as %
}

interface RGBWType {
  r: number;  // 0...255
  g: number;  // 0...255
  b: number;   // 0...255
  w: number;  // 0...255
}

@MicroControl('color')
class ColorWidgetClass extends GenericWidgetClass {
  private _colObj: HTMLElement | any;
  private _hObj: HTMLInputElement | any;
  private _sObj: HTMLInputElement | any;
  private _lObj: HTMLInputElement | any;
  private _wObj: HTMLInputElement | any;

  private _value!: string;   // actual value
  private _hasWhite!: boolean;

  connectedCallback() {
    super.connectedCallback();
    this._value = '00000000';
    this._hasWhite = false;
    this._colObj = this.querySelector('.color') as HTMLElement || { style: {} };
    this._hObj = this.querySelector('.hue') as HTMLInputElement || {};
    this._sObj = this.querySelector('.band.saturation') as HTMLInputElement || { style: {} };
    this._lObj = this.querySelector('.band.lightness') as HTMLInputElement || { style: {} };
    this._wObj = this.querySelector('.white') as HTMLInputElement || {};
  } // connectedCallback


  // visualize any new data for the widget.
  newData(_path: string, key: string | null, value: string | null) {
    let newValue: string = this._value;

    if (!value) {
    } else if (key === 'value') {
      newValue = this.normColor(value);

      if (newValue !== this._value) {
        this._value = newValue;

        // calculate hsl from rgbw
        const rgbw = this.wrgb(newValue);
        const hsl = this.toHSL(rgbw);

        this._hObj.value = hsl.h;
        this._sObj.value = hsl.s;
        this._lObj.value = hsl.l;

        this._update();
      }

    } else if (key === 'config') {
      this._hasWhite = true; // (value === 'WRGB');
      if (this._wObj) {
        this._wObj.style.display = this._hasWhite ? '' : 'none';
      }
    }
    super.newData(_path, key, value);
  }


  // calculate the new color value from input sliders
  on_input() {
    this._value = this.to16(parseInt(this._wObj.value, 10))
      + this.HSLToColor(this._hObj.value, this._sObj.value, this._lObj.value);
    this._update();
    this.dispatchAction('value', 'x' + this._value);
  } // on_input


  // Update the UI values and colors
  private _update() {
    const rgbw = this.wrgb(this._value);
    const hsl = this.toHSL(rgbw);
    const fullColor = this.HSLToColor(hsl.h, 100, 50);

    this._sObj.style.background = `linear-gradient(to right, #808080 0%, #${fullColor} 100%)`;
    this._lObj.style.background = `linear-gradient(to right, #000 0%, #${fullColor} 50%, #fff 100%)`;

    this._colObj.style.backgroundColor = `#${this._value.substr(2)}`;
    this._wObj.value = String(rgbw.w);
  } // _updateUI()


  // convert from various value formats to 'wwrrggbb'
  private normColor(color: string): string {

    if ((!color) || (color.length === 0)) {
      color = '00000000';
    } else {
      if ((color.substr(0, 1) === 'x') || (color.substr(0, 1) === '#')) {
        color = color.substr(1);
      }
      if (color.length === 6) {
        color = '00' + color;
      }
    }
    return (color);
  } // normColor()


  // convert from 'wwrrggbb' to RGBWType
  private wrgb(color: string): RGBWType {
    return ({
      w: parseInt(color.substr(0, 2), 16),
      r: parseInt(color.substr(2, 2), 16),
      g: parseInt(color.substr(4, 2), 16),
      b: parseInt(color.substr(6, 2), 16)
    });
  } // wrgb()


  // returns an object with {h,s,l}
  private toHSL(rgb: RGBWType): HslType {
    const hsl: HslType = { h: 0, s: 0, l: 0 };
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
      ? l === r
        ? (g - b) / s
        : l === g
          ? 2 + (b - r) / s
          : 4 + (r - g) / s
      : 0;
    hsl.h = Math.round(60 * h < 0 ? 60 * h + 360 : 60 * h);
    hsl.s = Math.round(100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0));
    hsl.l = Math.round((100 * (2 * l - s)) / 2);
    return (hsl);
  } // toHSL


  // calculate color from hsl
  private HSLToColor(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const rgb = {
      r: Math.round(255 * f(0)),
      g: Math.round(255 * f(8)),
      b: Math.round(255 * f(4)),
      w: 0
    };
    return this.toRGBColor(rgb);
  } // HSLToColor()

  private to16(d: number): string {
    let x = d.toString(16);
    if (x.length === 1) {
      x = '0' + x;
    }
    return (x);
  }

  private toRGBColor(rgbw: RGBWType): string {
    const col = this.to16(rgbw.r) + this.to16(rgbw.g) + this.to16(rgbw.b);
    return (col);
  }

}

// End.
