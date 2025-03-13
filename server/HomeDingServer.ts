// HomeDingServer.ts
// Node.JS based server for a HomeDing püortal.

import fs from 'fs';
import path from 'path';

// General web server 
import express, { Application, Router } from 'express';
import http from 'http';
import https from 'https';
import multer from 'multer';

import Logger from './Logger.js';

// HomeDing Server Services
import { DeviceDiscovery } from './Discover.js';
import { ConfigCache } from './ConfigCache.js';

import { RegistryClass } from "./Registry.js";
import { EventBusClass } from './EventBus.js';
import * as mock from './MockElements.js';
import * as proxy from './ProxyElement.js';


export interface HomeDingServerOptions {
  port?: number;
  discovery?: boolean;
  monitor?: boolean;
  secure?: boolean;
  case?: string;
}

export class HomeDingServer {

  CASE_FOLDER = './case/';

  // ===== private
  private _app: Application = express();
  private _api: Router = express.Router();

  private _defaultOptions: HomeDingServerOptions = {
    port: 3123,
    monitor: false,
    secure: false,
    case: undefined
  };

  // file based settings
  private _settings: { [key: string]: any } = {};
  private _boardFileName = '';

  /** The current config & state for mocked elements. */
  private _allConfig: { [key: string]: any; } = {};
  private _boardState: { [key: string]: any } | undefined = undefined;

  private _caseFolder?: string;

  private registry = new RegistryClass();
  private eventBus = new EventBusClass(this.registry);

  private timer?: NodeJS.Timer = undefined;

