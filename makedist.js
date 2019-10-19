// makedist.js

// ===== Packages used =====

const yargs = require('yargs');
const debug = require('debug');
const shell = require('shelljs');

const distFolder = "dist";

// ===== Command line support =====
console.log('HomeDing: Build Dist Folder');
const options = yargs
  .usage('Usage: $0 -c <case name>')
  .usage('  This ...')
  .option('v', { alias: 'verbose', describe: 'Verbose logging', type: 'boolean', demandOption: false, default: false })
  .argv;

if (options.verbose) {
  debug.enable('*');
}

// ===== global modules in use =====

const logInfo = debug('iot:info');
// logInfo.log = console.log.bind(console);

console.log(`Starting...`);

// array with files that get copies as they are
const srcAssets = [
  'index.htm',
  'iotstyle.css',
  'micro.js',
  'es6-promise.auto.js',
  'polyfill.js',

  'ding-ide.htm',
  'ding-ide.js',

  'ding-info.htm',
  'ding-info-new.htm',
  'ding-templates.htm',

  'ding-log.htm',
  'panel.htm',
  'panel.js',

  'elementsvg.js',
  'lineChart.js',
  'microsvg.js',
  'pieChart.js',

  '*.svg',
  'favicon*.*',

  'manifest.json'
];

const builtinAssets = [
  'boot.htm',
  'upload.htm',
  'setup.htm'];

shell.rm('-rf', distFolder);
shell.mkdir(distFolder);
shell.mkdir(distFolder + '/ft');
shell.mkdir(distFolder + '/i');

// copy all assets
srcAssets.forEach(fn => shell.cp(fn, distFolder));

// copy immages
shell.cp('-R', 'ft/*.svg', distFolder + '/ft')
shell.cp('-R', 'i/*.svg', distFolder + '/i')

// create list file
shell.ls('-R', distFolder).grep(/^.*\..*$/).to(distFolder + '/list.txt');

console.log(`done.`);

