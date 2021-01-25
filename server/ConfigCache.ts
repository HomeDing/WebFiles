// Discovery of local Home devices advertising themselves

import express from 'express';
import fetch from 'node-fetch';

import { DeviceDiscovery } from './Discover';
import Logger from './Logger';

export class ConfigCache {
  private static _instance: ConfigCache;

  private dService = DeviceDiscovery.getInstance();

  // cache for device configurations
  private netConfigs: { [hostname: string]: any } = {};

  public static getInstance(): ConfigCache {
    if (!ConfigCache._instance) {
      ConfigCache._instance = new ConfigCache();
    }
    return ConfigCache._instance;
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
        const req = await fetch(url, { timeout: 8000 });
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
