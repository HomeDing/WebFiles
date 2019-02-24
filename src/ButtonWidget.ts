// SwitchWidget.ts: Widget Behavior implementation for Button@MicroControl("timer") Elements

// This file is part of the Widget implementation for the HomDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl("button")
class ButtonBehavior extends GenericWidgetClass {
  onpointerdown(e: PointerEvent) {
    var src = e.srcElement;
    if (src.classList.contains("u-button")) {
      src.classList.add("active");
      this.dispatchAction("value", 1);
    } // if
  }

  onpointerup(e: PointerEvent) {
    var src = e.srcElement;
    if (src.classList.contains("u-button")) {
      src.classList.remove("active");
      this.dispatchAction("value", 0);
    } // if
  }
}
