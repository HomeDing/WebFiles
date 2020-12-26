"use strict";
// Proxy remote elements to local virtual elements
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.ProxyElement = void 0;
const VirtualBaseElement_1 = require("./VirtualBaseElement");
const node_fetch_1 = __importDefault(require("node-fetch"));
class ProxyElement extends VirtualBaseElement_1.VirtualBaseElement {
    constructor(typeId, config) {
        super(typeId, config); // will be proxy/xxx in type/ID
        const url = config.url.split('/');
        this.url = url.slice(0, 4).join('/') + '/'; // 'http://server/$board/'
        this.type = url[4];
        this.id = url[5];
        this.typeId = this.type + '/' + this.id;
    }
    async getState() {
        const r = await node_fetch_1.default(this.url + this.typeId);
        const j = await r.json();
        const rs = j[this.typeId];
        // const now = new Date().valueOf();
        // this.state.nextboot = 30000 - Math.floor((now - this.boardStart) / 1000);
        this.state = rs;
        return (this.state);
    }
    async doAction(action) {
    }
} // ProxyElement
exports.ProxyElement = ProxyElement;
function register() {
    VirtualBaseElement_1.register('webproxy', ProxyElement);
}
exports.register = register;
// End.
//# sourceMappingURL=ProxyElement.js.map