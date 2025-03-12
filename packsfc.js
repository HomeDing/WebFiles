#!/usr/bin/env node

// packsfc.js
// copy all files for the full featured web server into the dist folder
// ready to be published on http://homeding.github.io/vxx 

// ===== Packages used =====

import { readFile, writeFile } from 'node:fs/promises';
import console from 'node:console';

import yargs from 'yargs';

import * as HTMLMinifier from 'html-minifier-terser';

const sfcFolder = "sfc";
const sfcExt = ".vue";
const outFile = sfcFolder + "\\bundle" + sfcExt;

// ===== Command line support =====

const options = yargs(process.argv.slice(2))
  .usage('Usage: $0 [options] <sfc-names> ...')
  .option('v', { alias: 'verbose', describe: 'Verbose logging', type: 'boolean', demandOption: false, default: false })
  .option('p', { alias: 'pack', describe: 'pack resulting file', type: 'boolean', demandOption: false, default: true })
  .demandCommand(1)
  .argv;

// ===== initializing modules =====

// wrap component
async function wrapSFC(sfcName, pack = false) {
  let txt;
  console.log(`reading ${sfcName} ...`);

  txt = await readFile(sfcFolder + '/' + sfcName + sfcExt, 'utf8')
  // console.log(txt);

  if (pack) {
    txt = await HTMLMinifier.minify(txt, {
      collapseWhitespace: true,
      removeComments: true,
      removeTagWhitespace: true,
      minifyCSS: true,
      minifyJS: true,
      verbose: true,
      quoteCharacter: "'"
    });
  }
  txt = `<sfc tag='${sfcName}'>\n${txt}\n</sfc>\n`;

  return (txt);
}

console.log(`Start bundling SFCs...`);

let txt = '';

for (const c of options._) {
  txt += await wrapSFC(c, options.pack);
}

console.log(`writing ${outFile} ...`);
await writeFile(outFile, txt, 'utf-8');

if (options.verbose) {
  console.log(txt);
}


console.log(`done.`);
