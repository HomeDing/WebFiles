// Proxy remote elements to local virtual elements

import { register as registerVirtual, VirtualBaseElement } from './VirtualBaseElement';
import fetch from 'node-fetch';
import { ConfigCache } from './ConfigCache';

export class ProxyElement extends VirtualBaseElement {
  private url: string;
  private host: string;
  private configJson: any = null;
  private online = false;
  private nextTry = Date.now();

  constructor(typeId: string, config: any) {
    super(typeId, config); // will be proxy/xxx in type/ID

    const scope = this;
    const url: string[] = config.url.split('/');
    const baseurl = url.slice(0, 3).join('/'); // 'http://server'

    this.host = url[2];
    this.type = url[4];
    this.id = url[5];
    this.typeId = this.type + '/' + this.id;

    this.url = baseurl + '/$board/' + this.typeId;

    // extract config for element state
    this.state = { url: baseurl };
    // const cc = ConfigCache.getInstance().get(this.host);

    // fetch(baseurl + '/config.json', { timeout: 4000 })
    //   .then(function (result) {
    //     return (result.json());
    //   }).then(function (json) {
    //     const st = json[scope.type][scope.id];
    //     scope.state = Object.assign(scope.state, st);
    //   }).catch(function (err) {
    //     this.online = false;
    //     this.nextTry = now + (10 * 1000);
    //     console.log(err);

    //   });
  }


  async getState(): Promise<any> {
    if ((this.online) || (Date.now() > this.nextTry)) {
      // fetch configuration
      this.online = false;

      if (!this.configJson) {
        const conf = await ConfigCache.getInstance().get(this.host);
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
          const rs = j[this.typeId];
          this.state = Object.assign(this.state, rs);
          this.online = true;
        } catch (e) {
          console.log(e);
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
