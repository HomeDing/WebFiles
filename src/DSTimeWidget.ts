// DSTimeWidget.ts: Widget Behavior implementation for DSTime Elements

// This file is part of the Widget implementation for the HomDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl("dstime")
class DSTimeClass extends GenericWidgetClass {
  _nowObj:HTMLElement;

  isoDate () {
    function pad02(num) {
      return (((num < 10) ? '0' : '') + num);
    };

    var d = new Date();
    var ds = d.getFullYear() + '-' + pad02(d.getMonth() + 1) + '-' + pad02(d.getDate()) +
      ' ' + pad02(d.getHours()) + ':' + pad02(d.getMinutes()) + ':' + pad02(d.getSeconds());
    return (ds);
  }

  connectedCallback (el:HTMLElement) {
    super.connectedCallback(el);
    this._nowObj = <HTMLElement>this.el.querySelector(".now");
    window.setInterval(function () {
      setTextContent(this._nowObj, this.isoDate());
    }.bind(this), 200);
  }

  onclick (e:MouseEvent) {
    var src = e.srcElement;
    if (src.classList.contains("setnow")) {
      this.dispatchAction("time", this.isoDate())
    } else {
      super.onclick(e);
    }
  }
}

// End.