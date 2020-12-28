// Discovery of local Home devices advertising themselves

import express from 'express';

const mDns = require('mdns-js');

let mDnsBrowser: any = null;

const netDevices: {
  [x: string]: {
    [x: string]: any;
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
  // console.log(`>>${JSON.stringify(data.addresses)} - ${host} - ${data.fullname}`);

  if (isNew) {
    const item: any = netDevices[host] = {
      host: data.host,
      title: host
    };

    // add also key/values
    data.txt.forEach(function (e: string) {
      const p = e.split('=');
      item[p[0]] = p[1];
    });

    console.log(`add ${host}`);
    console.log(Object.keys(netDevices).join(' '));
  }
  netDevices[host].ts = now;
} // addDevice()


/**
 * Setup the mDNS browser and start discovering devices.
 */
function startDiscovery() {
  // console.log(`>>START`);
  const now = new Date();
  if (mDnsBrowser) { mDnsBrowser.stop(); }

  // clear out old devices, not responding since 90secs.
  for (const host in netDevices) {
    // console.log(`old ${host} : ${netDevices[host]}`);
    // console.log(now.valueOf() - netDevices[host].valueOf());

    if (now.valueOf() - netDevices[host].ts.valueOf() > 90 * 1000) {
      console.log(`drop ${host}`);
      delete netDevices[host];
      console.log(Object.keys(netDevices).join(' '));
    }
  } // for

  // search for `_homeding._tcp`
  mDnsBrowser = mDns.createBrowser(mDns.tcp('homeding'));
  mDnsBrowser.on('ready', () => mDnsBrowser.discover());
  mDnsBrowser.on('update', addDevice);
} // startDiscovery()


export class DeviceDiscovery {
  private options = { refresh: 20 };

  constructor(options: any = {}) {
    this.options = Object.assign(this.options, options);

    mDns.excludeInterface('0.0.0.0');

    // start discovery now and every 30 secs.
    startDiscovery();
    setInterval(startDiscovery, this.options.refresh * 1000);
  }


  // express function: list all found devices.
  list(req: express.Request, res: express.Response) {
    res.json(netDevices);
  }
}
