// SwitchWidget.ts: Widget Behavior implementation for Timer Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

// start uploading file content
function upload(filename: string, content: string) {
  var formData = new FormData();
  var blob = new Blob([content], {
    type: 'text/html'
  });
  formData.append(filename, blob, filename);

  var objHTTP = new XMLHttpRequest();
  objHTTP.open('POST', '/');
  // if (objHTTP.upload) {
  //   objHTTP.upload.addEventListener('progress', function (e) {
  //     progressObj.max = e.total;
  //     progressObj.value = e.loaded;
  //   });
  // } // if

  objHTTP.addEventListener('readystatechange', function () {
    if (this.readyState == 4 && this.status >= 200 && this.status < 300) {
      alert('saved.');
    } // if
  });
  objHTTP.send(formData);
} // upload

function changeConfig(id: string, newConfig: any) {
  var c = JSON.parse(hub.read('config'));
  var node = jsonFind(c, id);
  for (let n in newConfig) {
    if (newConfig[n]) {
      node[n] = newConfig[n];
    } else {
      delete node[n];
    }
  }
  upload('/config.json', JSON.stringify(c));
} // changeConfig()

@MicroControl('timer')
class TimerWidgetClass extends GenericWidgetClass {
  wt: number = 0;
  pt: number = 0;
  ct: number = 0;
  time: number = 0;

  _timeToSec(v: string): number {
    let ret: number = 0;
    v = v.toLowerCase();
    if (v.endsWith('h')) {
      ret = parseInt(v, 10) * 60 * 60;
    } else if (v.endsWith('m')) {
      ret = parseInt(v, 10) * 60;
    } else if (v.endsWith('s')) {
      ret = parseInt(v, 10);
    } else {
      ret = Number(v);
    } // if
    return ret;
  } // _timeToSec()

  newData(path: string, key: string, value: string) {
    super.newData(path, key, value);
    if (key == 'waittime') {
      this.wt = this._timeToSec(value);
    } else if (key == 'pulsetime') {
      this.pt = this._timeToSec(value);
    } else if (key == 'cycletime') {
      this.ct = this._timeToSec(value);
    } else if (key == 'time') {
      this.time = this._timeToSec(value);
    }

    if (this.ct < this.wt + this.pt) this.ct = this.wt + this.pt;

    // update bars
    if (this.el && this.ct > 0) {
      var el = <HTMLElement>this.el.querySelector('.u-bar');
      var f = el.clientWidth / this.ct;

      var pto = <HTMLElement>el.querySelector('.pulse');
      pto.style.left = Math.floor(this.wt * f) + 'px';
      pto.style.width = Math.floor(this.pt * f) + 'px';

      var cto = <HTMLElement>el.querySelector('.current');
      cto.style.width = Math.floor(this.time * f) + 'px';
    }
  } // newData()}

  onclick(evt: MouseEvent) {
    const tar: HTMLElement = evt.target as HTMLElement;
    if (this.el && tar.classList.contains('save')) {
      const d: any = {};
      this.el.querySelectorAll('[u-value]').forEach(function (elem) {
        const n = elem.getAttribute('u-value');
        if (n) d[n] = (elem as HTMLInputElement).value;
      });
      changeConfig(this.microid, d);
    }
    super.onclick(evt);
  }
}
// End.
