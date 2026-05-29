var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/JsonParse.ts
function jsonParse(obj, cbFunc) {
  function _jsonParse(path, key, value) {
    let path2 = key ? path + "/" + key : path;
    path2 = path2.replace("/[", "[");
    if (Array.isArray(value)) {
      for (let n = 0; n < value.length; n++) {
        _jsonParse(path2, "[" + n + "]", value[n]);
      }
    } else if (typeof value === "object") {
      cbFunc(path2, "", "");
      Object.getOwnPropertyNames(value).forEach((k) => _jsonParse(path2, k, value[k]));
    } else {
      cbFunc(path, key, String(value));
    }
  }
  _jsonParse("", "", obj);
}

// src/microHub.ts
var MicroHub = class {
  _registrations = {};
  _registrationsId = 0;
  _store = {};
  read(path) {
    const o = this._findStoreObject(this.pPath(path));
    return o[this.pKey(path)];
  }
  write(path, value) {
    const o = this._findStoreObject(this.pPath(path));
    o[this.pKey(path)] = value;
  }
  /**
   * Subscribe to changes in the store using a path expression
   * @param {string} matchPath expression for the registration
   * @param {JsonParseCallback} fCallback
   * @param {boolean} replay
   * @returns {number} number of registration
   */
  subscribe(matchPath, fCallback, replay = false) {
    const h = this._registrationsId;
    const rn = matchPath.toLocaleLowerCase();
    const re = "^" + rn.replace(/(\[|\]|\/|\?)/g, "\\$1").replace(/\*\*/g, "\\S{0,}").replace(/\*/g, "[^/?]*") + "$";
    const newEntry = {
      id: h,
      match: RegExp(re),
      callback: fCallback
    };
    this._registrations[h] = newEntry;
    this._registrationsId++;
    if (replay) {
      jsonParse(
        this._store,
        function(path, key, value) {
          let fullPath = path + (key ? "?" + key : "");
          if (fullPath) {
            fullPath = fullPath.toLocaleLowerCase();
            if (fullPath.match(newEntry.match)) {
              newEntry.callback(path, (key || "").toLowerCase(), value || "");
            }
          }
        }.bind(this)
      );
    }
    return h;
  }
  // subscribe
  /**
   * Cancel a subscription.
   * @param h subscription registration id.
   */
  unsubscribe(h) {
    delete this._registrations[h];
  }
  // unsubscribe
  /**
   * Replay the store data for a specific registration.
   * @param h subscription registration id.
   */
  replay(h) {
    const e = this._registrations[h];
    if (e) {
      jsonParse(
        this._store,
        function(path, key, value) {
          let fullPath = path + (key ? "?" + key : "");
          if (fullPath) {
            fullPath = fullPath.toLocaleLowerCase();
            if (fullPath.match(e.match)) {
              e.callback(path, (key || "").toLowerCase(), value || "");
            }
          }
        }.bind(this)
      );
    }
  }
  // replay
  /**
   * Publish new structured data from an object.
   * @param obj
   */
  publishObj(obj) {
    jsonParse(
      obj,
      function(path, key, value) {
        this.publishValue(path, key ? key.toLowerCase() : "", value ? value : "");
      }.bind(this)
    );
  }
  // publishObj()
  /**
   * Publish a single value using.
   * @param path Path of the value
   * @param key Key of the property
   * @param value Value of the property.
   */
  publishValue(path, key, value) {
    let fullPath = path + (key ? "?" + key : "");
    if (fullPath) {
      if (key) {
        const p = this._findStoreObject(path);
        p[key] = value;
      }
      fullPath = fullPath.toLocaleLowerCase();
      Object.values(this._registrations).forEach((r) => {
        if (fullPath.match(r.match)) {
          r.callback(path, key, value);
        }
      });
    }
  }
  // publish
  onunload() {
    Object.getOwnPropertyNames(this._registrations).forEach((n) => delete this._registrations[n]);
  }
  // onunload
  _findStoreObject(path) {
    let p = this._store;
    if (path[0] === "/") {
      path = path.substring(1);
    }
    const steps = path.split("/");
    while (steps.length > 0 && p[steps[0]]) {
      p = p[steps[0]];
      steps.shift();
    }
    while (steps.length > 0 && steps[0]) {
      p = p[steps[0]] = {};
      steps.shift();
    }
    return p;
  }
  // _findStoreObject
  // return path to parent object
  pPath(path) {
    if (path[0] === "/") {
      path = path.substring(1);
    }
    const steps = path.split("/");
    const res = steps.slice(0, steps.length - 1).join("/");
    return res;
  }
  // pPath
  // return key in parent object
  pKey(path) {
    const steps = path.split("/");
    const res = steps[steps.length - 1];
    return res;
  }
};
var hub = new MicroHub();
window.addEventListener("unload", hub.onunload.bind(hub), false);

