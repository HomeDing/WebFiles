// SelectWidget.ts: Widget Behavior implementation for Select-Elements

// This file is part of the Widget implementation for the HomeDing Library
// implementing the Web UI corresponding to an internal configured element.

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />

@MicroControl('select')
class SelectWidgetClass extends GenericWidgetClass {
  _objSelect!: HTMLSelectElement;

  override connectedCallback() {
    super.connectedCallback();
    this._objSelect = this.querySelector('select') as HTMLSelectElement;
    this.subId = hub.subscribe(this.microid + '/options[*]?*', this.newData.bind(this));
    hub.replay(this.subId);
  }

  override newData(path: string, key: string, value: string) {
    super.newData(path, key, value);

    const m = path.match(/\/options\[(\d+)\]/);
    if (m) {
      const opts = this._objSelect.options;
      let opt!: HTMLOptionElement;

      const indx = Number(m[1]);
      if (indx < opts.length) {
        opt = opts[indx];
      } else {
        opt = document.createElement('option') as HTMLOptionElement;
        opts.add(opt);
      }
      if (key === 'key') {
        opt.text = value;
      } else if (key === 'value') {
        opt.value = value;
      }
    } // if
  } // newData()

  override on_change(evt: Event) {
    super.on_change(evt);
    this.dispatchAction(this.microid + "?index=${v}", String(this._objSelect.selectedIndex));
  } // on_click
}
