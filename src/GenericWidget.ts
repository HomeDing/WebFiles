// ding.js: Behaviors for Elements

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />

// === Generic Widget Behavior ===

@MicroControl('generic')
class GenericWidgetClass extends MicroControlClass {
  microid: string = '';
  data: any = {};
  subId: number = 0;

  connectedCallback() {
    super.connectedCallback();
    this.data = { id: this.microid };
    this.subId = hub.subscribe(this.microid + '?*', this.newData.bind(this));
    hub.replay(this.subId);
  } // connectedCallback

  // visualize any new data for the widget.
  newData(_path: string, key: string | null, value: string | null) {
    // save data to title
    if (this.el && key && value) {
      this.data[key] = value;
      var ic = this.el.querySelector('img');
      if (ic) {
        setAttr(ic, 'title',
          JSON.stringify(this.data, null, 1)
            .replace('{\n', '')
            .replace('\n}', '')
        );
      }
    }

    // u-active flags
    ['span', 'div'].forEach(function (this: GenericWidgetClass, elType) {
      if (this.el) {
        this.el.querySelectorAll(elType + `[u-active='${key}']`).forEach(function (elem) {
          var b = toBool(value);
          setAttr(elem as HTMLElement, 'value', b ? '1' : '0');
          setAttr(elem as HTMLElement, 'title', b ? 'active' : 'not active');
          elem.classList.toggle('active', b);
        });
      }
    }, this);

    // textContent
    ['h2', 'h4', 'span'].forEach(function (this: GenericWidgetClass, elType) {
      if (this.el) {
        this.el.querySelectorAll(elType + "[u-text='" + key + "']").forEach(function (elem) {
          if (elem.textContent != value) elem.textContent = value;
        });
      }
    }, this);

    // value of input and select fields
    ['input', 'select'].forEach(function (this: GenericWidgetClass, elType) {
      if (this.el) {
        this.el.querySelectorAll(elType + "[u-value='" + key + "']").forEach(function (elem) {
          if ((elem as HTMLInputElement).value != value) (elem as HTMLInputElement).value = value ? value : "";
        });
      }
    }, this);
  } // newData()

  // send an action to the board and dispatch to the element
  dispatchAction(prop: string | null, val: string | null) {
    if (prop !== null && val !== null) {
      fetch(`/$board${this.microid}?${prop}=${encodeURI(val)}`).then(() => {
        // @ts-ignore
        if (updateAsap) updateAsap();
      });
    }
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
    if (src && a) this.dispatchAction(a, (<any>src)['value']);

    if (this.el && src.classList.contains('setconfig')) {
      micro.openModal('configelementdlg', this.data);

    }
  }
} // GenericWidgetClass

// End.
