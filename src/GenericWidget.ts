// GenericWidget.ts: Basic Behaviors implementation for Elements

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />

// === Generic Widget Behavior ===

@MicroControl('generic')
class GenericWidgetClass extends MicroControlClass {
  microid = '';
  data: any = {};
  subId = 0;
  actions: string[] = [];

  connectedCallback() {
    super.connectedCallback();
    this.data = { id: this.microid };
    this.subId = hub.subscribe(this.microid + '?*', this.newData.bind(this));
    hub.replay(this.subId);
  } // connectedCallback

  // visualize any new data for the widget.
  newData(_path: string, key: string | null, value: string | null) {
    // save data to title
    if (key && value) {
      this.data[key] = value;
      const ic = this.querySelector('img,h3') as HTMLElement;
      if (ic) {
        setAttr(ic, 'title',
          JSON.stringify(this.data, null, 1)
            .replace('{\n', '')
            .replace('\n}', '')
        );
      }
    }

    // active card
    if (key === 'active') {
      this.classList.toggle('active', toBool(value));
    }

    // u-active flags
    ['span', 'div'].forEach(function (this: GenericWidgetClass, elType) {
      this.querySelectorAll(elType + `[u-active='${key}']`).forEach(function (elem) {
        const b = toBool(value);
        setAttr(elem as HTMLElement, 'value', b ? '1' : '0');
        setAttr(elem as HTMLElement, 'title', b ? 'active' : 'not active');
        elem.classList.toggle('active', b);
      });
    }, this);

    // textContent
    ['h2', 'h3', 'h4', 'span', 'button'].forEach(function (this: GenericWidgetClass, elType) {
      this.querySelectorAll(elType + '[u-text=\'' + key + '\']').forEach(function (elem) {
        if (elem.textContent !== value) { elem.textContent = value; }
      });
    }, this);

    // value of input and select fields
    ['input', 'select'].forEach(function (this: GenericWidgetClass, elType) {
      this.querySelectorAll(elType + '[u-value=\'' + key + '\']').forEach(function (elem) {
        if ((elem as HTMLInputElement).type === 'radio') {
          (<HTMLInputElement>elem).checked = (<HTMLInputElement>elem).value === value;
        } else if ((elem as HTMLInputElement).value !== value) {
          (elem as HTMLInputElement).value = value ? value : '';
        }
      });
    }, this);

    // action of buttons
    ['button', 'label'].forEach(function (this: GenericWidgetClass, elType) {
      this.querySelectorAll(elType + '[u-action=\'${' + key + '}\']').forEach(function (elem) {
        setAttr(elem as HTMLElement, 'u-action', value ? value : '');
      });
    }, this);

    // Color
    this.querySelectorAll(`span[u-color='${key}']`).forEach(function (elem) {
      let col = value ? value.replace(/^x/, '#') : '#888';
      col = col.replace(/^#\S{2}(\S{6})$/, '#$1');
      (elem as HTMLElement).style.backgroundColor = col;
    });

  } // newData()


  dispatchNext() {
    if (this.actions) {
      const a = this.actions.shift();
      if (a) {
        // assume format "/type/id?action=value", value needs to be encoded correctly
        // encode all special chars after = character.
        const aa = a.split('=');
        const aUrl = aa[0] + '=' + encodeURIComponent(aa[1]);
        fetch(aUrl).then(() => {
          if (this.actions.length > 0) {
            debounce(this.dispatchNext.bind(this))();
          } else {
            // @ts-ignore
            if (updateAsap) { updateAsap(); }
          } // if
        });
      }
    }
  } // dispatchNext()


  // send an action to the board and dispatch to the element
  dispatchAction(prop: string | null, val: string | null) {
    if (prop !== null && val !== null) {
      if (prop.includes('/')) {
        // list of actions with optional value placeholder
        prop.replace('${v}', encodeURI(val));
        prop.split(',').forEach((a) => this.actions.push('/$board/' + a));
      } else {
        // simple set one property to this element
        this.actions.push(`/$board${this.microid}?${prop}=${encodeURI(val)}`);
      }
      debounce(this.dispatchNext.bind(this))();
    }
  } // dispatchAction()

  showSys(): boolean {
    const p = getHashParams({ sys: false }).sys;
    return (toBool(p));
  }


  // send changed value of property as an action to the board
  on_change(e: Event) {
    const src = e.target as HTMLInputElement;
    this.dispatchAction(src.getAttribute('u-value'), src.value);
  }

  // send an action to the board
  // + change config mode
  on_click(e: MouseEvent) {
    const src = e.target as HTMLElement;

    // action may be on target or any parent element.
    let p: HTMLElement | null = src;
    while (p && !(p.getAttribute('u-action')) && p !== this) {
      p = p.parentElement;
    }
    if (p) {
      this.dispatchAction(p.getAttribute('u-action'), p.getAttribute('value') || '1');
    }

    if (src.classList.contains('setconfig')) {
      ModalDialogClass.open('configelementdlg', this.data);

    } else if (src.classList.contains('setactive')) {
      this.dispatchAction(toBool(this.data.active) ? 'stop' : 'start', '1');

    } else if (src.tagName === 'H3') {
      ModalDialogClass.openFocus(this);
    }
  }
} // GenericWidgetClass

// End.
