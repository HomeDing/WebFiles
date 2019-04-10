// SwitchWidget.ts: Widget Behavior implementation for Button@MicroControl("timer") Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl("button")
class ButtonWidgetClass extends GenericWidgetClass {
  onpointerdown(e: PointerEvent) {
    const src = e.target as HTMLElement;
    if ((src) && (src.classList.contains("u-button"))) {
      src.classList.add("active");
      this.dispatchAction("value", '1');
    } // if

  }

  onpointerup(e: PointerEvent) {
    const src = e.target as HTMLElement;
    if (src.classList.contains("u-button")) {
      src.classList.remove("active");
      this.dispatchAction("value", '0');
    } // if
  }
}
