// CJS wrapper to use shelljs inside ES Modules
// exports the shell object as default.

/* eslint-disable @typescript-eslint/no-var-requires */
const shell = require('shelljs');

module.exports = shell;
