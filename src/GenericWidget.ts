// GenericWidget.ts: Basic Behavior implementation for UI of Elements

/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />

// === Generic Widget Behavior ===

@MicroControl('generic')
class GenericWidgetClass extends MicroControlClass {
  microid!: string;
  data: any;
  actions!: string[];
  subId!: number;

  static idc = 42;
  protected uid(obj: HTMLElement): string {
    if (!obj.id) {
      obj.id = 'o' + (GenericWidgetClass.idc++);
    }
    return (obj.id);
  }


  override connectedCallback() {
    super.connectedCallback();

    // attach labels to inputs
    this.querySelectorAll('label:not([for])+input').forEach(iObj => {
      const lObj = iObj.previousElementSibling as HTMLLabelElement;
      lObj.htmlFor = this.uid(iObj as HTMLInputElement);
    });

    this.querySelectorAll('label:not([for])+div input').forEach(iObj => {
      const lObj = iObj.parentElement?.previousElementSibling as HTMLLabelElement;
      lObj.htmlFor =
        this.uid(iObj as HTMLInputElement);
    });

    if (!this.microid) { this.microid = ''; }
    this.data = { id: this.microid };
    this.actions = [];
    this.subId = hub.subscribe(this.microid + '?*', this.newData.bind(this));
    hub.replay(this.subId);
  } // connectedCallback

  // visualize any new data for the widget.
  newData(_path: string, key: string, value: string) {
    // save data to title
    this.data[key] = value;
    const ic = this.querySelector('h1,h3,img') as HTMLElement;
    if (ic) {
      setAttr(ic, 'title',
        JSON.stringify(this.data, null, 1)
          .replace('{\n', '')
          .replace('\n}', '')
      );
    }

    // active card
    if (key === 'active') {
      this.classList.toggle('active', toBool(value));
    }

    // u-active flags
    ['span', 'div'].forEach(elType => {
      this.querySelectorAll(`${elType}[u-active='${key}']`).forEach(function(elem) {
        const b = toBool(value);
        setAttr(elem as HTMLElement, 'value', b ? '1' : '0');
        setAttr(elem as HTMLElement, 'title', b ? 'active' : 'not active');
        elem.classList.toggle('active', b);
      });
    });

    // u-display flags
    this.querySelectorAll(`*[u-display='${key}']`).forEach(elem => {
      (elem as HTMLElement).style.display = (value ? '' : 'none');
    });

    // u-text: substitude textContent
    this.querySelectorAll(`*[u-text='${key}']`).forEach(elem => {
      if (elem.textContent !== value) { elem.textContent = value; }
    });

    // u-value: value of input and select fields
    ['input', 'select'].forEach(elType => {
      this.querySelectorAll(`${elType}[u-value='${key}']`)
        .forEach(elem => {
          if ((elem as HTMLInputElement).type === 'radio') {
            (<HTMLInputElement>elem).checked = (<HTMLInputElement>elem).value === value;
          } else if ((elem as HTMLInputElement).value !== value) {
            (elem as HTMLInputElement).value = value ? value : '';
          }
        });
    });

    // Color
    this.querySelectorAll(`span[u-color='${key}']`).forEach(function(elem) {
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
            try { window.updateState(); } catch { }
          } // if
        });
      }
    }
  } // dispatchNext()


  // send an action to the board and dispatch to the element
  dispatchAction(prop?: string | null, val?: string | null) {
    if (prop && val) {
      if (prop.includes('/')) {
        // list of actions with optional value placeholder
        prop = prop.replace('${v}', encodeURI(val));
        prop.split(',').forEach((a) => {
          if (!a.startsWith('/')) { a = '/' + a; }
          this.actions.push('/api/state' + a);
        });
      } else {
        // simple set one property to this element
        this.actions.push(`/api/state${this.microid}?${prop}=${encodeURI(val)}`);
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
  on_click(event: MouseEvent) {
    const chain = [];
    let n: HTMLElement | null = event.target as HTMLElement;
    while (n) {
      chain.push(n);
      if (n === this) { break; }
      n = n.parentElement;
    }

    chain.every(p => {
      let ret = false;
      if (p.getAttribute('u-action')) {
        this.dispatchAction(p.getAttribute('u-action'), p.getAttribute('value') || '1');

      } else if (p.classList.contains('setconfig')) {
        const ti = this.microid.split('/');
        DialogClass.openModalForm('configElement', { ...this.data, type: ti[1], id: ti[2] });

      } else if (p.classList.contains('setactive')) {
        this.dispatchAction(toBool(this.data.active) ? 'stop' : 'start', '1');

      } else if (p.classList.contains('fullscreen')) {
        this.requestFullscreen();

      } else {
        ret = true;
      }
      return (ret);
    });
  }
} // GenericWidgetClass

// End.
