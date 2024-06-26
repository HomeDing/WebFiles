// Discovery of local Home devices advertising themselves

import express from 'express';

import Logger from './Logger.js';
import { ConfigCache } from './ConfigCache.js';
import { TxtAnswer, SrvAnswer } from 'dns-packet';
import mDNS from 'multicast-dns';


// there is one DeviceDiscovery only.
export class DeviceDiscovery {
  private static _instance: DeviceDiscovery;

  // expose the router to be used in express
  public router = express.Router();

  private defaultOptions: unknown = { refresh: 1 * 60 };
  private options: { [key: string]: any } = {};

  private mdns: mDNS.MulticastDNS;

  private netDevices: {
    [x: string]: {
      host: string,
      target: string,
      title: string,
      room: string,
      path: string,
      ts: Date
    };
  } = {};

  constructor(options: unknown = {}) {
    this.options = Object.assign({}, this.defaultOptions, options);

    this.mdns = mDNS();

    // express function: list all found devices.
    this.router.get('', (_req, res) => { res.json(this.netDevices); });

    // start discovery now and every 30 secs.
    this.mdns.on('response', this.addDevice.bind(this));

    this.startDiscovery();
    setInterval(this.startDiscovery.bind(this), this.options.refresh * 1000);

    setInterval(this.cleanupDevices.bind(this), 10 * 1000);
  }


  // create a instance of the DeviceDiscovery service.
  // This method should nly be called once.
  public static createInstance(options: unknown = {}): DeviceDiscovery {
    DeviceDiscovery._instance = new DeviceDiscovery(options);
    return DeviceDiscovery._instance;
  }


  // return current instance of the DeviceDiscovery
  public static getInstance(): DeviceDiscovery {
    return DeviceDiscovery._instance;
  }

  // ===== expose some methods for direct use =====

  // return true when a device is online by sending mDNS announcements.
  public isOnline(host: string): boolean {
    return (!!this.netDevices[host]);
  }

  public list() {
    return (this.netDevices);
  }

  /**
  * start a new query.
  */
  private startDiscovery() {
    Logger.trace('>>START');
    this.mdns.query([{ name: '_homeding._tcp.local', type: 'PTR' }]);
  } // startDiscovery()


  // got a response, check for new device
  private addDevice(response: mDNS.ResponsePacket) {
    Logger.trace('Answer:', response.answers[0].name);

    let isNew = true;
    const isHomeDingDevice = response.answers
      .filter((a) => (a.type === 'PTR'))
      .filter((a) => (a.name === '_homeding._tcp.local'))
      .length > 0;

    if (isHomeDingDevice) {
      Logger.trace('Device:', response);
      // Logger.trace('Device:', JSON.stringify(response));

      const hdd : { [key: string]: any } = {
        host: '',
        target: '',
        room: '',
        title: '',
        path: ''
      };

      // merge response.additionals and response.answers. both are "Answers" structures.
      // mDNS implementations differ in using these collections.

      // console.log('HomeDing Device!');
      // console.log('response:', response);

      const all = [...response.answers, ...response.additionals];

      all
        .filter(a => (a.type === 'SRV'))
        .forEach(a => {
          const ta = a as SrvAnswer;
          // console.log("SRV", a.data);
          hdd.target = ta.data.target;
          // hdd.host = hdd.target;
          hdd.host = hdd.target.replace(/\.local/, '');
        });

      all
        .filter(a => (a.type === 'TXT'))
        .forEach(a => {
          const ta = a as TxtAnswer;
          String(ta.data)
            .split(',')
            .forEach(e => {
              const p = e.split('=');
              hdd[p[0]] = p[1];
            });
        });

      isNew = (!this.netDevices[hdd.host]);
      const item = this.netDevices[hdd.host] = {
        host: hdd.host,
        target: hdd.target,
        title: hdd.title,
        room: hdd.room,
        path: hdd.path,
        ts: new Date()
      };
      if (isNew) {
        Logger.trace('+', 'http://' + item.host, JSON.stringify(item));
      }
    } // if
  } // addDevice


  // clear out old devices, not responding since 5 min..
  private cleanupDevices() {
    const now = new Date();

    for (const host in this.netDevices) {
      if (now.valueOf() - this.netDevices[host].ts.valueOf() > 5 * 60 * 1000) { // 5 minutes
        Logger.trace('-', 'http://' + this.netDevices[host].host);
        delete this.netDevices[host];
        ConfigCache.getInstance().remove(host);
      }
    } // for
  } // cleanupDevices()

}

