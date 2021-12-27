// packminimal.js
// copy all files for the minimal web server into the mindist folder
// ready to be published on http://homeding.github.io/vmxx 

// ===== Packages used =====

const yargs = require('yargs');
const debug = require('debug');
const shell = require('shelljs');

const sass = require('sass');
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


// array with files that get copied as they are
const assets = [
  { m: 'js', src: 'micro.js' },
  { m: 'xml', src: 'browserconfig.xml' },
  { m: 'json', src: 'site.webmanifest' },
  { m: 'xml', src: 'favicon.svg' },
  // { m: 'c', src: 'favicon48.png' },
  // { m: 'c', src: 'favicon192.png' },
  // { m: 'c', src: 'favicon270.png' },
  // { m: 'c', src: 'favicon512.png' },
  { m: 'xml', src: 'i/start.svg' },
  { m: 'xml', src: 'i/stop.svg' },
  { m: 'xml', src: 'i/plus.svg' },
  { m: 'xml', src: 'i/minus.svg' },
  { m: 'xml', src: 'i/default.svg' },
  { m: 'xml', src: 'i/ide.svg' },
  { m: 'css', src: 'iotstyle.scss', tar: 'iotstyle.css' },
  { m: 'm', src: 'updateicons.htm' },
  { m: 'm', src: 'ding.htm' },
  { m: 'm', src: 'microide.htm' },
  { m: 'js', src: 'microide.js' },
];

// create fresh dist folders
shell.rm('-rf', distFolder);
shell.mkdir(distFolder);
shell.mkdir(distFolder + '/i');


// process all assets
assets
  // .filter(name => (name.indexOf('/') < 0))

  .forEach(op => {
    let txt;

    if (!op.tar) { op.tar = op.src; }

    switch (op.m) {
      case 'c': // copy
        shell.cp(op.src, distFolder + '/' + op.tar);
        break;

      case 'm': // minify html
        txt = shell.cat(op.src).stdout;
        txt = minify(txt, {
          collapseWhitespace: true,
          removeComments: true,
          removeTagWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
          quoteCharacter: "\'"
        });
        shell.ShellString(txt).to(distFolder + '/' + op.tar);
        break;

      case 'js': // minify javascript
        txt = shell.cat(op.src).stdout;
        txt = uglify.minify(txt, {
          compress: { drop_console: true, drop_debugger: true },
          mangle: true,
          output: { indent_level: 0, beautify: false }
        }).code;
        shell.ShellString(txt).to(distFolder + '/' + op.tar);
        break;

      case 'json': // minify json
        txt = shell.cat(op.src).stdout;
        txt = JSON.stringify(JSON.parse(txt), null, 0);
        shell.ShellString(txt).to(distFolder + '/' + op.tar);
        break;

      case 'css': // minify css
        txt = sass.renderSync({
          file: 'iotstyle.scss',
          outputStyle: 'compressed',
          sourceMap: false
        }).css;
        shell.ShellString(txt).to(distFolder + '/' + op.tar);
        break;

      case 'xml': // minify xml
        txt = shell.cat(op.src).stdout;
        txt = txt.replace(/([\>])\s+/g, '$1');
        shell.ShellString(txt).to(distFolder + '/' + op.tar);
        break;

      default:
        break;
    }
  });

logInfo(`Files copied.`);

// ===== create list file =====

let listText =
  shell.cat('oldlist.txt').stdout +
  shell.ls('-R', distFolder).grep(/^.*\..*$/).stdout;
shell.ShellString(listText).to(distFolder + '/list.txt');

logInfo(`list.txt file written.`);

logInfo(`done.`);
