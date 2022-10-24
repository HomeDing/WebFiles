// DisplayItemWidget.ts: Widget Behavior base implementation for Display Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

class DisplayItemWidgetClass extends GenericWidgetClass {
  _dispElem!: HTMLElement;
  _grid!: number;
  _elem!: HTMLElement;

  override connectedCallback() {
    super.connectedCallback();
    this._dispElem = document.querySelector('.panel .display') as HTMLElement;
    if (this._dispElem) {
      this._grid = Number(this._dispElem.getAttribute('grid') || 1);
    }

    if (!this.showSys()) {
      this.style.display = 'none';
    }
  }

  override newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    const sty = this._elem.style;
    if (key === 'x') {
      sty.left = value + (this._grid > 1 ? 'ch' : 'px');

    } else if (key === 'y') {
      sty.top = value + (this._grid > 1 ? 'em' : 'px');

    } else if (key === 'page') {
      this._elem.setAttribute('displayPage', value);

    } else if (key === 'color') {
      sty.color = value.replace(/^x/, '#');
    }
  }
}

// End.
