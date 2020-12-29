// Discovery of local Home devices advertising themselves

import express from 'express';
import fetch from 'node-fetch';

export class ConfigCache {
  private static _instance: ConfigCache;

  // cache for device configurations
  private netConfigs: { [hostname: string]: any } = {};

  public static getInstance(): ConfigCache {
    if (!ConfigCache._instance) {
      ConfigCache._instance = new ConfigCache();
    }
    return ConfigCache._instance;
  }

  async get(hostname: string) {
    const host: string = hostname.replace(/\.local/, '');
    if (!this.netConfigs[host]) {
      const req = await fetch(`http://${hostname}/config.json`);
      this.netConfigs[host] = await req.json();
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