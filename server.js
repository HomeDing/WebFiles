var express = require("express");
var app = express();

const fs = require("fs");
const debug = require("debug")("iot:server:");


// enable to add X-Respose-Time to http header
// var responseTime = require('response-time');
// app.use(responseTime());

debug("This processor architecture is " + process.arch);
debug("This platform is " + process.platform);

// a middleware with no mount path; gets executed for every request to the app
app.use(function(req, res, next) {
  var startTime = process.hrtime();
  next();
  var responseTime = process.hrtime(startTime);
  debug(
    "url: %s time: (%d)",
    req.originalUrl,
    responseTime[0] * 1e9 + responseTime[1]
  ); //  res.getHeader("X-Response-Time")
  // res.send('Time:' + Date.now())
});

// ----- enable favicon requests -----
var favicon = require("serve-favicon");
app.use(favicon(__dirname + "/favicon.ico"));

// ----- enable start page redirect -----
app.get("/", function(req, res, next) {
  debug("redirect...");
  res.redirect("/index.htm");
  // next();
});

// app.use('/api/fileUpload', require('./files/fileUpload'));

function nocache(req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
}

app.get("/", function(req, res, next) {
  debug("redirect...");
  res.redirect("/index.htm");
  // next();
});


// ----- handle listing of all existing files -----

app.get(/^\/\$list$/, nocache, function(req, res, next) {
  var fl = [];
  var files = fs.readdirSync(__dirname);
  for (var i in files) {
    var aFile = fs.statSync(files[i]);
    if (aFile.isFile())
      fl.push({ name: "/" + files[i], size: aFile.size });
  }
  res.type('application/json');
  res.json(fl);
});


// ----- handle uploading a file using the PUT method -----

app.put("/:fn", function(req, res, next) {
  var filename = req.params.fn;
  debug("PUT: %s started", filename);

  var writer = fs.createWriteStream(filename); // "output.txt");

  req.setEncoding("utf8");
  req.on("data", function(chunk) {
    writer.write(chunk);
    debug("PUT: got %d bytes", chunk.length);
  });

  req.on("end", function() {
    writer.close();
    debug("PUT: end.");
    next();
  });

  res.send("this is an update");
});

app.delete("/:fn", function(req, res, next) {
  var filename = req.params.fn;
  debug("DELETE: %s", filename);
  debug("DELETE: not implemented.");
  res.send("done");
});


// setup serving static files
app.use(express.static(__dirname, { index: false }));

// ----- enable error reports -----
app.use(function(err, req, res, next) {
  debug(err.stack);
  res.status(500).send("Something broke!");
});

// // ----- enable 404 responses -----
// app.use(function(req, res, next) {
//   debug("server.js: 404 request occured.");
//   res.status(404).send("Sorry cant find that!");
// });

app.listen(3123, () => {
  debug("IoT server is listening on port 3123!");
  debug("open http://localhost:3123/");
});