// Proxy remote elements to local virtual elements

import { register as registerVirtual, VirtualBaseElement } from './VirtualBaseElement';
import fetch from 'node-fetch';

export class ProxyElement extends VirtualBaseElement {
  url: string;

  constructor(typeId: string, config: any) {
    super(typeId, config); // will be proxy/xxx in type/ID

    const url: string[] = config.url.split('/');

    this.url = url.slice(0, 4).join('/') + '/'; // 'http://server/$board/'
    this.type = url[4];
    this.id = url[5];
    this.typeId = this.type + '/' + this.id;
  }

  async getState(): Promise<any> {

    const r = await fetch(this.url + this.typeId);
    const j = await r.json();
    const rs = j[this.typeId];
    // const now = new Date().valueOf();
    // this.state.nextboot = 30000 - Math.floor((now - this.boardStart) / 1000);
    this.state = rs;
    return (this.state);
  }

  async doAction(action: any) {
  }
} // ProxyElement


export function register() {
  registerVirtual('webproxy', ProxyElement);
}

// End.
