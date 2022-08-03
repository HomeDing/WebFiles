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
        console.log("reg()");
        this._state = MicroState.INIT;
        window.addEventListener('DOMContentLoaded', this.init.bind(this));
    }
    loadFile(url) {
        console.log("reg-loadFile:", url);
        const ret = fetch(url)
            .then(raw => raw.text())
            .then(htm => {
            console.log("reg-txt.");
            const f = document.createRange().createContextualFragment(htm);
            if (!this._tco) {
                this._tco = document.getElementById('u-templates');
            }
            if (!this._tco) {
                this._tco = createHTMLElement(document.body, 'div', { id: 'u-templates' });
            }
            if (this._tco) {
                this._tco.appendChild(f);
                console.log("reg-done.");
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
        if ((imgElem.dataset['src']) && (this.isVisible(imgElem))) {
            imgElem.src = imgElem.dataset['src'];
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
        this._state = MicroState.LOADED;
        if (!this._tco) {
            this._tco = document.getElementById('u-templates');
        }
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
var GenericWidgetClass_1;
let GenericWidgetClass = GenericWidgetClass_1 = class GenericWidgetClass extends MicroControlClass {
    uid(obj) {
        if (!obj.id) {
            obj.id = 'o' + (GenericWidgetClass_1.idc++);
        }
        return (obj.id);
    }
    connectedCallback() {
        super.connectedCallback();
        this.querySelectorAll('label:not([for])+input').forEach(iObj => {
            const lObj = iObj.previousElementSibling;
            lObj.htmlFor = this.uid(iObj);
        });
        this.querySelectorAll('label:not([for])+div input').forEach(iObj => {
            var _a;
            const lObj = (_a = iObj.parentElement) === null || _a === void 0 ? void 0 : _a.previousElementSibling;
            lObj.htmlFor =
                this.uid(iObj);
        });
        if (!this.microid) {
            this.microid = '';
        }
        this.data = { id: this.microid };
        this.actions = [];
        this.subId = hub.subscribe(this.microid + '?*', this.newData.bind(this));
        hub.replay(this.subId);
    }
    newData(_path, key, value) {
        this.data[key] = value;
        const ic = this.querySelector('img,h3');
        if (ic) {
            setAttr(ic, 'title', JSON.stringify(this.data, null, 1)
                .replace('{\n', '')
                .replace('\n}', ''));
        }
        if (key === 'active') {
            this.classList.toggle('active', toBool(value));
        }
        ['span', 'div'].forEach(elType => {
            this.querySelectorAll(`${elType}[u-active='${key}']`).forEach(function (elem) {
                const b = toBool(value);
                setAttr(elem, 'value', b ? '1' : '0');
                setAttr(elem, 'title', b ? 'active' : 'not active');
                elem.classList.toggle('active', b);
            });
        });
        this.querySelectorAll(`*[u-display='${key}']`).forEach(elem => {
            elem.style.display = (value ? '' : 'none');
        });
        this.querySelectorAll(`*[u-text='${key}']`).forEach(elem => {
            if (elem.textContent !== value) {
                elem.textContent = value;
            }
        });
        ['input', 'select'].forEach(elType => {
            this.querySelectorAll(`${elType}[u-value='${key}']`)
                .forEach(elem => {
                if (elem.type === 'radio') {
                    elem.checked = elem.value === value;
                }
                else if (elem.value !== value) {
                    elem.value = value ? value : '';
                }
            });
        });
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
                            window.updateState();
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
                const ti = this.microid.split('/');
                DialogFormClass.openModalForm('configElement', Object.assign(Object.assign({}, this.data), { type: ti[1], id: ti[2] }));
            }
            else if (p.classList.contains('setactive')) {
                this.dispatchAction(toBool(this.data.active) ? 'stop' : 'start', '1');
            }
            else if (p.classList.contains('fullscreen')) {
                this.requestFullscreen();
            }
            else {
                ret = true;
            }
            return (ret);
        });
    }
};
GenericWidgetClass.idc = 42;
GenericWidgetClass = GenericWidgetClass_1 = __decorate([
    MicroControl('generic')
], GenericWidgetClass);
let BL0937WidgetClass = class BL0937WidgetClass extends GenericWidgetClass {
    connectedCallback() {
        super.connectedCallback();
        this.data = { id: this.microid };
        hub.replay(this.subId);
    }
    newData(path, key, value) {
        super.newData(path, key, value);
        if (key === 'mode') {
            ['current', 'voltage'].forEach(m => {
                const td = this.querySelector(`[u-text="${m}"]`);
                td.parentElement.style.display = (m === value ? '' : 'none');
            });
        }
    }
};
BL0937WidgetClass = __decorate([
    MicroControl('bl0937')
], BL0937WidgetClass);
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
        this._color = 'x000000';
        this._white = undefined;
    }
    newData(_path, key, value) {
        super.newData(_path, key, value);
        if (key === 'value') {
            const newValue = this.normColor(value);
            if (newValue.match(/[0-9a-z]{8}/)) {
                this._color = '#' + newValue.substring(2);
            }
            else {
                this._color = newValue;
            }
            this._white = parseInt(newValue.substring(0, 2), 16);
            if (newValue !== this._value) {
                this._value = newValue;
                this.querySelectorAll('*[name=value]').forEach(e => { e.value = value; });
                this.querySelectorAll('*[name=color]').forEach(e => {
                    e.value = this._color;
                });
                this.querySelectorAll('*[name=white]').forEach(e => { e.value = String(this._white); });
            }
        }
        else if (key === 'brightness') {
            this._brightness = parseInt(value, 10);
            this.querySelectorAll('*[name=brightness]').forEach(e => {
                e.value = String(this._brightness);
            });
        }
        else if (key === 'config') {
            if (value.toLowerCase() === 'wrgb') {
                let o = this.querySelector('input[name=white]');
                if (o)
                    o = o.parentElement;
                if (o && o.previousElementSibling) {
                    o.style.display = '';
                    o.previousElementSibling.style.display = '';
                }
            }
        }
    }
    on_input(evt) {
        const n = evt.target.name;
        const val = evt.target.value;
        if (n === 'brightness') {
            this._brightness = parseInt(val, 10);
            this.dispatchAction(n, val);
        }
        else if (n === 'white') {
            this._white = parseInt(val, 10);
            const v = 'x' + this.to16(this._white) + this._color.substring(1);
            this.dispatchAction('value', v);
        }
        else if (n === 'color') {
            this._color = val;
            let v = this._color.substring(1);
            if (this._white) {
                v = this.to16(this._white) + v;
            }
            this.dispatchAction('value', 'x' + v);
        }
    }
    normColor(color) {
        if ((!color) || (color.length === 0)) {
            color = '00000000';
        }
        else {
            color = color.toLowerCase();
            if (color === 'black') {
                color = '000000';
            }
            if (color === 'red') {
                color = 'ff0000';
            }
            if (color === 'green') {
                color = '00ff00';
            }
            if (color === 'blue') {
                color = '0000ff';
            }
            if (color === 'white') {
                color = 'ffffff';
            }
            if ((color.substring(0, 1) === 'x') || (color.substring(0, 1) === '#')) {
                color = color.substring(1);
            }
            if (color.length === 6) {
                color = '00' + color;
            }
        }
        return (color.toLowerCase());
    }
    to16(d) {
        let x = d.toString(16);
        if (x.length === 1) {
            x = '0' + x;
        }
        return (x);
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
var DialogFormClass_1;
let DialogFormClass = DialogFormClass_1 = class DialogFormClass extends MicroControlClass {
    constructor() {
        super(...arguments);
        this._defaultData = {};
        this._data = {};
        this._form = undefined;
        this._callback = undefined;
    }
    static openModalForm(id, data = {}, cb) {
        const dlg = document.querySelector('dialog#' + id);
        if (dlg)
            dlg.openModalForm(data, cb);
    }
    connectedCallback() {
        super.connectedCallback();
        const f = this.querySelector('form');
        if (f) {
            this._form = f;
            this._defaultData = this._formData();
        }
    }
    openModalForm(data = {}, cb) {
        this._data = Object.assign({}, this._defaultData, data);
        this.returnValue = '';
        this._callback = cb;
        this.dispatchEvent(new CustomEvent("open", {
            detail: {
                dialog: this,
                data: this._data,
                form: this._form
            },
            bubbles: true,
            cancelable: true,
            composed: false,
        }));
        this.querySelectorAll('*[u-text]').forEach((e) => {
            const key = e.getAttribute('u-text');
            if (key) {
                e.textContent = data[key];
            }
        });
        if (this._form) {
            const fields = this._form.querySelectorAll('*[name]');
            fields.forEach((f) => {
                if ((f.tagName == 'INPUT') || (f.tagName == 'SELECT')) {
                    const val = data[f.name];
                    if (val) {
                        f.value = val;
                    }
                }
            });
        }
        this.showModal();
    }
    on_click(evt) {
        const tar = evt.target;
        const ua = tar.getAttribute('u-action');
        if (ua === 'close') {
            this.returnValue = 'cancel';
            this.close();
        }
    }
    on_submit(evt) {
        const uSub = evt.submitter;
        if (uSub && this._form) {
            const ret = this._formData();
            const ua = uSub.getAttribute('u-action');
            if (ua === null || ua === void 0 ? void 0 : ua.startsWith('next:')) {
                this.returnValue = 'ok';
                const nextID = ua.substring(5);
                DialogFormClass_1.openModalForm(nextID, ret);
            }
            else if (ua === 'return') {
                if (this._callback) {
                    this._callback(ret);
                }
            }
            else if (ua === 'done') {
                this.returnValue = 'ok';
            }
            else {
                evt.preventDefault();
            }
        }
    }
    on_cancel(_evt) {
        this.returnValue = 'cancel';
    }
    _formData() {
        let ret = {};
        if (this._form) {
            const fd = new FormData(this._form);
            ret = Object.fromEntries(fd.entries());
        }
        return (ret);
    }
};
DialogFormClass = DialogFormClass_1 = __decorate([
    MicroControl('dialogform')
], DialogFormClass);
let DisplayDotWidgetClass = class DisplayDotWidgetClass extends GenericWidgetClass {
    connectedCallback() {
        super.connectedCallback();
        this._dispElem = document.querySelector('.panel .display');
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
        if (this._elem) {
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
        this._dispElem = document.querySelector('.panel .display');
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
        if (this._elem) {
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
        this._dispElem = document.querySelector('.panel .display');
        if (this._dispElem) {
            this._grid = Number(this._dispElem.getAttribute('grid') || 1);
            this._elem = createHTMLElement(this._dispElem, 'span', { class: 'text', style: 'top:0;left:0' });
        }
        if (!this.showSys()) {
            this.style.display = 'none';
        }
        this._prefix = '';
        this._postfix = '';
    }
    newData(path, key, value) {
        super.newData(path, key, value);
        if (this._elem) {
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
                this._elem.style.left = value + (this._grid > 1 ? 'ch' : 'px');
            }
            else if (key === 'y') {
                this._elem.style.top = value + (this._grid > 1 ? 'em' : 'px');
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
            cbFunc(path2, '', '');
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
        this._lineType = 'line';
        this._xFormat = 'datetime';
        this._yFormat = 'num';
    }
    loadData() {
        const fName = this._fName;
        let allData = '';
        const p1 = fetch(fName, { cache: 'no-store' })
            .then(res => {
            if (res.ok) {
                return res.text();
            }
            throw new Error();
        })
            .then(function (txt) {
            allData = allData + '\n' + txt;
        });
        const p2 = fetch(fName.replace('.txt', '_old.txt'), { cache: 'no-store' })
            .then(res => {
            if (res.ok) {
                return res.text();
            }
            throw new Error();
        })
            .then(function (txt) {
            allData = txt + '\n' + allData;
        });
        Promise.allSettled([p1, p2]).then(function () {
            const re = /^\d{4,},\d+/;
            const pmArray = allData.split('\n').filter(e => e.match(re));
            this._api.draw(this._chart, pmArray.map(v => {
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
                this._chart = this._api.add('line', { linetype: this._lineType });
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
        else if (key === 'linetype') {
            this._lineType = value;
        }
    }
};
LogWidgetClass = __decorate([
    MicroControl('log')
], LogWidgetClass);
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
var SceneWidgetClass_1;
let SceneWidgetClass = SceneWidgetClass_1 = class SceneWidgetClass extends GenericWidgetClass {
    connectedCallback() {
        super.connectedCallback();
        if (!SceneWidgetClass_1._sceneCard) {
            SceneWidgetClass_1._sceneCard = this;
        }
        else {
            this.style.display = 'none';
        }
        const c = SceneWidgetClass_1._sceneCard.querySelector('div.block:last-child');
        this._buttonObj = createHTMLElement(c, 'button', {
            'microid': this.microid
        });
        this._buttonObj.textContent = '-';
    }
    on_click(evt) {
        const btnObj = evt.target;
        let action = btnObj.getAttribute('microid');
        if (action) {
            if (action.startsWith('/'))
                action = action.substring(1);
            this.dispatchAction(action + '?start=1', '1');
        }
    }
    startScene() { 0; }
    newData(path, key, value) {
        super.newData(path, key, value);
        if (key === 'title') {
            this._buttonObj.textContent = value;
        }
    }
};
SceneWidgetClass = SceneWidgetClass_1 = __decorate([
    MicroControl('scene')
], SceneWidgetClass);
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
    if (el && (el.textContent !== txt)) {
        el.textContent = txt;
    }
}
function setAttr(el, name, value) {
    if (el && (el.getAttribute(name) !== value)) {
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
let ValueWidget = class ValueWidget extends GenericWidgetClass {
    connectedCallback() {
        super.connectedCallback();
        this._input = this.querySelector('input');
    }
    newData(path, key, value) {
        super.newData(path, key, value);
        if (this._input) {
            if (key === 'min') {
                this._input.min = value;
            }
            else if (key === 'max') {
                this._input.max = value;
            }
            else if (key === 'step') {
                this._input.step = value;
            }
        }
    }
};
ValueWidget = __decorate([
    MicroControl('value')
], ValueWidget);
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
                        newEntry.callback(path, (key || '').toLowerCase(), (value || ''));
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
                        e.callback(path, (key || '').toLowerCase(), (value || ''));
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