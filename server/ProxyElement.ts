// Proxy remote elements to local virtual elements

import { register as registerVirtual, VirtualBaseElement } from './VirtualBaseElement';
import timeoutSignal from 'timeout-signal';
import fetch from 'node-fetch';
import { ConfigCache } from './ConfigCache';

// logging setup
import debug from 'debug';
const logServer = debug('proxy');
const log = {
  info: logServer.extend('info'),
  error: logServer.extend('error'),
  send: logServer.extend('send')
};


export class ProxyElement extends VirtualBaseElement {
  // eslint-disable-next-line no-unused-vars
  private url: string;
  private host: string;
  private configJson: any = null;
  // private canRequest = false;
  private requested = false; // set true when a state request is on the way.
  private nextTry = 0;
  private configs = ConfigCache.getInstance();

  constructor(typeId: string, config: any) {
    super(typeId, config); // will be proxy/xxx in type/ID

    const url: string[] = config.url.split('/');
    const baseurl = url.slice(0, 3).join('/'); // 'http://server'

    this.host = url[2];
    this.type = url[4];
    this.id = url[5];
    this.url = `${baseurl}/$board/${this.type}/${this.id}`;

    // create a unique id to be used on the board.
    this.typeId = `${this.type}/${this.host}-${this.id}`;

    // extract config for element state
    this.state = { url: baseurl };
  }


  async getState(): Promise<any> {
    if (!this.requested && (Date.now() > this.nextTry)) {
      // fetch configuration
      this.requested = true;
      this.nextTry = Date.now() + (10 * 1000);

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
          const r = await fetch(this.url, { signal: timeoutSignal(4000) });
          const j:any = await r.json();
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
      await fetch(this.url + '?' + a + '=' + action[a], { signal: timeoutSignal(4000) });
      this.nextTry = 0; // asap.
    }
  }
} // ProxyElement


export function register() {
  registerVirtual('webproxy', ProxyElement);
}

// End.
