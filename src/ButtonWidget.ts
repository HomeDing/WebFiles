// SwitchWidget.ts: Widget Behavior implementation for Button@MicroControl("timer") Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('button')
class ButtonWidgetClass extends GenericWidgetClass {
  on_pointerdown(e: PointerEvent) {
    const src = e.target as HTMLElement;
    if ((src) && (src.classList.contains('u-button'))) {
      src.classList.add('active');
      this.dispatchAction('value', '1');
    } // if

  }

  on_pointerup(e: PointerEvent) {
    const src = e.target as HTMLElement;
    if (src.classList.contains('u-button')) {
      src.classList.remove('active');
      this.dispatchAction('value', '0');
    } // if
  }
}
