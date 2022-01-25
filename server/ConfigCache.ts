// Discovery of local Home devices advertising themselves

import express from 'express';
import timeoutSignal from 'timeout-signal';
import fetch from 'node-fetch';

import { DeviceDiscovery } from './Discover.js';
import Logger from './Logger.js';

export class ConfigCache {
  private static _instance: ConfigCache;

  // ===== expose the router to be used in express  =====

  public router = express.Router();

  private defaultOptions: any = { timeout: 4000 };
  private options: any = {};

  private dService = DeviceDiscovery.getInstance();

  // cache for device configurations
  private netConfigs: { [hostname: string]: any } = {};


  constructor(options: any = {}) {
    this.options = Object.assign({}, this.defaultOptions, options);

    // express function: list all found devices.
    this.router.get('/', async (req, res) => {
      res.json({});
    });

    // express function: list all found devices.
    this.router.get('/:hostname', async (req, res) => {
      let cnf = {};
      if (req.params.hostname) {
        cnf = await this.get(req.params.hostname);
      }
      res.json(cnf);
    });
  }

  // create a instance of the DeviceDiscovery service.
  // This method should nly be called once.
  public static createInstance(options: any = {}): ConfigCache {
    ConfigCache._instance = new ConfigCache(options);
    return (ConfigCache._instance);
  }

  public static getInstance(): ConfigCache {
    return (ConfigCache._instance);
  }

  async flush() {
    this.netConfigs = {};
  }

  async get(hostname: string) {
    const host: string = hostname.replace(/\.local/, '');
    if (!this.dService.isOnline(host)) {
      Logger.error(`not online: ${host}`); // , err
    } else if (!this.netConfigs[host]) {
      try {
        const url = `http://${hostname}/config.json`;
        const req = await fetch(url, { signal: timeoutSignal(this.options.timeout) });
        const txt = await req.text();
        // const j = await req.json();
        this.netConfigs[host] = JSON.parse(txt);
        Logger.info(`config from ${host}:`, this.netConfigs[host]);
      } catch (err) {
        Logger.error(`no config from ${host}`); // , err
      }
    }
    return (this.netConfigs[host]);
  }

  async remove(hostname: string) {
    const host: string = hostname.replace(/\.local/, '');
    if (this.netConfigs[host]) {
      delete this.netConfigs[host];
    }
  }

  // express function: get config from remote element.
  async handle(req: express.Request, res: express.Response) {
    let cnf = {};
    if (req.query.host) {
      cnf = await this.get(req.query.host as string);
    }
    res.json(cnf);
  }

}
