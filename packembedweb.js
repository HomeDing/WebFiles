// makeembedweb.js
// create the upload.h file that contains the html strings for the embedded web files
// like WiFi manager, web update and upload

// ===== Packages used =====

const yargs = require('yargs');
const debug = require('debug');
const shell = require('shelljs');

const minify = require('html-minifier').minify;

const outFile = "upload.h";

// ===== Command line support =====
console.log('HomeDing: Build upload.h file');
const options = yargs
  .usage('Usage: $0')
  .option('v', { alias: 'verbose', describe: 'Verbose logging', type: 'boolean', demandOption: false, default: false })
  .argv;

debug.enable(options.verbose ? '*' : '*:info');


// ===== initializing modules =====

const logInfo = debug('iot:info');
const logTrace = debug('iot:trace');
debug.log = console.log.bind(console);

Array.prototype.unique = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}


logInfo(`Starting...`);

let txt = shell.cat('makeembedtemplate.txt').stdout;
// console.log(txt);
const placeholders = txt.match(/\$\{\w*\.htm\}/g);
logTrace("Placeholders: ", placeholders);

placeholders
  .map(p => p.substring(2, p.length - 1))
  .unique()
  .forEach(name => {
    const c = shell.cat(name).stdout;
    const mc = minify(c, {
      collapseWhitespace: true,
      removeComments: true,
      removeTagWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    });
    txt = txt.replace('${' + name + '}', mc);
  });

// write to upload.h to be copied into the Arduino project.
shell.ShellString(txt).to(outFile);
logTrace('generated code:\n', txt);

logInfo(`${outFile} written.`);
