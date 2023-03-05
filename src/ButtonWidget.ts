// ButtonWidget.ts: Widget Behavior implementation for Button Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('button')
class ButtonWidgetClass extends GenericWidgetClass {
  _onclick: string | undefined;
  _ondoubleclick: string | undefined;
  _onpress: string | undefined;
  _timer: number | undefined;
  _start!: number;
  _duration!: number;
  _objButton!: HTMLButtonElement;

  override connectedCallback() {
    super.connectedCallback();
    this._objButton = this.querySelector('button') as HTMLButtonElement;
  }

  override newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    if (key === 'onclick') {
      this._onclick = value;
    } else if (key === 'ondoubleclick') {
      this._ondoubleclick = value;
    } else if (key === 'onpress') {
      this._onpress = value;
    } // if
  } // newData()

  override on_click(evt: MouseEvent) {
    super.on_click(evt);
    if (evt.target === this._objButton) {
      if (this._duration > 800) {
        // press event
        if (this._onpress) {
          this.dispatchAction(this._onpress, '1');
        }

      } else {
        // single short click
        if (this._timer) { window.clearTimeout(this._timer); }
        this._timer = window.setTimeout(() => {
          this.dispatchAction(this._onclick, '1');
        }, 250);
      }
    }
  } // on_click

  on_dblclick(evt: MouseEvent) {
    if (evt.target === this._objButton) {
      if (this._timer) { window.clearTimeout(this._timer); }
      this.dispatchAction(this._ondoubleclick, '1');
    }
  } // on_dblclick

  on_pointerdown(evt: PointerEvent) {
    if (evt.target === this._objButton) {
      this._start = new Date().valueOf();
    }
  } // on_pointerdown


  on_pointerup(evt: PointerEvent) {
    if (evt.target === this._objButton) {
      this._duration = new Date().valueOf() - this._start;
    }
    // onclick event will follow.
  } // on_pointerup()
}