// src/utils.ts
function toBool(s) {
  if (!s) {
    return false;
  }
  switch (s.toLowerCase().trim()) {
    case "true":
    case "yes":
      return true;
    case "false":
    case "no":
    case "0":
    case null:
      return false;
    default:
      return Boolean(s);
  }
}
function toSeconds(v) {
  let ret;
  v = v.toLowerCase();
  if (v.endsWith("h")) {
    ret = parseInt(v, 10) * 60 * 60;
  } else if (v.endsWith("m")) {
    ret = parseInt(v, 10) * 60;
  } else if (v.endsWith("s")) {
    ret = parseInt(v, 10);
  } else if (v.includes(":")) {
    ret = (Date.parse("1.1.1970 " + v) - Date.parse("1.1.1970")) / 1e3;
  } else {
    ret = Number(v);
  }
  return ret;
}
function setAttr(el, name, value) {
  if (el && el.getAttribute(name) !== value) {
    el.setAttribute(name, value);
  }
}
function debounce(func, wait = 20) {
  let timer;
  return function() {
    if (timer) {
      clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      timer = 0;
      func();
    }, wait);
  };
}
function getHashParams(defaults) {
  const params = { ...defaults };
  window.location.hash.substring(1).split("&").forEach(function(p) {
    const pa = p.split("=");
    params[pa[0]] = pa[1];
  });
  return params;
}
function createHTMLElement(parentNode, tag, attr, beforeNode = null) {
  const o = document.createElement(tag);
  if (attr) {
    for (const a in attr) {
      o.setAttribute(a, attr[a]);
    }
  }
  if (parentNode) {
    if (beforeNode) {
      parentNode.insertBefore(o, beforeNode);
    } else {
      parentNode.appendChild(o);
    }
  }
  return o;
}
async function fetchJSON(url, options) {
  const p = fetch(url, options).then((raw) => raw.json());
  return p;
}
async function fetchText(url, options) {
  const p = fetch(url, options).then((raw) => raw.text());
  return p;
}

