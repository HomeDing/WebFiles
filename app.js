// create and start server

const { createExpressionWithTypeArguments } = require('typescript');
const server = require('./server/server');

server.setPort(3123);
server.start();
