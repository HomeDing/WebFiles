#!/usr/bin/env node

// rm-folder.js <folder>...

// This helper script removes the passed folder using nodejs

import yargs from 'yargs';
import console from 'node:console';

import { rm } from 'node:fs/promises';

const options = yargs(process.argv.slice(2))
  .usage('Usage: rm-folder [-v] <folder-names...>')
  .example('rm-folder -v dist dist-mini', 'remove dist and dist-mini folder and output verbose logging')
  .option('v', { alias: 'verbose', describe: 'Verbose logging', type: 'boolean', demandOption: false, default: false })
  .alias('help', 'h')
  .demandCommand(1)
  .argv;

const verbose = options.verbose;

if (verbose) {
  console.log("rm-folder starting...")
  console.log("argv:", process.argv.join(' '))
}

for (const p of options._) {
  if (verbose) {
    console.log(`removing ${p}...`)
  }

  try {
    await rm(p, { recursive: true, force: true });
    console.log(`${p} deleted successfully`);
  } catch (err) {
    console.error(`Error deleting ${p}:`, err);
  }
} // for

if (verbose) {
  console.log("rm-folder done.")
}
