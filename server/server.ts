// https://commerceofthefuture.com/2020/06/getting-started-with-typescript-and-express/
// https://github.com/microsoft/TypeScript-Node-Starter/blob/master/src/app.ts

import express from 'express';
import debug from 'debug';
import fs from 'fs';
import path from 'path';


// import debug = require('debug');
// import { start } from 'repl';

// ===== LOGGING =====

const logServer = debug('server');
const log = {
  info: logServer.extend('info'),
  error: logServer.extend('error'),
  send: logServer.extend('send')
};

log.info.log = console.log.bind(console);
log.error.log = console.error.bind(console);
log.send.log = console.log.bind(console);

console.log('Homeding Portal Server is starting...');

// ===== Express web server =====

const app: express.Application = express();

// ===== Startup =====

import yargs from 'yargs';

debug.enable('server:info');
// debug.enable('*');

const options = yargs
  .usage('Usage: $0 -c <case name>')
  .usage('  This web server hosts a full version of the HomeDing Web interface')
  .usage('  and emulates to a certain degree the services provided by a HomeDIng device.')
  .option('c', { alias: 'case', describe: 'Name of the simulated case', type: 'string', demandOption: false, default: null })
  .option('v', { alias: 'verbose', describe: 'Verbose logging', type: 'boolean', demandOption: false, default: false })
  .argv;

if (options.verbose) {
  debug.enable('*');
  log.info('This processor architecture is ' + process.arch);
  log.info('This platform is ' + process.platform);
  log.info('dir: ' + __dirname);
  log.info('cwd: ' + process.cwd());
}


//#region ===== Enable Virtual Elements =====

/** The current state for all elements. */
let boardState: any = null;

import * as virtual from './VirtualBaseElement';

import * as mock from './MockElements';
import * as proxy from './ProxyElement';

// to simulate a specific case the files `config.json`, `env.json` and `$board`
// are used from a directory named `case-${casename}`.

let caseFolder: string | null = null;
let boardFileName = '';

let allConfig: { [e: string]: any; } = {};

if (options.case) {
  caseFolder = `case-${options.case}/`;
  boardFileName = caseFolder + '$board';

  if (!fs.existsSync(boardFileName)) {
    console.log(`The configuration folder ${boardFileName} could not be found.`);
    caseFolder = null;
    boardFileName = '';

  } else {
    console.log(`Starting case ${options.case} ...`);

    // ===== env and config information
    allConfig = Object.assign({},
      JSON.parse(fs.readFileSync(caseFolder + 'env.json', 'utf8')),
      JSON.parse(fs.readFileSync(caseFolder + 'config.json', 'utf8'))
    );

    // ===== watch for changes of $board
    fs.watch(boardFileName, function (_eventName, _filename) {
      boardState = null;
    });
  }
} else {
  // no mock-case
  console.log(`Starting...`);

  // ===== env and config information
  allConfig = Object.assign({},
    JSON.parse(fs.readFileSync('env.json', 'utf8')),
    JSON.parse(fs.readFileSync('config.json', 'utf8'))
  );
  boardState = {};
}

//#endregion


//#region ===== Setup web server middleware features =====

/**
 * Express middleware that adds header to avoid caching
 */
function noCache(_req: express.Request, res: express.Response, next: express.NextFunction) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
} // noCache

/**
 * Express middleware to report all URLS with time taken.
 */
app.use(function (req, res, next) {
  const startTime = process.hrtime();
  next();
  const duration = process.hrtime(startTime);
  log.info(`url=${req.originalUrl} time=${duration}`);
});

//#endregion


// ===== List locally discovered devices

import { DeviceDiscovery } from './Discover';

const dService = new DeviceDiscovery({});
app.get(/^\/\$devices$/, noCache, dService.handleDevices);

import { ConfigCache } from './ConfigCache';
const ccInstance = ConfigCache.getInstance();
app.get(/^\/\$deviceconfig$/, noCache, ccInstance.handle.bind(ccInstance));


// ===============================================================================================

// ----- enable start page redirect -----
app.get('/', function (req, res, _next) {
  log.info('redirect...');
  res.redirect('/index.htm');
});

// ----- enable buildin setup pages -----

app.get('/\\$setup.htm', function (req, res) {
  res.sendFile(path.join(__dirname, './setup.htm'));
});

