/** @namespace */
var io	= io || {};

io._global	= {};

// TODO rename this
// Client = socketClient
// Server = socketListener
// Bound  = socketServer

io._global.currentClient	= null;
io._global.currentServer	= null;
io._global.currentBound		= null;
