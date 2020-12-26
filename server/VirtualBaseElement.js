"use strict";
// Virtual elements for HomeDing Portal and Development Server
Object.defineProperty(exports, "__esModule", { value: true });
exports.allState = exports.state = exports.action = exports.activate = exports.addElement = exports.add = exports.register = exports.VirtualBaseElement = void 0;
// a virtual element that can be used for mocking and proxying to real existing element in HomeDing devices.
// The VirtualBaseElement actually does nothing but returning the static defined state.
class VirtualBaseElement {
    constructor(typeId, config) {
        this.state = { active: 1 };
        this.typeId = typeId;
        this.type = typeId.split('/')[0];
        this.id = typeId.split('/')[1];
        this.config = config;
    }
    /** return the actual state from the element */
    async getState() { return (this.state); }
    async doAction(query) { }
}
exports.VirtualBaseElement = VirtualBaseElement;
/** registered virtual elements classes */
const registry = {};
/** activated virtual elements */
const activeVirtuals = {};
/** Register a class for an element type. */
function register(type, imp) {
    registry[type] = imp;
}
exports.register = register;
/** add a virtual element */
function add(typeId, impl) {
    activeVirtuals[typeId] = impl;
}
exports.add = add;
/** add a virtual element */
function addElement(impl) {
    activeVirtuals[impl.typeId] = impl;
}
exports.addElement = addElement;
/** Activate virtual elements for all configured elements. */
function activate(allConfig) {
    Object.keys(registry).forEach(typeName => {
        const tConf = allConfig[typeName];
        if (tConf) {
            Object.keys(tConf).forEach(e => {
                const c = new registry[typeName](typeName + '/' + e, tConf[e]);
                activeVirtuals[c.typeId] = c;
            });
        }
    });
}
exports.activate = activate;
/** Process an action for a given element. */
function action(typeId, cmd) {
    const ve = activeVirtuals[typeId];
    if (ve) {
        ve.doAction(cmd);
    }
} // action()
exports.action = action;
/** Return the state of a single element. */
async function state(typeId) {
    const ve = activeVirtuals[typeId];
    if (ve) {
        return (ve.getState());
    }
    else {
        return ({});
    }
} // state()
exports.state = state;
/** return the state of all virtual elements */
async function allState() {
    const all = {};
    for (const eId in activeVirtuals) {
        all[eId] = await activeVirtuals[eId].getState();
    }
    return (all);
} // allState()
exports.allState = allState;
// End.
//# sourceMappingURL=VirtualBaseElement.js.map