app.get('/\\$update.htm', function (req, res) {
  res.sendFile(path.join(__dirname, './update.htm'));
});

app.get('/\\$upload.htm', function (req, res) {
  res.sendFile(path.join(__dirname, './upload.htm'));
});


//#region ===== Upload files service ====

import multer from 'multer';

// configure upload storage to save in /uploads and use the filename+date
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    const p = file.originalname.split('/');

    if (p.length > 2) {
      if (!fs.existsSync('./uploads/' + p[1])) {
        fs.mkdirSync('./uploads/' + p[1]);
      }
    }
    cb(null, file.originalname + '-' + Date.now());
  }
});

const upload = multer({ storage: storage, preservePath: true });

/**
 * Test uploading files without overwriting existing files.
 * new files are saved to the `uploads` folder
*/
app.post('/', upload.any(), function (req, res) {
  res.send('');
});

//#endregion


//#region ===== Setup mocking nd proxy elements =====

if (options.case) { mock.register(); }
proxy.register();
virtual.activate(allConfig);

//#endregion

app.get(/^\/\$list$/, noCache, async function (req, res) {
  const fl = [];
  const files = await fs.promises.readdir(__dirname);
  for (const i in files) {
    if (files.hasOwnProperty(i)) {
      const aFile = await fs.promises.stat(files[i]);
      if (aFile.isFile()) {
        fl.push({
          name: '/' + files[i],
          size: aFile.size
        });
      }
    }
  }
  res.json(fl);
});


app.get(/^\/\$sysinfo$/, noCache, function (req, res) {
  const fl = {
    'devicename': 'nodejsding',
    'build': 'Dec  1 2018',
    'freeHeap': 31168,
    'flashSize': 4194304,
    // 'flash-real-size':4194304,
    'fsTotalBytes': 957314,
    'fsUsedBytes': 218872,
    'ssid': 'devnet'
    // 'bssid':'74:DA:11:22:33:44'
  };
  res.json(fl);
});


// ===== serving /$board status for a single element

app.get('/\\$board/:type/:id', noCache, async function (req, res) {
  if (!boardState) {
    boardState = {};
    if (caseFolder) {
      // get current state from case-folder
      boardState = JSON.parse(await fs.promises.readFile(boardFileName, 'utf8'));
    }
  }

  const id = req.params.type + '/' + req.params.id;
  if (Object.keys(req.query).length > 0) {
    // incoming action
    res.send();
    /* no await */ virtual.action(id, req.query);

  } else {
    // Update and return status of a single element
    boardState[id] = Object.assign(boardState[id], virtual.state(id));
    res.json(boardState[id]);
  }
  // next();
});


app.get(/^\/\$board$/, noCache, async function (req, res) {
  // hardsleep(800);
  if (!boardState) {
    boardState = {};
    if (caseFolder) {
      // get current state from case-folder
      boardState = JSON.parse(await fs.promises.readFile(boardFileName, 'utf8'));
    }
  }

  // Update status of all elements
  const vState = await virtual.allState();
  boardState = Object.assign(boardState, vState);

  // debugSend('send:' , boardStatus);
  res.type('application/json');
  res.send(JSON.stringify(boardState, null, 2));
});


// ===== serving file system

app.delete('/:fn', function (req, res) {
  const filename = req.params.fn;
  log.info('DELETE: %s', filename);
  log.info('DELETE: not implemented.');
  res.send('done');
});


// setup serving static files
if (caseFolder) {
  app.use(express.static(process.cwd() + '/' + caseFolder, { index: false }));
}
app.use(express.static(process.cwd(), { index: false }));


// ----- enable error reports -----

// app.use(function (err: any, req: express.Request, res: express.Response, _next) {
//   log.error(err.stack);
//   res.status(500).send('Something broke!');
// });

// // ----- enable 404 responses -----

app.use(function (req, res) {
  log.error(`could not find ${req.originalUrl}: 404`);
  res.status(404).send('Sorry cant find that!');
});



module.exports = {
  app: app,

  setPort: function (p: number) { app.set('port', p); },

  start: function () {
    const port: number = app.get('port');
    app.listen(port, () => {
      console.log('Web Server started.');
      console.log(`open http://localhost:${port}/`);
    });
  }
};
