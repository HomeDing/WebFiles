// Collection of mocking virtual elements

import { EventBusClass } from './EventBus.js';
import Logger from './Logger.js';
import { RegistryClass } from './Registry.js';
import { VirtualBaseElement } from './VirtualBaseElement.js';

export class MockSwitch extends VirtualBaseElement {
  async doAction(action: unknown) {
    if (action.value != null) { this.state.value = action.value; }
    if (action.toggle != null) { this.state.value = (this.state.value ? 0 : 1); }
    super.doAction(action);
  }
} // MockSwitch


export class MockReference extends VirtualBaseElement {
  private _lastState = { reference: undefined, invalue: undefined, value: 0 };

  async doAction(action: unknown) {
    if (action.value != null) { this.state.invalue = Number(action.value); }
    if (action.reference != null) { this.state.reference = Number(action.reference); }
    super.doAction(action);
    this.state.value = (this.state.invalue > this.state.reference) ? 1 : 0;
    if (this.config.inverse) {
      this.state.value = 1 - this.state.value;
    }
  }

  loop() {
    if (this.state.value !== this._lastState.value) {
      this.eventBus.queueEvents(this.config.onvalue, String(this.state.value));
      this._lastState.value = this.state.value;
    }
  }
} // MockReference


export class MockDHT extends VirtualBaseElement {
  private _nextRead = Date.now() + 1 * 1000;
  private _defaultConfig = { readtime: 60 };
  private _lastState = { temperature: undefined, humidity: undefined };

  setConfig(bus: EventBusClass, config: unknown) {
    super.setConfig(bus, config, this._defaultConfig);
    // this.state = Object.assign(this.state, {
    //   temperature: this.config.temperature,
    //   humidity: this.config.humidity
    // });
  }

  // async doAction(action: any) {
  //   if (action.temperature) { this.state.temperature = action.temperature; }
  //   if (action.humidity) { this.state.humidity = action.humidity; }
  //   super.doAction(action);
  // }

  loop() {
    const now = Date.now();
    super.loop();

    if (now > this._nextRead) {
      this.state.temperature = String(16 + Math.floor(Math.random() * 12)) + '.00';
      this.state.humidity = String(40 + Math.floor(Math.random() * 20)) + '.00';
      this._nextRead = now + 10 * 1000;
    }

    if (this.state.temperature !== this._lastState.temperature) {
      this.eventBus.queueEvents(this.config.ontemperature, this.state.temperature);
      this._lastState.temperature = this.state.temperature;
    }

    if (this.state.humidity !== this._lastState.humidity) {
      this.eventBus.queueEvents(this.config.onhumidity, this.state.humidity);
      this._lastState.humidity = this.state.humidity;
    }

  }

} // MockReference


export class MockValue extends VirtualBaseElement {
  private _defaultConfig = { step: 1, value: 0 };

  setConfig(bus: EventBusClass, config: unknown) {
    super.setConfig(bus, config, this._defaultConfig);
    this.state = Object.assign(this.state, {
      value: this.config.value
    });
  }

  async doAction(action: unknown) {
    const step = this.config.step;
    const v = this.state.value;
    if (action.value != null) { this.state.value = action.value; }
    if (action.up != null) { this.state.value = Number(v) + Number(action.up) * step; }
    if (action.down != null) { this.state.value = Number(v) - Number(action.down) * step; }
    super.doAction(action);

    if (v !== this.state.value) {
      this.eventBus.queueEvents(this.config.onvalue, this.state.value);
    }
  }
} // MockValue


export class MockDevice extends VirtualBaseElement {
  private boardStart = new Date().valueOf();

  async getState(): Promise<unknown> {
    const now = new Date().valueOf();
    this.state.nextboot = 30000 - Math.floor((now - this.boardStart) / 1000);
    return (this.state);
  }

  async doAction(action: unknown) {
    if (action.log !== null) { Logger.info('>>', action.log); }
    super.doAction(action);
  }
} // MockDevice


export class MockTime extends VirtualBaseElement {
  async getState(): Promise<unknown> {
    const now = new Date().toISOString();
    this.state.now =
      this.state.value = now.substring(0, 19).replace(/T/, ' ');
    return (this.state);
  }
} // MockTime

export class MockBL0937 extends VirtualBaseElement {
  private _defaultConfig = { step: 1, value: 0 };

  setConfig(bus: EventBusClass, config: unknown) {
    super.setConfig(bus, config, this._defaultConfig);
  }

  async getState(): Promise<unknown> {
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

  async doAction(action: unknown) {
    if ((action.mode === 'current') || (action.mode === 'voltage')) {
      this.state.mode = action.mode;
    }
    super.doAction(action);
  }
}


// support changing the state by action - some properties
export class MockStandard extends VirtualBaseElement {

  constructor(typeName: string, id: string) {
    super(typeName, id);
  }

  setConfig(bus: EventBusClass, config: unknown) {
    super.setConfig(bus, config);
    this.state.value = config.value || 0;
  }

  async doAction(action: unknown) {
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

  setConfig(bus: EventBusClass, config: unknown) {
    super.setConfig(bus, config);
    this.restart = Boolean(config.restart);
    this.state.value = config.value || 0;
    this.state.mode = config.mode || 'timer';
  }

  async doAction(action: unknown) {
    super.doAction(action);
    if (action.mode != null) { this.state.mode = action.mode; }
    if (action.start != null) {
      this.state.mode = 'timer';
      this.startTime = Date.now();
    }
  }

  async getState(): Promise<unknown> {
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


export function register(registry: RegistryClass) {
  registry.registerType('device', MockDevice);
  registry.registerType('dstime', MockTime);
  registry.registerType('ntptime', MockTime);
  registry.registerType('reference', MockReference);
  registry.registerType('dht', MockDHT);

  registry.registerType('switch', MockSwitch);
  registry.registerType('value', MockValue);
  registry.registerType('timer', MockTimer);

  registry.registerType('digitalout', MockStandard);
  registry.registerType('neo', MockStandard);
  registry.registerType('color', MockStandard);
  registry.registerType('my9291', MockStandard);
  registry.registerType('p9813', MockStandard);
  registry.registerType('scene', MockStandard);
  registry.registerType('select', MockStandard);

  registry.registerType('bl0937', MockBL0937);
}

