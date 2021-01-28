// packdist.js
// copy all files for the full featured web server into the dist folder
// ready to be published on http://homeding.github.io/vxx 

// ===== Packages used =====

const yargs = require('yargs');
const debug = require('debug');
const shell = require('shelljs');

const uglify = require("uglify-js");

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

logInfo(`Starting...`);

// array with files that get copied as they are
const assets = [
  'index.htm',
  'iotstyle.css',
  'spinner.gif',

  'microide.htm',

  'board.htm',
  'board-new.htm',
  'board-templates.htm',
  'ding.htm',

  'log.htm',
  'panel.htm',
  'panel.js',

  'microsvg.js',
  'elementsvg.js',

  'element.svg',
  'lineChart.svg',
  'pieChart.svg',
  'favicon.svg',
  'favicon*.png',
  'updateicons.htm',

  'browserconfig.xml',

  'i/no.svg',
  'i/device.svg',
  'i/default.svg',
  'i/start.svg',
  'i/stop.svg',
  'i/minus.svg',
  'i/plus.svg',
  'i/config.svg',
  'i/ide.svg',
  'i/menui.svg',
  'i/reload.svg',

  'icons.svg'
];


// create fresh dist folders
shell.rm('-rf', distFolder);
shell.mkdir(distFolder);
shell.mkdir(distFolder + '/i');
logInfo(`new ${distFolder} folder created.`);


// copy all file assets
assets
  .filter(name => (name.indexOf('/') < 0))
  .forEach(filename => shell.cp(filename, distFolder));
logInfo(`Files copied.`);

// ===== uglify/minify Javascript =====

["microide.js", "micro.js", 'lineChart.js', 'pieChart.js']
  .forEach(name => {
    const c = shell.cat(name).stdout;
    const res = uglify.minify(c, {
      compress: { drop_console: true, drop_debugger: true },
      mangle: true,
      output: { indent_level: 0, beautify: false }
    });
    shell.ShellString(res.code).to(`${distFolder}/${name}`);
  });

// ===== minify JSON =====

['elements.json', 'site.webmanifest']
  .forEach(name => {
    const data = JSON.parse(shell.cat(name).stdout);
    shell.ShellString(JSON.stringify(data)).to(`${distFolder}/${name}`);
  });


// copy all folder assets
assets
  .filter(name => (name.indexOf('/') > 0))
  .forEach(name => shell.cp(name, distFolder + '/' + name.split('/')[0]));
logInfo(`Images copied.`);

// create list file
shell.cat('oldlist.txt').to(distFolder + '/list.txt');
shell.ls('-R', distFolder).grep(/^.*\..*$/).toEnd(distFolder + '/list.txt');
logInfo(`list.txt file written.`);

logInfo(`done.`);

