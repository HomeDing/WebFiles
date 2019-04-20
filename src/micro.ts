// micro.js
// Collection of functions to help managing complex JSON objects.
// Only works with JSON compatible objects using Arrays, Object, String, Number, Boolean., no functions !

/// <reference path="JsonParse.ts" />

interface HubEntry {
  id: number;
  match: RegExp;
  callback: JsonParseCallback;
}

interface HubEntryList {
  [s: number]: HubEntry;
}

/**
 *
 */
class MicroHub {
  private _registrations: HubEntryList = {};
  private _registrationsId: number = 0;
  private _store: object = {};

  protected _findStoreObject(path: string): any {
    let p: any = this._store;
    if (path[0] === '/') {
      path = path.substr(1);
    }
    let steps = path.split('/');

    // use existing objects.
    while (steps.length > 0 && p[steps[0]]) {
      p = p[steps[0]];
      steps.shift();
    } // while

    // create new objects.
    while (steps.length > 0 && steps[0]) {
      p = p[steps[0]] = {};
      steps.shift();
    } // while
    return p;
  } // _findStoreObject

  // return path to parent object
  private pPath(path: string): string {
    if (path[0] === '/') {
      path = path.substr(1);
    }
    let steps = path.split('/');
    let res = steps.slice(0, steps.length - 1).join('/');
    return res;
  } // pPath

  // return key in parent object
  private pKey(path: string): string {
    let steps = path.split('/');
    let res = steps[steps.length - 1];
    return res;
  }

  read(path: string): any {
    let o: any = this._findStoreObject(this.pPath(path));
    return o[this.pKey(path)];
  }

  write(path: string, value: any) {
    let o: any = this._findStoreObject(this.pPath(path));
    o[this.pKey(path)] = value;
  }

  /**
   * Subscribe to changes in the store using a path expression
   * @param {string} matchPath expression for the registration
   * @param {JsonParseCallback} fCallback
   * @param {boolean} replay
   * @returns {number} number of registration
   */
  subscribe(matchPath: string, fCallback: JsonParseCallback, replay: boolean = false): number {
    var h = this._registrationsId;

    // treating upper/lowercase equal is not clearly defined, but true with domain names.
    var rn = matchPath.toLocaleLowerCase();

    // build a regexp pattern that will match the event names
    let re =
      '^' +
      rn
        .replace(/(\[|\]|\/|\?)/g, '\\$1')
        .replace(/\*\*/g, '\\S{0,}')
        .replace(/\*/g, '[^/?]*') +
      '$';

    var newEntry: HubEntry = {
      id: h,
      match: RegExp(re),
      callback: fCallback
    };
    this._registrations[h] = newEntry;

    this._registrationsId++;

    if (replay) {
      jsonParse(
        this._store,
        function (path: string, key: string | null, value: string | null) {
          let fullPath: string = path + (key ? '?' + key : '');
          if (fullPath) {
            fullPath = fullPath.toLocaleLowerCase();
            if (fullPath.match(newEntry.match)) newEntry.callback(path, key ? key.toLowerCase() : null, value);
          } // if
        }.bind(this)
      );
    }

    return h;
  } // subscribe

  /**
   * Cancel a subscription.
   * @param h subscription registration id.
   */
  unsubscribe(h: number) {
    delete this._registrations[h];
  } // unsubscribe

  /**
   * Replay the store data for a specific registration.
   * @param h subscription registration id.
   */
  replay(h: number) {
    let e: HubEntry = this._registrations[h];

    if (e) {
      jsonParse(
        this._store,
        function (path: string, key: string | null, value: string | null) {
          let fullPath: string = path + (key ? '?' + key : '');
          if (fullPath) {
            fullPath = fullPath.toLocaleLowerCase();
            if (fullPath.match(e.match)) e.callback(path, key ? key.toLowerCase() : null, value);
          } // if
        }.bind(this)
      );
    }
  } // replay

  /**
   * Publish new structured data from an object.
   * @param obj
   */
  publishObj(obj: any) {
    jsonParse(
      obj,
      function (this: MicroHub, path: string, key: string | null, value: string | null) {
        this.publishValue(path, key ? key.toLowerCase() : '', value ? value : '');
      }.bind(this)
    );
  } // publishObj()

  /**
   * Publish a single value using.
   * @param path Path of the value
   * @param key Key of the property
   * @param value Value of the property.
   */
  publishValue(path: string, key: string, value: string) {
    let fullPath: string = path + (key ? '?' + key : '');

    if (fullPath) {
      if (key) {
        // save to store
        let p: any = this._findStoreObject(path);
        p[key] = value;
      } // if

      fullPath = fullPath.toLocaleLowerCase();

      Object.values(this._registrations).forEach(r => {
        if (fullPath.match(r.match)) r.callback(path, key, value);
      });
    } // if
  } // publish

  onunload(_evt: Event) {
    for (var n in this._registrations) {
      delete this._registrations[n];
    }
  } // onunload
} // MicroEvents class

const hub = new MicroHub();
window.addEventListener('unload', hub.onunload.bind(hub), false);

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

  /**
   * Insert a new control based on a template into the root object and activate behavior.
   * @param {HTMLObjectElement} root parent object for the new control
   * @param {string} controlName
   * @param {Object} props
   */
  insertTemplate(root: HTMLElement, controlName: string, props: Object): HTMLElement | null {
    var e = null;
    if (root && controlName && this._tco) {
      var te = this._tco.querySelector('[u-control="' + controlName + '"]');
      if (te) e = te.cloneNode(true) as HTMLElement;
      if (e) {
        this._setPlaceholders(e, props);
        root.appendChild(e);
      } // if
    } // if
    return e;
  } // insertTemplate()

  // attach events, methods and default-values to a html object (using the english spelling)
  loadBehavior(obj: HTMLElement, behavior: GenericWidgetClass) {
    const b = behavior as any;
    const o = obj as any;

    if (!obj) {
      console.error('loadBehavior: obj argument is missing.');
    } else if (!behavior) {
      console.error('loadBehavior: behavior argument is missing.');
    } else if ((<MicroControlClass>o)._attachedBehavior == behavior) {
      // already done.
    } else {

      if (obj.attributes) {
        // IE9 compatible
        // copy all new attributes to properties
        for (var n = 0; n < obj.attributes.length; n++) {
          var a: Attr = obj.attributes[n];
          if (!o[a.name]) o[a.name] = a.value;
        }
      } // if

      for (var p in b) {
        if (p.substr(0, 2) == 'on') {
          obj.addEventListener(p.substr(2), b[p].bind(obj), false);
        } else if (b[p] == null || b[p].constructor != Function) {
          // set default-value
          if (!o[p]) o[p] = b[p];
        } else {
          // attach method
          o[p] = b[p];
        } // if
      } // for

      (<MicroControlClass>o)._attachedBehavior = behavior;
      (<MicroControlClass>o).connectedCallback(obj);
      this.List.push(obj);
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
