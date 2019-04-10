// ding.js: Behaviors for Elements

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />

// === Generic Widget Behavior ===

@MicroControl('generic')
class GenericWidgetClass extends MicroControlClass {
  microid: string = '';
  data: any = {};
  subId: number = 0;

  connectedCallback(el: HTMLElement) {
    super.connectedCallback(el);
    this.data = { id: this.microid };
    this.subId = hub.subscribe(this.microid + '?*', this.newData.bind(this));
    hub.replay(this.subId);
  } // connectedCallback

  // visualize any new data for the widget.
  newData(_path: string, key: string, value: string) {
    // save data to title
    this.data[key] = value;
    var ic = this.el.querySelector('img');
    if (ic) {
      setAttr(
        ic,
        'title',
        JSON.stringify(this.data, null, 1)
          .replace('{\n', '')
          .replace('\n}', '')
      );
    }

    // u-active flags
    ['span', 'div'].forEach(function(elType) {
      this.el.querySelectorAll(elType + `[u-active='${key}']`).forEach(function(el: HTMLElement) {
        var b = toBool(value);
        setAttr(el, 'value', b ? '1' : '0');
        setAttr(el, 'title', b ? 'active' : 'not active');
        el.classList.toggle('active', b);
      });
    }, this);

    // textContent
    ['h2', 'h4', 'span'].forEach(function(elType) {
      this.el.querySelectorAll(elType + "[u-text='" + key + "']").forEach(function(el) {
        if (el.textContent != value) el.textContent = value;
      });
    }, this);

    // value of input fields
    this.el.querySelectorAll("input[u-value='" + key + "']").forEach(function(el: HTMLInputElement) {
      if (el.value != value) el.value = value;
    });
  } // newData()

  // send an action to the board and dispatch to the element
  dispatchAction(prop: string | null, val: string | null) {
    if (prop !== null && val !== null) fetch(`/$board${this.microid}?${prop}=${encodeURI(val)}`);
  } // dispatchAction()

  // send changed value of property as an action to the board
  onchange(e: Event) {
    var src = e.target as HTMLInputElement;
    this.dispatchAction(src.getAttribute('u-value'), src.value);
  }

  // send an action to the board
  // + change config mode
  onclick(e: MouseEvent) {
    var src = e.target as HTMLElement;
    var a = src.getAttribute('u-action');
    if ((src) && (a)) this.dispatchAction(a, (<any>src)['value']);

    if (src.classList.contains('setconfig')) {
      this.el.classList.toggle('configmode');
    }
  }
} // GenericWidgetClass

// End.
