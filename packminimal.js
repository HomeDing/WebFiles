// packminimal.js
// copy all files for the minimal web server into the mindist folder
// ready to be published on http://homeding.github.io/vmxx 

// ===== Packages used =====

const yargs = require('yargs');
const debug = require('debug');
const shell = require('shelljs');

const sass = require('node-sass');
const minify = require('html-minifier').minify;
const uglify = require("uglify-js");

const distFolder = "dist-mini";

// ===== Command line support =====
console.log('HomeDing: Packing Dist-mini Folder');
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

// create fresh dist folder
shell.rm('-rf', distFolder);
shell.mkdir(distFolder);

// array with files that get copied as they are
const srcAssets = [
  'browserconfig.xml',
  'manifest.json',
  'spinner.gif',

  'favicon.svg',
  'favicon48.png',
  'favicon192.png',
  'favicon270.png',
  'favicon512.png',

  'i/start.svg',
  'i/stop.svg',
  'i/plus.svg',
  'i/minus.svg',
  'i/default.svg',
  'i/ide.svg'
];

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

// ===== SCSS =====

var result = sass.renderSync({
  file: 'iotstyle.scss',
  outputStyle: 'compressed',
  sourceMap: false
});
shell.ShellString(result.css).to(`${distFolder}/iotstyle.css`);

// ===== minify HTML =====

["microide.htm", "ding.htm"]
  .forEach(name => {
    const c = shell.cat(name).stdout;
    const txt = minify(c, {
      collapseWhitespace: true,
      removeComments: true,
      removeTagWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      quoteCharacter: "\'"
    });
    shell.ShellString(txt).to(`${distFolder}/${name}`);
  });

// ===== uglify Javascript =====

["microide.js", "micro.js"]
  .forEach(name => {
    const c = shell.cat(name).stdout;
    const res = uglify.minify(c, {
      compress: { drop_console: true, drop_debugger: true },
      mangle: true,
      output: { indent_level: 0, beautify: false }
    });
    shell.ShellString(res.code).to(`${distFolder}/${name}`);
  });


shell.cat('oldlist.txt').to(distFolder + '/list.txt');
shell.ls('-R', distFolder).grep(/^.*\..*$/).toEnd(distFolder + '/list.txt');
logInfo(`list.txt file written.`);


logInfo(`done.`);

