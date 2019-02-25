var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
// micro.js
// Collection of functions to help managing complex JSON objects.
// Only works with JSON compatible objects using Arrays, Object, String, Number, Boolean., no functions !
var MicroHub = (function () {
    function MicroHub() {
        this._registrations = {};
        this._registrationsId = 0;
    }
    // subscriptions to changes in the Event Data
    /**
     * @param {string} matchPath expression for the registration
     * @param {*} fCallback
     */
    MicroHub.prototype.subscribe = function (matchPath, fCallback) {
        var h = this._registrationsId;
        // treating upper/lowercase equal is not clearly defined, but true with domain names.
        var rn = matchPath.toLocaleLowerCase();
        // build a regexp pattern that will match the event names
        var re = "^" +
            rn
                .replace(/(\[|\]|\/|\?)/g, "\\$1")
                .replace(/\*\*/g, "\\S{0,}")
                .replace(/\*/g, "[^/?]*") +
            "$";
        // console.log(matchPath, re);
        var newEntry = {
            id: h,
            match: RegExp(re),
            callback: fCallback
        };
        this._registrations[h] = newEntry;
        this._registrationsId++;
        return h;
    }; // subscribe
    MicroHub.prototype.unsubscribe = function (h) {
        this._registrations[h] = null;
    }; // unsubscribe
    MicroHub.prototype.publishObj = function (obj) {
        jsonParse(obj, function (path, key, value) {
            this.publishValue(path, key ? key.toLowerCase() : null, value);
        }.bind(this));
    }; // publishObj()
    MicroHub.prototype.publishValue = function (path, key, value) {
        var fullPath = path + (key ? "?" + key : "");
        if (fullPath) {
            fullPath = fullPath.toLocaleLowerCase();
            Object.values(this._registrations).forEach(function (r) {
                if (fullPath.match(r.match))
                    r.callback(path, key, value);
            });
        } // if
    }; // publish
    MicroHub.prototype.onunload = function (evt) {
        for (var n in this._registrations) {
            this._registrations[n].callback = null;
            this._registrations[n] = null;
        }
    }; // onunload
    return MicroHub;
}()); // MicroEvents class
var hub = new MicroHub();
window.addEventListener("unload", hub.onunload.bind(hub), false);
var MicroRegistry = (function () {
    function MicroRegistry() {
        this._registry = {}; // all registered mixins by name.
        /// A list with all objects that are attached to any behavior
        this.List = [];
    }
    /// Initialize the template and behaviors.
    MicroRegistry.prototype.init = function () {
        // be sure to have a template container object.
        this._tco = document.getElementById("u-templates");
        if (!this._tco) {
            var t = document.createElement("div");
            t.id = "u-templates";
            this._tco = document.body.appendChild(t);
        }
    }; // init()
    /**
     * @param {string} fName
     */
    MicroRegistry.prototype.loadFile = function (fName) {
        var scope = this;
        var ret = fetch(fName)
            .then(function (result) {
            return result.text();
        })
            .then(function (html) {
            var f = document.createRange().createContextualFragment(html);
            scope._tco.appendChild(f);
        });
        return ret;
    }; // loadFile()
    // extend the element by the registered behavior mixin.
    // The "u-is" attribute specifies what mixin should be used.
    MicroRegistry.prototype.attach = function (elem) {
        var mb = elem.getAttribute("u-is");
        var bc = this._registry[mb];
        if (bc) {
            this.loadBehavior(elem, bc);
        }
    }; // attach()
    // attach all behaviors of the element and nested elements
    MicroRegistry.prototype.attachAll = function (root) {
        this.attach(root);
        root.querySelectorAll("[u-is]").forEach(this.attach.bind(this));
    }; // attachAll()
    /**
     * replace placeholders like ${name} with the corresponding value in text nodes and attributes.
     * @param {Node} obj
     * @param {Object} props
     */
    MicroRegistry.prototype._setPlaceholders = function (obj, props) {
        var _this = this;
        function fill(val, props) {
            for (var p in props)
                val = val.replace(new RegExp("\\$\\{" + p + "\\}", "g"), props[p]);
            return val;
        } // fill
        if (obj.nodeType == 3) {
            // text node
            obj.textContent = fill(obj.textContent, props);
        }
        else if (obj.nodeType == 1) {
            // HTMLElement
            var el = obj;
            for (var i = 0; i < el.attributes.length; i++) {
                var v = el.attributes[i].value;
                if (v.indexOf("${") >= 0) {
                    el[el.attributes[i].name] = el.attributes[i].value = fill(v, props);
                } // if
            } // for
            el.childNodes.forEach(function (c) {
                _this._setPlaceholders(c, props);
            });
        }
    }; // _setPlaceholders
    /**
     * Insert a new control based on a template into the root object and activate behavior.
     * @param {HTMLObjectElement} root parent object for the new control
     * @param {string} controlName
     * @param {Object} props
     */
    MicroRegistry.prototype.insertTemplate = function (root, controlName, props) {
        var e = null;
        if (root && controlName) {
            var te = this._tco.querySelector('[u-control="' + controlName + '"]');
            if (te)
                e = te.cloneNode(true);
            if (e) {
                this._setPlaceholders(e, props);
                root.appendChild(e);
                this.attachAll(e);
            } // if
        } // if
        return e;
    }; // insertTemplate()
    // attach events, methods and default-values to a html object (using the english spelling)
    MicroRegistry.prototype.loadBehavior = function (obj, behavior) {
        if (obj == null) {
            console.error("loadBehavior: obj argument is missing.");
        }
        else if (behavior == null) {
            console.error("loadBehavior: behavior argument is missing.");
        }
        else if (obj._attachedBehavior == behavior) {
            // already done.
        }
        else {
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
                }
                else if (behavior[p] == null || behavior[p].constructor != Function) {
                    // set default-value
                    if (obj[p] == null)
                        obj[p] = behavior[p];
                }
                else {
                    // attach method
                    obj[p] = behavior[p];
                } // if
            } // for
            obj._attachedBehavior = behavior;
            obj.connectedCallback(obj);
            this.List.push(obj);
        } // if
    }; // loadBehavior
    /// Find the parent node of a given object that has any behavior attached.
    MicroRegistry.prototype.FindBehaviorElement = function (obj) {
        while (obj && obj._attachedBehavior == null)
            obj = obj.parentNode;
        return obj;
    }; // FindBehaviorElement
    // define a micro control mixin in the registry.
    MicroRegistry.prototype.define = function (name, mixin) {
        this._registry[name] = mixin;
    };
    MicroRegistry.prototype.onunload = function (evt) {
        for (var n in this.List) {
            var obj = this.List[n];
            if (obj && obj.term)
                obj.term();
            for (var a = 0; a < obj.attributes.length; a++)
                obj[obj.attributes[a].name] = null;
        } // for
        for (var n in this.List) {
            this.List[n] = null;
        }
    }; // onunload
    return MicroRegistry;
}()); // MicroJCL class
var micro = new MicroRegistry();
window.addEventListener("load", micro.init.bind(micro));
window.addEventListener("unload", micro.onunload.bind(micro));
// detect that a new micro control was created using Mutation Observe Callback
var obs = new MutationObserver(function (mutationsList, observer) {
    for (var _i = 0, mutationsList_1 = mutationsList; _i < mutationsList_1.length; _i++) {
        var mutation = mutationsList_1[_i];
        mutation.addedNodes.forEach(function (n) {
            if (n.getAttribute && n.getAttribute("u-is"))
                micro.attach(n);
        });
    }
});
obs.observe(document, { childList: true, subtree: true });
// microControls.ts: a micro components implementation almost like web components.
/// <reference path="micro.ts" />
// Decorator for micro-controls.
// Extend all DOM elements with the behavior specified by the target class.
function MicroControl(isSelector) {
    // this is the decorator factory
    return function (target) {
        // this is the decorator class
        console.info("MicroControl " + target.name + " registered for " + isSelector); // only usable in chrome.
        micro.define(isSelector, new target());
        return target;
    };
}
// @MicroControl("no-base")
var MicroBaseControl = (function () {
    function MicroBaseControl() {
    }
    MicroBaseControl.prototype.connectedCallback = function (el) {
        this.el = el;
    };
    return MicroBaseControl;
}()); // class MicroBaseControl
// End.
// ding.js: Behaviors for Elements
/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
// === Generic Widget Behavior ===
var GenericWidgetClass = (function (_super) {
    __extends(GenericWidgetClass, _super);
    function GenericWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.microid = "";
        _this.data = {};
        return _this;
    }
    GenericWidgetClass.prototype.connectedCallback = function (el) {
        _super.prototype.connectedCallback.call(this, el);
        hub.subscribe(this.microid + "?*", this.newData.bind(this));
        this.newData(this.microid, "id", this.microid);
        this.data = {
            id: this.microid
        };
    }; // connectedCallback
    // visualize any new data for the widget.
    GenericWidgetClass.prototype.newData = function (path, key, value) {
        // save data to title
        this.data[key] = value;
        var ic = this.el.querySelector("img");
        if (ic) {
            setAttribute2(ic, "title", JSON.stringify(this.data, null, 1)
                .replace("{\n", "")
                .replace("\n}", ""));
        }
        // u-activ flags
        ["span", "div"].forEach(function (elType) {
            this.el
                .querySelectorAll(elType + "[u-active='" + key + "']")
                .forEach(function (el) {
                var b = toBool(value);
                setAttribute2(el, "value", b ? "1" : "0");
                setAttribute2(el, "title", b ? "active" : "not active");
                el.classList.toggle("active", b);
            });
        }, this);
        // textContent
        ["h2", "h4", "span"].forEach(function (elType) {
            this.el
                .querySelectorAll(elType + "[u-text='" + key + "']")
                .forEach(function (el) {
                if (el.textContent != value)
                    el.textContent = value;
            });
        }, this);
        // value of input fields
        this.el
            .querySelectorAll("input[u-value='" + key + "']")
            .forEach(function (el) {
            if (el.value != value)
                el.value = value;
        });
    }; // newData()
    // send an action to the board and dispatch to the element
    GenericWidgetClass.prototype.dispatchAction = function (prop, val) {
        if (val != null)
            fetch("/$board" + this.microid + "?" + prop + "=" + encodeURI(val));
    }; // dispatchAction()
    // send changed value of property as an action to the board
    GenericWidgetClass.prototype.onchange = function (e) {
        var src = e.srcElement;
        this.dispatchAction(src.getAttribute("u-value"), e.srcElement.value);
    };
    // send an action to the board
    // + change config mode
    GenericWidgetClass.prototype.onclick = function (e) {
        var src = e.srcElement;
        var a = src.getAttribute("u-action");
        if (a)
            this.dispatchAction(a, e.srcElement["value"]);
        if (src.classList.contains("setconfig")) {
            this.el.classList.toggle("configmode");
        }
    };
    return GenericWidgetClass;
}(MicroBaseControl)); // GenericWidgetClass
GenericWidgetClass = __decorate([
    MicroControl("generic")
], GenericWidgetClass);
// End.
// SwitchWidget.ts: Widget Behavior implementation for Button@MicroControl("timer") Elements
// This file is part of the Widget implementation for the HomDing Library
// implementing the Web UI corresponding to an internal configured element.
/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />
var ButtonBehavior = (function (_super) {
    __extends(ButtonBehavior, _super);
    function ButtonBehavior() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonBehavior.prototype.onpointerdown = function (e) {
        var src = e.srcElement;
        if (src.classList.contains("u-button")) {
            src.classList.add("active");
            this.dispatchAction("value", 1);
        } // if
    };
    ButtonBehavior.prototype.onpointerup = function (e) {
        var src = e.srcElement;
        if (src.classList.contains("u-button")) {
            src.classList.remove("active");
            this.dispatchAction("value", 0);
        } // if
    };
    return ButtonBehavior;
}(GenericWidgetClass));
ButtonBehavior = __decorate([
    MicroControl("button")
], ButtonBehavior);
// DSTimeWidget.ts: Widget Behavior implementation for DSTime Elements
// This file is part of the Widget implementation for the HomDing Library
// implementing the Web UI corresponding to an internal configured element.
/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />
var DSTimeClass = (function (_super) {
    __extends(DSTimeClass, _super);
    function DSTimeClass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DSTimeClass.prototype.isoDate = function () {
        function pad02(num) {
            return (((num < 10) ? '0' : '') + num);
        }
        ;
        var d = new Date();
        var ds = d.getFullYear() + '-' + pad02(d.getMonth() + 1) + '-' + pad02(d.getDate()) +
            ' ' + pad02(d.getHours()) + ':' + pad02(d.getMinutes()) + ':' + pad02(d.getSeconds());
        return (ds);
    };
    DSTimeClass.prototype.connectedCallback = function (el) {
        _super.prototype.connectedCallback.call(this, el);
        this._nowObj = this.el.querySelector(".now");
        window.setInterval(function () {
            setTextContent(this._nowObj, this.isoDate());
        }.bind(this), 200);
    };
    DSTimeClass.prototype.onclick = function (e) {
        var src = e.srcElement;
        if (src.classList.contains("setnow")) {
            this.dispatchAction("time", this.isoDate());
        }
    };
    return DSTimeClass;
}(GenericWidgetClass));
DSTimeClass = __decorate([
    MicroControl("dstime")
], DSTimeClass);
// End. 
// === recursive JSON object parser
// Traverse / Scan a complex object and send all nodes with attributes to a receiver function. */
function jsonParse(obj, cbFunc) {
    /** internal function used in recursion */
    function _jsonParse(path, key, value, cbFunc) {
        var path2 = key ? path + "/" + key : path;
        path2 = path2.replace("/[", "[");
        if (Array.isArray(value)) {
            // traverse all entries in the array
            for (var n = 0; n < value.length; n++) {
                _jsonParse(path2, "[" + n + "]", value[n], cbFunc);
            } // for
        }
        else if (typeof value == "object") {
            // this is an attribute for the receiver function
            cbFunc(path2, null, null);
            // traverse all entries in the object
            for (var n_1 in value) {
                _jsonParse(path2, n_1, value[n_1], cbFunc);
            } // for
        }
        else {
            // this is an attribute for the receiver function
            cbFunc(path, key, String(value));
        } // if
    } // _jsonParse()
    // start with root and scan recursively.
    _jsonParse("", "", obj, cbFunc);
} // jsonParse()
// End. 
// SwitchWidget.ts: Widget Behavior implementation for PWMOut Elements
// This file is part of the Widget implementation for the HomDing Library
// implementing the Web UI corresponding to an internal configured element.
/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />
var PWMOutWidgetClass = (function (_super) {
    __extends(PWMOutWidgetClass, _super);
    function PWMOutWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.range = 255;
        return _this;
    }
    PWMOutWidgetClass.prototype.connectedCallback = function (el) {
        _super.prototype.connectedCallback.call(this, el);
        hub.subscribe(this.microid + "?*", this.newValue.bind(this));
    };
    PWMOutWidgetClass.prototype.newValue = function (path, key, value) {
        if (key == "range") {
            this.range = Number(value);
        }
        else if (key == "value") {
            if (this.lastValue !== value) {
                var o = this.el.querySelector(".u-level");
                var h = o.offsetHeight;
                var bh = (h * Number(value)) / this.range;
                if (bh > h - 1)
                    bh = h - 1;
                if (bh < 1)
                    bh = 1;
                o.style.borderBottomWidth = bh + "px";
                this.lastValue = value;
            }
        }
    };
    return PWMOutWidgetClass;
}(GenericWidgetClass));
PWMOutWidgetClass = __decorate([
    MicroControl("pwmout")
], PWMOutWidgetClass);
// End.
// SwitchWidget.ts: Widget Behavior implementation for Switch Elements
// This file is part of the Widget implementation for the HomDing Library
// implementing the Web UI corresponding to an internal configured element.
/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />
var SwitchWidgetClass = (function (_super) {
    __extends(SwitchWidgetClass, _super);
    function SwitchWidgetClass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SwitchWidgetClass.prototype.onclick = function (e) {
        var o = this.el.querySelector(".u-switch");
        var src = e.srcElement;
        while (src != null && src != this.el && src != o)
            src = src.parentElement;
        if (src == o)
            this.dispatchAction("toggle", 1);
    };
    return SwitchWidgetClass;
}(GenericWidgetClass));
SwitchWidgetClass = __decorate([
    MicroControl("switch")
], SwitchWidgetClass);
// End.
// SwitchWidget.ts: Widget Behavior implementation for Timer Elements
// This file is part of the Widget implementation for the HomDing Library
// implementing the Web UI corresponding to an internal configured element.
/// <reference path="micro.ts" />
/// <reference path="microControls.ts" />
/// <reference path="GenericWidget.ts" />
var TimerWidgetClass = (function (_super) {
    __extends(TimerWidgetClass, _super);
    function TimerWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.wt = 0;
        _this.pt = 0;
        _this.ct = 0;
        _this.time = 0;
        return _this;
    }
    TimerWidgetClass.prototype._timeToSec = function (v) {
        var ret = 0;
        v = v.toLowerCase();
        if (v.endsWith("h")) {
            ret = parseInt(v, 10) * 60 * 60;
        }
        else if (v.endsWith("m")) {
            ret = parseInt(v, 10) * 60;
        }
        else if (v.endsWith("s")) {
            ret = parseInt(v, 10);
        }
        else {
            ret = Number(v);
        } // if
        return ret;
    }; // _timeToSec()
    TimerWidgetClass.prototype.newData = function (path, key, value) {
        _super.prototype.newData.call(this, path, key, value);
        if (key == "waittime") {
            this.wt = this._timeToSec(value);
        }
        else if (key == "pulsetime") {
            this.pt = this._timeToSec(value);
        }
        else if (key == "cycletime") {
            this.ct = this._timeToSec(value);
        }
        else if (key == "time") {
            this.time = this._timeToSec(value);
        }
        if (this.ct < this.wt + this.pt)
            this.ct = this.wt + this.pt;
        // update bars
        if (this.ct > 0) {
            var el = this.el.querySelector(".u-bar");
            var f = el.clientWidth / this.ct;
            var pto = el.querySelector(".pulse");
            pto.style.left = Math.floor(this.wt * f) + "px";
            pto.style.width = Math.floor(this.pt * f) + "px";
            var cto = el.querySelector(".current");
            cto.style.width = Math.floor(this.time * f) + "px";
        }
    }; // newData()}
    return TimerWidgetClass;
}(GenericWidgetClass));
TimerWidgetClass = __decorate([
    MicroControl("timer")
], TimerWidgetClass);
// End.
// some utils
function toBool(s) {
    if (!s)
        return false;
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
} // toBool()
function setTextContent(el, txt) {
    if (el.textContent !== txt)
        el.textContent = txt;
} // setTextContent
function setAttribute2(el, name, value) {
    if (el.getAttribute(name) !== value)
        el.setAttribute(name, value);
} // setAttribute2
// return actual parameters in hash part of URL as object
function getHashParams(defaults) {
    var params = __assign({}, defaults);
    window.location.hash
        .substr(1)
        .split("&")
        .forEach(function (p) {
        var pa = p.split("=");
        params[pa[0]] = pa[1];
    });
    return params;
} // getHashParams()
// End
//# sourceMappingURL=micro.js.map