// DisplayWidget.ts: Widget Behavior implementation for Display Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('display')
class DisplayWidgetClass extends GenericWidgetClass {
  _page!: string;
  _dialogElem!: HTMLElement;
  _svg!: SVGElement;
  _height = 64;
  _width = 64;
  _rotation = 0;

  private _resize() {
    // assume 260px max width for scale factor
    const sty = this._dialogElem.style;
    let w = this._width;
    let h = this._height;
    if ((this._rotation % 180) === 90) {
      w = h;
      h = this._width;
    }
    sty.width = w + 'px';
    sty.height = h + 'px';
    if (w <= 128) {
      sty.setProperty('zoom', '2');
    } else if (w > 260) {
      this.classList.add('wide');
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    this._page = '';
    this._dialogElem = this.querySelector('.display') as HTMLElement;
    this._svg = this.querySelector('svg') as SVGElement;
  }

  // new value is set in the element.
  override newData(path: string, key: string, value: string) {
    super.newData(path, key, value);

    if (key === 'height') {
      this._height = parseInt(value);
      this._resize();

    } else if (key === 'width') {
      this._width = parseInt(value);
      this._resize();

    } else if (key === 'rotation') {
      this._rotation = parseInt(value);
      this._resize();

    } else if (key === 'background') {
      this._dialogElem.style.backgroundColor = value.replace(/^x/, '#');

    } else if (key === 'page') {
      if (value !== this._page) {
        this._page = value;
        this._dialogElem.querySelectorAll(':scope > span').forEach((e) => {
          const p = (<HTMLElement>e).getAttribute('displayPage') || '1';
          (<any>e).style.display = (p === this._page) ? '' : 'none';
        });
      }
    }
  } // newData
  
} // class DisplayWidgetClass

// End.
