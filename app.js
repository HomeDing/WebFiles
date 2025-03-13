#!node
// app.js
// create and start server from command line
//

/* eslint-disable @typescript-eslint/no-var-requires */

// const { createExpressionWithTypeArguments } = require('typescript');
import { HomeDingServer } from './dist-server/HomeDingServer.js';
import Logger from './dist-server/Logger.js';
import yargs from 'yargs';

console.log("HomeDing Portal Server");

const appOptions = yargs(process.argv.slice(2))
  .usage('Usage: $0 -c <case name>')
  .option('c', { alias: 'case', describe: 'Simulate case', type: 'string', demandOption: false, default: null })
  .option('m', { alias: 'monitor', describe: 'monitor the requests', type: 'boolean', demandOption: false, default: false })
  .option('p', { alias: 'port', describe: 'webserver port', type: 'number', demandOption: false, default: 3123 })
  .option('s', { alias: 'secure', describe: 'Use https', type: 'boolean', demandOption: false, default: false })
  .option('d', { alias: 'discovery', describe: 'discover all local HomeDing devices using mDNS', type: 'boolean', demandOption: false, default: false })
  .option('v', { alias: 'verbose', describe: 'Verbose logging', type: 'boolean', demandOption: false, default: false })
  .argv;

Logger.enable('hd:error,hd:info');

if (appOptions.verbose) {
  Logger.enable('*');
  Logger.info('This processor architecture is ' + process.arch);
  Logger.info('This platform is ' + process.platform);
  Logger.info('cwd: ', process.cwd());
  Logger.info('arguments: ', appOptions);
  Logger.info('file', import.meta.url);
}

const s = new HomeDingServer();
// server.setPort(3123);
s.start({
  case: appOptions.case,
  discovery: appOptions.discovery,
  monitor: appOptions.monitor,
  port: 3123,
  secure: appOptions.secure
});
