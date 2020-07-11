// SwitchWidget.ts: Widget Behavior implementation for Switch Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('switch')
class SwitchWidgetClass extends GenericWidgetClass {
  on_click(e: MouseEvent) {
    const o: HTMLElement = <HTMLElement>this.querySelector('.u-switch');
    let src: HTMLElement | null = e.srcElement as HTMLElement;
    while (src != null && src != this && src != o) { src = src.parentElement; }
    if (src == o) {
      this.dispatchAction('toggle', '1');
    } else {
      super.on_click(e);
    }
  }
}

// End.
