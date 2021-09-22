// BL0937Widget.ts: Widget Behavior implementation for BL0937 Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('bl0937')
class BL0937WidgetClass extends GenericWidgetClass {
  mode!: string;

  connectedCallback() {
    super.connectedCallback();
    if (!this.mode) this.mode = 'current';
    this.data = { id: this.microid };
    this.subId = hub.subscribe(this.microid + '?mode', this.switchMode.bind(this));
    hub.replay(this.subId);
  } // connectedCallback

  setMode(newMode: string | null) {
    if (newMode && (newMode !== this.mode)) {
      let td;
      // hide old mode output
      td = this.querySelector(`[u-text="${this.mode}"]`);
      if (td?.parentElement) { td.parentElement.style.display = 'none'; }
      // show new mode output
      td = this.querySelector(`span[u-text="${newMode}"]`);
      if (td?.parentElement) { td.parentElement.style.display = ''; }
      this.mode = newMode;
    }
  }

  // visualize any new data for the widget.
  switchMode(_path: string, _key: string | null, value: string | null) {
    this.setMode(value);
  }

  on_click(e: MouseEvent) {
    const src = e.target as HTMLElement;
    if (src.getAttribute('u-action') === 'mode') {
      this.setMode((<any>src)['value']);
    }
    super.on_click(e);
  }
}

// End.
