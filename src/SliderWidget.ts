// SliderWidget.ts: Widget Behavior implementation for Slider Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('slider')
class SliderWidgetClass extends GenericWidgetClass {
  _slider: HTMLElement | null = null; /// <summary>Reference to the slider obj.</summary>
  _handle: HTMLElement | null = null; /// <summary>Reference to the handle obj.</summary>
  _lastValue = -1; /// <summary>last published value to avoid doublicate events.</summary>
  _maxright = 100; // = p.offsetWidth - this._handle.offsetWidth;
  _x = 0; // x - offset of mouse and handle while moving.
  _xOffset = 0; // x - offset of mouse and area.
  unit = 1;
  _type = 'int';

  minvalue = 0; /// <summary>The value that is reached on the leftmost position of the knob.</summary>
  maxvalue = 255; /// <summary>The value that is reached on the rightmost position of the knob.</summary>

  _moveFunc: any;
  _upFunc: any;

  connectedCallback() {
    this._slider = this.querySelector('.u-slider');
    this._handle = this.querySelector('.handle');
    super.connectedCallback();
    // find the moveable knob
    if (this._handle) {
      const p = <HTMLElement>this._handle.parentElement;
      const ps = getComputedStyle(p);
      this._maxright = p.clientWidth - this._handle.offsetWidth - parseFloat(<string>ps.paddingLeft) - parseFloat(<string>ps.paddingRight);
    }
  } // connectedCallback

  // adjust position of the handle
  _adjustHandle(val: number) {
    if (this._handle) {
      let left = val - this.minvalue;

      left = Math.round(left * this._maxright / (this.maxvalue - this.minvalue));
      left = Math.min(this._maxright, Math.max(0, left));
      this._handle.style.left = left + 'px';
    }
  } // _adjustHandle()


  newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    if (key === 'value') {
      const v = Number(value);
      if (v !== this._lastValue) {
        this._adjustHandle(v);
        this._lastValue = v;
      }
    } else if (key === 'min') {
      this.minvalue = Number(value);
    } else if (key === 'max') {
      this.maxvalue = Number(value);
    } else if (key === 'step') {
      this.unit = Number(value);
    } else if (key === 'type') {
      this._type = value;
      if (this._slider) {
        if (value === 'string') {
          this._slider.style.display = 'none';
        }
      }
    } // if
  } // newData()


  on_click(e: MouseEvent) {
    let src: HTMLElement | null = e.target as HTMLElement;

    while (src != null && src != this) {
      if (src.tagName === 'LABEL' && src.classList.contains('up')) {
        this.dispatchAction('up', '1');
        break;

      } else if (src.tagName === 'LABEL' && src.classList.contains('down')) {
        this.dispatchAction('down', '1');
        break;
      }
      src = src.parentElement;
    } // while
    super.on_click(e);
  } // on_click

  on_mousedown(evt: MouseEvent) {
    if (evt.target === this._handle) {
      this.MoveStart(evt);
    } // if
  } // on_mousedown()

  MoveStart(evt: MouseEvent) {
    /// <summary>Start sliding the knob.</summary>
    this._xOffset = 0;
    let obj = (this._handle as HTMLElement).offsetParent as (HTMLElement | null);
    while (obj != null) {
      this._xOffset += obj.offsetLeft;
      obj = obj.offsetParent as HTMLElement;
    } // while

    // calculate mousepointer-knob delta
    this._x = evt.clientX - ((this._handle as HTMLElement).offsetLeft + this._xOffset);

    // attach move-handlers on document to get any move
    this._moveFunc = this._onmousemove.bind(this);
    document.addEventListener('mousemove', this._moveFunc, false);
    this._upFunc = this._onmouseup.bind(this);
    document.addEventListener('mouseup', this._upFunc, false);

    // cancel selecting anything
    evt.cancelBubble = true;
    evt.returnValue = false;
  } // MoveStart


  _onmousemove(evt: MouseEvent) {
    /// <summary>Handle the mouse button move event. This handler will be attached to the document level.</summary>
    let left = evt.clientX - this._x - this._xOffset;
    left = Math.min(this._maxright, Math.max(0, left));

    // calc value from position
    let val = Math.round(left * (this.maxvalue - this.minvalue) / this._maxright + this.minvalue);
    val = Math.round(val / this.unit) * this.unit;
    this._adjustHandle(val);

    if (val !== this._lastValue) {
      this._lastValue = val;
      this.dispatchAction('value', String(val));
    } // if
  } // onmousemove


  _onmouseup(evt: MouseEvent) {
    /// <summary>Handle the mouse button up event. This handler will be attached to the document level.</summary>
    evt = evt || window.event;
    document.removeEventListener('mousemove', this._moveFunc);
    document.removeEventListener('mouseup', this._upFunc);
  } // onmouseup

  on_touchstart(evt: TouchEvent) {
    /// <summary>Handle the event when a touch operation starts.</summary>
    const t = evt.targetTouches[0].target;
    if (t === this._handle) {
      // this.TouchStart(evt);
      console.log('TouchStart');
    } // if
  } // ontouchstart()
} // class

// End.
