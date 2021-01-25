// Logging of this server implementation
// this is now using the debug library but can be changed here in a central war.

// rules:
// do not use console.log or console.error directly
// use trace() for quick debugging and verifying code behavior - never check in code with code using trace enabled.
// keep trace() output in comments when checking in.

// logging setup
import debug from 'debug';
const logServer = debug('hd');

export default class Logger {
  public static trace = logServer.extend('trace');
  public static info = logServer.extend('info');
  public static error = logServer.extend('error');

  public static enable(options: string) {
    debug.enable(options);
  }
}

Logger.trace.log = console.log.bind(console);
Logger.info.log = console.log.bind(console);
Logger.error.log = console.error.bind(console);
