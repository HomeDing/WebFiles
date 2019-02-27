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

class MicroHub {
  _registrations: HubEntryList = {};
  _registrationsId: number = 0;
  _store: object = {};

  protected _findStoreObject(path: string): object {
    let p: object = this._store;
    let steps = path.substr(1).split("/");

    // use existing objects.
    while (steps.length > 0 && p[steps[0]]) {
      p = p[steps[0]];
      steps.shift();
    } // while

    // create new objects.
    while (steps.length > 0) {
      p = p[steps[0]] = {};
      steps.shift();
    } // while
    return p;
  } // _findPathObject

  // subscriptions to changes in the Event Data
  /**
   * @param {string} matchPath expression for the registration
   * @param {*} fCallback
   */
  subscribe(matchPath: string, fCallback: JsonParseCallback, replay:boolean = false): number {
    var h = this._registrationsId;

    // treating upper/lowercase equal is not clearly defined, but true with domain names.
    var rn = matchPath.toLocaleLowerCase();

    // build a regexp pattern that will match the event names
    let re =
      "^" +
      rn
        .replace(/(\[|\]|\/|\?)/g, "\\$1")
        .replace(/\*\*/g, "\\S{0,}")
        .replace(/\*/g, "[^/?]*") +
      "$";
    // console.log(matchPath, re);

    var newEntry: HubEntry = {
      id: h,
      match: RegExp(re),
      callback: fCallback
    };
    this._registrations[h] = newEntry;

    this._registrationsId++;

    if (replay) {
      jsonParse(
        this._store, function(path: string, key: string, value: string) {
          let fullPath: string = path + (key ? "?" + key : "");
          if (fullPath) {
            fullPath = fullPath.toLocaleLowerCase();
            if (fullPath.match(newEntry.match)) newEntry.callback(path, key ? key.toLowerCase() : null, value);
          } // if
        }.bind(this)
      );
    }

    return h;
  } // subscribe

  unsubscribe(h: number) {
    this._registrations[h] = null;
  } // unsubscribe

  publishObj(obj: any) {
    jsonParse(
      obj,
      function(path: string, key: string, value: string) {
        this.publishValue(path, key ? key.toLowerCase() : null, value);
      }.bind(this)
    );
  } // publishObj()

  // a new value for the store and all registered listeners
  publishValue(path: string, key: string, value: string) {
    let fullPath: string = path + (key ? "?" + key : "");

    if (fullPath) {
      if (key) {
        // save to store
        let p: object = this._findStoreObject(path);
        p[key] = value;
      } // if

      fullPath = fullPath.toLocaleLowerCase();

      Object.values(this._registrations).forEach(r => {
        if (fullPath.match(r.match)) r.callback(path, key, value);
      });
    } // if
  } // publish

  onunload(evt: Event) {
    for (var n in this._registrations) {
      this._registrations[n].callback = null;
      this._registrations[n] = null;
    }
  } // onunload
} // MicroEvents class

var hub = new MicroHub();
window.addEventListener("unload", hub.onunload.bind(hub), false);

class MicroRegistry {
  protected _tco: HTMLElement; // Templates Container Object
  protected _registry: { [key: string]: any } = {}; // all registered mixins by name.

  /// A list with all objects that are attached to any behavior
  protected List = [];

  /// Initialize the template and behaviors.
  init() {
    // be sure to have a template container object.
    this._tco = document.getElementById("u-templates");

    if (!this._tco) {
      var t = document.createElement("div");
      t.id = "u-templates";
      this._tco = document.body.appendChild(t);
    }
  } // init()

  /**
   * @param {string} fName
   */
  loadFile(fName: string): Promise<void> {
    var scope = this;
    var ret = fetch(fName)
      .then(function(result) {
        return result.text();
      })
      .then(function(html) {
        var f = document.createRange().createContextualFragment(html);
        scope._tco.appendChild(f);
      });
    return ret;
  } // loadFile()

  // extend the element by the registered behavior mixin.
  // The "u-is" attribute specifies what mixin should be used.
  attach(elem: HTMLElement): void {
    var mb = elem.getAttribute("u-is");
    var bc = this._registry[mb];
    if (bc) {
      this.loadBehavior(elem, bc);
    }
  } // attach()

