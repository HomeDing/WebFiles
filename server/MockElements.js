"use strict";
// Collection of mocking virtual elements
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.MockBL0937 = exports.MockTime = exports.MockDevice = exports.MockValue = exports.MockSwitch = void 0;
const VirtualBaseElement_1 = require("./VirtualBaseElement");
class MockSwitch extends VirtualBaseElement_1.VirtualBaseElement {
    constructor(typeId, config) {
        super(typeId, config);
    }
    doAction(action) {
        if (action.value != null) {
            this.state.value = action.value;
        }
        if (action.toggle != null) {
            this.state.value = (this.state.value ? 0 : 1);
        }
        super.doAction(action);
    }
} // MockSwitch
exports.MockSwitch = MockSwitch;
class MockValue extends VirtualBaseElement_1.VirtualBaseElement {
    constructor(typeId, config) {
        super(typeId, config);
        this.config = Object.assign({ step: 1 }, config);
        this.state = Object.assign(this.state, {
            value: 0
        });
    }
    doAction(action) {
        const step = this.config.step;
        const v = this.state.value;
        if (action.up != null) {
            this.state.value = Number(v) + Number(action.up) * step;
        }
        if (action.down != null) {
            this.state.value = Number(v) - Number(action.down) * step;
        }
        super.doAction(action);
    }
} // MockValue
exports.MockValue = MockValue;
class MockDevice extends VirtualBaseElement_1.VirtualBaseElement {
    constructor() {
        super(...arguments);
        this.boardStart = new Date().valueOf();
    }
    getState() {
        const now = new Date().valueOf();
        this.state.nextboot = 30000 - Math.floor((now - this.boardStart) / 1000);
        return (this.state);
    }
    doAction(action) {
        if (action.log !== null) {
            console.log('>>', action.log);
        }
        super.doAction(action);
    }
} // MockDevice
exports.MockDevice = MockDevice;
class MockTime extends VirtualBaseElement_1.VirtualBaseElement {
    getState() {
        const now = new Date().toISOString();
        this.state.now =
            this.state.value = now.substr(0, 19).replace(/T/, ' ');
        return (this.state);
    }
} // MockTime
exports.MockTime = MockTime;
class MockBL0937 extends VirtualBaseElement_1.VirtualBaseElement {
    constructor(typeId, config) {
        super(typeId, config);
        this.config = Object.assign({ step: 1 }, config);
        this.state = Object.assign(this.state, {
            mode: this.config.mode
        });
    }
    getState() {
        const p = 100 + Math.floor(Math.random() * 21); // power between 100 and 120
        const v = 228 + Math.floor(Math.random() * 5); // voltage is between 228 and 232
        this.state.power = p;
        if (this.state.mode === 'current') {
            delete this.state.voltage;
            this.state.current = Math.floor(p * 1000 / v);
        }
        else if (this.state.mode === 'voltage') {
            delete this.state.current;
            this.state.voltage = v;
        }
        return (this.state);
    }
    doAction(action) {
        if ((action.mode === 'current') || (action.mode === 'voltage')) {
            this.state.mode = action.mode;
        }
        super.doAction(action);
    }
}
exports.MockBL0937 = MockBL0937;
function register() {
    VirtualBaseElement_1.register('device', MockDevice);
    VirtualBaseElement_1.register('dstime', MockTime);
    VirtualBaseElement_1.register('ntptime', MockTime);
    VirtualBaseElement_1.register('switch', MockSwitch);
    VirtualBaseElement_1.register('value', MockValue);
    VirtualBaseElement_1.register('bl0937', MockBL0937);
}
exports.register = register;
//# sourceMappingURL=MockElements.js.map