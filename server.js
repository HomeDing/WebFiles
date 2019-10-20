// server.js

// ===== Packages used =====

const express = require("express");
const yargs = require("yargs");
const multer = require('multer');
const fs = require("fs");
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

// ===== initializing modules =====

var app = express();

// Setup debug output streams
const logInfo = debug("iot:info");
const logError = debug("iot:error");
const debugSend = debug("iot:send");
debug.log = console.log.bind(console);


// a prefix can be added to the files config.json, env.json and $board 

const useCase = `case-${options.case}/`;
const boardFileName = useCase + '$board';


if (!fs.existsSync(boardFileName)) {
  console.log(`The configuration folder ${boardFileName} could not be found.`);
  return;
} else {
  console.log(`Starting case ${useCase}...`);
}

// ===== config information
let configData = JSON.parse(fs.readFileSync(useCase + 'config.json', 'utf8'));

// ===== /$board status
let boardStatus = null;

// ===== status mocking functions
let mockGetStatus = {}; // return current status
let mockSetAction = {}; // set an Property of process an action


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

// ----- enable start page redirect -----
app.get("/", function (req, res, next) {
  logInfo("redirect...");
  res.redirect("/index.htm");
});

// ----- enable buildin setup pages -----

app.get('/\\$upload', function (req, res, next) {
  res.sendFile(path.join(__dirname, './upload.htm'));
});

app.get('/\\$setup', function (req, res, next) {
  res.sendFile(path.join(__dirname, './setup.htm'));
});

app.get('/\\$boot', function (req, res, next) {
  res.sendFile(path.join(__dirname, './boot.htm'));
});

// ----- handle listing of all existing files -----

// ----- upload -----

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

// ----- router -----

// set up the router required to hook up our service to the portal
const apiRouter = express.Router();

// test uploading files, use a file upload folder to avoid overwriting local files
// 
app.post('/', upload.any(), function (req, res) {
  req.files;
  req.originalUrl;
  res.send("");
});
/*  */

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
    "free heap": 31168,
    "flash-size": 4194304,
    // "flash-real-size":4194304,
    "fs-totalBytes": 957314,
    "fs-usedBytes": 218872,
    "ssid": "devnet"
    // "bssid":"74:DA:11:22:33:44"
  };
  res.type('application/json');
  res.send(JSON.stringify(fl, null, 2));
});

app.get(/^\/\xconfig.json$/, noCache, function (req, res, next) {

});

// ----- handle uploading a file using the PUT method -----

// app.put("/:fn", function (req, res, next) {
//   var filename = req.params.fn;
//   debugIoT("PUT: %s started", filename);

//   var writer = fs.createWriteStream(filename); // "output.txt");

//   req.setEncoding("utf8");
//   req.on("data", function (chunk) {
//     writer.write(chunk);
//     debugIoT("PUT: got %d bytes", chunk.length);
//   });

//   req.on("end", function () {
//     writer.close();
//     debugIoT("PUT: end.");
//     next();
//   });

//   res.send("this is an update");
// });

function isoDate() {
  function pad02(num) {
    return (((num < 10) ? '0' : '') + num);
  };

  var d = new Date();
  var ds = d.getFullYear() + '-' + pad02(d.getMonth() + 1) + '-' + pad02(d.getDate()) +
    ' ' + pad02(d.getHours()) + ':' + pad02(d.getMinutes()) + ':' + pad02(d.getSeconds());
  return (ds);
}


// ===== mocking elements

function addElementMock(id, fGet, fSet) {
  if (fGet)
    mockGetStatus[id] = fGet;
  if (fSet)
    mockSetAction[id] = fSet;
};


addElementMock('dstime/0', function (state) {
  state.now = isoDate();
  return (state);
}, null);

addElementMock('ntptime/on', function (state) {
  state.now = isoDate();
  return (state);
}, null);

addElementMock('displaytext/pm', function (state) {
  state.value = Math.floor(Math.random() * 40);
  return (state);
}, null);

addElementMock('displaydot/b', function (state) {
  var d = new Date();
  state.value = Math.floor(d.getSeconds() / 8) % 2;
  return (state);
}, null);


// ===== mocking switch elements

if (configData.value) {
  for (e in configData.value) {
    const cnf = configData.value[e];
    // set default value
    if (!cnf.step)
      cnf.step = 1;

    // add get and set methods of state
    addElementMock('value/' + e, function (state) {
      if (!state) {
        state = {
          active: 1,
          value: 0
        };
      }
      return (state);
    }, function (state, query) {
      if (query.value != null)
        state.value = query.value;
      if (query.up != null)
        state.value = Number(state.value) + Number(cnf.step) * Number(query.up);
      if (query.down != null)
        state.value = Number(state.value) - Number(cnf.step) * Number(query.down);
      return (state);
    });

    logInfo(e);
  }
}

if (configData.switch) {
  for (e in configData.switch) {
    // add get and set methods of state
    addElementMock('switch/' + e, function (state) {
      if (!state) {
        state = {
          active: 1,
          value: 0
        };
      }
      return (state);
    }, function (state, query) {
      if (query.value != null)
        state.value = query.value;
      if (query.toggle != null)
        state.value = (state.value ? 0 : 1);
      return (state);
    });
  }
}

// ===== serving /$board status

fs.watch(boardFileName, function (eventName, filename) {
  boardStatus = null;
});

app.get('/\\$board/:type/:id', noCache, function (req, res, next) {
  if (!boardStatus) {
    boardStatus = JSON.parse(fs.readFileSync(boardFileName, 'utf8'));
    for (let id in mockGetStatus) {
      boardStatus[id] = mockGetStatus[id](boardStatus[id]);
    }
  }

  let id = req.params.type + '/' + req.params.id;

  if (Object.keys(req.query).length > 0) {
    // incoming action
    if (mockSetAction[id])
      boardStatus[id] = mockSetAction[id](boardStatus[id], req.query);
    logInfo(boardStatus[id]);
    res.send();

  } else {
    if (mockGetStatus[id])
      boardStatus[id] = mockGetStatus[id](boardStatus[id]);
    logInfo(boardStatus[id]);
    res.type('application/json');
    let elementStatus = {};
    elementStatus[id] = boardStatus[id];
    res.send(JSON.stringify(elementStatus, null, 2));
  }
  // next();
});


app.get(/^\/\$board$/, noCache, function (req, res, next) {
  if (!boardStatus)
    boardStatus = JSON.parse(fs.readFileSync(boardFileName, 'utf8'));

  for (let id in mockGetStatus) {
    // if (!boardStatus[id]) {
    //   boardStatus[id] = {};
    // }
    // boardStatus[id] = mockGetStatus[id](boardStatus[id]);
    // update mock status when element is known.
    if (boardStatus[id]) {
      boardStatus[id] = mockGetStatus[id](boardStatus[id]);
    }
  }

  // debugIoT(boardStatus);
  res.type('application/json');
  res.send(JSON.stringify(boardStatus, null, 2));
});




// ===== serving file system 


app.delete("/:fn", function (req, res, next) {
  var filename = req.params.fn;
  logInfo("DELETE: %s", filename);
  logInfo("DELETE: not implemented.");
  res.send("done");
});


// setup serving static files

app.use(express.static(__dirname + '/' + useCase, {
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
  console.log("open http://localhost:3123/");
});