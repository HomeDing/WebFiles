// Proxy remote elements to local virtual elements

import { register as registerVirtual, VirtualBaseElement } from './VirtualBaseElement';
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
  private url: string;
  private host: string;
  private configJson: any = null;
  private online = false;
  private nextTry = Date.now();
  private configs = ConfigCache.getInstance();

  constructor(typeId: string, config: any) {
    super(typeId, config); // will be proxy/xxx in type/ID

    const scope = this;
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
    if ((this.online) || (Date.now() > this.nextTry)) {
      // fetch configuration
      this.online = false;

      if (!this.configJson) {
        const conf = await this.configs.get(this.host);
        if (conf?.[this.type]?.[this.id]) {
          this.configJson = conf[this.type][this.id];
          this.state = Object.assign(this.state, this.configJson);
        }
      }

      // fetch state
      if (this.configJson) {
        try {
          const r = await fetch(this.url, { timeout: 4000 });
          const j = await r.json();
          const rs = j[`${this.type}/${this.id}`];
          this.state = Object.assign(this.state, rs);
          this.online = true;
        } catch (e) {
          log.error(e);
        } finally {
        }
      }
      if (!this.online) {
        this.nextTry = Date.now() + (10 * 1000);
      }
    }
    return (this.state);
  } // getState()


  // pass action to real element
  async doAction(action: any) {
    for (const a in action) {
      if (action.hasOwnProperty(a)) {
        await fetch(this.url + '?' + a + '=' + action[a], { timeout: 4000 });
      }
    }
  }
} // ProxyElement


export function register() {
  registerVirtual('webproxy', ProxyElement);
}

// End.
