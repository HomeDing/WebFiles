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

import * as virtual from './VirtualBaseElement.js';
import * as mock from './MockElements.js';
import * as proxy from './ProxyElement.js';


export interface HomeDingServerOptions {
  port?: number;
  monitor?: boolean;
  secure?: boolean;
  case?: string;
}

export class HomeDingServer {

  // ===== private
  private _app: Application = express();
  private _api: Router = express.Router();

  private _defaultOptions: HomeDingServerOptions = {
    port: 3123,
    monitor: false,
    secure: false,
    case: undefined
  }

  // file based settings
  private _settings = {} as any;

  /** The current config & state for mocked elements. */
  private _allConfig: { [e: string]: any; } = {};
  private _boardState: any = null;

  private _caseFolder?: string;

  /**
   * Express middleware that adds header to avoid caching
   */
  private expressNoCache(_req: express.Request, res: express.Response, next: express.NextFunction) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
  } // noCache


  /**
   * Express middleware to report all URLS with time taken.
   */
  private expressMonitor(req: express.Request, _res: express.Response, next: express.NextFunction) {
    const startTime = process.hrtime();
    next();
    const duration = process.hrtime(startTime);
    Logger.trace(`url=${req.originalUrl} time=${duration}`);
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

    const discoveryService = DeviceDiscovery.createInstance(this._settings.discovery || {});
    this._api.use('/discovery', discoveryService.router);

    const configService = ConfigCache.createInstance(this._settings.config || {});
    this._api.use('/config', this.expressNoCache, configService.router);

    // ----- enable start page redirect -----
    this._app.get('/', function (req, res, _next) {
      Logger.info('redirect...');
      res.redirect('/index.htm');
    });

    // ----- enable buildin setup pages -----
    this._app.get('/\\$setup*', function (_req, res) { res.sendFile(path.join(process.cwd(), 'setup.htm')); });
    this._app.get('/\\$update*', function (_req, res) { res.sendFile(path.join(process.cwd(), 'update.htm')); });
    this._app.get('/\\$upload*', function (_req, res) { res.sendFile(path.join(process.cwd(), 'upload.htm')); });

    // configure upload storage to save in /uploads and use the filename+date
    const storage = multer.diskStorage({
      destination: function (_req, _file, cb) {
        cb(null, './uploads/');
      },
      filename: function (req, file, cb) {
        const p = file.originalname.split('/');
        cb(null, '/' + Date.now() + '-' + p[p.length - 1]);
      }
    });

    const upload = multer({ storage: storage, preservePath: true });

    /**
     * Test uploading files without overwriting existing files.
     * new files are saved to the `uploads` folder
    */
    this._app.post('/', upload.any(), function (req, res) {
      res.send('');
    });

    // #region ===== Setup mocking and proxy elements =====

    if (options.case) {
      Logger.info(`Starting test case ${options.case}...`);

      this._caseFolder = `case-${options.case}/`;
      const boardFileName = this._caseFolder + '$board';

      if (!fs.existsSync(boardFileName)) {
        Logger.info(`The configuration folder ${boardFileName} could not be found.`);
        process.exit(1);
      } //

      Logger.info(`Starting case ${options.case} ...`);

      // ===== env and config information
      this._allConfig = Object.assign({},
        JSON.parse(fs.readFileSync(this._caseFolder + 'env.json', 'utf8')),
        JSON.parse(fs.readFileSync(this._caseFolder + 'config.json', 'utf8'))
      );
      this._boardState = null;

      // ===== watch for changes of $board
      fs.watch(boardFileName, (_eventName, _filename) => {
        this._boardState = null;
      });
      mock.register();

    } else {
      // no mock-case
      Logger.info('Starting...');

      this._allConfig = Object.assign({},
        JSON.parse(fs.readFileSync('env.json', 'utf8')),
        JSON.parse(fs.readFileSync('config.json', 'utf8'))
      );
      this._boardState = {};
    }
    proxy.register();
    virtual.activate(this._allConfig);

    // this._app.get(/^\/\$list$/, noCache, async function (req, res) {
    //   const fl = [];
    //   const files = await fs.promises.readdir('.');
    //   for (const i in files) {
    //     const aFile = await fs.promises.stat(files[i]);
    //     if (aFile.isFile()) {
    //       fl.push({
    //         name: '/' + files[i],
    //         size: aFile.size
    //       });
    //     }
    //   }
    //   res.json(fl);
    // });


    // this._app.get(/^\/\$sysinfo$/, noCache, function (req, res) {
    //   const fl = {
    //     devicename: 'nodejsding',
    //     build: 'Dec  1 2018',
    //     freeHeap: 31168,
    //     flashSize: 4194304,
    //     // 'flash-real-size':4194304,
    //     fsTotalBytes: 957314,
    //     fsUsedBytes: 218872,
    //     ssid: 'devnet'
    //     // 'bssid':'74:DA:11:22:33:44'
    //   };
    //   res.json(fl);
    // });


    // // ===== serving /$board status for a single element

    // this._app.get('/\\$board/:type/:id', noCache, async function (req, res) {
    //   if (!boardState) {
    //     boardState = {};
    //     if (this._caseFolder) {
    //       // get current state from case-folder
    //       boardState = JSON.parse(await fs.promises.readFile(boardFileName, 'utf8'));
    //     }
    //   }

    //   const id = req.params.type + '/' + req.params.id;
    //   if (Object.keys(req.query).length > 0) {
    //     // incoming action
    //     res.send();
    //     /* no await */ virtual.action(id, req.query);
    //   } else {
    //     // Update and return status of a single element
    //     boardState[id] = Object.assign(boardState[id], virtual.state(id));
    //     res.json(boardState[id]);
    //   }
    //   // next();
    // });


    // this._app.get(/^\/\$board$/, noCache, async function (req, res) {
    //   if (!boardState) {
    //     boardState = {};
    //     if (this._caseFolder) {
    //       // get current state from case-folder
    //       boardState = JSON.parse(await fs.promises.readFile(boardFileName, 'utf8'));
    //     }
    //   }

    //   // Update status of all elements
    //   const vState = await virtual.allState();
    //   boardState = Object.assign(boardState, vState);

    //   // debugSend('send:' , boardStatus);
    //   res.type('application/json');
    //   res.send(JSON.stringify(boardState, null, 2));
    // });


    // this._app.get(/^\/\$flush$/, noCache, async function (req, res) {
    //   configService.flush();
    //   res.send();
    // });

    // ===== serving file system

    this._app.delete('/:fn', function (req, res) {
      const filename = req.params.fn;
      Logger.info('DELETE: %s not implemented.', filename);
      res.send('done');
    });


    // setup serving static files
    if (this._caseFolder) {
      // serve case specific files preferred over general files. 
      this._app.use(express.static(process.cwd() + '/' + this._caseFolder, { index: false }));
    }
    this._app.use(express.static(process.cwd(), { index: false }));


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
        Logger.info('open https://localhost:${opts.port}/');
      });
    }

  }
}