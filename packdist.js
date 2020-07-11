// packdist.js
// copy all files for the full featured web server into the dist folder
// ready to be published on http://homeding.github.io/vxx 

// ===== Packages used =====

const yargs = require('yargs');
const debug = require('debug');
const shell = require('shelljs');

const distFolder = "dist";

// ===== Command line support =====
console.log('HomeDing: Packing Dist Folder');
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


// array with files that get copied as they are
//   'es6-promise.auto.js', removed
const srcAssets = [
  'index.htm',
  'iotstyle.css',
  'spinner.gif',
  
  'polyfill.js',
  'micro.js',

  'elements.json',

  'microide.*',

  'board.htm',
  'board-new.htm',
  'board-templates.htm',
  'ding.htm',

  'log.htm',
  'panel.htm',
  'panel.js',

  'microsvg.js',
  'elementsvg.js',
  'lineChart.js',
  'pieChart.js',

  'element.svg',
  'lineChart.svg',
  'pieChart.svg',
  'favicon.svg',
  'favicon*.png',
  'updateicons.htm',

  'manifest.json',
  'browserconfig.xml',

  'i/*.svg'
];

const builtinAssets = [
  'boot.htm',
  'upload.htm',
  'setup.htm'
];


// create fresh dist folder
shell.rm('-rf', distFolder);
shell.mkdir(distFolder);

// create sub-folders
srcAssets
  .filter(name => (name.indexOf('/') > 0))
  .map(name => distFolder + '/' + name.split('/')[0])
  .unique()
  .forEach(foldername => shell.mkdir(foldername));
logInfo(`new ${distFolder} folder created.`);

// copy all file assets
srcAssets
  .filter(name => (name.indexOf('/') < 0))
  .forEach(filename => shell.cp(filename, distFolder));
logInfo(`Files copied.`);

// copy all folder assets
srcAssets
  .filter(name => (name.indexOf('/') > 0))
  .forEach(name => shell.cp(name, distFolder + '/' + name.split('/')[0]));
logInfo(`Images copied.`);

// create list file
shell.cat('oldlist.txt').to(distFolder + '/list.txt');
shell.ls('-R', distFolder).grep(/^.*\..*$/).toEnd(distFolder + '/list.txt');
logInfo(`list.txt file written.`);

logInfo(`done.`);

