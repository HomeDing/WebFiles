// Proxy remote elements to local virtual elements

import { register as registerVirtual, VirtualBaseElement } from './VirtualBaseElement';
import fetch from 'node-fetch';

export class ProxyElement extends VirtualBaseElement {
  url: string;

  constructor(typeId: string, config: any) {
    super(typeId, config); // will be proxy/xxx in type/ID

    const scope = this;
    const url: string[] = config.url.split('/');
    const baseurl = url.slice(0, 3).join('/'); // 'http://server'

    this.type = url[4];
    this.id = url[5];
    this.typeId = this.type + '/' + this.id;

    this.url = baseurl + '/$board/' + this.typeId;

    // extract config for element state
    this.state = { url: baseurl };
    fetch(baseurl + '/config.json')
      .then(function (result) {
        return (result.json());
      }).then(function (json) {
        const st = json[scope.type][scope.id];
        scope.state = Object.assign(scope.state, st);
      });
  }


  async getState(): Promise<any> {
    const r = await fetch(this.url);
    const j = await r.json();
    const rs = j[this.typeId];
    // const now = new Date().valueOf();
    // this.state.nextboot = 30000 - Math.floor((now - this.boardStart) / 1000);
    this.state = Object.assign(this.state, rs);
    return (this.state);
  }

  // pass action to real element
  async doAction(action: any) {
    for (const a in action) {
      if (action.hasOwnProperty(a)) {
        await fetch(this.url + '?' + a + '=' + action[a]);
      }
    }
  }
} // ProxyElement


export function register() {
  registerVirtual('webproxy', ProxyElement);
}

// End.
