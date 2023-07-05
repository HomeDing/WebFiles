#!/usr/bin/env node

// packminimal.js
// copy all files for the minimal web server into the mindist folder
// ready to be published on http://homeding.github.io/vmxx 

// ===== Packages used =====

import yargs from 'yargs';
import debug from 'debug';

import sass from 'sass';
import * as HTMLMinifier from 'html-minifier-terser';
import * as JSMinifier from 'terser';

import shell from 'shelljs'

const distFolder = "dist-mini";

// ===== Command line support =====
console.log('HomeDing: Packing dist-mini Folder');
const options = yargs(process.argv.slice(2))
  .usage('Usage: $0')
  .option('v', { alias: 'verbose', describe: 'Verbose logging', type: 'boolean', demandOption: false, default: false })
  .argv;

debug.enable(options.verbose ? '*' : '*:info');

// ===== initializing modules =====

const logInfo = debug('iot:info');
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
        asyncJobs.push(new Promise(res => {
          txt = shell.cat(op.src).stdout;

          HTMLMinifier.minify(txt, {
            collapseWhitespace: true,
            removeComments: true,
            removeTagWhitespace: true,
            minifyCSS: true,
            minifyJS: true,
            verbose: true,
            quoteCharacter: "'"
          }).then(txt => {
            shell.ShellString(txt).to(distFolder + '/' + op.tar);
            res();
          });
        }));
        break;

      case 'js': // async minify javascript
        asyncJobs.push(new Promise(res => {
          txt = shell.cat(op.src).stdout;

          JSMinifier.minify(txt, {
            compress: { drop_console: true, drop_debugger: true },
            mangle: true,
            output: { indent_level: 0, beautify: false }
          }).then(out => {
            shell.ShellString(out.code).to(distFolder + '/' + op.tar);
            res();
          });
        }));
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
        txt = txt.replace(/([>])\s+/g, '$1');
        shell.ShellString(txt).to(distFolder + '/' + op.tar);
        break;

      default:
        break;
    }
  }
  return (Promise.all(asyncJobs));
}


logInfo(`Starting...`);


// array with files that get copied as they are
const assets = [
  { m: 'xml', src: 'browserconfig.xml' },
  { m: 'json', src: 'site.min.webmanifest', tar: 'site.webmanifest'},
  { m: 'xml', src: 'favicon.svg' },
  // { m: 'xml', src: 'icons-mini.svg', tar:'icons.svg'},
  { m: 'css', src: 'iotstyle.scss', tar: 'iotstyle.css' },
  { m: 'js', src: 'micro-mini.js', tar: 'micro.js' },
  { m: 'm', src: 'ding.htm' },
  { m: 'm', src: 'microide.htm' },
  { m: 'm', src: 'updateicons.min.htm', tar: 'updateicons.htm' }
];


// create fresh dist folders
shell.rm('-rf', distFolder);
shell.mkdir(distFolder);

packAssets(assets).then(() => {
  logInfo(`Files created.`);

  let listText =
    shell.ls('-R', distFolder).grep(/^.*\..*$/).stdout;
  shell.ShellString(listText).to(distFolder + '/list.txt');

  logInfo(`list.txt file written.`);
});
