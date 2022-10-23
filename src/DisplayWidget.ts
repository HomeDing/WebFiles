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
  _height = 64;
  _width = 64;
  _rotation = 0;

  _resize() {
    const d = this._dialogElem;
    if ((this._rotation === 90 || this._rotation === 270)) {
      d.style.width = this._height + 'px';
      d.style.height = this._width + 'px';
    } else {
      d.style.width = this._width + 'px';
      d.style.height = this._height + 'px';
    }
    d.style.transform = "scale(0.9)";
  }

  override connectedCallback() {
    super.connectedCallback();
    this._page = '';
    this._dialogElem = this.querySelector('.display') as HTMLElement;
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

    } else if (key === 'back') {
      value = value.replace(/^x/, '#');
      this._dialogElem.style.backgroundColor = value;
      this._resize();

    } else if (key === 'page') {
      if (value !== this._page) {
        this._page = value;
        this._dialogElem.querySelectorAll(':scope > span').forEach((e) => {
          const p = (<HTMLElement>e).getAttribute('displayPage') || '1';
          (<any>e).style.display = (p === this._page) ? '' : 'none';
        });
      }
    }
  } // newValue
} // class DisplayWidgetClass

// End.