  /**
   * Express middleware that adds header to avoid caching
   */
  private expressNoCache(_req: express.Request, res: express.Response, next: express.NextFunction) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
  } // expressNoCache


  /**
   * Express middleware to report all URLS with time taken.
   */
  private expressMonitor(req: express.Request, _res: express.Response, next: express.NextFunction) {
    const startTime = process.hrtime();
    next();
    const duration = process.hrtime(startTime);
    Logger.trace(`url=${req.originalUrl} time=${duration}`);
  }

  private loop() {
    this.eventBus.executeEvents();
    this.eventBus.loop();
  }

  constructor() {
    Logger.info('Homeding Server');
    this._app.use('/api', this._api);

  }

  // ===== public

  public async start(options: HomeDingServerOptions) {
    const opts = Object.assign({}, this._defaultOptions, options);
    this._settings = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'settings.json'), 'utf8'));

    this._app.set('port', opts.port);

    if (opts.monitor) {
      this._app.use(this.expressMonitor);
    }

    // ===== Bind api services

    if (opts.discovery) {
      // ===== enable device discovery service =====
      Logger.info('Starting discovery service...');
      const discoveryService = DeviceDiscovery.createInstance(this._settings.discovery || {});
      this._api.use('/discovery', discoveryService.router);
    }

    const configService = ConfigCache.createInstance(this._settings.config || {});
    this._api.use('/config', this.expressNoCache, configService.router);

    // ----- enable start page redirect -----
    this._app.get('/', function(req, res, _next) {
      Logger.info('redirect...');
      res.redirect('/index.htm');
    });

    // ----- enable buildin setup pages -----
    this._app.get('/\\$setup*', function(_req, res) { res.sendFile(path.join(process.cwd(), 'setup.htm')); });
    this._app.get('/\\$update*', function(_req, res) { res.sendFile(path.join(process.cwd(), 'update.htm')); });
    this._app.get('/\\$upload*', function(_req, res) { res.sendFile(path.join(process.cwd(), 'upload.htm')); });

    // configure upload storage to save in /uploads and use the filename+date
    const storage = multer.diskStorage({
      destination: function(_req, _file, cb) {
        cb(null, './uploads/');
      },
      filename: function(req, file, cb) {
        const p = file.originalname.split('/');
        cb(null, '/' + Date.now() + '-' + p[p.length - 1]);
      }
    });

    const upload = multer({ storage: storage, preservePath: true });

    /**
     * Test uploading files without overwriting existing files.
     * new files are saved to the `uploads` folder
    */
    this._app.post('/', upload.any(), function(req, res) {
      res.send('');
    });

    // #region ===== Setup mocking and proxy elements =====

    if (options.case) {
      Logger.info(`Starting test case <${options.case}>...`);

      if (fs.existsSync(`${this.CASE_FOLDER}${options.case}/`)) {
        this._caseFolder = `${this.CASE_FOLDER}${options.case}/`;
      } else if (fs.existsSync(`./case-${options.case}/`)) {
        this._caseFolder = `case-${options.case}/`;
      } else {
        Logger.error(`Test case folder ${options.case} doesn't exist`);
        process.abort();
      }

      this._boardFileName = this._caseFolder + '$board';

      if (!fs.existsSync(this._boardFileName)) {
        Logger.info(`The configuration folder ${this._boardFileName} could not be found.`);
        process.exit(1);
      } //

      // ===== env and config information
      this._allConfig = Object.assign({},
        JSON.parse(fs.readFileSync(this._caseFolder + 'env.json', 'utf8')),
        JSON.parse(fs.readFileSync(this._caseFolder + 'config.json', 'utf8'))
      );
      this._boardState = undefined;

      // ===== watch for changes of $board
      fs.watch(this._boardFileName, (_eventName, _filename) => {
        this._boardState = undefined;
      });
      mock.register(this.registry);

    } else {
      // no mock-case
      Logger.info('Starting portal mode...');

      this._allConfig = Object.assign({},
        JSON.parse(fs.readFileSync('env.json', 'utf8')),
        JSON.parse(fs.readFileSync('config.json', 'utf8'))
      );
      this._boardState = {};
    }
    proxy.register(this.registry);
    this.eventBus.startup(this._allConfig);


    this._app.get(/^\/api\/list$/, this.expressNoCache,
      async (req: express.Request, res: express.Response) => {
        let p = '';
        if (req.query.path) {
          p = req.query.path as string;
        }
        p = p.replaceAll('..', '.');
        if (!p.startsWith('/')) { p = '/' + p; }
        if (!p.endsWith('/')) { p = p + '/'; }

        const fl = [];
        const files = await fs.promises.readdir('.' + p);
        for (const i in files) {
          const aFile = await fs.promises.stat('.' + p + files[i]);
          if (aFile.isFile()) {
            fl.push({
              name: p + files[i],
              size: aFile.size
            });
          } else if (aFile.isDirectory()) {
            fl.push({
              name: p + files[i],
              type: "dir"
            });

          }
        }
        res.json(fl);
      }); // handleList


    this._app.get(/^\/api\/sysinfo/, this.expressNoCache,
      (_req: express.Request, res: express.Response) => {
        const fl = {
          devicename: 'hd-portal',
          build: 'Dec  1 2022',
          freeHeap: 31168,
          flashSize: 4194304,
          // 'flash-real-size':4194304,
          fsTotalBytes: 957314,
          fsUsedBytes: 218872,
          ssid: 'devnet'
          // 'bssid':'74:DA:11:22:33:44'
        };
        res.json(fl);
      }); // handleSysInfo


    // ===== handling status requests

    this._app.get('/\\api/state/:type/:id', this.expressNoCache,
      async (req: express.Request, res: express.Response) => {
        if (!this._boardState) {
          this._boardState = {};
          if (this._caseFolder) {
            // get current state from case-folder
            this._boardState = JSON.parse(await fs.promises.readFile(this._boardFileName, 'utf8'));
          }
        }

        const id = req.params.type + '/' + req.params.id;
        if (Object.keys(req.query).length > 0) {
          // incoming action
          res.send();
        /* no await */ this.eventBus.dispatch(id, req.query);
          this.eventBus.executeEvents();
        } else if (this._boardState) {
          // Update and return status of a single element
          this._boardState[id] = Object.assign(this._boardState[id], this.eventBus.state(id));
          res.json(this._boardState[id]);
        }
        // next();
      }); // handleElementState


    const handleElements = async (_req: express.Request, res: express.Response) => {
      const elems = JSON.parse(await fs.promises.readFile('./$elements', 'utf8'));
      res.json(elems);
    }; // handleElements

    this._app.get(/^\/api\/elements/, this.expressNoCache, handleElements);

    const handleScan = async (_req: express.Request, res: express.Response) => {
      const elems = [{ "id": "net01" }, { "id": "net02" }, { "id": "net03" }];
      res.json(elems);
    }; // handleScan

    this._app.get(/^\/api\/scan/, this.expressNoCache, handleScan);


    const handleState = async (req: express.Request, res: express.Response) => {
      if (!this._boardState) {
        this._boardState = {};
        if (this._caseFolder) {
          // get current state from case-folder
          try {
            this._boardState = JSON.parse(await fs.promises.readFile(this._boardFileName, 'utf8'));
          } catch (err) {
            Logger.error("State could be loaded:", err);
            res.sendStatus(500);
            return;
          }
        }
      }

      if (this._boardState) {
        // Update status of all elements
        const vState = await this.eventBus.allState();
        this._boardState = Object.assign(this._boardState, vState);

        // debugSend('send:' , boardStatus);
        res.type('application/json');
        res.send(JSON.stringify(this._boardState, null, 2));
      }
    }; // handleState


    this._app.get(/^\/api\/state$/, this.expressNoCache, handleState);


    this._app.get(/^\/\$flush$/, this.expressNoCache, async (_req, res) => {
      configService.flush();
      res.send();
    });

    // ===== serving file system

    this._app.delete('/:fn', function(req, res) {
      const filename = req.params.fn;
      Logger.info('DELETE: %s not implemented.', filename);
      res.send('done');
    });


    // setup serving static files
    if (this._caseFolder) {
      // serve case specific files preferred over general files. 
      this._app.use(express.static(process.cwd() + '/' + this._caseFolder, { index: false }));
    }
    this._app.use(express.static(process.cwd(), { index: ['index.htm'] }));


    if (!options.secure) {
      const httpServer = http.createServer(this._app);
      httpServer.listen(opts.port, () => {
        Logger.info('Web Server started.');
        Logger.info(`open http://localhost:${opts.port}/`);
      });
    } else {
      const httpsOptions = {
        key: fs.readFileSync('./certs/localhost.key'),
        cert: fs.readFileSync('./certs/localhost.crt')
      };
      const httpsServer = https.createServer(httpsOptions, this._app);
      httpsServer.listen(opts.port, () => {
        Logger.info('Web Server started.');
        Logger.info(`open https://localhost:${opts.port}/`);
      });
    } // if

    // start event loop
    this.timer = setInterval(this.loop.bind(this), 200);

  }

}