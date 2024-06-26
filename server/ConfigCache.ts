// Discovery of local Home devices advertising themselves

import express from 'express';
import timeoutSignal from 'timeout-signal';

import { DeviceDiscovery } from './Discover.js';
import Logger from './Logger.js';

export class ConfigCache {
  private static _instance: ConfigCache;

  // ===== expose the router to be used in express  =====

  public router = express.Router();

  private defaultOptions: unknown = { timeout: 4000 };
  private options: { [key: string]: any } = {};

  private dService = DeviceDiscovery.getInstance();

  // cache for device configurations
  private netConfigs: { [hostname: string]: any } = {};


  constructor(options: unknown = {}) {
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
  public static createInstance(options: unknown = {}): ConfigCache {
    ConfigCache._instance = new ConfigCache(options);
    return (ConfigCache._instance);
  }

  public static getInstance(): ConfigCache {
    return (ConfigCache._instance);
  }

  async flush() {
    this.netConfigs = {};
  }

  async get(hostname: string): Promise<{ [key: string]: any }> {
    const host: string = hostname.replace(/\.local/, '');
    if (!this.dService.isOnline(host)) {
      Logger.error(`not online: ${host}`); // , err
    } else if (!this.netConfigs[host]) {
      try {
        let eObj: { [key: string]: any } = {}, cObj: { [key: string]: any } = {};

        const eReq = await fetch(`http://${hostname}/env.json`, { signal: timeoutSignal(this.options.timeout) });
        if (eReq.status === 200) {
          eObj = await eReq.json() as { [key: string]: any };
        }

        const cReq = await fetch(`http://${hostname}/config.json`, { signal: timeoutSignal(this.options.timeout) });
        if (eReq.status === 200) {
          cObj = await cReq.json() as { [key: string]: any };
        }

        // use device.title as default on all elements
        const conf = { ...eObj, ...cObj };
        const title = conf.device[0].title;

        for (const t in conf) for (const i in conf[t]) {
          if (!conf[t][i].title) conf[t][i].title = title;
        }


        this.netConfigs[host] = conf;
        Logger.trace(`config from ${host}:`, this.netConfigs[host]);
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
