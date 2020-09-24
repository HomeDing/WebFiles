// server.js

// ===== Packages used =====

const express = require("express");
const yargs = require("yargs");
const multer = require('multer');
const fs = require("fs");
const os = require("os");
const path = require("path");
const debug = require("debug");

// ===== Command line support =====
console.log('HomeDing Web Emulator');
const options = yargs
  .usage("Usage: $0 -c <case name>")
  .usage('  This web server hosts a full version of the HomeDing Web interface')
  .usage('  and emulates to a certain degree the services provided by a HomeDIng device.')
  .option("c", { alias: "case", describe: "Name of the simulated case", type: "string", demandOption: false, default: "radio" })
  .option("v", { alias: "verbose", describe: "Verbose logging", type: "boolean", demandOption: false, default: false })
  .argv;

if (options.verbose) {
  debug.enable('*');
}


// ===== initializing web server modules =====

var app = express();

// Setup debug output streams
const logInfo = debug("iot:info");
const logError = debug("iot:error");
const debugSend = debug("iot:send");
debug.log = console.log.bind(console);


//#region ===== mDNS Browser =====

const mDns = require('mdns-js');
mDns.excludeInterface('0.0.0.0');
let netDevices = {}; // has hostnames as keys, last known date as values;
let mDnsBrowser;

/**
 * A device was reported in mDNS: add to list of devices and set current timestamp.
 * This function is registered in the mDNS browser.
 */
function addDevice(data) {
  var isNew = (!netDevices[data.host]);
  // console.log(`>>${JSON.stringify(data.addresses)} - ${data.host} - ${data.fullname}`);
  netDevices[data.host] = new Date();
  if (isNew) {
    console.log(`add ${data.host}`);
    console.log(Object.keys(netDevices).join(' '));
  }
} // addDevice()


/**
 * Setup the mDNS browser and start dicovering devices.
 */
function startDiscovery() {
  // console.log(`>>START`);
  const now = new Date();
  if (mDnsBrowser) mDnsBrowser.stop();

  // clear out old devices, not responding since 90secs.
  for (host in netDevices) {
    // console.log(`old ${host} : ${netDevices[host]}`);
    // console.log(now.valueOf() - netDevices[host].valueOf());

    if (now.valueOf() - netDevices[host].valueOf() > 90 * 1000) {
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

// starts discovery now and every 30 secs.
startDiscovery();
setInterval(startDiscovery, 30 * 1000);

//#endregion

// Utilities
/** ms : number */
function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms) });
} // sleep

function hardsleep(millis) {
  var date = Date.now();
  var curDate = null;
  do {
      curDate = Date.now();
  } while (curDate-date < millis);
}

//#region ===== Setup simulated case ===== 

// to simulate a specific case the files `config.json`, `env.json` and `$board` 
// are used from a directory named `case-${casename}`. 

const caseFolder = `case-${options.case}/`;
const boardFileName = caseFolder + '$board';

if (!fs.existsSync(boardFileName)) {
  console.log(`The configuration folder ${boardFileName} could not be found.`);
  return;
} else {
  console.log(`Starting case ${options.case} ...`);
}

// ===== env and config information
const allConfig = Object.assign({},
  JSON.parse(fs.readFileSync(caseFolder + 'env.json', 'utf8')),
  JSON.parse(fs.readFileSync(caseFolder + 'config.json', 'utf8'))
);

const boardStart = new Date().valueOf();

// ===== /$board status
let boardStatus = null;

//#endregion

//#region ===== Setup web server features =====

// enable to add X-Respose-Time to http header
// var responseTime = require('response-time');
// app.use(responseTime());

logInfo("This processor architecture is " + process.arch);
logInfo("This platform is " + process.platform);

// a middleware with no mount path; gets executed for every request to the app
app.use(function (req, res, next) {
  var startTime = process.hrtime();
  next();
  var duration = process.hrtime(startTime);
  debugSend(`url=${req.originalUrl} time=${duration}`);
});