// src/microRegistry.ts
var MicroRegistry = class {
  /** Templates Container Object */
  _tco = null;
  _registry = {};
  // all registered mixins by name.
  _state = 1 /* PREP */;
  /// A list with all objects that are attached to any behavior
  _unloadedList = [];
  List = [];
  constructor() {
    this._state = 2 /* INIT */;
    window.addEventListener("DOMContentLoaded", this.init.bind(this));
  }
  /**
   * Load html templates into container.
   * @param {string} url file with templates
   */
  loadFile(url) {
    const ret = fetch(url).then((raw) => raw.text()).then((htm) => {
      const f = document.createRange().createContextualFragment(htm);
      if (!this._tco) {
        this._tco = document.getElementById("u-templates");
      }
      if (!this._tco) {
        this._tco = createHTMLElement(document.body, "div", { id: "u-templates" });
      }
      if (this._tco) {
        this._tco.appendChild(f);
      }
    });
    return ret;
  }
  // loadFile()
  // extend the element by the registered behavior mixin.
  // The "u-is" attribute specifies what mixin should be used.
  attach(elem) {
    if (this._state === 3 /* LOADED */) {
      const cn = elem.getAttribute("u-is");
      if (cn) {
        const bc = this._registry[cn];
        if (bc) {
          this.loadBehavior(elem, bc);
        }
      }
    } else {
      this._unloadedList.push(elem);
    }
  }
  // attach()
  /**
   * replace placeholders like ${name} with the corresponding value in text nodes and attributes.
   * @param {Node} obj
   * @param {Object} props
   */
  _setPlaceholders(obj, props) {
    function fill(val) {
      Object.getOwnPropertyNames(props).forEach((p) => val = val.replace(new RegExp("\\$\\{" + p + "\\}", "g"), props[p]));
      return val;
    }
    if (props) {
      if (obj.nodeType === Node.TEXT_NODE) {
        if (obj.textContent) {
          obj.textContent = fill(obj.textContent);
        }
      } else if (obj.nodeType === Node.ELEMENT_NODE) {
        const attr = obj.attributes;
        for (let i = 0; i < attr.length; i++) {
          const v = attr[i].value;
          if (v.indexOf("${") >= 0) {
            if (!obj[attr[i].name]) {
              obj.setAttribute(attr[i].name, fill(v));
            } else if (obj[attr[i].name].baseVal !== void 0) {
              obj[attr[i].name].baseVal = fill(v);
            } else {
              obj.setAttribute(attr[i].name, fill(v));
            }
          }
        }
        obj.childNodes.forEach((c) => {
          this._setPlaceholders(c, props);
        });
      }
    }
  }
  // _setPlaceholders
  // verify that element is not hidden by styles and scrolled into the visible area.
  isVisible(el) {
    let vis = false;
    if (el.offsetWidth > 0 && el.offsetHeight > 0) {
      const rect = el.getBoundingClientRect();
      vis = rect.top <= window.innerHeight && rect.bottom >= 0;
    }
    return vis;
  }
  // isVisible()
  // load the image when image is visible
  loadDataImage(imgElem) {
    if (imgElem.dataset["src"] && this.isVisible(imgElem)) {
      imgElem.src = imgElem.dataset["src"];
    }
  }
  /**
   * Insert a new control based on a template into the root object and activate behavior.
   * @param {HTMLObjectElement} root parent object for the new control
   * @param {string} controlName
   * @param {Object} props
   */
  insertTemplate(root, controlName, props) {
    let e = null;
    if (root && controlName && this._tco) {
      const te = this._tco.querySelector('[u-control="' + controlName.toLowerCase() + '"]');
      if (te) {
        e = te.cloneNode(true);
      }
      if (e) {
        e.params = props;
        this._setPlaceholders(e, props);
        root.appendChild(e);
        root.querySelectorAll("[u-is]").forEach((el) => micro.attach(el));
        this._setPlaceholders(e, props);
        root.querySelectorAll("[data-src]:not([src])").forEach((el) => this.loadDataImage(el));
      }
    }
    return e;
  }
  // insertTemplate()
  getMethods(obj) {
    const fSet = /* @__PURE__ */ new Set();
    do {
      Object.getOwnPropertyNames(obj).filter((item) => typeof obj[item] === "function").forEach((item) => fSet.add(item));
    } while (obj = Object.getPrototypeOf(obj));
    return fSet;
  }
  // getMethods
  // attach events, methods and default-values to a html object (using the english spelling)
  loadBehavior(obj, behavior) {
    const b = behavior;
    const oc = obj;
    if (!obj) {
      console.error("loadBehavior: obj argument is missing.");
    } else if (!behavior) {
      console.error("loadBehavior: behavior argument is missing.");
    } else if (oc._attachedBehavior === behavior) {
    } else {
      for (const a of obj.attributes) {
        if (!obj[a.name]) {
          obj[a.name] = a.value;
        }
      }
      for (const p of this.getMethods(b)) {
        if (p === "on_touchstart") {
          obj.addEventListener(p.substring(3), b[p].bind(obj), { passive: true });
        } else if (p.substring(0, 3) === "on_") {
          obj.addEventListener(p.substring(3), b[p].bind(obj), false);
        } else if (p.substring(0, 2) === "on") {
          obj.addEventListener(p.substring(2), b[p].bind(obj), false);
        } else if (b[p] == null || b[p].constructor !== Function) {
          if (!obj[p]) {
            obj[p] = b[p];
          }
        } else {
          obj[p] = b[p];
        }
      }
      oc._attachedBehavior = behavior;
      if (obj.parentElement !== this._tco) {
        oc.connectedCallback();
        this.List.push(obj);
      }
    }
  }
  // loadBehavior
  // define a micro control mixin in the registry.
  define(name, mixin) {
    this._registry[name] = mixin;
  }
  // defer initialization of controls after DOM is loaded
  init() {
    this._state = 3 /* LOADED */;
    if (!this._tco) {
      this._tco = document.getElementById("u-templates");
    }
    document.querySelectorAll("[u-is]").forEach((el) => micro.attach(el));
    this._unloadedList.forEach((el) => {
      const cn = el.getAttribute("u-is");
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
  // init()
};
var micro = new MicroRegistry();
function MicroControl(isSelector) {
  return function(target) {
    micro.define(isSelector, new target());
    return target;
  };
}

// src/microControls.ts
var MicroControlClass = class {
  _attachedBehavior = void 0;
  connectedCallback() {
  }
  /// <summary>remove all textnodes from the control to avoid unwanted spaces.</summary>
  _clearWhitespace() {
    let obj = this.firstChild;
    while (obj) {
      const nextObj = obj.nextSibling;
      if (obj.nodeType === 3) {
        obj.parentNode?.removeChild(obj);
      }
      obj = nextObj;
    }
  }
  // _clearWhitespace
};

// src/GenericWidget.ts
var GenericWidgetIDCounter = 102;
var GenericWidgetClass = class extends MicroControlClass {
  microid;
  data;
  actions;
  subId;
  uid(obj) {
    if (!obj.id) {
      obj.id = "o" + GenericWidgetIDCounter++;
    }
    return obj.id;
  }
  connectedCallback() {
    super.connectedCallback();
    this.querySelectorAll("label:not([for])+input").forEach((iObj) => {
      const lObj = iObj.previousElementSibling;
      lObj.htmlFor = this.uid(iObj);
    });
    this.querySelectorAll("label:not([for])+div input").forEach((iObj) => {
      const lObj = iObj.parentElement?.previousElementSibling;
      lObj.htmlFor = this.uid(iObj);
    });
    if (!this.microid) {
      this.microid = "";
    }
    this.data = { id: this.microid };
    this.actions = [];
    this.subId = hub.subscribe(this.microid + "?*", this.newData.bind(this));
    hub.replay(this.subId);
  }
  // connectedCallback
  // visualize any new data for the widget.
  newData(_path, key, value) {
    this.data[key] = value;
    const ic = this.querySelector("h1,h3,img");
    if (ic) {
      setAttr(
        ic,
        "title",
        JSON.stringify(this.data, null, 1).replace("{\n", "").replace("\n}", "")
      );
    }
    if (key === "active") {
      this.classList.toggle("active", toBool(value));
    }
    ["span", "div"].forEach((elType) => {
      this.querySelectorAll(`${elType}[u-active='${key}']`).forEach(function(elem) {
        const b = toBool(value);
        setAttr(elem, "value", b ? "1" : "0");
        setAttr(elem, "title", b ? "active" : "not active");
        elem.classList.toggle("active", b);
      });
    });
    this.querySelectorAll(`*[u-display='${key}']`).forEach((elem) => {
      elem.style.display = value ? "" : "none";
    });
    this.querySelectorAll(`*[u-text='${key}']`).forEach((elem) => {
      if (elem.textContent !== value) {
        elem.textContent = value;
      }
    });
    ["input", "output", "select"].forEach((elType) => {
      this.querySelectorAll(`${elType}[u-value='${key}']`).forEach((elem) => {
        if (elem.type === "radio") {
          elem.checked = elem.value === value;
        } else if (elem.value !== value) {
          elem.value = value ? value : "";
        }
      });
    });
    this.querySelectorAll(`span[u-color='${key}']`).forEach(function(elem) {
      let col = value ? value.replace(/^x/, "#") : "#888";
      col = col.replace(/^#\S{2}(\S{6})$/, "#$1");
      elem.style.backgroundColor = col;
    });
  }
  // newData()
  dispatchNext() {
    if (this.actions) {
      const a = this.actions.shift();
      if (a) {
        const aa = a.split("=");
        const aUrl = aa[0] + "=" + encodeURIComponent(aa[1]);
        fetch(aUrl).then(() => {
          if (this.actions.length > 0) {
            debounce(this.dispatchNext.bind(this))();
          } else if ("updateState" in window) {
            try {
              window.updateState();
            } catch {
            }
          }
        });
      }
    }
  }
  // dispatchNext()
  // send an action to the board and dispatch to the element
  dispatchAction(prop, val) {
    let action = void 0;
    if (prop && val) {
      if (prop.includes("/")) {
        prop = prop.replace("${v}", encodeURI(val));
        prop.split(",").forEach((a) => {
          if (!a.startsWith("/")) {
            a = "/" + a;
          }
          action = "/api/state" + a;
        });
      } else {
        action = `/api/state${this.microid}?${prop}=${encodeURI(val)}`;
      }
      if (action) {
        if (this.actions.length == 0 || action !== this.actions[this.actions.length - 1]) {
          this.actions.push(action);
        }
        ;
      }
      debounce(this.dispatchNext.bind(this))();
    }
  }
  // dispatchAction()
  showSys() {
    const p = getHashParams({ sys: false }).sys;
    return toBool(p);
  }
  // send changed value of property as an action to the board
  on_change(e) {
    const src = e.target;
    const units = src.getAttribute("u-units");
    this.dispatchAction(src.getAttribute("u-value"), src.value + (units ? units : ""));
  }
  // send an action to the board
  // + change config mode
  on_click(event) {
    const chain = [];
    let n = event.target;
    while (n) {
      chain.push(n);
      if (n === this) {
        break;
      }
      n = n.parentElement;
    }
    chain.every((p) => {
      let ret = false;
      if (p.getAttribute("u-action")) {
        this.dispatchAction(p.getAttribute("u-action"), p.getAttribute("value") || "1");
      } else if (p.classList.contains("setconfig")) {
        const dlg = document.querySelector("#configElement");
        const ti = this.microid.split("/");
        dlg.showModal({ ...this.data, type: ti[1], id: ti[2] });
      } else if (p.classList.contains("setactive")) {
        this.dispatchAction(toBool(this.data.active) ? "stop" : "start", "1");
      } else if (p.classList.contains("fullscreen")) {
        this.requestFullscreen();
      } else {
        ret = true;
      }
      return ret;
    });
  }
};
GenericWidgetClass = __decorateClass([
  MicroControl("generic")
], GenericWidgetClass);

// src/BL0937Widget.ts
var BL0937WidgetClass = class extends GenericWidgetClass {
  connectedCallback() {
    super.connectedCallback();
    this.data = { id: this.microid };
    hub.replay(this.subId);
  }
  // connectedCallback
  // visualize any new data for the widget.
  newData(path, key, value) {
    super.newData(path, key, value);
    if (key === "mode") {
      ["current", "voltage"].forEach((m) => {
        const td = this.querySelector(`[u-text="${m}"]`);
        td.parentElement.style.display = m === value ? "" : "none";
      });
    }
  }
};
BL0937WidgetClass = __decorateClass([
  MicroControl("bl0937")
], BL0937WidgetClass);

// src/ButtonWidget.ts
var ButtonWidgetClass = class extends GenericWidgetClass {
  _timer;
  _start;
  _duration;
  _objButton;
  connectedCallback() {
    super.connectedCallback();
    const panelObj = document.querySelector("#panl");
    let btnPanel = panelObj?.querySelector(".btnPanel");
    if (!btnPanel) {
      btnPanel = createHTMLElement(panelObj, "div", { class: "card btnPanel" }, panelObj.firstElementChild);
    }
    if (btnPanel) {
      btnPanel.appendChild(this);
    }
    this._objButton = this.querySelector("button");
  }
  on_click(evt) {
    super.on_click(evt);
    if (evt.target === this._objButton) {
      if (this._duration > 800) {
        this.dispatchAction("action=press", "1");
      } else {
        if (this._timer) {
          window.clearTimeout(this._timer);
        }
        this._timer = window.setTimeout(() => {
          this.dispatchAction("action=click", "1");
        }, 250);
      }
    }
  }
  // on_click
  on_dblclick(evt) {
    if (evt.target === this._objButton) {
      if (this._timer) {
        window.clearTimeout(this._timer);
      }
      this.dispatchAction("action=doubleclick", "1");
    }
  }
  // on_dblclick
  on_pointerdown(evt) {
    if (evt.target === this._objButton) {
      this._start = (/* @__PURE__ */ new Date()).valueOf();
    }
  }
  // on_pointerdown
  on_pointerup(evt) {
    if (evt.target === this._objButton) {
      this._duration = (/* @__PURE__ */ new Date()).valueOf() - this._start;
    }
  }
  // on_pointerup()
};
ButtonWidgetClass = __decorateClass([
  MicroControl("button")
], ButtonWidgetClass);

// src/ColorWidget.ts
var ColorWidgetClass = class extends GenericWidgetClass {
  _value;
  // actual value
  _color;
  // actual color value from the color input
  _white;
  // actual white value from the slider
  _brightness;
  // actual brightness value from the slider
  _duration;
  // actual duration of the effect in msec.
  connectedCallback() {
    super.connectedCallback();
    this._value = "00000000";
    this._color = "x000000";
    this._white = void 0;
  }
  // connectedCallback
  // visualize any new data for the widget.
  newData(_path, key, value) {
    super.newData(_path, key, value);
    if (key === "value") {
      const newValue = this.normColor(value);
      if (newValue.match(/[0-9a-z]{8}/)) {
        this._color = "#" + newValue.substring(2);
      } else {
        this._color = newValue;
      }
      this._white = parseInt(newValue.substring(0, 2), 16);
      if (newValue !== this._value) {
        this._value = newValue;
        this.querySelectorAll("*[name=value]").forEach((e) => {
          e.value = value;
        });
        this.querySelectorAll("*[name=color]").forEach((e) => {
          e.value = this._color;
        });
        this.querySelectorAll("*[name=white]").forEach((e) => {
          e.value = String(this._white);
        });
      }
    } else if (key === "brightness") {
      this._brightness = parseInt(value, 10);
      this.querySelectorAll("*[name=brightness]").forEach((e) => {
        e.value = String(this._brightness);
      });
    } else if (key === "duration") {
      this._duration = parseInt(value, 10);
      this.querySelectorAll("*[name=duration]").forEach((e) => {
        e.value = String(this._duration);
      });
    } else if (key === "config") {
      if (value.toLowerCase() === "wrgb") {
        let o = this.querySelector("input[name=white]");
        if (o) o = o.parentElement;
        if (o && o.previousElementSibling) {
          o.style.display = "";
          o.previousElementSibling.style.display = "";
        }
      }
    }
  }
  // calculate the new color value from input sliders
  on_input(evt) {
    const n = evt.target.name;
    const val = evt.target.value;
    if (n === "brightness") {
      this._brightness = parseInt(val, 10);
      this.dispatchAction(n, val);
    } else if (n === "white") {
      this._white = parseInt(val, 10);
      const v = "x" + this.x16(this._white) + this._color.substring(1);
      this.dispatchAction("value", v);
    } else if (n === "color") {
      this._color = val;
      let v = this._color.substring(1);
      if (this._white) {
        v = this.x16(this._white) + v;
      }
      this.dispatchAction("value", "x" + v);
    } else if (n === "duration") {
      this._duration = parseInt(val, 10);
      this.dispatchAction(n, val + "ms");
    }
  }
  // on_input
  // convert from various value formats to 'wwrrggbb'
  normColor(color) {
    const colNames = {
      "black": "000000",
      "red": "ff0000",
      "green": "00ff00",
      "blue": "0000ff",
      "white": "ffffff"
    };
    if (!color || color.length === 0) {
      color = "00000000";
    } else {
      color = color.toLowerCase();
      color = colNames[color] ?? color;
      if (color.substring(0, 1) === "x" || color.substring(0, 1) === "#") {
        color = color.substring(1);
      }
      if (color.length === 6) {
        color = "00" + color;
      }
    }
    return color.toLowerCase();
  }
  // normColor()
  x16(d) {
    let x = d.toString(16);
    if (x.length === 1) {
      x = "0" + x;
    }
    return x;
  }
};
ColorWidgetClass = __decorateClass([
  MicroControl("color")
], ColorWidgetClass);

// src/InputWidget.ts
var InputWidgetClass = class extends GenericWidgetClass {
  _input;
  // Reference to the real input element, maybe "this".
  _type;
  _value;
  connectedCallback() {
    const inObj = this.querySelector("input");
    this._input = this;
    if (this.tagName !== "INPUT" && inObj) {
      this._input = inObj;
    }
    super.connectedCallback();
    let type = this._input.getAttribute("type") || "text";
    if (type === "range" && this._input.classList.contains("switch")) {
      type = "switch";
      this._input.min = "0";
      this._input.max = "1";
    }
    this._type = type;
    this._value = this._input.value;
    this._clearWhitespace();
  }
  // connectedCallback
  _check() {
    let newVal = this._value;
    const t = this._type;
    if (t === "checkbox") {
      newVal = this._input.checked ? "1" : "0";
    } else if (t === "range" || t === "switch") {
      newVal = this._input.value;
    }
    if (newVal !== this._value) {
      this._value = newVal;
      this._input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
  on_change() {
    this._check();
  }
  on_click(e) {
    let src = e.target;
    this._value = this._input.value;
    while (src) {
      if (this._type === "range" || this._type === "switch") {
        const cl = src.classList;
        if (cl.contains("up")) {
          const nv = Number(this._input.value) + Number(this._input.step || 1);
          this._input.value = String(nv);
          break;
        } else if (cl.contains("down")) {
          const nv = Number(this._input.value) - Number(this._input.step || 1);
          this._input.value = String(nv);
          break;
        }
      }
      if (this._type === "switch") {
        if (src === this._input || src === this) {
          this._input.value = String(1 - Number(this._input.value));
          break;
        }
      }
      if (src === this) {
        break;
      } else {
        src = src.parentElement;
      }
    }
    this._input.focus();
    this._check();
  }
  // on_click
};
InputWidgetClass = __decorateClass([
  MicroControl("input")
], InputWidgetClass);

// src/PWMoutWidget.ts
var PWMOutWidgetClass = class extends GenericWidgetClass {
  _range;
  _last;
  connectedCallback() {
    super.connectedCallback();
    hub.subscribe(this.microid + "?*", this.newValue.bind(this));
    this._range = 255;
    this._last = "";
  }
  newValue(_path, key, value) {
    if (!value) {
    } else if (key === "range") {
      this._range = Number(value);
    } else if (key === "value") {
      if (this._last !== value) {
        const o = this.querySelector(".ux-levelbar");
        const h = o.offsetHeight;
        let bh = h * Number(value) / this._range;
        if (bh > h - 1) {
          bh = h - 1;
        }
        if (bh < 1) {
          bh = 1;
        }
        o.style.borderBottomWidth = bh + "px";
        this._last = value;
      }
    }
  }
};
PWMOutWidgetClass = __decorateClass([
  MicroControl("pwmout")
], PWMOutWidgetClass);

// src/ValueWidget.ts
var ValueWidgetClass = class extends GenericWidgetClass {
  _input;
  connectedCallback() {
    super.connectedCallback();
    this._input = this.querySelector("input");
  }
  newData(path, key, value) {
    super.newData(path, key, value);
    if (this._input) {
      if (key === "min") {
        this._input.min = value;
      } else if (key === "max") {
        this._input.max = value;
      } else if (key === "step") {
        this._input.step = value;
      }
    }
  }
};
ValueWidgetClass = __decorateClass([
  MicroControl("value")
], ValueWidgetClass);

// src/SceneWidget.ts
var SceneWidgetClass = class extends GenericWidgetClass {
  _buttonObj;
  connectedCallback() {
    super.connectedCallback();
    if (!SceneWidgetClass._sceneCard) {
      SceneWidgetClass._sceneCard = this;
    } else {
      this.style.display = "none";
    }
    const c = SceneWidgetClass._sceneCard.querySelector("div.block:last-child");
    this._buttonObj = createHTMLElement(c, "button", {
      "microid": this.microid
    });
    this._buttonObj.textContent = "-";
  }
  on_click(evt) {
    const btnObj = evt.target;
    let action = btnObj.getAttribute("microid");
    if (action) {
      if (action.startsWith("/")) action = action.substring(1);
      this.dispatchAction(action + "?start=1", "1");
    }
  }
  startScene() {
    0;
  }
  newData(path, key, value) {
    super.newData(path, key, value);
    if (key === "title") {
      this._buttonObj.textContent = value;
    }
  }
  // newData()
};
__publicField(SceneWidgetClass, "_sceneCard");
SceneWidgetClass = __decorateClass([
  MicroControl("scene")
], SceneWidgetClass);

// src/SelectWidget.ts
var SelectWidgetClass = class extends GenericWidgetClass {
  _objSelect;
  connectedCallback() {
    super.connectedCallback();
    this._objSelect = this.querySelector("select");
    this.subId = hub.subscribe(this.microid + "/options[*]?*", this.newData.bind(this));
    hub.replay(this.subId);
  }
  newData(path, key, value) {
    super.newData(path, key, value);
    const m = path.match(/\/options\[(\d+)\]/);
    if (m) {
      const opts = this._objSelect.options;
      let opt;
      const indx = Number(m[1]);
      if (indx < opts.length) {
        opt = opts[indx];
      } else {
        opt = document.createElement("option");
        opts.add(opt);
      }
      if (key === "key") {
        opt.text = value;
      } else if (key === "value") {
        opt.value = value;
      }
    } else if (key === "key") {
      this._objSelect.value = value;
    }
  }
  // newData()
  on_change(evt) {
    super.on_change(evt);
    this.dispatchAction(this.microid + "?index=${v}", String(this._objSelect.selectedIndex));
  }
  // on_click
};
SelectWidgetClass = __decorateClass([
  MicroControl("select")
], SelectWidgetClass);

// src/TimerWidget.ts
var TimerWidgetClass = class extends GenericWidgetClass {
  wt = 0;
  pt = 0;
  ct = 0;
  time = 0;
  connectedCallback() {
    super.connectedCallback();
    this.wt = 0;
    this.pt = 0;
    this.ct = 0;
    this.time = 0;
  }
  newData(path, key, value) {
    super.newData(path, key, value);
    if (key === "waittime") {
      this.wt = toSeconds(value);
    } else if (key === "pulsetime") {
      this.pt = toSeconds(value);
    } else if (key === "cycletime") {
      this.ct = toSeconds(value);
    } else if (key === "time") {
      this.time = toSeconds(value);
    }
    if (this.ct < this.wt + this.pt) {
      this.ct = this.wt + this.pt;
    }
    if (this.ct > 0) {
      const el = this.querySelector(".u-bar");
      const f = el.clientWidth / this.ct;
      const pto = el.querySelector(".pulse");
      pto.style.left = Math.floor(this.wt * f) + "px";
      pto.style.width = Math.floor(this.pt * f) + "px";
      const cto = el.querySelector(".current");
      cto.style.width = Math.floor(this.time * f) + "px";
    }
  }
  // newData()}
};
TimerWidgetClass = __decorateClass([
  MicroControl("timer")
], TimerWidgetClass);

// src/micro-mini.ts
var obs = new MutationObserver(function(mutationsList, _observer) {
  for (const mutation of mutationsList) {
    mutation.addedNodes.forEach((n) => {
      const e = n;
      if (e.getAttribute && e.getAttribute("u-is")) {
        micro.attach(n);
      }
    });
  }
});
obs.observe(document, { childList: true, subtree: true });
document.addEventListener("DOMContentLoaded", function() {
  function f() {
    document.querySelectorAll("[data-src]:not([src])").forEach((e) => micro.loadDataImage(e));
  }
  window.addEventListener("scroll", f);
  window.setTimeout(f, 40);
});
export {
  createHTMLElement,
  debounce,
  fetchJSON,
  fetchText,
  getHashParams,
  hub,
  jsonParse,
  micro,
  setAttr,
  toBool
};
