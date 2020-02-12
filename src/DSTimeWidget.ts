// DSTimeWidget.ts: Widget Behavior implementation for DSTime Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl("dstime")
class DSTimeWidgetClass extends GenericWidgetClass {
  _nowObj: HTMLElement | undefined;

  isoDate() {
    function pad02(num: number) {
      return (((num < 10) ? '0' : '') + num);
    };

    var d = new Date();
    var ds = d.getFullYear() + '-' + pad02(d.getMonth() + 1) + '-' + pad02(d.getDate()) +
      ' ' + pad02(d.getHours()) + ':' + pad02(d.getMinutes()) + ':' + pad02(d.getSeconds());
    return (ds);
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.el) {
      this._nowObj = <HTMLElement>this.el.querySelector(".setnow");
      window.setInterval(function (this: DSTimeWidgetClass) {
        if (this._nowObj) {
          setTextContent(this._nowObj, this.isoDate());
        }
      }.bind(this), 200);
    }
  }

  on_click(this: DSTimeWidgetClass, e: MouseEvent) {
    const src = e.target as HTMLElement;
    if ((src) && (src.classList.contains("setnow"))) {
      this.dispatchAction("time", this.isoDate())
    } else {
      super.on_click(e);
    }
  }
}

// End.