  // attach all behaviors of the element and nested elements
  // attachAll(root: HTMLElement) {
  //   this.attach(root);
  //   root.querySelectorAll("[u-is]").forEach(this.attach.bind(this));
  // } // attachAll()

  /**
   * replace placeholders like ${name} with the corresponding value in text nodes and attributes.
   * @param {Node} obj
   * @param {Object} props
   */
  _setPlaceholders(obj: Node, props: Object) {
    function fill(val: string, props: Object): string {
      for (let p in props)
        val = val.replace(new RegExp("\\$\\{" + p + "\\}", "g"), props[p]);
      return val;
    } // fill

    if (obj.nodeType == 3) {
      // text node
      obj.textContent = fill(obj.textContent, props);
    } else if (obj.nodeType == 1) {
      // HTMLElement
      let el: HTMLElement = <HTMLElement>obj;

      for (var i = 0; i < el.attributes.length; i++) {
        var v: string = el.attributes[i].value;
        if (v.indexOf("${") >= 0) {
          el[el.attributes[i].name] = el.attributes[i].value = fill(v, props);
        } // if
      } // for

      el.childNodes.forEach(c => {
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
  insertTemplate(
    root: HTMLElement,
    controlName: string,
    props: Object
  ): HTMLElement {
    var e = null;
    if (root && controlName) {
      var te = this._tco.querySelector('[u-control="' + controlName + '"]');
      if (te) e = te.cloneNode(true);
      if (e) {
        this._setPlaceholders(e, props);
        root.appendChild(e);
      } // if
    } // if
    return e;
  } // insertTemplate()

  // attach events, methods and default-values to a html object (using the english spelling)
  loadBehavior(obj: HTMLElement, behavior) {
    if (obj == null) {
      console.error("loadBehavior: obj argument is missing.");
    } else if (behavior == null) {
      console.error("loadBehavior: behavior argument is missing.");
    } else if ((<MicroBaseControl>(<any>obj))._attachedBehavior == behavior) {
      // already done.
    } else {
      if (behavior.inheritFrom) {
        micro.loadBehavior(obj, behavior.inheritFrom);
        micro.List.pop();
      }

      if (obj.attributes) {
        // IE9 compatible
        // copy all new attributes to properties
        for (var n = 0; n < obj.attributes.length; n++)
          if (obj[obj.attributes[n].name] == null)
            obj[obj.attributes[n].name] = obj.attributes[n].value;
      } // if

      for (var p in behavior) {
        if (p.substr(0, 2) == "on") {
          obj.addEventListener(p.substr(2), behavior[p].bind(obj), false);
        } else if (behavior[p] == null || behavior[p].constructor != Function) {
          // set default-value
          if (obj[p] == null) obj[p] = behavior[p];
        } else {
          // attach method
          obj[p] = behavior[p];
        } // if
      } // for

      (<MicroBaseControl>(<any>obj))._attachedBehavior = behavior;
      (<MicroBaseControl>(<any>obj)).connectedCallback(obj);
      this.List.push(obj);
    } // if
  } // loadBehavior

  /// Find the parent node of a given object that has any behavior attached.
  FindBehaviorElement(obj) {
    while (obj && obj._attachedBehavior == null) obj = obj.parentNode;
    return obj;
  } // FindBehaviorElement

  // define a micro control mixin in the registry.
  define(name: string, mixin) {
    this._registry[name] = mixin;
  }

  onunload(evt: Event) {
    for (var n in this.List) {
      var obj = this.List[n];
      if (obj && obj.term) obj.term();
      for (var a = 0; a < obj.attributes.length; a++)
        obj[obj.attributes[a].name] = null;
    } // for
    for (var n in this.List) {
      this.List[n] = null;
    }
  } // onunload
} // MicroJCL class

var micro = new MicroRegistry();

window.addEventListener("load", micro.init.bind(micro));
window.addEventListener("unload", micro.onunload.bind(micro));

// detect that a new micro control was created using Mutation Observe Callback
let obs = new MutationObserver(function(
  mutationsList: MutationRecord[],
  observer
) {
  for (let mutation of mutationsList) {
    mutation.addedNodes.forEach(n => {
      if ((<Element>n).getAttribute && (<Element>n).getAttribute("u-is"))
        micro.attach(<HTMLElement>n);
    });
  }
});
obs.observe(document, { childList: true, subtree: true });
