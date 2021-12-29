"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MicroState;
(function (MicroState) {
    MicroState[MicroState["PREP"] = 1] = "PREP";
    MicroState[MicroState["INIT"] = 2] = "INIT";
    MicroState[MicroState["LOADED"] = 3] = "LOADED";
})(MicroState || (MicroState = {}));
class MicroRegistry {
    constructor() {
        this._tco = null;
        this._registry = {};
        this._state = MicroState.PREP;
        this._unloadedList = [];
        this.List = [];
        window.addEventListener('load', this.init.bind(this));
    }
    loadFile(url) {
        const ret = fetch(url)
            .then(raw => raw.text())
            .then(htm => {
            const f = document.createRange().createContextualFragment(htm);
            if (this._tco) {
                this._tco.appendChild(f);
            }
        });
        return ret;
    }
    attach(elem) {
        if (this._state === MicroState.LOADED) {
            const cn = elem.getAttribute('u-is');
            if (cn) {
                const bc = this._registry[cn];
                if (bc) {
                    this.loadBehavior(elem, bc);
                }
            }
        }
        else {
            this._unloadedList.push(elem);
        }
    }
    _setPlaceholders(obj, props) {
        function fill(val) {
            Object.getOwnPropertyNames(props).forEach(p => val = val.replace(new RegExp('\\$\\{' + p + '\\}', 'g'), props[p]));
            return val;
        }
        if (props) {
            if (obj.nodeType === Node.TEXT_NODE) {
                if (obj.textContent) {
                    obj.textContent = fill(obj.textContent);
                }
            }
            else if (obj.nodeType === Node.ELEMENT_NODE) {
                const attr = obj.attributes;
                for (let i = 0; i < attr.length; i++) {
                    const v = attr[i].value;
                    if (v.indexOf('${') >= 0) {
                        if (!obj[attr[i].name]) {
                            obj.setAttribute(attr[i].name, fill(v));
                        }
                        else if (obj[attr[i].name].baseVal !== undefined) {
                            obj[attr[i].name].baseVal = fill(v);
                        }
                        else {
                            obj.setAttribute(attr[i].name, fill(v));
                        }
                    }
                }
                obj.childNodes.forEach(c => {
                    this._setPlaceholders(c, props);
                });
            }
        }
    }
    isVisible(el) {
        let vis = false;
        if (el.offsetWidth > 0 && el.offsetHeight > 0) {
            const rect = el.getBoundingClientRect();
            vis = (rect.top <= window.innerHeight && rect.bottom >= 0);
        }
        return (vis);
    }
    loadDataImage(imgElem) {
        if ((imgElem.dataset.src) && (this.isVisible(imgElem))) {
            imgElem.src = imgElem.dataset.src;
        }
    }
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
                root.querySelectorAll('[u-is]').forEach(el => micro.attach(el));
                this._setPlaceholders(e, props);
                root.querySelectorAll('[data-src]:not([src])').forEach(el => this.loadDataImage(el));
            }
        }
        return e;
    }
    getMethods(obj) {
        const fSet = new Set();
        do {
            Object.getOwnPropertyNames(obj)
                .filter(item => typeof obj[item] === 'function')
                .forEach(item => fSet.add(item));
        } while ((obj = Object.getPrototypeOf(obj)));
        return (fSet);
    }
    loadBehavior(obj, behavior) {
        const b = behavior;
        const oc = obj;
        if (!obj) {
            console.error('loadBehavior: obj argument is missing.');
        }
        else if (!behavior) {
            console.error('loadBehavior: behavior argument is missing.');
        }
        else if (oc._attachedBehavior === behavior) {
        }
        else {
            for (const a of obj.attributes) {
                if (!obj[a.name]) {
                    obj[a.name] = a.value;
                }
            }
            for (const p of this.getMethods(b)) {
                if (p === 'on_touchstart') {
                    obj.addEventListener(p.substring(3), b[p].bind(obj), { passive: true });
                }
                else if (p.substring(0, 3) === 'on_') {
                    obj.addEventListener(p.substring(3), b[p].bind(obj), false);
                }
                else if (p.substring(0, 2) === 'on') {
                    obj.addEventListener(p.substring(2), b[p].bind(obj), false);
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
    }
    define(name, mixin) {
        this._registry[name] = mixin;
    }
    init() {
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
    }
    init2() {
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
    }
}
const micro = new MicroRegistry();
const obs = new MutationObserver(function (mutationsList, _observer) {
    for (const mutation of mutationsList) {
        mutation.addedNodes.forEach(n => {
            const e = n;
            if (e.getAttribute && e.getAttribute('u-is')) {
                micro.attach(n);
            }
        });
    }
});
obs.observe(document, { childList: true, subtree: true });
document.addEventListener('DOMContentLoaded', function () {
    function f() { document.querySelectorAll('[data-src]:not([src])').forEach(e => micro.loadDataImage(e)); }
    window.addEventListener('scroll', f);
    window.setTimeout(f, 40);
});
class MicroControlClass {
    connectedCallback() {
    }
    _clearWhitespace() {
        var _a;
        let obj = this.firstChild;
        while (obj) {
            const nextObj = obj.nextSibling;
            if (obj.nodeType === 3) {
                (_a = obj.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(obj);
            }
            obj = nextObj;
        }
    }
}
function MicroControl(isSelector) {
    return function (target) {
        micro.define(isSelector, new target());
        return target;
    };
}
let GenericWidgetClass = class GenericWidgetClass extends MicroControlClass {
    connectedCallback() {
        super.connectedCallback();
        if (!this.microid) {
            this.microid = '';
        }
        this.data = { id: this.microid };
        this.actions = [];
        this.subId = hub.subscribe(this.microid + '?*', this.newData.bind(this));
        hub.replay(this.subId);
    }
    newData(_path, key, value) {
        if (key && value) {
            this.data[key] = value;
            const ic = this.querySelector('img,h3');
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
            this.querySelectorAll(elType + `[u-active='${key}']`).forEach(function (elem) {
                const b = toBool(value);
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
        this.querySelectorAll(`span[u-color='${key}']`).forEach(function (elem) {
            let col = value ? value.replace(/^x/, '#') : '#888';
            col = col.replace(/^#\S{2}(\S{6})$/, '#$1');
            elem.style.backgroundColor = col;
        });
    }
    dispatchNext() {
        if (this.actions) {
            const a = this.actions.shift();
            if (a) {
                const aa = a.split('=');
                const aUrl = aa[0] + '=' + encodeURIComponent(aa[1]);
                fetch(aUrl).then(() => {
                    if (this.actions.length > 0) {
                        debounce(this.dispatchNext.bind(this))();
                    }
                    else {
                        try {
                            updateAsap();
                        }
                        catch (_a) { }
                    }
                });
            }
        }
    }
    dispatchAction(prop, val) {
        if (prop && val) {
            if (prop.includes('/')) {
                prop.replace('${v}', encodeURI(val));
                prop.split(',').forEach((a) => this.actions.push('/$board/' + a));
            }
            else {
                this.actions.push(`/$board${this.microid}?${prop}=${encodeURI(val)}`);
            }
            debounce(this.dispatchNext.bind(this))();
        }
    }
    showSys() {
        const p = getHashParams({ sys: false }).sys;
        return (toBool(p));
    }
    on_change(e) {
        const src = e.target;
        this.dispatchAction(src.getAttribute('u-value'), src.value);
    }
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
        chain.every(p => {
            let ret = false;
            if (p.getAttribute('u-action')) {
                this.dispatchAction(p.getAttribute('u-action'), p.getAttribute('value') || '1');
            }
            else if (p.classList.contains('setconfig')) {
                ModalDialogClass.open('configelementdlg', this.data);
            }
            else if (p.classList.contains('setactive')) {
                this.dispatchAction(toBool(this.data.active) ? 'stop' : 'start', '1');
            }
            else if (p.classList.contains('setfocus')) {
                ModalDialogClass.openFocus(this);
            }
            else {
                ret = true;
            }
            return (ret);
        });
    }
};
GenericWidgetClass = __decorate([
    MicroControl('generic')
], GenericWidgetClass);
let BL0937WidgetClass = class BL0937WidgetClass extends GenericWidgetClass {
    connectedCallback() {
        super.connectedCallback();
        if (!this.mode) {
            this.mode = 'current';
        }
        this.data = { id: this.microid };
        this.subId = hub.subscribe(this.microid + '?mode', this.switchMode.bind(this));
        hub.replay(this.subId);
    }
    setMode(newMode) {
        if (newMode && (newMode !== this.mode)) {
            let td;
            td = this.querySelector(`[u-text="${this.mode}"]`);
            if (td === null || td === void 0 ? void 0 : td.parentElement) {
                td.parentElement.style.display = 'none';
            }
            td = this.querySelector(`span[u-text="${newMode}"]`);
            if (td === null || td === void 0 ? void 0 : td.parentElement) {
                td.parentElement.style.display = '';
            }
            this.mode = newMode;
        }
    }
    switchMode(_path, _key, value) {
        this.setMode(value);
    }
    on_click(e) {
        const src = e.target;
        if (src.getAttribute('u-action') === 'mode') {
            this.setMode(src['value']);
        }
        super.on_click(e);
    }
};
BL0937WidgetClass = __decorate([
    MicroControl('bl0937')
], BL0937WidgetClass);
let ButtonGroupWidgetClass = class ButtonGroupWidgetClass extends GenericWidgetClass {
    connectedCallback() {
        super.connectedCallback();
        this._blockElem = this.querySelector('.block');
        this._count = 0;
    }
    newData(path, key, value) {
        super.newData(path, key, value);
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
    }
};
ButtonGroupWidgetClass = __decorate([
    MicroControl('buttongroup')
], ButtonGroupWidgetClass);
let ButtonWidgetClass = class ButtonWidgetClass extends GenericWidgetClass {
    newData(path, key, value) {
        super.newData(path, key, value);
        if (key === 'onclick') {
            this._onclick = value;
        }
        else if (key === 'ondoubleclick') {
            this._ondoubleclick = value;
        }
        else if (key === 'onpress') {
            this._onpress = value;
        }
    }
    on_click() {
        if (this._duration > 800) {
            if (this._onpress) {
                this.dispatchAction(this._onpress, '1');
            }
        }
        else {
            if (this._timer) {
                window.clearTimeout(this._timer);
            }
            this._timer = window.setTimeout(() => {
                this.dispatchAction(this._onclick, '1');
            }, 250);
        }
    }
    on_dblclick() {
        if (this._timer) {
            window.clearTimeout(this._timer);
        }
        this.dispatchAction(this._ondoubleclick, '1');
    }
    on_pointerdown() {
        this._start = new Date().valueOf();
    }
    on_pointerup() {
        this._duration = new Date().valueOf() - this._start;
    }
};
ButtonWidgetClass = __decorate([
    MicroControl('button')
], ButtonWidgetClass);
let ColorWidgetClass = class ColorWidgetClass extends GenericWidgetClass {
    connectedCallback() {
        super.connectedCallback();
        this._value = '00000000';
        this._hasWhite = false;
        this._colObj = this.querySelector('.color') || { style: {} };
        this._hObj = this.querySelector('.hue') || {};
        this._sObj = this.querySelector('.band.saturation') || { style: {} };
        this._lObj = this.querySelector('.band.lightness') || { style: {} };
        this._wObj = this.querySelector('.white') || {};
    }
    newData(_path, key, value) {
        let newValue = this._value;
        if (!value) {
        }
        else if (key === 'value') {
            newValue = this.normColor(value);
            if (newValue !== this._value) {
                this._value = newValue;
                const rgbw = this.wrgb(newValue);
                const hsl = this.toHSL(rgbw);
                this._hObj.value = hsl.h;
                this._sObj.value = hsl.s;
                this._lObj.value = hsl.l;
                this._update();
            }
        }
        else if (key === 'config') {
            this._hasWhite = true;
            if (this._wObj) {
                this._wObj.style.display = this._hasWhite ? '' : 'none';
            }
        }
        super.newData(_path, key, value);
    }
    on_input() {
        this._value = this.to16(parseInt(this._wObj.value, 10))
            + this.HSLToColor(this._hObj.value, this._sObj.value, this._lObj.value);
        this._update();
        this.dispatchAction('value', 'x' + this._value);
    }
    _update() {
        const rgbw = this.wrgb(this._value);
        const hsl = this.toHSL(rgbw);
        const fullColor = this.HSLToColor(hsl.h, 100, 50);
        this._sObj.style.background = `linear-gradient(to right, #808080 0%, #${fullColor} 100%)`;
        this._lObj.style.background = `linear-gradient(to right, #000 0%, #${fullColor} 50%, #fff 100%)`;
        this._colObj.style.backgroundColor = `#${this._value.substring(2)}`;
        this._wObj.value = String(rgbw.w);
    }
    normColor(color) {
        if ((!color) || (color.length === 0)) {
            color = '00000000';
        }
        else {
            if ((color.substring(0, 1) === 'x') || (color.substring(0, 1) === '#')) {
                color = color.substring(1);
            }
            if (color.length === 6) {
                color = '00' + color;
            }
        }
        return (color);
    }
    wrgb(col) {
        return ({
            w: parseInt(col.substring(0, 2), 16),
            r: parseInt(col.substring(2, 4), 16),
            g: parseInt(col.substring(4, 6), 16),
            b: parseInt(col.substring(6, 8), 16)
        });
    }
    toHSL(rgb) {
        const hsl = { h: 0, s: 0, l: 0 };
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const l = Math.max(r, g, b);
        const s = l - Math.min(r, g, b);
        const h = s
            ? l === r
                ? (g - b) / s
                : l === g
                    ? 2 + (b - r) / s
                    : 4 + (r - g) / s
            : 0;
        hsl.h = Math.round(60 * h < 0 ? 60 * h + 360 : 60 * h);
        hsl.s = Math.round(100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0));
        hsl.l = Math.round((100 * (2 * l - s)) / 2);
        return (hsl);
    }
    HSLToColor(h, s, l) {
        s /= 100;
        l /= 100;
        const k = (n) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        const rgb = {
            r: Math.round(255 * f(0)),
            g: Math.round(255 * f(8)),
            b: Math.round(255 * f(4)),
            w: 0
        };
        return this.toRGBColor(rgb);
    }
    to16(d) {
        let x = d.toString(16);
        if (x.length === 1) {
            x = '0' + x;
        }
        return (x);
    }
    toRGBColor(rgbw) {
        const col = this.to16(rgbw.r) + this.to16(rgbw.g) + this.to16(rgbw.b);
        return (col);
    }
};
ColorWidgetClass = __decorate([
    MicroControl('color')
], ColorWidgetClass);
let DSTimeWidgetClass = class DSTimeWidgetClass extends GenericWidgetClass {
    connectedCallback() {
        super.connectedCallback();
        this._nowObj = this.querySelector('.setnow');
        window.setInterval(function () {
            setTextContent(this._nowObj, this.isoDate());
        }.bind(this), 200);
    }
    on_click(e) {
        const src = e.target;
        if ((src) && (src.classList.contains('setnow'))) {
            this.dispatchAction('time', this.isoDate());
        }
        else {
            super.on_click(e);
        }
    }
    isoDate() {
        function pad02(num) {
            return (((num < 10) ? '0' : '') + num);
        }
        const d = new Date();
        const ds = d.getFullYear() + '-' + pad02(d.getMonth() + 1) + '-' + pad02(d.getDate()) +
            ' ' + pad02(d.getHours()) + ':' + pad02(d.getMinutes()) + ':' + pad02(d.getSeconds());
        return (ds);
    }
};
DSTimeWidgetClass = __decorate([
    MicroControl('dstime')
], DSTimeWidgetClass);
let DisplayDotWidgetClass = class DisplayDotWidgetClass extends GenericWidgetClass {
    connectedCallback() {
        super.connectedCallback();
        this._dispElem = document.querySelector('#panel .display');
        if (this._dispElem) {
            this._elem = createHTMLElement(this._dispElem, 'span', { class: 'dot' });
            this.updateElem();
        }
        if (!this.showSys()) {
            this.style.display = 'none';
        }
        this._x = 0;
        this._y = 0;
        this._value = false;
    }
    newData(path, key, value) {
        super.newData(path, key, value);
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
    }
    updateElem() {
        if (this._elem) {
            this._elem.style.top = this._y + 'px';
            this._elem.style.left = this._x + 'px';
            this._elem.classList.toggle('active', this._value);
        }
    }
};
DisplayDotWidgetClass = __decorate([
    MicroControl('displaydot')
], DisplayDotWidgetClass);
let DisplayLineWidgetClass = class DisplayLineWidgetClass extends GenericWidgetClass {
    connectedCallback() {
        super.connectedCallback();
        this._dispElem = document.querySelector('#panel .display');
        if (this._dispElem) {
            this._elem = createHTMLElement(this._dispElem, 'span', { class: 'line' });
            this.updateElem();
        }
        if (!this.showSys()) {
            this.style.display = 'none';
        }
        this._x0 = 0;
        this._x1 = 0;
        this._y0 = 0;
        this._y1 = 0;
    }
    newData(path, key, value) {
        super.newData(path, key, value);
        if (key && value && this._elem) {
            if (key === 'page') {
                this._elem.setAttribute('displayPage', value);
            }
            else if (this['_' + key] != null) {
                this['_' + key] = value;
            }
            this.updateElem();
        }
    }
    updateElem() {
        if (this._elem) {
            this._elem.style.top = this._y0 + 'px';
            this._elem.style.left = this._x0 + 'px';
            this._elem.style.width = (this._x1 - this._x0) + 'px';
            this._elem.style.height = (this._y1 - this._y0) + 'px';
        }
    }
};
DisplayLineWidgetClass = __decorate([
    MicroControl('displayline')
], DisplayLineWidgetClass);
let DisplayTextWidgetClass = class DisplayTextWidgetClass extends GenericWidgetClass {
    connectedCallback() {
        super.connectedCallback();
        this._dispElem = document.querySelector('#panel .display');
        if (this._dispElem) {
            this._grid = Number(this._dispElem.getAttribute('grid') || 1);
            this._elem = createHTMLElement(this._dispElem, 'span', { class: 'text', style: 'top:0;left:0;display:none' });
        }
        if (!this.showSys()) {
            this.style.display = 'none';
        }
        this._prefix = '';
        this._postfix = '';
    }
    newData(path, key, value) {
        super.newData(path, key, value);
        if (key && value && this._elem) {
            if (key === 'value') {
                const t = `${this._prefix}${value}${this._postfix}`.replace(/ /g, '&nbsp;');
                if (this._elem.innerHTML !== t) {
                    this._elem.innerHTML = t;
                }
            }
            else if (key === 'page') {
                this._elem.setAttribute('displayPage', value);
            }
            else if (key === 'x') {
                const n = Number(value) * this._grid;
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
    }
};
DisplayTextWidgetClass = __decorate([
    MicroControl('displaytext')
], DisplayTextWidgetClass);
let DisplayWidgetClass = class DisplayWidgetClass extends GenericWidgetClass {
    connectedCallback() {
        super.connectedCallback();
        this._page = '';
        this._dialogElem = this.querySelector('.display');
    }
    newData(path, key, value) {
        var _a;
        super.newData(path, key, value);
        if (key && value) {
            if (key === 'page') {
                if (value !== this._page) {
                    this._page = value;
                    (_a = this._dialogElem) === null || _a === void 0 ? void 0 : _a.querySelectorAll(':scope > span').forEach((e) => {
                        const p = e.getAttribute('displayPage') || '1';
                        e.style.display = (p === this._page) ? '' : 'none';
                    });
                }
            }
        }
    }
};
DisplayWidgetClass = __decorate([
    MicroControl('display')
], DisplayWidgetClass);
let IncludeWidgetClass = class IncludeWidgetClass extends MicroControlClass {
    connectedCallback() {
        const obj = document.querySelector('#u-templates ' + this.ref);
        if (obj) {
            const e = obj.cloneNode(true);
            const root = this.parentElement;
            root === null || root === void 0 ? void 0 : root.replaceChild(e, this);
        }
    }
};
IncludeWidgetClass = __decorate([
    MicroControl('include')
], IncludeWidgetClass);
let InputWidgetClass = class InputWidgetClass extends MicroControlClass {
    connectedCallback() {
        const inObj = this.querySelector('input');
        this._input = this;
        if ((this.tagName !== 'INPUT') && inObj) {
            this._input = inObj;
        }
        super.connectedCallback();
        let type = this._input.getAttribute('type') || 'text';
        if ((type === 'range') && (this._input.classList.contains('switch'))) {
            type = 'switch';
            this._input.min = '0';
            this._input.max = '1';
        }
        this._type = type;
        this._value = this._input.value;
        this._clearWhitespace();
    }
    _check() {
        let newVal = this._value;
        const t = this._type;
        if (t === 'checkbox') {
            newVal = this._input.checked ? '1' : '0';
        }
        else if ((t === 'range') || (t === 'switch')) {
            newVal = this._input.value;
        }
        if (newVal !== this._value) {
            this._value = newVal;
            this._input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    on_change() {
        this._check();
    }
    on_click(e) {
        let src = e.target;
        this._value = this._input.value;
        while (src) {
            if ((this._type === 'range') || (this._type === 'switch')) {
                const cl = src.classList;
                if (cl.contains('up')) {
                    const nv = Number(this._input.value) + (Number((this._input.step) || 1));
                    this._input.value = String(nv);
                    break;
                }
                else if (cl.contains('down')) {
                    const nv = Number(this._input.value) - (Number((this._input.step) || 1));
                    this._input.value = String(nv);
                    break;
                }
            }
            if (this._type === 'switch') {
                if (src === this._input || src === this) {
                    this._input.value = String(1 - Number(this._input.value));
                    break;
                }
            }
            if (src === this) {
                break;
            }
            else {
                src = src.parentElement;
            }
        }
        this._input.focus();
        this._check();
    }
};
InputWidgetClass = __decorate([
    MicroControl('input')
], InputWidgetClass);
function jsonParse(obj, cbFunc) {
    function _jsonParse(path, key, value) {
        let path2 = key ? path + '/' + key : path;
        path2 = path2.replace('/[', '[');
        if (Array.isArray(value)) {
            for (let n = 0; n < value.length; n++) {
                _jsonParse(path2, '[' + n + ']', value[n]);
            }
        }
        else if (typeof value === 'object') {
            cbFunc(path2, null, null);
            Object.getOwnPropertyNames(value).forEach(k => _jsonParse(path2, k, value[k]));
        }
        else {
            cbFunc(path, key, String(value));
        }
    }
    _jsonParse('', '', obj);
}
function jsonFind(obj, path) {
    if (path[0] === '/') {
        path = path.substring(1);
    }
    const steps = path.split('/');
    while (obj && steps.length > 0) {
        const n = steps[0].toLowerCase();
        const p = Object.keys(obj).find(e => (e.toLowerCase() === n));
        obj = (p ? obj[p] : undefined);
        steps.shift();
    }
    return obj;
}
function jsonLocate(obj, path) {
    if (path[0] === '/') {
        path = path.substring(1);
    }
    const steps = path.split('/');
    while (obj && steps.length > 0) {
        const n = steps[0];
        const p = Object.keys(obj).find(e => (e.toLowerCase() === n.toLowerCase()));
        obj = (p ? obj[p] : (obj[n] = {}));
        steps.shift();
    }
    return obj;
}
let LogWidgetClass = class LogWidgetClass extends GenericWidgetClass {
    connectedCallback() {
        super.connectedCallback();
        this._SVGObj = this.querySelector('object');
        this._xFormat = 'datetime';
        this._yFormat = 'num';
    }
    loadData() {
        const fName = this._fName;
        let allData = '';
        const p1 = fetch(fName, { cache: 'no-store' })
            .then(function (result) {
            return result.text();
        })
            .then(function (txt) {
            allData = allData + '\n' + txt;
        });
        const p2 = fetch(fName.replace('.txt', '_old.txt'), { cache: 'no-store' })
            .then(function (result) {
            return result.text();
        })
            .then(function (txt) {
            allData = txt + '\n' + allData;
        })
            .catch(function () {
        });
        Promise.allSettled([p1, p2]).then(function () {
            const re = /^\d{4,},\d+/;
            const pmArray = allData.split('\n').filter(function (e) {
                return e.match(re);
            });
            this._api.draw(this._chart, pmArray.map(function (v) {
                const p = v.split(',');
                return { x: p[0], y: p[1] };
            }));
        }.bind(this));
    }
    loadSVG() {
        let done = false;
        if (this._SVGObj) {
            let svgObj = null;
            try {
                svgObj = (this._SVGObj.getSVGDocument());
            }
            catch (err) { }
            if ((svgObj) && (svgObj.api)) {
                this._api = this._SVGObj.getSVGDocument().api;
                this._chart = this._api.add('line', { linetype: 'line' });
                this._api.add(['VAxis',
                    { type: 'hAxis', options: { format: 'datetime' } },
                    { type: 'indicator', options: { xFormat: this._xFormat, yFormat: this._yFormat } },
                ]);
                this.loadData();
                done = true;
            }
        }
        if (!done) {
            window.setTimeout(this.loadSVG.bind(this), 1000);
        }
    }
    newData(path, key, value) {
        super.newData(path, key, value);
        if (key === 'filename') {
            this._fName = value;
            this.loadSVG();
        }
        else if (key === 'xformat') {
            this._xFormat = value;
        }
        else if (key === 'yformat') {
            this._yFormat = value;
        }
    }
};
LogWidgetClass = __decorate([
    MicroControl('log')
], LogWidgetClass);
var ModalDialogClass_1;
let ModalDialogClass = ModalDialogClass_1 = class ModalDialogClass extends MicroControlClass {
    static open(tmplName, data) {
        const m = micro.insertTemplate(document.body, 'modal', data);
        m.open(tmplName, data);
    }
    static openFocus(obj) {
        const m = micro.insertTemplate(document.body, 'modal', {});
        m.openFocus(obj);
    }
    static next(tmplName, data) {
        const m = this._stack[this._stack.length - 1];
        m.next(tmplName, data);
    }
    static save(data) {
        var _a;
        const m = this._stack[this._stack.length - 2];
        const dlg = (_a = m._frameObj) === null || _a === void 0 ? void 0 : _a.firstElementChild;
        if (dlg.save) {
            dlg.save(data);
        }
    }
    static close() {
        const m = this._stack[this._stack.length - 1];
        m.close();
    }
    connectedCallback() {
        super.connectedCallback();
        this._frameObj = this.querySelector('.modalFrame');
    }
    _handleEsc(e) {
        if ((e.key === 'Escape') && (ModalDialogClass_1._stack[ModalDialogClass_1._stack.length - 1] === this)) {
            this.close();
        }
    }
    open(tmplName, data) {
        ModalDialogClass_1._stack.push(this);
        this._keyHandler = this._handleEsc.bind(this);
        document.addEventListener('keydown', this._keyHandler);
        const dlg = micro.insertTemplate(this._frameObj, tmplName, data);
        const fObj = dlg === null || dlg === void 0 ? void 0 : dlg.querySelector('input,button,select');
        fObj === null || fObj === void 0 ? void 0 : fObj.focus();
    }
    next(tmplName, data) {
        var _a;
        (_a = this._frameObj.firstElementChild) === null || _a === void 0 ? void 0 : _a.remove();
        const dlg = micro.insertTemplate(this._frameObj, tmplName, data);
        const fObj = dlg === null || dlg === void 0 ? void 0 : dlg.querySelector('input,button,select');
        fObj === null || fObj === void 0 ? void 0 : fObj.focus();
    }
    openFocus(obj) {
        ModalDialogClass_1._stack.push(this);
        if ((obj) && (obj.parentElement)) {
            this._keyHandler = this._handleEsc.bind(this);
            document.addEventListener('keydown', this._keyHandler);
            this._focusObj = obj;
            const r = obj.getBoundingClientRect();
            this._placeObj = createHTMLElement(obj.parentElement, 'div', {
                style: 'width:' + r.width + 'px;height:' + r.height + 'px',
                class: obj.className
            }, obj);
            let f = 4;
            f = Math.min(f, (window.innerWidth - 64) / r.width);
            f = Math.min(f, (window.innerHeight - 64) / r.height);
            const ph = createHTMLElement(this._frameObj, 'div', {
                style: 'width:' + f * r.width + 'px;height:' + f * r.height + 'px'
            });
            const pr = ph.getBoundingClientRect();
            obj.classList.add('modal-object');
            obj.style.top = pr.top + 'px';
            obj.style.left = pr.left + 'px';
            obj.style.width = pr.width + 'px';
            obj.style.height = pr.height + 'px';
        }
    }
    on_click(evt) {
        const tar = evt.target;
        const ua = tar.getAttribute('u-action');
        if (ua === 'close') {
            this.close();
        }
    }
    close() {
        var _a;
        document.removeEventListener('keydown', this._keyHandler);
        if (this._focusObj) {
            const o = this._focusObj;
            o.classList.remove('modal-object');
            o.style.top = '';
            o.style.left = '';
            o.style.width = '';
            o.style.height = '';
            (_a = this._placeObj) === null || _a === void 0 ? void 0 : _a.remove();
        }
        ModalDialogClass_1._stack.pop();
        this.remove();
    }
};
ModalDialogClass._stack = [];
ModalDialogClass = ModalDialogClass_1 = __decorate([
    MicroControl('modal')
], ModalDialogClass);
let PWMOutWidgetClass = class PWMOutWidgetClass extends GenericWidgetClass {
    connectedCallback() {
        super.connectedCallback();
        hub.subscribe(this.microid + '?*', this.newValue.bind(this));
        this._range = 255;
        this._last = '';
    }
    newValue(_path, key, value) {
        if (!value) {
        }
        else if (key === 'range') {
            this._range = Number(value);
        }
        else if (key === 'value') {
            if (this._last !== value) {
                const o = this.querySelector('.ux-levelbar');
                const h = o.offsetHeight;
                let bh = (h * Number(value)) / this._range;
                if (bh > h - 1) {
                    bh = h - 1;
                }
                if (bh < 1) {
                    bh = 1;
                }
                o.style.borderBottomWidth = bh + 'px';
                this._last = value;
            }
        }
    }
};
PWMOutWidgetClass = __decorate([
    MicroControl('pwmout')
], PWMOutWidgetClass);
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
    let ret = 0;
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
    let c, node, fName;
    fName = '/env.json';
    c = JSON.parse(hub.read('env'));
    node = jsonFind(c, id);
    if (!node) {
        fName = '/config.json';
        c = JSON.parse(hub.read('config'));
        node = jsonLocate(c, id);
    }
    for (const n in newConfig) {
        const rn = Object.keys(node).find(e => (e.toLowerCase() === n.toLowerCase()));
        if (newConfig[n]) {
            node[rn || n] = newConfig[n];
        }
        else {
            delete node[n];
        }
    }
    const formData = new FormData();
    formData.append(fName, new Blob([JSON.stringify(c)], { type: 'text/html' }), fName);
    fetch('/', { method: 'POST', body: formData }).then(function () {
        window.alert('saved.');
    });
}
function debounce(func, wait = 20) {
    let timer;
    return function () {
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
    const params = Object.assign({}, defaults);
    window.location.hash
        .substring(1)
        .split('&')
        .forEach(function (p) {
        const pa = p.split('=');
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
    if (beforeNode) {
        parentNode.insertBefore(o, beforeNode);
    }
    else {
        parentNode.appendChild(o);
    }
    return (o);
}
let TimerWidgetClass = class TimerWidgetClass extends GenericWidgetClass {
    constructor() {
        super(...arguments);
        this.wt = 0;
        this.pt = 0;
        this.ct = 0;
        this.time = 0;
    }
    newData(path, key, value) {
        super.newData(path, key, value);
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
            const el = this.querySelector('.u-bar');
            const f = el.clientWidth / this.ct;
            const pto = el.querySelector('.pulse');
            pto.style.left = Math.floor(this.wt * f) + 'px';
            pto.style.width = Math.floor(this.pt * f) + 'px';
            const cto = el.querySelector('.current');
            cto.style.width = Math.floor(this.time * f) + 'px';
        }
    }
};
TimerWidgetClass = __decorate([
    MicroControl('timer')
], TimerWidgetClass);
class MicroHub {
    constructor() {
        this._registrations = {};
        this._registrationsId = 0;
        this._store = {};
    }
    read(path) {
        const o = this._findStoreObject(this.pPath(path));
        return o[this.pKey(path)];
    }
    write(path, value) {
        const o = this._findStoreObject(this.pPath(path));
        o[this.pKey(path)] = value;
    }
    subscribe(matchPath, fCallback, replay = false) {
        const h = this._registrationsId;
        const rn = matchPath.toLocaleLowerCase();
        const re = '^' + rn
            .replace(/(\[|\]|\/|\?)/g, '\\$1')
            .replace(/\*\*/g, '\\S{0,}')
            .replace(/\*/g, '[^/?]*') +
            '$';
        const newEntry = {
            id: h,
            match: RegExp(re),
            callback: fCallback
        };
        this._registrations[h] = newEntry;
        this._registrationsId++;
        if (replay) {
            jsonParse(this._store, function (path, key, value) {
                let fullPath = path + (key ? '?' + key : '');
                if (fullPath) {
                    fullPath = fullPath.toLocaleLowerCase();
                    if (fullPath.match(newEntry.match)) {
                        newEntry.callback(path, key ? key.toLowerCase() : null, value);
                    }
                }
            }.bind(this));
        }
        return h;
    }
    unsubscribe(h) {
        delete this._registrations[h];
    }
    replay(h) {
        const e = this._registrations[h];
        if (e) {
            jsonParse(this._store, function (path, key, value) {
                let fullPath = path + (key ? '?' + key : '');
                if (fullPath) {
                    fullPath = fullPath.toLocaleLowerCase();
                    if (fullPath.match(e.match)) {
                        e.callback(path, key ? key.toLowerCase() : null, value);
                    }
                }
            }.bind(this));
        }
    }
    publishObj(obj) {
        jsonParse(obj, function (path, key, value) {
            this.publishValue(path, key ? key.toLowerCase() : '', value ? value : '');
        }.bind(this));
    }
    publishValue(path, key, value) {
        let fullPath = path + (key ? '?' + key : '');
        if (fullPath) {
            if (key) {
                const p = this._findStoreObject(path);
                p[key] = value;
            }
            fullPath = fullPath.toLocaleLowerCase();
            Object.values(this._registrations).forEach(r => {
                if (fullPath.match(r.match)) {
                    r.callback(path, key, value);
                }
            });
        }
    }
    onunload() {
        Object.getOwnPropertyNames(this._registrations).forEach(n => delete this._registrations[n]);
    }
    _findStoreObject(path) {
        let p = this._store;
        if (path[0] === '/') {
            path = path.substring(1);
        }
        const steps = path.split('/');
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
    pPath(path) {
        if (path[0] === '/') {
            path = path.substring(1);
        }
        const steps = path.split('/');
        const res = steps.slice(0, steps.length - 1).join('/');
        return res;
    }
    pKey(path) {
        const steps = path.split('/');
        const res = steps[steps.length - 1];
        return res;
    }
}
const hub = new MicroHub();
window.addEventListener('unload', hub.onunload.bind(hub), false);
//# sourceMappingURL=micro.js.map