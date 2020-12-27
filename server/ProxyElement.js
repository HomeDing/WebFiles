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
        const scope = this;
        const url = config.url.split('/');
        const baseurl = url.slice(0, 3).join('/'); // 'http://server'
        this.type = url[4];
        this.id = url[5];
        this.typeId = this.type + '/' + this.id;
        this.url = baseurl + '/$board/' + this.typeId;
        // extract config for element state
        this.state = { url: baseurl };
        node_fetch_1.default(baseurl + '/config.json')
            .then(function (result) {
            return (result.json());
        }).then(function (json) {
            const st = json[scope.type][scope.id];
            scope.state = Object.assign(scope.state, st);
        });
    }
    async getState() {
        const r = await node_fetch_1.default(this.url);
        const j = await r.json();
        const rs = j[this.typeId];
        // const now = new Date().valueOf();
        // this.state.nextboot = 30000 - Math.floor((now - this.boardStart) / 1000);
        this.state = Object.assign(this.state, rs);
        return (this.state);
    }
    // pass action to real element
    async doAction(action) {
        for (const a in action) {
            await node_fetch_1.default(this.url + '?' + a + '=' + action[a]);
        }
    }
} // ProxyElement
exports.ProxyElement = ProxyElement;
function register() {
    VirtualBaseElement_1.register('webproxy', ProxyElement);
}
exports.register = register;
// End.
//# sourceMappingURL=ProxyElement.js.map