// ----- enable favicon requests -----
// var favicon = require("serve-favicon");
// app.use(favicon(__dirname + "/favicon.ico"));

// app.use('/api/fileUpload', require('./files/fileUpload'));

/**
 * Express middleware that adds header to avoid caching
 */
function noCache(req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
}

//#endregion


// ----- enable start page redirect -----
app.get("/", function (req, res, next) {
  logInfo("redirect...");
  res.redirect("/index.htm");
});

// ----- enable buildin setup pages -----

app.get('/\\$upload.htm', function (req, res, next) {
  res.sendFile(path.join(__dirname, './upload.htm'));
});

app.get('/\\$setup.htm', function (req, res, next) {
  res.sendFile(path.join(__dirname, './setup.htm'));
});

app.get('/\\$boot.htm', function (req, res, next) {
  res.sendFile(path.join(__dirname, './boot.htm'));
});

// ----- handle listing of all existing files -----


//#region ===== Upload files service ====

// configure upload storage to save in /uploads and use the filename+date
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    const p = file.originalname.split('/');

    if (p.length > 2) {
      if (!fs.existsSync('./uploads/' + p[1]))
        fs.mkdirSync('./uploads/' + p[1]);
    }
    cb(null, file.originalname + '-' + Date.now())
  }
})

const upload = multer({ storage: storage, preservePath: true });

/**
 * Test uploading files without overwriting existing files.
 * new files are saved to the `uploads` folder 
*/
app.post('/', upload.any(), function (req, res) {
  req.files;
  req.originalUrl;
  res.send("");
});

//#endregion


//#region ===== Setup mocking functions =====

// directory of active log functions
// mocks[${type}/${id}] = {fGet, fSet}

let mocks = {};

/**
 * Setup a mocking function for a specific element.
 */
function addMock(id, fGet, fSet) {
  mocks[id] = {
    fGet: fGet,
    fSet: fSet,
  };
} // addMock()


/**
 * Setup mocking functions for all configured elements of the specified type
 */
function addTypeMock(type, fGet, fSet) {
  if (allConfig[type]) {
    for (e in allConfig[type]) {
      addMock(type + '/' + e, fGet, fSet);
    }
  }
} // addTypeMock()


// ===== mocking specific elements

addMock('dstime/0', function (state) {
  if (!state) state = {};
  state.now = isoDate();
  return (state);
}, null);

addMock('ntptime/0', function (state) {
  if (!state) state = {};
  state.now = isoDate();
  return (state);
}, null);

addMock('displaytext/pm', function (state) {
  if (!state) state = {};
  state.value = Math.floor(Math.random() * 40);
  return (state);
}, null);

addMock('displaydot/b',
  function (state) {
    var d = new Date();
    if (!state) state = {};
    state.value = Math.floor(d.getSeconds() / 8) % 2;
    return (state);
  },
  null);


// ===== add mocking function for some common types. 

addTypeMock('device',
  function getState(state) {
    var now = new Date().valueOf();
    if (!state) {
      state = {
        active: 1
      };
    }
    // simulate remaining time for nextboot.
    state.nextboot = 30000 - Math.floor((now - boardStart) / 1000);
    return (state);
  },
  function (state, action, cnf) {
    if (action.log !== null) {
      console.log('>>', action.log);
    }
    return (state);
  });


/** Mock value elements */
addTypeMock('value',
  function (state) {
    if (!state) {
      state = {
        active: 1,
        value: 0
      };
    }
    return (state);
  },
  function (state, action, cnf) {
    const step = cnf.step ? Number(cnf.step) : 1;

    if (action.value != null)
      state.value = action.value;
    if (action.up != null)
      state.value = Number(state.value) + Number(action.up) * step;
    if (action.down != null)
      state.value = Number(state.value) - Number(action.down) * step;
    return (state);
  });


/** Mock switch elements */
addTypeMock('switch',
  function getSwitchState(state) {
    if (!state) {
      state = {
        active: 1,
        value: 0
      };
    }
    return (state);
  },
  function switchAction(state, action, cnf) {
    if (action.value != null)
      state.value = action.value;
    if (action.toggle != null)
      state.value = (state.value ? 0 : 1);
    return (state);
  });

