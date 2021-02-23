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

interface RGBType {
  r: number;  // 0...255
  g: number;  // 0...255 
  b: number;   // 0...255
}

@MicroControl('color')
class ColorWidgetClass extends GenericWidgetClass {
  private colObj: HTMLElement | null = null;
  private hueObj: HTMLInputElement | null = null;
  private lightObj: HTMLInputElement | null = null;
  private satObj: HTMLInputElement | null = null;
  private whiteObj: HTMLInputElement | null = null;
  private _hvalue = '00ff0000';
  private _value = '00000000';
  private _hue = 127;
  private _lightness = 127;
  private _saturation = 255;
  private _white = 127;
  private _hasWhite = false;

  connectedCallback() {
    super.connectedCallback();
    this.colObj = this.querySelector('.color') as HTMLElement;
    this.hueObj = this.querySelector('.hue') as HTMLInputElement;
    this.satObj = this.querySelector('.band.saturation') as HTMLInputElement;
    this.lightObj = this.querySelector('.band.lightness') as HTMLInputElement;
    this.whiteObj = this.querySelector('.white') as HTMLInputElement;
  } // connectedCallback

  updateBands() {

  }

  // visualize any new data for the widget.
  newData(_path: string, key: string | null, value: string | null) {
    if (!value) {
    } else if (key === 'value') {
      // normalize value
      value = value.replace('x', '');
      if (value.length === 6) {
        this._value = `00${value}`;
      } else if (value.length === 8) {
        this._value = value;
      }
      const col = this._value.substr(2);
      const hsl = this.rgbToHsl(this.rgb(col));
      this._hvalue = this.hslToRGB(hsl.h, 100, 50);

      if (this.hueObj) { this.hueObj.value = String(hsl.h); }
      if (this.satObj) {
        this.satObj.value = String(hsl.s);
        this.satObj.style.background = `linear-gradient(to right, #808080 0%, #${this._hvalue} 100%)`;
      }
      if (this.lightObj) {
        this.lightObj.value = String(hsl.l);
        this.lightObj.style.background = `linear-gradient(to right, #000 0%, #${this._hvalue} 50%, #fff 100%)`;
      }

      if (this.whiteObj) { this.whiteObj.value = String(parseInt(this._value.substr(0, 2), 16)); }


      if (this.colObj) {
        this.colObj.style.backgroundColor = `#${col}`;
      }

    } else if (key === 'config') {
      this._hasWhite = (value === 'WRGB');
      if (this.whiteObj) {
        this.whiteObj.style.display = this._hasWhite ? '' : 'none';
      }
    }
    super.newData(_path, key, value);
  }

  on_input(e: InputEvent) {
    const tar = e.target as HTMLInputElement;
    let col = '';

    if (tar === this.hueObj) {
      this._hue = parseInt(tar.value, 10);
      this._hvalue = this.hslToRGB(this._hue, 100, 50);

    } else if (tar === this.lightObj) {
      this._lightness = parseInt(tar.value, 10);
      this.dispatchAction('lightness', tar.value);

    } else if (tar === this.satObj) {
      this._saturation = parseInt(tar.value, 10);
      this.dispatchAction('saturation', tar.value);

    } else if (tar === this.whiteObj) {
      this._white = parseInt(tar.value, 10);
    }

    // calculate the new color value
    col = 'x' + this.hslToRGB(this._hue, Math.round(this._saturation * 100 / 255), Math.round(this._lightness * 100 / 255));

    if (this._hasWhite) {
      col = 'x' + this.x16(this._white) + col.substr(1);
    } // if
    this.dispatchAction('value', col);
  } // on_input


  // convert from #??rrggbb to RGBType
  private rgb(color: string): RGBType {
    const rgb = { r: 0, g: 0, b: 0 };

    // only last 6 chars of interest...
    if (color && color.length >= 6) {
      const col = color.substr(color.length - 6);
      rgb.r = parseInt(col.substr(0, 2), 16);
      rgb.g = parseInt(col.substr(2, 2), 16);
      rgb.b = parseInt(col.substr(4, 2), 16);
    }
    return (rgb);
  } // rgb()



  // rgb in format xRRGGBB, #RRGGBB, nnRRGGBB, #nnRRGGBB
  // hue in range 0...359

  // returns an object with {h,s,l}
  private rgbToHsl(rgb: RGBType): HslType {
    const hsl: HslType = { h: 0, s: 0, l: 0 };

    const max = Math.max(rgb.r, rgb.g, rgb.b);
    const min = Math.min(rgb.r, rgb.g, rgb.b);
    const d = max - min;
    const s = max + min;

    hsl.l = Math.round(s / 2);

    if (d > 0) {
      let hue = 0;
      hsl.s = Math.round(255 * (hsl.l > 127 ? d / (510 - s) : d / s));
      if (max === rgb.r) {
        hue = (rgb.g - rgb.b) / d + (rgb.g < rgb.b ? 6 : 0);
      } else if (max === rgb.g) {
        hue = (rgb.b - rgb.r) / d + 2;
      } else if (max === rgb.b) {
        hue = (rgb.r - rgb.g) / d + 4;
      }
      hsl.h = Math.round(hue * 60) % 360;
    }
    return (hsl);
  } // rgbToHsl


  // calculate rgb from hsl using builtin style function
  private hslToRGB(h: number, s: number, l: number): string {
    const obj = this.hueObj || this;

    // calculate the new color value
    // use backgroundColor to convert to hsl to rgb format
    obj.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;
    const bc = getComputedStyle(obj, null).backgroundColor;
    // format to 'rrggbb'
    const v = String(bc).replace(/[^0-9,]/g, '').split(',');
    const col = this.x16(v[0]) + this.x16(v[1]) + this.x16(v[2]);
    return (col);
  } // hslToRGB


  private x16(d: any): string {
    let x = Number(d).toString(16);
    if (x.length === 1) {
      x = '0' + x;
    }
    return (x);
  }
}

// End.
