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
  private hueObj: HTMLElement | null = null;
  private brightObj: HTMLElement | null = null;
  private whiteObj: HTMLElement | null = null;
  private _value = '00000000';
  private _brightness = 0;

  connectedCallback() {
    super.connectedCallback();
    this.colObj = this.querySelector('.color') as HTMLElement;
    this.hueObj = this.querySelector('.hueband') as HTMLElement;
    this.brightObj = this.querySelector('.brightband') as HTMLElement;
    this.whiteObj = this.querySelector('.whiteband') as HTMLElement;
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

      this.setPoint(this.hueObj, this.rgbToHue(rgb));
      this.setPoint(this.whiteObj, parseInt(this._value.substr(0, 2), 16) / 256);
      if (this.brightObj) {
        const lg = `linear-gradient(to right, black 0%, #${rgb} 100%)`;
        this.brightObj.style.background = lg;
      }

      if (this.colObj) {
        this.colObj.style.backgroundColor = `#${rgb}`;
      }

    } else if (key === 'brightness') {
      this._brightness = parseInt(value, 10);
      this.setPoint(this.brightObj, this._brightness / 100);
    }
    super.newData(_path, key, value);
  }

  on_click(e: MouseEvent) {
    const src = e.target as HTMLElement;
    let col = '';

    if (src === this.hueObj) {
      const x = Math.round(e.offsetX * 360 / src.clientWidth);
      const color = 'hsl(' + x + ', 100%, 50%)';

      if (document && document.defaultView) {
        src.style.backgroundColor = color;
        const ccol = document.defaultView.getComputedStyle(src, null).backgroundColor;
        const l = String(ccol).replace(/[^0-9,]/g, '').split(',');
        col = 'x' + this.x16(l[0]) + this.x16(l[1]) + this.x16(l[2]);
        if (this.whiteObj) {
          col = 'x' + this._value.substr(0, 2) + col.substr(1);
        } // if
      }

    } else if (src === this.whiteObj) {
      const x = Math.min(255, Math.round(e.offsetX * 256 / src.clientWidth));
      col = 'x' + this.x16(x) + this._value.substr(2);

    } else if (src === this.brightObj) {
      const x = Math.min(100, Math.round(e.offsetX * 100 / src.clientWidth));
      this.dispatchAction('brightness', String(x));

    } else {
      super.on_click(e);
    }
    if (col.length > 0) {
      this.dispatchAction('value', col);
    }
  }

  // rgb in format xRRGGBB, #RRGGBB, nnRRGGBB, #nnRRGGBB
  // hue in range 0...1
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
        switch (max) {
          case r:
            hue = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            hue = (b - r) / d + 2;
            break;
          case b:
            hue = (r - g) / d + 4;
            break;
        }
      }
    } // if
    return (hue / 6);
  } // rgbToHue


  private setPoint(bandObj: HTMLElement | null, v: number) {
    if (bandObj) {
      const pObj = bandObj.querySelector('.point') as HTMLElement;
      if (pObj) {
        pObj.style.top = `${bandObj.offsetHeight - 4}px`;
        pObj.style.left = `${Math.round((bandObj.offsetWidth * v) - pObj.offsetWidth / 2)}px`;
      }
    }
  }


  private x16(d: any): string {
    let x = Number(d).toString(16);
    if (x.length === 1) {
      x = '0' + x;
    }
    return (x);
  }
}

// End.
