// packembedweb.js
// create the upload.h file that contains the html strings for the embedded web files
// like WiFi manager, web update and upload

// ===== Packages used =====

import yargs from 'yargs';
import debug from 'debug';

import * as HTMLMinifier from 'html-minifier-terser';
import shell from 'shelljs'

const outFile = "upload.h";

// ===== Command line support =====
console.log('HomeDing: Build ${outFile} file');
const options = yargs(process.argv.slice(2))
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
const placeholders = txt.match(/\$\{\w*\.htm\}/g);
logTrace("Placeholders: ", placeholders);

const tasks = placeholders
  .map(p => p.substring(2, p.length - 1))
  .unique()
  .map(name => {
    const c = shell.cat(name).stdout;
    const mc = HTMLMinifier.minify(c, {
      collapseWhitespace: true,
      removeComments: true,
      removeTagWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      verbose: true,
      quoteCharacter: "\""
    }).then(x => {
      txt = txt.replace('${' + name + '}', x);
    });
    return (mc);
  });


Promise.allSettled(tasks).then(() => {
  // write to upload.h to be copied into the Arduino project.
  shell.ShellString(txt).to(outFile);
  logTrace('generated code:\n', txt);
  logInfo(`${outFile} written.`);
})

