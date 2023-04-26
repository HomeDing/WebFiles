// Proxy remote elements to local virtual elements

import fetch from 'node-fetch';
import timeoutSignal from 'timeout-signal';

import { EventBusClass } from './EventBus.js';
import { VirtualBaseElement } from './VirtualBaseElement.js';
import { RegistryClass } from './Registry.js';
import { ConfigCache } from './ConfigCache.js';

import debug from 'debug';

// logging setup
const logServer = debug('proxy');
const log = {
  info: logServer.extend('info'),
  error: logServer.extend('error'),
  send: logServer.extend('send')
};


export class ProxyElement extends VirtualBaseElement {
  private url!: string;
  private host!: string;
  private configJson: any = null;
  private requested = false; // set true when a state request is on the way.
  private nextTry = 0;
  private configs = ConfigCache.getInstance();

  private TIMEOUT = 3000; // timeout for getting resaults from a device.
  private NEXT_TRY = 8 * 1000; // duration for next data from device

  setConfig(_bus: EventBusClass, config: any, _default = {}) {
    this.eventBus = _bus;
    this.config = Object.assign({}, _default, config);

    if (config.element) {
      const p = config.element.match(/^(?<host>\S*):(?<type>\S*)\/(?<id>\S*)/);
      this.host = p.groups.host;
      this.type = p.groups.type;
      this.id = p.groups.id;
    }

    this.url = `http://${this.host}/api/state/${this.type}/${this.id}`;

    // create a unique id to be used on the board.
    this.typeId = `${this.type}/${this.host}-${this.id}`;

    // extract config for element state
    this.state = Object.assign(this.state, {
      url: `http://${this.host}`
    });
  } // setConfig()


  async getState(): Promise<any> {
    if (!this.requested && (Date.now() > this.nextTry)) {
      // fetch configuration
      this.requested = true;
      this.nextTry = Date.now() + (this.NEXT_TRY * 1000);

      if (!this.configJson) {
        try {
          const conf = await this.configs.get(this.host);
          if (conf?.[this.type]?.[this.id]) {
            this.configJson = conf[this.type][this.id];
            this.state = Object.assign(this.state, this.configJson);
          }
        } catch (e) {
          log.error('getConfig', e);
        }
      }

      // fetch state
      if (this.configJson) {
        try {
          const r = await fetch(this.url, { signal: timeoutSignal(this.TIMEOUT) });
          const j = await r.json() as any;
          const rs = j[`${this.type}/${this.id}`];
          this.state = Object.assign(this.state, rs);
        } catch (e) {
          log.error('getState', e);
        }
      }
      this.requested = false;
    }
    return (this.state);
  } // getState()


  // pass action to real element
  async doAction(action: any) {
    for (const a in action) {
      await fetch(this.url + '?' + a + '=' + action[a], { signal: timeoutSignal(this.TIMEOUT) });
      this.nextTry = 0; // asap.
    }
  }
} // ProxyElement


export function register(registry: RegistryClass): void {
  registry.registerType('webproxy', ProxyElement);
}

// End.
