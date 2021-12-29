// Collection of mocking virtual elements

import Logger from './Logger';
import { register as registerVirtual, VirtualBaseElement } from './VirtualBaseElement';

export class MockSwitch extends VirtualBaseElement {
  async doAction(action: any) {
    if (action.value != null) { this.state.value = action.value; }
    if (action.toggle != null) { this.state.value = (this.state.value ? 0 : 1); }
    super.doAction(action);
  }
} // MockSwitch


export class MockValue extends VirtualBaseElement {
  constructor(typeId: string, config: any) {
    super(typeId, config);
    this.config = Object.assign({ step: 1 }, config);
    this.state = Object.assign(this.state, {
      value: 0
    });
  }

  async doAction(action: any) {
    const step = this.config.step;
    const v = this.state.value;
    if (action.value != null) { this.state.value = action.value; }
    if (action.up != null) { this.state.value = Number(v) + Number(action.up) * step; }
    if (action.down != null) { this.state.value = Number(v) - Number(action.down) * step; }
    super.doAction(action);
  }
} // MockValue


export class MockDevice extends VirtualBaseElement {
  private boardStart = new Date().valueOf();

  async getState(): Promise<any> {
    const now = new Date().valueOf();
    this.state.nextboot = 30000 - Math.floor((now - this.boardStart) / 1000);
    return (this.state);
  }

  async doAction(action: any) {
    if (action.log !== null) { Logger.info('>>', action.log); }
    super.doAction(action);
  }
} // MockDevice


export class MockTime extends VirtualBaseElement {
  async getState(): Promise<any> {
    const now = new Date().toISOString();
    this.state.now =
      this.state.value = now.substring(0, 19).replace(/T/, ' ');
    return (this.state);
  }
} // MockTime

export class MockBL0937 extends VirtualBaseElement {
  constructor(typeId: string, config: any) {
    super(typeId, config);
    this.config = Object.assign({ step: 1 }, config);
    this.state = Object.assign(this.state, {
      mode: this.config.mode
    });
  }

  async getState(): Promise<any> {
    const p = 100 + Math.floor(Math.random() * 21); // power between 100 and 120
    const v = 228 + Math.floor(Math.random() * 5); // voltage is between 228 and 232

    this.state.power = p;
    if (this.state.mode === 'current') {
      delete this.state.voltage;
      this.state.current = Math.floor(p * 1000 / v);
    } else if (this.state.mode === 'voltage') {
      delete this.state.current;
      this.state.voltage = v;
    }
    return (this.state);
  }

  async doAction(action: any) {
    if ((action.mode === 'current') || (action.mode === 'voltage')) {
      this.state.mode = action.mode;
    }
    super.doAction(action);
  }
}


// support changing the state by action - some properties
export class MockStandard extends VirtualBaseElement {
  constructor(typeId: string, config: any) {
    super(typeId, config);
    this.state.value = config.value || 0;
  }

  async doAction(action: any) {
    super.doAction(action);
    if (action.value != null) { this.state.value = action.value; }
    if (action.mode != null) { this.state.mode = action.mode; }
    if (action.brightness != null) { this.state.brightness = action.brightness; }
  }
} // class MockStandard


// support changing the state by action - some properties
export class MockTimer extends VirtualBaseElement {
  restart = false;
  startTime = Date.now();

  constructor(typeId: string, config: any) {
    super(typeId, config);
    this.restart = Boolean(config.restart);
    this.state.value = config.value || 0;
    this.state.mode = config.mode || 'timer';
  }

  async doAction(action: any) {
    super.doAction(action);
    if (action.mode != null) { this.state.mode = action.mode; }
    if (action.start != null) {
      this.state.mode = 'timer';
      this.startTime = Date.now();
    }
  }

  async getState(): Promise<any> {
    if (this.state.mode === 'on') {
      this.state.value = 1;
    } else if (this.state.mode === 'off') {
      this.state.value = 0;
    } else {
      const d = (Date.now() - this.startTime) / 1000;
      this.state.time = d;
      if (d < 20) {
        this.state.value = 0;
      } else if (d < 40) {
        this.state.value = 1;
      } else {
        this.state.value = 0;
        if ((d > 60) && (this.restart)) {
          this.startTime = Date.now();
        }
      }
    }
    return (this.state);
  }
} // class MockTimer


export function register() {
  registerVirtual('device', MockDevice);
  registerVirtual('dstime', MockTime);
  registerVirtual('ntptime', MockTime);

  registerVirtual('switch', MockSwitch);
  registerVirtual('value', MockValue);
  registerVirtual('timer', MockTimer);

  registerVirtual('digitalout', MockStandard);
  registerVirtual('neo', MockStandard);
  registerVirtual('color', MockStandard);
  registerVirtual('my9291', MockStandard);
  registerVirtual('p9813', MockStandard);

  registerVirtual('bl0937', MockBL0937);
}

