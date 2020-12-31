// NeoWidget.ts: Widget Behavior implementation for Switch Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('neo')
class NeoWidgetClass extends GenericWidgetClass {
  private colObj: HTMLElement | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.colObj = this.querySelector('.color') as HTMLElement;
  } // connectedCallback

  // visualize any new data for the widget.
  newData(_path: string, key: string | null, value: string | null) {
    if ((key === 'value') && (this.colObj) && (value)) {
      this.colObj.style.backgroundColor = value.replace('x', '#');
    }
    super.newData(_path, key, value);
  }

  on_click(e: MouseEvent) {
    const src = e.target as HTMLElement;
    if (src.className === 'hueband') {
      const color = 'hsl(' + Math.round(e.offsetX) + ', 100%, 50%)';
      src.style.backgroundColor = color;

      if (document && document.defaultView) {
        const ccol = document.defaultView.getComputedStyle(src, null).backgroundColor;
        const l = String(ccol).replace(/[^0-9,]/g, '').split(',');
        const col = 'x' + this.x16(l[0]) + this.x16(l[1]) + this.x16(l[2]);
        this.dispatchAction('value', col);
      }
    } else {
      super.on_click(e);
    }
  }

  private x16(d: string): string {
    let x = Number(d).toString(16);
    if (x.length === 1) {
      x = '0' + x;
    }
    return (x);
  }
}

// End.
