// DisplayTextWidget.ts: Widget Behavior implementation for DisplayText Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />
/// <reference path="DisplayItemWidget.ts" />

@MicroControl('displaytext')
class DisplayTextWidgetClass extends DisplayItemWidgetClass {
  private _prefix!: string;
  private _postfix!: string;

  override connectedCallback() {
    super.connectedCallback();
    this._elem = createHTMLElement(this._dispElem, 'span', { class: 'text', style: 'top:0;left:0' });
    this._prefix = '';
    this._postfix = '';
  }

  override newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    if (key === 'value') {
      const t = `${this._prefix}${value}${this._postfix}`.replace(/ /g, '&nbsp;');
      if (this._elem.innerHTML !== t) {
        this._elem.innerHTML = t;
      }

    } else if (key === 'fontsize') {
      this._elem.style.fontSize = value + 'px';
      this._elem.style.lineHeight = value + 'px';
      this._elem.style.height = value + 'px';

    } else if (key === 'prefix') {
      this._prefix = value;
    } else if (key === 'postfix') {
      this._postfix = value;
    }
  }
}

// End.