//#endregion

app.get(/^\/\$list$/, noCache, function (req, res, next) {
  var fl = [];
  var files = fs.readdirSync(__dirname);
  for (var i in files) {
    var aFile = fs.statSync(files[i]);
    if (aFile.isFile())
      fl.push({
        name: "/" + files[i],
        size: aFile.size
      });
  }
  res.type('application/json');
  res.json(fl);
});


app.get(/^\/\$sysinfo$/, noCache, function (req, res, next) {
  var fl = {
    "devicename": "nodejsding",
    "build": "Dec  1 2018",
    "freeHeap": 31168,
    "flashSize": 4194304,
    // "flash-real-size":4194304,
    "fsTotalBytes": 957314,
    "fsUsedBytes": 218872,
    "ssid": "devnet"
    // "bssid":"74:DA:11:22:33:44"
  };
  res.json(fl);
});


function isoDate() {
  function pad02(num) {
    return (((num < 10) ? '0' : '') + num);
  };

  var d = new Date();
  var ds = d.getFullYear() + '-' + pad02(d.getMonth() + 1) + '-' + pad02(d.getDate()) +
    ' ' + pad02(d.getHours()) + ':' + pad02(d.getMinutes()) + ':' + pad02(d.getSeconds());
  return (ds);
}

// ===== serving /$board status

fs.watch(boardFileName, function (eventName, filename) {
  boardStatus = null;
});

app.get('/\\$board/:type/:id', noCache, function (req, res, next) {
  if (!boardStatus) {
    boardStatus = JSON.parse(fs.readFileSync(boardFileName, 'utf8'));
  }

  Object.keys(mocks).forEach(id => {
    const m = mocks[id];
    if (boardStatus[id] && m.fGet)
      boardStatus[id] = m.fGet(boardStatus[id]);
  });


  let id = req.params.type + '/' + req.params.id;
  const m = mocks[id];

  if (Object.keys(req.query).length > 0) {
    // incoming action
    if (m.fSet) {
      const c = allConfig[req.params.type][req.params.id];
      boardStatus[id] = m.fSet(boardStatus[id], req.query, c);
    }
    logInfo(boardStatus[id]);
    res.send();

  } else {
    res.type('application/json');
    let elementStatus = {};
    elementStatus[id] = boardStatus[id];
    res.send(JSON.stringify(elementStatus, null, 2));
  }
  // next();
});


app.get(/^\/\$board$/, noCache, function (req, res, next) {
  // hardsleep(800);
  if (!boardStatus) {
    boardStatus = JSON.parse(fs.readFileSync(boardFileName, 'utf8'));
  }
  Object.keys(mocks).forEach(id => {
    const m = mocks[id];
    if (boardStatus[id] && m.fGet)
      boardStatus[id] = m.fGet(boardStatus[id]);
  });

  // debugSend('send:' , boardStatus);
  res.type('application/json');
  res.send(JSON.stringify(boardStatus, null, 2));
});


app.get(/^\/\$devices$/, noCache, function (req, res, next) {
  res.type('application/json');
  res.send(JSON.stringify(Object.keys(netDevices), null, 2));
});


// ===== serving file system 


app.delete("/:fn", function (req, res, next) {
  var filename = req.params.fn;
  logInfo("DELETE: %s", filename);
  logInfo("DELETE: not implemented.");
  res.send("done");
});


// setup serving static files

app.use(express.static(__dirname + '/' + caseFolder, {
  index: false
}));

app.use(express.static(__dirname, {
  index: false
}));

// ----- enable error reports -----
app.use(function (err, req, res, next) {
  logError(err.stack);
  res.status(500).send("Something broke!");
});

// // ----- enable 404 responses -----
app.use(function (req, res, next) {
  logError(`could not find ${req.originalUrl}: 404`);
  res.status(404).send("Sorry cant find that!");
});

app.listen(3123, () => {
  console.log(`open http://${os.hostname}:3123/`);
});