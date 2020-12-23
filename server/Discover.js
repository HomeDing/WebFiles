"use strict";
// Discovery of local Home devices advertising themselves
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceDiscovery = void 0;
const mDns = require('mdns-js');
let mDnsBrowser = null;
const netDevices = {};
/**
 * A device was reported in mDNS: add to list of devices and set current timestamp.
 * This function is registered in the mDNS browser.
 */
function addDevice(data) {
    const now = new Date();
    const host = data.host.replace(/\.local/, '');
    const isNew = (!netDevices[host]);
    // console.log(`>>${JSON.stringify(data.addresses)} - ${host} - ${data.fullname}`);
    if (isNew) {
        const item = netDevices[host] = {
            host: data.host,
            title: host
        };
        // add also key/values
        data.txt.forEach(function (e) {
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
    if (mDnsBrowser) {
        mDnsBrowser.stop();
    }
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
class DeviceDiscovery {
    constructor(options = {}) {
        this.options = { refresh: 20 };
        this.options = Object.assign(this.options, options);
        mDns.excludeInterface('0.0.0.0');
        // start discovery now and every 30 secs.
        startDiscovery();
        setInterval(startDiscovery, this.options.refresh * 1000);
    }
    // express function: list all found devices.
    list(req, res, next) {
        res.json(netDevices);
        // res.type('application/json');
        // res.send(JSON.stringify(netDevices, null, 2));
    }
}
exports.DeviceDiscovery = DeviceDiscovery;
//# sourceMappingURL=Discover.js.map