#!/usr/bin/env node

// packminimal.js
// copy all files for the minimal web server into the mindist folder
// ready to be published on http://homeding.github.io/vmxx 

// ===== Packages used =====

const yargs = require('yargs');
const debug = require('debug');
const shell = require('shelljs');

const sass = require('sass');
const HTMLMinifier = require('html-minifier-terser');
const JSMinifier = require('terser');

const distFolder = "dist-mini";

// ===== Command line support =====
console.log('HomeDing: Packing dist-mini Folder');
const options = yargs
  .usage('Usage: $0')
  .option('v', { alias: 'verbose', describe: 'Verbose logging', type: 'boolean', demandOption: false, default: false })
  .argv;

debug.enable(options.verbose ? '*' : '*:info');

// ===== initializing modules =====

const logInfo = debug('iot:info')
debug.log = console.log.bind(console);


// pack all assets
async function packAssets(assets) {
  const asyncJobs = [];

  for (const op of assets) {
    let txt;

    if (!op.tar) { op.tar = op.src; }

    switch (op.m) {
      case 'c': // sync copy
        shell.cp(op.src, distFolder + '/' + op.tar);
        break;

      case 'm': // async minify html
        const p1 = new Promise(res => {
          txt = shell.cat(op.src).stdout;

          HTMLMinifier.minify(txt, {
            collapseWhitespace: true,
            removeComments: true,
            removeTagWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            verbose: true,
            quoteCharacter: "\'"
          }).then(txt => {
            shell.ShellString(txt).to(distFolder + '/' + op.tar);
            res();
          });
        });
        asyncJobs.push(p1);
        break;

      case 'js': // async minify javascript
        const p2 = new Promise(res => {
          txt = shell.cat(op.src).stdout;

          JSMinifier.minify(txt, {
            compress: { drop_console: true, drop_debugger: true },
            mangle: true,
            output: { indent_level: 0, beautify: false }
          }).then(out => {
            shell.ShellString(out.code).to(distFolder + '/' + op.tar);
            res();
          });
        });
        asyncJobs.push(p2);
        // res();
        break;

      case 'json': // minify json
        txt = shell.cat(op.src).stdout;
        txt = JSON.stringify(JSON.parse(txt), null, 0);
        shell.ShellString(txt).to(distFolder + '/' + op.tar);
        break;

      case 'css': // sync minify css
        txt = sass.compile(op.src, {
          style: 'compressed',
          sourceMap: false
        }).css;
        shell.ShellString(txt).to(distFolder + '/' + op.tar);
        break;

      case 'xml': // sync minify xml
        txt = shell.cat(op.src).stdout;
        txt = txt.replace(/([\>])\s+/g, '$1');
        shell.ShellString(txt).to(distFolder + '/' + op.tar);
        break;

      default:
        break;
    }
  };

  return (Promise.all(asyncJobs));
};


logInfo(`Starting...`);


// array with files that get copied as they are
const assets = [
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
  { m: 'js', src: 'micro.js' }
];


// create fresh dist folders
shell.rm('-rf', distFolder);
shell.mkdir(distFolder);
shell.mkdir(distFolder + '/i');

packAssets(assets).then(() => {
  logInfo(`Files created.`);

  let listText =
    shell.cat('oldlist.txt').stdout +
    shell.ls('-R', distFolder).grep(/^.*\..*$/).stdout;
  shell.ShellString(listText).to(distFolder + '/list.txt');

  logInfo(`list.txt file written.`);
});
