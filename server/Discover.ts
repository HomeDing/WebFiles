// Discovery of local Home devices advertising themselves

import express from 'express';

import Logger from './Logger';
import { ConfigCache } from './ConfigCache';

const mDns = require('mdns-js');

let mDnsBrowser: any = null;

const netDevices: {
  [x: string]: {
    [x: string]: {
      host: string,
      title: string,
      ts: Date
    } | any;
  };
} = {};


/**
* A device was reported in mDNS: add to list of devices and set current timestamp.
* This function is registered in the mDNS browser.
*/
function addDevice(data: any) {
  const now = new Date();
  const host: string = data.host.replace(/\.local/, '');
  const isNew = (!netDevices[host]);
  // Logger.trace(`>>${JSON.stringify(data.addresses)} - ${host} - ${data.fullname}`);

  // update always when mdns package has come around.
  const item: any = netDevices[host] = {
    host: data.host,
    title: host
  };

  // add also key/values
  data.txt.forEach(function (e: string) {
    const p = e.split('=');
    item[p[0]] = p[1];
  });

  if (isNew) {
    Logger.info(`add ${host}`, Object.keys(netDevices).join(','));
  }
  netDevices[host].ts = now;
} // addDevice()


/**
 * Setup the mDNS browser and start discovering devices.
 */
function startDiscovery() {
  // Logger.trace(`>>START`);
  const now = new Date();
  if (mDnsBrowser) { mDnsBrowser.stop(); }

  // clear out old devices, not responding since 90secs.
  for (const host in netDevices) {
    // Logger.trace(`old ${host} : ${netDevices[host]}`);
    // Logger.trace(now.valueOf() - netDevices[host].valueOf());

    if (now.valueOf() - netDevices[host].ts.valueOf() > 90 * 1000) {
      delete netDevices[host];
      ConfigCache.getInstance().remove(host);
      Logger.info(`drop ${host}`, ':', Object.keys(netDevices).join(' '));
    }
  } // for

  // search for `_homeding._tcp`
  mDnsBrowser = mDns.createBrowser(mDns.tcp('homeding'));
  mDnsBrowser.on('ready', () => mDnsBrowser.discover());
  mDnsBrowser.on('update', addDevice);
} // startDiscovery()


// there is one DeviceDiscovery only.
export class DeviceDiscovery {
  private static _instance: DeviceDiscovery;

  private options = { refresh: 20 };

  constructor(options: any = {}) {
    this.options = Object.assign(this.options, options);

    mDns.excludeInterface('0.0.0.0');

    // start discovery now and every 30 secs.
    startDiscovery();
    setInterval(startDiscovery, this.options.refresh * 1000);
  }

  public static getInstance(): DeviceDiscovery {
    if (!DeviceDiscovery._instance) {
      DeviceDiscovery._instance = new DeviceDiscovery();
    }
    return DeviceDiscovery._instance;
  }

  // return true when a device is online by sending mDNS announcements.
  isOnline(host: string): boolean {
    return (!!netDevices[host]);
  }

  // express function: list all found devices.
  handleDevices(req: express.Request, res: express.Response) {
    res.json(netDevices);
  }

  list() {
    return (netDevices);
  }
}

