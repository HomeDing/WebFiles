// file: micro.ts
// micro implementation for web controls using html templates and behaviors.

//  <reference path="JsonParse.ts" />

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

  /// Initialize the template and behaviors.
  protected init() {
    this._state = MicroState.INIT;

    // be sure to have a template container object.
    this._tco = document.getElementById('u-templates');

    if (!this._tco) {
      var t = document.createElement('div');
      t.id = 'u-templates';
      this._tco = document.body.appendChild(t);
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
        var cn = el.getAttribute('u-is');
        if (cn) {
          var bc = this._registry[cn];
          if (bc) {
            this.loadBehavior(el, bc);
          }
          this.List.push(el);
        }
      });
      this._unloadedList = [];
    }
  } // init2()

  /**
   * @param {string} fName
   */
  loadFile(fName: string): Promise<void> {
    var scope = this;
    var ret = fetch(fName)
      .then(function (result) {
        return result.text();
      })
      .then(function (html) {
        var f = document.createRange().createContextualFragment(html);
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
      var cn = elem.getAttribute('u-is');
      if (cn) {
        var bc = this._registry[cn];
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
    function fill(val: string, props: any): string {
      for (let p in props) val = val.replace(new RegExp('\\$\\{' + p + '\\}', 'g'), props[p]);
      return val;
    } // fill

    if (obj.nodeType === Node.TEXT_NODE) {
      if (obj.textContent) {
        obj.textContent = fill(obj.textContent, props);
      }
    } else if (obj.nodeType == Node.ELEMENT_NODE) {
      // HTMLElement
      const attr = (obj as HTMLElement).attributes;
      for (var i = 0; i < attr.length; i++) {
        var v: string = attr[i].value;
        if (v.indexOf('${') >= 0) {
          (obj as any)[attr[i].name] = attr[i].value = fill(v, props);
        } // if
      } // for

      obj.childNodes.forEach(c => {
        this._setPlaceholders(c, props);
      });
    }
  } // _setPlaceholders


  // verify that element is not hidden by styles and scrolled into the visible area.
  isVisible(el: HTMLElement) {
    let vis = false;
    if (el.offsetWidth > 0 && el.offsetHeight > 0) {
      var rect = el.getBoundingClientRect();
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
    var e = null;
    if (root && controlName && this._tco) {
      var te = this._tco.querySelector('[u-control="' + controlName.toLowerCase() + '"]');
      if (te) e = te.cloneNode(true) as HTMLElement;
      if (e) {
        (<any>e).params = props; // dialog parameters
        this._setPlaceholders(e, props);
        root.appendChild(e);
        root.querySelectorAll('[data-src]:not([src])').forEach(e => this.loadDataImage(e as HTMLElement));
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
        for (var n = 0; n < obj.attributes.length; n++) {
          var a: Attr = obj.attributes[n];
          if (!(obj as any)[a.name]) (obj as any)[a.name] = a.value;
        }
      } // if

      for (var p in b) {
        if (p.substr(0, 3) == 'on_') {
          obj.addEventListener(p.substr(3), b[p].bind(obj), false);
        } else if (p.substr(0, 2) == 'on') {
          obj.addEventListener(p.substr(2), b[p].bind(obj), false);
        } else if (b[p] == null || b[p].constructor != Function) {
          // set default-value
          if (!(obj as any)[p]) (obj as any)[p] = b[p];
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
    for (var n in this.List) {
      var obj = this.List[n];
      if (obj && (<any>obj).term) (<any>obj).term();
      for (var a = 0; a < obj.attributes.length; a++) (<any>obj)[obj.attributes[a].name] = null;
    } // for
    for (var n in this.List) {
      delete this.List[n]; 
    }
    this.List = [];
  } // onunload
} // MicroRegistry class

const micro = new MicroRegistry();


// detect that a new micro control was created using Mutation Observe Callback
let obs = new MutationObserver(function (mutationsList: MutationRecord[], _observer) {
  for (let mutation of mutationsList) {
    mutation.addedNodes.forEach(n => {
      if ((<Element>n).getAttribute && (<Element>n).getAttribute('u-is')) micro.attach(<HTMLElement>n);
    });
  }
});
obs.observe(document, { childList: true, subtree: true });

document.addEventListener("DOMContentLoaded", function () {
  window.addEventListener('scroll', function () {
    document.querySelectorAll('[data-src]:not([src])').forEach(e => micro.loadDataImage(e as HTMLElement));
  });
});

// End.
