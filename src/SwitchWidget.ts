// SwitchWidget.ts: Widget Behavior implementation for Switch Elements

// This file is part of the Widget implementation for the HomDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl("switch")
class SwitchWidgetClass extends GenericWidgetClass {
  onclick(e: MouseEvent) {
    var o: HTMLElement = <HTMLElement>this.el.querySelector(".u-switch");
    var src = e.srcElement;
    while (src != null && src != this.el && src != o) src = src.parentElement;
    if (src == o) this.dispatchAction("toggle", 1);
  }
}

// End.
