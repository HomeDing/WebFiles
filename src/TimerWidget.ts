// TimerWidget.ts: Widget Behavior implementation for Timer Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="utils.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />


@MicroControl('timer')
class TimerWidgetClass extends GenericWidgetClass {
  wt: number = 0;
  pt: number = 0;
  ct: number = 0;
  time: number = 0;

  newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    if (key == 'waittime') {
      this.wt = toSeconds(value);
    } else if (key == 'pulsetime') {
      this.pt = toSeconds(value);
    } else if (key == 'cycletime') {
      this.ct = toSeconds(value);
    } else if (key == 'time') {
      this.time = toSeconds(value);
    }

    if (this.ct < this.wt + this.pt) this.ct = this.wt + this.pt;

    // update bars
    if (this.ct > 0) {
      var el = this.querySelector('.u-bar') as HTMLElement;
      var f = el.clientWidth / this.ct;

      var pto = <HTMLElement>el.querySelector('.pulse');
      pto.style.left = Math.floor(this.wt * f) + 'px';
      pto.style.width = Math.floor(this.pt * f) + 'px';

      var cto = <HTMLElement>el.querySelector('.current');
      cto.style.width = Math.floor(this.time * f) + 'px';
    }
  } // newData()}

  on_click(evt: MouseEvent) {
    const tar: HTMLElement = evt.target as HTMLElement;
    if (tar.classList.contains('save')) {
      const d: any = {};
      this.querySelectorAll('[u-value]').forEach(function (elem) {
        const n = elem.getAttribute('u-value');
        if (n) d[n] = (elem as HTMLInputElement).value;
      });
      changeConfig(this.microid, d);
    }
    super.on_click(evt);
  }
}
// End.
