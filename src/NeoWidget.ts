// NeoWidget.ts: Widget Behavior implementation for Neo Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.
// Support hue, brightness and white bands for single `WWRRGGBB` value.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('neo')
class NeoWidgetClass extends GenericWidgetClass {
  private colObj: HTMLElement | null = null;
  private hueObj: HTMLInputElement | null = null;
  private brightObj: HTMLInputElement | null = null;
  private whiteObj: HTMLInputElement | null = null;
  private _value = '00000000';

  connectedCallback() {
    super.connectedCallback();
    this.colObj = this.querySelector('.color') as HTMLElement;
    this.hueObj = this.querySelector('.hue') as HTMLInputElement;
    this.brightObj = this.querySelector('.bright') as HTMLInputElement;
    this.whiteObj = this.querySelector('.white') as HTMLInputElement;
  } // connectedCallback

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
      const rgb = this._value.substr(2);

      if (this.hueObj) { this.hueObj.value = String(this.rgbToHue(rgb)); }
      if (this.whiteObj) { this.whiteObj.value = String(parseInt(this._value.substr(0, 2), 16)); }

      if (this.brightObj) {
        const lg = `linear-gradient(to right, black 0%, #${rgb} 100%)`;
        this.brightObj.style.background = lg;
      }

      if (this.colObj) {
        this.colObj.style.backgroundColor = `#${rgb}`;
      }

    } else if (key === 'brightness') {
      if (this.brightObj) { this.brightObj.value = value; }
    }
    super.newData(_path, key, value);
  }

  on_input(e: InputEvent) {
    const tar = e.target as HTMLInputElement;
    let col = '';

    console.log(tar.value);
    if (tar === this.hueObj) {
      const color = `hsl(${tar.value}, 100%, 50%)`;

      // use backgroundColor to convert to hsl to rgb format
      tar.style.backgroundColor = color;
      const bc = getComputedStyle(tar, null).backgroundColor;
      const l = String(bc).replace(/[^0-9,]/g, '').split(',');
      col = 'x' + this.x16(l[0]) + this.x16(l[1]) + this.x16(l[2]);

      if (this.whiteObj) {
        col = 'x' + this._value.substr(0, 2) + col.substr(1);
      } // if

    } else if (tar === this.whiteObj) {
      col = 'x' + this.x16(tar.value) + this._value.substr(2);

    } else if (tar === this.brightObj) {
      this.dispatchAction('brightness', tar.value);
    }

    if (col.length > 0) {
      this.dispatchAction('value', col);
    }
  } // on_input


  // rgb in format xRRGGBB, #RRGGBB, nnRRGGBB, #nnRRGGBB
  // hue in range 0...359
  private rgbToHue(color: string): number {
    let hue = 0;

    // only last 6 chars of interest...
    if (color && color.length >= 6) {
      const rgb = color.substr(color.length - 6);

      const r = parseInt(rgb.substr(0, 2), 16) / 255;
      const g = parseInt(rgb.substr(2, 2), 16) / 255;
      const b = parseInt(rgb.substr(4, 2), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const d = max - min;
      if (d > 0) {
        if (max === r) {
          hue = (g - b) / d + (g < b ? 6 : 0);
        } else if (max === g) {
          hue = (b - r) / d + 2;
        } else if (max === b) {
          hue = (r - g) / d + 4;
        }
      }
    } // if
    return (Math.round(hue * 60) % 360);
  } // rgbToHue


  private x16(d: any): string {
    let x = Number(d).toString(16);
    if (x.length === 1) {
      x = '0' + x;
    }
    return (x);
  }
}

// End.
