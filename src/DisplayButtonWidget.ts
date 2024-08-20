// DisplayLineWidget.ts: Widget Behavior implementation for DisplayLine Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />
/// <reference path="DisplayItemWidget.ts" />

@MicroControl('displaybutton')
class DisplayButtonWidgetClass extends DisplayItemWidgetClass {

  override connectedCallback() {
    super.connectedCallback();
    if (this._dispElem) {
      this._elem = createHTMLElement(this._dispElem, 'button', { class: 'but', style: 'top:0;left:0' });
      this._elem.addEventListener('click', (evt) => {
        console.log('evt', evt);
        this.dispatchAction("action=click", '1');
      });
    }
  } // connectedCallback

  override newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    const e = this._elem;
    const sty = this._elem.style;
    if (key === 'text') {
      e.innerText = value;
    } else if (key === 'w') {
      sty.width = value + (this._grid > 1 ? 'ch' : 'px');
    } else if (key === 'h') {
      sty.height = value + (this._grid > 1 ? 'em' : 'px');
      sty.fontSize = (Number(value) * 0.7) + (this._grid > 1 ? 'em' : 'px');
    } else if (key === 'color') {
      sty.borderColor = value.replace(/^x/, '#');
    }
  } // newData

  override on_click(evt: MouseEvent) {
    super.on_click(evt);
    console.log(evt);
    // if (evt.target === this._objButton) {
    //   if (this._duration > 800) {
    //     // press event
    //     this.dispatchAction("action=press", '1');

    //   } else {
    //     // single short click
    //     if (this._timer) { window.clearTimeout(this._timer); }
    //     this._timer = window.setTimeout(() => {
    //       this.dispatchAction("action=click", '1');
    //     }, 250);
    //   }
    // }
  } // on_click

} // class DisplayLineWidgetClass

// End.
