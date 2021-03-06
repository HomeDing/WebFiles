// file: micro.ts
// micro implementation for web controls using html templates and behaviors.

//  <reference path="JsonParse.ts" />
//  <reference path="utils.ts" />

// eslint-disable-next-line no-unused-vars
enum MicroState {
  PREP = 1,
  INIT = 2,
  LOADED = 3
}

class MicroRegistry {
  protected _tco: HTMLElement | null = null; // Templates Container Object
  protected _registry: { [key: string]: GenericWidgetClass } = {}; // all registered mixins by name.
  protected _state: MicroState = MicroState.PREP;

  /// A list with all objects that are attached to any behavior
  protected _unloadedList: Array<HTMLElement> = [];
  protected List: Array<HTMLElement> = [];

  constructor() {
    window.addEventListener('load', this.init.bind(this));
    window.addEventListener('unload', this.onunload.bind(this));
  }

  /**
   * @param {string} fName
   */
  loadFile(fName: string): Promise<void> {
    const scope = this;
    const ret = fetch(fName)
      .then(function (result) {
        return result.text();
      })
      .then(function (html) {
        const f = document.createRange().createContextualFragment(html);
        if (scope._tco) {
          scope._tco.appendChild(f);
        }
      });
    return ret;
  } // loadFile()

  // extend the element by the registered behavior mixin.
  // The "u-is" attribute specifies what mixin should be used.
  attach(elem: HTMLElement): void {
    if (this._state === MicroState.LOADED) {
      const cn = elem.getAttribute('u-is');
      if (cn) {
        const bc = this._registry[cn];
        if (bc) {
          this.loadBehavior(elem, bc);
        }
      }
    } else {
      this._unloadedList.push(elem);
    }
  } // attach()

  /**
   * replace placeholders like ${name} with the corresponding value in text nodes and attributes.
   * @param {Node} obj
   * @param {Object} props
   */
  _setPlaceholders(obj: Node, props: any) {
    function fill(val: string): string {
      // for (const p in props) { val = val.replace(new RegExp('\\$\\{' + p + '\\}', 'g'), props[p]); }
      Object.getOwnPropertyNames(props).forEach(p => val = val.replace(new RegExp('\\$\\{' + p + '\\}', 'g'), props[p]));
      return val;
    } // fill

    if (props) {
      if (obj.nodeType === Node.TEXT_NODE) {
        if (obj.textContent) {
          obj.textContent = fill(obj.textContent);
        }

      } else if (obj.nodeType === Node.ELEMENT_NODE) {
        const attr = (obj as HTMLElement).attributes;

        if (obj.namespaceURI === 'http://www.w3.org/2000/svg') {
          // SVGElement
          for (let i = 0; i < attr.length; i++) {
            const v: string = attr[i].value;
            if (v.indexOf('${') >= 0) {
              (<any>obj)[attr[i].name].baseVal = fill(v);
            } // if
          } // for

        } else {
          // HTMLElement
          for (let i = 0; i < attr.length; i++) {
            const v: string = attr[i].value;
            if (v.indexOf('${') >= 0) {
              (obj as HTMLElement).setAttribute(attr[i].name, fill(v));
            } // if
          } // for
        }
        obj.childNodes.forEach(c => {
          this._setPlaceholders(c, props);
        });
      }
    }
  } // _setPlaceholders


  // verify that element is not hidden by styles and scrolled into the visible area.
  isVisible(el: HTMLElement) {
    let vis = false;
    if (el.offsetWidth > 0 && el.offsetHeight > 0) {
      const rect = el.getBoundingClientRect();
      // Partially visible elements are treated as visible
      vis = (rect.top <= window.innerHeight && rect.bottom >= 0);

    }
    return (vis);
  } // isVisible()


  // load the image when image is visible
  loadDataImage(imgElem: HTMLElement) {
    if ((imgElem.dataset.src) && (this.isVisible(imgElem))) {
      (imgElem as HTMLImageElement).src = imgElem.dataset.src;
    }
  }


