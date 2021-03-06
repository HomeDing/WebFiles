"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var MicroState;
(function (MicroState) {
    MicroState[MicroState["PREP"] = 1] = "PREP";
    MicroState[MicroState["INIT"] = 2] = "INIT";
    MicroState[MicroState["LOADED"] = 3] = "LOADED";
})(MicroState || (MicroState = {}));
var MicroRegistry = (function () {
    function MicroRegistry() {
        this._tco = null;
        this._registry = {};
        this._state = MicroState.PREP;
        this._unloadedList = [];
        this.List = [];
        window.addEventListener('load', this.init.bind(this));
        window.addEventListener('unload', this.onunload.bind(this));
    }
    MicroRegistry.prototype.loadFile = function (fName) {
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
    };
    MicroRegistry.prototype.attach = function (elem) {
        if (this._state === MicroState.LOADED) {
            var cn = elem.getAttribute('u-is');
            if (cn) {
                var bc = this._registry[cn];
                if (bc) {
                    this.loadBehavior(elem, bc);
                }
            }
        }
        else {
            this._unloadedList.push(elem);
        }
    };
    MicroRegistry.prototype._setPlaceholders = function (obj, props) {
        var _this = this;
        function fill(val) {
            Object.getOwnPropertyNames(props).forEach(function (p) { return val = val.replace(new RegExp('\\$\\{' + p + '\\}', 'g'), props[p]); });
            return val;
        }
        if (props) {
            if (obj.nodeType === Node.TEXT_NODE) {
                if (obj.textContent) {
                    obj.textContent = fill(obj.textContent);
                }
            }
            else if (obj.nodeType === Node.ELEMENT_NODE) {
                var attr = obj.attributes;
                if (obj.namespaceURI === 'http://www.w3.org/2000/svg') {
                    for (var i = 0; i < attr.length; i++) {
                        var v = attr[i].value;
                        if (v.indexOf('${') >= 0) {
                            obj[attr[i].name].baseVal = fill(v);
                        }
                    }
                }
                else {
                    for (var i = 0; i < attr.length; i++) {
                        var v = attr[i].value;
                        if (v.indexOf('${') >= 0) {
                            obj.setAttribute(attr[i].name, fill(v));
                        }
                    }
                }
                obj.childNodes.forEach(function (c) {
                    _this._setPlaceholders(c, props);
                });
            }
        }
    };
    MicroRegistry.prototype.isVisible = function (el) {
        var vis = false;
        if (el.offsetWidth > 0 && el.offsetHeight > 0) {
            var rect = el.getBoundingClientRect();
            vis = (rect.top <= window.innerHeight && rect.bottom >= 0);
        }
        return (vis);
    };
    MicroRegistry.prototype.loadDataImage = function (imgElem) {
        if ((imgElem.dataset.src) && (this.isVisible(imgElem))) {
            imgElem.src = imgElem.dataset.src;
        }
    };
    MicroRegistry.prototype.insertTemplate = function (root, controlName, props) {
        var _this = this;
        var e = null;
        if (root && controlName && this._tco) {
            var te = this._tco.querySelector('[u-control="' + controlName.toLowerCase() + '"]');
            if (te) {
                e = te.cloneNode(true);
            }
            if (e) {
                e.params = props;
                this._setPlaceholders(e, props);
                root.appendChild(e);
                root.querySelectorAll('[u-is]').forEach(function (el) { return micro.attach(el); });
                this._setPlaceholders(e, props);
                root.querySelectorAll('[data-src]:not([src])').forEach(function (el) { return _this.loadDataImage(el); });
            }
        }
        return e;
    };
    MicroRegistry.prototype.loadBehavior = function (obj, behavior) {
        var b = behavior;
        var oc = obj;
        if (!obj) {
            console.error('loadBehavior: obj argument is missing.');
        }
        else if (!behavior) {
            console.error('loadBehavior: behavior argument is missing.');
        }
        else if (oc._attachedBehavior === behavior) {
        }
        else {
            if (obj.attributes) {
                for (var n = 0; n < obj.attributes.length; n++) {
                    var a = obj.attributes[n];
                    if (!obj[a.name]) {
                        obj[a.name] = a.value;
                    }
                }
            }
            for (var p in b) {
                if (p === 'on_touchstart') {
                    obj.addEventListener(p.substr(3), b[p].bind(obj), { passive: true });
                }
                else if (p.substr(0, 3) === 'on_') {
                    obj.addEventListener(p.substr(3), b[p].bind(obj), false);
                }
                else if (p.substr(0, 2) === 'on') {
                    obj.addEventListener(p.substr(2), b[p].bind(obj), false);
                }
                else if (b[p] == null || b[p].constructor !== Function) {
                    if (!obj[p]) {
                        obj[p] = b[p];
                    }
                }
                else {
                    obj[p] = b[p];
                }
            }
            oc._attachedBehavior = behavior;
            if (obj.parentElement !== this._tco) {
                oc.connectedCallback();
                this.List.push(obj);
            }
        }
    };
    MicroRegistry.prototype.define = function (name, mixin) {
        this._registry[name] = mixin;
    };
    MicroRegistry.prototype.onunload = function (_evt) {
        this.List.forEach(function (obj) {
            if (obj && obj.term) {
                obj.term();
            }
            for (var a = 0; a < obj.attributes.length; a++) {
                obj[obj.attributes[a].name] = null;
            }
        });
        for (var n = 0; n < this.List.length; n++) {
            delete this.List[n];
        }
        this.List = [];
    };
    MicroRegistry.prototype.init = function () {
        this._state = MicroState.INIT;
        this._tco = document.getElementById('u-templates');
        if (!this._tco) {
            this._tco = createHTMLElement(document.body, 'div', { id: 'u-templates' });
        }
        if (document.readyState === 'complete') {
            this.init2();
        }
        else {
            document.addEventListener('readystatechange', this.init2);
        }
    };
    MicroRegistry.prototype.init2 = function () {
        var _this = this;
        if (document.readyState === 'complete') {
            this._state = MicroState.LOADED;
            this._unloadedList.forEach(function (el) {
                var cn = el.getAttribute('u-is');
                if (cn) {
                    var bc = _this._registry[cn];
                    if (bc) {
                        _this.loadBehavior(el, bc);
                    }
                    _this.List.push(el);
                }
            });
            this._unloadedList = [];
        }
    };
    return MicroRegistry;
}());
var micro = new MicroRegistry();
var obs = new MutationObserver(function (mutationsList, _observer) {
    for (var _i = 0, mutationsList_1 = mutationsList; _i < mutationsList_1.length; _i++) {
        var mutation = mutationsList_1[_i];
        mutation.addedNodes.forEach(function (n) {
            var e = n;
            if (e.getAttribute && e.getAttribute('u-is')) {
                micro.attach(n);
            }
        });
    }
});
obs.observe(document, { childList: true, subtree: true });
document.addEventListener('DOMContentLoaded', function () {
    function f() { document.querySelectorAll('[data-src]:not([src])').forEach(function (e) { return micro.loadDataImage(e); }); }
    window.addEventListener('scroll', f);
    window.setTimeout(f, 40);
});
var MicroControlClass = (function () {
    function MicroControlClass() {
    }
    MicroControlClass.prototype.connectedCallback = function () { };
    return MicroControlClass;
}());
function MicroControl(isSelector) {
    return function (target) {
        micro.define(isSelector, new target());
        return target;
    };
}
var GenericWidgetClass = (function (_super) {
    __extends(GenericWidgetClass, _super);
    function GenericWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.microid = '';
        _this.data = {};
        _this.subId = 0;
        _this.actions = [];
        return _this;
    }
    GenericWidgetClass.prototype.connectedCallback = function () {
        _super.prototype.connectedCallback.call(this);
        this.data = { id: this.microid };
        this.subId = hub.subscribe(this.microid + '?*', this.newData.bind(this));
        hub.replay(this.subId);
    };
    GenericWidgetClass.prototype.newData = function (_path, key, value) {
        if (key && value) {
            this.data[key] = value;
            var ic = this.querySelector('img,h3');
            if (ic) {
                setAttr(ic, 'title', JSON.stringify(this.data, null, 1)
                    .replace('{\n', '')
                    .replace('\n}', ''));
            }
        }
        if (key === 'active') {
            this.classList.toggle('active', toBool(value));
        }
        ['span', 'div'].forEach(function (elType) {
            this.querySelectorAll(elType + ("[u-active='" + key + "']")).forEach(function (elem) {
                var b = toBool(value);
                setAttr(elem, 'value', b ? '1' : '0');
                setAttr(elem, 'title', b ? 'active' : 'not active');
                elem.classList.toggle('active', b);
            });
        }, this);
        ['h2', 'h3', 'h4', 'span', 'button'].forEach(function (elType) {
            this.querySelectorAll(elType + '[u-text=\'' + key + '\']').forEach(function (elem) {
                if (elem.textContent !== value) {
                    elem.textContent = value;
                }
            });
        }, this);
        ['input', 'select'].forEach(function (elType) {
            this.querySelectorAll(elType + '[u-value=\'' + key + '\']').forEach(function (elem) {
                if (elem.type === 'radio') {
                    elem.checked = elem.value === value;
                }
                else if (elem.value !== value) {
                    elem.value = value ? value : '';
                }
            });
        }, this);
        ['button', 'label'].forEach(function (elType) {
            this.querySelectorAll(elType + '[u-action=\'${' + key + '}\']').forEach(function (elem) {
                setAttr(elem, 'u-action', value ? value : '');
            });
        }, this);
        this.querySelectorAll("span[u-color='" + key + "']").forEach(function (elem) {
            var col = value ? value.replace(/^x/, '#') : '#888';
            col = col.replace(/^#\S{2}(\S{6})$/, '#$1');
            elem.style.backgroundColor = col;
        });
    };
    GenericWidgetClass.prototype.dispatchNext = function () {
        var _this = this;
        if (this.actions) {
            var a = this.actions.shift();
            if (a) {
                var aa = a.split('=');
                var aUrl = aa[0] + '=' + encodeURIComponent(aa[1]);
                fetch(aUrl).then(function () {
                    if (_this.actions.length > 0) {
                        debounce(_this.dispatchNext.bind(_this))();
                    }
                    else {
                        if (updateAsap) {
                            updateAsap();
                        }
                    }
                });
            }
        }
    };
    GenericWidgetClass.prototype.dispatchAction = function (prop, val) {
        var _this = this;
        if (prop !== null && val !== null) {
            if (prop.includes('/')) {
                prop.replace('${v}', encodeURI(val));
                prop.split(',').forEach(function (a) { return _this.actions.push('/$board/' + a); });
            }
            else {
                this.actions.push("/$board" + this.microid + "?" + prop + "=" + encodeURI(val));
            }
            debounce(this.dispatchNext.bind(this))();
        }
    };
    GenericWidgetClass.prototype.showSys = function () {
        var p = getHashParams({ sys: false }).sys;
        return (toBool(p));
    };
    GenericWidgetClass.prototype.on_change = function (e) {
        var src = e.target;
        this.dispatchAction(src.getAttribute('u-value'), src.value);
    };
    GenericWidgetClass.prototype.on_click = function (e) {
        var src = e.target;
        var p = src;
        while (p && !(p.getAttribute('u-action')) && p !== this) {
            p = p.parentElement;
        }
        if (p) {
            this.dispatchAction(p.getAttribute('u-action'), p.getAttribute('value') || '1');
        }
        if (src.classList.contains('setconfig')) {
            ModalDialogClass.open('configelementdlg', this.data);
        }
        else if (src.classList.contains('setactive')) {
            this.dispatchAction(toBool(this.data.active) ? 'stop' : 'start', '1');
        }
        else if (src.tagName === 'H3') {
            ModalDialogClass.openFocus(this);
        }
    };
    GenericWidgetClass = __decorate([
        MicroControl('generic')
    ], GenericWidgetClass);
    return GenericWidgetClass;
}(MicroControlClass));
var BL0937WidgetClass = (function (_super) {
    __extends(BL0937WidgetClass, _super);
    function BL0937WidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.mode = '';
        return _this;
    }
    BL0937WidgetClass.prototype.connectedCallback = function () {
        _super.prototype.connectedCallback.call(this);
        this.data = { id: this.microid };
        this.subId = hub.subscribe(this.microid + '?mode', this.switchMode.bind(this));
        hub.replay(this.subId);
    };
    BL0937WidgetClass.prototype.setMode = function (newMode) {
        if (newMode && (newMode !== this.mode)) {
            var td = void 0;
            td = this.querySelector("[u-text=\"" + this.mode + "\"]");
            if (td === null || td === void 0 ? void 0 : td.parentElement) {
                td.parentElement.style.display = 'none';
            }
            td = this.querySelector("span[u-text=\"" + newMode + "\"]");
            if (td === null || td === void 0 ? void 0 : td.parentElement) {
                td.parentElement.style.display = '';
            }
            this.mode = newMode;
        }
    };
    BL0937WidgetClass.prototype.switchMode = function (_path, _key, value) {
        this.setMode(value);
    };
    BL0937WidgetClass.prototype.on_click = function (e) {
        var src = e.target;
        if (src.getAttribute('u-action') === 'mode') {
            this.setMode(src['value']);
        }
        _super.prototype.on_click.call(this, e);
    };
    BL0937WidgetClass = __decorate([
        MicroControl('bl0937')
    ], BL0937WidgetClass);
    return BL0937WidgetClass;
}(GenericWidgetClass));
var ButtonGroupWidgetClass = (function (_super) {
    __extends(ButtonGroupWidgetClass, _super);
    function ButtonGroupWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._count = 0;
        _this._blockElem = null;
        return _this;
    }
    ButtonGroupWidgetClass.prototype.connectedCallback = function () {
        _super.prototype.connectedCallback.call(this);
        this._blockElem = this.querySelector('.block');
    };
    ButtonGroupWidgetClass.prototype.newData = function (path, key, value) {
        _super.prototype.newData.call(this, path, key, value);
        if (key && value) {
            if (key !== 'title') {
                if (this._count % 2 === 0) {
                    this._blockElem = createHTMLElement(this, 'div', { 'class': 'block' });
                }
                if (this._blockElem) {
                    createHTMLElement(this._blockElem, 'button', { 'u-action': value }).textContent = key;
                }
                this._count++;
            }
        }
    };
    ButtonGroupWidgetClass = __decorate([
        MicroControl('buttongroup')
    ], ButtonGroupWidgetClass);
    return ButtonGroupWidgetClass;
}(GenericWidgetClass));
var ButtonWidgetClass = (function (_super) {
    __extends(ButtonWidgetClass, _super);
    function ButtonWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._onclick = '';
        _this._ondoubleclick = '';
        _this._onpress = '';
        _this._timer = 0;
        _this._start = 0;
        _this._duration = 0;
        return _this;
    }
    ButtonWidgetClass.prototype.newData = function (path, key, value) {
        _super.prototype.newData.call(this, path, key, value);
        if (key === 'onclick') {
            this._onclick = value;
        }
        else if (key === 'ondoubleclick') {
            this._ondoubleclick = value;
        }
        else if (key === 'onpress') {
            this._onpress = value;
        }
    };
    ButtonWidgetClass.prototype.on_click = function () {
        if (this._duration > 800) {
            if (this._onpress) {
                this.dispatchAction(this._onpress, '1');
            }
        }
        else {
            var scope_1 = this;
            if (this._timer) {
                window.clearTimeout(this._timer);
            }
            this._timer = window.setTimeout(function () {
                scope_1.dispatchAction(scope_1._onclick, '1');
            }, 250);
        }
    };
    ButtonWidgetClass.prototype.on_dblclick = function () {
        if (this._timer) {
            window.clearTimeout(this._timer);
        }
        this.dispatchAction(this._ondoubleclick, '1');
    };
    ButtonWidgetClass.prototype.on_pointerdown = function () {
        this._start = new Date().valueOf();
    };
    ButtonWidgetClass.prototype.on_pointerup = function () {
        this._duration = new Date().valueOf() - this._start;
    };
    ButtonWidgetClass = __decorate([
        MicroControl('button')
    ], ButtonWidgetClass);
    return ButtonWidgetClass;
}(GenericWidgetClass));
var ColorWidgetClass = (function (_super) {
    __extends(ColorWidgetClass, _super);
    function ColorWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.colObj = null;
        _this.hueObj = null;
        _this.lightObj = null;
        _this.satObj = null;
        _this.whiteObj = null;
        _this._hvalue = '00ff0000';
        _this._value = '00000000';
        _this._hue = 127;
        _this._lightness = 127;
        _this._saturation = 255;
        _this._white = 127;
        _this._hasWhite = false;
        return _this;
    }
    ColorWidgetClass.prototype.connectedCallback = function () {
        _super.prototype.connectedCallback.call(this);
        this.colObj = this.querySelector('.color');
        this.hueObj = this.querySelector('.hue');
        this.satObj = this.querySelector('.band.saturation');
        this.lightObj = this.querySelector('.band.lightness');
        this.whiteObj = this.querySelector('.white');
    };
    ColorWidgetClass.prototype.updateBands = function () {
    };
    ColorWidgetClass.prototype.newData = function (_path, key, value) {
        if (!value) {
        }
        else if (key === 'value') {
            value = value.replace('x', '');
            if (value.length === 6) {
                this._value = "00" + value;
            }
            else if (value.length === 8) {
                this._value = value;
            }
            var col = this._value.substr(2);
            var hsl = this.rgbToHsl(this.rgb(col));
            this._hvalue = this.hslToRGB(hsl.h, 100, 50);
            if (this.hueObj) {
                this.hueObj.value = String(hsl.h);
            }
            if (this.satObj) {
                this.satObj.value = String(hsl.s);
                this.satObj.style.background = "linear-gradient(to right, #808080 0%, #" + this._hvalue + " 100%)";
            }
            if (this.lightObj) {
                this.lightObj.value = String(hsl.l);
                this.lightObj.style.background = "linear-gradient(to right, #000 0%, #" + this._hvalue + " 50%, #fff 100%)";
            }
            if (this.whiteObj) {
                this.whiteObj.value = String(parseInt(this._value.substr(0, 2), 16));
            }
            if (this.colObj) {
                this.colObj.style.backgroundColor = "#" + col;
            }
        }
        else if (key === 'config') {
            this._hasWhite = (value === 'WRGB');
            if (this.whiteObj) {
                this.whiteObj.style.display = this._hasWhite ? '' : 'none';
            }
        }
        _super.prototype.newData.call(this, _path, key, value);
    };
    ColorWidgetClass.prototype.on_input = function (e) {
        var tar = e.target;
        var col = '';
        if (tar === this.hueObj) {
            this._hue = parseInt(tar.value, 10);
            this._hvalue = this.hslToRGB(this._hue, 100, 50);
        }
        else if (tar === this.lightObj) {
            this._lightness = parseInt(tar.value, 10);
            this.dispatchAction('lightness', tar.value);
        }
        else if (tar === this.satObj) {
            this._saturation = parseInt(tar.value, 10);
            this.dispatchAction('saturation', tar.value);
        }
        else if (tar === this.whiteObj) {
            this._white = parseInt(tar.value, 10);
        }
        col = 'x' + this.hslToRGB(this._hue, Math.round(this._saturation * 100 / 255), Math.round(this._lightness * 100 / 255));
        if (this._hasWhite) {
            col = 'x' + this.x16(this._white) + col.substr(1);
        }
        this.dispatchAction('value', col);
    };
    ColorWidgetClass.prototype.rgb = function (color) {
        var rgb = { r: 0, g: 0, b: 0 };
        if (color && color.length >= 6) {
            var col = color.substr(color.length - 6);
            rgb.r = parseInt(col.substr(0, 2), 16);
            rgb.g = parseInt(col.substr(2, 2), 16);
            rgb.b = parseInt(col.substr(4, 2), 16);
        }
        return (rgb);
    };
    ColorWidgetClass.prototype.rgbToHsl = function (rgb) {
        var hsl = { h: 0, s: 0, l: 0 };
        var max = Math.max(rgb.r, rgb.g, rgb.b);
        var min = Math.min(rgb.r, rgb.g, rgb.b);
        var d = max - min;
        var s = max + min;
        hsl.l = Math.round(s / 2);
        if (d > 0) {
            var hue = 0;
            hsl.s = Math.round(255 * (hsl.l > 127 ? d / (510 - s) : d / s));
            if (max === rgb.r) {
                hue = (rgb.g - rgb.b) / d + (rgb.g < rgb.b ? 6 : 0);
            }
            else if (max === rgb.g) {
                hue = (rgb.b - rgb.r) / d + 2;
            }
            else if (max === rgb.b) {
                hue = (rgb.r - rgb.g) / d + 4;
            }
            hsl.h = Math.round(hue * 60) % 360;
        }
        return (hsl);
    };
    ColorWidgetClass.prototype.hslToRGB = function (h, s, l) {
        var obj = this.hueObj || this;
        obj.style.backgroundColor = "hsl(" + h + ", " + s + "%, " + l + "%)";
        var bc = getComputedStyle(obj, null).backgroundColor;
        var v = String(bc).replace(/[^0-9,]/g, '').split(',');
        var col = this.x16(v[0]) + this.x16(v[1]) + this.x16(v[2]);
        return (col);
    };
    ColorWidgetClass.prototype.x16 = function (d) {
        var x = Number(d).toString(16);
        if (x.length === 1) {
            x = '0' + x;
        }
        return (x);
    };
    ColorWidgetClass = __decorate([
        MicroControl('color')
    ], ColorWidgetClass);
    return ColorWidgetClass;
}(GenericWidgetClass));
var DSTimeWidgetClass = (function (_super) {
    __extends(DSTimeWidgetClass, _super);
    function DSTimeWidgetClass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DSTimeWidgetClass.prototype.isoDate = function () {
        function pad02(num) {
            return (((num < 10) ? '0' : '') + num);
        }
        var d = new Date();
        var ds = d.getFullYear() + '-' + pad02(d.getMonth() + 1) + '-' + pad02(d.getDate()) +
            ' ' + pad02(d.getHours()) + ':' + pad02(d.getMinutes()) + ':' + pad02(d.getSeconds());
        return (ds);
    };
    DSTimeWidgetClass.prototype.connectedCallback = function () {
        _super.prototype.connectedCallback.call(this);
        this._nowObj = this.querySelector('.setnow');
        window.setInterval(function () {
            if (this._nowObj) {
                setTextContent(this._nowObj, this.isoDate());
            }
        }.bind(this), 200);
    };
    DSTimeWidgetClass.prototype.on_click = function (e) {
        var src = e.target;
        if ((src) && (src.classList.contains('setnow'))) {
            this.dispatchAction('time', this.isoDate());
        }
        else {
            _super.prototype.on_click.call(this, e);
        }
    };
    DSTimeWidgetClass = __decorate([
        MicroControl('dstime')
    ], DSTimeWidgetClass);
    return DSTimeWidgetClass;
}(GenericWidgetClass));
var DisplayDotWidgetClass = (function (_super) {
    __extends(DisplayDotWidgetClass, _super);
    function DisplayDotWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lastValue = null;
        _this._dispElem = null;
        _this._elem = null;
        _this._x = 0;
        _this._y = 0;
        _this._value = false;
        return _this;
    }
    DisplayDotWidgetClass.prototype.connectedCallback = function () {
        _super.prototype.connectedCallback.call(this);
        this._dispElem = document.querySelector('#panel .display');
        if (this._dispElem) {
            this._elem = createHTMLElement(this._dispElem, 'span', { class: 'dot' });
            this.updateElem();
        }
        if (!this.showSys()) {
            this.style.display = 'none';
        }
    };
    DisplayDotWidgetClass.prototype.newData = function (path, key, value) {
        _super.prototype.newData.call(this, path, key, value);
        if (key && value && this._elem) {
            if (key === 'value') {
                this._value = toBool(value);
            }
            else if (key === 'page') {
                this._elem.setAttribute('displayPage', value);
            }
            else if (key === 'x') {
                this._x = Number(value);
            }
            else if (key === 'y') {
                this._y = Number(value);
            }
            this.updateElem();
        }
    };
    DisplayDotWidgetClass.prototype.updateElem = function () {
        if (this._elem) {
            this._elem.style.top = this._y + 'px';
            this._elem.style.left = this._x + 'px';
            this._elem.classList.toggle('active', this._value);
        }
    };
    DisplayDotWidgetClass = __decorate([
        MicroControl('displaydot')
    ], DisplayDotWidgetClass);
    return DisplayDotWidgetClass;
}(GenericWidgetClass));
var DisplayLineWidgetClass = (function (_super) {
    __extends(DisplayLineWidgetClass, _super);
    function DisplayLineWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._dispElem = null;
        _this._elem = null;
        _this._x0 = 0;
        _this._x1 = 0;
        _this._y0 = 0;
        _this._y1 = 0;
        return _this;
    }
    DisplayLineWidgetClass.prototype.connectedCallback = function () {
        _super.prototype.connectedCallback.call(this);
        this._dispElem = document.querySelector('#panel .display');
        if (this._dispElem) {
            this._elem = createHTMLElement(this._dispElem, 'span', { class: 'line' });
            this.updateElem();
        }
        if (!this.showSys()) {
            this.style.display = 'none';
        }
    };
    DisplayLineWidgetClass.prototype.newData = function (path, key, value) {
        _super.prototype.newData.call(this, path, key, value);
        if (key && value && this._elem) {
            if (key === 'page') {
                this._elem.setAttribute('displayPage', value);
            }
            else if (this['_' + key] != null) {
                this['_' + key] = value;
            }
            this.updateElem();
        }
    };
    DisplayLineWidgetClass.prototype.updateElem = function () {
        if (this._elem) {
            this._elem.style.top = this._y0 + 'px';
            this._elem.style.left = this._x0 + 'px';
            this._elem.style.width = (this._x1 - this._x0) + 'px';
            this._elem.style.height = (this._y1 - this._y0) + 'px';
        }
    };
    DisplayLineWidgetClass = __decorate([
        MicroControl('displayline')
    ], DisplayLineWidgetClass);
    return DisplayLineWidgetClass;
}(GenericWidgetClass));
var DisplayTextWidgetClass = (function (_super) {
    __extends(DisplayTextWidgetClass, _super);
    function DisplayTextWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lastValue = null;
        _this._dispElem = null;
        _this._grid = 1;
        _this._elem = null;
        _this._prefix = '';
        _this._postfix = '';
        return _this;
    }
    DisplayTextWidgetClass.prototype.connectedCallback = function () {
        _super.prototype.connectedCallback.call(this);
        this._dispElem = document.querySelector('#panel .display');
        if (this._dispElem) {
            if (this._dispElem.getAttribute('grid')) {
                this._grid = Number(this._dispElem.getAttribute('grid'));
            }
            this._elem = createHTMLElement(this._dispElem, 'span', { class: 'text', style: 'top:0;left:0;display:none' });
        }
        if (!this.showSys()) {
            this.style.display = 'none';
        }
    };
    DisplayTextWidgetClass.prototype.newData = function (path, key, value) {
        _super.prototype.newData.call(this, path, key, value);
        if (key && value && this._elem) {
            if (key === 'value') {
                var t = ("" + this._prefix + value + this._postfix).replace(/ /g, '&nbsp;');
                if (this._elem.innerHTML !== t) {
                    this._elem.innerHTML = t;
                }
            }
            else if (key === 'page') {
                this._elem.setAttribute('displayPage', value);
            }
            else if (key === 'x') {
                var n = Number(value) * this._grid;
                this._elem.style.left = (this._grid > 1 ? (n * 7 / 10) : n) + 'px';
            }
            else if (key === 'y') {
                this._elem.style.top = (Number(value) * this._grid) + 'px';
            }
            else if (key === 'fontsize') {
                this._elem.style.fontSize = value + 'px';
                this._elem.style.lineHeight = value + 'px';
                this._elem.style.height = value + 'px';
            }
            else if (key === 'prefix') {
                this._prefix = value;
            }
            else if (key === 'postfix') {
                this._postfix = value;
            }
        }
    };
    DisplayTextWidgetClass = __decorate([
        MicroControl('displaytext')
    ], DisplayTextWidgetClass);
    return DisplayTextWidgetClass;
}(GenericWidgetClass));
var DisplayWidgetClass = (function (_super) {
    __extends(DisplayWidgetClass, _super);
    function DisplayWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.displayPage = '';
        _this._dialogElem = null;
        return _this;
    }
    DisplayWidgetClass.prototype.connectedCallback = function () {
        _super.prototype.connectedCallback.call(this);
        this._dialogElem = this.querySelector('.display');
    };
    DisplayWidgetClass.prototype.newData = function (path, key, value) {
        var _this = this;
        var _a;
        _super.prototype.newData.call(this, path, key, value);
        if (key && value) {
            if (key === 'page') {
                if (value !== this.displayPage) {
                    this.displayPage = value;
                    (_a = this._dialogElem) === null || _a === void 0 ? void 0 : _a.querySelectorAll(':scope > span').forEach(function (e) {
                        var p = e.getAttribute('displayPage') || '1';
                        e.style.display = (p === _this.displayPage) ? '' : 'none';
                    });
                }
            }
        }
    };
    DisplayWidgetClass = __decorate([
        MicroControl('display')
    ], DisplayWidgetClass);
    return DisplayWidgetClass;
}(GenericWidgetClass));
var IncludeWidgetClass = (function (_super) {
    __extends(IncludeWidgetClass, _super);
    function IncludeWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.query = null;
        return _this;
    }
    IncludeWidgetClass.prototype.connectedCallback = function () {
        this.query = this.getAttribute('ref');
        var obj = document.querySelector('#u-templates ' + this.query);
        if (obj) {
            var e = obj.cloneNode(true);
            var root = this.parentElement;
            root === null || root === void 0 ? void 0 : root.replaceChild(e, this);
        }
    };
    IncludeWidgetClass = __decorate([
        MicroControl('include')
    ], IncludeWidgetClass);
    return IncludeWidgetClass;
}(MicroControlClass));
function jsonParse(obj, cbFunc) {
    function _jsonParse(path, key, value) {
        var path2 = key ? path + '/' + key : path;
        path2 = path2.replace('/[', '[');
        if (Array.isArray(value)) {
            for (var n = 0; n < value.length; n++) {
                _jsonParse(path2, '[' + n + ']', value[n]);
            }
        }
        else if (typeof value === 'object') {
            cbFunc(path2, null, null);
            Object.getOwnPropertyNames(value).forEach(function (k) { return _jsonParse(path2, k, value[k]); });
        }
        else {
            cbFunc(path, key, String(value));
        }
    }
    _jsonParse('', '', obj);
}
function jsonFind(obj, path) {
    if (path[0] === '/') {
        path = path.substr(1);
    }
    var steps = path.split('/');
    while (obj && steps.length > 0) {
        var p = steps[0];
        if (!obj[p]) {
            obj[p] = {};
        }
        obj = obj[p];
        steps.shift();
    }
    return obj;
}
var LogWidgetClass = (function (_super) {
    __extends(LogWidgetClass, _super);
    function LogWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.filename = null;
        _this.lineSVGObj = null;
        _this.xFormat = 'datetime';
        _this.yFormat = 'num';
        return _this;
    }
    LogWidgetClass.prototype.connectedCallback = function () {
        _super.prototype.connectedCallback.call(this);
        this.lineSVGObj = this.querySelector('object');
    };
    LogWidgetClass.prototype.loadData = function () {
        var fName = this.filename;
        var allData = '';
        var p1 = fetch(fName, { cache: 'no-store' })
            .then(function (result) {
            return result.text();
        })
            .then(function (txt) {
            allData = allData + '\n' + txt;
        });
        var p2 = fetch(fName.replace('.txt', '_old.txt'), { cache: 'no-store' })
            .then(function (result) {
            return result.text();
        })
            .then(function (txt) {
            allData = txt + '\n' + allData;
        })
            .catch(function () {
        });
        Promise.allSettled([p1, p2]).then(function () {
            var re = /^\d{4,},\d+/;
            var pmArray = allData.split('\n').filter(function (e) {
                return e.match(re);
            });
            this.api.draw(this.lChart, pmArray.map(function (v) {
                var p = v.split(',');
                return { x: p[0], y: p[1] };
            }));
        }.bind(this));
    };
    LogWidgetClass.prototype.loadSVG = function () {
        var done = false;
        if (this.lineSVGObj) {
            var svgObj = null;
            try {
                svgObj = (this.lineSVGObj.getSVGDocument());
            }
            catch (err) { }
            if ((svgObj) && (svgObj.api)) {
                this.api = this.lineSVGObj.getSVGDocument().api;
                this.lChart = this.api.add('line', { linetype: 'line' });
                this.api.add(['VAxis',
                    { type: 'hAxis', options: { format: 'datetime' } },
                    { type: 'indicator', options: { xFormat: this.xFormat, yFormat: this.yFormat } },
                ]);
                this.loadData();
                done = true;
            }
        }
        if (!done) {
            window.setTimeout(this.loadSVG.bind(this), 1000);
        }
    };
    LogWidgetClass.prototype.newData = function (path, key, value) {
        _super.prototype.newData.call(this, path, key, value);
        if (key === 'filename') {
            this.filename = value;
            this.loadSVG();
        }
        else if (key === 'xformat') {
            this.xFormat = value;
        }
        else if (key === 'yformat') {
            this.yFormat = value;
        }
    };
    LogWidgetClass = __decorate([
        MicroControl('log')
    ], LogWidgetClass);
    return LogWidgetClass;
}(GenericWidgetClass));
var ModalDialogClass = (function (_super) {
    __extends(ModalDialogClass, _super);
    function ModalDialogClass() {
        var _this = _super.call(this) || this;
        _this._isOpen = false;
        _this.params = {};
        return _this;
    }
    ModalDialogClass_1 = ModalDialogClass;
    ModalDialogClass.open = function (tmplName, data) {
        var m = micro.insertTemplate(document.body, 'modal', data);
        m.open(tmplName, data);
    };
    ModalDialogClass.openFocus = function (obj) {
        var m = micro.insertTemplate(document.body, 'modal', {});
        m.openFocus(obj);
    };
    ModalDialogClass.next = function (tmplName, data) {
        var m = this._stack[this._stack.length - 1];
        m.next(tmplName, data);
    };
    ModalDialogClass.save = function (data) {
        var _a;
        var m = this._stack[this._stack.length - 2];
        var dlg = (_a = m._frameObj) === null || _a === void 0 ? void 0 : _a.firstElementChild;
        if (dlg.save) {
            dlg.save(data);
        }
    };
    ModalDialogClass.close = function () {
        var m = this._stack[this._stack.length - 1];
        m.close();
    };
    ModalDialogClass.prototype.connectedCallback = function () {
        _super.prototype.connectedCallback.call(this);
        this._backObj = this.querySelector('.modalBack');
        this._frameObj = this.querySelector('.modalFrame');
    };
    ModalDialogClass.prototype.open = function (tmplName, data) {
        ModalDialogClass_1._stack.push(this);
        if ((this._backObj) && (this._frameObj)) {
            var dlg = micro.insertTemplate(this._frameObj, tmplName, data);
            var fObj = dlg === null || dlg === void 0 ? void 0 : dlg.querySelector('input,button,select');
            fObj === null || fObj === void 0 ? void 0 : fObj.focus();
        }
    };
    ModalDialogClass.prototype.next = function (tmplName, data) {
        var _a;
        if ((this._backObj) && (this._frameObj)) {
            (_a = this._frameObj.firstElementChild) === null || _a === void 0 ? void 0 : _a.remove();
            var dlg = micro.insertTemplate(this._frameObj, tmplName, data);
            var fObj = dlg === null || dlg === void 0 ? void 0 : dlg.querySelector('input,button,select');
            fObj === null || fObj === void 0 ? void 0 : fObj.focus();
        }
    };
    ModalDialogClass.prototype.openFocus = function (obj) {
        if ((obj) && (obj.parentElement) && this._frameObj) {
            this._focusObj = obj;
            var r = obj.getBoundingClientRect();
            this._placeObj = createHTMLElement(obj.parentElement, 'div', {
                style: 'width:' + r.width + 'px;height:' + r.height + 'px',
                class: obj.className
            }, obj);
            var f = 4;
            f = Math.min(f, (window.innerWidth - 64) / r.width);
            f = Math.min(f, (window.innerHeight - 64) / r.height);
            var ph = createHTMLElement(this._frameObj, 'div', {
                style: 'width:' + f * r.width + 'px;height:' + f * r.height + 'px'
            });
            var pr = ph.getBoundingClientRect();
            obj.classList.add('modal-object');
            obj.style.top = pr.top + 'px';
            obj.style.left = pr.left + 'px';
            obj.style.width = pr.width + 'px';
            obj.style.height = pr.height + 'px';
        }
    };
    ModalDialogClass.prototype.on_click = function (evt) {
        var tar = evt.target;
        var ua = tar.getAttribute('u-action');
        if (ua === 'close') {
            this.close();
        }
    };
    ModalDialogClass.prototype.close = function () {
        var _a;
        if (this._focusObj) {
            var o = this._focusObj;
            o.classList.remove('modal-object');
            o.style.top = '';
            o.style.left = '';
            o.style.width = '';
            o.style.height = '';
            (_a = this._placeObj) === null || _a === void 0 ? void 0 : _a.remove();
        }
        ModalDialogClass_1._stack.pop();
        this.remove();
    };
    var ModalDialogClass_1;
    ModalDialogClass._stack = [];
    ModalDialogClass = ModalDialogClass_1 = __decorate([
        MicroControl('modal')
    ], ModalDialogClass);
    return ModalDialogClass;
}(GenericWidgetClass));
var PWMOutWidgetClass = (function (_super) {
    __extends(PWMOutWidgetClass, _super);
    function PWMOutWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._range = 255;
        _this.lastValue = null;
        return _this;
    }
    PWMOutWidgetClass.prototype.connectedCallback = function () {
        _super.prototype.connectedCallback.call(this);
        hub.subscribe(this.microid + '?*', this.newValue.bind(this));
    };
    PWMOutWidgetClass.prototype.newValue = function (_path, key, value) {
        if (key === 'range') {
            this._range = Number(value);
        }
        else if (key === 'value') {
            if (this.lastValue !== value) {
                var o = this.querySelector('.ux-levelbar');
                var h = o.offsetHeight;
                var bh = (h * Number(value)) / this._range;
                if (bh > h - 1) {
                    bh = h - 1;
                }
                if (bh < 1) {
                    bh = 1;
                }
                o.style.borderBottomWidth = bh + 'px';
                this.lastValue = value;
            }
        }
    };
    PWMOutWidgetClass = __decorate([
        MicroControl('pwmout')
    ], PWMOutWidgetClass);
    return PWMOutWidgetClass;
}(GenericWidgetClass));
var SliderWidgetClass = (function (_super) {
    __extends(SliderWidgetClass, _super);
    function SliderWidgetClass() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._slider = null;
        _this._handle = null;
        _this._lastValue = -1;
        _this._maxright = 100;
        _this._x = 0;
        _this._xOffset = 0;
        _this.unit = 1;
        _this._type = 'int';
        _this.minvalue = 0;
        _this.maxvalue = 255;
        return _this;
    }
    SliderWidgetClass.prototype.connectedCallback = function () {
        this._slider = this.querySelector('.u-slider');
        this._handle = this.querySelector('.handle');
        _super.prototype.connectedCallback.call(this);
        if (this._handle) {
            var p = this._handle.parentElement;
            var ps = getComputedStyle(p);
            this._maxright = p.clientWidth - this._handle.offsetWidth - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight);
        }
    };
    SliderWidgetClass.prototype._adjustHandle = function (val) {
        if (this._handle) {
            var left = val - this.minvalue;
            left = Math.round(left * this._maxright / (this.maxvalue - this.minvalue));
            left = Math.min(this._maxright, Math.max(0, left));
            this._handle.style.left = left + 'px';
        }
    };
    SliderWidgetClass.prototype.newData = function (path, key, value) {
        _super.prototype.newData.call(this, path, key, value);
        if (key === 'value') {
            var v = Number(value);
            if (v !== this._lastValue) {
                this._adjustHandle(v);
                this._lastValue = v;
            }
        }
        else if (key === 'min') {
            this.minvalue = Number(value);
        }
        else if (key === 'max') {
            this.maxvalue = Number(value);
        }
        else if (key === 'step') {
            this.unit = Number(value);
        }
        else if (key === 'type') {
            this._type = value;
            if (this._slider) {
                if (value === 'string') {
                    this._slider.style.display = 'none';
                }
            }
        }
    };
    SliderWidgetClass.prototype.on_click = function (e) {
        var src = e.target;
        while (src && src !== this) {
            if (src.tagName === 'LABEL' && src.classList.contains('up')) {
                this.dispatchAction('up', '1');
                break;
            }
            else if (src.tagName === 'LABEL' && src.classList.contains('down')) {
                this.dispatchAction('down', '1');
                break;
            }
            src = src.parentElement;
        }
        _super.prototype.on_click.call(this, e);
    };
    SliderWidgetClass.prototype.on_mousedown = function (evt) {
        if (evt.target === this._handle) {
            this.MoveStart(evt);
        }
    };
    SliderWidgetClass.prototype.MoveStart = function (evt) {
        this._xOffset = 0;
        var obj = this._handle.offsetParent;
        while (obj != null) {
            this._xOffset += obj.offsetLeft;
            obj = obj.offsetParent;
        }
        this._x = evt.clientX - (this._handle.offsetLeft + this._xOffset);
        this._moveFunc = this._onmousemove.bind(this);
        document.addEventListener('mousemove', this._moveFunc, false);
        this._upFunc = this._onmouseup.bind(this);
        document.addEventListener('mouseup', this._upFunc, false);
        evt.cancelBubble = true;
        evt.returnValue = false;
    };
    SliderWidgetClass.prototype._onmousemove = function (evt) {
        var left = evt.clientX - this._x - this._xOffset;
        left = Math.min(this._maxright, Math.max(0, left));
        var val = Math.round(left * (this.maxvalue - this.minvalue) / this._maxright + this.minvalue);
        val = Math.round(val / this.unit) * this.unit;
        this._adjustHandle(val);
        if (val !== this._lastValue) {
            this._lastValue = val;
            this.dispatchAction('value', String(val));
        }
    };
    SliderWidgetClass.prototype._onmouseup = function (evt) {
        evt = evt || window.event;
        document.removeEventListener('mousemove', this._moveFunc);
        document.removeEventListener('mouseup', this._upFunc);
    };
    SliderWidgetClass.prototype.on_touchstart = function (evt) {
        var t = evt.targetTouches[0].target;
        if (t === this._handle) {
            console.log('TouchStart');
        }
    };
    SliderWidgetClass = __decorate([
        MicroControl('slider')
    ], SliderWidgetClass);
    return SliderWidgetClass;
}(GenericWidgetClass));
var SwitchWidgetClass = (function (_super) {
    __extends(SwitchWidgetClass, _super);
    function SwitchWidgetClass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SwitchWidgetClass.prototype.on_click = function (e) {
        var o = this.querySelector('.u-switch');
        var src = e.srcElement;
        while (src !== null && src !== this && src !== o) {
            src = src.parentElement;
        }
        if (src === o) {
            this.dispatchAction('toggle', '1');
        }
        else {
            _super.prototype.on_click.call(this, e);
        }
    };
    SwitchWidgetClass = __decorate([
        MicroControl('switch')
    ], SwitchWidgetClass);
    return SwitchWidgetClass;
}(GenericWidgetClass));
function toBool(s) {
    if (!s) {
        return false;
    }
    switch (s.toLowerCase().trim()) {
        case 'true':
        case 'yes':
            return true;
        case 'false':
        case 'no':
        case '0':
        case null:
            return false;
        default:
            return Boolean(s);
    }
}
function toSeconds(v) {
    var ret = 0;
    v = v.toLowerCase();
    if (v.endsWith('h')) {
        ret = parseInt(v, 10) * 60 * 60;
    }
    else if (v.endsWith('m')) {
        ret = parseInt(v, 10) * 60;
    }
    else if (v.endsWith('s')) {
        ret = parseInt(v, 10);
    }
    else if (v.includes(':')) {
        ret = (Date.parse('1.1.1970 ' + v) - Date.parse('1.1.1970')) / 1000;
    }
    else {
        ret = Number(v);
    }
    return ret;
}
function setTextContent(el, txt) {
    if (el.textContent !== txt) {
        el.textContent = txt;
    }
}
function setAttr(el, name, value) {
    if (el.getAttribute(name) !== value) {
        el.setAttribute(name, value);
    }
}
function changeConfig(id, newConfig) {
    var c, node, fName;
    fName = '/env.json';
    c = JSON.parse(hub.read('env'));
    node = jsonFind(c, id);
    if (Object.keys(node).length === 0) {
        fName = '/config.json';
        c = JSON.parse(hub.read('config'));
        node = jsonFind(c, id);
    }
    for (var n in newConfig) {
        if (newConfig[n]) {
            node[n] = newConfig[n];
        }
        else {
            delete node[n];
        }
    }
    var formData = new FormData();
    formData.append(fName, new Blob([JSON.stringify(c)], { type: 'text/html' }), fName);
    fetch('/', { method: 'POST', body: formData }).then(function () {
        window.alert('saved.');
    });
}
function debounce(func, wait) {
    if (wait === void 0) { wait = 20; }
    var timer;
    return function () {
        var scope = this;
        var args = arguments;
        if (timer) {
            clearTimeout(timer);
        }
        timer = window.setTimeout(function () {
            timer = 0;
            func.apply(scope, args);
        }, wait);
    };
}
function getHashParams(defaults) {
    var params = __assign({}, defaults);
    window.location.hash
        .substr(1)
        .split('&')
        .forEach(function (p) {
        var pa = p.split('=');
        params[pa[0]] = pa[1];
    });
    return params;
}
function createHTMLElement(parentNode, tag, attr, beforeNode) {
    if (beforeNode === void 0) { beforeNode = null; }
    var o = document.createElement(tag);
    if (attr) {
        for (var a in attr) {
            if (attr.hasOwnProperty(a)) {
                o.setAttribute(a, attr[a]);
            }
        }
    }
    if (beforeNode) {
        parentNode.insertBefore(o, beforeNode);
    }
    else {
        parentNode.appendChild(o);
    }
    return (o);
}
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
    TimerWidgetClass.prototype.newData = function (path, key, value) {
        _super.prototype.newData.call(this, path, key, value);
        if (key === 'waittime') {
            this.wt = toSeconds(value);
        }
        else if (key === 'pulsetime') {
            this.pt = toSeconds(value);
        }
        else if (key === 'cycletime') {
            this.ct = toSeconds(value);
        }
        else if (key === 'time') {
            this.time = toSeconds(value);
        }
        if (this.ct < this.wt + this.pt) {
            this.ct = this.wt + this.pt;
        }
        if (this.ct > 0) {
            var el = this.querySelector('.u-bar');
            var f = el.clientWidth / this.ct;
            var pto = el.querySelector('.pulse');
            pto.style.left = Math.floor(this.wt * f) + 'px';
            pto.style.width = Math.floor(this.pt * f) + 'px';
            var cto = el.querySelector('.current');
            cto.style.width = Math.floor(this.time * f) + 'px';
        }
    };
    TimerWidgetClass = __decorate([
        MicroControl('timer')
    ], TimerWidgetClass);
    return TimerWidgetClass;
}(GenericWidgetClass));
var MicroHub = (function () {
    function MicroHub() {
        this._registrations = {};
        this._registrationsId = 0;
        this._store = {};
    }
    MicroHub.prototype.read = function (path) {
        var o = this._findStoreObject(this.pPath(path));
        return o[this.pKey(path)];
    };
    MicroHub.prototype.write = function (path, value) {
        var o = this._findStoreObject(this.pPath(path));
        o[this.pKey(path)] = value;
    };
    MicroHub.prototype.subscribe = function (matchPath, fCallback, replay) {
        if (replay === void 0) { replay = false; }
        var h = this._registrationsId;
        var rn = matchPath.toLocaleLowerCase();
        var re = '^' + rn
            .replace(/(\[|\]|\/|\?)/g, '\\$1')
            .replace(/\*\*/g, '\\S{0,}')
            .replace(/\*/g, '[^/?]*') +
            '$';
        var newEntry = {
            id: h,
            match: RegExp(re),
            callback: fCallback
        };
        this._registrations[h] = newEntry;
        this._registrationsId++;
        if (replay) {
            jsonParse(this._store, function (path, key, value) {
                var fullPath = path + (key ? '?' + key : '');
                if (fullPath) {
                    fullPath = fullPath.toLocaleLowerCase();
                    if (fullPath.match(newEntry.match)) {
                        newEntry.callback(path, key ? key.toLowerCase() : null, value);
                    }
                }
            }.bind(this));
        }
        return h;
    };
    MicroHub.prototype.unsubscribe = function (h) {
        delete this._registrations[h];
    };
    MicroHub.prototype.replay = function (h) {
        var e = this._registrations[h];
        if (e) {
            jsonParse(this._store, function (path, key, value) {
                var fullPath = path + (key ? '?' + key : '');
                if (fullPath) {
                    fullPath = fullPath.toLocaleLowerCase();
                    if (fullPath.match(e.match)) {
                        e.callback(path, key ? key.toLowerCase() : null, value);
                    }
                }
            }.bind(this));
        }
    };
    MicroHub.prototype.publishObj = function (obj) {
        jsonParse(obj, function (path, key, value) {
            this.publishValue(path, key ? key.toLowerCase() : '', value ? value : '');
        }.bind(this));
    };
    MicroHub.prototype.publishValue = function (path, key, value) {
        var fullPath = path + (key ? '?' + key : '');
        if (fullPath) {
            if (key) {
                var p = this._findStoreObject(path);
                p[key] = value;
            }
            fullPath = fullPath.toLocaleLowerCase();
            Object.values(this._registrations).forEach(function (r) {
                if (fullPath.match(r.match)) {
                    r.callback(path, key, value);
                }
            });
        }
    };
    MicroHub.prototype.onunload = function () {
        var _this = this;
        Object.getOwnPropertyNames(this._registrations).forEach(function (n) { return delete _this._registrations[n]; });
    };
    MicroHub.prototype._findStoreObject = function (path) {
        var p = this._store;
        if (path[0] === '/') {
            path = path.substr(1);
        }
        var steps = path.split('/');
        while (steps.length > 0 && p[steps[0]]) {
            p = p[steps[0]];
            steps.shift();
        }
        while (steps.length > 0 && steps[0]) {
            p = p[steps[0]] = {};
            steps.shift();
        }
        return p;
    };
    MicroHub.prototype.pPath = function (path) {
        if (path[0] === '/') {
            path = path.substr(1);
        }
        var steps = path.split('/');
        var res = steps.slice(0, steps.length - 1).join('/');
        return res;
    };
    MicroHub.prototype.pKey = function (path) {
        var steps = path.split('/');
        var res = steps[steps.length - 1];
        return res;
    };
    return MicroHub;
}());
var hub = new MicroHub();
window.addEventListener('unload', hub.onunload.bind(hub), false);
//# sourceMappingURL=micro.js.map