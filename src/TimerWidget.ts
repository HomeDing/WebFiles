// TimerWidget.ts: Widget Behavior implementation for Timer Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="utils.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />


@MicroControl('timer')
class TimerWidgetClass extends GenericWidgetClass {
  wt = 0;
  pt = 0;
  ct = 0;
  time = 0;

  override connectedCallback() {
    super.connectedCallback();
    this.wt = 0;
    this.pt = 0;
    this.ct = 0;
    this.time = 0;
  }

  override newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    if (key === 'waittime') {
      this.wt = toSeconds(value);
    } else if (key === 'pulsetime') {
      this.pt = toSeconds(value);
    } else if (key === 'cycletime') {
      this.ct = toSeconds(value);
    } else if (key === 'time') {
      this.time = toSeconds(value);
    }

    if (this.ct < this.wt + this.pt) { this.ct = this.wt + this.pt; }

    // update bars
    if (this.ct > 0) {
      const el = this.querySelector('.u-bar') as HTMLElement;
      const f = el.clientWidth / this.ct;

      const pto = <HTMLElement>el.querySelector('.pulse');
      pto.style.left = Math.floor(this.wt * f) + 'px';
      pto.style.width = Math.floor(this.pt * f) + 'px';

      const cto = <HTMLElement>el.querySelector('.current');
      cto.style.width = Math.floor(this.time * f) + 'px';
    }
  } // newData()}
}
// End.