  /**
   * Insert a new control based on a template into the root object and activate behavior.
   * @param {HTMLObjectElement} root parent object for the new control
   * @param {string} controlName
   * @param {Object} props
   */
  insertTemplate(root: HTMLElement, controlName: string, props: Object): HTMLElement | null {
    let e = null;
    if (root && controlName && this._tco) {
      const te = this._tco.querySelector('[u-control="' + controlName.toLowerCase() + '"]');
      if (te) { e = te.cloneNode(true) as HTMLElement; }
      if (e) {
        (<any>e).params = props; // dialog parameters
        this._setPlaceholders(e, props);
        root.appendChild(e);
        root.querySelectorAll('[u-is]').forEach(el => micro.attach(el as HTMLElement));
        this._setPlaceholders(e, props); // again in case of includes
        root.querySelectorAll('[data-src]:not([src])').forEach(el => this.loadDataImage(el as HTMLElement));
      } // if
    } // if
    return e;
  } // insertTemplate()

  // attach events, methods and default-values to a html object (using the english spelling)
  loadBehavior(obj: HTMLElement, behavior: MicroControlClass) {
    const b = behavior as any;
    const oc: MicroControlClass = obj as MicroControlClass;

    if (!obj) {
      console.error('loadBehavior: obj argument is missing.');
    } else if (!behavior) {
      console.error('loadBehavior: behavior argument is missing.');
    } else if (oc._attachedBehavior === behavior) {
      // already done.
    } else {

      if (obj.attributes) {
        // IE9 compatible
        // copy all new attributes to properties
        for (let n = 0; n < obj.attributes.length; n++) {
          const a: Attr = obj.attributes[n];
          if (!(obj as any)[a.name]) { (obj as any)[a.name] = a.value; }
        }
      } // if

      for (const p in b) {
        if (p === 'on_touchstart') {
          obj.addEventListener(p.substr(3), b[p].bind(obj), { passive: true });
        } else if (p.substr(0, 3) === 'on_') {
          obj.addEventListener(p.substr(3), b[p].bind(obj), false);
        } else if (p.substr(0, 2) === 'on') {
          obj.addEventListener(p.substr(2), b[p].bind(obj), false);
        } else if (b[p] == null || b[p].constructor !== Function) {
          // set default-value
          if (!(obj as any)[p]) { (obj as any)[p] = b[p]; }
        } else {
          // attach method
          (obj as any)[p] = b[p];
        } // if
      } // for

      oc._attachedBehavior = behavior;
      if (obj.parentElement !== this._tco) {
        // call connectedCallback only if not a template
        oc.connectedCallback();
        this.List.push(obj);
      }
    } // if
  } // loadBehavior

  // define a micro control mixin in the registry.
  define(name: string, mixin: GenericWidgetClass) {
    this._registry[name] = mixin;
  }


  onunload(_evt: Event) {
    this.List.forEach(obj => {
      if (obj && (<any>obj).term) { (<any>obj).term(); }
      for (let a = 0; a < obj.attributes.length; a++) { (<any>obj)[obj.attributes[a].name] = null; }
    });
    for (let n = 0; n < this.List.length; n++) {
      delete this.List[n]; // free up any memory
    }
    this.List = [];
  } // onunload

  /// Initialize the template and behaviors.
  protected init() {
    this._state = MicroState.INIT;

    // be sure to have a template container object.
    this._tco = document.getElementById('u-templates');

    if (!this._tco) {
      this._tco = createHTMLElement(document.body, 'div', { id: 'u-templates' });
    }
    if (document.readyState === 'complete') {
      this.init2();
    } else {
      document.addEventListener('readystatechange', this.init2);
    }
  } // init()

  // defer init of controls after all is loaded
  protected init2() {
    if (document.readyState === 'complete') {
      this._state = MicroState.LOADED;

      this._unloadedList.forEach(el => {
        const cn = el.getAttribute('u-is');
        if (cn) {
          const bc = this._registry[cn];
          if (bc) {
            this.loadBehavior(el, bc);
          }
          this.List.push(el);
        }
      });
      this._unloadedList = [];
    }
  } // init2()
} // MicroRegistry class

const micro = new MicroRegistry();


// detect that a new micro control was created using Mutation Observe Callback
let obs = new MutationObserver(function (mutationsList: MutationRecord[], _observer) {
  for (const mutation of mutationsList) {
    mutation.addedNodes.forEach(n => {
      const e = <Element>n;
      if (e.getAttribute && e.getAttribute('u-is')) {
        micro.attach(<HTMLElement>n);
      }
    });
  }
});
obs.observe(document, { childList: true, subtree: true });

document.addEventListener('DOMContentLoaded', function () {
  function f() { document.querySelectorAll('[data-src]:not([src])').forEach(e => micro.loadDataImage(e as HTMLElement)); }
  window.addEventListener('scroll', f);
  window.setTimeout(f, 40);
});

// End.
