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
  private colObj: HTMLElement | any = {};
  private hObj: HTMLInputElement | any = {};
  private sObj: HTMLInputElement | any = {};
  private lObj: HTMLInputElement | any = {};
  private wObj: HTMLInputElement | any = {};

  // actual value
  private _value = '00000000';
  private _hasWhite = false;

  connectedCallback() {
    super.connectedCallback();
    this.colObj = this.querySelector('.color') as HTMLElement || { style: {} };
    this.hObj = this.querySelector('.hue') as HTMLInputElement || {};
    this.sObj = this.querySelector('.band.saturation') as HTMLInputElement || { style: {} };
    this.lObj = this.querySelector('.band.lightness') as HTMLInputElement || { style: {} };
    this.wObj = this.querySelector('.white') as HTMLInputElement || {};
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

        this.hObj.value = hsl.h;
        this.sObj.value = hsl.s;
        this.lObj.value = hsl.l;

        this._update();
      }

    } else if (key === 'config') {
      this._hasWhite = true; // (value === 'WRGB');
      if (this.wObj) {
        this.wObj.style.display = this._hasWhite ? '' : 'none';
      }
    }
    super.newData(_path, key, value);
  }


  // calculate the new color value from input sliders
  on_input() {
    this._value = this.to16(parseInt(this.wObj.value))
      + this.HSLToColor(this.hObj.value, this.sObj.value, this.lObj.value);
    this._update();
    this.dispatchAction('value', 'x' + this._value);
  } // on_input


  // Update the UI values and colors
  private _update() {
    const rgbw = this.wrgb(this._value);
    const hsl = this.toHSL(rgbw);
    const fullColor = this.HSLToColor(hsl.h, 100, 50);

    this.sObj.style.background = `linear-gradient(to right, #808080 0%, #${fullColor} 100%)`;
    this.lObj.style.background = `linear-gradient(to right, #000 0%, #${fullColor} 50%, #fff 100%)`;

    this.colObj.style.backgroundColor = `#${this._value.substr(2)}`;
    this.wObj.value = String(rgbw.w);
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
        color = '00' + color
      }
    }
    return (color);
  } // normColor()


  // convert from 'wwrrggbb' to RGBWType
  private wrgb(color: string): RGBWType {
    var rgbw = {
      w: parseInt(color.substr(0, 2), 16),
      r: parseInt(color.substr(2, 2), 16),
      g: parseInt(color.substr(4, 2), 16),
      b: parseInt(color.substr(6, 2), 16)
    }
    return (rgbw);
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
